---
schema_version: 2
feature_slug: sdk-distribution-rename
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 28c1a7d6202ce2a8cd40eeae7eb55a8145264891
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
  run_id: sdk-distribution-rename-E1-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E2
  run_id: sdk-distribution-rename-E2-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E3
  run_id: sdk-distribution-rename-E3-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E4
  run_id: sdk-distribution-rename-E4-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E5
  run_id: sdk-distribution-rename-E5-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E6
  run_id: sdk-distribution-rename-E6-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E7
  run_id: sdk-distribution-rename-E7-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E8
  run_id: sdk-distribution-rename-E8-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E9
  run_id: sdk-distribution-rename-E9-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E10
  run_id: sdk-distribution-rename-E10-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E14
  run_id: sdk-distribution-rename-E14-20260805124023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-05T12:40:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.02s

- eval: E11
  run_id: sdk-distribution-rename-E11-20260805124029
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-05T12:40:29Z
  output: |
    ........................................................................ [ 37%]
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 5.26s

- eval: E12
  run_id: sdk-distribution-rename-E12-20260805124038
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-05T12:40:38Z
  output: |
      ├ chunks/620846f1-92c416bf2f09796f.js  54.2 kB
      ├ chunks/8336-0e84acaf04d00d35.js      46.2 kB
      └ other shared chunks (total)          2.19 kB
    ƒ  (Dynamic)  server-rendered on demand
    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E13
  run_id: sdk-distribution-rename-E13-20260805124035
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-05T12:40:35Z
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

Nhánh CI-a làm ba việc cho hạ tầng verify, không thêm tính năng sản phẩm nào:
thêm job `Unit Tests (vitest)` vào `.github/workflows/ci.yml`; gỡ pin SDK ghi
cứng trong `scripts/plugins/run-overlay-plugin-tests.sh` (nay rút từ
`sdk/pyproject.toml` qua `scripts/lib/sdk-version.sh`); và thêm các guard đi kèm.
Vì nó chạm `.github/workflows/**` và `scripts/**`, `pre-merge-check.sh` báo hồ sơ
này cũ.

**Quyền sở hữu, tự tính lại chứ không thừa kế.** Contract này **không có**
`landed_merge:` trong frontmatter — toàn repo chỉ có năm hồ sơ mang trường đó
(`ci-actions-bump`, `compose-overlay`, `dependency-refresh-2026-07`,
`oneflow-plugin-prefix`, `gate-scope-anchors`), và đây không phải một trong số
đó. Không dựng được tập file sở hữu thì cũng không chứng minh được carry-forward
là hợp lệ, nên theo nguyên tắc thận trọng hồ sơ này đi đường re-verify: chạy lại
toàn bộ eval, không ghi công thừa kế cho eval nào.

**Hai lượt chạy trong cùng một đợt.** Lượt thứ nhất chạy ở `a1bc936` và cho
**14/14 eval xanh** cho hồ sơ này. Lượt đó phát hiện hai lỗi thật ở chỗ khác
trong đợt — `scripts/lib/sdk-version.sh` giải gốc repo bằng
`git rev-parse --show-toplevel` lúc gọi nên chết khi caller đã `cd` vào bản clone
plugin, và `check-action-pins.sh` còn chốt `EXPECTED_CHECKOUT_SITES=7` trong khi
job vitest mới nâng số điểm checkout lên 8 (eval E1 của `ci-actions-bump` đỏ vì
việc này). Commit `28c1a7d` sửa cả hai.

**Lượt chạy này, ở `28c1a7d`: 14/14 eval xanh**, tất cả thoát 0. Mỗi `cmd` được
giải lại từng dòng theo `_acceptance/config.yaml` trước khi chạy; các lệnh dùng
chung được chạy **một lần** và ghi công cho mọi eval ràng buộc nó, mỗi eval một
`run_id` riêng, còn `verified_at` của các eval chung lệnh cố tình trùng nhau vì
chúng ghi lại cùng một lần chạy. `verified_commit` chuyển sang `28c1a7d6202c`.
Dòng chữ ký người trong frontmatter không bị đụng tới.
