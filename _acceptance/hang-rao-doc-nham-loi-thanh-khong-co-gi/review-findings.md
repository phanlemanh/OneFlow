## Trong hợp đồng

(không có finding nào map được vào AC — danh sách rỗng)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Bất biến KÊ = PHÁ + BỎ QUA không thể đỏ vì lý do mà thông điệp của nó nêu**
  Người dùng thấy gì: Một bước kiểm tra tự động có thể luôn báo 'đã kiểm tra đủ' dù thật ra có một bước kiểm tra bị bỏ sót, khiến người xem báo cáo tin nhầm là mọi thứ đã được rà soát kỹ.
  file: `scripts/ci/check-gate-guards-job.sh:349`
  severity: medium
  Đề xuất: known-limits

- **`build` nhúng biến môi trường inline — vỡ trên shell không POSIX, và là script duy nhất trong package.json làm vậy**
  Người dùng thấy gì: Người dùng Windows chạy lệnh build trước khi đóng góp mã có thể gặp lỗi ngay lập tức và không tạo được bản build, dù trên máy Mac hoặc Linux mọi thứ vẫn bình thường.
  file: `package.json:24`
  severity: low
  Đề xuất: new-contract

- **Thông điệp OK và chú thích của mode `shape` vẫn nói 'hai guard' trong khi đã kiểm bảy needle**
  Người dùng thấy gì: Một dòng thông báo 'kiểm tra thành công' ghi sai số lượng bước đã được kiểm tra, có thể khiến người đọc báo cáo đánh giá thấp phạm vi thực sự đã được rà soát.
  file: `scripts/ci/check-gate-guards-job.sh:91`
  severity: low
  Đề xuất: known-limits

- **Mode `orphans` không có chiều đỏ ở bất kỳ đâu, và bỏ qua icon .png mà runtime vẫn phân giải**
  Người dùng thấy gì: Một chế độ kiểm tra tài liệu chưa từng được chứng minh là biết phát hiện lỗi, và bỏ sót một dạng biểu tượng plugin — nghĩa là một lỗi thật ở khu vực đó có thể lọt qua mà không ai nhận ra.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh:10`
  severity: low
  Đề xuất: known-limits

- **evalsOf: prose inside `expected: >-` hijacks an eval's `paths`, turning a swallowed eval into a green sweep**
  Người dùng thấy gì: Một dòng mô tả bằng văn xuôi bình thường trong ghi chú của một ca kiểm tra có thể vô tình đánh lừa hệ thống thành 'đã kiểm tra lại đầy đủ', trong khi phép kiểm tra quan trọng đó thực chất đã bị bỏ sót hoàn toàn.
  file: `scripts/ci/repin-eval-coverage.mjs:208`
  severity: high
  Đề xuất: new-contract

- **modePlan reads a failed `git diff` as "nothing changed" and tells the operator to re-run no eval**
  Người dùng thấy gì: Công cụ giúp người vận hành xem trước cần kiểm tra lại những gì có thể báo 'không cần làm gì' ngay cả khi có trục trặc kỹ thuật xảy ra, khiến một bước kiểm tra cần thiết bị bỏ sót.
  file: `scripts/ci/repin-eval-coverage.mjs:335`
  severity: high
  Đề xuất: new-contract

- **modePlan reports a clean plan for a dossier that does not exist**
  Người dùng thấy gì: Gõ nhầm tên hồ sơ khi xem trước kế hoạch kiểm tra lại có thể cho ra kết quả 'không có gì cần làm' thay vì báo lỗi, khiến người vận hành yên tâm nhầm.
  file: `scripts/ci/repin-eval-coverage.mjs:338`
  severity: medium
  Đề xuất: new-contract

- **PRODUCT-MAP.md is out of sync with the new dossier's status — the acceptance-gate CI step is red at HEAD**
  Người dùng thấy gì: Trang tổng quan sản phẩm chưa phản ánh đúng việc tính năng này đã hoàn thành, có thể khiến báo cáo tổng quan hiển thị sai trạng thái và làm một bước kiểm tra tự động báo lỗi không liên quan tới nội dung tính năng.
  file: `PRODUCT-MAP.md:28`
  severity: high
  Đề xuất: known-limits

- **teeth invariant `KÊ == PHÁ + BỎ QUA` cannot detect the case its comment claims it detects**
  Người dùng thấy gì: Một bước kiểm tra tự động có thể luôn báo 'đã kiểm tra đủ' dù có một bước kiểm tra thật sự bị bỏ sót, khiến người xem báo cáo tin nhầm là an toàn.
  file: `scripts/ci/check-gate-guards-job.sh:347`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert chuỗi hằng `OK: 7/7 ca` thay cho quan hệ «mọi ca của bộ răng đều chạy và đạt»; nay đã mục (bộ răng in 9/9)**
  Người dùng thấy gì: Bằng chứng đã được duyệt trước đó cho một plugin ghi sai số lượng ca kiểm tra thực tế, khiến người xem chứng cứ sau này có thể tin nhầm là bộ kiểm tra chưa được mở rộng.
  file: `_acceptance/dang-ky-fork-openai/evals.yaml:99`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (biến thể) — bất biến đếm `kê = phá + bỏ qua` HẰNG-ĐÚNG theo cấu tạo, nhưng E5/AC-5 khai nó là phép đo phân biệt «quên viết phép phá» với «cố ý bỏ qua»**
  Người dùng thấy gì: Bằng chứng đã ký của một hồ sơ khác mô tả một phép đo là 'phân biệt được lỗi thật với việc cố ý bỏ qua', trong khi thực tế nó không làm được điều đó — người xem chứng cứ có thể tin nhầm mức độ an toàn.
  file: `scripts/ci/check-gate-guards-job.sh:349`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — ca «hồ sơ đã thật sự xảy ra» dựng fixture GÕ TAY đúng khuôn bộ đọc, không rút vật hỏng THẬT từ lịch sử git**
  Người dùng thấy gì: Bằng chứng cho thấy hàng rào bắt lỗi trùng khoá dựa trên dữ liệu giả lập viết tay thay vì lỗi thật từng xảy ra — hành vi thực tế vẫn đúng khi kiểm tay trên lỗi thật, nhưng bộ chứng minh chưa chặt bằng vật hỏng có thật.
  file: `scripts/acceptance/check-eval-key-dupes.sh:99`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 8/12 lỗi rơi vào file không bộ đo nào phủ (scripts/ci/check-gate-guards-job.sh, package.json, scripts/plugins/check-live-docs-manifest-teeth.sh, PRODUCT-MAP.md, _acceptance/dang-ky-fork-openai/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
