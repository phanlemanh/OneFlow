## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Raw <select> instead of the repo's Select component, with untranslated option labels**
  Người dùng thấy gì: Users in every language see raw internal terms like 'top-left' or 'tiktok-portrait' instead of translated words when picking overlay position or preset options, breaking the promised multi-language experience.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: new-contract

- **New devDependencies use caret ranges; every other dependency in package.json is exact-pinned**
  Người dùng thấy gì: Test tooling used to generate the evidence that release decisions rely on could silently shift to a newer version between runs, making that evidence less trustworthy over time.
  file: `package.json`
  Đề xuất: known-limits

- **compose-overlay is an N→1 node but lives in transfer/ and is categorised TRANSFER**
  Người dùng thấy gì: The new overlay node shows up under the wrong category in the node picker, making it harder for users to find when browsing by what a node does.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  Đề xuất: known-limits

- **CLAUDE.md's documented manifest-guard contract is now stale and its prescribed remediation is impossible**
  Người dùng thấy gì: The next engineer who tries to register a new plugin, following the documented process, will hit failing automated checks with no working instructions on how to resolve them.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  Đề xuất: known-limits

- **Dead shell variables in the rewritten manifest guard duplicate the values hard-coded in the node script**
  Người dùng thấy gì: This has no effect on what users see or experience; it is leftover internal code that could confuse a future maintainer but does not change behavior today.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  Đề xuất: known-limits

- **Edge handle-swap refuses silently, with no user feedback**
  Người dùng thấy gì: When a user tries to move a connection onto an input that already has one, nothing happens and no message explains why — the change silently fails, leaving the user confused about whether they did something wrong.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: new-contract

- **canSwapOntoHandle / getEdgeTargetOptions skip the registry→static-map fallback this same diff established as the invariant**
  Người dùng thấy gì: Right after opening a workflow, the option list for swapping a connection to a different input may briefly appear empty, before the canvas has fully loaded — with no explanation shown to the user.
  file: `src/lib/abi/edge-target-options.ts`
  Đề xuất: known-limits

- **Ops form emits no range enforcement for ABI-declared numeric bounds**
  Người dùng thấy gì: Users can type an out-of-range number (such as an opacity of 12 or a position of 5) into the overlay settings with no warning, which can cause the video generation to fail or produce unexpected results.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: new-contract

- **Module-level default op object is pushed into state by reference**
  Người dùng thấy gì: Adding two overlay effects of the same kind could, in a future edit, cause them to stay silently linked so that changing one unexpectedly changes the other, corrupting saved overlay settings — this has not been triggered yet but the risk is latent.
  file: `src/components/workspace/nodes/transfer/compose-overlay-ops-editor.tsx`
  Đề xuất: known-limits

- **resolveConfigKey drops the closing quote from a config value ending in a quote**
  Người dùng thấy gì: An automated test command that happens to end in a quote character can be silently mangled before it runs, either erroring out or quietly executing something different from what was configured — and still being reported as a valid result.
  file: `lib/evidence-core.js`
  Đề xuất: new-contract

- **A `#` inside a quoted frontmatter value truncates it and leaves a stray opening quote**
  Người dùng thấy gì: A reviewer reading feature notes that contain both quotes and a '#' character will see the text cut off mid-sentence with a stray dangling quote mark, rather than the full intended note.
  file: `lib/evidence-core.js`
  Đề xuất: new-contract

- **OVERLAY_PLUGIN_REPO is silently ignored whenever the CI clone cache already exists**
  Người dùng thấy gì: Pointing the test setup at a different code repository can silently have no effect on machines that already have a cached checkout, so the tests keep validating the wrong code while still reporting success.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: new-contract

- **Compose-overlay handle labels missing from all five locales — inline edge select shows raw field names**
  Người dùng thấy gì: Users in every language see raw technical names like 'media' and 'logo' instead of translated labels when choosing which overlay input to connect a wire to.
  file: `src/i18n/messages/en.json`
  Đề xuất: new-contract

- **check-python-gen-clean.sh regenerates in place and leaves the tree dirty when it fails**
  Người dùng thấy gì: When this automated check fails, it can leave the project files in a changed state, causing unrelated checks that run afterward to fail confusingly for reasons unconnected to the actual problem.
  file: `scripts/abi/check-python-gen-clean.sh`
  Đề xuất: known-limits

- **OVERLAY_SDK_SPEC default hardcodes 0.2.18 while the sibling guard reads the version from pyproject**
  Người dùng thấy gì: After a future SDK update, the overlay plugin tests may keep silently checking against the old SDK version, missing compatibility problems with the version actually being shipped.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  Đề xuất: known-limits

