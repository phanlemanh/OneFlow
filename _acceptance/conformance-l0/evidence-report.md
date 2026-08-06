---
schema_version: 2
feature_slug: conformance-l0
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c38b939d98426310a91c039882bdd2e9391d76ac
human_signoff: Manh 2026-08-03
---

# Evidence Report: conformance-l0

Round 6.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-3 | test | PASS |
| E15 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: conformance-l0-E1-20260806T021145
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-06T02:11:45Z
  output: |
    ................                                                         [100%]
    16 passed in 0.03s

- eval: E2
  run_id: conformance-l0-E2-20260806T021145
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-06T02:11:45Z
  output: |
    ................                                                         [100%]
    16 passed in 0.03s

- eval: E3
  run_id: conformance-l0-E3-20260806T021134
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-06T02:11:34Z
  output: |
    ........................................................................ [ 37%]
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 7.39s

- eval: E4
  run_id: conformance-l0-E4-20260806T021145
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-06T02:11:45Z
  output: |
    ................                                                         [100%]
    16 passed in 0.03s

- eval: E5
  run_id: conformance-l0-E5-20260806T021145
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-06T02:11:45Z
  output: |
    ................                                                         [100%]
    16 passed in 0.03s

- eval: E6
  run_id: conformance-l0-E6-20260806T021145
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-08-06T02:11:45Z
  output: |
    .......                                                                  [100%]
    7 passed in 0.11s

- eval: E7
  run_id: conformance-l0-E7-20260806T021153
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-06T02:11:53Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  12 passed (12)
       Start at  08:40:20
       Duration  132ms (transform 56ms, setup 0ms, import 71ms, tests 3ms, environment 0ms)

- eval: E8
  run_id: conformance-l0-E8-20260806T021107
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.conformance_discriminating
  verified_at: 2026-08-06T02:11:07Z
  output: |
        went RED as required
    ==> perturbation (c): corrupt a fixture and run the TypeScript half
        went RED as required
    ==> revert: both halves must be GREEN again
        green
    OK: the conformance suite discriminates on all three perturbation kinds

- eval: E9
  run_id: conformance-l0-E9-20260806T021145
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-08-06T02:11:45Z
  output: |
    .......                                                                  [100%]
    7 passed in 0.74s

- eval: E10
  run_id: conformance-l0-E10-20260806T021145
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-08-06T02:11:45Z
  output: |
    .......                                                                  [100%]
    7 passed in 0.74s

- eval: E11
  run_id: conformance-l0-E11-20260806T021154
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_rev
  verified_at: 2026-08-06T02:11:54Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  3 passed (3)
       Start at  08:40:21
       Duration  101ms (transform 13ms, setup 0ms, import 39ms, tests 3ms, environment 0ms)

- eval: E12
  run_id: conformance-l0-E12-20260806T021154
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_node_cached
  verified_at: 2026-08-06T02:11:54Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  1 passed (1)
          Tests  11 passed (11)
       Start at  08:40:21
       Duration  98ms (transform 20ms, setup 0ms, import 26ms, tests 14ms, environment 0ms)

- eval: E13
  run_id: conformance-l0-E13-20260806T021145
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-08-06T02:11:45Z
  output: |
    ................                                                         [100%]
    16 passed in 0.03s

- eval: E14
  run_id: conformance-l0-E14-20260806T021145
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-08-06T02:11:45Z
  output: |
    .......                                                                  [100%]
    7 passed in 0.11s

- eval: E15
  run_id: conformance-l0-E15-20260806T021110
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.plugin_rev_joined_path
  verified_at: 2026-08-06T02:11:10Z
  output: |
    OK: TypeScript install -> Python scan preserved pluginRev f3468cd05b21708e2aae0079eab32a9623d60e14

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — no evals flagged as non-discriminating this round (baseline not re-measured; P2, evals.yaml unchanged since last baseline round)

## Variance

none — no stochastic (runs > 1) evals this round; every eval ran once and is deterministic

## Iterations

Round 5: all 15 evals PASS (E1-E15) on first pass; full regression suite (pnpm build, typecheck, lint:check, pnpm test, verify:plugins, gen:abi diff) green; baseline not re-measured this round (P2 — evals.yaml unchanged since last baseline round).
Round 6: all 15 evals PASS (E1-E15) on first pass; full regression suite (pnpm build, typecheck, lint:check, pnpm test, verify:plugins, gen:abi diff) green; baseline not re-measured this round (P2 — evals.yaml unchanged since last baseline round).

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
thành cũ theo cơ chế staleness. Đã chạy lại: **15/15 eval xanh** ở
`5acc982e7690`, trong một đợt chạy chung 194 eval / 131 lệnh duy nhất của cả 13 hồ
sơ bị ảnh hưởng — không hồ sơ nào đỏ.

Chi phí này đã khai trước ở Cổng 1 của `gate-scope-anchors`.

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
- **Lượt 1 @ `a1bc936`** — **15/15 eval xanh** cho hồ sơ này. Lượt đó lộ hai lỗi thật, cả hai do chính nhánh
  tạo ra: (a) `scripts/lib/sdk-version.sh` giải gốc repo bằng
  `git rev-parse --show-toplevel` **lúc gọi**, nên chết khi caller đã `cd` vào bản
  clone repo plugin — 13 eval render của `compose-overlay` đỏ; (b)
  `check-action-pins.sh` còn chốt `EXPECTED_CHECKOUT_SITES=7` trong khi job vitest
  mới nâng số điểm `actions/checkout` lên 8 — E1 của `ci-actions-bump` đỏ.
- **Lượt 2 @ `28c1a7d`** — commit sửa cả hai lỗi trên (neo gốc repo của
  `sdk-version.sh` vào vị trí file thư viện; đánh số lại thành 8 kèm chú thích).
  **15/15 eval xanh**.
- **Lượt 3 @ `9fcfc33`** — **15/15 eval xanh**, tất cả thoát 0.
- **Lượt 4 @ `c38b939` (lượt này)** — **15/15 eval xanh**, tất cả thoát 0,
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
Hồ sơ này **không** nằm trong bảy hồ sơ đó, nên kết quả eval của nó không đổi. Vì lý do này `stale-scope-by-paths` **không** được ghim ở lượt này và giữ
verdict REJECT; chi tiết trong hồ sơ riêng của nó. Cơ chế staleness-scoping mà AC-3 nói
tới không đổi — thứ lật là trạng thái ghim, không phải hành vi scoping.
