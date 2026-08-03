## Trong hợp đồng

Không có phát hiện nào ánh xạ được vào AC trong vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **`compose-overlay` ops declared as one flat merged object instead of a per-`type` discriminated union — weakens the repo's only enforcement gate**
  Người dùng thấy gì: Ứng dụng hiện cho phép một lớp overlay lưu các trường không áp dụng cho loại của nó (ví dụ giá trị thừa vô nghĩa); bản thân điều này chưa làm hỏng gì người dùng thấy ngay, nhưng để ngỏ khả năng gây nhầm lẫn sau này.
  file: `config/tongflow.abi.json`
  severity: medium
  Đề xuất: known-limits

- **`resolveEdgeHandles` fallback re-implements `resolveSpec` by hand instead of calling the existing `resolvedSpecForNodeType` in the same file**
  Người dùng thấy gì: Trong một số cấu hình node nâng cao hiếm gặp, một điểm kết nối đầu vào có thể không được hiển thị cho người dùng chọn, dù hiện chưa xác định được kịch bản thực tế nào gây ra việc này.
  file: `src/lib/abi/node-feature-registry.ts`
  severity: medium
  Đề xuất: known-limits

- **`composeOverlayNode` filed under `transfer/` (1→1) and NODE_CATEGORIES.TRANSFER although it is an N→1 compose node**
  Người dùng thấy gì: Đây chỉ là cách tổ chức mã nguồn nội bộ; không ảnh hưởng gì tới những gì người dùng nhìn thấy hoặc thao tác được.
  file: `src/components/workspace/types.tsx`
  severity: medium
  Đề xuất: known-limits

- **CLAUDE.md still documents the pre-rewrite `check-manifest-unmoved.sh` invariant and a variable that no longer exists**
  Người dùng thấy gì: Đây là tài liệu dành cho lập trình viên bị lệch so với thực tế, không ảnh hưởng tới sản phẩm hay trải nghiệm người dùng.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **Ops editor accepts numeric values outside the ABI-declared 0–1 domains with no min/max, clamp, or any downstream check**
  Người dùng thấy gì: Người dùng có thể nhập một con số vượt xa phạm vi hợp lệ vào vị trí hoặc độ mờ của lớp overlay, và ứng dụng sẽ âm thầm chấp nhận rồi chạy luôn, cho ra một overlay trông hỏng hoặc lệch mà không hề cảnh báo.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: medium
  Đề xuất: new-contract

- **`getEdgeTargetOptions` still matches on primary `nodeType` only — third consumer of handle-modality matching left un-updated by the `alsoAccepts` change**
  Người dùng thấy gì: Trong một cấu hình hiện chưa tồn tại (có từ hai lựa chọn kết nối tương tự trở lên), người dùng có thể không được cung cấp cách chọn đúng kết nối mong muốn; hiện tại chưa có tình huống nào bị ảnh hưởng.
  file: `src/lib/abi/edge-target-options.ts`
  severity: low
  Đề xuất: known-limits

- **`NEW_OP[kind]` pushes a shared module-level object reference into user-editable ops state**
  Người dùng thấy gì: Đây là rủi ro an toàn mã nguồn nội bộ, chưa ảnh hưởng gì tới sản phẩm hiện tại; về sau nếu có thay đổi mã ở nơi khác, các mục overlay không liên quan có thể vô tình bị hỏng chung, nhưng hiện chưa có gì kích hoạt điều đó.
  file: `src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx`
  severity: low
  Đề xuất: known-limits

- **compose-overlay node is not reachable from the canvas UI — no way for a user to create it**
  Người dùng thấy gì: Người dùng có ảnh hoặc video trên canvas hiện không có nút hay menu nào để tự thêm tính năng overlay mới này — nó chỉ xuất hiện tự động khi bộ lập kế hoạch AI thêm vào, chứ không thể thêm bằng thao tác thủ công.
  file: `src/hooks/use-node-actions.tsx`
  severity: high
  Đề xuất: new-contract

- **Director advertises compose-overlay but can never supply its required `ops` — plan compiles clean into a permanently unexecutable node**
  Người dùng thấy gì: Khi bộ lập kế hoạch AI tự thêm bước overlay này vào một kế hoạch, bước đó xuất hiện trên canvas ở trạng thái hỏng vĩnh viễn không chạy được, mà không có gì báo cho người dùng biết lý do hoặc rằng có gì đó sai.
  file: `src/lib/director/vocabulary.ts`
  severity: medium
  Đề xuất: new-contract

- **`SelectField` renders a selection the op does not actually hold (undefined anchor/align/preset silently shows the first option)**
  Người dùng thấy gì: Nếu cấu hình overlay đã lưu bị thiếu một số lựa chọn (vị trí, canh lề, hoặc preset), ô chọn trên màn hình sẽ hiển thị như thể đã chọn một giá trị nào đó dù thực ra chưa có gì được chọn — khiến những gì người dùng thấy không khớp với những gì thực sự sẽ chạy.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: medium
  Đề xuất: known-limits

- **`mediaKind` falls back to "image" for any non-modality upstream, silently hiding the video time-window controls**
  Người dùng thấy gì: Trong một số trường hợp, ứng dụng có thể nhận nhầm overlay đang áp lên video thành đang áp lên ảnh tĩnh, khiến các điều khiển giới hạn overlay theo thời gian trong video bị ẩn đi mà không có dấu hiệu gì.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: medium
  Đề xuất: known-limits

- **`{text}` placeholder has no UI guard, unlike the structurally identical logo case — the default price_tag op is invalid on creation**
  Người dùng thấy gì: Thêm một overlay dạng khung giá và chạy ngay mà chưa nối nguồn giá, hệ thống vẫn gửi tác vụ đi và chỉ báo lỗi sau khi chạy xong, thay vì cảnh báo trước như trường hợp overlay logo tương tự đã làm.
  file: `src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx`
  severity: medium
  Đề xuất: known-limits

- **Test harness swallows every missing-i18n-key error, so the node suite cannot detect a dropped translation**
  Người dùng thấy gì: Đây là lỗ hổng trong bộ kiểm thử tự động, không ảnh hưởng tới người dùng hiện tại; nhưng nếu sau này một dòng chữ hiển thị bị mất ở một ngôn ngữ nào đó, lỗi đó có thể không bị phát hiện cho tới khi người dùng gặp phải.
  file: `src/components/workspace/nodes/transfer/compose-overlay.test.tsx`
  severity: low
  Đề xuất: known-limits

- **Rewritten manifest guard keeps two sources of truth for the org, one of them now dead**
  Người dùng thấy gì: Đây là đoạn mã công cụ nội bộ còn sót lại, không còn tác dụng và không ảnh hưởng gì tới sản phẩm hay người dùng.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: low
  Đề xuất: known-limits

- **`ui-capture.mjs` passes `headless: "new"`, which puppeteer-core 25 no longer accepts as a documented value**
  Người dùng thấy gì: Đây là một điểm bất thường trong công cụ chụp ảnh màn hình chỉ dùng nội bộ cho lập trình viên, không ảnh hưởng tới sản phẩm đã phát hành hay người dùng.
  file: `scripts/ui-capture.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có phát hiện nào bị đánh dấu unverified trong vòng này.

⚠ Cụm ngoài vùng phủ: 10/15 lỗi rơi vào file không bộ đo nào phủ (src/components/workspace/types.tsx, CLAUDE.md, src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx, src/lib/abi/edge-target-options.ts, src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx, src/hooks/use-node-actions.tsx, src/lib/director/vocabulary.ts, scripts/ui-capture.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.