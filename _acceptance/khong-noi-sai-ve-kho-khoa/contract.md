---
schema_version: 1
feature: Không nói sai về kho khoá — server kiểm tiền đề của lệnh thay-kho, client phân loại lỗi đọc dương cả hai chiều
slug: khong-noi-sai-ve-kho-khoa
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [web, api]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-09-03
design_doc: docs/superpowers/specs/2026-09-03-khong-noi-sai-ve-kho-khoa-design.md
---

# Acceptance Contract: khong-noi-sai-ve-kho-khoa

## Context

Bốn phát hiện HIGH của hội đồng review `chong-mat-khoa-byo-giao-dien`, owner định
đoạt «mở hợp đồng mới» tại Cổng 2 ngày 02/09. Hợp đồng cũ khoanh theo **bề mặt**;
khuyết tật sống ở **bất biến phía server** nên lọt ra ngoài đúng luật. Hợp đồng này
khoanh theo bất biến:

> Không bề mặt nào — kể cả server — được nói sai chuyện gì đã xảy ra với kho khoá.
> «Kho hỏng» chỉ được nói khi có tín hiệu dương. «Xoá vì hỏng» chỉ được thi hành khi
> server tự xác nhận.

Phát hiện thêm lúc mở hồ sơ, **hoãn có chủ ý** (xem Out of scope): `PUT` là ghi đè
toàn phần, hợp nhất ở client — `PUT {env:{}}` không cờ cũng xoá kho lành. Vòng này
canh cờ và sửa phân loại; hợp nhất về server là hồ sơ kế.

Thiết kế đầy đủ: [`design doc`](../../docs/superpowers/specs/2026-09-03-khong-noi-sai-ve-kho-khoa-design.md).

## Criteria

- AC-1: **(cross-layer)** Given kho khoá ở server đọc ra `ok` HOẶC `absent`, When một
  `PUT` mang `replaceUnreadableStore: true` tới, Then server trả **409** với
  `code: ENV_STORE_REPLACE_REFUSED` và `state` nêu đúng `ok`/`absent`, và **tệp kho
  không đổi một byte** (`ok`) hoặc **không được tạo** (`absent`). Given kho đọc ra
  `unreadable`, When cùng `PUT` đó tới, Then 200 và kho là `{}` — đường hợp lệ vẫn
  sống. Đua: kho đọc ra `unreadable` ở lượt GET rồi được sửa trước lượt PUT → PUT rơi
  vào nhánh 409; không cần luật riêng.

- AC-2: Given `readEnvForBrowser` nhận một trong **mười** tín hiệu — 200 kèm `env`
  object · 503 kèm `code: ENV_STORE_UNREADABLE` · 401 · 403 · 500 · 502 thân HTML ·
  200 thân không-JSON · 200 `env` sai hình · `fetch` ném · quá trần (chín đầu đo ở
  E2, quá trần đo ở E4; tổng ghim = 10) — When phân loại, Then ra đúng **bốn** state: `ok` **chỉ** từ tín hiệu 1; `store-unreadable`
  **chỉ** từ tín hiệu 2; `unauthenticated` **chỉ** từ 401; **mọi** tín hiệu còn lại
  → `unavailable` với `reason.code` nêu tên tín hiệu. Cả hai kết luận nặng đều phải có
  căn cứ dương; phần bù rơi vào tên trung tính.

- AC-3: Given lượt đọc nhận **401**, When phân loại, Then đúng **một**
  `CustomEvent("tf:unauthorized")` với `cancelable: true` được bắn trên `window` —
  qua helper `notifyUnauthorized()` dùng chung với `apiClient`, không phải bản chép.
  Given lượt đọc nhận **403**, Then **0** sự kiện — 403 là *đã đăng nhập nhưng bị
  cấm* (RFC 9110), bắn seam đăng-nhập-lại cho nó là nói sai.

- AC-4: Given `fetch` không bao giờ resolve, When quá **30 000 ms**, Then lượt đọc ra
  `unavailable` với `reason.code: "timeout"` **và** lượt ghi (`put()`) cũng kết thúc
  bằng cách **ném** `Error` mang `code: "timeout"` (giữ đường throw để nhánh
  `writeFailed` hiện có bắt) — không màn nào quay vòng vĩnh viễn, và node key prompt
  với fetch treo rời phase `verifying` mà **không** vào `verified`. Hằng số dùng
  chung với `apiClient`.

- AC-5: Given ba bề mặt (màn Cài đặt · node key prompt · media-library panel) × bốn
  state — **12 ô**, số ghim thành hằng — When render, Then: nút phá huỷ («Thay kho
  bằng kho rỗng…») tồn tại ở **đúng một ô** (Cài đặt × `store-unreadable`) và **0**
  ở mười một ô còn lại; nút **Thử lại** tồn tại ở cả **chín** ô không-`ok` và 0 ở ba ô
  `ok`; tấm chặn nêu **đúng tên** state (không dùng chữ «kho hỏng» cho
  `unauthenticated`/`unavailable`); và `PUT` = **0** ở cả chín ô không-`ok`. Ba bề mặt
  render **cùng một** component chia sẻ (`data-testid` riêng theo state).

- AC-6: Given một bề mặt đang ở state không-`ok`, When bấm **Thử lại**, Then đúng
  **một** lượt `readEnvForBrowser` được gọi lại, nút ở trạng thái **tắt** trong lúc
  đọc (bấm đúp = vẫn một lượt), và bề mặt render theo kết quả mới — `ok` thì về form,
  vẫn lỗi thì tấm chặn theo state mới. Nhãn không phải hành vi: eval đếm lời gọi.

- AC-7: Given màn Cài đặt ở `store-unreadable`, người dùng đi qua hộp xác nhận, When
  `PUT` có cờ nhận **409 `ENV_STORE_REPLACE_REFUSED`**, Then client **đọc lại** đúng
  một lượt và render theo kết quả — kho lành thì form **có khoá**, **0** tấm lỗi, 0
  tấm chặn. Server vừa nói «tiền đề của bạn sai»; hành động trung thực là kiểm lại
  tiền đề, không phải báo lỗi về một sự cố không tồn tại.

- AC-8: Given cây nguồn, When guard cấu trúc chạy, Then `notifyUnauthorized` có
  **đúng hai** caller ngoài test (`src/lib/api/client.ts`,
  `src/lib/settings/env-client.ts`) — bản chép thứ ba là đỏ; và chuỗi
  `/api/settings/env` vẫn xuất hiện ở **đúng một** tệp nguồn ngoài test (guard cũ
  E11 của hồ sơ trước, carry). Răng: cả hai chiều phá đều phải đỏ nêu tên tệp.

- AC-9: Given hai state mới (`unauthenticated`, `unavailable`) có chuỗi hiển thị,
  When đo, Then mọi nhãn tra từ catalogue i18n ở **cả năm** locale (parity guard giữ
  tập đóng băng, không khoá mới nào vào allowlist), chuỗi hiển thị **bằng** giá trị
  tra từ `en.json` và **khác** `vi.json`; và sàn axe (`critical`/`serious` = 0) trên
  bản mẫu cho **hai state mới × hai giao diện sáng/tối** = 4 trang, wrapper đọc lại
  `data-proto-state` để chứng minh đúng state được render.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix + risk-premortem), 03/09. Chân sản
phẩm suy từ repo (`[SUY-TỪ-REPO: CLAUDE.md, src/lib/settings/env-store.server.ts,
src/lib/api/client.ts:171]`); chân ngành: `[NGÀNH: RFC 9110]` cho ngữ nghĩa mã trạng
thái (401 ≠ 403 ≠ 409 ≠ 503), `[NGÀNH: Open WebUI]` làm ứng viên đối chiếu khuôn màn
BYO-key. Bảy chiều ban đầu rút còn **bốn** sau test độc lập: bốn state client là *đầu
ra* của ánh xạ B→state (thứ được đo), không phải trục; cờ gộp vào trục C; đua là lớp
cắt ngang.

- **Trục A — kho thật ở server:** `ok` | `absent` | `unreadable`.
  *Thước CE:* union đóng `env-store.server.ts:34-36` — kiểu cạn, thêm giá trị là đổi
  type. Đóng.
- **Trục B — tín hiệu client nhận:** 200-ok | 503+code | 401 | 403 | 5xx-khác |
  không-JSON | `env` sai hình | mạng rớt | quá trần.
  *Thước CE:* lớp status theo RFC 9110 + năm hình dạng cũ từ E2 hồ sơ trước + hai hình
  dạng mới = hai phát hiện HIGH. Đóng-để-bắt-đầu; tín hiệu thật đầu tiên ngoài chín
  cái này đưa ngược vào trục.
- **Trục C — lượt:** đọc | ghi hợp nhất | ghi thay-kho (cờ bật).
  *Thước CE:* ba hàm export của `env-client.ts`, không có hàm thứ tư. Đóng.
- **Trục D — bề mặt:** Cài đặt | node key prompt | media-library panel.
  *Thước CE:* `check-one-env-reader.sh` liệt kê đúng ba caller. Đóng.
- **Cắt ngang:** `PUT` = 0 ở mọi state không-`ok` · đua giữa hai lượt · i18n 5 locale ·
  chiều đỏ có thông điệp ghim cho từng ô.

**Không gian:** 3 × 9 × 3 × 3 = 243 ô → lát theo trục C. Lát **thay-kho** quét toàn
phần (luồng mất dữ liệu): A × cờ = 3 ô + đua. Lát đọc: B → state đo một lần ở
`env-client` (9 ô), D × state đo ở giao diện (12 ô). Lát ghi hợp nhất: carry từ hồ sơ
cha (409 `ENV_STORE_UNREADABLE` đã có). **Core 11 ô** → 9 AC; ~4,5 % không gian.

Không có dòng `[GIẢ ĐỊNH]` hay `[CE chưa kiểm chứng]`.

## Out of scope

- **`PUT` vẫn ghi đè toàn phần, hợp nhất vẫn ở client.** `PUT {env:{}}` **không cờ**
  xoá sạch kho lành. Owner hoãn có chủ ý (03/09): chuyển hợp nhất về server đổi hợp
  đồng dây và chạm mọi biểu mẫu. «Không call-site nào gửi thân đó hôm nay» là sự thật
  về call-site, không phải về hợp đồng dây. → Known limit có tên + hồ sơ kế.
- **Ghi khoá thất bại hiện dấu tick xanh «Đã lưu khoá»** (Ngoài-3/7 hồ sơ trước). Vẫn
  HIGH, vẫn mở. Cần phase riêng + copy 5 locale; owner tách khỏi vòng này (03/09).
  → hồ sơ riêng. Hợp đồng này chỉ sửa cách lượt **đọc** hiện ra.
- **`pluginEnv` cast mù, `fetchEnv` mất catch** (Ngoài-4/9). Đã là Known limit mục 2
  hồ sơ trước; không kéo vào dù cùng tệp.
- **Vỏ cloud/desktop thật sự dựng hộp đăng nhập.** Người nghe `tf:unauthorized` ở
  `src/ext/`, bị gitignore. Đo được «bắn», không đo được «đáp».
- **403 có copy riêng** («bị cấm» thay vì «không tới được»). Đúng RFC 9110 nhưng chưa
  có ca thật ở cloud shell — Later.
- Đổi `apiClient` sang trả kết quả có cấu trúc thay vì throw+toast. Ngoài đề.

## Notes

- **Vì sao T3:** `src/app/api/settings/env/route.ts` khớp `t3_paths`. Đó là luận
  điểm của hồ sơ: bất biến thuộc về server. Diff còn chạm `src/lib/api/client.ts`
  (rút helper) — không đổi hạng.
- **Bản mẫu a11y cho hai state mới** dựng dev server riêng dưới `build/knsk-a11y`
  (cổng riêng), nên `tsconfig.json` cần thêm `build/knsk-a11y/types/**/*.ts` vào
  `include` — **chỉ** để Next thấy entry và không ghi đè tệp; tsc không đọc vì
  `build` đã ở `exclude` (bài học `chong-mat-khoa-byo-giao-dien` vòng 2–3).
  KHÔNG sửa `check-a11y-proto.sh` của hồ sơ trước — tệp đó nằm trong `paths` E9 của
  hồ sơ đã ký; chạm vào là làm nó ôi.
- **`StoreUnreadableNotice` phát `data-proto-component="store-unreadable-notice"`** trên
  root — mỏ neo để wrapper a11y chứng minh bản mẫu mount component THẬT, không phải
  markup chép tay (gap-probe F5).
- **Known limit nhỏ, khai trước:** E7 mock body 409 viết tay; hằng
  `ENV_STORE_REPLACE_REFUSED` được ghim ở E1 phía server, hai bên không round-trip qua
  một fixture chung.
- **Hằng `EnvReadState` và `data-testid` theo state** là hợp đồng giữa
  `StoreUnreadableNotice` và ba bề mặt; đổi tên state là đổi cả 12 ô AC-5.
