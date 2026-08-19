# Lộ trình sản phẩm — 24 tuần (08/2026 → 01/2027)

> **Phạm vi: chỉ phát triển sản phẩm.** GTM, growth, vận hành nằm ngoài tài liệu này
> (quyết định 07/2026). Mọi gate là **gate sản phẩm** — đo bằng chất lượng, hiệu năng,
> chi phí kỹ thuật; không đo bằng chỉ số thị trường.
>
> Phân vai: file này = *sẽ đi đâu*; [STATUS.md](../STATUS.md) = *đang ở đâu*;
> [feature-index.md](feature-index.md) = *làm được gì*. Cập nhật file này **mỗi lần qua gate**,
> không cập nhật theo tuần. Số liệu gate đọc từ hạ tầng đo lường
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
| S3 | Đường transcribe không-Modal | 🔴 chưa bắt đầu — nằm trên **hai** đường tới hạn (skill #1 *và* phép đo WER của G0 theo [ADR-0010](adr/0010-mainstream-infra-and-models.md)); có lý do chen trước 1.4 |
| S4 | UX BYO key cho người dùng đầu tiên | 🔜 đang chạy (`byo-key-onboarding`) — **tiền đề để đo được điều kiện đảo chiều của ADR-0011** |
| S5 | Desktop app thành app local thật (hôm nay là vỏ Pake trỏ `app.tongflow.com`) | 🔴 chưa bắt đầu — liên đới hạng mục 0.1 "desktop chưa tách" |
| S6 | `docling` / `crawl4ai` / `scrapling` + 26 plugin GPU còn lại sang đường API | 🔴 chưa bắt đầu — tuần tự theo nhu cầu ([ADR-0007](adr/0007-sequential-plugin-forking.md)) |

⚠️ **ADR-0011 đảo một rủi ro critical của hội đồng mà chưa có bằng chứng thị trường mới.** Nó tự
ghi điều kiện đảo chiều: *≥1/3 người dùng đại diện không tự nhập được key ở onboarding → managed
quay lại làm mặc định*. Điều kiện đó **chưa đo được ngày nào** vì cần S4 trước — nên tới khi S4
ký, ADR-0011 nằm ở trạng thái đảo-chiều-không-bằng-chứng, và Phase 2 phải đọc kèm cảnh báo này.

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

1. ✅ **Cache + partial re-render** hạ cánh trong `sdk/tongflow/engine/` ([ADR-0001](adr/0001-cache-before-cloud.md)) + test conformance TS↔Python đầu tiên (lấy `batchField` drift làm test case số 1). *Đóng trọn L0→L4, 01/08.*
2. ✅ **Slot `compose-overlay`** (media + ops[] typed: text/khung giá/logo/safe-zone) → `pnpm gen:abi` → plugin CPU (font phủ đủ dấu tiếng Việt) → node UI. *Ký 03/08, merge 05/08 (PR #43).*
3. 🔜 **Slot/node `normalize-text-vi`** tất định (số, giá, ngày → chữ), bắt buộc đứng trước TTS trong mọi template. *Hạng mục kế tiếp — không phụ thuộc G0; đường guard đã an toàn sau gói CI-a.*
4. **Plugin TTS ElevenLabs** (tiếng Việt) theo pattern API-plugin.
5. **Skill system v1** ([ADR-0002](adr/0002-skill-template-orchestrator.md)): template + manifest tham số + orchestrator TS (`src/lib/skills/`); Director sinh instance; canvas ẩn sau "xem/sửa kế hoạch".
6. **Skill #1 "Footage → kho clip"**: split-video → transcribe-timestamp → drop-video → tách/thay hoặc denoise audio → overlay phụ đề + khung giá → xuất 9:16. (Livestream hay tour nhà là tham số.)
7. **KG v0 + provenance wire shape** ([ADR-0004](adr/0004-universe-kg-three-entities.md)): bảng entities 3 loại + anchor; `FieldBinding kind:"entity"` phát hành đồng bộ TS + `bindings.py`; `tasks.entity_refs`.

> **Làn local-first xen kẽ ở đây, không nối đuôi.** S3 (transcribe không-Modal) và S4 (UX BYO
> key) đều có lý do chen lên trước mục 4: S3 vì nó nằm trên đường đo WER của G0, S4 vì không có
> nó thì điều kiện đảo chiều của [ADR-0011](adr/0011-local-first-execution.md) không đo được.
> Thứ tự cuối cùng giữa 1.4 / S3 / S4 **chưa quyết** — ghi ở đây để không phải suy lại từ đầu.

**Gate G1:** 50 clip liên tiếp không lỗi dấu / không sai số giá trên overlay · demo "đổi giá →
chỉ re-run overlay+merge" chứng minh bằng telemetry · skill #1 chạy headless qua engine cho kết
quả giống canvas (conformance pass).

## Phase 2 — Năng lực cloud & vòng dữ liệu (T11–T16)

1. **Managed shared mode — nay là *tier*, không phải mặc định** ([ADR-0011](adr/0011-local-first-execution.md) thay thế nửa managed-mặc-định của [ADR-0005](adr/0005-managed-cloud-default.md)): flag gỡ cache-dir per-scope trong plugin-executor; Modal workspace gộp + secret server-side. **Cơ chế giữ nguyên, vai trò đổi** — đây là đường dành cho người không tự nhập key, không còn là đường đi mặc định của sản phẩm. Ưu tiên của nó phụ thuộc số đo của điều kiện đảo chiều ADR-0011 (cần S4 trước); ADR-0005 chưa được hiện thực dòng nào nên việc đảo chiều không tốn gì.
2. **Metadata sang Postgres** + schema org/membership/workspace ngay từ đầu.
3. **Độ bền thực thi:** retry/timeout/resume cho run; sống sót server restart; hàng đợi thay subprocess-per-run.
4. **Metering → gating:** quota theo workspace; đếm "lượt sinh mới" tách khỏi "lượt sửa" (cơ chế là sản phẩm; bảng giá ngoài phạm vi).
5. **Telemetry opt-in:** 2 chỉ số lõi — % render là partial; chi phí/asset hoàn thành.
6. **Metrics loop v1:** import CSV TikTok/Meta Ads → join provenance (`entity_refs`) → bảng xếp hạng biến thể.

**Gate G2:** run 100 node sống sót restart · ≥25% render trong dogfood là partial · COGS đo qua
metering khớp dự toán G0 ±20% · CSV map đúng ≥95% biến thể.

## Phase 3 — Ma trận, judge & R&D chặng 2 (T17–T24)

1. **Skill #2 "Nguồn → ma trận"**: crawl → entity → khoá chủ thể (matting/fusion) → fan-out biến thể × format × khung giá trong orchestrator (fan-out sống ở orchestrator, không nhét vào engine).
2. **Slot `media-judge`** structured-output ([ADR-0003](adr/0003-media-judge-ranker-first.md)) + bộ 200 mẫu gắn nhãn đo FPR; judge vào skill ma trận ở vai **ranker**.
3. **Batch semantics thống nhất:** đưa `x-expand-each`/batch về orchestrator, xoá drift hai runtime còn lại.
4. **OF-CB-1** (benchmark consistency 5 arm, ~$1.000): chạy nền T17–T21 → verdict go/no-go cho thiết kế Character/Location (chặng 2).
5. **Kiểm tra thiết kế "sẵn sàng pháp lý"** ([ADR-0006](adr/0006-defer-vn-compliance.md)): xác nhận overlay render được nhãn AI bằng một tham số và provenance đủ truy vết — 2 bài kiểm tra thiết kế, không phải tính năng.

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

Nguồn: `_acceptance/*/contract.md` với `status: signed-off`. **20 hạng mục** trên `main`
@ `244cb0b` (19/08) — lưu ý [STATUS.md](../STATUS.md) còn ghi con số cũ **17** (chốt 17/08,
trước ba hồ sơ ký 18/08).

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
| `dependency-refresh-2026-07` | T2 | 26/07 | *ngoài lộ trình* — bảo trì phụ thuộc |
| `ci-actions-bump` | T2 | 26/07 | *ngoài lộ trình* — hạ tầng CI |
| `stale-scope-by-paths` | T2 | 28/07 | *ngoài lộ trình* — hạ tầng cổng nghiệm thu |
| `gate-scope-anchors` | T2 | 04/08 | *ngoài lộ trình* — hạ tầng cổng nghiệm thu (0.6 theo cách đánh số của STATUS) |
| `ci-vitest-sdk-pin` | T2 | 05/08 | *ngoài lộ trình* — hạ tầng CI (gói CI-a) |
| `pnpm-build-approvals` | T2 | 18/08 | *ngoài lộ trình* — hạ tầng chuỗi công cụ verify |
| `scan-with-block-imports` | T3 | 18/08 | *ngoài lộ trình* — chẩn đoán scanner plugin |
| `scan-scope-diagnostics` | T3 | 18/08 | *ngoài lộ trình* — chẩn đoán scanner plugin |

<!-- roadmap-ledger:end -->

**Đọc được gì từ tỉ lệ này:** 12/20 hạng mục đã ký là năng lực sản phẩm, 8/20 là hạ tầng quy
trình và CI. Con số thứ hai không phải lãng phí — nó là giá của luật "mỗi phase một gate bằng
số" — nhưng nó *là* một khoản chi có thật, và lộ trình 24 tuần không tính nó vào bất kỳ ô nào.
