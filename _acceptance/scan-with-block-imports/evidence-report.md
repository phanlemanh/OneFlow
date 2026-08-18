---
schema_version: 2
feature_slug: scan-with-block-imports
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d95e8088b7cd469dff84ed2b39cd7918151e373d
human_signoff:
---

# Evidence Report: scan-with-block-imports

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | script | PASS |
| E14b | AC-14 | script | PASS |
| E13 | AC-13 | script | PASS |
| E14 | AC-1 | script | PASS |
| E15 | AC-7 | script | PASS |

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — khong co eval nao co runs > 1 (khong co mixed pass_rate de xet)

## Evidence

- eval: E1
  run_id: minted-scan-with-block-imports-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_with_deploy
  verified_at: 2026-08-18T09:00:00Z
  output: |
    1 passed, 22 deselected in 0.02s

- eval: E2
  run_id: minted-scan-with-block-imports-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_with_scan
  verified_at: 2026-08-18T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed, 22 deselected in 0.02s

- eval: E3
  run_id: minted-scan-with-block-imports-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_nested
  verified_at: 2026-08-18T09:00:00Z
  output: |
    ...........                                                              [100%]
    11 passed, 12 deselected in 0.03s

- eval: E4
  run_id: minted-scan-with-block-imports-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_function_local
  verified_at: 2026-08-18T09:00:00Z
  output: |
    ..                                                                       [100%]
    2 passed, 21 deselected in 0.02s

- eval: E5
  run_id: minted-scan-with-block-imports-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_import_spellings
  verified_at: 2026-08-18T09:00:00Z
  output: |
    ...                                                                      [100%]
    3 passed, 20 deselected in 0.02s

- eval: E6
  run_id: minted-scan-with-block-imports-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_scope_prior_behaviour
  verified_at: 2026-08-18T09:00:00Z
  output: |
    1 passed, 22 deselected in 0.02s

- eval: E7
  run_id: minted-scan-with-block-imports-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_reason_not_sdk_model
  verified_at: 2026-08-18T09:00:00Z
  output: |
    1 passed, 22 deselected in 0.11s

- eval: E8
  run_id: minted-scan-with-block-imports-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_reason_missing_annotation
  verified_at: 2026-08-18T09:00:00Z
  output: |
    1 passed, 22 deselected in 0.05s

- eval: E9
  run_id: minted-scan-with-block-imports-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_reason_missing_param
  verified_at: 2026-08-18T09:00:00Z
  output: |
    1 passed, 22 deselected in 0.02s

- eval: E10
  run_id: minted-scan-with-block-imports-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_reason_single_source
  verified_at: 2026-08-18T09:00:00Z
  output: |
    1 passed, 22 deselected in 0.19s

- eval: E11
  run_id: minted-scan-with-block-imports-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_scan_noise
  verified_at: 2026-08-18T09:00:00Z
  output: |
    ok: over 5 installed plugins, no plugin became newly problematic at HEAD

- eval: E12
  run_id: minted-scan-with-block-imports-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_overlay_discoverable_fixture
  verified_at: 2026-08-18T09:00:00Z
  output: |
    fixture deploy.py matches its pinned hash (b3ac7ff6ab0f9a556f8a48ff44f51b58f6912037aaec5da752e0abb3eb5c9e6e)
    tongflow loaded from this repo: /Users/manh-macmini/dev/oneflow/sdk/tongflow/__init__.py
    ok [fixture]: compose-overlay served by ['oneflow-modal-compose-overlay'], no problems for oneflow-modal-compose-overlay

- eval: E14b
  run_id: minted-scan-with-block-imports-E14b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_overlay_discoverable_real
  verified_at: 2026-08-18T09:00:00Z
  output: |
    tongflow loaded from this repo: /Users/manh-macmini/dev/oneflow/sdk/tongflow/__init__.py
    ok [real]: compose-overlay served by ['oneflow-modal-compose-overlay'], no problems for oneflow-modal-compose-overlay

- eval: E13
  run_id: minted-scan-with-block-imports-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_scan_blast_radius
  verified_at: 2026-08-18T09:00:00Z
  output: |
    ok: no contract chokepoint touched, SDK version unchanged since 29d0c3be811408297827f75d7c7931c11e0973ed

- eval: E14
  run_id: minted-scan-with-block-imports-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_scope_walker_teeth
  verified_at: 2026-08-18T09:00:00Z
  output: |
    ok: reverting the walker turns E1..E5 red and names the missing slot COMPOSE_OVERLAY

- eval: E15
  run_id: minted-scan-with-block-imports-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_reason_teeth
  verified_at: 2026-08-18T09:00:00Z
  output: |
    ok: removing the reason emission turns E7..E10 red and names the absent reason

## Iterations

Round 1: tat ca 16 eval PASS ngay lan dau (E1-E10, E11-E15, E14b); khong co that bai, khong quay lai implementation.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
