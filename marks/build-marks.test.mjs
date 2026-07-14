import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { build, loadRoster, LOGO } from "./build-marks.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const slugs = loadRoster();

test("the owl logo source exists and is a PNG", () => {
  assert.ok(existsSync(LOGO), "marks/lidless-owl.png must exist");
  const sig = readFileSync(LOGO).subarray(0, 8);
  assert.deepEqual([...sig], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "not a PNG");
});

test("build emits exactly one mark per roster entry", () => {
  const { files } = build();
  assert.equal(Object.keys(files).length, slugs.length);
  for (const slug of slugs) assert.ok(files[`${slug}-circle.png`], `missing ${slug}-circle.png`);
});

test("every emitted mark is the identical owl logo (one owl, fleet-wide)", () => {
  const { files } = build();
  const logo = readFileSync(LOGO);
  for (const [name, buf] of Object.entries(files)) {
    assert.ok(buf.equals(logo), `${name} is not the canonical logo`);
  }
});

test("marks are named <slug>-circle.png, matching the fleet convention", () => {
  const { files } = build();
  for (const name of Object.keys(files)) assert.match(name, /^[a-z0-9-]+-circle\.png$/);
});

test("roster has no duplicate repos", () => {
  assert.equal(new Set(slugs).size, slugs.length);
});
