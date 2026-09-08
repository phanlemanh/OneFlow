# Review Findings: hai-duong-chay-mot-venv (round 3)

## Trong hợp đồng

### The guard's own CI-wiring assertion (AC-11) silently skips when ci.yml is absent, and the teeth suite does not cover that path
- file: `scripts/plugins/check-venv-layout-pinned.sh:102`
- severity: low
- AC: AC-11
- source: bugs

The AC-11 block is wrapped in `if [ -f "$CI" ]; then ... fi`. When `.github/workflows/ci.yml` is missing or has been moved/renamed, the whole "is this guard actually wired into CI?" check is skipped and the script still prints OK and exits 0 — the silent-green the file's own header says it exists to end.

The teeth suite does not catch it: `c_ci_drop` rewrites the `run:` line to `run: true` but leaves the file in place, so the deletion/rename case is untested. A `[ -f "$CI" ] || { echo "FAIL: missing $CI"; exit 1; }` (matching how `$PY` and `$TS` are handled at line 22-24) plus a twelfth teeth case that `rm`s the file would close it.

Rationale: AC-11's own contract text says its purpose is to make the CI-wiring assertion fail-closed against future drift; a demonstrated silent skip when ci.yml is missing is a direct failure of that stated guarantee.

### Hình dạng 5 — tuyên quét LỚP fail-open nhưng ma trận chiều đỏ thiếu ô «ci.yml vắng mặt»: guard AC-11 tự tắt và vẫn xanh
- file: `scripts/plugins/check-venv-layout-pinned.sh:102`
- severity: high
- AC: AC-11
- source: measurement

Guard mở đầu bằng học thuyết fail-closed (dòng 8-9: «a side that yields nothing is an error, not a match») và ép đúng điều đó cho hai phía Python/TS: thiếu tệp → `exit 1` (dòng 22-25), trích ra rỗng → `exit 1` (dòng 39-49). Nhưng khối AC-11 ở dòng 102 lại bọc trong `if [ -f "$CI" ]; then ... fi` — không có nhánh `else`, không thoát khác 0. ĐÃ ĐO trên cây này: dựng một root chỉ có `sdk/tongflow/engine/plugins.py` + `src/lib/plugins/plugin-python-env.server.ts` (không có `.github/workflows/ci.yml`) rồi chạy `bash scripts/plugins/check-venv-layout-pinned.sh --root <wd>` → in «OK: both runtimes pin the same venv root» và EXIT=0. Tức là xoá/đổi tên tệp workflow — đúng cách mất nối dây mà AC-11 sinh ra để chặn — làm khẳng định AC-11 biến mất trong im lặng.

Bộ răng (`check-venv-layout-teeth.sh`) khai chính lớp này ở đầu tệp: «Cases 5 and 6 are the ones the four value-changing cases cannot see: a guard that extracts NOTHING ... exits 0. That is the failure mode this whole feature is about.» Đúng theo lớp đó thì mỗi nguồn guard đọc phải có MỘT ca xoá-hẳn: Python có `python-const-erased`, TS có `ts-const-erased`, nhưng nguồn thứ ba (ci.yml) chỉ có `ci-step-dropped` (dòng 66) — ca này chỉ đổi `run: bash scripts/plugins/check-venv-layout-pinned.sh` thành `run: true` trên BẢN SAO, tức ca đổi-giá-trị, không phải ca vắng-mặt. Số ca của lớp «fail-open khi nguồn biến mất» là 2 trong khi số phần tử là 3. Chạy `bash scripts/plugins/check-venv-layout-teeth.sh` in 11/11 PASS, EXIT=0 — bộ răng xanh trọn vẹn trong khi lỗ này còn nguyên.

Rationale: Measured evidence shows the exact guard built to enforce AC-11 exits 0 silently when ci.yml is missing, directly contradicting AC-11's stated purpose of making CI-wiring loss turn a PR red.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **sdk/README.md (the PyPI long description) still documents the removed shared-venv model**
  Người dùng thấy gì: Tài liệu SDK công khai xuất bản trên PyPI vẫn mô tả cách cấp phát môi trường cũ (một môi trường dùng chung), nên người dùng cài SDK từ PyPI có thể làm theo hướng dẫn lỗi thời và gặp lỗi cấu hình.
  file: `sdk/README.md`
  severity: medium
  Đề xuất: known-limits

- **Eval E5 still declares 8 teeth cases while the command it runs now prints 11/11**
  Người dùng thấy gì: Một phép đo tự động dùng để xác nhận bộ kiểm chất lượng của tính năng còn hoạt động đúng đang so khớp với một kết quả cũ, nên lần kiểm tiếp theo có thể báo sai kết quả mà không ai để ý.
  file: `_acceptance/hai-duong-chay-mot-venv/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Plugin id from the workflow file is used to build a clone path before any validation**
  Người dùng thấy gì: Nếu tên một plugin trong một luồng công việc được nhập vào không hợp lệ (ví dụ chứa ký tự đường dẫn lạ), hệ thống có thể tải plugin đó về sai vị trí trên máy trước khi phát hiện và chặn tên không hợp lệ.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: new-contract

- **New checkout-install path is cached by SDK version, while the mirrored TS twin caches by pyproject hash**
  Người dùng thấy gì: Khi chạy công cụ từ mã nguồn phát triển (chưa phải bản chính thức), thêm một thư viện phụ thuộc mới cho công cụ có thể không được cài lại cho các plugin đã cấp phát trước đó, khiến plugin lỗi khi chạy mà không có cảnh báo rõ ràng.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: known-limits

- **SDK install is cached on __version__ but the new checkout branch installs content that __version__ does not identify**
  Người dùng thấy gì: Một thay đổi trong các thư viện phụ thuộc nội bộ của công cụ có thể không được áp dụng lại cho các plugin đã cấp phát khi chạy từ mã nguồn phát triển, khiến plugin gặp lỗi khó hiểu khi chạy thay vì được cài đặt lại đúng cách.
  file: `sdk/tongflow/engine/plugins.py`
  severity: high
  Đề xuất: known-limits

- **Both runtimes now write the same per-plugin venv with different cache markers, so each silently overwrites the other's SDK**
  Người dùng thấy gì: Khi hai chương trình khác nhau cùng cấp phát môi trường cho cùng một plugin, mỗi bên có thể ghi đè lên môi trường bên kia vừa cài, khiến plugin chạy với phiên bản công cụ không như mong đợi mà không có cảnh báo.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: known-limits

- **pluginId from workflow JSON is concatenated into a filesystem path and a git URL without the validation the same module now applies to venv paths**
  Người dùng thấy gì: Nếu tên một plugin được nhập vào không hợp lệ, hệ thống có thể tải plugin đó về từ một địa chỉ và ghi vào một vị trí trên máy nằm ngoài khu vực dự kiến, trước khi phát hiện tên không hợp lệ.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: new-contract

- **The now-shared per-plugin venv has no cross-process lock; TypeScript's serialization is in-process only**
  Người dùng thấy gì: Nếu hai chương trình cùng cấp phát môi trường cho cùng một plugin cùng lúc, quá trình cài đặt có thể chồng chéo và để lại một môi trường cài dở, khiến plugin báo lỗi khi chạy mà không rõ nguyên nhân.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: known-limits

- **Legacy-venv detection diverges between the two runtimes: Python uses is_file(), TypeScript uses existsSync()**
  Người dùng thấy gì: Trong một tình huống hiếm khi dữ liệu trên đĩa bị hỏng theo cách bất thường, hai chương trình có thể nhận định khác nhau về việc môi trường cũ cần dọn hay không, khiến toàn bộ môi trường đã cấp phát cho các plugin bị xoá ngoài ý muốn.
  file: `sdk/tongflow/engine/plugins.py`
  severity: low
  Đề xuất: known-limits

- **run_workflow's docstring still documents the removed shared venv, and the new AC-13 guard only inspects plugins.py**
  Người dùng thấy gì: Một đoạn ghi chú giải thích cách hệ thống hoạt động ở một vị trí khác trong mã nguồn vẫn mô tả cách làm cũ đã bị thay thế, có thể khiến người đọc sau này hiểu sai cách hai phần hệ thống phối hợp.
  file: `sdk/tongflow/engine/runner.py`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — E8 khai HAI ca cho AC-7 nhưng lệnh chỉ chạy MỘT node-id, ca A («pip trả khác 0 vì lý do bất kỳ») không tồn tại**
  Người dùng thấy gì: Phép đo dùng để xác nhận rằng lỗi cấp phát môi trường luôn được báo rõ ràng hiện chỉ kiểm tra một trong hai tình huống lỗi đã cam kết, nên nếu tình huống còn lại bị hỏng trong tương lai, phép đo có thể không phát hiện ra.
  file: `_acceptance/hai-duong-chay-mot-venv/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — E5 ghim «In 8/8 PASS» cho bộ răng nay đã 11 phần tử: khẳng định đếm chết, chỉ còn mã thoát được đọc**
  Người dùng thấy gì: Một phép đo tự động dùng để xác nhận bộ kiểm chất lượng của tính năng còn hoạt động đúng đang so khớp với một kết quả cũ, nên lần kiểm tiếp theo có thể báo sai kết quả mà không ai để ý.
  file: `_acceptance/hai-duong-chay-mot-venv/evals.yaml`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/14 lỗi rơi vào file không bộ đo nào phủ (sdk/README.md, _acceptance/hai-duong-chay-mot-venv/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
