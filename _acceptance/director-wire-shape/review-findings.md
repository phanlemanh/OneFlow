## Trong hợp đồng

### Lỗi canvas/turns/options trả về code INVALID_PROMPT; trường `field` được tính rồi vứt đi
- file: `src/app/api/director/route.ts:55`
- severity: low
- source: bugs
- AC: AC-9

`parseDirectorBody` (src/lib/director/request-body.ts) cẩn thận trả `BodyRejection = { field, message }` với comment "names the offending field (AC-9)", nhưng route làm `if (!parsed.ok) return invalidPrompt(parsed.error.message);` — chỉ lấy `message`, còn `field` không bao giờ rời khỏi server, và mọi lỗi đều mang code `INVALID_PROMPT`.

Client (`director-prompt.tsx:174`) dịch code sang i18n: `t(\`errors.${code}\`)`. Vậy một canvas vượt 32KB hay `turns` sai kiểu sẽ hiện cho người dùng đúng thông báo "prompt không hợp lệ". Hôm nay client chưa gửi canvas/turns nên chưa lộ, nhưng đó chính là hợp đồng mà `director-transport-open` sẽ dựa vào.

Rationale phân loại: AC-9 yêu cầu khi từ chối do vượt trần phải "nêu đúng tên trường vượt hạn"; finding cho thấy trường field được tính ra nhưng bị vứt bỏ trước khi tới client, nên tên trường không bao giờ được nêu — vi phạm trực tiếp câu chữ của AC-9.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **New name-filtered evals break the eval-filter guard-of-the-guard (hardcoded 33)**
  Người dùng thấy gì: Đây chỉ ảnh hưởng một công cụ kiểm tra nội bộ mà kỹ sư dùng khi rà soát độ phủ test — không thay đổi bất cứ điều gì người dùng thấy hay làm trên sản phẩm.
  file: `scripts/ci/check-eval-filters-teeth.sh`
  severity: high
  Đề xuất: known-limits

- **Failed Director runs are written with a throwaway runId and kind='generated', never 'failed'**
  Người dùng thấy gì: Khi một lượt yêu cầu tới Director bị lỗi, hệ thống vẫn ghi lại rằng có lỗi xảy ra, nhưng đôi khi không lần ngược được chính xác về yêu cầu cụ thể đó — điều này chỉ ảnh hưởng công cụ chẩn đoán nội bộ, không phải thứ người dùng nhìn thấy.
  file: `src/app/api/director/route.ts`
  severity: medium
  Đề xuất: known-limits

- **parseDirectorBody casts unvalidated `options` / `turns` shapes that flow into the DB**
  Người dùng thấy gì: Nếu một yêu cầu gửi dữ liệu sai định dạng, giá trị sai có thể bị âm thầm lưu vào bản ghi thống kê nội bộ mà hệ thống không phát hiện ra.
  file: `src/lib/director/request-body.ts`
  severity: medium
  Đề xuất: known-limits

- **Hai guard mới giấu `vitest -t` trong shell script — xanh vĩnh viễn khi describe bị đổi tên**
  Người dùng thấy gì: Đây là vấn đề về mức độ chắc chắn của các bài kiểm tra nội bộ chứng minh tính năng hoạt động đúng — không làm thay đổi hành vi mà người dùng trải nghiệm.
  file: `scripts/acceptance/dws-wire-returns-plan.sh`
  severity: high
  Đề xuất: known-limits

- **`attempts` bị rơi ở nhánh PlanValidationError lần cuối — ledger ghi NULL cho run đã tốn 2 round-trip**
  Người dùng thấy gì: Khi việc sinh kế hoạch của trợ lý thất bại ở lần thử cuối cùng, bản ghi nội bộ về số lần đã thử bị bỏ trống thay vì ghi đúng số — điều này chỉ ảnh hưởng số liệu thống kê nội bộ, không ảnh hưởng phản hồi người dùng nhận được.
  file: `src/lib/director/director-core.ts`
  severity: medium
  Đề xuất: known-limits

- **Outcome vẫn được báo `replaced`/`accepted` khi apply() thất bại và nuốt lỗi**
  Người dùng thấy gì: Nếu việc áp kế hoạch vừa tạo lên khung vẽ thất bại ở bên trong, hệ thống vẫn có thể ghi nhận là đã áp dụng thành công — người dùng thấy thông báo lỗi, nhưng bản ghi nội bộ lại không phản ánh đúng lỗi đó.
  file: `src/components/workspace/director-prompt.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 — đường dẫn hardcode ROOT: 6 script đo đọc .env và node_modules của checkout KHÁC**
  Người dùng thấy gì: Một số script chạy tay dùng để đối chiếu thủ công với các nhà cung cấp AI khác nhau chỉ chạy đúng trên máy của người viết ra chúng — điều này không ảnh hưởng tới sản phẩm đã triển khai.
  file: `_acceptance/director-wire-shape/golden/eval3-direct-3providers.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — đếm chuỗi `expect(` thay cho quan hệ "assertion cũ không đổi"; guard in XANH ngay trên diff đã sửa file cũ**
  Người dùng thấy gì: Công cụ tự động dùng để chứng minh các bài test cũ không bị đụng vào chỉ đếm số lượng assertion, nên có thể bỏ sót việc sửa nội dung file test cũ miễn tổng số không đổi — đây là lỗ hổng của công cụ kiểm tra nội bộ, không phải thay đổi hành vi ứng dụng.
  file: `scripts/acceptance/dws-expect-count.sh`
  severity: high
  Đề xuất: known-limits

- **Ô E16 tuyên 4 nhánh quyết định nhưng bộ lọc `-t` chỉ chạy 3 — nhánh 'accepted' bị skip**
  Người dùng thấy gì: Một trong bốn tình huống mà bài kiểm tra nội bộ này tuyên bố có kiểm (trường hợp canvas rỗng tự động áp dụng) thực ra bị bỏ qua, nên một lỗi ở đúng tình huống đó có thể không được phát hiện tự động — điều này không làm thay đổi hành vi hiện tại của ứng dụng.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 — ô E5 đo HÀM QUYẾT ĐỊNH thuần thay vì đầu ra endpoint mà `expected` khai (200 / row đổi / row không đổi)**
  Người dùng thấy gì: Bài kiểm tra tự động cho quy tắc của endpoint phản hồi kết cục chỉ kiểm tra logic quyết định bên trong, không kiểm tra yêu cầu web và cơ sở dữ liệu thật — nên một lỗi ở chính endpoint có thể không bị phát hiện, dù logic nền tảng trông đúng.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — AC-7 đo đối số truyền cho ORM trên một double viết tay khớp khuôn bên gọi, không round-trip qua DB thật**
  Người dùng thấy gì: Bài kiểm tra dùng để chứng minh workflow lưu lại đúng liên kết với kế hoạch đã sinh ra nó sử dụng một cơ sở dữ liệu giả thay vì cơ sở dữ liệu thật, nên chưa chứng minh trọn vẹn hành vi lưu-rồi-đọc-lại thật hoạt động đúng — không có nghĩa là tính năng đang lỗi.
  file: `src/app/api/workspace/save/provenance.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — "accepts exactly the four outcomes" quét lớp bằng chính danh sách mà hàm dưới test dùng: assert tự thoả, số bốn không hề được khẳng định**
  Người dùng thấy gì: Một trong các bài kiểm tra nội bộ vốn để xác nhận đúng bốn loại kết cục hợp lệ tồn tại lại được viết theo cách vẫn báo đạt dù danh sách đó âm thầm thay đổi — đây là lỗ hổng về độ chặt của bài kiểm tra, không phải thay đổi cách ứng dụng hoạt động hôm nay.
  file: `src/lib/director/events/director-events.test.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 6/13 lỗi rơi vào file không bộ đo nào phủ (scripts/ci/check-eval-filters-teeth.sh, scripts/acceptance/dws-wire-returns-plan.sh, _acceptance/director-wire-shape/golden/eval3-direct-3providers.mjs, scripts/acceptance/dws-expect-count.sh, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.