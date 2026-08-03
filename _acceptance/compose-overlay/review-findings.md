## Trong hợp đồng

### 1. mediaKind memoizes a read of the non-reactive ABI node registry, which is only populated in a post-render effect
- file: `src/components/workspace/nodes/transfer/compose-overlay.tsx:66`
- severity: high
- source: conventions
- AC: AC-12

`mediaKind` calls `getEffectiveOutputType(mediaSourceId, mediaNode?.type, mediaSourceHandle)` inside a `useMemo` with deps `[mediaSourceId, mediaNode, mediaSourceHandle]`. For an ABI upstream (the split-video / drop-video case this code was explicitly written to fix), `getEffectiveOutputType` resolves via `getAbiNodeRegistration(nodeId)` — a plain module-level Map in `src/lib/abi/node-registry.ts`, populated by `registerAbiNode` inside a `useEffect` in `src/hooks/use-abi-execution.ts:150-163`. Effects run AFTER render. So on the first render of a restored workflow the upstream is not yet registered, `getEffectiveOutputType` returns undefined, and the `return "image"` fallback at the end of the memo is cached. None of the three deps change when the registry later fills in, and the module map is not reactive, so the memo never recomputes: for an ABI video upstream the per-op time controls and the time badge stay hidden for the lifetime of the node — precisely the regression the block's own comment claims to fix. The new test masks this: `compose-overlay.test.tsx` calls `registerAbiNode({nodeId: 'm1', ...})` inside `buildGraph` BEFORE `render()`, so the registry is warm on first paint and the failure mode is unobservable. The same silent `return "image"` also swallows the genuinely-unresolvable case with no signal to the user.

Rationale: AC-12 yêu cầu form ops-editor chỉ hiện field thời gian khi media thực sự là video; bug khiến điều kiện này sai trên lần render đầu với upstream ABI video.

### 2. compose-overlay mediaKind collapses an unresolved upstream into "image", hiding video-only time controls
- file: `src/components/workspace/nodes/transfer/compose-overlay.tsx:80`
- severity: medium
- source: bugs
- AC: AC-12

```ts
const outType = getEffectiveOutputType(mediaSourceId, mediaNode?.type, mediaSourceHandle);
if (outType === "videoNode") return "video";
if (outType === "imageNode") return "image";
return "image";
```
The second branch is dead relative to the fallback: `undefined` (upstream unresolvable) is indistinguishable from a genuine image. `mediaKind === "image"` drives three things — `isVideo` in the ops editor (hides the `op-time` badge), `timeRow` in `OpForm` (hides the `start`/`end` inputs entirely), and the `opsMediaLabel` text. So an unresolved video upstream silently degrades into an image UI: AC-8's per-op time window becomes uneditable while the `start`/`end` values still sit in `data.ops` and still ship to the plugin.

How it becomes reachable: `getEffectiveOutputType` returns `undefined` for an ABI upstream that is not yet in `node-registry` (`registerAbiNode` runs in a `useEffect` in `use-abi-execution.ts:152`, i.e. after the first render commit). The registry is a plain module-level Map with no store subscription, and the `useMemo` deps are `[mediaSourceId, mediaNode, mediaSourceHandle]` — none of which change when registration lands. So on a workflow load where compose-overlay commits before its upstream's effect runs, the wrong answer can stick until an unrelated re-render happens to recompute it.

This is the same class of bug commit 4447f41 was written to fix ("a hand-rolled `sourceHandle === "out:video"` test ... silently hid the per-op time controls"); the shared resolver was adopted, but the unknown case is still swallowed. Prefer returning `null` for an unresolved upstream (the type already allows it and the label path already handles `null`) rather than guessing "image".

Rationale: Cùng vi phạm điều kiện AC-12 'field giờ chỉ hiện khi media là video' — upstream video không được nhận diện đúng khiến field thời gian bị ẩn sai.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **The alsoAccepts acceptance rule is re-implemented in five places instead of one shared predicate**
  Người dùng thấy gì: Chưa gây ảnh hưởng gì cho người dùng lúc này, nhưng nếu sau này thêm node hoặc kiểu kết nối mới, đội phát triển có nguy cơ sửa đúng một chỗ mà quên các chỗ khác, khiến việc nối dây giữa các node bị sai một cách âm thầm.
  file: `src/lib/abi/node-feature-registry.ts`
  severity: medium
  Đề xuất: known-limits

- **resolveEdgeHandles no-spec branch bypasses resolveSpec and hand-merges NODE_TYPE_SOURCE_SPEC through an unsafe cast**
  Người dùng thấy gì: Chưa gây lỗi cho người dùng ngay bây giờ, nhưng cách kiểm tra kết nối này không được kiểm tra chặt chẽ như phần còn lại của hệ thống, nên có rủi ro về sau một loại kết nối bị chấp nhận hoặc từ chối sai mà không ai phát hiện.
  file: `src/lib/abi/node-feature-registry.ts`
  severity: medium
  Đề xuất: known-limits

- **CLAUDE.md still documents the retired first-edition manifest guard after the first origin entry landed**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ cho người phát triển vẫn mô tả cách kiểm tra danh sách plugin theo phiên bản cũ, có thể khiến người đăng ký plugin mới sau này làm theo hướng dẫn sai.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **Raw <select> with untranslated enum options, deviating from the repo's Select component and 5-locale i18n convention**
  Người dùng thấy gì: Người dùng không dùng tiếng Anh sẽ thấy một số lựa chọn trong menu overlay (ví dụ vị trí đặt logo) hiển thị bằng tiếng Anh thô chưa dịch, và ô chọn này trông khác kiểu với các node khác trong ứng dụng.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: medium
  Đề xuất: known-limits

- **Refused edge swap is a silent no-op — user gets zero feedback**
  Người dùng thấy gì: Khi người dùng cố nối lại một cạnh vào vị trí không hợp lệ, ô chọn chỉ tự động nhảy về giá trị cũ mà không có thông báo gì, khiến người dùng không hiểu vì sao thao tác của mình không có tác dụng.
  file: `src/components/workspace/edges/custom-edge.tsx`
  severity: medium
  Đề xuất: known-limits

- **Conformance harness decides "is this an asset handle" by path prefix where the Python side uses the ABI $ref — the drift detector can itself drift**
  Người dùng thấy gì: Hiện tại chưa có sự cố nào xảy ra, nhưng nếu sau này thêm trường dữ liệu mới cho node, công cụ kiểm tra tự động có nguy cơ báo nhầm là hai môi trường xử lý cho kết quả khác nhau dù thực chất chúng khớp, hoặc ngược lại bỏ sót lỗi thật.
  file: `src/lib/abi/conformance.ts`
  severity: low
  Đề xuất: known-limits

- **Inline edge select renders untranslated raw field names "media" and "logo" in all five locales**
  Người dùng thấy gì: Người dùng không dùng tiếng Anh khi mở ô chọn kết nối giữa các node sẽ thấy tên trường dữ liệu thô như 'media' và 'logo' xen lẫn với các nhãn đã được dịch, khiến giao diện trông chưa hoàn thiện.
  file: `src/i18n/messages/en.json`
  severity: low
  Đề xuất: known-limits

- **check-manifest-unmoved.sh keeps two shell variables that the rewritten body no longer reads**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng cuối; đây là phần cấu hình không còn tác dụng trong một kịch bản kiểm tra nội bộ, có thể khiến người bảo trì sau này chỉnh nhầm chỗ tưởng có tác dụng nhưng thực ra không.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có finding nào ở trạng thái này vòng này.

⚠ Cụm ngoài vùng phủ: 4/10 lỗi rơi vào file không bộ đo nào phủ (CLAUDE.md, src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx, src/lib/abi/conformance.ts, src/i18n/messages/en.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
