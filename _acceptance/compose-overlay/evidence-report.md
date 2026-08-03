---
schema_version: 2
feature_slug: compose-overlay
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7ff8bd504d0a947386fceba0d10a27cafb0fcd6a
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
  run_id: minted-compose-overlay-E1a-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-03T09:00:00Z
  output: |
    Checked 1 file in 85ms. Fixed 1 file.
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json

- eval: E1b
  run_id: minted-compose-overlay-E1b-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-03T09:00:00Z
  output: |
    Exit code: 0

- eval: E2
  run_id: minted-compose-overlay-E2-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.49s

- eval: E3
  run_id: minted-compose-overlay-E3-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.15s

- eval: E4
  run_id: minted-compose-overlay-E4-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-03T09:00:00Z
  output: |
    1 passed in 0.20s

- eval: E5a
  run_id: minted-compose-overlay-E5a-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.10s

- eval: E5b
  run_id: minted-compose-overlay-E5b-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.12s

- eval: E6
  run_id: minted-compose-overlay-E6-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7a
  run_id: minted-compose-overlay-E7a-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.19s

- eval: E7b
  run_id: minted-compose-overlay-E7b-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.12s

- eval: E8a
  run_id: minted-compose-overlay-E8a-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.43s

- eval: E8b
  run_id: minted-compose-overlay-E8b-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E9a
  run_id: minted-compose-overlay-E9a-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9b
  run_id: minted-compose-overlay-E9b-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.28s

- eval: E10
  run_id: minted-compose-overlay-E10-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-03T09:00:00Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.28s

- eval: E14
  run_id: minted-compose-overlay-E14-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-03T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E15
  run_id: minted-compose-overlay-E15-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-03T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E16
  run_id: minted-compose-overlay-E16-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-03T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E17
  run_id: minted-compose-overlay-E17-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-03T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E12a
  run_id: minted-compose-overlay-E12a-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-03T09:00:00Z
  output: |
         Tests  8 passed (8)
      Start at  20:10:16
      Duration  1.50s (transform 273ms, setup 0ms, import 587ms, tests 340ms, environment 456ms)

- eval: E12b
  run_id: minted-compose-overlay-E12b-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-03T09:00:00Z
  output: |
          Tests  3 passed (3)
       Start at  20:10:15
       Duration  363ms (transform 172ms, setup 0ms, import 241ms, tests 4ms, environment 0ms)

- eval: E18
  run_id: minted-compose-overlay-E18-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-03T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.03s

- eval: E19
  run_id: minted-compose-overlay-E19-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-03T09:00:00Z
  output: |
          Tests  12 passed (12)
       Start at  20:10:16
       Duration  266ms (transform 75ms, setup 0ms, import 102ms, tests 4ms, environment 0ms)

- eval: E20
  run_id: minted-compose-overlay-E20-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-03T09:00:00Z
  output: |
    OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent

- eval: E21
  run_id: minted-compose-overlay-E21-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-03T09:00:00Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: minted-compose-overlay-E22-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-03T09:00:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/compose-overlay/evidence/design/captures/state-1-empty.png
  observed: |
    Read all 6 captures directly (Read tool, image mode) plus produced 1 fresh independent-verifier live frame. state-1-empty.png: clean "Overlay Text/Logo" node shell, Implementation="api-e22-r5-stub", "No ops yet. Add text, a price tag, a logo or a safe zone." + 4 disabled add-op buttons (Text/Price tag/Logo/Safe zone) + greyed "Apply Overlay" — matches Expected empty state, no stray content, no a11y-obvious issue. state-2-ops-image.png: real blue 64x64 Image node wired via "media" edge; Ops·media:image shows one TEXT op row ("E22 round-5 capture" · 0.5, 0.12) with edit/delete icons; Apply Overlay enabled (solid black) — matches ops-image state. state-3-ops-video.png: real green 64x64 Video node wired in; Ops·media:video shows TEXT op scoped "entire video"; Apply Overlay enabled — matches ops-video state. state-4-op-form.png: same video-wired node with the op-edit form expanded (Content textarea, x/y 0-1, Anchor dropdown "top-center", Font size, Color #FFFFFF swatch, Alignment, Max width, empty Start/End(s) fields since scope="entire video"), card has a visible blue focus ring — matches op-form-expanded state; independently reproduced this exact interactive state live in the browser against the persisted fixture node "co-4-form" (clicking its TEXT op's Edit button expands the identical field set), confirming it is not a static/fabricated capture. state-5-error.png: red destructive-styled banner "A logo op needs an image on in:logo — connect an image node." directly under Implementation, plus a matching red-bordered LOGO op row "logo image missing (in:logo not conn...)"; Apply Overlay greyed/disabled — matches error state. state-6-running.png: rotating rainbow-gradient left border, spinner + "Task started" + "3s" timer overlaying the card, Implementation/Ops rows dimmed, Add op and Apply Overlay both disabled/greyed — matches running state. All 6 are distinct, no broken images, no placeholder/lorem-ipsum content, no console-visible error text baked into the frames. Supplementary live frame E22-live-workspace-r9-independent-verify.png (fresh `pnpm ui:capture` run this round against http://localhost:3000/workspace): app renders cleanly end-to-end (toolbar, canvas, nodes render with no error boundary/blank screen) — shows a different demo workflow ("示例/example") because puppeteer's headless session is a separate anonymous browser profile from my interactive Claude Browser tab, not a regression; this frame is a capture-pipeline health check, not one of the 6 canonical states.
  network_observed: clean
  output: |
    9. Evidence dir pre-existing (mkdir -p run defensively): _acceptance/compose-overlay/evidence/design/captures/ already holds all 6 required PNG+HTML pairs at HEAD; added 2 new supplementary files this round (E22-live-workspace-r9-independent-verify.png, E22-network-r9-independent-verify.txt) — both untracked/new, no existing evidence overwritten or altered.

    Overall: exit 0. All 6 states pass the P0 design gate, all 6 PNG/HTML pairs present and correct in evidence/design/captures/, console clean (fresh tab), network clean (app-scope, no FAIL-eligible failures), dev server self-started and stopped cleanly.

- eval: E23
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: PASS
  verdict: UNCERTAIN
  rationale: Panel proposal was PASS (2 of 3 lenses), but operational-feasibility dissented over the ops-editor rendering only 1 op-row per capture while design-of-record specifies 2-4 stacked ops (price-tag, logo, safe-zone badges) for states 2-5 — a gap in the feature's most load-bearing UI element, not covered by the 3 accepted exceptions in reading_notes. Because the panel is not unanimous, this item stays UNCERTAIN pending a human's own look at Gate 2.
  votes:
    - domain-correctness: PASS — Cả 6 capture khớp cấu trúc reference: header icon+title+menu, plugin-select shadcn-style, ops list với chip TEXT/GIÁ/LOGO/SAFE, op-form 4 hàng field, banner-error + op-row đỏ ở state-5, rotate-border + spinner + cancel treatment đúng chuẩn BaseNodeShell ở state-6. Chrome (rounded-lg, white surface, gray border, shadow, nút đen "Apply Overlay", disabled = xám) nhất quán với ngôn ngữ shadcn/BaseNodeShell dùng xuyên suốt workspace, không có yếu tố nào phá vỡ hệ thống thiết kế hay trông generic/template.
    - operational-feasibility: FAIL — Design-of-record đặc tả state-2/3/4/5 với 2-4 op stacked (badge GIÁ, LOGO, SAFE, và 2 op CHỮ với time range khác nhau ở state-3), nhưng cả 4 capture này chỉ render đúng 1 op-row (badge TEXT, hoặc LOGO lỗi ở state-5) — badge GIÁ và SAFE không xuất hiện trong bất kỳ capture nào trong 6 state. Đây là gap có căn cứ trực tiếp (đếm data-testid="op-row" = 1 ở mọi state thay vì 2-4 như manifest mô tả), không nằm trong 3 ngoại lệ mà reading_notes cho phép.
    - spec-alignment: PASS — Cả 6 state-capture giữ đúng shell chung (white card, gray-200 border, radius/shadow, shadcn-style input, blue selection ring) và tái hiện đúng các lớp của ops-editor trong design-of-record: op-row, op-form mở rộng, banner-error + op-row.error, và rotate-border + spinner + Cancel execution ở state-6. Khác biệt quan sát được (ngôn ngữ UI, icon header, số lượng op ít hơn do dữ liệu fixture) là khác biệt về nội dung/dữ liệu, không phá vỡ ngôn ngữ thiết kế workspace.
  human_override:

## Analyst

carried tu round 1 — baseline khong do lai round nay

Non-discriminating (green tren ca HEAD lan baseline round 1): E1a, E16, E17, E19. Cac eval nay pass bat ke co feature hay khong — chung minh harness/guard san co (gen:abi idempotent, Tier-B allowlist disjoint, ABI-guard 2 chieu, TS-conformance suite) chu khong tu no chung minh compose-overlay dung. Xem lai o vong regen contract xem co nen viet lai de assert hanh vi moi (vd: assert compose-overlay co mat trong Tier A allowlist) hay xac nhan la regression-guard co chu y va giu nguyen.

Lenh suite xanh-ca-hai-phia (pnpm build/typecheck/lint:check/test, sdk pytest full suite, pnpm verify:plugins) la regression-guard binh thuong, khong liet ke o day.

## Variance

none — moi eval deu chay 1 lan (deterministic), khong co eval nao co runs > 1 vong nay.

## Iterations

Round 9: toan bo 26 machine eval (E1a-E22) xanh, exit 0; judge panel E23 chia phieu (2 PASS / 1 FAIL tu lens operational-feasibility ve so luong op-row thieu trong capture) — khong quay lai implementation vong nay, bao cao dung PENDING-JUDGMENT de chuyen len Gate 2 cho nguoi quyet UNCERTAIN.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
