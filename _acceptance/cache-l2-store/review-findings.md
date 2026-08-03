## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **compose-overlay node placed in transfer/ (1→1) though it is an N→1 combination — belongs in compose/**
  Người dùng thấy gì: Công cụ ghép ảnh/video/logo mới sẽ hiện sai nhóm trong bảng chọn công cụ, khiến người dùng khó tìm thấy nó ở đúng danh mục họ mong đợi.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: medium
  Đề xuất: new-contract

- **New devDependencies use caret ranges, breaking the repo's exact-pin convention**
  Người dùng thấy gì: Khi cài lại dự án, các thư viện phục vụ kiểm thử có thể tự động nâng phiên bản mà không ai commit thay đổi đó, khiến kết quả kiểm tra tự động thay đổi âm thầm và tăng nguy cơ lỗi lọt qua trước khi phát hành.
  file: `package.json`
  severity: medium
  Đề xuất: known-limits

- **CLAUDE.md still documents the first-edition manifest guard after the guard was rewritten**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ cho người thêm tiện ích mới đã lỗi thời so với công cụ kiểm tra thực tế, khiến người thêm tiện ích tiếp theo dễ làm sai theo hướng dẫn cũ.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **Overlay plugin test wrapper hardcodes the SDK version instead of deriving it**
  Người dùng thấy gì: Khi thư viện lõi được nâng cấp, bộ kiểm tra cho tính năng ghép hình vẫn âm thầm chạy với phiên bản cũ, nên kết quả "đạt" không thực sự chứng minh tính năng hoạt động đúng với phiên bản đang phát hành.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  severity: low
  Đề xuất: known-limits

- **scripts/ui-capture.mjs shipped with its vendor/reference header intact**
  Người dùng thấy gì: Tệp hướng dẫn nội bộ cho việc chụp ảnh giao diện còn sót lại chỉ dẫn lỗi thời (tên tệp cũ, lệnh cài đặt sai công cụ dự án đang dùng), có thể khiến người bảo trì sau này làm sai theo hướng dẫn.
  file: `scripts/ui-capture.mjs`
  severity: low
  Đề xuất: known-limits

- **Raw `<select>` with untranslated enum labels — only one in the codebase**
  Người dùng thấy gì: Danh sách lựa chọn vị trí/kiểu ghép trong công cụ mới sẽ hiển thị bằng tiếng Anh thô, không được dịch sang các ngôn ngữ khác dù toàn bộ nhãn xung quanh đã được dịch, gây trải nghiệm không nhất quán cho người dùng không dùng tiếng Anh.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: low
  Đề xuất: new-contract

- **Enum `<select>` renders a concrete option for ops that carry no value for that field**
  Người dùng thấy gì: Khi một thao tác ghép hình không có sẵn giá trị vị trí/căn chỉnh, giao diện vẫn hiển thị một lựa chọn cụ thể như thể đã chọn, trong khi thực tế không có giá trị nào được gửi đi — người dùng có thể tưởng nhầm hệ thống đã áp dụng đúng lựa chọn hiển thị trên màn hình.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: low
  Đề xuất: new-contract

- **`check-manifest-unmoved.sh` keeps `manifest` and `expected_org` as dead variables while the node script hardcodes both**
  Người dùng thấy gì: Tệp kiểm tra an toàn cho danh sách tiện ích chính thức còn giữ lại các biến cấu hình không còn tác dụng, dễ khiến người sửa sau này tưởng nhầm đã cập nhật xong quy tắc trong khi thực chất chưa, dẫn tới quy tắc kiểm tra sai lệch mà không ai phát hiện.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: low
  Đề xuất: known-limits
