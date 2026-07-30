---
schema_version: 1
feature: Cache L3 — tier B, per-workflow memo for nondeterministic slots
slug: cache-l3-tier-b
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [sdk, api]
status: draft
approved_by:
approved_at:
time_human_minutes: {gate1: 0, gate2: 0}
---

# Acceptance Contract: cache-l3-tier-b

## Context

Tầng B đóng nốt kịch bản tham chiếu §4 của [spec cache](../../docs/spec/prd/engine-cache-partial-rerender.md): đổi giá → node overlay (tầng A) chạy lại vài giây CPU, còn **node sinh video không chạy lại** — bản nó đã sinh cho workflow này còn trong cache. Ngữ nghĩa D3 giữ nguyên: *"input không đổi → dùng lại đúng cái bạn đã tạo ra"*, không phải "cùng input → cùng output".

Thiết kế: [2026-07-30-cache-l3-tier-b-design.md](../../docs/superpowers/specs/2026-07-30-cache-l3-tier-b-design.md). Bốn quyết định định hình:

1. **`nodeId` VÀO khoá** (Manh 30/07): "cái đã tạo ra" tính theo từng node — nhân đôi node sinh ảnh phải sinh mới; đổi giá thì node gen giữ nguyên input vẫn trúng.
2. **Khoá thêm `workflowScope`** (`null` cho tầng A — mọi thành phần phát vô điều kiện, giữ bất biến L1; `"wf:<id>:node:<id>"` cho tầng B), **`KEY_SCHEMA_VERSION` 2 → 3** khi entry chỉ mới tồn tại trên máy dev.
3. **`TIER_B_SLOTS` = đúng 23 slot có núm** (`seed`/`temperature`/`top_p`), dẫn xuất một lần từ ABI rồi ghim thành hằng; nhóm sinh-nội-dung-không-núm descope có revisit.
4. **Gộp fix `plugin_is_dirty` fail-open** — Known limits của L2 đánh dấu là ứng viên sửa đầu tiên; L3 đằng nào cũng sửa `node_cache.py` nên không tốn thêm chữ ký.

**Chi phí ký lại, báo giá NGAY tại Cổng 1** (bài học L2 phát hiện muộn `conformance-l0`): L3 sửa `fingerprint.py` (→ `cache-l1-fingerprint` ký lại), `node_cache.py` + `runner.py` + `engine-delegate.server.ts` + `__main__.py` + test files (→ `cache-l2-store` ký lại; `runner.py`/`engine-delegate.server.ts` cũng thuộc sở hữu gốc của `conformance-l0` → ký lại lần nữa). Ba chữ ký kèm PR này.

## Criteria

**Kế thừa nguyên văn hai quy tắc chung của L2** (contract `cache-l2-store`, mục `## Criteria`): (1) mọi so sánh hai khoá phải ép cả hai vế là chuỗi khác `None`, 64 hex thường — ngoại lệ duy nhất là tiêu chí mà không-cacheable *là* kết quả đúng; (2) mọi tiêu chí "không cacheable" kiểm **cả hai chiều** — không đọc và không ghi.

- AC-1: Given workflow hai node `image-gen-video`(tầng B) → `concat-videos`(tầng A) đã chạy với `workflow_id` và `tenant` hợp lệ, When chạy lại y hệt cùng `data_dir`/`workflow_id`, Then invoker **0 lần** cho CẢ hai node và outputs byte-identical (chuẩn hoá duy nhất cho handle đục của store, kế thừa AC-1 của L2). *Kịch bản §4 thu nhỏ, nửa "trúng": tầng B trúng CÙNG tầng A trong một run trộn.*
- AC-2: Given workflow ở AC-1 đã ấm, When đổi một input của **node tầng A hạ nguồn** rồi chạy lại, Then node tầng B **0 lời gọi** (bản sinh được giữ) và node tầng A chạy lại đúng 1 lần. *Đây là toàn bộ mệnh đề kinh tế: sửa phần rẻ không kéo sinh lại phần đắt. Nếu khoá tầng B vô tình nuốt input của node khác (khoá theo mức workflow thay vì per-call), tiêu chí này đỏ.*
- AC-3: Given cùng tenant, cùng input, cùng `nodeId`, nhưng **`workflow_id` khác nhau**, When chạy workflow thứ hai, Then invoker **vẫn được gọi** cho slot tầng B và hai entry riêng tồn tại. *Memo theo workflow nghĩa là bản sinh của workflow này không phục vụ workflow kia — dùng chung `data_dir` là điều kiện bắt buộc của ca kiểm, như AC-9 của L2.*
- AC-4: Given một workflow có **hai node tầng B khác `nodeId`** mang input giống hệt nhau, When chạy, Then invoker được gọi cho **cả hai** và hai entry riêng tồn tại. *Quyết định nodeId-vào-khoá: nhân đôi node để mong biến thể phải sinh mới. Nếu khoá bỏ nodeId, tiêu chí này đỏ — nó là guard trực tiếp của quyết định 30/07.*
- AC-5: Given task **không có `workflow_id`** (task đơn lẻ, hoặc field vắng trong options), When chạy hai lần một workflow chứa slot tầng B và slot tầng A, Then slot tầng B **không đọc không ghi** (cả hai chiều, cả hai lần invoker gọi đủ) còn slot tầng A **vẫn cache bình thường**. *Fail-closed có phạm vi: thiếu scope tầng B chỉ tắt tầng B — tắt cả tầng A là phạt nhầm.*
- AC-6: Given hằng số `TIER_B_SLOTS`, When kiểm nội dung, Then nó bằng đúng 23 slot có núm liệt kê trong design §3 **và** `TIER_A_SLOTS ∩ TIER_B_SLOTS = ∅` **và** nhóm sinh-nội-dung-không-núm (`gen-text`, `image-describe`, `video-describe`, `audio-describe`, `music-brief`) **không** thuộc list nào. *Một slot ở cả hai tầng là hai ngữ nghĩa cache cho một phép tính; slot descope lọt vào là mở rộng scope không qua gate.*
- AC-7: Given khoá tầng A ở v=3, When so payload với v=2, Then thành phần `workflowScope` phát **vô điều kiện** bằng `null` cho tầng A (không phải vắng field), và hai input y hệt chỉ khác tầng cho khoá khác nhau. *Giữ bất biến L1 "mọi thành phần phát vô điều kiện, không có trục absence-collision"; đồng thời chứng minh v=3 thật sự đổi khoá tầng A (invalidation có chủ đích, R6).*
- AC-8: Given thư mục plugin có `.git` nhưng `git status --porcelain` **exit khác 0** (mô phỏng index hỏng/lỗi quyền), When chạy hai lần, Then coi là **dirty** — không đọc, không ghi, invoker gọi đủ cả hai lần. *Fix fail-open gộp từ Known limits của L2: rev đọc được mà độ bẩn không biết được thì code đã-sửa bị cache dưới khoá rev-sạch — hiểm hoạ R1. Chiều fail phải khớp mọi đường lỗi khác của file: về phía tắt cache.*
- AC-9 **(cross-layer)**: Given `runner.ts` xử lý task workflow có `task.workflowId`, When dựng request qua `engineOptionsFor`, Then `options.workflow_id` là chuỗi số đó; và given task không thuộc workflow nào, Then `options.workflow_id` là `null` — **không bao giờ** là chuỗi rỗng; **và** given engine nhận `options.workflow_id` qua bridge NDJSON, Then giá trị tới được `run_workflow` (kiểm qua đúng đường bridge, hai nửa đo riêng như AC-14 của L2). *Cùng lớp bug dịch-thuật vô-hình-tới-lúc-hỏng đã có tiền lệ; seam `engineOptionsFor` của L2 tái dùng nên mutation xoá dòng `workflow_id` phải làm eval TS đỏ.*
- AC-10: Given vector L1 sinh lại dưới v=3, When chạy guard AC-14 của L1 (bump 3→4 trong bản copy temp), Then guard vẫn đỏ-rồi-xanh đúng chiều — và mọi eval của L1, L2 pass trên cây mới. *Hai feature ký lại phải ký trên bằng chứng chạy lại thật, không phải carry tự động.*

## Coverage

Quét CT-S bằng trục của L2 tái dùng có điều chỉnh (L3 là thành phần khoá mới trên cùng cơ chế store, không phải cơ chế mới): **trục A — cổng cacheable tầng B** (ngoài `TIER_B_SLOTS` | thiếu `workflow_id` | dirty-detector lỗi | đủ điều kiện) → AC-5/6/8; **trục B — phạm vi chia sẻ** (cùng wf cùng node | cùng wf khác node | khác wf | khác tenant) → AC-1/4/3 + AC-9 của L2 (khác tenant đã có, không lặp); **trục C — tương tác hai tầng trong một run** (trộn A+B trúng | A đổi B giữ | B tắt A sống) → AC-1/2/5; **trục D — lược đồ khoá** (null vô điều kiện | v bump | vector) → AC-7/10. Ô "batch tầng B" cố ý không có AC riêng: fan-out per-call của L2 áp nguyên (mỗi `call_params` một khoá, `workflowScope` chung), AC-11 của L2 đã canh cơ chế — ghi ở đây để reviewer thấy ô đã quét chứ không bị sót.

## Out of scope

- **Eviction / LRU / trần dung lượng / `purge()` / `reuse=` API** — L4.
- **Nhóm sinh-nội-dung-không-núm** (`gen-text`, describes, TTS, `music-brief`) — descope có revisit trong ledger; mở là thêm dòng vào hằng số.
- **Cơ chế "ghim seed để một slot B lên tầng A"** — cần UI + ABI, lát riêng.
- **Không đụng `callog.py`, `scan.py`, `plugins.py`, `store.py`.**
- **`1.1-L2b`** (desktop asset cache) và **`1.1-L1b`** (mime/filename) giữ nguyên hàng đợi.

## Notes

- **Ba chữ ký kèm PR này** (báo giá tại Cổng 1): `cache-l1-fingerprint` (sửa `fingerprint.py`), `cache-l2-store` (sửa `node_cache.py`/`runner.py`/tests), `conformance-l0` (sửa `runner.py`/`engine-delegate.server.ts` — sở hữu gốc). Bảy feature còn lại dự kiến carry-forward theo luật per-file.
- **`image-upscale`/`video-upscale` nằm ở B dù D3 từng minh hoạ upscale-đã-ghim-seed thuộc A** — seed hiện không bị ghim ở đâu; ví dụ của D3 mô tả trạng thái tương lai có cơ chế ghim.
- **Nhóm không-núm chưa cache là tiền thật bỏ lỡ** (gen-text chạy lại khi input không đổi) — revisit sau tiếng nói người dùng đầu tiên.
