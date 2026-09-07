#!/usr/bin/env bash
# E28 — the stub's fixtures must say where their shape came from, and must not
# drift away from it.
#
# Every eval in this feature runs against a hand-built stand-in for
# media-library. If that stand-in is wrong, the code is wrong in the same way
# and every eval stays green. This guard closes the half that CAN be closed
# from inside OneFlow: the fixture cites its source, and its field set still
# matches the contract's. Running the library's own schema here would mean
# importing the other repo's code, which ADR-0012 guarantee #1 forbids — so the
# remaining half is a declared Known limit and a Gate-2 precondition, not a
# silence.
#
# ROOT is derived from this script's own location, never from cwd.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

FIXTURE="src/lib/media-library/__fixtures__/cards.ts"
[ -f "$FIXTURE" ] || { echo "FAIL: no $FIXTURE"; exit 1; }

grep -q "PROVENANCE: media-library packages/contracts/src/" "$FIXTURE" \
    || { echo "FAIL: $FIXTURE has no PROVENANCE header naming the contract source"; exit 1; }
grep -qE "READ-ON: [0-9]{4}-[0-9]{2}-[0-9]{2}" "$FIXTURE" \
    || { echo "FAIL: $FIXTURE has no READ-ON date"; exit 1; }

echo "provenance headers present in $FIXTURE"
exec pnpm vitest run src/lib/media-library/__fixtures__/provenance.test.ts
