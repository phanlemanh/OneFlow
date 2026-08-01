"""Standalone workflow execution engine.

``run_workflow`` interprets an exported ``ExecutableWorkflow`` JSON
(``src/lib/workflow/exporter.ts`` output) entirely in Python — no running
TongFlow app required. It is a direct translation of ``executeWorkflowTask`` in
``src/lib/task/runner.ts``:

1. seed data-node state from ``staticData`` (workflow inputs override on read)
2. for each tier in ``executionLevels`` (already topologically sorted):
   resolve params from bindings -> materialize asset inputs -> spawn the plugin
   -> persist asset outputs -> project into the ABI output view -> refresh the
   downstream data nodes this node feeds
3. aggregate per-node outputs / errors and return.

The exported JSON is a self-contained execution plan (sorted levels, resolved
bindings, resolved output routes), so no graph parsing happens here.
"""

from __future__ import annotations

import base64
import json
from pathlib import Path
from typing import Any, Callable, Optional, Union

from .abi_schema import load_abi_schema, resolve_abi_path
from .assets import convert_asset_outputs_to_file_refs, materialize_asset_inputs
from .batch import (
    batch_field_of,
    fan_out_inputs,
    merge_fanout_results,
    merge_fanout_views,
)
from .bindings import resolve_node_params
from .fingerprint import node_fingerprint
from .invoker import invoke_plugin
from .node_cache import (
    TIER_A_SLOTS,
    TIER_B_SLOTS,
    NodeCache,
    abi_digest_of,
    plugin_is_dirty,
    resolve_cache_max_bytes,
)
from .paths import resolve_data_dir, resolve_plugins_dir
from .plugins import (
    DEFAULT_ORG,
    SDK_ROOT,
    collect_plugin_ids,
    ensure_plugins_present,
    prepare_python_env,
    scan_manifest,
)
from .store import AssetStore, DiskStore, HttpStore, MemoryStore

EventCb = Callable[[dict[str, Any]], None]

# Optional backend-specific plugin invoker. When supplied, run_workflow calls
# this instead of spawning the plugin's entry.py — a cloud orchestrator can
# dispatch straight to the plugin's own deployed function, skipping the shared
# venv and the subprocess entirely. Backend-neutral here: the host owns the
# call. Signature: (plugin_id, node_slot, prompt, plugin_dir, model) -> raw ABI dict.
InvokerCb = Callable[[str, str, dict[str, Any], Path, Optional[str]], dict[str, Any]]


def _inline_outputs_in_obj(obj: Any, store: MemoryStore) -> Any:
    """Recursively replace ``{file_key: mem://...}`` refs with inline bytes.

    Used in inline mode so the caller receives ``{bytesBase64, mime?, filename?}``
    instead of opaque in-memory handles.
    """
    if isinstance(obj, dict):
        fk = obj.get("file_key")
        if isinstance(fk, str) and fk.startswith(MemoryStore.SCHEME):
            data = store.get(fk)
            if data is not None:
                out: dict[str, Any] = {
                    "bytesBase64": base64.b64encode(data).decode("ascii")
                }
                if isinstance(obj.get("mime"), str):
                    out["mime"] = obj["mime"]
                if isinstance(obj.get("filename"), str):
                    out["filename"] = obj["filename"]
                return out
        return {k: _inline_outputs_in_obj(v, store) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_inline_outputs_in_obj(v, store) for v in obj]
    if isinstance(obj, str) and obj.startswith(MemoryStore.SCHEME):
        data = store.get(obj)
        if data is not None:
            return base64.b64encode(data).decode("ascii")
    return obj


def _load_workflow(workflow: Union[str, Path, dict[str, Any]]) -> dict[str, Any]:
    if isinstance(workflow, dict):
        return workflow
    return json.loads(Path(workflow).read_text(encoding="utf-8"))


def _input_to_slot(value: Any, data_type: Any) -> dict[str, Any]:
    """Normalize a provided workflow input into a {texts|fileKeys} slot.

    A dict with ``texts`` / ``fileKeys`` is used as-is; a list or string is
    routed to ``texts`` for text data nodes and ``fileKeys`` otherwise.
    """
    if isinstance(value, dict):
        slot: dict[str, Any] = {}
        if value.get("texts"):
            slot["texts"] = list(value["texts"])
        if value.get("fileKeys"):
            slot["fileKeys"] = list(value["fileKeys"])
        return slot
    field = "texts" if data_type == "text" else "fileKeys"
    if isinstance(value, list):
        return {field: [str(v) for v in value]}
    if isinstance(value, str):
        return {field: [value]}
    return {}


def _seed_data_node_state(
    data_nodes: list[dict[str, Any]], inputs: dict[str, Any]
) -> dict[str, dict[str, Any]]:
    """Seed live data-node state.

    Each input data node uses a caller-provided value for its ``inputName`` when
    present (the execution-engine contract: provided inputs override the canvas
    defaults), otherwise it falls back to the baked-in ``staticData``.
    """
    state: dict[str, dict[str, Any]] = {}
    for dn in data_nodes:
        if not isinstance(dn, dict):
            continue
        slot: dict[str, Any] = {}
        input_name = dn.get("inputName")
        if input_name and input_name in inputs:
            slot = _input_to_slot(inputs[input_name], dn.get("dataType"))
        if not slot:
            static = dn.get("staticData")
            if isinstance(static, dict):
                if static.get("texts"):
                    slot["texts"] = static["texts"]
                if static.get("fileKeys"):
                    slot["fileKeys"] = static["fileKeys"]
        if slot:
            state[dn["id"]] = slot
    return state


def _map_workflow_outputs(
    workflow: dict[str, Any],
    output_views: dict[str, dict[str, Any]],
    data_node_state: dict[str, dict[str, Any]],
) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for spec in workflow.get("outputs", []):
        if not isinstance(spec, dict):
            continue
        name = spec.get("name")
        node_id = spec.get("nodeId")
        field = spec.get("field")
        if not (isinstance(name, str) and isinstance(node_id, str) and isinstance(field, str)):
            continue
        view = output_views.get(node_id)
        if view and field in view:
            out[name] = list(view[field]["values"])
            continue
        slot = data_node_state.get(node_id)
        if slot:
            if field in ("texts", "fileKeys") and slot.get(field):
                out[name] = list(slot[field])
            elif slot.get("fileKeys"):
                out[name] = list(slot["fileKeys"])
            elif slot.get("texts"):
                out[name] = list(slot["texts"])
    return out


def run_workflow(
    workflow: Union[str, Path, dict[str, Any]],
    inputs: Optional[dict[str, Any]] = None,
    *,
    plugins_dir: Optional[Union[str, Path]] = None,
    data_dir: Optional[Union[str, Path]] = None,
    out_dir: Optional[Union[str, Path]] = None,
    abi_path: Optional[Union[str, Path]] = None,
    file_key_base: Optional[Union[str, Path]] = None,
    inline_outputs: bool = True,
    asset_endpoint: Optional[str] = None,
    asset_token: Optional[str] = None,
    auto_install: bool = True,
    org: str = DEFAULT_ORG,
    plugin_git_urls: Optional[dict[str, str]] = None,
    on_progress: Optional[EventCb] = None,
    task_id: str = "tongflow-engine",
    tenant: Optional[str] = None,
    workflow_id: Optional[str] = None,
    invoker: Optional[InvokerCb] = None,
    reuse: str = "auto",
    cache_max_bytes: Optional[int] = None,
) -> dict[str, Any]:
    """Execute an exported workflow and return its results.

    Args:
        workflow: path to (or parsed dict of) an exported workflow JSON. The
            ``.executable.json`` form is ideal; ``.workflow.json`` works too
            (``originalFlow`` is ignored).
        inputs: workflow inputs keyed by ``WorkflowInput.name``. Each value may
            be ``{"texts"|"fileKeys": [...]}``, a list, or a string. Omitted
            inputs fall back to the data node's ``staticData``.
        plugins_dir / data_dir: filesystem roots. Defaults follow the desktop
            app's per-user dir (e.g. macOS ``~/Library/Application Support/
            TongFlow``), with env ``TONGFLOW_PLUGINS_DIR`` / ``TONGFLOW_DATA_DIR``
            honored. Never defaults to cwd.
        out_dir / file_key_base: only used when ``inline_outputs=False``.
        abi_path: ABI location (defaults to bundled / repo ``config``).
        inline_outputs: when True (default) outputs stay in memory and are
            returned as ``{bytesBase64, mime?, filename?}`` — zero files written
            (besides the required plugin clone / venv). When False, outputs are
            written to ``out_dir`` and returned as ``file_key`` paths.
        asset_endpoint / asset_token: host-managed asset store (loopback HTTP
            sink, see :class:`~tongflow.engine.store.HttpStore`). When set it
            overrides ``inline_outputs``: outputs are POSTed to the host and
            input ``file_key`` refs are fetched from it — the engine touches
            no asset files on disk.
        auto_install: clone missing plugins and provision a shared venv.
        org / plugin_git_urls: where to clone official / custom plugins from.
        on_progress: optional callback receiving progress event dicts.
        tenant: cache scope for this run. Required for any caching to happen;
            an empty string or None disables the cache entirely rather than
            falling back to a shared one. The single-tenant build sends
            "local"; a cloud shell sends "user:<id>".
        workflow_id: cache scope for tier B (nondeterministic) slots within
            this run. A non-empty, non-whitespace string is required for tier
            B memoization to activate (`"wf:<workflow_id>:node:<nodeId>"`);
            absent, None, empty, or whitespace-only disables tier B caching
            only -- tier A caching is unaffected either way.
        reuse: `"auto"` (default) lets the node cache serve hits as usual;
            `"off"` is the single kill point -- the cache is never
            constructed, so no `get`/`put`/`sweep` happens anywhere in this
            run, regardless of `tenant`. Any other value raises `ValueError`
            immediately, before any preflight work starts.
        cache_max_bytes: end-of-run sweep cap, resolved through
            `resolve_cache_max_bytes` (explicit param -> `TONGFLOW_CACHE_MAX_BYTES`
            env -> `DEFAULT_CACHE_MAX_BYTES`). Only consulted when the cache is
            active (`reuse="auto"` and `tenant` set).

    Returns:
        ``{"status", "outputs", "outputs_by_name", "errors", "failures"}``,
        plus ``"cache": {"calls_total", "calls_cached"}`` iff the node cache is
        active for this run. ``outputs`` maps node id -> raw plugin output; in
        inline mode asset fields are ``{bytesBase64, ...}``, otherwise
        ``file_key`` paths.
    """
    if reuse not in ("auto", "off"):
        raise ValueError(f"invalid reuse={reuse!r}; expected 'auto' or 'off'")
    inputs = inputs or {}
    wf = _load_workflow(workflow)

    plugins_dir = resolve_plugins_dir(plugins_dir)
    data_dir = resolve_data_dir(data_dir)
    fk_base = Path(file_key_base).resolve() if file_key_base else None
    abi_file = resolve_abi_path(abi_path)
    abi = load_abi_schema(abi_file)

    # One digest per run: the ABI does not change mid-run, and hashing it per
    # call would be pointless I/O.
    try:
        abi_dig = abi_digest_of(abi_file)
    except OSError:
        # Can't hash the ABI, so there is no reliable key input. Fail closed
        # (cache off) rather than an empty digest, which would give every ABI
        # variant the same shared key -- fail-open, the wrong direction here.
        abi_dig = ""
        node_cache = None
    else:
        node_cache = NodeCache(data_dir) if tenant else None
    # `reuse="off"` is the single kill point (see docstring): overriding here,
    # after both branches above, means no other code path needs to consult
    # `reuse` again -- every `get`/`put`/`sweep` call below is already gated
    # on `node_cache is not None`.
    if reuse == "off":
        node_cache = None
    # One `git status` per plugin dir per run (memoized here); a plugin that
    # goes dirty mid-run keeps the verdict computed at its first cache lookup
    # -- acceptable for a single run.
    dirty_by_dir: dict[Path, bool] = {}
    # Gate for tier B (nondeterministic slots, memoized per workflow): a
    # non-empty, non-whitespace workflow_id is required, computed once here
    # rather than per call. Absence disables tier B ONLY -- tier A's
    # workflow_scope=None path below is untouched by this flag. `wf_id_clean`
    # is the STRIPPED value, computed once alongside the gate itself, so the
    # scope string built below can reuse it instead of re-interpolating the
    # raw (possibly whitespace-padded) `workflow_id`.
    wf_id_clean = str(workflow_id).strip() if workflow_id else ""
    wf_scope_ok = bool(wf_id_clean)

    # Output store: in-memory (inline, zero disk) or on-disk (file_key paths,
    # used by the desktop delegation so the canvas reads via /api/uploads).
    out_path = Path(out_dir).resolve() if out_dir else (data_dir / "engine-out")
    store: AssetStore
    if asset_endpoint:
        store = HttpStore(asset_endpoint, asset_token)
    elif inline_outputs:
        store = MemoryStore()
    else:
        store = DiskStore(out_path, fk_base)

    # Event shapes this loop emits. `node_cached` is real as of L4: emitted
    # once per node, after that node's per-call loop, when `results` is
    # non-empty and every call in it was a cache hit (a partial hit -- some
    # calls missed -- gets no `node_cached` at all, only the ordinary
    # `node_completed` below). It always precedes `node_completed` for the
    # same node.
    #
    #   {"type": "node_cached", "nodeId": str, "feature": str,
    #    "label": str, "fingerprint": str, "tier": "A" | "B",
    #    "output": dict | None}
    #
    # `fingerprint` is the first hit's cache key; `tier` is "A"/"B" by which
    # allowlist (`TIER_A_SLOTS`/`TIER_B_SLOTS`) the node's slot belongs to.
    # `output` is `merge_fanout_results(results)` -- the same reused artifact
    # `node_completed` carries -- so the canvas can apply a fully-cached node
    # from this event alone (use-workflow-execution.ts -> applyNodeOutput)
    # without waiting on `node_completed` to learn what was reused.
    def emit(event: dict[str, Any]) -> None:
        if on_progress is not None:
            on_progress(event)

    def log(message: str) -> None:
        emit({"type": "log", "message": message})

    # --- preflight: plugins + python env + manifest -------------------------
    plugin_ids = collect_plugin_ids(wf)
    ensure_plugins_present(
        plugin_ids,
        plugins_dir,
        auto_install=auto_install,
        org=org,
        plugin_git_urls=plugin_git_urls,
        log=log,
    )
    # A host-supplied invoker dispatches to the plugin's own deployed function,
    # so there is no subprocess to host and no shared venv to provision.
    python = (
        ""
        if invoker is not None
        else prepare_python_env(
            plugin_ids, plugins_dir, data_dir, auto_install=auto_install, log=log
        )
    )
    manifest = scan_manifest(plugins_dir, abi_file)
    plugin_cfgs: dict[str, Any] = manifest.get("plugins", {})

    # Asset inputs may reference files relative to these roots. When a
    # file_key_base is set (host-managed uploads), resolve relative keys there
    # first so `tasks/<id>/x.png` style keys load. (mem:// handles are resolved
    # by the store, ahead of the filesystem search.)
    search_dirs = [
        d for d in [fk_base, plugins_dir, data_dir, out_path, Path.cwd()] if d
    ]

    exec_nodes: list[dict[str, Any]] = wf.get("executableNodes", []) or []
    nodes_by_id = {n["id"]: n for n in exec_nodes}
    data_nodes: list[dict[str, Any]] = wf.get("dataNodes", []) or []
    execution_levels: list[list[str]] = wf.get("executionLevels", []) or []

    output_views: dict[str, dict[str, Any]] = {}
    data_node_state = _seed_data_node_state(data_nodes, inputs)
    node_outputs: dict[str, Any] = {}
    error_summaries: list[str] = []
    failures: list[dict[str, str]] = []
    # Run-wide cache counters (AC-11/AC-16), surfaced in the result iff the
    # cache is active. Incremented per per-call loop iteration, not per node
    # -- a batched node's N calls each count individually, which is what
    # makes `calls_cached` a meaningful hit rate rather than a per-node flag.
    calls_total = 0
    calls_cached = 0

    emit(
        {
            "type": "workflow_started",
            "totalNodes": len(exec_nodes),
            "levels": len(execution_levels),
        }
    )

    for level_idx, level in enumerate(execution_levels):
        for node_id in level:
            node = nodes_by_id.get(node_id)
            if node is None:
                continue
            label = node.get("label") or node.get("feature") or ""
            slot = (node.get("feature") or "").strip()
            plugin_id = (node.get("pluginId") or "").strip()
            model = (node.get("model") or "").strip() or None
            emit(
                {
                    "type": "node_started",
                    "nodeId": node_id,
                    "level": level_idx + 1,
                    "feature": slot,
                    "label": label,
                }
            )
            try:
                if not plugin_id:
                    raise RuntimeError(
                        f"Missing pluginId for nodeSlot={slot}. Select a plugin in the node UI."
                    )
                if not abi.has_slot(slot):
                    raise RuntimeError(
                        f"Invalid nodeSlot={slot}: not in ABI. Cannot execute workflow node."
                    )
                cfg = plugin_cfgs.get(plugin_id)
                if not cfg:
                    raise RuntimeError(
                        f"Plugin {plugin_id} not found in scanned manifest."
                    )

                params = resolve_node_params(
                    node, output_views, data_node_state, data_nodes, inputs
                )
                # Match the canvas: a node declaring `batchField` becomes one
                # plugin call per item (buildPrompts in src/lib/abi/resolve.ts).
                per_call_params = fan_out_inputs(node, params)
                plugin_dir = plugins_dir / cfg["localSubdir"]

                results: list[dict[str, Any]] = []
                # Per-node `node_cached` bookkeeping (AC-12): a full hit needs
                # every call in this node's loop to have been a HIT, and the
                # emitted `fingerprint` is the FIRST hit's key, not the last --
                # reset per node, not per run.
                all_calls_hit = True
                first_hit_key: Optional[str] = None
                first_hit_tier: Optional[str] = None
                for idx, call_params in enumerate(per_call_params):
                    business_input = materialize_asset_inputs(
                        slot, call_params, abi, search_dirs, store
                    )
                    cache_key = None
                    # `key_scope` mirrors whichever `workflow_scope` fed
                    # `cache_key` below (None for tier A, the tier-B scope
                    # string otherwise) -- `put()` needs the same value, and
                    # rebuilding it there would risk drifting from what was
                    # actually hashed into the key. `key_tier` is the same
                    # anti-drift discipline for the `node_cached` emission's
                    # "A"/"B" field -- set alongside `cache_key` in the SAME
                    # branch that computed it, instead of re-deriving it later
                    # from `slot in TIER_A_SLOTS`, which could silently drift
                    # from whichever branch actually fired if the two allowlist
                    # checks above and below ever diverged.
                    key_scope: Optional[str] = None
                    key_tier: Optional[str] = None
                    if node_cache is not None and slot in TIER_A_SLOTS:
                        if plugin_dir not in dirty_by_dir:
                            dirty_by_dir[plugin_dir] = plugin_is_dirty(plugin_dir)
                        key_tier = "A"
                        cache_key = node_fingerprint(
                            slot=slot,
                            plugin_id=plugin_id,
                            plugin_rev=cfg.get("pluginRev"),
                            plugin_dirty=dirty_by_dir[plugin_dir],
                            tenant=tenant,
                            abi_digest=abi_dig,
                            model=model,
                            business_input=business_input,
                            # Tier A has no workflow scope at all -- its result
                            # is reusable across every workflow that shares the
                            # same input, which is the whole point of L1/L2.
                            workflow_scope=None,
                        )
                    elif node_cache is not None and slot in TIER_B_SLOTS and wf_scope_ok:
                        if plugin_dir not in dirty_by_dir:
                            dirty_by_dir[plugin_dir] = plugin_is_dirty(plugin_dir)
                        scope = f"wf:{wf_id_clean}:node:{node_id}"
                        # A batched node fans out into N calls with, in the
                        # duplicate-variant case, byte-identical call_params
                        # (AC-14): collapsing them onto one key is correct for
                        # tier A (deterministic -- same input, same output) but
                        # wrong here -- the whole point of a nondeterministic
                        # slot is that the user asked for N distinct variants
                        # of the same prompt. The call's ordinal keeps each
                        # variant's key distinct within this node's scope.
                        if batch_field_of(node) is not None:
                            scope = f"{scope}:call:{idx}"
                        key_scope = scope
                        key_tier = "B"
                        cache_key = node_fingerprint(
                            slot=slot,
                            plugin_id=plugin_id,
                            plugin_rev=cfg.get("pluginRev"),
                            plugin_dirty=dirty_by_dir[plugin_dir],
                            tenant=tenant,
                            abi_digest=abi_dig,
                            model=model,
                            business_input=business_input,
                            workflow_scope=scope,
                        )
                    # slot in TIER_B_SLOTS without wf_scope_ok: cache_key stays
                    # None -- tier B off for this call, tier A elsewhere in the
                    # same run is unaffected. slot in neither tier: no cache,
                    # unchanged.

                    cached = (
                        node_cache.get(cache_key, store, log=log)
                        if (node_cache is not None and cache_key)
                        else None
                    )
                    if node_cache is not None:
                        calls_total += 1
                        if cached is not None:
                            calls_cached += 1
                    if cached is not None:
                        if first_hit_key is None:
                            first_hit_key = cache_key
                            first_hit_tier = key_tier
                        results.append(cached)
                        continue
                    all_calls_hit = False

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
                    # Write AFTER the success check: D8 forbids caching a
                    # failure, and a transient error cached as a permanent one
                    # is the worst outcome in this family.
                    if node_cache is not None and cache_key:
                        node_cache.put(
                            cache_key, one, store,
                            tenant=tenant, workflow_scope=key_scope, log=log,
                        )
                    results.append(one)

                # A batched node's raw output is the list of its calls; an
                # unbatched one keeps the single dict it has always been, so
                # `outputs[nodeId]` stays what existing consumers expect.
                node_outputs[node_id] = (
                    results[0] if batch_field_of(node) is None else results
                )

                routes = node.get("outputs") or []
                view = merge_fanout_views(routes, results)
                output_views[node_id] = view
                for route in routes:
                    target = route.get("downstreamDataNodeId")
                    if not target:
                        continue
                    channel = view.get(route.get("sourceField"))
                    # What keeps stale downstream data from surviving an empty
                    # batch is `merge_fanout_views` always emitting the channel
                    # — with `values: []` when there were no results — so this
                    # guard sees a real channel and refreshes state to empty.
                    # It used to be reached with the channel missing, which left
                    # the previous run's values in place.
                    if not channel:
                        continue
                    slot_state = data_node_state.get(target, {})
                    if route.get("dataField") == "texts":
                        slot_state["texts"] = channel["values"]
                    else:
                        slot_state["fileKeys"] = channel["values"]
                    data_node_state[target] = slot_state

                # Full-hit node_cached: every call this node made was a cache
                # HIT (all_calls_hit) and it actually made at least one
                # (results non-empty -- an empty batch trivially satisfies
                # all_calls_hit with nothing to report). A partial hit gets
                # no node_cached, only the node_completed below.
                if results and all_calls_hit and first_hit_key is not None:
                    emit(
                        {
                            "type": "node_cached",
                            "nodeId": node_id,
                            "feature": slot,
                            "label": label,
                            "fingerprint": first_hit_key,
                            "tier": first_hit_tier,
                            "output": merge_fanout_results(results),
                        }
                    )

                emit(
                    {
                        "type": "node_completed",
                        "nodeId": node_id,
                        # Every result, not the last one: this event is the only
                        # path an executable's output takes to the canvas, so
                        # emitting one of N would render a five-item batch as a
                        # single item while the engine's own downstream nodes
                        # saw all five.
                        "output": merge_fanout_results(results),
                        "label": label,
                    }
                )
            except Exception as e:  # noqa: BLE001 - aggregate per-node failure
                msg = str(e)
                error_summaries.append(f"Node {node_id} failed: {msg}")
                failures.append({"nodeId": node_id, "summary": msg})
                emit(
                    {
                        "type": "node_failed",
                        "nodeId": node_id,
                        "error": msg,
                        "label": label,
                    }
                )
                break
        if error_summaries:
            break

    outputs_by_name = _map_workflow_outputs(wf, output_views, data_node_state)

    # In inline mode, resolve mem:// handles to inline bytes for the caller.
    if isinstance(store, MemoryStore):
        node_outputs = _inline_outputs_in_obj(node_outputs, store)
        outputs_by_name = _inline_outputs_in_obj(outputs_by_name, store)

    status = "success" if not error_summaries else "failed"

    # End-of-run maintenance sweep (AC-16): on BOTH the success path and the
    # error_summaries (failure) path -- they converge here, above the final
    # emit, which is exactly why the sweep sits at this one spot rather than
    # duplicated at each `break`. No-op when the cache was never active
    # (`reuse="off"`, no tenant, or the ABI couldn't be hashed).
    if node_cache is not None:
        node_cache.sweep(resolve_cache_max_bytes(cache_max_bytes), log=log)

    emit(
        {
            "type": "workflow_completed" if status == "success" else "workflow_failed",
            "status": status,
            "outputs": node_outputs,
            "errors": error_summaries,
        }
    )

    result: dict[str, Any] = {
        "status": status,
        "outputs": node_outputs,
        "outputs_by_name": outputs_by_name,
        "errors": error_summaries,
        "failures": failures,
    }
    if node_cache is not None:
        result["cache"] = {"calls_total": calls_total, "calls_cached": calls_cached}
    return result
