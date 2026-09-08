## Trong hợp đồng

- **AC-9 tests assert a substring, not the interpreter->venv relation; a fully wrong interpreter keeps both evals green**
  file: `sdk/tests/test_plugin_venv_layout.py:246`
  severity: high
  AC: AC-9
  detail: `test_returns_one_interpreter_per_plugin_not_one_for_all` (line 246) and `test_runner_calls_each_plugin_with_its_own_interpreter` (line 389) both check only `assert pid in py` — the plugin id appears somewhere in the path string — plus `a != b`. Neither asserts the actual promise, `py == str(P._venv_python(P._venv_dir(P._venv_root(data_dir), pid)))`, even though both helpers are in the same module and the TypeScript half of this same package does use equality (`expect(dir).toBe(join(root, e.relative_dir))`). MEASURED, not inferred: copied sdk/ to a temp dir, changed `pythons[pid] = str(py)` in `prepare_python_env` to `pythons[pid] = str(plugins_dir / pid / "python")` — an interpreter entirely outside the plugin-venv tree, belonging to no venv — and ran the two eval node-ids: `2 passed in 0.04s`. So the two evals backing AC-9 cannot distinguish "each plugin runs its own venv's interpreter" from "each plugin runs some path that happens to contain its id".
  source: bugs

- **Shape 3 — assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ: runner test never compares against the mapping it claims is consulted**
  file: `sdk/tests/test_plugin_venv_layout.py:388`
  severity: medium
  AC: AC-9
  detail: AC-9 promises "`runner` tra ánh xạ ấy theo node" and E10b's `expected` states the assertion literally as "interpreter truyền cho TỪNG node BẰNG đúng pythons[plugin_id của node đó]" — an equality relation between two values. `test_runner_calls_each_plugin_with_its_own_interpreter` never obtains that mapping. It asserts only (a) `len(seen) == 2` (383), (b) `seen[0][1] != seen[1][1]` (384), and (c) `assert pid in py` (388-389) — a substring-presence check on the interpreter path. No `prepare_python_env(...)` result is captured and compared, so the relation the eval names is never measured. Concrete escape: a runner that stops consulting the dict and recomputes the path itself, e.g. `python=str(_venv_dir(_venv_root(data_dir), plugin_id) / "bin" / "python")`, produces two distinct strings each containing its own plugin id and passes all three assertions — while being exactly the "two sides compute the same path independently" drift this dossier exists to close. That recompute is silently wrong on the `auto_install=False` branch (plugins.py:320-321 returns `sys.executable` for every id), and no runner-level case exercises that branch. The fix shape is one line: capture `pythons = P.prepare_python_env(...)` (or spy on it) and assert `dict(seen) == {pid: pythons[pid] for pid in TWO_IDS}`.
  source: measurement

- **Shape 3 — `assert pid in py` measures substring presence where the promise is "interpreter nằm trong venv của chính plugin đó"**
  file: `sdk/tests/test_plugin_venv_layout.py:245`
  severity: low
  AC: AC-9
  detail: E10's `expected` promises "mỗi giá trị nằm trong venv của chính plugin đó" — a containment relation between the returned interpreter path and `_venv_dir(root, pid)`. `test_returns_one_interpreter_per_plugin_not_one_for_all` asserts it as `assert pid in py` (245-246), a bare substring test on the whole path string. The file computes `root = P._venv_root(...)` and `_venv_dir` elsewhere but never joins them here, so any path that merely mentions the id passes: `/tmp/cache/oneflow-api-ffmpeg-shared/bin/python`, or a per-plugin venv relocated out from under `_venv_root` (the very root the shell guard pins), stays green. The two ids used happen not to be substrings of each other, so the check is not vacuous — but it is a weaker proposition than the one the eval states. `assert py == str(P._venv_python(P._venv_dir(root, pid)))` is the relation being claimed. The same substring form is repeated at line 389 in the runner test (see the finding above).
  source: measurement

- **Shape 4 — assertion âm-tính-một-mình: TS unsafe-id cases use bare `.toThrow()` with no message pinned, while the Python twin pins it and documents why**
  file: `src/lib/plugins/plugin-python-env.test.ts:57`
  severity: low
  AC: AC-10
  detail: AC-10 is written as "đúng luật bên TS đã ép ở `venvDirFor`", so the TypeScript half of that rule is measured by this block. `it.each([...])("refuses %j", (bad) => { expect(() => venvDirFor(bad)).toThrow(); })` (54-59) accepts ANY thrown error. `venvDirFor` (plugin-python-env.server.ts:68-73) validates first and only then calls `VENV_ROOT()` → `dataDir()`; if a later change makes that resolution throw (this suite mutates `TONGFLOW_DATA_DIR` to a path under a regular file in the sibling describe at lines 113-119), all six cases stay green with the id validation entirely removed — the check cannot tell "rejected the id" from "crashed for an unrelated reason". The Python counterpart in this same package states that reasoning verbatim and pins the message (`assert "unsafe plugin id" in str(e.value)`, test_plugin_venv_layout.py:40-42) plus a positive control in the same test (47). Fix is symmetric: `.toThrow(/unsafe plugin id/)`. Note this block is pre-existing (unchanged by this diff) inside a file the diff modifies; it is the only measurement of the TS side of AC-10.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Guard's CI-wiring assertion is fail-open on commented-out steps**
  Người dùng thấy gì: Nếu ai vô tình tắt một bước kiểm tra trong quy trình CI bằng cách comment nó ra, công cụ canh gác vẫn báo "OK" thay vì cảnh báo — rủi ro này đã được ghi nhận là hạn chế đã biết và sản phẩm vẫn phát hành như hiện tại.
  file: `scripts/plugins/check-venv-layout-pinned.sh`
  severity: high
  Đề xuất: known-limits

- **Two runtimes share one venv but use different cache markers and different SDK install sources**
  Người dùng thấy gì: Khi cả ứng dụng và luồng chạy workflow riêng đều chạm cùng một plugin, hệ thống có thể cài lại gói phần mềm nhiều lần không cần thiết, làm chậm việc chạy — chi phí này đã được chấp nhận như một hạn chế đã biết.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: known-limits

- **No cross-process mutual exclusion on the now-shared per-plugin venv**
  Người dùng thấy gì: Nếu một tác vụ đơn lẻ và một luồng công việc khác cùng chạm một plugin cùng lúc, việc cài đặt môi trường của plugin đó có thể xung đột và hỏng dở, khiến các tác vụ sau đó chạy plugin này báo lỗi khó hiểu.
  file: `src/lib/plugin-executor/runners/generic.ts`
  severity: medium
  Đề xuất: known-limits

- **Engine caches the checkout SDK install on version alone and omits --upgrade**
  Người dùng thấy gì: Trong môi trường phát triển chạy từ mã nguồn, nếu ai đó sửa danh sách thư viện của SDK mà quên tăng số phiên bản, môi trường cấp phát có thể vẫn dùng bản cũ và gây lỗi khó hiểu khi chạy plugin — đây là giới hạn đã biết của luồng phát triển nội bộ.
  file: `sdk/tongflow/engine/plugins.py`
  severity: low
  Đề xuất: known-limits

- **Guard's own CI-wiring assertion is fail-open: a commented-out step still passes**
  Người dùng thấy gì: Nếu ai vô tình tắt một bước kiểm tra trong quy trình CI bằng cách comment nó ra, công cụ canh gác vẫn báo "OK" thay vì cảnh báo — rủi ro này đã được ghi nhận là hạn chế đã biết và sản phẩm vẫn phát hành như hiện tại.
  file: `scripts/plugins/check-venv-layout-pinned.sh`
  severity: high
  Đề xuất: known-limits

- **Unvalidated pluginId reaches git clone's destination path before the validation this diff adds**
  Người dùng thấy gì: Một id plugin đặt tên cố ý xấu (ví dụ chứa "../") có thể khiến hệ thống tải mã nguồn plugin ra ngoài thư mục dành riêng cho plugin, trước khi các bước kiểm tra an toàn khác kịp chặn lại.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: known-limits

- **Both runtimes now write the same per-plugin venvs with divergent cache markers and no cross-process lock**
  Người dùng thấy gì: Khi hai luồng chạy khác nhau cùng cấp phát môi trường cho cùng một plugin cùng lúc, chúng có thể ghi đè lẫn nhau và để lại một môi trường cài đặt dở dang, khiến tác vụ sau đó chạy plugin bị lỗi.
  file: `sdk/tongflow/engine/plugins.py`
  severity: medium
  Đề xuất: known-limits

- **sdk/README.md still documents the venv as shared after the layout change**
  Người dùng thấy gì: Tài liệu sdk/README.md vẫn mô tả sai cách bố trí môi trường ảo dùng chung, có thể khiến người đọc tài liệu hiểu nhầm cấu trúc thư mục hiện tại.
  file: `sdk/README.md`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/12 lỗi rơi vào file không bộ đo nào phủ (src/lib/plugin-executor/runners/generic.ts, sdk/README.md) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
