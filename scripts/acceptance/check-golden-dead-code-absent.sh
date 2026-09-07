#!/usr/bin/env bash
# E8 / AC-7 of gate-tooling-t1. The three dead pieces of the descoped E3
# stale-golden eval must stay gone: the guard script, its golden fixture, and
# the `stale_scoping_golden` executor key. Removed in PR #76; this is the
# regression guard, because a later `vendor the kit` sweep can carry all three
# back in without anyone noticing — they look like ordinary gate tooling.
#
# An absence check is the easiest kind to make vacuous: a typo in a path is
# indistinguishable from the file being gone. So every absence assertion is
# paired with a PRESENCE probe proving this script is scanning the right tree
# in the first place.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"; cd "$ROOT"
fails=0

ok()   { echo "  ok   $1"; }
bad()  { echo "  FAIL $1"; fails=$((fails+1)); }

echo "check-golden-dead-code-absent:"

# ── Anti-vacuous layer: prove we are looking at a real acceptance tree ───────
# Without these, a wrong ROOT (or a renamed directory) makes every absence
# assertion below trivially true and this guard reports OK having checked
# nothing at all.
[ -d scripts/acceptance ] \
  || bad "anti-vacuous: scripts/acceptance/ does not exist — this guard is scanning the wrong tree, so every absence below would be meaningless"
[ -f scripts/acceptance/check-stale-scoping.sh ] \
  || bad "anti-vacuous: the sibling guard check-stale-scoping.sh is missing — same doubt as above"
[ -f _acceptance/config.yaml ] \
  || bad "anti-vacuous: _acceptance/config.yaml is missing — the key check below could not mean anything"
[ "$fails" -eq 0 ] || { echo "FAIL: anti-vacuous probes failed; absence assertions were NOT run"; exit 1; }
ok "anti-vacuous probes: acceptance tree present"

# ── The three pieces ────────────────────────────────────────────────────────
if [ -e scripts/acceptance/check-stale-golden.sh ]; then
  bad "scripts/acceptance/check-stale-golden.sh is back — E3 was descoped at Gate 2 on 2026-08-05 (decisions.jsonl d-20260805T190000Z-31447); running it by hand goes RED because its golden froze a staleness VERDICT, not the scoping BEHAVIOUR"
else
  ok "check-stale-golden.sh absent"
fi

if [ -e scripts/acceptance/fixtures/baseline-gate-output.txt ]; then
  bad "scripts/acceptance/fixtures/baseline-gate-output.txt is back — the golden fixture has no stable state: red after every successful re-pin wave, and red on the next branch if regenerated"
else
  ok "baseline-gate-output.txt absent"
fi

if grep -q 'stale_scoping_golden' _acceptance/config.yaml; then
  bad "the stale_scoping_golden executor key is back in _acceptance/config.yaml — a key wired to a descoped eval is how dead code gets run again"
else
  ok "stale_scoping_golden key absent from config.yaml"
fi

[ "$fails" -eq 0 ] || { echo "FAIL: $fails dead piece(s) present"; exit 1; }
echo "OK: all three descoped stale-golden pieces stay absent"
