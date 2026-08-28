---
schema_version: 1
feature: bộ phân loại token — biết một cụm là tiền, đơn vị, đường dẫn hay thành ngữ
slug: bo-phan-loai-token
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [sdk]
status: draft
---

# Hợp đồng: bộ phân loại token

> **Trạng thái: BẢN NHÁP.** Mở ngày 2026-08-28 khi đóng hồ sơ
> [`chong-doc-sai-em-ru`](../chong-doc-sai-em-ru/contract.md). Chưa qua Cổng 1. Mục đích của
> bản nháp này là **giữ lại bằng chứng đã đo** — sáu vòng nghiệm thu đã trả giá cho nó — để
> phiên nào nhận việc không phải suy lại từ đầu.

## Vì sao có hợp đồng này

Hồ sơ `chong-doc-sai-em-ru` sửa **bốn lần** cùng một luật (dấu gạch chéo), mỗi lần một phạm vi
khác, và **mỗi lần lại lộ một họ ca mới**:

| Vòng | Luật | Hỏng theo chiều nào |
|---|---|---|
| S1 | chỉ soi đầu ra | từ chối cả `TP/HCM`, `và/hoặc` |
| 2 | hỏi nguyên liệu thô | **mất số** — `12-25-2026` đọc mất số 25, `ok=True` |
| 3 | đếm tổng | hai họ triệt tiêu nhau |
| 4–6 | đếm theo vị trí, neo chữ tiền | vẫn lọt khi tiền viết liền; và **tự từ chối đầu ra của chính nó** |

Gốc không đổi qua cả bốn lần: **`_NUM_LEFT_OF_SLASH` là một phỏng đoán TỪ VỰNG** — nó đoán "cái
gì đứng cạnh dấu gạch chéo thì dấu đó thuộc về một con số". Nó không biết `100đ` (không dấu
cách) là tiền, không biết `/home` là đường dẫn, không biết `50/50` là thành ngữ, không biết
`oneflow.vn` là tên miền.

**Sửa vòng ngoài thì gốc vẫn hỏng.** Đó là kết luận đo được, không phải cảm tính.

## Sáu giới hạn đã ký ở hồ sơ mẹ — đây là danh sách việc

Mỗi dòng dưới đây là một giới hạn owner **đã xem đầu ra thật rồi ký**, và mỗi dòng đóng được
khi có bộ phân loại token. Cả sáu đang được ghim bằng phép đo tự-đỏ-khi-lành ở
[`sdk/tests/test_normalize_vi.py`](../../sdk/tests/test_normalize_vi.py) — ngày nào một giới hạn
lành, phép đo đỏ và buộc phải gỡ nó khỏi cả hai hồ sơ.

**Bậc MẤT DỮ LIỆU** *(bản đọc SAI, nói ra với `ok=True`)*:

1. `ngày 12/25/2026, tốc độ 100km/h` → **đọc**. Số 25 biến mất, tháng đọc thành 2. Chính chuỗi
   đó khi không có `100km/h` thì từ chối đúng.

**Bậc TỰ MÂU THUẪN**:

2. `Giá 100đ/kg và/hoặc 200đ/lít` → `ok=True`; đọc lại chính đầu ra → `ok=False`. Node chạy
   trong mọi dây và có thể chạy hai lượt.
3. `Mua iPhone qua vndirect nhé` → từ chối, **nêu tên sai token**: `iPhone` ổn định, thủ phạm là
   `vndirect`.

**Bậc TỪ CHỐI OAN** *(đọc đúng rồi vẫn chặn)*:

4. `Giá 1,05-2,5 triệu` → từ chối, nêu `('05-2',)` — một cụm người dùng không hề gõ.

**Bậc SÓT MỘT DẤU** *(bản đọc đúng, một ký tự thô tới giọng đọc)*:

5. `Tốc độ 100km/h, lãi 5%/năm` · `Giá 100đ/kg và/hoặc 200đ/lít` → đọc.
6. `Mở /home/user/file.txt` → `mở /hôm/u xơ/phai.txt` · `Truy cập oneflow.vn/gia` →
   `truy cập o nép lô.vn/gia` *(AC-2)*.

## Hướng, không phải thiết kế

Một bộ phân loại trả về **loại** của từng token trước khi luật nào chạy: `tiền · đơn vị ·
đường dẫn · tên miền · thành ngữ số · ngày · thường`. Các luật hậu kiểm hỏi bộ phân loại thay vì
tự đoán bằng ký tự lân cận.

## Ba thứ đã đo, đừng đo lại

- **`Tỉ lệ 50/50` → từ chối là ĐÚNG**, không phải giới hạn: đầu ra có gạch chéo thô. Đã có người
  định khai nó là lỗi; đừng "sửa" nó rồi mở lại lỗ.
- **Đánh đổi "từ chối cứng khi đầu vào có gạch chéo số"** đã cân và **bỏ**: nó đóng ca mất số
  nhưng mở lại từ chối oan ở `Ngày 19/8/2026 và/hoặc thứ hai`. Đổi một lỗi lấy một lỗi.
- **Hướng "gỡ gạch chéo văn xuôi rồi hỏi lại thư viện"** đạt 16/16 trên bộ ca tự chọn rồi **sụp
  ngay lần quét đối kháng đầu tiên** (4 ca sai). Đừng dựng lại nó mà không quét đối kháng.
