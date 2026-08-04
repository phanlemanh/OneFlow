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

b1_guard() { printf '%s' "$ROOT/scripts/plugins/check-no-config-drift.sh"; }

# A manifest the guard will accept as intact: >=30 plugins and the upstream org.
write_manifest() { # <path>
  python3 - "$1" <<'MANIFEST'
import json, sys
json.dump({"org": "https://github.com/tong-io",
           "plugins": ["p%d" % i for i in range(31)]},
          open(sys.argv[1], "w"), indent=2)
MANIFEST
}

case_b1_red() {
  # AC-7 red half / E8: anchoring must not turn a guard into a nodding machine.
  # A fixture whose OWN merge touched a forbidden path must still exit 1, even
  # when the branch has moved on since.
  d="$(new_tmp)"
  (
    cd "$d" || exit 1
    git init -q -b main .
    git config user.email t@t
    git config user.name t
    mkdir -p config scripts/acceptance scripts/plugins _acceptance/guilty
    printf 'seed\n' > seed.txt
    git add -A && git commit -qm base
    git checkout -qb pr
    git add -A 2>/dev/null
    git commit -qm noop --allow-empty
    git checkout -q main
  ) >/dev/null 2>&1 || fail b1-red "could not build the fixture repo"
  write_manifest "$d/config/official-plugins.json"
  (
    cd "$d" || exit 1
    git add -A && git commit -qm manifest
    git checkout -qb pr2
    printf '\n' >> config/official-plugins.json   # the forbidden touch
    git add -A && git commit -qm "pr touches config/"
    git checkout -q main
    git merge -q --no-ff pr2 -m "Merge pull request #1 from t/pr2"
    anchor="$(git rev-parse HEAD)"
    printf -- '---\nslug: guilty\nlanded_merge: %s\n---\n' "$anchor" > _acceptance/guilty/contract.md
    git add -A && git commit -qm contract
    printf 'unrelated\n' > later.txt
    git add -A && git commit -qm "later work by someone else"
  ) >/dev/null 2>&1 || fail b1-red "could not land the guilty pull request"
  cp "$RESOLVER" "$d/scripts/acceptance/own-range.sh"
  cp "$(b1_guard)" "$d/scripts/plugins/check-no-config-drift.sh"
  ( cd "$d" && ACCEPTANCE_SLUG=guilty bash scripts/plugins/check-no-config-drift.sh >/dev/null 2>&1 )
  rc=$?
  [ "$rc" -eq 1 ] \
    || fail b1-red "anchored guard exited $rc on a pull request that DID touch config/ (want 1)"
  pass b1-red
}

case_unanchored_compat() {
  # AC-12 / E13: with ACCEPTANCE_SLUG unset the guard must behave exactly as it
  # does today. An anchoring bug that yielded an empty range would make every
  # open pull request green — the same fail-open family this contract closes.
  d="$(new_tmp)"
  (
    cd "$d" || exit 1
    git init -q -b main .
    git config user.email t@t
    git config user.name t
    mkdir -p config scripts/acceptance scripts/plugins
    printf 'seed\n' > seed.txt
    git add -A && git commit -qm seed
  ) >/dev/null 2>&1 || fail unanchored-compat "could not build the fixture repo"
  write_manifest "$d/config/official-plugins.json"
  (
    cd "$d" || exit 1
    git add -A && git commit -qm base
    git branch -q origin-main
    git checkout -qb work
    printf '\n' >> config/official-plugins.json
    git add -A && git commit -qm "open pull request touches config/"
  ) >/dev/null 2>&1 || fail unanchored-compat "could not build the open pull request"
  cp "$RESOLVER" "$d/scripts/acceptance/own-range.sh"
  cp "$(b1_guard)" "$d/scripts/plugins/check-no-config-drift.sh"
  # A real violation, env unset -> exit 1, exactly today's behaviour.
  ( cd "$d" && bash scripts/plugins/check-no-config-drift.sh origin-main >/dev/null 2>&1 )
  rc=$?
  [ "$rc" -eq 1 ] || fail unanchored-compat "unanchored guard exited $rc on a real violation (want 1)"
  # A clean tree, env unset -> exit 0.
  ( cd "$d" && git checkout -q origin-main && bash scripts/plugins/check-no-config-drift.sh origin-main >/dev/null 2>&1 )
  rc=$?
  [ "$rc" -eq 0 ] || fail unanchored-compat "unanchored guard exited $rc on a clean tree (want 0)"
  pass unanchored-compat
}

case_no_run_exit2() {
  # AC-10 / E10: a valid anchor whose commits carry NO run must read as "could
  # not look" (exit 2), never as a pass. Offline: `gh` is stubbed on PATH, so the
  # assertion is about this library's control flow, not about GitHub.
  d="$(new_tmp)"
  mkdir -p "$d/bin"
  cat > "$d/bin/gh" <<'STUB'
#!/usr/bin/env bash
case "$1 $2" in
  "auth status") exit 0 ;;
  "run list") echo '[]'; exit 0 ;;   # authenticated, looked, found nothing
esac
exit 0
STUB
  chmod +x "$d/bin/gh"

  out="$(cd "$ROOT" && PATH="$d/bin:$PATH" ACCEPTANCE_SLUG=ci-actions-bump bash -c '
      . scripts/ci/gh-run-lib.sh
      find_run ci "" "" ""
  ' 2>&1)"
  rc=$?
  [ "$rc" -eq 2 ] \
    || fail no-run-exit2 "find_run exited $rc when no run exists at any anchored commit (want 2)"
  case "$out" in
    *"ci-actions-bump"*) ;;
    *) fail no-run-exit2 "the anchored miss did not name the pull request it looked at — that message is what distinguishes it from an unanchored miss: $out" ;;
  esac
  case "$out" in
    *"must actually have run"*) ;;
    *) fail no-run-exit2 "exit 2 carried no explanation of what could not be seen" ;;
  esac

  # AC-12, the gh-run-lib half: unanchored, still exit 2, and still by the
  # pre-existing message. The no-anchor path is not allowed to change shape.
  out2="$(cd "$ROOT" && PATH="$d/bin:$PATH" bash -c '
      . scripts/ci/gh-run-lib.sh
      find_run ci "" "" "some-branch"
  ' 2>&1)"
  rc2=$?
  [ "$rc2" -eq 2 ] || fail no-run-exit2 "unanchored find_run exited $rc2 with no runs (want 2)"
  case "$out2" in
    *"on branch some-branch"*) ;;
    *) fail no-run-exit2 "unanchored miss no longer reports the branch it looked on: $out2" ;;
  esac

  # And anchor_tip() must still resolve to HEAD when unanchored — a tip that
  # silently became something else would move every provenance comparison.
  tip="$(cd "$ROOT" && bash -c '. scripts/ci/gh-run-lib.sh; anchor_tip' 2>/dev/null)"
  [ "$tip" = "$(git -C "$ROOT" rev-parse HEAD)" ] \
    || fail no-run-exit2 "unanchored anchor_tip is '$tip', not HEAD"
  pass no-run-exit2
}

case_backfill_integration() {
  # AC-11 / E12 — OFFLINE ONLY, with each assertion named individually so a
  # check that never ran cannot hide behind a shared exit code. The network
  # guards of ci-actions-bump belong to E9/E11 and are deliberately absent here.
  for pair in "ci-actions-bump 8477f8a" "dependency-refresh-2026-07 4d89b58" "oneflow-plugin-prefix dd39da8"; do
    slug="${pair%% *}"
    want="${pair##* }"
    out="$(bash "$RESOLVER" "$slug" --root "$ROOT")" \
      || fail backfill-integration "own-range.sh could not resolve the anchor of '$slug'"
    got="$(field "$out" range_to)"
    [ "$got" = "$(git -C "$ROOT" rev-parse "$want")" ] \
      || fail backfill-integration "$slug resolves to $got, expected $want"
    # NOT a bare grep for "ACCEPTANCE_SLUG=$slug" anywhere in the file: this
    # contract's OWN executor keys carry those strings, so such a grep passes
    # while the feature's own keys still run unanchored — a vacuous green of
    # exactly the kind these guards exist to refuse. Resolve the keys the
    # feature's evals.yaml actually references, and require every one of them
    # that invokes an anchored guard to carry that feature's slug.
    unanchored="$(FEATURE_SLUG="$slug" python3 "$HERE/lib/anchored-keys.py" "$ROOT")" \
      || fail backfill-integration "could not cross-check $slug's executor keys"
    [ -z "$unanchored" ] \
      || fail backfill-integration "$slug's own eval keys invoke an anchored guard without ACCEPTANCE_SLUG=$slug: $unanchored"
  done
  ( cd "$ROOT" && ACCEPTANCE_SLUG=oneflow-plugin-prefix bash scripts/plugins/check-no-config-drift.sh >/dev/null 2>&1 ) \
    || fail backfill-integration "check-no-config-drift is not green under its own anchor"
  ( cd "$ROOT" && ACCEPTANCE_SLUG=dependency-refresh-2026-07 bash scripts/deps/check-no-t3-drift.sh >/dev/null 2>&1 ) \
    || fail backfill-integration "check-no-t3-drift is not green under its own anchor"
  ( cd "$ROOT" && ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-workflow-drift.sh >/dev/null 2>&1 ) \
    || fail backfill-integration "check-workflow-drift is not green under its own anchor"
  pass backfill-integration
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
