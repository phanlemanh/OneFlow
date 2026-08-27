## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Vietnamese comments in new SDK code violate the English-only rule, and one comment was left half-translated**
  Người dùng thấy gì: Một số ghi chú trong bộ kiểm thử vẫn còn tiếng Việt và có đoạn dịch dở dang không đọc trôi chảy ở ngôn ngữ nào — không ảnh hưởng người dùng cuối, chỉ gây khó khăn cho lập trình viên đọc lại mã sau này.
  file: `sdk/tests/test_normalize_vi.py`
  severity: medium
  Đề xuất: known-limits

- **Evidence report's verified_commit is behind HEAD, and the newer commit touched files inside the verified scope**
  Người dùng thấy gì: Báo cáo nghiệm thu đang xác nhận một phiên bản mã cũ hơn phiên bản mới nhất (dù thay đổi sau đó chỉ là dịch chú thích), nên người duyệt có thể ký duyệt nhầm cho một bản không phải bản cuối cùng.
  file: `_acceptance/normalize-text-vi/evidence-report.md`
  severity: medium
  Đề xuất: known-limits

- **check-manifest-guard-teeth.sh comment contradicts the guard it exercises (fifth vs fourth origin entry)**
  Người dùng thấy gì: Một dòng ghi chú giải thích cho công cụ kiểm tra nội bộ đang mô tả sai số lượng hiện tại, dù công cụ vẫn hoạt động đúng — chỉ gây nhầm lẫn cho người đọc mã sau này, không ảnh hưởng người dùng sản phẩm.
  file: `scripts/plugins/check-manifest-guard-teeth.sh`
  severity: low
  Đề xuất: known-limits

- **MUSIC_SLOTS doc comment misstates the invariant: separate-sound is not an audio-out slot**
  Người dùng thấy gì: Một ghi chú mô tả sai lý do một mục nằm trong danh sách loại trừ cảnh báo nhạc, dù hành vi hiện tại vẫn đúng; rủi ro chỉ là người sau có thể hiểu sai quy tắc khi thêm tính năng mới.
  file: `src/lib/workflow/exporter.ts`
  severity: low
  Đề xuất: known-limits

- **TTS-order warning fires on every speech workflow and names a node no user can add**
  Người dùng thấy gì: Người dùng có luồng đọc-thành-giọng bằng tiếng Việt sẽ thấy cảnh báo mỗi lần lưu, xuất file hoặc chạy, yêu cầu thêm một node mà hiện tại không có cách nào thêm qua giao diện sản phẩm — vì node đó chưa có trong danh sách chọn và chưa có plugin chính thức nào cài sẵn nó.
  file: `src/lib/workflow/exporter.ts`
  severity: medium
  Đề xuất: known-limits

- **_AMBIGUOUS_D refuses correctly-normalized glued prices that cannot be an address**
  Người dùng thấy gì: Một số câu ghi giá tiền viết theo cách phổ biến giữa câu (ví dụ '99.000đ' hay '50.000 đ' đứng trước một từ khác) sẽ bị từ chối đọc thành giọng nói thay vì đọc ra đúng số tiền, do sản phẩm đã chủ động chọn từ chối thay vì đoán nhầm giữa giá và địa chỉ.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: medium
  Đề xuất: known-limits

- **has_money() docstring claims an address-stripping step the function does not perform**
  Người dùng thấy gì: Một ghi chú kỹ thuật mô tả sai một bước xử lý đã không còn tồn tại; không ảnh hưởng người dùng ngay bây giờ, nhưng có thể khiến người sửa mã sau này vô tình làm sống lại một lỗi đọc sai địa chỉ đã từng được khắc phục.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 — đo cây checkout riêng của tác giả: guard vỏ plugin chỉ xanh trên máy đã viết nó**
  Người dùng thấy gì: Bằng chứng kiểm thử cho phần vỏ plugin hiện chỉ chạy được trên máy của người viết tính năng, không tái lập được ở máy khác hay trên hệ thống kiểm tra tự động — nghĩa là chưa có bằng chứng độc lập nào xác nhận vỏ plugin hoạt động đúng.
  file: `scripts/plugins/run-normalize-plugin-tests.sh`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — fixture conformance viết tay đúng khuôn bên đọc (engine), không round-trip từ exporter**
  Người dùng thấy gì: Một phần dữ liệu kiểm thử dùng để đối chiếu giữa hai hệ thống được viết tay thay vì lấy trực tiếp từ luồng xuất dữ liệu thật, nên nếu cách xuất dữ liệu thật thay đổi mà không ai cập nhật dữ liệu kiểm thử theo, phép đối chiếu này có thể vẫn báo đúng dù thực tế đã sai.
  file: `sdk/tests/conformance/fixtures/normalize-text-vi.json`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
