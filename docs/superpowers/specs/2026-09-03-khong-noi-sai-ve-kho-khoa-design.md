# Không nói sai về kho khoá

**Ngày:** 2026-09-03 · **Slug:** `khong-noi-sai-ve-kho-khoa` · **Hạng:** T3

## Bối cảnh

Hai hồ sơ trước dựng được nửa lời hứa. `chong-mat-khoa-byo` (server, 31/08) dạy
kho khoá nói "tôi hỏng" thay vì giả dạng rỗng; `chong-mat-khoa-byo-giao-dien`
(giao diện, 02/09) dạy ba bề mặt nghe câu đó và từ chối ghi đè. Hội đồng review
của hồ sơ thứ hai tìm ra bốn phát hiện HIGH, tất cả **ngoài hợp đồng** — owner
định đoạt «mở hợp đồng mới» tại Cổng 2 ngày 02/09. Đây là hợp đồng đó.

Bốn phát hiện, gọn (chi tiết nguyên văn ở
[`review-findings.md`](../../../_acceptance/chong-mat-khoa-byo-giao-dien/review-findings.md)
của hồ sơ trước):

| # | Ở đâu | Chuyện gì |
|---|---|---|
| Ngoài-1 | [`route.ts:115-131`](../../../src/app/api/settings/env/route.ts) | `replaceUnreadableStore: true` chỉ dùng để **bỏ nhánh 409**. Kho lành thì cờ bị bỏ qua hoàn toàn và `saveEnvStore({})` vẫn chạy. |
| Ngoài-2 | [`env-client.ts:85-100`](../../../src/lib/settings/env-client.ts) | Bỏ `@/lib/api/client` làm mất seam `tf:unauthorized` và trần 30s. Phiên hết hạn hiện ra thành «kho hỏng» kèm nút xoá kho. |
| Ngoài-3/7 | `abi-node-shell.tsx:229` | Ghi khoá thất bại map vào phase `saved-unverified` → dấu tick xanh «Đã lưu khoá». **Không thuộc hồ sơ này** — xem Ngoài phạm vi. |

Đọc mã lúc mở hồ sơ lộ thêm một điều **chưa ai nêu**, và nó đổi hình bài toán:

> `PUT` là **ghi đè toàn phần**. `saveEnvStore(env)` thay trọn kho bằng thân yêu
> cầu; việc *hợp nhất* khoá cũ với khoá mới xảy ra **ở client** (`saveEnvKeys`
> đọc trước rồi PUT hợp nhất). Nên một `PUT {env:{}}` **không cờ** cũng xoá sạch
> kho lành y hệt. Cờ không phải thứ làm lượt ghi thành phá huỷ — nó chỉ là cái
> chốt duy nhất đang có, và chốt ấy không kiểm tiền đề của chính mình.

Owner chọn **phương án hẹp** cho vòng này (canh cờ + sửa phân loại client), và
đường PUT-rỗng-không-cờ thành Known limit **có tên** cộng một hồ sơ kế.

Vì sao hợp đồng cũ lọt: nó khoanh phạm vi theo **bề mặt** — màn Cài đặt, hai
panel. Khuyết tật sống ở **bất biến phía server**, thứ không thuộc bề mặt nào,
nên scope-triage đặt nó ra ngoài một cách đúng luật. Hợp đồng này khoanh theo
bất biến.

## Bất biến

> **Không bề mặt nào — kể cả server — được nói sai chuyện gì đã xảy ra với kho khoá.**

Cụ thể hoá thành hai lời khai, mỗi lời chỉ được nói khi có **căn cứ dương**:

1. «Kho hỏng» chỉ được nói khi có **tín hiệu dương** rằng kho hỏng — không suy
   từ phần bù của «đọc được».
2. «Xoá kho vì nó hỏng» chỉ được thi hành khi **server tự xác nhận** kho hỏng —
   không nhận lời khai của client.

Một bề mặt thứ tư ra đời vẫn bị hai câu này ràng, vì chúng không nhắc tên bề mặt.

## Năm quyết định load-bearing

### 1. Server kiểm tiền đề của cờ — [`route.ts`](../../../src/app/api/settings/env/route.ts)

Hôm nay:

```
current = await readEnvStore()
if (current.state === "unreadable" && !replaceUnreadable) → 409, không ghi
await saveEnvStore(env)                                    // mọi trường hợp còn lại
```

Kho lành + cờ bật → rơi thẳng vào dòng cuối. Đổi thành cặp đối xứng:

```
current = await readEnvStore()
if (current.state === "unreadable" && !replaceUnreadable) → 409 ENV_STORE_UNREADABLE  (giữ)
if (current.state !== "unreadable" &&  replaceUnreadable) → 409 ENV_STORE_REPLACE_REFUSED, body.state ∈ {ok, absent}, KHÔNG ghi
await saveEnvStore(env)
```

- Nhánh trên chặn **ghi-đè-mù** (đã có). Nhánh dưới chặn **xoá-dựa-trên-tiền-đề-sai** (mới).
- Cùng một `readEnvStore()` đã gọi sẵn — không thêm lượt đọc.
- `absent` cũng bị từ chối. Tiền đề sai thì từ chối; không có ngoại lệ vì «xoá rỗng vô hại».
- Mã lỗi **riêng** (`ENV_STORE_REPLACE_REFUSED`) để client phân biệt được với 409 cũ. Cùng số HTTP, khác `code` — client đọc `code`, không đọc số.

**Tính chất hay ra tự nhiên:** ca đua — client đọc thấy hỏng, người dùng bấm, giữa
hai lượt có tab khác sửa kho — server thấy `ok` → 409 → client đọc lại → thấy
khoá. Bất biến giữ mà không cần luật riêng cho đua.

### 2. Client phân loại dương **cả hai chiều** — [`env-client.ts`](../../../src/lib/settings/env-client.ts)

Hôm nay `readEnvForBrowser` khai dương cho *một* kết luận («đọc được» = 200 +
`env` là object) rồi để **phần bù** rơi vào `unreadable`. Chú thích gọi đó là
"positive assertion", nhưng nó chỉ dương một chiều — mọi sự cố chưa nghĩ tới
(proxy 502, hết phiên 401, trang lỗi HTML, mạng rớt) đều bị gán vào cái tên nặng
nhất đang có. Đó là gốc chung của cả bốn phát hiện.

Đổi: **cả hai** kết luận nặng đều phải có tín hiệu dương; phần bù rơi vào một tên
trung tính.

| Tín hiệu | Kết luận | Căn cứ |
|---|---|---|
| 200 + `env` là object không-mảng | `ok` | dương (giữ) |
| 503 + `code: ENV_STORE_UNREADABLE` | `store-unreadable` | dương — server đã nói tên |
| **401** | `unauthenticated` | dương — khớp điều kiện seam của `apiClient` (`client.ts:171`, chỉ 401) |
| mọi thứ còn lại: 403, 5xx khác, không-JSON, `env` sai hình, mạng rớt, **quá trần** | `unavailable` | phần bù — tên trung tính |

Union trả về:

```ts
type ReadResult =
  | { state: "ok"; env; pluginEnv }
  | { state: "store-unreadable"; reason: EnvStoreReadReason }   // từ body 503
  | { state: "unauthenticated" }
  | { state: "unavailable"; reason: { code: "http" | "not-json" | "no-env" | "network" | "timeout"; status?: number; detail?: string } };
```

`403` **không** phải `unauthenticated`: đó là *đã đăng nhập nhưng bị cấm*; bắn seam
đăng-nhập-lại cho nó là nói sai — đúng lớp lỗi hồ sơ này chống.

### 3. Seam `tf:unauthorized` thành helper dùng chung — [`client.ts`](../../../src/lib/api/client.ts)

Dispatch hiện nằm **bên trong** hàm request của `apiClient` (`client.ts:171-177`),
không export. Chép nó sang `env-client` là **bản sao thứ hai** của seam — tái tạo
đúng «ba nơi tự viết ba lần» mà cả dòng hồ sơ này chống. Rút thành:

```ts
// src/lib/api/client.ts
/** Fires the cancelable shell seam. Returns true when a shell handled it. */
export function notifyUnauthorized(): boolean
```

`apiClient` gọi nó thay cho khối inline; `env-client` gọi nó ở nhánh 401. Một chỗ
định nghĩa `cancelable: true` và tên sự kiện.

Chạm `src/lib/api/client.ts` — thêm một tệp vào diff, **không đổi hạng** (không
thuộc `t3_paths`).

### 4. Trần 30s cho **cả** đọc lẫn ghi

`AbortController` + `setTimeout(30_000)` bọc cả `readEnvForBrowser` lẫn `put()`.
Abort → `unavailable` với `reason.code = "timeout"`. Phát hiện gốc nêu
`saveEnvKeys` treo ở `verifying` mãi — nên trần chỉ ở đường đọc là nửa vời.
Hằng số dùng chung với `apiClient` (đang là `30000`).

### 5. Client làm gì với 409 mới

`replaceUnreadableStore()` nhận 409 + `ENV_STORE_REPLACE_REFUSED` → **đọc lại**
(`readEnvForBrowser`) và render theo kết quả đọc. Kho lành → form với khoá. Không
hiện lỗi: server vừa nói «tiền đề của bạn sai», hành động trung thực là kiểm lại
tiền đề, không phải báo lỗi cho người dùng về một sự cố không tồn tại.

Đặc tả server mà bỏ lửng đầu client là nửa câu — lỗ này gap-probe sẽ bắt, nên
đóng trước.

## Ba bề mặt × bốn trạng thái

Cả ba bề mặt đi qua `readEnvForBrowser` (E11 của hồ sơ trước canh điều đó). Hành
vi theo trạng thái **khác nhau theo bề mặt**, và bảng này là thứ eval phải đo toàn
phần — không được thu về «có/không tấm chặn».

| Trạng thái | Cài đặt (`settings-dialog`) | Node key prompt (`abi-node-shell`) | Media-library panel |
|---|---|---|---|
| `ok` | form, Lưu bấm được | form khoá | form cấu hình |
| `store-unreadable` | tấm chặn «kho hỏng» + **Thử lại** + **nút phá huỷ** (→ hộp xác nhận → PUT có cờ) | tấm chặn «kho hỏng» + Thử lại + link Cài đặt; **0 nút phá huỷ** | như node prompt |
| `unauthenticated` | tấm chặn «phiên đã hết» + Thử lại; **0 nút phá huỷ**; seam đã bắn | như Cài đặt (không link Cài đặt — cùng phiên) | như node prompt |
| `unavailable` | tấm chặn «không tới được» + lý do + Thử lại; **0 nút phá huỷ** | như Cài đặt | như node prompt |

Bất biến đọc ra từ bảng: **nút phá huỷ tồn tại ở đúng một ô.** Thử lại tồn tại ở
mọi ô không-`ok`. `PUT` = 0 ở mọi ô không-`ok` trừ khi người dùng đi qua hộp xác
nhận ở ô duy nhất có nút.

`StoreUnreadableNotice` hôm nay nhận `reason: string`. Mở rộng nhận `state` +
`onRetry`, giữ `data-testid="store-unreadable-notice"` cho ô `store-unreadable`
(E2/E6 cũ khẳng định ba bề mặt render *chính* component này). Hai trạng thái mới
render **cùng component** với `data-testid` riêng — một chỗ định nghĩa, ba bề mặt
dùng.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở Cài đặt / node cần khoá → đọc kho `ok` → form → Lưu → PUT hợp nhất → xong (điểm ra: form với khoá mới)
- Biên: kho `absent` (chưa lưu gì) → `ok` với `env: {}` → form rỗng, không tấm chặn
- Lỗi & quay lại: đọc ra `unauthenticated`/`unavailable` → tấm chặn nêu đúng tên + Thử lại → đọc lại → về suôn sẻ. Đọc ra `store-unreadable` → tấm chặn + Thử lại + (chỉ ở Cài đặt) nút phá huỷ → hộp xác nhận → PUT có cờ → 200: form rỗng · 409 `ENV_STORE_REPLACE_REFUSED`: đọc lại, về form với khoá

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Khoá API | sửa và lưu khoá BYO | menu / đóng dialog |
| Tấm chặn (trong ba bề mặt) | nói đúng tên sự cố đọc và mời một hành động an toàn | đọc thất bại / Thử lại → form |
| Hộp xác nhận thay kho | xác nhận mất mọi khoá, không khôi phục | nút phá huỷ / huỷ → tấm chặn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-caidat-dang-doc | Cài đặt | spinner + «Đang đọc kho khoá…» | chờ (trần 30s) |
| ST-caidat-ok | Cài đặt | form khoá, Lưu bấm được | sửa / Lưu |
| ST-caidat-kho-hong | Cài đặt | tấm chặn «Không đọc được kho khoá đã lưu (lý do). Chưa có gì bị thay đổi.» + Thử lại + «Thay kho bằng kho rỗng…» | Thử lại / mở hộp xác nhận |
| ST-caidat-chua-dang-nhap | Cài đặt | tấm chặn «Phiên đã hết. Chưa có gì bị thay đổi.» + Thử lại | đăng nhập lại (vỏ) / Thử lại |
| ST-caidat-khong-toi-duoc | Cài đặt | tấm chặn «Không tới được máy chủ khoá (lý do). Chưa có gì bị thay đổi.» + Thử lại | Thử lại |
| ST-caidat-tu-choi-xoa | Cài đặt | (thoáng) → đọc lại → ST-caidat-ok | không gì — máy tự về form |
| ST-canvas-kho-hong | node prompt / ML panel | tấm chặn «kho hỏng» + Thử lại + link Cài đặt | Thử lại / mở Cài đặt |
| ST-canvas-chua-dang-nhap | node prompt / ML panel | tấm chặn «phiên đã hết» + Thử lại | đăng nhập lại / Thử lại |
| ST-canvas-khong-toi-duoc | node prompt / ML panel | tấm chặn «không tới được» + Thử lại | Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thử lại gọi đúng `readEnvForBrowser` một lần; đang đọc thì nút tắt (chống bấm đúp).
- Nút phá huỷ chỉ render khi `state === "store-unreadable"` **và** bề mặt là Cài đặt.
- Chuỗi nhãn từ catalogue i18n (5 locale), không literal — E12 cũ đã ghim quan hệ này.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `StoreUnreadableNotice` | mở rộng | thêm `state` + `onRetry`; giữ testid cũ cho ô kho-hỏng |
| nút Thử lại | dùng (`Button variant=outline`) | không có gì mới |
| `notifyUnauthorized()` | tạo (helper, không phải UI) | rút seam khỏi `apiClient` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn (dialog hiện có, không đổi).
Căn cứ: luồng hiển nhiên — không đổi khuôn của màn Cài đặt, chỉ đổi nội dung tấm chặn; không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

Mỗi phép đo mới đi kèm cặp hai-chiều trên cùng fixture (MEASURE-BIRTH-CLAUSE).
Ba lớp, và chỗ mỏng nói trước:

| Lớp | Xanh | **Đỏ** (chiều bắt buộc) |
|---|---|---|
| Server | kho lành (temp dir thật, ghi bằng `saveEnvStore`) + PUT `{env:{}, replaceUnreadableStore:true}` → 409 `ENV_STORE_REPLACE_REFUSED` **và** sha tệp kho không đổi; kho `absent` + cờ → 409; kho `unreadable` + cờ → 200 và kho rỗng (đường hợp lệ vẫn sống) | gỡ nhánh mới → ca kho-lành đỏ, thông điệp nêu **số khoá còn lại** (0 thay vì N), không chỉ mã HTTP |
| Client taxonomy | ma trận toàn phần **9 tín hiệu** (200-ok · 503+code · 401 · 403 · 500 · 502-html · not-json · network · timeout) → đúng `state`, mỗi ca thông điệp nêu tên tín hiệu | thu về `if (!ok) unreadable` cũ → đúng **7** ca đỏ (mọi ca trừ 200 và 503+code) |
| Ba bề mặt | 3 bề mặt × 4 trạng thái = **12 ca**, số ghim thành hằng: `state` đúng · số nút phá huỷ (1 ở đúng một ô, 0 ở 11 ô) · số nút Thử lại (0 ở `ok`, 1 ở còn lại) · `PUT` = 0 | gỡ điều kiện bề-mặt-là-Cài-đặt khỏi nút phá huỷ → 2 ca đỏ (canvas × kho-hỏng), thông điệp nêu bề mặt + trạng thái |
| 409 → đọc lại | mock PUT 409 `REPLACE_REFUSED` rồi GET 200 → form với khoá, 0 tấm chặn, đúng 1 GET sau PUT | bỏ lượt đọc lại → đỏ, nêu số GET đếm được |
| Seam | 401 → đúng 1 `CustomEvent("tf:unauthorized")` trên `window`, `cancelable: true`; 403 → 0 sự kiện | gỡ lời gọi → 0 sự kiện ở 401, đỏ nêu «expected 1 dispatch, got 0» |
| Trần | fetch không bao giờ resolve + fake timers 30 001ms → `unavailable`/`timeout` cho **cả** đọc lẫn ghi | gỡ `AbortController` khỏi `put()` → ca ghi treo, đỏ theo timeout của test (5s) |
| Guard | `check-one-env-reader.sh` + teeth vẫn xanh (đường dây không đổi) | — carry |

**Chỗ mỏng, khai trước:** người nghe `tf:unauthorized` sống ở `src/ext/` — đường
**bị gitignore**, ngoài kho. Phép đo khẳng định được sự kiện *được bắn ra* với
đúng hình dạng; **không** khẳng định được vỏ phản ứng. Đó là Known limit có tên
từ Cổng 1, không phải điều lộ ra ở Cổng 2.

## Ngoài phạm vi — mỗi mục có tên

1. **`PUT` vẫn là ghi đè toàn phần, hợp nhất vẫn ở client.** `PUT {env:{}}` không
   cờ vẫn xoá sạch kho lành. Owner hoãn có chủ ý: chuyển hợp nhất về server đổi hợp
   đồng dây và chạm mọi biểu mẫu. Hôm nay không call-site nào gửi thân đó — nhưng
   «không ai gửi» là sự thật về *call-site*, không phải về *hợp đồng dây*. → Known
   limit có tên + hồ sơ kế.
2. **Ngoài-3/7 — ghi khoá thất bại hiện dấu tick xanh «Đã lưu khoá».** Vẫn HIGH,
   vẫn mở. Cần phase riêng + copy 5 locale; owner tách khỏi vòng này. → hồ sơ riêng.
3. **Ngoài-4/9 — `pluginEnv` cast mù, `fetchEnv` mất catch.** Đã là Known limit
   mục 2 của hồ sơ trước; không kéo vào đây dù cùng tệp.
4. Đổi `apiClient` sang trả kết quả có cấu trúc thay vì throw+toast. Ngoài đề.

## Giới hạn đã biết trước khi Cổng 1

- Seam: đo được «bắn», không đo được «vỏ đáp» (ở trên).
- Trần 30s dùng fake timers, không đo mạng thật.
- Bốn trạng thái là của **lượt đọc**; lượt **ghi** thất bại vẫn đi đường
  `writeFailed` cũ (Ngoài-3/7) — hồ sơ này không sửa cách lượt ghi *hiện ra*.
