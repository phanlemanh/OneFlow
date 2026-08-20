## Trong hợp đồng

- **Body-parse catch in the REST client swallows the error and mislabels network truncation as BAD_RESPONSE**
  file: `src/lib/media-library/client.server.ts`:65
  severity: medium
  AC: AC-6
  `try { body = await response.json(); } catch { parsed = false; body = {}; }` discards the error entirely — no logger call, unlike the fetch catch three lines above. `response.json()` rejects not only for malformed JSON but also for a connection reset mid-body and for the 15s `AbortSignal.timeout` firing after headers arrive. In those cases response.ok is true, so line 78 returns `BAD_RESPONSE` — "media-library trả về thân không phải JSON" / "The library answered in a shape this version does not accept" — which points the user at a contract/version problem when the truth was a dropped connection or a timeout. Distinguish an abort/network error from a syntax error (or at minimum log the cause) before choosing BAD_RESPONSE.
  rationale: AC-6 đòi 8 ca lỗi của ranh giới này (gồm 'thân trả về không phải JSON' và 'đứt mạng') phải được node gọi đúng tên nguyên nhân; ở đây một lỗi đứt mạng/quá hạn giữa chừng bị gộp nhầm thành ca sai hình dạng hợp đồng, nên hai ca không còn phân biệt được đúng nguyên nhân như AC-6 yêu cầu.
  source: bugs

- **Hình dạng 2 — E15 hứa round-trip qua kho file nhưng saveFile bị mock, sha256 đo trên đối số đưa cho mock**
  file: `src/lib/media-library/import.server.test.ts`:82
  severity: high
  AC: AC-9
  evals.yaml E15 (dòng 162) hứa: "file_key sinh ra ĐỌC LẠI ĐƯỢC từ kho với sha256 TRÙNG sha256 của bytes máy chủ giả phát ra", và paths của E15 khai cả src/lib/file/file-utils.ts lẫn src/lib/file/storage.server.ts. Nhưng test dòng 14-19 mock nguyên module @/lib/file/file-utils (saveFile chỉ push {data, ext} vào mảng saved.calls và trả chuỗi `nanoid1.mp4`), rồi dòng 82-86 băm sha256 của saved.calls[0].data — tức băm chính buffer vừa đưa cho stub, không hề ghi rồi đọc lại bằng reader của kho. Không có writer/reader thật nào chạy: một saveFile hỏng (ghi thiếu byte, sai đường dẫn, không persist) vẫn xanh, và file_key trả về không bao giờ được phân giải ngược. Đây đúng là fixture/khẳng định không round-trip: đo đầu vào của bên ghi thay vì đo thứ bên đọc lấy ra được.
  rationale: AC-9 đòi chứng minh file_key đọc lại được từ kho file với nội dung đúng bằng bytes đã tải; E15 là bằng chứng máy cho đúng AC này nhưng đo sha256 trên đầu vào đưa cho mock thay vì round-trip thật, nên AC-9 chưa thực sự được chứng minh.
  source: measurement

- **Hình dạng 5 — E19 tuyên ba vế (đối xứng bảng + validator + exporter fileKeys), suite chỉ có vế đầu**
  file: `src/lib/workflow/media-library-wiring.test.ts`:29
  severity: medium
  AC: AC-12
  evals.yaml E19 (dòng 198) hứa ba việc: (a) hai bản sao bảng khớp mọi khoá; (b) "cạnh addMediaLibraryNode->videoNode qua được validator"; (c) "exporter xuất ra node dữ liệu mang fileKeys". File test chỉ làm (a): so ADD_NODE_OUTPUT_TYPE với typeMap parse bằng regex từ source exporter.ts. `grep -rn addMediaLibraryNode src` cho thấy toàn cây không có test nào khác chạm chuỗi này — connection-validator.test.ts và compose-overlay-export.test.ts không nằm trong diff và không nhắc tới node mới. Vế (b) và (c) hoàn toàn không có assert nào, trong khi criterion AC-12 được đánh layer: backend-effect và ui-check E20 chỉ chụp node hiện trên canvas. Ngoài ra (a) đo VĂN BẢN NGUỒN của exporter (readFileSync + regex `getAddNodeOutputType[\s\S]*?typeMap...`) chứ không gọi hàm — vì getAddNodeOutputType là private (exporter.ts:492) — nên một exporter đúng bảng nhưng sai nhánh dùng bảng vẫn xanh.
  rationale: Hai vế thiếu của E19 (cạnh qua validator, exporter xuất fileKeys) chính là nội dung AC-12 đòi hỏi; thiếu assert cho chúng nghĩa là AC-12 chưa được chứng minh đầy đủ.
  source: measurement

- **Hình dạng 1 — guard a11y đếm 16 URL/16 trang quét được, không đếm 16 TRẠNG THÁI vẽ ra**
  file: `scripts/media-library/check-a11y-proto.sh`:39
  severity: medium
  AC: AC-15
  Script dựng 16 URL từ mảng STATES (dòng 21-27), assert `${#URLS[@]} -ne 16` rồi sau khi quét assert `report.pages.length !== 16`. Cả hai chỉ đo chỉ dẫn (danh sách URL) và khả năng tới được trang, không đo trang đó vẽ trạng thái nào. AddMediaLibraryProto (src/components/proto/add-media-library-proto.tsx, nhánh `default:` cuối switch) trả về khung idle cho MỌI chuỗi state không khớp, và ProtoPage truyền thẳng `state ?? ""` xuống. Vì vậy nếu một case bị đổi tên (ví dụ "thin-shelf" -> "thinShelf") hay bị xoá, URL tương ứng vẫn 200, vẫn được axe quét, report.pages vẫn 16 và guard vẫn in "16/16 pages scanned" — trong khi thực tế chỉ quét trang idle nhiều lần. Chính lỗ hổng mà comment đầu file nói muốn bịt ("tới được 4/16 mà vẫn exit 0") vẫn mở dưới dạng khác: 16 lần chạm cùng một trang.
  rationale: AC-15 đòi từng trong tám trạng thái node (ở cả hai nền) phải thật sự hiện ra và đạt sàn tiếp cận; guard chỉ đếm URL/trang tới được, nên một trạng thái đổi tên hay bị xoá vẫn báo '16/16' dù thực chất chỉ quét lặp một trạng thái mặc định.
  source: measurement

- **Hình dạng 5 — vòng lặp "tám mã lỗi" là trang trí: outcomeMessageKey không đọc `code`, và lớp thật có 10 mã**
  file: `src/components/workspace/nodes/add/add-media-library-node.test.tsx`:77
  severity: medium
  AC: AC-6
  Test "never labels any of the eight failure codes as a thin shelf" (dòng 77-94) lặp 8 mã và assert `!== "thinShelf"`. Nhưng outcomeMessageKey (media-library-outcome.ts:46-61) switch trên `outcome.kind` và KHÔNG bao giờ đọc `outcome.code` — mọi outcome kind="failure" trả "error". Tám vòng lặp vì thế chạy đúng một đường code với một trường bị bỏ qua; không vòng nào có khả năng đỏ riêng. Thêm hai vấn đề: (1) `expect(codes).toHaveLength(8)` ở dòng 93 assert trên chính mảng literal của test — hằng đúng, không đo gì trong impl; (2) lớp "mã lỗi ranh giới" thật sự có 10 phần tử (FAILURE_KEYS, media-library-outcome.ts:94-105) và 11 trong MediaLibraryErrorCode (errors.ts:12-29); danh sách 8 bỏ sót VERSION_MISMATCH và LOCAL_FAILURE — đúng hai mã mà codeForStatus (dòng 78-87) sinh cho 409 và 500, tức hai mã node CHẮC CHẮN gặp.
  rationale: AC-6 đòi mỗi trong tám ca lỗi có thông điệp phân biệt được và số assert bằng số ca; test này lặp 8 mã qua một hàm không hề đọc `code`, chạy đúng một đường code, và bỏ sót hai mã (VERSION_MISMATCH, LOCAL_FAILURE) mà node chắc chắn gặp — AC-6 chưa được chứng minh.
  source: measurement

- **Hình dạng 1 — E27 tuyên guard "phân giải định danh", thực tế là grep chuỗi `downloadAndSave(`**
  file: `scripts/media-library/check-no-dormant-fetch.sh`:21
  severity: medium
  AC: AC-10
  evals.yaml E27 (dòng 263) khẳng định "Guard đếm caller bằng cách phân giải định danh". Script chỉ chạy `grep -rn "downloadAndSave("` rồi lọc bỏ file định nghĩa, tên script và các dòng bắt đầu bằng //, /* hoặc *. Đó là đo sự có mặt của một chuỗi ký tự, không phải phân giải symbol: một caller nhập đổi tên (`import { downloadAndSave as dl }` rồi gọi `dl(url)`), gọi qua thuộc tính (`fileUtils.downloadAndSave (url)` có khoảng trắng), hay gọi trong file .mjs/.js (guard chỉ --include *.ts/*.tsx) đều đi lọt và guard vẫn in "callers: (none)". Bộ lọc comment cũng chỉ bỏ comment ở ĐẦU dòng, nên một lời gọi thật nằm sau `*` đầu dòng bị bỏ qua.
  rationale: AC-10 tự gọi đây là 'tiêu chí về call-site' — downloadAndSave() không được có caller nào trong cây; guard grep chuỗi bỏ lọt import đổi tên, gọi qua thuộc tính, hay file .mjs/.js, nên bảo đảm 'không caller' của AC-10 chưa thực sự được chứng minh.
  source: measurement

- **Hình dạng 1 — E3 tuyên "quét đồ thị import", thực tế grep một tiền tố alias**
  file: `scripts/media-library/check-no-boot-dependency.sh`:15
  severity: medium
  AC: AC-2
  evals.yaml E3 (dòng 52) hứa "quét đồ thị import" và còn nêu răng "một guard chỉ grep tên package sẽ xanh trên fixture đó". Nhưng guard chính là `grep -rln "@/lib/media-library/" src` lọc qua một regex allow-list. Nó chỉ bắt được import viết bằng alias `@/`: một import tương đối từ layout/provider (`import { searchVideos } from "../../lib/media-library/client.server"`) — đúng kiểu quan hệ boot-time mà bảo đảm #2 của ADR-0012 muốn cấm — không khớp chuỗi nào và guard exit 0. Ngoài ra allow-list `components/workspace/nodes/add/(add-)?media-` khớp theo tiền tố tên file nên bất kỳ file mới nào đặt tên bắt đầu bằng `media-` trong thư mục đó đều tự động được miễn, không cần khai.
  rationale: AC-2 đòi máy chưa từng cấu hình media-library vẫn khởi động và hoạt động bình thường — không lỗi khởi động, không route hỏng; guard được cho là canh việc không có phụ thuộc boot-time nhưng chỉ grep alias `@/`, bỏ lọt import tương đối, nên bảo đảm boot-safety của AC-2 chưa được chứng minh đầy đủ.
  source: measurement

- **Hình dạng 5 — E17 tuyên ba guard, vế "quá hạn chờ bị huỷ" không có assert nào**
  file: `_acceptance/add-media-library/evals.yaml`:180
  severity: low
  AC: AC-10
  E17 expected liệt kê ba vế đo: từ chối http://, cắt/báo khi vượt trần kích thước, và "phản hồi treo quá hạn chờ bị huỷ". import.server.test.ts (cmd unit_aml_import) có test cho vế 1 (dòng 104-124), vế 2 (dòng 271-310 và readCapped dòng 321-371), nhưng không có bất kỳ test nào chạm timeout: không fake timer, không AbortSignal, không stream treo. Cơ chế tồn tại trong impl (import.server.ts:28 DOWNLOAD_TIMEOUT_MS, :89 AbortSignal.timeout) nhưng chưa bao giờ bị đo — đặt DOWNLOAD_TIMEOUT_MS thành 0 hoặc bỏ hẳn signal vẫn xanh toàn bộ suite.
  rationale: AC-10 đòi một phản hồi vượt trần kích thước hoặc quá hạn chờ phải bị cắt thay vì nuốt hết bộ nhớ; nhánh quá-hạn-chờ của E17 (vốn ánh xạ tới AC-10) không có bất kỳ test nào chạm timeout, nên phần đó của AC-10 chưa được chứng minh.
  source: measurement

- **Hình dạng 5 — E18 tuyên đo cả bảng Content-Type của /api/uploads, test chỉ đo extensionFor**
  file: `_acceptance/add-media-library/evals.yaml`:188
  severity: low
  AC: AC-11
  E18 expected: "Và với key sinh ra, bảng Content-Type của /api/uploads phải trả kiểu phát được", và paths của E18 khai src/app/api/uploads/[...path]/route.ts. cmd của E18 là unit_aml_ext = `pnpm vitest run src/lib/media-library/extension.test.ts`, và file đó chỉ gọi extensionFor(url, contentType) — không import, không dựng request tới route uploads, không đọc bảng mime của nó. Quan hệ thật sự mang rủi ro (đuôi lưu trong kho -> Content-Type route phát ra, chính là lý do allow-list chặn .svg) vì thế không được đo ở đâu cả; một bảng mime lệch trong route uploads vẫn xanh.
  rationale: AC-11 đòi đuôi file đúng đủ để /api/uploads/<key> trả Content-Type phát được trên canvas; E18 chỉ gọi extensionFor và không hề chạm route uploads hay bảng mime của nó, nên nửa sau của chuỗi nhân quả AC-11 mô tả chưa được đo.
  source: measurement

- **Hình dạng 5 — E12 tuyên "số assert bằng số trường", guard dùng một regex alternation và in số đếm cứng**
  file: `scripts/media-library/check-no-domain-vocab.sh`:51
  severity: low
  AC: AC-7
  evals.yaml E12 (dòng 136) hứa "MA TRẬN 8 TRƯỜNG ... (số assert bằng số trường)". Guard thực hiện bằng đúng hai lời gọi grep với alternation (dòng 36 và 42), nên không có phép đo riêng cho từng trường: gõ sai hoặc xoá một nhánh trong biến FIELDS/VOCAB không làm gì đỏ. Dòng 51 lại in "(8 fields checked, 18 literals checked)" — hai con số viết cứng trong chuỗi echo, không suy ra từ FIELDS/VOCAB — nên bản in bằng chứng vẫn khẳng định 8/18 kể cả khi danh sách đã ngắn đi. Thêm nữa phép kiểm union (dòng 42) chỉ khớp nháy kép trong khi phép kiểm từ vựng (dòng 36) khớp cả nháy đơn lẫn nháy kép.
  rationale: AC-7 (bảo đảm #3, cấm hardcode ngữ vựng lĩnh vực) được guard này canh; guard chỉ chạy hai lời gọi grep alternation thay vì một phép đo riêng cho từng trường, và in cứng số đếm 8/18 không suy ra từ danh sách thật, nên bảo đảm 'không hardcode ngữ vựng' của AC-7 chưa được chứng minh chặt như tuyên bố.
  source: measurement


## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **External REST responses are cast (`body as T`) with no shape validation — a malformed 200 crashes the canvas instead of producing a failure outcome**
  Người dùng thấy gì: Nếu dịch vụ media-library từng trả về một phản hồi kỹ thuật là thành công nhưng dữ liệu bên trong bị hỏng hoặc thiếu, cả màn hình làm việc có thể bị sập thay vì hiện một thông báo lỗi bình thường.
  file: `src/lib/media-library/client.server.ts`:129
  severity: medium
  `call<T>()` validates config, `contracts_version` and HTTP status, then returns `{ ok: true, data: body as T }` with zero shape checking. CLAUDE.md's "contract enforcement: compile-time only" rule is scoped to the ABI/plugin boundary (TS types from `pnpm gen:abi` + generated Pydantic models); this is a third-party REST boundary where the global rule "ALWAYS validate at system boundaries" applies, and the feature elsewhere is careful (`detail.data.urls?.original ?? ""` in import.server.ts:176). Concretely: a 200 with `contracts_version: "0.2.0"` but `cards: null` (or cards missing `renditions`) flows through search/route.ts:72 untouched, reaches the node as `body.cards as MediaCard[]` (add-media-library-node.tsx:98), and then `outcome.cards.length` / `card.renditions.thumb_url` (media-card-list.tsx:43) throws a TypeError **inside React render**, taking down the workspace rather than showing the BAD_RESPONSE state the taxonomy already defines. A narrow guard on the success payload (cards is an array; each card has `id`, `caption`, `renditions.thumb_url`) mapping to the existing `BAD_RESPONSE` code would close it without introducing a validator framework.
  rationale: Không AC nào yêu cầu node chống chịu một 200 hợp lệ nhưng sai hình dạng payload; AC-6 chỉ định danh 8 ca lỗi HTTP/JSON/mạng, không phải 200 méo mó.
  Đề xuất: known-limits
  source: conventions

- **Missing-config panel renders the server's hardcoded Vietnamese sentence to every locale; the `missingConfig` key added to all 5 message files is dead**
  Người dùng thấy gì: Người dùng OneFlow bằng tiếng Anh, Nhật, Hàn hoặc Trung sẽ thấy lời giải thích thiếu-cấu-hình được viết bằng tiếng Việt thay vì ngôn ngữ họ đang dùng.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`:85
  severity: medium
  The node forwards the server's `failure.message` into `MediaLibraryConfigPanel`, which renders it verbatim (`media-library-config-panel.tsx:92`). That string is built in `config.server.ts:35` as `"Chưa gọi được media-library: thiếu …"`, so an en/ja/ko/zh user sees Vietnamese. This contradicts the feature's own stated rule — the comment at add-media-library-node.tsx:262-267 says "The server's own message is Vietnamese and stays where it belongs — the server log — instead of landing in front of an en/ja/ko/zh user" — and the failure path honours it via `failureMessageKey()` while the missing-config path does not. The diff adds a translated `addMediaLibrary.missingConfig` key to en/ja/ko/vi/zh, and `outcomeMessageKey()` returns `"missingConfig"`, but `t("missingConfig")` is never called anywhere in production code (only the proto supplies its own copy). Fix: render `t("missingConfig")` for the sentence and keep using `failure.missing` (already sent as data) for the field list.
  rationale: AC-1 chỉ đòi thông điệp thiếu-cấu-hình chứa đúng tên biến còn thiếu, không đòi hỏi bản dịch theo ngôn ngữ hiển thị.
  Đề xuất: known-limits
  source: conventions

- **New `.next-dev` dist dir is gitignored but not excluded in biome.json, so `pnpm lint:check` scans generated dev output**
  Người dùng thấy gì: Người phát triển dùng chế độ chạy dev mới có thể thấy công cụ kiểm tra chất lượng mã báo lỗi trên các file được sinh tự động mà lẽ ra không cần kiểm tra, gây nhiễu hoặc chặn nhầm quy trình phát hành.
  file: `biome.json`:12
  severity: medium
  `next.config.ts:31` introduces `distDir: process.env.NEXT_DIST_DIR || ".next"` and `.gitignore` adds `.next-dev/`, but `biome.json`'s `files.includes` only excludes `"!.next"`, `"!**/.next"`, `"!out"`, `"!build"` — none of which match `.next-dev`. Any developer following the new dev flow gets `pnpm lint:check` red with hundreds of violations in generated files, and CLAUDE.md's Commit/PR checklist makes `pnpm lint:check` mandatory; the branch's own evidence-report.md records exactly this failure (`.next-dev/server/_rsc_src_i18n_messages_zh_json.js format errors`). Compounding it, the next.config.ts comment is stale and contradicts the change it documents: it says "Point it at `build`, which .gitignore and biome.json already exclude — no new ignore entry, no config loosened", yet nothing points at `build`, a new `.gitignore` entry was added, and biome was not updated. Either add `"!.next-dev"` / `"!**/.next-dev"` to biome.json, or actually use `build` as the comment claims. Same class of issue affects `tsconfig.json`, whose `include` names `.next/types/**` and gets rewritten by Next when `NEXT_DIST_DIR` is set.
  rationale: Đây là vấn đề cấu hình công cụ build/lint nội bộ, không nằm trong bất kỳ tiêu chí Given/When/Then nào của hợp đồng.
  Đề xuất: known-limits
  source: conventions

- **A11y check script discards uncommitted `tsconfig.json` changes via `git checkout --` in an EXIT trap**
  Người dùng thấy gì: Chạy script kiểm tra khả năng tiếp cận có thể âm thầm xoá mất các thay đổi chưa lưu của một người phát triển trong file cấu hình dự án, mà không hề có cảnh báo nào.
  file: `scripts/media-library/check-a11y-proto.sh`:16
  severity: medium
  `restore_tsconfig() { git -C "$ROOT" checkout -- tsconfig.json 2>/dev/null || true; }` is registered with `trap … EXIT`, so every run of the script — including a failed one, or one interrupted with Ctrl-C — hard-reverts `tsconfig.json` to HEAD. It does not distinguish Next's own rewrite (the case it's meant to undo) from a developer's uncommitted edit to that file, and there is no stash/backup, so real work is silently destroyed. No other script under `scripts/` in this repo mutates tracked files this way. Safer shapes: snapshot the file to a temp path before the scan and restore only from that snapshot, or check `git diff --quiet -- tsconfig.json` first and skip the restore when the file was already dirty on entry.
  rationale: Đây là rủi ro của một script hỗ trợ phát triển, không phải hành vi sản phẩm mà AC-15 (hay AC nào khác) mô tả.
  Đề xuất: known-limits
  source: conventions

- **Failure-code → HTTP status map is duplicated verbatim across the two new routes**
  Người dùng thấy gì: Nếu sau này hai bảng mã lỗi liên quan bị cập nhật không đồng bộ, người dùng có thể thấy hai phản hồi lỗi khác nhau cho cùng một vấn đề, tuỳ vào việc họ đang tìm kiếm hay đang nạp một đoạn clip.
  file: `src/app/api/media-library/import/route.ts`:7
  severity: low
  The identical 11-entry `const STATUS: Record<string, number>` block appears in both `src/app/api/media-library/import/route.ts:7-19` and `src/app/api/media-library/search/route.ts:12-24`, along with an identical catch-all `?? 502` and the same duplicated LOCAL_FAILURE catch block. The feature otherwise centralises its taxonomy carefully (`errors.ts` owns the codes, `media-library-outcome.ts` owns the status→code inverse for the client), so the one table that maps codes to statuses being copied is an outlier and drifts silently: adding a code to `MediaLibraryErrorCode` and updating only one route yields a different HTTP status for search vs import. Move it next to the taxonomy it belongs to (e.g. `statusFor(code)` exported from `errors.ts`) and have both routes call it.
  rationale: Trùng lặp mã nguồn là vấn đề bảo trì, không có AC nào yêu cầu một nguồn sự thật duy nhất cho bảng ánh xạ này.
  Đề xuất: known-limits
  source: conventions

- **Mid-download failure (incl. the 120s timeout) is reported as LOCAL_FAILURE, blaming the user's machine**
  Người dùng thấy gì: Khi việc tải một đoạn clip thất bại hoặc quá thời gian chờ vì sự cố mạng, ứng dụng có thể báo nhầm rằng lỗi nằm ở máy của người dùng thay vì chỉ ra đúng là mạng hoặc dịch vụ nguồn.
  file: `src/lib/media-library/import.server.ts`:159
  severity: high
  readCapped()'s streaming loop (`await reader.read()`) has no try/catch, and importAsset() has none either. Any error raised while the body is streaming — socket reset, upstream truncation, and critically the `AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS)` set in fetchGuarded — rejects out of importAsset instead of returning a MediaLibraryFailure. The only catch left is the one in src/app/api/media-library/import/route.ts:58, which by design classifies any throw as `LOCAL_FAILURE` 500 ("OneFlow không hoàn tất được việc này ở phía máy của bạn" / "check the app's log"). This is the exact misdirection errors.ts:23-29 says LOCAL_FAILURE exists to prevent, only inverted: a remote/network problem is reported as a local disk problem. It matters most for the primary timeout path — a 2-minute download timeout on a large clip fires during body streaming, essentially never during the initial fetch, so the guarded NETWORK_ERROR arm in fetchGuarded (line 91) is unreachable for the timeout it was configured for. Confirmed with a temporary vitest probe: with the asset detail served normally and the byte stream erroring after the first chunk, `importAsset("a")` rejects rather than resolving to `{ok:false, failure:{code:"NETWORK_ERROR"}}`. Fix: wrap the stream read (and ideally the whole importAsset body) and map a read/abort error to NETWORK_ERROR.
  rationale: AC-6 (định danh nguyên nhân đúng) áp cho ranh giới gọi API media-library ở mục Tìm trong kho; AC-10 chỉ đòi cắt/báo khi vượt trần kích thước hoặc quá hạn chờ, không đòi định danh đúng nguyên nhân mạng khi đang tải bytes.
  Đề xuất: known-limits
  source: bugs

- **missing-config state renders the server's Vietnamese sentence to every locale; the translated key is dead**
  Người dùng thấy gì: Người dùng không nói tiếng Việt sẽ thấy thông điệp thiếu-cấu-hình trên bảng này được viết bằng tiếng Việt thay vì được dịch sang ngôn ngữ họ đã chọn.
  file: `src/components/workspace/nodes/add/media-library-config-panel.tsx`:92
  severity: medium
  resolveConfig() (config.server.ts:35) builds a Vietnamese message, the route returns it verbatim, add-media-library-node.tsx:85 stores it as `outcome.message`, and the panel prints it raw at `<p className="text-sm text-foreground">{message}</p>`. So en/ja/ko/zh users see "Chưa gọi được media-library: thiếu MEDIA_LIBRARY_URL và MEDIA_LIBRARY_API_KEY." This is the same defect the code explicitly fixed for the failure path — media-library-outcome.ts:107-118 says "The server's own message is Vietnamese and belongs in logs" and the node correctly uses `t(failureMessageKey(...))` for `kind:"failure"`. The translated replacement already exists: `Workspace.nodes.addMediaLibrary.missingConfig` is present in all five of en/vi/ja/ko/zh, and `outcomeMessageKey()` returns "missingConfig" for this state — but grep shows nothing ever calls `t("missingConfig")`; `messageKey` is only compared against "thinShelf" (add-media-library-node.tsx:249). Pass `t("missingConfig")` into the panel instead of `outcome.message`.
  rationale: Cùng lý do với finding tương tự ở add-media-library-node.tsx: AC-1 không đòi bản dịch, chỉ đòi tên biến xuất hiện đúng.
  Đề xuất: known-limits
  source: bugs

- **MISSING_CONFIG on the import path degrades to the generic error line and never opens the config panel**
  Người dùng thấy gì: Nếu khoá thư viện của bạn bị mất hiệu lực hoặc bị xoá trong lúc bạn đang xem kết quả tìm kiếm, việc bấm nạp một đoạn clip có thể chỉ hiện dòng lỗi chung chung thay vì đưa bạn tới màn hình để sửa lại khoá.
  file: `src/components/workspace/nodes/add/media-library-outcome.ts`:94
  severity: medium
  FAILURE_KEYS omits "MISSING_CONFIG", so failureMessageKey("MISSING_CONFIG") falls through to the generic "error" key. importAsset -> getAsset -> call() can return MISSING_CONFIG (client.server.ts:26), and the import route maps it to 400 — but pick() in add-media-library-node.tsx:129-136 has no MISSING_CONFIG branch (unlike search() at line 78), so it sets `{kind:"failure", code:"MISSING_CONFIG"}`. Result: the user gets "The library call did not go through." with no config panel and no variable names, even though the server sent both the code and the `missing` array. Reachable whenever the stored keys change or are cleared between the search and the pick. Secondary: STATUS_TO_CODE maps 400 -> BAD_REQUEST, so when the import route's body cannot be parsed the same state is mislabelled again. Either add MISSING_CONFIG to FAILURE_KEYS or, better, route it to the config panel in pick() the way search() does.
  rationale: AC-1 chỉ khai When là 'mở node và bấm tìm'; ca này xảy ra ở bước chọn thẻ/nạp (pick), một đường khác không nằm trong Given/When của AC-1.
  Đề xuất: known-limits
  source: bugs

- **Config-panel save can still wipe every other stored BYO key: an unreadable env store reads as {}**
  Người dùng thấy gì: Trong một trường hợp hiếm khi OneFlow không đọc được đúng cấu hình đã lưu, việc lưu khoá media-library từ màn hình này có thể âm thầm xoá mất mọi khoá và cài đặt khác bạn đã lưu trước đó.
  file: `src/components/workspace/nodes/add/media-library-config-panel.tsx`:57
  severity: low
  The comment at lines 44-47 states the read is load-bearing because PUT /api/settings/env replaces the whole map, and the guard refuses to write "unless the read really produced a map". But loadEnvStore() (src/lib/settings/env-store.server.ts:41) catches every read/decode failure and returns `{}`, and GET answers 200 with `{env:{}}` — indistinguishable from a genuinely empty store. So on a corrupt or undecryptable settings blob (e.g. a cloud shell whose encode/decode key changed) `payload.env` is a valid empty object, the guard passes, `next` becomes just the two media-library keys, and the PUT deletes every other stored key. The guard as written only catches a missing/array `env` field, which the route never produces. Note this is the same read-then-replace shape as the pre-existing src/components/workspace/nodes/base/abi-node-shell.tsx:107-113, so it is not a regression — but the new code's own comment claims the hole is closed and it is not. A PATCH-style merge endpoint, or having GET distinguish 'unreadable' from 'empty', would close it.
  rationale: AC-1 chỉ đòi người dùng tới được chỗ nhập hai khoá và tìm lại thành công; không AC nào đòi hỏi việc lưu phải bảo toàn các khoá khác đã lưu trước đó, và finding tự nhận đây không phải hồi quy so với mã đã có từ trước.
  Đề xuất: known-limits
  source: bugs

- **a11y guard's EXIT trap silently discards uncommitted edits to tsconfig.json**
  Người dùng thấy gì: Chạy script kiểm tra khả năng tiếp cận có thể âm thầm xoá mất các thay đổi chưa lưu của một người phát triển trong file cấu hình dự án, mà không có cảnh báo nào.
  file: `scripts/media-library/check-a11y-proto.sh`:16
  severity: low
  `restore_tsconfig() { git -C "$ROOT" checkout -- tsconfig.json 2>/dev/null || true; }` is installed as an EXIT trap, so every run of this script hard-reverts tsconfig.json to HEAD regardless of why it exited — including a run where the developer had deliberate uncommitted edits in that file. The `2>/dev/null || true` means the discard is also unreportable. The stated goal (undo Next's rewrite of `include` when NEXT_DIST_DIR is set) can be met without destroying user state by snapshotting the file to a temp path before the scan and restoring only that snapshot.
  rationale: Cùng lý do với finding trước về script này: rủi ro công cụ phát triển, không phải hành vi sản phẩm mà một AC mô tả.
  Đề xuất: known-limits
  source: bugs

- **Hình dạng 5 — E28 tuyên "mỗi fixture, thừa hoặc thiếu trường đều đỏ", test chỉ soi một fixture và chỉ chiều thừa**
  Người dùng thấy gì: Các kiểm tra tự động nhằm phát hiện lệch giữa dữ liệu thử của OneFlow và các trường dữ liệu thật của dịch vụ media-library chỉ soi được một phần nhỏ dữ liệu đó, nên một số kiểu lệch có thể không bị phát hiện cho tới khi nó gây ra lỗi thật cho người dùng.
  file: `src/lib/media-library/__fixtures__/provenance.test.ts`:22
  severity: medium
  evals.yaml E28 (dòng 271) hứa: "tập TÊN TRƯỜNG của MỖI fixture khớp ĐÚNG bảng trường... thừa một trường hoặc thiếu một trường đều đỏ". Thực tế: (a) chỉ VIDEO_CARD được kiểm (dòng 22) — CARD_WITH_LICENSE, CARD_UNKNOWN_VOCAB, CARD_NULL_ENTITY không đi qua unknownFields, mà đó mới là các fixture mang license_label/scene_kind/energy, tức các trường dễ trôi nhất; (b) unknownFields chỉ tính phần THỪA (`Object.keys(card).filter(k => !CARD_FIELDS.includes(k))`) — không có phép so chiều ngược, nên xoá một tên khỏi CARD_FIELDS (ví dụ "license_label") không làm test nào đỏ; (c) check-fixture-provenance.sh chỉ grep header trên cards.ts, trong khi stub-server.ts — file mã hoá hình dạng envelope search (cards/context/candidates/skipped/warnings/contracts_version) — không có PROVENANCE/READ-ON và không bị guard nào chạm, dù E28 nói "mỗi file fixture của máy chủ giả".
  rationale: E28 phục vụ mục 'Known limits' về việc fixture không trôi so với hợp đồng thật của library — đây là hạn chế đã khai trong hợp đồng, không phải một Criteria/AC được đánh số, nên một guard yếu hơn tuyên bố không làm AC nào thất bại.
  Đề xuất: known-limits
  source: measurement


⚠ Cụm ngoài vùng phủ: 9/21 lỗi rơi vào file không bộ đo nào phủ (biome.json, scripts/media-library/check-a11y-proto.sh, scripts/media-library/check-no-dormant-fetch.sh, scripts/media-library/check-no-boot-dependency.sh, _acceptance/add-media-library/evals.yaml, scripts/media-library/check-no-domain-vocab.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
