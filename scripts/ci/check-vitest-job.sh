#!/usr/bin/env bash
# ci-vitest-sdk-pin (CI-a) — guards for AC-1..AC-3.
#
# Usage: check-vitest-job.sh <shape|no-softening|teeth>
#
# 413 vitest tests had no CI job at all (found in conformance-l0 round 6, carried
# in STATUS since 29/07). These guards assert the job exists, cannot be silently
# neutered, and — the half that matters — actually goes red when a test fails.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

WF=.github/workflows/ci.yml
MODE="${1:?usage: check-vitest-job.sh <shape|no-softening|teeth>}"

fail() { echo "FAIL: $*" >&2; exit 1; }

# The job block: from `  unit-tests:` to the next top-level job key. Parsed by
# indentation rather than by name-matching so a renamed step cannot hide inside.
job_block() {
    awk '
        /^  unit-tests:/ { inblock = 1; print; next }
        inblock && /^  [a-z0-9_-]+:/ { inblock = 0 }
        inblock { print }
    ' "$WF"
}

case "$MODE" in
shape)
    # AC-1: exactly one job runs `pnpm test`, with the repo's setup pattern and
    # the same triggers as every other job in this workflow.
    [ -f "$WF" ] || fail "missing $WF"

    runners=$(grep -cE '^\s+run: pnpm test$' "$WF" || true)
    [ "$runners" = "1" ] || fail "expected exactly 1 step running 'pnpm test', found $runners"

    block=$(job_block)
    [ -n "$block" ] || fail "no 'unit-tests:' job in $WF"
    printf '%s\n' "$block" | grep -q 'name: Unit Tests (vitest)' \
        || fail "the unit-tests job is not named 'Unit Tests (vitest)' — config:executors.script.civ_run_jobs_green looks that name up by hand"
    printf '%s\n' "$block" | grep -qE '^\s+run: pnpm test$' \
        || fail "the 'pnpm test' step is not inside the unit-tests job"

    # Same setup pattern as the four jobs that predate it. A job that installs
    # differently is a job that can pass for a reason unrelated to the tests.
    for needle in 'uses: actions/checkout@v7' 'uses: pnpm/action-setup@v4' 'uses: actions/setup-node@v4' 'node-version: 24' 'run: pnpm install'; do
        printf '%s\n' "$block" | grep -q "$needle" \
            || fail "unit-tests job is missing the shared setup line: $needle"
    done

    # Triggers are workflow-level, so the new job inherits them — assert the
    # workflow still carries both, otherwise "it runs on PRs" is an assumption.
    grep -q '^  pull_request:' "$WF" || fail "$WF lost its pull_request trigger"
    grep -q '^  push:' "$WF" || fail "$WF lost its push trigger"
    echo "OK: one 'Unit Tests (vitest)' job runs pnpm test with the shared setup; both triggers intact"
    ;;

no-softening)
    # AC-2: nothing in the job may swallow a non-zero exit. A job that cannot go
    # red is worse than no job — it reports safety it does not provide.
    block=$(job_block)
    [ -n "$block" ] || fail "no 'unit-tests:' job in $WF"
    while IFS= read -r line; do
        case "$line" in
            *continue-on-error*) fail "unit-tests job softens failure: $line" ;;
            *"|| true"*)         fail "unit-tests job softens failure: $line" ;;
            *"set +e"*)          fail "unit-tests job softens failure: $line" ;;
        esac
        # An `if:` on the job or on the pnpm-test step can skip it on pull
        # requests, which is the same outcome as not having the job.
        case "$line" in
            *if:*) fail "unit-tests job carries a conditional that can skip it: $line" ;;
        esac
    done <<<"$block"
    echo "OK: no continue-on-error / || true / set +e / if: inside the unit-tests job"
    ;;

teeth)
    # AC-3: prove the command THE JOB RUNS actually fails on a failing test.
    #
    # The command is READ OUT OF ci.yml, never hardcoded here. An earlier version
    # ran `pnpm test` directly and the clean-context verifier caught it: that
    # version stayed green on a tree with no CI job at all, so it proved the test
    # runner had teeth while saying nothing about the job. Deriving the command
    # from the workflow is what ties this criterion back to CI.
    block=$(job_block)
    [ -n "$block" ] || fail "no 'unit-tests:' job in $WF — nothing to prove teeth about"
    job_cmd=$(printf '%s\n' "$block" | sed -n 's/^[[:space:]]*run:[[:space:]]*\(pnpm .*\)$/\1/p' | tail -1)
    [ -n "$job_cmd" ] || fail "could not read a run: command out of the unit-tests job in $WF"
    echo "job command under test (read from $WF): $job_cmd"

    # In-process perturbation: a temp spec file inside the repo (so vitest picks
    # it up), removed on every exit path — the tree is never left dirty.
    probe="src/__civ_teeth_probe.test.ts"
    cleanup() { rm -f "$probe"; }
    trap cleanup EXIT
    [ -e "$probe" ] && fail "$probe already exists — refusing to clobber it"

    cat >"$probe" <<'EOF'
// Temporary perturbation written by scripts/ci/check-vitest-job.sh (teeth mode).
// If you are reading this in a commit, the guard crashed mid-run — delete it.
import { expect, test } from "vitest";
test("civ teeth probe — intentional failure", () => {
  expect(1).toBe(2);
});
EOF

    set +e
    eval "$job_cmd" >/tmp/civ-teeth-red.log 2>&1
    red_rc=$?
    set -e
    [ "$red_rc" -ne 0 ] \
        || fail "'$job_cmd' exited 0 with a deliberately failing test present — the CI job would be vacuous"

    cleanup
    trap - EXIT
    set +e
    eval "$job_cmd" >/tmp/civ-teeth-green.log 2>&1
    green_rc=$?
    set -e
    [ "$green_rc" -eq 0 ] \
        || fail "'$job_cmd' did not return to a passing state after the probe was removed (exit $green_rc)"

    echo "OK: '$job_cmd' (from $WF) fails with the probe present and passes once removed — the job has teeth"
    ;;

*)
    fail "unknown mode '$MODE' (shape|no-softening|teeth)"
    ;;
esac
