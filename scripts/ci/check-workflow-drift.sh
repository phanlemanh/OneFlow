#!/usr/bin/env bash
# AC-8: a version bump must not carry behaviour with it.
#
# Classifies every changed line under .github/workflows. Only three kinds are
# allowed through: a `uses:` pin, a comment, and the one `push:` line the
# contract declares as the docker-publish dry-run guard. Anything else — a
# trigger, a permission, a job, an input — fails, because that is the shape a
# behaviour change smuggled inside a bump would take.
#
# Every failure mode exits non-zero on purpose; see scripts/deps/check-no-t3-drift.sh
# for why a guard that can announce "clean" without looking is worse than none.
set -euo pipefail

BASE="${1:-origin/main}"
WF_DIR=".github/workflows"

if ! git rev-parse --verify --quiet "${BASE}^{commit}" >/dev/null; then
    echo "cannot resolve base ref '${BASE}' — fetch it first (CI needs fetch-depth: 0)" >&2
    exit 2
fi

if ! diff="$(git diff --unified=0 "${BASE}...HEAD" -- "$WF_DIR")"; then
    echo "git diff against '${BASE}' failed — refusing to report no drift" >&2
    exit 2
fi

if [ -z "$diff" ]; then
    echo "no workflow changes vs ${BASE}"
    exit 0
fi

guard_lines=0
offenders=""

while IFS= read -r line; do
    case "$line" in
        # Diff bookkeeping, not content.
        +++*|---*) continue ;;
    esac
    case "$line" in
        +*|-*) ;;
        *) continue ;;
    esac

    content="${line:1}"
    trimmed="${content#"${content%%[![:space:]]*}"}"

    # Blank and comment lines cannot change behaviour.
    [ -z "$trimmed" ] && continue
    case "$trimmed" in
        \#*) continue ;;
    esac

    # An action pin.
    case "$trimmed" in
        uses:*|-\ uses:*) continue ;;
    esac

    # The declared dry-run guard: exactly one added and one removed `push:`.
    # Only the input form (a value on the same line) counts — a bare `push:` is
    # the workflow TRIGGER, and changing that is precisely the behaviour drift
    # this check exists to catch.
    case "$trimmed" in
        push:*[!' ']*)
            guard_lines=$((guard_lines + 1))
            continue
            ;;
    esac

    offenders="${offenders}${line}"$'\n'
done <<<"$diff"

if [ -n "$offenders" ]; then
    echo "FAIL: workflow lines changed that are neither a pin nor the declared guard:" >&2
    printf '%s' "$offenders" >&2
    exit 1
fi

if [ "$guard_lines" -gt 2 ]; then
    echo "FAIL: ${guard_lines} 'push:' lines changed; the contract declares exactly one guard (one -, one +)" >&2
    exit 1
fi

echo "workflow drift vs ${BASE}: pins and comments only, plus the declared dry-run guard (${guard_lines} push: line(s))"
