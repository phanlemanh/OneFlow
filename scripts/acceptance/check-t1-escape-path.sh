#!/usr/bin/env bash
# E1 / AC-1 of gate-tooling-t1 — there must be a legal way to change a guard.
#
# risk_tiers.t1_skip_globs exempts the vendored gate tooling by EXACT path
# (scripts/pre-merge-check.sh, scripts/recheck-evidence.*, lib/*.cjs). The eight
# guards this repo writes itself under scripts/acceptance/** are NOT on that
# list — deliberately, because the gate must apply to changes in what the gate
# measures (AC-11 of stale-scope-by-paths). The consequence is that a PR
# touching only those guards trips the T1-escape backstop unless it carries
# acceptance artifacts. That is the intended door, and this guard pins that the
# door both OPENS and STAYS SHUT.
#
# MEASURED ON A FIXTURE, NEVER ON THIS BRANCH. Running the gate against the
# current checkout would make the result a property of whatever the branch
# happens to touch today — the exact mistake that made the deleted stale-golden
# guard unmaintainable (it froze a branch-shaped verdict and called it
# behaviour). The fixture below owns its own repo, its own config and its own
# base, so the answer is the same on every branch and every machine.
#
# THE TWO HALVES run against ONE fixture, in order, so the deciding variable is
# visibly the artifacts and nothing else:
#   B (should-fire)     PR changes only scripts/acceptance/<guard>.sh  → VIOLATION
#   A (should-NOT-fire) same PR plus an _acceptance/ artifact touch    → no VIOLATION
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
GATE="$ROOT/scripts/pre-merge-check.sh"
. "$HERE/fixtures.sh"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
ESCAPE='VIOLATION \[PR\]: non-T1 files changed'
GUARD_REL=scripts/acceptance/check-fixture-guard.sh
fails=0

echo "check-t1-escape-path:"

d="$WORK/fx"
mkdir -p "$d"
mk_fixture "$d" fx narrow
vc="$(git -C "$d" rev-parse HEAD)"
write_report "$d" fx "$vc"
( cd "$d" && git add -A && git commit -q -m report )
base="$(git -C "$d" rev-parse HEAD)"

# The PR: a repo-authored guard changes. Nothing else.
mkdir -p "$d/scripts/acceptance"
printf '#!/usr/bin/env bash\necho guard\n' > "$d/$GUARD_REL"
( cd "$d" && git add -A && git commit -q -m "change a repo-authored guard" )

# ── Anti-vacuous layer ──────────────────────────────────────────────────────
# Both halves below are about a gated file being present in the diff. If it is
# not, half A passes because nothing gated changed at all — a green that says
# nothing. Assert the diff shape directly rather than trusting the setup.
in_diff() { git -C "$d" diff --name-only "$base...HEAD" | grep -qx "$1"; }
if ! in_diff "$GUARD_REL"; then
  echo "FAIL anti-vacuous: $GUARD_REL is not in the fixture PR diff — neither half would mean anything"
  exit 1
fi
# And the fixture's own config must really treat that path as non-T1, or half B
# fails for a reason that has nothing to do with the backstop.
if grep -qE '^\s+- "scripts' "$d/_acceptance/config.yaml"; then
  echo "FAIL anti-vacuous: the fixture config exempts scripts/** — half B could not fire for the intended reason"
  exit 1
fi
echo "  ok   anti-vacuous: guard file in the PR diff, and non-T1 in the fixture config"

run_gate() { bash "$GATE" "$d" --base "$base" 2>&1 || true; }

# ── Half B — should FIRE ────────────────────────────────────────────────────
outB="$(run_gate)"
if ! printf '%s\n' "$outB" | grep -q 'pre-merge-check:'; then
  echo "  FAIL [half B] the gate produced no summary line — it did not run, so its silence proves nothing"
  fails=$((fails+1))
elif printf '%s\n' "$outB" | grep -q "$ESCAPE"; then
  echo "  ok   [half B] a guard-only PR with no acceptance artifacts trips the T1-escape backstop"
else
  echo "  FAIL [half B] a PR changing only $GUARD_REL did NOT trip the T1-escape backstop — the door is unguarded, and any guard can be changed with no acceptance artifact at all"
  fails=$((fails+1))
fi

# ── Half A — must NOT fire ──────────────────────────────────────────────────
# Same PR, one artifact added. `_acceptance/**` is excluded from every staleness
# set, so this changes nothing except whether the PR carries gate artifacts.
( cd "$d" && echo touched >> _acceptance/fx/run-log.jsonl && git add -A && git commit -q -m "carry acceptance artifacts" )
if ! in_diff "$GUARD_REL"; then
  echo "  FAIL [half A] the guard change fell out of the diff — half A would pass because nothing gated changed"
  fails=$((fails+1))
else
  outA="$(run_gate)"
  if ! printf '%s\n' "$outA" | grep -q 'pre-merge-check:'; then
    echo "  FAIL [half A] the gate produced no summary line — it did not run"
    fails=$((fails+1))
  elif printf '%s\n' "$outA" | grep -q "$ESCAPE"; then
    echo "  FAIL [half A] the PR carries acceptance artifacts and STILL trips the T1-escape backstop — there is then no legal way to change a guard at all, which is the debt this contract exists to pay"
    fails=$((fails+1))
  else
    echo "  ok   [half A] the same PR carrying acceptance artifacts passes the backstop"
  fi
fi

[ "$fails" -eq 0 ] || { echo "FAIL: $fails half/halves of the T1-escape door misbehaved"; exit 1; }
echo "OK: changing a repo-authored guard is legal with acceptance artifacts and blocked without them"
