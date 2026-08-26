# ADR — Architecture Decision Records

Quyết định nền tảng của OneFlow, mỗi quyết định một file **bất biến**. Muốn đảo chiều một
quyết định: viết ADR mới đánh dấu supersede, không sửa file cũ. STATUS.md chỉ giữ pointer
tới đây, không giữ nội dung quyết định.

Nguồn bằng chứng chính: [biên bản hội đồng 07/2026](../strategy/council-2026-07.md).

| # | Quyết định | Ngày |
|---|---|---|
| [0001](0001-cache-before-cloud.md) | Cache content-addressed + partial re-render trước khi mở managed cloud | 2026-07-27 |
| [0002](0002-skill-template-orchestrator.md) | Skill = ExecutableWorkflow template + orchestrator TS; không mở rộng Director DSL | 2026-07-27 |
| [0003](0003-media-judge-ranker-first.md) | `media-judge` là ranker cho tới khi FPR < 5% | 2026-07-27 |
| [0004](0004-universe-kg-three-entities.md) | Universe KG chặng 1 giới hạn 3 thực thể | 2026-07-27 |
| [0005](0005-managed-cloud-default.md) | Managed cloud là mặc định; BYO-key là tier, không phải kiến trúc | 2026-07-27 |
| [0006](0006-defer-vn-compliance.md) | Hoãn compliance luật VN — chuẩn bị, không xây | 2026-07-27 |
| [0007](0007-sequential-plugin-forking.md) | Fork plugin tuần tự theo nhu cầu, không mirror cả 38 | 2026-07-27 |
| [0008](0008-naming-and-distribution.md) | Đặt tên & phân phối: tiền tố `oneflow-`, distribution `oneflow-sdk`, import giữ `tongflow` | 2026-07-27 |
| [0009](0009-tts-vi-eleven-v3.md) | TTS tiếng Việt dùng `eleven_v3`; điều kiện MOS của G0 đóng bằng phán quyết vận hành | 2026-07-27 |
| [0010](0010-mainstream-infra-and-models.md) | Ưu tiên hạ tầng & model phổ biến; Modal là lựa chọn, không phải nền tảng (sửa đổi ADR-0005) | 2026-07-27 |
| [0011](0011-local-first-execution.md) | Máy của người dùng là nền thực thi mặc định; managed cloud là tier (**thay thế** nửa managed-mặc-định của ADR-0005) | 2026-08-05 |
| [0012](0012-media-library-boundary.md) | Media-library là nền kho + tri thức chung (đa lĩnh vực); OneFlow là khách qua hợp đồng REST với tám bảo đảm ranh giới | 2026-08-19 |
| [0013](0013-director-truong-ky.md) | Director trường kỳ: nền trạng thái bốn tầng, memory hai chủ quyền (Director giữ hành vi/sở thích, media-library giữ thực thể), học derived-first, mười lằn ranh đỏ | 2026-08-26 |
