# Lidless Labs Web Design System

Canonical aesthetic reference for the Lidless Labs hub site (lidless.dev) and any
future Lidless surface. The tokens here mirror `lidless-site/src/styles/global.css`;
keep the two in sync.

## Identity: the unsleeping eye

Lidless is a watch console, not a marketing page. One idea carries the brand: an
eye that never closes, keeping watch over your SOC, network, and homelab. The
surface reads like a calm, always-on monitoring console: terminal-dark ground, a
single signal-green accent, monospace labels, and quiet hairline grids.

- **Dark only.** The unsleeping eye does not switch to a day mode. There is no
  light theme; `color-scheme: dark`.
- **The eye is the logo.** An almond aperture with an iris ring, a pupil, and a
  single watch glint. It appears in the favicon, the nav, and the OG card. Do not
  redraw it ad hoc; reuse the SVG.
- **Vocabulary, used sparingly.** "Constant vigilance", "watch", "the eye", "keeps
  watch", "always on". Say it in copy; never decorate with it.

## Tokens

Defined as CSS variables in `src/styles/global.css`. Never hardcode these values
in components.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0a0a0c` | page ground |
| `--bg-panel` | `#101216` | cards, panels |
| `--bg-panel-2` | `#0d0f13` | alternating section bands, terminal panels |
| `--text` | `#d7dde3` | body text |
| `--text-muted` | `#8b95a1` | secondary text, standfirsts |
| `--text-dim` | `#5e6873` | captions, footers, mono labels |
| `--accent` | `#22c55e` | the signal green; links, kickers, the eye |
| `--accent-dim` | `#15803d` | hover borders, pressed states |
| `--accent-glow` | `color-mix(--accent 22%, transparent)` | glows, focus rings |
| `--hairline` | `#1a1e24` | borders, the console grid |
| `--hairline-strong` | `#262c34` | emphasized borders, panel edges |
| `--on-accent` | `#06140b` | text on signal-green buttons |
| `--danger` | `#ef4444` | error/red LED |
| `--warn` | `#f59e0b` | caution/amber LED |

The signal green is the only chromatic accent. Status LEDs (red/amber/green) appear
on console panels only, never as decoration on body copy.

## Typography

- **Display**: Inter Variable, weight 700-800, `letter-spacing` slightly negative.
  Headlines and the `LIDLESS` wordmark only.
- **Mono**: IBM Plex Mono 400/500/600. Labels, file paths, code, captions,
  kickers, status panels, anything machine-flavored.

No handwriting or decorative faces. This is a console.

## Section conventions

- Sections open with a mono, uppercase, letterspaced, signal-green kicker.
- Bands alternate `--bg` and `--bg-panel-2`, separated by a `--hairline` border.
- Centered display headline, then a `--text-muted` standfirst capped at a readable
  measure.
- Footer captions in mono `--text-dim`, often with `·` separators.

## Shared primitives

- **The eye SVG.** Almond aperture (`M ... Z`), iris ring, pupil, watch glint, all
  stroked/filled in signal green on the dark ground, with a soft green drop-shadow.
- **Console panel.** Dark panel (`--bg-panel`) with a `--hairline-strong` border, a
  title bar carrying three status LEDs (red/amber/green) and a mono uppercase title,
  a body of `key  value` rows (green value = ok), and a mono footer rule.
- **Tool card.** Dark panel, lifecycle badge (Active / WIP / Experimental), one-line
  description, mono repo/npm links; hover lifts the green border and glow.
- **Console grid.** A faint hairline grid + a single radial signal-green glow behind
  the page, so it reads "watch console", not "marketing page".

## Motion rules

- CSS-only. One subtle idle animation per page maximum.
- Hover states may lift or brighten a border; keep transitions near 0.25s.
- Every animation/hover transform gets a
  `@media (prefers-reduced-motion: reduce)` fallback that freezes it.

## Accessibility (WCAG AA)

- **Contrast.** On the dark ground the signal green and dim text must clear 4.5:1
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

Astro + Tailwind 4 (vite plugin), fonts via Fontsource
(`@fontsource-variable/inter`, `@fontsource/ibm-plex-mono`), deployed on Vercel.
Components are `.astro` files with scoped styles; shared tokens live in
`src/styles/global.css`.
