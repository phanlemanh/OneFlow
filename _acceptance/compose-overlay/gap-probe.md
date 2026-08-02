---
slug: compose-overlay
at: 2026-08-02T06:35:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

# Gap-probe — compose-overlay (context sạch, one-pass)

Critic fresh-context đọc đúng 4 artifact (design doc, contract, evals, ledger), không đọc code.
Cross-check: 16/16 AC có eval; 4 trục Coverage đều có AC đỡ; hai lỗ đo được + ba lỗ nhất quán.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|-----|----------|----------|---------------|----------|-------|
| P1 | evals | Eval render plugin-repo không pin/log rev plugin | Evidence xanh trên rev A, ship rev B (đổi font/Pillow) → clip thật lỗi dấu mà acceptance vẫn xanh | plugin_commit_sha vào evidence E2–E10, guard in rev, E20 đối chiếu rev deploy | fixed: evidence_required E2–E10 thêm plugin_commit_sha; header evals ghi quy tắc guard-in-rev |
| P1 | contract | AC-2 vế "ảnh vs frame video giống hệt pixel" không đo được qua codec lossy | Codec h264 mặc định → E2 đỏ vĩnh viễn, hoặc test tự nới tolerance ad-hoc → Gate G1 lỏng im lặng | Chỉ rõ điểm đo: canvas RGBA trước composite + pipeline lossless cho golden video | fixed: AC-2 viết lại 3 vế (a/b/c); E2 expected cập nhật khớp |
| P1 | evals | Ma trận 6 state chỉ được nghiệm thu 3; state-5 (error) không có eval lớp UI; state-6 vắng | Dev bỏ inline-error UI, E12a/E22/E23 vẫn xanh → Gate 2 duyệt "đạt design-of-record" khi 1/6 state chưa tồn tại | E22 capture đủ 6 state; E23 inputs đủ 6 capture; E12a assert state-5 | fixed: E22/E23/E12a + AC-12 cập nhật |
| P2 | evals | AC-11 (cross-layer) nhưng E14–E17 thiếu `layer:` (lệch quy ước với E18) | Máy verify/carry-forward phân loại sai lớp bằng chứng AC-11 | layer: backend-effect cho E14–E17 | fixed |
| P2 | evals | Header khai 24 eval (thực 27), gộp nhầm E12a/b vào họ plugin-repo, nhắc E11/E13 không tồn tại | Auditor đếm lệch → chặn oan hoặc kỳ vọng sai hành vi round-delta của E12a/b | Sửa header đúng số + đúng danh sách họ render | fixed: header 27 eval, họ render = E2..E10 |

## Ghi chú dưới ngưỡng (không chiếm slot finding)

- Lời hứa "⏱ verify TikTok insets lúc implement" (AC-6) chưa có móc evidence — sẽ trình
  ở Gate 2 như dòng human-attest trong gói (không thêm AC).
- `TONGFLOW_DEFAULT_SLOTS` khai trong design nhưng không AC nào kiểm plugin claim default
  slot — chấp nhận: registry scanner đã có cơ chế báo lỗi claim, và picker-default là
  hành vi hạ tầng plugins đã có test riêng ngoài phạm vi feature này.
