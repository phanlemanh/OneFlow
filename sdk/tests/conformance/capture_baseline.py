"""Capture today's engine call-log for the non-batch fixtures.

Run ONCE, while ``runner.py`` is still unmodified. The output is committed and
becomes what AC-3 compares against: after fan-out lands, the same fixtures must
produce a byte-identical log.

"Unchanged from today's behaviour" stops being checkable the moment today's
behaviour is gone, which is why this runs first and why regenerating the file
after a change is the one thing that would make the check worthless. If the
comparison fails later, the engine moved — fix the engine.

Usage:
    python tests/conformance/capture_baseline.py [case]   # default: no-batch
"""

from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

from tests.conformance.harness import FIXTURES, call_log, load_fixture


def main() -> int:
    case = sys.argv[1] if len(sys.argv) > 1 else "no-batch"
    fixture = load_fixture(case)
    with tempfile.TemporaryDirectory() as tmp:
        calls = call_log(fixture, Path(tmp))

    if not calls:
        print(
            f"refusing to write an empty baseline for {case!r}: "
            "the fixture produced no plugin calls, so its bindings are wrong",
            file=sys.stderr,
        )
        return 1

    out = FIXTURES / f"baseline-{case}.json"
    out.write_text(
        json.dumps({"case": case, "calls": calls}, indent=2, ensure_ascii=False, sort_keys=True)
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {out} ({len(calls)} call(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
