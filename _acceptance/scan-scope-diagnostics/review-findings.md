## Trong hợp đồng

Findings: none — chưa có finding nào map được vào một AC cụ thể trong round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **An unparseable deploy.py is reported twice — violating the branch's own AC-12 "exactly once" invariant**
  Người dùng thấy gì: Khi tệp deploy.py của một plugin bị lỗi cú pháp hoặc không đọc được, danh sách lỗi hiển thị cho người dùng lặp lại đúng một thông báo giống hệt nhau hai lần, khiến báo cáo lỗi trông rối và khó tin cậy hơn thực tế.
  file: `sdk/tongflow/scan.py`
  severity: high
  Đề xuất: known-limits

- **Evidence report is pinned to a commit two behind HEAD, with a functional SDK fix landing after verification**
  Người dùng thấy gì: Báo cáo nghiệm thu hiện đang dựa trên một phiên bản mã cũ hơn commit mới nhất và vẫn ở trạng thái chưa hoàn tất (nhiều phép kiểm tra máy chưa chạy được) — nghĩa là các sửa đổi gần nhất chưa thực sự được xác minh trước khi ai đó dựa vào báo cáo này để quyết định duyệt.
  file: `_acceptance/scan-scope-diagnostics/evidence-report.md`
  severity: low
  Đề xuất: known-limits

- **An unparseable deploy.py is reported twice, byte-identically**
  Người dùng thấy gì: Khi deploy.py của một plugin bị lỗi cú pháp, người dùng nhận được đúng một thông báo lỗi nhưng bị lặp lại hai lần y hệt nhau trong kết quả quét, gây rối mắt và làm báo cáo trông thiếu chỉn chu.
  file: `sdk/tongflow/scan.py`
  severity: medium
  Đề xuất: known-limits

- **A parse error in any stray .py file suppresses the actionable "no @node_slot found" message**
  Người dùng thấy gì: Nếu thư mục cài đặt của một plugin chứa bất kỳ tệp Python phụ nào có lỗi cú pháp (ví dụ tệp kiểm thử cũ đi kèm), tác giả plugin sẽ không còn thấy thông báo hướng dẫn thật sự cần thiết (thêm @node_slot vào entry.py), mà chỉ thấy lỗi ở một tệp không liên quan — khiến họ mất phương hướng khi tìm cách sửa.
  file: `sdk/tongflow/scan.py`
  severity: medium
  Đề xuất: new-contract

- **Assert "chuỗi có mặt" thay vì quan hệ: test NUL-byte xanh ngay cả khi lỗi parse bị nuốt**
  Người dùng thấy gì: Bài kiểm thử tự động cho trường hợp tệp plugin chứa ký tự byte-null không thực sự xác nhận rằng lý do lỗi cụ thể được báo đúng, nên nếu về sau có thay đổi vô tình làm mất lý do lỗi chi tiết ở tình huống này, người dùng có thể lại nhận thông báo chung chung, kém hữu ích, mà không ai phát hiện ra trước khi phát hành.
  file: `sdk/tests/test_scan_diagnostics.py`
  severity: high
  Đề xuất: known-limits

- **Teeth scope-gate tuyên quét E1..E3 + E6 nhưng chỉ chạy điểm-case E1/E2; E3 và E6 không thể đỏ**
  Người dùng thấy gì: Kịch bản kiểm tra tự động tuyên bố đã phủ nhiều tình huống hơn thực tế nó chạy, nên nếu một lỗi hồi quy chỉ lộ ra ở đúng những tình huống bị bỏ sót, nó sẽ không được phát hiện trước khi phát hành.
  file: `scripts/plugins/check-diagnostics-teeth.sh`
  severity: medium
  Đề xuất: known-limits

- **Teeth parse-failure tuyên quét E7..E10 nhưng chỉ chạy 2/7 test — bỏ đúng test duy nhất không đỏ**
  Người dùng thấy gì: Kịch bản kiểm tra cho nhóm lỗi 'tệp không đọc được' chỉ thực sự chạy một phần nhỏ trong số các tình huống mà nó tuyên bố đã phủ, nên một lỗi hồi quy (kể cả lỗi báo trùng lặp thông báo đã nêu ở trên) có thể lọt qua mà không bị phát hiện trước khi phát hành.
  file: `scripts/plugins/check-diagnostics-teeth.sh`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).