---
schema_version: 1
feature: CI chạy cổng nghiệm thu với --recheck-all
slug: ci-recheck-all
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: draft
approved_by:
approved_at:
---

# Acceptance Contract: ci-recheck-all

## Context

Bước "Pre-merge acceptance check" trong [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
gọi `bash scripts/pre-merge-check.sh . --base "origin/${GITHUB_BASE_REF:-main}"` **không có
`--recheck-all`**, nên phép đo bằng chứng đã commit chỉ ghé các slug nằm trong diff của PR.
Chính log cổng tự khai điều đó — lần chạy xanh của PR #84 in:

> `NOTE: recheck scope — 24 slug ngoài diff PR không được re-check (sử liệu; dùng --recheck-all để quét toàn bộ)`

Hệ quả đo được: bộ cổng vendored lên kit 2.4.0 ngày 27/08 (PR #73) và tới 28/08 **chưa lần
chạy CI nào đo lại 23 hồ sơ đã ký dưới lưới mới**. Khoảng trống đó hiện chưa che giấu gì —
chạy tay `--recheck-all` trên `main` sạch (`89009fd`) cho `clean`, exit 0, 0 vi phạm — nhưng
bảo đảm ấy đang do một lần gõ tay tạo ra, không do máy.

Gói việc này chỉ làm một việc: **thêm cờ vào đúng một dòng `run:`**. Nó cần hồ sơ vì
`.github/workflows/**` không nằm trong `t1_skip_globs`, nên `t1-escape` đòi hồ sơ — và đó là
luật đúng, không phải phiền hà: workflow là file mang hành vi, repo này có riêng
`scripts/ci/check-workflow-drift.sh` để canh "hành vi lén vào cùng một lần bump".

Source input: prompt (phiên 2026-08-28) · tách ra từ PR #84 · tiền đề: PR #73 (kit 2.4.0)

## Criteria

- AC-1: Given `.github/workflows/ci.yml`, When đọc bước "Pre-merge acceptance check", Then lệnh của nó chứa `--recheck-all` **và** giữ nguyên `--base "origin/${GITHUB_BASE_REF:-main}"` không đổi một ký tự.
- AC-2: Given một PR bất kỳ chạy qua CI sau khi đổi, When đọc log job "Acceptance Gate", Then log chứa dòng NOTE dạng *recheck-all … runs on ALL slugs* và **không** chứa dòng `NOTE: recheck scope — <N> slug ngoài diff PR không được re-check`.
- AC-3: Given cây `main` sạch, When chạy `pre-merge-check.sh . --base origin/main --recheck-all`, Then verdict `clean`, exit 0, 0 vi phạm — cờ mới không làm đỏ CI của các PR không liên quan.
- AC-4: Given một cây có hồ sơ **ngoài diff PR** ở trạng thái lưới hiện hành từ chối (ví dụ `status: implemented` mà thiếu `evidence-report.md`), When chạy cổng **không** cờ Then in `clean`, exit 0; và When chạy cổng **có** cờ Then in `VIOLATION` nêu đúng tên slug đó và exit 1.
- AC-5: Given `_acceptance/config.yaml` sau khi đổi, When đọc `risk_tiers.t1_skip_globs`, Then **không** có mục nào khớp `.github/**` — danh sách miễn trừ không bị nới ra để lấy màu xanh.
- AC-6: Given bước `actions/checkout` của job "Acceptance Gate", When đổi xong, Then nó vẫn khai `fetch-depth: 0` — thiếu lịch sử đầy đủ thì phép kiểm staleness của từng pin âm thầm tụt xuống NOTE, tức cờ mới quét rộng hơn nhưng đo nông hơn.
- AC-7: Given diff của gói việc này dưới `.github/workflows/`, When phân loại từng dòng đổi, Then **dòng `run:` của bước gate là dòng không-phải-chú-thích DUY NHẤT thay đổi** — không trigger, không permission, không job, không `uses:` pin nào đổi theo.
- AC-8: Given trên `main` tồn tại một hồ sơ nửa-vời (đã armed nhưng thiếu bằng chứng), When CI chạy cho một PR **không hề chạm** hồ sơ đó, Then job "Acceptance Gate" của PR ấy ĐỎ. Đây là đánh đổi đã khai, không phải hồi quy: bán kính nổ rộng ra là cái giá của việc hết xanh-giả.

## Coverage

Quét theo trục (morphological, thủ công — bài toán nhỏ, không gọi skill):

- Trục **chỗ đặt cờ**: bước gate trong `ci.yml` *(chọn)* | job riêng chỉ chạy trên `main` | wrapper script trong `scripts/` — AC-1, AC-7
- Trục **phạm vi quét**: chỉ diff PR *(hiện trạng)* | toàn bộ slug *(đích)* — AC-2, AC-4
- Trục **cách làm xanh `t1-escape`**: làm hồ sơ *(chọn)* | nới `t1_skip_globs` cho `.github/**` *(bác)* | không đụng `ci.yml` *(bác)* — AC-5
- Trục **chiều hỏng**: xanh giả (không quét ai) *(cái đang sửa)* | đỏ oan / bán kính nổ rộng *(cái sinh ra)* — AC-3, AC-8
- Trục **điều kiện lịch sử git**: `fetch-depth: 0` | clone nông — AC-6
- Trục **thời điểm quan sát**: file tĩnh (grep workflow) | log CI thật | chạy lại cổng trên fixture — AC-1 / AC-2 / AC-4

Ô trống đã soi và cố ý bỏ: *chạy `--recheck-all` ở job riêng theo lịch (cron)* — bác vì nó tách phép đo khỏi khoảnh khắc merge, đúng thứ khoảng trống hiện tại đang gây ra.

## Out of scope

- **Không** nới `t1_skip_globs` cho `.github/**` để đi vòng `t1-escape`. Đó đúng là lớp file repo này đang cố ý canh; nới nó là gỡ răng thay vì làm việc.
- **Không** đổi bất kỳ tham số nào khác của bước gate hay job: `--base`, `fetch-depth`, `node-version`, tên job, trigger.
- **Không** sửa `scripts/pre-merge-check.sh` — vế đó đã xong ở PR #84 (`f6c0335`), gói việc này chỉ chạm workflow (+ hồ sơ + config keys).
- **Không** tách `--recheck-all` sang job riêng hay lịch chạy nền — đã cân ở Coverage, bác.
- **Không** dọn hồ sơ nửa-vời đang tồn tại. Nếu AC-3 phát hiện `main` không sạch dưới cờ mới, đó là gói việc riêng, không nhét vào đây.
- **Không** đụng `recheck: strict` / `enforcement: strict` trong `config.yaml`.

## Notes

- **Việc phát sinh lúc thi công, không phải lúc ký:** ba khoá `executors.script.*` mới trong `_acceptance/config.yaml` và các script guard dưới `scripts/ci/`. Cả hai đường đều lành: `_acceptance/**` nằm trong `t1_skip_globs`; còn nỗi lo cũ "chạm `scripts/**` là kích treadmill re-pin" đã **hết hiệu lực đo được** từ `97b5b12` — `STALE-DIFF-SCOPE-GUARD` bỏ qua staleness cho mọi feature có `_acceptance/<slug>/` ngoài diff (ghi ở STATUS.md mục 0.8).
- **AC-7 KHÔNG dùng được `scripts/ci/check-workflow-drift.sh`.** Guard đó chỉ cho qua `uses:` pin đã khai đích danh và dòng dry-run guard của `docker-publish.yml`; dòng `run:` của gói việc này sẽ là offender. Cần guard riêng neo theo `ACCEPTANCE_SLUG=ci-recheck-all`.
- **Đánh đổi lớn nhất nằm ở AC-8** và nó là thứ duy nhất trong hồ sơ này cần người cân, không cần máy đo: sau thay đổi, sức khoẻ của `main` trở thành điều kiện để **mọi** PR xanh. Máy chỉ chứng minh được hành vi đó xảy ra đúng như mô tả; *có đáng hay không* là chữ ký.
- Bối cảnh phiên bản: bộ cổng vendored đang ở kit **2.4.0** (`941a71a`/`a3755bd`, PR #73) + fork `stale-scope` ~485 dòng; tầng plugin cũng 2.4.0. Xem `docs/` và mô tả PR #84.
