---
schema_version: 2
feature_slug: dependency-refresh-2026-07
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a788985b3b30c7072dcfd95bc65db1f83b940984
human_signoff: Manh 2026-08-07
---

# Evidence Report: dependency-refresh-2026-07

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: dependency-refresh-2026-07-E1-20260807T012612Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.deps_manifest_intact
  verified_at: 2026-08-07T01:26:12Z
  output: |
    dependencies.react = 19.2.8
    dependencies.drizzle-orm = 0.45.2
    devDependencies.@biomejs/biome = 2.5.5
    repo scripts intact: hooks:install, sdk:publish, gen:abi

- eval: E2
  run_id: dependency-refresh-2026-07-E2-20260807T012650Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.deps_lockfile_clean
  verified_at: 2026-08-07T01:26:50Z
  output: |
    $ pnpm install --frozen-lockfile
    Already up to date
    Done in 177ms using pnpm v11.5.1

- eval: E3
  run_id: dependency-refresh-2026-07-E3-20260807T012709Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-07T01:27:09Z
  output: |
    $ pnpm exec biome check --error-on-warnings .
    Checked 429 files in 79ms. No fixes applied.

- eval: E4
  run_id: dependency-refresh-2026-07-E4-20260807T012725Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-07T01:27:25Z
  output: |
    $ vitest run
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  32 passed (32)
         Tests  427 passed (427)
      Duration  1.61s

- eval: E5
  run_id: dependency-refresh-2026-07-E5-20260807T012744Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-07T01:27:44Z
  output: |
    ........................................................................ [ 37%]
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 5.72s

- eval: E6
  run_id: dependency-refresh-2026-07-E6-20260807T012919Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-07T01:29:19Z
  output: |
    + First Load JS shared by all             103 kB
      chunks/620846f1-92c416bf2f09796f.js  54.2 kB
      chunks/8336-0e84acaf04d00d35.js      46.2 kB
    (Dynamic)  server-rendered on demand
    $ tsc --noEmit

- eval: E7
  run_id: dependency-refresh-2026-07-E7-20260807T012930Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.smoke_measure_cogs
  verified_at: 2026-08-07T01:29:30Z
  output: |
    modal-z-image / image-gen                   4     3       1    11.0s     4.0s     6.0s
    api-openrouter / gen-text                   1     1       0     0.5s     0.5s     0.5s
    1 task(s) have no measured duration — history from before metering, or aborted runs.
    selftest-cogs: ok

- eval: E8
  run_id: dependency-refresh-2026-07-E8-20260807T012941Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.deps_no_t3_drift
  verified_at: 2026-08-07T01:29:41Z
  output: |
    no T3 drift: src/lib/abi src/app/api untouched vs the range
    dependency-refresh-2026-07 owns
    (1e81ac216e46efc9946b47887ae32e496e87e1a4..4d89b584fcfd3dfafd03823a14c9b81406db6e9b)

## Analyst

Baseline is `n-a` on every eval: an A/B baseline would require moving the working
tree to the diffBase, which this re-verification round is forbidden to do (no git
operations at all). Discrimination therefore cannot be re-established this round;
the earlier signed rounds carry that judgment.

Two observations for the human, neither a failure:

- E4's `expected` text still names 197 vitest tests and E5's names 66 SDK tests;
  the current tree runs 427 and 193 respectively. The criteria (AC-4, AC-5) say
  "all tests pass", and all do — the counts grew because features landed after this
  one was signed. The stale numbers in the eval text are cosmetic drift, worth a
  one-line refresh at some point.
- E6 was run twice. The first attempt collided with a concurrent session in this
  same working directory (a `tsc --noEmit` process on this repo was observed running
  under another PID), and the two builds raced on the shared `.next` directory —
  the known hazard the `build_typecheck` comment in `_acceptance/config.yaml`
  documents. The run recorded here was made after confirming the repo was quiet;
  it completed clean end to end. Nothing about the dependency set was implicated.

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
