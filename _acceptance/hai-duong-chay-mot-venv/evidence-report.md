---
schema_version: 2
feature_slug: hai-duong-chay-mot-venv
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b278980601a509e121f4568e3a87af7fe073c9cb
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

## Evidence

- eval: E1
  run_id: minted-hai-duong-chay-mot-venv-E1-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_venv_per_plugin
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E2
  run_id: minted-hai-duong-chay-mot-venv-E2-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_shared_removed
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E2b
  run_id: minted-hai-duong-chay-mot-venv-E2b-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_legacy_removal_failure_raises
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    1 passed in 0.02s

- eval: E3a
  run_id: minted-hai-duong-chay-mot-venv-E3a-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E14
  run_id: minted-hai-duong-chay-mot-venv-E14-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_engine_leaves_per_plugin_layout
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E3b
  run_id: minted-hai-duong-chay-mot-venv-E3b-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    Tests  1 passed | 13 skipped (14)
    Start at  06:19:08
    Duration  148ms (transform 31ms, setup 0ms, import 28ms, tests 20ms, environment 0ms)

- eval: E15
  run_id: minted-hai-duong-chay-mot-venv-E15-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_ts_keeps_per_plugin_venvs
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    Tests  1 passed | 13 skipped (14)
    Start at  06:19:08
    Duration  148ms (transform 31ms, setup 0ms, import 28ms, tests 20ms, environment 0ms)

- eval: E4
  run_id: minted-hai-duong-chay-mot-venv-E4-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_pinned
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    python:     .tongflow,plugin-venv
    typescript: .tongflow,plugin-venv
    OK: both runtimes pin the same venv root, and both still remove the legacy shared venv

- eval: E5
  run_id: minted-hai-duong-chay-mot-venv-E5-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hdc_layout_constant_teeth
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    PASS [ci-file-missing]
    PASS [call-gone-comment-stays]
    13/13 PASS

- eval: E6
  run_id: minted-hai-duong-chay-mot-venv-E6-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_checkout
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.20s

- eval: E7
  run_id: minted-hai-duong-chay-mot-venv-E7-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_sdk_from_pypi_pin
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E8
  run_id: minted-hai-duong-chay-mot-venv-E8-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_provision_failure_raises
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.23s

- eval: E9
  run_id: minted-hai-duong-chay-mot-venv-E9-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_auto_install_false_keeps_ambient
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10
  run_id: minted-hai-duong-chay-mot-venv-E10-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_interpreter_per_plugin
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10b
  run_id: minted-hai-duong-chay-mot-venv-E10b-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_runner_uses_plugin_interpreter
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E11
  run_id: minted-hai-duong-chay-mot-venv-E11-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdc_unsafe_plugin_id_rejected
  verified_at: 2026-09-09T06:20:00+07:00
  output: |
    5 passed in 0.02s

### Lệnh suite (hồi quy)

- cmd: bash scripts/acceptance/preflight-verify-env.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_acceptance_preflight_verify-r7
  exit_code: 0
  verified_at: 2026-09-09T06:20:00+07:00

- cmd: node scripts/roadmap/check-plan-freeze.mjs
  run_id: minted-hai-duong-chay-mot-venv-SUITE-node_scripts_roadmap_check_plan_freeze_m-r7
  exit_code: 0
  verified_at: 2026-09-09T06:20:00+07:00

- cmd: pnpm build && pnpm typecheck
  run_id: minted-hai-duong-chay-mot-venv-SUITE-build_typecheck-r7
  exit_code: 0
  verified_at: 2026-09-09T06:20:00+07:00

- cmd: pnpm lint:check
  run_id: minted-hai-duong-chay-mot-venv-SUITE-lint_check-r7
  exit_code: 0
  verified_at: 2026-09-09T06:20:00+07:00

- cmd: pnpm test
  run_id: minted-hai-duong-chay-mot-venv-SUITE-test-r7
  exit_code: 0
  verified_at: 2026-09-09T06:20:00+07:00

- cmd: cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?no vietnormalizer pin derived from sdk/pyproject.toml}" python -m pytest -q
  run_id: minted-hai-duong-chay-mot-venv-SUITE-scripts_lib_sdk_version_sh_pin_reader_pi-r7
  exit_code: 0
  verified_at: 2026-09-09T06:20:00+07:00

- cmd: pnpm verify:plugins
  run_id: minted-hai-duong-chay-mot-venv-SUITE-verify_plugins-r7
  exit_code: 0
  verified_at: 2026-09-09T06:20:00+07:00

- cmd: pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json
  run_id: minted-hai-duong-chay-mot-venv-SUITE-gen_abi-r7
  exit_code: 0
  verified_at: 2026-09-09T06:20:00+07:00

- cmd: bash scripts/fork/check-fork-identity.sh
  run_id: minted-hai-duong-chay-mot-venv-SUITE-bash_scripts_fork_check_fork_identity_sh-r7
  exit_code: 0
  verified_at: 2026-09-09T06:20:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round trước — baseline không đo lại round này (P2: evals.yaml không đổi từ lần đo baseline cuối). Mọi field `baseline:` ở trên ghi `n-a` vì round này không đo lại — không kết luận được eval nào không-phân-biệt ở chính round 7; kết luận không-phân-biệt gần nhất (nếu có) thuộc round baseline trước, không lặp lại ở đây.

none — không có eval nào được đo baseline ở round này để xếp vào danh sách không-phân-biệt.

## Variance

none — không có eval nào mang field runs > 1 trong vòng này; mọi eval là deterministic (0/1 hoặc 1/1).

## Iterations

Round 7: toàn bộ 16 eval máy (E1, E2, E2b, E3a, E14, E3b, E15, E4, E5, E6, E7, E8, E9, E10, E10b, E11) và toàn bộ 9 lệnh suite hồi quy đều PASS (exit 0) — nhưng review-findings vòng này lộ 2 lỗ hổng đo-chỉ-dẫn-thay-vì-đầu-ra map thẳng vào AC-4 (guard `check-venv-layout-pinned.sh` đếm chỗ gọi bằng grep văn bản, không phải hành vi thật, ở cả phía Python lẫn TypeScript) — cùng lúc round 7 đã vượt trần verify-round quy định ở CLAUDE.md (T2 tối đa 3, T3 tối đa 4) mà chưa có dòng "đây là vòng cuối" khai trước khi dispatch; verdict REJECT theo đúng quy tắc của template (vượt vòng cho phép → escalate cho người, không chạy thêm vòng đo để vá phép đo). Người quyết cần chọn: viết nợ có tên cho hai lỗ AC-4 (amendment trong contract.md, có chữ ký) rồi cho phép round tiếp theo là round CUỐI, hoặc quay lại implementation để sửa guard trước khi đo lại.
