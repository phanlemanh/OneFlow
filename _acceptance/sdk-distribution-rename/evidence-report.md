---
schema_version: 2
feature_slug: sdk-distribution-rename
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a1bc936039ecf81b9591ffb88f179859bbb9adca
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
  run_id: sdk-distribution-rename-E1-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E2
  run_id: sdk-distribution-rename-E2-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E3
  run_id: sdk-distribution-rename-E3-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E4
  run_id: sdk-distribution-rename-E4-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E5
  run_id: sdk-distribution-rename-E5-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E6
  run_id: sdk-distribution-rename-E6-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E7
  run_id: sdk-distribution-rename-E7-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E8
  run_id: sdk-distribution-rename-E8-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E9
  run_id: sdk-distribution-rename-E9-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E10
  run_id: sdk-distribution-rename-E10-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E14
  run_id: sdk-distribution-rename-E14-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E11
  run_id: sdk-distribution-rename-E11-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-05T10:33:18Z
  output: |
    ........................................................................ [ 37%]
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 5.26s

- eval: E12
  run_id: sdk-distribution-rename-E12-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-05T10:33:18Z
  output: |
      ├ chunks/620846f1-92c416bf2f09796f.js  54.2 kB
      ├ chunks/8336-0e84acaf04d00d35.js      46.2 kB
      └ other shared chunks (total)          2.19 kB
    ƒ  (Dynamic)  server-rendered on demand
    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E13
  run_id: sdk-distribution-rename-E13-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-05T10:33:18Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .
    Checked 425 files in 101ms. No fixes applied.

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

## Vòng kiểm lại 2026-08-04 (sau hạng mục 0.6 `gate-scope-anchors`)

Hợp đồng `gate-scope-anchors` chạm `scripts/**`, nên bằng chứng của hồ sơ này
thành cũ theo cơ chế staleness. Đã chạy lại: **14/14 eval xanh** ở
`5acc982e7690`, trong một đợt chạy chung 194 eval / 131 lệnh duy nhất của cả 13 hồ
sơ bị ảnh hưởng — không hồ sơ nào đỏ.

Chi phí này đã khai trước ở Cổng 1 của `gate-scope-anchors`.

## Ghim lại 2026-08-05 (nhánh `chore/landed-merge-anchors`)

Nhánh điền `landed_merge` chạm `scripts/**` (sửa test + hoàn nguyên golden), nên
bằng chứng lại thành cũ. Đã chạy lại đợt chung 139 eval / 85 lệnh của 10 hồ sơ
bị ảnh hưởng ở `f39723a228be` — **0 hồ sơ đỏ**.

## Ghim lại 2026-08-05 (nhánh `feat/ci-vitest-sdk-pin`, CI-a)

Nhánh `feat/ci-vitest-sdk-pin` (hạng mục CI-a) chạm `.github/workflows/ci.yml`
(thêm job `Unit Tests (vitest)`) và `scripts/plugins/run-overlay-plugin-tests.sh`
(rút pin SDK từ `sdk/pyproject.toml` qua `scripts/lib/sdk-version.sh`), nên
`pre-merge-check.sh` báo hồ sơ này cũ. Đã chạy lại **14/14 eval — tất cả xanh**
ở `a1bc936039ec`, ghim `verified_commit` sang mốc mới.

Kiểm tra quyền sở hữu tự làm lại: contract **không có** `landed_merge`, nên không dựng được tập file sở hữu; theo nguyên tắc thận trọng, coi như phải verify lại toàn bộ chứ không carry-forward — và đã chạy lại thật.
