"""Content-addressed cache keys for a node's execution.

Two pure functions, no I/O. Slice L1 of the cache roadmap computes keys and
nothing else -- reading and writing entries is L2.

The normalization rule is NOT reimplemented here. ``digest_form`` delegates to
``callog.normalize_call``, which is the shape the TS/Python conformance suite
holds both runtimes to. Keeping the cache key derived from that exact artifact
is what stops the suite from guarding one definition while the cache uses
another -- the silent-wrong-answer failure the spec names in section 5.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any

from .callog import normalize_call

# Bumping this invalidates every existing cache entry on purpose. Change it
# whenever the meaning of any key component changes, and say so in the
# changelog (R6).
KEY_SCHEMA_VERSION = 1


def digest_form(slot: str, business_input: dict[str, Any]) -> dict[str, Any]:
    """The input half of the shared conformance call-log shape.

    Drops per-run keys, sorts keys, and replaces inline asset bytes with their
    sha256 so the key stays small and stable regardless of how large the asset
    is or which store handed it over.
    """
    return normalize_call(slot, business_input)["input"]


def sdk_major(version: str | None = None) -> str:
    """``"0.2.17"`` -> ``"0.2"``.

    Major.minor rather than the full version: R6 accepts that a schema-level
    SDK change invalidates the cache, but a patch release wiping the whole
    store is a different bargain than the one that was accepted.
    """
    if version is None:
        # Imported lazily, and it must stay that way. `tongflow/__init__.py`
        # does `from .engine import run_workflow` BEFORE it defines
        # `__version__`, so a module-level `from .. import __version__` here
        # breaks the moment anything inside the engine package imports this
        # module -- which is exactly what L2 will do from runner.py. By call
        # time the package is fully initialized and this is safe.
        from .. import __version__

        raw = __version__
    else:
        raw = version
    parts = raw.split(".")
    if len(parts) < 2:
        raise ValueError(f"malformed SDK version: {raw!r}")
    return f"{parts[0]}.{parts[1]}"


def node_fingerprint(
    *,
    slot: str,
    plugin_id: str,
    plugin_rev: str | None,
    plugin_dirty: bool,
    model: str | None,
    business_input: dict[str, Any],
    sdk_version: str | None = None,
) -> str | None:
    """The cache key for one plugin call, or ``None`` when it cannot be cached.

    ``None`` is returned when there is no recorded ``plugin_rev`` (a
    hand-copied plugin directory with no ``.git`` -- an ordinary dev state,
    not an error) or when ``plugin_dirty`` is ``True`` (the plugin's working
    tree has uncommitted edits that ``git rev-parse HEAD`` cannot see, so
    ``plugin_rev`` alone would keep pointing at stale code). Either case would
    otherwise let the cache serve an old version's result forever (R1).
    Returning ``None`` rather than raising puts the decision in the type,
    where a static checker makes L2's caller handle it. ``plugin_dirty`` has
    no default -- it must always be computed by the caller, never silently
    assumed false.
    """
    if not plugin_rev or plugin_dirty:
        return None
    payload = {
        "v": KEY_SCHEMA_VERSION,
        "slot": slot,
        "pluginId": plugin_id,
        "pluginRev": plugin_rev,
        "model": model,
        "sdkMajor": sdk_major(sdk_version),
        "input": digest_form(slot, business_input),
    }
    # sort_keys + fixed separators + ensure_ascii is the canonical form. All
    # three matter: any of them left to a default is a key that changes when a
    # Python release changes its default.
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()
