"""On-disk cache for one plugin call's result — slice L2, tier A only.

The cache is NOT the source of truth. Every read and write path degrades to
"behave as if there were no cache" on any error: a full disk, a read-only
directory, a half-written entry. Deleting the whole directory must change
nothing but speed (spec section 8).

Blobs live at the node-cache ROOT, not inside each entry, so two entries
referencing byte-identical assets share one file. Both `result.json` and blobs
are written temp-then-`os.replace`: a process reading a half-written file is
the hazard, and it applies to blobs exactly as much as to the manifest.

Relative-path `file_key`s (a `DiskStore` configured with `file_key_base`, the
desktop delegation path) are NOT cached in this slice. `DiskStore.get()`
always returns `None` by design (resolution happens in `assets.py`), and a
relative path cannot be read directly either — it is only meaningful joined
against a base this module does not know. Rather than persist a raw path that
a later run's `out_dir` could make point at the wrong task's directory (a
silent HIT serving stale or cross-task data), any asset whose bytes cannot be
captured makes the whole `put()` a no-op. Revisit once the cache is taught the
plugin's `file_key_base`.
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Callable, Optional

from ._subproc import utf8_env
from .assets import _ext_from_filename, _ext_from_mime
from .store import AssetStore


class _UncacheableAsset(Exception):
    """Raised internally when an asset's bytes cannot be captured.

    Caught by `put()`'s existing `except Exception: return` so the whole
    entry is refused rather than written with a stale/wrong pointer.
    """


# Tier A is a hand-maintained allowlist, NOT derived from the ABI. 38 of 61
# slots carry no seed/temperature knob, but that set includes gen-text,
# image-describe and music-brief — generative model calls with no seed to pin,
# i.e. MORE nondeterministic, not less. Absence of a knob does not imply
# determinism, so a slot must be named here to be cached.
#
# transcribe / transcribe-timestamp / parse-document are deliberately absent
# even though spec D3 names them: they pick a decoder from the declared mime,
# and L2 is what turns the mime/filename known limit (queue 1.1-L1b) from
# theoretical into live. Re-add them once that lands.
TIER_A_SLOTS = frozenset({
    # compose-overlay: deterministic CPU overlay compositing (no model call,
    # no seed to pin); byte-identity evidence lives in the plugin repo's
    # golden suite (AC-10).
    "compose-overlay",
    # normalize-text-vi is DELIBERATELY ABSENT — it was here, and was removed at
    # Gate 2 round 5 (owner, 2026-08-21). It is deterministic (a pure function
    # over a string), which is why it qualified; that is not the problem.
    #
    # The problem is the KEY, not the value. Every other slot on this list
    # computes inside its own plugin repo, so `pluginRev` + `plugin_is_dirty()`
    # track the code that produced the cached value. normalize-text-vi is the
    # first Tier-A slot whose algorithm lives in the SDK itself
    # (tongflow/text/normalize_vi.py + the pinned vietnormalizer), and the
    # fingerprint carries only `sdk_major()` — measured: "0.2.19", "0.2.22",
    # "0.2.23" and "0.2.24" all hash as "0.2". So four reader fixes shipped in
    # one day would NOT have invalidated a single cached reading: a user who hit
    # "Giá 500 Đ" before the fix keeps getting the wrong reading back, ok=True,
    # nothing red. That is the silent-wrong-price shape Gate G1 exists to stop.
    #
    # sdk_major()'s major.minor truncation is a deliberate R6 bargain — correct
    # for slots whose code lives in a plugin, wrong for a slot whose code lives
    # here. Re-add ONLY once the reader identity (full SDK version, or a digest
    # of tongflow/text/ plus the vietnormalizer pin) is part of the key.
    "concat-videos",
    "extract-audio",
    "remove-video-audio",
    "merge-video-audio",
    "get-first-frame",
    "get-last-frame",
    "split-video",
    "drop-video",
    "split-text",
    "combine-text",
    "arrange-group",
})

# Tier B is also a hand-maintained allowlist, NOT derived from the ABI at
# runtime (same rule as Tier A above) -- but it WAS derived once, on
# 2026-07-30, from the ABI (every slot whose `inputs.properties` carries
# `seed`/`temperature`/`top_p`) and then pinned here for review. Reused
# within one workflow+node scope (`workflowScope`), never across workflows or
# tenants: "same input -> reuse what you already generated", not "same input
# -> same output" (impossible for a model with no seed to pin).
#
# `image-upscale` / `video-upscale` DO have a `seed` field, so they land here
# rather than Tier A despite spec D3's example -- that example assumed the
# seed gets pinned somewhere, but nothing in this slice pins it yet. Move
# them to Tier A once a seed-pinning mechanism exists.
TIER_B_SLOTS = frozenset({
    "audio-video-lip-sync",
    "gen-music",
    "image-edit",
    "image-fusion",
    "image-gen",
    "image-gen-model",
    "image-gen-text",
    "image-gen-video",
    "image-image-gen-video",
    "image-upscale",
    "images-gen-video",
    "music-complete",
    "music-cover",
    "music-extract",
    "music-lego",
    "music-repaint",
    "speech-text-gen-video",
    "speech-video-gen-video",
    "text-gen-video",
    "video-edit",
    "video-gen-text",
    "video-image-gen-video-move",
    "video-upscale",
})

# The generative-no-knob group: nondeterministic (an LLM/generative call) but
# with no seed/temperature/top_p knob to call "unpinned" -- so they fit
# neither tier's rationale as written. Caching them is desirable in principle
# (an unchanged prompt re-running gen-text is wasted spend) but user
# expectations around a repeated LLM call are not yet settled, so this slice
# deliberately leaves them uncached. Kept as an explicit constant (rather than
# just "absent from both lists") so the ABI drift guard below has a concrete
# reference set to check against, and so opening this group later is a
# one-line move, not a rediscovery.
DESCOPED_GENERATIVE_SLOTS = frozenset({
    "gen-text",
    "image-describe",
    "video-describe",
    "audio-describe",
    "music-brief",
    "text-gen-speech-preset",
    "text-gen-speech-clone",
    "text-gen-speech-instruct",
    "text-audio-gen-speech",
})

_BLOB_KEY = "__cache_blob"
_SIZE_KEY = "__cache_size"
_EXT_KEY = "__cache_ext"
_META_NAME = "meta.json"

# 20 GiB (spec R2). A global cap, not per-tenant -- a shared cloud disk lets
# one tenant's churn evict another's entries (known limit, revisit with
# cloud P2; see design doc §11).
DEFAULT_CACHE_MAX_BYTES = 20 * 1024**3


def resolve_cache_max_bytes(param: Optional[int]) -> int:
    """Cap resolution chain: explicit param -> env -> default (design §4).

    A non-int or non-positive env value is ignored in favor of the default
    rather than raising -- this module has no logger of its own to report the
    bad value; the caller decides whether/how to log at wiring time (Task 4).
    """
    if isinstance(param, int) and param > 0:
        return param
    env = os.environ.get("TONGFLOW_CACHE_MAX_BYTES", "").strip()
    if env.isdigit() and int(env) > 0:
        return int(env)
    return DEFAULT_CACHE_MAX_BYTES


def _blob_shas_of(node: Any) -> list[str]:
    """Recursively collect every `__cache_blob` sha in a cached payload.

    Same dict/list walk shape as `NodeCache._rehydrate` -- blob references are
    NOT stored in `meta.json` (design §3): they are derivable from
    `result.json` alone, so a legacy entry with no sidecar is still GC-able.
    """
    shas: list[str] = []
    if isinstance(node, dict):
        sha = node.get(_BLOB_KEY)
        if isinstance(sha, str):
            shas.append(sha)
        else:
            for v in node.values():
                shas.extend(_blob_shas_of(v))
    elif isinstance(node, list):
        for v in node:
            shas.extend(_blob_shas_of(v))
    return shas


def abi_digest_of(abi_file: Path) -> str:
    """sha256 of the ABI file in use.

    The ABI is an input to the computation, not ambient configuration: both
    `materialize_asset_inputs` and `convert_asset_outputs_to_file_refs` read
    it, so the same business input can produce a different result when a slot's
    schema changes. `sdkMajor` does not cover it — the ABI is a separate file
    with its own version that changes without an SDK minor bump.
    """
    return hashlib.sha256(abi_file.read_bytes()).hexdigest()


def plugin_is_dirty(plugin_dir: Path) -> bool:
    """True when the plugin checkout has uncommitted edits.

    `git rev-parse HEAD` cannot see a working-tree edit, so a hand-modified
    plugin keeps its rev and the cache would serve its old result forever —
    the blocking condition conformance-l0 recorded for this slice.

    Not a checkout, or no git binary: return False. Those states are already
    uncacheable via a missing `plugin_rev`, and reporting them as "dirty" too
    would conflate two independent reasons -- keep them distinguishable rather
    than folding a third failure mode into the same signal.

    But `git status --porcelain` itself running and exiting non-zero (index
    corruption, a permissions error) is a THIRD, different case: unlike the
    two above, the rev IS readable here -- `plugin_rev` is present and would
    key a cache entry -- while dirtiness is simply unknown. Reporting that as
    clean is the R1 scenario this fix closes: edited plugin code gets cached
    under a clean-rev key and served back forever. So this branch alone
    returns True (dirty), while the two branches above keep returning False.

    Deliberate choice: `git status --porcelain` reports untracked files
    (`??`) as dirty too, not just modified-tracked files. That is fail-safe
    (cache stays off, never a wrong result) but has a real cost — a stray
    `__pycache__` or editor swap file left untracked in a plugin checkout
    disables that plugin's cache until the tree is cleaned. Accepted for this
    slice rather than diffing tracked files only.
    """
    if not (plugin_dir / ".git").exists():
        return False
    try:
        r = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=plugin_dir,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=utf8_env(),
        )
    except OSError:
        return False
    if r.returncode != 0:
        return True
    return bool(r.stdout.strip())


def _atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), suffix=".part")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        os.replace(tmp, path)
    except BaseException:
        # Leave no partial file behind on any exit path, including interrupts.
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


class NodeCache:
    """Content-addressed cache rooted at ``<data_dir>/.tongflow/node-cache``."""

    def __init__(self, data_dir: Path) -> None:
        self.root = Path(data_dir) / ".tongflow" / "node-cache"

    def _entry(self, key: str) -> Path:
        return self.root / key[:2] / key / "result.json"

    def _blob(self, sha: str) -> Path:
        return self.root / "blobs" / sha[:2] / sha

    def get(
        self, key: str, store: AssetStore, *, log: Optional[Callable[[str], None]] = None
    ) -> Optional[dict[str, Any]]:
        """The cached result with its blobs re-put into ``store``, or None.

        Re-putting is the correctness crux of D6: `MemoryStore` hands back a
        `mem://<uuid>` that only lives inside one process, so a cached handle
        from an earlier run is a dead pointer. Downstream nodes must see a
        `file_key` valid in the store THIS run is using.

        `log` (default `None`) is one of the four closed-list swallow
        branches (AC-6): an UNUSABLE entry -> miss logs exactly one line per
        `get()` call that hits this path. A plain COLD miss (no entry ever
        written for this key -- `FileNotFoundError` reading `result.json`
        itself) is a different thing: design branch (1) is "unusable
        entry", not "absent entry", and a cold run would otherwise emit one
        log line per node per call. The cold-miss exemption is scoped to
        JUST the entry-file read, not the whole method -- an entry that
        exists and parses but whose BLOB is gone (exactly the state the
        orphan-GC race can produce) also raises `FileNotFoundError`
        (`_rehydrate`'s `blob.read_bytes()`), and THAT case is a genuinely
        unusable entry, not a cold miss, so it still logs. Every other
        exception (corrupt JSON, a truncated blob referenced by an entry
        that DOES exist, permission error) also still logs.
        """
        try:
            entry_path = self._entry(key)
            try:
                raw = entry_path.read_text(encoding="utf-8")
            except FileNotFoundError:
                # Cold miss: no entry was ever written for this key -- silent
                # (see docstring). Scoped to only this read, not blob reads
                # below, which raise the same exception type for a different,
                # loggable reason.
                return None
            payload = json.loads(raw)
            rehydrated = self._rehydrate(payload, store)
            # Recency touch for the LRU sweep. Best-effort: a read-only root
            # must not turn a HIT into a crash, and this one failure mode is
            # the sole logged-swallow exemption (design §4) -- silent on
            # purpose, unlike every other swallow branch.
            try:
                os.utime(entry_path)
            except Exception:
                pass
            return rehydrated
        except Exception as e:
            # Any OTHER unusable entry is a miss: unparseable JSON, a
            # truncated/missing blob referenced by a real entry, permission
            # error.
            if log is not None:
                log(f"cache get unusable for {key}: {e}")
            return None

    def put(
        self,
        key: str,
        result: dict[str, Any],
        store: AssetStore,
        *,
        tenant: Optional[str] = None,
        workflow_scope: Optional[str] = None,
        log: Optional[Callable[[str], None]] = None,
    ) -> None:
        """Write one entry. Never raises — a cache that cannot write must not
        fail the run (spec section 8).

        Writes `meta.json` BEFORE `result.json`, in the SAME try: a
        meta-only leftover (this write lands, the `result.json` write below
        then fails) is invisible to `get()` (reads `result.json`) and to
        `sweep()`'s entry glob (matches on `result.json`) -- harmless, and
        pruned outright by `sweep()`'s stale-entry-dir pass (any
        `<shard>/<key>/` dir with no `result.json`) on the next sweep. The
        reverse order -- `result.json` first -- would instead leave a fully
        HIT-able entry with no sidecar on a failed meta write: exactly the
        harm d-...-S2 forbids (an entry `purge` can never see is worse than
        a miss).

        `log` (default `None`) is one of the four closed-list swallow
        branches (AC-6): a refused `put()` logs exactly one line.
        """
        try:
            payload = self._dehydrate(result, store)
            entry_path = self._entry(key)
            # No explicit mkdir here: `_atomic_write` already creates the
            # parent directory before writing.
            _atomic_write(
                entry_path.parent / _META_NAME,
                json.dumps({"v": 1, "tenant": tenant,
                            "workflow_scope": workflow_scope}).encode("utf-8"),
            )
            _atomic_write(
                entry_path,
                json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            )
        except Exception as e:
            if log is not None:
                log(f"cache put refused for {key}: {e}")
            return

    def _capture_bytes(self, fk: str, store: AssetStore) -> bytes:
        """Get the raw bytes behind a `file_key`, or raise `_UncacheableAsset`.

        Tries the store first (works for `MemoryStore` and `HttpStore`), then
        falls back to reading an absolute filesystem path directly (a
        `DiskStore` with no `file_key_base`). A relative path — `DiskStore`
        WITH `file_key_base` — is not resolvable here (see module docstring),
        so it refuses rather than persist a pointer that later points into a
        different task's directory.
        """
        data = store.get(fk)
        if data is not None:
            return data
        p = Path(fk)
        if p.is_absolute() and p.is_file():
            try:
                return p.read_bytes()
            except OSError as e:
                raise _UncacheableAsset(fk) from e
        raise _UncacheableAsset(fk)

    def _dehydrate(self, node: Any, store: AssetStore) -> Any:
        """Replace every asset ref with a blob pointer, writing the blob.

        Raises `_UncacheableAsset` (caught by `put()`) when any asset's bytes
        cannot be captured — see module docstring: a wrong pointer served as
        a HIT is worse than a MISS, so the whole entry is refused.
        """
        if isinstance(node, dict):
            fk = node.get("file_key")
            if isinstance(fk, str):
                data = self._capture_bytes(fk, store)
                sha = hashlib.sha256(data).hexdigest()
                blob = self._blob(sha)
                # Rewrite whenever the on-disk blob doesn't match: absent, or a
                # size mismatch left by a process that died mid-write (the
                # truncated-blob case `_rehydrate` detects on the read side).
                # A `stat()` failure is treated the same as a mismatch rather
                # than trusted as "fine" -- self-healing, not another miss
                # forever. Matching size skips the write so AC-12's one-blob
                # dedupe still holds.
                try:
                    blob_ok = blob.exists() and blob.stat().st_size == len(data)
                except OSError:
                    blob_ok = False
                if not blob_ok:
                    _atomic_write(blob, data)
                rest = {k: v for k, v in node.items() if k != "file_key"}
                # Derive `ext` the same way assets.py does for a freshly
                # produced asset, so a cache hit re-emits the same extension
                # as an uncached run (see assets._normalize_file_ref).
                mime = rest.get("mime")
                filename = rest.get("filename")
                ext = (
                    _ext_from_mime(mime or "")
                    or (_ext_from_filename(filename) if filename else None)
                    or "bin"
                )
                return {**rest, _BLOB_KEY: sha, _SIZE_KEY: len(data), _EXT_KEY: ext}
            return {k: self._dehydrate(v, store) for k, v in node.items()}
        if isinstance(node, list):
            return [self._dehydrate(v, store) for v in node]
        return node

    def _rehydrate(self, node: Any, store: AssetStore) -> Any:
        """Put blobs back into `store` and restore `file_key`.

        A size mismatch means the blob was written by a process that died
        mid-write; raise so `get()` reports a miss. Size rather than a re-hash:
        re-hashing a 200MB video on every hit is exactly the I/O the cache
        exists to avoid.
        """
        if isinstance(node, dict):
            sha = node.get(_BLOB_KEY)
            if isinstance(sha, str):
                blob = self._blob(sha)
                data = blob.read_bytes()
                if len(data) != node.get(_SIZE_KEY):
                    raise ValueError("cached blob size mismatch")
                rest = {k: v for k, v in node.items()
                        if k not in (_BLOB_KEY, _SIZE_KEY, _EXT_KEY)}
                ref = store.put(
                    data,
                    mime=rest.get("mime"),
                    filename=rest.get("filename"),
                    ext=node.get(_EXT_KEY) or "bin",
                )
                return {**rest, **ref}
            return {k: self._rehydrate(v, store) for k, v in node.items()}
        if isinstance(node, list):
            return [self._rehydrate(v, store) for v in node]
        return node

    def sweep(self, max_bytes: int, *, log: Optional[Callable[[str], None]] = None) -> None:
        """Size-capped LRU eviction + unconditional orphan-blob GC (design §4).

        Never raises: the whole body runs inside one try/except so a bad
        sweep degrades to "no maintenance this run", not a failed run (spec
        section 8, same rule as `get`/`put`). Works on legacy entries (no
        `meta.json`) exactly as well as new ones -- recency and blob refs
        come from `result.json` alone, never from the sidecar.
        """
        try:
            entries = []  # (mtime, entry_dir, entry_bytes, blob_shas)
            for result_json in self.root.glob("[0-9a-f][0-9a-f]/*/result.json"):
                entry_dir = result_json.parent
                # Size computed FIRST, ahead of the JSON parse below, so a
                # corrupt/unparseable result.json (caught by the `except`)
                # still contributes its REAL on-disk bytes to `usage` -- a
                # corrupt entry occupies real space and must count as
                # eviction pressure, not silently vanish from accounting
                # while it sits on disk forever.
                #
                # Per-file guard: a `.part` temp file from a concurrent
                # `_atomic_write` in this same dir, or any file that loses a
                # stat/unlink race between `iterdir()` and `stat()`, must
                # not fail this entry's classification -- only that one
                # file's bytes are skipped.
                size = 0
                try:
                    for p in entry_dir.iterdir():
                        if p.suffix == ".part":
                            continue
                        try:
                            size += p.stat().st_size
                        except OSError:
                            continue
                    payload = json.loads(result_json.read_text(encoding="utf-8"))
                    shas = _blob_shas_of(payload)
                    stat = result_json.stat()
                    entries.append((stat.st_mtime, entry_dir, size, shas))
                except Exception:
                    # Unreadable: evict first, but the bytes it occupies
                    # still count (`size` was computed above, outside this
                    # try's failure-prone steps).
                    entries.append((0.0, entry_dir, size, []))

            blob_sizes: dict[str, int] = {}
            refcount: dict[str, int] = {}
            for blob in self.root.glob("blobs/[0-9a-f][0-9a-f]/*"):
                # A blob that loses a stat race (dangling symlink, deleted
                # concurrently between glob and stat) must not abort the
                # whole sweep -- skip just that blob, same rule as the
                # per-file guard above.
                try:
                    blob_sizes[blob.name] = blob.stat().st_size
                except OSError:
                    continue
                refcount[blob.name] = 0
            for _, _, _, shas in entries:
                for s in shas:
                    if s in refcount:
                        refcount[s] += 1

            # Usage counts entry bytes plus only REFERENCED blob bytes.
            # Pre-existing orphans (refcount 0 -- an L2/L3 leftover, or one
            # this very sweep's eviction loop below creates) are freed by
            # the unconditional orphan-GC pass at the end, not by eviction:
            # counting them here would make eviction pressure proportional
            # to garbage already scheduled for deletion, over-evicting live
            # entries to make room for bytes about to vanish anyway.
            usage = sum(e[2] for e in entries) + sum(
                size for sha, size in blob_sizes.items() if refcount.get(sha, 0) > 0
            )
            victims = []
            entries.sort(key=lambda e: e[0])  # oldest mtime first
            for _mtime, entry_dir, size, shas in entries:
                if usage <= max_bytes:
                    break
                victims.append(entry_dir)
                usage -= size
                for s in shas:
                    if s in refcount:
                        refcount[s] -= 1
                        if refcount[s] == 0:
                            usage -= blob_sizes.get(s, 0)

            for entry_dir in victims:
                shutil.rmtree(entry_dir, ignore_errors=True)

            # Unconditional stale-entry-dir prune: a dir with no
            # `result.json` (e.g. a meta-only leftover from a `put()` whose
            # `result.json` write then failed -- see `put()`'s docstring)
            # is invisible to `get()`/the entries glob above and would
            # otherwise sit forever. `ignore_errors=True` is the per-item
            # guard -- one dir failing to remove must not abort the sweep.
            for stale_dir in self.root.glob("[0-9a-f][0-9a-f]/*"):
                if stale_dir.is_dir() and not (stale_dir / "result.json").exists():
                    shutil.rmtree(stale_dir, ignore_errors=True)

            # Unconditional orphan-blob GC: runs every sweep, evictions or
            # not -- pre-existing orphans (the L3 monotonic-growth known
            # limit) must not survive behind the cap condition.
            self._collect_orphan_blobs()
        except Exception as e:
            if log is not None:
                log(f"cache sweep failed: {e}")

    def _collect_orphan_blobs(self) -> None:
        """Delete every blob under `blobs/` that no surviving entry references.

        Shared by `sweep()` (its unconditional GC pass) and `purge()` (the
        cleanup after deleting a workflow's entries) -- both need the exact
        same "walk every surviving `result.json`, diff against every blob on
        disk" pass, so it lives once here rather than duplicated per caller.
        Caller-scoped try/except (this method itself never raises for a
        single bad file -- only per-item guards, same pattern as the rest of
        this module).
        """
        surviving: set[str] = set()
        for result_json in self.root.glob("[0-9a-f][0-9a-f]/*/result.json"):
            try:
                surviving.update(
                    _blob_shas_of(json.loads(result_json.read_text(encoding="utf-8")))
                )
            except Exception:
                pass
        for blob in self.root.glob("blobs/[0-9a-f][0-9a-f]/*"):
            if blob.name not in surviving:
                try:
                    blob.unlink()
                except OSError:
                    pass

    def purge(
        self, tenant: str, workflow_id: str, *, log: Optional[Callable[[str], None]] = None
    ) -> None:
        """Delete every entry scoped to one tenant + workflow, then GC orphan blobs.

        Never raises (spec section 8, same rule as `sweep`/`get`/`put`): the
        whole body runs inside one try/except. A `meta.json` this can't read
        (missing -- a legacy pre-`meta.json` entry, per AC-5 -- or corrupt)
        is a silent per-entry skip: purge cannot know what it should have
        matched without a readable sidecar, so it leaves the entry alone
        rather than guessing. That is a best-effort miss of the walk, NOT
        one of AC-6's four closed-list branches -- only a failure of the
        `purge()` call itself (e.g. an unreadable root) logs, exactly once,
        at the end.

        `tenant` is required to be a non-empty string, same gate the runner
        uses (`NodeCache(data_dir) if tenant else None`): `purge(None, ...)`
        or `purge("", ...)` matches -- and therefore deletes -- nothing,
        rather than treating a null/empty tenant as "no tenant filter" and
        wiping every tenant's entries for that workflow.

        `workflow_id` is normalized with `str(workflow_id).strip()` before
        building the match prefix, mirroring the runner's `wf_id_clean`
        (`str(workflow_id).strip()`) used when it ORIGINALLY built the
        `workflow_scope` string at `put()` time -- otherwise
        `purge(t, " 1 ")` silently matches nothing even though `put()` wrote
        the entry under the trimmed id.

        The scope match is `startswith(f"wf:{workflow_id_clean}:")`, WITH
        the trailing colon -- not a bare substring/`in` check of
        `workflow_id` against `workflow_scope`. Dropping the colon lets
        workflow "1" cross-match workflow "11"'s entries (AC-7); the colon
        is what keeps the match anchored to a whole workflow id.

        Shares `sweep()`'s stale-entry-dir prune's microsecond multi-process
        race: a prune landing between a concurrent `put()`'s meta write and
        its result write can yield a legacy-shaped, purge-invisible entry
        (AC-5 keeps it sweepable regardless) -- `purge` shares that
        best-effort posture rather than trying to close the window.
        """
        try:
            workflow_id_clean = str(workflow_id).strip()
            prefix = f"wf:{workflow_id_clean}:"
            for meta_path in self.root.glob("[0-9a-f][0-9a-f]/*/meta.json"):
                try:
                    meta = json.loads(meta_path.read_text(encoding="utf-8"))
                except Exception:
                    continue
                if not isinstance(tenant, str) or not tenant or meta.get("tenant") != tenant:
                    continue
                scope = meta.get("workflow_scope")
                if not isinstance(scope, str) or not scope.startswith(prefix):
                    continue
                shutil.rmtree(meta_path.parent, ignore_errors=True)
            self._collect_orphan_blobs()
        except Exception as e:
            if log is not None:
                log(f"cache purge failed for tenant={tenant} workflow={workflow_id}: {e}")
