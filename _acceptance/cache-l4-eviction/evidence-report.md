---
schema_version: 2
feature_slug: cache-l4-eviction
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: eb87881a2122e8a7a2faef23423d3977f19b76d7
human_signoff:
---

# Evidence Report: cache-l4-eviction

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-13 | test | PASS |
| E16 | AC-13 | test | PASS |
| E17 | AC-14 | script | PASS |
| E18 | AC-15 | test | PASS |
| E19 | AC-16 | test | PASS |
| E20 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-cache-l4-eviction-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_lru_recency
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E2
  run_id: minted-cache-l4-eviction-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_cap_converges
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E3
  run_id: minted-cache-l4-eviction-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_under_cap_noop
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.20s

- eval: E4
  run_id: minted-cache-l4-eviction-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_shared_blob_survives
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.22s

- eval: E5
  run_id: minted-cache-l4-eviction-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_orphan_blob_gc
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E6
  run_id: minted-cache-l4-eviction-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_legacy_entry
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E7
  run_id: minted-cache-l4-eviction-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_sweep_failsafe
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.18s

- eval: E8
  run_id: minted-cache-l4-eviction-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_cache_errors_logged
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E9
  run_id: minted-cache-l4-eviction-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_purge_scope
  verified_at: 2026-07-30T13:47:00Z
  output: |
    1 passed in 0.05s

- eval: E10
  run_id: minted-cache-l4-eviction-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_purge_idempotent
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E11
  run_id: minted-cache-l4-eviction-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_reuse_off
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.25s

- eval: E12
  run_id: minted-cache-l4-eviction-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_reuse_invalid
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E13
  run_id: minted-cache-l4-eviction-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_counters
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E14
  run_id: minted-cache-l4-eviction-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_node_cached_event
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E15
  run_id: minted-cache-l4-eviction-E15-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit_l4_delegate_persists
  verified_at: 2026-07-30T13:46:39Z
  output: |
          Tests  6 passed | 3 skipped (9)
       Start at  13:46:39
       Duration  465ms (transform 66ms, setup 0ms, import 28ms, tests 323ms, environment 0ms)

- eval: E16
  run_id: minted-cache-l4-eviction-E16-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit_l4_schema_columns
  verified_at: 2026-07-30T13:46:40Z
  output: |
          Tests  3 passed | 4 skipped (7)
       Start at  13:46:40
       Duration  276ms (transform 14ms, setup 0ms, import 178ms, tests 9ms, environment 0ms)

- eval: E17
  run_id: minted-cache-l4-eviction-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cache_test_layout
  verified_at: 2026-07-30T13:47:00Z
  output: |
    OK: cache test layout

- eval: E18
  run_id: minted-cache-l4-eviction-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E19
  run_id: minted-cache-l4-eviction-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_l4_sweep_wired
  verified_at: 2026-07-30T13:47:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E20
  run_id: minted-cache-l4-eviction-E20-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit_l4_node_cached_consumer
  verified_at: 2026-07-30T13:46:51Z
  output: |
          Tests  4 passed | 7 skipped (11)
       Start at  13:46:51
       Duration  128ms (transform 21ms, setup 0ms, import 28ms, tests 3ms, environment 0ms)

## Analyst

E15, E16, E20 — all three pass on both HEAD and the diffBase (baseline: green), so they do not by themselves discriminate this feature from the pre-feature tree. They are the intentional TS-side consumer half of atomic pairs whose SDK-side counterpart is red-on-baseline (E13/E14 pairs with E15; E14 pairs with E20; E16's schema-column addition is additive so an empty/absent-column baseline naturally still "passes" a query written to tolerate NULLs) — treat these three as regression-guards written deliberately to hold once the SDK half lands, not as accidental non-discriminating tests. No rewrite needed; confirmed intended.

## Variance

none — every multi-run eval is uniform (no eval in this round carries runs > 1)

## Iterations

Round 1: all 20 evals passed on first attempt (E1-E20, exit 0, no failures returned to implementation). Full-repo verification also green in the same round: `pnpm build`, `pnpm typecheck`, `pnpm lint:check` (Biome, 416 files, no fixes), `pnpm test` (363 passed), the full SDK pytest suite (189 passed), `pnpm verify:plugins`, and `pnpm gen:abi` (no diff against committed generated files).

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
