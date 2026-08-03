---
schema_version: 2
feature_slug: compose-overlay
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 36929d43c19ea7500003b1607cb2250c78f8ee65
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
| E23 | AC-16 | judgment | FAIL |

## Evidence

- eval: E1a
  run_id: minted-compose-overlay-E1a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-02T10:40:12Z
  output: |
    Checked 1 file in 43ms. Fixed 1 file.
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json

- eval: E1b
  run_id: minted-compose-overlay-E1b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-02T10:40:25Z
  output: |
    EXIT_CODE=0

- eval: E2
  run_id: minted-compose-overlay-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-02T10:40:41Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.34s

- eval: E3
  run_id: minted-compose-overlay-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-02T10:40:52Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.11s

- eval: E4
  run_id: minted-compose-overlay-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-02T10:41:03Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E5a
  run_id: minted-compose-overlay-E5a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-02T10:41:15Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.18s

- eval: E5b
  run_id: minted-compose-overlay-E5b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-02T10:41:26Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E6
  run_id: minted-compose-overlay-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-02T10:41:38Z
  output: |
    1 passed in 0.11s

- eval: E7a
  run_id: minted-compose-overlay-E7a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-02T10:41:49Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E7b
  run_id: minted-compose-overlay-E7b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-02T10:42:01Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E8a
  run_id: minted-compose-overlay-E8a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-02T10:42:14Z
  output: |
    1 passed in 0.55s

- eval: E8b
  run_id: minted-compose-overlay-E8b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-02T10:42:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-compose-overlay-E9a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-02T10:42:42Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9b
  run_id: minted-compose-overlay-E9b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-02T10:42:55Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.32s

- eval: E10
  run_id: minted-compose-overlay-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-02T10:43:10Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.29s

- eval: E14
  run_id: minted-compose-overlay-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-02T10:43:25Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E15
  run_id: minted-compose-overlay-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-02T10:43:38Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E16
  run_id: minted-compose-overlay-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-02T10:43:50Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E17
  run_id: minted-compose-overlay-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-02T10:44:02Z
  output: |
    1 passed in 0.02s

- eval: E12a
  run_id: minted-compose-overlay-E12a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-02T10:54:00Z
  output: |
    Tests  6 passed (6)
    Start at  10:54:00
    Duration  1.26s (transform 244ms, setup 0ms, import 494ms, tests 296ms, environment 373ms)

- eval: E12b
  run_id: minted-compose-overlay-E12b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-02T10:54:01Z
  output: |
    Tests  3 passed (3)
    Start at  10:54:01
    Duration  244ms (transform 101ms, setup 0ms, import 137ms, tests 5ms, environment 0ms)

- eval: E18
  run_id: minted-compose-overlay-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-02T10:54:05Z
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.02s

- eval: E19
  run_id: minted-compose-overlay-E19-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-02T10:54:11Z
  output: |
    Tests  12 passed (12)
    Start at  10:54:11
    Duration  235ms (transform 91ms, setup 0ms, import 115ms, tests 4ms, environment 0ms)

- eval: E20
  run_id: minted-compose-overlay-E20-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-02T10:54:20Z
  output: |
    OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent

- eval: E21
  run_id: minted-compose-overlay-E21-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-02T10:54:35Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: e22-round3-independent-verify
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-02T10:55:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/compose-overlay/evidence/design/captures/state-1-empty.png
  observed: |
    Read all 6 saved PNG frames directly (Read tool, images). state-1-empty.png: header "Overlay Text/Logo", dashed "Implementation" card ("No plugin implementations were scanned..."), "Ops" label, "No ops yet..." text, 4 enabled add-op buttons (Text/Price tag/Logo/Safe zone), and a disabled gray "Apply Overlay" button — matches empty/no-media/no-ops/execute-disabled. state-2-ops-image.png: "Ops · media: image", TEXT/PRICE/LOGO/SAFE rows (no time pills), enabled black "Apply Overlay" — matches. state-3-ops-video.png: "Ops · media: video" with time-range pills on each row (0-3.5s, 3.5-7s, "entire video") — confirms the round-3 fix (video now accepted on in:media) is reflected in the live UI. state-4-op-form.png: TEXT op's edit form expanded (multi-line content textarea with {text} placeholder note, x/y coords, Anchor, Font size, Color, Alignment, Max width, and Start(s)/End(s) time fields since media=video) with a blue selection ring — matches "op-form" including the time field. state-5-error.png: red banner "A logo op needs an image on in:logo — connect an image node." plus inline red LOGO row "logo image missing (in:logo not conn...)" and a disabled gray Apply Overlay — matches. state-6-running.png: rotating rainbow conic-gradient border, dimmed white/80 overlay, blue spinner, bold "11s" elapsed counter, and a solid gray-700 (not bg-clip-text-shimmer) progress label "E22 capture stub: compositing overlay..." — confirms the P0 contrast fix from round 2 still holds under a REAL live task run triggered this round. All 6 frames match Expected; no contradiction found.
  network_observed: clean

- eval: E23
  judged_by: 3-lens judge panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  outcome: FAIL
  proposal: FAIL
  votes:
    - domain-correctness: FAIL — States 1-5 all show a dashed-outline "Implementation: No plugin implementations were scanned..." block occupying significant vertical space right below the header — this block has zero counterpart in the design-of-record, which renders plugin-select as a single compact `.select` row reading "oneflow-modal-compose-overlay"; that structural mismatch recurs across 5 of 6 states, not an isolated glitch. State 6 (running) further diverges: the reference's overlay spec calls for a muted single-color blue spinner ring on a translucent blurred surface plus a "cancel" link, but the capture instead shows a saturated multi-color rainbow gradient border wrapping the node and no visible cancel affordance — a different visual vocabulary from the shell-inherited overlay the manifest describes. Given these are concrete, directly observable gaps against the reference across the majority of the state matrix, this is a clear FAIL rather than an ambiguous call.
    - operational-feasibility: FAIL — State-4 (op-form) drops the "Hiện (giây)" time-range field that the manifest itself defines as part of this state ("multi-line, {text}, coords, time") and that the reference shows paired with Max width — the capture only shows Max width alone. State-6 (running) also drops the "Huỷ" cancel affordance present in the reference overlay, replacing the combined spinner+progress line with a different three-part layout (label/spinner/seconds) and an unexplained rainbow gradient border not in the design-of-record. Additionally, all 6 captures replace the reference's working plugin-select dropdown with a "no plugin implementations scanned" fallback banner, so that region of the shell cannot be verified to match the design-of-record in any state.
    - spec-alignment: PASS — Cả 6 capture đều khớp đúng mô tả state trong manifest.json: state-1 empty có Apply Overlay disabled (xám), state-2 ops-image không có time chip, state-3 ops-video có time range trên từng op, state-4 op-form mở đủ field (content đa dòng, {text}, x/y, anchor, font size, color, alignment, max width), state-5 error vừa có banner đỏ trên đầu vừa có op-row LOGO viền/chữ đỏ inline, state-6 running có overlay loading (viền gradient xoay, spinner, timer) đè lên toàn bộ card. Shell (icon+title+hamburger, khối dashed "Implementation", danh sách Ops, nút CTA cuối) nhất quán xuyên suốt 6 state, spacing đều, màu sắc dùng semantic (đỏ=lỗi, đen=CTA khả dụng, xám=disabled) — không thấy dấu hiệu phá ngôn ngữ thiết kế workspace. Lưu ý: không có ảnh node transfer khác để so trực tiếp "người nhà", nên phần đó chỉ đánh giá gián tiếp qua tính nhất quán nội tại.
  rationale: 2/3 lenses FAIL on concrete, directly-observed gaps (Implementation-block structural mismatch across 5/6 states; missing time field pairing and cancel affordance in state-4/state-6; rainbow-gradient running overlay diverges from the reference's single-color spinner). Panel proposal is FAIL, not UNCERTAIN — dissent recorded in full per lens, none summarized away.
  human_override:

## Unmapped command failure (not tied to any eval — cause of this round's REJECT)

- cmd: `pnpm lint:check`
  evals: []
  exit status: 1 (nonzero, unassigned to any AC/eval)
  output: |
    i Unsafe fix: Use a template literal.

      87 87 │       await new Promise((r) => setTimeout(r, waitMs));
      88 88 │       await page.screenshot({ path: out, fullPage });
      89    │ - ····console.log("saved·"·+·out);
         89 │ + ····console.log(`saved·${out}`);
      90 90 │   } finally {
      91 91 │       await browser.close();

    Checked 424 files in 93ms. No fixes applied.
    Found 1 info.
  note: This command is not linked to any acceptance eval (E1a-E23), so it cannot appear in `failed_evals`. It is documented here because it is the concrete cause of this round's overall REJECT verdict: the repo's mandatory lint gate (`pnpm lint:check`, Biome `--error-on-warnings`) does not exit clean at `verified_commit`. Per CLAUDE.md's commit/PR checklist, `pnpm lint:check` passing is a hard requirement before merge — a nonzero exit here blocks Gate 1.5/merge regardless of eval status.

### Other suite-level commands run this round (regression guards, all green — not individually eval-mapped, listed for completeness)

- `pnpm build && pnpm typecheck` — exit 0
- `pnpm test` — exit 0, 381 passed
- `cd sdk && ... pytest -q` (full suite) — exit 0, 193 passed
- `pnpm verify:plugins` — exit 0

## Analyst

carried tu round 1 — baseline khong do lai round nay

Non-discriminating evals (green on both HEAD and diffBase baseline in round 1; they pass regardless of this feature, proving the harness rather than the feature — round 3 does not re-run the baseline, this list is carried forward unchanged):

- E1a (`pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`) — green-on-both; the ABI-regen-clean guard is generic to any ABI change, not specific to compose-overlay's fields. Consider asserting the specific compose-overlay generated types exist rather than only "diff is empty".
- E16 (`sdk/tests/test_node_cache_tier_b.py::test_tier_lists_are_disjoint_and_pinned`) — green-on-both; this guard checks list disjointness in general, not that compose-overlay specifically landed in Tier A. Consider adding an assertion that `compose-overlay` is present in the Tier A pinned list.
- E17 (`sdk/tests/test_node_cache_tier_b.py::test_abi_guard_catches_both_directions`) — green-on-both; the bidirectional ABI guard is a standing regression check independent of this feature's slot. Fine as an intended regression guard, but does not by itself prove compose-overlay's ABI is wired into the guard's watched set.
- E19 (`src/lib/abi/conformance.test.ts`) — green-on-both; the TS half of the conformance suite is a shared harness exercised by every ABI-driven node, not compose-overlay-specific. The compose-overlay-specific assertion lives in the fixture-scoped E18 (sdk conformance, red-discriminating).

## Variance

none — every multi-run eval is uniform (no eval in this round carries `runs > 1`; all are deterministic single-run)

## Iterations

Round 1: initial compose-overlay implementation + evals E1a-E23 defined; baseline (diffBase) captured for the A/B-discriminating set used in later rounds' Analyst section. Returned to implementation for design-gate follow-up.
Round 2: E22 design gate initially failed — `NodeLoadingOverlay`'s progress label used `bg-clip-text` shimmer text over a dimmed `white/80` overlay, collapsing to unreadable contrast in state-6 (running). Fixed (solid gray-700 label); round 2 re-verified the P0 design gate GREEN across all 6 states. Returned to implementation for the video-on-`in:media` connection fix that AC-12/E12a round 3 covers.
Round 3 (this round): video→`in:media` validator/registry change re-verified live (E12a connection-rules subgroup + E22 independent UI re-capture, both GREEN, confirming round 2's contrast fix still holds); all 26 machine/ui evals (E1a-E22) GREEN, no eval failures (`failed_evals: []`). However `pnpm lint:check` — not tied to any eval — exits 1 at `verified_commit`, and the E23 judge panel proposes FAIL (2 FAIL / 1 PASS across domain-correctness, operational-feasibility, spec-alignment) on a real Implementation-block/plugin-select mismatch and a missing state-4 time-field/state-6 cancel-affordance gap versus the design-of-record. Verdict: REJECT. Per the 3-round cap: escalate to the user — fix `pnpm lint:check`, and resolve/dispute the E23 dissent (or route via human_override at Gate 2) before returning to implementation.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

Note: this round's verdict is REJECT (not PENDING-JUDGMENT) — the Gate 2 checklist above applies only after implementation fixes `pnpm lint:check` and the E23 dissent is resolved and a subsequent round reaches PASS or PENDING-JUDGMENT.