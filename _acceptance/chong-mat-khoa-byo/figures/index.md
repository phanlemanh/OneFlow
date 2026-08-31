# Điểm quyết định — chong-mat-khoa-byo (Cổng 1)

Ngưỡng N5: «cần hình» khi điểm có ≥3 bước nối tiếp HOẶC ≥2 nhánh rẽ.

| Điểm | Đếm | Hình |
|---|---|---|
| Bộ đọc ba trạng thái × ba nhóm nơi gọi | 6 trạng thái kho → 3 kết quả → 3 nhóm dùng khác nhau: **nhiều nhánh** | ✅ Hình 1 |
| Đường thoát có ý thức (kho hỏng → từ chối → nút → xác nhận → ghi đè) | **5 bước nối tiếp** | ✅ Hình 2 |
| Nhận hạng T3 thay vì đường T2 | nhị phân, 0 nhánh | dưới ngưỡng |
| Không giữ bản hỏng | nhị phân | dưới ngưỡng |
| Executor `test` thay vì `script` cho 2 phép đo | nhị phân | dưới ngưỡng |
| Nhóm Đọc-để-chạy giữ nguyên | nằm trong Hình 1 | dưới ngưỡng (đã phủ) |
| Bản mẫu dừng ở `static-frame` | nhị phân | dưới ngưỡng |

**Đề bài Hình 1** — luồng: 6 trạng thái kho → `readEnvStore` → 3 kết quả; nhánh
`unreadable` rẽ tiếp theo nhóm nơi gọi (Ghi → 409 · Đọc-để-hiện → 503 ·
Đọc-để-chạy → `{}`, không đổi). Nhãn bằng chữ. Liên quan AC-2, AC-3, AC-4.

**Đề bài Hình 2** — luồng 5 bước: kho hỏng → PUT không cờ trả 409, đĩa không đổi
→ màn Cài đặt hiện tấm lỗi, Lưu tắt → người dùng bấm nút thoát → hộp xác nhận
nêu «mất và không khôi phục được» → PUT kèm cờ, ghi đè. Liên quan AC-6, AC-10,
AC-11.

**Cách vẽ đã dùng:** khối mermaid trong design doc (mặt phẳng «tài liệu trong
kho»), không dispatch agent vẽ riêng — phiên này đang chạy dưới ràng buộc
«không dùng agent khi chưa được yêu cầu», và hai hình này đủ đơn giản để mermaid
tải được. Nếu owner muốn bản SVG/PNG dựng bằng `diagram-design`, nói một tiếng.
