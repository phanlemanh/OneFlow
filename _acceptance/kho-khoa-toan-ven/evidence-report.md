---
schema_version: 2
feature_slug: kho-khoa-toan-ven
verdict: PASS
failed_evals: []
reason:
verified_by: machine-lane (owner chốt bỏ lớp hội đồng, 31/08)
enforcement_mode: strict
bypass_used: false
verified_commit: 72870b0fe0bd4c8a8e4574f5b865f4404cc40450
human_signoff:
---

# Evidence Report: kho-khoa-toan-ven

**13/13 ô đo PASS · 0 UNCERTAIN · 0 bypass.** Làn máy thuần, run_id `kkt-machine-20260831T151802Z`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-12 | test | PASS |

## Cặp hai chiều của phép đo khó nhất — số thật

Tính nguyên tử là khẳng định duy nhất phân biệt được hai cách ghi. Đo bằng một
người đọc ở **tiến trình hệ điều hành riêng**, lấy mẫu kích thước file liên tục
trong lúc ghi một khối 6 MB:

| bản ghi | mẫu cũ | mẫu mới | tổng | **mẫu cụt** |
|---|---:|---:|---:|---:|
| `writeFileSync` (cũ) — lượt đầu, đọc nội dung | 14 087 | 5 687 | 19 775 | **1** |
| tạm + đổi tên (mới) — đọc nội dung | 15 456 | 5 706 | 21 162 | **0** |
| tạm + đổi tên (mới) — **đo kích thước** | 120 418 | 3 265 694 | 3 386 112 | **0** |

Cả ba lượt đều **bắc qua được** lượt ghi (có cả mẫu cũ lẫn mẫu mới), nên cả ba
đều kết luận được. Khác biệt duy nhất giữa hai bản ghi là đúng cái mẫu cụt: một
người đọc bắt gặp file **độ dài 0** giữa lúc cắt — chính là kho hỏng mà
`chong-mat-khoa-byo` dạy bộ đọc từ chối.

Dòng thứ ba giải thích vì sao phép đo phải đổi giữa chừng: xem *Known limits* mục 2.

## Evidence

- eval: E1
  run_id: kkt-machine-20260831T151802Z-E1
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/run-one-test.sh 'coerces scalars'
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  1 passed | 28 skipped (29)
       Start at  22:18:07
       Duration  112ms (transform 36ms, setup 0ms, import 33ms, tests 16ms, environment 0ms)

- eval: E2
  run_id: kkt-machine-20260831T151802Z-E2
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/run-one-test.sh 'refuses structured'
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  1 passed | 28 skipped (29)
       Start at  22:18:12
       Duration  107ms (transform 33ms, setup 0ms, import 32ms, tests 16ms, environment 0ms)

- eval: E3
  run_id: kkt-machine-20260831T151802Z-E3
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/run-one-test.sh 'refuses empty key'
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  1 passed | 28 skipped (29)
       Start at  22:18:17
       Duration  108ms (transform 34ms, setup 0ms, import 32ms, tests 15ms, environment 0ms)

- eval: E4
  run_id: kkt-machine-20260831T151802Z-E4
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/run-one-test.sh 'all strings untouched'
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  1 passed | 28 skipped (29)
       Start at  22:18:22
       Duration  109ms (transform 35ms, setup 0ms, import 33ms, tests 15ms, environment 0ms)

- eval: E5
  run_id: kkt-machine-20260831T151802Z-E5
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/run-one-test.sh 'save refuses'
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  2 passed | 27 skipped (29)
       Start at  22:18:27
       Duration  111ms (transform 36ms, setup 0ms, import 34ms, tests 18ms, environment 0ms)

- eval: E6
  run_id: kkt-machine-20260831T151802Z-E6
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/run-one-test.sh 'concurrent reader'
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  1 passed | 28 skipped (29)
       Start at  22:18:32
       Duration  4.24s (transform 32ms, setup 0ms, import 32ms, tests 4.15s, environment 0ms)

- eval: E7
  run_id: kkt-machine-20260831T151802Z-E7
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/run-one-test.sh 'no temp file'
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  1 passed | 28 skipped (29)
       Start at  22:18:41
       Duration  114ms (transform 36ms, setup 0ms, import 36ms, tests 13ms, environment 0ms)

- eval: E8
  run_id: kkt-machine-20260831T151802Z-E8
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/check-env-store-teeth.sh --case seam-signature
  verified_at: 2026-08-31T15:18:02Z
  output: |
    → răng: seam-signature
    CASE seam-signature: PASS
    cây chung sạch: src/lib/settings/env-store.server.ts và src/ext-default/settings-store.ts không đổi
    ✅ răng: 1/1 case — mỗi case một mã thoát riêng

- eval: E9
  run_id: kkt-machine-20260831T151802Z-E9
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/run-one-test.sh 'run path'
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  3 passed | 26 skipped (29)
       Start at  22:18:47
       Duration  112ms (transform 34ms, setup 0ms, import 32ms, tests 18ms, environment 0ms)

- eval: E10
  run_id: kkt-machine-20260831T151802Z-E10
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/run-one-test.sh 'round trip'
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  3 passed | 26 skipped (29)
       Start at  22:18:52
       Duration  112ms (transform 35ms, setup 0ms, import 33ms, tests 18ms, environment 0ms)

- eval: E11
  run_id: kkt-machine-20260831T151802Z-E11
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/check-env-store-teeth.sh
  verified_at: 2026-08-31T15:18:02Z
  output: |
    CASE save-throws: PASS
    CASE seam-signature: PASS
    CASE atomic: PASS
    cây chung sạch: src/lib/settings/env-store.server.ts và src/ext-default/settings-store.ts không đổi
    ✅ răng: 7/7 case — mỗi case một mã thoát riêng

- eval: E12
  run_id: kkt-machine-20260831T151802Z-E12
  exit_code: 0
  baseline: n-a
  verifier: pnpm vitest run src/lib/settings/env-store.server.test.ts src/app/api/settings/env/route.unreadable.test.ts src/app/api/settings/env/route.test.ts
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  3 passed (3)
          Tests  38 passed (38)
       Start at  22:19:10
       Duration  4.35s (transform 115ms, setup 0ms, import 110ms, tests 4.32s, environment 0ms)

- eval: E13
  run_id: kkt-machine-20260831T151802Z-E13
  exit_code: 0
  baseline: n-a
  verifier: bash scripts/settings/run-one-test.sh 'empty key through PUT'
  verified_at: 2026-08-31T15:18:02Z
  output: |
     RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  1 passed | 28 skipped (29)
       Start at  22:19:05
       Duration  157ms (transform 45ms, setup 0ms, import 32ms, tests 65ms, environment 0ms)

## Vì sao làn máy thuần

Cả 13 ô đo đều là `test` hoặc `script`: không ô nào cần phán đoán người, ảnh chụp,
hay đọc giao diện. Owner chốt làn này 31/08 cho gói trước và giữ nguyên cho gói này.
Đây là **giới hạn đã khai**, không phải một phép đo bị bỏ — xem mục 1.

## Ngoài hợp đồng

Chi tiết ở `review-findings.md`.

## Known limits

1. **Không có lớp hội đồng.** Owner chốt làn máy thuần. Đổi lại: không có phản biện
   độc lập trên chính bằng chứng này; mọi khẳng định đứng trên mã thoát của 13 lệnh
   cộng bảy ca răng và các chiều đỏ ghi ở trên.

2. **Phép đo tính nguyên tử phải đổi giữa chừng vì CHẬP CHỜN, và điều đó lộ ra ở
   vòng verify chứ không ở khâu thiết kế.** Bản đầu cho người đọc đọc **nội dung**
   6 MB mỗi mẫu; mỗi lượt đọc mất khoảng một mili-giây nên nó lấy mẫu quá chậm để
   thấy cửa sổ cắt — bắt được **1 mẫu cụt trên 19 775**, và ca răng `atomic` **đã
   đỏ một lượt** vì lượt đó không bắt được mẫu nào. Đổi sang đo **kích thước file**
   cho 3 386 112 mẫu, nhanh gấp ~160 lần, và ca răng ổn định qua ba lượt liên tiếp.
   Giới hạn còn lại: đây vẫn là phép đo **theo thời gian thật**. Trên máy hoặc đĩa
   khác nó có thể không bắc qua được — khi đó nó báo **KHÔNG KẾT LUẬN ĐƯỢC** và
   thoát khác 0, chứ không báo đạt. Hướng an toàn, nhưng nghĩa là ở môi trường đó
   AC-6 **không được đo**.

3. **Ô đo có thể chạy 0 ca mà vẫn xanh — bắt được trong chính lượt verify này.**
   `pnpm vitest run <file> -t '<tên>'` không khớp ca nào thì **thoát 0**. Lượt chạy
   đầu tiên cho `E9 exit=0 Tests 26 skipped (26)` và `E10` y hệt: hai tiêu chí
   AC-9 và AC-10 **không hề có ca thử**, mà ô đo vẫn báo PASS. Đã bịt bằng
   `scripts/settings/run-one-test.sh` (0 ca khớp → thoát 2 kèm lý do) và đã viết ba
   ca thật. **Giới hạn còn lại:** bộ bọc chỉ phủ mười ô `unit_kkt_*`; các ô đo khác
   trong repo dùng `pnpm vitest -t` trực tiếp vẫn có cùng lỗ. Đó là việc của một hồ
   sơ khác, không nhét vào đây.

4. **Bộ răng đo cây ĐÃ COMMIT.** Nó dựng `git worktree` từ HEAD — đó chính là thứ
   làm cây chung chắc chắn không bị đụng, nhưng nghĩa là một hồi quy mới sửa mà
   chưa commit thì vô hình với nó. Bộ thử vitest chạy trên cây làm việc trả lời câu
   hỏi đó; bộ răng trả lời câu khác: mỗi luật, **như đã commit**, có thật sự đỏ khi
   bị gỡ không.

5. **Cửa lọc thứ ba ở `route.ts` dòng 105 vẫn lọc lặng.** Cố ý để ngoài — chạm
   `src/app/api/**` là hoá T3. AC-12 đo **hệ quả** của nó từ một file thử ở lớp kho,
   nên hành vi được ghim lại chứ không bị bỏ quên.

6. **AC-12 thất bại dưới dạng ngoại lệ, không phải phản hồi 4xx sạch.** Route không
   bắt lỗi, nên cú từ chối thoát thẳng ra khỏi handler. Đúng hợp đồng (kêu to, nêu
   tên khoá, không ghi gì) nhưng người dùng sẽ thấy lỗi 500 từ khung thay vì một
   thông báo gọn. Biến nó thành 400 phải sửa `route.ts` — mục ngoài phạm vi có tên.

7. **Đây là đổi hành vi thật, người dùng sẽ thấy.** Lưu một tên khoá rỗng nay làm
   **hỏng cả lượt lưu** thay vì lặng lẽ bỏ nó. Đổi im lặng lấy kêu to, có chủ ý:
   nếu cho qua, ta tạo ra một kho mà chính bộ đọc của ta từ chối ở lần đọc kế.
