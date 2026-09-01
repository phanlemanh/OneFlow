---
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — `o-do-chay-0-ca-van-xanh`

> 31/08/2026 · critic ngữ cảnh sạch, đọc ĐÚNG 6 artifact (design-doc, contract, evals,
> decisions, opportunity, claims), **không đọc mã sản phẩm**.

Gói này là một **hàng rào canh chính lớp đo**, nên phản biện được hỏi riêng về nghịch
lý tự-quy-chiếu. Cả năm phát hiện đã **vá trong artifact, trước khi viết dòng mã nào**,
và một trong số đó buộc phải **đo bù** một nhóm mà bản nháp đầu đã bỏ sót.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Con số 33 chỉ nằm trong văn xuôi của E2; không ô nào biến nó thành assertion. AC-2 chỉ đòi in một số lớn hơn 0, không đòi số ấy khớp một bộ đếm độc lập theo từng khuôn. | Regex gom ô đo chỉ khớp dạng nháy đơn một dòng nên bộ kiểm thấy 5 trên 33. Nó in "đã kiểm 5 ô" rồi exit 0. E2 xanh vì số lớn hơn 0; E3 không kích vì khác 0 ô; E6 xanh vì vẫn có mặt cả hai nhóm. 28 ô nằm ngoài hàng rào mà mọi đèn vẫn xanh — trạng thái nguy hiểm HƠN ca 0 ô. | AC-2 ghim ba con số literal (tổng 33, gọi thẳng 23, bọc 10) và đối chiếu bộ đếm độc lập. Ca răng `undercount` dựng bản sao đủ ba biến thể trích dẫn, thiếu một ô là đỏ. | **VÁ** → AC-2 ghim số + E16. |
| P0 | contract | Cửa fail-closed AC-4 chỉ bật khi lệnh CÓ `-t`. Ô đo gọi qua một bộ bọc MỚI không có `-t` thì không rơi vào AC-4 lẫn AC-3; AC-6 lại ghim đích danh đúng một bộ bọc, và Trục A tuyên bản kê "đóng" dựa trên ảnh chụp grep hôm nay. | Hồ sơ tuần sau sinh một bộ bọc thứ hai theo đúng khuôn vừa ra đời hôm qua. Sáu ô đo mới dùng nó, không lệnh nào có `-t`. Bộ kiểm phân loại chúng là không-lọc-theo-tên, bỏ qua im lặng, in một con số trông hợp lý và xanh — lớp lỗi tái sinh y nguyên bên trong hàng rào vừa dựng. | Đổi tiêu chí gom từ "có -t" sang "gọi vitest, trực tiếp hoặc qua bất kỳ script nào dưới scripts/"; bộ bọc chưa nhận diện phải ĐỎ nêu tên khoá và tên script. Ca răng `unknown-wrapper`. | **VÁ** → AC-13 + E15; Trục A thêm giá trị "bộ bọc chưa biết". |
| P1 | evals | E14 khẳng định case-completeness bằng chính `--list` của bộ răng — script tự khai bao nhiêu ca thì thoả bấy nhiêu, một phép đo hằng đúng. Cái ghim ngoài duy nhất là văn xuôi, và nó ghi "Sáu ca" rồi liệt kê BẢY tên. Ca `clean` không có ô đo riêng. | Implementer đọc "Sáu ca" rồi bỏ `clean`. Bộ răng khai 6 ca, chạy 6 ca, E14 xanh vì token khớp `--list`. Không còn phép nào chứng minh bộ răng cho PASS trên cây LÀNH, nên một bộ răng đọc NGƯỢC mã thoát cũng qua sạch mọi ca đỏ. | Ghim danh sách tên ca vào AC-12 và vào chính ô đo, không vào `--list`; sửa con số; giữ `clean` như đối chứng dương có mã thoát riêng. | **VÁ** → AC-12 ghim chín tên + E14 viết lại + E17. |
| P1 | evals | AC-7 hứa một QUAN HỆ (kết luận giống vitest trên mọi bộ lọc) nhưng E7 chỉ đo một chuỗi tự chọn, một chiều, và không ô nào thực sự chạy `vitest -t` trên cùng chuỗi để đối chiếu — chuẩn đối chiếu chỉ là lời hứa trong văn xuôi. | Cài đặt escape bộ lọc rồi so chuỗi con. Chuỗi E7 chọn không khớp theo cả hai cách nên bộ kiểm vẫn đỏ đúng và E7 xanh. Chiều bất đồng ngược lại — vd `answers 503 .* code` khớp theo regex nhưng không khớp chuỗi con — không được đo, nên bộ kiểm có thể kết luận một ô đo THẬT là rỗng và làm CI đỏ trên mọi PR. | Ma trận bốn bộ lọc phủ cả hai chiều bất đồng; mỗi ô chạy `vitest run -t` thật, đọc số ca chạy được, so với phán quyết của bộ kiểm. Số assert bằng số ô. | **VÁ** → AC-7 + E7 viết lại. |
| P1 | contract | Câu "23/23 đang lành" chỉ đo nhóm gọi thẳng. Mười ô qua bộ bọc — đúng nhóm nơi lỗi được PHÁT HIỆN — chưa từng được đo, trong khi E2 lại đòi bộ kiểm xanh trên cả 33 ô của cây thật. | Một trong mười ô bọc vẫn rỗng. Bộ kiểm làm đúng chức năng nên đỏ, E2 đỏ, nhưng hợp đồng tuyên "không có lỗi nào để sửa" và entry descope chặn việc sửa. Lối thoát rẻ nhất của implementer là sửa chuỗi lọc trong cấu hình của một hồ sơ ĐÃ KÝ — tức âm thầm đổi bằng chứng đã ký để làm hàng rào xanh. | Đo lại trước Cổng 1 trên cả 33 ô, ghi baseline theo từng khuôn vào hợp đồng. Ô rỗng nếu có phải thành mục sửa CÓ TÊN kèm ô đo. | **VÁ + ĐO BÙ** → đo 31/08: nhóm bọc **10/10 lành**, tổng **33/33**. Bảng baseline hai nhóm nay nằm trong hợp đồng, kèm câu cấm đường-thoát-rẻ. |

## Vết để lại

- AC 12 → **13**; eval 14 → **17**; executor mới **3**.
- Trục A nở thêm một giá trị: **bộ bọc chưa biết**. Core 12/36 → 13/48.
- **Một lượt đo bù**: bản nháp tuyên "23/23" trong khi nhóm mười ô nơi lỗi được phát
  hiện chưa từng đo. Nay là 33/33, ghi theo từng khuôn.
- Cả hai lỗ P0 đều thuộc lớp **hàng rào tự nó có lỗ**: một cái đếm thiếu mà vẫn xanh,
  một cái không nhận ra hình dạng mới của chính thứ nó canh. Không cái nào lộ ra khi
  đọc lại hợp đồng.
