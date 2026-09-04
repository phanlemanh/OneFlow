# Review Findings: lat-cat-chung-minh (round 2)

## Trong hợp đồng

- **Hình dạng 4 — needle check-plan-docs.sh đỏ nhờ phép phá của guard KHÁC, không có phép phá của chính nó**
  file: `scripts/ci/check-gate-guards-job.sh:44`
  severity: high
  source: measurement
  AC: AC-9

  Diff thêm `check-plan-docs.sh` vào GUARD_NEEDLES (dòng 44) và thêm `cp STATUS.md` + `cp docs/strategy/vision.md` vào cây thăm dò (dòng 267-271) với chú thích 'without them its red half would fail because a file is missing, not because drift was caught'. Nhưng khối PERTURB (dòng 280-316) KHÔNG hề phá bất kỳ thứ gì check-plan-docs.sh tự kiểm: phép phá duy nhất được thêm là hồ sơ lạc `teeth-probe-freeze` (dòng 312-315), dành cho check-plan-freeze.mjs.

  Đo thật (dựng lại đúng cây thăm dò của mode teeth): với CHỈ phép phá teeth-probe-freeze, `check-plan-docs.sh` XANH — cả 16 dòng OK, rc=0. Chỉ sau khi áp phép phá 'nhân đôi dòng sổ cái' (vốn dành cho check-roadmap-fresh.sh) nó mới đỏ, và dòng FAIL duy nhất là `FAIL: guard sổ cái đỏ` — tức 15 phép kiểm riêng của nó (ngày STATUS.md, số hồ sơ đếm trên cây, con trỏ khối kế hoạch, đoạn định vị, đoạn tỉ lệ…) vẫn OK trong cả hai chiều.

  Vòng đỏ chỉ khẳng định `red_rc -ne 0`, không ghim thông điệp, nên nó cấp tín dụng cho một cái đỏ đi mượn. Tệ hơn: bất biến `KÊ=PHÁ+BỎ QUA` (dòng ~355) tồn tại đúng để phân biệt 'quên viết phép phá cho một needle' với 'cố ý bỏ qua có tên' — ở đây needle nằm trong PHÁ (7 needle) nên bất biến vẫn xanh trong khi tình huống nó canh đã xảy ra. Hệ quả: E9/AC-9 ('mode teeth chứng minh nó đỏ trên cây đã phá') được ghi PASS cho check-plan-docs.sh mà không phép kiểm nào của guard ấy từng được chứng minh có răng trong mode này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **`decision: park` is an unsigned, unlisted escape hatch from the freeze rule**
  Người dùng thấy gì: Ai đó có thể tự ý "đóng băng" một hạng mục ngoài kế hoạch chỉ bằng cách ghi một dòng park trong hồ sơ riêng của họ, không cần ai phê duyệt hay ghi ngày tháng, mà công cụ kiểm tra vẫn báo mọi thứ bình thường.
  file: `scripts/roadmap/check-plan-freeze.mjs:193`
  severity: high
  Đề xuất: known-limits

- **check-plan-docs.sh hard-pins STATUS.md's heading date as a required CI step**
  Người dùng thấy gì: Khi có người cập nhật đúng ngày trên trang trạng thái dự án trong tương lai, công cụ kiểm tra tự động có thể báo lỗi oan và chặn việc hợp nhất một thay đổi hợp lệ.
  file: `scripts/roadmap/check-plan-docs.sh:39`
  severity: high
  Đề xuất: known-limits

- **New "Chờ duyệt phạm vi" bucket has no checkBucket — a draft dossier drifts silently**
  Người dùng thấy gì: Một mục đang ở trạng thái chờ duyệt phạm vi có thể âm thầm không khớp với bản đồ sản phẩm mà không ai được cảnh báo, vì công cụ kiểm tra vẫn báo "khớp, không trôi".
  file: `scripts/ci/check-product-map.mjs:210`
  severity: medium
  Đề xuất: known-limits

- **check-plan-docs.sh aborts silently (no FAIL line, 14 checks skipped) when no contract is signed-off**
  Người dùng thấy gì: Trong một tình huống hiếm gặp (không còn hồ sơ nào được ký duyệt), công cụ kiểm tra tài liệu có thể dừng đột ngột giữa chừng mà không báo lỗi rõ ràng, khiến phần lớn các phép kiểm không thực sự chạy dù báo cáo trông như bình thường.
  file: `scripts/roadmap/check-plan-docs.sh:41`
  severity: medium
  Đề xuất: known-limits

- **Guard hardcodes `16/36` for docs/roadmap.md while counting the same denominator dynamically for STATUS.md**
  Người dùng thấy gì: Khi có thêm hồ sơ được ký duyệt trong tương lai, tỉ lệ hiển thị trên lộ trình sản phẩm có thể trở nên lỗi thời mà không ai được cảnh báo, và sửa đúng con số đó lại có thể khiến công cụ kiểm tra báo lỗi oan.
  file: `scripts/roadmap/check-plan-docs.sh:65`
  severity: medium
  Đề xuất: known-limits

- **check-plan-freeze F1 fail-open: a dossier directory with neither contract.md nor opportunity.md is silently ignored**
  Người dùng thấy gì: Một thư mục hồ sơ dở dang, thiếu file cần thiết, có thể lọt qua luật đóng băng kế hoạch ở lớp kiểm tra này mà không bị cảnh báo, dù một lớp kiểm tra khác trong hệ thống vẫn có thể phát hiện ra.
  file: `scripts/roadmap/check-plan-freeze.mjs:199`
  severity: low
  Đề xuất: known-limits

- **opportunityDecision() swallows read errors and quoted YAML values, silently misfiling a signed dossier into the wrong bucket**
  Người dùng thấy gì: Một hồ sơ đã hoàn tất nhưng ghi chú theo định dạng hơi khác thường (ví dụ đặt trong dấu ngoặc kép) có thể bị xếp nhầm là "đã xong" trên bản đồ sản phẩm dù thực ra vẫn còn chờ nghiệm thu.
  file: `scripts/ci/check-product-map.mjs:138`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — J1 chấm MÃ NGUỒN thông điệp thay vì ĐẦU RA thật của guard**
  Người dùng thấy gì: Bước thẩm định tự động cho tính năng này có thể chấm dựa trên đoạn mã nguồn thay vì kết quả thực chạy của công cụ kiểm tra, nên báo cáo "đạt" đôi khi không chứng minh được công cụ thực sự hoạt động đúng như mô tả.
  file: `_acceptance/lat-cat-chung-minh/evals.yaml:208`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 — khẳng định đúng-do-cấu-trúc trong case clean của răng plan-freeze**
  Người dùng thấy gì: Một trong các ca kiểm thử tự động nội bộ chỉ trông giống như đang kiểm tra một điều kiện an toàn nhưng thực chất luôn luôn đúng, nên không thể phát hiện lỗi thật nếu có — không ảnh hưởng đến người dùng, chỉ là một khoảng trống trong lưới kiểm thử nội bộ.
  file: `scripts/roadmap/check-plan-freeze-teeth.sh:115`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).