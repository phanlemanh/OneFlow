## Trong hợp đồng

(không có)


## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Config panel renders the server's Vietnamese sentence; the translated missingConfig key is never used**
  Người dùng thấy gì: Người dùng dùng giao diện tiếng Anh, Nhật, Hàn hoặc Trung sẽ thấy một câu tiếng Việt ngay ở màn hình đầu tiên khi node chưa được cấu hình, dù các bản dịch tương ứng đã có sẵn nhưng không được dùng tới.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`:241
  severity: medium
  The feature states its own rule in media-library-outcome.ts:107-118 — the server message is Vietnamese and belongs in the log, the UI keys off the machine-readable code — and the failure branch follows it (t(failureMessageKey(outcome.code)) at add-media-library-node.tsx:306). The missing-config branch breaks it: add-media-library-node.tsx:238-252 passes message={outcome.message} (built in src/lib/media-library/config.server.ts:35, 'Chưa gọi được media-library: thiếu ...') into media-library-config-panel.tsx:92, which prints it raw as the panel's lead sentence. Meanwhile the key Workspace.nodes.addMediaLibrary.missingConfig was added to all five locale files (en/ja/ko/vi/zh) and outcomeMessageKey() returns 'missingConfig', but t("missingConfig") is called nowhere outside src/components/proto/add-media-library-proto.tsx. Net effect: an en/ja/ko/zh user hitting the not-configured state — the very first state a new user hits — gets Vietnamese inside an otherwise translated node, and five translations sit dead.
  rationale: AC-1 chỉ đòi hỏi chuỗi chứa đúng tên biến còn thiếu, không đòi hỏi thông điệp phải được dịch theo ngôn ngữ giao diện; không AC nào trong hợp đồng nói tới i18n của trạng thái thiếu-cấu-hình.
  Đề xuất: known-limits
  source: conventions

- **Upstream cards echoed and rendered without shape validation — a malformed card crashes the whole canvas**
  Người dùng thấy gì: Nếu kho trả về một thẻ kết quả bị thiếu dữ liệu, toàn bộ màn hình làm việc có thể bị sập trắng thay vì chỉ báo lỗi ở riêng node đó, khiến người dùng mất luôn phần đang làm dở trên canvas.
  file: `src/components/workspace/nodes/add/media-card-list.tsx`:42
  severity: high
  Nothing between the third-party library and React validates a card's shape. src/app/api/media-library/search/route.ts:72-73 destructures result.data.cards and passes it through untouched (client.server.ts only checks contracts_version and status, then casts `body as T`). add-media-library-node.tsx:69-74 checks only Array.isArray(record.cards) and then casts `record.cards as MediaCard[]`. media-card-list.tsx:42-47 then dereferences card.renditions.thumb_url. A 200 whose cards array contains an object missing `renditions` (contract drift, a partial row, a proxy rewriting the body) throws a TypeError during render; the only boundary is the app-level one wired in src/app/layout.tsx, so it unmounts the whole workspace rather than showing the BAD_RESPONSE state the taxonomy already defines. This is the identical failure class the readResults comment (add-media-library-node.tsx:39-56) says it fixed for `cards: undefined` — the fix stopped one field short. The repo's compile-time-only enforcement rule in CLAUDE.md covers the ABI contract, not a third-party REST boundary. The code acknowledges the gap at add-media-library-node.tsx:53-55 and defers it to Gate 2.
  rationale: Không AC nào yêu cầu kiểm tra hình dạng thẻ trong một phản hồi 200 hợp lệ ở tầng HTTP; AC-6 (tám ca hỏng) chỉ áp cho các mã lỗi HTTP của endpoint tìm kiếm, không áp cho một 200 có dữ liệu thẻ méo.
  Đề xuất: new-contract
  source: conventions

- **Failure-code ↔ HTTP status table duplicated three times with no drift guard**
  Người dùng thấy gì: Nếu sau này kho thêm một mã lỗi mới, một số nơi trong ứng dụng có thể âm thầm hiện thông báo lỗi chung chung thay vì thông báo đúng nguyên nhân, mà không ai nhận ra để sửa.
  file: `src/app/api/media-library/import/route.ts`:7
  severity: medium
  The same mapping is written three times and derived from nothing: src/app/api/media-library/search/route.ts:12-24 and src/app/api/media-library/import/route.ts:7-19 are byte-identical 11-entry maps, and src/components/workspace/nodes/add/media-library-outcome.ts:79-88 holds the inverse (STATUS_TO_CODE). src/lib/media-library/errors.ts:12-27 exists specifically to stop this: it exports MEDIA_LIBRARY_ERROR_CODES as a VALUE because hand-copied code lists went stale twice without an assertion going red, and media-library-outcome.ts:103-105 correctly derives FAILURE_KEYS from it. The three status tables do not, and no test compares them — while this same PR added src/lib/workflow/media-library-wiring.test.ts precisely on the argument that 'two copies of one fact drift, and the drift is silent'. A code added to the taxonomy hits `?? 502` in both routes and `?? "UPSTREAM_ERROR"` in the node, so the mismatch is invisible.
  rationale: Không AC nào yêu cầu một nguồn sự thật duy nhất cho bảng ánh xạ mã lỗi; đây là rủi ro bảo trì về sau, không phải hành vi hiện tại đang lệch khỏi AC-6.
  Đề xuất: known-limits
  source: conventions

- **Vietnamese comment in .env.example, and two env knobs read from production code are undocumented there**
  Người dùng thấy gì: Người tự triển khai dịch vụ có thể khó biết cần chỉnh hai biến vận hành nào, vì tệp mẫu không nhắc tới chúng; ảnh hưởng chủ yếu tới người vận hành cài đặt, không phải người dùng cuối.
  file: `.env.example`:41
  severity: low
  CLAUDE.md requires comments in code to be English only; every other comment in .env.example is English, and the block added here contains a Vietnamese sentence ('only the "nạp từ kho" node reports the missing names...'). Separately, two environment variables are read on production code paths but appear nowhere in .env.example: NEXT_DIST_DIR (next.config.ts, `distDir: process.env.NEXT_DIST_DIR || ".next"` — it changes where a real build writes its output) and MEDIA_LIBRARY_DOWNLOAD_TIMEOUT_MS (src/lib/media-library/import.server.ts:34-37, described in its own comment as 'Production never sets this variable', i.e. a test hook living in the shipped download path). .env.example is where this repo documents its knobs; both belong there, at minimum as commented-out lines saying what they are for.
  rationale: Đây là yêu cầu ở CLAUDE.md của dự án (comment tiếng Anh, tài liệu hoá biến môi trường), không phải một tiêu chí trong hợp đồng nghiệm thu add-media-library.
  Đề xuất: known-limits
  source: conventions

- **Import success path parses the response unguarded — a bad 200 becomes either a fake NETWORK_ERROR or a video node with fileKey "undefined"**
  Người dùng thấy gì: Khi có trục trặc ngay ở bước nạp xong, người dùng có thể thấy nạp thành công và một node video mới xuất hiện trên canvas, nhưng clip đó thực chất hỏng và không phát được, mà không có cảnh báo nào cho biết.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`:176
  severity: high
  In `pick()`:

```ts
const body = await response.json();
if (id) {
    expands(id, [{ type: "videoNode", data: { fileKeys: [String(body.fileKey)] } }]);
}
setOutcome({ kind: "idle" });
```

This is the exact defect class the same file documents and fixes on the search path (`readResults`, lines 39-80: "`await response.json()` sat inside a try whose only catch said 'could not reach the library'" and "`body.cards as MediaCard[]` was an unchecked cast"). The import path kept both halves:

1. A 200 whose body is not JSON (dev-server or proxy error page interposing — the scenario `readResults` was written for) throws out of `response.json()` into the outer `catch`, which sets `{ code: "NETWORK_ERROR" }`. The user is told OneFlow could not reach media-library, when the remote call actually succeeded.
2. A 200 whose body lacks `fileKey` (`NextResponse.json` drops `undefined` keys, so this is producible without any HTML page) yields `String(undefined)` === `"undefined"`. The node then calls `expands()` and puts a `videoNode` on the canvas whose `fileKeys` is `["undefined"]`, sets `{ kind: "idle" }`, and shows no error at all. The user sees a successful-looking import and a permanently broken clip node; the exporter will later serialise that bogus key into the workflow via `getAddNodeOutputType`/`findDownstreamDataNode`.

Case 2 is the silent one: there is no code path that reports it. `add-media-library-node.test.tsx` never exercises the import fetch, so nothing covers either half.

Fix shape: mirror `readResults` — parse defensively and require `typeof body.fileKey === "string" && body.fileKey`, falling back to `{ kind: "failure", code: "BAD_RESPONSE" }`.
  rationale: AC-9/AC-11/AC-12 mô tả hành vi khi lệnh nạp thành công đúng nghĩa; không AC nào trong hợp đồng bao trùm trường hợp phản hồi 200 từ chính route nạp bị thiếu trường — đây là một ca 'hỏng ngoài dự kiến' mà ma trận tám ca ở AC-6 chỉ gán cho endpoint tìm kiếm, không gán cho endpoint nạp.
  Đề xuất: new-contract
  source: bugs

- **Malformed redirect `Location` throws out of fetchGuarded and is reported as LOCAL_FAILURE (OneFlow's own machine failed)**
  Người dùng thấy gì: Khi kho gửi về một địa chỉ chuyển hướng bị lỗi định dạng, người dùng nhận thông báo đổ lỗi cho máy của chính họ (ví dụ hết dung lượng đĩa) dù nguyên nhân thật nằm ở phía kho, khiến họ có thể loay hoay sửa sai chỗ.
  file: `src/lib/media-library/import.server.ts`:125
  severity: medium
  `current = new URL(location, current).toString();` sits outside any try/catch. `new URL()` throws for an absolute-looking but unparseable input even with a valid base — e.g. `Location: http://` or `Location: https://[::1` both raise `TypeError: Invalid URL`.

That throw escapes `fetchGuarded`, escapes `importAsset`, and lands in the import route's catch:

```ts
} catch (error) {
    logger.error("[media-library] import route failed:", error);
    return NextResponse.json({ code: "LOCAL_FAILURE", message: "OneFlow không hoàn tất được việc này ở phía máy của bạn." }, { status: 500 });
}
```

The route comment states that catch exists specifically for "OneFlow's own side failing — the file store most often (disk full, permission denied)". An upstream sending a broken redirect header is the opposite: a far-side fault. The node renders `failure.LOCAL_FAILURE` and sends the user to inspect their own disk. The taxonomy already has the right arm for this (`BAD_RESPONSE`, alongside the sibling case "Chuyển hướng N nhưng không có Location" three lines above at line 121) — it is simply unreachable because the URL construction is unguarded.

Wrap the resolution in try/catch and return the `BAD_RESPONSE` failure the neighbouring branch already returns.
  rationale: AC-10 chỉ định nghĩa hành vi từ chối cho scheme/host không an toàn và cho việc chặn kích thước/thời gian chờ; một header Location chuyển hướng bị hỏng định dạng là một tình huống khác, không nằm trong Then của AC-10 hay trong tám ca của AC-6 (vốn chỉ áp cho endpoint tìm kiếm).
  Đề xuất: known-limits
  source: bugs

- **Config panel reports a successful save when it wrote nothing, then loops back to the same dead end**
  Người dùng thấy gì: Nếu người dùng bấm Lưu mà chưa nhập gì hoặc chỉ nhập một trong hai ô, hệ thống báo lưu thành công nhưng thực chất không lưu gì mới, rồi quay lại đúng màn hình thiếu cấu hình như cũ mà không giải thích vì sao, khiến người dùng có thể loay hoay không biết phải làm gì tiếp theo.
  file: `src/components/workspace/nodes/add/media-library-config-panel.tsx`:66
  severity: medium
  `save()` merges conditionally:

```ts
const next = { ...payload.env };
if (url.trim()) next.MEDIA_LIBRARY_URL = url.trim();
if (key.trim()) next.MEDIA_LIBRARY_API_KEY = key.trim();
```

and then unconditionally `PUT`s and calls `onSaved()`. There is no check that anything actually changed.

Clicking Save with both fields blank issues a PUT that rewrites the env map to its existing contents, reports success, and calls `onSaved()` → `search()` → the server returns MISSING_CONFIG again → a *fresh* `MediaLibraryConfigPanel` mounts (the component unmounts while `outcome.kind === "searching"`), with `url`/`key` state reset to `""`. The user sees the spinner, then the identical panel with the identical message and no error — no signal that the save was a no-op. ADR-0012 guarantee #2, which this panel exists to satisfy, is precisely "do not leave the user at a dead end"; this is a dead end that looks like progress.

The same silent-reset also swallows partially-entered state: type a URL, click Save without the key, and the panel remounts with the URL box empty (it disappears entirely once `missing` shrinks to just the key), so there is no confirmation the URL landed.

Refuse to submit when neither field has content, and surface a result rather than assuming the PUT changed something.
  rationale: AC-1 chỉ đòi hỏi người dùng từ trạng thái thiếu-cấu-hình tới được chỗ nhập hai khoá rồi tìm thành công (đường thuận); nó không định nghĩa hành vi khi người dùng bấm Lưu mà bỏ trống hoặc chỉ điền một ô, nên đây là một ca chưa được liệt kê chứ không phải suy diễn 'gần giống'.
  Đề xuất: known-limits
  source: bugs

- **Boot-dependency and dormant-fetch guards match module paths by bare string prefix and ignore dynamic imports**
  Người dùng thấy gì: Đây là rủi ro kỹ thuật cho việc bảo trì về sau — một tên thư mục hoặc cách nạp mã tương lai có thể lách qua được công cụ kiểm tra tự động — chứ không phải điều người dùng gặp phải hôm nay.
  file: `scripts/media-library/no-boot-dependency.mjs`:51
  severity: low
  Two holes in guards whose stated purpose is to be hole-free (the file header says the previous grep version failed because "its allow-list matched a FILENAME PREFIX (`media-`), so any future file dropped in that directory whose name started with `media-` exempted itself").

1. Prefix matching without a path-separator boundary. `no-boot-dependency.mjs:51` self-exempts any file where `resolvedFile.startsWith(MODULE_ROOT)` with `MODULE_ROOT = <repo>/src/lib/media-library` — so a future `src/lib/media-library-legacy/boot.ts` exempts itself from the scan, and line 56's `entry.resolved.startsWith(MODULE_ROOT)` would likewise count an import of `src/lib/media-library-legacy/*` as an in-module import. `no-dormant-fetch.mjs:33`/`:39` has the identical shape with `OWNER = <repo>/src/lib/file/file-utils` (a `file-utils-extra.ts` would be treated as the owner and skipped). This is the same defect the header claims to have retired, re-spelled as a path prefix instead of a filename prefix.

2. `importsOf` in `import-graph.mjs` walks only `source.statements` for `ts.isImportDeclaration`. A dynamic `await import("@/lib/media-library/client.server")` or a `require()` in a layout/provider/instrumentation file is invisible to the guard — and a lazy import from a boot file is exactly the boot-time relationship ADR-0012 guarantee #2 forbids. The module's "KNOWN LIMIT" paragraph names specifier resolution and runtime-value calls, but not dynamic import, so this gap is undeclared as well as unguarded.

Neither is exploited by the current tree; both make the guards weaker than their evidence text claims.
  rationale: Đây là điểm yếu của công cụ kiểm tra nội bộ hỗ trợ chứng minh bảo đảm #2/AC-2, không phải một vi phạm AC-2 đang thật sự xảy ra trong cây mã hiện tại — bản thân finding cũng ghi nhận 'chưa bị khai thác trong cây hiện tại'.
  Đề xuất: known-limits
  source: bugs

- **Hình dạng 5 — E28 tuyên quét LỚP ("mỗi fixture", "thừa hoặc thiếu đều đỏ") nhưng chỉ có một điểm-case một chiều**
  Người dùng thấy gì: Đây là khoảng trống trong bộ kiểm tra tự động của nhóm phát triển; nó có nghĩa là một số kiểu lệch trường dữ liệu thẻ có thể lọt qua mà không ai phát hiện sớm, nhưng không phải lỗi người dùng cuối gặp trực tiếp hôm nay.
  file: `src/lib/media-library/__fixtures__/provenance.test.ts`:22
  severity: high
  evals.yaml E28 (dòng 272) tuyên: "tập TÊN TRƯỜNG của MỖI fixture khớp ĐÚNG bảng trường chép từ hợp đồng — thừa một trường hoặc thiếu một trường đều đỏ". Code đo được hai thứ hẹp hơn nhiều:

(a) Chỉ MỘT fixture được soi. `expect(unknownFields(VIDEO_CARD)).toEqual([])` ở dòng 22 là assert duy nhất trên dữ liệu; ba fixture còn lại được export từ cards.ts — CARD_WITH_LICENSE (dòng 56), CARD_UNKNOWN_VOCAB (dòng 67), CARD_NULL_ENTITY (dòng 76) — không hề được import vào file test này. Với ma trận toàn phần viết-trước (P105), số assert phải bằng số phần tử (4), ở đây là 1.

(b) Chỉ MỘT chiều được đo. `unknownFields` (dòng 6-7) là `Object.keys(card).filter(key => !CARD_FIELDS.includes(key))` — nó chỉ tìm trường THỪA. Không có phép đếm nào cho chiều THIẾU. VIDEO_CARD bỏ trống 12 trong 22 tên ở CARD_FIELDS (scene_kind, duration_s, suggested_in_s, suggested_out_s, energy, captured_at, fresh, interior_state, pinned, curator_note, shoot, license_label) và vẫn xanh. Nửa "thiếu một trường là đỏ" mà E28 hứa không có lấy một dòng assert.

Hệ quả đo lường: `expected` của E28 mô tả một ma trận 4 fixture × 2 chiều; hiện vật thực chạy là 1 × 1. Người ký Cổng 2 đọc `expected` sẽ tin fixture đã được rào cả hai chiều.
  rationale: Đây là khoảng cách giữa lời tuyên của eval E28 và phạm vi assert thật của nó — một vấn đề về độ tin cậy của bằng chứng nghiệm thu, không phải bản thân AC-7 (dữ liệu lĩnh vực đi qua như chuỗi mờ) đang thất bại trong sản phẩm.
  Đề xuất: known-limits
  source: measurement

- **Hình dạng 2 — fixture viết tay được đối chiếu với một bảng cũng viết tay trong CÙNG file; không có round-trip, và "teeth" chỉ tới được bằng cách cast bỏ chính phép kiểm đã có**
  Người dùng thấy gì: Đây là khoảng trống trong bộ kiểm tra tự động — nếu ai đó sửa nhầm cùng lúc dữ liệu mẫu và bảng đối chiếu, không có cơ chế nào phát hiện — nhưng người dùng cuối không bị ảnh hưởng trực tiếp hôm nay.
  file: `src/lib/media-library/__fixtures__/cards.ts`:15
  severity: high
  Cả hai đầu của phép so sánh do cùng một người viết tay, nằm cách nhau 25 dòng trong cùng một file: CARD_FIELDS (dòng 15-38) và VIDEO_CARD (dòng 40-54). provenance.test.ts import CẢ HAI từ "./cards" (dòng 3), nên phép đo không bao giờ chạm tới bên sản xuất (hợp đồng media-library) — nó chỉ khẳng định cards.ts nhất quán với chính nó. Một lần sửa đồng thời cả fixture lẫn CARD_FIELDS — đúng cách một người sửa file này sẽ làm — là vô hình.

Tệ hơn, phép kiểm runtime gần như trùng với thứ tsc đã làm: fixture được chú kiểu `: MediaCard` (dòng 40, 56, 67, 76), nên excess-property check của TypeScript đã cấm trường lạ trong object literal. Bằng chứng nằm ngay ở test "teeth" (provenance.test.ts dòng 31-37): để dựng được ca lệch `licenseLabel`, nó phải `as Record<string, unknown>` — tức là cast bỏ đúng cái rào đã chặn drift đó. Drift mà teeth minh hoạ là drift một fixture thật KHÔNG THỂ mang.

Còn lại: CARD_FIELDS không được nối với `MediaCard` trong types.ts bằng bất kỳ assert nào, và types.ts cũng là bản chép tay từ hợp đồng (header dòng 11-12). Ba bản chép tay, không bản nào đối chứng với bên phát. Header của cards.ts (dòng 8-10) chỉ khai giới hạn "không bắt được fixture sai từ ngày đầu" — nó không khai rằng bảng đối chiếu cũng nằm trong cùng file.
  rationale: Đây cũng là vấn đề về độ tin cậy của bằng chứng nghiệm thu (fixture tự đối chiếu với chính nó) chứ không phải một AC sản phẩm đang thất bại; không AC nào trong hợp đồng nói tới cách dựng fixture kiểm thử.
  Đề xuất: known-limits
  source: measurement

- **Hình dạng 1 — assert "tám mã phân biệt" đo BẢNG CA của chính test, không gọi tới bên bị đo**
  Người dùng thấy gì: Bộ kiểm tra tự động cho tám loại lỗi kết nối tới kho không thực sự gọi tới đoạn mã cần kiểm; nếu logic phân loại lỗi từng bị hỏng, bộ kiểm tra vẫn báo xanh, khiến lỗi có thể lọt ra ngoài mà nhóm phát triển không hay biết.
  file: `src/lib/media-library/client.server.test.ts`:192
  severity: medium
  Dòng 192-196:

    it("produces eight distinct codes across the matrix", async () => {
        const codes = new Set(cases.map((c) => c.code));
        codes.add("NETWORK_ERROR");
        expect(codes.size).toBe(8);
    });

Không có lời gọi `searchVideos` nào trong thân test. Nó đọc mảng literal `cases` (dòng 78-144) — chỉ dẫn của chính bộ đo — rồi đếm phần tử `code` mà chính file này gõ vào. Không có thay đổi nào ở client.server.ts hay errors.ts làm nó đỏ được.

Lý do viết trong comment ngay trên (dòng 187-191) sai về mặt cơ học: "a mapper that collapsed everything into UPSTREAM_ERROR would pass each case above on its own if the expectations had been written loosely". Một mapper gộp hết về UPSTREAM_ERROR sẽ làm ĐỎ vòng lặp dòng 146-155 (`expect(result.failure.code).toBe(testCase.code)`), còn assert ở 192 thì xanh nguyên vì nó không đọc mapper. Nó được trình bày như nửa gánh việc của ma trận E10 nhưng không có sức phân biệt nào với sản phẩm.
  rationale: Đây là một test không thực sự gọi vào mã cần kiểm — vấn đề về độ tin cậy của bằng chứng cho AC-6, không phải bản thân AC-6 đang thất bại trong sản phẩm chạy thật.
  Đề xuất: known-limits
  source: measurement

- **Hình dạng 5 — so sánh câu kệ-mỏng với câu lỗi chỉ chạy trên locale `en`, trong chính describe đã tuyên trục locale là thứ gánh việc**
  Người dùng thấy gì: Bộ kiểm tra chỉ xác nhận thông báo 'kệ mỏng' khác thông báo lỗi ở bản tiếng Anh; nếu một bản dịch khác (Nhật, Hàn, Việt, Trung) vô tình dùng chung một câu cho cả hai trường hợp, người dùng ở ngôn ngữ đó sẽ không phân biệt được 'không có kết quả phù hợp' với 'có lỗi xảy ra', mà bộ kiểm tra hiện tại sẽ không phát hiện ra.
  file: `src/components/workspace/nodes/add/add-media-library-node.test.tsx`:260
  severity: medium
  Describe "every failure code reaches a real, distinct sentence (AC-6)" (dòng 190) tồn tại vì lý do nêu ở dòng 178-188: assert trên KEY không chứng minh gì, phải phân giải qua file bản dịch thật. Đúng theo lý do đó, test dòng 230 lặp đủ 5 locale (`for (const [locale, messages] of Object.entries(LOCALES))`).

Nhưng test kế bên — "words a thin shelf differently from every failure" (dòng 259-265) — lại chỉ đọc `LOCALES.en`:

    const thin = LOCALES.en.thinShelf;
    for (const code of failureCodes) expect(copyFor(LOCALES.en, code)).not.toBe(thin);

Trục mã lỗi thì quét đủ; trục locale thì đứng ở một điểm. Một bản dịch ja/ko/vi/zh trong đó `thinShelf` trùng câu của một `failure.<CODE>` — chính là kịch bản 501-đọc-thành-kệ-rỗng mà E7/E10/E11 dựng ra để chặn — vẫn xanh toàn bộ. Ma trận đúng ở đây là 5 locale × N mã; hiện có 1 × N, trong khi comment dòng 254-257 gọi cặp này là "the one AC-4/AC-6 pair most likely to collapse".
  rationale: Đây là khoảng trống về độ bao phủ của test trên trục locale, không phải bằng chứng rằng một bản dịch cụ thể hiện đang trùng câu giữa AC-4 và AC-6 — chưa có xác nhận thực tế nào cho thấy AC-4 hoặc AC-6 đang thất bại ở locale khác.
  Đề xuất: known-limits
  source: measurement

- **Hình dạng 5 — guard tuyên "đồ thị import THẬT" nhưng chỉ thấy `import` tĩnh ở cấp cao nhất**
  Người dùng thấy gì: Đây là khoảng trống trong công cụ kiểm tra nội bộ — nó không phát hiện được kiểu 'nạp mã động'; nếu sau này có người vô tình tạo phụ thuộc khởi động qua cách nạp này, công cụ sẽ không cảnh báo, nhưng chưa có ảnh hưởng nào tới người dùng hôm nay.
  file: `scripts/media-library/import-graph.mjs`:71
  severity: medium
  `importsOf` (dòng 67-105) duyệt `source.statements` và bỏ qua mọi thứ không phải `ts.isImportDeclaration` (dòng 71-75). Ba dạng nằm ngoài tầm nhìn:

- `await import("@/lib/media-library/client.server")` — CallExpression, không phải ImportDeclaration;
- `export { x } from "@/lib/media-library/..."` / `export * from ...` — ExportDeclaration, tạo đúng quan hệ boot-time như import;
- `require("...")` trong file .cjs/.mjs mà `sourceFiles` vẫn thu thập (dòng 27).

Hai eval dựa lên nó tuyên rộng hơn thế: E3 (evals.yaml dòng 52) — "quét đồ thị import THẬT (parse AST, phân giải specifier thành ĐƯỜNG DẪN…) và khẳng định module src/lib/media-library/** CHỈ được nhập bởi các file đã khai — không layout, không page, không instrumentation, không provider toàn cục"; E27 (dòng 264) — "phân giải định danh THẬT", với `locals` ở no-dormant-fetch.mjs dòng 40-45 chỉ được nạp từ import tĩnh, nên `const { downloadAndSave } = await import("@/lib/file/file-utils")` không có caller nào bị đếm.

E27 có khai một giới hạn khác ("lời gọi qua giá trị truyền lòng vòng lúc chạy"), E3 không khai giới hạn nào. Dạng dynamic import trong một layout/provider chính là cách quan hệ boot-time hay được viết nhất, và nó là điểm mù của cả hai guard.
  rationale: Tương tự finding về no-boot-dependency.mjs: đây là điểm mù của công cụ kiểm tra hỗ trợ chứng minh bảo đảm #2, không phải một vi phạm đang thật sự tồn tại trong cây mã hiện tại.
  Đề xuất: known-limits
  source: measurement


⚠ Cụm ngoài vùng phủ: 3/13 lỗi rơi vào file không bộ đo nào phủ (.env.example, scripts/media-library/no-boot-dependency.mjs, scripts/media-library/import-graph.mjs).
