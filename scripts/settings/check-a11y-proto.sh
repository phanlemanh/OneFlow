#!/usr/bin/env bash
# AC-14 — axe-core in real Chrome across the three chong-mat-khoa-byo proto
# states x light+dark (6 pages), zero critical/serious violations.
#
# Why axe and not the design gate: `executors.design.gate` runs under jsdom,
# and jsdom cannot parse this app's Tailwind v4 stylesheets — measured
# 2026-08-31 on these very captures, 188 cssRules resolved out of 153KB, with
# every element reading back as black text on a transparent background. Its
# P0 count is therefore not evidence about contrast; it is a slop detector
# (cramped padding, nested cards, gradient text) and this contract treats it
# as exactly that. Real contrast, focus order and accessible names need a real
# browser, which is what this script boots.
#
# SELF-CONTAINED: boots its own dev server on a dedicated port and tears it
# down, so the eval does not depend on whoever else has a server running.
# a11y-scan.mjs exits 3 when it reaches no page, so a server that failed to
# boot reads as a failure, never as a clean sheet.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

PORT="${BYO_A11Y_PORT:-3198}"
BASE="http://localhost:$PORT/proto/chong-mat-khoa-byo"

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "FAIL: port $PORT is already in use — set BYO_A11Y_PORT to a free port"
    exit 1
fi

pnpm dev --port "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true' EXIT

# Wait for the proto route to actually compile and answer (dev compiles on
# first hit; the first request can take a while).
for i in $(seq 1 60); do
    if curl -sf -o /dev/null "$BASE?state=store-unreadable"; then
        break
    fi
    if [ "$i" -eq 60 ]; then
        echo "FAIL: dev server never served the proto route on port $PORT"
        exit 1
    fi
    sleep 2
done

URLS=()
for s in store-unreadable store-unreadable-confirm panel-unreadable; do
    URLS+=("$BASE?state=$s")
    URLS+=("$BASE?state=$s&theme=dark")
done

node scripts/a11y-scan.mjs "${URLS[@]}" \
    --fail-on critical,serious \
    --json _acceptance/chong-mat-khoa-byo/evidence/design-pass/a11y.json
