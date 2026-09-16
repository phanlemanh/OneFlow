---
slug: skill-system-v1
at: 2026-09-16T12:05:00Z
route: http://localhost:3117/proto/skill-system-v1
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (không đồng bộ trên ảnh — 33 khung gửi kèm thẻ Cổng 1)
options:
divergence: skipped — khuôn danh-sách-chi-tiết đã chốt trong Đặc tả UX của design-doc, và ngăn trái lặp đúng khuôn ngăn Tác vụ sẵn có của thanh trái; không còn ≥2 hướng khả dĩ để bày
ds_skill: repo-tokens
states: [danhsach-mac-dinh, danhsach-thieu-plugin, danhsach-dang-tai, bieumau-chua-du, bieumau-dang-tai-len, bieumau-loi-tham-so, bieumau-ban, chay-dang-chay, ketqua-xong, ketqua-loi, kehoach-xac-nhan]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 3
---

# design-pass — skill-system-v1

`context: static-frame` — khung canvas tĩnh (thanh trái có thêm nút Skill, bảng trống)
bọc **chính các component sẽ ship** (`src/components/workspace/skills/`), giữ mở trong
primitive `Sheet` thật. Chỗ ship thật là `workspace-left-nav.tsx`, nơi store React Flow là
phần hiện thực của S3. Mười một trạng thái = đúng mười một dòng bảng trạng thái của
design-doc. Máy chủ của cây này chạy cổng 3117 trên dữ liệu tạm (cổng 3000 là máy chủ
của repo khác). Trạng thái lạ render `unknown:<tên>` trên `data-proto-state` — đã thử
bằng `?state=khong-co`.

Mọi khung qua `pnpm ui:capture --lang vi --require "không cần tự lắp từng bước"`: công cụ
từ chối ghi khi trang không đúng tiếng Việt hoặc thiếu chuỗi đó.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| danhsach-mac-dinh | mobile-375 | light | evidence/design-pass/danhsach-mac-dinh--mobile--light.png |
| danhsach-mac-dinh | desktop-1280 | light | evidence/design-pass/danhsach-mac-dinh--desktop--light.png |
| danhsach-mac-dinh | desktop-1280 | dark | evidence/design-pass/danhsach-mac-dinh--desktop--dark.png |
| danhsach-thieu-plugin | mobile-375 | light | evidence/design-pass/danhsach-thieu-plugin--mobile--light.png |
| danhsach-thieu-plugin | desktop-1280 | light | evidence/design-pass/danhsach-thieu-plugin--desktop--light.png |
| danhsach-thieu-plugin | desktop-1280 | dark | evidence/design-pass/danhsach-thieu-plugin--desktop--dark.png |
| danhsach-dang-tai | mobile-375 | light | evidence/design-pass/danhsach-dang-tai--mobile--light.png |
| danhsach-dang-tai | desktop-1280 | light | evidence/design-pass/danhsach-dang-tai--desktop--light.png |
| danhsach-dang-tai | desktop-1280 | dark | evidence/design-pass/danhsach-dang-tai--desktop--dark.png |
| bieumau-chua-du | mobile-375 | light | evidence/design-pass/bieumau-chua-du--mobile--light.png |
| bieumau-chua-du | desktop-1280 | light | evidence/design-pass/bieumau-chua-du--desktop--light.png |
| bieumau-chua-du | desktop-1280 | dark | evidence/design-pass/bieumau-chua-du--desktop--dark.png |
| bieumau-dang-tai-len | mobile-375 | light | evidence/design-pass/bieumau-dang-tai-len--mobile--light.png |
| bieumau-dang-tai-len | desktop-1280 | light | evidence/design-pass/bieumau-dang-tai-len--desktop--light.png |
| bieumau-dang-tai-len | desktop-1280 | dark | evidence/design-pass/bieumau-dang-tai-len--desktop--dark.png |
| bieumau-loi-tham-so | mobile-375 | light | evidence/design-pass/bieumau-loi-tham-so--mobile--light.png |
| bieumau-loi-tham-so | desktop-1280 | light | evidence/design-pass/bieumau-loi-tham-so--desktop--light.png |
| bieumau-loi-tham-so | desktop-1280 | dark | evidence/design-pass/bieumau-loi-tham-so--desktop--dark.png |
| bieumau-ban | mobile-375 | light | evidence/design-pass/bieumau-ban--mobile--light.png |
| bieumau-ban | desktop-1280 | light | evidence/design-pass/bieumau-ban--desktop--light.png |
| bieumau-ban | desktop-1280 | dark | evidence/design-pass/bieumau-ban--desktop--dark.png |
| chay-dang-chay | mobile-375 | light | evidence/design-pass/chay-dang-chay--mobile--light.png |
| chay-dang-chay | desktop-1280 | light | evidence/design-pass/chay-dang-chay--desktop--light.png |
| chay-dang-chay | desktop-1280 | dark | evidence/design-pass/chay-dang-chay--desktop--dark.png |
| ketqua-xong | mobile-375 | light | evidence/design-pass/ketqua-xong--mobile--light.png |
| ketqua-xong | desktop-1280 | light | evidence/design-pass/ketqua-xong--desktop--light.png |
| ketqua-xong | desktop-1280 | dark | evidence/design-pass/ketqua-xong--desktop--dark.png |
| ketqua-loi | mobile-375 | light | evidence/design-pass/ketqua-loi--mobile--light.png |
| ketqua-loi | desktop-1280 | light | evidence/design-pass/ketqua-loi--desktop--light.png |
| ketqua-loi | desktop-1280 | dark | evidence/design-pass/ketqua-loi--desktop--dark.png |
| kehoach-xac-nhan | mobile-375 | light | evidence/design-pass/kehoach-xac-nhan--mobile--light.png |
| kehoach-xac-nhan | desktop-1280 | light | evidence/design-pass/kehoach-xac-nhan--desktop--light.png |
| kehoach-xac-nhan | desktop-1280 | dark | evidence/design-pass/kehoach-xac-nhan--desktop--dark.png |

## Cảnh ngữ-cảnh

- Không áp dụng: nấc `static-frame`, không phải `standalone`. Ghi chú thật thà: ngăn mở từ bên trái nên che chính thanh trái vẽ trong khung — người duyệt thấy ngăn trên nền canvas, không thấy nút đã mở nó (xem Nhóm 2 mục 3).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Phụ đề ngăn nói «không cần tự nối node» — «node» là từ nội bộ với người bán hàng (AC-13). Đổi thành «không cần tự lắp từng bước» ở cả năm ngôn ngữ.
- Trạng thái `bieumau-loi-tham-so`: focus rơi vào nút chọn video (ô đầu) trong khi lỗi nằm ở ô độ nhạy. Focus nay vào ô đầu tiên máy chủ từ chối, không có lỗi thì vào ô đầu.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Trình phát âm thanh/video dùng điều khiển gốc của trình duyệt; ở giao diện tối thanh âm thanh vẫn sáng chói (`ketqua-xong--desktop--dark`). Repo không có component trình phát theo token. Đề xuất: ghi Known limits, không dựng trình phát riêng ở v1.
- Repo chưa khai `design_pass.ds_skill` (và `feature_loop.ui_standards_skill`) — phiên chạy trên token của repo (`globals.css`) + primitive shadcn trong `components/ui`. Đề xuất: nhận nấc này làm chuẩn repo.
- Ngăn trái che nút Skill đã mở nó — cùng khuôn ngăn Tác vụ đang có. Đề xuất: giữ để nhất quán; nếu người duyệt muốn thấy canvas cạnh ngăn thì đổi sang ngăn phải là một dòng `side`.
