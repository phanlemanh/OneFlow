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
    DESCOPED_GENERATIVE_SLOTS,
    TIER_A_SLOTS,
    TIER_B_SLOTS,
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

    # Self-healing: `put()` for the same content must overwrite the truncated
    # blob with the correct bytes -- the entry gets written back correctly --
    # so a subsequent `get()` HITS instead of missing on this content forever.
    cache.put(key, _asset(store, b"payload-bytes"), store)
    blob = _blob_files(tmp_path)[0]
    assert blob.read_bytes() == b"payload-bytes"
    assert cache.get(key, MemoryStore()) is not None


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


def test_tier_lists_are_disjoint_and_pinned():
    # E6 / AC-6. Three independent guards on the same pair of constants:
    # (1) TIER_B_SLOTS is pinned to the exact 23-slot literal from design §3 --
    #     a silent addition or drop must go red here, not slide in unreviewed.
    # (2) the two allowlists never overlap -- one slot in both would be two
    #     cache semantics for one computation.
    # (3) the five deliberately-uncached generative slots sit in NEITHER list.
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
        "music-brief",
    })

    # Gap-probe P1's guard: derive the knobbed-slot set from the REAL ABI at
    # TEST time (not baked into a runtime lookup -- see node_cache.py's
    # no-suy-lúc-chạy rule) and check it against the pinned constants, so a
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


def _run(workflow, tmp_path, *, tenant="local", data_dir=None,
         plugin_dir_name="oneflow-text", plugin_rev="a" * 40, workflow_id=None):
    calls: list[dict] = []

    def recording_invoker(plugin_id, slot, business_input, plugin_dir, model):
        calls.append({"slot": slot, "input": business_input})
        return {"success": True, "text": f"out:{business_input.get('text')}"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / plugin_dir_name).mkdir(parents=True, exist_ok=True)
    plugin_cfg = {"localSubdir": plugin_dir_name}
    # `plugin_rev=None` models AC-10 case (b): a plugin dir that is not a
    # checkout at all, so the manifest carries no `pluginRev` key -- as
    # opposed to the default, a real recorded revision.
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

    # AC-10 case (b): a plugin dir that is not a checkout at all -- the
    # manifest supplies NO `pluginRev`, so there is nothing to key on
    # regardless of the working tree's git state. A fresh sandbox (not
    # `tmp_path` directly) so case (a)'s dirty checkout above cannot leak
    # into this one's plugins_dir / data_dir.
    sandbox_b = tmp_path / "case-b"
    sandbox_b.mkdir()
    _, c1b = _run(wf, sandbox_b, plugin_rev=None)
    _, c2b = _run(wf, sandbox_b, plugin_rev=None)
    assert len(c2b) == len(c1b) == 2
    root_b = sandbox_b / "data" / ".tongflow" / "node-cache"
    assert not (root_b.exists() and list(root_b.rglob("result.json")))


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


def test_hit_reputs_blobs_into_current_run_store(tmp_path):
    # AC-2, the correctness crux of D6. Asserting "it hit" is not enough: a
    # cache returning a dead mem:// handle from an earlier process also "hits".
    #
    # This does NOT reuse `_two_node_workflow`: its n2 (split-text) consumes a
    # "texts" field, so routing n1's "image" output at it (field-name
    # mismatch) would leave n2's input empty on both runs and prove nothing.
    # A real asset-consuming downstream (image-describe, deliberately NOT tier
    # A so it is never itself served from cache) is what actually forces
    # something to read n1's cached asset back out.
    wf = {
        "executableNodes": [
            {"id": "n1", "feature": "get-first-frame", "pluginId": "oneflow-text",
             "bindings": {},
             "outputs": [{"sourceField": "image", "nodeType": "imageNode",
                          "dataField": "fileKeys", "itemValuePath": "file_key",
                          "downstreamDataNodeId": "d1"}],
             "level": 0, "dependencies": []},
            {"id": "n2", "feature": "image-describe", "pluginId": "oneflow-text",
             "bindings": {"image": {"kind": "handle", "consumerShape": "scalar",
                                     "sources": [{"fromNodeId": "d1",
                                                  "fromField": "fileKeys"}]}},
             "outputs": [], "level": 1, "dependencies": ["n1"]},
        ],
        "dataNodes": [{"id": "d1", "nodeType": "imageNode"}],
        "executionLevels": [["n1"], ["n2"]],
        "inputs": [],
    }

    calls: list[dict] = []
    frame_calls: list[dict] = []

    def inv(plugin_id, slot, business_input, plugin_dir, model):
        if slot == "get-first-frame":
            frame_calls.append(business_input)
            # No `file_key` here: `_normalize_file_ref` treats a present
            # `file_key` as already-resolved and returns it as-is, ignoring
            # `bytesBase64` entirely -- so raw bytes are the only way to force
            # a real `store.put()` and get a live asset ref out of n1.
            return {"success": True, "image": {"bytesBase64":
                    base64.b64encode(b"frame-bytes").decode("ascii")}}
        calls.append(business_input)
        return {"success": True, "text": "described"}

    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True, exist_ok=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}

    def once():
        with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
            return run_workflow(wf, {}, plugins_dir=plugins_dir,
                                data_dir=tmp_path / "data", tenant="local",
                                invoker=inv, auto_install=False)

    r1 = once()
    # AC-2's hit premise, asserted: n1 (get-first-frame) is tier A, so it must
    # be invoked exactly once cold. A `NodeCache.get` stubbed to always miss
    # would still pass every assertion below it if this were skipped.
    assert len(frame_calls) == 1
    r2 = once()
    # ... and zero more times warm -- the actual HIT this test is named for.
    assert len(frame_calls) == 1
    assert r1["status"] == "success" and r2["status"] == "success"
    # n2 (image-describe) is outside TIER_A_SLOTS, so it is invoked fresh on
    # both runs regardless of n1's cache state -- the point is WHAT it got.
    assert len(calls) == 2
    # On the cached run (r2), the downstream node must have received real,
    # resolvable image bytes -- not an empty/dead handle left by n1's HIT.
    for business_input in calls:
        assert base64.b64decode(business_input["image"]["bytesBase64"]) == b"frame-bytes"
    # n1's own output must be the same content on both runs, resolved through
    # each run's own store.
    out1 = r1["outputs"]["n1"]["image"]
    out2 = r2["outputs"]["n1"]["image"]
    assert base64.b64decode(out1["bytesBase64"]) == b"frame-bytes"
    assert base64.b64decode(out2["bytesBase64"]) == b"frame-bytes"


def _batch_workflow(items: list[str]) -> dict:
    """One tier-A batched node, no downstream consumer.

    Mirrors the shape `test_engine_batch.py` uses for a batched node --
    `batchField` set on the executable node plus a list-valued binding for
    that same field -- but keeps it to a single node. Reusing
    `_two_node_workflow` and renaming its n1 to the same slot as n2 would
    make n2 ALSO call split-text once per run, double counting invoker calls
    against the same `slot` filter and making the assertion below meaningless.
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


def test_batch_partial_hit_calls_only_the_misses(tmp_path):
    # AC-11. This is what a per-node cache cannot do, so it is also the test
    # that proves the hook really is per-call. It also carries AC-15's second
    # half: a/b/c are three distinct in-batch keys written on a cold cache
    # (if they collided, run 1 would show fewer than 3 invoker calls) -- keep
    # that half in mind if this test is ever trimmed.
    _, c1 = _run(_batch_workflow(["a", "b", "c"]), tmp_path)
    assert len([x for x in c1 if x["slot"] == "split-text"]) == 3
    r2, c2 = _run(_batch_workflow(["a", "b", "c", "d", "e"]), tmp_path)
    # a/b/c are cached; only d/e run.
    assert len([x for x in c2 if x["slot"] == "split-text"]) == 2
    # AC-11's order/completeness half: the merged output must carry all 5
    # items IN BATCH ORDER, not just the 2 that were actually invoked. A
    # runner that only appends cached results for unbatched nodes would
    # silently drop the 3 hits here -- merging results in the wrong order is
    # data corruption, not slowness.
    assert [x["text"] for x in r2["outputs"]["n1"]] == [
        "out:a", "out:b", "out:c", "out:d", "out:e",
    ]


def _three_node_workflow(text: str) -> dict:
    """`_two_node_workflow`'s n1 (combine-text) -> n2 (split-text), plus an
    independent n3 (combine-text) sharing no data node with n1.

    AC-15's second half needs a node that is NOT downstream of the edited
    one: n3 has its own static binding and no dependency on n1, so it must
    make zero calls when only n1's business field changes -- the exact
    opposite of whole-workflow invalidation, which would rerun n3 too. A
    local builder rather than a change to `_two_node_workflow`: Task 3's
    tests depend on that fixture's exact shape.
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
            {"id": "n3", "feature": "combine-text", "pluginId": "oneflow-text",
             "bindings": {"text": {"kind": "static", "value": "independent"}},
             "outputs": [], "level": 0, "dependencies": []},
        ],
        "dataNodes": [{"id": "d1", "nodeType": "textNode"}],
        "executionLevels": [["n1", "n3"], ["n2"]],
        "inputs": [],
    }


def test_changing_one_node_input_reruns_only_it_and_downstream(tmp_path):
    # AC-15 — the criterion the parent spec is NAMED after, and the one the
    # clean-context critique found missing. An implementation keying on
    # node-level params instead of the per-call materialized input passes
    # AC-1/AC-6/AC-11/AC-13 while serving stale output on every edit. Three
    # allowlisted nodes so a whole-workflow-digest implementation can be told
    # apart from a real per-call key: n3 shares no data node with n1, so if
    # editing n1 also reran n3, that would be whole-workflow invalidation
    # wearing a partial-rerender costume.
    wf1 = _three_node_workflow("first")
    r1, c1 = _run(wf1, tmp_path)
    assert len(c1) == 3
    _, c2 = _run(wf1, tmp_path)
    assert len(c2) == 0
    wf2 = _three_node_workflow("second")                # one business field changed
    r3, c3 = _run(wf2, tmp_path)
    # n1 changed -> n1 reruns; n2 is downstream of it -> n2 reruns too;
    # n3 -- independent of n1 -- must stay a hit: 0 calls.
    combine_text_calls = [c for c in c3 if c["slot"] == "combine-text"]
    split_text_calls = [c for c in c3 if c["slot"] == "split-text"]
    n3_calls = [c for c in combine_text_calls
                if c["input"].get("text") == "independent"]
    n1_calls = [c for c in combine_text_calls
                if c["input"].get("text") != "independent"]
    assert len(n1_calls) == 1
    assert len(split_text_calls) == 1
    assert len(n3_calls) == 0
    assert len(c3) == 2
    assert r3["outputs"]["n1"] != r1["outputs"]["n1"]


def _bridge(request: dict) -> dict:
    """Drive __main__.main() over stdin/stdout the way a host does."""
    import io
    import sys as _sys
    from tongflow.engine import __main__ as bridge
    old_in, old_out = _sys.stdin, _sys.stdout
    _sys.stdin = io.StringIO(json.dumps(request))
    _sys.stdout = io.StringIO()
    try:
        bridge.main()
        lines = [l for l in _sys.stdout.getvalue().splitlines() if l.strip()]
    finally:
        _sys.stdin, _sys.stdout = old_in, old_out
    return json.loads(lines[-1])


def test_engine_rejects_empty_tenant(tmp_path):
    # AC-14, engine half, through the real bridge — options is where a missing
    # field turns into a default, so testing run_workflow directly would miss it.
    wf = _two_node_workflow("hello")
    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
    root = tmp_path / "data" / ".tongflow" / "node-cache"

    for opts in ({"tenant": ""}, {}):                   # empty AND absent
        req = {"workflow": wf, "inputs": {}, "options": {
            "plugins_dir": str(plugins_dir), "data_dir": str(tmp_path / "data"),
            "auto_install": False, **opts}}
        with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
            with patch.object(runner_mod, "invoke_plugin",
                              lambda **kw: {"success": True, "text": "out"}):
                _bridge(req)
                _bridge(req)
    assert not (root.exists() and list(root.rglob("result.json")))


def test_bridge_reuses_cache_across_two_invocations(tmp_path):
    # AC-16, backend-effect half: a stable data_dir must actually produce a hit
    # through the path the host uses, not merely be an equal string in TS.
    wf = _two_node_workflow("hello")
    plugins_dir = tmp_path / "plugins"
    (plugins_dir / "oneflow-text").mkdir(parents=True)
    manifest = {"plugins": {"oneflow-text": {
        "localSubdir": "oneflow-text", "pluginRev": "a" * 40}}}
    calls: list[str] = []

    def fake_invoke(**kw):
        calls.append(kw["node_slot"])
        return {"success": True, "text": "out"}

    req = {"workflow": wf, "inputs": {}, "options": {
        "plugins_dir": str(plugins_dir), "data_dir": str(tmp_path / "data"),
        "tenant": "local", "auto_install": False}}
    with patch.object(runner_mod, "scan_manifest", lambda _pd, _abi: manifest):
        with patch.object(runner_mod, "invoke_plugin", fake_invoke):
            _bridge(req)
            first = len(calls)
            _bridge(req)
    assert first == 2
    assert len(calls) == first                          # second run: zero calls


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
    _run_mixed(wf1, tmp_path, workflow_id="wf-1")           # cold
    _run_mixed(wf1, tmp_path, workflow_id="wf-1")           # warm both
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
    _, c1 = _run(wf, tmp_path, data_dir=shared, workflow_id="wf-A")
    root = shared / ".tongflow" / "node-cache"
    entries_after_a = len(list(root.rglob("result.json"))) if root.exists() else 0
    _, c2 = _run(wf, tmp_path, data_dir=shared, workflow_id="wf-B")
    entries_after_b = len(list(root.rglob("result.json")))
    gen_calls_1 = [c for c in c1 if c["slot"] == "image-gen-video"]
    gen_calls_2 = [c for c in c2 if c["slot"] == "image-gen-video"]
    assert len(gen_calls_1) == 1
    assert len(gen_calls_2) == 1              # invoked again, not served from wf-A
    assert entries_after_b > entries_after_a  # a genuinely separate entry was written


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
    _, ca = _run(wf, tmp_path, tenant="user:a", data_dir=shared, workflow_id="wf-1")
    _, cb = _run(wf, tmp_path, tenant="user:b", data_dir=shared, workflow_id="wf-1")
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
