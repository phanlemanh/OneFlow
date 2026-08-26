# Review Findings: normalize-text-vi (round 14)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **SDK trả lỗi bằng tiếng Việt — phá vỡ quy ước i18n mà chính PR này vừa dựng**
  Người dùng thấy gì: Khi việc đọc số/giá thất bại, người dùng đang dùng giao diện tiếng Anh, Nhật, Hàn hoặc Trung vẫn thấy thông báo lỗi bằng tiếng Việt thay vì bằng ngôn ngữ họ chọn.
  file: `sdk/tongflow/text/normalize_vi.py:269`
  severity: medium
  Đề xuất: new-contract

- **Ba guard mới còn thông điệp tiếng Việt trong khi mọi guard khác dưới scripts/ đều tiếng Anh**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối — đây là thông điệp hiển thị cho lập trình viên khi chạy kiểm tra nội bộ, không xuất hiện trên sản phẩm.
  file: `scripts/abi/check-normalize-sdk-published.sh:24`
  severity: low
  Đề xuất: known-limits

- **hasUpstreamSlot bỏ qua handle nên node reader nối vào input KHÔNG-phải-text vẫn dập được cảnh báo**
  Người dùng thấy gì: Trong một số luồng có cả nhánh âm thanh và nhánh chữ cùng nối vào một node tạo giọng nói, hệ thống có thể không cảnh báo dù văn bản thật sự chưa được đọc thành chữ trước khi tạo giọng — người dùng mất đi lời nhắc thêm bước đọc số.
  file: `src/lib/workflow/exporter.ts:125`
  severity: low
  Đề xuất: known-limits

- **Xoá chữ "ngày" trước MỌI chuỗi dạng d/m/yyyy — thư viện không trả lại khi không parse được, ok=True**
  Người dùng thấy gì: Với ngày viết kiểu Mỹ (ví dụ 12/25/2026) hoặc ngày không hợp lệ, node có thể đọc sai hoặc làm mất số ngày, rồi vẫn tự báo thành công — người dùng nghe giọng đọc sai ngày mà không có cảnh báo nào.
  file: `sdk/tongflow/text/normalize_vi.py:38`
  severity: high
  Đề xuất: known-limits

- **`_RESIDUAL` không tính dấu "/" — token thư viện bỏ lại lọt thẳng vào TTS mà không cờ nào đỏ**
  Người dùng thấy gì: Các cách viết giá hoặc lãi suất phổ biến như 'đ/kg' hay '%/năm' có thể còn sót dấu gạch chéo và đơn vị chưa được đọc thành lời, nhưng hệ thống vẫn báo thành công nên không ai được nhắc để sửa.
  file: `sdk/tongflow/text/normalize_vi.py:140`
  severity: medium
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc (không round-trip writer→reader)**
  Người dùng thấy gì: Bài kiểm tra đối chiếu giữa giao diện và máy chủ chạy nền dùng dữ liệu mẫu viết tay thay vì dữ liệu thật sinh ra từ luồng thật, nên nếu cách luồng thật gửi dữ liệu thay đổi, bài kiểm tra này vẫn báo xanh mà không phát hiện ra sai lệch.
  file: `sdk/tests/conformance/fixtures/normalize-text-vi.json:33`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
