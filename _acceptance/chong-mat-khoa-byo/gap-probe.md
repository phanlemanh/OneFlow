---
slug: chong-mat-khoa-byo
at: 2026-08-31T04:52:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch — chong-mat-khoa-byo

Một agent tươi, chỉ đọc 5 file (design doc · contract · evals · decisions ·
claims từ feature trước). Không đọc mã repo — code chưa tồn tại. One-pass:
artifact đã sửa, KHÔNG probe lại.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | AC-10 không có ô nào chạm màn Cài đặt THẬT — E10 dùng đúng `cmd` và `paths` của E5 (chỉ đo lại hợp đồng route), E11 đo bản mẫu. Không ô nào ghim quan hệ "settings-dialog thật đọc 503 rồi đổi trạng thái". Cùng lớp [add-media-library#F1]; cớ "không mount được component" đã bị bác ở [d-20260829T123449Z-8003] | Implementer sửa xong seam+lõi+route, dựng bản mẫu đẹp, để nguyên `fetchEnv` nuốt lỗi. Kho hỏng → GET 503 → màn Cài đặt vẫn hiện form rỗng → người dùng gõ lại khoá → mất khoá. E5 xanh, E10 xanh (cùng lệnh), E11 xanh (bản mẫu), E12 xanh (được cho sẵn trạng thái rồi mới đếm PUT). 14/14 AC xanh, Cổng 2 ký, bug ban đầu vẫn sống | Mount settings-dialog thật với fetch giả 503, assert 4 vế trên chính DOM đó + đối chứng dương ca 200 | **fixed:** E10 viết lại, khoá mới `unit_byo_settings_dialog_503`; thêm đối chứng dương và chiều đỏ "form rỗng khi 503" |
| P1 | evals | Vế "hai panel KHÔNG có nút thoát" của AC-12 (quyết định 3) chỉ đo trên bản mẫu. E14 chạy trên panel thật nhưng chỉ đếm PUT của thao tác lưu | Implementer thêm luôn nút "Bỏ kho cũ" vào `abi-node-shell` cho tiện. E14 vẫn xanh (lưu vẫn không phát PUT), E15 vẫn xanh (bản mẫu không có nút). Quyết định 3 bị lật trong mã mà không ô nào đỏ — đường mất dữ liệu mở lại ngay trên canvas, nơi KHÔNG có hộp xác nhận | Đếm nút trên panel thật, ma trận 2 panel, đối chứng dương settings-dialog === 1 | **fixed:** E14 thêm vế 2 + chiều đỏ (b) nêu đích danh panel |
| P1 | evals | E9 chỉ assert "hai kết quả KHÁC NHAU" — bất đẳng thức, trong khi lời hứa AC-9 là kết quả kho-hỏng không được dẫn người dùng đi nhập lại khoá | `config.server.ts` trả "Không đọc được kho khoá, vui lòng nhập lại hai khoá" cho ca hỏng. Khác chuỗi ca thiếu-khoá → E9 xanh. Nhưng câu đó vẫn dẫn thẳng vào đường mất dữ liệu mà §Context đặt tên | Ghim `code === ENV_STORE_UNREADABLE` + assert âm ghim chuỗi /nhập lại/ + đối chứng dương ca thiếu khoá | **fixed:** E9 viết lại quanh discriminant |
| P1 | evals | E16 lấy danh sách khoá i18n từ MỘT HẰNG VIẾT TAY trong chính file test — fixture dựng đúng khuôn bên đọc, không round-trip từ writer thật. Cùng lớp [chong-doc-sai-em-ru#F1] | S3 thêm khoá thứ tư vào `en.json`, quên hằng trong test và quên 4 tệp kia. E16 xanh tuyệt đối (chỉ kiểm 3 khoá nó tự biết). AC-13 hứa "mọi chuỗi hiển thị mới", thực đo là "những chuỗi tôi nhớ ra" | Quét `t("...")` trong tập file gói việc khai, rồi mới đối chiếu 5 locale; hai chiều đỏ | **fixed:** E16 viết lại, thêm chiều đỏ (b) — chiều mà bản hằng-viết-tay không thể đỏ |
| P2 | evals | E18 khai `criterion: AC-14` trong khi `expected` của chính nó tuyên "THAM KHẢO, không phải bằng chứng a11y" | E17 exit 3 vì cổng 3198 không lên trên máy verify. Bảng theo criterion thấy AC-14 có hai ô, một xanh (E18 dưới jsdom). Người ký đọc AC-14 là "có bằng chứng" — trong khi trục a11y chưa từng chạy trong Chrome thật | Ràng buộc tính điểm tường minh, hoặc gỡ criterion khỏi E18 | **fixed:** thêm ràng buộc vào CẢ `expected` của E18 LẪN AC-14 trong hợp đồng — AC-14 TRƯỢT khi E17 không PASS, bất kể E18 |
