"""Normalize a plugin invocation into the shared conformance call-log shape.

Both runtimes emit this shape and the conformance fixtures assert on it, so it
is the one place the comparison scope is decided. The scope is deliberately
wide: every business field the ABI declares for the slot travels in the log,
not just the batch field. Narrowing it is how a suite goes green while staying
blind to the drift it exists to catch — a plugin default appearing on one side
only would slip through a log that carries just the batched value.

The TypeScript mirror is ``src/lib/abi/conformance.ts``. The two are meant to be
read side by side; they are implemented twice on purpose, because the exercise
is proving that two implementations agree.
"""

from __future__ import annotations

import base64
import hashlib
from typing import Any

# Per-run rather than semantic. `_tongflow` carries a progress URL and token,
# `taskId` changes every execution, and the routing keys describe where a result
# is projected rather than what the plugin computes. Including any of them would
# make every log differ from every other for reasons that mean nothing.
DROPPED_KEYS = frozenset({"_tongflow", "taskId", "outputs", "level", "dependencies"})

ASSET_DIGEST_KEY = "__asset"


def _digest_value(v: Any) -> Any:
    if isinstance(v, dict):
        b64 = v.get("bytesBase64")
        if isinstance(b64, str):
            # An asset materialized to inline bytes. The two sides reach these
            # bytes by different routes, so `file_key` always differs while the
            # content does not — compare the content.
            digest = hashlib.sha256(base64.b64decode(b64)).hexdigest()
            return {ASSET_DIGEST_KEY: digest}
        return {k: _digest_value(v[k]) for k in sorted(v)}
    if isinstance(v, list):
        return [_digest_value(x) for x in v]
    return v


def normalize_call(slot: str, business_input: dict[str, Any]) -> dict[str, Any]:
    """Return ``{"slot": ..., "input": ...}`` under the shared normalization rule."""
    out: dict[str, Any] = {}
    for k in sorted(business_input):
        if k in DROPPED_KEYS:
            continue
        v = business_input[k]
        # A valueless field is omitted rather than written as null: one side
        # writing null while the other omits the key would read as a real
        # difference when nothing differs.
        if v is None or v == "":
            continue
        out[k] = _digest_value(v)
    return {"slot": slot, "input": out}
