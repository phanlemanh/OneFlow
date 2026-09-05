# Phát hiện khi verify — `kho-khoa-toan-ven`

Làn máy thuần, 13/13 ô đo PASS. Một phát hiện nằm **ngoài 12 tiêu chí đã ký**.

## Ngoài hợp đồng

- **Lệnh đo bằng `vitest -t` chạy 0 ca vẫn thoát 0 — lỗ này còn ở các hồ sơ khác**
  file: `_acceptance/config.yaml`
  severity: high
  Người dùng thấy gì: Một phép kiểm có thể báo đạt trong khi nó không hề chạy thử điều gì, nên một lời hứa chưa từng được kiểm vẫn hiện ra là đã kiểm.
  Đề xuất: mở hợp đồng mới — gói này đã bịt cho mười ô của nó, phần còn lại của kho là việc riêng
  detail: Bắt được trong chính lượt verify của gói này: hai ô đo báo
  `exit=0 · Tests 26 skipped (26)` vì tên ca lọc không khớp gì — hai tiêu chí
  không hề có ca thử mà vẫn xanh. Đã bịt cho mười ô `unit_kkt_*` bằng
  `scripts/settings/run-one-test.sh` (0 ca khớp → thoát 2 kèm lý do). **Nhưng**
  các executor khác trong `_acceptance/config.yaml` vẫn gọi `pnpm vitest -t`
  trực tiếp và mang y nguyên lỗ đó. ĐO ĐƯỢC 31/08: `grep -c "vitest run .* -t "` trên `_acceptance/config.yaml`
  cho **23** executor còn mang lỗ đó. Sửa đại trà nằm ngoài phạm vi đã duyệt.
