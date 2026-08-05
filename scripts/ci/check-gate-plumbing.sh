#!/usr/bin/env bash
# AC-2: checkout@v7 with fetch-depth: 0 still gives pre-merge-check.sh a base.
#
# Deliberately NOT "the Acceptance Gate job is green". That job runs the gate
# itself, so its colour is dominated by acceptance bookkeeping — a feature
# awaiting its Gate 2 signature makes it red no matter how well git behaved. A
# criterion phrased that way could only be satisfied after the signature, which
# is circular for evidence that must exist BEFORE the signature.
#
# What the checkout bump can actually be held to: the gate reached acceptance
# logic at all. That means the base ref resolved and a real per-feature verdict
# came out, rather than a plumbing complaint about shallow history.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci/gh-run-lib.sh
. "$DIR/gh-run-lib.sh"

JOB_NAME="Acceptance Gate"

require_gh
SHA="$(head_sha)"
RUN_ID="$(find_run ci "" "$SHA")"
JSON="$(run_json "$RUN_ID")"
assert_run_finished "$JSON"

JOB_ID="$(printf '%s' "$JSON" | jq -r --arg n "$JOB_NAME" '.jobs[] | select(.name == $n) | .databaseId')"
if [ -z "$JOB_ID" ] || [ "$JOB_ID" = "null" ]; then
    echo "no '${JOB_NAME}' job in the run found for this feature — nothing to inspect" >&2
    exit 2
fi

# Report the commit the RUN actually ran at, not the local head: anchored, the
# run is a historical one and labelling it with wherever this branch happens to
# sit would make the evidence say something false.
RUN_SHA="$(printf '%s' "$JSON" | jq -r '.headSha')"
echo "run $(printf '%s' "$JSON" | jq -r '.url') @ ${RUN_SHA}"

log=""
if ! log="$(gh run view --job "$JOB_ID" --log 2>&1)"; then
    echo "could not read the ${JOB_NAME} log — refusing to report the plumbing sound" >&2
    exit 2
fi

# grep without -q throughout: -q exits on first match and kills printf with
# SIGPIPE under pipefail, so a match can report as a miss. See check-ghcr-untouched.sh.
fail=0

if printf '%s' "$log" | grep -E 'fetch-depth: 0' >/dev/null; then
    echo "ok  checkout ran with fetch-depth: 0"
else
    echo "could not confirm fetch-depth: 0 in the job log — refusing to answer" >&2
    exit 2
fi

if printf '%s' "$log" | grep -E 'actions/checkout@v7' >/dev/null; then
    echo "ok  the checkout under test is v7"
else
    echo "FAIL: this job did not run actions/checkout@v7" >&2
    fail=1
fi

# The gate reached acceptance logic: at least one per-feature verdict line.
verdicts="$(printf '%s' "$log" | grep -cE '(OK|VIOLATION) \[' || true)"
if [ "$verdicts" -lt 1 ]; then
    echo "FAIL: pre-merge-check emitted no per-feature verdict — it never got past git" >&2
    fail=1
else
    echo "ok  pre-merge-check emitted ${verdicts} per-feature verdict line(s)"
fi

# And it failed for no plumbing reason.
plumbing="$(printf '%s' "$log" \
    | grep -inE 'cannot resolve base|fatal: bad revision|unknown revision|not a git repository|does not have any commits|shallow' || true)"
if [ -n "$plumbing" ]; then
    echo "FAIL: git plumbing complaints in the gate job:" >&2
    printf '%s\n' "$plumbing" | head -5 >&2
    fail=1
else
    echo "ok  no shallow-history or unresolvable-base complaint anywhere in the log"
fi

[ "$fail" -eq 0 ] || exit 1
echo "fetch-depth: 0 under checkout@v7 gave pre-merge-check.sh a usable base at ${RUN_SHA}"
