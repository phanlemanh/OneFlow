## Trong hợp đồng



## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Rejection diagnostics reintroduce the flat-top-level assumption the walker just removed**
  Người dùng thấy gì: Khi một hàm xử lý plugin bị viết sai bên trong một khối lệnh (như with/if/try) ở cấp cao nhất của file, thông báo lỗi vẫn chỉ trỏ chung chung vào dòng đầu tiên của file thay vì đúng vị trí thật của lỗi, khiến người viết plugin mất thời gian dò tìm nguyên nhân.
  file: `sdk/tongflow/scan.py`
  severity: high
  Đề xuất: new-contract

- **Legacy Inference branch overwrites @deploy slot_problems instead of extending them**
  Người dùng thấy gì: Trong một số cấu trúc file plugin hiếm gặp, lý do khiến một slot bị từ chối có thể bị ghi đè và mất, nên người viết plugin chỉ nhận được thông báo lỗi chung chung thay vì lý do thực sự khiến slot của họ không hoạt động.
  file: `sdk/tongflow/parse_deploy.py`
  severity: low
  Đề xuất: known-limits

- **Fixture pin covers deploy.py only, while the README claims both files are pinned**
  Người dùng thấy gì: Tài liệu mô tả bộ dữ liệu kiểm thử nói rằng cả hai file mẫu đều được khoá để chống trôi dữ liệu, nhưng thực tế chỉ một file được khoá — nếu file còn lại âm thầm khác đi so với bản gốc, sẽ không có cảnh báo nào được đưa ra.
  file: `sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay/README.md`
  severity: low
  Đề xuất: known-limits

- **Skip reason is suppressed for @node_slot functions inside module-scope blocks, though those same functions do register**
  Người dùng thấy gì: Khi một hàm xử lý plugin đặt bên trong một khối lệnh (như with/if/try) bị viết sai, hệ thống vẫn đăng ký hàm đó thành công nếu viết đúng, nhưng khi viết sai lại chỉ báo lỗi chung chung ở đầu file thay vì chỉ đúng chỗ sai, khiến việc sửa lỗi mất nhiều thời gian hơn cần thiết.
  file: `sdk/tongflow/scan.py`
  severity: medium
  Đề xuất: new-contract

- **Legacy Inference branch overwrites @deploy-class slot_problems instead of extending, silently dropping rejections**
  Người dùng thấy gì: Trong một số cấu trúc file plugin hiếm gặp, lý do khiến một slot bị từ chối có thể bị ghi đè và mất hoàn toàn, nên người viết plugin chỉ nhận được thông báo lỗi chung chung thay vì lý do thực sự khiến slot của họ không hoạt động.
  file: `sdk/tongflow/parse_deploy.py`
  severity: low
  Đề xuất: known-limits

- **Shape 4 — Assertion âm-tính-một-mình: nửa chokepoint của E13 không có đối chứng dương (grip), pathspec sai chính tả là xanh vĩnh viễn**
  Người dùng thấy gì: Bài kiểm tra tự động dùng để đảm bảo thay đổi này không đụng vào các phần nhạy cảm khác của hệ thống có thể tiếp tục báo "an toàn" ngay cả khi đường dẫn nó theo dõi bị đổi tên hoặc gõ sai sau này, khiến rủi ro thực sự không còn được phát hiện.
  file: `scripts/plugins/check-scan-blast-radius.sh`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 — Nhiễu động của E14 là bản VIẾT TAY xấp xỉ, không round-trip từ mã tiền-sửa thật trong git**
  Người dùng thấy gì: Bài kiểm tra dùng để chứng minh tính năng mới thực sự bắt được kiểu lỗi cũ được dựng trên một phiên bản mã cũ chép tay không đầy đủ, nên phép thử này dễ "đậu" hơn mức cần thiết và chưa chứng minh chắc chắn rằng tính năng mới bắt được mọi trường hợp của mã cũ.
  file: `scripts/plugins/check-scope-walker-teeth.sh`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)



⚠ Cụm ngoài vùng phủ: 2/7 lỗi rơi vào file không bộ đo nào phủ (sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay/README.md, scripts/plugins/check-scan-blast-radius.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.