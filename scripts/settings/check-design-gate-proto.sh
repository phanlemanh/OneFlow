#!/usr/bin/env bash
# E10 — the REFERENCE measurement over the same 3 x 2 matrix as E9.
#
# What this is NOT: an accessibility gate. design-gate runs under jsdom, which
# cannot parse Tailwind v4 — measured on this repo 2026-08-31: 188 cssRules
# resolved out of 153KB of inlined CSS, so every element reads as black text on
# a transparent background. Its whole rule set is three aesthetic slop
# detectors. Per AC-14, the criterion FAILS when the axe sweep (E9) is not PASS,
# regardless of what this says.
#
# Self-contained, for the same reason E9 is: the first attempt drove this eval
# through the harness's capture plumbing, the target never arrived, and the gate
# answered "no target file given" with exit 4 — an args mistake that read like a
# product failure. A command that captures its own input can be reproduced by
# hand, and cannot fail for a reason that has nothing to do with the tree.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

cleanup() {
    if [ "${OWN_SERVER:-0}" -eq 1 ] && [ -n "${SERVER_PID:-}" ]; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    rm -rf "${SNAP:-}"
}
trap cleanup EXIT

PORT="${KKT_GATE_PORT:-3196}"
OWN_SERVER=0
if [ -n "${BASE_URL:-}" ]; then
    BASE="$BASE_URL"
else
    BASE="http://localhost:$PORT"
    if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
        echo "FAIL: port $PORT is already in use — set KKT_GATE_PORT to a free port"
        exit 1
    fi
    # Own dist dir, same reasoning as the a11y guard: `pnpm build` is a standing
    # suite key running in PARALLEL, and a build landing mid-run deletes the
    # chunks this server is handing out.
    NEXT_DIST_DIR=build/kkt-gate pnpm dev --port "$PORT" >/dev/null 2>&1 &
    SERVER_PID=$!
    OWN_SERVER=1
fi

SLUG=chong-mat-khoa-byo-giao-dien
STATES=(store-unreadable store-unreadable-confirm panel-unreadable)
SNAP="$(mktemp -d)"
GATE="$(ls "$HOME"/.claude/plugins/cache/*/acceptance-gate/*/scripts/design-gate.mjs | sort -V | tail -1)"

if [ "$OWN_SERVER" -eq 1 ]; then
    for i in $(seq 1 60); do
        if curl -sf -o /dev/null "$BASE/proto/$SLUG?state=store-unreadable&theme=light"; then
            break
        fi
        if [ "$i" -eq 60 ]; then
            echo "FAIL: dev server never served the proto route on port $PORT"
            exit 3
        fi
        sleep 2
    done
fi

EXPECTED=$(( ${#STATES[@]} * 2 ))
SCANNED=0
FAILURES=0
for state in "${STATES[@]}"; do
    for theme in light dark; do
        url="$BASE/proto/$SLUG?state=$state&theme=$theme"
        html="$SNAP/$state--$theme.html"
        if ! node scripts/ui-capture.mjs "$url" "$SNAP/$state--$theme.png" \
                --html "$html" --wait 900 >/dev/null 2>&1; then
            echo "FAIL: could not capture $url"
            FAILURES=$((FAILURES + 1))
            continue
        fi
        # The same read-back the a11y guard does. Without it a capture that
        # silently fell back to another state would still be graded, and the
        # count would still reach six.
        got=$(grep -o 'data-proto-state="[^"]*"' "$html" | head -1 | sed 's/.*="\(.*\)"/\1/')
        if [ "$got" != "$state" ]; then
            echo "FAIL: $url rendered state '${got:-<none>}', asked for '$state'"
            FAILURES=$((FAILURES + 1))
            continue
        fi

        out="$SNAP/$state--$theme.gate.json"
        node "$GATE" --jsdom . "$html" >"$out" 2>/dev/null || true
        verdict=$(node -e '
            try {
                const r = require(process.argv[1]);
                console.log(r.verdict ?? "NO-VERDICT");
            } catch { console.log("UNREADABLE"); }
        ' "$out")
        if [ "$verdict" != "PASS" ]; then
            echo "FAIL: $state/$theme design-gate verdict $verdict"
            node -e 'try{const r=require(process.argv[1]);console.log("   ",JSON.stringify(r.findings??r.reason??r));}catch{}' "$out"
            FAILURES=$((FAILURES + 1))
            continue
        fi
        SCANNED=$((SCANNED + 1))
    done
done

if [ "$FAILURES" -ne 0 ] || [ "$SCANNED" -ne "$EXPECTED" ]; then
    echo "FAIL: $SCANNED/$EXPECTED frames passed the reference gate ($FAILURES failure(s))"
    exit 2
fi
echo "$EXPECTED/$EXPECTED frames PASS the reference slop gate (NOT an a11y result — see E9)"
