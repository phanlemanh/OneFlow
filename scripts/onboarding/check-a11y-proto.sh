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

# Own dist dir, not the shared `.next`. Suite commands run in PARALLEL and
# `pnpm build` is a standing suite key: a build landing while this server is
# serving deletes the chunks it is still handing out, and only PAGES die — the
# route-handler evals stay green, so the round reads like a healthy tree with a
# broken UI. scripts/media-library/check-a11y-proto.sh reached this conclusion in
# S4 round 7; this wrapper predates that finding and was still running bare.
# A SUBdirectory of build/, because the ui-check lane's own dev server takes
# build/ itself — sharing it would just move the collision from build-vs-dev to
# dev-vs-dev. build/ is gitignored recursively, so the nested name needs no rule.
NEXT_DIST_DIR=build/bko-a11y pnpm dev --port "$PORT" >/dev/null 2>&1 &
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

STATES=(missing installing provisioning ready blocked result needs-key key-verifying key-invalid key-verified)

# Ask for the light half EXPLICITLY, never a bare URL. `src/app/layout.tsx`
# adds `.dark` to <html> from a boot script when localStorage has no theme AND
# the OS prefers dark; a headless Chrome has neither, so on a dark-set machine
# a bare URL paints DARK. This guard used to build bare URLs and read nothing
# back, so on such a machine all twenty pages were dark: the ten "light" scans
# never happened, and no light-only contrast bug could ever surface. The proto
# route pins the root class when `theme` is given — see page.tsx.
URLS=()
for s in "${STATES[@]}"; do
    URLS+=("$BASE?state=$s&theme=light")
    URLS+=("$BASE?state=$s&theme=dark")
done

EXPECTED=$(( ${#STATES[@]} * 2 ))
if [ "${#URLS[@]}" -ne "$EXPECTED" ]; then
    echo "FAIL: built ${#URLS[@]} urls, expected $EXPECTED (${#STATES[@]} states x two themes)"
    exit 2
fi

# Default is the path the eval has always written, so the executor
# (`bash scripts/onboarding/check-a11y-proto.sh`, no env) behaves identically.
# The override exists so a diagnostic run can avoid writing over evidence that
# is already signed off.
REPORT="${REPORT_PATH:-_acceptance/byo-key-onboarding/evidence/design-pass/a11y.json}"

node scripts/a11y-scan.mjs "${URLS[@]}" \
    --fail-on critical,serious \
    --json "$REPORT"

# Read BOTH axes back OFF THE RENDERED PAGE. This guard previously asserted
# nothing at all beyond the scan exiting 0 — zero occurrences of
# `data-proto-state`, zero of `class="dark"` — so a renamed or deleted state
# was invisible (the URL still answers 200 and axe still scans a real page),
# and the theme was never anything but a loop variable.
#
# Read from the RENDERED DOM, not from `curl`. The `.dark` class is added by a
# client-side boot script, so `curl` and the browser see two different
# documents: the served html differs between the halves (the route wraps the
# dark one), which is exactly how a curl-based check reports "10 light + 10
# dark" for twenty pages that all painted dark. `ui-capture --html` serialises
# documentElement.outerHTML AFTER scripts run, so the root class it records is
# the one that actually decided the pixels.
SNAP="$(mktemp -d)"
trap 'rm -rf "$SNAP"; kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true' EXIT
MISSING=0
RENDERED=()
for state in "${STATES[@]}"; do
    for want in light dark; do
        url="$BASE?state=$state&theme=$want"
        snap="$SNAP/$state--$want.html"
        if ! node scripts/ui-capture.mjs "$url" "$SNAP/$state--$want.png" \
                --html "$snap" --wait 900 >/dev/null 2>&1; then
            echo "FAIL: could not render $url"
            MISSING=$((MISSING + 1))
            continue
        fi

        got=$(grep -o 'data-proto-state="[^"]*"' "$snap" \
            | head -1 | sed 's/.*="\(.*\)"/\1/')
        if [ "$got" != "$state" ]; then
            echo "FAIL: $url rendered state '${got:-<none>}', asked for '$state'"
            MISSING=$((MISSING + 1))
            continue
        fi

        # The ROOT class after scripts ran, not the route's wrapper div.
        root=$(grep -o '<html[^>]*>' "$snap" | head -1)
        case "$root" in
            *dark*) theme=dark ;;
            *) theme=light ;;
        esac
        if [ "$theme" != "$want" ]; then
            echo "FAIL: $url painted the $theme theme, asked for $want (root: $root)"
            MISSING=$((MISSING + 1))
            continue
        fi

        RENDERED+=("$state:$theme")
    done
done

DARK_COUNT=$(printf '%s\n' "${RENDERED[@]}" | grep -c ':dark$' || true)
LIGHT_COUNT=$(printf '%s\n' "${RENDERED[@]}" | grep -c ':light$' || true)
if [ "$DARK_COUNT" -ne "${#STATES[@]}" ] || [ "$LIGHT_COUNT" -ne "${#STATES[@]}" ]; then
    echo "FAIL: ${LIGHT_COUNT} light + ${DARK_COUNT} dark, expected ${#STATES[@]} of each"
    exit 5
fi

# DISTINCT, not just present: ten rows all reading `missing:light` would
# otherwise satisfy the counts above.
DISTINCT=$(printf '%s\n' "${RENDERED[@]}" | sort -u | wc -l | tr -d ' ')
if [ "$DISTINCT" -ne "$EXPECTED" ]; then
    echo "FAIL: $DISTINCT distinct (state, theme) pairs, expected $EXPECTED"
    exit 6
fi

if [ "$MISSING" -ne 0 ]; then
    echo "FAIL: $MISSING of $EXPECTED (state, theme) pairs did not draw the state they were asked for"
    exit 4
fi

node -e '
const report = require(process.argv[1]);
const expected = Number(process.argv[2]);
const scanned = Array.isArray(report.pages) ? report.pages.length : 0;
if (scanned !== expected) {
    console.error(`FAIL: scanned ${scanned}/${expected} pages — a partial sweep is not a clean one`);
    process.exit(3);
}
console.log(`${expected}/${expected} pages scanned AND ${expected}/${expected} rendered the state AND the theme they were asked for`);
' "$(cd "$(dirname "$REPORT")" && pwd)/$(basename "$REPORT")" "$EXPECTED"
