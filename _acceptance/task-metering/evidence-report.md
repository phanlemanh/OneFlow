---
schema_version: 2
feature_slug: task-metering
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (round 14)
enforcement_mode: strict
bypass_used: false
verified_commit: c000b4b6b32f29eea6217f8de26596a052737128
human_signoff: Manh 2026-07-30
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
  run_id: task-metering-r15-E1-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/db/metering-schema.test.ts > metering migration shape (AC-1) > introduces the three columns in exactly one migration 2ms

    Test Files  1 passed (1)
         Tests  4 passed (4)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E2
  run_id: task-metering-r15-E2-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/db/metering-schema.test.ts > upgrading an existing database (AC-2) > adds the columns without disturbing pre-existing rows 3ms

    Test Files  1 passed (1)
         Tests  4 passed (4)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E3
  run_id: task-metering-r15-E3-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/db/metering-schema.test.ts > fresh database (AC-3) > declares all three columns nullable with the intended types 5ms

    Test Files  1 passed (1)
         Tests  4 passed (4)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E4
  run_id: task-metering-r15-E4-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/task/metering.test.ts > successful invocation (AC-4) > records the elapsed plugin time next to status completed 23ms

    Test Files  1 passed (1)
         Tests  6 passed (6)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E5
  run_id: task-metering-r15-E5-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/task/metering.test.ts > plugin reports failure (AC-5) > still records the time — a failed generation burns GPU too 21ms

    Test Files  1 passed (1)
         Tests  6 passed (6)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E6
  run_id: task-metering-r15-E6-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/task/metering.test.ts > plugin throws (AC-6) > records the time from the catch branch 23ms

    Test Files  1 passed (1)
         Tests  6 passed (6)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E7
  run_id: task-metering-r15-E7-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/task/metering.test.ts > measurement boundary (AC-7) > excludes asset preparation from the billable number 141ms

    Test Files  1 passed (1)
         Tests  6 passed (6)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E8
  run_id: task-metering-r15-E8-20260727105026
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/task/metering.test.ts > aborted run (AC-8) — suppression half > writes no duration for a cancelled task 12ms

    Test Files  1 passed (1)
         Tests  6 passed (6)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E9
  run_id: task-metering-r15-E9-20260727105026
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_metering_runner
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/task/metering.test.ts > cost and gpu stay unmeasured (AC-9) — suppression half > never writes cost_usd or gpu_type on any exit 1ms

    Test Files  1 passed (1)
         Tests  6 passed (6)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E10
  run_id: task-metering-r15-E10-20260727105026
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit
  verified_at: 2026-07-27T10:50:26Z
  output: |
    > oneflow@0.2.1 test /Users/manhphan/dev/oneflow
    > vitest run

    Test Files  22 passed (22)
         Tests  270 passed (270)
      Duration  682ms (transform 1.41s, setup 0ms, import 2.54s, tests 586ms, environment 1ms)

    Shared standing check: the resolved command was executed ONCE this round, at 2026-07-26T14:44:24Z, and this eval is credited to it with its own run_id — see `## Iterations`.

- eval: E11
  run_id: task-metering-r15-E11-20260727105026
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-27T10:50:26Z
  output: |
    > oneflow@0.2.1 build /Users/manhphan/dev/oneflow
    > next build --turbopack

    (next build completed; route table printed in full)

    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

    (tsc --noEmit produced no diagnostics)

    Shared standing check: the resolved command was executed ONCE this round, at 2026-07-26T14:54:32Z, and this eval is credited to it with its own run_id — see `## Iterations`.

- eval: E12
  run_id: task-metering-r15-E12-20260727105026
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.lint
  verified_at: 2026-07-27T10:50:26Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .

    Checked 398 files in 97ms. No fixes applied.

    Shared standing check: the resolved command was executed ONCE this round, at 2026-07-26T14:44:17Z, and this eval is credited to it with its own run_id — see `## Iterations`.

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

Round 7 (2026-07-26T06:27–06:36Z, commit f7e0217d): **re-pin only,
carry-forward applied — the verdict and the human signature stand unchanged.**
The previous pin went stale because branch `chore/ci-actions-bump` (PR #17)
landed the `actions/checkout` 4→7 and `docker/login-action` 3→4 bumps together
with a dry-run guard for `docker-publish.yml` and seven new eval scripts under
`scripts/ci/`. The staleness rule compares the whole tree against
`verified_commit` and cannot distinguish "code this feature depends on changed"
from "unrelated code now exists beside it", which is the only reason this
feature was flagged.

**The carry-forward precondition was re-derived here, not taken on trust.**
`git diff --name-only origin/main...HEAD` filtered of `_acceptance/` lists
exactly ten files: the three workflow files `.github/workflows/ci.yml`,
`.github/workflows/desktop-release.yml` and `.github/workflows/docker-publish.yml`,
plus the seven new scripts `scripts/ci/check-action-pins.sh`,
`check-dispatch-run.sh`, `check-docker-dryrun.sh`, `check-ghcr-untouched.sh`,
`check-run-jobs.sh`, `check-workflow-drift.sh` and `gh-run-lib.sh`. Every one of
them belongs to `ci-actions-bump`. **This feature owns none of them**: nothing under `src/db/`,
`src/lib/task/` or `drizzle/` appears anywhere in that diff — `scripts/ci/`
is a sibling directory of `scripts/deps/` and `scripts/measure/`, and neither
the metering migration nor either metering test file is touched. None of the
ten files is reachable from any of this feature's twelve evals, which resolve
only to `unit_metering_schema`, `unit_metering_runner`, `unit`,
`build_typecheck` and `lint`. Its signature therefore carries.

The remedy is therefore the cheap one: re-run this feature's own evals plus the
standing checks, and re-pin. All 12 evals were re-executed on this tree and all 12 are green: the
four migration/schema assertions via `unit_metering_schema`, and the six
runner assertions — including both suppression halves, the aborted run
writing no duration and cost/gpu never being written — via
`unit_metering_runner`. The shared standing checks were each
executed **once** against this tree and their real result recorded for every
feature that binds them, with distinct `run_id`s per feature — `pnpm lint:check` (396 files, no fixes), `pnpm test`
(21 files, 197 tests), and `pnpm build && pnpm typecheck`, all green. Where
several evals share one command, the command was run once with a verbose
reporter (a reporter flag changes formatting only, not selection or outcome) and
each eval credited to its own named covering test rather than to a shared
result.

No A/B baseline was re-measured this round; every `baseline:` value above is
marked as carried forward from round 1 and explicitly NOT re-measured.
`verified_commit` moves 50da8fac → f7e0217d; `run_id`, `verified_at`
and `output` were updated and nothing else. The verdict is unchanged, and the
human signature line in frontmatter is preserved byte-for-byte as signed —
verified by diffing the file and confirming that line produced no change.


Round 8 (2026-07-26T07:37–07:38Z, commit f2928c05) is a **carry-forward re-pin**
driven by a fresh-context verifier that wrote none of this code. It is not a
fresh Gate-2 verification and does not extend approval over anything new: this
feature is merged and signed, and **no file it owns changed**.

Ownership was checked rather than assumed. `git diff --name-only origin/main...HEAD`
minus `_acceptance/` lists exactly eleven files — the three workflows under
`.github/workflows/` and the eight scripts under `scripts/ci/` — and every one of
them belongs to `ci-actions-bump`, the feature under review in this PR. Against
the previous pin `f7e0217d` the non-`_acceptance` delta is narrower still: only
the eight `scripts/ci/*.sh` files, same owner. Nothing under `src/db/**`, `src/lib/task/**`, `drizzle/**` differs, so
the signature attests to the same code the human originally judged, and the
first condition of the carry-forward rule in `AGENTS.md` holds.

The second condition — standing checks green on the new tree — was met by
executing them, not by inference. All 12 evals evals were re-run against the working
tree at commit f2928c05, each `cmd` resolved line by line against
`_acceptance/config.yaml` rather than taken from the request, and every one
exited zero.

The shared standing checks (`pnpm lint:check`, `pnpm test`,
`cd sdk && python3 -m pytest -q`, `pnpm build && pnpm typecheck`) were each
executed **ONCE** for this whole re-pin and their single real result recorded for
every feature and every eval that binds them, with a **distinct `run_id` per
eval** so no two evidence rows claim the same execution. Where several evals of
this feature share one command, the command was additionally run once with a
verbose reporter — a reporter flag changes formatting only, never selection or
outcome — and each eval is credited to its own named covering test rather than
to a shared exit status.

No A/B baseline was measured this round; every `baseline:` field above says so
explicitly rather than carrying a value forward. `verified_commit` moves
f7e0217d → f2928c05; `run_id`, `verified_at` and `output` were updated and
nothing else. The verdict is unchanged, and the human signature line in
frontmatter is preserved byte-for-byte as signed — confirmed by diffing the file
and observing that line produced no change.

Round 9 (2026-07-26T08:11–08:12Z, commit a751b5f): **carry-forward re-pin —
the verdict and the human signature stand unchanged.** The round-8 pin
f2928c05 went stale under the whole-tree staleness rule because the
`ci-actions-bump` work continued on this branch. Ownership was re-derived here
rather than assumed: `git diff --name-only f2928c05 HEAD` with `_acceptance/`
excluded lists exactly three files — `scripts/ci/check-ghcr-untouched.sh`,
`scripts/ci/check-workflow-drift.sh` and `scripts/ci/gh-run-lib.sh` — and all
three are eval scripts owned by `ci-actions-bump`. Measured against
`origin/main` the branch's non-`_acceptance` footprint is the three files under
`.github/workflows/` plus the eight under `scripts/ci/`, which is the same
feature. Nothing this feature owns appears in that diff: no migration under `drizzle/`, nothing under `src/db/`, nothing under `src/lib/task/`, and neither metering test file.

Both carry-forward conditions in AGENTS.md therefore hold: this feature's own
code is unchanged, and the standing checks are green on the new tree. All 12
evals were nonetheless re-executed on this tree and all 12 are green, so the
pin moves on measured evidence rather than on an edited SHA. `verified_commit`
moves f2928c05 → a751b5f; `run_id`, `verified_at` and `output` were updated and
nothing else. The signature field in frontmatter is preserved byte-for-byte as
signed, and no code was changed during verification.

The shared standing checks were each executed **once** against this tree — `pnpm
lint:check` at 08:11:12Z, `pnpm test` at 08:11:31Z, `cd sdk && python3 -m pytest
-q` at 08:11:19Z, `pnpm build && pnpm typecheck` finishing 08:12:13Z — and every
eval that binds one is credited to that single execution with its own distinct
`run_id`; no eval shares a `run_id` with another. Where one command covers
several evals, the covering test is named per eval and read from a second
invocation of the same selection under a verbose reporter, which changes neither
the selection nor the outcome. `pnpm tsx scripts/measure/selftest-cogs.ts` ran
once at 08:11:51Z and is credited to both `dependency-refresh-2026-07` E7 and
`measure-harness` E16.

Round 10 (2026-07-26T08:41–08:42Z, commit 73a8d93): **carry-forward re-pin —
the verdict and the human signature stand unchanged.** The round-9 pin
a751b5f went stale under the whole-tree staleness rule because `ci-actions-bump`
round-5 verification landed one more eval-script fix on this branch. Ownership
was re-derived here rather than assumed: `git diff --name-only a751b5f HEAD`
with `_acceptance/` excluded lists exactly one file,
`scripts/ci/check-workflow-drift.sh`, an eval script owned by `ci-actions-bump`.
Measured against `origin/main` the branch's whole non-`_acceptance` footprint is
the three files under `.github/workflows/` plus the eight under `scripts/ci/` —
the same feature, start to finish. Nothing this feature owns appears in that diff: no migration under `drizzle/`, nothing under `src/db/`, nothing under `src/lib/task/`, and neither metering test file.

Both carry-forward conditions in AGENTS.md therefore hold: this feature's own
code is unchanged, and the standing checks are green on the new tree. All 12
evals were nonetheless re-executed on this tree and all 12 are green, so the pin
moves on measured evidence rather than on an edited SHA. `verified_commit` moves
a751b5f → 73a8d93; `run_id`, `verified_at` and `output` were updated and nothing
else. The signature field in frontmatter is preserved byte-for-byte as signed,
and no code was changed during verification.

The shared standing checks were each executed **once** against this tree — `pnpm
build && pnpm typecheck` finishing 08:41:42Z, `pnpm lint:check` at 08:41:49Z,
`pnpm test` at 08:41:50Z, `cd sdk && python3 -m pytest -q` at 08:42:03Z — and
every eval that binds one is credited to that single execution with its own
distinct `run_id`; no eval shares a `run_id` with another, here or across the
other three re-pinned features (53 evidence blocks, 53 distinct ids). This feature's own selections ran at 08:42:19Z (`src/db/metering-schema.test.ts`, 4 tests) and 08:42:20Z (`src/lib/task/metering.test.ts`, 6 tests).

Where one command covers several evals the covering test is named per eval and
read from a second invocation of the same selection under a verbose reporter,
which changes neither the selection nor the outcome. This round those named
lines were **re-matched** against the fresh verbose output rather than copied
forward — a carried line that had not actually run again would have stopped the
re-pin; none had.

Round 11 (2026-07-26T09:11–09:12Z, commit 572cb98): **carry-forward re-pin —
the verdict and the human signature stand unchanged.** The previous pin 73a8d93
went stale under the whole-tree staleness rule when `ci-actions-bump` landed one
further eval-script fix on this branch (`scripts/ci/check-action-pins.sh`, which
now extracts a pin with `sed` so a trailing comment can no longer stand in for a
deleted step).

Ownership was re-derived here rather than assumed. `git diff --name-only
origin/main...HEAD` with `_acceptance/` excluded lists exactly eleven files: the
three under `.github/workflows/` and the eight under `scripts/ci/`. Every one of
them belongs to `ci-actions-bump`, the feature under review in this PR. Nothing
this feature owns appears in that diff — `src/db/`, `src/lib/task/` and `drizzle/` are all untouched. Measured
against the previous pin instead, the diff narrows to a single file,
`scripts/ci/check-action-pins.sh`, with the same owner.

Both carry-forward conditions in AGENTS.md therefore hold: this feature's own
code is unchanged, and the standing checks are green on the new tree. All 12 evals
were nonetheless re-executed on this tree and all are green, so the pin moves on
measured evidence rather than on an edited SHA.

The shared standing checks were each executed **once** for this round and
credited to every eval they cover, under distinct `run_id`s: E10 to `pnpm test`, E11 to `pnpm build && pnpm typecheck` and E12 to `pnpm lint:check`. One
execution per command, one `run_id` per eval — the ids differ so the run-log
stays per-eval addressable, while the `verified_at` timestamps of evals sharing
a command are deliberately identical, because they record the same execution.

`verified_commit` moves 73a8d93 → 572cb98; `run_id`, `verified_at` and `output`
were updated and nothing else. Where a named test line's millisecond duration
differed from this round's run, the excerpt was corrected to this round's actual
value rather than carried forward. The signature field in frontmatter is
preserved byte-for-byte as signed, and this round did not touch it.

Round 12 (2026-07-26T13:52–14:00Z, commit 5975bb4): **carry-forward re-pin —
no fresh Gate-2 signature.** Re-pinned because `stale_files` compares the whole
tree against `verified_commit` and the `oneflow-plugin-prefix` work landed on
this branch after round 11; the rule cannot tell "code this feature depends on
changed" from "unrelated code now exists beside it", so it flags both.

The tree changed only where `oneflow-plugin-prefix` owns it. `git diff --name-only
origin/main...HEAD`, with `_acceptance/**` removed, lists six files:
`docs/plugins.md`, `scripts/plugins/check-prefix-docs.sh`,
`scripts/plugins/check-no-config-drift.sh`, `src/lib/plugins/plugin-id.ts`,
`src/lib/plugins/plugin-id.test.ts` and `src/lib/plugins/plugins-install.server.ts`.
Every one belongs to that feature; none falls in this feature's ownership set. This feature owns `src/db/**`, `src/lib/task/**` and `drizzle/**`, and
none of those paths appears in the diff.

All twelve evals were re-run on the new tree and all twelve exited zero:
`unit_metering_schema` (E1–E3, 4 tests), `unit_metering_runner` (E4–E9, 6
tests), plus the three shared standing checks.

The three shared standing checks were each executed ONCE for the whole PR and
credited to every feature and eval that binds them, under a distinct `run_id`
per eval — `pnpm build && pnpm typecheck` at 2026-07-26T13:52:28Z,
`pnpm lint:check` at 2026-07-26T13:55:47Z (398 files, no fixes) and `pnpm test`
at 2026-07-26T13:55:54Z (22 files, 270 tests). `cd sdk && pytest` ran once at
2026-07-26T13:59:51Z (66 tests). No eval shares a `run_id` with another, here or
across the other features re-pinned in this PR.

`verified_commit` moves 572cb98 → 5975bb4; `run_id`, `verified_at` and `output`
were updated from this round's actual runs and nothing else in the report body
changed. The human signature line is byte-identical to the one committed at Gate
2 — it attests to the same code it originally did, which is what the
carry-forward rule in AGENTS.md authorises.

Round 13 (2026-07-26T14:44–14:54Z, commit 8254c0bd): **carry-forward re-pin —
not a fresh Gate-2 signature.** The feature under review in PR #18 is
`oneflow-plugin-prefix`; this feature is merged, signed, and went stale only
because `stale_files` compares the whole tree against each report's
`verified_commit`.

Both carry-forward preconditions from AGENTS.md were checked, not assumed.

1. **This feature's own code is unchanged.** `git diff --name-only 5975bb4`
   filtered of `_acceptance/` lists four files — `docs/plugins.md`,
   `scripts/plugins/check-prefix-docs.sh`, `sdk/tongflow/scan.py` and
   `sdk/tests/test_scan_prefix.py`. Widened to the whole branch,
   `git diff --name-only origin/main...HEAD` filtered of `_acceptance/` adds
   `scripts/plugins/check-no-config-drift.sh`, `src/lib/plugins/plugin-id.ts`,
   `src/lib/plugins/plugin-id.test.ts` and
   `src/lib/plugins/plugins-install.server.ts`. `docs/**` is a declared T1 skip
   glob; every other file belongs to `oneflow-plugin-prefix`. No file under `src/db/**`, `src/lib/task/**` or `drizzle/**` — the paths this feature owns — differs.
2. **The standing checks are green on the new tree.** `pnpm test` (22 files, 270 tests), `pnpm lint:check` (398 files, no fixes) and `pnpm build && pnpm typecheck` all exited zero on this tree.

All twelve of this feature's evals were re-executed at this commit and all twelve
exited zero. E1–E3 come from one verbose run of
`config:executors.test.unit_metering_schema` (4 tests) and E4–E9 from one verbose
run of `config:executors.test.unit_metering_runner` (6 tests); each eval is
credited to its own named test line, re-matched against this round's verbose
output rather than copied forward, and each carries its own `run_id`.

Each shared standing check was executed ONCE for the whole PR and credited to
every feature and eval that binds it, under a **distinct `run_id` per eval** —
`pnpm build && pnpm typecheck` at 2026-07-26T14:54:32Z, `pnpm lint:check` at
2026-07-26T14:44:17Z (398 files, no fixes) and `pnpm test` at
2026-07-26T14:44:24Z (22 files, 270 tests). `cd sdk && pytest` ran once at
2026-07-26T14:44:28Z (86 tests — 20 more than the previous round, because
`oneflow-plugin-prefix` added `sdk/tests/test_scan_prefix.py`). No eval shares a
`run_id` with another, here or across the other features re-pinned in this PR.

`verified_commit` moves 5975bb4 → 8254c0bd; `run_id`, `verified_at` and `output`
were updated from this round's actual runs and nothing else in the report body
changed. The signature bytes in frontmatter were not touched — the signature
attests to the same code it originally did, which is what the carry-forward rule
in AGENTS.md authorises.

**One feature in this PR could not be carried.** `sdk-distribution-rename` owns
`sdk/**`, and this branch changes `sdk/tongflow/scan.py` and adds
`sdk/tests/test_scan_prefix.py`. Precondition 1 fails for it as written, so its
report was left untouched and its pin was not moved.


Round 14 (2026-07-26T15:41–15:42Z, commit 66f80430): **carry-forward re-pin —
no fresh Gate-2 signature.** Re-pinned because commit `66f80430` landed on this
branch after round 13 and `stale_files` compares the whole tree against
`verified_commit`, unscoped to the feature.

Precondition checked, not assumed. `git diff --name-only 8254c0bd..HEAD` with
`_acceptance/**` removed lists **twelve** files:

```
scripts/plugins/check-prefix-docs.sh
sdk/tests/test_scan_prefix.py
src/components/workspace/nodes/base/node-plugin-id-select.tsx
src/components/workspace/plugins-dialog.tsx
src/components/workspace/settings-dialog.tsx
src/i18n/messages/en.json
src/i18n/messages/ja.json
src/i18n/messages/ko.json
src/i18n/messages/vi.json
src/i18n/messages/zh.json
src/lib/plugins/plugin-id.test.ts
src/lib/plugins/plugin-id.ts
```

Every one belongs to **`oneflow-plugin-prefix`** — the commit moved
`pluginDisplayName` into `plugin-id.ts` and taught it both vendor prefixes,
refreshed the install hint in five locales and the dialog placeholder, added
prefix-less cases to the scanner's prefix tests, and anchored an assertion in
that feature's docs guard. None of the twelve falls in this feature's ownership
set (`src/db/**`, `src/lib/task/**` and `drizzle/**`), so the carry-forward precondition in AGENTS.md holds: the
signature attests to the same code it originally did.

This feature's own evals were all re-run on this tree and all are green:
`unit_metering_schema` (1 file, 4 tests) covering E1–E3 and
`unit_metering_runner` (1 file, 6 tests) covering E4–E9, alongside the three
standing checks it binds.

The shared standing checks were each executed **once** for the whole PR and
credited to every feature and eval that binds them, under a distinct `run_id`
per eval — `pnpm build && pnpm typecheck` at 2026-07-26T15:42:13Z,
`pnpm lint:check` at 2026-07-26T15:41:23Z (398 files, no fixes), `pnpm test` at
2026-07-26T15:41:22Z (22 files, 272 tests) and `cd sdk && pytest` at
2026-07-26T15:41:17Z (89 tests). One execution per command, one `run_id` per
eval: the ids differ so the run-log stays per-eval addressable, while the
`verified_at` timestamps of evals sharing a command are deliberately identical,
because they record the same execution. No eval shares a `run_id` with another,
here or across the other features re-pinned in this PR.

`verified_commit` moves 8254c0bd → 66f80430; `verified_by` records round 14;
`run_id` and `verified_at` were updated from this round's actual runs and nothing
else in the report body changed. The human signature line in frontmatter was not
touched — it attests to the same code it originally did, which is what the
carry-forward rule in AGENTS.md authorises.

Carry-forward re-pin (2026-07-29, branch feat/stale-scope-by-paths):
`verified_commit` moved from e657d56ea07675e2f887048e01e73724f400226a to
4dcb419d5d7d4612c10339bede6219662721d7e0 with NO re-verify, under the carry-forward
rule in AGENTS.md. Both of its conditions were checked, not assumed.

(1) This feature's own code is unchanged. Filtered of `_acceptance/`, the files
differing since the old pin are: the five `scripts/acceptance/**` guard files and
`scripts/pre-merge-check.sh` — all owned by **stale-scope-by-paths**, the feature
under review on this branch, and the only non-exempt changes the gate reports; plus
t1-exempt documentation and config that reached main independently of this branch —
`STATUS.md`, `.gitignore`, `docs/**` (ADRs, roadmap, strategy, G0 runbook),
`measure/wer-corpus/README.md`, and `biome.json` + `lib/evidence-core.js` +
`lib/gap-probe.js` (acceptance-gate kit 1.24.0, merged to main as PR #26).


(2) Standing checks green on the new tree: `pnpm lint:check`, `pnpm test`
(329 passed), `pnpm build && pnpm typecheck`.

The human signature line in frontmatter was not touched — it attests to the same
code it originally did.

Carry-forward re-pin (2026-07-29, branch feat/conformance-l0):
`verified_commit` moved from 4dcb419d5d7d4612c10339bede6219662721d7e0 to
05fc9453fa561eaa60166c594974231459359db3 with NO re-verify, under the carry-forward
rule in AGENTS.md. Both of its conditions were checked, not assumed.

(1) This feature's own code is unchanged. Filtered of `_acceptance/`, the files
differing since the old pin are the 31 gated files of **conformance-l0** — the
feature under review on this branch — plus t1-exempt `STATUS.md` and
`docs/superpowers/**`. Ownership was computed rather than eyeballed: for each
merged feature, its owned set was taken from the diff of the merge commit that
landed it, then intersected with this branch's gated diff. This feature's
intersection is empty. Across the whole repo exactly one intersection is not
empty — `sdk/tongflow/scan.py`, owned by **oneflow-plugin-prefix** — so that
feature is deliberately NOT re-pinned here; it is on the re-verify path instead,
which is the half of the rule this note does not license.

(2) Standing checks green on the new tree: `pnpm lint:check` (413 files),
`pnpm test` (347 passed), `pnpm build && pnpm typecheck` (run sequentially, per
the config note about `.next/types`), and `cd sdk && pytest` (117 passed).

The human signature line in frontmatter was not touched — it attests to the same
code it originally did.

Carry-forward re-pin (2026-07-30, branch feat/cache-l1-fingerprint):
`verified_commit` moved from 05fc9453fa561eaa60166c594974231459359db3 to
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

Carry-forward re-pin (2026-07-30, branch feat/cache-l2-store):
`verified_commit` moved from aba508a0edc61656b21d46bec6361cf4c6a0f927 to
e8fe1f26da983983f6ce5c5acf0d56217dfd1ae2 with NO re-verify, under the carry-forward rule in AGENTS.md.

(1) This feature's own code is unchanged. The branch's gated diff is ten files:
four owned by cache-l1-fingerprint (fingerprint.py + its tests + vectors), two
owned by conformance-l0 (runner.py, engine-delegate.server.ts), and four NEW
files owned by cache-l2-store (node_cache.py, test_node_cache.py, __main__.py's
tenant hunk, engine-delegate.test.ts). Ownership computed per file: this
feature's owned set (the gated diff of its landing merge commit) intersects the
branch's gated diff EMPTY. The two features whose intersections are non-empty
are deliberately NOT re-pinned here — they go to re-verify with fresh Gate 2
signatures instead.

(2) Standing checks green on the new tree, measured by this branch's own S4
round 1 rather than re-run by hand: all six suite commands (build+typecheck,
lint, unit 349, sdk pytest 159, verify:plugins, ABI drift) exited 0 alongside
18/18 feature evals.

The human signature line in frontmatter was not touched.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract


---

Re-verify on branch feat/cache-l3-tier-b (2026-07-30). This feature's owned code changed on this branch, so the prior evidence and signature do not carry forward. `verified_commit` re-pinned to 77fb83f9cc25c9d65e0021563203aafd899928e0. A FRESH human signature is required at cache-l3-tier-b's Gate 2 — the old signature attests to the old tree only.
Evidence (real rerun on this tree): its own eval commands rerun locally on this tree, 2026-07-30 — `pnpm vitest run src/db/metering-schema.test.ts` (4 passed, exit 0) and `pnpm vitest run src/lib/task/metering.test.ts` (6 passed, exit 0); standing checks E10/E11/E12 covered by cache-l3-tier-b S4 round 1 suite (full vitest 350 passed, build+typecheck, lint — run-log `_acceptance/cache-l3-tier-b/run-log.jsonl`). The touched file is `src/lib/task/runner.ts`: L3 added the `task.workflowId` argument to the engine delegate call inside dispatchTask; the metering measurement window and update payloads are unchanged, and E4-E9's suite proves it.


---

Re-verify on branch feat/cache-l4-eviction (2026-07-31). This feature's owned code changed on this branch (drizzle/meta/_journal.json · src/db/metering-schema.test.ts · src/db/workspace.schema.ts), so the prior evidence and signature do not carry forward. `verified_commit` re-pinned to c000b4b6b32f29eea6217f8de26596a052737128. A FRESH human signature is required at cache-l4-eviction's Gate 2 — the old signature attests to the old tree only.
Evidence (real rerun on this tree): its own eval commands rerun locally on this tree, 2026-07-31 — `pnpm vitest run src/db/metering-schema.test.ts` (7 passed, exit 0) and `pnpm vitest run src/lib/task/metering.test.ts` (exit 0). L4's touches: two additive nullable cache-counter columns after the metering trio in workspace.schema.ts, additive migration 0004-era journal entry (0003), and additive 'cache counters' describes in metering-schema.test.ts; the metering columns, measurement window and NULL semantics are unchanged and re-proven by the reran suite.
Standing checks green on the new tree (S4 round 1 of cache-l4-eviction, run-log `_acceptance/cache-l4-eviction/run-log.jsonl`): `pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test` (363 passed), full sdk pytest (189 passed), `pnpm verify:plugins`, `pnpm gen:abi` diff-clean.
