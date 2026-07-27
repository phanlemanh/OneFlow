# Lộ trình sản phẩm — 24 tuần (08/2026 → 01/2027)

> **Phạm vi: chỉ phát triển sản phẩm.** GTM, growth, vận hành nằm ngoài tài liệu này
> (quyết định 07/2026). Mọi gate là **gate sản phẩm** — đo bằng chất lượng, hiệu năng,
> chi phí kỹ thuật; không đo bằng chỉ số thị trường.
>
> Phân vai: file này = *sẽ đi đâu*; [STATUS.md](../STATUS.md) = *đang ở đâu*. Cập nhật file
> này **mỗi lần qua gate**, không cập nhật theo tuần. Số liệu gate đọc từ hạ tầng đo lường
> (`_acceptance/measure-harness/`). Quyết định nền tảng: [docs/adr/](adr/).
>
> Quyết định ngách (seller e-commerce ↔ môi giới BĐS) chốt ở Gate G0 — chỉ đổi bộ thực thể
> KG và nguồn input skill P0, không đổi kiến trúc hay lộ trình.

## Nguyên tắc điều hành

1. **Tuần tự tàn nhẫn** — nguồn lực 1 người: thứ tự trong mỗi phase là thứ tự thực thi.
2. **Không xây gì trước khi đo** — mỗi phase mở đầu bằng số liệu thật.
3. **Mỗi phase một gate bằng số** — trượt gate là dừng sửa, không lao tiếp.
4. **Không được cắt trong mọi kịch bản:** cache engine (1.1) và overlay (1.2).

## Phase 0 — Nền độc lập & số liệu gốc (T1–T4)

| # | Hạng mục | DoD | Trạng thái |
|---|---|---|---|
| 0.1 | Độc lập upstream: SDK distribution riêng; plugin fork tuần tự theo nhu cầu ([ADR-0007](adr/0007-sequential-plugin-forking.md), [ADR-0008](adr/0008-naming-and-distribution.md)); dừng build desktop tới khi tách khỏi `app.tongflow.com` | CI xanh trên SDK mới; scanner nhận diện đủ plugin | ◐ `oneflow-sdk` 0.2.17 đã publish; `per-plugin-origin` ký & merge 27/07 (PR #20); **desktop chưa tách** — chờ quyết định URL cloud |
| 0.2 | Metering + móng provenance: `cost_usd`, `duration_ms`, `gpu_type` vào bảng tasks | Mỗi task ghi đủ 3 cột | ✅ `task-metering` đã ký 25/07 |
| 0.3 | Bộ đo chuẩn tái chạy được: WER Whisper-vi thực địa; ~~MOS TTS-vi mù~~ ([ADR-0009](adr/0009-tts-vi-eleven-v3.md) đóng bằng phán quyết); COGS pipeline P0 + ma trận 20 video | Script + báo cáo số trong repo | ◐ script đã ký (`measure-harness`, 26/07) · MOS **đóng** 27/07 · WER chờ **clip thực địa + ref chép tay** · COGS chờ task chạy thật + hoá đơn |
| 0.4 | Spec cache content-addressed + partial re-render | Spec duyệt: khoá hash, dirty-propagation, API "chạy từ node X" | ◐ spec xong (PR #11): [engine-cache-partial-rerender](spec/prd/engine-cache-partial-rerender.md) — 3 câu hỏi mở (§7) chưa chốt |

**Gate G0:** WER ≤ ngưỡng phụ đề bán tự động · ~~MOS TTS-vi~~ **đóng 27/07** bằng
[ADR-0009](adr/0009-tts-vi-eleven-v3.md) (`eleven_v3`, phán quyết vận hành — không có số trong
repo, đánh đổi ghi trong ADR) · COGS/render trong khung mô hình 3 tier · spec cache duyệt ·
**chốt ngách** (bộ thực thể KG v0).
*Trượt WER → wedge chuyển sang phụ đề có bước sửa tay (đổi thiết kế skill, không đổi lộ trình).*

**Còn lại để qua G0 (27/07):** ba điều kiện, và cả ba cần đầu vào từ người vận hành —
clip thực địa + bản chép tay (WER) · task chạy thật + hoá đơn (COGS) · quyết định ngách.
Hạ tầng đã sẵn: tài khoản Modal đã tạo (điền `MODAL_TOKEN_ID`/`MODAL_TOKEN_SECRET` vào `.env`),
corpus WER chờ ở [`measure/wer-corpus/`](../measure/wer-corpus/).

## Phase 1 — Năng lực P0 (T5–T10)

1. **Cache + partial re-render** hạ cánh trong `sdk/tongflow/engine/` ([ADR-0001](adr/0001-cache-before-cloud.md)) + test conformance TS↔Python đầu tiên (lấy `batchField` drift làm test case số 1).
2. **Slot `compose-overlay`** (media + ops[] typed: text/khung giá/logo/safe-zone) → `pnpm gen:abi` → plugin CPU (font phủ đủ dấu tiếng Việt) → node UI.
3. **Slot/node `normalize-text-vi`** tất định (số, giá, ngày → chữ), bắt buộc đứng trước TTS trong mọi template.
4. **Plugin TTS ElevenLabs** (tiếng Việt) theo pattern API-plugin.
5. **Skill system v1** ([ADR-0002](adr/0002-skill-template-orchestrator.md)): template + manifest tham số + orchestrator TS (`src/lib/skills/`); Director sinh instance; canvas ẩn sau "xem/sửa kế hoạch".
6. **Skill #1 "Footage → kho clip"**: split-video → transcribe-timestamp → drop-video → tách/thay hoặc denoise audio → overlay phụ đề + khung giá → xuất 9:16. (Livestream hay tour nhà là tham số.)
7. **KG v0 + provenance wire shape** ([ADR-0004](adr/0004-universe-kg-three-entities.md)): bảng entities 3 loại + anchor; `FieldBinding kind:"entity"` phát hành đồng bộ TS + `bindings.py`; `tasks.entity_refs`.

**Gate G1:** 50 clip liên tiếp không lỗi dấu / không sai số giá trên overlay · demo "đổi giá →
chỉ re-run overlay+merge" chứng minh bằng telemetry · skill #1 chạy headless qua engine cho kết
quả giống canvas (conformance pass).

## Phase 2 — Năng lực cloud & vòng dữ liệu (T11–T16)

1. **Shared deployment mode** ([ADR-0005](adr/0005-managed-cloud-default.md)): flag gỡ cache-dir per-scope trong plugin-executor; Modal workspace gộp + secret server-side.
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
