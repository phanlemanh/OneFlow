#!/usr/bin/env bash
# Clone-and-pytest runner for the two LOCAL plugin repos (evals E8..E14).
# Usage: run-local-plugin-tests.sh <plugin-name> <pytest-node-id>
#
# One wrapper serves both plugins because the only difference between them is
# the repo name and the dependency set — the compose-overlay runner proved the
# shape, this one just takes the plugin as an argument.
#
# Source resolution, in order:
#   1. plugins/<name> in this repo, if present — the dev/verify path, and what
#      makes a round runnable before the repo is pushed. Printed as
#      plugin_source: worktree so evidence never claims to have tested a remote
#      commit it did not fetch.
#   2. a shallow clone of <origin>/<name>.git — the CI path.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
. "$ROOT/scripts/lib/sdk-version.sh"

if [ "${1:-}" = "--print-spec" ]; then
    sdk_spec
    exit 0
fi

NAME="${1:?usage: run-local-plugin-tests.sh <plugin-name> <pytest-node-id> | --print-spec}"
NODE_ID="${2:?usage: run-local-plugin-tests.sh <plugin-name> <pytest-node-id>}"
ORIGIN="${LOCAL_PLUGIN_ORIGIN:-https://github.com/phanlemanh}"

# Resolved BEFORE any cd, on purpose: sdk-version.sh pins its root at source
# time, and computing the spec while still standing in the oneflow tree keeps
# this call site correct even if that ever regresses.
SDK_SPEC="$(sdk_spec)"

# Per-plugin runtime dependencies. Kept here rather than read from the plugin's
# requirements.txt because that file pins the PUBLISHED SDK, while the eval lane
# installs whichever SDK sdk/pyproject.toml currently declares.
case "$NAME" in
    oneflow-local-ffmpeg)       EXTRA_DEPS=(--with moviepy) ;;
    oneflow-local-pyscenedetect) EXTRA_DEPS=(--with scenedetect --with imageio-ffmpeg) ;;
    *) echo "unknown plugin: $NAME" >&2; exit 2 ;;
esac

WORKTREE="$ROOT/plugins/$NAME"
if [ -d "$WORKTREE" ]; then
    DIR="$WORKTREE"
    echo "plugin_source: worktree ($DIR)"
    if [ -d "$DIR/.git" ]; then
        echo "plugin_commit_sha: $(git -C "$DIR" rev-parse HEAD)"
    fi
else
    DIR="${TMPDIR:-/tmp}/oneflow-local-plugin-ci/$NAME"
    if [ ! -d "$DIR/.git" ]; then
        mkdir -p "$(dirname "$DIR")"
        git clone --depth 1 "$ORIGIN/$NAME.git" "$DIR"
    else
        git -C "$DIR" fetch --depth 1 origin && git -C "$DIR" reset --hard origin/HEAD
    fi
    echo "plugin_source: clone ($ORIGIN/$NAME.git)"
    echo "plugin_commit_sha: $(git -C "$DIR" rev-parse HEAD)"
fi

cd "$DIR"
PYTHONPATH=. uv run --no-project \
    --with pytest --with pydantic --with typing_extensions \
    "${EXTRA_DEPS[@]}" --with "$SDK_SPEC" \
    python -m pytest -q "$NODE_ID"
