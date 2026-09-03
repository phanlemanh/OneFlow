---
schema_version: 1
slug: hang-rao-doc-nham-loi-thanh-khong-co-gi
feature: Sáu chỗ hàng rào đọc nhầm "không đo được" thành "không có gì sai"
owner: Manh
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---


# Cơ hội: hàng rào đọc nhầm lỗi thành "không có gì"

## Việc gì đang sai

Sáu chỗ, ba hàng rào khác nhau, **một hình dạng duy nhất**: khi một phép kiểm không
lấy được dữ liệu nó cần, nó không nói "tôi không đo được" — nó im lặng trả về giá trị
rỗng, rồi kết luận rỗng ấy thành "sạch".

Cả sáu chỗ đều được tìm ra trong lúc chạy vòng `repin-khong-chay-lai-eval`, và cả sáu
đều bị owner đẩy ra ngoài phạm vi tại Cổng Bằng chứng 03/09 với đề xuất "mở hợp đồng
mới". Hồ sơ này gom chúng lại vì chúng **cùng một gốc** — sửa rời từng cái sẽ để lại
chỗ thứ bảy cho người sau khoan.

## Bằng chứng đo được, không phải suy luận

| # | Chỗ | Đọc nhầm gì | Đo được |
|---|---|---|---|
| 1 | Chế độ so dòng ghim mới | "mốc so sánh không phân giải được" → "file chưa có ở mốc ấy" | chạy với một nhánh không tồn tại: **1674 dòng lịch sử** bị coi là mới, **25 lỗi giả** |
| 2 | Chế độ kiểm chính | "không so được hai mốc" → "không có file nào đổi" | lần ghim ấy được tính là đã đo và **không bao giờ** có thể bị bắt là bỏ sót |
| 3 | Bế tắc tự-quy-chiếu | ô đo CHẠY hàng rào lại bị hàng rào tính là "bị chạm" | ghim sau merge → 2 ô không thể xanh; đã vá tạm bằng thu hẹp `paths` 03/09, **gốc chưa sửa** |
| 4 | Khoá YAML trùng | bản sau lặng lẽ đè bản trước | ca thật trong hồ sơ **đã ký** `noi-thuoc-tai-lieu-vao-ci`: `expected` hai lần, nên bằng chứng đã ký mô tả một phép đo **đã rút** |
| 5 | Bất biến đếm ở hàng rào cổng | `kê == phá + bỏ qua` đúng theo cấu trúc | không bao giờ đỏ được; chỉ bắt lỗi gõ nhầm tên |
| 6 | Bộ quét theo mẫu không phân biệt trích dẫn với khẳng định | một câu *kể lại* một con số bị đọc thành *khai* con số ấy | xảy ra **ba lần trong một ngày**: `1/99` trong văn xuôi làm hàng rào đỏ; quét cả thư mục đẻ **14 lệch giả**; và luật nhất-quán đọc một câu giải trình thành bằng chứng trượt |

## Giả thuyết (CHƯA kiểm chứng)

- Năm chỗ đầu chữa được bằng **một luật chung**: mọi lượt đọc dữ liệu ngoài (git, file,
  YAML) phải phân biệt ba trạng thái — có dữ liệu · không có dữ liệu · **không đọc được**
  — và trạng thái thứ ba luôn DỪNG, không bao giờ rơi vào nhánh "không có".
- Chỗ thứ sáu **không** chữa được bằng luật ấy: nó cần chủ thể, không cần trạng thái.
  Giả thuyết là mỗi bộ quét phải khai **danh sách chỗ nó soi** (như `so-khop-total` đã
  làm sau khi mở-quá-rộng thất bại), hoặc có một dấu quy ước cho "đây là trích dẫn".
- Chỗ thứ ba có thể là hệ quả của một quyết định sâu hơn: **một hàng rào đo mọi hồ sơ,
  kể cả hồ sơ chứa chính nó, thì mỗi lần ghim tự đưa mình vào tập "bị chạm"**.

## Vì sao đáng làm

Chỗ số 1 và số 3 **chặn việc cắm hàng rào ghim vào CI** — vốn là giới hạn số một mà
`repin-khong-chay-lai-eval` khai. Ai cắm nó vào lượt kiểm tự động hôm nay sẽ nhận 25 lỗi
giả trên mọi bản sao rút gọn, và một vòng tròn không lối ra sau mỗi lần hợp nhất.

Chỗ số 4 đã gây hậu quả thật một lần trên một hồ sơ **đã ký**. Không có gì chặn ca tiếp
theo.

## Ngưỡng nghiệm thu sơ bộ

- Đếm được **bao nhiêu lượt đọc ngoài** trong ba hàng rào không phân biệt được "không
  đọc được" với "không có" — con số ấy phải về **0**, và phải in ra được.
- Phép thử hai chiều cho từng chỗ: cây lành → xanh; làm hỏng đúng nguồn dữ liệu ấy
  (nhánh không tồn tại · hai mốc không so được · khoá trùng) → **ĐỎ nêu đích danh**.
- Hàng rào ghim chạy được trong CI trên một bản sao rút gọn **không** đẻ lỗi giả.
- Ô đo tự-quy-chiếu xanh được sau một lần ghim mà **không** cần thu hẹp `paths`.

## Vì sao KHÔNG sửa trong hồ sơ gốc

`repin-khong-chay-lai-eval` đã ký 03/09 sau **năm vòng**, và ba vòng cuối cho thấy mỗi
bản vá thêm ở đó lại đẻ một finding cùng họ — hai HIGH của vòng 4 do chính vòng 4 sinh
ra, và vòng 5 phải bác một trong ba phép sửa của nó. `STOP-PATCHING-CLAUSE` đã kích hoạt
một lần trong vòng ấy.

Ngoài ra sáu chỗ nằm ở **ba hàng rào khác nhau**, hai trong số đó thuộc hồ sơ đã ký
khác. Đó là phạm vi của một hợp đồng mới, không phải một bản vá nối dài.
