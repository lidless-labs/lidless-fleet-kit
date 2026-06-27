# Lidless Labs Illustration & Image Style

Canonical reference for the fleet's images. Companion to `DESIGN.md` (the web
design system). The source of truth for constants is `banner/style.json`; this
doc explains the intent.

## Principle: the frame is the constant, the dashboard is the variable

Brand cohesion comes from the watercolor frame (cream paper, slate-navy ink,
the single cyan accent, the kicker grammar), not from any one scene. The owl is
the constant cast; the interface it works - a SIEM table, an ATT&CK matrix, a
homelab rack, a DNS log - is the per-tool variable.

## Shared brand DNA

- Palette (`banner/style.json`): ink `#0a0e15`, cyan `#38bdf8`, cream `#f5f2ea`,
  slate-navy ink `#1d2733`. Cyan is the single brand accent.
- Cast: a great horned owl. The unsleeping eye stays the lab logo only (og-card,
  favicon, nav); it never becomes the banner subject.
- Kicker: `[ PROJECT · CATEGORY ]`, cyan mono caps, top-left.
- The shared watercolor medium with the Escoffier fleet: owls answer their
  lobsters, cyan answers their amber.

## Two artifacts, one DNA

- **og-card**: code-rendered (`og/render.mjs`, HTML to PNG). Dark-watch console,
  cyan/green on `#0a0e15`. Text-led, never AI-generated, so it never drifts.
- **README banner**: GPT Image 2 watercolor on cream paper. Character-led: one
  owl working one legible dashboard. Built via `banner/`.

## Why the dashboard stays legible

Lidless tools are security, network, and homelab interfaces, so the banner's
subject is a real-looking dashboard, table, matrix, map, or rack - drawn clearly
enough to read its labels. The exclusion clause in `banner/style.json` bans
decorative pattern-packing (honeycomb, mesh, dotted-grid texture), not the
functional UI. A table is the subject; a tiled wall of cells is not.

## Pipeline

1. `npm run banner -- <slug>` prints the text-only prompt and writes a
   provenance sidecar. The prompt is assembled from `banner/style.json` plus the
   per-tool brief in `banner/briefs.json`.
2. Generate with GPT Image 2 (text-only). The frozen anchors in
   `banner/anchors-v1/` are human style targets, never model inputs.
3. Normalize the 2048x1152 render through `banner/crop-bands.py` to the canonical
   2048x878 (21:9) banner. Never ship the raw letterboxed render.
4. Record it: `node banner/insert-provenance.mjs <slug>` refreshes
   `banner/PROVENANCE.md`. Replace the banner in the tool's repo and commit there.

`npm test` guards the contract: palette tokens, the exclusion clause, the frozen
anchor checksums, every brief's shape, and the prompt grammar.
