"""compose-overlay Tier A cache membership -- PRD §4 re-price scenario.

Two tests only (AC-11, pinned as node-ids in `_acceptance/config.yaml`):
a warmed tier-B -> compose-overlay workflow re-run unchanged makes ZERO
plugin calls, and changing ONLY the overlay's `text` input re-runs the
overlay while the tier-B generation upstream keeps its cache hit.

Fixture pattern copied from `test_node_cache_tier_b.py`'s `_mixed_workflow`
/ `_run_mixed` pair: a tier-B upstream (`image-gen`) feeding a fake
compose-overlay handler through the ordinary outputs -> data-node ->
handle-binding route, with a recording invoker counting every plugin call.
"""

from __future__ import annotations

import base64
from unittest.mock import patch

from tongflow.engine import run_workflow
from tongflow.engine import runner as runner_mod


def _overlay_workflow(text: str = "99K") -> dict:
    """`image-gen` (tier B) -> `compose-overlay` (tier A after this slice).

    `text` parametrizes ONLY compose-overlay's own `text` binding -- the
    upstream generation's business input never changes with it, which is
    exactly what lets `test_changing_text_reruns_only_overlay` flip one
    node's key without touching the other's (PRD §4: re-price a warm
    workflow without paying for a fresh generation).
    """
    return {
        "executableNodes": [
            {"id": "n1", "feature": "image-gen", "pluginId": "oneflow-text",
             "bindings": {
                 "text": {"kind": "static", "value": "a product shot"},
             },
             "outputs": [{"sourceField": "image", "nodeType": "imageNode",
                          "dataField": "fileKeys", "itemValuePath": "file_key",
                          "downstreamDataNodeId": "d1"}],
             "level": 0, "dependencies": []},
            {"id": "n2", "feature": "compose-overlay", "pluginId": "oneflow-text",
             "bindings": {
                 "media": {"kind": "handle", "consumerShape": "scalar",
                           "sources": [{"fromNodeId": "d1",
                                        "fromField": "fileKeys"}]},
                 "text": {"kind": "static", "value": text},
                 "ops": {"kind": "static", "value": [
                     {"type": "text", "x": 0.5, "y": 0.9,
                      "anchor": "bottom-center", "text": "{text}"},
                 ]},
             },
             "outputs": [], "level": 1, "dependencies": ["n1"]},
        ],
        "dataNodes": [{"id": "d1", "nodeType": "imageNode"}],
        "executionLevels": [["n1"], ["n2"]],
        "inputs": [],
    }


def _run_overlay(workflow, tmp_path, *, tenant="local", workflow_id="wf-1",
                 plugin_rev="a" * 40):
    """Like tier B's `_run_mixed`: the invoker returns REAL image bytes so a
    hit on either node round-trips actual blob content through the CURRENT
    run's store, and every call is recorded with its slot for per-node
    assertions. `workflow_id` defaults to a real id because the tier-B
    upstream needs one to cache at all.
    """
    calls: list[dict] = []

    def image_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append({"slot": slot, "input": business_input})
        raw = f"image-bytes:{slot}:{business_input.get('text', '')}".encode()
        return {"success": True,
                "image": {"bytesBase64": base64.b64encode(raw).decode("ascii")}}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True, exist_ok=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": plugin_rev}}}
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        result = run_workflow(
            workflow, {},
            plugins_dir=plugins_dir,
            data_dir=tmp_path / "data",
            tenant=tenant,
            workflow_id=workflow_id,
            invoker=image_invoker,
            auto_install=False,
        )
    return result, calls


def test_overlay_second_run_full_hit_zero_plugin_calls(tmp_path):
    # E14/E16 / AC-11's first half. A warmed image-gen -> compose-overlay
    # workflow re-run unchanged (same tenant/workflow_id/data_dir) must make
    # ZERO plugin calls: the tier-B upstream hits its workflow-scoped entry
    # and compose-overlay -- deterministic CPU compositing, now tier A --
    # hits its content-addressed one. Outputs stay byte-identical.
    wf = _overlay_workflow()
    r1, c1 = _run_overlay(wf, tmp_path)
    r2, c2 = _run_overlay(wf, tmp_path)
    assert r1["status"] == "success"
    assert r2["status"] == "success"
    assert len(c1) == 2                      # both nodes ran cold
    assert len(c2) == 0                      # both nodes hit warm
    assert r2["outputs"] == r1["outputs"]


def test_changing_text_reruns_only_overlay(tmp_path):
    # E15/E17 / AC-11's second half -- the PRD §4 re-price scenario: warm the
    # workflow, then change ONLY compose-overlay's `text` input. The tier-B
    # generation upstream must keep its cache hit (0 calls -- its own
    # business input is untouched) while compose-overlay re-runs exactly
    # once under its new key.
    r1, c1 = _run_overlay(_overlay_workflow(text="99K"), tmp_path)   # cold
    r2, c2 = _run_overlay(_overlay_workflow(text="99K"), tmp_path)   # warm both
    assert r1["status"] == "success"
    assert r2["status"] == "success"
    assert len(c2) == 0

    r3, c3 = _run_overlay(_overlay_workflow(text="79K"), tmp_path)   # re-price
    gen_calls = [c for c in c3 if c["slot"] == "image-gen"]
    overlay_calls = [c for c in c3 if c["slot"] == "compose-overlay"]
    assert r3["status"] == "success"
    assert len(gen_calls) == 0               # generation NOT re-paid
    assert len(overlay_calls) == 1           # overlay re-ran, once
    assert overlay_calls[0]["input"]["text"] == "79K"
