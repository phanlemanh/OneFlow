---
slug: gate-scope-anchors
at: 2026-08-04T06:55:00Z
verdict: findings
p0: 0
p1: 3
p2: 1
claims_input: ok
---

# Phản biện context sạch — gate-scope-anchors

Critic context-sạch (input: design doc + contract + evals + ledger + corpus
bài học 10 claim). 4 finding, cả 4 được nhận và xử lý trước Cổng 1; hai cái
buộc kiểm chứng bằng git ngay tại chỗ và một cái lật ra một khẳng định SAI
trong artifact gốc (baseline của check-workflow-drift).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Đường KHÔNG-neo của guard tiêu thụ không có eval nào đo — AC-5 chỉ ghim bộ giải, không ghim guard khi ACCEPTANCE_SLUG vắng | Implementer sửa base trong guard; env vắng → range rỗng → diff rỗng → cả ba guard B1 exit 0 vĩnh viễn cho MỌI PR đang mở — fail-open đúng họ lỗi hợp đồng này diệt, mọi eval hiện có vẫn xanh | Eval riêng: fixture có vi phạm + env vắng → exit 1; helper gh-run-lib không neo phân giải đúng HEAD | fixed: thêm AC-12 + E13 (key b1_unanchored_compat, offline); trục "PR đang mở" của Coverage trỏ cả AC-12 |
| P1 | design | Backfill chưa xác minh ba hồ sơ hạ cánh bằng merge commit thật — squash commit không có ^2, own-range sẽ exit 2 và AC-11 chết ngay tại mục tiêu số 1 | Một hồ sơ hoá ra squash-merge → không điền được landed_merge hợp lệ → toàn bộ guard exit 2 → hồ sơ vẫn chặn merge | Preflight rev-parse ^2 cho cả ba sha TRƯỚC Cổng 1, ghi vào Context | fixed: đã chạy — 8477f8a (PR 17) · 4d89b58 (PR 16) · dd39da8 (PR 18) đều là merge commit thật, ghi vào Context contract; squash tương lai đi đường AC-6 fail-loud |
| P1 | evals | E12 gộp "toàn bộ guard suite ba hồ sơ" về MỘT exit code, phân biệt ca chỉ nằm trong prose [stale-scope-by-paths#F1]; đồng thời chứa guard mạng mà header không khai | Vòng verify offline → guard CI exit 2 → đỏ oan; hoặc executor né guard mạng để chạy được → E12 xanh trong khi ca repro exit-2 thật chưa từng chạy lại — Gate 2 ký trên bằng chứng khép repro không trọn | Liệt kê tường minh từng khẳng định trong expected; tách offline/online | fixed: E12 viết lại CHỈ offline với 3 khẳng định liệt kê tường minh; guard mạng thuộc E9/E11 (đã khai network); header evals cập nhật |
| P2 | contract | Baseline repro gán nhầm: check-workflow-drift chưa hề được repro đỏ — "ba guard từng exit 1" là khẳng định sai một phần ba | check-workflow-drift vốn exit 0 không cần neo → E7 xanh không chứng minh gì về guard thứ ba; Gate 1 duyệt trên niềm tin sai | Re-repro từng guard, ghi exit code thật vào Context; sửa AC-7/E7 | fixed: đã re-repro (exit 1 / exit 1 / exit 0 / B2 exit 2), Context ghi từng số; AC-7 tách "repro sống" (2 guard) khỏi "anchored-không-phá" (guard 3), khả-năng-đỏ cả ba dồn về fixture E8 |

## Ghi chú của critic (giữ nguyên)

11/11 AC trước vá đều có eval; 3 trục Coverage đều có AC; không finding nào
lật 4 quyết định trong ledger. Sau vá: 12 AC / 13 eval.
