#!/usr/bin/env bash
# Teeth for check-resign-wave.sh. It forgives more than check-gate-residual does,
# so the one thing it must never forgive — a foreign feature carrying stale
# evidence — is pinned here, alongside the classes it deliberately ignores.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"; cd "$ROOT"
GUARD=scripts/acceptance/check-resign-wave.sh
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
f="$WORK/out.txt"; fails=0
expect() { local want="$1" label="$2" body="$3"
  printf '%s\n' "$body" > "$f"
  if GATE_RESIDUAL_INPUT="$f" bash "$GUARD" mine origin/main >/dev/null 2>&1; then got=green; else got=red; fi
  if [ "$got" = "$want" ]; then echo "  ok   [$want] $label"; else echo "  FAIL [expected $want, got $got] $label"; fails=$((fails+1)); fi; }
V='pre-merge-check: 1 violation'
echo "check-resign-wave-teeth:"
expect green "a clean gate" "pre-merge-check: clean"
expect red   "foreign STALE evidence — the wave itself" "VIOLATION [other]: evidence is stale — code changed after verify
$V"
expect red   "foreign stale hidden among forgiven classes" "VIOLATION [other]: PASS but human_signoff is empty
VIOLATION [third]: evidence is stale — code changed after verify
$V"
expect green "foreign awaiting signature — not the wave" "VIOLATION [other]: PASS but human_signoff is empty
$V"
expect green "foreign REJECT — deliberately not the wave" "VIOLATION [other]: verdict=REJECT
$V"
expect green "own slug stale — check-gate-residual's job, not this one" "VIOLATION [mine]: evidence is stale — code changed after verify
$V"
expect red   "output that never reached a verdict line" "VIOLATION [other]: evidence is stale
crash, no summary"
[ "$fails" -eq 0 ] || { echo "FAIL: $fails case(s) misclassified"; exit 1; }
echo "OK: check-resign-wave blocks foreign stale evidence and nothing else"
