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
from tongflow._ast_utils import (
    REASON_MISSING_ANNOTATION,
    REASON_MISSING_INPUT_PARAM,
    REASON_NOT_SDK_MODEL,
)
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
    assert not [m for m in _problems(payload) if "no @node_slot" in m], _problems(
        payload
    )


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


_SPELLINGS = {
    "plain": (
        "from tongflow.models.compose_overlay import "
        "ComposeOverlayInput, ComposeOverlayOutput",
        "ComposeOverlayInput",
        "ComposeOverlayOutput",
    ),
    # The alias keeps the Input/Output suffix on purpose: an annotation whose
    # name drops it is rejected by the suffix rule in looks_like_sdk_model_type
    # at module level too, so aliasing to `CIn` would measure that rule rather
    # than this one.
    "aliased": (
        "from tongflow.models.compose_overlay import "
        "ComposeOverlayInput as OverlayInput, ComposeOverlayOutput as OverlayOutput",
        "OverlayInput",
        "OverlayOutput",
    ),
    "module_alias": (
        "import tongflow.models.compose_overlay as m",
        "m.ComposeOverlayInput",
        "m.ComposeOverlayOutput",
    ),
}


def _spelling_slots(
    tmp_path: Path, import_block: str, in_ann: str, out_ann: str
) -> dict[str, str]:
    src = (
        _HEAD
        + import_block
        + "\n@deploy\n@app.cls(image=image)\nclass Inference:\n"
        + "    @node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
        + f"    def compose_overlay(self, input: {in_ann}) -> {out_ann}:\n"
        + "        ...\n"
    )
    tmp_path.mkdir(parents=True, exist_ok=True)
    path = tmp_path / "deploy.py"
    path.write_text(src, encoding="utf-8")
    scanned, err = parse_deploy_py(path)
    assert err is None, err
    assert scanned is not None
    return scanned.methods_by_slot


@pytest.mark.parametrize("spelling", sorted(_SPELLINGS))
def test_import_spelling_inside_block(tmp_path, spelling):
    """AC-5 — all three supported spellings behave inside a non-scope block
    exactly as they do at module level. Parity is the claim, so the module-level
    result is measured here rather than assumed."""
    stmt, in_ann, out_ann = _SPELLINGS[spelling]
    at_module = _spelling_slots(tmp_path / "module", f"{stmt}\n", in_ann, out_ann)
    in_block = _spelling_slots(
        tmp_path / "block", f"with image.imports():\n    {stmt}\n", in_ann, out_ann
    )
    assert in_block == at_module, (
        f"import spelling `{spelling}` behaves differently inside a `with` block "
        f"({in_block}) than at module level ({at_module})"
    )
    assert in_block == {_SLOT_IDENT: "compose_overlay"}, (
        f"import spelling `{spelling}` was not collected inside a `with` block; "
        f"got {in_block}"
    )


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
