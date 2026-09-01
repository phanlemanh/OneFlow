#!/usr/bin/env bash
# Red direction for check-live-docs-manifest-synced.sh.
#
# A guard that has never been red is indistinguishable from a guard that never
# ran: a broken fixture, a failed copy and a bare exit 127 all print the same
# green. So every mode of that guard gets perturbed here, and `healthy` proves
# the same fixture passes unperturbed -- without it, an always-red guard would
# "pass" every perturbation case.
#
# Each case asserts two things, never just the exit code: the guard exits
# non-zero, AND its message names the offending id and the offending file. A
# guard that fails with a generic sentence cannot tell a reader what to fix.
#
# Usage: check-live-docs-manifest-teeth.sh [--case <name>]

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GUARD_REL="scripts/plugins/check-live-docs-manifest-synced.sh"
ONLY=""
[ "${1:-}" = "--case" ] && ONLY="${2:-}"

WORK="$(mktemp -d)"
PROBE="$ROOT/public/plugins/zzz-teeth-probe.svg"
# The orphans mode reads the base ref through git, so its case cannot run in a
# detached copy -- it perturbs the real tree for the length of one guard call
# and the trap takes the file back out on every exit path.
trap 'rm -rf "$WORK"; rm -f "$PROBE"' EXIT

FAILED=0
KNOWN="healthy readme-missing readme-extra org-sai-chuoi-tran org-sai-muc-origin claude-stale-id orphan-them-moi"

if [ -n "$ONLY" ] && ! printf '%s\n' $KNOWN | grep -qx "$ONLY"; then
    echo "unknown case: $ONLY (known: $KNOWN)" >&2
    exit 2
fi

fresh_tree() {
    local t="$WORK/tree"
    rm -rf "$t"; mkdir -p "$t/docs" "$t/config" "$t/scripts/plugins"
    cp "$ROOT/config/official-plugins.json" "$t/config/"
    cp "$ROOT/README.md" "$ROOT/CLAUDE.md" "$t/"
    cp "$ROOT/docs/README_ZH.md" "$ROOT/docs/README_JA.md" "$t/docs/"
    cp "$ROOT/$GUARD_REL" "$t/$GUARD_REL"
    echo "$t"
}

# assert_case <name> <expect: green|red> <mode> <needle...>
assert_case() {
    local name="$1" expect="$2" mode="$3"; shift 3
    [ -n "$ONLY" ] && [ "$ONLY" != "$name" ] && return 0
    local out rc
    out="$(ROOT="$WORK/tree" bash "$WORK/tree/$GUARD_REL" "$mode" 2>&1)"; rc=$?
    if [ "$expect" = green ]; then
        if [ "$rc" -ne 0 ]; then
            echo "CASE $name: FAIL — unperturbed fixture should pass, guard exited $rc"
            printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1; return
        fi
        echo "CASE $name: PASS"; return
    fi
    if [ "$rc" -eq 0 ]; then
        echo "CASE $name: FAIL — guard stayed green on a broken tree"; FAILED=1; return
    fi
    local needle
    for needle in "$@"; do
        if ! printf '%s\n' "$out" | grep -qF -- "$needle"; then
            echo "CASE $name: FAIL — guard went red but never named '$needle'"
            printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1; return
        fi
    done
    echo "CASE $name: PASS"
}

# --- healthy: the positive control every other case depends on ---
T="$(fresh_tree)"
assert_case healthy green readme

# --- a README drops an entry the manifest registers ---
T="$(fresh_tree)"
grep -v '^- \[tongflow-api-gemini\](' "$T/docs/README_ZH.md" > "$T/docs/_z" && mv "$T/docs/_z" "$T/docs/README_ZH.md"
assert_case readme-missing red readme "tongflow-api-gemini" "docs/README_ZH.md"

# --- a README invents an entry the manifest does not have ---
T="$(fresh_tree)"
printf '\n- [tongflow-api-ghost](https://github.com/tong-io/tongflow-api-ghost) — not registered\n' >> "$T/README.md"
assert_case readme-extra red readme "tongflow-api-ghost" "README.md"

# --- org wrong on a PLAIN-STRING entry (belongs to the default org) ---
T="$(fresh_tree)"
sed -i.bak 's#\[tongflow-api-deepseek\](https://github.com/tong-io/#[tongflow-api-deepseek](https://github.com/somebody-else/#' "$T/docs/README_JA.md"
assert_case org-sai-chuoi-tran red readme "tongflow-api-deepseek" "docs/README_JA.md"

# --- org wrong on an ORIGIN entry: the fork pointed back at the upstream org.
# This is the half the whole fork policy exists for; a guard that only checked
# plain strings would stay green while a fork's README line said tong-io.
T="$(fresh_tree)"
sed -i.bak 's#\[oneflow-api-openai\](https://github.com/phanlemanh/#[oneflow-api-openai](https://github.com/tong-io/#' "$T/README.md"
assert_case org-sai-muc-origin red readme "oneflow-api-openai" "README.md"

# --- CLAUDE.md names an id the manifest has no origin entry for ---
T="$(fresh_tree)"
sed -i.bak 's#`oneflow-api-openai`#`oneflow-api-openai`, `tongflow-api-openai`#' "$T/CLAUDE.md"
assert_case claude-stale-id red claude "tongflow-api-openai" "CLAUDE.md"

# --- a new orphan icon appears (runs against the real tree; see trap) ---
if [ -z "$ONLY" ] || [ "$ONLY" = orphan-them-moi ]; then
    printf '<svg/>\n' > "$PROBE"
    out="$(bash "$ROOT/$GUARD_REL" orphans 2>&1)"; rc=$?
    rm -f "$PROBE"
    if [ "$rc" -eq 0 ]; then
        echo "CASE orphan-them-moi: FAIL — guard stayed green with a new orphan icon"; FAILED=1
    elif ! printf '%s\n' "$out" | grep -qF "zzz-teeth-probe"; then
        echo "CASE orphan-them-moi: FAIL — guard went red but never named the orphan"
        printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1
    else
        echo "CASE orphan-them-moi: PASS"
    fi
fi

[ "$FAILED" -eq 0 ] || { echo "FAIL: at least one perturbation did not turn the guard red" >&2; exit 1; }
echo "OK: the live-docs guard is red for all 6 perturbations, and green on the unperturbed fixture"
