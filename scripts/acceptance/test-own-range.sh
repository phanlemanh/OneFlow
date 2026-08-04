#!/usr/bin/env bash
# Guard for scripts/acceptance/own-range.sh and its consumers.
#
# Lives under scripts/acceptance/ on purpose: risk_tiers.t1_skip_globs exempts
# the gate tooling by EXACT path, so this file is gated and the gate applies to
# the change that alters the gate.
#
# One case per criterion, each with its own exit code. Several criteria behind
# one command would mean a case that was never implemented looks identical to a
# case that passed — the failure stale-scope-by-paths shipped and had to fix.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
RESOLVER="$HERE/own-range.sh"

KNOWN_CASES="anchored unlanded malformed b1-red no-run-exit2 unanchored-compat backfill-integration case-completeness"

# Real merge commits in this repo, verified 2026-08-04 (each has a second parent).
ANCHOR_CI="8477f8a"        # PR #17 — ci-actions-bump
# Two DIFFERENT commits inside PR #17: the CI run sits on one, both dispatch runs
# on the other. This is the whole reason an anchor must be a commit SET.
PR17_CI_SHA="60c4797"
PR17_DISPATCH_SHA="b48699c6"

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

field() { # <resolver-output> <key>
  printf '%s\n' "$1" | sed -n "s/^$2=//p"
}

case_anchored() {
  # AC-4 / E4: a real merge commit resolves to its own PR range, and the commit
  # SET carries both shas that hold runs.
  out="$(bash "$RESOLVER" ci-actions-bump --root "$ROOT")" \
    || fail anchored "resolver exited non-zero on a valid anchor"
  from="$(field "$out" range_from)"
  to="$(field "$out" range_to)"
  commits="$(field "$out" commits)"
  [ "$to" = "$(git -C "$ROOT" rev-parse "$ANCHOR_CI")" ] \
    || fail anchored "range_to=$to is not $ANCHOR_CI"
  [ "$from" = "$(git -C "$ROOT" rev-parse "${ANCHOR_CI}^1")" ] \
    || fail anchored "range_from=$from is not ${ANCHOR_CI}^1"
  for want in "$PR17_CI_SHA" "$PR17_DISPATCH_SHA"; do
    full="$(git -C "$ROOT" rev-parse "$want")"
    case " $commits " in
      *" $full "*) ;;
      *) fail anchored "commit set is missing $want — the set is why anchoring works" ;;
    esac
  done
  pass anchored
}

case_unlanded() {
  # AC-5 / E5: no landed_merge -> merge-base(HEAD, main)..HEAD, which is what
  # every guard does today. Built in a throwaway repo so the assertion does not
  # depend on where this branch happens to be sitting.
  d="$(new_tmp)"
  (
    cd "$d" || exit 1
    git init -q .
    git config user.email t@t
    git config user.name t
    mkdir -p _acceptance/tmpfeat
    printf 'x\n' > a.txt
    git add -A && git commit -qm base
    git branch -q main-ish
    printf 'y\n' > b.txt
    git add -A && git commit -qm work
    printf -- '---\nslug: tmpfeat\n---\n' > _acceptance/tmpfeat/contract.md
    git add -A && git commit -qm contract
  ) || fail unlanded "could not build the fixture repo"
  out="$(MAIN_REF=main-ish bash "$RESOLVER" tmpfeat --root "$d")" \
    || fail unlanded "resolver exited non-zero with no anchor"
  want_from="$(git -C "$d" merge-base HEAD main-ish)"
  [ "$(field "$out" range_from)" = "$want_from" ] \
    || fail unlanded "range_from is not merge-base(HEAD, main)"
  [ "$(field "$out" range_to)" = "$(git -C "$d" rev-parse HEAD)" ] \
    || fail unlanded "range_to is not HEAD"
  pass unlanded
}

case_malformed() {
  # AC-6 / E6: three distinct broken anchors, three exit 2s — never a range.
  d="$(new_tmp)"
  (
    cd "$d" || exit 1
    git init -q .
    git config user.email t@t
    git config user.name t
    mkdir -p _acceptance/bad
    printf 'x\n' > a.txt
    git add -A && git commit -qm base
  ) || fail malformed "could not build the fixture repo"
  plain="$(git -C "$d" rev-parse HEAD)"
  write_anchor() { printf -- '---\nslug: bad\nlanded_merge: %s\n---\n' "$1" > "$d/_acceptance/bad/contract.md"; }

  write_anchor "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
  bash "$RESOLVER" bad --root "$d" >/dev/null 2>&1
  [ "$?" -eq 2 ] || fail malformed "a nonexistent sha did not exit 2"

  # A real commit with no second parent: the squash-landed shape. Approximating
  # here would hand a guard the wrong range and call it an answer.
  write_anchor "$plain"
  bash "$RESOLVER" bad --root "$d" >/dev/null 2>&1
  [ "$?" -eq 2 ] || fail malformed "a non-merge commit did not exit 2"

  write_anchor "not-a-sha; rm -rf /"
  bash "$RESOLVER" bad --root "$d" >/dev/null 2>&1
  [ "$?" -eq 2 ] || fail malformed "a garbage anchor did not exit 2"

  # The resolver reads frontmatter with its own reader; pre-merge-check.sh has a
  # twin (front_field). Drift between the two is a silently different anchor, so
  # pin them to the same answer on a contract built to trip a sloppy reader: a
  # decoy in the body, a trailing comment, and quotes.
  printf -- '---\nslug: bad\nlanded_merge: "%s"  # PR #99\n---\n\nlanded_merge: cafebabe\n' \
    "$plain" > "$d/_acceptance/bad/contract.md"
  ff_src="$(sed -n '/^front_field()/,/^}/p' "$ROOT/scripts/pre-merge-check.sh")"
  [ -n "$ff_src" ] || fail malformed "could not extract front_field() from pre-merge-check.sh"
  eval "$ff_src"
  twin="$(front_field "$d/_acceptance/bad/contract.md" landed_merge)"
  mine="$(bash "$RESOLVER" bad --root "$d" --print-anchor 2>/dev/null || true)"
  [ "$twin" = "$mine" ] \
    || fail malformed "frontmatter readers disagree: gate says '$twin', resolver says '$mine'"
  pass malformed
}

case_case_completeness() {
  # A case that was never implemented must be loud, not absent — and a case that
  # exists but is wired nowhere never runs (the indent-drift lesson).
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
    grep -F -- "test-own-range.sh $c" "$ROOT/_acceptance/config.yaml" >/dev/null 2>&1 \
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
