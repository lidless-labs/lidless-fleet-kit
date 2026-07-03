# Lidless Labs: keep the name, evolve the mark

Decision draft, 2026-07-03. Grounded in a full-fleet audit (brigade run `20260703-163159-3ef0fcc6`, 6 scouts + reviewer over all 27 org repos, the site, and the brand kit).

## The decision

**Keep the name. Replace the trade dress that points at Mad-Eye Moody.**

"Lidless" is a plain dictionary word. A single word is not protectable, the domain is owned, and 27 public repos plus a live hub already carry it. Renaming would cost redirects, package names, and every banner for zero legal gain, because the exposure was never the name. It is two specific things:

1. **The motto.** "Constant Vigilance." is Mad-Eye Moody's catchphrase, verbatim, used as the org motto on the site, the OG cards, both profile READMEs, and the GitHub org description.
2. **The hero eye's costume.** The site hero draws an electric-blue iris inside a brass socket ring with a rotated mounting bolt. That is the prosthetic magical eye, drawn accurately. The comment in the source even says "brass socket".

Remove those two and what remains is a generic unsleeping eye plus a name that reads as its own thing.

## The new identity system

Three marks, one DNA, each with a clear job:

| Mark | Job | Source |
|---|---|---|
| **Great horned owl** | Org identity: GitHub avatar, profile README header, banner cast | New geometric SVG mark (avatar) + existing watercolor pipeline (banners) |
| **The lidless eye** | Site identity: hero (mouse-following, unchanged behavior), favicon, nav echo | Existing SVGs, de-brassed |
| **Dark-watch console** | Link previews | Existing `og/` pipeline, motto swapped |

The owl and the eye are not competitors: the owl is *who* watches, the eye is *the watching*. The nav mark already bridges them, and the avatar concept below reuses the same eye geometry as the owl's eyes so the system reads as one family.

This stays fully separate from Escoffier Labs: owls answer their lobsters, cyan answers their amber, dark-watch answers their cream-paper warmth. The watercolor banner medium is the only shared DNA, which `ILLUSTRATION.md` already codifies.

## Motto replacement

New motto: **"The eye does not close."**

It is already the brand's own copy (the OG card foot line and the site's closing line use it today), it is original phrasing, and it carries the exact same meaning. Surfaces to swap, from the audit:

- `lidless-site/src/lib/site.ts:4` (`SITE.motto`, feeds `index.astro:105`)
- `lidless-site/src/pages/index.astro:33` (kicker: `LIDLESS LABS · CONSTANT VIGILANCE`)
- `lidless-site/src/pages/index.astro:38` (eye aria-label)
- `lidless-site/src/pages/index.astro:174` (closing line, which already ends "The eye does not close.", so just drop the appended motto span)
- `lidless-site/src/components/SiteFooter.astro:12`
- `lidless-fleet-kit/README.md:34` and `DESIGN.md:19` (vocabulary list)
- `lidless-fleet-kit/og/sites.json:5` (motto field), then `npm run og` and redeploy `lidless-site/public/og-card.png`
- The org profile README (`lidless-labs/.github`, `profile/README.md` line 3)
- GitHub org description (ends "Constant Vigilance." today): `gh api -X PATCH orgs/lidless-labs -f description='...'`

Kicker becomes `LIDLESS LABS · THE EYE DOES NOT CLOSE`.

## De-brassing the hero eye

Keep everything people love: the dimensional eyeball, the cursor tracking, the scroll fallback (the uncommitted improvement in `index.astro` is good, commit it). Change only the costume, all in `lidless-site/src/pages/index.astro:37-64`:

- Delete the rotated bolt group (the `rotate(-34...)` line + rect at the top of the SVG).
- Replace the `brassG` gradient ring set with the nav mark's treatment: a single cyan ring on slate-navy, i.e. outer ring `var(--accent)` over `#1d2733`, drop the four brass rivets and the gold hairlines.
- Sclera and blue iris stay. A blue eye is anatomy, not Moody, once the hardware is gone.

The favicon and nav echo are already brass-free and need no art change.

## The owl mark (GitHub org avatar)

The shipped avatar is `docs/assets/owl-avatar.png`: a watercolor great horned owl portrait (gpt-image-2, text-only prompt in the `.prompt.txt` sidecar), cream paper, slate-navy ink, cyan eyes, composed to survive the circular crop and stay legible at 40 px. The geometric mark at `docs/assets/owl-mark.svg` remains as the code-rendered fallback: a great horned owl face whose two eyes are the existing lidless-eye ring geometry (same radii ratios as the nav mark).

For large surfaces (profile README header, site about section), generate a watercolor owl portrait with the existing banner pipeline DNA. Prompt seed, consistent with `banner/style.json`:

> A great horned owl in three-quarter portrait, alert and facing the viewer, prominent ear tufts, one wing resting on the back of an operator chair, painted in loose watercolor on cream paper #f5f2ea, slate-navy ink #1d2733 linework, a single cyan #38bdf8 accent in the eyes and collar shadow, no text, no dashboard, square crop, quiet negative space.

`ILLUSTRATION.md` update to record: the owl is the org mark and banner cast, the unsleeping eye is the site mark (hero, favicon, nav) and OG motif, and neither appears in the other's slot.

## Accent unification (found during audit)

The fleet has two accents in the wild: the site, SEO theme-color, and banner pipeline use cyan `#38bdf8`, while `DESIGN.md` and `og/template.html` still say signal green `#22c55e`. Unify on **cyan** as the single brand accent (it is what visitors actually see on lidless.dev). Green survives only as terminal-output flavor inside the OG console art, never as the motto/kicker color. Touches: `DESIGN.md:35`, `og/template.html` (4 spots), then regenerate OG cards.
