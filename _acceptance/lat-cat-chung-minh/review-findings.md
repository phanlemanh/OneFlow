# Review Findings: lat-cat-chung-minh (round 5)

## Trong hợp đồng

(Không có finding nào ánh xạ được vào AC ở vòng này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **check-product-map.mjs chỉ mirror 1/3 nhánh sau Cổng Đáng — kill và build-chưa-có-contract rơi nhầm vào "Đang cân nhắc cơ hội"**
  Người dùng thấy gì: Khi một cơ hội bị từ chối hẳn hoặc một hạng mục đã được duyệt hướng đi nhưng chưa kịp viết hợp đồng chi tiết, bản đồ sản phẩm có thể hiển thị nhầm nó như đang chờ cân nhắc mở, khiến người xem hiểu sai tình trạng thật của hạng mục đó.
  file: `scripts/ci/check-product-map.mjs:175`
  severity: medium
  Đề xuất: new-contract

- **check-plan-docs.sh gọi lồng check-roadmap-fresh.sh, nuốt output và gộp vào một mã thoát chung**
  Người dùng thấy gì: Khi một kiểm tra sổ cái kế hoạch bên trong bị lỗi, người xem nhật ký CI chỉ thấy một dòng thông báo ngắn gọn không nêu rõ hồ sơ nào sai, khiến việc tìm và sửa nguyên nhân mất thêm thời gian.
  file: `scripts/roadmap/check-plan-docs.sh:143`
  severity: low
  Đề xuất: known-limits

- **PLAN_FREEZE_ROOT là knob chết — không caller nào dùng, và nó cho phép trỏ guard sang cây khác**
  Người dùng thấy gì: Có một tùy chọn cấu hình cho phép đổi thư mục mà công cụ kiểm tra kế hoạch sẽ đọc, nhưng chưa từng được kiểm chứng là hoạt động đúng — nếu sau này ai đó dựa vào nó, công cụ có thể âm thầm đọc nhầm thư mục mà vẫn báo ổn.
  file: `scripts/roadmap/check-plan-freeze.mjs:31`
  severity: low
  Đề xuất: known-limits

- **Killed/archived opportunities are classified as "still under consideration"**
  Người dùng thấy gì: Một cơ hội đã bị từ chối hẳn hoặc đưa vào lưu trữ có thể vẫn hiển thị trên bản đồ sản phẩm như đang được cân nhắc mở, khiến người đọc bản đồ tưởng nhầm nó vẫn còn sống.
  file: `scripts/ci/check-product-map.mjs:175`
  severity: high
  Đề xuất: new-contract

- **The `draft` bucket is computed but never checked — silent map drift**
  Người dùng thấy gì: Một hạng mục đang chờ duyệt phạm vi có thể biến mất khỏi bản đồ sản phẩm mà không ai được cảnh báo, vì công cụ kiểm tra không đối chiếu số lượng ở mục này.
  file: `scripts/ci/check-product-map.mjs:210`
  severity: medium
  Đề xuất: new-contract

- **Opportunity with unparsable frontmatter is binned as "cân nhắc" instead of the fail-closed `unclassified` bucket**
  Người dùng thấy gì: Khi phần thông tin đầu trang của một hồ sơ cơ hội bị hỏng định dạng, hệ thống vẫn báo lỗi và chặn đúng cách, nhưng lý do hiển thị cho người đọc bị ghi sai (nói là "đang cân nhắc" thay vì "không phân loại được").
  file: `scripts/ci/check-product-map.mjs:140`
  severity: low
  Đề xuất: known-limits

- **Nested ledger guard's output is discarded, leaving an unattributable FAIL line**
  Người dùng thấy gì: Người xem nhật ký CI có thể thấy một dòng lỗi ngắn gọn không nêu rõ hồ sơ nào sai khi một kiểm tra sổ cái lồng bên trong thất bại, làm chậm việc xác định nguyên nhân.
  file: `scripts/roadmap/check-plan-docs.sh:143`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP nhưng chỉ có điểm-case: F5 chỉ đo `decided_by`, bỏ trắng `decided_at`**
  Người dùng thấy gì: Nếu sau này phần kiểm tra ngày ký quyết định khi đóng một hạng mục bị hỏng, hiện chưa có bài kiểm nào phát hiện ra, nên lỗi có thể lọt vào sản phẩm mà không ai nhận biết.
  file: `scripts/roadmap/check-plan-freeze-teeth.sh:229`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 5 — lớp trạng thái đóng khai ba phần tử, `stage: archived` không có phép đo nào**
  Người dùng thấy gì: Nếu phần xử lý cho một hạng mục ở trạng thái lưu trữ trong công cụ kiểm tra bị xóa nhầm, hiện không có bài kiểm nào phát hiện ra, nên tính năng đóng kế hoạch cho loại này có thể âm thầm ngừng hoạt động đúng.
  file: `scripts/roadmap/check-plan-freeze-teeth.sh:25`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 — đoạn tỉ lệ có ba quan hệ, ca răng chỉ chạm một nhánh**
  Người dùng thấy gì: Nếu phần cộng tổng số hồ sơ trong đoạn thống kê tỉ lệ của tài liệu trạng thái dự án bị tính sai, hiện không có bài kiểm nào phát hiện, nên con số hiển thị cho người đọc có thể sai mà không ai biết.
  file: `scripts/roadmap/check-plan-docs-teeth.sh:91`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 — hai khẳng định `forbid` âm-tính-một-mình, không có đối chứng dương**
  Người dùng thấy gì: Hai quy tắc cấm nội dung cũ quay lại tài liệu trạng thái dự án có thể bị gõ sai mà không ai phát hiện, vì chưa có phép thử nào chứng minh chúng thực sự bắt được lỗi khi nội dung cấm xuất hiện lại.
  file: `scripts/roadmap/check-plan-docs.sh:79`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 1 — đo CHỈ DẪN thay vì đầu ra: chỉ grep khai báo suite key, không kiểm khoá có giải được**
  Người dùng thấy gì: Nếu tên khóa cấu hình cho luật đóng băng kế hoạch bị đổi hoặc gõ sai ở một chỗ khác trong cấu hình, hệ thống kiểm tra vẫn báo ổn trong khi luật đó thực ra không còn chạy được khi người phát triển tự kiểm tra ở máy mình.
  file: `scripts/roadmap/check-plan-suite-key.sh:18`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).