---
schema_version: 2
feature_slug: conformance-l0
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e8fe1f26da983983f6ce5c5acf0d56217dfd1ae2
human_signoff: Manh 2026-07-30
---

# Evidence Report: conformance-l0

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-3 | test | PASS |
| E15 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-conformance-l0-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T13:57:00Z
  output: |
    ................                                                         [100%]
    16 passed in 0.09s

- eval: E2
  run_id: minted-conformance-l0-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T13:57:00Z
  output: |
    ................                                                         [100%]
    16 passed in 0.09s

- eval: E3
  run_id: minted-conformance-l0-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-07-28T13:57:00Z
  output: |
    ........................................................................ [ 61%]
    .............................................                            [100%]
    117 passed in 3.52s

- eval: E4
  run_id: minted-conformance-l0-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T13:57:00Z
  output: |
    ................                                                         [100%]
    16 passed in 0.09s

- eval: E5
  run_id: minted-conformance-l0-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T13:57:00Z
  output: |
    ................                                                         [100%]
    16 passed in 0.09s

- eval: E6
  run_id: minted-conformance-l0-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-07-28T13:57:00Z
  output: |
    .....                                                                    [100%]
    5 passed in 0.12s

- eval: E7
  run_id: minted-conformance-l0-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-07-28T13:57:00Z
  output: |
          Tests  8 passed (8)
       Start at  13:56:48
       Duration  578ms (transform 332ms, setup 0ms, import 392ms, tests 4ms, environment 0ms)

- eval: E8
  run_id: minted-conformance-l0-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.conformance_discriminating
  verified_at: 2026-07-28T13:57:00Z
  output: |
    ==> revert: both halves must be GREEN again
        green
    OK: the conformance suite discriminates on all three perturbation kinds

- eval: E9
  run_id: minted-conformance-l0-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-07-28T13:57:00Z
  output: |
    .......                                                                  [100%]
    7 passed in 0.85s

- eval: E10
  run_id: minted-conformance-l0-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-07-28T13:57:00Z
  output: |
    .......                                                                  [100%]
    7 passed in 0.85s

- eval: E11
  run_id: minted-conformance-l0-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_rev
  verified_at: 2026-07-28T13:57:00Z
  output: |
          Tests  3 passed (3)
       Start at  13:56:48
       Duration  312ms (transform 23ms, setup 0ms, import 70ms, tests 6ms, environment 0ms)

- eval: E12
  run_id: minted-conformance-l0-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_node_cached
  verified_at: 2026-07-28T13:57:00Z
  output: |
          Tests  7 passed (7)
       Start at  13:56:50
       Duration  141ms (transform 18ms, setup 0ms, import 25ms, tests 14ms, environment 0ms)

- eval: E13
  run_id: minted-conformance-l0-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T13:57:00Z
  output: |
    ................                                                         [100%]
    16 passed in 0.09s

- eval: E14
  run_id: minted-conformance-l0-E14-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-07-28T13:57:00Z
  output: |
    .....                                                                    [100%]
    5 passed in 0.12s

- eval: E15
  run_id: minted-conformance-l0-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.plugin_rev_joined_path
  verified_at: 2026-07-28T13:57:00Z
  output: |
    OK: TypeScript install -> Python scan preserved pluginRev d5822835ed94b9cdb795d9c9a6da0dc4bb99e4dd

## Analyst

carried tu round 1 — baseline khong do lai round nay.

- E3 (AC-3, `cd sdk && ... pytest -q` — the full sdk suite) is non-discriminating: per the round-1 A/B baseline it passes on both HEAD and the diffBase. This is the expected shape for E3 — its stated purpose is a regression guard ("the pre-existing engine suite passes with NO edits to those files"), not a probe for the new fan-out behaviour, so a green-on-both result confirms the guard rather than indicating a vacuous eval. No rewrite needed; E1/E2/E4/E5/E13 (sdk_pytest_batch) and E14/E6 (conformance fixtures) are the evals that actually exercise the new batch/fan-out behaviour and showed `baseline: red` in round 1 (discriminate correctly). Not re-measured this round because `evals.yaml` did not change since the round-1 baseline capture.

## Variance

none — every multi-run eval is uniform (all evals ran with `runs: 1`, `passes: 1`, `variance: false`).

## Iterations

Round 1: All 15 machine evals (E1-E15) passed on the first verification pass; no failures, no BLOCKED evals, no judgment items pending. Supporting whole-repo checks (`pnpm build`, `pnpm typecheck`, `pnpm lint:check`, `pnpm test`, `pnpm verify:plugins`, `pnpm gen:abi` + diff-check) also passed clean. Round-1 code review surfaced 7 findings (3 high severity: `read_plugin_rev` crashing the scan when git is absent, `merge_fanout_views` wiping downstream state on unpopulated multi-output channels, and `node_completed` emitting only the last fan-out result to the canvas).

Round 2: Commit `bff647b` ("fix: three review findings from verification round 1") addressed the three high-severity round-1 findings. Re-ran all 15 machine evals (E1-E15) plus the full supporting suite (`pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test`, `pnpm verify:plugins`, `pnpm gen:abi` + diff-check) against `verified_commit: 153fcb486e1a3400e7345c8462a18b718e630883` — all green, no failures, no BLOCKED evals, no judgment items pending. `evals.yaml` did not change since round 1, so the A/B baseline was not re-measured this round; round-1 baseline results still apply and are carried forward in `## Analyst` above. Fresh adversarial code review of the round-2 tree surfaced 6 new findings (1 high, 2 medium, 3 low — the high one being `NODE_CACHED` handled in only one of three client-side `NodeStatus` switches); none blocked the round-2 PASS as none mapped to a failing eval, but the high finding was carried to Gate 2 as a human decision.

Round 3: Commit `43d2e3c` ("fix: close the high and two low findings from verification round 2") addressed the round-2 findings. Re-ran all 15 machine evals (E1-E15) plus the full supporting suite (`pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test`, `pnpm verify:plugins`, `pnpm gen:abi` + diff-check) against `verified_commit: 43d2e3c37e1100db31db86a0618d9b5fc6705da4` — all green, no failures, no BLOCKED evals, no judgment items pending. `evals.yaml` did not change since round 1, so the A/B baseline was again not re-measured this round (round-1 baseline results are carried forward in `## Analyst` above). Fresh adversarial code review of the round-3 tree surfaced 9 new findings (1 high, 4 medium, 4 low — the high one being a latent circular-import dependency `sdk/tongflow/scan.py` now has on `sdk/tongflow/engine`, which only avoids breaking today because of import order in `tongflow/__init__.py`); none block this PASS as none map to a failing eval, but the high finding and the two medium canvas/ABI-shape findings are carried to Gate 2 as human decisions — see `review-findings.md`.

Round 4: Commit `d1b73c2` ("fix: break the scan/engine import cycle and de-snapshot the switch guard") addressed the round-3 high finding (the latent circular import between `sdk/tongflow/scan.py` and `sdk/tongflow/engine`). Re-ran all 15 machine evals (E1-E15) plus the full supporting suite (`pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test`, `pnpm verify:plugins`, `pnpm gen:abi` + diff-check) against `verified_commit: d1b73c2c38c960925e6ef8c63f617d89030a8ec9` — all green, no failures, no BLOCKED evals, no judgment items pending. `evals.yaml` did not change since round 1, so the A/B baseline was again not re-measured this round (round-1 baseline results are carried forward in `## Analyst` above). Fresh adversarial code review of the round-4 tree surfaced 8 new findings (2 high, 3 medium, 3 low — the two highs being: `src/lib/abi/conformance.ts` importing `node:crypto`/`Buffer` while sitting in a client-reachable `src/lib/abi` directory with neither a `.server.ts` suffix nor a `server-only` guard; and the empty-batch fan-out clearing `data_node_state` engine-side while the canvas — fed a truthy `output: {}` — keeps showing the previous run's values, a fresh instance of the exact engine/canvas divergence this slice exists to remove). None of the 8 findings block this PASS as none map to a failing eval; all are carried to Gate 2 as human decisions — see `review-findings.md`.

Carry-forward re-pin (2026-07-30, branch feat/cache-l1-fingerprint):
`verified_commit` moved from d1b73c2c38c960925e6ef8c63f617d89030a8ec9 to
aba508a0edc61656b21d46bec6361cf4c6a0f927 with NO re-verify, under the carry-forward
rule in AGENTS.md. Both conditions were checked, not assumed.

(1) This feature's own code is unchanged. The branch's entire gated diff is FOUR
NEW FILES — `sdk/tongflow/engine/fingerprint.py`, `sdk/tests/test_fingerprint.py`,
`sdk/tests/test_fingerprint_vectors.py`, `sdk/tests/fixtures/fingerprint_vectors.json`
— so no pre-existing feature can own any of them. Ownership was computed per file
under the rule settled 2026-07-29, not inferred from the subtree: each feature's
owned set is the gated diff of the merge commit that landed it, intersected with
this branch's gated diff. All eight intersections are empty. Note in particular
that conformance-l0 declares `paths: ["sdk/**"]`, so narrow scope does NOT save it
— it is carried on ownership, not on scope.

(2) Standing checks green on the new tree, measured by round 2 of this branch's
own S4 verify rather than re-run by hand: `pnpm build && pnpm typecheck`,
`pnpm lint:check`, `pnpm test`, `cd sdk && pytest` (133 passed),
`pnpm verify:plugins`, and the generated-ABI drift check — all six suite commands
exited 0, alongside 16/16 feature evals.

The human signature line in frontmatter was not touched — it attests to the same
code it originally did.

Re-verify on `feat/cache-l2-store` (2026-07-30). NOT a carry-forward.
`verified_commit` moved from aba508a0edc61656b21d46bec6361cf4c6a0f927 to
e8fe1f26da983983f6ce5c5acf0d56217dfd1ae2, and this needs a fresh human signature under the
per-file ownership rule (settled 2026-07-29): the branch modifies TWO files this
feature owns — `sdk/tongflow/engine/runner.py` (the cache read/write block wired
into the per-call loop this feature built) and `src/lib/task/engine-delegate.server.ts`
(tenant sentinel + engineOptionsFor seam). This cost was NOT priced at L2's
Gate 1 — only cache-l1-fingerprint's re-signature was — and is disclosed here
rather than smuggled into a carry-forward.

All eight of this feature's evals re-run individually on the merged tree, each
by its own config key, all exit 0: sdk_pytest_batch (16), sdk_pytest_conformance
(5), sdk_pytest_plugin_rev (7), unit_conformance, unit_node_cached,
unit_plugin_rev, conformance_discriminating (all three perturbation kinds), and
plugin_rev_joined_path (TS install -> Python scan join preserved). The full
suite context: 159 SDK tests, 349 vitest, build/typecheck/lint green (L2 S4
round 1, 18/18 evals).

Semantic note for the signer: L2's runner changes ADD a cache branch ahead of
invoke_plugin; the fan-out/merge semantics this feature pinned (per-call fan-out,
ordered merge, empty-batch state reset) are untouched — its own batch tests and
the discriminating-suite guard still pass unmodified, which is precisely what
they exist to prove. One of its comments is now stale (the node_cached event it
declared for L2 is not yet emitted — L2 hits ride node_completed; recorded as an
L2 known limit).

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
