---
schema_version: 2
feature_slug: repin-khong-chay-lai-eval
verdict: PASS
failed_evals: []
reason:
verified_by: phiên VERIFY tuần tự (CLASSIFIER-FALLBACK sau BLOCKED vòng 3) + 3 lớp soi chỉ-đọc + 1 lượt soi xác nhận đối kháng
enforcement_mode: strict
bypass_used: false
verified_commit: 5b440efdc75859cc700b7564e76b42e6a3e73fd9
human_signoff: Phan Le Manh 2026-09-03
---

# Evidence Report: repin-khong-chay-lai-eval

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | script | PASS |
| E13 | AC-13 | script | PASS |
| E14 | AC-14 | script | PASS |

**Lệnh máy:** 8/8 exit 0 tại `e68cdd61b0e7` (preflight · build · typecheck · lint · test ·
sdk pytest · verify:plugins · gen:abi sạch), chạy **TUẦN TỰ**.

**Vì sao tuần tự.** Vòng 3 trả `BLOCKED`: `pnpm build` chết trong tay một agent
(`agent bi skip/chet`) và `pnpm typecheck` thoát 2 — cả hai xanh khi chạy lại một mình.
41 agent song song không phải "cùng phép đo, nhanh hơn": `pnpm build` mất 2,1 phút khi
đơn độc và 6:14 dưới tải, nên ở đâu đó giữa hai mốc nó vượt trần công cụ. Fan-out đổi
KẾT QUẢ, không chỉ đổi tốc độ. Vòng 4 và 5 chạy mọi lệnh lần lượt; **0 lệnh bị công cụ
giết**. Lớp soi vẫn dùng agent, nhưng chỉ-đọc — không lệnh nặng nào.

**Hàng rào tự bắt lần ghim của chính vòng này.** Sự kiện re-pin `rkce-repin-20260903T065011Z` có diff chạm
`scripts/ci/**`, và `check` báo nó nuốt 4 ô đo: `conformance-l0/E15` và
`dang-ky-fork-openai/E2,E3,E6`. Cả bốn đã chạy lại THẬT, exit 0, ghi dòng eval mang
`exit_code` — `eval bi nuot` 2 → 0. Đây là lần thứ hai trong đời hồ sơ này nó bắt được
một lần ghim thật, không phải fixture.

## Known limits

- **Hàng rào chưa vào CI.** `check-repin-eval-coverage.sh` không có step nào trong
  `.github/workflows/ci.yml`; nó chạy khi có người gõ. Cùng đúng lỗ mà
  `noi-thuoc-tai-lieu-vao-ci` vừa đóng cho hai thước khác — và hồ sơ ấy đã chứng minh
  một thước không cắm điện thì trôi mà không ai biết.
- **Số viết bằng CHỮ ngoài tầm AC-14.** `so-khop-total` quét chữ số (`PARTIAL: n/N`,
  `OK: n/N ca`) trong hai file. Một câu như "mười bốn ca có tên" trôi tự do; nó ĐÃ trôi
  thật ở vòng 4 và phải sửa tay.
- **Phạm vi quét là danh sách file, không phải luật.** Mẫu chỉ nêu hình dạng nên một
  file mới trong hồ sơ mang `OK: n/N ca` sẽ không được soi cho đến khi ai đó thêm tên nó
  vào `files=()`. Mở ra cả thư mục đã thử và đẻ 14 lệch giả (03/09).
- **Khoá YAML trùng không có hàng rào nào bắt.** `yaml.safe_load` giữ khoá cuối, im lặng.
  Đã tìm thấy một ca thật trong hồ sơ ĐÃ KÝ `noi-thuoc-tai-lieu-vao-ci` (E2 có `expected`
  hai lần, `paths` ba lần), sửa ở nhánh này kèm khối «Sửa đổi sau chữ ký», nhưng không có
  gì chặn ca tiếp theo.
- **AC-12 khoản (c) là đai an toàn không ai đo.** Phép tự đối chiếu sau khi ghi đúng theo
  cấu trúc một khi chốt xuống dòng đã tại chỗ; thay `if` của nó bằng `if (false)` vẫn để
  21/21 xanh. Giữ lại để bắt một lỗi TƯƠNG LAI của bộ ghi, và khai thẳng thay vì để một ô
  đo nhận công.
- **`--min-computable` là lời khai của người gọi, không phải luật.** Sàn nói về KHO NÀY
  hôm nay; một kho chưa re-pin lần nào có 0 hợp lệ. Không có gì buộc người gọi phải đặt
  sàn — `rkce_check_min` đặt 1, một lệnh khác có thể quên.
- **`pnpm build` cần shell POSIX.** `NODE_OPTIONS=...` nội dòng trong `package.json`
  hỏng trên cmd/PowerShell. CI chạy Linux nên xanh; người đóng góp dùng Windows sẽ vấp
  đúng lệnh mà checklist bắt chạy.

## Ngoài hợp đồng

- `docs/roadmap.md`: gỡ một dòng trống cắt đôi bảng sổ cái — dòng cuối đang render thành
  chữ thường trên GitHub trong khi guard vẫn xanh (nó khớp theo dòng).
- `CLAUDE.md`: gỡ một dòng trống cắt danh sách hằng-số-ràng-buộc.
- `scripts/plugins/check-manifest-guard-teeth.sh`: nhãn ca nói "a 37th plain string"
  trong khi guard ghim 35; nay nhãn ĐỌC số ghim từ chính guard thay vì nhắc lại.
- `PRODUCT-MAP.md` + `docs/roadmap.md`: ghi `noi-thuoc-tai-lieu-vao-ci` vào hai sổ sau
  khi nó chuyển signed-off — cả hai cổng đang ĐỎ trên HEAD vì nợ sổ sách này.
- `_acceptance/noi-thuoc-tai-lieu-vao-ci/evals.yaml`: gỡ khoá `expected`/`paths` trùng
  (xem Known limits), kèm khối «Sửa đổi sau chữ ký» trong báo cáo đã ký của hồ sơ ấy.

## Iterations

- **Vòng 1** — REJECT. Gap-probe + hội đồng ra 2 HIGH: `write` bịa bằng chứng (thiếu
  `suites_json` thì mặc định `[0,0,0,0]`, tức dòng repin tự khai "lane đã xanh"), và
  điểm vào im lặng thoát 0 dưới symlink. Owner mở phạm vi cho cả hai.
- **Vòng 2** — REJECT, 11/11 ô đo xanh. 13 finding, 3 HIGH, tất cả cùng MỘT gốc: run-log
  bị coi như JSONL lỏng, mỗi chế độ mang dung sai riêng. `STOP-PATCHING-CLAUSE` kích
  hoạt; owner chọn **đổi hình dạng** — một CỬA duy nhất cho mọi lượt đọc/ghi.
- **Vòng 3** — BLOCKED vì tải máy (xem trên). 14 finding vẫn thật; 4 cái tự kiểm được
  đều đúng, và 3 trong 4 là con số viết tay trôi khỏi vật nó mô tả.
- **Vòng 4** — 14/14 ô đo xanh, 15 finding từ 3 lớp soi. **Hai HIGH do chính vòng 4 đẻ
  ra**: cờ `--min-computable` bỏ qua âm thầm mọi đối số lạ (nên cái sàn chống
  "xanh-trên-không-có-gì" tự nó thành không-có-gì), và E1 mượn nửa xanh của E8.
- **Vòng 5** — lượt soi xác nhận đối kháng **BÁC một trong ba phép sửa**: ca `healthy`
  mới thêm khớp chuỗi `prev_sha=<12 ký tự>` trên **stdout**, mà `console.log` in ra từ
  biến cục bộ ngay cả khi khoá ấy không vào log — đo THÔNG ĐIỆP chứ không đo VẬT. Gỡ
  `prev_sha` khỏi bộ ghi vẫn để E1 xanh. Sửa: đòi `"prev_sha":"<40 hex>"` có mặt trong
  chính run-log. PASS.

## Analyst

Bốn vòng có findings vẽ một đường rõ: vòng 1–2 tìm lỗi trong **hành vi** của hàng rào
(phá dữ liệu, chấp nhận lần chạy đỏ, chấp nhận bằng chứng bịa). Vòng 3–5 tìm lỗi trong
**lời khai về** hàng rào — số viết tay, chiều đo đi mượn, phạm vi tự xưng quá rộng, đối
chứng khớp trên thông điệp thay vì trên vật. Hành vi đứng yên ba vòng liên tiếp; cái còn
trôi là lớp văn bản mô tả nó, và lớp ấy mới có đúng MỘT hàng rào (AC-14), sinh ra ở vòng
4 và đã đỏ thật hai lần.

Bài học đắt nhất, ghi lại vì nó suýt lọt: **"chạy lại 14/14 xanh" không bao giờ đủ để
tuyên một phép sửa đã sống.** Ba phép sửa của vòng 4 đều có ô đo xanh; một trong ba không
sửa gì cả. Chỉ phá thứ thật rồi xem ô đo có đỏ mới đủ — và đó chính là việc lượt soi xác
nhận làm.

## Variance

Không đo lặp. Ô đo của hồ sơ này tất định (script trên kho git dùng-rồi-bỏ), trừ
`readers` vốn dựng worktree — chế độ ấy từng chập chờn hai lần ngày 02/09 và đã chốt bằng
`worktree prune` + chọn dòng repin ĐƯỢC một section `### Re-pin` trích dẫn.

## Evidence

- eval: E1
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_write_teeth
  verified_at: 2026-09-03T06:51:40Z
  output: |
    PARTIAL: 1/21 ca da chay — khong tuyen gi ve 20 ca chua chay

- eval: E2
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_newlines_have_prev
  verified_at: 2026-09-03T06:51:41Z
  output: |
    PARTIAL: 1/21 ca da chay — khong tuyen gi ve 20 ca chua chay

- eval: E3
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_paths_law
  verified_at: 2026-09-03T06:51:41Z
  output: |
    OK: luat khop paths dung o ca bon hinh dang, ca hai chieu

- eval: E4
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_plan
  verified_at: 2026-09-03T06:51:41Z
  output: |
    PARTIAL: 1/21 ca da chay — khong tuyen gi ve 20 ca chua chay

- eval: E5
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_check
  verified_at: 2026-09-03T06:51:42Z
  output: |
    OK: khong re-pin nao nuot mot eval bi cham

- eval: E6
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_check_min
  verified_at: 2026-09-03T06:51:43Z
  output: |
    PARTIAL: 1/21 ca da chay — khong tuyen gi ve 20 ca chua chay

- eval: E7
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_readers_bytewise
  verified_at: 2026-09-03T06:52:09Z
  output: |
    OK: them prev_sha khong doi ket luan cua ben doc; phep so chung minh duoc no thay khac biet

- eval: E8
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_teeth
  verified_at: 2026-09-03T06:52:13Z
  output: |
    OK: 21/21 ca — 6 doi chung duong + 15 phep pha

- eval: E9
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_resign_wave
  verified_at: 2026-09-03T06:52:21Z
  output: |
    OK: no feature other than repin-khong-chay-lai-eval carries stale evidence — the re-sign wave has cleared

- eval: E10
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_write_refusals
  verified_at: 2026-09-03T06:52:22Z
  output: |
    PARTIAL: 1/21 ca da chay — khong tuyen gi ve 20 ca chua chay

- eval: E11
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_entrypoint
  verified_at: 2026-09-03T06:52:22Z
  output: |
    PARTIAL: 1/21 ca da chay — khong tuyen gi ve 20 ca chua chay

- eval: E12
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_gateway
  verified_at: 2026-09-03T06:52:22Z
  output: |
    PARTIAL: 1/21 ca da chay — khong tuyen gi ve 20 ca chua chay

- eval: E13
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_exit_code
  verified_at: 2026-09-03T06:52:22Z
  output: |
    PARTIAL: 1/21 ca da chay — khong tuyen gi ve 20 ca chua chay

- eval: E14
  run_id: seq-verify-20260903T065140Z-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rkce_so_khop_total
  verified_at: 2026-09-03T06:52:23Z
  output: |
    PARTIAL: 1/21 ca da chay — khong tuyen gi ve 20 ca chua chay

### Re-pin lần 1 — 2026-09-03, do hợp nhất `origin/main` (33 commit) vào nhánh
run_id: merge-repin-20260903T074652Z
sha: 5b440efdc75859cc700b7564e76b42e6a3e73fd9 · suites: 8 lệnh exit 0

## Sửa đổi sau chữ ký — 2026-09-03: một bế tắc tự-quy-chiếu

Hợp nhất `origin/main` (33 commit) vào nhánh làm bốn hồ sơ hoá ôi; lần ghim đóng lại việc
ấy **bị chính hàng rào này bắt là nuốt 4 ô đo**. Ba ô chạy lại xanh. Hai ô còn lại — `E5`
và `E6` — **không thể xanh**, và lý do là cấu trúc chứ không phải hỏng hóc:

- cả hai **chạy chính chế độ `check`**;
- cả hai khai `paths` gồm mục thư mục trần `_acceptance`;
- mọi lần ghim đều ghi vào `_acceptance/**` — kể cả **dòng ghim của chính nó**;
- nên mọi lần ghim đều "chạm" E5/E6, và `check` chỉ thoát 0 khi E5/E6 đã có dòng chạy lại
  XANH tại sha ấy. Vòng tròn khép kín.

Chứng minh bằng thực nghiệm trong một worktree: thêm hai dòng xanh giả cho E5/E6 thì
`check` in `eval bi nuot: 0 … OK`; bỏ đi thì đỏ. Tức **E5 và E6 là hai vật chặn duy nhất,
và chúng chặn lẫn nhau**.

Hai dòng `exit_code: 1` của E5/E6 **được giữ nguyên trong sổ chạy**. Chúng là bản ghi
trung thực của hai lượt chạy có thật; xoá đi để hàng rào xanh chính là hành vi mà hồ sơ
này tồn tại để chặn.

**Không chặn merge:** `pre-merge-check: clean` — vì hàng rào chưa được cắm vào CI (giới
hạn số 1 đã khai ở trên). Nhưng nó có nghĩa **hàng rào đang đỏ trên chính lần ghim của
mình**, và phải sửa trước khi ai cắm nó vào CI, nếu không nó chặn mọi PR sau đó mà không
có lối ra.

Đã ghi vào `review-findings.md` mục «Ngoài hợp đồng» để định đoạt ở hồ sơ riêng. Hai lối
đã thấy, cả hai đều là quyết định thiết kế chứ không phải bản vá: **thu hẹp `paths` của
E5/E6** bỏ mục `_acceptance` (chúng đo LOGIC của hàng rào, không đo nội dung hồ sơ) —
nhưng khi ấy một lần ghim chỉ đụng hồ sơ sẽ không buộc chạy lại chúng nữa, mà kết luận
của `check` thì CÓ phụ thuộc nội dung ấy; hoặc **miễn trừ tường minh** các ô tự-quy-chiếu
ngay trong luật của hàng rào.
