---
schema_version: 2
feature_slug: compose-overlay
verdict: REJECT
failed_evals: [E22]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 086875b8a16c0a9b03fe7500e7676c7f4a65a369
human_signoff:
---

# Evidence Report: compose-overlay

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1a | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5a | AC-5 | script | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7a | AC-7 | script | PASS |
| E7b | AC-7 | script | PASS |
| E8a | AC-8 | script | PASS |
| E8b | AC-8 | script | PASS |
| E9a | AC-9 | script | PASS |
| E9b | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-11 | test | PASS |
| E17 | AC-11 | test | PASS |
| E12a | AC-12 | test | PASS |
| E12b | AC-12 | test | PASS |
| E18 | AC-13 | test | PASS |
| E19 | AC-13 | test | PASS |
| E20 | AC-14 | script | PASS |
| E21 | AC-15 | script | PASS |
| E22 | AC-16 | ui-check | FAIL |
| E23 | AC-16 | judgment | UNCERTAIN |

## Evidence

- eval: E1a
  run_id: minted-compose-overlay-E1a-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-03T09:12:30Z
  output: |
    Checked 1 file in 74ms. Fixed 1 file.
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json

- eval: E1b
  run_id: minted-compose-overlay-E1b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-03T09:12:30Z
  output: |
    (script exited 0, no diff — generated Python models incl. ComposeOverlayInput/Output + COMPOSE_OVERLAY match committed files)

- eval: E2
  run_id: minted-compose-overlay-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_diacritics
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.22s

- eval: E3
  run_id: minted-compose-overlay-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_multiline
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.16s

- eval: E4
  run_id: minted-compose-overlay-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_price_tag
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E5a
  run_id: minted-compose-overlay-E5a-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E5b
  run_id: minted-compose-overlay-E5b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_logo_missing
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E6
  run_id: minted-compose-overlay-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_safe_zone
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7a
  run_id: minted-compose-overlay-E7a-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_placeholder
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E7b
  run_id: minted-compose-overlay-E7b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_placeholder_missing
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E8a
  run_id: minted-compose-overlay-E8a-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.21s

- eval: E8b
  run_id: minted-compose-overlay-E8b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_time_window_image
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-compose-overlay-E9a-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_modality_image
  verified_at: 2026-08-03T09:12:30Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E9b
  run_id: minted-compose-overlay-E9b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.21s

- eval: E10
  run_id: minted-compose-overlay-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_determinism
  verified_at: 2026-08-03T09:12:30Z
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.23s

- eval: E14
  run_id: minted-compose-overlay-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-03T09:12:30Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E15
  run_id: minted-compose-overlay-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-03T09:12:30Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E16
  run_id: minted-compose-overlay-E16-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-03T09:12:30Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E17
  run_id: minted-compose-overlay-E17-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-03T09:12:30Z
  output: |
    1 passed in 0.03s

- eval: E12a
  run_id: minted-compose-overlay-E12a-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-03T09:12:29Z
  output: |
    Tests  6 passed (6)
    Start at  09:12:29
    Duration  1.73s (transform 218ms, setup 0ms, import 564ms, tests 364ms, environment 681ms)

- eval: E12b
  run_id: minted-compose-overlay-E12b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-03T09:12:29Z
  output: |
    Tests  3 passed (3)
    Start at  09:12:29
    Duration  328ms (transform 133ms, setup 0ms, import 205ms, tests 6ms, environment 0ms)

- eval: E18
  run_id: minted-compose-overlay-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-03T09:12:30Z
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.03s

- eval: E19
  run_id: minted-compose-overlay-E19-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-03T09:12:36Z
  output: |
    Tests  12 passed (12)
    Start at  09:12:36
    Duration  172ms (transform 55ms, setup 0ms, import 73ms, tests 4ms, environment 0ms)

- eval: E20
  run_id: minted-compose-overlay-E20-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-03T09:12:30Z
  output: |
    OK: compose-overlay registered (#39), docs + i18n coherent

- eval: E21
  run_id: minted-compose-overlay-E21-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-03T09:12:30Z
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: minted-compose-overlay-E22-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-03T09:12:39Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/compose-overlay/evidence/design/captures/state-1-empty.html
  observed: |
    Mo lai tung file .html vua luu bang Read/grep (khong doan tu tri nho):
    state-1-empty.html: title dung "state 1: empty"; 0 op-row; nut Apply Overlay co disabled="" (dung — ops rong); block "No ops yet..." + 4 nut add (Text/Price tag/Logo/Safe zone); du 5 handle data-handleid (in:media,in:text,in:logo,out:image,out:video).
    state-2-ops-image.html: "Ops · media: image"; 4 op-row (TEXT/PRICE/LOGO/SAFE) dang thu gon, khong co op-time nao; LOGO row hien "from in:logo · 0.18 · top-right" (logo DA noi, khong loi); Apply Overlay KHONG disabled — khop design-of-record state-2 tung chu.
    state-3-ops-video.html: "Ops · media: video"; 4 op-row, co op-time badges (0–3.5s / 3.5–7s / entire video cho op khong start/end) — khop design state-3.
    state-4-op-form.html: node co class "selected" + ring-2 ring-blue-500; op-text-content la 1 <textarea> chua dung noi dung multi-line "Ưu đãi có hạn —\nchỉ còn {text}"; day du field x/y/anchor/size/color/align/max_width/start/end; op thu 2 la SAFE dang thu gon — khop design state-4.
    state-5-error.html: co div data-testid="compose-overlay-logo-banner" voi text "A logo op needs an image on in:logo — connect an image node."; op-row LOGO co data-op-error="true", class border-destructive, text "logo image missing (in:logo not connected)"; Apply Overlay disabled="" — khop design state-5.
    state-6-running.html: co lucide-loader-circle (spinner) dang animate-spin, nut "Cancel execution", label "Task started" (shimmer bg-clip-text), dong ho "16s", vien gradient rotate-border; Apply Overlay disabled="" — day la RUNNING STATE THAT (khong phai gia lap): dat duoc bang cach cai 1 plugin stub capture-only (KHONG phai code that, xoa ngay sau khi chup) roi bam that nut Execute, task那 that qua POST /api/task/create + SSE that.
  network_observed: clean
  output: |
    ASSERTIONS (may-kiem-duoc) & KET QUA:

    A1. Dev server tu start (`pnpm dev`, minh start nen tat sau) — poll HTTP: curl / -> 307, curl /workspace -> 200. PASS.
    A2. /workspace mo duoc trong browser that (Claude_Browser), khong loi tai trang. PASS (dung tab moi "tab-1" — xem note session-artifact ben duoi).
    A3. Node compose-overlay dat duoc CA 6 state cua ma tran design-doc TREN CHINH trang /workspace, bang Import-JSON that (workflow-title-menu's real onChange handler, khong mock) + click that (op-edit-0, chon node, Apply Overlay那) — khong phai unit test/jsdom rieng. Doi chieu tung state voi design-of-record HTML (_acceptance/compose-overlay/evidence/design/reference/source/state-N-*.html): ca 6 state khop cau truc + noi dung (ops list, nhan media:image/video, op-time badge, banner loi, form mo rong, loading overlay那). PASS — chi tiet trong observed.
    A4. 6 file HTML capture da luu: _acceptance/compose-overlay/evidence/design/captures/state-{1-6}-*.html (outerHTML that cua node + link toi 2 CSS that cua app: layout.css, workspace/page.css). PASS.
    A5. `node design-gate.mjs <file> --mode dom --jsdom . --fail-on P0` (config:executors.design.gate, DOM mode that qua jsdom, jsdom lay tu repo node_modules) chay tren CA 6 file:
        - state-1-empty: verdict PASS, exit_code 0 (p0_count 0; chi P1 nested-cards, P2 cramped-padding la warning tu BaseNodeShell/Card, khong block).
        - state-2-ops-image: PASS, exit 0.
        - state-3-ops-video: PASS, exit 0.
        - state-4-op-form: PASS, exit 0 (+P2 single-font warning).
        - state-5-error: PASS, exit 0.
        - state-6-running: REJECT, exit 2, p0_count 1 — rule "low-contrast": "4.3:1 (need 4.5:1) — text #000000 on #6b7280". Root cause xac dinh bang doc source: day la shimmer text cua NodeLoadingOverlay (src/components/workspace/nodes/base/node-loading-overlay.tsx:46-51, `bg-clip-text text-transparent` + animated gradient) — component CHUNG cua BaseNodeShell, dung cho MOI executable node khi loading, KHONG phai code rieng cua compose-overlay. Rat co the la HAN CHE cua detector (jsdom/Impeccable khong mo phong `background-clip:text`+`text-transparent` nen doc mau chu la den mac dinh thay vi gradient that), nhung day la ket qua CHAY THAT cua design-gate.mjs nen bao cao dung nhu vay.
        => 5/6 PASS, 1/6 REJECT. Assertion A5 = FAIL (khong phai TAT CA 6 state pass P0 gate).
    A6. Console sach (read_console_messages onlyErrors, kiem tra rieng SAU MOI Import-JSON, truoc khi capture): state 1,2,3,4,5 — 0 loi moi lan. State 6: sau khi bam Execute that (qua plugin stub capture-only, xem A3), xuat hien DUNG 1 dong [error] "[useAbiExecution] Task failed for node co" — day la logger that cua app bao that bai cua chinh plugin stub minh cai (message "E22 capture stub — not a real render"), khong phai loi san pham, khong tai hien o state 1-5 hay khi khong bam Execute. => coi la KHONG tinh vao "console sach" cua san pham (do la artefact cua ha tang verify, da xoa plugin sau khi xong).
        1 [warn] "[React Flow]: parent container needs width/height" xuat hien TREN MOI lan tai /workspace ke ca tab moi hoan toan khong co node nao — pre-existing, khong lien quan compose-overlay.
    A7. A11y co ban: 5 ABI handle dung id tren moi state; trang thai disabled/enabled cua nut Apply Overlay dung dac ta o CA 6 state (kiem bang grep tren file that: state1 disabled=1, state2 disabled=0, state3 disabled=0, state4 disabled=0, state5 disabled=1, state6 disabled=1 — dung 100%); loi logo bao qua CA text (khong chi mau) + banner + data-testid rieng. Design-gate P0 (bao gom contrast) PASS 5/6 file (xem A5).
    A8. NETWORK TRUTH: dump tho _acceptance/compose-overlay/evidence/E22-network.txt. Scope = http://localhost:3000 (dev_server.url trong config.yaml). Tat ca request FAIL-eligible (fetch/XHR toi app origin, gom /api/task/create, /api/task/wait, /api/task/update-status, /api/uploads/*, /api/plugins/registry, /api/feature/list) deu 200/206 OK. Vai request `/workspace?_rsc=...` bi net::ERR_ABORTED nhung DA la 200 OK truoc khi client tu huy (RSC prefetch bi navigation moi hon huy — pattern chuan cua Next dev, khong phai 4xx/5xx/connection-error) => khong tinh FAIL. networkObserved = clean.

    SESSION-ARTIFACT NOTE (khong tinh vao exitCode): tab dau tien ("seed", da dung workflow "示例/example" co san) show 1 loi hydration-mismatch tren nut "Language" o top toolbar SAU khi minh Clear + Import JSON nhieu lan; reload lai chinh tab do van tai hien loi. Mo TAB MOI HOAN TOAN ("tab-1") va nav lai /workspace tu dau (chua dung compose-overlay) => 0 loi console. Ket luan day la artefact cuc bo cua tab/session (co the do cookie locale hoac state Radix useId bi lech do thao tac Clear/Import lien tuc), KHONG phai loi san pham tai hien duoc tu mot lan tai trang sach — tu do chuyen toan bo cong viec sang tab-1 (sach) cho moi assertion o tren.

    FALLBACK EVIDENCE (bat buoc ghi ro): _acceptance/config.yaml KHONG khai bao `capture.ui` (doc file, dong 299-303: "capture.ui: omitted for now — no screenshot-to-file command in repo yet"). Cong cu chup man hinh cua Claude_Browser (`computer{action:"screenshot"}`) chi tra anh INLINE, khong co API luu file. => Theo dung quy tac verifier, KHONG co PNG cho 6 state — chi co 6 file .html (outerHTML that cua node, da assert qua design-gate.mjs) luu tai _acceptance/compose-overlay/evidence/design/captures/state-{1-6}-*.html. E23's `inputs` (evals.yaml dong 214) doi hoi .png — CAC FILE DO CHUA TON TAI; day la khoang trong ro rang can nguoi ke tiep (hoac mot buoc capture.ui rieng) lap day, minh khong tu che PNG gia.

    DON DEP (repo state): da xoa plugins/oneflow-modal-compose-overlay/ (plugin stub capture-only, gitignored, KHONG phai plugin that — dung de kich hoat that trang thai "running"), data/uploads/e22-sample-{image.png,video.mp4} (2 file media that toi tu tao bang python/ffmpeg de co fileKey resolve 200, thay vi fileKey gia gay 404), data/.tongflow/plugin-venv/ (venv Python plugin tao ra khi execute). `git status --porcelain` sau don dep: chi con _acceptance/compose-overlay/evidence/design/captures/ (moi, muon giu) + pnpm-workspace.yaml (da co tu truoc, khong phai minh tao). Dev server (pnpm dev, PID minh start) da kill — port 3000 da free (xac nhan bang lsof rong sau kill).

    KET LUAN: cannotRun=false. exitCode=2 (khop exit_code cua design-gate.mjs tren state-6-running — 5/6 state PASS P0, 1/6 REJECT vi 1 finding low-contrast tren shimmer-text component CHUNG cua BaseNodeShell/NodeLoadingOverlay, rat co the la han che cua detector chu khong phai loi rieng compose-overlay, nhung van la ket qua may-kiem-duoc THAT nen khong the bao PASS). Evidence day du (6 HTML + network dump) da san sang cho E23, tru phan .png con thieu do gioi han cong cu.

- eval: E23
  judged_by: 3-lens panel (domain-correctness, operational-feasibility, spec-alignment) — fresh context, proposal: UNCERTAIN
  verdict: UNCERTAIN
  rationale: |
    - domain-correctness: UNCERTAIN — Cả 6 file capture được chỉ định (evidence/design/captures/state-1..6.png) không tồn tại trên đĩa — thư mục captures/ chưa được tạo, chỉ có design-of-record HTML trong evidence/design/reference/source/. Không có bằng chứng về trạng thái thực tế của node để so sánh với design-of-record, nên không thể phán xét khớp/không khớp ma trận 6 state theo AC-16.
    - operational-feasibility: UNCERTAIN — Không thể so sánh: cả 6 file capture PNG được dẫn (state-1..6) không tồn tại trong repo — thư mục evidence/design/captures/ không được tạo, chỉ có design-of-record reference (HTML/CSS) mà không có ảnh chụp impl thực tế. Thiếu bằng chứng ảnh để đối chiếu với reference nên không thể kết luận PASS hay FAIL cho AC-16.
    - spec-alignment: UNCERTAIN — All 6 input capture PNGs (state-1-empty.png through state-6-running.png) do not exist on disk — only the design-of-record reference HTML/CSS exists, with no implementation captures to compare against. Cannot judge spec-alignment without the actual evidence artifacts specified in the task.
  human_override:

## Analyst

E1a, E16, E17, E19 — green on both HEAD and diffBase (non-discriminating): E1a (`pnpm gen:abi` clean-diff) and E19 (`conformance.test.ts`) are pre-existing regression guards whose ABI/conformance fixtures already included compose-overlay-adjacent shape before this diff's own assertions were added, so they were already green pre-feature. E16/E17 (tier-list disjointness, bidirectional ABI guard) assert properties of the caching/ABI *system* that held before this feature touched it. These are intended regression guards, not blind spots — no rewrite needed, but flag for the human reviewer that they do not by themselves prove compose-overlay-specific behavior.

## Variance

none — every multi-run eval is uniform (no eval in this round carries runs > 1).

## Iterations

Round 1: E22 failed — `design-gate.mjs --fail-on P0` REJECTs (exit 2) on captured state-6-running.html: a P0 low-contrast finding (4.3:1 vs required 4.5:1) on the shimmer/gradient "Task started" text inside NodeLoadingOverlay, a component shared by every executable node's loading state, not compose-overlay-specific code — plausibly a jsdom/detector limitation (it cannot simulate `background-clip:text` + `text-transparent` + animated gradient), but reported as-is since it is a real machine result. Separately, `pnpm test` (not mapped to any eval) exited 1 with 2 failing tests in `src/lib/plugins/official-manifest.test.ts` (assertion mismatch on `manifest.entries.map(id)` vs `raw.plugins`) — flagged here per the "unassigned failing command" requirement; it is unrelated to any of E1a–E23's `expected` and was not triaged further this round. All other evals (E1a–E21, E12a/E12b, E14–E19) passed; `pnpm build`, `pnpm typecheck`, `pnpm lint:check`, the full `sdk` pytest suite, and `pnpm verify:plugins` all passed clean but are not AC-mapped so are not listed as eval rows. Returned to implementation.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
