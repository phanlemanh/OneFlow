# Research: Director trường kỳ — bộ nhớ, skill, vòng học (26/08/2026)

> **Phương pháp:** khảo sát đa agent (14 agent, 5 hướng nghiên cứu song song, vòng phản biện
> đối kháng trên phát hiện rủi ro, rà soát độ đầy đủ 17 phát hiện đối chiếu ADR/roadmap/
> opportunity). Mọi khẳng định trọng yếu kiểm chứng lại trực tiếp trên mã nguồn.
> **Quyết định rút ra đã vật chất hoá tại [ADR-0013](../adr/0013-director-truong-ky.md).**
> File này giữ phần *bằng chứng và thiết kế chi tiết* — đọc kèm, không thay thế ADR.

## 1. Phát hiện chặn đường

| # | Phát hiện | Bằng chứng | Hệ quả |
|---|---|---|---|
| 1 | Plan được accept **không bao giờ rời server** | `director-core.ts:176-183` chỉ trả name/description/nodes/edges; `route.ts:67-69` destructure đúng 4 trường | Turns replay, vá đồ thị, few-shot cá nhân đều bất khả thi tới khi wire trả `{planJson, runId, dslVersion}` |
| 2 | Ánh xạ stepId→nodeId là Map cục bộ bị vứt | `compile.ts:246`; node id `randomUUID` tại `compile.ts:242` | Model nói ngôn ngữ step id, đồ thị chỉ biết UUID — mọi plan "vá" thành thay-sạch-tương-đương |
| 3 | `MAX_TOKENS=16000` là trần **đầu ra**, không phải ngân sách chứa vocabulary | `director.server.ts:21` truyền vào `max_tokens` tại `:214` | Giả định #1 của `_acceptance/director-v2/opportunity.md` viết phép thử trên nền sai; trần thật chặn trí nhớ canvas là `MAX_PROMPT_LENGTH=2000` (`route.ts:6`) |
| 4 | Cơ chế quy chi phí **đã tồn tại**, chỉ thiếu bảng giá | `aggregateCogs(rows, rates)` — `src/lib/measure/cogs.ts:55`; kỷ luật "No rate table means no cost figure" (`cogs.ts:11-14`) | Giả định #3 của opportunity nhẹ hơn dự tính: thiếu RateTable do người vận hành nhập (điều kiện ③ G0), không phải "kênh metadata chưa tồn tại" |
| 5 | Ba nhánh outcome của UI không ghi gì | `director-prompt.tsx:73,277-291` (accept/replace/discard) | Tín hiệu accept/reject mất vĩnh viễn mỗi ngày chưa có `director_events` |
| 6 | `parseWorkflowImportJson` KHÔNG strip field lạ trên node | kiểm thực bởi vòng phản biện (`exporter.ts:1046`) | Stamp `data.directorStepId` sống sót qua import/apply — chi phí thấp hơn dự tính, `src/lib/director/**` không thuộc t3_paths |

## 2. Kiến trúc bộ nhớ — năm tầng, hai chủ quyền

Chi tiết từng tầng (M1 canvas / M2 hội thoại / M3 kết cục / M4 sở thích / M5 thực thể),
chủ quyền và nơi lưu: xem ADR-0013 quyết định 1–2. Bổ sung bằng chứng:

- Canvas chưa-save chỉ sống trong localStorage trình duyệt (`use-flow.ts:48-64`,
  `workspace.tsx:253-305`) — server mù hoàn toàn, nên client PHẢI gửi kèm.
- Bảng mới tự hưởng tenancy per-scope qua `getDb()` (`ext-default/db.ts:19-38`) — không cần
  cột user; cloud-shell seam `src/ext/db.ts` phủ luôn memory.
- KHÔNG nhét memory vào env-store: blob string phẳng bị bơm vào env mọi plugin con
  (`env-store.server.ts:60-68`).
- Mẫu thị trường đối chiếu: Cursor (duyệt memory nền tảng để giữ niềm tin —
  cursor.com/changelog/1-2), Claude Code (taxonomy type + index nhỏ luôn nạp), Claude.ai
  (recall trước, synthesis sau), phản-mẫu: tầng Reference Chat History không-xem-được của
  ChatGPT. Google Flow: nguồn primary duy nhất còn sống là
  support.google.com/flow/answer/17093911 ("sessions are specific to the project") — các
  suy diễn "Flow nhớ style xuyên session" KHÔNG còn căn cứ primary (nguồn thứ cấp đã sập).

### Cấu trúc prompt v3 — xếp khối theo tần suất biến thiên

```
system[
  RULES                        (đổi khi ship version)
  "Available slots:" vocab     (đổi khi cài plugin)      ⛏ BP1  ← giữ vị trí hiện tại
  "Available skills:"          (đổi khi user sửa skill)  ⛏ BP2  ← tách riêng, skill churn không giết cache slots
  memory-confirmed + entity-digest                       ⛏ BP3  ← CÓ ĐIỀU KIỆN: chỉ khi render byte-stable
]                                                                 (sort theo id, không timestamp; đo hit-rate)
messages[
  ...turns replay từ client    (phần đã ổn định ĐƯỢC mang BP ở turn cuối)
  user cuối = canvas + prompt  (churn per-request — KHÔNG BAO GIỜ mang breakpoint)
]
```

Chi phí đo được ở cấu hình thật (22 slot): ~7.830 ký tự system ≈ 2,0–2,2k token/lượt +
~1.813 ký tự JSON Schema ≈ 450–500 token; trần 58 slot: ~12.838 ký tự ≈ 3,2–3,6k token.
Model không phải Anthropic qua gateway → mất toàn bộ prefix cache — hiện số này cho người
dùng, đừng để họ phát hiện qua hoá đơn.

## 3. Skill system v1 — đối chiếu thị trường

Manifest derive ~70% từ ExecutableWorkflow sẵn có (`executable-workflow.ts:141-165,189-233`;
`x-expand-each` đã hiện thực qua `OutputRoute.expandEach` + `batchField`). Phần thêm học từ
thị trường:

| Trường | Nguồn mẫu | Ghi chú |
|---|---|---|
| id kebab-case ≤64, trùng tên thư mục | agentskills.io spec | |
| semver 3 số, **bất biến sau publish** | Comfy Registry | điều GPTs/Gems thiếu nên không dùng được cho sản xuất |
| description "what + khi-nào-dùng" ≤1024 | cả thị trường | cơ chế Director chọn skill là description-matching, không tool-call |
| `requires` (slot/plugin cần cài) | Comfy custom-node pins | filter = membership check trên `nodePluginMap`, KHÔNG qua fixed-point |
| `estimate` hook | **không ai có** | nối `aggregateCogs` — khoảng trống khác biệt của OneFlow |
| khai báo side-effect/ingest | — | skill #1 ghi ngược media-library; thiếu từ v1 thì mọi skill publish phải bump major khi thêm |

Ba quyết định cứng (tái dẫn xuất ADR-0002, không phải mở lại): skill-as-whole-plan XOR
đồ thị tự do (fixed-point hiện hành không loại được mutual-sustain nếu skill thành step);
orchestration là code TS thuần trong `src/lib/skills/<id>/orchestrator.ts`; lưu dạng
thư mục file trong repo, KHÔNG nhét registry plugin 40 entry (AST-scan Python không chứa
manifest JSON — `docs/plugins.md:77,212`). Bảng `skills` cho skill user-tạo: chờ nhu cầu thật.

Phân phối về sau: mẫu `N8N_TEMPLATES_HOST` — một env var + API contract 7 endpoint là đường
rẻ nhất, không xây registry ở v1.

## 4. Vòng học — derived-first, chống poisoning bằng kiến trúc

- **V1** (không chạm prompt 1 byte): `director_events` ghi 2 pha (server ghi `generated`
  tại route; client vá outcome qua `POST /api/director/feedback` — state machine một chiều
  từ `generated`, mỗi runId vá một lần) + smart defaults thay registry-order tại
  `vocabulary.server.ts:19` (GROUP BY tasks completed, ngưỡng ≥3, winner ∈ tập plugin đang
  cài, fallback registry-order) + `estimateMs` = median lịch sử của user per (slot, plugin).
- **Ba thước đo của opportunity.md phủ trọn bằng schema v1** — với nhãn bắt buộc: trước khi
  tính năng vá ship, thước đo #1 đọc là "tỷ lệ replace-trên-canvas-có-sẵn" (baseline),
  KHÔNG so thẳng với số sau-vá. Thước đo #2 giai đoạn 1 đo sai số THỜI GIAN
  (estimateMs vs durationMs, MAPE); sai số TIỀN chờ RateTable — đổi định nghĩa có chữ ký.
- **V2** (few-shot cá nhân — phụ thuộc V1): K plan accepted gần nhất cùng `dslVersion`,
  gate 3 lớp per ví dụ (compile 0-issue + sanitize chuỗi dạng-chỉ-thị + cùng dslVersion),
  tiêm làm cặp turn SAU cache breakpoint, kill-switch trong settings. Cột
  `memoryBlockDigest` trong events làm bằng chứng audit per-run + số đo hit-rate BP3.
- **Chống drift không cần TTL**: memory là derived — decay = cửa sổ truy vấn, quên = xoá
  event nguồn, migrate = filter `dslVersion` (kỷ luật `cogs.ts:8-14`: không lưu số suy diễn).
- Ngoại lệ có chủ đích duy nhất: override/reset smart defaults phải là BẢN GHI (một dòng
  `memories` type `default-override`) — cái được lưu là quyết định của user, không phải số
  suy diễn.

## 5. Bảy wire-shape chuẩn bị ngay

(Đã qua phản biện — hai mục bị loại: cột `workflows.plan` trùng dữ liệu events;
reserve `entity_refs` trong code là YAGNI, chỉ ghi shape thành văn, code là việc đầu tiên
của 1.7.)

1. Wire thành công trả `{planJson, runId, dslVersion}` — sửa nhánh ok đang vứt plan. (T3)
2. Bảng `director_events` (+ kind `failed`, errorCode, attempts, usedMemory,
   memoryBlockDigest từ row đầu) + `POST /api/director/feedback`. (T3)
3. Body versioned `{prompt≤2000, turns?, canvas?, options?}` — trần theo từng trường,
   trường mới để trống. (T3)
4. Stamp `data.directorStepId` vào node lúc compile. (T2 — import không strip field lạ)
5. Bảng `memories` — schema đúng từ migration đầu (status/type/sourceRunId), UI sau. (T3)
6. Cột `workflows.directorRunId` — nối provenance run→workflow→tasks→materials.isFavorite. (T3)
7. Phụ lục ADR-0002: manifest skill + shape `[{entityId, version}]` thành văn. (docs)

Mục 1+2+3 gộp MỘT slug acceptance: [`director-wire-shape`](../../_acceptance/director-wire-shape/opportunity.md)
— cùng chạm `route.ts`, trả phí gate một lần. Kỳ vọng ~1–2 tuần lịch/gói T3 với 1 maintainer.

## 6. Làn D — thứ tự (chi tiết ở roadmap.md)

D0 wire-shape (trước cả director-transport-open — dữ liệu accept tích luỹ từ ngày này) →
D1 smart defaults + estimate + đo 2 giả định "Chưa thử" → D2 trí nhớ canvas + vá (=
director-v2 hạng mục 1→2; vá chỉ đi khi directorStepId xong VÀ giả định #2 sống) →
D3 phụ lục ADR-0002 trước 1.5 (kèm phép thử cache-key ~30 phút) → 1.5–1.7 giữ nguyên vị trí
→ D4 memories UI + few-shot + auto-run opt-in (YAGNI-gated, sau 1.7).

## 7. Rủi ro còn theo dõi

1. **Memory poisoning qua canvas** — canvas serialization mở kênh injection gián tiếp;
   gate compile chỉ kiểm cấu trúc, bắt buộc lớp sanitize trước pool few-shot.
2. **Chi phí prompt** — mỗi assistant turn replay ~1–3KB; token canvas 20 node CHƯA ĐO
   (giả định #1, phép thử ghi ở `director-wire-shape`).
3. **Cache** — `output_config` có nằm trong khoá cache không: phép thử bắt buộc trước D3.
4. **Scope 1 maintainer** — D0 chỉ wire-shape + 1 bảng; mọi thứ khác YAGNI-gated.
5. **Plan replay không HMAC** — rủi ro chấp nhận thành văn tại ADR-0013 quyết định 5,
   kèm điều kiện xét lại.

## 8. Câu hỏi đã đóng (trả lời của Manh, 26/08)

| Câu hỏi | Trả lời |
|---|---|
| Làn D ăn chung slug `director-v2`? | **Mở riêng** — `director-wire-shape` cho hạ tầng; `director-v2` giữ nguyên nghĩa sản phẩm |
| HMAC hay chấp-nhận-rủi-ro cho plan replay? | **Chấp nhận rủi ro thành văn** (ADR-0013 QĐ 5, có điều kiện xét lại) |
| media-library có endpoint entity `{entityId, version}`? | **Mặc định có** — library chạy repo độc lập, thiết kế cho OneFlow; xác nhận boundary spec tại 1.7 |
| Phép thử cache-key trước phụ lục ADR-0002? | **Đồng ý** — chạy ở D3 |
