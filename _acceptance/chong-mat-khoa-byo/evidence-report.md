---
schema_version: 2
feature_slug: chong-mat-khoa-byo
verdict: PENDING-JUDGMENT
triage_failed: true
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 41559770c3bb74e2ab590bebae5cc892df8a8b58
human_signoff:
---

# Evidence Report: chong-mat-khoa-byo

⚠ phân loại phạm vi KHÔNG chạy được — không lỗi nào bị máy tự sửa, danh sách đầy đủ nằm trong review-findings.md, người xem lại toàn bộ trước khi ký.

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

## Evidence

- eval: E1
  run_id: minted-chong-mat-khoa-byo-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_seam
  verified_at: 2026-08-31T08:03:19Z
  output: |
    Tests  3 passed | 13 skipped (16)
    Start at  08:03:19
    Duration  162ms (transform 28ms, setup 0ms, import 29ms, tests 34ms, environment 0ms)

- eval: E2
  run_id: minted-chong-mat-khoa-byo-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_read_ok_absent
  verified_at: 2026-08-31T08:03:18Z
  output: |
    Tests  2 passed | 14 skipped (16)
    Start at  08:03:18
    Duration  262ms (transform 89ms, setup 0ms, import 73ms, tests 62ms, environment 0ms)

- eval: E3
  run_id: minted-chong-mat-khoa-byo-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_read_unreadable
  verified_at: 2026-08-31T08:03:19Z
  output: |
    Tests  6 passed | 10 skipped (16)
    Start at  08:03:19
    Duration  345ms (transform 115ms, setup 0ms, import 76ms, tests 102ms, environment 0ms)

- eval: E4
  run_id: minted-chong-mat-khoa-byo-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_load_tolerant
  verified_at: 2026-08-31T08:03:18Z
  output: |
    Tests  5 passed | 11 skipped (16)
    Start at  08:03:18
    Duration  481ms (transform 301ms, setup 0ms, import 40ms, tests 310ms, environment 0ms)

- eval: E5
  run_id: minted-chong-mat-khoa-byo-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_get
  verified_at: 2026-08-31T08:03:18Z
  output: |
    Tests  2 passed | 3 skipped (5)
    Start at  08:03:18
    Duration  297ms (transform 84ms, setup 0ms, import 59ms, tests 95ms, environment 0ms)

- eval: E6
  run_id: minted-chong-mat-khoa-byo-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_put_refuse
  verified_at: 2026-08-31T08:03:18Z
  output: |
    Tests  1 passed | 4 skipped (5)
    Start at  08:03:18
    Duration  295ms (transform 102ms, setup 0ms, import 74ms, tests 99ms, environment 0ms)

- eval: E7
  run_id: minted-chong-mat-khoa-byo-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_put_force
  verified_at: 2026-08-31T08:03:19Z
  output: |
    Tests  2 passed | 3 skipped (5)
    Start at  08:03:19
    Duration  275ms (transform 115ms, setup 0ms, import 26ms, tests 149ms, environment 0ms)

- eval: E8
  run_id: minted-chong-mat-khoa-byo-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_no_regression
  verified_at: 2026-08-31T08:03:18Z
  output: |
    Tests  4 passed (4)
    Start at  08:03:18
    Duration  277ms (transform 72ms, setup 0ms, import 38ms, tests 146ms, environment 0ms)

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-chong-mat-khoa-byo-SUITE-bash_scripts_acceptance_preflight_verify-r3
  exit_code: 0
  verified_at: 2026-08-31T08:03:20Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-chong-mat-khoa-byo-SUITE-build_typecheck-r3
  exit_code: 0
  verified_at: 2026-08-31T08:03:20Z

- cmd: pnpm lint:check
  run_id: minted-chong-mat-khoa-byo-SUITE-lint_check-r3
  exit_code: 0
  verified_at: 2026-08-31T08:03:20Z

- cmd: pnpm test
  run_id: minted-chong-mat-khoa-byo-SUITE-test-r3
  exit_code: 0
  verified_at: 2026-08-31T08:03:20Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-chong-mat-khoa-byo-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r3
  exit_code: 0
  verified_at: 2026-08-31T08:03:20Z

- cmd: pnpm verify:plugins
  run_id: minted-chong-mat-khoa-byo-SUITE-verify_plugins-r3
  exit_code: 0
  verified_at: 2026-08-31T08:03:20Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-chong-mat-khoa-byo-SUITE-gen_abi-r3
  exit_code: 0
  verified_at: 2026-08-31T08:03:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — baseline không đo lại round này (mọi baseline: n-a trên cả 8 eval máy); không có eval nào để liệt kê không-phân-biệt round này.

## Variance

none — every multi-run eval is uniform (không eval nào mang `runs` > 1 round này).

## Iterations

Round 1–2: dữ liệu không có trong đầu vào của vòng này — không tái tạo, không suy diễn.
Round 3 (vòng này): cả 8 eval máy (E1–E8) và toàn bộ lệnh suite hồi quy đều xanh (exit 0), nhưng bước phân loại phạm vi (scope-triage) cho review-findings KHÔNG chạy được nên máy không tự sửa gì — verdict ép về PENDING-JUDGMENT theo đúng giao thức triage_failed, chờ người xem lại review-findings.md trước khi ký.
