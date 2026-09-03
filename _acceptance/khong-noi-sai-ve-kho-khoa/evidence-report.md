---
schema_version: 2
feature_slug: khong-noi-sai-ve-kho-khoa
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4c545179269509ccb400110b9d1c3a97a74c246f
human_signoff:
---

# Evidence Report: khong-noi-sai-ve-kho-khoa

⚠ Lệnh không gắn eval thất bại: `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` (exit 1) — ABI codegen sinh ra khác với cây đã commit (`src/generated/abi`, `sdk/tongflow/_data/tongflow.abi.json`). Không eval nào (E1-E13) gắn với lệnh này, nhưng nó là một cổng hồi quy bắt buộc; verdict tổng là REJECT dù toàn bộ 13 eval đều PASS. Xem khối SUITE tương ứng trong `## Evidence`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khong-noi-sai-ve-kho-khoa-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: src/app/api/settings/env/route.replace-premise.test.ts
  verified_at: 2026-09-03T16:57:17+07:00
  output: |
    Tests  6 passed (6)
    Start at  16:57:17
    Duration  975ms (transform 493ms, setup 0ms, import 191ms, tests 540ms, environment 0ms)

- eval: E2
  run_id: minted-khong-noi-sai-ve-kho-khoa-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: src/lib/settings/env-client.taxonomy.test.ts
  verified_at: 2026-09-03T16:57:19+07:00
  output: |
    Tests  11 passed (11)
    Start at  16:57:19
    Duration  269ms (transform 88ms, setup 0ms, import 183ms, tests 13ms, environment 0ms)

- eval: E3
  run_id: minted-khong-noi-sai-ve-kho-khoa-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: src/lib/settings/env-client.seam.test.ts
  verified_at: 2026-09-03T16:57:18+07:00
  output: |
    Tests  7 passed (7)
    Start at  16:57:18
    Duration  664ms (transform 93ms, setup 0ms, import 193ms, tests 9ms, environment 365ms)

- eval: E4
  run_id: minted-khong-noi-sai-ve-kho-khoa-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: src/lib/settings/env-client.timeout.test.ts
  verified_at: 2026-09-03T16:57:17+07:00
  output: |
    Tests  7 passed (7)
    Start at  16:57:17
    Duration  2.02s (transform 456ms, setup 0ms, import 895ms, tests 19ms, environment 904ms)

- eval: E5
  run_id: minted-khong-noi-sai-ve-kho-khoa-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: src/components/workspace/store-read-states.test.tsx
  verified_at: 2026-09-03T16:57:19+07:00
  output: |
    Tests  17 passed (17)
    Start at  16:57:19
    Duration  1.37s (transform 367ms, setup 0ms, import 679ms, tests 266ms, environment 347ms)

- eval: E6
  run_id: minted-khong-noi-sai-ve-kho-khoa-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: src/components/workspace/store-read-states-retry.test.tsx
  verified_at: 2026-09-03T16:57:18+07:00
  output: |
    Tests  6 passed (6)
    Start at  16:57:18
    Duration  1.14s (transform 270ms, setup 0ms, import 482ms, tests 232ms, environment 335ms)

- eval: E7
  run_id: minted-khong-noi-sai-ve-kho-khoa-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: src/components/workspace/settings-dialog.replace-refused.test.tsx
  verified_at: 2026-09-03T16:57:19+07:00
  output: |
    Tests  3 passed (3)
    Start at  16:57:19
    Duration  973ms (transform 112ms, setup 0ms, import 341ms, tests 200ms, environment 357ms)

- eval: E8
  run_id: minted-khong-noi-sai-ve-kho-khoa-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: scripts/settings/check-unauthorized-seam.sh
  verified_at: 2026-09-03T16:57:19+07:00
  output: |
    src/lib/api/client.ts
    src/lib/settings/env-client.ts
    OK: 1 dispatch site, 2 callers

- eval: E9
  run_id: minted-khong-noi-sai-ve-kho-khoa-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: scripts/settings/check-unauthorized-seam-teeth.sh
  verified_at: 2026-09-03T16:57:19+07:00
  output: |
    ok   case 'a third caller in a component' exited 1
    ok   case 'emptied client.ts' exited 2
    OK: guard bites on all four perturbations and is green on the real tree

- eval: E10
  run_id: minted-khong-noi-sai-ve-kho-khoa-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: scripts/settings/check-one-env-reader.sh
  verified_at: 2026-09-03T16:57:20+07:00
  output: |
    OK: the key endpoint has exactly one non-test caller (src/lib/settings/env-client.ts)

- eval: E11
  run_id: minted-khong-noi-sai-ve-kho-khoa-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: src/components/workspace/store-read-states-i18n.test.tsx
  verified_at: 2026-09-03T16:57:19+07:00
  output: |
    Tests  14 passed (14)
    Start at  16:57:19
    Duration  740ms (transform 87ms, setup 0ms, import 288ms, tests 33ms, environment 346ms)

- eval: E12
  run_id: minted-khong-noi-sai-ve-kho-khoa-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: src/i18n/locale-parity.test.ts
  verified_at: 2026-09-03T16:57:20+07:00
  output: |
    Tests  10 passed (10)
    Start at  16:57:20
    Duration  144ms (transform 48ms, setup 0ms, import 68ms, tests 2ms, environment 0ms)

- eval: E13
  run_id: minted-khong-noi-sai-ve-kho-khoa-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: scripts/settings/check-a11y-read-states.sh
  verified_at: 2026-09-03T16:57:21+07:00
  output: |
    "verdict": "PASS"
    }
    4/4 pages scanned AND 4/4 rendered the state, the theme AND the shipping component

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-bash_scripts_acceptance_preflight_verify-r2
  exit_code: 0
  verified_at: 2026-09-03T16:58:00+07:00

- cmd: pnpm build && pnpm typecheck
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-build_typecheck-r2
  exit_code: 0
  verified_at: 2026-09-03T16:58:05+07:00

- cmd: pnpm lint:check
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-lint_check-r2
  exit_code: 0
  verified_at: 2026-09-03T16:58:10+07:00

- cmd: pnpm test
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-test-r2
  exit_code: 0
  verified_at: 2026-09-03T16:57:32+07:00

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r2
  exit_code: 0
  verified_at: 2026-09-03T16:58:20+07:00

- cmd: pnpm verify:plugins
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-verify_plugins-r2
  exit_code: 0
  verified_at: 2026-09-03T16:58:40+07:00

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-gen_abi-r2
  exit_code: 1
  verified_at: 2026-09-03T16:58:45+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round trước — baseline không đo lại round này.

none — mọi eval của tính năng mang baseline: n-a round này (không đo lại); lệnh suite xanh-cả-hai-phía là regression-guard bình thường, không liệt kê ở đây.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: các ma trận eval E1, E3-E7, E9-E13 còn hở nửa (nội suy tiêu đề thay vì khẳng định số ca, thẻ tự dựng thay vì mount surface thật, khẳng định giá trị thay vì quan hệ state→khoá) — không đóng đủ chiều đỏ, quay lại implementation để viết lại eval + fix hành vi tương ứng.
Round 2: toàn bộ 13 eval (E1-E13) PASS trên mã hiện tại; lệnh suite không gắn eval `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` thoát mã 1 — generated ABI lệch cây đã commit. Verdict: REJECT.