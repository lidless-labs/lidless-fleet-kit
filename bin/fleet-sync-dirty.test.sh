#!/usr/bin/env bash
# Regression: fleet-sync must refuse a dirty site checkout before any write phase.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/fleet-sync-dirty.XXXXXX")"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

KIT="$TMP/kit"
SITE_NAME="lidless-site-fixture"
SITE_DIR="$TMP/$SITE_NAME"
PHASE_MARKER="$TMP/phase-ran"

mkdir -p "$KIT/bin" "$KIT/og" "$KIT/seo" "$SITE_DIR/src/components" "$SITE_DIR/src/lib"

cp "$ROOT/bin/fleet-sync.sh" "$KIT/bin/fleet-sync.sh"
chmod +x "$KIT/bin/fleet-sync.sh"

cat >"$KIT/sites.config.json" <<EOF
{ "site": "$SITE_NAME" }
EOF

# Stubs for later phases. If any runs, the marker proves the early exit failed.
cat >"$KIT/bin/sync-versions.mjs" <<EOF
import { appendFileSync } from "node:fs";
appendFileSync(process.env.PHASE_MARKER, "version\n");
console.log("{}");
EOF

cat >"$KIT/og/render.mjs" <<EOF
import { appendFileSync } from "node:fs";
appendFileSync(process.env.PHASE_MARKER, "og\n");
EOF

cat >"$KIT/bin/seo-validate.mjs" <<EOF
import { appendFileSync } from "node:fs";
appendFileSync(process.env.PHASE_MARKER, "seo-validate\n");
EOF

cat >"$KIT/seo/Seo.astro" <<'EOF'
<!-- fixture seo -->
EOF
cat >"$KIT/seo/seo.ts" <<'EOF'
export {};
EOF

# Minimal site checkout with one committed file, then an unrelated dirty edit.
git -C "$SITE_DIR" init -q
git -C "$SITE_DIR" config user.email "fleet-sync-test@example.com"
git -C "$SITE_DIR" config user.name "fleet-sync-test"
echo "tracked" >"$SITE_DIR/README.md"
touch "$SITE_DIR/src/components/Seo.astro"
mkdir -p "$SITE_DIR/src/lib"
echo "export {};" >"$SITE_DIR/src/lib/seo.ts"
git -C "$SITE_DIR" add README.md src/components/Seo.astro src/lib/seo.ts
git -C "$SITE_DIR" commit -q -m "init"
echo "local-only edit" >"$SITE_DIR/unrelated-dirty.txt"
HEAD_BEFORE="$(git -C "$SITE_DIR" rev-parse HEAD)"

set +e
PHASE_MARKER="$PHASE_MARKER" "$KIT/bin/fleet-sync.sh" >"$TMP/stdout.txt" 2>"$TMP/stderr.txt"
status=$?
set -e

if [ "$status" -eq 0 ]; then
  echo "expected nonzero exit for dirty tree, got 0" >&2
  echo "--- stdout ---"; cat "$TMP/stdout.txt" >&2
  echo "--- stderr ---"; cat "$TMP/stderr.txt" >&2
  exit 1
fi

if ! grep -q "dirty tree" "$TMP/stderr.txt" "$TMP/stdout.txt"; then
  echo "expected a clear dirty-tree message" >&2
  echo "--- stdout ---"; cat "$TMP/stdout.txt" >&2
  echo "--- stderr ---"; cat "$TMP/stderr.txt" >&2
  exit 1
fi

if [ -f "$PHASE_MARKER" ]; then
  echo "later sync phase ran despite dirty tree:" >&2
  cat "$PHASE_MARKER" >&2
  exit 1
fi

if [ -n "$(git -C "$SITE_DIR" diff --cached --name-only)" ]; then
  echo "dirty tree was staged:" >&2
  git -C "$SITE_DIR" diff --cached --name-only >&2
  exit 1
fi

if [ "$(git -C "$SITE_DIR" rev-parse HEAD)" != "$HEAD_BEFORE" ]; then
  echo "HEAD moved; dirty tree was committed" >&2
  exit 1
fi

if [ ! -f "$SITE_DIR/unrelated-dirty.txt" ]; then
  echo "unrelated dirty file disappeared" >&2
  exit 1
fi

if ! git -C "$SITE_DIR" status --porcelain | grep -q "unrelated-dirty.txt"; then
  echo "unrelated dirty file is no longer dirty in the site checkout" >&2
  git -C "$SITE_DIR" status --porcelain >&2
  exit 1
fi

echo "ok: fleet-sync refuses dirty site checkout before any write"
