---
schema_version: 2
feature_slug: measure-harness
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8d1e57a41c3ea919dcbe544c8b21017238199d81
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
  run_id: measure-harness-r2-e1-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/wer.test.ts > WER arithmetic (AC-1) > scores an identical transcript as zero 1ms
    ✓ src/lib/measure/wer.test.ts > WER arithmetic (AC-1) > scores an empty hypothesis as one 0ms
    ✓ src/lib/measure/wer.test.ts > WER arithmetic (AC-1) > counts substitutions, deletions and insertions separately 0ms
    ✓ src/lib/measure/wer.test.ts > WER arithmetic (AC-1) > refuses an empty reference rather than dividing by zero 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: the identical pair asserts wer 0 with S+D+I 0;
    the empty hypothesis asserts 3 deletions and wer 1; the third test pins one
    substitution, one deletion and one insertion independently and then asserts
    (S+D+I)/N = 0.25 on a 4-word reference.

- eval: E2
  run_id: measure-harness-r2-e2-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/wer.test.ts > diacritics are preserved (AC-2) — suppression half > treats a missing tone mark as an error 0ms
    ✓ src/lib/measure/wer.test.ts > diacritics are preserved (AC-2) — suppression half > does not fold distinct Vietnamese words together 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: scoreTranscript("không phải", "khong phai")
    asserts 2 substitutions and wer 1; má/mà and bán/bàn each assert wer above
    zero. A diacritic-stripping normaliser would score all of these a perfect
    match and fail this block loudly.

- eval: E3
  run_id: measure-harness-r2-e3-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/wer.test.ts > Unicode composition (AC-3) > scores precomposed and decomposed text as equal 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: asserts the NFD form is NOT the same string as
    the NFC form, then that scoring the pair yields wer 0 and that tokenize()
    returns equal token arrays for both.

- eval: E4
  run_id: measure-harness-r2-e4-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/wer.test.ts > case and punctuation are not word errors (AC-4) > ignores letter case 0ms
    ✓ src/lib/measure/wer.test.ts > case and punctuation are not word errors (AC-4) > ignores surrounding punctuation 0ms
    ✓ src/lib/measure/wer.test.ts > case and punctuation are not word errors (AC-4) > still keeps letters that punctuation stripping could eat 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)

- eval: E5
  run_id: measure-harness-r2-e5-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/wer.test.ts > numbers are reported, never converted (AC-5) — suppression half > counts a digits-versus-words price as an error 0ms
    ✓ src/lib/measure/wer.test.ts > numbers are reported, never converted (AC-5) — suppression half > breaks digit-bearing edits out so a human can judge them 0ms
    ✓ src/lib/measure/wer.test.ts > numbers are reported, never converted (AC-5) — suppression half > reports zero digit errors when no digits are involved 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: ref "giá 120000 đồng" vs hyp "giá một trăm hai
    mươi nghìn đồng" is asserted to produce edits (so no silent conversion) and
    digitTokenErrors 1 in both scoring directions; a digit-free mismatch asserts
    digitTokenErrors 0.

- eval: E6
  run_id: measure-harness-r2-e6-20260726011439
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.script.smoke_measure_wer
  verified_at: 2026-07-26T01:14:39Z
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
  run_id: measure-harness-r2-e7-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/wer.test.ts > corpus scoring (AC-6) > aggregates over total words, not the mean of per-clip rates 0ms
    ✓ src/lib/measure/wer.test.ts > corpus scoring (AC-6) > reports a missing hypothesis instead of averaging over fewer clips 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: a clip with hyp null lands in report.missing
    (asserted equal to ["b"]) and perClip shrinks to 1, so the caller can see the
    corpus was incomplete. The aggregate test pins 2 errors over 10 reference
    words at wer 0.2 — a mean of per-clip rates would have said 0.5.

- eval: E8
  run_id: measure-harness-r2-e8-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/mos.test.ts > the sheet is blind by construction (AC-7) — suppression half > leaks no system name anywhere in the sheet 1ms
    ✓ src/lib/measure/mos.test.ts > the sheet is blind by construction (AC-7) — suppression half > shuffles, so position does not encode the system either 0ms
    ✓ src/lib/measure/mos.test.ts > the sheet is blind by construction (AC-7) — suppression half > gives every entry an opaque id 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: the serialized sheet is asserted not to contain
    any of the three system names, and every blindFile must match
    /^S\d{3}\.mp3$/ so the path cannot leak it either. Ids are pinned to
    S001/S002/S003.

- eval: E9
  run_id: measure-harness-r2-e9-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/mos.test.ts > the key is a separate artefact (AC-8) > keeps the answer out of the sheet the rater receives 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: makeBlindSheet returns { entries, key } as
    distinct objects, and each sheet entry's own key set is asserted to be exactly
    ["blindFile", "id"] — so the system cannot ride along on the entry. The CLI
    writes the key to a sibling "<out>-key.json" rather than into the sheet.

- eval: E10
  run_id: measure-harness-r2-e10-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/mos.test.ts > aggregation reports the spread, not just the mean (AC-9) > matches hand-computed mean, sd, n and interval 0ms
    ✓ src/lib/measure/mos.test.ts > aggregation reports the spread, not just the mean (AC-9) > leaves the spread undefined rather than fake at n = 1 0ms
    ✓ src/lib/measure/mos.test.ts > aggregation reports the spread, not just the mean (AC-9) > ranks systems by mean 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: n, mean and sample sd are pinned to hand values
    over {4,5}, and ci95 is asserted against 1.96 · sd/√n — the exact formula the
    contract's Notes commit to. At n = 1 both sd and ci95 are asserted null rather
    than 0.

- eval: E11
  run_id: measure-harness-r2-e11-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/mos.test.ts > bad input fails loudly (AC-10) — suppression half > rejects a score outside the MOS range instead of dropping it 0ms
    ✓ src/lib/measure/mos.test.ts > bad input fails loudly (AC-10) — suppression half > rejects a rating for an id the key does not know 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: scores 6, 0 and NaN each assert a throw matching
    /range/i, and an unknown id asserts a throw matching /unknown id/i — three
    out-of-range shapes, not just the obvious one.

- eval: E12
  run_id: measure-harness-r2-e12-20260726011445
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.script.smoke_measure_mos
  verified_at: 2026-07-26T01:14:45Z
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
  run_id: measure-harness-r2-e13-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/cogs.test.ts > grouping and statistics (AC-11) > groups by plugin and slot 1ms
    ✓ src/lib/measure/cogs.test.ts > grouping and statistics (AC-11) > matches hand-computed median and p95 0ms
    ✓ src/lib/measure/cogs.test.ts > grouping and statistics (AC-11) > averages the middle pair for an even count 0ms
    ✓ src/lib/measure/cogs.test.ts > grouping and statistics (AC-11) > sorts the heaviest groups first 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: four rows across two plugins and two slots
    produce three groups with count and totalDurationMs pinned; median is checked
    for both odd (200 of 100/200/300) and even (150 of 100/200) counts, and p95
    uses nearest-rank ceil(0.95 · n).

- eval: E14
  run_id: measure-harness-r2-e14-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/cogs.test.ts > unmeasured rows are counted, not averaged (AC-12) — suppression half > keeps NULL durations out of the statistics 0ms
    ✓ src/lib/measure/cogs.test.ts > unmeasured rows are counted, not averaged (AC-12) — suppression half > reports a group with nothing measured without inventing zeros 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: with rows 200/null/400 the group asserts count 3,
    measured 2, unmeasured 1 and median 300 — the comment names the trap, since
    treating the NULL as zero would drag the median to 200. An all-NULL group
    asserts median and p95 null rather than 0.

- eval: E15
  run_id: measure-harness-r2-e15-20260726011422
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.test.unit_measure
  verified_at: 2026-07-26T01:14:22Z
  output: |
    ✓ src/lib/measure/cogs.test.ts > cost is applied, never invented (AC-13) — suppression half > omits the cost field entirely when no rates are supplied 0ms
    ✓ src/lib/measure/cogs.test.ts > cost is applied, never invented (AC-13) — suppression half > applies exactly the supplied rate 0ms
    ✓ src/lib/measure/cogs.test.ts > cost is applied, never invented (AC-13) — suppression half > leaves plugins absent from the rate table without a cost 0ms
     Test Files  3 passed (3)
          Tests  33 passed (33)
    Body re-inspected this round: with no rates the group asserts
    not.toHaveProperty("costUsd") — absent, not zero; with { p: 0.5 } over 3s of
    plugin time it asserts 1.5; and a plugin missing from the rate table asserts
    no costUsd while its priced sibling asserts 1.

- eval: E16
  run_id: measure-harness-r2-e16-20260726011450
  exit_code: 0
  baseline: carried-forward (r1: red)
  verifier: config:executors.script.smoke_measure_cogs
  verified_at: 2026-07-26T01:14:50Z
  output: |
    Plugin time from /var/folders/.../oneflow-cogs-YkHdk6/good.db (status: completed, failed) — 5 task(s)

    plugin / slot                              n  meas  unmeas    total   median      p95
    -------------------------------------------------------------------------------------------
    modal-z-image / image-gen                   4     3       1    11.0s     4.0s     6.0s
    api-openrouter / gen-text                   1     1       0     0.5s     0.5s     0.5s

    1 task(s) have no measured duration — history from before metering, or aborted runs.
    They are counted but kept out of the statistics rather than averaged as zero.

    No --rates supplied, so no cost is reported. Pass a rate table derived from a real invoice:
      {"<pluginId>": <usdPerSecond>}

    selftest-cogs: ok

    Selftest source re-read this round to confirm the suppression half is really
    driven: it builds a second database at the deliberately pre-metering schema
    and asserts the command signals failure rather than succeeding, that the
    message contains "predates task metering", and that no raw SQLITE_ERROR or
    "no such column" text leaks. It also asserts the un-rated report contains no
    "$" anywhere, then re-runs with a rate file and asserts a cost appears.

- eval: E17
  run_id: measure-harness-r2-e17-20260726011523
  exit_code: 0
  baseline: carried-forward (r1: green)
  verifier: config:executors.test.unit
  verified_at: 2026-07-26T01:15:23Z
  output: |
    > oneflow@0.2.1 test /Users/manhphan/dev/oneflow
    > vitest run

     RUN  v4.1.5 /Users/manhphan/dev/oneflow

     Test Files  21 passed (21)
          Tests  197 passed (197)

- eval: E18
  run_id: measure-harness-r2-e18-20260726011534
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-26T01:15:34Z
  output: |
    ✓ Compiled successfully in 4.2s
    └ ƒ /workspace                            379 kB         563 kB
    + First Load JS shared by all             103 kB

    ƒ  (Dynamic)  server-rendered on demand

    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E19
  run_id: measure-harness-r2-e19-20260726011529
  exit_code: 0
  baseline: carried-forward (r1: green)
  verifier: config:executors.test.lint
  verified_at: 2026-07-26T01:15:29Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .

    Checked 353 files in 70ms. No fixes applied.

## Analyst

**The A/B baseline was deliberately skipped this round.** Round 1 already
established discrimination by mutation testing, and re-deriving it adds nothing.
Per-eval `baseline:` values are therefore marked `carried-forward` — they record
round 1's measurement, not a round-2 one.

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
`describe` names or round 1's notes, and independently re-read
`scripts/measure/selftest-cogs.ts`. Every claim round 1 made about the test
bodies held up. The suppression halves are real inversions, not restatements:
AC-2 pins `không phải` vs `khong phai` at 2 substitutions and WER 1, so a
diacritic-stripping normaliser fails loudly; AC-13 asserts `costUsd` is *absent*
rather than zero, so a regression defaulting the rate to 0 is caught; AC-7
asserts the serialized sheet contains no system name *and* that `blindFile`
matches `/^S\d{3}\.mp3$/`, closing the path-leak hole; AC-12 keeps NULL durations
out of the statistics while still counting them, with the median pinned to 300
where a zero-fill would give 200. AC-10 rejects three distinct bad shapes (6, 0,
NaN) plus an unknown id, not just the obvious one.

I ran `pnpm vitest run src/lib/measure` twice: once as the plain resolved command
for the recorded exit code, and once with `--reporter=verbose` to confirm each
eval's own covering test actually ran. All 33 tests are individually listed and
green, and the per-AC counts reconcile exactly to 33
(AC-1:4, AC-2:2, AC-3:1, AC-4:3, AC-5:3, AC-6:2, AC-7:3, AC-8:1, AC-9:3,
AC-10:2, AC-11:4, AC-12:2, AC-13:3). **No eval is marked PASS on the shared exit
code alone.** Note that thirteen evals bind `unit_measure` (E1–E5, E7–E11,
E13–E15), not fourteen — E17 resolves to `executors.test.unit`, a different key.

E17/E18/E19 are suite-wide standing guards. They are shared with the
`task-metering` feature verified in the same session; each was executed once
against this tree and its real result recorded for both features, with distinct
`run_id`s per feature. E18's baseline stays `n-a` — a `pnpm build` in a baseline
worktree needs its own `.next` and costs several minutes for no added signal.
The suite has grown to 197 tests across 21 files (round 1 measured 195/21) and
biome now checks 353 files (round 1: 352); both moves are consistent with the
rebase pulling in `main`, and both commands are green.

Two soft spots worth naming, neither changing a verdict. First, carried forward
from round 1: E5's first assertion checks only that the digits-vs-words price
produces *some* error (`toBeGreaterThan(0)`) rather than an exact count; the
exact-count guarantee is carried by the sibling test pinning `digitTokenErrors`
to 1 in both directions, so AC-5 is covered, but that first test alone would
tolerate a miscount. Second, newly observed this round: AC-7's shuffle assertion
uses a fixed `rng() => 0` and checks only that `key.S001.system` is not the first
input system. That proves the order provably changes and keeps the test
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

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Confirm the WER normalisation rules match intent (diacritics kept, numbers not converted)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
