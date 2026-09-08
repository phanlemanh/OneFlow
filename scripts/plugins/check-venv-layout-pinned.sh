#!/usr/bin/env bash
# Pin the venv layout constant across the two runtimes that write it.
#
# Until 2026-09-08 the agreement was a code comment, and the two sides drifted:
# the engine built ONE venv at the path the app treats as a directory OF venvs,
# so each destroyed the other's work. A comment cannot fail; this can.
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

# A definition alone proves nothing: round 1 found that grepping the NAME stays
# green when only the CALL SITE is deleted, which is the change that actually
# re-arms the cycle. Demand both, on both sides.
py_def=$(grep -cE '^[[:space:]]*def _remove_legacy_shared_venv\(' "$PY" || true)
py_call=$(grep -cE '_remove_legacy_shared_venv\(' "$PY" || true)
if [ "$py_def" -lt 1 ] || [ "$py_call" -lt 2 ]; then
    echo "FAIL: the PYTHON side lost its legacy-shared-venv removal" >&2
    echo "      definitions=$py_def call sites=$((py_call - py_def)) — need both" >&2
    echo "      without a CALL the app deletes every per-plugin venv on its next run" >&2
    exit 1
fi

ts_def=$(grep -cE 'function removeLegacySharedVenv\(' "$TS" || true)
ts_call=$(grep -cE 'removeLegacySharedVenv\(' "$TS" || true)
if [ "$ts_def" -lt 1 ] || [ "$ts_call" -lt 2 ]; then
    echo "FAIL: the TYPESCRIPT side lost its legacy-shared-venv removal" >&2
    echo "      definitions=$ts_def call sites=$((ts_call - ts_def)) — need both" >&2
    echo "      without a CALL, users upgrading from before 2026-08-07 keep a dead venv" >&2
    exit 1
fi

# AC-13: the module docstring is the artifact the two runtimes were supposed to
# agree through, so it must not still describe the shared-venv model this commit
# deleted. Anchored on the two phrases that ONLY the stale description uses —
# "shared venv" still appears legitimately in the legacy-removal function, and
# matching that would make the guard cry wolf on correct code.
py_head=$(sed -n '1,30p' "$PY")
if printf '%s' "$py_head" | grep -q 'provision a shared venv'; then
    echo "FAIL: the PYTHON module docstring still says it provisions a shared venv" >&2
    echo "      it provisions one venv per plugin; the header is the artifact the two" >&2
    echo "      runtimes agree through, and a false one is the same drift one layer up" >&2
    exit 1
fi
if grep -qE '^# --- shared venv' "$PY"; then
    echo "FAIL: the PYTHON section banner still reads '--- shared venv'" >&2
    echo "      that section builds one venv per plugin now" >&2
    exit 1
fi

# AC-11: a guard that only runs when somebody types it cannot fail a future PR,
# which is the entire point of pinning. The repo has already paid for this once:
# scripts/ci/check-gate-guards-job.sh:6 records that the acceptance gate's own
# two drift guards had ZERO references in ci.yml and PRODUCT-MAP.md drifted by
# four slugs before anyone noticed. Assert our own wiring.
CI="$ROOT/.github/workflows/ci.yml"
if [ -f "$CI" ]; then
    for script in check-venv-layout-pinned.sh check-venv-layout-teeth.sh; do
        grep -qE "run:.*scripts/plugins/$script" "$CI" || {
            echo "FAIL: $script is not run by .github/workflows/ci.yml" >&2
            echo "      it would then run only inside this dossier's verify rounds," >&2
            echo "      never on an ordinary PR — the drift it pins would go unseen" >&2
            exit 1
        }
    done
fi

echo "extracted 2 values:"
echo "  python:     $py_const"
echo "  typescript: $ts_const"
echo "OK: both runtimes pin the same venv root, and both still remove the legacy shared venv"
