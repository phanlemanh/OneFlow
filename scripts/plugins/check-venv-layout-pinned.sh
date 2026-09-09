#!/usr/bin/env bash
# Pin the venv layout constant across the two runtimes that write it.
#
# Until 2026-09-08 the agreement was a code comment, and the two sides drifted:
# the engine built ONE venv at the path the app treats as a directory OF venvs,
# so each destroyed the other's work. A comment cannot fail; this can.
#
# This guard does ONE thing: read the path segments each side declares and
# demand they are equal. It used to also assert that the legacy-venv removal was
# still CALLED on both sides, that the module docstring was current, and that
# ci.yml ran it. Seven verify rounds found seven distinct holes in those extra
# assertions, every one of the same shape: a text grep can only see that a NAME
# APPEARS, and "appears" is not "is live" — a comment, a docstring, a string
# literal, a `# run:` line all satisfy it. No grep patch closes that gap, so the
# owner withdrew those assertions on 2026-09-09 (contract, Out of scope). The
# removal's liveness on the Python side is proven by tests that EXECUTE it
# (sdk/tests/test_plugin_venv_layout.py); it is not this script's job.
#
# Fail-closed: a side that yields nothing is an error, not a match. Two empty
# strings comparing equal is exactly the silent-green this package exists to end.
set -euo pipefail

ROOT="."
while [ $# -gt 0 ]; do
    case "$1" in
        --root) ROOT="$2"; shift 2 ;;
        *) echo "unknown flag: $1" >&2; exit 2 ;;
    esac
done

PY="$ROOT/sdk/tongflow/engine/plugins.py"
TS="$ROOT/src/lib/plugins/plugin-python-env.server.ts"
for f in "$PY" "$TS"; do
    [ -f "$f" ] || { echo "FAIL: missing $f" >&2; exit 1; }
done

# Extract the segments GENERICALLY, never by matching the value we expect: a
# guard that greps for the current string can only notice the constant going
# MISSING, not the two sides drifting to different values. Its own teeth caught
# that on 2026-09-08.
#
# Python: `return data_dir / ".tongflow" / "plugin-venv"` inside _venv_root
py_const=$(grep -A4 'def _venv_root' "$PY" \
    | grep -oE 'data_dir[[:space:]]*/[[:space:]]*"[^"]+"([[:space:]]*/[[:space:]]*"[^"]+")*' \
    | head -1 | grep -oE '"[^"]+"' | tr -d '"' | paste -sd, - || true)
# TypeScript: `join(dataDir(), ".tongflow", "plugin-venv")`
ts_const=$(grep -oE 'join\(dataDir\(\)[^)]*\)' "$TS" \
    | head -1 | grep -oE '"[^"]+"' | tr -d '"' | paste -sd, - || true)

if [ -z "$py_const" ]; then
    echo "FAIL: the venv root constant could not be read on the PYTHON side ($PY)" >&2
    echo "      the guard extracts nothing, so it can no longer pin anything" >&2
    exit 1
fi
if [ -z "$ts_const" ]; then
    echo "FAIL: the venv root constant could not be read on the TYPESCRIPT side ($TS)" >&2
    echo "      the guard extracts nothing, so it can no longer pin anything" >&2
    exit 1
fi

if [ "$py_const" != "$ts_const" ]; then
    echo "FAIL: the two runtimes disagree about the venv root" >&2
    echo "      python:     $py_const" >&2
    echo "      typescript: $ts_const" >&2
    exit 1
fi

echo "extracted 2 values:"
echo "  python:     $py_const"
echo "  typescript: $ts_const"
echo "OK: both runtimes pin the same venv root"
