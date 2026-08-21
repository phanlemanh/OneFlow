"""normalize-text-vi Tier A cache membership — the re-price scenario (AC-11).

Two tests, pinned as node-ids in `_acceptance/config.yaml`: a warmed
tier-B → normalize-text-vi workflow re-run unchanged makes ZERO plugin calls,
and changing ONLY the reader's `text` input re-runs the reader while the
tier-B generation upstream keeps its cache hit.

Fixture shape copied from `test_node_cache_overlay.py` — same two-layer
arrangement, same recording invoker — because the claim being measured is the
same one: a deterministic tier-A node re-runs on its own without dragging the
expensive upstream with it.
"""

from __future__ import annotations

from unittest.mock import patch

from tongflow.engine import run_workflow
from tongflow.engine import runner as runner_mod


def _normalize_workflow(text: str = "Giá 1.999.000₫") -> dict:
    """`image-gen-text` (tier B) → `normalize-text-vi` (tier A).

    The upstream is `image-gen-text` rather than the more obvious `gen-text`:
    `gen-text` sits in DESCOPED_GENERATIVE_SLOTS and is deliberately NOT cached,
    so it re-runs every time by design and could never demonstrate the hit this
    test is about.

    `text` parametrizes ONLY the reader's own binding: the upstream
    generation's business input never changes with it, which is what lets one
    node's key flip without touching the other's.
    """
    return {
        "executableNodes": [
            {
                "id": "n1",
                "feature": "image-gen-text",
                "pluginId": "oneflow-text",
                "bindings": {
                    "text": {"kind": "static", "value": "viết mô tả căn hộ"},
                },
                "outputs": [
                    {
                        "sourceField": "text",
                        "nodeType": "textNode",
                        "dataField": "texts",
                        "downstreamDataNodeId": "d1",
                    }
                ],
                "level": 0,
                "dependencies": [],
            },
            {
                "id": "n2",
                "feature": "normalize-text-vi",
                "pluginId": "oneflow-text",
                "bindings": {
                    "text": {"kind": "static", "value": text},
                },
                "outputs": [],
                "level": 1,
                "dependencies": ["n1"],
            },
        ],
        "dataNodes": [{"id": "d1", "nodeType": "textNode"}],
        "executionLevels": [["n1"], ["n2"]],
        "inputs": [],
    }


def _run(workflow, tmp_path, *, tenant="local", workflow_id="wf-1",
         plugin_rev="b" * 40):
    """Recording invoker: every call keeps its slot so per-node assertions can
    tell WHICH node re-ran, not merely how many did.
    """
    calls: list[dict] = []

    def text_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append({"slot": slot, "input": business_input})
        return {"success": True, "text": f"đã đọc:{business_input.get('text', '')}"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True, exist_ok=True)
    manifest = {
        "plugins": {
            "oneflow-text": {"localSubdir": "oneflow-text", "pluginRev": plugin_rev}
        }
    }
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        result = run_workflow(
            workflow,
            {},
            plugins_dir=plugins_dir,
            data_dir=tmp_path / "data",
            tenant=tenant,
            workflow_id=workflow_id,
            invoker=text_invoker,
            auto_install=False,
        )
    return result, calls


def test_normalize_rerun_keeps_expensive_upstream_cached(tmp_path):
    # AC-11 first half, AMENDED at Gate 2 round 5 (owner, 2026-08-21) when
    # normalize-text-vi came OUT of TIER_A_SLOTS: the promise "re-run unchanged
    # makes ZERO plugin calls" was true only while the reader was cached, and it
    # was cached under a key that could not tell reader 0.2.19 from 0.2.24 (see
    # node_cache.py). What the workflow still owes the user is the EXPENSIVE
    # half: the generation upstream must not be re-paid. The reader itself is a
    # pure CPU string function with no model call, so re-running it costs
    # ~nothing — that is why removing it from the cache is affordable at all.
    wf = _normalize_workflow()
    r1, c1 = _run(wf, tmp_path)
    r2, c2 = _run(wf, tmp_path)
    assert r1["status"] == "success"
    assert r2["status"] == "success"
    assert len(c1) == 2  # both ran cold

    gen_calls = [c for c in c2 if c["slot"] == "image-gen-text"]
    read_calls = [c for c in c2 if c["slot"] == "normalize-text-vi"]
    assert len(gen_calls) == 0, (
        f"lượt hai phải TRÚNG cache ở node tầng B đắt tiền, nhận {gen_calls}"
    )
    assert len(read_calls) == 1, (
        "reader chạy lại đúng một lần — đó là cái giá đã chọn khi rút slot khỏi "
        f"Tier A; nhận {len(read_calls)} lời gọi"
    )
    # Chạy lại mà đầu ra đổi thì việc rút khỏi cache đã đổi cả KẾT QUẢ, không
    # chỉ đổi số lời gọi — AC-7 (tất định) sẽ là chỗ vỡ, nên ghim ngay ở đây.
    assert r2["outputs"] == r1["outputs"]


def test_changing_text_reruns_only_normalize(tmp_path):
    # AC-11 second half — the re-price scenario. Warm the workflow, then change
    # ONLY the reader's input: the generation upstream must keep its hit while
    # the reader re-runs exactly once under its new key.
    r1, _ = _run(_normalize_workflow(text="Giá 1.999.000₫"), tmp_path)
    r2, c2 = _run(_normalize_workflow(text="Giá 1.999.000₫"), tmp_path)
    assert r1["status"] == "success"
    assert r2["status"] == "success"
    # Cùng lý do như test trên: reader hết được cache nên nó chạy lại, còn node
    # tầng B thì không được phép chạy lại.
    assert [c for c in c2 if c["slot"] == "image-gen-text"] == []

    r3, c3 = _run(_normalize_workflow(text="Giá 2.499.000₫"), tmp_path)
    gen_calls = [c for c in c3 if c["slot"] == "image-gen-text"]
    read_calls = [c for c in c3 if c["slot"] == "normalize-text-vi"]
    assert r3["status"] == "success"
    assert len(gen_calls) == 0  # generation NOT re-paid
    assert len(read_calls) == 1  # the reader re-ran, once
    assert read_calls[0]["input"]["text"] == "Giá 2.499.000₫"
