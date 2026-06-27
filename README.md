# lidless-fleet-kit

Shared theme and routine maintenance for the Lidless Labs hub site
(`lidless-site` / [lidless.dev](https://lidless.dev)). It keeps the site's
link-preview card, SEO head, and tool versions current without a hand-driven
LLM session, so the hub never drifts from the 12 tools it markets.

Lidless is a **single hub repo**, not a fleet of per-tool subdomains. This kit is
modelled on `escoffier-fleet-kit` but simplified to manage one checkout.

## What it does

- **One OG preview theme.** The link-preview card is rendered from a single
  dark-watch template (`og/template.html`) and a content map (`og/sites.json`):
  terminal-dark ground, a single signal-green accent, the lidless-eye motif, the
  `LIDLESS` wordmark, and the `Constant Vigilance.` motto. Change the theme once,
  regenerate.
- **Tool version sync.** Reads each of the 12 tools' latest GitHub release and
  writes them into the site's `src/lib/tools.ts` as an auto-generated `VERSIONS`
  map, so the site never lags the tools it lists. The hub's own
  `SITE.version` ("Wave 1") is left alone.
- **Shared SEO head.** `seo/Seo.astro` + `seo/seo.ts` are the canonical
  `<head>` (title, description, canonical, Open Graph, Twitter, JSON-LD,
  theme-color), copied into the site and validated by `bin/seo-validate.mjs`.
- **README banner pipeline.** `banner/` builds the text-only GPT Image 2 prompt
  for each tool's README banner from one shared style (`banner/style.json`) plus
  a per-tool brief (`banner/briefs.json`): a great horned owl working one legible
  dashboard, cyan accent, cream-paper watercolor. Frozen anchors and a test suite
  keep the look from drifting. See `ILLUSTRATION.md`.
- **Hands-off publishing.** `bin/fleet-sync.sh` fast-forwards the checkout, syncs
  versions, regenerates the card, syncs the SEO head, builds, runs `seo-validate`,
  and commits and pushes only if something changed. Safe to run on a timer; a
  no-op run touches nothing.

The canonical design system lives in `DESIGN.md`.

## Layout

```
DESIGN.md            aesthetic reference (Lidless dark-watch identity)
ILLUSTRATION.md      image style: og-card vs README banner, the owl + cyan watercolor
sites.config.json    the single site + its 12 tools (repo + version source)
og/
  template.html      the OG card template (dark-watch + lidless-eye + watch panel)
  sites.json         the OG copy (kicker, wordmark, motto, sub, foot, panel)
  render.mjs         renders the card to lidless-site/public/og-card.png (2x, no server)
banner/
  style.json         the shared watercolor style spec (palette, frame, exclusions)
  briefs.json        per-tool brief (owl character + dashboard action + kicker)
  build-prompt.mjs   assemble the text-only image prompt from style + brief
  anchors-v1/        frozen human style targets (immutable, checksum-guarded)
  crop-bands.py      normalize the 2048x1152 render to canonical 2048x878 (21:9)
  PROVENANCE.md      the exact prompt behind every banner
  *.test.mjs         the look contract (palette, exclusions, anchors, grammar)
seo/
  Seo.astro          the shared <head> component (source of truth)
  seo.ts             fleet constants + JSON-LD builders + canonical/title helpers
  robots.txt.tmpl    allow-all + sitemap line (host filled per site)
  README.md          the SEO contract
bin/
  sync-versions.mjs  read tool release versions, patch the VERSIONS map in tools.ts
  seo-validate.mjs   walk dist/*.html and enforce the SEO contract
  fleet-sync.sh      the headless routine: pull, sync, render, seo, build, validate, push
```

## Use

```bash
npm install                 # playwright-core (uses an existing Chromium build)

npm run og                  # regenerate the OG card from the shared theme
npm run banner -- wazuh-mcp # print the text-only image prompt for one tool's banner
npm test                    # check the banner look contract (palette, anchors, grammar)
npm run sync:dry            # preview tool-version changes, write nothing
npm run sync                # write the VERSIONS map into src/lib/tools.ts
npm run fleet               # the full routine: pull + sync + render + seo + build + validate + push
```

`og/render.mjs` resolves a Chromium binary from the Playwright cache, falling
back to system Chrome, so there is no web server in the loop (cron-safe).

## Banners

README banners are AI watercolors, but the *look* is code. Each banner traces
back to `banner/style.json` (the shared treatment) plus its `banner/briefs.json`
entry (the owl + the specific dashboard). The flow:

```bash
npm run banner -- mitre-mcp           # print the prompt + write a provenance sidecar
# generate with GPT Image 2 (text-only), using anchors-v1/ only as a human target
python3 banner/crop-bands.py out/ render.png   # strip letterbox bands -> 2048x878
node banner/insert-provenance.mjs mitre-mcp    # record the exact prompt in PROVENANCE.md
# replace the banner in the tool's repo and commit there
```

The contract is enforced by `npm test`: the palette tokens, the
decorative-pattern exclusions, the frozen anchor checksums, every brief's shape,
and the prompt grammar. The owl and the cyan accent are constant; the dashboard
is the variable. Full intent is in `ILLUSTRATION.md`.

## Version sources

`sites.config.json` maps each tool slug (matching `src/lib/tools.ts`) to its
GitHub repo and a version source:

- `gh-release` reads the latest release tag (the `v` prefix is stripped).
- `manual` is never auto-touched (used for a tool that has no release yet, e.g.
  `watchtower`).

To add a tool: add it to `sites.config.json` under `tools`, then `npm run sync`.

## Routine automation

`bin/fleet-sync.sh` is meant to run unattended (cron or an OpenClaw scheduled
job). It only pushes if there is a real change and prints a short summary
suitable for relaying to a chat channel. A new tool release out? The next run
bumps the `VERSIONS` map and redeploys via Vercel, no terminal required.

The site deploys on Vercel from `git push` to its default branch, so a push from
this kit is a deploy.
