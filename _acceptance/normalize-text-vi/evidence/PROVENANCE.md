# Xuất xứ của hồ sơ bằng chứng — đọc trước khi ký

Cập nhật: 2026-08-22 · cây hiện tại `f54b047`

## Ô nào đo ở đâu

| Nhóm | Số ô | Đo ở vòng | Trên cây | Kết quả |
|---|---|---|---|---|
| Eval máy | 25/26 | vòng 3 và vòng 4 | `a60ccac`, `9043ef6` | exit 0 cả hai vòng |
| E16 (node nhìn có giống các node khác không) | 1 | chưa có vòng nào | — | chờ người phán |

## Vì sao CHƯA ký được — lý do thật, không phải thủ tục

Hồ sơ đo trên cây `9043ef6`. Từ đó tới nay có **9 commit**, và chúng chạm
đúng thứ đang được chứng nhận:

- phần đọc số thành chữ — sửa 3 chỗ (luật khoảng, chữ Đ hoa, dấu hai chấm)
- danh sách được dùng lại kết quả cũ — rút node này ra
- bộ kiểm — thêm 144 dòng ca kiểm mới
- số hiệu thư viện — lên 0.2.23

Nói gọn: **thứ được đo không còn là thứ đang nằm trên đĩa.** Ký bây giờ là
ký cho một bản đọc đã bị viết lại ba chỗ sau khi đo.

## Cái gì đã biết về cây hiện tại

Chạy tại chỗ trong phiên làm việc (KHÔNG phải bằng chứng cổng — không có
mã lần chạy do máy chấm sinh ra, không ai soi lại):
257/257 ca kiểm thư viện · rà lỗi văn phong · rà kiểu · dựng bản chạy — đều xanh.

Bốn vòng chấm ngày 21/08 đều bị hạ tầng chặn giữa chừng, không vòng nào
ghi được ô nào.
