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
from pathlib import Path
from unittest.mock import patch

import pytest

from tongflow.engine import node_cache as node_cache_mod
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

    # Force explicit, distinct mtimes (same technique as the LRU test) so
    # eviction order is deterministic regardless of filesystem mtime
    # granularity -- relying on insertion order plus a same-second get()
    # touch is flaky on 1-second-granularity filesystems.
    now = time.time()
    os.utime(cache._entry("a" * 64), (now - 300, now - 300))
    os.utime(cache._entry("b" * 64), (now - 200, now - 200))

    # Touch "b" so it's unambiguously MRU, leaving "a" as the sole eviction
    # target.
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
    # go, WITHOUT counting against the cap (IMPORTANT-1): a big orphan must
    # not out-compete live entries for eviction, since its bytes are freed
    # by GC regardless of cap pressure. Orphans CREATED by the sweep's own
    # evictions must also be gone by the end of that same sweep call.
    cache = NodeCache(tmp_path)
    store = MemoryStore()

    # A "big" pre-L4 orphan: put a real entry, then rmtree just the entry
    # dir, leaving a real, sizeable blob with zero referrers -- the exact
    # shape L2/L3 left behind before sweep() existed.
    pre_l4_bytes = b"o" * 5000
    pre_l4_ref = store.put(pre_l4_bytes, mime="video/mp4", filename="old.mp4")
    cache.put("a" * 64, {"success": True, "video": pre_l4_ref}, store)
    shutil.rmtree(cache._entry("a" * 64).parent)  # simulate an L2/L3 leftover
    pre_l4_sha = hashlib.sha256(pre_l4_bytes).hexdigest()
    assert cache._blob(pre_l4_sha).exists()

    # A small, live entry referencing its own small blob.
    live_ref = store.put(b"live-bytes", mime="video/mp4", filename="live.mp4")
    cache.put("b" * 64, {"success": True, "video": live_ref}, store)

    root = tmp_path / ".tongflow" / "node-cache"
    live_usage = sum(
        p.stat().st_size for p in root.rglob("*")
        if p.is_file() and pre_l4_sha not in str(p)
    )

    # Cap sized to fit ONLY the live entry + its own blob -- far below what
    # would be needed if the 5000-byte orphan were also counted against the
    # cap. If usage accounting counted orphan bytes, this would over-evict
    # the live entry to make room for garbage already scheduled for
    # deletion (the IMPORTANT-1 regression); it must not.
    cap = live_usage + 10

    cache.sweep(cap)

    assert cache._entry("b" * 64).parent.exists()   # live entry survives
    b_blob_sha = hashlib.sha256(b"live-bytes").hexdigest()
    assert cache._blob(b_blob_sha).exists()          # its own blob survives
    assert not cache._blob(pre_l4_sha).exists()      # the orphan is GC'd

    # Over-cap sweep: evict "b" itself via cap pressure, which orphans its
    # own blob in the process -- that blob must be gone by sweep's return.
    cache.sweep(1)  # cap far below anything -> evict everything
    assert not cache._entry("b" * 64).parent.exists()
    assert not cache._blob(b_blob_sha).exists()


def test_legacy_entry_without_meta_sweepable_and_purge_skips(tmp_path):
    # AC-5. A legacy (pre-meta.json) entry must still be sweepable by mtime
    # and blob refs derived from `result.json` alone -- no crash, no special
    # casing required.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    key = "a" * 64
    cache.put(key, {"success": True, "text": "legacy"}, store)
    meta_path = cache._entry(key).parent / "meta.json"
    assert meta_path.exists()
    meta_path.unlink()  # simulate an L2/L3-era entry, pre-meta.json

    cache.sweep(1)  # cap far below anything -> must evict it cleanly
    assert not cache._entry(key).parent.exists()

    # Purge half (Task 3, E6): a legacy entry has no meta.json to read, so
    # purge cannot know its tenant/workflow_scope -- it must skip the entry
    # rather than guess, even when the (tenant, workflow_id) purge is called
    # with would have matched the entry's original scope had meta.json
    # survived. No crash, no deletion.
    key2 = "b" * 64
    cache.put(key2, {"success": True, "text": "legacy2"}, store,
              tenant="user:1", workflow_scope="wf:1:node:n1")
    meta_path2 = cache._entry(key2).parent / "meta.json"
    assert meta_path2.exists()
    meta_path2.unlink()  # simulate an L2/L3-era entry, pre-meta.json

    cache.purge("user:1", "1")
    assert cache._entry(key2).parent.exists()  # purge skips it: tenant unknown


def test_purge_removes_only_matching_workflow_entries(tmp_path):
    # AC-7. One data_dir, four entries: tier-B workflow "1" (target), tier-B
    # workflow "11" (decoy -- also embeds "wf:1:" INSIDE its node id, not at
    # the start of its scope, so a substring/`in` match instead of an
    # anchored `startswith` would wrongly delete it too), tier-A with
    # scope=None (same tenant), and tier-B workflow "1" under a DIFFERENT
    # tenant. purge(tenant, "1") must remove only the first; the other three
    # must still HIT via get() afterward (positive check, not just "files
    # gone" -- per AC-7).
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    tenant = "user:1"
    other_tenant = "user:2"

    key_target = "1" * 64
    key_decoy_wf11 = "2" * 64
    key_tier_a = "3" * 64
    key_other_tenant = "4" * 64

    cache.put(key_target, {"success": True, "text": "target"}, store,
              tenant=tenant, workflow_scope="wf:1:node:n1")
    cache.put(key_decoy_wf11, {"success": True, "text": "decoy"}, store,
              tenant=tenant, workflow_scope="wf:11:node:wf:1:trap")
    cache.put(key_tier_a, {"success": True, "text": "tier-a"}, store,
              tenant=tenant, workflow_scope=None)
    cache.put(key_other_tenant, {"success": True, "text": "other-tenant"}, store,
              tenant=other_tenant, workflow_scope="wf:1:node:n1")

    cache.purge(tenant, "1")

    assert cache.get(key_target, MemoryStore()) is None
    assert cache.get(key_decoy_wf11, MemoryStore()) is not None
    assert cache.get(key_tier_a, MemoryStore()) is not None
    assert cache.get(key_other_tenant, MemoryStore()) is not None


def test_purge_twice_safe_and_collects_orphans(tmp_path):
    # AC-8. purge() removes its target entry and, in the SAME call, GCs the
    # blob that entry alone referenced. A second call with identical
    # arguments must not raise and must not delete anything further -- the
    # on-disk tree is byte-identical before/after the second call.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    tenant = "user:1"
    key = "a" * 64
    ref = store.put(b"purge-me-bytes", mime="video/mp4", filename="a.mp4")
    cache.put(key, {"success": True, "video": ref}, store,
              tenant=tenant, workflow_scope="wf:1:node:n1")
    blob_sha = hashlib.sha256(b"purge-me-bytes").hexdigest()
    blob_path = cache._blob(blob_sha)
    assert blob_path.exists()

    cache.purge(tenant, "1")
    assert not cache._entry(key).parent.exists()
    assert not blob_path.exists()  # orphaned by the purge, collected same call

    root = tmp_path / ".tongflow" / "node-cache"
    before = sorted(
        (str(p.relative_to(root)), p.stat().st_size)
        for p in root.rglob("*") if p.is_file()
    )

    cache.purge(tenant, "1")  # second call, same args: no raise, no-op

    after = sorted(
        (str(p.relative_to(root)), p.stat().st_size)
        for p in root.rglob("*") if p.is_file()
    )
    assert after == before


def test_sweep_failure_never_breaks_the_run(tmp_path):
    # AC-6. root unreadable/unwritable (permission error, or the dir vanishing
    # mid-run) -> sweep()/purge() must not raise; the run's outcome is the
    # same as a run with no cache at all.
    if os.name == "nt":
        pytest.skip("chmod-based permission denial is not portable to Windows")
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    cache.put("a" * 64, {"success": True, "text": "x"}, store,
              tenant="user:1", workflow_scope="wf:1:node:n1")
    root = tmp_path / ".tongflow" / "node-cache"
    original_mode = root.stat().st_mode
    os.chmod(root, 0)
    try:
        cache.sweep(1)  # must not raise
        cache.purge("user:1", "1")  # must not raise
    finally:
        os.chmod(root, original_mode)


def test_swallowed_cache_errors_emit_one_log_line(tmp_path):
    # AC-6. The closed list of four swallow branches -- (1) get() hits an
    # unusable entry -> miss, (2) put() is refused, (3) sweep() fails,
    # (4) purge() fails -- each emit EXACTLY one log(...) line per
    # activation. The one explicit exemption: os.utime's recency touch on a
    # HIT stays silent even when it fails, so a read-only root doesn't spam
    # one log line per hit.
    if os.name == "nt":
        pytest.skip("chmod-based permission denial is not portable to Windows")
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    root = tmp_path / ".tongflow" / "node-cache"

    # (1) get() on a corrupt/unparseable entry -> exactly one line, still a miss.
    key_corrupt = "a" * 64
    cache.put(key_corrupt, {"success": True, "text": "x"}, store)
    cache._entry(key_corrupt).write_bytes(b"{ not valid json ")
    get_logs: list[str] = []
    assert cache.get(key_corrupt, MemoryStore(), log=get_logs.append) is None
    assert len(get_logs) == 1

    # (2) put() refused (read-only root) -> exactly one line.
    original_mode = root.stat().st_mode
    os.chmod(root, 0o555)
    put_logs: list[str] = []
    try:
        cache.put("b" * 64, {"success": True, "text": "y"}, store, log=put_logs.append)
    finally:
        os.chmod(root, original_mode)
    assert len(put_logs) == 1

    # (3) sweep() fails ("broken root") -> exactly one line. `Path.glob`
    # silently returns an empty iterator (not an exception) on a chmod-0
    # directory on this platform, so a chmod alone can't force this branch
    # deterministically and portably -- patch `Path.glob` itself to raise,
    # simulating a root that is genuinely broken (e.g. vanished mid-walk).
    sweep_logs: list[str] = []
    with patch.object(Path, "glob", side_effect=OSError("simulated broken root")):
        cache.sweep(10**9, log=sweep_logs.append)
    assert len(sweep_logs) == 1

    # (4) purge() fails ("broken root") -> exactly one line. Same mechanism.
    purge_logs: list[str] = []
    with patch.object(Path, "glob", side_effect=OSError("simulated broken root")):
        cache.purge("user:1", "1", log=purge_logs.append)
    assert len(purge_logs) == 1

    # Exemption: a HIT whose recency os.utime touch fails stays silent.
    key_hit = "c" * 64
    cache.put(key_hit, {"success": True, "text": "z"}, store)
    utime_logs: list[str] = []
    with patch("os.utime", side_effect=OSError("blocked")):
        result = cache.get(key_hit, MemoryStore(), log=utime_logs.append)
    assert result is not None
    assert len(utime_logs) == 0


def test_meta_write_failure_refuses_the_entry(tmp_path):
    # SPEC FAILURE fix. `put()` writes meta.json BEFORE result.json so a
    # meta-write failure aborts before result.json is ever written --
    # leaving NO entry at all, not a HIT-able result.json with no sidecar
    # (which a `purge()` could never see -- d-...-S2). Not a config-declared
    # node-id; plain suite coverage.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    real_atomic_write = node_cache_mod._atomic_write

    def failing_atomic_write(path, data):
        if path.name == "meta.json":
            raise OSError("simulated meta write failure")
        return real_atomic_write(path, data)

    with patch.object(node_cache_mod, "_atomic_write", side_effect=failing_atomic_write):
        cache.put("a" * 64, {"success": True, "text": "x"}, store)

    assert cache.get("a" * 64, MemoryStore()) is None
    root = tmp_path / ".tongflow" / "node-cache"
    assert not (root.exists() and list(root.rglob("result.json")))


def test_corrupt_entry_bytes_still_count_toward_cap(tmp_path):
    # IMPORTANT fix (fix round 2). A corrupt/unparseable result.json still
    # occupies real on-disk bytes. The unreadable branch previously recorded
    # size=0, so a big corrupt entry silently UNDER-counted usage and, as
    # the sole entry, was never even considered over cap -- it would sit on
    # disk forever. Not a config-declared node-id; plain suite coverage.
    cache = NodeCache(tmp_path)
    store = MemoryStore()
    key = "a" * 64
    cache.put(key, {"success": True, "text": "x"}, store)
    entry_path = cache._entry(key)
    # Corrupt result.json with unparseable JSON, but a REAL 100KB file
    # actually sitting on disk (well over the cap used below).
    entry_path.write_bytes(b"{ not valid json " + b"x" * (100 * 1024))

    root = tmp_path / ".tongflow" / "node-cache"
    before_size = sum(p.stat().st_size for p in root.rglob("*") if p.is_file())
    assert before_size > 100 * 1024

    cache.sweep(128)  # cap far below the corrupt entry's real on-disk size

    after_size = sum(p.stat().st_size for p in root.rglob("*") if p.is_file())
    assert after_size <= 128
    assert not entry_path.parent.exists()
