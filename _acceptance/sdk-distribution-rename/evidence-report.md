---
schema_version: 2
feature_slug: sdk-distribution-rename
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4b1d0d3bb03735af271c50c344aff5e1c431db40
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

Round 4 (this round) re-ran every eval on the current tree — a **full** re-verify,
with nothing carried forward from round 3, because this feature owns
`sdk/tests/test_packaging.py` and that file changed in commit 4b1d0d3.

E1–E10 and E14 share one invocation of
`config:executors.test.sdk_pytest_packaging`; the resolved command was run
verbatim for the recorded exit status and again with `-v` (a reporter flag, so
selection and outcome are unchanged) purely to make the test names visible. Each
block below names the specific test that covers its criterion, taken from that
`-v` listing, and every one of the eleven is individually PASSED — **no eval is
credited to the shared exit status alone.** Each test's docstring names its AC,
and I re-extracted those docstrings from `sdk/tests/test_packaging.py` this round
rather than trusting the function names or the earlier rounds' mapping: the
eleven tests carry AC-1 through AC-10 and AC-13, one apiece, which is exactly the
eleven evals credited here. The mapping survived the round-4 edit — that commit
touched only the module's import preamble, not any test body or docstring.

- eval: E1
  run_id: sdk-distribution-rename-r4-E1-20260726040114
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_distribution_name_is_oneflow_sdk PASSED
    docstring "AC-1"; asserts pyproject project.name == "oneflow-sdk"

- eval: E2
  run_id: sdk-distribution-rename-r4-E2-20260726040114
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_import_package_is_untouched PASSED
    docstring "AC-2 — suppression half of option C"; asserts "tongflow*" still in
    packages.find.include and sdk/tongflow/ is a dir

- eval: E3
  run_id: sdk-distribution-rename-r4-E3-20260726040114
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_import_still_works_and_exposes_the_public_api PASSED
    docstring "AC-3 — the name 82 Python files depend on"; asserts
    tongflow.__name__ == "tongflow" and run_workflow / progress / deploy present

- eval: E4
  run_id: sdk-distribution-rename-r4-E4-20260726040114
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_version_is_declared_once_in_effect PASSED
    docstring "AC-4 — CLAUDE.md calls this drift a recurring bug"; asserts
    pyproject project.version == tongflow.__version__

- eval: E5
  run_id: sdk-distribution-rename-r4-E5-20260726040114
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_project_urls_do_not_point_at_upstream PASSED
    docstring "AC-5 — suppression half"; asserts no project.urls value contains
    "tong-io" or "tongflow.com"

- eval: E6
  run_id: sdk-distribution-rename-r4-E6-20260726040114
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_publish_script_uses_normalised_artifact_names PASSED
    docstring "AC-6"; asserts the script names oneflow_sdk.egg-info and
    dist/oneflow_sdk-${VER}-py3-none-any.whl

- eval: E7
  run_id: sdk-distribution-rename-r4-E7-20260726040114
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_publish_script_tells_operators_the_right_package PASSED
    docstring "AC-7, both halves"; asserts "pip install oneflow-sdk==${VER}"
    present and the old-name form absent

- eval: E8
  run_id: sdk-distribution-rename-r4-E8-20260726040114
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_author_facing_docs_name_the_distribution PASSED
    docstring "AC-8"; asserts CLAUDE.md, docs/plugins.md and sdk/README.md each
    name oneflow-sdk

- eval: E9
  run_id: sdk-distribution-rename-r4-E9-20260726040114
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_npm_publish_script_renamed_and_no_dangling_references PASSED
    docstring "AC-9, both halves"; asserts package.json has "sdk:publish" and no
    tracked file keeps the old script name

- eval: E10
  run_id: sdk-distribution-rename-r4-E10-20260726040114
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_no_surviving_distribution_name_usage PASSED
    docstring "AC-10 — suppression half, repo-wide sweep"; the sweep for the four
    stale distribution patterns returns no offenders

- eval: E14
  run_id: sdk-distribution-rename-r4-E14-20260726040114
  exit_code: 0
  baseline: red — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest_packaging
  verified_at: 2026-07-26T04:01:14Z
  output: |
    ...........                                                              [100%]
    11 passed in 4.06s
    covering test (from the -v listing of the same file):
    tests/test_packaging.py::test_engine_installs_the_distribution_from_a_single_source PASSED
    docstring "AC-13, both halves"; asserts tongflow.__distribution__ == pyproject
    project.name and engine/plugins.py holds no hard-coded "tongflow=={version}"
    install string

- eval: E11
  run_id: sdk-distribution-rename-r4-E11-20260726035936
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-07-26T03:59:36Z
  output: |
    ..................................................................       [100%]
    66 passed in 3.75s

- eval: E12
  run_id: sdk-distribution-rename-r4-E12-20260726040039
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-26T04:00:39Z
  output: |
      Creating an optimized production build ...
    ✓ Compiled successfully in 3.1s
      Linting and checking validity of types ...
    ✓ Generating static pages (25/25)
    ƒ  (Dynamic)  server-rendered on demand

    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

- eval: E13
  run_id: sdk-distribution-rename-r4-E13-20260726040033
  exit_code: 0
  baseline: green — round 1, carried forward; NOT re-measured this round
  verifier: config:executors.test.lint
  verified_at: 2026-07-26T04:00:33Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .

    Checked 353 files in 84ms. No fixes applied.

## Analyst

**The local interpreter is Python 3.14.3, so this round exercised the `tomllib`
stdlib branch of `sdk/tests/test_packaging.py` — NOT the `tomli` fallback that
the round-4 fix added for Python 3.10.** That is the entire subject of commit
4b1d0d3, and this run does not test it. Two independent confirmations: `python3
--version` reports 3.14.3, and `importlib.util.find_spec("tomli")` returns None,
so the backport is not even installed here — the `except ModuleNotFoundError`
arm cannot be reached on this machine. **The 3.10 path is covered by CI, not by
this run.** `.github/workflows/ci.yml` pins the SDK job to `python-version:
"3.10"` and now installs `tomli` alongside pytest; that job, not this evidence
report, is the authority on the floor the SDK declares
(`requires-python = ">=3.10"` in `sdk/pyproject.toml`, re-read this round). A
human reading this report should treat "the fallback works" as an unverified
claim here and look to CI for it.

**No A/B baseline was measured in round 4.** Every `baseline:` value above is
carried forward verbatim from round 1 and is marked as such in the field itself.
Round 1 already established which evals discriminate, the eval set is unchanged,
and the round-4 code change was confined to a test-module import preamble — so
the baseline was deliberately skipped rather than re-measured. Read those fields
as round-1 history, not as a fresh measurement.

The round-1 discrimination finding, restated (not re-measured): E2, E3, E4 are
green on both sides and do not discriminate — by design, not defect. All three
are invariant guards for the half of option C that must NOT change (import
package still selected by `packages.find.include`, `import tongflow` still
exposing its public API, version parity between `pyproject.toml` and
`__init__.py`). They would only go red if the implementation had over-reached and
renamed the import package too, so their value is as a tripwire. Every eval that
asserts the change itself — E1, E5, E6, E7, E8, E9, E10, E14 — was red on the
round-1 baseline and discriminates.

Round-4 independent spot-check, freshly performed on this tree (outside the eval
suite): from `sdk/`, `python3 -c "import tongflow; print(tongflow.__version__,
tongflow.__distribution__)"` returns `0.2.17 oneflow-sdk`, resolving `tongflow`
from `/Users/manhphan/dev/oneflow/sdk/tongflow/__init__.py`, and reading
`pyproject.toml` with `tomllib` independently gives name `oneflow-sdk` at the
same version `0.2.17`. So the two halves of option C still hold together on the
current tree: the distribution is renamed, the import package is not, and the
version is declared once in effect.

The standing checks E12 and E13 are shared with the `task-metering` and
`measure-harness` features verified in the same session; **each command was
executed exactly once against this tree and its real result recorded for every
feature that binds it, with distinct `run_id`s per feature.** Biome still checks
353 files, unchanged from round 3 — consistent with a round-4 diff that touched
only a Python test module and a CI workflow, neither of which biome counts.

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

Round 3 (2026-07-26T03:37–03:38Z, commit f9f0b18): **re-pin only, forced by the
rebase and by the coarse staleness rule — not by any code defect.** The branch
was rebased onto `main` (which now carries `task-metering` and `measure-harness`)
and re-pinning all three features in one session is what this round is. The
staleness rule compares the whole tree against `verified_commit` and cannot
distinguish "code this feature depends on changed" from "unrelated code exists",
so `pre-merge-check.sh` reported all three stale at once. **No
sdk-distribution-rename code changed**, re-derived here rather than assumed:
`git diff --name-only 8ff2d1b HEAD` with `_acceptance/` excluded lists 15 files
and every one belongs to `measure-harness` (5 under `scripts/measure/`, 6 under
`src/lib/measure/`, 4 WER `.txt` fixtures). Nothing under `sdk/`, no
`pyproject.toml`, no `publish-tongflow-pypi.sh`, no `package.json` appears in
that diff. The remedy is a re-run plus a re-pin — the SHA was never hand-edited.
All 14 evals were re-executed on this tree and all 14 are green, so the rebase
introduced no regression. `verified_commit` moves 8ff2d1b → f9f0b18; `run_id`,
`verified_at` and `output` were updated and nothing else. The verdict is
unchanged and the human signature line in frontmatter is preserved byte-for-byte
as signed.

Round 4 (2026-07-26T03:59–04:01Z, commit 4b1d0d3): **a full re-verify, and the
one round in this session where carry-forward was NOT allowed.** CI on Python
3.10 could not import `sdk/tests/test_packaging.py`, because `tomllib` is stdlib
only from 3.11 while `sdk/pyproject.toml` declares
`requires-python = ">=3.10"`; commit 4b1d0d3 adds a `tomli` fallback to that
module and installs the backport in the SDK job of `.github/workflows/ci.yml`.
Ownership was re-derived, not assumed: `git diff --name-only f9f0b18` filtered of
`_acceptance/` lists exactly two files, `.github/workflows/ci.yml` and
`sdk/tests/test_packaging.py` — and the second of those is the file every one of
this feature's eleven packaging evals executes, bound through
`config:executors.test.sdk_pytest_packaging`. **This feature's own code changed,
so nothing carries forward:** all 14 evals were re-run from scratch on this tree
and all 14 are green, and the previous Gate-2 signature does not survive the
change. The signature field in frontmatter has therefore been **cleared**, and a
human must sign again before this merges — that is the intended end state, not an
oversight. `verified_commit` moves f9f0b18 → 4b1d0d3. See `## Analyst` for the
limit of what this run proves: it exercised the stdlib branch on Python 3.14.3,
and the 3.10 fallback the fix exists for is covered by CI alone.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Note that AC-13 was added after Gate 1 — confirm the scope growth is acceptable
- [ ] Confirm you accept CI (not this local run) as the authority for the Python 3.10 `tomli` path
- [ ] Fill the signature field in frontmatter + `time_human_minutes.gate2` in contract
