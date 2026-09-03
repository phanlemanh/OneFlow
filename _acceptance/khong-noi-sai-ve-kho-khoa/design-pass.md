---
slug: khong-noi-sai-ve-kho-khoa
at: 2026-09-03T06:48:30Z
route: http://localhost:3196/proto/khong-noi-sai-ve-kho-khoa
material: scaffold
context: static-frame
context_scenes: []
reaction: nac-1 (không đồng bộ trên ảnh — 24 khung gửi kèm thẻ Cổng 1)
options: http://localhost:3196/proto/khong-noi-sai-ve-kho-khoa?state=divergence
divergence: opened
ds_skill: repo-tokens
states: [settings-store-unreadable, settings-unauthenticated, settings-unavailable, panel-unauthenticated, panel-unavailable, divergence]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 3
---
# design-pass — khong-noi-sai-ve-kho-khoa

`context: static-frame`, cùng nấc và cùng lý do với hai hồ sơ trước: màn Cài đặt thật
là một `Dialog` tự gọi `/api/settings/env` khi mở, không có mối tiêm trạng thái; mở
mối đó là việc S3. `design_pass.host_embed` vắng → không có đường nhúng rẻ.

`material: scaffold`, khai thẳng: state cơ sở `settings-store-unreadable` và hướng A
dùng **chính** `StoreUnreadableNotice` đang ship (chữ và hành động là prop). Hai state
mới theo **hướng B** cần một giọng không-destructive mà component **chưa có** — nên
chúng được ghép từ cùng primitive và cùng token (`border-border`, `bg-muted/40`,
`text-foreground`) theo đúng hình dạng mà prop `tone` sẽ render. Không phải card thứ
hai để ship; là bản nháp của một prop.

## Bước phân kỳ — `divergence: opened`

Mở bằng vật thật trước: state cơ sở (đỏ, nút phá huỷ) là ảnh bề mặt đang chạy. Rồi hai
hướng cho **cùng một ca** «không tới được», cạnh nhau trên cảnh `divergence`, lời khuyên
ghim ngay trên vật:

| Hướng | Trục | Động cơ | Đánh đổi |
|---|---|---|---|
| A — một sắc | sắc màu | một component, không đổi DS; mọi sự cố đọc đều đỏ | đỏ nói «hỏng / nguy hiểm» cho một lượt hết giờ 30 s — mắt đọc ngược với chữ |
| B — hai giọng (máy khuyên) | sắc màu | đỏ chỉ dành cho state có hành động phá huỷ; tạm thời = giọng trung tính + Thử lại | component cần prop `tone`; tương phản giọng mới đo lại ở dark |

Căn cứ khuyên B: sắc màu phải mang cùng taxonomy mà chữ đang mang — đúng bất biến của
hồ sơ («không nói sai»), áp cho cả kênh thị giác.

## Ma trận capture

24 khung, mỗi khung qua cửa `--require` của `ui:capture` (công cụ từ chối ghi nếu trang
không hiện đúng chữ của state); `class="dark"` đọc lại từ HTML phục vụ: light 0 / dark 1.

| state | breakpoint | theme | file |
|---|---|---|---|
| settings-store-unreadable | mobile-375 | light | evidence/design-pass/settings-store-unreadable--mobile-375--light.png |
| settings-store-unreadable | mobile-375 | dark | evidence/design-pass/settings-store-unreadable--mobile-375--dark.png |
| settings-store-unreadable | desktop-1280 | light | evidence/design-pass/settings-store-unreadable--desktop-1280--light.png |
| settings-store-unreadable | desktop-1280 | dark | evidence/design-pass/settings-store-unreadable--desktop-1280--dark.png |
| settings-unauthenticated | mobile-375 | light | evidence/design-pass/settings-unauthenticated--mobile-375--light.png |
| settings-unauthenticated | mobile-375 | dark | evidence/design-pass/settings-unauthenticated--mobile-375--dark.png |
| settings-unauthenticated | desktop-1280 | light | evidence/design-pass/settings-unauthenticated--desktop-1280--light.png |
| settings-unauthenticated | desktop-1280 | dark | evidence/design-pass/settings-unauthenticated--desktop-1280--dark.png |
| settings-unavailable | mobile-375 | light | evidence/design-pass/settings-unavailable--mobile-375--light.png |
| settings-unavailable | mobile-375 | dark | evidence/design-pass/settings-unavailable--mobile-375--dark.png |
| settings-unavailable | desktop-1280 | light | evidence/design-pass/settings-unavailable--desktop-1280--light.png |
| settings-unavailable | desktop-1280 | dark | evidence/design-pass/settings-unavailable--desktop-1280--dark.png |
| panel-unauthenticated | mobile-375 | light | evidence/design-pass/panel-unauthenticated--mobile-375--light.png |
| panel-unauthenticated | mobile-375 | dark | evidence/design-pass/panel-unauthenticated--mobile-375--dark.png |
| panel-unauthenticated | desktop-1280 | light | evidence/design-pass/panel-unauthenticated--desktop-1280--light.png |
| panel-unauthenticated | desktop-1280 | dark | evidence/design-pass/panel-unauthenticated--desktop-1280--dark.png |
| panel-unavailable | mobile-375 | light | evidence/design-pass/panel-unavailable--mobile-375--light.png |
| panel-unavailable | mobile-375 | dark | evidence/design-pass/panel-unavailable--mobile-375--dark.png |
| panel-unavailable | desktop-1280 | light | evidence/design-pass/panel-unavailable--desktop-1280--light.png |
| panel-unavailable | desktop-1280 | dark | evidence/design-pass/panel-unavailable--desktop-1280--dark.png |
| divergence | mobile-375 | light | evidence/design-pass/divergence--mobile-375--light.png |
| divergence | mobile-375 | dark | evidence/design-pass/divergence--mobile-375--dark.png |
| divergence | desktop-1280 | light | evidence/design-pass/divergence--desktop-1280--light.png |
| divergence | desktop-1280 | dark | evidence/design-pass/divergence--desktop-1280--dark.png |

## Cảnh ngữ-cảnh

- Không có — `context: static-frame` (khung host tĩnh có sẵn trong Frame: tiêu đề màn +
  chrome Cài đặt / tiêu đề node), không phải `standalone`, nên không cần cảnh riêng.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- **Nút phá huỷ nặng hơn nút an toàn.** Bản đầu: Thử lại `outline`, «Thay kho…»
  `destructive` (filled) — hành động nguy hiểm là hành động thị giác chính. Đã đổi: Thử lại
  = primary (default variant), «Thay kho…» = `outline` + `text-destructive`. Một hành
  động chính mỗi màn, và nó là hành động an toàn. Áp cho bề mặt thật ở S3.
- **`size="sm"` cao 32 px, dưới sàn 44 px chạm** (mobile). Đã nâng mọi nút hành động lên
  cỡ mặc định (36 px) — cỡ lớn nhất DS đang có; phần còn thiếu tới 44 là Nhóm 2.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- **`StoreUnreadableNotice` cần prop `tone: "destructive" | "quiet"`** (hướng B). Hôm nay
  component cố định `border-destructive/50 bg-destructive/5` + `ShieldAlert`. Đề xuất:
  `tone` đổi bộ token viền/nền và icon (`LogIn` / `WifiOff` do caller cấp); giữ nguyên
  cấu trúc, testid theo state, heading level. Đo lại tương phản `bg-muted/40` ở dark
  trong S4 (E13).
- **DS không có cỡ nút đạt 44 px chạm.** `sm`=32, default=36, `lg`=40. Ảnh hưởng toàn
  app, không riêng hồ sơ này. Đề xuất: một cỡ `touch` (h-11) hoặc nâng default trên
  mobile — quyết ở DS, không ở đây.
- **Repo chưa khai skill chuẩn DS** (`design_pass.ds_skill` vắng; `feature_loop.ui_standards_skill`
  vắng) — phiên chạy trên `repo-tokens`. Gate 1 quyết nhận nấc đó làm chuẩn repo hay
  đầu tư DS riêng.
