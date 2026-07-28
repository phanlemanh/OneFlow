"""Engine-side batch semantics — the mirror of ``buildPrompts`` in the canvas.

The canvas turns a node declaring ``batchField`` into one plugin call per item
(``src/lib/abi/resolve.ts``). The engine ignored the field entirely, so for the
~30 slots mounted with ``batchOn()`` the two sides disagreed about what a single
node even means. These tests pin the engine to the canvas's answer.
"""

from __future__ import annotations

from tongflow.engine.batch import fan_out_inputs


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
