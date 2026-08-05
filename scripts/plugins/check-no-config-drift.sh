#!/usr/bin/env bash
# AC-6: widening the prefix must not carry anything else with it.
#
# The manifest is the thing most tempting to "fix" while here — repointing `org`
# or renaming ids would look like part of the same job, and it is not: those
# repos are upstream and the org is undecided. So the paths that would carry
# such a change are asserted untouched.
#
# Every failure mode exits non-zero on purpose; a guard that can announce clean
# without looking is worse than no guard (see scripts/deps/check-no-t3-drift.sh).
set -euo pipefail

BASE="${1:-origin/main}"
PATHS=(config src/lib/plugins/plugins-registry-schema.ts src/lib/plugins/plugins-registry.server.ts src/db)

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
    echo "FAIL: files changed that this feature must not touch:" >&2
    printf '%s\n' "$drift" >&2
    exit 1
fi

# The manifest's own content is the substance of the claim, so check it directly
# rather than inferring it from the diff being empty.
MANIFEST="config/official-plugins.json"
if [ ! -f "$MANIFEST" ]; then
    echo "missing ${MANIFEST} — refusing to report it unchanged" >&2
    exit 2
fi

org="$(python3 -c "import json,sys;print(json.load(open('${MANIFEST}'))['org'])")"
count="$(python3 -c "import json;print(len(json.load(open('${MANIFEST}'))['plugins']))")"

if [ "$org" != "https://github.com/tong-io" ]; then
    echo "FAIL: the official org moved to '${org}' — that is a separate change with its own contract" >&2
    exit 1
fi
if [ "$count" -lt 30 ]; then
    echo "FAIL: only ${count} official plugins listed; the manifest was reshaped" >&2
    exit 1
fi

echo "no drift vs ${LABEL}: ${PATHS[*]} untouched"
echo "manifest intact: ${count} plugins, org still ${org}"
