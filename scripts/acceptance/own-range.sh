#!/usr/bin/env bash
# The ONE place that knows what commit range a feature owns.
#
# After a feature merges, an eval that asks "did MY pull request touch config/?"
# still has a truthful answer — but only if it asks about its own pull request.
# Re-run on a later branch it grades somebody else's diff, which is how three
# signed features ended up permanently red on feat/compose-overlay. The rule is
# written here and NOWHERE else: guards call this and use what it prints. Seven
# copies of one concept cost compose-overlay three verify rounds; this is the
# correction, not a second copy of it.
#
# Usage:  own-range.sh <slug> [--root <path>] [--print-anchor]
# Output: range_from=<sha>
#         range_to=<sha>
#         commits=<sha> <sha> ...      (newest first; the pull request's own commits)
#
# Exit 0 = resolved. Exit 2 = could not look (a broken anchor, a missing
# contract, no git). There is deliberately no exit 1: this script never renders a
# verdict, it only answers where to look — and "I cannot tell you" must never be
# readable as "clean" (the rule scripts/ci/gh-run-lib.sh was hardened for).
set -u

SLUG=""
ROOT=""
PRINT_ANCHOR=0
while [ "$#" -gt 0 ]; do
    case "$1" in
        --root) ROOT="${2:-}"; shift 2 ;;
        --print-anchor) PRINT_ANCHOR=1; shift ;;
        -*) echo "unknown option '$1'" >&2; exit 2 ;;
        *)
            [ -z "$SLUG" ] || { echo "unexpected argument '$1'" >&2; exit 2; }
            SLUG="$1"; shift
            ;;
    esac
done
[ -n "$SLUG" ] || { echo "usage: $(basename "$0") <slug> [--root <path>]" >&2; exit 2; }
if [ -z "$ROOT" ]; then
    ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fi

command -v git >/dev/null 2>&1 || { echo "git not found — cannot resolve a range" >&2; exit 2; }
git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1 || {
    echo "'$ROOT' is not a git repository — cannot resolve a range" >&2
    exit 2
}

CONTRACT="$ROOT/_acceptance/$SLUG/contract.md"
[ -f "$CONTRACT" ] || {
    echo "no contract at ${CONTRACT} — cannot resolve the anchor for '${SLUG}'" >&2
    exit 2
}

# Twin of front_field() in scripts/pre-merge-check.sh: reads the LEADING
# frontmatter block only, so a decoy in the body cannot poison the answer.
# test-own-range.sh's malformed case pins the two readers to the same result on a
# contract built to trip a sloppy one, so drift between them is red rather than a
# silently different anchor.
front_field() { # <file> <key>
    awk '!f && NF==0 {next} !f && /^---[[:space:]]*$/ {f=1; next} !f {exit} /^---[[:space:]]*$/ {exit} {print}' "$1" \
        | sed -n "s/^${2}:[[:space:]]*//p" | head -1 \
        | sed -e 's/[[:space:]]*#.*$//' -e 's/^["'"'"']//' -e 's/["'"'"']$//' -e 's/[[:space:]]*$//'
}

ANCHOR="$(front_field "$CONTRACT" landed_merge)"
if [ "$PRINT_ANCHOR" -eq 1 ]; then
    printf '%s' "$ANCHOR"
    exit 0
fi

if [ -z "$ANCHOR" ]; then
    # Unlanded: the feature is still an open pull request, so what it owns is what
    # it has added since it left the main line. Byte-compatible with what every
    # guard does today, which is why an open pull request sees no change at all.
    main_ref="${MAIN_REF:-origin/main}"
    if ! git -C "$ROOT" rev-parse --verify --quiet "${main_ref}^{commit}" >/dev/null 2>&1; then
        if git -C "$ROOT" rev-parse --verify --quiet "main^{commit}" >/dev/null 2>&1; then
            main_ref="main"
        else
            echo "cannot resolve the main ref ('${MAIN_REF:-origin/main}') — fetch it first (CI needs fetch-depth: 0)" >&2
            exit 2
        fi
    fi
    if ! from="$(git -C "$ROOT" merge-base HEAD "$main_ref" 2>/dev/null)"; then
        echo "no merge base between HEAD and ${main_ref} — refusing to guess a range" >&2
        exit 2
    fi
    to="$(git -C "$ROOT" rev-parse HEAD)"
    printf 'range_from=%s\n' "$from"
    printf 'range_to=%s\n' "$to"
    printf 'commits=%s\n' "$(git -C "$ROOT" rev-list "${from}..${to}" | tr '\n' ' ' | sed 's/ $//')"
    exit 0
fi

# Landed: the anchor must be the MERGE commit that carried the feature in. Its
# first parent is the main line before it and its second parent is the pull
# request tip, so ^1..^2 is exactly the pull request's own commits and
# ^1..<anchor> is exactly the diff the merge introduced. A squash-landed pull
# request has no second parent and is refused loudly rather than approximated.
if ! git -C "$ROOT" rev-parse --verify --quiet "${ANCHOR}^{commit}" >/dev/null 2>&1; then
    echo "landed_merge '${ANCHOR}' (contract of '${SLUG}') is not a commit in this clone" >&2
    echo "a shallow fetch, or an anchor written wrong — refusing to guess a range" >&2
    exit 2
fi
if ! tip="$(git -C "$ROOT" rev-parse --verify --quiet "${ANCHOR}^2" 2>/dev/null)"; then
    echo "landed_merge '${ANCHOR}' is not a merge commit (it has no second parent)" >&2
    echo "a squash-landed pull request has no commit set to anchor to — write the merge commit, or leave landed_merge out" >&2
    exit 2
fi
base="$(git -C "$ROOT" rev-parse "${ANCHOR}^1")"
printf 'range_from=%s\n' "$base"
printf 'range_to=%s\n' "$(git -C "$ROOT" rev-parse "$ANCHOR")"
printf 'commits=%s\n' "$(git -C "$ROOT" rev-list "${base}..${tip}" | tr '\n' ' ' | sed 's/ $//')"
