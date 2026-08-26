---
schema_version: 1
slug: director-wire-shape
feature: Nền trạng thái Director — wire trả plan, director_events, body versioned (gói D0 của ADR-0013)
owner: Manh
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Ba đường dữ liệu mà mọi tính năng "Director trường kỳ" cần đều đang KHÔNG tồn tại, và dữ
liệu mất đi là mất vĩnh viễn:

1. Plan được accept **không bao giờ rời server** — `director-core.ts:176-183` vứt
   `DirectorPlan`, route chỉ trả nodes/edges. Không có plan phía client thì turns replay,
   vá đồ thị, few-shot cá nhân đều bất khả thi.
2. Ba nhánh outcome của UI (accept / replace / discard — `director-prompt.tsx:73,277-291`)
   **không ghi gì** — mỗi ngày chưa có event log là một ngày tín hiệu học mất không thu hồi được.
3. Body `/api/director` là `{prompt}` trần 2.000 ký tự (`route.ts:6`) — đổi hợp đồng SAU
   khi `director-transport-open` ship là breaking change; khai shape đúng từ bây giờ thì
   `director-v2` hạng mục 1–2 chỉ là điền trường đã có.

Gói này là **hạ tầng wire-shape**, tách riêng khỏi ô sản phẩm
[`director-v2`](../director-v2/opportunity.md) (quyết định Manh 26/08: Cổng 0 của
director-v2 mở riêng, giữ nguyên nghĩa 4 hạng mục sản phẩm). Nền quyết định:
[ADR-0013](../../docs/adr/0013-director-truong-ky.md); bằng chứng chi tiết:
[research-director-truong-ky-2026-08.md](../../docs/strategy/research-director-truong-ky-2026-08.md).

Ba hạng mục, một slug (cùng chạm `route.ts` + `src/db/**`, trả phí gate T3 một lần):

1. Wire thành công trả `{planJson, runId, dslVersion}` — sửa nhánh ok của
   `director-core.ts` + payload `route.ts`.
2. Bảng `director_events` append-only (kind generated|accepted|replaced|discarded|failed
   + errorCode + attempts + usedMemory + memoryBlockDigest + promptText + planJson +
   dslVersion + canvasWasEmpty + estimateMs NULL-able + workflowId? + runId) +
   `POST /api/director/feedback` — state machine một chiều từ `generated`, mỗi runId vá
   một lần. Cột `workflows.directorRunId` đi kèm (nối provenance
   run→workflow→tasks→materials.isFavorite).
3. Body versioned `{prompt≤2000, turns?, canvas?, options?}` — trần theo TỪNG TRƯỜNG
   (đếm node, đếm turn, tổng byte); các trường mới optional, để trống, hành vi không đổi
   khi vắng.

**Rủi ro chấp nhận thành văn** (ADR-0013 quyết định 5): plan replay từ client không HMAC —
local-first single-user, kẻ kiểm soát client đã kiểm soát SQLite; điều kiện xét lại: khi có
multi-user/collaboration hoặc few-shot pool chia sẻ.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Trả planJson qua wire không phá hợp đồng 7 mã lỗi hiện có của route | Client cũ vỡ khi parse response | Đọc `route.test.ts` + thử response mở rộng với client hiện tại (trường thêm, không trường đổi) | Chưa thử |
| 2 | `director_events` ghi 2 pha (server generated + client vá outcome) đủ bắt outcome thật — client đóng tab thì row generated mồ côi vẫn đếm được | Số liệu accept-rate sai lệch không phát hiện | Đếm row mồ côi sau 1 tuần dùng thật; ngưỡng chấp nhận <10% | Chưa thử |
| 3 | Migration 2 bảng + 1 cột sống trên db người dùng cũ | Vỡ db đang dùng | Phép thử migrator-thật theo tiền lệ `metering-schema.test.ts:15-25`; bảng mới export qua barrel `src/db/schema.ts` | Chưa thử |
| 4 | Token một canvas 20 node serialize + K plan replay nằm trong ngưỡng chi phí/latency chấp nhận | Trần per-field phải siết lại, trí nhớ canvas (director-v2 #1) đắt hơn dự tính | Serialize đồ thị 20 node thật + đếm token. **Số liệu nền đã có 26/08:** độ trễ hiện tại p50 16,9s / p95 75,1s / max 99,7s KHI CHƯA có canvas — nên ngân sách latency còn lại rất mỏng. Trần thật đang chặn là `MAX_PROMPT_LENGTH=2000` (`route.ts:6`), không phải `MAX_TOKENS` | Chưa thử (đã có số liệu nền) |

## Kết quả đo (26/08/2026)

Hai phép thử đã chạy TRƯỚC khi viết code, đúng nguyên tắc "không xây gì trước khi đo".

**EVAL-0 — baseline Director v1** ([báo cáo](evidence/baseline-2026-08-26.md) ·
[số thô](evidence/baseline-2026-08-26.json) · [golden set](golden/golden-set.json)):
26/30 thành công (86,7%); p50/p95 độ trễ 16,9s/75,1s; phình node median 4×;
T1 (đơn giản nhất) chỉ 62,5% còn T2 100%.

**EVAL-3 — schema qua các hãng** ([báo cáo](evidence/eval3-schema-acceptance-2026-08-26.md)):
qua AI Gateway, `DirectorPlanSchema` được **cả 4 hãng chấp nhận** (gemini, anthropic, openai,
deepseek) và trả plan hợp lệ — **với đúng một điều kiện**, xem mục dưới.

### ĐIỀU KIỆN TIÊN QUYẾT MỚI PHÁT HIỆN — chặn B05

`src/lib/director/dsl.ts:46` dùng `z.discriminatedUnion("kind", …)`, emit `oneOf`.
**OpenAI từ chối `oneOf` qua mọi đường** (*"'oneOf' is not permitted"*). `z.union` thường
emit `anyOf` — bốn hãng đều nhận. Phép thử cô lập: cùng model, cùng prompt, chỉ khác kiểu
union → `oneOf` 400, `anyOf` 200 kèm plan hợp lệ.

Chi phí sửa gần bằng 0: một chỗ dùng duy nhất, không test nào tham chiếu
`discriminatedUnion`, `Extract<DirectorStep,{kind:…}>` giữ nguyên. Và đường Anthropic hiện
tại (`zodOutputFormat`) VỐN ĐÃ emit `anyOf` — nên `discriminatedUnion` chưa bao giờ mang lợi
ích grammar, nó là mìn chờ đổi transport.

**Bản sửa này phải đi CÙNG gói đổi transport, không tách.**

### Hai hệ quả cho thiết kế eval

1. **Ngưỡng EVAL-1 không đủ.** *"≥80% compile 0-issue"* chỉ hỏi *plan biên dịch được không*.
   Director đạt 86,7% trong khi phình node median 4× và T4 (cố tình vượt năng lực) đạt 100%
   nhờ **thay thế im lặng** — đúng cú pháp, sai ý định. Thêm chiều đo: tỉ lệ node so với
   trường `expect` của golden set (đã có, không cần người chấm).
2. **Tỉ lệ lượt-1 chưa đo được từ ngoài** — endpoint và log đều chỉ cho kết quả cuối.
   Đây là bằng chứng đo được cho việc gói này (cột `attempts`) phải đi trước.

### Bài học đo, ghi để không lặp

Bản EVAL-3 đầu kết luận *"gateway không chuẩn hoá schema"* và đề xuất chuyển sang provider
package — **SAI**. Lúc đó tài khoản gateway ở free tier: `anthropic` trả 403, `google`/
`deepseek` trả `RateLimitError`, chỉ `openai` đo được, mà OpenAI tình cờ là hãng DUY NHẤT
từ chối `oneOf`. Một điểm dữ liệu sống sót trông giống một mẫu.

**Lỗi truy cập và lỗi giới hạn tốc độ không phải bằng chứng về hành vi của thứ đang đo.**

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau gói này, mỗi lượt Director có để lại đủ dấu vết để tính
  3 thước đo của director-v2 (tỷ lệ sửa-tiếp*, sai số ước tính thời gian, tín hiệu hối hận)
  mà KHÔNG đổi hành vi người dùng thấy?
  (*trước khi tính năng vá ship, thước đo #1 dán nhãn "tỷ lệ replace-trên-canvas-có-sẵn" — baseline.)
- Kết quả nào là SỐNG: client cũ chạy nguyên trạng; `pnpm test` xanh; migrator-thật pass;
  event ghi đủ 5 kind; row mồ côi <10%.
- Kết quả nào là CHẾT: buộc phải đổi trường response đang có (không chỉ thêm), hoặc
  migration không sống trên db cũ.
- Timebox: …

## Kết quả prototype

(chưa dựng)

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Kiến trúc memory 4 tầng + derived-first + 10 lằn ranh đỏ | [ADR-0013](../../docs/adr/0013-director-truong-ky.md) | quyết định nội bộ | có | Manh 26/08 |
| Mẫu duyệt-memory-giữ-niềm-tin | Cursor changelog 1.2 | triết-lý/logic | có (mẫu hành vi) | |
| State machine outcome một chiều | thiết kế từ phản biện khảo sát 26/08 | logic | có | |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = …** Căn cứ: …
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- 100% lượt Director sinh row `generated`; outcome được vá cho ≥90% lượt có tương tác UI.
- Client hiện tại (chưa biết trường mới) chạy nguyên trạng — zero sửa phía client trong gói này.
- Migrator-thật pass trên bản sao db người dùng cũ.

## Out of scope từ khám phá

- Đọc memory vào prompt / smart defaults / few-shot — làn D1+D4, KHÔNG thuộc gói này
  (gói này chỉ GHI, chưa ĐỌC). (tách 26/08)
- Trí nhớ canvas & vá đồ thị — ô [`director-v2`](../director-v2/opportunity.md) hạng mục 1–2. (tách 26/08)
- HMAC/chữ ký plan — rủi ro chấp nhận thành văn tại ADR-0013 QĐ 5, chỉ mở lại theo điều
  kiện xét lại ghi ở đó. (bác 26/08)
- Bảng `memories` + UI CRUD — wire-shape #5, gói riêng sau khi events chạy. (tách 26/08)
