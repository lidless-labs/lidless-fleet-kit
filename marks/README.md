# Fleet marks

The shared **owl** logo that threads every Lidless Labs repo back to the hub. One
owl, reused everywhere like a favicon. This is the org's GitHub logo, not a
per-tool mark, and it is never swapped per tool: repos are told apart by the mono
name label next to it, never by a different mark.

- `lidless-owl.png` is the canonical logo: the watercolor great horned owl (the
  org GitHub avatar), circular-cropped to a 256px disc with transparent corners
  so it sits on any ground.
- `fleet.json` is the roster: every public product repo, grouped like the org
  profile. The same roster drives the "Part of Lidless Labs" footer.
- `dist/<slug>-circle.png` is generated, one identical copy per roster entry.

## Regenerate

```bash
npm run marks          # write marks/dist/ + manifest.json
npm run marks:check    # CI: fail if dist/ is stale
```

## Put a mark in a repo

```bash
node bin/stamp-marks.mjs --repo ~/repos/soc-stack --slug soc-stack
```

Then place it directly under the banner (see `README-SPINE.md`, the Fleet mark
slot):

```html
<p align="center">
  <a href="https://lidless.dev"><img src="docs/assets/marks/soc-stack-circle.png" width="48" alt="Lidless Labs"></a>
</p>
```

## Updating the logo

Replace `lidless-owl.png` (keep it a circular-cropped PNG matching the GitHub org
avatar), then run `npm run marks` to restamp `dist/`.
