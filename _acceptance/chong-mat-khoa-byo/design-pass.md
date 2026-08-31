---
slug: chong-mat-khoa-byo
at: 2026-08-31T04:41:00Z
route: http://localhost:3000/proto/chong-mat-khoa-byo
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (không đồng bộ trên ảnh — gói 12 khung + 6 bản HTML gửi kèm thẻ Cổng 1)
options:
divergence: skipped — hình dạng đã bị bốn quyết định owner (31/08) và bảng trạng thái trong design doc chốt kín; không còn ≥2 hướng khả dĩ để bày
ds_skill: repo-tokens
states: [store-unreadable, store-unreadable-confirm, panel-unreadable]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 3
---

# design-pass — chong-mat-khoa-byo

`context: static-frame` chứ không phải `host-embedded`: màn Cài đặt thật là một
`Dialog` tự gọi `/api/settings/env` khi mở và **không có mối nào để tiêm trạng
thái vào**. Mở mối đó là hiện thực — việc của S3, không phải của phiên chạy
TRƯỚC Cổng 1. Nên khung là mô hình tĩnh, còn các tấm bên trong ghép từ đúng
primitive mà màn thật dùng (`ui/button`, `ui/input`, `ui/alert-dialog`) với token
của repo. Cùng nấc mà `add-media-library-proto` đã chọn, cùng lý do.

## Ma trận capture

12 khung ảnh + 6 bản HTML. Mỗi ảnh qua cửa `--require` của `ui:capture` — công cụ
**từ chối ghi** khi khung không chứa chuỗi bắt buộc, nên một state gõ sai không
thể sinh ra một khung trông hợp lệ.

| state | breakpoint | theme | file |
|---|---|---|---|
| store-unreadable | mobile-375 | light | evidence/design-pass/store-unreadable--mobile--light.png |
| store-unreadable | mobile-375 | dark | evidence/design-pass/store-unreadable--mobile--dark.png |
| store-unreadable | desktop-1280 | light | evidence/design-pass/store-unreadable--desktop--light.png |
| store-unreadable | desktop-1280 | dark | evidence/design-pass/store-unreadable--desktop--dark.png |
| store-unreadable-confirm | mobile-375 | light | evidence/design-pass/store-unreadable-confirm--mobile--light.png |
| store-unreadable-confirm | mobile-375 | dark | evidence/design-pass/store-unreadable-confirm--mobile--dark.png |
| store-unreadable-confirm | desktop-1280 | light | evidence/design-pass/store-unreadable-confirm--desktop--light.png |
| store-unreadable-confirm | desktop-1280 | dark | evidence/design-pass/store-unreadable-confirm--desktop--dark.png |
| panel-unreadable | mobile-375 | light | evidence/design-pass/panel-unreadable--mobile--light.png |
| panel-unreadable | mobile-375 | dark | evidence/design-pass/panel-unreadable--mobile--dark.png |
| panel-unreadable | desktop-1280 | light | evidence/design-pass/panel-unreadable--desktop--light.png |
| panel-unreadable | desktop-1280 | dark | evidence/design-pass/panel-unreadable--desktop--dark.png |

**Đã kiểm trên bản ĐANG CHẠY, không đọc bằng mắt trên mã** (ba lượt truy vấn DOM):

| Khẳng định | Đo được |
|---|---|
| form khoá bị THAY, không bị phủ | `inputCount: 0` ở `store-unreadable` |
| nút Lưu hiện diện và tắt | `{t:"Lưu", disabled:true}` |
| đúng MỘT nút thoát | `escapeCount: 1` |
| hộp xác nhận nói đúng hai ý | `saysLost:true · saysUnrecoverable:true · saysAreYouSure:false`, `role="alertdialog"` |
| hai panel node KHÔNG có nút thoát | `escapeButtonsPresent: 0`, 2 panel / 2 alert / 2 lối sang Cài đặt |
| input đều có nhãn | `unlabelledInputs: 0` |

**a11y đo bằng dụng cụ thật** (`scripts/settings/check-a11y-proto.sh` → axe-core
trong Chrome thật, 6 trang): `verdict: PASS · blocking: 0`. Chiều đỏ cũng đã đo —
xem Nhóm 2 mục 1.

## Cảnh ngữ-cảnh

Không áp dụng — `context: static-frame`, không phải `standalone`.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- **Nút xác nhận huỷ-diệt bị chép tay thay vì dùng biến thể có sẵn.** Bản đầu ghi
  `className="bg-destructive text-white hover:bg-destructive/90"`; biến thể
  `destructive` thật của repo còn có `focus-visible:ring-destructive/20`,
  `dark:focus-visible:ring-destructive/40`, `dark:bg-destructive/60`. Bản chép tay
  **đánh rơi cả hai nhánh dark-mode lẫn vòng tiêu điểm** — đúng thứ sàn a11y ở
  theme tối đo. Đã đổi sang `buttonVariants({ variant: "destructive" })`.
- **Tiêu đề khung trùng tiêu đề panel đầu tiên** ở `panel-unreadable` (cả hai là
  "Nạp từ kho — cấu hình"), làm cấu trúc heading đọc ra hai lần cùng một tên. Đã
  tách khung thành "Bảng cấu hình ngay trên node".

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

1. **`executors.design.gate` không đo được thứ nó có vẻ đang đo — ảnh hưởng ngoài
   hồ sơ này.** Đo 31/08 trên chính các bản chụp ở trên: gate chạy dưới jsdom,
   jsdom in `Could not parse CSS stylesheet` sáu lần và chỉ phân giải **188
   cssRules trên 153KB CSS nội tuyến**, nên qua nó `h1` đọc ra `color: rgb(0,0,0)`
   và `[role=alertdialog]` đọc ra nền `rgba(0,0,0,0)`. Toàn bộ gate cũng chỉ có ba
   luật — `cramped-padding`, `nested-cards`, `gradient-text` — tức nó là **bộ dò
   slop thẩm mỹ**, không phải cổng WCAG. Bản nháp đầu của AC-14 đã hứa "tương
   phản, tiêu điểm bàn phím, tên gọi cho trình đọc màn hình" từ dụng cụ này; đã
   sửa AC-14 sang **axe-core trong Chrome thật** trước Cổng 1, và giữ design-gate
   làm phép đo THAM KHẢO (E18). **Việc cho người duyệt:** các hồ sơ trước dùng
   `design.gate` cho vế a11y có cần đọc lại con số của mình không.
2. **Repo chưa khai `design_pass.ds_skill`** → phiên chạy trên `repo-tokens`
   (từ vựng token trong `src/app/globals.css`, đầy đủ bộ shadcn). Không chặn gì,
   nhưng artifact UI của vòng này không có đối trọng chuẩn nội nào ngoài token.
   Cùng gốc với việc `feature_loop.ui_standards_skill` cũng vắng.
3. **`design_pass.host_embed` vắng** → không có đường nhúng rẻ vào host thật, nên
   phiên dừng ở `static-frame`. Hệ quả cụ thể cho hồ sơ này: bản mẫu **không**
   cho thấy hộp xác nhận phủ lên màn Cài đặt như khi chạy thật (trong khung tĩnh
   nó đọc ra như một thẻ thứ hai bên dưới). Người duyệt nên đọc quan hệ đó từ
   design doc chứ đừng đọc từ ảnh.
