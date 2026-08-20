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

exec node scripts/media-library/no-dormant-fetch.mjs "${1:-src}"
