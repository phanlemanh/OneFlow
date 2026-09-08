---
schema_version: 2
feature_slug: hai-duong-chay-mot-venv
verdict: REJECT
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a5bce4a83d07dc7a2ba9176136c8c4f6de2e82b0
human_signoff: 
---

# Evidence Report: hai-duong-chay-mot-venv

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
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
  run_id: minted-hai-duong-chay-mot-venv-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_venv_per_plugin
  verified_at: 2026-09-08T13:36:12Z
  output: |
    .                                                                        [100%]
    1 passed in 0.17s

- eval: E2
  run_id: minted-hai-duong-chay-mot-venv-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_shared_removed
  verified_at: 2026-09-08T13:36:12Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E3a
  run_id: minted-hai-duong-chay-mot-venv-E3a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-08T13:36:12Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E3b
  run_id: minted-hai-duong-chay-mot-venv-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-08T13:36:12Z
  output: |
          Tests  1 passed | 13 skipped (14)
       Start at  20:23:32
       Duration  114ms (transform 27ms, setup 0ms, import 25ms, tests 17ms, environment 0ms)

- eval: E4
  run_id: minted-hai-duong-chay-mot-venv-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_pinned
  verified_at: 2026-09-08T13:36:12Z
  output: |
      python:     .tongflow,plugin-venv
      typescript: .tongflow,plugin-venv
    OK: both runtimes pin the same venv root, and both still remove the legacy shared venv

- eval: E5
  run_id: minted-hai-duong-chay-mot-venv-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_teeth
  verified_at: 2026-09-08T13:36:12Z
  output: |
    PASS [python-const-erased]
    PASS [ts-const-erased]
    6/6 PASS

- eval: E6
  run_id: minted-hai-duong-chay-mot-venv-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_checkout
  verified_at: 2026-09-08T13:36:12Z
  output: |
    1 passed in 0.02s

- eval: E7
  run_id: minted-hai-duong-chay-mot-venv-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_pypi_pin
  verified_at: 2026-09-08T13:36:12Z
  output: |
    1 passed in 0.02s

- eval: E8
  run_id: minted-hai-duong-chay-mot-venv-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_provision_failure_raises
  verified_at: 2026-09-08T13:36:12Z
  output: |
    1 passed in 0.17s

- eval: E9
  run_id: minted-hai-duong-chay-mot-venv-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_auto_install_false_keeps_ambient
  verified_at: 2026-09-08T13:36:12Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10
  run_id: minted-hai-duong-chay-mot-venv-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_interpreter_per_plugin
  verified_at: 2026-09-08T13:36:12Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10b
  run_id: minted-hai-duong-chay-mot-venv-E10b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_runner_uses_plugin_interpreter
  verified_at: 2026-09-08T13:36:12Z
  output: |
    1 passed in 0.02s

- eval: E11
  run_id: minted-hai-duong-chay-mot-venv-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_unsafe_plugin_id_rejected
  verified_at: 2026-09-08T13:36:12Z
  output: |
    ....                                                                     [100%]
    4 passed in 0.03s

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_acceptance_preflight_verify-r1
  exit_code: 0
  verified_at: 2026-09-08T13:36:12Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-hai-duong-chay-mot-venv-SUITE-node_scripts_roadmap_check_plan_freeze_m-r1
  exit_code: 0
  verified_at: 2026-09-08T13:36:12Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-hai-duong-chay-mot-venv-SUITE-build_typecheck-r1
  exit_code: 0
  verified_at: 2026-09-08T13:36:12Z

- cmd: pnpm lint:check
  run_id: minted-hai-duong-chay-mot-venv-SUITE-lint_check-r1
  exit_code: 0
  verified_at: 2026-09-08T13:36:12Z

- cmd: pnpm test
  run_id: minted-hai-duong-chay-mot-venv-SUITE-test-r1
  exit_code: 0
  verified_at: 2026-09-08T13:36:12Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-hai-duong-chay-mot-venv-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r1
  exit_code: 0
  verified_at: 2026-09-08T13:36:12Z

- cmd: pnpm verify:plugins
  run_id: minted-hai-duong-chay-mot-venv-SUITE-verify_plugins-r1
  exit_code: 0
  verified_at: 2026-09-08T13:36:12Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-hai-duong-chay-mot-venv-SUITE-gen_abi-r1
  exit_code: 0
  verified_at: 2026-09-08T13:36:12Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_fork_check_fork_identity_sh-r1
  exit_code: 0
  verified_at: 2026-09-08T13:36:12Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round trước — baseline không đo lại round này

none — không có eval nào xanh trên cả hai phía để báo cáo round này (baseline không đo lại; mọi block eval ghi baseline: n-a)

## Variance

none — không có eval multi-run nào (mọi eval đều runs=1, deterministic; không có pass_rate lệch)

## Iterations

Round 1: 13 eval (E1, E2, E3a, E3b, E4, E5, E6, E7, E8, E9, E10, E10b, E11) đều PASS (exit 0) và 9 lệnh suite hồi quy đều xanh (exit 0); không eval nào FAIL. Verdict tổng vẫn REJECT vì review đối kháng xác nhận 4 finding TRONG hợp đồng còn tồn tại trong code: AC-2 (hai finding, `sdk/tongflow/engine/plugins.py:193` — `_remove_legacy_shared_venv` dùng `shutil.rmtree(root, ignore_errors=True)` nên có thể im lặng để lại `pyvenv.cfg` ở gốc), AC-10 (`sdk/tongflow/engine/plugins.py:119` — `_PLUGIN_ID_RE` dùng `$` nên chấp nhận id có newline cuối mà luật TypeScript song song từ chối), AC-4 (`scripts/plugins/check-venv-layout-pinned.sh:57` — guard chỉ match tên hàm nên xoá lệnh gọi dọn venv cũ vẫn xanh). Không eval máy nào đo trúng các lỗ này (xem review-findings.md § Trong hợp đồng); máy không tự sửa, quay lại triển khai.
