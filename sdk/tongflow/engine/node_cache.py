"""On-disk cache for one plugin call's result — slice L2, tier A only.

The cache is NOT the source of truth. Every read and write path degrades to
"behave as if there were no cache" on any error: a full disk, a read-only
directory, a half-written entry. Deleting the whole directory must change
nothing but speed (spec section 8).

Blobs live at the node-cache ROOT, not inside each entry, so two entries
referencing byte-identical assets share one file. Both `result.json` and blobs
are written temp-then-`os.replace`: a process reading a half-written file is
the hazard, and it applies to blobs exactly as much as to the manifest.
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
from .store import AssetStore

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

    def _dehydrate(self, node: Any, store: AssetStore) -> Any:
        """Replace every asset ref with a blob pointer, writing the blob."""
        if isinstance(node, dict):
            fk = node.get("file_key")
            if isinstance(fk, str):
                data = store.get(fk)
                if data is not None:
                    sha = hashlib.sha256(data).hexdigest()
                    blob = self._blob(sha)
                    if not blob.exists():
                        _atomic_write(blob, data)
                    rest = {k: v for k, v in node.items() if k != "file_key"}
                    return {**rest, _BLOB_KEY: sha, _SIZE_KEY: len(data)}
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
                        if k not in (_BLOB_KEY, _SIZE_KEY)}
                ref = store.put(
                    data,
                    mime=rest.get("mime"),
                    filename=rest.get("filename"),
                )
                return {**rest, **ref}
            return {k: self._rehydrate(v, store) for k, v in node.items()}
        if isinstance(node, list):
            return [self._rehydrate(v, store) for v in node]
        return node
