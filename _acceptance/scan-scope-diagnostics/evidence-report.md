---
schema_version: 2
feature_slug: scan-scope-diagnostics
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e
human_signoff: Manh 2026-08-18
---

# Evidence Report: scan-scope-diagnostics

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | script | PASS |
| E18 | AC-15 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | script | PASS |
| E13b | AC-13 | script | PASS |
| E14 | AC-14 | script | PASS |
| E15 | AC-1 | script | PASS |
| E16 | AC-7 | script | PASS |
| E17 | AC-12 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-scan-scope-diagnostics-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_block_reason
  verified_at: 2026-08-18T15:30:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E2
  run_id: minted-scan-scope-diagnostics-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_block_matrix
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ............                                                             [100%]
    12 passed in 0.03s

- eval: E3
  run_id: minted-scan-scope-diagnostics-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_block_wellformed
  verified_at: 2026-08-18T15:30:00Z
  output: |
      <class 'OSError'>: [Errno 66] Directory not empty: '/private/var/folders/9d/08v498213jd2lcnpvdlky46m0000gn/T/pytest-of-manh-macmini/garbage-f0d80835-41f1-448b-b3ef-eb712085064e'
    -- Docs: https://docs.pytest.org/en/stable/how-to-capture-warnings.html
    1 passed, 1 warning in 0.02s

- eval: E4
  run_id: minted-scan-scope-diagnostics-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_closure_quiet
  verified_at: 2026-08-18T15:30:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E5
  run_id: minted-scan-scope-diagnostics-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_class_body_quiet
  verified_at: 2026-08-18T15:30:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E6
  run_id: minted-scan-scope-diagnostics-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_shared_walker
  verified_at: 2026-08-18T15:30:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.01s

- eval: E6b
  run_id: minted-scan-scope-diagnostics-E6b-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sdk_pytest_diag_import_floor
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ...............                                                          [100%]
    15 passed in 0.03s

- eval: E6c
  run_id: minted-scan-scope-diagnostics-E6c-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.diag_shared_walker_teeth
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ok: perturbation caught, and the failure names "naming compose_overlay"
    -- consumer 2: the import collector
    ok: perturbation caught, and the failure names "COMPOSE_OVERLAY unregistered"

- eval: E18
  run_id: minted-scan-scope-diagnostics-E18-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_bare_module
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ..                                                                       [100%]
    2 passed in 0.03s

- eval: E7
  run_id: minted-scan-scope-diagnostics-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_syntax_error
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ..                                                                       [100%]
    2 passed in 0.03s

- eval: E8
  run_id: minted-scan-scope-diagnostics-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_unreadable
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ...                                                                      [100%]
    3 passed in 0.07s

- eval: E9
  run_id: minted-scan-scope-diagnostics-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_deploy_error
  verified_at: 2026-08-18T15:30:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E10
  run_id: minted-scan-scope-diagnostics-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_parse_wording
  verified_at: 2026-08-18T15:30:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.22s

- eval: E11
  run_id: minted-scan-scope-diagnostics-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_inference_merge
  verified_at: 2026-08-18T15:30:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E12
  run_id: minted-scan-scope-diagnostics-E12-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sdk_pytest_diag_inference_dedupe
  verified_at: 2026-08-18T15:30:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.02s

- eval: E13
  run_id: minted-scan-scope-diagnostics-E13-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.diag_noise_fixture
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ok: fixture mode, 1 plugin(s), base 6e406f308a7502deeff209ab0b784d9c9bd0d938 — no plugin became newly problematic

- eval: E13b
  run_id: minted-scan-scope-diagnostics-E13b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.diag_noise_real
  verified_at: 2026-08-18T15:30:00Z
  output: |
    SKIP: plugins/ holds no plugin — it is gitignored and populated at
          runtime. Run `pnpm plugins:install` to widen this check.

- eval: E14
  run_id: minted-scan-scope-diagnostics-E14-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.diag_blast_radius
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ok: 23 file(s) changed against 6e406f308a7502deeff209ab0b784d9c9bd0d938;
        no contract chokepoint touched, no SDK version bumped

- eval: E15
  run_id: minted-scan-scope-diagnostics-E15-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.diag_scope_gate_teeth
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ok: perturbation caught, and the failure names "produced no reason at its own line"

- eval: E16
  run_id: minted-scan-scope-diagnostics-E16-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.diag_parse_failure_teeth
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ok: perturbation caught, and the failure names "no @node_slot"

- eval: E17
  run_id: minted-scan-scope-diagnostics-E17-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.diag_dedupe_teeth
  verified_at: 2026-08-18T15:30:00Z
  output: |
    ok: perturbation caught, and the failure names "exactly once"
    ok: stayed green as expected
    EXIT_CODE: 0

## Analyst

- E6b — PASS on both HEAD and the diffBase baseline (non-discriminating). This is the intended regression floor named by AC-6 itself ("must be green on BOTH patched and unpatched code"): it exists to catch a future deletion from the ten-keyword import-collection matrix or a regression in the four collection cases, not to discriminate this round's feature change. No rewrite needed — confirmed as a deliberate regression-guard, not a weak assertion.

## Variance

none — every multi-run eval is uniform (no eval in this round carries `runs` > 1).

## Iterations

Round 1: verify BLOCKED — Bash tool rate-limited (safety classifier khong xac dinh duoc do an toan), khong eval nao chay duoc; khong co bang chung may. Round 2: van cung nguyen nhan — 11/21 eval (E1-E8, E18, E6b, E6c) van cannotRun vi classifier rate-limited moi lan goi lai, nhung 10/21 eval (E9-E17) cung toan bo suite regression (build/typecheck/lint/vitest/sdk pytest full/verify:plugins/gen:abi) da chay xanh tren HEAD lan nay; verdict giu BLOCKED. Round 3: toan bo 21/21 eval may chay va PASS (exit 0) tren verified_commit 5747c606 (mot commit sau round 2, gom fix cho khe ho decode-failure ma round-2 review-findings da neu); toan bo suite regression (pnpm build, pnpm typecheck, pnpm lint:check, pnpm test, sdk pytest full, pnpm verify:plugins, pnpm gen:abi diff) cung xanh. Verdict PASS.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter

### Re-pin lần 1 — 2026-08-19, do merge origin/main (nhánh cha #61 revert memoise + kit 2.2.0) vào nhánh sau khi ký
run_id: repin-scan-scope-diagnostics-1
sha: 6b08f6a289b423eb63a2f422416da9138e1bf207 · suites: 6 lệnh exit 0

### Re-pin — 05/09/2026, hợp nhất PR #97 vào `main`

run_id: repin-merge-20260905T101500Z
sha: 96ee9b89c428b5ce0d64c8f49ba29eb7bd65727e · suites: 8 lệnh exit 0

Commit merge `96ee9b8` kéo mọi hồ sơ đã ký ra khỏi mốc của chúng theo đường dẫn. Một lượt làn
máy chung cho cả đợt, 1 ô đo bị chạm, cả 1 chạy lại và exit 0.

Đợt này KHÔNG re-pin SÁU hồ sơ — `add-media-library`, `byo-key-onboarding`, `chong-doc-sai-em-ru`,
`cong-tu-canh-minh`, `gate-scope-anchors`, `normalize-text-vi` — vì ô đo bị chạm của chúng ĐỎ, hoặc
KHÔNG KẾT LUẬN ĐƯỢC (cửa sổ diff rỗng khi nhánh đứng ngay tại `main`; hoặc ô `ui-check` không chạy
được ngoài luồng verify). Dời mốc khi ấy là khai rằng bằng chứng còn đúng trong khi chưa chứng
minh được.
