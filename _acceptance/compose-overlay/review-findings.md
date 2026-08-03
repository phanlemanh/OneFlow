## Trong hợp đồng

*(Không có phát hiện nào ánh xạ được vào AC trong round này.)*

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **`alsoAccepts` ignored by resolveEdgeHandles — a videoNode can never bind to compose-overlay `in:media`**
  Người dùng thấy gì: Khi người dùng kéo một node video ra để tạo node dán overlay mới, đường nối vào ô nhận media không tự động được vẽ — nút chạy sẽ không bao giờ bật lên mà không có cảnh báo giải thích lý do.
  file: `src/lib/abi/node-feature-registry.ts`
  severity: high
  Đề xuất: new-contract

- **`alsoAccepts` ignored by collectUpstreamTypesForTarget — fallback gate rejects video -> `in:media`**
  Người dùng thấy gì: Người dùng cố nối tay một nguồn video vào ô nhận media của node dán overlay sẽ bị hệ thống từ chối đường nối, dù tính năng dán overlay lên video đã được quảng cáo là hỗ trợ.
  file: `src/lib/workflow/connection-rules.ts`
  severity: high
  Đề xuất: new-contract

- **compose-overlay is an N->1 node filed under `transfer/` (1->1) instead of `compose/`**
  Người dùng thấy gì: Việc gắn nhầm nhóm phân loại không ảnh hưởng tính năng dán overlay hiện tại cho người dùng cuối, nhưng có thể khiến người phát triển sau này hiểu sai cấu trúc khi thêm node tương tự.
  file: `src/components/workspace/types.tsx`
  severity: medium
  Đề xuất: known-limits

- **CLAUDE.md still documents the old `check-manifest-unmoved.sh` invariant after the guard was rewritten**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ về đăng ký plugin mới đang mô tả sai cách kiểm tra danh sách plugin chính thức, nên người đăng ký plugin tiếp theo có thể làm theo hướng dẫn cũ và gặp lỗi kiểm tra khó hiểu.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: medium
  Đề xuất: known-limits

- **alsoAccepts không được nối vào resolveEdgeHandles — nối videoNode vào compose-overlay tạo edge KHÔNG có targetHandle (silent failure)**
  Người dùng thấy gì: Khi người dùng kéo một node video ra để tạo node dán overlay mới, đường nối vào ô nhận media không tự động được vẽ đúng — nút chạy sẽ không bao giờ bật lên mà không có cảnh báo giải thích lý do.
  file: `src/lib/abi/node-feature-registry.ts`
  severity: high
  Đề xuất: new-contract

- **collectUpstreamTypesForTarget bỏ qua alsoAccepts — videoNode vẫn bị reject trên in:media**
  Người dùng thấy gì: Người dùng cố nối tay một nguồn video vào ô nhận media của node dán overlay sẽ bị hệ thống từ chối đường nối, dù tính năng dán overlay lên video đã được quảng cáo là hỗ trợ.
  file: `src/lib/workflow/connection-rules.ts`
  severity: high
  Đề xuất: new-contract

- **getEdgeTargetOptions không có alsoAccepts — menu đổi đích của edge không đề xuất handle nào cho nguồn video**
  Người dùng thấy gì: Khi người dùng muốn đổi đường nối hiện có sang ô nhận media từ một nguồn video, menu chọn điểm nối không hiện ra lựa chọn nào, khiến thao tác đó không thể thực hiện qua giao diện.
  file: `src/lib/abi/edge-target-options.ts`
  severity: medium
  Đề xuất: new-contract

- **Ops editor không ràng buộc miền giá trị 0–1 của ABI, không min/max, không clamp**
  Người dùng thấy gì: Các trường nhập toạ độ/độ mờ trong bảng chỉnh overlay không giới hạn giá trị hợp lệ, nên nếu người dùng gõ nhầm số ngoài khoảng cho phép (ví dụ độ mờ = 100 thay vì 1) thì ảnh/video xuất ra sẽ sai mà không có cảnh báo nào.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/8 lỗi rơi vào file không bộ đo nào phủ (src/lib/workflow/connection-rules.ts, src/components/workspace/types.tsx, src/lib/abi/edge-target-options.ts, src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.