# ADR-0002: Skill = ExecutableWorkflow template + orchestrator TS; không mở rộng Director DSL

- **Ngày:** 2026-07-27 · **Trạng thái:** Chấp nhận
- **Nguồn:** [Hội đồng 07/2026](../strategy/council-2026-07.md) — giám khảo kiến trúc (yêu cầu thay đổi #4)

## Bối cảnh

Engine là DAG một lượt (cycle là compile error), không có conditional/loop; Director DSL
phẳng (tối đa 60 step). Vòng judge ("sinh N → tự chấm → chọn best") và fan-out ma trận
không biểu diễn được trong graph. Cám dỗ tự nhiên là mở rộng DSL thành ngôn ngữ điều
khiển — làm hỏng cả compiler lẫn tính dự đoán được của engine.

## Quyết định

- **Skill** = ExecutableWorkflow template + manifest tham số (map vào `WorkflowInput`).
- **Orchestrator TS ở tầng app** (`src/lib/skills/`) đảm nhiệm fan-out, vòng judge,
  chọn-best, batch semantics (`x-expand-each`).
- **Director chỉ sinh instance của skill** — không sinh cấu trúc điều khiển.
- Engine giữ nguyên là DAG thuần một lượt.

## Hệ quả

- Thêm skill mới không đụng compiler/engine — tốc độ ship tính năng là lợi thế cạnh tranh.
- Batch/fan-out được thống nhất về một chỗ (orchestrator), xoá dần drift hai runtime
  (bằng chứng drift: exporter emit `batchField` nhưng engine Python không xử lý batch).
- UI mặc định là nút skill + kết quả; canvas/graph chỉ lộ qua "xem/sửa kế hoạch".
