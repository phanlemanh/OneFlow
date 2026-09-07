# Hàng rào đọc nhầm lỗi thành "không có gì" — thiết kế

**Ngày:** 2026-09-03 · **Hồ sơ:** `_acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/`
· **Hạng:** T2 · **Cơ hội:** `_acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/opportunity.md`

## Vấn đề

Khi một phép kiểm không lấy được dữ liệu nó cần, nó không nói *"tôi không đo được"* —
nó im lặng trả giá trị rỗng, rồi kết luận rỗng ấy thành *"sạch"*.

Hồ sơ cơ hội gom sáu triệu chứng và gọi chúng là **một gốc**. Đếm chỗ gọi thật thì tiền
đề ấy **sai**: chín điểm gọi `gitOk` trong lõi chia thành ba nhóm cơ chế khác nhau, và
ba triệu chứng còn lại không liên quan gì tới việc đọc. Owner chốt phạm vi **A + B + C**;
D (bất biến hằng-đúng) và E (bộ quét thiếu chủ thể) ra ngoài.

Đây là ghi chú đáng giữ: **"khớp câu chuyện quá gọn" là cờ đỏ**. Sáu thứ cùng *cảm giác*
rất dễ viết thành một gốc, và một AC kiểu "mọi lượt đọc ngoài phải phân ba trạng thái"
sẽ đúng cho ba chỗ và vô nghĩa cho bốn chỗ còn lại — tức một AC không đo được.

## Chân ngành

**JPL Power of Ten quy tắc 7** (kiểm giá trị trả về của mọi hàm non-void) ·
**CWE-252** Unchecked Return Value · **CWE-390** Detection of Error Condition Without
Action · **fail-safe defaults** (Saltzer & Schroeder, 1975) · **YAML 1.2** đòi khoá duy
nhất, và quy tắc `key-duplicates` của **yamllint**.

## A — Đọc git thất bại không được đọc thành "không có gì"

Chín điểm gọi, phân theo cơ chế **thật**:

| Điểm gọi | Hình dạng | Xử lý |
|---|---|---|
| `diff --name-only` ×2 (311, 430) | `\|\| ""` → lỗi thành "không file nào đổi" | **sửa** — biến thể bắt buộc |
| `show <base>:<path>` (497) | `\|\| ""` → base hỏng thành "file chưa có ở base" | **sửa** — chốt base trước |
| `rev-parse --is-shallow-repository` (362) | git lỗi → khác `"true"` → đi tiếp | **sửa** — lỗi ≠ "không nông" |
| `cat-file -t` ×2 (422, 423) | không phân giải → xếp "ông bà", bỏ qua | **giữ** — miễn trừ cố ý; nhưng **in số** |
| `merge-base --is-ancestor` ×2 (292, 412) | in RỖNG khi thành công | **giữ** — conflation khác, đang fail-closed |
| `cat-file -t` ×2 (279, 281) | đã `die` | **giữ** — đã đúng |

**Ba lối đã cân.** (i) Bọc `gitOk` thành `{ok, out}` cho cả chín chỗ — to, chạm cả chỗ
đang đúng. (ii) Thêm biến thể bắt buộc chỉ cho ba chỗ `|| ""`. (iii) **Kiểm điều kiện
tiên quyết ngay đầu chế độ.**

**Chọn (iii) làm chính, (ii) làm phần dư.** Gốc của lỗi nặng nhất không phải "lượt đọc
hỏng" mà là **tham chiếu không phân giải được**; và kho đã có sẵn đúng hình dạng ấy —
phép từ chối clone nông ở dòng 362. Một chốt ở đầu chế độ rẻ hơn và đúng chỗ hơn chín
lượt kiểm rải rác.

- `newlines <base>` chạy `git rev-parse --verify "<base>^{commit}"` trước mọi thứ; hỏng
  → **DỪNG nêu đích danh base**. Sau chốt ấy, `|| ""` ở dòng 497 mới thật sự có nghĩa
  "file chưa có ở base ấy".
- `check`: `diff prev..sha` nằm ngay sau hai lượt `cat-file -t` đã xác thực, nên hỏng ở
  đây là lỗi git thật → biến thể bắt buộc, không `|| ""`.
- Hạng «ông bà» **giữ nguyên** — dòng repin lịch sử không có `prev_sha` là dữ kiện, không
  phải lỗi. Nhưng số lượng phải **in ra**: một hạng miễn trừ không đếm được là chỗ chôn
  lỗi lý tưởng.

## B — Bế tắc tự-quy-chiếu

Ô đo E5/E6 của hồ sơ `repin-khong-chay-lai-eval` **chạy chính** chế độ `check`. Mọi lần
ghim đều ghi vào `_acceptance/**` — kể cả dòng ghim của chính nó — nên mỗi lần ghim tự
đưa hai ô ấy vào tập «bị chạm», mà `check` chỉ xanh được khi chúng đã có dòng xanh tại
sha ấy. Vòng tròn khép kín; đã chứng minh trong worktree 03/09.

**Bốn lối đã cân.** Khai tường minh · đoán từ lệnh · loại sổ sách của nghi thức ghim khỏi
diff · biến thành luật quy trình.

**Chọn khai tường minh** (`self_referential: true` trong `evals.yaml`), vì **hướng của
phép quên**: quên khai thì ô ấy nằm trong tập phải-chạy-lại như cũ và hàng rào **ĐỎ**.
Lối "đoán từ lệnh" quên thì hàng rào **XANH** — và tệ hơn, nó chính là bệnh E của cùng
hồ sơ cơ hội: nhận diện bằng hình dạng chuỗi thay vì bằng chủ thể được khai. Sửa một lỗ
bằng đúng cơ chế gây ra lỗ khác trong cùng hồ sơ thì vòng sau sẽ tìm thấy nó.

Ô được miễn trừ **không biến mất**: nó vào một hạng **có tên, có số** trong dòng tổng
kết của `check`, cạnh bảy số hiện có.

**Kèm theo, bắt buộc:** hoàn nguyên `paths` của E5/E6 về đủ `_acceptance`. Phép thu hẹp
03/09 mua sự yên tĩnh bằng cách bán độ phủ thật — kết luận của `check` *có* phụ thuộc nội
dung hồ sơ. Không hoàn nguyên thì không chứng minh được bế tắc đã hết: nó chỉ đang bị
giấu.

## C — Khoá YAML trùng

`yaml.safe_load` giữ khoá cuối, im lặng. Đã gây hậu quả thật: hồ sơ **đã ký**
`noi-thuoc-tai-lieu-vao-ci` có `expected` hai lần trong khối E2, nên bằng chứng đã ký mô
tả một phép đo **đã bị rút**.

Script mới dưới `scripts/acceptance/`, quét mọi `_acceptance/**/evals.yaml`, đỏ khi một
khối eval có khoá lặp — nêu **đích danh hồ sơ, khoá, số dòng**. Đọc **thô**, đếm khoá
theo khối; dùng `safe_load` để bắt lỗi của `safe_load` là vô nghĩa.

**Điểm mù khai thẳng:** đo 03/09 cho **0/34** tệp có khoá lặp — vì ca duy nhất vừa được
vá. Nghĩa là hàng rào này **sinh ra đã xanh trên dữ liệu thật**, và vế xanh ấy không
chứng minh gì. Chiều đỏ **bắt buộc** đến từ fixture, không từ kho.

## Cái giá đã biết

- File mới dưới `scripts/acceptance/**` **luôn kéo theo một lần ghim lại** các hồ sơ đã
  ký — vùng ấy nằm trong phạm vi eval của vài hồ sơ.
- Mỗi phép đo mới cần **cặp hai chiều trên cùng fixture** (MEASURE-BIRTH của kit).
- Diện của B **hôm nay rất nhỏ**: 1/530 ô đo còn khai `_acceptance` trần. Nhưng con số ấy
  quay về khi hoàn nguyên `paths`, vốn là một phần của B.

## Ngoài phạm vi

- **D** — bất biến `kê == phá + bỏ qua` hằng-đúng ở `check-gate-guards-job.sh`. Một dòng
  assert ở hàng rào khác, thuộc hồ sơ `noi-thuoc-tai-lieu-vao-ci`.
- **E** — bộ quét theo mẫu không phân biệt trích dẫn với khẳng định. Cần *chủ thể*, không
  cần *trạng thái*; chưa có lời giải rõ, gộp vào đây sẽ kéo cả hợp đồng theo nhịp của
  phần mơ hồ nhất.
- **`lib/evidence-core.cjs`** — vendored từ kit, nằm trong `t1_skip_globs`. Không chạm.
- **Cắm hàng rào vào CI** — mục tiêu xa mà A+B dọn đường; không làm ở vòng này.
