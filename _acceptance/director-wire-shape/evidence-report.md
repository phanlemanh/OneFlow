---
schema_version: 2
feature_slug: director-wire-shape
verdict: REJECT
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cfabe3d189ddfa55f6ab85cd0a72b19d7c367ce7
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
  run_id: minted-director-wire-shape-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_wire_returns_plan
  verified_at: 2026-09-08T05:02:20Z
  output: |
    OK: success payload carries planJson, runId, dslVersion

- eval: E2
  run_id: minted-director-wire-shape-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_old_client_unaffected
  verified_at: 2026-09-08T05:02:22Z
  output: |
    OK: name/description/nodes/edges unchanged; new fields are additive

- eval: E3
  run_id: minted-director-wire-shape-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_error_envelope
  verified_at: 2026-09-08T05:02:26Z
  output: |
         Tests  14 passed (14)
      Start at  05:02:26
      Duration  215ms (transform 78ms, setup 0ms, import 133ms, tests 7ms, environment 0ms)

- eval: E4
  run_id: minted-director-wire-shape-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_event_written_server_side
  verified_at: 2026-09-08T05:02:27Z
  output: |
         Tests  3 passed | 4 skipped (7)
      Start at  05:02:27
      Duration  256ms (transform 108ms, setup 0ms, import 171ms, tests 5ms, environment 0ms)

- eval: E5
  run_id: minted-director-wire-shape-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_feedback_state_machine
  verified_at: 2026-09-08T05:02:27Z
  output: |
         Tests  6 passed (6)
      Start at  05:02:27
      Duration  209ms (transform 18ms, setup 0ms, import 30ms, tests 2ms, environment 0ms)

- eval: E6
  run_id: minted-director-wire-shape-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_events_schema_shape
  verified_at: 2026-09-08T05:02:25Z
  output: |
          Tests  24 passed (24)
       Start at  05:02:25
       Duration  117ms (transform 19ms, setup 0ms, import 26ms, tests 4ms, environment 0ms)

- eval: E7
  run_id: minted-director-wire-shape-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_workflow_run_provenance
  verified_at: 2026-09-08T05:02:27Z
  output: |
          Tests  3 passed (3)
       Start at  05:02:27
       Duration  326ms (transform 37ms, setup 0ms, import 238ms, tests 4ms, environment 0ms)

- eval: E8
  run_id: minted-director-wire-shape-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_body_backward_compatible
  verified_at: 2026-09-08T05:02:27Z
  output: |
          Tests  4 passed | 5 skipped (9)
       Start at  05:02:27
       Duration  82ms (transform 13ms, setup 0ms, import 18ms, tests 2ms, environment 0ms)

- eval: E9
  run_id: minted-director-wire-shape-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_body_per_field_caps
  verified_at: 2026-09-08T05:02:28Z
  output: |
          Tests  5 passed | 4 skipped (9)
       Start at  05:02:28
       Duration  76ms (transform 12ms, setup 0ms, import 17ms, tests 2ms, environment 0ms)

- eval: E10
  run_id: minted-director-wire-shape-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_expect_count_unchanged
  verified_at: 2026-09-08T05:02:24Z
  output: |
    OK: 240 expect() in pre-existing tests, unchanged

- eval: E11
  run_id: minted-director-wire-shape-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_migrator_on_old_db
  verified_at: 2026-09-08T05:02:26Z
  output: |
          Tests  1 passed (1)
       Start at  05:02:26
       Duration  96ms (transform 12ms, setup 0ms, import 19ms, tests 11ms, environment 0ms)

- eval: E12
  run_id: minted-director-wire-shape-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_barrel_export
  verified_at: 2026-09-08T05:02:29Z
  output: |
    OK: directorEvents reachable through src/db/schema.ts

- eval: E13
  run_id: minted-director-wire-shape-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_no_prompt_in_prod_log
  verified_at: 2026-09-08T05:02:30Z
  output: |
    OK: prompt text only reaches logger.debug

- eval: E14a
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Bốn file input chỉ chứa baseline-2026-08-26 (đo TRƯỚC gói director-wire-shape, khi bảng director_events còn chưa tồn tại) và frozen-config.json ghim cấu hình plugin — không có bất kỳ số liệu director_events nào để trả lời câu (2), và không có bằng chứng một lần chạy MỚI (fresh run) của run-baseline.mjs sau khi gói D0 đã lên để trả lời câu (1) đúng như đề bài yêu cầu ("chạy... rồi trả lời bằng số"). Con số 26/30 = 86,7% trong evidence là số cũ (đúng bằng mốc EVAL-0, không phải một lần đo mới để so sánh), nên cả hai câu đều thiếu căn cứ trực tiếp trong phạm vi input cho phép.
      required_evidence:
        - Chạy thật `node _acceptance/director-wire-shape/golden/run-baseline.mjs` với thư mục plugins/ trên đĩa khớp đúng danh sách 7 plugin + sha trong golden/frozen-config.json (script tự thoát mã 2 nếu lệch) — đính kèm output JSON mới (successRateWithin2Attempts, ok/total) làm bằng chứng cho câu (1) thay vì tái dùng file baseline-2026-08-26.json cũ.
        - Trước và sau lần chạy trên, truy vấn số row bảng director_events (vd. `SELECT count(*) FROM director_events WHERE kind='generated'` chạy hai lần, hoặc script tự log delta) và đối chiếu phần TĂNG THÊM với đúng số lượt gọi /api/director trong lần chạy đó (30) — hiện tại không file input nào chứa dữ liệu director_events vì baseline được đo trước khi bảng này tồn tại.
    - operational-feasibility: UNCERTAIN — Không có dev server nào đang chạy (không có tiến trình LISTEN ở cổng 3000) và không có cách xác nhận ANTHROPIC_API_KEY/DB sống trong phạm vi judge này, nên không thể chạy thật `node _acceptance/director-wire-shape/golden/run-baseline.mjs` như đề bài yêu cầu — chạy nó lúc backend không sống chỉ tạo ra toàn lỗi kết nối, không phải phép đo thật. Không có kết quả chạy thật thì không có căn cứ để trả lời cả hai câu (tỉ lệ thành công so 86,7% và số row `director_events` tăng thêm có khớp số lượt gọi).
      required_evidence:
        - Chạy `pnpm dev` trong oneflow-b3 với ANTHROPIC_API_KEY hợp lệ, xác nhận plugins/ trên đĩa khớp golden/frozen-config.json (script tự dừng mã 2 nếu lệch), rồi chạy `node _acceptance/director-wire-shape/golden/run-baseline.mjs` (chạy đầy đủ, không --dry) và lấy `successRateWithin2Attempts` từ JSON output — cần >= 86.7% để câu (1) PASS.
        - Đếm số row bảng director_events (kind='generated') ngay TRƯỚC và NGAY SAU lần chạy run-baseline.mjs đó, lấy hiệu (phần tăng thêm) rồi so với đúng số lượt gọi /api/director thực hiện trong lần chạy (30 nếu full run, hoặc ít hơn nếu dùng --resume/--limit) — hai số phải khớp để câu (2) PASS.
    - spec-alignment: UNCERTAIN — Chạy đúng lệnh yêu cầu (`node _acceptance/director-wire-shape/golden/run-baseline.mjs --dry` tại oneflow-b3) và script tự dừng với exit code 2 vì `plugins/` trên đĩa có 0 plugin trong khi `frozen-config.json` ghim 7 plugin — đúng tình huống "bỏ qua TỰ ĐỘNG với mã 2 nếu lệch" mà câu hỏi đã báo trước. Do đó không thu được số đo mới cho cả hai câu (1) tỉ lệ thành công và (2) số row director_events tăng thêm; các input được phép đọc chỉ chứa số đo CŨ (26/08, 86,7%), không chứa kết quả của lần chạy này.
      required_evidence:
        - Chạy lại run-baseline.mjs trong worktree có plugins/ khớp đúng 7 plugin của frozen-config.json (không thoát mã 2), lấy summary.successRateWithin2Attempts từ JSON output mới để so với mốc 86,7%.
        - Đối chiếu số row director_events (kind='generated') TRƯỚC và SAU lần chạy đó — phần tăng thêm phải bằng đúng số lượt gọi /api/director mà script thực hiện.
  human_override: 

- eval: E14b
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Ba file input chỉ chứa E14 gốc (chạy bằng run-baseline.mjs, tức là qua script /api/director, không phải UI) và E14a-style baseline JSON; cả evidence.md lẫn contract.md đều nói rõ E14b (thao tác tay trong UI: mở panel Director, gõ 5 prompt, đi qua đủ ba nhánh accept/confirm/discard) mới chỉ là "đề nghị tách" chứ chưa có bằng chứng đã thực thi. Không có file nào trong phạm vi cho thấy kết quả `SELECT kind, count(*) FROM director_events GROUP BY kind` của một phiên UI thật, nên không thể kết luận PASS hay FAIL cho câu hỏi E14b/AC-5.
      required_evidence:
        - Một file bằng chứng E14b (ví dụ evidence/e14b-<ngày>.md hoặc .json) ghi lại phiên thao tác tay trong UI: mở panel Director, gõ 5 prompt tiếng Việt, và đi qua đủ ba nhánh — canvas rỗng áp dụng ngay, canvas có node bấm xác nhận, canvas có node bấm hủy (Escape/click ra ngoài)
        - Kết quả truy vấn thật `SELECT kind, count(*) FROM director_events GROUP BY kind` chạy SAU phiên UI đó (số liệu thô hoặc ảnh chụp), cho thấy tỉ lệ row còn ở kind='generated' (chưa vá outcome) dưới 10%
        - Xác nhận trong cùng bằng chứng rằng cả ba kind ngoài 'generated' — accepted, replaced, discarded — đều xuất hiện ít nhất một row, gắn với runId cụ thể từ phiên UI (không phải từ các lệnh POST /api/director/feedback gọi tay qua curl như trong e14-2026-08-26.md, vốn không đi qua giao diện thật)
    - operational-feasibility: UNCERTAIN — Ba file được cấp chỉ chứng minh E14 gốc chạy bằng script (run-baseline.mjs gọi thẳng /api/director) và đề xuất tách ra E14b (thao tác tay trong UI, gõ 5 prompt, đi qua cả ba nhánh accept/replace/discard) — "Đề nghị tách khi ký Cổng 1" là một đề xuất, không phải bằng chứng đã thực hiện. Đoạn "đã kiểm bằng tay" trong e14-2026-08-26.md chỉ là 3 lệnh POST /api/director/feedback trực tiếp (không qua UI, không phải 5 prompt tiếng Việt, không đi qua nhánh canvas rỗng/canvas có node), nên không thỏa mãn đúng kịch bản của câu hỏi E14b.
      required_evidence:
        - Ảnh chụp màn hình hoặc log thao tác UI thật cho thấy panel Director được mở, 5 prompt tiếng Việt được gõ, và cả ba nhánh quyết định (canvas rỗng → apply ngay; canvas có node → bấm xác nhận; canvas có node → Escape/bấm ra ngoài để huỷ) đều được đi qua — cần một file evidence mới kiểu _acceptance/director-wire-shape/evidence/e14b-<ngày>.md hoặc .png ghi rõ từng bước
        - Kết quả thật của truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind` chạy NGAY SAU phiên UI đó (không phải sau lần chạy script run-baseline.mjs), kèm số liệu tỉ lệ generated/tổng và xác nhận có mặt cả ba kind accepted, replaced, discarded — hiện chưa có file nào trong scope chứa kết quả truy vấn này gắn với một phiên UI
    - spec-alignment: UNCERTAIN — Cả ba file input chỉ chứa evidence của E14 gốc (script `run-baseline.mjs` + hai POST /api/director/feedback gọi tay ngoài UI) ngày 26/08, cùng với đề xuất tách E14a/E14b — không phải bằng chứng đã CHẠY E14b theo đúng giao thức (trong giao diện, không script, 5 prompt tiếng Việt, đi qua đủ ba nhánh: canvas rỗng / canvas có node+Xác nhận / canvas có node+Huỷ). Không có kết quả truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind` ở đâu trong ba file, và outcome duy nhất được xác nhận thành công là `accepted` (một lần `discarded` bị 409 vì trùng runId, không phải một lượt discard hợp lệ mới) — không thấy `replaced` xuất hiện.
      required_evidence:
        - Một file evidence mới (vd. evidence/e14b-<ngày>.md hoặc .json) ghi lại phiên UI thật: mở panel Director, gõ 5 prompt tiếng Việt, và log/ảnh chụp cho từng lượt cho biết đã đi qua canvas RỖNG (apply ngay), canvas CÓ NODE + bấm Xác nhận, và canvas CÓ NODE + Huỷ (Escape/click ra ngoài)
        - Kết quả thực thi câu lệnh `SELECT kind, count(*) FROM director_events GROUP BY kind` (output bảng hoặc ảnh chụp truy vấn DB) chạy NGAY SAU phiên UI trên, cho thấy số dòng theo từng kind
        - Bằng chứng cụ thể (dòng dữ liệu director_events hoặc log outcome) cho thấy cả accepted, replaced, discarded đều có ít nhất một row — hiện chỉ có accepted được xác nhận, chưa thấy replaced
  human_override: 

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-director-wire-shape-SUITE-bash_scripts_acceptance_preflight_verify-r1
  exit_code: 0
  verified_at: 2026-09-08T05:02:15Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-director-wire-shape-SUITE-node_scripts_roadmap_check_plan_freeze_m-r1
  exit_code: 0
  verified_at: 2026-09-08T05:02:16Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-director-wire-shape-SUITE-build_typecheck-r1
  exit_code: 0
  verified_at: 2026-09-08T05:02:35Z

- cmd: pnpm lint:check
  run_id: minted-director-wire-shape-SUITE-lint_check-r1
  exit_code: 0
  verified_at: 2026-09-08T05:02:40Z

- cmd: pnpm test
  run_id: minted-director-wire-shape-SUITE-test-r1
  exit_code: 0
  verified_at: 2026-09-08T05:02:43Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-director-wire-shape-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r1
  exit_code: 0
  verified_at: 2026-09-08T05:02:58Z

- cmd: pnpm verify:plugins
  run_id: minted-director-wire-shape-SUITE-verify_plugins-r1
  exit_code: 0
  verified_at: 2026-09-08T05:03:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-director-wire-shape-SUITE-gen_abi-r1
  exit_code: 0
  verified_at: 2026-09-08T05:03:02Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-director-wire-shape-SUITE-bash_scripts_fork_check_fork_identity_sh-r1
  exit_code: 0
  verified_at: 2026-09-08T05:03:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — every feature eval carried tu round truoc (khong do baseline moi vong nay)

## Variance

none — không có eval nào mang runs > 1 vòng này; không có eval variance:true.

## Iterations

Round 1: 13/13 eval máy (E1-E13) và toàn bộ lệnh suite hồi quy đều xanh (exit 0), nhưng review-findings.md phát hiện 2 nhóm lỗi có ánh xạ AC ở mức "high"/"medium" — `patchOutcome` là select-then-update (không nguyên tử) nên guarantee một-lần-vá của AC-5 không thực sự được ép buộc, và AC-7 (`directorRunId` mang từ kế hoạch Director sang workflow lưu) không có bất kỳ đường client nào gửi trường này nên luôn NULL. Đồng thời hai eval judgment E14a/E14b vẫn UNCERTAIN ở cả ba lens (domain-correctness, operational-feasibility, spec-alignment) do thiếu bằng chứng chạy mới/thao tác UI thật. Verdict tổng: REJECT — quay lại implementation để vá tính nguyên tử của `patchOutcome` (AC-5) và nối dây `directorRunId` từ client tới `/api/workspace/save` (AC-7) trước khi verify lại.