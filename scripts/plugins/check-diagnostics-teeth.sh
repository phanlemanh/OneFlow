#!/usr/bin/env bash
# scan-scope-diagnostics — the red halves. A green that has never been red does
# not distinguish "the code is right" from "the measure never ran".
#
# Each subcommand perturbs a COPY of the tree, re-runs the tests that claim to
# catch that perturbation, and requires them to go RED with a message naming
# what went missing — not merely a non-zero exit.
set -euo pipefail

mode="${1:-}"
root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cp -R "$root/sdk" "$work/sdk"
find "$work/sdk" -name __pycache__ -type d -prune -exec rm -rf {} + 2>/dev/null || true

py_run() {
  (cd "$work/sdk" && PYTHONPATH=. uv run --no-project --with pytest --with tomli \
    --with pydantic --with typing_extensions python -m pytest -q "$@" 2>&1)
}

expect_red() {
  local needle="$1"; shift
  local out rc
  set +e
  out=$(py_run "$@")
  rc=$?
  set -e
  if [ "$rc" -eq 0 ]; then
    echo "FAIL: the perturbation was NOT caught — these tests stayed green:"
    printf '  %s\n' "$@"
    exit 1
  fi
  if ! printf '%s' "$out" | grep -qF "$needle"; then
    echo "FAIL: the tests went red but never named what went missing."
    echo "      expected the output to contain: $needle"
    printf '%s\n' "$out" | tail -30
    exit 1
  fi
  echo "ok: perturbation caught, and the failure names \"$needle\""
}

expect_green() {
  if ! py_run "$@" >/dev/null; then
    echo "FAIL: these tests were expected to STAY GREEN under this perturbation:"
    printf '  %s\n' "$@"
    exit 1
  fi
  echo "ok: stayed green as expected"
}

T=tests/test_scan_diagnostics.py

case "$mode" in
  scope-gate)
    # Revert the gate to the old first-level identity set.
    python3 - "$work/sdk/tongflow/scan.py" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old = """    module_scope: set[int] = set()
    _walk_module_scope(tree, lambda stmt: module_scope.add(id(stmt)))"""
assert old in s, "scope-gate perturbation found nothing to revert"
s = s.replace(old, "    module_scope = {id(node) for node in tree.body}", 1)
open(p, "w", encoding="utf-8").write(s)
PY
    expect_red "compose_overlay" \
      "$T::test_reason_for_malformed_def_in_module_block" \
      "$T::test_rejection_in_non_scope_block" \
      "$T::test_rejection_in_nested_blocks"
    ;;

  shared-walker)
    # Neuter the ONE shared function. Both consumers must change behaviour — a
    # unit test of the walker cannot prove that scan.py routes through it.
    python3 - "$work/sdk/tongflow/_ast_utils.py" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old = "    for child in ast.iter_child_nodes(node):"
assert old in s, "shared-walker perturbation found nothing to neuter"
s = s.replace(old, "    return\n" + old, 1)
open(p, "w", encoding="utf-8").write(s)
PY
    echo "-- consumer 1: the rejection gate in scan.py"
    expect_red "compose_overlay" "$T::test_reason_for_malformed_def_in_module_block"
    echo "-- consumer 2: the import collector"
    expect_red "COMPOSE_OVERLAY unregistered" \
      "tests/test_scan_scope.py::test_non_scope_block_collects_import"
    ;;

  parse-failure)
    # Restore BOTH swallows: the bare except and the discarded _derr.
    python3 - "$work/sdk/tongflow/scan.py" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old_except = """    except (OSError, SyntaxError) as exc:
        # A file that will not parse HAS a reason. Returning it in the
        # `rejections` slot both routes it into `errors` and lets the existing
        # `if not rejections:` guard suppress the generic entry.py line.
        line, reason, hint = parse_failure_reason(exc, path)
        return {}, set(), [], [_scan_error(path, reason, hint, line=line)]"""
assert old_except in s, "parse-failure perturbation did not find the except clause"
s = s.replace(
    old_except,
    "    except (OSError, SyntaxError):\n        return {}, set(), [], []",
    1,
)
old_derr = "            dscan, derr = parse_deploy_py(deploy_py)"
assert old_derr in s, "parse-failure perturbation did not find the deploy call"
s = s.replace(old_derr, old_derr + "\n            derr = None", 1)
open(p, "w", encoding="utf-8").write(s)
PY
    expect_red "no @node_slot" \
      "$T::test_syntax_error_names_its_own_file_and_line" \
      "$T::test_deploy_parse_error_surfaces_in_scan_errors"
    ;;

  dedupe)
    # Replace the order-preserving dedupe with a naive extend. AC-12's measure
    # must go RED while AC-11's STAYS GREEN — a perturbation that reddens
    # everything proves only that the suite notices change, not that AC-12 is
    # the case that catches double-reporting.
    python3 - "$work/sdk/tongflow/parse_deploy.py" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old = """                for problem in legacy_slot_problems:
                    if problem not in slot_problems:
                        slot_problems.append(problem)"""
assert old in s, "dedupe perturbation found nothing to replace"
s = s.replace(old, "                slot_problems.extend(legacy_slot_problems)", 1)
open(p, "w", encoding="utf-8").write(s)
PY
    expect_red "exactly once" "$T::test_ordinary_shape_reports_each_reason_once"
    expect_green "$T::test_deploy_and_inference_reasons_both_survive"
    ;;

  *)
    echo "usage: $0 {scope-gate|shared-walker|parse-failure|dedupe}" >&2
    exit 2
    ;;
esac
