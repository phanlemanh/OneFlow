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

# The library's own real-estate vocabulary, as string literals.
VOCAB='noi-that|ngoai-canh|flycam|tien-ich|cong-truong|duong-pho|du-an|phan-khu|cung-truc|cung-layout|cung-tang|cung-toa|dung-can|render-3d|scale-model|real-model|full-noi-that|co-ban'
# shellcheck disable=SC2086
HITS="$(grep -nE "\"($VOCAB)\"|'($VOCAB)'" $FILES || true)"

# The eight fields that must stay opaque `string`. A closed union on any of them
# is the same failure written as a type instead of a comparison.
FIELDS='provenance|scene_kind|kind|specificity|energy|interior_state|license_label|slot_role'
# shellcheck disable=SC2086
UNIONS="$(grep -nE "($FIELDS)\??[[:space:]]*:[[:space:]]*\"[^\"]+\"[[:space:]]*\|" $FILES || true)"

if [ -n "$HITS$UNIONS" ]; then
    echo "FAIL: domain vocabulary hardcoded on the OneFlow side:"
    [ -n "$HITS" ] && echo "$HITS"
    [ -n "$UNIONS" ] && echo "$UNIONS"
    exit 1
fi

echo "no domain vocabulary in $(echo "$FILES" | wc -l | tr -d ' ') changed files (8 fields checked, 18 literals checked)"
