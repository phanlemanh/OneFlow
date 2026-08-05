---
schema_version: 2
feature_slug: per-plugin-origin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a1bc936039ecf81b9591ffb88f179859bbb9adca
human_signoff: Manh 2026-08-03
---

# Evidence Report: per-plugin-origin

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-5 | test | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-3 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-1 | test | PASS |
| E10 | AC-3 | test | PASS |
| E11 | AC-3 | test | PASS |
| E12 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: per-plugin-origin-E1-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-05T10:33:18Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  17:32:33
       Duration  92ms (transform 19ms, setup 0ms, import 27ms, tests 6ms, environment 0ms)

- eval: E2
  run_id: per-plugin-origin-E2-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-05T10:33:18Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  17:32:33
       Duration  92ms (transform 19ms, setup 0ms, import 27ms, tests 6ms, environment 0ms)

- eval: E3
  run_id: per-plugin-origin-E3-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-05T10:33:18Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  17:32:33
       Duration  92ms (transform 19ms, setup 0ms, import 27ms, tests 6ms, environment 0ms)

- eval: E4
  run_id: per-plugin-origin-E4-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-05T10:33:18Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  17:32:33
       Duration  92ms (transform 19ms, setup 0ms, import 27ms, tests 6ms, environment 0ms)

- eval: E5
  run_id: per-plugin-origin-E5-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_single_impl
  verified_at: 2026-08-05T10:33:18Z
  output: |
    OK: one URL rule across src/ and scripts/, in src/lib/plugins/official-manifest.ts; the CLI installer imports it (the SDK engine's Python copy is out of this scan's scope — see the contract's known limits)

- eval: E6
  run_id: per-plugin-origin-E6-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_installer_parity
  verified_at: 2026-08-05T10:33:18Z
  output: |
    OK: the CLI installer, the in-app install path and the update checker agree; both pull paths use the resolved origin and refuse a non-fast-forward

- eval: E7
  run_id: per-plugin-origin-E7-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_manifest_unmoved
  verified_at: 2026-08-05T10:33:18Z
  output: |
    OK: 38 plain strings under default org + 1 origin entry (compose-overlay)

- eval: E8
  run_id: per-plugin-origin-E8-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-08-05T10:33:18Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  76 passed (76)
       Start at  17:32:33
       Duration  87ms (transform 17ms, setup 0ms, import 25ms, tests 3ms, environment 0ms)

- eval: E9
  run_id: per-plugin-origin-E9-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-05T10:33:18Z
  output: |
    > vitest run
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  31 passed (31)
          Tests  413 passed (413)
       Start at  17:32:35
       Duration  1.32s (transform 1.81s, setup 0ms, import 3.19s, tests 1.31s, environment 512ms)

- eval: E10
  run_id: per-plugin-origin-E10-20260805103318
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

- eval: E11
  run_id: per-plugin-origin-E11-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-05T10:33:18Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .
    Checked 425 files in 101ms. No fixes applied.

- eval: E12
  run_id: per-plugin-origin-E12-20260805103318
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-05T10:33:18Z
  output: |
    > oneflow@0.2.1 verify:plugins /Users/manhphan/dev/oneflow
    > tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

## Analyst

carried tu round truoc — baseline khong do lai round nay
none — baseline not re-measured this round (see prior round's evidence report for the baseline classification)

## Variance

none — no stochastic evals this round (no eval carries runs > 1)

## Iterations

Round 10: all 12 machine evals (E1-E12) passed on first run, zero failures, zero judgment items pending; baseline not re-measured this round (carried from prior round per P2).

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

## Ghim lại 2026-08-05 (nhánh `chore/landed-merge-anchors`)

Nhánh điền `landed_merge` chạm `scripts/**` (sửa test + hoàn nguyên golden), nên
bằng chứng lại thành cũ. Đã chạy lại đợt chung 139 eval / 85 lệnh của 10 hồ sơ
bị ảnh hưởng ở `f39723a228be` — **0 hồ sơ đỏ**.

## Ghim lại 2026-08-05 (nhánh `feat/ci-vitest-sdk-pin`, CI-a)

Nhánh `feat/ci-vitest-sdk-pin` (hạng mục CI-a) chạm `.github/workflows/ci.yml`
(thêm job `Unit Tests (vitest)`) và `scripts/plugins/run-overlay-plugin-tests.sh`
(rút pin SDK từ `sdk/pyproject.toml` qua `scripts/lib/sdk-version.sh`), nên
`pre-merge-check.sh` báo hồ sơ này cũ. Đã chạy lại **12/12 eval — tất cả xanh**
ở `a1bc936039ec`, ghim `verified_commit` sang mốc mới.

Kiểm tra quyền sở hữu tự làm lại: contract **không có** `landed_merge`, nên không dựng được tập file sở hữu; theo nguyên tắc thận trọng, coi như phải verify lại toàn bộ chứ không carry-forward — và đã chạy lại thật.
