#!/usr/bin/env bash
# E11 / AC-10 of gate-tooling-t1. `_acceptance/stale-scope-by-paths/` still
# records that check-stale-golden.sh, its fixture and the stale_scoping_golden
# key "stay on the tree" — true when it was written on 2026-08-06, false since
# PR #76 deleted all three. A signed contract that describes a tree that no
# longer exists is worse than no note: the next reader trusts it.
#
# HOW THIS IS ANCHORED, and its limit. Banning the filename outright is wrong —
# both files legitimately narrate the descope in past tense and must keep doing
# so. So: locate every UNIT that mentions one of the artefacts, then fail if that
# same unit also carries a present-tense "still on the tree" claim.
#
# The unit is a PARAGRAPH for markdown, not a line. Measured while writing this:
# contract.md carries the artefact name on line 134 and the claim on line 135,
# because prose wraps — a line-scoped scan sees neither line as a hit and reports
# green while the claim sits there intact. That is the vacuous pass this guard
# exists to avoid, so it must not be built on one. decisions.jsonl stays
# line-scoped: there, one line IS one record.
#
# Residual, accepted deliberately: the claim markers are a known, listed set, so
# a rewrite inventing a new phrasing would slip past. The alternative — banning
# the artefact names outright — would forbid the history this repo depends on.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"; cd "$ROOT"
DIR=_acceptance/stale-scope-by-paths
fails=0

echo "check-no-golden-claim:"

# ── Anti-vacuous layer ──────────────────────────────────────────────────────
# "No claim found" is trivially true against a missing or empty file.
for f in "$DIR/contract.md" "$DIR/decisions.jsonl"; do
  [ -s "$f" ] || { echo "  FAIL anti-vacuous: $f missing or empty — 'no claim found' would prove nothing"; fails=$((fails+1)); }
done
[ "$fails" -eq 0 ] || { echo "FAIL: anti-vacuous probes failed; the scan was NOT run"; exit 1; }
# And prove the artefact names still appear at all: if they do not, the scan
# below has nothing to look at and would pass for the wrong reason.
if ! grep -qE 'check-stale-golden|baseline-gate-output|stale_scoping_golden' "$DIR/contract.md" "$DIR/decisions.jsonl"; then
  echo "  note the artefacts are no longer mentioned anywhere in $DIR — nothing to misstate"
  echo "OK: no surviving claim that the stale-golden pieces remain on the tree"
  exit 0
fi
echo "  ok   anti-vacuous probes: both files present and mention the artefacts"

# ── The scan ────────────────────────────────────────────────────────────────
# Known present-tense presence-claim markers, Vietnamese and English.
CLAIMS='giữ nguyên trên cây|GIỮ NGUYÊN trên cây|giu nguyen tren cay|vẫn nằm trên cây|vẫn còn trên cây|remains on the tree|stays on the tree|stay on the tree|kept on the tree'

ART='check-stale-golden|baseline-gate-output|stale_scoping_golden'

# contract.md: paragraph records (RS="") so a claim wrapped onto the next line
# is still seen as belonging to the same statement.
md_hits="$(awk -v art="$ART" -v claim="$CLAIMS" 'BEGIN{RS=""}
  $0 ~ art && $0 ~ claim { gsub(/\n/, " "); print "contract.md (đoạn): " substr($0, 1, 240) }' \
  "$DIR/contract.md" || true)"

# decisions.jsonl: one line IS one record, so line scope is the right unit here.
jl_hits="$(awk -v art="$ART" -v claim="$CLAIMS" \
  '$0 ~ art && $0 ~ claim { print "decisions.jsonl:" NR ": " substr($0, 1, 240) }' \
  "$DIR/decisions.jsonl" || true)"

hits="$(printf '%s\n%s' "$md_hits" "$jl_hits" | grep -c . >/dev/null 2>&1 && printf '%s\n%s' "$md_hits" "$jl_hits" | grep . || true)"

if [ -n "$hits" ]; then
  echo "  FAIL một đoạn/bản ghi vẫn khẳng định các mảnh đã xoá còn trên cây:"
  printf '%s\n' "$hits" | head -10 | sed 's/^/      /'
  echo "FAIL: stale claim(s) survive in $DIR — PR #76 deleted all three; rewrite the sentence in past tense"
  exit 1
fi

echo "  ok   no paragraph/record mentioning the artefacts carries a presence claim"
echo "OK: no surviving claim that the stale-golden pieces remain on the tree"
