import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderWorkflowSvg, validateWorkflow } from './render.mjs';

const example = JSON.parse(readFileSync(new URL('./examples/fleet-routine.json', import.meta.url), 'utf-8'));
const docsSource = JSON.parse(readFileSync(new URL('../docs/assets/workflows/lidless-fleet-routine.json', import.meta.url), 'utf-8'));

test('validates a compact workflow source', () => {
  assert.doesNotThrow(() => validateWorkflow(example));
});

test('docs workflow source stays in sync with the renderer example', () => {
  assert.deepEqual(docsSource, example);
});

test('renders a dark-watch SVG with Lidless brand tokens', () => {
  const svg = renderWorkflowSvg(example);
  assert.match(svg, /^<svg /);
  assert.match(svg, /#0a0e15/);
  assert.match(svg, /#38bdf8/);
  assert.match(svg, /LIDLESS · FLEET ROUTINE/);
  assert.match(svg, /npm run fleet/);
  assert.doesNotMatch(svg, /<image\b/);
  assert.doesNotMatch(svg, /clipPath/);
});

test('renders all nodes inside the declared viewBox', () => {
  const svg = renderWorkflowSvg(example);
  const viewBox = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  assert.ok(viewBox, 'missing viewBox');
  const width = Number(viewBox[1]);
  const height = Number(viewBox[2]);
  const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)];
  assert.ok(rects.length >= example.nodes.length, 'expected at least one rect per node');
  for (const rect of rects) {
    const [, x, y, w, h] = rect.map(Number);
    assert.ok(x >= 0, `rect x clipped: ${x}`);
    assert.ok(y >= 0, `rect y clipped: ${y}`);
    assert.ok(x + w <= width, `rect width clipped: ${x + w} > ${width}`);
    assert.ok(y + h <= height, `rect height clipped: ${y + h} > ${height}`);
  }
});

test('renders without trailing whitespace', () => {
  const svg = renderWorkflowSvg(example);
  assert.doesNotMatch(svg, /[ \t]+$/m);
});

test('rejects edges that point at missing nodes', () => {
  assert.throws(
    () => validateWorkflow({ ...example, edges: [{ from: 'missing', to: 'sync' }] }),
    /unknown edge endpoint/,
  );
});
