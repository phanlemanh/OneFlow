## Trong hợp đồng

(không có finding nào được ánh xạ vào AC — bước phân loại phạm vi round này không chạy được, xem mục "Chưa phân loại" bên dưới)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **PRODUCT-MAP.md drift: CI's `check-product-map.mjs` step is red on HEAD**
  Người dùng thấy gì: Bản đồ sản phẩm nội bộ chưa cập nhật, vẫn hiện tính năng này là 'đang cân nhắc' dù đã xong, khiến trang tổng quan sai và có thể chặn việc gộp mã nguồn.
  file: `PRODUCT-MAP.md`
  severity: high
  Đề xuất: new-contract

- **New guards have zero CI references — the exact gap the sibling commit in this diff just closed**
  Người dùng thấy gì: Các cơ chế kiểm tra mới chỉ chạy khi có người tự tay gọi, chưa được gắn vào quy trình kiểm tra tự động — nên nếu không ai nhớ chạy, các lỗi mà chúng được sinh ra để bắt có thể lọt qua mà không ai biết.
  file: `scripts/ci/repin-eval-coverage.mjs`
  severity: high
  Đề xuất: known-limits

- **`build` script uses a POSIX-only env prefix; no cross-env, breaks `pnpm build` on Windows**
  Người dùng thấy gì: Lệnh build dự án có thể không chạy được trên máy Windows, khiến người dùng Windows không build được sản phẩm bằng lệnh chuẩn.
  file: `package.json`
  severity: medium
  Đề xuất: new-contract

- **`plan` and `newlines` swallow unknown flags and exit 0, contradicting the file's own stated law**
  Người dùng thấy gì: Hai chế độ vận hành của công cụ âm thầm bỏ qua tham số dòng lệnh gõ sai thay vì báo lỗi, nên người vận hành gõ nhầm có thể nhận một kết quả trông đáng tin nhưng thực chất dựa trên lệnh sai, mà không được cảnh báo.
  file: `scripts/ci/repin-eval-coverage.mjs`
  severity: medium
  Đề xuất: new-contract

- **PRODUCT-MAP.md drift breaks the acceptance-gate CI job at HEAD**
  Người dùng thấy gì: Bản đồ sản phẩm nội bộ chưa cập nhật, vẫn hiện tính năng này là 'đang cân nhắc' dù đã xong, khiến trang tổng quan sai và có thể chặn việc gộp mã nguồn.
  file: `PRODUCT-MAP.md`
  severity: high
  Đề xuất: new-contract

- **check-eval-key-dupes.sh reports a clean sweep when awk fails to read a file**
  Người dùng thấy gì: Nếu công cụ kiểm tra không đọc được một tệp cấu hình (ví dụ do lỗi quyền truy cập), nó báo 'mọi thứ ổn' thay vì báo lỗi — nên một lỗi trùng lặp thật trong tệp đó có thể không bị phát hiện.
  file: `scripts/acceptance/check-eval-key-dupes.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — fixture eval-line viết tay đúng khuôn bên đọc, không round-trip qua writer thật (46/130 dòng thật vô hình)**
  Người dùng thấy gì: Cơ chế nhận diện 'đã đo lại' không nhận ra gần một phần ba các lượt đo lại thật đã từng chạy trên các tính năng đã được duyệt trước đây, nên có nguy cơ báo oan rằng một lượt cập nhật đã bỏ sót việc đo lại dù thực tế đã đo.
  file: `scripts/ci/check-repin-eval-coverage.sh`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 5 — thước canh cỡ bộ răng tuyên theo LỚP nhưng chỉ quét một điểm-case; số 7/7 trong hồ sơ ĐÃ KÝ đã trôi thành không bao giờ thoả được**
  Người dùng thấy gì: Bằng chứng đã được duyệt trước đây của một tính năng khác (đăng ký fork OpenAI) hiện không còn khớp với kết quả thật của phép kiểm tra liên quan, nên hồ sơ đã duyệt đó có thể đang mô tả sai thực tế.
  file: `_acceptance/dang-ky-fork-openai/evals.yaml`
  severity: medium
  Đề xuất: new-contract

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ

- **Hình dạng 5 (biến thể) — bất biến đếm `kê == phá + bỏ qua` đúng-do-cấu-trúc, không thể đỏ vì lý do nó tuyên là bắt được**
  file: `scripts/ci/check-gate-guards-job.sh:349`
  severity: low
  detail: check-gate-guards-job.sh:302-306 dựng `red_cmds` bằng cách lấy `cmds` trừ đi các needle nằm trong TEETH_SKIP, rồi :349 khẳng định `ke == pha + bo`. Vì `pha = ke - |TEETH_SKIP ∩ GUARD_NEEDLES|` theo đúng vòng lặp vừa chạy, đẳng thức chỉ có thể sai khi TEETH_SKIP khai một needle KHÔNG tồn tại trong GUARD_NEEDLES — nó không thể đỏ vì lý do được tuyên. Lời tuyên nằm ngay trên nó («Without the invariant, "forgot to write a perturbation for a needle" and "deliberately skipped it" print the same green») và trong expected của E5 hồ sơ ĐÃ KÝ noi-thuoc-tai-lieu-vao-ci («thiếu nó thì "quên viết phép phá cho một needle" và "cố ý bỏ qua" cho cùng một đầu ra xanh»): trạng thái «quên viết phép phá» không dựng được, vì mọi needle không khai bỏ qua đều tự động vào `red_cmds` và tự động bị chạy trên cây đã phá. Chính header của scripts/ci/check-repin-eval-coverage.sh:11-13 gọi tên đúng hình dạng này («An earlier guard in this repo shipped `ke == do + bo qua`, which every element satisfies by construction and which therefore could never fail; that is the shape to avoid») — nhưng bản mới vẫn giữ nguyên hình dạng ấy ở đây. Tính chất thật thì vẫn được đo, chỉ là do vòng chạy đỏ ở :308-327 chứ không do bất biến này.
  source: measurement

⚠ Cụm ngoài vùng phủ: 5/9 lỗi rơi vào file không bộ đo nào phủ (PRODUCT-MAP.md, package.json, _acceptance/dang-ky-fork-openai/evals.yaml, scripts/ci/check-gate-guards-job.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
