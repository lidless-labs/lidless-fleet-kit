import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const style = JSON.parse(readFileSync(new URL('./style.json', import.meta.url)));

test('palette carries the exact brand tokens', () => {
  assert.equal(style.palette.ink, '#0a0e15');
  assert.equal(style.palette.cyan, '#38bdf8');
  assert.equal(style.palette.cream, '#f5f2ea');
  assert.equal(style.palette.slateNavy, '#1d2733');
});

test('exclusion clause bans decorative pattern-packing', () => {
  const c = style.exclusionClause.toLowerCase();
  for (const term of ['honeycomb', 'hexagonal', 'tiled', 'repeating cells', 'mosaic', 'mesh', 'brickwork', 'dotted-grid', 'over-rendered']) {
    assert.ok(c.includes(term), `exclusion clause missing: ${term}`);
  }
});

test('style language keeps the dashboard a legible subject, not texture', () => {
  const s = style.styleLanguage.toLowerCase();
  assert.ok(s.includes('owl'), 'style language must name the owl cast');
  assert.ok(s.includes('legible'), 'style language must keep the interface legible');
});

test('anchors are exactly the three frozen watercolor-medium sources', () => {
  assert.deepEqual([...style.anchors].sort(), ['jellyfin', 'tokenjuice', 'usage-tracker']);
});

test('content-safety clause forbids PII and private IPs', () => {
  const c = style.contentSafety.toLowerCase();
  for (const term of ['placeholder', 'personal', 'private ip', '192.0.2']) {
    assert.ok(c.includes(term), `content safety missing: ${term}`);
  }
});
