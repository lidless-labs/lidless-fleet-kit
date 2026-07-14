#!/usr/bin/env node
// Stamp the shared Lidless "eye" mark for every repo in the fleet roster.
//
// Lidless is deliberately one owl, one accent color (see DESIGN.md). Unlike a
// fleet of per-tool logos, every repo carries the SAME mark: it is the fleet
// identity token, the way a favicon is. Per-repo distinction is the mono name
// label next to it, never a recolor. So this generator is a fan-out stamp, not
// a per-tool designer: it copies marks/mark.svg to dist/<slug>-circle.svg for
// each roster entry (with a per-repo <title>/aria-label for screen readers) and
// enforces the palette so a stray color can never slip into the fleet mark.
//
// Usage:
//   node marks/build-marks.mjs            # write dist/ + manifest.json
//   node marks/build-marks.mjs --check    # fail if dist/ is stale or off-palette, write nothing
//
// No dependencies. Deterministic: same inputs -> byte-identical output.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CANONICAL = join(HERE, "mark.svg");
const ROSTER = join(HERE, "fleet.json");
const DIST = join(HERE, "dist");

// The only colors any Lidless mark may contain: the dark grounds, the hairlines,
// the single signal-blue accent, and the white glint. Everything is lower-cased
// before the check. Keep in lockstep with DESIGN.md tokens.
const PALETTE = new Set([
  "#0a0a0c", // favicon ground
  "#0a0e15", // page ground
  "#0d1119", // panel
  "#111824", // panel-2
  "#1a2230", // hairline
  "#232c3a", // hairline-strong
  "#1d2733", // owl slate-navy fill
  "#1f7fb0", // accent-dim
  "#38bdf8", // accent (the only chroma)
  "#f4f7fa", // white glint
]);

function hexColors(svg) {
  return (svg.match(/#[0-9a-fA-F]{3,8}\b/g) || []).map((c) => c.toLowerCase());
}

function assertPalette(svg, label) {
  const bad = hexColors(svg).filter((c) => !PALETTE.has(c));
  if (bad.length) {
    throw new Error(
      `${label}: off-palette color(s) [${[...new Set(bad)].join(", ")}]. ` +
        `The Lidless mark is one accent (#38bdf8); never recolor per tool.`,
    );
  }
}

function assertShape(svg, label) {
  if (!svg.includes('viewBox="0 0 80 80"')) throw new Error(`${label}: viewBox must be "0 0 80 80"`);
  if (!/width="40"/.test(svg)) throw new Error(`${label}: width must be 40`);
}

// One mark per repo: the canonical SVG with a repo-specific title + aria-label.
function markFor(canonical, slug) {
  return canonical
    .replace(/<title>[^<]*<\/title>/, `<title>${slug}</title>`)
    .replace(/aria-label="[^"]*"/, `aria-label="${slug}, a Lidless Labs tool"`);
}

function loadRoster() {
  const roster = JSON.parse(readFileSync(ROSTER, "utf8"));
  const slugs = roster.categories.flatMap((c) => c.repos);
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) throw new Error(`fleet.json: duplicate repo(s) [${[...new Set(dupes)].join(", ")}]`);
  return slugs;
}

function build() {
  const canonical = readFileSync(CANONICAL, "utf8");
  assertShape(canonical, "mark.svg");
  assertPalette(canonical, "mark.svg");

  const slugs = loadRoster();
  const files = {};
  for (const slug of slugs) {
    const svg = markFor(canonical, slug);
    assertPalette(svg, `${slug}-circle.svg`);
    files[`${slug}-circle.svg`] = svg;
  }
  const manifest = JSON.stringify(
    { count: slugs.length, marks: slugs.map((s) => `${s}-circle.svg`) },
    null,
    2,
  ) + "\n";
  return { files, manifest };
}

function writeDist({ files, manifest }) {
  if (existsSync(DIST)) rmSync(DIST, { recursive: true });
  mkdirSync(DIST, { recursive: true });
  for (const [name, svg] of Object.entries(files)) writeFileSync(join(DIST, name), svg);
  writeFileSync(join(DIST, "manifest.json"), manifest);
}

function checkDist({ files, manifest }) {
  if (!existsSync(DIST)) throw new Error("dist/ is missing. Run: npm run marks");
  const onDisk = new Set(readdirSync(DIST));
  const expected = new Set([...Object.keys(files), "manifest.json"]);
  for (const name of expected) {
    if (!onDisk.has(name)) throw new Error(`dist/ is stale: missing ${name}. Run: npm run marks`);
    const want = name === "manifest.json" ? manifest : files[name];
    if (readFileSync(join(DIST, name), "utf8") !== want) {
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
  console.log(`marks: dist/ is current (${built.manifest.match(/"count": (\d+)/)[1]} marks, on palette)`);
} else {
  writeDist(built);
  console.log(`marks: wrote ${Object.keys(built.files).length} marks to marks/dist/`);
}

export { build, markFor, assertPalette, assertShape, PALETTE };
