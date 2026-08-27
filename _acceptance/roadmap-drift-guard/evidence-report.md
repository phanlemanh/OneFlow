---
schema_version: 2
feature_slug: roadmap-drift-guard
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 91f0f254c05b89a381b51764bddbcb41ca61623b
human_signoff:
---

# Evidence Report: roadmap-drift-guard

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: roadmap-drift-guard-e1-20260827T085705Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_adr_uncited
  verified_at: 2026-08-27T08:57:05Z
  output: |
    → răng: case adr-uncited
      ✓ CASE adr-uncited: PASS

- eval: E2
  run_id: roadmap-drift-guard-E2-20260827T085735Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_superseded_bare
  verified_at: 2026-08-27T08:57:35Z
  output: |
    → răng: case superseded-bare
      ✓ CASE superseded-bare: PASS

- eval: E3
  run_id: roadmap-drift-guard-E3-20260827T085735Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_superseded_paired
  verified_at: 2026-08-27T08:57:36Z
  output: |
    → răng: case superseded-paired
      ✓ CASE superseded-paired: PASS

- eval: E4
  run_id: roadmap-drift-guard-E4-20260827T085736Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_missing
  verified_at: 2026-08-27T08:57:36Z
  output: |
    → răng: case ledger-missing
      ✓ CASE ledger-missing: PASS

- eval: E5
  run_id: roadmap-drift-guard-E5-20260827T085736Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_stale
  verified_at: 2026-08-27T08:57:36Z
  output: |
    → răng: case ledger-stale
      ✓ CASE ledger-stale: PASS

- eval: E6
  run_id: roadmap-drift-guard-E6-20260827T085736Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_historical
  verified_at: 2026-08-27T08:57:36Z
  output: |
    → răng: case historical-244cb0b
      ✓ CASE historical-244cb0b: PASS

- eval: E7
  run_id: roadmap-drift-guard-E7-20260827T085750Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_case_isolation
  verified_at: 2026-08-27T08:57:52Z
  output: |
    → răng: case case-isolation
      ✓ CASE case-isolation: PASS
    # Nửa (b) của AC-7 được người kiểm chạy TAY, không tin lời harness tự khai:
    #   bash scripts/roadmap/check-roadmap-guard-teeth.sh --case khong-ton-tai
    # → dừng với mã thoát khác 0 (từ chối ồn ào), stderr in:
    #   check-roadmap-guard-teeth: case lạ `khong-ton-tai`
    #   case hợp lệ: clean historical-244cb0b ledger-missing ledger-stale
    #                ledger-paired adr-uncited superseded-bare superseded-paired
    #                supersede-source-single case-isolation
    # Hai biến thể khác cũng bị từ chối ồn ào cùng cách: `--case` không tên, và
    # tham số lạ `--bogus`. Không đường nào lặng lẽ thoát 0.

- eval: E8
  run_id: roadmap-drift-guard-E8-20260827T085752Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_drift_green
  verified_at: 2026-08-27T08:57:52Z
  output: |
    → kiểm tra trôi giữa docs/roadmap.md, docs/adr/ và _acceptance/
       sổ cái: 21 hạng mục đã ký, 21 dòng trong sổ
    ✅ docs/roadmap.md khớp với docs/adr/ và _acceptance/ — không có trôi.
    # hai số trong dòng đếm BẰNG NHAU (21 = 21), đúng như `expected` đòi.

- eval: E9
  run_id: roadmap-drift-guard-E9-20260827T085752Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_supersede_source_single
  verified_at: 2026-08-27T08:57:52Z
  output: |
    → răng: case supersede-source-single
      ✓ CASE supersede-source-single: PASS

- eval: E10
  run_id: roadmap-drift-guard-E10-20260827T085752Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_alias_cited_true
  verified_at: 2026-08-27T08:57:52Z
  output: |
    → kiểm mọi lệnh `pnpm roadmap:*` được viện dẫn đều có thật
       ✓ pnpm roadmap:check → bash scripts/roadmap/check-roadmap-fresh.sh  (viện dẫn ở 3 chỗ)
       ✓ pnpm roadmap:check-alias → bash scripts/roadmap/check-roadmap-alias-cited.sh  (viện dẫn ở 1 chỗ)
       ✓ pnpm roadmap:teeth → bash scripts/roadmap/check-roadmap-guard-teeth.sh  (viện dẫn ở 2 chỗ)
    ✅ 3 lệnh được viện dẫn, tất cả đều có thật.

- eval: E11
  run_id: roadmap-drift-guard-E11-20260827T085752Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_paired
  verified_at: 2026-08-27T08:57:52Z
  output: |
    → răng: case ledger-paired
      ✓ CASE ledger-paired: PASS

## Analyst

Không chạy nhánh baseline (diffBase) trong vòng này — mọi eval mang `baseline: n-a`,
nên không kết luận được eval nào là "xanh trên cả hai cây". Đối trọng đọc được từ
chính bộ răng: bảy case ĐỎ (E1/E2/E4/E5/E6/E9 + nửa đỏ bên trong E3) chỉ đạt khi
guard nổ trên cây đã bị nhiễu, còn E8/E3/E11 chỉ đạt khi guard im trên cây sạch —
hai chiều này không thể cùng thoả bởi một guard hằng số, nên bộ eval tự nó phân biệt
được. Điểm yếu còn lại: các case chỉ khẳng định ĐỎ/XANH (`>/dev/null`), không khẳng
định nội dung thông điệp. Người kiểm đã tự dựng nhiễu trên bản sao vứt đi ngoài cây
làm việc để đối chiếu phần `expected` nói về nội dung:
  - kiểm A in id kèm tiêu đề: `[A/adr-coverage] ADR-0099 không được nhắc lần nào
    trong docs/roadmap.md — "ADR-0011: Máy của người dùng là nền thực thi mặc định;
    managed cloud là tier"`.
  - kiểm B in id cũ, id thay thế, và trích 110 ký tự: `[B/superseded-citation] viện
    dẫn ADR-0005 (đã bị ADR-0011 thay thế) mà không nhắc ADR thay nó: "Lộ trình này
    được viết 07/2026 dưới giả định *managed cloud là mặc định* ([ADR-0005](adr/0005-
    managed-cloud-de…"`.

## Variance

none — không eval nào khai `runs > 1`; toàn bộ 11 eval là script tất định, mỗi eval
chạy đúng một lần.

## Iterations

Round 1: cả 11 eval đạt ngay vòng đầu; không trả về thi công.

## Known limits

- Bộ răng chỉ khẳng định guard ĐỎ hay XANH, không khẳng định chuỗi thông điệp. Phần
  "in id + tiêu đề" (AC-1) và "trích 110 ký tự" (AC-2) được người kiểm đối chiếu tay
  trong vòng này (xem `## Analyst`), chứ KHÔNG có eval nào giữ chúng lại. Một bản sửa
  sau làm nghèo thông điệp đi vẫn giữ được cả 11 eval xanh.
- `baseline` của cả 11 eval là `n-a`: vòng này không chạy đối chứng trên diffBase.
- AC-7 được đọc là "mỗi case có một lần gọi riêng với mã thoát riêng", không phải
  "mỗi case một giá trị số khác nhau" — mọi case đạt đều dừng ở mã 0, phân biệt nhau
  bằng token nhãn `CASE <tên>: PASS`. Nếu Cổng 1 định nghĩa AC-7 theo nghĩa số học
  thì cách đọc này cần người xác nhận.
- E6 phụ thuộc vào việc `git show 244cb0b:docs/roadmap.md` còn phân giải được trong
  checkout — một clone nông (shallow) sẽ làm eval này không chạy được chứ không phải
  hỏng.

## Ngoài hợp đồng

- `pnpm roadmap:check` được chạy thêm ngoài bộ eval để đối chiếu nửa "alias phân giải
  và CHẠY" của AC-10 (E10 chỉ đọc khai báo trong `package.json` + sự tồn tại của file
  script, không thực thi qua pnpm). Alias phân giải và chạy tới cùng kết quả xanh.
  Đây là quan sát bổ sung, không phải một eval.
- `--list`, `--case` thiếu tên, và một tham số lạ đều được thử thêm; cả ba đều bị từ
  chối ồn ào hoặc trả về danh sách case. Nằm ngoài `expected` của E7 (vốn chỉ đòi
  nửa "tên case không tồn tại").

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line  (không có judgment item trong bộ này)
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each  (hợp đồng này là T2 — không áp dụng)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS  (không áp dụng)
- [ ] Fill `human_signoff` in frontmatter
