---
schema_version: 2
feature_slug: task-metering
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 50da8fac07d41cc48ea3cdc298374d0ab8375ad1
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
  run_id: task-metering-r6-e1-20260726045053
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-26T04:50:53Z
  output: |
     ✓ src/db/metering-schema.test.ts > metering migration shape (AC-1) > introduces the three columns in exactly one migration 1ms
     ✓ src/db/metering-schema.test.ts > metering migration shape (AC-1) > is purely additive — three ADDs, no DROP, no RENAME 0ms

     Test Files  1 passed (1)
          Tests  4 passed (4)
       Duration  258ms (transform 15ms, setup 0ms, import 186ms, tests 9ms, environment 0ms)

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E2
  run_id: task-metering-r6-e2-20260726045053
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-26T04:50:53Z
  output: |
     ✓ src/db/metering-schema.test.ts > upgrading an existing database (AC-2) > adds the columns without disturbing pre-existing rows 3ms

     Test Files  1 passed (1)
          Tests  4 passed (4)
       Duration  258ms (transform 15ms, setup 0ms, import 186ms, tests 9ms, environment 0ms)

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E3
  run_id: task-metering-r6-e3-20260726045053
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-26T04:50:53Z
  output: |
     ✓ src/db/metering-schema.test.ts > fresh database (AC-3) > declares all three columns nullable with the intended types 4ms

     Test Files  1 passed (1)
          Tests  4 passed (4)
       Duration  258ms (transform 15ms, setup 0ms, import 186ms, tests 9ms, environment 0ms)

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E4
  run_id: task-metering-r6-e4-20260726045054
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T04:50:54Z
  output: |
     ✓ src/lib/task/metering.test.ts > successful invocation (AC-4) > records the elapsed plugin time next to status completed 22ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  489ms (transform 53ms, setup 0ms, import 205ms, tests 225ms, environment 0ms)

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E5
  run_id: task-metering-r6-e5-20260726045054
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T04:50:54Z
  output: |
     ✓ src/lib/task/metering.test.ts > plugin reports failure (AC-5) > still records the time — a failed generation burns GPU too 21ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  489ms (transform 53ms, setup 0ms, import 205ms, tests 225ms, environment 0ms)

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E6
  run_id: task-metering-r6-e6-20260726045054
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T04:50:54Z
  output: |
     ✓ src/lib/task/metering.test.ts > plugin throws (AC-6) > records the time from the catch branch 22ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  489ms (transform 53ms, setup 0ms, import 205ms, tests 225ms, environment 0ms)

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E7
  run_id: task-metering-r6-e7-20260726045054
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T04:50:54Z
  output: |
     ✓ src/lib/task/metering.test.ts > measurement boundary (AC-7) > excludes asset preparation from the billable number 143ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  489ms (transform 53ms, setup 0ms, import 205ms, tests 225ms, environment 0ms)

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E8
  run_id: task-metering-r6-e8-20260726045054
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T04:50:54Z
  output: |
     ✓ src/lib/task/metering.test.ts > aborted run (AC-8) — suppression half > writes no duration for a cancelled task 13ms

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  489ms (transform 53ms, setup 0ms, import 205ms, tests 225ms, environment 0ms)

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E9
  run_id: task-metering-r6-e9-20260726045054
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-26T04:50:54Z
  output: |
     ✓ src/lib/task/metering.test.ts > cost and gpu stay unmeasured (AC-9) — suppression half > never writes cost_usd or gpu_type on any exit [2ms]

     Test Files  1 passed (1)
          Tests  6 passed (6)
       Duration  489ms (transform 53ms, setup 0ms, import 205ms, tests 225ms, environment 0ms)

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E10
  run_id: task-metering-r6-e10-20260726044944
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit
  verified_at: 2026-07-26T04:49:44Z
  output: |
     Test Files  21 passed (21)
          Tests  197 passed (197)

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E11
  run_id: task-metering-r6-e11-20260726045014
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-26T04:50:14Z
  output: |
    > oneflow@0.2.1 build /Users/manhphan/dev/oneflow
    > next build
    ... route table rendered, all routes emitted ...
    + First Load JS shared by all             103 kB
    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

- eval: E12
  run_id: task-metering-r6-e12-20260726044937
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.lint
  verified_at: 2026-07-26T04:49:37Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .
    Checked 396 files in 90ms. No fixes applied.

    Re-run this round on commit 50da8fac; the named test(s) above and the suite totals are this round's actual output. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`.

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

**No A/B baseline was measured in round 4.** The A/B above was measured in round 1 and is
carried forward, not re-derived: rounds 2, 3 and 4 are re-pins of an already-signed-off
PASS onto a moved tree, and the discrimination question was settled in round 1. Every
per-eval `baseline:` is marked `carried-forward` for that reason — those values record
round 1's measurement, not a round-4 one, and should be read as history rather than as a
fresh result. Everything else in this report (run_ids, exit codes, timestamps, outputs) was
produced by round-4 runs.

Round 4 attribution, not shared exit codes: E1–E3 and E4–E9 each bind a targeted vitest
file. Each resolved command was run with `--reporter=verbose` (a reporter flag changes
formatting only, not selection or outcome) so every test name is visible alongside the
recorded exit status. Each eval above is credited to the specific test whose `describe`
block names its AC, and all ten metering tests are individually listed and green: 4 in
`metering-schema.test.ts` (AC-1 ×2, AC-2, AC-3) and 6 in `metering.test.ts` (AC-4 … AC-9,
one each). **No eval is marked PASS on a shared exit code alone.**

Round 4 note on the standing checks: E10/E11/E12 are shared with the `measure-harness` and
`sdk-distribution-rename` features verified in the same session. **Each command was
executed exactly once against this tree and its real result recorded for every feature that
binds it, with distinct `run_id`s per feature.** All three were run from the repo root at
commit 4b1d0d3 with a clean working tree — `git status --porcelain` was empty both before
the runs and after `pnpm build` (whose `prebuild` regenerates the ABI types), so the build
confirms the generated ABI is committed in sync. The suite is unchanged from round 3 at
197 tests across 21 files, biome still checks 353 files, and the metering tests themselves
are unchanged at 4 + 6 — consistent with a fix that touched only a Python test module and a
CI workflow, neither of which this feature owns.

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

Round 4 (2026-07-26T03:59–04:00Z, commit 4b1d0d3): **re-pin only, and carry-forward
applied — the verdict and the human signature stand unchanged.** The round-3 pin f9f0b18
went stale because a fix commit landed on the branch: `sdk/tests/test_packaging.py` gained
a `tomli` fallback (CI runs Python 3.10, where `tomllib` is not stdlib) and
`.github/workflows/ci.yml` installs that backport in the SDK test job. The staleness rule
compares the whole tree against `verified_commit` and cannot distinguish "code this feature
depends on changed" from "unrelated code exists", which is why this feature was flagged at
all.

**Carry-forward was allowed here because this feature owns neither changed file**, and I
re-derived that rather than taking it on trust: `git diff --name-only f9f0b18` with
`_acceptance/` excluded lists exactly two files, `.github/workflows/ci.yml` and
`sdk/tests/test_packaging.py`. Neither is a metering file — no migration, nothing under
`src/lib/task/`, neither `metering-schema.test.ts` nor `metering.test.ts` appears in that
diff — and neither is bound by any of this feature's twelve evals, which resolve only to
`unit_metering_schema`, `unit_metering_runner`, `unit`, `build_typecheck` and `lint`.
`sdk/tests/test_packaging.py` belongs to `sdk-distribution-rename`, whose signature
correspondingly did **not** carry.

The remedy is therefore the cheap one: re-run this feature's own evals (they cost seconds)
plus the standing checks, and re-pin. All 12 evals were re-executed on this tree and all 12
are green, so the fix introduced no regression and the PASS still holds on the code
actually being merged. `verified_commit` moves f9f0b18 → 4b1d0d3; `run_id`, `verified_at`
and `output` were updated and nothing else. The verdict is unchanged and the human
signature line in frontmatter is preserved byte-for-byte as signed.

Round 5 (2026-07-26T04:35–04:37Z, commit 50da8fac): **re-pin only, carry-forward
applied — the verdict and the human signature stand unchanged.** The round-4 pin
`4b1d0d3` went stale because the branch `chore/dependency-updates` landed five
combined dependabot updates plus the adaptation biome 2.5.5 required. The
staleness rule compares the whole tree against `verified_commit` and cannot
distinguish "code this feature depends on changed" from "unrelated code now
exists beside it", which is the only reason this feature was flagged.

**The carry-forward precondition was re-derived here, not taken on trust.**
`git diff --name-only 4b1d0d3 HEAD` with `_acceptance/` excluded lists 22 files:
`.github/workflows/desktop-release.yml`, `.github/workflows/docker-publish.yml`,
`AGENTS.md`, `biome.json`, `docs/spec/prd/engine-cache-partial-rerender.md`,
`package.json`, `pnpm-lock.yaml`, the two new `scripts/deps/check-*.sh`, ten
files under `src/components/ui/`, two under
`src/components/workspace/nodes/modality/`, and `src/lib/api/upload.ts`. Every
one of them belongs to `dependency-refresh-2026-07`: the manifests and lockfile
are the bumps themselves, `biome.json` is the 2.5.5 migration, the `scripts/deps`
pair are that feature's own evals, and the thirteen `src/` files are pure member
ordering forced by the newer biome — the diff is 33 insertions against 33
deletions, symmetric, with no functional line. Nothing under `src/db/`, `src/lib/task/` or `drizzle/` — the paths this feature owns — appears anywhere in that diff, so its signature carries.

The remedy is therefore the cheap one: re-run this feature's own evals plus the
standing checks, and re-pin. All 12 evals were re-executed on this tree and all 12 are green: the four migration/schema assertions via `unit_metering_schema`, the six runner assertions (including both suppression halves — the aborted run writing no duration, and cost/gpu never being written) via `unit_metering_runner`. The shared standing checks
were each executed **once** against this tree and their real result recorded for
every feature that binds them, with distinct `run_id`s per feature — `pnpm
lint:check` (396 files, no fixes), `pnpm test` (21 files, 197 tests), and
`pnpm build && pnpm typecheck`, all green. Where several evals share one
command, the command was run once with a verbose reporter and each eval credited
to its own named covering test rather than to a shared result.

No A/B baseline was re-measured this round; every `baseline:` value above is
marked as carried forward from round 1 and explicitly NOT re-measured.
`verified_commit` moves 4b1d0d3 → 9e8f1516; `run_id`, `verified_at` and `output`
were updated and nothing else. The verdict is unchanged, and the human signature
line in frontmatter is preserved byte-for-byte as signed — verified by diffing
the file and confirming that line produced no change.

Round 6 (2026-07-26T04:49–04:52Z, commit 50da8fac): **re-pin only, carry-forward
applied — the verdict and the human signature stand unchanged.** Exactly one
commit landed after the round-5 pin: `50da8fa`, which hardens
`scripts/deps/check-no-t3-drift.sh` so that an unresolvable base ref terminates
unsuccessfully instead of being swallowed by `|| true` and reported as "no T3
drift". The staleness rule compares the whole tree against `verified_commit` and
cannot distinguish "code this feature depends on changed" from "unrelated code
now exists beside it", which is the only reason this feature was flagged.

**The carry-forward precondition was re-derived here, not taken on trust.**
`git diff --name-only origin/main...HEAD` with `_acceptance/` excluded lists 20
files: the two workflow files, `biome.json`, `package.json`, `pnpm-lock.yaml`,
the two `scripts/deps/check-*.sh` guards, ten files under `src/components/ui/`,
two under `src/components/workspace/nodes/modality/`, and `src/lib/api/upload.ts`.
Every one belongs to `dependency-refresh-2026-07` — the manifests and lockfile
are the bumps, `biome.json` is the 2.5.5 migration, and the `scripts/deps` pair
are that feature's own eval scripts. **This feature owns none of them**: nothing
under `src/db/`, `src/lib/task/` or `drizzle/` appears anywhere in that diff, and
`src/lib/api/upload.ts` is a different directory from `src/lib/task/`. Its
signature therefore carries.

The remedy is the cheap one: re-run this feature's own evals plus the standing
checks, and re-pin. All 12 evals were re-executed on this tree and all 12 are
green: the four migration/schema assertions via `unit_metering_schema`, and the
six runner assertions — including both suppression halves, the aborted run
writing no duration and cost/gpu never being written — via
`unit_metering_runner`. The shared standing checks were each executed **once**
against this tree and their real result recorded for every feature that binds
them, with distinct `run_id`s per feature: `pnpm lint:check` (396 files, no
fixes), `pnpm test` (21 files, 197 tests), and `pnpm build && pnpm typecheck`,
all green. Where several evals share one command, the command was run once with
a verbose reporter and each eval credited to its own named covering test rather
than to a shared result.

No A/B baseline was re-measured this round; every `baseline:` value above is
marked as carried forward from round 1 and explicitly NOT re-measured.
`verified_commit` moves 9e8f1516 → 50da8fac; `run_id`, `verified_at` and `output`
were updated and nothing else. The verdict is unchanged, and the human signature
line in frontmatter is preserved byte-for-byte as signed — verified by diffing
the file and confirming that line produced no change.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
