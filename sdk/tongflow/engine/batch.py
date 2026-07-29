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

from typing import Any, Optional

from .output_view import compute_output_view


def batch_field_of(node: dict[str, Any]) -> Optional[str]:
    """The node's batch field, or None when it does not batch.

    One definition, because three places used to decide this independently and
    an empty-string `batchField` would have meant "no batching" in one of them
    and "batch on the field named ''" in another.
    """
    field = node.get("batchField")
    return field if isinstance(field, str) and field else None


def fan_out_inputs(
    node: dict[str, Any], params: dict[str, Any]
) -> list[dict[str, Any]]:
    """One params dict per batch item; a single dict when the node does not batch.

    An empty, missing, or non-list batch value yields **zero** calls, matching
    ``buildPrompts``, which returns ``[]``. The old behaviour — one call with an
    empty array — hands the plugin nothing to work on and reads its reply as a
    real result.
    """
    field = batch_field_of(node)
    if field is None:
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

    Two kinds of "this route produced nothing" look alike and must not be
    treated alike:

    * **The node ran and simply did not populate this output.** The exporter
      emits a route for *every* ABI output field of the slot whether or not it
      is connected, and several slots declare six. A ``link`` node returning
      only ``mainText`` must leave the image channel alone, exactly as
      ``compute_output_view`` does by dropping it — writing an empty channel
      would reset a downstream data node that is holding perfectly good content.
    * **There were no calls at all** (an empty batch). Here the emptiness is the
      result: whatever the downstream data node still holds is from an earlier
      run, and leaving it makes a re-run serve stale output as if it were fresh.
      So the channel is emitted, empty, built from the route itself — route
      metadata is static node data and always available, whereas deriving it
      from ``results[0]`` would raise ``IndexError``.
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
        if not values and results:
            # The node ran; this output just was not part of what it returned.
            continue
        merged[source_field] = {
            "sourceField": source_field,
            "nodeType": route.get("nodeType"),
            "dataField": route.get("dataField"),
            "expandEach": bool(route.get("expandEach", False)),
            "values": values,
        }
    return merged


# Output fields that describe the call rather than its product. Concatenating
# these across a fan-out would turn `success: True` into `[True, True, True]`.
_META_OUTPUT_FIELDS = frozenset({"success", "error"})


def merge_fanout_results(results: list[dict[str, Any]]) -> dict[str, Any]:
    """Collapse N raw plugin results into the single payload the canvas reads.

    ``node_completed`` carries this, and it is the *only* channel by which an
    executable node's own output reaches the browser — the canvas projects it
    through ``applyResolvedOutputRoutes``. Emitting one result out of N would
    render one image from a five-item batch while the engine's own downstream
    nodes saw all five: precisely the canvas/engine disagreement this slice
    exists to remove.

    A single result passes through untouched, so nothing changes for the
    unbatched path.
    """
    if not results:
        return {}
    if len(results) == 1:
        return results[0]

    merged: dict[str, Any] = {"success": True}
    for result in results:
        for key, value in result.items():
            if key in _META_OUTPUT_FIELDS:
                continue
            bucket = merged.setdefault(key, [])
            if isinstance(bucket, list):
                bucket.extend(value if isinstance(value, list) else [value])
    return merged
