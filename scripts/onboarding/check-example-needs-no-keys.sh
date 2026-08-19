#!/usr/bin/env bash
# E1 / AC-1 — the bundled example demands no API key from anyone.
#
# BOTH halves run here, in this one command. The green half on its own is a
# claim about absence, and absence is exactly what a broken checker reports
# for free. So the red half re-runs the same checker against the example this
# branch replaced — the pre-2026-08-07 Modal workflow, read straight out of
# git history — and that run MUST fail. If it passes, the checker is not
# looking and the green verdict above means nothing.
#
# The length floor inside the checker is the other half of the same idea: a
# parser returning an empty set would satisfy "every plugin needs no key"
# vacuously, so the ids are printed and counted.
#
# Pass a workflow path to check just that file (used by the red half below).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if [ "$#" -gt 0 ]; then
    exec node scripts/onboarding/example-needs-no-keys.mjs "$1"
fi

echo "== green half: the shipped example must need no key =="
node scripts/onboarding/example-needs-no-keys.mjs public/example.json

echo
echo "== red half: the Modal example this branch replaced must be caught =="
BASE_REF="${BKO_BASE_REF:-origin/main}"
OLD="$(mktemp -t bko-old-example)"
trap 'rm -f "$OLD"' EXIT

if ! MERGE_BASE="$(git merge-base "$BASE_REF" HEAD 2>/dev/null)"; then
    echo "FAIL: cannot resolve $BASE_REF, so the red half cannot run and the"
    echo "      green verdict above is unproven. Set BKO_BASE_REF."
    exit 1
fi
if ! git show "$MERGE_BASE:public/example.json" > "$OLD" 2>/dev/null; then
    echo "FAIL: no public/example.json at $MERGE_BASE — nothing to prove the"
    echo "      checker can go red on."
    exit 1
fi

if node scripts/onboarding/example-needs-no-keys.mjs "$OLD"; then
    echo
    echo "FAIL: the checker passed the OLD Modal example. That workflow is"
    echo "      pinned to plugins requiring a Modal account, so a checker that"
    echo "      clears it is not reading env manifests at all."
    exit 1
fi

echo
echo "ok — new example key-free, old Modal example caught"
