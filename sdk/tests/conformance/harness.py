"""Shared machinery for running a conformance fixture through the engine.

Lives outside the test module because the baseline capture script needs it too,
and the baseline must be produced by exactly the same code path the suite later
compares against — otherwise the comparison drifts for reasons that have nothing
to do with the engine.

The plugin is never really spawned. A recording invoker stands in for it, so a
fixture run needs no clone, no venv, no network and no GPU; what is under test
is which calls the engine decides to make, not what a plugin computes.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from unittest.mock import patch

from tongflow.engine import runner as runner_mod
from tongflow.engine.callog import normalize_call
from tongflow.engine.runner import run_workflow

FIXTURES = Path(__file__).parent / "fixtures"
# The real shipped ABI, not a miniature: the call-log carries every business
# field the slot declares, so a trimmed ABI would trim the comparison with it.
ABI_PATH = Path(__file__).resolve().parents[2] / "tongflow" / "_data" / "tongflow.abi.json"


def load_fixture(case: str) -> dict[str, Any]:
    path = FIXTURES / f"{case}.json"
    # A missing fixture fails loudly. Skipping it would quietly shrink the suite
    # to whatever happens to be on disk.
    if not path.exists():
        raise FileNotFoundError(f"conformance fixture missing: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _manifest_for(fixture: dict[str, Any]) -> dict[str, Any]:
    """A manifest covering exactly the plugin ids the fixture names."""
    plugins: dict[str, Any] = {}
    for node in fixture["workflow"].get("executableNodes", []):
        plugin_id = node["pluginId"]
        plugins[plugin_id] = {
            "localSubdir": plugin_id,
            "entryFile": "entry.py",
            "methodsByNodeSlot": {node["feature"]: {"methodName": "run"}},
            "needsDeploy": False,
        }
    return {"plugins": plugins}


def call_log(fixture: dict[str, Any], tmp_dir: Path) -> list[dict[str, Any]]:
    """Run one fixture through the engine and return its normalized call-log."""
    calls: list[dict[str, Any]] = []
    stub_outputs: dict[str, Any] = fixture.get("stubOutput") or {
        "success": True,
        "text": "stub",
    }

    def recording_invoker(
        plugin_id: str,
        slot: str,
        business_input: dict[str, Any],
        plugin_dir: Path,
        model: str | None,
    ) -> dict[str, Any]:
        calls.append(normalize_call(slot, business_input))
        return dict(stub_outputs)

    plugins_dir = tmp_dir / "plugins"
    plugins_dir.mkdir(parents=True, exist_ok=True)
    # The presence check runs before any invoker is consulted, so each named
    # plugin needs a directory on disk even though nothing in it is ever read:
    # the recording invoker replaces the whole spawn path.
    for plugin_id in _manifest_for(fixture)["plugins"]:
        pdir = plugins_dir / plugin_id
        pdir.mkdir(parents=True, exist_ok=True)
        (pdir / "entry.py").write_text("# conformance stub\n", encoding="utf-8")

    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: _manifest_for(fixture)):
        run_workflow(
            fixture["workflow"],
            fixture.get("inputs") or {},
            plugins_dir=plugins_dir,
            data_dir=tmp_dir / "data",
            abi_path=ABI_PATH,
            auto_install=False,
            invoker=recording_invoker,
        )
    return calls
