---
schema_version: 1
feature: Gate tooling × t1_skip_globs — đường hợp lệ để sửa guard, và trả ba nợ 0.8
slug: gate-tooling-t1
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: verified
approved_by: Manh
approved_at: 2026-08-27
amended_at: 2026-08-28
---

# Acceptance Contract: gate-tooling-t1

## Context

Miễn trừ `t1_skip_globs` cho gate tooling khai theo **tên chính xác** —
`scripts/pre-merge-check.sh`, `scripts/recheck-evidence.*`, `lib/*.cjs` — chứ
không theo thư mục. Tám guard do chính repo viết dưới `scripts/acceptance/**`
vì thế **không** được miễn: sửa chúng làm cũ pin đã ký (trước 17/08), và từ khi
fork `STALE-DIFF-SCOPE-GUARD` che staleness thì đổi thành nổ `VIOLATION [PR]`
t1-escape. Nói cách khác, hiện **không có đường hợp lệ nào để sửa một guard**
ngoài việc mở hồ sơ nghiệm thu cho chính nó. Đó là nợ STATUS.md item 0.8, mở từ
Cổng 2 của CI-a (ký 05/08) và đã đốt 4 wave ký lại.

**PHẠM VI ĐÃ THU HẸP 28/08 — đọc trước khi tin tiêu đề.** Nợ 0.8 có HAI vế chặn
việc sửa một guard: (i) luật `t1-escape` nổ, và (ii) thay đổi gated làm cũ pin đã
ký. Hồ sơ này đóng **vế (i)** và KHÔNG đóng vế (ii). Đo được ngày 28/08 (xem
`gap-probe.md` §Kiểm chứng): một PR chỉ sửa `scripts/acceptance/**` kèm artifact
thoát được `t1-escape` đúng như AC-1 khẳng định, nhưng vẫn sinh **ba** violation
staleness — `measure-harness`, `task-metering` (cả hai khai `scripts/**`) và
`stale-scope-by-paths` (khai chính `scripts/acceptance/**`). Vế (ii) chuyển thành
nợ có tên, xem `## Out of scope` và bản ghi `d-20260828T031500Z-scope`.

Hồ sơ này đóng vế (i) của nợ đó, và đóng luôn hai khuyết tật đo được trong lúc
chẩn đoán 27/08: fork bọc TRỌN khối staleness nên **AC-2 của `stale-scope-by-paths` —
"ngoài union thì KHÔNG stale", đúng hành vi feature đó sinh ra để tạo — mất chỗ
quan sát**, và 5/14 case của `check-stale-scoping.sh` đỏ trên `main` sạch.

Ranh giới cần giữ khi sửa: miễn trừ tồn tại để **nâng thước đo** không làm cũ
bằng chứng đã ký, **không phải** giấy phép cho việc đổi *thứ thước đo đang đo*
mà không qua rà soát (AC-11 của `stale-scope-by-paths`). Nên lời giải KHÔNG
được là "thêm `scripts/acceptance/**` vào `t1_skip_globs`".

Source input: STATUS.md item 0.8; `_acceptance/stale-scope-by-paths/decisions.jsonl`
entry `d-20260805T190000Z-31447`; phiên chẩn đoán 2026-08-27.

## Criteria

- AC-1: Given một PR chỉ đổi guard do repo viết dưới `scripts/acceptance/**` và có mang artifact `_acceptance/gate-tooling-t1/`, When cổng chạy, Then không có `VIOLATION [PR]` t1-escape nào được báo. *Đây là đường hợp lệ mà 0.8 sinh ra để tạo; thiếu nó thì mọi lần sửa guard đều là ngõ cụt.*
- AC-2: Given một feature khai đủ `paths`, có `_acceptance/<slug>/` NẰM NGOÀI diff PR, và mọi file trong tập staleness của nó đều nằm ngoài union đã khai, When cổng chạy, Then cổng in `narrow staleness scope applied` và KHÔNG báo feature đó stale. *Khôi phục AC-2 của `stale-scope-by-paths`; trước khi thu hẹp fork thì không fixture nào dựng được ca này.*
- AC-3: Given một feature KHÔNG khai `paths` và có `_acceptance/<slug>/` nằm ngoài diff PR, When cổng chạy, Then nó KHÔNG bị báo stale. *Nửa SUPPRESSION: đây là lý do fork tồn tại (chống chặn-mọi-PR-vì-lịch-sử). Sửa để AC-2 sống lại mà làm hỏng vế này là đổi một khuyết tật lấy một khuyết tật.*
- AC-4: Given một feature khai đủ `paths` ngoài diff PR mà có file TRONG union đổi sau `verified_commit`, When cổng chạy, Then nó VẪN bị báo stale. *Nửa should-fire của AC-2; thiếu nó thì "thu hẹp fork" có thể thoái hoá thành "không bao giờ stale" mà mọi tiêu chí khác vẫn xanh.*
- AC-5: Given `scripts/acceptance/check-stale-scoping.sh` tại HEAD, When chạy lần lượt MỌI `--case` mà chính guard khai trong `KNOWN_CASES` trên cây sạch, Then tất cả đều exit 0. *Mốc đầu phiên là 9 xanh / 5 đỏ trên 14; con số xanh-hết là thứ duy nhất chứng minh việc dựng lại fixture không đổi màu bằng cách nới khẳng định. Không ghim một con số cứng: xem Amendment.*
- AC-6: Given một fixture khai ZERO `paths` cùng một thay đổi gated, When cổng chạy, Then nó báo `VIOLATION [fx]: evidence is stale`. *Item 0.8(a): AC-3 mệnh đề (a) của `stale-scope-by-paths` mất eval máy từ 05/08; nửa `undeclared` của `case_announce` trước đây xanh RỖNG vì khối bị bỏ qua.*
- AC-7: Given HEAD, When quét cây, Then `scripts/acceptance/check-stale-golden.sh`, fixture `baseline-gate-output.txt`, và key `stale_scoping_golden` đều VẮNG MẶT. *Item 0.8(b), đã merge ở PR #76 — giữ làm guard hồi quy để ba mảnh đó không bò lại qua một lần vendor kit.*
- AC-8: Given fork `STALE-DIFF-SCOPE-GUARD` trong `scripts/pre-merge-check.sh`, When điều kiện bỏ qua của nó bị đổi trên một BẢN COPY tạm, Then ít nhất một case của `check-stale-scoping.sh` chuyển đỏ. *Fork nằm trong file được `t1_skip_globs` miễn, nên đổi ngữ nghĩa cổng ở đó lọt rà soát; răng này là thứ duy nhất bắt được. Bản copy, không phải cây làm việc.*
- AC-9: Given cổng với fork đã thu hẹp tại HEAD, When chạy với diff RỖNG, Then không feature nào bị báo stale. *Wave re-verify: thu hẹp fork làm lộ 4 hồ sơ stale thật (`conformance-l0`, `measure-harness`, `stale-scope-by-paths`, `task-metering`) mà fork cũ đang che.*
- AC-10: Given `_acceptance/stale-scope-by-paths/contract.md` và `decisions.jsonl`, When quét tìm khẳng định rằng `check-stale-golden.sh` "giữ nguyên trên cây", Then không còn khẳng định nào như vậy. *Câu đó thành sai từ PR #76; sửa nó phải đi cùng wave vì chạm thư mục đó là mở lại phép soi staleness.*
- AC-11: Given 4 feature được re-pin bởi wave của hồ sơ này, When đọc contract của chúng, Then mỗi cái mang `landed_merge`. *Item 0.8(c) thu hẹp: `landed_merge` mới có 5/23, nhưng backfill cả 18 cái còn lại là mở 18 thư mục vào diff cùng lúc — bám theo wave đã phải chạy thì không tốn thêm gì.*
- AC-12: Given union `paths` của `measure-harness` và `task-metering` (`src/**`, `scripts/**`, `package.json`), When cân giữa giữ, thu hẹp, hay bỏ khai, Then chọn được một hướng có lý do viết ra. *Đo được: narrow scope của chúng chỉ chặn 9 thay đổi, nên việc khai gần như không mua được gì mà vẫn phải trả giá bị soi.* (judgment)

## Coverage

Quét theo trục, dựng lại từ chính khuyết tật đã đo trong phiên 27/08 (không
dùng preset test-matrix: preset mô tả feature sản phẩm, còn đây là một cổng shell).

- **Trục A — trạng thái khai `paths` của feature:** không khai · khai một phần · khai đủ · khai đủ nhưng union rỗng nghĩa — [CE: `feature_scope()` hiện có + 5 mode fixture `mk_fixture`]
- **Trục B — vị trí `_acceptance/<slug>/` so với diff PR:** trong diff · ngoài diff — [CE: `slug_in_diff()`, và chính fork đang rẽ theo trục này]
- **Trục C — vị trí file đổi so với union:** trong union · ngoài union nhưng gated · `_acceptance/**` · `t1_skip_globs` — [CE: các nhánh `case` sẵn có trong `stale_files`]
- **Trục D — ai sở hữu file gate bị sửa:** kit vendor (miễn trừ theo tên) · guard repo tự viết (`scripts/acceptance/**`, bị gate) — [CE: danh sách `t1_skip_globs` đọc trực tiếp]
- **Ô A×B lộ ra, suýt sót:** (khai đủ) × (ngoài diff) → **AC-2**. Fork cũ gộp ô này vào ô (không khai)×(ngoài diff) và bỏ qua cả hai, nên nhìn từ phía "đừng chặn PR vì lịch sử" thì nó vô hình — mà mất nó là mất đúng công dụng chính của `stale-scope-by-paths`.
- **Ô D lộ ra:** fork sống trong file được miễn trừ, nên đổi ngữ nghĩa cổng ở đó không bị soi → **AC-8**.

## Out of scope

- **Thêm `scripts/acceptance/**` vào `t1_skip_globs`.** Đó là bỏ gate cho chính thứ mà thước đo đang đo — AC-11 của `stale-scope-by-paths` cấm thẳng, và nó biến mọi guard thành sửa-được-không-ai-soi.
- **Backfill `landed_merge` cho 18 contract còn lại.** Mở 18 thư mục `_acceptance/<slug>/` vào cùng một diff là mở 18 phép soi staleness cùng lúc — wave lớn nhất từ trước tới nay. Cách rẻ là bám: điền cho slug nào đang phải re-verify vì lý do khác (AC-11 làm đúng thế cho 4 slug).
- **Đổi ngữ nghĩa `stale_files` sang đo theo range của PR** (`BASE...HEAD`) thay vì `verified_commit...HEAD`. Nó xoá được wave re-verify nhưng phá luật nền "bằng chứng chứng nhận cây tại `verified_commit`".
- **Tách `scripts/acceptance/fixtures.sh`** (đang 831 dòng, vượt cap 800 của CLAUDE.md — đã vượt từ trước ở mức 805). Refactor riêng; gộp vào đây là trộn hai loại rủi ro.
- **Đụng `_acceptance/normalize-text-vi/`** — nhánh đó đang giữa Cổng 2.
- **Vế (ii) của nợ 0.8 — làm cho PR sửa guard MERGE ĐƯỢC, không chỉ thoát
  `t1-escape`.** Đo được là còn ba hồ sơ bị stale bởi một guard edit. Đường ra mà
  judge của AC-12 chỉ (BỎ KHAI `paths` ở ba eval thường trực của `measure-harness`
  và `task-metering`, gỡ `scripts/**` khỏi union) nằm ngoài hồ sơ này vì nó chạm
  `_acceptance/<slug>/` của hai feature khác và phải đi kèm wave của chúng. Bản
  ghi `d-20260828T031500Z-scope`.
- **Ô A4 của `## Coverage` — "khai đủ nhưng union rỗng nghĩa".** Khai thẳng ở đây
  để bảng Coverage không đọc như một lời khai phủ kín: ô này là fail-open đã được
  Cổng 2 của `stale-scope-by-paths` cố ý hoãn sang contract riêng
  (`d-20260729T095807Z-19845`); hồ sơ này giữ nguyên quyết định đó, không vá.

## Amendment 1 — 2026-08-27, sau vòng verify 1 · duyệt tại chỗ bởi Manh 2026-08-28 (cùng lượt duyệt Amendment 2)

**AC-5 bỏ con số cứng "14".** Bản duyệt ở Cổng 1 viết "đủ 14 `--case`". Con số đó
đúng lúc duyệt và đã cũ ngay trong lượt thi công của chính hồ sơ này: AC-3, AC-4 và
AC-6 mỗi cái sinh một case mới (`fork-undeclared`, `fork-declared-in-union`,
`undeclared`), nên cây có 17. Vòng verify context sạch bắt được chỗ lệch này.

Sửa là bỏ con số, không phải đổi 14 thành 17 — vì ghim một con số ở đây tái lập đúng
lỗi mà E6 sinh ra để tránh: một danh sách (hay một con số) chép sang chỗ thứ hai sẽ
mục, và case thêm về sau sẽ không được ai đếm. E6 đọc `KNOWN_CASES` từ chính guard;
AC-5 nay nói cùng một ngôn ngữ.

**Nội dung khẳng định KHÔNG đổi** — vẫn là "mọi case đều xanh" — nên
`evidence-report.md` của vòng 1 (viết trước sửa đổi này) vẫn chấm đúng thứ AC-5 hỏi;
E6 xanh với 17/17 và lớp chống rỗng của nó xác nhận `config.yaml` khai cùng 17.

Ba case thêm là của chính hồ sơ này, không phải dấu hiệu guard khác thế hệ — vòng
verify có nêu khả năng đó như một điều cần người soi, và đây là câu trả lời: đã đối
chiếu `KNOWN_CASES` ở commit `14b872d` với danh sách trước đó.

## Amendment 2 — 2026-08-28, sau gap-probe · duyệt bởi Manh

**Thu hẹp phạm vi, do gap-probe P0-1.** Câu tuyên bố trung tâm của bản duyệt Cổng 1
— nợ 0.8 được đóng — SAI theo phép đo. Nó đóng vế `t1-escape` và không đóng vế
staleness. Sửa là thu hẹp lời tuyên bố cho khớp thứ đo được, không phải nới tiêu
chí cho khớp thứ đã xây: **không AC nào bị đổi, không eval nào bị nới**. Mười ba
eval vẫn khẳng định đúng thứ chúng vẫn khẳng định; chỉ Context và Out of scope
thôi nói quá.

**Cũng ghi nhận, không vá trong hồ sơ này:** ba P0 còn lại của gap-probe (AC-5 sau
Amendment 1 không có sàn nên tập case tự khai có thể CO lại; E12 chỉ kiểm anchor
"phân giải được" chứ chưa kiểm "đúng"; E8/E11 khẳng định vắng mặt mà không gieo
chứng dương) và bốn P1/P2 — tất cả chuyển sang contract kế. Dữ liệu `landed_merge`
hiện tại đã soi tay và sạch, nên đây là nợ RĂNG chứ không phải nợ dữ liệu.

**Vì sao vẫn ký thay vì mở vòng sửa:** mười ba eval xanh là thật và đo được thứ
chúng nói; cái sai là một câu văn xuôi, và sửa câu đó rẻ hơn nhiều so với vứt cả
gói. Nợ còn lại nay có tên, có bản ghi ledger, và có người chịu trách nhiệm mở
contract kế — khác hẳn với việc để nó vô hình sau một dấu tích xanh.

## Notes

- **Cảnh báo trình tự, cần cân ở Cổng 1:** AC-2, AC-3, AC-4, AC-5, AC-6, AC-7
  mô tả công việc **đã code xong** ở nhánh `fix/scoping-fixtures-diff-shape`
  (và AC-7 đã merge ở PR #76). Skill acceptance liệt kê "viết tiêu chí sau khi
  implement" là anti-pattern vì tiêu chí uốn theo thứ đã xây. Tiêu chí ở đây
  viết từ đề bài (STATUS 0.8) và từ khuyết tật đo được, không từ diff — nhưng
  rủi ro là thật và người duyệt nên soi đúng nhóm đó. AC-1, AC-9, AC-10, AC-11,
  AC-12 thì đi trước thi công như bình thường.
- Fork liên quan: `STALE-DIFF-SCOPE-GUARD` vào cây ở `97b5b12` (17/08, nâng kit
  2.1.0), giữ qua `941a71a` (kit 2.4.0). Hồ sơ contract của nó là
  `stale-theo-diff-pr`, ký ở Cổng 1.
- `scripts/pre-merge-check.sh` nằm trong `t1_skip_globs`, nên sửa nó không tự
  làm cũ hồ sơ nào — đó chính là lỗ hổng mà AC-8 vá bằng răng.
- Wave của AC-9 sẽ re-pin 4 slug; AC-10 và AC-11 cố ý bám vào đúng wave đó để
  không mở thêm thư mục nào vào diff.
