#!/usr/bin/env bash
# Usage: check-gate-residual.sh <slug> [base-ref]
#
# "Is the merge gate clear of everything EXCEPT this feature's own pending
# signature?" — the question a verifier can actually answer about itself.
#
# Why this exists. `pre-merge-check.sh` inspects every feature in _acceptance/,
# including the one currently in flight, and violates on it in all three states
# it can occupy during S4: no evidence report yet, a verdict that is not PASS,
# and a PASS whose `human_signoff` is still empty (signoff.required_for covers
# T2/T3, and require_human_commit forbids the agent from filling it). So an
# eval that demands a literally clean gate can never pass in ANY verify round of
# a signoff-required feature — it asks about the world after the signature while
# running before it. ci-vitest-sdk-pin's AC-11 was written that way and round 2
# proved it unsatisfiable rather than merely unsatisfied.
#
# What this asserts instead is the reachable half, and it is not weaker where it
# counts: if any OTHER feature were stale, un-signed, or red, its violation would
# appear here and this guard would refuse. The only thing forgiven is the
# in-flight slug's own wait for a human — the one thing the human is about to do.
#
# The post-signature half of the claim belongs to the Gate-2 checklist: sign,
# then run pre-merge-check and see `clean`.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

SLUG="${1:?usage: check-gate-residual.sh <slug> [base-ref]}"
BASE="${2:-origin/main}"

fail() { echo "FAIL: $*" >&2; exit 1; }

# pre-merge-check exits non-zero when it blocks; that is data here, not an error.
out=$(bash scripts/pre-merge-check.sh . --base "$BASE" 2>&1) || true

# A run that never reached its own summary line crashed; refuse to read silence
# as cleanliness (the failure mode check-no-t3-drift.sh names).
printf '%s\n' "$out" | grep -qE '^pre-merge-check: (clean|[0-9]+ violation)' \
    || { printf '%s\n' "$out" | tail -5 >&2; fail "pre-merge-check did not reach a verdict line — refusing to report the gate clear"; }

violations=$(printf '%s\n' "$out" | grep '^VIOLATION' || true)

if [ -z "$violations" ]; then
    echo "OK: gate clean — no violation at all, including $SLUG"
    exit 0
fi

foreign=$(printf '%s\n' "$violations" | grep -v "^VIOLATION \[$SLUG\]:" || true)
if [ -n "$foreign" ]; then
    printf '%s\n' "$foreign" >&2
    fail "violations outside '$SLUG' (above) — the re-sign wave has not cleared"
fi

# Own violations are forgiven ONLY while they are the wait for a human. A red
# eval or stale evidence belonging to this slug is a real failure and must not
# hide behind its own name.
while IFS= read -r line; do
    case "$line" in
        *"human_signoff is empty"*|*"verdict=REJECT"*|*"no evidence-report.md"*) ;;
        *) printf '%s\n' "$line" >&2; fail "'$SLUG' violation is not the pending-signature class (above)" ;;
    esac
done <<<"$violations"

n=$(printf '%s\n' "$violations" | grep -c .)
echo "OK: the only violation(s) are $SLUG's own pending Gate-2 signature ($n); every other feature is clean"
