## Trong hợp đồng

- **Decimal fraction loses its leading zero — prices/percentages read 10× wrong with ok=True**
  file: `sdk/tongflow/text/normalize_vi.py:140`
  severity: high
  AC: AC-5
  detail: `_decimal_tail` returns `f" phẩy {digits}"`, handing the raw fraction digits to vietnormalizer as a bare number. The library reads "05" as a cardinal ("năm"), not digit-by-digit ("không năm"), so the leading zero disappears. Measured on vietnormalizer==0.2.3 via PYTHONPATH=sdk: `Giá 3,09 triệu đồng` -> `giá ba phẩy chín triệu đồng`, byte-identical to the output for `Giá 3,9 triệu đồng`; `Lãi suất 7,02%` -> `bảy phẩy hai phần trăm` (7.2%); `Tỷ lệ 0,08%` -> `không phẩy tám phần trăm` (0.8%); `Giá 1.000.000,05 đ` -> `giá một triệu phẩy năm đồng`. All return ok=True with residual=() — no digit survives, the currency word is present, so both post-checks stay green. This is precisely the failure class the rule's own docstring says it exists to prevent ("a confident, order-of-magnitude-wrong price spoken as success"). sdk/tests/test_normalize_vi.py only exercises ',00', ',5', ',50' and ',67', so no golden case has a leading-zero fraction. Fix: emit the fraction digit-by-digit (e.g. ' phẩy không năm') instead of passing the raw digit string through, and add a leading-zero golden case.
  source: bugs
  rationale: AC-5 (Sửa đổi vòng 5) chốt đọc phần thập phân khác 0 phải đọc 'phẩy <chữ số>'; số 0 đầu bị nuốt khiến giá đọc sai một bậc mười lần, đúng lớp lỗi 'sai số giá êm ru' mà AC này ràng buộc.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Vietnamese-only user-facing error strings bypass the i18n layer this same PR mandates**
  Người dùng thấy gì: Thông báo lỗi của node đọc số luôn hiển thị bằng tiếng Việt (ví dụ chuỗi rỗng, chưa đọc hết số), nên người dùng đang dùng giao diện tiếng Anh/Trung/Nhật/Hàn khi gặp lỗi sẽ thấy dòng chữ tiếng Việt thay vì ngôn ngữ họ đang chọn.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: medium
  Đề xuất: new-contract

- **_COMMA_CHAIN turns English-style thousand separators into an enumeration**
  Người dùng thấy gì: Số hoặc giá viết kiểu Anh với dấu phẩy ngăn nghìn từ ba nhóm trở lên (ví dụ 1,000,000) bị đọc rời thành từng cụm ('một, không, không') thay vì đọc như một con số, trong khi hệ thống vẫn báo thành công.
  file: `sdk/tongflow/text/normalize_vi.py`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 6 — đo cây của tác giả: E17a/E17b chạy trên thư mục plugin chỉ tồn tại trên máy viết code**
  Người dùng thấy gì: Bộ kiểm xác nhận vỏ plugin thật gọi đúng hàm SDK và trả lỗi đúng nội dung chỉ chạy được trên một thư mục plugin cục bộ chưa từng đưa lên kho công khai — không máy nào khác (kể cả hệ thống kiểm tra tự động) tái lập lại được kết quả này cho đến khi kho plugin được công bố.
  file: `scripts/plugins/run-normalize-plugin-tests.sh`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 6 — phép kiểm pin của E14b cũng neo vào cây plugin không theo dõi được**
  Người dùng thấy gì: Bước kiểm xác nhận kho plugin đã ghim đúng phiên bản SDK mới cũng chỉ đọc được từ một thư mục cục bộ chưa lên kho công khai — trên máy khác bước kiểm này không chạy được và không tự dựng lại được vì kho plugin chưa tồn tại công khai.
  file: `scripts/abi/check-normalize-sdk-published.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — fixture conformance viết tay đúng khuôn hai bên đọc, không round-trip qua exporter**
  Người dùng thấy gì: Bài kiểm 'canvas và máy chủ đọc khớp nhau' dùng một dữ liệu mẫu gõ tay thay vì lấy trực tiếp từ bước xuất luồng thật, nên nếu định dạng xuất luồng thật thay đổi, bài kiểm này vẫn báo xanh trong khi sản phẩm thật đã lệch khỏi cả hai bên đang so sánh.
  file: `sdk/tests/conformance/fixtures/normalize-text-vi.json`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).