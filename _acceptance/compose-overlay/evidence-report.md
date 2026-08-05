---
schema_version: 2
feature_slug: compose-overlay
verdict: PASS
failed_evals: []
reason: ""
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 28c1a7d6202ce2a8cd40eeae7eb55a8145264891
human_signoff: Manh 2026-08-03
---

# Evidence Report: compose-overlay

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1a | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5a | AC-5 | script | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7a | AC-7 | script | PASS |
| E7b | AC-7 | script | PASS |
| E8a | AC-8 | script | PASS |
| E8b | AC-8 | script | PASS |
| E9a | AC-9 | script | PASS |
| E9b | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-11 | test | PASS |
| E17 | AC-11 | test | PASS |
| E12a | AC-12 | test | PASS |
| E12b | AC-12 | test | PASS |
| E18 | AC-13 | test | PASS |
| E19 | AC-13 | test | PASS |
| E20 | AC-14 | script | PASS |
| E21 | AC-15 | script | PASS |
| E22 | AC-16 | ui-check | PASS (carry-forward — `paths` không đổi) |
| E23 | AC-16 | judgment | PASS (panel proposal + human_override 2026-08-03) |

## Evidence

- eval: E1a
  run_id: compose-overlay-E1a-20260805T123755Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-05T12:37:55Z
  output: |
    > oneflow@0.2.1 gen:abi /Users/manhphan/dev/oneflow
    > tsx scripts/gen-abi-types.ts

    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json
    (git diff --exit-code sạch — không drift)

- eval: E1b
  run_id: compose-overlay-E1b-20260805T123756Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-05T12:37:56Z
  output: |
    (guard im lặng khi xanh — không stdout; chạy lại gen_models.py + gen_node_slots.py
    rồi git diff --exit-code sdk/tongflow/models sdk/tongflow/node_slots.py sạch,
    không file untracked)

- eval: E2
  run_id: compose-overlay-E2-20260805T123745Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-05T12:37:45Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.44s

- eval: E3
  run_id: compose-overlay-E3-20260805T123748Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-05T12:37:48Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.11s

- eval: E4
  run_id: compose-overlay-E4-20260805T123749Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-05T12:37:49Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E5a
  run_id: compose-overlay-E5a-20260805T123751Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-05T12:37:51Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E5b
  run_id: compose-overlay-E5b-20260805T123752Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-05T12:37:52Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E6
  run_id: compose-overlay-E6-20260805T123753Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-05T12:37:53Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E7a
  run_id: compose-overlay-E7a-20260805T123755Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-05T12:37:55Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E7b
  run_id: compose-overlay-E7b-20260805T123756Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-05T12:37:56Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E8a
  run_id: compose-overlay-E8a-20260805T123757Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-05T12:37:57Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.22s

- eval: E8b
  run_id: compose-overlay-E8b-20260805T123759Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-05T12:37:59Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E9a
  run_id: compose-overlay-E9a-20260805T123800Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-05T12:38:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9b
  run_id: compose-overlay-E9b-20260805T123802Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-05T12:38:02Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.19s

- eval: E10
  run_id: compose-overlay-E10-20260805T123803Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-05T12:38:03Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.26s

- eval: E14
  run_id: compose-overlay-E14-20260805T123806Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-05T12:38:06Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E15
  run_id: compose-overlay-E15-20260805T123806Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-05T12:38:06Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E16
  run_id: compose-overlay-E16-20260805T123806Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-05T12:38:06Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E17
  run_id: compose-overlay-E17-20260805T123806Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-05T12:38:06Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E12a
  run_id: compose-overlay-E12a-20260805T123822Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-05T12:38:22Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow

     Test Files  1 passed (1)
          Tests  8 passed (8)
       Start at  19:38:23
       Duration  1.59s (transform 274ms, setup 0ms, import 656ms, tests 323ms, environment 529ms)

- eval: E12b
  run_id: compose-overlay-E12b-20260805T123824Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-05T12:38:24Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow

     Test Files  1 passed (1)
          Tests  3 passed (3)
       Start at  19:38:25
       Duration  224ms (transform 111ms, setup 0ms, import 147ms, tests 4ms, environment 0ms)

- eval: E18
  run_id: compose-overlay-E18-20260805T123807Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-05T12:38:07Z
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.03s

- eval: E19
  run_id: compose-overlay-E19-20260805T123825Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-05T12:38:25Z
  output: |
     RUN  v4.1.10 /Users/manhphan/dev/oneflow

     Test Files  1 passed (1)
          Tests  12 passed (12)
       Start at  19:38:25
       Duration  144ms (transform 58ms, setup 0ms, import 76ms, tests 4ms, environment 0ms)

- eval: E20
  run_id: compose-overlay-E20-20260805T123826Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-05T12:38:26Z
  output: |
    OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent

- eval: E21
  run_id: compose-overlay-E21-20260805T123927Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-05T12:39:27Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: design-gate-908887ca23,design-gate-8f52c68794(pre-cssfix)→r12-final:E22-designgate-r12-independent-verify.txt
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-03T09:00:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/compose-overlay/evidence/design/captures/state-1-empty.png
  observed: |
    Carry-forward vòng 14 (2026-08-05): E22 khai `paths:
    src/components/workspace/nodes/transfer/compose-overlay.tsx`, và
    `git diff --name-only f39723a228be..28c1a7d -- 'src/**'` trả về RỖNG (0 file) —
    nhánh `feat/ci-vitest-sdk-pin` chỉ chạm `.github/workflows/ci.yml`, `scripts/**`,
    `CLAUDE.md`, `docs/**`, `STATUS.md`, `_acceptance/**`. 12 file capture của vòng
    đã ký còn nguyên trên đĩa (đã liệt kê lại ở vòng này). Quan sát dưới đây giữ
    nguyên từ round 12.

    Read back all 6 saved frames (state-1..5 PNGs freshly regenerated at round 12 from the live current-HEAD app + their .html; state-6 PNG/html left as-is, confirmed still valid/unchanged). state-1-empty.png: node shell "Overlay Text/Logo", dashed "Implementation" placeholder card, "No ops yet..." message, 4 disabled-looking add-op buttons (Text/Price tag/Logo/Safe zone), "Apply Overlay" button greyed/disabled — matches Expected "empty, no media, no ops, execute disabled". state-2-ops-image.png: "Ops · media: image", 4 op rows (TEXT/PRICE/LOGO/SAFE) each with edit/remove icons, no time badge on any row, Apply Overlay enabled (black) — matches "media=image, no time fields". state-3-ops-video.png: "Ops · media: video", same 4 op rows but TEXT/PRICE/LOGO rows now carry a grey time badge ("0–3.5s", "3.5–7s", "entire video"); SAFE row has none — matches "media=video, time fields visible". state-4-op-form.png: TEXT op row expanded into a full form (multi-line "Content" textarea holding literal {text} placeholder text, x/y number inputs, Anchor select, Font size, Color swatch+hex input, Alignment select, Max width), node has blue selection ring — matches "text op form expanded (multi-line, {text}, coords, time-adjacent fields)". state-5-error.png: red banner "A logo op needs an image on in:logo — connect an image node.", one LOGO op row rendered in red/destructive styling with "logo image missing (in:logo not connected)", Apply Overlay button greyed/disabled — matches "logo op present but in:logo missing → inline + banner error". state-6-running.png (previously verified, component unchanged since capture): full workspace canvas, node shows rotating gradient border/spinner, "Task started", elapsed timer, disabled "Apply Overlay" replaced by active grey "Cancel execution"-style button — matches "running, shell loading overlay". No content in any frame contradicts Expected; all 6 states align with the design-doc matrix.
  network_observed: clean
  output: |
    exitCode=0: every assertion above passed (HTTP 200, console clean x2, network clean per scoping, P0 gate PASS/exit 0/p0_count 0 on all 6 states, all 6 capture pairs present and content-verified against Expected).

- eval: E23
  judged_by: 3-lens panel (domain-correctness, operational-feasibility, spec-alignment) — fresh-context judge subagent
  verdict: PASS (panel proposal)
  votes:
    - domain-correctness: PASS — Ca 6 capture khop cau truc voi 6 file design-of-record tuong ung: shell/header/icon, "Implementation" picker, "Ops" list + "+ Add op", nut "Apply Overlay" (enabled/disabled dung trang thai), op-form voi border accent xanh va day du field (content, x/y, anchor/font-size, color/alignment, max-width, start/end time thay the "Hien (giay)"), banner loi mau do + op-row loi vien do o state-5, va rotating-border + overlay + spinner + timer o state-6 — dung "shared shell" treatment nhu cac node transfer khac. Cac khac biet quan sat duoc (ngon ngu VI trong file thiet ke vs EN trong capture, so luong op it hon trong state-2/3, nut Cancel bi crop o state-6) deu la du lieu/artefact moi truong da duoc manifest.reading_notes canh bao truoc, khong phai sai lech ngon ngu thiet ke.
    - operational-feasibility: PASS — Cả 6 capture khớp đúng mô tả state trong manifest: state-1 disable nút Apply khi chưa có ops, state-2 (image) không có time-field còn state-3 (video) có thêm badge "entire video" cho op, state-4 mở form đầy đủ multi-line content + x/y/anchor/font/color/align + Start(s)/End(s), state-5 vừa có banner đỏ "in:logo not connected" vừa có inline error trên op row, state-6 dùng đúng overlay loading dùng chung của shell (viền gradient xoay + spinner + nhãn + đồng hồ). Shell node (icon + title + hamburger, khối "Implementation" có avatar dropdown, danh sách "Ops" + nút hành động đen/xám) nhất quán xuyên suốt 6 ảnh và không có yếu tố nào (màu, bo góc, spacing, typography) phá vỡ ngôn ngữ thiết kế chung của canvas/top-bar xuất hiện đồng nhất ở mọi state.
    - spec-alignment: PASS — Doi chieu 6 file HTML design-of-record voi 6 PNG capture: shell BaseNodeShell (icon+title+hamburger, khung bo goc, plugin-select box) giong nhau xuyen suot; state-1 khop dung 2x2 add-menu + nut disabled xam; state-2/3 khop op-row dang badge+summary+edit/x; state-4 giu border xanh "selected" va day du truong (Start/End co that, chi khac cach nhom so voi 1 truong "Hien (giay)" gop cua design — khac biet noi dung nho, khong pha shell); state-5 khop banner-error do + op-row vien do; state-6 khop dung dac tinh loading rieng cua BaseNodeShell (vien gradient xoay, spinner, nhan, dong ho, nut Cancel — da xac nhan co trong HTML du bi cat o viewport chup). Sai khac con lai chi la ngon ngu hien thi (VI trong design vs EN trong capture) va cach nhom truong form, khong phai vi pham ngon ngu thiet ke workspace.
  rationale: Panel 3-lens dong thuan tuyet doi PASS — khong dissent nao duoc ghi nhan. Vòng 14 giữ nguyên kết luận này theo carry-forward, không chạy lại panel: input của E23 là 6 capture + design-of-record, cả hai không đổi (không file `src/**` nào đổi giữa f39723a228be và 28c1a7d).
  human_override: Manh 2026-08-03

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — baseline not re-measured this round (P2); no non-discriminating evals identified this round.

## Variance

none — no stochastic (runs > 1) evals this round; every eval was deterministic and 0/1 or 1/1.

## Iterations

Round 1-11: iterative fixes across ABI/codegen drift, golden-image render tests, cache tiering (L3/L4), UI ops-editor coverage, and the design gate (an earlier css issue was identified and fixed pre-final capture per E22's run_id provenance chain: design-gate-908887ca23 → design-gate-8f52c68794 (pre-cssfix) → r12-final); round-by-round detail not carried into this verify context.
Round 12: all 26 machine/ui-check evals (E1a-E22) PASS, exit 0, no variance; E23 design-language judgment panel (3 lenses) unanimously proposes PASS; baseline not re-measured this round (P2, carried); verdict PENDING-JUDGMENT pending Gate 2 human_override on E23.
Round 13 (2026-08-05, nhánh `feat/ci-vitest-sdk-pin` @ a1bc936): 25 eval chạy máy; 12 xanh, 13 eval render đỏ (E2..E10) — lỗi thứ tự suy ra pin SDK do chính nhánh này tạo ra. Verdict REJECT, không ghim commit. E22/E23 carry-forward.
Round 14 (2026-08-05, cùng nhánh @ 28c1a7d — commit sửa lỗi của round 13): 25/25 eval chạy máy xanh, gồm cả 13 eval render. E22/E23 carry-forward. Verdict PASS, ghim `verified_commit: 28c1a7d`. Chi tiết + probe độc lập ở mục dưới.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify E23 (judgment item, panel proposal PASS), then fill its
      `human_override: <name> <date>` line
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

## Vòng kiểm lại 2026-08-04 (sau hạng mục 0.6 `gate-scope-anchors`)

Hợp đồng `gate-scope-anchors` chạm `scripts/**`, nên bằng chứng của hồ sơ này
thành cũ theo cơ chế staleness. Đã chạy lại: **26/26 eval xanh** ở
`5acc982e7690`, trong một đợt chạy chung 194 eval / 131 lệnh duy nhất của cả 13 hồ
sơ bị ảnh hưởng — không hồ sơ nào đỏ.

Chi phí này đã khai trước ở Cổng 1 của `gate-scope-anchors`.

Riêng **E22** (design gate, cần app chạy + trình duyệt) áp dụng carry-forward
của kit thay vì chạy lại: nó khai `paths:
src/components/workspace/nodes/transfer/compose-overlay.tsx`, và `git diff` từ
mốc cũ cho thấy **không một file `src/**` nào đổi** — toàn bộ thay đổi nằm ở
`scripts/**`, `docs/**`, `lib/evidence-core.js` và `_acceptance/**`. 12 file
capture của vòng đã ký vẫn nguyên trên đĩa.

## Ghim lại 2026-08-05 (nhánh `chore/landed-merge-anchors`)

Nhánh điền `landed_merge` chạm `scripts/**` (sửa test + hoàn nguyên golden), nên
bằng chứng lại thành cũ. Đã chạy lại đợt chung 139 eval / 85 lệnh của 10 hồ sơ
bị ảnh hưởng ở `f39723a228be` — **0 hồ sơ đỏ**.

Riêng **E22** (design gate, cần app chạy) lại carry-forward: `git diff` từ mốc
cũ cho thấy **không một file `src/**` nào đổi** — toàn bộ delta nằm ở
`scripts/**` và `_acceptance/**`.

## Kiểm lại trên nhánh `feat/ci-vitest-sdk-pin` (CI-a): một vòng đỏ, một vòng xanh — ghim ở `28c1a7d`

Nhánh `feat/ci-vitest-sdk-pin` sửa đúng một file mà hồ sơ này **sở hữu** theo luật
per-file: `scripts/plugins/run-overlay-plugin-tests.sh` (ngoài ra nhánh chạm
`.github/workflows/ci.yml`, `CLAUDE.md`, `docs/**`, `STATUS.md` — đều t1-exempt).
Bằng chứng đã ký thành cũ, nên hồ sơ phải **re-verify** chứ không được carry-forward
re-pin. Việc đó diễn ra hai vòng; ghi lại đầy đủ ở đây thay cho hai mục rời.

### Vòng 13 @ `a1bc936` — REJECT

Chạy 25/27 eval bằng máy: 12 xanh, **13 eval render đỏ** (E2, E3, E4, E5a, E5b, E6,
E7a, E7b, E8a, E8b, E9a, E9b, E10), mã thoát 2, thông điệp
`sdk-version: no such file: $TMPDIR/oneflow-overlay-plugin-ci/sdk/pyproject.toml`.

Nguyên nhân là **chính thay đổi của nhánh**, không phải network flake, không phải
upstream drift: bản `a1bc936` của runner tính `SDK_SPEC="$(sdk_spec)"` ở dòng 29,
tức **sau** `cd "$CACHE_DIR"` ở dòng 24; còn `sdk_version()` trong
`scripts/lib/sdk-version.sh` giải gốc repo bằng `git rev-parse --show-toplevel`
**tại thời điểm gọi**. Đứng trong bản clone của repo plugin, nó trả về gốc repo
plugin, không thấy `sdk/pyproject.toml`, trả mã 2, và `set -euo pipefail` kết liễu
script trước khi `uv` cài SDK và trước khi pytest chạy.

Điểm đắt giá của vòng đó: guard `civ_pin_*` của nhánh soi `--print-spec`, mà nhánh
`--print-spec` `return` **trước** lệnh `cd`, nên guard vẫn xanh trong khi đường chạy
thật đã chết — lỗi chỉ lộ ra ở một vòng verify fresh-context.

### Commit sửa `28c1a7d`

Ba chỗ đổi: (1) `scripts/lib/sdk-version.sh` chốt gốc repo **một lần lúc source**,
neo theo `BASH_SOURCE` của chính file thay vì cwd hay `git rev-parse`; (2) runner
tính `SDK_SPEC` **trước** `cd` và source thư viện theo đường dẫn tuyệt đối; (3)
`check-overlay-pin-derived.sh shape` thêm hai khẳng định mới — tĩnh (dòng gán
`SDK_SPEC` phải đứng trước dòng `cd`) và động (gọi `--print-spec` từ trong một git
repo lạ vẫn phải ra đúng pin).

### Vòng 14 @ `28c1a7d` — PASS

**25/25 eval chạy máy xanh**, gồm trọn 13 eval render. E22/E23 carry-forward (không
một file `src/**` nào đổi giữa `f39723a228be` và `28c1a7d`; 12 file capture còn
nguyên trên đĩa).

`bash scripts/plugins/run-overlay-plugin-tests.sh --print-spec` → `oneflow-sdk==0.2.18`.

**Probe độc lập — xanh này là sửa thật, không phải hiệu ứng phụ:**

- `OVERLAY_SDK_SPEC` **không được set** trong môi trường chạy (kiểm trực tiếp: biến
  chưa tồn tại), nên không có đường tắt nào bỏ qua phép suy ra. `SDK_VERSION_ROOT`
  cũng chưa được set.
- SDK **thực sự cài vào môi trường pytest** là bản suy ra: chạy đúng công thức `uv`
  của runner trong thư mục clone với spec suy ra → `tongflow.__version__ = 0.2.18`,
  `ComposeOverlayInput` có mặt. Bộ test của repo plugin `import` trực tiếp
  `tongflow.models.compose_overlay`, nên nó không thể xanh nếu SDK không được cài.
- **Phép thử nhiễu trên đường chạy thật** (không phải `--print-spec`): trỏ
  `SDK_VERSION_ROOT` vào một bản sao `pyproject.toml` ghi `9.9.9` rồi chạy đúng lệnh
  của E4 → `uv` báo `no version of oneflow-sdk==9.9.9 ... unsatisfiable`. Giá trị suy
  ra đi thẳng vào lệnh cài **sau** `cd`, đúng chỗ vòng 13 chết. Chạy lại không nhiễu →
  `1 passed`.
- **Đối chứng bản cũ:** lấy `scripts/lib/sdk-version.sh` của `a1bc936` ra một file tạm
  và gọi `sdk_spec` từ trong thư mục clone → vẫn báo `no such file`, mã 2; gọi thư viện
  hiện tại từ đúng chỗ đó → `oneflow-sdk==0.2.18`, mã 0. Khác biệt duy nhất là cách
  giải gốc repo.
- Repo plugin **không drift**: `plugin_commit_sha` của cả 13 lần chạy là
  `eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5`, trùng sha đã ghi ở round 12 và 13.

**Ghim:** `verified_commit` chuyển sang `28c1a7d6202ce2a8cd40eeae7eb55a8145264891`.
`human_signoff` giữ nguyên (chữ ký Gate 2 của chủ nhân, không do vòng máy này tạo).

**Ghi chú kỹ thuật nhỏ (không phải lỗi, không mở việc):** `sdk-version.sh` neo gốc
bằng `BASH_SOURCE`, nên nó chỉ đúng khi được `source` từ **bash**. Mọi consumer trong
repo đều gọi qua `bash`, nên không ảnh hưởng; chỉ cần nhớ nếu sau này có ai source nó
từ zsh (khi đó gốc rơi về cwd).
