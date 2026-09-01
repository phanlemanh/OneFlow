#!/usr/bin/env bash
# E11 — the key endpoint has exactly ONE caller outside tests.
#
# The behaviour matrix in E6/E7 proves the three surfaces handle all five read
# shapes TODAY. It cannot stop a fourth surface being written next month with a
# fourth hand-rolled fetch — and "three places each rolled their own, all three
# wrong in a different way" is the MECHANISM that produced this bug, not an
# accident of any one of them. A behavioural test guards the instances; this
# guards the shape.
#
# Measured on main @ 1d66bc2: 6 calls across 3 files. This guard is that number
# collapsed to one file, and held there.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

EXPECTED="src/lib/settings/env-client.ts"
NEEDLE='"/api/settings/env"'

# Test files are excluded on purpose: they MUST name the endpoint to stub it.
# Without this exclusion the guard would be forbidding tests, and would be red
# on a perfectly correct tree — a guard nobody can satisfy gets deleted, which
# is worse than not having one.
OFFENDERS=$(
    grep -rl -- "$NEEDLE" src/ \
        --include='*.ts' --include='*.tsx' 2>/dev/null \
        | grep -v '\.test\.tsx\?$' \
        | grep -v "^${EXPECTED}$" \
        | sort || true
)

if [ -n "$OFFENDERS" ]; then
    echo "FAIL: the key endpoint is named outside ${EXPECTED}:"
    printf '  %s\n' $OFFENDERS
    echo "Route the call through readEnvForBrowser / saveEnvKeys instead."
    exit 1
fi

# Second arm. Without it the guard is satisfied by an env-client that no longer
# names the endpoint at all — renamed, emptied, or refactored away — and a guard
# that passes because there is nothing left to find is measuring nothing.
if ! grep -q -- "$NEEDLE" "$EXPECTED"; then
    echo "FAIL: ${EXPECTED} does not name the endpoint — this guard is measuring nothing"
    exit 2
fi

echo "OK: the key endpoint has exactly one non-test caller (${EXPECTED})"
