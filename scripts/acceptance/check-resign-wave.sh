#!/usr/bin/env bash
# Usage: check-resign-wave.sh <slug> [base-ref]
#
# "Has this branch's re-signature wave cleared?" — i.e. does any OTHER signed
# feature still carry evidence that predates this branch's code?
#
# That is a narrower question than check-gate-residual.sh's "is the gate clear
# apart from me", and the difference is what makes it answerable. Verify round 1
# of local-cpu-plugins (2026-08-07) showed the wider question is unreachable
# whenever TWO features are in flight at once: `lcp_resign_wave` and
# ci-vitest-sdk-pin's `civ_gate_residual` each demanded the other be finished,
# and both are `script` evals, so neither could be released by human_override.
# Generalising check-gate-residual to forgive a foreign PASS-awaiting-signature
# broke most of the knot but not the last strand — a foreign feature whose
# verdict is REJECT *because of this very deadlock* still blocked.
#
# Staleness is the whole of the wave. Another feature's pending signature, or
# its in-flight verdict, is not evidence that this branch broke anything — it is
# evidence that the same reviewer has more than one thing to sign. Those belong
# to check-gate-residual.sh and to the Gate-2 checklist; they are deliberately
# NOT asserted here.
#
# What this still refuses, and must: any other feature whose evidence is stale.
# That is exactly the cost this branch imposed, and the thing AC-17 exists to
# make visible rather than assumed away.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

SLUG="${1:?usage: check-resign-wave.sh <slug> [base-ref]}"
BASE="${2:-origin/main}"

fail() { echo "FAIL: $*" >&2; exit 1; }

# Same test seam as check-gate-residual.sh — see check-resign-wave-teeth.sh.
if [ -n "${GATE_RESIDUAL_INPUT:-}" ]; then
    out=$(cat "$GATE_RESIDUAL_INPUT")
else
    out=$(bash scripts/pre-merge-check.sh . --base "$BASE" 2>&1) || true
fi

# A run that never reached its own summary line crashed; refuse to read silence
# as cleanliness.
printf '%s\n' "$out" | grep -qE '^pre-merge-check: (clean|[0-9]+ violation)' \
    || { printf '%s\n' "$out" | tail -5 >&2; fail "pre-merge-check did not reach a verdict line — refusing to report the wave cleared"; }

stale_foreign=$(printf '%s\n' "$out" \
    | grep '^VIOLATION' \
    | grep -v "^VIOLATION \[$SLUG\]:" \
    | grep 'evidence is stale' || true)

if [ -n "$stale_foreign" ]; then
    printf '%s\n' "$stale_foreign" >&2
    n=$(printf '%s\n' "$stale_foreign" | grep -c .)
    fail "$n other feature(s) still carry stale evidence (above) — re-verify them before merging '$SLUG'"
fi

echo "OK: no feature other than $SLUG carries stale evidence — the re-sign wave has cleared"
