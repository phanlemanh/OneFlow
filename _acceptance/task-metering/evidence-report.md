---
schema_version: 2
feature_slug: task-metering
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f9f0b18774cfe40057325bafb482a758984ff41d
human_signoff: Manh 2026-07-25
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
  run_id: task-metering-r3-e1-20260726033650
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-26T03:36:50Z
  output: |
    ✓ src/db/metering-schema.test.ts > metering migration shape (AC-1) > introduces the three columns in exactly one migration 1ms
    ✓ src/db/metering-schema.test.ts > metering migration shape (AC-1) > is purely additive — three ADDs, no DROP, no RENAME 0ms

     Test Files  1 passed (1)
          Tests  4 passed (4)
       Duration  243ms (transform 13ms, setup 0ms, import 175ms, tests 9ms, environment 0ms)

- eval: E2
  run_id: task-metering-r3-e2-20260726033650
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-26T03:36:50Z
  output: |
    ✓ src/db/metering-schema.test.ts > upgrading an existing database (AC-2) > adds the columns without disturbing pre-existing rows 3ms

     Test Files  1 passed (1)
          Tests  4 passed (4)
       Duration  243ms (transform 13ms, setup 0ms, import 175ms, tests 9ms, environment 0ms)

- eval: E3
  run_id: task-metering-r3-e3-20260726033650
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-26T03:36:50Z
  output: |
    ✓ src/db/metering-schema.test.ts > fresh database (AC-3) > declares all three columns nullable with the intended types 5ms

     Test Files  1 passed (1)
          Tests  4 passed (4)
       Duration  243ms (transform 13ms, setup 0ms, import 175ms, tests 9ms, environment 0ms)

- eval: E4
  run_id: task-metering-r3-e4-20260726033651
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T03:36:51Z
  output: |
    ✓ src/lib/task/metering.test.ts > successful invocation (AC-4) > records the elapsed plugin time next to status completed 22ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  490ms (transform 56ms, setup 0ms, import 205ms, tests 224ms, environment 0ms)

- eval: E5
  run_id: task-metering-r3-e5-20260726033651
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T03:36:51Z
  output: |
    ✓ src/lib/task/metering.test.ts > plugin reports failure (AC-5) > still records the time — a failed generation burns GPU too 21ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  490ms (transform 56ms, setup 0ms, import 205ms, tests 224ms, environment 0ms)

- eval: E6
  run_id: task-metering-r3-e6-20260726033651
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T03:36:51Z
  output: |
    ✓ src/lib/task/metering.test.ts > plugin throws (AC-6) > records the time from the catch branch 22ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  490ms (transform 56ms, setup 0ms, import 205ms, tests 224ms, environment 0ms)

- eval: E7
  run_id: task-metering-r3-e7-20260726033651
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T03:36:51Z
  output: |
    ✓ src/lib/task/metering.test.ts > measurement boundary (AC-7) > excludes asset preparation from the billable number 143ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  490ms (transform 56ms, setup 0ms, import 205ms, tests 224ms, environment 0ms)

- eval: E8
  run_id: task-metering-r3-e8-20260726033651
  exit_code: 0
  baseline: carried-forward (r1: green)
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T03:36:51Z
  output: |
    ✓ src/lib/task/metering.test.ts > aborted run (AC-8) — suppression half > writes no duration for a cancelled task 13ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  490ms (transform 56ms, setup 0ms, import 205ms, tests 224ms, environment 0ms)

- eval: E9
  run_id: task-metering-r3-e9-20260726033651
  exit_code: 0
  baseline: carried-forward (r1: green)
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T03:36:51Z
  output: |
    ✓ src/lib/task/metering.test.ts > cost and gpu stay unmeasured (AC-9) — suppression half > never writes cost_usd or gpu_type on any exit 2ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  490ms (transform 56ms, setup 0ms, import 205ms, tests 224ms, environment 0ms)

- eval: E10
  run_id: task-metering-r3-e10-20260726033800
  exit_code: 0
  baseline: carried-forward (r1: green)
  verifier: config:executors.test.unit
  verified_at: 2026-07-26T03:38:00Z
  output: |
    > oneflow@0.2.1 test /Users/manhphan/dev/oneflow
    > vitest run

     RUN  v4.1.5 /Users/manhphan/dev/oneflow

     Test Files  21 passed (21)
          Tests  197 passed (197)

- eval: E11
  run_id: task-metering-r3-e11-20260726033808
  exit_code: 0
  baseline: carried-forward (r1: green)
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-26T03:38:08Z
  output: |
    ✓ Compiled successfully in 3.0s
    └ ƒ /workspace                            379 kB         563 kB
    + First Load JS shared by all             103 kB

    ƒ  (Dynamic)  server-rendered on demand

    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E12
  run_id: task-metering-r3-e12-20260726033801
  exit_code: 0
  baseline: carried-forward (r1: green)
  verifier: config:executors.test.lint
  verified_at: 2026-07-26T03:38:01Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .

    Checked 353 files in 80ms. No fixes applied.

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

**No A/B baseline was measured in round 3.** The A/B above was measured in round 1 and is
carried forward, not re-derived: rounds 2 and 3 are re-pins of an already-signed-off PASS
onto a moved tree, and the discrimination question was settled in round 1. Every per-eval
`baseline:` is marked `carried-forward` for that reason — those values record round 1's
measurement, not a round-3 one, and should be read as history rather than as a fresh
result. Everything else in this report (run_ids, exit codes, timestamps, outputs) was
produced by round-3 runs.

Round 3 attribution, not shared exit codes: E1–E3 and E4–E9 each bind a targeted vitest
file. I ran each resolved command twice — once verbatim for the recorded exit status, and
once with `--reporter=verbose` (a reporter flag changes formatting only, not selection or
outcome) so every test name is visible. Each eval below is credited to the specific test
whose `describe` block names its AC, and all ten metering tests are individually listed
and green: 4 in `metering-schema.test.ts` (AC-1 ×2, AC-2, AC-3) and 6 in
`metering.test.ts` (AC-4 … AC-9, one each). **No eval is marked PASS on a shared exit
code alone.**

Round 3 note on the standing checks: E10/E11/E12 are shared with the `measure-harness` and
`sdk-distribution-rename` features verified in the same session. Each command was executed
exactly once against this tree and its real result recorded for every feature that binds
it, with distinct `run_id`s per feature. All three were run from the repo root at commit
f9f0b18 with a clean working tree — `git status --porcelain` was empty both before the
runs and after `pnpm build` (whose `prebuild` regenerates the ABI types), so the build
confirms the generated ABI is committed in sync. The suite is unchanged from round 2 at
197 tests across 21 files, biome still checks 353 files, and the metering tests themselves
are unchanged at 4 + 6 — consistent with a rebase that moved commits without altering this
feature's code.

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

Round 2 (2026-07-26T01:15Z, commit 8d1e57a): **re-pin only — the verdict and the human
signature stand unchanged.** This feature is already merged to `main` and signed off; its
round-1 pin was commit 9031af8, and `pre-merge-check` correctly reported the evidence as
stale, because `stale_files` compares the whole tree against `verified_commit` and any
later non-T1 code — here, the `measure-harness` feature landing on the branch — invalidates
the pin. The remedy is to re-run the evals on the current tree and re-pin, never to
hand-edit the SHA. All 12 evals were re-run at 8d1e57a and all 12 are green, so the PASS
still holds on the code actually being merged; `verified_commit`, `run_id`, `verified_at`
and `output` were updated and nothing else. The human signature line is preserved
exactly as signed. The suite has grown to 197 tests across 21 files (round 1: 162/18) and
biome now checks 353 files (round 1: 341) — both consistent with `main` plus
`measure-harness`, and the metering tests themselves are unchanged at 4 + 6.

Round 3 (2026-07-26T03:36–03:38Z, commit f9f0b18): **re-pin only, forced by the rebase and
by the coarse staleness rule — not by any code defect.** The branch
`chore/sdk-distribution-rename` was rebased onto `main`, which replaced the commits round 2
pinned to, and the `sdk-distribution-rename` feature now sits beside this one in the tree.
`stale_files` compares the whole tree against `verified_commit` and cannot distinguish
"code this feature depends on changed" from "unrelated code exists", so it reported all
three features stale at once. **No task-metering code changed**, and I re-derived that here
rather than taking it on trust: `git diff --name-only 8d1e57a HEAD` with `_acceptance/`
excluded lists eleven files, and every one belongs to `sdk-distribution-rename`
(`.env.example`, `CLAUDE.md`, `docs/plugins.md`, `package.json`,
`scripts/publish-tongflow-pypi.sh`, `sdk/README.md`, `sdk/pyproject.toml`,
`sdk/tests/test_engine.py`, `sdk/tests/test_packaging.py`, `sdk/tongflow/__init__.py`,
`sdk/tongflow/engine/plugins.py`). Not one metering file — no migration, no
`src/lib/task/`, neither test file — appears in that diff. The remedy is to re-run the
evals and re-pin; the SHA was never
hand-edited. All 12 evals were re-executed on this tree and all 12 are green, so the rebase
introduced no regression and the PASS still holds on the code actually being merged.
`verified_commit` moves 8d1e57a → f9f0b18; `run_id`, `verified_at` and `output` were
updated and nothing else. The verdict is unchanged and the human signature line in
frontmatter is preserved byte-for-byte as signed.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
