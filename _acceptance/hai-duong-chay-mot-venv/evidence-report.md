---
schema_version: 2
feature_slug: hai-duong-chay-mot-venv
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7735f2ffbe35fdbf4837ef57df116854005d2e63
human_signoff:
---

# Evidence Report: hai-duong-chay-mot-venv

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3a | AC-3 | test | PASS |
| E14 | AC-12 | test | PASS |
| E3b | AC-3 | test | PASS |
| E15 | AC-12 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E10b | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |

Mọi lệnh máy round này exit 0 (16 eval + 9 lệnh suite hồi quy). Verdict tổng round 6 là REJECT không phải vì lệnh nào thất bại, mà vì scope-triage xác nhận một finding TRONG HỢP ĐỒNG trên AC-4 (xem `review-findings.md` mục "Trong hợp đồng"): E4/E5 đo bằng `grep -c` đếm chuỗi tên hàm chứ không phân biệt lời gọi thật với một dòng đã comment/chú thích, nên guard xanh ngay cả khi bước dọn venv đời cũ bị vô hiệu hoá — đúng lớp lỗi mà AC-4 tuyên bố đã chặn. Chi tiết đo tận tay nằm trong review-findings.md.

## Evidence

- eval: E1
  run_id: minted-hai-duong-chay-mot-venv-E1-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_venv_per_plugin
  verified_at: 2026-09-09T05:39:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E2
  run_id: minted-hai-duong-chay-mot-venv-E2-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_shared_removed
  verified_at: 2026-09-09T05:39:00Z
  output: |
    1 passed in 0.02s

- eval: E2b
  run_id: minted-hai-duong-chay-mot-venv-E2b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_removal_failure_raises
  verified_at: 2026-09-09T05:39:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E3a
  run_id: minted-hai-duong-chay-mot-venv-E3a-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-09T05:39:00Z
  output: |
    1 passed in 0.02s

- eval: E14
  run_id: minted-hai-duong-chay-mot-venv-E14-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-09T05:39:00Z
  output: |
    1 passed in 0.02s

- eval: E3b
  run_id: minted-hai-duong-chay-mot-venv-E3b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-09T05:39:00Z
  output: |
          Tests  1 passed | 13 skipped (14)
       Start at  05:38:34
       Duration  197ms (transform 73ms, setup 0ms, import 80ms, tests 27ms, environment 0ms)

- eval: E15
  run_id: minted-hai-duong-chay-mot-venv-E15-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-09T05:39:00Z
  output: |
          Tests  1 passed | 13 skipped (14)
       Start at  05:38:34
       Duration  197ms (transform 73ms, setup 0ms, import 80ms, tests 27ms, environment 0ms)

- eval: E4
  run_id: minted-hai-duong-chay-mot-venv-E4-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_pinned
  verified_at: 2026-09-09T05:39:00Z
  output: |
      python:     .tongflow,plugin-venv
      typescript: .tongflow,plugin-venv
    OK: both runtimes pin the same venv root, and both still remove the legacy shared venv

- eval: E5
  run_id: minted-hai-duong-chay-mot-venv-E5-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_teeth
  verified_at: 2026-09-09T05:39:00Z
  output: |
    PASS [ci-step-dropped]
    PASS [ci-file-missing]
    12/12 PASS

- eval: E6
  run_id: minted-hai-duong-chay-mot-venv-E6-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_checkout
  verified_at: 2026-09-09T05:39:00Z
  output: |
    1 passed in 0.02s

- eval: E7
  run_id: minted-hai-duong-chay-mot-venv-E7-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_pypi_pin
  verified_at: 2026-09-09T05:39:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E8
  run_id: minted-hai-duong-chay-mot-venv-E8-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_provision_failure_raises
  verified_at: 2026-09-09T05:39:00Z
  output: |
    1 passed in 0.21s

- eval: E9
  run_id: minted-hai-duong-chay-mot-venv-E9-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_auto_install_false_keeps_ambient
  verified_at: 2026-09-09T05:39:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10
  run_id: minted-hai-duong-chay-mot-venv-E10-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_interpreter_per_plugin
  verified_at: 2026-09-09T05:39:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10b
  run_id: minted-hai-duong-chay-mot-venv-E10b-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_runner_uses_plugin_interpreter
  verified_at: 2026-09-09T05:39:00Z
  output: |
    1 passed in 0.02s

- eval: E11
  run_id: minted-hai-duong-chay-mot-venv-E11-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_unsafe_plugin_id_rejected
  verified_at: 2026-09-09T05:39:00Z
  output: |
    .....                                                                    [100%]
    5 passed in 0.02s

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_acceptance_preflight_verify-r6
  exit_code: 0
  verified_at: 2026-09-09T05:38:00Z

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-hai-duong-chay-mot-venv-SUITE-node_scripts_roadmap_check_plan_freeze_m-r6
  exit_code: 0
  verified_at: 2026-09-09T05:38:10Z

- cmd: pnpm build && pnpm typecheck
  run_id: minted-hai-duong-chay-mot-venv-SUITE-build_typecheck-r6
  exit_code: 0
  verified_at: 2026-09-09T05:38:20Z

- cmd: pnpm lint:check
  run_id: minted-hai-duong-chay-mot-venv-SUITE-lint_check-r6
  exit_code: 0
  verified_at: 2026-09-09T05:38:30Z

- cmd: pnpm test
  run_id: minted-hai-duong-chay-mot-venv-SUITE-test-r6
  exit_code: 0
  verified_at: 2026-09-09T05:38:44Z

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-hai-duong-chay-mot-venv-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r6
  exit_code: 0
  verified_at: 2026-09-09T05:38:54Z

- cmd: pnpm verify:plugins
  run_id: minted-hai-duong-chay-mot-venv-SUITE-verify_plugins-r6
  exit_code: 0
  verified_at: 2026-09-09T05:39:04Z

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-hai-duong-chay-mot-venv-SUITE-gen_abi-r6
  exit_code: 0
  verified_at: 2026-09-09T05:39:14Z

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_fork_check_fork_identity_sh-r6
  exit_code: 0
  verified_at: 2026-09-09T05:39:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round trước — baseline không đo lại round này.

none — every feature eval is red on baseline (discriminates)

## Variance

none — không có eval runs>1 round này (mọi eval `runs: 1`, không có `pass_rate` lệch).

## Iterations

Round 6: mọi lệnh máy exit 0 (16 eval + 9 lệnh suite), nhưng scope-triage xác nhận 1 finding TRONG HỢP ĐỒNG trên AC-4 — E4/E5 đo bằng `grep -c` đếm chuỗi tên hàm, không phân biệt lời gọi thật với một dòng đã comment/chú thích (đo tận tay: comment-out `_remove_legacy_shared_venv(...)` ở Python và `removeLegacySharedVenv();` ở TypeScript đều để guard in OK/rc=0); verdict REJECT do finding này, không do lệnh nào exit khác 0. Quay lại triển khai để E4/E5 phân biệt được lời gọi thật khỏi chú thích/dòng đã vô hiệu hoá.