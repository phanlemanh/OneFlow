#!/usr/bin/env bash
# Shared helpers for the ci-actions-bump evals.
#
# These evals cannot re-run the work locally: a bumped GitHub Action can only be
# proved by the runner that executes it. So they query real runs. That makes
# "could not look" a distinct outcome from "looked and it was fine", and every
# helper below exits 2 rather than letting a missing run read as a pass —
# the same lesson scripts/deps/check-no-t3-drift.sh was hardened for.

workflow_file() {
    case "$1" in
        ci) echo "ci.yml" ;;
        docker) echo "docker-publish.yml" ;;
        desktop) echo "desktop-release.yml" ;;
        *)
            echo "unknown workflow key '$1' (expected: ci | docker | desktop)" >&2
            exit 2
            ;;
    esac
}

require_gh() {
    if ! command -v gh >/dev/null 2>&1; then
        echo "gh CLI not found — this eval reads real Actions runs and cannot be faked locally" >&2
        exit 2
    fi
    if ! gh auth status >/dev/null 2>&1; then
        echo "gh is not authenticated — refusing to report a run green without reading it" >&2
        exit 2
    fi
}

head_sha() {
    local sha
    if ! sha="$(git rev-parse --verify HEAD 2>/dev/null)"; then
        echo "cannot resolve HEAD" >&2
        exit 2
    fi
    printf '%s' "$sha"
}

# find_run <workflow-key> [event] [commit-sha] [branch]
# Prints the databaseId of the most recent matching run. Exits 2 when there is
# none — an eval that silently passes because nothing ran is worthless.
find_run() {
    local key="$1" event="${2:-}" sha="${3:-}" branch="${4:-}"
    local file args id
    file="$(workflow_file "$key")"

    args=(run list --workflow "$file" --limit 20 --json databaseId,headSha,event,status,conclusion)
    [ -n "$event" ] && args+=(--event "$event")
    [ -n "$sha" ] && args+=(--commit "$sha")
    # Without this the newest dispatch on ANY branch answers the query.
    [ -n "$branch" ] && args+=(--branch "$branch")

    local runs
    if ! runs="$(gh "${args[@]}")"; then
        echo "gh run list failed for ${file} — refusing to guess" >&2
        exit 2
    fi

    id="$(printf '%s' "$runs" | jq -r 'sort_by(.databaseId) | reverse | .[0].databaseId // empty')"
    if [ -z "$id" ]; then
        echo "no ${file} run found${event:+ for event ${event}}${sha:+ at commit ${sha}}${branch:+ on branch ${branch}}" >&2
        echo "the workflow must actually have run before this eval can say anything" >&2
        exit 2
    fi
    printf '%s' "$id"
}

# run_json <run-id> — the run with its jobs and steps.
run_json() {
    local id="$1" out
    if ! out="$(gh run view "$id" --json databaseId,displayTitle,event,status,conclusion,headSha,createdAt,url,jobs)"; then
        echo "gh run view ${id} failed — refusing to report it green" >&2
        exit 2
    fi
    printf '%s' "$out"
}

# assert_run_finished <run-json>
# The run has stopped moving, so its job results are final. Says nothing about
# whether the run as a whole was green — a caller that names the jobs it cares
# about must not be held hostage to unrelated jobs in the same run.
assert_run_finished() {
    local json="$1" status url
    status="$(printf '%s' "$json" | jq -r '.status')"
    url="$(printf '%s' "$json" | jq -r '.url')"

    if [ "$status" != "completed" ]; then
        echo "run is still ${status} — not yet evidence of anything (${url})" >&2
        exit 2
    fi
}

# assert_run_complete <run-json> — finished AND green overall.
# Right for a dispatched dry run, where every job is part of the claim.
assert_run_complete() {
    local json="$1" conclusion url
    assert_run_finished "$json"
    conclusion="$(printf '%s' "$json" | jq -r '.conclusion')"
    url="$(printf '%s' "$json" | jq -r '.url')"

    if [ "$conclusion" != "success" ]; then
        echo "FAIL: run concluded ${conclusion} (${url})" >&2
        return 1
    fi
    return 0
}
