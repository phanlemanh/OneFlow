# gate-scope-anchors — thiết kế (hạng mục 0.6)

> Slug: `gate-scope-anchors` · Tier T2 · Chốt với Manh 04/08/2026 (chat):
> một hợp đồng cả hai nửa · ngữ nghĩa "sự thật lịch sử" · cơ chế neo A+C.

## Một câu

Mọi câu hỏi của cổng nghiệm thu phải được **hỏi và trả lời trong cùng một
không gian** — hợp đồng này sửa hai lần vi phạm đã có tên của luật đó, một
lần lệch về fail-open (nửa a), một lần lệch về fail-closed (nửa b).

## Bối cảnh

`stale-scope-by-paths` (ký 29/07) đặt tên họ lỗi: *hỏi câu hỏi ở một không
gian, dùng câu trả lời ở không gian khác*. Nó sửa 4 biến thể, để lại biến
thể thứ 5 (fail-open, HIGH) và ghi rõ "KHÔNG vá lẻ". STATUS.md 29/07 gộp
thêm họ **eval hết hạn ý nghĩa lúc merge** (fail-closed) vào cùng hạng mục
0.6. Ba hồ sơ `ci-actions-bump` / `dependency-refresh-2026-07` /
`oneflow-plugin-prefix` hiện không chạy lại trung thực được trên nhánh
`feat/compose-overlay` — đã repro: 2 script exit 1, 1 exit 2 — và đang chặn
merge.

## Nửa (a) — không gian tên đường dẫn của scope

**Lỗi (biến thể 5):** `scope_has_any_match()` hỏi "union này khớp file nào
không?" trên **toàn cây tracked**; `stale_files()` trả lời trên **cây đã
lọc** (bỏ `_acceptance/**` + `t1_skip_globs`) *trước khi* áp scope. Một
feature khai `paths: ["docs/**"]` hoàn toàn thành thật vẫn được cấp scope
hẹp rồi lọc sạch mọi thay đổi đáng báo, vĩnh viễn.

**Sửa:** `scope_has_any_match()` hỏi trên đúng vũ trụ mà `stale_files()`
trả lời — danh sách tracked file **sau** cùng bộ lọc exempt. Union không
khớp gì trong vũ trụ đó = scope không bao giờ báo được gì → từ chối scope
hẹp, lùi về whole-tree, in NOTE nêu lý do (không im lặng).

**Suppression half:** một khai báo hẹp hợp lệ (glob trỏ code thật) vẫn phải
được cấp scope hẹp — bản sửa mà từ chối tất cả là dựng lại treadmill mà 0.5
sinh ra để gỡ.

**Guard 4 biến thể đã sửa** (ls-files-vs-diff namespace · prefix top-level ·
đếm-tổng-vs-phân-bố · quy-chủ-chỉ-nhìn-lùi) giữ nguyên và phải còn khả năng
đỏ — harness mới chứng minh bằng perturbation in-process, theo mẫu
`check-suite-discriminating.sh`.

## Nửa (b) — neo lịch sử cho eval per-PR

**Ngữ nghĩa đã chốt:** sau merge, một eval kiểu "PR của tôi không đụng
`config/`" mang nghĩa **sự thật lịch sử** — nó diễn đạt lại thành "khi tôi
hạ cánh, tôi không đụng `config/`", neo vào đúng PR của nó, hỏi lại bao giờ
cũng cùng đáp án. Trùng khớp với định nghĩa quyền-sở-hữu-file đã chốt 29/07
("tập file một feature sở hữu = diff của merge commit đã hạ cánh nó").

### Bộ giải duy nhất: `scripts/acceptance/own-range.sh <slug>`

- Đọc frontmatter `landed_merge:` trong `_acceptance/<slug>/contract.md`.
- **Có** → kiểm sha tồn tại và là merge commit (`git rev-parse <sha>^2`);
  in `range_from=<sha>^1`, `range_to=<sha>`, `commits=` = danh sách
  `git rev-list <sha>^1..<sha>^2` (mọi commit của nhánh PR).
- **Không có** → `range_from=$(git merge-base HEAD <main>)`,
  `range_to=HEAD`, `commits=` = rev-list của khoảng đó. Đây là hành vi hôm
  nay của feature chưa merge — byte-compatible, không đổi gì cho vòng đầu.
- **Sha hỏng / không giải được / không phải merge commit** → exit 2 với
  thông điệp nêu rõ; guard tiêu thụ báo "không nhìn được" (exit 2), KHÔNG
  BAO GIỜ xanh. Fail-closed của họ script này giữ nguyên.

Bộ giải là nơi **duy nhất** biết luật neo. Guard chỉ gọi nó — không guard
nào tự tính range hay tự grep lịch sử. (Bài học compose-overlay: bảy nơi
cùng cài một khái niệm = ba vòng verify trả giá.)

### B1 — ba guard hỏi về khoảng diff

`check-no-config-drift.sh` · `check-no-t3-drift.sh` ·
`check-workflow-drift.sh`: đổi base từ `origin/main...HEAD` sang
`range_from..range_to` của bộ giải, slug truyền qua env
`ACCEPTANCE_SLUG` (mặc định vắng → nhánh hiện tại, hành vi cũ).

### B2 — năm eval hỏi về run CI

Cả 5 đi qua **một chỗ nối có sẵn**: `scripts/ci/gh-run-lib.sh`. Sửa tại
seam đó:

- `head_sha()` → khi có neo: trả **tập commit** của PR (từ `commits=` của
  bộ giải) thay vì HEAD; `find_run` thử `--commit` lần lượt từng sha của
  tập (mới → cũ) thay vì `--branch` (bỏ hẳn tra theo tên nhánh — tên nhánh
  không sống sót sau xoá nhánh, commit thì có).
- Đã kiểm chứng dữ liệu còn: PR #17 có `CI=success @ 60c4797`, hai run
  dispatch `success @ b48699c6` — khác SHA nhưng cùng tập commit, đúng lý
  do neo phải là **tập**, không phải một sha.
- `check-ghcr-untouched.sh`: nửa quyết định (log của run) không đổi; nửa
  đối chứng (listing registry) giới hạn cửa-sổ thời gian bằng
  `[createdAt của run dispatch, committer-date của landed_merge]` — thành
  khẳng định lịch sử đóng, không còn trôi theo hiện tại.
- "Không tìm thấy run nào trong tập commit" vẫn exit 2 (suppression half —
  một feature có neo mà không có run không được đọc thành xanh).

### Backfill

Điền `landed_merge:` cho 3 hồ sơ mục tiêu (`ci-actions-bump` `8477f8a`,
`dependency-refresh-2026-07`, `oneflow-plugin-prefix` — tra sha merge từ
lịch sử main), sửa command string tương ứng trong `_acceptance/config.yaml`
(thêm `ACCEPTANCE_SLUG=<slug>`). Toàn bộ nằm trong `_acceptance/**` —
t1-exempt, không stale ai.

## Chi phí khai trước (trình ở Cổng 1, không để S4 phát hiện)

1. **`stale-scope-by-paths` sẽ stale và cần re-verify + ký lại** — scope
   của nó là đúng `scripts/pre-merge-check.sh` + `scripts/acceptance/**`,
   hai chỗ nửa (a) chạm. Evals của nó toàn script local, rẻ.
2. **5 hồ sơ whole-tree vừa ký sẽ stale lại** (`compose-overlay`,
   `task-metering`, `sdk-distribution-rename`, `measure-harness`,
   `per-plugin-origin` — và `conformance-l0` nếu glob `scripts/plugins/**`
   của nó bắt file B1): bất kỳ commit code nào ngoài exempt đều stale
   feature không có `paths`. Không tránh được bằng thứ tự commit — cây
   cuối là thứ được đo. Vòng re-verify cuối + MỘT lượt ký cho cả loạt là
   chi phí của hợp đồng này; các vòng đó đã chứng minh là cơ học (hôm nay
   chạy 6 vòng, 0 lỗi trong hợp đồng).
3. Nhóm cache L1–L4 thoát nhờ scope hẹp (paths của chúng là `sdk/**` +
   `src/lib/task/**`, 0.6 không chạm).

## Ngoài phạm vi

- `check-manifest-unmoved.sh` / `check-overlay-registration.sh` — đã là
  state-assertion (không hỏi về diff), thuộc gói nợ "lần fork thật đầu
  tiên".
- Cơ chế carry-forward P1/P2/P3 của vòng verify — không đổi.
- Khai `paths` bổ sung cho các feature whole-tree — việc của vòng
  re-verify sau, không phải AC của hợp đồng này.
- 0.7 (English-only vs văn bản vendor) — hạng mục riêng.

## Rủi ro

- **`ci_ghcr_untouched` là ca fiddly nhất** (khẳng định về trạng thái
  registry trong cửa sổ thời gian). Điều kiện revisit: nếu chi phí neo nó
  vượt giá trị → hạ thành known-limit có chữ ký, không kéo cả hợp đồng.
- **Eval B2 phụ thuộc mạng + `gh` auth** — cùng lớp với guard clone-plugin
  của compose-overlay (tiền lệ đã chấp nhận); không wire vào CI được như
  hiện trạng, ghi rõ trong evals.
- **GitHub xoá run cũ theo retention** (mặc định 90 ngày): neo lịch sử cho
  B2 chỉ trả lời được khi run còn — hết retention thì exit 2 "không nhìn
  được" là hành vi đúng và trung thực; bằng chứng gốc vẫn nằm trong
  evidence-report đã ký của feature đó.
