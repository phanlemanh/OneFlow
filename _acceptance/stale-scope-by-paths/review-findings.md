## Trong hợp đồng

(none this round — round 3's in-contract AC-4 finding, "nearest `- id:` above" attributing an unrelated `paths:` key to the wrong eval, was fixed via the block-walking awk rewrite; adversarial review this round found no new AC-mapped defect.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Narrow scope built only from t1-exempt globs permanently disables staleness (fail-open)**
  Người dùng thấy gì: Nếu một tính năng chỉ khai báo các đường dẫn thuộc diện miễn trừ, hệ thống sẽ mãi mãi báo "không có gì thay đổi" dù mã thật sự đã sửa — bằng chứng cũ có thể được coi là vẫn hợp lệ trong khi thực ra không còn ai kiểm tra lại nó.
  file: `scripts/pre-merge-check.sh`
  severity: high
  Đề xuất: new-contract

- **Vietnamese comments, CI messages, and a Vietnamese behavioral keyword violate the repo's English-only rule**
  Người dùng thấy gì: Một số thông báo cảnh báo và một từ khoá điều khiển trong công cụ kiểm tra chỉ chấp nhận tiếng Việt, nên người vận hành không đọc được tiếng Việt có thể bỏ lỡ cảnh báo hoặc không biết cách bỏ qua bước kiểm tra khi cần.
  file: `scripts/pre-merge-check.sh`
  severity: high
  Đề xuất: new-contract

- **biome.json added to t1_skip_globs exempts a file that governs an eval executor's scope**
  Người dùng thấy gì: File cấu hình quy tắc lint được miễn kiểm tra thay đổi, nên nếu sau này ai đó thu hẹp phạm vi lint, các tính năng khác vẫn có thể hiển thị "đã qua kiểm tra" dù phần mã liên quan thực ra không còn được lint soi tới nữa.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Cross-layer pairing awk fails to close a block on hyphenated or digit-bearing keys, leaking the previous eval's layer**
  Người dùng thấy gì: Công cụ ghép nhãn giữa các mục đánh giá có thể gán nhầm nhãn của mục đánh giá trước sang mục sau khi tên mục chứa số hoặc dấu gạch ngang, khiến một tiêu chí bị xét duyệt dựa trên bằng chứng sai loại mà không ai nhận ra.
  file: `scripts/pre-merge-check.sh`
  severity: low
  Đề xuất: known-limits

- **Narrow scope whose globs are all t1-exempt makes the feature permanently non-stale**
  Người dùng thấy gì: Nếu một tính năng chỉ khai báo các đường dẫn thuộc diện miễn trừ, hệ thống sẽ mãi mãi báo "không có gì thay đổi" dù mã thật sự đã sửa — bằng chứng cũ có thể được coi là vẫn hợp lệ trong khi thực ra không còn ai kiểm tra lại nó.
  file: `scripts/pre-merge-check.sh`
  severity: high
  Đề xuất: new-contract

- **Cross-layer pairing awk: block-opening key alphabet [a-z_]+ leaks `layer:` into the next eval**
  Người dùng thấy gì: Công cụ ghép nhãn giữa các mục đánh giá có thể gán nhầm nhãn của mục đánh giá trước sang mục sau khi tên mục chứa số hoặc dấu gạch ngang, khiến một tiêu chí bị xét duyệt dựa trên bằng chứng sai loại mà không ai nhận ra.
  file: `scripts/pre-merge-check.sh`
  severity: medium
  Đề xuất: known-limits

- **Unrelated comment truncated in evidence-core.js — looks like accidental diff noise**
  Người dùng thấy gì: Một dòng ghi chú giải thích hành vi thật của hệ thống bị xoá nhầm trong một file không liên quan đến tính năng này, khiến người đọc sau này khó hiểu vì sao một số trạng thái bị bỏ qua.
  file: `lib/evidence-core.js`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, lib/evidence-core.js) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.