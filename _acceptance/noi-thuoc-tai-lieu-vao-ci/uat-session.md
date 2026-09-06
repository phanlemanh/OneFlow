---
schema_version: 1
slug: noi-thuoc-tai-lieu-vao-ci
feature: Nối hai thước tài-liệu-sống ↔ manifest vào CI
owner: Manh
stage: scheduled
verdict:
decided_by:
decided_at:
---

# Phiên nghiệm thu — Cổng Giá trị

Hồ sơ đã ký tại Cổng 2 ngày 2026-09-02 (Phan Le Manh). Ngưỡng chốt ngày
2026-09-07, giữ nguyên văn bản đề xuất.

**Cờ vàng — chưa lái-thử.** Không có `stranger-drive.md` cho vòng này. Điều kiện
"sản phẩm thật đã chạy sau flag" vào phiên bằng LỜI KHAI, không bằng bằng chứng.
Phiên vẫn mở được; người ký biết mình đang đứng trên lời khai.

## Ngưỡng đã khai tại Cổng Đáng (CHÉP NGUYÊN VĂN — cấm sửa sau khi thấy số)

- Câu hỏi phép đo trả lời: Sau khi bật, một PR làm ba README lệch manifest có bị chặn **mà không cần ai gõ tay** không?
- Kết quả nào là SỐNG: Một PR thử nghiệm cố ý xoá một mục README làm job `Acceptance Gate` **đỏ**, và thông điệp nêu đích danh id lẫn tên file — quan sát trên chính GitHub Actions, không phải trên máy.
- Kết quả nào là CHẾT: Bật xong CI đỏ vì nợ có sẵn ở `main` mà không ai gây ra, hoặc bật xong vẫn phải gõ tay mới biết lệch.
- Timebox: một buổi. Vượt là dấu hiệu việc này đã hoá thành "sửa hàng rào" chứ không còn là "cắm điện cho hàng rào".

## Người dự

| Tên | Vai | Đại diện cho ai |
|---|---|---|
| Phan Le Manh | chủ kho, người ký | người mở PR tiếp theo chạm manifest plugin |

> Đề xuất của máy, chờ người xác nhận hoặc thêm tên. Vòng này không có người
> dùng cuối ngoài đội — ô cơ hội đã khai vậy tại Cổng Đáng.

## Chấm kín (thu TRƯỚC mọi thảo luận chung)

**Nghi thức này thoái hoá ở phiên này, và nói thẳng ra thì tốt hơn giả vờ.** Chấm kín
tồn tại để cả phòng không trôi về ý người nói to nhất. Phiên này có đúng một người dự,
nên nó không mua được gì. Cái nó KHÔNG thay thế được là câu ràng buộc bên dưới.

| Người | Điểm/nhận xét kín | Câu ràng buộc: sẽ để hàng rào này chặn PR thật của chính mình chứ? |
|---|---|---|
| Phan Le Manh |  |  |

> Câu ràng buộc đã dịch cho vòng nội bộ. Bản gốc hỏi "gửi cho khách nào, khi nào" —
> công cụ nội bộ không có khách, nên câu tương đương là: khi hàng rào cản một PR gấp
> của chính anh, anh sửa README hay tắt thước? Trả lời chung chung tự nó là dữ liệu.

## Thảo luận sau khi đã chấm

## Số đo thật đặt cạnh ngưỡng

| Thước | Ngưỡng đã khai | Số đo được | SỐNG/CHẾT |
|---|---|---|---|
| PR làm README lệch manifest bị chặn tự động | job `Acceptance Gate` **đỏ trên GitHub Actions**, thông điệp nêu đích danh id và tên file | PR #104 (06/09): job đỏ sau 29 giây, không ai gõ gì; log in `FAIL: README.md does not list \`oneflow-api-pyscenedetect\`` | **SỐNG** |
| Không đỏ vì nợ có sẵn ở `main` | CI xanh trên `main` khi không ai gây lệch | 5/5 lượt gần nhất trên `main` xanh, lượt muộn nhất 2026-09-06 (sau khi hàng rào bật 02/09) | không CHẾT |

### Bằng chứng lượt đo trên GitHub Actions

- PR thử: [phanlemanh/OneFlow#104](https://github.com/phanlemanh/OneFlow/pull/104) — mở để bị chặn, đóng ngay sau khi đọc kết quả, không merge.
- Lượt chạy: [34061759938](https://github.com/phanlemanh/OneFlow/actions/runs/34061759938), job `Acceptance Gate`, đỏ sau 29 giây.
- Thay đổi duy nhất của PR: xoá đúng một dòng khỏi `README.md`, mục `oneflow-api-pyscenedetect`.
- Chín step trước thước chạy qua sạch (kiểm trước-merge · lộ trình · bản đồ sản phẩm · đóng băng kế hoạch · tài liệu kế hoạch). Toàn log có **đúng một** dòng lỗi, và nó là step `READMEs match the plugin manifest`.
- Năm job khác của cùng lượt chạy đều **xanh** (Lint · Type Check · Build · Unit Tests · SDK Tests). Hàng rào cắn đúng một chỗ, không phải CI đỏ bừa.
- Thông điệp máy in, nguyên văn:

```
README.md: 38 id extracted · manifest: 39
FAIL: README.md does not list `oneflow-api-pyscenedetect`, which the manifest registers
FAIL: 1 mismatch(es) between the READMEs and the manifest
##[error]Process completed with exit code 1.
```

**Mô phỏng cục bộ — KHÔNG phải số đo của ngưỡng.** Trong một cây tạm, xoá đúng một
mục README (`oneflow-api-pyscenedetect`) làm thước thoát khác 0 và in
`FAIL: README.md does not list \`oneflow-api-pyscenedetect\``. Đúng chữ của vế SỐNG
trừ một chữ: ngưỡng đòi **quan sát trên chính GitHub Actions**, và đòi thế là có lý
— căn bệnh hồ sơ này chữa chính là "thước chỉ chạy khi có người gõ". Một lần gõ tay
thành công không chứng minh được điều ngược lại.

## Quyết định Cổng Giá trị

- **verdict = ** Căn cứ:
- Bước kế:
