---
schema_version: 2
feature_slug: sdk-distribution-rename
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a788985b3b30c7072dcfd95bc65db1f83b940984
human_signoff: Manh 2026-08-07
---

# Evidence Report: sdk-distribution-rename

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
| E12 | AC-12 | test | PASS |
| E13 | AC-12 | test | PASS |
| E14 | AC-13 | test | PASS |

## Evidence

- eval: E1
  run_id: sdk-distribution-rename-E1-20260807T013401Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:01Z
  output: |
    tests/test_packaging.py ...........  [100%]
    11 passed in 2.19s
    criterion test: tests/test_packaging.py::test_distribution_name_is_oneflow_sdk

- eval: E2
  run_id: sdk-distribution-rename-E2-20260807T013403Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:03Z
  output: |
    11 passed
    criterion test: tests/test_packaging.py::test_import_package_is_untouched
    (suppression half — packages.find.include still selects tongflow*)

- eval: E3
  run_id: sdk-distribution-rename-E3-20260807T013405Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:05Z
  output: |
    11 passed
    criterion test:
    tests/test_packaging.py::test_import_still_works_and_exposes_the_public_api

- eval: E4
  run_id: sdk-distribution-rename-E4-20260807T013407Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:07Z
  output: |
    11 passed
    criterion test: tests/test_packaging.py::test_version_is_declared_once_in_effect

- eval: E5
  run_id: sdk-distribution-rename-E5-20260807T013410Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:10Z
  output: |
    11 passed
    criterion test: tests/test_packaging.py::test_project_urls_do_not_point_at_upstream
    (suppression half — no project.urls value names the upstream host)

- eval: E6
  run_id: sdk-distribution-rename-E6-20260807T013412Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:12Z
  output: |
    11 passed
    criterion test:
    tests/test_packaging.py::test_publish_script_uses_normalised_artifact_names

- eval: E7
  run_id: sdk-distribution-rename-E7-20260807T013415Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:15Z
  output: |
    11 passed
    criterion test:
    tests/test_packaging.py::test_publish_script_tells_operators_the_right_package
    (suppression half — the old install instruction is asserted absent)

- eval: E8
  run_id: sdk-distribution-rename-E8-20260807T013418Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:18Z
  output: |
    11 passed
    criterion test:
    tests/test_packaging.py::test_author_facing_docs_name_the_distribution

- eval: E9
  run_id: sdk-distribution-rename-E9-20260807T013420Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:20Z
  output: |
    11 passed
    criterion test:
    tests/test_packaging.py::test_npm_publish_script_renamed_and_no_dangling_references
    (suppression half — no tracked file still names the old script)

- eval: E10
  run_id: sdk-distribution-rename-E10-20260807T013422Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:22Z
  output: |
    11 passed
    criterion test:
    tests/test_packaging.py::test_no_surviving_distribution_name_usage
    (suppression half — repo-wide sweep finds no old distribution-name usage
    outside the gitignored plugins/ tree)

- eval: E11
  run_id: sdk-distribution-rename-E11-20260807T013439Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-08-07T01:34:39Z
  output: |
    ........................................................................ [ 37%]
    ........................................................................ [ 74%]
    .................................................                        [100%]
    193 passed in 4.68s

- eval: E12
  run_id: sdk-distribution-rename-E12-20260807T013511Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-07T01:35:11Z
  output: |
    (Dynamic)  server-rendered on demand
    $ tsc --noEmit

- eval: E13
  run_id: sdk-distribution-rename-E13-20260807T013440Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-07T01:34:40Z
  output: |
    $ pnpm exec biome check --error-on-warnings .
    Checked 429 files in 103ms. No fixes applied.

- eval: E14
  run_id: sdk-distribution-rename-E14-20260807T013425Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-08-07T01:34:25Z
  output: |
    11 passed
    criterion test:
    tests/test_packaging.py::test_engine_installs_the_distribution_from_a_single_source
    (suppression half — engine/plugins.py holds no hard-coded install string;
    __distribution__ is the single source and matches project.name)

## Analyst

Baseline is `n-a` on every eval: establishing an A/B baseline would require moving
the working tree to the diffBase, which this re-verification round is forbidden to
do (no git operations at all). Discrimination cannot be re-established this round;
the earlier signed rounds carry that judgment.

Eleven evals (E1-E10, E14) resolve to the same command,
`pytest -q tests/test_packaging.py`. Each was executed separately — eleven runs with
their own logged run_id and timestamp — and the file was additionally run once with
`-v` to enumerate its test ids. The mapping turned out to be exactly one-to-one:
`tests/test_packaging.py` contains eleven tests, one per eval, each named after its
criterion. That is unusually clean for a shared-command eval group; the shared exit
code is not hiding an unimplemented criterion here, and each evidence block above
names the specific test that carries its criterion.

Two contextual notes for the human, neither a failure:

- This contract is T3, and it carries no judgment evals, so the T3 rule requiring a
  `human_override` on every judgment item has nothing to bind to. The Gate-2 reviewer
  still owes the contract's own Note about AC-13 a look: that criterion was added
  after Gate 1 approval, widening the approved scope, and the contract itself flags
  it for explicit mention at Gate 2. This round re-establishes that AC-13 holds; it
  does not re-approve the scope change.
- A `next dev` server belonging to another session was running during E12. The build
  and typecheck both completed clean, so nothing was affected, but the earlier
  feature in this same re-verification wave did hit a real `.next` race under
  concurrency — worth knowing if a later round produces a surprising build result.

## Variance

none — every multi-run eval is uniform (all evals here are deterministic, runs: 1)

## Iterations

Round 1 (re-verification after upstream code change)

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line (none in this report — no judgment evals)
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (this contract is T3 but declares no judgment evals — nothing to fill)
- [ ] Re-read the contract Note on AC-13: it was added after Gate 1 and widens the
      approved scope, and the contract asks for that to be raised here explicitly
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (n/a — verdict is PASS)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
