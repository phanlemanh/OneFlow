#!/usr/bin/env bash
# AC-2 — the four original response fields keep their name and shape.
set -euo pipefail
cd "$(dirname "$0")/../.."
fail() { echo "FAIL: $*" >&2; exit 1; }

# Destructured exactly the way the pre-existing client does.
grep -q "const { name, description, nodes, edges" src/app/api/director/route.ts \
    || fail "route.ts no longer destructures the original four fields together"

npx vitest run src/app/api/director/wire-shape.test.ts -t "AC-2" --reporter=dot >/dev/null \
    || fail "AC-2 behavioural tests did not pass"

echo "OK: name/description/nodes/edges unchanged; new fields are additive"
