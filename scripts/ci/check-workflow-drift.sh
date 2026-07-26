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

guard_removed=0
guard_added=0
offenders=""
cur_file=""
added_actions=""
removed_actions=""

while IFS= read -r line; do
    # Track which file we are inside; a budget not tied to a file lets a stray
    # `push:` anywhere in any workflow spend the guard's allowance.
    case "$line" in
        +++\ b/*) cur_file="${line#+++ b/}"; continue ;;
        # Only the real file header, not any removed line that starts with "--".
        ---\ a/*|---\ /dev/null) continue ;;
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

    # An action pin. Collected by ACTION, not waved through: "it is a uses: line"
    # was the whole test, so inserting a brand-new step, swapping the publisher,
    # or deleting a step all read as "pins only". Additions and removals are
    # paired by action path below.
    case "$trimmed" in
        uses:*|-\ uses:*)
            pin="${trimmed#- }"; pin="${pin#uses:}"
            pin="${pin#"${pin%%[![:space:]]*}"}"
            action="${pin%%@*}"
            if [ "${line:0:1}" = "+" ]; then
                added_actions="${added_actions}${action}"$'\n'
            else
                removed_actions="${removed_actions}${action}"$'\n'
            fi
            continue
            ;;
    esac

    # The declared dry-run guard, and nothing else wearing its clothes: right
    # file, right sign, exact value. A budget of "two push: lines somewhere" is
    # spent by any stray `push: true`, and a bare `push:` is the TRIGGER.
    if [ "$cur_file" = ".github/workflows/docker-publish.yml" ]; then
        case "${line:0:1}${trimmed}" in
            "-push: true")
                guard_removed=$((guard_removed + 1)); continue ;;
            "+push: \${{ github.ref_type == 'tag' }}")
                guard_added=$((guard_added + 1)); continue ;;
        esac
    fi

    offenders="${offenders}${line}"$'\n'
done <<<"$diff"

if [ -n "$offenders" ]; then
    echo "FAIL: workflow lines changed that are neither a pin nor the declared guard:" >&2
    printf '%s' "$offenders" >&2
    exit 1
fi

# Every added pin must replace a removed pin of the SAME action. A version bump
# is a matched pair; a new step, a publisher swap, and a deleted step each leave
# an unmatched side. Without this, "every changed line is a uses: pin" is true of
# a diff that inserts `- uses: evil/exfiltrate@v1`.
only_in() {
    comm -23 <(printf '%s' "$1" | sort) <(printf '%s' "$2" | sort)
}
new_actions="$(only_in "$added_actions" "$removed_actions")"
gone_actions="$(only_in "$removed_actions" "$added_actions")"

if [ -n "$new_actions" ]; then
    echo "FAIL: action(s) added that replace nothing — a bump pairs each addition with a removal:" >&2
    printf '%s\n' "$new_actions" >&2
    exit 1
fi
if [ -n "$gone_actions" ]; then
    echo "FAIL: action(s) removed with no replacement:" >&2
    printf '%s\n' "$gone_actions" >&2
    exit 1
fi

if [ "$guard_removed" -gt 1 ] || [ "$guard_added" -gt 1 ]; then
    echo "FAIL: the declared guard is one removed and one added line; saw -${guard_removed} +${guard_added}" >&2
    exit 1
fi

pairs="$(printf '%s' "$added_actions" | grep -c . || true)"
echo "workflow drift vs ${BASE}: ${pairs} matched pin pair(s), comments, and the declared dry-run guard (-${guard_removed} +${guard_added})"
