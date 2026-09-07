---
schema_version: 2
feature_slug: compose-overlay
verdict: PASS
failed_evals: []
reason: >-
  Re-verification round at HEAD a788985 (branch feat/local-first-adr-and-s2-plan).
  The previously signed evidence was pinned to an earlier commit; code landed
  after it, so this round re-establishes the evidence on the current tree.
  All 26 machine evals green. E23 is a judgment eval and was deliberately left
  UNSCORED — the verifier is forbidden to judge it — so the verdict is
  PENDING-JUDGMENT until the human fills its human_override at Gate 2. This is a
  T3 contract, so that override is required for PASS regardless of any judge verdict.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e
human_signoff: Manh 2026-08-07
---

# Evidence Report: compose-overlay

27 evals, 16 criteria. Every `cmd` was resolved line by line against
`_acceptance/config.yaml` and run from the repo root at HEAD
`a788985b3b30c7072dcfd95bc65db1f83b940984`. The 13 render evals (E2..E10) run in
the **plugin** repo through `scripts/plugins/run-overlay-plugin-tests.sh`, which
clones `phanlemanh/oneflow-modal-compose-overlay` and prints the plugin commit
sha before running pytest; every one of them reported the same
`plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5`, and E21 confirms
that clone's SDK pin matches the published train.

No source file, test, script, config or git state was modified by this round.
The only files written are this report, `run-log.jsonl`, the contract's `status:`
line, and two new `evidence/E22-*-reverify-20260807.txt` observation files.

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
| E23 | AC-16 | judgment | UNSCORED |

## Evidence

- eval: E1a
  run_id: compose-overlay-E1a-20260807T013016Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-07T01:30:17Z
  output: |
    $ tsx scripts/gen-abi-types.ts
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json
    (git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json produced
     no diff — the committed TS + _data copy still match the committed ABI)

- eval: E1b
  run_id: compose-overlay-E1b-20260807T013017Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-07T01:30:17Z
  output: |
    (guard is silent on success by design — the exit status is the whole assertion)
    It re-ran gen_models.py and gen_node_slots.py against config/tongflow.abi.json,
    then asserted `git diff --exit-code sdk/tongflow/models sdk/tongflow/node_slots.py`
    plus a porcelain untracked-file scan. Both clean: the committed Python models
    and node_slots.py still match the ABI.

- eval: E2
  run_id: compose-overlay-E2-20260807T013049Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-07T01:30:52Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.56s

- eval: E3
  run_id: compose-overlay-E3-20260807T013102Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-07T01:31:03Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.10s

- eval: E4
  run_id: compose-overlay-E4-20260807T013103Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-07T01:31:04Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E5a
  run_id: compose-overlay-E5a-20260807T013104Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-07T01:31:05Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E5b
  run_id: compose-overlay-E5b-20260807T013106Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-07T01:31:07Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E6
  run_id: compose-overlay-E6-20260807T013107Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-07T01:31:08Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7a
  run_id: compose-overlay-E7a-20260807T013119Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-07T01:31:21Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E7b
  run_id: compose-overlay-E7b-20260807T013121Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-07T01:31:22Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E8a
  run_id: compose-overlay-E8a-20260807T013122Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-07T01:31:23Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.23s

- eval: E8b
  run_id: compose-overlay-E8b-20260807T013123Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-07T01:31:25Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: compose-overlay-E9a-20260807T013125Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-07T01:31:26Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E9b
  run_id: compose-overlay-E9b-20260807T013126Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-07T01:31:27Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.26s

- eval: E10
  run_id: compose-overlay-E10-20260807T013127Z
  exit_code: 0
  baseline: n-a
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-07T01:31:29Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.21s

- eval: E14
  run_id: compose-overlay-E14-20260807T013141Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-07T01:31:41Z
  output: |
    tests/test_node_cache_overlay.py::test_overlay_second_run_full_hit_zero_plugin_calls
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E15
  run_id: compose-overlay-E15-20260807T013141Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-07T01:31:41Z
  output: |
    tests/test_node_cache_overlay.py::test_changing_text_reruns_only_overlay
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E16
  run_id: compose-overlay-E16-20260807T013141Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-07T01:31:41Z
  output: |
    tests/test_node_cache_tier_b.py::test_tier_lists_are_disjoint_and_pinned
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E17
  run_id: compose-overlay-E17-20260807T013141Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-07T01:31:41Z
  output: |
    tests/test_node_cache_tier_b.py::test_abi_guard_catches_both_directions
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E12a
  run_id: compose-overlay-E12a-20260807T013150Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-07T01:31:52Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  8 passed (8)
       Duration  1.15s
    (src/components/workspace/nodes/transfer/compose-overlay.test.tsx)

- eval: E12b
  run_id: compose-overlay-E12b-20260807T013152Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-07T01:31:52Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  3 passed (3)
       Duration  250ms
    (src/lib/workflow/compose-overlay-export.test.ts)

- eval: E18
  run_id: compose-overlay-E18-20260807T013202Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-07T01:32:02Z
  output: |
    sdk/tests/conformance -k compose_overlay
    .                                                                        [100%]
    1 passed, 6 deselected in 0.02s

- eval: E19
  run_id: compose-overlay-E19-20260807T013202Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-07T01:32:03Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  12 passed (12)
       Duration  186ms
    (src/lib/abi/conformance.test.ts)

- eval: E20
  run_id: compose-overlay-E20-20260807T013203Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-07T01:32:03Z
  output: |
    OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent

- eval: E21
  run_id: compose-overlay-E21-20260807T013203Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-07T01:32:11Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: compose-overlay-E22-20260807T013419Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-07T01:34:22Z
  output: |
    === state-1-empty.html      {"run_id":"design-gate-ad00500c81","verdict":"PASS","p0_count":0,"mode":"dom"}
    === state-2-ops-image.html  {"run_id":"design-gate-76636ae454","verdict":"PASS","p0_count":0,"mode":"dom"}
    === state-3-ops-video.html  {"run_id":"design-gate-f913d82faf","verdict":"PASS","p0_count":0,"mode":"dom"}
    === state-4-op-form.html    {"run_id":"design-gate-e86cb836ec","verdict":"PASS","p0_count":0,"mode":"dom"}
    === state-5-error.html      {"run_id":"design-gate-b34630201d","verdict":"PASS","p0_count":0,"mode":"dom"}
    === state-6-running.html    {"run_id":"design-gate-a5d6d7a7c8","verdict":"PASS","p0_count":0,"mode":"dom"}
    Non-blocking hits on every state: nested-cards (P1 — the ops-editor Card sits
    inside the node-shell Card by design) and cramped-padding (P2, generic
    react-flow chrome divs); state-6 additionally ai-color-palette (P1 — the
    running-node rainbow border). Zero P0 findings anywhere.
  screenshot: evidence/design/captures/state-1-empty.png
  observed: |
    Opened all six frames. state-1: an "Overlay Text/Logo" card with a dashed
    Implementation panel, an "Ops" heading reading "No ops yet…" and four
    add-buttons (Text / Price tag / Logo / Safe zone) above a greyed-out "Apply
    Overlay". state-2 (media: image): four op rows badged TEXT / PRICE / LOGO /
    SAFE, each with pencil + X controls, and a black enabled Apply button.
    state-3 is the same list under "media: video" but each row now carries a time
    chip (0–3.5s, 3.5–7s, "entire video") — the time field is video-only, as AC-12
    requires. state-4 shows the TEXT op expanded into a form (Content multi-line,
    x/y, Anchor, Font size, Color, Alignment, Max width) inside a blue-focused
    node. state-5 shows the error state: a pink banner "A logo op needs an image on
    in:logo — connect an image node." plus a red-tinted LOGO row and a disabled
    Apply button. state-6 shows the node live on the react-flow canvas, dimmed
    under a rainbow running border with a spinner, "Task started", a 3s counter and
    an Image node wired into its "media" handle. All six match the design-of-record
    state matrix, and the node reads as a sibling of the other transfer nodes.
  network_observed: clean

# Judgment eval — NOT scored by this verifier. Per the round's instructions the
# verifier is forbidden to judge it, and no judge panel was convened this round.
- eval: E23
  judged_by: (not convened — deliberately left UNSCORED by the verify subagent)
  verdict: UNCERTAIN
  rationale: >-
    The verifier is forbidden to render this judgment and no judge panel ran in
    this re-verification round, so the perceptual question AC-16 asks — do the six
    captured states match the design-of-record and read as a member of the existing
    transfer-node family — has no machine or panel verdict attached to it here. The
    machine half (E22, P0 design gate over all six states) is green, and the frames
    were opened and described above, but that description is evidence, not a verdict.
  required_evidence:
    - A human (or a convened judge panel) comparing the six frames under
      _acceptance/compose-overlay/evidence/design/captures/state-*.png against the
      design-of-record manifest at evidence/design/reference/source/manifest.json,
      and recording the outcome here.
  human_override: Manh 2026-08-07 — reviewed all six frames directly; verdict PASS (T3: human verdict, no judge panel convened)

## Analyst

Baseline is `n-a` on every eval in this round, by instruction: an A/B baseline
would require moving the working tree to the diffBase, and this re-verification
ran under a hard no-git-operations constraint. Whether these evals discriminate
was settled across the seven original rounds recorded in the contract; this round
re-establishes only that they are still green at the current HEAD.

Three things a human should weigh at Gate 2:

1. **E22's six state captures were reused, not re-driven.** A dev server was
   started (`.claude/launch.json` entry `oneflow-dev`) and the workspace page did
   load, but the locally persisted workspace no longer holds the `e22-fixture`
   workflow the earlier rounds built — the canvas now renders an unrelated example
   workflow, so no live compose-overlay node was on screen to re-capture from.
   Rather than skip the eval, the executor itself (`config:executors.design.gate`)
   was re-run at this HEAD over all six existing capture files, and all six frames
   were opened and described. This is sound at this tree because **no file under
   `src/components/workspace/nodes/transfer/` changed between the previously
   verified commit and `a788985`** — the last touch to the node was `4447f41`
   (media-kind-resolver fix), which predates the captures. If the human wants the
   states re-driven live, the fixture workflow has to be rebuilt first.

2. **Console and network were observed on the live workspace shell, not on a live
   overlay node.** Raw observations are in
   `evidence/E22-console-reverify-20260807.txt` and
   `evidence/E22-network-reverify-20260807.txt`. Every in-scope XHR
   (`/api/feature/list`, `/api/plugins/registry`, `/api/task/pending`) returned
   200; five browser resource notices correspond to `/api/uploads/...` media rows
   whose bytes are absent on this machine — the same static-asset stub gap every
   prior round documented, and unrelated to this feature.

3. **The known limit the contract itself flagged is now one bump closer.**
   `scripts/plugins/run-overlay-plugin-tests.sh` no longer hardcodes the SDK spec —
   it derives it through `scripts/lib/sdk-version.sh` (`--print-spec`), which the
   later `ci-vitest-sdk-pin` feature added. The contract's Known-limits entry
   saying that file "ghi cứng `oneflow-sdk==0.2.18`" is therefore stale; E21 still
   pins the train at 0.2.18 and the plugin clone still resolves to it, but the
   guard would now follow a bump instead of going quietly green.

## Variance

none — every eval in this contract is deterministic (runs: 1) and uniform.

## Iterations

Round 1 (re-verification after upstream code change): all 26 machine evals ran at
HEAD a788985 and all 26 exited zero. E23 (judgment) left UNSCORED by design. No
round 2 needed.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify E23 (the only judgment item) and fill its
      `human_override: <name> <date>` line — this is a T3 contract, so PASS is
      hook-blocked without it
- [ ] Decide whether E22's reused captures are acceptable, or whether the
      `e22-fixture` workspace should be rebuilt and the six states re-driven live
      (Analyst item 1)
- [ ] Consider retiring the stale Known-limits entry about the hardcoded SDK pin
      in `run-overlay-plugin-tests.sh` (Analyst item 3)
- [ ] Upgrade the verdict from PENDING-JUDGMENT to PASS (this write is when the
      hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

### Re-pin — 05/09/2026, hợp nhất PR #97 vào `main`

run_id: repin-merge-20260905T101500Z
sha: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e · suites: 8 lệnh exit 0

Commit merge `96ee9b8` kéo mọi hồ sơ đã ký ra khỏi mốc của chúng theo đường dẫn. Một lượt làn
máy chung cho cả đợt, 12 ô đo bị chạm, cả 12 chạy lại và exit 0.

Đợt này KHÔNG re-pin SÁU hồ sơ — `add-media-library`, `byo-key-onboarding`, `chong-doc-sai-em-ru`,
`cong-tu-canh-minh`, `gate-scope-anchors`, `normalize-text-vi` — vì ô đo bị chạm của chúng ĐỎ, hoặc
KHÔNG KẾT LUẬN ĐƯỢC (cửa sổ diff rỗng khi nhánh đứng ngay tại `main`; hoặc ô `ui-check` không chạy
được ngoài luồng verify). Dời mốc khi ấy là khai rằng bằng chứng còn đúng trong khi chưa chứng
minh được.
