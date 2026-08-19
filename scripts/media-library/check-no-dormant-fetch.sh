#!/usr/bin/env bash
# E27 — downloadAndSave() must stay dead.
#
# It fetches ANY url and persists the bytes, with no scheme, host or size check
# (src/lib/file/file-utils.ts). A caller anywhere in the tree inherits that hole,
# and the media-library feature is exactly the kind of caller it has been waiting
# for: it receives URLs from an outside service. So the guard asserts the caller
# list is EMPTY and prints that list rather than merely claiming "clean".
#
# ROOT is derived from this script's own location, never from cwd.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

TARGET="${1:-src}"

# Comment lines are dropped: the function is NAMED in prose (this feature's own
# import.server.ts explains why it does not use it), and a guard that counted
# that would be measuring string-presence rather than a call — the first version
# of this script did exactly that and went red on its own documentation.
CALLERS="$(grep -rn "downloadAndSave(" "$TARGET" \
    --include="*.ts" --include="*.tsx" \
    | grep -v "src/lib/file/file-utils.ts" \
    | grep -v "check-no-dormant-fetch" \
    | grep -vE '^[^:]*:[0-9]+:[[:space:]]*(\*|//|/\*)' || true)"

if [ -n "$CALLERS" ]; then
    echo "FAIL: downloadAndSave() has callers — it must stay unused:"
    echo "$CALLERS"
    exit 1
fi

echo "downloadAndSave() callers: (none) — scanned $TARGET"
