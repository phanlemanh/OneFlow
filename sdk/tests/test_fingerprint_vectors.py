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

The bump-and-rerun step NEVER touches the tracked `fingerprint.py`. Instead it
copies the `tongflow/` package and `tests/` directory into a fresh temporary
directory per subprocess run, bumps `KEY_SCHEMA_VERSION` only inside that copy,
and points the subprocess's cwd/PYTHONPATH at the copy -- the same
patch-a-copy-not-the-working-tree technique the stale-scope-by-paths guard
uses for its own mutation case (see `scripts/acceptance/check-stale-scoping.sh
--case mutation` and `_acceptance/stale-scope-by-paths/contract.md` AC-9).
Every temp directory is a fresh, independent copy, so there is nothing to
restore, no shared mutable state between the "bumped" and "reverted" runs, and
this guard is safe to run concurrently with itself or with any other test in
this suite -- unlike a guard that edits the tracked source in place.

The schema-version precondition ("the recorded vectors were generated under
the `KEY_SCHEMA_VERSION` currently in fingerprint.py") is asserted here, in
AC-14, immediately before the bump -- not inside AC-13's own test body. AC-14's
Given clause is literally "given AC-13's vectors are green"; that precondition
is what establishes it. Keeping it out of AC-13 also keeps AC-13 and AC-14 as
two independent pytest node-ids: if the precondition assertion lived inside
AC-13's test, a bump would trip *that* assertion first and AC-13's node-id
would go red for a reason that has nothing to do with the key-comparison loop
-- exactly the false guard this file exists to prevent.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from tongflow.engine.fingerprint import KEY_SCHEMA_VERSION, node_fingerprint

FIXTURES_DIR = Path(__file__).parent / "fixtures"
VECTORS_PATH = FIXTURES_DIR / "fingerprint_vectors.json"
SDK_ROOT = Path(__file__).parent.parent
TONGFLOW_SRC_DIR = SDK_ROOT / "tongflow"
TESTS_SRC_DIR = SDK_ROOT / "tests"
AC13_NODE_ID = "tests/test_fingerprint_vectors.py::test_vectors_match_character_for_character"

# Ample headroom for a single-test pytest subprocess; if the inner run ever
# hangs this bounds the guard's own runtime instead of hanging indefinitely.
SUBPROCESS_TIMEOUT_SECONDS = 120


def _load_vectors() -> dict:
    with VECTORS_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def _copy_sdk_tree(dest: Path) -> None:
    """Copy the tongflow package and tests directory into an isolated `dest`.

    Only these two directories are needed to run AC-13's node-id: the package
    under test and the test file plus its fixture. Copying (rather than
    editing SDK_ROOT in place) is what keeps this guard from ever writing the
    tracked `fingerprint.py` -- not "restoring it afterward", but never
    touching it at all.
    """
    ignore = shutil.ignore_patterns("__pycache__")
    shutil.copytree(TONGFLOW_SRC_DIR, dest / "tongflow", ignore=ignore)
    shutil.copytree(TESTS_SRC_DIR, dest / "tests", ignore=ignore)


def _bump_schema_version_in_copy(copy_root: Path) -> None:
    """Bump KEY_SCHEMA_VERSION by 1 inside the COPY's fingerprint.py only."""
    fp_path = copy_root / "tongflow" / "engine" / "fingerprint.py"
    source = fp_path.read_text(encoding="utf-8")
    old_line = f"KEY_SCHEMA_VERSION = {KEY_SCHEMA_VERSION}"
    new_line = f"KEY_SCHEMA_VERSION = {KEY_SCHEMA_VERSION + 1}"
    assert old_line in source, (
        "expected an exact `KEY_SCHEMA_VERSION = <int>` assignment line in "
        "fingerprint.py -- the guard's string replacement relies on it."
    )
    assert source.count(old_line) == 1, (
        "the exact assignment line must appear exactly once, or the "
        "replacement below could touch something unintended."
    )
    fp_path.write_text(source.replace(old_line, new_line, 1), encoding="utf-8")


def _run_ac13_against_copy(*, bump_schema_version: bool) -> subprocess.CompletedProcess[str]:
    """Run AC-13's own pytest node-id against a fresh, isolated copy of the SDK.

    Uses the same interpreter (`sys.executable`) and `PYTHONPATH=.` convention
    as the rest of this suite -- never `python3`, and never the ambient
    environment's default interpreter, since that could silently select a
    different (or absent) tongflow install. The env is extended, not
    replaced (`{**os.environ, ...}`), and `cwd` is the temp copy's root -- the
    same fix applied to the sibling AC-1 subprocess in test_fingerprint.py.

    Each call gets its own brand-new temp directory, so there is no shared
    mutable state -- and no stale-bytecode hazard -- between a "bumped" call
    and a "reverted" one.
    """
    with tempfile.TemporaryDirectory(prefix="fingerprint-ac14-") as tmp:
        copy_root = Path(tmp)
        _copy_sdk_tree(copy_root)
        if bump_schema_version:
            _bump_schema_version_in_copy(copy_root)

        env = {**os.environ, "PYTHONPATH": ".", "PYTHONDONTWRITEBYTECODE": "1"}
        return subprocess.run(
            [sys.executable, "-m", "pytest", "-q", AC13_NODE_ID],
            cwd=copy_root,
            capture_output=True,
            text=True,
            env=env,
            check=False,
            timeout=SUBPROCESS_TIMEOUT_SECONDS,
        )


def test_vectors_match_character_for_character():
    # AC-13. Every recorded key must match, character for character, what the
    # current implementation computes. (The precondition that the vector file
    # itself was generated under the currently-running KEY_SCHEMA_VERSION is
    # asserted separately, in AC-14, immediately before that guard bumps the
    # constant -- see the module docstring for why it does not belong here.)
    data = _load_vectors()

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
    # is that guard, by actually bumping the constant in an isolated copy of
    # the package, actually re-running AC-13's own pytest node-id against that
    # copy in a separate process, and actually observing the failure -- not by
    # recomputing a key inline and comparing it to itself, which would only
    # prove `v` is hashed somewhere, not that AC-13's test is what turns red.

    # Precondition: "Given AC-13's vectors are green" -- the recorded schema
    # version must match the constant we are about to bump. This lives here,
    # not in AC-13's own test body, so that AC-13 and AC-14 stay on separate
    # pytest node-ids: if this assertion lived inside AC-13, a bump below
    # would trip *this* check first and AC-13's node-id would go red for a
    # reason unrelated to the key-comparison loop it actually guards.
    data = _load_vectors()
    assert data["keySchemaVersion"] == KEY_SCHEMA_VERSION, (
        "fingerprint_vectors.json was generated under a different "
        "KEY_SCHEMA_VERSION than the one currently in fingerprint.py -- "
        "regenerate the vector file."
    )

    bumped_result = _run_ac13_against_copy(bump_schema_version=True)
    assert bumped_result.returncode != 0, (
        "bumping KEY_SCHEMA_VERSION by 1 (in an isolated copy) did not turn "
        "AC-13's own test red in a fresh subprocess -- `v` is not actually "
        "guarded.\n"
        f"stdout:\n{bumped_result.stdout}\nstderr:\n{bumped_result.stderr}"
    )

    reverted_result = _run_ac13_against_copy(bump_schema_version=False)
    assert reverted_result.returncode == 0, (
        "AC-13's own test should pass in a fresh subprocess against an "
        "unmodified copy of the package (the 'reverted' state).\n"
        f"stdout:\n{reverted_result.stdout}\nstderr:\n{reverted_result.stderr}"
    )
