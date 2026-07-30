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
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Optional

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

_BLOB_KEY = "__cache_blob"
_SIZE_KEY = "__cache_size"
_EXT_KEY = "__cache_ext"


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

    Not a checkout, or no git binary, or git failing for any reason: return
    False. Those states are already uncacheable via a missing `plugin_rev`, and
    reporting them as "dirty" too would conflate two independent reasons.

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
        return False
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

    def get(self, key: str, store: AssetStore) -> Optional[dict[str, Any]]:
        """The cached result with its blobs re-put into ``store``, or None.

        Re-putting is the correctness crux of D6: `MemoryStore` hands back a
        `mem://<uuid>` that only lives inside one process, so a cached handle
        from an earlier run is a dead pointer. Downstream nodes must see a
        `file_key` valid in the store THIS run is using.
        """
        try:
            raw = self._entry(key).read_text(encoding="utf-8")
            payload = json.loads(raw)
            return self._rehydrate(payload, store)
        except Exception:
            # Any unusable entry is a miss: missing file, unparseable JSON,
            # missing or truncated blob, permission error.
            return None

    def put(self, key: str, result: dict[str, Any], store: AssetStore) -> None:
        """Write one entry. Never raises — a cache that cannot write must not
        fail the run (spec section 8)."""
        try:
            payload = self._dehydrate(result, store)
            self._entry(key).parent.mkdir(parents=True, exist_ok=True)
            _atomic_write(
                self._entry(key),
                json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            )
        except Exception:
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
                if not blob.exists():
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
