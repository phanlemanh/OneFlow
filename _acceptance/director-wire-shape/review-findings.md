## Trong hợp đồng

- **`patchOutcome` is select-then-update, not a conditional UPDATE — the single-shot invariant it advertises as a security property is not enforced**
  file: `src/lib/director/events/director-events.server.ts:68`
  severity: high
  AC: AC-5
  detail: The doc comment on `decidePatch` says the single-shot rule is what keeps counts "measured rather than attacker-chosen" on an unauthenticated endpoint. But `patchOutcome` reads `kind` (line 68), awaits, then unconditionally `UPDATE ... WHERE id = ?` (line 81). Two concurrent POSTs for the same runId (which the client itself produces, see the replaced+discarded double-fire) both observe `generated` at the await boundary and both write; the last writer wins and the recorded outcome is whichever request landed second. The invariant needs to live in the statement: `UPDATE director_events SET kind = ? WHERE run_id = ? AND kind = 'generated'` and map `changes === 0` to ALREADY_PATCHED (after distinguishing UNKNOWN_RUN).
  rationale: AC-5 requires a run be patched exactly once with any second patch rejected; the select-then-update race lets two concurrent requests for the same runId both observe the pre-patch state and both write, so the one-patch guarantee AC-5 promises is not actually enforced.

- **AC-7 provenance has no producer: nothing in the client ever sends `directorRunId`, so `workflows.director_run_id` is always NULL**
  file: `src/app/api/workspace/save/route.ts:20`
  severity: medium
  AC: AC-7
  detail: The save route accepts `directorRunId` and persists it, and provenance.test.ts covers the route in isolation. But `SaveWorkflowRequest` in src/lib/api/workspace.ts has no such field, neither caller (`workflow-title-menu.tsx:161`, `use-workflow-execution.ts:423`) passes it, and `apply()` in director-prompt.tsx discards `runId` after applying the graph — the flow store never holds it. Contract AC-7 ("workflow lưu từ kế hoạch Director sinh ra ... directorRunId mang runId") is therefore not met end-to-end; only the server half of the wire exists. Either wire the client (store runId in useFlow on apply, extend SaveWorkflowRequest, send it on save) or narrow AC-7 in the contract to the server-side column.
  rationale: AC-7 explicitly requires that a workflow saved from a Director-generated plan carries directorRunId equal to that run's id; no client path ever sends the field, so the requirement is unmet end-to-end.

- **`patchOutcome` select-then-update is not atomic; the single-shot anti-replay rule can be bypassed by concurrent POSTs**
  file: `src/lib/director/events/director-events.server.ts:67`
  severity: medium
  AC: AC-5
  detail: Lines 67-84 read the row, decide in JS, then `UPDATE ... WHERE id = ?` with no `kind='generated'` predicate. Two concurrent `/api/director/feedback` requests for the same runId (which the UI itself produces — see the replaced+discarded finding — and which the file's own comment calls an unauthenticated attacker surface) can both observe `generated` at their `await` points and both write, so the final kind is whichever UPDATE lands last, not the first outcome. Fix: `UPDATE director_events SET kind=? WHERE run_id=? AND kind='generated'` and derive ALREADY_PATCHED from `changes === 0`.
  rationale: Duplicate of the atomicity finding above: AC-5's one-patch/second-rejected guarantee is not actually enforced by a select-then-update, since concurrent requests can race past the check.

- **AC-7 provenance is never populated: no client sends `directorRunId` to /api/workspace/save**
  file: `src/app/api/workspace/save/route.ts:92`
  severity: medium
  AC: AC-7
  detail: The route accepts and stores `directorRunId` (lines 20, 92-95), but `grep -rn directorRunId src` outside tests hits only this route and the schema. `SaveWorkflowRequest` (src/lib/api/workspace.ts) has no such field and neither caller — src/components/workspace/workflow-title-menu.tsx:161 nor src/hooks/use-workflow-execution.ts:423 — passes it; `director-prompt.tsx` never stashes `runId` in the flow store after `apply`. Every workflow saved from a Director plan therefore gets NULL, indistinguishable from a hand-built graph, and the workflows→director_events join the schema comment promises resolves to nothing. provenance.test.ts only exercises the route, so this passes green.
  rationale: Duplicate of the AC-7 finding above: the contract explicitly requires directorRunId to be populated end-to-end for a workflow saved from a Director plan, and no client caller ever sends it.

- **`canvas` size cap counts UTF-16 code units, not bytes as the message and constant claim**
  file: `src/lib/director/request-body.ts:118`
  severity: low
  AC: AC-9
  detail: `JSON.stringify(canvas).length > MAX_CANVAS_BYTES` (line 118) compares string length; the rejection says 'at most 32000 bytes' and the constant is documented as 'total serialized bytes'. A canvas with non-ASCII literals (Vietnamese prompts are the norm here) can be up to ~3x the stated byte cap before rejection. Use `new TextEncoder().encode(...).byteLength` or `Buffer.byteLength` if the cap is meant in bytes.
  rationale: AC-9 explicitly requires the per-field cap on canvas to be measured in total bytes; measuring UTF-16 string length instead means the byte cap AC-9 specifies is not what's actually enforced.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Client reports `staged` then `replaced`/`discarded`, but the state machine rejects any patch out of a non-`generated` row — replace/discard outcomes can never be recorded**
  Người dùng thấy gì: Khi người dùng chọn Thay thế hoặc Bỏ qua sau khi xem kế hoạch Director đề xuất, lựa chọn đó hiện không được hệ thống ghi nhận — quyết định cuối cùng của người dùng có thể bị mất khỏi nhật ký.
  file: `src/components/workspace/director-prompt.tsx`
  severity: high
  Đề xuất: new-contract

- **`options.useMemory` is written to the ledger without being validated as a boolean — any truthy JSON value becomes `used_memory = 1`**
  Người dùng thấy gì: Một giá trị bật/tắt trí nhớ không đúng định dạng trong yêu cầu có thể khiến hệ thống ghi nhầm là 'đã dùng trí nhớ', làm sai lệch số liệu theo dõi tính năng này sau này.
  file: `src/lib/director/request-body.ts`
  severity: medium
  Đề xuất: known-limits

- **`/api/director/feedback` does not catch a thrown `patchOutcome`, so a DB failure surfaces as an envelope-less Next.js 500 instead of the `{error:{code,message}}` shape the Director routes commit to**
  Người dùng thấy gì: Nếu việc ghi nhận phản hồi của người dùng gặp sự cố kỹ thuật, hệ thống có thể trả về một lỗi chung chung khó chẩn đoán thay vì thông báo rõ ràng — ảnh hưởng thấp vì giao diện hiện không hiển thị phản hồi này cho người dùng.
  file: `src/app/api/director/feedback/route.ts`
  severity: low
  Đề xuất: known-limits

- **`staged` closes the run, so `replaced`/`discarded` are always rejected (409) and silently dropped**
  Người dùng thấy gì: Sau khi kế hoạch được hiển thị lần đầu, các lựa chọn Thay thế/Bỏ qua sau đó của người dùng không được ghi nhận vào hệ thống — nhật ký quyết định của người dùng bị thiếu, ảnh hưởng đến việc cá nhân hoá về sau.
  file: `src/components/workspace/director-prompt.tsx`
  severity: high
  Đề xuất: new-contract

- **Confirm button fires `replaced` then `discarded` for the same runId (Radix Action = DialogClose)**
  Người dùng thấy gì: Bấm nút Thay thế có nguy cơ bị ghi đè thành Bỏ qua ngay sau đó do cách nút xác nhận hoạt động, khiến một kế hoạch người dùng đã chấp nhận có thể bị ghi nhận sai là đã bị huỷ.
  file: `src/components/workspace/director-prompt.tsx`
  severity: high
  Đề xuất: known-limits

- **Last-attempt PlanValidationError failure omits `attempts` although 2 model round-trips were consumed**
  Người dùng thấy gì: Khi Director thử sinh kế hoạch nhiều lần rồi vẫn thất bại ở lần cuối, số lần thử thực tế không được lưu lại, làm sai lệch số liệu đo hiệu quả của tính năng sau này.
  file: `src/lib/director/director-core.ts`
  severity: medium
  Đề xuất: known-limits

- **`accepted`/`replaced` reported even when `apply()` failed and the canvas was left untouched**
  Người dùng thấy gì: Nếu việc áp dụng kế hoạch vào canvas thất bại, hệ thống vẫn có thể ghi nhận là người dùng đã chấp nhận/thay thế kế hoạch đó — số liệu không phản ánh đúng những gì người dùng thực sự nhận được.
  file: `src/components/workspace/director-prompt.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — E4 đo lời GỌI recordGenerated (mock) thay vì ROW director_events; nửa SUPPRESSION abort vắng mặt**
  Người dùng thấy gì: Phép kiểm tự động cho việc ghi nhận mỗi lượt dùng Director có thể báo 'đạt' ngay cả khi việc ghi dữ liệu thật sự bị lỗi, nên một sự cố thật ở khâu này có nguy cơ không bị phát hiện sớm.
  file: `src/app/api/director/wire-shape.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 — E5 đo hàm quyết định thuần decidePatch, không đo endpoint/row mà expected hứa**
  Người dùng thấy gì: Bộ kiểm tra cho quy tắc chuyển trạng thái phản hồi (staged/accepted/replaced/discarded) mới chỉ kiểm tra logic trên giấy, chưa từng kiểm tra hành vi thật của máy chủ và cơ sở dữ liệu — một lỗi ở khâu ghi dữ liệu thật có thể lọt qua.
  file: `src/lib/director/events/director-events.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — "exactly the four outcomes" nhưng ma trận lấy từ chính OUTCOME_KINDS, không có danh sách viết-trước hay assert đếm**
  Người dùng thấy gì: Bài kiểm tra khẳng định có đúng bốn loại phản hồi hợp lệ nhưng lại tự lấy danh sách đó từ chính mã đang được kiểm tra, nên nếu danh sách bị thu hẹp sai ai đó cũng sẽ không được cảnh báo.
  file: `src/lib/director/events/director-events.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — E11 tự viết bộ áp migration (readdir + split breakpoint) thay vì chạy migrator drizzle thật đọc _journal.json**
  Người dùng thấy gì: Phép kiểm tra khả năng nâng cấp an toàn cho cơ sở dữ liệu cũ dùng một bộ áp thay đổi tự viết riêng thay vì công cụ nâng cấp thật của hệ thống, nên chưa chắc phản ánh đúng những gì sẽ xảy ra khi người dùng thật nâng cấp.
  file: `src/db/migrate-old-db.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 — các probe EVAL-2/EVAL-3 hardcode /Users/manh-macmini/dev/oneflow/.env và node_modules của tác giả**
  Người dùng thấy gì: Một số kịch bản kiểm tra thủ công dùng đường dẫn riêng của máy người viết, nên chạy trên máy khác có thể cho kết quả không phản ánh đúng thực tế đang kiểm tra.
  file: `_acceptance/director-wire-shape/golden/eval3-direct-3providers.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — schema-diff.mjs và eval3-*.mjs chép tay DirectorPlanSchema thay vì import từ src/lib/director/dsl.ts**
  Người dùng thấy gì: Một số kịch bản kiểm tra chép tay lại định nghĩa dữ liệu thay vì lấy trực tiếp từ mã nguồn chính, nên khi mã nguồn chính thay đổi, các kịch bản này có thể không phát hiện ra và báo sai kết quả.
  file: `_acceptance/director-wire-shape/golden/schema-diff.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — E12 grep chuỗi "directorEvents" bất kỳ đâu trong schema.ts thay vì quan hệ "được export qua barrel"**
  Người dùng thấy gì: Phép kiểm tra bảng dữ liệu mới có được khai báo đúng cách chỉ tìm một chuỗi ký tự bất kỳ trong tệp, nên có thể báo đạt dù bảng chưa thực sự được khai báo đúng cách.
  file: `scripts/acceptance/dws-barrel-export.sh`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — E13 regex một-dòng `logger.(warn|error|info)\([^)]*\bprompt\b` không bắt được lời gọi logger nhiều dòng đang có trong chính file bị đo**
  Người dùng thấy gì: Phép kiểm tra đảm bảo nội dung người dùng nhập không lọt vào nhật ký hệ thống có một điểm mù kỹ thuật với các lời gọi ghi log viết trên nhiều dòng, nên một rò rỉ thực tế theo kiểu đó có nguy cơ không bị phát hiện.
  file: `scripts/acceptance/dws-no-prompt-in-prod-log.sh`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/20 lỗi rơi vào file không bộ đo nào phủ (_acceptance/director-wire-shape/golden/eval3-direct-3providers.mjs, _acceptance/director-wire-shape/golden/schema-diff.mjs, scripts/acceptance/dws-barrel-export.sh, scripts/acceptance/dws-no-prompt-in-prod-log.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.