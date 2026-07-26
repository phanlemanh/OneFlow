---
schema_version: 2
feature_slug: per-plugin-origin
verdict: REJECT
failed_evals: [E11]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a9a43a5e5a560be2b2ee2687b6a8af995ea72c1d
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
| E11 | AC-3 | test | FAIL |
| E12 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-per-plugin-origin-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-26T22:50:52Z
  output: |
          Tests  31 passed (31)
       Start at  05:51:28
       Duration  183ms (transform 34ms, setup 0ms, import 46ms, tests 5ms, environment 0ms)

- eval: E2
  run_id: minted-per-plugin-origin-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-26T22:50:52Z
  output: |
          Tests  31 passed (31)
       Start at  05:51:28
       Duration  183ms (transform 34ms, setup 0ms, import 46ms, tests 5ms, environment 0ms)

- eval: E3
  run_id: minted-per-plugin-origin-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-26T22:50:52Z
  output: |
          Tests  31 passed (31)
       Start at  05:51:28
       Duration  183ms (transform 34ms, setup 0ms, import 46ms, tests 5ms, environment 0ms)

- eval: E4
  run_id: minted-per-plugin-origin-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-26T22:50:52Z
  output: |
          Tests  31 passed (31)
       Start at  05:51:28
       Duration  183ms (transform 34ms, setup 0ms, import 46ms, tests 5ms, environment 0ms)

- eval: E5
  run_id: minted-per-plugin-origin-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.origin_single_impl
  verified_at: 2026-07-26T22:50:52Z
  output: |
    OK: one URL rule, in src/lib/plugins/official-manifest.ts; the CLI installer imports it

- eval: E6
  run_id: minted-per-plugin-origin-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.origin_installer_parity
  verified_at: 2026-07-26T22:50:52Z
  output: |
    OK: the CLI installer, the in-app install path and the update checker agree

- eval: E7
  run_id: minted-per-plugin-origin-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.origin_manifest_unmoved
  verified_at: 2026-07-26T22:50:52Z
  output: |
    OK: 38 plain string entries, default org unchanged

- eval: E8
  run_id: minted-per-plugin-origin-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-26T22:50:52Z
  output: |
          Tests  75 passed (75)
       Start at  05:51:29
       Duration  255ms (transform 55ms, setup 0ms, import 85ms, tests 4ms, environment 0ms)

- eval: E9
  run_id: minted-per-plugin-origin-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit
  verified_at: 2026-07-26T22:50:52Z
  output: |
         Tests  303 passed (303)
      Start at  05:51:29
      Duration  1.43s (transform 4.90s, setup 0ms, import 8.41s, tests 967ms, environment 2ms)

- eval: E10
  run_id: minted-per-plugin-origin-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-26T22:50:52Z
  output: |
       Finalizing page optimization ...
       Collecting build traces ...
    $ tsc --noEmit

- eval: E11
  run_id: minted-per-plugin-origin-E11-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.lint
  verified_at: 2026-07-26T22:50:52Z
  output: |
    × Some errors were emitted while running checks.


    [ELIFECYCLE] Command failed with exit code 1.
  note: |
    Command `pnpm lint:check` failed with exit code 1. This failure is fully
    attributed to eval E11 (AC-3, biome checks with --error-on-warnings) — there
    is no unassigned/orphan command failure in this round.

- eval: E12
  run_id: minted-per-plugin-origin-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-07-26T22:50:52Z
  output: |
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

### Additional runs (not mapped to any eval / AC)

Two further commands were run as supplementary guards but are not attached to
any eval id in this contract, so they do not appear in the table above and do
not affect the verdict:

- `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic python -m pytest -q` — 1 run, passed (89 passed in 5.03s), baseline n-a.
- `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` — 1 run, passed (exit 0), baseline n-a.

## Analyst

Non-discriminating evals (pass on BOTH HEAD and the diffBase baseline — they
prove the harness, not this feature):

- E8 (`pnpm vitest run src/lib/plugins/plugin-id.test.ts`) — this is
  `oneflow-plugin-prefix`'s own pre-existing suite; it was green before this
  feature existed and stays green, so it is functioning here as a
  regression-guard for AC-6 ("no plugin is repointed"), not as a discriminator
  for this feature's own new behavior. Intended regression-guard — keep as is.
- E9 (`pnpm test`) — the whole-suite runner; individual feature tests inside it
  (E1-E4) already discriminate, so the suite-level command being green on both
  sides is expected and not a signal of missing coverage.
- E12 (`pnpm verify:plugins`) — the plugins scan verifier predates this change
  and passed on the baseline; it is a standing regression-guard for the
  manifest scan, not a test of per-plugin origin. Intended regression-guard —
  keep as is.

## Variance

none — every multi-run eval is uniform (no eval in this round carries `runs` >
1; none is flagged `variance: true`).

## Iterations

Round 1: E11 failed — `pnpm lint:check` (biome, `--error-on-warnings`) exits 1.
All other evals (E1-E10, E12) pass, including baseline-discriminating evals
E1-E7 (red on the pre-feature tree, green on HEAD). Verdict: REJECT. Returned
to implementation.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract

Not applicable this round — verdict is REJECT (E11 failed). No PASS/Gate-2
sign-off is possible until E11 is fixed and this report is re-run.
