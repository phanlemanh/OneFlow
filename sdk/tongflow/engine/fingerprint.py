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

from typing import Any

from .callog import normalize_call


def digest_form(slot: str, business_input: dict[str, Any]) -> dict[str, Any]:
    """The input half of the shared conformance call-log shape.

    Drops per-run keys, sorts keys, and replaces inline asset bytes with their
    sha256 so the key stays small and stable regardless of how large the asset
    is or which store handed it over.
    """
    return normalize_call(slot, business_input)["input"]
