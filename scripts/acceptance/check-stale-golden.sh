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
# Guard against an accidentally-truncated golden file: with no non-empty
# check, a golden reduced to 0 bytes and an `actual` that also comes up empty
# (e.g. because a feature was renamed/removed and the $UNDECLARED regex no
# longer matches anything, or the gate reworded its VIOLATION/OK/NOTE prefix)
# would compare `[ "" = "" ]` and print OK, proving nothing.
[ -s "$GOLDEN" ] || { echo "FAIL: golden baseline is empty (0 bytes) — a byte-compare against an empty file would pass vacuously"; exit 1; }

actual="$(bash "$ROOT/scripts/pre-merge-check.sh" "$ROOT" --base main 2>&1 \
  | grep -E "^(VIOLATION|OK|NOTE) \[($UNDECLARED)\]" \
  | sed -E 's/verified_commit [0-9a-f]{40}/verified_commit <SHA>/' \
  | sort)"

# Same vacuous-pass guard, the other side: the grep above must have actually
# matched something. An empty `actual` compared against a (non-empty, per the
# guard above) golden would already fail the byte-compare below — but if BOTH
# ever came up empty at once this is what stops `[ "" = "" ]` from reading as
# success.
[ -n "$actual" ] || { echo "FAIL: gate produced NO output lines for the seven undeclared features — the grep matched nothing (renamed/removed feature, or a reworded VIOLATION/OK/NOTE prefix, would otherwise make this an empty-vs-empty vacuous pass)"; exit 1; }

# Line-count check, ahead of (and independent from) the byte-compare below:
# a count mismatch is reported on its own terms rather than folded into a
# generic diff, and catches a corrupted golden (extra/missing lines) even in
# the pathological case where every remaining line still happens to match.
golden_lines="$(wc -l < "$GOLDEN" | tr -d '[:space:]')"
actual_lines="$(printf '%s\n' "$actual" | grep -c .)"
if [ "$actual_lines" -ne "$golden_lines" ]; then
  echo "FAIL: line count differs from golden ($actual_lines actual vs $golden_lines golden)"
  diff <(cat "$GOLDEN") <(printf '%s\n' "$actual") || true
  exit 1
fi

if [ "$actual" = "$(cat "$GOLDEN")" ]; then
  echo "OK: undeclared features keep byte-identical gate output"
  exit 0
fi
echo "FAIL: gate output changed for features that declare no paths"
diff <(cat "$GOLDEN") <(printf '%s\n' "$actual") || true
exit 1
