"""Python half of the TS↔Python conformance suite.

Both halves read THESE fixture files — one copy, under sdk/, not a mirror under
src/. The fixture is the contract; the adapters bend to it. A mirrored fixture
would drift, and a drifting fixture is worse than no fixture: it reports
agreement between two files nobody is comparing.

The suite covers fan-out semantics specifically. Other axes where the runtimes
could disagree (coercion, deeper null handling) have no case here yet — see the
contract's Known limits.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from tests.conformance.harness import FIXTURES, call_log, load_fixture

def _discover_cases() -> list[str]:
    """Every fixture on disk is a case, on both sides.

    A hand-written list is the mirror-image of the missing-fixture failure the
    module docstring guards against: a fixture that is present but unlisted
    runs on one runtime only, and a case that runs on one side reports nothing
    about agreement while looking like it does. Both halves glob the same
    directory, so adding a file is the whole of adding a case.
    """
    names = sorted(
        p.stem for p in FIXTURES.glob("*.json") if not p.name.startswith("baseline-")
    )
    if not names:
        raise RuntimeError(f"no conformance fixtures found under {FIXTURES}")
    return names


CASES = _discover_cases()


@pytest.mark.parametrize("case", CASES)
def test_python_call_log_matches_fixture(case: str, tmp_path: Path) -> None:
    fixture = load_fixture(case)
    assert call_log(fixture, tmp_path) == fixture["expectedCalls"]


def test_compose_overlay_single_call_ops_and_placeholder_pass_through(
    tmp_path: Path,
) -> None:
    """AC-13: compose-overlay enters the suite at birth, as a NON-batch slot.

    The parametrized glob test already holds both halves to the fixture's
    expectedCalls; this named test states the properties that comparison is
    supposed to carry, so a fixture edit cannot quietly weaken them:

    - exactly ONE call — the slot declares no batchField, so two ops and three
      connected handles must not fan out;
    - the ops array reaches the plugin untouched, op[0].text still holding its
      literal ``{text}`` placeholder while the ``text`` input travels beside it
      — substitution is plugin-side, the runtime never pre-substitutes;
    - the bare logo op passes through with no logo material inlined into it;
      the logo asset arrives only as the ``logo`` input.
    """
    fixture = load_fixture("compose-overlay")
    calls = call_log(fixture, tmp_path)

    assert len(calls) == 1
    (call,) = calls
    assert call["slot"] == "compose-overlay"

    ops = call["input"]["ops"]
    assert ops == fixture["workflow"]["executableNodes"][0]["bindings"]["ops"]["value"]
    assert "{text}" in ops[0]["text"]
    assert call["input"]["text"] == "50%"
    # The logo op names no asset; the logo travels only as the input field,
    # digested like every other asset.
    assert set(ops[1]) == {"type", "x", "y", "anchor", "width", "opacity"}
    assert set(call["input"]["logo"]) == {"__asset"}


def test_non_batch_log_still_matches_the_pre_change_baseline(tmp_path: Path) -> None:
    """AC-3: the fan-out change must not have moved the non-batch path at all.

    The baseline was captured while runner.py was still unmodified. If this
    fails, the engine moved — fix the engine. Regenerating the baseline would
    turn the check into a tautology.
    """
    fixture = load_fixture("no-batch")
    baseline = json.loads(
        (FIXTURES / "baseline-no-batch.json").read_text(encoding="utf-8")
    )
    assert call_log(fixture, tmp_path) == baseline["calls"]
