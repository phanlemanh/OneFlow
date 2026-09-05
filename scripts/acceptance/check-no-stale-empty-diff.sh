#!/usr/bin/env bash
# E10 / AC-9 of gate-tooling-t1 — no feature carries stale evidence, measured
# with an EMPTY diff.
#
# WHY EMPTY. `--base HEAD` makes the PR diff empty, which separates the two
# things that look identical in a normal gate run: evidence that was ALREADY
# stale before anyone touched the branch, versus evidence the branch under work
# just staled. Only the first kind is this contract's debt. Measured on
# 2026-08-27: narrowing the STALE-DIFF-SCOPE-GUARD fork surfaced exactly four
# already-stale records (conformance-l0, measure-harness, stale-scope-by-paths,
# task-metering) that the wider fork had been hiding — the same four appear with
# an empty diff and with the branch's real diff, which is how they were shown to
# pre-date the branch.
#
# WHY IT IS NOT A TAUTOLOGY. Under the narrowed fork a feature outside the PR
# diff is examined only if it declares complete `paths`; everything else is
# skipped. With an empty diff EVERY feature is outside the diff, so "zero stale"
# would also be the answer if the fork skipped all of them — a green that means
# "nobody looked". The anti-vacuous layer below therefore requires the gate to
# show it actually examined someone.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"; cd "$ROOT"
GATE=scripts/pre-merge-check.sh
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
out="$WORK/gate.txt"

echo "check-no-stale-empty-diff:"

bash "$GATE" . --base HEAD > "$out" 2>&1 || true

# ── Anti-vacuous layer ──────────────────────────────────────────────────────
if ! grep -q '^pre-merge-check:' "$out"; then
  echo "FAIL anti-vacuous: the gate printed no summary line — it did not run to completion, so 'no stale evidence' would be an artefact of the crash"
  exit 1
fi
if ! grep -qE '^OK \[' "$out"; then
  echo "FAIL anti-vacuous: the gate judged no feature at all — zero stale records would mean zero records"
  exit 1
fi
# The decisive one: at least one feature must have reached the staleness block.
# A granted narrow scope is the only line that proves it — an examined feature
# either announces its scope or is reported stale, and a skipped one is silent.
examined="$(grep -c 'narrow staleness scope applied' "$out" || true)"
if [ "$examined" -eq 0 ]; then
  echo "FAIL anti-vacuous: no feature reached the staleness block (no 'narrow staleness scope applied' line) — with an empty diff that means the fork skipped every feature, so 'zero stale' proves nothing about the evidence"
  exit 1
fi
echo "  ok   anti-vacuous: gate ran, judged $(grep -cE '^OK \[' "$out") feature(s), and examined $examined declaring feature(s)"

# ── The assertion ───────────────────────────────────────────────────────────
n_stale="$(grep -cE '^VIOLATION \[[^]]+\]: evidence is stale' "$out" || true)"
if [ "$n_stale" -ne 0 ]; then
  echo "  FAIL $n_stale feature(s) carry stale evidence with an empty diff — this debt pre-dates any branch and needs a re-verify wave, not a rebase:"
  grep -E '^VIOLATION \[[^]]+\]: evidence is stale' "$out" | sed 's/:.*//' | sed 's/^/      /'
  echo "FAIL: stale evidence survives on a clean tree"
  exit 1
fi

echo "OK: no feature carries stale evidence when the diff is empty"
