#!/usr/bin/env bash
# AC-2 / AC-3: named jobs of a workflow run succeeded at THIS commit.
#
# Usage: check-run-jobs.sh <ci|docker|desktop> <job name> [job name...]
#
# Pinning to the head SHA is the point. "the last CI run was green" is not
# evidence about the tree being verified; a run at a different commit proves
# nothing about this one.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci/gh-run-lib.sh
. "$DIR/gh-run-lib.sh"

if [ "$#" -lt 2 ]; then
    echo "usage: $(basename "$0") <ci|docker|desktop> <job name> [job name...]" >&2
    exit 2
fi

KEY="$1"
shift

require_gh
# Validate the key HERE, in this shell. Inside find_run it is reached through a
# command substitution, where `exit 2` only kills the subshell — the caller then
# queries with an empty --workflow and any run at that commit answers.
workflow_file "$KEY" >/dev/null
SHA="$(head_sha)"
RUN_ID="$(find_run "$KEY" "" "$SHA")"
JSON="$(run_json "$RUN_ID")"
# Report the commit the RUN actually ran at, not the local head: anchored, the
# run is a historical one and labelling it with wherever this branch happens to
# sit would make the evidence say something false.
RUN_SHA="$(printf '%s' "$JSON" | jq -r '.headSha')"

echo "run $(printf '%s' "$JSON" | jq -r '.url') @ ${RUN_SHA}"

fail=0
for name in "$@"; do
    conclusion="$(printf '%s' "$JSON" | jq -r --arg n "$name" '.jobs[] | select(.name == $n) | .conclusion')"
    if [ -z "$conclusion" ]; then
        echo "FAIL: no job named '${name}' in this run" >&2
        fail=1
        continue
    fi
    if [ "$conclusion" != "success" ]; then
        echo "FAIL: job '${name}' concluded ${conclusion}" >&2
        fail=1
        continue
    fi
    echo "ok job '${name}': success"
done

# The run must be finished — a green subset of a run still in flight is a
# snapshot, not a result. Deliberately NOT the run's overall conclusion: this
# script's whole contract is "these named jobs succeeded", and coupling it to
# sibling jobs makes one eval fail for another eval's reason.
assert_run_finished "$JSON"

[ "$fail" -eq 0 ] || exit 1
echo "all requested jobs succeeded at ${RUN_SHA}"
