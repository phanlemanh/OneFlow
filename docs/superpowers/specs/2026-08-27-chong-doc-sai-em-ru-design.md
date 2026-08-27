# Thiết kế — chống đọc sai êm ru

> Hợp đồng: [`_acceptance/chong-doc-sai-em-ru/contract.md`](../../../_acceptance/chong-doc-sai-em-ru/contract.md)
> Ngày: 2026-08-27 · Hạng: T3 · Bề mặt: `sdk`, `web-ui`, `docs`

## 1. Vấn đề — một lớp, không phải một danh sách ca

Hợp đồng gốc `normalize-text-vi` đã đóng chín họ lỗi qua 21 vòng nghiệm thu. Chín họ đó
**cùng một hình dạng**, và hình dạng ấy là thứ hợp đồng này nhắm tới:

```
     đầu vào có số  ──►  luật viết lại  ──►  thư viện đọc số  ──►  đầu ra là chữ
                              │                                        │
                     mỗi lần viết lại là                        hai lớp canh:
                     một cơ hội đổi nghĩa                    ① còn chữ số sót?  → KHÔNG (đã thành chữ)
                     âm thầm                                 ② mất chữ tiền?    → KHÔNG (bản viết lại vừa chèn)
                                                                     │
                                                            cả hai XANH đúng lúc
                                                            bản viết lại SAI
```

Hai lớp canh hiện có mù **theo thiết kế**, không phải do cài đặt kém:

- hậu kiểm soi `[0-9₫%]` — một câu đã thành chữ hết thì luôn sạch, kể cả khi chữ đó sai;
- luật quan hệ mất-chữ-tiền chỉ chạy khi đầu vào có dấu hiệu tiền — bất kỳ đường nào làm
  `has_money` trả `False` đều tắt luôn cái canh duy nhất.

**Nguyên tắc điều hướng mọi quyết định dưới đây:** giữa *từ chối đọc* và *đọc sai*, luôn chọn
**từ chối**. Câu bị chặn thì người dùng thấy; giá đọc sai thì không ai thấy cho tới khi khách
hàng nghe.

## 2. Ba nhóm việc, ba tính chất khác nhau

| nhóm | tiêu chí | tính chất |
|---|---|---|
| **A. Lỗ hổng lớp ký tự / hình dạng** | AC-1 · AC-2 · AC-3 · AC-4 · AC-9 · AC-10 | sửa trong `sdk/tongflow/text/`, đo bằng pytest, cặp hai chiều bắt buộc |
| **B. Sức khoẻ của chính bộ đo** | AC-5 · AC-8 · AC-11 | không đổi hành vi sản phẩm; đổi cách phép đo chọn chủ thể và khai ô |
| **C. Mặt người dùng** | AC-6 · AC-7 · AC-12 | chạm `src/`, i18n 5 locale, có ca nhìn thấy được trên giao diện |

Thứ tự thực thi đề xuất: **B → A → C**. Lý do: nhóm B làm bộ đo tự lộ ô trống, nên nhóm A
được đo bằng một cái thước đã có răng thay vì thước sẽ phải vá lại giữa chừng — đúng bài học
đắt nhất của hợp đồng gốc (vòng 17 và 19 mỗi lần đều phải thêm ca **sau** khi có người soi ra).

## 3. Nhóm A — lỗ hổng lớp ký tự

### 3.1 Gạch kiểu chữ (AC-1)

`_RANGE`, `_NEGATIVE` và `_RESIDUAL` hiện neo vào ASCII `-` (U+002D). Ba ký tự cùng vai
thoát lưới: `–` (U+2013), `—` (U+2014), `−` (U+2212).

**Hướng:** một hằng lớp ký tự dùng chung — cùng khuôn `_SEP` đã dựng ở vòng 17 của hợp đồng
gốc, nơi việc để hai luật đánh vần khác nhau chính là lỗi. Chuẩn hoá về ASCII ở tiền xử lý,
**không** rải ký tự vào từng luật.

**Ca âm bắt buộc:** gạch nối trong từ ghép tiếng Việt (`ki-lô-mét`) không được đụng —
`_RESIDUAL` hiện cố ý không cờ gạch giữa hai chữ cái, và điều đó phải giữ nguyên.

### 3.2 Số-gạch-số không phải khoảng (AC-3) và ngày không parse được (AC-9)

Hai tiêu chí này cùng một gốc: luật hình dạng chạy **vô điều kiện**, dựa vào giả định thư
viện sẽ xử lý phần còn lại — giả định chỉ đúng khi thư viện parse được.

**Hướng:** cùng học thuyết đã dùng cho họ dấu phẩy ở vòng 19 — **bảng khai-trước** các hình
dạng đọc được, mọi hình dạng ngoài bảng thì từ chối và **nêu tên cụm** trong `residual`. Đây
là chỗ tái dùng được nhiều nhất từ hợp đồng gốc.

### 3.3 Dấu gạch chéo còn sót (AC-10)

Mở rộng `_RESIDUAL` để `/` còn lại tính là chưa-đọc-được. Cẩn trọng đã đo: `100km/h` thư viện
đọc **đúng** thành "ki lô mét trên giờ", nên luật phải bắt `/` **còn sót trong đầu ra**, không
phải `/` trong đầu vào.

### 3.4 URL và token La-tinh (AC-2, AC-4)

Hai họ này thư viện băm chữ (`VNDirect` → "ndi re" → "di re", vi phạm cả tính đọc-hai-lần-
như-nhau). **Hướng:** nhận diện và **giữ nguyên** token, hoặc từ chối — không cố đọc.

## 4. Nhóm B — sức khoẻ bộ đo

### 4.1 Phép đo không được tự chọn chủ thể theo thứ nó đo (AC-8)

Đây là bất biến, không phải một bản vá. Phát biểu: *tập chủ thể phải suy từ một nguồn độc
lập với thuộc tính đang kiểm.* Ca thật: `E18` chọn khoá executor bằng `grep 'vietnormalizer'`
— chính từ nằm trong thông điệp mỏ neo nó đi kiểm, nên khoá nào mất mỏ neo cũng mất luôn từ
khoá và thoát khỏi tầm soi.

**Hướng:** liệt kê chủ thể từ cấu trúc (mọi khoá dưới `executors.*` có `pytest`), rồi mới
kiểm thuộc tính trên từng chủ thể.

### 4.2 Ma trận khai-trước cho họ "Đ nhập nhằng" (AC-11) và phủ từ điển (AC-5)

Cùng một khuôn đã chạy tốt ở sáu họ anh em: khai ô **trước**, mỗi ô có ca hoặc nằm trong danh
sách bỏ-có-tên kèm lý do, assert nêu **đúng tên ô** còn trống.

## 5. Nhóm C — mặt người dùng

### 5.1 Lỗi theo ngôn ngữ người dùng (AC-6)

SDK trả **mã ổn định** (`EMPTY_INPUT` / `RESIDUAL_TOKENS` / `MONEY_UNIT_LOST`) + tuple
`residual` đã có sẵn; câu chữ sống trong `src/i18n/messages/*.json`. Trường `error` giữ lại
cho log, không cho mặt người. Khuôn này **đã có sẵn trong kho** — cảnh báo xuất bản
(`WORKFLOW_TTS_NEEDS_NORMALIZE` + `use-export-warning-toast`) là bản mẫu để chép.

### 5.2 Bộ chọn ngôn ngữ có mục tiếng Việt (AC-7)

Danh mục hiện 11 mục, không mục nào là tiếng Việt; mặc định `clone` là `"Auto"`. Đây là mảnh
thiếu khiến việc thu hẹp cảnh báo phải gỡ **hai lần**.

**Surface & state chạm:** node giọng đọc — trạng thái `idle` (thấy mục "Tiếng Việt" trong danh
sách) và `wired` (đã chọn, nhãn hiện đúng). Hai state này là ca chụp màn hình của S4.

### 5.3 Cảnh báo chỉ khuyên điều làm được (AC-12)

Cảnh báo hiện vô điều kiện, trỏ tới node không picker nào có và không plugin nào thực thi.
**Hướng:** gắn điều kiện vào *slot có plugin nhận hay không* — dữ kiện đã có trong
`nodePluginMap`. Ca âm bắt buộc: plugin có mặt trở lại thì cảnh báo hiện lại đúng như cũ.

## 6. Ràng buộc kế thừa — không được phá

- Thư viện `vietnormalizer` **ghim phiên bản**, bọc chứ không fork (Out of scope).
- Mọi phép đo mới đi kèm **cặp hai chiều trên cùng fixture**: vật lành → xanh; phá vật thật
  trong bản sao → đỏ **kèm thông điệp ghim** nêu tên ca. Một phép đo chưa từng đỏ không phân
  biệt được "vật lành" với "thước chưa bao giờ chạy".
- Tiêu chí gắn nhãn `(cross-layer)` phải có ≥1 phép đo ở lớp sau, không chỉ lớp giao diện.

## 7. Rủi ro đã biết khi vào việc

| rủi ro | dấu hiệu sớm | cách chặn |
|---|---|---|
| Nhóm A vá theo ca thay vì theo lớp | vòng sửa thứ hai lại sinh lỗi cùng lớp | điều khoản dừng-vá: dừng, trình ba đường cho owner |
| AC-7 chạm bộ chọn dùng chung nhiều node | lint/test của node khác đỏ | làm AC-7 trước AC-12, đo riêng |
| Bộ đo đổi khuôn làm bằng chứng cũ hoá cũ | lưới trước-merge báo stale | gom nhóm B vào một vòng, re-pin một lượt |
