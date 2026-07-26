---
schema_version: 1
feature: Measurement harness — Whisper-vi WER, blind TTS rating, per-node COGS
slug: measure-harness
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: implemented
approved_by: Manh
approved_at: 2026-07-26
time_human_minutes: {gate1: 0, gate2: 0}
---

# Acceptance Contract: measure-harness

## Context

Phase 0 item 0.3. Gate G0 decides whether the P0 wedge is viable, and it decides
it on three numbers: how accurately Whisper transcribes Vietnamese livestream
audio, whether Vietnamese TTS is good enough to ship, and what a node actually
costs to run. Today none of those can be produced repeatably.

This is tooling, not product — but it is the tooling a go/no-go decision rests
on, so a wrong measuring stick is worse than no measuring stick. That is the
whole reason this goes through the gate: the normalisation rules below are
product decisions disguised as implementation details, and they should be
approved before they are baked in.

The pure logic lives in `src/lib/measure/` (vitest only collects
`src/**/*.test.ts`, and CLAUDE.md puts domain-aware code in `src/lib/`); the
commands under `scripts/measure/` stay thin CLI wrappers.

Source input: prompt (product plan Phase 0, item 0.3)

## Criteria

### WER — Whisper-vi accuracy

- AC-1: Given a reference and a hypothesis transcript, When WER is computed, Then it equals `(substitutions + deletions + insertions) / reference_word_count` from a word-level edit distance, and a perfect match scores 0 while an empty hypothesis scores 1.
- AC-2: Given Vietnamese text, When it is normalised for comparison, Then **diacritics are preserved** — `không` and `khong` count as different words. The product promise is correct diacritics, so a scorer blind to them would certify the exact failure we care about.
- AC-3: Given text that looks identical but differs in Unicode composition (`ế` as one codepoint vs `e` + combining marks), When it is normalised, Then both forms compare equal (NFC) — otherwise the score reports errors a human reading the two files cannot see.
- AC-4: Given differing letter case and surrounding punctuation, When text is normalised, Then neither contributes to WER — they are separate quality axes from word accuracy.
- AC-5: Given a hypothesis where the only differences are digit-bearing tokens (`120000` vs `một trăm hai mươi nghìn`), When the report is produced, Then those errors are counted **and** broken out separately, and the tool performs no automatic number conversion — a measuring stick must not silently decide that a price was transcribed correctly.
- AC-6: Given a directory of `<name>.ref.txt` / `<name>.hyp.txt` pairs, When the WER command runs, Then it prints per-clip and aggregate WER and exits 0; and given a `.ref.txt` with no matching `.hyp.txt`, Then it reports that clip as missing and exits non-zero rather than silently averaging over fewer clips.

### Blind TTS rating

- AC-7: Given samples laid out as `<system>/<script-id>.<ext>`, When the blind sheet is generated, Then every entry carries an opaque id, the order is shuffled, and no system name appears anywhere in the sheet — an un-blinded rating is not evidence.
- AC-8: Given the same generation, When it completes, Then the id-to-system key is written to a **separate** file, so the sheet can be handed to a rater without leaking the answer.
- AC-9: Given a completed rating sheet and its key, When ratings are aggregated, Then the output reports per-system mean opinion score, the standard deviation, the sample count, and a 95% confidence interval — a mean without a spread invites deciding on noise.
- AC-10: Given ratings outside the 1–5 MOS range or referencing an unknown id, When aggregation runs, Then it fails loudly rather than dropping them.

### COGS — per-node cost attribution

- AC-11: Given a tasks database, When the COGS command runs, Then it aggregates completed tasks by `plugin_id` × `feature`, reporting count, total duration, median and p95 — the key needed to attribute a Modal invoice to nodes.
- AC-12: Given rows whose `duration_ms` is NULL (pre-metering history, or aborted runs), When they are aggregated, Then they are counted and reported as unmeasured, and excluded from the duration statistics — averaging over them as zero would understate real cost.
- AC-13: Given no rate table, When the report runs, Then it reports duration only and **no cost figure at all**; and given a rate table supplied by the operator, Then it applies exactly those rates. The tool never invents a price — item 0.2 left `cost_usd` NULL for the same reason, and a fabricated rate would poison the invoice reconciliation this exists to serve.
- AC-14: Given a database missing the metering columns (a pre-0.2 file), When the command runs, Then it reports that clearly and exits non-zero instead of crashing with a SQL error.

### Standing

- AC-15: Given the three commands, When each is invoked against the fixtures committed with this change, Then each completes end-to-end and exits 0 — proving the CLI wiring, not just the pure core.
- AC-16: Given the repo checks, When `pnpm test`, `pnpm lint:check`, `pnpm typecheck` and `pnpm build` run, Then all pass.

## Coverage

Morphological scan of the change surface:

- Trục **thước đo**: WER (AC-1…AC-6) | MOS (AC-7…AC-10) | COGS (AC-11…AC-14). [thước CE: đúng 3 con số mà G0 cần, mỗi cái một nhóm AC]
- Trục **chuẩn hoá văn bản**: dấu (AC-2, giữ) | Unicode composition (AC-3, hợp nhất) | hoa-thường & dấu câu (AC-4, bỏ) | chữ số (AC-5, KHÔNG tự quy đổi). [thước CE: 4 phép biến đổi khả dĩ trên chuỗi tiếng Việt; mỗi phép có một AC nói rõ giữ hay bỏ]
- Trục **tính trung thực của thước**: không tự quy đổi số (AC-5) | không tự bịa giá (AC-13) | không âm thầm bỏ dữ liệu thiếu (AC-6, AC-10, AC-12). [thước CE: 3 cách một thước có thể nói dối, mỗi cách một AC]
- Trục **tầng**: lõi thuần trong `src/lib/measure/` (AC-1…AC-5, AC-7…AC-13) | CLI trong `scripts/measure/` (AC-6, AC-14, AC-15).
- Trục **đầu vào hỏng**: thiếu file (AC-6) | id lạ / điểm ngoài thang (AC-10) | DB thiếu cột (AC-14) | duration NULL (AC-12).

## Out of scope

- **Chạy Whisper để sinh bản chép.** Script chấm điểm nhận sẵn cặp ref/hyp; việc chạy phiên âm cần Modal và clip thật, thuộc về lúc vận hành bộ đo chứ không phải lúc xây nó.
- **Gọi API TTS để sinh mẫu.** Cần API key của người dùng; harness chỉ lo phần làm mù và tổng hợp — đó mới là phần dễ làm sai.
- **Bảng giá GPU.** Cố ý: giá đến từ hoá đơn Modal thật, do người vận hành cung cấp qua file.
- **Tự quy đổi số tiếng Việt sang chữ số.** Một bộ quy đổi nửa vời sẽ giấu chính lỗi cần thấy; báo cáo tách riêng nhóm lỗi chữ số thay vì tự quyết.
- **Giao diện hiển thị số liệu.** Đầu ra là bảng trên terminal + JSON.
- **Đo đường workflow chạy qua engine Python.** Engine ghi task theo đường khác; thuộc gói cache/partial re-render (0.4).

## Notes

- WER dùng khoảng cách sửa (Levenshtein) ở mức **từ**, không phải ký tự — đơn vị mà người đọc phụ đề cảm nhận.
- Khoảng tin cậy 95% cho MOS dùng xấp xỉ chuẩn `mean ± 1.96 · sd/√n`; với n nhỏ (5 script) đây là ước lượng thô — báo cáo kèm n để người đọc tự chiết khấu.
- Không có bề mặt web UI → bỏ qua eval design theo SKILL 2b.
- Nhánh này dựa trên `feat/task-metering` vì báo cáo COGS đọc cột `duration_ms` do hạng mục 0.2 tạo ra.
