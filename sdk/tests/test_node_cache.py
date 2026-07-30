from __future__ import annotations

import base64
import json
import os
import subprocess
from pathlib import Path

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
