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

exec node scripts/media-library/no-boot-dependency.mjs "${1:-src}"
