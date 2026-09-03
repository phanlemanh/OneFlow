---
schema_version: 2
feature_slug: khong-noi-sai-ve-kho-khoa
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cb2fab21e07988883da528d72e5c5a62219ef058
human_signoff:
---

# Evidence Report: khong-noi-sai-ve-kho-khoa

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
  run_id: minted-khong-noi-sai-ve-kho-khoa-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: src/app/api/settings/env/route.replace-premise.test.ts
  verified_at: 2026-09-03T17:22:59+07:00
  output: |
    Tests  6 passed (6)
    Start at  17:22:59
    Duration  648ms (transform 354ms, setup 0ms, import 96ms, tests 398ms, environment 0ms)

- eval: E2
  run_id: minted-khong-noi-sai-ve-kho-khoa-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: src/lib/settings/env-client.taxonomy.test.ts
  verified_at: 2026-09-03T17:23:04+07:00
  output: |
    Tests  11 passed (11)
    Start at  17:23:04
    Duration  234ms (transform 68ms, setup 0ms, import 148ms, tests 11ms, environment 0ms)

- eval: E3
  run_id: minted-khong-noi-sai-ve-kho-khoa-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: src/lib/settings/env-client.seam.test.ts
  verified_at: 2026-09-03T17:23:03+07:00
  output: |
    Tests  7 passed (7)
    Start at  17:23:03
    Duration  725ms (transform 103ms, setup 0ms, import 209ms, tests 10ms, environment 419ms)

- eval: E4
  run_id: minted-khong-noi-sai-ve-kho-khoa-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: src/lib/settings/env-client.timeout.test.ts
  verified_at: 2026-09-03T17:23:03+07:00
  output: |
    Tests  7 passed (7)
    Start at  17:23:03
    Duration  1.35s (transform 439ms, setup 0ms, import 863ms, tests 27ms, environment 368ms)

- eval: E5
  run_id: minted-khong-noi-sai-ve-kho-khoa-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: src/components/workspace/store-read-states.test.tsx
  verified_at: 2026-09-03T17:23:02+07:00
  output: |
    Tests  17 passed (17)
    Start at  17:23:02
    Duration  2.14s (transform 545ms, setup 0ms, import 968ms, tests 341ms, environment 690ms)

- eval: E6
  run_id: minted-khong-noi-sai-ve-kho-khoa-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: src/components/workspace/store-read-states-retry.test.tsx
  verified_at: 2026-09-03T17:23:03+07:00
  output: |
    Tests  6 passed (6)
    Start at  17:23:03
    Duration  1.67s (transform 530ms, setup 0ms, import 928ms, tests 259ms, environment 371ms)

- eval: E7
  run_id: minted-khong-noi-sai-ve-kho-khoa-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: src/components/workspace/settings-dialog.replace-refused.test.tsx
  verified_at: 2026-09-03T17:23:03+07:00
  output: |
    Tests  4 passed (4)
    Start at  17:23:03
    Duration  1.11s (transform 220ms, setup 0ms, import 476ms, tests 230ms, environment 304ms)

- eval: E8
  run_id: minted-khong-noi-sai-ve-kho-khoa-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: scripts/settings/check-unauthorized-seam.sh
  verified_at: 2026-09-03T17:23:04+07:00
  output: |
    src/lib/api/client.ts
    src/lib/settings/env-client.ts
    OK: 1 dispatch site, 2 callers

- eval: E9
  run_id: minted-khong-noi-sai-ve-kho-khoa-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: scripts/settings/check-unauthorized-seam-teeth.sh
  verified_at: 2026-09-03T17:23:05+07:00
  output: |
    ok   case 'a third caller in a component' exited 1
    ok   case 'emptied client.ts' exited 2
    OK: guard bites on all four perturbations and is green on the real tree

- eval: E10
  run_id: minted-khong-noi-sai-ve-kho-khoa-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: scripts/settings/check-one-env-reader.sh
  verified_at: 2026-09-03T17:23:05+07:00
  output: |
    OK: the key endpoint has exactly one non-test caller (src/lib/settings/env-client.ts)

- eval: E11
  run_id: minted-khong-noi-sai-ve-kho-khoa-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: src/components/workspace/store-read-states-i18n.test.tsx
  verified_at: 2026-09-03T17:23:03+07:00
  output: |
    Tests  20 passed (20)
    Start at  17:23:03
    Duration  816ms (transform 110ms, setup 0ms, import 288ms, tests 40ms, environment 387ms)

- eval: E12
  run_id: minted-khong-noi-sai-ve-kho-khoa-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: src/i18n/locale-parity.test.ts
  verified_at: 2026-09-03T17:23:03+07:00
  output: |
    Tests  10 passed (10)
    Start at  17:23:03
    Duration  198ms (transform 75ms, setup 0ms, import 99ms, tests 2ms, environment 0ms)

- eval: E13
  run_id: minted-khong-noi-sai-ve-kho-khoa-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: scripts/settings/check-a11y-read-states.sh
  verified_at: 2026-09-03T17:23:10+07:00
  output: |
    "verdict": "PASS"
    }
    4/4 pages scanned AND 4/4 rendered the state, the theme AND the shipping component

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-bash_scripts_acceptance_preflight_verify-r3
  exit_code: 0
  verified_at: 2026-09-03T17:23:12+07:00

- cmd: pnpm build && pnpm typecheck
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-build_typecheck-r3
  exit_code: 0
  verified_at: 2026-09-03T17:23:14+07:00

- cmd: pnpm lint:check
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-lint_check-r3
  exit_code: 0
  verified_at: 2026-09-03T17:23:16+07:00

- cmd: pnpm test
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-test-r3
  exit_code: 0
  verified_at: 2026-09-03T17:23:18+07:00

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r3
  exit_code: 0
  verified_at: 2026-09-03T17:23:40+07:00

- cmd: pnpm verify:plugins
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-verify_plugins-r3
  exit_code: 0
  verified_at: 2026-09-03T17:24:00+07:00

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-gen_abi-r3
  exit_code: 0
  verified_at: 2026-09-03T17:24:05+07:00

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
Round 3: `pnpm gen:abi` được chạy lại và cây generated (`src/generated/abi`, `sdk/tongflow/_data/tongflow.abi.json`) được đồng bộ với commit đã verify; toàn bộ 13 eval (E1-E13) và bảy lệnh suite hồi quy đều PASS trên cùng một cây. Verdict: PASS.