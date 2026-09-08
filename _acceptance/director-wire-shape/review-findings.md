## Trong hợp đồng

### Failed runs are logged under a throwaway runId, so the ledger row cannot be correlated with the run
- file: `src/app/api/director/route.ts:65`
- severity: low
- source: conventions
- AC: AC-4

`runId: result.ok ? result.runId : crypto.randomUUID()`. runDirector mints the real run id in src/lib/director/director.server.ts (randomUUID before generateWorkflow) but the failure branch of DirectorResult does not carry it, so the route invents an unrelated UUID for the ledger row. Contract AC-4 (_acceptance/director-wire-shape/contract.md) says the generated row must carry "runId của lượt đó" — for every failed run it carries an id that exists nowhere else, so a failure row can never be joined to logs, to a later feedback patch, or to a retry. The fix is one field: surface runId on the failure branch of DirectorResult the same way `attempts` already is.

Rationale: AC-4 yêu cầu row generated mang đúng "runId của lượt đó"; ở nhánh lỗi, route bỏ runId thật mà runDirector đã sinh và tự tạo một UUID rời rạc, không mang runId của lượt đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Client reports "staged" first, which burns the single-shot patch — the real outcome is never recorded**
  Người dùng thấy gì: Sau khi bạn xác nhận thay thế hoặc bỏ qua kế hoạch AI gợi ý, quyết định thật của bạn không được lưu lại — hệ thống chỉ còn nhớ một trạng thái tạm trước khi bạn quyết định.
  file: `src/components/workspace/director-prompt.tsx`
  severity: high
  Đề xuất: new-contract

- **Confirming the replace dialog emits two outcomes ("replaced" and "discarded") for one click**
  Người dùng thấy gì: Khi bạn bấm xác nhận để thay thế kế hoạch, hệ thống đôi khi ghi nhầm rằng bạn đã bỏ qua kế hoạch đó thay vì chấp nhận nó.
  file: `src/components/workspace/director-prompt.tsx`
  severity: high
  Đề xuất: new-contract

- **POST /api/director/feedback has no try/catch — a DB failure escapes the error envelope as a raw 500**
  Người dùng thấy gì: Nếu việc ghi lại phản hồi gặp trục trặc hệ thống, người dùng có thể thấy một trang lỗi kỹ thuật thô thay vì một thông báo dễ hiểu.
  file: `src/app/api/director/feedback/route.ts`
  severity: medium
  Đề xuất: known-limits

- **Eval guards hide `vitest -t` filters inside shell scripts, evading check-eval-filters.mjs**
  Người dùng thấy gì: Nếu tên bài kiểm tra bị đổi nhầm, công cụ kiểm tra tự động có thể báo 'đạt' dù không thực sự kiểm tra gì, khiến lỗi thật có nguy cơ lọt qua mà không ai hay.
  file: `scripts/acceptance/dws-wire-returns-plan.sh`
  severity: medium
  Đề xuất: known-limits

- **Client reports `staged` first, which burns the single-shot patch slot — the real outcome (`replaced`/`discarded`) can never be recorded**
  Người dùng thấy gì: Sau khi bạn xác nhận thay thế hoặc bỏ qua kế hoạch AI gợi ý, quyết định thật của bạn không được lưu lại — hệ thống chỉ còn nhớ một trạng thái tạm trước khi bạn quyết định.
  file: `src/components/workspace/director-prompt.tsx`
  severity: high
  Đề xuất: new-contract

- **Confirming "replace" fires both `replaced` and `discarded` for the same runId — recorded outcome is a race**
  Người dùng thấy gì: Khi bạn bấm xác nhận để thay thế kế hoạch, hệ thống đôi khi ghi nhầm rằng bạn đã bỏ qua kế hoạch đó thay vì chấp nhận nó.
  file: `src/components/workspace/director-prompt.tsx`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 1 — E4/AC-4 đo LỜI GỌI mock, không bao giờ đo ĐẦU RA (row director_events)**
  Người dùng thấy gì: Phép đo tự động hiện tại không thực sự xác nhận rằng thông tin về lượt tạo kế hoạch được lưu đúng vào cơ sở dữ liệu, nên một lỗi lưu trữ có thể không bị phát hiện.
  file: `src/app/api/director/wire-shape.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — âm-tính-một-mình: `vitest -t "AC-N"` thoát 0 khi chạy 0 ca, output bị nuốt vào /dev/null**
  Người dùng thấy gì: Một số bài kiểm tra tự động có thể báo 'đạt' ngay cả khi không thực sự kiểm tra được gì, nên lỗi thật có nguy cơ lọt qua mà không ai biết.
  file: `scripts/acceptance/dws-wire-returns-plan.sh`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — AC-1 assert CHUỖI NGUỒN có mặt, trong khi lời hứa là QUAN HỆ giữa các giá trị**
  Người dùng thấy gì: Bài kiểm tra tự động hiện chỉ xác nhận có nhắc tới tên trường ở đâu đó trong mã nguồn, chứ chưa xác nhận giá trị thực sự trả về đúng, nên lỗi thật có thể lọt qua.
  file: `scripts/acceptance/dws-wire-returns-plan.sh`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: AC-1 round-trip chỉ là mock echo, writer thật không có assert nào**
  Người dùng thấy gì: Bài kiểm tra hiện dùng dữ liệu giả lập nên chưa thực sự chứng minh rằng kế hoạch do AI tạo ra được truyền đúng tới trình duyệt.
  file: `src/app/api/director/wire-shape.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — AC-9 assert `error.field` (nội bộ, route vứt bỏ) trong khi lời hứa là THÔNG ĐIỆP nêu tên trường**
  Người dùng thấy gì: Bài kiểm tra tự động hiện chưa xác nhận rằng thông báo lỗi hiển thị cho người dùng có thực sự nêu đúng tên trường bị vượt giới hạn.
  file: `src/lib/director/request-body.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 6 — đường dẫn hardcode ROOT: schema-diff.mjs import node_modules của checkout khác, và nuốt lỗi im lặng**
  Người dùng thấy gì: Kịch bản đo thử đối chiếu tham chiếu tới đường dẫn của một máy/checkout khác; khi chạy sai môi trường, nó có thể âm thầm bỏ qua phần so sánh quan trọng mà không báo lỗi cho người vận hành.
  file: `_acceptance/director-wire-shape/golden/schema-diff.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 6 — đường dẫn hardcode ROOT: bộ eval3-*.mjs và oneof-vs-anyof.mjs đọc .env + node_modules của cây khác**
  Người dùng thấy gì: Một số kịch bản đo thử đọc cấu hình và thư viện từ máy/checkout khác, nên kết quả đo có nguy cơ không phản ánh đúng mã đang được xét duyệt.
  file: `_acceptance/director-wire-shape/golden/eval3-direct-3providers.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — golden/*.mjs chép tay DirectorPlanSchema thay vì import schema thật, và bản chép đã lệch**
  Người dùng thấy gì: Các kịch bản đo thử chép tay lại định dạng dữ liệu thay vì dùng định dạng thật đang chạy, nên khi định dạng thật thay đổi, phép đo có thể không phát hiện ra.
  file: `_acceptance/director-wire-shape/golden/oneof-vs-anyof.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — AC-7 đo đối số truyền vào query-builder giả, không đo giá trị cột**
  Người dùng thấy gì: Bài kiểm tra hiện dùng cơ sở dữ liệu giả lập nên chưa thực sự xác nhận rằng liên kết giữa workflow đã lưu và lượt tạo kế hoạch được ghi đúng.
  file: `src/app/api/workspace/save/provenance.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — dws-no-prompt-in-prod-log đo VĂN BẢN NGUỒN theo từng dòng, lời gọi logger nhiều dòng lọt lưới**
  Người dùng thấy gì: Công cụ kiểm tra rằng nội dung nhắc nhở của bạn không lọt vào nhật ký hệ thống có thể bỏ sót một số cách viết mã, nên rủi ro rò rỉ chưa được loại trừ hoàn toàn.
  file: `scripts/acceptance/dws-no-prompt-in-prod-log.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — dws-barrel-export assert SUBSTRING có mặt, không phải quan hệ export**
  Người dùng thấy gì: Công cụ kiểm tra việc chia sẻ bảng dữ liệu mới hiện chỉ tìm một chuỗi ký tự trong mã nguồn, kể cả khi chuỗi đó nằm trong một dòng chú thích không có tác dụng thực sự.
  file: `scripts/acceptance/dws-barrel-export.sh`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 8/18 lỗi rơi vào file không bộ đo nào phủ (scripts/acceptance/dws-wire-returns-plan.sh, _acceptance/director-wire-shape/golden/schema-diff.mjs, _acceptance/director-wire-shape/golden/eval3-direct-3providers.mjs, _acceptance/director-wire-shape/golden/oneof-vs-anyof.mjs, scripts/acceptance/dws-no-prompt-in-prod-log.sh, scripts/acceptance/dws-barrel-export.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
