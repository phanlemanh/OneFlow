# Ô đo chạy 0 ca vẫn xanh — thiết kế

> Ngày 31/08/2026 · slug `o-do-chay-0-ca-van-xanh` · hạng T2
> Hợp đồng: [`_acceptance/o-do-chay-0-ca-van-xanh/contract.md`](../../../_acceptance/o-do-chay-0-ca-van-xanh/contract.md)
> Hồ sơ cơ hội: [`opportunity.md`](../../../_acceptance/o-do-chay-0-ca-van-xanh/opportunity.md)

## 1. Vấn đề

`pnpm vitest run <file> -t '<tên ca>'` **thoát 0 khi không ca nào khớp**. Nó in
`Tests  26 skipped (26)` rồi trả về thành công. Một ô đo dùng khuôn đó — tên gõ sai,
hoặc một tiêu chí mà ca thử **chưa từng được viết** — báo ĐẠT vĩnh viễn.

**Đã xảy ra thật**, lượt verify đầu tiên của `kho-khoa-toan-ven` (31/08):

```
E9   AC-9   exit=0    Tests  26 skipped (26)   ← KHÔNG ca nào chạy
E10  AC-10  exit=0    Tests  26 skipped (26)
```

Hai tiêu chí không hề có ca thử; cả hai ô báo PASS. Bắt được vì có người đối chiếu
dòng `Tests` — **mã thoát nói dối**.

## 2. Đo trước khi thiết kế: 23/23 đang lành

Câu hỏi đầu tiên mà chính hồ sơ cơ hội đặt ra — *"trong 23 ô còn lại có bao nhiêu ô
đang thật sự chạy 0 ca?"* — đã đo, 31/08:

| | Số |
|---|---:|
| Ô đo dùng `vitest run … -t` | 23 |
| Ô đang chạy ≥ 1 ca | **23** |
| Ô đang chạy 0 ca | **0** |

**Không có lỗi nào để sửa.** Điều đó đổi hình dạng gói việc: đây thuần tuý là dựng
hàng rào, và nó rẻ hơn nhiều so với dự tính ban đầu.

Nhưng nó cũng làm rủi ro thật lộ rõ hơn. Nguy cơ chính **không phải** gõ sai lúc viết
— lúc đó người ta còn nhìn, và ca thử vừa được viết xong. Nguy cơ là **đổi tên một ca
thử sau này**, khi hồ sơ đã ký từ lâu và không ai còn soi. Ô đo tự động chuyển sang
xanh-rỗng, im lặng, và bằng chứng đã ký hoá rỗng theo.

## 3. Quyết định của owner (31/08)

**Một bộ kiểm chạy ở chốt CI**, không bọc từng ô đo.

| Đường | Cân nhắc |
|---|---|
| **Bộ kiểm ở chốt CI** ✅ | Sửa 0 dòng cấu hình; phủ luôn mọi ô viết sau này; chặn ngay lúc đổi tên ca thử chứ không đợi tới vòng nghiệm thu. Đánh đổi: bản thân ô đo vẫn báo đạt trong một vòng verify — chỉ cổng chặn merge. |
| Bọc từng ô đo | Ô đo đỏ ngay trong vòng verify, nhưng đổi 23 dòng cấu hình ở vùng nhiều hồ sơ đã ký tham chiếu, lệnh khó chạy tay hơn, và **ô viết sau này vẫn có thể quên dùng bọc** — tức hàng rào tự nó có lỗ. |
| Cả hai | Phủ kín nhất, nhưng cái thứ hai chỉ thêm giá trị trong đúng một vòng verify đang chạy trên mã hỏng **chưa merge**. |

## 4. Cơ chế — dùng chính vitest để liệt kê, không tự đoán

`vitest list --json` trả về **tên đầy đủ** của mọi ca (`describe > it`), với `it.each`
**đã bung sẵn**. Đo 31/08: **720 ca, 1 giây, 149 KB**.

```json
{"name": "GET /api/settings/env > answers 503 with a machine-readable code …",
 "file": "/…/src/app/api/settings/env/route.unreadable.test.ts"}
```

Đây là điều quyết định: bộ kiểm **không phân tích cú pháp file thử** để đoán tên ca.
Nó hỏi chính vitest. Nên `it.each`, tên ghép từ biến, `describe` lồng nhau — tất cả
đều đúng theo định nghĩa, không phải theo một bộ phân tích xấp xỉ sẽ trôi.

Bộ kiểm khớp bằng **regex**, đúng như `-t` của vitest (`testNamePattern`), không phải
so chuỗi con — nếu không, một bộ lọc chứa ký tự regex sẽ được kết luận sai.

## 5. Ba thay đổi

### 5.1 `scripts/ci/check-eval-filters.mjs` — mới

Duyệt `_acceptance/config.yaml`, tìm **mọi** ô đo lọc theo tên ca, và khẳng định mỗi
bộ lọc khớp ≥ 1 ca trong (các) file nó khai.

**Hai khuôn phải nhận, không phải một:**

| Khuôn | Ví dụ |
|---|---|
| gọi thẳng | `pnpm vitest run <file> -t '<lọc>'` |
| qua bộ bọc | `bash scripts/settings/run-one-test.sh '<lọc>'` (file ghim trong script) |

Khuôn thứ hai do `kho-khoa-toan-ven` sinh ra hôm qua. Bỏ sót nó thì mười ô đo mới
nhất **vô hình với chính hàng rào này** — và đó đúng là lớp lỗi đang sửa.

**Fail-closed, ba cửa:**

- một lệnh có `-t` mà **không phân tích được** → đỏ nêu tên khoá, không bỏ qua
- `vitest list` hỏng → đỏ, không kết luận "không có gì để kiểm"
- tìm thấy **0 ô đo** để kiểm → **đỏ**. Đây là cửa quan trọng nhất: nếu khuôn lệnh
  đổi (ai đó chuyển hết sang một dạng khác), bộ kiểm sẽ im lặng phủ **không gì cả**
  mà vẫn xanh — đúng lớp lỗi nó sinh ra để chặn, tái sinh bên trong chính nó.

### 5.2 Một step vào job `Acceptance Gate`

Job đó **chưa có `node_modules`**, mà `vitest list` thì cần. Nên gói này thêm
`pnpm/action-setup` + `pnpm install` vào chính job ấy.

Ba ràng buộc đã đo trước khi chọn chỗ:

- `check-action-pins.sh` chỉ đếm `actions/checkout` (8) và `docker/login-action` (1)
  — thêm `pnpm/action-setup` **không** đụng nó.
- Guard của `cong-tu-canh-minh` chỉ so **năm job** `lint · typecheck · build ·
  unit-tests · sdk-tests`; `acceptance-gate` **không** nằm trong đó, nên thêm step ở
  đây hợp lệ. Thêm vào `unit-tests` (nơi đã có `node_modules`) thì **guard của chính
  ta sẽ chặn** — đó là lý do không chọn đường rẻ hơn ấy.
- Giá: job hiện 15–19s, thêm install + list ≈ 60s. Không đổi thời gian tổng của
  workflow vì `Build` vẫn là 1m17s.

### 5.3 Guard thứ ba vào bộ canh job sẵn có

`check-gate-guards-job.sh` (của `cong-tu-canh-minh`) canh **hai** guard bằng
`GUARD_NEEDLES`. Thêm guard thứ ba mà không khai vào đó thì nó nằm ngoài mọi lớp bảo
vệ `shape` / `no-softening` / `reachable` / `teeth` — một guard **không được canh**,
tức đúng nguyên trạng mà hồ sơ ấy sinh ra để đóng.

Nên khai nó là needle thứ ba, và bổ sung một phép phá vào chế độ `teeth`: làm hỏng
một bộ lọc trong bản sao `_acceptance/config.yaml` rồi đòi lệnh rút từ `ci.yml` đỏ.

## 6. Ngoài phạm vi

- **Sửa 23 ô đo hiện có** — không ô nào hỏng (§2), nên không có gì để sửa.
- **Bọc từng ô đo** — loại ở quyết định owner, §3.
- **Ô đo không lọc theo tên** (chạy cả file) — không mang lớp lỗi này: một file thử
  vắng làm vitest đỏ.
- **Bộ lọc theo tên ở ngôn ngữ khác** (`pytest -k` trong làn SDK) — cùng lớp lỗi,
  khác công cụ và khác cách liệt kê. Đáng một hồ sơ riêng nếu đo ra có thật.
- **Chuẩn hoá `run-one-test.sh` thành bộ bọc chung** — nó ghim cứng một file thử;
  tổng quát hoá là việc của đường "bọc từng ô", vốn đã bị loại.

## 7. Giá phải trả

Năm file, hai file mới. **T2**, hai cổng người. Lượt đóng dấu lại: cận trên **2**
(`ci-vitest-sdk-pin`, `cong-tu-canh-minh`) — số thật do cổng quyết; phương pháp này
dự đoán 3 và cổng đòi 1 ở `cong-tu-canh-minh`, rồi dự đoán 3 và cổng đòi 0 ở
`kho-khoa-toan-ven`.
