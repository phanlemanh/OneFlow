#!/usr/bin/env bash
# AC-6: the suppression half of the dry run — dispatching docker-publish must
# publish nothing.
#
# Two sources, deliberately unequal.
#
# The DECISIVE one is the run's own log: what the runner resolved `push` to, and
# whether buildx was ever told to write to a registry. That proves the builder
# never attempted a push, which is a stronger statement than any observation of
# the registry afterwards.
#
# The registry listing is CORROBORATION only, and it is the reason this script
# was rewritten. Its first version treated a 404 from the versions endpoint as
# "nothing was ever published" — but a token without read:packages returns 404
# for a package that exists, so the check announced clean when it could not look.
# Now a missing scope is reported as a non-answer and the verdict rests on the
# log half, which needs no scope at all.
set -euo pipefail

# NOTE on `grep` without -q below: `grep -q` exits on the first match, which
# closes the pipe under it. With `set -o pipefail` the dead `printf` makes the
# whole pipeline report 141, so a SUCCESSFUL match reads as no match — the guard
# finds the answer and then throws it away. Only shows up once the input exceeds
# the pipe buffer, which is exactly when it matters. Let grep read to the end.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci/gh-run-lib.sh
. "$DIR/gh-run-lib.sh"

require_gh

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
RUN_ID="$(find_run docker workflow_dispatch "" "$BRANCH")"
JSON="$(run_json "$RUN_ID")"
SINCE="$(printf '%s' "$JSON" | jq -r '.createdAt')"
URL="$(printf '%s' "$JSON" | jq -r '.url')"
JOB_ID="$(printf '%s' "$JSON" | jq -r '.jobs[0].databaseId')"

if [ -z "$SINCE" ] || [ "$SINCE" = "null" ] || [ -z "$JOB_ID" ] || [ "$JOB_ID" = "null" ]; then
    echo "could not read the dispatched run — refusing to report nothing was published" >&2
    exit 2
fi

assert_run_finished "$JSON"
echo "dispatched run ${URL} (started ${SINCE})"

# Same provenance pin the dispatch check applies: a run of some other workflow
# content says nothing about the guard being merged.
RUN_SHA="$(printf '%s' "$JSON" | jq -r '.headSha')"
if ! run_tree="$(git rev-parse --verify --quiet "${RUN_SHA}:.github/workflows")"; then
    echo "cannot read .github/workflows at the run's commit ${RUN_SHA} — fetch it first" >&2
    exit 2
fi
if [ "$run_tree" != "$(git rev-parse --verify 'HEAD:.github/workflows')" ]; then
    echo "FAIL: this run used a different .github/workflows tree than HEAD" >&2
    exit 1
fi
echo "ok  run's workflow tree matches HEAD"

# ---------------------------------------------------------------- decisive half
log=""
if ! log="$(gh run view --job "$JOB_ID" --log 2>&1)"; then
    echo "could not read the run log — refusing to report nothing was published" >&2
    exit 2
fi

lines="$(printf '%s' "$log" | wc -l | tr -d ' ')"
if [ "$lines" -lt 100 ]; then
    echo "run log is only ${lines} lines — too short to have built anything; refusing to answer" >&2
    exit 2
fi

fail=0

if printf '%s' "$log" | grep -E '^.*[[:space:]]push:[[:space:]]*true[[:space:]]*$' >/dev/null; then
    echo "FAIL: the runner resolved the build-push input to true" >&2
    fail=1
elif printf '%s' "$log" | grep -E '^.*[[:space:]]push:[[:space:]]*false[[:space:]]*$' >/dev/null; then
    echo "ok  runner resolved 'push: false'"
else
    echo "could not find the resolved 'push' input in the log — refusing to answer" >&2
    exit 2
fi

# What buildx actually DID. Deliberately matches push activity, not the string
# "--push": buildx emits an advisory WARNING naming --push precisely when it did
# NOT push, so a textual scan flags the very evidence of innocence.
attempts="$(printf '%s' "$log" \
    | grep -vE 'WARNING:' \
    | grep -inE 'pushing manifest|pushing layer|exporting to (image|registry)|--output type=registry' || true)"
if [ -n "$attempts" ]; then
    echo "FAIL: the build attempted a registry write:" >&2
    printf '%s\n' "$attempts" | head -10 >&2
    fail=1
else
    echo "ok  no registry write anywhere in ${lines} log lines"
fi

# The invocation itself, separately: the flag must be absent from the command,
# where its presence would be an instruction rather than a warning.
buildx_cmd="$(printf '%s' "$log" | grep -E 'buildx (build|bake)' | grep -vE 'WARNING:' || true)"
if [ -z "$buildx_cmd" ]; then
    echo "could not find the buildx invocation in the log — refusing to answer" >&2
    exit 2
fi
if printf '%s' "$buildx_cmd" | grep -E '[[:space:]]--push([[:space:]]|$)' >/dev/null; then
    echo "FAIL: buildx was invoked with --push:" >&2
    printf '%s\n' "$buildx_cmd" | head -3 >&2
    fail=1
else
    echo "ok  buildx invoked without --push"
fi

# ----------------------------------------------------------- corroborating half
OWNER="$(gh repo view --json owner --jq '.owner.login')"
REPO="$(gh repo view --json name --jq '.name')"
PKG="$(printf '%s' "$REPO" | tr '[:upper:]' '[:lower:]')"

scope_probe=""
if ! scope_probe="$(gh api "/user/packages?package_type=container&per_page=1" 2>&1)"; then
    echo "--  registry cross-check unavailable: the token cannot read packages."
    echo "    Not treated as evidence either way — a 404 from the versions endpoint"
    echo "    is indistinguishable from a package this token simply cannot see."
else
    body=""
    status=0
    body="$(gh api "/users/${OWNER}/packages/container/${PKG}/versions" --paginate 2>&1)" || status=$?
    if [ "$status" -ne 0 ]; then
        if printf '%s' "$body" | grep -E 'HTTP 404|Not Found' >/dev/null; then
            echo "ok  no GHCR package ${OWNER}/${PKG} exists (read:packages confirmed, so absent, not invisible)"
        else
            echo "--  registry cross-check inconclusive:" >&2
            printf '%s\n' "$body" | head -3 >&2
        fi
    else
        recent="$(printf '%s' "$body" | jq -r --arg since "$SINCE" '
            [.[] | select(.created_at >= $since)]
            | map({created_at, tags: (.metadata.container.tags // [])})
            | .[] | "\(.created_at)  \(.tags | join(","))"
        ')"
        if [ -n "$recent" ]; then
            echo "FAIL: GHCR versions created at or after the dry run started:" >&2
            printf '%s\n' "$recent" >&2
            fail=1
        else
            echo "ok  $(printf '%s' "$body" | jq -r 'length') pre-existing version(s), none since ${SINCE}"
        fi
    fi
fi

[ "$fail" -eq 0 ] || exit 1
echo "no publish occurred during the dry run"
