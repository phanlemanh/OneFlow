## Trong hợp đồng

- **SSRF host guard misses IPv4-mapped IPv6 and only checks the literal hostname, never the resolved address**
  file: `src/lib/media-library/import.server.ts:32`
  severity: medium
  AC: AC-10
  `PRIVATE_HOST` is the single boundary check on a URL that comes from an outside service and is re-applied per redirect hop (fetchGuarded). Verified in Node: `new URL("http://[::ffff:127.0.0.1]/").hostname` normalizes to `[::ffff:7f00:1]`, which the regex does not match — so a signed URL (or any 302 hop) of that form passes the guard and undici connects to loopback. `100.64.0.0/10` (CGNAT) is likewise unmatched. WHATWG normalization does cover the decimal/octal forms (`http://2130706433/`, `http://0177.0.0.1/` → `127.0.0.1`, both correctly refused), so those are fine. Two residual holes remain: the IPv6-mapped forms above, and any public hostname that DNS-resolves to a private address — the check runs on the literal host, never on the resolved IP, so `internal.example.com → 10.0.0.5` sails through every hop. Extend the pattern to `::ffff:` mapped addresses and 100.64/10, or resolve the host and test the resulting address.
  rationale: AC-10 đòi route từ chối tải khi urls.original trỏ tới một host nội bộ; guard hiện chỉ so khớp theo dạng chữ nên một số dạng host nội bộ (IPv6 ánh xạ, dải CGNAT, tên miền phân giải nội bộ) đi lọt qua đúng lỗ mà AC-10 yêu cầu phải chặn.
  source: conventions

- **Non-JSON error bodies lose their HTTP status → every 401/403/404 from a proxy becomes BAD_RESPONSE**
  file: `src/lib/media-library/client.server.ts:63`
  severity: high
  AC: AC-6
  `call()` parses the body (`await response.json()`) BEFORE it looks at `response.ok`. When the parse fails it returns `{code:"BAD_RESPONSE"}` and returns immediately — `classify(response.status, errorField)` at lines 110-113 is never reached. Any error response that is not JSON therefore loses its status entirely. That is the normal case for infrastructure in front of the service: an nginx/CDN/API-gateway 401, 403, 404 or 502 ships an HTML page, not JSON. The user is then told (i18n key `failure.BAD_RESPONSE`) "The library answered in a shape this version does not accept" for what is actually a rejected key or a missing scope — i.e. the real cause is swallowed and the user is pointed at the wrong action. This is exactly the case the comment at lines 85-88 claims to accommodate ("Error bodies are the one place the field may legitimately be missing — a proxy's own 502 page"), but a proxy's 502 page is not JSON at all, so that accommodation is unreachable. The test matrix in client.server.test.ts only exercises `nonJsonBody` with status 200 (stub-server.ts:91-95), so no test covers a non-JSON *error* body. Fix: check `!response.ok` first (or keep `response.status` when the parse fails) so `classify()` still runs on a non-JSON error body.
  rationale: AC-6 đòi phân loại tám ca lỗi dựa trên mã HTTP cộng trường error; đọc body trước khi kiểm response.ok làm mất mã trạng thái trên mọi thân lỗi không phải JSON, khiến các ca như 401/403/404 không còn phân biệt được — đúng điều AC-6 cấm.
  source: bugs

- **Any thrown server error is reported to the user as "could not reach the library"**
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx:101`
  severity: medium
  AC: AC-6
  Both `search()` (line 48) and `pick()` (line 101) call `await response.json()` before checking `response.ok`, inside a try/catch whose only handler sets `{code:"NETWORK_ERROR", message:t("error")}` — "Could not reach the library." Neither route handler wraps its work in try/catch: `src/app/api/media-library/import/route.ts:46` calls `importAsset(assetId)` bare, and `search/route.ts:43` calls `searchVideos(intent)` bare. `importAsset` ends in `saveFile(read.buffer, ext)` (import.server.ts:221), which throws on any storage failure — disk full, permission denied, storage backend down — and `Buffer.concat` on a near-1 GiB body can throw too. A throw there produces a Next.js 500 whose body is an HTML error page, so the client's `response.json()` throws and the node displays "Could not reach the library." So a purely local failure (OneFlow's own file store) is presented to the user as a network problem with the remote library, and the only real signal is a server-side log line the user never sees. Fix: parse JSON only after checking `response.ok` (and handle the parse failure distinctly), and give both routes a catch that returns a typed failure.
  rationale: Một lỗi server ném ra tạo thân phản hồi không phải JSON — chính là một trong tám ca của AC-6 — nhưng bị gộp chung vào một thông điệp "lỗi mạng", vi phạm yêu cầu của AC-6 rằng mỗi ca phải phân biệt được và thông điệp phải gọi đúng tên nguyên nhân.
  source: bugs

- **Private-host guard misses IPv4-mapped IPv6, ULA, and non-dotted IPv4 forms**
  file: `src/lib/media-library/import.server.ts:33`
  severity: low
  AC: AC-10
  `PRIVATE_HOST` is a literal-form regex over `url.hostname`: `/^(localhost$|127\.|0\.0\.0\.0$|169\.254\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1)/i`. It only recognises hosts spelled in dotted-decimal or as the exact string `::1`. Forms that reach the same private targets are not matched and pass the guard on every hop of `fetchGuarded`: `[::ffff:127.0.0.1]` (IPv4-mapped IPv6 loopback), `[fd00::1]`/`[fc00::…]` (IPv6 unique-local), `2130706433`/`0177.0.0.1`/`0x7f.1` (non-dotted IPv4 spellings of 127.0.0.1, all accepted by Node's URL parser and resolver), and any DNS name that resolves to a private address. The https requirement at line 57 limits the reachable set, so this is not the metadata-service hole the guard's own tests cover — but it does mean a redirect to an https service on the host's private network passes a check written to refuse exactly that. Fix: resolve/normalise the host (or match on the parsed IP) rather than on its textual spelling.
  rationale: Cùng guard mà AC-10 đòi phải từ chối mọi host nội bộ; các dạng địa chỉ khác (IPv6 ánh xạ, ULA, IPv4 không chấm) đi lọt qua vì guard chỉ so khớp theo dạng chữ viết, không theo địa chỉ thật.
  source: bugs

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **tsconfig.json committed reformatted (2-space) — `pnpm lint:check` fails, CI Lint job goes red**
  Người dùng thấy gì: Bản vá này có thể khiến bước kiểm tra code tự động báo lỗi trên toàn bộ dự án, làm chậm việc đưa các thay đổi khác lên vì bị chặn bởi một lỗi không liên quan tới tính năng.
  file: `tsconfig.json`
  severity: high
  Đề xuất: known-limits

- **New `.next-dev` dist dir is not excluded in biome.json, so lint scans generated dev output**
  Người dùng thấy gì: Người phát triển nào làm theo quy trình dùng thư mục build mới sẽ thấy công cụ kiểm tra code báo đỏ hàng loạt lỗi không liên quan tới tính năng, gây mất thời gian tìm hiểu nhầm hướng.
  file: `biome.json`
  severity: medium
  Đề xuất: known-limits

- **Missing-config panel renders the server's raw Vietnamese sentence to every locale; the translated `missingConfig` key added to all 5 message files is never used**
  Người dùng thấy gì: Người dùng dùng giao diện tiếng Anh, Nhật, Hàn hay Trung vẫn thấy thông báo thiếu cấu hình hiện bằng tiếng Việt, dù bản dịch cho ngôn ngữ của họ đã có sẵn nhưng không được dùng tới.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`
  severity: medium
  Đề xuất: known-limits

- **Duplicated failure-code → HTTP status map across the two new routes**
  Người dùng thấy gì: Nếu sau này chỉ một trong hai nơi được cập nhật, người dùng có thể nhận một thông báo lỗi không nhất quán tuỳ vào việc họ đang tìm kiếm hay đang nạp asset.
  file: `src/app/api/media-library/import/route.ts`
  severity: low
  Đề xuất: known-limits

- **Node props typed as bare `NodeProps` instead of the repo's `RfDataNodeProps<...>`**
  Người dùng thấy gì: Không có tác động nào người dùng nhìn thấy được; đây thuần là cách viết code khác kiểu mẫu chung của các node khác, không ảnh hưởng đến trải nghiệm sử dụng.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`
  severity: low
  Đề xuất: known-limits

- **Picking a second card while an import is in flight collapses the result list and starts a concurrent import**
  Người dùng thấy gì: Nếu người dùng bấm chọn một thẻ khác trong lúc thẻ trước đang được nạp, danh sách kết quả họ đang xem có thể biến mất bất ngờ và kết quả nạp cuối cùng có thể không khớp với thẻ họ vừa chọn.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`
  severity: medium
  Đề xuất: known-limits

- **MISSING_CONFIG on the import path renders the generic error, never the config panel**
  Người dùng thấy gì: Nếu cấu hình khoá bị mất đúng vào lúc giữa bước tìm kiếm và bước bấm nạp, người dùng chỉ thấy một thông báo lỗi chung chung thay vì được đưa thẳng tới màn hình nhập lại hai khoá cấu hình.
  file: `src/components/workspace/nodes/add/media-library-outcome.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — đo CHỈ DẪN thay vì ĐẦU RA: fixture đặt key mà renderer không hề đọc**
  Người dùng thấy gì: Bài kiểm tra 'thẻ hiện đúng dữ liệu lạ từ kho ngoài' thực chất không đọc các trường dữ liệu đó, nên nếu sau này thẻ hiển thị sai hoặc vỡ khi gặp giá trị mới từ kho ngoài, lỗi đó sẽ không bị phát hiện trước khi phát hành.
  file: `src/components/workspace/nodes/add/add-media-library-node.test.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP mã lỗi nhưng danh sách viết tay 8/10 và bị ghim cứng**
  Người dùng thấy gì: Danh sách mã lỗi dùng để kiểm tra thông báo lỗi bị chốt cứng ở tám trong khi hệ thống thật có mười loại lỗi; nếu về sau có mã lỗi mới bị xử lý sai, bài kiểm tra này sẽ không phát hiện ra.
  file: `src/components/workspace/nodes/add/add-media-library-node.test.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: không ghim mã lỗi nên test đi qua nhánh khác hẳn nhánh nó tuyên**
  Người dùng thấy gì: Bài kiểm tra 'nạp thất bại thì không lưu gì' không xác nhận đúng lý do thất bại, nên một cách triển khai lưu file trước rồi mới kiểm sau — có thể để lại file rác hoặc hỏng — vẫn được xem là đạt.
  file: `src/lib/media-library/import.server.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 — guard a11y đếm chính danh sách URL của mình, không đếm trang thật sự vẽ ra**
  Người dùng thấy gì: Bài kiểm định khả năng tiếp cận cho các trạng thái của node có thể báo 'đạt' ngay cả khi một trang bị lỗi tải hoặc tên trạng thái gõ sai, khiến vấn đề tiếp cận thực tế lọt qua trước khi phát hành.
  file: `scripts/media-library/check-a11y-proto.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đối chiếu với bảng trường cũng viết tay trong cùng file (không round-trip)**
  Người dùng thấy gì: Bài kiểm tra chống lộ từ vựng nội bộ chỉ đối chiếu với một bảng do chính người viết test tự gõ tay và chỉ chạy trên một thẻ mẫu, nên nếu một thẻ mẫu khác thiếu trường dữ liệu, việc đó sẽ không bị phát hiện.
  file: `src/lib/media-library/__fixtures__/provenance.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — assert "tám mã riêng biệt" đọc chính mảng cases của test, không đọc taxonomy**
  Người dùng thấy gì: Bài kiểm tra 'có tám mã lỗi phân biệt' tự so sánh với danh sách do chính nó liệt kê ra, nên không thể phát hiện được trường hợp nhiều mã lỗi khác nhau bị gộp chung một cách sai.
  file: `src/lib/media-library/client.server.test.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/17 lỗi rơi vào file không bộ đo nào phủ (tsconfig.json, biome.json, scripts/media-library/check-a11y-proto.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
