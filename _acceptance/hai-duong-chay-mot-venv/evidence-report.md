---
schema_version: 2
feature_slug: hai-duong-chay-mot-venv
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ec9849c7f61aaabaaa9df8a035e6a2d9e52b54e0
human_signoff:
---

# Evidence Report: hai-duong-chay-mot-venv

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3a | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E10b | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | script | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-12 | test | PASS |
| E16 | AC-13 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hai-duong-chay-mot-venv-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_venv_per_plugin
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E2
  run_id: minted-hai-duong-chay-mot-venv-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_shared_removed
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.24s

- eval: E2b
  run_id: minted-hai-duong-chay-mot-venv-E2b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_removal_failure_raises
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E3a
  run_id: minted-hai-duong-chay-mot-venv-E3a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E3b
  run_id: minted-hai-duong-chay-mot-venv-E3b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-09T04:45:00Z
  output: |
      Tests  1 passed | 13 skipped (14)
       Start at  04:44:43
       Duration  117ms (transform 29ms, setup 0ms, import 26ms, tests 18ms, environment 0ms)

- eval: E4
  run_id: minted-hai-duong-chay-mot-venv-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_pinned
  verified_at: 2026-09-09T04:45:00Z
  output: |
      python:     .tongflow,plugin-venv
      typescript: .tongflow,plugin-venv
    OK: both runtimes pin the same venv root, and both still remove the legacy shared venv

- eval: E5
  run_id: minted-hai-duong-chay-mot-venv-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_teeth
  verified_at: 2026-09-09T04:45:00Z
  output: |
    PASS [ci-step-dropped]
    PASS [ci-file-missing]
    12/12 PASS

- eval: E6
  run_id: minted-hai-duong-chay-mot-venv-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_checkout
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E7
  run_id: minted-hai-duong-chay-mot-venv-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_pypi_pin
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.19s

- eval: E8
  run_id: minted-hai-duong-chay-mot-venv-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_provision_failure_raises
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E9
  run_id: minted-hai-duong-chay-mot-venv-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_auto_install_false_keeps_ambient
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.07s

- eval: E10
  run_id: minted-hai-duong-chay-mot-venv-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_interpreter_per_plugin
  verified_at: 2026-09-09T04:45:00Z
  output: |

    -- Docs: https://docs.pytest.org/en/stable/how-to-capture-warnings.html
    1 passed, 1 warning in 0.19s

- eval: E10b
  run_id: minted-hai-duong-chay-mot-venv-E10b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_runner_uses_plugin_interpreter
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E11
  run_id: minted-hai-duong-chay-mot-venv-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_unsafe_plugin_id_rejected
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .....                                                                    [100%]
    5 passed in 0.03s

- eval: E12
  run_id: minted-hai-duong-chay-mot-venv-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_pinned
  verified_at: 2026-09-09T04:45:00Z
  output: |
      python:     .tongflow,plugin-venv
      typescript: .tongflow,plugin-venv
    OK: both runtimes pin the same venv root, and both still remove the legacy shared venv

- eval: E13
  run_id: minted-hai-duong-chay-mot-venv-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_teeth
  verified_at: 2026-09-09T04:45:00Z
  output: |
    PASS [ci-step-dropped]
    PASS [ci-file-missing]
    12/12 PASS

- eval: E14
  run_id: minted-hai-duong-chay-mot-venv-E14-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-09T04:45:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E15
  run_id: minted-hai-duong-chay-mot-venv-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-09T04:45:00Z
  output: |
      Tests  1 passed | 13 skipped (14)
       Start at  04:44:43
       Duration  117ms (transform 29ms, setup 0ms, import 26ms, tests 18ms, environment 0ms)

- eval: E16
  run_id: minted-hai-duong-chay-mot-venv-E16-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_teeth
  verified_at: 2026-09-09T04:45:00Z
  output: |
    PASS [ci-step-dropped]
    PASS [ci-file-missing]
    12/12 PASS

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_acceptance_preflight_verify-r4
  exit_code: 0
  verified_at: 2026-09-09T04:45:00Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-hai-duong-chay-mot-venv-SUITE-node_scripts_roadmap_check_plan_freeze_m-r4
  exit_code: 0
  verified_at: 2026-09-09T04:45:00Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-hai-duong-chay-mot-venv-SUITE-build_typecheck-r4
  exit_code: 0
  verified_at: 2026-09-09T04:45:00Z

- cmd: pnpm lint:check
  run_id: minted-hai-duong-chay-mot-venv-SUITE-lint_check-r4
  exit_code: 0
  verified_at: 2026-09-09T04:45:00Z

- cmd: pnpm test
  run_id: minted-hai-duong-chay-mot-venv-SUITE-test-r4
  exit_code: 0
  verified_at: 2026-09-09T04:45:00Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-hai-duong-chay-mot-venv-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r4
  exit_code: 0
  verified_at: 2026-09-09T04:45:00Z

- cmd: pnpm verify:plugins
  run_id: minted-hai-duong-chay-mot-venv-SUITE-verify_plugins-r4
  exit_code: 0
  verified_at: 2026-09-09T04:45:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-hai-duong-chay-mot-venv-SUITE-gen_abi-r4
  exit_code: 0
  verified_at: 2026-09-09T04:45:00Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_fork_check_fork_identity_sh-r4
  exit_code: 0
  verified_at: 2026-09-09T04:45:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay

none — round này không đo lại baseline nên không có eval nào được đánh giá không-phân-biệt.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E2b, E11 failed — legacy-venv removal swallowed a PermissionError under `ignore_errors=True` instead of raising, and the unsafe-plugin-id guard used `re.match` so a trailing newline slipped past validation. Returned to implementation.
Round 2: E14 unmeasurable — the engine-manifest test read `relative_dir` and `plugin_id` back from the same computed directory name, so a wrong id→path mapping had no way to show up as a failure; the test could not discriminate a bug from correct behaviour. Returned to implementation.
Round 3: all 19 machine evals (E1-E16, incl. sub-letters) and all 9 suite regression commands are green. Adversarial review nonetheless surfaced a HIGH, in-contract defect: AC-11's own CI-wiring guard (`scripts/plugins/check-venv-layout-pinned.sh`) exits 0 silently — prints "OK" — when `.github/workflows/ci.yml` is missing or renamed, measured directly by running the guard against a tree stripped of that file. The teeth suite's `ci-step-dropped` case only covers the run-line-changed variant, not the file-absent variant, so the gap is unguarded by any eval. Verdict REJECT for this reason even though every dispatched eval command passed; the defect is a real failure of AC-11's stated guarantee, not a measurement artifact. Fixed by commit ec9849c (adds the `ci-file-missing` teeth case and closes the file-missing skip).
Round 4 (this round — T3 max-round cap reached, this is the last permitted S4 round): all 19 machine evals (E1-E16, incl. sub-letters) and all 9 suite regression commands are still green on `ec9849c7f61aaabaaa9df8a035e6a2d9e52b54e0`, including the round-3 fix (12/12 teeth cases, `ci-file-missing` now caught). Adversarial review nonetheless surfaced three further in-contract, measured defects: (1) AC-11's CI-wiring guard (`scripts/plugins/check-venv-layout-pinned.sh:114`) still exits 0 when the two workflow steps are commented out in place rather than deleted — round 3 only closed the file-absent variant, not the step-disabled-in-text variant, and the teeth suite still has no case for it; (2) AC-9's own tests (`sdk/tests/test_plugin_venv_layout.py:246`, line 389) assert membership (`pid in py`) instead of the promised interpreter↔venv relation — measured: swapping in a completely wrong interpreter path (outside any plugin's venv) still passes both E10 and E10b; (3) AC-13's guard (`scripts/plugins/check-venv-layout-pinned.sh:84`) is negative-only (bans one exact phrase) and, measured on a copy, accepts a docstring/banner that verbatim re-describes the removed shared-venv model. Verdict REJECT — three in-contract findings survive despite every dispatched eval command exiting 0; per `_acceptance/hai-duong-chay-mot-venv/contract.md` (risk_tier T3, max 4 S4 rounds) this was the last permitted round, so these become named debt (contract amendment / Known limits) for the owner to sign at Gate 2 rather than a fifth verify round. Full detail in `review-findings.md`.
