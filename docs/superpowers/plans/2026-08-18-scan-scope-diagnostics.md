# scan-scope-diagnostics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the plugin scanner report the specific reason it already holds — a defining line, a method name, a syntax error, a duplicate slot — instead of collapsing four different causes into `entry.py:1: no @node_slot(NodeSlots.XXX) methods found`.

**Architecture:** One boundary predicate (`_walk_module_scope`) answers "is this in module scope" for both halves of the scanner, replacing a second, narrower identity set over `tree.body`. One helper (`parse_failure_reason`) words "this file would not parse" for both readers. The scanner's existing `rejections` slot — which already routes into `errors` and suppresses the generic line via `if not rejections:` — carries the new messages, so no new suppression logic is introduced.

**Tech Stack:** Python 3, `ast`, pytest, bash gate scripts. Run tests through `uv` exactly as `_acceptance/config.yaml` declares — the ambient macOS python3 is Homebrew's and PEP 668 refuses `pip install pytest` there.

## Global Constraints

- Registration behaviour does not change. Only the diagnostic half changes. The closure-registers mirror bug is Out of scope and stays.
- **Do not modify `sdk/tests/test_scan_scope.py`.** It is 521 lines and it is the parent package's evidence while that package sits mid-S4. New tests go in `sdk/tests/test_scan_diagnostics.py` and import the parent's fixture builders.
- Code comments in English only (CLAUDE.md).
- No SDK release: do not bump `sdk/pyproject.toml` or `sdk/tongflow/__init__.py`, do not touch any plugin's `oneflow-sdk==X.Y.Z` pin.
- Build the module-scope set **once per file**, before the `ast.walk` loop. The parent branch memoised `_collect_models_roots` because the boundary walk visits the whole tree; a gate built inside the loop reintroduces the same O(functions × nodes) cost by another door.
- Every new measure ships as a two-way pair on one fixture: well-formed goes green, the same fixture mutated goes red with a pinned message.
- Base branch for every diff comparison is the stacked parent tip `feat/scan-with-block-imports`, not `origin/main`.

---

### Task 1: The shared boundary predicate yields scope openers

**Files:**
- Modify: `sdk/tongflow/_ast_utils.py:10-29` (`_walk_module_scope`)
- Test: `sdk/tests/test_scan_diagnostics.py` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: `_walk_module_scope(node: ast.AST, take: Callable[[ast.stmt], None]) -> None` — now calls `take` on `FunctionDef` / `AsyncFunctionDef` / `ClassDef` children before declining to recurse into them. `ast.Lambda` is an expression, not a statement, so it is skipped by the inner `isinstance(child, ast.stmt)` guard exactly as before.

**Serves:** AC-6 · evals E6, E6b · **independent: false** (every later code task builds on this)

- [ ] **Step 1: Write the failing test**

Create `sdk/tests/test_scan_diagnostics.py`:

```python
"""The scanner reports the reason it already holds, instead of blaming entry.py.

Four paths all ended at `entry.py:1: no @node_slot methods found` while a
specific reason was available: the module-scope gate disagreeing with the
registration walk, the deploy parser's error string discarded, the legacy
Inference branch overwriting reasons, and a swallowed parse failure.
"""

from __future__ import annotations

import ast

from tongflow._ast_utils import _walk_module_scope


def test_module_scope_gate_and_import_collector_share_one_walker():
    """AC-6 — the predicate itself: a `def` binds its name in the enclosing
    scope even though its body opens a new one, so the walker must hand back
    scope openers while still refusing to descend into them."""
    src = (
        "import os\n"
        "with image.imports():\n"
        "    def nested():\n"
        "        pass\n"
        "def top():\n"
        "    def inner():\n"
        "        pass\n"
        "class K:\n"
        "    def method(self):\n"
        "        pass\n"
    )
    seen: list[ast.stmt] = []
    _walk_module_scope(ast.parse(src), seen.append)

    funcs = {n.name for n in seen if isinstance(n, ast.FunctionDef)}
    classes = {n.name for n in seen if isinstance(n, ast.ClassDef)}
    assert funcs == {"nested", "top"}, (
        "module-scope functions must include one nested in a non-scope block "
        f"and exclude one nested in a def; got {sorted(funcs)}"
    )
    assert classes == {"K"}, f"expected the module-level class only; got {sorted(classes)}"
    assert "method" not in funcs, (
        "a method in a class body is not module scope — the walker descended "
        "past a scope opener"
    )
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_diagnostics.py::test_module_scope_gate_and_import_collector_share_one_walker`

Expected: FAIL — `funcs` is `set()` because the walker currently `continue`s past every scope opener without calling `take`.

- [ ] **Step 3: Write minimal implementation**

In `sdk/tongflow/_ast_utils.py`, replace the loop body of `_walk_module_scope`:

```python
    for child in ast.iter_child_nodes(node):
        if isinstance(
            child,
            (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Lambda),
        ):
            # A scope opener binds its OWN name in this scope, so it is a
            # module-scope statement — but its body is a different scope, so
            # stop here. `ast.Lambda` is an expr, not a stmt, and falls through.
            if isinstance(child, ast.stmt):
                take(child)
            continue
        if isinstance(child, ast.stmt):
            take(child)
        _walk_module_scope(child, take)
```

Update the docstring's first line to: `Visit every statement that binds a name in the MODULE scope.` and add after the existing paragraph:

```
    ``def`` and ``class`` are handed back too: each binds its own name here,
    even though its body opens a new scope. Import collection is unaffected —
    its ``take`` acts only on ``Import`` / ``ImportFrom``.
```

- [ ] **Step 4: Run the new test and the parent's regression floor**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_diagnostics.py::test_module_scope_gate_and_import_collector_share_one_walker tests/test_scan_scope.py::test_non_scope_block_collects_import tests/test_scan_scope.py::test_nested_blocks_collect_import tests/test_scan_scope.py::test_prior_behaviour_module_level_and_try tests/test_scan_scope.py::test_function_local_import_is_not_collected tests/test_scan_scope.py::test_class_body_import_is_not_collected`

Expected: PASS, all six. The five parent tests are the regression floor (eval E6b) — they must be green on both patched and unpatched code.

- [ ] **Step 5: Commit**

```bash
git add sdk/tongflow/_ast_utils.py sdk/tests/test_scan_diagnostics.py
git commit -m "fix(sdk): the module-scope walk hands back scope openers"
```

---

### Task 2: The rejection gate uses that predicate

**Files:**
- Modify: `sdk/tongflow/scan.py:12-21` (import list), `sdk/tongflow/scan.py:138-180` (`_scan_methods_by_slot_in_file`)
- Test: `sdk/tests/test_scan_diagnostics.py`

**Interfaces:**
- Consumes: `_walk_module_scope` from Task 1.
- Produces: no signature change. `_scan_methods_by_slot_in_file` keeps returning `(methods_by_slot_ident, default_slot_idents, problems, rejections)`.

**Serves:** AC-1, AC-2, AC-3, AC-4, AC-5, AC-15 · evals E1, E2, E3, E4, E18 · **independent: false** (needs Task 1)

- [ ] **Step 1: Write the failing tests**

Append to `sdk/tests/test_scan_diagnostics.py`. Add these imports at the top of the file, beside the existing ones:

```python
from pathlib import Path

import pytest
from tongflow._ast_utils import REASON_MISSING_ANNOTATION
from tongflow.scan import scan
from tests.test_scan_scope import _IMPORT, _PLUGIN_ID, _SLOT_IDENT, _problems, _write_abi
```

Then the fixture builders and tests:

```python
_ENTRY_HEAD = "from tongflow.slots import node_slot, NodeSlots\n" + _IMPORT + "\n\n"

_GOOD_FN = (
    "@node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "def compose_overlay(input: ComposeOverlayInput) -> ComposeOverlayOutput:\n"
    "    ...\n"
)

_BAD_FN = (
    "@node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "def compose_overlay(input) -> ComposeOverlayOutput:\n"
    "    ...\n"
)

_BAD_METHOD = (
    "@node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "def compose_overlay(self, input) -> ComposeOverlayOutput:\n"
    "    ...\n"
)

_DEF_BLOCKS = {
    "with": ("with image.imports():\n{b}", 4),
    "if": ("if True:\n{b}", 4),
    "elif": ("if False:\n    pass\nelif True:\n{b}", 4),
    "else": ("if False:\n    pass\nelse:\n{b}", 4),
    "for": ("for _ in range(1):\n{b}", 4),
    "while": ("while True:\n{b}    break\n", 4),
    "try": ("try:\n{b}except ImportError:\n    pass\n", 4),
    "except": ("try:\n    pass\nexcept ImportError:\n{b}", 4),
    "finally": ("try:\n    pass\nfinally:\n{b}", 4),
    "match": ("match 1:\n    case 1:\n{b}", 8),
}


def _indent(src: str, n: int) -> str:
    pad = " " * n
    return "".join(
        pad + line if line.strip() else line for line in src.splitlines(keepends=True)
    )


def _entry_src(block_key: str | None, fn: str) -> str:
    if block_key is None:
        return _ENTRY_HEAD + fn
    tpl, depth = _DEF_BLOCKS[block_key]
    return _ENTRY_HEAD + tpl.format(b=_indent(fn, depth))


def _def_line(src: str) -> int:
    for i, line in enumerate(src.splitlines(), start=1):
        if line.strip().startswith("def compose_overlay"):
            return i
    raise AssertionError("fixture has no compose_overlay def")


def _write_entry_plugin(tmp_path: Path, src: str) -> Path:
    root = tmp_path / "plugins"
    pdir = root / _PLUGIN_ID
    pdir.mkdir(parents=True)
    (pdir / "entry.py").write_text(src, encoding="utf-8")
    return root


def _scan_entry(tmp_path: Path, src: str) -> tuple[dict, list[str], int]:
    root = _write_entry_plugin(tmp_path, src)
    payload = scan(root, _write_abi(tmp_path))
    return payload, _problems(payload), _def_line(src)


def _generic(msgs: list[str]) -> list[str]:
    return [m for m in msgs if "no @node_slot" in m]


def test_reason_for_malformed_def_in_module_block(tmp_path):
    """AC-1 — both halves: the reason appears at the def's own line, AND the
    generic line yields to it. Emitting the reason while still emitting the
    generic line leaves two messages disagreeing about which file is wrong."""
    src = _entry_src("with", _BAD_FN)
    payload, msgs, line = _scan_entry(tmp_path, src)
    entry = tmp_path / "plugins" / _PLUGIN_ID / "entry.py"
    named = [
        m
        for m in msgs
        if f"{entry}:{line}:" in m
        and "compose_overlay" in m
        and REASON_MISSING_ANNOTATION in m
    ]
    assert named, (
        f"expected a problem at {entry}:{line} naming compose_overlay and the "
        f"missing-annotation reason; got {msgs}"
    )
    assert not _generic(msgs), (
        f"the generic entry.py line must yield to the specific reason; got {msgs}"
    )


def test_rejection_block_matrix_covers_the_ten_keywords():
    """AC-2 pins the SIZE of the matrix, not just its contents. Without this,
    deleting a row shrinks the matrix silently and every remaining row passes."""
    assert sorted(_DEF_BLOCKS) == sorted(
        [
            "with", "if", "elif", "else", "for",
            "while", "try", "except", "finally", "match",
        ]
    ), f"the block matrix no longer matches the ten keywords AC-2 names; got {sorted(_DEF_BLOCKS)}"


@pytest.mark.parametrize("keyword", sorted(_DEF_BLOCKS))
def test_rejection_in_non_scope_block(tmp_path, keyword):
    """AC-2 — ten keywords, one assertion each, so a partial implementation
    names the keyword it missed."""
    src = _entry_src(keyword, _BAD_FN)
    _payload, msgs, line = _scan_entry(tmp_path, src)
    entry = tmp_path / "plugins" / _PLUGIN_ID / "entry.py"
    assert any(f"{entry}:{line}:" in m and "compose_overlay" in m for m in msgs), (
        f"a malformed @node_slot def inside `{keyword}` produced no reason at "
        f"its own line {line}; got {msgs}"
    )


def test_rejection_in_nested_blocks(tmp_path):
    """AC-2 — two levels deep: with inside if inside try."""
    fn = _indent(_indent(_indent(_BAD_FN, 4), 4), 4)
    src = _ENTRY_HEAD + (
        "try:\n"
        "    if True:\n"
        "        with image.imports():\n" + fn + "except ImportError:\n    pass\n"
    )
    _payload, msgs, line = _scan_entry(tmp_path, src)
    entry = tmp_path / "plugins" / _PLUGIN_ID / "entry.py"
    assert any(f"{entry}:{line}:" in m for m in msgs), (
        f"a malformed def nested with/if/try produced no reason at line {line}; got {msgs}"
    )


def test_well_formed_def_in_block_registers_and_is_quiet(tmp_path):
    """AC-3 — the GREEN half of the pair, on the same shape. Without it, AC-1
    could be satisfied by reporting unconditionally."""
    src = _entry_src("with", _GOOD_FN)
    payload, msgs, _line = _scan_entry(tmp_path, src)
    assert _PLUGIN_ID in payload["nodePluginMap"]["compose-overlay"], (
        f"a well-formed @node_slot def inside a block did not register; errors={msgs}"
    )
    assert msgs == [], f"a healthy plugin must produce no problems; got {msgs}"


def test_closure_def_is_not_reported(tmp_path):
    """AC-4 — NEGATIVE boundary: a closure is not module scope. Asserts silence
    only; the closure-registers mirror bug is Out of scope."""
    src = _ENTRY_HEAD + "def _setup():\n" + _indent(_BAD_FN, 4)
    _payload, msgs, _line = _scan_entry(tmp_path, src)
    assert not [m for m in msgs if "compose_overlay" in m], (
        f"a @node_slot def inside another def was reported — the fix degraded "
        f"into reporting everything; got {msgs}"
    )


def test_class_body_method_is_not_reported_by_dir_scan(tmp_path):
    """AC-5 — NEGATIVE boundary and the noise budget in miniature. Methods on a
    class are the deploy parser's business; reporting them here too would make
    every healthy deploy-first plugin noisy."""
    src = _ENTRY_HEAD + "class Holder:\n" + _indent(_BAD_METHOD, 4)
    _payload, msgs, _line = _scan_entry(tmp_path, src)
    assert not [m for m in msgs if "compose_overlay" in m], (
        f"a @node_slot method in a class body was reported by the directory "
        f"scan; got {msgs}"
    )


def test_bare_module_level_malformed_is_still_named(tmp_path):
    """AC-15 — the regression floor for the commonest shape. The noise measure
    only reddens on noise GAINED, so a gate widened to blocks while dropping
    bare module level would lose today's diagnostic with every eval green."""
    src = _entry_src(None, _BAD_FN)
    _payload, msgs, line = _scan_entry(tmp_path, src)
    entry = tmp_path / "plugins" / _PLUGIN_ID / "entry.py"
    assert any(
        f"{entry}:{line}:" in m and "compose_overlay" in m for m in msgs
    ), f"a malformed @node_slot def at column 0 lost its reason; got {msgs}"


def test_bare_module_level_well_formed_stays_quiet(tmp_path):
    """AC-15 — the green half of the same pair."""
    src = _entry_src(None, _GOOD_FN)
    payload, msgs, _line = _scan_entry(tmp_path, src)
    assert _PLUGIN_ID in payload["nodePluginMap"]["compose-overlay"], (
        f"a well-formed @node_slot def at column 0 did not register; errors={msgs}"
    )
    assert msgs == [], f"a healthy plugin must produce no problems; got {msgs}"
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_diagnostics.py`

Expected: the ten block-matrix cases plus `test_reason_for_malformed_def_in_module_block` and `test_rejection_in_nested_blocks` FAIL — the malformed def is not in the `tree.body` identity set, so `rejections` is empty and the generic line is present. `test_bare_module_level_malformed_is_still_named` PASSES already (that is the point of AC-15 — it is a floor, not a new behaviour).

- [ ] **Step 3: Write minimal implementation**

In `sdk/tongflow/scan.py`, add `_walk_module_scope` to the existing `from ._ast_utils import (...)` block, keeping the list alphabetical:

```python
from ._ast_utils import (
    DEFAULT_SLOTS_CONST,
    REJECTION_HINT,
    SLOT_MODELS_CONST,
    _walk_module_scope,
    extract_default_slots,
    extract_node_slot_decorators,
    extract_node_slot_defaults,
    extract_slot_models,
    slot_rejection_reason,
)
```

Then replace the `module_level` set in `_scan_methods_by_slot_in_file`:

```python
    # Methods on a class are the deploy parser's business; reporting them here
    # too would make every healthy deploy-first plugin noisy (AC-5).
    #
    # Built ONCE per file, from the same boundary predicate the import collector
    # uses. An identity set over `tree.body` reaches only the first level, while
    # registration below walks the whole tree — that disagreement is the defect.
    module_scope: set[int] = set()
    _walk_module_scope(tree, lambda stmt: module_scope.add(id(stmt)))
```

and the membership test:

```python
            if id(node) in module_scope and extract_node_slot_decorators(node):
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_diagnostics.py`

Expected: PASS, all of them.

- [ ] **Step 5: Commit**

```bash
git add sdk/tongflow/scan.py sdk/tests/test_scan_diagnostics.py
git commit -m "fix(sdk): decide module scope by boundary, not by tree.body identity"
```

---

### Task 3: One wording for a file that will not parse

**Files:**
- Modify: `sdk/tongflow/_ast_utils.py` (add `parse_failure_reason` beside the `REASON_*` constants at line 115)
- Modify: `sdk/tongflow/scan.py:143-146` (the bare `except` in `_scan_methods_by_slot_in_file`)
- Modify: `sdk/tongflow/parse_deploy.py:159-167` (the read/parse guards in `parse_deploy_py`)
- Test: `sdk/tests/test_scan_diagnostics.py`

**Interfaces:**
- Consumes: nothing from Tasks 1–2.
- Produces: `parse_failure_reason(exc: OSError | SyntaxError, path: Path) -> tuple[int, str, str]` returning `(line, reason, hint)`. Both readers format it with their own framing — `scan.py` through `_scan_error`, `parse_deploy.py` through its existing f-string.

**Serves:** AC-7, AC-8, AC-10 · evals E7, E8, E10 · **independent: false** (shares `scan.py` with Task 2; sequential avoids a merge conflict)

- [ ] **Step 1: Write the failing tests**

Append to `sdk/tests/test_scan_diagnostics.py`. Add these imports beside the existing ones:

```python
import os
import shutil
import subprocess
import sys

import tongflow
```

```python
def test_syntax_error_names_its_own_file_and_line(tmp_path):
    """AC-7 — a typo in a plugin file is the likeliest authoring mistake there
    is, and it currently produces the generic line pointing at entry.py."""
    src = _ENTRY_HEAD + "def broken(:\n    ...\n"
    root = _write_entry_plugin(tmp_path, src)
    payload = scan(root, _write_abi(tmp_path))
    msgs = _problems(payload)
    entry = root / _PLUGIN_ID / "entry.py"
    assert any(f"{entry}:3:" in m and "syntax error" in m for m in msgs), (
        f"a syntax error at line 3 of {entry} produced no problem naming that "
        f"file and line; got {msgs}"
    )
    assert not _generic(msgs), f"the generic line must yield to the syntax error; got {msgs}"


def test_unreadable_file_names_the_read_failure(tmp_path):
    """AC-8 — same family, other exception."""
    if os.geteuid() == 0:
        pytest.skip("running as root: mode 000 is not enforced, so this cannot be measured")
    src = _entry_src(None, _GOOD_FN)
    root = _write_entry_plugin(tmp_path, src)
    entry = root / _PLUGIN_ID / "entry.py"
    entry.chmod(0o000)
    try:
        payload = scan(root, _write_abi(tmp_path))
    finally:
        entry.chmod(0o644)
    msgs = _problems(payload)
    assert any(f"{entry}:1:" in m and "read failed" in m for m in msgs), (
        f"an unreadable plugin file produced no problem naming it; got {msgs}"
    )
    assert not _generic(msgs), f"the generic line must yield to the read failure; got {msgs}"


def test_parse_failure_wording_single_source_mutation(tmp_path):
    """AC-10 — MUTATION, not equality. Replace the sentence inside
    _ast_utils.py with a sentinel on a copy of the tree; if either reader still
    emits the old wording, it words the failure locally. Two equal strings
    cannot tell one source from two identical copies; only the mutation can."""
    pkg = Path(tongflow.__file__).resolve().parent
    copy_root = tmp_path / "sdkcopy"
    shutil.copytree(
        pkg, copy_root / "tongflow", ignore=shutil.ignore_patterns("__pycache__")
    )
    ast_utils = copy_root / "tongflow" / "_ast_utils.py"
    text = ast_utils.read_text(encoding="utf-8")
    assert "syntax error" in text, (
        "the parse-failure sentence is not a literal in _ast_utils.py — it "
        "cannot be the single source if it is composed elsewhere"
    )
    sentinel = "SENTINEL-PARSE-4c07"
    ast_utils.write_text(text.replace("syntax error", sentinel), encoding="utf-8")

    # Two plugins in one scan: one broken through the plugin-file reader, one
    # through the deploy.py reader.
    root = tmp_path / "plugins"
    entry_plugin = root / "oneflow-api-entrybad"
    entry_plugin.mkdir(parents=True)
    (entry_plugin / "entry.py").write_text("def broken(:\n    ...\n", encoding="utf-8")
    deploy_plugin = root / _PLUGIN_ID
    deploy_plugin.mkdir(parents=True)
    (deploy_plugin / "entry.py").write_text("def main() -> None:\n    ...\n", encoding="utf-8")
    (deploy_plugin / "deploy.py").write_text("class Inference(:\n    ...\n", encoding="utf-8")

    env = {**os.environ, "PYTHONPATH": str(copy_root)}
    probe = subprocess.run(
        [sys.executable, "-c", "import tongflow; print(tongflow.__file__)"],
        env=env, cwd=str(tmp_path), capture_output=True, text=True, check=False,
    )
    assert probe.stdout.strip().startswith(str(copy_root)), (
        f"the subprocess loaded tongflow from {probe.stdout.strip()!r}, not the "
        f"mutated copy under {copy_root} — the mutation would not be measured"
    )
    proc = subprocess.run(
        [sys.executable, "-m", "tongflow", "--root", str(root),
         "--abi", str(_write_abi(tmp_path))],
        env=env, cwd=str(tmp_path), capture_output=True, text=True, check=False,
    )
    out = proc.stdout
    assert out.count(sentinel) >= 2, (
        "the sentinel must surface from BOTH readers — the plugin-file reader "
        f"and the deploy.py reader. Output was:\n{out}"
    )
    assert "syntax error" not in out, (
        f"a reader still words the failure locally, so the sentence has two "
        f"sources, not one. Output was:\n{out}"
    )
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_diagnostics.py -k "syntax_error or unreadable or parse_failure_wording"`

Expected: FAIL — the first two get the generic line because the `except` swallows both exceptions; the mutation test finds the sentinel zero times because `parse_deploy.py` words the sentence locally and `scan.py` words nothing at all.

- [ ] **Step 3: Write the implementation**

In `sdk/tongflow/_ast_utils.py`, add after `REJECTION_HINT` (line 125). Add `from pathlib import Path` to the imports at the top:

```python
def parse_failure_reason(
    exc: OSError | SyntaxError,
    path: Path,
) -> tuple[int, str, str]:
    """
    ``(line, reason, hint)`` for a file that could not be read or parsed.

    Both readers word this the same way from here: a plugin file swallowed by
    the directory scan and a ``deploy.py`` rejected by the deploy parser say the
    same sentence, so a plugin author never sees two spellings of one failure.
    """

    if isinstance(exc, SyntaxError):
        return (exc.lineno or 1, f"syntax error: {exc.msg}", "correct Python syntax")
    return (1, f"read failed: {exc}", f"make {path.name} readable")
```

In `sdk/tongflow/scan.py`, replace the swallow in `_scan_methods_by_slot_in_file` (add `parse_failure_reason` to the `._ast_utils` import list, keeping it alphabetical):

```python
    try:
        src = path.read_text(encoding="utf-8")
        tree = ast.parse(src, filename=str(path))
    except (OSError, SyntaxError) as exc:
        # A file that will not parse HAS a reason. Returning it in the
        # `rejections` slot both routes it into `errors` and lets the existing
        # `if not rejections:` guard suppress the generic entry.py line.
        line, reason, hint = parse_failure_reason(exc, path)
        return {}, set(), [], [_scan_error(path, reason, hint, line=line)]
```

In `sdk/tongflow/parse_deploy.py`, replace the two guards in `parse_deploy_py` (add `parse_failure_reason` to the `._ast_utils` import list):

```python
    try:
        src = path.read_text(encoding="utf-8")
    except OSError as e:
        line, reason, hint = parse_failure_reason(e, path)
        return None, f"{path}:{line}: {reason}; fix: {hint}"
    try:
        tree = ast.parse(src, filename=str(path))
    except SyntaxError as e:
        line, reason, hint = parse_failure_reason(e, path)
        return None, f"{path}:{line}: {reason}; fix: {hint}"
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_diagnostics.py`

Expected: PASS. `test_parse_failure_wording_single_source_mutation` depends on Task 4 surfacing the deploy error — if it still fails on the deploy half only, complete Task 4 and re-run.

- [ ] **Step 5: Commit**

```bash
git add sdk/tongflow/_ast_utils.py sdk/tongflow/scan.py sdk/tongflow/parse_deploy.py sdk/tests/test_scan_diagnostics.py
git commit -m "fix(sdk): one wording for a file that will not parse, shared by both readers"
```

---

### Task 4: The deploy parser's error string stops being discarded

**Files:**
- Modify: `sdk/tongflow/scan.py:374` (inside `scan()`, the `@deploy` fallback)
- Test: `sdk/tests/test_scan_diagnostics.py`

**Interfaces:**
- Consumes: `parse_failure_reason` wording from Task 3 (for the read/syntax variants).
- Produces: no signature change.

**Serves:** AC-9 · eval E9 · **independent: false** (same file as Tasks 2–3)

- [ ] **Step 1: Write the failing test**

Append to `sdk/tests/test_scan_diagnostics.py`:

```python
_DUP_DEPLOY = (
    "from tongflow import deploy\n"
    "from tongflow.slots import node_slot, NodeSlots\n" + _IMPORT + "\n\n"
    "@deploy\n"
    "class A:\n"
    "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "    def compose_overlay(self, input: ComposeOverlayInput) -> ComposeOverlayOutput:\n"
    "        ...\n\n"
    "@deploy\n"
    "class B:\n"
    "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "    def compose_overlay(self, input: ComposeOverlayInput) -> ComposeOverlayOutput:\n"
    "        ...\n"
)


def test_deploy_parse_error_surfaces_in_scan_errors(tmp_path):
    """AC-9 — the string parse_deploy_py returns is already correctly worded;
    the defect is `dscan, _derr = ...` dropping it on the floor. Asserts the
    RETURNED string surfaces, not merely that some error exists."""
    root = tmp_path / "plugins"
    pdir = root / _PLUGIN_ID
    pdir.mkdir(parents=True)
    (pdir / "entry.py").write_text("def main() -> None:\n    ...\n", encoding="utf-8")
    (pdir / "deploy.py").write_text(_DUP_DEPLOY, encoding="utf-8")

    from tongflow.parse_deploy import parse_deploy_py

    _scan, derr = parse_deploy_py(pdir / "deploy.py")
    assert derr, "the fixture must be a shape parse_deploy_py rejects"

    payload = scan(root, _write_abi(tmp_path))
    msgs = _problems(payload)
    assert derr in msgs, (
        f"the deploy parser's own error string was discarded. Expected {derr!r} "
        f"in the scan errors; got {msgs}"
    )
    assert not _generic(msgs), f"the generic line must yield to it; got {msgs}"
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_diagnostics.py::test_deploy_parse_error_surfaces_in_scan_errors`

Expected: FAIL — `msgs` holds only the generic `entry.py:1` line; the assertion prints the discarded string it expected.

- [ ] **Step 3: Write minimal implementation**

In `sdk/tongflow/scan.py`, replace the discard:

```python
            dscan, derr = parse_deploy_py(deploy_py)
            if derr:
                # Already framed as `path:line: reason; fix: hint`. Appending to
                # `rejections` is what lets the generic entry.py line yield.
                rejections.append(derr)
                errors.append({"pluginId": plugin_id, "message": derr})
            if dscan:
```

Handle `derr` and `dscan` independently so the docstring's "scan may still be partial" promise stays true if that ever becomes so.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_diagnostics.py`

Expected: PASS, including `test_parse_failure_wording_single_source_mutation`.

- [ ] **Step 5: Commit**

```bash
git add sdk/tongflow/scan.py sdk/tests/test_scan_diagnostics.py
git commit -m "fix(sdk): keep the deploy parser's error instead of dropping it"
```

---

### Task 5: The legacy Inference branch merges with dedupe

**Files:**
- Modify: `sdk/tongflow/parse_deploy.py:203-211` (the `else:` branch of `parse_deploy_py`)
- Test: `sdk/tests/test_scan_diagnostics.py`

**Interfaces:**
- Consumes: nothing.
- Produces: no signature change. `DeployScan.slot_problems` stays a `tuple[tuple[int, str], ...]`.

**Serves:** AC-11, AC-12 · evals E11, E12 · **independent: false** (same file as Task 3)

- [ ] **Step 1: Write the failing tests**

Append to `sdk/tests/test_scan_diagnostics.py`:

```python
_HEAD_MIN = (
    "from tongflow import deploy\n"
    "from tongflow.slots import node_slot, NodeSlots\n" + _IMPORT + "\n\n"
)

_RARE_SHAPE = _HEAD_MIN + (
    "@deploy\n"
    "class Marked:\n"
    "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "    def marked_handler(self, input) -> ComposeOverlayOutput:\n"
    "        ...\n\n"
    "class Inference:\n"
    "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "    def legacy_handler(self, input) -> ComposeOverlayOutput:\n"
    "        ...\n"
)

_ORDINARY_SHAPE = _HEAD_MIN + (
    "@deploy\n"
    "class Inference:\n"
    "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "    def only_handler(self, input) -> ComposeOverlayOutput:\n"
    "        ...\n"
)


def test_deploy_and_inference_reasons_both_survive(tmp_path):
    """AC-11 — the RARE shape: a @deploy class registering nothing beside a
    separately-named Inference class. Assign-not-extend drops the @deploy half."""
    from tongflow.parse_deploy import parse_deploy_py

    p = tmp_path / "deploy.py"
    p.write_text(_RARE_SHAPE, encoding="utf-8")
    scanned, err = parse_deploy_py(p)
    assert err is None, err
    assert scanned is not None
    named = {reason.split(":")[0] for _line, reason in scanned.slot_problems}
    assert named == {"marked_handler", "legacy_handler"}, (
        f"reasons from BOTH classes must survive; got {sorted(named)} from "
        f"{scanned.slot_problems}"
    )


def test_ordinary_shape_reports_each_reason_once(tmp_path):
    """AC-12 — the trap in fixing AC-11, not a nicety. Both readers parse the
    SAME class here and produce identical (line, reason) tuples, so a naive
    .extend() doubles every reason for every ordinary deploy-first plugin.
    Overwriting is what hides that today. Asserted by COUNT, not membership."""
    from tongflow.parse_deploy import parse_deploy_py

    p = tmp_path / "deploy.py"
    p.write_text(_ORDINARY_SHAPE, encoding="utf-8")
    scanned, err = parse_deploy_py(p)
    assert err is None, err
    assert scanned is not None
    assert len(scanned.slot_problems) == 1, (
        f"each reason must appear exactly once; got {len(scanned.slot_problems)} "
        f"entries: {scanned.slot_problems}"
    )
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_diagnostics.py -k "inference_reasons or reason_once"`

Expected: `test_deploy_and_inference_reasons_both_survive` FAILS (only `legacy_handler` survives the overwrite). `test_ordinary_shape_reports_each_reason_once` PASSES — the overwrite happens to be correct there, which is precisely why the bug looks reasonable. Keep it: it is the guard that stops the fix from doubling.

- [ ] **Step 3: Write minimal implementation**

In `sdk/tongflow/parse_deploy.py`, replace `slot_problems = legacy_slot_problems` in the `else:` branch:

```python
                # Extend, do not assign — a @deploy class that registered
                # nothing still has reasons worth keeping. Dedupe on the
                # (lineno, reason) tuple because in the ORDINARY shape the
                # @deploy class IS `Inference`, so both readers parse the same
                # class and produce identical tuples; a naive extend would
                # report every reason twice for every deploy-first plugin.
                for problem in legacy_slot_problems:
                    if problem not in slot_problems:
                        slot_problems.append(problem)
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_diagnostics.py`

Expected: PASS, all.

- [ ] **Step 5: Run the full SDK suite before moving to the gate scripts**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q`

Expected: PASS. This is the whole-suite floor — every earlier feature that owns a file under `sdk/` must stay green.

- [ ] **Step 6: Commit**

```bash
git add sdk/tongflow/parse_deploy.py sdk/tests/test_scan_diagnostics.py
git commit -m "fix(sdk): merge legacy Inference reasons with dedupe instead of overwriting"
```

---

### Task 6: The teeth script — every new measure must have been red

**Files:**
- Create: `scripts/plugins/check-diagnostics-teeth.sh`

**Interfaces:**
- Consumes: the tests from Tasks 1–5 and the code they measure.
- Produces: subcommands `scope-gate`, `parse-failure`, `dedupe`, `shared-walker`. Each perturbs a COPY of the tree, re-runs the relevant tests, and requires them to go red with a pinned message.

**Serves:** AC-1, AC-6, AC-7, AC-12 · evals E6c, E15, E16, E17 · **independent: false** (needs Tasks 1–5)

- [ ] **Step 1: Write the script**

Create `scripts/plugins/check-diagnostics-teeth.sh`:

```bash
#!/usr/bin/env bash
# scan-scope-diagnostics — the red halves. A green that has never been red does
# not distinguish "the code is right" from "the measure never ran".
#
# Each subcommand perturbs a COPY of the tree, re-runs the tests that claim to
# catch that perturbation, and requires them to go RED with a message naming
# what went missing — not merely a non-zero exit.
set -euo pipefail

mode="${1:-}"
root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cp -R "$root/sdk" "$work/sdk"
find "$work/sdk" -name __pycache__ -type d -prune -exec rm -rf {} + 2>/dev/null || true

py_run() {
  (cd "$work/sdk" && PYTHONPATH=. uv run --no-project --with pytest --with tomli \
    --with pydantic --with typing_extensions python -m pytest -q "$@" 2>&1)
}

expect_red() {
  local needle="$1"; shift
  local out rc
  set +e
  out=$(py_run "$@")
  rc=$?
  set -e
  if [ "$rc" -eq 0 ]; then
    echo "FAIL: the perturbation was NOT caught — these tests stayed green:"
    printf '  %s\n' "$@"
    exit 1
  fi
  if ! printf '%s' "$out" | grep -qF "$needle"; then
    echo "FAIL: the tests went red but never named what went missing."
    echo "      expected the output to contain: $needle"
    printf '%s\n' "$out" | tail -30
    exit 1
  fi
  echo "ok: perturbation caught, and the failure names \"$needle\""
}

expect_green() {
  if ! py_run "$@" >/dev/null; then
    echo "FAIL: these tests were expected to STAY GREEN under this perturbation:"
    printf '  %s\n' "$@"
    exit 1
  fi
  echo "ok: stayed green as expected"
}

T=tests/test_scan_diagnostics.py

case "$mode" in
  scope-gate)
    # Revert the gate to the old first-level identity set.
    python3 - "$work/sdk/tongflow/scan.py" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old = """    module_scope: set[int] = set()
    _walk_module_scope(tree, lambda stmt: module_scope.add(id(stmt)))"""
assert old in s, "scope-gate perturbation found nothing to revert"
s = s.replace(old, "    module_scope = {id(node) for node in tree.body}", 1)
open(p, "w", encoding="utf-8").write(s)
PY
    expect_red "compose_overlay" \
      "$T::test_reason_for_malformed_def_in_module_block" \
      "$T::test_rejection_in_non_scope_block" \
      "$T::test_rejection_in_nested_blocks"
    ;;

  shared-walker)
    # Neuter the ONE shared function. Both consumers must change behaviour —
    # a unit test of the walker cannot prove that scan.py routes through it.
    python3 - "$work/sdk/tongflow/_ast_utils.py" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old = "    for child in ast.iter_child_nodes(node):"
assert old in s, "shared-walker perturbation found nothing to neuter"
s = s.replace(old, "    return\n" + old, 1)
open(p, "w", encoding="utf-8").write(s)
PY
    echo "-- consumer 1: the rejection gate in scan.py"
    expect_red "compose_overlay" "$T::test_reason_for_malformed_def_in_module_block"
    echo "-- consumer 2: the import collector"
    expect_red "compose-overlay" "tests/test_scan_scope.py::test_non_scope_block_collects_import"
    ;;

  parse-failure)
    # Restore BOTH swallows: the bare except and the discarded _derr.
    python3 - "$work/sdk/tongflow/scan.py" <<'PY'
import re, sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
s2 = re.sub(
    r"    except \(OSError, SyntaxError\) as exc:\n(?:.*\n)*?        return \{\}, set\(\), \[\], \[_scan_error\(path, reason, hint, line=line\)\]",
    "    except (OSError, SyntaxError):\n        return {}, set(), [], []",
    s, count=1)
assert s2 != s, "parse-failure perturbation did not restore the bare except"
s3 = s2.replace("            dscan, derr = parse_deploy_py(deploy_py)", "            dscan, derr = parse_deploy_py(deploy_py)\n            derr = None", 1)
assert s3 != s2, "parse-failure perturbation did not restore the _derr discard"
open(p, "w", encoding="utf-8").write(s3)
PY
    expect_red "no @node_slot" \
      "$T::test_syntax_error_names_its_own_file_and_line" \
      "$T::test_deploy_parse_error_surfaces_in_scan_errors"
    ;;

  dedupe)
    # Replace the order-preserving dedupe with a naive extend. E12 must go RED
    # while E11 STAYS GREEN — a perturbation that reddens everything proves only
    # that the suite notices change, not that E12 catches double-reporting.
    python3 - "$work/sdk/tongflow/parse_deploy.py" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old = """                for problem in legacy_slot_problems:
                    if problem not in slot_problems:
                        slot_problems.append(problem)"""
assert old in s, "dedupe perturbation found nothing to replace"
s = s.replace(old, "                slot_problems.extend(legacy_slot_problems)", 1)
open(p, "w", encoding="utf-8").write(s)
PY
    expect_red "exactly once" "$T::test_ordinary_shape_reports_each_reason_once"
    expect_green "$T::test_deploy_and_inference_reasons_both_survive"
    ;;

  *)
    echo "usage: $0 {scope-gate|shared-walker|parse-failure|dedupe}" >&2
    exit 2
    ;;
esac
```

- [ ] **Step 2: Make it executable and run all four subcommands**

```bash
chmod +x scripts/plugins/check-diagnostics-teeth.sh
bash scripts/plugins/check-diagnostics-teeth.sh scope-gate
bash scripts/plugins/check-diagnostics-teeth.sh shared-walker
bash scripts/plugins/check-diagnostics-teeth.sh parse-failure
bash scripts/plugins/check-diagnostics-teeth.sh dedupe
```

Expected: each prints `ok:` lines and exits 0. If any prints `FAIL: the perturbation was NOT caught`, the corresponding test does not actually measure what it claims — fix the test, not the script.

- [ ] **Step 3: Commit**

```bash
git add scripts/plugins/check-diagnostics-teeth.sh
git commit -m "test(plugins): red halves for the scope gate, shared walker, parse failure and dedupe"
```

---

### Task 7: The noise check, split so it cannot be vacuously green

**Files:**
- Create: `scripts/plugins/check-diagnostics-noise.sh`

**Interfaces:**
- Consumes: the committed fixture tree at `sdk/tests/fixtures/scan_scope/plugins`.
- Produces: subcommands `fixture` (never skips, asserts a non-zero plugin count) and `real` (named skip when `plugins/` is empty or absent).

**Serves:** AC-13 · evals E13, E13b · **independent: true** (touches no file any other task touches)

- [ ] **Step 1: Write the script**

Create `scripts/plugins/check-diagnostics-noise.sh`:

```bash
#!/usr/bin/env bash
# AC-13 — the new diagnostics must not turn healthy plugins noisy.
#
# A DELTA across two code points over the SAME tree: compare the SET OF PLUGIN
# IDS carrying problems at the base and at HEAD, red iff HEAD carries an id the
# base did not. Two subcommands on purpose: `plugins/` is gitignored and
# populated at runtime, so a delta over an empty tree compares two empty sets
# and is green for the wrong reason. `fixture` always runs; `real` skips by name.
set -euo pipefail

mode="${1:-fixture}"
root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
py="${PYTHON:-python3}"
abi="$root/config/tongflow.abi.json"

case "$mode" in
  fixture) plugins_root="$root/sdk/tests/fixtures/scan_scope/plugins" ;;
  real)    plugins_root="$root/plugins" ;;
  *) echo "usage: $0 {fixture|real}" >&2; exit 2 ;;
esac

count=0
if [ -d "$plugins_root" ]; then
  count=$(ls -1 "$plugins_root" 2>/dev/null | wc -l | tr -d ' ')
fi

if [ "$count" -eq 0 ]; then
  if [ "$mode" = "real" ]; then
    echo "SKIP: plugins/ holds no plugin — it is gitignored and populated at"
    echo "      runtime. Run \`pnpm plugins:install\` to widen this check."
    exit 0
  fi
  echo "FAIL: the committed fixture tree $plugins_root is empty, so this delta"
  echo "      would compare two empty sets and pass without measuring anything."
  exit 1
fi

base="${DIAG_BASE_REF:-feat/scan-with-block-imports}"
if ! git -C "$root" rev-parse --verify -q "$base" >/dev/null 2>&1; then
  base=origin/main
fi
base_sha=$(git -C "$root" merge-base HEAD "$base")

# `python -m` puts the working directory FIRST on sys.path, ahead of PYTHONPATH.
# Run from a directory holding no `tongflow`, and assert which tree each run
# actually loaded — otherwise both runs load the same package and the delta is
# green by construction.
neutral_cwd=$(mktemp -d)

ids_at() {
  local tree="$1" loaded
  loaded=$(cd "$neutral_cwd" && PYTHONPATH="$tree/sdk" "$py" -c 'import tongflow; print(tongflow.__file__)')
  case "$loaded" in
    "$tree/sdk/"*) : ;;
    *)
      echo "FAIL: the scan meant to measure $tree/sdk loaded tongflow from" >&2
      echo "      $loaded instead — this delta would compare a tree against itself." >&2
      return 1 ;;
  esac
  (cd "$neutral_cwd" && PYTHONPATH="$tree/sdk" "$py" -m tongflow --root "$plugins_root" --abi "$abi") \
    | "$py" -c '
import json, sys
payload = json.load(sys.stdin)
print("\n".join(sorted({str(e.get("pluginId")) for e in payload.get("errors", [])})))
'
}

work=$(mktemp -d)
cleanup() {
  git -C "$root" worktree remove --force "$work/base" >/dev/null 2>&1 || true
  rm -rf "$work" "$neutral_cwd"
}
trap cleanup EXIT

git -C "$root" worktree add --detach "$work/base" "$base_sha" >/dev/null 2>&1
before=$(ids_at "$work/base")
after=$(ids_at "$root")

new=$(comm -13 <(echo "$before") <(echo "$after") || true)
if [ "$new" != "" ]; then
  echo "FAIL: over $count plugin(s) in $mode mode, HEAD reports problems for"
  echo "      plugin(s) the base ($base_sha) did not:"
  echo "$new" | sed 's/^/  - /'
  exit 1
fi
echo "ok: $mode mode, $count plugin(s), base $base_sha — no plugin became newly problematic"
```

- [ ] **Step 2: Make it executable and run both subcommands**

```bash
chmod +x scripts/plugins/check-diagnostics-noise.sh
bash scripts/plugins/check-diagnostics-noise.sh fixture
bash scripts/plugins/check-diagnostics-noise.sh real
```

Expected: `fixture` prints `ok: fixture mode, 1 plugin(s), base <sha> …` and exits 0. `real` either prints the same for the installed tree or prints the named `SKIP:` and exits 0.

- [ ] **Step 3: Prove the fixture half cannot skip**

```bash
mkdir -p /tmp/emptyfixture && bash -c 'cd /tmp && true'
```

Then temporarily point the fixture at an empty directory to confirm it reds rather than skips:

```bash
sed 's#sdk/tests/fixtures/scan_scope/plugins#sdk/tests/fixtures/does-not-exist#' \
  scripts/plugins/check-diagnostics-noise.sh > /tmp/noise-empty.sh
bash /tmp/noise-empty.sh fixture; echo "exit=$?"
```

Expected: prints `FAIL: the committed fixture tree … is empty` and `exit=1`. Delete `/tmp/noise-empty.sh` afterwards.

- [ ] **Step 4: Commit**

```bash
git add scripts/plugins/check-diagnostics-noise.sh
git commit -m "test(plugins): split the noise delta so an empty plugins tree cannot pass it"
```

---

### Task 8: The blast-radius check, with a base that must be real

**Files:**
- Create: `scripts/plugins/check-diagnostics-blast-radius.sh`

**Interfaces:**
- Consumes: nothing.
- Produces: a check reading `DIAG_BASE_REF` (default `feat/scan-with-block-imports`), printing the resolved base SHA and asserting it is a strict ancestor of HEAD with a non-empty diff.

**Serves:** AC-14 · eval E14 · **independent: true** (touches no file any other task touches)

- [ ] **Step 1: Write the script**

Create `scripts/plugins/check-diagnostics-blast-radius.sh`:

```bash
#!/usr/bin/env bash
# AC-14 — this package must not widen its blast radius, and ships no release.
#
# The base is PINNED to the stacked parent tip, printed into the evidence, and
# asserted to be a strict ancestor of HEAD with a NON-EMPTY diff. Without that
# last clause the check is green whenever the base resolves onto HEAD — after a
# rebase of the stacked parent, say — and reports a clean radius having
# compared nothing.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

base="${DIAG_BASE_REF:-feat/scan-with-block-imports}"
if ! git -C "$root" rev-parse --verify -q "$base" >/dev/null 2>&1; then
  echo "note: $base not found, falling back to origin/main (a WIDER window)"
  base=origin/main
fi
base_sha=$(git -C "$root" merge-base HEAD "$base")
head_sha=$(git -C "$root" rev-parse HEAD)
echo "base: $base_sha  (from $base)"
echo "head: $head_sha"

if [ "$base_sha" = "$head_sha" ]; then
  echo "FAIL: the base resolved onto HEAD — there is nothing to compare, and a"
  echo "      green here would mean only that no diff was examined."
  exit 1
fi
if ! git -C "$root" merge-base --is-ancestor "$base_sha" "$head_sha"; then
  echo "FAIL: $base_sha is not an ancestor of HEAD."
  exit 1
fi

changed=$(git -C "$root" diff --name-only "$base_sha"...HEAD)
if [ -z "$changed" ]; then
  echo "FAIL: the diff against $base_sha is empty — nothing was compared."
  exit 1
fi

gated='^(config/tongflow\.abi\.json|src/generated/abi/|src/lib/abi/|src/db/|src/lib/plugin-executor/|src/lib/workflow/|src/app/api/)'
offenders=$(printf '%s\n' "$changed" | grep -E "$gated" || true)
if [ -n "$offenders" ]; then
  echo "FAIL: this package touched contract chokepoints it promised not to:"
  printf '%s\n' "$offenders" | sed 's/^/  - /'
  exit 1
fi

for f in sdk/pyproject.toml sdk/tongflow/__init__.py; do
  if git -C "$root" diff "$base_sha"...HEAD -- "$f" | grep -qE '^[+-].*version'; then
    echo "FAIL: a version string changed in $f — this package ships no release."
    git -C "$root" diff "$base_sha"...HEAD -- "$f" | grep -E '^[+-].*version' | sed 's/^/  /'
    exit 1
  fi
done

echo "ok: $(printf '%s\n' "$changed" | wc -l | tr -d ' ') file(s) changed against $base_sha;"
echo "    no contract chokepoint touched, no SDK version bumped"
```

- [ ] **Step 2: Make it executable and run it**

```bash
chmod +x scripts/plugins/check-diagnostics-blast-radius.sh
bash scripts/plugins/check-diagnostics-blast-radius.sh
```

Expected: prints the base and head SHAs, then `ok: N file(s) changed …`, exit 0.

- [ ] **Step 3: Prove the empty-diff guard has teeth**

```bash
DIAG_BASE_REF=HEAD bash scripts/plugins/check-diagnostics-blast-radius.sh; echo "exit=$?"
```

Expected: prints `FAIL: the base resolved onto HEAD` and `exit=1`. This is the case the gap-probe flagged — without it, pointing the base at the current tip reports a clean radius having compared nothing.

- [ ] **Step 4: Commit**

```bash
git add scripts/plugins/check-diagnostics-blast-radius.sh
git commit -m "test(plugins): pin the blast-radius base and require a real comparison"
```

---

### Task 9: Whole-package verification before handing to S4

**Files:** none modified.

**Serves:** every criterion · **independent: false**

- [ ] **Step 1: Run every eval command the contract declares**

```bash
cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q
```

```bash
bash scripts/plugins/check-diagnostics-teeth.sh scope-gate && bash scripts/plugins/check-diagnostics-teeth.sh shared-walker && bash scripts/plugins/check-diagnostics-teeth.sh parse-failure && bash scripts/plugins/check-diagnostics-teeth.sh dedupe
```

```bash
bash scripts/plugins/check-diagnostics-noise.sh fixture && bash scripts/plugins/check-diagnostics-noise.sh real && bash scripts/plugins/check-diagnostics-blast-radius.sh
```

- [ ] **Step 2: Run the repo's own commit checklist**

```bash
pnpm lint:check && pnpm typecheck && pnpm build
```

Expected: all green. `sdk/` changes do not touch TypeScript, so these should be unaffected — a failure here means something outside the plan's scope was edited.

- [ ] **Step 3: Set the contract to implemented**

Change `status: approved` to `status: implemented` in `_acceptance/scan-scope-diagnostics/contract.md`, then:

```bash
git add _acceptance/scan-scope-diagnostics/contract.md
git commit -m "chore(acceptance): scan-scope-diagnostics ready for verification"
```

Do NOT run the evals yourself as evidence. S4 dispatches fresh agents for that — the implementer is not the grader.

---

## Self-review

**Spec coverage.** Design edit 1 → Task 1. Edit 2 → Task 2. Edit 3 → Task 3. Edit 4 → Task 4. Edit 5 → Task 5. New test file → Tasks 1–5. Three new scripts → Tasks 6, 7, 8. All 15 criteria map to a task: AC-1/2/3/4/5/15 → Task 2; AC-6 → Tasks 1 and 6; AC-7/8/10 → Task 3; AC-9 → Task 4; AC-11/12 → Task 5; AC-13 → Task 7; AC-14 → Task 8.

**Type consistency.** `parse_failure_reason(exc, path) -> (line, reason, hint)` is defined in Task 3 and consumed with that exact arity in `scan.py` and `parse_deploy.py` in the same task. `_walk_module_scope(node, take)` keeps its Task 1 signature everywhere. `slot_problems` stays a `list[tuple[int, str]]` inside `parse_deploy_py` and a tuple on the frozen `DeployScan`.

**Parallelism.** Only Tasks 7 and 8 are independent, and they are two short shell scripts touching no shared file. Fanning out worktrees for them would cost more setup than it saves; execute sequentially unless the plan is being run under an existing parallel harness.
