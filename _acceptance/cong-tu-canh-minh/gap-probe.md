---
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — `cong-tu-canh-minh`

> 31/08/2026 · critic ngữ cảnh sạch, đọc ĐÚNG 5 artifact (design-doc, contract,
> evals, decisions, claims), **không đọc mã sản phẩm** — mã của tính năng này chưa tồn tại.

Gói này là một tính năng **về bộ kiểm**, nên bốn câu hỏi riêng đã đặt cho critic đều
xoáy vào nghịch lý *ai canh người canh*. Cả năm phát hiện đều đã **vá trong artifact,
trước khi có dòng mã nào** — không phát hiện nào bị đẩy sang Known limits.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Chỉ khẳng định MỘT chiều — mọi slug đã ký có mặt trên bản đồ. Giá trị trục "thừa mục" được Coverage khai là phủ nhưng không AC nào đo. | Một hồ sơ bị RÚT hoặc bị hạ status về draft; mục cũ nằm lại trong khối Đã giao; bộ kiểm vẫn xanh trong khi bản đồ quảng cáo một việc chưa giao. Repo đã rút một hồ sơ thật (normalize-text-vi, 26/08). | Chiều ngược: mọi mục trong khối phải trỏ tới hồ sơ signed-off; ba số bằng nhau trong MỘT khẳng định (mục trong khối === hồ sơ ký === số mermaid). Ca extra-slug + status-downgraded. | VÁ → AC-11 + E14. Kèm ràng buộc fixture cho E1: ca missing-slug phải xoá slug CÒN xuất hiện chỗ khác trong file, nếu không nó không phân biệt được "đọc trong khối" với "grep cả file". |
| P0 | evals | Ba ô CI đo NỘI DUNG khối job; không ô nào đo job có CHẠY trên PR không. Không chạm `if:` mức step, `if:` mức job, `needs:`, hay bộ lọc paths của trigger. | Cắm `if: github.ref == refs/heads/main` vào step guard. Lệnh vẫn rút ra được, vẫn thoát khác 0 trên bản phá, khối vẫn không bị làm mềm bằng or-true, vẫn đúng 6 job — cả ba ô xanh sạch trong khi guard không bao giờ chạy trên PR. Đúng nguyên trạng 0-tham-chiếu gói này sinh ra để đóng. | Chế độ `reachable`: step và job không mang `if:` nào, không sau `needs:` một job có điều kiện, `pull_request` không có paths loại trừ ba đường được canh. Chiều đỏ: bản sao cắm `if: false` phải đỏ nêu đích danh step. | VÁ → AC-13 + E16. |
| P1 | evals | E8 chỉ có khẳng định ÂM. Không ô nào chạy CHÍNH lệnh rút ra, nguyên vẹn, trên cây LÀNH. E5/E7 chạy cây lành nhưng qua khoá executor riêng, không qua chuỗi rút từ YAML. | ci.yml viết một cờ mà script không biết (hoặc gõ sai tên file). Lệnh thoát khác 0 trên bản phá ⇒ E8 PASS; E9 chỉ thấy tên script nên cũng PASS. Gói hạ cánh và job Acceptance Gate đỏ trên MỌI PR ngay lượt merge đầu. | E8 thành cặp hai chiều trên CÙNG chuỗi rút lệnh: cây lành exit 0, bản phá khác 0. Thêm ca always-red-command chứng minh ô phân biệt được "guard bắt lỗi" với "lệnh nào cũng hỏng". | VÁ → E8 mở rộng. |
| P1 | evals | AC-7 hứa hai vế; E10 chỉ đo vế đầu. Vế "năm job còn lại không đổi định nghĩa" không có phép đo — đếm job và so tên không nói gì về thân job. | Gắn `continue-on-error: true` vào job lint cho đỡ ồn, hoặc tụt phiên bản Node của unit-tests. Vẫn 6 job, vẫn đúng năm cái tên ⇒ E10 xanh; E9 chỉ soi khối acceptance-gate nên không thấy. Hợp đồng công bố không-hồi-quy trong khi một job đã bị làm mềm. | Deep-equal cây con YAML của năm job kia ở HEAD và ở merge-base, so bằng bộ phân tích YAML không so chuỗi thô; đỏ thì nêu tên job và khoá đã đổi. | VÁ → AC-7 + E10 mở rộng. |
| P1 | contract | Fail-closed chỉ bảo vệ phía bản đồ. Phía nguồn `_acceptance/*/contract.md` không bất biến nào: không tập status đóng, không xử lý hồ sơ đọc không được, không xử lý thư mục thiếu cả hai file. | Một hồ sơ mới ký có frontmatter lệch (status có nháy, hoa đầu, hoặc YAML hỏng). Bộ kiểm im lặng xếp nó vào "chưa ký": nó rơi khỏi tập cần-có-mặt và số đếm vẫn khớp ⇒ E1..E5 xanh toàn bộ trong khi bản đồ thiếu đúng hồ sơ đó. Fail-OPEN nằm ngay trong bộ kiểm được bán là fail-closed. | Liệt kê MỌI thư mục và phân loại vào bốn ô ĐÓNG; ô thứ tư (không phân loại được) là ĐỎ nêu tên thư mục. Ba ca: contract-unparsable, status-unknown, dir-empty. Số assert bằng số ô. | VÁ → AC-12 + E15, sinh trục D trong Coverage. |

## Vết để lại

- Hộp hình thái nở **4×5×2 → thêm trục D (2 giá trị)**; Core 10 → 13, tỉ lệ giữ 25%.
- AC 10 → **13**; eval 13 → **16**; executor mới **3**.
- Con số re-pin **không đổi (3)**: ba ô mới nằm trong tập tám file đã đo, không thêm file mới.
