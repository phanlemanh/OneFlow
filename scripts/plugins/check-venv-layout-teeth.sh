#!/usr/bin/env bash
# Red-direction cases for check-venv-layout-pinned.sh.
#
# Cases 5 and 6 are the ones the four value-changing cases cannot see: a guard
# that extracts NOTHING compares two empty strings, finds them equal, and exits
# 0. That is the failure mode this whole feature is about.
#
# No `trap EXIT`: under macOS bash 3.2 it has leaked a 0 exit out of a suite
# that printed failures (see bash32-exit-trap-leaks-status). Check $? yourself.
set -uo pipefail

GUARD="$(cd "$(dirname "$0")" && pwd)/check-venv-layout-pinned.sh"
SRC="$(cd "$(dirname "$0")/../.." && pwd)"
PY_REL="sdk/tongflow/engine/plugins.py"
TS_REL="src/lib/plugins/plugin-python-env.server.ts"
CI_REL=".github/workflows/ci.yml"
pass=0; fail=0

run_case() {
    local name="$1" expect_msg="$2"; shift 2
    local wd; wd=$(mktemp -d)
    mkdir -p "$wd/$(dirname "$PY_REL")" "$wd/$(dirname "$TS_REL")" "$wd/$(dirname "$CI_REL")"
    cp "$SRC/$PY_REL" "$wd/$PY_REL"
    cp "$SRC/$TS_REL" "$wd/$TS_REL"
    cp "$SRC/$CI_REL" "$wd/$CI_REL"
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

c_py_value()  { perl -pi -e 's/"plugin-venv"/"plugin-venv-x"/ if $. < 200' "$1/$PY_REL"; }
c_ts_value()  { perl -pi -e 's/"plugin-venv"/"plugin-venv-x"/' "$1/$TS_REL"; }
c_py_drop()   { perl -pi -e 's/_remove_legacy_shared_venv/_gone_/g' "$1/$PY_REL"; }
c_ts_drop()   { perl -pi -e 's/removeLegacySharedVenv/gone/g' "$1/$TS_REL"; }
c_py_erase()  { perl -pi -e 's/"\.tongflow"\s*\/\s*"plugin-venv"/_layout()/' "$1/$PY_REL"; }
c_ts_erase()  { perl -pi -e 's/"\.tongflow",\s*"plugin-venv"/...layout()/' "$1/$TS_REL"; }
# Keep the definition, delete only the CALL. Round 1 found the guard stayed
# green here while the cycle was fully re-armed.
c_py_call_drop() { perl -pi -e 's/^(\s*)_remove_legacy_shared_venv\(root, log\)/$1pass/' "$1/$PY_REL"; }
c_ts_call_drop() { perl -pi -e 's/^(\s*)removeLegacySharedVenv\(\);/$1;/' "$1/$TS_REL"; }
# AC-13: the module header must not describe the model this commit deleted.
c_py_doc_stale()    { perl -pi -e 's/provision ONE VENV PER PLUGIN/provision a shared venv/ if $. < 30' "$1/$PY_REL"; }
c_py_banner_stale() { perl -pi -e 's/^# --- per-plugin venv/# --- shared venv/' "$1/$PY_REL"; }
# AC-11: unwire the guard from CI and it must notice its own absence.
c_ci_drop()         { perl -pi -e 's{run: bash scripts/plugins/check-venv-layout-pinned.sh}{run: true}' "$1/$CI_REL"; }
# Round 3: the assertion above used to evaporate when ci.yml was absent.
c_ci_missing()      { rm -f "$1/$CI_REL"; }

run_case "python-value-changed" "the two runtimes disagree" c_py_value
run_case "ts-value-changed"     "the two runtimes disagree" c_ts_value
run_case "python-removal-gone"  "PYTHON side lost its legacy-shared-venv removal" c_py_drop
run_case "ts-removal-gone"      "TYPESCRIPT side lost its legacy-shared-venv removal" c_ts_drop
run_case "python-const-erased"  "could not be read on the PYTHON side" c_py_erase
run_case "ts-const-erased"      "could not be read on the TYPESCRIPT side" c_ts_erase
run_case "python-call-dropped"  "PYTHON side lost its legacy-shared-venv removal" c_py_call_drop
run_case "ts-call-dropped"      "TYPESCRIPT side lost its legacy-shared-venv removal" c_ts_call_drop
run_case "docstring-stale"      "still says it provisions a shared venv" c_py_doc_stale
run_case "banner-stale"         "still reads '--- shared venv'" c_py_banner_stale
run_case "ci-step-dropped"      "is not run by .github/workflows/ci.yml" c_ci_drop
run_case "ci-file-missing"      "ci.yml not found at" c_ci_missing

echo "$pass/12 PASS"
[ "$fail" -eq 0 ] && [ "$pass" -eq 12 ] || exit 1
