# Hình tại điểm quyết định — Cổng 1, lat-cat-chung-minh (04/09)

Kê từ artifact cuối S1, không hỏi người. Nguồn: 6 entry sổ quyết định chờ seal ·
gap-probe (0 finding xử lý `human-gate1`, 5/5 `fixed`) · Coverage không có dòng `[GIẢ ĐỊNH]` ·
design không lệch spec gốc.

Ngưỡng N5: **từ ba bước nối tiếp, hoặc từ hai nhánh rẽ** → cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| Vòng đời luật đóng băng (đóng băng → làm việc → gỡ băng; ba nhánh: ngoại lệ · mốc tái hoạch · vi phạm) | 3 bước nối tiếp + 3 nhánh rẽ | **vong-doi-dong-bang** |
| lcm5 — xin chữ ký Cổng 1 thật thay vì đường tự-đi-tiếp của T2 | 2 nhánh rẽ | gộp vào cùng hình (nhánh "cổng người") |
| lcm1 — bỏ case răng cho khoá `closed:` | dưới ngưỡng: 1 | — |
| lcm2 — `decided_by`/`decided_at` là trường người | dưới ngưỡng: 1 | — |
| lcm3 — bỏ đặc-tả-UX (không chạm UI) | dưới ngưỡng: 1 | — |
| lcm4 — bỏ coverage-scan bằng skill | dưới ngưỡng: 1 | — |
| lcm6 — 5 finding gap-probe đều `fixed` | dưới ngưỡng: 1 | — |

## Đề bài hình `vong-doi-dong-bang`

- **Loại:** state machine (sơ đồ trạng thái).
- **Nút:** `Còn băng` · `GỠ BĂNG` · năm phán quyết `F0 F1 F2 F3 F4` · `Ngoại lệ có tên` · `Mốc tái hoạch 09/10`.
- **Nhãn bằng chữ, không mã:** F0 khối hỏng, fail-closed · F1 ô mở ngoài kế hoạch · F2 dấu ✅ nói dối · F3 khai park mà hồ sơ chưa park · F4 ngoại lệ không có lý do có tên.
- **Điều kiện chuyển:** `Còn băng` → `GỠ BĂNG` khi **16/16 ★ và ≥ 85% tổng dòng**. Ngoại lệ (mất-dữ-liệu · bảo-mật · chặn-★) nạp slug vào tập cho phép của F1 **và cộng vào mẫu số**. Mốc 09/10 chỉ in NOTE, không đổi mã thoát.
- **AC liên quan:** AC-1 (mẫu số động) · AC-2 (F1) · AC-5 (F4 + van ngoại lệ hai chiều) · AC-6 (gỡ băng) · AC-7 (NOTE mốc) · AC-8 (F0).
