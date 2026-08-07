#!/usr/bin/env bash
# E4 / AC-3 — thin wrapper so the eval key stays a plain `bash script.sh`.
#
# The check itself is TypeScript because it must drive the REAL
# ensurePluginPython. That module starts with `import "server-only"`, which
# throws under a plain Node resolver; --conditions=react-server maps it to the
# package's own empty.js, exactly as the Next.js server build does.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
NODE_OPTIONS="${NODE_OPTIONS:-} --conditions=react-server" \
    pnpm tsx scripts/plugins/check-venv-isolation.ts
