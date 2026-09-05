# Kho khoá toàn vẹn — thiết kế

> Ngày 31/08/2026 · slug `kho-khoa-toan-ven` · hạng T2
> Hợp đồng: [`_acceptance/kho-khoa-toan-ven/contract.md`](../../../_acceptance/kho-khoa-toan-ven/contract.md)

## 1. Vấn đề — hai lỗi, một lời hứa bị vi phạm

Hồ sơ [`chong-mat-khoa-byo`](../../../_acceptance/chong-mat-khoa-byo/contract.md) (ký 31/08)
đã dạy kho khoá **từ chối thay vì giả dạng rỗng**. Nhưng lời hứa "kho không âm thầm
làm mất khoá" vẫn thủng ở hai chỗ khác, cả hai **đo được hôm nay**.

### Lỗi 1 — đọc lọc lặng rồi báo LÀNH

[`env-store.server.ts:38-49`](../../../src/lib/settings/env-store.server.ts), dòng 44
`typeof v === "string"`. Tái hiện thật (31/08):

```
trên đĩa  : {"OPENAI_API_KEY":"sk-real","PORT":8080,"DEBUG":true,"NESTED":{"a":1},"NULLED":null}
đọc ra    : {"OPENAI_API_KEY":"sk-real"}
trạng thái: ok  ← BÁO LÀNH, không phải unreadable
mất       : PORT, DEBUG, NESTED, NULLED
```

**Vòng tròn khép kín làm mất vĩnh viễn.** Route ghi *"Replaces the entire env map"*
([`route.ts:75`](../../../src/app/api/settings/env/route.ts)) rồi `saveEnvStore(env)`
(dòng 132). Nên: đọc lọc mất → hiện lên màn → người dùng bấm lưu → **mất trên đĩa**.

Đây đúng lớp lỗi hồ sơ trước vừa bịt, còn nguyên qua một cửa khác: hồ sơ trước lo
kho **không đọc được**; cái này là kho **đọc được nhưng bị cắt bớt**.

### Lỗi 2 — ghi cắt-rồi-ghi, không nguyên tử

[`ext-default/settings-store.ts:36-40`](../../../src/ext-default/settings-store.ts):
`mkdirSync` rồi `writeFileSync` thẳng lên `settings.json`. Sập nguồn hoặc đầy đĩa giữa
chừng để lại file cụt.

Đây chính là thứ **TẠO RA** cái kho không đọc được mà hồ sơ trước học cách từ chối.
Ta đã dạy hệ thống sống chung với file hỏng mà chưa chặn nguồn sinh ra nó.

## 2. Ba bộ lọc lặng, không phải hai — và vị trí quyết định hạng gói

Đọc kỹ lộ ra chỗ thứ ba:

| # | Chỗ | Hướng | Trong lớp kho? |
|---|---|---|---|
| 1 | `coerceEnv` (dòng 44) | đọc | ✅ |
| 2 | `saveEnvStore` (dòng ~119) | ghi qua lib | ✅ |
| 3 | `route.ts` dòng 105 | ghi từ client | ❌ `src/app/api/**` → T3 |

**Vòng tròn mất vĩnh viễn nằm trọn ở #1**, tức trong lớp kho. Route chỉ lọc *đầu vào
từ client* rồi **trả lại đúng bản đã lọc** (dòng 137), nên client không bị nói dối —
nó thấy được cái gì đã lưu. Còn #1 mới là cái lấy dữ liệu **đã có trên đĩa** rồi làm
nó biến mất mà không ai biết.

Nên gói này **giữ T2**: sửa #1 và #2, để #3 ngoài phạm vi có tên.

## 3. Quyết định của owner (31/08)

**Giá trị không phải chuỗi thì ĐỔI THÀNH CHUỖI, giữ khoá** — không từ chối cả kho.

Ba đường đã cân, và đường bị loại có lý do đo được:

| Đường | Hệ quả |
|---|---|
| **Đổi thành chuỗi** ✅ | `8080` → `"8080"`. Khoá được giữ ở mọi cửa, lượt chạy không đứt. Biến môi trường vốn LUÔN là chuỗi, nên đây đúng là thứ hệ thống sẽ dùng dù sao. |
| Từ chối cả kho | Nhất quán tuyệt đối với hồ sơ trước, **nhưng**: `loadEnvStore` thu kho không-đọc-được về `{}`, nên MỘT con số trong file làm MỌI khoá biến mất khỏi mọi lượt chạy plugin — đúng cái tai nạn to hơn lỗi mà quyết định 2 của hồ sơ trước đã cảnh báo. |
| Giữ nguyên, chỉ báo | Vẫn mất, chỉ là mất có thông báo; mà chỗ hiện thông báo nằm ở lớp giao diện, tức đẩy sang gói A2 chứ không đóng được ở đây. |

**Giới hạn của phép đổi:** object, mảng, `null` **không có dạng chuỗi hợp lý** —
`String({a:1})` ra `"[object Object]"`, biến một lỗi thành một giá trị rác trông hợp lệ.
Những cái đó vẫn từ chối cả kho (`unreadable/shape`), tái dùng nguyên bộ máy từ-chối +
nút thoát hiểm mà hồ sơ trước đã dựng và đã đo.

Khoá rỗng hoặc toàn khoảng trắng cũng vậy: một tên biến môi trường rỗng không sửa được
bằng phép đổi kiểu, nên nó là kho hỏng, không phải kho cần chữa.

## 4. Ba thay đổi

### 4.1 `coerceEnv` — đổi được thì đổi, không đổi được thì từ chối

Bảng quyết định đóng, mỗi ô một hành vi:

| Giá trị trên đĩa | Hành vi |
|---|---|
| `string` | giữ nguyên |
| `number`, `boolean` | `String(v)` — giữ khoá |
| `object`, `array`, `null` | **cả kho** → `unreadable/shape` |
| khoá rỗng / toàn khoảng trắng | **cả kho** → `unreadable/shape` |

Không ô nào rơi vào khoảng trống, và **không ô nào bỏ qua im lặng**.

### 4.2 `saveEnvStore` — ném lỗi thay vì lọc lặng

Tham số của nó khai kiểu `EnvStore = Record<string, string>`, nên một giá trị không
phải chuỗi tới được đây là **lỗi lập trình, không phải dữ liệu người dùng**. Lọc lặng
một lỗi lập trình là giấu nó. Ném lỗi có tên là cổng cuối trước khi chạm đĩa.

### 4.3 `writeSettingsBlob` — ghi tạm rồi đổi tên

Ghi vào file tạm **cùng thư mục** (đổi tên khác hệ thống file không nguyên tử), rồi
`renameSync` đè lên đích. Người đọc song song luôn thấy **hoặc bản cũ trọn vẹn, hoặc
bản mới trọn vẹn** — không bao giờ thấy file cụt.

**Chữ ký hàm giữ NGUYÊN.** `@ext/settings-store` là seam: vỏ cloud có bản
`src/ext/settings-store.ts` riêng, gitignored, nằm ở repo khác. Đổi chữ ký là làm hỏng
nó âm thầm — hồ sơ trước đã cố ý giữ nguyên vì lý do này, và ràng buộc đó còn nguyên.

## 5. Cách đo tính nguyên tử — chỗ khó nhất

Một lời hứa "không bao giờ thấy file cụt" khó đo bằng một lượt gọi hàm. Ba khẳng
định, mỗi cái đo một nửa khác nhau:

1. **Cấu trúc:** sau một lượt ghi thành công, **không còn file tạm** nào sót lại, và
   tên file tạm nằm **cùng thư mục** với đích.
2. **Người đọc song song:** trong lúc ghi một khối lớn, một vòng đọc liên tục phải
   thấy **mọi mẫu đều hoặc là bản cũ trọn vẹn, hoặc là bản mới trọn vẹn** — không mẫu
   nào là JSON hỏng hay chuỗi rỗng.
3. **Chiều đỏ, chạy tay ở S3, không vào bộ thử thường xuyên:** cùng phép đo (2) chạy
   trên bản `writeFileSync` cũ phải ĐỎ — bắt được ít nhất một mẫu cụt. Ghi số quan sát
   được vào bằng chứng.

Khẳng định (2) là chỗ duy nhất thật sự phân biệt hai cách ghi; (1) một mình sẽ xanh cả
với bản cũ (bản cũ không tạo file tạm nào để mà sót). Nêu ra đây để nó không trôi qua
thành "đã đo tính nguyên tử".

## 6. Ngoài phạm vi

- **Bộ lọc lặng ở `route.ts` dòng 105** — cửa thứ ba. Chạm `src/app/api/**` là hoá T3,
  thêm một cổng người, đổi lấy một đường mà client **đã thấy được** kết quả (dòng 137
  trả lại bản đã lọc). Đáng một hợp đồng riêng, không đáng nâng hạng gói này.
- **Hiện cảnh báo trên màn Cài đặt khi kho bị đổi kiểu** — lớp giao diện, thuộc gói A2.
- **Mã hoá kho ở bản OSS** — codec là seam, để trống có chủ ý (kế thừa hồ sơ trước).
- **Versioning / migrate schema `settings.json`** — chưa có nhu cầu.
- **Đo tính nguyên tử bằng cách giết tiến trình thật** — bất định theo máy; khẳng định
  người-đọc-song-song ở §5 rẻ hơn và phân biệt được cùng một thứ.

## 7. Giá phải trả

Ba file, không file mới. Không chạm `src/app/api/**` nên **T2, hai cổng người**.
Lượt đóng dấu lại: đo bằng `paths` đã khai của các hồ sơ — cận trên 3
(`add-media-library`, `byo-key-onboarding`, `chong-mat-khoa-byo`), số thật do cổng
quyết. *(Phương pháp này dự đoán 3 và cổng chỉ đòi 1 ở hồ sơ liền trước, nên con số
trên là cận trên, không phải lịch.)*
