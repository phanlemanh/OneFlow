# Review Findings: per-plugin-origin (Round 9)

Informational only — not parsed by the acceptance-evidence-gate hook.

## Trong hợp đồng

Không có phát hiện nào ánh xạ được vào AC hợp đồng round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **New devDependencies use caret ranges while every other dependency in the repo is exact-pinned**
  Người dùng thấy gì: A handful of new testing-tool dependencies aren't locked to exact versions like the rest of the project, so a future routine update could shift their versions without anyone deciding to — this could quietly break the automated screenshot evidence collection used for review.
  file: `package.json`
  severity: medium
  Đề xuất: known-limits

- **pnpm build-script allowlist is orphaned: package.json's `pnpm.onlyBuiltDependencies` is ignored and the replacement pnpm-workspace.yaml is uncommitted**
  Người dùng thấy gì: A configuration file needed to correctly build some of the app's native components appears to be missing from this change, so a fresh project setup could silently skip building pieces like the database engine or image processing, surfacing as a confusing failure later rather than a clear error.
  file: `package.json`
  severity: medium
  Đề xuất: known-limits

- **CLAUDE.md still documents the retired first-edition manifest guard (`expected_count`) that this change deleted**
  Người dùng thấy gì: The internal guide that tells developers how to safely register a new plugin gives outdated instructions that no longer match how the safeguard actually works, so the next person to add a plugin could hit a confusing failure with no correct guidance to follow.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **Node is registered as a TRANSFORM node in transfer/ but has 3 input handles and is documented under "Combine" in all three READMEs**
  Người dùng thấy gì: A newly added feature is filed under the wrong internal category, so the documentation and the underlying code disagree about what kind of feature it is — this doesn't change what users see today, but could confuse anyone maintaining or explaining the feature later.
  file: `src/components/workspace/types.tsx`
  severity: low
  Đề xuất: known-limits

- **Inline edge target-handle swap silently moves a video edge onto the image-only in:logo handle**
  Người dùng thấy gì: If a user connects both a video and an image into the new overlay feature and then uses the on-canvas menu to reassign a connection, the app can silently put the video into the image-only slot — producing a confusing failure or a visibly wrong result with no warning that anything went wrong.
  file: `src/components/workspace/edges/custom-edge.tsx`
  severity: high
  Đề xuất: new-contract

- **getEdgeTargetOptions is the one alsoAccepts consumer the diff left unfixed**
  Người dùng thấy gì: Once a video connection ends up on the wrong slot of the new overlay feature, there's currently no way for the user to fix it through the interface's own controls — they would need to delete and redo the connection from scratch.
  file: `src/lib/abi/edge-target-options.ts`
  severity: medium
  Đề xuất: known-limits

- **Workspace.handles labels for the new media/logo handles are missing in all 5 locales**
  Người dùng thấy gì: The two new connection points on the overlay feature show raw untranslated technical names instead of proper labels, in every supported language including Vietnamese — this feature's primary audience.
  file: `src/i18n/messages/en.json`
  severity: medium
  Đề xuất: known-limits

- **Registration guard's i18n check passes on a locale that lost the whole composeOverlay block**
  Người dùng thấy gì: The automated check meant to catch a missing translation for this feature can still pass even when an entire language's translation is deleted, so a translation gap could ship to users without anyone being alerted.
  file: `scripts/plugins/check-overlay-registration.sh`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).