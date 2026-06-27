import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const briefs = JSON.parse(readFileSync(new URL('./briefs.json', import.meta.url)));
const style = JSON.parse(readFileSync(new URL('./style.json', import.meta.url)));

test('every brief has the required fields and a valid anchor', () => {
  for (const [slug, b] of Object.entries(briefs)) {
    for (const key of ['category', 'action', 'anchor', 'target']) {
      assert.ok(b[key] != null && b[key] !== '', `${slug} missing ${key}`);
    }
    assert.ok('character' in b, `${slug} must declare character (string or null)`);
    assert.ok('accentCool' in b, `${slug} must declare accentCool (string or null)`);
    assert.ok(style.anchors.includes(b.anchor), `${slug} bad anchor: ${b.anchor}`);
  }
});

test('every active wave-1 tool has a brief', () => {
  const required = [
    'wazuh-mcp', 'misp-mcp', 'suricata-mcp', 'thehive-mcp', 'cortex-mcp',
    'mitre-mcp', 'zeek-mcp', 'n8n-ops-mcp', 'immich-mcp',
  ];
  for (const slug of required) {
    assert.ok(briefs[slug], `missing brief for ${slug}`);
  }
});

test('every category kicker follows the [ PROJECT · CATEGORY ] grammar', () => {
  for (const [slug, b] of Object.entries(briefs)) {
    assert.match(b.category, /\S\s·\s\S/, `${slug} category not "PROJECT · CATEGORY": ${b.category}`);
  }
});
