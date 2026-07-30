from __future__ import annotations

import base64
import json
import os
import subprocess
from pathlib import Path
from unittest.mock import patch

from tongflow.engine import run_workflow
from tongflow.engine import runner as runner_mod
from tongflow.engine.node_cache import (
    TIER_A_SLOTS,
    NodeCache,
    abi_digest_of,
    plugin_is_dirty,
)
from tongflow.engine.store import MemoryStore


def _asset(store: MemoryStore, raw: bytes) -> dict:
    """A result payload carrying one asset already put into `store`."""
    ref = store.put(raw, mime="video/mp4", filename="a.mp4")
    return {"success": True, "video": ref}


def _blob_files(data_dir: Path) -> list[Path]:
    root = data_dir / ".tongflow" / "node-cache" / "blobs"
    return sorted(p for p in root.rglob("*") if p.is_file())


def test_unusable_entry_is_treated_as_miss(tmp_path):
    # AC-4, three cases asserted separately. Each is a real state: (a) is
    # Bazel's classic GC'd-blob-with-live-entry, (c) is a run killed mid-write.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    key = "a" * 64
    cache.put(key, _asset(store, b"payload-bytes"), store)

    # (a) blob deleted
    for b in _blob_files(tmp_path):
        b.unlink()
    assert cache.get(key, MemoryStore()) is None

    # (b) result.json unparseable
    cache.put(key, _asset(store, b"payload-bytes"), store)
    entry = next((tmp_path / ".tongflow" / "node-cache").rglob("result.json"))
    entry.write_text("{ this is not json", encoding="utf-8")
    assert cache.get(key, MemoryStore()) is None

    # (c) blob present but truncated -> size mismatch
    cache.put(key, _asset(store, b"payload-bytes"), store)
    blob = _blob_files(tmp_path)[0]
    blob.write_bytes(b"short")
    assert cache.get(key, MemoryStore()) is None


def test_unwritable_cache_dir_does_not_break_the_run(tmp_path):
    # AC-5. ccache's read-only-cache-dir case. The spec says the cache is not
    # the source of truth; a cache that cannot write must not fail the caller.
    root = tmp_path / "ro"
    root.mkdir()
    os.chmod(root, 0o500)
    try:
        cache = NodeCache(root)
        store = MemoryStore()
        cache.put("b" * 64, _asset(store, b"x"), store)   # must not raise
        assert cache.get("b" * 64, MemoryStore()) is None
    finally:
        os.chmod(root, 0o700)


def test_shared_asset_stores_one_blob(tmp_path):
    # AC-12. Two DIFFERENT entries referencing byte-identical assets share one
    # blob file. If blobs lived per-entry instead of at the node-cache root,
    # D6's "200 videos share every source blob" claim would be false.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    same = b"identical-bytes"
    cache.put("c" * 64, _asset(store, same), store)
    cache.put("d" * 64, _asset(store, same), store)
    assert len(_blob_files(tmp_path)) == 1


def test_allowlist_holds_exactly_the_eleven_mechanical_slots():
    # Guard on the constant itself: the deferred three must NOT be in it until
    # 1.1-L1b lands, and a new slot must not be added silently.
    assert TIER_A_SLOTS == frozenset({
        "concat-videos", "extract-audio", "remove-video-audio",
        "merge-video-audio", "get-first-frame", "get-last-frame",
        "split-video", "drop-video", "split-text", "combine-text",
        "arrange-group",
    })
    for deferred in ("transcribe", "transcribe-timestamp", "parse-document"):
        assert deferred not in TIER_A_SLOTS


def test_abi_digest_tracks_file_contents(tmp_path):
    p = tmp_path / "abi.json"
    p.write_text('{"version": 1}', encoding="utf-8")
    first = abi_digest_of(p)
    p.write_text('{"version": 2}', encoding="utf-8")
    assert abi_digest_of(p) != first
    assert len(first) == 64


def test_plugin_is_dirty_reads_the_real_working_tree(tmp_path):
    # AC-10's detector. A real checkout, because git status is what we assert.
    d = tmp_path / "plug"
    d.mkdir()
    (d / "entry.py").write_text("x = 1\n", encoding="utf-8")
    env = {**os.environ, "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@e",
           "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@e"}
    subprocess.run(["git", "init", "-q"], cwd=d, check=True, env=env)
    subprocess.run(["git", "add", "-A"], cwd=d, check=True, env=env)
    subprocess.run(["git", "commit", "-qm", "init"], cwd=d, check=True, env=env)
    assert plugin_is_dirty(d) is False
    (d / "entry.py").write_text("x = 2\n", encoding="utf-8")
    assert plugin_is_dirty(d) is True


def test_plugin_without_git_is_not_reported_dirty(tmp_path):
    # Not a checkout at all: `plugin_rev` is already None there, which is what
    # makes it uncacheable. `plugin_is_dirty` must not claim dirty as well --
    # two independent reasons reported as one hides which one fired.
    d = tmp_path / "plain"
    d.mkdir()
    assert plugin_is_dirty(d) is False


def test_hit_returns_bytes_resolvable_in_a_fresh_store(tmp_path):
    # The correctness crux of D6: a hit must re-put blobs into the CURRENT
    # store. A reviewer proved every existing test stays green when get()
    # returns a dead pointer — this test is the one that pins the happy path.
    cache = NodeCache(tmp_path)
    first = MemoryStore()
    cache.put("e" * 64, _asset(first, b"real-bytes"), first)
    fresh = MemoryStore()
    out = cache.get("e" * 64, fresh)
    assert out is not None
    fk = out["video"]["file_key"]
    assert fresh.get(fk) == b"real-bytes"
    # ext must survive the round trip: video/mp4 -> .mp4, not .bin (I2).
    # MemoryStore ignores ext, so assert via a DiskStore target too.
    from tongflow.engine.store import DiskStore
    disk = DiskStore(tmp_path / "out")
    out2 = cache.get("e" * 64, disk)
    assert out2["video"]["file_key"].endswith(".mp4")


def test_uncapturable_asset_refuses_to_cache_the_entry(tmp_path):
    # C1 fail-closed: DiskStore.get() returns None by design and the file_key
    # is relative, so bytes cannot be captured -> put() must write NOTHING.
    from tongflow.engine.store import DiskStore
    cache = NodeCache(tmp_path)
    disk = DiskStore(tmp_path / "out", file_key_base=tmp_path)
    ref = disk.put(b"content", mime="video/mp4", filename="a.mp4")
    assert not Path(ref["file_key"]).is_absolute()
    cache.put("f" * 64, {"success": True, "video": ref}, disk)
    root = tmp_path / ".tongflow" / "node-cache"
    assert not (root.exists() and list(root.rglob("result.json")))


def test_absolute_disk_file_key_is_captured(tmp_path):
    # DiskStore WITHOUT file_key_base yields absolute paths; those we can read.
    from tongflow.engine.store import DiskStore
    cache = NodeCache(tmp_path)
    disk = DiskStore(tmp_path / "out")
    ref = disk.put(b"abs-bytes", mime="video/mp4", filename="a.mp4")
    assert Path(ref["file_key"]).is_absolute()
    cache.put("a1" + "0" * 62, {"success": True, "video": ref}, disk)
    fresh = MemoryStore()
    out = cache.get("a1" + "0" * 62, fresh)
    assert out is not None
    assert fresh.get(out["video"]["file_key"]) == b"abs-bytes"


def _two_node_workflow(text: str) -> dict:
    """combine-text -> split-text. Both are tier A, neither needs a real plugin.

    NOTE: the top-level key is `executableNodes` (matching what `run_workflow`
    actually reads, see runner.py `wf.get("executableNodes", ...)`), and n2's
    binding reads its upstream via the ordinary `handle` shape (a `sources`
    list of `{fromNodeId, fromField}`) -- there is no `"dataNode"` binding
    kind in `resolve_node_params`; that kind is only how the DOWNSTREAM data
    node is reached from `n1`'s `outputs` route.
    """
    return {
        "executableNodes": [
            {"id": "n1", "feature": "combine-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "static", "value": text}},
             "outputs": [{"sourceField": "text", "nodeType": "textNode",
                          "dataField": "texts", "downstreamDataNodeId": "d1"}],
             "level": 0, "dependencies": []},
            {"id": "n2", "feature": "split-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "handle", "consumerShape": "scalar",
                                    "sources": [{"fromNodeId": "d1",
                                                 "fromField": "texts"}]}},
             "outputs": [], "level": 1, "dependencies": ["n1"]},
        ],
        "dataNodes": [{"id": "d1", "nodeType": "textNode"}],
        "executionLevels": [["n1"], ["n2"]],
        "inputs": [],
    }


def _run(workflow, tmp_path, *, tenant="local", data_dir=None, plugin_dir_name="oneflow-text"):
    calls: list[dict] = []

    def recording_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append({"slot": slot, "input": business_input})
        return {"success": True, "text": f"out:{business_input.get('text')}"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / plugin_dir_name).mkdir(parents=True, exist_ok=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": plugin_dir_name,
        "pluginRev": "a" * 40,
    }}}
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        result = run_workflow(
            workflow, {},
            plugins_dir=plugins_dir,
            data_dir=data_dir or (tmp_path / "data"),
            tenant=tenant,
            invoker=recording_invoker,
            auto_install=False,
        )
    return result, calls


def test_second_run_hits_cache_with_zero_plugin_calls(tmp_path):
    # AC-1, the DoD. Counting invoker calls is the only measure that cannot be
    # "close enough": a hit that still calls the plugin saves nothing.
    wf = _two_node_workflow("hello")
    r1, c1 = _run(wf, tmp_path)
    r2, c2 = _run(wf, tmp_path)
    assert len(c1) == 2
    assert len(c2) == 0
    assert r2["outputs"] == r1["outputs"]


def test_failed_call_never_writes_an_entry(tmp_path):
    # AC-3. A transient failure cached as a permanent one is the worst bug in
    # this family, so the write point must sit AFTER the success check.
    def failing_invoker(plugin_id, slot, business_input, plugin_dir, model):
        return {"success": False, "error": "boom"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
    root = tmp_path / "data" / ".tongflow" / "node-cache"
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        try:
            run_workflow(_two_node_workflow("x"), {}, plugins_dir=plugins_dir,
                         data_dir=tmp_path / "data", tenant="local",
                         invoker=failing_invoker, auto_install=False)
        except Exception:
            pass
    entries = list(root.rglob("result.json")) if root.exists() else []
    assert entries == []


def test_deleting_cache_dir_keeps_results_identical(tmp_path):
    # AC-6. Spec section 8 verbatim: deleting the cache changes nothing but speed.
    import shutil
    wf = _two_node_workflow("hello")
    r1, c1 = _run(wf, tmp_path)
    _run(wf, tmp_path)                                  # warm
    shutil.rmtree(tmp_path / "data" / ".tongflow")
    r3, c3 = _run(wf, tmp_path)
    assert r3["outputs"] == r1["outputs"]
    assert len(c3) == len(c1)


def test_slot_outside_allowlist_is_never_cached(tmp_path):
    # AC-7, BOTH directions. A new slot defaults to uncached.
    # n1 (gen-text) is deliberately made the disallowed slot while n2
    # (split-text) stays Tier A, so the two directions are checked
    # independently: n1's OWN call count must stay flat across runs (never
    # read), while the on-disk entry count must stay at exactly one -- n2's
    # (never written for n1).
    wf = _two_node_workflow("hello")
    wf["executableNodes"][0]["feature"] = "gen-text"    # not in TIER_A_SLOTS
    _, c1 = _run(wf, tmp_path)
    _, c2 = _run(wf, tmp_path)
    gen_text_calls_1 = [c for c in c1 if c["slot"] == "gen-text"]
    gen_text_calls_2 = [c for c in c2 if c["slot"] == "gen-text"]
    assert len(gen_text_calls_2) == len(gen_text_calls_1) == 1   # not read
    root = tmp_path / "data" / ".tongflow" / "node-cache"
    keys = list(root.rglob("result.json")) if root.exists() else []
    assert len(keys) == 1                               # only n2 (split-text) written


def test_missing_tenant_is_not_cacheable(tmp_path):
    # AC-8, both cases, both directions.
    wf = _two_node_workflow("hello")
    for bad in ("", None):
        d = tmp_path / f"t{bad!r}"
        _, c1 = _run(wf, d, tenant=bad)
        _, c2 = _run(wf, d, tenant=bad)
        assert len(c2) == len(c1) == 2
        root = d / "data" / ".tongflow" / "node-cache"
        assert not (root.exists() and list(root.rglob("result.json")))


def test_two_tenants_sharing_data_dir_do_not_cross_serve(tmp_path):
    # AC-9. Sharing ONE data_dir is mandatory: split them and the path already
    # isolates, so the test would pass without proving tenant is in the key.
    wf = _two_node_workflow("hello")
    shared = tmp_path / "data"
    _, ca = _run(wf, tmp_path, tenant="user:a", data_dir=shared)
    _, cb = _run(wf, tmp_path, tenant="user:b", data_dir=shared)
    assert len(ca) == 2 and len(cb) == 2
    entries = list((shared / ".tongflow" / "node-cache").rglob("result.json"))
    assert len(entries) == 4                            # 2 nodes x 2 tenants


def test_dirty_plugin_is_not_cacheable_end_to_end(tmp_path):
    # AC-10 case (a): a REAL checkout with uncommitted edits. This is the one
    # test that needs `git init` — the fixture patches scan_manifest, so
    # read_plugin_rev never runs, but plugin_is_dirty reads the real tree.
    wf = _two_node_workflow("hello")
    plugins_dir = tmp_path / "plugins"
    d = plugins_dir / "oneflow-text"
    d.mkdir(parents=True)
    (d / "entry.py").write_text("x = 1\n", encoding="utf-8")
    env = {**os.environ, "GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@e",
           "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@e"}
    subprocess.run(["git", "init", "-q"], cwd=d, check=True, env=env)
    subprocess.run(["git", "add", "-A"], cwd=d, check=True, env=env)
    subprocess.run(["git", "commit", "-qm", "i"], cwd=d, check=True, env=env)
    (d / "entry.py").write_text("x = 2\n", encoding="utf-8")   # now dirty
    _, c1 = _run(wf, tmp_path)
    _, c2 = _run(wf, tmp_path)
    assert len(c2) == len(c1) == 2
    root = tmp_path / "data" / ".tongflow" / "node-cache"
    assert not (root.exists() and list(root.rglob("result.json")))


def test_abi_change_invalidates_the_key(tmp_path):
    # AC-13. Change the REAL ABI file, not a monkeypatched digest — patching a
    # digest proves the digest is used, not that the ABI is its source.
    import shutil
    from tongflow.engine.abi_schema import resolve_abi_path
    real = resolve_abi_path(None)
    copy = tmp_path / "abi.json"
    shutil.copyfile(real, copy)
    wf = _two_node_workflow("hello")

    def run_with_abi(abi):
        calls: list[dict] = []

        def inv(plugin_id, slot, business_input, plugin_dir, model):
            calls.append({"slot": slot})
            return {"success": True, "text": "out"}

        plugins_dir = tmp_path / "plugins"
        (plugins_dir / "oneflow-text").mkdir(parents=True, exist_ok=True)
        manifest = {"plugins": {"oneflow-text": {
            "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
        with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
            run_workflow(wf, {}, plugins_dir=plugins_dir,
                         data_dir=tmp_path / "data", tenant="local",
                         abi_path=abi, invoker=inv, auto_install=False)
        return calls

    assert len(run_with_abi(copy)) == 2
    assert len(run_with_abi(copy)) == 0                 # warm
    copy.write_text(copy.read_text(encoding="utf-8") + "\n", encoding="utf-8")
    assert len(run_with_abi(copy)) == 2                 # ABI changed -> miss
