---
slug: cache-l4-eviction
at: 2026-07-31T04:55:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

# Gap-probe — cache-l4-eviction (one-pass, context sạch)

Critic fresh chỉ đọc 4 artifact (design / contract / evals / ledger). Cross-check
nền của critic: 15/15 AC có eval, 5/5 trục Coverage có AC phủ, cặp cross-layer
AC-13 khai đúng. 5 finding, tất cả **fixed** trong artifact trước Gate 1:

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract + evals | Không AC nào chứng minh sweep THỰC SỰ được gọi cuối run_workflow (auto, cả run fail) + chuỗi resolve trần param→env→default | Impl viết sweep() đúng nhưng quên call site; mọi eval sweep gọi unit-level nên 18/18 xanh, orphan generator vẫn mở trong production (cùng họ I1 của L3) | Eval tích hợp: cache vượt trần + run_workflow(auto) → stat đĩa ≤ trần sau run, success + fail; 3 nấc trần | fixed: thêm AC-16 + E19 (key sdk_pytest_l4_sweep_wired); design §4 khối "Wired, not just written" |
| P1 | contract | AC-2 vế noop ("không file nào bị xoá" khi dưới trần) mâu thuẫn AC-4 (orphan GC kể cả khi không evict) | Impl gate blob-GC sau điều kiện vượt trần → orphan sống vĩnh viễn dưới trần nhưng E3 xanh nếu fixture không có orphan; hoặc ngược lại E3 đỏ oan — hai phán quyết tuỳ fixture | Sửa AC-2 noop = "không entry và không blob-còn-tham-chiếu"; E3 fixture có sẵn 1 orphan | fixed: AC-2 + E3 + design §4 bước 4 (orphan GC vô điều kiện) |
| P1 | design + contract | Ngữ nghĩa counters khi reuse='off' không pin: block vắng hay {N,0}? | Benchmark off phát {total,0} → hàng loạt task row 0% pha loãng mẫu số SQL % partial → chỉ số G2 tụt giả tạo, E13 không có kịch bản off nên vẫn xanh | AC-11 thêm kịch bản (e): off → block vắng (NULL) | fixed: AC-11 5 kịch bản + E13 expected + design §6 |
| P2 | contract + evals | AC-12 kích hoạt đường ống TS ngủ 4 slice nhưng không cross-layer, không eval consumer; "canvas không double-apply" chỉ là rationale | Handler TS apply output ở cả node_cached lẫn node_completed (hoặc crash trên shape merged thật) — E14 engine-only xanh, lỗi chỉ lộ trên canvas sau merge | Eval TS: bơm cặp sự kiện qua đường ống → apply đúng 1 lần, không throw | fixed: AC-12 tag (cross-layer) + E20 (key unit_l4_node_cached_consumer), cặp nguyên tử với E14 |
| P2 | design + contract | AC-6 "mọi nhánh nuốt lỗi phát 1 dòng log" mâu thuẫn design "utime failure ignored"; lượng từ "mọi" không đo được | Root read-only: theo design thì verifier chấm đỏ AC-6; theo AC-6 thì mỗi hit spam 1 dòng — hai phía đều có văn bản chống lưng, tranh chấp ở verify round | Danh sách ĐÓNG 4 nhánh log + miễn trừ utime tường minh | fixed: AC-6 danh sách đóng + E8 expected + design §4 khối "Logged swallow branches" |

Không finding nào lật quyết định đã ghi trong ledger; P1-off-counters là hệ quả
chưa cân nhắc của quyết định telemetry-vào-tasks, đã pin bổ sung chứ không đảo.
