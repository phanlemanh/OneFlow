## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **compose-overlay is director-safe but its required `ops` is unreachable by the DSL and ungated by MISSING_REQUIRED_INPUT**
  Người dùng thấy gì: Người dùng có thể thêm một khối chồng hình (overlay) lên video nhưng không có cách nào nhập các thao tác chồng hình bắt buộc qua trình lập kế hoạch tự động — khối này sẽ mắc kẹt không chạy được, hoặc nếu được xuất chạy ngầm thì có thể thất bại ở bước xử lý sau mà không có cảnh báo rõ ràng nào cho người dùng.
  file: `src/lib/director/safe-slots.ts`
  Đề xuất: new-contract

- **Vietnamese code comments added to lib/evidence-core.js violate the repo's English-only comment rule**
  Người dùng thấy gì: Thay đổi này không ảnh hưởng đến những gì người dùng nhìn thấy hay thao tác; nó chỉ để lại một số ghi chú kỹ thuật bằng tiếng Việt trong mã nguồn, có thể gây khó khăn cho đội phát triển khác khi bảo trì hoặc sửa lỗi sau này.
  file: `lib/evidence-core.js`
  Đề xuất: known-limits

- **check-overlay-registration.sh re-asserts the manifest invariants its own comment says it delegates**
  Người dùng thấy gì: Đây là một bước kiểm tra nội bộ trong quy trình phát triển, người dùng không thấy trực tiếp; nhưng nếu nguồn gốc của plugin thay đổi trong tương lai, có nguy cơ chỉ một trong hai chỗ kiểm tra được cập nhật, khiến một cấu hình plugin sai không bị phát hiện kịp thời.
  file: `scripts/plugins/check-overlay-registration.sh`
  Đề xuất: known-limits

- **compose-overlay-op-form.tsx uses a raw <select> with untranslated enum labels, deviating from the shared UI Select used by every other node**
  Người dùng thấy gì: Người dùng dùng giao diện tiếng Việt (hoặc ngôn ngữ khác ngoài tiếng Anh) sẽ thấy các lựa chọn vị trí/căn chỉnh khi chồng hình lên video hiển thị bằng tiếng Anh thay vì được dịch, và ô chọn này không có hiệu ứng hover/focus nhất quán với phần còn lại của giao diện.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: known-limits

- **run-overlay-plugin-tests.sh hardcodes the SDK version, adding a fourth copy of a constant CLAUDE.md already calls a recurring bug**
  Người dùng thấy gì: Đây là công cụ kiểm thử nội bộ cho đội phát triển, không tác động trực tiếp tới người dùng cuối; nhưng nếu SDK được nâng cấp phiên bản mới, bài kiểm thử này có thể vẫn báo 'đạt' trong khi thực chất đang kiểm tra một phiên bản cũ, khiến lỗi thật bị bỏ sót.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: known-limits

- **CLAUDE.md still documents the first-edition manifest guard that this diff replaced**
  Người dùng thấy gì: Đây là tài liệu nội bộ dành cho đội phát triển, không ảnh hưởng trực tiếp tới người dùng cuối; nhưng tài liệu lỗi thời có thể khiến người phát triển sau này hiểu sai cách một bước kiểm tra hoạt động, dẫn đến cấu hình sai không được phát hiện sớm.
  file: `CLAUDE.md`
  Đề xuất: known-limits

- **Freshly added ops alias the shared module-level NEW_OP template object**
  Người dùng thấy gì: Đây là một rủi ro tiềm ẩn chưa gây ra sự cố thực tế; nếu về sau có thay đổi khác trong mã nguồn kích hoạt nó, dữ liệu cấu hình chồng hình của người dùng trên các khối khác nhau trong cùng một phiên làm việc có thể bị trộn lẫn ngoài ý muốn.
  file: `src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx`
  Đề xuất: known-limits

- **Unresolvable media modality silently reported as "image"**
  Người dùng thấy gì: Khi mở lại một quy trình đã lưu, nếu hệ thống chưa kịp xác định nguồn đầu vào là video hay ảnh, giao diện sẽ ngầm coi đó là ảnh và ẩn mất các ô nhập thời gian bắt đầu/kết thúc — người dùng đang chồng hình lên video sẽ không thấy điều khiển thời gian mà không có bất kỳ cảnh báo nào giải thích lý do.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  Đề xuất: known-limits

- **Plugin-repo test guard reuses one cache dir across different remotes and hardcodes the SDK pin**
  Người dùng thấy gì: Đây là công cụ kiểm thử nội bộ; nó có thể vô tình kiểm tra nhầm một bản sao mã nguồn khác trong khi vẫn báo cáo kết quả như thể đã kiểm tra đúng phiên bản được yêu cầu, khiến đội phát triển tin tưởng nhầm vào một bài kiểm thử không thực sự đúng mục tiêu.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: known-limits

- **spawnSync launch failure is swallowed, producing a reason-less error**
  Người dùng thấy gì: Đây là công cụ dòng lệnh dùng trong quá trình phát triển; khi công cụ định dạng mã không khởi chạy được, người phát triển chỉ nhận thông báo lỗi trống rỗng, khiến việc tìm nguyên nhân mất nhiều thời gian hơn cần thiết — không ảnh hưởng tới người dùng cuối.
  file: `scripts/gen-abi-types.ts`
  Đề xuất: known-limits

- **Inline edge retarget silently does nothing when the displaced edge would be illegal**
  Người dùng thấy gì: Khi người dùng cố kéo lại một kết nối sang một điểm không hợp lệ, ô chọn trên giao diện sẽ tự động quay về giá trị cũ mà không có bất kỳ thông báo giải thích nào, khiến người dùng không rõ liệu thao tác của mình có được ghi nhận hay không.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: known-limits

- **Native <select> is controlled with a value that matches no option**
  Người dùng thấy gì: Khi mở một quy trình được lưu từ trước hoặc nhập từ file, nếu một thiết lập vị trí chồng hình không có giá trị, ô chọn sẽ hiển thị trống thay vì cho thấy giá trị mặc định thực tế sẽ được áp dụng, khiến người dùng không biết hệ thống sẽ dùng vị trí nào khi chạy.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: known-limits

