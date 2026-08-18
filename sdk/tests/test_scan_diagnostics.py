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
