---
schema_version: 2
feature_slug: task-metering
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9031af8d906daf36048b5ad8eb2c98c6c45cb26c
human_signoff:
---

# Evidence Report: task-metering

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
| E12 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: task-metering-e1-20260725152934
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-25T15:29:34Z
  output: |
    ✓ src/db/metering-schema.test.ts > metering migration shape (AC-1) > introduces the three columns in exactly one migration 1ms
    ✓ src/db/metering-schema.test.ts > metering migration shape (AC-1) > is purely additive — three ADDs, no DROP, no RENAME 0ms

     Test Files  1 passed (1)
          Tests  4 passed (4)
       Duration  271ms (transform 17ms, import 194ms, tests 11ms)

- eval: E2
  run_id: task-metering-e2-20260725152934
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-25T15:29:34Z
  output: |
    ✓ src/db/metering-schema.test.ts > upgrading an existing database (AC-2) > adds the columns without disturbing pre-existing rows 3ms

     Test Files  1 passed (1)
          Tests  4 passed (4)
       Duration  271ms (transform 17ms, import 194ms, tests 11ms)

- eval: E3
  run_id: task-metering-e3-20260725152934
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-25T15:29:34Z
  output: |
    ✓ src/db/metering-schema.test.ts > fresh database (AC-3) > declares all three columns nullable with the intended types 5ms

     Test Files  1 passed (1)
          Tests  4 passed (4)
       Duration  271ms (transform 17ms, import 194ms, tests 11ms)

- eval: E4
  run_id: task-metering-e4-20260725152943
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-25T15:29:43Z
  output: |
    ✓ src/lib/task/metering.test.ts > successful invocation (AC-4) > records the elapsed plugin time next to status completed 23ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  495ms (transform 59ms, import 210ms, tests 226ms)

- eval: E5
  run_id: task-metering-e5-20260725152943
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-25T15:29:43Z
  output: |
    ✓ src/lib/task/metering.test.ts > plugin reports failure (AC-5) > still records the time — a failed generation burns GPU too 22ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  495ms (transform 59ms, import 210ms, tests 226ms)

- eval: E6
  run_id: task-metering-e6-20260725152943
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-25T15:29:43Z
  output: |
    ✓ src/lib/task/metering.test.ts > plugin throws (AC-6) > records the time from the catch branch 23ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  495ms (transform 59ms, import 210ms, tests 226ms)

- eval: E7
  run_id: task-metering-e7-20260725152943
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-25T15:29:43Z
  output: |
    ✓ src/lib/task/metering.test.ts > measurement boundary (AC-7) > excludes asset preparation from the billable number 143ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  495ms (transform 59ms, import 210ms, tests 226ms)

- eval: E8
  run_id: task-metering-e8-20260725152943
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-25T15:29:43Z
  output: |
    ✓ src/lib/task/metering.test.ts > aborted run (AC-8) — suppression half > writes no duration for a cancelled task 12ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  495ms (transform 59ms, import 210ms, tests 226ms)

- eval: E9
  run_id: task-metering-e9-20260725152943
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-25T15:29:43Z
  output: |
    ✓ src/lib/task/metering.test.ts > cost and gpu stay unmeasured (AC-9) — suppression half > never writes cost_usd or gpu_type on any exit 3ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  495ms (transform 59ms, import 210ms, tests 226ms)

- eval: E10
  run_id: task-metering-e10-20260725153006
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit
  verified_at: 2026-07-25T15:30:06Z
  output: |
    > oneflow@0.2.1 test /Users/manhphan/dev/oneflow
    > vitest run

     RUN  v4.1.5 /Users/manhphan/dev/oneflow

     Test Files  18 passed (18)
          Tests  162 passed (162)
       Duration  569ms (transform 1.02s, import 1.90s, tests 431ms)

- eval: E11
  run_id: task-metering-e11-20260725153044
  exit_code: 0
  baseline: green
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-25T15:30:44Z
  output: |
    ✓ Compiled successfully in 2.9s
      Linting and checking validity of types ...
      Collecting page data ...
    ✓ Generating static pages (25/25)
      Finalizing page optimization ...

    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E12
  run_id: task-metering-e12-20260725153013
  exit_code: 0
  baseline: green
  verifier: config:executors.test.lint
  verified_at: 2026-07-25T15:30:13Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .

    Checked 341 files in 62ms. No fixes applied.

## Analyst

E8 and E9 are green on both sides of the A/B — they pass unchanged against pre-feature
code (worktree at HEAD~1 = 757073a, with only the two new test files copied in).

This is structural, not a harness defect: both are the SUPPRESSION half of their criteria.
E8 asserts that an aborted run writes no `duration_ms`; E9 asserts that no write path ever
sets `cost_usd` or `gpu_type`. On pre-feature code nothing writes `duration_ms` anywhere and
the three columns do not exist, so both assertions hold vacuously. A suppression check cannot
discriminate feature-present from feature-absent by construction — it constrains the blast
radius of the feature rather than demonstrating it.

Consequence for the human: AC-8 and AC-9 are guarded against regression from here on, but
their green status in this round is not by itself evidence that the abort path and the
NULL-column discipline were implemented deliberately. The positive evidence for those two
criteria is indirect — E4/E5/E6 are red on baseline and prove `duration_ms` is genuinely
written on the three terminal paths, which is what makes E8's "and not on the fourth" and
E9's "and never these two columns" meaningful rather than trivial.

E1–E7 are red on baseline and therefore discriminate.

## Variance

none — no eval declares runs > 1

## Iterations

Round 1: all evals green.

Note for the reader (does not affect any verdict): E10's `expected` text describes the
pre-existing suite as "154 assertions". The measured pre-feature suite at HEAD~1 is
152 tests across 16 files; the feature branch is 162 across 18 — exactly the 10 new
metering tests, with no pre-existing test removed or renamed. The binding requirement
for E10 ("the whole vitest suite is green") is met; only the prose count in evals.yaml
was slightly off.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
