---
schema_version: 2
feature_slug: conformance-l0
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6ff7aec6171b8d154d786611c2fa2ec5e826cfc8
human_signoff:
---

# Evidence Report: conformance-l0

Round 5.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-3 | test | PASS |
| E15 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-conformance-l0-E1-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-03T17:30:00Z
  output: |
    16 passed in 0.42s

- eval: E2
  run_id: minted-conformance-l0-E2-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-03T17:30:00Z
  output: |
    16 passed in 0.42s

- eval: E3
  run_id: minted-conformance-l0-E3-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-03T17:30:00Z
  output: |
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 8.40s

- eval: E4
  run_id: minted-conformance-l0-E4-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-03T17:30:00Z
  output: |
    16 passed in 0.42s

- eval: E5
  run_id: minted-conformance-l0-E5-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-03T17:30:00Z
  output: |
    16 passed in 0.42s

- eval: E6
  run_id: minted-conformance-l0-E6-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-08-03T17:30:00Z
  output: |
    7 passed in 0.06s

- eval: E7
  run_id: minted-conformance-l0-E7-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-03T17:30:00Z
  output: |
    Tests  12 passed (12)
    Start at  17:30:16
    Duration  266ms (transform 76ms, setup 0ms, import 99ms, tests 4ms, environment 0ms)

- eval: E8
  run_id: minted-conformance-l0-E8-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.conformance_discriminating
  verified_at: 2026-08-03T17:30:00Z
  output: |
    ==> revert: both halves must be GREEN again
        green
    OK: the conformance suite discriminates on all three perturbation kinds

- eval: E9
  run_id: minted-conformance-l0-E9-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-08-03T17:30:00Z
  output: |
    .......                                                                  [100%]
    7 passed in 1.39s

- eval: E10
  run_id: minted-conformance-l0-E10-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-08-03T17:30:00Z
  output: |
    .......                                                                  [100%]
    7 passed in 1.39s

- eval: E11
  run_id: minted-conformance-l0-E11-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_rev
  verified_at: 2026-08-03T17:30:00Z
  output: |
    Tests  3 passed (3)
    Start at  17:30:16
    Duration  159ms (transform 15ms, setup 0ms, import 40ms, tests 4ms, environment 0ms)

- eval: E12
  run_id: minted-conformance-l0-E12-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_node_cached
  verified_at: 2026-08-03T17:30:00Z
  output: |
    Tests  11 passed (11)
    Start at  17:30:18
    Duration  161ms (transform 24ms, setup 0ms, import 32ms, tests 15ms, environment 0ms)

- eval: E13
  run_id: minted-conformance-l0-E13-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-03T17:30:00Z
  output: |
    16 passed in 0.42s

- eval: E14
  run_id: minted-conformance-l0-E14-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-08-03T17:30:00Z
  output: |
    7 passed in 0.06s

- eval: E15
  run_id: minted-conformance-l0-E15-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.plugin_rev_joined_path
  verified_at: 2026-08-03T17:30:00Z
  output: |
    OK: TypeScript install -> Python scan preserved pluginRev bba6b2665016055abf2fc1966b53f7bc78d4a371

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — no baseline re-measurement this round (P2, evals.yaml unchanged since last baseline round)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 5: all 15 evals PASS (E1-E15) on first pass; full regression suite (pnpm build, typecheck, lint:check, pnpm test, verify:plugins, gen:abi diff) green; baseline not re-measured this round (P2 — evals.yaml unchanged since last baseline round).

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
