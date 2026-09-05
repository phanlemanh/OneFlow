# Điểm quyết định — kê và đếm ngưỡng

Ngưỡng N5: **từ ba bước nối tiếp hoặc từ hai nhánh rẽ trở lên** → cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| Bỏ đặc-tả-UX (descope, chờ seal) | 1 nhánh — feature không chạm UI | dưới ngưỡng |
| Bỏ design-pass (descope, chờ seal) | 1 nhánh — cùng lý do | dưới ngưỡng |
| Chọn kiểm điều kiện tiên quyết thay vì bọc lại 9 điểm gọi | **3 nhánh** đã cân | **cần hình** |
| Chọn khai tường minh `self_referential` thay vì đoán từ lệnh | **4 nhánh** đã cân, và hệ quả là một vòng tròn | **cần hình** |
| Descope nhóm D và E | 1 nhánh — owner đã chốt ở brainstorm | dưới ngưỡng |
| Không chạm `lib/evidence-core.cjs` | 1 nhánh — vendored, vùng T1 | dưới ngưỡng |
| Hoàn nguyên `paths` E5/E6 là một phần của AC-10 | 2 bước nối tiếp | dưới ngưỡng |
| Gap-probe P0-1: miễn trừ toàn phần + phép bù | **3 nhánh** (toàn phần · thu hẹp · bỏ cờ) | gộp vào hình 2 |

**Hai hình cần vẽ.**

## Đề bài hình 1 — `chon-cach-doc-git.html`

- Loại: sơ đồ quyết định, ba nhánh song song.
- Nút: «9 điểm gọi `gitOk`» → ba nhánh: «bọc lại `{ok,out}` cả 9» · «biến thể bắt buộc cho 3 chỗ `|| ""`» · «kiểm điều kiện tiên quyết đầu chế độ» → nút kết «4 sửa / 5 giữ».
- Nhãn bằng chữ, không mã: mỗi nhánh một dòng «đổi lấy gì / mất gì».
- AC liên quan: AC-1, AC-3, AC-4, AC-5.

## Đề bài hình 2 — `be-tac-tu-quy-chieu.html`

- Loại: sơ đồ vòng tròn + bảng bốn lối thoát.
- Vòng tròn (bốn nút nối vòng): «ô đo chạy `check`» → «mọi lần ghim ghi vào `_acceptance/**`» → «ô đo bị tính là bị chạm» → «`check` đòi ô ấy có dòng xanh tại sha» → quay lại nút đầu.
- Bảng bốn lối kèm **hướng của phép quên**: khai tường minh (quên → ĐỎ) · đoán từ lệnh (quên → XANH) · loại sổ sách khỏi diff (không cứu ca merge) · luật quy trình (không đo được).
- Ghi rõ nút «miễn trừ TOÀN PHẦN + hai phép bù có tên» là lối đã chọn sau gap-probe.
- AC liên quan: AC-8, AC-9, AC-10.
