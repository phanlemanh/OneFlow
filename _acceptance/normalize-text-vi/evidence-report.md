---
schema_version: 2
feature_slug: normalize-text-vi
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dcd74265f617ac1af3b08036be3cde101a9744c0
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
| E16 | AC-15 | judgment | PASS (đề xuất panel — chờ human_override) |
| E18 | AC-16 | script | PASS |

## Evidence

- eval: E1a
  run_id: minted-normalize-text-vi-E1a-r2
  exit_code: 0
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-normalize-text-vi-E2-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_money
  verified_at: 2026-08-22T04:00:00Z
  output: |
    1 passed in 0.05s

- eval: E3
  run_id: minted-normalize-text-vi-E3-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  verified_at: 2026-08-22T04:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E4
  run_id: minted-normalize-text-vi-E4-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  verified_at: 2026-08-22T04:00:00Z
  output: |
    1 passed in 0.04s

- eval: E5
  run_id: minted-normalize-text-vi-E5-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-22T04:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E6a
  run_id: minted-normalize-text-vi-E6a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  verified_at: 2026-08-22T04:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E6b
  run_id: minted-normalize-text-vi-E6b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  verified_at: 2026-08-22T04:00:00Z
  output: |
    Pin found: vietnormalizer==0.2.3
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E7
  run_id: minted-normalize-text-vi-E7-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  verified_at: 2026-08-22T04:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E8
  run_id: minted-normalize-text-vi-E8-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_edges
  verified_at: 2026-08-22T04:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-normalize-text-vi-E9a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_normalize_node
  verified_at: 2026-08-22T04:00:00Z
  output: |
    Tests  3 passed (3)
    Start at  18:09:02
    Duration  1.55s (transform 381ms, setup 0ms, import 814ms, tests 139ms, environment 503ms)

- eval: E9b
  run_id: minted-normalize-text-vi-E9b-r2
  exit_code: 0
  verifier: config:executors.test.unit_normalize_export
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10a
  run_id: minted-normalize-text-vi-E10a-r2
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-normalize-text-vi-E10b-r2
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_compliant
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10c
  run_id: minted-normalize-text-vi-E10c-r2
  exit_code: 0
  verifier: config:executors.test.unit_tts_family_matches_abi
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11a
  run_id: minted-normalize-text-vi-E11a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  verified_at: 2026-08-22T04:00:00Z
  output: |
    ..                                                                       [100%]
    2 passed in 0.18s

- eval: E11b
  run_id: minted-normalize-text-vi-E11b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  verified_at: 2026-08-22T04:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E12a
  run_id: minted-normalize-text-vi-E12a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  verified_at: 2026-08-22T04:00:00Z
  output: |
    .                                                                        [100%]
    1 passed, 7 deselected in 0.22s

- eval: E12b
  run_id: minted-normalize-text-vi-E12b-r2
  exit_code: 0
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-normalize-text-vi-E13-r2
  exit_code: 0
  verifier: config:executors.script.normalize_registration_synced
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E14a
  run_id: minted-normalize-text-vi-E14a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_train_local
  verified_at: 2026-08-22T04:00:00Z
  output: |
    OK: SDK 0.2.23 (hai file khớp) · vietnormalizer==0.2.3 pin chính xác
    EXIT_CODE:0

- eval: E14b
  run_id: minted-normalize-text-vi-E14b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_published
  verified_at: 2026-08-22T04:00:00Z
  output: |
    OK: artifact mang tongflow/text/, models mới và NORMALIZE_TEXT_VI
    OK: vỏ plugin pin oneflow-sdk==0.2.23
    OK: chuyến phát hành đồng bộ cho 0.2.23

- eval: E17a
  run_id: minted-normalize-text-vi-E17a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-22T04:00:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.13s

- eval: E17b
  run_id: minted-normalize-text-vi-E17b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-22T04:00:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.13s

- eval: E15
  run_id: dcd74265f617ac1af3b08036be3cde101a9744c0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.measuring_instruments_refuse
  verified_at: 2026-08-22T04:00:00Z
  screenshot: _acceptance/normalize-text-vi/evidence/design/captures/state-1-idle.png
  observed: |
    state-1-idle.png (1280x900, dark canvas): single React Flow node card titled "Đọc số thành chữ" (spell-check icon), a "Cách triển khai" select showing "api-normalize-text-vi", and a "Đọc thành chữ" button (dimmed/disabled look, consistent with idle/unwired state). Exactly two small handle circles visible, one on the card's left edge and one on the right edge, at the same vertical position — matching in:text (left) / out:text (right). No raw i18n keys visible; all labels are real Vietnamese. state-2-wired.png (1280x900): same normalize card plus an upstream source node reading "Giá 1.999.000đ ngày 19/8/2026" connected by a curved wire into the card's left (in:text) handle; the "Đọc thành chữ" button now renders in an active/enabled (light) style; a third handle circle sits on the source node's right edge (its out:textNode), and the card itself still shows exactly two handles (in:text, out:text). Both frames are desktop-framed (1280x900), not the 390x844 mobile default the wf-label calls out as a past failure mode. Live-DOM cross-check in the browser (same URL, cookie NEXT_LOCALE=vi) confirmed document.documentElement.lang === "vi", data-proto-state === "wired" on ?state=wired, and the proto-normalize node's data-handleid set is exactly ["in:text","out:text"] (a third handle, out:textNode, belongs to the separate upstream fixture "src" node, not the node under test). Console errors: none (onlyErrors filter returned "No console logs."); only a benign React Flow sizing warning and app debug logs were present at warn/info/log level. E15-network.txt captured 12 requests, all to the app origin (localhost:3000), all 200 OK, no third-party or failed calls.
  network_observed: clean

- eval: E16
  judged_by: judge panel (fresh context, 3 lens: domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS (đề xuất panel)
  rationale: Cả ba lens đồng thuận PASS trên phạm vi đã thu hẹp (vế "so với node transfer khác" của AC-15 đã dời sang checklist Cổng 2 của owner theo amendment 2026-08-21, không thuộc eval này nữa). Đề xuất chỉ có giá trị tham khảo — vẫn cần human_override ở Gate 2 trước khi verdict tổng thể chuyển PASS.
  votes:
    - domain-correctness: PASS — Cả hai ảnh cho thấy node đúng khuôn AbiNodeShell: header tối có icon (chữ A + dấu tick) + tiêu đề "Đọc số thành chữ" + icon hamburger, thân card chứa nhãn "Cách triển khai" và dropdown chọn plugin (icon A + "api-normalize-text-vi" + chevron), nút hành động full-width "Đọc thành chữ" có icon đũa phép, toàn bộ nhãn tiếng Việt có dấu hiển thị rõ ràng không vỡ font. Ở state-2-wired thấy đủ hai handle (chấm tròn trái = in:text nối dây cong từ node nguồn, chấm tròn phải = out:text) đúng vị trí hai bên node, spacing/bo góc/màu nền nhất quán với ngôn ngữ thiết kế workspace nhìn thấy trên chính hai ảnh này.
    - operational-feasibility: PASS — Cả hai ảnh cho thấy node theo đúng khuôn AbiNodeShell: header có icon "A✓" + tiêu đề "Đọc số thành chữ" tiếng Việt rõ nghĩa, icon hamburger góc phải, khối "Cách triển khai" với dropdown chọn plugin, nút hành động "Đọc thành chữ" có icon + nhãn tiếng Việt rõ ràng, và hai handle (chấm tròn trái/phải) hiện diện ở cả hai state khớp vị trí in/out. Spacing, bo góc, độ tương phản chữ/nền nhất quán giữa state idle và wired, không có phần tử nào bị vỡ layout, tràn khung hay che khuất nhãn trên chính hai ảnh này.
    - spec-alignment: PASS — Cả hai ảnh cho thấy node theo đúng khuôn AbiNodeShell: header có icon + tiêu đề "Đọc số thành chữ" + icon menu hamburger, thân card có ô chọn "Cách triển khai" dạng dropdown (badge A + tên plugin), nút hành động full-width có icon + nhãn "Đọc thành chữ" — chữ tiếng Việt đủ dấu, đọc được, không tràn khung. Hai handle tròn xuất hiện đối xứng ở mép trái/phải node, cùng vị trí dọc ở cả hai state (idle: cả hai rỗng; wired: handle trái nối vào node nguồn qua edge, handle phải vẫn rỗng) — đúng mô hình một in/một out. Nút chuyển từ xám mờ (idle, chưa có input) sang sáng/rõ (wired) là một affordance trạng thái hợp lý, không phải lỗi vỡ khuôn. Không thấy gì phá ngôn ngữ thiết kế (bo góc, khoảng cách, phân lớp card-trong-card) trên chính hai ảnh này.
  human_override:

- eval: E18
  run_id: minted-normalize-text-vi-E18-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.measuring_instruments_refuse
  verified_at: 2026-08-22T04:00:00Z
  output: |
    OK: lượt chụp từ chối sai ngôn ngữ và xoá khung cũ · executor dùng chung báo lỗi pin đọc được

## Analyst

carried tu round 2 — baseline khong do lai round nay

- E1a — xanh trên cả HEAD lẫn diffBase (gen:abi + git diff --exit-code là guard đứng yên, không phụ thuộc thay đổi của feature này); giữ nguyên vì đây là regression-guard cho đường sinh mã ABI, không phải phép đo hành vi mới.
- E1b — cùng lý do: chạy lại gen_models.py/gen_node_slots.py rồi diff sạch là bất biến đúng cả trước và sau feature; guard hạ tầng, không discriminating.
- E12b — nửa TS của conformance suite xanh cả hai phía vì fixture conformance là input cố định cho executor — bản thân assertion đối chiếu số lời gọi không đổi theo sự có/không của feature riêng lẻ này trên baseline đã có sẵn khung conformance.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: S4-r2 — sửa 6/7 finding bắn hai (luật colon thu hẹp, mỏ neo dương, phép đo tự chạy); 1 finding còn lại dời sang known-limits, contract sang verified.
Round 5: 25 eval máy PASS + E16 (judgment) chờ người — panel UNCERTAIN vì thiếu ảnh đối chứng ở hai vòng đầu; verdict PENDING-JUDGMENT.
Round 6 (hiện tại): owner nâng phạm vi Cổng 2 cho E5 (khoảng có hậu tố đơn vị %, giá viết cách) — hai lỗi đọc owner nêu đã vá; toàn bộ 20 eval máy của round này xanh lại, 6 eval carry-forward giữ nguyên từ round 2, E16 panel đề xuất PASS trên phạm vi đã thu hẹp (vế so-sánh dời sang checklist Cổng 2) — verdict vẫn PENDING-JUDGMENT chờ human_override.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
