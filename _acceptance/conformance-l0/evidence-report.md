---
schema_version: 2
feature_slug: conformance-l0
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 43d2e3c37e1100db31db86a0618d9b5fc6705da4
human_signoff:
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
  run_id: minted-conformance-l0-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T05:17:24Z
  output: |
    ................                                                         [100%]
    16 passed in 0.04s

- eval: E2
  run_id: minted-conformance-l0-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T05:17:24Z
  output: |
    ................                                                         [100%]
    16 passed in 0.04s

- eval: E3
  run_id: minted-conformance-l0-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-07-28T05:17:24Z
  output: |
    116 passed in 3.31s

- eval: E4
  run_id: minted-conformance-l0-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T05:17:24Z
  output: |
    ................                                                         [100%]
    16 passed in 0.04s

- eval: E5
  run_id: minted-conformance-l0-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T05:17:24Z
  output: |
    ................                                                         [100%]
    16 passed in 0.04s

- eval: E6
  run_id: minted-conformance-l0-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-07-28T05:17:24Z
  output: |
    .....                                                                    [100%]
    5 passed in 0.03s

- eval: E7
  run_id: minted-conformance-l0-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-07-28T05:17:24Z
  output: |
          Tests  8 passed (8)
       Start at  12:18:16
       Duration  569ms (transform 236ms, setup 0ms, import 280ms, tests 5ms, environment 0ms)

- eval: E8
  run_id: minted-conformance-l0-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.conformance_discriminating
  verified_at: 2026-07-28T05:17:24Z
  output: |
    ==> revert: both halves must be GREEN again
        green
    OK: the conformance suite discriminates on all three perturbation kinds

- eval: E9
  run_id: minted-conformance-l0-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-07-28T05:17:24Z
  output: |
    ......                                                                   [100%]
    6 passed in 1.36s

- eval: E10
  run_id: minted-conformance-l0-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-07-28T05:17:24Z
  output: |
    ......                                                                   [100%]
    6 passed in 1.36s

- eval: E11
  run_id: minted-conformance-l0-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_rev
  verified_at: 2026-07-28T05:17:24Z
  output: |
          Tests  3 passed (3)
       Start at  12:18:16
       Duration  520ms (transform 53ms, setup 0ms, import 158ms, tests 3ms, environment 0ms)

- eval: E12
  run_id: minted-conformance-l0-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_node_cached
  verified_at: 2026-07-28T05:17:24Z
  output: |
          Tests  7 passed (7)
       Start at  12:18:16
       Duration  403ms (transform 47ms, setup 0ms, import 62ms, tests 18ms, environment 0ms)

- eval: E13
  run_id: minted-conformance-l0-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T05:17:24Z
  output: |
    ................                                                         [100%]
    16 passed in 0.04s

- eval: E14
  run_id: minted-conformance-l0-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-07-28T05:17:24Z
  output: |
    .....                                                                    [100%]
    5 passed in 0.03s

- eval: E15
  run_id: minted-conformance-l0-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.plugin_rev_joined_path
  verified_at: 2026-07-28T05:17:24Z
  output: |
    OK: TypeScript install -> Python scan preserved pluginRev 726b55fc3c8c2746a3adb1b35ef3361265cec61d

## Analyst

carried tu round 1 — baseline khong do lai round nay.

- E3 (AC-3, `cd sdk && ... pytest -q` — the full sdk suite) is non-discriminating: per the round-1 A/B baseline it passes on both HEAD and the diffBase. This is the expected shape for E3 — its stated purpose is a regression guard ("the pre-existing engine suite passes with NO edits to those files"), not a probe for the new fan-out behaviour, so a green-on-both result confirms the guard rather than indicating a vacuous eval. No rewrite needed; E1/E2/E4/E5/E13 (sdk_pytest_batch) and E14/E6 (conformance fixtures) are the evals that actually exercise the new batch/fan-out behaviour and showed `baseline: red` in round 1 (discriminate correctly). Not re-measured this round because `evals.yaml` did not change since the round-1 baseline capture.

## Variance

none — every multi-run eval is uniform (all evals ran with `runs: 1`, `passes: 1`, `variance: false`).

## Iterations

Round 1: All 15 machine evals (E1-E15) passed on the first verification pass; no failures, no BLOCKED evals, no judgment items pending. Supporting whole-repo checks (`pnpm build`, `pnpm typecheck`, `pnpm lint:check`, `pnpm test`, `pnpm verify:plugins`, `pnpm gen:abi` + diff-check) also passed clean. Round-1 code review surfaced 7 findings (3 high severity: `read_plugin_rev` crashing the scan when git is absent, `merge_fanout_views` wiping downstream state on unpopulated multi-output channels, and `node_completed` emitting only the last fan-out result to the canvas).

Round 2: Commit `bff647b` ("fix: three review findings from verification round 1") addressed the three high-severity round-1 findings. Re-ran all 15 machine evals (E1-E15) plus the full supporting suite (`pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test`, `pnpm verify:plugins`, `pnpm gen:abi` + diff-check) against `verified_commit: 153fcb486e1a3400e7345c8462a18b718e630883` — all green, no failures, no BLOCKED evals, no judgment items pending. `evals.yaml` did not change since round 1, so the A/B baseline was not re-measured this round; round-1 baseline results still apply and are carried forward in `## Analyst` above. Fresh adversarial code review of the round-2 tree surfaced 6 new findings (1 high, 2 medium, 3 low — the high one being `NODE_CACHED` handled in only one of three client-side `NodeStatus` switches); none blocked the round-2 PASS as none mapped to a failing eval, but the high finding was carried to Gate 2 as a human decision.

Round 3: Commit `43d2e3c` ("fix: close the high and two low findings from verification round 2") addressed the round-2 findings. Re-ran all 15 machine evals (E1-E15) plus the full supporting suite (`pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test`, `pnpm verify:plugins`, `pnpm gen:abi` + diff-check) against `verified_commit: 43d2e3c37e1100db31db86a0618d9b5fc6705da4` — all green, no failures, no BLOCKED evals, no judgment items pending. `evals.yaml` did not change since round 1, so the A/B baseline was again not re-measured this round (round-1 baseline results are carried forward in `## Analyst` above). Fresh adversarial code review of the round-3 tree surfaced 9 new findings (1 high, 4 medium, 4 low — the high one being a latent circular-import dependency `sdk/tongflow/scan.py` now has on `sdk/tongflow/engine`, which only avoids breaking today because of import order in `tongflow/__init__.py`); none block this PASS as none map to a failing eval, but the high finding and the two medium canvas/ABI-shape findings are carried to Gate 2 as human decisions — see `review-findings.md`.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
