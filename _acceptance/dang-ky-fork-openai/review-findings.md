## Trong hợp đồng

(không có finding nào map được vào AC ở vòng này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **CLAUDE.md nói bộ răng có 8 ca / PARTIAL: n/8; script thực tế có 7**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ ghi sai số lượng kịch bản kiểm tra tự động (nói 8 nhưng thực tế 7), khiến người đọc tài liệu hiểu nhầm mức độ đã được kiểm chứng — không ảnh hưởng người dùng cuối sản phẩm.
  file: `CLAUDE.md`
  severity: high
  Đề xuất: known-limits

- **evidence-report.md còn E9/E10/E11 cho AC-9/AC-10 đã bị rút, trỏ executor và script đã xoá**
  Người dùng thấy gì: Báo cáo bằng chứng còn lưu kết quả cho hai tiêu chí đã bị hủy bỏ trong quá trình phát triển, khiến báo cáo chứa thông tin không còn khớp với hiện trạng — có thể gây hiểu nhầm cho người xét duyệt, nhưng quyết định cuối cùng đã là từ chối nên không ảnh hưởng người dùng.
  file: `_acceptance/dang-ky-fork-openai/evidence-report.md`
  severity: high
  Đề xuất: known-limits

- **Bằng chứng E5/E11 ghi output `OK: 8/8 ca` + `CASE orphan-them-moi: PASS`, mâu thuẫn expected của chính evals.yaml**
  Người dùng thấy gì: Báo cáo bằng chứng lưu lại kết quả kiểm tra từ một phiên bản cũ, không còn khớp với công cụ kiểm tra hiện tại, khiến người đọc dễ hiểu nhầm mức độ đã được xác minh.
  file: `_acceptance/dang-ky-fork-openai/evidence-report.md`
  severity: high
  Đề xuất: known-limits

- **evals.yaml E7 khai chiều đỏ bằng một ca đã bị rút, mâu thuẫn với chính E5**
  Người dùng thấy gì: Tài liệu mô tả tiêu chí kiểm tra vẫn viện dẫn một kịch bản thử lỗi đã bị rút bỏ như thể nó còn tồn tại, khiến người đọc tin nhầm rằng một tình huống lỗi đã được kiểm chứng dù thực tế chưa từng được kiểm.
  file: `_acceptance/dang-ky-fork-openai/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Comment header của guard nói base có 4 icon lạc; đo thật là 3**
  Người dùng thấy gì: Chú thích trong công cụ kiểm tra nêu sai số lượng tệp biểu tượng cũ còn sót lại từ trước, khiến người bảo trì sau này đọc nhầm quy mô nợ kỹ thuật — không ảnh hưởng đến việc kiểm tra có hoạt động đúng hay không.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: medium
  Đề xuất: known-limits

- **Bộ răng manifest có sẵn in "a 37th plain string" sau khi PR này hạ 36 → 35**
  Người dùng thấy gì: Nhãn mô tả trong một bước kiểm tra tự động không còn khớp con số sau khi thay đổi cấu hình, khiến người đọc nhật ký kiểm tra hiểu sai một chi tiết nhỏ — không ảnh hưởng đến việc lỗi có được phát hiện hay không.
  file: `scripts/plugins/check-manifest-guard-teeth.sh`
  severity: low
  Đề xuất: known-limits

- **Bộ răng chỉ có đối chứng dương cho mode `readme`; mode `claude` có ca đỏ mà không có ca xanh**
  Người dùng thấy gì: Một nhánh của bộ kiểm tra tự động chỉ có các ca thử lỗi mà thiếu ca xác nhận trạng thái lành hoạt động đúng, nên nếu nhánh đó bị hỏng thành luôn báo lỗi, hệ thống sẽ không phát hiện ra — rủi ro chỉ ảnh hưởng độ tin cậy quy trình kiểm tra nội bộ.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh`
  severity: low
  Đề xuất: known-limits

- **CLAUDE.md documents the teeth harness as 8 cases / PARTIAL: n/8; it is 7 and prints PARTIAL: 1/7**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ ghi sai số lượng kịch bản kiểm tra tự động, khiến người đọc hiểu nhầm mức độ đã được kiểm chứng — không ảnh hưởng người dùng cuối sản phẩm.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **readme mode dedupes by plugin id, so a duplicated README entry with the wrong org passes silently**
  Người dùng thấy gì: Nếu tài liệu danh sách plugin bị chỉnh sửa để liệt kê trùng một plugin hai lần với nguồn khác nhau, công cụ kiểm tra tự động có thể bỏ sót dòng sai và không cảnh báo — người dùng có nguy cơ bị dẫn tới một nguồn plugin không chính thức mà không có gì ngăn chặn.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: medium
  Đề xuất: new-contract

- **Header comment claims four pre-existing orphan icons on origin/main; the mode measures three**
  Người dùng thấy gì: Chú thích trong công cụ kiểm tra nêu sai số lượng tệp biểu tượng cũ còn sót từ trước, gây hiểu nhầm nhỏ cho người bảo trì sau này — không ảnh hưởng người dùng cuối.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: low
  Đề xuất: known-limits

- **Evidence report records teeth output the current script cannot produce (8/8, orphan-them-moi)**
  Người dùng thấy gì: Báo cáo bằng chứng lưu lại kết quả kiểm tra cũ, không còn khớp với công cụ kiểm tra hiện tại, khiến người đọc dễ hiểu nhầm mức độ đã được xác minh.
  file: `_acceptance/dang-ky-fork-openai/evidence-report.md`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: E7 (chế độ `orphans`) không có chiều đỏ, và chiều đỏ nó viện dẫn đã bị rút**
  Người dùng thấy gì: Tài liệu mô tả tiêu chí vẫn viện dẫn một kịch bản thử lỗi đã bị rút bỏ, và phần ghi chú hạn chế đã biết trong báo cáo lại bị bỏ trống — khiến hồ sơ trông đầy đủ hơn thực tế, dù bản thân giới hạn này đã được chấp nhận từ trước.
  file: `_acceptance/dang-ky-fork-openai/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: chế độ `claude` chỉ có ca phá, không có đối chứng dương**
  Người dùng thấy gì: Một nhánh của bộ kiểm tra tự động thiếu ca xác nhận trạng thái lành hoạt động đúng, nên nếu nhánh đó âm thầm hỏng thành luôn báo lỗi, không có phép đo nào phát hiện ra — rủi ro chỉ ảnh hưởng độ tin cậy quy trình kiểm tra nội bộ.
  file: `scripts/plugins/check-live-docs-manifest-teeth.sh`
  severity: medium
  Đề xuất: known-limits

- **Ma trận ca thiếu một nhánh lỗi của chính hàng rào: nhánh `repo` không có ca phá**
  Người dùng thấy gì: Bộ kiểm tra tự động cho tài liệu danh sách plugin chưa có kịch bản thử cho trường hợp tên plugin đúng nhưng đường dẫn nguồn bị sai lệch — kiểu lỗi này có thể lọt qua mà không ai phát hiện, dù các kiểu lỗi khác đã được kiểm chứng.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: medium
  Đề xuất: new-contract

- **Tuyên số ca lớn hơn số ca thật: CLAUDE.md ghi bộ răng có 8 ca và in `PARTIAL: n/8`**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ ghi sai số lượng kịch bản kiểm tra tự động, khiến người đọc hiểu nhầm mức độ đã được kiểm chứng — không ảnh hưởng người dùng cuối sản phẩm.
  file: `CLAUDE.md`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/15 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dang-ky-fork-openai/evidence-report.md, _acceptance/dang-ky-fork-openai/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.