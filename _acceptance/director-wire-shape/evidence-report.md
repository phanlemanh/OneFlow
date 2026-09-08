---
schema_version: 2
feature_slug: director-wire-shape
verdict: PENDING-JUDGMENT
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8c9a9e028ccb577c315fd9c3cf1e2b7cf44f7fcc
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
  run_id: minted-director-wire-shape-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_wire_returns_plan
  verified_at: 2026-09-08T01:54:40Z
  output: |
    OK: success payload carries planJson, runId, dslVersion

- eval: E2
  run_id: minted-director-wire-shape-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_old_client_unaffected
  verified_at: 2026-09-08T01:54:45Z
  output: |
    OK: name/description/nodes/edges unchanged; new fields are additive

- eval: E3
  run_id: minted-director-wire-shape-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_error_envelope
  verified_at: 2026-09-08T01:55:09Z
  output: |
         Tests  14 passed (14)
      Start at  08:55:09
      Duration  241ms (transform 105ms, setup 0ms, import 168ms, tests 7ms, environment 0ms)

- eval: E4
  run_id: minted-director-wire-shape-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_event_written_server_side
  verified_at: 2026-09-08T01:55:08Z
  output: |
          Tests  3 passed | 4 skipped (7)
       Start at  08:55:08
       Duration  138ms (transform 29ms, setup 0ms, import 59ms, tests 5ms, environment 0ms)

- eval: E5
  run_id: minted-director-wire-shape-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_feedback_state_machine
  verified_at: 2026-09-08T01:55:08Z
  output: |
         Tests  6 passed (6)
        Start at  08:55:08
        Duration  94ms (transform 13ms, setup 0ms, import 19ms, tests 2ms, environment 0ms)

- eval: E6
  run_id: minted-director-wire-shape-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_events_schema_shape
  verified_at: 2026-09-08T01:55:08Z
  output: |
          Tests  24 passed (24)
       Start at  08:55:08
       Duration  94ms (transform 13ms, setup 0ms, import 20ms, tests 3ms, environment 0ms)

- eval: E7
  run_id: minted-director-wire-shape-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_workflow_run_provenance
  verified_at: 2026-09-08T01:55:08Z
  output: |
          Tests  7 passed (7)
       Start at  08:55:08
       Duration  384ms (transform 40ms, setup 0ms, import 257ms, tests 8ms, environment 0ms)

- eval: E8
  run_id: minted-director-wire-shape-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_body_backward_compatible
  verified_at: 2026-09-08T01:55:08Z
  output: |
          Tests  4 passed | 6 skipped (10)
       Start at  08:55:08
       Duration  155ms (transform 58ms, setup 0ms, import 75ms, tests 2ms, environment 0ms)

- eval: E9
  run_id: minted-director-wire-shape-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_body_per_field_caps
  verified_at: 2026-09-08T01:55:09Z
  output: |
          Tests  6 passed | 4 skipped (10)
       Start at  08:55:09
       Duration  89ms (transform 15ms, setup 0ms, import 21ms, tests 2ms, environment 0ms)

- eval: E10
  run_id: minted-director-wire-shape-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_expect_count_unchanged
  verified_at: 2026-09-08T01:54:50Z
  output: |
    OK: 240 expect() in pre-existing tests, unchanged

- eval: E11
  run_id: minted-director-wire-shape-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dws_migrator_on_old_db
  verified_at: 2026-09-08T01:55:08Z
  output: |
         Tests  1 passed (1)
      Start at  08:55:08
      Duration  152ms (transform 29ms, setup 0ms, import 45ms, tests 12ms, environment 0ms)

- eval: E12
  run_id: minted-director-wire-shape-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_barrel_export
  verified_at: 2026-09-08T01:54:55Z
  output: |
    OK: directorEvents reachable through src/db/schema.ts

- eval: E13
  run_id: minted-director-wire-shape-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dws_no_prompt_in_prod_log
  verified_at: 2026-09-08T01:55:00Z
  output: |
    OK: prompt text only reaches logger.debug

- eval: E14a
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment) — proposal UNCERTAIN
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Input list chỉ có 4 file tĩnh từ mốc 26/08 (md, json, frozen-config, contract) — không có `golden/run-baseline.mjs`, không có log của một lần chạy thật hôm nay, và không có bằng chứng đếm row `director_events` trước/sau. Câu hỏi đòi CHẠY script và đọc số incremental của `director_events`, nhưng cả script lẫn output của một lần chạy sống (hoặc query DB) đều ngoài phạm vi input được liệt — nên không có căn cứ để trả lời (1) hay (2) cho lần chạy hiện tại; baseline 26/08 chỉ đúng bằng 86,7% (không phải "≥" một cách tự minh chứng cho hôm nay) và không hề đề cập số row director_events tăng thêm.
    - operational-feasibility: UNCERTAIN — Câu hỏi đòi chạy `run-baseline.mjs` MỚI (tự đối chiếu plugins/ với frozen-config.json, thoát mã 2 nếu lệch) rồi đo tỉ lệ thành công và số row director_events tăng thêm — nhưng script đó, một dev server sống (cần ANTHROPIC_API_KEY), và số đếm director_events hiện tại đều KHÔNG nằm trong danh sách Input được phép đọc của eval này (chỉ có contract.md + hai file baseline 26/08 + frozen-config.json). Bốn file đó chỉ cho biết mốc SO SÁNH (26/30, 86,7%) và cấu hình cần khớp — không phải kết quả của lần chạy hôm nay. Tự chạy lệnh hay tự đọc thêm để tự cứu là phá tính độc lập của hội đồng, nên đây là UNCERTAIN theo đúng quy tắc "danh sách không đủ căn cứ".
    - spec-alignment: UNCERTAIN — Cả bốn file input chỉ chứa EVAL-0 (baseline-2026-08-26.md/json) — mốc đo Director v1 chạy TRƯỚC gói D0, dùng làm điểm so sánh trong contract — và frozen-config.json ghim cấu hình plugin; không file nào trong danh sách là kết quả một lần chạy run-baseline.mjs SAU khi triển khai director-wire-shape, và không file nào chứa số row director_events. Tôi không được phép tự chạy lệnh (chạy nó đòi đọc mã nguồn, biến môi trường, DB sống — toàn bộ ngoài danh sách Input, đúng luật "ngoài danh sách là lý do UNCERTAIN, không phải lý do tự đi tìm file khác"), nên không có căn cứ trả lời (1) hay (2) bằng số.
  rationale: Ba lens đều bỏ phiếu UNCERTAIN vì bốn file input (contract.md + hai file baseline-2026-08-26 + frozen-config.json) chỉ cho biết mốc SO SÁNH 86,7% (26/30) và cấu hình cần khớp, chứ không phải kết quả của một lần chạy run-baseline.mjs SAU khi director-wire-shape lên, và không file nào chứa số đếm director_events trước/sau — nên câu hỏi về phần director_events TĂNG THÊM đúng bằng số lượt gọi không có căn cứ để trả lời trong phạm vi cho phép.
  required_evidence:
    - "[domain-correctness] Log/output thật của lệnh `node _acceptance/director-wire-shape/golden/run-baseline.mjs` chạy trên cấu hình khớp frozen-config.json (kèm exit code, để loại trừ trường hợp thoát mã 2 do lệch cấu hình) — hiện chưa có file nào trong scope chứa việc này."
    - "[domain-correctness] Bằng chứng đếm row bảng `director_events` (query count trước và sau lần chạy, hoặc dump các row có runId mới sinh trong lần chạy đó) để đối chiếu phần TĂNG THÊM với đúng số lượt gọi /api/director trong lần chạy đó — cần truy cập DB/log server, ngoài 4 file input đã cho."
    - "[operational-feasibility] Kết quả chạy thật `node _acceptance/director-wire-shape/golden/run-baseline.mjs` trên cấu hình khớp golden/frozen-config.json (không bị thoát mã 2), lưu thành file evidence mới (vd. _acceptance/director-wire-shape/evidence/eval-run-<ngay>.json) ghi rõ successRateWithin2Attempts của lần chạy này để so với mốc 86,7% ngày 26/08"
    - "[operational-feasibility] Số đếm row bảng director_events (kind='generated') NGAY TRƯỚC và NGAY SAU loạt gọi của lần chạy trên — hai con số count(*) (vd. qua lệnh SQL/script đếm trước-sau) để tính phần TĂNG THÊM và đối chiếu đúng bằng số lượt gọi thực hiện trong run đó, không phải tổng lũy kế"
    - "[spec-alignment] Một file evidence MỚI (ví dụ _acceptance/director-wire-shape/evidence/e14a-<ngày>.md hoặc .json) là kết quả thật của `node golden/run-baseline.mjs` chạy SAU khi gói director-wire-shape (D0) đã triển khai, đối chiếu plugins/ khớp frozen-config.json (thoát mã khác 0 nếu lệch) — phải nêu successRateWithin2Attempts số mới."
    - "[spec-alignment] Trong cùng lần chạy đó, số liệu số row bảng director_events TĂNG THÊM (không phải tổng count(*)) so với trước khi chạy — ví dụ qua truy vấn `SELECT count(*) FROM director_events` chụp trước và sau, hoặc log server đếm insert — đối chiếu đúng bằng số lượt gọi /api/director trong golden set (30 lượt, hoặc số lượt thực chạy nếu dùng --limit/--resume)."
  human_override: 

- eval: E14b
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment) — proposal UNCERTAIN
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — The three files in scope contain only the original combined E14 golden-set script run (which the contract itself says cannot measure the orphan/outcome question) and a manual curl-style check that posted directly to /api/director/feedback — not a UI walkthrough. There is no evidence in scope of anyone opening the Director panel, typing 5 Vietnamese prompts across the three canvas branches (empty/apply, node+confirm, node+cancel), or a `SELECT kind, count(*) FROM director_events GROUP BY kind` result table.
    - operational-feasibility: UNCERTAIN — Ba file input không chứa bằng chứng của phiên UI được câu hỏi mô tả (mở panel Director, gõ 5 prompt, đi qua cả ba nhánh canvas-rỗng/xác-nhận/huỷ) cũng không có kết quả truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind`. e14-2026-08-26.md chỉ ghi ba lệnh POST /api/director/feedback gọi trực tiếp (không qua UI), chỉ chứng minh "accepted" thành công và một lần vá thứ hai bị từ chối (409) — không có "replaced", không có "discarded" thành công, và tự văn bản gọi đây là "Đề nghị tách" E14b cho Cổng 1 kế tiếp chứ không phải bằng chứng đã thực thi. e14-d0-2026-08-26.json chỉ là số liệu script E14a (golden-set qua run-baseline.mjs), không liên quan UI.
    - spec-alignment: UNCERTAIN — Ba file cho phép không chứa kết quả truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind` nào cả — e14-d0-2026-08-26.json chỉ là số liệu golden-set (T1-T4, ok/ms/nodes), không liên quan đến bảng director_events. Bằng chứng "đã kiểm bằng tay" trong e14-2026-08-26.md là gọi thẳng POST /api/director/feedback (accepted→200, discard lần hai→409, outcome sai→400), không phải thao tác TRONG GIAO DIỆN qua panel Director với 5 prompt và ba nhánh canvas-rỗng/canvas-có-node-xác-nhận/canvas-có-node-hủy như câu hỏi yêu cầu; nó cũng không phủ nhánh "replaced". Chính contract.md và evidence.md còn ghi rằng E14b (kiểm UI) là một đề nghị tách ra để ký ở Cổng 1, chưa xác nhận là đã thực thi với số đo cụ thể.
  rationale: Ba lens đều bỏ phiếu UNCERTAIN vì bằng chứng hiện có chỉ là script run-baseline.mjs gọi thẳng /api/director và ba lệnh POST /api/director/feedback thủ công (không qua UI, chỉ ghi được "accepted" thành công, không có "replaced" hay "discarded" thành công) — không có phiên thao tác thật trong panel Director qua 5 prompt và đủ ba nhánh canvas-rỗng/xác-nhận/hủy, và không có kết quả truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind` của một phiên UI thật.
  required_evidence:
    - "[domain-correctness] An E14b evidence artifact (e.g. _acceptance/director-wire-shape/evidence/e14b-*.md or similar) containing the actual output of `SELECT kind, count(*) FROM director_events GROUP BY kind` taken after a real UI session, with the orphan-rate percentage computed from it"
    - "[domain-correctness] Proof the outcome rows were produced through actual Director-panel UI interaction (not direct POST to /api/director/feedback) covering all three decision branches: empty-canvas immediate apply, canvas-with-nodes then Confirm, canvas-with-nodes then Cancel (Escape or click-outside)"
    - "[domain-correctness] A count breakdown showing all three of accepted, replaced, and discarded present as distinct kind rows — the current manual check in e14-2026-08-26.md only ever successfully recorded one 'accepted' row via direct API call; a second POST attempting 'discarded' on the same runId was rejected (409 ALREADY_PATCHED), so no discarded or replaced row was ever actually created or observed"
    - "[operational-feasibility] Kết quả thực tế của truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind` chạy SAU phiên UI (bảng số hoặc ảnh chụp terminal/DB client), cho thấy tỉ lệ row 'generated' chưa vá <10% trên tổng"
    - "[operational-feasibility] Bằng chứng thao tác trong giao diện (ảnh chụp màn hình hoặc screen-recording) cho cả ba nhánh: (1) mở panel Director trên canvas RỖNG và bấm áp dụng ngay, (2) canvas CÓ NODE rồi bấm XÁC NHẬN, (3) canvas CÓ NODE rồi HUỶ bằng Escape hoặc bấm ra ngoài — mỗi nhánh gắn với một trong 5 prompt tiếng Việt đã gõ trực tiếp trong UI, không qua script/API call"
    - "[operational-feasibility] Xác nhận rằng cả bốn kind xuất hiện trong kết quả GROUP BY, đặc biệt 'replaced' — hiện chưa có dòng bằng chứng nào cho outcome 'replaced' được kích hoạt qua UI"
    - "[spec-alignment] Một file evidence riêng cho E14b (vd. _acceptance/director-wire-shape/evidence/e14b-<ngày>.md hoặc ảnh chụp) ghi lại phiên thao tác TRONG GIAO DIỆN: 5 prompt tiếng Việt gõ vào panel Director, đi qua đủ ba nhánh — canvas rỗng (áp dụng ngay), canvas có node + bấm xác nhận, canvas có node + Escape/bấm ra ngoài để huỷ"
    - "[spec-alignment] Kết quả thô của truy vấn `SELECT kind, count(*) FROM director_events GROUP BY kind` chạy SAU phiên UI đó (output SQL hoặc ảnh chụp DB client), kèm số liệu tỉ lệ row `generated` chưa vá / tổng số row, và xác nhận có mặt đủ ba kind `accepted`, `replaced`, `discarded`"
  human_override: 

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-director-wire-shape-SUITE-bash_scripts_acceptance_preflight_verify-r3
  exit_code: 0
  verified_at: 2026-09-08T01:55:15Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-director-wire-shape-SUITE-node_scripts_roadmap_check_plan_freeze_m-r3
  exit_code: 0
  verified_at: 2026-09-08T01:55:17Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-director-wire-shape-SUITE-build_typecheck-r3
  exit_code: 0
  verified_at: 2026-09-08T01:55:19Z

- cmd: pnpm lint:check
  run_id: minted-director-wire-shape-SUITE-lint_check-r3
  exit_code: 0
  verified_at: 2026-09-08T01:55:23Z

- cmd: pnpm test
  run_id: minted-director-wire-shape-SUITE-test-r3
  exit_code: 0
  verified_at: 2026-09-08T01:55:25Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-director-wire-shape-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r3
  exit_code: 0
  verified_at: 2026-09-08T01:55:40Z

- cmd: pnpm verify:plugins
  run_id: minted-director-wire-shape-SUITE-verify_plugins-r3
  exit_code: 0
  verified_at: 2026-09-08T01:55:50Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-director-wire-shape-SUITE-gen_abi-r3
  exit_code: 0
  verified_at: 2026-09-08T01:55:52Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-director-wire-shape-SUITE-bash_scripts_fork_check_fork_identity_sh-r3
  exit_code: 0
  verified_at: 2026-09-08T01:55:55Z

## Known limits

Nợ có tên, ghi theo luật trần vòng verify (vòng 3 khai trước là vòng cuối — CLAUDE.md, owner
duyệt 08/09). Chi tiết từng mục nằm trong `review-findings.md`.

**Trong hợp đồng** — một mục, chi tiết ở mục Amendment của `contract.md`:

- [thấp · AC-4] lượt chạy hỏng ghi sổ dưới `runId` bịa tại chỗ nên không nối được với lượt cụ thể.

**Phép đo tự nó** — bảy mục, tất cả là «phép đo của phép đo», không có mục nào làm sai hành vi
sản phẩm:

- [cao] E4/AC-4 đo LỜI GỌI hàm giả thay vì hàng thật trong sổ.
- [cao] `dws-wire-returns-plan.sh` lọc theo tên ca bằng `vitest -t`; lọc không khớp thì thoát 0, và bộ canh `check-eval-filters.mjs` không thấy được vì lọc nằm trong script chứ không khai ở cấu hình.
- [cao] AC-1 khẳng định CHUỖI NGUỒN có mặt trong khi lời hứa là QUAN HỆ giữa các giá trị.
- [cao] fixture AC-1 viết tay đúng khuôn bên đọc, vòng lặp chỉ là tiếng vọng của hàm giả.
- [cao] AC-9 khẳng định trường nội bộ `error.field` trong khi lời hứa là THÔNG ĐIỆP nêu tên trường.
- [trung bình] AC-7 đo đối số truyền cho bộ dựng truy vấn giả, không đo giá trị cột thật.
- [trung bình, thấp] `dws-no-prompt-in-prod-log` đọc mã nguồn theo từng dòng nên lời gọi nhiều dòng lọt; `dws-barrel-export` khẳng định chuỗi có mặt chứ không phải quan hệ xuất khẩu.

**Bộ đo vàng chạy tay** — ba mục, chỉ ảnh hưởng người chạy lại bộ đo trên máy khác:

- [cao, trung bình] `schema-diff.mjs` và bộ `eval3-*.mjs` ghi cứng đường dẫn tuyệt đối tới một checkout khác.
- [trung bình] `golden/*.mjs` chép tay lược đồ kế hoạch thay vì nhập từ mã thật, và bản chép đã lệch.

**Sổ sự kiện, chất lượng dữ liệu** — hai mục:

- [trung bình] `/api/director/feedback` không bọc lỗi cơ sở dữ liệu nên hỏng sổ thoát ra ngoài phong bì lỗi và không có dòng log nào.
- [trung bình] `used_memory` ghi theo cờ máy khách gửi lên trong khi máy chủ chưa dùng bộ nhớ — cột suy diễn đáng lẽ NULL cho tới khi đo được.

## Ngoài hợp đồng

Bốn mục dưới đây là lỗi THẬT nằm NGOÀI phạm vi đã duyệt ở Cổng 1, đều ở lớp giao diện. Máy KHÔNG
tự sửa (luật phân loại phạm vi). Người quyết ở Cổng 2 — chi tiết và đề xuất trong tin mời cổng:

- [cao] Bước đánh dấu «đang chờ quyết» tiêu mất lượt vá duy nhất: bảng sổ chỉ cho phép rời trạng thái «vừa sinh» đúng một lần, mà máy khách đánh dấu ngay khi hộp thoại mở, nên kết cục thật (thay thế / bỏ) sau đó luôn bị từ chối và bị nuốt lặng. Mọi lượt chạy trên canvas có sẵn nội dung vĩnh viễn nằm ở «đang chờ quyết».
- [cao] Nút xác nhận bắn HAI kết cục cho một cú bấm (thay thế, rồi bỏ) vì nút xác nhận của thư viện hộp thoại đồng thời là nút đóng; hai yêu cầu đua nhau và người đã xác nhận có thể bị ghi là đã bỏ.
- [trung bình] `/api/director/feedback` thiếu bọc lỗi cơ sở dữ liệu (xem Known limits).
- [trung bình] Lọc theo tên ca nằm trong script nên bộ canh ô-đo-chạy-0-ca không nhìn thấy (xem Known limits).

Hai mục đầu là cùng một vùng: đường ghi kết cục từ giao diện. Máy đề xuất mở **một hợp đồng
riêng** cho chúng thay vì nới phạm vi hồ sơ này — gói D0 hứa nền trạng thái phía máy chủ, và
đường ghi kết cục phía giao diện là một lời hứa khác, cần bộ đo giao diện của riêng nó.

## Analyst

carried tu round truoc — baseline khong do lai round nay
không có eval nào — baseline không đo lại vòng này (P2); mọi eval trong bảng trên ghi baseline: n-a.

## Variance

none — no stochastic (runs > 1) evals this round; every eval ran once (runs: 1) and every deterministic eval is uniform (0/1 or 1/1, no flakiness observed).

## Iterations

Round 1: code review flagged AC-7 as having no producer for `directorRunId` — the workflow-save path only persisted it on INSERT, dropped on UPDATE; returned to implementation for wiring.
Round 2: all 13 machine evals (E1-E13) + 9 suite commands PASS, but code review confirms the same AC-7 gap is still present on the UPDATE branch (`src/app/api/workspace/save/route.ts:73`, `src/components/workspace/workflow-title-menu.tsx:160`) — no automated eval targets the update-existing-workflow path, so `failed_evals` stays empty even though AC-7 is not actually satisfied end-to-end; verdict REJECT pending a fix to the UPDATE branch and E14a/E14b remain UNCERTAIN pending fresh evidence.
Round 3: all 13 machine evals (E1-E13) + 9 suite commands PASS on verified_commit 8c9a9e0 — AC-7 provenance coverage expanded 3→7 cases (`src/app/api/workspace/save/provenance.test.ts`), closing the UPDATE-branch gap round 2 flagged. E14a/E14b judge panel re-run fresh, both still UNCERTAIN — same missing-evidence class as round 2 (no fresh `run-baseline.mjs` run + `director_events` count delta for E14a; no real UI-session evidence for E14b). Verdict PENDING-JUDGMENT; this is round 3 of the 4 S4 rounds allowed for a T3 contract.
