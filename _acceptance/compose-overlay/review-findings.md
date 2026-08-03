## Trong hợp đồng

### Conformance fixture pins a phantom node type, so the shipped sourceSpec is never exercised
- file: `/Users/manh-macmini/dev/oneflow/sdk/tests/conformance/fixtures/compose-overlay.json:5`
- severity: medium
- detail: The fixture declares `"type": "conformanceComposeOverlayNode"` (line 63) plus its own `sourceSpec` (line 5). src/lib/abi/conformance.ts:142-148 deliberately THROWS when a fixture declares a sourceSpec for a node type that is mounted in NODE_TYPE_SOURCE_SPEC — precisely to stop a fixture copy from shadowing the real classification. Using a type the registry never mounts bypasses that guard permanently, and the fixture's own note justifies it with "the canvas mount lands in a sibling task" — a rationale that went stale inside this same diff, since composeOverlayNode landed here (commit 2184bf0). Net effect: the TS↔Python conformance suite compares a hand-written copy of the field classification against Python, not the shipped NODE_TYPE_SOURCE_SPEC.composeOverlayNode. If someone later flips `ops` to a handle or `text` to configField in the real spec, conformance stays green while the canvas and engine diverge — the exact class of drift the suite exists to catch. Now that the mount exists, the fixture should switch to `composeOverlayNode` and drop its own sourceSpec, letting the adapter read the mounted one.
- source: conventions
- AC: AC-13
- rationale: AC-13 requires the fixture to compare the two runtimes using the real shipped classification and explicitly states the new slot 'phải vào suite ngay' (must properly enter the suite); using a phantom node type with a hand-copied sourceSpec to dodge the anti-shadow guard means the suite never actually exercises the shipped spec, defeating exactly what AC-13 demands.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **CLAUDE.md still documents the deleted first edition of check-manifest-unmoved.sh**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ cho đội ngũ phát triển vẫn mô tả cơ chế kiểm tra phiên bản cũ đã bị thay thế, có thể khiến người bảo trì sau này làm theo hướng dẫn không còn đúng khi gặp lỗi không liên quan tới tính năng này.
  file: `/Users/manh-macmini/dev/oneflow/CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **compose-overlay is an N→1 node but was filed under transfer/ (1→1)**
  Người dùng thấy gì: Node ghép overlay được xếp sai nhóm phân loại trong tổ chức mã nguồn nội bộ; điều này không ảnh hưởng tới cách người dùng thao tác trên node, chỉ có thể gây nhầm lẫn nhẹ cho đội ngũ khi mở rộng tính năng sau này.
  file: `/Users/manh-macmini/dev/oneflow/src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: medium
  Đề xuất: known-limits

- **Raw <select> element instead of the shared ui/select component**
  Người dùng thấy gì: Ô chọn thuộc tính (như vị trí safe-zone) trong form chỉnh sửa overlay dùng kiểu giao diện mặc định của trình duyệt thay vì đồng bộ với các ô chọn khác trong sản phẩm, và có thể ngầm hiển thị một lựa chọn dù người dùng chưa thực sự chọn gì — dễ gây hiểu nhầm về giá trị đang được áp dụng.
  file: `/Users/manh-macmini/dev/oneflow/src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: low
  Đề xuất: known-limits

- **Adopted ui-capture script still carries its "reference implementation, copy me" header**
  Người dùng thấy gì: Một tệp công cụ nội bộ dùng để chụp ảnh màn hình khi kiểm thử vẫn còn giữ phần ghi chú hướng dẫn cũ dành cho việc thiết lập ban đầu; đây là chi tiết nội bộ cho đội ngũ kỹ thuật, không ảnh hưởng tới người dùng sản phẩm.
  file: `/Users/manh-macmini/dev/oneflow/scripts/ui-capture.mjs`
  severity: low
  Đề xuất: known-limits

- **Plugins dialog "open repo" link ignores the per-entry origin (404 for compose-overlay)**
  Người dùng thấy gì: Trong cửa sổ quản lý plugin, bấm nút 'mở kho mã nguồn' của plugin overlay này sẽ dẫn tới một địa chỉ web không tồn tại thay vì đúng trang chứa mã nguồn thực tế của plugin.
  file: `src/components/workspace/plugins-dialog.tsx`
  severity: high
  Đề xuất: known-limits

- **compose-overlay mediaKind silently falls back to "image" when the upstream modality cannot be resolved**
  Người dùng thấy gì: Khi hệ thống chưa xác định được node nguồn là ảnh hay video, node overlay tạm thời hiển thị như thể đó là ảnh, khiến các tuỳ chọn thời gian bắt đầu/kết thúc bị ẩn khỏi giao diện dù các giá trị đó người dùng đã nhập vẫn được gửi đi khi chạy — dễ khiến người dùng không biết cài đặt của mình vẫn đang có hiệu lực.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: medium
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

(không có)

⚠ Cụm ngoài vùng phủ: 5/7 lỗi rơi vào file không bộ đo nào phủ (CLAUDE.md, sdk/tests/conformance/fixtures/compose-overlay.json, src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx, scripts/ui-capture.mjs, src/components/workspace/plugins-dialog.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
