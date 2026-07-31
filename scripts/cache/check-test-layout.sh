#!/usr/bin/env bash
# AC-14 (cache-l4-eviction): cache test files stay <=800 lines, and every
# cache pytest node-id declared in _acceptance/config.yaml selects exactly
# one test. Discriminating by construction: --case options simulate both
# failure modes against a temp tree (see AC-14 for why nine-behind-one-exit
# is forbidden).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fail() { echo "VIOLATION: $*" >&2; exit 1; }
# 1) line caps
for f in "$ROOT"/sdk/tests/test_node_cache.py "$ROOT"/sdk/tests/test_node_cache_tier_b.py "$ROOT"/sdk/tests/test_cache_sweep.py; do
  [ -f "$f" ] || continue
  lines=$(wc -l < "$f")
  [ "$lines" -le 800 ] || fail "$f has $lines lines (>800)"
done
# 2) every l2/l3/l4 node-id collects exactly one test
ids=$(grep -oE 'tests/[a-z_/]+\.py::[a-z_0-9]+' "$ROOT/_acceptance/config.yaml" | grep -E 'test_(node_cache|node_cache_tier_b|cache_sweep)' | sort -u)
cd "$ROOT/sdk"
while IFS= read -r id; do
  n=$(PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions \
      python -m pytest -q --collect-only "$id" 2>/dev/null | grep -c '::' || true)
  [ "$n" -eq 1 ] || fail "$id collects $n tests (want exactly 1)"
done <<< "$ids"
echo "OK: cache test layout"
