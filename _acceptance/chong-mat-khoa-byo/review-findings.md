## Trong hợp đồng

(không có finding nào ánh xạ được vào AC round này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **PUT trả lại `env` của request thay vì map đã ghi — phản hồi có thể lệch với đĩa**
  Người dùng thấy gì: Nếu người dùng gõ tên khoá có khoảng trắng thừa hoặc để trống, màn hình có thể hiển thị tạm một khoá thực ra không được lưu, cho tới khi tải lại trang.
  file: `src/app/api/settings/env/route.ts`
  severity: low
  Đề xuất: known-limits

- **Chuỗi lỗi tiếng Việt hardcode trong route + rò tên enum nội bộ ra người dùng**
  Người dùng thấy gì: Người dùng dùng giao diện tiếng Anh, Nhật, Hàn hoặc Trung có thể nhận một thông báo lỗi bằng tiếng Việt kèm thuật ngữ kỹ thuật khi hệ thống không đọc được kho khoá, thay vì thông báo bằng đúng ngôn ngữ họ đang dùng.
  file: `src/app/api/settings/env/route.ts`
  severity: low
  Đề xuất: new-contract

- **saveAndVerifyKey merge lên `undefined` — thay toàn bộ map bằng đúng 1 khoá**
  Người dùng thấy gì: Nếu hệ thống tạm thời không đọc được kho khoá đúng lúc người dùng lưu một khoá mới từ ô nhập trong node, mọi khoá riêng đã lưu trước đó có thể bị xoá sạch mà không có cảnh báo nào.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: medium
  Đề xuất: new-contract

- **Ba catch nuốt trọn lỗi gốc, không log gì**
  Người dùng thấy gì: Khi kho khoá gặp sự cố (ví dụ do quyền truy cập tệp hay ổ đĩa lỗi), người vận hành hệ thống không có đủ manh mối trong nhật ký để biết chính xác nguyên nhân, gây khó khăn khi cần khắc phục.
  file: `src/lib/settings/env-store.server.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — đo CHỈ DẪN thay vì ĐẦU RA: "keeps the four reasons distinct" chỉ đọc bảng hằng của chính nó**
  Người dùng thấy gì: Một trong các bài kiểm tra tự động cho tính năng này chỉ so sánh với chính nó chứ không kiểm tra hệ thống thật, nên nếu hệ thống trộn lẫn các nguyên nhân lỗi khác nhau thành một, bài kiểm tra vẫn báo 'đạt'.
  file: `src/lib/settings/env-store.server.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP nhưng thiếu phần tử: ma trận "loadEnvStore stays tolerant" bỏ nguyên nhân `decode`**
  Người dùng thấy gì: Bộ kiểm tra tự động cho đường 'đọc để chạy' bỏ sót một trong sáu tình huống kho hỏng, nên nếu hệ thống xử lý sai đúng tình huống đó, các bài kiểm tra hiện tại sẽ không phát hiện ra.
  file: `src/lib/settings/env-store.server.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — E8 tuyên ba điều kiện (ok, absent, cờ-bị-bỏ-qua, so đĩa) nhưng cmd trỏ vào file không có điều kiện nào trong số đó**
  Người dùng thấy gì: Bài kiểm tra tự động dùng để chứng minh một trong các điều kiện chấp nhận đang trỏ nhầm sang tệp không hề chứa các tình huống mà điều kiện đó hứa kiểm tra, nên nó báo 'đạt' mà không thực sự chứng minh được gì.
  file: `_acceptance/chong-mat-khoa-byo/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — assert BAO HÀM thay vì QUAN HỆ bằng-đúng: toMatchObject trên `env` ở hai ca lời hứa là deep-equal**
  Người dùng thấy gì: Hai bài kiểm tra tự động dùng phép so sánh lỏng lẻo (chỉ kiểm tra có mặt, không kiểm tra chính xác từng khoá) cho dữ liệu khoá trả về, nên nếu hệ thống trả dư hoặc sai lệch dữ liệu khoá, các bài kiểm tra này vẫn báo 'đạt'.
  file: `src/app/api/settings/env/route.unreadable.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ.

- title: Đường RUN báo "thiếu khoá" khi thật ra kho khoá hỏng
  file:line: `src/lib/media-library/config.server.ts:24`
  severity: medium
  detail: `loadEnvStore()` gộp `unreadable` thành `{}` (env-store.server.ts:101-104, quyết định owner). Nhưng `resolveConfig` (dòng 24-37) rồi kết luận `missing: [MEDIA_LIBRARY_URL, MEDIA_LIBRARY_API_KEY]` và trả câu "Chưa gọi được media-library: thiếu ..." — chẩn đoán SAI khi store thực ra không đọc được, và người dùng bị dẫn tới form cấu hình mà form đó chắc chắn thất bại ở bước GET (503). `resolveApiKey` trong director.server.ts:115-117 cũng vậy: im lặng rơi về `process.env.ANTHROPIC_API_KEY`/undefined. Không nhánh nào log lại rằng store hỏng, nên fallback này hoàn toàn vô hình phía server.
  source: bugs

- title: Test "keeps the four reasons distinct" không chạm production code
  file:line: `src/lib/settings/env-store.server.test.ts:163`
  severity: low
  detail: Test dựng một Set từ chính các hằng khai báo trong file test (`BLOB_CAUSES`) cộng hai chuỗi literal "io"/"decode" rồi assert Set đó bằng 4 phần tử. Không import, không gọi `readEnvStore`. Nó xanh vĩnh viễn kể cả khi production gộp cả bốn reason về một chuỗi — tức là đúng cái hồi quy nó tự nhận đang canh.
  source: bugs

⚠ Cụm ngoài vùng phủ: 3/10 lỗi rơi vào file không bộ đo nào phủ (src/components/workspace/nodes/base/abi-node-shell.tsx, src/lib/media-library/config.server.ts, _acceptance/chong-mat-khoa-byo/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
