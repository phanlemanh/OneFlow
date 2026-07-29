## Trong hợp đồng

- **feature_scope() attributes a `paths:` line to an eval by "nearest `- id:` above", so an unrelated nested key satisfies the completeness check**
  file: `/Users/manh-macmini/dev/oneflow/scripts/pre-merge-check.sh:510`
  severity: medium
  AC: AC-4
  detail: The completeness proof at lines 505-522 establishes "total paths lines == n_evals" and "no eval owns two", where ownership is computed as the last `- id:` line number *above* the paths line. It never checks that the paths line is still inside that eval's block. Any `paths:` key elsewhere in the file that happens to sit at exactly the eval-key column (EI+2) and after the last `- id:` line is attributed to the final eval, giving distinct owners and a balanced total — so a file where one eval declares nothing is reported COMPLETE, and that unrelated key's globs are folded into the union.

  Reproduced by extracting feature_scope() from the shipped gate (same technique run_indent_drift_case uses):

      schema_version: 1
      evals:
        - id: E1
          criterion: AC-1
          paths: ["src/a/**"]
        - id: E2
          criterion: AC-2
      misc:
        sub:
          paths: ["docs/**"]

  → rc=0, union = {docs/**, src/a/**}. E2 declared nothing. The intervening `misc:`/`  sub:` lines sit at indents 0 and 2, so the EI+2 key-grammar check at lines 466-471 never sees them; only the `    paths:` line at EI+2 is examined, and it passes.

  This is precisely the AC-4 failure mode the ownership block's own comment says it exists to refuse ("the union is built from a PARTIAL declaration while the undeclared eval's implicit whole-tree scope is silently dropped"). It fails in the dangerous direction: a narrower-than-truth scope. The same shape reproduces with an unindented eval list (`- id:` at column 0) plus any trailing top-level mapping containing a `paths` key. Fix direction: bound each eval's block (paths line must precede the *next* `- id:` line, and the file must contain no EI+2 `paths:` line outside any eval block) rather than only looking backwards.
  failure_scenario: evals.yaml has two evals where only E1 declares `paths`, plus a sibling mapping `misc: / sub: / paths: ["docs/**"]` whose `paths` key lands at the eval-key column. feature_scope returns rc=0 with union {src/a/**, docs/**} instead of refusing (whole-tree). Narrow scope is granted; any change E2 exercises outside `src/a/**` is silently dropped from the staleness set and the feature reports OK on stale evidence.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Non-English comments and gate output introduced into tracked source (CLAUDE.md / CONTRIBUTING.md: English only)**
  Người dùng thấy gì: Một số ghi chú và thông báo trong công cụ kiểm tra trước khi hợp nhất code đang được viết bằng tiếng Việt thay vì tiếng Anh như quy ước chung của dự án, có thể gây khó hiểu cho người đọc không dùng tiếng Việt.
  file: `scripts/pre-merge-check.sh`
  severity: high
  Đề xuất: new-contract

- **Branch cannot pass its own acceptance-gate CI job: 8 violations, verdict REJECT, evidence stale for 7 signed-off features**
  Người dùng thấy gì: Trên nhánh này, bước kiểm tra tự động trước khi hợp nhất code hiện đang thất bại và sẽ chặn việc hợp nhất; đồng thời bằng chứng phê duyệt của bảy tính năng đã được chấp thuận trước đó đang bị đánh dấu là lỗi thời.
  file: `_acceptance/stale-scope-by-paths/evidence-report.md`
  severity: high
  Đề xuất: new-contract

- **biome.json added to t1_skip_globs with a rationale that contradicts the config's own lint executor**
  Người dùng thấy gì: Lý do miễn trừ cho một tệp cấu hình định dạng code có thể không chính xác, khiến những thay đổi ảnh hưởng đến việc kiểm tra chất lượng code không được phát hiện là cần xem xét lại.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: new-contract

- **check-stale-real-repo.sh pins a HEAD_SHA that exists only on a feature branch, not on main**
  Người dùng thấy gì: Một bài kiểm tra tự động đang phụ thuộc vào một điểm mã nguồn chỉ tồn tại trên một nhánh phụ; nếu nhánh đó bị xoá sau khi hợp nhất (việc thường xảy ra), bài kiểm tra này sẽ luôn báo lỗi dù không có vấn đề thực sự.
  file: `scripts/acceptance/check-stale-real-repo.sh`
  severity: medium
  Đề xuất: new-contract

- **New executor values in config.yaml are unquoted while every pre-existing one is double-quoted**
  Người dùng thấy gì: Một số dòng cấu hình mới thiếu dấu ngoặc kép nhất quán với các dòng cũ, có thể khiến giá trị bị cắt bớt ngoài ý muốn nếu sau này ai đó thêm ký tự # vào đó.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **A declared scope made only of t1-exempt/_acceptance globs is permanently vacuous, and scope_has_any_match asks its question in the wrong namespace**
  Người dùng thấy gì: Trong một số cách khai báo phạm vi ảnh hưởng, một tính năng có thể bị coi là 'không còn gì đáng chú ý thay đổi' mãi mãi dù mã nguồn thực sự đã thay đổi, khiến bằng chứng phê duyệt cũ không được cảnh báo là lỗi thời.
  file: `/Users/manh-macmini/dev/oneflow/scripts/pre-merge-check.sh`
  severity: high
  Đề xuất: new-contract

- **Cross-layer pairing awk: block-open key alphabet `[a-z_]+` leaks the previous eval's `layer:` forward, contradicting its own comment**
  Người dùng thấy gì: Một số nhãn phân loại nội bộ trong công cụ kiểm tra trước khi hợp nhất code có thể bị gán nhầm sang một hạng mục khác, làm sai lệch báo cáo đối chiếu giữa các lớp của một tính năng.
  file: `/Users/manh-macmini/dev/oneflow/scripts/pre-merge-check.sh`
  severity: medium
  Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 3/8 lỗi rơi vào file không bộ đo nào phủ (_acceptance/stale-scope-by-paths/evidence-report.md, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.