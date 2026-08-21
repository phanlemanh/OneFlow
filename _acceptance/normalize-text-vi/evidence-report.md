---
schema_version: 2
feature_slug: normalize-text-vi
verdict: REJECT
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9043ef6753ce72fdcd072b74b602af68c6f2f20b
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
| E16 | AC-15 | judgment | FAIL |

## Analyst

carried tu round 2 — baseline khong do lai round nay

Eval KHÔNG-PHÂN-BIỆT (pass trên cả HEAD lẫn baseline diffBase — cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- E1a — `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`
- E1b — `bash scripts/abi/check-python-gen-clean.sh`
- E12b — `pnpm vitest run src/lib/abi/conformance.test.ts`

## Evidence

- eval: E1a
  run_id: minted-normalize-text-vi-E1a-r2
  exit_code: 0
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-normalize-text-vi-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_money
  verified_at: 2026-08-21T14:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E3
  run_id: minted-normalize-text-vi-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  verified_at: 2026-08-21T14:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E4
  run_id: minted-normalize-text-vi-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  verified_at: 2026-08-21T14:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E5
  run_id: minted-normalize-text-vi-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-21T14:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E6a
  run_id: minted-normalize-text-vi-E6a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  verified_at: 2026-08-21T14:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E6b
  run_id: minted-normalize-text-vi-E6b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  verified_at: 2026-08-21T14:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7
  run_id: minted-normalize-text-vi-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  verified_at: 2026-08-21T14:20:00Z
  output: |
    1 passed in 0.05s

- eval: E8
  run_id: minted-normalize-text-vi-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_edges
  verified_at: 2026-08-21T14:20:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-normalize-text-vi-E9a-r2
  exit_code: 0
  verifier: config:executors.test.unit_normalize_node
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-normalize-text-vi-E9b-r2
  exit_code: 0
  verifier: config:executors.test.unit_normalize_export
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10a
  run_id: minted-normalize-text-vi-E10a-r2
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-normalize-text-vi-E10b-r2
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_compliant
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10c
  run_id: minted-normalize-text-vi-E10c-r2
  exit_code: 0
  verifier: config:executors.test.unit_tts_family_matches_abi
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11a
  run_id: minted-normalize-text-vi-E11a-r2
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11b
  run_id: minted-normalize-text-vi-E11b-r2
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E12a
  run_id: minted-normalize-text-vi-E12a-r2
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E12b
  run_id: minted-normalize-text-vi-E12b-r2
  exit_code: 0
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-normalize-text-vi-E13-r2
  exit_code: 0
  verifier: config:executors.script.normalize_registration_synced
  verified_at: 2026-08-21T03:12:00Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E14a
  run_id: minted-normalize-text-vi-E14a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_train_local
  verified_at: 2026-08-21T14:25:00Z
  output: |
    OK: SDK 0.2.22 (hai file khớp) · vietnormalizer==0.2.3 pin chính xác

- eval: E14b
  run_id: minted-normalize-text-vi-E14b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_sdk_published
  verified_at: 2026-08-21T14:25:00Z
  output: |
    OK: artifact mang tongflow/text/, models mới và NORMALIZE_TEXT_VI
    OK: vỏ plugin pin oneflow-sdk==0.2.22
    OK: chuyến phát hành đồng bộ cho 0.2.22

- eval: E17a
  run_id: minted-normalize-text-vi-E17a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-21T14:28:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.19s

- eval: E17b
  run_id: minted-normalize-text-vi-E17b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-21T14:28:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.19s

- eval: E15
  run_id: minted-normalize-text-vi-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E15
  verified_at: 2026-08-21T14:35:00Z
  screenshot: evidence/design/captures/state-1-idle.png
  observed: |
    Frame state-1-idle.png (opened via Read, image content inspected directly): shows ONLY the "Đọc số thành chữ" node standalone (no fixture source node attached) on a dark canvas. Node header reads "A· Đọc số thành chữ" with a hamburger menu icon. Body shows label "Cách triền khai" [sic, app copy] with a dropdown reading "api-normalize-text-vi". Below it a "Đọc thành chữ" button rendered in a muted/grayed style (visually disabled — consistent with idle = no wired input, action not runnable). Two small handle circles visible on the card's left and right mid-edges. All text is natural Vietnamese, no raw i18n dotted keys, no {{...}} placeholders. Matches Expected for idle state.

    Frame state-2-wired.png (opened via Read, image content inspected directly): shows the SAME "Đọc số thành chữ" node now connected via a curved edge to a second node (a plain white rounded box, a fixture text source) positioned to its left — the edge runs from the source node's output handle into the target node's left input handle. The "Đọc thành chữ" button now renders in solid white/enabled styling (visually active — consistent with wired = input connected, action runnable). Same handle circles visible at the target node's left/right edges. All text Vietnamese, readable, no raw keys. Matches Expected for wired state.
  network_observed: clean
  output: |
    TEARDOWN (step 10, ran unconditionally at the end): killed both dev-server processes (`next dev` pid 8268, `pnpm dev` pid 7976) — `lsof -nP -iTCP:3000 -sTCP:LISTEN` after kill → no output (port free). `git checkout tsconfig.json` → `git status --short tsconfig.json` empty (clean). `rm -rf build` → directory confirmed absent. Final `git status --short` shows only the evidence-file diffs (the deliverable of this eval) — tsconfig.json and build/ leave no trace. PASS.

    ALL ASSERTIONS PASSED. exitCode = 0.

- eval: E16
  criterion: AC-15
  judged_by: judge panel (fresh context) — lenses: domain-correctness, operational-feasibility, spec-alignment
  panel_proposal: FAIL
  votes:
    - domain-correctness: FAIL — Shell/header (icon + tiêu đề "Đọc số thành chữ" + menu hamburger), spacing, và nhãn tiếng Việt ("Cách triển khai", "Đọc thành chữ") đều hợp khuôn AbiNodeShell và đọc được rõ ràng ở cả hai ảnh. Nhưng quét pixel dọc hai cạnh trái/phải của thẻ node trong state-1-idle.png (băng x=28-40 và x=382-390, suốt y=325-535) không thấy màu chấm handle nào khác biệt với nền/viền thẻ — hai handle in:text/out:text không hiện hình; và ở state-2-wired.png, node chỉ đè chồng lên thẻ trắng nguồn mà không có đường nối (edge) nào vẽ giữa hai điểm handle, đồng thời nút "Đọc thành chữ" bị cắt chữ ("chữ") do node tràn ra ngoài khung viewport — hai điều này phá ngôn ngữ thiết kế workspace nhìn thấy được ngay trên hai ảnh.
      required_evidence:
        - Một ảnh chụp state-1-idle (hoặc tương đương) zoom sát cạnh trái/phải thẻ node cho thấy một chấm/hình handle có màu khác biệt với nền (10,10,10)/viền thẻ (30,41,57)(50,60,77)(12,12,13) — hiện quét băng x=28-40 và x=382-390 suốt y=325-535 trong state-1-idle.png không thấy màu nào như vậy.
        - Một ảnh chụp state-2-wired với canvas pan lại sao cho toàn bộ node (đủ cạnh phải + nhãn 'Đọc thành chữ' không bị viewport cắt) nằm trong khung hình, để xác nhận out:text handle và nhãn nút có render đúng khi không bị cắt.
        - Một ảnh chụp (hoặc DOM/inspector snapshot) tại đúng điểm nối giữa thẻ trắng nguồn và node normalize-text-vi trong state wired cho thấy đường edge (bezier/line) thực sự được vẽ nối hai handle — ảnh hiện tại chỉ thấy hai thẻ đè chồng, không có đường nối nào.
    - operational-feasibility: UNCERTAIN — Shell/header, spacing, icon và nhãn nút tiếng Việt trên node "Đọc số thành chữ" đều hợp khuôn AbiNodeShell và đọc được rõ ràng ở cả hai ảnh. Nhưng quét pixel toàn bộ hai ảnh không tìm thấy bất kỳ dấu hiệu handle nào (không có pixel màu khác biệt ở cạnh trái/phải card tại cả state-1 lẫn state-2), và ở state-2 "wired" cũng không có pixel nào thuộc một đường nối giữa node nguồn và node đích — không đủ căn cứ để kết luận hai handle in:text/out:text có hiển thị đúng hay không chỉ từ hai ảnh tĩnh này.
      required_evidence:
        - Một ảnh/DOM-inspector cho thấy handle in:text hiện rõ (điểm/marker có màu tương phản với nền canvas đen) tại cạnh trái card 'Đọc số thành chữ' — hiện quét pixel toàn ảnh state-1-idle.png và state-2-wired.png không tìm thấy pixel màu bão hoà nào tại vùng x:20-50 dọc suốt chiều cao card (y:337-526)
        - Một ảnh/DOM-inspector cho thấy handle out:text hiện rõ tại cạnh phải card, cùng vị trí tương tự (x quanh 380-390) — hiện cũng không có pixel khác biệt nền tại đó
        - Một capture state-2 (hoặc state khác) cho thấy đường nối (bezier/step edge) thực sự vẽ giữa node nguồn (khối trắng) và handle in:text của node này — hiện vùng giữa hai khối (x:325-390, y:415-470 của state-2-wired.png) chỉ toàn màu nền/card, không có stroke pixel nào của một edge
    - spec-alignment: FAIL — Shell/header, spacing, icon và nhãn nút "Đọc thành chữ" đều hợp khuôn AbiNodeShell (header đậm màu navy có icon+tiêu đề+hamburger, dropdown "Cách triển khai", nút CTA có icon). Nhưng soi pixel-level cả hai ảnh (viền trái/phải node ở state-1-idle.png, viền trái node ở state-2-wired.png, phóng 6-10x) cho thấy KHÔNG có chấm handle nào nhô ra trên toàn bộ chiều cao viền trái lẫn phải — không có handle in:text/out:text nào hiển thị; state-2 "wired" cũng không có bất kỳ đường dây nối nào giữa node text nguồn (khối trắng) và node "Đọc số thành chữ" dù tên state là "wired". Đây là khoảng trống trực tiếp nhìn thấy trên chính hai ảnh được cấp, phá vỡ đúng tiêu chí "hai handle in:text/out:text" mà câu hỏi yêu cầu soi.
      required_evidence:
        - Crop phóng ≥6x dọc viền trái node trong state-1-idle.png (vùng x≈28-45, y≈335-522) cho thấy một chấm handle tròn (in:text) — hiện tại crop này chỉ ra viền bo góc liền mạch, không một điểm khác màu nào; nếu ảnh chụp lại/khu vực khác của cùng node cho thấy chấm handle ở đó thì kết luận đổi.
        - Crop tương tự dọc viền phải node trong state-1-idle.png (x≈378-390, y≈335-522) cho thấy chấm handle out:text — hiện không có; cần một ảnh trong đó viền phải không bị crop sát mép khung hình 390px và có chấm handle hiển thị.
        - Crop viền trái node trong state-2-wired.png (x≈280-300, y≈400-540, node đã nằm giữa khung hình, không bị crop) cho thấy chấm handle in:text hoặc một đường wire nối từ khối trắng phía trên sang node — hiện tại vùng này hoàn toàn trơn, không có handle lẫn dây nối dù state được đặt tên 'wired'.
        - Một ảnh chụp state-2-wired.png phiên bản không bị cắt mép phải (toàn bộ card + nút 'Đọc thành chữ' nằm trọn trong khung) để xác nhận layout/nhãn nút không vỡ khi node nằm giữa canvas thay vì bị viewport cắt.
  human_override: 

## Variance

none — every multi-run eval is uniform

## Iterations

Round 2: 25/26 eval PASS, E16 UNCERTAIN (panel không có ảnh đối chứng để soi handle/edge) — verdict PENDING-JUDGMENT, contract chuyển sang verified.
Round 3 (Cổng 2, owner 2026-08-21): owner nâng phạm vi AC-5/AC-6 sau khi phát hiện khoảng có hậu tố đơn vị (5%-10%) và giá viết cách (1.000 đ-2.000 đ) mất chữ nối "đến" — 2/7 finding vá trong sdk/tongflow/text/normalize_vi.py; đồng thời thu hẹp vế "so với node transfer khác" ra khỏi AC-15/E16 sang checklist riêng của owner ở Cổng 2.
Round 4 (round này): 25 eval máy PASS (13 chạy lại tại HEAD, 12 carry-forward từ round 2 vì delta không chạm paths của các eval đó; baseline round 2 không đo lại theo P2); nhưng review-findings phát hiện 3 lỗi TRONG HỢP ĐỒNG còn sống trên chính cây HEAD (AC-5: hậu tố tỷ/triệu/kg/người vẫn mất chữ "đến" dù đã vá %/đ; AC-6: giá viết hoa "Đ" mất hẳn chữ tiền; AC-8: dấu hai chấm dính chữ chặn cả câu prose không số) và panel đổi E16 từ UNCERTAIN sang FAIL (vẫn không thấy handle/edge trên ảnh capture mới, thêm nút bị cắt chữ) → verdict REJECT.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
