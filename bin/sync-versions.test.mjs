import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ghLatestTag,
  resolveVersions,
  syncVersions,
  BEGIN,
  END,
} from './sync-versions.mjs';

function ghError({ status = 1, code, stdout = '', stderr = '' } = {}) {
  const err = new Error('Command failed: gh api');
  err.status = status;
  if (code !== undefined) err.code = code;
  err.stdout = stdout;
  err.stderr = stderr;
  return err;
}

function notFound(docUrl) {
  return ghError({
    stdout: JSON.stringify({
      message: 'Not Found',
      documentation_url: docUrl,
      status: '404',
    }),
    stderr: 'gh: Not Found (HTTP 404)\n',
  });
}

function release404() {
  return notFound('https://docs.github.com/rest/releases/releases#get-the-latest-release');
}

function repo404() {
  return notFound('https://docs.github.com/rest/repos/repos#get-a-repository');
}

/**
 * Injected process stub for `gh api`.
 * Keys are full API paths after `repos/` (e.g. `org/a/releases/latest` or `org/a`).
 */
function stubExec(byEndpoint) {
  return (cmd, args) => {
    assert.equal(cmd, 'gh');
    assert.equal(args[0], 'api');
    const endpoint = args[1];
    assert.match(endpoint, /^repos\//);
    const key = endpoint.slice('repos/'.length);
    const entry = byEndpoint[key];
    assert.ok(entry !== undefined, `unexpected gh api endpoint: ${endpoint}`);
    if (entry instanceof Error) throw entry;
    return entry;
  };
}

function priorToolsTs() {
  return `${BEGIN}
/** Latest published version per tool slug. Keys without a release are omitted. */
export const VERSIONS: Record<string, string> = {
  'alpha': '1.0.0',
  'beta': '2.0.0',
};
${END}
`;
}

function writeToolsFixture() {
  const dir = mkdtempSync(join(tmpdir(), 'sync-versions-'));
  const lib = join(dir, 'src', 'lib');
  mkdirSync(lib, { recursive: true });
  const toolsTs = join(lib, 'tools.ts');
  writeFileSync(toolsTs, priorToolsTs());
  return toolsTs;
}

test('existing repo + release 404 => authoritative no-release (null)', () => {
  const execFileSync = stubExec({
    'owner/empty/releases/latest': release404(),
    'owner/empty': 'owner/empty\n',
  });
  assert.equal(ghLatestTag('owner/empty', { execFileSync }), null);
});

test('release 404 + repo 404 => abort (not no-release)', () => {
  const execFileSync = stubExec({
    'owner/missing/releases/latest': release404(),
    'owner/missing': repo404(),
  });
  assert.throws(() => ghLatestTag('owner/missing', { execFileSync }), (err) => {
    assert.equal(err.kind, 'repo-not-found');
    assert.match(err.message, /owner\/missing/);
    return true;
  });
});

test('release 404 + repo auth/rate/5xx => abort', () => {
  const cases = [
    {
      http: 401,
      kind: 'auth',
      stdout: JSON.stringify({ message: 'Bad credentials', status: '401' }),
      stderr: 'gh: Bad credentials (HTTP 401)\n',
    },
    {
      http: 403,
      kind: 'auth',
      stdout: JSON.stringify({ message: 'Forbidden', status: '403' }),
      stderr: 'gh: Forbidden (HTTP 403)\n',
    },
    {
      http: 429,
      kind: 'rate-limit',
      stdout: JSON.stringify({ message: 'API rate limit exceeded', status: '429' }),
      stderr: 'gh: API rate limit exceeded (HTTP 429)\n',
    },
    {
      http: 502,
      kind: 'github-5xx',
      stdout: JSON.stringify({ message: 'Server Error', status: '502' }),
      stderr: 'gh: Server Error (HTTP 502)\n',
    },
  ];
  for (const c of cases) {
    const execFileSync = stubExec({
      'owner/probe/releases/latest': release404(),
      'owner/probe': ghError({ stdout: c.stdout, stderr: c.stderr }),
    });
    assert.throws(() => ghLatestTag('owner/probe', { execFileSync }), (err) => {
      assert.equal(err.kind, c.kind, `expected ${c.kind} for HTTP ${c.http}`);
      return true;
    });
  }
});

test('non-404 release lookup failures abort', () => {
  const execFileSync = stubExec({
    'owner/limited/releases/latest': ghError({
      stdout: JSON.stringify({ message: 'API rate limit exceeded', status: '429' }),
      stderr: 'gh: API rate limit exceeded (HTTP 429)\n',
    }),
  });
  assert.throws(() => ghLatestTag('owner/limited', { execFileSync }), (err) => {
    assert.equal(err.kind, 'rate-limit');
    return true;
  });
});

test('successful tag parsing stays fail-safe on empty tag_name', () => {
  const execFileSync = stubExec({
    'owner/weird/releases/latest': '   \n',
  });
  assert.throws(() => ghLatestTag('owner/weird', { execFileSync }), (err) => {
    assert.equal(err.kind, 'malformed-response');
    return true;
  });
});

test('mixed set: one failure => no write', () => {
  const toolsTs = writeToolsFixture();
  const prior = readFileSync(toolsTs, 'utf-8');
  const tools = {
    alpha: { repo: 'org/alpha', version: { source: 'gh-release' } },
    beta: { repo: 'org/beta', version: { source: 'gh-release' } },
  };
  const execFileSync = stubExec({
    'org/alpha/releases/latest': 'v1.1.0\n',
    'org/beta/releases/latest': release404(),
    'org/beta': repo404(),
  });

  assert.throws(
    () =>
      syncVersions({
        tools,
        toolsTsPath: toolsTs,
        dry: false,
        execFileSync,
      }),
    (err) => {
      assert.equal(err.kind, 'repo-not-found');
      return true;
    }
  );
  assert.equal(readFileSync(toolsTs, 'utf-8'), prior);
});

test('normal releases still render into VERSIONS', () => {
  const toolsTs = writeToolsFixture();
  const tools = {
    alpha: { repo: 'org/alpha', version: { source: 'gh-release' } },
    beta: { repo: 'org/beta', version: { source: 'gh-release' } },
    watch: { repo: 'org/watch', version: { source: 'manual' } },
  };
  const execFileSync = stubExec({
    'org/alpha/releases/latest': 'v1.2.3\n',
    'org/beta/releases/latest': 'v4.5.6\n',
  });

  const result = syncVersions({
    tools,
    toolsTsPath: toolsTs,
    dry: false,
    execFileSync,
  });

  assert.equal(result.wrote, true);
  assert.deepEqual(result.versions, { alpha: '1.2.3', beta: '4.5.6' });
  const written = readFileSync(toolsTs, 'utf-8');
  assert.match(written, /'alpha': '1\.2\.3'/);
  assert.match(written, /'beta': '4\.5\.6'/);
  assert.ok(!written.includes("'watch'"));
  assert.ok(written.includes(BEGIN));
  assert.ok(written.includes(END));
});

test('mixed set: confirmed no-release omits only that tool; others resolve', () => {
  const tools = {
    alpha: { repo: 'org/alpha', version: { source: 'gh-release' } },
    beta: { repo: 'org/beta', version: { source: 'gh-release' } },
    watch: { repo: 'org/watch', version: { source: 'manual' } },
  };
  const execFileSync = stubExec({
    'org/alpha/releases/latest': 'v1.2.3\n',
    'org/beta/releases/latest': release404(),
    'org/beta': 'org/beta\n',
  });
  const { versions, summary } = resolveVersions(tools, { execFileSync });
  assert.deepEqual(versions, { alpha: '1.2.3' });
  assert.equal(summary.find((s) => s.slug === 'beta')?.status, 'no-release');
  assert.equal(summary.find((s) => s.slug === 'watch')?.status, 'manual');
  assert.equal(summary.find((s) => s.slug === 'alpha')?.status, 'resolved');
});
