---
schema_version: 1
feature: Nền trạng thái Director — wire trả plan, director_events, body versioned (gói D0)
slug: director-wire-shape
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-09-08
time_human_minutes: {gate1: 15, gate2: 0}
---

# Acceptance Contract: director-wire-shape

## Context

Gói **chỉ GHI, chưa ĐỌC**. Nó đặt ba đường dữ liệu mà mọi hạng mục của
[`director-v2`](../director-v2/opportunity.md) cần, và không thay đổi một pixel nào người
dùng thấy. Nền quyết định: [ADR-0013](../../docs/adr/0013-director-truong-ky.md);
Cổng 0 ký 26/08 ([opportunity.md](opportunity.md)).

Ba sự thật đo được đứng sau nó:

1. **Plan được accept không bao giờ rời server** — `director-core.ts:176-183` trả đúng
   `name/description/nodes/edges`, `DirectorPlan` bị vứt. Không có plan phía client thì
   turns replay, vá đồ thị và few-shot cá nhân đều bất khả thi.
2. **Ba nhánh outcome của UI không ghi gì** — `director-prompt.tsx:73,277-291`. Tín hiệu
   accept/reject mất vĩnh viễn mỗi ngày trôi qua.
3. **Body là `{prompt}` trần 2.000 ký tự** — `route.ts:6`. Đổi hợp đồng SAU khi
   `director-transport-open` ship là breaking change cho mọi client.

Mốc so sánh: EVAL-0 26/08 cho **26/30 (86,7%)**, p95 **75,1s**, trên
[`golden/frozen-config.json`](golden/frozen-config.json).

## Criteria

### A. Wire shape — plan tới được client

- AC-1: Given một request `/api/director` thành công, When client đọc response, Then payload
  có thêm `planJson` (chuỗi JSON của `DirectorPlan`), `runId` (định danh lượt), và
  `dslVersion` (số nguyên, lấy từ `DIRECTOR_DSL_VERSION`).
- AC-2: Given cùng request đó, When so với bản trước gói này, Then bốn trường
  `name` / `description` / `nodes` / `edges` **giữ nguyên tên và nguyên hình dạng** — client
  chưa biết trường mới chạy không sửa một dòng.
- AC-3: Given mỗi trong 7 `DirectorErrorCode`, When lỗi xảy ra, Then mã HTTP trả về đúng như
  `STATUS_BY_CODE` hiện tại và thân lỗi giữ nguyên `{error:{code,message,details}}`.

### B. Sổ sự kiện — máy bắt đầu nhớ

- AC-4: Given một lượt gọi `/api/director` bất kỳ, When request kết thúc dù thành công hay
  hỏng, Then có **đúng một** row `director_events` với `kind='generated'` mang `runId` của
  lượt đó. Ghi ở phía server, không phụ thuộc client còn mở tab.
- AC-5: Given một `runId` đã có row `generated`, When `POST /api/director/feedback` gửi
  `{runId, outcome}` với outcome thuộc `staged|accepted|replaced|discarded`, Then row được vá
  đúng một lần; lần vá **thứ hai cho cùng runId bị từ chối** (state machine một chiều), và
  `runId` không tồn tại cũng bị từ chối.
- AC-6: Given lược đồ `director_events`, When kiểm cột, Then có đủ từ migration ĐẦU TIÊN:
  `runId`, `kind`, `ts`, `promptText`, `planJson`, `dslVersion`, `canvasWasEmpty`,
  `attempts`, `errorCode`, `usedMemory`, `memoryBlockDigest`, `estimateMs`, `workflowId`.
  Mọi trường suy diễn **nullable** — NULL ≠ 0 đo được (kỷ luật `workspace.schema.ts:49-59`).
- AC-7: Given một workflow được lưu từ kế hoạch Director sinh ra, When ghi vào bảng
  `workflows`, Then `directorRunId` mang `runId` của lượt đã sinh nó; workflow dựng tay để NULL.

### C. Body versioned — khai hình dạng, chưa dùng

- AC-8: Given body `{prompt}` đúng như cũ, When gọi, Then hành vi **không đổi một chút nào** —
  trần 2.000 ký tự giữ nguyên, cùng mã lỗi, cùng thông điệp.
- AC-9: Given body có thêm `turns` / `canvas` / `options`, When các trường đó vắng mặt hoặc
  rỗng, Then hành vi y hệt AC-8; When chúng vượt trần **theo từng trường** (số node, số turn,
  tổng byte), Then bị từ chối bằng `INVALID_PROMPT` nêu **đúng tên trường** vượt hạn.

### D. Ràng buộc gói này không được vi phạm

- AC-10: Given suite hiện có, When chạy `pnpm test`, Then xanh và **số expect bị sửa bằng 0** —
  gói này chỉ THÊM, không đổi hành vi cũ.
- AC-11: Given một bản sao db người dùng có từ trước gói này, When chạy migrator thật, Then
  db sống và dữ liệu cũ nguyên vẹn (tiền lệ `metering-schema.test.ts:15-25`).
- AC-12: Given bảng mới, When `drizzle.config.ts` và `ext-default/db.ts` nạp lược đồ, Then
  bảng được export qua barrel `src/db/schema.ts` — không chỉ `workspace.schema.ts`.
- AC-13: Given môi trường production, When một lượt Director hỏng, Then `promptText` **không**
  vào log luôn-bật; kỷ luật `logger.debug` chỉ ở development (`director.server.ts:271-276`)
  giữ nguyên. Cột `promptText` trong db là chuyện khác — nó nằm trên máy người dùng.

### D. Đường ghi kết cục từ giao diện (nâng phạm vi 08/09, Cổng 1 duyệt lại)

Hai tiêu chí này vào hợp đồng ở Cổng 2 ngày 08/09 theo lối «nâng phạm vi sửa ngay»: vòng 3 cho
thấy nửa giao diện của AC-5 không thể đạt, nên E14b không chấm được và hồ sơ không ký được.
Chúng nói về thứ CLIENT gửi đi; nửa máy chủ của cùng lời hứa vẫn là AC-5.

- AC-14: Given canvas đã có node và một lượt Director vừa trả kế hoạch, When hộp thoại xác nhận
  mở ra mà người dùng chưa quyết gì, Then client **chưa** gửi kết cục nào. Một lượt chỉ rời
  `generated` đúng một lần (AC-5), nên tiêu lượt vá ấy cho việc «hộp thoại đã mở» làm quyết định
  thật của người dùng vĩnh viễn không ghi được: mọi báo cáo sau đó bị từ chối 409 và bị nuốt lặng
  vì đường gửi là bắn-rồi-quên. Kế hoạch không ai quyết thì ở nguyên `generated`, và đó đúng là
  thứ ngưỡng tỉ lệ mồ côi đang đếm.
- AC-15: Given hộp thoại xác nhận đang mở, When người dùng bấm xác nhận, hoặc huỷ, hoặc nhấn
  Escape, Then client gửi **đúng một** kết cục cho lượt đó, và kết cục ấy khớp với hành động
  (`replaced` khi xác nhận, `discarded` khi huỷ hay Escape). Nút xác nhận của thư viện hộp thoại
  đồng thời là nút đóng, nên một cú bấm chạy cả nhánh xác nhận lẫn nhánh đóng; hai báo cáo mâu
  thuẫn cho cùng một lượt sẽ đua nhau và cái tới trước quyết định sổ ghi gì.

## Coverage

Quét hình thái; chân sản phẩm = [ADR-0013](../../docs/adr/0013-director-truong-ky.md) +
[vision](../../docs/strategy/vision.md); chân đo = EVAL-0/EVAL-3 26/08.

- **Trục A — đường dữ liệu:** request vào | plan ra | outcome vá | workflow lưu
- **Trục B — thời điểm ghi:** trước khi gọi model | sau khi có plan | sau khi người dùng quyết | không bao giờ
- **Trục C — ai ghi:** server | client | cả hai | không ai *(hôm nay: "không ai" ở cả bốn ô của trục A)*
- **Trục D — sống sót:** tab đóng giữa chừng | request timeout | migration db cũ | client cũ không biết trường mới

Tích 4×4×4×4 = 256 ô → quét theo lát cắt trục A. Core = 13 AC (~5%).

Ô Core đến **từ trục D chứ không từ trục A**: AC-4 ghi phía server *vì* tab có thể đóng —
nếu chỉ client ghi thì mọi lượt người dùng bỏ giữa chừng biến mất, mà đó chính là tín hiệu
"hối hận" đáng giá nhất. Bản thiết kế đầu bỏ sót điều này.

## Out of scope

- **Đọc memory vào prompt** — smart defaults, few-shot cá nhân, khối memory trong system.
  Gói này chỉ GHI. (tách 26/08)
- **Bảng `memories` + UI CRUD** — wire-shape #5 của ADR-0013, gói riêng sau khi events chạy. (tách 26/08)
- **Trí nhớ canvas & vá đồ thị** — [`director-v2`](../director-v2/opportunity.md) hạng mục 1–2. (tách 26/08)
- **HMAC / chữ ký plan replay** — rủi ro chấp nhận thành văn tại ADR-0013 QĐ 5, chỉ mở lại
  theo điều kiện xét lại ghi ở đó. (bác 26/08)
- **Ước tính chi phí trên node** — chặn bởi `tasks.costUsd` NULL có chủ đích; cần RateTable
  từ hoá đơn thật (điều kiện ③ của G0). (bác 26/08)
- **Đo tỉ lệ thành công ở LƯỢT 1** — chính gói này tạo ra cột `attempts` để đo; không thể là
  tiêu chí nghiệm thu của chính nó. (tách 26/08)

## Notes

**Bản sửa đi kèm, không tách:** `src/lib/director/dsl.ts:46` đổi
`z.discriminatedUnion("kind", …)` → `z.union([…])`. EVAL-3 26/08 chứng minh `oneOf` bị OpenAI
từ chối qua mọi đường trong khi `anyOf` được cả 4 hãng nhận. Bản sửa không thuộc gói này về
mặt chức năng, nhưng tách ra là để lại mìn cho `director-transport-open`.

**Vì sao chỉ hai eval chạy tay:** mọi executor đã khai trong `_acceptance/config.yaml` đều là
lệnh tất định, không khoá API, không bước network. Golden set 30 prompt cần cả hai. Khai 8 eval
dưới dạng judgment sẽ bắt người kiểm 8 lần cho cùng một phép đo. Quyết định của owner 26/08:
**một** golden-set eval chạy tay, phần còn lại là eval máy.

**Sửa 26/08 sau khi chạy thật** ([bằng chứng](evidence/e14-2026-08-26.md)): E14 gốc gộp ba câu,
nhưng câu về **tỉ lệ row mồ côi** *về nguyên tắc* không đo được bằng script —
`run-baseline.mjs` gọi thẳng `/api/director`, còn `/api/director/feedback` chỉ được UI gọi.
Script luôn cho 100% mồ côi dù hiện thực đúng hay sai. Một ngưỡng không thể đạt bằng dụng cụ
đã khai là ngưỡng **vô nghĩa**, không phải ngưỡng nghiêm khắc. Tách thành:

- **E14a** (script) — tỉ lệ thành công so mốc 86,7%, và mỗi lượt gọi sinh đúng một row.
- **E14b** (người, trong UI) — đi qua cả ba nhánh quyết định rồi kiểm tỉ lệ mồ côi.

**Bằng chứng của cả hai là ảnh chụp một lần, không tái chạy được trong CI.** Ghi rõ ở đây để
Cổng 2 không đòi điều bất khả.

**Một sửa nữa cùng lượt:** câu "`count(*)` == 30" của E14 gốc sai khuôn — sổ là append-only,
không reset giữa các lần chạy, nên tổng luôn lớn hơn 30 ở lần chạy thứ hai. E14a hỏi **phần
tăng thêm** thay vì tổng.

**Và một lỗ hổng của chính bộ đo, đã vá:** lần chạy E14 đầu tiên cho 30/30 (100%) — hiện vật,
vì worktree mới có `plugins/` rỗng nên vocabulary rỗng và mọi plan chỉ còn step `text`, luôn
compile. Hợp đồng này đã cảnh báo đúng điều đó ở mục Context, và phép đo vẫn lọt: bộ đo *in*
cấu hình ghim mà không *kiểm* nó. `run-baseline.mjs` nay đối chiếu `plugins/` với
`frozen-config.json` và thoát mã 2 khi lệch. Cảnh báo trong tài liệu không ngăn được gì;
chỉ guard chạy được mới ngăn.

## Amendment sau vòng cuối — 08/09/2026

**Nâng phạm vi tại Cổng 2 (08/09):** owner chọn lối «sửa ngay» cho hai lỗi ở đường ghi kết cục
giao diện thay vì hoãn sang hợp đồng khác. Hai tiêu chí AC-14 và AC-15 vào mục Criteria phần D,
kèm bộ đo E15/E16 chạy hộp thoại thật. Trần vòng verify được nới đúng một vòng cho việc này:
vòng 4 là vòng cuối, vẫn trong trần 4 vòng của hạng T3.

Cổng 1 duyệt lần đầu ngày 26/08/2026 (13 tiêu chí, `phanlemanh@gmail.com`); duyệt lại cho phạm vi
mở rộng ngày 08/09/2026 (Phan Le Manh), hai tiêu chí D nằm trong lần duyệt sau.

Luật trần vòng verify (CLAUDE.md, owner duyệt 08/09) áp cho hồ sơ T3 này: vòng 3 đã được KHAI
LÀ VÒNG CUỐI **trước khi** chạy (sổ quyết định `d-…-r3last`). Ba vòng đã sửa hết mọi lỗi trong
hợp đồng có mức từ trung bình trở lên: AC-5 (đơn-shot nằm trong câu lệnh UPDATE), AC-7 (dấu vết
kế hoạch đi đủ ba đường ghi), AC-9 (đếm byte UTF-8). Mục còn lại dưới đây là **nợ có tên**, không
sửa thêm ở vòng này:

| AC | Mức | Điều còn lại | Vì sao nhận nợ |
|---|---|---|---|
| AC-4 | thấp | Lượt chạy HỎNG ghi sổ dưới một `runId` bịa tại chỗ (`crypto.randomUUID()` ở `route.ts`), nên hàng sổ của lượt hỏng không nối được với log, với một lần vá kết cục sau đó, hay với lượt thử lại | Nhánh thất bại của `DirectorResult` chưa mang `runId`; sửa đúng là thêm một trường vào kiểu trả về của lõi Director — chạm `src/lib/director/**`, tức mở lại vùng mà ba vòng vừa đóng. Hàng sổ vẫn được ghi và vẫn đếm được tỉ lệ hỏng; chỉ mất khả năng NỐI hàng ấy với lượt cụ thể |

Ai nhận nợ này sửa ở gói D1 cùng lúc surface `attempts` cho nhánh hỏng — cả hai là cùng một
thay đổi kiểu.

