---
slug: chong-mat-khoa-byo-giao-dien
at: 2026-09-01T10:05:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
claims_input: ok
---

# gap-probe — chong-mat-khoa-byo-giao-dien

Phản biện context sạch, một lượt, trên năm đầu vào: design doc · contract · evals ·
decisions.jsonl · corpus bài học xuyên hồ sơ (`claim-scan.mjs`, 4957 byte). Critic
KHÔNG đọc mã repo — nó phán artifact, không audit code.

**Cả năm finding đã vá tại chỗ trong evals.yaml; không finding nào đẩy sang người.**
Số ô đo: 10 → 12.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E6/E7 chỉ nạp MỘT hình dạng kho hỏng (503) trong khi Given của AC-12 sau amendment 01/09 là năm hình dạng; và không ô nào khẳng định hai panel THẬT SỰ đi qua bộ đọc chung fail-closed — cùng lớp [normalize-text-vi#F2] "tuyên quét một LỚP mà không có ma trận toàn phần" | Implementer vá `abi-node-shell` bằng `if (status === 503)` nội tuyến. E6/E7 xanh ở ca 503; E2/E3 xanh vì màn Cài đặt dùng bộ đọc chung. Sáu AC PASS, ký nghiệm thu. Trên máy người dùng, proxy 502 hoặc 200 kèm HTML → panel vẫn gửi PUT trên bốn trong năm nhánh | Nới E6/E7 thành ma trận toàn phần 2 bề mặt × 5 hình dạng = 10 khẳng định, mỗi khẳng định nêu tên bề mặt VÀ tên ca; thêm guard tĩnh khẳng định `/api/settings/env` còn đúng 1 tệp nguồn | **fixed:** E6/E7 viết lại quanh ma trận toàn phần, số ca ghim thành hằng, chiều đỏ đòi ĐÚNG 4 ca đỏ; thêm **E11** (`kkt_gd_one_reader`, guard cấu trúc, nửa đàn áp = bỏ qua tệp test) |
| P1 | evals | Không ô nào ghim QUAN HỆ giữa chuỗi hiển thị và tệp thông điệp: E8 chỉ đọc năm tệp JSON, E2/E4/E6 khẳng định literal tiếng Việt — cộng lại vẫn không chứng minh chuỗi render QUA `next-intl`; cùng lớp [chong-doc-sai-em-ru#F1] | Implementer thêm đủ khoá vào 5 locale (E8 xanh) nhưng call-site cấp nhãn literal tiếng Việt — đúng khuôn `KEY_PROMPT_LABELS` đang có sẵn ở `abi-node-shell.tsx:42`. E2/E4/E6 xanh vì đang tìm đúng chuỗi tiếng Việt đó. AC-13 báo ĐẠT trong khi người dùng en/ja/ko/zh thấy tấm chặn bằng tiếng Việt | Ô mới: dựng màn dưới `NextIntlClientProvider` messages `en`, khẳng định chuỗi BẰNG giá trị tra từ `en.json` và KHÁC `vi.json` | **fixed:** thêm **E12** (`kkt_gd_i18n_render`), tra giá trị TỪ TỆP chứ không chép literal vào test, nửa đàn áp = ca `vi`, chiều đỏ nêu đúng tên khoá bị ghi cứng |
| P1 | contract/evals | AC-14 buộc sàn axe vào bản mẫu; không ô nào ghim rằng bản mẫu và ba bề mặt ship dùng chung `store-unreadable-notice.tsx` — `paths` là gợi ý carry-forward, không phải khẳng định [add-media-library#F1]; và hồ sơ cha đã dính đúng lỗi "AC-10 chỉ đo bản mẫu" [chong-mat-khoa-byo#F1] | Bản mẫu dựng chuẩn, E9 quét 6 trang 0 vi phạm, AC-14 ĐẠT. Nhưng `settings-dialog.tsx` thật render tấm chặn bằng markup riêng: nút thoát chỉ có icon, không accessible name. E2/E4 vẫn xanh vì truy bằng nhãn text và `role`. Feature ship với vi phạm serious trên đúng màn mà AC-14 tồn tại để bảo vệ | Component đóng dấu nhận dạng; mỗi bề mặt khẳng định đúng MỘT dấu; bản mẫu cũng vậy | **fixed:** `store-unreadable-notice.tsx` đóng dấu `data-testid="store-unreadable-notice"`; thêm khẳng định (e) vào E2 và E6, và một đoạn vào E9 |
| P1 | evals | E5 khẳng định số PUT và cờ nhưng KHÔNG khẳng định gì về trường `env` của thân yêu cầu; vế "kho bị thay bằng kho RỖNG HỢP LỆ" của AC-11 không có phép đo | Implementer gửi `PUT {replaceUnreadableStore:true}` thiếu hẳn `env`. E5 xanh (1 PUT, cờ true, bấm đúp vẫn 1); E4(d) xanh vì mock trả 200. AC-11 ĐẠT. Trên máy thật route từ chối thân thiếu `env` → người dùng chấp nhận mất khoá mà kho VẪN hỏng: hàng rào duy nhất không dẫn tới lối thoát nào | Khẳng định `body.env` là object thường, 0 khoá; chiều đỏ in nguyên thân yêu cầu | **fixed:** E5 (b) mở rộng + chiều đỏ thứ hai |
| P2 | evals | E1 chạy trên thư mục tạm thật nhưng `expected` không nói fixture kho LÀNH được sinh bằng bộ GHI thật — test tự viết tệp đúng khuôn bên đọc thì phép đo tự thoả | Test viết tay `{"env":{...}}`; reader nghiêm của hồ sơ cha thật ra mong phong bì khác. E1 xanh cả năm ca. Trên máy có kho LÀNH do app ghi, `resolveConfig` đọc ra `store-unreadable` → mọi người dùng lành lặn bị đẩy vào tấm chặn và nút thoát huỷ-diệt: gói chống mất khoá tự tạo đường mất khoá, AC-9 đã ký ĐẠT | Ca lành ghi bằng `saveEnvStore()`; chỉ ca hỏng ghi rác thô; chiều đỏ: đổi một byte trong phong bì writer sinh ra thì ca lành phải đỏ | **fixed:** E1 `expected` yêu cầu round-trip qua `saveEnvStore()` + chiều đỏ thứ hai |
