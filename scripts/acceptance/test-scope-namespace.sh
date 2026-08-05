#!/usr/bin/env bash
# Guard for the path-namespace half of gate-scope-anchors — variant 5 of the
# "asked in one universe, answered in another" family that stale-scope-by-paths
# named, fixed four of, and left open with an explicit "do not patch piecemeal".
#
# scope_has_any_match() decides whether a feature's declared `paths` are usable
# at all; stale_files() then applies them. When the two disagree about WHICH
# files exist, a wholly honest declaration can be granted a scope that filters
# out every real change, forever, on every later pull request — silently. That
# is the shape tested here.
#
# Lives under scripts/acceptance/ on purpose: t1_skip_globs exempts the gate
# tooling by EXACT path, so this file is gated and the gate applies to the change
# that alters the gate.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
GATE="$ROOT/scripts/pre-merge-check.sh"

KNOWN_CASES="exempt-refused variants-discriminating legit-granted case-completeness"

TMPDIRS="$(mktemp)"
new_tmp() { d="$(mktemp -d)"; printf '%s\n' "$d" >> "$TMPDIRS"; printf '%s' "$d"; }
cleanup() {
  [ -f "$TMPDIRS" ] || return 0
  while IFS= read -r d; do [ -n "$d" ] && rm -rf "$d"; done < "$TMPDIRS"
  rm -f "$TMPDIRS"
}
trap cleanup EXIT

pass() { echo "CASE $1: PASS"; }
fail() { echo "CASE $1: FAIL $2"; exit 1; }

# Extract the two functions under test from a gate FILE and define them in this
# shell. Sourcing the whole gate is not an option (it has side effects and calls
# exit), and a private copy would drift from what actually ships. This is the
# same extraction check-stale-scoping.sh's guard-not-exempt case uses — and it is
# what lets a perturbed COPY be tested without any knob in the shipped gate.
load_gate_fns() { # <gate-file>
  local src
  src="$(sed -n '/^match_globs()/,/^}/p' "$1")
$(sed -n '/^scope_has_any_match()/,/^}/p' "$1")"
  case "$src" in
    *match_globs*scope_has_any_match*) ;;
    *) return 1 ;;
  esac
  eval "$src"
}

# A fixture repo whose tracked files are mostly exempt ones, plus real source so
# the repo is not degenerate.
mk_repo() {
  local d
  d="$(new_tmp)"
  (
    cd "$d" || exit 1
    git init -q .
    git config user.email t@t
    git config user.name t
    mkdir -p docs src/lib _acceptance/feat
    printf 'd\n' > docs/guide.md
    printf 'c\n' > CHANGELOG.md
    printf 's\n' > src/lib/real.ts
    printf 'a\n' > _acceptance/feat/contract.md
    git add -A && git commit -qm base
  ) >/dev/null 2>&1 || return 1
  printf '%s' "$d"
}

case_exempt_refused() {
  # AC-1 / E1: a union that only ever matches exempt files must be REFUSED.
  # stale_files() drops those files before scope is applied, so such a scope
  # could never report anything again — granting it makes the feature
  # permanently un-stale, silently.
  d="$(mk_repo)" || fail exempt-refused "could not build the fixture repo"
  load_gate_fns "$GATE" || fail exempt-refused "could not extract the gate functions"
  T1_GLOBS="docs/**
CHANGELOG.md"
  if scope_has_any_match "$d" 'docs/**'; then
    fail exempt-refused "narrow scope granted to a union that only matches t1-exempt files"
  fi
  if scope_has_any_match "$d" 'CHANGELOG.md'; then
    fail exempt-refused "narrow scope granted to a union that only matches an exempt literal"
  fi
  # _acceptance/** is dropped by stale_files() through a different branch, so it
  # is a separate way into the same hole and gets its own assertion.
  if scope_has_any_match "$d" '_acceptance/**'; then
    fail exempt-refused "narrow scope granted to a union that only matches _acceptance/"
  fi
  pass exempt-refused
}

case_legit_granted() {
  # AC-3 / E3: the suppression half. A declaration pointing at real gated code
  # must STILL be granted — a fix that refuses everyone rebuilds the treadmill
  # that stale-scope-by-paths existed to remove.
  d="$(mk_repo)" || fail legit-granted "could not build the fixture repo"
  load_gate_fns "$GATE" || fail legit-granted "could not extract the gate functions"
  T1_GLOBS="docs/**
CHANGELOG.md"
  scope_has_any_match "$d" 'src/lib/**' \
    || fail legit-granted "narrow scope refused for a union pointing at real code"
  # A mixed union is legitimate too: it can still report something.
  scope_has_any_match "$d" 'docs/**
src/lib/**' || fail legit-granted "mixed union refused although it matches real code"

  # A non-ASCII filename is the same namespace question in a different disguise:
  # git quotes such paths in ls-files by default while stale_files() reads them
  # unquoted from diff. If the two disagree, a declaration whose only match is
  # such a file is refused narrow scope even though staleness could report it.
  ( cd "$d" && printf 's\n' > "src/lib/café.ts" && git add -A && git commit -qm accented ) >/dev/null 2>&1 \
    || fail legit-granted "could not add a non-ASCII fixture file"
  ( cd "$d" && git rm -q --cached src/lib/real.ts && git commit -qm "leave only the accented file" ) >/dev/null 2>&1 \
    || fail legit-granted "could not isolate the non-ASCII file"
  scope_has_any_match "$d" 'src/lib/**' \
    || fail legit-granted "a union whose only match is a non-ASCII path was refused — ls-files and diff are spelling it differently"
  pass legit-granted
}

case_variants_discriminating() {
  # AC-2 / E2: the variants stale-scope-by-paths already fixed must still be
  # catchable. Perturb a COPY of the gate — never the shipped one, where an env
  # knob would itself be the fail-open (check-stale-scoping.sh's no-kill-switch
  # case asserts exactly that) — and require each perturbation to make this
  # harness red.
  d="$(mk_repo)" || fail variants-discriminating "could not build the fixture repo"
  T1_GLOBS="docs/**
CHANGELOG.md"

  # v1 — namespace: ls-files WITHOUT --full-name prints paths relative to the
  # directory asked about, while every other consumer of these globs matches
  # against `git diff --name-only`, which prints paths relative to the git
  # top-level. The two coincide only when the root IS the git root; in the
  # monorepo layout the gate supports they diverge, and a declaration that
  # matches the ls-files spelling then filters out every real change.
  ( cd "$d" && mkdir -p pkg && git mv src pkg/src && git commit -qm move ) >/dev/null 2>&1 \
    || fail variants-discriminating "could not build the monorepo-shaped fixture"
  copy="$(new_tmp)/gate.sh"
  cp "$GATE" "$copy"
  perl -0pi -e 's/ls-files --full-name/ls-files/' "$copy"
  grep -q 'ls-files --full-name' "$copy" \
    && fail variants-discriminating "v1 perturbation did not apply"
  load_gate_fns "$copy" || fail variants-discriminating "could not extract from the perturbed copy (v1)"
  if scope_has_any_match "$d/pkg" 'pkg/src/**'; then
    fail variants-discriminating "v1 (namespace) not caught: a top-level-relative union matched a directory-relative listing"
  fi
  load_gate_fns "$GATE" || fail variants-discriminating "could not reload the shipped gate"
  scope_has_any_match "$d/pkg" 'pkg/src/**' \
    || fail variants-discriminating "v1 control failed: the shipped gate must still accept this union"

  # v2 — prefix: matching only the leading path component, so a declaration of
  # `src/not-real/**` would be accepted merely because `src/` exists. Perturb
  # match_globs to compare leading components instead of whole patterns.
  #
  # The probe deliberately uses a NON-exempt prefix (`src/`, not `docs/`): under
  # the prefix perturbation the exempt filter above degrades in the same way, so
  # an exempt-prefixed probe would be skipped as exempt and the perturbation
  # would look inert. The "perturbation is inert" assertion below is what makes
  # that failure loud instead of a vacuous green.
  d2="$(mk_repo)" || fail variants-discriminating "could not build the v2 fixture repo"
  copy2="$(new_tmp)/gate2.sh"
  cp "$GATE" "$copy2"
  python3 - "$copy2" <<'PERTURB' || fail variants-discriminating "v2 perturbation did not apply"
import sys
p = sys.argv[1]
s = open(p).read()
old = '    case "$1" in $g) return 0 ;; esac\n'
new = '    case "${1%%/*}" in ${g%%/*}) return 0 ;; esac\n'
if old not in s:
    sys.exit(1)
open(p, 'w').write(s.replace(old, new))
PERTURB
  load_gate_fns "$copy2" || fail variants-discriminating "could not extract from the perturbed copy (v2)"
  if ! scope_has_any_match "$d2" 'src/not-real/**'; then
    fail variants-discriminating "v2 perturbation is inert: a prefix matcher must accept src/not-real/**"
  fi
  load_gate_fns "$GATE" || fail variants-discriminating "could not reload the shipped gate"
  if scope_has_any_match "$d2" 'src/not-real/**'; then
    fail variants-discriminating "v2 (prefix) not caught: the shipped gate accepts a path that does not exist"
  fi

  # v3 / v4 — total-vs-distribution and look-behind attribution live in
  # feature_scope() and slug_acceptance_touched(), already pinned by
  # check-stale-scoping.sh's partial and merged-halves cases. Assert those stay
  # wired rather than duplicating them: a second copy of a guard is a second
  # thing to drift.
  for c in partial merged-halves; do
    grep -F -- "--case $c" "$ROOT/_acceptance/config.yaml" >/dev/null \
      || fail variants-discriminating "variant guard '--case $c' is no longer wired in config.yaml"
  done
  pass variants-discriminating
}

case_case_completeness() {
  missing=""
  for c in $KNOWN_CASES; do
    fn="case_$(printf '%s' "$c" | tr '-' '_')"
    command -v "$fn" >/dev/null 2>&1 || missing="$missing $c"
  done
  [ -z "$missing" ] || fail case-completeness "unimplemented cases:$missing"
  if bash "$0" definitely-not-a-case >/dev/null 2>&1; then
    fail case-completeness "an unknown case name exited 0"
  fi
  missing_cfg=""
  for c in $KNOWN_CASES; do
    grep -F -- "test-scope-namespace.sh $c" "$ROOT/_acceptance/config.yaml" >/dev/null 2>&1 \
      || missing_cfg="$missing_cfg $c"
  done
  [ -z "$missing_cfg" ] \
    || fail case-completeness "cases with no executors.script entry in _acceptance/config.yaml:$missing_cfg"
  pass case-completeness
}

main() {
  [ "$#" -ge 1 ] || { echo "usage: $(basename "$0") <case>" >&2; exit 2; }
  case " $KNOWN_CASES " in
    *" $1 "*) ;;
    *) echo "unknown case '$1' (known: $KNOWN_CASES)" >&2; exit 2 ;;
  esac
  "case_$(printf '%s' "$1" | tr '-' '_')"
}

main "$@"
