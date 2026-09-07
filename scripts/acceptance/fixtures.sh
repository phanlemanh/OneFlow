#!/usr/bin/env bash
# Fixture-construction helpers for scripts/acceptance/check-stale-scoping.sh
# — PLUS two full case bodies:
#   - run_mutation_case() (backing case_mutation / E9 / AC-9), complete with
#     its perturbation sed patches and every assertion `--case mutation` makes.
#   - run_indent_drift_case() (backing case_indent_drift / E-indent-drift /
#     AC-6), the 27 assertions pinning every YAML shape feature_scope() must
#     refuse or accept (indentation drift, block-scalar decoys, multi-line
#     arrays, quoting variants, bracket-class globs, trailing comments/junk).
# Neither is a thin wrapper hiding here — each is the actual substance of its
# case. They live in this file, rather than beside the other case_* functions
# in check-stale-scoping.sh, purely because that file was already sitting at
# this repo's 800-line-per-file cap (CLAUDE.md) when each was added. See
# case_mutation()'s and case_indent_drift()'s own comments in that file for
# the pointer back to here.
#
# Everything else in this file — write_config, write_contract,
# write_evals_yaml, mk_fixture, mk_pair_fixture, mk_committed_report_fixture,
# run_gate_with_drift, and the new_case_tmpdir/cleanup_case_tmpdirs pair
# below — is ordinary fixture construction with no case_* entry points and
# no CLI of its own; it is only ever sourced.
#
# check-stale-scoping.sh sources this via `. "$HERE/fixtures.sh"`, where HERE
# is resolved with `cd "$(dirname "$0")"` — that cd-based resolution already
# makes the source path independent of the caller's working directory. This
# file mirrors that same cd-based approach for its OWN directory, in case a
# future helper here needs to reference a sibling path (e.g. under
# scripts/acceptance/fixtures/), so robustness survives regardless of which
# file ends up doing the resolving.
set -u
FIXTURES_HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Temp-directory tracking ─────────────────────────────────────────────────
# Every case_* in check-stale-scoping.sh builds one or more throwaway fixture
# repos under mktemp -d. fail() calls `exit`, which bypasses a per-function
# `trap ... RETURN` — so any case that fails via fail() used to leave its
# directories behind. Routing every `mktemp -d` through new_case_tmpdir()
# instead records the path in a registry FILE (see below); check-stale-
# scoping.sh installs ONE script-level `trap cleanup_case_tmpdirs EXIT`, so
# cleanup runs on the pass path, the fail() exit path, and an interrupt
# (INT/TERM, which also reach EXIT in bash) alike — regardless of which case
# or helper created the dir.
#
# A registry FILE, not a shell variable, is required here: every call site is
# `d="$(new_case_tmpdir)"`, and bash runs the right-hand side of `$(...)` in a
# subshell — a subshell mutating a global variable does not propagate that
# mutation back to the parent shell once the subshell exits, so an in-memory
# list would silently discard every recorded path. Appending to a file is a
# real filesystem write, which does survive the subshell exiting.
CASE_TMPDIR_REGISTRY="$(mktemp)"

# new_case_tmpdir — mktemp -d wrapper: creates the directory, appends it to
# CASE_TMPDIR_REGISTRY for the caller's script-level EXIT trap, and echoes
# the path — same call shape as `d="$(mktemp -d)"`, so every existing call
# site is a drop-in `d="$(new_case_tmpdir)"` replacement.
new_case_tmpdir() {
  nct_dir="$(mktemp -d)"
  printf '%s\n' "$nct_dir" >> "$CASE_TMPDIR_REGISTRY"
  printf '%s\n' "$nct_dir"
}

# cleanup_case_tmpdirs — remove every directory new_case_tmpdir has recorded
# so far, then the registry file itself. Meant to be installed once as
# `trap cleanup_case_tmpdirs EXIT` by the caller script, not called directly
# by any case.
cleanup_case_tmpdirs() {
  if [ -f "$CASE_TMPDIR_REGISTRY" ]; then
    while IFS= read -r ctr_dir; do
      [ -n "$ctr_dir" ] && rm -rf "$ctr_dir"
    done < "$CASE_TMPDIR_REGISTRY"
    rm -f "$CASE_TMPDIR_REGISTRY"
  fi
}

# assert_cases_wired_in_config <config.yaml-path> — for every name in
# KNOWN_CASES (check-stale-scoping.sh global), checks that a literal
# `--case <name>` string appears in the given _acceptance/config.yaml.
# Prints the space-prefixed list of any case names not found there (empty
# string if all are wired). A case function can exist and still never run
# anywhere — exactly what happened to indent-drift, which shipped a working
# case_indent_drift() with no executors.script key pointing `--case
# indent-drift` at it — so this is what case_case_completeness (in
# check-stale-scoping.sh) uses to catch that class of gap. Moved here purely
# for that file's 800-line cap.
assert_cases_wired_in_config() {
  acw_cfg="$1"
  acw_missing=""
  for acw_c in $KNOWN_CASES; do
    grep -qE -- "--case ${acw_c}([[:space:]]|\$)" "$acw_cfg" 2>/dev/null \
      || acw_missing="$acw_missing $acw_c"
  done
  printf '%s' "$acw_missing"
}

# write_config <dir> — canonical _acceptance/config.yaml fixture content: the
# same risk_tiers/executors/signoff shape every fixture in this guard needs.
# Callers must have already created "<dir>/_acceptance".
write_config() {
  cat > "$1/_acceptance/config.yaml" <<CFG
schema_version: 1
enforcement: strict
recheck: off
executors:
  test:
    unit: "true"
risk_tiers:
  t1_skip_globs:
    - "docs/**"
    - "**/*.md"
    - "_acceptance/**"
  t3_paths:
    - "src/critical/**"
signoff:
  required_for: [T2, T3]
CFG
}

# write_contract <dir> <slug> — canonical signed-off T2 contract fixture.
# Callers must have already created "<dir>/_acceptance/<slug>".
write_contract() {
  cat > "$1/_acceptance/$2/contract.md" <<CON
---
schema_version: 1
feature: fixture
slug: $2
risk_tier: T2
status: signed-off
approved_by: Fixture
---
# Acceptance Contract: $2
CON
}

# write_evals_yaml <dir> <slug> <p1-line> <p2-line> — a two-eval evals.yaml
# (E1/AC-1, E2/AC-2, both `executor: test` / `cmd: config:executors.test.unit`).
# p1/p2 are complete "    paths: [...]" lines inserted verbatim into E1/E2
# respectively, or "" to leave that eval with no `paths` key at all.
write_evals_yaml() {
  {
    echo "schema_version: 1"
    echo "feature_slug: $2"
    echo "evals:"
    echo "  - id: E1"
    echo "    criterion: AC-1"
    echo "    executor: test"
    echo "    cmd: config:executors.test.unit"
    [ -n "$3" ] && echo "$3"
    echo "  - id: E2"
    echo "    criterion: AC-2"
    echo "    executor: test"
    echo "    cmd: config:executors.test.unit"
    [ -n "$4" ] && echo "$4"
    # Optional $5: content appended AFTER the evals list — for shapes that put
    # a `paths:` key outside any eval item.
    [ -n "${5:-}" ] && echo "$5"
    :
  } > "$1/_acceptance/$2/evals.yaml"
}

# git_init_fixture_repo <dir> — init a throwaway git repo with a fixed
# fixture identity, no commit (callers add files then commit themselves).
git_init_fixture_repo() {
  (
    cd "$1"
    git init -q .
    git config user.email fixture@example.com
    git config user.name Fixture
  )
}

# mk_fixture <dir> <slug> <paths-mode>
# Builds a throwaway git repo with one signed feature. paths-mode:
#   all      — every eval declares paths covering src/covered/**
#   none     — no eval declares paths
#   partial  — first eval declares, second does not
#   empty    — every eval declares `paths: []`
#   narrow   — every eval declares paths that do NOT cover src/uncovered/**
mk_fixture() {
  d="$1"; slug="$2"; mode="$3"
  mkdir -p "$d/_acceptance/$slug" "$d/src/covered" "$d/src/uncovered" "$d/docs"
  write_config "$d"
  write_contract "$d" "$slug"
  # Reset before the case: this file has no `local`, so a value set by one
  # mode's branch would otherwise survive into the NEXT mk_fixture call and
  # silently append a trailer to an unrelated fixture (see mk_pair_fixture's
  # note on the same hazard).
  trailer=""
  case "$mode" in
    none)    p1=""; p2="" ;;
    partial) p1='    paths: ["src/covered/**"]'; p2="" ;;
    empty)   p1='    paths: []'; p2='    paths: []' ;;
    narrow)  p1='    paths: ["src/covered/**"]'; p2='    paths: ["src/covered/**"]' ;;
    # Two paths lines on the FIRST eval, none on the second: a copy-paste
    # duplicate. The file-wide totals still balance (2 evals, 2 paths lines),
    # so any completeness test that compares counts rather than distribution
    # reads this partial declaration as complete.
    dup)     p1='    paths: ["src/covered/**"]
    paths: ["src/uncovered/**"]'; p2="" ;;
    # E2 declares NOTHING; a `paths:` key sits at the eval-key column in an
    # unrelated mapping BELOW the evals list. Totals balance again (2 evals,
    # 2 paths lines), and "nearest `- id:` above" hands the stray key to E2 —
    # so the union silently gains a glob no eval ever declared.
    stray)   p1='    paths: ["src/covered/**"]'; p2=""
             trailer='misc:
  sub:
    paths: ["docs/**"]' ;;
    all|*)   p1='    paths: ["src/covered/**"]'; p2='    paths: ["src/covered/**", "src/uncovered/**"]' ;;
  esac
  write_evals_yaml "$d" "$slug" "$p1" "$p2" "${trailer:-}"
  echo '{}' > "$d/_acceptance/$slug/run-log.jsonl"
  git_init_fixture_repo "$d"
  (
    cd "$d"
    echo seed > src/covered/seed.txt
    echo seed > src/uncovered/seed.txt
    git add -A
    git commit -q -m "fixture base"
  )
}

# write_report <dir> <slug> <verified_commit>
write_report() {
  cat > "$1/_acceptance/$2/evidence-report.md" <<REP
---
schema_version: 2
feature_slug: $2
verdict: PASS
failed_evals: []
verified_by: fixture
enforcement_mode: strict
bypass_used: false
verified_commit: $3
human_signoff: Fixture 2026-07-28
---
# Evidence Report: $2
REP
}

# pr_touches_artifacts <dir> <slug> — append a byte to the feature's run-log so
# the PR commit the caller is about to make includes `_acceptance/<slug>/`.
#
# Required since the STALE-DIFF-SCOPE-GUARD fork (97b5b12): the gate skips the
# WHOLE staleness block — verdict, narrow scope and its announcement alike —
# for any feature whose own `_acceptance/<slug>/` is outside the PR diff. A
# fixture that leaves the artifacts out of the diff therefore asserts against
# silence, and passes or fails for reasons unrelated to what it set out to
# measure. run-log.jsonl is the cheapest carrier: `_acceptance/**` is excluded
# from every staleness set (AC-8), so this puts the slug in the diff WITHOUT
# contributing a stale file of its own.
#
# Note for the caller: putting the artifacts in the diff also switches the
# Task-6 cross-check ON (AC-7). Under this fork the two are welded together —
# "examined but not cross-checked" is no longer an expressible shape — so a
# case that needs a granted narrow scope must also keep the PR's gated
# coverage set inside the declared union, the way case_two_bases does.
pr_touches_artifacts() {
  echo touched >> "$1/_acceptance/$2/run-log.jsonl"
}

# mk_committed_report_fixture <dir> <slug> <paths-mode> — mk_fixture() plus a
# report committed in its OWN commit (prints the post-report commit SHA on
# stdout, for the caller's --base). Any case that needs "this feature's
# _acceptance/<slug>/ is NOT part of the PR diff" (case_out_of_scope's shape)
# instead of re-deriving that three-step dance inline.
mk_committed_report_fixture() {
  mcf_dir="$1"; mcf_slug="$2"; mcf_mode="$3"
  mk_fixture "$mcf_dir" "$mcf_slug" "$mcf_mode"
  mcf_vc="$(git -C "$mcf_dir" rev-parse HEAD)"
  write_report "$mcf_dir" "$mcf_slug" "$mcf_vc"
  ( cd "$mcf_dir" && git add -A && git commit -q -m report )
  git -C "$mcf_dir" rev-parse HEAD
}

# mk_subdir_fixture <repo-dir> <slug> <paths-glob> — the monorepo layout: the
# git repo is <repo-dir>, but the acceptance tree and the sources live one
# level down in <repo-dir>/pkg, which is the root the gate is pointed at. Every
# other fixture in this suite puts $ROOT at the git top-level, where the
# ls-files and diff --name-only namespaces happen to coincide and a namespace
# bug is invisible. <paths-glob> is written verbatim into both evals, so a
# caller can declare either spelling (top-level `pkg/src/covered/**` or
# $ROOT-relative `src/covered/**`) and assert what the gate does with it.
#
# Prints the post-report commit SHA on stdout, same contract as
# mk_committed_report_fixture, so --base is taken AFTER the report and this
# feature's own _acceptance/<slug>/ is NOT in the PR diff (no cross-check) —
# the shape every later PR has, which is where the namespace hole opens.
mk_subdir_fixture() {
  sf_repo="$1"; sf_slug="$2"; sf_glob="$3"
  mkdir -p "$sf_repo/pkg/_acceptance/$sf_slug" "$sf_repo/pkg/src/covered" "$sf_repo/pkg/src/uncovered"
  write_config "$sf_repo/pkg"
  write_contract "$sf_repo/pkg" "$sf_slug"
  write_evals_yaml "$sf_repo/pkg" "$sf_slug" "    paths: [\"$sf_glob\"]" "    paths: [\"$sf_glob\"]"
  echo '{}' > "$sf_repo/pkg/_acceptance/$sf_slug/run-log.jsonl"
  git_init_fixture_repo "$sf_repo"
  (
    cd "$sf_repo"
    echo seed > pkg/src/covered/seed.txt
    echo seed > pkg/src/uncovered/seed.txt
    git add -A
    git commit -q -m "fixture base"
  )
  sf_vc="$(git -C "$sf_repo" rev-parse HEAD)"
  write_report "$sf_repo/pkg" "$sf_slug" "$sf_vc"
  ( cd "$sf_repo" && git add -A && git commit -q -m report )
  git -C "$sf_repo" rev-parse HEAD
}

# mk_subdir_crosscheck_fixture <repo-dir> <slug> <paths-glob> — the monorepo
# layout of mk_subdir_fixture, but staged so the feature's OWN
# _acceptance/<slug>/ is part of the PR diff: that is the one condition under
# which the declaration is cross-checked against the gated diff, and it is
# exactly the condition mk_subdir_fixture deliberately excludes (it takes its
# base AFTER the report commit).
#
# Prints the fixture-base SHA and stops there, leaving the report/PR/re-pin
# staging to the caller so it can mirror case_under_declared's flat shape line
# for line — the whole point is that the two layouts differ ONLY in where the
# acceptance tree sits, so any divergence in the gate's answer is the bug.
mk_subdir_crosscheck_fixture() {
  sx_repo="$1"; sx_slug="$2"; sx_glob="$3"
  mkdir -p "$sx_repo/pkg/_acceptance/$sx_slug" "$sx_repo/pkg/src/covered" "$sx_repo/pkg/src/uncovered"
  write_config "$sx_repo/pkg"
  write_contract "$sx_repo/pkg" "$sx_slug"
  write_evals_yaml "$sx_repo/pkg" "$sx_slug" "    paths: [\"$sx_glob\"]" "    paths: [\"$sx_glob\"]"
  echo '{}' > "$sx_repo/pkg/_acceptance/$sx_slug/run-log.jsonl"
  git_init_fixture_repo "$sx_repo"
  (
    cd "$sx_repo"
    echo seed > pkg/src/covered/seed.txt
    echo seed > pkg/src/uncovered/seed.txt
    git add -A
    git commit -q -m "fixture base"
  )
  git -C "$sx_repo" rev-parse HEAD
}

# mk_pair_fixture <dir> <slug1> <slug2>
# Two independently narrow-scoped features (paths cover src/covered/** only)
# sharing ONE repo — for guards that assert one feature's cross-check cannot
# be tripped by a change confined to the OTHER feature's artifacts (regex-slug
# confusion, trailing-slash anchoring).
#
# Deliberately does NOT bind its first parameter to a variable named "d" —
# this file has no `local`, so every parameter assignment here is a plain
# global. A caller that still holds its own fixture dir in "$d" after calling
# this function would have that "$d" silently clobbered by this function's
# own reassignment of it, corrupting any use of "$d" the caller makes later.
mk_pair_fixture() {
  pf_dir="$1"; s1="$2"; s2="$3"
  mkdir -p "$pf_dir/_acceptance/$s1" "$pf_dir/_acceptance/$s2" "$pf_dir/src/covered" "$pf_dir/src/uncovered"
  write_config "$pf_dir"
  for s in "$s1" "$s2"; do
    write_contract "$pf_dir" "$s"
    write_evals_yaml "$pf_dir" "$s" '    paths: ["src/covered/**"]' '    paths: ["src/covered/**"]'
    echo '{}' > "$pf_dir/_acceptance/$s/run-log.jsonl"
  done
  git_init_fixture_repo "$pf_dir"
  (
    cd "$pf_dir"
    echo seed > src/covered/seed.txt
    echo seed > src/uncovered/seed.txt
    git add -A
    git commit -q -m "fixture base"
  )
}

# run_gate_with_drift <gate-path> <fixture-mode> <drift-path> — build a signed
# fx feature (mk_committed_report_fixture), commit one drifting file AFTER
# that commit, then run <gate-path> with --base at the post-report commit —
# the same "artifacts not in the PR diff" shape case_out_of_scope uses, so
# Task 6's coverage cross-check never runs and never masks what the caller is
# actually trying to observe. Echoes the gate's combined stdout+stderr.
run_gate_with_drift() {
  rgw_gate="$1"; rgw_mode="$2"; rgw_drift="$3"
  rgw_shape="${4:-out-of-diff}"
  rgw_dir="$(new_case_tmpdir)"
  rgw_base="$(mk_committed_report_fixture "$rgw_dir" fx "$rgw_mode")"
  # Shape matters since STALE-DIFF-SCOPE-GUARD was narrowed (2026-08-27): a
  # feature outside the PR diff is examined only when it declares complete
  # `paths`. A DECLARED fixture can therefore stay out-of-diff (the default,
  # and the shape that exercises the narrow-scope path with no cross-check),
  # while a fixture the gate treats as UNDECLARED — any `partial` mode — must
  # pass `in-diff`, or the gate skips it and the assertion ends up measuring
  # the fork rather than the mechanism under test.
  if [ "$rgw_shape" = "in-diff" ]; then
    pr_touches_artifacts "$rgw_dir" fx
  fi
  ( cd "$rgw_dir" && echo drift > "$rgw_drift" && git add -A && git commit -q -m drift )
  bash "$rgw_gate" "$rgw_dir" --base "$rgw_base" 2>&1
}

# run_mutation_case — full body of check-stale-scoping.sh's case_mutation
# (E9 / AC-9); kept here (rather than in check-stale-scoping.sh, which is
# already at the repo's 800-line-per-file cap) purely for line budget. Relies
# on $GATE and pass()/fail() from the caller's shell — this file is always
# sourced into check-stale-scoping.sh, never executed standalone.
#
# Two mutations, each applied to a TEMP COPY of the gate — the working tree
# is never edited and the shipped gate carries no knob (AC-13):
#   (a) narrow scope forced to match nothing → mechanism becomes "never stale"
#   (b) completeness forced to always pass  → mechanism becomes blind trust
# Each perturbation is verified to have actually changed the file (cmp) — a
# sed whose target text has moved patches nothing, the "mutation" then runs
# the unmodified gate, and the case would pass while proving nothing.
run_mutation_case() {
  work="$(new_case_tmpdir)"
  cp "$GATE" "$work/gate.sh"
  # recheck-evidence.js is deliberately NOT copied here: every fixture this
  # case runs through write_config() sets `recheck: off` (fixtures.sh's
  # write_config), and pre-merge-check.sh only invokes recheck-evidence.js
  # when RECHECK_MODE is "strict" or "warn" — never "off". A copy would sit
  # unused in $work on every run.

  # Baseline: the unpatched temp copy must reproduce the real gate's in-scope
  # catch, or nothing below proves anything about the mutations.
  base_out="$(run_gate_with_drift "$work/gate.sh" all src/covered/new.txt)"
  printf '%s\n' "$base_out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail mutation "temp copy does not reproduce the real gate: $base_out"

  # (a) neutralize the scope check inside stale_files() so a set scope always
  # "continue"s — every changed file is skipped whenever narrow scope applies,
  # i.e. a feature with a narrow scope is never reported stale again.
  sed 's/match_globs "\$f" "\$scope" || continue/continue/' \
    "$work/gate.sh" > "$work/gate_a.sh"
  cmp -s "$work/gate.sh" "$work/gate_a.sh" \
    && fail mutation "perturbation (a) patched nothing — the sed target moved"
  a_out="$(run_gate_with_drift "$work/gate_a.sh" all src/covered/new.txt)"
  printf '%s\n' "$a_out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    && fail mutation "perturbation (a) did not go RED — in-scope changes are not actually caught"

  # (b) neutralize feature_scope's completeness proof: a "partial" declaration
  # (one eval left undeclared) is then trusted as complete, scoping ONLY to
  # what WAS declared and silently dropping the undeclared eval's implicit
  # "everything" — drift outside that narrowed scope goes unreported.
  #
  # Completeness lives in TWO places since the per-eval distribution proof was
  # added: the file-wide total, and the awk that walks each eval item. Patching
  # only the total leaves the awk still refusing, so the mechanism does NOT
  # break and this perturbation would silently stop testing anything — the
  # exact vacuous-guard failure this case exists to rule out. Both sites are
  # patched, and each is asserted to have actually matched, so a future edit
  # that moves either one turns this case red instead of quietly weakening it.
  sed 's/\[ "\$n_evals" -eq "\$n_paths" \] || return 1/:/' \
    "$work/gate.sh" > "$work/gate_b0.sh"
  cmp -s "$work/gate.sh" "$work/gate_b0.sh" \
    && fail mutation "perturbation (b) patched nothing — the total-count sed target moved"
  sed 's/END { if (open \&\& n != 1) bad = 1; exit (bad ? 1 : 0) }/END { exit 0 }/' \
    "$work/gate_b0.sh" > "$work/gate_b.sh"
  cmp -s "$work/gate_b0.sh" "$work/gate_b.sh" \
    && fail mutation "perturbation (b) patched nothing — the per-eval awk sed target moved"
  b_out="$(run_gate_with_drift "$work/gate_b.sh" partial src/uncovered/new.txt)"
  printf '%s\n' "$b_out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    && fail mutation "perturbation (b) did not go RED — a partial declaration is trusted"

  # Revert: the unpatched copy is green again on both shapes.
  r1="$(run_gate_with_drift "$work/gate.sh" all src/covered/new.txt)"
  printf '%s\n' "$r1" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail mutation "revert: in-scope change no longer caught"
  # Unpatched + `partial` = treated as UNDECLARED, so the narrowed fork skips it
  # out-of-diff; in-diff is what makes the whole-tree fallback observable here.
  r2="$(run_gate_with_drift "$work/gate.sh" partial src/uncovered/new.txt in-diff)"
  printf '%s\n' "$r2" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail mutation "revert: partial declaration no longer falls back"
  pass mutation
}

# run_indent_drift_case — full body of check-stale-scoping.sh's
# case_indent_drift (E-indent-drift / AC-6); kept here (rather than in
# check-stale-scoping.sh, which is already at the repo's 800-line-per-file
# cap) purely for line budget. Relies on $GATE and pass()/fail() from the
# caller's shell — this file is always sourced into check-stale-scoping.sh,
# never executed standalone.
run_indent_drift_case() {
  # E-indent-drift: an eval whose leading whitespace drifts from the canonical
  # 2/4-space indent (an ordinary typo, or a literal tab) must not become
  # invisible to BOTH feature_scope() counters at once — that lets n_evals and
  # n_paths coincide by accident, feature_scope returns 0 ("complete"), and the
  # drifted eval's total absence of a `paths` declaration goes unnoticed.
  #
  # Reuse feature_scope() from the gate instead of hand-rolling a second
  # parser, the same way case_guard_not_exempt reuses match_globs(): a private
  # copy would silently drift from what the gate actually does. Extracting
  # only the function body (not sourcing/executing the whole gate script,
  # which has side effects and calls exit) keeps this guard tested against the
  # exact parser the gate ships.
  feature_scope_src="$(sed -n '/^feature_scope()/,/^}/p' "$GATE")"
  [ -n "$feature_scope_src" ] || fail indent-drift "could not extract feature_scope() from $GATE"
  eval "$feature_scope_src"

  d="$(new_case_tmpdir)"

  # Space-drift variant: E1 canonically indented and declares paths; E2
  # drifted to a 3-space "- id:" / "criterion:" pair and declares none.
  cat > "$d/space-drift.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    paths: ["src/covered/**"]
   - id: E2
     criterion: AC-2
YAML
  out="$(feature_scope "$d/space-drift.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "space-drifted eval was invisible to both counters — feature_scope returned 0 (globs: $out)"

  # Tab-drift variant: same shape, drifted line prefixed with a literal tab
  # instead of an odd space count.
  printf 'schema_version: 1\nfeature_slug: fx\nevals:\n  - id: E1\n    paths: ["src/covered/**"]\n\t- id: E2\n\tcriterion: AC-2\n' \
    > "$d/tab-drift.yaml"
  out="$(feature_scope "$d/tab-drift.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "tab-drifted eval was invisible to both counters — feature_scope returned 0 (globs: $out)"

  # Block-scalar decoy: E2 declares no `paths`, but its `expected: |` block
  # scalar contains a prose line that reads "paths: [...]" at the SAME
  # indentation an eval-level declaration would use. A parser that counts
  # `paths:` occurrences without excluding block-scalar bodies mistakes that
  # prose for a declaration and folds its glob into the union.
  cat > "$d/block-scalar-decoy.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    expected: |
    exit 0; decoy prose at eval-key indentation:
    paths: ["src/decoy/**"]
    must not be read as a declaration
YAML
  out="$(feature_scope "$d/block-scalar-decoy.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "block-scalar decoy 'paths:' prose was counted as a declaration — feature_scope returned 0 (globs: $out)"

  # Top-level-key decoy: a feature-level `paths:` key that is a sibling of
  # `evals:` (not under any eval item) must not be counted toward
  # completeness or joined into the union — E2 below declares no `paths` of
  # its own.
  cat > "$d/toplevel-key-decoy.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
paths: ["src/decoy/**"]
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
YAML
  out="$(feature_scope "$d/toplevel-key-decoy.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "feature-level top-level 'paths:' key was counted as an eval declaration — feature_scope returned 0 (globs: $out)"

  # Multi-line array: E2's `paths:` opens a bracket array but its globs
  # continue on following lines, closing on a THIRD line. A line-based
  # extractor cannot read continuation lines, so a parser that counts this
  # opening line toward completeness (matching only the prefix, not
  # requiring the closing `]` on the same line) reaches a false "complete"
  # reading while contributing zero globs for E2 — the exact defect this
  # case guards against regressing.
  cat > "$d/multiline-array.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    paths: [
      "src/extra/**",
      "src/more/**"
    ]
YAML
  out="$(feature_scope "$d/multiline-array.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "multi-line 'paths:' array was counted as a complete declaration — feature_scope returned 0 (globs: $out)"

  # Same shape, but the multi-line array is the ONLY eval in the file — this
  # used to return non-zero already, but for the wrong reason (the union
  # came out empty, tripping the LAST-resort "zero globs" check). Assert the
  # actual completeness check (n_evals vs n_paths) is what refuses it, not
  # an accidental empty union: a file with a real second declared eval whose
  # globs happened to overlap would otherwise slip through.
  cat > "$d/multiline-array-only.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: [
      "src/extra/**",
      "src/more/**"
    ]
YAML
  out="$(feature_scope "$d/multiline-array-only.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "multi-line 'paths:' array as the only eval was counted as a complete declaration — feature_scope returned 0 (globs: $out)"

  # Trailing inline comment: `paths: [...] # note` must yield the clean glob
  # with the comment stripped, not a garbage glob with "# note" appended.
  # This is the success-path counterpart to the two cases above: the file IS
  # a complete, single-line declaration, so feature_scope must accept it
  # (rc 0) and the emitted union must contain no "#" fragment.
  cat > "$d/trailing-comment.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"] # note
  - id: E2
    criterion: AC-2
    paths: ["src/more/**"]
YAML
  out="$(feature_scope "$d/trailing-comment.yaml")"; rc=$?
  [ "$rc" -eq 0 ] \
    || fail indent-drift "single-line 'paths:' array with a trailing comment was refused — feature_scope returned $rc"
  printf '%s\n' "$out" | grep -q '#' \
    && fail indent-drift "trailing comment leaked into the emitted glob union: $out"
  printf '%s\n' "$out" | grep -qx 'src/covered/\*\*' \
    || fail indent-drift "expected clean glob 'src/covered/**' missing from union: $out"

  # Bracket-class glob: a glob containing `]` (from a character class like
  # `foo[0-9]`) must survive intact — this is the defect that shipped four
  # rounds in a row: `[^]]*` (or any bracket-splitting extractor) stops at the
  # FIRST `]`, truncating the glob and dropping every sibling after it.
  cat > "$d/bracket-glob.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/foo[0-9]/**", "src/bar/**"]
  - id: E2
    criterion: AC-2
    paths: ["src/more/**"]
YAML
  out="$(feature_scope "$d/bracket-glob.yaml")"; rc=$?
  [ "$rc" -eq 0 ] \
    || fail indent-drift "bracket-class glob declaration was refused — feature_scope returned $rc"
  printf '%s\n' "$out" | grep -qx 'src/foo\[0-9\]/\*\*' \
    || fail indent-drift "bracket-class glob truncated or missing from union: $out"
  printf '%s\n' "$out" | grep -qx 'src/bar/\*\*' \
    || fail indent-drift "sibling glob after a bracket-class glob was dropped from union: $out"

  # Single-quoted items: not the accepted grammar — refused, not tolerated.
  cat > "$d/single-quoted.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ['src/a/**']
YAML
  out="$(feature_scope "$d/single-quoted.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "single-quoted paths items were accepted — feature_scope returned 0 (globs: $out)"

  # Nested array: not the accepted grammar — refused, not tolerated.
  cat > "$d/nested-array.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: [["a"], "b"]
YAML
  out="$(feature_scope "$d/nested-array.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "nested array paths was accepted — feature_scope returned 0 (globs: $out)"

  # Trailing non-comment suffix: anything after `]` that is not a `#`
  # comment must be refused, not silently ignored.
  cat > "$d/trailing-junk.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["a"] junk
YAML
  out="$(feature_scope "$d/trailing-junk.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "trailing non-comment suffix after ']' was accepted — feature_scope returned 0 (globs: $out)"

  # Hyphenated-key block-scalar decoy: a key-name allow-list (e.g.
  # `[a-zA-Z_]*:`) never matches `expected-output:`, so its block-scalar body
  # is read as ordinary content and a decoy `paths:` line inside it is
  # mistaken for a real declaration. The guard must refuse the whole file
  # structurally (by "value starts with `|`/`>`"), regardless of the key
  # spelling.
  cat > "$d/hyphen-key-block-scalar.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    expected-output: |
    decoy prose:
    paths: ["src/decoy/**"]
YAML
  out="$(feature_scope "$d/hyphen-key-block-scalar.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "hyphenated-key ('expected-output:') block-scalar decoy was not refused — feature_scope returned 0 (globs: $out)"

  # Digit-suffixed-key variant of the same bypass: `note2:` is equally
  # outside any letter-only allow-list.
  cat > "$d/digit-key-block-scalar.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    note2: |
    decoy prose:
    paths: ["src/decoy/**"]
YAML
  out="$(feature_scope "$d/digit-key-block-scalar.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "digit-suffixed-key ('note2:') block-scalar decoy was not refused — feature_scope returned 0 (globs: $out)"

  # Single-line value containing `>` after the colon, but NOT as the first
  # character of the value: must NOT be refused. This is the other direction
  # of the same check — the block-scalar guard must key off the indicator
  # being the START of the value, not merely present somewhere on the line.
  cat > "$d/value-contains-gt.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    expected: "exit 0; a > b"
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    paths: ["src/more/**"]
YAML
  out="$(feature_scope "$d/value-contains-gt.yaml")"; rc=$?
  [ "$rc" -eq 0 ] \
    || fail indent-drift "a single-line value merely containing '>' after the colon was wrongly refused — feature_scope returned $rc"
  printf '%s\n' "$out" | grep -qx 'src/covered/\*\*' \
    || fail indent-drift "expected glob 'src/covered/**' missing from union: $out"
  printf '%s\n' "$out" | grep -qx 'src/more/\*\*' \
    || fail indent-drift "expected glob 'src/more/**' missing from union: $out"

  # Colon-in-key decoy (the live Critical this round closes): a quoted key
  # whose OWN text contains a colon (`"note: x":`) defeats an extractor that
  # anchors the block-scalar guard on the FIRST colon in the line — it lands
  # mid-key instead of at the key's true end, reads the rest of the line as
  # if it were the value, and never recognizes the `|` that follows as a
  # block-scalar indicator. The prose beneath it (including a decoy
  # `paths:` line) then leaks straight into either counter.
  cat > "$d/colon-in-key.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    paths: ["src/covered/**"]
  - id: E2
    "note: x": |
    decoy:
    paths: ["src/decoy/**"]
YAML
  out="$(feature_scope "$d/colon-in-key.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "colon-in-key decoy ('\"note: x\":') was not refused — feature_scope returned 0 (globs: $out)"

  # Quoted key: not a shape this line-based parser can read reliably (is the
  # key `expected`, or is the key `"expected"` — a different string?) — must
  # be refused structurally, not tolerated as if unquoting were free.
  cat > "$d/quoted-key.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    paths: ["src/covered/**"]
  - id: E2
    "expected": |
    decoy prose:
    paths: ["src/decoy/**"]
YAML
  out="$(feature_scope "$d/quoted-key.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "quoted key ('\"expected\":') was not refused — feature_scope returned 0 (globs: $out)"

  # Key with an embedded space: `my key: |` is not `[A-Za-z_][A-Za-z0-9_-]*:`
  # and must be refused rather than treated as some normalized key name.
  cat > "$d/space-in-key.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    paths: ["src/covered/**"]
  - id: E2
    my key: |
    decoy prose:
    paths: ["src/decoy/**"]
YAML
  out="$(feature_scope "$d/space-in-key.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "key with an embedded space ('my key:') was not refused — feature_scope returned 0 (globs: $out)"

  # Hyphenated key with a single-line (non-block-scalar) value: must NOT be
  # refused. This is the positive counterpart to the key-grammar checks
  # above — a legal, ordinary eval-level key that merely happens to be
  # kebab-case, with every eval in the file declaring real `paths`, must
  # still be accepted and its `paths` still joined into the union.
  cat > "$d/hyphen-key-singleline.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    extra-note: "hello"
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    paths: ["src/more/**"]
YAML
  out="$(feature_scope "$d/hyphen-key-singleline.yaml")"; rc=$?
  [ "$rc" -eq 0 ] \
    || fail indent-drift "hyphenated key with a single-line value ('extra-note: \"hello\"') was wrongly refused — feature_scope returned $rc"
  printf '%s\n' "$out" | grep -qx 'src/covered/\*\*' \
    || fail indent-drift "expected glob 'src/covered/**' missing from union: $out"
  printf '%s\n' "$out" | grep -qx 'src/more/\*\*' \
    || fail indent-drift "expected glob 'src/more/**' missing from union: $out"

  pass indent-drift
}
