# Review Findings: lat-cat-chung-minh (round 4)

## Trong hợp đồng

(Không có finding nào ánh xạ được vào AC ở vòng này — ba finding trong hợp đồng của round 3, AC-11/AC-5/AC-15, đã được sửa.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Teeth fixtures pin today's snapshot values — the doc updates the sibling guard mandates turn CI red**
  Người dùng thấy gì: Các phép kiểm tự động cho báo cáo tiến độ có thể báo lỗi giả mỗi khi tài liệu được cập nhật đúng theo quy trình bình thường, dù không có gì thực sự sai — người xử lý sẽ mất thời gian xác minh báo động giả này.
  file: `scripts/roadmap/check-plan-docs-teeth.sh:60`
  severity: high
  Đề xuất: known-limits

- **check-product-map.mjs leaves the `draft` / "Chờ duyệt phạm vi" bucket unchecked — the fail-open its own header rails against**
  Người dùng thấy gì: Một hồ sơ đang ở trạng thái chờ duyệt phạm vi có thể biến mất khỏi bản đồ sản phẩm mà không ai được cảnh báo, vì công cụ kiểm tra không để ý đến nhóm hồ sơ này.
  file: `scripts/ci/check-product-map.mjs:209`
  severity: medium
  Đề xuất: new-contract

- **Broken or missing opportunity frontmatter is binned as "opportunity-only" instead of unclassified**
  Người dùng thấy gì: Nếu một hồ sơ cơ hội ghi thông tin quyết định bị lỗi định dạng hoặc sai tên trường, công cụ có thể âm thầm xếp nó vào nhóm 'đang cân nhắc' thay vì báo động để người phụ trách chú ý.
  file: `scripts/ci/check-product-map.mjs:141`
  severity: medium
  Đề xuất: known-limits

- **Guard root is overridable by ambient env, deviating from the repo's cwd-based fixture pattern; one seam is never exercised**
  Người dùng thấy gì: Một cài đặt môi trường bên ngoài hiếm gặp có thể khiến công cụ kiểm tra vô tình soi nhầm thư mục khác mà không cảnh báo, nhưng khả năng này chưa từng xảy ra trong thực tế và chưa được thử nghiệm.
  file: `scripts/roadmap/check-plan-docs.sh:15`
  severity: low
  Đề xuất: known-limits

- **CI runs four new guard steps but package.json exposes an alias for only two**
  Người dùng thấy gì: Người muốn tự chạy lại hai trong bốn bước kiểm tra mới ngay trên máy mình sẽ không tìm thấy lệnh rút gọn đã được ghi lại ở nơi quen thuộc, phải tự dò đường dẫn thủ công.
  file: `package.json:40`
  severity: low
  Đề xuất: known-limits

- **check-plan-docs.sh aborts silently (no FAIL line, 15 checks unreported) when signed contracts carry no approved_at**
  Người dùng thấy gì: Nếu có một hồ sơ đã ký duyệt nhưng thiếu ngày duyệt, công cụ kiểm tra có thể dừng đột ngột giữa chừng mà không báo lý do, khiến toàn bộ các phép kiểm còn lại bị bỏ sót mà không ai hay biết.
  file: `scripts/roadmap/check-plan-docs.sh:44`
  severity: high
  Đề xuất: known-limits

- **check-product-map.mjs never checks the `draft` bucket — a draft dossier is invisible and the checker stays green**
  Người dùng thấy gì: Một hồ sơ đang ở trạng thái chờ duyệt phạm vi có thể hoàn toàn vắng mặt trên bản đồ sản phẩm mà công cụ kiểm tra vẫn báo 'khớp, không có trôi', khiến người đọc bản đồ tin nhầm là đã đầy đủ.
  file: `scripts/ci/check-product-map.mjs:210`
  severity: high
  Đề xuất: new-contract

- **check-product-map.mjs classifies `decision: kill` / `stage: archived` as "still under consideration", contradicting check-plan-freeze.mjs in the same PR**
  Người dùng thấy gì: Một cơ hội đã bị từ chối hẳn hoặc đã đóng hồ sơ có thể vẫn hiển thị nhầm như đang được cân nhắc trên bản đồ sản phẩm, khiến người đọc hiểu sai về những gì thật sự còn mở.
  file: `scripts/ci/check-product-map.mjs:175`
  severity: medium
  Đề xuất: new-contract

- **check-plan-docs.sh swallows check-roadmap-fresh.sh's output and reports any failure cause as "guard sổ cái đỏ"**
  Người dùng thấy gì: Khi việc đối chiếu sổ cái lộ trình thất bại vì bất kỳ nguyên nhân nào, thông báo lỗi hiện ra đều giống nhau và không cho biết nguyên nhân thật, khiến người xử lý phải tự dò tìm.
  file: `scripts/roadmap/check-plan-docs.sh:143`
  severity: medium
  Đề xuất: known-limits

- **check-plan-freeze.mjs isOpen() treats a dossier with neither contract.md nor opportunity.md as closed, so F1 never sees it**
  Người dùng thấy gì: Một hồ sơ thiếu cả hai loại tài liệu cần thiết sẽ bị luật đóng băng coi như đã đóng và bỏ qua, dù đúng ra nó nên được coi là một hạng mục đang mở ngoài kế hoạch.
  file: `scripts/roadmap/check-plan-freeze.mjs:193`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — AC-17(b) tuyên một quan hệ HAI vế (mẫu số + tổng tử số) nhưng teeth chỉ đo vế mẫu số**
  Người dùng thấy gì: Một nửa của quy tắc kiểm tra tỉ lệ hồ sơ đã ký chưa từng được thử nghiệm thực tế, nên nếu phần đó âm thầm hỏng trong tương lai, sẽ không có cảnh báo nào cho tới khi xảy ra sự cố thật.
  file: `scripts/roadmap/check-plan-docs-teeth.sh:87`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa gỡ băng là QUAN HỆ (≥ 85%) nhưng assert duy nhất là chuỗi ở mốc 100%**
  Người dùng thấy gì: Ngưỡng phần trăm quyết định khi nào kế hoạch được 'gỡ băng' chưa từng được thử nghiệm sát ngưỡng thật, nên không có gì đảm bảo con số ngưỡng đó hoạt động đúng như đã công bố.
  file: `scripts/roadmap/check-plan-freeze-teeth.sh:407`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — AC-17(c) tuyên một luật CÓ ĐIỀU KIỆN hai nhánh, teeth chỉ có ca cho nhánh cho phép**
  Người dùng thấy gì: Một trong hai chiều của luật cấm nhắc đến mã tham chiếu thiết kế (ADR-0013) chưa từng được thử nghiệm, nên nếu chiều đó bị hỏng, việc kiểm tra tài liệu sẽ không phát hiện ra.
  file: `scripts/roadmap/check-plan-docs-teeth.sh:105`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — case_go_bang ghim mẫu số 20 mà chính guard tính được, nên van an toàn mở là teeth đỏ oan**
  Người dùng thấy gì: Việc mở van an toàn hợp lệ cho luật đóng băng — thêm một ngoại lệ hợp lệ — có thể vô tình khiến bài kiểm tra 'gỡ băng' báo lỗi giả trong một số kịch bản kết hợp cụ thể ở tương lai, dù bản thân hành động đó không sai.
  file: `scripts/roadmap/check-plan-freeze-teeth.sh:407`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — E9 khai một chiều đỏ không tồn tại: gỡ tên khỏi GUARD_NEEDLES thì mode shape vẫn XANH**
  Người dùng thấy gì: Một ghi chú mô tả trong tài liệu kiểm tra khẳng định công cụ có khả năng phát hiện một loại lỗi mà thực tế nó không phát hiện được, khiến người đọc tin tưởng nhầm vào mức độ chắc chắn của hàng rào kiểm tra.
  file: `_acceptance/lat-cat-chung-minh/evals.yaml:103`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — ca dựng để chứng minh «đếm trên cây, đừng grep hằng số» lại ghim hằng số 36/37 trong khẳng định của chính nó**
  Người dùng thấy gì: Bài kiểm tra được viết ra để chứng minh nguyên tắc 'đếm trên thực tế, đừng ghim số cứng' lại tự ghim đúng con số cứng đó trong chính khẳng định của nó, nên nó sẽ tự báo lỗi giả ngay khi có thêm hồ sơ mới ký duyệt trong tương lai.
  file: `scripts/roadmap/check-plan-docs-teeth.sh:100`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/16 lỗi rơi vào file không bộ đo nào phủ (package.json, _acceptance/lat-cat-chung-minh/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
