"""The scanner reports the reason it already holds, instead of blaming entry.py.

Four paths all ended at `entry.py:1: no @node_slot methods found` while a
specific reason was available: the module-scope gate disagreeing with the
registration walk, the deploy parser's error string discarded, the legacy
Inference branch overwriting reasons, and a swallowed parse failure.
"""

from __future__ import annotations

import ast
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
import tongflow
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


def test_syntax_error_names_its_own_file_and_line(tmp_path):
    """AC-7 - a typo in a plugin file is the likeliest authoring mistake there
    is, and it currently produces the generic line pointing at entry.py."""
    src = _ENTRY_HEAD + "def broken(:\n    ...\n"
    root = _write_entry_plugin(tmp_path, src)
    payload = scan(root, _write_abi(tmp_path))
    msgs = _problems(payload)
    entry = root / _PLUGIN_ID / "entry.py"
    assert any(f"{entry}:4:" in m and "syntax error" in m for m in msgs), (
        f"a syntax error at line 4 of {entry} produced no problem naming that "
        f"file and line; got {msgs}"
    )
    assert not _generic(msgs), (
        f"the generic line must yield to the syntax error; got {msgs}"
    )


def test_unreadable_file_names_the_read_failure(tmp_path):
    """AC-8 - same family, other exception."""
    if os.geteuid() == 0:
        pytest.skip(
            "running as root: mode 000 is not enforced, so this cannot be measured"
        )
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
    assert not _generic(msgs), (
        f"the generic line must yield to the read failure; got {msgs}"
    )


def test_parse_failure_wording_single_source_mutation(tmp_path):
    """AC-10 - MUTATION, not equality. Replace the sentence inside
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
        "the parse-failure sentence is not a literal in _ast_utils.py - it "
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
    (deploy_plugin / "entry.py").write_text(
        "def main() -> None:\n    ...\n", encoding="utf-8"
    )
    (deploy_plugin / "deploy.py").write_text(
        "class Inference(:\n    ...\n", encoding="utf-8"
    )

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
        f"mutated copy under {copy_root} - the mutation would not be measured"
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
    out = proc.stdout
    assert sentinel in out, (
        "reader 1 (the plugin-file scan) does not route through the shared "
        f"helper. Output was:\n{out}"
    )
    assert "syntax error" not in out, (
        "reader 1 still words the failure locally, so the sentence has two "
        f"sources, not one. Output was:\n{out}"
    )

    # Reader 2 must be driven DIRECTLY. The directory scan reads every .py in
    # the plugin folder, deploy.py included, so a sentinel in the scan output
    # proves only that reader 1 saw it — counting occurrences there would let
    # one reader stand in for the other and never measure parse_deploy_py.
    direct = subprocess.run(
        [
            sys.executable,
            "-c",
            "import sys; from pathlib import Path;"
            " from tongflow.parse_deploy import parse_deploy_py;"
            " print(parse_deploy_py(Path(sys.argv[1]))[1])",
            str(deploy_plugin / "deploy.py"),
        ],
        env=env,
        cwd=str(tmp_path),
        capture_output=True,
        text=True,
        check=False,
    )
    assert sentinel in direct.stdout, (
        "reader 2 (parse_deploy_py) does not route through the shared helper - "
        f"it words the failure locally. Output was:\n{direct.stdout}{direct.stderr}"
    )
    assert "syntax error" not in direct.stdout, (
        "reader 2 still emits the old wording, so the sentence has two sources, "
        f"not one. Output was:\n{direct.stdout}"
    )


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
    """AC-9 - the string parse_deploy_py returns is already correctly worded;
    the defect is `dscan, _derr = ...` dropping it on the floor. Asserts the
    RETURNED string surfaces, not merely that some error exists."""
    from tongflow.parse_deploy import parse_deploy_py

    root = tmp_path / "plugins"
    pdir = root / _PLUGIN_ID
    pdir.mkdir(parents=True)
    (pdir / "entry.py").write_text("def main() -> None:\n    ...\n", encoding="utf-8")
    (pdir / "deploy.py").write_text(_DUP_DEPLOY, encoding="utf-8")

    _scan, derr = parse_deploy_py(pdir / "deploy.py")
    assert derr, "the fixture must be a shape parse_deploy_py rejects"

    payload = scan(root, _write_abi(tmp_path))
    msgs = _problems(payload)
    assert derr in msgs, (
        f"the deploy parser's own error string was discarded. Expected {derr!r} "
        f"in the scan errors; got {msgs}"
    )
    assert not _generic(msgs), f"the generic line must yield to it; got {msgs}"


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
    """AC-11 - the RARE shape: a @deploy class registering nothing beside a
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
    """AC-12 - the trap in fixing AC-11, not a nicety. Both readers parse the
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
