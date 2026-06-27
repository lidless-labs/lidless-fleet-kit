# Governance

lidless-fleet-kit is a maintainer-led open-source project. Decisions are made in public where practical, with the maintainer responsible for the final call on scope, the design contract, and releases.

## Decision principles

This kit favors:

- one shared source over per-site drift (edit the kit, re-sync)
- code over vibes: the look is constants in `style.json` / `DESIGN.md`, guarded by tests
- text-only, no-network banner prompts over live image calls in the loop
- a single cyan signal accent and a dark-only theme over a second hero color
- small, reproducible changes over speculative platform work

Changes that preserve those principles can usually move through issues and pull requests. Changes that alter them need discussion first.

## What needs discussion first

Open an issue before starting work on:

- changes to the design tokens or typography in `DESIGN.md` / `banner/style.json`
- a new banner anchor set (`anchors-v2`) - the v1 set is frozen and checksum-guarded on purpose
- changes to the SEO contract (`seo/Seo.astro`, `seo/seo.ts`) that every site inherits
- changes to OG card dimensions, `trailingSlash`, or other fleet-wide constants
- any new runtime dependency, or any step that calls the network outside an explicit command

## Release authority

The maintainer owns versioning and tags. Generated assets (OG cards, banners) live in each site or tool repo; this kit ships the templates, briefs, and automation that produce them.

## Community expectations

Project discussion follows the [Code of Conduct](CODE_OF_CONDUCT.md). Technical disagreement is welcome. Personal attacks, private-data leaks, and surprise automation that reaches outside the user's machine are not.
