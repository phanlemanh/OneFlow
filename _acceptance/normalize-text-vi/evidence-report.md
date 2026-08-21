---
schema_version: 2
feature_slug: normalize-text-vi
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7e0d71c63e57f4c02e60341480c0fb26b7dbd809
human_signoff:
---

# Evidence Report: normalize-text-vi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1a | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6a | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9a | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10a | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10c | AC-10 | test | PASS |
| E11a | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |
| E12a | AC-12 | test | PASS |
| E12b | AC-12 | test | PASS |
| E13 | AC-13 | script | PASS |
| E14a | AC-13 | script | PASS |
| E14b | AC-13 | script | PASS |
| E17a | AC-14 | script | PASS |
| E17b | AC-14 | script | PASS |
| E15 | AC-15 | ui-check | PASS |
| E16 | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1a
  run_id: minted-normalize-text-vi-E1a-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json
    Exit code: 0

- eval: E1b
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    ++ git status --porcelain --untracked-files=all sdk/tongflow/models sdk/tongflow/node_slots.py
    + untracked=
    + '[' -n '' ']'

- eval: E2
  run_id: minted-normalize-text-vi-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_money
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    1 passed in 0.05s

- eval: E3
  run_id: minted-normalize-text-vi-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E4
  run_id: minted-normalize-text-vi-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E5
  run_id: minted-normalize-text-vi-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E6a
  run_id: minted-normalize-text-vi-E6a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    1 passed in 0.04s

- eval: E6b
  run_id: minted-normalize-text-vi-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E7
  run_id: minted-normalize-text-vi-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E8
  run_id: minted-normalize-text-vi-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_edges
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-normalize-text-vi-E9a-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_normalize_node
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    Tests  3 passed (3)
    Start at  09:55:58
    Duration  890ms (transform 207ms, setup 0ms, import 437ms, tests 122ms, environment 260ms)

- eval: E9b
  run_id: minted-normalize-text-vi-E9b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_normalize_export
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    Tests  2 passed (2)
    Start at  09:56:14
    Duration  303ms (transform 172ms, setup 0ms, import 218ms, tests 4ms, environment 0ms)

- eval: E10a
  run_id: minted-normalize-text-vi-E10a-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    Tests  5 passed | 10 skipped (15)
    Start at  09:56:14
    Duration  310ms (transform 177ms, setup 0ms, import 223ms, tests 6ms, environment 0ms)

- eval: E10b
  run_id: minted-normalize-text-vi-E10b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_tts_order_compliant
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    Tests  8 passed | 7 skipped (15)
    Start at  09:56:14
    Duration  196ms (transform 81ms, setup 0ms, import 119ms, tests 5ms, environment 0ms)

- eval: E10c
  run_id: minted-normalize-text-vi-E10c-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_tts_family_matches_abi
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    Tests  2 passed | 13 skipped (15)
    Start at  09:56:14
    Duration  309ms (transform 176ms, setup 0ms, import 223ms, tests 2ms, environment 0ms)

- eval: E11a
  run_id: minted-normalize-text-vi-E11a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    ..                                                                       [100%]
    2 passed in 0.04s

- eval: E11b
  run_id: minted-normalize-text-vi-E11b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E12a
  run_id: minted-normalize-text-vi-E12a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    1 passed, 7 deselected in 0.17s

- eval: E12b
  run_id: minted-normalize-text-vi-E12b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    Tests  13 passed (13)
    Start at  09:56:17
    Duration  147ms (transform 58ms, setup 0ms, import 76ms, tests 3ms, environment 0ms)

- eval: E13
  run_id: minted-normalize-text-vi-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_registration_synced
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    OK: manifest + 3 README (danh sách & hàng ma trận) + 5 locale đều đồng bộ

- eval: E14a
  run_id: minted-normalize-text-vi-E14a-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_sdk_train_local
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    OK: SDK 0.2.20 (hai file khớp) · vietnormalizer==0.2.3 pin chính xác

- eval: E14b
  run_id: minted-normalize-text-vi-E14b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_sdk_published
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    OK: artifact mang tongflow/text/, models mới và NORMALIZE_TEXT_VI
    OK: vỏ plugin pin oneflow-sdk==0.2.20
    OK: chuyến phát hành đồng bộ cho 0.2.20

- eval: E17a
  run_id: minted-normalize-text-vi-E17a-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    ...                                                                      [100%]
    3 passed in 0.09s
    EXIT_CODE=0

- eval: E17b
  run_id: minted-normalize-text-vi-E17b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-21T09:56:40+07:00
  output: |
    ...                                                                      [100%]
    3 passed in 0.09s
    EXIT_CODE=0

- eval: E15
  run_id: design-gate-1e45bb5d2e
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check.normalize_node_states
  verified_at: 2026-08-21T09:56:40+07:00
  screenshot: evidence/design/captures/state-1-idle.png
  observed: |
    state-1-idle.png (Read, 1280x900): dark-theme React Flow canvas, one AbiNodeShell card titled "Đọc số thành chữ" (readable Vietnamese header text, not a raw i18n key). Body shows a "Cách triển khai" field with dropdown value "api-normalize-text-vi", and a muted/inactive-styled button reading "Đọc thành chữ" with a wand icon — matches idle expectation (no upstream connection, subdued button). state-2-wired.png (Read, 1280x900): identical node card/title/fields, button now rendered with the enabled (lighter) style, and a light rectangular bar is visible above/behind the node representing a connected upstream text source partially occluded by the node — consistent with the wired state (an incoming edge feeding in:text). Both frames match Expected: real AbiNodeShell node, Vietnamese labels legible, no raw i18n keys visible.
  network_observed: clean
  output: |
    Overall: both capture frames exist and are proven to be from this tree (origin-checked, lang=vi, correct data-proto-state before save); P0 design gate green on both; console clean both states; two correct handles present; Vietnamese labels legible. exitCode=0.
    Caveat to flag: the eval step 1 instruction references an "invokedSha của vòng" to diff HEAD against, but no such value was included anywhere in the task/eval payload delivered to this subagent — verified via git-diff-stat equivalence on the eval's scoped paths instead of a literal sha match, as documented above.

<!-- <<<JUDGMENT-BLOCK-TEMPLATE -->
- eval: E16
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  rationale: |
    - domain-correctness: UNCERTAIN — Hai capture chỉ cho thấy node normalize-text-vi (idle và wired) dùng khung AbiNodeShell — header đậm có icon+tiêu đề+menu hamburger, dropdown "Cách triển khai", nút chính có icon — nhưng câu hỏi yêu cầu SO SÁNH với capture thực tế của denoise-audio và remove-subtitle, những file đó không có trong danh sách Input được cấp cho tôi. Không có ảnh đối chứng, tôi không thể xác nhận hay bác bỏ việc node này "nhìn như người nhà" so với hai node kia.
    - operational-feasibility: UNCERTAIN — Câu hỏi yêu cầu so sánh trực tiếp normalize-text-vi với hai node tham chiếu denoise-audio và remove-subtitle, nhưng danh sách Input chỉ cấp 2 capture của chính normalize-text-vi (idle + wired), không có capture nào của denoise-audio hay remove-subtitle để đối chiếu. Không thể kết luận "giống người nhà" hay "phá ngôn ngữ thiết kế" khi thiếu vế so sánh bắt buộc của câu hỏi.
    - spec-alignment: UNCERTAIN — Hai capture chỉ cho thấy chính node normalize-text-vi (shell tối, icon "A" + tiêu đề "Đọc số thành chữ", menu hamburger, dropdown "Cách triển khai", nút "Đọc thành chữ") ở trạng thái idle và wired — nội bộ node có vẻ nhất quán (spacing, icon, nút đều hợp khuôn AbiNodeShell điển hình). Nhưng câu hỏi yêu cầu so sánh trực tiếp với denoise-audio và remove-subtitle, và không capture nào của hai node đó nằm trong danh sách Input được phép đọc, nên không có căn cứ để khẳng định "nhìn như người nhà" hay chỉ ra điểm phá ngôn ngữ thiết kế so với chuẩn thực tế của hai node kia.
  required_evidence:
    - Capture PNG của node denoise-audio ở trạng thái idle (và wired nếu có) trong cùng thư mục evidence/design/captures/, để đặt cạnh state-1-idle.png/state-2-wired.png của normalize-text-vi và so sánh trực tiếp shell/spacing/icon/nhãn nút
    - Capture PNG tương tự của node remove-subtitle (idle/wired) — cùng workspace, cùng zoom level — làm đối chứng thứ hai cho cùng phép so sánh
    - Capture ảnh (cùng khuôn AbiNodeShell, cùng state idle) của node denoise-audio để đối chiếu shell/header/spacing/icon với normalize-text-vi
    - Capture ảnh tương tự của node remove-subtitle ở state idle để đối chiếu nhãn nút và bố cục dropdown
    - Nếu hai capture tham chiếu này được bổ sung vào danh sách Input của chính eval E16 này (không phải do agent tự tìm), verdict có thể chuyển PASS hoặc FAIL dựa trên so sánh trực tiếp
  human_override:
<!-- JUDGMENT-BLOCK-TEMPLATE>>> -->

## Analyst

Eval xanh trên CẢ HEAD lẫn baseline (non-discriminating — chứng minh harness/generator-clean, không chứng minh feature; giữ nguyên vì đúng bản chất regression-guard sinh mã, không cần viết lại):

- E1a (`pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`) — kiểm tra generator ABI-clean, xanh cả trước và sau feature vì generator vốn idempotent trên cây sạch.
- E1b (`bash scripts/abi/check-python-gen-clean.sh`) — cùng lý do, kiểm generator Python-clean.
- E12b (`pnpm vitest run src/lib/abi/conformance.test.ts`) — 13 test cũ trong suite conformance TS xanh trên cả hai phía; phần mới cho normalize-text-vi nằm trong E9a/E9b/E12a, không nằm trong file này.

## Variance

none — không có eval nào trong vòng này có runs > 1 (toàn bộ deterministic, chạy 1 lần).

## Iterations

Round 1: các lỗ đo được ghi nhận và vá trong S4-r1 — hố NFD của luật tiền trong E8 (chỉ so `.text` bỏ lọt `.ok`/`has_money` lệch dạng), nửa đọc của E9a (đăng ký node đo bằng hằng thay vì đọc lại registry), và E11b (quan hệ TIER_A_SLOTS ⊆ ABI đo ở executor không được chọn) — trả về implementation.
Round 2 (vòng này): các lỗ còn lại từ S4-r2 được vá — quan hệ has_money có mỏ neo dương độc lập trong E6b, predicate không còn rỗng-hoá được; E11b có test riêng `_and_in_abi`; E13 đo cấu trúc README bằng awk đoạn-giữa-heading; E10a bỏ prose i18n sang đo tất định ở E13; E14b tự dựng cặp wheel giả lành/thiếu trong script; E17a pin vietnormalizer derive từ pyproject. Toàn bộ 24 eval máy + E15 (ui-check) PASS; E16 (judgment thiết kế so-sánh-đối-chứng) UNCERTAIN vì panel không được cấp capture của denoise-audio/remove-subtitle để so sánh — verdict tổng PENDING-JUDGMENT.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
