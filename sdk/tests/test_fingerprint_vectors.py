"""Recorded key-schema vectors and the guard that proves they are not a bluff.

AC-13: the vector file pins its own `sdk_version` per case (never falls back to
`tongflow.__version__`), and every recorded key must still match, character for
character, what the current implementation computes.

AC-14: bumping `KEY_SCHEMA_VERSION` -- and nothing else -- must turn AC-13's
own test red in a fresh subprocess, and reverting must turn it green again in
another fresh subprocess. Recomputing keys inline and diffing them against each
other would only prove `v` is hashed somewhere; it would not prove that
AC-13's own pytest node-id is what actually flips. That is why this guard
re-invokes pytest itself rather than reimplementing the comparison.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

from tongflow.engine.fingerprint import KEY_SCHEMA_VERSION, node_fingerprint

FIXTURES_DIR = Path(__file__).parent / "fixtures"
VECTORS_PATH = FIXTURES_DIR / "fingerprint_vectors.json"
FINGERPRINT_MODULE_PATH = Path(__file__).parent.parent / "tongflow" / "engine" / "fingerprint.py"
SDK_ROOT = Path(__file__).parent.parent
AC13_NODE_ID = "tests/test_fingerprint_vectors.py::test_vectors_match_character_for_character"


def _load_vectors() -> dict:
    with VECTORS_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def _clear_fingerprint_bytecode_cache() -> None:
    """Delete any cached bytecode for the module the guard edits.

    Two back-to-back writes to the same path (bump, then revert) can land
    inside the same filesystem mtime tick, which would let a stale
    `__pycache__/fingerprint*.pyc` survive an invalidation check and silently
    serve the *previous* source. That would make the guard flaky in exactly
    the direction that matters: a bumped source could still run the old
    (un-bumped) bytecode and report success for the wrong reason. Removing the
    cache directory before every subprocess run makes each run compile fresh.
    """
    pycache_dir = FINGERPRINT_MODULE_PATH.parent / "__pycache__"
    if not pycache_dir.is_dir():
        return
    for cached in pycache_dir.glob("fingerprint.*.pyc"):
        cached.unlink()


def _run_ac13_in_subprocess() -> subprocess.CompletedProcess[str]:
    """Re-run AC-13's own pytest node-id in a fresh subprocess.

    Uses the same interpreter (`sys.executable`) and the same `PYTHONPATH=.`
    convention as the rest of this suite -- never `python3`, and never the
    ambient environment's default interpreter, since that could silently
    select a different (or absent) tongflow install. `PYTHONDONTWRITEBYTECODE`
    plus the explicit cache clear above both guard against the stale-`.pyc`
    hazard described there.
    """
    _clear_fingerprint_bytecode_cache()
    env = {**os.environ, "PYTHONPATH": ".", "PYTHONDONTWRITEBYTECODE": "1"}
    return subprocess.run(
        [sys.executable, "-m", "pytest", "-q", AC13_NODE_ID],
        cwd=SDK_ROOT,
        capture_output=True,
        text=True,
        env=env,
        check=False,
    )


def test_vectors_match_character_for_character():
    # AC-13. A vector file generated under an older key schema silently
    # "passing" would certify a key format nobody is using -- so the recorded
    # schema version must match the current constant before anything else is
    # checked.
    data = _load_vectors()
    assert data["keySchemaVersion"] == KEY_SCHEMA_VERSION, (
        "fingerprint_vectors.json was generated under a different "
        "KEY_SCHEMA_VERSION than the one currently in fingerprint.py -- "
        "regenerate the vector file."
    )

    for case in data["cases"]:
        got = node_fingerprint(
            slot=case["slot"],
            plugin_id=case["pluginId"],
            plugin_rev=case["pluginRev"],
            plugin_dirty=case["pluginDirty"],
            model=case["model"],
            business_input=case["businessInput"],
            # Pinned per-entry -- never the running tongflow.__version__.
            # Otherwise an ordinary SDK minor/patch bump would turn every
            # vector red for a reason that has nothing to do with the key
            # schema, which is exactly the false alarm AC-13 exists to avoid.
            sdk_version=case["sdkVersion"],
        )
        assert got == case["expected"], (
            f"{case['name']}: key schema changed. If that was deliberate, bump "
            f"KEY_SCHEMA_VERSION and regenerate this file; if not, this is the bug."
        )


def test_vector_guard_catches_schema_version_bump():
    # AC-14. The only thing that will ever guard the `v` component of the key:
    # every other component's removal reddens some existing test, but
    # dropping KEY_SCHEMA_VERSION from the hashed payload leaves all of
    # AC-1..AC-13/AC-15/AC-16 green. This test proves the vector file itself
    # is that guard, by actually bumping the constant, actually re-running
    # AC-13's own pytest node-id in a separate process, and actually reverting
    # -- not by recomputing a key inline and comparing it to itself, which
    # would only prove `v` is hashed somewhere, not that AC-13's test is what
    # turns red.
    original_source = FINGERPRINT_MODULE_PATH.read_text(encoding="utf-8")
    old_line = f"KEY_SCHEMA_VERSION = {KEY_SCHEMA_VERSION}"
    new_line = f"KEY_SCHEMA_VERSION = {KEY_SCHEMA_VERSION + 1}"
    assert old_line in original_source, (
        "expected an exact `KEY_SCHEMA_VERSION = <int>` assignment line in "
        "fingerprint.py -- the guard's string replacement relies on it."
    )
    assert original_source.count(old_line) == 1, (
        "the exact assignment line must appear exactly once, or the "
        "replacement below could touch something unintended."
    )

    try:
        bumped_source = original_source.replace(old_line, new_line, 1)
        FINGERPRINT_MODULE_PATH.write_text(bumped_source, encoding="utf-8")

        bumped_result = _run_ac13_in_subprocess()
        assert bumped_result.returncode != 0, (
            "bumping KEY_SCHEMA_VERSION by 1 did not turn AC-13's own test "
            "red in a fresh subprocess -- `v` is not actually guarded.\n"
            f"stdout:\n{bumped_result.stdout}\nstderr:\n{bumped_result.stderr}"
        )
    finally:
        # Restore no matter what -- an assertion failure above, or any other
        # exception, must still leave the source file byte-for-byte as it was.
        FINGERPRINT_MODULE_PATH.write_text(original_source, encoding="utf-8")
        restored_source = FINGERPRINT_MODULE_PATH.read_text(encoding="utf-8")
        assert restored_source == original_source, (
            "fingerprint.py was not restored byte-for-byte after the guard "
            "ran -- a guard that leaves the repo modified on failure is "
            "worse than no guard."
        )

    reverted_result = _run_ac13_in_subprocess()
    assert reverted_result.returncode == 0, (
        "after reverting KEY_SCHEMA_VERSION, AC-13's own test should pass "
        "again in a fresh subprocess.\n"
        f"stdout:\n{reverted_result.stdout}\nstderr:\n{reverted_result.stderr}"
    )
