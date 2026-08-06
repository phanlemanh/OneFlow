---
schema_version: 2
feature_slug: per-plugin-origin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c38b939d98426310a91c039882bdd2e9391d76ac
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
  run_id: per-plugin-origin-E1-20260806T021152
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-06T02:11:52Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  08:40:20
       Duration  91ms (transform 18ms, setup 0ms, import 26ms, tests 6ms, environment 0ms)

- eval: E2
  run_id: per-plugin-origin-E2-20260806T021152
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-06T02:11:52Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  08:40:20
       Duration  91ms (transform 18ms, setup 0ms, import 26ms, tests 6ms, environment 0ms)

- eval: E3
  run_id: per-plugin-origin-E3-20260806T021152
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-06T02:11:52Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  08:40:20
       Duration  91ms (transform 18ms, setup 0ms, import 26ms, tests 6ms, environment 0ms)

- eval: E4
  run_id: per-plugin-origin-E4-20260806T021152
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-06T02:11:52Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  59 passed (59)
       Start at  08:40:20
       Duration  91ms (transform 18ms, setup 0ms, import 26ms, tests 6ms, environment 0ms)

- eval: E5
  run_id: per-plugin-origin-E5-20260806T021105
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_single_impl
  verified_at: 2026-08-06T02:11:05Z
  output: |
    OK: one URL rule across src/ and scripts/, in src/lib/plugins/official-manifest.ts; the CLI installer imports it (the SDK engine's Python copy is out of this scan's scope — see the contract's known limits)

- eval: E6
  run_id: per-plugin-origin-E6-20260806T021105
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_installer_parity
  verified_at: 2026-08-06T02:11:05Z
  output: |
    OK: the CLI installer, the in-app install path and the update checker agree; both pull paths use the resolved origin and refuse a non-fast-forward

- eval: E7
  run_id: per-plugin-origin-E7-20260806T021107
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_manifest_unmoved
  verified_at: 2026-08-06T02:11:07Z
  output: |
    OK: 38 plain strings under default org + 1 origin entry (compose-overlay)

- eval: E8
  run_id: per-plugin-origin-E8-20260806T021151
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-08-06T02:11:51Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  76 passed (76)
       Start at  08:40:19
       Duration  87ms (transform 17ms, setup 0ms, import 24ms, tests 3ms, environment 0ms)

- eval: E9
  run_id: per-plugin-origin-E9-20260806T021158
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-06T02:11:58Z
  output: |
    > vitest run
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  31 passed (31)
          Tests  413 passed (413)
       Start at  08:41:10
       Duration  1.34s (transform 1.66s, setup 0ms, import 3.40s, tests 1.25s, environment 542ms)

- eval: E10
  run_id: per-plugin-origin-E10-20260806T021200
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

- eval: E11
  run_id: per-plugin-origin-E11-20260806T021200
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-06T02:12:00Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .
    Checked 425 files in 78ms. No fixes applied.

- eval: E12
  run_id: per-plugin-origin-E12-20260806T021110
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-06T02:11:10Z
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
- **Lượt 1 @ `a1bc936`** — **12/12 eval xanh** cho hồ sơ này. Lượt đó lộ hai lỗi thật, cả hai do chính nhánh
  tạo ra: (a) `scripts/lib/sdk-version.sh` giải gốc repo bằng
  `git rev-parse --show-toplevel` **lúc gọi**, nên chết khi caller đã `cd` vào bản
  clone repo plugin — 13 eval render của `compose-overlay` đỏ; (b)
  `check-action-pins.sh` còn chốt `EXPECTED_CHECKOUT_SITES=7` trong khi job vitest
  mới nâng số điểm `actions/checkout` lên 8 — E1 của `ci-actions-bump` đỏ.
- **Lượt 2 @ `28c1a7d`** — commit sửa cả hai lỗi trên (neo gốc repo của
  `sdk-version.sh` vào vị trí file thư viện; đánh số lại thành 8 kèm chú thích).
  **12/12 eval xanh**.
- **Lượt 3 @ `9fcfc33`** — **12/12 eval xanh**, tất cả thoát 0. `origin_manifest_unmoved` vẫn báo `38 plain strings under default org + 1 origin entry (compose-overlay)`.
- **Lượt 4 @ `c38b939` (lượt này)** — **12/12 eval xanh**, tất cả thoát 0,
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
