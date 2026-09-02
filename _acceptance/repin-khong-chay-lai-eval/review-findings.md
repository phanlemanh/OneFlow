## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Guard CLI im lặng thoát 0 khi đường dẫn repo cần URL-encode (isMain so chuỗi thô)**
  Người dùng thấy gì: Nếu thư mục chứa kho có khoảng trắng hoặc ký tự đặc biệt, công cụ kiểm tra tự động có thể báo 'mọi thứ ổn' mà chưa thực sự kiểm tra gì, khiến người đọc báo cáo tin nhầm là đã được xác minh.
  file: `scripts/ci/repin-eval-coverage.mjs:333`
  severity: medium
  Đề xuất: known-limits

- **`write` không từ chối khi prev_sha == sha — thứ tự gọi sai làm dòng repin vô hiệu vĩnh viễn**
  Người dùng thấy gì: Nếu bước ghi bằng chứng chạy sau khi mốc xác minh đã bị cập nhật trước đó, dòng ghim mới vẫn trông hợp lệ nhưng thực ra không còn so sánh được với thay đổi nào — người ký duyệt có thể tin nhầm là đã kiểm tra kỹ trong khi thực chất không có gì được đối chiếu.
  file: `scripts/ci/repin-eval-coverage.mjs:182`
  severity: medium
  Đề xuất: known-limits

- **`build` gán biến môi trường inline — hỏng trên Windows shell, trong khi checklist bắt buộc chạy `pnpm build`**
  Người dùng thấy gì: Người dùng máy Windows làm theo đúng hướng dẫn dựng ứng dụng có thể gặp lỗi và không dựng được, dù hệ thống kiểm tra tự động (chạy trên máy khác) vẫn báo mọi thứ ổn.
  file: `package.json:24`
  severity: low
  Đề xuất: known-limits

- **`write` mode fabricates an all-green `suites_exit` when the caller omits it**
  Người dùng thấy gì: Nếu người ghi bằng chứng bỏ sót một tham số, hệ thống có thể tự ghi nhận 'tất cả các bước kiểm tra đều đã chạy và đạt' dù thực ra chưa có bước kiểm tra nào được chạy — khiến người duyệt tin vào một bằng chứng không có thật.
  file: `scripts/ci/repin-eval-coverage.mjs:196`
  severity: high
  Đề xuất: new-contract

- **`isMain` URL comparison makes every mode a silent no-op under some checkout paths**
  Người dùng thấy gì: Nếu đường dẫn thư mục chứa khoảng trắng hoặc ký tự đặc biệt, mọi chế độ của công cụ kiểm tra có thể lặng lẽ không chạy gì mà vẫn báo thành công — khiến người xem báo cáo tin nhầm là đã được đo đạc.
  file: `scripts/ci/repin-eval-coverage.mjs:333`
  severity: high
  Đề xuất: known-limits

- **`plan` mode turns a git failure into a confident "nothing was touched"**
  Người dùng thấy gì: Nếu gõ nhầm hoặc dùng một mốc phiên bản không hợp lệ, công cụ hoạch định có thể tự tin báo 'không có gì bị ảnh hưởng' thay vì báo lỗi, khiến người xem bỏ sót đúng phần cần kiểm tra lại.
  file: `scripts/ci/repin-eval-coverage.mjs:206`
  severity: medium
  Đề xuất: known-limits

- **Unresolvable shas are silently reclassified as "grandfathered", with no floor on computable pins**
  Người dùng thấy gì: Trên một số bản sao kho không đầy đủ, công cụ có thể âm thầm xếp toàn bộ dòng ghi vào diện 'miễn kiểm tra vì quá cũ' mà không cảnh báo, khiến báo cáo trông sạch dù thực chất chưa kiểm tra được gì.
  file: `scripts/ci/repin-eval-coverage.mjs:260`
  severity: medium
  Đề xuất: known-limits

- **`build` script uses shell-only inline env assignment**
  Người dùng thấy gì: Người dùng máy Windows làm theo đúng hướng dẫn dựng ứng dụng có thể gặp lỗi và không dựng được, dù hệ thống kiểm tra tự động (chạy trên máy khác) vẫn báo mọi thứ ổn.
  file: `package.json:24`
  severity: low
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA — E2 (AC-2) dùng phép grep văn bản ci.yml, và khoá YAML trùng khiến `expected` sống sót lại mô tả một chế độ KHÔNG TỒN TẠI**
  Người dùng thấy gì: Bài kiểm tra tự động cho một tính năng khác trong kho chỉ đọc nội dung hướng dẫn thay vì kiểm tra hành vi thực tế, và có một đoạn mô tả kỳ vọng không khớp với công cụ đang có — nên nó có thể báo đạt dù tính năng đó chưa chắc hoạt động đúng.
  file: `_acceptance/noi-thuoc-tai-lieu-vao-ci/evals.yaml:65`
  severity: high
  Đề xuất: known-limits

- **Assert con số tự thoả thay vì QUAN HỆ được hứa — bất biến `KÊ = PHÁ + BỎ QUA` của chế độ teeth hằng-đúng với mọi danh sách skip hợp lệ**
  Người dùng thấy gì: Một phép kiểm tự động ở tính năng khác trong kho luôn tự đúng theo cấu trúc bất kể có lỗi thật hay không, nên nó không thể phát hiện đúng loại sai sót mà nó được dựng ra để bắt.
  file: `scripts/ci/check-gate-guards-job.sh:349`
  severity: high
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc — không lượt nào cho `write` ghi rồi để `check`/`newlines` đọc lại; mọi ca dùng dòng repin gõ tay**
  Người dùng thấy gì: Bộ kiểm thử cho công cụ ghi bằng chứng chỉ kiểm tra một dòng chữ log xuất hiện, chứ chưa thực sự kiểm tra dữ liệu ghi ra có được đọc lại đúng hay không — nên nếu công cụ ghi sai định dạng, bộ kiểm thử vẫn có thể báo đạt.
  file: `scripts/ci/check-repin-eval-coverage.sh:205`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/11 lỗi rơi vào file không bộ đo nào phủ (package.json, _acceptance/noi-thuoc-tai-lieu-vao-ci/evals.yaml, scripts/ci/check-gate-guards-job.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
