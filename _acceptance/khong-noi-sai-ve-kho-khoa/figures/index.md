# Hình tại điểm quyết định — Cổng 1, khong-noi-sai-ve-kho-khoa (T3)

Kê từ artifact cuối S1: 7 entry sổ quyết định chờ seal · 0 lệch spec · 0 dòng
`[GIẢ ĐỊNH]` trong Coverage · 0 finding gap-probe `human-gate1`. Ngưỡng N5: cần hình khi
điểm có ≥ 3 bước nối tiếp hoặc ≥ 2 nhánh rẽ.

| Điểm | Đếm | Hình |
|---|---|---|
| Hẹp bây giờ, sâu thành hồ sơ sau (PUT ghi đè toàn phần) | 2 nhánh rẽ (hợp nhất ở client / ở server) | **H1** |
| Server kiểm tiền đề của cờ (AC-1) | 3 trạng thái kho × cờ = 3 nhánh + đua | **H2** |
| Client phân loại dương cả hai chiều (AC-2) → hành động theo bề mặt (AC-5) | 10 tín hiệu → 4 state → 3 bề mặt | **H3** |
| Client đọc lại khi 409 REPLACE_REFUSED (AC-7) | 4 bước nối tiếp | gộp vào **H2** (chuỗi dưới cây quyết định) |
| Seam thành helper dùng chung | 2 caller | dưới ngưỡng: 2 nhánh nhưng là cấu trúc mã, không phải luồng người — chữ đủ |
| 403 → unavailable, seam chỉ 401 | 1 rẽ | dưới ngưỡng: 1 |
| Descope Ngoài-3/7 (ghi hỏng → tick xanh) | 0 | dưới ngưỡng: 0 — quyết định «không làm» |
| Descope đường-đo | 0 | dưới ngưỡng: 0 |
| Design-pass: hướng A vs B | 2 nhánh | đã có vật: cảnh `divergence` trong `evidence/design-pass/` — không vẽ lại |

## Đề bài

### H1 — `h1-hep-hay-sau.html` · loại: quadrant/so-sánh hai kiến trúc
- Nút: Client · Server · Kho (tệp). Hai cột: «Hôm nay + vòng này (hẹp)» / «Hồ sơ kế (sâu)».
- Nhãn: cột trái — client ĐỌC → hợp nhất ở client → PUT thân đầy đủ → server ghi đè toàn phần; ô đỏ nhỏ «PUT {env:{}} không cờ vẫn xoá kho lành — Known limit có tên». Cột phải — client PUT «đặt/xoá khoá» → server ĐỌC-HỢP-GHI → không lượt đọc client nào là load-bearing.
- AC liên quan: AC-1, AC-7; Out of scope mục 1.

### H2 — `h2-server-tien-de.html` · loại: cây quyết định + chuỗi ngắn bên dưới
- Cây: `PUT` tới → `readEnvStore()` → ba nhánh `ok` / `absent` / `unreadable` × cờ bật/tắt → lối ra: `409 ENV_STORE_UNREADABLE` (unreadable ∧ ¬cờ) · `409 ENV_STORE_REPLACE_REFUSED, không ghi` (ok|absent ∧ cờ) · `200, kho={}` (unreadable ∧ cờ) · `200 ghi` (ok|absent ∧ ¬cờ).
- Chuỗi dưới (AC-7 + đua): client đọc → unreadable → [tab khác sửa kho] → bấm xác nhận → PUT có cờ → 409 REFUSED → client đọc lại → form có khoá. Ghi chú: «đua ra đúng kết cục mà không cần luật riêng».
- AC liên quan: AC-1, AC-7.

### H3 — `h3-phan-loai-va-be-mat.html` · loại: sankey/luồng ba tầng
- Tầng 1 (10 tín hiệu): 200+env · 503+code · 401 · 403 · 500 · 502-html · not-json · env-sai-hình · mạng rớt · quá trần.
- Tầng 2 (4 state): ok · store-unreadable · unauthenticated · unavailable. Chỉ 503+code → store-unreadable; chỉ 401 → unauthenticated; 200+env → ok; sáu còn lại → unavailable. Đánh dấu «dương cả hai chiều».
- Tầng 3 (3 bề mặt × hành động): Cài đặt / node key prompt / ML panel — ô duy nhất có nút phá huỷ: Cài đặt × store-unreadable; Thử lại ở mọi ô không-ok; PUT = 0 ở mọi ô không-ok. Ghi chú nhỏ: 401 → bắn `tf:unauthorized` (403 không).
- AC liên quan: AC-2, AC-3, AC-5, AC-6.

Xuất: mỗi hình `.html` + `.png` cạnh nhau trong thư mục này. Hình là chiếu của contract/design,
không thêm nút nào không có trong hai tệp đó.
