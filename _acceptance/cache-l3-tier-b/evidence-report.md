---
schema_version: 2
feature_slug: cache-l3-tier-b
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 80f9702996007f13608e3d6031ada91a6a2f12d8
human_signoff:
---

# Evidence Report: cache-l3-tier-b

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
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-12 | test | PASS |
| E14 | AC-13 | script | PASS |
| E15 | AC-14 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-cache-l3-tier-b-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_mixed_warm_run
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.16s

- eval: E2
  run_id: minted-cache-l3-tier-b-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_downstream_edit_keeps_gen
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.26s

- eval: E3
  run_id: minted-cache-l3-tier-b-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_workflow_isolation
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E4
  run_id: minted-cache-l3-tier-b-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_duplicate_node_fresh
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E5
  run_id: minted-cache-l3-tier-b-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_no_workflow_id_scoped_off
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.13s

- eval: E6
  run_id: minted-cache-l3-tier-b-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_allowlists_disjoint
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.03s

- eval: E7
  run_id: minted-cache-l3-tier-b-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_workflow_scope_unconditional
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.10s

- eval: E8
  run_id: minted-cache-l3-tier-b-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_git_status_failure_is_dirty
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.32s

- eval: E9
  run_id: minted-cache-l3-tier-b-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.unit_l3_workflow_id_sentinel
  verified_at: 2026-07-30T09:15:00Z
  output: |
    Tests  1 passed | 2 skipped (3)
    Start at  15:59:07
    Duration  262ms (transform 37ms, setup 0ms, import 22ms, tests 136ms, environment 0ms)

- eval: E10
  run_id: minted-cache-l3-tier-b-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_bridge_workflow_id
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.19s

- eval: E11
  run_id: minted-cache-l3-tier-b-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_l1_l2_evals_on_new_tree
  verified_at: 2026-07-30T09:15:00Z
  output: |
    ....................                                                     [100%]
    20 passed in 0.37s

- eval: E12
  run_id: minted-cache-l3-tier-b-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_tenant_in_tier_b_key
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E13
  run_id: minted-cache-l3-tier-b-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_l2_full_rerun
  verified_at: 2026-07-30T09:15:00Z
  output: |
    Tests  3 passed (3)
    Start at  15:59:22
    Duration  348ms (transform 85ms, setup 0ms, import 45ms, tests 198ms, environment 0ms)

- eval: E14
  run_id: minted-cache-l3-tier-b-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_conformance_l0_full_rerun
  verified_at: 2026-07-30T09:15:00Z
  output: |
    OK: the conformance suite discriminates on all three perturbation kinds
    OK: TypeScript install -> Python scan preserved pluginRev 5419fbba4c1bd525be60028fdc7201345d1db009

- eval: E15
  run_id: minted-cache-l3-tier-b-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_l3_batch_duplicate_variants
  verified_at: 2026-07-30T09:15:00Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

## Analyst

E9 (AC-9, nửa TS của cặp E9/E10) — pass trên cả HEAD lẫn baseline diffBase, nên tự thân không phân biệt được feature mới: `engineOptionsFor` với `workflow_id`/`null` đã đúng shape cả trước khi tier-B được thêm. Nên viết lại assertion để ép cụ thể hành vi workflow_id mới liên quan tier-B, hoặc xác nhận đây là regression-guard có chủ ý (guard giữ hành vi cũ không đổi) và giữ nguyên.

**Định đoạt (main loop):** giữ nguyên có chủ ý — E9 là regression-guard cho sentinel shape (hành vi `engineOptionsFor` có từ L2, nên pass trên baseline là kỳ vọng). Guard PHÂN BIỆT cho wiring AC-9 không phải E9 mà là type system: fix I1 của final review làm `workflowId` thành tham số bắt buộc của `executeWorkflowViaEngine` — xoá wiring ở bất kỳ hop nào là lỗi compile (đã chứng minh TS2554/TS2345 trong `.superpowers/sdd/final-review-fix-report.md`), và `pnpm typecheck` nằm trong suite commands của chính round này. Nửa hành-vi của AC-9 do E10 (backend-effect qua bridge) đảm nhiệm.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: all 15 evals (E1-E15) passed on first run; suite reruns (pnpm build/typecheck/lint/test, full sdk pytest, verify:plugins, gen:abi diff-check) also green — no return to implementation needed.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
