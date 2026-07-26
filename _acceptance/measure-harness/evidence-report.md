---
schema_version: 2
feature_slug: measure-harness
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4eb5797a4683a0282caef15419e38f820f3af31f
human_signoff:
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
  run_id: measure-harness-e1-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/wer.test.ts > WER arithmetic (AC-1) > scores an identical transcript as zero
    ✓ src/lib/measure/wer.test.ts > WER arithmetic (AC-1) > scores an empty hypothesis as one
    ✓ src/lib/measure/wer.test.ts > WER arithmetic (AC-1) > counts substitutions, deletions and insertions separately
    ✓ src/lib/measure/wer.test.ts > WER arithmetic (AC-1) > refuses an empty reference rather than dividing by zero
    Test Files  3 passed (3)
         Tests  33 passed (33)

- eval: E2
  run_id: measure-harness-e2-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/wer.test.ts > diacritics are preserved (AC-2) — suppression half > treats a missing tone mark as an error
    ✓ src/lib/measure/wer.test.ts > diacritics are preserved (AC-2) — suppression half > does not fold distinct Vietnamese words together
    Test Files  3 passed (3)
         Tests  33 passed (33)
    Body inspected: scoreTranscript("không phải", "khong phai") asserts 2 substitutions
    and wer 1; má/mà and bán/bàn each score above zero. A diacritic-stripping
    normaliser would score all of these as a perfect match.

- eval: E3
  run_id: measure-harness-e3-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/wer.test.ts > Unicode composition (AC-3) > scores precomposed and decomposed text as equal
    Test Files  3 passed (3)
         Tests  33 passed (33)
    Body inspected: asserts the NFD form differs from the NFC form as a string,
    then that scoring the pair yields wer 0 and identical tokenisation.

- eval: E4
  run_id: measure-harness-e4-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/wer.test.ts > case and punctuation are not word errors (AC-4) > ignores letter case
    ✓ src/lib/measure/wer.test.ts > case and punctuation are not word errors (AC-4) > ignores surrounding punctuation
    ✓ src/lib/measure/wer.test.ts > case and punctuation are not word errors (AC-4) > still keeps letters that punctuation stripping could eat
    Test Files  3 passed (3)
         Tests  33 passed (33)

- eval: E5
  run_id: measure-harness-e5-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/wer.test.ts > numbers are reported, never converted (AC-5) — suppression half > counts a digits-versus-words price as an error
    ✓ src/lib/measure/wer.test.ts > numbers are reported, never converted (AC-5) — suppression half > breaks digit-bearing edits out so a human can judge them
    ✓ src/lib/measure/wer.test.ts > numbers are reported, never converted (AC-5) — suppression half > reports zero digit errors when no digits are involved
    Test Files  3 passed (3)
         Tests  33 passed (33)
    Body inspected: ref "giá 120000 đồng" vs hyp "giá một trăm hai mươi nghìn đồng"
    is asserted to produce edits (no silent conversion) and digitTokenErrors 1 in
    both directions; a digit-free mismatch reports digitTokenErrors 0.

- eval: E6
  run_id: measure-harness-e6-20260726004322
  exit_code: 0
  baseline: red
  verifier: config:executors.script.smoke_measure_wer
  verified_at: 2026-07-26T00:43:22Z
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

- eval: E7
  run_id: measure-harness-e7-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/wer.test.ts > corpus scoring (AC-6) > aggregates over total words, not the mean of per-clip rates
    ✓ src/lib/measure/wer.test.ts > corpus scoring (AC-6) > reports a missing hypothesis instead of averaging over fewer clips
    Test Files  3 passed (3)
         Tests  33 passed (33)
    Body inspected: a clip with hyp null lands in report.missing, and perClip
    shrinks to 1, so the caller can see the corpus was incomplete.

- eval: E8
  run_id: measure-harness-e8-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/mos.test.ts > the sheet is blind by construction (AC-7) — suppression half > leaks no system name anywhere in the sheet
    ✓ src/lib/measure/mos.test.ts > the sheet is blind by construction (AC-7) — suppression half > shuffles, so position does not encode the system either
    ✓ src/lib/measure/mos.test.ts > the sheet is blind by construction (AC-7) — suppression half > gives every entry an opaque id
    Test Files  3 passed (3)
         Tests  33 passed (33)
    Body inspected: the serialized sheet is asserted not to contain any system
    name, and blindFile must match /^S\d{3}\.mp3$/ so the path cannot leak it.

- eval: E9
  run_id: measure-harness-e9-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/mos.test.ts > the key is a separate artefact (AC-8) > keeps the answer out of the sheet the rater receives
    Test Files  3 passed (3)
         Tests  33 passed (33)
    makeBlindSheet returns { entries, key } as distinct objects; the CLI writes
    the key to a sibling "<out>-key.json" rather than into the sheet directory.

- eval: E10
  run_id: measure-harness-e10-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/mos.test.ts > aggregation reports the spread, not just the mean (AC-9) > matches hand-computed mean, sd, n and interval
    ✓ src/lib/measure/mos.test.ts > aggregation reports the spread, not just the mean (AC-9) > leaves the spread undefined rather than fake at n = 1
    ✓ src/lib/measure/mos.test.ts > aggregation reports the spread, not just the mean (AC-9) > ranks systems by mean
    Test Files  3 passed (3)
         Tests  33 passed (33)

- eval: E11
  run_id: measure-harness-e11-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/mos.test.ts > bad input fails loudly (AC-10) — suppression half > rejects a score outside the MOS range instead of dropping it
    ✓ src/lib/measure/mos.test.ts > bad input fails loudly (AC-10) — suppression half > rejects a rating for an id the key does not know
    Test Files  3 passed (3)
         Tests  33 passed (33)

- eval: E12
  run_id: measure-harness-e12-20260726004333
  exit_code: 0
  baseline: red
  verifier: config:executors.script.smoke_measure_mos
  verified_at: 2026-07-26T00:43:33Z
  output: |
    system                    n     MOS     sd      95% CI
    -----------------------------------------------------
    elevenlabs                3   5.00   0.00     ±0.00
    vixtts                    3   3.00   0.00     ±0.00

    At this sample size the interval is wide by construction — read n before the mean.

    selftest-mos: ok

    The selftest builds a throwaway two-system sample tree, runs `mos.ts blind`,
    asserts sheet.csv contains no system name and has one row per sample, reads
    the separate "<out>-key.json", fills ratings from it, then runs
    `mos.ts aggregate`. Both CLI subcommands are genuinely exercised.

- eval: E13
  run_id: measure-harness-e13-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/cogs.test.ts > grouping and statistics (AC-11) > groups by plugin and slot
    ✓ src/lib/measure/cogs.test.ts > grouping and statistics (AC-11) > matches hand-computed median and p95
    ✓ src/lib/measure/cogs.test.ts > grouping and statistics (AC-11) > averages the middle pair for an even count
    ✓ src/lib/measure/cogs.test.ts > grouping and statistics (AC-11) > sorts the heaviest groups first
    Test Files  3 passed (3)
         Tests  33 passed (33)

- eval: E14
  run_id: measure-harness-e14-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/cogs.test.ts > unmeasured rows are counted, not averaged (AC-12) — suppression half > keeps NULL durations out of the statistics
    ✓ src/lib/measure/cogs.test.ts > unmeasured rows are counted, not averaged (AC-12) — suppression half > reports a group with nothing measured without inventing zeros
    Test Files  3 passed (3)
         Tests  33 passed (33)

- eval: E15
  run_id: measure-harness-e15-20260726004258
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T00:42:58Z
  output: |
    ✓ src/lib/measure/cogs.test.ts > cost is applied, never invented (AC-13) — suppression half > omits the cost field entirely when no rates are supplied
    ✓ src/lib/measure/cogs.test.ts > cost is applied, never invented (AC-13) — suppression half > applies exactly the supplied rate
    ✓ src/lib/measure/cogs.test.ts > cost is applied, never invented (AC-13) — suppression half > leaves plugins absent from the rate table without a cost
    Test Files  3 passed (3)
         Tests  33 passed (33)
    Body inspected: with no rates the group is asserted NOT to have a costUsd
    property at all (absent, not zero); with { p: 0.5 } over 3s it asserts 1.5.

- eval: E16
  run_id: measure-harness-e16-20260726004347
  exit_code: 0
  baseline: red
  verifier: config:executors.script.smoke_measure_cogs
  verified_at: 2026-07-26T00:43:47Z
  output: |
    Plugin time from /var/folders/.../oneflow-cogs-hHTPWP/good.db (status: completed, failed) — 5 task(s)

    plugin / slot                              n  meas  unmeas    total   median      p95
    -------------------------------------------------------------------------------------------
    modal-z-image / image-gen                   4     3       1    11.0s     4.0s     6.0s
    api-openrouter / gen-text                   1     1       0     0.5s     0.5s     0.5s

    1 task(s) have no measured duration — history from before metering, or aborted runs.
    They are counted but kept out of the statistics rather than averaged as zero.

    No --rates supplied, so no cost is reported. Pass a rate table derived from a real invoice:
      {"<pluginId>": <usdPerSecond>}

    selftest-cogs: ok

    The selftest also drives a deliberately pre-metering database and asserts the
    command refuses it with a readable message ("predates task metering"), that it
    signals failure rather than succeeding, and that no raw SQLITE_ERROR or
    "no such column" text leaks. Independently reproduced by the verifier.

- eval: E17
  run_id: measure-harness-e17-20260726004457
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit
  verified_at: 2026-07-26T00:44:57Z
  output: |
    > oneflow@0.2.1 test /Users/manhphan/dev/oneflow
    > vitest run

     RUN  v4.1.5 /Users/manhphan/dev/oneflow

     Test Files  21 passed (21)
          Tests  195 passed (195)

- eval: E18
  run_id: measure-harness-e18-20260726004524
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-26T00:45:24Z
  output: |
    └ ƒ /workspace                            379 kB         551 kB
    + First Load JS shared by all             103 kB

    ƒ  (Dynamic)  server-rendered on demand

    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E19
  run_id: measure-harness-e19-20260726004457
  exit_code: 0
  baseline: green
  verifier: config:executors.test.lint
  verified_at: 2026-07-26T00:44:57Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .

    Checked 352 files in 78ms. No fixes applied.

## Analyst

Every feature eval (E1–E16) is red on baseline and green on this branch, so on
paper all sixteen discriminate. That number should be discounted, and here is
exactly why.

HEAD~1 (c2430a3) is the Gate 1 docs commit — `src/lib/measure/` and
`scripts/measure/` do not exist there at all. The whole feature, implementation
and tests together, arrived in a single commit. I ran the A/B two ways:

1. **Literal copy** (both directories copied into the baseline worktree, as
   instructed): 33/33 green. This proves nothing — copying the implementation in
   is copying the feature in.
2. **Discriminating variant** (test files and fixtures copied, the three
   implementation modules `wer.ts` / `mos.ts` / `cogs.ts` withheld): all three
   test files fail with `ERR_MODULE_NOT_FOUND` — "Cannot find module './wer'" and
   siblings. Vitest reports "Tests  no tests": **not a single assertion executed.**

The three script evals behave the same way — at true baseline `pnpm tsx
scripts/measure/*.ts` cannot resolve the script file itself.

So the honest reading: **the red is module-resolution failure, not a measuring
stick catching a wrong measurement.** These evals demonstrably fail when the code
is absent; they have not been shown to fail when the code is present but wrong.
For a feature whose entire purpose is to be a trustworthy measuring stick, that
is the weaker of the two things one would want to know, and no baseline against
a commit that predates the files can supply the stronger one.

What partially compensates, and what I checked by reading the test bodies rather
than trusting the `describe` names: the suppression halves are written as real
inversions, not restatements. AC-2 asserts `không phải` vs `khong phai` scores 2
substitutions and WER 1 — a diacritic-stripping normaliser would score 0 and fail
this test loudly. AC-13 asserts the `costUsd` property is *absent*, not zero, so a
regression that defaulted the rate to 0 would be caught. AC-7 asserts the
serialized sheet contains no system name and that `blindFile` matches
`/^S\d{3}\.mp3$/`, closing the path-leak hole. AC-12 keeps NULL durations out of
the statistics while still counting them. These are the tests that would go red on
a bad change, and they are the ones the contract's risk actually sits on.

E17/E18/E19 are suite-wide guards and are excluded from the discrimination
question per the round instructions. E18's baseline is recorded `n-a`: a
`pnpm build` in the baseline worktree would need its own `.next` and take several
minutes, past the time budget for this step.

Two further notes for the record. First, the round brief says fourteen evals share
`unit_measure`; `evals.yaml` actually binds thirteen (E1–E5, E7–E11, E13–E15) —
E17 resolves to `executors.test.unit` (`pnpm test`), a different key. I verified
all thirteen individually against the verbose test listing and confirmed each
criterion has a named `describe` block that ran and passed; no eval is marked PASS
merely because the shared command exited 0. Second, one soft spot worth naming:
E5's first assertion checks only that the digits-vs-words price produces *some*
error rather than an exact count. The exact-count guarantee is carried by the
sibling test pinning `digitTokenErrors` to 1 in both directions, so the criterion
is covered — but the first test alone would tolerate a miscount.

## Variance

none — no eval declares runs > 1

## Iterations

Round 1: all evals green.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Confirm the WER normalisation rules match intent (diacritics kept, numbers not converted)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
