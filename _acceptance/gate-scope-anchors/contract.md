---
schema_version: 1
feature: Gate 0.6 — cùng-không-gian cho scope paths + neo lịch sử cho eval per-PR
slug: gate-scope-anchors
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, scripts]
status: signed-off
approved_by: phanlemanh@gmail.com
approved_at: 2026-08-04T12:36:51Z
time_human_minutes:
  gate1: 5
  gate2: 10
# The merge commit that carried this feature into main (PR #43).
# scripts/acceptance/own-range.sh turns this into the commit range and commit set
# this feature owns, so any eval that asks about "my pull request" keeps grading
# this feature's own diff when re-run on a later branch. Filled once at ship time,
# per _acceptance/gate-scope-anchors/.
landed_merge: 7976bd8
---

# Acceptance Contract: gate-scope-anchors

<!-- 12 tiêu chí (AC-1..AC-12) / 13 eval. -->


## Context

Hạng mục 0.6 của hàng đợi (mở tại Cổng 2 của `stale-scope-by-paths`, 29/07).
Một luật, hai lần vi phạm đã có tên: *hỏi câu hỏi ở một không gian, dùng câu
trả lời ở không gian khác*.

- **Nửa (a), fail-open:** `scope_has_any_match()` hỏi trên toàn cây tracked,
  `stale_files()` trả lời trên cây đã lọc exempt — scope toàn glob t1-exempt
  được cấp scope hẹp rồi rỗng vĩnh viễn (biến thể 5, HIGH, ghi trong
  known-limits của `stale-scope-by-paths` kèm lệnh "KHÔNG vá lẻ").
- **Nửa (b), fail-closed:** eval hỏi "PR **của tôi** có đụng X không" nhưng
  chạy ở nhánh sau thì chấm bài PR người khác. Baseline repro trên
  `feat/compose-overlay` (04/08, exit code thật, từng guard):
  `check-no-config-drift` **exit 1** · `check-no-t3-drift` **exit 1** ·
  `check-workflow-drift` **exit 0** (compose-overlay không đụng
  `.github/workflows` nên nó chưa từng đỏ — vẫn anchored cho đúng ngữ nghĩa,
  nhưng khả-năng-đỏ của nó chứng minh bằng fixture, không bằng lịch sử sống)
  · `check-run-jobs` (họ B2) **exit 2**. Ba hồ sơ `ci-actions-bump` /
  `dependency-refresh-2026-07` / `oneflow-plugin-prefix` không chạy lại
  trung thực được, đang chặn merge.

**Neo đã xác minh trước Cổng 1** (đều là merge commit thật, `rev-parse ^2`
OK): `ci-actions-bump → 8477f8a` (PR #17) · `dependency-refresh-2026-07 →
4d89b58` (PR #16) · `oneflow-plugin-prefix → dd39da8` (PR #18). Không có ca
squash-landed trong ba hồ sơ mục tiêu; ngữ nghĩa cho squash-merge tương lai
nằm ở AC-6 (fail loud, không đoán).

Ngữ nghĩa đã chốt với Manh (04/08): sau merge, eval per-PR mang nghĩa **sự
thật lịch sử** — neo vào PR của chính nó qua bộ giải duy nhất
`scripts/acceptance/own-range.sh` đọc `landed_merge:` từ frontmatter
contract. Thiết kế đầy đủ:
[2026-08-04-gate-scope-anchors-design.md](../../docs/superpowers/specs/2026-08-04-gate-scope-anchors-design.md).

**Quy tắc chung 1 (kế thừa `stale-scope-by-paths`):** mọi guard sửa hoặc
thêm trong hợp đồng này phải chứng minh **đỏ được khi lỗi quay lại** — xanh
khi code đúng chưa bao giờ là bằng chứng (16/16 eval của 0.5 từng xanh ở cả
bốn trạng thái code).

**Quy tắc chung 2 (kế thừa họ `gh-run-lib`):** "không nhìn được" là exit 2,
khác hẳn "nhìn rồi và ổn" (exit 0) — không đường lỗi nào của bộ giải hay
guard được phép đọc thành xanh.

## Criteria

### Nửa (a) — không gian tên đường dẫn

- AC-1: Given một feature khai `paths` mà union CHỈ khớp file
  t1-exempt/`_acceptance/**` (vd `["docs/**"]`), When pre-merge-check chạy,
  Then scope hẹp bị TỪ CHỐI với NOTE nêu lý do và staleness áp whole-tree —
  không còn đường "scope rỗng vĩnh viễn = không bao giờ stale".
- AC-2: Given bốn biến thể fail-open đã sửa ở 0.5 (namespace
  ls-files-vs-diff · prefix top-level · đếm-tổng · quy-chủ-nhìn-lùi), When
  perturbation in-process tái tạo từng lỗi, Then harness ĐỎ cho từng biến
  thể — guard còn răng, không vacuous.
- AC-3: Given một khai báo `paths` hợp lệ trỏ code thật (vd `sdk/**`), When
  pre-merge-check chạy, Then scope hẹp VẪN được cấp và NOTE "narrow
  staleness scope applied" in như hiện tại — bản sửa không từ chối nhầm
  người ngay thẳng (suppression half của AC-1).

### Nửa (b) — bộ giải neo

- AC-4: Given contract có `landed_merge: <sha merge hợp lệ>`, When gọi
  `own-range.sh <slug>`, Then in `range_from=<sha>^1`, `range_to=<sha>` và
  `commits=` đúng bằng `git rev-list <sha>^1..<sha>^2` — kiểm trên merge
  commit THẬT của PR #17 (`8477f8a`), tập commit phải chứa cả `60c4797`
  (run CI xanh) lẫn `b48699c6` (hai run dispatch) — hai sha KHÁC nhau, đó
  là lý do neo là tập chứ không phải một sha.
- AC-5: Given contract KHÔNG có `landed_merge`, When gọi bộ giải, Then
  range là `merge-base(HEAD, main)..HEAD` — trùng từng byte với hành vi
  hiện tại của feature chưa merge; vòng verify đầu đời không đổi gì.
- AC-6: Given `landed_merge` hỏng (sha không tồn tại · không phải merge
  commit · trỏ commit thường), When gọi bộ giải, Then exit 2 với thông điệp
  nêu đúng lỗi, và guard tiêu thụ cũng exit 2 — KHÔNG BAO GIỜ xanh (quy
  tắc chung 2).

### Nửa (b) — guard tiêu thụ

- AC-7: Given ba guard B1 (`check-no-config-drift` · `check-no-t3-drift` ·
  `check-workflow-drift`) đã anchored và `ACCEPTANCE_SLUG` trỏ feature đã
  merge, When chạy trên `feat/compose-overlay` hôm nay, Then cả ba exit 0 —
  trong đó HAI guard đầu là ca repro sống (baseline exit 1 đã xác lập),
  guard thứ ba chỉ khẳng định anchored-không-phá (baseline của nó vốn là
  exit 0); AND Given một fixture mà khoảng PR của chính nó CÓ đụng đường
  cấm, Then guard tương ứng exit 1 — khả-năng-đỏ chứng minh bằng fixture
  cho CẢ BA, không dựa lịch sử sống (quy tắc chung 1).
- AC-8: Given `ci-actions-bump` đã có neo, When chạy `check-run-jobs` +
  `check-gate-plumbing` + `check-dispatch-run docker|desktop` trên nhánh
  này, Then cả bốn tìm được run lịch sử qua TẬP COMMIT của bộ giải (không
  tra theo tên nhánh) và exit 0 — kể cả hai run dispatch nằm ở sha khác
  sha của run CI.
- AC-9: Given `check-ghcr-untouched` anchored, When chạy trên nhánh này,
  Then nửa quyết định (log của run dispatch) giữ nguyên logic, nửa đối
  chứng registry giới hạn trong cửa sổ `[createdAt run, committer-date
  landed_merge]`, và exit 0 cho `ci-actions-bump` — khẳng định lịch sử
  đóng, không trôi theo hiện tại. *(Điều kiện revisit: nếu chi phí vượt,
  hạ thành known-limit có chữ ký — đã ghi ledger.)*
- AC-10: Given một neo hợp lệ mà GitHub KHÔNG còn run nào trong tập commit
  (retention/xoá), When chạy eval B2 bất kỳ, Then exit 2 "không nhìn được"
  — vắng bằng chứng không được đọc thành xanh (suppression half của AC-8).

### Tích hợp & tương thích ngược

- AC-11: Given `landed_merge` đã backfill cho cả ba hồ sơ mục tiêu
  (`8477f8a` / `4d89b58` / `dd39da8`) và command string trong
  `_acceptance/config.yaml` đã truyền `ACCEPTANCE_SLUG`, When chạy phần
  OFFLINE của guard suite ba hồ sơ trên nhánh này (bộ giải giải cả ba neo +
  ba guard B1), Then không guard nào đỏ vì lý-do-đo-nhầm-PR. Phần guard
  mạng của `ci-actions-bump` do AC-8/AC-9 phủ riêng — eval của AC-11 KHÔNG
  gộp exit code mạng vào một khẳng định offline (bài học
  [stale-scope-by-paths#F1]: gộp nhiều ca về một exit code với phân biệt
  chỉ nằm trong prose).
- AC-12: Given `ACCEPTANCE_SLUG` VẮNG (đường không-neo — mọi feature chưa
  merge, và mọi lời gọi hiện có), When chạy guard B1 trên fixture CÓ vi
  phạm, Then exit 1 đúng như hành vi hôm nay; và When gọi helper tra-run
  của `gh-run-lib` không neo, Then nó phân giải đúng HEAD hiện tại như
  `head_sha()` cũ — đường không-neo giữ nguyên TỪNG BYTE, không được biến
  thành range rỗng mà mọi PR đang mở đều xanh oan (fail-open đúng họ lỗi
  hợp đồng này diệt).

## Coverage

Quét Zwicky 3 trục (04/08):

- **Trục không gian câu hỏi:** glob-vs-cây-đã-lọc (AC-1..3) · khoảng-diff
  (AC-4..7) · tập-run-CI (AC-8, AC-10) · cửa-sổ-registry (AC-9). Thước CE:
  5 biến thể nội bộ có tên trong known-limits 0.5 + 3 script đã repro đỏ
  bằng exit code thật + tiền lệ `[NGÀNH: Bazel/ccache/Turborepo]` đã dẫn
  trong contract 0.5 và cache.
- **Trục chiều lệch:** fail-open (AC-1, AC-2, AC-12) · fail-closed oan
  (AC-7, AC-8, AC-9) · fail-closed đúng phải giữ (AC-6, AC-10, AC-3).
- **Trục thời điểm vòng đời:** PR đang mở — hành vi phải giữ nguyên từng
  byte, cả bộ giải LẪN guard tiêu thụ (AC-5, AC-12) · sau merge trên nhánh
  khác — ca đang chặn (AC-7..9, AC-11) · lịch sử hỏng/neo không giải được
  — fail loud (AC-6, AC-10).

## Out of scope

- `check-manifest-unmoved.sh` / `check-overlay-registration.sh` — đã là
  state-assertion, thuộc gói nợ "lần fork thật đầu tiên".
- Cơ chế carry-forward P1/P2/P3 của vòng verify.
- Khai `paths` bổ sung cho các feature whole-tree (việc của vòng re-verify
  sau hợp đồng này, có thể làm hoặc không).
- 0.7 — English-only vs văn bản vendor của kit.

## Known limits (chấp nhận tại Cổng 2, Manh 2026-08-04)

Từ review-findings.md, các mục ký nhận là hạn chế đã biết — ship bản này:

- `head_sha` / `run_json` (có trước hợp đồng này) vẫn dùng `exit` trần trong
  ngữ cảnh subshell; an toàn vì mọi consumer khai `set -e`, và E6 nay kiểm
  chính bất biến đó.
- Nửa đối chứng registry của E11 là "không nhìn được" với token hiện tại
  (thiếu `read:packages`); verdict tựa trên nửa quyết định bằng log.
- Node `compose-overlay` là N→1 nhưng nằm ở `transfer/` — đã ghi trong
  known-limits của chính hồ sơ compose-overlay.
- Thêm op đẩy một đối tượng dùng chung cấp module vào state (chưa gây lỗi).
- Bình luận tiếng Việt trong `lib/evidence-core.js`; CLAUDE.md mô tả
  `check-manifest-unmoved.sh` đã lỗi thời; chú thích `alsoAccepts` nói nhẹ
  hơn thực tế; header vendor trong `scripts/ui-capture.mjs`.
- `check-python-gen-clean.sh` để file bẩn trong cây khi thất bại.

Các mục đề xuất **hợp đồng mới** (không ship trong 0.6): chặn biên số ở
op-form, `<select>` i18n, phản hồi khi từ chối đổi đích kết nối, ghim SDK
trong `run-overlay-plugin-tests.sh`, cache clone dùng chung thư mục cố định,
và chuyện `pnpm-workspace.yaml` chưa commit.

## Notes

**Chi phí khai trước (Cổng 1):** code của hợp đồng này chạm
`scripts/pre-merge-check.sh` + `scripts/acceptance/**` (scope của
`stale-scope-by-paths`) và `scripts/{plugins,deps,ci}/**` → sau khi nó
xong, `stale-scope-by-paths` + 5–6 hồ sơ whole-tree vừa ký sẽ stale và cần
một vòng re-verify + MỘT lượt ký cuối cho cả loạt. Nhóm cache L1–L4 thoát
nhờ scope hẹp. Eval B2 phụ thuộc mạng + `gh` auth (tiền lệ: guard
clone-plugin của compose-overlay); hết retention run của GitHub thì exit 2
là hành vi đúng.
