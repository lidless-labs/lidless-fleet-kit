# Security Policy

## Supported versions

lidless-fleet-kit is early-stage. Only the latest commit on the `main` branch receives fixes. Pin to a commit if you need a known-good version.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems. Email **me@solomonneas.dev** with: <!-- content-guard: allow pii/email -->

- A short description of the issue.
- Steps to reproduce (or a minimal proof of concept).
- The commit you tested against.
- Whether you would like to be credited in the release notes.

You should get an acknowledgment within 72 hours. If you do not, please follow up - the mail may have been filtered.

## In scope

- Code execution or path-traversal flaws in `og/render.mjs`, `banner/build-prompt.mjs`, `banner/crop-bands.py`, or `bin/*`.
- A banner brief or OG copy that leaks credentials, tokens, hostnames, or personal data into a generated prompt, card, or committed asset.
- `bin/fleet-sync.sh` pushing or building something it should not, or running outside the configured site checkout.
- The SEO head (`seo/Seo.astro`, `seo/seo.ts`) emitting a value that exposes private infrastructure.

## fleet-sync runs git and a build

`bin/fleet-sync.sh` pulls a site checkout, runs `npm run build`, and (only when something changed) commits and pushes. Treat it as automation that runs on your machine with your git credentials:

- It is meant to run unattended on a timer. Point it only at checkouts you own.
- A dirty working tree skips the pull, so it never clobbers local work, but it will still commit and push generated changes. Review `sites.config.json` before wiring it to a schedule.
- Banner generation is **text-only**: `banner/build-prompt.mjs` emits a prompt string. It never calls an image model, fetches a URL, or stores a key. The content-safety clause in `banner/style.json` keeps real IPs, hostnames, and PII out of prompts (placeholders and 192.0.2.x example IPs only).

## Out of scope

- Bugs in Playwright, Astro, or the image model used to render banners - report those upstream.
- Issues that require an attacker to already have write access to the machine, the site checkout, or the GitHub org.
- The aesthetic content of a generated banner.

## Disclosure

We aim to ship a fix within 14 days of confirming a valid report. A coordinated disclosure timeline can be negotiated for issues that need longer.
