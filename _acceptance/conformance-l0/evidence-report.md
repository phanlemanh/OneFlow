---
schema_version: 2
feature_slug: conformance-l0
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d919b5eb51a0a3dfa70b5718113c935b39099ab0
human_signoff: Manh 2026-08-07
---

# Evidence Report: conformance-l0

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E14 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E15 | AC-8 | script | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: conformance-l0-E1-20260807T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-07T01:32:10Z
  output: |
    ................                                               [100%]
    16 passed in 0.03s
    (one run of tests/test_engine_batch.py serves E1, E2, E4, E5 and E13)

- eval: E2
  run_id: conformance-l0-E2-20260807T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-07T01:32:10Z
  output: |
    ................                                               [100%]
    16 passed in 0.03s

- eval: E3
  run_id: conformance-l0-E3-20260807T013224Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-07T01:32:24Z
  output: |
    ........................................................................ [ 37%]
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 4.39s

- eval: E14
  run_id: conformance-l0-E14-20260807T013214Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-08-07T01:32:14Z
  output: |
    .......                                                        [100%]
    7 passed in 0.03s

- eval: E4
  run_id: conformance-l0-E4-20260807T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-07T01:32:10Z
  output: |
    ................                                               [100%]
    16 passed in 0.03s

- eval: E5
  run_id: conformance-l0-E5-20260807T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-07T01:32:10Z
  output: |
    ................                                               [100%]
    16 passed in 0.03s

- eval: E6
  run_id: conformance-l0-E6-20260807T013214Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-08-07T01:32:14Z
  output: |
    .......                                                        [100%]
    7 passed in 0.03s
    (the four fixtures plus the compose-overlay conformance cases a later feature
    added to the same directory)

- eval: E7
  run_id: conformance-l0-E7-20260807T013236Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-07T01:32:36Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  12 passed (12)

- eval: E8
  run_id: conformance-l0-E8-20260807T013250Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.conformance_discriminating
  verified_at: 2026-08-07T01:32:50Z
  output: |
    ==> baseline: the suite must be GREEN
        green
    ==> perturbation (a): drop one item from the fan-out
        went RED as required
    ==> perturbation (b): add a business field on the Python side only
        went RED as required
    ==> perturbation (c): corrupt a fixture and run the TypeScript half
        went RED as required
    ==> revert: both halves must be GREEN again
        green
    OK: the conformance suite discriminates on all three perturbation kinds

- eval: E9
  run_id: conformance-l0-E9-20260807T013218Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-08-07T01:32:18Z
  output: |
    .......                                                        [100%]
    7 passed in 0.72s

- eval: E15
  run_id: conformance-l0-E15-20260807T013305Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.plugin_rev_joined_path
  verified_at: 2026-08-07T01:33:05Z
  output: |
    OK: TypeScript install -> Python scan preserved pluginRev
    90ada928bd2e852dd85acab44a5c3f35e5aee068

- eval: E10
  run_id: conformance-l0-E10-20260807T013218Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-08-07T01:32:18Z
  output: |
    .......                                                        [100%]
    7 passed in 0.72s

- eval: E11
  run_id: conformance-l0-E11-20260807T013237Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_rev
  verified_at: 2026-08-07T01:32:37Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  3 passed (3)

- eval: E12
  run_id: conformance-l0-E12-20260807T013238Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_node_cached
  verified_at: 2026-08-07T01:32:38Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  11 passed (11)

- eval: E13
  run_id: conformance-l0-E13-20260807T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-07T01:32:10Z
  output: |
    ................                                               [100%]
    16 passed in 0.03s

## Analyst

No A/B baseline was taken: establishing one requires moving the working tree to the
diffBase, which this re-verification round is explicitly forbidden to do (no git
operations of any kind). Every eval therefore carries `baseline: n-a`, and no claim
is made here about which evals discriminate.

This feature was the most exposed of the four to the branch's edits — it owns
`sdk/tongflow/engine/runner.py`, `sdk/tests/conformance/**` and
`src/lib/plugins/**`, and the branch added plugin work in all three areas. Nothing
regressed. Worth noting that E8 is not a bare pass: its mutation guard drove the
suite red on all three perturbation kinds and green again on revert at this HEAD, so
the conformance suite is still discriminating rather than merely still exiting 0 —
which is the property most likely to rot when fixtures are added around it, and a
later feature did add compose-overlay cases into `sdk/tests/conformance`.

No judgment executors appear in this feature's evals.yaml, so nothing here is left
unscored for a judge.

## Variance

none — every eval in this feature is deterministic (no `runs` declared, no executor
crossing a provider or LLM).

## Iterations

Round 1 (re-verification after upstream code change): all fifteen evals clean at
a788985.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] No judgment items in this feature — nothing to override
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

### Re-pin lần 1 — 2026-08-27, do fork `STALE-DIFF-SCOPE-GUARD` được thu hẹp (hồ sơ `gate-tooling-t1`): feature khai đủ `paths` nay lại bị soi staleness, làm lộ bản ghi cũ này. Mã của gói này không đổi — mọi suite chạy lại đều exit 0
run_id: repin-conformance-l0-20260827T101500Z
sha: d919b5eb51a0a3dfa70b5718113c935b39099ab0 · suites: 9 lệnh exit 0
