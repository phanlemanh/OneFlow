---
slug: stale-scope-by-paths
at: 2026-07-28T10:20:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Gap probe: stale-scope-by-paths

Clean-context critic, artifacts only (design + contract + evals + ledger), no
repo code read. One pass — artifacts fixed, not re-probed.

## Cross-checks

- **AC without eval:** none — E1–E11 mapped 1:1 before the fix; E1–E15 after.
- **GWT not measurable as written:** AC-1, AC-2, AC-5, AC-8 (said "changed file"
  without pinning *between which two commits*), AC-9 (injection mechanism
  unspecified), AC-10 (base/head refs unpinned). All addressed below.
- **Coverage axis without AC:** none. Axis A covers all five states, Axis B all
  three, Axis C all five (working-tree-only cell explicitly cut with a reason).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | 9/11 eval gọi CÙNG một lệnh, CÙNG paths, CÙNG evidence — 9 AC quy về MỘT exit code; phân biệt ca chỉ nằm trong prose `expected` mà không máy nào đọc | Implementer làm ca in-scope + out-of-scope + mutation nhưng KHÔNG làm ca partial (AC-4) và malformed (AC-6). Guard exit 0. 9 eval ghi PASS với evidence giống nhau. Cả hai mutation của AC-9 vẫn đỏ nên anti-vacuity không phát hiện. Human ở Cổng 2 thấy 9/9 xanh cho ca chưa từng chạy | Mỗi eval một `--case` riêng → mỗi AC sở hữu một exit code; `evidence_required` đòi `output` chứa token nhãn của chính ca đó; thêm một eval khẳng định guard exit khác 0 khi thiếu một ca | **fixed:** 15 config key riêng, mỗi eval một ca + token, thêm E12 case-completeness |
| P0 | contract | "Gated diff" định nghĩa bằng *file nào bị lọc* nhưng KHÔNG bằng *diff giữa hai commit nào*. Cơ chế cần HAI base khác nhau: staleness = `verified_commit...HEAD` (per feature), coverage = `BASE_SHA...HEAD` (per PR). Không AC nào ghim sự tách đôi này | Implementer đọc đúng chữ contract rồi cross-check `paths` với `verified_commit...HEAD`. Với feature đã merge, base đó trải qua mọi merge không liên quan kể từ lúc ký — hàng trăm file — nên không union `paths` trung thực nào phủ nổi, và scope hẹp bị từ chối cho MỌI feature đã merge. Gate hành xử y như hôm nay, lợi ích AC-2 không bao giờ xuất hiện. E1–E9 vẫn xanh vì trong repo fixture hai base TRÙNG nhau | Context ghi rõ hai tập, không được lẫn; AC-1/AC-2 gọi tên staleness set, AC-5/AC-7 gọi tên coverage set; thêm AC với fixture mà hai base CỐ Ý khác nhau để cách đọc sai thành đỏ | **fixed:** Context §Two bases + AC-12 với fixture hai base lệch |
| P1 | evals | E10 ghim theo topology nhánh ("chạy với `main`", HEAD ngầm) và một danh sách 6 file chính xác — cả hai là thuộc tính của trạng thái nhánh hiện tại | PR #25 merge vào main trước khi feature này landing → `_acceptance/conformance-l0/` không còn trong `BASE_SHA...HEAD` → theo AC-7 nó không bị cross-check, không in danh sách, và E10 ĐỎ trên một implementation ĐÚNG. Hoặc thêm một file `src/**` vào nhánh làm danh sách thành 7, verifier "sửa" E10 thành so tập con — xoá đúng cái eval neo cơ chế vào một khai báo viết bởi người không biết luật | Ghim E10 bằng SHA literal thay vì tên nhánh; khẳng định danh sách là tập CHÍNH XÁC, khác rỗng, và cross-check ĐÃ chạy; `evidence_required` ghi hai SHA đã dùng | **fixed:** E14 ghim 2 SHA literal + đòi non-empty + đòi cross_check_fired |
| P1 | contract | AC-9 đòi mutation "in-process, không sửa working tree" mà không nói bằng cách nào, và không AC nào cấm cái công tắc đó tồn tại trong production | Gate ship kèm `STALE_SCOPE_FORCE_NO_MATCH` (hoặc tương đương). Ai đó — hoặc CI env rò, hoặc alias copy-paste — set nó, gate cấp scope match-nothing cho mọi feature đã khai và exit 0 không violation. Đúng thứ "disabled gate with a better name" mà AC-1 sinh ra để chặn, và không eval nào bắt: E1–E11 đều exit 0 khi công tắc tắt, còn E9 thì ĐÒI công tắc tồn tại | AC-9 nêu rõ biên tiêm: guard copy gate sang temp dir rồi patch bản copy (temp dir không phải working tree); thêm AC khẳng định script ship KHÔNG chứa công tắc nào | **fixed:** AC-9 nêu temp-copy + AC-13 quét công tắc trong script ship |
| P1 | contract | Không AC nào đòi gate THÔNG BÁO rằng một feature được cấp scope hẹp, hay rằng scope hẹp đã che một staleness mà whole-tree sẽ báo. AC-3 đòi im lặng cho feature không khai, AC-5 đòi in cho under-declare — nên đường DUY NHẤT làm yếu gate lại là đường duy nhất không có output | Sau khi backfill xong, reviewer đọc output thấy không có VIOLATION cho feature F. Hai nguyên nhân không phân biệt được: F thật sự không bị ảnh hưởng, HOẶC F được cấp scope hẹp bởi một union `paths` đã drift và không còn nêu code mà PR chạm (đúng Known limit của chính contract: trung thực với diff, sai với eval — "chỉ review bắt được"). Review KHÔNG bắt được, vì output không có gì để review | Thêm AC: feature được cấp scope hẹp → in một dòng nêu tên feature + globs đã scope; và khi scope hẹp che một staleness → dòng đó nói rõ. Đo ở cả fixture guard (khẳng định text cho ca out-of-scope, và VẮNG cho feature không khai để AC-3 còn đúng) lẫn real-repo | **fixed:** AC-14 + E15 |

Không finding nào lật quyết định đã ghi trong `decisions.jsonl`.
