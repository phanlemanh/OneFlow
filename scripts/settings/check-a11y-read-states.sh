#!/usr/bin/env bash
# E13 — the two NEW read states x two themes = four pages, scanned by axe-core
# in a real Chrome.
#
# A SEPARATE FILE from scripts/settings/check-a11y-proto.sh, deliberately. That
# script is inside the paths the previous dossier signed off on; editing it to
# add two states would move a measurement someone already accepted, and the
# next reader could not tell which evidence belonged to which sign-off. Copying
# costs one file and keeps both records readable.
#
# It carries one assertion its ancestor does not: the page must be drawn by the
# SHIPPING component. The floor is measured here, on the prototype, and a floor
# measured on a hand-copied card proves nothing about the settings screen — the
# surface the floor exists to protect. The prototype held exactly such a copy
# until the component grew a `tone`; without this check it could grow one again
# and this guard would stay green while measuring a page users never see.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# Clean up the server this script starts, and nothing else. In particular there
# is no `git checkout -- tsconfig.json`: tsconfig.json's `include` already
# pre-declares build/knsk-a11y, so Next finds its entry present and writes
# nothing. A restore would be both unnecessary and destructive — the suite runs
# in PARALLEL, so lint reads that file DURING this window.
cleanup() {
    if [ "${OWN_SERVER:-0}" -eq 1 ] && [ -n "${SERVER_PID:-}" ]; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

# SELF-CONTAINED. Defaulting to localhost:3000 and assuming somebody has a dev
# server up is invisible when run by hand and fatal when run by a fresh
# verification agent, which has none.
#
# 3196: 3197 is the previous dossier's, 3198 media-library's, 3199 onboarding's,
# 3000 the shared dev server from `_acceptance/config.yaml`.
PORT="${KNSK_A11Y_PORT:-3196}"
OWN_SERVER=0
if [ -n "${BASE_URL:-}" ]; then
    BASE="$BASE_URL"
else
    BASE="http://localhost:$PORT"
    if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
        echo "FAIL: port $PORT is already in use — set KNSK_A11Y_PORT to a free port"
        exit 1
    fi
    # Own dist dir, not the shared `.next`. Suite commands run in PARALLEL and
    # `pnpm build` is a standing suite key: a build landing while this server
    # serves DELETES the chunks it is still handing out.
    NEXT_DIST_DIR=build/knsk-a11y pnpm dev --port "$PORT" >/dev/null 2>&1 &
    SERVER_PID=$!
    OWN_SERVER=1
fi

SLUG=khong-noi-sai-ve-kho-khoa
REPORT="${REPORT_PATH:-/tmp/knsk-a11y.json}"
STATES=(settings-unauthenticated settings-unavailable)

# `theme=light` EXPLICITLY, never a bare URL. `src/app/layout.tsx` adds `.dark`
# to <html> when localStorage has no theme and the OS prefers dark; a headless
# Chrome has neither, so on a dark-set machine a bare URL renders DARK.
URLS=()
for state in "${STATES[@]}"; do
    URLS+=("$BASE/proto/$SLUG?state=$state&theme=light")
    URLS+=("$BASE/proto/$SLUG?state=$state&theme=dark")
done

# Dev compiles the route on first hit, so the first request is slow. Wait for a
# real 200 before scanning; without this the sweep races the compiler and reads
# an empty sheet as a clean one.
if [ "$OWN_SERVER" -eq 1 ]; then
    for i in $(seq 1 60); do
        if curl -sf -o /dev/null \
            "$BASE/proto/$SLUG?state=settings-unavailable&theme=light"; then
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
if [ "${#URLS[@]}" -ne "$EXPECTED" ]; then
    echo "FAIL: built ${#URLS[@]} urls, expected $EXPECTED (${#STATES[@]} states x two themes)"
    exit 2
fi

node scripts/a11y-scan.mjs "${URLS[@]}" --fail-on critical,serious --json "$REPORT"

# Read the state, the theme AND the component identity back OFF THE PAGE. A
# page count leaves all three at target when a state name is misspelled: the
# prototype's switch falls through to a real frame, the URL answers 200, and
# the guard would report a clean sweep of the same screen four times.
#
# READ FROM THE RENDERED DOM, NOT FROM `curl`. `layout.tsx` sets the root class
# from a boot script, so the served html and the painted page disagree on a
# machine whose OS prefers dark — which is every CI browser.
SNAP="$(mktemp -d)"
trap 'rm -rf "$SNAP"; cleanup' EXIT
MISSING=0
RENDERED=()
for state in "${STATES[@]}"; do
    for want in light dark; do
        url="$BASE/proto/$SLUG?state=$state&theme=$want"
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

        # The identity stamp of the shipping component. Without this, a page
        # hand-drawn to be accessible passes the scan and the floor says
        # nothing about the card users are shown.
        if ! grep -q 'data-proto-component="store-unreadable-notice"' "$snap"; then
            echo "FAIL: $url was not drawn by the shipping notice component"
            MISSING=$((MISSING + 1))
            continue
        fi

        # The ROOT class after scripts ran, not the proto route's wrapper div.
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

# Both halves present and equal — a run that produced four light pages would
# otherwise satisfy the count above.
DARK_COUNT=$(printf '%s\n' "${RENDERED[@]}" | grep -c ':dark$' || true)
LIGHT_COUNT=$(printf '%s\n' "${RENDERED[@]}" | grep -c ':light$' || true)
if [ "$DARK_COUNT" -ne "${#STATES[@]}" ] || [ "$LIGHT_COUNT" -ne "${#STATES[@]}" ]; then
    echo "FAIL: ${LIGHT_COUNT} light + ${DARK_COUNT} dark, expected ${#STATES[@]} of each"
    exit 5
fi

# DISTINCT, not just present: two rows both reading the same pair would pass
# the counts above.
DISTINCT=$(printf '%s\n' "${RENDERED[@]}" | sort -u | wc -l | tr -d ' ')
if [ "$DISTINCT" -ne "$EXPECTED" ]; then
    echo "FAIL: $DISTINCT distinct (state, theme) pairs, expected $EXPECTED"
    exit 6
fi

if [ "$MISSING" -ne 0 ]; then
    echo "FAIL: $MISSING of $EXPECTED (state, theme) pairs did not draw what they were asked for"
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
console.log(`${expected}/${expected} pages scanned AND ${expected}/${expected} rendered the state, the theme AND the shipping component`);
' "$REPORT" "$EXPECTED"
