#!/usr/bin/env bash
# E17 / AC-12 — no telemetry sink anywhere in the client or server source.
#
# BOTH halves run here, in this one command. The green half alone proves
# nothing: a scanner that matches nothing at all is green on a clean tree and
# green on a dirty one. So the guard is also pointed at a fixture that really
# does contain a beacon, a foreign-origin fetch and an analytics import, and
# THAT run must come back red. A caller who only ever sees the green half
# cannot tell a working scanner from a broken one — which is why the pair
# lives inside the eval command rather than in a human's memory.
#
# Pass a directory to scan just that directory (used by the red half below,
# and available for ad-hoc checks).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if [ "$#" -gt 0 ]; then
    exec node scripts/onboarding/telemetry-scan.mjs "$1"
fi

FIXTURE="scripts/onboarding/telemetry-fixture"

echo "== green half: the real tree must be clean =="
node scripts/onboarding/telemetry-scan.mjs

echo
echo "== red half: the teeth fixture must be caught =="
[ -d "$FIXTURE" ] || {
    echo "FAIL: teeth fixture $FIXTURE is missing — the red half cannot run,"
    echo "      so the green half above proves nothing."
    exit 1
}
if node scripts/onboarding/telemetry-scan.mjs "$FIXTURE"; then
    echo
    echo "FAIL: the scanner reported $FIXTURE clean. That directory contains a"
    echo "      sendBeacon call, a fetch to a non-app origin and an analytics"
    echo "      import. A scanner that misses them is not looking, and the"
    echo "      green verdict above is meaningless."
    exit 1
fi

echo
echo "ok — real tree clean, teeth fixture caught"
