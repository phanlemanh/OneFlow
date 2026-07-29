---
schema_version: 2
feature_slug: stale-scope-by-paths
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b3240c46cd4c9e93b26ca075ec09eb750d4e19c4
human_signoff:
---

# Evidence Report: stale-scope-by-paths

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | script | PASS |
| E13 | AC-13 | script | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-14 | script | PASS |
| E16 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-stale-scope-by-paths-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_in_scope
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE in-scope: PASS

- eval: E2
  run_id: minted-stale-scope-by-paths-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_out_of_scope
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE out-of-scope: PASS

- eval: E3
  run_id: minted-stale-scope-by-paths-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scoping_golden
  verified_at: 2026-07-29T09:00:00Z
  output: |
    OK: undeclared features keep byte-identical gate output

- eval: E4
  run_id: minted-stale-scope-by-paths-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_partial
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE partial: PASS

- eval: E5
  run_id: minted-stale-scope-by-paths-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_under_declared
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE under-declared: PASS

- eval: E6
  run_id: minted-stale-scope-by-paths-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_malformed
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE malformed: PASS
    EXIT_CODE: 0

- eval: E7
  run_id: minted-stale-scope-by-paths-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_merged_halves
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE merged-halves: PASS

- eval: E8
  run_id: minted-stale-scope-by-paths-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_suppression
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE suppression: PASS

- eval: E9
  run_id: minted-stale-scope-by-paths-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_mutation
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE mutation: PASS

- eval: E10
  run_id: minted-stale-scope-by-paths-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_case_completeness
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE case-completeness: PASS

- eval: E11
  run_id: minted-stale-scope-by-paths-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_guard_not_exempt
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE guard-not-exempt: PASS

- eval: E12
  run_id: minted-stale-scope-by-paths-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_two_bases
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE two-bases: PASS

- eval: E13
  run_id: minted-stale-scope-by-paths-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_no_kill_switch
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE no-kill-switch: PASS

- eval: E14
  run_id: minted-stale-scope-by-paths-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_real_repo
  verified_at: 2026-07-29T09:00:00Z
  output: |
    OK: conformance-l0 refused narrow scope for exactly the six declared-but-missing files

- eval: E15
  run_id: minted-stale-scope-by-paths-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_announce
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE announce: PASS

- eval: E16
  run_id: minted-stale-scope-by-paths-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stale_scope_indent_drift
  verified_at: 2026-07-29T09:00:00Z
  output: |
    CASE indent-drift: PASS

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — khong co eval nao chay nhieu lan (runs=1 cho toan bo E1-E16), khong phat sinh phuong sai.

## Iterations

Round 1: All 16 script evals (E1-E16) exit 0 against the fixture suite, and the supporting `pnpm build`/`typecheck`/`lint:check`/`test`, SDK `pytest`, `verify:plugins`, and `gen:abi` diff-check all pass clean — but code review surfaced 2 CRITICAL/HIGH in-contract findings that no fixture in the current suite exercises: an AC-1 counterexample (scope_has_any_match() vs stale_files()/scope_gaps() namespace mismatch — narrow scope silently matches nothing once `_acceptance/` sits below the git root, reproduced end-to-end against a fixture repo) and an AC-10 reproducibility gap (E14's pinned HEAD_SHA 5986bb27b8aa2200e74f44c729be8782264d137d is unreachable from any remote ref, so it only passes in this working copy, not on a fresh clone or CI). Overall gate verdict REJECT. Returned to implementation.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract