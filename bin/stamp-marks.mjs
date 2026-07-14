#!/usr/bin/env node
// Stamp a generated fleet mark into a product repo's working tree.
//
// The marks live in this kit (marks/dist/<slug>-circle.png). Each product repo
// carries its own copy at docs/assets/marks/<slug>-circle.png so its README
// renders without hotlinking across repos (matching the fleet convention). This
// copies the right mark into a repo checkout you already have on disk.
//
// Usage:
//   node bin/stamp-marks.mjs --repo ~/repos/wazuh-mcp --slug wazuh-mcp
//   node bin/stamp-marks.mjs --repo ~/repos/soc-stack            # slug inferred from basename
//
// Run `npm run marks` first so marks/dist/ is current. No dependencies.

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, "..", "marks", "dist");

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const repo = arg("repo");
if (!repo) {
  console.error("usage: node bin/stamp-marks.mjs --repo <path-to-repo> [--slug <slug>]");
  process.exit(2);
}
const slug = arg("slug") || basename(repo.replace(/\/+$/, ""));
const src = join(DIST, `${slug}-circle.png`);
if (!existsSync(src)) {
  console.error(`no mark for "${slug}" in marks/dist/. Is the slug in marks/fleet.json? Run: npm run marks`);
  process.exit(1);
}
const destDir = join(repo, "docs", "assets", "marks");
mkdirSync(destDir, { recursive: true });
const dest = join(destDir, `${slug}-circle.png`);
copyFileSync(src, dest);
console.log(`stamped ${slug}-circle.png -> ${dest}`);
console.log(`add under the banner in that repo's README:`);
console.log(`  <p align="center"><a href="https://lidless.dev"><img src="docs/assets/marks/${slug}-circle.png" width="48" alt="Lidless Labs"></a></p>`);
