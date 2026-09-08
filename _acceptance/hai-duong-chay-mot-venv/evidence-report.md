---
schema_version: 2
feature_slug: hai-duong-chay-mot-venv
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f49c356d24307289497d0b940178af365ec5dac3
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
| E14 | AC-12 | test | PASS |
| E15 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-hai-duong-chay-mot-venv-E1-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_venv_per_plugin
  verified_at: 2026-09-09T05:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E2
  run_id: minted-hai-duong-chay-mot-venv-E2-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_shared_removed
  verified_at: 2026-09-09T05:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E2b
  run_id: minted-hai-duong-chay-mot-venv-E2b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_removal_failure_raises
  verified_at: 2026-09-09T05:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E3a
  run_id: minted-hai-duong-chay-mot-venv-E3a-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-09T05:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E3b
  run_id: minted-hai-duong-chay-mot-venv-E3b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-09T05:15:00Z
  output: |
         Tests  1 passed | 13 skipped (14)
      Start at  05:13:36
      Duration  178ms (transform 47ms, setup 0ms, import 46ms, tests 30ms, environment 0ms)

- eval: E4
  run_id: minted-hai-duong-chay-mot-venv-E4-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_pinned
  verified_at: 2026-09-09T05:15:00Z
  output: |
      python:     .tongflow,plugin-venv
      typescript: .tongflow,plugin-venv
    OK: both runtimes pin the same venv root, and both still remove the legacy shared venv

- eval: E5
  run_id: minted-hai-duong-chay-mot-venv-E5-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_teeth
  verified_at: 2026-09-09T05:15:00Z
  output: |
    PASS [ci-step-dropped]
    PASS [ci-file-missing]
    12/12 PASS

- eval: E6
  run_id: minted-hai-duong-chay-mot-venv-E6-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_checkout
  verified_at: 2026-09-09T05:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E7
  run_id: minted-hai-duong-chay-mot-venv-E7-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_pypi_pin
  verified_at: 2026-09-09T05:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E8
  run_id: minted-hai-duong-chay-mot-venv-E8-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_provision_failure_raises
  verified_at: 2026-09-09T05:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E9
  run_id: minted-hai-duong-chay-mot-venv-E9-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_auto_install_false_keeps_ambient
  verified_at: 2026-09-09T05:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E10
  run_id: minted-hai-duong-chay-mot-venv-E10-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_interpreter_per_plugin
  verified_at: 2026-09-09T05:15:00Z
  output: |
    1 passed in 0.02s

- eval: E10b
  run_id: minted-hai-duong-chay-mot-venv-E10b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_runner_uses_plugin_interpreter
  verified_at: 2026-09-09T05:15:00Z
  output: |
    1 passed in 0.02s

- eval: E11
  run_id: minted-hai-duong-chay-mot-venv-E11-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_unsafe_plugin_id_rejected
  verified_at: 2026-09-09T05:15:00Z
  output: |
    .....                                                                    [100%]
    5 passed in 0.03s

- eval: E14
  run_id: minted-hai-duong-chay-mot-venv-E14-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-09T05:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E15
  run_id: minted-hai-duong-chay-mot-venv-E15-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-09T05:15:00Z
  output: |
         Tests  1 passed | 13 skipped (14)
      Start at  05:13:36
      Duration  178ms (transform 47ms, setup 0ms, import 46ms, tests 30ms, environment 0ms)

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_acceptance_preflight_verify-r5
  exit_code: 0
  verified_at: 2026-09-09T05:15:00Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-hai-duong-chay-mot-venv-SUITE-node_scripts_roadmap_check_plan_freeze_m-r5
  exit_code: 0
  verified_at: 2026-09-09T05:15:00Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-hai-duong-chay-mot-venv-SUITE-build_typecheck-r5
  exit_code: 0
  verified_at: 2026-09-09T05:15:00Z

- cmd: pnpm lint:check
  run_id: minted-hai-duong-chay-mot-venv-SUITE-lint_check-r5
  exit_code: 0
  verified_at: 2026-09-09T05:15:00Z

- cmd: pnpm test
  run_id: minted-hai-duong-chay-mot-venv-SUITE-test-r5
  exit_code: 0
  verified_at: 2026-09-09T05:15:00Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-hai-duong-chay-mot-venv-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r5
  exit_code: 0
  verified_at: 2026-09-09T05:15:00Z

- cmd: pnpm verify:plugins
  run_id: minted-hai-duong-chay-mot-venv-SUITE-verify_plugins-r5
  exit_code: 0
  verified_at: 2026-09-09T05:15:00Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-hai-duong-chay-mot-venv-SUITE-gen_abi-r5
  exit_code: 0
  verified_at: 2026-09-09T05:15:00Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_fork_check_fork_identity_sh-r5
  exit_code: 0
  verified_at: 2026-09-09T05:15:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay

Không có eval nào được liệt kê không-phân-biệt round này — danh sách truyền xuống rỗng, và baseline không đo lại (P2, evals.yaml không đổi tự round trước ngoài việc rút E12/E13/E16 theo quyết định thu phạm vi 09/09).

## Variance

none — every multi-run eval is uniform (không có eval nào mang `runs` > 1 vòng này)

## Iterations

Round 1: E2b, E11 failed — legacy-venv removal swallowed a PermissionError under `ignore_errors=True` instead of raising, and the unsafe-plugin-id guard used `re.match` so a trailing newline slipped past validation. Returned to implementation.
Round 2: E14 unmeasurable — the engine-manifest test read `relative_dir` and `plugin_id` back from the same computed directory name, so a wrong id→path mapping had no way to show up as a failure. Round 3: all machine evals + suite commands green; adversarial review found AC-11's own CI-wiring guard exits 0 silently when ci.yml is missing (FAIL-OPEN, same class as round 1's finding). Fixed by ec9849c.
Round 4 (T3 max-round cap reached, declared as the last permitted S4 round before dispatch): all 19 machine evals + 9 suite regressions green on `ec9849c7f61aaabaaa9df8a035e6a2d9e52b54e0`. Review nonetheless surfaced 3 further in-contract, measured defects — AC-11's guard still fail-open on a commented-out (not deleted) CI step; AC-9's own tests (`test_returns_one_interpreter_per_plugin_not_one_for_all`, `test_runner_calls_each_plugin_with_its_own_interpreter`) assert only `pid in py` (substring) instead of the interpreter↔venv equality the AC promises — measured by swapping in an interpreter entirely outside any plugin's venv and watching both evals stay green; AC-13's guard is negative-only and accepts a docstring that verbatim re-describes the removed shared-venv model. Per contract (T3, max 4 rounds) this was the last permitted round, so verdict REJECT with these as findings for the owner to resolve at Gate 2 rather than a 5th verify round.
Round 5 (this round — a RESTATE, not a new fix round; owner decision 09/09 explicitly permits it despite the round-1..4 cap already spent, on the condition that no finding raises scope again): owner descoped AC-11 and AC-13 out of the contract on 09/09 (guard code, ci.yml wiring, and the module docstrings are unchanged — only the PROMISE that they are measured was withdrawn), dropping E12/E13/E16 from evals.yaml. No product code changed since round 4 (`f49c356d24307289497d0b940178af365ec5dac3` differs from `ec9849c7f61b` only in `_acceptance/hai-duong-chay-mot-venv/contract.md` and `_acceptance/hai-duong-chay-mot-venv/evals.yaml`). All 16 remaining machine eval ids (E1, E2, E2b, E3a, E3b, E4, E5, E6, E7, E8, E9, E10, E10b, E11, E14, E15) and all 9 suite regression commands are green. The AC-9 substring-assertion gap found in round 4 (E10 / E10b assert `pid in py`, never the equality relation the AC promises) and a companion AC-10 gap (the TypeScript unsafe-id test uses bare `.toThrow()` with no message pinned, so it cannot distinguish rejection from an unrelated crash) survive unchanged in review-findings.md — measured the same way as round 4, not re-invented. Per the round-5 restate constraint ("mọi finding ngoài hợp đồng đi thẳng vào Known limits, không nâng phạm vi lần nào nữa"), no scope change is proposed here; the 4 in-contract findings become named debt for a contract.md amendment, and the owner signs at Gate 2. Verdict REJECT — every dispatched eval command passed, but in-contract measurement gaps on AC-9/AC-10 remain open going into the final restated report.
