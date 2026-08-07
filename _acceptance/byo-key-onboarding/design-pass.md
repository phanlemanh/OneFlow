---
slug: byo-key-onboarding
at: 2026-08-07T08:50:00Z
route: http://localhost:3000/proto/byo-key-onboarding?state=<state>[&theme=dark]
material: real-components
context: static-frame
context_scenes: []
ds_skill: repo-tokens
states: [missing, installing, provisioning, ready, blocked, result, needs-key, key-verifying, key-invalid, key-verified]
breakpoints: [desktop-1280]
themes: [light, dark]
patched: 9
deferred: 3
---
# design-pass — byo-key-onboarding

Owner ngồi xem, phản ứng trực tiếp trên bản bấm được. Vật liệu `real-components`:
`FirstRunStrip` và `NodeKeyPrompt` là component thật sẽ ship, chỉ nhận fixture qua props —
nên những gì owner duyệt ở đây đi thẳng vào implementation, drift 0.

Nấc ngữ cảnh `static-frame`: component thật render trong khung tĩnh mô phỏng chrome workspace.
Thấp hơn `host-embedded` một bậc có chủ đích — canvas thật cần React Flow và store của nó, tức
đúng phần implementation mà nghi thức này diễn ra *trước*. Vì không phải `standalone` nên không
cần cảnh ngữ-cảnh riêng.

`breakpoints` chỉ có desktop: owner chốt **mobile không thuộc phạm vi** (OneFlow là canvas
desktop), và điều đó đã ghi vào Out of scope của contract.

## Ma trận capture

20 file trong `evidence/design-pass/`, tên theo khuôn `<state>--desktop-1280--<theme>.png`.

| state | breakpoint | theme | file |
|---|---|---|---|
| missing | desktop-1280 | light · dark | missing--desktop-1280--{light,dark}.png |
| installing | desktop-1280 | light · dark | installing--desktop-1280--{light,dark}.png |
| provisioning | desktop-1280 | light · dark | provisioning--desktop-1280--{light,dark}.png |
| ready | desktop-1280 | light · dark | ready--desktop-1280--{light,dark}.png |
| blocked | desktop-1280 | light · dark | blocked--desktop-1280--{light,dark}.png |
| result | desktop-1280 | light · dark | result--desktop-1280--{light,dark}.png |
| needs-key | desktop-1280 | light · dark | needs-key--desktop-1280--{light,dark}.png |
| key-verifying | desktop-1280 | light · dark | key-verifying--desktop-1280--{light,dark}.png |
| key-invalid | desktop-1280 | light · dark | key-invalid--desktop-1280--{light,dark}.png |
| key-verified | desktop-1280 | light · dark | key-verified--desktop-1280--{light,dark}.png |

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- **Dải nói bằng id máy.** Hiển thị `oneflow-api-ffmpeg · oneflow-api-pyscenedetect` — với seller
  VN đó là nhiễu, không phải thông tin. Vá ở tầng **kiểu dữ liệu** chứ không ở tầng nhãn:
  `pluginIds: string[]` → `capabilities: string[]`. Bỏ id khỏi chữ ký component thì không còn
  đường để nó lọt ra UI; việc dịch slot → nhãn người đọc bị đẩy lên tầng gọi, đúng chỗ nó thuộc về.
- **Key prompt cũng nói bằng id.** `pluginId` → `providerName`; câu chữ đổi từ "Plugin
  tongflow-api-openai cần khoá" sang "Node này gọi tới OpenAI. Dán khoá của chính bạn để chạy."
  `OPENAI_API_KEY` giữ nguyên dạng máy có chủ đích — đó là tên biến người dùng gặp trong tài liệu
  OpenAI, dịch ra sẽ làm họ không đối chiếu được.
- **Nhãn nút nói việc của app.** "Chuẩn bị OneFlow" → (owner) "Tải công cụ để chạy ví dụ" → rút
  gọn còn **"Tải công cụ"** sau khi thấy nó lặp vế "để chạy ví dụ" với tiêu đề ngay bên trên.
- **`truncate` xoá thông tin trong im lặng.** Ở cửa sổ hẹp, tiêu đề cụt còn "Cần tải 2 …" và dòng
  năng lực cụt còn "Tách cảnh v…" — dải chỉ còn một cái nút không nêu lý do, tức vi phạm AC-4 mà
  layout vẫn trông gọn. Bỏ `truncate` ở hai dòng chữ chính, xếp dọc khi hẹp. **Không phải** cam
  kết mobile: mobile ngoài phạm vi; đây là chống vỡ cho cửa sổ desktop bị thu hẹp.
- **Slot id lọt vào khung mock.** `split-video` / `image-gen` trong subtitle node → "chưa chạy" /
  "cần khoá OpenAI".
- **Chữ đen trên nền đen trong dark mode.** axe đo `1.34:1` (`#0a0a0a` trên `#1e2939`) ×6: khung
  mock đặt `dark:bg-gray-800` cho nền nhưng không có biến thể dark cho CHỮ. Thêm cặp
  `text-…/dark:text-…`.
- **Trộn token ngữ nghĩa với màu palette thô.** `text-muted-foreground` (chỉnh cho `--card`) đặt
  trên `dark:bg-gray-800` (`#1e2939`, ngả xanh và sáng hơn `--card`) → `2.98:1`. Chuyển toàn bộ bề
  mặt sang `bg-card` / `text-card-foreground` / `bg-muted` / `bg-background`. Đây là kiểu viết
  copy từ `base-node-shell.tsx` của repo — xem Nhóm 2.
- **Làm mờ bằng opacity để thể hiện trạng thái.** Mốc chưa tới dùng `text-muted-foreground/60` →
  `2.29:1` trên trắng và `3.31:1` trên nền tối. Bỏ hẳn `/60`: dấu ✓ và độ đậm của bước hiện tại
  vốn là tín hiệu mạnh hơn độ mờ, và chúng không đánh đổi bằng khả năng đọc.
- **`text-emerald-600` cho trạng thái thành công** = `3.65:1` trên trắng, dưới AA →
  `emerald-700` + `dark:emerald-400`.

### Nhóm 2 — đòi-đổi-DS/công-cụ (Cổng 1 đã quyết, 2026-08-07)

- **Repo chưa khai `design_pass.ds_skill`.** Thang DS rơi xuống nấc 2 — phiên chạy trên **token
  của repo** (shadcn-style: `--color-*`, `muted-foreground`, `destructive`). Owner quyết ở Gate 1:
  nhận nấc này làm chuẩn repo, hay đầu tư một skill DS riêng. Cùng gốc với ghi chú S1 rằng
  `feature_loop.ui_standards_skill` cũng chưa khai.
  → **Quyết: nhận nấc token-của-repo làm chuẩn.** Không đầu tư skill DS riêng. Hệ quả phải sống
  chung: bảng token không tự chứng minh được a11y, nên mọi phiên design-pass sau vẫn phải đo bằng
  axe-core trong Chrome thật.
- **Cặp token `text-muted-foreground` trên `bg-muted` hụt AA — lỗi cấp repo.** axe đo `4.34:1`
  (`#737373` trên `#f5f5f5`) ×18, cần 4.5. Đây là hai token của chính repo đặt cạnh nhau, nên mọi
  bề mặt dùng cặp này trong toàn app đều dính, không riêng feature này. Vá tại chỗ trong bản dựng
  bằng cách đổi chữ sang `text-foreground`, nhưng **gốc nằm ở bảng token** và cần Cổng 1 quyết:
  chỉnh `--muted-foreground` tối thêm một nấc, hay chấp nhận và ghi Known limits.
  → **Quyết: chỉnh token tối thêm một nấc — nhưng ở hạng mục riêng, không trong diff của feature
  này.** Lý do tách: cặp token này chạm mọi màn hình, nên nó cần tiêu chí nghiệm thu của chính nó;
  gộp vào đây sẽ nới bán kính nổ của feature rộng hơn đúng cái mà AC-14 đang canh.
  Ngưỡng đã tính: nền `--muted` sáng là `#f5f5f5`, nên chữ phải xuống tới **kênh ≤ `#707070`**
  (hiện `#737373`) mới đạt 4.5. Con số đó là điểm khởi hành, **không phải bằng chứng** — hạng mục
  riêng phải đo lại bằng axe, cả light lẫn dark.
- **Repo không có token `success`.** Trạng thái "khoá hoạt động" phải mượn `emerald-700` từ bảng
  màu Tailwind vì từ vựng ngữ nghĩa không có sắc thái thành công (chỉ có `destructive`).
  → **Quyết: chấp nhận, đi kèm quyết định nhận chuẩn token-của-repo.** Tiếp tục mượn `emerald-700`
  / `dark:emerald-400`; không thêm token mới trong feature này.
- **Design gate không chạy được ở chế độ DOM.** `design-gate.mjs --mode dom` trả BLOCKED:
  *"DOM mode needs jsdom but it could not be resolved"*. Chế độ `static` cho PASS 0 finding trên
  cả hai component, nhưng chính nó tự khai **"cannot see computed contrast"** — nên đó là lời
  khẳng định yếu, không phải sàn a11y đã đạt. **Hệ quả trực tiếp: E19 sẽ BLOCKED ở S4** nếu jsdom
  không có mặt nơi eval chạy. **Đã giải quyết bằng cách thay phép đo, không phải bằng cách cài
  thêm gói:** jsdom vốn đã có trong devDependencies (`^30.0.1`) — BLOCKED chỉ là lỗi đường
  resolve vì gate chạy từ plugin cache. Nhưng ngay cả khi truyền `--jsdom <repo>`, jsdom vẫn báo
  `Could not parse CSS stylesheet` ×19: CSS của repo dùng `color-mix()` ×235, `oklch()` ×165,
  `:is()` ×127, `@supports` ×97. Không parse được CSS thì không có màu tính toán, nên phép đo
  contrast **không hề tồn tại** dù verdict là PASS. E19 nay bind vào `executors.design.a11y` —
  axe-core chạy trong Chrome thật.

## Vì sao đổi công cụ đo (ghi lại để không ai lặp lại)

Bốn lớp kiểm tra liên tiếp đều báo PASS, không lớp nào sai về kỹ thuật, không lớp nào **nhìn**:

| Công cụ | Kết quả | Vì sao vô nghĩa |
|---|---|---|
| design gate `--mode static` | PASS, 0 finding | tự khai "cannot see computed contrast" |
| design gate DOM trên `.tsx` | PASS | parse mã nguồn TSX như HTML (`<keyround>` thành thẻ) |
| design gate DOM trên HTML + CSS nội tuyến | PASS | jsdom không parse nổi CSS hiện đại |
| **axe-core trong Chrome thật** | **REJECT, 11 vi phạm** | đọc đúng computed style mà mắt người thấy |

Nếu dừng ở bất kỳ lớp nào trong ba lớp đầu, hồ sơ sẽ mang một chứng chỉ PASS kèm lỗi chữ đen trên
nền đen `1.34:1`. Thứ cứu tình huống không phải công cụ nào — mà là một nghi ngờ thị giác cụ thể
đủ nhọn để không nhận một chữ PASS chung chung.

Sau khi vá 5 lỗi contrast: **PASS thật — 20/20 trang, 0 vi phạm critical/serious.**
