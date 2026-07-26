#!/usr/bin/env bash
# AC-8 suppression half: a dependency bump must not carry code changes into T3
# paths. Biome 2.5.5's useOptionalChain autofix reached in here once already.
#
# Every failure mode below exits non-zero on purpose. A guard that can announce
# "clean" when it could not actually look is worse than no guard, and the first
# version of this script did exactly that: `|| true` swallowed git's error, so
# an unfetched base — precisely what a shallow CI clone produces — read as a
# pass.
set -euo pipefail

BASE="${1:-origin/main}"
PATHS=(src/lib/abi src/app/api)

if ! git rev-parse --verify --quiet "${BASE}^{commit}" >/dev/null; then
    echo "cannot resolve base ref '${BASE}' — fetch it first (CI needs fetch-depth: 0)" >&2
    exit 2
fi

if ! drift="$(git diff --name-only "${BASE}...HEAD" -- "${PATHS[@]}")"; then
    echo "git diff against '${BASE}' failed — refusing to report a clean tree" >&2
    exit 2
fi

if [ -n "$drift" ]; then
    echo "T3 paths modified by a dependency change:" >&2
    printf '%s\n' "$drift" >&2
    exit 1
fi

echo "no T3 drift: ${PATHS[*]} untouched vs ${BASE}"
