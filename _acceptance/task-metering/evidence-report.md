---
schema_version: 2
feature_slug: task-metering
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5acc982e7690dc4106d9738ecf6ff99399f3e37f
human_signoff: Manh 2026-08-04
---

# Evidence Report: task-metering

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
| E12 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-task-metering-E1-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-08-04T11:03:10Z
  output: |
    Tests  7 passed (7)
    Start at  11:03:10
    Duration  678ms (transform 28ms, setup 0ms, import 475ms, tests 20ms, environment 0ms)

- eval: E2
  run_id: minted-task-metering-E2-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-08-04T11:03:10Z
  output: |
    Tests  7 passed (7)
    Start at  11:03:10
    Duration  678ms (transform 28ms, setup 0ms, import 475ms, tests 20ms, environment 0ms)

- eval: E3
  run_id: minted-task-metering-E3-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-08-04T11:03:10Z
  output: |
    Tests  7 passed (7)
    Start at  11:03:10
    Duration  678ms (transform 28ms, setup 0ms, import 475ms, tests 20ms, environment 0ms)

- eval: E4
  run_id: minted-task-metering-E4-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-04T11:03:12Z
  output: |
    Tests  6 passed (6)
    Start at  11:03:12
    Duration  633ms (transform 93ms, setup 0ms, import 307ms, tests 224ms, environment 0ms)

- eval: E5
  run_id: minted-task-metering-E5-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-04T11:03:12Z
  output: |
    Tests  6 passed (6)
    Start at  11:03:12
    Duration  633ms (transform 93ms, setup 0ms, import 307ms, tests 224ms, environment 0ms)

- eval: E6
  run_id: minted-task-metering-E6-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-04T11:03:12Z
  output: |
    Tests  6 passed (6)
    Start at  11:03:12
    Duration  633ms (transform 93ms, setup 0ms, import 307ms, tests 224ms, environment 0ms)

- eval: E7
  run_id: minted-task-metering-E7-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-04T11:03:12Z
  output: |
    Tests  6 passed (6)
    Start at  11:03:12
    Duration  633ms (transform 93ms, setup 0ms, import 307ms, tests 224ms, environment 0ms)

- eval: E8
  run_id: minted-task-metering-E8-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-04T11:03:12Z
  output: |
    Tests  6 passed (6)
    Start at  11:03:12
    Duration  633ms (transform 93ms, setup 0ms, import 307ms, tests 224ms, environment 0ms)

- eval: E9
  run_id: minted-task-metering-E9-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-04T11:03:12Z
  output: |
    Tests  6 passed (6)
    Start at  11:03:12
    Duration  633ms (transform 93ms, setup 0ms, import 307ms, tests 224ms, environment 0ms)

- eval: E10
  run_id: minted-task-metering-E10-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-04T11:03:09Z
  output: |
    Tests  413 passed (413)
    Start at  11:03:09
    Duration  2.49s (transform 6.43s, setup 0ms, import 9.69s, tests 2.44s, environment 843ms)

- eval: E11
  run_id: minted-task-metering-E11-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-04T11:03:20Z
  output: |
    Collecting build traces ...
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    $ tsc --noEmit

- eval: E12
  run_id: minted-task-metering-E12-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-04T11:03:35Z
  output: |
    Checked 426 files in 112ms. No fixes applied.

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — baseline không đo lại round này (mọi block ghi baseline: n-a) nên không có eval nào được xác nhận non-discriminating round này.

## Variance

none — every multi-run eval is uniform (không eval nào của round này có runs > 1).

## Iterations

Round 16: E1-E12 all green on first pass this round; no fixes returned to implementation.

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
thành cũ theo cơ chế staleness. Đã chạy lại: **12/12 eval xanh** ở
`5acc982e7690`, trong một đợt chạy chung 194 eval / 131 lệnh duy nhất của cả 13 hồ
sơ bị ảnh hưởng — không hồ sơ nào đỏ.

Chi phí này đã khai trước ở Cổng 1 của `gate-scope-anchors`.
