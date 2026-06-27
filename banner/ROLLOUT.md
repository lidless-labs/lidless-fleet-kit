# Banner rollout queue

Run order. For each: `npm run banner -- <slug>`, generate with GPT Image 2 using
the text-only prompt + the named anchor as a human style target, normalize the
2048x1152 render through `crop-bands.py`, pass the legibility gate, replace the
banner in its repo, commit there.

## Wave 1 - generated (owl cast, cyan, cool watercolor)
The first 25 banners exist as a proof set. Re-render any flagged below through the
frozen pipeline so every banner traces back to `style.json` + `briefs.json`.

## Re-render to family (off-style / over-rendered)
- [ ] (none flagged yet - audit the proof set against `style.json` and list here)

## Keep (on-style, no work)
- [x] mitre-mcp, wazuh-mcp (clean owl + legible dashboard, cyan accent)

## Notes
- Security and homelab dashboards are legible UI, not decorative texture. A
  table, matrix, or port grid is allowed as the subject; a honeycomb or mesh
  backdrop is not (see `style.json` exclusionClause).
- One owl, one task, one cyan highlight per frame. Status colors (red/amber/green)
  only where the real interface uses them.
