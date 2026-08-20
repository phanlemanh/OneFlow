---
schema_version: 2
feature_slug: add-media-library
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0df11aaa676a26b65902e389328b19e22bc192a2
human_signoff:
---

# Evidence Report: add-media-library

⚠ REJECT: cả 28 eval máy/UI (E1–E24, E26–E29) đều PASS và E25 (judgment) là UNCERTAIN, nhưng hai lệnh KHÔNG gắn eval nào — `pnpm build && pnpm typecheck` và `pnpm lint:check` — FAIL (exit 1) trên đúng cây đã verify (`verified_commit` ở trên). Verdict tổng đã được tính sẵn là REJECT vì hai lệnh này nằm trong checklist commit/PR bắt buộc của CLAUDE.md. `failed_evals` giữ nguyên rỗng vì không eval nào trong 29 eval bị đỏ — nguyên nhân REJECT nằm ngoài danh sách eval, xem section "Lệnh không gắn eval" bên dưới.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | ui-check | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-2 | ui-check | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-3 | ui-check | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | ui-check | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-6 | ui-check | PASS |
| E12 | AC-7 | script | PASS |
| E13 | AC-7 | test | PASS |
| E14 | AC-8 | test | PASS |
| E15 | AC-9 | test | PASS |
| E16 | AC-9 | ui-check | PASS |
| E17 | AC-10 | test | PASS |
| E18 | AC-11 | test | PASS |
| E19 | AC-12 | test | PASS |
| E20 | AC-12 | ui-check | PASS |
| E21 | AC-13 | test | PASS |
| E22 | AC-13 | ui-check | PASS |
| E23 | AC-14 | script | PASS |
| E24 | AC-15 | script | PASS |
| E25 | AC-15 | judgment | UNCERTAIN |
| E26 | AC-10 | test | PASS |
| E27 | AC-10 | script | PASS |
| E28 | AC-3 | script | PASS |
| E29 | AC-1 | ui-check | PASS |

## Lệnh không gắn eval

Hai lệnh bắt buộc trong checklist commit/PR của CLAUDE.md, không gắn với eval nào trong contract, FAIL trên cây `verified_commit` ở trên:

- cmd: `pnpm build && pnpm typecheck`
  exit_code: 1
  output: |
    Failed to compile.

    .next-dev/types/app/api/feature/list/route.ts:3:34
    Type error: Cannot find module 'next/server.js' or its corresponding type declarations.

    > 3 | import type { NextRequest } from 'next/server.js'

    Next.js build worker exited with code: 1 and signal: null
    ELIFECYCLE Command failed with exit code 1.

- cmd: `pnpm lint:check`
  exit_code: 1
  output: |
    .next-dev/server/_rsc_src_i18n_messages_zh_json.js format errors
        13 | + ····/***/·"(rsc)/./src/i18n/messages/zh.json":
        14 | + ········/*!***
        18 | - /***/·((module)·=>·{
        19 | -
        20 | - ...리오의·취득에·실패했습니다.·다시·시도·주세요"}}');
        17 | + ········/***/·(module)·=>·{
        18 | + ············module.exports·=·/*#__PURE__*/·JSON.parse(
    Multiple formatting violations in .next-dev/* generated files
    1 files with lint/suspicious/noTemplateCurlyInString error
    pnpm lint:check failed with exit code 1

Cả hai lỗi trên đều xảy ra trong thư mục `.next-dev/**` (dev dist dir tạo bởi `NEXT_DIST_DIR`), không phải trong code nguồn của feature — xem review-findings.md mục "tsconfig.json committed reformatted" và "New `.next-dev` dist dir is not excluded in biome.json" để biết nguyên nhân gốc. Dù nguyên nhân nằm ngoài phạm vi feature, hai lệnh này vẫn nằm trong checklist commit/PR bắt buộc, nên overall verdict là REJECT cho đến khi được sửa hoặc loại trừ có chủ đích.

Bốn lệnh còn lại không gắn eval đều PASS và không cần liệt vào `## Analyst` (regression-guard suite bình thường):
- `pnpm test` — exit 0, 529 passed | 5 skipped (534)
- `cd sdk && pytest` — exit 0, 245 passed
- `pnpm verify:plugins` — exit 0, `[verify-plugins-scan] OK`
- `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` — exit 0, no diff

## Evidence

- eval: E1
  run_id: minted-add-media-library-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_config
  verified_at: 2026-08-20T08:08:27Z
  output: |
    Tests  4 passed (4)
    Start at  08:08:27
    Duration  91ms (transform 15ms, setup 0ms, import 23ms, tests 2ms, environment 0ms)

- eval: E2
  run_id: minted-add-media-library-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T08:10:00Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E2-step1.png
  observed: |
    Đọc trực tiếp file E2-step1.png (390x844, viewport mobile-first của ui:capture): khung hình hiển thị node "Nạp từ kho" đang mở, dưới ô mô tả cảnh là khối cảnh báo cấu hình: dòng văn bản "Chưa gọi được media-library: thiếu MEDIA_LIBRARY_URL và MEDIA_LIBRARY_API_KEY." rồi ngay dưới là hai field nhập liệu có label monospace hiện NGUYÊN VĂN và đầy đủ: "MEDIA_LIBRARY_URL" (placeholder https://kho.vidu.com) và "MEDIA_LIBRARY_API_KEY" (placeholder "Khoá có scope search"), cùng nút "Lưu rồi tìm lại". Hai tên biến còn thiếu đọc được rõ ràng bằng mắt trong ảnh, không phải câu chung chung "chưa cấu hình dịch vụ" — khớp Expected.
  network_observed: n-a (driver)
  output: |
    Kết luận: cả 2 assertion (HTTP 200 + tên biến hiện nguyên văn, đọc được bằng mắt trong ảnh) đều PASS → exitCode 0. Network: driver là node script gọi puppeteer trực tiếp qua Bash, không có đường đọc network theo hợp đồng của eval này → networkObserved = "n-a (driver)". Frame đã lưu: _acceptance/add-media-library/evidence/E2-step1.png (duy nhất, bước 1 duy nhất có screenshot trong steps).

- eval: E3
  run_id: minted-add-media-library-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_no_boot_dependency
  verified_at: 2026-08-20T08:09:00Z
  output: |
    media-library imported only by its own routes, lib and node — scanned src

- eval: E4
  run_id: minted-add-media-library-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T08:10:00Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E4-step1.png
  observed: |
    E4-step1.png: /workspace mở với khoá thư viện RỖNG (không có MEDIA_LIBRARY_API_KEY trong .env* nào và không có settings.json nào được ghi ở env-store), hiển thị canvas ví dụ mặc định (Add Video → Video → Split Video → Videos(0) → Concat Video → Videos(0)), 6 node react-flow. Có 1 banner xám thông tin "Need 2 tools to run this example / Get the tools" — không liên quan khoá thư viện, không phải banner lỗi, đã tồn tại TRƯỚC khi thao tác nào xảy ra. E4-step2.png: sau khi bấm icon Image trên smart-island toolbar, một node "Add Image" MỚI THẬT SỰ xuất hiện giữa canvas với các tab Upload/Camera/Canvas/Library, tab Upload đang mở — không có thông báo lỗi nào trong node, không banner lỗi toàn cục mới, không toast. nodeCountBefore=6 → nodeCountAfter=7 xác nhận điều khiển dương: node thực sự được thêm (không phải trang trắng đánh lừa assertion âm).
  network_observed: n-a (driver)
  output: |
    Cleanup: xoá script verifier tạm .e4-verify-tmp.mjs khỏi repo (không commit vào codebase). Không tắt server 3000 (không phải server do mình start). KẾT LUẬN: exit 0 — mọi assertion PASS, kể cả điều khiển dương (node mới thật sự được thêm, không phải trang trắng/giả im lặng).

- eval: E5
  run_id: minted-add-media-library-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-20T08:08:27Z
  output: |
    Tests  20 passed (20)
    Start at  08:08:27
    Duration  159ms (transform 31ms, setup 0ms, import 49ms, tests 39ms, environment 0ms)

- eval: E6
  run_id: minted-add-media-library-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T08:10:00Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E6-step1.png
  observed: |
    Đã đọc trực tiếp file _acceptance/add-media-library/evidence/E6-step1.png bằng Read (ảnh). Nội dung thấy được: header "Nạp từ kho" / "add/media-library"; ô nhập mô tả + nút "Tìm"; dòng đếm "3 clip khớp mô tả. Chọn một clip để nạp về workspace."; bên dưới là lưới 3 thẻ (grid-cols-3), MỖI thẻ có ảnh thu nhỏ hình chữ nhật màu tím nhạt (placeholder thumbnail 160x90) và caption bên dưới — thẻ 1 "Ban công hướng ra hồ, nắng chiều" + nhãn "CC-BY", thẻ 2 "Sảnh chờ, máy lia chậm" (không nhãn licence), thẻ 3 "Toàn cảnh từ flycam lúc hoàng hôn" + nhãn "Phối cảnh 3D". Không có danh sách rỗng, không có thẻ thiếu caption. Đối chiếu Expected → KHỚP hoàn toàn, không mâu thuẫn → PASS.
  network_observed: n-a (driver)
  output: |
    Evidence saved: _acceptance/add-media-library/evidence/E6-step1.png (via `pnpm ui:capture` / node scripts/ui-capture.mjs, per config.yaml capture.ui — real file capture, not inline). All 3 assertions PASS → exitCode 0.

- eval: E7
  run_id: minted-add-media-library-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_node
  verified_at: 2026-08-20T08:08:27Z
  output: |
    Tests  9 passed (9)
    Start at  08:08:27
    Duration  644ms (transform 22ms, setup 0ms, import 83ms, tests 19ms, environment 436ms)

- eval: E8
  run_id: minted-add-media-library-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-20T08:08:27Z
  output: |
    Tests  20 passed (20)
    Start at  08:08:27
    Duration  159ms (transform 31ms, setup 0ms, import 49ms, tests 39ms, environment 0ms)

- eval: E9
  run_id: minted-add-media-library-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T08:10:00Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E9-step1.png
  observed: |
    E9-step1.png (state=unranked): frame shows "Nạp từ kho" header, search input, then an amber/orange bordered banner reading "Kết quả chưa xếp hạng theo ngữ nghĩa: kho đang thiếu embedding. Danh sách vẫn đúng bộ lọc, thứ tự không phản ánh độ hợp." directly above the 3-card media grid. E9-step2.png (state=results): same header and search input, but the line directly below the search box is the plain gray text "3 clip khớp mô tả. Chọn một clip để nạp về workspace." — no amber banner of any kind — followed immediately by the same 3-card grid layout. Confirmed by reading both saved PNG files directly.
  network_observed: n-a (driver)
  output: |
    Source cross-check: src/components/proto/add-media-library-proto.tsx COPY.unranked (line 33-34) rendered only inside `case "unranked":` (line 158-166); `case "results":` (line 137-148) has no such element — static confirmation matching the rendered evidence. No code changes made. Evidence frames saved at evidence/E9-step1.png and E9-step2.png.

- eval: E10
  run_id: minted-add-media-library-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-20T08:08:27Z
  output: |
    Tests  20 passed (20)
    Start at  08:08:27
    Duration  159ms (transform 31ms, setup 0ms, import 49ms, tests 39ms, environment 0ms)

- eval: E11
  run_id: minted-add-media-library-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T08:10:00Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E11-step1.png
  observed: |
    Step1 PNG (error): dark-mode proto frame titled "Nạp từ kho" / "add/media-library"; below the read-only search input, red destructive text reads "Khoá media-library không được chấp nhận. Kiểm tra MEDIA_LIBRARY_API_KEY." — names the cause (key rejected) and the exact key variable, matching Expected's requirement that the error frame gọi đúng tên nguyên nhân và nêu tên biến khoá. Step2 PNG (thin-shelf, after retry past two transient concurrent-session failures, both re-verified clean via curl before retrying): muted-gray (non-error styled) text reads "Không clip nào dựng được thẻ cho mô tả này (kho có 37 clip qua bộ lọc). Thử mô tả khác hoặc nới yêu cầu." — talks about the shelf/inventory, not about something being broken, matching Expected. The two frames carry two clearly different sentences with two different implied to-do actions — Expected's failure condition does not hold, so AC-6 passes.
  network_observed: n-a (driver)
  output: |
    networkObserved: n-a (driver) — driver was curl (HTTP status) + node/puppeteer screenshot capture; no read_network_requests-capable browser tool was used. exitCode = 0: every assertion passed on the final (re-verified) evidence.

- eval: E12
  run_id: minted-add-media-library-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_no_domain_vocab
  verified_at: 2026-08-20T08:09:00Z
  output: |
    no domain vocabulary in 26 changed files (8 fields checked, 18 literals checked)

- eval: E13
  run_id: minted-add-media-library-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_node
  verified_at: 2026-08-20T08:08:27Z
  output: |
    Tests  9 passed (9)
    Start at  08:08:27
    Duration  644ms (transform 22ms, setup 0ms, import 83ms, tests 19ms, environment 436ms)

- eval: E14
  run_id: minted-add-media-library-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_node
  verified_at: 2026-08-20T08:08:27Z
  output: |
    Tests  9 passed (9)
    Start at  08:08:27
    Duration  644ms (transform 22ms, setup 0ms, import 83ms, tests 19ms, environment 436ms)

- eval: E15
  run_id: minted-add-media-library-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_import
  verified_at: 2026-08-20T08:08:26Z
  output: |
    Tests  11 passed (11)
    Start at  08:08:26
    Duration  143ms (transform 35ms, setup 0ms, import 53ms, tests 27ms, environment 0ms)

- eval: E16
  run_id: E16-20260820-081200
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T08:12:00Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E16-step1.png
  observed: |
    E16-step1.png (state=importing): dark-themed "Nạp từ kho" node frame. Search row + 3-card grid + muted text: "Đang nạp clip về kho file của bạn… Xong sẽ hiện thành node video trên canvas." Card 1 renders visibly dimmed/greyer than cards 2 and 3 (DOM check: card 1 button disabled=true, opacity 0.6; cards 2-3 disabled=false, opacity 1). E16-step2.png (state=results): same frame, helper line reads "3 clip khớp mô tả. Chọn một clip để nạp về workspace." and all 3 cards render uniformly, no import copy, no locked card. The two frames are visually and structurally distinct.
  network_observed: clean
  output: |
    Network truth (driver = mcp Claude_Browser, read_network_requests + read_console_messages): all requests to http://localhost:3000, all 200 OK, zero console errors. Dumped to evidence/E16-network.txt. Noted caveat: earlier ad-hoc curl polling saw transient 500s consistent with peer-session webpack hot-reload churn, not a defect — both target URLs re-confirmed stable at 200 across 5 consecutive polls; the browser-driven capture used for actual assertions shows clean 200s throughout. All assertions PASS.

- eval: E17
  run_id: minted-add-media-library-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_import
  verified_at: 2026-08-20T08:08:26Z
  output: |
    Tests  11 passed (11)
    Start at  08:08:26
    Duration  143ms (transform 35ms, setup 0ms, import 53ms, tests 27ms, environment 0ms)

- eval: E18
  run_id: minted-add-media-library-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_ext
  verified_at: 2026-08-20T08:08:31Z
  output: |
    Tests  8 passed (8)
    Start at  08:08:31
    Duration  110ms (transform 26ms, setup 0ms, import 38ms, tests 3ms, environment 0ms)

- eval: E19
  run_id: minted-add-media-library-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_wiring
  verified_at: 2026-08-20T08:08:33Z
  output: |
    Tests  3 passed (3)
    Start at  08:08:33
    Duration  129ms (transform 51ms, setup 0ms, import 64ms, tests 2ms, environment 0ms)

- eval: E20
  run_id: minted-add-media-library-E20-r1
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T08:10:00Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E20-step1.html
  observed: |
    Opened Read/grep on saved evidence/E20-step1.html (full DOM outerHTML + inlined CSS snapshot of the live interactive page right after clicking the "Library" icon in the add-node picker). Confirmed: (1) a react-flow node subtree with an svg class "lucide-library" and heading text exactly "Load from library" (English render of vi locale's "Nạp từ kho"). (2) Within that node's subtree, exactly one handle element: data-handleid="out:videoNode" data-handlepos="right", class containing "react-flow__handle-right ... source". This matches the live DOM query taken in-browser via javascript_tool before saving (handleCount=1, {id:"out:videoNode", pos:"right", type:"source"}). Also directly viewed an inline browser screenshot showing the rendered node card on canvas: library-stack icon, "Load from library" title, description textbox, "Search" button, and a handle dot on the card's right edge — matches Expected: the node registered and rendered on the real app (http://localhost:3000/workspace), not a static /proto/{slug} page.
  network_observed: clean
  output: |
    Network truth (Browser pane, read_network_requests + read_console_messages): all app-origin requests 200 OK, plus one GET /api/uploads/example-assets/two-scenes.mp4 → 206 Partial Content (expected byte-range). Several GET /workspace?_rsc=... show as superseded HMR prefetch pattern from concurrent peer-session fast-refreshes, not a settled failure. read_console_messages(onlyErrors) empty. No 4xx/5xx on any app-origin request. All assertions PASS. No code was modified.

- eval: E21
  run_id: minted-add-media-library-E21-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-20T08:08:27Z
  output: |
    Tests  20 passed (20)
    Start at  08:08:27
    Duration  159ms (transform 31ms, setup 0ms, import 49ms, tests 39ms, environment 0ms)

- eval: E22
  run_id: minted-add-media-library-E22-r1
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T08:10:00Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E22-step1.html
  observed: |
    Opened file evidence/E22-step1.html (fallback HTML, saved via curl since capture.ui was unavailable at the time) and read it directly. The document is the full Next.js SSR page for /proto/[slug]?state=error mounting AddMediaLibraryProto. grep confirms: (1) the string "Khoá media-library không được chấp nhận. Kiểm tra MEDIA_LIBRARY_API_KEY." appears exactly once, naming the cause and the env-var variable verbatim; (2) none of the fixture card captions nor the results-count copy appear anywhere — 0 matches, confirming no card list/thumbnail data is rendered in this state. Source review of add-media-library-proto.tsx confirms the `case "error"` branch renders only `<SearchRow />` + `<p>{COPY.error}</p>`, never `<MediaCardList>` — so the absence of cards is by construction, not incidental. Also drove the same URL in the Browser pane for corroboration (not persisted to disk since capture.ui was unavailable then): visually matches the HTML evidence exactly.
  network_observed: no-app-traffic
  output: |
    exitCode = 0: every assertion passed.

- eval: E23
  run_id: minted-add-media-library-E23-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_tier_boundary
  verified_at: 2026-08-20T08:09:00Z
  output: |
    comparing HEAD against origin/main (merge-base 5547aff2f241)
    checked 74 changed file(s) against 9 t3 path rule(s), 2 allowed, 1 required
    OK: only declared t3 paths touched — the declared surface holds

- eval: E24
  run_id: minted-add-media-library-E24-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_a11y_proto
  verified_at: 2026-08-20T08:09:00Z
  output: |
    "verdict": "PASS"
    16/16 pages scanned (eight states x light+dark)

- eval: E26
  run_id: minted-add-media-library-E26-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_route
  verified_at: 2026-08-20T08:08:32Z
  output: |
    Tests  5 passed (5)
    Start at  08:08:32
    Duration  136ms (transform 35ms, setup 0ms, import 21ms, tests 48ms, environment 0ms)

- eval: E27
  run_id: minted-add-media-library-E27-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_no_dormant_fetch
  verified_at: 2026-08-20T08:09:00Z
  output: |
    downloadAndSave() callers: (none) — scanned src

- eval: E28
  run_id: minted-add-media-library-E28-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_fixture_provenance
  verified_at: 2026-08-20T08:08:45Z
  output: |
    Tests  3 passed (3)
    Start at  08:08:45
    Duration  101ms (transform 18ms, setup 0ms, import 25ms, tests 2ms, environment 0ms)

- eval: E29
  run_id: minted-add-media-library-E29-r1
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T08:10:00Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E29-step1.png
  observed: |
    Đã Read trực tiếp file _acceptance/add-media-library/evidence/E29-step1.png. Frame cho thấy: header "Nạp từ kho" (add/media-library), ngay dưới là ô tìm kiếm (readonly) — rồi NGAY TRONG CÙNG khối, không có điều hướng sang màn khác: dòng thông điệp "Chưa gọi được media-library: thiếu MEDIA_LIBRARY_URL và MEDIA_LIBRARY_API_KEY.", tiếp theo là NHÃN + Ô NHẬP "MEDIA_LIBRARY_URL" (placeholder https://kho.vidu.com), NHÃN + Ô NHẬP "MEDIA_LIBRARY_API_KEY" (input type=password, placeholder "Khoá có scope search"), và nút "Lưu rồi tìm lại" ngay dưới hai ô. Khớp Expected: từ chính trạng thái thiếu-cấu-hình có ô nhập cho CẢ HAI biến + một nút lưu, không phải đi tìm màn hình khác.
  network_observed: n-a (driver)
  output: |
    Network: driver dùng curl + Puppeteer-script capture (không phải browser tool có read_network_requests) → networkObserved = "n-a (driver)"; không có evidence/E29-network.txt vì không có kênh đọc network trong driver này. exitCode=0: mọi assertion PASS.

- eval: E25
  judged_by: judge panel — domain-correctness, operational-feasibility, spec-alignment (fresh context)
  proposal: UNCERTAIN
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Không thể chấm AC-15 "chỉ bằng màn hình": không file PNG nào trong 7 file được liệt ở Input tồn tại — thư mục evidence chỉ có các file HTML lỗi/blocked (vd. E2-step1-cannotrun-500.html, E6-step1-error.html, E9-step1/2-BLOCKED-500.html, E11-step2-BLOCKED-500.html) hoặc không có gì khớp tên (E16-step1, E22-step1 không tồn tại dưới bất kỳ hậu tố nào). Theo luật phạm vi, tôi không được tự mở các file HTML đó để thay thế, nên không có ảnh chụp trạng thái node nào để xác nhận hay bác điều mục hỏi.
      required_evidence:
        - Sinh lại ảnh PNG thật tại đúng đường dẫn /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E2-step1.png (hiện chỉ có E2-step1-cannotrun-500.html) — chụp trạng thái node liên quan trên màn hình, không phải HTML dump lỗi.
        - Sinh lại /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E6-step1.png (hiện chỉ có E6-step1-error.html) chụp đúng trạng thái 'lỗi có tên'.
        - Sinh lại /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E9-step1.png và E9-step2.png (hiện chỉ có hai file E9-step1-BLOCKED-500.html / E9-step2-BLOCKED-500.html) chụp chuỗi chuyển trạng thái tương ứng.
        - Sinh lại /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E11-step2.png (hiện chỉ có E11-step2-BLOCKED-500.html).
        - Sinh /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E16-step1.png — hiện không có file nào ứng với E16 trong thư mục evidence.
        - Sinh /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E22-step1.png — hiện không có file nào ứng với E22 trong thư mục evidence.
    - operational-feasibility: UNCERTAIN — Chỉ 1/7 file bằng chứng được liệt kê thực sự tồn tại và đọc được (E6-step1.png — một trạng thái "có kết quả" nền tối, thẻ dựng bình thường); E2-step1.png, E9-step1.png, E9-step2.png, E11-step2.png, E16-step1.png, E22-step1.png đều không có mặt trong thư mục evidence (một số chỉ tồn tại dưới tên khác dạng "*-BLOCKED-500.html"/"*-ERROR-500.html" ngoài phạm vi Input được liệt). AC-15 đòi so sánh hình hài của tám trạng thái trên cả hai nền — với đúng một ảnh, không có căn cứ để nói chặng nào lẫn kệ mỏng/không-xếp-hạng với kết quả sạch, hay chặng nào người ngồi cạnh không phân biệt được.
      required_evidence:
        - File PNG thật (không phải *-BLOCKED-500.html/*-ERROR-500.html) tại evidence/E2-step1.png cho trạng thái thiếu-cấu-hình, chụp trên UI thật chứ không phải trang lỗi 500
        - File PNG thật tại evidence/E9-step1.png và E9-step2.png cho trạng thái kệ mỏng (candidates>0, cards:[])
        - File PNG thật tại evidence/E11-step2.png cho trạng thái đang nạp/nạp xong tương ứng eval E11
        - File PNG thật tại evidence/E16-step1.png cho trạng thái liên quan (đang tìm hoặc lỗi có tên)
        - File PNG thật tại evidence/E22-step1.png cho trạng thái liên quan (kết quả không xếp hạng hoặc lỗi có tên)
        - Một bộ ảnh cặp nền sáng/nền tối cho cùng một trạng thái để so sánh hình hài + kết quả axe-core (0 lỗi critical/serious) theo đúng yêu cầu AC-15
    - spec-alignment: UNCERTAIN — 5 trong 7 file bằng chứng được liệt (E2-step1.png, E9-step2.png, E11-step2.png, E16-step1.png, E22-step1.png) không tồn tại trên đĩa ở đúng tên đó — chỉ có các file *-BLOCKED-500.html/*-cannotrun-500.html cùng gốc, hoặc không có gì. Hai file duy nhất mở được (E6-step1.png, E9-step1.png) là ảnh giống hệt nhau, cùng chụp một trạng thái "kết quả không xếp hạng theo ngữ nghĩa". Với chỉ một trạng thái được nhìn thấy (lặp lại), không thể trả lời câu hỏi E25 đòi so sánh xuyên suốt tám chặng hay xác nhận không chặng nào trình kết quả suy giảm y hệt kết quả sạch.
      required_evidence:
        - Ảnh chụp thật E2-step1.png (trạng thái thiếu cấu hình) — hiện chỉ có E2-step1-cannotrun-500.html, không phải ảnh màn hình
        - Ảnh chụp thật E9-step2.png — hiện chỉ có E9-step2-BLOCKED-500.html
        - Ảnh chụp thật E11-step2.png (khả năng là trạng thái đang nạp) — hiện chỉ có E11-step2-BLOCKED-500.html
        - File E16-step1.png — hiện không tồn tại trong thư mục evidence dưới bất kỳ dạng nào
        - File E22-step1.png — hiện không tồn tại trong thư mục evidence dưới bất kỳ dạng nào
        - Ít nhất một ảnh chụp trạng thái 'có kết quả' SẠCH (không cảnh báo) đặt cạnh ảnh trạng thái 'kệ mỏng' và 'kết quả không xếp hạng' để so sánh hình hài, vì hiện chỉ có ảnh của trạng thái không-xếp-hạng
  rationale: Cả ba lens đều UNCERTAIN vì thời điểm chấm, phần lớn (5-6/7) đường dẫn evidence liệt trong Input của E25 không tồn tại đúng tên PNG — chỉ có các file HTML *-BLOCKED-500/*-cannotrun-500/*-error cùng gốc tên, hoặc không có file nào khớp. Ghi chú: vòng verify NÀY (round hiện tại) đã sinh lại đầy đủ các file PNG/HTML evidence cho E2, E4, E6, E9, E11, E16, E20, E22, E29 (xem các block ui-check ở trên, tất cả PASS) — nhưng panel E25 trên đây phản ánh đúng nguyên văn ba rationale đã chấm, không tự chỉnh sửa hay suy diễn lại; người quyết ở Gate 2 cần xác nhận liệu bộ evidence mới trong Evidence section ở trên đã đủ để giải UNCERTAIN này hay chưa.
  human_override:

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả 28 eval máy/UI (E1–E24, E26–E29) PASS trên `verified_commit`, E25 (judgment AC-15) là UNCERTAIN do panel round trước chấm trên bộ evidence cũ thiếu ảnh — nhưng `pnpm build && pnpm typecheck` và `pnpm lint:check` FAIL (không gắn eval nào, lỗi nằm trong `.next-dev/**` và `tsconfig.json`, xem review-findings.md) → verdict tổng REJECT, quay lại implementation để sửa build/lint trước khi verify lại và tái chấm E25 trên bộ evidence mới.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
