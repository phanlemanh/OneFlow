"""Scope-boundary import collection and the reasons a slot was skipped.

An import statement binds its name in the enclosing scope. Only `def`, `class`
and `lambda` open a new one — `with`, `if`, `for`, `try`, `match` do not. The
collector used to name block types instead, knew only `ast.Try`, and so missed
the Modal idiom `with image.imports():` — the slot went unserved and the scanner
blamed the wrong file.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
import tongflow
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


def test_block_matrix_covers_the_ten_keywords():
    """AC-3 pins the SIZE of the matrix, not just its contents: the criterion
    says ten keywords, one assertion each. Without this, deleting a row shrinks
    the matrix silently and every remaining row still passes."""
    assert sorted(_BLOCKS) == sorted(
        [
            "with",
            "if",
            "elif",
            "else",
            "for",
            "while",
            "try",
            "except",
            "finally",
            "match",
        ]
    ), f"the block matrix no longer matches the ten keywords AC-3 names; got {sorted(_BLOCKS)}"


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
    # ONE predicate over ONE problem. Two independent any() calls would accept a
    # payload where the anchor sits on one message and the reason on another —
    # that is the presence of two substrings, not the relation the criterion is
    # about ("the relation is the point", contract.md:72).
    assert any(
        m.startswith(f"{deploy}:{line}:")
        and "compose_overlay" in m
        and REASON_NOT_SDK_MODEL in m
        for m in problems
    ), (
        f"no SINGLE problem carrying all three things AC-7 asks for — anchored at "
        f"{deploy}:{line}, naming the method compose_overlay, and carrying reason "
        f"{REASON_NOT_SDK_MODEL!r}; got {problems}"
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


_ENTRY_BAD = (
    "from tongflow.slots import node_slot, NodeSlots\n\n\n"
    "@node_slot(NodeSlots.COMPOSE_OVERLAY)\n"
    "def compose_overlay(input: dict) -> dict:\n"
    "    ...\n"
)


def test_reason_single_source_mutation(tmp_path):
    """AC-10 — MUTATION, not equality. Replace the sentence inside _ast_utils.py
    with a sentinel on a copy of the tree; if either reader still emits the old
    wording, the reason is duplicated at that call site. Two equal strings cannot
    tell one source from two identical copies; only the mutation can."""
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

    # cwd must NOT be the repo's sdk/: `python -m` puts the working directory
    # first on sys.path, which would shadow the mutated copy with the real
    # package and quietly measure the wrong tree.
    env = {**os.environ, "PYTHONPATH": str(copy_root)}
    probe = subprocess.run(
        [sys.executable, "-c", "import tongflow; print(tongflow.__file__)"],
        env=env,
        cwd=str(tmp_path),
        capture_output=True,
        text=True,
        check=False,
    )
    assert probe.stdout.strip().startswith(str(copy_root)), (
        f"the subprocess loaded tongflow from {probe.stdout.strip()!r}, not the "
        f"mutated copy under {copy_root} — the mutation would not be measured"
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
        env=env,
        cwd=str(tmp_path),
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


def test_models_roots_walk_runs_once_per_module(monkeypatch):
    """The boundary walk visits the whole tree, and every annotation check needs
    the same answer — so it must be computed once per module, not once per check.
    Counted, not timed: a timing assertion would be flaky, and the defect this
    pins (O(functions x nodes) per file) is a count, not a duration."""
    import ast as ast_mod

    from tongflow import _ast_utils

    src = _HEAD + f"with image.imports():\n    {_IMPORT}\n" + _CLASS
    tree = ast_mod.parse(src)

    calls = {"n": 0}
    real_walk = _ast_utils._walk_module_scope

    def counting_walk(node, take):
        if isinstance(node, ast_mod.Module):
            calls["n"] += 1
        real_walk(node, take)

    _ast_utils._collect_models_roots.cache_clear()
    monkeypatch.setattr(_ast_utils, "_walk_module_scope", counting_walk)

    # Two annotation checks on the same module — input and return of one method.
    for suffix in ("Input", "Output"):
        _ast_utils.looks_like_sdk_model_type(
            ast_mod.Name(id=f"ComposeOverlay{suffix}"), suffix, tree
        )

    assert calls["n"] == 1, (
        f"the module-scope walk ran {calls['n']} times for one module — it is "
        "being recomputed per annotation check instead of memoised"
    )
