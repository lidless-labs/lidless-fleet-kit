// Read each Lidless tool's authoritative version (latest GitHub release) and write
// them into the hub site's src/lib/tools.ts as an auto-generated VERSIONS map, so the
// homepage and tool pages can show a current version badge without a hand-driven update.
//
// Lidless is a single hub repo, so there is exactly one target site: lidless-site.
// The map is written between two marker comments and is fully idempotent: a no-op run
// rewrites identical bytes (and the runner sees no git change). SITE.version in
// src/lib/site.ts is left alone (it is the hub's own 'Wave 1' marketing label, manual).
//
// Lookup contract: releases/latest HTTP 404 is not enough for no-release (GitHub also
// 404s missing/private repos). After a release 404, GET repos/{owner}/{repo} must
// succeed before classifying no-release. Auth, rate-limit, transport, malformed, 5xx,
// and repo probe failures abort the sync nonzero so a degraded map is never written.
//
// Usage: node bin/sync-versions.mjs        (apply)
//        node bin/sync-versions.mjs --dry   (report only, write nothing)
import {
  readFileSync as fsReadFileSync,
  writeFileSync as fsWriteFileSync,
  existsSync as fsExistsSync,
} from 'node:fs';
import { execFileSync as fsExecFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const kit = join(here, '..');
const repos = join(kit, '..');

export const BEGIN =
  '// --- BEGIN AUTO-GENERATED VERSIONS (managed by lidless-fleet-kit/bin/sync-versions.mjs) ---';
export const END = '// --- END AUTO-GENERATED VERSIONS ---';

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lookupError(repo, kind, detail) {
  const err = new Error(`gh-release lookup failed for ${repo}: ${kind}${detail ? ` (${detail})` : ''}`);
  err.kind = kind;
  err.repo = repo;
  return err;
}

/** Extract an HTTP status from gh api stdout/stderr when present. */
export function httpStatusFromGhFailure(err) {
  const stdout = String(err?.stdout ?? '');
  const stderr = String(err?.stderr ?? '');
  const fromStderr = stderr.match(/\bHTTP\s+(\d{3})\b/i);
  if (fromStderr) return Number(fromStderr[1]);
  try {
    const body = JSON.parse(stdout);
    const status = body?.status ?? body?.Status;
    if (status != null && String(status).trim() !== '') return Number(status);
  } catch {
    // ignore non-JSON stdout
  }
  const fromStdout = stdout.match(/\bHTTP\s+(\d{3})\b/i);
  if (fromStdout) return Number(fromStdout[1]);
  return null;
}

/**
 * Classify a gh api process failure. HTTP 404 is `not-found` (ambiguous until a
 * successful repo probe confirms the repository exists).
 */
export function classifyGhLookupFailure(err) {
  if (err?.code === 'ENOENT' || err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT') {
    return 'transport';
  }
  const http = httpStatusFromGhFailure(err);
  if (http === 404) return 'not-found';
  if (http === 401 || http === 403) return 'auth';
  if (http === 429) return 'rate-limit';
  if (http != null && http >= 500 && http <= 599) return 'github-5xx';
  if (http != null) return 'lookup-failed';
  if (err?.status == null && err?.code) return 'transport';
  return 'lookup-failed';
}

function ghApi(repo, pathSuffix, { execFileSync = fsExecFileSync, jq } = {}) {
  const endpoint = pathSuffix ? `repos/${repo}/${pathSuffix}` : `repos/${repo}`;
  const args = ['api', endpoint];
  if (jq) args.push('-q', jq);
  return execFileSync('gh', args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/**
 * Confirm the repository is reachable. Must succeed before a releases/latest 404
 * may be treated as authoritative no-release.
 */
export function assertRepoAccessible(repo, { execFileSync = fsExecFileSync } = {}) {
  let out;
  try {
    out = ghApi(repo, '', { execFileSync, jq: '.full_name' });
  } catch (err) {
    if (err?.kind) throw err;
    const kind = classifyGhLookupFailure(err);
    if (kind === 'not-found') {
      throw lookupError(repo, 'repo-not-found', err?.message?.split('\n')[0]);
    }
    throw lookupError(repo, kind, err?.message?.split('\n')[0]);
  }
  const name = String(out ?? '').trim();
  if (!name || name === 'null') {
    throw lookupError(repo, 'malformed-response', 'empty repo full_name');
  }
}

/**
 * Latest release tag for a repo, or null when GitHub authoritatively reports no
 * release: releases/latest HTTP 404 and a successful GET repos/{owner}/{repo}.
 * Non-authoritative failures throw with err.kind set.
 */
export function ghLatestTag(repo, { execFileSync = fsExecFileSync } = {}) {
  let out;
  try {
    out = ghApi(repo, 'releases/latest', { execFileSync, jq: '.tag_name' });
  } catch (err) {
    if (err?.kind) throw err;
    const kind = classifyGhLookupFailure(err);
    if (kind !== 'not-found') {
      throw lookupError(repo, kind, err?.message?.split('\n')[0]);
    }
    // Ambiguous 404: prove the repo exists before classifying no-release.
    assertRepoAccessible(repo, { execFileSync });
    return null;
  }
  const tag = String(out ?? '').trim();
  if (!tag || tag === 'null') {
    throw lookupError(repo, 'malformed-response', 'empty tag_name');
  }
  return tag;
}

export function desiredVersion(cfg, opts) {
  const v = cfg.version || {};
  if (v.source === 'gh-release') {
    const tag = ghLatestTag(cfg.repo, opts);
    return tag ? tag.replace(/^v/, '') : null;
  }
  return null; // manual
}

/**
 * Resolve every tool's version. Throws on the first non-authoritative lookup failure
 * so callers never see a degraded partial map.
 */
export function resolveVersions(tools, opts = {}) {
  const versions = {};
  const summary = [];
  for (const [slug, cfg] of Object.entries(tools)) {
    const want = desiredVersion(cfg, opts);
    if (want == null) {
      summary.push({
        slug,
        status: cfg.version?.source === 'manual' ? 'manual' : 'no-release',
        repo: cfg.repo,
      });
      continue;
    }
    versions[slug] = want;
    summary.push({ slug, status: 'resolved', version: want, repo: cfg.repo });
  }
  return { versions, summary };
}

export function renderVersionsBlock(versions) {
  const entries = Object.keys(versions)
    .sort()
    .map((slug) => `  '${slug}': '${versions[slug]}',`)
    .join('\n');
  return (
    `${BEGIN}\n` +
    `/** Latest published version per tool slug. Keys without a release are omitted. */\n` +
    `export const VERSIONS: Record<string, string> = {\n` +
    `${entries}\n` +
    `};\n` +
    `${END}`
  );
}

export function spliceVersionsBlock(srcTs, block) {
  const blockRe = new RegExp(`${escapeRe(BEGIN)}[\\s\\S]*?${escapeRe(END)}`);
  if (blockRe.test(srcTs)) return srcTs.replace(blockRe, block);
  return srcTs.replace(/\s*$/, '\n') + '\n' + block + '\n';
}

/**
 * Resolve versions and optionally write the VERSIONS block.
 * On lookup failure, throws before any write.
 */
export function syncVersions({
  tools,
  toolsTsPath,
  dry = false,
  site = 'lidless-site',
  execFileSync = fsExecFileSync,
  readFileSync = fsReadFileSync,
  writeFileSync = fsWriteFileSync,
  existsSync = fsExistsSync,
} = {}) {
  const { versions, summary } = resolveVersions(tools, { execFileSync });

  if (!existsSync(toolsTsPath)) {
    return {
      dry,
      site,
      error: 'tools.ts-not-found',
      versionsBlock: 'missing',
      wrote: false,
      versions,
      summary,
    };
  }

  const srcTs = readFileSync(toolsTsPath, 'utf-8');
  const block = renderVersionsBlock(versions);
  const next = spliceVersionsBlock(srcTs, block);
  const blockChanged = next !== srcTs;
  let wrote = false;
  if (blockChanged && !dry) {
    writeFileSync(toolsTsPath, next);
    wrote = true;
  }

  return {
    dry,
    site,
    versionsBlock: blockChanged ? (dry ? 'would-update' : 'updated') : 'unchanged',
    wrote,
    versions,
    summary,
  };
}

function main() {
  const dry = process.argv.includes('--dry');
  const config = JSON.parse(fsReadFileSync(join(kit, 'sites.config.json'), 'utf-8'));
  const SITE_SLUG = config.site || 'lidless-site';
  const TOOLS = config.tools || {};
  const toolsTs = join(repos, SITE_SLUG, 'src', 'lib', 'tools.ts');

  try {
    const result = syncVersions({
      tools: TOOLS,
      toolsTsPath: toolsTs,
      dry,
      site: SITE_SLUG,
    });
    console.log(JSON.stringify(result, null, 2));
    if (result.error === 'tools.ts-not-found') process.exit(0);
  } catch (err) {
    console.error(
      JSON.stringify(
        {
          dry,
          site: SITE_SLUG,
          error: 'gh-release-lookup-failed',
          kind: err.kind || 'lookup-failed',
          repo: err.repo,
          message: err.message,
        },
        null,
        2
      )
    );
    process.exit(1);
  }
}

const isMain =
  process.argv[1] != null && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);
if (isMain) main();
