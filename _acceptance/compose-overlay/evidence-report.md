---
schema_version: 2
feature_slug: compose-overlay
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b750a3afbb1395b89f3fa960dad6ba07cb296d59
human_signoff:
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
| E23 | AC-16 | judgment | UNCERTAIN |

## Evidence

- eval: E1a
  run_id: minted-compose-overlay-E1a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-02T14:40:00Z
  output: |
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json

- eval: E1b
  run_id: minted-compose-overlay-E1b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-02T14:40:00Z
  output: |
    EXIT_CODE: 0

- eval: E2
  run_id: minted-compose-overlay-E2-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.86s

- eval: E3
  run_id: minted-compose-overlay-E3-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.25s

- eval: E4
  run_id: minted-compose-overlay-E4-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E5a
  run_id: minted-compose-overlay-E5a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-02T14:40:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.20s

- eval: E5b
  run_id: minted-compose-overlay-E5b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E6
  run_id: minted-compose-overlay-E6-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.15s

- eval: E7a
  run_id: minted-compose-overlay-E7a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.19s

- eval: E7b
  run_id: minted-compose-overlay-E7b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E8a
  run_id: minted-compose-overlay-E8a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.35s

- eval: E8b
  run_id: minted-compose-overlay-E8b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-compose-overlay-E9a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9b
  run_id: minted-compose-overlay-E9b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.19s

- eval: E10
  run_id: minted-compose-overlay-E10-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-02T14:40:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.34s

- eval: E14
  run_id: minted-compose-overlay-E14-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-02T14:40:00Z
  output: |
    1 passed in 0.14s

- eval: E15
  run_id: minted-compose-overlay-E15-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-02T14:40:00Z
  output: |
    1 passed in 0.04s

- eval: E16
  run_id: minted-compose-overlay-E16-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-02T14:40:00Z
  output: |
    .                                                                        [100%]\n1 passed in 0.02s

- eval: E17
  run_id: minted-compose-overlay-E17-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-02T14:40:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E12a
  run_id: minted-compose-overlay-E12a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-02T14:40:00Z
  output: |
    Tests  6 passed (6)
    Start at  14:35:37
    Duration  1.58s (transform 316ms, setup 0ms, import 728ms, tests 302ms, environment 449ms)
    (round 5 additions run + reported separately per instruction: connection-rules.test.ts alsoAccepts group, node-feature-registry.test.ts resolveEdgeHandles group, edge-target-options.test.ts inline-select + canSwapOntoHandle two-direction refusal group — all three included in the 6 passed above.)

- eval: E12b
  run_id: minted-compose-overlay-E12b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-02T14:40:00Z
  output: |
    Tests  3 passed (3)
    Start at  14:35:38
    Duration  268ms (transform 105ms, setup 0ms, import 151ms, tests 4ms, environment 0ms)

- eval: E18
  run_id: minted-compose-overlay-E18-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-02T14:40:00Z
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.02s

- eval: E19
  run_id: minted-compose-overlay-E19-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-02T14:40:00Z
  output: |
    Tests  12 passed (12)
    Start at  14:35:42
    Duration  205ms (transform 86ms, setup 0ms, import 108ms, tests 4ms, environment 0ms)

- eval: E20
  run_id: minted-compose-overlay-E20-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-02T14:40:00Z
  output: |
    OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent

- eval: E21
  run_id: minted-compose-overlay-E21-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-02T14:40:00Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: e22-round5-independent-verify
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-02T14:40:00Z
  screenshot: evidence/design/captures/state-1-empty.png
  observed: |
    Read all 6 saved PNG frames directly (Read tool, images) — each opened and compared against the 6-state matrix / round-4 baseline:
    state-1-empty.png (1000x1100): "Overlay Text/Logo" header, Implementation picker showing the throwaway stub "api-e22-r5-stub" (only plugin installed in this run's registry), "No ops yet. Add text, a price tag, a logo or a safe zone.", 4 enabled add-op buttons (Text/Price tag/Logo/Safe zone), disabled gray "Apply Overlay" — matches empty/no-media/no-ops/execute-disabled.
    state-2-ops-image.png: real uploaded 64x64 image node connected via a real edge into "media" handle, "Ops · media: image" label, one TEXT op row with no time badge, enabled solid-black "Apply Overlay" — matches, no time badge for image media confirmed.
    state-3-ops-video.png: real generated 64x64 mp4 connected the same way, "Ops · media: video", TEXT row now shows an "entire video" time badge — matches, video-conditional time badge confirmed working post-fix.
    state-4-op-form.png (fullPage, video media): TEXT op's inline form fully expanded and un-clipped top-to-bottom — Content textarea, x/y, Anchor, Font size, Color, Alignment, Max width, and Start (s)/End (s) fields both fully visible (also grepped into the paired .html: data-testid="op-start"/"op-end" both present) — matches round-4's fixed (non-cropped) capture.
    state-5-error.png: red top banner "A logo op needs an image on in:logo — connect an image node.", inline red LOGO row "logo image missing (in:logo not conn...)", disabled gray "Apply Overlay" — matches.
    state-6-running.png: a genuine live task (real POST /api/task/create -> 200, taskId returned, /api/task/wait polled and returned 200) rendered on the node — rotating rainbow conic-gradient border, dimmed overlay, blue spinner, "Task started" label, "3s" elapsed counter — matches the loading-state treatment. Grepped the paired state-6-running.html: aria-label="Cancel execution" present in the DOM (hover-only affordance, not visible in the static non-hover screenshot, same as round 4's note). No state was cropped; all 6 rendered within the 1000x1100 viewport with room to spare.
  network_observed: clean
  output: |
    state-5-error.png / .html
    state-6-running.png / .html
    Plus: _acceptance/compose-overlay/evidence/E22-console-r5.txt, _acceptance/compose-overlay/evidence/E22-network-r5.txt

- eval: E23
  judged_by: judge panel (fresh context) — lenses: domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  verdict: UNCERTAIN
  verified_at: 2026-08-02T14:40:00Z
  votes:
    - domain-correctness: PASS — Cả 6 capture khớp đúng cấu trúc state trong manifest: state-1 disabled Apply + empty-ops message, state-2 (media=image) không có time field, state-3 (media=video) có badge "entire video", state-4 op-form đủ các field (content/x/y/anchor/font/color/alignment/max-width/start-end) không bị thiếu như lo ngại, state-5 có cả banner lỗi và inline chip lỗi đỏ cho logo thiếu, state-6 dùng đúng overlay loading dùng chung (viền gradient xoay + spinner + nhãn + đồng hồ) như reading_notes mô tả. Panel Overlay Text/Logo dùng chung chrome với các node transfer khác trên canvas (card bo góc trắng, header icon+title+hamburger, nút CTA đen có icon), không thấy artefact "No plugin implementations were scanned" hay dấu hiệu phá ngôn ngữ thiết kế workspace trong 6 ảnh đã cho.
    - operational-feasibility: FAIL — State-6 (running) co loi lop de: chu dem gio "5s" de thang len tren van ban ops-row phia duoi ("0,5, 0.12"), khien ca hai deu khong doc duoc — backdrop lam mo/toi cua overlay (theo spec la inset:0 phu het node, background+blur) chi phu duoc phan tren (select "api-e22-capture-stub" nhat mau) con hang Ops/TEXT ben duoi van hien ro net, khong duoc lam mo dong bo, dan den overlay va noi dung nen chong len nhau. Day la loi hien thi that, thay ro trong pixel capture, khong nam trong 3 dien giai cua reading_notes (moi truong scan plugin, anh bi cat do viewport, hay treatment loading dung chung) nen khong the bo qua. 5 state con lai (1,2,3,4,5) khop cau truc voi design-of-record va giu dung ngon ngu BaseNodeShell, nhung rieng state-6 pha vo tinh chuyen nghiep/doc duoc cua workspace nen tong the fail lens operational-feasibility.
    - spec-alignment: PASS — Ca 6 capture the hien dung cau truc mo ta trong manifest: state-1 co CTA "Apply Overlay" bi disable (xam) khi chua co ops; state-2/3 chuyen tiep dung "no time fields" -> badge "entire video" khi media=video; state-4 co day du textarea multi-line + x/y + anchor + font size + color + alignment + max width + Start/End(s); state-5 co ca banner do lan chip inline do "logo image missing (in:logo not conn...)"; state-6 dung spinner + vien gradient xoay + nhan trang thai + dong ho dem, dung "shared BaseNodeShell loading treatment" nhu reading_notes da luu y truoc. Toan bo 6 anh dung chung mot BaseNodeShell chrome (header icon+title+hamburger, khung Implementation, toolbar canvas duoi) nen doc nhu mot node-hang-cung-nha voi cac node transfer khac, khong thay pha vo ngon ngu thiet ke; phan chu overlap nhe o state-6 (nhan trang thai de len noi dung nen) khop voi ghi chu "treatment dung chung", khong phai loi rieng cua compose-overlay.
  rationale: Panel split 2 PASS (domain-correctness, spec-alignment) / 1 FAIL (operational-feasibility) on the same state-6 capture — the dissenting lens found a genuine, pixel-visible overlap between the elapsed-time label and the Ops/TEXT row text beneath it that the other two lenses did not weigh as disqualifying. This is a real rendering defect, not a capture artefact, so it needs a human call rather than an averaged verdict.
  human_override:

## Analyst

carried tu round 1 — baseline khong do lai round nay
E1a, E16, E17, E19

## Variance

none — round nay khong co eval nao mang field runs > 1; tat ca deterministic, single run (0/1 hoac 1/1).

## Iterations

Round 4: E22 design-gate 6-state capture closed (state-4 op-form crop fixed); AC-12 review flagged a HIGH gap post Gate-2 cycle (a video edge could be silently swapped onto the image-only in:logo handle with no warning), requiring new connection-rules / node-feature-registry / edge-target-options coverage.
Round 5: added E12a sub-checks (connection-rules.test.ts alsoAccepts, node-feature-registry.test.ts resolveEdgeHandles, edge-target-options.test.ts inline-select + canSwapOntoHandle bidirectional refusal) and re-ran E22 design gate after the custom-edge/edge-target-options changes — all 26 machine evals pass; judge panel split on E23 (operational-feasibility FAIL: state-6 elapsed-time label overlaps ops-row text) → verdict PENDING-JUDGMENT, awaiting human_override at Gate 2.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
