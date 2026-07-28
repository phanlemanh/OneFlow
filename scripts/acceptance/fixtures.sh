#!/usr/bin/env bash
# Fixture-construction helpers for scripts/acceptance/check-stale-scoping.sh.
#
# Split out of that file purely to keep both under this repo's 800-line-per-
# file convention (CLAUDE.md) — this file has no case_* entry points and no
# CLI of its own; it is only ever sourced.
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
  case "$mode" in
    none)    p1=""; p2="" ;;
    partial) p1='    paths: ["src/covered/**"]'; p2="" ;;
    empty)   p1='    paths: []'; p2='    paths: []' ;;
    narrow)  p1='    paths: ["src/covered/**"]'; p2='    paths: ["src/covered/**"]' ;;
    all|*)   p1='    paths: ["src/covered/**"]'; p2='    paths: ["src/covered/**", "src/uncovered/**"]' ;;
  esac
  write_evals_yaml "$d" "$slug" "$p1" "$p2"
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

# mk_pair_fixture <dir> <slug1> <slug2>
# Two independently narrow-scoped features (paths cover src/covered/** only)
# sharing ONE repo — for guards that assert one feature's cross-check cannot
# be tripped by a change confined to the OTHER feature's artifacts (regex-slug
# confusion, trailing-slash anchoring).
#
# Deliberately does NOT bind its first parameter to a variable named "d" —
# callers that already hold their own fixture dir in "$d" (with a
# `trap 'rm -rf "$d"' RETURN` registered against it) would have that trap
# silently retargeted to whatever this function's "d" is reassigned to,
# since the trap's "$d" is expanded at RETURN time, not at registration time.
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
  rgw_dir="$(mktemp -d)"
  rgw_base="$(mk_committed_report_fixture "$rgw_dir" fx "$rgw_mode")"
  ( cd "$rgw_dir" && echo drift > "$rgw_drift" && git add -A && git commit -q -m drift )
  bash "$rgw_gate" "$rgw_dir" --base "$rgw_base" 2>&1
  rm -rf "$rgw_dir"
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
  work="$(mktemp -d)"; trap 'rm -rf "$work"' RETURN
  cp "$GATE" "$work/gate.sh"
  cp "$(dirname "$GATE")/recheck-evidence.js" "$work/" 2>/dev/null || true

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

  # (b) neutralize feature_scope's n_evals==n_paths completeness check: a
  # "partial" declaration (one eval left undeclared) is then trusted as
  # complete, scoping ONLY to what WAS declared and silently dropping the
  # undeclared eval's implicit "everything" — drift outside that narrowed
  # scope goes unreported.
  sed 's/\[ "\$n_evals" -eq "\$n_paths" \] || return 1/:/' \
    "$work/gate.sh" > "$work/gate_b.sh"
  cmp -s "$work/gate.sh" "$work/gate_b.sh" \
    && fail mutation "perturbation (b) patched nothing — the sed target moved"
  b_out="$(run_gate_with_drift "$work/gate_b.sh" partial src/uncovered/new.txt)"
  printf '%s\n' "$b_out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    && fail mutation "perturbation (b) did not go RED — a partial declaration is trusted"

  # Revert: the unpatched copy is green again on both shapes.
  r1="$(run_gate_with_drift "$work/gate.sh" all src/covered/new.txt)"
  printf '%s\n' "$r1" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail mutation "revert: in-scope change no longer caught"
  r2="$(run_gate_with_drift "$work/gate.sh" partial src/uncovered/new.txt)"
  printf '%s\n' "$r2" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail mutation "revert: partial declaration no longer falls back"
  pass mutation
}
