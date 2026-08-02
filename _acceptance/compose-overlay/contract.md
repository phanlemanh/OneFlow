---
schema_version: 1
feature: compose-overlay — slot dán chữ/khung giá/logo/safe-zone lên ảnh & video (Phase 1.2)
slug: compose-overlay
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [abi, sdk, web-ui, plugin, docs]
status: approved
approved_by: Manh
approved_at: 2026-08-02
time_human_minutes: {gate1: 10}
---

# Acceptance Contract: compose-overlay

## Context

Hạng mục Phase 1.2 của roadmap — *"không được cắt thứ hai"*. Node dán **text / khung giá /
logo** lên ảnh hoặc video với **safe-zone** ràng buộc đặt chỗ, là "diễn viên chính tầng A"
của kịch bản cache chủ lực ([PRD §4](../../docs/spec/prd/engine-cache-partial-rerender.md)):
đổi giá 200 video → chỉ node này chạy lại (~1–2 s CPU), video AI không sinh lại.
Gate G1 của roadmap treo đúng trên node này: *"50 clip liên tiếp không lỗi dấu / không sai
số giá trên overlay"*.

Thiết kế: [2026-08-02-compose-overlay-design.md](../../docs/superpowers/specs/2026-08-02-compose-overlay-design.md).
Quyết định định hình (duyệt brainstorm 02/08): đủ 4 loại op · cả ảnh + video · **một đường
rasterize chữ duy nhất** (Pillow + font Việt đóng gói; ffmpeg chỉ composite, không bao giờ
vẽ chữ) · safe-zone = clamp tất định · multi-line + time-window vào v1 (mở BĐS/tài chính,
lót đường phụ đề skill #1) · plugin `oneflow-modal-compose-overlay` repo mới, đăng ký
official ngay (entry thứ 39).

**Đường ranh hai repo:** logic render sống trong repo plugin (ngoài oneflow); evals render
với tới nó qua guard script clone-and-pytest (cùng họ network-dependent với `ci_*`).
Repo oneflow giữ: ABI + codegen train, Tier A allowlist, node UI, đăng ký + docs, SDK train.

**Chi phí ký lại, báo giá NGAY tại Cổng 1** (luật per-file): đụng
`config/tongflow.abi.json` + `src/generated/abi/**` + `sdk/tongflow/models/**` +
`node_slots.py` (→ `conformance-l0` và họ cache re-verify vì fingerprint đọc ABI digest);
đụng `node_cache.py` (TIER_A_SLOTS) + `tests/test_node_cache_tier_b.py` (pinned list) →
`cache-l2-store`, `cache-l3-tier-b`, `cache-l4-eviction` ký lại; đụng
`check-manifest-unmoved.sh` (expected_count 38→39, đúng kịch bản contract per-plugin-origin
đã dặn) → `per-plugin-origin` ký lại. Dự kiến **~5 chữ ký lại** — cùng hình dạng wave L3/L4.

## Criteria

Quy tắc chung: mọi tiêu chí render đo bằng **golden image trong repo plugin** (pin môi
trường: Modal image / venv khoá phiên bản Pillow-freetype-ffmpeg); "verbatim" nghĩa là
từng ký tự — node không bao giờ format lại số/chuỗi (format là việc của
`normalize-text-vi` thượng nguồn).

- AC-1: Given ABI có slot `compose-overlay` đúng thiết kế (media+ops oneOf 4 loại+text+logo;
  outputs image/video; **không** seed/temperature/top_p), When chạy trọn codegen train
  (`pnpm gen:abi` → `gen_models.py` → `gen_node_slots.py`), Then không drift: generated TS,
  `_data` copy, `models/compose_overlay.py`, `node_slots.py` đều đã commit khớp
  (`git diff --exit-code`). *Generators không tự chạy chuỗi — quên một bước là SDK lệch ABI im lặng.*
- AC-2: Given op `text` chứa pangram phủ đủ bộ ký tự tiếng Việt có dấu (hoa + thường),
  When render lên **ảnh** và lên **video**, Then: (a) ảnh ra khớp golden pixel-for-pixel;
  (b) **điểm so sánh hai modality là canvas RGBA trước composite** — canvas mà đường ảnh
  và đường video dùng phải là MỘT (so pixel-for-pixel ở tầng canvas, không so frame đã
  encode); (c) frame video kiểm qua **pipeline lossless trong test** (xuất frame PNG /
  codec lossless) khớp golden — codec giao hàng lossy không tham gia phép so golden.
  *Tiêu chí Gate G1 "không lỗi dấu" ở dạng đo được, không bị codec lossy làm đỏ oan
  hay bị tolerance ad-hoc làm lỏng im lặng (fix gap-probe F2).*
- AC-3: Given op text nhiều dòng (`\n`) và op text dài có `max_width`, When render, Then
  xuống dòng/ngắt từ đúng golden, không chữ nào tràn ra ngoài khung khai báo. *Mở khoá
  disclaimer tài chính + địa chỉ BĐS.*
- AC-4: Given op `price_tag` với chuỗi giá kiểu `1.999.000₫`, When render, Then chuỗi in
  **verbatim từng ký tự** trên nền box (bg_color/padding/radius) khớp golden. *"Không sai
  số giá" của Gate G1: node in đúng cái được đưa, không tự ý format.*
- AC-5: Given op `logo` + input `logo` là ảnh PNG có alpha, When render, Then logo đặt đúng
  vị trí/anchor, scale theo `width` giữ nguyên tỷ lệ khung, alpha blend đúng golden; Given
  có op `logo` mà input `logo` **vắng**, Then `success:false` + error nêu rõ thiếu logo —
  không crash, không lặng lẽ render thiếu.
- AC-6: Given op `safe_zone` (preset và custom) + một op đặt **lấn** vùng cấm + một op
  **không lấn**, When render, Then op lấn bị clamp: bbox sau render nằm trọn trong vùng cho
  phép; op không lấn giữ **nguyên** toạ độ; clamp là hàm thuần tất định (chạy 2 lần cùng
  kết quả, không phụ thuộc thứ tự ops). *Số inset preset là hằng số plugin (⏱ verify theo
  TikTok creative guidelines lúc implement), không đóng băng vào ABI.*
- AC-7: Given op text chứa placeholder `{text}` và input `text` = chuỗi giá, When render,
  Then placeholder thay **verbatim**; Given op có `{text}` mà input `text` vắng, Then
  `success:false` + error rõ ràng (render literal `"{text}"` lên video khách là lỗi im
  lặng tệ nhất). *Đây là sợi dây của kịch bản "đổi giá": text đổi → fingerprint đổi →
  chỉ node này re-run.*
- AC-8: Given video + op có `start`/`end`, When render, Then op chỉ xuất hiện trong khoảng
  đó (kiểm frame trước/trong/sau mốc); op không khai giờ hiện suốt thời lượng; Given
  **ảnh** + op có `start`/`end`, Then giờ bị bỏ qua, render bình thường, không lỗi.
- AC-9: Given media là ảnh, Then output `image` set và `video` vắng; Given media là video,
  Then output `video` set, `image` vắng, và video ra **giữ nguyên thời lượng + audio
  track** của video vào (overlay không đụng timeline/âm thanh).
- AC-10: Given cùng một bộ input chạy **2 lần** trong cùng môi trường pin, When so sánh
  output, Then **byte-identical** — điều kiện vào cửa Tier A (fingerprint đã gồm pluginRev;
  cam kết determinism nằm trong ranh giới một plugin rev).
- AC-11: (cross-layer) Given `compose-overlay` nằm trong `TIER_A_SLOTS` và một workflow
  2-node (fake plugin tầng B → compose-overlay fake tầng A) qua engine, When chạy lần 2
  không đổi gì, Then full hit — 0 plugin call; When chỉ đổi input `text`, Then node tầng B
  **không** chạy lại, compose-overlay chạy lại — đúng kịch bản PRD §4; và guard allowlist
  hai chiều (pinned + ABI tồn tại) vẫn xanh sau khi thêm slot. *Engine test dùng fake
  handler đăng ký slot này — không cần plugin thật để chứng minh dây cache.*
- AC-12: Given node `compose-overlay` mount trên canvas, When render node và export,
  Then handles đúng từ ABI (`in:media`, `in:text`, `in:logo`, `out:image`, `out:video`);
  ops-editor thêm/xoá/sửa được cả 4 loại op với form đúng theo loại (field giờ chỉ hiện
  khi media là video); **trạng thái lỗi state-5 của ma trận hiển thị được**: có op logo mà
  `in:logo` chưa nối → row lỗi + banner đúng design-of-record (fix gap-probe F3);
  exporter phát `ExecutableNode` có `pluginId` top-level + prompt chỉ
  chứa business fields — không `bindings`/`paramMappings` tay.
- AC-13: (cross-layer) Given fixture workflow chứa compose-overlay chạy qua **cả hai
  đường** canvas-TS và engine-Python (conformance suite L0), When so kết quả, Then hai
  runtime không lệch (cùng số call, cùng shape input tới plugin — media single, không
  batch fan-out). *Slot mới đầu tiên sinh sau conformance suite: phải vào suite ngay,
  không nợ như batchField.*
- AC-14: Given plugin đã đăng ký official, When kiểm đồng bộ, Then
  `official-plugins.json` có entry thứ 39 `oneflow-modal-compose-overlay`;
  `check-manifest-unmoved.sh` expected_count = 39 (bump đúng như contract per-plugin-origin
  dặn); **cả 3 README** (EN/ZH/JA) có plugin trong danh sách + hàng capability matrix mới
  cho slot; i18n keys node có đủ 4 ngôn ngữ (en/zh/ja/ko).
- AC-15: Given SDK release train, When kiểm, Then `sdk/pyproject.toml` và
  `sdk/tongflow/__init__.py` cùng phiên bản mới (0.2.18); phiên bản đó **đã publish lên
  PyPI**; repo plugin pin `oneflow-sdk==` đúng phiên bản đó; models/node_slots trong bản
  publish chứa `ComposeOverlayInput/Output` + `COMPOSE_OVERLAY`. *Trình tự cứng: publish
  SDK trước khi plugin pin — đảo lại là plugin build fail hoặc pin bản thiếu types.*
- AC-16: (judgment) Given node compose-overlay + ops-editor trên canvas dev server, When
  người/panel soi capture HTML + screenshot theo ngôn ngữ thiết kế workspace hiện có, Then
  node "nhìn như người nhà" của các node transfer sẵn có (shell, spacing, states), ops-editor
  đủ trạng thái empty/1-op/nhiều-op, không lỗi console, đạt sàn P0 design gate.

## Coverage

Từ morphological scan 02/08 (preset test-matrix; chân sản phẩm: STATUS/roadmap/PRD `[SP]`;
chân ngành: `[NGÀNH: Cloudinary]` từ vựng op overlay (text/image layer + gravity/offset),
`[NGÀNH: Shotstack]` timed-overlay start/length, `[NGÀNH: TikTok creative guidelines]`
safe-zone ⏱ verify-current lúc implement):

- **Trục lớp giao phó** ABI+codegen | plugin render | node UI | cache Tier A | đăng ký/release —
  [CE: checklist cross-layer + release CLAUDE.md] → AC-1, 2–10, 12, 11, 14–15
- **Trục loại op** text | price_tag | logo | safe_zone — [CE: roadmap 1.2 + Cloudinary] → AC-2/3, 4, 5, 6
- **Trục modality × thời gian** ảnh | video toàn thời lượng | video time-window —
  [CE: PRD §4 + Shotstack] → AC-2, 8, 9
- **Trục biên dữ liệu** dấu Việt đầy đủ | nhiều dòng/dài | thiếu logo | lấn safe-zone |
  placeholder thiếu nguồn — [CE: preset test-matrix + Gate G1] → AC-2, 3, 5, 6, 7
- Cross-cutting mọi ô Core: determinism byte-identical (AC-10) · conformance 2 runtime (AC-13)
- Ô Later/Never có vết: media hỏng/mime lạ (Later — đường error chuẩn plugin, chờ 1.1-L1b
  mime-vào-digest) · video rất dài/perf (Later — đo COGS khi có số thật) · emoji/ký tự
  ngoài font (Later — fallback font là quyết định riêng) · chart/hiệu ứng động (Never —
  node khác) · font tuỳ chọn user (Never — hằng số plugin, ABI hygiene) · nhiều logo/node
  (Never v1 — một logo đủ cho skill #1) · codec/fps knob (Never — plugin constant).

## Out of scope

- Sinh phụ đề tự động (transcribe-timestamp thượng nguồn đổ ops vào ở skill #1 — node này
  chỉ render cái được đưa).
- Hai lỗ hổng UI per-plugin-origin (open-repo link, standalone-engine origin) — plugin
  đăng ký plain-string dưới org mặc định nên không chạm.
- UI preview WYSIWYG kéo-thả vị trí op trên canvas (v1 nhập số + preview tĩnh sau chạy;
  kéo-thả là contract riêng nếu dogfood đòi).
- Đưa compose-overlay vào template/skill (skill system v1 là hạng mục roadmap #5).
