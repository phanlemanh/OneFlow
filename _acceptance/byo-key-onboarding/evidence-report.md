---
schema_version: 2
feature_slug: byo-key-onboarding
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c4d15a5c29709fc95c052c10af4035a6dff73218
human_signoff: Phan Le Manh 2026-08-19
---

# Evidence Report: byo-key-onboarding

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E7 | AC-5 | script | PASS |
| E22 | AC-2 | test | PASS |

## Evidence

- eval: E7
  run_id: minted-byo-key-onboarding-E7-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bko_one_action_installs_all
  verified_at: 2026-08-19T17:53:56+07:00
  output: |
          Tests  2 passed | 1 skipped (3)
       Start at  17:53:53
       Duration  3.00s (transform 62ms, setup 0ms, import 22ms, tests 2.91s, environment 0ms)

- eval: E22
  run_id: minted-byo-key-onboarding-E22-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_example_run_produces_new_asset
  verified_at: 2026-08-19T17:54:29+07:00
  output: |
          Tests  2 passed (2)
       Start at  17:53:55
       Duration  34.09s (transform 137ms, setup 0ms, import 38ms, tests 33.96s, environment 0ms)

## Analyst

carried tu round 1 — baseline khong do lai round nay
none — baseline không được đo lại round này (n-a cho cả hai eval), nên không có căn cứ để xếp eval nào vào diện không-phân-biệt round này. `pnpm lint:check` và `pnpm test` xanh trên cả hai phía là regression-guard bình thường, không liệt kê ở đây.

## Variance

none — every multi-run eval is uniform (không có eval nào khai `runs` > 1 round này; cả E7 và E22 đều deterministic, exit 0 một lần chạy).

## Iterations

Round 5: E7 và E22 từng đỏ thoáng qua do tranh chấp mạng khi ~39 agent anh em cùng clone plugin song song (git báo "Request timed out"), không phải do hành vi tính năng; chạy lại đúng commit này ngay sau đó cho exit 0 sạch (E7: 3.00s, E22: 34.09s, output như trên) — không có thay đổi implementation nào giữa hai lần chạy, chỉ là nhiễu đo lường mạng.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter

## Mục cần người phán — chữ ký giữ nguyên từ Cổng Bằng chứng 2026-08-19

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
  human_override: Phan Le Manh 2026-08-19 — thông qua theo đề xuất của hội đồng. Chặng 'đang tải công cụ' đúng là còn yếu; nó được tách thành việc riêng thay vì chặn phát hành.
