#!/usr/bin/env bash
# E3 — ADR-0012 guarantee #2: OneFlow runs fully without media-library configured.
#
# The way that guarantee breaks in practice is not a crash but an IMPORT: once a
# layout, a provider or an instrumentation file pulls the module in, the studio
# has a boot-time relationship with a service the user may never configure. So
# the guard asserts only the feature's own surface imports it.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

TARGET="${1:-src}"
ALLOWED='(^|/)(app/api/media-library/|lib/media-library/|components/workspace/nodes/add/(add-)?media-|components/proto/add-media-library)'

OFFENDERS="$(grep -rln "@/lib/media-library/" "$TARGET" \
    --include="*.ts" --include="*.tsx" \
    | grep -Ev "$ALLOWED" || true)"

if [ -n "$OFFENDERS" ]; then
    echo "FAIL: media-library is imported outside its own feature surface:"
    echo "$OFFENDERS"
    exit 1
fi

echo "media-library imported only by its own routes, lib and node — scanned $TARGET"
