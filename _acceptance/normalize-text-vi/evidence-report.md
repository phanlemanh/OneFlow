---
schema_version: 2
feature_slug: normalize-text-vi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 673e700dbdfd2127ecae409108f1fa6a5346d42a
human_signoff: Phan Le Manh 2026-08-27
---

# Evidence Report: normalize-text-vi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1a | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6a | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9a | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10a | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10c | AC-10 | test | PASS |
| E11a | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |
| E12a | AC-12 | test | PASS |
| E12b | AC-12 | test | PASS |
| E13 | AC-13 | script | PASS |
| E18 | AC-16 | script | PASS |
| E14a | AC-13 | script | PASS |
| E14b | AC-13 | script | PASS |
| E17a | AC-14 | script | PASS |
| E17b | AC-14 | script | PASS |
| E15 | AC-15 | ui-check | PASS |
| E16 | AC-15 | judgment | PASS |

## Evidence

- eval: E1a
  run_id: minted-normalize-text-vi-E1a-r2
  exit_code: 0
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval.

- eval: E1b
  run_id: minted-normalize-text-vi-E1b-r2
  exit_code: 0
  verifier: config:executors.script.abi_python_gen_clean
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval.

- eval: E2
  run_id: minted-normalize-text-vi-E2-r21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_money
  verified_at: 2026-08-27T10:07:49Z
  output: |
    .                                                                        [100%]
    1 passed in 0.05s

- eval: E3
  run_id: minted-normalize-text-vi-E3-r21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_datetime
  verified_at: 2026-08-27T10:07:49Z
  output: |
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E4
  run_id: minted-normalize-text-vi-E4-r21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_identifiers
  verified_at: 2026-08-27T10:07:49Z
  output: |
    1 passed in 0.06s

- eval: E5
  run_id: minted-normalize-text-vi-E5-r21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_ambiguous
  verified_at: 2026-08-27T10:07:49Z
  output: |
    .                                                                        [100%]
    1 passed in 0.13s

- eval: E6a
  run_id: minted-normalize-text-vi-E6a-r21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_fail
  verified_at: 2026-08-27T10:07:49Z
  output: |
    .                                                                        [100%]
    1 passed in 0.06s

- eval: E6b
  run_id: minted-normalize-text-vi-E6b-r21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_residual_pass
  verified_at: 2026-08-27T10:07:49Z
  output: |
    1 passed in 0.07s

- eval: E7
  run_id: minted-normalize-text-vi-E7-r21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_idempotent
  verified_at: 2026-08-27T10:07:49Z
  output: |
    .                                                                        [100%]
    1 passed in 0.16s

- eval: E8
  run_id: minted-normalize-text-vi-E8-r21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sdk_pytest_normalize_edges
  verified_at: 2026-08-27T10:07:49Z
  output: |
    .                                                                        [100%]
    1 passed in 0.13s

- eval: E9a
  run_id: minted-normalize-text-vi-E9a-r6
  exit_code: 0
  verifier: config:executors.test.unit_normalize_node
  verified_at: 2026-08-26T01:27:25Z
  carried_from_round: 13
  note: carry-forward tu round 13 — delta khong cham paths cua eval.

- eval: E9b
  run_id: minted-normalize-text-vi-E9b-r14
  exit_code: 0
  verifier: config:executors.test.unit_normalize_export
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E10a
  run_id: minted-normalize-text-vi-E10a-r14
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_violation
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E10b
  run_id: minted-normalize-text-vi-E10b-r14
  exit_code: 0
  verifier: config:executors.test.unit_tts_order_compliant
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E10c
  run_id: minted-normalize-text-vi-E10c-r14
  exit_code: 0
  verifier: config:executors.test.unit_tts_family_matches_abi
  verified_at: 2026-08-26T02:18:17Z
  carried_from_round: 14
  note: carry-forward tu round 14 — delta khong cham paths cua eval.

- eval: E11a
  run_id: minted-normalize-text-vi-E11a-r16
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_node_cache_normalize
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval.

- eval: E11b
  run_id: minted-normalize-text-vi-E11b-r16
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_tier_a_allowlist
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval.

- eval: E12a
  run_id: minted-normalize-text-vi-E12a-r16
  exit_code: 0
  verifier: config:executors.test.sdk_pytest_normalize_conformance
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval.

- eval: E12b
  run_id: minted-normalize-text-vi-E12b-r16
  exit_code: 0
  verifier: config:executors.test.unit_conformance
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval.

- eval: E13
  run_id: minted-normalize-text-vi-E13-r15
  exit_code: 0
  verifier: config:executors.script.normalize_registration_synced
  verified_at: 2026-08-27T05:18:07Z
  carried_from_round: 15
  note: carry-forward tu round 15 — delta khong cham paths cua eval.

- eval: E18
  run_id: minted-normalize-text-vi-E18-r16
  exit_code: 0
  verifier: config:executors.script.measuring_instruments_refuse
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval.

- eval: E14a
  run_id: minted-normalize-text-vi-E14a-r16
  exit_code: 0
  verifier: config:executors.script.normalize_sdk_train_local
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval.

- eval: E14b
  run_id: minted-normalize-text-vi-E14b-r16
  exit_code: 0
  verifier: config:executors.script.normalize_sdk_published
  verified_at: 2026-08-27T05:53:46Z
  carried_from_round: 16
  note: carry-forward tu round 16 — delta khong cham paths cua eval.

- eval: E17a
  run_id: minted-normalize-text-vi-E17a-r21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-27T10:07:49Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.17s

- eval: E17b
  run_id: minted-normalize-text-vi-E17b-r21
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.normalize_plugin_shell
  verified_at: 2026-08-27T10:07:49Z
  output: |
    plugin_commit_sha: local-tree-not-a-repo
    ...                                                                      [100%]
    3 passed in 0.17s

- eval: E15
  run_id: minted-normalize-text-vi-E15-r15
  exit_code: 0
  verifier: config:capture.ui
  verified_at: 2026-08-27T05:18:07Z
  carried_from_round: 15
  note: carry-forward tu round 15 — delta khong cham paths cua eval; frame goc xem round 15 trong Iterations.

- eval: E16
  judged_by: panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: PASS
  carried: panel giu nguyen tu round 15 — inputs khong doi, khong cham lai; rationale xem round 15
  votes:
    - domain-correctness: PASS (r15)
    - operational-feasibility: PASS (r15)
    - spec-alignment: PASS (r15)
  human_override: Phan Le Manh 2026-08-27 — PASS. Đã tự xem hai ảnh 1280x900 và bản phóng to cạnh node (evidence/design/captures/), đặt cạnh các node sẵn có trên bảng vẽ: cùng ngôn ngữ thiết kế, hai handle đúng chỗ. Ảnh giữ nguyên từng byte từ vòng 15 (inputsHash 13fa28cc…) và đã được owner xác nhận lần đầu 26/08; chữ ký hôm nay phê chuẩn lại trên đúng bộ ảnh đó.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 16 — baseline khong do lai round nay
không có mục nào — baseline round này ghi "n-a" trên toàn bộ eval (không đo lại), nên không thể phân loại phân-biệt/không-phân-biệt round này.

## Variance

không có eval runs>1 round này — mọi eval trong round 21 là deterministic (runs=1).

## Iterations

Round 19: E2, E3, E4, E5, E6a, E6b, E7, E8, E17a, E17b re-run xanh trên cây hiện tại (baseline không đo lại — carried từ round 16); 16 eval carry-forward giữ nguyên bằng chứng vòng gốc vì delta không chạm paths của chúng; E16 (judgment) carry-forward panel PASS từ round 15, chờ human_override tại Cổng 2. Suite bổ trợ xanh toàn bộ.
Round 20: E2, E3, E4, E5, E6a, E6b, E7, E8, E17a, E17b re-run xanh trên cây hiện tại (baseline không đo lại — carried từ round 16); 16 eval carry-forward (E1a, E1b, E9a, E9b, E10a, E10b, E10c, E11a, E11b, E12a, E12b, E13, E14a, E14b, E15, E18) giữ nguyên bằng chứng vòng gốc vì delta không chạm paths của chúng — riêng verifier của E15 được sửa lại đúng `config:capture.ui` theo evals.yaml (round 19 từng chép nhầm ref của E18); E16 (judgment) carry-forward panel PASS từ round 15, chờ human_override tại Cổng 2 (hợp đồng T3, override bắt buộc trên mọi mục judgment bất kể phiếu). Suite bổ trợ (pnpm build, pnpm typecheck, pnpm lint:check, pnpm test, sdk pytest full, pnpm verify:plugins, pnpm gen:abi + git diff) xanh toàn bộ.
Round 21: E2, E3, E4, E5, E6a, E6b, E7, E8, E17a, E17b re-run xanh trên cây hiện tại sau khi mở rộng ma trận "Đ nhập nhằng" nấc hai (E6a/E6b: dấu tiền đứng trước SỐ hoặc DẤU PHẨY cũng bị từ chối như tên đường "Đ. 3/2"/"Đ. 30/4"/"Đ. 2/9", trong khi giá thật ở vị trí không nhập nhằng — "Giá 500 đ" cuối chuỗi, "Tổng 2.000 đ." cuối chuỗi, dấu gạch chéo, "ĐỒNG" đầy đủ — vẫn đọc được) và bổ sung ca địa chỉ bằng số vào corpus idempotent E7 (baseline không đo lại — carried từ round 16); 16 eval carry-forward (E1a, E1b, E9a, E9b, E10a, E10b, E10c, E11a, E11b, E12a, E12b, E13, E14a, E14b, E15, E18) giữ nguyên bằng chứng vòng gốc vì delta không chạm paths của chúng; E16 (judgment) carry-forward panel PASS từ round 15, chờ human_override tại Cổng 2 (hợp đồng T3, override bắt buộc trên mọi mục judgment bất kể phiếu). Suite bổ trợ (pnpm build, pnpm typecheck, pnpm lint:check, pnpm test, sdk pytest full, pnpm verify:plugins, pnpm gen:abi + git diff) xanh toàn bộ.

### Re-pin lần 1 — 2026-08-27, do merge main mang theo dọn dẹp gate-tooling (stale-golden) và tách hồ sơ nháp khỏi PR
run_id: repin-normalize-text-vi-20260827-a
sha: 365aef8667048d5ac986d6983081b8d0a356164a · suites: 6 lệnh exit 0

### Re-pin lần 2 — 2026-08-27, do hotfix cú pháp f-string cho Python 3.10 của CI (một dòng test, hành vi không đổi)
run_id: repin-normalize-text-vi-20260827-b
sha: 673e700dbdfd2127ecae409108f1fa6a5346d42a · suites: 6 lệnh exit 0
