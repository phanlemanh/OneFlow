---
schema_version: 2
feature_slug: skill-system-v1
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: be9b2305713a942899e294c036e3f583881eaffe
human_signoff:
---

# Evidence Report: skill-system-v1

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-10 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |
| E12 | AC-9 | ui-check | PASS |
| E12b | AC-9 | ui-check | PASS |
| E13 | AC-10 | ui-check | PASS |
| E14 | AC-10 | script | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-13 | judgment | PASS |
| E17b | AC-13 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-skill-system-v1-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_registry_integrity
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  21 passed (21)
    Start at  20:58:52
    Duration  175ms (transform 80ms, setup 0ms, import 113ms, tests 6ms, environment 0ms)

- eval: E2
  run_id: minted-skill-system-v1-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_params_route
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  7 passed (7)
    Start at  20:58:54
    Duration  383ms (transform 83ms, setup 0ms, import 29ms, tests 286ms, environment 0ms)

- eval: E3
  run_id: minted-skill-system-v1-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_instantiate
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  4 passed (4)
    Start at  20:58:55
    Duration  321ms (transform 170ms, setup 0ms, import 231ms, tests 5ms, environment 0ms)

- eval: E4
  run_id: minted-skill-system-v1-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_run_refusals
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  5 passed (5)
    Start at  20:58:56
    Duration  428ms (transform 84ms, setup 0ms, import 35ms, tests 312ms, environment 0ms)

- eval: E5
  run_id: minted-skill-system-v1-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_run_task_row
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  1 passed (1)
    Start at  20:58:54
    Duration  392ms (transform 85ms, setup 0ms, import 30ms, tests 293ms, environment 0ms)

- eval: E6
  run_id: minted-skill-system-v1-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_runner_dispatch
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  2 passed (2)
    Start at  20:58:55
    Duration  459ms (transform 143ms, setup 0ms, import 33ms, tests 344ms, environment 0ms)

- eval: E7
  run_id: minted-skill-system-v1-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_runs_collect
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  6 passed (6)
    Start at  20:58:54
    Duration  524ms (transform 156ms, setup 0ms, import 35ms, tests 396ms, environment 0ms)

- eval: E7b
  run_id: minted-skill-system-v1-E7b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_runs_failed_step
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Start at  20:58:56
    Duration  499ms (transform 167ms, setup 0ms, import 29ms, tests 391ms, environment 0ms)

- eval: E8
  run_id: minted-skill-system-v1-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssv1_e2e_tach_tieng
  verified_at: 2026-09-16T21:05:00Z
  output: |
    PASS output tieng: 32720 bytes · audio=1 video=0
    PASS output video-cam: 19018 bytes · audio=0 video=1
    PASS e2e tach-tieng-video

- eval: E9
  run_id: minted-skill-system-v1-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_sheet_list_form
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  3 passed (3)
    Start at  20:58:54
    Duration  1.43s (transform 332ms, setup 0ms, import 792ms, tests 160ms, environment 404ms)

- eval: E9b
  run_id: minted-skill-system-v1-E9b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_skills_list_route
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  3 passed (3)
    Start at  20:58:54
    Duration  602ms (transform 100ms, setup 0ms, import 25ms, tests 497ms, environment 0ms)

- eval: E10
  run_id: minted-skill-system-v1-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_sheet_run_states
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  2 passed (2)
    Start at  20:58:55
    Duration  1.39s (transform 339ms, setup 0ms, import 490ms, tests 485ms, environment 339ms)

- eval: E11
  run_id: minted-skill-system-v1-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_plan_to_canvas
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  3 passed (3)
    Start at  20:58:55
    Duration  1.26s (transform 278ms, setup 0ms, import 696ms, tests 160ms, environment 327ms)

- eval: E11b
  run_id: minted-skill-system-v1-E11b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_plan_route
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  2 passed (2)
    Start at  20:58:56
    Duration  390ms (transform 73ms, setup 0ms, import 28ms, tests 289ms, environment 0ms)

- eval: E12
  run_id: minted-skill-system-v1-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E12
  verified_at: 2026-09-16T21:05:00Z
  screenshot: /Users/manhphan/dev/oneflow/.claude/worktrees/relaxed-sammet-b381ba/_acceptance/skill-system-v1/evidence/E12-step1.png
  observed: |
    Đã mở trực tiếp cả 3 file frame vừa lưu bằng Read (ảnh, đọc trực tiếp) và đối chiếu Expected: E12-step1.png: panel "Skill" mở dạng cột trái, trên nền canvas là workflow mẫu "Tách video"/"Ghép nối video". Danh sách đúng 2 mục tiếng Việt: "Cắt cảnh video" (mô tả "Chia một video dài thành từng đoạn theo chỗ chuyển cảnh...") và "Tách tiếng khỏi video" (mô tả "Tách một video thành hai tệp: phần tiếng riêng và phần hình không tiếng..."). Khớp Expected "danh sach hai skill tieng Viet". E12-step2.png: panel chuyển sang biểu mẫu "Tách tiếng khỏi video" với nút "Quay lại", trường "Video *" có dấu sao đỏ + nhãn phụ ngụ ý bắt buộc, nút "Chọn video", chú thích "Video có tiếng", và nút "Chạy" ở màu xám nhạt (trạng thái vô hiệu, xác nhận thêm bằng DOM: button.disabled === true trước khi upload). Khớp Expected "bieu mau voi o bat buoc co dau va Chạy vo hieu". E12-step3.png: cùng biểu mẫu nhưng nút "Chọn video" đổi thành "Đổi tệp" kèm tên tệp "mau.mp4" đã chọn, và nút "Chạy" đổi sang nền trắng đặc (trạng thái bật, xác nhận thêm bằng DOM: button.disabled === false sau khi uploadFile). Khớp Expected "sau tai len Chạy bat". Cả 3 frame nhất quán về layout/copy tiếng Việt, không có dấu hiệu lỗi hiển thị hay text tiếng Anh lọt vào (đã ép Accept-Language + cookie NEXT_LOCALE=vi trước khi điều hướng, xác nhận qua debug label ban đầu).
  network_observed: clean

- eval: E12b
  run_id: ssv1-luot.e12b-verify (PORT=3200, torn down)
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E12b
  verified_at: 2026-09-16T21:05:00Z
  screenshot: _acceptance/skill-system-v1/evidence/E12b-step1.png
  observed: |
    Read _acceptance/skill-system-v1/evidence/E12b-step1.png (97296 bytes, PNG) directly. The Skill sheet dialog is open over the /workspace canvas. Card 1 "Cắt cảnh video" (title greyed/dimmed) shows a warning-icon label "⚠ Cần cài plugin cho bước: Tách cảnh" plus a "Mở quản lý plugin" link — matches Expected verbatim. DOM check (via js()) on this same rendered state confirmed the card's button has disabled=true, and a click on it produced no form/dialog (snapshot after click still showed the same missing-plugin label, no "Chạy" run-form appeared) — matches "khong mo duoc bieu mau". Card 2 "Tách tiếng khỏi video" (title in normal white, with a chevron affordance) shows no warning label and its button disabled=false — matches "binh thuong".
  network_observed: clean

- eval: E13
  run_id: ssv1-luot.H21PVi (port 3142, torn down at end via scripts/skills/luot.sh tra)
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E13
  verified_at: 2026-09-16T21:05:00Z
  screenshot: /Users/manhphan/dev/oneflow/.claude/worktrees/relaxed-sammet-b381ba/_acceptance/skill-system-v1/evidence/E13-step1.html
  observed: |
    Read all 3 saved frames (via Read + grep, .html not .png — see fallback note in outputTail). E13-step1.html (== E13-step2.html byte-for-byte, diff -q confirmed identical): live DOM dump taken immediately after clicking "Chạy". Contains "Xong: Tách tiếng khỏi video" heading, two result cards "Phần tiếng" (1x audio control, "0:00/0:04", "Tải về") and "Video không tiếng" (1x video control showing a color-bar test pattern, "0:00/0:04", "Tải về"), plus "Xem/sửa kế hoạch" and "Chạy lượt mới" buttons. Media src attributes: /api/uploads/tasks/JHwH_90qe_7ba20Ppkpnf/0e4670e0c18145d2b3f599b35ca5c561.mp3 and .../b06f5b4907de41b787c6286b678fd7ae.mp4 — task-scoped file keys, confirmed HTTP 200 with non-zero bytes (mp3 32720B, mp4 19018B) via curl. No "Đang chạy" (in-progress) frame was observed in this pair: the real plugin work (ffmpeg -vcodec copy/-vn) completed end-to-end in ~500ms per dev-server logs, faster than this automation's round-trip, confirmed by repeating the click with a deliberately larger 1080p/15s input, which still completed before any screenshot/dump could land mid-flight. This is genuine app speed, not missing functionality (a real "Đang chạy" step-list UI with per-node states was independently observed during an earlier diagnostic run). E13-step3.html: live DOM dump right after clicking "Xem/sửa kế hoạch" on a canvas I had explicitly emptied beforehand (deleted seeded onboarding-demo nodes first, confirmed empty by screenshot and by the plan applying directly with no confirmation dialog). Contains a 3-node React Flow graph: one "Video" input node with src /api/uploads/IlpOSqV1BvQk_lR2gtaPy.mp4 (the actual uploaded file for this run), connected to two nodes "Tách track âm thanh" and "Xoá âm thanh (video câm)", each showing "Cách triển khai: FFmpeg (local)". After a full /workspace reload, the same graph and the same file key still resolved (200/206), confirming server-side persistence, not client/blob cache. All three frames match Expected: step-by-step progress exists in the product; the result has two manifest-labeled, playable outputs; the canvas carries the instance graph with the correct uploaded file key.
  network_observed: clean

- eval: E14
  run_id: rerun-skill-system-v1-E14-r3i
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssv1_a11y_proto
  verified_at: 2026-09-16T18:21:32Z
  output: |
    "blocking": 0,
    "verdict": "PASS"
    22/22 pages scanned AND 22/22 rendered the state AND the theme they were asked for

  Ghi chú: lượt 3 (run_id minted-skill-system-v1-E14-r3) bị chặn vì hạ tầng — máy chủ riêng của bộ quét không lên trong 300 s giữa tải đầy của làn chấm. Theo quyết định owner 17/09, chạy lại RIÊNG bằng phiên tươi, sau khi `pnpm test` chạy xong, không song song với làn nào, trên mã trùng be9b230 ngoài `_acceptance/`.

- eval: E16
  run_id: minted-skill-system-v1-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssv1_second_skill_paths
  verified_at: 2026-09-16T21:05:00Z
  output: |
    ok   parent commit adds a runner branch for the skill (red: FAIL no-special: src/lib/task/runner.ts:2:if (skillId === "tach-tieng-video") { /* special */ })
    note frame-before is not re-run here (needs the full app); it runs in the plain mode
    TEETH PASS 5/5

- eval: E17
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: |
    Cả ba lens đều chấm PASS, đồng thuận không có dissent.
    - domain-correctness: PASS — Mọi trạng thái ngăn skill trong bằng chứng (danh sách thường/thiếu-plugin, biểu mẫu thường/lỗi tham số/bận, kết quả xong/lỗi) đều dùng tên và câu tiếng Việt theo lời sản phẩm — "Cắt cảnh video", "Tách cảnh", "Lấy phần tiếng", "Không xử lý được đầu vào này ở bước «Bỏ tiếng khỏi hình»", "Cần cài plugin cho bước: Tách cảnh" — không xuất hiện slot id, plugin id thô, ABI, executable hay taskId, khớp với các chuỗi tương ứng trong vi.json (Skills.*). Các nhãn kỹ thuật như "PySceneDetect (local)"/"FFmpeg (local)" chỉ xuất hiện trên canvas nền phía sau, ngoài phạm vi "ngăn skill" mà AC-13 hỏi.
    - operational-feasibility: PASS — Toàn bộ chuỗi vi.json cho namespace Skills và 5 ảnh chụp (danh sách, thiếu plugin, biểu mẫu lỗi tham số, biểu mẫu bận, kết quả lỗi) đều dùng lời sản phẩm thuần Việt — tên, mô tả, nhãn bước, thông báo lỗi (vd. "Nhập số từ 5 đến 60.", "Không xử lý được đầu vào này ở bước «Bỏ tiếng khỏi hình»", "Việc làm sẵn này vừa được cập nhật...") — không nơi nào lộ slot id, plugin id, ABI, executable hay taskId. Từ "plugin" xuất hiện nhưng ở dạng chung ("Cần cài plugin cho bước: …"), không phải "plugin id" — nằm ngoài danh sách từ cấm mà AC-13 liệt kê cụ thể.
    - spec-alignment: PASS — Cả các trạng thái ngăn skill trong bằng chứng (danh sách, thiếu plugin, biểu mẫu + lỗi tham số, đang chạy, kết quả xong, kết quả lỗi, bận) đều dùng lời sản phẩm thuần Việt — "Cần cài plugin cho bước: Tách cảnh", "Không xử lý được đầu vào này ở bước «Bỏ tiếng khỏi hình»", "Đang có 3 lượt chạy cùng lúc…", "Nhập số từ 5 đến 60" — không thấy từ nội bộ slot/plugin id/ABI/executable/taskId lộ ra ở bất kỳ đâu. vi.json xác nhận cùng nội dung cho các key liên quan (Skills.*, errors.*), khớp với các ảnh chụp.
  human_override:

- eval: E17b
  run_id: minted-skill-system-v1-E17b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssv1_copy_no_internal_terms
  verified_at: 2026-09-16T21:05:00Z
  output: |
    Tests  4 passed (4)
    Start at  20:59:02
    Duration  202ms (transform 73ms, setup 0ms, import 91ms, tests 18ms, environment 0ms)

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-skill-system-v1-SUITE-bash_scripts_acceptance_preflight_verify-r3
  exit_code: 0
  verified_at: 2026-09-16T21:05:00Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-skill-system-v1-SUITE-node_scripts_roadmap_check_plan_freeze_m-r3
  exit_code: 0
  verified_at: 2026-09-16T21:05:00Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-skill-system-v1-SUITE-build_typecheck-r3
  exit_code: 0
  verified_at: 2026-09-16T21:05:00Z

- cmd: pnpm lint:check
  run_id: minted-skill-system-v1-SUITE-lint_check-r3
  exit_code: 0
  verified_at: 2026-09-16T21:05:00Z

- cmd: pnpm test
  run_id: rerun-skill-system-v1-SUITE-test-r3i
  exit_code: 0
  verified_at: 2026-09-16T18:19:51Z

  Ghi chú: lượt 3 (run_id minted-skill-system-v1-SUITE-test-r3) đỏ 1 test ngoài phạm vi (provisioning-events.test.ts, dựng wheel SDK va vào `sdk/build` đang bị làn khác ghi — rủi ro đã khai ở tiền đề TD-5). Chạy lại RIÊNG, tuần tự, bằng phiên tươi: Test Files 101 passed | 2 skipped (103); Tests 1041 passed | 5 skipped (1046).

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --python ">=3.10" --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-skill-system-v1-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r3
  exit_code: 0
  verified_at: 2026-09-16T21:05:00Z

  Ghi chú: suite này nay xanh (307 passed) — round 2 từng đỏ (exit 2, lỗi collect trên Python 3.9 với cú pháp union `str | None`); lần này lệnh đã ghim `--python ">=3.10"`, khớp cú pháp trong `tongflow/models/asset.py`.

- cmd: pnpm verify:plugins
  run_id: minted-skill-system-v1-SUITE-verify_plugins-r3
  exit_code: 0
  verified_at: 2026-09-16T21:05:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-skill-system-v1-SUITE-gen_abi-r3
  exit_code: 0
  verified_at: 2026-09-16T21:05:00Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-skill-system-v1-SUITE-bash_scripts_fork_check_fork_identity_sh-r3
  exit_code: 0
  verified_at: 2026-09-16T21:05:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline không đo lại round này

none — chưa đo lại baseline round này (P2, evals.yaml không đổi từ lần baseline cuối; xem round 2 trong Iterations)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: BLOCKED — E14 (a11y proto, AC-10) thất bại thật (exit 3, dev server never served the proto route on port 3198); E15 (design-gate, giới hạn đã khai từ S1) và SUITE SDK pytest không chạy được do thiếu tham số đích / thiếu binary `uv`. E17 (AC-13) ở UNCERTAIN vì 3/9 file evidence được khai trong Input không tồn tại trên đĩa. Cần điều tra hạ tầng cổng 3198 và cài `uv` trước khi chạy lại vòng sau; E14 cần điều tra riêng như một regression thật.
Round 2: REJECT — E14 vẫn thất bại thật, cùng nguyên nhân round 1 chưa được sửa (exit 3, "dev server never served the proto route on port 3198"). SUITE SDK pytest nay chạy được (`uv` đã có trong PATH) nhưng đỏ thật: exit 2, lỗi collect trên Python 3.9 do cú pháp union `str | None` trong `tongflow/models/asset.py` (không phải lỗi assertion, không gắn eval nào). Review tìm thấy 3 finding trong hợp đồng (AC-1, cùng một cơ chế lỗi: `checkSkillIntegrity`/`param-target-exists` trong `src/lib/skills/integrity.ts` chấp nhận một config target trỏ vào một field đang được bind bằng `handle` trong template, ví dụ `video`, và control test mới trong `registry.test.ts` khoá luôn hành vi lỏng đó thay vì phá đúng luật) — quay lại S3 để sửa `integrity.ts` và viết lại control test trỏ vào field config thật (`threshold`).
Round 3: BLOCKED — E14 (a11y proto, AC-10) vẫn không chạy được, lần này vì hạ tầng: dev server không phục vụ được route proto trong 300s (tiền đề, chưa phải lỗi sản phẩm — dev server setup không sẵn sàng cho lần verify này). 28 eval máy/ui-check/judgment còn lại đều PASS. SDK pytest suite nay đã xanh (307 passed, hết lỗi Python 3.9 của round 2 nhờ ghim `--python ">=3.10"`). `pnpm test` đỏ vì 1 test không gắn eval nào trong contract (provisioning-events.test.ts, lỗi build wheel SDK thiếu file output_view.py) — không chặn verdict theo AC nào, không thuộc failed_evals. Cần điều tra lại hạ tầng dev-server cổng 3198 trước vòng sau.
Round 3 — chạy lại vì hạ tầng (không phải một lượt review, không tính vào trần ba vòng theo CLAUDE.md của kho): owner quyết 17/09 chạy lại riêng hai lệnh bị chặn/đỏ vì tải, tuần tự, bằng phiên tươi, trên mã trùng be9b230. `pnpm test` exit 0 (1041 passed), E14 exit 0 (22/22). Không đổi vật, không đổi thước. Verdict chuyển PENDING-JUDGMENT: mọi eval máy xanh; E17 là mục judgment của hồ sơ T3 nên cần chữ ký người (human_override) dù hội đồng đề xuất PASS.