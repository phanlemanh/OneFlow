---
schema_version: 2
feature_slug: normalize-text-vi
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8d3ac86bfcaaa163210d76951de69878dbc5c3bd
human_signoff:
---

# Evidence Report: normalize-text-vi

⚠ REJECT không phải vì lệnh máy đỏ: 25 eval máy + E16 (panel judgment) đều PASS trong vòng này (round 5). REJECT vì review-findings.md phát hiện 2 finding **Trong hợp đồng** mức severity high (AC-6, AC-9) — cả hai đều là dạng "phép đo không đo đúng thứ nó tên", mà mục "Luật dừng vòng verify" của chính hợp đồng xếp loại này vào diện phải sửa NGAY trong vòng, không phải mở hồ sơ follow-up. Xem `review-findings.md` mục "## Trong hợp đồng" để biết chi tiết hai finding.

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
| E15 | AC-15 | ui-check | PASS |
| E16 | AC-15 | judgment | PASS |
| E17a | AC-14 | script | PASS |
| E17b | AC-14 | script | PASS |

## Evidence

- eval: E1a
  run_id: minted-normalize-text-vi-E1a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-normalize-text-vi-E2-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_money
  verified_at: 2026-08-21T14:41:53Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E3
  run_id: minted-normalize-text-vi-E3-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  verified_at: 2026-08-21T14:41:53Z
  output: |
    1 passed in 0.04s

- eval: E4
  run_id: minted-normalize-text-vi-E4-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  verified_at: 2026-08-21T14:41:53Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E5
  run_id: minted-normalize-text-vi-E5-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-21T14:41:53Z
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E6a
  run_id: minted-normalize-text-vi-E6a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  verified_at: 2026-08-21T14:41:53Z
  output: |
    .                                                                        [100%]
    1 passed in 0.12s

- eval: E6b
  run_id: minted-normalize-text-vi-E6b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  verified_at: 2026-08-21T14:41:53Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7
  run_id: minted-normalize-text-vi-E7-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  verified_at: 2026-08-21T14:41:53Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E8
  run_id: minted-normalize-text-vi-E8-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_edges
  verified_at: 2026-08-21T14:41:53Z
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-normalize-text-vi-E9a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_normalize_node
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-normalize-text-vi-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_normalize_export
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10a
  run_id: minted-normalize-text-vi-E10a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-normalize-text-vi-E10b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_order_compliant
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10c
  run_id: minted-normalize-text-vi-E10c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_family_matches_abi
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11a
  run_id: minted-normalize-text-vi-E11a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  verified_at: 2026-08-21T14:41:53Z
  output: |
    ..                                                                       [100%]
    2 passed in 0.22s

- eval: E11b
  run_id: minted-normalize-text-vi-E11b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  verified_at: 2026-08-21T14:41:53Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E12a
  run_id: minted-normalize-text-vi-E12a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  verified_at: 2026-08-21T14:41:53Z
  output: |
    .                                                                        [100%]
    1 passed, 7 deselected in 0.17s

- eval: E12b
  run_id: minted-normalize-text-vi-E12b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-normalize-text-vi-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_registration_synced
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E14a
  run_id: minted-normalize-text-vi-E14a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_train_local
  verified_at: 2026-08-21T14:41:53Z
  output: |
    OK: SDK 0.2.23 (hai file khớp) · vietnormalizer==0.2.3 pin chính xác

- eval: E14b
  run_id: minted-normalize-text-vi-E14b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_published
  verified_at: 2026-08-21T14:41:53Z
  output: |
    OK: artifact mang tongflow/text/, models mới và NORMALIZE_TEXT_VI
    OK: vỏ plugin pin oneflow-sdk==0.2.23
    OK: chuyến phát hành đồng bộ cho 0.2.23

- eval: E15
  run_id: minted-normalize-text-vi-E15-r5
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-21T14:55:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/normalize-text-vi/evidence/design/captures/state-1-idle.png
  observed: |
    state-1-idle.png (1280x900, opened by Read): single node card "Đọc số thành chữ" trên canvas React Flow nền đen, hàng chọn plugin "Cách triển khai / api-normalize-text-vi", nút "Đọc thành chữ" có icon đũa phép. Hai handle tròn rỗng ở cạnh trái/phải card (khớp DOM data-handleid=[in:text, out:text] đọc từ trang sống) — không có dây vào, khớp trạng thái idle/chưa nối. Toàn bộ chữ là tiếng Việt thật, không thấy i18n key thô (kiểu "node.xxx.label") ở bất kỳ đâu. Khớp Expected cho state 1.
    state-2-wired.png (1280x900, opened by Read): cùng node card, giờ có dây cong đi vào handle trái in:text từ node fixture thượng nguồn bên trái hiện chữ mờ "Giá 1.999.000đ ngày 19/8/2026". Handle out:text bên phải của chính node vẫn chưa nối. Nội dung card giống hệt idle (tiêu đề, chọn plugin, nút), xác nhận dây nối là khác biệt duy nhất — khớp Expected cho state 2/"wired". Không thấy hiện tượng bóp viewport mobile (canvas desktop rộng 1280 đầy đủ, handle và dây rõ ràng) — đúng lỗi hai vòng UNCERTAIN trước đó từng gặp.
  network_observed: clean

<!-- <<<JUDGMENT-BLOCK-TEMPLATE -->
- eval: E16
  judged_by: judge panel (fresh context) — lens domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  votes:
    - domain-correctness: PASS — Cả hai ảnh cho thấy node normalize-text-vi đúng khuôn AbiNodeShell: header có icon "A✓" + tiêu đề đậm "Đọc số thành chữ" + menu hamburger phải, panel "Cách triển khai" với dropdown "api-normalize-text-vi" có icon avatar, nút hành động "✨ Đọc thành chữ" — nhãn tiếng Việt đọc được rõ, dấu hiển thị đúng (Đọc, chữ, triển khai). Hai handle (trái/phải, cùng cao độ, một nối một chưa nối ở ảnh wired) khớp mẫu 1 input/1 output; spacing giữa header-panel-nút và trạng thái nút muted(idle)/active(wired) nhất quán, không thấy chữ tràn, chồng lấn hay icon lệch phá ngôn ngữ thiết kế trên hai ảnh này.
    - operational-feasibility: PASS — Trên cả hai ảnh, node normalize-text-vi hợp khuôn AbiNodeShell: header đúng bố cục icon + tiêu đề + menu hamburger, thân card có panel "Cách triển khai" với dropdown chọn plugin, footer là nút hành động "Đọc thành chữ" có icon; spacing giữa các khối đều đặn, nhãn tiếng Việt (kể cả dấu) hiển thị rõ, không vỡ chữ. Hai handle tròn xuất hiện đối xứng hai bên node ở cùng một vị trí dọc trong cả state idle và state wired (dây nối chạm đúng handle trái khi wired) — khớp mô tả in:text/out:text, không có gì trên chính node này phá ngôn ngữ thiết kế workspace nhìn thấy được.
    - spec-alignment: PASS — Cả hai ảnh cho thấy node đúng khuôn AbiNodeShell: header tối có icon "A✓" + tiêu đề "Đọc số thành chữ" tiếng Việt rõ dấu, menu hamburger góc phải, thân card chứa nhãn "Cách triển khai" + dropdown "api-normalize-text-vi", nút hành động "Đọc thành chữ" có icon, bo góc và khoảng cách nhất quán giữa hai state. Hai handle tròn (trái/phải) xuất hiện ở cùng độ cao tại cả hai ảnh, và ở state-2 handle trái nhận đúng một cạnh nối tới node nguồn — không có gì lệch khỏi ngôn ngữ thiết kế nhìn thấy trên hai ảnh này.
  rationale: Cả ba lens đồng thuận PASS dựa trên hai capture của E15 (idle + wired) — node hợp khuôn AbiNodeShell, handle/nhãn khớp ABI, không thấy gì phá ngôn ngữ thiết kế nhìn thấy được trên hai ảnh này. Vế "so với node transfer khác" của AC-15 đã được thu hẹp ra khỏi eval này (amendment 2026-08-21, Cổng 2 vòng 3) — không được chấm ở đây.
  required_evidence:
    - (đề xuất PASS — panel không nêu bằng-chứng-thiếu)
  human_override:
<!-- JUDGMENT-BLOCK-TEMPLATE>>> -->

- eval: E17a
  run_id: minted-normalize-text-vi-E17a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-21T14:41:53Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.10s

- eval: E17b
  run_id: minted-normalize-text-vi-E17b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-21T14:41:53Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.10s

## Analyst

carried tu round 2 — baseline khong do lai round nay

E1a, E1b, E12b — carried non-discriminating tu round 2 (green trên cả HEAD lẫn diffBase khi đo lần cuối): E1a (`pnpm gen:abi && git diff --exit-code ...`) và E1b (`bash scripts/abi/check-python-gen-clean.sh`) so khớp file generated với ABI đã commit — hai lệnh này xanh bất kể có normalize-text-vi hay không vì chúng đo tính đồng bộ chung của toàn bộ generator, không riêng feature này. E12b (`pnpm vitest run src/lib/abi/conformance.test.ts`) là nửa TS của conformance suite, cũng xanh trên cả hai vì suite chạy fixture của mọi feature cùng lúc. Cả ba là regression-guard có chủ ý (đo tính toàn vẹn generator/suite), không cần viết lại — giữ nguyên nhận định từ round 2.

## Variance

none — every multi-run eval is uniform (không có eval nào mang field runs > 1 trong vòng này)

## Iterations

Round 3: Gate 2 owner mở rộng phạm vi AC-5 cho khoảng có hậu tố đơn vị (5%-10%, 5kg-10kg,...) — vá bản chốt luật khoảng, quay lại đo.
Round 4: Gate 2 owner mở rộng phạm vi AC-5 cho giá viết cách (1.000 đ-2.000 đ, 1.000 ₫ - 2.000 ₫,...) — vá thứ tự _SPACED_DONG/_RANGE, quay lại đo.
Round 5: 25 eval máy + E16 (panel judgment) đều PASS, nhưng review-findings phát hiện 2 finding Trong hợp đồng mức high (AC-6: "đ" đứng sau từ chỉ số lớn không kích hoạt luật tiền; AC-9: fixture test tự đăng ký registry viết tay, không round-trip qua mount thật) — cả hai là "phép đo không đo đúng thứ nó tên" theo Luật dừng vòng verify của hợp đồng, nên verdict REJECT, quay lại implementation để vá trong vòng.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
