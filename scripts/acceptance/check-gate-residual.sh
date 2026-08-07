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
#
# GATE_RESIDUAL_INPUT substitutes a captured/synthetic pre-merge-check output for
# a live run. It exists so check-gate-residual-teeth.sh can prove this guard goes
# red on the violation classes it must never forgive, without having to
# manufacture eleven real stale features to do it. Same seam as
# SDK_VERSION_ROOT in scripts/lib/sdk-version.sh.
if [ -n "${GATE_RESIDUAL_INPUT:-}" ]; then
    out=$(cat "$GATE_RESIDUAL_INPUT")
else
    out=$(bash scripts/pre-merge-check.sh . --base "$BASE" 2>&1) || true
fi

# A run that never reached its own summary line crashed; refuse to read silence
# as cleanliness (the failure mode check-no-t3-drift.sh names).
printf '%s\n' "$out" | grep -qE '^pre-merge-check: (clean|[0-9]+ violation)' \
    || { printf '%s\n' "$out" | tail -5 >&2; fail "pre-merge-check did not reach a verdict line — refusing to report the gate clear"; }

violations=$(printf '%s\n' "$out" | grep '^VIOLATION' || true)

if [ -z "$violations" ]; then
    echo "OK: gate clean — no violation at all, including $SLUG"
    exit 0
fi

# Own violations are forgiven while they are "this feature has not finished its
# own Gate 2 yet". THREE strings qualify, and the message below names which one
# was actually forgiven — an earlier version forgave all three but reported
# every case as "pending Gate-2 signature", which described the world wrongly in
# two of them. A guard that misreports what it forgave is a guard you cannot read.
#
#   no evidence-report.md  — the round has not written its report yet
#   verdict=REJECT         — a previous round's verdict, rewritten by this one
#   human_signoff is empty — PASS, waiting on the human (the true end state)
#
# Anything else belonging to this slug — stale evidence, a bypass, an
# unacknowledged enforcement mode — is a real failure and must not hide behind
# its own name.
#
# A FOREIGN slug is forgiven for exactly ONE of those three: "human_signoff is
# empty". Generalised 2026-08-07 (local-cpu-plugins), and it is a fix to the
# same family as ci-vitest-sdk-pin's AC-11 amendment rather than a new
# indulgence. That amendment made the guard reachable for the ONE feature in
# flight; it silently assumed there is only ever one. Two features carrying
# residual evals — `civ_gate_residual` and `lcp_resign_wave` — each demanded the
# other be signed first, so neither could ever go green: a machine FAIL, which
# no human_override can release. Signing them on a separate branch does not
# help either, because staleness is measured from the commit that carries the
# code, so both must be in flight at once.
#
# The other two classes stay FAIL when they are foreign, and the distinction is
# the whole point: a foreign feature that has PASSED its evals and merely awaits
# the same reviewer's signature is not evidence of anything wrong, while a
# foreign feature that is STALE, RED, or has no evidence at all is exactly what
# this guard exists to catch. check-gate-residual-teeth.sh pins all six cases.
foreign=$(printf '%s\n' "$violations" | grep -v "^VIOLATION \[$SLUG\]:" || true)
if [ -n "$foreign" ]; then
    unforgivable=$(printf '%s\n' "$foreign" | grep -v "human_signoff is empty" || true)
    if [ -n "$unforgivable" ]; then
        printf '%s\n' "$unforgivable" >&2
        fail "violations outside '$SLUG' that are not merely awaiting a signature (above) — the re-sign wave has not cleared"
    fi
fi
#
# KNOWN BLIND SPOT (inherited from pre-merge-check, not opened here):
# pre-merge-check short-circuits per feature, so when the in-flight slug's report
# is PASS with an empty signature it reports ONLY that, even if the same report's
# `verified_commit` is stale. During a verify round this feature's own staleness
# is therefore invisible to this guard. It becomes visible the moment the human
# signs and the empty-signoff violation clears.
own=$(printf '%s\n' "$violations" | grep "^VIOLATION \[$SLUG\]:" || true)
forgiven=""
if [ -n "$own" ]; then
    while IFS= read -r line; do
        case "$line" in
            *"human_signoff is empty"*) forgiven="${forgiven}PASS awaiting the human's Gate-2 signature; " ;;
            *"verdict=REJECT"*)         forgiven="${forgiven}a previous round's REJECT verdict, not yet rewritten; " ;;
            *"no evidence-report.md"*)  forgiven="${forgiven}no evidence report written yet this round; " ;;
            *) printf '%s\n' "$line" >&2; fail "'$SLUG' violation is not an unfinished-Gate-2 class (above)" ;;
        esac
    done <<<"$own"
fi

n_own=$(printf '%s\n' "$own" | grep -c . || true)
n_foreign=$(printf '%s\n' "$foreign" | grep -c . || true)
# Name the two counts separately. Collapsing them would hide the fact that other
# features are waiting on the same signature run — the thing a reader most needs
# to know when deciding what to sign next.
echo "OK: no blocking residual for $SLUG; forgave ${n_own} own violation(s)${forgiven:+ — ${forgiven%; }}, and ${n_foreign} other in-flight feature(s) awaiting the same Gate-2 signature run"
