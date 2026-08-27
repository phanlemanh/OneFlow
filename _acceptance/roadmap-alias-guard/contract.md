---
schema_version: 1
feature: Guard chống viện dẫn lệnh không có thật — pnpm roadmap:* phải khai đúng VÀ chạy được
slug: roadmap-alias-guard
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [scripts, docs]
status: draft
approved_by:
approved_at:
---

# Acceptance Contract: roadmap-alias-guard

## Context

Tách ra từ hồ sơ [`roadmap-drift-guard`](../roadmap-drift-guard/contract.md) ngày 2026-08-27
(vòng 4). Ở đó nó là AC-10 / E10, và nó là nguồn của **bốn trong bốn lỗ** ba vòng nghiệm thu
gần nhất tìm ra, trong khi phần lõi `roadmap-drift.mjs` qua ba vòng và chín đột biến không
lỗi nào. Lý do cơ học: lõi làm một việc đơn giản trên dữ liệu ngoài, còn guard này phải
**suy luận về chính nó** — nó là một alias trong danh sách alias nó đang kiểm.

Vấn đề nó giải quyết là có thật, đo được: commit `ce91889` mang tiêu đề
*"drift guard — pnpm roadmap:check / roadmap:teeth"*, header của hai script nói
*"Run from the repo root: `pnpm roadmap:check`"*, và trang
`docs/assets/oneflow-roadmap-status.html` bảo người đọc *"đối chiếu máy bằng
`pnpm roadmap:check`"* — suốt **tám ngày** trong khi `package.json` không khai alias nào.
Bốn chỗ mô tả trạng thái *dự định*, không phải trạng thái *thật*, và không guard nào trong
kho thấy được: commit message với comment là văn xuôi đối với mọi kiểm khác.

Source input: cắt từ `roadmap-drift-guard` vòng 4 · mã mang sang nguyên trạng tại `fded31d`.

> **CẢNH BÁO — mã mang sang CHƯA an toàn để nối dây.** Nó còn nguyên lỗ đệ quy AC-6 mô tả
> bên dưới (đo được 78 tiến trình đồng thời trong 60 giây). Nhánh này giữ việc, không phải
> giao việc. Đừng khai alias trỏ tới nó trước khi hồ sơ này qua Cổng 2.

## Criteria

- AC-1: Given một chuỗi `pnpm roadmap:<tên>` xuất hiện trong `scripts/roadmap/` hoặc `docs/`,
  When chạy guard, Then guard ĐỎ nếu `package.json` không khai script `<tên>`, và nêu tên cả
  lệnh lẫn (các) file viện dẫn nó.
- AC-2: Given một alias được khai nhưng trỏ tới đường `scripts/…` không tồn tại, When chạy
  guard, Then ĐỎ và nêu đường dẫn đó.
- AC-3: Given mọi alias được viện dẫn đều khai đúng, When chạy guard, Then mỗi alias (trừ
  chính alias của guard) được **thực thi qua `pnpm`** và phải thoát 0 — "phân giải" chưa đủ.
- AC-4: Given quét ra **0** chuỗi viện dẫn, When chạy guard, Then ĐỎ kèm lý do "đường quét
  hỏng". Số 0 không thể là sự thật khi header của chính guard viện dẫn một lệnh; in ✅ ở đây
  là chuyển sang trạng thái không-đo-gì mà vẫn xanh.
- AC-5: Given guard bị đổi tên file, When alias trỏ tới tên mới, Then guard vẫn nhận ra chính
  nó — nhận diện bằng **đường dẫn đã phân giải**, không bằng khớp chuỗi tên file.
- AC-6: Given **hai hay nhiều** alias cùng phân giải về file guard, When chạy guard, Then
  **mọi** alias đó đều bị bỏ qua và guard kết thúc bình thường. Bản mang sang chỉ lưu một
  `self_alias` và vòng lặp ghi đè, nên alias không-phải-cuối **bị gọi** — đo được 78 tiến
  trình đồng thời trong 60 giây trước khi phải giết cả nhóm.
- AC-7: Given không alias nào phân giải về file guard, When chạy guard, Then ĐỎ và dừng —
  chạy tiếp là đệ quy không giới hạn.
- AC-8: Given một kho mà mọi chỗ viện dẫn đều đúng, When chạy guard, Then thoát 0 — không
  báo động giả. Thiếu tiêu chí này thì một guard `exit 1` vô điều kiện thoả mọi tiêu chí trên.
- AC-9: Given `package.json` không có khoá `scripts`, When chạy guard, Then ĐỎ có lý do, chứ
  không đổ vỡ khó hiểu hay lặng lẽ thoát 0.

## Coverage

- Trục **kiểu dối**: khai thiếu (AC-1) | trỏ sai file (AC-2) | khai đúng mà chạy hỏng (AC-3)
- Trục **đường rìa**: quét rỗng (AC-4) | đổi tên (AC-5) | trùng alias (AC-6) | không nhận ra
  mình (AC-7) | package.json dị dạng (AC-9)
  [thước CE: cả năm đều do người kiểm context sạch tìm ra ở vòng 2–3, không phải mình đoán]
- Trục **phán quyết**: ĐỎ đúng | XANH đúng (AC-8) | ĐỎ oan
- Trục **hướng hỏng**: fail-closed (mọi AC trên) | fail-open [thước CE: fail-open là thứ
  hồ sơ này tồn tại để diệt — bốn lỗ đã tìm ra đều thuộc loại đó]

## Out of scope

- **Không nối vào CI** trong hồ sơ này — cùng lý do đã ghi ở `roadmap-drift-guard`:
  `check-action-pins.sh` đếm số site pin `actions/checkout` nên thêm job CI làm đỏ một guard
  không liên quan.
- **Không kiểm alias `pnpm` ngoài tiền tố `roadmap:`** — phạm vi hẹp có chủ ý; mở rộng sang
  mọi script trong `package.json` là một quyết định khác, cần căn cứ khác.
- **Không quét ngoài `scripts/roadmap/` và `docs/`** — một chỗ viện dẫn nằm trong `src/` hôm
  nay không ai bắt.
- **Không tự sửa** — chỉ tố cáo và thoát khác 0.

## Notes

- AC-6 là lỗ do chính bản vá vòng 3 của `roadmap-drift-guard` tạo ra: bản vá đóng cửa "đổi
  tên" (AC-5) rồi để ngỏ cửa "trùng alias" ngay bên cạnh. Vá theo triệu chứng thay vì theo
  lớp — ghi lại để lần thi công này vá theo lớp.
- Mọi khoá `config:` trong `evals.yaml` **chưa tồn tại**; chúng hạ cánh trong lúc thi công,
  cùng khuôn `roadmap-drift-guard` và `stale-scope-by-paths` đã dùng.
