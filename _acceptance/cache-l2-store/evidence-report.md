---
schema_version: 2
feature_slug: cache-l2-store
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2bdf3062af6f7b0e353123d002747ce9f09e2bca
human_signoff:
---

# Evidence Report: cache-l2-store

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
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15 | AC-14 | test | PASS |
| E16 | AC-15 | test | PASS |
| E17 | AC-16 | test | PASS |
| E18 | AC-16 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-cache-l2-store-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_hit_after_miss
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E2
  run_id: minted-cache-l2-store-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_blob_into_run_store
  verified_at: 2026-08-02T20:37:00Z
  output: |
    1 passed in 0.16s

- eval: E3
  run_id: minted-cache-l2-store-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_no_entry_on_failure
  verified_at: 2026-08-02T20:37:00Z
  output: |
    1 passed in 0.03s

- eval: E4
  run_id: minted-cache-l2-store-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_unusable_entry_is_miss
  verified_at: 2026-08-02T20:37:00Z
  output: |
    1 passed in 0.05s

- eval: E5
  run_id: minted-cache-l2-store-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_write_failure_survives
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E6
  run_id: minted-cache-l2-store-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_deleted_dir_same_result
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7
  run_id: minted-cache-l2-store-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_slot_not_allowlisted
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.10s

- eval: E8
  run_id: minted-cache-l2-store-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_tenant_missing
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E9
  run_id: minted-cache-l2-store-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_tenant_isolation
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E10
  run_id: minted-cache-l2-store-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_dirty_plugin
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.19s

- eval: E11
  run_id: minted-cache-l2-store-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_batch_partial_hit
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E12
  run_id: minted-cache-l2-store-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_blob_dedupe
  verified_at: 2026-08-02T20:37:00Z
  output: |
    1 passed in 0.08s

- eval: E13
  run_id: minted-cache-l2-store-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_abi_digest_in_key
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E14
  run_id: minted-cache-l2-store-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_engine_rejects_empty_tenant
  verified_at: 2026-08-02T20:37:00Z
  output: |
    1 passed in 0.03s

- eval: E15
  run_id: minted-cache-l2-store-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_l2_tenant_sentinel
  verified_at: 2026-08-02T20:37:00Z
  output: |
    Tests  1 passed | 8 skipped (9)
    Start at  20:37:00
    Duration  418ms (transform 88ms, setup 0ms, import 74ms, tests 222ms, environment 0ms)

- eval: E16
  run_id: minted-cache-l2-store-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_input_change_partial_rerun
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E17
  run_id: minted-cache-l2-store-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_l2_data_dir_stable
  verified_at: 2026-08-02T20:37:00Z
  output: |
    Tests  1 passed | 8 skipped (9)
    Start at  20:36:59
    Duration  389ms (transform 52ms, setup 0ms, import 33ms, tests 237ms, environment 0ms)

- eval: E18
  run_id: minted-cache-l2-store-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_bridge_same_data_dir_hits
  verified_at: 2026-08-02T20:37:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — khong co eval non-discriminating nao duoc ghi nhan round nay (baseline carried tu round truoc, khong do lai round nay).

## Variance

none — every multi-run eval is uniform (khong co eval stochastic round nay, tat ca deu runs=1).

## Iterations

Round 1 (2026-07-30): E1-E18 green ngay lan chay dau tren verified_commit c000b4b6b32f29eea6217f8de26596a052737128; pnpm build/typecheck/lint/test, sdk pytest full suite, verify:plugins, va gen:abi diff deu sach; khong quay lai implementation; human_signoff round 1: Manh Phan 2026-08-01.
Round 2 (nay, verified_commit 2bdf3062af6f7b0e353123d002747ce9f09e2bca): sau khi cache-l3-tier-b va cache-l4-eviction merge vao main va cham vao code so huu cua cache-l2-store, chay lai toan bo E1-E18 tren tree moi — tat ca xanh ngay lan chay dau (exit 0, khong retry); pnpm build && pnpm typecheck, pnpm lint:check, pnpm test (405 passed), sdk pytest full suite (193 passed), pnpm verify:plugins, va pnpm gen:abi diff-clean deu sach; baseline khong do lai round nay (P2 — evals.yaml khong doi tu lan baseline cuoi); khong quay lai implementation; cho human_signoff moi tren tree nay.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract


---

Re-verify on branch feat/cache-l3-tier-b (2026-07-30). This feature's owned code changed on this branch, so the prior evidence and signature do not carry forward. `verified_commit` re-pinned to 77fb83f9cc25c9d65e0021563203aafd899928e0. A FRESH human signature is required at cache-l3-tier-b's Gate 2 — the old signature attests to the old tree only.
Evidence (real rerun on this tree): eval E13 of cache-l3-tier-b — the complete `tests/test_node_cache.py` (33 tests) plus `pnpm vitest run src/lib/task/engine-delegate.test.ts`, one exit code, run_id minted-cache-l3-tier-b-E13-r1, exit 0. Run-log: `_acceptance/cache-l3-tier-b/run-log.jsonl`.

Signed: Manh, 2026-07-30 — fresh signature at cache-l3-tier-b Gate 2 (re-verify path, evidence above).


---

Re-verify on branch feat/cache-l4-eviction (2026-07-31). This feature's owned code changed on this branch (sdk/tests/test_node_cache.py · sdk/tongflow/engine/__main__.py · sdk/tongflow/engine/node_cache.py · sdk/tongflow/engine/runner.py · src/lib/task/engine-delegate.server.ts · src/lib/task/engine-delegate.test.ts), so the prior evidence and signature do not carry forward. `verified_commit` re-pinned to c000b4b6b32f29eea6217f8de26596a052737128. A FRESH human signature is required at cache-l4-eviction's Gate 2 — the old signature attests to the old tree only.
Evidence (real rerun on this tree): its own eval surface rerun locally on this tree, 2026-07-31 — `(cd sdk && ... pytest -q tests/test_node_cache.py)` (23 passed, exit 0; the tier-A/store suite that carries every sdk_pytest_l2_* node-id after the cache-l4-eviction file split) and `pnpm vitest run src/lib/task/engine-delegate.test.ts` (exit 0; carries unit_l2_tenant_sentinel / unit_l2_data_dir_stable). Touched files are the L4 wiring: put() gained keyword-only tenant/workflow_scope/log, get() a recency touch + log, runner gained reuse/counters/sweep-at-end — every L2 behavior re-proven by the reran suite on the split files.
Standing checks green on the new tree (S4 round 1 of cache-l4-eviction, run-log `_acceptance/cache-l4-eviction/run-log.jsonl`): `pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test` (363 passed), full sdk pytest (189 passed), `pnpm verify:plugins`, `pnpm gen:abi` diff-clean.
