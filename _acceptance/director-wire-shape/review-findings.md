# Review Findings — director-wire-shape (round 2)

## Trong hợp đồng

- **AC-7 provenance is only persisted on INSERT — the update path (existing workflowId) drops `directorRunId`**
  file: `src/components/workspace/workflow-title-menu.tsx:160`
  severity: medium
  source: conventions
  AC: AC-7
  When a workflow is already loaded (`workflowId` set) and the user runs Director and confirms Replace, `apply()` sets `directorRunId` in the store but the next save goes through `updateWorkflow(workflowId, ...)` -> `PUT /api/workspace/[id]`, whose body type and `updateData` (src/app/api/workspace/[id]/route.ts:69-94) have no `directorRunId`; the `if (workflowId)` UPDATE branch of `POST /api/workspace/save` (src/app/api/workspace/save/route.ts:53-84) also never sets it. Only the INSERT branch (line 92-95) writes the column, and `provenance.test.ts` covers only that branch. Contract AC-7 says a workflow saved from a Director plan carries that run's id; for the replace-into-existing-workflow branch the column stays NULL (or keeps a stale earlier run id). The S4 round-1 review already flagged AC-7 as having no producer; the fix wired only the insert path.

- **directorRunId is dropped on every UPDATE path — provenance lost whenever the workflow already has an id**
  file: `src/app/api/workspace/save/route.ts:73`
  severity: high
  source: bugs
  AC: AC-7
  Only the INSERT branch (line ~92) writes `directorRunId`; the UPDATE branch at line 73 `.set({name, description, flow, executable, updatedAt})` ignores it, and `PUT /api/workspace/[id]` (src/app/api/workspace/[id]/route.ts:69-98, the endpoint `updateWorkflow` calls) neither reads nor sets it. Both client save paths send it (workflow-title-menu.tsx:156 via `updateWorkflow` when `workflowId && !isSaveAsMode`; use-workflow-execution.ts:424 via `saveWorkflow({workflowId, ...provenanceFields})`). Concrete failure: user opens a saved workflow (workflowId set), runs Director, confirms Replace -> `apply()` sets `directorRunId` but never touches `workflowId` -> Save -> server discards the id -> `workflows.director_run_id` stays NULL (or keeps a STALE id from an earlier Director save, since `provenanceFields(null)` sends nothing and nothing ever clears the column). Then `setWorkflowId(result.workflowId)` (title-menu:166, execution:433) wipes the in-memory copy, so the provenance is gone permanently. This is exactly the `canvas_was_empty=false` edit-existing case AC-7 exists to make answerable; provenance.test.ts only covers the insert path so it stays green.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Replace click reports both `replaced` and `discarded`; the two fire-and-forget POSTs race and `discarded` can win**
  Người dùng thấy gì: Khi bạn bấm Thay thế để áp dụng kế hoạch mới, hệ thống đôi khi lại ghi nhận nhầm thành bạn đã bỏ kế hoạch đó, làm sai số liệu dùng để cải thiện tính năng sau này.
  file: `src/components/workspace/director-prompt.tsx`
  severity: high
  Đề xuất: known-limits

- **`used_memory` is written from a client-supplied, unvalidated flag the server never consumes — violates the table's own 'NULL until measured' rule**
  Người dùng thấy gì: Một cờ nội bộ ghi lại việc có dùng trí nhớ cá nhân hay không có thể bị ghi sai giá trị do dữ liệu gửi lên không được kiểm tra — nhưng tính năng trí nhớ cá nhân này chưa được bật cho người dùng nên chưa gây ảnh hưởng thực tế.
  file: `src/app/api/director/route.ts`
  severity: medium
  Đề xuất: known-limits

- **Feedback route does not wrap DB access in try/catch — a ledger failure escapes as a bare 500 instead of the route's error envelope**
  Người dùng thấy gì: Nếu việc ghi nhận bạn đã chấp nhận hay bỏ một kế hoạch gặp trục trặc hệ thống, bạn có thể thấy một lỗi chung chung khó hiểu thay vì thông báo rõ ràng.
  file: `src/app/api/director/feedback/route.ts`
  severity: medium
  Đề xuất: known-limits

- **`director_events.workflow_id` lacks the FK-with-set-null the sibling tables use for the same column**
  Người dùng thấy gì: Nếu một workflow bị xoá sau này, một số bản ghi lịch sử nội bộ của Director có thể vẫn trỏ tới workflow không còn tồn tại — chỉ ảnh hưởng việc dọn dẹp dữ liệu về sau, không ảnh hưởng bạn ngay bây giờ.
  file: `src/db/workspace.schema.ts`
  severity: low
  Đề xuất: known-limits

- **`staged` closes the run, so `replaced` / `discarded` from the UI are always rejected with 409 and silently dropped**
  Người dùng thấy gì: Trong một số luồng sử dụng, việc bạn chọn 'Thay thế' hoặc 'Bỏ' một kế hoạch gợi ý có thể không được ghi nhận đúng, làm mất tín hiệu phản hồi thật dùng để cải thiện tính năng sau này.
  file: `src/components/workspace/director-prompt.tsx`
  severity: high
  Đề xuất: known-limits

- **Confirm button fires `replaced` then `discarded` for the same runId (Radix AlertDialog.Action is a DialogClose)**
  Người dùng thấy gì: Khi bạn xác nhận Thay thế kế hoạch, hệ thống có thể ghi đè lại thành bạn đã bỏ kế hoạch đó ngay sau đó, làm sai lệch số liệu theo dõi hành vi người dùng.
  file: `src/components/workspace/director-prompt.tsx`
  severity: high
  Đề xuất: known-limits

- **Last-attempt PlanValidationError failure omits `attempts` although MAX_ATTEMPTS round-trips were consumed**
  Người dùng thấy gì: Khi Director phải thử sinh kế hoạch nhiều lần trước khi thất bại hẳn, số lần thử thực tế có thể không được ghi lại đúng — đây là số liệu nội bộ để cải thiện chất lượng sau này, không ảnh hưởng đến những gì bạn thấy trên màn hình.
  file: `src/lib/director/director-core.ts`
  severity: medium
  Đề xuất: known-limits

- **`accepted` / `replaced` are reported even when `apply()` failed and left the canvas untouched**
  Người dùng thấy gì: Nếu việc áp dụng một kế hoạch gợi ý vào bản vẽ bị lỗi, hệ thống vẫn có thể ghi nhận là bạn đã chấp nhận kế hoạch đó dù thực tế không có gì thay đổi trên màn hình.
  file: `src/components/workspace/director-prompt.tsx`
  severity: medium
  Đề xuất: known-limits

- **`options.useMemory` is written to the ledger unvalidated — any truthy JSON value becomes used_memory = 1**
  Người dùng thấy gì: Một tuỳ chọn liên quan tới cá nhân hoá (chưa bật cho người dùng) có thể bị ghi sai giá trị nếu dữ liệu gửi lên không đúng định dạng — hiện chưa ảnh hưởng vì tính năng đó chưa hoạt động.
  file: `src/lib/director/request-body.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 — đường dẫn hardcode ROOT: schema-diff.mjs import từ /Users/manh-macmini/dev/oneflow/node_modules**
  Người dùng thấy gì: Một kịch bản đo lường nội bộ dùng đường dẫn cứng trên máy của một người; chạy lại trên máy khác có thể cho kết quả không phản ánh đúng mã đang kiểm tra — chỉ ảnh hưởng độ tin cậy của báo cáo nội bộ, không ảnh hưởng đến bạn.
  file: `_acceptance/director-wire-shape/golden/schema-diff.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 6 — đường dẫn hardcode ROOT: bộ eval3-*.mjs và oneof-vs-anyof.mjs đọc .env và node_modules của checkout tác giả**
  Người dùng thấy gì: Nhiều kịch bản đo lường nội bộ dùng đường dẫn cứng của một máy cụ thể; chạy lại ở nơi khác có thể đo nhầm khoá và thư viện của máy đó — chỉ ảnh hưởng độ tin cậy của báo cáo kiểm thử nội bộ, không ảnh hưởng đến bạn.
  file: `_acceptance/director-wire-shape/golden/eval3-direct-3providers.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — âm-tính-một-mình: `vitest -t "AC-1"` / `-t "AC-2"` trong script thoát 0 khi không khớp ca nào, không có đối chứng số ca đã chạy**
  Người dùng thấy gì: Một kịch bản kiểm tra tự động có thể báo 'đạt' ngay cả khi không thực sự chạy được ca kiểm tra nào bên trong, khiến đội ngũ tưởng nhầm là đã xác minh kỹ hơn thực tế — không ảnh hưởng đến trải nghiệm của bạn.
  file: `scripts/acceptance/dws-wire-returns-plan.sh`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 — E4 đo LỜI GỌI mock thay vì ROW: recordGenerated không bao giờ chạy trên DB trong bất kỳ test nào**
  Người dùng thấy gì: Bộ kiểm tra tự động cho việc mỗi lượt dùng Director ghi đúng một bản ghi lịch sử hiện chỉ kiểm tra lệnh gọi giả lập chứ chưa kiểm tra dữ liệu thật trong cơ sở dữ liệu, nên một lỗi ghi dữ liệu thật có thể lọt qua mà không bị phát hiện.
  file: `src/app/api/director/wire-shape.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — AC-9 assert `error.field` (nội bộ) trong khi lời hứa là THÔNG ĐIỆP nêu tên trường, và route bỏ rơi `field`**
  Người dùng thấy gì: Bộ kiểm tra hiện chưa đảm bảo chắc chắn rằng thông báo lỗi gửi tới bạn sẽ luôn nêu đúng tên trường vượt giới hạn nếu mã nguồn thay đổi sau này; hiện tại thông báo vẫn đúng, nhưng rủi ro này chưa được chặn tự động.
  file: `src/lib/director/request-body.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 — dws-no-prompt-in-prod-log đo VĂN BẢN NGUỒN theo dòng: logger.warn nhiều dòng (kiểu nhà đang dùng) chở `prompt` thoát lưới**
  Người dùng thấy gì: Công cụ tự động rà soát để đảm bảo nội dung bạn nhập không lọt vào nhật ký hệ thống có một điểm mù với một số cách viết code nhiều dòng; hiện tại chưa bị lộ, nhưng rủi ro này chưa được chặn hoàn toàn tự động.
  file: `scripts/acceptance/dws-no-prompt-in-prod-log.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — AC-7 assert chuỗi mình tự gửi quay lại, không đo quan hệ runId-của-Director → workflows.director_run_id**
  Người dùng thấy gì: Bộ kiểm tra tự động cho việc lưu đúng nguồn gốc kế hoạch Director hiện chưa kiểm tra toàn bộ đường đi thực tế của dữ liệu, nên có thể bỏ sót các lỗi tương tự lỗi đã được phát hiện ở nơi khác trong hệ thống.
  file: `src/app/api/workspace/save/provenance.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — dws-barrel-export assert substring `directorEvents` có mặt, không phải quan hệ `export … from`**
  Người dùng thấy gì: Công cụ tự động kiểm tra bảng dữ liệu mới có được khai báo đúng cách hiện chỉ tìm tên bảng xuất hiện ở đâu đó trong file, nên có thể báo đạt ngay cả khi việc khai báo thực tế chưa đúng — rủi ro nội bộ, không ảnh hưởng đến bạn ngay.
  file: `scripts/acceptance/dws-barrel-export.sh`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/19 lỗi rơi vào file không bộ đo nào phủ (_acceptance/director-wire-shape/golden/schema-diff.mjs, _acceptance/director-wire-shape/golden/eval3-direct-3providers.mjs, scripts/acceptance/dws-wire-returns-plan.sh, scripts/acceptance/dws-no-prompt-in-prod-log.sh, scripts/acceptance/dws-barrel-export.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.