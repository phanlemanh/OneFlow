#!/usr/bin/env bash
# AC-12 — a new table must be reachable through the barrel.
#
# drizzle.config.ts and ext-default/db.ts both read src/db/schema.ts. A table
# declared only in workspace.schema.ts type-checks, passes unit tests, and then
# produces a migration that is missing it.
set -euo pipefail
cd "$(dirname "$0")/../.."
fail() { echo "FAIL: $*" >&2; exit 1; }

grep -q "directorEvents" src/db/schema.ts \
    || fail "directorEvents is not exported from src/db/schema.ts"
grep -q "schema: \"./src/db/schema.ts\"" drizzle.config.ts \
    || fail "drizzle.config.ts no longer reads the barrel — this guard is measuring the wrong file"

echo "OK: directorEvents reachable through src/db/schema.ts"
