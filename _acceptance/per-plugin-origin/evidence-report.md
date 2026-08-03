---
schema_version: 2
feature_slug: per-plugin-origin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2c0152a496dcb88a8790915c572b6db9546475d2
human_signoff:
---

# Evidence Report: per-plugin-origin

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-5 | test | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-3 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-1 | test | PASS |
| E10 | AC-3 | test | PASS |
| E11 | AC-3 | test | PASS |
| E12 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-per-plugin-origin-E1-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-03T23:03:07Z
  output: |
    Tests  59 passed (59)
    Start at  23:03:06
    Duration  292ms (transform 56ms, setup 0ms, import 105ms, tests 7ms, environment 0ms)

- eval: E2
  run_id: minted-per-plugin-origin-E2-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-03T23:03:07Z
  output: |
    Tests  59 passed (59)
    Start at  23:03:06
    Duration  292ms (transform 56ms, setup 0ms, import 105ms, tests 7ms, environment 0ms)

- eval: E3
  run_id: minted-per-plugin-origin-E3-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-03T23:03:07Z
  output: |
    Tests  59 passed (59)
    Start at  23:03:06
    Duration  292ms (transform 56ms, setup 0ms, import 105ms, tests 7ms, environment 0ms)

- eval: E4
  run_id: minted-per-plugin-origin-E4-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-03T23:03:07Z
  output: |
    Tests  59 passed (59)
    Start at  23:03:06
    Duration  292ms (transform 56ms, setup 0ms, import 105ms, tests 7ms, environment 0ms)

- eval: E5
  run_id: minted-per-plugin-origin-E5-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_single_impl
  verified_at: 2026-08-03T23:03:07Z
  output: |
    OK: one URL rule across src/ and scripts/, in src/lib/plugins/official-manifest.ts; the CLI installer imports it (the SDK engine's Python copy is out of this scan's scope — see the contract's known limits)

- eval: E6
  run_id: minted-per-plugin-origin-E6-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_installer_parity
  verified_at: 2026-08-03T23:03:07Z
  output: |
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    OK: the CLI installer, the in-app install path and the update checker agree; both pull paths use the resolved origin and refuse a non-fast-forward

- eval: E7
  run_id: minted-per-plugin-origin-E7-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_manifest_unmoved
  verified_at: 2026-08-03T23:03:07Z
  output: |
    OK: 38 plain strings under default org + 1 origin entry (compose-overlay)

- eval: E8
  run_id: minted-per-plugin-origin-E8-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-08-03T23:03:07Z
  output: |
    Tests  76 passed (76)
    Start at  23:03:06
    Duration  364ms (transform 73ms, setup 0ms, import 124ms, tests 5ms, environment 0ms)

- eval: E9
  run_id: minted-per-plugin-origin-E9-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-03T23:03:07Z
  output: |
    Tests  413 passed (413)
    Start at  23:03:07
    Duration  2.50s (transform 5.05s, setup 0ms, import 9.51s, tests 2.28s, environment 1.20s)

- eval: E10
  run_id: minted-per-plugin-origin-E10-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-03T23:03:07Z
  output: |
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    $ tsc --noEmit

- eval: E11
  run_id: minted-per-plugin-origin-E11-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-03T23:03:07Z
  output: |
    $ pnpm exec biome check --error-on-warnings .
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    Checked 426 files in 255ms. No fixes applied.

- eval: E12
  run_id: minted-per-plugin-origin-E12-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-03T23:03:07Z
  output: |
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

## Analyst

carried tu round truoc — baseline khong do lai round nay
none — baseline not re-measured this round (see prior round's evidence report for the baseline classification)

## Variance

none — no stochastic evals this round (no eval carries runs > 1)

## Iterations

Round 10: all 12 machine evals (E1-E12) passed on first run, zero failures, zero judgment items pending; baseline not re-measured this round (carried from prior round per P2).

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
