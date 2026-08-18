---
schema_version: 2
feature_slug: scan-with-block-imports
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a33e0df4db5253e190051a947576c97a6bd564dc
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
| E13 | AC-13 | script | PASS |
| E14 | AC-1 | script | PASS |
| E14b | AC-14 | script | PASS |
| E15 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-scan-with-block-imports-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_scope_with_deploy
  verified_at: 2026-08-18T03:53:16Z
  output: |
    .                                                                        [100%]
    1 passed in 0.21s

- eval: E2
  run_id: minted-scan-with-block-imports-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_scope_with_scan
  verified_at: 2026-08-18T03:53:16Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E3
  run_id: minted-scan-with-block-imports-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_scope_nested
  verified_at: 2026-08-18T03:53:16Z
  output: |
    ............                                                             [100%]
    12 passed in 0.17s

- eval: E4
  run_id: minted-scan-with-block-imports-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_scope_function_local
  verified_at: 2026-08-18T03:53:16Z
  output: |
    ..                                                                       [100%]
    2 passed in 0.02s

- eval: E5
  run_id: minted-scan-with-block-imports-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_scope_import_spellings
  verified_at: 2026-08-18T03:53:16Z
  output: |
    3 passed in 0.12s

- eval: E6
  run_id: minted-scan-with-block-imports-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_scope_prior_behaviour
  verified_at: 2026-08-18T03:53:16Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E7
  run_id: minted-scan-with-block-imports-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_reason_not_sdk_model
  verified_at: 2026-08-18T03:53:16Z
  output: |
    .                                                                        [100%]
    1 passed in 0.15s

- eval: E8
  run_id: minted-scan-with-block-imports-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_reason_missing_annotation
  verified_at: 2026-08-18T03:53:16Z
  output: |
    . [100%]
    1 passed in 0.04s

- eval: E9
  run_id: minted-scan-with-block-imports-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_reason_missing_param
  verified_at: 2026-08-18T03:53:16Z
  output: |
    1 passed in 0.02s

- eval: E10
  run_id: minted-scan-with-block-imports-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_reason_single_source
  verified_at: 2026-08-18T03:53:16Z
  output: |
    .                                                                        [100%]
    1 passed in 0.22s

- eval: E11
  run_id: minted-scan-with-block-imports-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_scan_noise
  verified_at: 2026-08-18T03:53:16Z
  output: |
    ok: over 5 installed plugins, no plugin became newly problematic at HEAD

- eval: E12
  run_id: minted-scan-with-block-imports-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_overlay_discoverable_fixture
  verified_at: 2026-08-18T03:53:16Z
  output: |
    fixture deploy.py matches its pinned hash (b3ac7ff6ab0f9a556f8a48ff44f51b58f6912037aaec5da752e0abb3eb5c9e6e)
    tongflow loaded from this repo: /Users/manh-macmini/dev/oneflow/sdk/tongflow/__init__.py
    ok [fixture]: compose-overlay served by ['oneflow-modal-compose-overlay'], no problems for oneflow-modal-compose-overlay

- eval: E13
  run_id: minted-scan-with-block-imports-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_scan_blast_radius
  verified_at: 2026-08-18T03:53:16Z
  output: |
    ok: no contract chokepoint touched, SDK version unchanged since 29d0c3be811408297827f75d7c7931c11e0973ed

- eval: E14
  run_id: minted-scan-with-block-imports-E14-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_scope_walker_teeth
  verified_at: 2026-08-18T03:53:16Z
  output: |
    ok: reverting the walker turns E1..E5 red and names the missing slot COMPOSE_OVERLAY

- eval: E14b
  run_id: minted-scan-with-block-imports-E14b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_overlay_discoverable_real
  verified_at: 2026-08-18T03:53:16Z
  output: |
    tongflow loaded from this repo: /Users/manh-macmini/dev/oneflow/sdk/tongflow/__init__.py
    ok [real]: compose-overlay served by ['oneflow-modal-compose-overlay'], no problems for oneflow-modal-compose-overlay

- eval: E15
  run_id: minted-scan-with-block-imports-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.check_reason_teeth
  verified_at: 2026-08-18T03:53:16Z
  output: |
    ok: removing the reason emission turns E7..E10 red and names the absent reason

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: All 16 evals passed on the first pass; scope-triage surfaced review findings, several classified out-of-contract (proposed as new-contract or known-limits) — signed off PASS.
Round 2 (attempt 1): BLOCKED — the Bash tool's safety classifier (claude-sonnet-5) was rate-limited for most of the round, so 13 of 16 planned eval commands (E1-E10, E11, E12, E14b) never executed; E13/E14/E15 and the full regression suites did run and passed. Retried once the classifier recovered.
Round 2 (attempt 2, this report): All 16 evals ran for real and passed; full regression suites (pnpm build/typecheck/lint/test, sdk full pytest suite, verify:plugins, gen:abi diff) also passed clean. Verdict PASS.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter