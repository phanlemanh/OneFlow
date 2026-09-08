---
schema_version: 2
feature_slug: director-wire-shape
verdict: REJECT
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: af7659932fcba7867ac162bb5b77b39a4e0c8c25
human_signoff: 
---

# Evidence Report: director-wire-shape

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | script | PASS |
| E13 | AC-13 | script | PASS |
| E14a | AC-4 | judgment | UNCERTAIN |
| E14b | AC-5 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-director-wire-shape-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_wire_returns_plan
  verified_at: 2026-09-08T05:29:40Z
  output: |
    OK: success payload carries planJson, runId, dslVersion

- eval: E2
  run_id: minted-director-wire-shape-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_old_client_unaffected
  verified_at: 2026-09-08T05:29:45Z
  output: |
    OK: name/description/nodes/edges unchanged; new fields are additive

- eval: E3
  run_id: minted-director-wire-shape-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_error_envelope
  verified_at: 2026-09-08T05:30:13Z
  output: |
          Tests  14 passed (14)
       Start at  05:30:13
       Duration  226ms (transform 78ms, setup 0ms, import 133ms, tests 7ms, environment 0ms)

- eval: E4
  run_id: minted-director-wire-shape-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_event_written_server_side
  verified_at: 2026-09-08T05:30:14Z
  output: |
          Tests  3 passed | 4 skipped (7)
       Start at  05:30:14
       Duration  116ms (transform 21ms, setup 0ms, import 46ms, tests 4ms, environment 0ms)

- eval: E5
  run_id: minted-director-wire-shape-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_feedback_state_machine
  verified_at: 2026-09-08T05:30:13Z
  output: |
         Tests  6 passed (6)
        Start at  05:30:13
        Duration  93ms (transform 13ms, setup 0ms, import 20ms, tests 2ms, environment 0ms)

- eval: E6
  run_id: minted-director-wire-shape-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_events_schema_shape
  verified_at: 2026-09-08T05:30:13Z
  output: |
          Tests  24 passed (24)
       Start at  05:30:13
       Duration  87ms (transform 10ms, setup 0ms, import 17ms, tests 2ms, environment 0ms)

- eval: E7
  run_id: minted-director-wire-shape-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_workflow_run_provenance
  verified_at: 2026-09-08T05:30:12Z
  output: |
          Tests  3 passed (3)
       Start at  05:30:12
       Duration  319ms (transform 30ms, setup 0ms, import 227ms, tests 4ms, environment 0ms)

- eval: E8
  run_id: minted-director-wire-shape-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_body_backward_compatible
  verified_at: 2026-09-08T05:30:15Z
  output: |
          Tests  4 passed | 6 skipped (10)
       Start at  05:30:15
       Duration  108ms (transform 20ms, setup 0ms, import 29ms, tests 2ms, environment 0ms)

- eval: E9
  run_id: minted-director-wire-shape-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_body_per_field_caps
  verified_at: 2026-09-08T05:30:14Z
  output: |
          Tests  6 passed | 4 skipped (10)
       Start at  05:30:14
       Duration  88ms (transform 14ms, setup 0ms, import 20ms, tests 2ms, environment 0ms)

- eval: E10
  run_id: minted-director-wire-shape-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_expect_count_unchanged
  verified_at: 2026-09-08T05:29:50Z
  output: |
    OK: 240 expect() in pre-existing tests, unchanged

- eval: E11
  run_id: minted-director-wire-shape-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_migrator_on_old_db
  verified_at: 2026-09-08T05:30:13Z
  output: |
          Tests  1 passed (1)
       Start at  05:30:13
       Duration  96ms (transform 11ms, setup 0ms, import 18ms, tests 10ms, environment 0ms)

- eval: E12
  run_id: minted-director-wire-shape-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_barrel_export
  verified_at: 2026-09-08T05:29:55Z
  output: |
    OK: directorEvents reachable through src/db/schema.ts

- eval: E13
  run_id: minted-director-wire-shape-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_no_prompt_in_prod_log
  verified_at: 2026-09-08T05:30:00Z
  output: |
    OK: prompt text only reaches logger.debug

- eval: E14a
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment) — proposal UNCERTAIN
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — baseline-2026-08-26.md/.json chỉ là mốc EVAL-0 (Director v1, trước khi gói director-wire-shape/D0 tồn tại) — nó không chứa bất kỳ số liệu director_events nào (bảng đó chưa được ghi ở thời điểm capture này), nên câu (2) không có căn cứ để trả lời. Bốn file được cấp không bao gồm một lần chạy run-baseline.mjs MỚI (sau khi implement D0) hay bất kỳ ảnh chụp trạng thái director_events trước/sau, nên câu (1) cũng không kiểm chứng được là "vẫn >= 86,7%" hay đã hồi quy — con số 86,7% trong evidence là chính cái mốc gốc, không phải kết quả đối chiếu lại.
    - operational-feasibility: UNCERTAIN — Câu (1) có căn cứ trong phạm vi cho phép: baseline-2026-08-26.json ghi successRateWithin2Attempts "86.7%" (26/30) trên summary.frozenConfig khớp đúng golden/frozen-config.json (cùng repoHead 4b9c1c7a97da1dde817e35ee240111d2cd6d889a, cùng 7 plugin) — đạt mốc >=86,7%. Nhưng câu (2) hoàn toàn không có căn cứ trong bốn file được phép đọc: baseline-2026-08-26.json/.md chỉ ghi ok/ms/status/nodes/edges cho từng prompt, không có bất kỳ số liệu nào về bảng director_events (không có field nào tên director_events, insert count, hay before/after delta) — đây là baseline EVAL-0 của Director v1 trước khi wiring D0, không phải bằng chứng verify AC-4 phần "mỗi lượt gọi sinh đúng một row".
    - spec-alignment: UNCERTAIN — Bốn file input chỉ có baseline-2026-08-26.md/.json — đây chính là EVAL-0 (Director v1, TRƯỚC gói D0), dùng để LẬP ra mốc 86,7%, nên nó không thể vừa là mốc vừa là bằng chứng "chạy lại sau khi cài D0 vẫn đạt mốc". Cả hai file này không có bất kỳ dòng nào nhắc tới `director_events` (không cột, không đếm), nên câu (2) hoàn toàn không có căn cứ trong phạm vi input được cấp. Theo đúng luật của eval này, thiếu căn cứ trong danh sách input là lý do trả UNCERTAIN, không phải lý do tự đi tìm file khác.
  rationale: Ba lens đều bỏ phiếu UNCERTAIN cho cùng lý do gốc — bốn file input được cấp (baseline-2026-08-26.md/.json) là mốc EVAL-0 của Director v1 trước gói director-wire-shape/D0, không chứa bất kỳ số liệu director_events nào, nên câu hỏi (2) về số row director_events tăng thêm đúng bằng số lượt gọi không có căn cứ để trả lời trong phạm vi cho phép.
  required_evidence:
    - "[domain-correctness] Một file bằng chứng MỚI (vd. _acceptance/director-wire-shape/evidence/e14a-<ngày>.md hoặc .json) ghi kết quả thực tế của lệnh `node _acceptance/director-wire-shape/golden/run-baseline.mjs` chạy SAU khi director-wire-shape đã lên, gồm trường successRateWithin2Attempts (hoặc total/ok) để so với ngưỡng 86,7% — nếu script tự thoát mã 2 vì plugins/ lệch frozen-config.json thì cũng phải nêu rõ trong evidence đó."
    - "[domain-correctness] Số đếm director_events TRƯỚC và SAU lần chạy golden-set đó (vd. `SELECT count(*) FROM director_events` chạy qua drizzle-kit studio hoặc psql, chụp lại hai con số before/after), để tính phần TĂNG THÊM và đối chiếu với số lượt gọi /api/director thực sự thực thi trong lần chạy (không nhất thiết là 30 nếu dùng --resume/--limit)."
    - "[operational-feasibility] Một file evidence riêng cho AC-4/E14a (vd evidence/e14a-<ngày>.md hoặc .json) ghi rõ số row director_events TRƯỚC và SAU khi chạy run-baseline.mjs trên golden set, cho thấy phần TĂNG THÊM bằng đúng số lượt gọi /api/director thực hiện trong lần chạy đó"
    - "[operational-feasibility] Output thật của một truy vấn DB (vd `select count(*) from director_events where kind='generated'`) chụp hai lần quanh lần chạy run-baseline.mjs, hoặc log của chính script nếu nó tự đối chiếu số row — hiện baseline-2026-08-26.json không chứa trường nào liên quan đến director_events nên không thể suy ra số này từ file đã cho"
    - "[spec-alignment] Một file bằng chứng MỚI (vd evidence/e14a-<ngày>.md hoặc .json) là output thật của lệnh `node _acceptance/director-wire-shape/golden/run-baseline.mjs` chạy SAU khi gói D0 đã lên, đối chiếu plugins/ với golden/frozen-config.json (không thoát mã 2), và in ra successRateWithin2Attempts của lần chạy đó để so với 86,7%."
    - "[spec-alignment] Trong cùng bằng chứng đó (hoặc file riêng), số đếm `SELECT COUNT(*) FROM director_events` chụp NGAY TRƯỚC và NGAY SAU lần chạy golden set, cùng số lượt gọi `/api/director` thực hiện trong lần chạy (vd 30 lượt) — để chứng minh phần TĂNG THÊM của director_events bằng đúng số lượt gọi."
  human_override: 

- eval: E14b
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment) — proposal UNCERTAIN
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Ba file input chỉ chứng minh hai việc khác: (1) E14 gốc chạy bằng script `run-baseline.mjs` gọi thẳng `/api/director`, tự nhận diện là dụng cụ sai để đo tỉ lệ mồ côi (100% mồ côi là hiện tượng do dụng cụ, không phải do UI); (2) một lượt kiểm tay bằng `curl`/POST trực tiếp tới `/api/director/feedback` với đúng 1 runId qua 2 outcome (`accepted` rồi `discarded` bị từ chối 409), không phải thao tác trong giao diện, không phải 5 prompt, và không đi qua cả ba nhánh canvas rỗng/có-node-xác nhận/có-node-hủy như câu hỏi yêu cầu. Không có file nào trong danh sách input chứa kết quả truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind` của một phiên UI thật, nên không thể chấm PASS hay FAIL cho AC-5/E14b.
    - operational-feasibility: UNCERTAIN — Ba file được cấp chỉ chứa E14 (script `run-baseline.mjs` gọi thẳng `/api/director`, không phải UI) và một đoạn kiểm tay bằng ba lệnh `POST /api/director/feedback` trực tiếp (curl-style), không phải thao tác trong panel Director với 5 prompt tiếng Việt qua cả ba nhánh (canvas rỗng/xác nhận/hủy). Không có bằng chứng nào trong phạm vi cho thấy truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind` đã thực sự được chạy sau một phiên UI như vậy, nên không thể xác nhận tỉ lệ `generated` mồ côi <10% hay đủ mặt accepted/replaced/discarded từ thao tác UI thật.
    - spec-alignment: UNCERTAIN — Ba file cho phép không chứa kết quả truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind` nào cả — e14-d0-2026-08-26.json chỉ là số liệu golden-set (T1-T4, ok/ms/nodes), không liên quan đến bảng director_events. Bằng chứng "đã kiểm bằng tay" trong e14-2026-08-26.md là gọi thẳng POST /api/director/feedback (accepted→200, discard lần hai→409, outcome sai→400), không phải thao tác TRONG GIAO DIỆN qua panel Director với 5 prompt và ba nhánh canvas-rỗng/canvas-có-node-xác-nhận/canvas-có-node-hủy như câu hỏi yêu cầu; nó cũng không phủ nhánh "replaced". Chính contract.md và evidence.md còn ghi rằng E14b (kiểm UI) là một đề nghị tách ra để ký ở Cổng 1, chưa xác nhận là đã thực thi với số đo cụ thể.
  rationale: Ba lens đều bỏ phiếu UNCERTAIN vì bằng chứng hiện có (script run-baseline.mjs gọi thẳng API, và ba lệnh POST feedback thủ công) không phải thao tác thật trong panel Director qua 5 prompt và đủ ba nhánh canvas-rỗng/xác-nhận/hủy, và không có kết quả truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind` của một phiên UI thật để tính tỉ lệ mồ côi hay xác nhận đủ ba kind outcome.
  required_evidence:
    - "[domain-correctness] Một file evidence mới (vd. evidence/e14b-<ngày>.md hoặc .json) ghi lại phiên thao tác THẬT trong giao diện: mở panel Director, gõ 5 prompt tiếng Việt, và đi qua đủ ba nhánh — canvas rỗng (áp dụng ngay), canvas có node rồi bấm Xác nhận, canvas có node rồi Hủy (Escape/click ra ngoài)"
    - "[domain-correctness] Kết quả truy vấn thực tế `SELECT kind, count(*) FROM director_events GROUP BY kind` chạy SAU phiên UI đó (dump SQL hoặc ảnh chụp), cho thấy có mặt đủ ba kind accepted/replaced/discarded và tính được tỉ lệ `generated` chưa vá outcome trên tổng số row của riêng phiên này"
    - "[domain-correctness] Nếu owner coi 3 lệnh POST /api/director/feedback thủ công trong contract.md là đủ thay thế UI, cần một xác nhận rõ ràng bằng văn bản của owner rằng thao tác qua API trực tiếp (không qua panel Director) được chấp nhận là bằng chứng cho AC-5, vì hiện contract nói rõ 'E14b (người, trong UI)' là một eval TÁCH RIÊNG chưa có evidence đính kèm trong bộ ba file được cấp"
    - "[operational-feasibility] Một file evidence mới (vd. _acceptance/director-wire-shape/evidence/e14b-<ngày>.md) ghi lại phiên thao tác THẬT trong panel Director: ảnh chụp màn hình hoặc log thao tác cho thấy đã gõ 5 prompt tiếng Việt và đi qua đủ ba nhánh (canvas rỗng bấm áp dụng ngay; canvas có node rồi bấm XÁC NHẬN; canvas có node rồi HỦY bằng Escape/click ra ngoài)"
    - "[operational-feasibility] Kết quả thực thi câu lệnh `SELECT kind, count(*) FROM director_events GROUP BY kind` chạy NGAY SAU phiên UI đó (không phải sau script run-baseline hay curl thủ công), kèm số liệu cho từng kind để tính tỉ lệ generated-chưa-vá và xác nhận có mặt accepted/replaced/discarded"
    - "[spec-alignment] Kết quả thật của truy vấn SQL `SELECT kind, count(*) FROM director_events GROUP BY kind` (ảnh chụp hoặc output text) chạy SAU phiên thao tác UI, cho thấy tỉ lệ `generated` chưa vá outcome"
    - "[spec-alignment] Một bản ghi/ảnh chụp phiên thao tác trong UI panel Director: gõ 5 prompt tiếng Việt và đi qua đúng ba nhánh — canvas rỗng (áp dụng ngay), canvas có node + bấm xác nhận, canvas có node + Escape/bấm ra ngoài (hủy)"
    - "[spec-alignment] Bằng chứng nhánh outcome `replaced` thực sự được ghi vào director_events (hiện chỉ có accepted/discarded/invalid_outcome qua POST trực tiếp, thiếu replaced và thiếu đường đi qua UI thật)"
  human_override: 

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-director-wire-shape-SUITE-bash_scripts_acceptance_preflight_verify-r2
  exit_code: 0
  verified_at: 2026-09-08T05:30:20Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-director-wire-shape-SUITE-node_scripts_roadmap_check_plan_freeze_m-r2
  exit_code: 0
  verified_at: 2026-09-08T05:30:22Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-director-wire-shape-SUITE-build_typecheck-r2
  exit_code: 0
  verified_at: 2026-09-08T05:30:24Z

- cmd: pnpm lint:check
  run_id: minted-director-wire-shape-SUITE-lint_check-r2
  exit_code: 0
  verified_at: 2026-09-08T05:30:28Z

- cmd: pnpm test
  run_id: minted-director-wire-shape-SUITE-test-r2
  exit_code: 0
  verified_at: 2026-09-08T05:30:30Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-director-wire-shape-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r2
  exit_code: 0
  verified_at: 2026-09-08T05:30:50Z

- cmd: pnpm verify:plugins
  run_id: minted-director-wire-shape-SUITE-verify_plugins-r2
  exit_code: 0
  verified_at: 2026-09-08T05:30:55Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-director-wire-shape-SUITE-gen_abi-r2
  exit_code: 0
  verified_at: 2026-09-08T05:31:00Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-director-wire-shape-SUITE-bash_scripts_fork_check_fork_identity_sh-r2
  exit_code: 0
  verified_at: 2026-09-08T05:31:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay
none — baseline không đo lại round này (P2); mọi eval trong bảng trên ghi baseline: n-a.

## Variance

none — no stochastic (runs > 1) evals this round; every eval ran once (runs: 1) and every deterministic eval is uniform (0/1 or 1/1, no flakiness observed).

## Iterations

Round 1: code review flagged AC-7 as having no producer for `directorRunId` — the workflow-save path only persisted it on INSERT, dropped on UPDATE; returned to implementation for wiring.
Round 2: all 13 machine evals (E1-E13) + 9 suite commands PASS, but code review confirms the same AC-7 gap is still present on the UPDATE branch (`src/app/api/workspace/save/route.ts:73`, `src/components/workspace/workflow-title-menu.tsx:160`) — no automated eval targets the update-existing-workflow path, so `failed_evals` stays empty even though AC-7 is not actually satisfied end-to-end; verdict REJECT pending a fix to the UPDATE branch and E14a/E14b remain UNCERTAIN pending fresh evidence.