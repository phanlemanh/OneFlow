"""Directory-name conventions the scanner enforces.

`oneflow-` is the current convention; `tongflow-` is accepted as legacy because
the official plugins are upstream repos under an org this fork does not control.

This gate runs before a directory's contents are read, so it decides whether a
plugin exists at all. Widening the installer's regex without widening this let a
plugin install and then never register — the defect these tests pin down.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from tongflow.scan import scan

_ABI = {
    "version": 1,
    "$defs": {"Asset": {"type": "object"}, "ImageRef": {"type": "object"}},
    "nodes": [
        {
            "nodeSlot": "image-gen",
            "inputs": {"type": "object", "properties": {"text": {"type": "string"}}},
            "outputs": {
                "type": "object",
                "properties": {"image": {"$ref": "#/$defs/ImageRef"}},
            },
        }
    ],
}

_HANDLERS = """
from tongflow.slots import node_slot, NodeSlots
from tongflow.models.image_gen import ImageGenInput, ImageGenOutput

@node_slot(NodeSlots.IMAGE_GEN)
def image_gen(input: ImageGenInput) -> ImageGenOutput:
    ...
"""


def _abi(tmp_path: Path) -> Path:
    p = tmp_path / "abi.json"
    p.write_text(json.dumps(_ABI), encoding="utf-8")
    return p


def _scan_dirs(tmp_path: Path, *names: str) -> dict:
    """Scan a plugins root holding one byte-identical plugin per name."""
    root = tmp_path / "plugins"
    for name in names:
        pdir = root / name
        pdir.mkdir(parents=True)
        (pdir / "entry.py").write_text(_HANDLERS, encoding="utf-8")
    return scan(root, _abi(tmp_path))


def _ids(payload: dict) -> set[str]:
    # `plugins` is keyed by pluginId, not a list.
    return set(payload["plugins"])


def _error_for(payload: dict, plugin_id: str) -> str:
    for e in payload["errors"]:
        if e["pluginId"] == plugin_id:
            return e["message"]
    return ""


@pytest.mark.parametrize(
    "name",
    ["oneflow-modal-foo", "oneflow-api-foo", "tongflow-modal-foo", "tongflow-api-foo"],
)
def test_both_conventions_register(tmp_path: Path, name: str) -> None:
    payload = _scan_dirs(tmp_path, name)
    assert _ids(payload) == {name}
    assert payload["errors"] == []


def test_identical_plugins_differing_only_in_prefix_fare_identically(
    tmp_path: Path,
) -> None:
    """The regression itself: same bytes, different prefix, same outcome.

    Before the fix an `oneflow-` directory was rejected at the prefix gate while
    its byte-identical `tongflow-` twin registered.
    """
    payload = _scan_dirs(tmp_path, "oneflow-modal-foo", "tongflow-modal-foo")
    assert _ids(payload) == {"oneflow-modal-foo", "tongflow-modal-foo"}
    assert payload["errors"] == []

    one = dict(payload["plugins"]["oneflow-modal-foo"])
    tong = dict(payload["plugins"]["tongflow-modal-foo"])
    # `localSubdir` is the directory name, so it differs by construction.
    # Everything else must be identical: the prefix is a label, not a behaviour
    # switch, and a difference anywhere else would mean it still steers something.
    assert one.pop("localSubdir") == "oneflow-modal-foo"
    assert tong.pop("localSubdir") == "tongflow-modal-foo"
    assert one == tong

    # And both are offered for the slot, in directory order.
    assert sorted(payload["nodePluginMap"]["image-gen"]) == [
        "oneflow-modal-foo",
        "tongflow-modal-foo",
    ]


@pytest.mark.parametrize(
    "name",
    [
        "foo-modal-bar",
        "flow-modal-bar",
        "oneflowmodal-foo",
        "one-flow-modal-foo",
        "oneflow-worker-foo",
        "oneflow-foo",
    ],
)
def test_unknown_prefix_is_still_rejected(tmp_path: Path, name: str) -> None:
    payload = _scan_dirs(tmp_path, name)
    assert _ids(payload) == set()
    assert "unknown pluginId prefix" in _error_for(payload, name)


def test_unknown_prefix_hint_leads_with_oneflow(tmp_path: Path) -> None:
    payload = _scan_dirs(tmp_path, "foo-modal-bar")
    msg = _error_for(payload, "foo-modal-bar")
    one, tong = msg.index("oneflow-modal-"), msg.index("tongflow-modal-")
    assert one < tong, "the hint must teach the current convention first"
    assert "legacy" in msg


@pytest.mark.parametrize(
    "name",
    [
        "oneflow-modal-gpu-foo",
        "oneflow-modal-cpu-foo",
        "oneflow-api-gpu-foo",
        "oneflow-api-cpu-foo",
        "tongflow-modal-gpu-foo",
        "tongflow-api-cpu-foo",
    ],
)
def test_hardware_in_the_id_is_still_rejected(tmp_path: Path, name: str) -> None:
    """Widening the prefix must not widen anything else."""
    payload = _scan_dirs(tmp_path, name)
    assert _ids(payload) == set()
    assert "must not encode gpu/cpu" in _error_for(payload, name)


@pytest.mark.parametrize("name", ["OneFlow-Modal-Foo", "TongFlow-Api-Foo"])
def test_uppercase_gets_the_rename_hint_not_the_prefix_error(
    tmp_path: Path, name: str
) -> None:
    """An uppercase id must not be misreported as an unknown prefix.

    The lowercase check is prefix-aware; before the fix it only knew `tongflow-`,
    so an uppercase `OneFlow-*` fell through to the unknown-prefix branch and the
    developer was told to rename to a convention they were already using.
    """
    payload = _scan_dirs(tmp_path, name)
    msg = _error_for(payload, name)
    assert "must be all lowercase" in msg
    assert name.lower() in msg
