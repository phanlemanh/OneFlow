#!/usr/bin/env bash
# AC-1 — the success payload carries planJson / runId / dslVersion.
#
# SUPPRESSION half: run against the branch point and this must go RED. An
# assertion that passes on both sides of the change measures nothing.
set -euo pipefail
cd "$(dirname "$0")/../.."

fail() { echo "FAIL: $*" >&2; exit 1; }

route=src/app/api/director/route.ts
core=src/lib/director/director-core.ts

for field in planJson runId dslVersion; do
    grep -q "\b${field}\b" "$route" || fail "$route does not mention $field"
    grep -q "\b${field}\b" "$core"  || fail "$core does not carry $field"
done

# The type must actually declare them on the ok branch, not merely mention them.
grep -q "planJson: string;" "$core" || fail "DirectorResult.ok lacks planJson: string"
grep -q "dslVersion: number;" "$core" || fail "DirectorResult.ok lacks dslVersion: number"

# And the behaviour is proven by the test that exercises the route.
npx vitest run src/app/api/director/wire-shape.test.ts -t "AC-1" --reporter=dot >/dev/null \
    || fail "AC-1 behavioural tests did not pass"

echo "OK: success payload carries planJson, runId, dslVersion"
