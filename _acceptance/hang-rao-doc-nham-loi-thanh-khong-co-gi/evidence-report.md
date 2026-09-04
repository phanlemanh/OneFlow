---
schema_version: 2
feature_slug: hang-rao-doc-nham-loi-thanh-khong-co-gi
verdict: PASS
triage_failed: true
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8654dcecf2d836e771045c1c96f8af4feb2d63fc
human_signoff: Phan Le Manh 2026-09-04
---

# Evidence Report: hang-rao-doc-nham-loi-thanh-khong-co-gi

⚠ phân loại phạm vi KHÔNG chạy được — không lỗi nào được máy tự sửa, danh sách đầy đủ nằm trong review-findings.md, người xem lại toàn bộ trước khi ký.

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
| E12 | AC-12 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_base_ref
  verified_at: 2026-09-04T06:30:00Z
  output: |
    CASE base-khong-phan-giai: PASS
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay

- eval: E2
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_base_absent
  verified_at: 2026-09-04T06:30:00Z
  output: |
    CASE base-thieu-file: PASS
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay

- eval: E3
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_diff_must
  verified_at: 2026-09-04T06:30:00Z
  output: |
    CASE diff-that-bai: PASS
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay

- eval: E4
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_check_counts
  verified_at: 2026-09-04T06:30:00Z
  output: |
    OK: khong re-pin nao nuot mot eval bi cham
    CASE ong-ba: PASS
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay

- eval: E5
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_shallow_probe
  verified_at: 2026-09-04T06:30:00Z
  output: |
    CASE shallow-do-loi: PASS
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay

- eval: E6
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E6-r1
  exit_code: 0
  verifier: config:executors.script.hrdn_dupkey
  verified_at: 2026-09-03T22:14:55Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E7-r1
  exit_code: 0
  verifier: config:executors.script.hrdn_dupkey_msg
  verified_at: 2026-09-03T22:14:55Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_selfref_declared
  verified_at: 2026-09-04T06:30:00Z
  output: |
    CASE tu-quy-chieu-khai: PASS
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay

- eval: E9
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_selfref_bucket
  verified_at: 2026-09-04T06:30:00Z
  output: |
    CASE tu-quy-chieu-dem-giam: PASS
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay

- eval: E10
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_selfref_forget
  verified_at: 2026-09-04T06:30:00Z
  output: |
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay
    CASE paths-e5e6-hoan-nguyen: PASS
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay

- eval: E11
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_resign_wave
  verified_at: 2026-09-04T06:30:00Z
  output: |
    OK: no feature other than hang-rao-doc-nham-loi-thanh-khong-co-gi carries stale evidence — the re-sign wave has cleared

- eval: E12
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hrdn_plan_diff_must
  verified_at: 2026-09-04T06:30:00Z
  output: |
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay
    CASE plan-tap-id: PASS
    PARTIAL: 1/30 ca da chay — khong tuyen gi ve 29 ca chua chay

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-bash_scripts_acceptance_preflight_verify-r2
  exit_code: 0
  verified_at: 2026-09-04T06:30:00Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-build_typecheck-r2
  exit_code: 0
  verified_at: 2026-09-04T06:30:00Z

- cmd: pnpm lint:check
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-lint_check-r2
  exit_code: 0
  verified_at: 2026-09-04T06:30:00Z

- cmd: pnpm test
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-test-r2
  exit_code: 0
  verified_at: 2026-09-04T06:30:00Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r2
  exit_code: 0
  verified_at: 2026-09-04T06:30:00Z

- cmd: pnpm verify:plugins
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-verify_plugins-r2
  exit_code: 0
  verified_at: 2026-09-04T06:30:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-hang-rao-doc-nham-loi-thanh-khong-co-gi-SUITE-gen_abi-r2
  exit_code: 0
  verified_at: 2026-09-04T06:30:00Z

## Known limits

- **Ngoài‑7 của vòng 1 vẫn mở:** chế độ lập kế hoạch ghim báo «kế hoạch sạch» cho một hồ sơ
  KHÔNG tồn tại. Owner chỉ đích danh Ngoài‑6 ở Cổng 2 vòng 1, nên lỗ này cố ý để lại.
- **Hai hàng rào mới chưa được cắm vào CI** — chúng chỉ chạy trong vòng verify của chính hồ
  sơ sở hữu, tức các hồi quy do PR sau gây ra sẽ không có ai bắt. Thiết kế đã khai «cắm hàng
  rào vào CI» nằm ngoài phạm vi vòng này (mục Ngoài phạm vi), nên đây là hạn chế đã biết,
  không phải sót.

## Ngoài hợp đồng

> ⚠ **Phân loại phạm vi KHÔNG chạy trọn** (`triage_failed: true`). Không lỗi nào bị máy tự
> sửa ở vòng này, và danh sách dưới đây có thể chưa đủ — người xem lại toàn bộ trong
> `review-findings.md` trước khi ký. Cảnh báo này KHÔNG thay thế danh sách; các lỗi đã
> phân được ngăn vẫn phải hiện để người quyết.

**9 finding, tất cả phân loại `inContract: false`** — lỗi thật nhưng ngoài phạm vi đã chốt.

- **[HIGH] `PRODUCT-MAP.md:28`** — PRODUCT-MAP.md drift: CI's `check-product-map.mjs` step is red on HEAD
- **[HIGH] `scripts/ci/repin-eval-coverage.mjs:1`** — New guards have zero CI references — the exact gap the sibling commit in this diff just closed
- **[HIGH] `PRODUCT-MAP.md:28`** — PRODUCT-MAP.md drift breaks the acceptance-gate CI job at HEAD
- **[HIGH] `scripts/ci/check-repin-eval-coverage.sh:299`** — Hình dạng 2 — fixture eval-line viết tay đúng khuôn bên đọc, không round-trip qua writer thật (46/130 dòng thật vô hình)
- **[MEDIUM] `package.json:24`** — `build` script uses a POSIX-only env prefix; no cross-env, breaks `pnpm build` on Windows
- **[MEDIUM] `scripts/ci/repin-eval-coverage.mjs:392`** — `plan` and `newlines` swallow unknown flags and exit 0, contradicting the file's own stated law
- **[MEDIUM] `scripts/acceptance/check-eval-key-dupes.sh:76`** — check-eval-key-dupes.sh reports a clean sweep when awk fails to read a file
- **[MEDIUM] `_acceptance/dang-ky-fork-openai/evals.yaml:99`** — Hình dạng 5 — thước canh cỡ bộ răng tuyên theo LỚP nhưng chỉ quét một điểm-case; số 7/7 trong hồ sơ ĐÃ KÝ đã trôi thành không bao giờ thoả được
- **[LOW] `scripts/ci/check-gate-guards-job.sh:349`** — Hình dạng 5 (biến thể) — bất biến đếm `kê == phá + bỏ qua` đúng-do-cấu-trúc, không thể đỏ vì lý do nó tuyên là bắt được

**Cờ vùng phủ:** 5/9 finding rơi NGOÀI vùng phủ của bộ đo, trải trên `PRODUCT-MAP.md` · `package.json` · `_acceptance/dang-ky-fork-openai/evals.yaml` · `scripts/ci/check-gate-guards-job.sh`.

> Mục này do main loop điền từ trường `triaged`; bộ tổng hợp trả mục RỖNG dù có 9 finding
> — lần thứ hai liên tiếp, cùng lỗi đã ghi trong sổ.

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — mọi eval round này mang baseline: n-a (không đo lại); không có eval nào được xếp vào diện không-phân-biệt round này.

## Variance

none — không có eval nào chạy nhiều lần (runs > 1) trong vòng này; không có mục nào mang pass_rate lệch.

## Iterations

Round 1 (2026-09-03): E1-E12 chạy xanh nhưng gặp bế tắc tự quy chiếu giữa `paths` của E5/E6 chặn re-pin — owner chốt thu hẹp `paths` (commit 152d724), verdict PENDING-JUDGMENT chờ owner quyết.

Round 2 (2026-09-04): 12 eval + 7 lệnh suite (build/typecheck/lint/test/sdk pytest/verify:plugins/gen:abi) đều xanh; E6/E7 carry-forward từ round 1 vì delta round này không chạm `paths` của chúng. Bước phân loại phạm vi (scope-triage) không chạy được round này nên máy không tự sửa gì trong 9 finding được review-findings.md nêu ra — verdict giữ PENDING-JUDGMENT, người xem lại toàn bộ trước khi ký.
