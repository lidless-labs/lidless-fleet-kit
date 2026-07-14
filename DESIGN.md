# Lidless Labs Web Design System

Canonical aesthetic reference for the Lidless Labs hub site (lidless.dev) and any
future Lidless surface. The tokens here mirror `lidless-site/src/styles/global.css`;
keep the two in sync.

## Identity: the unsleeping eye

Lidless is a watch console, not a marketing page. One idea carries the brand: an
eye that never closes, keeping watch over your SOC, network, and homelab. The
surface reads like a calm, always-on monitoring console: terminal-dark ground, a
single electric-blue accent, monospace labels, and quiet hairline grids.

- **Dark only.** The unsleeping eye does not switch to a day mode. There is no
  light theme; `color-scheme: dark`.
- **Two marks, one DNA.** The great horned owl is the org and fleet mark (GitHub
  avatar, repo READMEs via `marks/`, banners). The lidless eye is the site mark
  (hero, favicon, nav). They are not competitors: the owl is who watches, the eye
  is the watching, and the owl's eyes reuse the eye geometry so the family reads
  as one. Neither appears in the other's slot. Do not redraw either ad hoc. Reuse
  the SVGs. Full contract in `docs/owl-rebrand.md`.
- **Vocabulary, used sparingly.** "The eye does not close", "watch", "the eye",
  "keeps watch", "always on". Say it in copy; never decorate with it.

## Tokens

Defined as CSS variables in `src/styles/global.css`. Never hardcode these values
in components.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0a0e15` | page ground |
| `--bg-panel` | `#0d1119` | cards, panels |
| `--bg-panel-2` | `#111824` | alternating section bands, terminal panels |
| `--white` | `#f4f7fa` | headlines, the wordmark |
| `--text` | `#cdd6df` | body text |
| `--text-muted` | `#818c9b` | secondary text, standfirsts |
| `--text-dim` | `#5a6573` | captions, footers, mono labels |
| `--accent` | `#38bdf8` | the signal blue; links, kickers, the eye |
| `--accent-dim` | `#1f7fb0` | hover borders, pressed states |
| `--accent-glow` | `color-mix(--accent 22%, transparent)` | glows, focus rings |
| `--hairline` | `#1a2230` | borders, the console grid |
| `--hairline-strong` | `#232c3a` | emphasized borders, panel edges |
| `--on-accent` | `#061320` | text on accent buttons |
| `--danger` | `#ef4444` | error/red LED |
| `--warn` | `#d8a657` | caution/amber LED, WIP badges |

The signal blue `#38bdf8` is the only chromatic accent, on every Lidless surface
(site, OG cards, banners). Terminal green may appear inside console art only, as
status-LED and ok-value flavor, never as a kicker, motto, or copy color. Status
LEDs (red/amber/green) appear on console panels only, never as decoration on
body copy.

## Typography

- **Display**: Instrument Sans for body and headlines; the `LIDLESS` wordmark and
  display headings use IBM Plex Mono 600 with `letter-spacing: 0.06em`.
- **Mono**: IBM Plex Mono 400/500/600. Labels, file paths, code, captions,
  kickers, status panels, anything machine-flavored.

No handwriting or decorative faces. This is a console.

## Section conventions

- Sections open with a mono, uppercase, letterspaced, accent-blue kicker.
- Bands alternate `--bg` and `--bg-panel-2`, separated by a `--hairline` border.
- Centered display headline, then a `--text-muted` standfirst capped at a readable
  measure.
- Footer captions in mono `--text-dim`, often with `·` separators.

## Shared primitives

- **The eye SVG.** Two canonical forms, both accent blue on the dark ground: the
  ring mark (socket ring, panel, iris ring, pupil) in the favicon and nav, and the
  almond aperture (iris ring, pupil, watch glint) on the OG card. The hero eye on
  lidless.dev is the dimensional variant of the ring mark; it never carries brass,
  gold, rivets, or hardware of any kind.
- **Console panel.** Dark panel (`--bg-panel`) with a `--hairline-strong` border, a
  title bar carrying three status LEDs (red/amber/green) and a mono uppercase title,
  a body of `key  value` rows (green value = ok), and a mono footer rule.
- **Tool card.** Dark panel, lifecycle badge (Active / WIP / Experimental), one-line
  description, mono repo/npm links; hover lifts the accent border and glow.
- **Console grid.** A faint hairline grid + a single radial accent glow behind
  the page, so it reads "watch console", not "marketing page".

## Motion rules

- CSS-only. One subtle idle animation per page maximum.
- Hover states may lift or brighten a border; keep transitions near 0.25s.
- Every animation/hover transform gets a
  `@media (prefers-reduced-motion: reduce)` fallback that freezes it.

## Accessibility (WCAG AA)

- **Contrast.** On the dark ground the accent blue and dim text must clear 4.5:1
  for any text use. Use `--text-muted` (not `--text-dim`) for meaningful body text;
  `--text-dim` is for large or decorative captions only.
- **Headings descend.** One `h1` (hero), each section opens with an `h2`, cards use
  `h3`. Never skip a level.
- **Links are not color-only.** Inline accent-colored text links carry an underline;
  the wordmark and accent-background buttons are exempt.
- **The eye is decorative** where it repeats: `aria-hidden="true"`. Every meaningful
  image or icon-only control has a label.

## Content rules

- No em dashes in site copy. Use commas, periods, or a spaced hyphen.
- Never render a plausible secret, token, or private hostname, even a fake one.
  RFC 5737 addresses (`192.0.2.x`) if an IP example is unavoidable.
- Tool descriptions are one line, present tense, concrete about what the tool wires
  into an AI client.

## Stack

Astro + Tailwind 4 (vite plugin), fonts (Instrument Sans + IBM Plex Mono) via a
Google Fonts `<link>` in `BaseLayout.astro`, deployed on Vercel.
Components are `.astro` files with scoped styles; shared tokens live in
`src/styles/global.css`.
