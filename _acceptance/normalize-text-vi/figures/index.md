# Điểm quyết định & bộ hình — normalize-text-vi (Cổng 1)

Kê từ artifact cuối S1, không hỏi người. Nguồn: `decisions.jsonl` (9 entry chờ seal) ·
design doc §3–§6 (chỗ lệch tiền lệ `compose-overlay`) · `contract.md` mục Coverage (không có
dòng `[GIẢ ĐỊNH]` nào — chân ngành đã tra được tên thật ngày 19/08, nên không có ô nào chờ
người gạch) · gap-probe (đang chạy; finding nào xử lý `human-gate1` sẽ bổ sung vào bảng này).

Ngưỡng N5: từ **ba bước nối tiếp** hoặc **hai nhánh rẽ** trở lên → cần hình.

**Trạng thái:** ba hình đã vẽ và đã xuất `.svg`/`.png`; vòng chính đã **nhìn bản `.png`**
(không đọc mã nguồn hình) — bố cục sạch, không đè chữ, nhãn khớp nguồn, không hình nào phải
vẽ lại. Một sửa duy nhất đã trả về: chú thích chân H1 còn ghi số AC trước lần đánh số lại
sau gap-probe.

| Điểm quyết định | Đếm | Hình |
|---|---|---|
| Logic chuẩn hoá ở đâu (SDK / repo plugin / tự viết) + chọn thư viện trong 4 ứng viên | 3 nhánh + 4 nhánh | **H1** |
| Cưỡng chế "đứng trước TTS": ở đâu (4 điểm) × mức nào (chặn/cảnh báo) + fan-out `textBatch` giữ dây chuyền | 4 bước nối tiếp, 2 nhánh rẽ | **H2** |
| Vào `TIER_A_SLOTS` ngay hay để hợp đồng sau (kịch bản "đổi giá 200 video") | 3 bước nối tiếp | **H3** |
| Chính sách 3 ca mơ hồ (`5/3` · `1.500` · `10-15`) | 2 nhánh × 3 ca | dưới ngưỡng cấu trúc — không có bước nối tiếp nào để vẽ; trình bằng **bảng** trong thẻ Cổng 1 (design §4) |
| Bỏ nghi thức design-pass ở S1-D | 2 nhánh | dưới ngưỡng: quyết định có/không, không có cấu trúc |
| Hoãn cưỡng chế tầng template sang 1.5 | 2 nhánh | dưới ngưỡng: quyết định có/không, không có cấu trúc |
| Cách xử lý hai lần hook S4 chặn oan | 2 nhánh | dưới ngưỡng: chuyện vận hành, không phải quyết định sản phẩm |

## Đề bài từng hình

### H1 — `logic-o-dau.html`
Loại: sơ đồ so sánh hai đường + bảng loại trừ.
- Nút: `input.text` → **tiền xử lý OneFlow** (từ điển ngành) → **vietnormalizer 0.2.3** (pinned)
  → **hậu kiểm không-còn-chữ-số** → `{success, text}` / `{success:false, error: token sót}`.
- Hai đường bao quanh cùng chuỗi đó: **A** = logic nằm trong repo plugin, corpus vàng chạy qua
  guard clone-and-pytest (có mũi tên ra ngoài kho, nhãn "cần mạng"); **B** ✅ = logic nằm trong
  `sdk/tongflow/text/`, corpus chạy trong suite SDK của chính kho (mũi tên khép kín trong kho).
- Khối phụ "4 ứng viên": `vietnormalizer 0.2.3` ✅ MIT/zero-dep · `vinorm 2.0.7` ❌ license
  non-commercial · `soe-vinorm 0.3.2` ❌ cần tải trọng số · tự viết ❌ ~400 dòng luật tự nuôi.
- AC liên quan: AC-2, AC-6, AC-7, AC-13 *(đánh số lại sau gap-probe: tiêu chí "đăng ký +
  release train" nay là AC-13; AC-14 nay là tiêu chí vỏ plugin gọi hàm SDK)*.

### H2 — `cuong-che-truoc-tts.html`
Loại: sơ đồ luồng có nhánh rẽ.
- Dây chuyền đúng luật: `split-text` →(fan-out N chuỗi, `textBatch`)→ `normalize-text-vi`
  →(N chuỗi đã đọc được)→ `text-gen-speech-*`. Nhãn trên mũi tên fan-out: "một lời gọi mỗi
  chuỗi — giống hệt node TTS".
- Nhánh vi phạm: `gen-text` → `text-gen-speech-*` (không qua normalize) → tới ô
  **`WorkflowExporter.export()`** → **CHẶN**, nhãn "nêu đúng id node vi phạm + việc phải làm".
- Ghi rõ ô "mức nghiêm ngặt = một hằng số, lật lại được" và ô mờ "cưỡng chế tầng template →
  hoãn tới hạng mục 1.5".
- AC liên quan: AC-9, AC-10.

### H3 — `tier-a-doi-gia.html`
Loại: sơ đồ ba lượt chạy nối tiếp.
- Lượt 1: `node tầng B` → `normalize-text-vi` → cả hai đều chạy, ghi cache.
- Lượt 2 (không đổi gì): cả hai **full hit**, 0 lời gọi plugin.
- Lượt 3 (đổi chuỗi `text` vào): node tầng B **không** chạy lại, `normalize-text-vi` chạy lại.
- Ô giá: "3 hồ sơ họ cache (l2/l3/l4) ký lại — bằng nghi thức re-pin một-lượt-lane".
- AC liên quan: AC-11.
