---
schema_version: 2
feature_slug: per-plugin-origin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 015d196ec7199f89c3ff614869736775f59ca806
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
  run_id: minted-per-plugin-origin-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T02:19:10Z
  output: |
          Tests  47 passed (47)
       Start at  09:19:44
       Duration  320ms (transform 115ms, setup 0ms, import 133ms, tests 14ms, environment 0ms)

- eval: E2
  run_id: minted-per-plugin-origin-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T02:19:10Z
  output: |
          Tests  47 passed (47)
       Start at  09:19:44
       Duration  320ms (transform 115ms, setup 0ms, import 133ms, tests 14ms, environment 0ms)

- eval: E3
  run_id: minted-per-plugin-origin-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T02:19:10Z
  output: |
          Tests  47 passed (47)
       Start at  09:19:44
       Duration  320ms (transform 115ms, setup 0ms, import 133ms, tests 14ms, environment 0ms)

- eval: E4
  run_id: minted-per-plugin-origin-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T02:19:10Z
  output: |
          Tests  47 passed (47)
       Start at  09:19:44
       Duration  320ms (transform 115ms, setup 0ms, import 133ms, tests 14ms, environment 0ms)

- eval: E5
  run_id: minted-per-plugin-origin-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_single_impl
  verified_at: 2026-07-27T02:19:10Z
  output: |
    OK: one URL rule across src/ and scripts/, in src/lib/plugins/official-manifest.ts; the CLI installer imports it (the SDK engine's Python copy is out of this scan's scope — see the contract's known limits)

- eval: E6
  run_id: minted-per-plugin-origin-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_installer_parity
  verified_at: 2026-07-27T02:19:10Z
  output: |
    OK: the CLI installer, the in-app install path and the update checker agree; both pull paths use the resolved origin and refuse a non-fast-forward

- eval: E7
  run_id: minted-per-plugin-origin-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_manifest_unmoved
  verified_at: 2026-07-27T02:19:10Z
  output: |
    OK: 38 plain string entries, default org unchanged

- eval: E8
  run_id: minted-per-plugin-origin-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-27T02:19:10Z
  output: |
          Tests  75 passed (75)
       Start at  09:19:42
       Duration  281ms (transform 33ms, setup 0ms, import 46ms, tests 4ms, environment 6ms)

- eval: E9
  run_id: minted-per-plugin-origin-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-07-27T02:19:10Z
  output: |
         Tests  319 passed (319)
      Start at  09:19:44
      Duration  1.32s (transform 2.87s, setup 0ms, import 5.38s, tests 877ms, environment 1ms)

- eval: E10
  run_id: minted-per-plugin-origin-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-27T02:19:10Z
  output: |
    ƒ  (Dynamic)  server-rendered on demand

    $ tsc --noEmit

- eval: E11
  run_id: minted-per-plugin-origin-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-07-27T02:19:10Z
  output: |
    Checked 402 files in 90ms. No fixes applied.

- eval: E12
  run_id: minted-per-plugin-origin-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-07-27T02:19:10Z
  output: |
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

### Additional runs (not mapped to any eval / AC)

Two further commands were run as supplementary guards but are not attached to
any eval id in this contract, so they do not appear in the table above and do
not affect the verdict:

- `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q` — 1 run, passed (89 passed in 4.20s), baseline n-a.
- `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` — 1 run, passed (`Wrote src/generated/abi/index.ts`, `Wrote sdk/tongflow/_data/tongflow.abi.json`, no diff — files in sync), baseline n-a.

## Analyst

carried tu round truoc — baseline khong do lai round nay (P2: evals.yaml
khong doi tu lan baseline cuoi round 1).

none — no non-discriminating evals reported for round 4 (baseline was not
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

Round 3: all evals E1-E12 pass again (exit 0) against the re-verified tree.
Unit test counts grew (E1-E4's suite now 40 tests, was 32; the whole-repo
suite E9 now 312, was 304), build/typecheck, lint, and the plugins scan
verifier remain green, and the two unmapped supplementary guards (SDK pytest
89 passed; ABI-generation diff check) stay green. No judgment items pending
(judge panel list is empty). Verdict: PASS.

Round 4: all evals E1-E12 pass again (exit 0) against the re-verified tree at
commit 015d196ec7199f89c3ff614869736775f59ca806. Unit test counts grew
further (E1-E4's suite now 47 tests, was 40; the whole-repo suite E9 now 319,
was 312; E8's suite holds at 75), build/typecheck, lint, and the plugins scan
verifier remain green, and the two unmapped supplementary guards (SDK pytest
89 passed; ABI-generation diff check) stay green. Baseline was not
re-measured this round (P2 — evals.yaml unchanged since round 1's baseline
run); the Analyst section carries forward round 1's classification. No
judgment items are pending for this contract this round (judge panel list is
empty). Verdict: PASS.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
