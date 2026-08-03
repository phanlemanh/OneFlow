## Trong hợp đồng

Không có finding nào map được vào AC vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Acceptance gate blocks merge: evidence verdict=REJECT, no signoff, and evidence is stale vs HEAD**
  Người dùng thấy gì: This update hasn't passed its own final readiness review yet, so it cannot be merged or released until that review is redone and signed off.
  file: `_acceptance/compose-overlay/evidence-report.md`
  severity: high
  Đề xuất: known-limits

- **compose-overlay filed under transfer/ although it is an N→1 node (belongs in compose/)**
  Người dùng thấy gì: The new overlay tool shows up in a slightly mismatched menu grouping. It works correctly, but may be a little confusing to find when browsing available tools.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: medium
  Đề xuất: known-limits

- **CLAUDE.md's documented "fourth coupled constant" is now stale after the guard was rewritten**
  Người dùng thấy gì: Internal setup notes for developers are slightly out of date. This does not affect the product as experienced by end users.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **Overlay op numeric inputs ship without the ABI's declared min/max — the only enforcement point in a compile-time-only contract**
  Người dùng thấy gì: Typing an out-of-range number into an overlay setting (like an opacity or position value outside the allowed range) is currently accepted without warning, which can produce an unexpected result in the final image or video.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: medium
  Đề xuất: new-contract

- **Plugin-test wrapper hardcodes oneflow-sdk==0.2.18, duplicating the SDK version with no guard**
  Người dùng thấy gì: An internal test script could silently keep testing against an older version of the toolkit after a future update, which risks letting a real problem go unnoticed by the tests.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  severity: medium
  Đề xuất: known-limits

- **mediaKind silently falls back to "image" when the upstream output type cannot be resolved**
  Người dùng thấy gì: In a rare case where the tool can't determine whether connected media is a video, it may silently treat it as an image and hide the related time controls without any warning.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: low
  Đề xuất: known-limits

- **mediaKind swallows an unresolvable upstream modality into "image" (dead branch)**
  Người dùng thấy gì: In a rare case where the tool can't tell if connected media is a video, existing start/end timing on that overlay could keep applying invisibly even though the controls to see or change it have disappeared.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: medium
  Đề xuất: known-limits

- **Workflow exporter is the one handle-modality consumer not updated for alsoAccepts**
  Người dùng thấy gì: In an unusual, hard-to-reach case involving old or hand-edited saved workflows, a video connection into the overlay tool could be silently treated as an image connection when exported.
  file: `src/lib/workflow/exporter.ts`
  severity: low
  Đề xuất: known-limits

- **Raw <select> renders the first option as selected while the op field stays undefined**
  Người dùng thấy gì: For overlays loaded from an older or imported workflow, a dropdown setting may visually display a value that isn't actually saved, so what's shown may not match what actually gets rendered.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có finding nào ở trạng thái này vòng này.

⚠ Cụm ngoài vùng phủ: 5/9 lỗi rơi vào file không bộ đo nào phủ (_acceptance/compose-overlay/evidence-report.md, CLAUDE.md, src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx, scripts/plugins/run-overlay-plugin-tests.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.