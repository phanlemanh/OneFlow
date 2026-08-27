---
schema_version: 2
feature_slug: task-metering
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d919b5eb51a0a3dfa70b5718113c935b39099ab0
human_signoff: Manh 2026-08-07
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
  run_id: task-metering-E1-20260807T013628Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-08-07T01:36:28Z
  output: |
    Test Files  1 passed (1)
         Tests  7 passed (7)
    criterion tests: "metering migration shape (AC-1) > introduces the three columns
    in exactly one migration", "is purely additive — three ADDs, no DROP, no RENAME"

- eval: E2
  run_id: task-metering-E2-20260807T013629Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-08-07T01:36:29Z
  output: |
    Test Files  1 passed (1) / Tests  7 passed (7)
    criterion test: "upgrading an existing database (AC-2) > adds the columns without
    disturbing pre-existing rows"

- eval: E3
  run_id: task-metering-E3-20260807T013630Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-08-07T01:36:30Z
  output: |
    Test Files  1 passed (1) / Tests  7 passed (7)
    criterion test: "fresh database (AC-3) > declares all three columns nullable with
    the intended types"

- eval: E4
  run_id: task-metering-E4-20260807T013631Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-07T01:36:31Z
  output: |
    Test Files  1 passed (1)
         Tests  6 passed (6)
    criterion test: "successful invocation (AC-4) > records the elapsed plugin time
    next to status completed"

- eval: E5
  run_id: task-metering-E5-20260807T013632Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-07T01:36:32Z
  output: |
    Test Files  1 passed (1) / Tests  6 passed (6)
    criterion test: "plugin reports failure (AC-5) > still records the time — a failed
    generation burns GPU too"

- eval: E6
  run_id: task-metering-E6-20260807T013633Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-07T01:36:33Z
  output: |
    Test Files  1 passed (1) / Tests  6 passed (6)
    criterion test: "plugin throws (AC-6) > records the time from the catch branch"

- eval: E7
  run_id: task-metering-E7-20260807T013634Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-07T01:36:34Z
  output: |
    Test Files  1 passed (1) / Tests  6 passed (6)
    criterion test: "measurement boundary (AC-7) > excludes asset preparation from the
    billable number" (142ms — the test really does spend the padded asset time)

- eval: E8
  run_id: task-metering-E8-20260807T013635Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-07T01:36:35Z
  output: |
    Test Files  1 passed (1) / Tests  6 passed (6)
    criterion test: "aborted run (AC-8) — suppression half > writes no duration for a
    cancelled task"

- eval: E9
  run_id: task-metering-E9-20260807T013636Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-08-07T01:36:36Z
  output: |
    Test Files  1 passed (1) / Tests  6 passed (6)
    criterion test: "cost and gpu stay unmeasured (AC-9) — suppression half > never
    writes cost_usd or gpu_type on any exit"

- eval: E10
  run_id: task-metering-E10-20260807T013638Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-07T01:36:38Z
  output: |
    $ vitest run
    Test Files  32 passed (32)
         Tests  427 passed (427)
      Duration  1.58s

- eval: E11
  run_id: task-metering-E11-20260807T013711Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-07T01:37:11Z
  output: |
    (Dynamic)  server-rendered on demand
    $ tsc --noEmit

- eval: E12
  run_id: task-metering-E12-20260807T013639Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-07T01:36:39Z
  output: |
    $ pnpm exec biome check --error-on-warnings .
    Checked 429 files in 81ms. No fixes applied.

## Analyst

Baseline is `n-a` on every eval: establishing an A/B baseline would require moving
the working tree to the diffBase, which this re-verification round is forbidden to
do (no git operations at all). Discrimination cannot be re-established this round;
the earlier signed rounds carry that judgment.

Nine evals share two commands — E1-E3 on `src/db/metering-schema.test.ts` and E4-E9
on `src/lib/task/metering.test.ts`. Each eval was executed as its own run with its
own logged run_id, and both files were additionally enumerated once with
`--reporter=verbose` so each evidence block can name the test carrying its criterion.
Every criterion AC-1 through AC-9 has at least one test whose name states it, and the
two suppression-half criteria (AC-8, AC-9) each carry a test explicitly labelled
"suppression half". Nothing in the AC-1…AC-9 range is riding a shared exit code
without an implementation behind it.

Two things the Gate-2 reviewer should know:

- `src/db/metering-schema.test.ts` has grown since this feature was signed: it now
  holds seven tests, three of which belong to the later cache-l4-eviction work
  ("cache counters ..."). E1-E3 therefore pass a file whose green includes assertions
  outside this contract. That is why each block above names the specific
  metering test rather than resting on the file's exit status. The precise fix, if
  the human wants these keys tightened, is the `-t` scoping already used elsewhere in
  `_acceptance/config.yaml` (see `unit_l4_schema_columns`, which scopes the same file
  to `-t 'cache counters'`).
- E10's `expected` still describes "152 assertions plus the 10 new metering tests";
  the suite is now 427 tests across 32 files. AC-10 asks only that the lifecycle
  behaviour be unchanged and the suite green, and it is — the number in the eval
  text is stale prose, not a failed condition.

## Variance

none — every multi-run eval is uniform (all evals here are deterministic, runs: 1)

## Iterations

Round 1 (re-verification after upstream code change)

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line (none in this report — no judgment evals)
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (this contract is T3 but declares no judgment evals — nothing to fill)
- [ ] Decide whether E1-E3 should be re-scoped with `-t` now that the schema test
      file also carries later cache-counter assertions (see Analyst)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (n/a — verdict is PASS)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

### Re-pin lần 1 — 2026-08-27, do fork `STALE-DIFF-SCOPE-GUARD` được thu hẹp (hồ sơ `gate-tooling-t1`): feature khai đủ `paths` nay lại bị soi staleness, làm lộ bản ghi cũ này. Mã của gói này không đổi — mọi suite chạy lại đều exit 0
run_id: repin-task-metering-20260827T101500Z
sha: d919b5eb51a0a3dfa70b5718113c935b39099ab0 · suites: 5 lệnh exit 0
