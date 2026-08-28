---
schema_version: 2
feature_slug: gate-tooling-t1
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f9783e012dc0dfbd537d0dda9dfcbd0c466aab47
human_signoff: Manh 2026-08-28
---

# Evidence Report: gate-tooling-t1

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | script | PASS |
| E13 | AC-12 | judgment | PASS |

## Evidence

- eval: E1
  run_id: gate-tooling-t1-E1-20260827T153924Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gt1_t1_escape_path
  verified_at: 2026-08-27T15:39:23Z
  output: |
    check-t1-escape-path:
      ok   anti-vacuous: guard file in the PR diff, and non-T1 in the fixture config
      ok   [half B] a guard-only PR with no acceptance artifacts trips the T1-escape backstop
      ok   [half A] the same PR carrying acceptance artifacts passes the backstop
    OK: changing a repo-authored guard is legal with acceptance artifacts and blocked without them

- eval: E2
  run_id: gate-tooling-t1-E2-20260827T153937Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_out_of_scope
  verified_at: 2026-08-27T15:39:37Z
  output: |
    CASE out-of-scope: PASS

- eval: E3
  run_id: gate-tooling-t1-E3-20260827T153938Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_announce
  verified_at: 2026-08-27T15:39:37Z
  output: |
    CASE announce: PASS

- eval: E4
  run_id: gate-tooling-t1-E4-20260827T153939Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_fork_undeclared
  verified_at: 2026-08-27T15:39:38Z
  output: |
    CASE fork-undeclared: PASS

- eval: E5
  run_id: gate-tooling-t1-E5-20260827T153940Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_fork_declared_in_union
  verified_at: 2026-08-27T15:39:39Z
  output: |
    CASE fork-declared-in-union: PASS

- eval: E6
  run_id: gate-tooling-t1-E6-20260827T153957Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gt1_all_scoping_cases
  verified_at: 2026-08-27T15:39:40Z
  output: |
    check-scoping-all-cases:
      ok   anti-vacuous: 17 cases, and config.yaml wires the same number
      ok   suppression
      ok   announce
      ok   fork-undeclared
      ok   fork-declared-in-union
      ok   undeclared
      ok   mutation
      ok   case-completeness
      ok   guard-not-exempt
      ok   no-kill-switch
    OK: all 17 cases of check-stale-scoping.sh pass

- eval: E7
  run_id: gate-tooling-t1-E7-20260827T153957Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stale_scope_undeclared
  verified_at: 2026-08-27T15:39:57Z
  output: |
    CASE undeclared: PASS

- eval: E8
  run_id: gate-tooling-t1-E8-20260827T154014Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gt1_dead_code_absent
  verified_at: 2026-08-27T15:40:14Z
  output: |
    check-golden-dead-code-absent:
      ok   anti-vacuous probes: acceptance tree present
      ok   check-stale-golden.sh absent
      ok   baseline-gate-output.txt absent
      ok   stale_scoping_golden key absent from config.yaml
    OK: all three descoped stale-golden pieces stay absent

- eval: E9
  run_id: gate-tooling-t1-E9-20260827T154018Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gt1_fork_teeth
  verified_at: 2026-08-27T15:40:14Z
  output: |
    check-fork-scope-teeth:
      ok   anti-vacuous: opening marker unique, fork block still present
      ok   [revert-narrowing] --case fork-declared-in-union red under the perturbation, green when reverted; --case fork-undeclared unaffected
      ok   [remove-fork] --case fork-undeclared red under the perturbation, green when reverted; --case fork-declared-in-union unaffected
    OK: both halves of the STALE-DIFF-SCOPE-GUARD fork are pinned by a case that goes red when it changes

- eval: E10
  run_id: gate-tooling-t1-E10-20260827T154024Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gt1_no_stale_on_empty_diff
  verified_at: 2026-08-27T15:40:18Z
  output: |
    check-no-stale-empty-diff:
      ok   anti-vacuous: gate ran, judged 21 feature(s), and examined 9 declaring feature(s)
    OK: no feature carries stale evidence when the diff is empty

- eval: E11
  run_id: gate-tooling-t1-E11-20260827T154024Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gt1_no_golden_claim
  verified_at: 2026-08-27T15:40:24Z
  output: |
    check-no-golden-claim:
      ok   anti-vacuous probes: both files present and mention the artefacts
      ok   no paragraph/record mentioning the artefacts carries a presence claim
    OK: no surviving claim that the stale-golden pieces remain on the tree

- eval: E12
  run_id: gate-tooling-t1-E12-20260827T154024Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gt1_landed_merge_repinned
  verified_at: 2026-08-27T15:40:24Z
  output: |
    check-landed-merge-repinned:
      ok   anti-vacuous probes: git repo + all 4 contracts present
      ok   conformance-l0: landed_merge 99a75ad resolves
      ok   measure-harness: landed_merge fa8ffea resolves
      ok   stale-scope-by-paths: landed_merge 84e93e1 resolves
      ok   task-metering: landed_merge f335135 resolves
    OK: all four re-pinned features carry a resolvable landed_merge

<!-- <<<JUDGMENT-BLOCK-TEMPLATE -->
- eval: E13
  judged_by: blind judge, fresh context (không nhận diff, không nhận lập luận của bên thi công, không nhận phán quyết trước)
  verdict: PASS
  rationale: |
    AC-12 hỏi liệu có chọn được một hướng CÓ LÝ DO VIẾT RA hay không, và phép đo
    đủ dứt khoát để làm nền cho lựa chọn đó. Trên cửa sổ `a788985..d919b5e` (khoảng
    hai slug này được ghim qua): 81 file gated đổi, union của chúng loại ra ĐÚNG 9
    — đúng 9 file mà câu hỏi nêu — còn 72 file kia rơi vào trong union và vẫn làm
    hai feature stale, tức lời khai `paths` tiết kiệm được KHÔNG vòng re-verify nào.
    Quét cả 33 commit first-parent trong cửa sổ: KHÔNG commit nào có toàn bộ file
    gated nằm ngoài union.
    Output của chính cổng cho thấy sự bất đối xứng: `cache-l1/l2/l3/l4` và
    `gate-scope-anchors` in `suppressed 157 / 104 / 103 whole-tree change(s)`, còn
    dòng NOTE của `measure-harness` và `task-metering` KHÔNG mang con số suppressed
    nào.
    Union cũng không phải lời khai đúng theo cả hai chiều: `biome check` trên một
    guard shell báo `Checked 0 files` (nên `scripts/**` khai THỪA mọi guard shell),
    trong khi `biome.json` không loại `sdk/`, nên eval biome thật sự đọc
    `sdk/**/*.json` mà union chưa bao giờ khai — đúng hình dạng khai THIẾU mà
    `stale-scope-by-paths` gọi là rủi ro trung tâm của thiết kế.
  recommendation: |
    BỎ KHAI. Phần rộng của union đến hoàn toàn từ ba eval thường trực (`pnpm test`,
    `pnpm build && typecheck`, `biome check .`) — ba cái này không có narrow scope
    trung thực nào. Giữ lại là giữ một lời khai sai theo cả hai chiều mà đổi lấy 0
    vòng tiết kiệm trong một tháng. THU HẸP chỉ biện minh được nếu ĐỒNG THỜI THÊM
    `sdk/**` và mã hoá tập kiểu file biome xử lý thành glob.
    Hình thức trung thực rẻ nhất: bỏ `paths` khỏi riêng ba eval thường trực, để
    AC-4 ("khai một phần" → coi như không khai) đưa cả hai feature về whole-tree,
    còn 16 eval hẹp giữ nguyên lợi ích. Cảnh báo kèm theo: một lời khai "một phần"
    đọc lên GIỐNG HỆT một backfill bỏ dở, và chạm `_acceptance/<slug>/` là mở lại
    phép soi staleness — nên sửa phải đi ké một wave đang chạy chứ không mở wave
    riêng.
  human_override:
<!-- JUDGMENT-BLOCK-TEMPLATE>>> -->

## Analyst

Không chạy baseline diffBase ở vòng này — mọi eval máy mang `baseline: n-a`, nên
không kết luận được eval nào là non-discriminating. Ghi nhận riêng: E6 xác nhận
17 case (guard tự đọc `KNOWN_CASES`, và anti-vacuous probe xác nhận
`config.yaml` khai cùng con số), trong khi văn bản AC-5 của contract nói "đủ 14
`--case`". E6 xanh theo đúng `expected` của chính nó (đọc danh sách từ guard,
không chép cứng), nhưng con số 14 trong contract đã lệch so với cây — người
duyệt Cổng 2 nên xác nhận đây là case mới thêm hợp lệ chứ không phải contract
mô tả một guard khác.

## Variance

none — không eval nào khai `runs > 1`; mọi eval máy đều tất định và chạy 1 lần.

## Iterations

Round 1: E1–E12 đều xanh ngay vòng đầu; không eval máy nào đỏ. E13 (judgment)
để chưa chấm cho judge riêng → verdict tạm PENDING-JUDGMENT.

Round 1, hợp nhất judge: blind judge (context sạch, không nhận diff/lập luận/phán
quyết trước) trả PASS cho E13 kèm phép đo trên cửa sổ `a788985..d919b5e`.
Orchestrator hợp nhất verdict đó vào khối E13 → verdict tổng PASS. Không vòng
verify thứ hai: không eval nào đỏ nên không có gì để sửa rồi chạy lại.

Round 1, phát hiện của vòng verify: AC-5 ghim con số cứng "14 case" trong khi cây
có 17 — ba case chênh (`fork-undeclared`, `fork-declared-in-union`, `undeclared`)
là do chính AC-3/AC-4/AC-6 của hồ sơ này sinh ra, không phải guard khác thế hệ
(đã đối chiếu `KNOWN_CASES` tại `14b872d`). Contract nhận một Amendment bỏ con số
cứng; nội dung khẳng định không đổi, nên báo cáo này vẫn chấm đúng thứ AC-5 hỏi.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter
