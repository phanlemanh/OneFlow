"""Task 4: runner wiring -- `reuse`, cache counters, `node_cached` emission,
end-of-run sweep (AC-9..12, AC-16).

Split out of `test_cache_sweep.py` (fix round 1) once that file's line count
crossed the 800 cap after this section grew -- see `check-test-layout.sh`.
Fixtures follow `cache_helpers.py` / `test_node_cache.py`'s style: real
`run_workflow` calls through a fake invoker, never a hand-built cache entry.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional
from unittest.mock import patch

import pytest

from tongflow.engine import run_workflow
from tongflow.engine import runner as runner_mod
from tongflow.engine.node_cache import DEFAULT_CACHE_MAX_BYTES, NodeCache, resolve_cache_max_bytes

from .cache_helpers import _bridge, _two_node_workflow


def _run(workflow, tmp_path, *, tenant="local", data_dir=None,
         plugin_dir_name="oneflow-text", plugin_rev="a" * 40, workflow_id=None,
         reuse="auto", cache_max_bytes=None, on_progress=None):
    """Task-4 variant of `cache_helpers._run`: adds the `reuse`,
    `cache_max_bytes`, and `on_progress` kwargs this file's tests need, which
    the L2/L3 helper has no reason to expose.
    """
    calls: list[dict] = []

    def recording_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append({"slot": slot, "input": business_input})
        return {"success": True, "text": f"out:{business_input.get('text')}"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / plugin_dir_name).mkdir(parents=True, exist_ok=True)
    plugin_cfg: dict[str, Any] = {"localSubdir": plugin_dir_name}
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
            reuse=reuse,
            cache_max_bytes=cache_max_bytes,
            on_progress=on_progress,
        )
    return result, calls


def _batch_workflow(items: list[str]) -> dict:
    """One tier-A batched node (`split-text`), no downstream consumer --
    same shape as `test_node_cache.py`'s local `_batch_workflow`.
    """
    return {
        "executableNodes": [
            {"id": "n1", "feature": "split-text", "pluginId": "oneflow-text",
             "batchField": "text",
             "bindings": {"text": {"kind": "static", "value": items}},
             "outputs": [], "level": 0, "dependencies": []},
        ],
        "dataNodes": [],
        "executionLevels": [["n1"]],
        "inputs": [],
    }


def _snapshot(root: Path) -> dict[str, tuple[int, int]]:
    """relpath -> (size, mtime_ns) map of every file under `root`, or `{}` if
    absent.

    Fix round 1, item 1: a size-only snapshot is blind to a write-free
    `sweep()` under cap (nothing evicted, so total bytes match) and to
    `get()`'s recency `os.utime()` touch -- both change mtime without
    changing size. Carrying `mtime_ns` catches either leak; a plain
    `os.utime()` touch alone would already flip this snapshot.
    """
    if not root.exists():
        return {}
    return {str(p.relative_to(root)): (p.stat().st_size, p.stat().st_mtime_ns)
            for p in root.rglob("*") if p.is_file()}


def test_reuse_off_touches_nothing(tmp_path, monkeypatch):
    # AC-9. Warm with "auto" first so a cache exists to (not) touch, then a
    # `reuse="off"` run must call the invoker for every call, leave the
    # on-disk tree byte-identical (size AND mtime), never call `sweep()`, and
    # still return correct results.
    wf = _two_node_workflow("hello")
    r1, c1 = _run(wf, tmp_path)  # warm with auto (default)
    assert len(c1) == 2
    root = tmp_path / "data" / ".tongflow" / "node-cache"
    before = _snapshot(root)

    # Sweep spy (fix round 1, item 1): a size-only tree snapshot cannot see a
    # sweep that evicts nothing (write-free under cap), so a leaked
    # `node_cache.sweep(...)` call on the "off" path would otherwise be
    # invisible to this test. Spying on the real bound method proves zero
    # calls, not just "no observable disk effect".
    sweep_calls: list[tuple[tuple[Any, ...], dict[str, Any]]] = []
    original_sweep = NodeCache.sweep

    def spy_sweep(self, *args, **kwargs):
        sweep_calls.append((args, kwargs))
        return original_sweep(self, *args, **kwargs)

    monkeypatch.setattr(NodeCache, "sweep", spy_sweep)

    r2, c2 = _run(wf, tmp_path, reuse="off")
    assert len(c2) == 2                  # invoker called for every call
    assert _snapshot(root) == before     # tree untouched -- no get/put/sweep
    assert sweep_calls == []             # sweep spy: zero calls on the off run
    assert r2["outputs"] == r1["outputs"]
    assert "cache" not in r2             # no cache block when off


def test_invalid_reuse_value_raises(tmp_path):
    # AC-10. Validated before any preflight work: the invoker must never run.
    wf = _two_node_workflow("hello")
    calls: list[str] = []

    def inv(plugin_id, slot, business_input, plugin_dir, model):
        calls.append(slot)
        return {"success": True, "text": "out"}

    for bad in ("force", ""):
        with pytest.raises(ValueError):
            run_workflow(
                wf, {},
                plugins_dir=tmp_path / "plugins",
                data_dir=tmp_path / "data",
                tenant="local",
                invoker=inv,
                auto_install=False,
                reuse=bad,
            )
    assert calls == []


def test_cache_counters_full_partial_miss_and_failure(tmp_path):
    # AC-11/AC-16, five sub-scenarios asserting exact (calls_total, calls_cached).
    # (a) full hit: a two-node workflow, warmed once, then hit on both nodes.
    r_cold, _ = _run(_two_node_workflow("hello"), tmp_path / "a")
    assert r_cold["cache"] == {"calls_total": 2, "calls_cached": 0}
    r_hit, _ = _run(_two_node_workflow("hello"), tmp_path / "a")
    assert r_hit["cache"] == {"calls_total": 2, "calls_cached": 2}

    # (b) batch partial hit: 3 warmed, then 5 -- 3 hit, 2 miss.
    r_batch1, _ = _run(_batch_workflow(["a", "b", "c"]), tmp_path / "b")
    assert r_batch1["cache"] == {"calls_total": 3, "calls_cached": 0}
    r_batch2, _ = _run(_batch_workflow(["a", "b", "c", "d", "e"]), tmp_path / "b")
    assert r_batch2["cache"] == {"calls_total": 5, "calls_cached": 3}

    # (c) all miss: a fresh cold run, nothing to hit.
    r_miss, _ = _run(_two_node_workflow("hello"), tmp_path / "c")
    assert r_miss["cache"] == {"calls_total": 2, "calls_cached": 0}

    # (d) mid-run failure: n1 (combine-text) succeeds and is counted as a
    # miss; n2 (split-text) fails -- the block is still present, and the
    # failed call is counted toward calls_total but never calls_cached.
    def failing_invoker(plugin_id, slot, business_input, plugin_dir, model):
        if slot == "split-text":
            return {"success": False, "error": "boom"}
        return {"success": True, "text": f"out:{business_input.get('text')}"}

    plugins_dir = tmp_path / "d" / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True, exist_ok=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        r_fail = run_workflow(
            _two_node_workflow("hello"), {},
            plugins_dir=plugins_dir,
            data_dir=tmp_path / "d" / "data",
            tenant="local",
            invoker=failing_invoker,
            auto_install=False,
        )
    assert r_fail["status"] == "failed"
    assert r_fail["cache"] == {"calls_total": 2, "calls_cached": 0}

    # (e) reuse="off": no "cache" block at all.
    r_off, _ = _run(_two_node_workflow("hello"), tmp_path / "e", reuse="off")
    assert "cache" not in r_off

    # (f) tenant absent (fix round 1, item 2 -- AC-11's other undiscriminated
    # arm): `tenant=None` means `node_cache` is never constructed in the
    # first place (same gate as `test_missing_tenant_is_not_cacheable`), so
    # there is no "cache" block either -- independent of `reuse`, which stays
    # "auto" here.
    r_notenant, _ = _run(_two_node_workflow("hello"), tmp_path / "f", tenant=None)
    assert "cache" not in r_notenant

    # (g) non-cacheable slot (fix round 1, item 3 -- design §7, adjudicated
    # as-built CORRECT: `calls_total` is the run-level reuse-rate
    # denominator, i.e. ALL plugin calls made, not just cache-eligible ones).
    # `n2` (gen-text) is outside both TIER_A_SLOTS/TIER_B_SLOTS, so it is
    # invoked on every run -- its calls must still land in `calls_total`
    # while never contributing to `calls_cached`.
    wf_mixed = {
        "executableNodes": [
            {"id": "n1", "feature": "combine-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "static", "value": "hello"}},
             "outputs": [], "level": 0, "dependencies": []},
            {"id": "n2", "feature": "gen-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "static", "value": "hello"}},
             "outputs": [], "level": 0, "dependencies": []},
        ],
        "dataNodes": [],
        "executionLevels": [["n1", "n2"]],
        "inputs": [],
    }
    r_mixed_cold, _ = _run(wf_mixed, tmp_path / "g")
    assert r_mixed_cold["cache"] == {"calls_total": 2, "calls_cached": 0}
    r_mixed_warm, _ = _run(wf_mixed, tmp_path / "g")
    # n1 (combine-text, tier A) is now a hit; n2 (gen-text) is NEVER
    # cacheable, so it is invoked again regardless -- both calls still count
    # toward calls_total, but only n1's contributes to calls_cached.
    assert r_mixed_warm["cache"] == {"calls_total": 2, "calls_cached": 1}


def _events_workflow(items: list[str]) -> dict:
    """Three independent, same-level nodes exercising the three
    `node_cached` outcomes at once: `full` (tier A, becomes a full hit once
    warmed), `batch` (tier A batched, partially warmed -> partial hit), and
    `cold` (`gen-text`, outside both allowlists -> never cacheable at all).
    """
    return {
        "executableNodes": [
            {"id": "full", "feature": "combine-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "static", "value": "fixed"}},
             "outputs": [], "level": 0, "dependencies": []},
            {"id": "batch", "feature": "split-text", "pluginId": "oneflow-text",
             "batchField": "text",
             "bindings": {"text": {"kind": "static", "value": items}},
             "outputs": [], "level": 0, "dependencies": []},
            {"id": "cold", "feature": "gen-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "static", "value": "fixed"}},
             "outputs": [], "level": 0, "dependencies": []},
        ],
        "dataNodes": [],
        "executionLevels": [["full", "batch", "cold"]],
        "inputs": [],
    }


def test_full_hit_emits_node_cached_partial_does_not(tmp_path):
    # AC-12. Prime: "full" gets cached, "batch" gets a/b/c cached (cold node
    # ignored -- it is never cacheable regardless of priming).
    _run(_events_workflow(["a", "b", "c"]), tmp_path)

    events: list[dict[str, Any]] = []
    _run(_events_workflow(["a", "b", "c", "d", "e"]), tmp_path, on_progress=events.append)

    node_cached = [e for e in events if e["type"] == "node_cached"]
    node_completed = [e for e in events if e["type"] == "node_completed"]

    # Exactly one node_cached, for the full-hit node only.
    assert [e["nodeId"] for e in node_cached] == ["full"]
    ev = node_cached[0]
    for field in ("nodeId", "feature", "label", "fingerprint", "tier", "output"):
        assert field in ev
    assert ev["feature"] == "combine-text"
    assert ev["tier"] == "A"
    assert isinstance(ev["fingerprint"], str) and len(ev["fingerprint"]) == 64

    # node_completed still fires for all three, node_cached is a strict
    # ADDITION in front of it, not a replacement.
    completed_by_id = {e["nodeId"]: e for e in node_completed}
    assert set(completed_by_id) == {"full", "batch", "cold"}
    assert ev["output"] == completed_by_id["full"]["output"]


def test_run_workflow_auto_sweeps_to_cap_param_env_default(tmp_path, monkeypatch):
    # AC-16. Cap resolution chain (param -> env -> default) plus the
    # end-of-run sweep actually running, on both the success and failure paths.
    monkeypatch.delenv("TONGFLOW_CACHE_MAX_BYTES", raising=False)
    assert resolve_cache_max_bytes(None) == DEFAULT_CACHE_MAX_BYTES

    def _disk_usage(data_dir: Path) -> int:
        root = data_dir / ".tongflow" / "node-cache"
        if not root.exists():
            return 0
        return sum(p.stat().st_size for p in root.rglob("*") if p.is_file())

    wf = _two_node_workflow("x" * 2000)  # sizable business input -> real bytes
    small_cap = 200

    # param, success path: over-cap warm cache brought back under the cap.
    dd_success = tmp_path / "success" / "data"
    _run(wf, tmp_path / "success", cache_max_bytes=small_cap)
    assert _disk_usage(dd_success) <= small_cap

    # param, failure path: sweep still runs even though the run fails.
    def failing_invoker(plugin_id, slot, business_input, plugin_dir, model):
        if slot == "split-text":
            return {"success": False, "error": "boom"}
        return {"success": True, "text": f"out:{business_input.get('text')}"}

    plugins_dir = tmp_path / "fail" / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True, exist_ok=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
    dd_fail = tmp_path / "fail" / "data"
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        r_fail = run_workflow(
            wf, {},
            plugins_dir=plugins_dir,
            data_dir=dd_fail,
            tenant="local",
            invoker=failing_invoker,
            auto_install=False,
            cache_max_bytes=small_cap,
        )
    assert r_fail["status"] == "failed"
    assert _disk_usage(dd_fail) <= small_cap

    # env only, no param: env value obeyed.
    env_cap = 300
    monkeypatch.setenv("TONGFLOW_CACHE_MAX_BYTES", str(env_cap))
    dd_env = tmp_path / "env" / "data"
    _run(wf, tmp_path / "env")
    assert _disk_usage(dd_env) <= env_cap

    # param beats a (much larger) env value.
    monkeypatch.setenv("TONGFLOW_CACHE_MAX_BYTES", "999999999")
    dd_param = tmp_path / "param" / "data"
    _run(wf, tmp_path / "param", cache_max_bytes=small_cap)
    assert _disk_usage(dd_param) <= small_cap


def test_bridge_forwards_reuse_and_empty_string_still_raises(tmp_path):
    # Fix round 1, item 4. `opts.get("reuse") or "auto"` used to silently
    # fold an explicit "" into "auto" -- the one boundary where an invalid
    # host-supplied value failed quiet instead of raising. The fix
    # (`opts.get("reuse") if opts.get("reuse") is not None else "auto"`)
    # means: JSON `null` / an omitted key -> "auto" (still exercised below by
    # the second, cache-hitting bridge call); "" is forwarded as-is and
    # reaches `run_workflow`'s own validation, which raises -- surfaced by
    # the bridge as an `{"error": ...}` line, same pattern as the other
    # `_bridge` tests in `test_node_cache.py`.
    wf = _two_node_workflow("hello")
    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
    calls: list[str] = []

    def fake_invoke(**kw):
        calls.append(kw["node_slot"])
        return {"success": True, "text": "out"}

    base_opts = {"plugins_dir": str(plugins_dir), "data_dir": str(tmp_path / "data"),
                 "tenant": "local", "auto_install": False}
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        with patch.object(runner_mod, "invoke_plugin", fake_invoke):
            # omitted reuse -> defaults to "auto": second call is a hit.
            _bridge({"workflow": wf, "inputs": {}, "options": dict(base_opts)})
            first = len(calls)
            _bridge({"workflow": wf, "inputs": {}, "options": dict(base_opts)})
            assert len(calls) == first  # second call: zero new invocations

            # explicit "" reuse -> reaches run_workflow, raises ValueError,
            # surfaced by the bridge as an error line, not silently "auto".
            resp = _bridge({"workflow": wf, "inputs": {},
                             "options": {**base_opts, "reuse": ""}})
            assert "error" in resp
