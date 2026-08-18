#!/usr/bin/env bash
# E14 (scan-with-block-imports) — the RED half of the scope-boundary walker.
#
# On a COPY of the tree, revert the walker to the old name-the-block-types form
# and require E1..E5 to go red WITH A MESSAGE NAMING the missing slot — not
# merely a non-zero exit, which a broken fixture or a typo also produces. A
# green that has never been red does not distinguish "the code is right" from
# "the measure never ran".
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cp -R "$root/sdk" "$work/sdk"
rm -rf "$work/sdk/.venv" "$work/sdk/tongflow/__pycache__" "$work/sdk/tests/__pycache__"

"${PYTHON:-python3}" - "$work/sdk/tongflow/_ast_utils.py" <<'PY'
import pathlib
import re
import sys

path = pathlib.Path(sys.argv[1])
src = path.read_text(encoding="utf-8")
anchor = "def _walk_module_scope("
if src.count(anchor) != 1:
    sys.exit(
        f"TEETH BROKEN: expected exactly one {anchor!r} in {path.name}, "
        f"found {src.count(anchor)} — this perturbation has lost its grip"
    )

start = src.index(anchor)
rest = src[start + len(anchor):]
m = re.search(r"\n(?=def )", rest)
if not m:
    sys.exit("TEETH BROKEN: could not find the end of _walk_module_scope")
end = start + len(anchor) + m.start() + 1

old = '''def _walk_module_scope(node, take):
    """Pre-fix form: names the block types it knows about, and knows only Try."""
    for child in getattr(node, "body", []):
        if isinstance(child, ast.stmt):
            take(child)
        if isinstance(child, ast.Try):
            _walk_module_scope(child, take)
            for handler in child.handlers:
                _walk_module_scope(handler, take)

'''
path.write_text(src[:start] + old + src[end:], encoding="utf-8")
PY

set +e
out=$(cd "$work/sdk" && PYTHONPATH=. uv run --no-project --with pytest --with tomli \
  --with pydantic --with typing_extensions python -m pytest -q tests/test_scan_scope.py \
  -k 'deploy_with_image_imports or scan_with_image_imports or non_scope_block or nested_blocks or function_local or class_body or import_spelling' 2>&1)
code=$?
set -e

if [ $code -eq 0 ]; then
  echo "FAIL: the suite stayed GREEN under the reverted walker — E1..E5 do not"
  echo "      distinguish walk-by-scope-boundary from name-the-block-types."
  exit 1
fi
if ! echo "$out" | grep -q "COMPOSE_OVERLAY"; then
  echo "FAIL: the suite went red but never named the missing slot COMPOSE_OVERLAY —"
  echo "      a non-zero exit alone does not prove the measure measured anything."
  echo "$out" | tail -30
  exit 1
fi
echo "ok: reverting the walker turns E1..E5 red and names the missing slot COMPOSE_OVERLAY"
