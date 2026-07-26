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
declared_pins=0

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

    # An action pin. Matched against the two bumps this contract declares, ref
    # and all — not merely "it is a uses: line", and not merely "the action path
    # is unchanged". Pairing on the path alone let a pin move to a mutable
    # branch (@main) or to an unrelated version, which is a standing
    # supply-chain change wearing a version bump's clothes.
    case "$trimmed" in
        uses:*|-\ uses:*)
            pin="${trimmed#- }"; pin="${pin#uses:}"
            pin="${pin#"${pin%%[![:space:]]*}"}"
            case "${line:0:1}${pin}" in
                "-actions/checkout@v4"|"+actions/checkout@v7") declared_pins=$((declared_pins + 1)); continue ;;
                "-docker/login-action@v3"|"+docker/login-action@v4") declared_pins=$((declared_pins + 1)); continue ;;
            esac
            offenders="${offenders}${line}   <- not a declared bump"$'\n'
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

if [ "$guard_removed" -gt 1 ] || [ "$guard_added" -gt 1 ]; then
    echo "FAIL: the declared guard is one removed and one added line; saw -${guard_removed} +${guard_added}" >&2
    exit 1
fi

# A workflow file added, deleted or renamed changes what CI does without
# changing a line inside it — moving ci.yml aside disables the suite entirely.
if ! names="$(git diff --name-status "${BASE}...HEAD" -- "$WF_DIR")"; then
    echo "git diff --name-status failed — refusing to report no drift" >&2
    exit 2
fi
notmod="$(printf '%s' "$names" | grep -vE '^M' || true)"
if [ -n "$notmod" ]; then
    echo "FAIL: workflow files added, deleted or renamed:" >&2
    printf '%s\n' "$notmod" >&2
    exit 1
fi

echo "workflow drift vs ${BASE}: ${declared_pins} declared pin line(s), comments, and the dry-run guard (-${guard_removed} +${guard_added}); no file added, deleted or renamed"
