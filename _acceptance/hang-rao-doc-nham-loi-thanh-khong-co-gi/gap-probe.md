---
slug: hang-rao-doc-nham-loi-thanh-khong-co-gi
at: 2026-09-03T08:40:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
claims_input: ok
---

# Phản biện context sạch

Một phiên tươi, chỉ được sáu tệp artifact (kèm bài học từ ba vòng trước làm input thứ
năm và `opportunity.md` làm input thứ sáu), **không** được đọc mã kho — mã chưa tồn tại.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | AC-8 khai `self_referential: true` là cờ CẢ Ô, không giới hạn phạm vi miễn trừ; E4/E9/E10 vừa mang cờ vừa khai `paths` chứa chính mã hàng rào | Vòng sau ai đó sửa `repin-eval-coverage.mjs` rồi ghim lại. Ba ô duy nhất chạy `check` trên kho thật đã được miễn, nên hàng rào không bao giờ buộc chạy lại phép đo của chính nó — đúng fail-open mà AC-4 gọi là chỗ chôn lỗi, lần này do chính vòng này tạo ra | Nói thẳng phạm vi miễn trừ trong AC-8 và nêu phép bù có tên | **fixed** — AC-8 nay khai: miễn trừ là TOÀN PHẦN và **không thu hẹp được** (thu hẹp về "chỉ khi chạm `_acceptance`" dựng lại đúng vòng tròn cho một thay đổi vào mã hàng rào); đổi lại ghi rõ hai phép bù có tên — ô vẫn chạy trong mọi lượt verify, và một thay đổi vào mã làm bằng chứng hoá ôi nên lưới staleness buộc lượt verify mới |
| P0 | evals | E9 không ghim CON SỐ nào cho hạng tự-quy-chiếu; Đường đo khai "2 ô" mà không ô đo nào khẳng định | Cài đặt in `tu-quy-chieu: 0` vì đọc sai khoá hoặc vì việc hoàn nguyên `paths` chưa xong. E9 xanh, E4 xanh, Cổng 2 ký — trong khi hạng vừa sinh không đếm được gì | E9 đòi số ≥ ngưỡng, nêu đích danh tập, và có chiều đỏ | **fixed** — E9 nay đòi hạng ấy **≥ 5**, nêu đích danh E4/E9/E10 của hồ sơ này cộng E5/E6 của `repin-khong-chay-lai-eval` sau hoàn nguyên; chiều đỏ: gỡ một dòng khai thì số giảm đúng một |
| P1 | evals | E1 chỉ đòi thoát khác 0 + tên base, KHÔNG khẳng định vế "và KHÔNG đọc tệp nào" của AC-1 | Cài đặt quét hết rồi mới dừng ở cuối: vẫn in 1674 dòng mới và 25 lỗi giả rồi exit 1 kèm tên base. E1 xanh, ngưỡng 25 → 0 chưa hề được đo | Hai khẳng định đo được trên cùng lượt chạy | **fixed** — E1 nay đòi thêm: số dòng `FAIL` bằng **0**, và KHÔNG có dòng tổng kết `dong run-log moi so ...` — tức chốt nằm TRƯỚC mọi lượt đọc tệp |
| P1 | contract | Đường đo dòng 1 tuyên một mốc mức LỚP ("số lượt đọc ngoài trong ba hàng rào phải về 0") mà Out of scope lại nói thẳng 4/9 điểm không chạm và hai hàng rào kia không sửa. Cùng lớp `[chong-mat-khoa-byo-giao-dien#F1]` — tuyên quét một lớp không có ma trận | Người duyệt Cổng 1 đọc bảng, hiểu là ba hàng rào hết chỗ đọc-nhầm, ký. Cổng 2 nhận bằng chứng phủ bốn điểm trong một tệp; năm điểm còn lại và hai hàng rào kia vẫn nguyên, không ô nào đỏ để lộ ra | Ma trận chín điểm viết trước, hoặc mốc nói đúng phạm vi | **fixed** — dòng 1 nay là "**4/9** điểm trong `repin-eval-coverage.mjs` chuyển sang từ-chối; 5 điểm GIỮ, mỗi điểm một lý do", trỏ ma trận trong design doc; và một đoạn nói thẳng rằng ngưỡng gốc của `opportunity.md` đã bị **sửa phạm vi**, không im lặng thừa kế |
| P1 | evals | Không ô nào nói dòng repin trong fixture được sinh bằng chế độ `write` của chính script — đọc như fixture viết tay theo hình dạng bộ đọc giả định | Fixture viết tay thiếu một khoá mà `write` thật luôn ghi. Bộ đọc mới khớp đúng hình dạng viết tay ấy nên mọi ca teeth xanh, còn dòng do `write` thật sinh lại rơi nhánh khác — hàng rào xanh vì lý do sai | Mọi ca dựng dòng repin bằng cách GỌI `write` thật | **fixed** — thêm một LUẬT FIXTURE ở đầu `evals.yaml`, áp cho mọi ca teeth, kèm ngoại lệ duy nhất có tên (dòng ông bà — hình dạng bộ ghi không tạo ra được theo thiết kế) |

## Ghi chú

Cả năm đều **fixed trong artifact**, không đẩy cái nào sang `human-gate1`. Không lật
quyết định nào đã ghi trong sổ.

Finding P0 thứ nhất đáng ghi riêng: nó bắt được **một fail-open do chính vòng này tạo
ra**, ở đúng cơ chế vòng này dựng lên để đóng một fail-open khác. Phép sửa **không phải**
thu hẹp miễn trừ — đã thử trên giấy và nó dựng lại vòng tròn — mà là **khai thẳng cái
đánh đổi và nêu phép bù có tên**. Một miễn trừ được khai và đếm được vẫn là miễn trừ;
điều thay đổi là nó không còn vô hình.
