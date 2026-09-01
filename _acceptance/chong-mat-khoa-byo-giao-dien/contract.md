---
schema_version: 1
feature: Chống mất khoá BYO — nửa giao diện: màn Cài đặt và hai ô nhập khoá nói rõ kho hỏng và chặn ghi đè
slug: chong-mat-khoa-byo-giao-dien
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [web]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-09-01T10:40:00Z
design_doc: docs/superpowers/specs/2026-09-01-chong-mat-khoa-byo-giao-dien-design.md
---

# Acceptance Contract: chong-mat-khoa-byo-giao-dien

## Context

Nửa máy chủ đã ship: hồ sơ cha [`chong-mat-khoa-byo`](../chong-mat-khoa-byo/contract.md)
(`signed-off` 31/08, PR #87) khiến `GET /api/settings/env` trả **503** kèm
`code: ENV_STORE_UNREADABLE` khi kho khoá không đọc được, và khiến `PUT` trả **409,
không ghi gì** trừ khi thân yêu cầu mang `replaceUnreadableStore: true`.

Giao diện chưa nghe. Đo trên `main` @ `1d66bc2`:
[`settings-dialog.tsx:327-333`](../../src/components/workspace/settings-dialog.tsx) nuốt
lỗi đọc vào `logger.error` và để lại **form rỗng có nút Lưu bấm được** — lượt lưu kế
xoá sạch khoá cũ; [`abi-node-shell.tsx:107-109`](../../src/components/workspace/nodes/base/abi-node-shell.tsx)
**không kiểm `loaded.ok`** nên vẫn gửi `PUT` (máy chủ chặn bằng 409, nhưng lượt gửi
vẫn rời trình duyệt); [`media-library-config-panel.tsx:48-63`](../../src/components/workspace/nodes/add/media-library-config-panel.tsx)
có kiểm nhưng chỉ nói "đọc lỗi", không dẫn người dùng đi đâu;
[`config.server.ts:23-40`](../../src/lib/media-library/config.server.ts) dùng bản đọc
tha thứ nên kho hỏng đọc ra **"thiếu MEDIA_LIBRARY_API_KEY"** — câu dẫn thẳng vào
đường mất dữ liệu.

Sáu tiêu chí dưới đây **đã được viết và duyệt ở Cổng 1 của hợp đồng cha** rồi rời
phạm vi theo Amendment 1 (31/08), được giữ nguyên văn trong `## Out of scope` của
hợp đồng đó để hợp đồng kế thừa chúng. Đây là hợp đồng kế.

**Chuẩn đối chiếu ngành, đo tại chỗ 01/09:** `security add-generic-password` ghi vào
một tệp keychain hỏng → **exit 45, byte cũ không đổi** (từ chối ghi, giữ nguyên);
cùng công cụ, `security dump-keychain` trên tệp đó → **exit 0, đầu ra rỗng** — nửa
ĐỌC của ngành vẫn rơi vào đúng cái bẫy "trông như rỗng". VS Code với `settings.json`
hỏng thì từ chối ghi từ Settings UI và hiện "Unable to write into user settings…"
([microsoft/vscode#179912](https://github.com/microsoft/vscode/issues/179912)).
Ngành làm đúng nửa ghi và sai nửa đọc; hợp đồng này vá cả hai.

**Bốn vật của phiên làm hồ sơ cha KHÔNG được commit** (`git log --all` rỗng cho cả
ba đường dẫn) và phải dựng lại từ đầu: `src/components/proto/chong-mat-khoa-byo-proto.tsx`,
`scripts/settings/check-a11y-proto.sh`, `src/i18n/locale-parity.test.ts`. Thứ duy nhất
thừa hưởng được là [`design-pass.md`](../chong-mat-khoa-byo/design-pass.md) của hồ sơ cha.

## Criteria

- AC-9: Given kho không đọc được, When [`media-library/config.server.ts`](../../src/lib/media-library/config.server.ts)
  đọc cấu hình, Then nó phân biệt được **"kho hỏng"** với **"chưa cấu hình khoá"** — hai
  trạng thái này hôm nay cùng ra một câu, và câu đó dẫn người dùng đi nhập lại khoá, tức
  dẫn thẳng vào đường mất dữ liệu. Thứ tự bắt buộc: chỉ tuyên `store-unreadable` **sau khi**
  dự phòng `process.env` không cấp đủ **cả hai** giá trị; kho hỏng ∧ `process.env` cấp đủ
  → vẫn `ok: true`.

- AC-10: **(cross-layer)** Given kho không đọc được, When người dùng mở màn Cài đặt, Then
  form khoá **bị thay** bằng tấm nêu lý do và câu "chưa có gì bị thay đổi", nút Lưu ở
  trạng thái **tắt** (hiện diện nhưng không bấm được, không phải bị ẩn), và có đúng **một**
  nút thoát. Nửa server: `GET` trả 503 đúng lúc đó. **[amendment 01/09 — mở rộng Given]**
  "Không đọc được" ở đây là **mọi** lượt đọc không cho ra một map `env` dùng được, không
  riêng 503: `500`, `502` từ proxy, `200` kèm thân HTML, `200` kèm `env` sai hình dạng, và
  `fetch` ném — **cả năm** phải ra cùng tấm chặn. Đây là "thứ hợp đồng kế PHẢI mang theo"
  mục 2 của hợp đồng cha, mà chữ AC nguyên văn không phủ.

- AC-11: **(cross-layer)** Given màn Cài đặt đang ở trạng thái kho-hỏng, When người dùng
  bấm nút thoát, Then hiện hộp xác nhận nói rõ **"mọi khoá đang lưu sẽ mất và không khôi
  phục được"**; When người dùng xác nhận, Then kho bị thay bằng một kho rỗng hợp lệ và màn
  về trạng thái bình thường. Nửa server: đúng một `PUT` mang cờ rời khỏi trình duyệt —
  **không** có `PUT` nào không cờ trước đó. **[amendment 01/09]** "Đúng một" phải chịu được
  **bấm đúp** nút xác nhận: hai lượt bấm liên tiếp vẫn ra đúng một `PUT`.

- AC-12: **(cross-layer)** Given kho không đọc được, When người dùng thử lưu khoá từ
  [`media-library-config-panel`](../../src/components/workspace/nodes/add/media-library-config-panel.tsx)
  hoặc từ ô khoá trong [`abi-node-shell`](../../src/components/workspace/nodes/base/abi-node-shell.tsx),
  Then cả hai **từ chối lưu** và chỉ người dùng sang màn Cài đặt; hai panel này **không** có
  nút thoát. Nửa server: **không** một `PUT` nào rời khỏi trình duyệt trong cả hai ca —
  `abi-node-shell` hôm nay không kiểm cả `loaded.ok`, nên đây là nửa dễ xanh giả nhất.

- AC-13: Given mọi chuỗi hiển thị mới của gói việc này, When kiểm tệp thông điệp, Then mỗi
  khoá có mặt ở **đủ 5 locale** (`en/ja/ko/vi/zh`) và không khoá nào để nguyên tiếng Anh
  trong bốn tệp còn lại. Phép đo so parity **toàn bộ** năm tệp với một allowlist **đóng
  băng** đúng 76 khoá `ja` đang nợ (đo 01/09), nên nợ cũ không thể lớn thêm và khoá mới đặt
  nhầm namespace vẫn bị bắt.

- AC-14: Given ba trạng thái mới của bản mẫu × hai giao diện sáng/tối (**6 trang**), When
  quét bằng **axe-core trong Chrome thật**, Then **0 vi phạm mức `critical` hoặc `serious`**.
  Dụng cụ là `a11y-scan.mjs` — nó thoát mã 3 khi không với tới trang nào, nên một server
  không dựng được đọc thành trượt chứ không thành tờ giấy trắng. **Tiêu chí này TRƯỢT khi
  phép đo axe không ở trạng thái PASS, bất kể `design-gate` xanh** — gate kia là phép đo
  tham khảo, không phải bằng chứng a11y (xem §Notes).

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), 01/09. Chân sản phẩm suy từ repo;
chân ngành đo tại chỗ (macOS Keychain) + một sản phẩm có tên (VS Code Settings UI).

- **Trục A — bề mặt người dùng gặp:** màn Cài đặt | panel cấu hình media-library trên node |
  ô khoá trong node ABI | đường lib `config.server.ts` (không có mặt UI).
  *Thước CE:* `grep '"/api/settings/env"' src/ | grep -v test` → đúng **6 lời gọi ở đúng 3
  tệp UI**; `grep -rn resolveConfig src/` → **2 nơi tiêu thụ**. Bản kê đóng và đếm được.
- **Trục B — hình dạng câu trả lời của kho cho lượt chạm:** `200` + map hợp lệ | `503` +
  `ENV_STORE_UNREADABLE` | lỗi HTTP khác (`500`/`502`) | `200` nhưng thân không dùng được
  (HTML lỗi, thiếu `env`, `env` sai kiểu) | `fetch` ném (mạng đứt / abort).
  *Thước CE:* bảng nhánh của chính [`api/client.ts:180-240`](../../src/lib/api/client.ts) —
  ok/not-ok, `AbortError`, ném chung. Đóng tại mối nối client.
- **Trục C — vai của lượt chạm:** đọc-để-hiện (`GET` khi mở) | ghi-thường (`PUT` không cờ) |
  ghi-kèm-cờ-thoát (`PUT` có `replaceUnreadableStore`).
  *Thước CE:* nhánh của chính [`route.ts`](../../src/app/api/settings/env/route.ts) — `GET`
  hai lối ra, `PUT` rẽ tại cờ. Đóng.
- **Lớp cắt ngang áp mọi ô Core:** 5 ngôn ngữ (AC-13) × sáng/tối + sàn axe (AC-14).
  Không phải trục thứ tư — đổi ngôn ngữ không ép đổi giá trị trục nào.

**Không gian:** 4 × 5 × 3 = 60 ô, **39 ô có nghĩa** sau khi gạch ô vô nghĩa (panel node ×
vai ghi-kèm-cờ = 0 ô, cố ý; `config.server.ts` × mọi vai ghi = 0 ô, nó không bao giờ ghi).
**Core 7/39 (18%)** — dưới ngưỡng 20%.

**Hai ô Core mà sáu AC nguyên văn KHÔNG phủ, đã nới vào AC bằng amendment 01/09:**
1. `A1 × C1 × B3/B4/B5` — màn Cài đặt gặp lỗi đọc **không phải 503**. Chữ AC-10 chỉ đòi ô
   503; bài học "PHẢI mang theo" mục 2 của hợp đồng cha đòi mọi lỗi đọc. Hai thứ lệch nhau,
   và bản hiện tại để lại form rỗng lưu được ở **cả năm** ca.
2. Bấm đúp nút xác nhận huỷ-diệt → hai `PUT` mang cờ, trong khi AC-11 đòi "đúng MỘT".

**Later:** lượt ghi-đè tự nó thất bại giữa chừng (`500`/mạng đứt trong lúc `PUT` có cờ) —
màn nói gì. Đã khai một trạng thái `ST-caidat-replace-failed` trong design doc nhưng
không dựng AC riêng.
**Never:** nút thoát trên hai panel node (AC-12 chốt là KHÔNG có, cố ý) · vai đọc-để-chạy
`withStoredEnv`/`director.server.ts` (quyết định 2 của owner, AC-4 hợp đồng cha đã chốt
giữ nguyên) · `config.server.ts` × vai ghi (không tồn tại).

**[GIẢ ĐỊNH] cần người gạch tại Cổng 1:** nhánh vỏ cloud (`src/ext/`, gitignored, không có
trên máy này) — kế thừa nguyên trạng từ hợp đồng cha, không có thước mới nào ở vòng này.

## Out of scope

- **Giữ bản hỏng trước khi ghi đè.** Quyết định 4 của owner (31/08), đã tách thành hợp đồng
  con có tên. Đổi lại: người dùng bấm thoát là mất khoá cũ thật, và hộp xác nhận của AC-11
  là **toàn bộ** hàng rào.
- **Nhóm đọc-để-chạy** (`withStoredEnv`, `director.server.ts`) giữ nguyên hành vi — quyết
  định 2 của owner: một tệp settings hỏng không được chặn cả node cục bộ vốn không cần khoá.
- **76 khoá `ja` đang nợ** không được dịch ở gói này; chúng vào allowlist đóng băng của phép
  đo parity. Nợ không lớn thêm được, nhưng cũng không co lại ở đây.
- **`KEY_PROMPT_LABELS` tiếng Việt ghi cứng** tại `abi-node-shell.tsx:42` là nợ i18n có
  trước. Gói này chỉ đưa **chuỗi mới** qua `next-intl`, không dọn nợ cũ.
- **Trục khổ màn hình** (mobile/desktop) không có AC — bản mẫu vẫn chụp hai khổ cho phiên
  design-pass, nhưng sàn axe của AC-14 chỉ đo trục sáng/tối như chữ AC viết.

## Notes

- **`executors.design.gate` KHÔNG phải cổng a11y của hồ sơ này.** Đo 31/08 trên chính các
  bản chụp của hồ sơ cha: gate chạy dưới jsdom, phân giải **188 cssRules trên 153KB** CSS
  nội tuyến, nên `h1` đọc ra `color: rgb(0,0,0)` và `[role=alertdialog]` đọc ra nền
  `rgba(0,0,0,0)`; toàn bộ luật của nó là ba bộ dò slop thẩm mỹ (`cramped-padding`,
  `nested-cards`, `gradient-text`). Nó ở đây làm phép đo **tham khảo**. Bằng chứng a11y là
  axe-core trong Chrome thật.
- **Wrapper a11y chép từ `scripts/media-library/`, KHÔNG từ `scripts/onboarding/`.** Bản
  media-library đặt `NEXT_DIST_DIR` riêng; `pnpm build` là một suite key chạy **song song**,
  và một lượt build hạ cánh giữa lúc quét sẽ xoá chunk server đang phát — chỉ TRANG chết nên
  eval route vẫn xanh, tức vòng hỏng đọc ra như vòng sạch. Bản này lấy `build/kkt-a11y`,
  cổng `3197` (3198 media-library, 3199 onboarding, 3000 dev).
- **Bản mẫu đóng dấu `data-proto-state`** lên gốc và wrapper **đọc lại** thuộc tính đó khỏi
  trang, cộng đọc lại cả trục sáng/tối. Không có nó, một tên state gõ sai vẫn cho 6 lượt
  chụp cùng một màn hình mà đếm vẫn đủ.
- **Repo chưa khai `feature_loop.ui_standards_skill`** → artifact UI của vòng này không có
  đối trọng chuẩn nội nào ngoài token trong `src/app/globals.css`. Cùng gốc với việc
  `design_pass.ds_skill` cũng vắng.
