# Review Findings: noi-thuoc-tai-lieu-vao-ci — round 1

## Trong hợp đồng

- **exit-propagates asserts only "exit != 0" with no positive control — 2 of 7 needles pass vacuously**
  file: `scripts/ci/check-gate-guards-job.sh:397`
  severity: high
  AC: AC-2
  source: bugs
  detail: The new `exit-propagates` mode builds a probe tree (`for entry in *` + `cp -R scripts`), replaces one script with an `exit 1` stub, runs the extracted `run:` string, and passes if `rc != 0`. There is no green half proving the command exits 0 in that same tree unstubbed, so any command that already fails in the probe tree passes the check without measuring anything.

  Two of the seven needles are in exactly that state today (reproduced on this tree by rebuilding the identical probe tree and running the commands WITHOUT the stub):

    rc=1 :: bash scripts/plugins/check-live-docs-manifest-synced.sh orphans origin/main
            FAIL: cannot read config/official-plugins.json at origin/main
    rc=1 :: node scripts/ci/check-eval-filters.mjs
            Cannot find module '/@fs/.../add-media-library-node.test.tsx'

  The `orphans` needle fails because `for entry in *` does not glob dotfiles, so `.git` is never linked into `$stub_root/t` and `git show origin/main:...` cannot resolve. The eval-filters needle fails because vitest cannot resolve `src/**` from the probe tree.

  The sibling `teeth` mode in the same file handles both cases explicitly — it appends `--vitest-root "$repo_root"` for check-eval-filters.mjs and names `check-live-docs-manifest-synced.sh orphans` in TEETH_SKIP with a stated reason — and its header comment states the rule: "a red-only assertion cannot tell 'the guard caught the drift' from 'the command is simply broken'." `exit-propagates` does neither, and its summary line (`OK: cả 7 lệnh trong job đều truyền mã thoát khác 0 …`, line 405) over-claims: the relation is proven for 5 of 7. Fix by adding an unstubbed control run per needle (require rc==0 before crediting the stubbed rc!=0), plus a named skip list like TEETH_SKIP for needles the probe tree cannot host.

  rationale: AC-2 tự đặt đúng tiêu chuẩn bị vi phạm ở đây ("Một thước không thể đỏ còn tệ hơn không có thước: nó báo cáo một sự an toàn nó không cung cấp"); finding chứng minh 2/7 needle của chính phép đo AC-2 (exit-propagates) đỏ ngay cả không bị stub, nên không chứng minh được quan hệ mà AC-2 yêu cầu.

- **Assertion âm-tính-một-mình: chế độ `exit-propagates` không có đối chứng dương — 2/7 lệnh đã thoát khác 0 trong cây thăm dò kể cả khi KHÔNG bị stub**
  file: `scripts/ci/check-gate-guards-job.sh:397`
  severity: high
  AC: AC-2
  source: measurement
  detail: Vòng lặp ở dòng 369-400 dựng cây thăm dò (symlink mọi mục top-level, chép `scripts/`, ghi đè MỘT script bằng stub `exit 1`) rồi khẳng định DUY NHẤT một điều: `[ "$rc" -ne 0 ]`. Không có lượt chạy đối chứng nào với script THẬT trong CÙNG cây ấy, và không ghim thông điệp/nguồn gốc của mã thoát — nên "khác 0" không chứng minh được mã thoát đến từ stub.

  Đo thật (dựng lại đúng cây thăm dò của chế độ này, chạy lệnh rút được mà KHÔNG stub):
    rc=0  bash scripts/roadmap/check-roadmap-fresh.sh
    rc=0  node scripts/ci/check-product-map.mjs
    rc=1  node scripts/ci/check-eval-filters.mjs        <- xanh (rc=0) trên kho thật
    rc=0  ... check-live-docs-manifest-synced.sh readme
    rc=0  ... check-live-docs-manifest-synced.sh claude
    rc=1  ... check-live-docs-manifest-synced.sh orphans origin/main  -> "FAIL: cannot read config/official-plugins.json at origin/main"
    rc=0  ... check-live-docs-manifest-teeth.sh

  Vậy với hai needle (`check-eval-filters.mjs` và `synced.sh orphans`), vế đỏ của chế độ này là ĐỎ VÌ MÔI TRƯỜNG (cây mktemp không có `.git`; thiếu ngữ cảnh của eval-filter), không vì stub — nhưng chế độ vẫn in `OK: cả 7 lệnh trong job đều truyền mã thoát khác 0` (dòng 406) và `checked` vẫn đếm đủ 7. Đúng lớp lỗi mà chính file này khai ở chế độ `teeth`: `TEETH_SKIP` (dòng ~57) nêu đích danh `orphans` bị bỏ qua VÌ "cay tham do la thu muc mktemp khong co .git", còn `teeth` bắt buộc có vế xanh trên cây lành trước khi tin vế đỏ (dòng 222-234). Chế độ mới lặng lẽ gộp cả `orphans` vào mà không khai bỏ qua và không có vế xanh tương ứng. Đây là phép đo chịu lực của E2/AC-2 (`ntlc_exit_propagates`), tức lời hứa "không gì nuốt mã thoát" đang được chứng minh bằng 5/7 lệnh có nghĩa và 2/7 lệnh vô nghĩa mà đầu ra không phân biệt được.

  rationale: Bản dịch của cùng finding về exit-propagates; trực tiếp làm thất bại lời hứa "mỗi lượt exit khác 0" (vì quan hệ nhân-quả với stub không được chứng minh) mà AC-2 đặt ra.

- **Đo CHỈ DẪN thay vì ĐẦU RA: chế độ `shape` grep needle trên toàn khối job, nên một dòng COMMENT (hoặc tên step) cũng thoả "có step chạy nó"**
  file: `scripts/ci/check-gate-guards-job.sh:72`
  severity: medium
  AC: AC-1
  source: measurement
  detail: Comment ngay trên `GUARD_NEEDLES` (dòng 35-37, mới thêm ở diff này) tuyên: "Needles are matched against the `run:` lines of the acceptance-gate job", và E1 của `noi-thuoc-tai-lieu-vao-ci` phát biểu lời hứa là "đòi mỗi needle trong `GUARD_NEEDLES` có một step CHẠY nó". Nhưng assert thực tế là `printf '%s\n' "$block" | grep -q "$needle"` — khớp bất kỳ dòng nào trong khối, kể cả comment và `- name:`. Hai chế độ khác (`teeth`, `exit-propagates`) mới thật sự rút từ `run:` bằng `sed -n "s|^[[:space:]]*run:...`.

  Đo xác nhận: chép `.github/workflows/ci.yml`, XOÁ hẳn step
    `- name: READMEs match the plugin manifest` / `run: bash scripts/plugins/check-live-docs-manifest-synced.sh readme`
  và thay bằng một dòng comment `# TODO: re-enable bash scripts/plugins/check-live-docs-manifest-synced.sh readme` — logic của `shape` vẫn tìm thấy needle và VẪN XANH (chỉ dòng 35 của khối là comment). Tức ô đo AC-1 đang đo văn bản chỉ dẫn trong YAML chứ không đo step chạy được.

  Phụ trợ cùng chỗ: `shape` chỉ lặp trên chính mảng `GUARD_NEEDLES` — không có phép đo nào ghim rằng mảng ấy PHẢI chứa bốn lệnh mới. Xoá đồng thời một needle khỏi mảng và step tương ứng khỏi `ci.yml` thì `shape`/`teeth`/`exit-propagates` đều xanh (bất biến `KÊ = PHÁ + BỎ QUA` chỉ đỏ nếu `TEETH_SKIP` không được cắt theo).

  rationale: AC-1 đòi phép đo phải xác nhận CÓ STEP CHẠY hai thước (đọc theo thụt đầu dòng, không theo tên, "để đổi tên không giấu được"); finding chứng minh chế độ shape (cơ chế đo AC-1) chỉ khớp chuỗi văn bản bất kỳ trong khối, kể cả comment thay cho step thật — nên không thật sự đo được điều AC-1 yêu cầu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Nhánh bị chính cổng của repo chặn merge — job acceptance-gate sẽ ĐỎ**
  Người dùng thấy gì: Nhánh này có thể bị hệ thống kiểm tra tự động chặn không cho gộp vào cho tới khi hồ sơ nghiệm thu được người phụ trách ký duyệt chính thức.
  file: `_acceptance/noi-thuoc-tai-lieu-vao-ci/contract.md`
  severity: high
  Đề xuất: known-limits

- **Bằng chứng đã ký của dang-ky-fork-openai không còn tái lập được tại chính verified_commit của nó**
  Người dùng thấy gì: Báo cáo nghiệm thu đã được duyệt trước đó của một tính năng khác hiện đang nêu một kết quả kiểm tra không còn đúng với thực tế, khiến người đọc báo cáo dễ tin nhầm vào một trạng thái đã cũ.
  file: `_acceptance/dang-ky-fork-openai/evals.yaml`
  severity: medium
  Đề xuất: new-contract

- **CLAUDE.md ghi sai số ca của bộ răng live-docs (7 vs 9) ngay trong hằng-số-ràng-buộc mới**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ hiện ghi sai số lượng ca kiểm tra của một bộ thử, có thể khiến người sau này chỉnh sai con số khi bổ sung kiểm tra mới.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **18 dòng run-log vòng 3 mang sha không tồn tại và evals_hash bị cắt ngắn**
  Người dùng thấy gì: Một số dòng nhật ký của báo cáo đã duyệt (thuộc tính năng khác) ghi mã phiên bản không có thật, khiến không thể xác minh lại chính xác bản mã đã được kiểm tra khi đó.
  file: `_acceptance/dang-ky-fork-openai/run-log.jsonl`
  severity: medium
  Đề xuất: known-limits

- **Header của guard mới còn giữ con số orphan sai (4) mà hồ sơ đã tự sửa thành 3**
  Người dùng thấy gì: Một dòng chú thích trong mã nguồn ghi sai số lượng tệp biểu tượng còn tồn đọng; đây chỉ là ghi chú, không ảnh hưởng đến việc kiểm tra thực tế.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: low
  Đề xuất: known-limits

- **exit-propagates ghi log chẩn đoán vào đường /tmp cố định rồi không ai đọc**
  Người dùng thấy gì: Khi bước kiểm tra tự động này báo lỗi, người vận hành không được hướng dẫn nơi xem chi tiết, gây khó khăn khi truy tìm nguyên nhân.
  file: `scripts/ci/check-gate-guards-job.sh`
  severity: low
  Đề xuất: known-limits

- **CLAUDE.md advertises 7 teeth cases / PARTIAL: n/7; the script has 9 and prints PARTIAL: n/9**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ hiện ghi sai số lượng ca kiểm tra của một bộ thử, có thể khiến người sau này chỉnh sai con số khi bổ sung kiểm tra mới.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **orphans-mode header comment says four pre-existing orphan icons; the measurement reports three**
  Người dùng thấy gì: Một dòng chú thích trong mã nguồn ghi sai số lượng tệp biểu tượng còn tồn đọng; đây chỉ là ghi chú, không ảnh hưởng đến việc kiểm tra thực tế.
  file: `scripts/plugins/check-live-docs-manifest-synced.sh`
  severity: low
  Đề xuất: known-limits

- **Assert "chuỗi có mặt" thay cho QUAN HỆ: E4/E6 ghim "39 id rút được TRÊN TỪNG README" trong khi thước chỉ in con số lấy từ MANIFEST, không phải từ phép rút**
  Người dùng thấy gì: Báo cáo kiểm tra README của một tính năng khác có thể hiển thị đúng con số dự kiến một cách trùng hợp, ngay cả khi phép trích xuất dữ liệu bị lỗi và thực chất không đếm được gì, khiến người đọc tin nhầm là đã kiểm tra kỹ.
  file: `_acceptance/dang-ky-fork-openai/evals.yaml`
  severity: medium
  Đề xuất: new-contract

- **Assert "chuỗi có mặt" thay cho QUAN HỆ: E5 ghim literal `OK: 7/7 ca` trong khi bộ răng ở HEAD chạy 9 ca và in `OK: 9/9 ca`**
  Người dùng thấy gì: Báo cáo nghiệm thu đã duyệt của một tính năng khác đang khẳng định một kết quả kiểm tra cụ thể mà hệ thống hiện tại không còn tạo ra nữa, khiến bằng chứng đã ký không còn phản ánh đúng hành vi thực tế.
  file: `_acceptance/dang-ky-fork-openai/evals.yaml`
  severity: medium
  Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 7/13 lỗi rơi vào file không bộ đo nào phủ (_acceptance/noi-thuoc-tai-lieu-vao-ci/contract.md, _acceptance/dang-ky-fork-openai/evals.yaml, CLAUDE.md, _acceptance/dang-ky-fork-openai/run-log.jsonl) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.