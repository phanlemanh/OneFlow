## Trong hợp đồng

Findings: []

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **An unparseable deploy.py is reported twice in scan errors**
  Người dùng thấy gì: Khi một plugin bị lỗi ở deploy.py, danh sách lỗi hiển thị đúng một sự cố nhưng lặp lại thành hai dòng giống hệt nhau, khiến người đọc tưởng nhầm có hai lỗi khác nhau cần sửa.
  file: `sdk/tongflow/scan.py`
  severity: medium
  Đề xuất: new-contract

- **A parse failure in an unrelated .py file hides the real 'no @node_slot found' diagnostic**
  Người dùng thấy gì: Nếu một tệp không liên quan trong plugin bị lỗi cú pháp, hệ thống chỉ báo lỗi tệp đó và ẩn mất lý do thật khiến slot chính của plugin không đăng ký được, khiến người dùng sửa nhầm tệp.
  file: `sdk/tongflow/scan.py`
  severity: medium
  Đề xuất: new-contract

- **A non-UTF-8 .py file still aborts the whole registry scan**
  Người dùng thấy gì: Nếu một plugin bất kỳ chứa tệp .py với ký tự không phải UTF-8, toàn bộ quá trình quét plugin bị crash ngay lập tức, không có thông báo lỗi nào được ghi ra.
  file: `sdk/tongflow/scan.py`
  severity: medium
  Đề xuất: known-limits

- **A non-UTF-8 .py file in any plugin aborts the whole scan (registry drops to zero plugins)**
  Người dùng thấy gì: Chỉ cần một plugin có tệp .py chứa ký tự không phải UTF-8 là toàn bộ danh sách plugin biến mất — kể cả các plugin khác hoàn toàn lành mạnh không còn được đăng ký, thay vì chỉ riêng plugin lỗi bị loại.
  file: `sdk/tongflow/scan.py`
  severity: high
  Đề xuất: known-limits

- **An unparseable deploy.py is reported twice, with byte-identical text**
  Người dùng thấy gì: Khi deploy.py không phân tích được, thông báo lỗi bị in lặp lại nguyên văn hai lần trong danh sách lỗi, gây cảm giác có nhiều vấn đề hơn thực tế.
  file: `sdk/tongflow/scan.py`
  severity: high
  Đề xuất: new-contract

- **Any unparseable .py anywhere in a plugin tree now makes a fully healthy plugin report an error**
  Người dùng thấy gì: Một plugin đã hoạt động tốt (đăng ký slot thành công) vẫn có thể bị gắn cờ lỗi chỉ vì một tệp phụ trợ không liên quan trong thư mục của nó bị lỗi cú pháp, khiến một plugin hoàn toàn lành mạnh trông như có vấn đề.
  file: `sdk/tongflow/scan.py`
  severity: medium
  Đề xuất: new-contract

- **Assert "chuỗi có mặt" thay vì quan hệ: needle của expect_red khớp ngay trong dòng assert được pytest in lại**
  Người dùng thấy gì: Bài kiểm tra tự động dùng để đảm bảo thông báo lỗi nêu đúng nguyên nhân có thể báo 'đạt' ngay cả khi thông báo thật không nêu đúng nguyên nhân, vì phép so khớp vô tình trúng vào chính câu lệnh kiểm tra thay vì nội dung thông báo thật.
  file: `scripts/plugins/check-diagnostics-teeth.sh`
  severity: medium
  Đề xuất: known-limits

- **Assert "chuỗi có mặt" thay vì quan hệ: E7 bỏ đúng ca phân biệt (file lỗi ≠ entry.py)**
  Người dùng thấy gì: Bài kiểm tra dùng để xác nhận hệ thống nêu đúng tên tệp bị lỗi không có ca thử nào đặt lỗi ở một tệp khác entry.py, nên một cách cài đặt luôn báo 'entry.py' bất kể tệp nào thực sự lỗi vẫn có thể vượt qua bài kiểm tra này.
  file: `sdk/tests/test_scan_diagnostics.py`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: E4/E5 chỉ assert im lặng, không ghim thông điệp dương dù nó có sẵn**
  Người dùng thấy gì: Hai bài kiểm tra chỉ xác nhận 'không có lỗi hiện ra' mà không xác nhận hệ thống thực sự đã quét đúng tệp, nên nếu việc quét âm thầm bỏ sót plugin hoàn toàn thì bài kiểm tra vẫn báo đạt.
  file: `sdk/tests/test_scan_diagnostics.py`
  severity: medium
  Đề xuất: known-limits

- **Ma trận không được ghim kích thước: E6b tuyên mười keyword nhưng cmd bỏ test ghim size**
  Người dùng thấy gì: Một trong các phép đo tự động tuyên bố bao phủ đủ mười loại khối cú pháp nhưng lại thiếu đúng bài kiểm tra chốt số lượng, nên nếu sau này có người lỡ xóa bớt một loại khối, riêng phép đo này sẽ không phát hiện ra.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).