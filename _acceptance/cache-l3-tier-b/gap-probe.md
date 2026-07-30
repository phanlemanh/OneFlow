---
slug: cache-l3-tier-b
at: 2026-07-30T12:30:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

# Phản biện context sạch — cache-l3-tier-b

Critic context-sạch (opus), chỉ đọc 4 artifact, cấm đọc code. Cap 5 finding. Cả 5 đều được nhận và sửa artifact ngay (one-pass, không re-probe).

## Bốn cross-check

| Cross-check | Kết quả |
|---|---|
| AC không có eval? | Không (cả chiều ngược — không eval mồ côi) |
| AC không đo được như viết? | **Hai** — AC-10 hứa "mọi eval L1, L2" mà E11 chỉ chạy vectors; AC-6 tự-xác-nhận literal → finding 2, 4 |
| Trục Coverage không có AC? | **Hai** — "khác tenant" uỷ thác cho AC-9 của L2 (chỉ đo tầng A); "batch tầng B" waiver dựa trên fan-out viết cho tầng tất định → finding 1, 3 |
| Cross-layer thiếu tag / chỉ eval UI? | Không — AC-9 đúng đôi eval hai lớp |

## Findings và định đoạt

| Sev | Thiếu gì | Kịch bản fail | Xử lý |
|---|---|---|---|
| **P0** | Tenant chưa hề được khẳng định trong khoá TẦNG B — AC-9 của L2 viết trước khi workflowScope tồn tại | Implementation coi workflowScope là duy-nhất-toàn-cục, bỏ tenant khỏi nhánh B; T2 nhân bản workflow giữ id → nhận video T1 đã sinh; mọi eval xanh vì không eval nào biến thiên tenant trên slot B | **fixed** — AC-11 + E12; Coverage bỏ câu uỷ thác |
| **P0** | Ba chữ ký hứa, một phần ba bằng chứng — E11 chỉ chạy L1 vectors; conformance-l0 không được chạy lại ở đâu | L3 đổi cấu trúc nhánh cache làm vỡ test "ngoài allowlist" của L2 (slot gen vừa chuyển VÀO TIER_B) mà vẫn ship xanh; Cổng 2 ký ba feature trên bằng chứng một | **fixed** — AC-10 thu về L1; AC-12 (L2 full set) + AC-13 (conformance-l0 full set), ba tiêu chí ba exit code |
| P1 | Batch tầng B: gộp call_params trùng đảo kỳ vọng biến thể | Node xin 4 biến thể cùng prompt → 4 call cùng khoá → 1 sinh + 3 hit = 4 bản y hệt; AC-4 không bắt được (nó biến thiên nodeId, không biến thiên call index) | **fixed** — AC-14 + E15: ordinal vào workflowScope của call tầng B trong batch; nhất quán với quyết định nodeId-vào-khoá; giá đã nhận: đảo thứ tự item là miss |
| P1 | AC-6 so hằng với literal thiết kế = tự-xác-nhận; slot có núm bị sót lúc dẫn xuất nằm ở TIER_A sẽ được cache chéo workflow như tất định | Slot seed bị sót → tầng A treatment → sinh bất định phục vụ như "cùng input cùng output" — đúng ngữ nghĩa D3 cấm; E6 vẫn xanh | **fixed** — AC-6 thêm guard đọc ABI lúc chạy TEST: {knobbed} ⊆ TIER_B ∪ descoped, ∩ TIER_A = ∅; ABI thêm slot tương lai thành test đỏ |
| P2 | workflow_id chuỗi rỗng chỉ bị chặn phía TS; caller khác phát "" → workflowScope "wf::node:n1" dùng chung cho mọi run không-workflow | Task đơn lẻ thứ hai của node đó nhận bản sinh của run trước — đúng cái AC-5 tuyên bố phải tắt | **fixed** — AC-5/E5 lên bốn ca (vắng, None, "", whitespace); cổng khoá theo chuỗi không-rỗng đã strip |

## Ghi chú

Finding P0 thứ nhất là giá trị rõ nhất của bước này: nó chỉ ra một câu **uỷ thác coverage cho tiêu chí của feature khác** ("khác tenant đã có, không lặp") là sai khi ngữ cảnh đổi — AC-9 của L2 đo một khoá chưa có workflowScope. Uỷ thác coverage phải ghi kèm điều kiện còn-đúng.

One-pass: sửa artifact xong không re-probe; phần code còn 3 round S4.
