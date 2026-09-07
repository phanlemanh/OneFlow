# Review findings — round 3 (4d8dd32)

## Trong hợp đồng

### Hình dạng #3 — năm hình dạng lỗi bị thu về MỘT BIT, quan hệ (hình dạng → lý do) không được ghim ở bất kỳ đâu
- file: `src/lib/settings/env-client.test.ts:44`
- severity: medium
- nguồn: measurement

Vòng lặp 5 ca của E13 chỉ khẳng định `expect(read.state).toBe("unreadable")` (dòng 44) — một bit boolean. Nó KHÔNG khẳng định `read.reason.code` (`http`/`not-json`/`no-env`/`network`) hay `status`, tức cả cây phân loại `ReadFailure` mà `env-client.ts` gọi là load-bearing và `read-failure-text.ts` (tệp mới, 4 nhánh) dịch ra câu chữ đều KHÔNG có phép đo nào. Hệ quả nối tiếp ở lớp UI: AC-10 hứa form bị thay bằng "tấm NÊU LÝ DO và câu chưa có gì bị thay đổi", và `expected` của E2 viết rõ "role=alert chứa LÝ DO đọc được VÀ câu ...", nhưng `settings-dialog.unreadable.test.tsx:41-43` chỉ assert `notices()[0].textContent` chứa `SU.unchanged` — không assert chuỗi lý do, cũng không assert `role="alert"`. Không tệp nào (grep `reason`/`cause` toàn bộ 7 tệp test mới) đọc lại chuỗi lý do đã render; ở E6/E7 hàm `storeUnreadableReason` còn do chính test cấp và đầu ra của nó không bao giờ bị assert. Vì vậy 5 ca của E2, 10 ca của E6 và 5 ca của E13 đang khẳng định CÙNG MỘT mệnh đề: một reader gán mọi lỗi thành `{code:"network"}`, hoặc một tấm chặn render lý do rỗng, vẫn xanh toàn bộ ma trận — trong khi lý do chính là thứ duy nhất phân biệt năm hình dạng đó.

### Hình dạng #3 — nửa sau của AC-13 ("không khoá nào để nguyên tiếng Anh") đo bằng sự CÓ MẶT của khoá, không đo quan hệ giá trị
- file: `src/i18n/locale-parity.test.ts:157`
- severity: medium
- nguồn: measurement

AC-13 hứa hai vế: (1) mỗi khoá có mặt ở đủ 5 locale, và (2) "không khoá nào để nguyên tiếng Anh trong bốn tệp còn lại". `locale-parity.test.ts` chỉ làm phẳng thành TẬP KHOÁ (`flatten` → `Set`) rồi so tập (dòng 157 và 166); không có một khẳng định nào so `messages[locale][k]` với `en[k]`. Vế (2) do đó không có phép đo: copy-paste nguyên văn tiếng Anh vào ja/ko/zh cho toàn bộ 22 khoá mới vẫn xanh tuyệt đối, và `expected` của E8 trong evals.yaml cũng chỉ mô tả ba khẳng định về tập khoá nên khoảng trống này không được khai ra ở Cổng 2. (Đo hiện trạng: hôm nay chưa khoá mới nào trùng giá trị en, nên đây là lỗ hổng của phép đo chứ chưa phải hồi quy.)

### Nhánh thoát sớm nuốt trọn assertion — ca đo "names what is missing" xanh khi trả về sai `kind`
- file: `src/lib/media-library/config.server.test.ts:29`
- severity: low
- nguồn: measurement

Ba ca sửa từ `if (result.ok) return;` thành `if (result.ok || result.kind !== "missing") return;` (dòng 29, 37, 66). Đúng lúc `resolveConfig` hồi quy sang trả `kind: "store-unreadable"` cho ca thiếu cấu hình — chính chiều lỗi đối xứng mà E1 gọi tên là "NỬA ĐÀN ÁP" — thì ba ca này thoát trước mọi `expect`, chỉ còn lại `expect(result.ok).toBe(false)`, và báo PASS. Sửa đúng hình dạng là `expect(result.kind).toBe("missing")` rồi mới narrow, thay vì `return`.

## Ngoài hợp đồng

<a id="ngoai-1"></a>
### Destructive store wipe is authorized by a client-side read failure, and the server never re-checks the store is really unreadable
- file: `src/lib/settings/env-client.ts:149`
- severity: high
- nguồn: conventions

`replaceUnreadableStore()` sends `PUT {env: {}, replaceUnreadableStore: true}`, and `src/app/api/settings/env/route.ts:113-125` only uses that flag to SKIP the 409 refusal — it never verifies that `readEnvStore()` actually returned `unreadable` before calling `saveEnvStore({})`. The only thing gating the flag is `readEnvForBrowser()`, which classifies EVERY non-200 as `unreadable` (env-client.ts:88-93): a 401/403 from the cloud shell's middleware, a proxy 502, an HTML error page, a dropped connection. So the sequence "GET fails transiently -> settings screen shows 'your saved API keys could not be read' -> user clicks the only offered control -> PUT succeeds" erases a perfectly healthy key store. The server is the boundary here and it accepts a client's assertion about server-side state without validating it; the guarantee 'the store really was broken' exists only in the browser. Minimum fix: make the route recompute `readEnvStore()` and reject `replaceUnreadableStore: true` with 409 when the store reads `ok`/`absent`; and give the blocked settings state a Retry before the destroy button.

<a id="ngoai-2"></a>
### Settings screen dropped the shared API client, losing the 401 sign-in seam and the request timeout
- file: `src/components/workspace/settings-dialog.tsx:365`
- severity: high
- nguồn: conventions

The dialog previously went through `apiGet`/`apiPut` (`src/lib/api/client.ts`), which is the repo's one client-side HTTP wrapper and carries two behaviours this diff silently removes: (1) the documented embedding-shell seam — on 401 it dispatches the cancelable `tf:unauthorized` event so the desktop/cloud shell can raise its sign-in dialog (client.ts:159-175); (2) a 30s AbortController timeout. `readEnvForBrowser`/`put` in env-client.ts use bare `fetch` with neither. Consequences: an expired session in the cloud shell now renders 'Your saved API keys could not be read (the server answered 401)' plus a 'Replace the key store with an empty one…' button instead of a re-auth prompt; and a hung request never settles, so `fetchEnv`'s `finally { setLoading(false) }` never runs and the dialog spins forever with no way out. `src/lib/api/client.ts` is still the pattern used by plugins-dialog and every `src/lib/api/*` module, so this is a one-file departure from the existing pattern, not a repo-wide change.

<a id="ngoai-3"></a>
### A failed write is reported to the user as "key saved"
- file: `src/components/workspace/nodes/base/abi-node-shell.tsx:231`
- severity: high
- nguồn: conventions

When `saveEnvKeys` comes back `{ok: false, reason: "write-failed"}` (HTTP 500, non-JSON response, network drop — nothing was persisted), `useNodeKeyGate.save` sets `phase: "saved-unverified"`. `node-key-prompt.tsx:171-179` renders that phase with a green check and the label `savedUnverified` = "Đã lưu khoá — chưa kiểm tra được" ("Key saved — could not verify"). The user is told their key was stored when it was not, so they close the prompt and the node fails again later with no explanation. This directly contradicts the invariant the rest of the change is built on (never misstate what happened to the store), and the code comment above it acknowledges the write is not a statement about the key while still choosing a phase that asserts a successful save. No test covers this mapping — `store-unreadable-refusal*.test.tsx` supply a `writeFailed` label but never drive the write-failure path. It needs its own phase (e.g. `write-failed`) with neutral copy and no success affordance.

<a id="ngoai-4"></a>
### `pluginEnv` is blind-cast while `env` is positively validated, and the catch that used to absorb the mismatch is gone
- file: `src/lib/settings/env-client.ts:110`
- severity: medium
- nguồn: conventions

`readEnvForBrowser` states its gate as a positive assertion for `env` (200 + parses + plain object) but then does `const pluginEnv = (body as {pluginEnv?: PluginEnvDecl[]})?.pluginEnv ?? []` with no shape check. `settings-dialog.tsx:365-378` no longer wraps `fetchEnv` in try/catch (the old `apiGet` version did), so a body whose `pluginEnv` is not an array throws inside `applyEnv` at `nextDecls.flatMap(...)` (settings-dialog.tsx:345) AFTER `setBlocked(null)` has already run. The `finally` clears `loading`, and the screen renders the normal form with empty/stale rows and an enabled Save — which is exactly the empty-form-overwrites-the-store path this whole change exists to close. Apply the same positive gate to `pluginEnv` (`Array.isArray`) as to `env`, or treat a bad shape as `no-env`.

<a id="ngoai-5"></a>
### STORE_UNREADABLE in the media-library node offers no way forward, unlike the other two surfaces
- file: `src/components/workspace/nodes/add/add-media-library-node.tsx:152`
- severity: low
- nguồn: conventions

`search()` routes only `MISSING_CONFIG` to the config panel; the new `STORE_UNREADABLE` code falls into the generic `{kind: "failure"}` branch, which renders the `failure.STORE_UNREADABLE` sentence and nothing else. The sentence ends with "open Settings", but this surface renders no `StoreUnreadableNotice` and no `requestOpenSettings()` control — while the key prompt and the config panel both do. Same condition, three surfaces, two different affordances; the escape-hatch consistency the change argues for is not reached on the search path.

<a id="ngoai-6"></a>
### `Workspace.nodes.addMediaLibrary.readFailed` is now dead in all five locales
- file: `src/i18n/messages/en.json:1104`
- severity: low
- nguồn: conventions

`MediaLibraryConfigPanel` dropped the `readFailed` label (the read/refuse decision moved into `saveEnvKeys`), but the key stays in en/ja/ko/vi/zh. `src/i18n/locale-parity.test.ts` only checks presence-parity across locales and en-superset, so an unused key can never go red — the string will drift and be translated forever. Delete it from all five files with the code that stopped using it.

<a id="ngoai-7"></a>
### A failed key WRITE is shown to the user as "key saved"
- file: `src/components/workspace/nodes/base/abi-node-shell.tsx:229`
- severity: high
- nguồn: bugs

`saveAndVerifyKey` now returns `{ writeFailed }` for every non-409 PUT failure (network drop, HTTP 500 from `saveEnvStore` throwing, etc.), and `useNodeKeyGate.save` maps that to `setState({ phase: "saved-unverified", ... })`.

`node-key-prompt.tsx` renders `saved-unverified` as a green ✓ plus `labels.savedUnverified` — in production that literal is "Đã lưu khoá — chưa kiểm tra được" ("Key saved — could not verify"). So on a write that demonstrably never landed, the user is told the key WAS stored and only the verification was skipped. They close the prompt, re-run the node, and it fails again for the same missing key with no indication the save was the problem.

The commit comment explains why the old `throw` → `phase: "invalid"` was wrong (it blames the key), but the replacement over-corrects into an affirmative false success. `saved-unverified` is only truthful for the one sub-case where the PUT returned 2xx and the body was unparseable (`put()`'s `not-json` branch); the `http`/`network` sub-cases need their own "not saved" state. Nothing in the new test suite covers the write-failure path (`store-unreadable-refusal.test.tsx` drives only read failures), which is why this shipped.

<a id="ngoai-8"></a>
### A successful write whose response body will not parse is reported as "nothing has been changed"
- file: `src/lib/settings/env-client.ts:214`
- severity: medium
- nguồn: bugs

In `put()`, the `response.json()` parse is attempted only after `response.ok` is true — i.e. the server already committed the write via `saveEnvStore(env)`. If the body cannot be parsed (a proxy rewriting a 200, a truncated response), `put()` returns `{ ok: false, reason: "write-failed", detail: { code: "not-json" } }`.

The settings dialog then toasts `Settings.storeUnreadable.writeFailed`, whose copy in all five locales is "Could not save ({reason}). Nothing has been changed." — a factual claim that is false: the keys were written. A user who trusts it will retype or re-enter keys against a store that already changed, and the whole point of this feature is that misleading copy after a partial failure is what drives key loss.

`ok`-but-unparseable is a distinct outcome from a failed write and needs its own arm (write landed, verdicts unknown), the same way `409` already gets its own arm above it.

<a id="ngoai-9"></a>
### `pluginEnv` is cast unchecked and `fetchEnv` lost its catch — a throw re-opens the empty-saveable-form bug
- file: `src/lib/settings/env-client.ts:110`
- severity: medium
- nguồn: bugs

`readEnvForBrowser` validates `env` with a deliberate positive assertion (object, not array) but takes `pluginEnv` on an unchecked cast: `(body as { pluginEnv?: PluginEnvDecl[] })?.pluginEnv ?? []`. Any non-array truthy value passes through as `EnvClientRead.pluginEnv`.

At the same time `settings-dialog.tsx` `fetchEnv` dropped its `catch` (only `try { ... } finally { setLoading(false) }` remains). The call order inside the try is `setBlocked(null)` → `setReplaceError(null)` → `applyEnv(read.env, read.pluginEnv)`, and `applyEnv` immediately does `nextDecls.flatMap(...)`. A non-array `pluginEnv` throws there, after `blocked` has already been cleared: the rejection is unhandled, `finally` clears `loading`, and the dialog renders the normal form with stale/empty values and an ENABLED Save button — the precise failure mode ("empty form with a working Save, and the next save wrote that emptiness over every stored key") this whole change set exists to eliminate.

Same class of defect as the one the module's own comment calls out for `env`; the fix is to validate `pluginEnv` as an array in the reader (falling back to `[]`), and/or restore a catch in `fetchEnv` that sets `blocked`.

<a id="ngoai-10"></a>
### Hình dạng #5 — E12 tuyên quét LỚP "copy đến từ catalogue" nhưng chỉ có 2 điểm-case trên 22 khoá mới
- file: `src/components/workspace/settings-i18n-render.test.tsx:27`
- severity: medium
- nguồn: measurement

`const KEYS = ["title", "unchanged"]` (dòng 27) là toàn bộ ma trận của ô đo tự mô tả là "the wire between the message catalogue and the screen". Gói việc này thêm 22 khoá hiển thị mới (`Settings.storeUnreadable.*` 11 khoá + `Workspace.storeUnreadable.*` 11 khoá, đếm trên en.json), trong đó `escape`, `confirmTitle`, `confirmBody`, `confirmCancel`, `confirmOk`, `replaceFailed`, `writeFailed`, `cause.*` KHÔNG có ca nào. Chính lập luận mở đầu tệp — "E8 chỉ đọc JSON, E2/E4/E6 chỉ assert literal tiếng Việt, nên một nhãn ghi cứng tiếng Việt làm cả hai xanh" — áp nguyên vẹn cho 20 khoá còn lại: `settings-dialog.replace.test.tsx` tìm nút xác nhận bằng `SU.confirmOk` lấy từ vi.json, nên copy huỷ-diệt ghi cứng tiếng Việt vẫn xanh mọi ô. Nặng hơn ở namespace `Workspace.storeUnreadable`: hai bề mặt node chỉ được dựng trong E6/E7 với props nhãn do chính test viết tay (`store-unreadable-refusal.test.tsx:48-75`), nên dây nối call-site → `useTranslations` của `abi-node-shell`/`add-media-library-node` không có phép đo nào chạm tới.
