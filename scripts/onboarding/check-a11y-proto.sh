#!/usr/bin/env bash
# E19 / AC-13 — axe-core in real Chrome across all 10 onboarding proto states
# x light+dark (20 pages), zero critical/serious violations.
#
# SELF-CONTAINED: boots its own dev server on a dedicated port and tears it
# down, so the eval does not depend on whoever else has a server running.
# a11y-scan.mjs exits 3 when it reaches no page, so a server that failed to
# boot reads as a failure, never as a clean sheet.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

PORT="${BKO_A11Y_PORT:-3199}"
BASE="http://localhost:$PORT/proto/byo-key-onboarding"

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "FAIL: port $PORT is already in use — set BKO_A11Y_PORT to a free port"
    exit 1
fi

pnpm dev --port "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true' EXIT

# Wait for the proto route to actually compile and answer (dev compiles on
# first hit; the first request can take a while).
for i in $(seq 1 60); do
    if curl -sf -o /dev/null "$BASE?state=missing"; then
        break
    fi
    if [ "$i" -eq 60 ]; then
        echo "FAIL: dev server never served the proto route on port $PORT"
        exit 1
    fi
    sleep 2
done

URLS=()
for s in missing installing provisioning ready blocked result needs-key key-verifying key-invalid key-verified; do
    URLS+=("$BASE?state=$s")
    URLS+=("$BASE?state=$s&theme=dark")
done

node scripts/a11y-scan.mjs "${URLS[@]}" \
    --fail-on critical,serious \
    --json _acceptance/byo-key-onboarding/evidence/design-pass/a11y.json
