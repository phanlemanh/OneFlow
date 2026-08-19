---
schema_version: 2
feature_slug: byo-key-onboarding
verdict: BLOCKED
failed_evals: ["E19","E12","E14","E16"]
reason: |
  ui-check:E11 — Cannot isolate a clean, uninterrupted >=60s single-user observation of the provisioning strip in this shared dev-server session. Root cause (confirmed via browser console + network, dumped to evidence/E11-network.txt): this repo's `pnpm dev` on :3000 (PID 895, not started by this verifier — an already-running shared server per the run rules) is being edited concurrently by several OTHER workflow subagents in the same working tree during this verification run. That produces continuous "[Fast Refresh] rebuilding / done in Xms" cycles roughly every 5-25s for the whole test window (corroborated by a steady stream of *.hot-update.json/js fetches at that same cadence). Each Fast Refresh remounts the workspace React tree — confirmed because the node components' own mount-time console logs ("AddVideoNode data: Object", "AddImageNode") fire again right after every "[Fast Refresh] done" — which resets first-run-strip-container.tsx's local `override`/`provisioningStartRef` React state (the state AC-8's milestone trail + elapsed counter live in) back to its initial value. Concretely: I deleted oneflow-api-pyscenedetect's venv (rm -rf data/.tongflow/plugin-venv/oneflow-api-pyscenedetect) to force a real provisioning run, substituted a 25-minute synthetic video for the node's input (public/verifier-scratch-long.mp4, ffmpeg testsrc2, DataTransfer-injected into the upload input) so the underlying task would run long past typical provisioning time, and clicked "Start Slice". The strip correctly entered the real "provisioning" phase (Setting up environment ✓ / Installing SDK ✓ / Installing libraries [current], 6s elapsed) at t0 — captured to evidence/E11-step1.html — proving AC-7's milestone mechanism itself fires correctly with real work. But by t0+33s a poll already showed the strip reverted to the underlying "ready" text ("Done. Press Run on the first node to try it.") — before the 60s mark this eval requires — and it stayed reverted through t0+247s (evidence/E11-step2.html). A first attempt (different click) showed the same pattern (provisioning at +9s, reverted by whenever the next poll landed). Because the interrupting cause is externally-driven HMR remounts from concurrent sibling sessions modifying source files in this exact shared repo — not this verifier's actions, not a hang, and not something a single real end user would ever trigger on their own machine — I cannot produce the isolated single-user 60s window this eval's steps require. Retrying would not fix this: the churn is continuous and outside this verifier's control. Also note: I mutated shared runtime state to attempt this (deleted then re-triggered both oneflow-api-pyscenedetect and oneflow-api-ffmpeg venvs) and have restored both to a provisioned/warm state before finishing, and removed the temporary public/verifier-scratch-long.mp4 test fixture.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 69a01988c1f7de6b8da1bcb52ac3c83a1234c00b
human_signoff:
---

# Evidence Report: byo-key-onboarding

Round 2 — BLOCKED. E11 (AC-8, provisioning-wait persistence) could not be isolated from concurrent-session HMR churn in the shared dev server (see `reason` above and the E11 evidence block). Independently, four evals failed on their merits this round: E19 (AC-13 a11y proto unreachable), E12 (AC-9 needs-key state never mounts), E14 (AC-10 same client-side error-mapping bug blocks the whole flow), E16 (AC-12 network-truth gate tripped by transient 500s during the funnel walk). E5/E8/E15 are carried forward unchanged from round 1 (delta this round did not touch their paths).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-13 | ui-check | PASS |
| E5 | AC-4 | test | PASS (carried r1) |
| E6 | AC-4 | ui-check | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-6 | script | PASS (carried r1) |
| E9 | AC-7 | test | PASS |
| E10 | AC-7 | ui-check | PASS |
| E11 | AC-8 | ui-check | BLOCKED (cannotRun) |
| E12 | AC-9 | ui-check | FAIL |
| E13 | AC-10 | test | PASS |
| E14 | AC-10 | ui-check | FAIL |
| E15 | AC-11 | test | PASS (carried r1) |
| E16 | AC-12 | ui-check | FAIL |
| E17 | AC-12 | script | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-13 | script | FAIL |
| E20 | AC-15 | judgment | UNCERTAIN |
| E21 | AC-5 | ui-check | PASS |
| E22 | AC-2 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-byo-key-onboarding-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_example_needs_no_keys
  verified_at: 2026-08-19T10:14:00Z
  output: |
    plugins (literal list): ["oneflow-api-pyscenedetect","oneflow-api-ffmpeg"]
      ok  oneflow-api-pyscenedetect — no required env key
      ok  oneflow-api-ffmpeg — no required env key

- eval: E2
  run_id: e2-bko-20260819-102232-port3101
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T10:22:32Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/byo-key-onboarding/evidence/E2-step1.png
  observed: |
    E2-step1.png: canvas loaded with the bundled example (Add Video → Split Video → Videos(0) → Concat Video → Videos(0)), strip reads "Need 2 tools to run this example / Tách cảnh video · Cắt ghép video" with a single "Get the tools" button — matches expected "example loaded, strip visible". E2-step2.png: strip now reads "Downloading tools… (0/2)" with a spinner, taken ~400ms after the single button press — matches expected "installing". E2-step2c-ready.png: strip reads "Done. Press Run on the first node to try it.", Split Video's Implementation field now shows "PySceneDetect (local)" and Concat Video shows "FFmpeg (local)" (resolved from the just-cloned plugins, confirmed by dev-server log lines "[plugins] cloned: oneflow-api-pyscenedetect" / "oneflow-api-ffmpeg"). E2-step3.png: taken immediately after pressing "Start Slice" on the Split Video node — that node shows a spinning loader with "0s" elapsed, i.e. actually running. E2-step3b-provisioning.png (extra frame, not required by the eval but corroborating): the strip shows a real milestone trail "Setting up environment → Installing SDK → Installing libraries" with "0s elapsed" — a server-derived provisioning sequence, appearing during the Run step because venv provisioning is lazy on first real plugin execution (not during install-missing, which only clones code). E2-step4.png: a green "Task completed" toast is shown, the strip still reads "Done...", and the Split Video node now shows "Videos (2)" with two distinct new thumbnails labelled "Video 1"/"Video 2" — matches expected "output asset visible on canvas". Across all six saved frames plus dense polling in between (dialogSightings recorded 0 hits for [role=dialog], input[type=password], or key-related text at any sampled tick from step1 through step4), no key prompt, key form, or settings dialog ever appeared.
  network_observed: clean

- eval: E3
  run_id: minted-byo-key-onboarding-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_first_run_readiness
  verified_at: 2026-08-19T10:13:44Z
  output: |
    Tests  5 passed (5)
    Start at  10:13:44
    Duration  140ms (transform 23ms, setup 0ms, import 33ms, tests 2ms, environment 0ms)

- eval: E4
  run_id: E4-AC13-2026-08-19T03:35Z
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T03:35:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/byo-key-onboarding/evidence/E4-step1.png
  observed: |
    E4-step1.png (đọc bằng Read, 1280x800): workspace ở trạng thái first-run thật (localStorage.oneflow.firstRun.exampleCompleted đã bị xoá trước reload) — strip "Done. Press Run on the first node to try it." hiện ở trên cùng, canvas bên dưới render đầy đủ 6 node của ví dụ (Add Video, Video preview, Split Video/PySceneDetect, Videos(0), Concat Video/FFmpeg, Videos(0)) nối bằng edge, không có overlay/backdrop mờ, không modal. Khớp Expected bước 1.
    E4-step2.png (đọc bằng Read): sau khi (a) kéo node "Add Video" gốc bằng chuỗi mouse.down/move/up thật (không phải JS dispatch) và (b) bấm icon Video ở thanh "smart island" dưới cùng (chính là node-picker — click 1 icon = thêm node kiểu đó tại tâm viewport) để thêm 1 addVideoNode mới — ảnh cho thấy: node "Add Video" MỚI xuất hiện giữa canvas (panel Upload/Record Video/Library, không phải modal — vẫn là node có thể kéo, nằm chồng nhẹ lên các node khác, nền canvas + node khác vẫn sáng rõ phía sau, không dimmed/blocked), node "Video" preview đã dịch chuyển vị trí so với step1 (xác nhận kéo-thả có tác dụng thật), và strip "Done. Press Run on the first node to try it." VẪN hiện nguyên ở trên cùng, không bị che, không đổi thành trạng thái khác. Khớp chính xác Expected: "the canvas is fully interactive while the strip is showing; frames show a node added with the strip still present".
  network_observed: clean

- eval: E5
  run_id: minted-byo-key-onboarding-E5-r1
  exit_code: 0
  verifier: config:executors.test.unit_example_requirements
  verified_at: 2026-08-19T02:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-byo-key-onboarding-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T10:14:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/byo-key-onboarding/evidence/E6-step1.png
  observed: |
    E6-step1.png (390x844 mobile viewport, captured via `pnpm ui:capture` immediately after confirming — via a direct curl to /api/plugins/registry — that the registry held 0 installed plugins): the first painted frame shows a card at the top of the canvas reading "Need 2 tools to run this example" with subtext "Tách cảnh video · Cắt ghép video" (the two missing capabilities' Vietnamese labels) and a "Get the tools" button, above the unaltered workflow graph. Nothing had been clicked/pressed before this capture. E6-step1.html (DOM dump from the same capture) contains the identical three text nodes, confirming the strip text is in the rendered DOM, not just a screenshot artifact. A second independent read (mcp__Claude_Browser get_page_text on a navigation done while plugins/ was still empty) returned matching text. This matches Expected: the first painted frame already names what is missing, at load rather than after a run action.
  network_observed: clean

- eval: E7
  run_id: minted-byo-key-onboarding-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_one_action_installs_all
  verified_at: 2026-08-19T10:13:42Z
  output: |
    Tests  2 passed | 1 skipped (3)
    Start at  10:13:42
    Duration  3.67s (transform 228ms, setup 0ms, import 79ms, tests 3.38s, environment 0ms)

- eval: E8
  run_id: minted-byo-key-onboarding-E8-r1
  exit_code: 0
  verifier: config:executors.script.bko_no_restart_after_install
  verified_at: 2026-08-19T02:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-byo-key-onboarding-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_provisioning_events
  verified_at: 2026-08-19T10:13:42Z
  output: |
    Tests  3 passed (3)
    Start at  10:13:42
    Duration  12.73s (transform 110ms, setup 0ms, import 127ms, tests 12.39s, environment 0ms)

- eval: E10
  run_id: minted-byo-key-onboarding-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T10:14:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/byo-key-onboarding/evidence/E10-step1.png
  observed: |
    E10-step1.png (captured 255ms after clicking "Start Slice", 0s elapsed shown): first-run strip reads "Setting up environment  Installing SDK  Installing libraries / 0s elapsed. Later runs start instantly." with "Setting up environment" in bold/white (current) and the other two in muted grey (not yet reached). The Split Video node card itself additionally shows the raw server text "Đang tạo môi trường Python" with a spinner — the literal STARTED_TEXT["create-venv"] string from src/lib/plugin-executor/provisioning-events.ts.
    E10-step2.png (captured 2234ms after click, 2s elapsed): strip now reads "✓ Setting up environment  Installing SDK  Installing libraries / 2s elapsed..." — first milestone checked off, "Installing SDK" now bold/current. Node card shows "Đang cài bộ thư viện lõi" (literal STARTED_TEXT["install-sdk"]).
    E10-step3.png (captured 4230ms after click, 4s elapsed): strip reads "✓ Setting up environment  ✓ Installing SDK  Installing libraries / 4s elapsed..." — first two milestones checked off, "Installing libraries" now bold/current. Node card shows "Đang cài thư viện của công cụ" (literal STARTED_TEXT["install-requirements"]).
    This is a clean, monotonic three-step progression matching Expected exactly.
  network_observed: clean

- eval: E11
  run_id: minted-byo-key-onboarding-E11-r2
  exit_code: 2
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T10:14:00Z
  screenshot: evidence/E11-step1.html
  observed: |
    step1 (evidence/E11-step1.html, t=1787110827037, ~6s after a real fresh-venv provisioning run was triggered): the strip shows phase=provisioning with a milestone trail — "Setting up environment" (checked), "Installing SDK" (checked), "Installing libraries" (current, aria-current="step") — and the line "6s elapsed. Later runs start instantly." This matches Expected's premise: a real, named, in-progress step is on screen, not a bare spinner.
    step2 (evidence/E11-step2.html): the closest poll before the 60s mark, at t0+33.3s, already read differently from step1 — the whole milestone trail was gone, replaced by a single line: "Done. Press Run on the first node to try it." (the underlying "ready"-phase copy). A later re-check at t0+246.9s read identically (still the "ready" text, not the milestone trail). So in the actual frames captured, the "last reached milestone and its label" were NOT still on screen at/after the 60s mark. This verifier's traced explanation (Fast-Refresh remounts from concurrent sibling sessions editing this shared repo, see evidence/E11-network.txt) is why exitCode is reported as cannotRun (2) rather than a flat FAIL against the feature's own logic — but the two saved frames themselves, read as-is, do not show milestone persistence at the 60s mark.
  network_observed: app-fail
  reason: see frontmatter `reason` — cannot isolate a clean, uninterrupted >=60s single-user observation window in this shared, concurrently-edited dev server; the real milestone mechanism itself fires correctly at t0 but is reset by external Fast-Refresh remounts before the 60s mark.

- eval: E12
  run_id: DLmxFc7KP5ZlbwUAK5eoh
  exit_code: 1
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T10:14:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/byo-key-onboarding/evidence/E12-step1.png
  observed: |
    Đọc trực tiếp 3 frame vừa lưu bằng Read: step1 — node "Text to Image" (ABI slot image-gen, plugin OpenAI = tongflow-api-openai, khai OPENAI_API_KEY required:true) vừa được thêm vào canvas, nối từ node "Text", chưa chạy — khớp expected bước 1. step2 (chụp ~21s sau khi bấm Run, đợi #node-key-OPENAI_API_KEY tới 20s) — node "Text to Image" vẫn y nguyên UI bình thường, KHÔNG có khung needs-key màu hổ phách nào xuất hiện trong node; chỉ có toast chung "Task failed / Task execution failed / Copy" ở góc trên — KHÔNG khớp expected ("node shows the needs-key state"). step3 (chụp thêm 5s sau) — giống hệt step2, xác nhận đây là trạng thái ổn định cuối cùng chứ không phải đang tải — form nhập khoá tại node không bao giờ xuất hiện.
    Root cause xác định qua đọc mã: src/hooks/use-task.ts, hook useBatchTaskManager (đường mọi node ABI dùng khi bấm Run, qua useAbiExecution) — trong EventSource.onmessage set `error: message.error,` KHÔNG fallback sang `message.data?.error` như hook chị em useTaskSubscription đã làm đúng. TaskEvent không có field `error` cấp cao nhất — error luôn nằm trong `data.error` — nên message.error luôn undefined trên đường useBatchTaskManager, khiến classifyFailure("") trả {kind:"none"}, useNodeKeyGate().noteTask() không bao giờ set needs-key. Server-side pre-check (commit 69a0198) hoạt động đúng (DB xác nhận error="Missing required env var OPENAI_API_KEY"), nhưng client-side error mapping làm rơi mất thông điệp trước khi tới UI của node.
  network_observed: app-fail

- eval: E13
  run_id: minted-byo-key-onboarding-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_key_verified_on_save
  verified_at: 2026-08-19T10:13:38Z
  output: |
    Tests  5 passed (5)
    Start at  10:13:38
    Duration  137ms (transform 12ms, setup 0ms, import 18ms, tests 22ms, environment 0ms)

- eval: E14
  run_id: minted-byo-key-onboarding-E14-r2
  exit_code: 1
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T10:14:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/byo-key-onboarding/evidence/E14-step1.html
  observed: |
    Read evidence/E14-step1.html (the saved live DOM after a genuine missing-key task failure). Content confirms: the toast text "Task failed" (3x) and "Task execution failed" (1x) are present — the generic fallback message. Grepped for the key-prompt's own copy and DOM markers ("cần một khoá API", "Nhập khoá", "node-key-" id prefix, KeyRound icon context) — ZERO matches. The "Text Generation" node in the DOM still shows only Implementation/Model/instructions/Execute — no inline key form, no envKey label, no password input. This directly contradicts Expected: there is no key field to "enter a deliberately wrong key" into in step 1, because the node's needs-key gate never opens after a real failure, so steps 2 and 3 could not be attempted at all. Root cause: same use-task.ts BATCH SSE handler bug traced under E12 (message.error with no fallback to message.data?.error), plus a second, independent bug in task-failure-toaster.tsx (`data.message?.trim() || data?.error?.trim()` always picks the generic .message first). This supersedes the prior round-1 "cannotRun" E14-blocked.md (credential-only blocker) with a stronger, root-caused FAIL: even with unlimited time/credentials, step 1 cannot be performed today because the precondition UI never appears.
  network_observed: unscoped-partial

- eval: E15
  run_id: minted-byo-key-onboarding-E15-r1
  exit_code: 0
  verifier: config:executors.test.unit_failure_actions
  verified_at: 2026-08-19T02:07:35Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E16
  run_id: minted-byo-key-onboarding-E16-r2
  exit_code: 1
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T10:14:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/evidence/E16-step1.png
  observed: |
    evidence/E16-step1.png: the "Ví dụ / example" workflow canvas, top strip shows a checkmark and "Done. Press Run on the first node to try it." Both missing plugins (PySceneDetect, FFmpeg) show as installed/selectable implementations, i.e. the AC-4/AC-5/AC-6 wall is cleared. evidence/E16-network.txt: full chronological request log for the walk (load → "Get the tools" POST /api/plugins/install-missing 200 → node "Start Slice" POST /api/task/create 404, no video uploaded in this scripted walk). No request body/query in the entire walk carries onboarding-step/funnel/timing/behavioural terms; a repo-wide grep for sendBeacon/analytics/mixpanel/segment/amplitude/posthog/gtag/telemetry found zero client-side telemetry transport. However the same captured log shows GET /api/plugins/registry returning 500 twice during the walk, each immediately preceded by a "[Fast Refresh] rebuilding" console line — caused by the shared dev server recompiling under concurrent load from other verifier subagents, not a defect in the code under test — plus four 500s on GET /workspace navigations. Per the network-truth rule, at least one unambiguous FAIL-eligible app-origin 500 forces exitCode != 0 for this run independent of AC-12's own privacy assertion (which is satisfied on its own merits).
  network_observed: app-fail

- eval: E17
  run_id: minted-byo-key-onboarding-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_no_telemetry_sinks
  verified_at: 2026-08-19T10:14:00Z
  output: |
    ok — no telemetry transport shape in src

- eval: E18
  run_id: minted-byo-key-onboarding-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_tier_boundary
  verified_at: 2026-08-19T10:14:00Z
  output: |
    comparing HEAD against origin/main (merge-base d3599d8e4ba5)
    checked 128 changed file(s) against 9 t3 path rule(s), 3 allowed, 1 required
    OK: only declared t3 paths touched — the declared surface holds

- eval: E19
  run_id: minted-byo-key-onboarding-E19-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.bko_a11y_proto
  verified_at: 2026-08-19T10:14:00Z
  output: |
    FAIL: dev server never served the proto route on port 3199

    [exited with code 1]

<!-- <<<JUDGMENT-BLOCK-TEMPLATE -->
- eval: E20
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  rationale: Four of the five onboarding walls (no-plugin, install, provisioning-wait, first-result) have observer-visible, on-screen state confirmed in E2/E6/E10 evidence. The fifth wall (key entry/verification) has no in-scope evidence: the input list names E11-step2.png and E12-step2.png, but only E11-step2.html and E12-step2-analysis.html exist at those slugs (out of the eval's declared input scope), so no panel could confirm whether an observer can tell "moving" from "stuck" at the key wall.
  votes:
    - domain-correctness: UNCERTAIN — E2/E6/E10 screenshots clearly show three walls with observer-visible state (no-plugin, install, provisioning-wait), but the files named in the Input list for the key wall (E11-step2.png, E12-step2.png) do not exist at those paths — only E11-step2.html and E12-step2-analysis.html exist, out of scope per the strict input-list rule.
      required_evidence:
        - A PNG screenshot (e.g. re-saved as E11-step2.png or E12-step2.png in _acceptance/byo-key-onboarding/evidence/) capturing the on-canvas state of the key-entry/verification wall — the node's inline key form and its saved/verified-or-rejected feedback — visible without opening devtools, console, or an .html DOM dump.
    - operational-feasibility: UNCERTAIN — Bốn trong năm tường có bằng chứng ảnh rõ ràng, không cần console (E2-step1/E6-step1, E2-step2, E10-step2, E2-step4). Tường thứ năm — nhập key — không có bằng chứng ảnh hợp lệ trong đúng danh sách Input: E11-step2.png và E12-step2.png được liệt kê nhưng không tồn tại.
      required_evidence:
        - Ảnh chụp màn hình PNG thật của tường nhập key (đúng tên E11-step2.png hoặc E12-step2.png như danh sách Input yêu cầu) cho thấy trạng thái form nhập key tại node; nếu file này tồn tại và cho thấy trạng thái rõ ràng như bốn tường kia thì verdict đổi thành PASS.
    - spec-alignment: UNCERTAIN — Walls 1-4 each show a labeled, screen-only state an observer could point at. For the fifth wall (key), the eval's own input list names E11-step2.png and E12-step2.png, but those files do not exist — the evidence directory only holds E11-step2.html and E12-step2-analysis.html, outside this eval's declared input scope.
      required_evidence:
        - A PNG literally named E11-step2.png (screenshot, not the existing E11-step2.html) capturing the node-level key-entry UI state, produced by re-running the E11 evidence-capture step.
        - A PNG literally named E12-step2.png (not E12-step2-analysis.html) capturing the post-save key-verification state (success/failure label) at the wall boundary, produced by re-running the E12 capture step.
  human_override:
<!-- JUDGMENT-BLOCK-TEMPLATE>>> -->

- eval: E21
  run_id: minted-byo-key-onboarding-E21-r2
  exit_code: 0
  baseline: n-a
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-19T10:14:00Z
  screenshot: /private/tmp/claude-501/-Users-manh-macmini-dev-oneflow/ec32f803-71bc-4c13-8cfc-c067a2bd2a62/scratchpad/evidence/E21-step1.png
  observed: |
    E21-step1.png: top strip reads "Need 2 tools to run this example" / "Tách cảnh video · Cắt ghép video" with a "Get the tools" button — >=2 missing plugin capability names shown, matching Expected. Split Video and Concat Video nodes both show "No plugin implementations were scanned for this capability" (red/empty), consistent with TONGFLOW_PLUGINS_DIR being genuinely empty at boot. E21-step2.png (taken right after the ONE click on "Get the tools"): the missing-tools strip is gone, replaced by "✓ Done. Press Run on the first node to try it."; Split Video's Implementation picker now reads "PySceneDetect (local)" and Concat Video's reads "FFmpeg (local)" — both nodes resolved an implementation where before they had none. Server log for this exact window shows exactly one `POST /api/plugins/install-missing 200` and, inside it, two `[plugins] cloned:` lines — one press, both installs, no second press issued. E21-step3.html (accessibility-tree + outerHTML fallback, since the interactive Browser pane could not composite a screenshot here): the opened Plugins dialog lists both plugins as "Up to date" (disabled) + "Uninstall" — the installed-state markers the dialog only shows for plugins present on disk, cross-checked with GET /api/plugins/registry returning both ids. All content matches Expected: the two ids implied by step1's two capability names both appear installed in step3, from a single press.
  network_observed: clean

- eval: E22
  run_id: minted-byo-key-onboarding-E22-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_example_run_produces_new_asset
  verified_at: 2026-08-19T10:13:39Z
  output: |
    Tests  2 passed (2)
    Start at  10:13:39
    Duration  39.30s (transform 211ms, setup 0ms, import 30ms, tests 39.17s, environment 0ms)

## Lệnh fail không gắn eval

Hai lệnh trong bộ commit/PR checklist thất bại nhưng không gắn với eval nào (không đổi verdict của bất kỳ E-id nào ở trên, nhưng ghi lại theo yêu cầu quy trình):

- `pnpm build && pnpm typecheck` — exitCode 1. Output tail: `[Error [PageNotFoundError]: Cannot find module for page: /api/workflow/execute]` / `[Error [PageNotFoundError]: Cannot find module for page: /api/workspace/[id]]` → `Build error occurred` / `Failed to collect page data for /api/workflow/execute`. Không có evals gắn kèm trong đầu vào round này; cần một round riêng để xác định đây là lỗi build có sẵn trên nhánh hay do state `.next` cục bộ hỏng trong phiên chạy chung.
- `pnpm test` (full suite) — exitCode 1. 1 test thất bại trong 41 file: `src/lib/plugin-executor/provisioning-events.test.ts` ("emits the three steps in order, each completion after its work"), kèm `Error: [Errno 2] No such file or directory: 'build/bdist.macosx-11.0-arm64/wheel/./tongflow/engine/_subproc.py'`. Đáng chú ý: bản chạy CÔ LẬP của cùng file test này cho E9 (xem block E9 ở trên) PASS 3/3 — cho thấy đây nhiều khả năng là giao thoa trạng thái/tài nguyên khi chạy chung toàn bộ suite (build artifact thiếu) chứ không phải regression logic của milestone ordering; không đủ căn cứ để gắn vào E9 round này.

## Analyst

carried tu round 1 — baseline khong do lai round nay
none — no eval baseline re-measured this round (P2); every eval's `baseline:` field is recorded as n-a per instruction.

## Variance

none — no eval carried `runs` > 1 this round, and no deterministic eval showed flaky/racy variance across its listed run.

## Iterations

Round 1: E5, E8, E15 (regression guards) passed; E14 came back cannotRun for lack of a real provider credential to exercise the key-rejection path (logged as E14-blocked.md); the server-side executor pre-flight key check landed in commit 69a0198. Round 2 (this round): E19, E12, E14, E16 failed on their merits and E11 could not be isolated from concurrent-session HMR churn on the shared dev server — verdict BLOCKED, returned to implementation.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
