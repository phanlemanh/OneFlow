---
schema_version: 2
feature_slug: chong-mat-khoa-byo-giao-dien
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 991a6f1e0d49cd3d57828ff39d2d2bdf6ccd0c96
human_signoff:
---

# Evidence Report: chong-mat-khoa-byo-giao-dien

⚠ Lệnh suite `pnpm typecheck` exited 2 — không gắn eval nào, nhưng nằm trong commit checklist bắt buộc, nên verdict tổng là REJECT dù toàn bộ 14 eval đều PASS. Chi tiết: `TS6053` báo hai tệp không tồn tại dưới `build/kkt-gate/types/**` (`app/proto/[slug]/page.ts`, `validator.ts`) bị `tsconfig.json` include pattern `**/*.ts` quét trúng thư mục build tạm.

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
| E10 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-chong-mat-khoa-byo-giao-dien-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_resolve_config
  verified_at: 2026-09-01T21:38:01Z
  output: |
    Tests  5 passed (5)
    Start at  21:38:01
    Duration  173ms (transform 61ms, setup 0ms, import 58ms, tests 27ms, environment 0ms)

- eval: E13
  run_id: minted-chong-mat-khoa-byo-giao-dien-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_env_client
  verified_at: 2026-09-01T21:38:00Z
  output: |
    Tests  14 passed (14)
    Start at  21:38:00
    Duration  120ms (transform 27ms, setup 0ms, import 34ms, tests 13ms, environment 0ms)

- eval: E2
  run_id: minted-chong-mat-khoa-byo-giao-dien-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_settings_ui
  verified_at: 2026-09-01T21:38:01Z
  output: |
    Tests  6 passed (6)
    Start at  21:38:01
    Duration  675ms (transform 65ms, setup 0ms, import 199ms, tests 176ms, environment 232ms)

- eval: E3
  run_id: minted-chong-mat-khoa-byo-giao-dien-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_settings_wire
  verified_at: 2026-09-01T21:38:02Z
  output: |
    Tests  6 passed (6)
    Start at  21:38:02
    Duration  611ms (transform 58ms, setup 0ms, import 184ms, tests 154ms, environment 214ms)

- eval: E4
  run_id: minted-chong-mat-khoa-byo-giao-dien-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_replace_ui
  verified_at: 2026-09-01T21:38:00Z
  output: |
    Tests  4 passed (4)
    Start at  21:38:00
    Duration  852ms (transform 121ms, setup 0ms, import 282ms, tests 195ms, environment 283ms)

- eval: E5
  run_id: minted-chong-mat-khoa-byo-giao-dien-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_replace_wire
  verified_at: 2026-09-01T21:37:59Z
  output: |
    Tests  4 passed (4)
    Start at  21:37:59
    Duration  779ms (transform 76ms, setup 0ms, import 227ms, tests 214ms, environment 274ms)

- eval: E6
  run_id: minted-chong-mat-khoa-byo-giao-dien-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_panels_ui
  verified_at: 2026-09-01T21:37:58Z
  output: |
    Tests  12 passed (12)
    Start at  21:37:58
    Duration  865ms (transform 204ms, setup 0ms, import 432ms, tests 121ms, environment 241ms)

- eval: E7
  run_id: minted-chong-mat-khoa-byo-giao-dien-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_panels_wire
  verified_at: 2026-09-01T21:38:05Z
  output: |
    Tests  13 passed (13)
    Start at  21:38:05
    Duration  745ms (transform 171ms, setup 0ms, import 365ms, tests 106ms, environment 216ms)

- eval: E11
  run_id: minted-chong-mat-khoa-byo-giao-dien-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_one_reader
  verified_at: 2026-09-01T21:38:07Z
  output: |
    OK: the key endpoint has exactly one non-test caller (src/lib/settings/env-client.ts)

- eval: E14
  run_id: minted-chong-mat-khoa-byo-giao-dien-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_one_reader_teeth
  verified_at: 2026-09-01T21:38:08Z
  output: |
    ok   case 'a second non-test caller' named the offending file
    ok   case 'an emptied reader is rejected' exited 2
    OK: guard bites on both perturbations and is green on the real tree

- eval: E8
  run_id: minted-chong-mat-khoa-byo-giao-dien-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_locale_parity
  verified_at: 2026-09-01T21:38:00Z
  output: |
    Tests  10 passed (10)
    Start at  21:38:00
    Duration  155ms (transform 45ms, setup 0ms, import 62ms, tests 2ms, environment 0ms)

- eval: E12
  run_id: minted-chong-mat-khoa-byo-giao-dien-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kkt_gd_i18n_render
  verified_at: 2026-09-01T21:37:59Z
  output: |
    Tests  4 passed (4)
    Start at  21:37:59
    Duration  842ms (transform 167ms, setup 0ms, import 365ms, tests 136ms, environment 272ms)

- eval: E9
  run_id: minted-chong-mat-khoa-byo-giao-dien-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_a11y_proto
  verified_at: 2026-09-01T21:39:00Z
  output: |
      "verdict": "PASS"
    }
    6/6 pages scanned AND 6/6 rendered the state AND the theme they were asked for

- eval: E10
  run_id: minted-chong-mat-khoa-byo-giao-dien-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kkt_gd_design_gate
  verified_at: 2026-09-01T21:42:00Z
  output: |
    6/6 frames PASS the reference slop gate (NOT an a11y result — see E9)

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-bash_scripts_acceptance_preflight_verify-r1
  exit_code: 0
  verified_at: 2026-09-01T21:37:50Z

- cmd: pnpm build
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-build-r1
  exit_code: 0
  verified_at: 2026-09-01T21:44:00Z

- cmd: pnpm typecheck
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-typecheck-r1
  exit_code: 2
  verified_at: 2026-09-01T21:45:00Z

- cmd: pnpm lint:check
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-lint_check-r1
  exit_code: 0
  verified_at: 2026-09-01T21:45:30Z

- cmd: pnpm test
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-test-r1
  exit_code: 0
  verified_at: 2026-09-01T21:38:18Z

- cmd: pnpm verify:plugins
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-verify_plugins-r1
  exit_code: 0
  verified_at: 2026-09-01T21:46:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-chong-mat-khoa-byo-giao-dien-SUITE-gen_abi-r1
  exit_code: 0
  verified_at: 2026-09-01T21:46:30Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay
none — không có eval nào được đo baseline ở round này (mọi baseline: n-a)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 14/14 eval PASS (E1, E13, E2, E3, E4, E5, E6, E7, E11, E14, E8, E12, E9, E10) nhưng `pnpm typecheck` — lệnh suite bắt buộc không gắn eval — exit 2 (TS6053: hai file thiếu dưới `build/kkt-gate/types/**` bị tsconfig include pattern quét trúng). Verdict REJECT. Trả về implementation để dọn build tạm / loại trừ khỏi tsconfig include trước khi verify lại.
