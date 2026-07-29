"""Engine-side batch semantics — the mirror of ``buildPrompts`` in the canvas.

The canvas turns a node declaring ``batchField`` into one plugin call per item
(``src/lib/abi/resolve.ts``). The engine ignored the field entirely, so for the
~30 slots mounted with ``batchOn()`` the two sides disagreed about what a single
node even means. These tests pin the engine to the canvas's answer.
"""

from __future__ import annotations

from tongflow.engine.batch import (
    fan_out_inputs,
    merge_fanout_results,
    merge_fanout_views,
)
from tongflow.engine.output_view import compute_output_view

ROUTES = [
    {
        "sourceField": "texts",
        "nodeType": "textNode",
        "dataField": "texts",
        "expandEach": False,
    }
]


def test_three_items_produce_three_calls_each_carrying_a_scalar() -> None:
    node = {"batchField": "text"}
    params = {"text": ["a", "b", "c"], "duration": 5}

    calls = fan_out_inputs(node, params)

    assert len(calls) == 3
    assert [c["text"] for c in calls] == ["a", "b", "c"]
    for c in calls:
        # A one-element list would satisfy a naive equality check while handing
        # the plugin a shape it never sees on the canvas side.
        assert not isinstance(c["text"], list)
        assert c["duration"] == 5


def test_empty_batch_produces_no_calls() -> None:
    # buildPrompts returns [] here. Invoking once with an empty array is what
    # the engine used to do, and it hands the plugin garbage to work with.
    assert fan_out_inputs({"batchField": "text"}, {"text": []}) == []


def test_non_array_batch_value_produces_no_calls() -> None:
    # Matches `Array.isArray(batchValue) ? ... : []` on the canvas side.
    assert fan_out_inputs({"batchField": "text"}, {"text": "not-a-list"}) == []


def test_missing_batch_value_produces_no_calls() -> None:
    assert fan_out_inputs({"batchField": "text"}, {"duration": 5}) == []


def test_absent_batch_field_produces_one_untouched_call() -> None:
    params = {"text": ["a", "b"], "duration": 5}
    assert fan_out_inputs({}, params) == [params]


def test_fan_out_does_not_mutate_the_resolved_params() -> None:
    # The runner reuses `params` for nothing else today, but a fan-out that
    # mutates its input is a trap for whoever adds the next caller.
    params = {"text": ["a", "b"], "duration": 5}
    fan_out_inputs({"batchField": "text"}, params)
    assert params["text"] == ["a", "b"]


def test_merge_concatenates_values_in_batch_order() -> None:
    results = [
        {"success": True, "texts": ["a1"]},
        {"success": True, "texts": ["b1", "b2"]},
        {"success": True, "texts": ["c1"]},
    ]

    view = merge_fanout_views(ROUTES, results)

    # Order is the assertion. Length alone passes even when the runner
    # interleaves results, and a downstream node reading them out of order
    # produces output that is wrong without being obviously wrong.
    assert view["texts"]["values"] == ["a1", "b1", "b2", "c1"]
    assert view["texts"]["nodeType"] == "textNode"
    assert view["texts"]["dataField"] == "texts"
    assert view["texts"]["expandEach"] is False


def test_merge_of_a_single_result_matches_the_unbatched_view() -> None:
    one = {"success": True, "texts": ["only"]}
    assert merge_fanout_views(ROUTES, [one]) == compute_output_view(ROUTES, one)


def test_merge_of_zero_results_keeps_the_channel_with_no_values() -> None:
    # compute_output_view drops an empty channel; the merge must not, or the
    # downstream node finds no key at all and fails on lookup.
    view = merge_fanout_views(ROUTES, [])

    assert view["texts"]["values"] == []
    assert view["texts"]["nodeType"] == "textNode"
    assert view["texts"]["dataField"] == "texts"


def _three_node_workflow(batch_texts: list[str]) -> dict:
    """text data node -> batching gen-text -> gen-text, plus the data node between."""
    return {
        "name": "three-tier",
        "version": "1.0",
        "inputs": [],
        "outputs": [],
        "dataNodes": [
            {
                "id": "dn-src",
                "type": "addTextNode",
                "dataType": "text",
                "isInput": False,
                "staticData": {"texts": batch_texts},
                "level": 0,
            },
            {
                # Seeded with a value from an imagined earlier run. The point
                # of routing through a data node is that the node carries state
                # between runs, so "what happens to the old value" is a real
                # question and an empty batch is where it gets answered wrong.
                "id": "dn-mid",
                "type": "addTextNode",
                "dataType": "text",
                "isInput": False,
                "staticData": {"texts": ["STALE-FROM-LAST-RUN"]},
                "level": 2,
            },
        ],
        "executableNodes": [
            {
                "id": "exec-mid",
                "type": "genTextNode",
                "feature": "gen-text",
                "pluginId": "oneflow-conformance-stub",
                "batchField": "text",
                "bindings": {
                    "text": {
                        "kind": "handle",
                        "consumerShape": "scalar",
                        "sources": [{"fromNodeId": "dn-src", "fromField": "texts"}],
                        "targetHandle": "in:text",
                    }
                },
                "outputs": [
                    {
                        "sourceField": "text",
                        "nodeType": "textNode",
                        "dataField": "texts",
                        "expandEach": False,
                        "downstreamDataNodeId": "dn-mid",
                    }
                ],
                "dependencies": ["dn-src"],
                "level": 1,
            },
            {
                "id": "exec-last",
                "type": "genTextNode",
                "feature": "gen-text",
                "pluginId": "oneflow-conformance-stub",
                "bindings": {
                    # Reads through the intermediate DATA node, the way a
                    # canvas graph actually wires this. Reading the upstream
                    # executable's view directly would hide a stale data node,
                    # because a missing channel and an empty one look alike
                    # from there.
                    "text": {
                        "kind": "handle",
                        "consumerShape": "array",
                        "sources": [{"fromNodeId": "dn-mid", "fromField": "texts"}],
                        "targetHandle": "in:text",
                    }
                },
                "outputs": [
                    {
                        "sourceField": "text",
                        "nodeType": "textNode",
                        "dataField": "texts",
                        "expandEach": False,
                    }
                ],
                "dependencies": ["exec-mid"],
                "level": 3,
            },
        ],
        "executionLevels": [["dn-src"], ["exec-mid"], ["dn-mid"], ["exec-last"]],
        "dataNodeEdges": [],
    }


def _run(workflow: dict, tmp_path) -> tuple[dict, list[dict]]:
    """Run a workflow with a recording invoker; return (result, recorded calls)."""
    from unittest.mock import patch

    from tongflow.engine import runner as runner_mod
    from tongflow.engine.runner import run_workflow

    calls: list[dict] = []

    def recording_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append({"nodeSlot": slot, "input": dict(business_input)})
        return {"success": True, "text": f"out-{len(calls)}"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-conformance-stub").mkdir(parents=True)
    (plugins_dir / "oneflow-conformance-stub" / "entry.py").write_text("# stub\n")

    manifest = {
        "plugins": {
            "oneflow-conformance-stub": {
                "localSubdir": "oneflow-conformance-stub",
                "entryFile": "entry.py",
                "methodsByNodeSlot": {"gen-text": {"methodName": "run"}},
                "needsDeploy": False,
            }
        }
    }
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        result = run_workflow(
            workflow,
            {},
            plugins_dir=plugins_dir,
            data_dir=tmp_path / "data",
            auto_install=False,
            invoker=recording_invoker,
        )
    return result, calls


def test_three_items_reach_the_node_after_the_batching_one(tmp_path) -> None:
    result, calls = _run(_three_node_workflow(["a", "b", "c"]), tmp_path)

    assert result["status"] == "success"
    # 3 fan-out calls + 1 downstream call.
    assert len(calls) == 4
    # The merged view has to reach the consumer, not just exist: the last node
    # sees every fanned-out value, in order.
    assert calls[-1]["input"]["text"] == ["out-1", "out-2", "out-3"]


def test_empty_batch_leaves_a_usable_view_and_the_next_node_still_runs(tmp_path) -> None:
    """The batching node is not where an empty batch detonates — the one after it is."""
    result, calls = _run(_three_node_workflow([]), tmp_path)

    # Exactly one call in the whole run: the middle node fans out to nothing,
    # the last node still runs.
    assert len(calls) == 1
    # It ran against an empty list — specifically NOT against the value the
    # intermediate data node was carrying from the previous run. An empty batch
    # that leaves stale data in place is how a re-run silently serves last
    # run's output as if it were this run's.
    assert calls[0]["input"]["text"] == []
    # And the run completes. Building the view from results[0] would have
    # raised IndexError; dropping the empty channel would have left
    # output_views without the key and killed the last node on lookup.
    assert result["status"] == "success"


MULTI_ROUTES = [
    {
        "sourceField": "image",
        "nodeType": "imageNode",
        "dataField": "fileKeys",
        "expandEach": False,
        "itemValuePath": "file_key",
    },
    {
        "sourceField": "mainText",
        "nodeType": "textNode",
        "dataField": "texts",
        "expandEach": False,
    },
]


def test_an_unpopulated_output_channel_is_left_alone() -> None:
    """The exporter emits a route for EVERY ABI output field of the slot,
    connected or not — `link` declares six. A node returning only text must not
    reset the image channel: whatever the downstream data node holds is still
    valid content, and writing an empty channel would wipe it mid-run.
    """
    view = merge_fanout_views(MULTI_ROUTES, [{"success": True, "mainText": "hello"}])

    assert view["mainText"]["values"] == ["hello"]
    assert "image" not in view
    # The same shape compute_output_view produced before the merge existed.
    assert view == compute_output_view(
        MULTI_ROUTES, {"success": True, "mainText": "hello"}
    )


def test_zero_results_still_emit_every_channel_empty() -> None:
    """An empty batch is different: emptiness IS the result, so stale
    downstream values must be cleared rather than preserved.
    """
    view = merge_fanout_views(MULTI_ROUTES, [])

    assert view["image"]["values"] == []
    assert view["mainText"]["values"] == []


def test_merged_result_carries_every_fanned_out_output() -> None:
    """`node_completed` is the only path an executable's output takes to the
    canvas, so emitting one result out of N would render a five-item batch as a
    single item — reintroducing the exact canvas/engine disagreement this slice
    removes.
    """
    results = [
        {"success": True, "image": [{"file_key": "a.png"}]},
        {"success": True, "image": [{"file_key": "b.png"}]},
        {"success": True, "image": [{"file_key": "c.png"}]},
    ]

    merged = merge_fanout_results(results)

    assert merged["success"] is True
    assert merged["image"] == [
        {"file_key": "a.png"},
        {"file_key": "b.png"},
        {"file_key": "c.png"},
    ]


def test_merged_result_of_one_call_is_the_call_itself() -> None:
    # The unbatched path must not change shape at all.
    one = {"success": True, "text": "only", "error": None}
    assert merge_fanout_results([one]) is one


def test_merged_result_does_not_concatenate_meta_fields() -> None:
    # `success: [True, True]` would be nonsense to every consumer.
    merged = merge_fanout_results(
        [{"success": True, "text": "a"}, {"success": True, "text": "b"}]
    )
    assert merged["success"] is True
    assert merged["text"] == ["a", "b"]
