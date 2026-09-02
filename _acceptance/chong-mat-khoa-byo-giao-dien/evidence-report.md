---
schema_version: 2
feature_slug: chong-mat-khoa-byo-giao-dien
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4d8dd32cf734bcc668e1d465850d97f88be737bb
human_signoff:
---

# Evidence Report: chong-mat-khoa-byo-giao-dien

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
  run_id: minted-chong-mat-khoa-byo-giao-dien-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_resolve_config
  verified_at: 2026-09-02T16:43:28Z
  output: |
    Tests  5 passed (5)
    Start at  16:43:28
    Duration  262ms (transform 130ms, setup 0ms, import 41ms, tests 129ms, environment 0ms)

- eval: E13
  run_id: minted-chong-mat-khoa-byo-giao-dien-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_env_client
  verified_at: 2026-09-02T16:43:29Z
  output: |
    Tests  14 passed (14)
    Start at  16:43:29
    Duration  169ms (transform 61ms, setup 0ms, import 71ms, tests 15ms, environment 0ms)

- eval: E2
  run_id: minted-chong-mat-khoa-byo-giao-dien-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_settings_ui
  verified_at: 2026-09-02T16:43:32Z
  output: |
    Tests  6 passed (6)
    Start at  16:43:32
    Duration  1.25s (transform 146ms, setup 0ms, import 507ms, tests 199ms, environment 452ms)

- eval: E3
  run_id: minted-chong-mat-khoa-byo-giao-dien-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_settings_wire
  verified_at: 2026-09-02T16:43:30Z
  output: |
    Tests  6 passed (6)
    Start at  16:43:30
    Duration  1.63s (transform 138ms, setup 0ms, import 433ms, tests 274ms, environment 818ms)

- eval: E4
  run_id: minted-chong-mat-khoa-byo-giao-dien-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_replace_ui
  verified_at: 2026-09-02T16:43:30Z
  output: |
    Test Files  1 passed (1)
    Tests  4 passed (4)
    Start at  16:43:30
    Duration  1.57s (transform 130ms, setup 0ms, import 417ms, tests 280ms, environment 711ms)

- eval: E5
  run_id: minted-chong-mat-khoa-byo-giao-dien-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_replace_wire
  verified_at: 2026-09-02T16:43:31Z
  output: |
    Tests  4 passed (4)
    Start at  16:43:31
    Duration  1.61s (transform 222ms, setup 0ms, import 535ms, tests 382ms, environment 569ms)

- eval: E6
  run_id: minted-chong-mat-khoa-byo-giao-dien-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_panels_ui
  verified_at: 2026-09-02T16:43:32Z
  output: |
    Tests  12 passed (12)
    Start at  16:43:32
    Duration  1.36s (transform 306ms, setup 0ms, import 706ms, tests 120ms, environment 441ms)

- eval: E7
  run_id: minted-chong-mat-khoa-byo-giao-dien-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_panels_wire
  verified_at: 2026-09-02T16:43:31Z
  output: |
    Tests  13 passed (13)
    Start at  16:43:31
    Duration  2.03s (transform 800ms, setup 0ms, import 1.36s, tests 114ms, environment 476ms)

- eval: E11
  run_id: minted-chong-mat-khoa-byo-giao-dien-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_one_reader
  verified_at: 2026-09-02T16:43:33Z
  output: |
    OK: the key endpoint has exactly one non-test caller (src/lib/settings/env-client.ts)

- eval: E14
  run_id: minted-chong-mat-khoa-byo-giao-dien-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_one_reader_teeth
  verified_at: 2026-09-02T16:43:34Z
  output: |
    ok   case 'a prose mention does NOT trip the guard' exited 0
    ok   case 'an emptied reader is rejected' exited 2
    OK: guard bites on both perturbations and is green on the real tree

- eval: E8
  run_id: minted-chong-mat-khoa-byo-giao-dien-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_locale_parity
  verified_at: 2026-09-02T16:43:28Z
  output: |
    Tests  10 passed (10)
    Start at  16:43:28
    Duration  226ms (transform 110ms, setup 0ms, import 135ms, tests 3ms, environment 0ms)

- eval: E12
  run_id: minted-chong-mat-khoa-byo-giao-dien-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_i18n_render
  verified_at: 2026-09-02T16:43:31Z
  output: |
    Tests  4 passed (4)
    Start at  16:43:31
    Duration  1.40s (transform 180ms, setup 0ms, import 460ms, tests 199ms, environment 619ms)

- eval: E9
  run_id: minted-chong-mat-khoa-byo-giao-dien-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_a11y_proto
  verified_at: 2026-09-02T16:43:35Z
  output: |
    "verdict": "PASS"
    6/6 pages scanned AND 6/6 rendered the state AND the theme they were asked for

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-bash_scripts_acceptance_preflight_verify-r3
  exit_code: 0
  verified_at: 2026-09-02T16:43:36Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-build_typecheck-r3
  exit_code: 0
  verified_at: 2026-09-02T16:43:40Z

- cmd: pnpm lint:check
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-lint_check-r3
  exit_code: 0
  verified_at: 2026-09-02T16:43:42Z

- cmd: pnpm test
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-test-r3
  exit_code: 0
  verified_at: 2026-09-02T16:43:44Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with \"${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}\" python -m pytest -q
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r3
  exit_code: 0
  verified_at: 2026-09-02T16:43:58Z

- cmd: pnpm verify:plugins
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-verify_plugins-r3
  exit_code: 0
  verified_at: 2026-09-02T16:44:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-gen_abi-r3
  exit_code: 0
  verified_at: 2026-09-02T16:44:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round trước — baseline không đo lại round này

Không có eval nào được đánh dấu green-on-both round này: `evals.yaml` không đổi từ lần đo baseline cuối nên mọi khối eval ở trên ghi `baseline: n-a` — con số này không do lại, không phải kết quả "khớp cả hai phía".

## Variance

none — round này không có eval nào mang field `runs` > 1 (không có eval ngẫu nhiên).

## Iterations

Round 1: 14/14 eval PASS (E1, E13, E2, E3, E4, E5, E6, E7, E11, E14, E8, E12, E9, E10) nhưng `pnpm typecheck` — lệnh suite bắt buộc không gắn eval — exit 2 (TS6053: hai file thiếu dưới `build/kkt-gate/types/**` bị tsconfig include pattern quét trúng). Verdict REJECT. Trả về implementation để dọn build tạm / loại trừ khỏi tsconfig include trước khi verify lại.
Round 2: 13/13 eval đo được ở round này PASS (E10 không có trong dữ liệu round này) nhưng `pnpm typecheck` vẫn exit 2 — lần này TS6053 báo bốn file thiếu dưới `.next/types/**` của worktree (`app/workspace/page.ts`, `cache-life.d.ts`, `routes.d.ts`, `validator.ts`), một nguyên nhân khác round 1 (build output/`.next` chưa sinh đủ hoặc bị dọn giữa chừng, không phải cùng lỗi include pattern của round 1). Verdict REJECT. Trả về implementation: đảm bảo `.next` được build/generate types đầy đủ trước khi `tsc --noEmit` chạy trong cùng worktree, rồi verify lại.
Round 3: 13/13 eval PASS, và `pnpm build && pnpm typecheck` cùng toàn bộ lệnh suite khác đều exit 0 — TS6053 đã được sửa. Verdict PASS.
