---
schema_version: 2
feature_slug: sdk-distribution-rename
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c38b939d98426310a91c039882bdd2e9391d76ac
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
  run_id: sdk-distribution-rename-E1-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E2
  run_id: sdk-distribution-rename-E2-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E3
  run_id: sdk-distribution-rename-E3-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E4
  run_id: sdk-distribution-rename-E4-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E5
  run_id: sdk-distribution-rename-E5-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E6
  run_id: sdk-distribution-rename-E6-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E7
  run_id: sdk-distribution-rename-E7-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E8
  run_id: sdk-distribution-rename-E8-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E9
  run_id: sdk-distribution-rename-E9-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E10
  run_id: sdk-distribution-rename-E10-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E14
  run_id: sdk-distribution-rename-E14-20260806T021141
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-06T02:11:41Z
  output: |
    ...........                                                              [100%]
    11 passed in 3.08s

- eval: E11
  run_id: sdk-distribution-rename-E11-20260806T021134
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-06T02:11:34Z
  output: |
    ........................................................................ [ 37%]
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 7.39s

- eval: E12
  run_id: sdk-distribution-rename-E12-20260806T021200
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-06T02:12:00Z
  output: |
      ├ chunks/620846f1-92c416bf2f09796f.js  54.2 kB
      ├ chunks/8336-0e84acaf04d00d35.js      46.2 kB
      └ other shared chunks (total)          2.19 kB
    ƒ  (Dynamic)  server-rendered on demand
    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E13
  run_id: sdk-distribution-rename-E13-20260806T021200
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-06T02:12:00Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .
    Checked 425 files in 78ms. No fixes applied.

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

## Kiểm lại trên nhánh `feat/ci-vitest-sdk-pin` (CI-a) — bốn lượt, ghim ở `c38b939`

Mục này thay cho các mục rời của những lượt trước trên cùng nhánh: một mục cho cả
đợt, thay vì bốn mục gần trùng nhau.

**Nhánh làm gì.** CI-a chỉ động vào hạ tầng verify, không thêm tính năng sản phẩm:
thêm job `Unit Tests (vitest)` vào `.github/workflows/ci.yml`; gỡ pin SDK ghi cứng
trong `scripts/plugins/run-overlay-plugin-tests.sh` (nay rút từ `sdk/pyproject.toml`
qua `scripts/lib/sdk-version.sh`); thêm các guard đi kèm dưới `scripts/ci/`,
`scripts/plugins/` và `scripts/acceptance/`; đồng bộ một mô tả trong `CLAUDE.md`.
Vì nó chạm `.github/workflows/**` và `scripts/**`, `pre-merge-check.sh` báo hồ sơ
này cũ.

**Vì sao phải tới bốn lượt.** `risk_tiers.t1_skip_globs` chỉ miễn bốn đường dẫn
gate-tooling theo TÊN CHÍNH XÁC (`scripts/pre-merge-check.sh`,
`scripts/recheck-evidence.js`, `lib/evidence-core.js`, `lib/gap-probe.js`), nên mỗi
guard script mới dưới `scripts/` lại làm cũ đúng những hồ sơ vừa ghim ở lượt trước.
`c38b939` là commit mã cuối cùng của nhánh — sau nó chỉ còn thay đổi dưới
`_acceptance/**`, nên lần ghim này giữ được. (`9fcfc33`, mốc của lượt 3, bị chính
`c38b939` làm cũ vì commit đó sửa `scripts/acceptance/check-stale-golden.sh`.)

**Quyền sở hữu, tự tính lại chứ không thừa kế.** Contract này **không có**
`landed_merge:` trong frontmatter, nên không dựng được tập file sở hữu; không dựng
được tập đó thì cũng không chứng minh được carry-forward là hợp lệ. Theo nguyên tắc
thận trọng, hồ sơ đi đường re-verify ở cả ba lượt: chạy lại toàn bộ eval, không ghi
công thừa kế cho eval nào.
- **Lượt 1 @ `a1bc936`** — **14/14 eval xanh** cho hồ sơ này. Lượt đó lộ hai lỗi thật, cả hai do chính nhánh
  tạo ra: (a) `scripts/lib/sdk-version.sh` giải gốc repo bằng
  `git rev-parse --show-toplevel` **lúc gọi**, nên chết khi caller đã `cd` vào bản
  clone repo plugin — 13 eval render của `compose-overlay` đỏ; (b)
  `check-action-pins.sh` còn chốt `EXPECTED_CHECKOUT_SITES=7` trong khi job vitest
  mới nâng số điểm `actions/checkout` lên 8 — E1 của `ci-actions-bump` đỏ.
- **Lượt 2 @ `28c1a7d`** — commit sửa cả hai lỗi trên (neo gốc repo của
  `sdk-version.sh` vào vị trí file thư viện; đánh số lại thành 8 kèm chú thích).
  **14/14 eval xanh**.
- **Lượt 3 @ `9fcfc33`** — **14/14 eval xanh**, tất cả thoát 0.
- **Lượt 4 @ `c38b939` (lượt này)** — **14/14 eval xanh**, tất cả thoát 0,
  không lệch so với lượt 3.

**Cách chạy.** Mỗi `cmd` được giải lại từng dòng theo `_acceptance/config.yaml`
trước khi chạy; lệnh dùng chung chạy **một lần** và ghi công cho mọi eval ràng buộc
nó, mỗi eval một `run_id` riêng, còn `verified_at` của các eval chung lệnh cố ý
trùng nhau vì chúng ghi lại cùng một lần chạy.

`verified_commit` chuyển sang `c38b939d9842`. Dòng chữ ký người trong frontmatter
không bị đụng tới.

**Phát hiện của lượt này, ảnh hưởng cả đợt.** `check-stale-golden.sh` — eval E3 của
`stale-scope-by-paths` — đóng băng output của gate cho **bảy hồ sơ không khai `paths`**
ở đúng trạng thái ĐANG CŨ (`VIOLATION ... evidence is stale`). Chính việc ghim lại của
đợt này làm bảy dòng ấy lật sang `OK ... PASS, signed off by`, nên E3 chuyển đỏ ngay
sau khi ghim. Đây là đo trực tiếp, không suy luận: chạy trước khi ghim thoát 0, chạy lại
sau khi ghim thoát 1, cả hai đều có dòng trong `run-log.jsonl` của hồ sơ đó.
Bảy hồ sơ đó **gồm hồ sơ này**. Vì lý do này `stale-scope-by-paths` **không** được ghim ở lượt này và giữ
verdict REJECT; chi tiết trong hồ sơ riêng của nó. Cơ chế staleness-scoping mà AC-3 nói
tới không đổi — thứ lật là trạng thái ghim, không phải hành vi scoping.
