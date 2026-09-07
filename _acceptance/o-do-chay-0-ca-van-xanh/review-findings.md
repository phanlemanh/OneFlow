# Phát hiện khi verify — `o-do-chay-0-ca-van-xanh`

Làn máy thuần, 17/17 ô đo PASS. Một phát hiện **ngoài 13 tiêu chí đã ký**.

## Ngoài hợp đồng

- **Bộ đọc cấu hình bỏ sót giá trị dạng khối YAML mà không báo gì**
  file: `scripts/ci/check-eval-filters.mjs`
  severity: medium
  Người dùng thấy gì: Nếu ai đó viết một dòng cấu hình theo kiểu nhiều dòng, phép kiểm sẽ lặng lẽ không đếm nó và vẫn báo đạt.
  Đề xuất: ghi Known limits — đo cho thấy hôm nay không dòng nào dùng kiểu đó, và cửa "đếm thiếu" đã có phép đo cho ba kiểu đang dùng
  detail: Kho không có `yaml` lẫn `js-yaml`, nên bộ kiểm đọc cấu hình theo dòng.
  Đo 31/08: `grep -cE "^\s{4}\w+:\s*[|>]"` trên `_acceptance/config.yaml` cho **0** —
  không executor nào dùng giá trị dạng khối, nên ba biến thể trích dẫn (nháy đơn,
  nháy kép, trần) là đủ, và ca răng `undercount` chứng minh cả ba đều đếm được.
  **Nhưng** nếu một ngày có người viết dạng khối, bộ đọc sẽ bỏ qua **im lặng** — cùng
  lớp fail-open mà gói này sinh ra để chặn, ở một hình dạng chưa được phủ. Cửa
  `zero-executors` chỉ kích khi đếm được 0; đếm thiếu MỘT thì không cửa nào kích.
  Bịt được bằng cách thêm một khẳng định: không dòng nào dưới `executors:` mở đầu
  giá trị bằng `|` hoặc `>`. Rẻ, nhưng nằm ngoài phạm vi đã duyệt.
