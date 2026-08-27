---
schema_version: 2
feature_slug: measure-harness
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d919b5eb51a0a3dfa70b5718113c935b39099ab0
human_signoff: Manh 2026-08-07
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
  run_id: measure-harness-E1-20260807T013043Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:43Z
  output: |
    Test Files  3 passed (3)
         Tests  33 passed (33)
    named coverage: "WER arithmetic (AC-1) > scores an identical transcript as zero",
    "scores an empty hypothesis as one", "counts substitutions, deletions and
    insertions separately", "refuses an empty reference rather than dividing by zero"

- eval: E2
  run_id: measure-harness-E2-20260807T013044Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:44Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "diacritics are preserved (AC-2) — suppression half > treats a
    missing tone mark as an error", "does not fold distinct Vietnamese words together"

- eval: E3
  run_id: measure-harness-E3-20260807T013045Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:45Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "Unicode composition (AC-3) > scores precomposed and decomposed
    text as equal"

- eval: E4
  run_id: measure-harness-E4-20260807T013045Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:45Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "case and punctuation are not word errors (AC-4) > ignores letter
    case", "ignores surrounding punctuation", "still keeps letters that punctuation
    stripping could eat"

- eval: E5
  run_id: measure-harness-E5-20260807T013046Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:46Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "numbers are reported, never converted (AC-5) — suppression half >
    counts a digits-versus-words price as an error", "breaks digit-bearing edits out so
    a human can judge them", "reports zero digit errors when no digits are involved"

- eval: E6
  run_id: measure-harness-E6-20260807T013117Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.smoke_measure_wer
  verified_at: 2026-08-07T01:31:17Z
  output: |
    clip-01                    38.5%    1    0    4      1
    clip-02                     7.7%    1    0    0      0
    ------------------------------------------------------
    CORPUS                     23.1%    2    0    4      1
    26 reference words. "digit" counts edits where either side's token contains a digit —
    numbers are never converted automatically, so a price read aloud shows up here.

- eval: E7
  run_id: measure-harness-E7-20260807T013047Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:47Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "corpus scoring (AC-6) > reports a missing hypothesis instead of
    averaging over fewer clips", "aggregates over total words, not the mean of
    per-clip rates"

- eval: E8
  run_id: measure-harness-E8-20260807T013047Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:47Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "the sheet is blind by construction (AC-7) — suppression half >
    leaks no system name anywhere in the sheet", "shuffles, so position does not encode
    the system either", "gives every entry an opaque id"

- eval: E9
  run_id: measure-harness-E9-20260807T013048Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:48Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "the key is a separate artefact (AC-8) > keeps the answer out of the
    sheet the rater receives"

- eval: E10
  run_id: measure-harness-E10-20260807T013049Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:49Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "aggregation reports the spread, not just the mean (AC-9) > matches
    hand-computed mean, sd, n and interval", "leaves the spread undefined rather than
    fake at n = 1", "ranks systems by mean"

- eval: E11
  run_id: measure-harness-E11-20260807T013050Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:50Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "bad input fails loudly (AC-10) — suppression half > rejects a score
    outside the MOS range instead of dropping it", "rejects a rating for an id the key
    does not know"

- eval: E12
  run_id: measure-harness-E12-20260807T013119Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.smoke_measure_mos
  verified_at: 2026-08-07T01:31:19Z
  output: |
    system                    n     MOS     sd      95% CI
    -----------------------------------------------------
    elevenlabs                3   5.00   0.00     ±0.00
    vixtts                    3   3.00   0.00     ±0.00
    At this sample size the interval is wide by construction — read n before the mean.
    selftest-mos: ok

- eval: E13
  run_id: measure-harness-E13-20260807T013050Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:50Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "grouping and statistics (AC-11) > groups by plugin and slot",
    "matches hand-computed median and p95", "averages the middle pair for an even
    count", "sorts the heaviest groups first"

- eval: E14
  run_id: measure-harness-E14-20260807T013051Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:51Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "unmeasured rows are counted, not averaged (AC-12) — suppression
    half > keeps NULL durations out of the statistics", "reports a group with nothing
    measured without inventing zeros"

- eval: E15
  run_id: measure-harness-E15-20260807T013052Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_measure
  verified_at: 2026-08-07T01:30:52Z
  output: |
    Test Files  3 passed (3) / Tests  33 passed (33)
    named coverage: "cost is applied, never invented (AC-13) — suppression half > omits
    the cost field entirely when no rates are supplied", "applies exactly the supplied
    rate", "leaves plugins absent from the rate table without a cost"

- eval: E16
  run_id: measure-harness-E16-20260807T013120Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.smoke_measure_cogs
  verified_at: 2026-08-07T01:31:20Z
  output: |
    1 task(s) have no measured duration — history from before metering, or aborted runs.
    They are counted but kept out of the statistics rather than averaged as zero.
    No --rates supplied, so no cost is reported. Pass a rate table derived from a real invoice.
    selftest-cogs: ok
    (the selftest itself drives the pre-metering-database case and asserts the run
    refuses it in plain language — scripts/measure/selftest-cogs.ts lines 88-101)

- eval: E17
  run_id: measure-harness-E17-20260807T013138Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-07T01:31:38Z
  output: |
    $ vitest run
    Test Files  32 passed (32)
         Tests  427 passed (427)
      Duration  1.33s

- eval: E18
  run_id: measure-harness-E18-20260807T013208Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-07T01:32:08Z
  output: |
      chunks/8336-0e84acaf04d00d35.js      46.2 kB
      other shared chunks (total)          2.18 kB
    (Dynamic)  server-rendered on demand
    $ tsc --noEmit

- eval: E19
  run_id: measure-harness-E19-20260807T013138Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-07T01:31:38Z
  output: |
    $ pnpm exec biome check --error-on-warnings .
    Checked 429 files in 81ms. No fixes applied.

## Analyst

Baseline is `n-a` on every eval: establishing an A/B baseline would require moving
the working tree to the diffBase, which this re-verification round is forbidden to
do (no git operations at all). Discrimination cannot be re-established this round;
the earlier signed rounds carry that judgment.

Thirteen evals (E1-E5, E7-E11, E13-E15) resolve to the same command,
`pnpm vitest run src/lib/measure`. Rather than record one execution thirteen times,
the command was executed once per eval — thirteen genuinely separate runs, each with
its own logged run_id and timestamp. To compensate for the shared exit code, the run
was additionally taken once with `--reporter=verbose` and each eval's evidence block
quotes the specific named test(s) covering its criterion. Every criterion in the
AC-1…AC-13 range has at least one test whose name states the criterion, and the
suppression-half criteria (AC-2, AC-5, AC-7, AC-10, AC-12, AC-13) each carry a test
explicitly labelled "suppression half". That mapping is what makes these thirteen
evals readable individually; a future round would be sharper still with per-criterion
`-t` keys in `_acceptance/config.yaml`, the pattern the cache-l1-fingerprint lesson
established and which this older contract predates.

E17's whole-suite count is now 427 tests across 32 files, up from what it was when
this feature was signed; the criterion (AC-16) asks only that the suite be green,
and it is.

## Variance

none — every multi-run eval is uniform (all evals here are deterministic, runs: 1)

## Iterations

Round 1 (re-verification after upstream code change)

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line (none in this report — no judgment evals)
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (n/a — this contract is T2 and has no judgment evals)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (n/a — verdict is PASS)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

### Re-pin lần 1 — 2026-08-27, do fork `STALE-DIFF-SCOPE-GUARD` được thu hẹp (hồ sơ `gate-tooling-t1`): feature khai đủ `paths` nay lại bị soi staleness, làm lộ bản ghi cũ này. Mã của gói này không đổi — mọi suite chạy lại đều exit 0
run_id: repin-measure-harness-20260827T101500Z
sha: d919b5eb51a0a3dfa70b5718113c935b39099ab0 · suites: 7 lệnh exit 0
