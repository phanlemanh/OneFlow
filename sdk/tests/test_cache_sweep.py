"""L4 sweep: size-capped LRU eviction + blob GC for `NodeCache` (AC-1..AC-5).

Entries are built exclusively through the real `NodeCache` API (`put`/`get`
with a real `AssetStore`), matching `test_node_cache.py`'s fixture style --
never hand-write `result.json`. Legacy/orphan states that predate `meta.json`
are simulated the same way L2/L3 actually left them: `put()` a real entry,
then `shutil.rmtree` / `unlink` the piece under test, not a fabricated file.
"""

from __future__ import annotations

import hashlib
import os
import shutil
import time

from tongflow.engine.node_cache import NodeCache
from tongflow.engine.store import MemoryStore


def test_sweep_evicts_least_recently_used_first(tmp_path):
    # AC-1/AC-3. Three same-size entries over cap; the oldest-CREATED one gets
    # a `get()` hit after the other two exist, so LRU (not insertion order)
    # must decide the victim: the cold middle entry, not the oldest-created one.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    key1, key2, key3 = "1" * 64, "2" * 64, "3" * 64
    result = {"success": True, "text": "x" * 100}
    cache.put(key1, dict(result), store)
    cache.put(key2, dict(result), store)
    cache.put(key3, dict(result), store)

    now = time.time()
    os.utime(cache._entry(key1), (now - 300, now - 300))
    os.utime(cache._entry(key2), (now - 200, now - 200))
    os.utime(cache._entry(key3), (now - 100, now - 100))

    # key1 (oldest-created) is hit AFTER key2/key3 -> becomes most recently used.
    assert cache.get(key1, MemoryStore()) is not None

    entry_size = sum(p.stat().st_size for p in cache._entry(key1).parent.iterdir())
    cap = entry_size * 2 + 10  # room for exactly two entries

    cache.sweep(cap)

    assert cache._entry(key1).parent.exists()      # recently-hit-old survives
    assert cache._entry(key3).parent.exists()       # newest survives
    assert not cache._entry(key2).parent.exists()   # cold middle evicted


def test_sweep_brings_usage_under_cap(tmp_path):
    # AC-1. Total on-disk usage (entries + blobs) must be <= cap after sweep.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    for i in range(5):
        ref = store.put(("x" * 1000).encode("ascii"), mime="video/mp4",
                         filename=f"{i}.mp4")
        cache.put(str(i) * 64, {"success": True, "video": ref}, store)

    root = tmp_path / ".tongflow" / "node-cache"
    cap = 2000
    cache.sweep(cap)
    total = sum(p.stat().st_size for p in root.rglob("*") if p.is_file())
    assert total <= cap


def test_sweep_under_cap_deletes_nothing(tmp_path):
    # AC-2's no-op clause: under cap, entries + REFERENCED blobs survive
    # byte-identical, but orphan-blob GC is unconditional -- the orphan goes.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    ref = store.put(b"real-bytes", mime="video/mp4", filename="a.mp4")
    cache.put("a" * 64, {"success": True, "video": ref}, store)

    # Orphan blob, produced the way L2/L3 actually leaves one: a real put(),
    # then the entry directory alone is removed (rmtree), leaving the blob
    # with no referrer.
    orphan_ref = store.put(b"orphan-bytes", mime="video/mp4", filename="b.mp4")
    cache.put("b" * 64, {"success": True, "video": orphan_ref}, store)
    shutil.rmtree(cache._entry("b" * 64).parent)
    orphan_sha = hashlib.sha256(b"orphan-bytes").hexdigest()
    orphan_path = cache._blob(orphan_sha)
    assert orphan_path.exists()

    root = tmp_path / ".tongflow" / "node-cache"
    before = sorted(
        (str(p.relative_to(root)), p.stat().st_size)
        for p in root.rglob("*") if p.is_file() and p != orphan_path
    )

    cache.sweep(10**9)  # cap far above usage -> nothing evicted for size

    after = sorted(
        (str(p.relative_to(root)), p.stat().st_size)
        for p in root.rglob("*") if p.is_file()
    )
    assert after == before
    assert not orphan_path.exists()


def test_shared_blob_survives_eviction_of_one_referrer(tmp_path):
    # AC-1 + D6. Two entries share one blob (byte-identical asset). Evicting
    # one referrer must not delete the blob while the other still points at
    # it, and the survivor must still resolve real bytes afterward.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    same_bytes = b"shared-asset-bytes"
    ref1 = store.put(same_bytes, mime="video/mp4", filename="a.mp4")
    cache.put("a" * 64, {"success": True, "video": ref1}, store)
    ref2 = store.put(same_bytes, mime="video/mp4", filename="b.mp4")
    cache.put("b" * 64, {"success": True, "video": ref2}, store)

    # Touch "b" so it's MRU, leaving "a" as the sole eviction target.
    assert cache.get("b" * 64, MemoryStore()) is not None

    entry_b_size = sum(p.stat().st_size for p in cache._entry("b" * 64).parent.iterdir())
    blob_sha = hashlib.sha256(same_bytes).hexdigest()
    blob_size = cache._blob(blob_sha).stat().st_size
    cap = entry_b_size + blob_size + 10  # room for "b" + the shared blob only

    cache.sweep(cap)

    assert not cache._entry("a" * 64).parent.exists()
    assert cache._entry("b" * 64).parent.exists()
    assert cache._blob(blob_sha).exists()

    fresh = MemoryStore()
    out = cache.get("b" * 64, fresh)
    assert out is not None
    assert fresh.get(out["video"]["file_key"]) == same_bytes


def test_orphan_blobs_deleted_including_pre_l4(tmp_path):
    # AC-2/AC-4. Orphans from BEFORE sweep() existed (pre-L4 leftovers) must
    # go on an under-cap sweep; orphans CREATED by the sweep's own evictions
    # must also be gone by the end of that same sweep call.
    cache = NodeCache(tmp_path)
    store = MemoryStore()

    pre_l4_bytes = b"pre-l4-orphan"
    pre_l4_ref = store.put(pre_l4_bytes, mime="video/mp4", filename="old.mp4")
    cache.put("a" * 64, {"success": True, "video": pre_l4_ref}, store)
    shutil.rmtree(cache._entry("a" * 64).parent)  # simulate an L2/L3 leftover
    pre_l4_sha = hashlib.sha256(pre_l4_bytes).hexdigest()
    assert cache._blob(pre_l4_sha).exists()

    live_ref = store.put(b"live-bytes", mime="video/mp4", filename="live.mp4")
    cache.put("b" * 64, {"success": True, "video": live_ref}, store)

    # Under-cap sweep: no eviction pressure, but the pre-existing orphan must
    # still be collected -- orphan GC is unconditional.
    cache.sweep(10**9)
    assert not cache._blob(pre_l4_sha).exists()
    assert cache._entry("b" * 64).parent.exists()

    # Over-cap sweep: evict "b" itself via cap pressure, which orphans its
    # own blob in the process -- that blob must be gone by sweep's return.
    b_blob_sha = hashlib.sha256(b"live-bytes").hexdigest()
    assert cache._blob(b_blob_sha).exists()
    cache.sweep(1)  # cap far below anything -> evict everything
    assert not cache._entry("b" * 64).parent.exists()
    assert not cache._blob(b_blob_sha).exists()


def test_legacy_entry_without_meta_sweepable_and_purge_skips(tmp_path):
    # AC-5. A legacy (pre-meta.json) entry must still be sweepable by mtime
    # and blob refs derived from `result.json` alone -- no crash, no special
    # casing required. (Purge half is Task 3's; asserted there once `purge()`
    # exists, per the brief.)
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    key = "a" * 64
    cache.put(key, {"success": True, "text": "legacy"}, store)
    meta_path = cache._entry(key).parent / "meta.json"
    assert meta_path.exists()
    meta_path.unlink()  # simulate an L2/L3-era entry, pre-meta.json

    cache.sweep(1)  # cap far below anything -> must evict it cleanly
    assert not cache._entry(key).parent.exists()
