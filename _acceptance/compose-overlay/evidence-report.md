---
schema_version: 2
feature_slug: compose-overlay
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4447f4119fb379a25522a2769138155734be064e
human_signoff:
---

# Evidence Report: compose-overlay

Round 6. Every machine eval below exited 0 and the E23 judge panel is a unanimous PASS across all three lenses — but code review (see `review-findings.md`) found an in-contract defect mapped to AC-12 (mediaKind resolves the wrong media type on first render for an ABI video upstream, because it memoizes a read of a non-reactive registry populated only after render) that the current E12a test suite does not catch. `failed_evals` is empty because no eval command itself failed; the REJECT comes from that review finding, not from a red eval.

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
| E23 | AC-16 | judgment | PASS |

## Evidence

- eval: E1a
  run_id: minted-compose-overlay-E1a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-03T15:25:00Z
  output: |
    Checked 1 file in 92ms. Fixed 1 file.
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json

- eval: E1b
  run_id: minted-compose-overlay-E1b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-03T15:25:00Z
  output: |
    Script passed silently. Generated Python artifacts (sdk/tongflow/models/ and sdk/tongflow/node_slots.py) match committed code. No diffs detected and no untracked files.

- eval: E2
  run_id: minted-compose-overlay-E2-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.33s

- eval: E3
  run_id: minted-compose-overlay-E3-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.12s

- eval: E4
  run_id: minted-compose-overlay-E4-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-03T15:25:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.12s

- eval: E5a
  run_id: minted-compose-overlay-E5a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E5b
  run_id: minted-compose-overlay-E5b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E6
  run_id: minted-compose-overlay-E6-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-03T15:25:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E7a
  run_id: minted-compose-overlay-E7a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E7b
  run_id: minted-compose-overlay-E7b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.17s

- eval: E8a
  run_id: minted-compose-overlay-E8a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.33s

- eval: E8b
  run_id: minted-compose-overlay-E8b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.20s

- eval: E9a
  run_id: minted-compose-overlay-E9a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9b
  run_id: minted-compose-overlay-E9b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.27s

- eval: E10
  run_id: minted-compose-overlay-E10-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-03T15:25:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.33s

- eval: E14
  run_id: minted-compose-overlay-E14-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-03T15:25:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E15
  run_id: minted-compose-overlay-E15-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-03T15:25:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.16s

- eval: E16
  run_id: minted-compose-overlay-E16-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-03T15:25:00Z
  output: |
    1 passed in 0.02s

- eval: E17
  run_id: minted-compose-overlay-E17-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-03T15:25:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E12a
  run_id: minted-compose-overlay-E12a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-03T15:25:00Z
  output: |
    pnpm vitest run src/components/workspace/nodes/transfer/compose-overlay.test.tsx
    Tests  7 passed (7)
    Start at  15:25:07
    Duration  1.94s (transform 423ms, setup 0ms, import 834ms, tests 384ms, environment 556ms)

- eval: E12b
  run_id: minted-compose-overlay-E12b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-03T15:25:00Z
  output: |
    pnpm vitest run src/lib/workflow/compose-overlay-export.test.ts
    Tests  3 passed (3)
    Start at  15:25:08
    Duration  372ms (transform 176ms, setup 0ms, import 228ms, tests 7ms, environment 0ms)

- eval: E18
  run_id: minted-compose-overlay-E18-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-03T15:25:00Z
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.03s

- eval: E19
  run_id: minted-compose-overlay-E19-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-03T15:25:00Z
  output: |
    pnpm vitest run src/lib/abi/conformance.test.ts
    Tests  12 passed (12)
    Start at  15:25:10
    Duration  193ms (transform 61ms, setup 0ms, import 82ms, tests 4ms, environment 0ms)

- eval: E20
  run_id: minted-compose-overlay-E20-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-03T15:25:00Z
  output: |
    OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent

- eval: E21
  run_id: minted-compose-overlay-E21-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-03T15:25:00Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: e22-round6-independent-verify
  exit_code: 0
  verifier: config:executors.design.gate
  verified_at: 2026-08-03T15:25:00Z
  screenshot: _acceptance/compose-overlay/evidence/design/captures/state-1-empty.png
  observed: |
    Read all 6 committed PNGs directly (evidence/design/captures/state-*.png, 1000x1100px each). state-1-empty.png: clean "Overlay Text/Logo" shell, "Implementation: api-e22-r5-stub", "No ops yet" copy, 4 disabled add-op buttons (Text/Price tag/Logo/Safe zone), gray disabled "Apply Overlay" — no errors, no clutter. state-2-ops-image.png: real 64x64 blue image thumbnail wired via a "media" edge into the overlay node, one configured TEXT op ("E22 round-5 capture" · 0.5, 0.12), enabled black "Apply Overlay" — no broken-image icon. state-3-ops-video.png: real 64x64 green video thumbnail wired in, TEXT op scoped "entire video" (time-window controls present, confirming the getEffectiveOutputType fix path renders correctly for video). state-4-op-form.png: the same video node's TEXT op expanded into a full edit form — content textarea, x/y, anchor select, font size, color swatch+hex, alignment select, max width, start/end(s) — all fields legible, no overlap. state-5-error.png: red destructive-styled banner "A logo op needs an image on in:logo — connect an image node." plus a red-bordered LOGO op row "logo image missing (in:logo not conn...)" — clear, on-brand error state. state-6-running.png: rotating rainbow-gradient border around the node, spinner icon, "Task started" tooltip, "3s" timer, grayed/disabled "Apply Overlay" — matches the round-4 decision to use a real animated loading shell (not a shimmer skeleton). All 6 states are visually distinct, internally consistent, and match the ma trận design-doc names (empty/ops-image/ops-video/op-form/error/running) with no cross-contamination between states.
  network_observed: clean
  output: |
    Dev-server handling: no server was listening on :3000 at session start (curl -> 000, lsof empty). Started `pnpm dev` myself in the background, polled http://localhost:3000/workspace every 2s (ready after ~4s), and killed only the two PIDs I started (next dev + pnpm dev wrapper) at the end — confirmed port 3000 no longer responds afterward. No code files were touched; only new evidence .txt files were added (git status shows only the 2 new evidence files + the pre-existing untracked pnpm-workspace.yaml that was already untracked before this session started).

    Overall: exit 0. All 6 states pass the P0 design gate, console is clean, network is clean (app-scope) for the actual "ov1"-based evidence chain under test for E22/E23; a co-located but out-of-scope stale fixture ("e22-fixture") on the shared dev DB was found, cross-checked against already-documented prior-round explanation, and does not affect this verdict.

- eval: E23
  judged_by: 3-lens panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: |
    - domain-correctness: PASS — Ca 6 state deu khop cau truc voi design-of-record: header icon+title+menu, khoi plugin-select ("Implementation" + dropdown chip) giong het pattern cua cac node transfer khac (vd Text-to-Image trong workspace), ops list voi op-type badge/summary/act, 2x2 add-menu, banner-error + op-row.error o state-5, va op-form o state-4 co du cac field (content, x/y, anchor, font-size, color, alignment, max-width, start/end) dung nhu manifest mo ta. State-6 co du 5 yeu to cua shared BaseNodeShell loading treatment (vien gradient xoay, spinner, nhan "Task started", dong ho "3s", nut huy theo reading_notes) du vi tri overlay hoi lech tam so voi ban ve, khong du de xem la pha ngon ngu thiet ke. Khong thay mau sac/border-radius/spacing la ngoai token cua styles.css.
    - operational-feasibility: PASS — Ca 6 capture khop cau truc voi design-of-record: state-1 (empty, 2x2 add-menu, execute disabled), state-2/3 (op-row voi badge/summary/actions, state-3 co the hien thi thoi luong "entire video" dung yeu cau "time fields visible"), state-4 (form day du truong — cross-check DOM xac nhan co ca op-start/op-end du bi crop trong PNG), state-5 (banner-error + op-row.error mau do dung token), state-6 (rotating-gradient border + spinner + "Task started"/timer, va DOM xac nhan co nut "Cancel execution" du bi crop khoi anh — dung nhu reading_notes mo ta ve treatment loading chung cua BaseNodeShell). Node dung chung header/rounded-card/shadow voi cac node Image/Video sibling xuat hien cung canvas trong cac anh, khong thay yeu to nao pha ngon ngu thiet ke workspace.
    - spec-alignment: PASS — Ca 6 state khop cau truc voi design-of-record: state-1 giu grid 2x2 nut add-op + Apply disabled xam; state-2/3 dung dung quy tac an/hien op-time theo media (anh: khong co, video: co nhan "entire video"); state-4 co du truong (Start/End tach doi thay vi 1 truong gop, dung nhu reading_notes cho phep) va node khoac vien selected xanh; state-5 co ca banner do lan op-row loi voi cung style vien/text do; state-6 dung dung treatment loading chung cua BaseNodeShell (conic-gradient border, spinner, overlay mo, nut Cancel xac nhan qua data-testid trong html dinh kem) dung nhu ghi chu. Ngon ngu thiet ke workspace (radius, shadow, badge, nut disabled, vien loi) khong bi pha; khoi picker "Implementation" day du hon ban ve don gian nhung la widget dung chung cua cac node transfer khac nen van "nguoi nha". Khac biet duy nhat la copy tieng Anh thay vi tieng Viet trong mockup — day la noi dung/locale, khong phai vi pham ngon ngu thiet ke thi giac.
  human_override:

## Analyst

carried tu round 1 — baseline khong do lai round nay (P2 — evals.yaml khong doi tu lan baseline cuoi).

Non-discriminating (green tren CA HEAD lan baseline — chung minh harness chu khong phai feature; can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- E1a — `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` — bat bien "ABI generation la clean" dung voi bat ky cay ABI hop le nao, khong rieng cho cac field moi cua compose-overlay.
- E16 — `tests/test_node_cache_tier_b.py::test_tier_lists_are_disjoint_and_pinned` — bat bien tong quat cua cache-tier (hai allowlist khong giao nhau), khong dac thu compose-overlay.
- E17 — `tests/test_node_cache_tier_b.py::test_abi_guard_catches_both_directions` — guard ABI hai chieu tong quat, khong rieng hanh vi overlay.
- E19 — `pnpm vitest run src/lib/abi/conformance.test.ts` (nua TS) — bat bien tong quat cua conformance suite.

Ca bon deu duoc ghi baseline "n-a" round nay vi khong do lai (ket qua xanh-ca-hai-phia duoc carry tu quyet dinh baseline round 1).

## Variance

none — every multi-run eval is uniform (khong co eval nao co runs > 1 round nay).

## Iterations

Round 5: dong lo hong thu 5 — node tung tu doan modality bang `sourceHandle === "out:video"`, da thay bang `getEffectiveOutputType()` doc tu ABI mount registry de split-video/drop-video van duoc nhan dung la video.
Round 6: toan bo 26 machine eval (E1a-E22) exit 0 va panel E23 dong thuan PASS ca 3 lens, nhung code review phat hien chinh loi goi `getEffectiveOutputType()` do bi memoize qua mot module map khong reactive (`src/lib/abi/node-registry.ts`), chi duoc dien boi mot `useEffect` chay SAU lan render dau — tren workflow phuc hoi voi upstream ABI video, memo co the cache `mediaKind="image"` truoc khi registry kip dang ky, va khong deps nao cua no thay doi de buoc tinh lai. Verdict REJECT; tra ve implementation de sua memo/registry truoc khi AC-12 duoc ky.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
