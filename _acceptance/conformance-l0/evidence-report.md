---
schema_version: 2
feature_slug: conformance-l0
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 953a2057b401e71dec7def57382b836e942ba8e5
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
  run_id: minted-conformance-l0-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T02:23:27Z
  output: |
    ...........                                                              [100%]
    11 passed in 0.03s

- eval: E2
  run_id: minted-conformance-l0-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T02:23:27Z
  output: |
    ...........                                                              [100%]
    11 passed in 0.03s

- eval: E3
  run_id: minted-conformance-l0-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-07-28T02:23:27Z
  output: |
    ........................................................................ [ 66%]
    ....................................                                     [100%]
    108 passed in 2.48s

- eval: E4
  run_id: minted-conformance-l0-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T02:23:27Z
  output: |
    ...........                                                              [100%]
    11 passed in 0.03s

- eval: E5
  run_id: minted-conformance-l0-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T02:23:27Z
  output: |
    ...........                                                              [100%]
    11 passed in 0.03s

- eval: E6
  run_id: minted-conformance-l0-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-07-28T02:23:27Z
  output: |
    .....                                                                    [100%]
    5 passed in 0.03s

- eval: E7
  run_id: minted-conformance-l0-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-07-28T02:23:27Z
  output: |
          Tests  8 passed (8)
       Start at  09:25:19
       Duration  178ms (transform 55ms, setup 0ms, import 73ms, tests 3ms, environment 0ms)

- eval: E8
  run_id: minted-conformance-l0-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.conformance_discriminating
  verified_at: 2026-07-28T02:23:27Z
  output: |
    ==> revert: both halves must be GREEN again
        green
    OK: the conformance suite discriminates on all three perturbation kinds

- eval: E9
  run_id: minted-conformance-l0-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-07-28T02:23:27Z
  output: |
    ...                                                                      [100%]
    3 passed in 0.22s

- eval: E10
  run_id: minted-conformance-l0-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_plugin_rev
  verified_at: 2026-07-28T02:23:27Z
  output: |
    ...                                                                      [100%]
    3 passed in 0.22s

- eval: E11
  run_id: minted-conformance-l0-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_plugin_rev
  verified_at: 2026-07-28T02:23:27Z
  output: |
          Tests  3 passed (3)
       Start at  09:25:21
       Duration  215ms (transform 15ms, setup 0ms, import 51ms, tests 6ms, environment 0ms)

- eval: E12
  run_id: minted-conformance-l0-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_node_cached
  verified_at: 2026-07-28T02:23:27Z
  output: |
          Tests  4 passed (4)
       Start at  09:25:21
       Duration  135ms (transform 20ms, setup 0ms, import 27ms, tests 3ms, environment 0ms)

- eval: E13
  run_id: minted-conformance-l0-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_batch
  verified_at: 2026-07-28T02:23:27Z
  output: |
    ...........                                                              [100%]
    11 passed in 0.03s

- eval: E14
  run_id: minted-conformance-l0-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_conformance
  verified_at: 2026-07-28T02:23:27Z
  output: |
    .....                                                                    [100%]
    5 passed in 0.03s

- eval: E15
  run_id: minted-conformance-l0-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.plugin_rev_joined_path
  verified_at: 2026-07-28T02:23:27Z
  output: |
    OK: TypeScript install -> Python scan preserved pluginRev d4046116a903e6d239aeb310e79f3f947f0ff0a1

## Analyst

- E3 (AC-3, `cd sdk && ... pytest -q` — the full sdk suite) is non-discriminating: it passes on both HEAD and the diffBase baseline. This is the expected shape for E3 — its stated purpose is a regression guard ("the pre-existing engine suite passes with NO edits to those files"), not a probe for new fan-out behaviour, so a green-on-both result confirms the guard rather than indicating a vacuous eval. No rewrite needed; E1/E2/E4/E5/E13 (sdk_pytest_batch) and E14/E6 (conformance fixtures) are the evals that actually exercise the new batch/fan-out behaviour and all show `baseline: red` (discriminate correctly).

## Variance

none — every multi-run eval is uniform (all evals ran with `runs: 1`, `passes: 1`, `variance: false`).

## Iterations

Round 1: All 15 machine evals (E1-E15) passed on the first verification pass; no failures, no BLOCKED evals, no judgment items pending. Supporting whole-repo checks (`pnpm build`, `pnpm typecheck`, `pnpm lint:check`, `pnpm test`, `pnpm verify:plugins`, `pnpm gen:abi` + diff-check) also passed clean.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
