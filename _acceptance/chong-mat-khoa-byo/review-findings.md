## Trong hợp đồng

- **Node key prompt renders the unreadable-store refusal as "key invalid" with a raw error code**
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx:227`
  severity: high
  AC: AC-12
  detail: `saveAndVerifyKey` throws `EnvStoreUnreadableError` (message literally `"ENV_STORE_UNREADABLE"`) on a 503, but nothing catches it by type. `useNodeKeyGate.save`'s catch funnels every error into `setState({ phase: "invalid", reason: error.message })`, and `node-key-prompt.tsx` renders that phase with a destructive border, `aria-invalid` on the input and the text `{labels.invalid} — ENV_STORE_UNREADABLE`.

  Three problems, all in one place:
  1. It is the exact false negative the surrounding code documents as an S4 round-1 regression ("could not ask" rendered as "asked and was told no"). Nobody asked the provider; the key may be perfectly good.
  2. A raw machine code is shown as user copy, untranslated, on a screen that is otherwise fully next-intl driven.
  3. AC-12 requires both node panels to "refuse to save AND point the user at Settings". The media-library panel does this via `tSettings("saveBlockedUnreadable")`; this panel does not point anywhere. The i18n keys added for it exist and are unused here — `Settings.saveBlockedUnreadable` is wired only into `add-media-library-node.tsx`, and `Settings.openSettingsHint` was added to all five locales and is referenced by nothing in shipped code at all (only by `locale-parity.test.ts` PAIRS and the proto).

  The refusal half (no PUT goes out) is correct and tested; only the message half is wrong, and `abi-node-shell.test.tsx` asserts on the thrown error type, never on what the user sees, so no test catches it.

  rationale: AC-12 đòi hỏi cả hai panel từ chối lưu VÀ chỉ người dùng sang màn Cài đặt; panel này từ chối lưu đúng nhưng không chỉ đường, nên làm AC-12 thất bại.

- **Discarding the broken key store leaves the settings form with no plugin key cards to re-enter into**
  file: `src/components/workspace/settings-dialog.tsx:391`
  severity: medium
  AC: AC-11
  detail: `fetchEnv` clears `setDecls([])` when the store is unreadable (correct — the form must not be usable). `dropStoreAndSave` then finishes with `applyEnv(data.env ?? {}, decls)`, passing that now-empty `decls`, and the PUT response carries no `pluginEnv` to refill it (the route returns `{ env, verdicts }` only).

  So the moment after the user confirms "Discard every saved key?" — whose copy promises "afterwards you must re-enter each provider's key yourself" — the dialog drops back to a form with zero declared-variable cards and zero custom rows. The only way to reach the provider cards again is to close and reopen the dialog so `fetchEnv` runs. The escape hatch lands the user one step short of the thing it exists to enable. `void fetchEnv()` in place of the `applyEnv` call would restore both env and declarations from the same source of truth.

  rationale: AC-11 đòi hỏi sau khi xác nhận thoát, màn Cài đặt phải về đúng trạng thái bình thường; mất sạch các thẻ khoá là không về trạng thái bình thường.

- **Unreadable key store renders as "key is invalid" with a raw error code in the node key prompt**
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx:226`
  severity: high
  AC: AC-12
  detail: `saveAndVerifyKey` now throws `EnvStoreUnreadableError` (message = the literal string "ENV_STORE_UNREADABLE") on a 503, but `useNodeKeyGate.save`'s catch funnels EVERY throw into `setState({ phase: "invalid", reason: error.message })`. `node-key-prompt.tsx` renders that phase with `aria-invalid`, a destructive border, `role="alert"` and the text `labels.invalid + " — " + reason`, so the user sees "Khoá chưa dùng được — ENV_STORE_UNREADABLE". Two defects in one: (a) it asserts the key is unusable when nothing was written and the key was never checked — exactly the false negative the file's own comments at lines 137 and 221 say was fixed in S4 round 1; (b) it leaks a machine code / hardcoded Vietnamese to every locale (lines 121 and 128 also throw untranslated Vietnamese sentences into the same slot). The feature added `Settings.saveBlockedUnreadable` in all five bundles for precisely this message, and the media-library panel uses it — the ABI node prompt never does. The added test (abi-node-shell.test.tsx) stops at the throw and asserts no PUT is sent, so nothing measures the rendered state. Fix: add a distinct non-destructive phase (or reuse `saved-unverified` semantics) and pass the translated `saveBlockedUnreadable` string.
  rationale: Cùng lý do như finding song sinh: AC-12 yêu cầu panel chỉ người dùng sang màn Cài đặt, panel này không làm vậy nên AC-12 thất bại.

- **After the escape hatch succeeds, the settings screen loses every plugin key declaration**
  file: `src/components/workspace/settings-dialog.tsx:391`
  severity: medium
  AC: AC-11
  detail: `fetchEnv`'s 503 branch clears state with `setDecls([])` (line 360). `dropStoreAndSave` is reachable only from that state, and on success calls `applyEnv(data.env ?? {}, decls)` with the now-empty `decls`. The PUT response body is `{ env, verdicts }` — it carries no `pluginEnv` — so there is no path back to the declarations. Result: right after the user discards a corrupt store (the one moment they must re-enter every provider key), the dialog renders zero declared-key cards and only the free-form custom rows; they have to close and reopen the dialog to get the form back. `settings-dialog.test.tsx` asserts the flagged PUT is sent but never asserts what the screen shows afterwards, so this is untested. Fix: `await fetchEnv()` after a successful drop instead of `applyEnv(..., decls)`.
  rationale: Cùng lý do như finding song sinh: mất mọi thẻ khoá sau khi xác nhận thoát là không quay về trạng thái bình thường mà AC-11 yêu cầu.

- **Unreadable store surfaces on the media-library node as "configuration missing" with no fields and no way out**
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx:287`
  severity: medium
  AC: AC-9
  detail: `resolveConfig` returns the unreadable case under `code: "MISSING_CONFIG"` and `client.server.ts:38` deliberately blanks `missing` to `[]`; the search route maps MISSING_CONFIG to HTTP 400. The node then enters `kind: "missing-config"` and renders `MediaLibraryConfigPanel` with `missing=[]` and `message={t("missingConfig")}` — the server's real explanation ("Không đọc được kho khoá đã lưu … Mở Cài đặt để xử lý") is dropped on purpose at line 287. The user is told their configuration is missing (wrong cause: the keys may well be on disk), is shown zero input fields because both `missing.includes(...)` guards are false, and gets a lone Save button whose only effect is to surface the real reason after they click it. There is no pointer to Settings: `Settings.openSettingsHint` was added to all five bundles and is rendered by the prototype (chong-mat-khoa-byo-proto.tsx:229) but by no shipped component. Fix: propagate the unreadable state as its own code/branch so the panel can render the store-unreadable sentence plus the Settings hint immediately, rather than a missing-config form with nothing in it.
  rationale: AC-9 đòi hỏi phân biệt được "kho hỏng" với "chưa cấu hình khoá"; finding cho thấy cả hai vẫn ra cùng một mã/thông điệp, tức AC-9 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **"Technical reason" line shows the whole localized error sentence, not the reason code — and its test fixture does not match what the route sends**
  Người dùng thấy gì: Người dùng dùng giao diện tiếng Anh, Nhật, Hàn hoặc Trung có thể thấy dòng giải thích kỹ thuật hiện bằng một câu tiếng Việt đầy đủ thay vì một mã ngắn gọn, gây khó hiểu.
  file: `src/components/workspace/settings-dialog.tsx:357`
  severity: medium
  Đề xuất: known-limits

- **New a11y script shares the default .next dist dir with the parallel `pnpm build` suite key**
  Người dùng thấy gì: Việc kiểm tra khả năng tiếp cận có thể thỉnh thoảng báo lỗi giả hoặc bị kẹt do chạy cùng lúc với một tác vụ dựng bản khác, chứ không phải vì tính năng thực sự có lỗi.
  file: `scripts/settings/check-a11y-proto.sh:31`
  severity: medium
  Đề xuất: known-limits

- **The "Technical reason" field shows the server's Vietnamese sentence in every locale**
  Người dùng thấy gì: Người dùng dùng giao diện không phải tiếng Việt có thể thấy nguyên một câu tiếng Việt ở dòng lý do kỹ thuật thay vì một mã ngắn gọn phù hợp ngôn ngữ của họ.
  file: `src/components/workspace/settings-dialog.tsx:502`
  severity: medium
  Đề xuất: known-limits

- **readEnvStore discards the underlying error in all four failure paths — nothing is ever logged**
  Người dùng thấy gì: Khi kho khoá không đọc được, đội vận hành sẽ không có manh mối kỹ thuật nào trong nhật ký để biết nguyên nhân (quyền truy cập, file hỏng, v.v.), khiến việc khắc phục sự cố khó hơn.
  file: `src/lib/settings/env-store.server.ts:65`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: "form đã bị THAY" đo bằng queryAllByRole("textbox") mà đối chứng dương cũng cho 0**
  Người dùng thấy gì: Bài kiểm tra xác nhận màn Cài đặt đã đổi sang thông báo lỗi có thể vẫn báo đạt ngay cả khi màn hình chưa thực sự đổi, nên một lỗi thật ở đây có thể lọt qua mà không ai phát hiện.
  file: `src/components/workspace/settings-dialog.test.tsx:86`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — E16 tuyên quét LỚP "mọi khoá t() mới" nhưng bộ lọc OWNED kéo nó về đúng danh sách viết tay mà nó nói là đã bỏ**
  Người dùng thấy gì: Bài kiểm tra dịch thuật có thể bỏ sót một dòng chữ mới chưa được dịch, khiến người dùng ở giao diện không phải tiếng Việt nhìn thấy văn bản chưa dịch mà không ai phát hiện.
  file: `src/i18n/locale-parity.test.ts:32`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — E14 vế 2 tuyên ma trận HAI panel (số assert = số panel) nhưng chỉ có một panel được đếm nút**
  Người dùng thấy gì: Bài kiểm tra có thể không phát hiện nếu ô nhập khoá ở một trong hai màn hình vô tình có thêm một nút thoát không nên có.
  file: `src/components/workspace/nodes/base/abi-node-shell.test.tsx:60`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — truy vấn âm /bỏ kho cũ|nhập lại|discard/i không có đối chứng dương ở đâu cả (đối chứng mà eval khai không tồn tại)**
  Người dùng thấy gì: Bài kiểm tra khẳng định panel này không có nút thoát nhưng không có phép đo đối chứng để chứng minh cách kiểm tra đó thực sự hoạt động, nên một lỗi thật ở đây có thể bị bỏ lọt.
  file: `src/components/workspace/nodes/add/media-library-config-panel.test.tsx:99`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — E4 tuyên loadEnvStore chạy qua CẢ SÁU trạng thái, bảng CASES chỉ có năm (thiếu 'decode')**
  Người dùng thấy gì: Bài kiểm tra tuyên bố đã kiểm đủ sáu tình huống hỏng kho khoá nhưng thực ra thiếu một tình huống, nên một lỗi chỉ xảy ra ở tình huống đó có thể không bị phát hiện.
  file: `src/lib/settings/env-store.server.test.ts:178`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — test "keeps the four reasons distinct" chỉ assert lại bảng hằng của chính file test, không gọi mã sản phẩm**
  Người dùng thấy gì: Bài kiểm tra này chỉ so sánh với chính bảng dữ liệu viết tay của nó chứ không chạy qua mã sản phẩm thật, nên không đảm bảo bốn loại lỗi kho khoá thực sự được phân biệt đúng như đã hứa.
  file: `src/lib/settings/env-store.server.test.ts:163`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — E8 mô tả ba phép đo mà lệnh gắn với nó không chạy (GET, kho 'absent', cờ-bị-bỏ-qua)**
  Người dùng thấy gì: Một số phép đo được tuyên bố cho khu vực API cài đặt thực ra không được chạy, nên một lỗi ở đó có thể không bị phát hiện trước khi phát hành.
  file: `_acceptance/config.yaml:289`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — ma trận capture khai 12 khung sáng×tối, nhưng ảnh tối trùng byte với ảnh sáng: trục theme không sinh phép đo nào**
  Người dùng thấy gì: Ảnh minh hoạ giao diện tối trong tài liệu thiết kế thực chất là ảnh sáng dán nhãn lại, nên các vấn đề chỉ hiện ra ở giao diện tối có thể chưa được nhìn thấy trong lần rà soát thiết kế này — dù đây không phải bằng chứng chính thức về khả năng tiếp cận.
  file: `_acceptance/chong-mat-khoa-byo/design-pass.md:28`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/17 lỗi rơi vào file không bộ đo nào phủ (scripts/settings/check-a11y-proto.sh, src/components/workspace/nodes/add/add-media-library-node.tsx, _acceptance/config.yaml, _acceptance/chong-mat-khoa-byo/design-pass.md) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.