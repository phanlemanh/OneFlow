---
schema_version: 2
feature_slug: stale-scope-by-paths
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8512c6e98c48ab3f4cab75dafa9493a0b1e36868
human_signoff: Manh 2026-08-07
---

# Evidence Report: stale-scope-by-paths

E3 is DESCOPED (2026-08-05, Gate 2, Manh — see decisions.jsonl and the contract's
Amendment) and is not run or scored here. AC-3 therefore has no direct machine eval;
that gap is recorded in the contract's Known limits, not resolved by this round.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
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
  run_id: stale-scope-by-paths-E1-20260807T013402Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_in_scope
  verified_at: 2026-08-07T01:34:02Z
  output: |
    CASE in-scope: PASS

- eval: E2
  run_id: stale-scope-by-paths-E2-20260807T013406Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_out_of_scope
  verified_at: 2026-08-07T01:34:06Z
  output: |
    CASE out-of-scope: PASS

- eval: E4
  run_id: stale-scope-by-paths-E4-20260807T013410Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_partial
  verified_at: 2026-08-07T01:34:10Z
  output: |
    CASE partial: PASS

- eval: E5
  run_id: stale-scope-by-paths-E5-20260807T013415Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_under_declared
  verified_at: 2026-08-07T01:34:15Z
  output: |
    CASE under-declared: PASS

- eval: E6
  run_id: stale-scope-by-paths-E6-20260807T013419Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_malformed
  verified_at: 2026-08-07T01:34:19Z
  output: |
    CASE malformed: PASS

- eval: E7
  run_id: stale-scope-by-paths-E7-20260807T013425Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_merged_halves
  verified_at: 2026-08-07T01:34:25Z
  output: |
    CASE merged-halves: PASS

- eval: E8
  run_id: stale-scope-by-paths-E8-20260807T013430Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_suppression
  verified_at: 2026-08-07T01:34:30Z
  output: |
    CASE suppression: PASS

- eval: E9
  run_id: stale-scope-by-paths-E9-20260807T013510Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_mutation
  verified_at: 2026-08-07T01:35:10Z
  output: |
    CASE mutation: PASS

- eval: E10
  run_id: stale-scope-by-paths-E10-20260807T013520Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_case_completeness
  verified_at: 2026-08-07T01:35:20Z
  output: |
    CASE case-completeness: PASS

- eval: E11
  run_id: stale-scope-by-paths-E11-20260807T013524Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_guard_not_exempt
  verified_at: 2026-08-07T01:35:24Z
  output: |
    CASE guard-not-exempt: PASS

- eval: E12
  run_id: stale-scope-by-paths-E12-20260807T013502Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_two_bases
  verified_at: 2026-08-07T01:35:02Z
  output: |
    CASE two-bases: PASS

- eval: E13
  run_id: stale-scope-by-paths-E13-20260807T013527Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_no_kill_switch
  verified_at: 2026-08-07T01:35:27Z
  output: |
    CASE no-kill-switch: PASS

- eval: E14
  run_id: stale-scope-by-paths-E14-20260807T013545Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_real_repo
  verified_at: 2026-08-07T01:35:45Z
  output: |
    OK: conformance-l0 refused narrow scope for exactly the six declared-but-missing files
  note: |
    The one eval of this feature that reads the real repository rather than a
    fixture. It stays meaningful on this branch because both of its refs are pinned
    to literal SHAs rather than branch names, so the branch's new commits cannot
    move its answer — which is exactly the property AC-10 was written to buy.

- eval: E15
  run_id: stale-scope-by-paths-E15-20260807T013434Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_announce
  verified_at: 2026-08-07T01:34:34Z
  output: |
    CASE announce: PASS

- eval: E16
  run_id: stale-scope-by-paths-E16-20260807T013533Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_indent_drift
  verified_at: 2026-08-07T01:35:33Z
  output: |
    CASE indent-drift: PASS

## Analyst

No A/B baseline was taken: establishing one requires moving the working tree to the
diffBase, which this re-verification round is explicitly forbidden to do (no git
operations of any kind). Every eval therefore carries `baseline: n-a`, and no claim
is made here about which evals discriminate.

The branch edited `scripts/acceptance/**`, which is this feature's own subject
matter, so the two evals that exist to stop this suite going vacuous carry the
weight here and both hold at this HEAD. E9's mutation guard still drives the
mechanism red under both perturbations — narrow scope forced to match nothing, and
the completeness test forced to always pass in both of the places it now lives — and
green again on revert. E10 still confirms the guard notices when a named case is
removed from its list, which is what keeps a never-implemented case from reading the
same as a passing one. E13 confirms the shipped gate carries none of those
perturbation knobs by name.

E14 deserves a note beyond its own criterion: it asserts that `conformance-l0`'s
declaration refuses narrow scope for exactly six named files, and it still returns
that exact set on this branch. Since `conformance-l0` was independently re-verified
clean in this same round, the two results are consistent with each other.

No judgment executors appear in this feature's evals.yaml, so nothing here is left
unscored for a judge.

## Variance

none — every eval in this feature is deterministic (no `runs` declared, no executor
crossing a provider or LLM).

## Iterations

Round 1 (re-verification after upstream code change): all sixteen live evals clean at
a788985 (E3 descoped at Gate 2 and not run).

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] No judgment items in this feature — nothing to override
- [ ] AC-3 still has no direct machine eval (E3 descoped); confirm that remains an
      accepted, queued gap rather than something this round was expected to close
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

### Re-pin lần 1 — 2026-08-27, do fork `STALE-DIFF-SCOPE-GUARD` được thu hẹp (hồ sơ `gate-tooling-t1`): feature khai đủ `paths` nay lại bị soi staleness, làm lộ bản ghi cũ này. Mã của gói này không đổi — mọi suite chạy lại đều exit 0
run_id: repin-stale-scope-by-paths-20260827T101500Z
sha: d919b5eb51a0a3dfa70b5718113c935b39099ab0 · suites: 15 lệnh exit 0

### Re-pin lần 2 — 2026-08-28, do nhánh `fix/scoping-fixtures-diff-shape` thu hẹp fork `STALE-DIFF-SCOPE-GUARD` và thêm guard dưới `scripts/acceptance/**`: feature khai `paths` nay bị soi, và thay đổi gated của nhánh rơi vào vùng eval của hồ sơ này chạy qua. Mã sản phẩm không đổi — mọi suite chạy lại đều exit 0
run_id: repin-stale-scope-by-paths-20260828T053000Z
sha: 8512c6e98c48ab3f4cab75dafa9493a0b1e36868 · suites: 15 lệnh exit 0
