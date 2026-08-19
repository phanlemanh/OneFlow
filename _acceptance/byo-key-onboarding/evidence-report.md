---
schema_version: 2
feature_slug: byo-key-onboarding
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d08be1c8cb0eb2ad283cdc61e756fbab66be268c
human_signoff:
---

# Evidence Report: byo-key-onboarding

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E13 | AC-10 | test | PASS |
| E17 | AC-12 | script | PASS |
| E18 | AC-14 | script | PASS |
| E22 | AC-2 | test | PASS |
| E20 | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E13
  run_id: minted-byo-key-onboarding-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_key_verified_on_save
  verified_at: 2026-08-19T16:46:31+07:00
  output: |
    Tests  5 passed (5)
    Start at  16:46:31
    Duration  150ms (transform 15ms, setup 0ms, import 20ms, tests 25ms, environment 0ms)

- eval: E17
  run_id: minted-byo-key-onboarding-E17-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_no_telemetry_sinks
  verified_at: 2026-08-19T16:46:32+07:00
  output: |
    ok — no telemetry transport shape in src

- eval: E18
  run_id: minted-byo-key-onboarding-E18-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_tier_boundary
  verified_at: 2026-08-19T16:46:33+07:00
  output: |
    checking 148 changed file(s) against 9 t3 path rule(s), 3 allowed, 1 required
    OK: only declared t3 paths touched — the declared surface holds

- eval: E22
  run_id: minted-byo-key-onboarding-E22-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_example_run_produces_new_asset
  verified_at: 2026-08-19T16:46:34+07:00
  output: |
    Tests  2 passed (2)
    Start at  16:46:34
    Duration  36.94s (transform 259ms, setup 0ms, import 85ms, tests 36.55s, environment 0ms)

<!-- <<<JUDGMENT-BLOCK-TEMPLATE -->
- eval: E20
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  rationale: Bốn trên năm "bức tường" onboarding có bằng chứng screen-visible mạnh (no-plugin, provisioning-wait, first-result, key wall), nhưng lens domain-correctness không xác nhận được bức tường "cài plugin" (install wall): E2-step2/E6-step1 chỉ có MỘT khung tĩnh "Downloading tools... (0/2)" với spinner chung chung, không có khung thứ hai cho thấy bộ đếm tăng lên (vd. "(1/2)") hoặc nhãn thời gian trôi qua — nên không đủ căn cứ phân biệt "đang chạy" với "bị treo", khác hẳn bức tường provisioning-wait vốn được dựng có chủ đích để phân biệt điều này.
  votes:
    - domain-correctness: UNCERTAIN — Four of five walls have strong screen-visible evidence an outsider could point to and read as moving vs. stuck: no-plugin (E2-step1/E6-step1, static "Need 2 tools" banner), provisioning-wait (E10-step2, explicit "0s elapsed" + per-node ticking "3s" + bolded milestone label — exactly what AC-8 asks for), first-result (E2-step4, "Task completed" toast plus populated thumbnails), and the key wall (E12-step2/3, E14-step1: "Task failed — Missing required env var", inline key form at the node, and a verify-result message "Khoá chưa dùng được... HTTP 401"). The install wall is thinner: E2-step2 is a single static frame of "Downloading tools... (0/2)" with a generic spinner — no elapsed counter, no second frame showing the fraction move to 1/2 or 2/2 — so from this evidence alone I cannot confirm an outside observer watching that screen could tell active progress from a hang, unlike the provisioning wall which was built with that distinction in mind.
      required_evidence: A second screenshot captured a few seconds after E2-step2/E6-step1's 'Downloading tools... (0/2)' state, showing the counter having advanced (e.g. '(1/2)') or an elapsed-time label appearing next to it — proving the install wall's state changes over time rather than being a static frozen banner indistinguishable from a hang.
    - operational-feasibility: PASS — All five walls show a distinct, nameable on-screen state with no console/log needed: tìm-plugin = "Need 2 tools to run this example / Get the tools" banner naming the missing plugins (E2-step1, E6-step1); cài-plugin = "Downloading tools... (0/2)" counter with spinner (E2-step2); dựng-môi-trường = "Setting up environment / Installing SDK / Installing libraries — 3s elapsed. Later runs start instantly." labeled milestone with a running clock (E10-step2); nhập-key = inline "Task failed — Missing required env var" form with a save-and-verify field, later showing a rejected-key state "Khoá chưa dùng được — Nhà cung cấp từ chối khoá này (HTTP 401)" (E12-step2/3, E14-step1); chạy-xong = "Task completed" toast plus visibly produced output thumbnails distinct from the input (E2-step4). None of the supplied frames show a blank or unlabeled screen at any wall, so an observer beside the user could point at each and describe what state it is in.
    - spec-alignment: PASS — Each of the five walls shows a distinct, plain-English on-screen label with no console needed: wall 1 (no plugin) = the top strip "Need 2 tools to run this example / Tách cảnh video · Cắt ghép video" + "Get the tools" (E2-step1/E6-step1); wall 2 (install) = "Downloading tools... (0/2)" with a spinner (E2-step2); wall 3 (provisioning wait) = strip "Setting up environment / Installing SDK / Installing libraries / 0s elapsed. Later runs start instantly." plus a node badge with its own elapsed counter (E10-step2); wall 4 (first result) = "Done. Press Run..." then a green "Task completed" toast with real thumbnails/clips populating downstream nodes (E2-step3/E2-step4); wall 5 (key) = a red "Task failed / Missing required env var ..." toast with an inline node field to paste the key (E12-step2/E12-step3), and a rejected-key case showing the inline error "Khoá chưa dùng được — Nhà cung cấp từ chối khoá này (HTTP 401)" directly under the field (E14-step1). No wall's evidence leaves the observer guessing between moving and stuck.
  required_evidence:
    - A second screenshot captured a few seconds after E2-step2/E6-step1's 'Downloading tools... (0/2)' state, showing the counter having advanced (e.g. '(1/2)') or an elapsed-time label appearing next to it — proving the install wall's state changes over time rather than being a static frozen banner indistinguishable from a hang.
  human_override:
<!-- JUDGMENT-BLOCK-TEMPLATE>>> -->

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — danh sách non-discriminating trống (baseline không đo lại vòng này; xem round 1 để biết eval nào discriminate)

## Variance

none — không có eval nào runs > 1 vòng này

## Iterations

Round 4: E13, E17, E18, E22 đều exit 0 (pass), nhưng verdict tổng là REJECT vì review-findings phát hiện các khoảng trống trong-hợp-đồng chưa được đóng: E13/AC-10 chỉ hand-feed probe mock, không round-trip qua writer thật (PUT /api/settings/env → verifyChangedKeys); E17/AC-12 nửa phá-thử (teeth) không được nối vào lệnh eval nào; E18/AC-14 ổn về boundary nhưng đi kèm bug installMissingForExample báo "đã cài" cho plugin registry không nhận ra (AC-6); và E1/AC-1 nửa RED không có fixture nào để re-run. Các lệnh xanh không chứng minh đủ các AC liên quan — trở lại implementation để đóng các khoảng trống đo lường trước khi verify lại.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
