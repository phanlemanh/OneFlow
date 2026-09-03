---
schema_version: 2
feature_slug: hang-rao-doc-nham-loi-thanh-khong-co-gi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 03ea8f4ccf7949042aa56db8adf8a54a4f923c8e
human_signoff:
---

# Evidence Report: hang-rao-doc-nham-loi-thanh-khong-co-gi

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
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_base_ref
  verified_at: 2026-09-04T05:35:00Z
  output: |
    CASE base-khong-phan-giai: PASS
    PARTIAL: 1/29 ca da chay — khong tuyen gi ve 28 ca chua chay

- eval: E2
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_base_absent
  verified_at: 2026-09-04T05:35:00Z
  output: |
    CASE base-thieu-file: PASS
    PARTIAL: 1/29 ca da chay — khong tuyen gi ve 28 ca chua chay

- eval: E3
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_diff_must
  verified_at: 2026-09-04T05:35:00Z
  output: |
    CASE diff-that-bai: PASS
    PARTIAL: 1/29 ca da chay — khong tuyen gi ve 28 ca chua chay

- eval: E4
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_check_counts
  verified_at: 2026-09-04T05:35:00Z
  output: |
    OK: khong re-pin nao nuot mot eval bi cham
    CASE ong-ba: PASS
    PARTIAL: 1/29 ca da chay — khong tuyen gi ve 28 ca chua chay

- eval: E5
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_shallow_probe
  verified_at: 2026-09-04T05:35:00Z
  output: |
    CASE shallow-do-loi: PASS
    PARTIAL: 1/29 ca da chay — khong tuyen gi ve 28 ca chua chay

- eval: E6
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_dupkey
  verified_at: 2026-09-04T05:35:00Z
  output: |
    CASE khoa-trung-neu-dich-danh: PASS
    CASE khoa-trong-khoi-van: PASS
    OK: 3/3 ca

- eval: E7
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_dupkey_msg
  verified_at: 2026-09-04T05:35:00Z
  output: |
    CASE khoa-trung-neu-dich-danh: PASS
    PARTIAL: 1/3 ca da chay — khong tuyen gi ve 2 ca chua chay

- eval: E8
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_selfref_declared
  verified_at: 2026-09-04T05:35:00Z
  output: |
    CASE tu-quy-chieu-khai: PASS
    PARTIAL: 1/29 ca da chay — khong tuyen gi ve 28 ca chua chay

- eval: E9
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_selfref_bucket
  verified_at: 2026-09-04T05:35:00Z
  output: |
    OK: khong re-pin nao nuot mot eval bi cham
    CASE tu-quy-chieu-dem-giam: PASS
    PARTIAL: 1/29 ca da chay — khong tuyen gi ve 28 ca chua chay

- eval: E10
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_selfref_forget
  verified_at: 2026-09-04T05:35:00Z
  output: |
    PARTIAL: 1/29 ca da chay — khong tuyen gi ve 28 ca chua chay
    CASE paths-e5e6-hoan-nguyen: PASS
    PARTIAL: 1/29 ca da chay — khong tuyen gi ve 28 ca chua chay

- eval: E11
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_resign_wave
  verified_at: 2026-09-04T05:35:00Z
  output: |
    OK: no feature other than hang-rao-doc-nham-loi-thanh-khong-co-gi carries stale evidence — the re-sign wave has cleared

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-bash_scripts_acceptance_preflight_verify-r1
  exit_code: 0
  verified_at: 2026-09-04T05:35:00Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-build_typecheck-r1
  exit_code: 0
  verified_at: 2026-09-04T05:35:00Z

- cmd: pnpm lint:check
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-lint_check-r1
  exit_code: 0
  verified_at: 2026-09-04T05:35:00Z

- cmd: pnpm test
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-test-r1
  exit_code: 0
  verified_at: 2026-09-04T05:35:00Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r1
  exit_code: 0
  verified_at: 2026-09-04T05:35:00Z

- cmd: pnpm verify:plugins
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-verify_plugins-r1
  exit_code: 0
  verified_at: 2026-09-04T05:35:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-gen_abi-r1
  exit_code: 0
  verified_at: 2026-09-04T05:35:00Z

## Known limits

- **Đường đo dòng 1 của hợp đồng khai «4/9 điểm gọi `gitOk` chuyển sang từ-chối»; vòng này
  làm được 3.** Ma trận trong design doc kê `diff --name-only ×2 (dòng 311, 430)` đều thuộc
  diện **sửa**; vòng này sửa dòng 430 (`modeCheck`) và bỏ dòng 311 (`modePlan`). AC-3 chỉ nói
  về `check` nên E3 xanh đúng luật — nhưng con số 4/9 thì chưa đạt. Điểm còn lại chính là
  finding HIGH `repin-eval-coverage.mjs:335` dưới đây, đã chạy được chiều đỏ.

## Ngoài hợp đồng

**12 finding, TẤT CẢ được phân loại `inContract: false`** — lỗi thật nhưng ngoài phạm vi
đã chốt ở Cổng 1, nên máy KHÔNG sửa chúng ở vòng này. Người quyết ở Cổng 2.

- **[HIGH] `scripts/ci/repin-eval-coverage.mjs:208`** — evalsOf: prose inside `expected: >-` hijacks an eval's `paths`, turning a swallowed eval into a green sweep
- **[HIGH] `scripts/ci/repin-eval-coverage.mjs:335`** — modePlan reads a failed `git diff` as "nothing changed" and tells the operator to re-run no eval
- **[HIGH] `PRODUCT-MAP.md:28`** — PRODUCT-MAP.md is out of sync with the new dossier's status — the acceptance-gate CI step is red at HEAD
- **[HIGH] `_acceptance/dang-ky-fork-openai/evals.yaml:99`** — Hình dạng 3 — assert chuỗi hằng `OK: 7/7 ca` thay cho quan hệ «mọi ca của bộ răng đều chạy và đạt»; nay đã mục (bộ răng in 9/9)
- **[MEDIUM] `scripts/ci/check-gate-guards-job.sh:349`** — Bất biến KÊ = PHÁ + BỎ QUA không thể đỏ vì lý do mà thông điệp của nó nêu
- **[MEDIUM] `scripts/ci/repin-eval-coverage.mjs:338`** — modePlan reports a clean plan for a dossier that does not exist
- **[MEDIUM] `scripts/ci/check-gate-guards-job.sh:347`** — teeth invariant `KÊ == PHÁ + BỎ QUA` cannot detect the case its comment claims it detects
- **[MEDIUM] `scripts/ci/check-gate-guards-job.sh:349`** — Hình dạng 3 (biến thể) — bất biến đếm `kê = phá + bỏ qua` HẰNG-ĐÚNG theo cấu tạo, nhưng E5/AC-5 khai nó là phép đo phân biệt «quên viết phép phá» với «cố ý bỏ qua»
- **[LOW] `package.json:24`** — `build` nhúng biến môi trường inline — vỡ trên shell không POSIX, và là script duy nhất trong package.json làm vậy
- **[LOW] `scripts/ci/check-gate-guards-job.sh:91`** — Thông điệp OK và chú thích của mode `shape` vẫn nói 'hai guard' trong khi đã kiểm bảy needle
- **[LOW] `scripts/plugins/check-live-docs-manifest-teeth.sh:10`** — Mode `orphans` không có chiều đỏ ở bất kỳ đâu, và bỏ qua icon .png mà runtime vẫn phân giải
- **[LOW] `scripts/acceptance/check-eval-key-dupes.sh:99`** — Hình dạng 2 — ca «hồ sơ đã thật sự xảy ra» dựng fixture GÕ TAY đúng khuôn bộ đọc, không rút vật hỏng THẬT từ lịch sử git

**Cờ vùng phủ (`coverageCluster`):** 8/12 finding rơi NGOÀI vùng phủ của bộ đo, trải trên
`scripts/ci/check-gate-guards-job.sh` · `package.json` · `scripts/plugins/check-live-docs-manifest-teeth.sh` · `PRODUCT-MAP.md` · `_acceptance/dang-ky-fork-openai/evals.yaml`.
Dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

> Mục này do main loop điền từ trường `triaged` của kết quả workflow. Bộ tổng hợp trả
> mục RỖNG dù có 12 finding — cùng lỗi đã ghi trong sổ phiên trước; tin vào mục rỗng ấy
> thì cổng đọc bằng chứng thành «xanh-sạch» và BỎ mời người ký.

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — round nay khong do baseline (P2: evals.yaml khong doi tu lan baseline cuoi), nen khong co eval nao duoc xep vao dien khong-phan-biet o round nay.

## Variance

none — every multi-run eval is uniform (khong co eval nao khai runs > 1 round nay)

## Iterations

Round 1: toan bo 11 eval (E1-E11) PASS ngay lan chay dau, khong co variance; cac lenh suite (preflight/build/typecheck/lint/test/sdk pytest/verify:plugins/gen:abi) deu xanh. Verdict: PASS.
