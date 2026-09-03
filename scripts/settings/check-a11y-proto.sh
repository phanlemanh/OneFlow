#!/usr/bin/env bash
# E9 — three states x two themes = six pages, scanned by axe-core in a real
# Chrome.
#
# Copied from scripts/media-library/check-a11y-proto.sh, NOT from
# scripts/onboarding/. The media-library version sets its own NEXT_DIST_DIR;
# that is the whole reason to prefer it, and the reason is measured, not
# stylistic — see the server block below.
#
# What this asserts, and why the shape is what it is:
#
# Counting the URLs built and the pages the scan returned leaves both numbers
# at their target when a state name is misspelled or a case is deleted, because
# the prototype's switch would fall through to a real frame: the URL answers
# 200, axe scans a real page, the report counts it, and the guard prints "6/6"
# for six visits to the SAME screen. It would be measuring its own instructions
# and the fetch succeeding — never which state got drawn.
#
# So the prototype stamps `data-proto-state` on its root (an unrecognised state
# renders `unknown:<name>` instead of quietly looking like the first case), and
# this guard reads that attribute back off every page. The count that matters
# is DISTINCT states actually rendered, in both themes.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# Clean up the server this script starts, and nothing else. In particular there
# is no `git checkout -- tsconfig.json` here: tsconfig.json's `include` already
# pre-declares build/kkt-a11y, so Next finds its entry present and writes
# nothing. A restore would be both unnecessary and destructive — the suite runs
# in PARALLEL, so lint reads that file DURING this window, and a checkout would
# also throw away whatever the person running this had uncommitted there.
cleanup() {
    if [ "${OWN_SERVER:-0}" -eq 1 ] && [ -n "${SERVER_PID:-}" ]; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

# SELF-CONTAINED. Defaulting to localhost:3000 and assuming somebody has a dev
# server up is invisible when run by hand — the author always has one — and
# fatal when run by a fresh verification agent, which has none: the scan
# reaches no page and a11y-scan.mjs exits 3. A dedicated port also rules out
# the opposite failure, silently scanning somebody else's branch.
#
# 3197: 3198 is media-library's, 3199 is onboarding's, 3000 is the shared dev
# server from `_acceptance/config.yaml`.
PORT="${KKT_A11Y_PORT:-3197}"
OWN_SERVER=0
if [ -n "${BASE_URL:-}" ]; then
    BASE="$BASE_URL"
else
    BASE="http://localhost:$PORT"
    if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
        echo "FAIL: port $PORT is already in use — set KKT_A11Y_PORT to a free port"
        exit 1
    fi
    # Own dist dir, not the shared `.next`. Suite commands run in PARALLEL and
    # `pnpm build` is a standing suite key: a build landing while this server
    # serves DELETES the chunks it is still handing out. Only PAGES die — the
    # route-handler evals stay green — so the round loses its UI evidence while
    # reading like a healthy tree. A subdirectory of build/, because
    # build/aml-a11y and the ui-check lane's dev server already took the others;
    # build/ is gitignored recursively so the nested name needs no ignore rule.
    NEXT_DIST_DIR=build/kkt-a11y pnpm dev --port "$PORT" >/dev/null 2>&1 &
    SERVER_PID=$!
    OWN_SERVER=1
fi

SLUG=chong-mat-khoa-byo-giao-dien
REPORT="${REPORT_PATH:-/tmp/kkt-a11y.json}"
STATES=(store-unreadable store-unreadable-confirm panel-unreadable)

# `theme=light` EXPLICITLY, never a bare URL. `src/app/layout.tsx` adds `.dark`
# to <html> when localStorage has no theme and the OS prefers dark; a headless
# Chrome has neither, so on a dark-set machine a bare URL renders DARK. The
# proto route pins the root class when `theme` is given — see page.tsx.
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
if [ "${#URLS[@]}" -ne "$EXPECTED" ]; then
    echo "FAIL: built ${#URLS[@]} urls, expected $EXPECTED (${#STATES[@]} states x two themes)"
    exit 2
fi

node scripts/a11y-scan.mjs "${URLS[@]}" --fail-on critical,serious --json "$REPORT"

# Every state must have actually RENDERED, in both themes. This reads both axes
# back OFF THE PAGE — the half a page count cannot see. Done here rather than
# inside the scanner so the scanner stays generic.
#
# READ FROM THE RENDERED DOM, NOT FROM `curl`. That distinction is the whole
# point and it was measured on 2026-09-01. `layout.tsx` adds `.dark` to <html>
# from a boot script when localStorage is empty and the OS prefers dark, which
# is exactly the state of every CI browser. The SERVED html still differs
# between the two URLs, so a guard that greps `curl` output finds `class="dark"`
# on one and not the other, prints "3 light + 3 dark", and passes — while the
# browser axe drove painted the SAME theme both times. Three states would be
# scanned twice in dark, and dark-mode contrast is the reason this eval exists.
#
# `ui-capture --html` serialises `document.documentElement.outerHTML` AFTER
# scripts run, so the root class it records is the one that was actually
# painted. It is a second Chrome launch per page; correctness is worth it.
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

        # The ROOT class after scripts ran — `<html class="... dark ...">` — not
        # the proto route's own wrapper div. The wrapper div is what the server
        # sends; the root class is what decided the pixels.
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

# Both halves must be present and equal — a run that somehow produced six light
# pages would otherwise satisfy the count above.
DARK_COUNT=$(printf '%s\n' "${RENDERED[@]}" | grep -c ':dark$' || true)
LIGHT_COUNT=$(printf '%s\n' "${RENDERED[@]}" | grep -c ':light$' || true)
if [ "$DARK_COUNT" -ne "${#STATES[@]}" ] || [ "$LIGHT_COUNT" -ne "${#STATES[@]}" ]; then
    echo "FAIL: ${LIGHT_COUNT} light + ${DARK_COUNT} dark, expected ${#STATES[@]} of each"
    exit 5
fi

# DISTINCT, not just present: three rows all reading `store-unreadable:light`
# would pass the two counts above.
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
' "$REPORT" "$EXPECTED"
