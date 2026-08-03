---
schema_version: 2
feature_slug: compose-overlay
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cd1816f78affdf8a83803494ebd0d1002d1afd5a
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
  run_id: minted-compose-overlay-E1a-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-03T10:00:00Z
  output: |
    Checked 1 file in 50ms. Fixed 1 file.
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json

- eval: E1b
  run_id: minted-compose-overlay-E1b-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-03T10:00:00Z
  output: |
    (no output captured — script completed clean)

- eval: E2
  run_id: minted-compose-overlay-E2-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.25s

- eval: E3
  run_id: minted-compose-overlay-E3-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.12s

- eval: E4
  run_id: minted-compose-overlay-E4-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.22s

- eval: E5a
  run_id: minted-compose-overlay-E5a-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.11s

- eval: E5b
  run_id: minted-compose-overlay-E5b-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E6
  run_id: minted-compose-overlay-E6-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E7a
  run_id: minted-compose-overlay-E7a-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E7b
  run_id: minted-compose-overlay-E7b-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E8a
  run_id: minted-compose-overlay-E8a-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.49s

- eval: E8b
  run_id: minted-compose-overlay-E8b-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-compose-overlay-E9a-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E9b
  run_id: minted-compose-overlay-E9b-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.20s

- eval: E10
  run_id: minted-compose-overlay-E10-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-03T10:00:00Z
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  output: |
    .                                                                        [100%]
    1 passed in 0.23s

- eval: E14
  run_id: minted-compose-overlay-E14-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-03T10:00:00Z
  output: |
    1 passed in 0.03s

- eval: E15
  run_id: minted-compose-overlay-E15-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-03T10:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E16
  run_id: minted-compose-overlay-E16-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-03T10:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E17
  run_id: minted-compose-overlay-E17-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-03T10:00:00Z
  output: |
    1 passed in 0.02s

- eval: E12a
  run_id: minted-compose-overlay-E12a-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-03T10:00:00Z
  output: |
    Tests  8 passed (8)
    Start at  18:10:07
    Duration  1.50s (transform 295ms, setup 0ms, import 625ms, tests 343ms, environment 418ms)
    Additional round-8 checks run and reported separately:
    (a) src/lib/workflow/connection-rules.test.ts — pass
    (b) src/lib/abi/node-feature-registry.test.ts — pass
    (c) src/lib/abi/edge-target-options.test.ts — pass
    (d) src/lib/director (compile.test.ts + vocabulary.test.ts) — pass; compile.test.ts confirms VIDEO into compose-overlay.media no longer triggers a false MODALITY_MISMATCH, vocabulary.test.ts shows `media: image|video`
    grep confirms `alsoAccepts` is read only from resolve.ts, sources.ts, node-feature-registry.ts

- eval: E12b
  run_id: minted-compose-overlay-E12b-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-03T10:00:00Z
  output: |
    Start at  18:10:09
    Duration  242ms (transform 102ms, setup 0ms, import 139ms, tests 4ms, environment 0ms)

- eval: E18
  run_id: minted-compose-overlay-E18-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-03T10:00:00Z
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.02s

- eval: E19
  run_id: minted-compose-overlay-E19-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-03T10:00:00Z
  output: |
    Tests  12 passed (12)
    Start at  18:10:09
    Duration  228ms (transform 101ms, setup 0ms, import 126ms, tests 3ms, environment 0ms)

- eval: E20
  run_id: minted-compose-overlay-E20-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-03T10:00:00Z
  output: |
    OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent

- eval: E21
  run_id: minted-compose-overlay-E21-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-03T10:00:00Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: e22-round8-independent-verify
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-03T10:00:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/compose-overlay/evidence/design/captures/state-1-empty.png
  observed: |
    Read all 6 committed frames directly (Read tool, image mode) plus 1 fresh live capture. state-1-empty.png: clean "Overlay Text/Logo" shell, Implementation="api-e22-r5-stub", "No ops yet. Add text, a price tag, a logo or a safe zone." + 4 disabled add-op buttons (Text/Price tag/Logo/Safe zone) + greyed "Apply Overlay" button — no error, no stray content. state-2-ops-image.png: Image node (real blue 64x64 swatch, "64 x 64" label) wired via "media" edge into the overlay node; Ops·media:image section shows one TEXT op row ("E22 round-5 capture" · 0.5, 0.12) with edit/delete icons; Apply Overlay enabled (solid black). state-3-ops-video.png: Video node (real green 64x64 swatch) wired in; Ops·media:video shows TEXT op scoped "entire video"; Apply Overlay enabled. state-4-op-form.png: same video-wired overlay node with the op-edit form expanded — Content textarea, x/y (0-1), Anchor dropdown ("top-center"), Font size, Color (#FFFFFF swatch), Alignment, Max width, Start/End(s) fields all present and populated; card has a visible focus ring (blue outline). state-5-error.png: red destructive-styled banner "A logo op needs an image on in:logo — connect an image node." directly under Implementation, plus a matching red-bordered LOGO op row "logo image missing (in:logo not conn...)"; Apply Overlay greyed/disabled. state-6-running.png: rotating rainbow-gradient left border, spinner + "Task started" + "3s" timer overlaying the card, Implementation/Ops rows dimmed, Add op and Apply Overlay both disabled/greyed. All 6 are distinct, no broken images/placeholders — matches the empty/ops-image/ops-video/op-form/error/running matrix. Fresh live capture (E22-live-workspace-r8-independent-verify.png, this round, http://localhost:3000/workspace): same canvas UI chrome (Director toolbar, zoom controls), but the live shared dev DB happened to hold 5 leftover "Overlay Text/Logo" debris nodes (ids co-1..co-5, unrelated to the checked-in evidence which uses node "ov1") — confirms round-6's prior documented finding of the same debris, not a new defect.
  network_observed: clean
  output: |
    - design/captures/state-6-running.{html,png} (pre-existing, re-verified fresh this round)
    - E22-live-workspace-r8-independent-verify.png (NEW this round, captured via `pnpm ui:capture` against the live self-started dev server)
    - E22-network-r8-independent-verify.txt (NEW this round, network+console truth dump)

- eval: E23
  judged_by: 3-lens panel (domain-correctness, operational-feasibility, spec-alignment) — fresh context
  verdict: UNCERTAIN
  rationale: Panel proposal is PASS, but the domain-correctness lens dissents (see votes) over a decimal-formatting mismatch (comma vs period between op summary and op-form) and an inconsistent quick-add button style on the empty state; the other two lenses vote PASS. No consensus this round — a human decides at Gate 2.
  votes:
    - domain-correctness: FAIL — State-4's op-form nhap lai chinh op da co trong state-2/3 (cung x=0.5, y=0.12) nhung hien thi lech: dong tom tat "0.5, 0.12" dung dau cham, con o form mo rong lai la "0,5" / "0,12" (dau phay) — lech dinh dang thap phan ngay trong cung mot node, khong dung voi design-of-record (reference luon dung dau cham). Ngoai ra, cum nut "+ Text/+ Price tag/+ Logo/+ Safe zone" o state-1 (empty) render thanh pill xam day, chu to, khong vien — khac han style nut "+ Add op" vien mong nen trang dung xuyen suot cac state con lai cua chinh node nay va khac voi add-menu vuong-vien nho trong reference, nen khong nhin dong bo/"nguoi nha" voi phan con lai cua chinh node.
    - operational-feasibility: PASS — Ca 6 state deu dung chung BaseNodeShell chrome (icon+tieu de+hamburger, the bo goc, input vien xam, nut den/xam theo trang thai) khop voi cac node transfer khac trong workspace; ops-editor dieu kien dung field thoi gian theo media (an o state-2 anh, hien o state-3/4 video, dung nhu manifest mo ta), va state-4 co du field data-testid op-start/op-end du PNG trong nhu bi cat. State-5 co ca banner loi tren cung va highlight do tren dong LOGO op, nut Apply bi khoa dung nghiep vu. State-6 dung dung treatment loading dung chung cua shell (vien gradient xoay + spinner + nhan + dong ho) nhu reading_notes xac nhan da sua khop thuc te 03/08, nen khong tinh la sai lech thiet ke du anh tinh kho thay ro nut huy. Khong thay yeu to nao pha ngon ngu thiet ke workspace.
    - spec-alignment: PASS — DOM-level inspection of the 6 captures confirms the node shell literally shares the design-of-record's declared tokens (rounded-lg, bg-white, shadow-lg, border-gray-200, min-w-[340px]) and the ops-editor reproduces the reference structure across all states: op-row list with type badge/summary/actions, 2x2 quick-add grid, op-form fields including op-start/op-end (present in DOM though PNG-cropped, matching manifest's reading_notes), the error banner + red op-row for the missing in:logo case, and state-6's rotating conic-gradient border + centered "Task started"/cancel treatment — confirmed to be the authentic shared BaseNodeShell loading chrome the manifest says the reference was corrected to match, so it reads as family with existing nodes rather than a bespoke one-off. Minor gaps exist (state-1's empty message renders as plain text, not the reference's dashed-bordered box; numeric fields show comma "0,5" instead of period "0.5", likely vi-VN locale formatting) but these are cosmetic and do not break the workspace's shared visual language.
  human_override:

## Analyst

carried tu round 1 — baseline khong do lai round nay

- E1a — `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`: xanh ca hai phia theo baseline round 1 (harness invariant, khong phan biet feature); baseline round nay: n-a (khong do lai)
- E16 — `sdk pytest tests/test_node_cache_tier_b.py::test_tier_lists_are_disjoint_and_pinned`: xanh ca hai phia theo baseline round 1; baseline round nay: n-a (khong do lai)
- E17 — `sdk pytest tests/test_node_cache_tier_b.py::test_abi_guard_catches_both_directions`: xanh ca hai phia theo baseline round 1; baseline round nay: n-a (khong do lai)
- E19 — `pnpm vitest run src/lib/abi/conformance.test.ts`: xanh ca hai phia theo baseline round 1; baseline round nay: n-a (khong do lai)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 8: all 26 machine evals (E1a–E22) PASS, exit 0, no variance; E23 judgment panel split — domain-correctness dissents (decimal-format mismatch + quick-add button style inconsistency) while operational-feasibility and spec-alignment vote PASS — no consensus, verdict stays PENDING-JUDGMENT pending human review at Gate 2.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
