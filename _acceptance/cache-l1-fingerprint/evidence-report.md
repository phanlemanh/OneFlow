---
schema_version: 2
feature_slug: cache-l1-fingerprint
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e8fe1f26da983983f6ce5c5acf0d56217dfd1ae2
# bypass_ack:
human_signoff: Manh 2026-07-30
---

# Evidence Report: cache-l1-fingerprint

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
  run_id: minted-cache-l1-fingerprint-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_hashseed_stable
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.10s

- eval: E2
  run_id: minted-cache-l1-fingerprint-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_business_diff
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E3
  run_id: minted-cache-l1-fingerprint-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_per_run_keys_stripped
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E4
  run_id: minted-cache-l1-fingerprint-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_asset_bytes_same
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E5
  run_id: minted-cache-l1-fingerprint-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_asset_ref_diff
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E6
  run_id: minted-cache-l1-fingerprint-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_missing_rev
  verified_at: 2026-07-30T02:15:00Z
  output: |
    1 passed in 0.01s

- eval: E7
  run_id: minted-cache-l1-fingerprint-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_dirty_plugin
  verified_at: 2026-07-30T02:15:00Z
  output: |
    1 passed in 0.01s

- eval: E8
  run_id: minted-cache-l1-fingerprint-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_rev_diff
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E9
  run_id: minted-cache-l1-fingerprint-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_slot_diff
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E10
  run_id: minted-cache-l1-fingerprint-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_plugin_id_diff
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E11
  run_id: minted-cache-l1-fingerprint-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_model_diff
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E12
  run_id: minted-cache-l1-fingerprint-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_sdk_version
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E13
  run_id: minted-cache-l1-fingerprint-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_vectors_exact
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E14
  run_id: minted-cache-l1-fingerprint-E14-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_vectors_guard
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.30s

- eval: E15
  run_id: minted-cache-l1-fingerprint-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_digest_form_parity
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E16
  run_id: minted-cache-l1-fingerprint-E16-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_fingerprint_dict_order_stable
  verified_at: 2026-07-30T02:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E14, E16 failed — E1's subprocess replaced os.environ instead of extending it and omitted an explicit cwd (hard-failed when pytest ran from the repo root), E14's mutation guard bumped KEY_SCHEMA_VERSION in-place on the tracked file (reader/writer races under the S4 harness's concurrent execution), E16's guard stayed green after removing sort_keys=True because normalize_call already sorts before node_fingerprint serializes (test did not actually prove the fingerprint's own order-normalization). Returned to implementation.

Round 3 — re-verify on `feat/cache-l2-store` (2026-07-30). NOT a carry-forward.
`verified_commit` moved from 2a8ed345aca98a5daa1e3fc45c5a91e9190b37dd to
e8fe1f26da983983f6ce5c5acf0d56217dfd1ae2, and this needs a fresh human signature because the
branch modifies files this feature owns: `fingerprint.py` (tenant + abiDigest
joined the key, KEY_SCHEMA_VERSION 1 -> 2), both test files, and the recorded
vectors (regenerated by the implementation under v=2, all five cases now carrying
tenant/abiDigest).

Evals re-run on the merged tree: all 16 node-ids pass (19 tests across
test_fingerprint.py + test_fingerprint_vectors.py — 17 + 2, the file gained the
three L2 key-component tests and two no-default guards). The AC-14 vector guard
now bumps 2 -> 3 in its temp copy and still discriminates — verified during L2
Task 1 review by dropping `v` from the payload and regenerating vectors: the
guard went red while AC-13 alone stayed green.

One episode this re-verification must acknowledge (recorded in Known limits at
L2 Task 7): while the key was being extended, AC-7's TypeError guard briefly
stopped isolating `plugin_dirty` — the call omitted THREE required kwargs, so
the `plugin_dirty: bool = False` mutation survived. Caught by L2's Task 1
review, fixed in the same branch (fc89d50), and the guard now isolates each of
the three required parameters individually.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
