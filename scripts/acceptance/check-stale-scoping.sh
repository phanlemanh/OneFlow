#!/usr/bin/env bash
# Guard for the paths-scoped staleness mechanism in pre-merge-check.sh.
#
# Lives under scripts/acceptance/ on purpose: risk_tiers.t1_skip_globs exempts
# the gate tooling by EXACT path, so this file is gated and the gate applies to
# the change that alters the gate (AC-11).
#
# One case per criterion, each with its own exit code. Nine criteria behind one
# command would mean a case that was never implemented looks identical to a case
# that passed.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
GATE="$ROOT/scripts/pre-merge-check.sh"

# Fixture-construction helpers (mk_fixture, write_report, mk_pair_fixture,
# etc.) live in a sibling file purely to keep this one under the repo's
# 800-line convention. Sourced via the same cd-based HERE this file already
# resolves above, so it works regardless of the caller's working directory.
. "$HERE/fixtures.sh"

# Cases use new_case_tmpdir() (fixtures.sh) for temp dirs; this one EXIT trap
# cleans them all up on pass, on fail()'s exit, and on interrupt alike.
trap cleanup_case_tmpdirs EXIT

KNOWN_CASES="in-scope out-of-scope partial under-declared malformed indent-drift merged-halves two-bases suppression announce fork-undeclared fork-declared-in-union undeclared mutation case-completeness guard-not-exempt no-kill-switch"

# Perturbation knob names. Referenced here and asserted ABSENT from the shipped
# gate by the no-kill-switch case: an env var in the gate itself would be a
# production kill switch (set it, every declared feature gets a match-nothing
# scope, the gate exits clean).
KNOB_NO_MATCH="STALE_SCOPE_FORCE_NO_MATCH"
KNOB_ALWAYS_COMPLETE="STALE_SCOPE_FORCE_COMPLETE"

pass() { echo "CASE $1: PASS"; }
fail() { echo "CASE $1: FAIL $2"; exit 1; }

case_case_completeness() {
  # E10: a case that was never implemented must be loud, not absent. Every name
  # in KNOWN_CASES must dispatch to a function that exists.
  missing=""
  for c in $KNOWN_CASES; do
    fn="case_$(printf '%s' "$c" | tr '-' '_')"
    command -v "$fn" >/dev/null 2>&1 || missing="$missing $c"
  done
  [ -z "$missing" ] || fail case-completeness "unimplemented cases:$missing"
  # And an unknown case name must be rejected rather than silently succeeding.
  if bash "$0" --case definitely-not-a-case >/dev/null 2>&1; then
    fail case-completeness "unknown case name exited 0"
  fi
  # A case can exist here and still never RUN anywhere: exactly what happened
  # to indent-drift, which shipped a working function with no
  # _acceptance/config.yaml executors.script key pointing `--case
  # indent-drift` at it, so nothing at verify time or in CI ever invoked it.
  # Every name in KNOWN_CASES must appear as a literal `--case <name>` inside
  # _acceptance/config.yaml (moved to fixtures.sh's
  # assert_cases_wired_in_config() purely for this file's 800-line cap).
  missing_cfg="$(assert_cases_wired_in_config "$ROOT/_acceptance/config.yaml")"
  [ -z "$missing_cfg" ] \
    || fail case-completeness "cases with no --case <name> wired into _acceptance/config.yaml executors.script:$missing_cfg"
  pass case-completeness
}

case_guard_not_exempt() {
  # E11 / AC-11: this guard's own path must match NO glob in t1_skip_globs, or
  # the gate would exempt the change that alters the gate.
  #
  # Reuse match_globs() from the gate instead of hand-rolling a second glob
  # matcher: `case` pattern semantics differ between shells, and a private
  # copy would silently drift from what the gate actually does. Extracting
  # only the function body (not sourcing/executing the whole gate script,
  # which has side effects and calls exit) keeps this guard tested against
  # the exact matcher the gate ships.
  match_globs_src="$(sed -n '/^match_globs()/,/^}/p' "$GATE")"
  [ -n "$match_globs_src" ] || fail guard-not-exempt "could not extract match_globs() from $GATE"
  eval "$match_globs_src"

  globs="$(sed -n '/^  t1_skip_globs:/,/^  [a-zA-Z0-9_-]*:/p' "$ROOT/_acceptance/config.yaml" \
    | sed -n 's/^[[:space:]]*-[[:space:]]*//p' \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'\$//")"
  [ -n "$globs" ] || fail guard-not-exempt "could not read t1_skip_globs"

  self="scripts/acceptance/check-stale-scoping.sh"
  if match_globs "$self" "$globs"; then
    fail guard-not-exempt "$self is exempt via a t1_skip_globs entry"
  fi
  # Same check for the fixture-construction helpers this guard sources
  # (scripts/acceptance/fixtures.sh): a helper the gate exempts would be a
  # hole in the same way $self being exempt would be.
  helper="scripts/acceptance/fixtures.sh"
  if match_globs "$helper" "$globs"; then
    fail guard-not-exempt "$helper is exempt via a t1_skip_globs entry"
  fi
  # Sanity: the matcher must actually match something, or the check above
  # proves nothing. A path that IS exempt has to be seen as exempt.
  known_exempt="scripts/pre-merge-check.sh"
  if ! match_globs "$known_exempt" "$globs"; then
    fail guard-not-exempt "matcher matched nothing — check is vacuous"
  fi
  pass guard-not-exempt
}

case_no_kill_switch() {
  # E13 / AC-13: the perturbation knobs must exist only in this guard's temp
  # copy, never in the shipped gate.
  for k in "$KNOB_NO_MATCH" "$KNOB_ALWAYS_COMPLETE"; do
    if grep -q "$k" "$GATE"; then
      fail no-kill-switch "shipped gate references perturbation knob $k"
    fi
  done
  pass no-kill-switch
}

case_partial() {
  # E4 / AC-4: paths on some evals but not all is the state a half-finished
  # backfill leaves behind. Scoping by a partial list is worse than not scoping.
  d="$(new_case_tmpdir)"
  mk_fixture "$d" fx partial
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$vc" 2>&1)"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail partial "partial declaration did not fall back to whole-tree: $out"
  printf '%s\n' "$out" | grep -q 'narrow scope' \
    && fail partial "partial declaration was granted narrow scope"

  # Same partial declaration, hidden behind balanced TOTALS: two `paths:`
  # lines on one eval and none on the other. A completeness test that counts
  # eval lines against paths lines sees 2 == 2 and calls it complete, then
  # builds the union from the one eval that declared twice while the other
  # eval's implicit whole-tree scope vanishes. A copy-paste duplicate is
  # enough to reach it, so it is not an exotic shape.
  # ISOLATION, rebuilt for the STALE-DIFF-SCOPE-GUARD fork. The old shape kept
  # `_acceptance/fx/` out of the PR diff so the cross-check could not refuse
  # the scope on its own and mask the completeness test. Since the fork that
  # same shape also skips the staleness block entirely, so it now masks
  # everything. Isolation is achieved from the other side instead: the slug IS
  # in the diff, and the drift is placed INSIDE the union the duplicate
  # declares so the cross-check PASSES — leaving the completeness test as the
  # only thing that can still refuse the scope.
  #
  # Which assertion carries the signal changed with it. A granted scope would
  # cover src/covered/** too, so the file stales either way and the
  # `evidence is stale` assertion no longer discriminates; the discriminating
  # one is the `narrow staleness scope applied` assertion, which appears only
  # if the completeness test wrongly reads this partial declaration as
  # complete. Kept both: the second is still a regression guard on the
  # fallback itself.
  d2="$(new_case_tmpdir)"
  base2="$(mk_committed_report_fixture "$d2" fx dup)"
  ( cd "$d2" && echo drift > src/covered/new.txt && pr_touches_artifacts "$d2" fx && git add -A && git commit -q -m drift )
  out2="$(bash "$GATE" "$d2" --base "$base2" 2>&1)"
  printf '%s\n' "$out2" | grep -q 'narrow staleness scope applied' \
    && fail partial "duplicate-key partial declaration was granted narrow scope: $out2"
  printf '%s\n' "$out2" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail partial "duplicate-key partial declaration did not fall back to whole-tree: $out2"

  # Third shape of the same lie: E2 declares nothing, and a `paths:` key at the
  # eval-key column sits in an unrelated mapping BELOW the evals list. Totals
  # balance, and attributing a paths line to the "nearest `- id:` above"
  # without checking it is still INSIDE that eval hands the stray key to E2 —
  # the union then gains a glob no eval declared. Same rebuilt isolation as
  # above: slug in the diff, drift inside the union so the cross-check passes.
  d3="$(new_case_tmpdir)"
  base3="$(mk_committed_report_fixture "$d3" fx stray)"
  ( cd "$d3" && echo drift > src/covered/new.txt && pr_touches_artifacts "$d3" fx && git add -A && git commit -q -m drift )
  out3="$(bash "$GATE" "$d3" --base "$base3" 2>&1)"
  printf '%s\n' "$out3" | grep -q 'narrow staleness scope applied' \
    && fail partial "stray out-of-block paths key was folded into a granted scope: $out3"
  printf '%s\n' "$out3" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail partial "stray out-of-block paths key did not fall back to whole-tree: $out3"
  pass partial
}

case_malformed() {
  # E6 / AC-6: `paths: []` must read as not-declared. Read as "declared with an
  # empty scope" it matches nothing, i.e. never stale — the worst misreading.
  d="$(new_case_tmpdir)"
  mk_fixture "$d" fx empty
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$vc" 2>&1)"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail malformed "empty paths array did not fall back to whole-tree: $out"
  pass malformed
}

case_indent_drift() { run_indent_drift_case; } # E-indent-drift/AC-6 — real body (27 assertions on feature_scope()'s YAML-shape handling) is run_indent_drift_case() in fixtures.sh, moved there only for this file's 800-line cap

case_in_scope() {
  # E1 / AC-1: THE load-bearing case. Narrow scope must still catch a change
  # inside the declared union — a mechanism degraded into "never stale" passes
  # every other criterion in this guard.
  d="$(new_case_tmpdir)"
  mk_fixture "$d" fx all
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && echo drift > src/covered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$vc" 2>&1)"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail in-scope "in-union change did NOT stale the feature: $out"

  # Non-ASCII path inside the declared union: `git diff --name-only` quotes
  # and octal-escapes a non-ASCII path by default (core.quotePath), so it
  # arrives as a literal string like "caf\303\251.txt" that can never match a
  # plain-ASCII glob.
  #
  # The PR carries the feature's artifacts (pr_touches_artifacts) because the
  # STALE-DIFF-SCOPE-GUARD fork examines staleness only for a feature inside
  # the PR diff; without them the gate prints `OK [fx]` having looked at
  # nothing and this assertion measures silence. The old shape here committed
  # the report separately to dodge the cross-check, which the fork has welded
  # to the same switch. Dodging is no longer possible, so instead the
  # cross-check is made to PASS rather than be skipped: mode `all` declares
  # src/covered/**, and the PR's only gated file is inside it.
  d2="$(new_case_tmpdir)"
  base2="$(mk_committed_report_fixture "$d2" fx all)"
  ( cd "$d2" && printf 'x' > "src/covered/café.txt" && pr_touches_artifacts "$d2" fx && git add -A && git commit -q -m "non-ascii file in scope" )
  out2="$(bash "$GATE" "$d2" --base "$base2" 2>&1)"
  printf '%s\n' "$out2" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail in-scope "non-ASCII in-union path did NOT stale the feature (quoted-path dropped from narrow scope): $out2"
  printf '%s\n' "$out2" | grep -qF 'café.txt' \
    || fail in-scope "non-ASCII in-union path was staled but not named cleanly (still quoted/escaped): $out2"

  # Monorepo layout ($ROOT below the git top-level), both spellings. Every
  # other fixture here puts $ROOT at the git root, where ls-files and
  # `diff --name-only` agree and a namespace mismatch cannot show. Half 3a: a
  # top-level-spelled declaration must behave exactly like the flat case —
  # an in-union change still stales. Half 3b is the regression proper: a
  # $ROOT-relative spelling matches no tracked file in the namespace the
  # staleness filter uses, so it must be REFUSED out loud and fall back to
  # whole-tree — never granted and then silently filtering everything out,
  # which is "never stale" wearing a narrow-scope hat.
  d3="$(new_case_tmpdir)"
  base3="$(mk_subdir_fixture "$d3" fx 'pkg/src/covered/**')"
  ( cd "$d3" && echo drift > pkg/src/covered/new.txt && pr_touches_artifacts "$d3/pkg" fx && git add -A && git commit -q -m drift )
  out3="$(bash "$GATE" "$d3/pkg" --base "$base3" 2>&1)"
  printf '%s\n' "$out3" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail in-scope "subdir root, top-level-spelled paths: in-union change did NOT stale the feature: $out3"

  d4="$(new_case_tmpdir)"
  base4="$(mk_subdir_fixture "$d4" fx 'src/covered/**')"
  ( cd "$d4" && echo drift > pkg/src/covered/new.txt && pr_touches_artifacts "$d4/pkg" fx && git add -A && git commit -q -m drift )
  out4="$(bash "$GATE" "$d4/pkg" --base "$base4" 2>&1)"
  # The protective property is unchanged — a $ROOT-relative spelling must never
  # be granted a scope that silently filters everything out — but since the
  # STALE-DIFF-SCOPE-GUARD fork it is a DIFFERENT guard that catches it, so the
  # assertion is on the outcome rather than on one message.
  #
  # Reachability, measured: for the staleness block to run at all the slug must
  # be in the PR diff, which also switches the cross-check on; for the
  # cross-check to pass, the declared union must cover a non-empty gated
  # coverage set, i.e. it must match at least one tracked file — which is
  # exactly what the `match no gated file` refusal requires to be false. The
  # two conditions cannot hold at once, so that specific refusal is no longer
  # reachable from any fixture. Here the namespace mismatch surfaces as the
  # cross-check's `do not cover` refusal instead. Both refuse the scope and
  # fall back to whole-tree, which is the behaviour this case exists to pin.
  printf '%s\n' "$out4" | grep -qE 'NOTE \[fx\]: declared eval paths (match no gated file|do not cover)' \
    || fail in-scope "subdir root, \$ROOT-relative paths: match-nothing declaration was NOT refused: $out4"
  printf '%s\n' "$out4" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail in-scope "subdir root, \$ROOT-relative paths: refused scope did NOT fall back to whole-tree staleness: $out4"
  pass in-scope
}

case_out_of_scope() {
  # E2 / AC-2: the behaviour the feature exists to produce.
  #
  # The report is committed on its own, and --base is taken AFTER that commit
  # (not at the same commit the report's own verified_commit points to), so
  # this feature's _acceptance/fx/ is NOT part of the PR diff the Task-6
  # cross-check inspects (case_merged_halves' "half A" shape). That isolates
  # what this case exists to prove — an out-of-declared-scope change alone
  # does not stale the feature — from the cross-check, which is a separate
  # concern exercised by case_under_declared / case_merged_halves / case_two_bases.
  d="$(new_case_tmpdir)"
  mk_fixture "$d" fx narrow
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && git add -A && git commit -q -m report )
  base="$(git -C "$d" rev-parse HEAD)"
  ( cd "$d" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    && fail out-of-scope "out-of-union change still staled the feature: $out"
  printf '%s\n' "$out" | grep -q 'OK \[fx\]' \
    || fail out-of-scope "feature not reported OK: $out"
  # No over-refusal (Task 6): "narrow" mode's paths ("src/covered/**") DO
  # match a tracked file (src/covered/seed.txt, seeded by mk_fixture) — the
  # match-nothing guard must not misfire on a legitimately-matching
  # declaration and fall back to whole-tree scope.
  printf '%s\n' "$out" | grep -q 'match no gated file' \
    && fail out-of-scope "match-nothing guard wrongly refused a declaration whose globs DO match a tracked file: $out"
  pass out-of-scope
}

case_suppression() {
  # E8 / AC-8: the pre-existing exclusions must survive refactoring the
  # function that applies them — for declared and undeclared features alike.
  for mode in all none; do
    d="$(new_case_tmpdir)"
    mk_fixture "$d" fx "$mode"
    vc="$(git -C "$d" rev-parse HEAD)"
    write_report "$d" fx "$vc"
    ( cd "$d" && echo x > docs/note.md && echo y >> _acceptance/fx/run-log.jsonl && git add -A && git commit -q -m docs )
    out="$(bash "$GATE" "$d" --base "$vc" 2>&1)"
    if printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale'; then
      fail suppression "docs/_acceptance-only change staled a $mode-paths feature: $out"
    fi
  done
  pass suppression
}

case_announce() {
  # E15 / AC-14: a granted narrow scope is the only path that WEAKENS the gate,
  # and it used to have no output at all. Undeclared (below) must still stay
  # silent, or AC-3 breaks.
  #
  # Rebuilt for the STALE-DIFF-SCOPE-GUARD fork. The old shape kept
  # `_acceptance/fx/` out of the PR diff to dodge Task 6's cross-check; the
  # fork made that same shape skip the staleness block outright, so the gate
  # printed `OK [fx]: PASS` and this case asserted against silence. A granted
  # scope now requires BOTH halves at once: the slug in the diff (or nothing is
  # examined) and the cross-check passing (or the scope is refused). That is
  # exactly case_two_bases' shape, so it is reused here — the out-of-scope
  # change lands BEFORE the base, where it is inside the feature's staleness
  # range but outside the PR's coverage set, which is what leaves the
  # announcement something to report as suppressed.
  d="$(new_case_tmpdir)"; d2="$(new_case_tmpdir)"
  mk_fixture "$d" fx narrow
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && git add -A && git commit -q -m report )
  ( cd "$d" && echo old > src/uncovered/unrelated.txt && git add -A && git commit -q -m "unrelated merge" )
  base="$(git -C "$d" rev-parse HEAD)"
  ( cd "$d" && echo new > src/covered/pr.txt && pr_touches_artifacts "$d" fx && git add -A && git commit -q -m pr )
  out="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$out" | grep -q 'narrow staleness scope applied' || fail announce "no announcement for a granted narrow scope: $out"
  printf '%s\n' "$out" | grep -q 'suppressed' || fail announce "announcement does not say the narrowing suppressed a whole-tree change: $out"
  # Undeclared half: the slug is in the diff here too, so the staleness block
  # genuinely runs and the silence below is a measured silence rather than the
  # fork's. Without it this assertion passes on every input, AC-3 included.
  base2="$(mk_committed_report_fixture "$d2" fx none)"
  ( cd "$d2" && echo drift > src/uncovered/new.txt && pr_touches_artifacts "$d2" fx && git add -A && git commit -q -m drift )
  out2="$(bash "$GATE" "$d2" --base "$base2" 2>&1)"
  printf '%s\n' "$out2" | grep -q 'narrow staleness scope applied' && fail announce "undeclared feature produced an announcement: $out2"
  printf '%s\n' "$out2" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail announce "undeclared feature was not staled by a gated change — the staleness block did not run, so the silence above proves nothing: $out2"
  pass announce
}

case_fork_undeclared() {
  # E4 / AC-3 — nửa SUPPRESSION của hồ sơ gate-tooling-t1. Feature KHÔNG khai
  # `paths` và `_acceptance/fx/` NGOÀI diff PR: fork STALE-DIFF-SCOPE-GUARD bỏ
  # qua trọn khối, nên nó không bị báo stale dù có thay đổi gated sau
  # verified_commit. Đây là lý do fork tồn tại (chống chặn-mọi-PR-vì-lịch-sử),
  # nên một bản "thu hẹp fork" tay trượt thành gỡ hẳn fork phải làm case này đỏ.
  d="$(new_case_tmpdir)"
  base="$(mk_committed_report_fixture "$d" fx none)"
  ( cd "$d" && echo drift > src/covered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$out" | grep -q 'OK \[fx\]' \
    || fail fork-undeclared "feature không xuất hiện trong output — case này khẳng định một sự VẮNG MẶT, nên phải chứng minh feature được cổng nhìn thấy trước đã: $out"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    && fail fork-undeclared "feature không khai paths, ngoài diff PR, vẫn bị báo stale — fork đã mất tác dụng bảo vệ và treadmill mở lại cho mọi feature whole-tree: $out"
  printf '%s\n' "$out" | grep -q 'narrow staleness scope applied' \
    && fail fork-undeclared "feature không khai paths lại được cấp narrow scope (AC-3 mệnh đề (c) của stale-scope-by-paths): $out"

  # ĐỐI CHỨNG, trong cùng fixture: đưa artifact vào diff thì CHÍNH thay đổi
  # gated đó PHẢI làm feature stale. Thiếu vế này, case trên vẫn xanh khi
  # `src/covered/new.txt` không phải file gated chút nào — tức nó sẽ chứng minh
  # sự im lặng bằng một thay đổi vô hại, không phải bằng fork.
  ( cd "$d" && pr_touches_artifacts "$d" fx && git add -A && git commit -q -m "artifact touch" )
  ctl="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$ctl" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail fork-undeclared "đối chứng thất bại: cùng thay đổi đó KHÔNG làm feature stale kể cả khi artifact nằm trong diff, nên sự im lặng ở trên không chứng minh được gì về fork: $ctl"
  pass fork-undeclared
}

case_fork_declared_in_union() {
  # E5 / AC-4 — nửa should-fire, đối xứng với case_out_of_scope. Feature khai
  # ĐỦ `paths`, `_acceptance/fx/` NGOÀI diff PR (nên fork thu hẹp vẫn cho nó vào
  # khối, và cross-check không chạy — AC-7 vế 1), và file đổi nằm TRONG union.
  # Thiếu case này thì "thu hẹp fork" có thể thoái hoá thành "không bao giờ
  # stale" mà out-of-scope, announce và fork-undeclared vẫn xanh hết.
  d="$(new_case_tmpdir)"
  base="$(mk_committed_report_fixture "$d" fx narrow)"
  ( cd "$d" && echo drift > src/covered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$out" | grep -q 'narrow staleness scope applied' \
    || fail fork-declared-in-union "feature khai đủ paths ngoài diff KHÔNG được vào khối staleness — fork chưa thu hẹp, và AC-2 lại mất chỗ quan sát: $out"
  printf '%s\n' "$out" | grep -qi 'do not cover' \
    && fail fork-declared-in-union "cross-check chạy dù artifact nằm NGOÀI diff PR (AC-7 vế 1): $out"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail fork-declared-in-union "file NẰM TRONG union đã khai mà không làm feature stale — narrow scope đã thoái hoá thành 'không bao giờ stale': $out"
  printf '%s\n' "$out" | grep -q 'src/covered/new.txt' \
    || fail fork-declared-in-union "feature bị báo stale nhưng không nêu tên file — báo stale mà không chỉ được file là không sửa được: $out"
  pass fork-declared-in-union
}

case_undeclared() {
  # E7 / AC-6 — item 0.8(a). AC-3 mệnh đề (a) của stale-scope-by-paths: khai
  # ZERO `paths` + thay đổi gated thì VẪN phải báo stale. Mệnh đề này mất eval
  # máy từ 05/08 khi E3 bị descope. Khác case_fork_undeclared ở ĐÚNG MỘT biến:
  # ở đây `_acceptance/fx/` NẰM TRONG diff, nên khối staleness thật sự chạy.
  d="$(new_case_tmpdir)"
  base="$(mk_committed_report_fixture "$d" fx none)"
  ( cd "$d" && echo drift > src/covered/new.txt && pr_touches_artifacts "$d" fx && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail undeclared "khai 0 paths + thay đổi gated mà KHÔNG bị báo stale — cơ chế đã thoái hoá thành 'không bao giờ stale' cho đúng nhóm chưa hề chọn tham gia: $out"
  printf '%s\n' "$out" | grep -q 'narrow staleness scope applied' \
    && fail undeclared "feature khai 0 paths lại được cấp narrow scope (AC-3 mệnh đề (b)+(c)): $out"
  pass undeclared
}

case_under_declared() {
  # E5 / AC-5: complete paths that miss part of the COVERAGE SET, with the
  # feature's artifacts in the PR diff → refuse narrow scope and NAME the files.
  d="$(new_case_tmpdir)"
  mk_fixture "$d" fx narrow
  base="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$base"
  ( cd "$d" && echo drift > src/uncovered/new.txt \
      && echo touched >> _acceptance/fx/run-log.jsonl \
      && git add -A && git commit -q -m "pr" )
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && git add -A && git commit -q -m "repin" )
  out="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$out" | grep -q 'src/uncovered/new.txt' \
    || fail under-declared "uncovered file not named in output: $out"
  printf '%s\n' "$out" | grep -qi 'not covered\|uncovered' \
    || fail under-declared "no under-declaration message: $out"

  # The SAME under-declaration in the monorepo layout ($ROOT below the git
  # top-level). The cross-check only runs when this feature's own
  # _acceptance/<slug>/ is in the PR diff, and that test reads `git diff
  # --name-only` output — whose paths are top-level-relative. A
  # top-level-anchored prefix test therefore never matches here, the
  # cross-check silently never runs, and narrow scope is granted UNCHECKED:
  # AC-5 and AC-7 both dead, with no eval noticing. The two layouts must give
  # the same answer; that is the whole assertion.
  d2="$(new_case_tmpdir)"
  base2="$(mk_subdir_crosscheck_fixture "$d2" fx 'pkg/src/covered/**')"
  write_report "$d2/pkg" fx "$base2"
  ( cd "$d2" && echo drift > pkg/src/uncovered/new.txt \
      && echo touched >> pkg/_acceptance/fx/run-log.jsonl \
      && git add -A && git commit -q -m "pr" )
  vc2="$(git -C "$d2" rev-parse HEAD)"
  write_report "$d2/pkg" fx "$vc2"
  ( cd "$d2" && git add -A && git commit -q -m "repin" )
  out2="$(bash "$GATE" "$d2/pkg" --base "$base2" 2>&1)"
  printf '%s\n' "$out2" | grep -qi 'not covered\|uncovered' \
    || fail under-declared "subdir root: cross-check did not fire, narrow scope granted unchecked: $out2"
  printf '%s\n' "$out2" | grep -qF 'pkg/src/uncovered/new.txt' \
    || fail under-declared "subdir root: uncovered file not named in output: $out2"
  pass under-declared
}

# ── case_merged_halves helpers ───────────────────────────────────────────────
# E7 / AC-7 covers seven distinct sub-scenarios (A-G). They stay behind this
# ONE case (see the KNOWN_CASES note at the top of this file for why they are
# not split into separate --case entries), but each sub-scenario gets its own
# helper function below so the top-level case_merged_halves body stays a short
# list of calls instead of one long function.

# merged_halves_ab — Half A: artifacts NOT in the PR diff → narrow scope, no
# cross-check. Half B: same feature, artifacts IN the PR diff → cross-check
# runs. Operates on the shared "$d"/"$base" globals case_merged_halves sets up
# (Half C/D below reuse the same fixture and PR history).
merged_halves_ab() {
  mk_fixture "$d" fx narrow
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && git add -A && git commit -q -m report )
  base="$(git -C "$d" rev-parse HEAD)"
  ( cd "$d" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m "code only" )
  outA="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$outA" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    && fail merged-halves "half A: narrow scope was not granted: $outA"
  # Match the cross-check's OWN wording ("do not cover"), not a bare
  # "uncovered" substring — half A's own drift file lives under
  # src/uncovered/, so a path-name match would misfire on that filename
  # inside the (unrelated) T1-escape PR-level NOTE/VIOLATION, not on
  # whether the cross-check itself actually ran.
  printf '%s\n' "$outA" | grep -qi 'do not cover' \
    && fail merged-halves "half A: cross-check ran despite artifacts absent from the PR diff: $outA"
  ( cd "$d" && echo touched >> _acceptance/fx/run-log.jsonl && git add -A && git commit -q -m "artifact touch" )
  outB="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$outB" | grep -qi 'do not cover' \
    || fail merged-halves "half B: cross-check did not run with artifacts in the PR diff: $outB"
}

# merged_halves_cd — Half C: no PR base at all. There is no coverage set to
# cross-check the declaration against — an empty BASE_SHA must NEVER be read
# as "declaration covers everything"; it must fall back to whole-tree
# staleness (the working tree still carries the Half-A drift file, which sits
# outside this feature's declared "narrow" scope) rather than silently
# reporting OK. Half D: same as Half C but with an UNRESOLVABLE --base — must
# fail closed at least as hard as the missing-base case, never more
# permissively just because a ref string was supplied; since kit 1.24.0 that
# means refusing to run (exit 2). Reuses the "$d" that
# merged_halves_ab left behind.
merged_halves_cd() {
  outC="$(bash "$GATE" "$d" 2>&1)"
  printf '%s\n' "$outC" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail merged-halves "half C: no PR base did not fall back to whole-tree staleness: $outC"
  printf '%s\n' "$outC" | grep -q 'OK \[fx\]' \
    && fail merged-halves "half C: no PR base wrongly reported OK: $outC"

  # Since kit 1.24.0 this fails closed HARDER than Half C: instead of falling
  # back to whole-tree staleness, the gate refuses to run at all. An operator
  # who declared a scope the machine cannot compute gets an error, not a
  # quieter check (kit ADR 0004 — a CI job with a mistyped base_ref used to
  # check an empty set and report clean). What this half guards is unchanged —
  # a bad ref must never buy narrow scope — only the mechanism moved, from
  # "widest staleness set" to "do not run".
  outD="$(bash "$GATE" "$d" --base bogus-ref-xyz-does-not-exist 2>&1)"; rcD=$?
  [ "$rcD" -eq 2 ] \
    || fail merged-halves "half D: unresolvable PR base did not exit 2 (got $rcD): $outD"
  printf '%s\n' "$outD" | grep -q 'VIOLATION \[scope\]: base .* resolve' \
    || fail merged-halves "half D: unresolvable PR base did not report the scope violation: $outD"
  printf '%s\n' "$outD" | grep -q 'OK \[fx\]' \
    && fail merged-halves "half D: unresolvable PR base wrongly reported OK: $outD"

  # Half D2: a --base that DOES resolve to a real commit, but shares NO merge
  # base with HEAD (two disjoint histories) — `git diff A...B` exits 128 in
  # this case ("no merge base"). `2>/dev/null` alone makes that failure read
  # as an empty, silently EMPTY diff — "no gaps found" — which used to grant
  # narrow scope on a doubt exactly like an unresolvable ref, just with a rc
  # instead of an empty rev-parse. Must fail closed the same way as Half D.
  orig_branch="$(git -C "$d" symbolic-ref --short HEAD)"
  ( cd "$d" && git checkout -q --orphan no-merge-base-branch \
      && git rm -rf --cached . -q >/dev/null 2>&1 \
      && echo unrelated > unrelated-history.txt && git add -A \
      && git commit -q -m "disjoint history, no common ancestor with $orig_branch" )
  nomb_ref="$(git -C "$d" rev-parse HEAD)"
  ( cd "$d" && git checkout -q "$orig_branch" )
  outD2="$(bash "$GATE" "$d" --base "$nomb_ref" 2>&1)"
  printf '%s\n' "$outD2" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail merged-halves "half D2: a base sharing no merge base with HEAD did not fall back to whole-tree staleness: $outD2"
  printf '%s\n' "$outD2" | grep -q 'OK \[fx\]' \
    && fail merged-halves "half D2: a base sharing no merge base with HEAD wrongly reported OK: $outD2"
}

# assert_cross_check_isolation <label> <desc> <slug1> <slug2> — shared shape
# behind Half E (regex-slug isolation) and Half F (trailing-slash anchoring):
# two independently narrow-scoped features share one repo (mk_pair_fixture);
# the PR touches ONLY slug2's artifacts, plus a code change outside declared
# scope so a wrongly-run cross-check for slug1 would have something to flag
# as "not covered". Asserts slug1's own cross-check does NOT fire while
# slug2's does. Uses its own throwaway dir, torn down before returning.
#
# Half E: slugs "a.b" (where "." is a regex wildcard) and "axb" (a string the
# wildcard would match against) — a slug interpolated unescaped into a grep
# PATTERN lets "." match any character, so "^_acceptance/a.b/" would also
# match "_acceptance/axb/". A git pathspec is a literal path, not a pattern,
# and cannot be confused this way.
#
# Half F: slugs "fx" and "fx-extra" — the anchoring the old grep pattern
# relied on (`^_acceptance/$slug/`, trailing slash) must still hold now that
# the check uses a pathspec instead.
assert_cross_check_isolation() {
  ah_label="$1"; ah_desc="$2"; ah_s1="$3"; ah_s2="$4"
  ah_dir="$(new_case_tmpdir)"
  mk_pair_fixture "$ah_dir" "$ah_s1" "$ah_s2"
  ah_vc="$(git -C "$ah_dir" rev-parse HEAD)"
  write_report "$ah_dir" "$ah_s1" "$ah_vc"
  write_report "$ah_dir" "$ah_s2" "$ah_vc"
  ( cd "$ah_dir" && git add -A && git commit -q -m report )
  ah_base="$(git -C "$ah_dir" rev-parse HEAD)"
  ( cd "$ah_dir" && echo touched >> "_acceptance/$ah_s2/run-log.jsonl" && echo drift > src/uncovered/new.txt \
      && git add -A && git commit -q -m "pr touches $ah_s2 only" )
  ah_out="$(bash "$GATE" "$ah_dir" --base "$ah_base" 2>&1)"
  printf '%s\n' "$ah_out" | grep -qF "NOTE [$ah_s1]: declared eval paths" \
    && fail merged-halves "$ah_label ($ah_desc): touching only $ah_s2's artifacts tripped ${ah_s1}'s cross-check: $ah_out"
  printf '%s\n' "$ah_out" | grep -qF "OK [$ah_s1]" \
    || fail merged-halves "$ah_label ($ah_desc): $ah_s1 was not reported OK despite its own artifacts being untouched: $ah_out"
  printf '%s\n' "$ah_out" | grep -qF "NOTE [$ah_s2]: declared eval paths" \
    || fail merged-halves "$ah_label ($ah_desc): ${ah_s2}'s own cross-check did not run: $ah_out"
}

# merged_halves_g — Half G / vacuous cross-check (Task 6 finding): a
# declaration whose globs match NO tracked file must never earn narrow scope
# permanently just because the PR that introduces it happens to touch nothing
# but its own _acceptance/<slug>/ — an empty coverage set makes scope_gaps()
# pass VACUOUSLY (nothing in the diff to flag as "not covered"), so without a
# separate match-nothing check the declaration is accepted once and then
# silently hides every future change forever, because every later PR that
# changes real code without touching _acceptance/<slug>/ skips the
# cross-check entirely and stale_files() scoped to a match-nothing glob
# filters the real change straight out.
merged_halves_g() {
  h="$(new_case_tmpdir)"
  mkdir -p "$h/src/covered" "$h/_acceptance"
  git_init_fixture_repo "$h"
  write_config "$h"
  ( cd "$h" && echo seed > src/covered/seed.txt && git add -A && git commit -q -m "repo base, no feature yet" )
  hbase0="$(git -C "$h" rev-parse HEAD)"

  mkdir -p "$h/_acceptance/fx"
  write_contract "$h" fx
  # Match-nothing declaration: "nonexistent-dir/**" cannot match anything
  # tracked in this fixture repo (only src/covered/** and _acceptance/** exist).
  write_evals_yaml "$h" fx '    paths: ["nonexistent-dir/**"]' '    paths: ["nonexistent-dir/**"]'
  echo '{}' > "$h/_acceptance/fx/run-log.jsonl"
  ( cd "$h" && git add -A && git commit -q -m "introduce fx with match-nothing paths" )
  hvc="$(git -C "$h" rev-parse HEAD)"
  write_report "$h" fx "$hvc"
  ( cd "$h" && git add -A && git commit -q -m "evidence report" )
  hpr1="$(git -C "$h" rev-parse HEAD)"

  # PR1: base is BEFORE fx existed at all — the coverage set (hbase0...HEAD)
  # is only _acceptance/fx/* (excluded from scope_gaps by construction), so
  # it is empty. Post-fix: an empty coverage set at the moment the
  # declaration is introduced is refused outright (its own NOTE), rather than
  # passing the cross-check vacuously and being silently granted — the
  # feature must still report OK (nothing gated changed in this PR either
  # way), but the "narrow scope applied" wording must NOT appear, because no
  # scope was actually granted.
  outG1="$(bash "$GATE" "$h" --base "$hbase0" 2>&1)"
  printf '%s\n' "$outG1" | grep -q 'OK \[fx\]' \
    || fail merged-halves "half G: vacuous-pass setup: PR introducing a match-nothing declaration was not reported OK: $outG1"
  printf '%s\n' "$outG1" | grep -qF 'NOTE [fx]: this PR'"'"'s gated coverage set is empty' \
    || fail merged-halves "half G: empty coverage set at declaration time was not refused with the dedicated NOTE: $outG1"
  printf '%s\n' "$outG1" | grep -q 'narrow staleness scope applied' \
    && fail merged-halves "half G: an empty-coverage-set declaration was still announced as a GRANTED narrow scope: $outG1"

  # PR2: real code change, feature artifacts UNTOUCHED — the cross-check does
  # not even run here (declaration unchanged since hpr1), so only a guard
  # that applies regardless of whether the cross-check ran can catch this.
  ( cd "$h" && echo drift > src/covered/new.txt && git add -A && git commit -q -m "real code change" )
  outG2="$(bash "$GATE" "$h" --base "$hpr1" 2>&1)"
  printf '%s\n' "$outG2" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail merged-halves "half G: match-nothing declaration hid a later real code change from staleness: $outG2"
  printf '%s\n' "$outG2" | grep -q 'src/covered/new.txt' \
    || fail merged-halves "half G: match-nothing declaration: stale file not named: $outG2"
}

# merged_halves_h — Half H / the CRITICAL finding this round closes: unlike
# Half G above (a match-nothing declaration, already caught independently by
# scope_has_any_match), this uses a REAL declaration whose globs DO match
# tracked files elsewhere in the repo ("src/covered/**") — isolating the
# defect from that other guard. The PR that introduces fx touches nothing
# gated besides its own _acceptance/fx/ (an honest "just wiring up the
# feature" commit), so the coverage set is empty and the cross-check used to
# pass VACUOUSLY, silently granting narrow scope to a declaration that was
# NEVER actually checked against anything. Post-fix this must be refused with
# its own NOTE at THIS PR's own gate run.
#
# A SEPARATE, later PR that changes real code outside the declared union
# WITHOUT touching _acceptance/fx again does NOT retrigger the cross-check —
# by design (AC-7: re-running it against every unrelated PR's diff would
# refuse narrow scope for every already-merged feature forever). That is a
# real, acknowledged residual (see contract.md "Known limits"), not something
# this fix claims to close — pinned here as a boundary on AC-7, not a defect.
merged_halves_h() {
  hh="$(new_case_tmpdir)"
  mkdir -p "$hh/src/covered" "$hh/src/other" "$hh/_acceptance"
  git_init_fixture_repo "$hh"
  write_config "$hh"
  ( cd "$hh" && echo seed > src/covered/seed.txt && echo seed > src/other/seed.txt \
      && git add -A && git commit -q -m "repo base, no feature yet" )
  hhbase0="$(git -C "$hh" rev-parse HEAD)"

  mkdir -p "$hh/_acceptance/fx"
  write_contract "$hh" fx
  # Real, matching declaration — deliberately NOT match-nothing, to isolate
  # this from scope_has_any_match's guard.
  write_evals_yaml "$hh" fx '    paths: ["src/covered/**"]' '    paths: ["src/covered/**"]'
  echo '{}' > "$hh/_acceptance/fx/run-log.jsonl"
  ( cd "$hh" && git add -A && git commit -q -m "introduce fx with a real, matching declaration, nothing else" )
  hhvc="$(git -C "$hh" rev-parse HEAD)"
  write_report "$hh" fx "$hhvc"
  ( cd "$hh" && git add -A && git commit -q -m "evidence report" )
  hhpr1="$(git -C "$hh" rev-parse HEAD)"

  # PR1 (the declaring PR): coverage set (hhbase0...HEAD) is only
  # _acceptance/fx/* — empty. Must be refused, not silently granted.
  outH1="$(bash "$GATE" "$hh" --base "$hhbase0" 2>&1)"
  printf '%s\n' "$outH1" | grep -q 'OK \[fx\]' \
    || fail merged-halves "half H: declaring PR was not reported OK: $outH1"
  printf '%s\n' "$outH1" | grep -qF 'NOTE [fx]: this PR'"'"'s gated coverage set is empty' \
    || fail merged-halves "half H: a real, matching declaration introduced with an empty coverage set was not refused: $outH1"
  printf '%s\n' "$outH1" | grep -q 'narrow staleness scope applied' \
    && fail merged-halves "half H: a declaration never actually cross-checked was still announced as a GRANTED narrow scope: $outH1"

  # PR2: real code OUTSIDE the declared union, artifacts left untouched — the
  # acknowledged residual. Documented, not asserted as fixed: the cross-check
  # correctly does NOT run (AC-7), so this still reports OK. If a future
  # change makes this start failing, that is AC-7 being violated (the
  # cross-check running against every unrelated PR), not a bug being
  # reintroduced — check contract.md "Known limits" before touching this.
  ( cd "$hh" && echo drift > src/other/new.txt && git add -A && git commit -q -m "real code outside declared paths" )
  outH2="$(bash "$GATE" "$hh" --base "$hhpr1" 2>&1)"
  printf '%s\n' "$outH2" | grep -qi 'do not cover' \
    && fail merged-halves "half H: cross-check ran for a PR that never touched _acceptance/fx — AC-7 regressed: $outH2"
}

case_merged_halves() {
  # E7 / AC-7: cross-check fires only when the declaration is new or changed.
  d="$(new_case_tmpdir)"
  merged_halves_ab
  merged_halves_cd
  assert_cross_check_isolation "half E" "regex-slug" a.b axb
  assert_cross_check_isolation "half F" "trailing-slash" fx fx-extra
  merged_halves_h
  merged_halves_g
  pass merged-halves
}

case_two_bases() {
  # E12 / AC-12: the fixture that tells the two ranges apart. paths cover the
  # COVERAGE SET but NOT everything changed since verified_commit. Cross-checked
  # against the per-feature range instead, no honest declaration ever covers it
  # and narrow scope is refused for every merged feature forever.
  d="$(new_case_tmpdir)"
  mk_fixture "$d" fx narrow
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && git add -A && git commit -q -m report )
  # Unrelated history AFTER verified_commit and BEFORE the PR base.
  ( cd "$d" && echo old > src/uncovered/unrelated.txt && git add -A && git commit -q -m "unrelated merge" )
  base="$(git -C "$d" rev-parse HEAD)"
  # The PR itself touches only covered code plus the feature's artifacts.
  ( cd "$d" && echo new > src/covered/pr.txt \
      && echo touched >> _acceptance/fx/run-log.jsonl \
      && git add -A && git commit -q -m pr )
  out="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$out" | grep -q 'src/uncovered/unrelated.txt' \
    && fail two-bases "cross-check used the per-feature range, not the coverage set: $out"
  # Match the cross-check's OWN wording ("do not cover"), not a bare
  # "uncovered" substring — this fixture's src/uncovered/unrelated.txt (seeded
  # above) would otherwise satisfy a path-name match on its own filename,
  # independent of whether the cross-check actually refused narrow scope.
  printf '%s\n' "$out" | grep -qi 'do not cover' \
    && fail two-bases "narrow scope refused although the coverage set is covered: $out"
  pass two-bases
}
case_mutation() { run_mutation_case; } # E9/AC-9 — real body (incl. sed patches + assertions) is run_mutation_case() in fixtures.sh, moved there only for this file's 800-line cap
usage() { echo "usage: $0 --case <$(echo "$KNOWN_CASES" | tr ' ' '|')>" >&2; exit 2; }

CASE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --case) [ $# -ge 2 ] || usage; CASE="$2"; shift 2 ;;
    *) usage ;;
  esac
done
[ -n "$CASE" ] || usage

known=0
for c in $KNOWN_CASES; do [ "$c" = "$CASE" ] && known=1; done
[ "$known" -eq 1 ] || { echo "unknown case: $CASE" >&2; exit 2; }

"case_$(printf '%s' "$CASE" | tr '-' '_')"
