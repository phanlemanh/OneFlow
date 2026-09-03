---
schema_version: 2
feature_slug: khong-noi-sai-ve-kho-khoa
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d10b0ea7a2fc55d745b8f1a33f60b75db05e7406
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

Ghi chú bắt buộc đọc trước khi diễn giải bảng trên: cả 13 eval máy đều exit 0, nhưng verdict tổng của vòng này là REJECT vì đánh giá adversarial (xem `review-findings.md`, mục "## Trong hợp đồng") phát hiện năm lỗi trong-hợp-đồng — bốn mức HIGH ánh xạ vào AC-1, AC-4, AC-5, AC-9 (thẻ chặn trên node ABI thật không có nút Thử lại; ca timeout chỉ loại trừ ba giá trị phase mà không khẳng định dương; ca i18n tự dựng nút và chuỗi kỳ vọng rồi tự so khớp, không chạm component thật; hằng CASES của ma trận tiền đề không được khẳng định) — cho thấy các eval tương ứng chưa thực sự chứng minh hành vi sản phẩm mà chúng đặt tên, dù bản thân lệnh chạy máy báo xanh. failed_evals giữ nguyên rỗng theo đúng thực tế (không lệnh máy nào exit khác 0); REJECT ở đây là REJECT theo đánh giá phát hiện, không phải REJECT theo exit code.

## Evidence

- eval: E1
  run_id: minted-khong-noi-sai-ve-kho-khoa-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: pnpm vitest run src/app/api/settings/env/route.replace-premise.test.ts
  verified_at: 2026-09-03T16:28:23+07:00
  output: |
    Tests  5 passed (5)
    Start at  16:28:23
    Duration  283ms (transform 100ms, setup 0ms, import 72ms, tests 114ms, environment 0ms)

- eval: E2
  run_id: minted-khong-noi-sai-ve-kho-khoa-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: pnpm vitest run src/lib/settings/env-client.taxonomy.test.ts
  verified_at: 2026-09-03T16:28:27+07:00
  output: |
    Tests  11 passed (11)
    Start at  16:28:27
    Duration  308ms (transform 102ms, setup 0ms, import 205ms, tests 14ms, environment 0ms)

- eval: E3
  run_id: minted-khong-noi-sai-ve-kho-khoa-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: pnpm vitest run src/lib/settings/env-client.seam.test.ts
  verified_at: 2026-09-03T16:28:25+07:00
  output: |
    Start at  16:28:25
    Duration  1.08s (transform 110ms, setup 0ms, import 320ms, tests 9ms, environment 613ms)

- eval: E4
  run_id: minted-khong-noi-sai-ve-kho-khoa-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: pnpm vitest run src/lib/settings/env-client.timeout.test.ts
  verified_at: 2026-09-03T16:28:28+07:00
  output: |
    Tests  6 passed (6)
    Start at  16:28:28
    Duration  860ms (transform 218ms, setup 0ms, import 468ms, tests 14ms, environment 307ms)

- eval: E5
  run_id: minted-khong-noi-sai-ve-kho-khoa-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: pnpm vitest run src/components/workspace/store-read-states.test.tsx
  verified_at: 2026-09-03T16:28:27+07:00
  output: |
    Tests  17 passed (17)
    Start at  16:28:27
    Duration  1.44s (transform 286ms, setup 0ms, import 582ms, tests 264ms, environment 510ms)

- eval: E6
  run_id: minted-khong-noi-sai-ve-kho-khoa-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: pnpm vitest run src/components/workspace/store-read-states-retry.test.tsx
  verified_at: 2026-09-03T16:28:26+07:00
  output: |
    Tests  6 passed (6)
    Start at  16:28:26
    Duration  1.23s (transform 199ms, setup 0ms, import 434ms, tests 237ms, environment 478ms)

- eval: E7
  run_id: minted-khong-noi-sai-ve-kho-khoa-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: pnpm vitest run src/components/workspace/settings-dialog.replace-refused.test.tsx
  verified_at: 2026-09-03T16:28:26+07:00
  output: |
    Tests  3 passed (3)
    Start at  16:28:26
    Duration  1.22s (transform 192ms, setup 0ms, import 421ms, tests 216ms, environment 476ms)

- eval: E8
  run_id: minted-khong-noi-sai-ve-kho-khoa-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/check-unauthorized-seam.sh
  verified_at: 2026-09-03T16:28:30+07:00
  output: |
    src/lib/api/client.ts
    src/lib/settings/env-client.ts
    OK: 1 dispatch site, 2 callers

- eval: E9
  run_id: minted-khong-noi-sai-ve-kho-khoa-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/check-unauthorized-seam-teeth.sh
  verified_at: 2026-09-03T16:28:31+07:00
  output: |
    ok   case 'a third caller in a component' exited 1
    ok   case 'emptied client.ts' exited 2
    OK: guard bites on all four perturbations and is green on the real tree

- eval: E10
  run_id: minted-khong-noi-sai-ve-kho-khoa-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/check-one-env-reader.sh
  verified_at: 2026-09-03T16:28:32+07:00
  output: |
    OK: the key endpoint has exactly one non-test caller (src/lib/settings/env-client.ts)

- eval: E11
  run_id: minted-khong-noi-sai-ve-kho-khoa-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: pnpm vitest run src/components/workspace/store-read-states-i18n.test.tsx
  verified_at: 2026-09-03T16:28:27+07:00
  output: |
    Tests  8 passed (8)
    Start at  16:28:27
    Duration  852ms (transform 52ms, setup 0ms, import 414ms, tests 29ms, environment 321ms)

- eval: E12
  run_id: minted-khong-noi-sai-ve-kho-khoa-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: pnpm vitest run src/i18n/locale-parity.test.ts
  verified_at: 2026-09-03T16:28:29+07:00
  output: |
    Tests  10 passed (10)
    Start at  16:28:29
    Duration  146ms (transform 56ms, setup 0ms, import 74ms, tests 3ms, environment 0ms)

- eval: E13
  run_id: minted-khong-noi-sai-ve-kho-khoa-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/check-a11y-read-states.sh
  verified_at: 2026-09-03T16:28:33+07:00
  output: |
    "verdict": "PASS"
    4/4 pages scanned AND 4/4 rendered the state, the theme AND the shipping component

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-bash_scripts_acceptance_preflight_verify-r1
  exit_code: 0
  verified_at: 2026-09-03T16:28:10+07:00

- cmd: pnpm build && pnpm typecheck
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-build_typecheck-r1
  exit_code: 0
  verified_at: 2026-09-03T16:28:34+07:00

- cmd: pnpm lint:check
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-lint_check-r1
  exit_code: 0
  verified_at: 2026-09-03T16:28:38+07:00

- cmd: pnpm test
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-test-r1
  exit_code: 0
  verified_at: 2026-09-03T16:28:40+07:00

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r1
  exit_code: 0
  verified_at: 2026-09-03T16:28:56+07:00

- cmd: pnpm verify:plugins
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-verify_plugins-r1
  exit_code: 0
  verified_at: 2026-09-03T16:29:16+07:00

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-khong-noi-sai-ve-kho-khoa-SUITE-gen_abi-r1
  exit_code: 0
  verified_at: 2026-09-03T16:29:17+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — không có eval non-discriminating được liệt kê round này (baseline không đo lại)

## Variance

none — không có eval stochastic (runs > 1) trong vòng này; không eval nào mang pass_rate hỗn hợp

## Iterations

Round 1: cả 13 eval máy và 7 lệnh suite hồi quy đều exit 0, nhưng review adversarial phát hiện 4 lỗi HIGH trong-hợp-đồng (ánh xạ AC-1/AC-4/AC-5/AC-9 — xem review-findings.md) cho thấy các eval E1/E4/E5/E11 chưa thực sự chứng minh hành vi mà chúng đặt tên. Verdict REJECT; trả về implementation để sửa các lỗ này trước khi verify lại.
