---
schema_version: 2
feature_slug: measure-harness
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (round 14)
enforcement_mode: strict
bypass_used: false
verified_commit: aba508a0edc61656b21d46bec6361cf4c6a0f927
human_signoff: Manh 2026-07-26
---

# Evidence Report: measure-harness

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-15 | script | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-13 | test | PASS |
| E16 | AC-14 | script | PASS |
| E17 | AC-16 | test | PASS |
| E18 | AC-16 | test | PASS |
| E19 | AC-16 | test | PASS |

## Evidence

- eval: E1
  run_id: measure-harness-r15-E1-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/wer.test.ts > WER arithmetic (AC-1) > scores an identical transcript as zero 1ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E2
  run_id: measure-harness-r15-E2-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/wer.test.ts > diacritics are preserved (AC-2) — suppression half > treats a missing tone mark as an error 0ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E3
  run_id: measure-harness-r15-E3-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/wer.test.ts > Unicode composition (AC-3) > scores precomposed and decomposed text as equal 0ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E4
  run_id: measure-harness-r15-E4-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/wer.test.ts > case and punctuation are not word errors (AC-4) > ignores letter case 0ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E5
  run_id: measure-harness-r15-E5-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/wer.test.ts > numbers are reported, never converted (AC-5) — suppression half > counts a digits-versus-words price as an error 0ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E6
  run_id: measure-harness-r15-E6-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.script.smoke_measure_wer
  verified_at: 2026-07-27T10:50:26Z
  output: |
    WER over 2 clip(s) in src/lib/measure/__fixtures__/wer

    clip                      WER      sub  del  ins  digit
    ------------------------------------------------------
    clip-01                    38.5%    1    0    4      1
    clip-02                     7.7%    1    0    0      0
    ------------------------------------------------------
    CORPUS                     23.1%    2    0    4      1

    26 reference words. "digit" counts edits where either side's token contains a digit —
    numbers are never converted automatically, so a price read aloud shows up here for a human to judge.

    Re-run this round on commit 8254c0bd; the table above is this round's actual output.

- eval: E7
  run_id: measure-harness-r15-E7-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/wer.test.ts > corpus scoring (AC-6) > aggregates over total words, not the mean of per-clip rates 0ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E8
  run_id: measure-harness-r15-E8-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/mos.test.ts > the sheet is blind by construction (AC-7) — suppression half > leaks no system name anywhere in the sheet 1ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E9
  run_id: measure-harness-r15-E9-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/mos.test.ts > the key is a separate artefact (AC-8) > keeps the answer out of the sheet the rater receives 0ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E10
  run_id: measure-harness-r15-E10-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/mos.test.ts > aggregation reports the spread, not just the mean (AC-9) > matches hand-computed mean, sd, n and interval 0ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E11
  run_id: measure-harness-r15-E11-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/mos.test.ts > bad input fails loudly (AC-10) — suppression half > rejects a score outside the MOS range instead of dropping it 0ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E12
  run_id: measure-harness-r15-E12-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.script.smoke_measure_mos
  verified_at: 2026-07-27T10:50:26Z
  output: |
    system                    n     MOS     sd      95% CI
    -----------------------------------------------------
    elevenlabs                3   5.00   0.00     ±0.00
    vixtts                    3   3.00   0.00     ±0.00

    At this sample size the interval is wide by construction — read n before the mean.

    selftest-mos: ok

    Re-run this round on commit 8254c0bd; the table above is this round's actual output.

- eval: E13
  run_id: measure-harness-r15-E13-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/cogs.test.ts > grouping and statistics (AC-11) > groups by plugin and slot 1ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E14
  run_id: measure-harness-r15-E14-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/cogs.test.ts > unmeasured rows are counted, not averaged (AC-12) — suppression half > keeps NULL durations out of the statistics 0ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E15
  run_id: measure-harness-r15-E15-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/measure/cogs.test.ts > cost is applied, never invented (AC-13) — suppression half > omits the cost field entirely when no rates are supplied 0ms

    Test Files  3 passed (3)
         Tests  33 passed (33)

    Re-run this round on commit 8254c0bd; the named test(s) above and the suite totals are this round's actual output. Each named line was re-matched against this round's verbose run rather than copied forward. The test-body analysis recorded in earlier rounds is carried forward, not re-derived here — this round re-ran the evals to move the pin, see `## Iterations`. The exit status came from the resolved command verbatim; the per-test line was read from a second invocation of the same selection with a verbose reporter (a reporter flag changes neither selection nor outcome).

- eval: E16
  run_id: measure-harness-r15-E16-20260727105026
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.script.smoke_measure_cogs
  verified_at: 2026-07-27T10:50:26Z
  output: |
    Plugin time from /var/folders/6x/1dlzszm51wzbt20dn5y1lgzh0000gn/T/oneflow-cogs-AekjfC/good.db (status: completed, failed) — 5 task(s)

    plugin / slot                              n  meas  unmeas    total   median      p95
    -------------------------------------------------------------------------------------------
    modal-z-image / image-gen                   4     3       1    11.0s     4.0s     6.0s
    api-openrouter / gen-text                   1     1       0     0.5s     0.5s     0.5s

    1 task(s) have no measured duration — history from before metering, or aborted runs.
    They are counted but kept out of the statistics rather than averaged as zero.

    No --rates supplied, so no cost is reported. Pass a rate table derived from a real invoice:
      {"<pluginId>": <usdPerSecond>}

    selftest-cogs: ok

    Re-run this round on commit 8254c0bd; the table above is this round's actual output. One execution, credited to measure-harness E16 and dependency-refresh-2026-07 E7 under separate run_ids.

- eval: E17
  run_id: measure-harness-r15-E17-20260727105026
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

- eval: E18
  run_id: measure-harness-r15-E18-20260727105026
  exit_code: 0
  baseline: n-a
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

- eval: E19
  run_id: measure-harness-r15-E19-20260727105026
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

**The A/B baseline was deliberately skipped this round.** Round 1 already
established discrimination by mutation testing, and re-deriving it adds nothing.
Per-eval `baseline:` values are therefore marked `carried-forward` — they record
round 1's measurement, not a round-4 one, and must be read as history rather than
as a fresh measurement.

Round 1's honest finding is carried forward unchanged, because it is still the
right caveat for a human reading this: **the feature's tests and code landed
together in a single commit**, so a pre-file baseline only proves the evals fail
when the code is *absent* — all three test files fail with
`ERR_MODULE_NOT_FOUND` and vitest reports "Tests no tests", i.e. not one
assertion executes. That is module resolution failing, not a measuring stick
catching a wrong measurement. **The mutation results from round 1 are the real
discrimination evidence**; the pre-file A/B is not, and re-running it would only
reproduce the weaker signal.

What I did do instead, from fresh context: I re-read all three test files
(`wer.test.ts`, `mos.test.ts`, `cogs.test.ts`) rather than trusting the
`describe` names or the earlier rounds' notes, and independently re-read
`scripts/measure/selftest-cogs.ts` and `scripts/measure/mos.ts`. Every claim the
earlier rounds made about the test bodies held up again on this tree — including
the two source-level claims that are not visible from a test name: `mos.ts`
writes the key to a sibling `${outDir}-key.json` (line 72) rather than into the
sheet, and `selftest-cogs.ts` asserts the un-rated report contains no `$` at all
(line 73) before re-running with a rate file and requiring one. The suppression halves are real inversions, not restatements:
AC-2 pins `không phải` vs `khong phai` at 2 substitutions and WER 1, so a
diacritic-stripping normaliser fails loudly; AC-13 asserts `costUsd` is *absent*
rather than zero, so a regression defaulting the rate to 0 is caught; AC-7
asserts the serialized sheet contains no system name *and* that `blindFile`
matches `/^S\d{3}\.mp3$/`, closing the path-leak hole; AC-12 keeps NULL durations
out of the statistics while still counting them, with the median pinned to 300
where a zero-fill would give 200. AC-10 rejects three distinct bad shapes (6, 0,
NaN) plus an unknown id, not just the obvious one.

I ran `pnpm vitest run src/lib/measure` once this round, with
`--reporter=verbose` (a reporter flag changes formatting only, not selection or
outcome), so the recorded exit status and the per-test listing come from the same
invocation and each eval's own covering test is visibly green. All 33 tests are
individually listed and green, and the per-AC counts reconcile exactly to 33
(AC-1:4, AC-2:2, AC-3:1, AC-4:3, AC-5:3, AC-6:2, AC-7:3, AC-8:1, AC-9:3,
AC-10:2, AC-11:4, AC-12:2, AC-13:3). **No eval is marked PASS on the shared exit
code alone.** Note that thirteen evals bind `unit_measure` (E1–E5, E7–E11,
E13–E15), not fourteen — E17 resolves to `executors.test.unit`, a different key.

E17/E18/E19 are suite-wide standing guards. They are shared with the
`task-metering` and `sdk-distribution-rename` features verified in the same
session; **each command was executed exactly once against this tree and its real
result recorded for every feature that binds it, with distinct `run_id`s per
feature.** E18's baseline stays `n-a` — a `pnpm build` in a baseline worktree
needs its own `.next` and costs several minutes for no added signal. All three
ran from the repo root at commit 4b1d0d3 with a clean working tree; `git status
--porcelain` was empty both before the runs and after `pnpm build` (whose
`prebuild` regenerates the ABI types), so the build also confirms the generated
ABI is committed in sync. The suite is unchanged from round 3 at 197 tests across
21 files and biome still checks 353 files — no drift, and all three commands are
green.

Two soft spots worth naming, neither changing a verdict. First, carried forward
from round 1: E5's first assertion checks only that the digits-vs-words price
produces *some* error (`toBeGreaterThan(0)`) rather than an exact count; the
exact-count guarantee is carried by the sibling test pinning `digitTokenErrors`
to 1 in both directions, so AC-5 is covered, but that first test alone would
tolerate a miscount (`wer.test.ts` line 83). Second, first observed in round 2
and re-confirmed again this round: AC-7's shuffle assertion uses a fixed `rng() => 0` and
checks only that `key.S001.system` is not the first input system
(`mos.test.ts` lines 17 and 35). That proves the order provably changes and keeps the test
deterministic, but it does not constrain shuffle quality — a barely-permuting
shuffle would still pass. For a 5-script blind rating handed to one human rater
that is an acceptable bar; it is not a randomness test.

## Variance

none — no eval declares runs > 1

## Iterations

Round 1 (2026-07-26T00:42–00:45Z, commit 4eb5797): all 19 evals green. Verdict
PASS. Discrimination established by mutation testing; the pre-file A/B was
recorded as weak evidence for the reasons above.

Round 2 (2026-07-26T01:14–01:15Z, commit 8d1e57a): **re-run because the branch
was rebased onto `main` and the rebase replaced commit 4eb5797.** Round 1's
`verified_commit` pin therefore pointed at a commit that no longer exists on this
branch, which makes the evidence unverifiable rather than merely stale — the pin
had to be re-derived by actually re-running, not by editing the SHA. All 19 evals
re-run against the current tree; all green. The A/B baseline was skipped by
instruction (see `## Analyst`). No code changes were made in this round.

Round 3 (2026-07-26T03:37–03:38Z, commit f9f0b18): **re-pin only, forced by the
rebase and by the coarse staleness rule — not by any code defect.** The branch
was rebased onto `main` again and the `sdk-distribution-rename` feature now sits
beside this one in the tree. `stale_files` compares the whole tree against
`verified_commit` and cannot distinguish "code this feature depends on changed"
from "unrelated code exists", so `pre-merge-check.sh` reported all three features
stale in one go. **No measure-harness code changed**, re-derived here rather than
assumed: `git diff --name-only 8d1e57a HEAD` with `_acceptance/` excluded lists
eleven files, every one of them belonging to `sdk-distribution-rename`
(`.env.example`, `CLAUDE.md`, `docs/plugins.md`, `package.json`,
`scripts/publish-tongflow-pypi.sh`, `sdk/README.md`, `sdk/pyproject.toml`,
`sdk/tests/test_engine.py`, `sdk/tests/test_packaging.py`,
`sdk/tongflow/__init__.py`, `sdk/tongflow/engine/plugins.py`). Nothing under
`src/lib/measure/` or `scripts/measure/` appears in that diff. The remedy is a
re-run plus a re-pin — the SHA was never hand-edited. All 19 evals were
re-executed on this tree and all 19 are green, so the rebase introduced no
regression. `verified_commit` moves 8d1e57a → f9f0b18; `run_id`, `verified_at`
and `output` were updated and nothing else. The verdict is unchanged and the
human signature line in frontmatter is preserved byte-for-byte as signed.

Round 4 (2026-07-26T03:59–04:00Z, commit 4b1d0d3): **re-pin only, and
carry-forward applied — the verdict and the human signature stand unchanged.**
The round-3 pin f9f0b18 went stale because a fix commit landed on the branch:
`sdk/tests/test_packaging.py` gained a `tomli` fallback (CI runs Python 3.10,
where `tomllib` is not stdlib) and `.github/workflows/ci.yml` installs that
backport in the SDK test job. The staleness rule compares the whole tree against
`verified_commit` and cannot distinguish "code this feature depends on changed"
from "unrelated code exists", which is the only reason this feature was flagged.

**Carry-forward was allowed here because this feature owns neither changed
file**, re-derived rather than assumed: `git diff --name-only f9f0b18` with
`_acceptance/` excluded lists exactly two files, `.github/workflows/ci.yml` and
`sdk/tests/test_packaging.py`. Nothing under `src/lib/measure/` or
`scripts/measure/`, and none of the WER `.txt` fixtures, appears in that diff;
neither changed file is reachable from any of this feature's nineteen evals,
which resolve only to `unit_measure`, the three `smoke_measure_*` scripts,
`unit`, `build_typecheck` and `lint`. `sdk/tests/test_packaging.py` belongs to
`sdk-distribution-rename`, whose signature correspondingly did **not** carry.

The remedy is therefore the cheap one: re-run this feature's own evals (seconds
apiece) plus the standing checks, and re-pin. All 19 evals were re-executed on
this tree and all 19 are green. The test-body re-inspections quoted in the
evidence blocks were genuinely redone this round against the current files —
including the two source-level claims, `mos.ts` line 72 writing the key to a
sibling `${outDir}-key.json` and `selftest-cogs.ts` line 73 asserting the
un-rated report contains no `$` — and every claim held. `verified_commit` moves
f9f0b18 → 4b1d0d3; `run_id`, `verified_at` and `output` were updated and nothing
else. The verdict is unchanged and the human signature line in frontmatter is
preserved byte-for-byte as signed.

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
deletions, symmetric, with no functional line. Nothing under `src/lib/measure/` or `scripts/measure/` — the paths this feature owns — appears anywhere in that diff, and neither do any of the WER `.txt` fixtures, so its signature carries.

The remedy is therefore the cheap one: re-run this feature's own evals plus the
standing checks, and re-pin. All 19 evals were re-executed on this tree and all 19 are green: 33 tests via `unit_measure`, plus the three CLI smokes (`wer.ts` over the committed fixtures reporting 23.1% corpus WER across 2 clips, `selftest-mos` and `selftest-cogs` both reporting ok). The shared standing checks
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
`scripts/deps/check-no-t3-drift.sh` so an unresolvable base ref terminates
unsuccessfully instead of being swallowed and reported as "no T3 drift". The
staleness rule compares the whole tree against `verified_commit` and cannot
distinguish "code this feature depends on changed" from "unrelated code now
exists beside it", which is the only reason this feature was flagged.

**The carry-forward precondition was re-derived here, not taken on trust.**
`git diff --name-only origin/main...HEAD` with `_acceptance/` excluded lists 20
files: the two workflow files, `biome.json`, `package.json`, `pnpm-lock.yaml`,
the two `scripts/deps/check-*.sh` guards, ten files under `src/components/ui/`,
two under `src/components/workspace/nodes/modality/`, and `src/lib/api/upload.ts`.
Every one belongs to `dependency-refresh-2026-07`. **This feature owns none of
them**: nothing under `src/lib/measure/` or `scripts/measure/` appears anywhere
in that diff — `scripts/deps/` is a sibling directory, not this feature's, and
the three CLI entry points this feature ships (`wer.ts`, `selftest-mos.ts`,
`selftest-cogs.ts`) are all unchanged. Its signature therefore carries.

The remedy is the cheap one: re-run this feature's own evals plus the standing
checks, and re-pin. All 19 evals were re-executed on this tree and all 19 are
green — 33 unit assertions across `wer.test.ts`, `mos.test.ts` and
`cogs.test.ts` via `unit_measure`, plus the three end-to-end CLI smokes over the
committed fixtures (corpus WER 23.1% over 2 clips; the blind MOS aggregate; the
COGS report driving a real sqlite file through the drizzle migrator). The shared
standing checks were each executed **once** against this tree and their real
result recorded for every feature that binds them, with distinct `run_id`s per
feature — `pnpm lint:check` (396 files, no fixes), `pnpm test` (21 files, 197
tests), and `pnpm build && pnpm typecheck`, all green. Where several evals share
one command, the command was run once with a verbose reporter and each eval
credited to its own named covering test rather than to a shared result.

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
them belongs to `ci-actions-bump`. **This feature owns none of them**: nothing under
`src/lib/measure/` or `scripts/measure/` appears anywhere in that diff —
`scripts/ci/` is a different directory — and none of the WER `.txt` fixtures
or the three CLI entry points (`wer.ts`, `selftest-mos.ts`,
`selftest-cogs.ts`) is touched. Its signature therefore carries.

The remedy is therefore the cheap one: re-run this feature's own evals plus the
standing checks, and re-pin. All 19 evals were re-executed on this tree and all 19 are green — 33 unit
assertions across `wer.test.ts`, `mos.test.ts` and `cogs.test.ts` via
`unit_measure`, plus the three end-to-end CLI smokes over the committed
fixtures (corpus WER 23.1% over 2 clips; the blind MOS aggregate; the COGS
report driving a real sqlite file through the drizzle migrator). The shared standing checks were each
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
the eight `scripts/ci/*.sh` files, same owner. Nothing under `src/lib/measure/**`, `scripts/measure/**` differs, so
the signature attests to the same code the human originally judged, and the
first condition of the carry-forward rule in `AGENTS.md` holds.

The second condition — standing checks green on the new tree — was met by
executing them, not by inference. All 19 evals evals were re-run against the working
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
feature. Nothing this feature owns appears in that diff: nothing under `src/lib/measure/` and nothing under `scripts/measure/` — `scripts/ci/` is a different directory from `scripts/measure/`.

Both carry-forward conditions in AGENTS.md therefore hold: this feature's own
code is unchanged, and the standing checks are green on the new tree. All 19
evals were nonetheless re-executed on this tree and all 19 are green, so the
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
the same feature, start to finish. Nothing this feature owns appears in that diff: nothing under `src/lib/measure/` and nothing under `scripts/measure/`.

Both carry-forward conditions in AGENTS.md therefore hold: this feature's own
code is unchanged, and the standing checks are green on the new tree. All 19
evals were nonetheless re-executed on this tree and all 19 are green, so the pin
moves on measured evidence rather than on an edited SHA. `verified_commit` moves
a751b5f → 73a8d93; `run_id`, `verified_at` and `output` were updated and nothing
else. The signature field in frontmatter is preserved byte-for-byte as signed,
and no code was changed during verification.

The shared standing checks were each executed **once** against this tree — `pnpm
build && pnpm typecheck` finishing 08:41:42Z, `pnpm lint:check` at 08:41:49Z,
`pnpm test` at 08:41:50Z, `cd sdk && python3 -m pytest -q` at 08:42:03Z — and
every eval that binds one is credited to that single execution with its own
distinct `run_id`; no eval shares a `run_id` with another, here or across the
other three re-pinned features (53 evidence blocks, 53 distinct ids). This feature's own evals ran at 08:42:21Z (`pnpm vitest run src/lib/measure`, 33 tests across 3 files), 08:42:29Z (WER CLI over the committed fixtures), 08:42:30Z (MOS selftest) and 08:42:30Z (COGS selftest, the single execution also credited to `dependency-refresh-2026-07` E7).

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
this feature owns appears in that diff — `src/lib/measure/` and `scripts/measure/` are all untouched. Measured
against the previous pin instead, the diff narrows to a single file,
`scripts/ci/check-action-pins.sh`, with the same owner.

Both carry-forward conditions in AGENTS.md therefore hold: this feature's own
code is unchanged, and the standing checks are green on the new tree. All 19 evals
were nonetheless re-executed on this tree and all are green, so the pin moves on
measured evidence rather than on an edited SHA.

The shared standing checks were each executed **once** for this round and
credited to every eval they cover, under distinct `run_id`s: E17 to `pnpm test`, E18 to `pnpm build && pnpm typecheck` and E19 to `pnpm lint:check`. One
execution per command, one `run_id` per eval — the ids differ so the run-log
stays per-eval addressable, while the `verified_at` timestamps of evals sharing
a command are deliberately identical, because they record the same execution.

`verified_commit` moves 73a8d93 → 572cb98; `run_id`, `verified_at` and `output`
were updated and nothing else. Where a named test line's millisecond duration
differed from this round's run, the excerpt was corrected to this round's actual
value rather than carried forward. The signature field in frontmatter is
preserved byte-for-byte as signed, and this round did not touch it.

Round 12 (2026-07-26T13:52–14:00Z, commit 5975bb4): **carry-forward re-pin —
no fresh Gate-2 signature.** Re-pinned because the `oneflow-plugin-prefix` work
landed on this branch after round 11 and `stale_files` compares the whole tree
against `verified_commit`.

The tree changed only where `oneflow-plugin-prefix` owns it. `git diff --name-only
origin/main...HEAD`, with `_acceptance/**` removed, lists six files:
`docs/plugins.md`, `scripts/plugins/check-prefix-docs.sh`,
`scripts/plugins/check-no-config-drift.sh`, `src/lib/plugins/plugin-id.ts`,
`src/lib/plugins/plugin-id.test.ts` and `src/lib/plugins/plugins-install.server.ts`.
Every one belongs to that feature; none falls in this feature's ownership set. This feature owns `src/lib/measure/**` and `scripts/measure/**`, and
neither path appears in the diff.

All nineteen evals were re-run on the new tree and all nineteen exited zero:
`unit_measure` (3 files, 33 tests) covering E1–E5, E7–E11 and E13–E15; the three
CLI smokes `smoke_measure_wer`, `smoke_measure_mos` and `smoke_measure_cogs`;
and the three shared standing checks. `smoke_measure_cogs` was executed once and
credited to both this feature's E16 and dependency-refresh-2026-07's E7, under
separate `run_id`s.

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
   glob; every other file belongs to `oneflow-plugin-prefix`. No file under `src/lib/measure/**` or `scripts/measure/**` — the paths this feature owns — differs.
2. **The standing checks are green on the new tree.** `pnpm test` (22 files, 270 tests), `pnpm lint:check` (398 files, no fixes) and `pnpm build && pnpm typecheck` all exited zero on this tree.

All nineteen of this feature's evals were re-executed at this commit and all
nineteen exited zero. The fourteen unit evals come from one run of
`config:executors.test.unit_measure` (3 files, 33 tests), each credited to its
own named test line re-matched against this round's verbose output; the three
end-to-end CLI smokes (`smoke_measure_wer`, `smoke_measure_mos`,
`smoke_measure_cogs`) were each run separately over the fixtures committed with
the feature.

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
set (`src/lib/measure/**` and `scripts/measure/**`), so the carry-forward precondition in AGENTS.md holds: the
signature attests to the same code it originally did.

This feature's own evals were all re-run on this tree and all are green:
`unit_measure` (3 files, 33 tests) covering thirteen evals, and the three
end-to-end CLI smokes `smoke_measure_wer`, `smoke_measure_mos` and
`smoke_measure_cogs`, alongside the three standing checks it binds.

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


Judgment call recorded explicitly: `measure/wer-corpus/README.md` sits under
`measure/` and so could look like this feature's own. It was authored by the G0
documentation work (9c9660b, 4b9702b) on main, neither this feature's contract nor
any of its evals reference it, and it is `**/*.md` (t1-exempt). It is not code this
feature's evidence attests to, so the signature still carries. Flagged here rather
than omitted, because it is the one file in this batch where ownership was arguable.

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

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Confirm the WER normalisation rules match intent (diacritics kept, numbers not converted)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
