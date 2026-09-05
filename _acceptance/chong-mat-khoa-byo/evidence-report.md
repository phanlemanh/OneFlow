---
schema_version: 2
feature_slug: chong-mat-khoa-byo
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e
human_signoff: Phan Le Manh 2026-08-31
---

# Evidence Report: chong-mat-khoa-byo

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
  run_id: minted-chong-mat-khoa-byo-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_seam
  verified_at: 2026-08-31T08:29:07Z
  output: |
    Tests  3 passed | 14 skipped (17)
    Start at  08:29:07
    Duration  255ms (transform 122ms, setup 0ms, import 114ms, tests 39ms, environment 0ms)

- eval: E2
  run_id: minted-chong-mat-khoa-byo-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_read_ok_absent
  verified_at: 2026-08-31T08:29:07Z
  output: |
    Tests  2 passed | 15 skipped (17)
    Start at  08:29:07
    Duration  254ms (transform 117ms, setup 0ms, import 100ms, tests 52ms, environment 0ms)

- eval: E3
  run_id: minted-chong-mat-khoa-byo-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_read_unreadable
  verified_at: 2026-08-31T08:29:11Z
  output: |
    Tests  6 passed | 11 skipped (17)
    Start at  08:29:11
    Duration  133ms (transform 36ms, setup 0ms, import 33ms, tests 28ms, environment 0ms)

- eval: E4
  run_id: minted-chong-mat-khoa-byo-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_load_tolerant
  verified_at: 2026-08-31T08:29:07Z
  output: |
    Tests  6 passed | 11 skipped (17)
    Start at  08:29:07
    Duration  420ms (transform 52ms, setup 0ms, import 144ms, tests 27ms, environment 0ms)

- eval: E5
  run_id: minted-chong-mat-khoa-byo-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_get
  verified_at: 2026-08-31T08:29:07Z
  output: |
    Tests  2 passed | 3 skipped (5)
    Start at  08:29:07
    Duration  289ms (transform 94ms, setup 0ms, import 64ms, tests 125ms, environment 0ms)

- eval: E6
  run_id: minted-chong-mat-khoa-byo-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_put_refuse
  verified_at: 2026-08-31T08:29:07Z
  output: |
    Tests  1 passed | 4 skipped (5)
    Start at  08:29:07
    Duration  288ms (transform 97ms, setup 0ms, import 66ms, tests 121ms, environment 0ms)

- eval: E7
  run_id: minted-chong-mat-khoa-byo-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_put_force
  verified_at: 2026-08-31T08:29:07Z
  output: |
    Tests  2 passed | 3 skipped (5)
    Start at  08:29:07
    Duration  274ms (transform 86ms, setup 0ms, import 61ms, tests 122ms, environment 0ms)

- eval: E8
  run_id: minted-chong-mat-khoa-byo-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_no_regression
  verified_at: 2026-08-31T08:29:07Z
  output: |
    Tests  9 passed (9)
    Start at  08:29:07
    Duration  238ms (transform 126ms, setup 0ms, import 103ms, tests 136ms, environment 0ms)

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-chong-mat-khoa-byo-SUITE-bash_scripts_acceptance_preflight_verify-r4
  exit_code: 0
  verified_at: 2026-08-31T08:29:20Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-chong-mat-khoa-byo-SUITE-build_typecheck-r4
  exit_code: 0
  verified_at: 2026-08-31T08:29:20Z

- cmd: pnpm lint:check
  run_id: minted-chong-mat-khoa-byo-SUITE-lint_check-r4
  exit_code: 0
  verified_at: 2026-08-31T08:29:20Z

- cmd: pnpm test
  run_id: minted-chong-mat-khoa-byo-SUITE-test-r4
  exit_code: 0
  verified_at: 2026-08-31T08:29:20Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-chong-mat-khoa-byo-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r4
  exit_code: 0
  verified_at: 2026-08-31T08:29:20Z

- cmd: pnpm verify:plugins
  run_id: minted-chong-mat-khoa-byo-SUITE-verify_plugins-r4
  exit_code: 0
  verified_at: 2026-08-31T08:29:20Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-chong-mat-khoa-byo-SUITE-gen_abi-r4
  exit_code: 0
  verified_at: 2026-08-31T08:29:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round trước — baseline không đo lại round này

none — baseline không đo lại round này (mọi baseline: n-a trên cả 8 eval máy round 4); không có eval nào để liệt kê không-phân-biệt round này.

## Variance

none — every multi-run eval is uniform (không eval nào mang `runs` > 1 round này).

## Iterations

Round 1–2: dữ liệu không có trong đầu vào của vòng này — không tái tạo, không suy diễn.
Round 3: cả 8 eval máy và suite hồi quy đều xanh, nhưng scope-triage cho review-findings KHÔNG chạy được → verdict ép về PENDING-JUDGMENT (triage_failed), chờ người xem lại review-findings.md.
Round 4 (vòng này): E3/E4 sửa để ca cuối gọi THẬT readEnvStore/loadEnvStore thay vì so hằng số nội bộ của chính file test, E6 thêm đối chứng sha256 trên đĩa cho ca refuse-and-leave, E8 mở rộng chạy cả hai file route test (route.test.ts + route.unreadable.test.ts) để phủ đủ bốn điều AC-8 tuyên; scope-triage lần này chạy xong và phân loại đủ mọi finding — cả 8 eval máy và toàn bộ lệnh suite hồi quy đều xanh (exit 0), verdict PASS.

### Re-pin — 05/09/2026, hợp nhất PR #97 vào `main`

run_id: repin-merge-20260905T101500Z
sha: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e · suites: 8 lệnh exit 0

Commit merge `96ee9b8` kéo mọi hồ sơ đã ký ra khỏi mốc của chúng theo đường dẫn. Một lượt làn
máy chung cho cả đợt, 8 ô đo bị chạm, cả 8 chạy lại và exit 0.

Đợt này KHÔNG re-pin SÁU hồ sơ — `add-media-library`, `byo-key-onboarding`, `chong-doc-sai-em-ru`,
`cong-tu-canh-minh`, `gate-scope-anchors`, `normalize-text-vi` — vì ô đo bị chạm của chúng ĐỎ, hoặc
KHÔNG KẾT LUẬN ĐƯỢC (cửa sổ diff rỗng khi nhánh đứng ngay tại `main`; hoặc ô `ui-check` không chạy
được ngoài luồng verify). Dời mốc khi ấy là khai rằng bằng chứng còn đúng trong khi chưa chứng
minh được.
