#!/usr/bin/env bash
# Prove the TS<->Python conformance suite actually discriminates.
#
# A green suite means nothing until you have watched it go red for the right
# reason. Two perturbation kinds, because they fail differently:
#
#   (a) call count      - the drift this slice exists to remove. If perturbing
#                         it leaves the suite green, the suite is not comparing
#                         how many calls each side makes.
#   (b) an extra field  - a business field OTHER than the batch field, added on
#                         one side only. If that leaves the suite green, the
#                         call-log is comparing some narrow subset that happens
#                         to agree, and the drift that matters later (one side
#                         injecting a plugin default) walks straight through.
#
# Perturbations are applied to a scratch copy under a temp dir. The working tree
# is never modified, so a failed run cannot leave the repo mutated.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PYTEST='PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q tests/conformance'

fresh_copy() {
    rm -rf "$WORK/sdk"
    cp -R "$REPO_ROOT/sdk" "$WORK/sdk"
}

# Echoes 0 when the suite passes, 1 when it fails. Never aborts the script:
# a red suite is the expected outcome half the time here.
suite_status() {
    if ( cd "$WORK/sdk" && eval "$PYTEST" ) >/dev/null 2>&1; then echo 0; else echo 1; fi
}

# A substitution that silently matches nothing would let this script report
# success while testing nothing at all - the exact failure mode it exists to
# prevent. So every perturbation asserts that it landed.
assert_applied() {
    local needle="$1" file="$2" label="$3"
    grep -q "$needle" "$file" || {
        echo "FAIL: perturbation ${label} did not apply - the guard is checking nothing"
        exit 1
    }
}

echo "==> baseline: the suite must be GREEN"
fresh_copy
[ "$(suite_status)" = "0" ] || { echo "FAIL: suite is red before any perturbation"; exit 1; }
echo "    green"

echo "==> perturbation (a): drop one item from the fan-out"
fresh_copy
perl -0pi -e 's/\Qreturn [{**params, field: item} for item in value]\E/return [{**params, field: item} for item in value[:-1]]/' \
    "$WORK/sdk/tongflow/engine/batch.py"
assert_applied 'value\[:-1\]' "$WORK/sdk/tongflow/engine/batch.py" "(a)"
[ "$(suite_status)" = "1" ] || {
    echo "FAIL: suite stayed green with a wrong call count - it is not comparing call counts"
    exit 1
}
echo "    went RED as required"

echo "==> perturbation (b): add a business field on the Python side only"
fresh_copy
perl -0pi -e 's/\Q    return {"slot": slot, "input": out}\E/    out["__mutant_field"] = "x"\n    return {"slot": slot, "input": out}/' \
    "$WORK/sdk/tongflow/engine/callog.py"
assert_applied '__mutant_field' "$WORK/sdk/tongflow/engine/callog.py" "(b)"
[ "$(suite_status)" = "1" ] || {
    echo "FAIL: suite stayed green with an extra field on one side - the call-log compares a narrow subset"
    exit 1
}
echo "    went RED as required"

echo "==> perturbation (c): corrupt a fixture and run the TypeScript half"
# (a) and (b) both prove things about the Python half. This one proves the
# TypeScript half is not a no-op: it must read these fixture files and actually
# assert against them. The fixture directory is redirected at a mutated copy, so
# the working tree stays untouched here too.
fresh_copy
perl -0pi -e 's/"text": "hai"/"text": "KHONG-PHAI-GIA-TRI-NAY"/' \
    "$WORK/sdk/tests/conformance/fixtures/batch-basic.json"
assert_applied 'KHONG-PHAI-GIA-TRI-NAY' \
    "$WORK/sdk/tests/conformance/fixtures/batch-basic.json" "(c)"
if ( cd "$REPO_ROOT" && CONFORMANCE_FIXTURES="$WORK/sdk/tests/conformance/fixtures" \
        pnpm vitest run src/lib/abi/conformance.test.ts ) >/dev/null 2>&1; then
    echo "FAIL: the TypeScript half stayed green against a corrupted fixture - it is not asserting"
    exit 1
fi
echo "    went RED as required"

echo "==> revert: both halves must be GREEN again"
fresh_copy
[ "$(suite_status)" = "0" ] || { echo "FAIL: Python half did not return to green after reverting"; exit 1; }
( cd "$REPO_ROOT" && pnpm vitest run src/lib/abi/conformance.test.ts ) >/dev/null 2>&1 || {
    echo "FAIL: TypeScript half did not return to green after reverting"
    exit 1
}
echo "    green"

echo "OK: the conformance suite discriminates on all three perturbation kinds"
