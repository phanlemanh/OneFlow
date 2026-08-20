---
schema_version: 2
feature_slug: add-media-library
verdict: REJECT
failed_evals: ["E16"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2b29e12c7552febdf904a2911cf1eca8f52e0a05
human_signoff:
---

# Evidence Report: add-media-library

⚠ REJECT (round 2): 27/29 eval máy/UI (E1–E15, E17–E24, E26–E29) PASS, E25 (judgment, AC-15) vẫn UNCERTAIN, nhưng **E16 (AC-9, ui-check) FAIL** — bước "đang nạp" → "đã có trong kho" không có trạng thái riêng biệt trong `src/components/proto/add-media-library-proto.tsx`: `state=results` trả về đúng màn hình pre-import (danh sách ảnh thu nhỏ chưa nạp) chứ không phải một xác nhận hậu-nạp. `failed_evals` = `["E16"]`. Ngoài ra `pnpm build && pnpm typecheck` vẫn đỏ (exit 1) như round 1, nhưng nguyên nhân lần này khác hẳn: round 1 là lỗi biên dịch thật (`Cannot find module 'next/server.js'`), round 2 là `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` — pnpm cố xoá `node_modules` và bị chặn vì môi trường sandbox không có TTY để xác nhận, không phải lỗi mã nguồn. `pnpm lint:check` đã CHUYỂN TỪ ĐỎ (round 1) SANG XANH (round 2) — vấn đề `.next-dev/**` bị lint đã được xử lý.

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
| E16 | AC-9 | ui-check | FAIL |
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

- cmd: `pnpm build && pnpm typecheck`
  exit_code: 1
  output: |
    pnpm: Command failed with exit code 1: /opt/homebrew/Cellar/node/26.7.0/bin/node /Users/manh-macmini/.cache/node/corepack/v1/pnpm/11.5.1/bin/pnpm.mjs install
        at getFinalError (file:///Users/manh-macmini/.cache/node/corepack/v1/pnpm/11.5.1/dist/pnpm.mjs:34090:14)
        at makeError (file:///Users/manh-macmini/.cache/node/corepack/v1/pnpm/11.5.1/dist/pnpm.mjs:36397:21)
        at getSyncResult (file:///Users/manh-macmini/.cache/node/corepack/v1/pnpm/11.5.1/dist/pnpm.mjs:38241:10)
        at spawnSubprocessSync (file:///Users/manh-macmini/.cache/node/corepack/v1/pnpm/11.5.1/dist/pnpm.mjs:38201:14)
        at execaCoreSync (file:///Users/manh-macmini/.cache/node/corepack/v1/pnpm/11.5.1/dist/pnpm.mjs:38131:23)
    [ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY] Aborted removal of modules directory due to no TTY
  ghi chú: khác nguyên nhân với round 1 (lúc đó là lỗi biên dịch thật `Cannot find module 'next/server.js'` trong `.next-dev/types/**`). Lần này pnpm tự kích hoạt bước cài lại phụ thuộc trước build và bị chặn vì sandbox không cấp TTY để xác nhận xoá `node_modules` — biểu hiện môi trường/hạ tầng CI cục bộ, chưa xác nhận được là hồi quy mã nguồn. Không gắn eval nào trong contract.

Bốn lệnh còn lại không gắn eval đều PASS (không liệt vào `## Analyst` — regression-guard suite bình thường):
- `pnpm lint:check` — exit 0 (round 1 từng đỏ; nay xanh) — `Checked 491 files in 124ms. No fixes applied.`
- `pnpm test` — exit 0, 570 passed | 5 skipped (575)
- `cd sdk && pytest` — exit 0, 245 passed
- `pnpm verify:plugins` — exit 0, `[verify-plugins-scan] OK`
- `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` — exit 0, no diff

## Evidence

- eval: E1
  run_id: minted-add-media-library-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_config
  verified_at: 2026-08-20T09:27:53Z
  output: |
    Tests  4 passed (4)
    Start at  09:27:53
    Duration  102ms (transform 16ms, setup 0ms, import 24ms, tests 2ms, environment 0ms)

- eval: E2
  run_id: minted-add-media-library-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T09:29:10Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E2-step1.png
  observed: |
    Đọc trực tiếp file ảnh _acceptance/add-media-library/evidence/E2-step1.png (dark theme, viewport 390x844): khung node "Nạp từ kho" hiện đoạn văn "Chưa gọi được media-library: thiếu MEDIA_LIBRARY_URL và MEDIA_LIBRARY_API_KEY." (dòng đầu bị wrap sát mép viewport nhưng dòng 2 "MEDIA_LIBRARY_API_KEY." đọc trọn vẹn bằng mắt). Ngay dưới, hai label monospace in đậm hiển thị NGUYÊN VĂN tên biến: "MEDIA_LIBRARY_URL" (phía trên ô input placeholder "https://kho.vidu.com") và "MEDIA_LIBRARY_API_KEY" (phía trên ô input password placeholder "Khoá có scope search"), cả hai đều đọc được rõ ràng bằng mắt trong ảnh, không bị cắt. Đối chiếu Expected: khung hình đầu tiên nêu đúng tên biến còn thiếu — PASS (đây là identifier cụ thể, không phải câu chung chung kiểu "chưa cấu hình dịch vụ").
  network_observed: n-a (driver)
  output: |
    Evidence đã lưu: _acceptance/add-media-library/evidence/E2-step1.png (1 frame duy nhất, đúng bước 1 trong steps). Server: port 3000 đã có server chạy sẵn (KHÔNG do phiên này start) → không tắt, dùng chung. Network: driver dùng curl (SSR check) + scripts/ui-capture.mjs (puppeteer headless, không expose network log ra ngoài) — không có đường đọc network requests → networkObserved = "n-a (driver)", không dump evidence/E2-network.txt vì không có nguồn dữ liệu network để đọc.

- eval: E3
  run_id: minted-add-media-library-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_no_boot_dependency
  verified_at: 2026-08-20T09:28:00Z
  output: |
    media-library imported only by its own routes, lib and node — scanned src

- eval: E4
  run_id: minted-add-media-library-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T09:29:30Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E4-step1.png
  observed: |
    E4-step1.png (fresh GET http://localhost:3000/workspace, MEDIA_LIBRARY_URL/MEDIA_LIBRARY_API_KEY unset — confirmed no .env.local override, only commented-out placeholders in .env.example): shows the default example workflow ("Ví dụ / example") fully rendered — Add Video, Video, Split Video, Videos(0), Concat Video, Videos(0) nodes wired with edges, top toolbar, "Need 2 tools to run this example" info banner (a normal product banner, not an error state, present on a clean checkout too), bottom add-node picker with 8 icons, zoom controls bottom-left. No red/error banner, no toast, no blank/broken page. Matches Expected precondition: studio usable before media-library is ever configured. E4-step2.png (same session, after clicking the 3rd icon — Image — in the bottom add-node picker toolbar): a new "Add Image" node card is now centered on canvas with Upload/Camera/Canvas/Library tabs and a working "Drag files here or click to upload / Browse Files" dropzone, layered over the pre-existing nodes (Video, Split Video, Concat Video still visible in the background, confirming this is an addition, not a fresh/reset canvas). This is the POSITIVE CONTROL the eval explicitly requires: nodeCountBefore=6, nodeCountAfter=7, addImageHeadingPresent=true. Assertions checked (final authoritative isolated-Chrome puppeteer-core run, evidence/E4-fresh-capture-result.json): no global error banner/toast, no console errors, no page exceptions, no failed app-origin network requests in the authoritative run. One earlier attempt logged a single aborted GET /workspace?_rsc=... coincident with a concurrent peer verifier session re-capturing other evals on the same shared `pnpm dev` process; re-running twice more with no other tab open reproduced zero failures — transient peer-triggered HMR noise, not a deterministic effect.
  network_observed: n-a (driver)
  output: |
    Dev server: reused an already-running `pnpm dev` on :3000, not stopped. Environment precondition verified: no .env.local in the repo. Result: exitCode=0, AC-2 / E4 PASS.

- eval: E5
  run_id: minted-add-media-library-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-20T09:27:51Z
  output: |
    Tests  25 passed (25)
    Start at  09:27:51
    Duration  265ms (transform 81ms, setup 0ms, import 116ms, tests 61ms, environment 0ms)

- eval: E6
  run_id: minted-add-media-library-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T09:29:50Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E6-step1.png
  observed: |
    Read E6-step1.png (900x700 capture of http://localhost:3000/proto/add-media-library?state=results, dark theme). The "Nạp từ kho" node frame renders: a search row (placeholder input "Mô tả cảnh bạn cần, ví dụ: phòng khách ngập nắng" + "Tìm" button, both idle/enabled), a summary line "3 clip khớp mô tả. Chọn một clip để nạp về workspace." directly below, and a 3-column MediaCardList: each card shows a thumbnail image (light-purple placeholder rendition), a caption ("Ban công hướng ra hồ, nắng chiều" / "Sảnh chờ, máy lia chậm" / "Toàn cảnh từ flycam lúc hoàng hôn") and, where present, a license/provenance tag ("CC-BY", "Phối cảnh 3D"). This matches the explicit Assert line: cards appear with thumbnail + caption + a line stating how many clips matched (3).
  network_observed: clean
  output: |
    Network truth: driver = Claude Browser MCP (read_network_requests / read_console_messages). Observed 5 same-origin static Next.js asset chunks, all 200 OK. No XHR/fetch calls at all (consistent with "no fetch" fixture design). No console errors. Dumped raw to evidence/E6-network.txt. Final: exitCode=0 — the literal given assertion passes and is evidenced by a real saved frame read directly; the broader "before/after search" expectation is noted as unverifiable with the given single-step scope (proto has no wired click-to-search transition) rather than silently treated as passed.

- eval: E7
  run_id: minted-add-media-library-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_node
  verified_at: 2026-08-20T09:27:57Z
  output: |
    Tests  9 passed (9)
    Start at  09:27:57
    Duration  561ms (transform 21ms, setup 0ms, import 94ms, tests 20ms, environment 380ms)

- eval: E8
  run_id: minted-add-media-library-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-20T09:27:51Z
  output: |
    Tests  25 passed (25)
    Start at  09:27:51
    Duration  265ms (transform 81ms, setup 0ms, import 116ms, tests 61ms, environment 0ms)

- eval: E9
  run_id: minted-add-media-library-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T09:30:10Z
  screenshot: _acceptance/add-media-library/evidence/E9-step1.png
  observed: |
    E9-step1.png (state=unranked): card header "Nạp từ kho", search box "Mô tả cảnh bạn cần...", and directly below it an amber/warning-colored banner reading "Kết quả chưa xếp hạng theo ngữ nghĩa: kho đang thiếu embedding. Danh sách vẫn đúng bộ lọc, thứ tự không phản ánh độ hợp[...]" — this is the disclosure that results are NOT semantically ranked. Three result cards follow. E9-step2.png (state=results): same header and search box, but the line under it is plain (non-warning styled) text "3 clip khớp mô tả. Chọn một clip để nạp về workspac[e]" — no amber banner, no unranked-disclosure text at all. The two frames are visually distinct exactly as expected: frame 1 has the unranked warning strip, frame 2 does not.
  network_observed: n-a (driver)
  output: |
    Dev server: reused an ALREADY-RUNNING `next-server` (pid 16613, cwd=/Users/manh-macmini/dev/oneflow-lane-13b, port 3000) that predates this verify run — did NOT start or stop it. Driver used: curl (HTTP status + grep on SSR HTML) + `pnpm ui:capture` (scripts/ui-capture.mjs, puppeteer-core) for frame capture. This driver has no network-request-log API, so networkObserved = "n-a (driver)".

- eval: E10
  run_id: minted-add-media-library-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-20T09:27:51Z
  output: |
    Tests  25 passed (25)
    Start at  09:27:51
    Duration  265ms (transform 81ms, setup 0ms, import 116ms, tests 61ms, environment 0ms)

- eval: E11
  run_id: minted-add-media-library-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T09:30:30Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E11-step1.png
  observed: |
    E11-step1.png (state=error): frame nền tối, khung "Nạp từ kho" hiện dòng đỏ (destructive) "Khoá media-library không được chấp nhận. Kiểm tra MEDIA_LIBRARY_API_KEY." — nêu đúng nguyên nhân (khoá bị từ chối) và nêu tên biến khoá MEDIA_LIBRARY_API_KEY. E11-step2.png (state=thin-shelf): cùng khung nhưng dòng chữ màu xám (muted, không phải style lỗi) "Không clip nào dựng được thẻ cho mô tả này (kho có 37 clip qua bộ lọc). Thử mô tả khác hoặc nới yêu cầu." — nói về kho/số lượng clip qua bộ lọc, không nhắc gì đến hỏng/lỗi/biến môi trường. Hai câu hoàn toàn khác nhau về nội dung lẫn cách trình bày (đỏ/error vs xám/thông tin).
  network_observed: n-a (driver)
  output: |
    Server: cổng 3000 đã có sẵn server → dùng chung, KHÔNG tự start, KHÔNG tự tắt. Evidence: evidence/E11-step1.png (20160 bytes), evidence/E11-step2.png (20317 bytes) — lưu bằng `pnpm ui:capture`, --full. Network: driver là curl (SSR check) + capture.ui (puppeteer chụp ảnh, không đọc network log qua tool này) → networkObserved = "n-a (driver)".

- eval: E12
  run_id: minted-add-media-library-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_no_domain_vocab
  verified_at: 2026-08-20T09:28:00Z
  output: |
    no domain vocabulary in 28 changed files (8 fields checked, 18 literals checked)

- eval: E13
  run_id: minted-add-media-library-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_node
  verified_at: 2026-08-20T09:27:57Z
  output: |
    Tests  9 passed (9)
    Start at  09:27:57
    Duration  561ms (transform 21ms, setup 0ms, import 94ms, tests 20ms, environment 380ms)

- eval: E14
  run_id: minted-add-media-library-E14-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_node
  verified_at: 2026-08-20T09:27:57Z
  output: |
    Tests  9 passed (9)
    Start at  09:27:57
    Duration  561ms (transform 21ms, setup 0ms, import 94ms, tests 20ms, environment 380ms)

- eval: E15
  run_id: minted-add-media-library-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_import
  verified_at: 2026-08-20T09:27:51Z
  output: |
    Tests  11 passed (11)
    Start at  09:27:51
    Duration  236ms (transform 83ms, setup 0ms, import 123ms, tests 32ms, environment 0ms)

- eval: E16
  run_id: E16
  exit_code: 1
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T09:30:50Z
  screenshot: _acceptance/add-media-library/evidence/E16-step1.png
  observed: |
    Step1 (state=importing): frame shows title "Nạp từ kho", the search row, a 3-card grid, and below it the sentence "Đang nạp clip về kho file của bạn... Xong sẽ hiện thành node video trên canvas." — this text explicitly names both destinations, matching Assert-3's first half. DOM/source confirms the first card (id="a") is rendered via MediaCardList with busyId="a", which sets disabled + opacity-60 on that button only. Step2 (state=results): frame shows the SAME kind of screen — title, search row, the sentence "3 clip khớp mô tả. Chọn một clip để nạp về workspace.", and a 3-card grid of library thumbnails, none disabled/locked, none marked as imported. This is literally the pre-import "search results" state (component source: src/components/proto/add-media-library-proto.tsx, case "results", lines 138-148) — the exact same library-thumbnail-not-yet-imported view a user would see before ever clicking "nạp". There is no third state in this component representing "đã có trong kho" / already-imported-as-video-node; the full switch only has missing-config, searching, results, thin-shelf, unranked, importing, error, default — none of them shows a post-import confirmation distinct from the pre-import search list.
  network_observed: n-a (driver)
  output: |
    Assertion A (HTTP): GET /proto/add-media-library?state=importing -> 200; GET /proto/add-media-library?state=results -> 200. PASS.
    Assertion B (step1 copy names destination + outcome): COPY.importing rendered verbatim in step1 frame. PASS.
    Assertion C (step1 importing card locked): MediaCardList disables the matching card, opacity-60. PASS.
    Assertion D (Expected: user perceives transition from 'đang nạp' to 'đã có trong kho', not still a library thumbnail): FAIL. state=results renders the ordinary pre-import search-results list — pixel-for-pixel the same kind of screen the user already saw before starting the import. There is no distinguishable "already in library" / imported state in this proto component at all. This is exactly the documented FAIL condition in the eval spec: "một khung vẫn hiện ảnh thu nhỏ của library (chưa nạp) là FAIL".
    Overall: AC-9 / E16 FAILS on the required 'đang nạp' → 'đã có trong kho' transition (step2 does not represent a post-import state). Root cause is a missing UI state in src/components/proto/add-media-library-proto.tsx, not a wrong query param — `state=results` is the only plausible existing route and it is pre-import content.
    Dev server: pre-existing process already listening on :3000 (pid 16613, not started by this run) — left running, not torn down.
    networkObserved = n-a (driver): capture via curl (status check) + `pnpm ui:capture`, neither exposes a network-request inspection API.

- eval: E17
  run_id: minted-add-media-library-E17-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_import
  verified_at: 2026-08-20T09:27:51Z
  output: |
    Tests  11 passed (11)
    Start at  09:27:51
    Duration  236ms (transform 83ms, setup 0ms, import 123ms, tests 32ms, environment 0ms)

- eval: E18
  run_id: minted-add-media-library-E18-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_ext
  verified_at: 2026-08-20T09:27:52Z
  output: |
    Tests  8 passed (8)
    Start at  09:27:52
    Duration  94ms (transform 14ms, setup 0ms, import 20ms, tests 2ms, environment 0ms)

- eval: E19
  run_id: minted-add-media-library-E19-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_wiring
  verified_at: 2026-08-20T09:27:52Z
  output: |
    Tests  3 passed (3)
    Start at  09:27:52
    Duration  157ms (transform 62ms, setup 0ms, import 77ms, tests 2ms, environment 0ms)

- eval: E20
  run_id: minted-add-media-library-E20-r2
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T09:31:00Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E20-step1.png
  observed: |
    Read the saved evidence/E20-step1.png (1280x800 PNG) directly with the Read tool. It shows the OneFlow workspace canvas ("Ví dụ / example" workflow) with a new card centered in the viewport: header row has a library icon (lucide "library" glyph) + bold title text "Load from library" (active locale English; exact next-intl rendering of Workspace.nodes.addMediaLibrary.title, "Nạp từ kho" in vi.json) plus a "≡" more-options button; body has a search input (placeholder "Describe the scene you need, e.g. a living room fu...") and a "Search" button. A small circular handle dot is visible on the card's right edge. The card overlaps a pre-existing "Split Video" node behind it but is not connected to anything by an edge, matching a just-added, not-yet-configured add-node. Also opened the saved evidence/E20-step1.html DOM dump and located the exact new node's markup by its data-id: `<h3>Load from library</h3>` immediately followed by `<div data-handleid="out:videoNode" data-nodeid="2ef8a572-..." data-handlepos="right" class="react-flow__handle react-flow__handle-right nodrag nopan source connectable connectableend"></div>` — one handle only, type source, position right, no target/input handle on this node. Matches Expected/Assert exactly.
  network_observed: clean
  output: |
    Overall: exitCode=0 — every assertion (node appears, title = nạp-từ-kho/"Load from library", exactly one source handle on the right) passed on two independent drivers, with a real saved PNG frame plus a byte-level DOM cross-check, and no FAIL-eligible network failure.

- eval: E21
  run_id: minted-add-media-library-E21-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-20T09:27:51Z
  output: |
    Tests  25 passed (25)
    Start at  09:27:51
    Duration  265ms (transform 81ms, setup 0ms, import 116ms, tests 61ms, environment 0ms)

- eval: E22
  run_id: minted-add-media-library-E22-r2
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T09:31:10Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E22-step1.png
  observed: |
    Đọc _acceptance/add-media-library/evidence/E22-step1.png (đã mở bằng Read, ảnh thật): khung node "Nạp từ kho" (add/media-library) hiện đủ header + ô tìm kiếm readonly, và bên dưới là một dòng chữ đỏ duy nhất: "Khoá media-library không được chấp nhận. Kiểm tra MEDIA_LIBRARY_API_KEY." — không có bất kỳ thẻ media/thumbnail nào (không caption, không proxy image) phía dưới thông điệp lỗi. Đối chiếu HTML SSR (curl) khớp 100% với ảnh: chuỗi lỗi xuất hiện đúng 1 lần, chuỗi tên biến MEDIA_LIBRARY_API_KEY xuất hiện, và không caption thẻ nào có trong HTML.
  network_observed: n-a (driver)
  output: |
    Cleanup: không tự start server nên không cần tắt gì. KẾT LUẬN: Cả 2 assertion PASS, screenshot khớp Expected (trạng thái từ-chối-có-tên, không render dữ liệu đoán theo hình dạng cũ) → exitCode=0.

- eval: E23
  run_id: minted-add-media-library-E23-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_tier_boundary
  verified_at: 2026-08-20T09:28:00Z
  output: |
    comparing HEAD against origin/main (merge-base 5547aff2f241)
    checked 91 changed file(s) against 9 t3 path rule(s), 2 allowed, 1 required
    OK: only declared t3 paths touched — the declared surface holds

- eval: E24
  run_id: minted-add-media-library-E24-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_a11y_proto
  verified_at: 2026-08-20T09:28:00Z
  output: |
    "verdict": "PASS"
    16/16 pages scanned (eight states x light+dark)

- eval: E25
  judged_by: judge panel — domain-correctness, operational-feasibility, spec-alignment (fresh context)
  proposal: UNCERTAIN
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Bốn chặng có ảnh riêng biệt, đọc được ngay từ màn hình: thiếu cấu hình (E2-step1, có ô nhập hai biến), có kết quả (E6-step1), kệ mỏng (E11-step2, văn bản khác hẳn lỗi), đang nạp (E16-step1, có dòng "Đang nạp..." + thẻ đã chọn tô khác màu). Nhưng chặng "kết quả không xếp hạng" thì E9-step1 (banner hổ phách "chưa xếp hạng theo ngữ nghĩa") và E9-step2 (đúng ba thẻ y hệt, cùng thứ tự, nhưng không banner và dùng nguyên văn "3 clip khớp mô tả..." của trạng thái sạch) cho hai cách đọc trái ngược nhau — không đủ căn cứ để nói đây là suy giảm sụp thành sạch hay chỉ là một lượt tìm khác, vì không có evals.yaml mô tả hành động giữa hai bước. File E22-step1.png trong danh sách Input cũng không tồn tại (chỉ có .html), nên chặng "đang tìm" thiếu bằng chứng độc lập.
      required_evidence:
        - Nội dung mục eval E9 trong _acceptance/add-media-library/evals.yaml (câu hỏi + hành động giữa E9-step1 và E9-step2) — cần để biết step2 có phải cùng một phiên tìm kiếm bị mất banner cảnh báo hay là một lượt tìm khác hợp lệ; nếu là cùng phiên mất banner thì verdict đổi thành FAIL cho chặng 'kết quả không xếp hạng'.
        - File ảnh thật tại đường dẫn /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E22-step1.png (hiện chỉ có E22-step1.html, không phải .png) — cần để xác nhận chặng 'đang tìm' có hình hài phân biệt được trên màn hình hay không.
    - operational-feasibility: UNCERTAIN — Bốn chặng có ảnh màn hình hợp lệ (E2, E6/E16-step2, E9, E11, E16-step1) đều tự nói rõ mình đang ở đâu bằng chữ trên node — "Chưa gọi được media-library: thiếu MEDIA_LIBRARY_URL..." (E2), "3 clip khớp mô tả" (E6/E16-step2), banner viền vàng "Kết quả chưa xếp hạng theo ngữ nghĩa..." tách bạch khỏi bản sạch không-banner (E9-step1 vs E9-step2), "Không clip nào dựng được thẻ..." khác hẳn banner lỗi (E11), và "Đang nạp clip về kho file của bạn..." (E16-step1) — không chặng nào trong số này trình kết quả suy giảm giống hệt kết quả sạch. Nhưng file duy nhất còn lại trong danh sách, E22-step1, không phải ảnh chụp màn hình mà là bản dump HTML nguồn thô (36907 token, mở đầu bằng thẻ `<!DOCTYPE html>`, script Next.js) — tức là đọc mã nguồn/log, đúng thứ luật chấm "chỉ nhìn màn hình, không console, không log" loại trừ — nên chặng "nạp xong/canvas" hoàn toàn không có bằng chứng thị giác hợp lệ trong phạm vi được giao.
      required_evidence:
        - Một ảnh PNG chụp màn hình thật (không phải HTML source dump) đặt tại _acceptance/add-media-library/evidence/E22-step1.png, cho thấy canvas sau khi 'Nạp từ kho' chạy xong — video node mới xuất hiện — để có căn cứ thị giác cho chặng 'xong' mà hiện chỉ có file .html thô không xem được như màn hình.
    - spec-alignment: UNCERTAIN — Bằng chứng chỉ phủ được 3/5 chặng nêu trong câu hỏi rõ ràng: chặng "chưa cấu hình" phân biệt tốt (E2-step1: thông điệp nêu đích danh 2 biến + hai ô nhập), chặng "kệ mỏng" phân biệt tốt (E11-step2: không thẻ nào, chỉ chữ, khác hẳn danh sách kết quả), và chặng "kết quả không xếp hạng" có banner cảnh báo tách biệt (E9-step1). Nhưng hoàn toàn không có ảnh cho chặng "đang tìm" (không có frame nào chụp lúc bấm Tìm chờ phản hồi) và không có ảnh cho chặng "xong" (E16-step2 chỉ quay lại y hệt danh sách thẻ ban đầu, không có ảnh canvas cho thấy videoNode mới theo AC-12) — hai trong năm chặng câu hỏi hỏi thẳng không có căn cứ hình ảnh nào để trả lời có/không. Thêm nữa E22-step1.png không tồn tại trong evidence (chỉ có E22-step1.html), nên một mảnh input được liệt kê không đọc được.
      required_evidence:
        - Ảnh chụp trạng thái 'đang tìm' của node (ngay sau khi bấm nút Tìm, trước khi kết quả về) — hiện chưa tồn tại trong evidence/, cần thêm ví dụ E-searching-step1.png
        - Ảnh chụp canvas sau khi nạp xong cho thấy videoNode mới xuất hiện (theo AC-12) thay vì chỉ quay lại danh sách thẻ như E16-step2 hiện tại — cần một frame kiểu E16-step3-canvas.png
        - File E22-step1.png đúng định dạng .png (hiện chỉ có E22-step1.html trong _acceptance/add-media-library/evidence/) để đọc được nội dung eval E22 mà danh sách input đã liệt kê
  rationale: Cả ba lens đều UNCERTAIN. Điểm chung: chặng "kết quả không xếp hạng" (E9) và chặng "đang tìm" có bằng chứng mơ hồ hoặc thiếu (E9-step1/step2 đọc được hai cách trái ngược nhau vì không rõ hành động giữa hai bước; không có frame riêng cho trạng thái "đang tìm"), và E22-step1.png không tồn tại đúng định dạng (chỉ có bản .html) nên chặng liên quan đến E22 thiếu căn cứ thị giác hợp lệ. Round này đã sinh lại đầy đủ ảnh PNG hợp lệ cho phần lớn các chặng (E2, E4, E6, E9, E11, E16, E20, E29 — tất cả PASS ở Evidence section trên), khá hơn round 1 (lúc đó 5-6/7 đường dẫn Input hoàn toàn không tồn tại); nhưng ba lens vẫn giữ UNCERTAIN vì hai khoảng trống cụ thể (E22 vẫn là .html không phải .png; hành động giữa E9-step1/step2 không được ghi lại) chưa được lấp — người quyết ở Gate 2 cần tự xem các frame mới và quyết định liệu hai khoảng trống này có đủ nghiêm trọng để giữ UNCERTAIN hay không.
  human_override:

- eval: E26
  run_id: minted-add-media-library-E26-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_aml_route
  verified_at: 2026-08-20T09:27:55Z
  output: |
    Tests  5 passed (5)
    Start at  09:27:55
    Duration  189ms (transform 52ms, setup 0ms, import 31ms, tests 69ms, environment 0ms)

- eval: E27
  run_id: minted-add-media-library-E27-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_no_dormant_fetch
  verified_at: 2026-08-20T09:28:00Z
  output: |
    downloadAndSave() callers: (none) — scanned src

- eval: E28
  run_id: minted-add-media-library-E28-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.aml_fixture_provenance
  verified_at: 2026-08-20T09:28:06Z
  output: |
    Tests  3 passed (3)
    Start at  09:28:06
    Duration  85ms (transform 12ms, setup 0ms, import 18ms, tests 2ms, environment 0m)

- eval: E29
  run_id: minted-add-media-library-E29-r2
  exit_code: 0
  baseline: n-a
  verifier: config:capture.ui
  verified_at: 2026-08-20T09:31:20Z
  screenshot: /Users/manh-macmini/dev/oneflow-lane-13b/_acceptance/add-media-library/evidence/E29-step1.png
  observed: |
    Đọc file evidence/E29-step1.png (ảnh, đọc trực tiếp bằng Read): frame hiển thị node "Nạp từ kho" (add/media-library) ở trạng thái missing-config. Ngay dưới ô tìm kiếm (đã bị disable/readonly, không phải điểm ra), panel cấu hình hiện: (1) thông điệp "Chưa gọi được media-library: thiếu MEDIA_LIBRARY_URL và MEDIA_LIBRARY_API_KEY.", (2) nhãn "MEDIA_LIBRARY_URL" + ô input có placeholder "https://kho.vidu.com", (3) nhãn "MEDIA_LIBRARY_API_KEY" + ô input (type=password) có placeholder "Khoá có scope search", (4) nút "Lưu rồi tìm lại". Cả hai ô nhập và nút lưu nằm NGAY TẠI chỗ, cùng khung với thông điệp lỗi — không phải màn hình khác. Đối chiếu Expected: khớp — vòng trọn từ chỗ kẹt tới chỗ nhập khoá nằm ngay tại chỗ.
  network_observed: n-a (driver)
  output: |
    Kết luận AC-1: PASS — từ chính trạng thái missing-config, người dùng có cả hai ô nhập biến (MEDIA_LIBRARY_URL, MEDIA_LIBRARY_API_KEY) và một nút lưu ngay tại chỗ, không phải đi tìm màn hình khác. exitCode=0. Network: driver là curl (SSR check) + puppeteer-core script chạy headless qua ui:capture — networkObserved = "n-a (driver)". evidence/E29-network.txt KHÔNG được tạo vì không có driver đọc network trong phiên verify này.

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả 28 eval máy/UI (E1–E24, E26–E29) PASS trên `verified_commit` của round đó, E25 (judgment AC-15) UNCERTAIN vì bộ evidence lúc panel chấm phần lớn thiếu ảnh PNG thật — nhưng `pnpm build && pnpm typecheck` (lỗi biên dịch thật trong `.next-dev/types/**`, `Cannot find module 'next/server.js'`) và `pnpm lint:check` (`.next-dev/**` không bị biome loại trừ) FAIL, không gắn eval nào → verdict tổng REJECT, quay lại implementation để sửa build/lint.
Round 2 (round này): `pnpm lint:check` đã chuyển xanh (vấn đề `.next-dev/**`/biome đã được xử lý). Nhưng xuất hiện một hồi quy thật trong contract: **E16 (AC-9) FAIL** — proto vẫn không có trạng thái "đã có trong kho" phân biệt được với danh sách kết quả pre-import (`state=results` == `state=importing`'s "after" screen). `pnpm build && pnpm typecheck` vẫn đỏ nhưng đổi nguyên nhân sang `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` (môi trường sandbox chặn bước pnpm install tự động, không phải lỗi mã nguồn như round 1) — cần xác nhận lại trong môi trường có TTY trước khi kết luận đây không phải hồi quy build thật. Verdict tổng vẫn REJECT; quay lại implementation để (a) thêm trạng thái hậu-nạp cho `add-media-library-proto.tsx` (đóng E16/AC-9) và (b) chạy lại `pnpm build && pnpm typecheck` trong một shell có TTY để phân biệt lỗi hạ tầng khỏi lỗi mã nguồn thật.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
