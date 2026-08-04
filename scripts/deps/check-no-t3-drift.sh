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

# This guard asks a question about ONE pull request: "did it touch these paths?"
# Re-run on a later branch it answers about somebody else's diff — which is how
# it went permanently red after merging, blocking a branch it has nothing to do
# with. ACCEPTANCE_SLUG anchors it back to its own pull request. Unset, every
# line below behaves exactly as it did before anchoring existed, so an open pull
# request sees no change at all. The anchoring rule itself lives in
# scripts/acceptance/own-range.sh and nowhere else: this is one call, not a
# second implementation of it.
if [ -n "${ACCEPTANCE_SLUG:-}" ]; then
    RESOLVER="$(cd "$(dirname "${BASH_SOURCE[0]}")/../acceptance" && pwd)/own-range.sh"
    if ! own="$(bash "$RESOLVER" "$ACCEPTANCE_SLUG")"; then
        echo "could not resolve the commit range owned by '${ACCEPTANCE_SLUG}' — refusing to report a clean tree" >&2
        exit 2
    fi
    RANGE_FROM="$(printf '%s\n' "$own" | sed -n 's/^range_from=//p')"
    RANGE_TO="$(printf '%s\n' "$own" | sed -n 's/^range_to=//p')"
    if [ -z "$RANGE_FROM" ] || [ -z "$RANGE_TO" ]; then
        echo "own-range.sh printed no range for '${ACCEPTANCE_SLUG}' — refusing to report a clean tree" >&2
        exit 2
    fi
    RANGE="${RANGE_FROM}...${RANGE_TO}"
    LABEL="the range ${ACCEPTANCE_SLUG} owns (${RANGE_FROM}..${RANGE_TO})"
else
    if ! git rev-parse --verify --quiet "${BASE}^{commit}" >/dev/null; then
        echo "cannot resolve base ref '${BASE}' — fetch it first (CI needs fetch-depth: 0)" >&2
        exit 2
    fi
    RANGE="${BASE}...HEAD"
    LABEL="${BASE}"
fi

if ! drift="$(git diff --name-only "$RANGE" -- "${PATHS[@]}")"; then
    echo "git diff over '${RANGE}' failed — refusing to report a clean tree" >&2
    exit 2
fi

if [ -n "$drift" ]; then
    echo "T3 paths modified by a dependency change:" >&2
    printf '%s\n' "$drift" >&2
    exit 1
fi

echo "no T3 drift: ${PATHS[*]} untouched vs ${LABEL}"
