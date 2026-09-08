# Review Findings: hai-duong-chay-mot-venv (round 4)

## Trong hợp đồng

### AC-11 CI-wiring assertion stays green when the CI step is commented out (fail-open, same class the repo already fixed once)
- file: `scripts/plugins/check-venv-layout-pinned.sh:114`
- severity: high
- AC: AC-11
- source: bugs

`grep -qE "run:.*scripts/plugins/$script" "$CI"` greps the RAW ci.yml, not the `run:` lines of a real step in a job that actually runs. MEASURED on this tree: copy `plugins.py`, `plugin-python-env.server.ts` and `ci.yml` into a temp root, prefix both the `- name:` and the `run:` lines of the two venv-layout steps with `# `, then run `bash scripts/plugins/check-venv-layout-pinned.sh --root <wd>` -> prints "OK: both runtimes pin the same venv root" and exits 0, while nothing runs in CI. The teeth suite does not cover it: `c_ci_drop` rewrites `run: bash ...` to `run: true` (value change) and `c_ci_missing` deletes the file (round-3 hole, fixed by ec9849c); the "present as text, absent as a step" vector is untested.

This is precisely the reproduction the repo already recorded and closed elsewhere: `scripts/ci/check-gate-guards-job.sh` shape mode says "replacing a step with `# TODO: bat lai bash ...synced.sh readme` left this mode green while nothing ran (reproduced 2026-09-02)", and fixes it by piping the job block through `sed -n 's|^[[:space:]]*run:[[:space:]]*||p'` before grepping. The new guard reintroduces the pattern. The same hole also lets the steps be moved under an `if:`/`needs:` that never fires — `check-gate-guards-job.sh reachable` guards that for the acceptance-gate job, but nothing guards it for these two new steps because they were never added to `GUARD_NEEDLES` in `scripts/ci/check-gate-guards-job.sh`.

Fix: extract the acceptance-gate job block by indentation, strip to `run:` lines, then match — and add a 13th teeth case that comments the step out.

### Hình dạng 3 — assert "chuỗi có mặt" trong khi lời hứa AC-9 là QUAN HỆ giữa interpreter và venv của plugin
- file: `sdk/tests/test_plugin_venv_layout.py:246`
- severity: high
- AC: AC-9
- source: measurement

E10 hứa "moi gia tri nam trong venv cua chinh plugin do" và E10b hứa interpreter truyền cho từng node "BANG dung pythons[plugin_id cua node do]". Nhưng cả hai chỗ chỉ assert `assert pid in py` (dòng 246 trong test_returns_one_interpreter_per_plugin_not_one_for_all, và dòng 389 trong test_runner_calls_each_plugin_with_its_own_interpreter) — tức chuỗi plugin id có xuất hiện đâu đó trong chuỗi đường dẫn, không phải quan hệ `py == str(P._venv_python(P._venv_dir(P._venv_root(data_dir), pid)))`. Hàm tính quan hệ đó có sẵn ngay trong module (`_venv_dir` + `_venv_python`), và chính nửa TypeScript của gói này đã dùng kỷ luật bằng-đúng (`expect(dir).toBe(join(root, e.relative_dir))`), nên đây là lệch chuẩn trong cùng một gói.

Đã đo (không suy diễn): sửa `prepare_python_env` thành `pythons[pid] = str(plugins_dir / pid / "python")` — một interpreter nằm HOÀN TOÀN ngoài cây plugin-venv, không thuộc venv nào — rồi chạy đúng hai node-id của E10 và E10b: `2 passed in 0.04s`. Baseline không sửa: `16 passed`. Nghĩa là hai ô đo của AC-9 vẫn xanh khi lời hứa "interpreter nằm trong venv của chính plugin" bị phá hoàn toàn; chúng chỉ còn chứng minh được `a != b` (hai chuỗi khác nhau) chứ không chứng minh được chuỗi nào trỏ vào venv nào.

### Hình dạng 4 — khẳng định âm-tính-một-mình cho AC-13: guard chỉ cấm MỘT cụm chữ, không hề đối chứng dương rằng mô tả đúng còn đó
- file: `scripts/plugins/check-venv-layout-pinned.sh:84`
- severity: medium
- AC: AC-13
- source: measurement

AC-13 được đo bằng hai lệnh grep phủ định duy nhất: dòng 84 `grep -q 'provision a shared venv'` trên 30 dòng đầu, và dòng 90 `grep -qE '^# --- shared venv'`. Không có bất kỳ khẳng định dương nào rằng docstring/banner thực sự mô tả mô hình một-venv-mỗi-plugin. Ca răng `c_py_doc_stale` chỉ thay đúng cụm `provision ONE VENV PER PLUGIN` -> `provision a shared venv`, tức chỉ thử lại đúng cái perturbation mà guard được viết ra để bắt; nó không phân biệt được "mô tả đúng" với "không có mô tả nào".

Đã đo trên bản sao cây: thay TRỌN docstring module bằng `"""Plugin preflight: provisions a single shared virtualenv for all plugins."""` (đúng mô hình cũ mà AC-13 nói phải biến mất) và đổi banner `# --- per-plugin venv` thành `# --- venv`, rồi chạy `bash scripts/plugins/check-venv-layout-pinned.sh --root <bản sao>` -> in `OK: both runtimes pin the same venv root...`, EXIT=0. Xoá hẳn docstring cũng xanh. Vậy phép đo của AC-13 chỉ cấm được một chuỗi ký tự cụ thể, không đo được điều nó tuyên: "header là artifact hai runtime thoả thuận qua, và một header sai là cùng loại drift một tầng trên".

### Hình dạng 3 — AC-11 hứa "guard chạy trên PR thường" nhưng chỉ assert một chuỗi có mặt trong ci.yml
- file: `scripts/plugins/check-venv-layout-pinned.sh:114`
- severity: medium
- AC: AC-11
- source: measurement

Dòng 114 đo tự-đấu-dây bằng `grep -qE "run:.*scripts/plugins/$script" "$CI"` — chuỗi xuất hiện Ở BẤT KỲ ĐÂU trong ci.yml. Lời hứa của AC-11 (theo E12) là hành vi: step thực sự chạy trên một PR thường. Grep phẳng không phân biệt được một step sống với một dòng bị comment, một step nằm trong job có `if: false`, hay một dòng nằm trong khối chú thích. Kho này đã có cách đo đúng cho chính chuyện đó — `scripts/ci/check-gate-guards-job.sh` (và `check-vitest-job.sh`) parse khối job THEO THỤT LỀ chứ không grep — nên guard mới đi chệch chuẩn sẵn có.

Đã đo trên bản sao cây: comment hai dòng của step pinned trong ci.yml (`        # run: bash scripts/plugins/check-venv-layout-pinned.sh`), rồi chạy `bash scripts/plugins/check-venv-layout-pinned.sh --root <bản sao>` -> `OK: ...`, EXIT=0. Hai ca răng về CI (`ci-step-dropped` đổi thành `run: true`, `ci-file-missing` xoá hẳn tệp) chỉ phủ hướng XOÁ chuỗi, nên chiều "vô hiệu hoá step mà giữ chuỗi" không có ca nào chạm tới.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **E3a/E3b mô tả cơ chế "engine xuất manifest → TS đọc" không tồn tại; fixture là file gõ tay và E3a không khai nó trong paths**
  Người dùng thấy gì: Tài liệu mô tả nội bộ của bộ kiểm thử tự động nói sai cách hai phần hệ thống trao đổi dữ liệu bố cục, nên một thay đổi liên quan trong tương lai có thể không được kiểm tra lại đầy đủ và lỗi có thể lọt qua mà không ai biết.
  file: `_acceptance/hai-duong-chay-mot-venv/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **expected của E13 còn ghim "MUOI MOT ca rang" trong khi bộ răng nay có 12 ca — chính lớp đếm-chết vòng 3 đã bắt ở E5**
  Người dùng thấy gì: Tài liệu kiểm thử ghi sai số lượng ca kiểm tra trong phần mô tả, khiến người đọc báo cáo khó biết chắc bộ kiểm tra đã chạy đủ hay chưa — không ảnh hưởng đến việc phần mềm chạy đúng hay sai.
  file: `_acceptance/hai-duong-chay-mot-venv/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **pluginId from the workflow file reaches `git clone` and a filesystem path before the validation this diff added**
  Người dùng thấy gì: Một mã định danh plugin không hợp lệ vẫn có thể khiến hệ thống thử tải dữ liệu về sai vị trí trước khi bị từ chối, tạo rủi ro bảo mật nhỏ nếu nội dung workflow bị chỉnh sửa bởi người khác.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: known-limits

- **Both runtimes now write the same per-plugin venv with divergent cache markers and no cross-process lock**
  Người dùng thấy gì: Khi hai phần của hệ thống chạy đồng thời trên cùng máy, việc chuẩn bị môi trường cho một plugin có thể bị chồng lấn nhau, khiến plugin đó lỗi khi chạy và cần cài đặt lại — sự cố hiếm gặp nhưng khó chẩn đoán.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: known-limits

- **E11's expected text pins eleven teeth cases while the same string demands 12/12**
  Người dùng thấy gì: Tài liệu kiểm thử ghi sai số lượng ca kiểm tra trong phần mô tả, khiến người đọc báo cáo khó biết chắc bộ kiểm tra đã chạy đủ hay chưa — không ảnh hưởng đến việc phần mềm chạy đúng hay sai.
  file: `_acceptance/hai-duong-chay-mot-venv/evals.yaml`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/9 lỗi rơi vào file không bộ đo nào phủ (_acceptance/hai-duong-chay-mot-venv/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
