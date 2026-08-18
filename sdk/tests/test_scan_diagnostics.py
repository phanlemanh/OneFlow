"""The scanner reports the reason it already holds, instead of blaming entry.py.

Four paths all ended at `entry.py:1: no @node_slot methods found` while a
specific reason was available: the module-scope gate disagreeing with the
registration walk, the deploy parser's error string discarded, the legacy
Inference branch overwriting reasons, and a swallowed parse failure.
"""

from __future__ import annotations

import ast
from pathlib import Path

import pytest
from tongflow._ast_utils import REASON_MISSING_ANNOTATION, _walk_module_scope
from tongflow.scan import scan

from tests.test_scan_scope import _IMPORT, _PLUGIN_ID, _problems, _write_abi


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
    """AC-1 - both halves: the reason appears at the def's own line, AND the
    generic line yields to it. Emitting the reason while still emitting the
    generic line leaves two messages disagreeing about which file is wrong."""
    src = _entry_src("with", _BAD_FN)
    _payload, msgs, line = _scan_entry(tmp_path, src)
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
    ), (
        "the block matrix no longer matches the ten keywords AC-2 names; got "
        f"{sorted(_DEF_BLOCKS)}"
    )


@pytest.mark.parametrize("keyword", sorted(_DEF_BLOCKS))
def test_rejection_in_non_scope_block(tmp_path, keyword):
    """AC-2 - ten keywords, one assertion each, so a partial implementation
    names the keyword it missed."""
    src = _entry_src(keyword, _BAD_FN)
    _payload, msgs, line = _scan_entry(tmp_path, src)
    entry = tmp_path / "plugins" / _PLUGIN_ID / "entry.py"
    assert any(f"{entry}:{line}:" in m and "compose_overlay" in m for m in msgs), (
        f"a malformed @node_slot def inside `{keyword}` produced no reason at "
        f"its own line {line}; got {msgs}"
    )


def test_rejection_in_nested_blocks(tmp_path):
    """AC-2 - two levels deep: with inside if inside try."""
    fn = _indent(_indent(_indent(_BAD_FN, 4), 4), 4)
    src = _ENTRY_HEAD + (
        "try:\n"
        "    if True:\n"
        "        with image.imports():\n" + fn + "except ImportError:\n    pass\n"
    )
    _payload, msgs, line = _scan_entry(tmp_path, src)
    entry = tmp_path / "plugins" / _PLUGIN_ID / "entry.py"
    assert any(f"{entry}:{line}:" in m for m in msgs), (
        f"a malformed def nested with/if/try produced no reason at line {line}; "
        f"got {msgs}"
    )


def test_well_formed_def_in_block_registers_and_is_quiet(tmp_path):
    """AC-3 - the GREEN half of the pair, on the same shape. Without it, AC-1
    could be satisfied by reporting unconditionally."""
    src = _entry_src("with", _GOOD_FN)
    payload, msgs, _line = _scan_entry(tmp_path, src)
    assert _PLUGIN_ID in payload["nodePluginMap"]["compose-overlay"], (
        f"a well-formed @node_slot def inside a block did not register; errors={msgs}"
    )
    assert msgs == [], f"a healthy plugin must produce no problems; got {msgs}"


def test_closure_def_is_not_reported(tmp_path):
    """AC-4 - NEGATIVE boundary: a closure is not module scope. Asserts silence
    only; the closure-registers mirror bug is Out of scope."""
    src = _ENTRY_HEAD + "def _setup():\n" + _indent(_BAD_FN, 4)
    _payload, msgs, _line = _scan_entry(tmp_path, src)
    assert not [m for m in msgs if "compose_overlay" in m], (
        "a @node_slot def inside another def was reported - the fix degraded "
        f"into reporting everything; got {msgs}"
    )


def test_class_body_method_is_not_reported_by_dir_scan(tmp_path):
    """AC-5 - NEGATIVE boundary and the noise budget in miniature. Methods on a
    class are the deploy parser's business; reporting them here too would make
    every healthy deploy-first plugin noisy."""
    src = _ENTRY_HEAD + "class Holder:\n" + _indent(_BAD_METHOD, 4)
    _payload, msgs, _line = _scan_entry(tmp_path, src)
    assert not [m for m in msgs if "compose_overlay" in m], (
        "a @node_slot method in a class body was reported by the directory "
        f"scan; got {msgs}"
    )


def test_bare_module_level_malformed_is_still_named(tmp_path):
    """AC-15 - the regression floor for the commonest shape. The noise measure
    only reddens on noise GAINED, so a gate widened to blocks while dropping
    bare module level would lose today's diagnostic with every eval green."""
    src = _entry_src(None, _BAD_FN)
    _payload, msgs, line = _scan_entry(tmp_path, src)
    entry = tmp_path / "plugins" / _PLUGIN_ID / "entry.py"
    assert any(
        f"{entry}:{line}:" in m and "compose_overlay" in m for m in msgs
    ), f"a malformed @node_slot def at column 0 lost its reason; got {msgs}"


def test_bare_module_level_well_formed_stays_quiet(tmp_path):
    """AC-15 - the green half of the same pair."""
    src = _entry_src(None, _GOOD_FN)
    payload, msgs, _line = _scan_entry(tmp_path, src)
    assert _PLUGIN_ID in payload["nodePluginMap"]["compose-overlay"], (
        f"a well-formed @node_slot def at column 0 did not register; errors={msgs}"
    )
    assert msgs == [], f"a healthy plugin must produce no problems; got {msgs}"
