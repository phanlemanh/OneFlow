## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **New devDependencies use caret ranges in a manifest that pins every other dep exactly**
  Người dùng thấy gì: Some newly added testing tools could quietly update to a slightly different version over time, which could make some behind-the-scenes automated checks behave a bit differently without anyone deciding to change them. This does not change anything users see or do in the product.
  file: `package.json`
  Đề xuất: known-limits

- **compose-overlay op form ships no ABI bounds on numeric inputs, and nothing downstream validates**
  Người dùng thấy gì: When setting up an image/video overlay, someone can type a position or size value outside the allowed range and the app will accept it without warning — the resulting composed image or video may come out wrong or broken with no explanation of why.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: new-contract

- **CLAUDE.md's documented guard contract is stale after check-manifest-unmoved.sh was rewritten**
  Người dùng thấy gì: This is an internal instructions mismatch for engineers registering future plugins — it does not change anything a user sees or can do, but could confuse a future contributor following outdated guidance.
  file: `CLAUDE.md`
  Đề xuất: known-limits

- **ABI ops schema is a merged 4-kind union, forcing inert required x/y filler for safe_zone**
  Người dùng thấy gì: An overlay item saved with settings that do not actually match its type would not be automatically caught — it could go unnoticed until the composition runs and produces an unexpected result, without a clear error pointing at the cause.
  file: `config/tongflow.abi.json`
  Đề xuất: known-limits

- **check-overlay-registration.sh re-asserts the manifest facts its own header says it delegates**
  Người dùng thấy gì: This is an internal consistency issue between two automated checks used by engineers — it does not affect what any user experiences, only makes future maintenance of that check slightly more error-prone.
  file: `scripts/plugins/check-overlay-registration.sh`
  Đề xuất: known-limits

- **Conformance asset materialization keys on the data path prefix, not on the ABI $ref its comment claims**
  Người dùng thấy gì: This is an internal technical-testing shortcut that could, for a future kind of input field, silently skip a check it should have run — a bug introduced later might go undetected internally rather than causing something a user notices today.
  file: `src/lib/abi/conformance.ts`
  Đề xuất: known-limits

- **Inline edge target-swap refused with zero feedback (silent no-op)**
  Người dùng thấy gì: When someone tries to rewire a canvas connection to an input that turns out not to be allowed, the app silently snaps the choice back to what it was before with no message — it can look like the app froze or ignored the click, with no clue why.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: new-contract

- **producibleOutputTypes can drop a slot's primary output from the planner vocabulary**
  Người dùng thấy gì: This is a latent gap in internal planning logic that nothing today triggers, but a future related feature could cause the assistant's automatic suggestions to quietly stop offering a certain kind of result, with no visible error to explain it.
  file: `src/lib/abi/resolve.ts`
  Đề xuất: known-limits

- **Cold-mount-registry fallback landed on the source side only**
  Người dùng thấy gì: After reopening a saved project, the option to redirect a canvas connection to a different input can fail to appear at all for that connection because of a timing issue — reloading the page is needed to get it back, with no indication of why it went missing.
  file: `src/lib/workflow/connection-rules.ts`
  Đề xuất: known-limits

- **check-no-config-drift.sh is now permanently red on this branch**
  Người dùng thấy gì: This is an internal automated check tied to a different, already-approved feature that will now fail if it is ever re-run, because of files this change also touched — it does not affect anything users see, only creates confusion for engineers re-checking that other feature later.
  file: `scripts/plugins/check-no-config-drift.sh`
  Đề xuất: known-limits

