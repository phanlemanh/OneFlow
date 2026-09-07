#!/usr/bin/env bash
# E12 / AC-11 of gate-tooling-t1, and the narrowed half of STATUS.md item
# 0.8(c). `landed_merge` is the anchor own-range.sh uses to work out which files
# a feature actually owns; without it the script falls back to the whole branch
# diff. Only 5 of 23 contracts carry one.
#
# Backfilling all 18 stragglers would put 18 `_acceptance/<slug>/` directories
# into one diff, and touching a slug directory is what re-opens its staleness
# question — the largest re-pin wave this repo has ever run. So the scope here
# is deliberately the four features this contract's wave already has to
# re-verify: they cost nothing extra.
#
# Presence is not the bar. A `landed_merge:` that is empty, or points at a SHA
# no longer reachable (squash-merge, rebase, a hand-typed anchor), sends
# own-range.sh straight back to the fallback — the exact defect 0.8(c) exists to
# close. So the value must resolve to a real commit.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"; cd "$ROOT"
SLUGS="conformance-l0 measure-harness stale-scope-by-paths task-metering"
fails=0

echo "check-landed-merge-repinned:"

# ── Anti-vacuous layer ──────────────────────────────────────────────────────
# An empty slug list, or missing contracts, would make the loop below pass
# without checking anything.
[ -n "$SLUGS" ] || { echo "FAIL anti-vacuous: the slug list is empty"; exit 1; }
git rev-parse --git-dir >/dev/null 2>&1 \
  || { echo "FAIL anti-vacuous: not a git repo — every commit resolution below would be meaningless"; exit 1; }
for s in $SLUGS; do
  [ -f "_acceptance/$s/contract.md" ] \
    || { echo "  FAIL anti-vacuous: _acceptance/$s/contract.md missing — cannot judge its anchor"; fails=$((fails+1)); }
done
[ "$fails" -eq 0 ] || { echo "FAIL: anti-vacuous probes failed; anchors were NOT checked"; exit 1; }
echo "  ok   anti-vacuous probes: git repo + all $(printf '%s\n' $SLUGS | grep -c .) contracts present"

# ── The anchors ─────────────────────────────────────────────────────────────
for s in $SLUGS; do
  c="_acceptance/$s/contract.md"
  # Frontmatter only: stop at the closing --- so a `landed_merge` mentioned in
  # the prose below cannot be mistaken for the machine-read field.
  val="$(awk 'NR==1 && $0=="---" {inside=1; next} inside && $0=="---" {exit} inside' "$c" \
         | sed -n 's/^landed_merge:[[:space:]]*//p' | head -1 | sed 's/[[:space:]]*#.*$//' | tr -d '[:space:]')"
  if [ -z "$val" ]; then
    echo "  FAIL $s: no landed_merge in frontmatter — own-range.sh falls back to the branch diff, so this feature cannot say which files it owns"
    fails=$((fails+1)); continue
  fi
  if ! git rev-parse --quiet --verify "$val^{commit}" >/dev/null 2>&1; then
    echo "  FAIL $s: landed_merge $val does not resolve to a commit in this clone — an unreachable anchor is the same fallback as no anchor, only harder to notice"
    fails=$((fails+1)); continue
  fi
  echo "  ok   $s: landed_merge $val resolves"
done

[ "$fails" -eq 0 ] || { echo "FAIL: $fails of the four re-pinned features lack a usable landed_merge anchor"; exit 1; }
echo "OK: all four re-pinned features carry a resolvable landed_merge"
