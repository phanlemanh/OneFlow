#!/usr/bin/env bash
# AC-10 — this package ADDS; it does not rewrite existing assertions.
#
# Counts expect() in the files that existed before D0. New test files are
# excluded by name: the rule is "do not edit the old suite", not "do not write
# tests". A drifting count means an existing assertion was changed to make new
# code pass, which is the failure mode this guard exists for.
set -euo pipefail
cd "$(dirname "$0")/../.."
fail() { echo "FAIL: $*" >&2; exit 1; }

EXPECTED_TOTAL="${DWS_EXPECT_BASELINE:-240}"

PRE_EXISTING=(
    src/lib/director/compile.test.ts
    src/lib/director/director-core.test.ts
    src/lib/director/dsl.test.ts
    src/lib/director/few-shot-example.test.ts
    src/lib/director/safe-slots.test.ts
    src/lib/director/slot-node-type.test.ts
    src/lib/director/vocabulary.test.ts
    src/lib/director/classify-plan-error.test.ts
    src/app/api/director/route.test.ts
)
total=0
for f in "${PRE_EXISTING[@]}"; do
    [ -f "$f" ] || fail "pre-existing test file missing: $f"
    n=$(grep -c "expect(" "$f")
    total=$(( total + n ))
done

[ "$total" -eq "$EXPECTED_TOTAL" ] \
    || fail "expect() in pre-existing tests is $total, expected $EXPECTED_TOTAL — an existing assertion was edited"

echo "OK: $total expect() in pre-existing tests, unchanged"
