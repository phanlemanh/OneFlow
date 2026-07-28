# Conformance L0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Python engine's `batchField` fan-out match the canvas's, record `pluginRev` at install time, fix the `node_cached` event contract end to end, and stand up a conformance suite that keeps the two sides matched.

**Architecture:** The canvas fans a node into N plugin calls via `buildPrompts` ([`src/lib/abi/resolve.ts:326`](../../../src/lib/abi/resolve.ts)); the engine ignores `batchField` entirely. Task 1 captures today's non-batch behaviour as a baseline **before** anything is touched, so the "unchanged" claim stays verifiable. Tasks 2–4 add fan-out, result merging, and the empty-batch branch to `runner.py`. Tasks 5–7 build the shared fixture harness (Python side, TS side, mutation guard). Tasks 8–9 add `pluginRev`. Task 10 wires `node_cached` through all three layers.

**Tech Stack:** Python 3 + pytest (engine, run via `uv`), TypeScript + vitest (canvas), zod (registry schema), isomorphic-git (TS installer).

## Global Constraints

- **Contract:** [`_acceptance/conformance-l0/contract.md`](../../../_acceptance/conformance-l0/contract.md) — 11 AC, approved 2026-07-28. Evals: [`evals.yaml`](../../../_acceptance/conformance-l0/evals.yaml).
- **Code comments in English only** (CLAUDE.md). Plan prose is Vietnamese; code is not.
- **Never edit `sdk/tests/test_engine.py` or its siblings.** AC-3 is partly proved by that file's diff being empty.
- **Normalized call-log** = `[{slot, input}]` where `input` holds **every** ABI business field for the slot, minus `_tongflow` / `taskId` / routing keys (`outputs`, `level`, `dependencies`); keys sorted; assets as `{"__asset": "<sha256>"}`; valueless fields omitted, never `null`. Defined in contract Context — do not narrow it.
- **T3 tier:** touches `sdk/**` and `src/lib/workflow/**`. Every commit must keep `pnpm lint:check`, `pnpm typecheck`, and `cd sdk && pytest` green.
- **Python style:** `from __future__ import annotations`, type annotations on every signature, no `print` (the engine emits through `emit()`).
- **Run pytest through `uv`**, never bare `python3` (PEP 668 blocks pip on this machine's Homebrew Python):
  `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q <args>`

---

## File Structure

| File | Responsibility |
|---|---|
| `sdk/tongflow/engine/batch.py` | **New.** Pure fan-out + merge logic: `fan_out_inputs()`, `merge_fanout_views()`. No I/O, no plugin calls — the piece both `runner.py` and the tests exercise. |
| `sdk/tongflow/engine/runner.py` | **Modify.** Call `fan_out_inputs` between `resolve_node_params` and `materialize_asset_inputs`; loop invocations; merge via `merge_fanout_views`; emit `node_cached` shape (never fired at L0). |
| `sdk/tongflow/engine/callog.py` | **New.** `normalize_call(slot, business_input, abi)` — the one place the call-log normalization rule lives on the Python side. |
| `sdk/tests/conformance/fixtures/*.json` | **New.** Four fixtures + one baseline, read by BOTH sides. Single source of truth. |
| `sdk/tests/conformance/test_conformance.py` | **New.** Python adapter: run fixtures through `run_workflow` with a recording invoker, compare to `expectedCalls`. |
| `sdk/tests/test_engine_batch.py` | **New.** Engine-level behaviour: fan-out count, scalar item, merge order, empty batch through a 3-node workflow. |
| `sdk/tests/test_plugin_rev.py` | **New.** Scanner records a 40-char sha; the two no-rev states are told apart. |
| `sdk/tongflow/scan.py` | **Modify.** Read `git rev-parse HEAD` per plugin dir; add `pluginRev` to the entry. |
| `src/lib/abi/conformance.ts` | **New.** TS adapter: `normalizeCall()` + `callLogForFixture()`, mirroring `callog.py`. |
| `src/lib/abi/conformance.test.ts` | **New.** TS side of the suite, reading the same fixture files. |
| `src/lib/plugins/plugins-registry-schema.ts` | **Modify.** `pluginRev?: string` on `PluginConfigSchema`. |
| `src/lib/plugins/plugin-rev.test.ts` | **New.** Old registry JSON still parses; a rev-bearing entry parses. |
| `src/lib/task/engine-delegate.server.ts` | **Modify.** `case "node_cached"` in `handleEvent`. |
| `src/constants/task-status.ts` | **Modify.** `NODE_CACHED` in `NodeStatus` + its mapping. |
| `src/hooks/use-workflow-execution.ts` | **Modify.** `case NodeStatus.NODE_CACHED` — a cached node is a completed node to the canvas. |
| `src/lib/task/node-cached.test.ts` | **New.** Three-layer test: delegate → serialized SSE payload → client switch. |
| `scripts/conformance/check-suite-discriminating.sh` | **New.** Mutation guard, both perturbation kinds. |
| `scripts/plugins/check-rev-joined-path.ts` | **New.** TS installer → Python scanner joined path. |

---

## Task 1: Capture the non-batch baseline BEFORE touching runner.py

Serves AC-3 (E14). **This task must land first** — its whole value is that it runs against unmodified engine behaviour.

**Files:**
- Create: `sdk/tongflow/engine/callog.py`
- Create: `sdk/tests/conformance/__init__.py` (empty)
- Create: `sdk/tests/conformance/fixtures/no-batch.json`
- Create: `sdk/tests/conformance/fixtures/baseline-no-batch.json` (generated, then committed)
- Create: `sdk/tests/conformance/capture_baseline.py`

**Interfaces:**
- Produces: `normalize_call(slot: str, business_input: dict[str, Any]) -> dict[str, Any]` — the normalization rule. Consumed by Tasks 5, 6 (as the spec the TS side mirrors), and the guard in Task 7.

- [ ] **Step 1: Write `callog.py`**

```python
"""Normalize a plugin invocation into the shared conformance call-log shape.

The comparison scope is deliberately wide: every business field the ABI
declares for the slot travels in the log, not just the batch field. Narrowing
it is how a suite goes green while staying blind to the drift it exists to
catch — see the contract's Context section.
"""

from __future__ import annotations

import hashlib
from typing import Any

# Per-run rather than semantic: these carry no meaning about what the plugin
# computes, and including them would make every log differ from every other.
_DROPPED_KEYS = frozenset({"_tongflow", "taskId", "outputs", "level", "dependencies"})


def _digest_value(v: Any) -> Any:
    if isinstance(v, dict):
        # An asset materialized to inline bytes: the two runtimes reach these
        # bytes by different routes, so file_key always differs while the
        # content does not. Compare content.
        b64 = v.get("bytesBase64")
        if isinstance(b64, str):
            import base64

            raw = base64.b64decode(b64)
            return {"__asset": hashlib.sha256(raw).hexdigest()}
        return {k: _digest_value(v[k]) for k in sorted(v)}
    if isinstance(v, list):
        return [_digest_value(x) for x in v]
    return v


def normalize_call(slot: str, business_input: dict[str, Any]) -> dict[str, Any]:
    """Return `{"slot": ..., "input": ...}` under the shared normalization rule."""
    out: dict[str, Any] = {}
    for k in sorted(business_input):
        if k in _DROPPED_KEYS:
            continue
        v = business_input[k]
        # A valueless field is omitted, never written as null: one side writing
        # null while the other omits would be a false difference.
        if v is None or v == "":
            continue
        out[k] = _digest_value(v)
    return {"slot": slot, "input": out}
```

- [ ] **Step 2: Write the `no-batch` fixture**

`sdk/tests/conformance/fixtures/no-batch.json` — a two-node workflow (one text data node feeding one executable) using a slot with no `batchOn`. Pick the slot by reading `config/tongflow.abi.json` and choosing one whose fields are all plain text/config (no assets), so the fixture needs no binary. Record the chosen slot in the fixture's `note` field.

```json
{
  "case": "no-batch",
  "note": "Slot chosen for having no batchOn and no asset inputs, so the fixture stays text-only.",
  "workflow": { "…": "executable workflow JSON — two nodes, one edge" },
  "inputs": {},
  "expectedCalls": [{ "slot": "…", "input": { "…": "…" } }]
}
```

Write `workflow` by exporting a minimal graph by hand: mirror the shape of an existing `ExecutableWorkflow` (see [`src/lib/workflow/executable-workflow.ts`](../../../src/lib/workflow/executable-workflow.ts) for the type) with `nodes`, `dataNodes`, `executionLevels`, `bindings`, `outputs`.

- [ ] **Step 3: Write the baseline capture script**

```python
"""Capture today's engine call-log for the non-batch fixtures.

Run ONCE, before runner.py is modified. The output is committed and becomes the
thing AC-3 compares against: after the fan-out change lands, the same fixtures
must produce a byte-identical log. "Unchanged from today" is unverifiable once
today is gone.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from tongflow.engine.callog import normalize_call
from tongflow.engine.runner import run_workflow

FIXTURES = Path(__file__).parent / "fixtures"


def capture(case: str) -> list[dict]:
    spec = json.loads((FIXTURES / f"{case}.json").read_text())
    calls: list[dict] = []

    def recording_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append(normalize_call(slot, business_input))
        return {"success": True, "text": f"stub-{len(calls)}"}

    run_workflow(
        spec["workflow"],
        spec.get("inputs") or {},
        invoker=recording_invoker,
        auto_install=False,
    )
    return calls


if __name__ == "__main__":
    case = sys.argv[1] if len(sys.argv) > 1 else "no-batch"
    out = FIXTURES / f"baseline-{case}.json"
    out.write_text(json.dumps({"case": case, "calls": capture(case)}, indent=2, sort_keys=True) + "\n")
    print(f"wrote {out}")
```

- [ ] **Step 4: Run the capture against unmodified engine code**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python tests/conformance/capture_baseline.py no-batch`
Expected: prints `wrote .../baseline-no-batch.json`, and the file contains exactly one call.

If it contains zero calls, the fixture's bindings are wrong — fix the fixture, not the script.

- [ ] **Step 5: Commit — this is the "before" snapshot**

```bash
git add sdk/tongflow/engine/callog.py sdk/tests/conformance/
git commit -m "test: capture non-batch engine baseline before fan-out lands

AC-3 compares against this. Captured while runner.py is still unmodified;
recapturing it after the change would make the comparison vacuous."
```

---

## Task 2: Fan-out — one call per batch item

Serves AC-1, AC-2 (E1, E2).

**Files:**
- Create: `sdk/tongflow/engine/batch.py`
- Create: `sdk/tests/test_engine_batch.py`
- Modify: `sdk/tongflow/engine/runner.py:326-340` (between `resolve_node_params` and `materialize_asset_inputs`)

**Interfaces:**
- Consumes: nothing from Task 1 at runtime.
- Produces: `fan_out_inputs(node: dict[str, Any], params: dict[str, Any]) -> list[dict[str, Any]]` — returns the per-call params list. Consumed by Task 3's merge and by `runner.py`.

- [ ] **Step 1: Write the failing tests**

```python
"""Engine-side batch semantics. Mirrors buildPrompts in src/lib/abi/resolve.ts."""

from __future__ import annotations

from tongflow.engine.batch import fan_out_inputs


def test_three_items_produce_three_calls_each_carrying_a_scalar():
    node = {"batchField": "text"}
    params = {"text": ["a", "b", "c"], "duration": 5}

    calls = fan_out_inputs(node, params)

    assert len(calls) == 3
    assert [c["text"] for c in calls] == ["a", "b", "c"]
    for c in calls:
        assert not isinstance(c["text"], list)
        assert c["duration"] == 5


def test_empty_batch_produces_no_calls():
    assert fan_out_inputs({"batchField": "text"}, {"text": []}) == []


def test_non_array_batch_value_produces_no_calls():
    assert fan_out_inputs({"batchField": "text"}, {"text": "not-a-list"}) == []


def test_absent_batch_field_produces_one_untouched_call():
    params = {"text": ["a", "b"], "duration": 5}
    calls = fan_out_inputs({}, params)
    assert calls == [params]
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_engine_batch.py`
Expected: FAIL — `ModuleNotFoundError: No module named 'tongflow.engine.batch'`

- [ ] **Step 3: Write `batch.py`**

```python
"""Batch fan-out, mirroring `buildPrompts` in ``src/lib/abi/resolve.ts``.

The canvas turns a node with a `batchField` into one plugin call per item; the
engine has to agree, because a cache that reuses an artifact produced under one
meaning to serve a call carrying the other returns a wrong answer silently.
"""

from __future__ import annotations

from typing import Any


def fan_out_inputs(node: dict[str, Any], params: dict[str, Any]) -> list[dict[str, Any]]:
    """One params dict per batch item; a single dict when the node does not batch.

    An empty (or non-list) batch value yields zero calls — matching
    `buildPrompts`, which returns `[]`. Invoking once with an empty array is
    what the engine used to do, and it hands the plugin garbage.
    """
    field = node.get("batchField")
    if not field:
        return [params]

    value = params.get(field)
    if not isinstance(value, list) or not value:
        return []

    # Each iteration consumes a single scalar on the plugin side; the array
    # lives only in the runner's view of the node.
    return [{**params, field: item} for item in value]
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_engine_batch.py`
Expected: PASS, 4 passed

- [ ] **Step 5: Wire it into `runner.py`**

In `sdk/tongflow/engine/runner.py`, replace the single-invocation block (currently lines ~326-347: `params = resolve_node_params(...)` through `result = convert_asset_outputs_to_file_refs(...)`) with a loop:

```python
                params = resolve_node_params(
                    node, output_views, data_node_state, data_nodes, inputs
                )
                # Match the canvas: a node declaring `batchField` becomes one
                # plugin call per item (src/lib/abi/resolve.ts buildPrompts).
                per_call_params = fan_out_inputs(node, params)

                results: list[dict[str, Any]] = []
                for call_params in per_call_params:
                    business_input = materialize_asset_inputs(
                        slot, call_params, abi, search_dirs, store
                    )
                    plugin_dir = plugins_dir / cfg["localSubdir"]
                    if invoker is not None:
                        raw = invoker(plugin_id, slot, business_input, plugin_dir, model)
                    else:
                        raw = invoke_plugin(
                            python=python,
                            plugin_dir=plugin_dir,
                            entry_file=cfg.get("entryFile", "entry.py"),
                            plugin_id=plugin_id,
                            node_slot=slot,
                            prompt=business_input,
                            sdk_root=SDK_ROOT,
                            task_id=task_id,
                            model=model,
                            on_progress=on_progress,
                        )
                    one = convert_asset_outputs_to_file_refs(slot, raw, abi, store)
                    if one.get("success") is False:
                        raise RuntimeError(
                            str(one.get("error") or "Plugin returned success=false")
                        )
                    results.append(one)
```

Add the import near the other engine imports:

```python
from .batch import fan_out_inputs
```

Task 3 replaces the code that consumes `results`. For this step, keep the existing downstream block working by adding, immediately after the loop:

```python
                # Superseded by merge_fanout_views in Task 3.
                result = results[0] if results else {}
```

- [ ] **Step 6: Verify nothing regressed**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q`
Expected: PASS — the whole SDK suite, `test_engine.py` included, with no edits to it.

- [ ] **Step 7: Commit**

```bash
git add sdk/tongflow/engine/batch.py sdk/tongflow/engine/runner.py sdk/tests/test_engine_batch.py
git commit -m "feat(engine): fan out one plugin call per batch item

The canvas has always done this via buildPrompts; the engine ignored
batchField entirely, so ~30 slots ran with different semantics on the two
sides. Result merging lands in the next commit."
```

---

## Task 3: Merge fan-out results into one output view, in batch order

Serves AC-4, AC-5 (E4, E5).

**Files:**
- Modify: `sdk/tongflow/engine/batch.py`
- Modify: `sdk/tongflow/engine/runner.py` (the block after the invocation loop)
- Modify: `sdk/tests/test_engine_batch.py`

**Interfaces:**
- Consumes: `fan_out_inputs` from Task 2.
- Produces: `merge_fanout_views(routes: list[dict], results: list[dict]) -> dict[str, dict]` — one merged view for the node. Consumed by `runner.py` and by Task 4's empty-batch branch.

- [ ] **Step 1: Write the failing tests (append to `test_engine_batch.py`)**

```python
from tongflow.engine.batch import merge_fanout_views

ROUTES = [
    {
        "sourceField": "texts",
        "nodeType": "text",
        "dataField": "texts",
        "expandEach": False,
    }
]


def test_merge_concatenates_values_in_batch_order():
    results = [
        {"success": True, "texts": ["a1"]},
        {"success": True, "texts": ["b1", "b2"]},
        {"success": True, "texts": ["c1"]},
    ]

    view = merge_fanout_views(ROUTES, results)

    # Order is the assertion. Length alone would pass even if the runner
    # interleaved results, and a downstream node reading these values in the
    # wrong order produces silently wrong output.
    assert view["texts"]["values"] == ["a1", "b1", "b2", "c1"]
    assert view["texts"]["nodeType"] == "text"
    assert view["texts"]["dataField"] == "texts"
    assert view["texts"]["expandEach"] is False


def test_merge_of_a_single_result_matches_the_unbatched_view():
    from tongflow.engine.output_view import compute_output_view

    one = {"success": True, "texts": ["only"]}
    assert merge_fanout_views(ROUTES, [one]) == compute_output_view(ROUTES, one)
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_engine_batch.py`
Expected: FAIL — `ImportError: cannot import name 'merge_fanout_views'`

- [ ] **Step 3: Implement `merge_fanout_views` in `batch.py`**

```python
from .output_view import compute_output_view


def merge_fanout_views(
    routes: list[dict[str, Any]], results: list[dict[str, Any]]
) -> dict[str, dict[str, Any]]:
    """Project N fan-out results into the single view a node exposes.

    Downstream nodes read `output_views[nodeId]`, keyed by node rather than by
    call, so N results must become one view. Values concatenate in batch order;
    keeping only the last result would silently drop four fifths of a 5-item
    batch with nothing raised.

    N == 0 is its own branch: the view is built from the routes alone, which are
    static node data and always available. Deriving metadata from `results[0]`
    would raise IndexError, and omitting the node entirely would leave
    `output_views` without the key so the downstream node fails on lookup.
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
```

Note the deliberate difference from `compute_output_view`: that function drops a channel whose values are empty (`if not values: continue`). Here the key must exist even when empty — that is exactly what AC-11 turns on.

- [ ] **Step 4: Run to verify it passes**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_engine_batch.py`
Expected: PASS, 6 passed

- [ ] **Step 5: Use it in `runner.py`**

Replace the Task-2 placeholder (`result = results[0] if results else {}`) and the block that follows it:

```python
                node_outputs[node_id] = results

                routes = node.get("outputs") or []
                view = merge_fanout_views(routes, results)
                output_views[node_id] = view
                for route in routes:
                    target = route.get("downstreamDataNodeId")
                    if not target:
                        continue
                    channel = view.get(route.get("sourceField"))
                    if channel is None:
                        continue
                    slot_state = data_node_state.get(target, {})
                    if route.get("dataField") == "texts":
                        slot_state["texts"] = channel["values"]
                    else:
                        slot_state["fileKeys"] = channel["values"]
                    data_node_state[target] = slot_state

                emit(
                    {
                        "type": "node_completed",
                        "nodeId": node_id,
                        "output": results[-1] if results else {},
                        "label": label,
                    }
                )
```

Update the import line to `from .batch import fan_out_inputs, merge_fanout_views`.

Two changes worth naming: `node_outputs[node_id]` now holds a **list**, and the `channel` guard changed from falsy to `is None` — an empty channel must still refresh downstream state to an empty list rather than leaving stale values behind.

- [ ] **Step 6: Verify the full suite**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q`
Expected: PASS

If `test_engine.py` fails on `node_outputs` being a list, **do not edit that test** — check whether `_map_workflow_outputs` or `_inline_outputs_in_obj` needs to read `results[-1]`; the contract forbids touching the old tests.

- [ ] **Step 7: Commit**

```bash
git add sdk/tongflow/engine/batch.py sdk/tongflow/engine/runner.py sdk/tests/test_engine_batch.py
git commit -m "feat(engine): merge fan-out results into one ordered output view

Downstream nodes key on nodeId, not on call, so N results must become one
view. Values concatenate in batch order; keeping only the last would drop
four fifths of a 5-item batch with nothing raised."
```

---

## Task 4: Empty batch runs a three-node workflow to completion

Serves AC-11 (E13) — the cell the gap-probe surfaced.

**Files:**
- Modify: `sdk/tests/test_engine_batch.py`
- Modify: `sdk/tongflow/engine/runner.py` if the test exposes a gap

**Interfaces:**
- Consumes: `fan_out_inputs`, `merge_fanout_views` from Tasks 2–3.
- Produces: nothing new.

- [ ] **Step 1: Write the failing end-to-end test**

```python
def test_empty_batch_leaves_a_usable_view_and_downstream_still_runs():
    """The middle node is not where an empty batch detonates — the node after it is."""
    calls: list[str] = []

    def recording_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append(slot)
        return {"success": True, "texts": []}

    workflow = _three_node_workflow_with_empty_batch()  # helper below

    out = run_workflow(workflow, {}, invoker=recording_invoker, auto_install=False)

    middle_id = "node-middle"
    view = out["_debug_output_views"][middle_id] if "_debug_output_views" in out else None
    # If the runner does not expose views, assert through observable behaviour:
    # the third node ran and saw nothing.
    assert "node-middle" not in [c for c in calls]  # middle made zero calls
    assert out.get("success") is not False
```

Refine this once the helper exists: build `_three_node_workflow_with_empty_batch()` as a data node feeding a middle executable with `batchField` bound to an empty list, feeding a third executable. Assert (a) the middle slot appears **zero** times in `calls`, (b) the third slot appears **once**, (c) the run reports no failure.

- [ ] **Step 2: Run to verify it fails**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_engine_batch.py -k empty_batch_leaves`
Expected: FAIL — either `IndexError` from an empty results list, or `KeyError` on the middle node id when the third node resolves params.

If it passes immediately, the merge in Task 3 already covered it: keep the test (it is the regression guard AC-11 asks for) and note that in the commit message rather than inventing a change.

- [ ] **Step 3: Fix whatever the test exposed**

The likely gap is in `runner.py`: `emit(node_completed)` with `results[-1]` on an empty list. Guard it as already written in Task 3 (`results[-1] if results else {}`), and confirm `merge_fanout_views` is called with `[]` rather than being skipped.

- [ ] **Step 4: Run to verify it passes**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_engine_batch.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add sdk/tongflow/engine/runner.py sdk/tests/test_engine_batch.py
git commit -m "fix(engine): an empty batch must not break the node after it

Checking that the batching node makes zero calls says nothing about where an
empty batch actually detonates."
```

---

## Task 5: Python side of the conformance suite

Serves AC-6 (E6) and AC-3 (E14).

**Files:**
- Create: `sdk/tests/conformance/test_conformance.py`
- Create: `sdk/tests/conformance/fixtures/batch-basic.json`
- Create: `sdk/tests/conformance/fixtures/batch-empty.json`
- Create: `sdk/tests/conformance/fixtures/batch-collect.json`

**Interfaces:**
- Consumes: `normalize_call` (Task 1), `run_workflow`.
- Produces: the fixture format both sides read — `{case, workflow, inputs, expectedCalls}`.

- [ ] **Step 1: Write the three remaining fixtures**

Pick a slot that declares `batchOn` by grepping the ABI:

Run: `grep -n '"batch"' config/tongflow.abi.json | head`

`batch-basic`: three items → three expected calls, each carrying the scalar plus every other business field.
`batch-empty`: empty list → `"expectedCalls": []`.
`batch-collect`: a slot with both a `batchField` and a `collectAll` field → the collect field stays a full array in every call while the batch field varies.

- [ ] **Step 2: Write the Python adapter**

```python
"""Python half of the TS↔Python conformance suite.

Both halves read THESE fixture files. The fixture is the contract; the adapters
are what must bend to it.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from tongflow.engine.callog import normalize_call
from tongflow.engine.runner import run_workflow

FIXTURES = Path(__file__).parent / "fixtures"
CASES = ["batch-basic", "batch-empty", "no-batch", "batch-collect"]


def _call_log(spec: dict) -> list[dict]:
    calls: list[dict] = []

    def recording_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append(normalize_call(slot, business_input))
        return {"success": True, "texts": [f"stub-{len(calls)}"]}

    run_workflow(
        spec["workflow"], spec.get("inputs") or {},
        invoker=recording_invoker, auto_install=False,
    )
    return calls


@pytest.mark.parametrize("case", CASES)
def test_python_call_log_matches_fixture(case: str) -> None:
    path = FIXTURES / f"{case}.json"
    # A missing fixture must fail loudly. Skipping it would quietly shrink the
    # suite to whatever happens to be on disk.
    assert path.exists(), f"fixture missing: {path}"
    spec = json.loads(path.read_text())
    assert _call_log(spec) == spec["expectedCalls"]


def test_non_batch_log_still_matches_the_pre_change_baseline() -> None:
    """AC-3: the fan-out change must not have moved the non-batch path at all."""
    spec = json.loads((FIXTURES / "no-batch.json").read_text())
    baseline = json.loads((FIXTURES / "baseline-no-batch.json").read_text())
    assert _call_log(spec) == baseline["calls"]
```

- [ ] **Step 3: Run — expect the baseline test to be the interesting one**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/conformance`
Expected: PASS. If `test_non_batch_log_still_matches_the_pre_change_baseline` fails, the fan-out change moved the non-batch path — **fix `runner.py`, never regenerate the baseline.**

- [ ] **Step 4: Commit**

```bash
git add sdk/tests/conformance/
git commit -m "test: Python half of the conformance suite over four fixtures"
```

---

## Task 6: TypeScript side of the conformance suite

Serves AC-6 (E7).

**Files:**
- Create: `src/lib/abi/conformance.ts`
- Create: `src/lib/abi/conformance.test.ts`

**Interfaces:**
- Consumes: `buildPrompts`, `resolveSpec` from `src/lib/abi/resolve.ts`; the same fixture files under `sdk/tests/conformance/fixtures/`.
- Produces: `normalizeCall(slot: string, input: Record<string, unknown>): {slot: string; input: Record<string, unknown>}` — the TS mirror of `normalize_call`.

- [ ] **Step 1: Write the failing test**

```typescript
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { callLogForFixture } from "./conformance";

// The fixtures live under sdk/ on purpose: one copy, read by both runtimes.
// A copy under src/ would drift, and a drifting fixture is worse than none.
const FIXTURES = join(process.cwd(), "sdk/tests/conformance/fixtures");
const CASES = ["batch-basic", "batch-empty", "no-batch", "batch-collect"];

describe("TS↔Python conformance", () => {
    for (const c of CASES) {
        it(`${c}: canvas call-log matches the shared fixture`, () => {
            const path = join(FIXTURES, `${c}.json`);
            // Fail loudly rather than skipping — a silently absent fixture
            // shrinks the suite without anyone noticing.
            const spec = JSON.parse(readFileSync(path, "utf8"));
            expect(callLogForFixture(spec)).toEqual(spec.expectedCalls);
        });
    }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/lib/abi/conformance.test.ts`
Expected: FAIL — cannot resolve `./conformance`

- [ ] **Step 3: Write the adapter**

```typescript
import { createHash } from "node:crypto";
import { resolveSpec } from "@/lib/abi/resolve";
import { buildPrompts } from "@/lib/abi/resolve";

/**
 * TypeScript mirror of `sdk/tongflow/engine/callog.py`.
 *
 * The two implementations must stay in lockstep; that is the point of the
 * suite. The rule is stated once in the acceptance contract and implemented
 * twice, because the whole exercise is proving two implementations agree.
 */
const DROPPED_KEYS = new Set([
    "_tongflow",
    "taskId",
    "outputs",
    "level",
    "dependencies",
]);

function digestValue(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(digestValue);
    if (v && typeof v === "object") {
        const rec = v as Record<string, unknown>;
        const b64 = rec.bytesBase64;
        if (typeof b64 === "string") {
            const raw = Buffer.from(b64, "base64");
            return { __asset: createHash("sha256").update(raw).digest("hex") };
        }
        const out: Record<string, unknown> = {};
        for (const k of Object.keys(rec).sort()) out[k] = digestValue(rec[k]);
        return out;
    }
    return v;
}

export interface NormalizedCall {
    slot: string;
    input: Record<string, unknown>;
}

export function normalizeCall(
    slot: string,
    input: Record<string, unknown>,
): NormalizedCall {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(input).sort()) {
        if (DROPPED_KEYS.has(k)) continue;
        const v = input[k];
        if (v === undefined || v === null || v === "") continue;
        out[k] = digestValue(v);
    }
    return { slot, input: out };
}

interface FixtureSpec {
    workflow: { nodes: Array<Record<string, unknown>> };
    expectedCalls: NormalizedCall[];
}

/**
 * Derive the canvas-side call-log for a fixture: for each executable node, take
 * the bindings the fixture pins and run them through `buildPrompts` — the same
 * function the canvas uses to decide how many tasks a node becomes.
 */
export function callLogForFixture(spec: FixtureSpec): NormalizedCall[] {
    const log: NormalizedCall[] = [];
    for (const node of spec.workflow.nodes) {
        const slot = String(node.feature);
        const resolved = resolveSpec(slot);
        const prompts = buildPrompts({
            spec: resolved,
            configValues: (node.rawConfig ?? {}) as Record<string, unknown>,
            handleValues: (node.handleValues ?? {}) as Record<string, unknown>,
        });
        for (const p of prompts) log.push(normalizeCall(slot, p));
    }
    return log;
}
```

Check `resolveSpec`'s real signature before writing this — read [`src/lib/abi/resolve.ts`](../../../src/lib/abi/resolve.ts) and adapt the call. The fixture may need a `handleValues` block per node; if so, add it to all four fixtures and re-run the Python side, since the fixture is shared.

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/lib/abi/conformance.test.ts`
Expected: PASS, 4 tests

Both sides now assert against the same `expectedCalls`. If they disagree, that disagreement **is** the drift — resolve it by deciding which side is right (the canvas is the reference per the design doc) rather than by loosening the fixture.

- [ ] **Step 5: Commit**

```bash
git add src/lib/abi/conformance.ts src/lib/abi/conformance.test.ts sdk/tests/conformance/fixtures/
git commit -m "test: TypeScript half of the conformance suite

Reads the same fixture files as the Python half — one copy under sdk/, not a
mirror under src/, because a mirrored fixture drifts."
```

---

## Task 7: Mutation guard — prove the suite is not vacuous

Serves AC-7 (E8).

**Files:**
- Create: `scripts/conformance/check-suite-discriminating.sh`

**Interfaces:**
- Consumes: the two suite commands from Tasks 5–6.
- Produces: an exit-0/exit-1 guard usable in CI.

- [ ] **Step 1: Write the guard**

```bash
#!/usr/bin/env bash
# Prove the conformance suite actually discriminates.
#
# A green suite means nothing until you have seen it go red for the right
# reason. Two perturbation kinds, because they fail differently:
#   (a) call count   — the drift this slice exists to remove;
#   (b) a business field OTHER than the batch field — proves the call-log
#       compares the whole input, not a narrow subset that happens to agree.
#
# Perturbations are applied to a scratch copy under $TMPDIR. The working tree is
# never modified, so a failed run cannot leave the repo in a mutated state.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PY_SUITE='cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/conformance'

run_suite_in() {  # $1 = tree root; returns suite exit code
    ( cd "$1" && eval "$PY_SUITE" >/dev/null 2>&1 ) && echo 0 || echo 1
}

echo "==> baseline: suite must be GREEN"
cp -R "$REPO_ROOT/sdk" "$WORK/sdk"
[ "$(run_suite_in "$WORK")" = "0" ] || { echo "FAIL: suite is red before any perturbation"; exit 1; }

echo "==> perturbation (a): change the call count on the Python side"
rm -rf "$WORK/sdk"; cp -R "$REPO_ROOT/sdk" "$WORK/sdk"
# Drop the last batch item: three calls become two.
perl -0pi -e 's/return \[\{\*\*params, field: item\} for item in value\]/return [{**params, field: item} for item in value[:-1]]/' \
    "$WORK/sdk/tongflow/engine/batch.py"
grep -q 'value\[:-1\]' "$WORK/sdk/tongflow/engine/batch.py" || { echo "FAIL: perturbation (a) did not apply — the guard is checking nothing"; exit 1; }
[ "$(run_suite_in "$WORK")" = "1" ] || { echo "FAIL: suite stayed green with a wrong call count"; exit 1; }
echo "    suite went RED as required"

echo "==> perturbation (b): add a business field on the Python side only"
rm -rf "$WORK/sdk"; cp -R "$REPO_ROOT/sdk" "$WORK/sdk"
perl -0pi -e 's/    return \{"slot": slot, "input": out\}/    out["__mutant_field"] = "x"\n    return {"slot": slot, "input": out}/' \
    "$WORK/sdk/tongflow/engine/callog.py"
grep -q '__mutant_field' "$WORK/sdk/tongflow/engine/callog.py" || { echo "FAIL: perturbation (b) did not apply — the guard is checking nothing"; exit 1; }
[ "$(run_suite_in "$WORK")" = "1" ] || { echo "FAIL: suite stayed green with an extra field on one side — the call-log is comparing a narrow subset"; exit 1; }
echo "    suite went RED as required"

echo "==> revert: suite must be GREEN again"
rm -rf "$WORK/sdk"; cp -R "$REPO_ROOT/sdk" "$WORK/sdk"
[ "$(run_suite_in "$WORK")" = "0" ] || { echo "FAIL: suite did not return to green"; exit 1; }

echo "OK: conformance suite discriminates on both perturbation kinds"
```

The two `grep -q` assertions matter as much as the red/green checks: a `perl` substitution that silently matches nothing would make the guard report success while testing nothing — the exact failure mode the guard exists to prevent.

- [ ] **Step 2: Run it**

Run: `bash scripts/conformance/check-suite-discriminating.sh`
Expected: four `==>` sections, ending `OK: conformance suite discriminates on both perturbation kinds`, exit 0.

If perturbation (a) or (b) leaves the suite green, that is a real finding: the fixture or the normalization is too narrow. Fix the suite, not the guard.

- [ ] **Step 3: Commit**

```bash
chmod +x scripts/conformance/check-suite-discriminating.sh
git add scripts/conformance/check-suite-discriminating.sh
git commit -m "test: mutation guard proving the conformance suite discriminates

Both perturbation kinds — wrong call count, and an extra field outside the
batch field. The second is what proves the call-log compares whole inputs."
```

---

## Task 8: Record `pluginRev` in the scanner

Serves AC-8 (E9) and AC-9 (E10).

**Files:**
- Modify: `sdk/tongflow/scan.py:407` (the `plugins[plugin_id] = {...}` block)
- Create: `sdk/tests/test_plugin_rev.py`

**Interfaces:**
- Produces: `read_plugin_rev(plugin_dir: Path) -> str | None` in `scan.py` — `None` for a non-git directory, raises for a git directory whose rev cannot be read.

- [ ] **Step 1: Write the failing tests**

```python
"""pluginRev: the scanner records which commit of a plugin is installed."""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

from tongflow.scan import read_plugin_rev


def _git_repo(tmp_path: Path) -> tuple[Path, str]:
    d = tmp_path / "oneflow-fixture-plugin"
    d.mkdir()
    (d / "entry.py").write_text("# fixture\n")
    for args in (
        ["init", "-q"],
        ["-c", "user.email=t@t", "-c", "user.name=t", "add", "."],
        ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "init"],
    ):
        subprocess.run(["git", *args], cwd=d, check=True, capture_output=True)
    sha = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=d, check=True, capture_output=True, text=True
    ).stdout.strip()
    return d, sha


def test_git_checkout_yields_the_full_forty_character_sha(tmp_path: Path) -> None:
    d, sha = _git_repo(tmp_path)
    rev = read_plugin_rev(d)
    # Equality with the real sha, not merely truthiness: a function returning
    # "HEAD" or a short sha would pass a truthiness check and poison L1's key.
    assert rev == sha
    assert len(rev) == 40


def test_non_git_directory_yields_none(tmp_path: Path) -> None:
    d = tmp_path / "hand-copied"
    d.mkdir()
    (d / "entry.py").write_text("# copied by hand\n")
    assert read_plugin_rev(d) is None


def test_git_directory_with_unreadable_rev_raises_named_error(tmp_path: Path) -> None:
    d, _ = _git_repo(tmp_path)
    # A .git that exists but is corrupt is a real failure, not a valid config.
    (d / ".git" / "HEAD").write_text("garbage\n")
    with pytest.raises(RuntimeError, match="oneflow-fixture-plugin"):
        read_plugin_rev(d)
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_rev.py`
Expected: FAIL — `ImportError: cannot import name 'read_plugin_rev'`

- [ ] **Step 3: Implement in `scan.py`**

```python
def read_plugin_rev(plugin_dir: Path) -> Optional[str]:
    """The installed commit of a plugin, or None when it is not a checkout.

    Two states that look alike must not be conflated. A hand-copied directory
    legitimately has no rev — dev environments do this. A directory that *is* a
    checkout but whose rev cannot be read is a failure; returning None there
    would let a real breakage pass as a valid configuration, and L1 would build
    cache keys around the gap.
    """
    if not (plugin_dir / ".git").exists():
        return None
    r = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=plugin_dir,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=utf8_env(),
    )
    if r.returncode != 0:
        raise RuntimeError(
            f"cannot read plugin rev for {plugin_dir.name}: "
            f"{r.stderr.strip() or r.stdout.strip()}"
        )
    return r.stdout.strip()
```

Add `import subprocess` and the `utf8_env` import if `scan.py` lacks them (check the top of the file; `engine/plugins.py` imports `utf8_env` from the same place).

Then extend the entry:

```python
        rev = read_plugin_rev(pdir)
        plugins[plugin_id] = {
            "localSubdir": plugin_id,
            "methodsByNodeSlot": llm_methods,
            "entryFile": "entry.py",
            "needsDeploy": needs_deploy,
            # Optional on purpose: a hand-copied plugin has no rev, and a
            # registry written before this field existed must still parse.
            **({"pluginRev": rev} if rev else {}),
        }
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/test_plugin_rev.py`
Expected: PASS, 3 passed

- [ ] **Step 5: Add the zod field and its test**

In `src/lib/plugins/plugins-registry-schema.ts`, inside `PluginConfigSchema`:

```typescript
    /** Full 40-character commit sha of the installed plugin checkout. Optional:
     * a hand-copied plugin directory has none, and registries written before
     * this field existed must still parse. L1 folds this into the cache key. */
    pluginRev: z.string().length(40).optional(),
```

Create `src/lib/plugins/plugin-rev.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { PluginsRegistrySchema } from "./plugins-registry-schema";

const registryWithout = {
    version: 1 as const,
    generatedAt: "2026-07-01T00:00:00Z",
    nodePluginMap: { "image-gen": ["oneflow-example"] },
    plugins: {
        "oneflow-example": {
            localSubdir: "oneflow-example",
            methodsByNodeSlot: { "image-gen": { methodName: "run" } },
        },
    },
};

describe("pluginRev in the registry schema", () => {
    it("parses a registry written before the field existed", () => {
        // Adding a required field here would break every installed desktop
        // build on upgrade, before a rescan ever runs.
        expect(() => PluginsRegistrySchema.parse(registryWithout)).not.toThrow();
    });

    it("parses a registry carrying a 40-character rev", () => {
        const withRev = structuredClone(registryWithout);
        (withRev.plugins["oneflow-example"] as Record<string, unknown>).pluginRev =
            "a".repeat(40);
        expect(() => PluginsRegistrySchema.parse(withRev)).not.toThrow();
    });
});
```

- [ ] **Step 6: Run both sides**

Run: `pnpm vitest run src/lib/plugins/plugin-rev.test.ts && pnpm typecheck`
Expected: PASS, 2 tests; typecheck clean.

- [ ] **Step 7: Commit**

```bash
git add sdk/tongflow/scan.py sdk/tests/test_plugin_rev.py src/lib/plugins/plugins-registry-schema.ts src/lib/plugins/plugin-rev.test.ts
git commit -m "feat(plugins): record pluginRev at scan time

Optional by design, but 'no rev' and 'rev unreadable' are told apart — one
is a valid dev setup, the other a failure that would otherwise pass silently."
```

---

## Task 9: Prove the joined path — TS installer → Python scanner

Serves AC-8 (E15).

**Files:**
- Create: `scripts/plugins/check-rev-joined-path.ts`

**Interfaces:**
- Consumes: `installPlugin` from `src/lib/plugins/plugins-install.server.ts`; `read_plugin_rev` / the scanner from Task 8.

- [ ] **Step 1: Write the check**

```typescript
/**
 * The manifest has exactly one producer — the Python scanner — while the common
 * install path is the TypeScript one (isomorphic-git). Testing each half alone
 * leaves the join untested, and the join is where a desktop build without a git
 * CLI would silently yield no rev.
 *
 * So: install through the real TS code path, then run the real scanner over the
 * result, and assert the entry carries the right sha.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
```

Then: create a temp source repo with `git init` + one commit; run the TS installer's clone path into a temp plugins dir; run the scanner (`python -m tongflow.scan` or the module's `scan()` via a small inline script) over that dir; parse the registry JSON; assert `plugins[<id>].pluginRev` equals the source repo's `git rev-parse HEAD`; exit non-zero with a named message on any mismatch. Clean up temp dirs in a `finally`.

Read [`plugins-install.server.ts:79-170`](../../../src/lib/plugins/plugins-install.server.ts) first — `cloneOrPull` is module-private, so either export it or drive `installPlugin` with a `file://` git URL. Prefer driving the public function: a check that reaches past the real entry point proves less.

- [ ] **Step 2: Run it**

Run: `pnpm tsx scripts/plugins/check-rev-joined-path.ts`
Expected: exit 0 with a line naming the sha it verified.

- [ ] **Step 3: Commit**

```bash
git add scripts/plugins/check-rev-joined-path.ts
git commit -m "test: prove pluginRev survives the TS-install → Python-scan join"
```

---

## Task 10: `node_cached` through all three layers

Serves AC-10 (E12).

**Files:**
- Modify: `src/constants/task-status.ts:39-44`
- Modify: `src/lib/task/engine-delegate.server.ts:60-110`
- Modify: `src/hooks/use-workflow-execution.ts:244`
- Modify: `sdk/tongflow/engine/runner.py` (emit shape only — never fired at L0)
- Create: `src/lib/task/node-cached.test.ts`

**Interfaces:**
- Produces: `NodeStatus.NODE_CACHED` and the payload `{fingerprint: string, tier: "A" | "B", label: string}`.

- [ ] **Step 1: Write the failing three-layer test**

```typescript
import { describe, expect, it } from "vitest";
import { NodeStatus } from "@/constants/task-status";
import type { SSEMessage } from "@/types/sse";

/**
 * Three layers, because two of them can swallow the event without the first
 * noticing: the delegate maps it, the SSE route serializes it, the client
 * parser consumes it. A test that stops at the delegate would still pass while
 * fingerprint and tier never reach the UI — and that only surfaces at L2, which
 * is exactly when this wiring was supposed to already be paid for.
 */
describe("node_cached across delegate, SSE payload, and client parser", () => {
    it("preserves fingerprint and tier end to end", () => {
        const engineEvent = {
            type: "node_cached",
            nodeId: "node-1",
            feature: "image-gen",
            label: "Generate",
            fingerprint: "f".repeat(64),
            tier: "A",
        };

        const notified: Array<{ status: string; data?: Record<string, unknown> }> = [];
        handleEventForTest(engineEvent, (status, data) => notified.push({ status, data }));

        expect(notified).toHaveLength(1);
        expect(notified[0].status).toBe(NodeStatus.NODE_CACHED);

        // Layer 2: what the SSE route actually puts on the wire.
        const wire = `data: ${JSON.stringify({
            id: "task-1",
            status: notified[0].status,
            nodeId: "node-1",
            data: notified[0].data,
        })}\n\n`;

        // Layer 3: what the client parser gets back out.
        const parsed = JSON.parse(wire.slice("data: ".length)) as SSEMessage;
        expect(parsed.data?.fingerprint).toBe("f".repeat(64));
        expect(parsed.data?.tier).toBe("A");
    });

    it("an unrecognized event type notifies nothing and does not throw", () => {
        const notified: unknown[] = [];
        expect(() =>
            handleEventForTest({ type: "totally_unknown", nodeId: "n" }, (s, d) =>
                notified.push({ s, d }),
            ),
        ).not.toThrow();
        expect(notified).toHaveLength(0);
    });
});
```

`handleEvent` in `engine-delegate.server.ts` is module-private and calls `notifyTask` directly. Export a testable form — either export `handleEvent` and stub `notifyTask`, or extract the pure mapping into `export function mapEngineEvent(ev): {status, data, nodeId} | null` and have `handleEvent` call it. **Prefer the extraction:** it makes the mapping testable without stubbing a server-only module, and the switch keeps its single responsibility.

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/lib/task/node-cached.test.ts`
Expected: FAIL — `handleEventForTest` / `NODE_CACHED` undefined

- [ ] **Step 3: Add the status constant**

In `src/constants/task-status.ts`, inside `NodeStatus`:

```typescript
    NODE_CACHED: "NODE_CACHED", // Node reused a cached result instead of running
```

And in `mapSSEStatusToTaskStatus`, next to `NODE_COMPLETED`:

```typescript
        case NodeStatus.NODE_CACHED:
```

A cached node is a completed node from the task's point of view — anything else would leave the canvas spinning forever on a node that already has its answer.

- [ ] **Step 4: Add the delegate case**

In `handleEvent` (or the extracted `mapEngineEvent`):

```typescript
        case "node_cached":
            notifyTask(
                taskId,
                NodeStatus.NODE_CACHED,
                {
                    label: str(ev.label) ?? "",
                    fingerprint: str(ev.fingerprint) ?? "",
                    tier: str(ev.tier) ?? "",
                    output: ev.output,
                },
                nodeId,
            );
            break;
```

- [ ] **Step 5: Add the client case**

In `src/hooks/use-workflow-execution.ts`, extend the `NODE_COMPLETED` case:

```typescript
                            case NodeStatus.NODE_COMPLETED:
                            case NodeStatus.NODE_CACHED:
```

- [ ] **Step 6: Declare the emit shape in the engine**

In `sdk/tongflow/engine/runner.py`, above the execution loop:

```python
# The event a cache hit will emit, declared here at L0 while there is still no
# cache to hit. Adding fields to an event already running in production costs
# far more than declaring them now — L2 fills in fingerprint/tier and calls
# emit() with this exact shape.
#   {"type": "node_cached", "nodeId": str, "feature": str,
#    "label": str, "fingerprint": str, "tier": "A" | "B"}
```

- [ ] **Step 7: Run to verify it passes**

Run: `pnpm vitest run src/lib/task/node-cached.test.ts && pnpm typecheck && pnpm lint:check`
Expected: PASS, 2 tests; typecheck and lint clean.

- [ ] **Step 8: Commit**

```bash
git add src/constants/task-status.ts src/lib/task/engine-delegate.server.ts src/hooks/use-workflow-execution.ts src/lib/task/node-cached.test.ts sdk/tongflow/engine/runner.py
git commit -m "feat(task): wire node_cached through delegate, SSE, and client

No source fires it yet — L2 supplies one. Wiring the path now means the cache
slice adds a call to emit(), not a three-layer plumbing change made while
solving the hard part."
```

---

## Task 11: Full verify sweep before Gate 2

**Files:** none — verification only.

- [ ] **Step 1: Run every suite command**

```bash
pnpm lint:check && pnpm typecheck && pnpm build && pnpm test && pnpm verify:plugins
```

- [ ] **Step 2: Run the SDK suite**

Run: `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q`
Expected: PASS

- [ ] **Step 3: Confirm the untouchable files are untouched**

Run: `git diff --name-only main...HEAD -- sdk/tests/test_engine.py sdk/tests/test_protocol.py sdk/tests/test_scan.py`
Expected: **empty output.** Any name here means AC-3's second half is broken.

- [ ] **Step 4: Confirm the ABI is unchanged**

Run: `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`
Expected: exit 0 — this slice adds no ABI fields.

- [ ] **Step 5: Hand off to S4**

Set contract `status: implemented`. Do **not** run the evals — grading is S4's job, and the implementer is not the grader.

---

## Self-Review

**Spec coverage:** AC-1 → T2 · AC-2 → T2 · AC-3 → T1 (capture) + T5 (compare) · AC-4 → T3 · AC-5 → T3 + T4 · AC-6 → T5 + T6 · AC-7 → T7 · AC-8 → T8 + T9 · AC-9 → T8 · AC-10 → T10 · AC-11 → T4. No AC without a task.

**Type consistency:** `fan_out_inputs(node, params)` and `merge_fanout_views(routes, results)` are named identically in Tasks 2, 3, 4 and in `runner.py`. `normalize_call` (Python) mirrors `normalizeCall` (TS) — different casing per language convention, same rule. `read_plugin_rev` is used with that exact name in Tasks 8 and 9.

**Known soft spots, flagged rather than papered over:**
- Task 6's `callLogForFixture` depends on `resolveSpec`'s real signature, which the plan tells the implementer to read first. The fixtures may need a `handleValues` block; since fixtures are shared, adding it means re-running the Python side too.
- Task 9's check needs either an exported `cloneOrPull` or a `file://` URL through `installPlugin`. The plan states the preference (public entry point) and the reason.
- Task 4 may pass on first run if Task 3's merge already handles N=0. That is an acceptable outcome — the test stays as the regression guard AC-11 asks for.
