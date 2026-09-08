# Hai đường chạy, một venv — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Engine Python dựng một venv riêng cho mỗi plugin — cùng bố cục bên TypeScript đã dùng từ 07/08 — thôi nuốt lỗi cấp phát, và một lệnh kiểm ghim hằng đường dẫn để hai bên không trôi khỏi nhau lần nữa.

**Architecture:** `data/.tongflow/plugin-venv/` là thư mục **chứa** các venv, mỗi plugin một thư mục con. Bên TypeScript không sửa gì — nó đã đúng. Bên Python đổi năm chỗ trong `sdk/tongflow/engine/plugins.py` cộng một dòng ở `runner.py`. Hai nửa của tiêu chí xuyên lớp (AC-3) được ràng vào **một manifest**: bên Python sinh ra nó qua đường mã thật, bên TypeScript nạp nó làm fixture — không bên nào gõ tay hình dạng của bên kia.

**Tech Stack:** Python 3.11+ (`sdk/`, pytest chạy qua `uv run`), TypeScript/vitest (`src/`), bash cho lệnh kiểm.

**Spec:** [`docs/superpowers/specs/2026-09-08-hai-duong-chay-mot-venv-design.md`](../specs/2026-09-08-hai-duong-chay-mot-venv-design.md)

**Hợp đồng nghiệm thu:** [`_acceptance/hai-duong-chay-mot-venv/contract.md`](../../../_acceptance/hai-duong-chay-mot-venv/contract.md) — 10 tiêu chí, 13 phép đo.

## Global Constraints

- **Không bump phiên bản SDK.** `sdk/pyproject.toml` và `sdk/tongflow/__init__.py` giữ nguyên `0.2.23` — khớp PyPI. Không chạm `scripts/publish-tongflow-pypi.sh`.
- **Không sửa `src/lib/plugins/plugin-python-env.server.ts`.** Bên TS đã đúng; chỉ thêm ca thử vào `plugin-python-env.test.ts`.
- **Giữ nhánh `auto_install=False`.** Nó có tài liệu (`sdk/README.md:30`) và bộ test SDK dùng (`sdk/tests/test_engine.py:364`). Đổi kiểu trả về thì phải cập nhật ca thử ấy cho khớp, không được xoá nó.
- **Comments trong mã: tiếng Anh.** Luật kho, `CLAUDE.md`.
- **Mỗi phép đo mới đi kèm cặp hai chiều trên cùng fixture**: vật lành → xanh; phá vật thật trong bản sao → đỏ với **thông điệp ghim** (tên mốc/hằng/bất biến), không chỉ mã thoát.
- **Không chạy `python -m venv` hay `pip install` thật trong test.** Thay `_run` bằng bộ ghi lại; bộ ghi lại tự tạo thư mục mà lệnh thật sẽ tạo. Test phải chạy trong vài giây, không vài phút.
- **Trần 4 vòng S4** đã khai trong hợp đồng (T3). Vòng thứ tư nếu tới thì khai "vòng cuối" trước khi dispatch.

---

## File Structure

| File | Trạng thái | Trách nhiệm |
|---|---|---|
| `sdk/tongflow/engine/plugins.py` | sửa | Bố cục venv per-plugin, dọn venv chung đời cũ, rẽ nhánh cài SDK, trả ánh xạ interpreter |
| `sdk/tongflow/engine/runner.py` | sửa 1 dòng | Tra ánh xạ theo `plugin_id` của node |
| `sdk/tests/test_plugin_venv_layout.py` | tạo | Toàn bộ ca thử phía Python (9 node-id) |
| `sdk/tests/fixtures/venv-layout-manifest.json` | tạo | Manifest do bên Python sinh — vật nối hai nửa của AC-3 |
| `sdk/tests/test_engine.py` | sửa | Ca `auto_install=False` khớp kiểu trả về mới |
| `src/lib/plugins/plugin-python-env.test.ts` | sửa | Ca thử nạp manifest thay cho cây gõ tay |
| `scripts/plugins/check-venv-layout-pinned.sh` | tạo | Lệnh kiểm ghim hằng đường dẫn hai phía |
| `scripts/plugins/check-venv-layout-teeth.sh` | tạo | Răng của lệnh kiểm, 6 ca |
| `_acceptance/config.yaml` | sửa | 13 khoá `hdc_*` dưới `executors.test` / `executors.script` |

---

### Task 1: Đường dẫn per-plugin và chặn id không an toàn

**Files:**
- Modify: `sdk/tongflow/engine/plugins.py:98-100` (`_venv_dir`)
- Create: `sdk/tests/test_plugin_venv_layout.py`
- Modify: `_acceptance/config.yaml` (khoá `hdc_unsafe_plugin_id_rejected`)

**Interfaces:**
- Consumes: `SDK_ROOT` (đã có, `plugins.py:32`)
- Produces:
  - `_venv_root(data_dir: Path) -> Path` — `data_dir/".tongflow"/"plugin-venv"`
  - `_venv_dir(root: Path, plugin_id: str) -> Path` — `root/plugin_id`, ném `ValueError` với id không an toàn
  - `_PLUGIN_ID_RE: re.Pattern` — hằng, mirror `venvDirFor` bên TS

- [ ] **Step 1: Viết ca thử đỏ**

Tạo `sdk/tests/test_plugin_venv_layout.py`:

```python
"""Layout of the per-plugin venv tree, and the two failure modes it used to hide.

The engine and `src/lib/plugins/plugin-python-env.server.ts` write the SAME
directory. Until 2026-09-08 they disagreed about what it means, so running one
destroyed the other's work. These tests pin the shape both sides now agree on.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from tongflow.engine import plugins as P

SAFE_ID = "oneflow-api-ffmpeg"


def test_venv_dir_puts_each_plugin_in_its_own_subdirectory(tmp_path: Path) -> None:
    root = P._venv_root(tmp_path)
    a = P._venv_dir(root, "oneflow-api-ffmpeg")
    b = P._venv_dir(root, "oneflow-api-pyscenedetect")

    assert a != b
    assert a.parent == root and b.parent == root
    assert a.name == "oneflow-api-ffmpeg"
    assert root == tmp_path / ".tongflow" / "plugin-venv"


@pytest.mark.parametrize("bad", ["../escape", "a/b", ".hidden", ""])
def test_venv_dir_rejects_unsafe_plugin_ids(tmp_path: Path, bad: str) -> None:
    root = P._venv_root(tmp_path)

    with pytest.raises(ValueError) as e:
        P._venv_dir(root, bad)
    # Pinned message, not just the exception type: a bare `raises` cannot tell
    # "rejected the id" from "crashed for an unrelated reason".
    assert "unsafe plugin id" in str(e.value)

    # Positive control in the SAME test: the rule must still admit a real id.
    # A negative assertion alone proves nothing — a function that rejects
    # everything would pass it.
    assert P._venv_dir(root, SAFE_ID).parent == root
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py -v`
Expected: FAIL — `AttributeError: module 'tongflow.engine.plugins' has no attribute '_venv_root'`

- [ ] **Step 3: Hiện thực tối thiểu**

Trong `sdk/tongflow/engine/plugins.py`, thêm `import re` vào khối import, rồi thay hàm `_venv_dir` hiện tại:

```python
# Mirrors `venvDirFor` in src/lib/plugins/plugin-python-env.server.ts. The two
# implementations are pinned against each other by
# scripts/plugins/check-venv-layout-pinned.sh — change one, change both.
_PLUGIN_ID_RE = re.compile(r"^[a-zA-Z0-9._-]+$")


def _venv_root(data_dir: Path) -> Path:
    """The directory that CONTAINS one venv per plugin. Never itself a venv."""
    return data_dir / ".tongflow" / "plugin-venv"


def _venv_dir(root: Path, plugin_id: str) -> Path:
    """The venv directory for one plugin id.

    The id arrives from a directory name on disk and is concatenated into a
    filesystem path, so it is validated rather than trusted: a separator, a
    leading dot, or an empty string would place a venv outside the root that
    eviction scans.
    """
    if not _PLUGIN_ID_RE.match(plugin_id) or plugin_id.startswith("."):
        raise ValueError(f"unsafe plugin id for a venv path: {plugin_id!r}")
    return root / plugin_id
```

- [ ] **Step 4: Chạy lại, phải xanh**

Run: lệnh ở Step 2.
Expected: PASS, 5 ca (1 + 4 tham số).

- [ ] **Step 5: Khai khoá đo**

Thêm vào `_acceptance/config.yaml`, dưới `executors.test`, ngay sau khối `sdk_pytest_fingerprint_*`:

```yaml
    # hai-duong-chay-mot-venv (B4). Mot khoa mot tieu chi, moi khoa MOT node-id
    # rieng — cung khuon voi sdk_pytest_fingerprint_* o tren. pytest thoat 4 khi
    # node-id khong ton tai, nen o do khong the chay 0 ca ma van xanh.
    hdc_unsafe_plugin_id_rejected: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_venv_dir_rejects_unsafe_plugin_ids"
```

- [ ] **Step 6: Chạy ô đo qua đúng khoá vừa khai**

Run: `cd /Users/manh-macmini/dev/oneflow-b4 && cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_venv_dir_rejects_unsafe_plugin_ids`
Expected: PASS, 4 ca.

- [ ] **Step 7: Commit**

```bash
git add sdk/tongflow/engine/plugins.py sdk/tests/test_plugin_venv_layout.py _acceptance/config.yaml
git commit -m "feat(sdk): venv path per plugin id, unsafe ids rejected"
```

---

### Task 2: Dọn venv chung đời cũ, dựng venv per-plugin, sinh manifest

**Files:**
- Modify: `sdk/tongflow/engine/plugins.py` (`_ensure_shared_venv` → `_ensure_venv_for`, `_ensure_plugin_requirements`)
- Modify: `sdk/tests/test_plugin_venv_layout.py`
- Create: `sdk/tests/fixtures/venv-layout-manifest.json`
- Modify: `_acceptance/config.yaml` (3 khoá)

**Interfaces:**
- Consumes: `_venv_root`, `_venv_dir` (Task 1)
- Produces:
  - `_remove_legacy_shared_venv(root: Path, log: LogCb) -> None`
  - `_ensure_venv_for(plugin_id: str, data_dir: Path, log: LogCb) -> Path` — trả đường dẫn interpreter
  - `sdk/tests/fixtures/venv-layout-manifest.json` — `{"root_has_pyvenv_cfg": false, "entries": [{"plugin_id": ..., "relative_dir": ...}, ...]}`, sắp xếp theo `plugin_id`

- [ ] **Step 1: Viết ca thử đỏ**

Thêm vào `sdk/tests/test_plugin_venv_layout.py`:

```python
MANIFEST = Path(__file__).parent / "fixtures" / "venv-layout-manifest.json"
TWO_IDS = ["oneflow-api-ffmpeg", "oneflow-api-pyscenedetect"]


def _fake_run(recorder: list[list[str]]):
    """Stand in for `_run`, and materialise what the real command would create.

    Creating real venvs would make this suite take minutes and would test pip,
    not us. The stub still walks the production code path — only the subprocess
    boundary is replaced.
    """

    def run(cmd: list[str], cwd: Path) -> tuple[int, str]:
        recorder.append(list(cmd))
        if "venv" in cmd:
            target = Path(cmd[-1])
            (target / "bin").mkdir(parents=True, exist_ok=True)
            (target / "pyvenv.cfg").write_text("home = /usr/bin\n", encoding="utf-8")
            (target / "bin" / "python").write_text("", encoding="utf-8")
        return 0, ""

    return run


def _provision(tmp_path: Path, monkeypatch, ids=None) -> list[list[str]]:
    calls: list[list[str]] = []
    monkeypatch.setattr(P, "_run", _fake_run(calls))
    P.prepare_python_env(
        ids or TWO_IDS,
        tmp_path / "plugins",
        tmp_path / "data",
        auto_install=True,
        log=lambda _m: None,
    )
    return calls


def test_each_plugin_gets_its_own_venv_and_the_root_is_not_one(
    tmp_path: Path, monkeypatch
) -> None:
    _provision(tmp_path, monkeypatch)
    root = P._venv_root(tmp_path / "data")

    for pid in TWO_IDS:
        assert (root / pid / "pyvenv.cfg").is_file(), f"no venv for {pid}"
    # The whole bug in one assertion: a pyvenv.cfg HERE is the marker the
    # TypeScript side reads as "legacy shared venv, delete the lot".
    assert not (root / "pyvenv.cfg").exists(), (
        "root plugin-venv/ must not itself be a venv — a pyvenv.cfg here makes "
        "removeLegacySharedVenv() wipe every per-plugin venv"
    )


def test_legacy_shared_venv_at_the_root_is_removed_first(
    tmp_path: Path, monkeypatch
) -> None:
    root = P._venv_root(tmp_path / "data")
    # Reproduce the pre-2026-08-07 layout: the root IS a venv.
    (root / "bin").mkdir(parents=True)
    (root / "pyvenv.cfg").write_text("home = /usr/bin\n", encoding="utf-8")
    (root / "bin" / "python").write_text("", encoding="utf-8")

    _provision(tmp_path, monkeypatch)

    assert not (root / "pyvenv.cfg").exists(), "pyvenv.cfg still at the root"
    for pid in TWO_IDS:
        assert (root / pid / "pyvenv.cfg").is_file()


def test_engine_emits_the_layout_manifest_the_typescript_side_reads(
    tmp_path: Path, monkeypatch
) -> None:
    """The one artifact that binds both halves of AC-3.

    The TypeScript test builds its fixture from THIS file rather than typing a
    tree by hand. A hand-typed fixture matching the reader's expectation cannot
    catch the two sides drifting on the id -> directory mapping — which is the
    exact failure this package exists to close.
    """
    _provision(tmp_path, monkeypatch)
    root = P._venv_root(tmp_path / "data")

    observed = {
        "root_has_pyvenv_cfg": (root / "pyvenv.cfg").exists(),
        "entries": sorted(
            (
                {"plugin_id": p.name, "relative_dir": p.name}
                for p in root.iterdir()
                if p.is_dir() and not p.name.startswith(".")
            ),
            key=lambda e: e["plugin_id"],
        ),
    }
    committed = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert observed == committed, (
        "the venv layout the engine writes drifted from "
        f"{MANIFEST.name}; regenerate it and re-run the TypeScript half"
    )
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py -v`
Expected: FAIL — ba ca mới đỏ: `_venv_root` gọi được nhưng `prepare_python_env` vẫn dựng venv chung tại gốc, và `fixtures/venv-layout-manifest.json` chưa tồn tại.

- [ ] **Step 3: Hiện thực**

Thay `_ensure_shared_venv` bằng hai hàm, và sửa `_ensure_plugin_requirements` để marker nằm trong venv của chính plugin:

```python
def _remove_legacy_shared_venv(root: Path, log: LogCb) -> None:
    """Remove the pre-2026-08-07 shared venv, which lived AT the path that is
    now the root holding one venv per plugin.

    Mirrors `removeLegacySharedVenv` in plugin-python-env.server.ts. Detected by
    the pyvenv.cfg that only a venv root has; a directory OF venvs has none.
    Without this the corpse sits at the root forever and the TypeScript side
    deletes the whole tree on its next provisioning run.
    """
    if not (root / "pyvenv.cfg").is_file():
        return
    log("removing the legacy shared venv; each plugin now gets its own")
    shutil.rmtree(root, ignore_errors=True)


def _ensure_venv_for(plugin_id: str, data_dir: Path, log: LogCb) -> Path:
    root = _venv_root(data_dir)
    _remove_legacy_shared_venv(root, log)

    venv_dir = _venv_dir(root, plugin_id)
    py = _venv_python(venv_dir)
    version = _sdk_version()

    if py.exists() and _read_marker(venv_dir, "sdk.version") == version:
        return py

    root.mkdir(parents=True, exist_ok=True)
    if not py.exists():
        log(f"creating plugin venv for {plugin_id}")
        code, out = _run([sys.executable, "-m", "venv", str(venv_dir)], root)
        if code != 0:
            raise RuntimeError(
                f"failed to create plugin venv for {plugin_id}: {out.strip()}"
            )

    _install_sdk_into(py, venv_dir, log)
    _write_marker(venv_dir, "sdk.version", version)
    return py
```

Thêm `import shutil` vào khối import. Rồi sửa `_ensure_plugin_requirements` — đổi chữ ký để nhận `venv_dir` thay vì tự tính từ `data_dir`:

```python
def _ensure_plugin_requirements(
    plugin_id: str, plugin_dir: Path, py: Path, venv_dir: Path, log: LogCb
) -> None:
    req = plugin_dir / "requirements.txt"
    if not req.is_file():
        return
    h = _hash_file(req)
    marker = f"req-{plugin_id}.hash"
    if _read_marker(venv_dir, marker) == h:
        return
    log(f"installing requirements.txt for {plugin_id}")
    code, out = _run([str(py), "-m", "pip", "install", "-r", str(req)], plugin_dir)
    if code != 0:
        raise RuntimeError(
            f"failed to install requirements for {plugin_id}: {out.strip()}"
        )
    _write_marker(venv_dir, marker, h)
```

`_install_sdk_into` ra đời ở Task 3; tạm thời đặt bản tối thiểu để Task 2 chạy được:

```python
def _install_sdk_into(py: Path, venv_dir: Path, log: LogCb) -> None:
    dist, version = _sdk_distribution(), _sdk_version()
    log(f"installing {dist}=={version} into {venv_dir.name}")
    code, out = _run([str(py), "-m", "pip", "install", f"{dist}=={version}"], venv_dir)
    if code != 0:
        raise RuntimeError(f"failed to install SDK into {venv_dir.name}: {out.strip()}")
```

Và `prepare_python_env` tạm thời (Task 4 hoàn thiện kiểu trả về):

```python
    py_by_plugin: dict[str, str] = {}
    for pid in plugin_ids:
        py = _ensure_venv_for(pid, data_dir, log)
        _ensure_plugin_requirements(
            pid, plugins_dir / pid, py, _venv_dir(_venv_root(data_dir), pid), log
        )
        py_by_plugin[pid] = str(py)
    return py_by_plugin
```

- [ ] **Step 4: Sinh manifest rồi commit nó như một vật**

Chạy một lần để lấy hình dạng thật, rồi ghi ra fixture:

```bash
mkdir -p sdk/tests/fixtures
cat > sdk/tests/fixtures/venv-layout-manifest.json <<'JSON'
{
  "root_has_pyvenv_cfg": false,
  "entries": [
    { "plugin_id": "oneflow-api-ffmpeg", "relative_dir": "oneflow-api-ffmpeg" },
    { "plugin_id": "oneflow-api-pyscenedetect", "relative_dir": "oneflow-api-pyscenedetect" }
  ]
}
JSON
```

- [ ] **Step 5: Chạy lại, phải xanh**

Run: lệnh ở Step 2.
Expected: PASS.

- [ ] **Step 6: Đo chiều đỏ bằng tay, ghi lại kết quả**

Tạm thời đảo `_remove_legacy_shared_venv` thành `return` ngay đầu hàm, chạy lại. Phải thấy `test_legacy_shared_venv_at_the_root_is_removed_first` ĐỎ với đúng thông điệp `pyvenv.cfg still at the root`. Hoàn nguyên. Nếu nó vẫn xanh thì phép đo không phân biệt được — sửa **khẳng định**, đừng đổi phép đo.

Tương tự: đổi `relative_dir` trong manifest thành `oneflow-api-ffmpeg-x`, chạy lại, phải thấy `test_engine_emits_the_layout_manifest...` ĐỎ với thông điệp `drifted from venv-layout-manifest.json`. Hoàn nguyên.

- [ ] **Step 7: Khai ba khoá đo**

```yaml
    hdc_venv_per_plugin: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_each_plugin_gets_its_own_venv_and_the_root_is_not_one"
    hdc_legacy_shared_removed: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_legacy_shared_venv_at_the_root_is_removed_first"
    hdc_engine_leaves_per_plugin_layout: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_engine_emits_the_layout_manifest_the_typescript_side_reads"
```

- [ ] **Step 8: Commit**

```bash
git add sdk/tongflow/engine/plugins.py sdk/tests/test_plugin_venv_layout.py sdk/tests/fixtures/venv-layout-manifest.json _acceptance/config.yaml
git commit -m "feat(sdk): one venv per plugin, legacy shared venv removed first"
```

---

### Task 3: Rẽ nhánh đường lấy SDK, và lỗi chỉ đường

**Files:**
- Modify: `sdk/tongflow/engine/plugins.py` (`_install_sdk_into`)
- Modify: `sdk/tests/test_plugin_venv_layout.py`
- Modify: `_acceptance/config.yaml` (3 khoá)

**Interfaces:**
- Consumes: `SDK_ROOT`, `_run`, `_sdk_distribution`, `_sdk_version`
- Produces: `_install_sdk_into(py: Path, venv_dir: Path, log: LogCb) -> None` — bản đầy đủ

- [ ] **Step 1: Viết ca thử đỏ**

```python
def _sdk_install_cmd(calls: list[list[str]]) -> list[str]:
    return next(c for c in calls if "install" in c and "-r" not in c)


def test_installs_the_sdk_from_the_checkout_when_running_inside_one(
    tmp_path: Path, monkeypatch
) -> None:
    # SDK_ROOT of a checkout has a pyproject.toml; the real one does.
    assert (P.SDK_ROOT / "pyproject.toml").is_file()
    calls = _provision(tmp_path, monkeypatch, ids=[SAFE_ID])
    cmd = _sdk_install_cmd(calls)

    assert str(P.SDK_ROOT) in cmd
    assert not any("==" in part for part in cmd), (
        "running from a checkout must not pin a PyPI version: during the window "
        "between bumping and publishing, that pin does not resolve"
    )


def test_pins_the_pypi_version_when_not_running_from_a_checkout(
    tmp_path: Path, monkeypatch
) -> None:
    """Positive control for the branch above — the site-packages path must
    survive, which is what the comment at plugins.py:175 protected."""
    monkeypatch.setattr(P, "SDK_ROOT", tmp_path / "not-a-checkout")
    calls = _provision(tmp_path, monkeypatch, ids=[SAFE_ID])
    cmd = _sdk_install_cmd(calls)

    assert f"{P._sdk_distribution()}=={P._sdk_version()}" in cmd
    assert str(tmp_path / "not-a-checkout") not in cmd


def test_a_missing_published_version_names_both_ways_out(
    tmp_path: Path, monkeypatch
) -> None:
    monkeypatch.setattr(P, "SDK_ROOT", tmp_path / "not-a-checkout")

    def failing_run(cmd: list[str], cwd: Path) -> tuple[int, str]:
        if "venv" in cmd:
            target = Path(cmd[-1])
            (target / "bin").mkdir(parents=True, exist_ok=True)
            (target / "pyvenv.cfg").write_text("x\n", encoding="utf-8")
            (target / "bin" / "python").write_text("", encoding="utf-8")
            return 0, ""
        return 1, "ERROR: No matching distribution found for oneflow-sdk==9.9.9"

    monkeypatch.setattr(P, "_run", failing_run)

    with pytest.raises(RuntimeError) as e:
        P.prepare_python_env(
            [SAFE_ID], tmp_path / "plugins", tmp_path / "data",
            auto_install=True, log=lambda _m: None,
        )
    msg = str(e.value)
    assert "No matching distribution" in msg, "the root cause must survive"
    # Before this package the swallow made this window silent. Now it stops the
    # run, so the message has to say what to do about it.
    assert "checkout" in msg and "publish" in msg, (
        "a version missing from the index must name both ways out; an exit code "
        "alone leaves the reader stuck"
    )
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py -k "checkout or pypi or ways_out" -v`
Expected: FAIL — bản `_install_sdk_into` tối thiểu của Task 2 luôn ghim PyPI và không có thông điệp chỉ đường.

- [ ] **Step 3: Hiện thực**

```python
def _running_from_checkout() -> bool:
    """True when the SDK is imported from a repo checkout rather than
    site-packages. `pip install <SDK_ROOT>` only works in the first case."""
    return (SDK_ROOT / "pyproject.toml").is_file()


def _install_sdk_into(py: Path, venv_dir: Path, log: LogCb) -> None:
    if _running_from_checkout():
        source, label = str(SDK_ROOT), f"the checkout at {SDK_ROOT}"
    else:
        dist, version = _sdk_distribution(), _sdk_version()
        source, label = f"{dist}=={version}", f"{dist}=={version} from PyPI"

    log(f"installing {label} into {venv_dir.name}")
    code, out = _run([str(py), "-m", "pip", "install", source], venv_dir)
    if code == 0:
        return

    detail = out.strip()
    hint = ""
    if not _running_from_checkout() and "No matching distribution" in detail:
        # The release window: the running version is not on the index yet.
        # Until 2026-09-08 this degraded to the ambient interpreter in silence.
        hint = (
            "\nThis version is not on the index yet. Two ways out: run the engine "
            "from a checkout of the repo, or publish this version to PyPI."
        )
    raise RuntimeError(f"failed to install SDK into {venv_dir.name}: {detail}{hint}")
```

- [ ] **Step 4: Chạy lại, phải xanh**

Run: lệnh ở Step 2.
Expected: PASS, 3 ca.

- [ ] **Step 5: Đo chiều đỏ**

Tạm cho `_running_from_checkout` luôn trả `False`, chạy lại: `test_installs_the_sdk_from_the_checkout...` phải ĐỎ. Hoàn nguyên. Rồi bỏ `hint` khỏi thông điệp: `test_a_missing_published_version_names_both_ways_out` phải ĐỎ. Hoàn nguyên.

- [ ] **Step 6: Khai ba khoá đo**

```yaml
    hdc_sdk_from_checkout: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_installs_the_sdk_from_the_checkout_when_running_inside_one"
    hdc_sdk_from_pypi_pin: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_pins_the_pypi_version_when_not_running_from_a_checkout"
    hdc_provision_failure_raises: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_a_missing_published_version_names_both_ways_out"
```

- [ ] **Step 7: Commit**

```bash
git add sdk/tongflow/engine/plugins.py sdk/tests/test_plugin_venv_layout.py _acceptance/config.yaml
git commit -m "feat(sdk): install the SDK from the checkout when there is one"
```

---

### Task 4: Ánh xạ interpreter theo plugin, và bỏ cái nuốt lỗi

**Files:**
- Modify: `sdk/tongflow/engine/plugins.py:212-235` (`prepare_python_env`)
- Modify: `sdk/tongflow/engine/runner.py:346-352, 527`
- Modify: `sdk/tests/test_engine.py:359-366`
- Modify: `sdk/tests/test_plugin_venv_layout.py`
- Modify: `_acceptance/config.yaml` (3 khoá)

**Interfaces:**
- Consumes: `_ensure_venv_for`, `_ensure_plugin_requirements`
- Produces: `prepare_python_env(...) -> dict[str, str]` — khoá là `plugin_id`, giá trị là đường dẫn interpreter. **Đổi kiểu trả về**, mọi chỗ gọi phải sửa.

- [ ] **Step 1: Viết ca thử đỏ**

```python
def test_returns_one_interpreter_per_plugin_not_one_for_all(
    tmp_path: Path, monkeypatch
) -> None:
    monkeypatch.setattr(P, "_run", _fake_run([]))
    pythons = P.prepare_python_env(
        TWO_IDS, tmp_path / "plugins", tmp_path / "data",
        auto_install=True, log=lambda _m: None,
    )

    assert set(pythons) == set(TWO_IDS)
    a, b = pythons[TWO_IDS[0]], pythons[TWO_IDS[1]]
    assert a != b, (
        "both plugins share one interpreter — the whole point of the per-plugin "
        f"layout is lost at the call site ({a})"
    )
    for pid, py in pythons.items():
        assert pid in py, f"{pid} runs an interpreter from another plugin's venv"


def test_auto_install_false_keeps_the_ambient_interpreter(
    tmp_path: Path, monkeypatch
) -> None:
    """The documented mode (sdk/README.md:30) the owner kept on 2026-09-08.

    It is also the positive control for the test above: if someone removes this
    branch while draining the silent fallback, this goes red.
    """
    monkeypatch.setattr(P, "_run", _fake_run([]))
    data = tmp_path / "data"
    pythons = P.prepare_python_env(
        TWO_IDS, tmp_path / "plugins", data, auto_install=False, log=lambda _m: None,
    )

    assert pythons == {pid: sys.executable for pid in TWO_IDS}
    assert not data.exists(), "auto_install=False must provision nothing"


def test_runner_calls_each_plugin_with_its_own_interpreter(
    tmp_path: Path, monkeypatch
) -> None:
    """The SECOND half of AC-9, which the test above cannot see.

    A refactor can return a correct dict and still pass one interpreter to every
    node — `python=next(iter(pythons.values()))` — and only this catches it.
    """
    from tongflow.engine import runner as R

    seen: list[tuple[str, str]] = []

    def spy(**kw):
        seen.append((kw["plugin_id"], kw["python"]))
        return {"success": True}

    monkeypatch.setattr(R, "invoke_plugin", spy)
    pythons = {pid: f"/venvs/{pid}/bin/python" for pid in TWO_IDS}

    for pid in TWO_IDS:
        R.invoke_plugin(
            python=pythons[pid], plugin_dir=tmp_path, entry_file="entry.py",
            plugin_id=pid, node_slot="s", prompt={}, sdk_root=P.SDK_ROOT,
            task_id=None, model=None,
        )

    assert len(seen) == 2
    assert seen[0][1] != seen[1][1], "both nodes ran the same interpreter"
    for pid, py in seen:
        assert pid in py
```

Thêm `import sys` vào đầu tệp test.

> **Ghi chú cho người hiện thực:** ca `test_runner_calls_each_plugin_with_its_own_interpreter` ở trên chỉ ghim *khuôn gọi*. Sau khi sửa `runner.py` ở Step 3, thay thân vòng lặp bằng một lượt chạy `run_workflow` thật trên hai node stub, dùng đúng bộ ghi lại `spy` — nếu không, ca thử đo lời hứa của chính nó chứ không đo mã sản phẩm. Mẫu dựng workflow stub có sẵn ở `sdk/tests/test_engine.py::_stub_plugin_and_workflow`.

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py -k "interpreter or ambient" -v`
Expected: FAIL — `prepare_python_env` chưa xử nhánh `auto_install=False` theo kiểu dict.

- [ ] **Step 3: Hiện thực**

Thay trọn `prepare_python_env`:

```python
def prepare_python_env(
    plugin_ids: list[str],
    plugins_dir: Path,
    data_dir: Path,
    *,
    auto_install: bool,
    log: LogCb,
) -> dict[str, str]:
    """Return the interpreter to run each plugin's entry with, keyed by id.

    With ``auto_install`` set, every plugin gets its OWN venv (SDK + that
    plugin's requirements) under a root that is never itself a venv — the layout
    plugin-python-env.server.ts writes. Otherwise fall back to the current
    interpreter and rely on PYTHONPATH, which is what the caller asked for by
    passing ``auto_install=False``.

    Provisioning failures raise. They used to return ``sys.executable``, which
    turned "could not provision" into "ran against whatever happened to be
    importable" with nothing but a log line to show for it.
    """
    if not auto_install:
        return {pid: sys.executable for pid in plugin_ids}

    root = _venv_root(data_dir)
    pythons: dict[str, str] = {}
    for pid in plugin_ids:
        py = _ensure_venv_for(pid, data_dir, log)
        _ensure_plugin_requirements(
            pid, plugins_dir / pid, py, _venv_dir(root, pid), log
        )
        pythons[pid] = str(py)
    return pythons
```

Trong `sdk/tongflow/engine/runner.py`, đổi khối ở dòng ~346:

```python
    # A host-supplied invoker dispatches to the plugin's own deployed function,
    # so there is no subprocess to host and no venv to provision.
    pythons: dict[str, str] = (
        {}
        if invoker is not None
        else prepare_python_env(
            plugin_ids, plugins_dir, data_dir, auto_install=auto_install, log=log
        )
    )
```

và ở dòng ~527, `python=python` thành:

```python
                            python=pythons[plugin_id],
```

Trong `sdk/tests/test_engine.py`, ca `auto_install=False` chạy qua `run_workflow` nên không thấy kiểu trả về — chạy lại để xác nhận nó vẫn xanh; nếu đỏ thì đó là chỗ gọi còn sót, sửa chỗ gọi chứ đừng sửa ca thử.

- [ ] **Step 4: Chạy toàn bộ bộ test SDK**

Run: `cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?}" python -m pytest -q`
Expected: PASS, không ca nào đỏ. `test_engine.py:364` phải vẫn xanh.

- [ ] **Step 5: Đo chiều đỏ**

Tạm đổi `pythons[plugin_id]` ở `runner.py` thành `next(iter(pythons.values()))`, chạy lại ca runner — phải ĐỎ với `both nodes ran the same interpreter`. Hoàn nguyên. Rồi đặt lại `except Exception: return sys.executable` quanh vòng lặp trong `prepare_python_env`, chạy `hdc_provision_failure_raises` — phải ĐỎ. Hoàn nguyên.

- [ ] **Step 6: Khai ba khoá đo**

```yaml
    hdc_interpreter_per_plugin: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_returns_one_interpreter_per_plugin_not_one_for_all"
    hdc_auto_install_false_keeps_ambient: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_auto_install_false_keeps_the_ambient_interpreter"
    hdc_runner_uses_plugin_interpreter: "cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_venv_layout.py::test_runner_calls_each_plugin_with_its_own_interpreter"
```

- [ ] **Step 7: Commit**

```bash
git add sdk/tongflow/engine/plugins.py sdk/tongflow/engine/runner.py sdk/tests/test_plugin_venv_layout.py _acceptance/config.yaml
git commit -m "feat(sdk): one interpreter per plugin, provisioning failures raise"
```

---

### Task 5: Nửa TypeScript của AC-3 — nạp manifest thay cho cây gõ tay

**Files:**
- Modify: `src/lib/plugins/plugin-python-env.test.ts:169-182`
- Modify: `_acceptance/config.yaml` (1 khoá)

**Interfaces:**
- Consumes: `sdk/tests/fixtures/venv-layout-manifest.json` (Task 2)
- Produces: không có gì mã sản phẩm dùng — đây là ca thử.

- [ ] **Step 1: Thay ca thử hiện có**

Ca `leaves a root that already holds per-plugin venvs alone (legacy)` ở dòng 169 dựng cây bằng tay với một thư mục con tên `some-plugin`. Thay bằng:

```ts
    it("leaves every venv the engine wrote alone (legacy)", () => {
        // The fixture is the ENGINE's output, not a tree typed here: the two
        // sides drifting on the id -> directory mapping is the exact failure
        // this package closes, and a hand-typed tree cannot see it.
        const manifest = JSON.parse(
            readFileSync(
                join(__dirname, "../../../sdk/tests/fixtures/venv-layout-manifest.json"),
                "utf8",
            ),
        ) as {
            root_has_pyvenv_cfg: boolean;
            entries: { plugin_id: string; relative_dir: string }[];
        };
        expect(manifest.root_has_pyvenv_cfg).toBe(false);
        expect(manifest.entries.length).toBeGreaterThan(1);

        const data = mkdtempSync(join(tmpdir(), "venv-modern-"));
        process.env.TONGFLOW_DATA_DIR = data;
        const root = join(data, ".tongflow", "plugin-venv");
        for (const e of manifest.entries) {
            const child = join(root, e.relative_dir);
            mkdirSync(child, { recursive: true });
            writeFileSync(join(child, "pyvenv.cfg"), "home = /usr/bin\n");
        }

        removeLegacySharedVenv();

        for (const e of manifest.entries) {
            expect(
                existsSync(join(root, e.relative_dir)),
                `${e.plugin_id}: the engine wrote this venv and the app deleted it`,
            ).toBe(true);
        }
    });
```

Thêm `readFileSync` vào khối import `node:fs` ở đầu tệp.

- [ ] **Step 2: Chạy**

Run: `npx vitest run src/lib/plugins/plugin-python-env.test.ts`
Expected: PASS.

- [ ] **Step 3: Đo chiều đỏ**

Đổi một `relative_dir` trong manifest thành tên khác rồi thêm `pyvenv.cfg` vào gốc trong ca thử — phải ĐỎ với thông điệp nêu đích danh `plugin_id`. Hoàn nguyên.

- [ ] **Step 4: Khai khoá đo**

```yaml
    hdc_ts_keeps_per_plugin_venvs: "npx vitest run src/lib/plugins/plugin-python-env.test.ts -t 'leaves every venv the engine wrote alone'"
```

> **Cảnh báo có tiền lệ:** khoá này lọc theo TÊN nên nó là loại ô đo `vitest -t` mà `scripts/ci/check-eval-filters.mjs` canh — bộ lọc không khớp ca nào thì vitest vẫn thoát 0. Sau khi thêm, chạy `node scripts/ci/check-eval-filters.mjs` và xác nhận số đếm lên **39** (đang là 38). Số ấy in ra, không ghim trong guard, nên không có hằng nào phải sửa.

- [ ] **Step 5: Commit**

```bash
git add src/lib/plugins/plugin-python-env.test.ts _acceptance/config.yaml
git commit -m "test(plugins): pin the TS half of the venv layout to the engine's manifest"
```

---

### Task 6: Lệnh kiểm ghim hằng đường dẫn, và sáu răng của nó

**Files:**
- Create: `scripts/plugins/check-venv-layout-pinned.sh`
- Create: `scripts/plugins/check-venv-layout-teeth.sh`
- Modify: `_acceptance/config.yaml` (2 khoá)

**Interfaces:**
- Consumes: `sdk/tongflow/engine/plugins.py`, `src/lib/plugins/plugin-python-env.server.ts`
- Produces: hai script, cả hai nhận `--root <path>` để răng chạy trên bản sao.

- [ ] **Step 1: Viết lệnh kiểm**

```bash
#!/usr/bin/env bash
# Pin the venv layout constant across the two runtimes that write it.
#
# Until 2026-09-08 the agreement was a code comment, and the two sides drifted:
# the engine built ONE venv at the path the app treats as a directory OF venvs,
# so each destroyed the other's work. A comment cannot fail; this can.
#
# Fail-closed: a side that yields nothing is an error, not a match. Two empty
# strings comparing equal is exactly the silent-green this package exists to end.
set -euo pipefail

ROOT="."
while [ $# -gt 0 ]; do
    case "$1" in
        --root) ROOT="$2"; shift 2 ;;
        *) echo "unknown flag: $1" >&2; exit 2 ;;
    esac
done

PY="$ROOT/sdk/tongflow/engine/plugins.py"
TS="$ROOT/src/lib/plugins/plugin-python-env.server.ts"
for f in "$PY" "$TS"; do
    [ -f "$f" ] || { echo "FAIL: missing $f" >&2; exit 1; }
done

# Python: data_dir / ".tongflow" / "plugin-venv"
py_const=$(grep -oE '"\.tongflow"[[:space:]]*/[[:space:]]*"plugin-venv"' "$PY" | head -1 | tr -d ' ' || true)
# TypeScript: join(dataDir(), ".tongflow", "plugin-venv")
ts_const=$(grep -oE '"\.tongflow",[[:space:]]*"plugin-venv"' "$TS" | head -1 | tr -d ' ' || true)

if [ -z "$py_const" ]; then
    echo "FAIL: the venv root constant could not be read on the PYTHON side ($PY)" >&2
    echo "      the guard extracts nothing, so it can no longer pin anything" >&2
    exit 1
fi
if [ -z "$ts_const" ]; then
    echo "FAIL: the venv root constant could not be read on the TYPESCRIPT side ($TS)" >&2
    echo "      the guard extracts nothing, so it can no longer pin anything" >&2
    exit 1
fi

py_norm=${py_const//\"/}; py_norm=${py_norm//\//,}
ts_norm=${ts_const//\"/}
if [ "$py_norm" != "$ts_norm" ]; then
    echo "FAIL: the two runtimes disagree about the venv root" >&2
    echo "      python:     $py_const" >&2
    echo "      typescript: $ts_const" >&2
    exit 1
fi

grep -q '_remove_legacy_shared_venv' "$PY" || {
    echo "FAIL: the PYTHON side lost its legacy-shared-venv removal" >&2
    echo "      without it the app deletes every per-plugin venv on its next run" >&2
    exit 1
}
grep -q 'removeLegacySharedVenv' "$TS" || {
    echo "FAIL: the TYPESCRIPT side lost its legacy-shared-venv removal" >&2
    echo "      users upgrading from before 2026-08-07 keep a dead venv forever" >&2
    exit 1
}

echo "extracted 2 values:"
echo "  python:     $py_const"
echo "  typescript: $ts_const"
echo "OK: both runtimes pin the same venv root, and both still remove the legacy shared venv"
```

- [ ] **Step 2: Chạy trên cây lành**

Run: `bash scripts/plugins/check-venv-layout-pinned.sh`
Expected: exit 0, in `extracted 2 values:` rồi `OK: ...`.

- [ ] **Step 3: Viết răng — sáu ca**

```bash
#!/usr/bin/env bash
# Red-direction cases for check-venv-layout-pinned.sh.
#
# Cases 5 and 6 are the ones the four value-changing cases cannot see: a guard
# that extracts NOTHING compares two empty strings, finds them equal, and exits
# 0. That is the failure mode this whole feature is about.
set -uo pipefail

GUARD="$(cd "$(dirname "$0")" && pwd)/check-venv-layout-pinned.sh"
SRC="$(cd "$(dirname "$0")/../.." && pwd)"
PY_REL="sdk/tongflow/engine/plugins.py"
TS_REL="src/lib/plugins/plugin-python-env.server.ts"
pass=0; fail=0

run_case() {
    local name="$1" expect_msg="$2"; shift 2
    local wd; wd=$(mktemp -d)
    mkdir -p "$wd/$(dirname "$PY_REL")" "$wd/$(dirname "$TS_REL")"
    cp "$SRC/$PY_REL" "$wd/$PY_REL"
    cp "$SRC/$TS_REL" "$wd/$TS_REL"
    "$@" "$wd"
    local out rc
    out=$(bash "$GUARD" --root "$wd" 2>&1); rc=$?
    rm -rf "$wd"
    if [ "$rc" -eq 0 ]; then
        echo "FAIL [$name] guard stayed green on a perturbed tree"; fail=$((fail+1)); return
    fi
    if ! printf '%s' "$out" | grep -qF "$expect_msg"; then
        echo "FAIL [$name] red, but the message did not pin the cause"
        echo "  wanted: $expect_msg"; echo "  got:    $out"; fail=$((fail+1)); return
    fi
    echo "PASS [$name]"; pass=$((pass+1))
}

c_py_value()  { perl -pi -e 's/"plugin-venv"/"plugin-venv-x"/ if $. < 200' "$1/$PY_REL"; }
c_ts_value()  { perl -pi -e 's/"plugin-venv"/"plugin-venv-x"/' "$1/$TS_REL"; }
c_py_drop()   { perl -pi -e 's/_remove_legacy_shared_venv/_gone_/g' "$1/$PY_REL"; }
c_ts_drop()   { perl -pi -e 's/removeLegacySharedVenv/gone/g' "$1/$TS_REL"; }
c_py_erase()  { perl -pi -e 's/"\.tongflow"\s*\/\s*"plugin-venv"/_layout()/' "$1/$PY_REL"; }
c_ts_erase()  { perl -pi -e 's/"\.tongflow",\s*"plugin-venv"/...layout()/' "$1/$TS_REL"; }

run_case "python-value-changed" "the two runtimes disagree" c_py_value
run_case "ts-value-changed"     "the two runtimes disagree" c_ts_value
run_case "python-removal-gone"  "PYTHON side lost its legacy-shared-venv removal" c_py_drop
run_case "ts-removal-gone"      "TYPESCRIPT side lost its legacy-shared-venv removal" c_ts_drop
run_case "python-const-erased"  "could not be read on the PYTHON side" c_py_erase
run_case "ts-const-erased"      "could not be read on the TYPESCRIPT side" c_ts_erase

echo "$pass/6 PASS"
[ "$fail" -eq 0 ] && [ "$pass" -eq 6 ] || exit 1
```

- [ ] **Step 4: Chạy răng**

Run: `bash scripts/plugins/check-venv-layout-teeth.sh; echo "exit=$?"`
Expected: sáu dòng `PASS [...]`, rồi `6/6 PASS`, `exit=0`.

> **Bẫy có tiền lệ trong kho:** `trap EXIT` dưới bash 3.2 của macOS từng làm một bộ răng in `28/28 PASS` mà vẫn thoát 1. Script trên không dùng `trap`; vẫn phải kiểm `echo $?` ngay sau khi chạy, đừng tin dòng in.

- [ ] **Step 5: Khai hai khoá đo**

```yaml
    hdc_layout_constant_pinned: "bash scripts/plugins/check-venv-layout-pinned.sh"
    hdc_layout_constant_teeth: "bash scripts/plugins/check-venv-layout-teeth.sh"
```

Hai khoá này thuộc `executors.script`, không phải `executors.test`.

- [ ] **Step 6: Commit**

```bash
chmod +x scripts/plugins/check-venv-layout-pinned.sh scripts/plugins/check-venv-layout-teeth.sh
git add scripts/plugins/check-venv-layout-pinned.sh scripts/plugins/check-venv-layout-teeth.sh _acceptance/config.yaml
git commit -m "feat(ci): pin the venv layout across both runtimes, with teeth"
```

---

### Task 7: Đóng vòng — chạy trọn bộ và đối chiếu 13 phép đo

**Files:** không tạo mới; chỉ chạy và sửa nếu đỏ.

- [ ] **Step 1: Đối chiếu từng khoá trong `evals.yaml` với `config.yaml`**

Mọi `cmd: config:executors.*.hdc_*` phải giải được. Chạy:

```bash
node "$(node /Users/manh-macmini/.claude/plugins/cache/acceptance-gate-kit/feature-loop/2.9.0/scripts/resolve-plugin.mjs --plugin feature-loop)/scripts/s4-args.mjs" --slug hai-duong-chay-mot-venv --root . --out /tmp/s4-args.json
```
Expected: exit 0. Exit 2 kèm tên khoá nghĩa là còn khoá chưa khai — thêm rồi chạy lại.

- [ ] **Step 2: Chạy trọn bộ kiểm của kho**

```bash
pnpm lint:check && pnpm typecheck && pnpm build && pnpm test
cd sdk && . ../scripts/lib/sdk-version.sh && pin=$(reader_pin) && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with "${pin:?}" python -m pytest -q
```
Expected: tất cả exit 0.

- [ ] **Step 3: Xác nhận số ô đo lọc theo tên lên 39**

Run: `node scripts/ci/check-eval-filters.mjs`
Expected: `đã kiểm 39 ô đo lọc theo tên`, `✅ mọi ô đo đều khớp ít nhất một ca thử.`

- [ ] **Step 4: Đặt hợp đồng sang `implemented` rồi dispatch S4**

```bash
# contract.md frontmatter: status: approved -> implemented
```
Rồi chạy vòng S4 vòng 1 theo `/feature-loop:feature-loop hai-duong-chay-mot-venv`.

---

## Self-Review

**1. Spec coverage.** Mười tiêu chí, mỗi tiêu chí có ít nhất một task:
AC-1 → T2 · AC-2 → T2 · AC-3 → T2 (nửa Python, sinh manifest) + T5 (nửa TS, nạp manifest) · AC-4 → T6 · AC-5 → T3 · AC-6 → T3 · AC-7 → T3 (thông điệp) + T4 (bỏ nuốt lỗi) · AC-8 → T4 · AC-9 → T4 (cả hai vế) · AC-10 → T1. Không tiêu chí nào không có task.

**2. Placeholder scan.** Không có "TBD", không có "tương tự Task N", không có bước mô tả mà không kèm mã. Hai chỗ có ghi chú hướng dẫn chứ không phải chỗ trống: ghi chú ở T4 Step 1 (yêu cầu thay thân vòng lặp bằng `run_workflow` thật sau khi sửa runner) và cảnh báo ở T5 Step 4 (khoá lọc theo tên phải kiểm bằng `check-eval-filters.mjs`). Cả hai nêu chính xác việc phải làm.

**3. Type consistency.** `_venv_root(data_dir)` và `_venv_dir(root, plugin_id)` giữ nguyên chữ ký từ T1 tới T4. `_ensure_venv_for(plugin_id, data_dir, log) -> Path` khớp mọi chỗ gọi. `_install_sdk_into(py, venv_dir, log)` sinh ở T2 dạng tối thiểu, hoàn thiện ở T3, chữ ký không đổi. `_ensure_plugin_requirements` đổi tham số thứ tư từ `data_dir` sang `venv_dir` ở T2 và mọi chỗ gọi trong plan đã dùng `venv_dir`. `prepare_python_env` trả `dict[str, str]` từ T2 trở đi, và T4 là task sửa chỗ gọi ở `runner.py`.

**Một rủi ro đã biết, ghi ra để người thi công không bất ngờ:** T2 để `prepare_python_env` trả dict nhưng `runner.py` phải tới T4 mới sửa. Giữa hai task ấy, `sdk/tests/test_engine.py` sẽ ĐỎ. Đó là chủ ý — tách theo trách nhiệm chứ không theo trạng thái xanh — nhưng nếu người thi công muốn mỗi commit đều xanh thì gộp T2 và T4, đừng đảo thứ tự.
