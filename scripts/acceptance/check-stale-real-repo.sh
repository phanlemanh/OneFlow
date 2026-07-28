#!/usr/bin/env bash
# E14 / AC-10: run the finished gate against THIS repo at two pinned SHAs and
# assert conformance-l0 — the only feature that declares paths, written before
# this rule existed — is refused narrow scope for exactly six files.
#
# Refs are literal SHAs, not branch names: merging PR #25 or adding one src/**
# file to the branch would otherwise move the answer and redden a correct
# implementation.
#
# The split that matters: the EXECUTABLE LOGIC (pre-merge-check.sh,
# recheck-evidence.js, lib/evidence-core.js) is read from HERE — the current
# working tree at HEAD of this branch — because that is the finished
# mechanism under test. The _acceptance/ tree, the git history, and the files
# the gate globs against all come from a worktree checked out at HEAD_SHA, a
# commit that predates this branch and still carries conformance-l0's
# declaration untouched. Running the OLD script that lived at HEAD_SHA (it
# predates the entire scoping mechanism) would prove nothing; running the
# current script against the CURRENT repo's _acceptance/ tree would not see
# conformance-l0 at all, since that directory does not exist on this branch.
# So: current script, worktree's content — never the other way round, and
# never both from the same place.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
BASE_SHA=336944d68a7bc7fe6da281a8c6eaf24d105703a2
HEAD_SHA=5986bb27b8aa2200e74f44c729be8782264d137d

EXPECTED="src/components/workspace/execution-status-line.tsx
src/constants/task-status.ts
src/hooks/use-workflow-execution.ts
src/hooks/use-workflow-recovery.ts
src/lib/abi/conformance.ts
src/lib/task/engine-events.ts"

for sha in "$BASE_SHA" "$HEAD_SHA"; do
  git -C "$ROOT" rev-parse --quiet --verify "$sha^{commit}" >/dev/null 2>&1 \
    || { echo "FAIL: pinned commit $sha not in this clone (shallow fetch or rewritten history)"; exit 1; }
done

work="$(mktemp -d)"
cleanup() {
  git -C "$ROOT" worktree remove --force "$work" >/dev/null 2>&1 || true
  git -C "$ROOT" worktree prune >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

git -C "$ROOT" worktree add -q --detach "$work" "$HEAD_SHA" \
  || { echo "FAIL: could not create worktree at $HEAD_SHA"; exit 1; }

# Run the CURRENT gate ($ROOT/scripts/pre-merge-check.sh, at HEAD of this
# branch) but point it AT the worktree ($work) as the root to inspect.
# pre-merge-check.sh takes the root to inspect as its first positional
# argument — that is what makes "current logic, pinned-SHA content" possible
# without executing the worktree's own (pre-mechanism) copy of the script.
out="$(bash "$ROOT/scripts/pre-merge-check.sh" "$work" --base "$BASE_SHA" 2>&1)"

# The cross-check must have FIRED — a pass with no cross-check is vacuous.
printf '%s\n' "$out" | grep -q 'NOTE \[conformance-l0\]: declared eval paths do not cover' \
  || { echo "FAIL: cross-check did not fire for conformance-l0"; printf '%s\n' "$out"; exit 1; }

actual="$(printf '%s\n' "$out" \
  | sed -n '/NOTE \[conformance-l0\]: declared eval paths do not cover/,/^[A-Z]/p' \
  | sed -n 's/^    //p' | sort)"

[ -n "$actual" ] || { echo "FAIL: uncovered list is empty"; exit 1; }

if [ "$actual" = "$(printf '%s\n' "$EXPECTED" | sort)" ]; then
  echo "OK: conformance-l0 refused narrow scope for exactly the six declared-but-missing files"
  exit 0
fi
echo "FAIL: uncovered list is not the expected exact set"
diff <(printf '%s\n' "$EXPECTED" | sort) <(printf '%s\n' "$actual") || true
exit 1
