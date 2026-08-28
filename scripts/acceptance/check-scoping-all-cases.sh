#!/usr/bin/env bash
# E6 / AC-5 of gate-tooling-t1 — every case of check-stale-scoping.sh must be
# green, and every case must actually be RUN.
#
# WHY IT READS THE LIST INSTEAD OF CARRYING ONE. A hardcoded case list here
# would mean a case added later is never run by this eval — and that is not a
# hypothetical: `indent-drift` shipped a working function that nothing ever
# invoked, because no _acceptance/config.yaml key pointed `--case indent-drift`
# at it. A list copied into a second place rots the same way. So the names come
# from the guard's own KNOWN_CASES.
#
# WHY IT IS NOT REDUNDANT WITH case-completeness. That case proves each name
# DISPATCHES (a function exists, and a config key points at it). It never runs
# them. This one proves they PASS. Five of fourteen cases were red on a clean
# main for ten days while case-completeness stayed green throughout — the two
# questions are genuinely different.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"; cd "$ROOT"
GUARD=scripts/acceptance/check-stale-scoping.sh
fails=0

echo "check-scoping-all-cases:"

# ── Anti-vacuous layer ──────────────────────────────────────────────────────
# A broken parse yields an empty (or one-item) list, and a loop over it passes
# having run nothing. Two independent sources have to agree before anything runs.
cases="$(sed -n 's/^KNOWN_CASES="\(.*\)"$/\1/p' "$GUARD" | head -1)"
n_cases="$(printf '%s\n' $cases | grep -c . || true)"
if [ "$n_cases" -eq 0 ]; then
  echo "FAIL anti-vacuous: could not parse KNOWN_CASES out of $GUARD — a loop over an empty list would report OK having run nothing"
  exit 1
fi
# Independent source: every case is wired into config.yaml as `--case <name>`
# (case-completeness enforces that direction). If the two counts disagree, one
# of the two readings is wrong and this guard must not pretend otherwise.
n_cfg="$(grep -o 'check-stale-scoping\.sh --case [a-z0-9-]*' _acceptance/config.yaml | sort -u | grep -c . || true)"
if [ "$n_cases" -ne "$n_cfg" ]; then
  echo "FAIL anti-vacuous: KNOWN_CASES lists $n_cases case(s) but _acceptance/config.yaml wires $n_cfg — the two readings disagree, so neither can be trusted as the list to run"
  exit 1
fi
echo "  ok   anti-vacuous: $n_cases cases, and config.yaml wires the same number"

# ── Run them all ────────────────────────────────────────────────────────────
red=""
for c in $cases; do
  out="$(bash "$GUARD" --case "$c" 2>&1 || true)"
  # A case that never printed its own CASE line did not run — an unknown name
  # exits 2 before dispatching, and that must not be mistaken for a pass.
  if ! printf '%s\n' "$out" | grep -q "^CASE $c: "; then
    echo "  FAIL $c: the guard printed no 'CASE $c:' line — it never dispatched (unknown name, or the guard died before reaching it)"
    red="$red $c"; fails=$((fails+1)); continue
  fi
  if printf '%s\n' "$out" | grep -q "^CASE $c: PASS"; then
    echo "  ok   $c"
  else
    echo "  FAIL $c: $(printf '%s\n' "$out" | grep "^CASE $c:" | head -1 | cut -c1-160)"
    red="$red $c"; fails=$((fails+1))
  fi
done

[ "$fails" -eq 0 ] || { echo "FAIL: $fails of $n_cases scoping case(s) red —$red"; exit 1; }
echo "OK: all $n_cases cases of check-stale-scoping.sh pass"
