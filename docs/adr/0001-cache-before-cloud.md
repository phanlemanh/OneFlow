# ADR-0001: Cache content-addressed + partial re-render trước khi mở managed cloud

- **Ngày:** 2026-07-27 · **Trạng thái:** Chấp nhận
- **Nguồn:** [Hội đồng 07/2026](../strategy/council-2026-07.md) — giám khảo kiến trúc, giám khảo AI engineering, phiên chất vấn hạ tầng (3 nguồn độc lập cùng phát hiện)

## Bối cảnh

Luận điểm kinh tế trung tâm của sản phẩm ("sửa miễn phí — sửa một chỗ không render lại cả
bài") chưa tồn tại trong engine: `sdk/tongflow/engine/runner.py` chạy tuần tự toàn bộ
executionLevels, không cache, `file_key` theo taskId chứ không theo hash nội dung, không
dirty-tracking. Re-run từng node chỉ có ở thao tác tay trên canvas. Đồng thời, COGS của
managed cloud (nơi OneFlow ôm chi phí GPU) phụ thuộc trực tiếp vào việc tránh render lặp.

## Quyết định

Xây cache content-addressed vào engine **trước** mọi skill chạy headless và **trước** GA
của managed cloud: khoá hash = (pluginId, slot, params đã resolve, hash file input, model,
seed, phiên bản plugin); node trùng hash thì skip; dirty propagation theo graph; API
"chạy từ node X". PRD: [engine-cache-partial-rerender](../spec/prd/engine-cache-partial-rerender.md).

## Hệ quả

- Phase 1 của [lộ trình](../roadmap.md) bị chặn bởi hạng mục này — chấp nhận, vì nó vừa là
  lời hứa sản phẩm vừa là biên lợi nhuận cloud ("sửa miễn phí" không có cache là tự đốt COGS).
- Telemetry phải đo được "% render là partial" làm bằng chứng (gate G2 ≥ 25%).
