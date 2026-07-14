# Fleet marks

The shared **owl** mark that threads every Lidless Labs repo back to the hub. One
owl, one accent color. This is the fleet identity token, the way a favicon is.
It is not a per-tool logo and is never recolored per tool: repos are told apart
by the mono name label next to the mark, not by the mark itself.

- `mark.svg` is the canonical art: a great horned owl in a watch bezel, drawn
  natively at 80x80 for crisp 40px use. Its eyes reuse the lidless-eye geometry
  so the mark reads as one family with the site. Palette follows `DESIGN.md`;
  `#38bdf8` is the only chroma.
- `fleet.json` is the roster: every public product repo, grouped like the org
  profile. The same roster drives the "Part of Lidless Labs" footer.
- `dist/<slug>-circle.svg` is generated, one per roster entry (identical art, a
  per-repo `<title>`/`aria-label` for screen readers).

## Regenerate

```bash
npm run marks          # write marks/dist/ + manifest.json
npm run marks -- --check   # CI: fail if dist/ is stale or off-palette
```

`build-marks.mjs` enforces the palette and shape, so a stray color or a wrong
viewBox fails the build instead of shipping.

## Put a mark in a repo

```bash
node bin/stamp-marks.mjs --repo ~/repos/soc-stack --slug soc-stack
```

Then place it directly under the banner (see `README-SPINE.md`, the Fleet mark
slot):

```html
<p align="center">
  <a href="https://lidless.dev"><img src="docs/assets/marks/soc-stack-circle.svg" width="40" alt="Lidless Labs"></a>
</p>
```
