#!/usr/bin/env bash
# E12 — ADR-0012 guarantee #3: domain vocabulary crosses the boundary as DATA.
#
# Scope is derived from the BRANCH DIFF, never from a hand-written file list. A
# hand list can only ever name files that already exist, so an implementer who
# puts the offending switch in a file nobody has named yet slips straight past
# it. The diff window contains every file this branch adds or edits, named or
# not.
#
# ROOT is derived from this script's own location, never from cwd.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

BASE="${1:-origin/main}"
MERGE_BASE="$(git merge-base "$BASE" HEAD)"

FILES="$(
    {
        git diff --name-only "$MERGE_BASE"...HEAD
        git diff --name-only HEAD
        git ls-files --others --exclude-standard
    } | sort -u | grep -E '^src/.*\.(ts|tsx)$' | grep -v '__fixtures__' || true
)"

# An empty window makes every absence claim vacuous: "no vocabulary anywhere" is
# trivially true of a diff that touches nothing.
if [ -z "$FILES" ]; then
    echo "FAIL: empty diff window against $BASE — an absence claim over nothing proves nothing"
    exit 1
fi

# The library's own real-estate vocabulary, as string literals — an ARRAY, so
# each entry is checked on its own pass and the printed count is derived from
# the list rather than typed into the echo. The previous shape ran two greps
# with an alternation and then printed a hardcoded "8 fields, 18 literals":
# deleting an entry changed nothing that anyone could see, and the evidence line
# went on claiming both numbers.
VOCAB=(noi-that ngoai-canh flycam tien-ich cong-truong duong-pho du-an phan-khu
       cung-truc cung-layout cung-tang cung-toa dung-can render-3d scale-model
       real-model full-noi-that co-ban)
# The fields that must stay opaque `string`. A closed union on any of them is
# the same failure written as a type instead of a comparison.
FIELDS=(provenance scene_kind kind specificity energy interior_state
        license_label slot_role)

FAILURES=""
for literal in "${VOCAB[@]}"; do
    # shellcheck disable=SC2086
    hit="$(grep -nE "\"$literal\"|'$literal'" $FILES || true)"
    [ -n "$hit" ] && FAILURES="$FAILURES\nliteral '$literal':\n$hit"
done

for field in "${FIELDS[@]}"; do
    # Both quote styles, matching the literal scan above — the union check used
    # to accept only double quotes, so a single-quoted union walked past it.
    # shellcheck disable=SC2086
    hit="$(grep -nE "$field\\??[[:space:]]*:[[:space:]]*(\"[^\"]+\"|'[^']+')[[:space:]]*\\|" $FILES || true)"
    [ -n "$hit" ] && FAILURES="$FAILURES\nclosed union on '$field':\n$hit"
done

if [ -n "$FAILURES" ]; then
    echo "FAIL: domain vocabulary hardcoded on the OneFlow side:"
    printf '%b\n' "$FAILURES"
    exit 1
fi

echo "no domain vocabulary in $(echo "$FILES" | wc -l | tr -d ' ') changed files (${#FIELDS[@]} fields checked, ${#VOCAB[@]} literals checked)"
