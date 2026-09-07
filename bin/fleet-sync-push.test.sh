#!/usr/bin/env bash
# Regression: a rejected git push must fail the sync, report zero published
# repos, keep the local commit, and never send the redeploying notification.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/fleet-sync-push.XXXXXX")"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

KIT="$TMP/kit"
SITE_NAME="lidless-site-fixture"
SITE_DIR="$TMP/$SITE_NAME"
ORIGIN="$TMP/origin.git"
STUB_BIN="$TMP/stub-bin"
NOTIFY_LOG="$TMP/agent-notify.log"

mkdir -p "$KIT/bin" "$KIT/og" "$KIT/seo" "$STUB_BIN" "$SITE_DIR/src/components" "$SITE_DIR/src/lib"

cp "$ROOT/bin/fleet-sync.sh" "$KIT/bin/fleet-sync.sh"
chmod +x "$KIT/bin/fleet-sync.sh"

cat >"$KIT/sites.config.json" <<EOF
{ "site": "$SITE_NAME" }
EOF

# No-op kit phases; seo sync below is what dirties the site for publish.
cat >"$KIT/bin/sync-versions.mjs" <<'EOF'
console.log("{}");
EOF

cat >"$KIT/og/render.mjs" <<'EOF'
EOF

cat >"$KIT/bin/seo-validate.mjs" <<'EOF'
process.exit(0);
EOF

cat >"$KIT/seo/Seo.astro" <<'EOF'
<!-- kit seo head v2 -->
EOF
cat >"$KIT/seo/seo.ts" <<'EOF'
export const seo = "kit-v2";
EOF

# agent-notify stub: record invocations, never talk to a real channel.
cat >"$STUB_BIN/agent-notify" <<EOF
#!/usr/bin/env bash
printf '%s\n' "\$*" >>"$NOTIFY_LOG"
EOF
chmod +x "$STUB_BIN/agent-notify"

NO_HOOKS="$TMP/no-hooks"
mkdir -p "$NO_HOOKS"

git_fixt() {
  # Isolated fixture git: no global hooks, no network.
  git -c core.hooksPath="$NO_HOOKS" "$@"
}

setup_site_repos() {
  rm -rf "$SITE_DIR" "$ORIGIN"
  mkdir -p "$SITE_DIR/src/components" "$SITE_DIR/src/lib"

  git_fixt init --bare -q "$ORIGIN"
  # Override global core.hooksPath so this bare remote's hooks/ actually runs.
  git_fixt -C "$ORIGIN" config core.hooksPath "$ORIGIN/hooks"
  git_fixt -C "$ORIGIN" symbolic-ref HEAD refs/heads/main

  git_fixt init -q "$SITE_DIR"
  git_fixt -C "$SITE_DIR" config core.hooksPath "$NO_HOOKS"
  git_fixt -C "$SITE_DIR" config user.email "fleet-sync-test@example.com"
  git_fixt -C "$SITE_DIR" config user.name "fleet-sync-test"
  git_fixt -C "$SITE_DIR" checkout -q -b main

  echo "tracked" >"$SITE_DIR/README.md"
  cat >"$SITE_DIR/src/components/Seo.astro" <<'EOF'
<!-- site seo head v1 -->
EOF
  cat >"$SITE_DIR/src/lib/seo.ts" <<'EOF'
export const seo = "site-v1";
EOF
  cat >"$SITE_DIR/package.json" <<'EOF'
{
  "name": "lidless-site-fixture",
  "private": true,
  "scripts": {
    "build": "mkdir -p dist && echo ok > dist/index.html"
  }
}
EOF

  git_fixt -C "$SITE_DIR" add README.md package.json src/components/Seo.astro src/lib/seo.ts
  git_fixt -C "$SITE_DIR" commit -q -m "init"
  git_fixt -C "$SITE_DIR" remote add origin "$ORIGIN"
  git_fixt -C "$SITE_DIR" push -q origin main
  git_fixt -C "$SITE_DIR" branch -q --set-upstream-to=origin/main main
}

run_sync() {
  local label="$1"
  rm -f "$NOTIFY_LOG"
  set +e
  PATH="$STUB_BIN:$PATH" "$KIT/bin/fleet-sync.sh" >"$TMP/${label}.stdout" 2>"$TMP/${label}.stderr"
  local status=$?
  set -e
  echo "$status" >"$TMP/${label}.status"
  return 0
}

assert_contains() {
  local file="$1"
  local needle="$2"
  local msg="$3"
  if ! grep -q "$needle" "$file"; then
    echo "$msg" >&2
    echo "--- file: $file ---" >&2
    cat "$file" >&2
    exit 1
  fi
}

assert_not_contains() {
  local file="$1"
  local needle="$2"
  local msg="$3"
  if grep -q "$needle" "$file"; then
    echo "$msg" >&2
    echo "--- file: $file ---" >&2
    cat "$file" >&2
    exit 1
  fi
}

# Case 1: push accepted
setup_site_repos
HEAD_BEFORE="$(git_fixt -C "$SITE_DIR" rev-parse HEAD)"
run_sync success
status="$(cat "$TMP/success.status")"
out="$TMP/success.stdout"

if [ "$status" -ne 0 ]; then
  echo "expected exit 0 on successful push, got $status" >&2
  echo "--- stdout ---"; cat "$out" >&2
  echo "--- stderr ---"; cat "$TMP/success.stderr" >&2
  exit 1
fi

assert_contains "$out" "PUSHED" "expected PUSHED on successful push"
assert_contains "$out" "done: 1 repo updated" "expected one published repo on successful push"
assert_not_contains "$out" "PUSH FAILED" "successful push should not report PUSH FAILED"

if [ ! -f "$NOTIFY_LOG" ] || ! grep -q "redeploying" "$NOTIFY_LOG"; then
  echo "expected redeploying notification after accepted push" >&2
  [ -f "$NOTIFY_LOG" ] && cat "$NOTIFY_LOG" >&2
  exit 1
fi

HEAD_AFTER="$(git_fixt -C "$SITE_DIR" rev-parse HEAD)"
if [ "$HEAD_AFTER" = "$HEAD_BEFORE" ]; then
  echo "expected a local commit after successful sync" >&2
  exit 1
fi

REMOTE_HEAD="$(git_fixt -C "$ORIGIN" rev-parse refs/heads/main)"
if [ "$REMOTE_HEAD" != "$HEAD_AFTER" ]; then
  echo "remote did not accept the sync commit" >&2
  exit 1
fi

echo "ok: push success publishes, notifies, and updates remote"

# Case 2: push rejected
setup_site_repos
HEAD_BEFORE="$(git_fixt -C "$SITE_DIR" rev-parse HEAD)"
REMOTE_BEFORE="$(git_fixt -C "$ORIGIN" rev-parse refs/heads/main)"

# Reject every update after the fixture seed push (local bare remote, no network).
mkdir -p "$ORIGIN/hooks"
cat >"$ORIGIN/hooks/pre-receive" <<'EOF'
#!/bin/sh
echo "fixture pre-receive: rejecting push" >&2
exit 1
EOF
chmod +x "$ORIGIN/hooks/pre-receive"

run_sync reject
status="$(cat "$TMP/reject.status")"
out="$TMP/reject.stdout"
err="$TMP/reject.stderr"

if [ "$status" -eq 0 ]; then
  echo "expected nonzero exit when push is rejected, got 0" >&2
  echo "--- stdout ---"; cat "$out" >&2
  echo "--- stderr ---"; cat "$err" >&2
  exit 1
fi

assert_contains "$out" "PUSH FAILED" "expected clear PUSH FAILED message"
assert_contains "$out" "done: 0 repo" "expected zero published repositories after push failure"
assert_not_contains "$out" "done: 1 repo updated" "push failure must not claim a successful update"

if [ -f "$NOTIFY_LOG" ]; then
  echo "redeploying notification must not fire when push is rejected:" >&2
  cat "$NOTIFY_LOG" >&2
  exit 1
fi

HEAD_AFTER="$(git_fixt -C "$SITE_DIR" rev-parse HEAD)"
if [ "$HEAD_AFTER" = "$HEAD_BEFORE" ]; then
  echo "local sync commit was not retained after push failure" >&2
  exit 1
fi

if ! git_fixt -C "$SITE_DIR" cat-file -t "$HEAD_AFTER" >/dev/null 2>&1; then
  echo "retained local commit object is missing" >&2
  exit 1
fi

REMOTE_HEAD="$(git_fixt -C "$ORIGIN" rev-parse refs/heads/main)"
if [ "$REMOTE_HEAD" != "$REMOTE_BEFORE" ]; then
  echo "rejected push moved origin (before=$REMOTE_BEFORE after=$REMOTE_HEAD)" >&2
  exit 1
fi
if [ "$REMOTE_HEAD" = "$HEAD_AFTER" ]; then
  echo "rejected push unexpectedly landed on origin" >&2
  exit 1
fi

sync_commits="$(git_fixt -C "$SITE_DIR" rev-list --count "${HEAD_BEFORE}..${HEAD_AFTER}")"
if [ "$sync_commits" -lt 1 ]; then
  echo "expected local commit retained after push failure, sync_commits=$sync_commits" >&2
  exit 1
fi

echo "ok: push rejection fails sync, reports zero published, suppresses notify, keeps local commit"
