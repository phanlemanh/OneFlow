#!/usr/bin/env bash
# E15 (scan-with-block-imports) — the RED half of the diagnostic.
#
# On a COPY of the tree, restore the silent `continue` (remove the two lines
# that emit a reason) and require E7..E10 to go red WITH the absent reason text
# named. Proves those assertions measure the reason, not merely that scanning
# finished.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cp -R "$root/sdk" "$work/sdk"
rm -rf "$work/sdk/.venv" "$work/sdk/tongflow/__pycache__" "$work/sdk/tests/__pycache__"

"${PYTHON:-python3}" - "$work/sdk" <<'PY'
import pathlib
import sys

sdk = pathlib.Path(sys.argv[1])
deploy_literal = "                slot_problems.append((stmt.lineno, reason))"
scan_literal = """                rejections.append(
                    _scan_error(path, reason, REJECTION_HINT, line=node.lineno)
                )"""

# Each literal must appear EXACTLY once. If a refactor moves it, this script
# fails loudly here rather than silently perturbing nothing and passing green.
for path, literal in (
    (sdk / "tongflow" / "parse_deploy.py", deploy_literal),
    (sdk / "tongflow" / "scan.py", scan_literal),
):
    src = path.read_text(encoding="utf-8")
    if src.count(literal) != 1:
        sys.exit(
            f"TEETH BROKEN: {path.name} has {src.count(literal)} copies of the "
            f"reason-emission literal, expected 1 — this perturbation has lost "
            f"its grip on the code it is supposed to break"
        )
    path.write_text(src.replace(literal, "                pass"), encoding="utf-8")
PY

set +e
out=$(cd "$work/sdk" && PYTHONPATH=. uv run --no-project --with pytest --with tomli \
  --with pydantic --with typing_extensions python -m pytest -q \
  tests/test_scan_scope.py::test_reason_names_defining_file_and_line \
  tests/test_scan_scope.py::test_reason_missing_annotation \
  tests/test_scan_scope.py::test_reason_missing_param \
  tests/test_scan_scope.py::test_reason_single_source_mutation 2>&1)
code=$?
set -e

if [ $code -eq 0 ]; then
  echo "FAIL: the suite stayed GREEN with the reason emission removed — E7..E10"
  echo "      do not measure the reason, only that scanning finished."
  exit 1
fi
if ! echo "$out" | grep -q "tongflow.models type"; then
  echo "FAIL: the suite went red but never named the absent reason text."
  echo "$out" | tail -30
  exit 1
fi
echo "ok: removing the reason emission turns E7..E10 red and names the absent reason"
