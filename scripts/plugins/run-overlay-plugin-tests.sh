#!/usr/bin/env bash
# Clone-and-pytest guard for the compose-overlay plugin repo (evals E2..E10).
# Usage: run-overlay-plugin-tests.sh <pytest-node-id>
# Prints the plugin commit sha (plugin_commit_sha evidence) before running.
set -euo pipefail
NODE_ID="${1:?usage: run-overlay-plugin-tests.sh <pytest-node-id>}"
REPO_URL="${OVERLAY_PLUGIN_REPO:-https://github.com/phanlemanh/oneflow-modal-compose-overlay.git}"
CACHE_DIR="${TMPDIR:-/tmp}/oneflow-overlay-plugin-ci"
if [ ! -d "$CACHE_DIR/.git" ]; then
  git clone --depth 1 "$REPO_URL" "$CACHE_DIR"
else
  git -C "$CACHE_DIR" fetch --depth 1 origin && git -C "$CACHE_DIR" reset --hard origin/HEAD
fi
echo "plugin_commit_sha: $(git -C "$CACHE_DIR" rev-parse HEAD)"
cd "$CACHE_DIR"
# OVERLAY_SDK_SPEC lets CI point at a local wheel before the PyPI release lands;
# the default is the pinned release the plugin ships with.
SDK_SPEC="${OVERLAY_SDK_SPEC:-oneflow-sdk==0.2.18}"
PYTHONPATH=. uv run --no-project --with pytest --with pillow --with pydantic --with typing_extensions --with "$SDK_SPEC" python -m pytest -q "$NODE_ID"
