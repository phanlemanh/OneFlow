#!/usr/bin/env bash
# AC-8 suppression half: a dependency bump must not carry code changes into T3
# paths. Biome 2.5.5's useOptionalChain autofix reached in here once already.
set -euo pipefail
BASE="${1:-origin/main}"
drift="$(git diff --name-only "${BASE}...HEAD" -- src/lib/abi src/app/api || true)"
if [ -n "$drift" ]; then
  echo "T3 paths modified by a dependency change:" >&2
  printf '%s\n' "$drift" >&2
  exit 1
fi
echo "no T3 drift: src/lib/abi and src/app/api untouched vs ${BASE}"
