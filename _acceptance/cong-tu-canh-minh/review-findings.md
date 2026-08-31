# Phát hiện khi verify — `cong-tu-canh-minh`

Làn máy thuần, run_id `ctcm-machine-20260831T090207Z`, 16/16 ô đo PASS.
Hai phát hiện dưới đây **nằm ngoài 13 tiêu chí đã ký**, nên máy không tự quyết.

## Ngoài hợp đồng

- **Guard lộ trình nuốt tham số lạ rồi báo sạch**
  file: `scripts/roadmap/check-roadmap-fresh.sh`
  severity: medium
  Người dùng thấy gì: Một dòng lệnh gõ sai trong cấu hình kiểm tự động sẽ đọc ra thành "đã kiểm, sạch" mãi mãi, thay vì báo lỗi.
  Đề xuất: ghi Known limits — đã sửa trong lượt này, chỉ cần người xác nhận việc sửa đó nằm ngoài phạm vi đã ký
  detail: Bắt được bởi chính vế guard-of-the-guard của ô E8, vốn thêm vào sau
  vòng phản biện. Cùng lớp fail-open mà kho này đã cấm cho tên ca (`--case` lạ
  phải thoát 2), nhưng chưa ai áp cho bản thân guard. Đã sửa: cả
  `check-roadmap-fresh.sh` lẫn `scripts/ci/check-product-map.mjs` nay từ chối
  tham số không biết và thoát 2. Sửa nằm ngoài 13 tiêu chí, nên người quyết.

- **Nghi vấn: chốt chặn trước-merge bỏ qua kiểm lỗi thời cho hồ sơ khai thiếu đường dẫn**
  file: `scripts/pre-merge-check.sh`
  severity: high
  Người dùng thấy gì: Một số hồ sơ có thể không bao giờ bị đòi đóng dấu lại, nên bằng chứng cũ đi qua cổng mãi.
  Đề xuất: mở hợp đồng mới — đã dựng việc riêng; KHÔNG sửa trong PR này vì đây là chốt chặn CI, sửa mù sẽ chặn nhầm mọi PR
  detail: Đo được, không suy luận. Hồ sơ `ci-vitest-sdk-pin` khai
  `.github/workflows/ci.yml` trong `paths` của bốn ô đo; PR này đổi đúng file
  đó; mốc verify của nó (`91da1a4e`) đã xác nhận LÀ tổ tiên của HEAD. Vậy mà
  cổng in `OK`, không VIOLATION và cũng không một dòng NOTE nào. Hồ sơ đối
  chứng `roadmap-drift-guard` cùng lượt chạy thì bị bắt đúng ba file. Khác biệt
  duy nhất quan sát được: hồ sơ kia có hai ô đo khai `paths: null`. **Giả
  thuyết chưa kiểm chứng** — cách kiểm dứt điểm nằm trong việc đã dựng riêng.
