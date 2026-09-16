---
schema_version: 2
feature_slug: skill-system-v1
verdict: BLOCKED
failed_evals: [E14]
reason: |
  2 lệnh không chạy được ở round này (khiến verdict là BLOCKED, chưa xét được toàn bộ round):
  (1) E15 — `node $(ls $HOME/.claude/plugins/cache/*/acceptance-gate/*/scripts/design-gate.mjs | sort -V | tail -1) --jsdom .`: design-gate.mjs cần một tham số file/thư mục đích cụ thể, lệnh gọi không truyền tham số đó (target: null trong output JSON của chính script) → script tự thoát với verdict nội bộ BLOCKED, exit_code tiến trình 1. Đây đúng là giới hạn đã khai từ S1 (xem "expected" của E15: "KHONG CHAY — gioi han da biet"), nhưng lệnh vẫn để lại một cannotRun cần ghi nhận.
  (2) SUITE SDK pytest — `cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project ... python -m pytest -q`: công cụ `uv` không có trong PATH của máy verify, là tiền đề bắt buộc để dựng môi trường và chạy pytest cho sdk/. exit_code tiến trình 1 ("command not found: uv").
  Ngoài hai cannotRun trên, E14 (`bash scripts/skills/check-a11y-proto.sh`) THẤT BẠI THẬT, không phải do hạ tầng verify: exit_code 3, "dev server never served the proto route on port 3198" — liệt trong failed_evals, cần điều tra ở vòng sau (không phải lỗi đo).
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 98a96d78290feb6e3eb54cdfcdf26381f90dceee
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
| E15 | AC-10 | script | BLOCKED (cannotRun — giới hạn đã khai từ S1) |
| E16 | AC-12 | script | PASS |
| E17 | AC-13 | judgment | UNCERTAIN |
| E17b | AC-13 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-skill-system-v1-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_registry_integrity
  verified_at: 2026-09-16T19:59:37Z
  output: |
    Tests  13 passed (13)
    Start at  19:59:37
    Duration  271ms (transform 131ms, setup 0ms, import 182ms, tests 8ms, environment 0ms)

- eval: E2
  run_id: minted-skill-system-v1-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_params_route
  verified_at: 2026-09-16T19:59:39Z
  output: |
    Tests  7 passed (7)
    Start at  19:59:39
    Duration  387ms (transform 72ms, setup 0ms, import 28ms, tests 287ms, environment 0ms)

- eval: E3
  run_id: minted-skill-system-v1-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_instantiate
  verified_at: 2026-09-16T19:59:38Z
  output: |
    Tests  4 passed (4)
    Start at  19:59:38
    Duration  415ms (transform 269ms, setup 0ms, import 327ms, tests 5ms, environment 0ms)

- eval: E4
  run_id: minted-skill-system-v1-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_run_refusals
  verified_at: 2026-09-16T19:59:38Z
  output: |
    Tests  5 passed (5)
    Start at  19:59:38
    Duration  428ms (transform 77ms, setup 0ms, import 31ms, tests 314ms, environment 0ms)

- eval: E5
  run_id: minted-skill-system-v1-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_run_task_row
  verified_at: 2026-09-16T19:59:38Z
  output: |
    Tests  1 passed (1)
    Start at  19:59:38
    Duration  488ms (transform 124ms, setup 0ms, import 38ms, tests 353ms, environment 0ms)

- eval: E6
  run_id: minted-skill-system-v1-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_runner_dispatch
  verified_at: 2026-09-16T19:59:37Z
  output: |
    Tests  2 passed (2)
    Start at  19:59:37
    Duration  629ms (transform 244ms, setup 0ms, import 39ms, tests 512ms, environment 0ms)

- eval: E7
  run_id: minted-skill-system-v1-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_runs_collect
  verified_at: 2026-09-16T19:59:38Z
  output: |
    Tests  6 passed (6)
    Start at  19:59:38
    Duration  507ms (transform 127ms, setup 0ms, import 55ms, tests 357ms, environment 0ms)

- eval: E7b
  run_id: minted-skill-system-v1-E7b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_runs_failed_step
  verified_at: 2026-09-16T19:59:38Z
  output: |
    Tests  1 passed (1)
    Start at  19:59:38
    Duration  451ms (transform 153ms, setup 0ms, import 29ms, tests 350ms, environment 0ms)

- eval: E8
  run_id: minted-skill-system-v1-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssv1_e2e_tach_tieng
  verified_at: 2026-09-16T19:59:40Z
  output: |
    PASS output tieng: 32720 bytes · audio=1 video=0
    PASS output video-cam: 19018 bytes · audio=0 video=1
    PASS e2e tach-tieng-video

- eval: E9
  run_id: minted-skill-system-v1-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_sheet_list_form
  verified_at: 2026-09-16T19:59:38Z
  output: |
    Tests  3 passed (3)
    Start at  19:59:38
    Duration  1.16s (transform 236ms, setup 0ms, import 657ms, tests 124ms, environment 298ms)

- eval: E9b
  run_id: minted-skill-system-v1-E9b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_skills_list_route
  verified_at: 2026-09-16T19:59:37Z
  output: |
    Tests  3 passed (3)
    Start at  19:59:37
    Duration  708ms (transform 107ms, setup 0ms, import 26ms, tests 612ms, environment 0ms)

- eval: E10
  run_id: minted-skill-system-v1-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_sheet_run_states
  verified_at: 2026-09-16T19:59:39Z
  output: |
    Tests  2 passed (2)
    Start at  19:59:39
    Duration  1.21s (transform 281ms, setup 0ms, import 404ms, tests 434ms, environment 303ms)

- eval: E11
  run_id: minted-skill-system-v1-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_plan_to_canvas
  verified_at: 2026-09-16T19:59:38Z
  output: |
    Tests  3 passed (3)
    Start at  19:59:38
    Duration  1.31s (transform 291ms, setup 0ms, import 699ms, tests 163ms, environment 356ms)

- eval: E11b
  run_id: minted-skill-system-v1-E11b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_plan_route
  verified_at: 2026-09-16T19:59:38Z
  output: |
    Tests  2 passed (2)
    Start at  19:59:38
    Duration  542ms (transform 159ms, setup 0ms, import 51ms, tests 406ms, environment 0ms)

- eval: E12
  run_id: ssv1-luot.ksvKoO (PORT=3140, BASE=http://localhost:3140)
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E12
  verified_at: 2026-09-16T12:00:00Z
  screenshot: /Users/manhphan/dev/oneflow/.claude/worktrees/relaxed-sammet-b381ba/evidence/E12-step1.png
  observed: |
    Đọc từng frame đã lưu bằng Read (ảnh thật, không suy đoán từ lệnh):
    - E12-step1.png: panel "Skill" mở bên trái, phụ đề "Chọn một việc làm sẵn, đưa đầu vào, nhận kết quả — không cần tự lắp từng bước." Danh sách đúng HAI mục tiếng Việt: "Cắt cảnh video" và "Tách tiếng khỏi video". Khớp Expected khung 1.
    - E12-step2.png: sau khi bấm "Tách tiếng khỏi video" — tiêu đề, mô tả, field "Video *" (dấu * đỏ, bắt buộc), nút "Chọn video", nút "Chạy" xám mờ (disabled=true theo DOM). Khớp Expected khung 2.
    - E12-step3.png: sau upload mau.mp4 — ô Video hiện tên file + "Đổi tệp"; nút "Chạy" chuyển nền trắng/sáng (disabled=false theo DOM). Khớp Expected khung 3.
    Không có mâu thuẫn nào với Expected trong 3 frame.
  network_observed: clean
  output: |
    Ghi chú lệch với hướng dẫn steps: config.yaml có capture.ui = "pnpm ui:capture" nhưng công cụ này chỉ nhận <url> rồi tự điều hướng lại từ đầu, không replay được chuỗi click cần cho 3 khung TRẠNG THÁI TƯƠNG TÁC này. Dùng captureScreenshot() của ego-browser thay thế, ghi PNG thật ra đĩa rồi copy sang evidence/E12-stepN.png. Tất cả assertion: PASS. exitCode=0.

- eval: E12b
  run_id: ssv1-luot.rx6ujN (PORT=3141, torn down)
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E12b
  verified_at: 2026-09-16T12:30:00Z
  screenshot: _acceptance/skill-system-v1/evidence/E12b-step1.png
  observed: |
    Read E12b-step1.png (94218 bytes, full-page capture): sheet "Skill" mở trên canvas /workspace. Card 1 "Cắt cảnh video" hiện dòng cảnh báo "⚠ Cần cài plugin cho bước: Tách cảnh" kèm link "Mở quản lý plugin" — không có biểu mẫu, không có nút "Chạy". Card 2 "Tách tiếng khỏi video" bình thường, chỉ có mô tả + chevron. Khớp Expected. Đối chiếu E12b-step1.dom.json: text card cat-canh-video kết bằng "Cần cài plugin cho bước: Tách cảnh\nMở quản lý plugin"; card tach-tieng-video không có nhãn đó. E12b-step1.png.click-cat-canh.json: {"catCanhOpenedForm": false} — xác nhận bấm card cat-canh-video không mở form.
  network_observed: clean
  output: |
    Cleanup: các bản copy driver puppeteer tạm ở gốc repo đã xoá; git status chỉ còn evidence/ files chưa track. Không sửa code sản phẩm. Verdict: mọi assertion máy-kiểm-được cho E12b/AC-9 PASS. exitCode=0.

- eval: E13
  run_id: minted-skill-system-v1-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E13
  verified_at: 2026-09-16T13:00:00Z
  screenshot: _acceptance/skill-system-v1/evidence/E13-step1.png
  observed: |
    E13-step1.png: sheet Skill hiện "Đang chạy: Tách tiếng khỏi video" cùng hint "Có thể đóng ngăn này — lượt vẫn chạy tiếp." — màn tiến trình giữa lượt (danh sách bước rỗng ở frame này do các bước ffmpeg của mẫu 4s chạy dưới 1 giây, ghi nhận là giới hạn đo, không phải lỗi). E13-step2.png: "Xong: Tách tiếng khỏi video" với hai output card đúng nhãn manifest — "Phần tiếng" (audio control 0:00/0:04) và "Video không tiếng" (video control 0:00/0:04, khung màu hiển thị) — cả hai có "Tải về", cộng "Xem/sửa kế hoạch" và "Chạy lượt mới". E13-step3.png: sau "Xem/sửa kế hoạch" trên canvas trống ban đầu, sheet đóng, tiêu đề workspace đổi thành "Tách tiếng khỏi video", canvas có đúng 3 node react-flow: "Video" (640×360, preview phát được) + "Tách track âm thanh" + "Xoá âm thanh (video câm)" (đều "Cách triển khai: FFmpeg (local)"). DOM check xác nhận fileKeys[0] của node Video khớp đúng fileKey do lượt này upload ("tcNyNHiyNJx0PJyNNXvBz.mp4") — canvas mang đồ thị instance, không phải template trừu tượng.
  network_observed: clean
  output: |
    Step 4: trả lượt qua `bash scripts/skills/luot.sh tra <dir>` — xác nhận cổng 3140 đã giải phóng, thư mục tmp của lượt đã bị xoá. Không đụng hai phiên ssv1-luot khác hay server :3198 a11y đang chạy song song. Không sửa code sản phẩm; chỉ ghi evidence/ và driver tạm tự xoá. All assertions PASS → exitCode 0.

- eval: E14
  run_id: minted-skill-system-v1-E14-r1
  exit_code: 3
  baseline: n-a
  verifier: config:executors.script.ssv1_a11y_proto
  verified_at: 2026-09-16T13:15:00Z
  output: |
    FAIL: dev server never served the proto route on port 3198
  # Lệnh fail khong gan eval trùng khớp: `bash scripts/skills/check-a11y-proto.sh` (exitCode 3) — cùng lệnh, cùng exit code với block trên, không phải một thất bại thứ hai riêng biệt.

- eval: E15
  run_id: design-gate-52f7607d64
  exit_code: 1
  baseline: red
  verifier: config:executors.design.gate
  verified_at: 2026-09-16T12:59:46.931Z
  output: |
    {
      "run_id": "design-gate-52f7607d64",
      "verifier": "scripts/design-gate.mjs (vendored Impeccable detector)",
      "verified_at": "2026-09-16T12:59:46.931Z",
      "target": null,
      "fail_on": ["P0"],
      "reason": "no target file given",
      "exit_code": 4
    }
    cannotRun: script design-gate.mjs cần một tham số file/thư mục đích, lệnh không truyền — đúng giới hạn đã khai từ S1 (E15.expected: "KHONG CHAY", a11y thật đã có ở E14).

- eval: E16
  run_id: minted-skill-system-v1-E16-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssv1_second_skill_paths
  verified_at: 2026-09-16T13:20:00Z
  output: |
    ok   parent commit adds a runner branch for the skill (red: FAIL no-special: src/lib/task/runner.ts:2:if (skillId === "tach-tieng-video") { /* special */ })
    note frame-before is not re-run here (needs the full app); it runs in the plain mode
    TEETH PASS 5/5

- eval: E17
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  rationale: |
    Cả ba lens đều báo UNCERTAIN vì 3/9 file evidence được liệt trong Input (evidence/E12-step1.png, evidence/E12b-step1.png, evidence/E13-step2.png) không tồn tại trên đĩa tại thời điểm chấm. 4 ảnh design-pass còn đọc được (bieumau-loi-tham-so, bieumau-ban, ketqua-loi, danhsach-thieu-plugin) cùng namespace "Skills" trong vi.json cho thấy chữ sản phẩm sạch, không lộ slot/plugin id/ABI/executable/taskId — nhưng AC-13 đòi xét "mọi trạng thái trong bảng trạng thái của thiết kế", trong khi bằng chứng hiện có chỉ phủ một phần nhỏ (không có trạng thái đang-chạy theo bước SSE, không có kết-quả-thành-công) và thiếu đúng 3 file được chỉ định.
  required_evidence:
    - "Khôi phục/tạo lại 3 tệp _acceptance/skill-system-v1/evidence/E12-step1.png, E12b-step1.png, E13-step2.png (không tồn tại trên đĩa) — nếu cho thấy chữ sản phẩm sạch thì verdict có thể chuyển PASS, nếu lộ thuật ngữ nội bộ thì chuyển FAIL."
    - "Ảnh chụp trạng thái đang-chạy theo từng bước (SSE NODE_* / GET /api/skills/runs/<taskId>) xác nhận nhãn bước chỉ dùng chuỗi manifest tiếng Việt, không lộ nodeId/taskId/plugin id."
    - "Ảnh chụp trạng thái kết quả thành công (resultTitle + danh sách output theo nhãn manifest) để đối chiếu không có file_key/executable/ABI nào bị in ra màn hình."
    - "Các ảnh trạng thái còn lại của ngăn skill theo bảng trạng thái thiết kế đã có sẵn ở evidence/design-pass (vd. danhsach-mac-dinh, bieumau-dang-tai-len, chay-dang-chay, ketqua-xong, kehoach-xac-nhan) cần được đưa vào phạm vi Input của lượt chấm kế tiếp để phủ đủ 'mọi trạng thái'."
  human_override:

- eval: E17b
  run_id: minted-skill-system-v1-E17b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ssv1_copy_no_internal_terms
  verified_at: 2026-09-16T19:59:49Z
  output: |
    Tests  4 passed (4)
    Start at  19:59:49
    Duration  139ms (transform 35ms, setup 0ms, import 48ms, tests 14ms, environment 0ms)

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-skill-system-v1-SUITE-bash_scripts_acceptance_preflight_verify-r1
  exit_code: 0
  verified_at: 2026-09-16T19:59:30Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-skill-system-v1-SUITE-node_scripts_roadmap_check_plan_freeze_m-r1
  exit_code: 0
  verified_at: 2026-09-16T19:59:31Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-skill-system-v1-SUITE-build_typecheck-r1
  exit_code: 0
  verified_at: 2026-09-16T19:59:33Z

- cmd: pnpm lint:check
  run_id: minted-skill-system-v1-SUITE-lint_check-r1
  exit_code: 0
  verified_at: 2026-09-16T19:59:35Z

- cmd: pnpm test
  run_id: minted-skill-system-v1-SUITE-test-r1
  exit_code: 0
  verified_at: 2026-09-16T19:59:49Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-skill-system-v1-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r1
  exit_code: 1
  verified_at: 2026-09-16T13:25:00Z
  # cannotRun: "uv" không có trong PATH của máy verify — tiền đề bắt buộc cho pytest suite của sdk/. output: "command not found: uv"

- cmd: pnpm verify:plugins
  run_id: minted-skill-system-v1-SUITE-verify_plugins-r1
  exit_code: 0
  verified_at: 2026-09-16T19:59:52Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-skill-system-v1-SUITE-gen_abi-r1
  exit_code: 0
  verified_at: 2026-09-16T19:59:54Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-skill-system-v1-SUITE-bash_scripts_fork_check_fork_identity_sh-r1
  exit_code: 0
  verified_at: 2026-09-16T19:59:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nào khai runs > 1 trong round này (không có eval ngẫu nhiên)

## Iterations

Round 1: BLOCKED — E14 (a11y proto, AC-10) that bai that (exit 3, dev server never served the proto route on port 3198); E15 (design-gate, gioi han da khai tu S1) va SUITE SDK pytest khong chay duoc do thieu tham so dich / thieu binary `uv`. E17 (AC-13) o UNCERTAIN vi 3/9 file evidence duoc khai trong Input khong ton tai tren dia. Can dieu tra ha tang cong 3198 va cai `uv` truoc khi chay lai vong sau; E14 can dieu tra rieng nhu mot regression that.
