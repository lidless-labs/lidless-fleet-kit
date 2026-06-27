# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims
to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-06-27

First public release. The shared kit for the Lidless Labs site fleet.

### Added

- **Dark-watch OG card.** `og/template.html` + `og/render.mjs` render the
  `lidless.dev` link-preview card (2400x1260, headless, no server) from one
  shared theme and the copy in `og/sites.json`.
- **Watercolor banner pipeline.** `banner/` builds the text-only GPT Image 2
  prompt for each tool's README banner from a shared style (`banner/style.json`)
  plus a per-tool brief (`banner/briefs.json`): a great horned owl working one
  legible dashboard, cyan accent, cream-paper watercolor. Includes the prompt
  builder (`build-prompt.mjs`), the frozen, checksum-guarded style anchors
  (`anchors-v1/`), the `crop-bands.py` render normalizer, provenance
  (`PROVENANCE.md` + `insert-provenance.mjs`), a rollout queue (`ROLLOUT.md`),
  and a 21-test contract (`*.test.mjs`).
- **Shared SEO head.** `seo/Seo.astro` + `seo/seo.ts` + `seo/robots.txt.tmpl`
  are the canonical `<head>` (title, description, canonical, Open Graph,
  Twitter, JSON-LD, theme-color), validated by `bin/seo-validate.mjs`.
- **Tool-version sync.** `bin/sync-versions.mjs` + `sites.config.json` read each
  tool's latest GitHub release into the site's `tools.ts`.
- **Hands-off routine.** `bin/fleet-sync.sh` pulls, syncs versions, regenerates
  the card, syncs the SEO head, builds, validates, and commits/pushes only on a
  real change.
- **Docs.** `README.md` (proof-first), `DESIGN.md` (the dark-watch identity),
  `ILLUSTRATION.md` (the image-style contract), and full project governance
  (`LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`,
  `GOVERNANCE.md`, `MAINTAINERS.md`, `ROADMAP.md`).

[Unreleased]: https://github.com/lidless-labs/lidless-fleet-kit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/lidless-labs/lidless-fleet-kit/releases/tag/v0.1.0
