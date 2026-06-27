import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt } from './build-prompt.mjs';

const style = {
  anchors: ['jellyfin'], anchorDir: 'anchors-v1', styleLanguage: 'SL.',
  frame: { subjectCoverage: '45-60% of the frame', negativeSpaceMin: '25%', aspect: '21:9' },
  exclusionClause: 'No honeycomb, no hexagonal or tiled pattern.',
};

test('prompt always carries the exclusion clause', () => {
  const briefs = { x: { category: 'X · Y', character: 'a great horned owl', action: 'reading', accentCool: null, anchor: 'jellyfin', target: 't' } };
  const p = buildPrompt('x', briefs, style);
  assert.match(p, /No honeycomb/);
  assert.match(p, /hexagonal or tiled pattern/);
});

test('the kicker is cyan, not amber', () => {
  const briefs = { x: { category: 'WAZUH-MCP · SIEM', character: 'a great horned owl', action: 'reading', accentCool: null, anchor: 'jellyfin', target: 't' } };
  const p = buildPrompt('x', briefs, style);
  assert.match(p, /monospaced cyan caps/);
  assert.match(p, /\[ WAZUH-MCP · SIEM \]/);
});

test('a character brief capitalizes its own article into the subject', () => {
  const briefs = { x: { category: 'X', character: 'a great horned owl', action: 'flagging an alert', accentCool: null, anchor: 'jellyfin', target: 't' } };
  assert.match(buildPrompt('x', briefs, style), /A great horned owl flagging an alert\./);
});

test('a vowel-article character keeps correct grammar', () => {
  const briefs = { x: { category: 'X', character: 'an owl analyst', action: 'marking a cell', accentCool: null, anchor: 'jellyfin', target: 't' } };
  assert.match(buildPrompt('x', briefs, style), /An owl analyst marking a cell\./);
});

test('a flatlay brief (character null) uses flatlay phrasing', () => {
  const briefs = { x: { category: 'X', character: null, action: 'an analyst desk', accentCool: null, anchor: 'jellyfin', target: 't' } };
  const p = buildPrompt('x', briefs, style);
  assert.match(p, /loose watercolor flatlay/);
  assert.doesNotMatch(p, /A null/);
});

test('a second cool accent is named only when accentCool is set', () => {
  const base = { category: 'X', character: 'a great horned owl', action: 'working', anchor: 'jellyfin', target: 't' };
  assert.match(buildPrompt('x', { x: { ...base, accentCool: 'violet' } }, style), /single violet accent/);
  assert.match(buildPrompt('x', { x: { ...base, accentCool: null } }, style), /Cool cyan brand accent on the owl/);
});

test('unknown slug throws', () => {
  assert.throws(() => buildPrompt('nope', {}, style), /No brief for slug/);
});

test('unknown anchor throws', () => {
  const briefs = { x: { category: 'X', character: 'an owl', action: 'a', accentCool: null, anchor: 'bogus', target: 't' } };
  assert.throws(() => buildPrompt('x', briefs, style), /unknown anchor/);
});

test('content-safety clause is appended only when present', () => {
  const briefs = { x: { category: 'X', character: 'an owl', action: 'working', accentCool: null, anchor: 'jellyfin', target: 't' } };
  assert.doesNotMatch(buildPrompt('x', briefs, style), /undefined/);
  const withCs = { ...style, contentSafety: 'CS-CLAUSE.' };
  assert.match(buildPrompt('x', briefs, withCs), /CS-CLAUSE\.$/);
});
