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
