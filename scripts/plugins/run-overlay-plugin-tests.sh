#!/usr/bin/env bash
# Clone-and-pytest guard for the compose-overlay plugin repo (evals E2..E10).
# Usage: run-overlay-plugin-tests.sh <pytest-node-id>
# Prints the plugin commit sha (plugin_commit_sha evidence) before running.
set -euo pipefail
# Sourced by this script's own location — the runner cds into the plugin clone
# below, and a cwd/git-derived path breaks the moment anyone invokes it elsewhere.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/scripts/lib/sdk-version.sh"

# --print-spec answers "which SDK would you install?" without cloning or touching
# the network, so a guard can watch the derived pin follow sdk/pyproject.toml.
if [ "${1:-}" = "--print-spec" ]; then
    sdk_spec
    exit 0
fi

NODE_ID="${1:?usage: run-overlay-plugin-tests.sh <pytest-node-id> | --print-spec}"

# Resolved BEFORE the cd below, on purpose. Defence in depth: sdk-version.sh now
# pins its root at source time, but computing the spec while still standing in
# the oneflow tree keeps this call site correct even if that ever regresses.
SDK_SPEC="$(sdk_spec)"

REPO_URL="${OVERLAY_PLUGIN_REPO:-https://github.com/phanlemanh/oneflow-modal-compose-overlay.git}"
CACHE_DIR="${TMPDIR:-/tmp}/oneflow-overlay-plugin-ci"
if [ ! -d "$CACHE_DIR/.git" ]; then
  git clone --depth 1 "$REPO_URL" "$CACHE_DIR"
else
  git -C "$CACHE_DIR" fetch --depth 1 origin && git -C "$CACHE_DIR" reset --hard origin/HEAD
fi
echo "plugin_commit_sha: $(git -C "$CACHE_DIR" rev-parse HEAD)"
cd "$CACHE_DIR"
PYTHONPATH=. uv run --no-project --with pytest --with pillow --with pydantic --with typing_extensions --with "$SDK_SPEC" python -m pytest -q "$NODE_ID"
