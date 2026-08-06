#!/usr/bin/env bash
# ci-vitest-sdk-pin (CI-a) — AC-12.
#
# This package changes how guards resolve their SDK pin. It must not change WHICH
# guards exist: silently editing an overlay_* executor key would rewrite
# compose-overlay's evidence trail from inside an unrelated PR. Adding new keys
# (this feature's own civ_*) is allowed; touching the existing ones is not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

BASE="${1:-origin/main}"
CFG=_acceptance/config.yaml

fail() { echo "FAIL: $*" >&2; exit 1; }

git rev-parse --verify --quiet "${BASE}^{commit}" >/dev/null \
    || fail "cannot resolve base ref '$BASE' — fetch it first (CI needs fetch-depth: 0)"

# Full key line, value included: a key that keeps its name while its command
# changes is exactly the edit this guard exists to catch.
overlay_keys() { grep -E '^\s{4}overlay_[a-z0-9_]+:' || true; }
suite_keys() { sed -n '/^  suite_keys:/,/^  [a-z]/p' || true; }

before_overlay=$(git show "${BASE}:${CFG}" | overlay_keys)
after_overlay=$(overlay_keys <"$CFG")
[ -n "$before_overlay" ] || fail "base has no overlay_* keys — refusing to report intact without looking"

if [ "$before_overlay" != "$after_overlay" ]; then
    echo "--- overlay_* keys changed vs $BASE ---" >&2
    diff <(printf '%s\n' "$before_overlay") <(printf '%s\n' "$after_overlay") >&2 || true
    fail "overlay_* executor keys were modified or removed"
fi

before_suite=$(git show "${BASE}:${CFG}" | suite_keys)
after_suite=$(suite_keys <"$CFG")
[ -n "$before_suite" ] || fail "base has no feature_loop.suite_keys block — refusing to report intact without looking"
[ "$before_suite" = "$after_suite" ] || fail "feature_loop.suite_keys changed vs $BASE"

n=$(printf '%s\n' "$after_overlay" | grep -c .)
echo "OK: $n overlay_* keys and feature_loop.suite_keys byte-identical to $BASE"
