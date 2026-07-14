#!/usr/bin/env node
// Stamp the shared Lidless owl logo for every repo in the fleet roster.
//
// The mark is the org's GitHub logo: the watercolor great horned owl
// (`marks/lidless-owl.png`, the circular-cropped org avatar). Lidless is one
// owl, reused everywhere like a favicon, so this is a fan-out copy, not a
// per-tool designer: it writes an identical `dist/<slug>-circle.png` for each
// roster entry. Repos are told apart by the mono name label beside the mark,
// never by a different mark.
//
// Usage:
//   node marks/build-marks.mjs            # write dist/ + manifest.json
//   node marks/build-marks.mjs --check    # fail if dist/ is stale, write nothing
//
// No dependencies. Deterministic: same inputs -> byte-identical output.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOGO = join(HERE, "lidless-owl.png");
const ROSTER = join(HERE, "fleet.json");
const DIST = join(HERE, "dist");

function loadRoster() {
  const roster = JSON.parse(readFileSync(ROSTER, "utf8"));
  const slugs = roster.categories.flatMap((c) => c.repos);
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) throw new Error(`fleet.json: duplicate repo(s) [${[...new Set(dupes)].join(", ")}]`);
  return slugs;
}

function build() {
  if (!existsSync(LOGO)) throw new Error("marks/lidless-owl.png is missing (the circular org logo).");
  const logo = readFileSync(LOGO); // Buffer
  const slugs = loadRoster();
  const files = {}; // name -> Buffer
  for (const slug of slugs) files[`${slug}-circle.png`] = logo;
  const manifest = JSON.stringify(
    { count: slugs.length, source: "lidless-owl.png", marks: slugs.map((s) => `${s}-circle.png`) },
    null,
    2,
  ) + "\n";
  return { files, manifest };
}

function writeDist({ files, manifest }) {
  if (existsSync(DIST)) rmSync(DIST, { recursive: true });
  mkdirSync(DIST, { recursive: true });
  for (const [name, buf] of Object.entries(files)) writeFileSync(join(DIST, name), buf);
  writeFileSync(join(DIST, "manifest.json"), manifest);
}

function checkDist({ files, manifest }) {
  if (!existsSync(DIST)) throw new Error("dist/ is missing. Run: npm run marks");
  const onDisk = new Set(readdirSync(DIST));
  const expected = new Set([...Object.keys(files), "manifest.json"]);
  for (const name of expected) {
    if (!onDisk.has(name)) throw new Error(`dist/ is stale: missing ${name}. Run: npm run marks`);
    const want = name === "manifest.json" ? Buffer.from(manifest) : files[name];
    if (!readFileSync(join(DIST, name)).equals(want)) {
      throw new Error(`dist/ is stale: ${name} differs. Run: npm run marks`);
    }
  }
  for (const name of onDisk) {
    if (!expected.has(name)) throw new Error(`dist/ has orphan ${name}. Run: npm run marks`);
  }
}

const built = build();
if (process.argv.includes("--check")) {
  checkDist(built);
  console.log(`marks: dist/ is current (${built.manifest.match(/"count": (\d+)/)[1]} marks)`);
} else {
  writeDist(built);
  console.log(`marks: wrote ${Object.keys(built.files).length} owl marks to marks/dist/`);
}

export { build, loadRoster, LOGO };
