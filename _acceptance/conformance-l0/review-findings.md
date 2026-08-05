## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Merged ops schema erases per-kind discrimination, voiding the compile-time-only gate on the plugin side**
  Người dùng thấy gì: Overlay operations (text, price tag, logo, safe zone) are not checked against their own field rules when the plugin actually runs, so a wrong or missing setting for one overlay type can pass unnoticed and produce a broken overlay instead of a clear error.
  file: `config/tongflow.abi.json`
  Đề xuất: known-limits

- **CLAUDE.md still documents the first-edition manifest guard this diff replaced**
  Người dùng thấy gì: The internal setup guide for registering a new plugin still points to outdated instructions for an old safety check, so someone following it later could get confused or stuck.
  file: `CLAUDE.md`
  Đề xuất: known-limits

- **ABI adopts JSON-Schema constraint keywords the project's enforcement model cannot honor**
  Người dùng thấy gì: The numeric limits shown for overlay position, opacity, and size (for example, keeping a value between 0 and 1) are not actually enforced anywhere in the app, so an out-of-range value could be saved without any warning.
  file: `config/tongflow.abi.json`
  Đề xuất: known-limits

- **alsoAccepts doc comment is stale on arrival — it already drives four subsystems, not just the connection validator**
  Người dùng thấy gì: An internal note about how connection-widening works understates how many parts of the app actually depend on it, which could lead a future change to break more connections than expected.
  file: `src/lib/abi/sources.ts`
  Đề xuất: known-limits

- **New invariant guards are wired to acceptance evals only, never to CI or pre-merge-check**
  Người dùng thấy gì: New safety checks added for the overlay feature only run during manual review, not automatically on every future code change, so a regression in overlay setup could slip through unnoticed later.
  file: `.github/workflows/ci.yml`
  Đề xuất: known-limits

- **Director compiles a compose-overlay step with zero issues but no `ops`, producing a permanently unexecutable node**
  Người dùng thấy gì: When the app auto-plans a workflow, it can add an Overlay step with no overlay content configured and report no problem, leaving that step permanently unable to run with no explanation shown to the user.
  file: `src/lib/director/compile.ts`
  Đề xuất: new-contract

- **Inline edge handle-swap is silently refused with no user feedback**
  Người dùng thấy gì: Trying to move a connection onto a slot that isn't actually allowed just silently snaps back with no message, leaving the user unsure why nothing happened.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: known-limits

- **compose-overlay treats an unresolvable upstream modality as "image", hiding the video-only time controls**
  Người dùng thấy gì: When the app can't tell whether incoming media is a video, it quietly treats it as an image, which can hide time-range controls a user actually needs to set up a video overlay correctly.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  Đề xuất: known-limits

- **Two overlay guard scripts share one /tmp git working tree and `reset --hard` it, racing across the ~15 eval keys that invoke them**
  Người dùng thấy gì: Two overlay test scripts share the same temporary folder and can interfere with each other if run around the same time, which could cause a spurious test failure that has nothing to do with an actual bug.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: known-limits

