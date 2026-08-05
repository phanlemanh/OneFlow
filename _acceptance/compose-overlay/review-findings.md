## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **CI never runs the TypeScript test suite that this diff massively expands**
  Người dùng thấy gì: Nhiều bài kiểm thử mới được thêm cho tính năng này không tự động chạy mỗi khi có thay đổi code, nên một lỗi có thể lọt qua mà không ai phát hiện trước khi phát hành.
  file: `.github/workflows/ci.yml`
  Đề xuất: known-limits

- **CLAUDE.md still documents the first-edition manifest guard the diff replaced**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ về cách đăng ký plugin mới đang mô tả sai quy trình hiện tại, có thể khiến người làm theo sau bị nhầm bước.
  file: `CLAUDE.md`
  Đề xuất: known-limits

- **Raw <select> instead of the repo's shadcn Select, with untranslated enum labels**
  Người dùng thấy gì: Người dùng ở các ngôn ngữ khác ngoài tiếng Anh sẽ thấy một số lựa chọn cấu hình (vị trí, kiểu canh) hiển thị bằng tiếng Anh chưa dịch, và ô chọn này trông khác biệt so với phần còn lại của giao diện.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: known-limits

- **ui-capture.mjs shipped with its upstream template header intact**
  Người dùng thấy gì: Một tệp kịch bản dùng nội bộ vẫn còn ghi hướng dẫn cài đặt cũ và sai (nhắc tới công cụ quản lý gói khác với công cụ dự án đang dùng), có thể khiến người bảo trì sau này làm theo chỉ dẫn lỗi thời — không ảnh hưởng người dùng cuối.
  file: `scripts/ui-capture.mjs`
  Đề xuất: known-limits

- **Merged ops schema gives the plugin no static discrimination per op kind**
  Người dùng thấy gì: Giao diện có thể cho phép nhập một trường thông tin không phù hợp với loại hiệu ứng đang chọn (ví dụ nhập màu nền cho logo) mà không cảnh báo trước khi chạy.
  file: `config/tongflow.abi.json`
  Đề xuất: known-limits

- **canSwapOntoHandle re-derives the handle-id → field mapping instead of using the shared parser**
  Người dùng thấy gì: Không ảnh hưởng trực tiếp đến người dùng ngay bây giờ; đây là rủi ro bảo trì nội bộ — nếu sau này chỉ sửa một trong hai chỗ tính toán tương tự, hai nơi có thể lệch nhau.
  file: `src/lib/abi/edge-target-options.ts`
  Đề xuất: known-limits

- **Refused edge swap is a completely silent no-op in the inline edge select**
  Người dùng thấy gì: Khi người dùng thử đổi một kết nối dây nối và thao tác đó bị từ chối ngầm, lựa chọn tự động quay lại trạng thái cũ mà không có thông báo giải thích lý do, khiến người dùng bối rối không biết vì sao thao tác không có tác dụng.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: known-limits

- **price_tag ops ship a literal `{text}` default with no guard when `in:text` is unconnected**
  Người dùng thấy gì: Nếu người dùng thêm một khung giá lên ảnh/video nhưng quên nối nguồn chữ giá, hệ thống vẫn báo chạy thành công trong khi kết quả xuất ra lại in chữ giữ chỗ vô nghĩa thay vì con số giá thật.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  Đề xuất: known-limits

- **gen-abi CI guard uses `git diff` without HEAD, so staged regeneration drift reads as clean**
  Người dùng thấy gì: Trên máy cá nhân của người phát triển (không phải trên hệ thống kiểm tra tự động chính thức), việc rà soát 'các tệp sinh tự động đã khớp với cấu hình' có thể báo sạch dù thực ra chưa khớp, khiến sai lệch lọt qua trước khi đưa lên hệ thống chung.
  file: `scripts/abi/check-python-gen-clean.sh`
  Đề xuất: known-limits

- **spawnSync failure cause is dropped from the gen-abi error message**
  Người dùng thấy gì: Khi công cụ sinh mã nội bộ gặp sự cố hệ thống (ví dụ thiếu một công cụ định dạng code), thông báo lỗi hiển thị ra trống rỗng, khiến người gặp lỗi khó biết nguyên nhân thật để tự khắc phục.
  file: `scripts/gen-abi-types.ts`
  Đề xuất: known-limits

- **Unclassifiable media upstream silently reports as `image`, hiding all per-op time controls**
  Người dùng thấy gì: Nếu hệ thống không nhận diện được loại tệp đầu vào (ảnh hay video), giao diện âm thầm coi đó là ảnh và ẩn các ô điều khiển theo thời gian (mốc bắt đầu/kết thúc hiệu ứng), dù dữ liệu thời gian người dùng đã nhập trước đó vẫn được gửi đi ẩn phía sau — có thể gây kết quả không như mong đợi.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  Đề xuất: new-contract

