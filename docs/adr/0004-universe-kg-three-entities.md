# ADR-0004: Universe KG chặng 1 giới hạn 3 thực thể

- **Ngày:** 2026-07-27 · **Trạng thái:** Chấp nhận
- **Nguồn:** [Hội đồng 07/2026](../strategy/council-2026-07.md) — phiên chất vấn trần consistency; giám khảo kiến trúc

## Bối cảnh

Universe knowledge graph là tầng bộ nhớ của tầm nhìn ([vision](../strategy/vision.md)) — nhưng
knowledge graph có hai bệnh kinh điển: (1) phình ontology thành đề tài nghiên cứu; (2) hứa
consistency mà model bên dưới không giữ nổi (trần consistency của stack open-weights chưa
được benchmark).

## Quyết định

- Chặng 1 chỉ có **3 loại thực thể**: Product / Brand / Voice (ngách BĐS: Project / Listing /
  Broker — bộ thực thể gieo theo ngách, chốt ở Gate G0; kiến trúc không đổi).
- Schema-first theo triết lý ABI: typed, versioned, enforce lúc compile. Lưu SQLite/Drizzle
  (bảng entities/relations/anchors) — **không** dùng graph database ở chặng này.
- Provenance vào wire shape ngay từ đầu: `FieldBinding kind:"entity"` (phát hành đồng bộ
  TS + `bindings.py`), `tasks.entity_refs` `[{entityId, version}]`.
- **Character / Location + ràng buộc continuity chỉ được vào schema sau khi benchmark
  OF-CB-1 cho verdict GO.** Không viết một dòng schema chặng 2 trước đó.

## Hệ quả

- Tránh xây "database của những lời hứa model không giữ nổi".
- Retrofit provenance về sau rất đau — nên trả giá wire-shape ngay bây giờ, khi chưa có
  dữ liệu cần migrate.
- Điểm gãy đã biết trước: SQLite per-user gãy ở collaboration (agency dùng chung), không
  gãy ở scale — metadata sang Postgres trước khi mở tính năng team (Phase 2 lộ trình).
