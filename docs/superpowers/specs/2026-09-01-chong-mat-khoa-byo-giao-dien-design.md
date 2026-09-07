# Chống mất khoá BYO — nửa giao diện

**Ngày:** 2026-09-01 · **Slug:** `chong-mat-khoa-byo-giao-dien` · **Hạng:** T2

## Bối cảnh

Nửa máy chủ đã ship (`chong-mat-khoa-byo`, PR #87, `signed-off` 31/08):
`GET /api/settings/env` trả **503** kèm `code: ENV_STORE_UNREADABLE` khi kho khoá
không đọc được, và `PUT` trả **409, không ghi gì** trừ khi thân yêu cầu mang
`replaceUnreadableStore: true`. Kho đã biết nói "tôi hỏng" thay vì giả dạng rỗng.

Giao diện thì chưa nghe. Đo trên `main` @ `1d66bc2`:

| Chỗ | Hôm nay | Hậu quả |
|---|---|---|
| [`settings-dialog.tsx:327-333`](../../../src/components/workspace/settings-dialog.tsx) | `catch { logger.error(...) }` | form rỗng, nút Lưu bấm được → lượt lưu kế xoá sạch |
| [`abi-node-shell.tsx:107-109`](../../../src/components/workspace/nodes/base/abi-node-shell.tsx) | không kiểm `loaded.ok` | `current.env` là `undefined` → vẫn gửi `PUT` (máy chủ chặn bằng 409) |
| [`media-library-config-panel.tsx:48-63`](../../../src/components/workspace/nodes/add/media-library-config-panel.tsx) | có kiểm `!current.ok` | không gửi `PUT`, nhưng chỉ nói "đọc lỗi", không dẫn đi đâu |
| [`config.server.ts:23-40`](../../../src/lib/media-library/config.server.ts) | dùng `loadEnvStore()` (bản tha thứ) | kho hỏng → `{}` → báo "thiếu MEDIA_LIBRARY_API_KEY" → dẫn thẳng vào đường mất dữ liệu |

Sáu tiêu chí AC-9…AC-14 đã được viết và duyệt ở Cổng 1 của hợp đồng cha rồi rời
phạm vi theo Amendment 1 (31/08). Gói này là hợp đồng kế thừa chúng.

**Bốn vật của phiên trước KHÔNG được commit** và phải dựng lại từ đầu:
`src/components/proto/chong-mat-khoa-byo-proto.tsx`,
`scripts/settings/check-a11y-proto.sh`, `src/i18n/locale-parity.test.ts`
(`git log --all` rỗng cho cả ba). Thứ duy nhất thừa hưởng được là
[`design-pass.md`](../../../_acceptance/chong-mat-khoa-byo/design-pass.md) của hồ sơ cha.

## Ba quyết định load-bearing

### 1. Một bộ đọc dùng chung cho trình duyệt, cổng theo lối fail-CLOSED

Hôm nay ba thành phần tự viết ba lần `fetch("/api/settings/env")` với ba cách xử
lý lỗi khác nhau — và cả ba đều sai theo một kiểu riêng. Viết lại luật phân loại
ba lần nữa chính là cơ chế đã đẻ ra lỗi hiện tại.

Nên: **một** hàm, `readEnvForBrowser()` trong `src/lib/settings/env-client.ts`,
trả về union đóng phản chiếu union của máy chủ:

```ts
export type EnvClientRead =
    | { state: "ok"; env: Record<string, string>; pluginEnv: PluginEnvDecl[] }
    | { state: "unreadable"; reason: string };
```

Cổng là **khẳng định dương**: `state: "ok"` CHỈ khi status 200 ∧ thân parse được ∧
`env` là object thường. Mọi thứ khác — 503 có mã, 500, 502 proxy, 200 kèm trang
HTML, `env` thiếu, `fetch` ném, timeout — đều thành `unreadable`.

Vì sao không phải `if (status === 503)`: proxy 502 và trang HTML lỗi **không bao
giờ mang mã** `ENV_STORE_UNREADABLE`. Bài học số 2 mà hợp đồng cha ra lệnh mang
theo nêu đích danh ba ca đó. Một cổng kiểm mã là một cổng chỉ đóng khi máy chủ
lịch sự.

### 2. Lượt ghi huỷ-diệt chỉ tồn tại ở MỘT chỗ

Chỉ `settings-dialog` dựng được `PUT` mang `replaceUnreadableStore: true`. Hai
panel trên node không có đường tới nó — không phải vì chúng "nhớ không bấm", mà
vì hàm dựng lượt ghi đó không nằm trong tầm với của chúng. Đó là cách rẻ nhất để
AC-12 ("hai panel này không có nút thoát") đúng theo cấu trúc chứ không theo kỷ luật.

Lượt ghi đó đi qua một **chốt một-chuyến** (`useRef`): bấm đúp nút xác nhận vẫn
ra đúng một `PUT`. AC-11 đòi "đúng MỘT PUT" — mà bấm đúp là cách thường gặp nhất
để thành hai.

### 3. `resolveConfig` chỉ tuyên "kho hỏng" SAU KHI dự phòng `process.env` thất bại

Bài học số 1 của hợp đồng cha. Union thành ba nhánh:

```ts
export type ResolveConfigResult =
    | { ok: true; config: MediaLibraryConfig }
    | { ok: false; kind: "missing"; missing: string[]; message: string }
    | { ok: false; kind: "store-unreadable"; reason: EnvStoreReadReason; message: string };
```

Thứ tự: đọc kho → kho hỏng thì **vẫn thử** `process.env` → chỉ khi `process.env`
không cấp đủ **cả hai** giá trị mới tuyên `store-unreadable`. Bản triển khai chạy
bằng biến môi trường không bị một tệp settings hỏng hạ node.

Ca biên đã chốt: kho hỏng ∧ `process.env` cấp *một phần* → **`store-unreadable`**,
không phải `missing`. Vì giá trị còn thiếu rất có thể đang nằm trong kho hỏng, và
nói "thiếu MEDIA_LIBRARY_API_KEY" là dẫn người dùng đi nhập lại — đúng đường mất
dữ liệu mà hồ sơ này tồn tại để chặn.

Thêm nhánh vào union đóng là **cưỡng chế lúc biên dịch**: `tsc` sẽ chỉ mặt cả hai
nơi tiêu thụ (`import.server.ts:189`, `client.server.ts:24`). Đúng luật
"contract enforcement: compile-time only" của CLAUDE.md.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở màn Cài đặt → `GET` trả kho lành → form khoá như hôm nay (điểm ra: Lưu)
- Biên: kho **không đọc được** → form khoá bị THAY bằng tấm nêu lý do; nút Lưu hiện diện nhưng tắt; đúng một nút thoát → bấm → hộp xác nhận huỷ-diệt → xác nhận → `PUT {env:{}, replaceUnreadableStore:true}` → refetch → về form bình thường, trống
- Biên: gặp kho hỏng **từ node** (panel media-library hoặc ô khoá ABI) → panel từ chối lưu, nói lý do, chỉ sang màn Cài đặt; **không** có nút thoát ở đây
- Lỗi & quay lại: lượt ghi-đè thất bại (500/mạng đứt) → tấm giữ nguyên trạng thái kho-hỏng + nêu lỗi ghi; đường quay lại là bấm thoát lần nữa

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt (kho hỏng) | nói kho hỏng và chặn mọi lối ghi vô tình | nút Cài đặt trên thanh điều hướng / hộp xác nhận |
| Hộp xác nhận huỷ-diệt | bắt người dùng nói "tôi chấp nhận mất khoá cũ" | nút thoát / về màn Cài đặt |
| Panel node (kho hỏng) | từ chối lưu và chỉ đường sang Cài đặt | node trên canvas / màn Cài đặt |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-caidat-store-unreadable | Cài đặt | tấm `role="alert"`: lý do đọc được + "chưa có gì bị thay đổi"; nút Lưu `disabled`; đúng 1 nút thoát | đóng màn, hoặc bấm thoát |
| ST-caidat-store-unreadable-confirm | Cài đặt | `role="alertdialog"`: "mọi khoá đang lưu sẽ mất và không khôi phục được"; nút huỷ + nút xác nhận `variant="destructive"` | xác nhận hoặc huỷ |
| ST-caidat-replace-failed | Cài đặt | vẫn tấm kho-hỏng + dòng lỗi ghi | bấm thoát lần nữa |
| ST-node-panel-unreadable | panel node | tấm `role="alert"` + lối sang Cài đặt; KHÔNG nút thoát, KHÔNG ô nhập | sang Cài đặt |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nút Lưu ở ST-caidat-store-unreadable: `disabled` — **hiện diện chứ không ẩn**. Ẩn đi thì người dùng không học được rằng lưu đang bị chặn, và tiêu điểm bàn phím nhảy chỗ giữa hai lần render.
- Nút xác nhận huỷ-diệt: `buttonVariants({ variant: "destructive" })` của repo, không chép tay class — bản chép tay ở phiên trước đánh rơi cả nhánh dark-mode lẫn vòng tiêu điểm.
- Chốt một-chuyến trên lượt ghi-đè: bấm đúp ra đúng một `PUT`.
- Bản mẫu đóng dấu `data-proto-state` lên gốc; tên state lạ render `unknown:<name>` chứ không im lặng rơi về mặc định.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `ui/alert-dialog` | dùng | hộp xác nhận huỷ-diệt đã có sẵn, có `role="alertdialog"` |
| `ui/button` (`variant="destructive"`) | dùng | biến thể sẵn có mang đủ nhánh dark + vòng tiêu điểm |
| `settings/store-unreadable-notice.tsx` | tạo | tấm dùng chung cho ba bề mặt; nhận nhãn qua props nên mỗi bề mặt cấp chuỗi từ namespace của nó |
| `lib/settings/env-client.ts` | tạo | một bộ đọc fail-closed thay ba lối tự viết |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: **một-cột-cuộn**
Căn cứ: luồng hiển nhiên — đây là một trạng thái lỗi thay chỗ một form đã tồn tại
trong một `Dialog` một cột; không có ≥2 khuôn khả dĩ nên không tra mẫu. Hộp xác
nhận là lớp phủ chuẩn của cùng khuôn.
<!-- UX-SPEC-TEMPLATE>>> -->

## Phép đo

| AC | Đo bằng | Chiều đỏ |
|---|---|---|
| AC-9 | vitest `config.server.test.ts` | kho hỏng ∧ env vắng → `kind:"store-unreadable"`; kho hỏng ∧ env đủ → `ok:true` |
| AC-10 | vitest `settings-dialog.test.tsx`, nạp **năm** hình dạng lỗi | 503 · 500 · 200+HTML · 200+thân sai · fetch ném — cả năm cùng ra tấm chặn |
| AC-11 | vitest, đếm lượt gọi `fetch` | bấm đúp → đúng 1 `PUT`, cờ `true`, và **0** `PUT` không cờ trước đó |
| AC-12 | vitest × 2 panel | `fetch.mock.calls.filter(PUT).length === 0` ở cả hai |
| AC-13 | vitest `locale-parity.test.ts` | parity TOÀN bộ 5 tệp, allowlist đóng băng 76 khoá `ja` đang nợ |
| AC-14 | `scripts/settings/check-a11y-proto.sh` → axe trong Chrome thật | 6 trang, đọc lại `data-proto-state` + trục sáng/tối khỏi trang |

**Vì sao AC-14 KHÔNG đo bằng `executors.design.gate`:** gate đó chạy dưới jsdom,
phân giải 188 cssRules trên 153KB CSS nội tuyến (đo 31/08), nên mọi phần tử đọc ra
là chữ đen trên nền trong suốt; và toàn bộ luật của nó là ba bộ dò slop thẩm mỹ.
Một AC "đạt sàn tương phản" đo bằng dụng cụ đó là lời hứa hằng đúng. Dụng cụ thật
là `scripts/a11y-scan.mjs` (axe-core + Chrome thật, thoát 3 khi không với tới trang).

**Vì sao wrapper a11y chép từ `scripts/media-library/`, không phải `scripts/onboarding/`:**
bản media-library đặt `NEXT_DIST_DIR` riêng. `pnpm build` là một suite key chạy
SONG SONG; một lượt build hạ cánh giữa lúc quét sẽ xoá chunk server đang phát, và
chỉ TRANG chết nên eval route vẫn xanh — vòng hỏng đọc ra như vòng sạch. Bản này
lấy `build/kkt-a11y` và cổng `3197` (3198 media-library, 3199 onboarding, 3000 dev).

## Ngoài phạm vi

- **Giữ bản hỏng trước khi ghi đè.** Quyết định 4 của owner (31/08) đã tách thành
  hợp đồng con riêng. Đổi lại: bấm thoát là mất khoá cũ thật, hộp xác nhận của
  AC-11 là toàn bộ hàng rào.
- **Nhóm đọc-để-chạy** (`withStoredEnv`, `director.server.ts`) giữ nguyên hành vi —
  quyết định 2 của owner: một tệp settings hỏng không được chặn cả node cục bộ vốn
  không cần khoá nào.
- **76 khoá `ja` đang nợ** không được dịch trong gói này; chúng vào allowlist đóng
  băng của phép đo parity. Nợ không thể lớn thêm, nhưng cũng không co lại ở đây.
- **`KEY_PROMPT_LABELS` tiếng Việt ghi cứng** trong `abi-node-shell.tsx:42` là nợ
  i18n có trước. Gói này chỉ đưa **chuỗi mới** qua `next-intl`, không dọn nợ cũ.
- **Vỏ cloud** (`src/ext/`, gitignored) không có thước trên máy này — kế thừa
  `[GIẢ ĐỊNH]` của hợp đồng cha.
