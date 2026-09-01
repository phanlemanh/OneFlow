#!/usr/bin/env bash
# Teeth for check-one-env-reader.sh.
#
# A guard is only worth its green if it can go red. This perturbs a COPY of the
# tree two ways and fails if the guard survives either — the same discipline the
# dossier applies to every other measurement it ships.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GUARD="scripts/settings/check-one-env-reader.sh"

FAILURES=0
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

expect_exit() {
    local want="$1" name="$2" tree="$3"
    set +e
    (cd "$tree" && bash "$GUARD" >"$WORK/out.txt" 2>&1)
    local got=$?
    set -e
    if [ "$got" -ne "$want" ]; then
        echo "TEETH FAIL: case '$name' exited $got, expected $want"
        sed 's/^/    /' "$WORK/out.txt"
        FAILURES=$((FAILURES + 1))
    else
        echo "ok   case '$name' exited $want"
    fi
    printf '%s' "$(cat "$WORK/out.txt")" > "$WORK/last.txt"
}

fresh_tree() {
    local dst="$WORK/$1"
    rm -rf "$dst"
    mkdir -p "$dst"
    cp -R "$ROOT/src" "$dst/src"
    mkdir -p "$dst/scripts/settings"
    cp "$ROOT/$GUARD" "$dst/$GUARD"
    printf '%s' "$dst"
}

# Baseline: the real tree must be green, or the two cases below prove nothing.
expect_exit 0 "unperturbed tree is green" "$(fresh_tree base)"

# Case 1 — a fourth surface rolls its own fetch.
T1="$(fresh_tree case1)"
printf '\nconst leak = await fetch("/api/settings/env");\n' \
    >> "$T1/src/components/workspace/nodes/base/abi-node-shell.tsx"
expect_exit 1 "a second non-test caller is rejected" "$T1"
if ! grep -q "abi-node-shell" "$WORK/last.txt"; then
    echo "TEETH FAIL: case 1 did not NAME the offending file"
    FAILURES=$((FAILURES + 1))
else
    echo "ok   case 'a second non-test caller' named the offending file"
fi

# Case 2 — the reader stops naming the endpoint, so there is nothing to find.
T2="$(fresh_tree case2)"
: > "$T2/src/lib/settings/env-client.ts"
expect_exit 2 "an emptied reader is rejected" "$T2"

if [ "$FAILURES" -ne 0 ]; then
    echo "FAIL: $FAILURES teeth case(s) did not bite"
    exit 1
fi
echo "OK: guard bites on both perturbations and is green on the real tree"
