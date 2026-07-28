#!/usr/bin/env bash
# E3 / AC-3: the seven features that declare no `paths` must keep exactly
# today's behaviour. Byte-compare, not a count: a new output line or a reworded
# message is a behaviour change for anyone reading the gate, and a count check
# would wave both through.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
GOLDEN="$HERE/fixtures/baseline-gate-output.txt"
UNDECLARED='ci-actions-bump|dependency-refresh-2026-07|measure-harness|oneflow-plugin-prefix|per-plugin-origin|sdk-distribution-rename|task-metering'

[ -f "$GOLDEN" ] || { echo "FAIL: golden baseline missing: $GOLDEN"; exit 1; }

actual="$(bash "$ROOT/scripts/pre-merge-check.sh" "$ROOT" --base main 2>&1 \
  | grep -E "^(VIOLATION|OK|NOTE) \[($UNDECLARED)\]" \
  | sed -E 's/verified_commit [0-9a-f]{40}/verified_commit <SHA>/' \
  | sort)"

if [ "$actual" = "$(cat "$GOLDEN")" ]; then
  echo "OK: undeclared features keep byte-identical gate output"
  exit 0
fi
echo "FAIL: gate output changed for features that declare no paths"
diff <(cat "$GOLDEN") <(printf '%s\n' "$actual") || true
exit 1
