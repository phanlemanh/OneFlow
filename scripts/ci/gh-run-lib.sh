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

# Values that can never be a commit sha, a range, or a run id. Each exists
# because `exit` inside a pipeline or command substitution — how every one of
# these helpers is reached — kills only that subshell, so a refusal has to travel
# as DATA to reach the decision. See _own_range and _run_id_at.
LOOKUP_FAILED="LOOKUP_FAILED"
# A value that can never be a commit sha or a range. See _own_range.
ANCHOR_UNRESOLVED="ANCHOR_UNRESOLVED"

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
        # The `exit` below only kills THIS shell, and every caller reaches this
        # function through a pipeline or a command substitution — both subshells.
        # Today the guards still stop, but only because each of them runs under
        # `set -euo pipefail` and the failed substitution aborts them: the
        # fail-closed property is inherited from the callers rather than owned
        # here. So emit a POISON value as well. It cannot be mistaken for a
        # commit, and every consumer below refuses it explicitly — the same
        # tactic find_run already uses for UNKNOWN_WORKFLOW_KEY, and for the same
        # reason (see its comment: `exit` inside a command substitution kills
        # only its own subshell).
        printf '%s' "$ANCHOR_UNRESOLVED"
        exit 2
    fi
    printf '%s' "$out"
}

# anchor_commits — the commit set this feature's pull request owns, newest
# first, or nothing when unanchored. An unresolvable anchor propagates the poison
# value rather than an empty list: empty is indistinguishable from "unanchored",
# which would send find_run down its by-branch path and answer with a run
# belonging to whatever branch this happens to be — precisely the wrong-pull-
# request reading this whole contract exists to end.
anchor_commits() {
    local out
    out="$(_own_range)"
    case "$out" in
        "$ANCHOR_UNRESOLVED"*)
            printf '%s\n' "$ANCHOR_UNRESOLVED"
            return 2
            ;;
    esac
    printf '%s' "$out" | sed -n 's/^commits=//p' | tr ' ' '\n' | grep -v '^$'
}

# anchor_landed — the landed merge sha when this feature actually HAS one, empty
# otherwise. Deliberately NOT the same question as anchor_tip: an anchored but
# still-open feature has a tip (its HEAD) and no landing moment at all. Anything
# that means "when this feature came to rest" must ask THIS, because keying such
# a question on "was a slug supplied" silently answers it with today's HEAD.
anchor_landed() {
    [ -n "${ACCEPTANCE_SLUG:-}" ] || return 0
    local dir out
    dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../acceptance" && pwd)"
    if ! out="$(bash "$dir/own-range.sh" "$ACCEPTANCE_SLUG" --print-anchor)"; then
        echo "could not read the anchor of '${ACCEPTANCE_SLUG}'" >&2
        printf '%s' "$ANCHOR_UNRESOLVED"
        return 2
    fi
    printf '%s' "$out"
}

# assert_window_sane <since> <until> — both ISO-8601 UTC (trailing Z), <until>
# may be empty for an open-ended window.
#
# A window whose end precedes its start selects nothing, and "selected nothing"
# is indistinguishable from "nothing happened" at the point of decision. That is
# not a clean result, it is an unanswerable question, so it exits 2. Both bounds
# are normalised to Z before they get here; comparing mixed offsets as strings is
# its own bug (see check-ghcr-untouched.sh).
assert_window_sane() {
    local since="$1" until="$2"
    [ -n "$until" ] || return 0
    if [ "$until" \< "$since" ]; then
        echo "the observation window [${since} .. ${until}] ends before it starts, so it can never select anything" >&2
        echo "refusing to read an impossible window as evidence that nothing happened" >&2
        exit 2
    fi
}

# anchor_tip — the commit that plays HEAD's role. The provenance checks in
# check-dispatch-run.sh and check-ghcr-untouched.sh compare a run's workflow
# tree against "the tree that got merged"; on a later branch that is the anchor,
# not HEAD, and comparing against HEAD would fail them for a second, unrelated
# reason after the run lookup itself was fixed.
anchor_tip() {
    local out to
    # Branch on whether an anchor was ASKED FOR, never on whether resolving it
    # produced output. Keying on emptiness meant an unresolvable anchor fell
    # through to the local HEAD — silently comparing a historical run against
    # whatever tree this branch is sitting on.
    if [ -z "${ACCEPTANCE_SLUG:-}" ]; then
        head_sha
        return 0
    fi
    out="$(_own_range)"
    to="$(printf '%s' "$out" | sed -n 's/^range_to=//p')"
    case "$out" in "$ANCHOR_UNRESOLVED"*) to="" ;; esac
    if [ -z "$to" ]; then
        echo "could not resolve the anchor tip for '${ACCEPTANCE_SLUG}' — refusing to fall back to the local HEAD" >&2
        exit 2
    fi
    printf '%s' "$to"
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
            if [ "$id" = "$LOOKUP_FAILED" ]; then
                echo "could not query runs for ${ACCEPTANCE_SLUG} at commit ${c} — refusing to move on to another commit and grade whatever it finds there" >&2
                exit 2
            fi
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
    if [ "$id" = "$LOOKUP_FAILED" ]; then
        echo "could not query ${file} runs — refusing to report anything about them" >&2
        exit 2
    fi
    if [ -z "$id" ]; then
        echo "no ${file} run found${event:+ for event ${event}}${sha:+ at commit ${sha}}${branch:+ on branch ${branch}}" >&2
        echo "the workflow must actually have run before this eval can say anything" >&2
        exit 2
    fi
    printf '%s' "$id"
}

# _run_id_at <workflow-file> <event> <sha> <branch>
# The databaseId of the newest matching run; EMPTY when the query succeeded and
# matched nothing; the poison value $LOOKUP_FAILED when gh itself failed.
#
# Those last two must stay distinguishable, and a bare `exit 2` cannot keep them
# apart here: both call sites are command substitutions, where `exit` ends only
# its own subshell and leaves the caller holding an empty string. The anchored
# loop would then read "the rate limiter bit at commit A" as "no run at commit A"
# and happily return a run from commit B — a DIFFERENT run of the same pull
# request, graded green, with the refusal printed to stderr and discarded. Third
# time this file has needed a poison value for the same reason; see
# UNKNOWN_WORKFLOW_KEY and ANCHOR_UNRESOLVED above.
_run_id_at() {
    local file="$1" event="$2" sha="$3" branch="$4" args runs
    args=(run list --workflow "$file" --limit 20 --json databaseId,headSha,event,status,conclusion)
    [ -n "$event" ] && args+=(--event "$event")
    [ -n "$sha" ] && args+=(--commit "$sha")
    # Without this the newest dispatch on ANY branch answers the query.
    [ -n "$branch" ] && args+=(--branch "$branch")
    if ! runs="$(gh "${args[@]}")"; then
        echo "gh run list failed for ${file}${sha:+ at commit ${sha}} — refusing to guess" >&2
        printf '%s' "$LOOKUP_FAILED"
        return 2
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
