---
schema_version: 2
feature_slug: chong-mat-khoa-byo-giao-dien
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c015514833f64f2ada9ab013e121ebaeb12547b4
human_signoff:
---

# Evidence Report: chong-mat-khoa-byo-giao-dien

⚠ Lệnh suite `pnpm typecheck` exited 2 — không gắn eval nào, nhưng nằm trong commit checklist bắt buộc, nên verdict tổng là REJECT dù toàn bộ 13 eval đo được ở round này đều PASS. Chi tiết: `TS6053` báo bốn tệp không tồn tại dưới `.next/types/**` của worktree (`app/workspace/page.ts`, `cache-life.d.ts`, `routes.d.ts`, `validator.ts`) — output thô nằm trong khối suite bên dưới.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-9 | test | PASS |
| E13 | AC-10 | test | PASS |
| E2 | AC-10 | test | PASS |
| E3 | AC-10 | test | PASS |
| E4 | AC-11 | test | PASS |
| E5 | AC-11 | test | PASS |
| E6 | AC-12 | test | PASS |
| E7 | AC-12 | test | PASS |
| E11 | AC-12 | script | PASS |
| E14 | AC-12 | script | PASS |
| E8 | AC-13 | test | PASS |
| E12 | AC-13 | test | PASS |
| E9 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-chong-mat-khoa-byo-giao-dien-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_resolve_config
  verified_at: 2026-09-02T16:15:59Z
  output: |
    Tests  5 passed (5)
    Start at  16:15:59
    Duration  151ms (transform 42ms, setup 0ms, import 28ms, tests 35ms, environment 0ms)

- eval: E13
  run_id: minted-chong-mat-khoa-byo-giao-dien-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_env_client
  verified_at: 2026-09-02T16:16:02Z
  output: |
    Tests  14 passed (14)
    Start at  16:16:02
    Duration  188ms (transform 61ms, setup 0ms, import 73ms, tests 15ms, environment 0ms)

- eval: E2
  run_id: minted-chong-mat-khoa-byo-giao-dien-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_settings_ui
  verified_at: 2026-09-02T16:16:02Z
  output: |
    Tests  6 passed (6)
    Start at  16:16:02
    Duration  1.25s (transform 247ms, setup 0ms, import 514ms, tests 202ms, environment 448ms)

- eval: E3
  run_id: minted-chong-mat-khoa-byo-giao-dien-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_settings_wire
  verified_at: 2026-09-02T16:16:02Z
  output: |
    Tests  6 passed (6)
    Start at  16:16:02
    Duration  1.14s (transform 130ms, setup 0ms, import 384ms, tests 240ms, environment 411ms)

- eval: E4
  run_id: minted-chong-mat-khoa-byo-giao-dien-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_replace_ui
  verified_at: 2026-09-02T16:16:02Z
  output: |
    Tests  4 passed (4)
    Start at  16:16:02
    Duration  1.30s (transform 198ms, setup 0ms, import 428ms, tests 243ms, environment 465ms)

- eval: E5
  run_id: minted-chong-mat-khoa-byo-giao-dien-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_replace_wire
  verified_at: 2026-09-02T16:16:01Z
  output: |
    Tests  4 passed (4)
    Start at  16:16:01
    Duration  1.61s (transform 338ms, setup 0ms, import 671ms, tests 271ms, environment 527ms)

- eval: E6
  run_id: minted-chong-mat-khoa-byo-giao-dien-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_panels_ui
  verified_at: 2026-09-02T16:16:02Z
  output: |
    Tests  12 passed (12)
    Start at  16:16:02
    Duration  1.44s (transform 424ms, setup 0ms, import 782ms, tests 125ms, environment 411ms)

- eval: E7
  run_id: minted-chong-mat-khoa-byo-giao-dien-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_panels_wire
  verified_at: 2026-09-02T16:15:59Z
  output: |
    Tests  13 passed (13)
    Start at  16:15:59
    Duration  3.13s (transform 784ms, setup 0ms, import 1.76s, tests 176ms, environment 1.12s)

- eval: E11
  run_id: minted-chong-mat-khoa-byo-giao-dien-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_one_reader
  verified_at: 2026-09-02T16:16:03Z
  output: |
    OK: the key endpoint has exactly one non-test caller (src/lib/settings/env-client.ts)

- eval: E14
  run_id: minted-chong-mat-khoa-byo-giao-dien-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_one_reader_teeth
  verified_at: 2026-09-02T16:16:04Z
  output: |
    ok   case 'a prose mention does NOT trip the guard' exited 0
    ok   case 'an emptied reader is rejected' exited 2
    OK: guard bites on both perturbations and is green on the real tree

- eval: E8
  run_id: minted-chong-mat-khoa-byo-giao-dien-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_locale_parity
  verified_at: 2026-09-02T16:16:02Z
  output: |
    Tests  10 passed (10)
    Start at  16:16:02
    Duration  309ms (transform 132ms, setup 0ms, import 172ms, tests 3ms, environment 0ms)

- eval: E12
  run_id: minted-chong-mat-khoa-byo-giao-dien-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_i18n_render
  verified_at: 2026-09-02T16:16:02Z
  output: |
    Tests  4 passed (4)
    Start at  16:16:02
    Duration  1.17s (transform 212ms, setup 0ms, import 441ms, tests 145ms, environment 470ms)

- eval: E9
  run_id: minted-chong-mat-khoa-byo-giao-dien-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_a11y_proto
  verified_at: 2026-09-02T16:16:05Z
  output: |
    "verdict": "PASS"
    }
    6/6 pages scanned AND 6/6 rendered the state AND the theme they were asked for

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-bash_scripts_acceptance_preflight_verify-r2
  exit_code: 0
  verified_at: 2026-09-02T16:16:06Z

- cmd: pnpm build
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-build-r2
  exit_code: 0
  verified_at: 2026-09-02T16:16:10Z

- cmd: pnpm typecheck
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-typecheck-r2
  exit_code: 2
  verified_at: 2026-09-02T16:16:20Z

- cmd: pnpm lint:check
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-lint_check-r2
  exit_code: 0
  verified_at: 2026-09-02T16:16:25Z

- cmd: pnpm test
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-test-r2
  exit_code: 0
  verified_at: 2026-09-02T16:16:16Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r2
  exit_code: 0
  verified_at: 2026-09-02T16:16:30Z

- cmd: pnpm verify:plugins
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-verify_plugins-r2
  exit_code: 0
  verified_at: 2026-09-02T16:16:35Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-gen_abi-r2
  exit_code: 0
  verified_at: 2026-09-02T16:16:40Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay
Không có eval non-discriminating được đo ở round này — mọi `baseline:` đều `n-a` vì P2 không đo lại baseline; xem round baseline gần nhất để biết eval nào phân biệt được.

## Variance

none — không có eval multi-run nào round này (mọi eval đều `runs: 1`)

## Iterations

Round 1: 14/14 eval PASS (E1, E13, E2, E3, E4, E5, E6, E7, E11, E14, E8, E12, E9, E10) nhưng `pnpm typecheck` — lệnh suite bắt buộc không gắn eval — exit 2 (TS6053: hai file thiếu dưới `build/kkt-gate/types/**` bị tsconfig include pattern quét trúng). Verdict REJECT. Trả về implementation để dọn build tạm / loại trừ khỏi tsconfig include trước khi verify lại.
Round 2: 13/13 eval đo được ở round này PASS (E10 không có trong dữ liệu round này) nhưng `pnpm typecheck` vẫn exit 2 — lần này TS6053 báo bốn file thiếu dưới `.next/types/**` của worktree (`app/workspace/page.ts`, `cache-life.d.ts`, `routes.d.ts`, `validator.ts`), một nguyên nhân khác round 1 (build output/`.next` chưa sinh đủ hoặc bị dọn giữa chừng, không phải cùng lỗi include pattern của round 1). Verdict REJECT. Trả về implementation: đảm bảo `.next` được build/generate types đầy đủ trước khi `tsc --noEmit` chạy trong cùng worktree, rồi verify lại.