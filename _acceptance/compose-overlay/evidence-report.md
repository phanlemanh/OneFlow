---
schema_version: 2
feature_slug: compose-overlay
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 16cff3a65f60df00a3161ba20a719aa8a281d20d
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
| E22 | AC-16 | ui-check | PASS |
| E23 | AC-16 | judgment | PASS (panel proposal — pending Gate 2 human_override) |

## Evidence

- eval: E1a
  run_id: minted-compose-overlay-E1a-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-03T09:00:00Z
  output: |
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json
    EXIT_CODE=0

- eval: E1b
  run_id: minted-compose-overlay-E1b-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-03T09:00:00Z
  output: |
    Check passed: generated Python artifacts (sdk/tongflow/models, sdk/tongflow/node_slots.py) match committed versions; no diffs and no untracked files detected.

- eval: E2
  run_id: minted-compose-overlay-E2-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.28s

- eval: E3
  run_id: minted-compose-overlay-E3-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.13s

- eval: E4
  run_id: minted-compose-overlay-E4-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E5a
  run_id: minted-compose-overlay-E5a-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E5b
  run_id: minted-compose-overlay-E5b-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E6
  run_id: minted-compose-overlay-E6-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7a
  run_id: minted-compose-overlay-E7a-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E7b
  run_id: minted-compose-overlay-E7b-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E8a
  run_id: minted-compose-overlay-E8a-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.51s

- eval: E8b
  run_id: minted-compose-overlay-E8b-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-03T09:00:00Z
  output: |
    1 passed in 0.09s

- eval: E9a
  run_id: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-03T09:00:00Z
  output: |
    1 passed in 0.08s

- eval: E9b
  run_id: minted-compose-overlay-E9b-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.25s

- eval: E10
  run_id: minted-compose-overlay-E10-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-03T09:00:00Z
  output: |
    1 passed in 0.28s

- eval: E14
  run_id: minted-compose-overlay-E14-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-03T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.14s

- eval: E15
  run_id: minted-compose-overlay-E15-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-03T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.13s

- eval: E16
  run_id: minted-compose-overlay-E16-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-03T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E17
  run_id: minted-compose-overlay-E17-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-03T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E12a
  run_id: minted-compose-overlay-E12a-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-03T09:00:00Z
  output: |
          Tests  8 passed (8)
       Start at  22:30:36
       Duration  1.21s (transform 231ms, setup 0ms, import 474ms, tests 359ms, environment 276ms)

- eval: E12b
  run_id: minted-compose-overlay-E12b-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-03T09:00:00Z
  output: |
          Tests  3 passed (3)
       Start at  22:30:42
       Duration  241ms (transform 101ms, setup 0ms, import 138ms, tests 4ms, environment 0ms)

- eval: E18
  run_id: minted-compose-overlay-E18-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-03T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.03s

- eval: E19
  run_id: minted-compose-overlay-E19-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-03T09:00:00Z
  output: |
          Tests  12 passed (12)
       Start at  22:30:50
       Duration  201ms (transform 64ms, setup 0ms, import 84ms, tests 4ms, environment 0ms)

- eval: E20
  run_id: minted-compose-overlay-E20-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-03T09:00:00Z
  output: |
    OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent

- eval: E21
  run_id: minted-compose-overlay-E21-r12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-03T09:00:00Z
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
    Read back all 6 saved frames (state-1..5 PNGs freshly regenerated this round from the live current-HEAD app + their .html; state-6 PNG/html left as-is, confirmed still valid/unchanged). state-1-empty.png: node shell "Overlay Text/Logo", dashed "Implementation" placeholder card, "No ops yet..." message, 4 disabled-looking add-op buttons (Text/Price tag/Logo/Safe zone), "Apply Overlay" button greyed/disabled — matches Expected "empty, no media, no ops, execute disabled". state-2-ops-image.png: "Ops · media: image", 4 op rows (TEXT/PRICE/LOGO/SAFE) each with edit/remove icons, no time badge on any row, Apply Overlay enabled (black) — matches "media=image, no time fields". state-3-ops-video.png: "Ops · media: video", same 4 op rows but TEXT/PRICE/LOGO rows now carry a grey time badge ("0–3.5s", "3.5–7s", "entire video"); SAFE row has none — matches "media=video, time fields visible". state-4-op-form.png: TEXT op row expanded into a full form (multi-line "Content" textarea holding literal {text} placeholder text, x/y number inputs, Anchor select, Font size, Color swatch+hex input, Alignment select, Max width), node has blue selection ring — matches "text op form expanded (multi-line, {text}, coords, time-adjacent fields)". state-5-error.png: red banner "A logo op needs an image on in:logo — connect an image node.", one LOGO op row rendered in red/destructive styling with "logo image missing (in:logo not connected)", Apply Overlay button greyed/disabled — matches "logo op present but in:logo missing → inline + banner error". state-6-running.png (previously verified, component unchanged since capture): full workspace canvas, node shows rotating gradient border/spinner, "Task started", elapsed timer, disabled "Apply Overlay" replaced by active grey "Cancel execution"-style button — matches "running, shell loading overlay". No content in any frame contradicts Expected; all 6 states align with the design-doc matrix.
  network_observed: clean
  output: |
    Side note (out of my scope, not caused by my edits, not reverted): `git status` shows _acceptance/compose-overlay/contract.md (status: verified -> implemented) and sdk/uv.lock modified — these are not files I touched; consistent with the known pattern that other acceptance-verify subagents mutate git concurrently (see MEMORY.md note "acceptance-verify subagents mutate git"). Left as-is; outside E22's declared paths (only src/components/workspace/nodes/transfer/compose-overlay.tsx).

    exitCode=0: every assertion above passed (HTTP 200, console clean x2, network clean per scoping, P0 gate PASS/exit 0/p0_count 0 on all 6 states, all 6 capture pairs present and content-verified against Expected).

- eval: E23
  judged_by: 3-lens panel (domain-correctness, operational-feasibility, spec-alignment) — fresh-context judge subagent
  verdict: PASS (panel proposal)
  votes:
    - domain-correctness: PASS — Ca 6 capture khop cau truc voi 6 file design-of-record tuong ung: shell/header/icon, "Implementation" picker, "Ops" list + "+ Add op", nut "Apply Overlay" (enabled/disabled dung trang thai), op-form voi border accent xanh va day du field (content, x/y, anchor/font-size, color/alignment, max-width, start/end time thay the "Hien (giay)"), banner loi mau do + op-row loi vien do o state-5, va rotating-border + overlay + spinner + timer o state-6 — dung "shared shell" treatment nhu cac node transfer khac. Cac khac biet quan sat duoc (ngon ngu VI trong file thiet ke vs EN trong capture, so luong op it hon trong state-2/3, nut Cancel bi crop o state-6) deu la du lieu/artefact moi truong da duoc manifest.reading_notes canh bao truoc, khong phai sai lech ngon ngu thiet ke.
    - operational-feasibility: PASS — Cả 6 capture khớp đúng mô tả state trong manifest: state-1 disable nút Apply khi chưa có ops, state-2 (image) không có time-field còn state-3 (video) có thêm badge "entire video" cho op, state-4 mở form đầy đủ multi-line content + x/y/anchor/font/color/align + Start(s)/End(s), state-5 vừa có banner đỏ "in:logo not connected" vừa có inline error trên op row, state-6 dùng đúng overlay loading dùng chung của shell (viền gradient xoay + spinner + nhãn + đồng hồ). Shell node (icon + title + hamburger, khối "Implementation" có avatar dropdown, danh sách "Ops" + nút hành động đen/xám) nhất quán xuyên suốt 6 ảnh và không có yếu tố nào (màu, bo góc, spacing, typography) phá vỡ ngôn ngữ thiết kế chung của canvas/top-bar xuất hiện đồng nhất ở mọi state.
    - spec-alignment: PASS — Doi chieu 6 file HTML design-of-record voi 6 PNG capture: shell BaseNodeShell (icon+title+hamburger, khung bo goc, plugin-select box) giong nhau xuyen suot; state-1 khop dung 2x2 add-menu + nut disabled xam; state-2/3 khop op-row dang badge+summary+edit/x; state-4 giu border xanh "selected" va day du truong (Start/End co that, chi khac cach nhom so voi 1 truong "Hien (giay)" gop cua design — khac biet noi dung nho, khong pha shell); state-5 khop banner-error do + op-row vien do; state-6 khop dung dac tinh loading rieng cua BaseNodeShell (vien gradient xoay, spinner, nhan, dong ho, nut Cancel — da xac nhan co trong HTML du bi cat o viewport chup). Sai khac con lai chi la ngon ngu hien thi (VI trong design vs EN trong capture) va cach nhom truong form, khong phai vi pham ngon ngu thiet ke workspace.
  rationale: Panel 3-lens dong thuan tuyet doi PASS — khong dissent nao duoc ghi nhan. Verdict tong the van la PENDING-JUDGMENT vi day la judgment item cho AC-16 (ngon ngu thiet ke), can human tu xac nhan va dien human_override truoc khi nang overall len PASS o Gate 2.
  human_override: Manh 2026-08-03

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — baseline not re-measured this round (P2); no non-discriminating evals identified this round.

## Variance

none — no stochastic (runs > 1) evals this round; every eval was deterministic and 0/1 or 1/1.

## Iterations

Round 1-11: iterative fixes across ABI/codegen drift, golden-image render tests, cache tiering (L3/L4), UI ops-editor coverage, and the design gate (an earlier css issue was identified and fixed pre-final capture per E22's run_id provenance chain: design-gate-908887ca23 → design-gate-8f52c68794 (pre-cssfix) → r12-final); round-by-round detail not carried into this verify context.
Round 12: all 26 machine/ui-check evals (E1a-E22) PASS, exit 0, no variance; E23 design-language judgment panel (3 lenses) unanimously proposes PASS; baseline not re-measured this round (P2, carried); verdict PENDING-JUDGMENT pending Gate 2 human_override on E23.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify E23 (judgment item, panel proposal PASS), then fill its
      `human_override: <name> <date>` line
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
