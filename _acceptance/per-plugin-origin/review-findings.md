## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Bounds của ABI (minimum/maximum/exclusiveMinimum) không được enforce ở boundary duy nhất tạo ra giá trị — ops editor**
  Người dùng thấy gì: Người dùng có thể nhập số vượt phạm vi cho vị trí/kích thước/thời gian của lớp phủ mà không có cảnh báo — giá trị sai vẫn được lưu và gửi đi xử lý, có thể tạo ra kết quả lỗi hoặc bất ngờ.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: known-limits

- **CLAUDE.md §"Registering an official plugin" đã lệch: check-manifest-unmoved.sh được viết lại thành phiên bản 2 nhưng doc vẫn mô tả phiên bản 1**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ để đăng ký plugin mới hiện mô tả sai một bước kiểm tra an toàn, nên người sau làm theo hướng dẫn để thêm plugin có thể bối rối vì cơ chế thật hoạt động khác với những gì tài liệu nói.
  file: `CLAUDE.md`
  Đề xuất: known-limits

- **Handle-swap trên inline edge select bị từ chối im lặng, không phản hồi gì cho người dùng**
  Người dùng thấy gì: Khi người dùng cố đổi chỗ hai kết nối đầu vào trên sơ đồ mà thao tác đó không hợp lệ, giao diện không phản hồi gì cả — không có thông báo giải thích, nên thao tác trông như bị hỏng.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: known-limits

- **Field chỉ dùng cho video (`start`/`end`) không bị prune khi media được đấu lại từ video sang image**
  Người dùng thấy gì: Nếu người dùng đặt khoảng thời gian bắt đầu/kết thúc cho một lớp phủ video rồi sau đó đổi sang ảnh tĩnh, khoảng thời gian ẩn đó vẫn được gửi kèm, khiến ảnh tĩnh có thể bị xử lý với một khoảng thời gian không còn ý nghĩa.
  file: `src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx`
  Đề xuất: known-limits

- **Doc comment của `alsoAccepts` đã lỗi thời ngay trong PR tạo ra nó**
  Người dùng thấy gì: Một ghi chú giải thích cách một cài đặt nội bộ hoạt động hiện mô tả sai, có thể khiến người phát triển sau này vô tình lặp lại đúng lỗi đã từng được sửa.
  file: `src/lib/abi/sources.ts`
  Đề xuất: known-limits

- **compose-overlay đặt trong `nodes/transfer/` nhưng là node N→1 (hai asset handle)**
  Người dùng thấy gì: Tính năng lớp phủ mới bị xếp nhầm nhóm nội bộ trong mã nguồn; điều này không ảnh hưởng tới người dùng cuối nhưng làm quy ước tổ chức mã không nhất quán cho người bảo trì sau này.
  file: `src/components/workspace/types.tsx`
  Đề xuất: known-limits

- **Unresolvable media upstream silently falls back to "image", hiding time controls while start/end still ship**
  Người dùng thấy gì: Nếu ứng dụng không xác định được nguồn media đấu vào là video hay ảnh, nó âm thầm coi như ảnh tĩnh, ẩn luôn khung điều khiển thời gian trong khi vẫn áp dụng khoảng thời gian cũ phía sau — nên kết quả xuất ra có thể không khớp với những gì người dùng nhìn thấy trên màn hình.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  Đề xuất: new-contract

- **Refused edge swap in the inline handle select is a completely silent no-op**
  Người dùng thấy gì: Khi người dùng cố đổi chỗ hai kết nối đầu vào trên sơ đồ mà thao tác đó không hợp lệ, giao diện không phản hồi gì cả — không có thông báo giải thích, nên thao tác trông như bị hỏng.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: known-limits

- **check-python-gen-clean.sh uses `git diff` without HEAD, so staged regeneration drift reads as clean**
  Người dùng thấy gì: Một cơ chế kiểm tra tự động vốn để phát hiện khi mã sinh tự động bị lệch khỏi nguồn có thể bị đánh lừa để báo cáo mọi thứ ổn dù các file đã commit thực ra đang lỗi thời, nếu thay đổi được stage theo một thứ tự nhất định.
  file: `scripts/abi/check-python-gen-clean.sh`
  Đề xuất: known-limits

- **run-overlay-plugin-tests.sh hardcodes oneflow-sdk==0.2.18 while its sibling guard derives the version**
  Người dùng thấy gì: Bộ kiểm thử tự động cho plugin lớp phủ có thể tiếp tục kiểm tra dựa trên một phiên bản backend cũ ngay cả sau khi phiên bản thật đã được nâng cấp, nên việc test báo "đạt" không đảm bảo plugin thực tế đang chạy đúng.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: known-limits

- **gen-abi-types.ts drops the spawn failure cause from its error message**
  Người dùng thấy gì: Khi bước sinh mã tự động thất bại vì thiếu một công cụ cần thiết, thông báo lỗi hiển thị cho người phát triển bị trống và không rõ ràng, khiến việc tìm ra nguyên nhân khó khăn hơn.
  file: `scripts/gen-abi-types.ts`
  Đề xuất: known-limits

