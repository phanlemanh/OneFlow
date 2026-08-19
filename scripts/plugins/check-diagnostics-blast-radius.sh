#!/usr/bin/env bash
# AC-14 — this package must not widen its blast radius, and ships no release.
#
# The base is PINNED to the stacked parent tip, printed into the evidence, and
# asserted to be a strict ancestor of HEAD with a NON-EMPTY diff. Without that
# last clause the check is green whenever the base resolves onto HEAD — after a
# rebase of the stacked parent, say — and reports a clean radius having
# compared nothing.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

base="${DIAG_BASE_REF:-feat/scan-with-block-imports}"
if ! git -C "$root" rev-parse --verify -q "$base" >/dev/null 2>&1; then
  echo "note: $base not found, falling back to origin/main (a WIDER window)"
  base=origin/main
fi
base_sha=$(git -C "$root" merge-base HEAD "$base")
head_sha=$(git -C "$root" rev-parse HEAD)
echo "base: $base_sha  (from $base)"
echo "head: $head_sha"

if [ "$base_sha" = "$head_sha" ]; then
  echo "FAIL: the base resolved onto HEAD — there is nothing to compare, and a"
  echo "      green here would mean only that no diff was examined."
  exit 1
fi
if ! git -C "$root" merge-base --is-ancestor "$base_sha" "$head_sha"; then
  echo "FAIL: $base_sha is not an ancestor of HEAD."
  exit 1
fi

changed=$(git -C "$root" diff --name-only "$base_sha"...HEAD)
if [ -z "$changed" ]; then
  echo "FAIL: the diff against $base_sha is empty — nothing was compared."
  exit 1
fi

gated='^(config/tongflow\.abi\.json|src/generated/abi/|src/lib/abi/|src/db/|src/lib/plugin-executor/|src/lib/workflow/|src/app/api/)'
offenders=$(printf '%s\n' "$changed" | grep -E "$gated" || true)
if [ -n "$offenders" ]; then
  echo "FAIL: this package touched contract chokepoints it promised not to:"
  printf '%s\n' "$offenders" | sed 's/^/  - /'
  exit 1
fi

for f in sdk/pyproject.toml sdk/tongflow/__init__.py; do
  if git -C "$root" diff "$base_sha"...HEAD -- "$f" | grep -qE '^[+-].*version'; then
    echo "FAIL: a version string changed in $f — this package ships no release."
    git -C "$root" diff "$base_sha"...HEAD -- "$f" | grep -E '^[+-].*version' | sed 's/^/  /'
    exit 1
  fi
done

echo "ok: $(printf '%s\n' "$changed" | wc -l | tr -d ' ') file(s) changed against $base_sha;"
echo "    no contract chokepoint touched, no SDK version bumped"
