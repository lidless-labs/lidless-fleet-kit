# Lidless workflow diagrams

## Goal

Give Lidless Labs the same reusable workflow-image treatment as the Escoffier Labs README pass, but in the Lidless identity: dark-watch console, electric-blue signal, owl/cyan brand vocabulary, and proof-first README placement.

## Current state

`lidless-fleet-kit` already owns the shared Lidless contracts:

- `DESIGN.md` defines the dark-watch tokens and site identity.
- `ILLUSTRATION.md` defines the owl/cyan watercolor banner system.
- `README-SPINE.md` defines README section order, proof expectations, badge rules, and allowed deviations.
- `banner/` and `og/` are reusable generators.

What is missing is a workflow-diagram generator. Escoffier README workflow images were generated from JSON sources in each repo. Lidless needs the same source-driven approach, but the visual language should read as a security console, not a kitchen plate.

## Design recommendation

Add a first-class workflow renderer to this kit:

```text
workflow/
  render.mjs
  schema.md
  examples/
    tool-call-path.json
    fleet-routine.json
docs/assets/workflows/
  lidless-fleet-routine.json
docs/assets/
  lidless-fleet-routine.svg
```

The renderer should accept a compact JSON graph and output a GitHub-safe SVG. Keep it dependency-light and consistent with the existing kit shape: Node script, committed source JSON, committed SVG, and tests run through `npm test`.

## Visual style

Lidless workflow cards should look like an operator display:

- Canvas: `#0a0e15`, with subtle panel bands using `#0d1119` and `#111824`.
- Lines: hairline `#1a2230`, strong borders `#232c3a`.
- Signal: `#38bdf8` for primary arrows, focus nodes, and key labels.
- Warnings: `#d8a657` only for gates, review, and caution states.
- Text: IBM Plex Mono-style labels, high contrast, no tiny low-contrast captions.
- Shape language: console panels, status dots, ordered lanes, and clear left-to-right or top-to-bottom flow.
- No Escoffier amber plating frame, cream card, lobster/kitchen motifs, or decorative watercolor texture.

## README placement

Workflow diagrams are not the top banner and not a replacement for proof. They belong in feature sections after the first proof asset, usually where a Mermaid map or dense table currently explains flow.

Recommended block:

```md
![<repo> workflow](docs/assets/<name>-workflow.svg)

Generated from [`docs/assets/workflows/<name>.json`](docs/assets/workflows/<name>.json) with `lidless workflow`.
```

The alt text must describe the actual flow, not just say "workflow diagram".

## First rollout candidates

Start in `lidless-fleet-kit` itself:

1. Add the reusable `workflow/` renderer.
2. Generate `docs/assets/lidless-fleet-routine.svg` from `docs/assets/workflows/lidless-fleet-routine.json`.
3. Update `README.md` so the kit demonstrates its own routine with the new workflow card.
4. Update `README-SPINE.md` with the workflow-card convention and the rule that workflow images do not replace slot 7 proof.

Then update repos where the workflow is central or existing prose is dense:

1. `n8nctrl` - workflow ops lifecycle.
2. `suricata-mcp` - alert investigation flow.
3. `cortex-mcp` - observable analysis flow.
4. `thehive-mcp` - case triage flow.
5. `proxmox-mcp` - node and VM operation flow.
6. `lidless-proxmox` - installer, verify gate, and manifest flow.
7. `.github` profile - small fleet map only if it stays readable.

Avoid archived `samba-ad-migration` unless it is unarchived later.

## Verification

- `npm test` in `lidless-fleet-kit`.
- A renderer smoke test that confirms every example JSON produces an SVG with no clipped nodes, no overlapping pill labels, and no external image references.
- `brigade work verify run --target . --command "npm test"` before claiming the kit is ready.
- Per-repo README changes get their normal repo checks, routed through Brigade when the repo is Brigade-wired.
