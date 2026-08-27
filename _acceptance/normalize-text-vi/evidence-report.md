---
schema_version: 2
feature_slug: normalize-text-vi
verdict: BLOCKED
failed_evals: []
reason: |
  scripts/lib/sdk-version.sh mis-resolves the repo root when sourced via a relative
  path in the shape `cd sdk && . ../scripts/lib/sdk-version.sh` — it relies on
  ${BASH_SOURCE[0]} which is empty/relative in this invocation, so it derives the
  root as /Users/manh-macmini/dev instead of /Users/manh-macmini/dev/oneflow and
  then looks for the nonexistent /Users/manh-macmini/dev/sdk/pyproject.toml,
  aborting with "sdk-version: no such file: /Users/manh-macmini/dev/sdk/pyproject.toml"
  before `reader_pin` can even be computed. This blocks the verifier commands for
  two evals exactly as specified in config:
    - E3 (config:executors.test.sdk_pytest_normalize_datetime, node id
      test_datetime_golden)
    - E5 (config:executors.test.sdk_pytest_normalize_ambiguous, node id
      test_ambiguous_policy_pinned)
  Both underlying tests themselves pass (1 passed, ~0.04-0.05s) when the script
  bug is bypassed with manual root derivation — this is an infrastructure/harness
  failure in the shared helper script, not a product regression in
  normalize_vi.py. The remedy is fixing scripts/lib/sdk-version.sh's root
  resolution (or invoking it from repo root) and re-running verification, not a
  code change to the feature.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d60899e84260c32d9df7e87417e79219a2de4091
human_signoff:
---

# Evidence Report: normalize-text-vi

Ghi chú (không gắn AC cụ thể — không tính vào bảng dưới): `pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test` (532 passed | 5 skipped), full `cd sdk && ... pytest` (266 passed), `pnpm verify:plugins`, và `pnpm gen:abi && git diff --exit-code ...` đều chạy xanh trên cây này ở round 15.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1a | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | BLOCKED |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | BLOCKED |
| E6a | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9a | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10a | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10c | AC-10 | test | PASS |
| E11a | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |
| E12a | AC-12 | test | PASS |
| E12b | AC-12 | test | PASS |
| E13 | AC-13 | script | PASS |
| E14a | AC-13 | script | PASS |
| E14b | AC-13 | script | PASS |
| E15 | AC-15 | ui-check | PASS |
| E16 | AC-15 | judgment | PASS |
| E17a | AC-14 | script | PASS |
| E17b | AC-14 | script | PASS |
| E18 | AC-16 | script | PASS |

## Evidence

- eval: E1a
  run_id: minted-normalize-text-vi-E1a-r2
  exit_code: 0
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval.

- eval: E1b
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval.

- eval: E2
  run_id: minted-normalize-text-vi-E2-r15
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_money
  verified_at: 2026-08-27T01:45:00Z
  output: |
    Pin: vietnormalizer==0.2.3
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E3
  run_id: minted-normalize-text-vi-E3-r15
  status: cannot_run
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  verified_at: 2026-08-27T01:45:00Z
  output: |
    sdk-version: no such file: /Users/manh-macmini/dev/sdk/pyproject.toml
  note: |
    Verifier command as specified cannot execute — scripts/lib/sdk-version.sh
    mis-resolves the repo root when sourced via a relative path after `cd sdk`.
    See frontmatter `reason`. The underlying test passes (1 passed in ~0.05s)
    when the script bug is bypassed with manual root derivation.

- eval: E4
  run_id: minted-normalize-text-vi-E4-r15
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  verified_at: 2026-08-27T01:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E5
  run_id: minted-normalize-text-vi-E5-r15
  status: cannot_run
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-27T01:45:00Z
  output: |
    sdk-version: no such file: /Users/manh-macmini/dev/sdk/pyproject.toml
  note: |
    Same root-resolution bug as E3 in scripts/lib/sdk-version.sh — verifier
    command as specified cannot execute. See frontmatter `reason`. The
    underlying test passes when the script bug is bypassed manually.

- eval: E6a
  run_id: minted-normalize-text-vi-E6a-r15
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  verified_at: 2026-08-27T01:45:00Z
  output: |
    Pin: vietnormalizer==0.2.3
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E6b
  run_id: minted-normalize-text-vi-E6b-r15
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  verified_at: 2026-08-27T01:45:00Z
  output: |
    pin=vietnormalizer==0.2.3
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E7
  run_id: minted-normalize-text-vi-E7-r15
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  verified_at: 2026-08-27T01:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E8
  run_id: minted-normalize-text-vi-E8-r15
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_edges
  verified_at: 2026-08-27T01:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E9a
  run_id: minted-normalize-text-vi-E9a-r6
  exit_code: 0
  verifier: config:executors.test.unit_normalize_node
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval.

- eval: E9b
  run_id: minted-normalize-text-vi-E9b-r14
  exit_code: 0
  verifier: config:executors.test.unit_normalize_export
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E10a
  run_id: minted-normalize-text-vi-E10a-r14
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E10b
  run_id: minted-normalize-text-vi-E10b-r14
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_compliant
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E10c
  run_id: minted-normalize-text-vi-E10c-r14
  exit_code: 0
  verifier: config:executors.test.unit_tts_family_matches_abi
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E11a
  run_id: minted-normalize-text-vi-E11a-r14
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E11b
  run_id: minted-normalize-text-vi-E11b-r6
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval.

- eval: E12a
  run_id: minted-normalize-text-vi-E12a-r6
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval.

- eval: E12b
  run_id: minted-normalize-text-vi-E12b-r2
  exit_code: 0
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval.

- eval: E13
  run_id: minted-normalize-text-vi-E13-r15
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_registration_synced
  verified_at: 2026-08-27T01:45:00Z
  output: |
    OK: manifest + 3 READMEs (plugin list & matrix row) + 5 locales all in sync

- eval: E14a
  run_id: minted-normalize-text-vi-E14a-r14
  exit_code: 0
  verifier: config:executors.script.normalize_sdk_train_local
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E14b
  run_id: minted-normalize-text-vi-E14b-r14
  exit_code: 0
  verifier: config:executors.script.normalize_sdk_published
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E15
  run_id: minted-normalize-text-vi-E15-r15
  exit_code: 0
  baseline: n-a
  verifier: ui-check:E15
  verified_at: 2026-08-27T01:45:00Z
  screenshot: /Users/manh-macmini/dev/oneflow/_acceptance/normalize-text-vi/evidence/design/captures/state-1-idle.png
  observed: |
    state-1-idle.png (Read, 1280x900): dark AbiNodeShell card, header icon +
    "Đọc số thành chữ" (readable Vietnamese, not a raw i18n key) with a menu
    (hamburger) button top-right; body shows a "Cách triển khai" select showing
    "api-normalize-text-vi"; below it a full-width button with a wand icon
    reading "Đọc thành chữ", rendered disabled/greyed (matches idle — no
    upstream input). Two small circle handles are visible on the card's left
    and right edges at the same row as the implementation selector (in:text on
    the left, out:text on the right). No upstream node/edge present, matching
    Expected idle state. — state-2-wired.png (Read, 1280x900): same card
    ("Đọc số thành chữ" / "Cách triển khai" = api-normalize-text-vi), now with
    an upstream fixture source node ("Giá 1.999.000đ ngày 19/8/2026") connected
    via a curved edge into the left handle; the same "Đọc thành chữ" button is
    now rendered enabled (light/white, matching the wired state). Right-side
    handle also visible. Both frames are full desktop-size canvas captures
    (not the 390x844 mobile default flagged as a past defect), labels are
    legible Vietnamese throughout, and handles in:text/out:text are visually
    present on both.
  network_observed: clean
  output: |
    10. Cleanup (run regardless, executed at end): closed browser tab; `kill`
    on the PID listening on 3000 (44789, the `next dev` child; started via
    `pnpm dev` parent pid 44582) -> `lsof -nP -iTCP:3000 -sTCP:LISTEN` now
    empty. `git checkout -- tsconfig.json` -> md5 still
    97411ea73a63ac8c5e849960548a8d21 (matches pre-run). `rm -rf build`.
    `git status --porcelain` shows only the intended evidence-file updates
    under _acceptance/normalize-text-vi/evidence/** plus one pre-existing
    unrelated modification to _acceptance/normalize-text-vi/contract.md that
    was already present before this verify run started (not touched by me).
    Tree left clean of build artifacts.
    Expected met: both capture images exist and are of THIS tree (provenance
    string confirmed pre-capture); P0 design gate green on both; console
    clean; node shows exactly in:text/out:text handles; button/labels are
    legible Vietnamese, not raw i18n keys.

- eval: E16
  judged_by: panel (fresh context) — lenses domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  votes:
    - domain-correctness: PASS — Cả hai ảnh cho thấy node theo đúng khuôn AbiNodeShell: header có icon (A✓) + tiêu đề "Đọc số thành chữ" + menu hamburger, thân card có panel "Cách triển khai" chứa dropdown plugin và nút hành động "Đọc thành chữ" với icon đũa phép — tất cả nhãn tiếng Việt hiển thị đúng dấu, không vỡ font. Hai handle tròn nằm đối xứng hai bên (trái/phải) ở cùng độ cao tại ranh giới panel/nút, khớp in:text và out:text; ở ảnh wired, handle trái nhận đúng một cạnh nối và nút chuyển sang trạng thái sáng/active hợp lý — không có gì trên hai ảnh này phá vỡ ngôn ngữ thiết kế nhìn thấy được.
    - operational-feasibility: PASS — Cả hai ảnh cho thấy node "Đọc số thành chữ" đúng khuôn shell chuẩn: header có icon + tiêu đề + nút hamburger, một panel con "Cách triển khai" chứa dropdown chọn plugin, và nút hành động chính bên dưới — bố cục, bo góc, và khoảng đệm nhất quán giữa hai state. Nhãn nút "Đọc thành chữ" và tiêu đề "Đọc số thành chữ" hiển thị tiếng Việt có dấu đầy đủ, rõ ràng, không lỗi font. Hai handle (chấm tròn trái/phải ở cùng độ cao giữa card) hiện diện ở cả hai ảnh — ảnh wired cho thấy handle trái đã nối dây từ node nguồn, handle phải còn trống, đúng cặp in/out một-vào-một-ra. Không thấy yếu tố nào phá vỡ ngôn ngữ thiết kế nhìn thấy được (không lệch màu, không icon vỡ, không tràn chữ, không sai bố cục).
    - spec-alignment: PASS — Cả hai ảnh cho thấy node "Đọc số thành chữ" đúng khuôn AbiNodeShell: header xanh navy có icon A✓ + tiêu đề + menu hamburger canh đều, panel "Cách triển khai" với dropdown chọn plugin có icon badge + chevron, nút hành động full-width có icon + nhãn tiếng Việt rõ ràng ("Đọc thành chữ"), và hai handle hình tròn ở đúng mép trái/phải ngang hàng giữa card (in/out). Trạng thái wired chỉ khác ở việc nút chuyển sang màu sáng (active) và có một cạnh nối vào handle trái — đây là hành vi kỳ vọng khi input đã được nối, không phải lỗi thiết kế. Không thấy chữ bị cắt, icon lệch, hay khoảng cách bất thường trên cả hai ảnh.
  human_override:

- eval: E17a
  run_id: minted-normalize-text-vi-E17a-r15
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-27T01:45:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.11s

- eval: E17b
  run_id: minted-normalize-text-vi-E17b-r15
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-27T01:45:00Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.11s

- eval: E18
  run_id: minted-normalize-text-vi-E18-r14
  exit_code: 0
  verifier: config:executors.script.measuring_instruments_refuse
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform.

## Iterations

Round 13: E1a, E1b, E9a, E11b, E12a, E12b verified PASS; carried forward unchanged in later rounds since their measured paths didn't change.
Round 14: E9b, E10a, E10b, E10c, E11a, E14a, E14b, E18 verified PASS after the TIER_A_SLOTS-withdrawal and TTS-guard amendments landed; carried forward since.
Round 15: E2, E4, E6a, E6b, E7, E8, E13, E15, E17a, E17b re-verified PASS; E3 and E5 BLOCKED — scripts/lib/sdk-version.sh mis-resolves the repo root when sourced via a relative path after `cd sdk`, so the verifier command itself cannot run (not a product regression: both tests pass once the script bug is bypassed manually). Returned to implementation to fix the harness script before the next round.
