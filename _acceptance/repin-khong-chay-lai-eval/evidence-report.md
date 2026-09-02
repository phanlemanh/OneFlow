---
schema_version: 2
feature_slug: repin-khong-chay-lai-eval
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c69d43458a7564b81648b9c60b8d5c24da069b8f
human_signoff:
---

# Evidence Report: repin-khong-chay-lai-eval

**Lệnh fail không gắn eval:** `pnpm typecheck` thoát 2 (`error TS6053: File '.next/types/cache-life.d.ts' not found` và `error TS6053: File '.next/types/validator.ts' not found` — cả hai file nằm trong program vì khớp include pattern `.next/types/**/*.ts` trong `tsconfig.json`, nhưng thư mục `.next/types` chưa được sinh trước khi typecheck chạy trong vòng này). Đây là một lệnh suite hồi quy, không gắn AC/eval nào của hợp đồng `repin-khong-chay-lai-eval` (cả chín eval E1–E9 đều PASS, xem bảng và Evidence dưới). Vì mọi lệnh suite phải xanh để round được PASS, riêng thất bại này đã buộc verdict tổng của round REJECT.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-repin-khong-chay-lai-eval-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_write_teeth
  verified_at: 2026-09-02T16:22:09Z
  output: |
    CASE write-thieu-verified-commit: PASS
    PARTIAL: 1/10 ca da chay — khong tuyen gi ve 9 ca chua chay

- eval: E2
  run_id: minted-repin-khong-chay-lai-eval-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_newlines_have_prev
  verified_at: 2026-09-02T16:22:09Z
  output: |
    dong run-log moi so origin/main: 121 | dong repin moi thieu prev_sha: 0
    OK: moi dong repin moi deu mang prev_sha

- eval: E3
  run_id: minted-repin-khong-chay-lai-eval-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_paths_law
  verified_at: 2026-09-02T16:22:09Z
  output: |
    ok   tien-to-sao     src/*.ts       vs src/a/b.ts                   -> khong khop (mong: khong khop)
    ma tran: 8 dong = 4 hinh dang x 2 chieu | sai: 0
    OK: luat khop paths dung o ca bon hinh dang, ca hai chieu

- eval: E4
  run_id: minted-repin-khong-chay-lai-eval-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_plan
  verified_at: 2026-09-02T16:22:09Z
  output: |
    CASE plan-tap-id: PASS
    PARTIAL: 1/10 ca da chay — khong tuyen gi ve 9 ca chua chay
    CASE plan-them-mot-file: PASS
    PARTIAL: 1/10 ca da chay — khong tuyen gi ve 9 ca chua chay

- eval: E5
  run_id: minted-repin-khong-chay-lai-eval-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_check
  verified_at: 2026-09-02T16:22:09Z
  output: |
    ho so da ky: 32 | dong repin: 36 | tinh duoc: 11 | ong ba: 25 | eval bi nuot: 0 | khong ket luan duoc (khong khai paths): 2
    OK: khong re-pin nao nuot mot eval bi cham

- eval: E6
  run_id: minted-repin-khong-chay-lai-eval-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_check
  verified_at: 2026-09-02T16:22:09Z
  output: |
    ho so da ky: 32 | dong repin: 36 | tinh duoc: 11 | ong ba: 25 | eval bi nuot: 0 | khong ket luan duoc (khong khai paths): 2
    OK: khong re-pin nao nuot mot eval bi cham

- eval: E7
  run_id: minted-repin-khong-chay-lai-eval-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_readers_bytewise
  verified_at: 2026-09-02T16:22:09Z
  output: |
    hai luot pre-merge-check giong nhau tung byte | violation moi luot: 1
    doi chung duong: go khoa 'sha' LAM doi dau ra
    OK: them prev_sha khong doi ket luan cua ben doc; phep so chung minh duoc no thay khac biet

- eval: E8
  run_id: minted-repin-khong-chay-lai-eval-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_teeth
  verified_at: 2026-09-02T16:22:09Z
  output: |
    CASE plan-tap-id: PASS
    CASE plan-them-mot-file: PASS
    OK: 10/10 ca — 6 doi chung duong + 4 phep pha

- eval: E9
  run_id: minted-repin-khong-chay-lai-eval-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_resign_wave
  verified_at: 2026-09-02T16:22:09Z
  output: |
    OK: no feature other than repin-khong-chay-lai-eval carries stale evidence — the re-sign wave has cleared

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-repin-khong-chay-lai-eval-SUITE-bash_scripts_acceptance_preflight_verify-r1
  exit_code: 0
  verified_at: 2026-09-02T16:22:09Z

- cmd: pnpm build
  run_id: minted-repin-khong-chay-lai-eval-SUITE-build-r1
  exit_code: 0
  verified_at: 2026-09-02T16:22:09Z

- cmd: pnpm typecheck
  run_id: minted-repin-khong-chay-lai-eval-SUITE-typecheck-r1
  exit_code: 2
  verified_at: 2026-09-02T16:22:09Z

- cmd: pnpm lint:check
  run_id: minted-repin-khong-chay-lai-eval-SUITE-lint_check-r1
  exit_code: 0
  verified_at: 2026-09-02T16:22:09Z

- cmd: pnpm test
  run_id: minted-repin-khong-chay-lai-eval-SUITE-test-r1
  exit_code: 0
  verified_at: 2026-09-02T16:22:09Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-repin-khong-chay-lai-eval-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r1
  exit_code: 0
  verified_at: 2026-09-02T16:22:09Z

- cmd: pnpm verify:plugins
  run_id: minted-repin-khong-chay-lai-eval-SUITE-verify_plugins-r1
  exit_code: 0
  verified_at: 2026-09-02T16:22:09Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-repin-khong-chay-lai-eval-SUITE-gen_abi-r1
  exit_code: 0
  verified_at: 2026-09-02T16:22:09Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay.

none — round này không đo lại baseline (mọi eval E1–E9 ghi `baseline: n-a`), nên không có eval nào để phân loại phân-biệt/không-phân-biệt.

## Variance

none — every multi-run eval is uniform (không eval nào của round này khai `runs` > 1).

## Iterations

Round 1: cả chín eval E1–E9 PASS, nhưng lệnh suite `pnpm typecheck` thoát 2 (TS6053 — thiếu `.next/types/cache-life.d.ts` và `.next/types/validator.ts` do `.next` chưa được sinh trước khi chạy typecheck trong vòng này). Verdict tổng REJECT vì lệnh suite hồi quy đỏ, dù không eval nào của hợp đồng bị fail. Trả về implementation để sinh `.next/types` (chạy `pnpm build`/`next build` trước `pnpm typecheck`, hoặc sửa lại thứ tự lệnh trong pipeline verify) rồi verify lại.
