## Trong hợp đồng

### Teeth harness: positive control (green_control) failure is swallowed — case still reports PASS / exit 0
- file: `scripts/fork/check-fork-identity-teeth.sh:315`
- severity: high
- source: bugs
- AC: AC-7

Detail: run_one invokes each case as `if "case_$name"; then` (line 315). In bash, a function executed as an `if` condition runs with `set -e` ignored for its ENTIRE body, so the `return 1` from green_control (lines 92-98) does not stop the case — the perturbation is applied anyway, the guard goes red (for the perturbation's reason on top of whatever was already red), expect_red finds its token, and the case is counted PASS. 24 of the 28 cases call `green_control` bare (e.g. lines 118, 147, 160, 240); only conf-remote-lech / suite-key-dangling / debt-table-missing use an explicit `|| { ...; return 1; }`. Reproduced: `FORK_IDENTITY_CONF=<conf with repo=ai-do/kho-khac> bash scripts/fork/check-fork-identity-teeth.sh --case image-upstream` prints `FAIL CASE image-upstream: đối chứng dương đỏ trên fixture chưa phá` on stderr yet `CASE image-upstream: PASS` on stdout, exit 0; same for `--case hit-outside`. This is exactly the borrowed-red class the file header says one-case-one-assertion exists to exclude: the `mhb_teeth_*` evals and the CI step 'Fork identity guard still has teeth' cannot distinguish 'guard caught the perturbation' from 'fixture was already red'. Mitigation today is only that the sibling CI step runs check-fork-identity.sh on the same tree. Fix: `green_control <case> || return 1` in every case (or run the case outside an `if`: `"case_$name"; rc=$?` under `set +e`).

Rationale: AC-7 đòi mọi ca của check-fork-identity-teeth.sh thật sự xanh và mỗi ca đỏ phải ghim đúng thông điệp của đúng phép kiểm nó phá; ở đây phần lớn ca báo PASS dù đối chứng dương (fixture ban đầu) đã hỏng, tức PASS giả không phản ánh đúng phép kiểm.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Community links redirect to GitHub Discussions, but Discussions is disabled on phanlemanh/OneFlow**
  Người dùng thấy gì: Nút liên hệ cộng đồng dẫn tới trang Thảo luận trên GitHub nhưng trang đó chưa được bật cho kho này, nên người dùng bấm vào hiện đang gặp trang báo không tồn tại.
  file: `.github/ISSUE_TEMPLATE/config.yml`
  severity: medium
  Đề xuất: known-limits

- **check-fork-identity.sh silently falls back to the real conf/allow-list when an explicit override path does not exist**
  Người dùng thấy gì: Khi ai đó cấu hình sai đường dẫn tuỳ chỉnh cho công cụ kiểm tra định danh, công cụ âm thầm chuyển sang đo dữ liệu gốc mà không báo hiệu gì, khiến kết quả kiểm tra trông có vẻ đúng dù không đo đúng thứ được yêu cầu.
  file: `scripts/fork/check-fork-identity.sh`
  severity: medium
  Đề xuất: known-limits

- **fixture() leaks temp dirs in looping cases — only the last probe of a case is cleaned**
  Người dùng thấy gì: Công cụ kiểm tra nội bộ để sót lại một số thư mục tạm trên máy sau khi chạy; không ảnh hưởng tới phần mềm mà người dùng cuối thấy.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: low
  Đề xuất: wont-fix

- **Hình 3 — E10/E5 hứa QUAN HỆ (tên gói đọc từ pyproject) nhưng ca răng chỉ assert chuỗi vắng; guard ghim hằng `oneflow-sdk` vẫn qua răng**
  Người dùng thấy gì: Nếu sau này có người vô tình ghi cứng tên gói phần mềm thay vì lấy đúng từ nơi khai báo chính thức, bộ kiểm tra tự động hiện nay sẽ không phát hiện ra sai sót đó.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 — E7/E8 expected ghim những phép kiểm mà cmd không hề chạy (`--case bogus`, `--selftest-fail`, gỡ phần tử CASES → 27/27, gỡ needle khỏi GUARD_NEEDLES); verifier chỉ có thể «đạt» bằng cách đọc mã nguồn**
  Người dùng thấy gì: Một số lời hứa kiểm tra tự động trong hồ sơ nghiệm thu hiện chỉ được xác nhận bằng cách đọc mã nguồn chứ chưa thật sự được máy chạy thử, nên vài kịch bản đó thiếu bằng chứng chạy độc lập.
  file: `_acceptance/mo-hoa-b01/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (gần Hình 1) — check-suite-key.sh khẳng định «executor GỌI script» bằng phép chứa-chuỗi trên văn bản lệnh; executor chỉ NHẮC tên script vẫn xanh**
  Người dùng thấy gì: Bộ kiểm tra xác nhận một bước máy có thật sự chạy công cụ kiểm tra định danh chỉ bằng cách tìm tên công cụ đó xuất hiện trong dòng lệnh, nên một dòng lệnh chỉ nhắc tên mà không chạy thật vẫn có thể được coi là hợp lệ.
  file: `scripts/fork/check-suite-key.sh`
  severity: medium
  Đề xuất: wont-fix

- **Hình 6 (gần nhất) — răng ghim cứng định danh fork của tác giả `phanlemanh/OneFlow` ở ba ca dù đã suy REPO_RAW từ conf**
  Người dùng thấy gì: Một vài kịch bản kiểm tra nội bộ vẫn ghi cứng tên kho của tác giả thay vì đọc từ cấu hình, nên nếu chạy trên một bản sao đã đổi sang kho khác, các kịch bản đó có thể báo sai mà không phải do lỗi thật của công cụ.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: low
  Đề xuất: wont-fix

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ.

### Hình 5 — E6 hứa ba dòng miễn trừ tối thiểu CÓ TÊN («không phải một con số N») nhưng case_clean assert đếm N=3 + một tên; hai dòng desktop-release không được ghim, vế đỏ `miễn trừ tối thiểu vắng` không có ca răng
- file: `scripts/fork/check-fork-identity-teeth.sh:114`
- severity: medium
- source: measurement

Detail: E6 expected (evals.yaml:89-91) liệt kê ba dòng có tên: `NOTICE.md|fork of…`, `.github/workflows/desktop-release.yml|app\.tongflow\.com`, `.github/workflows/desktop-release.yml|TongFlow-(mac|win)` và nhấn «không phải một con số N». case_clean dòng 113-114 chỉ `grep -c '^miễn trừ tối thiểu:'` rồi `[ $n -eq 3 ]`, dòng 115 grep đúng MỘT tên (`NOTICE.md|`). Đã tái lập trên bản sao HEAD: đổi MIN_EXEMPT[2] trong guard (dòng 142) từ `desktop-release.yml|TongFlow-(mac|win)` sang `CLAUDE.md|app\.tongflow\.com` (một dòng allow-list khác) → `CASE clean: PASS`. Guard dòng 136-138 tự ghi «A count alone cannot tell attribution kept from something else exempted» — răng lại đo đúng bằng count. Thêm nữa: ba dòng có tên nằm trong `$probe/.out` (bị rm ở cleanup), stdout của `--case clean` chỉ có `CASE clean: PASS`, nên ô đo E6 (mhb_teeth_ratchet, config.yaml:379) cũng không quan sát được chúng. Nhánh đỏ `fail "miễn trừ tối thiểu vắng"` (guard dòng 152) không có ca nào trong CASES phá tới.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
