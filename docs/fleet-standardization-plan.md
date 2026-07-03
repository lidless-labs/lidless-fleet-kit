# Lidless fleet standardization plan

Draft, 2026-07-03. Source: brigade spark-swarm audit `20260703-163159-3ef0fcc6` (full report in `.brigade/runs/20260703-163159-3ef0fcc6/final.txt`), all 27 org repos + lidless.dev. Companion to `docs/owl-rebrand.md`, which owns the branding decisions this plan executes.

## Gap matrix (from the audit)

Checklist: 1 banner at `docs/assets/<name>-social-preview.jpg`, 2 centered H1, 3 bold one-liner, 4 links line, 5 badges, 6 proof asset + caption, 7 What it does, 8 Install, 9 quickstart block, 10 License, 11 GitHub description/homepage. Y yes, P partial, N no. Legacy `*-banner.jpg` counts as P for item 1.

| Repo | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| cutsheet | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | P | homepage cutsheet.dev, intentional |
| intel-workbench | P | Y | Y | P | Y | P | N | N | Y | Y | P | homepage vercel.app |
| misp-mcp | P | P | P | P | Y | N | P | Y | Y | Y | Y | legacy banner, img.shields.io |
| suricata-mcp | P | P | P | P | Y | N | P | Y | Y | Y | Y | legacy banner, img.shields.io |
| thehive-mcp | P | P | P | P | Y | N | P | Y | Y | Y | Y | legacy banner, img.shields.io |
| cortex-mcp | P | P | P | P | Y | N | P | Y | Y | Y | Y | legacy banner, img.shields.io |
| zeek-mcp | P | P | P | P | Y | N | P | Y | Y | Y | Y | legacy banner, img.shields.io |
| hotwash | P | Y | Y | P | Y | N | Y | N | Y | Y | Y | shieldcn |
| soc-stack | P | Y | Y | P | Y | N | Y | N | Y | Y | Y | shieldcn |
| watchtower | P | Y | Y | P | Y | N | Y | N | Y | Y | Y | shieldcn |
| wazuh-mcp | P | P | P | P | Y | N | P | Y | Y | Y | Y | legacy banner, img.shields.io |
| proxmox-mcp | N | P | P | P | Y | Y | P | Y | Y | Y | Y | no banner, has proof |
| vervet | P | Y | Y | N | Y | P | N | N | N | Y | P | homepage vervet.dev |
| mitre-mcp | P | P | P | P | Y | N | P | Y | Y | Y | Y | legacy banner, img.shields.io |
| maltego-mcp | P | Y | Y | P | Y | N | Y | Y | Y | Y | Y | shieldcn |
| jellyctrl | P | Y | Y | Y | Y | N | P | Y | Y | Y | Y | legacy banner, shieldcn |
| n8nctrl | P | Y | Y | Y | Y | N | P | Y | Y | Y | Y | copy block, no Quickstart heading |
| immichctrl | P | Y | Y | Y | Y | N | P | Y | Y | Y | Y | legacy banner, shieldcn |
| lidless-fleet-kit | N | P | P | P | Y | P | Y | P | Y | Y | P | Constant Vigilance in README, img.shields.io |
| portgrid | P | Y | Y | N | Y | P | N | N | Y | Y | P | no homepage |
| samba-ad-migration | P | Y | Y | N | Y | P | N | N | Y | Y | P | no homepage |
| eero-cli | P | Y | Y | N | Y | N | N | Y | N | Y | P | no homepage |
| cyberbrief | P | Y | Y | N | Y | P | N | N | Y | Y | P | homepage vercel.app |
| proxguard | P | Y | Y | N | Y | P | N | N | Y | Y | P | homepage vercel.app |
| librenmsctrl | P | Y | Y | Y | Y | N | P | Y | Y | Y | Y | legacy banner, img.shields.io |
| adguardctrl | P | Y | Y | Y | Y | N | P | Y | Y | Y | Y | legacy banner, shieldcn |
| .github | N | P | P | N | N | N | N | N | N | N | P | org profile, no homepage/topics |

Reviewer corrections applied: proxmox-mcp item 10 is Y, the site catalog is 21 tool entries with 21 tool pages, and the org total is 27 repos.

## Phase 0: decisions (Solomon's call, then everything else unblocks)

1. Approve the owl rebrand per `docs/owl-rebrand.md`: motto swap to "The eye does not close.", de-brassed hero eye, owl org avatar, cyan as the single accent.
2. Approve porting the Escoffier `README-SPINE.md` contract into this repo as the lidless fleet README contract (same section order and proof rules, lidless identity: owl banners, dark-watch OG, cyan, lidless.dev links line).

## Phase 1: fleet kit first (this repo is the source of truth)

- Write `README-SPINE.md` (ported contract, lidless-flavored, with an Allowed deviations table seeded from the audit: cutsheet/vervet keep their own product domains).
- De-Moody pass: `README.md:34`, `DESIGN.md:19`, `og/sites.json:5`, then `npm run og`.
- Accent unification: `DESIGN.md` green to cyan, `og/template.html` 4 green spots, regenerate OG.
- Fix own README: add a banner asset, move badges off img.shields.io (the audit's one ironic finding: the kit itself fails the badge rule).
- Finalize the owl avatar from `docs/assets/owl-mark-draft.svg`, export 512 px PNG, upload as org avatar, update org description via `gh api -X PATCH orgs/lidless-labs`.
- Update `ILLUSTRATION.md`: owl = org mark + banner cast, eye = site mark + OG motif.

## Phase 2: org metadata (30 minutes with gh, no repo touches)

- Homepages: portgrid, samba-ad-migration, eero-cli, .github (4 missing).
- Topics for .github, plus a fleet-wide topics spot-check.
- Org description motto swap (Phase 1 dependency).

## Phase 3: repo READMEs, in priority order (brigade write tickets, one group per run)

1. **8 MCP repos** (misp, suricata, thehive, cortex, zeek, wazuh, mitre, proxmox): identical shape, biggest group. Banner rename to `-social-preview.jpg`, badges to shieldcn, add proof asset (Inspector `tools/list` plus one real call, per the spine proof table), normalize headers.
2. **5 ctrl repos** (jelly, n8n, immich, librenms, adguard): same treatment. These are Y on structure already, mostly banner rename + proof.
3. **Long tail** (hotwash, soc-stack, watchtower, intel-workbench, vervet, portgrid, samba-ad-migration, eero-cli, cyberbrief, proxguard): missing What it does / Install sections and links lines.
4. **Profile README** (.github): regenerate with owl header banner and new motto.

Each group run: `brigade run --worktree` with the spine contract pasted into the ticket, exact verify commands, do NOT commit. I review patches before anything lands.

## Phase 4: lidless.dev improvements (keep the eye, the best thing on the site)

From the site scout, in priority order:

1. Commit the pending `index.astro` eye improvement (scroll-driven gaze on mobile/no-cursor, smoothed glance). It is finished work sitting uncommitted.
2. Footer section links to `/#security` `/#network` `/#homelab` so they work from tool pages (`SiteFooter.astro:7`).
3. Mobile nav: category links are `hidden sm:inline` today, add a small menu (`SiteNav.astro:15`).
4. Sitemap `LASTMOD` is hardcoded 2026-06-25, make it build-time (`sitemap.xml.ts:6`).
5. Surface versions from the `VERSIONS` map consistently on cards and tool pages.
6. Rename notes on legacy slugs (jellyfin-mcp page for jellyctrl, etc.) so the page name and repo name stop confusing visitors.
7. Decide catalog treatment for the 5 uncovered repos (cutsheet, vervet, portgrid, samba-ad-migration, lidless-fleet-kit): either tool pages or an explicit "elsewhere" strip on the homepage.
8. De-Moody copy pass per `docs/owl-rebrand.md` (motto, kicker, aria-label, footer).
9. Shared copy-button helper instead of per-page scripts.
10. OG card redeploy after the fleet-kit regeneration (public/og-card.png).

## Verification

- Fleet kit: `npm test` (banner look contract) and `node bin/seo-validate.mjs`. Baseline receipt `20260703-164217-work-verify-0e79ff` is green as of this plan.
- Site: `npm run build` in lidless-site plus a visual pass on the hero eye.
- Every write run goes through `brigade work verify run` so outcomes land in the ledger.
