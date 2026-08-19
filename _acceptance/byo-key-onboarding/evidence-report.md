---
schema_version: 2
feature_slug: byo-key-onboarding
verdict: BLOCKED
failed_evals: []
reason: |
  8 required verifier commands could not execute this round because the Bash
  tool's safety classifier (claude-sonnet-5) was rate-limited/unavailable for
  the entire session, blocking all shell execution needed to close the gate:
  - E13: `pnpm vitest run src/lib/onboarding/key-verify.test.ts`
  - E17: `bash scripts/onboarding/check-no-telemetry-sinks.sh`
  - E18: `bash scripts/acceptance/check-t3-untouched.sh byo-key-onboarding origin/main --allow 'src/lib/plugin-executor/**' --allow 'src/app/api/settings/env/**' --allow 'src/app/api/plugins/install-missing/**' --require 'src/lib/plugin-executor/**'`
  - E22: `BKO_E22=1 pnpm vitest run src/lib/onboarding/example-run.test.ts`
  Plus unassigned regression-guard commands that also never ran:
  `pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test`,
  `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q`,
  `pnpm verify:plugins`, `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`.
  Only E9, E12, E14, E19 actually ran this round (all PASS), plus judgment
  item E20 (panel proposal FAIL, one lens UNCERTAIN — see Evidence). Retry
  once the Bash classifier recovers; do not upgrade to PASS/PENDING-JUDGMENT
  until E13/E17/E18/E22 and the regression-guard suite have real results.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 634b2020227212d4df8a8b90d0a8a034f9af2305
human_signoff:
---

# Evidence Report: byo-key-onboarding

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E9 | AC-7 | test | PASS |
| E12 | AC-9 | ui-check | PASS |
| E13 | AC-10 | test | BLOCKED |
| E14 | AC-10 | ui-check | PASS |
| E17 | AC-12 | script | BLOCKED |
| E18 | AC-14 | script | BLOCKED |
| E19 | AC-13 | script | PASS |
| E20 | AC-15 | judgment | FAIL |
| E22 | AC-2 | test | BLOCKED |

## Evidence

- eval: E9
  run_id: minted-byo-key-onboarding-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_provisioning_events
  verified_at: 2026-08-19T09:00:00Z
  output: |
         Tests  3 passed (3)
      Start at  16:04:13
      Duration  11.29s (transform 31ms, setup 0ms, import 25ms, tests 11.16s, environment 0ms)

- eval: E12
  run_id: minted-byo-key-onboarding-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E12
  verified_at: 2026-08-19T09:00:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/evidence/E12-step1.png
  observed: |
    Read all three saved PNGs directly (not from memory of the steps).
    E12-step1.png (1400x900): the shipped example workflow (Add Video → Video preview → Split Video → Videos(0) → Concat Video → Videos(0)) with the Split Video node's "Implementation" combobox reading "PySceneDetect" (no "(local)" suffix — the non-local Modal implementation, confirmed by DOM text match). "Start Slice" button visible, task not yet run. No dialog present.
    E12-step2.png: a red "Task failed" toast at top-center reading "Missing required env var MODAL_TOKEN_ID (also missing: MODAL_TOKEN_SECRET)" with a red "Nhập khoá MODAL_TOKEN_ID" button and "Copy". Inside the Split Video node itself (not a modal/settings dialog) an inline amber-bordered section now renders: "⚠ Bước này cần một khoá API", the description text, label "MODAL_TOKEN_ID", an empty password input showing placeholder "Dán khoá vào đây", a disabled-looking "Lưu và kiểm tra" button, and the original "Start Slice" button below it. No settings dialog anywhere on screen.
    E12-step3.png: same toast and same node, but the MODAL_TOKEN_ID input now shows a row of masked bullet characters (a value has been typed) instead of the placeholder, and the input has a focus ring; the "Lưu và kiểm tra" button now reads as enabled/brighter. Visibly different from step2 (empty vs. filled input, disabled vs. enabled Save button). Still no settings dialog.
    All three match Expected: node switched to the non-local plugin → Run fails with the routable missing-env sentence and the node's own needs-key UI (not a redirect to Settings) → typing the key happens inline on the node. MD5 checksums of the three PNGs are distinct (539aa2a3.../7046d4fc.../48b83718...), so step2 and step3 are not byte-identical leftovers.
  network_observed: clean

- eval: E13
  run_id: minted-byo-key-onboarding-E13-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.test.unit_key_verified_on_save
  verified_at: 2026-08-19T09:00:00Z
  reason: Bash tool classifier is temporarily rate-limited (claude-sonnet-5 unavailable). The service is having transient availability issues. Please retry the command in a moment when the classifier recovers.
  output: |
    (not run — cannotRun: true)

- eval: E14
  run_id: minted-byo-key-onboarding-E14-r4
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E14
  verified_at: 2026-08-19T09:00:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/byo-key-onboarding/evidence/E14-step1.png
  observed: |
    E14-precondition-needs-key.png (mirrors E12 step2/3, read via Read tool): the "Text to Image" node (Implementation: OpenAI, Model: gpt-image-2, fed by a "Text" node reading "...apple on a wooden table, studio lighting") shows a red "Task failed / Missing required env var OPENAI_API_KEY" toast plus an inline amber-bordered box titled "Bước này cần một khoá API" mounted ON the node itself, with an empty OPENAI_API_KEY input (placeholder "Dán khoá vào đây") and a "Lưu và kiểm tra" button. No settings dialog anywhere on screen — matches Expected precondition exactly (blank required key -> needs-key state reached the same way as E12).
    E14-step1.png (read via Read tool, the required evidence frame): same node, now with the OPENAI_API_KEY field showing a masked/filled value (red border) and the text "Khoá chưa dùng được — Nhà cung cấp từ chối khoá này (HTTP 401)." with a warning-triangle icon directly under the input, button still reads "Lưu và kiểm tra". DOM dump (E14-step1-dom.html) confirms machine-checkably: input has aria-invalid="true"; the message is inside a role="alert" paragraph. This text is the literal template from src/lib/onboarding/key-verify.ts's checked:true/works:false branch (`Nhà cung cấp từ chối khoá này (HTTP ${res.status})`), which only renders when the server actually called the OpenAI prober and got back a real response — confirmed independently via the dev server access log line `PUT /api/settings/env 200 in 428ms` (a 428ms round trip, consistent with a live outbound HTTPS call, not an instant client-only shape check). No settings dialog was open in either frame.
  network_observed: clean

- eval: E17
  run_id: minted-byo-key-onboarding-E17-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.bko_no_telemetry_sinks
  verified_at: 2026-08-19T09:00:00Z
  reason: Bash tool rate-limited by safety classifier. Cannot execute: bash /Users/manh-macmini/dev/oneflow/scripts/onboarding/check-no-telemetry-sinks.sh
  output: |
    (not run — cannotRun: true)

- eval: E18
  run_id: minted-byo-key-onboarding-E18-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.bko_tier_boundary
  verified_at: 2026-08-19T09:00:00Z
  reason: Bash tool classifier is rate-limited and cannot execute commands. The verification script cannot be run at this time due to temporary service unavailability.
  output: |
    (not run — cannotRun: true)

- eval: E19
  run_id: minted-byo-key-onboarding-E19-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_a11y_proto
  verified_at: 2026-08-19T09:00:00Z
  output: |
      "blocking": 0,
      "verdict": "PASS"
    }

- eval: E20
  judged_by: 3-lens panel (domain-correctness, operational-feasibility, spec-alignment), fresh context
  panel_verdict: FAIL
  rationale: Walls 1-4 of the five-wall progressive-disclosure funnel (no-plugin, install, provisioning-wait, first-result) are each backed by a distinct on-screen state in the supplied evidence. Wall 5 (key) is not — E12-step2 and E12-step3 show only a generic "Task failed" toast with no key-specific wording or visible key-entry affordance distinguishing it from any other failure, and the E14-step1 PNG frame the domain-correctness lens needed was not in its input set (only the .html fallback was, which is out of that lens's allowed scope). Two of three lenses vote FAIL on wall 5; the third could not reach a verdict for a narrower reason (missing input file) rather than disagreeing on the underlying evidence.
  votes:
    - domain-correctness: UNCERTAIN — Bốn tường đầu có trạng thái quan sát được rõ từ màn hình: no-plugin (E2-step1 "Need 2 tools... Get the tools"), install (E2-step2 "Downloading tools... (0/2)"), provisioning-wait (E10-step2 "Setting up environment / Installing SDK / Installing libraries — 0s elapsed. Later runs start instantly." — phân biệt được với treo máy), first-result (E2-step4 "Task completed" + hai video thật xuất hiện trên canvas). Tường thứ năm (key) không đủ căn cứ: E14-step1.png không tồn tại trong bộ input (chỉ có E14-step1.html, ngoài phạm vi cho phép), còn E12-step2 và E12-step3 là cùng một khung hình — chỉ có toast "Task failed / Task execution failed" chung chung trên node Text to Image, không có ô nhập key hay chữ nào chỉ ra đây là bước "thiếu key" khác với một lỗi bất kỳ khác; người đứng cạnh nhìn màn hình không phân biệt được đây là tường key hay một sự cố khác.
    - operational-feasibility: FAIL — Walls 1-4 are each observable from the screen alone: "Need 2 tools to run this example" names the missing plugins (wall 1), "Downloading tools... (0/2)" shows install progress (wall 2), "Setting up environment / Installing SDK / Installing libraries · 0s elapsed" gives a live milestone label (wall 3), and "Task completed" plus populated video thumbnails confirms the result (wall 4). Wall 5 (key) fails: E12-step2 and E12-step3 are identical frames showing only a generic "Task failed / Task execution failed" toast over a normal-looking Text-to-Image node — no key-specific message, no inline key form, nothing distinguishing "stuck needing a key" from any other failure cause, so a bystander cannot point at this screen and say the user is at the key wall versus stuck elsewhere.
    - spec-alignment: FAIL — Walls 1–4 pass the "point-and-tell" bar: E2-step1 names the missing tools before any press, E2-step2/E2-step3 show live "Downloading tools (0/2)" → "Done" states, E10-step2 shows a labeled provisioning milestone with elapsed time, and E2-step4 shows a clear "Task completed" result. Wall 5 (key) fails it: E12-step2 and E12-step3 are identical screenshots showing only a generic "Task failed / Task execution failed" toast over a Text-to-Image node with no visible key-entry affordance, key-specific wording, or any other on-screen cue — an observer reading only the screen cannot tell this is the "key" wall versus any other failure, or whether the user is stuck or about to act.
  required_evidence:
    - File E14-step1.png thật (không phải .html) trong _acceptance/byo-key-onboarding/evidence/, chụp lúc form nhập key xuất hiện ngay tại node — đủ để người ngoài nhận ra đây là bước "nhập key" chỉ bằng mắt.
    - Một khung hình kế tiếp E12 (ví dụ E12-step4) cho thấy UI chuyển từ toast "Task failed" chung chung sang trạng thái có nhãn/ô nhập liên quan đến key ngay tại node Text to Image — hiện E12-step2 và E12-step3 là cùng một khung, không cho thấy chuyển trạng thái nào.
    - A screenshot (not the E14-step1.html file, which is out of scope for this judge) captured immediately after the OpenAI Text-to-Image task fails, showing an inline key-entry form opening at the node with cause-specific wording (e.g. "Missing/invalid API key") — this would show wall 5 has its own on-screen state distinct from a generic failure toast.
    - A screenshot pair for the E12 scenario where step2 and step3 visibly differ (e.g. toast text naming the missing key, or a key form appearing) — as captured, the two frames are identical and show no distinguishable state for the key wall.
    - The failure toast/message text itself naming the cause as a missing or invalid key (not the generic "Task execution failed"), captured on-screen so an observer can read it without console/log access — e.g. a corrected E14-step1.png (currently absent; only E14-step1.html exists) showing that state.
  human_override:

- eval: E22
  run_id: minted-byo-key-onboarding-E22-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.test.unit_example_run_produces_new_asset
  verified_at: 2026-08-19T09:00:00Z
  reason: Bash tool is rate-limited (claude-sonnet-5 classifier temporarily unavailable). Unable to execute the test command: BKO_E22=1 pnpm vitest run src/lib/onboarding/example-run.test.ts
  output: |
    (not run — cannotRun: true)

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Non-discriminating evals: none — every feature eval is red on baseline (discriminates); this round did not re-measure baseline (see line above), and no new non-discriminating eval was flagged.

## Variance

none — every multi-run eval is uniform (no eval in this round carried `runs > 1`; all `runs: 1`).

## Iterations

Round 1: baseline captured for evals.yaml (E9/E19 baselines established among others) — proceeded to implementation.
Round 3: E9 timed out at vitest's 5s default purely from machine load (false red — a re-run minutes later on the same commit passed in 9.8s); E19 reported 8 axe-core violations under heavy parallel load (false red — a re-run minutes later on the same commit reported 20/20 clean). Both flagged as load-sensitivity notes, returned to verification.
Round 4: E13, E17, E18, E22, plus the unassigned regression-guard suite (build/typecheck/lint/test/sdk pytest/verify:plugins/gen:abi) all blocked — the Bash tool's safety classifier (claude-sonnet-5) was rate-limited for the entire session. Only E9, E12, E14, E19 ran (all PASS); judgment E20 got a panel proposal of FAIL (2 FAIL / 1 UNCERTAIN) on the "key" wall's on-screen distinguishability. Verdict: BLOCKED — retry once the classifier recovers.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
- [ ] This round is BLOCKED, not PENDING-JUDGMENT: re-run E13/E17/E18/E22 and
      the regression-guard suite once the Bash classifier recovers before any
      Gate 2 sign-off is meaningful; E20's panel proposal (FAIL) still needs a
      human look regardless of the environment blocker.
