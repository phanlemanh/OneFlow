---
schema_version: 1
feature: Chống mất khoá BYO — kho khoá từ chối ghi đè khi không đọc được, thay vì giả dạng rỗng
slug: chong-mat-khoa-byo
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: implemented
design_doc: docs/superpowers/specs/2026-08-31-chong-mat-khoa-byo-design.md
approved_by: Phan Le Manh
approved_at: 2026-08-30T22:03:03Z
---

# Acceptance Contract: chong-mat-khoa-byo

## Context

Kho khoá BYO không phân biệt **"chưa lưu khoá nào"** với **"không đọc được kho khoá"** —
hai trạng thái phát ra cùng một tín hiệu (`{}` kèm HTTP 200), nên lần lưu kế tiếp xoá sạch
mọi khoá cũ, im lặng và không khôi phục được.

Đo trên `main` @ `b669b42`: [`env-store.server.ts:40`](../../src/lib/settings/env-store.server.ts)
`catch { return {} }`; [`:28-30`](../../src/lib/settings/env-store.server.ts) trả `{}` cho
JSON hợp lệ nhưng không phải object; [`ext-default/settings-store.ts:23-25`](../../src/ext-default/settings-store.ts)
có `catch { return null }` **thứ hai** khiến lỗi I/O thật thành "chưa có file" trước khi lõi
nhìn thấy; [`route.ts:92-95`](../../src/app/api/settings/env/route.ts) PUT thay toàn bộ map.

Chốt chặn phía client trong [`media-library-config-panel.tsx:48-63`](../../src/components/workspace/nodes/add/media-library-config-panel.tsx)
đã **cố ý** chặn đúng lỗi này (comment tự khai) nhưng chỉ kiểm "là object" — mà `{}` là
object hợp lệ. Nó không thể đúng khi máy chủ đã bóp hai trạng thái vào một hình dạng.

Nợ ghi ở [`docs/roadmap.md`](../../docs/roadmap.md) mục 1.3b, tách khỏi hồ sơ
`add-media-library`. Nằm trên đường BYO key mà [ADR-0011](../../docs/adr/0011-local-first-execution.md)
đặt cược.

**Chuẩn đối chiếu, đo tại chỗ 31/08:** `git config` ghi vào file hỏng → exit 3, **từ chối
ghi, giữ nguyên nội dung cũ**, nêu tên chỗ hỏng; đọc file hỏng → `fatal: bad config line`,
không bao giờ báo "rỗng". `sqlite3` mở file lạ → `file is not a database (26)`, không báo
"database rỗng".

## Criteria

### A. Seam — chỗ nuốt lỗi thứ hai

- AC-1: Given `readSettingsBlob()` gặp một đường dẫn **chưa có file**, When lõi gọi nó,
  Then nó trả `null`; và Given cùng hàm đó gặp lỗi I/O thật (`EACCES` — file `chmod 000`;
  `EISDIR` — đường dẫn là thư mục), When lõi gọi nó, Then nó **ném**, và lỗi ném ra mang mã
  lỗi gốc chứ không phải một `Error` trần. Hai nhánh đo trên **cùng một fixture thư mục**.

### B. Lõi — một nguồn, ba trạng thái

- AC-2: Given kho có nội dung JSON object hợp lệ, When gọi `readEnvStore()`, Then nó trả
  `{state:"ok"}` kèm đúng map đã lưu; và Given kho **chưa có**, When gọi cùng hàm, Then nó
  trả `{state:"absent"}` — **không** phải `unreadable`. Ca `absent` là nửa đàn áp: một hàm
  luôn-trả-`unreadable` sẽ qua được vế đầu và chính là lỗi bị canh.
- AC-3: Given kho ở **một trong bốn** trạng thái hỏng — `io` (seam ném), `parse` (JSON
  hỏng), `shape` (JSON hợp lệ nhưng là mảng/scalar), `decode` (`decodeEnvStore` ném) —
  When gọi `readEnvStore()`, Then **cả bốn** trả `{state:"unreadable"}` kèm `reason` phân
  biệt được bốn nguyên nhân. Ca `shape` là ca hôm nay đang trả `{}` ở
  [`:28-30`](../../src/lib/settings/env-store.server.ts) và là ca dễ sót nhất.
- AC-4: Given kho ở **bất kỳ** trạng thái nào trong sáu trạng thái (ok, absent, và bốn ca
  hỏng), When gọi `loadEnvStore()` — bộ đọc khoan dung của nhóm Đọc-để-chạy — Then kết quả
  **giống hệt hành vi trước gói việc này**: map thật khi `ok`, `{}` cho năm ca còn lại, và
  **không ném**. Đây là tiêu chí chứng minh quyết định 2: kho hỏng không chặn lượt chạy nào.

### C. API — chỗ mất dữ liệu

- AC-5: Given kho không đọc được, When client gọi `GET /api/settings/env`, Then máy chủ trả
  **503** với body chứa `code: "ENV_STORE_UNREADABLE"`; và Given kho **chưa có**, When gọi
  cùng đường, Then vẫn là **200** với `env: {}` — vắng không phải lỗi.
- AC-6: Given kho không đọc được **và** trên đĩa đang có nội dung, When client gọi
  `PUT /api/settings/env` **không kèm cờ**, Then máy chủ trả **409**, **và blob trên đĩa
  không đổi một byte** (so nội dung trước/sau, không chỉ assert mã trạng thái). Đây là
  tiêu chí trọng tâm — nó đo đúng thứ `git config` làm được ở mục Context.
- AC-7: Given kho không đọc được, When client gọi `PUT` kèm `replaceUnreadableStore: true`,
  Then máy chủ ghi đè thành công và trả **200**; lần `GET` kế tiếp trả đúng map vừa ghi ở
  trạng thái `ok`.
- AC-8: Given kho ở trạng thái `ok` hoặc `absent`, When client gọi `GET` rồi `PUT` như
  trước gói việc này, Then hành vi **không đổi** — 200, ghi được, và `verdicts` của các khoá
  đã đổi vẫn trả về như cũ. Cờ `replaceUnreadableStore` khi kho lành thì **bị bỏ qua**,
  không được biến thành một đường ghi thứ hai.
- AC-9: Given kho không đọc được, When [`media-library/config.server.ts`](../../src/lib/media-library/config.server.ts)
  đọc cấu hình, Then nó phân biệt được **"kho hỏng"** với **"chưa cấu hình khoá"** — hai
  trạng thái này hôm nay cùng ra một câu, và câu đó dẫn người dùng đi nhập lại khoá, tức
  dẫn thẳng vào đường mất dữ liệu.

### D. UI — ba mặt, ba mức

- AC-10: **(cross-layer)** Given kho không đọc được, When người dùng mở màn Cài đặt, Then
  form khoá **bị thay** bằng tấm nêu lý do và câu "chưa có gì bị thay đổi", nút Lưu ở
  trạng thái **tắt** (hiện diện nhưng không bấm được, không phải bị ẩn), và có đúng **một**
  nút thoát. Nửa server: `GET` trả 503 đúng lúc đó.
- AC-11: **(cross-layer)** Given màn Cài đặt đang ở trạng thái kho-hỏng, When người dùng
  bấm nút thoát, Then hiện hộp xác nhận nói rõ **"mọi khoá đang lưu sẽ mất và không khôi
  phục được"**; When người dùng xác nhận, Then khoá vừa nhập được lưu và màn về trạng thái
  bình thường. Nửa server: đúng một `PUT` mang cờ rời khỏi trình duyệt — **không** có `PUT`
  nào không cờ trước đó.
- AC-12: **(cross-layer)** Given kho không đọc được, When người dùng thử lưu khoá từ
  [`media-library-config-panel`](../../src/components/workspace/nodes/add/media-library-config-panel.tsx)
  hoặc từ ô khoá trong [`abi-node-shell`](../../src/components/workspace/nodes/base/abi-node-shell.tsx),
  Then cả hai **từ chối lưu** và chỉ người dùng sang màn Cài đặt; hai panel này **không** có
  nút thoát. Nửa server: **không** một `PUT` nào rời khỏi trình duyệt trong cả hai ca —
  `abi-node-shell` hôm nay không kiểm cả `loaded.ok`, nên đây là nửa dễ xanh giả nhất.

### E. Cắt ngang

- AC-13: Given mọi chuỗi hiển thị mới của gói việc này, When kiểm tệp thông điệp, Then mỗi
  khoá có mặt ở **đủ 5 locale** (`en/ja/ko/vi/zh`) và không khoá nào để nguyên tiếng Anh
  trong bốn tệp còn lại. Repo đã có nợ đo được ở trục này (`ja.json` thiếu 76 khoá).
- AC-14: Given ba trạng thái mới của bản mẫu × hai giao diện sáng/tối (**6 trang**), When
  quét bằng **axe-core trong Chrome thật**, Then **0 vi phạm mức `critical` hoặc `serious`**.
  Dụng cụ là `a11y-scan.mjs` — nó thoát mã 3 khi không với tới trang nào, nên một server
  không dựng được đọc thành trượt chứ không thành tờ giấy trắng. **Tiêu chí này TRƯỢT khi
  phép đo axe không ở trạng thái PASS, bất kể `design-gate` xanh** — gate kia là phép đo
  tham khảo, không phải bằng chứng a11y (xem §Notes).

## Coverage

Quét bằng `morphological-scan` (preset test-matrix, có chất vấn trục), hộp
**trạng thái kho × tầng × vai × môi trường** = 6 × 4 × 4 × 2 = 192 ô; quét theo lát cắt
trục A, cắt theo pairwise.

Trục **Actor/role** của preset **bị loại có lý do**: route settings không có auth/role nào
(`route.ts:18-23`) và bản OSS là một tenant (`resolveScope() → ""`,
[`src/ext-default/scope.ts`](../../src/ext-default/scope.ts)) — trục chỉ có một giá trị nên
không đổi độc lập được, tức không phải trục. "Quyền" sống lại đúng chỗ của nó: `EACCES` là
một **nguyên nhân hỏng** trên trục A. Trục **Bề mặt** ban đầu có 9 giá trị (>7) nên **tách
làm hai** — tầng × vai.

- **Trục A — trạng thái kho:** `ok` | `absent` | `unreadable/io` | `unreadable/parse` |
  `unreadable/shape` | `unreadable/decode`.
  *Thước CE:* các nhánh bên trong `try` của
  [`env-store.server.ts:24-41`](../../src/lib/settings/env-store.server.ts) chính là bản kê
  nguyên nhân hỏng — bản kê **đóng**, đọc từ mã chứ không nghĩ ra;
  *[NGÀNH: git config — đo tại chỗ 31/08]* và *[NGÀNH: SQLite — đo tại chỗ 31/08]* xác nhận
  ba trạng thái lành/vắng/hỏng là phân hoạch đúng của loại "kho cấu hình trên đĩa".
- **Trục B — tầng:** seam | lõi | API route | UI. *Thước CE:* `grep loadEnvStore src/` →
  4 nơi gọi; `grep api/settings/env src/` → 3 nơi đọc. Bản kê **đóng và đếm được**.
- **Trục C — vai:** ghi-thường | ghi-kèm-cờ-thoát | đọc-để-hiện | đọc-để-chạy.
  *Thước CE:* lịch sử lỗi nội bộ có thật — [roadmap 1.3b](../../docs/roadmap.md) mô tả đúng
  lỗi này, và §Known limits của [`add-media-library`](../add-media-library/contract.md) ghi
  chốt chặn client đã thử và trượt.
- **Trục D — môi trường:** OSS/desktop (codec identity, store = file) |
  **[GIẢ ĐỊNH]** vỏ cloud (codec mã hoá, store = Durable Object).
  *Thước CE cho nhánh OSS:* [`src/ext-default/*`](../../src/ext-default/) + alias `@ext` trong
  `tsconfig.json`. **Nhánh cloud không có thước** — `src/ext/` gitignored, không tồn tại trên
  máy này; mọi tiêu chí chạm ca `decode` chỉ đo được qua seam giả lập.

**[GIẢ ĐỊNH] cần người gạch tại Cổng 1:** nhánh vỏ cloud của trục D. Nếu bản cloud không
tuân hợp đồng seam mới thì đường cloud vẫn báo `absent` khi kho hỏng, và toàn bộ gói việc
này chỉ có hiệu lực trên bản OSS/desktop.

**Ô Core 14/192 ô (7%)** — dưới ngưỡng 20%, đã cắt bằng cách **hợp nhất ô thành một AC**
(AC-3 gánh cả bốn nguyên nhân hỏng; AC-4 gánh cả sáu trạng thái ở vai đọc-để-chạy), không
phải bằng cách bỏ ô.

## Out of scope

- **Giữ bản hỏng trước khi ghi đè** — quyết định 4 của owner (31/08). Đổi lại: người dùng
  bấm thoát là mất khoá cũ thật, hộp xác nhận của AC-11 là toàn bộ hàng rào. Việc này tách
  thành hợp đồng con có tên, không biến mất.
- **Nhóm Đọc-để-chạy dừng lượt chạy khi kho hỏng** — quyết định 2 của owner. `withStoredEnv`
  và `director.server.ts` giữ nguyên hành vi, và AC-4 tồn tại để **chứng minh** chúng không
  đổi. Lý do: một file settings hỏng sẽ chặn cả node cục bộ vốn không cần khoá nào, biến sự
  cố nhỏ thành ngưng toàn bộ.
- **Vỏ cloud tuân hợp đồng seam mới** — `src/ext/settings-store.ts` ở repo khác, gitignored.
- **Hiện số khoá sắp mất** — kho hỏng thì không đếm được nội dung, nên chỉ nói chung chung
  được; lợi ích mỏng hơn vẻ.
- **Hai tab cùng lưu (idempotency / concurrent edit)** — `PUT` đã là thay-toàn-bộ từ trước
  gói việc này; lỗi đang sửa không sinh ra nó.
- **Mã hoá kho ở bản OSS** — codec là seam, để trống có chủ ý.
- **Role/quyền trên route settings** — bản OSS một tenant; thêm là đổi kiến trúc.
- **Versioning / migrate schema `settings.json`** — chưa có nhu cầu.

## Notes

- Cờ đặt tên `replaceUnreadableStore` chứ không phải `force`: nó nói **điều kiện** nó cho
  phép, nên đọc lại sau sáu tháng vẫn biết nó không phải cái búa chung. AC-8 canh đúng chỗ
  này — cờ khi kho lành phải bị bỏ qua, không được thành đường ghi thứ hai.
- **`executors.design.gate` KHÔNG phải cổng a11y, và AC-14 cố ý không dùng nó.** Đo
  31/08 trên chính các bản chụp của hồ sơ này: gate chạy dưới jsdom, jsdom in
  `Could not parse CSS stylesheet` sáu lần và chỉ phân giải **188 cssRules trên 153KB CSS
  nội tuyến**, nên qua nó mọi phần tử đọc ra là **chữ đen trên nền trong suốt**
  (`h1 → color: rgb(0,0,0)`, `[role=alertdialog] → rgba(0,0,0,0)`). `p0_count: 0` của nó
  vì thế **không** phải bằng chứng về tương phản. Bản thân gate cũng chỉ có ba luật —
  `cramped-padding`, `nested-cards`, `gradient-text` — tức nó là **bộ dò slop thẩm mỹ**,
  và hồ sơ này đối xử với nó đúng như vậy: một phép đo THAM KHẢO trong gói Cổng 2, không
  phải một AC. Bản nháp đầu của AC-14 đã hứa "tương phản, tiêu điểm bàn phím, tên gọi cho
  trình đọc màn hình" từ dụng cụ này — một lời hứa hằng-đúng, sửa trước Cổng 1.
- `loadEnvStore` vẫn nuốt `unreadable` cho nhóm Đọc-để-chạy. Có chủ ý, có chú thích, có
  AC-4 canh — nhưng vẫn là một chỗ nuốt lỗi còn lại trong mã, và nó nên được đọc như vậy.
