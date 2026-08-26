# Research: Google Flow vs OneFlow Director — 08/2026

> Tài liệu bối cảnh cho hai ô ý `director-v2` và `timeline-view`.
> Hai lượt research (26/08/2026): lượt 1 mặt bằng tính năng, lượt 2 trục agentic,
> lượt 3 review bổ sung (option tự-chạy + timeline). Nguồn chính chủ mới nhất
> đọc được: 19/05/2026 (I/O 2026) — bảng này có hạn dùng, nhịp Labs rất nhanh.

## Bối cảnh thị trường

- **25/02/2026** — Google hợp nhất Flow + Whisk + ImageFX thành một xưởng sáng
  tạo duy nhất (blog.google "flow-updates-february-2026"). Model: Veo 3.1,
  Nano Banana Pro, Lyria 3 Pro, Gemini Omni. Asset grid + Collections, lasso
  edit, vẽ tay lên ảnh, extend clip, camera controls.
- **19/05/2026 (I/O)** — ba thứ đánh vào định vị OneFlow
  (blog.google "flow-updates"):
  - **Flow Agent**: đối tác sáng tạo Gemini — brainstorm, gợi thoại/cốt truyện,
    sinh nhiều biến thể, sửa hàng loạt, gom collection, đổi tên thông minh.
    Toàn bộ người dùng, toàn cầu.
  - **Flow Tools**: người dùng "vibe code" công cụ sáng tạo riêng bằng lời,
    chia sẻ + remix. Người trả tiền tạo, mọi người dùng.
  - App di động (Android beta, iOS sắp).
- Giá: Free 50 credit/ngày → AI Plus $4.99 → Pro $19.99 (1.000 credit) →
  Ultra $99.99/$199.99 (10.000/25.000 credit) — labs.google/flow/about.

## Phát hiện then chốt lượt 3 (26/08)

**Flow Agent có setting "Confirm before generating: Always / Never", mặc định
Always** — agent dừng xin phép trước mọi hành động tiêu credit và ƯỚC TÍNH chi
phí credit trước khi render (support.google.com/flow/answer/17093911). Nghĩa là:

1. Google cũng mặc định không-tự-chạy → luật không-tự-chạy của Director là
   ĐÚNG hướng thị trường, không phải điểm yếu.
2. Khác biệt còn lại: Flow CHO người dùng mở khoá (opt-in auto), OneFlow chưa.
3. Người dùng Flow phàn nàn credit không minh bạch → cost-preview là điểm vượt.

## Bảng so sánh trục agentic (lượt 2, rút gọn)

| Chiều | Flow Agent | OneFlow Director |
|---|---|---|
| Đầu ra | Asset thật + collection | Đồ thị node/edge đặt lên canvas |
| Quyền thực thi | Hỏi trước (mặc định) / tự chạy (opt-in) | KHÔNG BAO GIỜ chạy — chỉ dựng để duyệt |
| Kiểm kế hoạch | Không công bố | Compiler bác kế hoạch sai, 7 mã lỗi, retry 2 lượt |
| Trí nhớ dự án | Có | KHÔNG — mỗi prompt một phiên trắng |
| Hội thoại nhiều lượt | Có | KHÔNG — một prompt, một đồ thị, thay sạch canvas |
| Sản phẩm để lại | Nội dung | Quy trình tái lập được |

Kết luận: Flow Agent làm ra *cái phim*; Director làm ra *dây chuyền làm phim*.
Ba ô Flow thắng đều chung một chỗ: trí nhớ + hội thoại.

## Timeline (lượt 3)

- **Scenebuilder** (Flow): timeline thực thụ — kéo clip, sắp thứ tự, trim
  handle, extend, preview, xuất ~60s. Chỉ desktop.
  (support.google.com/flow/answer/16935718)
- **LTX Studio**: script → storyboard → generate → timeline → xuất, một chỗ.
- **LTX Director**: timeline editor MÃ NGUỒN MỞ chạy như custom node TRONG
  ComfyUI, timeline lưu JSON (2.0, 06/2026: retake mode, audio inpainting).
  → Bằng chứng: thế giới node-graph gắn timeline như một VIEW trên đồ thị,
  không cần editor riêng.
- OneFlow đã có nguyên liệu slot: `concat-videos`, `split-video`,
  `merge-video-audio`, `arrange-group`, `video-edit`. Thiếu: mặt UI timeline
  sinh/đọc lại chuỗi node — không đụng ABI, không đụng `sdk/**` (tránh T3).

## Hiện trạng Director (đọc code 26/08)

- `src/lib/director/dsl.ts` — DSL v1: JSON schema chặt, 1–60 bước, text/gen.
- `src/lib/director/director-core.ts` — vòng lặp 2 lượt: kế hoạch hỏng echo
  lại làm lượt assistant + danh sách lỗi compile làm lượt user; 7 mã lỗi;
  bắt được model bịa slot chưa cài (MISSING_PLUGIN) và phản hồi đúng tên.
- `src/lib/director/vocabulary.ts` — vocabulary sinh tự động từ ABI topology,
  byte-stable để ăn prompt cache.
- `src/components/workspace/director-prompt.tsx` — "never triggers execution;
  only stages a graph on the canvas for the user to review". Thành công =
  THAY SẠCH canvas (có hộp thoại xác nhận ghi đè).
- Nền có sẵn cho cost-preview: hồ sơ `task-metering` đã ký xong.

## Khuyến nghị đã chốt (thứ tự 1 → 2 → 5 → 3 → 4)

| # | Việc | Ô ý |
|---|---|---|
| 1 | Director đọc đồ thị đang có trên canvas (trí nhớ ngữ cảnh) | director-v2 |
| 2 | Director vá đồ thị thay vì thay sạch | director-v2 |
| 5 | Ước tính chi phí hiển thị trên node trước khi chạy | director-v2 |
| 3 | Option tự-chạy: mặc định hỏi, opt-in auto, kèm cost estimate | director-v2 |
| 4 | Timeline như một view trên đồ thị | timeline-view |

Định vị: KHÔNG là "Flow tự host". LÀ: dây chuyền tái lập được, chạy trên khoá
của mình, đổi được nhà cung cấp từng mắt xích. Không đua model.

## Chưa xác minh / coi là tin đồn

- Độ chính xác cost-estimate của Flow Agent (chính chủ nói "estimate", forum kêu lệch).
- Giới hạn độ dài Scenebuilder ở bậc trả tiền cao (~60s là nguồn thứ cấp).
- Các số "9/10 prompt bị chặn", "85% phải sửa", "clip 10s" — từ trang SEO
  (whiskailabs, explainx…), KHÔNG kiểm chứng được, không đưa vào quyết định.
- Flow có API lập trình viên không: chưa thấy.
- Cảnh giác trùng tên: Google Flow (Labs) ≠ Google Workspace Flows ≠ flow
  builder trong Gemini Enterprise.

## Nguồn

Chính chủ:
- https://blog.google/innovation-and-ai/products/google-flow-veo-ai-filmmaking-tool/ (20/05/2025)
- https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates-february-2026/ (25/02/2026)
- https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/ (19/05/2026 — Flow Agent, Flow Tools)
- https://labs.google/flow/about (giá, credit, model)
- https://support.google.com/flow/answer/17093911 (Flow Agent, Confirm before generating)
- https://support.google.com/flow/answer/16935718 (Scenebuilder)

Thứ cấp:
- https://techcrunch.com/2025/05/20/google-debuts-an-ai-powered-video-tool-called-flow
- https://www.testingcatalog.com/google-merges-imagefx-and-whisk-into-flow-on-labs/
- https://ai.miraheze.org/wiki/LTX_Director
- https://ltx.io/blog/ai-video-workflow · https://ltx.io/studio/alternatives/runway
- https://www.stork.ai/blog/google-flows-ai-will-drain-your-wallet

Phía OneFlow: đọc thẳng code (đường dẫn ở mục Hiện trạng).
