#!/usr/bin/env bash
# Routine Lidless hub sync, designed to run headless from cron with no human in the loop.
#
# Lidless is a SINGLE hub repo (lidless-site / lidless.dev), not a fleet of subdomains,
# so this manages exactly one checkout. For that repo it:
#   1. fast-forwards the local checkout to origin/main (only if clean)
#   2. refreshes the tool VERSIONS map in src/lib/tools.ts from each tool's latest release
#   3. regenerates the OG card from the one shared dark-watch template
#   4. syncs the shared SEO head (Seo.astro + seo.ts) into the repo
#   5. builds the site and runs the SEO validator against dist/
#   6. commits and pushes only if something actually changed
#   7. prints a short summary (so an OpenClaw cron can relay it)
#
# Safe to run repeatedly: a no-op run touches nothing and pushes nothing.
set -euo pipefail

KIT="$(cd "$(dirname "$0")/.." && pwd)"
REPOS="$(cd "$KIT/.." && pwd)"
cd "$KIT" || { echo "KIT dir missing" >&2; exit 1; }

SITE=$(node -e "console.log(require('./sites.config.json').site)")
SITE_DIR="$REPOS/$SITE"

echo "== lidless-sync $(date -u +%Y-%m-%dT%H:%MZ)  ($SITE)"

if [ ! -d "$SITE_DIR/.git" ]; then
  echo "  $SITE: MISSING (.git not found at $SITE_DIR)"
  exit 1
fi

# 1. refresh checkout (only if clean, never clobber local work)
if [ -n "$(git -C "$SITE_DIR" status --porcelain)" ]; then
  echo "  pull: dirty tree, skipping"
else
  git -C "$SITE_DIR" pull --ff-only --quiet origin main 2>/dev/null \
    || git -C "$SITE_DIR" pull --ff-only --quiet origin master 2>/dev/null \
    || true
fi

# 2. version sync (writes the VERSIONS map in src/lib/tools.ts in place)
echo "== version sync"
node bin/sync-versions.mjs | tee /tmp/lidless-sync-versions.json

# 3. regenerate the OG card from the shared template
echo "== og render"
node og/render.mjs >/dev/null

# 4. sync the shared SEO head into the site. Seo.astro + seo.ts are host-agnostic
# (they read Astro.site at build time), so it is safe to overwrite. Only touch the site
# if it has already adopted the shared head (carries src/components/Seo.astro).
echo "== seo sync"
if [ -f "$SITE_DIR/src/components/Seo.astro" ]; then
  cp "$KIT/seo/Seo.astro" "$SITE_DIR/src/components/Seo.astro"
  cp "$KIT/seo/seo.ts" "$SITE_DIR/src/lib/seo.ts"
  echo "  seo head synced"
else
  echo "  seo head not adopted (no src/components/Seo.astro), skipping"
fi

# 5. build + validate SEO. A build failure aborts before any commit.
echo "== build + seo-validate"
( cd "$SITE_DIR" && npm run build >/tmp/lidless-build.log 2>&1 ) || {
  echo "  build FAILED (see /tmp/lidless-build.log); aborting before commit"
  tail -n 20 /tmp/lidless-build.log
  exit 1
}
node bin/seo-validate.mjs "$SITE_DIR/dist" || {
  echo "  seo-validate FAILED; aborting before commit"
  exit 1
}

# 6. commit + push only if something changed
echo "== publish"
if [ -z "$(git -C "$SITE_DIR" status --porcelain)" ]; then
  echo "  $SITE: no change"
  echo "== done: 0 repo(s) updated"
  exit 0
fi

if ! git -C "$SITE_DIR" add -A \
  || ! git -C "$SITE_DIR" commit --quiet -m "chore: routine sync (tool versions + preview card)"; then
  echo "  $SITE: COMMIT FAILED"
  exit 1
fi
branch=$(git -C "$SITE_DIR" rev-parse --abbrev-ref HEAD)
if git -C "$SITE_DIR" push --quiet origin "$branch" 2>/dev/null; then
  echo "  $SITE: PUSHED ($branch)"
else
  echo "  $SITE: committed, PUSH FAILED"
fi

echo "== done: 1 repo updated"

# Best-effort chat ping. Silent no-op until agent-notify has a channel configured.
if command -v agent-notify >/dev/null 2>&1; then
  agent-notify "lidless-sync: $SITE redeploying" >/dev/null 2>&1 || true
fi
