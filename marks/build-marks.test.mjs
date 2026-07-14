import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { build, markFor, assertPalette, PALETTE } from "./build-marks.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const roster = JSON.parse(readFileSync(join(HERE, "fleet.json"), "utf8"));
const slugs = roster.categories.flatMap((c) => c.repos);

test("canonical mark.svg is on palette and correctly shaped", () => {
  const svg = readFileSync(join(HERE, "mark.svg"), "utf8");
  assert.doesNotThrow(() => assertPalette(svg, "mark.svg"));
  assert.match(svg, /viewBox="0 0 80 80"/);
  assert.match(svg, /width="40"/);
});

test("build emits exactly one mark per roster entry", () => {
  const { files } = build();
  assert.equal(Object.keys(files).length, slugs.length);
  for (const slug of slugs) assert.ok(files[`${slug}-circle.svg`], `missing ${slug}-circle.svg`);
});

test("every emitted mark is on palette (no per-tool recolor)", () => {
  const { files } = build();
  for (const [name, svg] of Object.entries(files)) {
    assert.doesNotThrow(() => assertPalette(svg, name));
  }
});

test("an off-palette color is rejected", () => {
  const bad = readFileSync(join(HERE, "mark.svg"), "utf8").replace("#38bdf8", "#ff0000");
  assert.throws(() => assertPalette(bad, "tampered"), /off-palette/);
});

test("the mark art uses exactly one chroma: #38bdf8", () => {
  // The brand rule is about the drawn mark, not the allowlist (which also holds
  // the dimmer accent #1f7fb0 for hover states). Scan the owl itself: the only
  // saturated color it paints must be the signal blue.
  const svg = readFileSync(join(HERE, "mark.svg"), "utf8");
  const isChroma = (c) => {
    const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    return max - min > 40 && max > 80; // saturated and bright enough to read as a color
  };
  const chroma = [...new Set((svg.match(/#[0-9a-fA-F]{6}\b/g) || []).map((c) => c.toLowerCase()))].filter(isChroma);
  assert.deepEqual(chroma, ["#38bdf8"]);
});

test("per-repo mark carries the repo title and aria-label", () => {
  const svg = markFor(readFileSync(join(HERE, "mark.svg"), "utf8"), "wazuh-mcp");
  assert.match(svg, /<title>wazuh-mcp<\/title>/);
  assert.match(svg, /aria-label="wazuh-mcp, a Lidless Labs tool"/);
});

test("roster has no duplicate repos", () => {
  assert.equal(new Set(slugs).size, slugs.length);
});
