---
slug: chong-doc-sai-em-ru
at: 2026-08-27T11:52:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
claims_input: ok
---

# Phản biện context sạch — chống đọc sai êm ru

Một agent tươi, chỉ đọc bốn artifact (thiết kế · hợp đồng · bảng ô kiểm · corpus bài học từ
feature trước), **không** đọc mã nguồn. Năm lỗ, tất cả đã sửa ngay ở artifact.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | AC-6 gắn nhãn cross-layer nhưng không ô nào đo ĐẦU RA THẬT: E10 đo SDK sinh mã, E11 là grep tĩnh đo khai-báo. E11 cũng là ô duy nhất thiếu chiều đỏ | Thêm đủ 3 khoá vào 5 locale, nhưng chỗ hiển thị viết `err.message ?? t(err.code)` — câu tiếng Việt ra mặt người qua BIẾN lúc chạy, không phải literal. grep tĩnh không thấy → E11 xanh; E10 xanh vì SDK vẫn sinh mã đúng. Người dùng en/ja đọc nguyên câu tiếng Việt, AC-6 xanh trên hồ sơ | Ô mới ép locale ≠ vi, chạy đường từ chối thật, assert quan hệ chuỗi-hiển-thị == giá trị khoá i18n + không ký tự có dấu ngoài danh sách trắng | **fixed:** thêm **E15** (khoá `unit_normalize_error_i18n_render`, `layer: backend-effect`) + bổ sung chiều đỏ cho E11 (xoá khoá một locale → đỏ nêu đúng locale + mã) |
| P1 | evals | E2, E4, E5 dùng CHUNG một khoá lệnh — ba dòng bằng chứng thực chất là một exit code | Làm xong ma trận ô-Đ (AC-11) nhưng chưa viết ca gạch kiểu chữ (AC-1) và chưa gỡ giới hạn ISO (AC-3): lệnh vẫn exit 0, Cổng 2 thấy ba tiêu chí xanh trong khi hai chưa hề được đo | Tách ba khoá trỏ node-id pytest riêng | **fixed:** thêm `sdk_pytest_normalize_typographic_dash` (E4), `sdk_pytest_normalize_range_shapes` (E5), `sdk_pytest_normalize_error_codes` (E10); `..._ambiguous` chỉ còn của E2 — nay **không khoá nào dùng chung** |
| P1 | evals + contract | AC-12 hứa điều người dùng thấy, điều kiện lấy từ `nodePluginMap` (tầng registry) nhưng chỉ gắn nhãn (web-ui) và chỉ có E14 — unit test tiêm map vào hàm | Cả hai nửa cặp hai chiều xanh, nhưng chỗ gọi quên truyền map (mặc định `{}`), gọi trước lúc registry quét xong, hoặc tự tính điều kiện riêng → toast vẫn hiện vô điều kiện. Đúng lớp "hàm đúng, quên chỗ gọi" `[normalize-text-vi#F1]` | Ô đo chỗ gọi: spy chứng minh map đến từ chính registry; cặp hai chiều tại chỗ gọi | **fixed:** AC-12 đổi nhãn sang **(cross-layer)**; thêm **E16** (khoá `unit_tts_warning_call_site`, `layer: backend-effect`) |
| P1 | evals | Nhóm A tuyên LỚP nhưng đo bằng ca lẻ: E4 nói "toàn corpus" mà không khai ma trận {3 ký tự} × {3 vai}; E5 đo bằng vắng-mặt-chuỗi trong khi lời hứa là quan hệ | (a) Vá nhánh khoảng mà quên nhánh âm: `−7 độ` (ô đã ghim) xanh, `–7 độ` vẫn sai, không ô nào bắt `[normalize-text-vi#F2]`. (b) `0901-234-567` đọc mất một chữ số, không có chữ "đến", `ok=True` → E5 xanh, đúng lớp lỗi hợp đồng lập ra để chặn | E4: ma trận 9 ô + chốt chống-tương-đương-rỗng. E5: quan hệ bảo toàn số chữ số | **fixed:** cả hai `expected` viết lại |
| P2 | contract | Coverage thiếu trục cho AC-9 và AC-10 — hai tiêu chí mô tả đúng cơ chế trung tâm (hậu kiểm chỉ soi `[0-9₫%]` nên `/` thư viện bỏ lại thì mù) | Một lượt cắt phạm vi gỡ AC-9/AC-10; không dòng trục nào chuyển sang trống nên bản đồ phủ vẫn trông đủ, và tính năng ký nghiệm thu với đúng lỗ hổng nó sinh ra để bịt | Thêm trục tường minh | **fixed:** thêm **Trục hậu kiểm mù** vào Coverage |

## Sau khi sửa — kiểm chéo lại bằng máy

- 12 tiêu chí, **16 ô kiểm**, không tiêu chí nào thiếu ô (`eval-coverage-lint`: no gaps)
- Hai tiêu chí `(cross-layer)` — AC-6 và AC-12 — **đều** có ô ở lớp sau (`layer: backend-effect`)
- **Không khoá lệnh nào dùng chung** giữa hai ô khác tiêu chí
- Mỗi ô có `paths` khai và chiều đỏ viết trong `expected`

Nửa kiến nghị **không** lấy: đề xuất thêm quy tắc lint "mỗi AC phải xuất hiện trong một dòng
Coverage" — đó là việc của bộ cổng chung, không phải của hợp đồng này; ghi lại ở đây để đợt
nâng kit đọc bằng số thay vì bằng trí nhớ.
