#!/usr/bin/env bash
# E24 — ten states x two themes = twenty pages.
#
# What this asserts, and why it changed:
#
# The first version counted the URLs it built and the pages the scan returned.
# Both stay at their target when a state name is misspelled or a case is
# deleted, because the prototype's switch fell through to the idle frame: the
# URL answers 200, axe scans a real page, the report counts it, and the guard
# prints "16/16" for sixteen visits to the SAME screen. It measured its own
# instructions and the fetch succeeding — never which state got drawn.
#
# So the prototype now stamps `data-proto-state` on its root (and an
# unrecognised state renders `unknown:<name>` instead of quietly looking idle),
# and this guard reads that attribute back off every page. The count that
# matters is DISTINCT states actually rendered.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# Clean up the server this script starts, and nothing else.
#
# There used to be a `git checkout -- tsconfig.json` here, because Next rewrote
# that file whenever the live dist dir was missing from `include`. Two things
# were wrong with it. It could not work: the suite runs in parallel, so lint
# reads the file DURING the window, not after it — which is how S4 round 8 went
# red. And it was destructive: a `git checkout` on a tracked file throws away
# whatever the person running this had uncommitted there, to fix a mess this
# script made.
#
# The cause is gone instead. tsconfig.json's `include` now pre-declares every
# dist dir this repo's tooling uses, so Next finds its entry already present
# and writes nothing — measured across `.next`, `build` and `build/aml-a11y`,
# sha1 unchanged in all three. With nothing to undo, an undo that can eat the
# user's work has no reason to exist.
cleanup() {
    if [ "${OWN_SERVER:-0}" -eq 1 ] && [ -n "${SERVER_PID:-}" ]; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

# SELF-CONTAINED, like scripts/onboarding/check-a11y-proto.sh.
#
# This used to default to localhost:3000 and assume somebody had a dev server
# up. Run by hand that is invisible — the author always has one. Run by a fresh
# verification agent there is none, so the scan reached no page and the script
# exited 3 (S4 round 7). Exit 3 was the right ANSWER; the question was wrong.
# An eval that only passes on the machine that wrote it measures the machine.
#
# So boot a server on a port of our own and tear it down on the way out. A
# dedicated port also rules out the opposite failure: silently scanning
# somebody else's server, running somebody else's branch.
#
# BASE_URL still wins, so a human debugging can point this at a server they
# are already watching.
PORT="${AML_A11Y_PORT:-3198}"
OWN_SERVER=0
if [ -n "${BASE_URL:-}" ]; then
    BASE="$BASE_URL"
else
    BASE="http://localhost:$PORT"
    if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
        echo "FAIL: port $PORT is already in use — set AML_A11Y_PORT to a free port"
        exit 1
    fi
    # Own dist dir, not the shared `.next`. Suite commands run in PARALLEL, and
    # `pnpm build && pnpm typecheck` is a standing suite key: a build landing
    # while this server serves deletes the chunks it is still handing out, and
    # only PAGES die — the route-handler evals stay green, so the round reads
    # like a healthy tree with a broken UI. next.config.ts measured all three
    # arms and named this exact opt-out; the tsconfig restore below is the
    # cleanup that opt-out requires, and it outlived the flag it cleaned up
    # after (S4 round 7 red: `pnpm build && pnpm typecheck` exit 1).
    #
    # A SUBdirectory of build/, not build/ itself: the ui-check lane's own dev
    # server takes build/, so sharing it would just move the collision from
    # build-vs-dev to dev-vs-dev. build/ is gitignored recursively, so the
    # nested name needs no ignore rule of its own.
    NEXT_DIST_DIR=build/aml-a11y pnpm dev --port "$PORT" >/dev/null 2>&1 &
    SERVER_PID=$!
    OWN_SERVER=1
fi
REPORT="${REPORT_PATH:-/tmp/aml-a11y.json}"
STATES=(missing-config idle searching results thin-shelf unranked importing imported error version-mismatch)

URLS=()
for state in "${STATES[@]}"; do
    URLS+=("$BASE/proto/add-media-library?state=$state&theme=light")
    URLS+=("$BASE/proto/add-media-library?state=$state&theme=dark")
done

# Dev compiles the route on first hit, so the first request is slow. Wait for
# a real 200 before scanning; without this the sweep races the compiler and
# reads an empty sheet as a clean one.
if [ "$OWN_SERVER" -eq 1 ]; then
    for i in $(seq 1 60); do
        if curl -sf -o /dev/null "$BASE/proto/add-media-library?state=idle"; then
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

# Every state must have actually RENDERED, in both themes. Fetch each page and
# read the state it stamped on itself — this is the half the page count cannot
# see. Done here rather than inside the scanner so the scanner stays generic.
# Both axes have to be read back off the page, not assumed from the URL.
#
# Reading `data-proto-state` fixed only the STATE axis. The theme axis was still
# just the loop variable: each state was fetched twice, and both times the only
# comparison was against the state name. If the dark wrapper broke — the class
# renamed, the `theme` param dropped — the ten "dark" URLs would be ten more
# scans of the LIGHT page, every check would still pass, and the guard would
# print "20/20 rendered the state they were asked for". Contrast violations in
# dark mode are exactly the failure this eval cites as its reason to exist.
#
# And reading it from `curl` was not enough either — that was the third gap,
# measured 2026-09-01. `src/app/layout.tsx` adds `.dark` to <html> from a boot
# script when localStorage has no theme AND the OS prefers dark, which is the
# state of every headless browser. The SERVED html still differs between the
# two URLs (the route wraps the dark half in a div), so grepping the curl body
# for `class="dark"` found it on one and not the other, printed "10 light + 10
# dark", and passed — while the browser axe drove painted DARK both times. Ten
# states were scanned twice in dark and never once in light, which is why a
# light-only contrast bug could sit here indefinitely.
#
# `ui-capture --html` serialises documentElement.outerHTML AFTER scripts run,
# so the root class it records is the one that actually decided the pixels.
# It costs a second Chrome launch per page; correctness is worth it.
SNAP="$(mktemp -d)"
trap 'rm -rf "$SNAP"; cleanup' EXIT
MISSING=0
RENDERED=()
for state in "${STATES[@]}"; do
    for want in light dark; do
        url="$BASE/proto/add-media-library?state=$state&theme=$want"
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

        # The ROOT class after scripts ran — not the route's own wrapper div.
        # The wrapper is what the server sends; the root class is what painted.
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

# Both halves must be present and equal — a run that somehow produced twenty
# light pages would otherwise satisfy the count above.
DARK_COUNT=$(printf '%s\n' "${RENDERED[@]}" | grep -c ':dark$' || true)
LIGHT_COUNT=$(printf '%s\n' "${RENDERED[@]}" | grep -c ':light$' || true)
if [ "$DARK_COUNT" -ne "${#STATES[@]}" ] || [ "$LIGHT_COUNT" -ne "${#STATES[@]}" ]; then
    echo "FAIL: ${LIGHT_COUNT} light + ${DARK_COUNT} dark, expected ${#STATES[@]} of each"
    exit 5
fi

# DISTINCT, not just present: ten rows all reading `idle:light` plus ten all
# reading `idle:dark` would satisfy both counts above.
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
