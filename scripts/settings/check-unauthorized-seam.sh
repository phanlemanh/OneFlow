#!/usr/bin/env bash
#
# One place DEFINES the shell sign-in seam; exactly two places CALL it.
#
# Why a guard and not just review: three surfaces each rolled their own key-store
# error handling once, and all three got it wrong in a different way. That is the
# mechanism this whole line of dossiers exists to close, and it reappears the
# moment a second file dispatches `tf:unauthorized` on its own.
#
# Counts OCCURRENCES, not files. A guard that counts FILES stays green when the
# same file dispatches the event twice — which is exactly the shape a half-done
# extraction leaves behind: the helper is added, the inline block is not removed,
# and the event name plus the `cancelable` contract now live in two places inside
# one file.
set -uo pipefail
cd "$(dirname "$0")/../.."

SRC=$(find src \( -name '*.ts' -o -name '*.tsx' \) \
    ! -name '*.test.ts' ! -name '*.test.tsx' \
    ! -path 'src/ext/*' | sort)

DEFS=$(printf '%s\n' "$SRC" | tr '\n' '\0' \
    | xargs -0 grep -o 'new CustomEvent("tf:unauthorized"' 2>/dev/null | wc -l | tr -d ' ')

CALLERS=$(printf '%s\n' "$SRC" | tr '\n' '\0' \
    | xargs -0 grep -l 'notifyUnauthorized(' 2>/dev/null | sort)
N_CALLERS=$(printf '%s' "$CALLERS" | grep -c . || true)

echo "dispatch sites: $DEFS"
printf 'callers (%s):\n%s\n' "$N_CALLERS" "$CALLERS"

# Nothing to measure is not the same as nothing wrong. A guard whose subject has
# vanished must say so rather than report a clean tree.
if [ "$DEFS" -eq 0 ]; then
    echo "FAIL: nothing dispatches tf:unauthorized — the guard has no subject left"
    exit 2
fi

if [ "$DEFS" -ne 1 ]; then
    echo "FAIL: expected exactly 1 dispatch site, found $DEFS"
    exit 1
fi

EXPECTED="src/lib/api/client.ts
src/lib/settings/env-client.ts"
if [ "$CALLERS" != "$EXPECTED" ]; then
    echo "FAIL: callers must be exactly these two:"
    printf '%s\n' "$EXPECTED"
    exit 1
fi

echo "OK: 1 dispatch site, 2 callers"
