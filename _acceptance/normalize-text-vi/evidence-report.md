---
schema_version: 2
feature_slug: normalize-text-vi
verdict: REJECT
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 560b4acf5171706c043607c1dabb3e359f014061
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
| E18 | AC-16 | script | PASS |
| E14a | AC-13 | script | PASS |
| E14b | AC-13 | script | PASS |
| E17a | AC-14 | script | PASS |
| E17b | AC-14 | script | PASS |
| E15 | AC-15 | ui-check | PASS |
| E16 | AC-15 | judgment | PASS |

## Evidence

### Regression / suite guards (không gắn AC cụ thể — full-suite chạy lại round này)

- cmd: `pnpm build && pnpm typecheck`
  exit_code: 0
  baseline: n-a
  output: |
    ƒ  (Dynamic)  server-rendered on demand

    $ tsc --noEmit

- cmd: `pnpm lint:check`
  exit_code: 0
  baseline: n-a
  output: |
    Checked 472 files in 166ms. No fixes applied.

- cmd: `pnpm test`
  exit_code: 0
  baseline: n-a
  output: |
          Tests  532 passed | 5 skipped (537)
       Start at  13:47:42
       Duration  13.34s (transform 5.70s, setup 0ms, import 10.80s, tests 15.88s, environment 2.56s)

- cmd: `cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q`
  exit_code: 0
  baseline: n-a
  output: |
    ........................................................................ [ 81%]
    ..................................................                       [100%]
    266 passed in 46.95s

- cmd: `pnpm verify:plugins`
  exit_code: 0
  baseline: n-a
  output: |
    [verify-plugins-scan] OK

- cmd: `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`
  exit_code: 0
  baseline: n-a
  output: |
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json

### Eval carry-forward (P1 — delta round 17 không chạm paths các eval dưới đây)

- eval: E1a
  criterion: AC-1
  executor: script
  verifier: config:executors.script.gen_abi_clean
  run_id: minted-normalize-text-vi-E1a-r2
  exit_code: 0
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval

- eval: E1b
  criterion: AC-1
  executor: script
  verifier: config:executors.script.abi_python_gen_clean
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval

- eval: E2
  criterion: AC-2
  executor: test
  verifier: config:executors.test.sdk_pytest_normalize_money
  run_id: minted-normalize-text-vi-E2-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E3
  criterion: AC-3
  executor: test
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  run_id: minted-normalize-text-vi-E3-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E4
  criterion: AC-4
  executor: test
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  run_id: minted-normalize-text-vi-E4-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E5
  criterion: AC-5
  executor: test
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  run_id: minted-normalize-text-vi-E5-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E6a
  criterion: AC-6
  executor: test
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  run_id: minted-normalize-text-vi-E6a-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E6b
  criterion: AC-6
  executor: test
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  run_id: minted-normalize-text-vi-E6b-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E7
  criterion: AC-7
  executor: test
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  run_id: minted-normalize-text-vi-E7-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E8
  criterion: AC-8
  executor: test
  verifier: config:executors.test.sdk_pytest_normalize_edges
  run_id: minted-normalize-text-vi-E8-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E9a
  criterion: AC-9
  executor: test
  verifier: config:executors.test.unit_normalize_node
  run_id: minted-normalize-text-vi-E9a-r6
  exit_code: 0
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval

- eval: E9b
  criterion: AC-9
  executor: test
  verifier: config:executors.test.unit_normalize_export
  run_id: minted-normalize-text-vi-E9b-r14
  exit_code: 0
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval

- eval: E10a
  criterion: AC-10
  executor: test
  verifier: config:executors.test.unit_tts_order_violation
  run_id: minted-normalize-text-vi-E10a-r14
  exit_code: 0
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval

- eval: E10b
  criterion: AC-10
  executor: test
  verifier: config:executors.test.unit_tts_order_compliant
  run_id: minted-normalize-text-vi-E10b-r14
  exit_code: 0
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval

- eval: E10c
  criterion: AC-10
  executor: test
  verifier: config:executors.test.unit_tts_family_matches_abi
  run_id: minted-normalize-text-vi-E10c-r14
  exit_code: 0
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval

- eval: E11a
  criterion: AC-11
  executor: test
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  run_id: minted-normalize-text-vi-E11a-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E11b
  criterion: AC-11
  executor: test
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  run_id: minted-normalize-text-vi-E11b-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E12a
  criterion: AC-12
  executor: test
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  run_id: minted-normalize-text-vi-E12a-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E12b
  criterion: AC-12
  executor: test
  verifier: config:executors.test.unit_conformance
  run_id: minted-normalize-text-vi-E12b-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E13
  criterion: AC-13
  executor: script
  verifier: config:executors.script.normalize_registration_synced
  run_id: minted-normalize-text-vi-E13-r15
  exit_code: 0
  verified_at: 2026-08-27T05:18:07Z
  carried_from_round: 15
  note: carry-forward tu round 15 — delta khong cham paths cua eval

- eval: E18
  criterion: AC-16
  executor: script
  verifier: config:executors.script.measuring_instruments_refuse
  run_id: minted-normalize-text-vi-E18-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E14a
  criterion: AC-13
  executor: script
  verifier: config:executors.script.normalize_sdk_train_local
  run_id: minted-normalize-text-vi-E14a-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E14b
  criterion: AC-13
  executor: script
  verifier: config:executors.script.normalize_sdk_published
  run_id: minted-normalize-text-vi-E14b-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E17a
  criterion: AC-14
  executor: script
  verifier: config:executors.script.normalize_plugin_shell
  run_id: minted-normalize-text-vi-E17a-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E17b
  criterion: AC-14
  executor: script
  verifier: config:executors.script.normalize_plugin_shell
  run_id: minted-normalize-text-vi-E17b-r16
  exit_code: 0
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval

- eval: E15
  criterion: AC-15
  executor: ui-check
  verifier: (judgment/ui-check — panel & frames xem round 15)
  run_id: minted-normalize-text-vi-E15-r15
  exit_code: 0
  verified_at: 2026-08-27T05:18:07Z
  carried_from_round: 15
  note: carry-forward tu round 15 — delta khong cham paths cua eval (screenshot/observed goc xem round 15, khong chep lai o day)

### Judge panel (E16 — carried)

- eval: E16
  criterion: AC-15
  executor: judgment
  proposal: PASS
  panel: giu nguyen tu round 15 — inputs khong doi, khong cham lai; rationale xem round 15
  votes:
    - domain-correctness: PASS (r15)
    - operational-feasibility: PASS (r15)
    - spec-alignment: PASS (r15)
  carried_from_round: 15

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 16 — baseline khong do lai round nay

none — round này không đo lại baseline (carried từ round 16); không có eval nào bị đánh dấu non-discriminating trong round này. Sáu lệnh suite/regression (build+typecheck, lint:check, test, sdk pytest, verify:plugins, gen:abi diff) chạy xanh cả hai phía là regression-guard bình thường, không liệt kê ở đây.

## Variance

none — không có eval nào mang field runs > 1 (stochastic) trong round này; không có eval deterministic nào flaky.

## Iterations

Round 17: mọi eval máy (E1a–E18, carry-forward) đều PASS và failed_evals rỗng, nhưng verdict tổng vẫn REJECT theo quyết định gate ngoài phạm vi evals — xem review-findings.md mục "Trong hợp đồng" (finding severity high, AC-6, sdk/tongflow/text/normalize_vi.py:150) để biết lý do; không có eval nào được ghi vào failed_evals vì lỗi được phát hiện qua review, không qua một eval hình thức nào trong evals.yaml.