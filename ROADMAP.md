# Roadmap

lidless-fleet-kit exists to keep the Lidless Labs site fleet consistent and current without a hand-driven session. The direction: one shared theme, reproducible artifacts (OG cards + watercolor banners), a guarded SEO contract, and a routine that only commits real changes. This file is direction-only.

## Where things stand

Shipped: the dark-watch OG card template + renderer, the shared SEO head + validator, tool-version sync, the hands-off `fleet-sync` routine, and the watercolor **banner pipeline** (`style.json` + `briefs.json` + `build-prompt.mjs`, frozen anchors, a 21-test contract, provenance, and the `crop-bands` normalizer). Briefs cover the 25 wave-1 tools plus the kit itself.

## Now

- **Roll the generated banners into each tool repo.** Briefs and prompts exist; the next step is rendering the dedicated banner for each tool and committing it to that tool's `docs/assets/`. `ROLLOUT.md` tracks the queue.
- **Treat real usage as the queue.** Issues, install reports, and on-style failures outrank speculative work.

## Next

- **OG card depth.** Per-tool OG variants (category accent, status panel) from the same template, so a tool page's share card matches its banner.
- **Banner audit.** A check that compares each shipped banner against `style.json` (aspect, legibility, no decorative-texture drift) and flags re-renders.
- **SEO depth.** Sharpen `seo-validate` (title/description length, JSON-LD shape) and wire it into CI for any adopting site.

## Later

- **A second fleet kit consumer.** The kit is modelled to manage one hub today; generalize `sites.config.json` if Lidless grows per-tool subdomains.
- **Shared `bin` parity with the Escoffier kit** where it makes sense (publishing watchdog, content sync), only if Lidless adopts the same publishing surfaces.

## How items move

Items live here while they are direction. When a slice ships, its detail moves into `CHANGELOG.md`.
