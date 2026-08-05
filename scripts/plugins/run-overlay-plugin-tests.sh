#!/usr/bin/env bash
# Clone-and-pytest guard for the compose-overlay plugin repo (evals E2..E10).
# Usage: run-overlay-plugin-tests.sh <pytest-node-id>
# Prints the plugin commit sha (plugin_commit_sha evidence) before running.
set -euo pipefail
. "$(git rev-parse --show-toplevel)/scripts/lib/sdk-version.sh"

# --print-spec answers "which SDK would you install?" without cloning or touching
# the network, so a guard can watch the derived pin follow sdk/pyproject.toml.
if [ "${1:-}" = "--print-spec" ]; then
    sdk_spec
    exit 0
fi

NODE_ID="${1:?usage: run-overlay-plugin-tests.sh <pytest-node-id> | --print-spec}"
REPO_URL="${OVERLAY_PLUGIN_REPO:-https://github.com/phanlemanh/oneflow-modal-compose-overlay.git}"
CACHE_DIR="${TMPDIR:-/tmp}/oneflow-overlay-plugin-ci"
if [ ! -d "$CACHE_DIR/.git" ]; then
  git clone --depth 1 "$REPO_URL" "$CACHE_DIR"
else
  git -C "$CACHE_DIR" fetch --depth 1 origin && git -C "$CACHE_DIR" reset --hard origin/HEAD
fi
echo "plugin_commit_sha: $(git -C "$CACHE_DIR" rev-parse HEAD)"
cd "$CACHE_DIR"
# Derived from sdk/pyproject.toml via scripts/lib/sdk-version.sh — the same source
# check-overlay-sdk-train.sh reads. A literal here would keep these evals green
# against an SDK the plugin no longer ships (CI-a, AC-5/AC-6).
# OVERLAY_SDK_SPEC still wins: CI points at a local wheel before the release lands.
SDK_SPEC="$(sdk_spec)"
PYTHONPATH=. uv run --no-project --with pytest --with pillow --with pydantic --with typing_extensions --with "$SDK_SPEC" python -m pytest -q "$NODE_ID"
