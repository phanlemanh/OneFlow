---
schema_version: 2
feature_slug: hai-duong-chay-mot-venv
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d289e47700926fbd99b24125b7f9a426625b6483
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

## Evidence

- eval: E1
  run_id: minted-hai-duong-chay-mot-venv-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_venv_per_plugin
  verified_at: 2026-09-08T20:44:10+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E2
  run_id: minted-hai-duong-chay-mot-venv-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_shared_removed
  verified_at: 2026-09-08T20:44:12+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E2b
  run_id: minted-hai-duong-chay-mot-venv-E2b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_removal_failure_raises
  verified_at: 2026-09-08T20:44:15+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.08s

- eval: E3a
  run_id: minted-hai-duong-chay-mot-venv-E3a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-08T20:44:18+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.20s

- eval: E3b
  run_id: minted-hai-duong-chay-mot-venv-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-08T20:45:25+07:00
  output: |
    Tests  1 passed | 13 skipped (14)
    Start at  20:45:25
    Duration  114ms (transform 31ms, setup 0ms, import 29ms, tests 17ms, environment 0ms)

- eval: E4
  run_id: minted-hai-duong-chay-mot-venv-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_pinned
  verified_at: 2026-09-08T20:44:20+07:00
  output: |
    python:     .tongflow,plugin-venv
    typescript: .tongflow,plugin-venv
    OK: both runtimes pin the same venv root, and both still remove the legacy shared venv

- eval: E5
  run_id: minted-hai-duong-chay-mot-venv-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_teeth
  verified_at: 2026-09-08T20:44:22+07:00
  output: |
    PASS [python-call-dropped]
    PASS [ts-call-dropped]
    8/8 PASS

- eval: E6
  run_id: minted-hai-duong-chay-mot-venv-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_checkout
  verified_at: 2026-09-08T20:44:25+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E7
  run_id: minted-hai-duong-chay-mot-venv-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_pypi_pin
  verified_at: 2026-09-08T20:44:27+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E8
  run_id: minted-hai-duong-chay-mot-venv-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_provision_failure_raises
  verified_at: 2026-09-08T20:44:29+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E9
  run_id: minted-hai-duong-chay-mot-venv-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_auto_install_false_keeps_ambient
  verified_at: 2026-09-08T20:44:31+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10
  run_id: minted-hai-duong-chay-mot-venv-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_interpreter_per_plugin
  verified_at: 2026-09-08T20:44:33+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10b
  run_id: minted-hai-duong-chay-mot-venv-E10b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_runner_uses_plugin_interpreter
  verified_at: 2026-09-08T20:44:35+07:00
  output: |
    1 passed in 0.02s

- eval: E11
  run_id: minted-hai-duong-chay-mot-venv-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_unsafe_plugin_id_rejected
  verified_at: 2026-09-08T20:44:37+07:00
  output: |
    5 passed in 0.02s

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_acceptance_preflight_verify-r2
  exit_code: 0
  verified_at: 2026-09-08T20:44:50+07:00

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-hai-duong-chay-mot-venv-SUITE-node_scripts_roadmap_check_plan_freeze_m-r2
  exit_code: 0
  verified_at: 2026-09-08T20:44:55+07:00

- cmd: pnpm build && pnpm typecheck
  run_id: minted-hai-duong-chay-mot-venv-SUITE-build_typecheck-r2
  exit_code: 0
  verified_at: 2026-09-08T20:45:10+07:00

- cmd: pnpm lint:check
  run_id: minted-hai-duong-chay-mot-venv-SUITE-lint_check-r2
  exit_code: 0
  verified_at: 2026-09-08T20:45:20+07:00

- cmd: pnpm test
  run_id: minted-hai-duong-chay-mot-venv-SUITE-test-r2
  exit_code: 0
  verified_at: 2026-09-08T20:45:48+07:00

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-hai-duong-chay-mot-venv-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r2
  exit_code: 0
  verified_at: 2026-09-08T20:46:00+07:00

- cmd: pnpm verify:plugins
  run_id: minted-hai-duong-chay-mot-venv-SUITE-verify_plugins-r2
  exit_code: 0
  verified_at: 2026-09-08T20:46:05+07:00

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-hai-duong-chay-mot-venv-SUITE-gen_abi-r2
  exit_code: 0
  verified_at: 2026-09-08T20:46:10+07:00

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_fork_check_fork_identity_sh-r2
  exit_code: 0
  verified_at: 2026-09-08T20:46:15+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay

Non-discriminating evals: none listed this round — baseline was not re-measured (evals.yaml unchanged since the last baseline round; see line above). Suite commands green on both sides are the expected regression guards and are not listed here.

## Variance

none — every multi-run eval is uniform (no eval in this round carries `runs` > 1)

## Iterations

Round 1: review found a real implementation gap in the legacy-venv cleanup path — `shutil.rmtree(..., ignore_errors=True)` swallowed a `PermissionError` and returned as if removal had succeeded, and the unsafe-plugin-id guard used `re.match` with a trailing `$`, which (unlike the TypeScript side) accepts an id ending in a newline. Both were fixed; E2b and E11 were added as regression guards for exactly these two failure modes. Returned to implementation.
Round 2: E1–E11 all pass (14/14 test cases, deterministic, no reruns needed). Full regression suite green: build, typecheck, lint, `pnpm test` (970 passed / 5 skipped), SDK pytest (307 passed), `verify:plugins`, `gen:abi` diff-clean, fork-identity guard. Verdict PASS.