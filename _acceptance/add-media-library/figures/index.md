# Hình tại điểm quyết định — Cổng 1, add-media-library

Kê từ artifact cuối S1 (sổ quyết định chờ seal + chỗ thiết kế lệch khuôn sẵn có).
Ngưỡng N5: một điểm cần hình khi giải thích nó phải đi qua **≥3 bước nối tiếp**
hoặc **≥2 chỗ rẽ nhánh**.

| Điểm | Đếm | Hình |
|---|---|---|
| QĐ-1 · đường client→server bằng route handler | 5 bước nối tiếp (node → route → lib → REST → kho file) | **F1** |
| QĐ-4 · ghim `contracts_version` theo dòng 0.2 | 2 chỗ rẽ (major khác · 0.x minor khác) | **F1** (nhánh trong cùng hình) |
| QĐ-2 · giai đoạn A khoá `media_type: video` | 2 chỗ rẽ (bảng tĩnh C · handle động E) | **F2** |
| QĐ-3 · tự viết đường tải có chặn thay vì `downloadAndSave` | dưới ngưỡng: 1 | — |
| QĐ-5 · bỏ design-pass (owner vắng) | dưới ngưỡng: 1 | — |
| QĐ-6 · descope ảnh/audio/floorplan | dưới ngưỡng: 1 | — |

Thêm **F3** ngoài diện quyết định: ma trận **bảy trạng thái** của node. Không phải
hình của một quyết định, mà là thứ bù cho việc bỏ design-pass — Cổng 1 vốn phải
duyệt UI trên bản bấm được; ở đây người ký ít nhất được nhìn hình hài từng trạng
thái thay vì đọc chữ.

## Đề bài từng hình

**F1 — vòng đời một lời gọi, và nơi bốn bảo đảm bị ép**
- Loại: sơ đồ luồng có làn (lane) — làn OneFlow client · làn OneFlow server · làn media-library.
- Nút: node canvas → `POST /api/media-library/search` → `client.server` → `POST /v1/search`
  → thẻ trả về → chọn thẻ → `POST /api/media-library/import` → `GET /v1/assets/:id`
  → tải bytes qua `urls.original` → `saveFile()` → `file_key` → nở `videoNode`.
- Nhãn bằng chữ, gắn đúng chỗ ép: **#2** ở chặng đọc kho khoá (thiếu → dừng, gọi
  đúng tên biến, 0 lời gọi mạng) · **#7** ở chỗ nhận response (rẽ: major khác → từ
  chối; 0.x minor khác → từ chối; khớp → đi tiếp) · **#1** ở mũi tên tải bytes (chỉ
  qua URL ký, chỉ https, có trần) · **#3** ở chỗ render thẻ (mọi từ vựng là chuỗi mờ).
- AC liên quan: AC-1, AC-3, AC-9, AC-13.

**F2 — hai đường cho modality, vì sao chọn C**
- Loại: sơ đồ so hai phương án cạnh nhau.
- Nút: bên trái «C — bảng tĩnh»: `ADD_NODE_OUTPUT_TYPE[addMediaLibraryNode] = videoNode`,
  request ghim `media_type: video`, kết quả không bao giờ hiện thứ không nạp được.
  Bên phải «E — handle động»: sửa `getEffectiveOutputType` đọc `out:<loại>`, đổi
  ngữ nghĩa dùng chung cho **cả bảy add node đang chạy**, trong file T3, hôm nay
  không eval nào phủ.
- Nhãn: bên C ghi «lát cắt, mở lại khi skill #2 cần ảnh»; bên E ghi «vẫn còn đó».
- AC liên quan: AC-12; ledger QĐ-2 + QĐ-6.

**F3 — bảy trạng thái của node**
- Loại: ma trận trạng thái (lưới), mỗi ô một khung hình hài đơn giản.
- Bảy ô: thiếu-cấu-hình (nêu tên biến) · rỗng/chờ gõ · đang tìm · có kết quả (thẻ
  kèm nhãn quyền) · kệ mỏng · kết quả không xếp hạng (có dải cảnh báo) · đang nạp ·
  lỗi có tên (401 / 403 thiếu scope / lệch phiên bản).
- Nhãn: mỗi ô ghi câu người dùng đọc được, để Cổng 1 duyệt được lời văn.
- AC liên quan: AC-1, AC-4, AC-5, AC-6, AC-8, AC-15.
