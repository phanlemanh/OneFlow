---
schema_version: 2
feature_slug: normalize-text-vi
verdict: BLOCKED
failed_evals: []
reason: "pnpm build && pnpm typecheck vượt quá giới hạn 600 giây (10 phút) của Bash tool; tiến trình PID 77818 vẫn còn chạy sau hơn 30 phút, không có thêm log nào kể từ khi lệnh bắt đầu lúc 12:58PM. Bước gen-abi có vẻ bị treo: dòng log cuối cùng ghi nhận là '$ pnpm gen:abi' rồi '$ tsx scripts/gen-abi-types.ts', sau đó không còn dòng log nào — có thể là treo hoặc chạy rất lâu mà không xuất log. Bash tool đã dừng lệnh vì hết hạn mức thời gian, không phải do code sai; cần chạy lại với timeout dài hơn hoặc điều tra vì sao gen-abi-types.ts không log."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2ac82ea36919ee3384b3ece6e62b50f464e9280b
human_signoff:
---

# Evidence Report: normalize-text-vi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1a | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
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
  note: carry-forward tu round 13 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-normalize-text-vi-E2-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_money
  verified_at: 2026-08-27T12:58:10Z
  output: |
    1 passed in 0.05s

- eval: E3
  run_id: minted-normalize-text-vi-E3-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  verified_at: 2026-08-27T12:58:10Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E4
  run_id: minted-normalize-text-vi-E4-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  verified_at: 2026-08-27T12:58:10Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E5
  run_id: minted-normalize-text-vi-E5-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-27T12:58:10Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E6a
  run_id: minted-normalize-text-vi-E6a-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  verified_at: 2026-08-27T12:58:10Z
  output: |
    1 passed in 0.03s

- eval: E6b
  run_id: minted-normalize-text-vi-E6b-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  verified_at: 2026-08-27T12:58:10Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E7
  run_id: minted-normalize-text-vi-E7-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  verified_at: 2026-08-27T12:58:10Z
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E8
  run_id: minted-normalize-text-vi-E8-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_edges
  verified_at: 2026-08-27T12:58:10Z
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E9a
  run_id: minted-normalize-text-vi-E9a-r6
  exit_code: 0
  verifier: config:executors.test.unit_normalize_node
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-normalize-text-vi-E9b-r14
  exit_code: 0
  verifier: config:executors.test.unit_normalize_export
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval

- eval: E10a
  run_id: minted-normalize-text-vi-E10a-r14
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-normalize-text-vi-E10b-r14
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_compliant
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval

- eval: E10c
  run_id: minted-normalize-text-vi-E10c-r14
  exit_code: 0
  verifier: config:executors.test.unit_tts_family_matches_abi
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval

- eval: E11a
  run_id: minted-normalize-text-vi-E11a-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  verified_at: 2026-08-27T12:58:10Z
  output: |
    ..                                                                       [100%]
    2 passed in 0.16s

- eval: E11b
  run_id: minted-normalize-text-vi-E11b-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  verified_at: 2026-08-27T12:58:10Z
  output: |
    1 passed in 0.03s

- eval: E12a
  run_id: minted-normalize-text-vi-E12a-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  verified_at: 2026-08-27T12:58:10Z
  output: |
    .                                                                        [100%]
    1 passed, 7 deselected in 0.15s

- eval: E12b
  run_id: minted-normalize-text-vi-E12b-r16
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-27T12:58:10Z
  output: |
         Tests  13 passed (13)
      Start at  12:58:10
      Duration  261ms (transform 116ms, setup 0ms, import 139ms, tests 4ms, environment 0ms)

- eval: E13
  run_id: minted-normalize-text-vi-E13-r15
  exit_code: 0
  verifier: config:executors.script.normalize_registration_synced
  verified_at: 2026-08-27T05:18:07Z
  carried_from_round: 15
  note: carry-forward tu round 15 — delta khong cham paths cua eval

- eval: E14a
  run_id: minted-normalize-text-vi-E14a-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_sdk_train_local
  verified_at: 2026-08-27T12:58:10Z
  output: |
    OK: SDK 0.2.23 (both files agree) · vietnormalizer==0.2.3 pinned exactly

- eval: E14b
  run_id: minted-normalize-text-vi-E14b-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_sdk_published
  verified_at: 2026-08-27T12:58:10Z
  output: |
    OK: artifact mang tongflow/text/, models mới và NORMALIZE_TEXT_VI
    OK: the plugin shell pins oneflow-sdk==0.2.23
    OK: the release train is in sync for 0.2.23

- eval: E15
  run_id: minted-normalize-text-vi-E15-r15
  exit_code: 0
  verifier: config:executors.script.measuring_instruments_refuse
  verified_at: 2026-08-27T05:18:07Z
  carried_from_round: 15
  note: carry-forward tu round 15 — delta khong cham paths cua eval

- eval: E16
  judged_by: judge panel (carried)
  verdict: PASS
  carried_from_round: 15
  rationale: panel giu nguyen tu round 15 — inputs khong doi, khong cham lai; rationale xem round 15
  votes:
    - domain-correctness: PASS (r15)
    - operational-feasibility: PASS (r15)
    - spec-alignment: PASS (r15)

- eval: E17a
  run_id: minted-normalize-text-vi-E17a-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-27T12:58:10Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.33s

- eval: E17b
  run_id: minted-normalize-text-vi-E17b-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-27T12:58:10Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.33s

- eval: E18
  run_id: minted-normalize-text-vi-E18-r16
  exit_code: 0
  baseline: red
  verifier: config:executors.script.measuring_instruments_refuse
  verified_at: 2026-08-27T12:58:10Z
  output: |
    (checked 9 executor keys whose tests need the engine; each must carry the ${pin:?…} guard)
    OK: capture refuses a wrong locale and clears the stale frame · shared executor reports a legible pin error

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — khong co eval nao co runs > 1 trong vong nay

## Iterations

Round 15: E13, E15 verified lại (registration sync + P0 design gate) — toàn bộ eval máy xanh, E16 (judgment) giữ nguyên PASS từ panel trước đó; chờ Cổng 2 cho human_signoff. Round 16: 17 eval máy còn lại (E2-E8, E11a/b, E12a/b, E14a/b, E17a/b, E18) chạy lại xanh toàn bộ và các eval carry-forward (E1a/b, E9a/b, E10a/b/c, E13, E15, E16) giữ nguyên do delta không chạm paths của chúng; TUY NHIÊN `pnpm build && pnpm typecheck` vượt hạn mức 600 giây của Bash tool — tiến trình PID 77818 treo tại bước `pnpm gen:abi` / `tsx scripts/gen-abi-types.ts` không log gì thêm sau 30+ phút — nên verifier không hoàn tất trọn vẹn round này; verdict BLOCKED, chờ chạy lại với timeout dài hơn hoặc điều tra nguyên nhân treo ở gen-abi-types.ts.
