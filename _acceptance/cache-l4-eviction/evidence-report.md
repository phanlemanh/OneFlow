---
schema_version: 2
feature_slug: cache-l4-eviction
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e
human_signoff: Manh 2026-08-04
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
  run_id: minted-cache-l4-eviction-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_lru_recency
  verified_at: 2026-08-04T10:40:55Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E2
  run_id: minted-cache-l4-eviction-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_cap_converges
  verified_at: 2026-08-04T10:40:55Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E3
  run_id: minted-cache-l4-eviction-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_under_cap_noop
  verified_at: 2026-08-04T10:40:55Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E4
  run_id: minted-cache-l4-eviction-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_shared_blob_survives
  verified_at: 2026-08-04T10:40:55Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E5
  run_id: minted-cache-l4-eviction-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_orphan_blob_gc
  verified_at: 2026-08-04T10:40:55Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E6
  run_id: minted-cache-l4-eviction-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_legacy_entry
  verified_at: 2026-08-04T10:40:55Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7
  run_id: minted-cache-l4-eviction-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_sweep_failsafe
  verified_at: 2026-08-04T10:40:55Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E8
  run_id: minted-cache-l4-eviction-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_cache_errors_logged
  verified_at: 2026-08-04T10:40:55Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E9
  run_id: minted-cache-l4-eviction-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_purge_scope
  verified_at: 2026-08-04T10:40:55Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E10
  run_id: minted-cache-l4-eviction-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_purge_idempotent
  verified_at: 2026-08-04T10:40:55Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E11
  run_id: minted-cache-l4-eviction-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_reuse_off
  verified_at: 2026-08-04T10:41:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E12
  run_id: minted-cache-l4-eviction-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_reuse_invalid
  verified_at: 2026-08-04T10:41:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E13
  run_id: minted-cache-l4-eviction-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_counters
  verified_at: 2026-08-04T10:41:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E14
  run_id: minted-cache-l4-eviction-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_node_cached_event
  verified_at: 2026-08-04T10:41:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E15
  run_id: minted-cache-l4-eviction-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_l4_delegate_persists
  verified_at: 2026-08-04T10:41:09Z
  output: |
         Tests  6 passed | 3 skipped (9)
      Start at  10:41:09
      Duration  536ms (transform 78ms, setup 0ms, import 63ms, tests 342ms, environment 0ms)

- eval: E16
  run_id: minted-cache-l4-eviction-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_l4_schema_columns
  verified_at: 2026-08-04T10:41:11Z
  output: |
          Tests  3 passed | 4 skipped (7)
       Start at  10:41:11
       Duration  348ms (transform 18ms, setup 0ms, import 225ms, tests 17ms, environment 0ms)

- eval: E17
  run_id: minted-cache-l4-eviction-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cache_test_layout
  verified_at: 2026-08-04T10:41:05Z
  output: |
    OK: cache test layout

- eval: E18
  run_id: minted-cache-l4-eviction-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-04T10:41:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E19
  run_id: minted-cache-l4-eviction-E19-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_sweep_wired
  verified_at: 2026-08-04T10:41:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E20
  run_id: minted-cache-l4-eviction-E20-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_l4_node_cached_consumer
  verified_at: 2026-08-04T10:41:11Z
  output: |
          Tests  4 passed | 7 skipped (11)
       Start at  10:41:11
       Duration  135ms (transform 24ms, setup 0ms, import 31ms, tests 3ms, environment 0ms)

## Analyst

carried tu round truoc — baseline khong do lai round nay
none — baseline not re-measured this round (see Round 1 Analyst: E15, E16, E20 were confirmed intended regression-guards, non-discriminating by design; that classification stands unchanged here)

## Variance

none — every multi-run eval is uniform (no eval in this round carries runs > 1)

## Iterations

Round 1: all 20 evals passed on first attempt (E1-E20, exit 0, no failures returned to implementation). Full-repo verification also green in the same round: `pnpm build`, `pnpm typecheck`, `pnpm lint:check` (Biome, 416 files, no fixes), `pnpm test` (363 passed), the full SDK pytest suite (189 passed), `pnpm verify:plugins`, and `pnpm gen:abi` (no diff against committed generated files).
Round 2: re-verify on the current tree (commit 410db0048feeea18d2e04c29c7cb963074fc8dae) — all 20 evals passed again on first attempt, no regressions, no evals returned to implementation. Full-repo checks also green: `pnpm build && pnpm typecheck`, `pnpm lint:check` (426 files, no fixes), `pnpm test` (413 passed), full SDK pytest suite (193 passed), `pnpm verify:plugins`, and `pnpm gen:abi` (no diff against committed generated files).

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
thành cũ theo cơ chế staleness. Đã chạy lại: **20/20 eval xanh** ở
`5acc982e7690`, trong một đợt chạy chung 194 eval / 131 lệnh duy nhất của cả 13 hồ
sơ bị ảnh hưởng — không hồ sơ nào đỏ.

Chi phí này đã khai trước ở Cổng 1 của `gate-scope-anchors`.

### Re-pin lần 1 — 2026-08-28, do nhánh `fix/scoping-fixtures-diff-shape` thu hẹp fork `STALE-DIFF-SCOPE-GUARD` và thêm guard dưới `scripts/acceptance/**`: feature khai `paths` nay bị soi, và thay đổi gated của nhánh rơi vào vùng eval của hồ sơ này chạy qua. Mã sản phẩm không đổi — mọi suite chạy lại đều exit 0
run_id: repin-cache-l4-eviction-20260828T053000Z
sha: 8512c6e98c48ab3f4cab75dafa9493a0b1e36868 · suites: 20 lệnh exit 0

### Re-pin — 05/09/2026, hợp nhất PR #97 vào `main`

run_id: repin-merge-20260905T101500Z
sha: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e · suites: 8 lệnh exit 0

Commit merge `96ee9b8` kéo mọi hồ sơ đã ký ra khỏi mốc của chúng theo đường dẫn. Một lượt làn
máy chung cho cả đợt, không ô đo nào bị chạm — chỉ dời mốc.

Đợt này KHÔNG re-pin SÁU hồ sơ — `add-media-library`, `byo-key-onboarding`, `chong-doc-sai-em-ru`,
`cong-tu-canh-minh`, `gate-scope-anchors`, `normalize-text-vi` — vì ô đo bị chạm của chúng ĐỎ, hoặc
KHÔNG KẾT LUẬN ĐƯỢC (cửa sổ diff rỗng khi nhánh đứng ngay tại `main`; hoặc ô `ui-check` không chạy
được ngoài luồng verify). Dời mốc khi ấy là khai rằng bằng chứng còn đúng trong khi chưa chứng
minh được.
