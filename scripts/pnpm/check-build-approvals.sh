#!/usr/bin/env bash
# Guard for the pnpm-build-approvals contract.
#
# One --case per acceptance criterion (standing repo rule): several criteria
# behind one exit code collapse into a single signal, and a case that was never
# implemented then looks identical to a case that passed.
#
# Usage: bash scripts/pnpm/check-build-approvals.sh --case <name>
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WS="$ROOT/pnpm-workspace.yaml"
BASE="${PNPM_APPROVALS_BASE:-origin/main}"

CASES="no-pnpm-field install-clean addon-built teeth-removed teeth-legacy-key \
ci-pnpm10 tracked-not-ignored explicit-decisions keys-intact scope-confined \
case-completeness"

die()  { echo "FAIL[$CASE]: $*" >&2; exit 1; }
pass() { echo "OK[$CASE]: $*"; exit 0; }

# Build a throwaway project that installs the repo's better-sqlite3 under a
# given pnpm-workspace.yaml body, with an isolated store so a previously built
# artifact can never be reused as a false positive.
#   $1 = dir, $2 = workspace-yaml content ("" writes no file at all), $3 = pnpm cmd
probe() {
  local dir="$1" ws="$2" pnpmcmd="$3" ver
  ver="$(node -e "process.stdout.write(require('$ROOT/package.json').dependencies['better-sqlite3'])")" \
    || die "cannot read better-sqlite3 version from package.json"
  rm -rf "$dir"; mkdir -p "$dir"
  cat > "$dir/package.json" <<EOF
{"name":"probe","version":"1.0.0","dependencies":{"better-sqlite3":"$ver"}}
EOF
  [ -n "$ws" ] && printf '%s' "$ws" > "$dir/pnpm-workspace.yaml"
  ( cd "$dir" && eval "$pnpmcmd" install --store-dir "$dir/.store" \
      --side-effects-cache=false ) > "$dir/out.txt" 2>&1
  echo "$?" > "$dir/exit.txt"
}
probe_built() { # 0 = native addon present
  [ -n "$(find "$1/node_modules" -name 'better_sqlite3.node' 2>/dev/null | head -1)" ]
}

CASE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --case) CASE="${2:-}"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$CASE" ] || { echo "usage: --case <${CASES// /|}>" >&2; exit 2; }

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

case "$CASE" in

  # AC-1 — the dead field is gone and nothing prints the migration warning.
  no-pnpm-field)
    node -e "const p=require('$ROOT/package.json');
      if ('pnpm' in p) { console.error('package.json still carries a pnpm field'); process.exit(1) }" \
      || die "package.json still declares a \`pnpm\` field"
    out="$(cd "$ROOT" && pnpm --version 2>&1)"
    printf '%s' "$out" | grep -qi 'no longer read' \
      && die "pnpm still prints the migration warning: $out"
    pass "no pnpm field in package.json; pnpm prints no migration warning"
    ;;

  # AC-2 — install completes with no ignored-builds error.
  install-clean)
    out="$(cd "$ROOT" && pnpm install 2>&1)"; rc=$?
    [ "$rc" -eq 0 ] || die "pnpm install exited $rc"
    printf '%s' "$out" | grep -q 'ERR_PNPM_IGNORED_BUILDS' \
      && die "install reported ERR_PNPM_IGNORED_BUILDS"
    printf '%s' "$out" | grep -qi 'no longer read' \
      && die "install printed the pnpm-field migration warning"
    pass "pnpm install exit 0, no ignored-builds error, no migration warning"
    ;;

  # AC-3 — the native addon exists AND actually loads.
  addon-built)
    addon="$(find "$ROOT/node_modules" -name 'better_sqlite3.node' 2>/dev/null | head -1)"
    [ -n "$addon" ] || die "better_sqlite3.node not found — build scripts did not run"
    node -e "const D=require('$ROOT/node_modules/better-sqlite3');
      const db=new D(':memory:'); db.exec('create table t(x)');
      db.prepare('insert into t values (1)').run();
      if (db.prepare('select count(*) c from t').get().c!==1) process.exit(1);" \
      || die "addon present but not loadable/usable"
    pass "native addon present and loadable ($addon)"
    ;;

  # AC-6 — TEETH: strip the approvals block and the build must stop happening.
  teeth-removed)
    probe "$TMP/on"  "$(cat "$WS")"                    "pnpm"
    probe "$TMP/off" $'# approvals deliberately removed\n' "pnpm"
    probe_built "$TMP/on"  || die "control failed: real config did not build the addon"
    probe_built "$TMP/off" && die "config is NOT load-bearing: addon built with approvals removed"
    grep -q 'ERR_PNPM_IGNORED_BUILDS' "$TMP/off/out.txt" \
      || die "approvals removed but no ERR_PNPM_IGNORED_BUILDS reported"
    pass "removing the approvals block stops the build and errors — config is load-bearing"
    ;;

  # AC-7 — TEETH: the legacy list form is a silent no-op on this pnpm major.
  teeth-legacy-key)
    major="$(pnpm --version 2>/dev/null | cut -d. -f1)"
    [ "$major" -ge 11 ] 2>/dev/null || die "expects pnpm >= 11 locally, found major '$major'"
    probe "$TMP/legacy" $'onlyBuiltDependencies:\n  - better-sqlite3\n' "pnpm"
    probe "$TMP/none"   ""                                                                     "pnpm"
    probe_built "$TMP/legacy" \
      && die "onlyBuiltDependencies DID build under pnpm $major — premise of this fix is wrong"
    probe_built "$TMP/none" && die "control built with no config at all"
    grep -q 'ERR_PNPM_IGNORED_BUILDS' "$TMP/legacy/out.txt" \
      || die "legacy key neither honoured nor reported as ignored"
    pass "legacy onlyBuiltDependencies is ignored by pnpm $major — allowBuilds is the load-bearing key"
    ;;

  # AC-8 — the same file works under the pnpm major CI pins.
  ci-pnpm10)
    pin="$(grep -A2 'pnpm/action-setup' "$ROOT/.github/workflows/ci.yml" \
           | grep -m1 'version:' | tr -dc '0-9')"
    [ -n "$pin" ] || die "cannot read the pnpm major pinned in ci.yml"
    probe "$TMP/ci" "$(cat "$WS")" "npx -y pnpm@$pin"
    probe_built "$TMP/ci" \
      || die "addon NOT built under pnpm@$pin (the CI pin) — config is local-only"
    grep -q 'ERR_PNPM_IGNORED_BUILDS' "$TMP/ci/out.txt" \
      && die "pnpm@$pin reported ignored builds"
    pass "addon built under pnpm@$pin, the major pinned in ci.yml"
    ;;

  # AC-9 — TEETH: a gitignored approvals file is invisible to CI.
  tracked-not-ignored)
    ( cd "$ROOT" && git ls-files --error-unmatch pnpm-workspace.yaml >/dev/null 2>&1 ) \
      || die "pnpm-workspace.yaml is NOT tracked by git — CI would never see it"
    if ( cd "$ROOT" && git check-ignore -q pnpm-workspace.yaml ); then
      die "pnpm-workspace.yaml is gitignored — approvals would not reach a clean checkout"
    fi
    pass "pnpm-workspace.yaml is tracked and not ignored"
    ;;

  # AC-10 — no phantom approvals, and every `false` is justified by its script.
  explicit-decisions)
    keys="$(grep -oE "^  '?[@a-zA-Z0-9/._-]+'?: (true|false)" "$WS" \
            | sed -E "s/^  '?//; s/'?: (true|false)$//")"
    [ -n "$keys" ] || die "no allowBuilds entries parsed from $WS"
    while IFS= read -r k; do
      [ -n "$k" ] || continue
      grep -q "$k@" "$ROOT/pnpm-lock.yaml" \
        || die "approval '$k' names a package absent from pnpm-lock.yaml (phantom entry)"
    done <<< "$keys"
    # Each denied package must genuinely no-op at install time.
    w="$(find "$ROOT/node_modules/.pnpm" -maxdepth 4 -type d -path '*/node_modules/@parcel/watcher' | head -1)"
    [ -n "$w" ] && { grep -q 'npm_config_build_from_source' "$w/scripts/build-from-source.js" \
      || die "@parcel/watcher denied, but its install script is not guarded by npm_config_build_from_source"; }
    g="$(find "$ROOT/node_modules/.pnpm" -maxdepth 4 -type d -path '*/node_modules/@google/genai' | head -1)"
    [ -n "$g" ] && { node -e "const s=require('$g/package.json').scripts||{};
      const hooks=['install','postinstall'].filter(h=>s[h]);
      if (hooks.length) { console.error('unexpected install hooks: '+hooks); process.exit(1) }" \
      || die "@google/genai denied, but it declares a real install/postinstall hook"; }
    pass "$(printf '%s' "$keys" | grep -c .) approvals, all resolve in the lockfile; denials justified by their scripts"
    ;;

  # AC-11 — config.yaml changes are additive only.
  keys-intact)
    d="$(cd "$ROOT" && git diff "$BASE"...HEAD -- _acceptance/config.yaml)"
    if [ -n "$d" ]; then
      removed="$(printf '%s' "$d" | grep -E '^-[^-]' || true)"
      [ -n "$removed" ] && die "config.yaml has removed/modified lines (must be additive):
$removed"
      printf '%s' "$d" | grep -qE '^\+.*suite_keys' \
        && die "feature_loop.suite_keys was touched"
    fi
    ( cd "$ROOT" && git diff --quiet "$BASE"...HEAD -- pnpm-lock.yaml ) \
      || die "pnpm-lock.yaml changed — dependency set must be untouched"
    pass "config.yaml additive only; suite_keys and lockfile untouched"
    ;;

  # AC-12 — the diff stays inside tooling config + this feature's gate artifacts.
  scope-confined)
    files="$(cd "$ROOT" && git diff --name-only "$BASE"...HEAD)"
    [ -n "$files" ] || die "empty diff against $BASE"
    bad=""
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      case "$f" in
        package.json|pnpm-workspace.yaml|.gitignore) ;;
        _acceptance/*|scripts/pnpm/*) ;;
        *) bad="$bad$f
" ;;
      esac
    done <<< "$files"
    [ -n "$bad" ] && die "out-of-scope paths in diff:
$bad"
    pass "diff confined to tooling config and this feature's gate artifacts"
    ;;

  # Meta: every declared case is implemented (guards the guard).
  case-completeness)
    missing=""
    for c in $CASES; do
      grep -qE "^  $c\)" "${BASH_SOURCE[0]}" || missing="$missing $c"
    done
    [ -n "$missing" ] && die "declared but not implemented:$missing"
    pass "all $(echo $CASES | wc -w | tr -d ' ') declared cases implemented"
    ;;

  *) echo "unknown case: $CASE (want: $CASES)" >&2; exit 2 ;;
esac
