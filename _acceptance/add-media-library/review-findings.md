## Trong hợp đồng

- **SSRF host guard bypassed by a trailing-dot FQDN (`localhost.`)**
  file: `src/lib/media-library/url-safety.ts`:63
  severity: medium
  AC: AC-10
  The module's header comment claims to be "one auditable place with one exhaustive table" for literal hosts, and the whole point of the guard is that the signed URL (and every redirect hop) comes from an outside service. `isPrivateHost` tests `lower === "localhost" || lower.endsWith(".localhost")`. A trailing-dot absolute FQDN survives WHATWG normalisation unchanged — verified with Node: `new URL("https://localhost./x").hostname === "localhost."` — so it matches neither branch, is not dotted-quad so `isPrivateIpv4` misses it, and has no brackets so `isPrivateIpv6` returns false. `checkFetchTarget` then returns `{ok:true}` and `fetchGuarded` (import.server.ts:96) connects to loopback. Note the IPv4 path does not have this hole (`https://127.0.0.1./x` normalises the dot away), which is why the gap is easy to miss. The documented "known limit" in the same header is about DNS-resolving public names, not about literal loopback spellings, so this is inside what the guard promises to cover.
  rationale: AC-10 requires the guard to reject non-https/internal-host download targets and name the reason; a literal loopback spelling slipping past the guard is exactly the rejection AC-10 promises, and the contract's documented known limit covers only DNS-resolved public names, not literal spellings.
  source: conventions

- **Transport-vs-shape classification omits TypeError — a dropped connection mid-body still reports BAD_RESPONSE**
  file: `src/lib/media-library/client.server.ts`:81
  severity: medium
  AC: AC-6
  The block comment at lines 63-73 states the rule explicitly: "An AbortError or a TypeError means the connection died or the timeout fired AFTER the headers arrived... Reporting the second as BAD_RESPONSE sends the user to check a contract version when the truth was a dropped connection."

The code implements only half of it:

    parseFailure = name === "AbortError" || name === "TimeoutError" ? "transport" : "shape";

TypeError is not in the list. undici rejects `response.json()` with `TypeError: terminated` (cause ECONNRESET / UND_ERR_SOCKET) when the socket dies after headers arrive — i.e. the precise case the comment names. That lands in the `"shape"` arm and surfaces as BAD_RESPONSE ("The library answered in a shape this version does not accept"), sending the user to check the contract version for what was a network fault.

Nothing covers it: client.server.test.ts has no test for a truncated/terminated body — only the malformed-200 case at line 327. The `transport` arm is only reachable via the timeout, never via a connection drop.
  rationale: A connection dropped mid-body is exactly AC-6's "đứt mạng" case among the eight named failure modes; misclassifying it as BAD_RESPONSE means that case is not named correctly, failing AC-6's per-case distinguishability requirement.
  source: bugs


## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **a11y guard runs `git checkout -- tsconfig.json`, discarding unrelated uncommitted edits**
  Người dùng thấy gì: Khi chạy công cụ kiểm tra khả năng tiếp cận cho tính năng này, mọi thay đổi chưa lưu của người phát triển trong tệp cấu hình dự án có thể bị xóa mất mà không có cảnh báo trước.
  file: `scripts/media-library/check-a11y-proto.sh`:25
  severity: medium
  `restore_tsconfig() { git -C "$ROOT" checkout -- tsconfig.json 2>/dev/null || true; }` is installed as an EXIT trap, so every exit path — success, failure, or Ctrl-C — hard-reverts tsconfig.json to HEAD. It does not snapshot the file first, so it destroys any pre-existing uncommitted change to tsconfig.json that the script did not cause; a developer who edits tsconfig.json and then runs this guard loses that edit with no warning and no message. `grep -rn "git .*checkout --\|git restore" scripts/ .githooks/` returns this line and nothing else — no other script in the repo mutates or reverts a tracked file. The stated cause (Next rewriting `include` when `NEXT_DIST_DIR` is set) is real, but the scoped fix is to capture the file's contents before the run and write those bytes back, not to resolve to whatever HEAD happens to contain.
  rationale: No AC governs the a11y check script's own side effects on unrelated files; AC-15 is about the node's states meeting axe-core, not about this tooling's git behaviour.
  Đề xuất: known-limits
  source: conventions

- **Three distinct URL refusals collapse into `BAD_RESPONSE`, forcing prose-matching assertions**
  Người dùng thấy gì: Khi việc tải bị từ chối vì lý do an toàn địa chỉ, người dùng có thể thấy dòng thông báo nói rằng phản hồi từ kho sai định dạng, thay vì lý do thật là địa chỉ đích bị chặn.
  file: `src/lib/media-library/import.server.ts`:69
  severity: medium
  `guardUrl` maps all three `UrlVerdict` reasons — `malformed`, `scheme`, `private-host` — onto the single code `BAD_RESPONSE`, distinguishing them only by Vietnamese prose in the `REFUSAL` table (lines 56-60). Two consequences, both already visible in the tree. (a) The taxonomy's own rule is broken: src/lib/media-library/errors.ts:4-7 states classification reads status plus the `error` field "never the prose ... a regex over the message is a bug waiting for a copy edit" — yet the only way to assert which guard fired is exactly that, and the tests do it: src/app/api/media-library/route.test.ts:87 `expect(String(body.message)).toContain("nội bộ")` and src/lib/media-library/import.server.test.ts:133 and :230 `toMatch(/nội bọ|nội bộ/i)`. A copy edit to `REFUSAL["private-host"]` turns the SSRF regression tests red for a non-defect, and — worse — a reworded message that still contains the matched fragment keeps them green while the guard is gone. (b) The user sees the wrong sentence: `BAD_RESPONSE` renders as "The library answered in a shape this version does not accept" (en.json), which is not what a refused private-host or non-https redirect means. A dedicated code (e.g. `REFUSED_TARGET`) would give the tests something machine-readable and the UI a truthful line.
  rationale: AC-10 only requires the download refusal to name the reason to the user, which distinct prose already does; AC-6's HTTP-code/no-prose classification rule is scoped to the eight named upstream-service failures, not to OneFlow's own local URL/scheme/host guard refusals.
  Đề xuất: known-limits
  source: conventions

- **Server-side error strings are Vietnamese-only, diverging from every other API route**
  Người dùng thấy gì: Các thông điệp lỗi kỹ thuật ghi trong nhật ký hệ thống của tính năng này chỉ bằng tiếng Việt, khác với phần còn lại của sản phẩm, gây khó khăn cho đội vận hành khi tra cứu sự cố.
  file: `src/lib/media-library/errors.ts`:62
  severity: low
  Every user-facing/API string produced by the new domain is hardcoded Vietnamese: errors.ts:62-94, config.server.ts:35, client.server.ts:56/108/115/151, version.ts:23, import.server.ts:57-59/106/121/132/151/201, and both route handlers (search/route.ts:39/47/61, import/route.ts:40/50/64). The rest of the codebase writes server-side messages in English — `grep -rho "{ error:" src/app/api --include=route.ts` finds 68 sites, all English (e.g. src/app/api/settings/env/route.ts "Invalid JSON body", src/app/api/task/create/route.ts "Feature parameter is required"), against 10 `code: "..."` sites which are all in these two new files. The same diff also adds a Vietnamese comment to .env.example:43 (`# "nạp từ kho" node ...`), where every other comment is English, against CLAUDE.md's "Comments in code: English only". Since the design already decided the UI reads the `code` and not the `message`, these strings are effectively log/debug text and should follow the repo's English convention.
  rationale: No AC specifies the language of server-side/log strings; the contract's criteria concern what the user-facing state shows, not the internal code/comment language convention.
  Đề xuất: known-limits
  source: conventions

- **Route boundary coerces instead of validating request fields**
  Người dùng thấy gì: Nếu một lời gọi gửi dữ liệu tìm kiếm sai định dạng tới tính năng này, hệ thống vẫn âm thầm chuyển nó thành một chuỗi tìm kiếm vô nghĩa và gửi ra kho ngoài, thay vì báo lỗi ngay.
  file: `src/app/api/media-library/search/route.ts`:44
  severity: low
  `const intent = String((body as { intent?: unknown })?.intent ?? "").trim();` accepts any JSON type and coerces it: `{"intent": {"a":1}}` becomes the literal string `"[object Object]"` and is forwarded to the upstream service as a paid search; `{"intent": [1,2]}` becomes `"1,2"`. There is also no upper length bound, so an arbitrarily large string is relayed upstream. The import route has the same shape at import/route.ts:45 (`String(body.assetId)` — path traversal is not reachable there because `getAsset` runs `encodeURIComponent`, but a non-string still produces a nonsense upstream lookup). The adjacent PUT /api/settings/env handler shows the house pattern for this boundary: it type-checks the field and rejects with 400 rather than coercing (`if (!raw || typeof raw !== "object" || Array.isArray(raw))`). A `typeof x !== "string"` check plus a max length would match it.
  rationale: No AC requires strict type validation of the inbound API request body; AC-3 concerns the shape of the outbound request to media-library, not validation of what OneFlow's own route accepts from its caller.
  Đề xuất: known-limits
  source: conventions

- **Env key names duplicated as client-side literals instead of shared constants**
  Người dùng thấy gì: Đây là rủi ro bảo trì nội bộ: nếu tên biến cấu hình bị đổi ở một chỗ mà quên đổi ở chỗ khác, màn hình nhập khóa có thể ngưng nhận diện đúng giá trị đã lưu mà không có cảnh báo rõ ràng.
  file: `src/components/workspace/nodes/add/media-library-config-panel.tsx`:66
  severity: low
  The panel writes `next.MEDIA_LIBRARY_URL` / `next.MEDIA_LIBRARY_API_KEY` (lines 66-67) and matches on the same bare literals at lines 94 and 111, while src/lib/media-library/config.server.ts:11-12 already exports `URL_KEY` and `API_KEY` as the canonical names. The duplication exists because config.server.ts carries `import "server-only"` and cannot be imported from a client component — but the two name constants are pure data with no server dependency and belong in a shared module (alongside version.ts / types.ts, which the client already imports). As written, renaming a variable requires touching four literals in a component plus the server constant, with nothing to fail if one is missed.
  rationale: This is a code-duplication/maintainability concern with no corresponding acceptance criterion; the panel's actual behaviour (accepting and saving the two keys) is what AC-1 tests, not the internal constant sourcing.
  Đề xuất: known-limits
  source: conventions

- **Import success path parses the response unchecked — a missing fileKey silently creates a broken video node**
  Người dùng thấy gì: Nếu phản hồi khi nạp tài sản thiếu dữ liệu cần thiết, một node video mới vẫn xuất hiện trên canvas nhưng không phát được, và người dùng không nhận được bất kỳ thông báo lỗi nào giải thích lý do.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`:176
  severity: high
  In `pick()` the 2xx branch does `const body = await response.json();` then `expands(id, [{ type: "videoNode", data: { fileKeys: [String(body.fileKey)] } }])`.

Two distinct defects, both of the class this file's own header comment says was closed on the search path:

1. Unchecked shape. `String(undefined)` is the literal string `"undefined"`. If the 200 body ever lacks `fileKey` (NextResponse.json drops undefined keys; a proxy or dev-server can also interpose a different 200 body), the node is created pointing at fileKey `"undefined"`, `/api/uploads/undefined` 404s, and the user is shown NO error at all — outcome is set to `idle`. That is a silent failure that looks like success.

2. Unchecked parse. `response.json()` sits inside the outer `try` whose only `catch` sets `{code: "NETWORK_ERROR"}` → "Could not reach the library." A 200 whose body will not parse (HTML error page from anything in front of the route) is therefore reported as a network problem with the remote service — the exact mis-attribution `readResults()` was written to fix for `/search`, left uncorrected for `/import`.

The search path already has the right shape (`readResults` returns BAD_RESPONSE when `record.cards` is not an array). The import path has no equivalent. There is also no test exercising `pick()` — add-media-library-node.test.tsx only covers the pure helpers and MediaCardList, so nothing measures this.
  rationale: AC-9/AC-12 describe the happy-path outcome (a working file_key, a correctly-expanded video node); a malformed 200 response with a missing field is not one of AC-6's eight named failure codes, so this robustness gap has no AC to fail against.
  Đề xuất: known-limits
  source: bugs

- **MISSING_CONFIG on the import path never reaches the config panel and degrades to the generic error line**
  Người dùng thấy gì: Nếu cấu hình bị thiếu đúng vào lúc người dùng bấm nạp một thẻ (khác với lúc bấm tìm), màn hình chỉ hiện một lỗi chung chung, không dẫn người dùng đến nơi nhập hai khóa còn thiếu.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`:167
  severity: medium
  `search()` branches on `failure.code === "MISSING_CONFIG"` and renders `<MediaLibraryConfigPanel>`. `pick()` does not — it unconditionally sets `{kind: "failure", code: failure.code}`.

`importAsset` → `getAsset` → `call()` → `resolveConfig()` can return MISSING_CONFIG (400), so the code is reachable on this path. When it arrives, `failureMessageKey("MISSING_CONFIG")` deliberately excludes it from FAILURE_KEYS (media-library-outcome.ts:103-105 — "MISSING_CONFIG is the one code excluded: it has its own outcome kind and its own panel"), so it falls back to the generic `"error"` sentence — "The library call did not go through."

Net effect: the one code that has a designed remediation path is the one the import branch renders as an unactionable generic error, with no field to type the missing variable into. The `missing[]` array the server went out of its way to send as data is dropped on the floor.
  rationale: AC-1's Given/When is explicitly scoped to the search action ("bấm tìm"); it does not state the same guarantee for the import/pick action, so extending it there would be inferring a near-match AC rather than a literal one.
  Đề xuất: known-limits
  source: bugs

- **Malformed Location header on a redirect throws out of importAsset and is reported as a local machine failure**
  Người dùng thấy gì: Khi kho bên ngoài gửi một đường dẫn chuyển hướng bị hỏng trong lúc nạp, OneFlow báo đây là lỗi trên chính máy của người dùng và bảo họ tự kiểm tra nhật ký ứng dụng, dù nguyên nhân thật sự nằm ở phía kho.
  file: `src/lib/media-library/import.server.ts`:125
  severity: medium
  `current = new URL(location, current).toString();` in `fetchGuarded` is outside any try/catch. `URL` throws TypeError on a malformed `Location` value, and neither `fetchGuarded` nor `importAsset` catches it, so it escapes to the route handler's catch (src/app/api/media-library/import/route.ts:58), which answers `{code: "LOCAL_FAILURE"}` / 500 — "OneFlow could not finish this on your own machine — check the app's log for the real cause."

That is a misclassification in the direction the taxonomy was explicitly built to prevent: LOCAL_FAILURE is documented in errors.ts:23-26 as "OneFlow's own side failing — the file store, most likely," and the whole point of separating it from the upstream codes was to stop sending users to check the wrong thing. Here the fault is entirely upstream (the library, or something redirecting on its behalf, sent a bad header), and the user is pointed at their own disk.

Every other malformed-URL case in this module already routes through `guardUrl` → BAD_RESPONSE ("URL ký của media-library không hợp lệ"); this one hop is the exception. Wrapping the URL construction and returning that same BAD_RESPONSE would make it consistent.

Secondary, same function: redirect responses' bodies are never read or cancelled before the next hop, so up to 5 response bodies per import are left for the GC to reclaim.
  rationale: A crash while parsing a redirect's Location header is not one of AC-6's eight enumerated HTTP-code/non-JSON/network-drop cases, and no other AC governs error-code attribution for this specific failure path.
  Đề xuất: known-limits
  source: bugs

- **Non-numeric candidates count renders as NaN in the thin-shelf message**
  Người dùng thấy gì: Trong một số trường hợp hiếm, thông báo 'kệ mỏng' có thể hiện chữ 'NaN' thay vì một con số cụ thể, khiến thông điệp trông giống lỗi phần mềm dù tính năng vẫn hoạt động đúng.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`:75
  severity: low
  `readResults` does `candidates: Number(record.candidates ?? 0)`. `warnings` and `cards` on the adjacent lines are both shape-checked (`Array.isArray`), but `candidates` is not: any non-numeric value produces NaN rather than falling back to 0.

That value flows straight into the user-visible copy at line 289: `t("thinShelf", { candidates: ... })` → "No clip could be shown for this description (NaN clips passed the filters)." `Number.isFinite(...) ? ... : 0` is the one-line fix and matches the defensive posture the two neighbouring fields already take.
  rationale: AC-4 only requires the thin-shelf message to read as distinct language from an error message, which it still does even with a malformed count; formatting robustness of the number itself is not stated in the AC.
  Đề xuất: known-limits
  source: bugs

- **Đo CHỈ DẪN thay vì ĐẦU RA — proto in hằng chuỗi viết cứng, nên E2/E29/E9/E11/E16 không thể đỏ vì copy thật**
  Người dùng thấy gì: Các phép kiểm tra hình ảnh tự động của tính năng này đang so khớp với chuỗi chữ viết tay trong tệp minh họa, không phải nội dung thật do node tạo ra — nên nếu bản dịch của các thông điệp quan trọng (kệ mỏng, không xếp hạng) bị mất hoặc sai ở bất kỳ ngôn ngữ nào, người dùng sẽ thấy mã khóa thô trên giao diện mà không phép kiểm tự động nào phát hiện được.
  file: `src/components/proto/add-media-library-proto.tsx`:161
  severity: high
  Năm ui-check (E2, E29, E11-step2, E9-step1, E16-step2) chụp `/proto/add-media-library?state=...`, nhưng khung missing-config truyền `message={COPY.missingConfig}` (dòng 161), khung thin-shelf in `{COPY.thinShelf}` (192), khung unranked in `{COPY.unranked}` (201), khung imported in `{COPY.imported}` (251) — tất cả là hằng viết tay trong chính file proto (khối COPY dòng 27-47). Node thật đi đường KHÁC: `add-media-library-node.tsx` truyền `message={outcome.message}` do route trả về cho panel, và in `t("thinShelf", {candidates})` (dòng 287-294), `t("unranked")` (dòng 259). Hệ quả đo lường: lời hứa của E2 ("một thông điệp không chứa tên biến là FAIL") được thoả bởi chuỗi gõ tay trong harness, không bởi đầu ra của resolveConfig/route; và nếu khoá `unranked`/`thinShelf` biến mất hoặc dịch sai ở bất kỳ locale nào, node thật hiện raw key mà toàn bộ ui-check vẫn xanh — không eval nào render banner unranked của node (chỉ có test đơn vị gọi `isUnranked()`, và bộ kiểm locale trong add-media-library-node.test.tsx chỉ phủ nhánh `failure.*` + `LOCALES.en.thinShelf`). Chính file này đã ghi nhận đúng lỗi đó và chỉ sửa cho hai khung failure (chuyển sang `failureMessageKey(code)` + `t()`, dòng 141-151), để nguyên bốn khung còn lại.
  rationale: This is a gap in evaluation-harness fidelity (whether the evidence actually exercises the real code path), analogous to the fixture/fake-server gap already documented in the contract's Known limits — not itself a failure of any stated AC.
  Đề xuất: known-limits
  source: measurement

- **Tuyên quét LỚP nhưng chỉ có điểm-case — E28 chỉ soi MỘT fixture và chỉ MỘT chiều lệch**
  Người dùng thấy gì: Bộ kiểm tra xuất xứ dữ liệu mẫu chỉ soát một trong nhiều tệp dữ liệu giả lập và chỉ soát chiều 'thừa trường', nên một tệp dữ liệu mẫu thiếu hẳn nhiều trường quan trọng vẫn được xem là hợp lệ — làm giảm độ tin cậy của bằng chứng kiểm thử, dù không tác động trực tiếp ngay tới người dùng cuối.
  file: `src/lib/media-library/__fixtures__/provenance.test.ts`:22
  severity: medium
  E28 hứa "mỗi file fixture của máy chủ giả mang tiêu đề xuất xứ" và "tập TÊN TRƯỜNG của mỗi fixture khớp ĐÚNG bảng trường — thừa một trường hoặc thiếu một trường đều đỏ". Thực đo: (a) `check-fixture-provenance.sh:19-25` chỉ grep header trên đúng một file `__fixtures__/cards.ts`; `__fixtures__/stub-server.ts` — file dựng hình dạng response mà mọi test client/import đi qua — không có PROVENANCE/READ-ON và không bị kiểm; (b) `provenance.test.ts:22` chỉ chạy `unknownFields(VIDEO_CARD)` — một hằng duy nhất, trong khi CARD_WITH_LICENSE / CARD_UNKNOWN_VOCAB / CARD_NULL_ENTITY không được soi; (c) `unknownFields` chỉ lọc trường THỪA (`Object.keys(card).filter(...)`), nên chiều "thiếu một trường" không có assert nào — và đó không phải giả thuyết: VIDEO_CARD (cards.ts:40-54) chỉ có 9/22 tên trong CARD_FIELDS, tức trạng thái "thiếu 13 trường" đang xanh. Bài kiểm RĂNG ở dòng 31-37 cũng chỉ chứng minh chiều thừa.
  rationale: This narrows the scope of an already-acknowledged evidence limitation (the contract's Known limits already flags that E28-style fixture checks cannot substitute for real library validation); it is a test-coverage gap, not a failure of a stated AC.
  Đề xuất: known-limits
  source: measurement

- **Ca quyết định bị thay bằng ca khác — nửa đàn áp của E18 assert 'txt' thay vì '.svg'**
  Người dùng thấy gì: Phép kiểm tra an toàn cho việc chặn phục vụ tệp nguy hiểm (như .svg có thể chứa nội dung chạy được) hiện chỉ thực sự kiểm tra một loại tệp vô hại khác, nên nếu lỗ hổng an toàn thật sự tồn tại ở bước phục vụ file, phép kiểm hiện tại sẽ không phát hiện ra.
  file: `src/lib/media-library/extension-serving.server.test.ts`:86
  severity: medium
  E18 khai nửa đàn áp là "một đuôi mà thang từ chối (.svg) không được phục vụ như video", và lý do allow-list tồn tại (comment dòng 43-47 của extension.test.ts, dòng 76-83 của file này) là `.svg` sẽ được phục vụ same-origin như nội dung ĐỘNG. Nhưng assert duy nhất đi qua route là `expect(await servedContentType("txt")).toBe("text/plain")` — đuôi `txt`, không phải `svg`. Bảng MIME của route (`src/app/api/uploads/[...path]/route.ts:15`) ánh xạ `.svg -> image/svg+xml`, nên nếu một key `.svg` từng lọt vào kho thì route VẪN phục vụ active content, và không assert nào trong file thấy điều đó. Ca `.svg` chỉ được đo ở tầng `extensionFor` (dòng 84), tức đúng mắt xích đầu — chính mắt xích mà file này được viết ra để bổ sung mắt xích thứ hai.
  rationale: No AC states a requirement about blocking active-content extensions like .svg from being served; AC-11 is about inferring the correct extension for playback, not about a denylist of dangerous extensions, so this test gap has no AC to fail.
  Đề xuất: known-limits
  source: measurement

- **Guard tuyên 'đồ thị import THẬT' nhưng chỉ thấy khai báo import tĩnh**
  Người dùng thấy gì: Công cụ kiểm tra ranh giới giữa các phần của hệ thống chỉ nhận diện cách nhập mã cố định, bỏ sót cách nhập động — nên nếu có mã vi phạm ranh giới kiến trúc bằng cách nhập động, công cụ bảo vệ này sẽ không cảnh báo.
  file: `scripts/media-library/import-graph.mjs`:72
  severity: medium
  `importsOf()` duyệt `source.statements` và bỏ mọi thứ không phải `ts.isImportDeclaration` (dòng 70-73), nên `await import(...)` và `require(...)` vô hình. Hai guard đứng trên nó khai rộng hơn thế: E27 nói "phân giải định danh THẬT... tìm call site của tên CỤC BỘ mà import đó gắn" với giới hạn duy nhất được khai là "lời gọi qua giá trị truyền lòng vòng lúc chạy"; E3 nói "quét đồ thị import THẬT... khẳng định module src/lib/media-library/** CHỈ được nhập bởi các file đã khai". Cụ thể: `no-dormant-fetch.mjs:46` bỏ qua NGAY cả file nếu không tìm thấy import tĩnh khớp đường dẫn, nên `const { downloadAndSave } = await import("@/lib/file/file-utils"); downloadAndSave(u)` không bao giờ được đếm — chính cách viết mà bản `grep "downloadAndSave("` cũ VẪN bắt được, tức đây là bước lùi so với thứ nó thay thế; tương tự `no-boot-dependency.mjs` không thấy một layout/instrumentation `await import("@/lib/media-library/client.server")`. Dynamic import không phải giả định trong repo này: `src/app/api/media-library/route.test.ts:79` dùng đúng cách viết đó.
  rationale: No AC in the contract requires a module-boundary import-graph guard of any particular fidelity; this is an evidence/tooling gap about how architecture claims are checked, not a failure of a stated acceptance criterion.
  Đề xuất: known-limits
  source: measurement

- **Assert tự soi bảng của chính test — 'produces eight distinct codes' không chạm implementation**
  Người dùng thấy gì: Một trong các phép kiểm tra tự động chỉ đang tự so sánh với chính bảng dữ liệu của nó, không thực sự chạy qua tính năng thật — nên phép kiểm này không có khả năng phát hiện lỗi thật nếu logic phân loại lỗi từng bị gộp sai.
  file: `src/lib/media-library/client.server.test.ts`:192
  severity: low
  `it("produces eight distinct codes across the matrix")` (dòng 192-196) tính `new Set(cases.map((c) => c.code))` trên chính mảng literal khai ở dòng 78-144 rồi assert `size === 8`. Không có lời gọi `searchVideos`, không có stub — một mapper gộp hết về UPSTREAM_ERROR vẫn để test này xanh; nó chỉ đỏ khi ai đó sửa bảng ca của chính test. Cùng hình dạng ở `src/lib/media-library/url-safety.test.ts:68-71` (`expect(PRIVATE.length).toBeGreaterThanOrEqual(21)`). Vô hại vì từng ca đã assert mã cụ thể, nhưng dòng bằng chứng "số assert = số ca" của E10 không nên tính assert này vào.
  rationale: This is a test-quality observation about evidence counting (the finding itself calls it harmless), not a failure of any stated AC; the actual per-case classification behaviour is covered by other assertions.
  Đề xuất: known-limits
  source: measurement

- **Assertion âm-tính không được neo — chip giấy phép kiểm bằng testid mà không ca dương nào ghim testid đó**
  Người dùng thấy gì: Phép kiểm tra xác nhận nhãn giấy phép hiển thị đúng dùng một mã định danh kỹ thuật không được gắn với trường hợp hiển thị thành công, nên nếu mã định danh đó vô tình bị xóa khỏi giao diện, phép kiểm vẫn báo đạt dù nhãn giấy phép không còn cách nào xác minh được bằng máy.
  file: `src/components/workspace/nodes/add/add-media-library-node.test.tsx`:61
  severity: low
  Nửa đàn áp của E14 là `expect(screen.queryByTestId("licence-chip")).toBeNull()` (dòng 59-62), trong khi ca dương ở dòng 50-53 lại tìm bằng NỘI DUNG (`queryByText("Phối cảnh 3D")`). Hai locator khác nhau nên không có assert nào ghim rằng chip mang `data-testid="licence-chip"`: xoá thuộc tính đó khỏi `media-card-list.tsx:55` làm assert âm trở thành hằng đúng (queryByTestId luôn null) mà bộ test vẫn xanh. Neo ca dương vào cùng testid — hoặc dùng cùng locator cho cả hai vế — mới làm vế âm có răng.
  rationale: AC-8 requires the license label to display, which the positive-case test already verifies by content; this finding is about the negative-case test's locator not being anchored, a test-robustness gap rather than a failure of AC-8 itself.
  Đề xuất: known-limits
  source: measurement


⚠ Cụm ngoài vùng phủ: 2/17 lỗi rơi vào file không bộ đo nào phủ (scripts/media-library/check-a11y-proto.sh, scripts/media-library/import-graph.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
