## Trong hợp đồng

### 1. ops[] merges four disjoint op kinds into one flat schema, forcing inert required fields
- file: `config/tongflow.abi.json:2541`
- severity: medium
- source: conventions
- AC: AC-1

The `ops` item schema is a single object with `required: ["type","x","y"]`, `additionalProperties: false`, and the union of every field any of the four kinds needs (text/size/color/align/max_width/bg_color/padding/radius/width/opacity/preset/top/bottom/left/right/start/end). Nothing in the contract ties a field to its kind. Two concrete consequences visible in this diff: (1) `safe_zone` must carry meaningless coordinates — `compose-overlay-ops-editor.tsx:44` `NEW_OP.safe_zone` sets `x: 0, y: 0` and the code comments call it "inert filler required by the merged ABI ops schema", with `compose-overlay-op-form.tsx:506` hiding the fields from the user; (2) nothing rejects a `logo` op carrying `bg_color`, or a `safe_zone` carrying `text`/`start`/`end`. This is the ABI-hygiene rule in CLAUDE.md ("One canonical knob per concept", "ABI inputs are the cross-plugin product contract") being bent: the shape a plugin must accept is broader than any real op. A discriminated `oneOf` on `type` (or four separate typed arrays) expresses the actual contract; the merged shape means the ABI documents nothing a plugin author can rely on.

Rationale: AC-1's Given clause names the design explicitly as "ops oneOf 4 loại"; a flat merged schema with no discriminated union directly contradicts that stated ABI shape.

### 2. in:media rejects every video source — the whole video half of compose-overlay is unreachable on the canvas
- file: `src/lib/abi/node-feature-registry.ts:234`
- severity: high
- source: bugs
- AC: AC-12

`composeOverlayNode`'s sourceSpec declares `text`, `logo`, `ops` but deliberately leaves `media` to the ABI default, with the comment "`media` accepts image or video, so the generic default stays". That comment is wrong. `media` is `$ref: #/$defs/Asset`, and `classifyInputField` routes a generic `Asset` through `inferNodeTypeFromFieldName("media")` (src/lib/abi/handle-introspect.ts:132-146) — the field name contains no "video"/"image"/"audio" token, so it hits the final `return "imageNode"` fallback. The generic default is not "anything", it is imageNode.

`isValidFlowConnection` then hard-rejects any non-image upstream:
```
const expected = expectedTargetHandleType(targetNode.id, "in:media"); // "imageNode"
if (expected && expected !== outType) return false;  // connection-rules.ts:178-182
```

Verified with a probe test against the real registry + validator:
```
resolveSpec("compose-overlay").fields.media -> {"kind":"handle","nodeType":"imageNode","path":"fileKeys[0]",...}
videoNode    -> in:media : false
addVideoNode -> in:media : false
imageNode    -> in:media : true
```

Failure scenario: user drags a Video node onto compose-overlay's `in:media` — React Flow refuses the edge, silently, with no message. Everything built for the video path is dead code: the `out:video` ABI output, `mediaKind === "video"`, the start/end time inputs in compose-overlay-op-form.tsx, the `op-time` badge, the `mediaVideo`/`fullVideo` i18n strings, and the plugin's video golden tests.

Why no test caught it — both new suites bypass the validator. `src/lib/workflow/compose-overlay-export.test.ts:462` builds a `videoNode -> in:media` edge and calls `exportWorkflow` directly. `compose-overlay.test.tsx` injects the same edge straight into `<ReactFlow edges={...}>`. Neither ever calls `isValidFlowConnection`, so both are green against a graph the canvas can never produce.

Fix: give `media` an explicit override that admits both modalities (the ABI-default single-nodeType classification cannot express image-or-video), or rename/extend `inferNodeTypeFromFieldName` handling for this slot.

Rationale: AC-12 requires handles to be correct per the ABI (in:media accepting media per design); the verified probe shows in:media resolves to image-only, silently rejecting every video connection, so the handle is not correct.

### 3. check-python-gen-clean.sh passes when a generated model file is never committed
- file: `scripts/abi/check-python-gen-clean.sh:8`
- severity: medium
- source: bugs
- AC: AC-1

The guard regenerates both Python artifacts and then asserts cleanliness with `git diff --exit-code sdk/tongflow/models sdk/tongflow/node_slots.py`. `git diff` does not see untracked files, and `gen_models.py` emits one NEW file per new slot — exactly what this change did (`sdk/tongflow/models/compose_overlay.py`).

Verified empirically: removed the file from the index and from disk, then ran the guard.
```
$ bash scripts/abi/check-python-gen-clean.sh
EXIT=0
$ git status --porcelain sdk/tongflow/models
D  sdk/tongflow/models/compose_overlay.py
?? sdk/tongflow/models/compose_overlay.py
```

The guard reports green while the slot's Pydantic model is not in the commit at all. Since CLAUDE.md states the ABI is enforced at compile time only, a missing generated model is precisely the failure this eval (`abi_python_gen_clean`, _acceptance/config.yaml:190) exists to catch — the published wheel would ship without the type and plugin `from tongflow.models.compose_overlay import ...` would ImportError at runtime.

Fix: add `git status --porcelain --untracked-files=all <paths>` (must be empty) alongside the diff check, or `git add -N` the paths before diffing.

Rationale: AC-1's Then explicitly requires generated files including models/compose_overlay.py to be committed and matching; this guard is the mechanism meant to enforce exactly that, and it demonstrably passes when the file is missing entirely.

### 4. check-overlay-registration.sh capability-row assertion is tautological and can never fail
- file: `scripts/plugins/check-overlay-registration.sh:22`
- severity: medium
- source: bugs
- AC: AC-14

Inside the README loop:
```
grep -q "$P" "$f" || { echo "FAIL: $f missing plugin list entry"; exit 1; }
grep -qi "overlay" "$f" || { echo "FAIL: $f missing capability row"; exit 1; }
```
with `P=oneflow-modal-compose-overlay`. The plugin id itself contains the substring "overlay", so whenever the first grep succeeds the second is guaranteed to succeed on the same file. The capability-matrix check has no independent power.

Failure scenario: someone adds the plugin to the Official plugins list in README.md / docs/README_ZH.md / docs/README_JA.md but forgets to flip the corresponding node from ⬜ to ✅ in the capability matrix — the exact drift CLAUDE.md's "Registering an official plugin" section warns about and this eval (`overlay_registration_synced`) claims to guard. The script reports OK.

Fix: grep for the matrix row itself (e.g. the row label plus `✅`), not for a substring of the plugin id.

Same file, line 26: the i18n loop covers en/zh/ja/ko but omits `src/i18n/messages/vi.json`, which this change also modified — a missing Vietnamese block would pass.

Rationale: AC-14 requires all 3 READMEs to carry a genuine capability-matrix row; this guard is the enforcement for that requirement, and it is shown to always pass regardless of whether the matrix row was actually added, so it fails to verify AC-14.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **New ABI numeric constraints are enforced nowhere — the op form is the only boundary and imposes none**
  Người dùng thấy gì: Nhập giá trị âm hoặc vượt khoảng hợp lệ (như độ mờ hay cỡ chữ) vào form chỉnh overlay hiện không bị chặn, có thể tạo ra bản overlay sai lệch mà không có cảnh báo nào cho người dùng.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: medium
  Đề xuất: known-limits

- **Manifest guard rewritten with hardcoded plugin identity; CLAUDE.md's documented contract for it is now stale**
  Người dùng thấy gì: Tài liệu nội bộ giải thích cách kiểm tra danh sách plugin không được cập nhật theo thay đổi mới, nên người thêm plugin tiếp theo có thể bị bối rối và mất thời gian tra một lỗi không liên quan tới việc họ đang làm.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: medium
  Đề xuất: known-limits

- **Node with two Asset handles filed under transfer/ (1→1) instead of compose/ (N→1)**
  Người dùng thấy gì: Node dán overlay có thể bị xếp nhầm nhóm trong danh sách công cụ, khiến người dùng khó tìm thấy nó khi đang tìm nhóm chức năng ghép nhiều nguồn lại với nhau.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: low
  Đề xuất: known-limits

- **config.yaml capture comment contradicts the setting directly below it**
  Người dùng thấy gì: Một ghi chú hướng dẫn trong tệp cấu hình đánh giá nội bộ vẫn nói tính năng chụp ảnh minh chứng chưa có, dù dòng ngay bên dưới đã bật tính năng đó — người đọc sau có thể hiểu nhầm và làm lại việc đã xong.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **Freshly added ops share module-level object instances by reference**
  Người dùng thấy gì: Nếu sau này có người sửa trực tiếp một overlay chữ mặc định thay vì sao chép nó, mọi overlay chữ mới thêm vào bất kỳ workflow nào cũng có thể vô tình đổi theo — nhưng hiện tại chưa gây ra sự cố nào.
  file: `src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx`
  severity: low
  Đề xuất: known-limits

- **mediaKind detection uses raw node.type, missing addVideoNode and non-`out:video` video routes**
  Người dùng thấy gì: Nếu sau này ảnh/video được đưa vào node overlay qua một số đường thêm-video khác, ô chọn thời điểm bắt đầu/kết thúc cho overlay có thể không hiện ra dù đúng ra phải hiện — nhưng cách nối hiện tại chưa cho phép người dùng tạo ra tình huống đó.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: medium
  Đề xuất: known-limits

- **Plugin-repo cache is reused without verifying its remote matches OVERLAY_PLUGIN_REPO**
  Người dùng thấy gì: Khi đội kỹ thuật đổi kho mã nguồn plugin dùng để kiểm thử, hệ thống kiểm thử tự động có thể âm thầm dùng lại bản kho cũ đã lưu, khiến báo cáo kết quả kiểm thử gán nhầm cho một phiên bản plugin chưa từng được chạy.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(none)

⚠ Cụm ngoài vùng phủ: 4/11 lỗi rơi vào file không bộ đo nào phủ (src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx, _acceptance/config.yaml, src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx, scripts/plugins/run-overlay-plugin-tests.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.