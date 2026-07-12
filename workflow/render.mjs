import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COLORS = {
  bg: '#0a0e15',
  panel: '#0d1119',
  panel2: '#111824',
  text: '#dbe3ec',
  muted: '#aab6c4',
  dim: '#7c8894',
  accent: '#38bdf8',
  accentDim: '#1f7fb0',
  hairline: '#1a2230',
  strong: '#232c3a',
  warn: '#d8a657',
  danger: '#ef4444',
  ok: '#22c55e',
};

const NODE_W = 220;
const NODE_H = 88;
const LANE_GAP = 52;
const ROW_GAP = 42;
const LEFT = 66;
const TOP = 202;
const HEADER_H = 118;
const FOOTER_H = 48;

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function wordsFor(value) {
  return String(value ?? '').trim().split(/\s+/).filter(Boolean);
}

function wrapText(value, maxChars, maxLines = 2) {
  const lines = [];
  let line = '';
  for (const word of wordsFor(value)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[. ]+$/, '')}…`;
  return kept;
}

export function validateWorkflow(workflow) {
  if (!workflow || typeof workflow !== 'object') {
    throw new Error('workflow must be an object');
  }
  for (const field of ['kicker', 'title', 'lanes', 'nodes', 'edges']) {
    if (workflow[field] == null) throw new Error(`workflow missing ${field}`);
  }
  if (!Array.isArray(workflow.lanes) || workflow.lanes.length === 0) {
    throw new Error('workflow.lanes must be a non-empty array');
  }
  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    throw new Error('workflow.nodes must be a non-empty array');
  }
  if (!Array.isArray(workflow.edges)) {
    throw new Error('workflow.edges must be an array');
  }

  const lanes = new Set();
  for (const lane of workflow.lanes) {
    if (!lane.id || !lane.label) throw new Error('lane missing id or label');
    if (lanes.has(lane.id)) throw new Error(`duplicate lane id: ${lane.id}`);
    lanes.add(lane.id);
  }

  const nodes = new Set();
  for (const node of workflow.nodes) {
    if (!node.id || !node.lane || !node.title) throw new Error('node missing id, lane, or title');
    if (!lanes.has(node.lane)) throw new Error(`node ${node.id} uses unknown lane: ${node.lane}`);
    if (nodes.has(node.id)) throw new Error(`duplicate node id: ${node.id}`);
    if (!Number.isInteger(node.row) || node.row < 0) throw new Error(`node ${node.id} row must be a non-negative integer`);
    nodes.add(node.id);
  }

  for (const edge of workflow.edges) {
    if (!nodes.has(edge.from) || !nodes.has(edge.to)) {
      throw new Error(`unknown edge endpoint: ${edge.from} -> ${edge.to}`);
    }
  }
}

function layoutWorkflow(workflow) {
  const laneIndex = new Map(workflow.lanes.map((lane, index) => [lane.id, index]));
  const maxRow = Math.max(...workflow.nodes.map((node) => node.row));
  const width = LEFT * 2 + workflow.lanes.length * NODE_W + (workflow.lanes.length - 1) * LANE_GAP;
  const height = TOP + (maxRow + 1) * NODE_H + maxRow * ROW_GAP + FOOTER_H;
  const nodes = new Map();

  for (const node of workflow.nodes) {
    const lane = laneIndex.get(node.lane);
    const x = LEFT + lane * (NODE_W + LANE_GAP);
    const y = TOP + node.row * (NODE_H + ROW_GAP);
    nodes.set(node.id, { ...node, x, y, cx: x + NODE_W / 2, cy: y + NODE_H / 2 });
  }

  return { width, height, nodes };
}

function nodeColors(status) {
  if (status === 'focus') return { stroke: COLORS.accent, fill: COLORS.panel2, label: COLORS.accent };
  if (status === 'gate') return { stroke: COLORS.warn, fill: COLORS.panel, label: COLORS.warn };
  if (status === 'source') return { stroke: COLORS.strong, fill: COLORS.panel, label: COLORS.dim };
  return { stroke: COLORS.strong, fill: COLORS.panel, label: COLORS.dim };
}

function renderNode(node) {
  const c = nodeColors(node.status);
  const titleLines = wrapText(node.title, 21, 2);
  const metaLines = wrapText(node.meta ?? '', 30, 2);
  const status = node.status
    ? `<text x="${node.x + NODE_W - 16}" y="${node.y + NODE_H - 14}" text-anchor="end" class="status" fill="${c.label}">${escapeXml(node.status)}</text>`
    : '';

  return `
    <g class="node" data-node="${escapeXml(node.id)}">
      <rect x="${node.x}" y="${node.y}" width="${NODE_W}" height="${NODE_H}" rx="14" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.4"/>
      <circle cx="${node.x + 18}" cy="${node.y + 22}" r="4" fill="${c.label}"/>
      ${status}
      <text x="${node.x + 34}" y="${node.y + 27}" class="node-title">
        ${titleLines.map((line, i) => `<tspan x="${node.x + 34}" dy="${i === 0 ? 0 : 17}">${escapeXml(line)}</tspan>`).join('')}
      </text>
      <text x="${node.x + 18}" y="${node.y + 62}" class="node-meta">
        ${metaLines.map((line, i) => `<tspan x="${node.x + 18}" dy="${i === 0 ? 0 : 14}">${escapeXml(line)}</tspan>`).join('')}
      </text>
    </g>`;
}

function renderEdge(edge, nodes) {
  const from = nodes.get(edge.from);
  const to = nodes.get(edge.to);
  const fromX = from.x + NODE_W;
  const fromY = from.cy;
  const toX = to.x;
  const toY = to.cy;
  const midX = Math.min(fromX + 32, (fromX + toX) / 2);

  if (toX > fromX) {
    return `<path class="edge" d="M ${fromX} ${fromY} C ${midX} ${fromY}, ${toX - 34} ${toY}, ${toX - 8} ${toY}" marker-end="url(#arrow)"/>`;
  }

  const lower = Math.max(from.y + NODE_H + 18, to.y + NODE_H + 18);
  return `<path class="edge" d="M ${from.cx} ${from.y + NODE_H} V ${lower} H ${to.cx} V ${to.y + NODE_H + 8}" marker-end="url(#arrow)"/>`;
}

export function renderWorkflowSvg(workflow) {
  validateWorkflow(workflow);
  const { width, height, nodes } = layoutWorkflow(workflow);
  const laneWidth = NODE_W;
  const laneBands = workflow.lanes.map((lane, index) => {
    const x = LEFT + index * (NODE_W + LANE_GAP);
    return `
      <rect x="${x - 14}" y="${HEADER_H}" width="${laneWidth + 28}" height="${height - HEADER_H - 30}" rx="18" fill="${index % 2 ? COLORS.panel : COLORS.panel2}" opacity="0.42" stroke="${COLORS.hairline}"/>
      <text x="${x}" y="${TOP - 24}" class="lane">${escapeXml(lane.label)}</text>`;
  }).join('');

  const edges = workflow.edges.map((edge) => renderEdge(edge, nodes)).join('\n');
  const nodeSvg = [...nodes.values()].map(renderNode).join('\n');
  const subtitle = wrapText(workflow.subtitle ?? '', Math.max(56, Math.floor((width - LEFT * 2) / 9)), 2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(workflow.title)}</title>
  <desc id="desc">${escapeXml(workflow.subtitle ?? workflow.kicker)}</desc>
  <defs>
    <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="strokeWidth">
      <path d="M 0 0 L 8 4.5 L 0 9 z" fill="${COLORS.accent}"/>
    </marker>
    <radialGradient id="glow" cx="74%" cy="14%" r="58%">
      <stop offset="0%" stop-color="${COLORS.accent}" stop-opacity="0.22"/>
      <stop offset="70%" stop-color="${COLORS.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <style>
    .kicker,.lane,.status,.footer{font-family:"IBM Plex Mono","SFMono-Regular",Consolas,monospace;letter-spacing:.11em}
    .title{font-family:"Instrument Sans",Inter,system-ui,sans-serif;font-weight:760;font-size:31px;fill:${COLORS.text}}
    .subtitle{font-family:"Instrument Sans",Inter,system-ui,sans-serif;font-size:15px;fill:${COLORS.muted}}
    .kicker{font-size:12px;font-weight:700;fill:${COLORS.accent}}
    .lane{font-size:11px;font-weight:700;fill:${COLORS.dim}}
    .node-title{font-family:"IBM Plex Mono","SFMono-Regular",Consolas,monospace;font-size:14px;font-weight:700;fill:${COLORS.text}}
    .node-meta{font-family:"Instrument Sans",Inter,system-ui,sans-serif;font-size:12px;fill:${COLORS.muted}}
    .status{font-size:9px;font-weight:700;text-transform:uppercase}
    .edge{fill:none;stroke:${COLORS.accent};stroke-width:2;stroke-linecap:round;stroke-linejoin:round;opacity:.86}
    .footer{font-size:11px;fill:${COLORS.dim}}
  </style>
  <rect x="0" y="0" width="${width}" height="${height}" rx="0" fill="${COLORS.bg}"/>
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#glow)"/>
  <path d="M ${LEFT} 98 H ${width - LEFT}" stroke="${COLORS.hairline}" stroke-width="1"/>
  <text x="${LEFT}" y="42" class="kicker">${escapeXml(workflow.kicker)}</text>
  <text x="${LEFT}" y="78" class="title">${escapeXml(workflow.title)}</text>
  <text x="${LEFT}" y="114" class="subtitle">
    ${subtitle.map((line, i) => `<tspan x="${LEFT}" dy="${i === 0 ? 0 : 19}">${escapeXml(line)}</tspan>`).join('')}
  </text>
  ${laneBands}
  ${edges}
  ${nodeSvg}
  <path d="M ${LEFT} ${height - 34} H ${width - LEFT}" stroke="${COLORS.hairline}" stroke-width="1"/>
  <text x="${LEFT}" y="${height - 14}" class="footer">${escapeXml(workflow.footer ?? 'generated lidless workflow')}</text>
</svg>
`;

  return svg.replace(/[ \t]+$/gm, '');
}

function main() {
  const args = process.argv.slice(2);
  const input = args[0];
  const output = args[1];
  if (!input || !output) {
    console.error('usage: node workflow/render.mjs <input.json> <output.svg>');
    process.exit(2);
  }
  const workflow = JSON.parse(readFileSync(resolve(input), 'utf-8'));
  const svg = renderWorkflowSvg(workflow);
  mkdirSync(dirname(resolve(output)), { recursive: true });
  writeFileSync(resolve(output), svg);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
