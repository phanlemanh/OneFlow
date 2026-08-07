#!/usr/bin/env bash
# Teeth for check-gate-residual.sh.
#
# That guard forgives violations, so the only thing standing between it and
# "always green" is a test that it still refuses what it must. On 2026-08-07 it
# was generalised to forgive a FOREIGN feature that is PASS-but-unsigned — the
# fix for two features carrying residual evals deadlocking on each other's
# signature. A generalisation of a forgiveness rule is exactly where an
# over-broad edit hides, so every class is pinned here, both directions.
#
# Feeds synthetic pre-merge-check output through GATE_RESIDUAL_INPUT rather than
# manufacturing real stale features: the classification is what is under test,
# not pre-merge-check's ability to detect staleness (that is stale-scope-by-paths'
# job, and it has its own suite).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
GUARD=scripts/acceptance/check-gate-residual.sh

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
fixture="$WORK/out.txt"
fails=0

# $1 = expected outcome (green|red), $2 = label, $3 = fixture body
expect() {
    local want="$1" label="$2" body="$3"
    printf '%s\n' "$body" > "$fixture"
    if GATE_RESIDUAL_INPUT="$fixture" bash "$GUARD" mine origin/main >/dev/null 2>&1; then
        got=green
    else
        got=red
    fi
    if [ "$got" = "$want" ]; then
        echo "  ok   [$want] $label"
    else
        echo "  FAIL [expected $want, got $got] $label"
        fails=$((fails + 1))
    fi
}

SUMMARY_CLEAN='pre-merge-check: clean'
SUMMARY_V='pre-merge-check: 1 violation'

echo "check-gate-residual-teeth: classification cases"

expect green "a genuinely clean gate" \
"OK [other]: PASS, signed off by Manh 2026-08-01
$SUMMARY_CLEAN"

# --- own slug: all three unfinished-Gate-2 classes stay forgiven ---
expect green "own slug: PASS awaiting signature" \
"VIOLATION [mine]: PASS but human_signoff is empty
$SUMMARY_V"

expect green "own slug: previous round's verdict=REJECT" \
"VIOLATION [mine]: verdict=REJECT
$SUMMARY_V"

expect green "own slug: no evidence-report.md yet" \
"VIOLATION [mine]: no evidence-report.md
$SUMMARY_V"

# --- own slug: anything else is still a real failure ---
expect red "own slug: STALE evidence is never forgiven" \
"VIOLATION [mine]: evidence is stale — code changed after verify
$SUMMARY_V"

expect red "own slug: an unacknowledged bypass is never forgiven" \
"VIOLATION [mine]: bypass_used: true without bypass_ack
$SUMMARY_V"

# --- foreign slug: ONLY the awaiting-signature class is forgiven ---
expect green "foreign slug: PASS awaiting the same signature run" \
"VIOLATION [other]: PASS but human_signoff is empty
$SUMMARY_V"

expect green "foreign + own, both merely awaiting signature" \
"VIOLATION [mine]: PASS but human_signoff is empty
VIOLATION [other]: PASS but human_signoff is empty
$SUMMARY_V"

expect red "foreign slug: STALE evidence still blocks" \
"VIOLATION [other]: evidence is stale — code changed after verify
$SUMMARY_V"

expect red "foreign slug: verdict=REJECT still blocks" \
"VIOLATION [other]: verdict=REJECT
$SUMMARY_V"

expect red "foreign slug: no evidence-report.md still blocks" \
"VIOLATION [other]: no evidence-report.md
$SUMMARY_V"

expect red "foreign stale hiding behind a forgiven foreign signature wait" \
"VIOLATION [other]: PASS but human_signoff is empty
VIOLATION [third]: evidence is stale — code changed after verify
$SUMMARY_V"

# --- the refusal that predates this change must survive it ---
expect red "output that never reached a verdict line" \
"VIOLATION [other]: evidence is stale
some crash, no summary"

if [ "$fails" -ne 0 ]; then
    echo "FAIL: $fails case(s) misclassified"
    exit 1
fi
echo "OK: check-gate-residual forgives only unfinished-Gate-2 classes (own: 3, foreign: 1)"
