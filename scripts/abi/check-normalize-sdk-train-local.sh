#!/usr/bin/env bash
# E14a (normalize-text-vi AC-13) — OFFLINE half of the release train.
#
# Runs every verify round. The online half (PyPI has the version, the plugin
# repo pins it) lives in check-normalize-sdk-published.sh and only means
# anything after the owner has approved publishing.
#
# Both numbers are DERIVED from the files, never written here: a guard that
# hardcodes "0.2.19" goes green forever after the next bump, which is the exact
# failure the compose-overlay contract already recorded as a known limit.
set -euo pipefail

# Root comes from the script's own location, not from cwd — a guard that trusts
# cwd passes from the wrong tree.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

pyproject="$ROOT/sdk/pyproject.toml"
init="$ROOT/sdk/tongflow/__init__.py"

py_version="$(sed -n 's/^version = "\(.*\)"$/\1/p' "$pyproject" | head -1)"
init_version="$(sed -n 's/^__version__ = "\(.*\)"$/\1/p' "$init" | head -1)"

if [ -z "$py_version" ] || [ -z "$init_version" ]; then
    echo "FAIL: could not read a version (pyproject='$py_version', __init__='$init_version')"
    exit 1
fi

if [ "$py_version" != "$init_version" ]; then
    echo "FAIL: the two versions disagree — pyproject.toml=$py_version, __init__.py=$init_version"
    exit 1
fi

# The pin must be exact. `>=` or `~=` would let a patch release change how a
# number reads, which is the one thing this slot promises cannot happen.
# One law, one file — see scripts/lib/sdk-version.sh.
. "$ROOT/scripts/lib/sdk-version.sh"

# Matched by SHAPE, never by literal version: this file's own header says both
# numbers are derived and "a guard that hardcodes '0.2.19' goes green forever
# after the next bump" — but the dependency check hardcoded 0.2.3 and so went
# RED on the next legitimate bump instead, reporting "thiếu pin chính xác"
# about a pin that was exact (S4 round 5 finding). What the criterion asserts
# is the `==` form, so that is what is matched.
# Asked of the ONE library that owns the derivation, not re-matched here. This
# check kept its own tight regex while the library was deliberately widened to
# tolerate whitespace around `==` — and E18 actively ASSERTS the spaced form
# still derives. So a formatter normalising the line would leave E18 green and
# this guard red, complaining "no exact pin" about a pin that is exact: the
# same dialect drift the consolidation removed, moved into an assertion
# (S4 round 8 finding).
if ! reader_pin >/dev/null 2>&1; then
    echo "FAIL: no exact vietnormalizer==X.Y.Z pin in dependencies"
    grep -n 'vietnormalizer' "$pyproject" || echo "  (không thấy dòng vietnormalizer nào)"
    exit 1
fi

echo "OK: SDK $py_version (both files agree) · $(reader_pin) pinned exactly"
