---
schema_version: 2
feature_slug: chong-mat-khoa-byo
verdict: BLOCKED
failed_evals: [E17]
reason: "pnpm build && pnpm typecheck" — Build process interrupted during Next.js optimization step. Exit code 144 with incomplete output suggests the tool terminated the command before completion. Remedy per tool-kill-rule: re-run with a longer tool timeout, not a code fix.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 290f4cf8bc66a6199d667176b9fd05ad0ca2ad82
human_signoff:
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
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-10 | ui-check | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-11 | ui-check | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-12 | ui-check | PASS |
| E16 | AC-13 | test | PASS |
| E17 | AC-14 | script | FAIL |
| E18 | AC-14 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-chong-mat-khoa-byo-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_seam
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  3 passed | 13 skipped (16)
    Start at  06:24:38
    Duration  179ms (transform 57ms, setup 0ms, import 42ms, tests 44ms, environment 0ms)

- eval: E2
  run_id: minted-chong-mat-khoa-byo-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_read_ok_absent
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  2 passed | 14 skipped (16)
    Start at  06:24:38
    Duration  181ms (transform 59ms, setup 0ms, import 64ms, tests 26ms, environment 0ms)

- eval: E3
  run_id: minted-chong-mat-khoa-byo-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_read_unreadable
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  6 passed | 10 skipped (16)
    Start at  06:24:38
    Duration  368ms (transform 118ms, setup 0ms, import 36ms, tests 246ms, environment 0ms)

- eval: E4
  run_id: minted-chong-mat-khoa-byo-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_load_tolerant
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  5 passed | 11 skipped (16)
    Start at  06:24:38
    Duration  201ms (transform 78ms, setup 0ms, import 55ms, tests 59ms, environment 0ms)

- eval: E5
  run_id: minted-chong-mat-khoa-byo-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_get
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  2 passed | 3 skipped (5)
    Start at  06:24:38
    Duration  204ms (transform 82ms, setup 0ms, import 65ms, tests 65ms, environment 0ms)

- eval: E6
  run_id: minted-chong-mat-khoa-byo-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_put_refuse
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  1 passed | 4 skipped (5)
    Start at  06:24:38
    Duration  325ms (transform 41ms, setup 0ms, import 44ms, tests 42ms, environment 0ms)

- eval: E7
  run_id: minted-chong-mat-khoa-byo-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_put_force
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  2 passed | 3 skipped (5)
    Start at  06:24:38
    Duration  211ms (transform 67ms, setup 0ms, import 40ms, tests 78ms, environment 0ms)

- eval: E8
  run_id: minted-chong-mat-khoa-byo-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_no_regression
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  4 passed (4)
    Start at  06:24:38
    Duration  201ms (transform 45ms, setup 0ms, import 36ms, tests 74ms, environment 0ms)

- eval: E9
  run_id: minted-chong-mat-khoa-byo-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_aml_config
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  3 passed | 4 skipped (7)
    Start at  06:24:38
    Duration  165ms (transform 57ms, setup 0ms, import 81ms, tests 4ms, environment 0ms)

- eval: E10
  run_id: minted-chong-mat-khoa-byo-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_settings_dialog_503
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  2 passed | 3 skipped (5)
    Start at  06:24:38
    Duration  1.17s (transform 141ms, setup 0ms, import 386ms, tests 121ms, environment 588ms)

- eval: E11
  run_id: minted-chong-mat-khoa-byo-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-08-31T06:28:00+07:00
  screenshot: evidence/E11-step1.png
  observed: |
    Read _acceptance/chong-mat-khoa-byo/evidence/E11-step1.png (900x700 capture, full 520px card visible): dark-theme "Cài đặt" panel. No key-input field anywhere on screen (the form area is entirely replaced by an alert card — no <input> elements). Alert card headed "Không đọc được kho khoá đã lưu" with body text "Chưa có gì bị thay đổi. Các khoá đang lưu vẫn nằm nguyên trên máy, nhưng ứng dụng không giải được nội dung của tệp nên chưa hiện ra được." — clearly legible, states nothing has changed yet. Below it, exactly two buttons: a muted/grey "Lưu" button (visually disabled — desaturated vs. the red button) and a red "Bỏ kho cũ và nhập lại" button. No AlertDialog/confirm overlay is present (state=store-unreadable, not -confirm), so "Bỏ kho cũ và nhập lại" is the only exit-style control on screen. All four assertions match Expected.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-chong-mat-khoa-byo-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_escape_wire
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  3 passed | 2 skipped (5)
    Start at  06:24:38
    Duration  1.26s (transform 147ms, setup 0ms, import 388ms, tests 202ms, environment 583ms)

- eval: E13
  run_id: minted-chong-mat-khoa-byo-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-08-31T06:29:30+07:00
  screenshot: evidence/E13-step1.png
  observed: |
    Mở file evidence/E13-step1.png (Read tool, ảnh) bằng mắt: khung nền chính "Cài đặt" mờ phía sau (dimmed), một AlertDialog nổi lên ở giữa với: (1) tiêu đề "Bỏ toàn bộ kho khoá đang lưu?"; (2) đoạn mô tả "Mọi khoá đang lưu sẽ mất và không khôi phục được. Sau khi bỏ, bạn phải nhập lại từng khoá của từng nhà cung cấp." — nêu rõ CẢ hai ý MẤT và KHÔNG KHÔI PHỤC ĐƯỢC trong cùng một câu, không phải kiểu "bạn có chắc không?" chung chung; (3) hai nút riêng biệt ở footer: "Huỷ" (nút viền, trung tính) và "Bỏ và nhập lại" (nút đỏ/destructive). Đối chiếu Expected: hộp xác nhận nêu đúng hai ý MẤT + KHÔNG KHÔI PHỤC ĐƯỢC, có cả nút Huỷ lẫn nút xác nhận hủy-diệt → khớp, không phải câu "bạn có chắc không?" đơn thuần.
    Đối chiếu thêm với DOM đã hydrate (file .html) đọc bằng Python/grep: xác nhận cùng 4 chuỗi trên nằm bên trong phần tử thật role="alertdialog" (Radix AlertDialog, có aria-labelledby/aria-describedby trỏ đúng tiêu đề/mô tả) — không phải placeholder tĩnh.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-chong-mat-khoa-byo-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_panels_refuse
  verified_at: 2026-08-31T06:24:38+07:00
  output: |
    Tests  10 passed (10)
    Start at  06:24:38
    Duration  1.16s (transform 363ms, setup 0ms, import 918ms, tests 122ms, environment 1.11s)

- eval: E15
  run_id: minted-chong-mat-khoa-byo-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-08-31T06:31:00+07:00
  screenshot: evidence/E15-step1.png
  observed: |
    Đọc trực tiếp file _acceptance/chong-mat-khoa-byo/evidence/E15-step1.png (1024x900, chụp bằng `pnpm ui:capture` sau khi route SSR trả 200): khung "Bảng cấu hình ngay trên node" hiện HAI panel xếp dọc — "Nạp từ kho — cấu hình" (MEDIA_LIBRARY_URL/API_KEY) và "Khoá nhà cung cấp" (ELEVENLABS_API_KEY). Mỗi panel: icon tam giác cảnh báo + dòng chữ đỏ "Không đọc được kho khoá đang lưu nên chưa thể lưu thêm khoá nào." + link gạch chân "Mở Cài đặt để xử lý" (dẫn #settings) + nút "Lưu" ở trạng thái disabled (xám). KHÔNG panel nào có nút "Bỏ kho cũ và nhập lại" hay bất kỳ nút thoát/escape nào — chỉ có link dẫn sang Cài đặt. Khớp Expected: hai panel cùng đạt (cùng câu lỗi, cùng lối sang Cài đặt, đọc được bằng mắt), không nút thoát nào trong panel node.
  network_observed: n-a (driver)

- eval: E16
  run_id: minted-chong-mat-khoa-byo-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_locale_parity
  verified_at: 2026-08-31T06:25:03+07:00
  output: |
    Tests  20 passed (20)
    Start at  06:25:03
    Duration  387ms (transform 129ms, setup 0ms, import 257ms, tests 3ms, environment 0ms)

- eval: E17
  run_id: minted-chong-mat-khoa-byo-E17-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.byo_a11y_proto
  verified_at: 2026-08-31T06:26:00+07:00
  output: |
    FAIL: dev server never served the proto route on port 3198

- eval: E18
  run_id: design-gate-c2627623e9,design-gate-7a7a3dce6d,design-gate-f441d4e0de,design-gate-35d9d87e2d,design-gate-5357340eac,design-gate-217c4a930b
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-31T06:26:58+07:00
  screenshot: evidence/E18/panel-unreadable--dark.design-gate.json
  observed: |
    Read all 6 saved JSON evidence files at _acceptance/chong-mat-khoa-byo/evidence/E18/*.design-gate.json (fresh run, superseding the 05:51 pre-existing copies at .../evidence/E18/*.json which show identical verdicts). Each file: mode "dom", verdict "PASS", exit_code 0, p0_count 0, blocking: [] — matching Expected ("verdict PASS và blocking rỗng trên cả sáu"). hits on every file: cramped-padding, nested-cards, gradient-text — all findings carry severity "warning" and pTier P1/P2 only (no P0 finding anywhere). stderr for each run (19 lines each, all "Could not parse CSS stylesheet") confirms jsdom cannot parse the Tailwind v4 stylesheet, matching Expected's note that this gate runs under jsdom. Target HTML files are 156-161KB each. Separately opened evidence/design-pass/a11y.json (E17's earlier output, timestamped Aug 31 05:50, not regenerated this round): verdict "PASS", blocking 0, violations: [] on all 6 pages — but that file is STALE relative to this round's E17 run, which failed fresh (see E17 block above); AC-14's overall gating depends on E17's fresh result, not this carried file.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-chong-mat-khoa-byo-SUITE-bash_scripts_acceptance_preflight_verify-r2
  exit_code: 0
  verified_at: 2026-08-31T06:23:50+07:00

- cmd: pnpm build && pnpm typecheck
  run_id: minted-chong-mat-khoa-byo-SUITE-build_typecheck-r2
  exit_code: 1
  reason: Build process interrupted during Next.js optimization step. Exit code 144 with incomplete output suggests the tool terminated the command before completion (tool-kill, not a code fault) — cannotRun.
  verified_at: 2026-08-31T06:33:00+07:00
  output: |
    $ next build
       ▲ Next.js 15.5.21
       - Environments: .env
       Creating an optimized production build ...
    (output cut off)

- cmd: pnpm lint:check
  run_id: minted-chong-mat-khoa-byo-SUITE-lint_check-r2
  exit_code: 0
  verified_at: 2026-08-31T06:40:00+07:00

- cmd: pnpm test
  run_id: minted-chong-mat-khoa-byo-SUITE-test-r2
  exit_code: 0
  verified_at: 2026-08-31T06:25:01+07:00

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-chong-mat-khoa-byo-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r2
  exit_code: 0
  verified_at: 2026-08-31T06:41:00+07:00

- cmd: pnpm verify:plugins
  run_id: minted-chong-mat-khoa-byo-SUITE-verify_plugins-r2
  exit_code: 0
  verified_at: 2026-08-31T06:42:30+07:00

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-chong-mat-khoa-byo-SUITE-gen_abi-r2
  exit_code: 0
  verified_at: 2026-08-31T06:43:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay
Không có eval nào được đo baseline ở round này — field `baseline:` của toàn bộ 18 eval và 7 lệnh suite đều ghi "n-a" (evals.yaml không đổi từ lần đo baseline gần nhất; xem báo cáo round đo-baseline gần nhất để biết eval nào phân biệt được với diffBase). Không có eval nào để liệt kê là không-phân-biệt round này vì không có phép đo baseline mới để so sánh.

## Variance

Không có eval nào có runs > 1 ở round này (mọi eval máy/UI đều runs: 1, deterministic) — không áp dụng.

## Iterations

Round 1: Tất cả 18 eval máy/UI (E1–E18) đều PASS (exit 0) và 7 lệnh suite hồi quy đều xanh, nhưng adversarial code review tìm thấy 5 lỗi trong-hợp-đồng ánh xạ AC-9/AC-11/AC-12 (ô nhập khoá ABI báo "khoá không dùng được" kèm mã lỗi thô thay vì trỏ sang Cài đặt; nút thoát ở Cài đặt xoá sạch mọi thẻ khoá thay vì trả về form bình thường; panel media-library hiện "thiếu cấu hình" thay vì phân biệt "kho hỏng" — chi tiết ở review-findings.md § Trong hợp đồng). Verdict tổng REJECT do các lỗi trong-hợp-đồng này, không do eval máy nào đỏ. Trả về implementation để sửa.
Round 2: 17/18 eval máy/UI xanh; E17 (script byo_a11y_proto) đỏ với "FAIL: dev server never served the proto route on port 3198" (exit 1) — đúng là AC-14 giờ trượt vì phần a11y-thật (Chrome + axe-core) không dựng được server proto, khác với E18 (design-gate jsdom, chỉ tham khảo) vốn vẫn PASS. Song song đó, lệnh suite `pnpm build && pnpm typecheck` bị TOOL cắt giữa bước tối ưu hoá Next.js (exit 144, output cụt ở "Creating an optimized production build ...") — đây là BLOCKED theo tool-kill-rule (công cụ hết thời gian/kill, không phải lỗi mã). Verdict tổng round này là BLOCKED: cần re-run lệnh build với timeout công cụ dài hơn để có kết quả build/typecheck thật, VÀ điều tra riêng vì sao dev server của E17 không phục vụ được route proto:3198 trước khi có thể chấm lại vòng kế.
