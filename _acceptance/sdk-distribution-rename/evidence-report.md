---
schema_version: 2
feature_slug: sdk-distribution-rename
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ed09b5a64f2979443e1a3aacf07bcd4daa1f8e36
human_signoff: Manh 2026-08-04
---

# Evidence Report: sdk-distribution-rename

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
| E10 | AC-10 | test | PASS |
| E14 | AC-13 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-sdk-distribution-rename-E1-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E2
  run_id: minted-sdk-distribution-rename-E2-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E3
  run_id: minted-sdk-distribution-rename-E3-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E4
  run_id: minted-sdk-distribution-rename-E4-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E5
  run_id: minted-sdk-distribution-rename-E5-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E6
  run_id: minted-sdk-distribution-rename-E6-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E7
  run_id: minted-sdk-distribution-rename-E7-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E8
  run_id: minted-sdk-distribution-rename-E8-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E9
  run_id: minted-sdk-distribution-rename-E9-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E10
  run_id: minted-sdk-distribution-rename-E10-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E14
  run_id: minted-sdk-distribution-rename-E14-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ...........                                                              [100%]
    11 passed in 6.71s

- eval: E11
  run_id: minted-sdk-distribution-rename-E11-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-04T09:15:00Z
  output: |
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 8.50s

- eval: E12
  run_id: minted-sdk-distribution-rename-E12-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-04T09:15:00Z
  output: |
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    $ tsc --noEmit

- eval: E13
  run_id: minted-sdk-distribution-rename-E13-r15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-04T09:15:00Z
  output: |
    Checked 426 files in 227ms. No fixes applied.

## Analyst

carried tu round trước — baseline không đo lại round này

none — every feature eval is red on baseline (discriminates)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 15: all 14 evals (E1-E10, E14, E11, E12, E13) passed on this verify pass — sdk_pytest_packaging suite (11), full sdk pytest suite (193), pnpm build + typecheck, and pnpm lint:check all green; failure history for earlier rounds was not supplied to this verify context.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
