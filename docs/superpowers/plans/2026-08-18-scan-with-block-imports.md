# Bộ quét plugin đọc import theo ranh giới phạm vi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bộ quét plugin thu tên import theo ranh giới phạm vi của Python thay vì liệt kê loại khối, và mọi method mang `@node_slot` bị loại đều nói rõ lý do tại đúng file/dòng định nghĩa nó.

**Architecture:** Một hàm đi cây duy nhất trong `sdk/tongflow/_ast_utils.py` duyệt mọi node con và chỉ dừng ở `def`/`class`/`lambda` (nơi Python mở phạm vi mới). Cùng file đó giữ ba câu lý-do-bị-loại dưới dạng hằng số module và một hàm phán quyết `slot_rejection_reason()`; hai bên đọc (`scan.py` cho file kiểu entry, `parse_deploy.py` cho class `@deploy`) chỉ tiêu thụ, không tự dựng câu. Không đổi ABI, không phát hành SDK.

**Tech Stack:** Python 3.11+ (`ast`, `pytest` chạy qua `uv run --no-project`), bash guard scripts, Node chỉ dùng để đọc JSON trong script.

## Global Constraints

- **Hạng T3** (`sdk/**` nằm trong `risk_tiers.t3_paths`). Kế hoạch này phải được duyệt ở Cổng 1.5 trước khi viết dòng mã đầu tiên.
- **AC-13 — bán kính nổ:** `git diff` với merge-base phải cho **zero** file đổi dưới `config/tongflow.abi.json`, `src/generated/abi/**`, `src/lib/abi/**`, `src/db/**`; chuỗi version trong `sdk/pyproject.toml` và `sdk/tongflow/__init__.py` **không đổi**. Gói này không phát hành.
- **Không sửa plugin nào.** Plugin `oneflow-modal-compose-overlay` viết đúng chuẩn; lỗi nằm ở bộ đọc.
- **Giữ nguyên** `extract_default_slots` / `extract_slot_models` ở dạng chỉ-đọc-cấp-module (thiết kế có chủ đích).
- **Comment trong mã: tiếng Anh only** (CLAUDE.md).
- **Luật khai-sinh-phép-đo:** mỗi phép đo mới chỉ tính XONG khi có cặp hai chiều trên cùng một vật — vật lành → xanh, phá đúng chỗ trong bản sao → **đỏ kèm thông điệp ghim tên**. E14/E15 là hai nửa đỏ.
- **Verify của repo thắng default của skill con:** lệnh chạy test SDK là `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q` (PEP 668 chặn `python3 -m pytest` trên macOS).
- **Không task nào `independent: true`.** Task 2→3→4 sửa chồng lên cùng `_ast_utils.py`; Task 5–7 khẳng định hành vi do Task 2–4 tạo ra. S3 chạy tuần tự trong main loop, không fan-out worktree.

---

## File Structure

| File | Trách nhiệm | Task |
|---|---|---|
| `_acceptance/config.yaml` | 16 khoá executor để S4 resolve được `cmd:` | 1 |
| `sdk/tongflow/_ast_utils.py` | Bộ đi cây theo phạm vi + ba hằng lý do + `slot_rejection_reason()` | 2, 3 |
| `sdk/tongflow/scan.py` | Bên đọc kiểu entry: tiêu thụ lý do, báo tại file/dòng định nghĩa | 3 |
| `sdk/tongflow/parse_deploy.py` | Bên đọc class `@deploy`: tiêu thụ lý do, trả `slot_problems` | 3 |
| `sdk/tests/test_scan_scope.py` | E1–E10 | 2, 3, 4 |
| `sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay/` | Cây plugin mẫu rút byte-for-byte từ plugin thật + hash ghim | 5 |
| `scripts/plugins/check-overlay-discoverable.sh` | E12 (mẫu) + E14b (cây thật) | 5 |
| `scripts/plugins/check-scan-noise.sh` | E11 delta hai điểm mã | 6 |
| `scripts/plugins/check-scan-blast-radius.sh` | E13 | 6 |
| `scripts/plugins/check-scope-walker-teeth.sh` | E14 nửa đỏ của bộ đi cây | 7 |
| `scripts/plugins/check-reason-teeth.sh` | E15 nửa đỏ của chẩn đoán | 7 |

---

### Task 1: Khai 16 khoá executor

Không có khoá này thì S4 **dừng** chứ không đoán lệnh. Làm trước để vòng verify chạy được ngay khi mã xong.

**Files:**
- Modify: `_acceptance/config.yaml` (khối `executors.test`, `executors.script`)

**Interfaces:**
- Consumes: không
- Produces: 16 dotted key mà `evals.yaml` đã trỏ tới bằng `config:` ref

- [ ] **Step 1: Khai mười khoá test**

Mỗi lệnh dùng chung tiền tố runner của repo. Chạy từng lệnh một (script từ chối ghi đè khoá đã có):

```bash
AG=$(node "/Users/manh-macmini/.claude/plugins/cache/acceptance-gate-kit/feature-loop/2.1.0/scripts/resolve-plugin.mjs" --plugin acceptance-gate --require scripts/config-patch.mjs)
PY="cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py"

for pair in \
  "sdk_pytest_scope_with_deploy|-k deploy_with_image_imports" \
  "sdk_pytest_scope_with_scan|-k scan_with_image_imports" \
  "sdk_pytest_scope_nested|-k 'non_scope_block or nested_blocks'" \
  "sdk_pytest_scope_function_local|-k 'function_local or class_body'" \
  "sdk_pytest_scope_import_spellings|-k import_spelling" \
  "sdk_pytest_scope_prior_behaviour|-k prior_behaviour" \
  "sdk_pytest_reason_not_sdk_model|-k reason_names_defining_file" \
  "sdk_pytest_reason_missing_annotation|-k reason_missing_annotation" \
  "sdk_pytest_reason_missing_param|-k reason_missing_param" \
  "sdk_pytest_reason_single_source|-k reason_single_source" ; do
  key="${pair%%|*}"; sel="${pair#*|}"
  node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml \
    --key "executors.test.$key" --value "$PY $sel" --write
done
```

- [ ] **Step 2: Khai sáu khoá script**

```bash
node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml --key executors.script.check_scan_noise --value "bash scripts/plugins/check-scan-noise.sh" --write
node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml --key executors.script.check_overlay_discoverable_fixture --value "bash scripts/plugins/check-overlay-discoverable.sh fixture" --write
node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml --key executors.script.check_overlay_discoverable_real --value "bash scripts/plugins/check-overlay-discoverable.sh real" --write
node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml --key executors.script.check_scan_blast_radius --value "bash scripts/plugins/check-scan-blast-radius.sh" --write
node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml --key executors.script.check_scope_walker_teeth --value "bash scripts/plugins/check-scope-walker-teeth.sh" --write
node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml --key executors.script.check_reason_teeth --value "bash scripts/plugins/check-reason-teeth.sh" --write
```

- [ ] **Step 3: Kiểm mọi ref trong evals.yaml resolve được**

```bash
node -e '
const fs=require("fs");
const cfg=fs.readFileSync("_acceptance/config.yaml","utf8").split("\n");
const refs=[...fs.readFileSync("_acceptance/scan-with-block-imports/evals.yaml","utf8").matchAll(/cmd:\s*config:([\w.]+)/g)].map(m=>m[1]);
const miss=refs.filter(r=>{const leaf=r.split(".").pop();return !cfg.some(l=>l.trim().startsWith(leaf+":"));});
if(miss.length){console.error("MISSING: "+miss.join(", "));process.exit(1);}
console.log("ok — "+refs.length+" refs resolve");'
```

Expected: `ok — 16 refs resolve`

- [ ] **Step 4: Commit**

```bash
git add _acceptance/config.yaml
git commit -m "chore(acceptance): declare executor keys for scan-with-block-imports"
```

---

### Task 2: Bộ đọc import theo ranh giới phạm vi

**Files:**
- Modify: `sdk/tongflow/_ast_utils.py:8-50` (`_collect_models_roots`)
- Create: `sdk/tests/test_scan_scope.py`

**Interfaces:**
- Consumes: không
- Produces: `_walk_module_scope(node: ast.AST, take: Callable[[ast.stmt], None]) -> None` trong `_ast_utils.py` — Task 7 hoàn nguyên đúng hàm này để lấy nửa đỏ. Hành vi công khai: `parse_deploy_py(path)` và `scan(root, abi)` nhìn thấy model import đặt trong mọi khối không mở phạm vi.

- [ ] **Step 1: Viết test đỏ — khung file + E1**

Tạo `sdk/tests/test_scan_scope.py`:

```python
"""Scope-boundary import collection and the reasons a slot was skipped.

An import statement binds its name in the enclosing scope. Only `def`, `class`
and `lambda` open a new one — `with`, `if`, `for`, `try`, `match` do not. The
collector used to name block types instead, knew only `ast.Try`, and so missed
the Modal idiom `with image.imports():` — the slot went unserved and the scanner
blamed the wrong file.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from tongflow.parse_deploy import parse_deploy_py
from tongflow.scan import scan

_ABI = {
    "version": 1,
    "$defs": {"Asset": {"type": "object"}},
    "nodes": [
        {
            "nodeSlot": "compose-overlay",
            "inputs": {"type": "object", "properties": {"text": {"type": "string"}}},
            "outputs": {
                "type": "object",
                "properties": {"image": {"$ref": "#/$defs/Asset"}},
            },
        }
    ],
}

_PLUGIN_ID = "oneflow-modal-compose-overlay"
_SLOT_IDENT = "COMPOSE_OVERLAY"

_IMPORT = (
    "from tongflow.models.compose_overlay import "
    "ComposeOverlayInput, ComposeOverlayOutput"
)

_HEAD = (
    "import modal\n"
    "from tongflow import deploy\n"
    "from tongflow.slots import node_slot, NodeSlots\n\n"
    "image = modal.Image.debian_slim()\n"
    "app = modal.App('oneflow-modal-compose-overlay')\n\n"
)

_CLASS = (
    "\n@deploy\n@app.cls(image=image)\nclass Inference:\n"
    "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "    def compose_overlay(self, input: ComposeOverlayInput) -> ComposeOverlayOutput:\n"
    "        ...\n"
)


def _write_abi(tmp_path: Path) -> Path:
    p = tmp_path / "abi.json"
    p.write_text(json.dumps(_ABI), encoding="utf-8")
    return p


def _write_deploy(tmp_path: Path, body: str) -> Path:
    p = tmp_path / "deploy.py"
    p.write_text(_HEAD + body + _CLASS, encoding="utf-8")
    return p


def test_deploy_with_image_imports_registers_slot(tmp_path):
    """AC-1 — the Modal idiom the plugin actually uses."""
    path = _write_deploy(tmp_path, f"with image.imports():\n    {_IMPORT}\n")
    scanned, err = parse_deploy_py(path)
    assert err is None, err
    assert scanned is not None
    assert scanned.methods_by_slot == {_SLOT_IDENT: "compose_overlay"}, (
        f"slot {_SLOT_IDENT} was not registered from a model import inside "
        f"`with image.imports():` — got {scanned.methods_by_slot}"
    )
```

- [ ] **Step 2: Chạy để chắc chắn nó ĐỎ trên mã chưa vá**

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py -k deploy_with_image_imports
```

Expected: FAIL — `slot COMPOSE_OVERLAY was not registered ... got {}`

- [ ] **Step 3: Thay bộ đi cây bằng ranh giới phạm vi**

Trong `sdk/tongflow/_ast_utils.py`, thêm `from collections.abc import Callable` ở đầu file và thay hàm nội bộ `walk_body` (dòng 37–49) bằng một hàm module-level dùng lại được:

```python
def _walk_module_scope(node: ast.AST, take: Callable[[ast.stmt], None]) -> None:
    """
    Visit every statement that binds names in the MODULE scope.

    An import binds its name in the enclosing scope, and only ``def``, ``class``
    and ``lambda`` open a new one — ``with``, ``if``, ``for``, ``while``, ``try``
    and ``match`` do not. So the rule is a boundary, not a list of block types:
    recurse into everything except the scope openers. Naming block types is what
    made ``with image.imports():`` invisible; any such list is one idiom behind.
    """

    for child in ast.iter_child_nodes(node):
        if isinstance(
            child,
            (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Lambda),
        ):
            continue
        if isinstance(child, ast.stmt):
            take(child)
        _walk_module_scope(child, take)
```

Trong `_collect_models_roots`, xoá `walk_body` và thay hai dòng cuối bằng:

```python
    _walk_module_scope(tree, take_import_stmt)
    return frozenset(out)
```

Giữ nguyên `take_import_stmt` và cập nhật docstring của `_collect_models_roots` (nó đang chỉ nói về `try:`).

- [ ] **Step 4: Chạy lại — phải XANH**

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py -k deploy_with_image_imports
```

Expected: PASS

- [ ] **Step 5: Thêm E2 — cùng hình dạng qua đường `scan()`**

```python
def _write_plugin(tmp_path: Path, deploy_body: str) -> Path:
    root = tmp_path / "plugins"
    pdir = root / _PLUGIN_ID
    pdir.mkdir(parents=True)
    (pdir / "entry.py").write_text(
        "import sys, json\n\n\ndef main() -> None:\n    json.dump({}, sys.stdout)\n",
        encoding="utf-8",
    )
    (pdir / "deploy.py").write_text(_HEAD + deploy_body + _CLASS, encoding="utf-8")
    return root


def _problems(payload: dict, plugin_id: str = _PLUGIN_ID) -> list[str]:
    return [
        str(e["message"])
        for e in payload["errors"]  # type: ignore[index]
        if e["pluginId"] == plugin_id
    ]


def test_scan_with_image_imports_registers_and_is_quiet(tmp_path):
    """AC-2 — the slot registers through the directory scan, with no misleading
    'no @node_slot methods found' pointing at entry.py."""
    root = _write_plugin(tmp_path, f"with image.imports():\n    {_IMPORT}\n")
    payload = scan(root, _write_abi(tmp_path))
    assert _PLUGIN_ID in payload["nodePluginMap"]["compose-overlay"], (
        f"slot compose-overlay has no plugin serving it; errors={_problems(payload)}"
    )
    assert not [m for m in _problems(payload) if "no @node_slot" in m], _problems(payload)
```

- [ ] **Step 6: Thêm E3 — ma trận mười từ khoá, một assert mỗi từ khoá**

```python
_BLOCKS = {
    "with": "with image.imports():\n    {imp}\n",
    "if": "if True:\n    {imp}\n",
    "elif": "if False:\n    pass\nelif True:\n    {imp}\n",
    "else": "if False:\n    pass\nelse:\n    {imp}\n",
    "for": "for _ in range(1):\n    {imp}\n",
    "while": "while True:\n    {imp}\n    break\n",
    "try": "try:\n    {imp}\nexcept ImportError:\n    pass\n",
    "except": "try:\n    pass\nexcept ImportError:\n    {imp}\n",
    "finally": "try:\n    pass\nfinally:\n    {imp}\n",
    "match": "match 1:\n    case 1:\n        {imp}\n",
}


@pytest.mark.parametrize("keyword", sorted(_BLOCKS))
def test_non_scope_block_collects_import(tmp_path, keyword):
    """AC-3 — ten keywords, one assertion each, so a partial implementation
    names the keyword it missed."""
    path = _write_deploy(tmp_path, _BLOCKS[keyword].format(imp=_IMPORT))
    scanned, err = parse_deploy_py(path)
    assert err is None, err
    assert scanned is not None
    assert scanned.methods_by_slot == {_SLOT_IDENT: "compose_overlay"}, (
        f"a model import inside `{keyword}` was not collected — slot "
        f"{_SLOT_IDENT} unregistered; got {scanned.methods_by_slot}"
    )


def test_nested_blocks_collect_import(tmp_path):
    """AC-3 — two levels deep: with inside if inside try."""
    body = (
        "try:\n"
        "    if True:\n"
        "        with image.imports():\n"
        f"            {_IMPORT}\n"
        "except ImportError:\n"
        "    pass\n"
    )
    scanned, err = parse_deploy_py(_write_deploy(tmp_path, body))
    assert err is None, err
    assert scanned is not None
    assert scanned.methods_by_slot == {_SLOT_IDENT: "compose_overlay"}, (
        f"a model import nested with/if/try was not collected; got "
        f"{scanned.methods_by_slot}"
    )
```

- [ ] **Step 7: Thêm E4 — chân âm `def` và `class`**

```python
def test_function_local_import_is_not_collected(tmp_path):
    """AC-4 — a function-local import binds a LOCAL name; the fix must not
    degrade into accepting everything."""
    body = f"def _setup():\n    {_IMPORT}\n"
    scanned, err = parse_deploy_py(_write_deploy(tmp_path, body))
    assert err is None, err
    assert scanned is not None
    assert scanned.methods_by_slot == {}, (
        "a model import inside a `def` was treated as a module binding — the "
        f"scope boundary is not being respected; got {scanned.methods_by_slot}"
    )


def test_class_body_import_is_not_collected(tmp_path):
    """AC-4 — same for a class body."""
    body = f"class _Holder:\n    {_IMPORT}\n"
    scanned, err = parse_deploy_py(_write_deploy(tmp_path, body))
    assert err is None, err
    assert scanned is not None
    assert scanned.methods_by_slot == {}, (
        "a model import inside a `class` body was treated as a module binding; "
        f"got {scanned.methods_by_slot}"
    )
```

- [ ] **Step 8: Thêm E5 — ba dạng câu import, mỗi dạng một assert**

```python
_SPELLINGS = {
    "plain": (
        "from tongflow.models.compose_overlay import "
        "ComposeOverlayInput, ComposeOverlayOutput",
        "ComposeOverlayInput",
        "ComposeOverlayOutput",
    ),
    "aliased": (
        "from tongflow.models.compose_overlay import "
        "ComposeOverlayInput as CIn, ComposeOverlayOutput as COut",
        "CIn",
        "COut",
    ),
    "module_alias": (
        "import tongflow.models.compose_overlay as m",
        "m.ComposeOverlayInput",
        "m.ComposeOverlayOutput",
    ),
}


@pytest.mark.parametrize("spelling", sorted(_SPELLINGS))
def test_import_spelling_inside_block(tmp_path, spelling):
    """AC-5 — all three supported spellings behave inside a non-scope block
    exactly as they do at module level."""
    stmt, in_ann, out_ann = _SPELLINGS[spelling]
    src = (
        _HEAD
        + f"with image.imports():\n    {stmt}\n"
        + "\n@deploy\n@app.cls(image=image)\nclass Inference:\n"
        + "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
        + f"    def compose_overlay(self, input: {in_ann}) -> {out_ann}:\n"
        + "        ...\n"
    )
    path = tmp_path / "deploy.py"
    path.write_text(src, encoding="utf-8")
    scanned, err = parse_deploy_py(path)
    assert err is None, err
    assert scanned is not None
    assert scanned.methods_by_slot == {_SLOT_IDENT: "compose_overlay"}, (
        f"import spelling `{spelling}` was not collected inside a `with` block; "
        f"got {scanned.methods_by_slot}"
    )
```

- [ ] **Step 9: Thêm E6 — sàn chống hồi quy**

Hai thư mục con để hai file `deploy.py` không đè nhau:

```python
def test_prior_behaviour_module_level_and_try(tmp_path):
    """AC-6 — module level and try/except collected exactly as before this
    change. Green on BOTH patched and unpatched code: a floor, not a restatement."""
    for name, body in (
        ("module_level", f"{_IMPORT}\n"),
        ("try_block", f"try:\n    {_IMPORT}\nexcept ImportError:\n    pass\n"),
    ):
        d = tmp_path / name
        d.mkdir()
        scanned, err = parse_deploy_py(_write_deploy(d, body))
        assert err is None, err
        assert scanned is not None
        assert scanned.methods_by_slot == {_SLOT_IDENT: "compose_overlay"}, (
            f"prior behaviour regressed for `{name}`; got {scanned.methods_by_slot}"
        )
```

- [ ] **Step 10: Chạy cả sáu nhóm + toàn bộ suite SDK**

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py
```

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q
```

Expected: cả hai PASS. Suite cũ xanh là bằng chứng bộ đi cây mới không phá `test_scan.py` / `test_scan_defaults.py` / `test_scan_prefix.py`.

- [ ] **Step 11: Commit**

```bash
git add sdk/tongflow/_ast_utils.py sdk/tests/test_scan_scope.py
git commit -m "fix(sdk): collect model imports by scope boundary, not by block type"
```

---

### Task 3: Method bị loại phải nói lý do, tại đúng file và dòng

**Files:**
- Modify: `sdk/tongflow/_ast_utils.py` (thêm ba hằng lý do + `slot_rejection_reason`)
- Modify: `sdk/tongflow/scan.py:138-192` (`_scan_methods_by_slot_in_file`, `_scan_methods_by_slot_in_dir`), `sdk/tongflow/scan.py:351-391` (thân `scan`)
- Modify: `sdk/tongflow/parse_deploy.py:14-23` (`DeployScan`), `:55-84` (`_parse_methods_by_slot`), `:101-208`
- Modify: `sdk/tests/test_scan_scope.py`

**Interfaces:**
- Consumes: `_walk_module_scope` (Task 2)
- Produces:
  - `REASON_MISSING_INPUT_PARAM`, `REASON_MISSING_ANNOTATION`, `REASON_NOT_SDK_MODEL`, `REJECTION_HINT` — hằng str trong `_ast_utils.py`
  - `slot_rejection_reason(fn, module, *, input_index: int) -> str | None`
  - `DeployScan.slot_problems: tuple[tuple[int, str], ...]`
  - `_scan_methods_by_slot_in_file` / `_in_dir` trả 4-tuple `(methods, defaults, problems, rejections)`

- [ ] **Step 1: Viết test đỏ E7 — lý do phải trỏ đúng file định nghĩa**

Thêm vào `sdk/tests/test_scan_scope.py`:

```python
from tongflow._ast_utils import (
    REASON_MISSING_ANNOTATION,
    REASON_MISSING_INPUT_PARAM,
    REASON_NOT_SDK_MODEL,
)

_BAD_CLASS = (
    "\n@deploy\n@app.cls(image=image)\nclass Inference:\n"
    "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "    def compose_overlay(self, input: dict) -> dict:\n"
    "        ...\n"
)


def _write_plugin_with_class(tmp_path: Path, class_src: str) -> tuple[Path, Path, int]:
    """Returns (plugins_root, deploy_path, line of the `def`)."""
    root = tmp_path / "plugins"
    pdir = root / _PLUGIN_ID
    pdir.mkdir(parents=True)
    (pdir / "entry.py").write_text(
        "import sys, json\n\n\ndef main() -> None:\n    json.dump({}, sys.stdout)\n",
        encoding="utf-8",
    )
    src = _HEAD + f"with image.imports():\n    {_IMPORT}\n" + class_src
    deploy = pdir / "deploy.py"
    deploy.write_text(src, encoding="utf-8")
    line = next(
        i
        for i, text in enumerate(src.splitlines(), start=1)
        if text.strip().startswith("def compose_overlay")
    )
    return root, deploy, line


def test_reason_names_defining_file_and_line(tmp_path):
    """AC-7 — the RELATION, not the presence of four substrings: the problem must
    carry the file that defines the method and the line of its `def`. A problem
    reading 'entry.py:1: ...' names a file and a line and would still have cost
    the original debugging session."""
    root, deploy, line = _write_plugin_with_class(tmp_path, _BAD_CLASS)
    payload = scan(root, _write_abi(tmp_path))
    problems = _problems(payload)
    assert any(m.startswith(f"{deploy}:{line}:") for m in problems), (
        f"no problem anchored at {deploy}:{line} carrying reason "
        f"{REASON_NOT_SDK_MODEL!r}; got {problems}"
    )
    assert any(REASON_NOT_SDK_MODEL in m for m in problems), (
        f"no problem naming the reason {REASON_NOT_SDK_MODEL!r}; got {problems}"
    )
    assert not any("entry.py" in m for m in problems), (
        f"the scanner still blames entry.py while the cause is in {deploy.name}; "
        f"got {problems}"
    )
```

- [ ] **Step 2: Chạy — phải ĐỎ**

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py -k reason_names_defining_file
```

Expected: FAIL — `ImportError: cannot import name 'REASON_NOT_SDK_MODEL'`

- [ ] **Step 3: Một chỗ duy nhất sinh lý do**

Thêm vào `sdk/tongflow/_ast_utils.py`, ngay dưới `looks_like_sdk_model_type`:

```python
# The ONLY place these sentences exist. Both readers (repo scan and deploy
# parse) consume them, so a skipped slot reads the same wherever it is found —
# two call sites writing their own wording drift apart, a class of defect this
# repo has already paid for (four copies of a URL rule, two of the SDK pin rule).
REASON_MISSING_INPUT_PARAM = "@node_slot method has no input parameter"
REASON_MISSING_ANNOTATION = (
    "@node_slot method is missing its input or return type annotation"
)
REASON_NOT_SDK_MODEL = (
    "@node_slot method input/return annotation is not a tongflow.models type"
)
REJECTION_HINT = (
    "annotate the input parameter and the return value with tongflow.models "
    "types imported at module scope"
)


def slot_rejection_reason(
    fn: ast.FunctionDef | ast.AsyncFunctionDef,
    module: ast.Module | None,
    *,
    input_index: int,
) -> str | None:
    """
    Why this ``@node_slot`` method cannot be registered — ``None`` when it can.

    ``input_index`` is 0 for a module-level function and 1 for a bound method
    (``self`` comes first). Callers keep their own file/line framing; the
    sentence itself is produced here and nowhere else.
    """

    args = fn.args.args
    if len(args) < input_index + 1:
        return REASON_MISSING_INPUT_PARAM
    input_arg = args[input_index]
    if input_arg.annotation is None or fn.returns is None:
        return REASON_MISSING_ANNOTATION
    if not looks_like_sdk_model_type(input_arg.annotation, "Input", module):
        return REASON_NOT_SDK_MODEL
    if not looks_like_sdk_model_type(fn.returns, "Output", module):
        return REASON_NOT_SDK_MODEL
    return None
```

- [ ] **Step 4: Bên đọc class `@deploy` tiêu thụ lý do**

Trong `sdk/tongflow/parse_deploy.py`:

1. Import thêm `slot_rejection_reason` từ `._ast_utils`.
2. `DeployScan` thêm trường (giữ default để caller cũ không vỡ):

```python
    # Why a @node_slot method was skipped, as (lineno, reason).
    slot_problems: tuple[tuple[int, str], ...] = ()
```

3. `_parse_methods_by_slot` đổi sang trả 4 giá trị, thay bốn nhánh `continue` lặng bằng một lần hỏi lý do:

```python
def _parse_methods_by_slot(
    cls: ast.ClassDef, tree: ast.Module
) -> tuple[dict[str, str], set[str], list[tuple[int, str]], list[tuple[int, str]]]:
    """Returns (methods_by_slot_ident, default_slot_idents, default_problems,
    slot_problems)."""
    out: dict[str, str] = {}
    defaults: set[str] = set()
    problems: list[tuple[int, str]] = []
    slot_problems: list[tuple[int, str]] = []
    for stmt in cls.body:
        if not isinstance(stmt, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        if stmt.name.startswith("_"):
            continue
        reason = slot_rejection_reason(stmt, tree, input_index=1)
        if reason is not None:
            # Only a method that ASKED to serve a slot is worth a diagnostic;
            # an ordinary helper on the class is not a defect.
            if extract_node_slot_decorators(stmt):
                slot_problems.append((stmt.lineno, reason))
            continue
        slots = extract_node_slot_decorators(stmt)
        for s in slots:
            out[s] = stmt.name
        claimed, claim_problems = extract_node_slot_defaults(stmt)
        defaults.update(claimed)
        problems.extend(claim_problems)
    return out, defaults, problems, slot_problems
```

4. `_parse_deploy_classes` gom thêm `merged_slot_problems`, thêm nó vào tuple trả về và vào annotation; hai chỗ gọi `_parse_methods_by_slot` trong `parse_deploy_py` unpack 4 giá trị; `DeployScan(...)` nhận `slot_problems=tuple(slot_problems)`.

- [ ] **Step 5: Bên đọc kiểu entry tiêu thụ lý do**

Trong `sdk/tongflow/scan.py`, `_scan_methods_by_slot_in_file`:

```python
def _scan_methods_by_slot_in_file(
    path: Path,
) -> tuple[dict[str, str], set[str], list[str], list[str]]:
    """Returns (methods_by_slot_ident, default_slot_idents, problems, rejections)."""
    try:
        src = path.read_text(encoding="utf-8")
        tree = ast.parse(src, filename=str(path))
    except (OSError, SyntaxError):
        return {}, set(), [], []

    out: dict[str, str] = {}
    defaults: set[str] = set()
    problems: list[str] = []
    rejections: list[str] = []
    # Methods on a class are the deploy parser's business; reporting them here
    # too would make every healthy deploy-first plugin noisy (AC-11).
    module_level = {id(node) for node in tree.body}

    for node in ast.walk(tree):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        if node.name.startswith("_"):
            continue
        reason = slot_rejection_reason(node, tree, input_index=0)
        if reason is not None:
            if id(node) in module_level and extract_node_slot_decorators(node):
                rejections.append(
                    _scan_error(path, reason, REJECTION_HINT, line=node.lineno)
                )
            continue
        slots = extract_node_slot_decorators(node)
        for s in slots:
            out[s] = node.name
        claimed, claim_problems = extract_node_slot_defaults(node)
        defaults.update(claimed)
        for lineno, claim_reason in claim_problems:
            problems.append(
                _scan_error(path, claim_reason, "pass a literal True", line=lineno)
            )
    return out, defaults, problems, rejections
```

`_scan_methods_by_slot_in_dir` gom thêm `rejections` y hệt `problems` và trả 4-tuple. Import thêm `slot_rejection_reason`, `REJECTION_HINT` từ `._ast_utils`.

- [ ] **Step 6: `scan()` phát lý do và thôi đổ lỗi cho `entry.py`**

Trong thân `scan()` (`sdk/tongflow/scan.py:351`):

```python
        methods_by_ident, default_idents, default_problems, rejections = (
            _scan_methods_by_slot_in_dir(pdir)
        )
        for message in default_problems:
            errors.append({"pluginId": plugin_id, "message": message})
        for message in rejections:
            errors.append({"pluginId": plugin_id, "message": message})
```

Nhánh fallback deploy đổi thành (lý do phải nổi lên KỂ CẢ khi không method nào đăng ký được — đó chính là ca của lỗi gốc):

```python
        needs_deploy = False
        deploy_py = pdir / "deploy.py"
        if not methods_by_ident and deploy_py.is_file():
            dscan, _derr = parse_deploy_py(deploy_py)
            if dscan:
                for lineno, reason in dscan.slot_problems:
                    message = _scan_error(
                        deploy_py, reason, REJECTION_HINT, line=lineno
                    )
                    rejections.append(message)
                    errors.append({"pluginId": plugin_id, "message": message})
                if dscan.methods_by_slot:
                    methods_by_ident = dict(dscan.methods_by_slot)
                    default_idents = set(dscan.default_slots)
                    for lineno, reason in dscan.default_problems:
                        errors.append(
                            {
                                "pluginId": plugin_id,
                                "message": _scan_error(
                                    deploy_py,
                                    reason,
                                    "pass a literal True",
                                    line=lineno,
                                ),
                            }
                        )
                    needs_deploy = True
        if not methods_by_ident:
            # A specific reason at the defining line says strictly more than
            # "nothing found in entry.py" — the generic line yields to it.
            if not rejections:
                errors.append(
                    {
                        "pluginId": plugin_id,
                        "message": _scan_error(
                            pdir / "entry.py",
                            "no @node_slot(NodeSlots.XXX) methods found",
                            "add @node_slot and Input/Output annotations to entry.py",
                        ),
                    }
                )
            continue
```

- [ ] **Step 7: Chạy E7 — phải XANH**

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py -k reason_names_defining_file
```

Expected: PASS

- [ ] **Step 8: Thêm E8 và E9**

```python
_MISSING_ANNOTATION_CLASS = (
    "\n@deploy\n@app.cls(image=image)\nclass Inference:\n"
    "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "    def compose_overlay(self, input) -> ComposeOverlayOutput:\n"
    "        ...\n"
)

_MISSING_PARAM_CLASS = (
    "\n@deploy\n@app.cls(image=image)\nclass Inference:\n"
    "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "    def compose_overlay(self) -> ComposeOverlayOutput:\n"
    "        ...\n"
)


def test_reason_missing_annotation(tmp_path):
    """AC-8 — a distinct sentence from AC-7's."""
    root, deploy, line = _write_plugin_with_class(tmp_path, _MISSING_ANNOTATION_CLASS)
    problems = _problems(scan(root, _write_abi(tmp_path)))
    assert any(
        m.startswith(f"{deploy}:{line}:") and REASON_MISSING_ANNOTATION in m
        for m in problems
    ), f"expected {REASON_MISSING_ANNOTATION!r} at {deploy}:{line}; got {problems}"
    assert not any(REASON_NOT_SDK_MODEL in m for m in problems), (
        "the missing-annotation case must not borrow the wrong-type sentence; "
        f"got {problems}"
    )


def test_reason_missing_param(tmp_path):
    """AC-9 — a distinct sentence from AC-7's and AC-8's."""
    root, deploy, line = _write_plugin_with_class(tmp_path, _MISSING_PARAM_CLASS)
    problems = _problems(scan(root, _write_abi(tmp_path)))
    assert any(
        m.startswith(f"{deploy}:{line}:") and REASON_MISSING_INPUT_PARAM in m
        for m in problems
    ), f"expected {REASON_MISSING_INPUT_PARAM!r} at {deploy}:{line}; got {problems}"
```

- [ ] **Step 9: Chạy toàn bộ suite SDK — sàn AC-11 tại chỗ**

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q
```

Expected: PASS. Nếu `test_scan*.py` cũ đỏ vì có thêm problem mới → đó là AC-11 đang nói chuyện: siết điều kiện phát lý do (chỉ method mang `@node_slot`, chỉ ở cấp module), đừng nới test.

- [ ] **Step 10: Commit**

```bash
git add sdk/tongflow/_ast_utils.py sdk/tongflow/scan.py sdk/tongflow/parse_deploy.py sdk/tests/test_scan_scope.py
git commit -m "fix(sdk): a skipped @node_slot method names its reason at its own def"
```

---

### Task 4: Chứng minh lý do chỉ có MỘT nguồn (E10)

Hai chuỗi bằng nhau không phân biệt được *một nguồn* với *hai bản sao giống hệt*. Chỉ đột biến mới phân biệt được.

**Files:**
- Modify: `sdk/tests/test_scan_scope.py`

**Interfaces:**
- Consumes: `REASON_NOT_SDK_MODEL` (Task 3)
- Produces: không

- [ ] **Step 1: Viết test đột biến**

```python
import os
import shutil
import subprocess
import sys

import tongflow

_ENTRY_BAD = (
    "from tongflow.slots import node_slot, NodeSlots\n\n\n"
    "@node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "def compose_overlay(input: dict) -> dict:\n"
    "    ...\n"
)


def test_reason_single_source_mutation(tmp_path):
    """AC-10 — MUTATION, not equality. Replace the sentence inside _ast_utils.py
    with a sentinel on a copy of the tree; if either reader still emits the old
    wording, the reason is duplicated at that call site."""
    pkg = Path(tongflow.__file__).resolve().parent
    copy_root = tmp_path / "sdkcopy"
    shutil.copytree(
        pkg, copy_root / "tongflow", ignore=shutil.ignore_patterns("__pycache__")
    )

    ast_utils = copy_root / "tongflow" / "_ast_utils.py"
    text = ast_utils.read_text(encoding="utf-8")
    assert REASON_NOT_SDK_MODEL in text, (
        "the reason sentence is not a literal in _ast_utils.py — it cannot be "
        "the single source if it is composed elsewhere"
    )
    sentinel = "SENTINEL-REASON-8f21"
    ast_utils.write_text(text.replace(REASON_NOT_SDK_MODEL, sentinel), encoding="utf-8")

    # Two plugins in one scan: one rejected through the entry-style reader,
    # one through the @deploy class reader.
    root = tmp_path / "plugins"
    entry_plugin = root / "oneflow-api-entrybad"
    entry_plugin.mkdir(parents=True)
    (entry_plugin / "entry.py").write_text(_ENTRY_BAD, encoding="utf-8")
    deploy_plugin = root / _PLUGIN_ID
    deploy_plugin.mkdir(parents=True)
    (deploy_plugin / "entry.py").write_text(
        "def main() -> None:\n    ...\n", encoding="utf-8"
    )
    (deploy_plugin / "deploy.py").write_text(
        _HEAD + f"with image.imports():\n    {_IMPORT}\n" + _BAD_CLASS,
        encoding="utf-8",
    )

    proc = subprocess.run(
        [
            sys.executable,
            "-m",
            "tongflow",
            "--root",
            str(root),
            "--abi",
            str(_write_abi(tmp_path)),
        ],
        env={**os.environ, "PYTHONPATH": str(copy_root)},
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr
    payload = json.loads(proc.stdout)
    by_plugin: dict[str, list[str]] = {}
    for e in payload["errors"]:
        by_plugin.setdefault(str(e["pluginId"]), []).append(str(e["message"]))

    for plugin_id, reader in (
        ("oneflow-api-entrybad", "scan.py"),
        (_PLUGIN_ID, "parse_deploy.py"),
    ):
        msgs = by_plugin.get(plugin_id, [])
        assert any(sentinel in m for m in msgs), (
            f"the {reader} reader did not pick up the mutated sentence — the "
            f"reason is duplicated at that call site instead of being consumed "
            f"from _ast_utils.py; got {msgs}"
        )
```

- [ ] **Step 2: Chạy — phải XANH ngay (Task 3 đã đặt một nguồn)**

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py -k reason_single_source
```

Expected: PASS

- [ ] **Step 3: Kiểm nó biết ĐỎ — chép sang bản sao, hardcode câu ở một bên đọc**

```bash
tmp=$(mktemp -d); cp -R sdk "$tmp/sdk"
python3 - "$tmp/sdk/tongflow/parse_deploy.py" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text()
s = s.replace(
    "slot_problems.append((stmt.lineno, reason))",
    'slot_problems.append((stmt.lineno, "@node_slot method input/return annotation is not a tongflow.models type"))',
)
p.write_text(s)
PY
cd "$tmp/sdk" && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py -k reason_single_source
```

Expected: FAIL, thông điệp nói `the parse_deploy.py reader did not pick up the mutated sentence`. Dọn bằng `rm -rf "$tmp"`.

- [ ] **Step 4: Commit**

```bash
git add sdk/tests/test_scan_scope.py
git commit -m "test(sdk): prove the skip reason has a single source by mutation"
```

---

### Task 5: Câu hỏi sản phẩm — slot có người phục vụ chưa (E12, E14b)

**Files:**
- Create: `sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay/deploy.py`
- Create: `sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay/entry.py`
- Create: `sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay/deploy.py.sha256`
- Create: `scripts/plugins/check-overlay-discoverable.sh`

**Interfaces:**
- Consumes: hành vi của `python -m tongflow` sau Task 2–3
- Produces: hai lệnh `bash scripts/plugins/check-overlay-discoverable.sh {fixture|real}`

> **CẦN QUYẾT Ở CỔNG 1.5:** máy này hiện chỉ có 4 thư mục trong `plugins/`; `oneflow-modal-compose-overlay` **chưa cài**. Fixture phải rút byte-for-byte từ plugin thật nên bước 1 cần tải một lần từ `https://github.com/phanlemanh/oneflow-modal-compose-overlay`.

- [ ] **Step 1: Lấy plugin thật (một lần, cần người đồng ý tải)**

```bash
pnpm plugins:install oneflow-modal-compose-overlay
```

Expected: `plugins/oneflow-modal-compose-overlay/` có `deploy.py` và `entry.py`.

- [ ] **Step 2: Rút fixture byte-for-byte và ghim hash**

```bash
dst=sdk/tests/fixtures/scan_scope/plugins/oneflow-modal-compose-overlay
mkdir -p "$dst"
cp plugins/oneflow-modal-compose-overlay/deploy.py "$dst/deploy.py"
cp plugins/oneflow-modal-compose-overlay/entry.py "$dst/entry.py"
shasum -a 256 "$dst/deploy.py" | cut -d' ' -f1 > "$dst/deploy.py.sha256"
diff -q plugins/oneflow-modal-compose-overlay/deploy.py "$dst/deploy.py"
```

Expected: `diff` im lặng (byte-for-byte).

- [ ] **Step 3: Viết script kiểm — gốc suy từ vị trí script, không từ cwd**

Tạo `scripts/plugins/check-overlay-discoverable.sh`:

```bash
#!/usr/bin/env bash
# E12 (fixture) / E14b (real) — the product-level question: does the
# compose-overlay slot have anyone serving it?
#
# Runs the scanner the way the server runs it (src/lib/plugins/plugins-scanner.server.ts):
# module entry `python -m tongflow`, this repo's sdk/ FIRST on PYTHONPATH.
# The repo root is derived from this script's own location, never from the
# caller's working directory.
set -euo pipefail

mode="${1:-fixture}"
root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
plugin_id=oneflow-modal-compose-overlay
abi="$root/config/tongflow.abi.json"
py="${PYTHON:-python3}"

case "$mode" in
  fixture)
    plugins_root="$root/sdk/tests/fixtures/scan_scope/plugins"
    pinned="$plugins_root/$plugin_id/deploy.py.sha256"
    actual=$(shasum -a 256 "$plugins_root/$plugin_id/deploy.py" | cut -d' ' -f1)
    if [ "$actual" != "$(cat "$pinned")" ]; then
      echo "FAIL: fixture deploy.py drifted from its pinned hash — it no longer"
      echo "      matches the real plugin it was round-tripped from."
      exit 1
    fi
    echo "fixture deploy.py matches its pinned hash ($actual)"
    ;;
  real)
    plugins_root="$root/plugins"
    if [ ! -d "$plugins_root/$plugin_id" ]; then
      echo "SKIP: $plugin_id is not installed under plugins/ — run"
      echo "      \`pnpm plugins:install $plugin_id\`. plugins/ is gitignored and"
      echo "      populated at runtime, so this check has nothing to read here."
      exit 0
    fi
    ;;
  *)
    echo "usage: $0 {fixture|real}" >&2
    exit 2
    ;;
esac

resolved=$(PYTHONPATH="$root/sdk" "$py" -c 'import tongflow; print(tongflow.__file__)')
case "$resolved" in
  "$root/sdk/"*) echo "tongflow loaded from this repo: $resolved" ;;
  *)
    echo "FAIL: tongflow resolved to $resolved, outside $root/sdk — the scan"
    echo "      would have measured an installed copy, not this change."
    exit 1
    ;;
esac

PYTHONPATH="$root/sdk" "$py" -m tongflow --root "$plugins_root" --abi "$abi" \
  | PLUGIN_ID="$plugin_id" MODE="$mode" "$py" -c '
import json, os, sys

payload = json.load(sys.stdin)
plugin_id = os.environ["PLUGIN_ID"]
mode = os.environ["MODE"]
servers = payload.get("nodePluginMap", {}).get("compose-overlay", [])
errors = [e for e in payload.get("errors", []) if e.get("pluginId") == plugin_id]

if not servers:
    print(f"FAIL [{mode}]: no plugin serves slot compose-overlay")
    for e in errors:
        print("  problem: " + str(e.get("message")))
    sys.exit(1)
if errors:
    print(f"FAIL [{mode}]: {plugin_id} is served but still carries problems")
    for e in errors:
        print("  problem: " + str(e.get("message")))
    sys.exit(1)
print(f"ok [{mode}]: compose-overlay served by {servers}, no problems for {plugin_id}")
'
```

```bash
chmod +x scripts/plugins/check-overlay-discoverable.sh
```

- [ ] **Step 4: Chạy cả hai chế độ**

```bash
bash scripts/plugins/check-overlay-discoverable.sh fixture
```

```bash
bash scripts/plugins/check-overlay-discoverable.sh real
```

Expected: chế độ `fixture` in `ok [fixture]: compose-overlay served by [...]`; chế độ `real` in `ok [real]: ...` (đã cài ở Step 1). Cả hai exit 0.

- [ ] **Step 5: Kiểm nó biết ĐỎ (nửa đỏ của chính phép đo này)**

```bash
cp sdk/tongflow/_ast_utils.py /tmp/_ast_utils.bak
python3 - <<'PY'
import pathlib
p = pathlib.Path("sdk/tongflow/_ast_utils.py")
s = p.read_text()
s = s.replace("        if isinstance(child, ast.stmt):\n            take(child)\n", "        pass\n", 1)
p.write_text(s)
PY
bash scripts/plugins/check-overlay-discoverable.sh fixture || echo "RED as expected"
cp /tmp/_ast_utils.bak sdk/tongflow/_ast_utils.py
git diff --exit-code sdk/tongflow/_ast_utils.py
```

Expected: dòng `FAIL [fixture]: no plugin serves slot compose-overlay` kèm problem nêu lý do, rồi `RED as expected`; `git diff --exit-code` im lặng sau khi khôi phục.

- [ ] **Step 6: Commit**

```bash
git add sdk/tests/fixtures/scan_scope scripts/plugins/check-overlay-discoverable.sh
git commit -m "test(plugins): pin a round-tripped compose-overlay fixture and assert the slot is served"
```

---

### Task 6: Không làm plugin lành thành ồn (E11) và không nới bán kính nổ (E13)

**Files:**
- Create: `scripts/plugins/check-scan-noise.sh`
- Create: `scripts/plugins/check-scan-blast-radius.sh`

**Interfaces:**
- Consumes: hành vi sau Task 2–3
- Produces: `bash scripts/plugins/check-scan-noise.sh`, `bash scripts/plugins/check-scan-blast-radius.sh`

- [ ] **Step 1: Viết check delta hai điểm mã**

Tạo `scripts/plugins/check-scan-noise.sh`:

```bash
#!/usr/bin/env bash
# E11 / AC-11 — the new diagnostic must not turn healthy plugins noisy.
#
# A DELTA across two code points over the SAME plugins/ tree: compare the SET OF
# PLUGIN IDS carrying problems at the merge base and at HEAD, and go red if and
# only if HEAD carries an id the base did not. No pinned problem text and no
# dependence on how many plugins happen to be installed — a differently
# populated machine must not be able to turn this red for environmental reasons,
# because that gets "fixed" by editing the pin and costs the check its teeth.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
py="${PYTHON:-python3}"
plugins_root="$root/plugins"
abi="$root/config/tongflow.abi.json"

base="${1:-}"
if [ "$base" = "" ]; then
  main_ref=$(git -C "$root" rev-parse --verify -q origin/main >/dev/null 2>&1 && echo origin/main || echo main)
  base=$(git -C "$root" merge-base HEAD "$main_ref")
fi

if [ ! -d "$plugins_root" ] || [ -z "$(ls -A "$plugins_root" 2>/dev/null)" ]; then
  echo "SKIP: plugins/ is empty — nothing to compare (it is gitignored and"
  echo "      populated at runtime; run \`pnpm plugins:install\` to widen this check)."
  exit 0
fi

ids_at() {
  PYTHONPATH="$1/sdk" "$py" -m tongflow --root "$plugins_root" --abi "$abi" \
    | "$py" -c '
import json, sys
payload = json.load(sys.stdin)
ids = sorted({str(e.get("pluginId")) for e in payload.get("errors", [])})
print("\n".join(ids))
'
}

work=$(mktemp -d)
cleanup() { git -C "$root" worktree remove --force "$work/base" >/dev/null 2>&1 || true; rm -rf "$work"; }
trap cleanup EXIT

git -C "$root" worktree add --detach "$work/base" "$base" >/dev/null 2>&1
before=$(ids_at "$work/base")
after=$(ids_at "$root")

new=$(comm -13 <(echo "$before") <(echo "$after") || true)
count=$(ls -1 "$plugins_root" | wc -l | tr -d ' ')
if [ "$new" != "" ]; then
  echo "FAIL: over $count installed plugins, HEAD reports problems for plugin(s)"
  echo "      the merge base ($base) did not:"
  echo "$new" | sed 's/^/  - /'
  exit 1
fi
echo "ok: over $count installed plugins, no plugin became newly problematic at HEAD"
```

- [ ] **Step 2: Viết check bán kính nổ**

Tạo `scripts/plugins/check-scan-blast-radius.sh`:

```bash
#!/usr/bin/env bash
# E13 / AC-13 — this package ships no release and touches no contract chokepoint.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
base="${1:-}"
if [ "$base" = "" ]; then
  main_ref=$(git -C "$root" rev-parse --verify -q origin/main >/dev/null 2>&1 && echo origin/main || echo main)
  base=$(git -C "$root" merge-base HEAD "$main_ref")
fi

forbidden=$(git -C "$root" diff --name-only "$base"...HEAD -- \
  config/tongflow.abi.json 'src/generated/abi' 'src/lib/abi' 'src/db')
if [ "$forbidden" != "" ]; then
  echo "FAIL: the change reaches contract chokepoints it declared it would not:"
  echo "$forbidden" | sed 's/^/  - /'
  exit 1
fi

for spec in "sdk/pyproject.toml|^version" "sdk/tongflow/__init__.py|^__version__"; do
  file="${spec%%|*}"; pattern="${spec#*|}"
  before=$(git -C "$root" show "$base:$file" | grep -E "$pattern" || true)
  after=$(grep -E "$pattern" "$root/$file" || true)
  if [ "$before" != "$after" ]; then
    echo "FAIL: $file version changed ($before -> $after) — this package ships no release."
    exit 1
  fi
done
echo "ok: no contract chokepoint touched, SDK version unchanged since $base"
```

```bash
chmod +x scripts/plugins/check-scan-noise.sh scripts/plugins/check-scan-blast-radius.sh
```

- [ ] **Step 3: Chạy cả hai**

```bash
bash scripts/plugins/check-scan-noise.sh
```

```bash
bash scripts/plugins/check-scan-blast-radius.sh
```

Expected: `ok: over N installed plugins, no plugin became newly problematic at HEAD` và `ok: no contract chokepoint touched, SDK version unchanged since <sha>`.

- [ ] **Step 4: Kiểm cả hai biết ĐỎ**

Bán kính nổ — chạm một chokepoint rồi hoàn nguyên:

```bash
printf '\n' >> src/db/workspace.schema.ts
bash scripts/plugins/check-scan-blast-radius.sh || echo "RED as expected (blast radius)"
git checkout -- src/db/workspace.schema.ts
```

Expected: `FAIL: the change reaches contract chokepoints...` nêu đúng `src/db/workspace.schema.ts`, rồi `RED as expected (blast radius)`.

Tiếng ồn — nửa đỏ thật của E11 là một id **chỉ mới xuất hiện ở HEAD**, nên phải làm HEAD kêu về một plugin mà merge-base im lặng:

```bash
cp sdk/tongflow/scan.py /tmp/scan.bak
python3 - <<'PY'
import pathlib
p = pathlib.Path("sdk/tongflow/scan.py")
s = p.read_text()
s = s.replace(
    '        for message in rejections:\n            errors.append({"pluginId": plugin_id, "message": message})\n',
    '        for message in rejections:\n            errors.append({"pluginId": plugin_id, "message": message})\n'
    '        errors.append({"pluginId": plugin_id, "message": "noise canary"})\n',
    1,
)
p.write_text(s)
PY
bash scripts/plugins/check-scan-noise.sh || echo "RED as expected (noise)"
cp /tmp/scan.bak sdk/tongflow/scan.py
git diff --exit-code sdk/tongflow/scan.py
```

Expected: `FAIL: over N installed plugins, HEAD reports problems for plugin(s) the merge base ... did not:` kèm danh sách id, rồi `RED as expected (noise)`.

- [ ] **Step 5: Commit**

```bash
git add scripts/plugins/check-scan-noise.sh scripts/plugins/check-scan-blast-radius.sh
git commit -m "test(plugins): guard scan noise delta and the declared blast radius"
```

---

### Task 7: Hai nửa đỏ (E14, E15)

Một màu xanh chưa-từng-đỏ không phân biệt được "mã đúng" với "thước chưa bao giờ chạy".

**Files:**
- Create: `scripts/plugins/check-scope-walker-teeth.sh`
- Create: `scripts/plugins/check-reason-teeth.sh`

**Interfaces:**
- Consumes: `_walk_module_scope` (Task 2), hai dòng phát lý do (Task 3)
- Produces: hai lệnh guard

- [ ] **Step 1: Nửa đỏ của bộ đi cây**

Tạo `scripts/plugins/check-scope-walker-teeth.sh`:

```bash
#!/usr/bin/env bash
# E14 — the RED half of the scope-boundary walker.
#
# On a COPY of the tree, revert the walker to the old name-the-block-types form
# and require E1..E5 to go red WITH A MESSAGE NAMING the missing slot — not
# merely a non-zero exit, which a broken fixture or a typo also produces.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cp -R "$root/sdk" "$work/sdk"
rm -rf "$work/sdk/.venv" "$work/sdk/__pycache__"

"${PYTHON:-python3}" - "$work/sdk/tongflow/_ast_utils.py" <<'PY'
import pathlib, re, sys

path = pathlib.Path(sys.argv[1])
src = path.read_text(encoding="utf-8")
anchor = "def _walk_module_scope("
if src.count(anchor) != 1:
    sys.exit(f"TEETH BROKEN: expected exactly one {anchor!r}, found {src.count(anchor)}")

start = src.index(anchor)
rest = src[start + len(anchor):]
m = re.search(r"\n(?=def )", rest)
if not m:
    sys.exit("TEETH BROKEN: could not find the end of _walk_module_scope")
end = start + len(anchor) + m.start() + 1

old = '''def _walk_module_scope(node, take):
    """Pre-fix form: names the block types it knows about, and knows only Try."""
    for child in getattr(node, "body", []):
        if isinstance(child, ast.stmt):
            take(child)
        if isinstance(child, ast.Try):
            _walk_module_scope(child, take)
            for handler in child.handlers:
                _walk_module_scope(handler, take)

'''
path.write_text(src[:start] + old + src[end:], encoding="utf-8")
PY

set +e
out=$(cd "$work/sdk" && PYTHONPATH=. uv run --no-project --with pytest --with tomli \
  --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py \
  -k 'deploy_with_image_imports or scan_with_image_imports or non_scope_block or nested_blocks or function_local or class_body or import_spelling' 2>&1)
code=$?
set -e

if [ $code -eq 0 ]; then
  echo "FAIL: the suite stayed GREEN under the reverted walker — E1..E5 do not"
  echo "      distinguish walk-by-scope-boundary from name-the-block-types."
  exit 1
fi
if ! echo "$out" | grep -q "COMPOSE_OVERLAY"; then
  echo "FAIL: the suite went red but never named the missing slot COMPOSE_OVERLAY —"
  echo "      a non-zero exit alone does not prove the measure measured anything."
  echo "$out" | tail -30
  exit 1
fi
echo "ok: reverting the walker turns E1..E5 red and names the missing slot COMPOSE_OVERLAY"
```

- [ ] **Step 2: Chạy**

```bash
chmod +x scripts/plugins/check-scope-walker-teeth.sh && bash scripts/plugins/check-scope-walker-teeth.sh
```

Expected: `ok: reverting the walker turns E1..E5 red and names the missing slot COMPOSE_OVERLAY`

- [ ] **Step 3: Nửa đỏ của chẩn đoán**

Tạo `scripts/plugins/check-reason-teeth.sh`:

```bash
#!/usr/bin/env bash
# E15 — the RED half of the diagnostic.
#
# On a COPY of the tree, restore the silent `continue` (remove the two lines
# that emit a reason) and require E7..E10 to go red WITH the absent reason text
# named. Proves those assertions measure the reason, not merely that scanning
# finished.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cp -R "$root/sdk" "$work/sdk"
rm -rf "$work/sdk/.venv" "$work/sdk/__pycache__"

"${PYTHON:-python3}" - "$work/sdk" <<'PY'
import pathlib, sys

sdk = pathlib.Path(sys.argv[1])
deploy_literal = "slot_problems.append((stmt.lineno, reason))"
scan_literal = """                rejections.append(
                    _scan_error(path, reason, REJECTION_HINT, line=node.lineno)
                )"""

# Each literal must appear EXACTLY once. If a refactor moves it, this script
# fails loudly here rather than silently perturbing nothing and passing green.
for path, literal in (
    (sdk / "tongflow" / "parse_deploy.py", deploy_literal),
    (sdk / "tongflow" / "scan.py", scan_literal),
):
    src = path.read_text(encoding="utf-8")
    if src.count(literal) != 1:
        sys.exit(
            f"TEETH BROKEN: {path.name} has {src.count(literal)} copies of the "
            f"emission literal, expected 1"
        )
    path.write_text(src.replace(literal, "                pass"), encoding="utf-8")
PY

set +e
out=$(cd "$work/sdk" && PYTHONPATH=. uv run --no-project --with pytest --with tomli \
  --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py \
  -k 'reason_names_defining_file or reason_missing_annotation or reason_missing_param or reason_single_source' 2>&1)
code=$?
set -e

if [ $code -eq 0 ]; then
  echo "FAIL: the suite stayed GREEN with the reason emission removed — E7..E10"
  echo "      do not measure the reason, only that scanning finished."
  exit 1
fi
if ! echo "$out" | grep -q "tongflow.models type"; then
  echo "FAIL: the suite went red but never named the absent reason text."
  echo "$out" | tail -30
  exit 1
fi
echo "ok: removing the reason emission turns E7..E10 red and names the absent reason"
```

- [ ] **Step 4: Chạy**

```bash
chmod +x scripts/plugins/check-reason-teeth.sh && bash scripts/plugins/check-reason-teeth.sh
```

Expected: `ok: removing the reason emission turns E7..E10 red and names the absent reason`

- [ ] **Step 5: Chạy trọn bộ verify của repo trước khi giao S4**

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q
```

```bash
pnpm lint:check && pnpm typecheck && pnpm verify:plugins
```

Expected: tất cả PASS. (`pnpm build` chạy trong suite S4; gói này không chạm TypeScript nên không kỳ vọng đổi.)

- [ ] **Step 6: Commit**

```bash
git add scripts/plugins/check-scope-walker-teeth.sh scripts/plugins/check-reason-teeth.sh
git commit -m "test(plugins): red halves for the scope walker and the skip reason"
```

---

## Self-Review

**1. Spec coverage**

| Tiêu chí | Task | Phép đo |
|---|---|---|
| AC-1 | 2 | E1 |
| AC-2 | 2 | E2 |
| AC-3 | 2 | E3 (10 từ khoá + lồng nhau) |
| AC-4 | 2 | E4 (def + class) |
| AC-5 | 2 | E5 (3 dạng) |
| AC-6 | 2 | E6 |
| AC-7 | 3 | E7 |
| AC-8 | 3 | E8 |
| AC-9 | 3 | E9 |
| AC-10 | 4 | E10 (đột biến) |
| AC-11 | 6 | E11 |
| AC-12 | 5 | E12 |
| AC-13 | 6 | E13 |
| AC-14 | 5 | E14b |
| Luật khai-sinh-phép-đo | 7 | E14, E15 |

Không tiêu chí nào không có task.

**2. Placeholder scan:** không có "TBD" / "tương tự Task N"; mọi bước sửa mã đều kèm mã thật.

**3. Type consistency:** `slot_rejection_reason(fn, module, *, input_index)` dùng đúng tên đó ở cả `scan.py` (0) và `parse_deploy.py` (1). `_walk_module_scope(node, take)` giữ nguyên chữ ký ở cả bản vá lẫn bản hoàn nguyên của Task 7 — đổi tên hàm thì phải sửa cả `check-scope-walker-teeth.sh`. `DeployScan.slot_problems` là tuple; `_parse_methods_by_slot` trả list rồi `parse_deploy_py` bọc `tuple(...)`.

## Rủi ro đã biết

1. **AC-11 vs. bên đọc kiểu entry.** Nếu điều kiện phát lý do bị nới (bỏ `id(node) in module_level` hoặc bỏ `extract_node_slot_decorators`), mọi method của plugin deploy-first lành mạnh sẽ sinh problem. Sàn là Step 9 của Task 3 (suite SDK cũ) và E11.
2. **Câu chung `no @node_slot methods found` nhường chỗ cho lý do cụ thể.** Đây là lựa chọn load-bearing, sẽ ghi vào sổ quyết định cuối S2. Nếu người duyệt muốn GIỮ cả hai câu thì bỏ điều kiện `if not rejections:` ở Task 3 Step 6 và sửa assert thứ ba của E7.
3. **Fixture cần plugin thật.** Task 5 Step 1 phải tải một lần; nếu người duyệt không muốn tải, AC-12 không thực hiện được như đã khai và phải quay lại Cổng 1.
