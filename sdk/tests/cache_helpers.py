"""Shared fixtures for the tier-A/tier-B cache test split (AC-14).

Plain module, no pytest magic -- imported by both `test_node_cache.py` and
`test_node_cache_tier_b.py` so the fixtures they both need stay defined once.
"""

from __future__ import annotations

import json
from unittest.mock import patch

from tongflow.engine import run_workflow
from tongflow.engine import runner as runner_mod


def _two_node_workflow(text: str) -> dict:
    """combine-text -> split-text. Both are tier A, neither needs a real plugin.

    NOTE: the top-level key is `executableNodes` (matching what `run_workflow`
    actually reads, see runner.py `wf.get("executableNodes", ...)`), and n2's
    binding reads its upstream via the ordinary `handle` shape (a `sources`
    list of `{fromNodeId, fromField}`) -- there is no `"dataNode"` binding
    kind in `resolve_node_params`; that kind is only how the DOWNSTREAM data
    node is reached from `n1`'s `outputs` route.
    """
    return {
        "executableNodes": [
            {"id": "n1", "feature": "combine-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "static", "value": text}},
             "outputs": [{"sourceField": "text", "nodeType": "textNode",
                          "dataField": "texts", "downstreamDataNodeId": "d1"}],
             "level": 0, "dependencies": []},
            {"id": "n2", "feature": "split-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "handle", "consumerShape": "scalar",
                                    "sources": [{"fromNodeId": "d1",
                                                 "fromField": "texts"}]}},
             "outputs": [], "level": 1, "dependencies": ["n1"]},
        ],
        "dataNodes": [{"id": "d1", "nodeType": "textNode"}],
        "executionLevels": [["n1"], ["n2"]],
        "inputs": [],
    }


def _run(workflow, tmp_path, *, tenant="local", data_dir=None,
         plugin_dir_name="oneflow-text", plugin_rev="a" * 40, workflow_id=None):
    calls: list[dict] = []

    def recording_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append({"slot": slot, "input": business_input})
        return {"success": True, "text": f"out:{business_input.get('text')}"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / plugin_dir_name).mkdir(parents=True, exist_ok=True)
    plugin_cfg = {"localSubdir": plugin_dir_name}
    # `plugin_rev=None` models AC-10 case (b): a plugin dir that is not a
    # checkout at all, so the manifest carries no `pluginRev` key -- as
    # opposed to the default, a real recorded revision.
    if plugin_rev is not None:
        plugin_cfg["pluginRev"] = plugin_rev
    manifest = {"plugins": {"oneflow-text": plugin_cfg}}
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        result = run_workflow(
            workflow, {},
            plugins_dir=plugins_dir,
            data_dir=data_dir or (tmp_path / "data"),
            tenant=tenant,
            workflow_id=workflow_id,
            invoker=recording_invoker,
            auto_install=False,
        )
    return result, calls


def _bridge(request: dict) -> dict:
    """Drive __main__.main() over stdin/stdout the way a host does."""
    import io
    import sys as _sys

    from tongflow.engine import __main__ as bridge
    old_in, old_out = _sys.stdin, _sys.stdout
    _sys.stdin = io.StringIO(json.dumps(request))
    _sys.stdout = io.StringIO()
    try:
        bridge.main()
        lines = [l for l in _sys.stdout.getvalue().splitlines() if l.strip()]
    finally:
        _sys.stdin, _sys.stdout = old_in, old_out
    return json.loads(lines[-1])
