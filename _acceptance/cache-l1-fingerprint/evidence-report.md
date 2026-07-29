---
schema_version: 2
feature_slug: cache-l1-fingerprint
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b093e2686a040c76c624be18fa6dbf97ab829abd
human_signoff:
---

# Evidence Report: cache-l1-fingerprint

Note: verdict is REJECT even though `failed_evals` is empty. All 16 AC-mapped
machine evals (E1-E16) passed. The REJECT is driven by an **unmapped**
required commit-gate command, `pnpm lint:check`, which exited 1 in this same
round (see Iterations and the row in the Evidence appendix below). No eval
maps to that failure, so it cannot be listed in `failed_evals`, but it still
blocks the gate.

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
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15 | AC-15 | test | PASS |
| E16 | AC-16 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-cache-l1-fingerprint-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_hashseed_stable
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.40s

- eval: E2
  run_id: minted-cache-l1-fingerprint-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_business_diff
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E3
  run_id: minted-cache-l1-fingerprint-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_per_run_keys_stripped
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E4
  run_id: minted-cache-l1-fingerprint-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_asset_bytes_same
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E5
  run_id: minted-cache-l1-fingerprint-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_asset_ref_diff
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E6
  run_id: minted-cache-l1-fingerprint-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_missing_rev
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E7
  run_id: minted-cache-l1-fingerprint-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_dirty_plugin
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E8
  run_id: minted-cache-l1-fingerprint-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_rev_diff
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E9
  run_id: minted-cache-l1-fingerprint-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_slot_diff
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10
  run_id: minted-cache-l1-fingerprint-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_plugin_id_diff
  verified_at: 2026-07-30T09:00:00Z
  output: |
    1 passed in 0.02s

- eval: E11
  run_id: minted-cache-l1-fingerprint-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_model_diff
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E12
  run_id: minted-cache-l1-fingerprint-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_sdk_version
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E13
  run_id: minted-cache-l1-fingerprint-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_vectors_exact
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E14
  run_id: minted-cache-l1-fingerprint-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_vectors_guard
  verified_at: 2026-07-30T09:00:00Z
  output: |
    1 passed in 0.30s

- eval: E15
  run_id: minted-cache-l1-fingerprint-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_digest_form_parity
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E16
  run_id: minted-cache-l1-fingerprint-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_dict_order_stable
  verified_at: 2026-07-30T09:00:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E16 (all AC-mapped machine evals) passed on HEAD with exit 0, baseline red for each — full discrimination confirmed against the pre-feature diffBase. Non-eval regression-guard suite commands also ran green: `pnpm build && pnpm typecheck`, `pnpm test` (347 passed), `cd sdk && pytest` (133 passed), `pnpm verify:plugins`, and `pnpm gen:abi && git diff --exit-code ...` (no ABI drift). However `pnpm lint:check` — an unmapped required commit-checklist command (Biome, `--error-on-warnings`) — failed with exit 1 ("Checked 414 files in 155ms... Found 1 error"). Verdict is REJECT on this lint failure alone; failed_evals stays empty since no AC/eval covers it. Returned to implementation to fix the Biome lint error, then re-verify.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
