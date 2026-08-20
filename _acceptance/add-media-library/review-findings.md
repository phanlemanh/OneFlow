## Trong hợp đồng

- **extensionFor() resolves Object.prototype members from the mime table, producing a non-string extension**
  file: `src/lib/media-library/extension.ts`:46
  severity: medium
  AC: AC-11
  Rung 2 does `if (MIME_TO_EXT[mime]) return MIME_TO_EXT[mime];` on a plain object literal, so the lookup walks the prototype chain with a value taken straight from the upstream `content-type` header. Verified in node:
  content-type: constructor  -> returns the `Object` function
  content-type: __proto__    -> returns `Object.prototype`
(`toString`/`valueOf`/`hasOwnProperty` are non-enumerable-but-present functions that also return truthy in other engines/shapes; `constructor` and `__proto__` are truthy today.)

The value is typed `string` but is not one. It flows to `saveFile(read.buffer, ext)` (import.server.ts:212) and into `${nanoid()}.${ext}` in the default storage driver, producing a persisted file named e.g. `aH8xK2m9qP.function Object() { [native code] }` — a real file whose fileKey then goes into `/api/uploads/<key>` unencoded, so the clip is unplayable and the URL is broken.

This is also the one rung of the three that is not allow-listed: rung 1 gates on `ALLOWED_EXT`, rung 3 is a constant. Use `Object.hasOwn(MIME_TO_EXT, mime)`, a `Map`, or `Object.create(null)`.
  rationale: AC-11 đòi đuôi file suy ra phải đúng để file_key phát được trên canvas; lỗi tra bảng khiến bậc suy đuôi trả về một giá trị không phải chuỗi đuôi hợp lệ, làm AC-11 thất bại.
  source: bugs

- **Search success path trusts the body: parse failure is mislabeled, missing `cards` crashes the render**
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`:95
  severity: low
  AC: AC-6
  Two problems on the 2xx branch of `search()`, both the trust gap that `readFailure()` was written to close on the failure branch:

1. `const body = await response.json()` (line 95) sits inside the outer try whose catch (line 102) sets `{code: "NETWORK_ERROR"}` -> "Could not reach the library." A 200 whose body will not parse (dev-server / proxy interposition) is therefore reported as a remote-network problem — the same conflation the comment at lines 31-38 says was removed.

2. `cards: body.cards as MediaCard[]` is an unchecked cast. `src/app/api/media-library/search/route.ts:72-73` forwards `result.data.cards` verbatim, and `NextResponse.json` drops `undefined` keys, so an upstream 200 that carries a valid `contracts_version` but no `cards` array yields `outcome.cards === undefined`. Line 226 then evaluates `outcome.cards.length > 0` during render and throws `TypeError: Cannot read properties of undefined`, taking the node (and, absent an error boundary, the canvas) down instead of surfacing BAD_RESPONSE. The version guard in `client.server.ts` exists precisely to avoid reading a body of unknown shape; the shape is then read anyway.
  rationale: Một trong tám ca AC-6 là 'thân trả về không phải JSON'; ca này bị gán nhầm thành NETWORK_ERROR thay vì gọi đúng tên nguyên nhân, vi phạm trực tiếp yêu cầu phân loại của AC-6.
  source: bugs

- **Hình dạng 4 — assertion âm tính không ghim đúng thông điệp: ca SSRF ở route thật ra chỉ chạm nhánh scheme**
  file: `src/app/api/media-library/route.test.ts`:73
  severity: high
  AC: AC-10
  Test `refuses a link-local signed URL and creates no file` (dòng 60-75) nạp `assetDetail("http://169.254.169.254/latest/meta-data/")` — URL vừa sai scheme vừa là host link-local. `checkFetchTarget` (url-safety.ts:95-100) kiểm scheme TRƯỚC host, nên với `http://` nó trả `reason: "scheme"` và `guardUrl` (import.server.ts:56-60) sinh câu "...không dùng https (http://)". Assertion duy nhất ghim thông điệp là `expect(String(body.message)).toMatch(/https|nội bộ/i)` — alternation này xanh nhờ chữ "https", nên nhánh `private-host` KHÔNG BAO GIỜ chạy trong file này. Ca thứ ba (`refuses a plain http signed URL`, dòng 100-113) cũng chỉ chạm nhánh scheme và không ghim thông điệp gì cả. Kết quả: cả hai ca từ chối ở call-site đều chứng minh cùng một guard; nếu xoá hẳn nhánh `isPrivateHost` khỏi `checkFetchTarget`, route.test.ts vẫn xanh toàn bộ — trong khi đây đúng là eval (E26) được sinh ra để chứng minh route không đi vòng qua guard host. Bản https + link-local có tồn tại nhưng ở tầng hàm (import.server.test.ts:126-135), tức là tầng mà E26 nói rõ là không đủ.
  rationale: AC-10 minh thị đòi bằng chứng đo qua chính route (không qua gọi hàm trực tiếp) cho cả ca scheme lẫn ca host nội bộ; finding cho thấy nhánh host chỉ được chứng minh ở tầng hàm, đúng loại lỗ AC-10 nêu tên là không bịt được.
  source: measurement

- **Hình dạng 1 — đo CHỈ DẪN (khoá i18n) thay vì ĐẦU RA (câu hiển thị)**
  file: `src/components/workspace/nodes/add/add-media-library-node.test.tsx`:109
  severity: medium
  AC: AC-6
  Lời hứa của AC-6/E7 là quan hệ giữa các CÂU trên màn hình ("mỗi mã lỗi có câu riêng", "kệ mỏng khác câu lỗi"). Phép đo lại dừng ở chuỗi khoá: `keys = failureCodes.map(failureMessageKey)` rồi `expect(new Set(keys).size).toBe(failureCodes.length)` (dòng 103-114) chỉ chứng minh 10 chuỗi `"failure.<CODE>"` khác nhau — không file message nào được nạp. Tương tự dòng 62-77 so `outcomeMessageKey(...)` trả "thinShelf" vs khác "thinShelf", tức so định danh chứ không so hai câu (E7 `expected` viết "so hai chuỗi"). Node thật render `t(failureMessageKey(outcome.code))` (add-media-library-node.tsx:268) và không test nào trong diff render `AddMediaLibraryNode` — nên nếu một `failure.<CODE>` vắng trong en/ja/ko/vi/zh.json, hoặc hai mã trỏ về cùng một câu dịch, toàn bộ assertion vẫn xanh còn màn hình hiện khoá thô. Repo đã có sẵn khuôn ngược lại (compose-overlay.test.tsx:35 nạp `@/i18n/messages/en.json` vào `NextIntlClientProvider`), diff này không dùng, và không có guard parity khoá i18n nào trong cửa sổ diff.
  rationale: AC-6 đòi các thông điệp trên màn hình phân biệt được và gọi đúng tên nguyên nhân; phép đo chỉ so khoá i18n chứ không so câu hiển thị thật, nên không chứng minh được đúng điều AC-6 yêu cầu.
  source: measurement

- **Hình dạng 1 — nửa nền tối của ma trận a11y được khẳng định bằng tham số URL, không bằng đầu ra**
  file: `scripts/media-library/check-a11y-proto.sh`:58
  severity: medium
  AC: AC-15
  Guard tự khai (đầu file, dòng 4-16) rằng bản cũ hỏng vì "đếm URL dựng ra và trang scan trả về" chứ không đọc cái gì thực sự được vẽ, và sửa bằng cách đọc `data-proto-state`. Việc sửa đó chỉ phủ CHIỀU TRẠNG THÁI. Vòng lặp dòng 51-65 chạy hai lần cho mỗi state với `suffix` "" và "&theme=dark", nhưng cả hai lần đều so đúng một thứ: `[ "$got" != "$state" ]`. Không có gì đọc lại lớp `dark` mà `src/app/proto/[slug]/page.tsx:44` bọc quanh body. Nếu wrapper theme hỏng (đổi tên class, param bị bỏ), 9 URL "dark" trở thành 9 lần scan lại trang sáng, `RENDERED` vẫn đủ 18 phần tử và dòng in cuối vẫn tuyên "18/18 ... rendered the state they were asked for" — trong khi `expected` của E24 tuyên "CHÍN trạng thái x nền sáng/tối" và bài học được trích dẫn ngay trong eval (byo-key-onboarding: 11 vi phạm serious) chính là vi phạm tương phản ở nền tối.
  rationale: AC-15 đòi mỗi trong tám trạng thái đạt sàn tiếp cận ở CẢ nền sáng lẫn nền tối; guard chỉ so tham số URL chứ không xác nhận lớp giao diện tối thật sự được áp, nên nửa yêu cầu nền tối của AC-15 chưa được chứng minh.
  source: measurement

- **Hình dạng 2 — khung ui-check của AC-13 là hằng chuỗi viết tay trong proto, không phải đầu ra của đường lệch-phiên-bản**
  file: `_acceptance/add-media-library/evals.yaml`:222
  severity: medium
  AC: AC-13
  E22 (nửa UI của AC-13, criterion mang tag cross-layer) mở `{url}/proto/add-media-library?state=error` và assert "màn hình lỗi gọi đúng tên nguyên nhân". Proto không có trạng thái lệch-phiên-bản nào: danh sách state trong check-a11y-proto.sh:30 là 9 tên và không có `version-mismatch`; nhánh `case "error"` (add-media-library-proto.tsx:202-208) render hằng `COPY.error` = "Khoá media-library không được chấp nhận. Kiểm tra MEDIA_LIBRARY_API_KEY." — tức câu AUTH_REJECTED, viết cứng trong file proto (dòng 37), không đi qua `failureMessageKey` → `t()` như node thật (add-media-library-node.tsx:268). Khung được chụp vì thế không phải đầu ra round-trip của đường code mà AC-13 nói tới; nó vẫn xanh kể cả khi VERSION_MISMATCH không có câu dịch hoặc không bao giờ tới được màn hình. Đây đúng loại lỗi vòng trước đã sửa cho E16 ("step 2 trỏ state=results — màn hình TRƯỚC khi nạp"), còn sót ở E22 (và ở mức nhẹ hơn ở E11, nơi cả hai khung so sánh đều là hằng chuỗi của proto).
  rationale: AC-13 mang tag cross-layer nên cần bằng chứng UI thật cho đường lệch-phiên-bản; khung ui-check dùng hằng chuỗi viết cứng trong proto, không đi qua đường code thật, nên nửa UI của AC-13 chưa được chứng minh.
  source: measurement


## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Missing-config panel renders the server's Vietnamese sentence, leaving the new `missingConfig` i18n key dead**
  Người dùng thấy gì: Người dùng chọn giao diện tiếng Anh, Nhật, Hàn hay Trung nhưng khi thiếu cấu hình vẫn thấy một câu thông báo bằng tiếng Việt, không phải ngôn ngữ họ đang dùng.
  file: `src/components/workspace/nodes/add/media-library-config-panel.tsx`:92
  severity: medium
  The node passes the server-built failure text straight into the panel (add-media-library-node.tsx:85 `message: failure.message`) and the panel renders it verbatim (`<p>{message}</p>`). That text is hardcoded Vietnamese in config.server.ts:35 (`Chưa gọi được media-library: thiếu ...`), so en/ja/ko/zh users get a Vietnamese sentence inside an otherwise translated node.

This contradicts the convention the same PR states twice — media-library-outcome.ts:107-118 ("The server's own message is Vietnamese and belongs in logs ... The code is the machine-readable half and is what the UI keys off") and the comment at add-media-library-node.tsx:262-267 — which the failure branch does follow via `t(failureMessageKey(outcome.code))`.

The translated key already exists: `Workspace.nodes.addMediaLibrary.missingConfig` was added to all five locale files (en.json:1062, ja.json:976, ko/vi/zh:1062) and is never read by production code — `outcomeMessageKey()` returns `"missingConfig"` (media-library-outcome.ts:56) but the component only ever compares against `"thinShelf"`. The only consumer is the proto (src/components/proto/add-media-library-proto.tsx:147). So the i18n entry is dead in five files while the untranslated string ships.
  rationale: AC-1 chỉ đòi chuỗi missing-config nêu đúng tên biến còn thiếu, không đòi bản dịch theo ngôn ngữ giao diện — Vietnamese cứng vẫn thoả nội dung AC-1 yêu cầu.
  Đề xuất: known-limits
  source: conventions

- **Upstream JSON shape is never validated before it reaches React render**
  Người dùng thấy gì: Nếu kho dữ liệu trả về một phản hồi thành công nhưng thiếu thông tin mong đợi, màn hình tìm kiếm có thể bị treo hoặc trắng thay vì báo lỗi rõ ràng.
  file: `src/lib/media-library/client.server.ts`:161
  severity: medium
  `call()` validates transport, JSON-ness, `contracts_version` and status, then returns `body as T` with no check that the payload actually has the declared fields. The route destructures `const { cards, candidates, skipped, warnings } = result.data` (search/route.ts:72) and re-serialises them, and the node casts again: `cards: body.cards as MediaCard[]` (add-media-library-node.tsx:98).

Failure scenario: a 200 response carrying a correct `contracts_version: "0.2"` but no `cards` array (a partial write, a gateway that rewrote the body, a service that renamed the field within the same contract line) yields `cards: undefined`. Render then evaluates `outcome.cards.length > 0` (add-media-library-node.tsx:226) and throws a TypeError during render, taking the canvas subtree down. Same for a card missing `renditions` — media-card-list.tsx:44 reads `card.renditions.thumb_url` unguarded.

The taxonomy already has the right answer for this (`BAD_RESPONSE`, errors.ts:36, mapped to 502 in both routes) but it is only ever produced when the body fails to *parse*, never when it parses into the wrong shape. Note CLAUDE.md's "contract enforcement: compile-time only, bad shapes crash naturally" is scoped to the ABI — an internal contract regenerated by `pnpm gen:abi`; this is an external BYO REST service whose shape TypeScript cannot check, and the module already validates version and status at the same boundary.
  rationale: AC-6 chỉ liệt kê đúng tám ca hỏng (gồm thân không phải JSON), không bao gồm ca 200 JSON hợp lệ nhưng thiếu trường mong đợi.
  Đề xuất: new-contract
  source: conventions

- **The three ADR-0012 invariant guards run nowhere after the acceptance round**
  Người dùng thấy gì: Các bước kiểm tra an toàn nội bộ của tính năng này không tự động chạy lại khi có thay đổi khác trong tương lai, nên một thay đổi sau này có thể âm thầm phá vỡ các đảm bảo ranh giới mà không ai biết.
  file: `scripts/media-library/check-no-boot-dependency.sh`:12
  severity: medium
  `check-no-boot-dependency.sh` (guarantee #2: no boot-time relationship with the service), `check-no-dormant-fetch.sh` (downloadAndSave must stay dead — the SSRF sink the whole url-safety module exists to avoid), `check-no-domain-vocab.sh` (guarantee #3) and `check-fixture-provenance.sh` are added with no `package.json` script and no `.github/workflows/ci.yml` step (both files are untouched by this diff; CI runs only `verify:plugins`, `lint:check`, `typecheck`, `build`, `pnpm test`, sdk pytest, `pre-merge-check.sh`).

So they execute exactly once, from _acceptance/add-media-library/evals.yaml, and go dormant on merge. The invariants they protect are the ones most likely to be broken by an unrelated future PR — a layout importing `@/lib/media-library/*`, or the first caller of `downloadAndSave()`. Compare the wiring test the same PR did put under vitest (src/lib/workflow/media-library-wiring.test.ts), which will keep running.

The allow-list in scripts/media-library/no-boot-dependency.mjs:26-38 is also a hand-maintained list of nine exact paths, so a rename inside the feature turns the guard red for a reason unrelated to the invariant — the failure mode CLAUDE.md already documents for `check-manifest-unmoved.sh`.
  rationale: Không AC nào của hợp đồng yêu cầu các guard này phải được nối vào CI thường trực; đây là khoảng trống quy trình, không phải tiêu chí sản phẩm.
  Đề xuất: known-limits
  source: conventions

- **`check-a11y-proto.sh` discards the developer's uncommitted tsconfig.json on every exit**
  Người dùng thấy gì: Nếu một người đang phát triển tính năng khác chạy công cụ kiểm tra khả năng tiếp cận đúng lúc, các chỉnh sửa cấu hình họ chưa lưu có thể bị xoá mất mà không có cảnh báo.
  file: `scripts/media-library/check-a11y-proto.sh`:25
  severity: medium
  `restore_tsconfig() { git -C "$ROOT" checkout -- tsconfig.json 2>/dev/null || true; }` is installed as an EXIT trap, so the script unconditionally hard-reverts tsconfig.json to HEAD whenever it finishes — success, failure, or Ctrl-C.

Failure scenario: a developer with an in-progress tsconfig.json edit (a new path alias, a compilerOption being tested) runs the a11y guard; the edit is silently destroyed with no diff, no backup and no message, and `git checkout --` leaves nothing in reflog to recover from.

The stated problem is real (Next rewrites tsconfig `include` when `NEXT_DIST_DIR` is set), but the fix should be scoped to the mutation the script itself caused — snapshot the file before the run and restore that snapshot — rather than resolving to whatever HEAD happens to contain. No other script under scripts/ mutates tracked files this way.
  rationale: Đây là lỗi công cụ phát triển nội bộ, không phải tiêu chí nào trong Criteria của hợp đồng.
  Đề xuất: known-limits
  source: conventions

- **Both media-library routes carry a verbatim copy of the status map and catch block**
  Người dùng thấy gì: Việc sửa lỗi hoặc thêm mã lỗi mới cho tính năng này dễ bị quên cập nhật ở một trong hai nơi giống nhau, khiến hai đường tìm kiếm và nạp asset xử lý lỗi khác nhau theo thời gian.
  file: `src/app/api/media-library/search/route.ts`:12
  severity: low
  The 12-entry `STATUS` map (search/route.ts:12-24 and import/route.ts:7-19), the `LOCAL_FAILURE` catch block with its identical Vietnamese message, and the JSON-body guard are byte-identical across the two files; the explanatory doc comment is pasted twice as well. A third route, or a code added to MEDIA_LIBRARY_ERROR_CODES, has to be remembered in two places with nothing to notice the drift — the same class of duplication the PR itself guards against in src/lib/workflow/media-library-wiring.test.ts and designs around in media-library-outcome.ts:103-105 (FAILURE_KEYS derived from the taxonomy rather than copied). The map belongs next to the taxonomy in src/lib/media-library/errors.ts, ideally typed as `Record<MediaLibraryErrorCode, number>` so an added code fails to compile instead of falling through to the `?? 502` default.
  rationale: Trùng lặp mã nguồn là mối lo bảo trì, không phải hành vi mà bất kỳ AC nào đo.
  Đề xuất: known-limits
  source: conventions

- **Mid-download network failures throw and get reported as LOCAL_FAILURE ("your own machine")**
  Người dùng thấy gì: Khi kết nối mạng bị rớt giữa lúc đang tải một clip về, người dùng thấy thông báo sự cố trên máy của họ dù đây thực chất là lỗi mạng, gây hiểu nhầm khi họ tìm cách khắc phục.
  file: `src/lib/media-library/import.server.ts`:206
  severity: high
  `readCapped()` streams the body with no try/catch, and `importAsset()` does not wrap it. The `AbortSignal.timeout(downloadTimeoutMs())` created in `fetchGuarded` stays attached to the response body, so a stalled CDN, a dropped socket, or the 120s deadline firing during the body read makes `reader.read()` reject and the exception escapes `importAsset` entirely. The only handler left is the catch-all in `src/app/api/media-library/import/route.ts:58`, which answers 500 `{code: "LOCAL_FAILURE"}` -> the node renders "OneFlow could not finish this on your own machine — check the app's log for the real cause." for what is purely a remote/transport failure.

This is confirmed by the feature's own test: `src/lib/media-library/import-roundtrip.server.test.ts:172-176` accepts `"threw"` as a passing outcome ("Either shape counts as 'cut off'"), so the throw path is known and untyped.

It also contradicts the sibling code path: `src/lib/media-library/client.server.ts:74-118` goes out of its way to distinguish an AbortError/TimeoutError during `response.json()` (-> NETWORK_ERROR, "Kết nối tới media-library đứt giữa chừng") from a real shape problem, with a long comment explaining why collapsing the two sends the user to the wrong fix. The byte-download path does the exact thing that comment forbids, one classification worse.

Fix: wrap `readCapped` (or the `reader.read()` loop) and map AbortError/TimeoutError/TypeError to NETWORK_ERROR the way `call()` does.
  rationale: AC-6 nằm ở mục Tìm trong kho và ma trận tám ca gắn với API tìm/lấy asset; lỗi mạng giữa lúc tải byte qua urls.original là một chặng khác (nạp bytes) mà không AC nào đặt yêu cầu phân loại riêng.
  Đề xuất: new-contract
  source: bugs

- **a11y guard dies silently instead of printing which state failed to render**
  Người dùng thấy gì: Nếu công cụ kiểm tra khả năng tiếp cận gặp lỗi bất ngờ, nó dừng lại mà không in ra thông tin giải thích vì sao, khiến người kiểm tra khó biết trạng thái nào của node đang có vấn đề.
  file: `scripts/media-library/check-a11y-proto.sh`:54
  severity: low
  The script runs under `set -euo pipefail`. When a page does not contain `data-proto-state` — a 500, a redirect, a dev-server error page — `grep -o` exits 1, pipefail propagates that through the pipeline, and the `got=$(...)` assignment fails, so `set -e` aborts the script immediately. Verified: `bash -c 'set -euo pipefail; got=$(echo hello | grep -o "nope" | head -1 | sed "s/x/y/"); echo reached'` prints nothing and exits 1.

The consequence is that the `${got:-<none>}` branch on line 59 is unreachable and the intended diagnostic (`FAIL: <url> rendered state '<none>', asked for '<state>'`) never prints, nor does the summary on line 68 — the guard fails with zero output. That is the silent mode the header comment (lines 4-16) says this rewrite was meant to eliminate. Add `|| true` to the substitution (or `set +e` around it) so the comparison, not the pipeline status, decides.
  rationale: AC-15 đo bản thân các trạng thái có đạt sàn tiếp cận hay không, không đòi công cụ đo phải in chẩn đoán khi tự nó lỗi.
  Đề xuất: known-limits
  source: bugs

- **MISSING_CONFIG on the import path shows a generic error with no way to fix it**
  Người dùng thấy gì: Nếu khoá cấu hình bị xoá đúng lúc người dùng đang chọn một clip để nạp, họ chỉ thấy một thông báo lỗi chung chung, không được hướng dẫn cần điền lại khoá nào.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`:130
  severity: low
  `search()` special-cases `failure.code === "MISSING_CONFIG"` and renders `MediaLibraryConfigPanel`. `pick()` does not — it always sets `{kind: "failure", code, message}`. `media-library-outcome.ts:103-105` deliberately excludes MISSING_CONFIG from `FAILURE_KEYS` ("it has its own outcome kind and its own panel, so it never resolves to a failure.* sentence"), so `failureMessageKey("MISSING_CONFIG")` falls back to `"error"` -> "The library call did not go through."

The import route can genuinely return it: `importAsset` -> `getAsset` -> `call()` -> `resolveConfig()` re-reads the env store, and `src/app/api/media-library/import/route.ts:8` maps MISSING_CONFIG to 400 with that code in the body. So if the stored key is cleared (or the store read fails and `loadEnvStore` returns `{}` — it swallows all errors) between search and pick, the user gets a generic "did not go through" and no config panel, with the actionable variable names in `failure.missing` discarded.
  rationale: AC-1 khoanh vùng rõ hành động 'mở node và bấm tìm'; ca MISSING_CONFIG xảy ra ở bước chọn thẻ/nạp không nằm trong phạm vi chữ của AC-1.
  Đề xuất: new-contract
  source: bugs

- **Hình dạng 5 — tuyên quét LỚP fixture nhưng chỉ có điểm-case một chiều**
  Người dùng thấy gì: Nếu dữ liệu mẫu dùng để kiểm thử bị thiếu trường so với hợp đồng thật của kho, phần kiểm tra tự động hiện tại khó phát hiện ra, làm giảm độ tin cậy của các phép thử trước khi phát hành.
  file: `src/lib/media-library/__fixtures__/provenance.test.ts`:22
  severity: medium
  E28 `expected` tuyên: "tập TÊN TRƯỜNG của MỖI fixture khớp ĐÚNG bảng trường chép từ hợp đồng — thừa một trường hoặc thiếu một trường đều đỏ". Phép đo thực tế là `expect(unknownFields(VIDEO_CARD)).toEqual([])` — (a) chỉ một fixture trong bốn (CARD_WITH_LICENSE / CARD_UNKNOWN_VOCAB / CARD_NULL_ENTITY không được duyệt, không có vòng lặp trên tập fixture), (b) `unknownFields` (dòng 6-7) chỉ lọc khoá LẠ, không có bất kỳ assert nào cho chiều THIẾU: VIDEO_CARD chỉ mang 8 trong 22 tên của `CARD_FIELDS` và vẫn xanh, nên nửa "thiếu một trường thì đỏ" chưa từng được đo. Thêm nữa `CARD_FIELDS` nằm ngay trong chính file fixture (cards.ts:15-38), nên phép so là fixture đối chiếu một danh sách chép tay cùng file — sửa fixture và sửa danh sách trong cùng một lần chạm vẫn xanh; và assert còn lại (dòng 15-18) chỉ grep chuỗi comment `PROVENANCE:`/`READ-ON:` mà không code nào đọc.
  rationale: Không có AC nào trong Criteria yêu cầu quét đầy đủ tập trường của mọi fixture; đây là hạn chế của bộ eval E28 mà Known limits đã nói tới ở khía cạnh khác (không chạy zod thật của library), không phải một AC sản phẩm riêng.
  Đề xuất: known-limits
  source: measurement

- **Hình dạng 5 — nửa đàn áp tuyên về LỚP "đuôi mà thang từ chối" nhưng đo một ca lành, bỏ ca quyết định**
  Người dùng thấy gì: Nếu một tệp có đuôi mở rộng đáng ngờ lọt qua bộ lọc an toàn, phần kiểm tra tự động hiện nay chưa chắc sẽ bắt được, để lại nguy cơ nội dung độc hại bị phục vụ như dữ liệu chạy được thay vì tệp trơ vô hại.
  file: `src/lib/media-library/extension-serving.server.test.ts`:86
  severity: low
  Test `does not serve active content for an extension the ladder refuses` (dòng 82-87) nêu đích danh rủi ro trong comment: `.svg` được phục vụ same-origin thành `image/svg+xml`, tức nội dung hoạt động. Nhưng assert phục vụ lại chạy trên `servedContentType("txt")` → "text/plain". Bảng MIME của route (src/app/api/uploads/[...path]/route.ts:16) thật sự trả `image/svg+xml` cho `.svg`, nên ca duy nhất chứng minh được mệnh đề "trả về thứ trơ" lại là ca không nguy hiểm; mệnh đề "một đuôi thang từ chối không được phục vụ như nội dung hoạt động" chưa được đo trên phần tử duy nhất khiến allow-list tồn tại. (Nửa chặn ở tầng thang — `extensionFor(...evil.svg) === "mp4"`, dòng 84 — vẫn đo tốt; chỗ hụt chỉ ở nửa route.)
  rationale: Không AC nào trong Criteria đặt yêu cầu về việc route serve nội dung theo đuôi bị thang từ chối phải trơ; đây là một khoảng trống bảo mật chưa có tiêu chí, không phải AC thất bại.
  Đề xuất: new-contract
  source: measurement


⚠ Cụm ngoài vùng phủ: 5/16 lỗi rơi vào file không bộ đo nào phủ (scripts/media-library/check-no-boot-dependency.sh, scripts/media-library/check-a11y-proto.sh, _acceptance/add-media-library/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
