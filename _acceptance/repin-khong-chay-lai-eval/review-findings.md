## Trong hợp đồng

Bốn vòng có findings, tất cả đã vá và có phép đo hai chiều. Chi tiết ở
`evidence-report.md` mục Iterations; hai cái đáng nhớ nhất:

- **Bộ ghi phá xuất xứ rồi báo sạch** (vòng 2). Ghi vào một sổ không kết thúc bằng dấu
  xuống dòng làm hai dòng hàn thành một; cả hai biến mất khỏi mọi bên đọc, và phần kiểm
  in "0 dòng ghim … OK" rồi thoát 0. Đóng bằng một cửa duy nhất cho mọi lượt đọc/ghi.
- **Đối chứng dương đo lời hàm nói, không đo thứ hàm làm** (vòng 5). Ô đo giữ tiêu chí
  chịu lực nhất khớp một dòng thông báo in ra từ biến trong bộ nhớ, nên xoá hẳn thứ nó
  canh vẫn để ô đo xanh. Lượt soi xác nhận bác phép sửa đầu tiên của chính vòng ấy.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Phần kiểm dòng ghim mới coi "không đọc được mốc so sánh" là "chưa có sổ nào"**
  Người dùng thấy gì: Trên một bản sao kho không tải đủ nhánh chính — bản tách nhánh, bản
  sao rút gọn, hoặc một lượt kiểm tự động chưa đồng bộ xong — phép kiểm coi toàn bộ 1674
  dòng lịch sử là mới và báo 25 lỗi sai. Người đọc thấy một trang đỏ dày đặc không liên
  quan gì tới thay đổi họ vừa làm, và cách duy nhất để biết đó là báo động giả là đọc mã.
  file: `scripts/ci/repin-eval-coverage.mjs` (chế độ so dòng mới)
  severity: high
  Đề xuất: nâng phạm vi sửa ngay

- **Phần kiểm chính coi "không so được hai mốc" là "không có gì đổi"**
  Người dùng thấy gì: Khi phép so hai mốc thất bại vì bất kỳ lý do gì, danh sách file đổi
  về rỗng — nên lần ghim ấy được tính là đã đo và không bao giờ có thể bị phát hiện là bỏ
  sót ô nào. Một lần ghim hỏng trông y hệt một lần ghim sạch.
  file: `scripts/ci/repin-eval-coverage.mjs` (chế độ kiểm)
  severity: medium
  Đề xuất: nâng phạm vi sửa ngay

- **Một phép đếm ở hàng rào anh em đúng theo cấu trúc nên không bao giờ đỏ được**
  Người dùng thấy gì: Không gì cả — và đó là vấn đề. Một dòng tự xưng là canh "quên viết
  phép phá cho một mục" nhưng cách nó cộng số làm hai vế luôn bằng nhau; nó chỉ bắt được
  lỗi gõ nhầm tên. Cùng hình dạng mà hồ sơ này viết trong chính phần mở đầu là "hình dạng
  phải tránh".
  file: `scripts/ci/check-gate-guards-job.sh` (bất biến đếm)
  severity: low
  Đề xuất: mở hợp đồng mới

- **Lệnh dựng ứng dụng cần vỏ lệnh kiểu Unix**
  Người dùng thấy gì: Người đóng góp dùng Windows làm đúng theo danh sách kiểm bắt buộc
  sẽ không dựng được, trong khi lượt kiểm tự động (chạy trên máy Linux) vẫn báo mọi thứ ổn.
  file: `package.json` (mục dựng ứng dụng)
  severity: low
  Đề xuất: ghi Known limits

- **Tỉ lệ trong đoạn văn dưới sổ lộ trình vẫn nói 23 trong khi sổ có 32 dòng**
  Người dùng thấy gì: Người đọc lộ trình thấy một tỉ lệ sai về việc bao nhiêu phần là năng
  lực sản phẩm và bao nhiêu là hạ tầng quy trình. Không phép đo nào canh con số nằm ngoài
  khối sổ.
  file: `docs/roadmap.md` (đoạn văn sau sổ cái)
  severity: low
  Đề xuất: mở hợp đồng mới

- **Không có gì bắt khoá trùng trong tệp khai ô đo**
  Người dùng thấy gì: Một tệp khai ô đo có hai lần cùng một khoá vẫn nạp bình thường, bản
  sau lặng lẽ đè bản trước. Đã xảy ra thật trong một hồ sơ ĐÃ KÝ, khiến bằng chứng đã ký
  mô tả một phép đo không hề chạy. Vòng này sửa ca đã tìm thấy, nhưng ca tiếp theo vẫn
  vào được.
  file: `_acceptance/**/evals.yaml` (chưa có hàng rào)
  severity: medium
  Đề xuất: mở hợp đồng mới
