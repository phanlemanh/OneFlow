# Thiết kế — lát L3: tầng B, memo theo workflow

> Lát **L3** của [spec cache](../../spec/prd/engine-cache-partial-rerender.md) §6.
> Tài liệu tự chứa. **Tiền đề:** L2 merge 30/07 (PR #32) — store trên đĩa, tầng A,
> tenant trong khoá, fail-closed toàn tuyến.
> **Quyết định bởi:** Manh, 2026-07-30 · **Chặn:** L4 (eviction/purge/reuse API).

## 1. Lát này giao gì

Tầng B: slot **bất định** (seed/temperature chưa ghim) được dùng lại **trong phạm vi một
workflow của một tenant**. Đây là nửa còn lại của kịch bản tham chiếu §4: đổi giá →
`compose-overlay` (tầng A, chạy lại vài giây CPU) còn **`image-gen-video` không chạy lại**
— vì input của nó không đổi và bản nó đã sinh cho workflow này còn trong cache.

Ngữ nghĩa giữ nguyên D3: *"input không đổi → dùng lại đúng cái bạn đã tạo ra"* — không phải
"cùng input → cùng output" (bất khả thi với model không seed).

Kèm theo, đã chốt gộp: **fix `plugin_is_dirty` fail-open** — Known limits của L2 đánh dấu nó
là ứng viên sửa đầu tiên của lát kế, và L3 đằng nào cũng sửa `node_cache.py` nên L2 đằng nào
cũng ký lại; fix đi cùng không tốn thêm chữ ký nào.

## 2. Khoá tầng B: thêm `workflowScope`, `v` 2 → 3

Thành phần mới trong dict băm: `workflowScope`.

- **Tầng A:** `"workflowScope": null` — giữ bất biến của L1: mọi thành phần phát vô điều
  kiện, không có trục absence-collision.
- **Tầng B:** `"workflowScope": "wf:<workflowId>:node:<nodeId>"`.

**`nodeId` VÀO khoá** (quyết định 30/07, Manh): "cái bạn đã tạo ra" tính theo **từng node**.
Nhân đôi một node sinh ảnh để mong biến thể → node mới sinh mới (đúng kỳ vọng); đổi giá →
node gen giữ nguyên input vẫn trúng (đúng kịch bản §4). Node id ổn định qua các lần export
(nó là id của canvas node, persist trong workflow doc) nên không mất hit giữa các run.
Phương án bị loại: chỉ `workflowId + input` — đúng nghĩa đen "memo theo workflow" nhưng đảo
kỳ vọng nhân-đôi-node, và hai node giống nhau vĩnh viễn không thể khác nhau nếu không đổi
input.

**`v` bump 2 → 3** vì khoá thêm thành phần cho MỌI entry (tầng A mang `null` tường minh).
Cùng lập luận hai lần trước: L2 vừa merge hôm nay, entry chỉ tồn tại trên máy dev — bump bây
giờ gần miễn phí; bump sau khi cloud chạy thật là vô hiệu hoá cache sống. Vector L1 sinh lại
lần nữa; guard AC-14 của L1 tự chứng minh cú bump (3 → 4 trong bản copy temp của nó).

**Hệ quả cho L1:** `fingerprint.py` đổi → `cache-l1-fingerprint` ký lại. **Báo giá ngay ở
Cổng 1 lần này** — L2 từng phát hiện muộn chi phí `conformance-l0`, không lặp lại.

## 3. `TIER_B_SLOTS`: allowlist tường minh, đúng 23 slot có núm

Cùng nguyên tắc L2: **không suy từ ABI lúc chạy** — hằng số liệt kê tay, review được từng
dòng. Nhưng danh sách được **dẫn xuất một lần** từ ABI (slot có `seed`/`temperature`/`top_p`
trong `inputs.properties`) và ghim lại:

`audio-video-lip-sync · gen-music · image-edit · image-fusion · image-gen · image-gen-model ·
image-gen-text · image-gen-video · image-image-gen-video · image-upscale · images-gen-video ·
music-complete · music-cover · music-extract · music-lego · music-repaint ·
speech-text-gen-video · speech-video-gen-video · text-gen-video · video-edit ·
video-gen-text · video-image-gen-video-move · video-upscale`

(23 slot. Lưu ý `image-upscale`/`video-upscale` có `seed` nên nằm ở B — D3 từng ví dụ
"image-upscale (đã ghim seed)" thuộc A, nhưng seed hiện KHÔNG bị ghim ở đâu cả, nên B là
đúng cho tới khi có cơ chế ghim.)

**Cố ý hoãn — descope có revisit:** nhóm sinh-nội-dung-không-núm (`gen-text`,
`image/video/audio-describe`, `music-brief`, `text-gen-speech-*`). Chúng bất định nhưng
không có núm nào để "chưa ghim"; cache chúng là mong muốn thật (gen-text không đổi input mà
chạy lại là tốn tiền vô ích) nhưng kỳ vọng của người dùng với lời gọi LLM lặp lại chưa rõ —
mở sau khi có tiếng nói người dùng, chỉ là thêm dòng vào hằng số.

Một slot nằm ở CẢ hai allowlist là lỗi cấu hình — test khẳng định giao của
`TIER_A_SLOTS ∩ TIER_B_SLOTS = ∅`.

## 4. Plumbing `workflowId`: TS → bridge → runner

`ExecutableWorkflow` không mang id, nhưng [`runner.ts:118`](../../../src/lib/task/runner.ts)
có `task.workflowId` ngay tại chỗ gọi. Đường đi giống hệt `tenant` của L2:

- `runner.ts` truyền `workflowId` vào `executeWorkflowViaEngine` → `engineOptionsFor` nhận
  thêm và phát `workflow_id` (string hoá; `null` khi task đơn lẻ không thuộc workflow nào).
- Bridge đọc `options.workflow_id` → `run_workflow(workflow_id=...)`.
- Runner: node thuộc `TIER_B_SLOTS` **và** `workflow_id` có giá trị → khoá mang
  `workflowScope`; `workflow_id` vắng → tầng B **tắt** cho run đó (fail-closed, tầng A không
  ảnh hưởng). Task đơn lẻ (chạy một node ngoài workflow) vì thế không cache tầng B — đúng:
  "memo theo workflow" không có nghĩa khi không có workflow.

## 5. Fix `plugin_is_dirty` fail-open (gộp)

Một dòng: `git status --porcelain` exit khác 0 → coi là **dirty** (trước: coi là sạch).
Đóng kịch bản S4-L2 đã ghi: index hỏng/lỗi quyền → rev đọc được mà độ bẩn không biết được →
code đã sửa bị cache dưới khoá rev-sạch. Kèm test: repo có `.git` nhưng `git status` fail
(mock returncode ≠ 0) → không đọc, không ghi.

## 6. Không đổi

Store/blob/atomic/self-heal của L2 nguyên vẹn — tầng B chỉ là **một thành phần khoá khác**,
toàn bộ cơ chế đọc/ghi/lành dùng chung. D8 (không cache thất bại), quy tắc hai-chiều, sentinel
tenant: giữ nguyên. Không đụng `callog.py`, `scan.py`, `plugins.py`, `store.py`.

## 7. Test then chốt

- Kịch bản §4 thu nhỏ: workflow `image-gen-video`(B) → `concat-videos`(A), đổi một input
  của node A hạ nguồn → node B **0 lời gọi** (bản sinh được giữ), node A chạy lại.
- Hai workflow khác id, cùng tenant, cùng input, cùng node id → **không** chia sẻ (B của
  workflow này không phục vụ workflow kia).
- Nhân đôi node (id khác) cùng input trong một workflow → node mới **sinh mới**.
- `workflow_id` vắng → slot B không đọc không ghi; slot A vẫn cache bình thường.
- Giao hai allowlist rỗng; slot không thuộc list nào → không cache (fail-closed giữ nguyên).
- Dirty-detector: `git status` fail → dirty.

## 8. Ngoài phạm vi

Eviction/LRU/`purge()`/`reuse=` API (L4) · nhóm sinh-nội-dung-không-núm (descope có revisit)
· cơ chế "ghim seed để lên tầng A" (cần UI + ABI, lát riêng) · `1.1-L2b` (desktop asset
cache) và `1.1-L1b` (mime/filename) giữ nguyên hàng đợi.

---

**Người viết:** Claude (phiên 2026-07-30) · **Quyết định:** Manh 2026-07-30 ·
**Kế tiếp:** contract + evals, gap-probe, Cổng 1.
