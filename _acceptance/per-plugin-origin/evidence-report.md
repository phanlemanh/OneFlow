---
schema_version: 2
feature_slug: per-plugin-origin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d991af0d149898f80dcce1c76a5bc184a71a95e4
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
  run_id: minted-per-plugin-origin-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T00:48:50Z
  output: |
          Tests  32 passed (32)
       Start at  07:49:22
       Duration  146ms (transform 17ms, setup 0ms, import 25ms, tests 5ms, environment 0ms)

- eval: E2
  run_id: minted-per-plugin-origin-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T00:48:50Z
  output: |
          Tests  32 passed (32)
       Start at  07:49:22
       Duration  146ms (transform 17ms, setup 0ms, import 25ms, tests 5ms, environment 0ms)

- eval: E3
  run_id: minted-per-plugin-origin-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T00:48:50Z
  output: |
          Tests  32 passed (32)
       Start at  07:49:22
       Duration  146ms (transform 17ms, setup 0ms, import 25ms, tests 5ms, environment 0ms)

- eval: E4
  run_id: minted-per-plugin-origin-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T00:48:50Z
  output: |
          Tests  32 passed (32)
       Start at  07:49:22
       Duration  146ms (transform 17ms, setup 0ms, import 25ms, tests 5ms, environment 0ms)

- eval: E5
  run_id: minted-per-plugin-origin-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_single_impl
  verified_at: 2026-07-27T00:48:50Z
  output: |
    OK: one URL rule across src/ and scripts/, in src/lib/plugins/official-manifest.ts; the CLI installer imports it (the SDK engine's Python copy is out of this scan's scope — see the contract's known limits)

- eval: E6
  run_id: minted-per-plugin-origin-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_installer_parity
  verified_at: 2026-07-27T00:48:50Z
  output: |
    OK: the CLI installer, the in-app install path and the update checker agree, and both pull paths use the resolved origin

- eval: E7
  run_id: minted-per-plugin-origin-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_manifest_unmoved
  verified_at: 2026-07-27T00:48:50Z
  output: |
    OK: 38 plain string entries, default org unchanged

- eval: E8
  run_id: minted-per-plugin-origin-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-27T00:48:50Z
  output: |
          Tests  75 passed (75)
       Start at  07:49:21
       Duration  278ms (transform 76ms, setup 0ms, import 117ms, tests 9ms, environment 0ms)

- eval: E9
  run_id: minted-per-plugin-origin-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-07-27T00:48:50Z
  output: |
          Tests  304 passed (304)
       Start at  07:49:21
       Duration  1.22s (transform 3.95s, setup 0ms, import 6.22s, tests 1.02s, environment 1ms)

- eval: E10
  run_id: minted-per-plugin-origin-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-27T00:48:50Z
  output: |

    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    $ tsc --noEmit

- eval: E11
  run_id: minted-per-plugin-origin-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-07-27T00:48:50Z
  output: |
    $ pnpm exec biome check --error-on-warnings .
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    Checked 401 files in 141ms. No fixes applied.

- eval: E12
  run_id: minted-per-plugin-origin-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-07-27T00:48:50Z
  output: |
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

### Additional runs (not mapped to any eval / AC)

Two further commands were run as supplementary guards but are not attached to
any eval id in this contract, so they do not appear in the table above and do
not affect the verdict:

- `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q` — 1 run, passed (89 passed in 3.47s), baseline n-a.
- `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` — 1 run, passed (`VERIFICATION_EXIT_CODE: 0`), baseline n-a.

## Analyst

carried tu round truoc — baseline khong do lai round nay (P2: evals.yaml
khong doi tu lan baseline cuoi round 1).

none — no non-discriminating evals reported for round 2 (baseline was not
re-measured this round; see round 1's Analyst findings for the last measured
baseline classification of E8/E9/E12 as intended regression-guards).

## Variance

none — every eval this round has `runs: 1` (deterministic); no eval carries
`variance: true`.

## Iterations

Round 1: E11 failed — `pnpm lint:check` (biome, `--error-on-warnings`) exits 1.
All other evals (E1-E10, E12) pass, including baseline-discriminating evals
E1-E7 (red on the pre-feature tree, green on HEAD). Verdict: REJECT. Returned
to implementation.

Round 2: all evals E1-E12 pass (exit 0), including the previously-failing
E11 (`pnpm lint:check`). Full suite (`pnpm test`, 304 passed), build +
typecheck, and the plugins scan verifier are all green. The standalone SDK
pytest suite (89 passed) and the ABI-generation diff check also pass as
unmapped supplementary guards. No judgment items are pending for this
contract this round (judge panel list is empty). Verdict: PASS.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
