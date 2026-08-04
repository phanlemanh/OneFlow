#!/usr/bin/env bash
# AC-5 / AC-7: the manually dispatched dry run of a release workflow succeeded,
# and the steps that carry the bumped actions are the ones that succeeded.
#
# Usage: check-dispatch-run.sh <docker|desktop>
#
# A green run is not enough on its own. A workflow whose steps were skipped also
# concludes success, so each required step is checked by name — otherwise this
# eval would happily pass on a run that never reached the action being proved.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci/gh-run-lib.sh
. "$DIR/gh-run-lib.sh"

KEY="${1:-}"
case "$KEY" in
    docker)
        REQUIRED_STEPS=("Set up QEMU" "Log in to GHCR" "Build & push")
        SKIPPED_STEPS=()
        ;;
    desktop)
        REQUIRED_STEPS=("Cache cargo registry" "Sanity-check installer" "Upload as Actions artifact (dry run)")
        # The tag-only path must NOT have run on a dispatch.
        SKIPPED_STEPS=("Upload to draft GitHub Release")
        ;;
    *)
        echo "usage: $(basename "$0") <docker|desktop>" >&2
        exit 2
        ;;
esac

require_gh
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
RUN_ID="$(find_run "$KEY" workflow_dispatch "" "$BRANCH")"
# The tree this run must match is "the tree that got merged". Unanchored that is
# HEAD; anchored it is the merge commit — comparing against HEAD on a later
# branch would fail this guard for a second, unrelated reason after the run
# lookup itself was anchored. find_run ignores the branch argument whenever an
# anchor is present (a merged branch may not exist any more).
TIP="$(anchor_tip)"
JSON="$(run_json "$RUN_ID")"

RUN_SHA="$(printf '%s' "$JSON" | jq -r '.headSha')"
echo "dispatched run $(printf '%s' "$JSON" | jq -r '.url')"
echo "  branch under test: ${BRANCH}   run head: ${RUN_SHA}"

fail=0

# A green run at some other tree proves nothing about the tree being merged.
# Compare the workflow directory itself rather than the commit: later commits on
# this branch add acceptance evidence under _acceptance/** (T1) and must not
# invalidate a dry run that exercised identical workflow content.
if ! run_tree="$(git rev-parse --verify --quiet "${RUN_SHA}:.github/workflows")"; then
    echo "cannot read .github/workflows at the run's commit ${RUN_SHA} — fetch it first" >&2
    exit 2
fi
head_tree="$(git rev-parse --verify "${TIP}:.github/workflows")"
if [ "$run_tree" != "$head_tree" ]; then
    echo "FAIL: the dispatched run used a different .github/workflows tree" >&2
    echo "      run  ${RUN_SHA}: ${run_tree}" >&2
    echo "      ${TIP}: ${head_tree}" >&2
    echo "      re-dispatch after pushing the current workflows" >&2
    fail=1
else
    echo "  workflow tree matches ${TIP}: ${head_tree}"
fi

assert_run_complete "$JSON" || fail=1

job_count="$(printf '%s' "$JSON" | jq -r '.jobs | length')"
if [ "$job_count" -eq 0 ]; then
    echo "FAIL: run has no jobs" >&2
    fail=1
fi

checked=0
while IFS= read -r name; do
    [ -n "$name" ] || continue
    conclusion="$(printf '%s' "$JSON" | jq -r --arg n "$name" '.jobs[] | select(.name == $n) | .conclusion')"
    # Tag-only jobs (`prepare`, `publish`) are skipped on a dispatch by design;
    # that is the dry run working, not a failure.
    if [ "$conclusion" = "skipped" ]; then
        echo "-- job '${name}': skipped (tag-only path, expected on a dispatch)"
        continue
    fi
    if [ "$conclusion" != "success" ]; then
        echo "FAIL: job '${name}' concluded ${conclusion}" >&2
        fail=1
        continue
    fi
    checked=$((checked + 1))
    echo "ok job '${name}': success"

    for step in "${REQUIRED_STEPS[@]}"; do
        sc="$(printf '%s' "$JSON" | jq -r --arg j "$name" --arg s "$step" \
            '.jobs[] | select(.name == $j) | .steps[] | select(.name == $s) | .conclusion')"
        if [ -z "$sc" ]; then
            echo "FAIL: job '${name}' has no step '${step}' — the bumped action was never reached" >&2
            fail=1
        elif [ "$sc" != "success" ]; then
            echo "FAIL: step '${step}' in '${name}' concluded ${sc}" >&2
            fail=1
        else
            echo "   ok step '${step}': success"
        fi
    done

    for step in ${SKIPPED_STEPS[@]+"${SKIPPED_STEPS[@]}"}; do
        sc="$(printf '%s' "$JSON" | jq -r --arg j "$name" --arg s "$step" \
            '.jobs[] | select(.name == $j) | .steps[] | select(.name == $s) | .conclusion')"
        if [ -n "$sc" ] && [ "$sc" != "skipped" ]; then
            echo "FAIL: step '${step}' in '${name}' ran (${sc}) — a dry run must not take the release path" >&2
            fail=1
        else
            echo "   ok step '${step}': not taken on a dispatch"
        fi
    done
done <<<"$(printf '%s' "$JSON" | jq -r '.jobs[].name')"

# AC-5 claims both architectures were produced. Job and step conclusions do not
# say that — a single-platform build succeeds identically — so read the log.
if [ "$KEY" = "docker" ]; then
    dlog=""
    if ! dlog="$(gh run view --job "$(printf '%s' "$JSON" | jq -r '.jobs[0].databaseId')" --log 2>&1)"; then
        echo "could not read the docker job log to confirm platforms — refusing to answer" >&2
        exit 2
    fi
    for plat in linux/amd64 linux/arm64; do
        # grep without -q: see the SIGPIPE note in check-ghcr-untouched.sh.
        if printf '%s' "$dlog" | grep -F "[${plat} " >/dev/null; then
            echo "ok  ${plat} build stages present in the log"
        else
            echo "FAIL: no ${plat} build stages — the run did not build both platforms" >&2
            fail=1
        fi
    done
fi

# Every job skipped would satisfy the loop above without proving a thing.
if [ "$checked" -eq 0 ]; then
    echo "FAIL: no job in this run actually executed — nothing was proved" >&2
    fail=1
fi

if [ "$KEY" = "desktop" ] && [ "$checked" -lt 2 ]; then
    echo "FAIL: expected both matrix legs (macos-14, windows-latest) to run, got ${checked}" >&2
    fail=1
fi

[ "$fail" -eq 0 ] || exit 1
echo "dispatched ${KEY} dry run succeeded, and reached every step that carries a bumped action"
