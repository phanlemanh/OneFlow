---
slug: lat-cat-chung-minh
at: 2026-09-04T13:10:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Đường ngoại lệ chỉ có chiều đỏ. E5 chỉ đo lý do rác `tien-tay` bị F4 chặn; không ô nào đo chiều xanh — một dòng ngoại lệ hợp lệ được nhận, slug của nó vào tập cho phép của F1, và mẫu số đổi. Đây đúng là "phép thử rẻ nhất" mà opportunity.md khai cho Giả định 2. Cộng thêm AC-1 ghim `tổng 20` như hằng số trong khi §3.5 và §4 nói ngoại lệ CỘNG vào mẫu số | Owner mở một ngoại lệ `bảo-mật` thật. Guard so lý do bằng chuỗi có dấu và ký tự ★ nên dễ so trượt; hoặc quên hợp tập ngoại lệ vào tập cho phép F1; hoặc F0 đỏ vì mẫu số nay 21. Cả 13 ca răng vẫn xanh, hai cổng đều ký, và van an toàn duy nhất của luật đóng băng chỉ lộ ra là hỏng đúng lúc có sự cố bảo mật | Thêm ca răng `ngoai-le-hop-le`: chèn dòng ngoại lệ đủ ba trường lý do `bảo-mật` cho một slug đang mở ngoài kế hoạch, đòi guard thoát 0, không F1 cho slug ấy, và mẫu số tăng đúng một. AC-1 phát biểu lại: mẫu số = dòng bảng kế hoạch + dòng ngoại lệ | **fixed:** AC-1 viết lại mẫu số động, AC-5 nhận thêm nửa xanh, E1 bỏ ghim `/20`, E5 chạy cả hai chiều, ca răng `ngoai-le-hop-le` vào Task 2 (13 → 14 ca) |
| P1 | contract | AC-14 chỉ đòi cơ hội có `decision` và `decided_by`, trong khi A1 (§3.2 thiết kế) định nghĩa Cổng Đáng gồm HAI vế: gỡ tiền tố `[đề xuất]` ở U1–U8 cùng ba số G0, VÀ điền ba trường người. Vế thứ nhất — vế mang toàn bộ ngưỡng — không có phép đo nào | Owner hoặc một phiên máy điền `decision: build` + `decided_by` mà tám dòng U vẫn còn `[đề xuất]`. Guard nhận A1 ✅, A1 rời danh sách tin-theo-lời, tỉ lệ ★ tăng, mốc M1 "vạch trước số" coi như đạt — trong khi mọi ngưỡng vẫn là đề xuất. Tới B9/B10 số đo được so với một ngưỡng chưa từng ký, đúng thứ A1 sinh ra để chặn | Mở rộng AC-14 và ca răng `kiem-co-hoi` thêm ca thứ ba: cơ hội đủ ba trường người nhưng còn `[đề xuất]` trong mục Ngưỡng thì guard vẫn F2 nêu "còn ngưỡng đề xuất"; gỡ hết tiền tố mới xanh | **fixed:** AC-14 nhận vế thứ hai, E14 mở rộng, guard đọc thân file cơ hội, ca răng `kiem-co-hoi-de-xuat` vào Task 2 (14 → 15 ca) |
| P1 | evals | AC-12 hứa hai thứ (mọi phép kiểm OK VÀ guard sổ cái xanh) nhưng `paths` của E12 không chứa `scripts/roadmap/roadmap-drift.mjs`, nên carry-forward có thể bỏ qua E12 đúng lúc bộ đọc sổ cái đổi. Cùng lớp với `[dang-ky-fork-openai#F1]` | Khối kế hoạch nằm cùng file với khối ledger. Một ô Ghi chú lỡ dùng nháy ngược là roadmap-drift sinh hồ sơ ma. E12 được carry vì diff không chạm `paths` của nó, Cổng 2 ký, CI đỏ SAU khi merge — đúng lúc mọi hồ sơ khác vừa re-pin | Cho `lcm_docs` chạy thêm `roadmap-drift.mjs` trên cây thật, ghim số hồ sơ đọc được và khẳng định 0 hồ sơ ma; thêm `roadmap-drift.mjs` vào `paths` của E12 | **fixed:** E12 nhận thêm hai `paths` (roadmap-drift.mjs, check-roadmap-fresh.sh); check-plan-docs.sh ghim số sổ cái |
| P1 | evals | E12 đo chuỗi ký tự trong khi lời hứa là QUAN HỆ: grep `36` chỉ chứng minh chữ 36 có mặt, không chứng minh nó bằng số thư mục mang `status: signed-off`. E12 cũng là ô máy duy nhất không có chiều đỏ thường trực — chiều đỏ của nó là một lần chạy tay ở Task 4 | Hồ sơ thứ 37 ký xong khi B2 hay B3 hạ cánh, STATUS.md vẫn ghi 36, `check-plan-docs.sh` vẫn xanh vì nó tìm hằng số. Hoặc ai đó nới một pattern thành khớp-mọi-thứ; E12 xanh vĩnh viễn và ba tài liệu trôi lại — chính bệnh hồ sơ này sinh ra để chữa, nay có một cổng xanh chứng nhận đã chữa | Đổi phép kiểm số hồ sơ thành phép so tính-được (đếm trên cây rồi so với con số trong STATUS.md, lệch thì FAIL nêu cả hai số). Thêm `check-plan-docs-teeth.sh` với gốc cây suy từ biến ghi đè, phá bản sao ba cách và đòi mỗi ca FAIL đúng phép | **fixed:** check-plan-docs.sh đếm trên cây và so hai số; thêm `check-plan-docs-teeth.sh` 4 ca vào Task 4; eval mới E15 |
| P2 | evals | E9 ghim sai lượng: expected viết "nêu cả hai guard" trong khi §5.4 nói hằng số danh sách hiện có HAI tên và hồ sơ này thêm tên thứ ba. Cùng lớp `[hang-rao-doc-nham-loi-thanh-khong-co-gi#F2]` — hạng vừa sinh không được ghim bằng con số hậu-thay-đổi | Mode `shape` liệt kê guard từ nguồn khác nên vẫn "nêu cả hai" và E9 xanh dù hằng số chưa cập nhật. Bước Plan freeze vào CI mà guard-của-guard không canh nó, đúng điểm mù §5.4 cảnh báo | Sửa expected của E9 thành con số hậu-thay-đổi: mode `shape` phải nêu ĐỦ BA guard và in tên `check-plan-freeze.mjs`; chiều đỏ là gỡ tên khỏi hằng số thì số tụt đúng một | **fixed:** E9 expected ghim ba guard và tên mới |

## Ghi chú định đoạt

Năm finding, năm `fixed` — không finding nào đẩy sang `human-gate1`, không finding nào bị `rejected`.
Bốn cái đầu cùng một họ và đó là điều đáng mang đi: **mỗi phép đo của hồ sơ này phải có cặp
hai chiều trên cùng fixture** (khuôn MEASURE-BIRTH), và ba chỗ tôi để lọt đều là *nửa xanh* —
ngoại lệ hợp lệ được nhận, ngưỡng đã chốt được nhận, tài liệu đúng số được nhận. Guard chỉ biết
nói "sai" mà chưa từng chứng minh nó biết nói "đúng" là guard chưa xong.

Sửa xong artifact, không re-probe (one-pass). Số ca răng: 13 → 15; thêm một script răng thứ hai
cho `check-plan-docs.sh` (4 ca); evals 14 → 15 cộng J1.
