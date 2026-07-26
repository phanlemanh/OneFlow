#!/usr/bin/env bash
# AC-6: the suppression half of the dry run — dispatching docker-publish must
# publish nothing.
#
# Anchored to the dispatched run's own start time rather than "now minus a
# while": the question is whether THAT run pushed, and only a timestamp taken
# from the run itself can answer it.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci/gh-run-lib.sh
. "$DIR/gh-run-lib.sh"

require_gh

RUN_ID="$(find_run docker workflow_dispatch)"
JSON="$(run_json "$RUN_ID")"
SINCE="$(printf '%s' "$JSON" | jq -r '.createdAt')"
URL="$(printf '%s' "$JSON" | jq -r '.url')"

if [ -z "$SINCE" ] || [ "$SINCE" = "null" ]; then
    echo "could not read the dispatched run's start time — refusing to report nothing was published" >&2
    exit 2
fi

OWNER="$(gh repo view --json owner --jq '.owner.login')"
REPO="$(gh repo view --json name --jq '.name')"
# Image refs are lowercase; the packages API uses the same normalised name.
PKG="$(printf '%s' "$REPO" | tr '[:upper:]' '[:lower:]')"

echo "dispatched run started ${SINCE} (${URL})"
echo "checking GHCR package ${OWNER}/${PKG}"

body=""
status=0
body="$(gh api "/users/${OWNER}/packages/container/${PKG}/versions" --paginate 2>&1)" || status=$?

if [ "$status" -ne 0 ]; then
    if printf '%s' "$body" | grep -qE 'HTTP 404|Not Found'; then
        echo "no GHCR container package exists for ${OWNER}/${PKG} — nothing has ever been published"
        echo "no publish occurred during the dry run"
        exit 0
    fi
    echo "gh api failed while listing package versions — refusing to report nothing was published" >&2
    printf '%s\n' "$body" >&2
    exit 2
fi

recent="$(printf '%s' "$body" | jq -r --arg since "$SINCE" '
    [.[] | select(.created_at >= $since)]
    | map({created_at, tags: (.metadata.container.tags // [])})
    | .[] | "\(.created_at)  \(.tags | join(","))"
')"

if [ -n "$recent" ]; then
    echo "FAIL: GHCR versions created at or after the dry run started:" >&2
    printf '%s\n' "$recent" >&2
    exit 1
fi

total="$(printf '%s' "$body" | jq -r 'length')"
echo "${total} pre-existing version(s), none created at or after ${SINCE}"
echo "no publish occurred during the dry run"
