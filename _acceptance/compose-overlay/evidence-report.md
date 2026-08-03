---
schema_version: 2
feature_slug: compose-overlay
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: af66de5993b9225ce8b26472b2660d3d8a16d827
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
| E23 | AC-16 | judgment | PASS (panel unanimous; human_override still pending — T3 mandates direct human verdict on every judgment item) |

## Evidence

- eval: E1a
  run_id: minted-compose-overlay-E1a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-03T02:00:00Z
  output: |
    Checked 1 file in 62ms. Fixed 1 file.
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json

- eval: E1b
  run_id: minted-compose-overlay-E1b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-03T02:00:00Z
  output: |
    (no diff after regenerating both generators; git diff --exit-code clean, including untracked files under -uall)

- eval: E2
  run_id: minted-compose-overlay-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.32s

- eval: E3
  run_id: minted-compose-overlay-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.18s

- eval: E4
  run_id: minted-compose-overlay-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E5a
  run_id: minted-compose-overlay-E5a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E5b
  run_id: minted-compose-overlay-E5b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    1 passed in 0.08s
    (plugin_commit_sha not repeated in this command's captured tail; same run-overlay-plugin-tests.sh session/checkout as sibling E2-E10, all of which print eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5)

- eval: E6
  run_id: minted-compose-overlay-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.16s

- eval: E7a
  run_id: minted-compose-overlay-E7a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    .                                                                        [100%]
    1 passed in 0.06s
    (plugin_commit_sha not repeated in this command's captured tail; same run-overlay-plugin-tests.sh session/checkout as sibling E2-E10, all of which print eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5)

- eval: E7b
  run_id: minted-compose-overlay-E7b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E8a
  run_id: minted-compose-overlay-E8a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.40s

- eval: E8b
  run_id: minted-compose-overlay-E8b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E9a
  run_id: minted-compose-overlay-E9a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    .                                                                        [100%]
    1 passed in 0.06s
    EXIT_CODE=0
    (plugin_commit_sha not repeated in this command's captured tail; same run-overlay-plugin-tests.sh session/checkout as sibling E2-E10, all of which print eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5)

- eval: E9b
  run_id: minted-compose-overlay-E9b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.27s

- eval: E10
  run_id: minted-compose-overlay-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-03T02:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.33s

- eval: E14
  run_id: minted-compose-overlay-E14-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-03T02:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.18s

- eval: E15
  run_id: minted-compose-overlay-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-03T02:00:00Z
  output: |
    1 passed in 0.03s

- eval: E16
  run_id: minted-compose-overlay-E16-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-03T02:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E17
  run_id: minted-compose-overlay-E17-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-03T02:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E12a
  run_id: minted-compose-overlay-E12a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-03T02:00:00Z
  output: |
    src/components/workspace/nodes/transfer/compose-overlay.test.tsx
      Tests  6 passed (6)
      Start at  12:06:52
      Duration  1.29s (transform 198ms, setup 0ms, import 491ms, tests 282ms, environment 415ms)
    Round-4-required extra coverage also run and green (both directions of the video-modality half of AC-12):
    (a) pnpm vitest run src/lib/workflow/connection-rules.test.ts — 'multi-modality handle (alsoAccepts)' group includes real data-node sources (videoNode/imageNode/audioNode), not just abiNode. PASS.
    (b) pnpm vitest run src/lib/abi/node-feature-registry.test.ts — 'resolveEdgeHandles — multi-modality handles' group: videoNode resolves to targetHandle 'in:media' on both the targetSpec path and the no-spec/topology-only path. PASS.

- eval: E12b
  run_id: minted-compose-overlay-E12b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-03T02:00:00Z
  output: |
    src/lib/workflow/compose-overlay-export.test.ts
      Tests  3 passed (3)
      Start at  12:06:51
      Duration  381ms (transform 205ms, setup 0ms, import 266ms, tests 4ms, environment 0ms)

- eval: E18
  run_id: minted-compose-overlay-E18-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-03T02:00:00Z
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.02s

- eval: E19
  run_id: minted-compose-overlay-E19-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-03T02:00:00Z
  output: |
    src/lib/abi/conformance.test.ts
      Tests  12 passed (12)
      Start at  12:06:53
      Duration  181ms (transform 57ms, setup 0ms, import 76ms, tests 4ms, environment 0ms)

- eval: E20
  run_id: minted-compose-overlay-E20-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-03T02:00:00Z
  output: |
    OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent

- eval: E21
  run_id: minted-compose-overlay-E21-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-03T02:00:00Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: e22-round4-independent-verify
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-03T02:00:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/compose-overlay/evidence/design/captures/state-4-op-form.png
  observed: |
    Read all 6 saved PNG frames (Read tool, images) + grepped the paired .html DOM dumps. state-1-empty.png (1000x1100): header "Overlay Text/Logo", Implementation picker showing our stub plugin "api-e22-capture-stub" (registry now has one real plugin, unlike round 3's "no plugin scanned" banner), "No ops yet..." text, 4 enabled add-op buttons, disabled gray "Apply Overlay" — matches empty/no-media/no-ops/execute-disabled, not cropped. state-2-ops-image.png: real 1x1 uploaded image connected via media handle, "Ops · media: image", one TEXT row with no time badge, enabled black "Apply Overlay" — matches. state-3-ops-video.png: real generated 64x64 mp4 connected, "Ops · media: video", TEXT row now shows an "entire video" time badge — matches, confirms video-on-in:media works. state-4-op-form.png (fullPage=true, 1000x1100, whole card fits with room to spare): TEXT op's inline form fully visible top-to-bottom — Content textarea, x/y, Anchor, Font size, Color, Alignment, Max width, AND "Start (s)" / "End (s)" fields both fully rendered and un-clipped (grepped into the paired .html: "Start (s)", "End (s)", data-testid="op-start"/"op-end" all present) — this directly contradicts the round-3 judge's "missing time field" reading, which is now proven to have been a viewport-crop artifact, not a real absence. state-5-error.png: red top banner "A logo op needs an image on in:logo — connect an image node.", inline red LOGO row "logo image missing (in:logo not conn...)", disabled gray Apply Overlay — matches. state-6-running.png: real live task (id captured in console/network log, POST /api/task/create -> 200, status polled PROCESSING) rendered on the node — rotating rainbow conic-gradient border, dimmed white/80 overlay, blue spinner, "5s" elapsed counter, solid-gray (non-shimmer) progress label "E22 capture stub: compositing overlay..." — matches the round-2 contrast fix. The hover-reveal cancel affordance is NOT visually apparent in the static (non-hover) screenshot (Loader2 spinner shown, red Square hidden at opacity-0 by default per node-loading-overlay.tsx's own group-hover styling) but IS confirmed present in the DOM: grepped the paired state-6-running.html for aria-label="Cancel execution" / cancelExecution / group/cancel — all found. So both round-3 "missing" claims (state-4 time field, state-6 cancel button) are DOM-present; the time field was a genuine crop bug now fixed by --full+bigger viewport, and the cancel button is DOM-present but only ever visually revealed on hover by design, which I record here rather than asserting from memory. No state was still cropped after the round-4 capture settings.
  network_observed: clean
  output: |
    exitCode = 0: every assertion above passed; no FAIL-eligible request failed; console is clean once the proven-transient HMR blip is excluded.
    CLEANUP DONE: removed plugins/e22-capture.mjs, plugins/e22-network.mjs, plugins/oneflow-api-e22-capture-stub/ (all throwaway, gitignored, never committed). Killed only the :3001 dev server I started; left :3000's foreign process alone. `git diff --stat -- src/ sdk/ config/ scripts/` is empty — no tracked source file was touched, only _acceptance/compose-overlay/evidence/** was updated/added (state-*.html, state-*.png overwritten with round-4 versions; E22-console-r4.txt and E22-network-r4.txt added new — did not delete the round-3 E22-console-r3.txt/E22-network.txt so the round-3 trail stays auditable).

- eval: E23
  judged_by: judge panel (fresh context) — lenses: domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  verified_at: 2026-08-03T02:00:00Z
  votes:
    - domain-correctness: PASS — Doi chieu ca 6 state PNG (kem HTML cung ten) voi design-of-record: header/icon/menu, khung "Implementation", nhan ops-label, thu tu badge TEXT/PRICE/LOGO/SAFE, cap truong toa do/mau/canh, banner loi va treatment loading (vien gradient xoay + spinner + dong ho + nut Cancel, xac nhan qua grep "Cancel execution" trong state-6-running.html) deu khop cau truc reference va token trong styles.css (BaseNodeShell chrome). Ba diem manifest canh bao truoc (khoi "No plugin implementations" la artefact moi truong, op-form state-4 co du op-start/op-end, state-6 dung dung treatment shell) deu kiem chung dung nhu ghi chu, khong phai sai lech thiet ke. Khac biet con lai (ngon ngu Anh/Viet, state-5 capture chi minh hoa 1 op loi thay vi 2 op nhu reference) la du lieu demo, khong pha ngon ngu thiet ke he thong.
    - operational-feasibility: PASS — Ca 6 capture the hien du 6 state cua ma tran (empty/disabled CTA, ops-image khong co time field, ops-video co time field, op-form mo rong, error banner+inline, running-overlay) va doi chieu file .html cung ten xac nhan 2 diem manifest luu y la dung: state-4 co du op-start/op-end (0 va 3.5), state-6 co nut "Cancel execution" (chi bi PNG cat, khong thieu trong DOM); khoi "No plugin implementations..." la artefact moi truong nhu manifest giai thich. Shell dung chung BaseNodeShell (header icon+title+menu, the placeholder net dut, ops-row bo-tron/border/bg-muted dong nhat, CTA full-width) va state-6 dung dung treatment loading (vien gradient xoay + spinner + nhan + dong ho + nut huy) khop voi reference da cap nhat 03/08 — nhin nhu nguoi nha cua cac node transfer khac, khong pha ngon ngu thiet ke workspace. Chenh lech duy nhat quan sat duoc la copy tieng Viet o reference (vd "Dan len media", "Op logo can anh...") so voi tieng Anh o capture ("Apply Overlay", "A logo op needs...") — day la khac biet ngon ngu/copy, khong phai sai lech cau truc/khop-ma-tran nen khong anh huong lens operational-feasibility.
    - spec-alignment: PASS — Ca 6 anh capture khop dung 6 state cua ma tran (empty/no-ops → ops-image khong time field → ops-video co time field ("0–3.5s","3.5–7s","entire video") → op-form mo rong voi day du field theo doi chieu HTML (op-start/op-end co that) → error co ca banner do va inline tren dong LOGO → running dung dung overlay loading chung cua BaseNodeShell (vien gradient xoay, spinner, nhan tien trinh, dong ho "11s", nut Cancel — xac nhan qua HTML dan .lucide-loader-circle + title="Cancel execution"). Shell (card bo tron, header icon+title+menu, badge pill cho tung loai op, CTA den "Apply Overlay") nhat quan xuyen suot 6 state, dung ngon ngu component chung (data-slot=card, badge bg-primary/10) nen "nhin nhu nguoi nha" cua cac node transfer khac; khoi "Implementation: No plugin..." theo reading_notes la artefact moi truong khong plugin, khong tinh la loi thiet ke.
  human_override:

## Analyst

carried tu round 1 — baseline khong do lai round nay (P2: evals.yaml khong doi tu lan baseline cuoi).

Eval khong-phan-biet (pass tren CA HEAD lan baseline, chung minh harness chu khong phai feature):

- E1a — `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`. Xanh tren baseline vi day la guard chung cho toan bo ABI (khong rieng compose-overlay); tu no khong chung minh duoc slot moi dung. Can gan them assertion rieng cho `ComposeOverlayInputRootOpsItem` / `COMPOSE_OVERLAY` xuat hien trong file da generate, hoac coi day la regression-guard co chu y va ghi ro trong contract.
- E16 — `test_tier_lists_are_disjoint_and_pinned`. Ban than test nay xanh tren baseline vi no kiem tinh disjoint cua HAI danh sach noi chung, khong phai rieng viec compose-overlay co mat trong Tier A. Nen viet lai de assert cu the `"compose-overlay" in TIER_A_ALLOWLIST` truoc khi kiem disjoint, thay vi chi dua vao tinh bat bien cau truc.
- E17 — `test_abi_guard_catches_both_directions`. Guard ABI hai chieu la bat bien co san tu truoc feature nay; no xanh tren baseline vi khong co slot nao (chua co compose-overlay) van thoa guard. Can them mot case rieng bat loi neu ABI cua compose-overlay lech khoi model Python de test thuc su phan biet duoc feature.
- E19 — `pnpm vitest run src/lib/abi/conformance.test.ts` (nua TS). Suite conformance tong quat da xanh truoc khi co compose-overlay; fixture moi chi la mot case duoc them vao mot suite da pass. Nen tach assertion rieng cho fixture compose-overlay (hoac xac nhan case do that su chay va fail neu bi xoa) de eval nay phan biet duoc feature thay vi an trong suite chung.

## Variance

none — every multi-run eval is uniform (khong eval nao co runs > 1 hoac variance:true trong vong nay).

## Iterations

Round 4: E22 UI capture lam lai voi `--full` + viewport ≥900x1000 cho ca 6 state; hai diem round-3 judge doc nham ("thieu Start/End field" o state-4, "thieu nut Cancel" o state-6) da duoc chung minh la artefact do PNG bi cat viewport — ca hai deu co that trong DOM (grep xac nhan `op-start`/`op-end` va `aria-label="Cancel execution"`). Toan bo 26 machine/ui-check eval + panel judgment E23 (3/3 lens PASS) deu xanh; verdict tong van la PENDING-JUDGMENT vi day la hop dong T3 — bat buoc human tu tay xac nhan TUNG judgment item (E23) bang `human_override` du panel da dong thuan PASS.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items (E23) and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them) — panel
      voted unanimous PASS on E23 but that vote alone cannot upgrade this report
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
