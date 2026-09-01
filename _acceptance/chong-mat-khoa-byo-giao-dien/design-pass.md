---
slug: chong-mat-khoa-byo-giao-dien
at: 2026-09-01T09:40:00Z
route: http://localhost:3000/proto/chong-mat-khoa-byo-giao-dien
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (không đồng bộ trên ảnh — 12 khung gửi kèm thẻ Cổng 1)
options:
divergence: skipped — hình dạng bị khoá kín bởi sáu tiêu chí nguyên văn đã duyệt ở Cổng 1 của hợp đồng cha cộng bốn quyết định owner; không còn ≥2 hướng khả dĩ để bày
ds_skill: repo-tokens
states: [store-unreadable, store-unreadable-confirm, panel-unreadable]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 4
deferred: 4
---

# design-pass — chong-mat-khoa-byo-giao-dien

`context: static-frame`, cùng nấc và cùng lý do với hồ sơ cha: màn Cài đặt thật là
một `Dialog` tự gọi `/api/settings/env` khi mở và **không có mối nào để tiêm trạng
thái vào**. Mở mối đó là hiện thực — việc của S3. Nhưng các tấm bên trong ghép từ
đúng primitive mà màn thật dùng (`ui/button`, `ui/alert-dialog`) cộng chính
component sẽ ship (`StoreUnreadableNotice`), trên token của repo.

**Hơn bản mẫu của hồ sơ cha ở một điểm đã đo:** ở đó bước xác nhận là một thẻ thứ
hai NẰM DƯỚI màn, nên người duyệt không thấy được hộp thoại phủ lên màn Cài đặt.
Ở đây `AlertDialog` thật được giữ mở, nên quan hệ phủ đúng là quan hệ sẽ ship.

## Ma trận capture

12 khung. Mỗi khung qua cửa `--require` của `ui:capture` — công cụ **từ chối ghi**
khi khung không chứa chuỗi bắt buộc, nên một state gõ sai không thể sinh ra khung
trông hợp lệ. Trục sáng/tối được **đọc lại từ DOM đã render** của từng khung
(`--html`), không suy từ URL — xem Nhóm 1 mục 3.

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

**Đã kiểm trên bản ĐANG CHẠY bằng truy vấn DOM, không đọc bằng mắt trên mã:**

| Khẳng định | Đo được |
|---|---|
| form khoá bị THAY, không bị phủ | `inputCount: 0` ở `store-unreadable` |
| nút Lưu hiện diện và tắt | `{t:"Lưu", disabled:true}` |
| đúng MỘT nút thoát | 1 nút `Thay kho khoá bằng kho trống…` |
| tấm nêu đúng câu trấn an | `saysUnchanged: true` |
| hộp xác nhận nói đúng hai ý | `saysLost:true · saysUnrecoverable:true · saysAreYouSure:false`, `role="alertdialog"` |
| nút huỷ-diệt dùng biến thể thật | class có đủ `dark:bg-destructive/60` + `dark:focus-visible:ring-destructive/40` |
| hai panel node KHÔNG có nút thoát | `escapeButtons: 0`, 2 tấm alert / 2 lối sang Cài đặt / 0 alertdialog |
| thứ tự tiêu đề | `store-unreadable` H1→H2 · `panel-unreadable` H1→H2→H3→H2→H3 |

**a11y bằng dụng cụ thật** (`scripts/settings/check-a11y-proto.sh` → axe-core trong
Chrome thật, 6 trang): `verdict: PASS · blocking: 0`, và
`6/6 rendered the state AND the theme they were asked for`. Cả hai chiều đỏ đã đo —
xem Nhóm 1 mục 3 và 4.

## Cảnh ngữ-cảnh

Không áp dụng — `context: static-frame`, không phải `standalone`.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

1. **Thứ tự tiêu đề nhảy bậc H1 → H3** ở cả hai trạng thái màn Cài đặt: tấm thông
   báo ghi cứng `h3`, trong khi nó nằm thẳng dưới tiêu đề màn. Đã thêm prop
   `headingLevel` (mặc định `2`); trong panel node nó nhận `3` vì ở đó nó nằm dưới
   `h2` của panel. Đo lại: `H1→H2` ở màn Cài đặt, `H1→H2→H3→H2→H3` ở panel.

2. **Hai nút trùng tên gọi, không có ngữ cảnh phân biệt.** `panel-unreadable` vẽ
   hai panel mà nút duy nhất của cả hai đều đọc là "Mở màn Cài đặt" — người dùng
   trình đọc màn hình chuyển giữa các nút không có cách nào biết mình đang trả lời
   panel nào. Đã cho mỗi panel `aria-labelledby` trỏ vào `h2` của nó, trả lại đúng
   ngữ cảnh mà người nhìn thấy được nhờ vị trí.

3. **Nửa "sáng" của ma trận chưa bao giờ sáng — và cùng lỗ đó nằm trong phép đo của
   AC-14.** [`layout.tsx:34-42`](../../src/app/layout.tsx) chạy một script khởi động
   thêm `.dark` vào `<html>` khi `localStorage` chưa có `theme` **và** hệ điều hành
   ưa tối. Chrome không đầu không có `localStorage`, nên trên máy đặt tối **mọi**
   trang bản mẫu vẽ ra tối, kể cả nửa mà ma trận gọi là "sáng". 12 khung đầu tiên
   của phiên này đều tối, và cả 12 đều qua cửa `--require`.
   Nguy hiểm hơn: bản wrapper thừa hưởng đọc lại `class="dark"` từ HTML do **`curl`**
   lấy về. HTML máy chủ gửi thì KHÁC nhau giữa hai URL, nên phép đọc lại đó in ra
   "3 sáng + 3 tối" và cho qua — trong khi trình duyệt axe điều khiển đã vẽ CÙNG MỘT
   giao diện hai lần. Ba trạng thái bị quét hai lượt trong tối, mà tương phản ở giao
   diện tối chính là lý do tồn tại của ô đo này.
   Vá ở **cả hai tầng**: (a) route bản mẫu ghim class gốc theo tham số `theme` khi
   tham số đó CÓ MẶT (`theme=light` gỡ `.dark`, `theme=dark` thêm vào; URL trần giữ
   nguyên hành vi cũ để không tự ý đo lại ba bản mẫu có trước); (b) wrapper đọc trục
   sáng/tối **từ DOM đã render** qua `ui-capture --html` chứ không từ `curl`.
   **Chiều đỏ đã đo:** URL trần vẽ ra `<html lang="en" class="dark">` trong khi
   `curl` trên cùng URL đếm được **0** lần `class="dark"` — đúng cái xanh-giả, chứng
   bằng phép đo chứ không bằng lập luận.

4. **Tương phản 4.33:1 — vi phạm mức `serious`, chỉ ở giao diện SÁNG.** Ngay sau khi
   vá mục 3, axe tìm ra: dòng nêu lý do dùng `text-muted-foreground` (#737373) trên
   nền `bg-destructive/5` (#fef2f3) ở 12px = **4.33:1**, dưới sàn 4.5:1, ở cả ba
   trạng thái. Token `muted-foreground` được hiệu chỉnh cho nền `background`/`card`,
   không cho một nền đã nhuộm. Đã chuyển phân cấp sang **cỡ chữ và độ đậm** thay vì
   màu: dòng lý do lên `text-foreground`, câu trấn an lên `text-sm font-medium` —
   không chèn hex nào. Đo lại: `blocking: 0`.
   *Đây là bằng chứng trực tiếp rằng mục 3 đáng vá:* lỗi này nằm đúng ở nửa chưa
   bao giờ được quét.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

1. **Hai hồ sơ ĐÃ KÝ có cùng lỗ trục sáng/tối — việc của người duyệt.**
   `scripts/media-library/check-a11y-proto.sh` và `scripts/onboarding/check-a11y-proto.sh`
   đều dựng URL trần cho nửa sáng, nên bằng chứng a11y đã ký của chúng phủ **một**
   giao diện chứ không phải hai. Hai bản còn khác nhau về độ nặng:
   media-library CÓ đọc lại cả `data-proto-state` lẫn `class="dark"` nhưng **từ
   `curl`** (dòng 135), nên trục state của nó đúng còn trục theme là xanh-giả;
   onboarding **không có phép đọc lại nào** (0 lần `data-proto-state`, 0 lần
   `class="dark"`) — ở đó một state bị đổi tên là hoàn toàn vô hình.
   **Đính chính, đo bởi phiên `amazing-kapitsa-45dd7a` (01/09):** trục state của
   onboarding không chỉ *không được đọc* mà **không đọc được** — bản mẫu
   `byo-key-onboarding-proto.tsx` KHÔNG hề phát ra `data-proto-state` (chỉ
   `add-media-library` và `normalize-text-vi` có). Nặng hơn một bậc so với dòng
   trên: phép kiểm đó không thể tồn tại kể cả nếu có người viết ra nó.
   **Việc cho người duyệt:** hai hồ sơ đó có cần đo lại không. Song song đúng nghĩa
   với việc hồ sơ cha đặt ra về `design.gate`.

2. **`build/bko-a11y` không được khai trong `tsconfig.json`.** Wrapper onboarding
   chạy với `NEXT_DIST_DIR=build/bko-a11y`; khi dist dir KHÔNG có trong `include`,
   Next **ghi lại `tsconfig.json`**. Suite chạy song song nên lint đọc tệp đó NGAY
   TRONG cửa sổ ấy — đúng lớp lỗi mà chú thích trong wrapper media-library mô tả.
   Một dòng sửa, nhưng nằm ngoài phạm vi gói này.
   **Mức tàn phá lớn hơn "thêm một dòng", đo bởi phiên `amazing-kapitsa-45dd7a`
   (01/09) trên một dist dir CHƯA khai:** Next vừa chèn dòng, vừa **định dạng lại
   toàn bộ tệp** (4 space → 2 space, bung mọi mảng nội dòng) — diff 80 dòng trên
   một tệp chỉ sửa một dòng, và ai phản xạ vứt tệp đi để dọn diff sẽ mất luôn sửa
   đổi của chính mình.
   **Điều kiện — hai vế đã đo, mỗi phiên một vế, rồi đối chứng có kiểm soát:**
   *khai TRƯỚC thì hiện tượng không xảy ra.* Ba lượt chạy wrapper của gói này với
   `NEXT_DIST_DIR=build/kkt-a11y` (thư mục `build/kkt-a11y/` đã sinh, tức Next thật
   sự chạy) để lại `git diff tsconfig.json` đúng bằng **2 thêm / 1 bớt** — chỉ dòng
   mình thêm, thụt lề 4 space nguyên vẹn. Phiên `amazing-kapitsa-45dd7a` sau đó chạy
   vế còn lại trên cây của họ, cùng lệnh cùng công cụ, **đổi đúng một biến**: khai
   `build/bko-a11y` trước rồi chạy → `tsconfig.json` **giống hệt từng byte**
   (sha256 `51297eb8…`); không khai `build/proof-a11y` → chèn dòng **và** định dạng
   lại toàn tệp. Nên thứ tự là load-bearing: **khai dòng rồi mới chạy guard.**
   **Phạm vi thật của nguy cơ, đã thu hẹp:** nó **KHÔNG** là nguy cơ thường trực của
   ba wrapper — `aml-a11y`, `bko-a11y`, `kkt-a11y` đều sẽ được khai, nên không cái
   nào kích hoạt được. Cái còn lại là **lượt chạy tuỳ hứng với một dist dir mới toanh**
   (ai đó gỡ lỗi bằng một `NEXT_DIST_DIR` tạm). Đừng đọc thành "mọi dist dir tự chọn
   đều ghi lại tsconfig".
   Và dù ở vế nào cũng đừng vá bằng khôi phục tay giữa lượt: suite chạy SONG SONG nên
   lint đọc tệp đó ngay trong cửa sổ ấy — đúng lỗi đã làm đỏ S4 vòng 8 của hồ sơ
   media-library, và cũng là lý do wrapper đó **xoá** `git checkout` thay vì sửa nó.

3. **Repo chưa khai `design_pass.ds_skill`** → phiên chạy trên `repo-tokens` (từ vựng
   token trong `src/app/globals.css`, đủ bộ shadcn). Cùng gốc với việc
   `feature_loop.ui_standards_skill` cũng vắng: artifact UI của vòng này không có
   đối trọng chuẩn nội nào ngoài token.

4. **`design_pass.host_embed` vắng** → không có đường nhúng rẻ vào host thật, nên
   phiên dừng ở `static-frame`. Hệ quả cụ thể: bản mẫu không cho thấy màn Cài đặt
   thật là một `Dialog` đã phủ sẵn, nên hộp xác nhận ở đây là lớp phủ THỨ NHẤT trong
   khi khi chạy thật nó là lớp phủ THỨ HAI. Người duyệt nên đọc quan hệ đó từ
   design doc chứ đừng đọc từ ảnh.
