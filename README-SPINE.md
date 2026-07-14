# README Spine

The fleet contract for every public Lidless Labs repo README. `DESIGN.md` owns the web design system and `ILLUSTRATION.md` owns the art. This file owns the README itself: section order, placement, and the conventions that keep 27 repos reading like one shop.

The reference implementation is [`lidless-labs/cutsheet`](https://github.com/lidless-labs/cutsheet). When this document and a repo disagree, fix the repo. When this document and cutsheet disagree, fix this document.

## Why this exists

Adoption = user benefit + repeated promotion + visible trust. The README is the product page: a visitor decides in the first screen whether the tool is for them. Every section below either proves the tool works, tells the visitor whether it fits, or gets out of the way.

## Section order

Required sections, in this order. Feature sections in the middle are free-form. Everything else keeps its slot.

| # | Section | Notes |
|---|---|---|
| 1 | Banner | `<p align="center"><img src="docs/assets/<name>-social-preview.jpg" width="900"></p>` |
| 2 | Fleet mark | `<p align="center"><a href="https://lidless.dev"><img src="docs/assets/marks/<name>-circle.png" width="48" alt="Lidless Labs"></a></p>` - the shared owl logo, links to the hub. See Fleet mark below. |
| 3 | `<h1 align="center">Name</h1>` | Product name only, no tagline |
| 4 | Bold one-liner | `<p align="center"><strong>…</strong></p>` - one sentence: what it does, for whom, how it differs |
| 5 | Links line | `<p align="center">` lidless.dev page · Docs · Quickstart anchor, `&middot;`-separated |
| 6 | Badges | shieldcn, see badge order below |
| 7 | Hook line | One short plain-prose sentence. Optional but encouraged. |
| 8 | Proof asset + caption | The tool visibly doing its headline job. See proof table. |
| 9 | `## What it does` | First 3 sentences carry WHAT / WHY / HOW-IT-DIFFERS. One paragraph, no bullets. |
| 10 | `## Install` | The install command(s) a reader actually runs. |
| 11 | `## Try it in 60 seconds` | Copy-paste block, verified against the published artifact, ending in visible output. |
| 12 | Feature sections | Free-form. Each major claim gets a real fenced output block or diagram. |
| 13 | `## Why not <alternatives>?` | Honest comparison, named alternatives, no straw men. |
| 14 | `## What <Name> is not` | Boundaries. What it refuses to do and why that is the point. |
| 15 | `## Why I built this` | Optional. The watercolor owl art lives here as a secondary image. |
| 16 | `## Docs` | Optional. Links into `docs/`. |
| 17 | `## License` | License + project identity line (org, lidless.dev page, registry, command). |

Heading case is sentence case with a leading capital: `## Install`, never `## install`.

## Proof, not decoration

The asset in slot 8 shows the tool doing the one thing the README promises. Setup, `--help`, and status output are not proof. The headline action is. Match the proof to the tool:

| Tool type | Proof |
|---|---|
| MCP server | Inspector `tools/list` plus one real call with its result |
| Operator CLI (`*ctrl`) | Terminal recording or fenced output of the headline command against a real service |
| Dashboard / web UI | Real screenshot with sample data |
| Runbook / automation | The run in progress: a step executing with visible state |
| Scripts / docs repo | Catalog table, no image needed |

Every image proof gets a caption directly beneath it:

```html
<p align="center"><em>`command` does the thing and reports the result, in seconds.</em></p>
```

One line, naming the command and the outcome. Alt text on recordings starts with `Recording:` and describes what happens. Keep terminal recordings at or under 90 columns.

## Badges

shieldcn (`shieldcn.dev`), in this order: CI, registry version, MCP server tag (where it applies), license. `img.shields.io` is retired fleet-wide.

```html
<img src="https://shieldcn.dev/github/ci/lidless-labs/<name>.svg?branch=<default>&workflow=ci.yml" alt="CI status">
<img src="https://shieldcn.dev/npm/<package>.svg" alt="npm version">
<img src="https://shieldcn.dev/badge/MCP-server-8A2BE2.svg" alt="MCP server">
<img src="https://shieldcn.dev/badge/license-MIT-green.svg" alt="MIT license">
```

## Banner assets

- README banner: `docs/assets/<name>-social-preview.jpg`, 2048x878 (21:9), embedded at `width="900"`.
- The `-banner.jpg` naming is retired. Rename on touch.
- Art follows `ILLUSTRATION.md`: one great horned owl working one legible dashboard, cyan accent, cream watercolor. The banner is identity, never the sole proof - slot 8 does that job.
- New banners come from this repo's banner system (`banner/briefs.json` -> prompt -> crop) with a `.prompt.txt` provenance sidecar.

## Fleet mark

The owl in slot 2 is the shared fleet mark: the org's GitHub logo, the same for every repo. It is the fleet's favicon, not a per-tool mark, and is never swapped per tool. Repos are told apart by the mono name label beside it, never by the mark.

- The mark is the org logo in this kit: `marks/lidless-owl.png` is the canonical art (the circular-cropped watercolor owl avatar), and `npm run marks` stamps `marks/dist/<slug>-circle.png` for every repo in `marks/fleet.json`.
- Put it in a repo with `node bin/stamp-marks.mjs --repo <path> --slug <slug>`, which writes `docs/assets/marks/<slug>-circle.png`. Reference that local copy, never hotlink another repo's mark.
- `npm run marks:check` fails CI if `dist/` drifts from the roster or the logo. To change the logo, replace `marks/lidless-owl.png` and rerun `npm run marks`.

## Motto and vocabulary

The fleet motto is "The eye does not close." Never "Constant Vigilance" anywhere, in any casing. Watch vocabulary ("keeps watch", "always on", "the eye") is copy seasoning, never decoration.

## Allowed deviations

| Repo | Deviation | Why |
|---|---|---|
| cutsheet, vervet | Homepage points at their own product domain, links line leads with it | Standalone products with their own sites |
| lidless-fleet-kit | Banner slot shows a sample pipeline output | The kit's product is the banner system itself |
| samba-ad-migration | Catalog/table proof, no image | Scripts repo, the runbook is the product |
| .github | Profile README, no spine sections, org banner instead of the fleet mark | Org profile, not a product page |

Anything else that needs to deviate gets a row here first.

## Gates before merge

- CI: workflows carry `paths-ignore` for `docs/**`, `*.md`, `LICENSE`, `.gitignore` so docs changes do not burn Actions minutes.
- Leaks: content-guard on the README and every new asset. No home paths, usernames, hostnames, or private IPs anywhere, RFC 5737 IPs only in examples.
- Quickstart verified against the published artifact in a clean env, not the local checkout.
- Docs-only PRs: no review bots, no release. Releases happen on request only.
