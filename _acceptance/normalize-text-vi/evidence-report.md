---
schema_version: 2
feature_slug: normalize-text-vi
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9d98fb192e75242aaf2c3127dd7c810784434a00
human_signoff:
---

# Evidence Report: normalize-text-vi (round 13)

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
| E18 | AC-16 | script | PASS |

## Evidence

- eval: E1a
  run_id: minted-normalize-text-vi-E1a-r2
  exit_code: 0
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-25T08:44:36Z
  carried_from_round: 12
  note: carry-forward từ round 12 — delta round này không chạm paths của eval

- eval: E1b
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-25T08:44:36Z
  carried_from_round: 12
  note: carry-forward từ round 12 — delta round này không chạm paths của eval

- eval: E2
  run_id: minted-normalize-text-vi-E2-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_money
  verified_at: 2026-08-26T09:15:00Z
  output: |
    Pin: vietnormalizer==0.2.3
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E3
  run_id: minted-normalize-text-vi-E3-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  verified_at: 2026-08-26T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E4
  run_id: minted-normalize-text-vi-E4-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  verified_at: 2026-08-26T09:15:00Z
  output: |
    pin=vietnormalizer==0.2.3
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E5
  run_id: minted-normalize-text-vi-E5-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-26T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E6a
  run_id: minted-normalize-text-vi-E6a-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  verified_at: 2026-08-26T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E6b
  run_id: minted-normalize-text-vi-E6b-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  verified_at: 2026-08-26T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7
  run_id: minted-normalize-text-vi-E7-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  verified_at: 2026-08-26T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E8
  run_id: minted-normalize-text-vi-E8-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_edges
  verified_at: 2026-08-26T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-normalize-text-vi-E9a-r6
  exit_code: 0
  verifier: config:executors.test.unit_normalize_node
  verified_at: 2026-08-25T08:44:36Z
  carried_from_round: 12
  note: carry-forward từ round 12 — delta round này không chạm paths của eval

- eval: E9b
  run_id: minted-normalize-text-vi-E9b-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_normalize_export
  verified_at: 2026-08-26T09:15:00Z
  output: |
    Tests  2 passed (2)
    Start at  08:28:03
    Duration  240ms (transform 116ms, setup 0ms, import 165ms, tests 3ms, environment 0ms)

- eval: E10a
  run_id: minted-normalize-text-vi-E10a-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-26T09:15:00Z
  output: |
    Tests  5 passed | 55 skipped (60)
    Start at  08:28:03
    Duration  421ms (transform 166ms, setup 0ms, import 344ms, tests 5ms, environment 0ms)

- eval: E10b
  run_id: minted-normalize-text-vi-E10b-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_order_compliant
  verified_at: 2026-08-26T09:15:00Z
  output: |
    Tests  8 passed | 52 skipped (60)
    Start at  08:28:05
    Duration  272ms (transform 98ms, setup 0ms, import 209ms, tests 5ms, environment 0ms)

- eval: E10c
  run_id: minted-normalize-text-vi-E10c-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_tts_family_matches_abi
  verified_at: 2026-08-26T09:15:00Z
  output: |
    Tests  2 passed | 58 skipped (60)
    Start at  08:28:08
    Duration  275ms (transform 85ms, setup 0ms, import 205ms, tests 1ms, environment 0ms)

- eval: E11a
  run_id: minted-normalize-text-vi-E11a-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  verified_at: 2026-08-26T09:15:00Z
  output: |
    ..                                                                       [100%]
    2 passed in 0.25s

- eval: E11b
  run_id: minted-normalize-text-vi-E11b-r6
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  verified_at: 2026-08-25T08:44:36Z
  carried_from_round: 12
  note: carry-forward từ round 12 — delta round này không chạm paths của eval

- eval: E12a
  run_id: minted-normalize-text-vi-E12a-r6
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  verified_at: 2026-08-25T08:44:36Z
  carried_from_round: 12
  note: carry-forward từ round 12 — delta round này không chạm paths của eval

- eval: E12b
  run_id: minted-normalize-text-vi-E12b-r2
  exit_code: 0
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-25T08:44:36Z
  carried_from_round: 12
  note: carry-forward từ round 12 — delta round này không chạm paths của eval

- eval: E13
  run_id: minted-normalize-text-vi-E13-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_registration_synced
  verified_at: 2026-08-26T09:15:00Z
  output: |
    OK: manifest + 3 READMEs (plugin list & matrix row) + 5 locales all in sync

- eval: E14a
  run_id: minted-normalize-text-vi-E14a-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_train_local
  verified_at: 2026-08-26T09:15:00Z
  output: |
    OK: SDK 0.2.23 (both files agree) · vietnormalizer==0.2.3 pinned exactly

- eval: E14b
  run_id: minted-normalize-text-vi-E14b-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_published
  verified_at: 2026-08-26T09:15:00Z
  output: |
    OK: artifact mang tongflow/text/, models mới và NORMALIZE_TEXT_VI
    OK: the plugin shell pins oneflow-sdk==0.2.23
    OK: the release train is in sync for 0.2.23

- eval: E15
  run_id: minted-normalize-text-vi-E15-r13
  exit_code: 0
  verifier: config:capture
  verified_at: 2026-08-26T09:15:00Z
  screenshot: evidence/design/captures/state-1-idle.png
  observed: |
    state-1-idle.png (1280x900): dark-theme node card titled "Đọc số thành chữ" with a checkmark-letter icon and a hamburger "more options" icon top-right. Body has a "Cách triển khai" dropdown showing "api-normalize-text-vi" selected, and below it a grayed-out/disabled "Đọc thành chữ" button with a magic-wand icon — consistent with idle (no input wired, action not yet runnable). Two connection handle dots visible on the card's left and right edges. Matches Expected idle state.

    state-2-wired.png (1280x900): same node card "Đọc số thành chữ" now on the right, connected via a curved wire from an upstream fixture source node on the left reading "Giá 1.999.000đ ngày 19/8/2026" into the node's left (in:text) handle. The "Đọc thành chữ" button is now bright/enabled (white background vs. gray in idle), consistent with wired state having live fixture input. This is a real React Flow canvas with a real edge, matching Expected wired state.

    Both frames read HTML lang="vi" and Vietnamese node/button labels only — no raw i18n keys.
  network_observed: clean
  output: |
    Step 10 (cleanup, run regardless of outcome): killed dev server pid 64612 (only the one this session started); confirmed via `lsof -nP -iTCP:3000 -sTCP:LISTEN` → no output (port free, no stray process). `git checkout tsconfig.json` → diff empty afterward. `rm -rf build` → dir gone. Final `git status --short` shows only the intended evidence-file updates under _acceptance/normalize-text-vi/evidence/design/captures/ (state-1-idle.{png,html}, state-2-wired.{png,html}, gate-state-1-idle.json, gate-state-2-wired.json, E15-network.txt); tsconfig.json shows no diff. HEAD still 9d98fb1, tree left clean of build artifacts.

    Overall: all assertions PASS. Two idle/wired captures exist, verified to be from this tree (origin check + in-page state assertions), P0 design gate green on both, console clean, network clean (app-scope), handles and Vietnamese labels correct per the Gate-2 scope (idle + wired only, per the note that loading/error states are out of scope for this eval).

<!-- <<<JUDGMENT-BLOCK-TEMPLATE -->
- eval: E16
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  verified_at: 2026-08-26T09:15:00Z
  rationale: Cả ba lens đồng thuận PASS trên hai capture idle/wired đã cấp — node hợp khuôn AbiNodeShell (header, dropdown "Cách triển khai", nút hành động, hai handle in:text/out:text), nhãn tiếng Việt hiển thị đúng dấu, không có chi tiết nào phá vỡ ngôn ngữ thiết kế workspace trên chính hai ảnh này.
  votes:
    - domain-correctness: PASS — Ở cả hai ảnh, node đúng khuôn AbiNodeShell: header có icon "A✓" + tiêu đề "Đọc số thành chữ" tiếng Việt rõ nghĩa + menu hamburger góc phải; thân card có nhãn "Cách triển khai", dropdown chọn plugin "api-normalize-text-vi" (icon avatar tròn), nút hành động "Đọc thành chữ" kèm icon đũa phép, nhãn đọc được; hai handle tròn xuất hiện đúng vị trí trái/phải (in:text nối vào node nguồn ở ảnh wired, out:text còn trống bên phải) — khớp mô tả in:text/out:text. Bo góc, khoảng cách, màu nền tối đồng nhất giữa hai state, không thấy phần tử nào phá vỡ ngôn ngữ thiết kế trên chính hai ảnh này.
    - operational-feasibility: PASS — Cả hai ảnh cho thấy node hợp khuôn AbiNodeShell: header có icon (A có dấu check) + tiêu đề "Đọc số thành chữ" + nút hamburger bên phải, thân card phân lớp rõ (panel chọn "Cách triển khai" nền tối hơn, nút hành động "Đọc thành chữ" có icon) với spacing nhất quán giữa hai state. Nhãn tiếng Việt (kể cả dấu thanh/dấu phụ trong "Đọc số thành chữ", "Cách triển khai", "Đọc thành chữ") hiển thị rõ nét không vỡ font; hai handle (chấm tròn) xuất hiện đối xứng hai bên trái/phải ở cùng cao độ tại cả hai state, và ở state-2 handle trái có dây nối vào node nguồn — không thấy chi tiết nào phá vỡ ngôn ngữ thiết kế workspace trên chính hai ảnh này.
    - spec-alignment: PASS — Cả hai ảnh cho thấy node "Đọc số thành chữ" đúng khuôn AbiNodeShell: header navy bo góc có icon + tiêu đề + nút hamburger, khối "Cách triển khai" với dropdown chọn plugin, nút hành động có icon đũa phép — spacing và bố cục nhất quán giữa state-1 và state-2. Nhãn "Đọc số thành chữ" / "Cách triển khai" / "Đọc thành chữ" đều tiếng Việt rõ, dấu hiển thị đúng, không vỡ chữ; hai handle tròn ở giữa cạnh trái/phải node xuất hiện ở cả hai ảnh (idle: hai vòng tròn rỗng; wired: vòng trái nhận một cạnh nối tới, tương ứng in:text/out:text). Không thấy yếu tố nào trên chính node này phá vỡ ngôn ngữ thiết kế workspace trong hai ảnh được cấp.
  human_override:
<!-- JUDGMENT-BLOCK-TEMPLATE>>> -->

- eval: E17a
  run_id: minted-normalize-text-vi-E17a-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-26T09:15:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.13s

- eval: E17b
  run_id: minted-normalize-text-vi-E17b-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-26T09:15:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.13s

- eval: E18
  run_id: minted-normalize-text-vi-E18-r13
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.measuring_instruments_refuse
  verified_at: 2026-08-26T09:15:00Z
  output: |
    (checked 9 executor keys whose tests need the engine; each must carry the ${pin:?…} guard)
    OK: capture refuses a wrong locale and clears the stale frame · shared executor reports a legible pin error

## Analyst

carried từ round 2 — baseline không đo lại round này

- E1a (config:executors.script.gen_abi_clean) — xanh trên cả HEAD lẫn diffBase; eval không phân biệt được feature với cây cũ, chứng minh harness (pnpm gen:abi chạy sạch) chứ chưa chứng minh nội dung normalize-text-vi mới.
- E1b (config:executors.script.abi_python_gen_clean) — cùng lý do: script gen Python sạch trên cả hai phía.
- E12b (config:executors.test.unit_conformance) — nửa TS của conformance suite xanh trên cả hai phía; cần fixture riêng cho normalize-text-vi để trở thành non-trivial (đã ghi ở round 2, chưa đổi round này).

## Variance

none — không có eval nào có runs > 1 vòng này; không có tín hiệu flaky.

## Iterations

Round 11: mở rộng ma trận AC-2/AC-4/AC-6 (E2, E4, E6a) rồi chạy lại — cả ba xanh, không cần quay lại implementation.
Round 12: chạy lại E17a/E17b (vỏ plugin) và E15 (UI capture) cùng loạt carry-forward E1a/E1b/E9a/E11b/E12a/E12b/E13 từ round 6 — xanh, verified_commit fb1043d.
Round 13: chạy lại toàn bộ 20 eval máy (E2–E18, E14a/E14b, E17a/E17b, E15) + panel E16 (3 lens PASS) trên commit 9d98fb1; build/typecheck/lint/pnpm test/sdk pytest đầy đủ/verify:plugins/gen:abi diff đều xanh bổ trợ — không phát hiện hồi quy; verdict giữ PENDING-JUDGMENT vì còn 1 finding severity high ngoài hợp đồng (picker affordance) và 1 finding severity high trong hợp đồng (AC-6, STREET_PATTERN chữ thường) cần người quyết ở Gate 2.

## Gate 2 checklist (human)

- [ ] Đọc bảng + kiểm tra chéo 1-2 evidence block
- [ ] Tự kiểm chứng mọi judgment item — E16 đã PASS đồng thuận 3 lens, xác nhận lại rồi điền `human_override: <tên> <ngày>` nếu đồng ý
- [ ] Đọc `review-findings.md` — đặc biệt finding "Trong hợp đồng" (AC-6, severity medium) và 2 finding "Ngoài hợp đồng" (severity high) — quyết định known-limits/new-contract/fix-now
- [ ] Nếu quyết định nâng verdict lên PASS: viết lại frontmatter `verdict: PASS` (hook sẽ re-validate evidence + overrides)
- [ ] Điền `human_signoff` trong frontmatter
