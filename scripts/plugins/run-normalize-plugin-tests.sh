#!/usr/bin/env bash
# E17a / E17b (normalize-text-vi AC-14) — run the plugin shell's own tests.
#
# The shell lives in its own repository (this repo's plugins/ is gitignored and
# populated at runtime), so measuring the REAL slot method means reaching that
# tree. Same mechanism as run-overlay-plugin-tests.sh, and used for the same
# reason: only the shell can prove the shell delegates.
#
# Prefers an already-installed plugin tree; falls back to a shallow clone. Prints
# the plugin's commit sha either way so evidence can cite exactly what ran.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLUGIN_ID="oneflow-api-normalize-text-vi"
ORIGIN="https://github.com/phanlemanh"
LOCAL="$ROOT/plugins/$PLUGIN_ID"

if [ -d "$LOCAL" ]; then
    tree="$LOCAL"
    sha="$(git -C "$tree" rev-parse HEAD 2>/dev/null || echo "uncommitted-local-tree")"
    echo "plugin tree: installed at plugins/$PLUGIN_ID"
else
    tmp="$(mktemp -d)"
    trap 'rm -rf "$tmp"' EXIT
    git clone --depth 1 "$ORIGIN/$PLUGIN_ID.git" "$tmp/$PLUGIN_ID" >/dev/null 2>&1 || {
        echo "FAIL: không clone được $ORIGIN/$PLUGIN_ID.git"
        exit 1
    }
    tree="$tmp/$PLUGIN_ID"
    sha="$(git -C "$tree" rev-parse HEAD)"
    echo "plugin tree: cloned from $ORIGIN"
fi
echo "plugin_commit_sha: $sha"

# The SDK comes from THIS repo's source, not from PyPI: the shell under test must
# be measured against the reader that ships in the same change, otherwise a green
# run only proves the shell agrees with whatever version happens to be installed.
cd "$ROOT/sdk"
PYTHONPATH="$ROOT/sdk" uv run --no-project \
    --with pytest --with tomli --with pydantic --with typing_extensions \
    --with vietnormalizer \
    python -m pytest -q -p no:cacheprovider "$tree/tests" "$@"
