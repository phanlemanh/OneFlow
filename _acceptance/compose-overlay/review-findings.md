## Trong hợp đồng

### compose-overlay node re-implements upstream-modality detection with a silent `image` fallback instead of using `getEffectiveOutputType`
- file: `src/components/workspace/nodes/transfer/compose-overlay.tsx:65`
- severity: medium
- AC: AC-12
- source: bugs

`mediaKind` is derived by hand:

```ts
if (mediaNode?.type === "videoNode") return "video";
if (mediaNode?.type === "imageNode") return "image";
if (mediaSourceHandle === "out:video") return "video";
return "image";
```

The final `return "image"` is an unconditional fallback — any upstream it does not recognise is silently classified as an image, with no banner, no log, and no disabled state.

The recognition is incomplete. `mediaSourceHandle === "out:video"` only matches ABI slots whose VideoRef output field is literally named `video`. Two shipped slots name it otherwise: `split-video -> video_parts` (`out:video_parts`) and `drop-video -> clips` (`out:clips`). Both resolve to `videoNode` via `getEffectiveOutputType`, so `isValidFlowConnection` accepts them on `in:media` (the modality gate now returns `[imageNode, videoNode]` for that handle), and `getEdgeTargetOptions` — the sibling module added in this same commit — lists `in:media` for them because it *does* call `getEffectiveOutputType`. The node component is the only one of the four `alsoAccepts` consumers that does not.

Consequence when it misfires: `isVideo = mediaKind === "video"` is false, so `ComposeOverlayOpsEditor` hides the `op-time` badge and `OpForm` never renders the `start`/`end` NumberFields. The user physically cannot set a time window on a video overlay, and the ops label reads `opsMediaLabel{kind: mediaImage}` ("image"). The plugin's `test_time_window_only_between` behaviour is unreachable from the UI for those upstreams.

Reachability: the primary creation path (expand from a `videoNode`/`imageNode` via `resolveEdgeHandles`) is fine, since `mediaNode.type` matches directly. The failing path is edge *reconnection* onto an ABI node's out-handle, which `connection-rules.ts` documents as the supported manual-wiring action ("Manual edge creation is disabled in the UI …; this validator runs when users *reconnect* an existing edge's endpoint").

Fix: replace the heuristic with the existing exported helper, which already resolves ABI output fields, add-node mappings, and data nodes in one place:

```ts
const outType = getEffectiveOutputType(mediaSourceId, mediaNode?.type, mediaSourceHandle);
return outType === "videoNode" ? "video" : outType === "imageNode" ? "image" : null;
```

Returning `null` (rather than defaulting to `image`) for an unresolvable upstream keeps the unknown case visibly neutral instead of asserting the wrong modality.

Rationale for AC mapping: AC-12 cam kết rõ "ops-editor ... form đúng theo loại (field giờ chỉ hiện khi media là video)"; finding chỉ ra đúng trường hợp media THỰC SỰ là video (từ split-video/drop-video) nhưng field giờ không hiện — vi phạm trực tiếp điều khoản này của AC-12.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **SDK version bị hardcode lần thứ ba, ngoài cặp version-pair mà guard kiểm**
  Người dùng thấy gì: Nếu SDK được nâng phiên bản trong tương lai mà một nơi cập nhật bị bỏ sót, các bài kiểm tra overlay có thể báo đạt dù bản plugin thật đã hỏng, hoặc báo lỗi sai nguyên nhân.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  severity: medium
  Đề xuất: known-limits

- **CLAUDE.md mô tả sai check-manifest-unmoved.sh sau khi guard bị viết lại**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ về cách đăng ký plugin mới đang mô tả sai cơ chế kiểm tra hiện tại, có thể khiến người thêm plugin sau này làm theo hướng dẫn lỗi thời.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **Cổng execute chỉ kiểm tra có edge, không kiểm tra upstream có dữ liệu — lệch pattern có sẵn**
  Người dùng thấy gì: Người dùng có thể bấm chạy overlay khi ảnh/video hoặc logo đã nối vào node nhưng file thực tế chưa được tải lên, khiến một tác vụ được tạo ra rồi mới báo lỗi thay vì bị chặn ngay trên giao diện.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: medium
  Đề xuất: new-contract

- **Luật alsoAccepts bị nhân bản 4 nơi; nhánh topology tự merge override bằng cast thay vì dùng resolveSpec**
  Người dùng thấy gì: Rủi ro bảo trì: nếu sau này thêm loại media mới cho overlay, đội ngũ phải sửa đúng ở nhiều nơi cùng lúc, dễ sót khiến hành vi kết nối không nhất quán giữa các phần khác nhau của giao diện.
  file: `src/lib/abi/node-feature-registry.ts`
  severity: medium
  Đề xuất: known-limits

- **check-overlay-registration.sh: comment nói không re-assert manifest nhưng code có re-assert**
  Người dùng thấy gì: Ghi chú trong một script kiểm tra nội bộ tự mâu thuẫn với chính code của nó, có thể khiến người sửa sau hiểu nhầm nơi cần cập nhật khi đổi thông tin đăng ký plugin, dẫn tới thông báo lỗi trỏ sai chỗ.
  file: `scripts/plugins/check-overlay-registration.sh`
  severity: low
  Đề xuất: known-limits

- **check-manifest-unmoved.sh còn biến shell chết, trùng hằng số đã inline trong node script**
  Người dùng thấy gì: Một biến cấu hình không còn dùng nằm sót trong script kiểm tra nội bộ có thể khiến người sửa sau tưởng đã đổi được giá trị thật, trong khi guard vẫn dùng giá trị cũ hardcode ở chỗ khác.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: low
  Đề xuất: known-limits

- **Inline edge target-swap refusal is a silent no-op — the select reverts with no feedback**
  Người dùng thấy gì: Khi người dùng thử đổi một cạnh nối overlay sang một điểm nối không hợp lệ, lựa chọn trong danh sách tự động quay về giá trị cũ mà không có bất kỳ thông báo nào giải thích vì sao thao tác không thực hiện được.
  file: `src/components/workspace/edges/custom-edge.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có — danh sách rỗng, không có finding nào chưa được adversarial-verify trong round này)

⚠ Cụm ngoài vùng phủ: 2/8 lỗi rơi vào file không bộ đo nào phủ (scripts/plugins/run-overlay-plugin-tests.sh, CLAUDE.md) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.