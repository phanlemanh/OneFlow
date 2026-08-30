---
schema_version: 2
feature_slug: chong-mat-khoa-byo
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f1f5b3c66d3aa443d522fde97bf471df71cf5b67
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
| E17 | AC-14 | script | PASS |
| E18 | AC-14 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-chong-mat-khoa-byo-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_seam
  verified_at: 2026-08-31T05:49:49+07:00
  output: |
    Tests  3 passed | 13 skipped (16)
    Start at  05:49:49
    Duration  216ms (transform 52ms, setup 0ms, import 62ms, tests 29ms, environment 0ms)

- eval: E2
  run_id: minted-chong-mat-khoa-byo-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_read_ok_absent
  verified_at: 2026-08-31T05:49:47+07:00
  output: |
    Tests  2 passed | 14 skipped (16)
    Start at  05:49:47
    Duration  1.68s (transform 879ms, setup 0ms, import 276ms, tests 763ms, environment 0ms)

- eval: E3
  run_id: minted-chong-mat-khoa-byo-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_read_unreadable
  verified_at: 2026-08-31T05:49:48+07:00
  output: |
    Tests  6 passed | 10 skipped (16)
    Start at  05:49:48
    Duration  354ms (transform 143ms, setup 0ms, import 45ms, tests 135ms, environment 0ms)

- eval: E4
  run_id: minted-chong-mat-khoa-byo-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_load_tolerant
  verified_at: 2026-08-31T05:49:49+07:00
  output: |
    Tests  5 passed | 11 skipped (16)
    Start at  05:49:49
    Duration  278ms (transform 131ms, setup 0ms, import 33ms, tests 154ms, environment 0ms)

- eval: E5
  run_id: minted-chong-mat-khoa-byo-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_get
  verified_at: 2026-08-31T05:49:48+07:00
  output: |
    Tests  2 passed | 3 skipped (5)
    Start at  05:49:48
    Duration  388ms (transform 151ms, setup 0ms, import 51ms, tests 163ms, environment 0ms)

- eval: E6
  run_id: minted-chong-mat-khoa-byo-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_put_refuse
  verified_at: 2026-08-31T05:49:46+07:00
  output: |
    Tests  1 passed | 4 skipped (5)
    Start at  05:49:46
    Duration  1.48s (transform 857ms, setup 0ms, import 393ms, tests 793ms, environment 0ms)

- eval: E7
  run_id: minted-chong-mat-khoa-byo-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_put_force
  verified_at: 2026-08-31T05:49:49+07:00
  output: |
    Tests  2 passed | 3 skipped (5)
    Start at  05:49:49
    Duration  389ms (transform 121ms, setup 0ms, import 40ms, tests 166ms, environment 0ms)

- eval: E8
  run_id: minted-chong-mat-khoa-byo-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_route_no_regression
  verified_at: 2026-08-31T05:49:49+07:00
  output: |
    Tests  4 passed (4)
    Start at  05:49:49
    Duration  226ms (transform 31ms, setup 0ms, import 26ms, tests 47ms, environment 0ms)

- eval: E9
  run_id: minted-chong-mat-khoa-byo-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_aml_config
  verified_at: 2026-08-31T05:49:48+07:00
  output: |
    Tests  3 passed | 4 skipped (7)
    Start at  05:49:48
    Duration  201ms (transform 25ms, setup 0ms, import 39ms, tests 10ms, environment 0ms)

- eval: E10
  run_id: minted-chong-mat-khoa-byo-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_settings_dialog_503
  verified_at: 2026-08-31T05:49:49+07:00
  output: |
    Tests  2 passed | 2 skipped (4)
    Start at  05:49:49
    Duration  902ms (transform 106ms, setup 0ms, import 321ms, tests 119ms, environment 368ms)

- eval: E11
  run_id: minted-chong-mat-khoa-byo-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-08-31T05:52:00+07:00
  screenshot: evidence/E11-step1.png
  observed: |
    Opened Read tool on _acceptance/chong-mat-khoa-byo/evidence/E11-step1.png (the only frame from steps). Image shows: a card titled "Cài đặt" (Settings) with a key icon in the header. Below it a red-bordered alert panel with a warning triangle icon and heading "Không đọc được kho khoá đã lưu", followed by two lines of body text starting "Chưa có gì bị thay đổi. Các khoá đang lưu vẫn nằm nguyên [trên] máy, nhưng ứng dụng không giải được nội d[ung] ... chưa hiện ra được." (text wraps/truncates at the 390px capture width but is legible and matches the reassurance copy verbatim). A technical-reason line "Lý do kỹ thuật: settings.json — không giải mã được nội dung (decode)" is present under it. No text input or password field of any kind appears anywhere on the frame. Below the alert panel there are exactly two buttons: a grey "Lưu" (Save) button with a visibly dimmed/disabled look, and a red destructive button whose label is cut off by the capture width but reads "B..." — confirmed via the underlying HTML as "Bỏ kho cũ và nhập lại" (the single escape/exit action). No second exit control, no close/X icon, no Cancel button is visible anywhere in the frame.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-chong-mat-khoa-byo-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_escape_wire
  verified_at: 2026-08-31T05:49:49+07:00
  output: |
    Tests  2 passed | 2 skipped (4)
    Start at  05:49:49
    Duration  1.18s (transform 107ms, setup 0ms, import 340ms, tests 154ms, environment 534ms)

- eval: E13
  run_id: minted-chong-mat-khoa-byo-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-08-31T05:52:30+07:00
  screenshot: evidence/E13-step1.png
  observed: |
    Đọc trực tiếp _acceptance/chong-mat-khoa-byo/evidence/E13-step1.png (390x844, chụp qua pnpm ui:capture/puppeteer sau khi curl xác nhận route trả 200): frame vẽ đúng state=store-unreadable-confirm — phía sau là panel lỗi "Không đọc được kho khoá đã lưu" mờ đi, phía trước là AlertDialog che kín. Tiêu đề hộp: "Bỏ toàn bộ kho khoá đang lưu?". Thân hộp đọc được rõ ràng bằng mắt: "Mọi khoá đang lưu sẽ mất và không khôi phục được. Sau khi bỏ, bạn phải nhập lại từng khoá của từng nhà cung cấp." — câu này nêu đúng hai ý bắt buộc (mất + không khôi phục được), không phải câu chung chung "bạn có chắc không?". Hai nút xếp dọc: nút trên "Bỏ và nhập lại" tô nền đỏ/destructive (đúng buttonVariants({variant:"destructive"}) theo source), nút dưới "Huỷ" viền xám trung tính — đúng cặp Huỷ + xác nhận, và nút xác nhận mang lối huỷ-diệt (đỏ) như expected đòi hỏi.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-chong-mat-khoa-byo-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_panels_refuse
  verified_at: 2026-08-31T05:49:50+07:00
  output: |
    Tests  6 passed (6)
    Start at  05:49:50
    Duration  794ms (transform 248ms, setup 0ms, import 547ms, tests 87ms, environment 511ms)

- eval: E15
  run_id: E15
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-08-31T05:53:00+07:00
  screenshot: evidence/E15-step1.png
  observed: |
    Frame _acceptance/chong-mat-khoa-byo/evidence/E15-step1.png (opened and viewed via Read): dark-theme page titled "Bảng cấu hình ngay trên node" containing two stacked panel cards. Panel 1 "Nạp từ kho — cấu hình" (media-library-config-panel proxy): shows disabled MEDIA_LIBRARY_URL and MEDIA_LIBRARY_API_KEY inputs, then a red warning-triangle alert block with the text "Không đọc được kho khoá đang lưu nên chưa thể lưu thêm khoá nào." followed by an underlined link "Mở Cài đặt để xử lý" (Settings), then a disabled grey "Lưu" (Save) button. No other button is present in this panel. Panel 2 "Khoá nhà cung cấp" (abi-node-shell proxy): identical structure — disabled ELEVENLABS_API_KEY input, the same red error text + "Mở Cài đặt để xử lý" link, disabled "Lưu" button, and no other button. Both error blocks are high-contrast red-on-dark text with a warning icon, clearly legible by eye. Neither panel contains any "Bỏ kho cũ" (discard-old-store) or other escape/exit control. This matches Expected: both panels fail identically with a readable error + link to Settings, and no exit/discard button appears in either node panel (decision 3 reserves that control to the Settings screen only).
  network_observed: n-a (driver)

- eval: E16
  run_id: minted-chong-mat-khoa-byo-E16-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_byo_locale_parity
  verified_at: 2026-08-31T05:50:11+07:00
  output: |
    Tests  20 passed (20)
    Start at  05:50:11
    Duration  350ms (transform 75ms, setup 0ms, import 242ms, tests 8ms, environment 0ms)

- eval: E17
  run_id: minted-chong-mat-khoa-byo-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.byo_a11y_proto
  verified_at: 2026-08-31T05:50:12+07:00
  output: |
    "blocking": 0,
    "verdict": "PASS"
    }

- eval: E18
  run_id: design-gate-multi-6files-2026-08-31
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-31T05:55:00+07:00
  screenshot: evidence/design-pass/panel-unreadable--dark.html
  observed: |
    Đã tự mở _acceptance/chong-mat-khoa-byo/evidence/design-pass/panel-unreadable--dark.png bằng Read (trường observed từ kết quả máy để trống). Ảnh nền đen tuyền chứa một card tối "Bảng cấu hình ngay trên node" với icon chìa khoá, bên trong xếp dọc hai panel con cùng khuôn: tiêu đề trắng, hai input viền mảnh bị vô hiệu hoá (MEDIA_LIBRARY_URL/API_KEY, ELEVENLABS_API_KEY), một khối cảnh báo đỏ có icon tam giác + câu "Không đọc được kho khoá đang lưu…" + link gạch chân "Mở Cài đặt để xử lý", và một nút "Lưu" xám mờ (disabled). Không thấy padding chật, không thẻ lồng thẻ kiểu card-trong-card, không chữ nào tô gradient — ba luật p0 (cramped-padding, nested-cards, gradient-text) của E18 không xuất hiện trên khung này; khớp verdict PASS/blocking rỗng mà máy báo. (Lưu ý ràng buộc tính điểm: AC-14 vẫn phụ thuộc trạng thái E17, không chỉ E18 — xem outputTail gốc của E18.)
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-chong-mat-khoa-byo-SUITE-bash_scripts_acceptance_preflight_verify-r1
  exit_code: 0
  verified_at: 2026-08-31T05:49:30+07:00

- cmd: pnpm build && pnpm typecheck
  run_id: minted-chong-mat-khoa-byo-SUITE-build_typecheck-r1
  exit_code: 0
  verified_at: 2026-08-31T05:49:35+07:00

- cmd: pnpm lint:check
  run_id: minted-chong-mat-khoa-byo-SUITE-lint_check-r1
  exit_code: 0
  verified_at: 2026-08-31T05:50:05+07:00

- cmd: pnpm test
  run_id: minted-chong-mat-khoa-byo-SUITE-test-r1
  exit_code: 0
  verified_at: 2026-08-31T05:50:10+07:00

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-chong-mat-khoa-byo-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r1
  exit_code: 0
  verified_at: 2026-08-31T05:51:20+07:00

- cmd: pnpm verify:plugins
  run_id: minted-chong-mat-khoa-byo-SUITE-verify_plugins-r1
  exit_code: 0
  verified_at: 2026-08-31T05:52:35+07:00

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-chong-mat-khoa-byo-SUITE-gen_abi-r1
  exit_code: 0
  verified_at: 2026-08-31T05:52:45+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay
Không đo được ở round này (baseline: n-a trên toàn bộ 18 eval + 7 lệnh suite) — round trước đó là lần đo baseline gần nhất; xem báo cáo round baseline đó để biết eval nào phân biệt được với diffBase.

## Variance

Không có eval nào có runs > 1 ở round này — không áp dụng.

## Iterations

Round 1: Tất cả 18 eval máy/UI (E1–E18) đều PASS (exit 0) và 7 lệnh suite hồi quy đều xanh, nhưng adversarial code review tìm thấy 5 lỗi trong-hợp-đồng ánh xạ AC-9/AC-11/AC-12 (ô nhập khoá ABI báo "khoá không dùng được" kèm mã lỗi thô thay vì trỏ sang Cài đặt; nút thoát ở Cài đặt xoá sạch mọi thẻ khoá thay vì trả về form bình thường; panel media-library hiện "thiếu cấu hình" thay vì phân biệt "kho hỏng" — chi tiết ở review-findings.md § Trong hợp đồng). Verdict tổng REJECT do các lỗi trong-hợp-đồng này, không do eval máy nào đỏ. Trả về implementation để sửa.