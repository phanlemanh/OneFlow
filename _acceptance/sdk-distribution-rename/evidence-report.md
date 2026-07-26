---
schema_version: 2
feature_slug: sdk-distribution-rename
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 12e7afdb4294a6e8f21ee8d73d8e854d62ceba36
human_signoff:
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
| E14 | AC-13 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: sdk-distribution-rename-E1-20260726001505
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:10Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_distribution_name_is_oneflow_sdk PASSED
    asserts pyproject project.name == "oneflow-sdk"

- eval: E2
  run_id: sdk-distribution-rename-E2-20260726001510
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_import_package_is_untouched PASSED
    asserts "tongflow*" still in packages.find.include and sdk/tongflow/ is a dir

- eval: E3
  run_id: sdk-distribution-rename-E3-20260726001514
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:19Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_import_still_works_and_exposes_the_public_api PASSED
    asserts tongflow.__name__ == "tongflow" and run_workflow / progress / deploy present

- eval: E4
  run_id: sdk-distribution-rename-E4-20260726001519
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:22Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_version_is_declared_once_in_effect PASSED
    asserts pyproject project.version == tongflow.__version__ (both 0.2.17)

- eval: E5
  run_id: sdk-distribution-rename-E5-20260726001522
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:26Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_project_urls_do_not_point_at_upstream PASSED
    asserts no project.urls value contains "tong-io" or "tongflow.com"

- eval: E6
  run_id: sdk-distribution-rename-E6-20260726001526
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:31Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_publish_script_uses_normalised_artifact_names PASSED
    asserts the script names oneflow_sdk.egg-info and dist/oneflow_sdk-${VER}-py3-none-any.whl

- eval: E7
  run_id: sdk-distribution-rename-E7-20260726001531
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:34Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_publish_script_tells_operators_the_right_package PASSED
    asserts "pip install oneflow-sdk==${VER}" present and the old-name form absent

- eval: E8
  run_id: sdk-distribution-rename-E8-20260726001534
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:38Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_author_facing_docs_name_the_distribution PASSED
    asserts CLAUDE.md, docs/plugins.md and sdk/README.md each name oneflow-sdk

- eval: E9
  run_id: sdk-distribution-rename-E9-20260726001538
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:43Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_npm_publish_script_renamed_and_no_dangling_references PASSED
    asserts package.json has "sdk:publish" and no tracked file keeps the old script name

- eval: E10
  run_id: sdk-distribution-rename-E10-20260726001543
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:46Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_no_surviving_distribution_name_usage PASSED
    repo-wide sweep for the four stale distribution patterns returns no offenders

- eval: E14
  run_id: sdk-distribution-rename-E14-20260726001546
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T00:15:51Z
  output: |
    ...........                                                              [100%]
    11 passed in 5.17s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_engine_installs_the_distribution_from_a_single_source PASSED
    asserts tongflow.__distribution__ == pyproject project.name and engine/plugins.py
    holds no hard-coded "tongflow=={version}" install string

- eval: E11
  run_id: sdk-distribution-rename-E11-20260726001602
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-07-26T00:16:09Z
  output: |
    ..................................................................       [100%]
    66 passed in 6.69s

- eval: E12
  run_id: sdk-distribution-rename-E12-20260726001620
  exit_code: 0
  baseline: green
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-26T00:16:46Z
  output: |
      Creating an optimized production build ...
    ✓ Compiled successfully in 4.1s
      Generating static pages (25/25)
    ƒ  (Dynamic)  server-rendered on demand

    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E13
  run_id: sdk-distribution-rename-E13-20260726001614
  exit_code: 0
  baseline: green
  verifier: config:executors.test.lint
  verified_at: 2026-07-26T00:16:14Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .

    Checked 338 files in 117ms. No fixes applied.

## Analyst

E2, E3, E4 are green on both sides — they do not discriminate. This is by design,
not a defect: all three are invariant guards for the half of option C that must NOT
change (import package still selected by `packages.find.include`, `import tongflow`
still exposing its public API, version parity between `pyproject.toml` and
`__init__.py`). They would only go red if the implementation had over-reached and
renamed the import package too, so their value is as a tripwire, not as proof the
change happened. Every eval that asserts the change itself — E1, E5, E6, E7, E8,
E9, E10, E14 — is red on baseline and discriminates.

Independent spot-check outside the eval suite: from `sdk/`,
`python3 -c "import tongflow; print(tongflow.__version__, tongflow.__distribution__)"`
returns `0.2.17 oneflow-sdk`, resolving `tongflow` from
`/Users/manhphan/dev/oneflow/sdk/tongflow/__init__.py`. The contract's claim that the
import package still works is independently confirmed.

## Variance

none — no eval declares runs > 1

## Iterations

Round 1: all evals green.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Note that AC-13 was added after Gate 1 — confirm the scope growth is acceptable
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
