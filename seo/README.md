# Lidless SEO contract

One canonical `<head>` for the Lidless Labs hub site (lidless.dev), so the head
never drifts and every new page starts SEO-correct. Pairs with the OG card pipeline
in `../og/` and the tool-version sync in `../bin/`.

Lidless is a single hub repo, so this is one site's contract rather than a fleet's.
The files keep the shape of the Escoffier fleet contract they derive from, so the
two kits stay structurally identical and the `skillet:seo-fleet` skill still applies.

## Files (source of truth)

| File | Copied into the site as | Role |
|------|-------------------------|------|
| `seo.ts` | `src/lib/seo.ts` | Constants + JSON-LD builders + canonical/title helpers |
| `Seo.astro` | `src/components/Seo.astro` | The shared `<head>` (title, meta, OG, Twitter, JSON-LD, theme-color) |
| `robots.txt.tmpl` | `public/robots.txt` (host filled in) | Allow-all + correct sitemap line |

Do **not** edit the copies inside the site repo. Edit here and run `bin/fleet-sync.sh`,
which overwrites the copy in the site (it copies whenever the site carries
`src/components/Seo.astro`).

## Decisions baked in (2026-06)

- **Twitter/X:** `@solomonneas` (site + creator).
- **trailingSlash:** `'never'`. `canonicalFor()` strips the trailing slash (and any
  `index.html`/`.html`), so canonical, og:url and sitemap all agree on the no-slash form.
  Set `trailingSlash: 'never'` in `astro.config.mjs`; leave `build.format` at the
  default `directory` (Vercel clean-URLs serve it; `format:'file'` breaks
  `Astro.url.pathname`).
- **OG card:** 2400x1260 (matches `og/render.mjs`); dimensions emitted so the card
  renders instantly on first share.
- **Theme color:** dark `#0a0a0c` / light `#22c55e` (the dark-watch palette, see
  `../DESIGN.md`). Lidless is dark-only, so the light value is just the signal green.
- **Dev/preview auto-noindex** so Vercel preview deploys never get indexed.
- **GEO stance:** llms.txt + schema show near-zero AI-citation lift (Ahrefs 2026), so we
  ship them cheaply and spend real effort on fresh/chunked content + `markdownAlt`.

## Adopt (already done on lidless-site; recipe for reference)

1. `astro.config.mjs`: set `site: 'https://lidless.dev'` and `trailingSlash: 'never'`.
2. Copy `seo.ts` -> `src/lib/seo.ts` and `Seo.astro` -> `src/components/Seo.astro`
   (or run `bin/fleet-sync.sh` once the files exist).
3. In `BaseLayout.astro`, keep `<meta charset>`, viewport, favicon, analytics and the
   theme-init script; replace the hand-rolled title/meta/OG/Twitter/JSON-LD block with:

   ```astro
   ---
   import Seo from '../components/Seo.astro';
   import { SITE, EXTERNAL } from '../lib/site.ts';
   import { composeTitle, softwareApplicationLd, organizationLd, absoluteImage, graph } from '../lib/seo.ts';

   const { title: pageTitle, description = SITE.metaDescription ?? SITE.description } = Astro.props;
   const title = composeTitle(pageTitle, SITE.seoTitle);
   const siteUrl = (Astro.site ?? new URL(SITE.url)).toString();
   const jsonLd = graph([
     organizationLd(),
     softwareApplicationLd({
       name: SITE.name, siteUrl, description, image: absoluteImage(siteUrl),
       codeRepository: EXTERNAL.github, softwareVersion: SITE.version,
     }),
   ]);
   ---
   <head>
     <meta charset="utf-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1" />
     <Seo siteName={SITE.name} title={title} description={description} jsonLd={jsonLd} />
     <link rel="icon" href="/favicon.svg" />
     <!-- analytics + theme-init script stay here -->
   </head>
   ```

4. The **hub home page** uses `graph([organizationLd(), websiteLd(name, url)])` (it
   markets the brand). Each tool page uses `softwareApplicationLd` for that one tool.
5. Build and confirm with `node ../bin/seo-validate.mjs ../../lidless-site/dist`:
   exactly one of each meta tag, canonical has no trailing slash, JSON-LD parses.

The `skillet:seo-fleet` skill automates steps 1-5 and audits the repo against this contract.
