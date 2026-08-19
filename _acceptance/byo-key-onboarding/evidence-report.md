---
schema_version: 2
feature_slug: byo-key-onboarding
verdict: BLOCKED
triage_failed: true
failed_evals: ["E9","E19"]
reason: |
  Round 3 verification could not complete two required steps because the Bash tool's
  model classifier (claude-sonnet-5) was temporarily rate-limited, and continued
  retries returned the same error:
  - `pnpm vitest run src/lib/onboarding/key-verify.test.ts` (E13 / AC-10 backend-effect
    half) — never executed this round.
  - `pnpm build && pnpm typecheck` (commit-checklist gate, not tied to a single eval)
    — never executed this round.
  Separately, and independently of the rate limit, the scope-triage step that
  classifies review findings as in-contract vs out-of-contract could not complete
  this round (see triage_failed below) — no finding was auto-classified or
  auto-fixed as a result.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0c30de5e46896e2f5cbd43dbd5e38e1012674f97
human_signoff:
---

# Evidence Report: byo-key-onboarding

⚠ phân loại phạm vi KHÔNG chạy được — bước triage scope-vs-contract cho các review-findings không chạy được ở vòng này, nên KHÔNG lỗi nào trong review-findings.md được máy tự phân loại hay tự sửa; danh sách đầy đủ nằm nguyên trong review-findings.md, người xem lại toàn bộ danh sách đó trước khi ký.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | ui-check | PASS |
| E22 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-13 | ui-check | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | ui-check | PASS |
| E7 | AC-5 | script | PASS |
| E21 | AC-5 | ui-check | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-7 | test | FAIL |
| E10 | AC-7 | ui-check | PASS |
| E12 | AC-9 | ui-check | PASS |
| E13 | AC-10 | test | BLOCKED |
| E14 | AC-10 | ui-check | PASS |
| E15 | AC-11 | test | PASS |
| E17 | AC-12 | script | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-13 | script | FAIL |
| E20 | AC-15 | judgment | FAIL |

## Evidence

- eval: E1
  criterion: AC-1
  run_id: minted-byo-key-onboarding-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_example_needs_no_keys
  verified_at: 2026-08-19T03:12:06Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  criterion: AC-2
  run_id: e2-bko-20260819-1446-port3211-isolated
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T14:46:00+07:00
  screenshot: _acceptance/byo-key-onboarding/evidence/E2-step1.png
  observed: |
    E2-step1.png: canvas shows the bundled example loaded (Add Video → Split Video → Videos(0) → Concat Video → Videos(0)); the first-run strip reads "Need 2 tools to run this example / Tách cảnh video · Cắt ghép video" with a single "Get the tools" button. No dialog, password field, or key-related text anywhere.
    E2-step2.png: taken ~400ms after the single "Get the tools" press; strip now reads "Downloading tools… (0/2)" with a spinner.
    E2-step3.png: taken immediately after pressing "Start Slice" on the Split Video node; that node shows a spinning loader labelled "0s", genuinely running.
    E2-step4.png: a green "Task completed" toast is shown; Split Video now shows "Videos (2)" with two new distinct thumbnails, Concat Video's "Video Files (2)" lists both. SHA-256 of the two produced files differ from the bundled public/example-assets/two-scenes.mp4 — the on-screen result is provably PRODUCED, not the bundled decoy. Across all four frames plus continuous ~1s polling, zero key-prompt/settings-dialog hits were recorded.
  network_observed: clean

- eval: E22
  criterion: AC-2
  run_id: minted-byo-key-onboarding-E22-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_example_run_produces_new_asset
  verified_at: 2026-08-19T14:36:33+07:00
  output: |
    Tests  2 passed (2)
    Start at  14:36:33
    Duration  32.41s (transform 198ms, setup 0ms, import 41ms, tests 32.25s, environment 0ms)

- eval: E3
  criterion: AC-3
  run_id: minted-byo-key-onboarding-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_first_run_readiness
  verified_at: 2026-08-19T03:12:06Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  criterion: AC-13
  run_id: minted-byo-key-onboarding-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T14:38:00+07:00
  screenshot: _acceptance/byo-key-onboarding/evidence/E4-step1.png
  observed: |
    E4-step1.png: dark workspace canvas at /workspace, fresh profile (no example.completed flag). First-run strip renders "✓ Done. Press Run on the first node to try it." (both required plugins already installed on this shared dev box). Canvas shows the full bundled example, NOT dimmed/blocked; bottom add-node toolbar and zoom/lock controls all visibly enabled, no overlay anywhere.
    E4-step2.png: same session, after a real trusted-mouse drag on the first node (confirmed via CSS transform change), a click to deselect, and a click on the toolbar's Video icon adding a new node. The new "Add Video" card is centered in the canvas, pre-existing nodes/edges still present, and the first-run strip is UNCHANGED at the top — same text, same position, untouched. No modal/dialog/dimming anywhere.
  network_observed: clean

- eval: E5
  criterion: AC-4
  run_id: minted-byo-key-onboarding-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_example_requirements
  verified_at: 2026-08-19T02:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  criterion: AC-4
  run_id: minted-byo-key-onboarding-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T14:39:00+07:00
  screenshot: evidence/E6-step1.png
  observed: |
    evidence/E6-step1.png: canvas renders an example workflow (5-node chain) and a card docked at the top titled "Need 2 tools to run this example" with subtitle "Tách cảnh video · Cắt ghép video" and a "Get the tools" button, not pressed. Cross-checked evidence/E6-step1.html: the same three literal strings are present in the rendered DOM. This is the FIRST captured frame — zero clicks, server's /api/plugins/registry returned {"plugins":{}} (zero installed) — and it already names the two missing plugins, i.e. detection at load, not at run.
  network_observed: n-a (driver)

- eval: E7
  criterion: AC-5
  run_id: minted-byo-key-onboarding-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_one_action_installs_all
  verified_at: 2026-08-19T03:12:06Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E21
  criterion: AC-5
  run_id: e21-verify-20260819-1442
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T14:42:00+07:00
  screenshot: _acceptance/byo-key-onboarding/evidence/E21-step1.png
  observed: |
    E21-step1.png: /workspace with an empty plugins dir. Strip reads "Need 2 tools to run this example / Tách cảnh video · Cắt ghép video" with a "Get the tools" button; both node cards show "No plugin implementations were scanned for this capability", confirming the empty precondition.
    E21-step2.png: ~400ms after exactly one scripted click on the strip's only button (dev-server log confirms exactly one POST /api/plugins/install-missing); strip now reads "Downloading tools… (0/2)" with a spinner.
    E21-step3.png / E21-step3-dialog.html: strip settled to "Done. Press Run on the first node to try it."; the Plugins dialog shows both FFmpeg (local) and PySceneDetect (local) rows as "Up to date"/installed. Server log independently confirms both plugins were cloned and the filesystem shows exactly those two directories. The id set named at step1 (2 ids from example.json) exactly matches the id set installed at step3 — one press installed the whole set.
  network_observed: unscoped-partial

- eval: E8
  criterion: AC-6
  run_id: minted-byo-key-onboarding-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_no_restart_after_install
  verified_at: 2026-08-19T02:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  criterion: AC-7
  run_id: minted-byo-key-onboarding-E9-r3
  exit_code: 1
  baseline: n-a
  verifier: config:executors.test.unit_provisioning_events
  verified_at: 2026-08-19T14:36:32+07:00
  output: |
    FAIL  src/lib/plugin-executor/provisioning-events.test.ts > provisioning milestones > emits the three steps in order, each completion after its work
    Error: Test timed out in 5000ms.
    If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
     ❯ src/lib/plugin-executor/provisioning-events.test.ts:19:5
    Test Files  1 failed (1)
    Tests  1 failed | 2 passed (3)
    Start at  14:36:32
    Duration  11.79s
  note: |
    Same failure reproduced in the full-suite run (pnpm test, not tied to any single
    eval) — 1 failed | 461 passed | 5 skipped (467), same test file/line, same
    timeout symptom. Treated as one underlying failure, not double-counted.

- eval: E10
  criterion: AC-7
  run_id: At0d6lWcJkcIq-AQi5_0h
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T14:43:00+07:00
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/byo-key-onboarding/evidence/E10-step1.png
  observed: |
    E10-step1.png (t=+98ms after Run): Split Video node shows a small loading spinner "Loading plugin implementation..."; no milestone banner yet (before any provisioning SSE event).
    E10-step2.png (t=+3171ms): strip shows "Setting up environment" bold/current, "Installing SDK"/"Installing libraries" dimmed, "0s elapsed." Node status shows raw server text "Đang tạo môi trường Python", matching the SSE event provisioning:{step:"create-venv",phase:"started"} that arrived at +3060ms.
    E10-step3.png (t=+4743ms): "Setting up environment" now checked/reached, "Installing SDK" bold/current, "1s elapsed." Node status shows "Đang cài bộ thư viện lõi", matching provisioning:{step:"install-sdk",phase:"started"} at +4671ms — a genuine milestone change in the correct order.
    All three frames match the server-emitted milestone sequence (create-venv → install-sdk → install-requirements, confirmed through completion at +9694ms in the saved milestone log); no content contradicts expected.
  network_observed: clean

- eval: E12
  criterion: AC-9
  run_id: 5VGUmJLgajX4ST4gXM_UG
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T14:44:00+07:00
  screenshot: /Users/manh-macmini/dev/oneflow/evidence/E12-step1.html
  observed: |
    E12-step1.html: Split Video's Implementation combobox shows plain "PySceneDetect" (Modal-backed plugin whose manifest declares MODAL_TOKEN_ID/MODAL_TOKEN_SECRET as required:true, both blank). No needs-key form or dialog yet — correct precondition.
    E12-step2.html: after pressing "Start Slice", the DOM contains "Bước này cần một khoá API" with a labeled input for MODAL_TOKEN_ID and a disabled "Lưu và kiểm tra" button — an inline form mounted on the node itself. Zero role="dialog" elements. The SSE stream carries the executor sentence "Missing required env var MODAL_TOKEN_ID (also missing: MODAL_TOKEN_SECRET)".
    E12-step3.html: after typing a value and clicking "Lưu và kiểm tra", the DOM shows "Đã lưu khoá — chưa kiểm tra được — Chưa kiểm tra được khoá cho MODAL_TOKEN_ID (no prober)." Zero dialog elements. PUT /api/settings/env body and data/settings.json both confirm the write came from the node form.
    All three frames match expected: key entered at the node, no settings dialog at any point.
  network_observed: unscoped-partial

- eval: E13
  criterion: AC-10
  run_id: minted-byo-key-onboarding-E13-r3
  exit_code: n/a (not executed)
  cannot_run: true
  baseline: n-a
  verifier: config:executors.test.unit_key_verified_on_save
  verified_at: NOT RUN this round — command never executed
  reason: |
    Bash tool classifier is temporarily rate-limited (claude-sonnet-5 unavailable).
    Cannot execute `pnpm vitest run src/lib/onboarding/key-verify.test.ts` at this
    time. Service says to wait and retry, but continued retries yield the same
    error.

- eval: E14
  criterion: AC-10
  run_id: minted-byo-key-onboarding-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T14:45:00+07:00
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/byo-key-onboarding/evidence/E14-step1.html
  observed: |
    E14-step1.html: "Text to Image" node (OpenAI, gpt-image-2) reached the same way as E12, no Settings dialog ever opened. Server-side failure "Missing required env var OPENAI_API_KEY" triggers the node's inline key form (id="node-key-OPENAI_API_KEY"). A well-formed but fake key was typed and "Lưu và kiểm tra" pressed. Saved DOM shows input aria-invalid="true" and a role="alert" paragraph: "Khoá chưa dùng được — Nhà cung cấp từ chối khoá này (HTTP 401)." — the node-key-prompt.tsx "invalid" branch, only rendered when the server verdict is checked:true, works:false, i.e. reporting what the provider actually answered, not a client-side shape check.
    Note: the "correct key confirmed" half is out of this verifier's reach (must never type a real user API key) and is carried to the human gate per this eval's own note — not treated as a defect.
  network_observed: clean

- eval: E15
  criterion: AC-11
  run_id: minted-byo-key-onboarding-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_failure_actions
  verified_at: 2026-08-19T14:36:02+07:00
  output: |
    Tests  3 passed (3)
    Start at  14:36:02
    Duration  119ms (transform 14ms, setup 0ms, import 20ms, tests 2ms, environment 0ms)

- eval: E17
  criterion: AC-12
  run_id: minted-byo-key-onboarding-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_no_telemetry_sinks
  verified_at: 2026-08-19T14:41:00+07:00
  output: |
    ok — no telemetry transport shape in src
    EXIT_CODE: 0

- eval: E18
  criterion: AC-14
  run_id: minted-byo-key-onboarding-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_tier_boundary
  verified_at: 2026-08-19T03:12:06Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E19
  criterion: AC-13
  run_id: minted-byo-key-onboarding-E19-r3
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.bko_a11y_proto
  verified_at: 2026-08-19T14:42:30+07:00
  output: |
    "blocking": 8,
    "verdict": "REJECT"
    }
    a11y-scan: 8 violation(s) at [critical, serious]
    [exited with code 1]

<!-- <<<JUDGMENT-BLOCK-TEMPLATE -->
- eval: E20
  criterion: AC-15
  judged_by: judge panel (fresh context, 3 lenses — domain-correctness, operational-feasibility, spec-alignment)
  panel_proposal: FAIL
  votes:
    - domain-correctness: FAIL — Bốn tường đầu (no-plugin, installing, provisioning-wait, first-result) có trạng thái quan sát được rõ ràng trên màn hình, nhưng tường "nhập key" thì không: E12-step2 và E12-step3 chỉ hiện toast đỏ chung chung "Task failed / Task execution failed" đè lên panel node Text to Image, không có bất kỳ trường nhập API key hay form key nào hiển thị trong panel đó — một người đứng ngoài không phân biệt được người dùng đang tiến hay đang kẹt ở bước key.
    - operational-feasibility: FAIL — bốn tường đầu có trạng thái màn-hình-mà-thôi rõ ràng (E2/E6/E10/E2-step4), nhưng E12-step2 và E12-step3 pixel-giống-nhau: cùng một toast "Task failed" chung chung, không trường key, không chữ "missing key", không affordance nhập key nào tại node — không thể chỉ vào sự thay đổi giữa hai khung.
    - spec-alignment: FAIL — bốn tường đầu khớp kỳ vọng; tường thứ năm (nhập-key) không: E12-step2 và E12-step3 trùng byte (md5 giống hệt), chỉ hiện toast chung "Task failed / Task execution failed" trên node Text to Image, không có form nhập key tại node, không nhãn phân biệt lỗi thiếu/sai key.
  rationale: Cả ba lăng kính đồng thuận FAIL vì "tường nhập-key" (AC-9/AC-11) không có trạng thái quan sát được riêng biệt trên màn hình cho câu hỏi judgment của E20 — hai khung hình mà panel dựa vào (E12-step2/step3) thuộc bằng chứng của E12, không phải ảnh chụp riêng cho AC-15; panel chỉ đề xuất, người quyết ở Cổng 2.
  required_evidence:
    - Một ảnh chụp riêng (khác E12-step2, không trùng byte) cho thấy sau lỗi "Task execution failed" ở node bị lỗi key, một affordance nhập key xuất hiện ngay tại node — ví dụ ô "Enter API key" hoặc nút mở form key gắn với node đó — không phải toast chung chung.
    - Nếu E12-step2/step3 vốn phải khác nhau (ví dụ step2 = lỗi xuất hiện, step3 = form key đã mở/kết quả xác minh), cần capture lại hai trạng thái thực sự phân biệt được bằng mắt cho đúng câu hỏi judgment của E20, không dùng lại ảnh của E12.
  human_override:
<!-- JUDGMENT-BLOCK-TEMPLATE>>> -->

## Analyst

carried tu round 1 — baseline khong do lai round nay

Non-discriminating evals: none flagged this round — `baseline:` is `n-a` for every eval this round (not re-measured; last measured at round 1, per the carried baseline). No eval is reported green-on-both this round.

## Variance

none — no eval this round has `runs` > 1; no flaky/racy re-run signal observed.

## Iterations

Round 1: baseline established; E5 (AC-4), E8 (AC-6) verified PASS.
Round 2: E1 (AC-1), E3 (AC-3), E7 (AC-5), E18 (AC-14) verified PASS.
Round 3 (this round): E9 (AC-7) FAILED — provisioning-events test timeout (src/lib/plugin-executor/provisioning-events.test.ts:19), also reproduced in the full-suite `pnpm test` run; E19 (AC-13) FAILED — a11y-scan found 8 violations at critical/serious impact. E13 (AC-10 backend-effect) and the `pnpm build && pnpm typecheck` gate could not run — Bash tool classifier rate-limited (claude-sonnet-5 unavailable), retries exhausted. Scope-triage for review-findings also could not complete this round (`triage_failed`) — no finding was auto-classified or auto-fixed. Overall verdict: BLOCKED.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
