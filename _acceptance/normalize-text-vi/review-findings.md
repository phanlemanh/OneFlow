## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **SDK returns hard-coded Vietnamese error strings through the ABI `error` output**
  Người dùng thấy gì: When the automatic reading fails, the error message shown is always in Vietnamese, so users of the app in other languages (Chinese, Japanese, Korean, English) would see a Vietnamese error sentence instead of one in their own language.
  file: `sdk/tongflow/text/normalize_vi.py:345`
  severity: high
  Đề xuất: new-contract

- **Non-English comments in SDK product code and tests**
  Người dùng thấy gì: Some internal code comments are written in Vietnamese instead of English inside the engine's source files; this has no effect on what any user sees or hears in the product.
  file: `sdk/tongflow/text/normalize_vi.py:141`
  severity: medium
  Đề xuất: known-limits

- **New guard script prints Vietnamese diagnostics while every sibling guard is English**
  Người dùng thấy gì: Some internal developer-only check scripts print diagnostic messages in Vietnamese instead of English; this only appears to engineers running internal checks and never reaches a product user.
  file: `scripts/abi/check-normalize-sdk-published.sh:24`
  severity: medium
  Đề xuất: known-limits

- **check-manifest-unmoved.sh header contradicts CLAUDE.md about its own snapshot count**
  Người dùng thấy gì: An internal explanatory comment inside a developer safety-check script is slightly out of date about its own history; this is invisible to end users of the product.
  file: `scripts/plugins/check-manifest-unmoved.sh:17`
  severity: low
  Đề xuất: known-limits

- **`_AMBIGUOUS_D` exempts the digit-after / comma-after positions on a false premise — real street addresses read as money with ok=True**
  Người dùng thấy gì: For addresses whose street name is a number right after the currency letter 'Đ' (common Vietnamese street names like 'Đường 3/2' or 'Đường 30/4'), the app misreads the address as a price and reports success even though the reading is wrong.
  file: `sdk/tongflow/text/normalize_vi.py:200`
  severity: high
  Đề xuất: new-contract

- **Export-time TTS warning now instructs users to add a node no shipped plugin can execute**
  Người dùng thấy gì: After the app's official add-on for reading Vietnamese numbers aloud was pulled from public listing, workflows using text-to-speech still show a warning telling users to add that node — but most users currently have no way to install it, so the suggested fix in the warning cannot be followed.
  file: `src/lib/workflow/exporter.ts:398`
  severity: medium
  Đề xuất: known-limits

- **`has_money` docstring claims an address-stripping step the function does not perform**
  Người dùng thấy gì: Internal engineering documentation for one helper function describes a safety step that was actually removed from the code; this doesn't change what any user experiences, but could mislead a future developer reading the docs.
  file: `sdk/tongflow/text/normalize_vi.py:292`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture conformance viết tay đúng khuôn bên đọc, không round-trip từ exportWorkflow**
  Người dùng thấy gì: The automated test that checks the visual workflow builder and the backend engine agree on how this node is called uses hand-written sample data rather than data generated from the real workflow-export process, so it might not catch a future mismatch if the real export logic changes shape.
  file: `sdk/tests/conformance/fixtures/normalize-text-vi.json:9`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
