# Contributing to lidless-fleet-kit

This kit keeps the [Lidless Labs](https://lidless.dev) site fleet looking the same and staying current: one OG card template, one watercolor banner pipeline, one SEO head, and routine tool-version sync. Patches are welcome. Please skim this file first so we both spend time on the right things.

## What lands easily

- **Banner briefs.** A new or sharper entry in `banner/briefs.json` (an owl + one legible dashboard). Run `npm test` and `npm run banner -- <slug>` to check it.
- **OG copy.** Tweaks to `og/sites.json` (kicker, motto, panel rows) that render cleanly via `npm run og`.
- **Version sources.** New tool mappings in `sites.config.json`.
- **SEO fixes** in `seo/` that pass `node bin/seo-validate.mjs dist/`.
- **Test coverage** for any of the above.

## What needs a conversation first

- **Design tokens or typography** (`DESIGN.md`, `banner/style.json`). These are fleet-wide; changing them re-skins every site.
- **A new banner anchor set.** The `anchors-v1/` set is frozen and checksum-guarded (see `banner/anchors.test.mjs`). A new version is a deliberate, reviewed change.
- **The SEO contract** (`seo/Seo.astro`, `seo/seo.ts`), OG card dimensions, or `trailingSlash` - every site inherits these.
- **A new runtime dependency.** The kit is intentionally thin.

## What does not land

- Personal details, real hostnames, real IPs, account IDs, secrets, or live auth in any file. Banner prompts and OG copy use placeholders and `192.0.2.x` example IPs only. The pre-push leak scan and `banner/style.json`'s content-safety clause exist to keep that out.
- A generated banner re-used as a style anchor. Re-feeding outputs as references is the exact cause of the hexagonal drift `anchors-v1/` exists to prevent.
- Cron jobs or steps that post or call the network without explicit opt-in.
- AI-co-authorship trailers on commits (`Co-Authored-By: <model>`). Conventional commits only.

## Local dev

```bash
git clone https://github.com/lidless-labs/lidless-fleet-kit.git
cd lidless-fleet-kit
npm install            # playwright-core (uses an existing Chromium build)
npm test               # the banner look contract
```

## Add a banner

1. Add an entry to `banner/briefs.json`: `category` (`PROJECT · CATEGORY`), `character` (the owl, or `null` for a flatlay), `action` (the dashboard task), `accentCool` (`null` for pure cyan), `anchor` (one of the frozen three), and `target`.
2. `npm run banner -- <slug>` prints the text-only prompt and writes a provenance sidecar.
3. Generate with GPT Image 2 (text-only; `anchors-v1/` is a human style target, never a model input).
4. Normalize the render: `python3 banner/crop-bands.py out/ render.png` -> canonical 2048x878.
5. `node banner/insert-provenance.mjs <slug>` records the exact prompt in `banner/PROVENANCE.md`. Drop the banner into the tool's repo and commit there.

See `ILLUSTRATION.md` for the full intent.

## Add a site or tool version

Add the tool to `sites.config.json` (repo + version source: `gh-release` or `manual`), then `npm run sync`. See `seo/README.md` for adopting the SEO contract on a new site.

## Filing issues

Use the templates under `.github/ISSUE_TEMPLATE/`. Before posting any command output, remove tokens, private hostnames, private repo names, and unredacted absolute paths.

## License

By contributing you agree that your contribution is licensed under the MIT License, same as the rest of the repo.
