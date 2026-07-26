---
schema_version: 2
feature_slug: sdk-distribution-rename
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8ff2d1b8f5ba49483bd804ce1ac66a24efd8720a
human_signoff: Manh 2026-07-26
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

Round 2 (this round) re-ran every eval on the rebased tree. E1–E10 and E14 share
one invocation of `config:executors.test.sdk_pytest_packaging`; each block below
names the specific test that covers its criterion, taken from a `-v` listing of
that same file, and every one of the eleven is individually PASSED — no eval is
credited to the shared exit status alone. Each test's docstring names its AC,
which is how the eval↔test mapping was confirmed rather than assumed.

- eval: E1
  run_id: sdk-distribution-rename-r2-E1-20260726032220
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_distribution_name_is_oneflow_sdk PASSED
    docstring "AC-1"; asserts pyproject project.name == "oneflow-sdk"

- eval: E2
  run_id: sdk-distribution-rename-r2-E2-20260726032220
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_import_package_is_untouched PASSED
    docstring "AC-2 — suppression half of option C"; asserts "tongflow*" still in
    packages.find.include and sdk/tongflow/ is a dir

- eval: E3
  run_id: sdk-distribution-rename-r2-E3-20260726032220
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_import_still_works_and_exposes_the_public_api PASSED
    docstring "AC-3"; asserts tongflow.__name__ == "tongflow" and run_workflow /
    progress / deploy present

- eval: E4
  run_id: sdk-distribution-rename-r2-E4-20260726032220
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_version_is_declared_once_in_effect PASSED
    docstring "AC-4"; asserts pyproject project.version == tongflow.__version__

- eval: E5
  run_id: sdk-distribution-rename-r2-E5-20260726032220
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_project_urls_do_not_point_at_upstream PASSED
    docstring "AC-5 — suppression half"; asserts no project.urls value contains
    "tong-io" or "tongflow.com"

- eval: E6
  run_id: sdk-distribution-rename-r2-E6-20260726032220
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_publish_script_uses_normalised_artifact_names PASSED
    docstring "AC-6"; asserts the script names oneflow_sdk.egg-info and
    dist/oneflow_sdk-${VER}-py3-none-any.whl

- eval: E7
  run_id: sdk-distribution-rename-r2-E7-20260726032220
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_publish_script_tells_operators_the_right_package PASSED
    docstring "AC-7, both halves"; asserts "pip install oneflow-sdk==${VER}"
    present and the old-name form absent

- eval: E8
  run_id: sdk-distribution-rename-r2-E8-20260726032220
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_author_facing_docs_name_the_distribution PASSED
    docstring "AC-8"; asserts CLAUDE.md, docs/plugins.md and sdk/README.md each
    name oneflow-sdk

- eval: E9
  run_id: sdk-distribution-rename-r2-E9-20260726032220
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_npm_publish_script_renamed_and_no_dangling_references PASSED
    docstring "AC-9, both halves"; asserts package.json has "sdk:publish" and no
    tracked file keeps the old script name

- eval: E10
  run_id: sdk-distribution-rename-r2-E10-20260726032220
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_no_surviving_distribution_name_usage PASSED
    docstring "AC-10 — suppression half, repo-wide sweep"; the sweep for the four
    stale distribution patterns returns no offenders

- eval: E14
  run_id: sdk-distribution-rename-r2-E14-20260726032220
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T03:22:23Z
  output: |
    ...........                                                              [100%]
    11 passed in 2.92s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_engine_installs_the_distribution_from_a_single_source PASSED
    docstring "AC-13, both halves"; asserts tongflow.__distribution__ == pyproject
    project.name and engine/plugins.py holds no hard-coded "tongflow=={version}"
    install string

- eval: E11
  run_id: sdk-distribution-rename-r2-E11-20260726032245
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-07-26T03:22:49Z
  output: |
    ..................................................................       [100%]
    66 passed in 3.76s

- eval: E12
  run_id: sdk-distribution-rename-r2-E12-20260726032258
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-26T03:23:19Z
  output: |
      Creating an optimized production build ...
    ✓ Compiled successfully in 4.2s
      Linting and checking validity of types ...
    ✓ Generating static pages (25/25)
    ƒ  (Dynamic)  server-rendered on demand

    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E13
  run_id: sdk-distribution-rename-r2-E13-20260726032249
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.lint
  verified_at: 2026-07-26T03:22:49Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .

    Checked 342 files in 79ms. No fixes applied.

## Analyst

**No A/B baseline was measured in round 2.** Every `baseline:` value above is
carried forward verbatim from round 1 and is marked as such in the field itself.
Round 1 already established which evals discriminate, the eval set is unchanged,
and this round exists only to re-pin evidence to the post-rebase tree — so the
baseline was deliberately skipped rather than re-measured. Read those fields as
round-1 history, not as a fresh measurement.

The round-1 discrimination finding, restated (not re-measured): E2, E3, E4 are
green on both sides and do not discriminate — by design, not defect. All three
are invariant guards for the half of option C that must NOT change (import
package still selected by `packages.find.include`, `import tongflow` still
exposing its public API, version parity between `pyproject.toml` and
`__init__.py`). They would only go red if the implementation had over-reached and
renamed the import package too, so their value is as a tripwire. Every eval that
asserts the change itself — E1, E5, E6, E7, E8, E9, E10, E14 — was red on the
round-1 baseline and discriminates.

Round-2 independent spot-check, freshly performed on this tree (outside the eval
suite): from `sdk/`, `python3 -c "import tongflow; print(tongflow.__version__,
tongflow.__distribution__)"` returns `0.2.17 oneflow-sdk`, resolving `tongflow`
from `/Users/manhphan/dev/oneflow/sdk/tongflow/__init__.py`. The contract's claim
that the import package still works survives the rebase.

## Variance

none — no eval declares runs > 1

## Iterations

Round 1: all evals green.

Round 2 (2026-07-26): **forced by a rebase, not by any code defect.** The branch
was rebased onto `main`, which replaced the commits round-1 evidence was pinned
to; `stale_files` compares the whole tree against `verified_commit`, so the pin
died with those commits and `pre-merge-check.sh` reported the feature stale. The
remedy is a re-run plus a re-pin — the SHA was never hand-edited. All 14 evals
were re-executed on the rebased tree and all 14 are green, so the rebase
introduced no regression. `verified_commit` moves
12e7afdb4294a6e8f21ee8d73d8e854d62ceba36 → 8ff2d1b8f5ba49483bd804ce1ac66a24efd8720a.
The verdict and the human signature in frontmatter are unchanged and were
carried across untouched; only the pin and the run evidence moved.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Note that AC-13 was added after Gate 1 — confirm the scope growth is acceptable
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
