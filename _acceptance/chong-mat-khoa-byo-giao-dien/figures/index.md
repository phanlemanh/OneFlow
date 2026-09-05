# Điểm quyết định — chong-mat-khoa-byo-giao-dien (Cổng 1)

Kê từ artifact cuối S1: 5 entry sổ quyết định chờ seal · 1 dòng `[GIẢ ĐỊNH]` trong
Coverage · 4 finding Nhóm 2 của design-pass. gap-probe không để lại finding nào
`human-gate1` (cả năm đã vá).

| Điểm | Đếm | Hình |
|---|---|---|
| D1 — một bộ đọc chung fail-closed cho ba bề mặt | 3 bề mặt → 1 bộ đọc → 5 hình dạng câu trả lời → 2 lối ra: **nhiều nhánh** | **F1** |
| D3 — nút thoát = ghi đè kho rỗng | chặn → bấm thoát → hộp xác nhận → xác nhận → PUT có cờ → refetch → bình thường: **6 bước nối tiếp** | **F2** |
| Nhóm 2 #1 — lỗ trục sáng/tối lan sang 2 hồ sơ ĐÃ KÝ | script khởi động → localStorage rỗng → OS ưa tối → `.dark` ở `<html>` → cả hai nửa vẽ tối → `curl` vẫn báo hai theme: **6 bước** | **F3** |
| D2 — một ô đo = một tệp, không dùng `-t` | 2 nhánh (bộ lọc khớp / không khớp) | không vẽ riêng — cơ chế đã nằm trong chú thích F1; một dòng ở thẻ là đủ |
| D4 — 76 khoá `ja` vào allowlist đóng băng | 2 nhánh (trong / ngoài allowlist) | không vẽ riêng — chính sách một dòng, hình không thêm gì |
| D5 — không dọn `KEY_PROMPT_LABELS` ghi cứng | 0 nhánh — một dòng phạm vi | dưới ngưỡng |
| `[GIẢ ĐỊNH]` vỏ cloud | 2 nhánh (OSS/desktop · vỏ cloud) — nhánh cloud KHÔNG có thước trên máy này | không vẽ — vẽ một nhánh không đo được sẽ khiến nó trông như đã khảo sát |

## Đề bài từng hình

### F1 — Một bộ đọc, ba bề mặt, năm hình dạng
Loại: sơ đồ luồng dữ liệu (fan-in rồi rẽ nhánh).
Nút: `settings-dialog` · `media-library-config-panel` · `abi-node-shell` (ba bề mặt,
xếp chồng bên trái) → `readEnvForBrowser()` (một hộp ở giữa, ghi rõ **cổng khẳng định
dương**) → năm nhánh câu trả lời: `200 + env hợp lệ` · `503 + mã` · `500/502` ·
`200 thân không dùng được` · `fetch ném`. Nhánh đầu → `state: ok`; **bốn nhánh còn
lại gộp về** `state: unreadable`. Từ `unreadable` rẽ tiếp hai lối ra: **màn Cài đặt**
= tấm chặn + nút Lưu TẮT + đúng 1 nút thoát; **hai panel node** = tấm chặn + lối sang
Cài đặt, **0 nút thoát**.
Nhãn cần có bằng chữ: "cổng là khẳng định DƯƠNG — chỉ 200 ∧ parse được ∧ `env` là
object mới đi nhánh ok"; "lượt ghi mang cờ chỉ dựng được ở màn Cài đặt".
AC liên quan: AC-10, AC-12. Ô đo: E2/E3/E6/E7/E11.

### F2 — Lối thoát huỷ-diệt
Loại: sơ đồ trình tự (6 bước, hai làn: Người ↔ Trình duyệt ↔ Máy chủ).
Bước: mở màn → `GET` trả lỗi → tấm chặn (Lưu TẮT) → bấm thoát → hộp xác nhận nói
"mọi khoá đang lưu sẽ mất và **không khôi phục được**" → xác nhận → **đúng 1**
`PUT {env:{}, replaceUnreadableStore:true}` → 200 → refetch → form bình thường, trống.
Phải vẽ rõ hai bất biến: **không có `PUT` nào không cờ ở bất kỳ đâu trước đó**, và
**bấm đúp vẫn ra đúng một `PUT`** (chốt một-chuyến).
Vẽ thêm nhánh huỷ: bấm "Để nguyên" → 0 `PUT`, quay về tấm chặn.
AC liên quan: AC-11. Ô đo: E4/E5.

### F3 — Vì sao nửa "sáng" chưa bao giờ sáng
Loại: sơ đồ nguyên nhân — hai làn song song, "cái máy chủ GỬI" vs "cái trình duyệt VẼ".
Làn trên (máy chủ gửi): URL trần → HTML **không** có `class="dark"`; URL `theme=dark`
→ HTML **có**. `curl` đọc làn này → kết luận "3 sáng + 3 tối" → **cho qua**.
Làn dưới (trình duyệt vẽ): `layout.tsx` script khởi động → `localStorage.theme` rỗng
→ `prefers-color-scheme: dark` → thêm `.dark` vào `<html>` → **cả hai** URL vẽ tối.
Chốt: mũi tên "đo sai làn" từ `curl` sang làn dưới, ghi con số đo được 01/09 —
URL trần vẽ `<html class="dark">` trong khi `curl` đếm **0** lần `class="dark"`.
Vá: hộp "route ghim theme khi tham số CÓ MẶT" + hộp "wrapper đọc lại từ DOM đã render
qua `ui-capture --html`".
Đánh dấu rõ ba hồ sơ: **hồ sơ này = đã vá**; `media-library` = đọc lại nhưng SAI LÀN;
`onboarding` = **không có phép đọc lại nào**.
