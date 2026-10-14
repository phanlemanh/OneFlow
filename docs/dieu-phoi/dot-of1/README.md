# Gói đợt of1 — đợt thử thứ hai của gói `dieu-phoi` trên OneFlow

Trạng thái: **kế hoạch ĐÃ DUYỆT, đợt chưa mở.** Chủ kho (manh) duyệt 14/10/2026, chọn lối (i) cho B8: ký Cổng
Đáng của B8 TRƯỚC ngày mở. Mở ở ngày chạy bằng `/dieu-phoi:mo-dot of1` từ một phiên ở gốc kho (phiên đó thành
phiên giám sát).

Mốc ngoài của lộ trình kit: «OneFlow: đợt thử thứ hai trên gói — đo chạy được mà không sửa lõi», hạn 27/10/2026.
Kit ghim: v2.30.0 (`7cf78c36`), gói `dieu-phoi` 2.30.0 cài ở phạm vi project và user.

## Ba tệp của gói (bộ đọc của gói lấy đúng ba tệp này)

- `dieu-phoi.config.json` — nhánh chính `main`, hạn thuê, sức khoẻ máy, hạn mức, danh sách tệp bảo vệ.
- `hang-viec.json` — hai dãy, hai hàng (bảng dưới). Worktree là chỗ giữ `/CHUA-CO-WORKTREE/P<n>`: phiên mở từ chip
  chạy `ghi-danh` trước S1.
- `LUAT-rieng.md` — phần riêng của kho, chép vào `LUAT.md` của đợt. Luật 1 (thợ chờ người thì ghi `can-nguoi`) là
  việc CHANGELOG kit 2.27.0 giao riêng cho OneFlow.

## Kế hoạch đợt

| Dãy | Mã | Hàng | Quyết lúc soạn | Ghi chú |
|---|---|---|---|---|
| P1 | B7 ★ | `skill-1-footage-kho-clip` — Skill #1 Footage sang kho clip 9:16 | `build` (05/09) | T3; B5 skill-system-v1 đã ký 17/09 nên không còn chờ |
| P2 | B8 ★ | `director-sinh-instance` — Director sinh instance skill từ prompt | chưa có ô | lối (i): chủ kho ký Cổng Đáng trước 20/10 bằng `/feature-loop:feature-loop director-sinh-instance` (S0); chưa ký tới ngày mở thì đợt chạy một dãy (xem «Điểm vấp đã biết») |

- **Ngày chạy:** 20–22/10/2026, mốc hàng 24/10, báo cáo đợt trước hạn 27/10.
- **Số thợ:** hai. Khoá `s4` của gói là khoá cấp máy (`~/.claude/dieu-phoi/may`), dùng chung với mọi đợt khác trên
  M5 — hai dãy đủ để đo tranh chấp lượt chấm mà không chặn việc của crm và kit trên cùng máy.
- **Hàng không đưa vào:** B6 chờ A7 (chủ kho tạo kho công khai) · B9 chờ A1/A3 (corpus thực địa) · B10 chờ phiên
  nghiệm thu · S1–S3 là Should, chưa có quyết. Kế hoạch đã qua mốc tái hoạch 09/10 mà chưa ghi `checkpoint_done` —
  việc đó của chủ kho, không chặn đợt.

## Đo «không sửa lõi»

Lõi là mã của gói `dieu-phoi` (`<gói>/scripts/**`, `hooks/**`) và bản chép của nó ở `<thư mục đợt>/loi/`. Số đọc
được ở cuối đợt:

1. **Tệp lõi phải sửa = 0.** Đếm ba nguồn, cộng lại:
   - bản chép `loi/` lệch bản gói đã cài: `diff -rq <thư mục đợt>/loi <gói dieu-phoi 2.30.0>/scripts` (trừ
     `PHIEN-BAN.json`) — mọi dòng khác là một tệp lõi bị sửa tại chỗ;
   - commit vào `dieu-phoi/` của kit giữa ngày mở và ngày đóng đợt mà đợt này cần để chạy tiếp (mỗi vá do một sự cố
     của of1 gây ra tính một);
   - tệp của gói bị chép vào kho OneFlow: `git ls-files scripts/dieu-phoi` rỗng và `xem --kiem-chuyen` in
     `kiem-chuyen: sach`.
2. **Tệp kho phải chỉnh để đợt chạy** — đếm riêng, không tính là sửa lõi, nhưng mỗi dòng là một lỗ của lời hướng
   dẫn cài. Lúc soạn gói đã có ba: khoá `dieu_phoi.goi_dot` trong `_acceptance/config.yaml` · dòng bật gói trong
   `.claude/settings.json` · `.acceptance-runs/` trong `.gitignore` (kit và crm có dòng này, OneFlow chưa có;
   README gói không nhắc).
3. **Hai số của CHANGELOG kit 2.27.0**, đếm ở sổ chạy của đợt: lượt S4 thật lọt khoá (ngưỡng «S4 tự xưng» ≥ 1) và lượt
   thợ đứng vì hộp quyền mà không có tệp chờ người (ngưỡng «mù» ≥ 1).

Mỗi điểm vấp ghi vào Nhật ký của đợt một dòng: `vấp · lõi|kho · <tệp> · <một câu>`.

## Điểm vấp đã biết (dự báo lúc soạn, chưa chạy)

- **Hàng chờ Cổng Đáng ở kho không khai `lo_trinh`.** Bước 3 của `/dieu-phoi:mo-dot` mở ô `stage: discovery` cho
  hàng chờ bằng `lo-trinh.mjs --hang '<tệp>:<mã>' --mo-o`. OneFlow giữ lộ trình ở `docs/roadmap.md` (bảng markdown),
  không khai `lo_trinh.tep`, nên lệnh ấy thoát 1 «kho chưa khai lo_trinh.tep» (đo 14/10 với B8). Hàng B8 vì thế
  cần quyết `build` TRƯỚC khi mở đợt — chủ kho ký Cổng Đáng của B8 bằng `/feature-loop:feature-loop
  director-sinh-instance` (S0) — hoặc đợt chạy một dãy. Đây là vấp loại `lõi` nếu đợt phải đi đường khác hướng dẫn.
