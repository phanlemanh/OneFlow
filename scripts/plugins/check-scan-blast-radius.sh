#!/usr/bin/env bash
# E13 / AC-13 (scan-with-block-imports) — this package ships no release and
# touches no contract chokepoint.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
base="${1:-}"
if [ "$base" = "" ]; then
  main_ref=main
  if git -C "$root" rev-parse --verify -q origin/main >/dev/null 2>&1; then
    main_ref=origin/main
  fi
  base=$(git -C "$root" merge-base HEAD "$main_ref")
fi

# Working tree, not `base...HEAD`: the version half below reads the file on
# disk, so the chokepoint half must too, or the two halves of one guard measure
# two different trees and an uncommitted chokepoint edit passes unseen.
forbidden=$(git -C "$root" diff --name-only "$base" -- \
  config/tongflow.abi.json 'src/generated/abi' 'src/lib/abi' 'src/db')
if [ "$forbidden" != "" ]; then
  echo "FAIL: the change reaches contract chokepoints it declared it would not:"
  echo "$forbidden" | sed 's/^/  - /'
  exit 1
fi

for spec in "sdk/pyproject.toml|^version" "sdk/tongflow/__init__.py|^__version__"; do
  file="${spec%%|*}"
  pattern="${spec#*|}"
  before=$(git -C "$root" show "$base:$file" | grep -E "$pattern" || true)
  after=$(grep -E "$pattern" "$root/$file" || true)
  if [ "$before" = "" ]; then
    echo "FAIL: no line matching /$pattern/ in $file at $base — this guard has"
    echo "      lost its grip on the version string and would pass on anything."
    exit 1
  fi
  if [ "$before" != "$after" ]; then
    echo "FAIL: $file version changed ($before -> $after) — this package ships no release."
    exit 1
  fi
done
echo "ok: no contract chokepoint touched, SDK version unchanged since $base"
