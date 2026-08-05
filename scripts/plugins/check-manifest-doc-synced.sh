#!/usr/bin/env bash
# ci-vitest-sdk-pin (CI-a) — AC-9.
#
# CLAUDE.md is read by every agent at the start of every session, so a stale
# description there propagates further than stale code. The manifest guard
# changed meaning when the first origin entry landed (compose-overlay, 03/08):
# "38 plain strings" became "38 plain strings under the default org + exactly 1
# origin entry". This asserts the doc says what the guard actually enforces.
#
# The numbers are DERIVED from the guard, never restated here — a doc-check that
# hardcodes its own copy of the constant is the same drift one level up.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

DOC=CLAUDE.md
GUARD=scripts/plugins/check-manifest-unmoved.sh

fail() { echo "FAIL: $*" >&2; exit 1; }

[ -f "$DOC" ] || fail "missing $DOC"
[ -f "$GUARD" ] || fail "missing $GUARD"

n_strings=$(grep -oE 'strings\.length !== [0-9]+' "$GUARD" | grep -oE '[0-9]+' | head -1)
n_objects=$(grep -oE 'objects\.length !== [0-9]+' "$GUARD" | grep -oE '[0-9]+' | head -1)
[ -n "$n_strings" ] && [ -n "$n_objects" ] \
    || fail "could not read the expected counts out of $GUARD — did the guard change shape?"

# The bullet in CLAUDE.md that talks about this guard.
para=$(grep -n 'check-manifest-unmoved' "$DOC" | head -1 | cut -d: -f1)
[ -n "$para" ] || fail "$DOC no longer mentions check-manifest-unmoved.sh"
line=$(sed -n "${para}p" "$DOC")

# The old knob is gone from the guard; a doc still telling people to bump it
# sends them looking for a variable that does not exist.
if grep -q 'expected_count' "$GUARD"; then
    fail "$GUARD reintroduced expected_count — this guard's premise no longer holds, update AC-9"
fi
# Reject the INSTRUCTION, not the mention. "Bump expected_count" sends a reader
# after a variable that no longer exists; "there is no expected_count any more"
# is the doc doing its job. An earlier version of this guard failed on both and
# would have pushed the fix into the doc's meaning instead of the guard's.
printf '%s\n' "$line" | grep -qiE 'bump[^.]{0,20}expected_count' \
    && fail "$DOC still tells the reader to bump \`expected_count\`, a knob $GUARD no longer has"

printf '%s\n' "$line" | grep -q "$n_strings" \
    || fail "$DOC does not state the plain-string count the guard enforces ($n_strings)"

# The half that was missing entirely: the origin entry.
printf '%s\n' "$line" | grep -qiE 'origin entr(y|ies)' \
    || fail "$DOC describes the guard without its origin-entry half (guard requires exactly $n_objects)"

echo "OK: $DOC describes $GUARD as it behaves — $n_strings plain strings + $n_objects origin entry"
