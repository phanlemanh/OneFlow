#!/usr/bin/env bash
# Red-direction cases for check-venv-layout-pinned.sh.
#
# Six cases, two per failure mode, one per side: the value drifts; the constant
# is erased so extraction yields nothing (a guard that extracts NOTHING compares
# two empty strings, finds them equal, and exits 0 — the failure mode this whole
# feature is about); the file is gone. Cases for call-site liveness, docstring
# and CI wiring were removed with the assertions they exercised (2026-09-09).
#
# No `trap EXIT`: under macOS bash 3.2 it has leaked a 0 exit out of a suite
# that printed failures (see bash32-exit-trap-leaks-status). Check $? yourself.
set -uo pipefail

GUARD="$(cd "$(dirname "$0")" && pwd)/check-venv-layout-pinned.sh"
SRC="$(cd "$(dirname "$0")/../.." && pwd)"
PY_REL="sdk/tongflow/engine/plugins.py"
TS_REL="src/lib/plugins/plugin-python-env.server.ts"
TOTAL=6
pass=0; fail=0

run_case() {
    local name="$1" expect_msg="$2"; shift 2
    local wd; wd=$(mktemp -d)
    mkdir -p "$wd/$(dirname "$PY_REL")" "$wd/$(dirname "$TS_REL")"
    cp "$SRC/$PY_REL" "$wd/$PY_REL"
    cp "$SRC/$TS_REL" "$wd/$TS_REL"
    "$@" "$wd"
    local out rc
    out=$(bash "$GUARD" --root "$wd" 2>&1); rc=$?
    rm -rf "$wd"
    if [ "$rc" -eq 0 ]; then
        echo "FAIL [$name] guard stayed green on a perturbed tree"; fail=$((fail+1)); return
    fi
    if ! printf '%s' "$out" | grep -qF "$expect_msg"; then
        echo "FAIL [$name] red, but the message did not pin the cause"
        echo "  wanted: $expect_msg"; echo "  got:    $out"; fail=$((fail+1)); return
    fi
    echo "PASS [$name]"; pass=$((pass+1))
}

c_py_value()   { perl -pi -e 's/"plugin-venv"/"plugin-venv-x"/ if $. < 200' "$1/$PY_REL"; }
c_ts_value()   { perl -pi -e 's/"plugin-venv"/"plugin-venv-x"/' "$1/$TS_REL"; }
c_py_erase()   { perl -pi -e 's/"\.tongflow"\s*\/\s*"plugin-venv"/_layout()/' "$1/$PY_REL"; }
c_ts_erase()   { perl -pi -e 's/"\.tongflow",\s*"plugin-venv"/...layout()/' "$1/$TS_REL"; }
c_py_missing() { rm -f "$1/$PY_REL"; }
c_ts_missing() { rm -f "$1/$TS_REL"; }

run_case "python-value-changed" "the two runtimes disagree" c_py_value
run_case "ts-value-changed"     "the two runtimes disagree" c_ts_value
run_case "python-const-erased"  "could not be read on the PYTHON side" c_py_erase
run_case "ts-const-erased"      "could not be read on the TYPESCRIPT side" c_ts_erase
run_case "python-file-missing"  "FAIL: missing" c_py_missing
run_case "ts-file-missing"      "FAIL: missing" c_ts_missing

echo "$pass/$TOTAL PASS"
[ "$fail" -eq 0 ] && [ "$pass" -eq "$TOTAL" ] || exit 1
