---
schema_version: 2
feature_slug: cache-l3-tier-b
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bb4e11998f364f3671b641a9fef97683e244fea8
human_signoff: Manh 2026-08-04
---

# Evidence Report: cache-l3-tier-b

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-12 | test | PASS |
| E14 | AC-13 | script | PASS |
| E15 | AC-14 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-cache-l3-tier-b-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_mixed_warm_run
  verified_at: 2026-08-04T10:22:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.09s

- eval: E2
  run_id: minted-cache-l3-tier-b-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_downstream_edit_keeps_gen
  verified_at: 2026-08-04T10:22:00Z
  output: |
    1 passed in 0.03s

- eval: E3
  run_id: minted-cache-l3-tier-b-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_workflow_isolation
  verified_at: 2026-08-04T10:22:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s
    EXIT_CODE: 0

- eval: E4
  run_id: minted-cache-l3-tier-b-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_duplicate_node_fresh
  verified_at: 2026-08-04T10:22:00Z
  output: |
    1 passed in 0.20s

- eval: E5
  run_id: minted-cache-l3-tier-b-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_no_workflow_id_scoped_off
  verified_at: 2026-08-04T10:22:00Z
  output: |
    1 passed in 0.03s

- eval: E6
  run_id: minted-cache-l3-tier-b-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-04T10:22:00Z
  output: |
    .                                                                        [100%]\n1 passed in 0.11s

- eval: E7
  run_id: minted-cache-l3-tier-b-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_workflow_scope_unconditional
  verified_at: 2026-08-04T10:22:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E8
  run_id: minted-cache-l3-tier-b-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_git_status_failure_is_dirty
  verified_at: 2026-08-04T10:22:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.15s

- eval: E9
  run_id: minted-cache-l3-tier-b-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_l3_workflow_id_sentinel
  verified_at: 2026-08-04T10:22:00Z
  output: |
    Tests  1 passed | 8 skipped (9)
    Start at  10:22:07
    Duration  537ms (transform 145ms, setup 0ms, import 32ms, tests 381ms, environment 0ms)

- eval: E10
  run_id: minted-cache-l3-tier-b-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_bridge_workflow_id
  verified_at: 2026-08-04T10:22:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.24s

- eval: E11
  run_id: minted-cache-l3-tier-b-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_l1_l2_evals_on_new_tree
  verified_at: 2026-08-04T10:22:00Z
  output: |
    ....................                                                     [100%]
    20 passed in 0.71s

- eval: E12
  run_id: minted-cache-l3-tier-b-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_tenant_in_tier_b_key
  verified_at: 2026-08-04T10:22:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E13
  run_id: minted-cache-l3-tier-b-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_l2_full_rerun
  verified_at: 2026-08-04T10:22:00Z
  output: |
    Tests  9 passed (9)
    Start at  10:22:21
    Duration  539ms (transform 86ms, setup 0ms, import 69ms, tests 338ms, environment 0ms)

- eval: E14
  run_id: minted-cache-l3-tier-b-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_conformance_l0_full_rerun
  verified_at: 2026-08-04T10:22:00Z
  output: |
    OK: the conformance suite discriminates on all three perturbation kinds
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    OK: TypeScript install -> Python scan preserved pluginRev c4f4a3644faad7eff1130f54fcbf0a8c0cd4fa0d

- eval: E15
  run_id: minted-cache-l3-tier-b-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_batch_duplicate_variants
  verified_at: 2026-08-04T10:22:00Z
  output: |
    1 passed in 0.04s

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — no non-discriminating evals flagged this round (baseline not re-measured this round; A/B discrimination evidence stands from the prior baseline round)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: all 15 evals (E1-E15) passed on first run; suite reruns (pnpm build/typecheck/lint/test, full sdk pytest, verify:plugins, gen:abi diff-check) also green — no return to implementation needed.
Round 2: re-verify triggered by feat/cache-l4-eviction touching this feature's owned files (sdk/tests/test_node_cache.py, sdk/tongflow/engine/__main__.py, sdk/tongflow/engine/node_cache.py, sdk/tongflow/engine/runner.py, src/lib/task/engine-delegate.server.ts, src/lib/task/engine-delegate.test.ts) — eval surface rerun on the new tree stayed green (49 sdk pytest + vitest engine-delegate.test.ts), verified_commit re-pinned to c000b4b6b32f29eea6217f8de26596a052737128.
Round 3: full re-verify on tree bb4e11998f364f3671b641a9fef97683e244fea8 (compose-overlay merge) — all 15 evals (E1-E15) rerun clean plus full suite (pnpm build/typecheck, lint:check, pnpm test, full sdk pytest, verify:plugins, gen:abi diff-check) green; no return to implementation needed.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
