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
    echo "FAIL: không đọc được phiên bản (pyproject='$py_version', __init__='$init_version')"
    exit 1
fi

if [ "$py_version" != "$init_version" ]; then
    echo "FAIL: hai phiên bản lệch nhau — pyproject.toml=$py_version, __init__.py=$init_version"
    exit 1
fi

# The pin must be exact. `>=` or `~=` would let a patch release change how a
# number reads, which is the one thing this slot promises cannot happen.
if ! grep -q '"vietnormalizer==0\.2\.3"' "$pyproject"; then
    echo "FAIL: thiếu pin chính xác vietnormalizer==0.2.3 trong dependencies"
    grep -n 'vietnormalizer' "$pyproject" || echo "  (không thấy dòng vietnormalizer nào)"
    exit 1
fi

echo "OK: SDK $py_version (hai file khớp) · vietnormalizer==0.2.3 pin chính xác"
