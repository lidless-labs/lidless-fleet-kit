// Read each Lidless tool's authoritative version (latest GitHub release) and write
// them into the hub site's src/lib/tools.ts as an auto-generated VERSIONS map, so the
// homepage and tool pages can show a current version badge without a hand-driven update.
//
// Lidless is a single hub repo, so there is exactly one target site: lidless-site.
// The map is written between two marker comments and is fully idempotent: a no-op run
// rewrites identical bytes (and the runner sees no git change). SITE.version in
// src/lib/site.ts is left alone (it is the hub's own 'Wave 1' marketing label, manual).
//
// Usage: node bin/sync-versions.mjs        (apply)
//        node bin/sync-versions.mjs --dry   (report only, write nothing)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const kit = join(here, '..');
const repos = join(kit, '..');
const dry = process.argv.includes('--dry');
const config = JSON.parse(readFileSync(join(kit, 'sites.config.json'), 'utf-8'));

const SITE_SLUG = config.site || 'lidless-site';
const TOOLS = config.tools || {};

const BEGIN = '// --- BEGIN AUTO-GENERATED VERSIONS (managed by lidless-fleet-kit/bin/sync-versions.mjs) ---';
const END = '// --- END AUTO-GENERATED VERSIONS ---';

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ghLatestTag(repo) {
  try {
    const out = execFileSync('gh', ['api', `repos/${repo}/releases/latest`, '-q', '.tag_name'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null; // no releases yet, or no access
  }
}

function desiredVersion(cfg) {
  const v = cfg.version || {};
  if (v.source === 'gh-release') {
    const tag = ghLatestTag(cfg.repo);
    return tag ? tag.replace(/^v/, '') : null;
  }
  return null; // manual
}

// 1. resolve every tool's version
const versions = {};
const summary = [];
for (const [slug, cfg] of Object.entries(TOOLS)) {
  const want = desiredVersion(cfg);
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

// 2. build the VERSIONS map block and splice it into tools.ts
const toolsTs = join(repos, SITE_SLUG, 'src', 'lib', 'tools.ts');
if (!existsSync(toolsTs)) {
  console.log(JSON.stringify({ dry, site: SITE_SLUG, error: 'tools.ts-not-found', summary }, null, 2));
  process.exit(0);
}

const srcTs = readFileSync(toolsTs, 'utf-8');

const entries = Object.keys(versions)
  .sort()
  .map((slug) => `  '${slug}': '${versions[slug]}',`)
  .join('\n');

const block =
  `${BEGIN}\n` +
  `/** Latest published version per tool slug. Keys without a release are omitted. */\n` +
  `export const VERSIONS: Record<string, string> = {\n` +
  `${entries}\n` +
  `};\n` +
  `${END}`;

let next;
const blockRe = new RegExp(`${escapeRe(BEGIN)}[\\s\\S]*?${escapeRe(END)}`);
if (blockRe.test(srcTs)) {
  next = srcTs.replace(blockRe, block);
} else {
  // append at end of file (after a single trailing newline)
  next = srcTs.replace(/\s*$/, '\n') + '\n' + block + '\n';
}

const blockChanged = next !== srcTs;
let wrote = false;
if (blockChanged && !dry) {
  writeFileSync(toolsTs, next);
  wrote = true;
}

console.log(
  JSON.stringify(
    {
      dry,
      site: SITE_SLUG,
      versionsBlock: blockChanged ? (dry ? 'would-update' : 'updated') : 'unchanged',
      wrote,
      versions,
      summary,
    },
    null,
    2
  )
);
