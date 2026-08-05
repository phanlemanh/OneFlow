---
schema_version: 2
feature_slug: cache-l2-store
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5acc982e7690dc4106d9738ecf6ff99399f3e37f
human_signoff: Manh 2026-08-04
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
  run_id: minted-cache-l2-store-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_hit_after_miss
  verified_at: 2026-08-04T10:01:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E2
  run_id: minted-cache-l2-store-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_blob_into_run_store
  verified_at: 2026-08-04T10:01:01Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E3
  run_id: minted-cache-l2-store-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_no_entry_on_failure
  verified_at: 2026-08-04T10:01:02Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E4
  run_id: minted-cache-l2-store-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_unusable_entry_is_miss
  verified_at: 2026-08-04T10:01:03Z
  output: |
    1 passed in 0.03s

- eval: E5
  run_id: minted-cache-l2-store-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_write_failure_survives
  verified_at: 2026-08-04T10:01:04Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E6
  run_id: minted-cache-l2-store-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_deleted_dir_same_result
  verified_at: 2026-08-04T10:01:05Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E7
  run_id: minted-cache-l2-store-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_slot_not_allowlisted
  verified_at: 2026-08-04T10:01:06Z
  output: |
    . [100%]
    1 passed in 0.03s

- eval: E8
  run_id: minted-cache-l2-store-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_tenant_missing
  verified_at: 2026-08-04T10:01:07Z
  output: |
    .                                                                        [100%]
    1 passed in 0.17s

- eval: E9
  run_id: minted-cache-l2-store-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_tenant_isolation
  verified_at: 2026-08-04T10:01:08Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E10
  run_id: minted-cache-l2-store-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_dirty_plugin
  verified_at: 2026-08-04T10:01:09Z
  output: |
    1 passed in 0.13s

- eval: E11
  run_id: minted-cache-l2-store-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_batch_partial_hit
  verified_at: 2026-08-04T10:01:10Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E12
  run_id: minted-cache-l2-store-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_blob_dedupe
  verified_at: 2026-08-04T10:01:11Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E13
  run_id: minted-cache-l2-store-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_abi_digest_in_key
  verified_at: 2026-08-04T10:01:12Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E14
  run_id: minted-cache-l2-store-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_engine_rejects_empty_tenant
  verified_at: 2026-08-04T10:01:13Z
  output: |
    1 passed in 0.03s

- eval: E15
  run_id: minted-cache-l2-store-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_l2_tenant_sentinel
  verified_at: 2026-08-04T10:01:14Z
  output: |
    Tests  1 passed | 8 skipped (9)
    Start at  10:01:14
    Duration  450ms (transform 59ms, setup 0ms, import 36ms, tests 265ms, environment 0ms)

- eval: E16
  run_id: minted-cache-l2-store-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_input_change_partial_rerun
  verified_at: 2026-08-04T10:01:15Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E17
  run_id: minted-cache-l2-store-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_l2_data_dir_stable
  verified_at: 2026-08-04T10:01:15Z
  output: |
    Tests  1 passed | 8 skipped (9)
    Start at  10:01:15
    Duration  385ms (transform 52ms, setup 0ms, import 34ms, tests 232ms, environment 0ms)

- eval: E18
  run_id: minted-cache-l2-store-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l2_bridge_same_data_dir_hits
  verified_at: 2026-08-04T10:01:16Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

## Analyst

carried tu round truoc — baseline khong do lai round nay
none — every feature eval's baseline is n-a this round (not re-measured)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 3: E1-E18 all passed on the final tree; pnpm build/typecheck, pnpm lint:check, pnpm test (413 passed), the full sdk pytest suite (193 passed), pnpm verify:plugins, and pnpm gen:abi diff-check all green as regression guards.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

## Vòng kiểm lại 2026-08-04 (sau hạng mục 0.6 `gate-scope-anchors`)

Hợp đồng `gate-scope-anchors` chạm `scripts/**`, nên bằng chứng của hồ sơ này
thành cũ theo cơ chế staleness. Đã chạy lại: **18/18 eval xanh** ở
`5acc982e7690`, trong một đợt chạy chung 194 eval / 131 lệnh duy nhất của cả 13 hồ
sơ bị ảnh hưởng — không hồ sơ nào đỏ.

Chi phí này đã khai trước ở Cổng 1 của `gate-scope-anchors`.
