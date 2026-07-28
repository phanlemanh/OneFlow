"""Batch fan-out and result merging, mirroring the canvas's ``buildPrompts``.

A node whose ABI mount declares ``batchOn()`` becomes one plugin call per item
on the canvas (``src/lib/abi/resolve.ts``); the engine used to issue a single
call holding the whole array. With a content-addressed cache on the way, that
disagreement stops being an inconvenience and becomes a correctness hazard:
reusing an artifact produced under one meaning to serve a call carrying the
other returns a wrong answer with nothing raised.

Kept separate from ``runner.py`` so the rules can be tested without standing up
a workflow, a plugin, or a store.
"""

from __future__ import annotations

from typing import Any

from .output_view import compute_output_view


def fan_out_inputs(
    node: dict[str, Any], params: dict[str, Any]
) -> list[dict[str, Any]]:
    """One params dict per batch item; a single dict when the node does not batch.

    An empty, missing, or non-list batch value yields **zero** calls, matching
    ``buildPrompts``, which returns ``[]``. The old behaviour — one call with an
    empty array — hands the plugin nothing to work on and reads its reply as a
    real result.
    """
    field = node.get("batchField")
    if not field:
        return [params]

    value = params.get(field)
    if not isinstance(value, list) or not value:
        return []

    # Each iteration consumes a single scalar on the plugin side; the array
    # exists only in the runner's view of the node.
    return [{**params, field: item} for item in value]


def merge_fanout_views(
    routes: list[dict[str, Any]], results: list[dict[str, Any]]
) -> dict[str, dict[str, Any]]:
    """Project N fan-out results into the single view a node exposes.

    Downstream nodes read ``output_views[nodeId]`` — keyed by node, not by call
    — so N results have to become one view. Values concatenate in batch order;
    keeping only the last result would silently drop four fifths of a five-item
    batch, and nothing anywhere would raise.

    ``N == 0`` is its own branch rather than a degenerate case of the loop. The
    route metadata comes from the route, which is static node data and always
    present; deriving it from ``results[0]`` would raise ``IndexError``, and
    omitting the node would leave ``output_views`` without the key so the
    downstream node fails on lookup instead. Note the deliberate difference from
    ``compute_output_view``, which drops an empty channel: here the key must
    exist even when empty, because an empty batch still has to leave its
    consumers something well-formed to read.
    """
    merged: dict[str, dict[str, Any]] = {}
    for route in routes:
        source_field = route.get("sourceField")
        if not isinstance(source_field, str):
            continue
        values: list[str] = []
        for result in results:
            channel = compute_output_view([route], result).get(source_field)
            if channel:
                values.extend(channel["values"])
        merged[source_field] = {
            "sourceField": source_field,
            "nodeType": route.get("nodeType"),
            "dataField": route.get("dataField"),
            "expandEach": bool(route.get("expandEach", False)),
            "values": values,
        }
    return merged
