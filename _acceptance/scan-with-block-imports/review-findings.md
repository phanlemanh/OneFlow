## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Nhánh chẩn đoán chốt bằng tree.body, mù đúng thành ngữ mà feature này vừa hợp thức hoá**
  Người dùng thấy gì: Nếu người viết plugin đặt hàm xử lý slot bên trong một khối lệnh (thành ngữ chuẩn mà chính tính năng này vừa cho phép) và viết sai, hệ thống vẫn báo lỗi chung chung trỏ sai vị trí thay vì nêu đúng nguyên nhân, khiến việc tìm lỗi mất nhiều thời gian hơn.
  file: `sdk/tongflow/scan.py`
  severity: high
  Đề xuất: new-contract

- **Bản sao thứ hai của luật đọc phiên bản SDK, và guard canh nó có lỗ**
  Người dùng thấy gì: Đoạn kịch bản canh việc không phát hành thay đổi ngoài dự kiến có một lỗ hổng khiến nó có thể báo "an toàn" ngay cả khi có một cách đọc phiên bản thứ hai không nhất quán được thêm vào, nên rủi ro lọt thay đổi ngoài phạm vi tăng lên mà không hiện cảnh báo rõ ràng.
  file: `scripts/plugins/check-scan-blast-radius.sh`
  severity: medium
  Đề xuất: known-limits

- **Ba câu chẩn đoán mới không vào docs/plugins.md §9, và finding về docs biến mất khỏi sổ chấp nhận của contract**
  Người dùng thấy gì: Người viết plugin sẽ gặp các thông báo lỗi mới của tính năng này nhưng tài liệu hướng dẫn chưa được cập nhật để giải thích chúng, nên phải tự đoán cách khắc phục khi gặp thông báo lạ.
  file: `docs/plugins.md`
  severity: medium
  Đề xuất: known-limits

- **Nhánh Inference cũ GHI ĐÈ slot_problems của class @deploy thay vì gộp**
  Người dùng thấy gì: Trong một trường hợp hiếm gặp, lý do lỗi thật của plugin bị mất và người dùng chỉ thấy một thông báo chung chung không rõ nguyên nhân, kéo dài thời gian tìm lỗi.
  file: `sdk/tongflow/parse_deploy.py`
  severity: medium
  Đề xuất: known-limits

- **Cache toàn cục theo identity của AST giữ tham chiếu mạnh tới tối đa 16 cây module**
  Người dùng thấy gì: Một cơ chế lưu tạm dữ liệu phân tích có thể giữ dữ liệu cũ trong bộ nhớ lâu hơn cần thiết ở một số quy trình chạy nền dài, dù chưa quan sát thấy sự cố thực tế nào từ việc này.
  file: `sdk/tongflow/_ast_utils.py`
  severity: low
  Đề xuất: known-limits

- **@node_slot functions nested in a module-level block are silently skipped (the exact `with image.imports():` idiom this change targets)**
  Người dùng thấy gì: Nếu người viết plugin đặt hàm xử lý slot bên trong một khối lệnh (thành ngữ chuẩn mà chính tính năng này vừa cho phép) và viết sai, hệ thống vẫn báo lỗi chung chung trỏ sai vị trí thay vì nêu đúng nguyên nhân, khiến việc tìm lỗi mất nhiều thời gian hơn.
  file: `sdk/tongflow/scan.py`
  severity: high
  Đề xuất: new-contract

- **parse_deploy_py's error is discarded, replaced by a misleading generic message**
  Người dùng thấy gì: Khi tệp cấu hình plugin có lỗi cấu trúc thật sự (ví dụ khai trùng một slot ở hai nơi), người dùng chỉ nhận một thông báo chung chung trỏ sai vị trí thay vì nguyên nhân thật, đúng kiểu lỗi mà tính năng này vốn được làm ra để sửa.
  file: `sdk/tongflow/scan.py`
  severity: medium
  Đề xuất: known-limits

- **@deploy-class slot rejection reasons are overwritten by the legacy Inference branch**
  Người dùng thấy gì: Trong một trường hợp hiếm gặp, lý do lỗi thật của plugin bị mất và người dùng chỉ thấy một thông báo chung chung không rõ nguyên nhân, kéo dài thời gian tìm lỗi.
  file: `sdk/tongflow/parse_deploy.py`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: chân âm AC-4 xanh cả khi việc đăng ký slot hỏng toàn bộ (hình dạng 4)**
  Người dùng thấy gì: Một trong các bài kiểm tra tự động không đủ chặt để phát hiện nếu việc đăng ký tính năng bị hỏng hoàn toàn ở một dạng hiếm gặp, nên có nguy cơ một lỗi nghiêm trọng trượt qua mà không ai hay biết.
  file: `sdk/tests/test_scan_scope.py`
  severity: medium
  Đề xuất: known-limits

- **Assert 'chuỗi có mặt' trong khi lời hứa là QUAN HỆ khác-biệt giữa ba câu lý do (hình dạng 3)**
  Người dùng thấy gì: Bài kiểm tra tự động chỉ xác nhận có thông báo lỗi xuất hiện, không xác nhận các thông báo lỗi khác nhau có thực sự phân biệt được với nhau, nên hai nguyên nhân lỗi khác nhau có thể trộn lẫn thành một câu mà không ai phát hiện.
  file: `sdk/tests/test_scan_scope.py`
  severity: medium
  Đề xuất: known-limits

- **Ghim fixture là ghim CHÍNH NÓ, không phải round-trip từ plugin thật; entry.py không có ghim nào (hình dạng 2)**
  Người dùng thấy gì: Tệp mẫu dùng để kiểm thử được đối chiếu với chính nó chứ không phải với plugin thật đang chạy, nên nếu plugin thật đổi hình dạng, bài kiểm thử vẫn có thể báo xanh một cách sai lệch.
  file: `scripts/plugins/check-overlay-discoverable.sh`
  severity: medium
  Đề xuất: known-limits

- **Tuyên biên-giới-phạm-vi cả LỚP nhưng chân âm chỉ có 2/4 điểm-case: thiếu `async def` (hình dạng 5)**
  Người dùng thấy gì: Một dạng khai báo hàm xử lý slot (dùng async) chưa được kiểm thử đầy đủ như các dạng còn lại, nên nếu logic bị hỏng riêng ở dạng này, không có bài kiểm tra nào phát hiện.
  file: `sdk/tests/test_scan_scope.py`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/12 lỗi rơi vào file không bộ đo nào phủ (scripts/plugins/check-scan-blast-radius.sh, docs/plugins.md) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
