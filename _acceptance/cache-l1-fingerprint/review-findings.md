## Trong hợp đồng

Không có. Cả hai vòng verify: 0 finding nào bị quy về một tiêu chí đã ký (`inContract: false` cho toàn bộ).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

Vòng 1 (REJECT) có 6 finding: 1 high + 4 medium + 1 low, **đã sửa hết** trước vòng 2 — guard AC-14 nay patch một bản copy trong temp dir chứ không ghi file tracked; AC-16 nay đỏ thật khi bỏ `sort_keys`; subprocess của AC-1 nay mở rộng `os.environ` và truyền `cwd`. Chi tiết ở `evidence-report.md` và git history. Bốn finding dưới đây là những gì còn lại sau vòng 2 (PASS).

- **`mime`/`filename` của asset bị loại khỏi digest, nên cùng bytes + khác metadata dùng chung một entry cache**
  Người dùng thấy gì: Hai file có nội dung giống hệt nhau nhưng khai báo loại khác nhau (ví dụ một file được đặt tên `.wav` và một file `.mp3`) sẽ được hệ thống coi là **một**. Ở lát sau, khi cache thật sự phục vụ kết quả, một plugin chọn bộ giải mã theo loại file đã khai sẽ nhận về kết quả tính cho loại kia — sai âm thầm, không báo lỗi.
  file: `sdk/tongflow/engine/fingerprint.py`
  severity: low
  Đề xuất: new-contract

- **`sdk_major()` chỉ kiểm "có dấu chấm", nên một `sdk_version` sai định dạng âm thầm đầu độc mọi khoá**
  Người dùng thấy gì: Nếu chỗ gọi truyền số phiên bản sai dạng (ví dụ `v0.2.17` thay vì `0.2.17`), hệ thống vẫn tính ra khoá cache bình thường thay vì báo lỗi — và toàn bộ kho cache bị chia đôi vì một lỗi gõ, nên mọi thứ đã tạo trước đó coi như không dùng lại được.
  file: `sdk/tongflow/engine/fingerprint.py`
  severity: low
  Đề xuất: known-limits

- **Hai guard chống hồi quy khẳng định trên văn bản nguồn nguyên văn, nên một sửa đổi vô hại về nghĩa cũng làm chúng đỏ**
  Người dùng thấy gì: Có thể gặp báo lỗi kiểm thử dù không có gì thực sự hỏng — chỉ vì mã nguồn được viết lại theo cách khác. Rủi ro thật không phải là báo động giả, mà là phản xạ nới lỏng đúng hai bài kiểm tra đang là bằng chứng duy nhất cho hai tính chất quan trọng nhất của khoá cache.
  file: `sdk/tests/test_fingerprint.py`
  severity: low
  Đề xuất: known-limits

- **`STATUS.md` khẳng định không còn feature nào đang bay, trong khi HEAD nói ngược lại**
  Người dùng thấy gì: Người (hoặc máy) đọc trạng thái dự án sẽ tưởng phần việc này chưa bắt đầu và có thể làm lại từ đầu — đúng cái bẫy đã gần khiến hai mươi commit đã ký bị làm lại hai ngày trước.
  file: `STATUS.md`
  severity: low
  Đề xuất: đã sửa trong nhánh này (commit `aba508a`), không cần người quyết
