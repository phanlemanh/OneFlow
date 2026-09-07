#!/usr/bin/env bash
# E9 / AC-8 of gate-tooling-t1 — teeth for the STALE-DIFF-SCOPE-GUARD fork.
#
# WHY THIS EXISTS. The fork lives inside scripts/pre-merge-check.sh, which
# risk_tiers.t1_skip_globs exempts BY NAME. The exemption is there so upgrading
# the measuring stick does not stale signed evidence — but it also means a
# change to this fork's semantics touches no gated file, stales nothing, and
# trips no t1-escape. It is the one place in the gate where behaviour can change
# without any acceptance artifact being required. Measured cost of that hole:
# the fork landed on 2026-08-17 and silently disabled five of check-stale-
# scoping.sh's fourteen cases for ten days, including the one the E3 descope
# decision was relying on.
#
# WHAT IT PINS. Two perturbations, each on a COPY of the tree (the working tree
# is never edited, and the shipped gate carries no knob — AC-13):
#   (1) revert the narrowing → the fork wraps the WHOLE staleness block again
#       for every slug outside the diff. `fork-declared-in-union` must go RED:
#       that is AC-2 of stale-scope-by-paths losing its only observable form.
#   (2) remove the fork entirely (`if false`) → every merged feature is examined
#       again. `fork-undeclared` must go RED: that is the treadmill re-opening
#       for the 19 features that never declared `paths`.
# Each perturbation must be shown to have actually changed the file, and each
# must go green again when reverted — a patch whose target moved would otherwise
# make this guard quietly stop testing anything, which is the exact failure mode
# it is built to rule out.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"; cd "$ROOT"
GATE_REL=scripts/pre-merge-check.sh
MARKER='# STALE-DIFF-SCOPE-GUARD'
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
fails=0

echo "check-fork-scope-teeth:"

# ── Anti-vacuous layer ──────────────────────────────────────────────────────
# The perturbations below rewrite the two lines around a single marker. If the
# marker moved, vanished, or multiplied, every patch becomes a no-op and this
# guard reports OK having proved nothing.
# The OPENING condition is the only line that ENDS with the marker; the closing
# `fi` carries it mid-line ("# đóng STALE-...") and is deliberately not counted.
# Measured, not assumed: `grep -c 'STALE-DIFF-SCOPE-GUARD'` is 2, `grep -c
# '# STALE-DIFF-SCOPE-GUARD$'` is 1.
open_n="$(grep -c "$MARKER\$" "$GATE_REL" || true)"
any_n="$(grep -c 'STALE-DIFF-SCOPE-GUARD' "$GATE_REL" || true)"
if [ "$open_n" -ne 1 ] || [ "$any_n" -lt 2 ]; then
  echo "FAIL anti-vacuous: expected exactly ONE line ending in '$MARKER' (the opening condition) and at least two mentions overall in $GATE_REL; found open=$open_n any=$any_n — the perturbation targets have moved, so nothing below would test anything"
  exit 1
fi
gate_sha_before="$(git hash-object "$GATE_REL")"
echo "  ok   anti-vacuous: opening marker unique, fork block still present"

# ── Build a pristine mini-root the scoping guard can run inside ─────────────
# scripts/ + lib/ + _acceptance/config.yaml is everything check-stale-scoping.sh
# reads from ROOT; its fixtures build their own git repos under TMPDIR.
PRISTINE="$WORK/pristine"
mkdir -p "$PRISTINE/_acceptance"
cp -R scripts "$PRISTINE/scripts"
cp -R lib "$PRISTINE/lib"
cp _acceptance/config.yaml "$PRISTINE/_acceptance/config.yaml"

# Replace the two-line fork condition with a single given line. Pure awk, using
# a one-line lookbehind: the marker sits on the CONTINUATION line, so the line
# before it (ending in a backslash) is part of the same condition and must go
# with it.
patch_condition() { # <src-gate> <dst-gate> <replacement-line>
  awk -v repl="$3" '
    $0 ~ /# STALE-DIFF-SCOPE-GUARD$/ && prev ~ /\\$/ && !done {
      print repl; done = 1; prev = ""; next
    }
    prev != "" { print prev }
    { prev = $0 }
    END { if (prev != "") print prev }
  ' "$1" > "$2"
}

run_case() { # <root> <case> -> exit code
  bash "$1/scripts/acceptance/check-stale-scoping.sh" --case "$2" >/dev/null 2>&1 && echo 0 || echo 1
}

probe() { # <label> <replacement-line> <case-that-must-go-red> <case-that-must-stay-green>
  local label="$1" repl="$2" red="$3" green="$4"
  local root="$WORK/$label"
  rm -rf "$root"; cp -R "$PRISTINE" "$root"

  # Baseline on this copy — if it is not green, the RED below proves nothing.
  if [ "$(run_case "$root" "$red")" != "0" ]; then
    echo "  FAIL [$label] baseline: --case $red is already red on an unpatched copy; the perturbation result would be meaningless"
    fails=$((fails+1)); return
  fi

  patch_condition "$PRISTINE/$GATE_REL" "$root/$GATE_REL.patched" "$repl"
  if cmp -s "$PRISTINE/$GATE_REL" "$root/$GATE_REL.patched"; then
    echo "  FAIL [$label] perturbation patched NOTHING — the fork condition's shape moved, so this probe has silently stopped testing"
    fails=$((fails+1)); return
  fi
  mv "$root/$GATE_REL.patched" "$root/$GATE_REL"

  if [ "$(run_case "$root" "$red")" != "1" ]; then
    echo "  FAIL [$label] --case $red stayed GREEN under the perturbation — it does not actually pin this half of the fork"
    fails=$((fails+1)); return
  fi
  if [ "$(run_case "$root" "$green")" != "0" ]; then
    echo "  FAIL [$label] --case $green also went red — the two halves are not independent, so neither says which half broke"
    fails=$((fails+1)); return
  fi

  # Revert on the same copy: green again, or the redness above was not caused
  # by the patch.
  cp "$PRISTINE/$GATE_REL" "$root/$GATE_REL"
  if [ "$(run_case "$root" "$red")" != "0" ]; then
    echo "  FAIL [$label] --case $red stayed red after reverting the perturbation — its redness was not caused by the patch"
    fails=$((fails+1)); return
  fi
  echo "  ok   [$label] --case $red red under the perturbation, green when reverted; --case $green unaffected"
}

probe revert-narrowing \
  '  if [ "$DIFF_READY" -eq 1 ] && ! slug_in_diff "$slug"; then # STALE-DIFF-SCOPE-GUARD' \
  fork-declared-in-union fork-undeclared

probe remove-fork \
  '  if false; then # STALE-DIFF-SCOPE-GUARD' \
  fork-undeclared fork-declared-in-union

# ── The working tree must be untouched ──────────────────────────────────────
if [ "$(git hash-object "$GATE_REL")" != "$gate_sha_before" ]; then
  echo "  FAIL this guard modified the shipped gate — every perturbation must stay inside the temp copy"
  fails=$((fails+1))
fi

[ "$fails" -eq 0 ] || { echo "FAIL: $fails fork-teeth probe(s) failed"; exit 1; }
echo "OK: both halves of the STALE-DIFF-SCOPE-GUARD fork are pinned by a case that goes red when it changes"
