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

# _own_range — the resolver's output for the anchored feature, or nothing when
# unanchored. ACCEPTANCE_SLUG is the only switch; the anchoring RULE lives in
# scripts/acceptance/own-range.sh and nowhere else, so this is a call rather
# than a second implementation of it.
_own_range() {
    [ -n "${ACCEPTANCE_SLUG:-}" ] || return 0
    local dir out
    dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../acceptance" && pwd)"
    if ! out="$(bash "$dir/own-range.sh" "$ACCEPTANCE_SLUG")"; then
        echo "could not resolve the commit range owned by '${ACCEPTANCE_SLUG}' — refusing to report a run green" >&2
        exit 2
    fi
    printf '%s' "$out"
}

# anchor_commits — the commit set this feature's pull request owns, newest
# first, or nothing when unanchored.
anchor_commits() {
    _own_range | sed -n 's/^commits=//p' | tr ' ' '\n' | grep -v '^$'
}

# anchor_tip — the commit that plays HEAD's role. The provenance checks in
# check-dispatch-run.sh and check-ghcr-untouched.sh compare a run's workflow
# tree against "the tree that got merged"; on a later branch that is the anchor,
# not HEAD, and comparing against HEAD would fail them for a second, unrelated
# reason after the run lookup itself was fixed.
anchor_tip() {
    local out to
    out="$(_own_range)"
    if [ -n "$out" ]; then
        to="$(printf '%s' "$out" | sed -n 's/^range_to=//p')"
        if [ -z "$to" ]; then
            echo "own-range.sh printed no range_to for '${ACCEPTANCE_SLUG}'" >&2
            exit 2
        fi
        printf '%s' "$to"
        return 0
    fi
    head_sha
}

# find_run <workflow-key> [event] [commit-sha] [branch]
# Prints the databaseId of the most recent matching run. Exits 2 when there is
# none — an eval that silently passes because nothing ran is worthless.
find_run() {
    local key="$1" event="${2:-}" sha="${3:-}" branch="${4:-}"
    local file id
    # NOT `file="$(workflow_file ...)"`: this function is itself invoked inside a
    # command substitution, and bash suppresses set -e there, so workflow_file's
    # exit 2 would kill only its own subshell and leave `file` empty — after
    # which `gh run list --workflow ""` cheerfully answers with any run.
    case "$key" in
        ci) file="ci.yml" ;;
        docker) file="docker-publish.yml" ;;
        desktop) file="desktop-release.yml" ;;
        *)
            echo "unknown workflow key '${key}' (expected: ci | docker | desktop)" >&2
            printf 'UNKNOWN_WORKFLOW_KEY'
            return 2
            ;;
    esac

    local commits
    commits="$(anchor_commits)"
    if [ -n "$commits" ]; then
        # Anchored: ask by COMMIT, never by branch name. A branch name does not
        # survive the branch being deleted after merge; the commits do. It has to
        # be the whole SET because different runs of one pull request sit on
        # different commits — PR #17 has its CI run at 60c4797 and both dispatch
        # runs at b48699c6.
        local c
        while IFS= read -r c; do
            [ -n "$c" ] || continue
            id="$(_run_id_at "$file" "$event" "$c" "")"
            if [ -n "$id" ]; then
                printf '%s' "$id"
                return 0
            fi
        done <<COMMITS
$commits
COMMITS
        echo "no ${file} run found${event:+ for event ${event}} at any commit of ${ACCEPTANCE_SLUG}'s pull request" >&2
        echo "the workflow must actually have run before this eval can say anything" >&2
        echo "(GitHub deletes runs on its retention schedule; a genuinely expired run is an honest exit 2, not a pass)" >&2
        exit 2
    fi

    id="$(_run_id_at "$file" "$event" "$sha" "$branch")"
    if [ -z "$id" ]; then
        echo "no ${file} run found${event:+ for event ${event}}${sha:+ at commit ${sha}}${branch:+ on branch ${branch}}" >&2
        echo "the workflow must actually have run before this eval can say anything" >&2
        exit 2
    fi
    printf '%s' "$id"
}

# _run_id_at <workflow-file> <event> <sha> <branch>
# The databaseId of the newest matching run, or EMPTY when there is none. Only a
# gh FAILURE exits 2 here: "looked and found none" is a legitimate answer its
# caller interprets (it may have more commits to try), while "could not look" is
# never the caller's to soften.
_run_id_at() {
    local file="$1" event="$2" sha="$3" branch="$4" args runs
    args=(run list --workflow "$file" --limit 20 --json databaseId,headSha,event,status,conclusion)
    [ -n "$event" ] && args+=(--event "$event")
    [ -n "$sha" ] && args+=(--commit "$sha")
    # Without this the newest dispatch on ANY branch answers the query.
    [ -n "$branch" ] && args+=(--branch "$branch")
    if ! runs="$(gh "${args[@]}")"; then
        echo "gh run list failed for ${file} — refusing to guess" >&2
        exit 2
    fi
    printf '%s' "$runs" | jq -r 'sort_by(.databaseId) | reverse | .[0].databaseId // empty'
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
