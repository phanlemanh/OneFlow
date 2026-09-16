---
schema_version: 2
feature_slug: skill-system-v1
verdict: REJECT
failed_evals: [E14]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4645a51c0eac0e0a65f88da58b4e4f4040ec6142
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
| E14 | AC-10 | script | FAIL |
| E16 | AC-12 | script | PASS |
| E17 | AC-13 | judgment | PASS |
| E17b | AC-13 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-skill-system-v1-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_registry_integrity
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  20 passed (20)
    Start at  20:27:59
    Duration  167ms (transform 76ms, setup 0ms, import 108ms, tests 6ms, environment 0ms)

- eval: E2
  run_id: minted-skill-system-v1-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_params_route
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  7 passed (7)
    Start at  20:28:01
    Duration  458ms (transform 100ms, setup 0ms, import 36ms, tests 337ms, environment 0ms)

- eval: E3
  run_id: minted-skill-system-v1-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_instantiate
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  4 passed (4)
    Start at  20:28:01
    Duration  319ms (transform 156ms, setup 0ms, import 215ms, tests 8ms, environment 0ms)

- eval: E4
  run_id: minted-skill-system-v1-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_run_refusals
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  5 passed (5)
    Start at  20:28:01
    Duration  470ms (transform 105ms, setup 0ms, import 42ms, tests 347ms, environment 0ms)

- eval: E5
  run_id: minted-skill-system-v1-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_run_task_row
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  1 passed (1)
    Start at  20:28:01
    Duration  513ms (transform 127ms, setup 0ms, import 34ms, tests 395ms, environment 0ms)

- eval: E6
  run_id: minted-skill-system-v1-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_runner_dispatch
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  2 passed (2)
    Start at  20:28:01
    Duration  567ms (transform 216ms, setup 0ms, import 31ms, tests 450ms, environment 0ms)

- eval: E7
  run_id: minted-skill-system-v1-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_runs_collect
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  6 passed (6)
    Start at  20:28:02
    Duration  402ms (transform 78ms, setup 0ms, import 36ms, tests 286ms, environment 0ms)

- eval: E7b
  run_id: minted-skill-system-v1-E7b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_runs_failed_step
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  1 passed (1)
    Start at  20:28:02
    Duration  474ms (transform 157ms, setup 0ms, import 32ms, tests 370ms, environment 0ms)

- eval: E8
  run_id: minted-skill-system-v1-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssv1_e2e_tach_tieng
  verified_at: 2026-09-16T13:45:13Z
  output: |
    PASS output tieng: 32720 bytes · audio=1 video=0
    PASS output video-cam: 19018 bytes · audio=0 video=1
    PASS e2e tach-tieng-video

- eval: E9
  run_id: minted-skill-system-v1-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_sheet_list_form
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  3 passed (3)
    Start at  20:28:01
    Duration  1.34s (transform 271ms, setup 0ms, import 708ms, tests 137ms, environment 407ms)

- eval: E9b
  run_id: minted-skill-system-v1-E9b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_skills_list_route
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  3 passed (3)
    Start at  20:28:02
    Duration  621ms (transform 108ms, setup 0ms, import 38ms, tests 488ms, environment 0ms)

- eval: E10
  run_id: minted-skill-system-v1-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_sheet_run_states
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  2 passed (2)
    Start at  20:28:02
    Duration  1.37s (transform 320ms, setup 0ms, import 453ms, tests 486ms, environment 343ms)

- eval: E11
  run_id: minted-skill-system-v1-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_plan_to_canvas
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  3 passed (3)
    Start at  20:28:01
    Duration  1.49s (transform 331ms, setup 0ms, import 853ms, tests 187ms, environment 359ms)

- eval: E11b
  run_id: minted-skill-system-v1-E11b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_plan_route
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  2 passed (2)
    Start at  20:28:02
    Duration  387ms (transform 78ms, setup 0ms, import 26ms, tests 285ms, environment 0ms)

- eval: E12
  run_id: minted-skill-system-v1-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E12
  verified_at: 2026-09-16T13:45:13Z
  screenshot: /Users/manhphan/dev/oneflow/.claude/worktrees/relaxed-sammet-b381ba/_acceptance/skill-system-v1/evidence/E12-step1.png
  observed: |
    E12-step1.png (81530 bytes): Skill panel dialog open over the workspace canvas, listing exactly two Vietnamese-named skill cards — "Cắt cảnh video" (with description) and "Tách tiếng khỏi video" (with description) — matches "danh sach hai skill tieng Viet". E12-step2.png (72710 bytes): after selecting "Tách tiếng khỏi video", the form shows heading "Tách tiếng khỏi video", a "Video" field labeled with a required marker "* (Bắt buộc)", a "Chọn video" file picker, helper text "Video có tiếng", and a "Chạy" button rendered visibly greyed/disabled — matches "bieu mau voi o bat buoc co dau va Chạy vo hieu" (confirmed programmatically too: button.disabled === true before upload). E12-step3.png (73627 bytes): same form now shows "Đổi tệp" + filename "mau.mp4" next to the Video field (upload succeeded) and the "Chạy" button is now visibly enabled/highlighted — matches "sau tai len Chạy bat" (confirmed programmatically: button.disabled === false after upload).
  network_observed: clean

- eval: E12b
  run_id: ssv1-luot.qVaOqB (PORT=3142, torn down)
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E12b
  verified_at: 2026-09-16T13:45:13Z
  screenshot: /Users/manhphan/dev/oneflow/.claude/worktrees/relaxed-sammet-b381ba/_acceptance/skill-system-v1/evidence/E12b-step1.png
  observed: |
    Mo file evidence/E12b-step1.png bang Read (anh that): ngan Skill mo, tieu de "Skill", phu de "Chọn một việc làm sẵn, đưa đầu vào, nhận kết quả — không cần tự lắp từng bước.". The tren "Cắt cảnh video" hien mo ta + badge mau xam "🧩 Cần cài plugin cho bước: Tách cảnh" + dong "Mở quản lý plugin", KHONG co mui ten '>' o ben phai (khac han the duoi) → khong bam mo duoc bieu mau. The duoi "Tách tiếng khỏi video" hien mo ta binh thuong VA CO mui ten '>' ben phai (dau hieu the co the bam mo). Doi chieu Expected: dung 100% - dung 2 the, dung nhan mismatch-plugin tieng Viet tren dung the cat-canh, the tach-tieng binh thuong. Da doi chieu them bang cach doc DOM that (data-testid=skill-card-cat-canh-video / skill-card-tach-tieng-video) qua page.evaluate trong luc chup: text khop tung chu voi anh. Va doi chieu voi GET /api/skills cua chinh luot (curl truc tiep): cat-canh-video co missingSlots=["split-video"], tach-tieng-video co missingSlots=[] — dung dau hieu server-side "tinh tu registry plugin that cua luot" ma Expected doi hoi (luot nay CHI cai plugin ffmpeg, khong cai pyscenedetect nen slot split-video thieu).
  network_observed: clean

- eval: E13
  run_id: Om7Bk66EP-QR9kQVOCIJ5
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E13
  verified_at: 2026-09-16T13:45:13Z
  screenshot: _acceptance/skill-system-v1/evidence/E13-step1.png
  observed: |
    E13-step1.png: sheet shows "Đang chạy: Tách tiếng khỏi video" with two step rows "Lấy phần tiếng" và "Bỏ tiếng khỏi hình", both with a spinner and status "Chờ" — progress-by-step, matches expected. E13-step2.png: sheet shows "Xong: Tách tiếng khỏi video" with two output cards: "Phần tiếng" (an audio player, 0:00/0:04, "Tải về") and "Video không tiếng" (a video player, 0:00/0:04, colour-bar test pattern visibly loaded, "Tải về") — two labelled, playable outputs, matches expected. E13-step3.png: after clicking «Xem/sửa kế hoạch» on a canvas that already held an unsaved demo graph, the app raised its own confirm dialog "Thay đồ thị đang có trên canvas?" (expected app behaviour, not a defect); after confirming "Thay" and Fit-View, the canvas shows exactly the instance graph: one "Video" node (640×360, thumbnail = the uploaded sample) wired to two FFmpeg nodes, "Tách track âm thanh" (Tách âm thanh, FFmpeg local) and "Xoá âm thanh (video câm)" (Xoá âm thanh, FFmpeg local) — matches "canvas mang đồ thị instance … hai node ffmpeg + node video".
  network_observed: clean

- eval: E14
  run_id: minted-skill-system-v1-E14-r2
  exit_code: 3
  baseline: n-a
  verifier: config:executors.script.ssv1_a11y_proto
  verified_at: 2026-09-16T13:45:13Z
  output: |
    FAIL: dev server never served the proto route on port 3198

- eval: E16
  run_id: minted-skill-system-v1-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssv1_second_skill_paths
  verified_at: 2026-09-16T13:45:13Z
  output: |
    ok   parent commit adds a runner branch for the skill (red: FAIL no-special: src/lib/task/runner.ts:2:if (skillId === "tach-tieng-video") { /* special */ })
    note frame-before is not re-run here (needs the full app); it runs in the plain mode
    TEETH PASS 5/5

- eval: E17
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: |
    Cả ba lens đều chấm PASS, đồng thuận không có dissent. Toàn bộ bằng chứng được cấp (namespace Skills trong vi.json, 8 ảnh evidence E12/E12b/E13 + 4 ảnh design-pass đã đọc ở round trước) dùng lời sản phẩm tiếng Việt thuần cho tên skill, tên bước, thông báo lỗi; grep các từ khoá nội bộ (slot, plugin id, pluginId, ABI, executable, taskId, node) trên vi.json và trên nội dung ảnh không ra kết quả nào lộ thuật ngữ nội bộ.
    - domain-correctness: PASS — vi.json (Skills namespace) và cả 8 ảnh bằng chứng (liệt kê, thiếu plugin, biểu mẫu tham số hợp lệ/lỗi khoảng giá trị, đang bận, đang chạy từng bước, kết quả thành công, kết quả lỗi có "Chạy lại"/"Sửa đầu vào") đều dùng lời sản phẩm tiếng Việt thuần — tên bước hiển thị là "Tách cảnh"/"Bỏ tiếng khỏi hình" chứ không phải nodeId/slot; grep các từ khoá nội bộ (slot, plugin id, abi, executable, taskid) trên toàn vi.json không ra kết quả. Không thấy vi phạm ở bất kỳ trạng thái nào trong phạm vi bằng chứng được cấp.
    - operational-feasibility: PASS — Cả 7 ảnh chụp (danh sách rỗng/thiếu plugin, biểu mẫu mặc định/lỗi tham số/bận, kết quả xong/lỗi) và toàn bộ chuỗi văn bản trong src/i18n/messages/vi.json (namespace Skills) đều dùng lời sản phẩm thuần Việt — tên skill, mô tả, nhãn tham số, nhãn bước ("Lấy phần tiếng", "Bỏ tiếng khỏi hình"), thông báo lỗi ("Không xử lý được đầu vào này ở bước «Bỏ tiếng khỏi hình». Thử lại, hoặc đổi sang tệp khác.") không nơi nào lộ slot id, plugin id kỹ thuật, ABI, executable hay taskId. Mã lỗi nội bộ (SKILL_VERSION_CHANGED, PLUGIN_NOT_INSTALLED...) chỉ là khoá JSON, giá trị hiển thị cho người dùng đều đã dịch sang câu tiếng Việt bình thường.
    - spec-alignment: PASS — Tất cả evidence được cấp — vi.json (nhãn "Skill", SKILL_VERSION_CHANGED nói bằng lời sản phẩm), E12/E12b/E13 (danh sách skill, badge thiếu plugin, biểu mẫu, màn kết quả xong) và 4 ảnh design-pass (biểu mẫu lỗi tham số, biểu mẫu bận/đang chạy, kết quả lỗi có tên bước "Bỏ tiếng khỏi hình" + nút "Chạy lại", danh sách thiếu plugin mobile) — đều dùng ngôn ngữ sản phẩm tiếng Việt, không thấy chuỗi nội bộ nào (slot, plugin id, ABI, executable, taskId) lộ ra màn hình. Từ "plugin" xuất hiện đúng như văn bản AC-9 quy định ("Cần cài plugin cho bước: …"), không phải rò rỉ id nội bộ.
  human_override:

- eval: E17b
  run_id: minted-skill-system-v1-E17b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_copy_no_internal_terms
  verified_at: 2026-09-16T13:45:13Z
  output: |
    Tests  4 passed (4)
    Start at  20:28:11
    Duration  142ms (transform 40ms, setup 0ms, import 57ms, tests 15ms, environment 0ms)

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-skill-system-v1-SUITE-bash_scripts_acceptance_preflight_verify-r2
  exit_code: 0
  verified_at: 2026-09-16T13:45:13Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-skill-system-v1-SUITE-node_scripts_roadmap_check_plan_freeze_m-r2
  exit_code: 0
  verified_at: 2026-09-16T13:45:13Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-skill-system-v1-SUITE-build_typecheck-r2
  exit_code: 0
  verified_at: 2026-09-16T13:45:13Z

- cmd: pnpm lint:check
  run_id: minted-skill-system-v1-SUITE-lint_check-r2
  exit_code: 0
  verified_at: 2026-09-16T13:45:13Z

- cmd: pnpm test
  run_id: minted-skill-system-v1-SUITE-test-r2
  exit_code: 0
  verified_at: 2026-09-16T13:45:13Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-skill-system-v1-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r2
  exit_code: 2
  verified_at: 2026-09-16T13:45:13Z

  Ghi chú (lệnh đỏ, không gắn eval nào): `uv` nay đã có trong PATH (khác round 1, nơi lệnh này cannotRun vì thiếu `uv`), nhưng lệnh vẫn đỏ thật: `TypeError: Unable to evaluate type annotation 'str | None'` khi pytest collect `tests/test_protocol.py` và `tests/test_slots.py` — môi trường verify chạy Python 3.9, không tương thích cú pháp union `X | None` (Python 3.10+) dùng trong `tongflow/models/asset.py`. 2 lỗi collection, không phải lỗi assertion trong sản phẩm.

- cmd: pnpm verify:plugins
  run_id: minted-skill-system-v1-SUITE-verify_plugins-r2
  exit_code: 0
  verified_at: 2026-09-16T13:45:13Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-skill-system-v1-SUITE-gen_abi-r2
  exit_code: 0
  verified_at: 2026-09-16T13:45:13Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-skill-system-v1-SUITE-bash_scripts_fork_check_fork_identity_sh-r2
  exit_code: 0
  verified_at: 2026-09-16T13:45:13Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: BLOCKED — E14 (a11y proto, AC-10) thất bại thật (exit 3, dev server never served the proto route on port 3198); E15 (design-gate, giới hạn đã khai từ S1) và SUITE SDK pytest không chạy được do thiếu tham số đích / thiếu binary `uv`. E17 (AC-13) ở UNCERTAIN vì 3/9 file evidence được khai trong Input không tồn tại trên đĩa. Cần điều tra hạ tầng cổng 3198 và cài `uv` trước khi chạy lại vòng sau; E14 cần điều tra riêng như một regression thật.
Round 2: REJECT — E14 vẫn thất bại thật, cùng nguyên nhân round 1 chưa được sửa (exit 3, "dev server never served the proto route on port 3198"). SUITE SDK pytest nay chạy được (`uv` đã có trong PATH) nhưng đỏ thật: exit 2, lỗi collect trên Python 3.9 do cú pháp union `str | None` trong `tongflow/models/asset.py` (không phải lỗi assertion, không gắn eval nào). Review tìm thấy 3 finding trong hợp đồng (AC-1, cùng một cơ chế lỗi: `checkSkillIntegrity`/`param-target-exists` trong `src/lib/skills/integrity.ts` chấp nhận một config target trỏ vào một field đang được bind bằng `handle` trong template, ví dụ `video`, và control test mới trong `registry.test.ts` khoá luôn hành vi lỏng đó thay vì phá đúng luật) — quay lại S3 để sửa `integrity.ts` và viết lại control test trỏ vào field config thật (`threshold`).