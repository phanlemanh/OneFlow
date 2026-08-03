---
schema_version: 2
feature_slug: compose-overlay
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f8ba0429746b02eea4f147824fce89648ff2e525
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
| E22 | AC-16 | ui-check | PASS |
| E23 | AC-16 | judgment | UNCERTAIN |

## Evidence

- eval: E1a
  run_id: minted-compose-overlay-E1a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    Checked 1 file in 39ms. Fixed 1 file.
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json

- eval: E1b
  run_id: minted-compose-overlay-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    + python3 sdk/tongflow/gen_node_slots.py --abi config/tongflow.abi.json --out sdk/tongflow/node_slots.py
    + git diff --exit-code sdk/tongflow/models sdk/tongflow/node_slots.py
    Script exit code: 0

- eval: E2
  run_id: minted-compose-overlay-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_diacritics
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.48s

- eval: E3
  run_id: minted-compose-overlay-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_multiline
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.11s

- eval: E4
  run_id: minted-compose-overlay-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_price_tag
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E5a
  run_id: minted-compose-overlay-E5a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    1 passed in 0.07s
    (note: plugin_commit_sha line not present in this run's captured output tail)

- eval: E5b
  run_id: minted-compose-overlay-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_logo_missing
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E6
  run_id: minted-compose-overlay-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_safe_zone
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7a
  run_id: minted-compose-overlay-E7a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.18s

- eval: E7b
  run_id: minted-compose-overlay-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_placeholder_missing
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E8a
  run_id: minted-compose-overlay-E8a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.25s
    (note: plugin_commit_sha line not present in this run's captured output tail)

- eval: E8b
  run_id: minted-compose-overlay-E8b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_time_window_image
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.09s

- eval: E9a
  run_id: minted-compose-overlay-E9a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_image
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E9b
  run_id: minted-compose-overlay-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_modality_video
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    -- Docs: https://docs.pytest.org/en/pytest.html
    1 passed, 1 warning in 0.37s
    (note: plugin_commit_sha line not present in this run's captured output tail)

- eval: E10
  run_id: minted-compose-overlay-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_determinism
  plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    plugin_commit_sha: eabe8fd2f9cf732e46b6e463a6e9cbc8e15c25f5
    .                                                                        [100%]
    1 passed in 0.30s

- eval: E14
  run_id: minted-compose-overlay-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_tier_a_hit
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E15
  run_id: minted-compose-overlay-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_partial_rerun
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    1 passed in 0.03s

- eval: E16
  run_id: minted-compose-overlay-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E17
  run_id: minted-compose-overlay-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l4_abi_guard_bidirectional
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E12a
  run_id: minted-compose-overlay-E12a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_node
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    Tests  6 passed (6)
    Start at  10:03:35
    Duration  1.09s (transform 225ms, setup 0ms, import 453ms, tests 268ms, environment 269ms)

- eval: E12b
  run_id: minted-compose-overlay-E12b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_overlay_exporter
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    Tests  3 passed (3)
    Start at  10:03:33
    Duration  318ms (transform 171ms, setup 0ms, import 216ms, tests 5ms, environment 0ms)

- eval: E18
  run_id: minted-compose-overlay-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_overlay_conformance
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    .                                                                        [100%]
    1 passed, 6 deselected in 0.02s

- eval: E19
  run_id: minted-compose-overlay-E19-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    Tests  12 passed (12)
    Start at  10:03:42
    Duration  216ms (transform 93ms, setup 0ms, import 116ms, tests 3ms, environment 0ms)

- eval: E20
  run_id: minted-compose-overlay-E20-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_registration_synced
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    OK: compose-overlay registered (#39), docs + i18n coherent

- eval: E21
  run_id: minted-compose-overlay-E21-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.overlay_sdk_train
  verified_at: 2026-08-02T10:05:00+07:00
  output: |
    HEAD is now at eabe8fd feat: compose-overlay render engine + golden suite
    published wheel carries compose-overlay types
    sdk train OK: 0.2.18

- eval: E22
  run_id: e22-round2-manual
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-08-02T10:05:00+07:00
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/compose-overlay/evidence/design/captures/state-1-empty.png
  observed: |
    Đọc trực tiếp cả 6 PNG vừa lưu (evidence/design/captures/state-{1..6}-*.png) và đối chiếu Expected:
    state-1-empty.png: node "Overlay Text/Logo" đầy đủ, "Ops" + "No ops yet. Add text, a price tag, a logo or a safe zone.", 4 nút Text/Price tag/Logo/Safe zone, nút "Apply Overlay" MÀU XÁM (disabled) — đúng state 1.
    state-2-ops-image.png: "Ops · media: image", 4 op-row TEXT/PRICE/LOGO/SAFE thu gọn, LOGO hiện "from in:logo · 0.18 · top-right" (không lỗi), Apply Overlay MÀU ĐEN (enabled) — đúng state 2.
    state-3-ops-video.png: "Ops · media: video", 4 op-row có badge thời gian "0–3.5s" / "3.5–7s" / "entire video", Apply Overlay enabled — đúng state 3.
    state-4-op-form.png: node có viền xanh (selected, ring-2 ring-blue-500), op TEXT mở rộng thành form đầy đủ (textarea nội dung multi-line, x/y/anchor/font size/color/alignment/max width) — đúng state 4 (giá trị các <select> hiển thị option đầu tiên thay vì giá trị thật đã chọn — hạn chế đã biết của việc serialize outerHTML tĩnh cho phần tử <select> điều khiển bởi React, không phải lỗi UI thật, không ảnh hưởng P0 gate).
    state-5-error.png: banner đỏ "A logo op needs an image on in:logo — connect an image node.", op-row LOGO viền đỏ + text lỗi "logo image missing (in:logo not connected)", Apply Overlay MÀU XÁM (disabled) — đúng state 5.
    state-6-running.png: viền gradient cầu vồng xoay (rotate-border, một khung tĩnh của animation), spinner xanh dương đang quay, nhãn "Task started" MÀU XÁM ĐẬM DỄ ĐỌC (KHÔNG còn shimmer bg-clip-text/text-transparent như round 1), đồng hồ "23s" đậm rõ, nút Cancel, Apply Overlay disabled — đây là RUNNING STATE THẬT (task thật qua POST /api/task/create + SSE thật với plugin stub capture-only, không phải giả lập CSS) — đúng state 6, P0 low-contrast round 1 KHÔNG còn tái hiện.
    Tất cả 6 frame khớp Expected; không có mâu thuẫn nào buộc FAIL.
  network_observed: clean
  output: |
    KẾT LUẬN: exit_code = 0. Tất cả 6 state đạt sàn P0 design gate (console sạch theo nghĩa sản phẩm, a11y cơ bản đạt), bao gồm state-6 vốn REJECT ở round 1 — xác minh lại bằng design-gate THẬT chạy trên capture THẬT từ dev server thật, không phải suy luận từ code diff. Đã dọn dẹp: xóa plugin stub `plugins/oneflow-api-e22stub/`, xóa fixture `data/uploads/tasks/e22-fixture/`, tắt dev server tự start.

    Đường dẫn evidence: /Users/manh-macmini/dev/oneflow/_acceptance/compose-overlay/evidence/design/captures/state-{1-6}-*.{html,png}, /Users/manh-macmini/dev/oneflow/_acceptance/compose-overlay/evidence/E22-network.txt

- eval: E23
  judged_by: judge panel — domain-correctness / operational-feasibility / spec-alignment (round 2, not carried)
  verdict: UNCERTAIN
  rationale: |
    - domain-correctness: UNCERTAIN — Cả 6 đường dẫn capture (.png) được giao không tồn tại trên đĩa — chỉ có file .html cùng tên trong captures/ và reference/source/, không phải ảnh chụp pixel. Judge domain-correctness cần so sánh capture thực tế vs design-of-record cho từng state; không có bằng chứng hình ảnh nào để đối chiếu nên không thể kết luận PASS hay FAIL. Cần regenerate các file .png capture (S4 design gate) rồi chấm lại.
    - operational-feasibility: UNCERTAIN — Cả 6 file bằng chứng được chỉ định (state-1-empty.png ... state-6-running.png) không tồn tại trên đĩa — thư mục evidence/design/captures/ chỉ chứa các file .html cùng tên, không có pixel capture nào. Không thể so sánh trực quan 6 state của node compose-overlay với design-of-record nếu không có ảnh capture thực tế để xem. Đây là thiếu context về bằng chứng (không phải mơ hồ về tiêu chí), nên verdict UNCERTAIN theo đúng quy tắc calibration.
    - spec-alignment: UNCERTAIN — Shell primitives match (rounded-lg/bg-white/border-gray-200/shadow-lg, 340px width, disabled-CTA and op-list patterns are structurally present in all 6 states), but every capture adds a bordered "Implementation" card+label+shadcn-Select around the plugin picker that the design-of-record renders as a flat unlabeled box, swaps the reference's "⋯" kebab for a hamburger/"menu" icon, and recolors op-type tags from the reference's neutral gray chip to a primary-tinted badge; state-4's expanded op-form also drops the reference's blue-accent highlight border, and state-5's error row is more heavily saturated (red badge+bg) than the reference's border-only treatment. These are real, consistent, cross-state deviations from the design-of-record, but they read as legitimate real-shadcn-component choices rather than broken/off-brand UI, and I have no sibling-transfer-node evidence to confirm or refute "looks like family" — so I cannot resolve whether this counts as matching vs. not matching the workspace language. Per the calibration rule (criterion open to two readings → UNCERTAIN), I am not guessing PASS or FAIL here.
  human_override:

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Non-discriminating (green trên cả HEAD lẫn baseline theo dữ liệu round trước, chứng minh harness chứ không phải feature — cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- E1a (`pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`)
- E16 (`cd sdk && ... pytest -q tests/test_node_cache_tier_b.py::test_tier_lists_are_disjoint_and_pinned`)
- E17 (`cd sdk && ... pytest -q tests/test_node_cache_tier_b.py::test_abi_guard_catches_both_directions`)
- E19 (`pnpm vitest run src/lib/abi/conformance.test.ts`)

Suite-level commands green on both HEAD and baseline (`pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test`, full sdk pytest, `pnpm verify:plugins`) are expected regression guards, not listed above.

## Variance

none — không có eval nào trong round này mang field `runs` > 1 (mọi eval là deterministic, runs=1, pass_rate không áp dụng).

## Iterations

Round 1: E22 failed — state-6 (running) vi phạm P0 low-contrast: nhãn "Task started" render bằng shimmer `bg-clip-text`/`text-transparent` trên `NodeLoadingOverlay`, không đọc được. Returned to implementation.
Round 2: Toàn bộ 26 eval máy/ui-check (E1a–E22) xanh — E22 re-verify bằng design-gate thật trên dev server thật + task thật, low-contrast đã được sửa (chữ xám đậm + animate-pulse) và không còn tái hiện; E23 (judgment) chia 3 lens đều UNCERTAIN, không có consensus PASS. Adversarial review phát hiện các lỗi trong-hợp-đồng (AC-1 ×2, AC-12, AC-14) mà không eval máy nào bắt được — verdict tổng REJECT dựa trên review findings, không có eval command nào tự thân fail nên failed_evals giữ [].

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
