#!/usr/bin/env bash
# E21 guard (compose-overlay AC-15): version pair match + PyPI availability +
# plugin pin match + published wheel carries the compose-overlay types.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
V_TOML=$(grep -E '^version = ' sdk/pyproject.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
V_INIT=$(grep -E '^__version__' sdk/tongflow/__init__.py | sed 's/.*"\(.*\)".*/\1/')
[ "$V_TOML" = "$V_INIT" ] || { echo "FAIL: version drift pyproject=$V_TOML __init__=$V_INIT"; exit 1; }

curl -sf "https://pypi.org/pypi/oneflow-sdk/${V_TOML}/json" >/dev/null \
  || { echo "FAIL: PyPI has no oneflow-sdk ${V_TOML}"; exit 1; }

# Plugin pin must match the released version exactly.
REPO_URL="${OVERLAY_PLUGIN_REPO:-https://github.com/tong-io/oneflow-modal-compose-overlay.git}"
CACHE_DIR="${TMPDIR:-/tmp}/oneflow-overlay-plugin-ci"
if [ ! -d "$CACHE_DIR/.git" ]; then
  git clone --depth 1 "$REPO_URL" "$CACHE_DIR"
else
  git -C "$CACHE_DIR" fetch --depth 1 origin && git -C "$CACHE_DIR" reset --hard origin/HEAD
fi
grep -q "oneflow-sdk==${V_TOML}" "$CACHE_DIR/deploy.py" \
  || { echo "FAIL: plugin deploy.py does not pin oneflow-sdk==${V_TOML}"; exit 1; }

# The published wheel must import the new types (proves models shipped).
uv run --no-project --with "oneflow-sdk==${V_TOML}" python -c "
from tongflow.models.compose_overlay import ComposeOverlayInput, ComposeOverlayOutput
from tongflow.node_slots import NodeSlots
assert NodeSlots.COMPOSE_OVERLAY == 'compose-overlay'
print('published wheel carries compose-overlay types')
"
echo "sdk train OK: ${V_TOML}"
