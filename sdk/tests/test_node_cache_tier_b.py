from __future__ import annotations

import base64
import json
import os
import subprocess
from unittest.mock import patch

from tongflow.engine import run_workflow
from tongflow.engine import runner as runner_mod
from tongflow.engine.node_cache import (
    DESCOPED_GENERATIVE_SLOTS,
    TIER_A_SLOTS,
    TIER_B_SLOTS,
    plugin_is_dirty,
)

from .cache_helpers import _bridge, _run, _two_node_workflow


def test_tier_lists_are_disjoint_and_pinned():
    # E6 / AC-6. Three independent guards on the same pair of constants:
    # (1) TIER_B_SLOTS is pinned to the exact 23-slot literal from design §3 --
    #     a silent addition or drop must go red here, not slide in unreviewed.
    # (2) the two allowlists never overlap -- one slot in both would be two
    #     cache semantics for one computation.
    # (3) the nine deliberately-uncached generative slots sit in NEITHER list
    #     (the original five plus the four TTS slots the design's
    #     "descoped generative" group also names).
    assert TIER_B_SLOTS == frozenset({
        "audio-video-lip-sync", "gen-music", "image-edit", "image-fusion",
        "image-gen", "image-gen-model", "image-gen-text", "image-gen-video",
        "image-image-gen-video", "image-upscale", "images-gen-video",
        "music-complete", "music-cover", "music-extract", "music-lego",
        "music-repaint", "speech-text-gen-video", "speech-video-gen-video",
        "text-gen-video", "video-edit", "video-gen-text",
        "video-image-gen-video-move", "video-upscale",
    })
    assert TIER_A_SLOTS & TIER_B_SLOTS == frozenset()
    for descoped in DESCOPED_GENERATIVE_SLOTS:
        assert descoped not in TIER_A_SLOTS
        assert descoped not in TIER_B_SLOTS
    assert DESCOPED_GENERATIVE_SLOTS == frozenset({
        "gen-text", "image-describe", "video-describe", "audio-describe",
        "music-brief", "text-gen-speech-preset", "text-gen-speech-clone",
        "text-gen-speech-instruct", "text-audio-gen-speech",
    })

    # Gap-probe P1's guard: derive the knobbed-slot set from the REAL ABI at
    # TEST time (not baked into a runtime lookup -- see node_cache.py's
    # no-runtime-inference rule) and check it against the pinned constants, so a
    # future ABI addition that grows a seed/temperature/top_p knob on a slot
    # currently in neither list turns red here instead of being cached as if
    # deterministic under TIER_A, or silently uncached under neither.
    from tongflow.engine.abi_schema import resolve_abi_path
    abi = json.loads(resolve_abi_path(None).read_text(encoding="utf-8"))
    knobbed = {
        node["nodeSlot"]
        for node in abi["nodes"]
        if any(k in node.get("inputs", {}).get("properties", {})
               for k in ("seed", "temperature", "top_p"))
    }
    assert knobbed <= (TIER_B_SLOTS | DESCOPED_GENERATIVE_SLOTS)
    assert knobbed & TIER_A_SLOTS == frozenset()


def test_abi_guard_catches_both_directions():
    # AC-15 / E18. `test_tier_lists_are_disjoint_and_pinned` above already
    # asserts direction (a) -- ABI knob -> constants -- as one clause among
    # several; this test isolates the ABI<->allowlist relationship on its own
    # node-id so it can be re-run standalone as re-pin evidence, and adds the
    # new direction (b): every hand-maintained slot name in TIER_A_SLOTS /
    # TIER_B_SLOTS / DESCOPED_GENERATIVE_SLOTS must still be a real slot in
    # the ABI. A slot renamed or removed from the ABI would otherwise leave a
    # stale allowlist entry that silently matches nothing, forever, instead
    # of failing loudly.
    from tongflow.engine.abi_schema import resolve_abi_path
    abi = json.loads(resolve_abi_path(None).read_text(encoding="utf-8"))
    abi_slots = {node["nodeSlot"] for node in abi["nodes"]}
    knobbed = {
        node["nodeSlot"]
        for node in abi["nodes"]
        if any(k in node.get("inputs", {}).get("properties", {})
               for k in ("seed", "temperature", "top_p"))
    }

    # (a) ABI -> constants: every knobbed slot lands in tier B or the
    # descoped generative group (never uncached-and-unnamed, never tier A).
    assert knobbed <= (TIER_B_SLOTS | DESCOPED_GENERATIVE_SLOTS)

    # (b) constants -> ABI: every hand-maintained slot name still resolves
    # to a real ABI node. Catches config drift the other direction can't --
    # e.g. an ABI slot rename that leaves `DESCOPED_GENERATIVE_SLOTS` or
    # `TIER_B_SLOTS` holding a name the ABI no longer has.
    all_named_slots = TIER_A_SLOTS | TIER_B_SLOTS | DESCOPED_GENERATIVE_SLOTS
    assert all_named_slots <= abi_slots


def test_git_status_failure_reads_as_dirty(tmp_path):
    # E8 / AC-8, unit half. A real checkout (so `.git` truly exists and the
    # early-return branch is not what's under test), then force `git status`
    # itself to fail -- index corruption or a permissions error, not "not a
    # checkout". R1: a readable rev + unknowable dirtiness must NOT be treated
    # as clean, or edited plugin code gets cached under a clean-rev key.
    d = tmp_path / "plug"
    d.mkdir()
    (d / "entry.py").write_text("x = 1\n", encoding="utf-8")
    env = {**os.environ, "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@e",
           "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@e"}
    subprocess.run(["git", "init", "-q"], cwd=d, check=True, env=env)
    subprocess.run(["git", "add", "-A"], cwd=d, check=True, env=env)
    subprocess.run(["git", "commit", "-qm", "init"], cwd=d, check=True, env=env)

    class _FailedRun:
        returncode = 1
        stdout = ""

    with patch("subprocess.run", return_value=_FailedRun()):
        assert plugin_is_dirty(d) is True

    # Unchanged: no `.git` at all still reads as clean -- that state is
    # already uncacheable via a missing `pluginRev`, not via this function.
    plain = tmp_path / "plain-no-git"
    plain.mkdir()
    assert plugin_is_dirty(plain) is False

    # AC-8, end-to-end half: the unit assertion above proves the pure
    # function flips to True, but a mutation that returns True whenever
    # `.git` merely EXISTS (never checking `git status` at all) would also
    # satisfy it -- and would disable tier A's cache for every checkout,
    # always, which the run-level assertions below catch. Reuses
    # `_two_node_workflow`'s already-wired n1/n2 tier-A pair (`combine-text`
    # -> `split-text`, plugin id `oneflow-text`), so `_run`'s default
    # `plugin_dir_name="oneflow-text"` lines up with the checkout below.
    e2e_plugin_dir = tmp_path / "plugins" / "oneflow-text"
    e2e_plugin_dir.mkdir(parents=True)
    (e2e_plugin_dir / "entry.py").write_text("x = 1\n", encoding="utf-8")
    subprocess.run(["git", "init", "-q"], cwd=e2e_plugin_dir, check=True, env=env)
    subprocess.run(["git", "add", "-A"], cwd=e2e_plugin_dir, check=True, env=env)
    subprocess.run(["git", "commit", "-qm", "init"], cwd=e2e_plugin_dir, check=True, env=env)

    # (a) Pre-mock baseline: on the REAL, unmocked git binary this checkout
    # reads as clean. Establishing this here (rather than assuming it) is
    # what makes the run-level dirtiness below attributable to the mocked
    # `git status` failure and not to some other stray dirty state.
    assert plugin_is_dirty(e2e_plugin_dir) is False

    wf = _two_node_workflow("hello")
    with patch("subprocess.run", return_value=_FailedRun()):
        # (b) End-to-end: `git status` failing must disable tier A's cache
        # for the whole run -- both nodes' invoker calls happen IN FULL on
        # both runs (no warm hit ever), and no cache entry lands on disk.
        r1, c1 = _run(wf, tmp_path)
        r2, c2 = _run(wf, tmp_path)
    assert r1["status"] == "success"
    assert r2["status"] == "success"
    assert len(c1) == 2
    assert len(c2) == 2
    cache_root = tmp_path / "data" / ".tongflow" / "node-cache"
    assert not (cache_root.exists() and list(cache_root.rglob("result.json")))


# --- Task 3: tier B wired into the per-call loop + the NDJSON bridge -------


def _tier_b_workflow(node_id: str = "n1", text: str = "a cat", duration: int = 3) -> dict:
    """One `image-gen-video` (tier B) node, no downstream consumer.

    Mirrors `_two_node_workflow`'s minimalism: AC-3/AC-4/AC-11/AC-14 only need
    a single tier-B slot's own cache behavior in isolation. AC-1/AC-2 need a
    real tier-A consumer instead, so they use `_mixed_workflow`.
    """
    return {
        "executableNodes": [
            {"id": node_id, "feature": "image-gen-video", "pluginId": "oneflow-text",
             "bindings": {
                 "text": {"kind": "static", "value": text},
                 "duration": {"kind": "static", "value": duration},
             },
             "outputs": [], "level": 0, "dependencies": []},
        ],
        "dataNodes": [],
        "executionLevels": [[node_id]],
        "inputs": [],
    }


def _duplicated_tier_b_workflow(text: str = "a cat", duration: int = 3) -> dict:
    """Two `image-gen-video` nodes with IDENTICAL business input, different
    nodeId, no dependency between them -- AC-4's direct guard on `nodeId`
    being part of the tier-B key. Collapsing them onto one entry is exactly
    the bug the 2026-07-30 nodeId-in-the-key decision exists to prevent.
    """
    def node(nid: str) -> dict:
        return {
            "id": nid, "feature": "image-gen-video", "pluginId": "oneflow-text",
            "bindings": {
                "text": {"kind": "static", "value": text},
                "duration": {"kind": "static", "value": duration},
            },
            "outputs": [], "level": 0, "dependencies": [],
        }

    return {
        "executableNodes": [node("n1"), node("n2")],
        "dataNodes": [],
        "executionLevels": [["n1", "n2"]],
        "inputs": [],
    }


def _tier_b_batch_workflow(items: list[str], duration: int = 3) -> dict:
    """One batched `image-gen-video` node -- AC-14's fixture, on the pattern
    of `_batch_workflow` (tier A) but for a tier-B slot with duplicate items.
    """
    return {
        "executableNodes": [
            {"id": "n1", "feature": "image-gen-video", "pluginId": "oneflow-text",
             "batchField": "text",
             "bindings": {
                 "text": {"kind": "static", "value": items},
                 "duration": {"kind": "static", "value": duration},
             },
             "outputs": [], "level": 0, "dependencies": []},
        ],
        "dataNodes": [],
        "executionLevels": [["n1"]],
        "inputs": [],
    }


def _mixed_workflow(node_id: str = "n1", extra_video_bytes: bytes | None = None) -> dict:
    """`image-gen-video` (tier B) -> `concat-videos` (tier A) -- AC-1's named
    pair in the contract. Chosen over an alternative pairing because it is
    the exact example the contract text gives, and because `concat-videos`'s
    `videos` input is a real array-of-Asset field that `image-gen-video`'s
    single `video` output routes into cleanly through the ordinary
    `downstreamDataNodeId` -> data-node -> handle-binding path already
    exercised by `test_hit_reputs_blobs_into_current_run_store`.

    `extra_video_bytes`, when given, adds a SECOND static video straight into
    `concat-videos`' `videos` list via its own data node `d2` with baked
    `staticData` -- independent of n1's business input entirely. This is what
    lets AC-2 change "an input of the tier-A downstream node" without
    touching n1's own cache key at all.
    """
    videos_sources = [{"fromNodeId": "d1", "fromField": "fileKeys"}]
    data_nodes: list[dict] = [{"id": "d1", "nodeType": "videoNode"}]
    if extra_video_bytes is not None:
        b64 = base64.b64encode(extra_video_bytes).decode("ascii")
        data_nodes.append({
            "id": "d2", "nodeType": "videoNode",
            "staticData": {"fileKeys": [f"data:video/mp4;base64,{b64}"]},
        })
        videos_sources.append({"fromNodeId": "d2", "fromField": "fileKeys"})
    return {
        "executableNodes": [
            {"id": node_id, "feature": "image-gen-video", "pluginId": "oneflow-text",
             "bindings": {
                 "text": {"kind": "static", "value": "a cat"},
                 "duration": {"kind": "static", "value": 3},
             },
             "outputs": [{"sourceField": "video", "nodeType": "videoNode",
                          "dataField": "fileKeys", "itemValuePath": "file_key",
                          "downstreamDataNodeId": "d1"}],
             "level": 0, "dependencies": []},
            {"id": "n2", "feature": "concat-videos", "pluginId": "oneflow-text",
             "bindings": {"videos": {"kind": "handle", "sources": videos_sources}},
             "outputs": [], "level": 1, "dependencies": [node_id]},
        ],
        "dataNodes": data_nodes,
        "executionLevels": [[node_id], ["n2"]],
        "inputs": [],
    }


def _run_mixed(workflow, tmp_path, *, tenant="local", data_dir=None,
               workflow_id=None, plugin_rev="a" * 40):
    """Like `_run`, but the invoker returns REAL video bytes so a tier-B hit
    is forced to round-trip actual blob content through the CURRENT run's
    store -- the same D6 rationale `test_hit_reputs_blobs_into_current_run_store`
    applies to tier A. Used only by the `_mixed_workflow` tests (AC-1/AC-2/AC-5),
    where `concat-videos` genuinely needs resolvable asset bytes.
    """
    calls: list[dict] = []

    def video_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append({"slot": slot, "input": business_input})
        raw = f"video-bytes:{slot}:{business_input.get('text', '')}".encode()
        return {"success": True,
                "video": {"bytesBase64": base64.b64encode(raw).decode("ascii")}}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True, exist_ok=True)
    plugin_cfg = {"localSubdir": "oneflow-text"}
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
            invoker=video_invoker,
            auto_install=False,
        )
    return result, calls


def test_mixed_tier_workflow_full_hit(tmp_path):
    # AC-1, the DoD's tier-B half. `image-gen-video` (tier B) -> `concat-videos`
    # (tier A), the exact pair the contract names. A second identical run with
    # the same workflow_id/tenant/data_dir must call the invoker for NEITHER
    # node, and the outputs must be byte-identical (post asset normalization).
    wf = _mixed_workflow()
    r1, c1 = _run_mixed(wf, tmp_path, workflow_id="wf-1")
    r2, c2 = _run_mixed(wf, tmp_path, workflow_id="wf-1")
    assert r1["status"] == "success"
    assert r2["status"] == "success"
    assert len(c1) == 2                      # both nodes ran cold
    assert len(c2) == 0                      # both nodes hit warm
    assert r2["outputs"] == r1["outputs"]


def test_editing_downstream_a_keeps_tier_b_generation(tmp_path):
    # AC-2, the whole economic proposition of tier B: warm the mixed workflow,
    # then change ONLY concat-videos' own input (a second static video source
    # entirely independent of n1's business input). Tier B must keep its
    # generation -- 0 calls -- while tier A reruns exactly once. If tier B's
    # key ever swallowed a sibling node's input (a whole-workflow-scoped key
    # instead of per-call), this would go red.
    wf1 = _mixed_workflow(extra_video_bytes=b"extra-a")
    r1, c1 = _run_mixed(wf1, tmp_path, workflow_id="wf-1")           # cold
    r2, c2 = _run_mixed(wf1, tmp_path, workflow_id="wf-1")           # warm both
    assert r1["status"] == "success"
    assert r2["status"] == "success"
    wf2 = _mixed_workflow(extra_video_bytes=b"extra-b")     # only n2's own input changed
    r3, c3 = _run_mixed(wf2, tmp_path, workflow_id="wf-1")
    gen_calls = [c for c in c3 if c["slot"] == "image-gen-video"]
    concat_calls = [c for c in c3 if c["slot"] == "concat-videos"]
    assert len(gen_calls) == 0
    assert len(concat_calls) == 1
    assert r3["status"] == "success"


def test_two_workflows_do_not_share_tier_b(tmp_path):
    # AC-3. Same tenant, same nodeId, same business input, DIFFERENT
    # workflow_id, SHARED data_dir -- the tier-B slot must be invoked again
    # for the second workflow and produce a genuinely separate cache entry.
    wf = _tier_b_workflow()
    shared = tmp_path / "data"
    r1, c1 = _run(wf, tmp_path, data_dir=shared, workflow_id="wf-A")
    assert r1["status"] == "success"
    root = shared / ".tongflow" / "node-cache"
    entries_after_a = len(list(root.rglob("result.json"))) if root.exists() else 0
    r2, c2 = _run(wf, tmp_path, data_dir=shared, workflow_id="wf-B")
    assert r2["status"] == "success"
    entries_after_b = len(list(root.rglob("result.json")))
    gen_calls_1 = [c for c in c1 if c["slot"] == "image-gen-video"]
    gen_calls_2 = [c for c in c2 if c["slot"] == "image-gen-video"]
    assert len(gen_calls_1) == 1
    assert len(gen_calls_2) == 1              # invoked again, not served from wf-A
    assert entries_after_a == 1               # exactly 1 tier-B entry after workflow A
    assert entries_after_b == 2               # exactly 2 tier-B entries after workflow B


def test_duplicated_node_generates_fresh(tmp_path):
    # AC-4. Two tier-B nodes, IDENTICAL business input, different nodeId, no
    # dependency between them. Collapsing them onto one cache entry -- the
    # exact failure mode nodeId-in-the-key guards against -- would show only
    # 1 invocation instead of 2, and 1 entry instead of 2.
    wf = _duplicated_tier_b_workflow()
    r1, c1 = _run(wf, tmp_path, workflow_id="wf-1")
    gen_calls_1 = [c for c in c1 if c["slot"] == "image-gen-video"]
    assert len(gen_calls_1) == 2               # both nodes invoked, cold
    assert r1["status"] == "success"
    root = (tmp_path / "data") / ".tongflow" / "node-cache"
    assert len(list(root.rglob("result.json"))) == 2   # two separate entries
    r2, c2 = _run(wf, tmp_path, workflow_id="wf-1")
    gen_calls_2 = [c for c in c2 if c["slot"] == "image-gen-video"]
    assert len(gen_calls_2) == 0               # warm: both hit their own entry
    assert r2["status"] == "success"


def test_missing_workflow_id_disables_only_tier_b(tmp_path):
    # AC-5, four cases: field absent, None, empty string, whitespace-only.
    # Each must disable tier B ONLY -- tier A (concat-videos) in the same run
    # must still cache normally (0 calls warm).
    for label, wf_id_kwargs in (
        ("absent", {}),
        ("none", {"workflow_id": None}),
        ("empty", {"workflow_id": ""}),
        ("whitespace", {"workflow_id": "   "}),
    ):
        wf = _mixed_workflow()
        d = tmp_path / f"case-{label}"
        r1, c1 = _run_mixed(wf, d, **wf_id_kwargs)
        r2, c2 = _run_mixed(wf, d, **wf_id_kwargs)
        gen_calls_1 = [c for c in c1 if c["slot"] == "image-gen-video"]
        gen_calls_2 = [c for c in c2 if c["slot"] == "image-gen-video"]
        concat_calls_2 = [c for c in c2 if c["slot"] == "concat-videos"]
        assert r1["status"] == "success", label
        assert r2["status"] == "success", label
        assert len(gen_calls_1) == 1, label
        assert len(gen_calls_2) == 1, label      # tier B never hits
        assert len(concat_calls_2) == 0, label   # tier A still hits warm

        # AC-5's write direction, not just its read direction: a mutation
        # that computes the tier-B cache_key regardless of wf_scope_ok (and
        # gates only the `.get()` read) still passes every assertion above,
        # because `.put()` after a cold call writes unconditionally once
        # cache_key is truthy -- it would leave a tier-B entry on disk that
        # a later, differently-scoped run could accidentally serve. Only
        # tier A's (concat-videos) single entry may exist on disk.
        root = d / "data" / ".tongflow" / "node-cache"
        assert len(list(root.rglob("result.json"))) == 1, label


def test_bridge_forwards_workflow_id(tmp_path):
    # AC-9's backend half, through the real NDJSON bridge (`options` is where
    # a missing field turns into a default -- testing `run_workflow` directly
    # would miss it, same rationale as `test_engine_rejects_empty_tenant`).
    # Plus the no-workflow_id arm: forwarded as `None`, tier B must stay off
    # even against a data_dir that already holds a tier-B entry from the
    # workflow_id arm run just before it.
    wf = _tier_b_workflow()
    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
    calls: list[str] = []

    def fake_invoke(**kw):
        calls.append(kw["node_slot"])
        return {"success": True, "text": "out"}

    def req(workflow_id):
        opts = {"plugins_dir": str(plugins_dir), "data_dir": str(tmp_path / "data"),
                "tenant": "local", "auto_install": False}
        if workflow_id is not None:
            opts["workflow_id"] = workflow_id
        return {"workflow": wf, "inputs": {}, "options": opts}

    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        with patch.object(runner_mod, "invoke_plugin", fake_invoke):
            resp1 = _bridge(req("wf-bridge-1"))
            first = len(calls)
            resp2 = _bridge(req("wf-bridge-1"))              # warm: workflow_id forwarded -> HIT
            after_hit = len(calls)
            resp3 = _bridge(req(None))                       # no-workflow_id arm
            after_no_wfid_1 = len(calls)
            resp4 = _bridge(req(None))
            after_no_wfid_2 = len(calls)
    assert resp1["result"]["status"] == "success"
    assert resp2["result"]["status"] == "success"
    assert resp3["result"]["status"] == "success"
    assert resp4["result"]["status"] == "success"
    assert first == 1
    assert after_hit == first                        # zero more calls: workflow_id reached the engine
    assert after_no_wfid_1 - after_hit == 1           # no workflow_id -> tier B off, invoker called
    assert after_no_wfid_2 - after_no_wfid_1 == 1     # ... every time, not just once


def test_two_tenants_do_not_share_tier_b(tmp_path):
    # AC-11. Same workflow_id, same nodeId, same business input, DIFFERENT
    # tenant, SHARED data_dir -- tier B must not cross tenants either. L2's
    # AC-9 only measured tenant on tier A's key; this is the direct tier-B
    # guard the gap-probe called for.
    wf = _tier_b_workflow()
    shared = tmp_path / "data"
    ra, ca = _run(wf, tmp_path, tenant="user:a", data_dir=shared, workflow_id="wf-1")
    rb, cb = _run(wf, tmp_path, tenant="user:b", data_dir=shared, workflow_id="wf-1")
    assert ra["status"] == "success"
    assert rb["status"] == "success"
    gen_a = [c for c in ca if c["slot"] == "image-gen-video"]
    gen_b = [c for c in cb if c["slot"] == "image-gen-video"]
    assert len(gen_a) == 1
    assert len(gen_b) == 1                            # not served from tenant a's entry
    root = shared / ".tongflow" / "node-cache"
    assert len(list(root.rglob("result.json"))) == 2  # two separate entries


def test_tier_b_batch_duplicates_generate_per_call(tmp_path):
    # AC-14. A batched tier-B node with >= 2 IDENTICAL call_params -- the user
    # asked for N distinct variants of the same prompt. Collapsing them onto
    # one key (the right call for deterministic tier A) would silently turn
    # 3 requested variants into 1 -- the call ordinal must keep each distinct.
    wf = _tier_b_batch_workflow(["same prompt", "same prompt", "same prompt"])
    r1, c1 = _run(wf, tmp_path, workflow_id="wf-1")
    gen_calls_1 = [c for c in c1 if c["slot"] == "image-gen-video"]
    assert len(gen_calls_1) == 3                # one call PER call, not one for all 3
    assert r1["status"] == "success"
    root = (tmp_path / "data") / ".tongflow" / "node-cache"
    assert len(list(root.rglob("result.json"))) == 3
    r2, c2 = _run(wf, tmp_path, workflow_id="wf-1")
    gen_calls_2 = [c for c in c2 if c["slot"] == "image-gen-video"]
    assert len(gen_calls_2) == 0                # warm: all 3 hit their own call-ordinal key
    assert r2["status"] == "success"
