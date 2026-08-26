# Lộ trình sản phẩm — 24 tuần (08/2026 → 01/2027)

> **Phạm vi: chỉ phát triển sản phẩm.** GTM, growth, vận hành nằm ngoài tài liệu này
> (quyết định 07/2026). Mọi gate là **gate sản phẩm** — đo bằng chất lượng, hiệu năng,
> chi phí kỹ thuật; không đo bằng chỉ số thị trường.
>
> Phân vai: file này = *sẽ đi đâu*; [STATUS.md](../STATUS.md) = *đang ở đâu*;
> [feature-index.md](feature-index.md) = *làm được gì*. Cập nhật file này **mỗi lần qua gate
> VÀ mỗi lần một ADR được chấp nhận** — vế sau thêm 19/08, vì cả hai lần đảo chiều (ADR-0011,
> ADR-0012) đều rơi giữa hai gate và luật cũ để chúng lọt khe. Không cập nhật theo tuần. Số liệu gate đọc từ hạ tầng đo lường
> (`_acceptance/measure-harness/`). Quyết định nền tảng: [docs/adr/](adr/).
>
> Luật cập nhật trên đang được trang bị răng: guard `scripts/roadmap/check-roadmap-fresh.sh`
> (đã viết 19/08, nhánh `chore/roadmap-guard`, chứng minh răng 6/6) đối chiếu file này với
> `docs/adr/` và `_acceptance/*/contract.md` — đỏ khi có ADR chưa được nhắc, có hạng mục đã ký
> chưa vào sổ cái, hoặc có chỗ **viện dẫn ADR đã bị thay thế mà không nhắc ADR thay nó** —
> đúng loại trôi đã xảy ra với ADR-0011 giữa 05/08 và 19/08. Guard vào bằng PR riêng **qua
> acceptance gate**, vì miễn trừ T1 của gate tooling khai theo đường chính xác — gate áp lên
> chính nó (cùng chủ đề với nợ 0.8 gate-tooling).
>
> Quyết định ngách (seller e-commerce ↔ môi giới BĐS) chốt ở Gate G0 — chỉ đổi bộ thực thể
> KG và nguồn input skill P0, không đổi kiến trúc hay lộ trình.

## Nguyên tắc điều hành

1. **Tuần tự tàn nhẫn** — nguồn lực 1 người: thứ tự trong mỗi phase là thứ tự thực thi.
2. **Không xây gì trước khi đo** — mỗi phase mở đầu bằng số liệu thật.
3. **Mỗi phase một gate bằng số** — trượt gate là dừng sửa, không lao tiếp.
4. **Không được cắt trong mọi kịch bản:** cache engine (1.1) và overlay (1.2).

## Bước ngoặt 05/08 — local-first ([ADR-0011](adr/0011-local-first-execution.md))

Lộ trình này được viết 07/2026 dưới giả định *managed cloud là mặc định*
([ADR-0005](adr/0005-managed-cloud-default.md)). **Giả định đó đã đổi.** ADR-0011 (05/08) đặt
**máy của người dùng làm nền thực thi mặc định**, BYO key thành mặc định, managed cloud thành
**tier** — thay thế nửa "managed là mặc định" của ADR-0005. Ba dữ kiện đo được đứng sau nó: 5
plugin Modal xin `gpu=NONE`, thực thi vốn đã là local (`runners/generic.ts` spawn subprocess),
và hạ tầng BYO key đã tồn tại sẵn.

**Kiến trúc và thứ tự phase không đổi.** Cái đổi là *ai chạy* — và do đó nội dung của Phase 2
mục 1 (xem bên dưới) cùng một làn việc mới xen kẽ giữa các hạng mục P0:

| | Phân rã local-first (spec S2 §Out of scope) | Trạng thái |
|---|---|---|
| S1 | ADR-0011 | ✅ 05/08 |
| S2 | `oneflow-api-ffmpeg` + `oneflow-api-pyscenedetect` thay 2 plugin Modal `gpu=NONE`; venv riêng mỗi plugin | ✅ ký 07/08 (`local-cpu-plugins`) |
| S3 | Đường transcribe không-Modal | 🔜 **đã chen trước 1.4** (chốt 19/08) — nằm trên **hai** đường tới hạn (skill #1 *và* phép đo WER của G0 theo [ADR-0010](adr/0010-mainstream-infra-and-models.md)); xếp sau 1.3b trong hàng thực thi Phase 1 |
| S4 | UX BYO key cho người dùng đầu tiên | ✅ **ký 19/08** (`byo-key-onboarding`, T3, merge PR #68) — điều kiện đảo chiều của ADR-0011 **từ nay đo được**; phiên nghiệm thu với người dùng đại diện thành việc của làn A |
| S5 | Desktop app thành app local thật (hôm nay là vỏ Pake trỏ `app.tongflow.com`) | 🔴 chưa bắt đầu — liên đới hạng mục 0.1 "desktop chưa tách" |
| S6 | 26 plugin GPU còn lại sang đường API — tuần tự theo nhu cầu ([ADR-0007](adr/0007-sequential-plugin-forking.md)). *Thu hẹp 19/08:* bộ ba crawl `docling`/`crawl4ai`/`scrapling` **rút khỏi S6** — chúng chồng vai ingest của media-library ([ADR-0012](adr/0012-media-library-boundary.md)); số phận là quyết định **hai repo**, chưa chốt | 🔴 chưa bắt đầu |

⚠️ **ADR-0011 đảo một rủi ro critical của hội đồng mà chưa có bằng chứng thị trường mới.** Nó tự
ghi điều kiện đảo chiều: *≥1/3 người dùng đại diện không tự nhập được key ở onboarding → managed
quay lại làm mặc định*. **S4 ký 19/08 gỡ chốt chặn phép đo**: trước đó người dùng còn chưa tới
nổi bước nhập key. Điều kiện nay ĐO ĐƯỢC nhưng **chưa đo** — phiên nghiệm thu với người dùng
đại diện là việc của làn A (người vận hành); tới khi có số, ADR-0011 vẫn ở trạng thái
đảo-chiều-chưa-có-bằng-chứng và Phase 2 phải đọc kèm cảnh báo này.

## Nền kho + tri thức — media-library ([ADR-0012](adr/0012-media-library-boundary.md))

Từ 19/08, kho footage + đồ thị thực thể + provenance/nhãn AI của hệ sống ở **media-library**
(service headless độc lập, repo riêng, đa lĩnh vực theo quy hoạch — BĐS trước, tài chính/bảo
hiểm sau). OneFlow là **khách qua hợp đồng REST + API key** với tám bảo đảm ranh giới ghi
trong ADR — không nhúng code, không phụ thuộc cứng (local-first giữ nguyên), không nguồn sự
thật thứ hai, lĩnh vực là dữ liệu chứ không phải code. Hệ quả lên lộ trình: 1.7 đổi cách
hiện thực (uỷ quyền), và node nạp-từ-kho là hạng mục làm được trước G0. Sơ đồ ranh giới:
[oneflow-media-library-boundary.html](assets/oneflow-media-library-boundary.html).

## Làn D — Director trường kỳ ([ADR-0013](adr/0013-director-truong-ky.md), 26/08)

Khảo sát 26/08 ([research-director-truong-ky-2026-08.md](strategy/research-director-truong-ky-2026-08.md),
[research-mo-hoa-2026-08.md](strategy/research-mo-hoa-2026-08.md)) vật chất hoá "agent là
giao diện" thành nền trạng thái bốn tầng + học derived-first. **Xen kẽ như làn local-first,
không nối đuôi, không đánh lại số cũ**; mỗi mục D chỉ chen khi không chặn đường tới hạn G0/G1.

| | Hạng mục | Trạng thái |
|---|---|---|
| D0 | Wire-shape một gói ([`director-wire-shape`](../_acceptance/director-wire-shape/opportunity.md)): wire trả `{planJson, runId, dslVersion}` + bảng `director_events` + body versioned. Chạy TRƯỚC director-transport-open — dữ liệu accept tích luỹ từ ngày ship | 🔜 discovery, Cổng 0 chưa ký |
| D1 | Smart defaults (thay registry-order tại `vocabulary.server.ts:19`, winner ∈ plugin đang cài) + `estimateMs` trên node + đo 2 giả định "Chưa thử" của director-v2 | 🔴 chờ D0 |
| D2 | Trí nhớ canvas + vá đồ thị = [`director-v2`](../_acceptance/director-v2/opportunity.md) hạng mục 1→2 (Cổng 0 riêng); vá chỉ đi khi `directorStepId` xong VÀ giả định #2 sống | 🔴 chờ D1 |
| D3 | Phụ lục ADR-0002 (manifest skill: semver bất biến, description khi-nào-dùng, requires, estimate hook, side-effect) — ký TRƯỚC dòng code đầu của 1.5; kèm phép thử cache-key ~30 phút (Manh đồng ý 26/08) | 🔴 chặn 1.5 |
| D4 | Bảng `memories` UI CRUD + few-shot cá nhân (gate 3 lớp) + auto-run opt-in — YAGNI-gated, chỉ sau 1.7 và khi events đủ dày | 🔴 chưa bắt đầu |

Làn B (mở hoá — dọn pháp lý B01, provenance plugin B02, transport B05, pin SHA B07, hợp nhất
URL engine B08) ghi ở [research-mo-hoa-2026-08.md](strategy/research-mo-hoa-2026-08.md) §3;
B01/B02 là việc trước-mọi-tag, chưa vào sổ hạng mục vì là T1 + quyết định sản phẩm.

## Phase 0 — Nền độc lập & số liệu gốc (T1–T4)

| # | Hạng mục | DoD | Trạng thái |
|---|---|---|---|
| 0.1 | Độc lập upstream: SDK distribution riêng; plugin fork tuần tự theo nhu cầu ([ADR-0007](adr/0007-sequential-plugin-forking.md), [ADR-0008](adr/0008-naming-and-distribution.md)); dừng build desktop tới khi tách khỏi `app.tongflow.com` | CI xanh trên SDK mới; scanner nhận diện đủ plugin | ◐ `oneflow-sdk` 0.2.18 đã publish; `per-plugin-origin` ký & merge 27/07 (PR #20); **fork đầu tiên đã hạ cánh** — `oneflow-modal-compose-overlay` là entry origin đầu tiên (05/08, PR #43); **desktop chưa tách** — chờ quyết định URL cloud |
| 0.2 | Metering + móng provenance: `cost_usd`, `duration_ms`, `gpu_type` vào bảng tasks | Mỗi task ghi đủ 3 cột | ✅ `task-metering` đã ký 25/07 |
| 0.3 | Bộ đo chuẩn tái chạy được: WER Whisper-vi thực địa; ~~MOS TTS-vi mù~~ ([ADR-0009](adr/0009-tts-vi-eleven-v3.md) đóng bằng phán quyết); COGS pipeline P0 + ma trận 20 video | Script + báo cáo số trong repo | ◐ script đã ký (`measure-harness`, 26/07) · MOS **đóng** 27/07 · WER chờ **clip thực địa + ref chép tay** · COGS chờ task chạy thật + hoá đơn |
| 0.4 | Spec cache content-addressed + partial re-render | Spec duyệt: khoá hash, dirty-propagation, API "chạy từ node X" | ◐ spec xong (PR #11): [engine-cache-partial-rerender](spec/prd/engine-cache-partial-rerender.md) — 3 câu hỏi mở (§7) chưa chốt |

**Gate G0:** WER ≤ ngưỡng phụ đề bán tự động · ~~MOS TTS-vi~~ **đóng 27/07** bằng
[ADR-0009](adr/0009-tts-vi-eleven-v3.md) (`eleven_v3`, phán quyết vận hành — không có số trong
repo, đánh đổi ghi trong ADR) · COGS/render trong khung mô hình 3 tier · spec cache duyệt ·
**chốt ngách** (bộ thực thể KG v0).
*Trượt WER → wedge chuyển sang phụ đề có bước sửa tay (đổi thiết kế skill, không đổi lộ trình).*

**Hạn danh nghĩa của G0 dời T4 → T5 (ghi 19/08).** Trượt không phải vì đo trượt mà vì cả bốn
điều kiện còn lại đều **chờ người vận hành** — nguyên tắc "trượt gate là dừng sửa" viết cho gate
đo trượt, không áp cho gate chờ người; làn B không dừng. Hành động tuần này: điều kiện ⓪ (ký
ngưỡng số — ~30 phút, không cần dữ liệu, đứng trước các điều kiện kia về logic).

**Còn lại để qua G0 (cập nhật 05/08):** bốn điều kiện, cả bốn cần người vận hành —
⓪ **ký ngưỡng số** ([g0-runbook §0](measure/g0-runbook.md) — đứng trước các chặn kia về logic:
chốt vạch sau khi thấy số liệu là mất tính khách quan của gate) · ① clip thực địa + bản chép
tay (WER) · ② task chạy thật + hoá đơn (COGS) · ③ quyết định ngách.
Corpus WER chờ ở [`measure/wer-corpus/`](../measure/wer-corpus/).

Theo [ADR-0010](adr/0010-mainstream-infra-and-models.md), "Whisper" trong DoD trên đọc là
*bản Whisper sẽ ship*, không riêng bản GPU. Phép đo chạy cùng bộ clip qua các đường **phổ
biến** — APIMart · OpenAI · ElevenLabs Scribe (đối chứng khác họ) — và Modal chỉ khi còn cân
nhắc ship nó. Kết quả trả lời luôn câu "giữ hay bỏ Modal khỏi P0" bằng số thay vì phỏng đoán.

## Phase 1 — Năng lực P0 (T5–T10)

Danh sách theo **thứ tự thực thi** (đánh số cố định — 1.3b và S3 chen theo quyết định 19/08,
không đánh lại số cũ):

- **1.1** ✅ **Cache + partial re-render** hạ cánh trong `sdk/tongflow/engine/` ([ADR-0001](adr/0001-cache-before-cloud.md)) + test conformance TS↔Python đầu tiên (lấy `batchField` drift làm test case số 1). *Đóng trọn L0→L4, 01/08.*
- **1.2** ✅ **Slot `compose-overlay`** (media + ops[] typed: text/khung giá/logo/safe-zone) → `pnpm gen:abi` → plugin CPU (font phủ đủ dấu tiếng Việt) → node UI. *Ký 03/08, merge 05/08 (PR #43).*
- **1.3** 🔜 **Slot/node `normalize-text-vi`** tất định (số, giá, ngày → chữ), bắt buộc đứng trước TTS trong mọi template. *Hạng mục kế tiếp — không phụ thuộc G0; đường guard đã an toàn sau gói CI-a.*
- **1.3b** **Node nạp-từ-kho** — giai đoạn A của [ADR-0012](adr/0012-media-library-boundary.md): search → chọn thẻ → URL ký → `file_key`. Add node không ABI-driven nên không đụng ABI/SDK; key qua kho khoá BYO; làm được trước G0. Mở khoá input cho skill #1.
- **S3** **Transcribe không-Modal** — *chen trước 1.4, chốt 19/08*: nằm trên **hai** đường tới hạn cùng lúc (chuỗi skill #1 và phép đo WER của G0 theo [ADR-0010](adr/0010-mainstream-infra-and-models.md)); có nó thì ngày corpus về là đo được ngay. Trong chuỗi skill #1, transcribe cũng đứng trước TTS.
- **1.4** **Plugin TTS ElevenLabs** (tiếng Việt) theo pattern API-plugin.
- **1.5** **Skill system v1** ([ADR-0002](adr/0002-skill-template-orchestrator.md)): template + manifest tham số + orchestrator TS (`src/lib/skills/`); Director sinh instance; canvas ẩn sau "xem/sửa kế hoạch".
- **1.6** **Skill #1 "Footage → kho clip"** — *viết lại theo ADR-0012, "kho clip" nay LÀ media-library*: input từ node nạp-từ-kho (1.3b) hoặc upload → split-video → transcribe-timestamp → drop-video → tách/thay hoặc denoise audio → overlay phụ đề + khung giá → xuất 9:16 → **ingest ngược về library** (`provenance: generated` + nhãn AI, chữ ký `provider:oneflow`) + telemetry lượt dùng. Giai đoạn B của ADR-0012 nhập vào hạng mục này, không tách riêng. (Livestream hay tour nhà là tham số.)
- **1.7** **KG v0 + provenance wire shape** ([ADR-0004](adr/0004-universe-kg-three-entities.md), hiện thực theo [ADR-0012](adr/0012-media-library-boundary.md)): **uỷ quyền media-library** — `tasks.entity_refs` trỏ `entity_id` của library, `FieldBinding kind:"entity"` resolve qua API; giới hạn 3 loại thực thể giữ nguyên như bộ lọc tiêu thụ, không xây bảng entities riêng.

> **Làn local-first xen kẽ ở đây, không nối đuôi.** Câu hỏi thứ tự 1.4 / S3 / S4 mở từ 07/08
> **đã đóng 19/08**: S3 chen trước 1.4 (lý do ghi tại dòng S3 ở trên); S4 (UX BYO key) **đã ký
> cùng ngày** — điều kiện đảo chiều của [ADR-0011](adr/0011-local-first-execution.md) từ nay
> đo được.

**Gate G1:** 50 clip liên tiếp không lỗi dấu / không sai số giá trên overlay · demo "đổi giá →
chỉ re-run overlay+merge" chứng minh bằng telemetry · skill #1 chạy headless qua engine cho kết
quả giống canvas (conformance pass).

## Phase 2 — Năng lực cloud & vòng dữ liệu (T11–T16)

1. **Managed shared mode — nay là *tier*, không phải mặc định** ([ADR-0011](adr/0011-local-first-execution.md) thay thế nửa managed-mặc-định của [ADR-0005](adr/0005-managed-cloud-default.md)): flag gỡ cache-dir per-scope trong plugin-executor; Modal workspace gộp + secret server-side. **Cơ chế giữ nguyên, vai trò đổi** — đây là đường dành cho người không tự nhập key, không còn là đường đi mặc định của sản phẩm. Ưu tiên của nó phụ thuộc số đo của điều kiện đảo chiều ADR-0011 (S4 đã ký 19/08 — chỉ còn chờ phiên đo); ADR-0005 chưa được hiện thực dòng nào nên việc đảo chiều không tốn gì.
2. **Metadata sang Postgres** + schema org/membership/workspace ngay từ đầu.
3. **Độ bền thực thi:** retry/timeout/resume cho run; sống sót server restart; hàng đợi thay subprocess-per-run.
4. **Metering → gating:** quota theo workspace; đếm "lượt sinh mới" tách khỏi "lượt sửa" (cơ chế là sản phẩm; bảng giá ngoài phạm vi).
5. **Telemetry opt-in:** 2 chỉ số lõi — % render là partial; chi phí/asset hoàn thành.
6. **Metrics loop v1:** import CSV TikTok/Meta Ads → join theo `entity_refs` (= `entity_id` của media-library, [ADR-0012](adr/0012-media-library-boundary.md)) → bảng xếp hạng biến thể. Lượt-dùng-asset đọc từ telemetry của library, chi phí đọc từ metering của OneFlow — **không xây bộ đếm thứ hai**.

**Gate G2:** run 100 node sống sót restart · ≥25% render trong dogfood là partial · COGS đo qua
metering khớp dự toán G0 ±20% · CSV map đúng ≥95% biến thể.

## Phase 3 — Ma trận, judge & R&D chặng 2 (T17–T24)

1. **Skill #2 "Kho → ma trận"** (*đổi tên từ "Nguồn → ma trận", 19/08*): fan-out biến thể × format × khung giá trong orchestrator, tiêu thụ search/coverage của media-library; khoá chủ thể (matting/fusion) phía OneFlow. Nửa "crawl → entity" cũ là đúng nghiệp vụ ingest của library ([ADR-0012](adr/0012-media-library-boundary.md) bảo đảm #4) — việc nạp nguồn về kho thuộc phía library. (Fan-out sống ở orchestrator, không nhét vào engine.)
2. **Slot `media-judge`** structured-output ([ADR-0003](adr/0003-media-judge-ranker-first.md)) + bộ 200 mẫu gắn nhãn đo FPR; judge vào skill ma trận ở vai **ranker**.
3. **Batch semantics thống nhất:** đưa `x-expand-each`/batch về orchestrator, xoá drift hai runtime còn lại.
4. **OF-CB-1** (benchmark consistency 5 arm, ~$1.000): chạy nền T17–T21 → verdict go/no-go cho thiết kế Character/Location (chặng 2).
5. **Kiểm tra thiết kế "sẵn sàng pháp lý"** ([ADR-0006](adr/0006-defer-vn-compliance.md)): còn **một** bài kiểm phía OneFlow — overlay render được nhãn AI bằng một tham số. Nửa truy-vết-provenance đã là trường dữ liệu phía media-library (ingest ngược mang `provenance: generated` theo [ADR-0012](adr/0012-media-library-boundary.md) bảo đảm #5), không phải bài kiểm phía này nữa.

**Gate G3:** ma trận 20 biến thể end-to-end < 60 phút với COGS trong khung · judge FPR đo được,
< 15% ở vai ranker (mục tiêu < 5% để lên auto-gate) · OF-CB-1 có verdict go/no-go chặng 2.

## Bối cảnh lịch (tham chiếu, không phải hạng mục)

Mùa sale 9.9 rơi vào T6, 11.11 vào T15, 12.12 vào T20, Tết 06/02/2027 ngay sau T24 — các mốc
năng lực nên chín trước những thời điểm này để tuỳ chọn khai thác (kế hoạch khai thác nằm
ngoài phạm vi tài liệu).

## Sổ cái hạng mục đã ký

> **Vì sao sổ cái này tồn tại.** Lộ trình chỉ nói *sẽ đi đâu*, nên một gói việc đã ký có thể
> hoàn toàn không xuất hiện ở đây mà vẫn đúng — nếu nó là hạ tầng quy trình chứ không phải năng
> lực sản phẩm. Nhưng "không xuất hiện vì thuộc loại khác" và "không xuất hiện vì quên" nhìn
> giống hệt nhau trong một file markdown. Sổ cái buộc mỗi hạng mục đã ký phải **được phân loại
> một lần**, và [guard](../scripts/roadmap/check-roadmap-fresh.sh) đỏ khi có hạng mục ký rồi mà
> chưa ai phân loại. Đây là chỗ duy nhất trong repo trả lời được câu "hạng mục này ở đâu trên
> lộ trình".

Nguồn: `_acceptance/*/contract.md` với `status: signed-off`. **21 hạng mục** trên `main`
@ `621a30d` (19/08, sau `byo-key-onboarding`) — lưu ý [STATUS.md](../STATUS.md) còn ghi con số
cũ **17** (chốt 17/08, trước ba hồ sơ ký 18/08 và hồ sơ 19/08).

<!-- roadmap-ledger:start -->

| Hạng mục đã ký | Tier | Ký | Vị trí trên lộ trình |
|---|---|---|---|
| `task-metering` | T3 | 25/07 | **0.2** — metering + móng provenance |
| `measure-harness` | T2 | 26/07 | **0.3** — bộ đo WER / MOS / COGS |
| `sdk-distribution-rename` | T3 | 26/07 | **0.1** — độc lập upstream ([ADR-0008](adr/0008-naming-and-distribution.md)) |
| `oneflow-plugin-prefix` | T3 | 26/07 | **0.1** — độc lập upstream ([ADR-0008](adr/0008-naming-and-distribution.md)) |
| `per-plugin-origin` | T2 | 27/07 | **0.1** — độc lập upstream ([ADR-0007](adr/0007-sequential-plugin-forking.md)) |
| `conformance-l0` | T3 | 28/07 | **1.1** — lát L0, conformance TS↔Python |
| `cache-l1-fingerprint` | T3 | 29/07 | **1.1** — lát L1, khoá content-addressed |
| `cache-l2-store` | T3 | 30/07 | **1.1** — lát L2, store trên đĩa |
| `cache-l3-tier-b` | T3 | 30/07 | **1.1** — lát L3, tầng B |
| `cache-l4-eviction` | T3 | 31/07 | **1.1** — lát L4, LRU + purge. *Trục 1.1 đóng* |
| `compose-overlay` | T3 | 02/08 | **1.2** — slot overlay text/giá/logo/safe-zone |
| `local-cpu-plugins` | T2 | 06/08 | **S2** — làn local-first ([ADR-0011](adr/0011-local-first-execution.md)) |
| `byo-key-onboarding` | T3 | 19/08 | **S4** — làn local-first: UX BYO key lượt chạy đầu; mở khoá phép đo điều kiện đảo chiều ADR-0011 |
| `dependency-refresh-2026-07` | T2 | 26/07 | *ngoài lộ trình* — bảo trì phụ thuộc |
| `ci-actions-bump` | T2 | 26/07 | *ngoài lộ trình* — hạ tầng CI |
| `stale-scope-by-paths` | T2 | 28/07 | *ngoài lộ trình* — hạ tầng cổng nghiệm thu |
| `gate-scope-anchors` | T2 | 04/08 | *ngoài lộ trình* — hạ tầng cổng nghiệm thu (0.6 theo cách đánh số của STATUS) |
| `ci-vitest-sdk-pin` | T2 | 05/08 | *ngoài lộ trình* — hạ tầng CI (gói CI-a) |
| `pnpm-build-approvals` | T2 | 18/08 | *ngoài lộ trình* — hạ tầng chuỗi công cụ verify |
| `scan-with-block-imports` | T3 | 18/08 | *ngoài lộ trình* — chẩn đoán scanner plugin |
| `scan-scope-diagnostics` | T3 | 18/08 | *ngoài lộ trình* — chẩn đoán scanner plugin |

<!-- roadmap-ledger:end -->

**Đọc được gì từ tỉ lệ này:** 13/21 hạng mục đã ký là năng lực sản phẩm, 8/21 là hạ tầng quy
trình và CI. Con số thứ hai không phải lãng phí — nó là giá của luật "mỗi phase một gate bằng
số" — nhưng nó *là* một khoản chi có thật, và lộ trình 24 tuần không tính nó vào bất kỳ ô nào.
