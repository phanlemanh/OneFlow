#!/usr/bin/env bash
# E12 (fixture) / E14b (real) — the product-level question: does the
# compose-overlay slot have anyone serving it?
#
# Runs the scanner the way the server runs it (src/lib/plugins/plugins-scanner.server.ts):
# module entry `python -m tongflow`, this repo's sdk/ FIRST on PYTHONPATH. The
# repo root is derived from this script's own location, never from the caller's
# working directory — and the loaded tongflow is asserted to be this repo's, so
# a scan cannot silently measure an installed copy instead of this change.
set -euo pipefail

mode="${1:-fixture}"
root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
plugin_id=oneflow-modal-compose-overlay
abi="$root/config/tongflow.abi.json"
py="${PYTHON:-python3}"

case "$mode" in
  fixture)
    plugins_root="$root/sdk/tests/fixtures/scan_scope/plugins"
    pinned="$plugins_root/$plugin_id/deploy.py.sha256"
    actual=$(shasum -a 256 "$plugins_root/$plugin_id/deploy.py" | cut -d' ' -f1)
    if [ "$actual" != "$(cat "$pinned")" ]; then
      echo "FAIL: fixture deploy.py drifted from its pinned hash — it no longer"
      echo "      matches the real plugin it was round-tripped from."
      echo "      pinned: $(cat "$pinned")"
      echo "      actual: $actual"
      exit 1
    fi
    echo "fixture deploy.py matches its pinned hash ($actual)"
    ;;
  real)
    plugins_root="$root/plugins"
    if [ ! -d "$plugins_root/$plugin_id" ]; then
      echo "SKIP: $plugin_id is not installed under plugins/ — run"
      echo "      \`pnpm plugins:install $plugin_id\`. plugins/ is gitignored and"
      echo "      populated at runtime, so this check has nothing to read here."
      exit 0
    fi
    ;;
  *)
    echo "usage: $0 {fixture|real}" >&2
    exit 2
    ;;
esac

resolved=$(PYTHONPATH="$root/sdk" "$py" -c 'import tongflow; print(tongflow.__file__)')
case "$resolved" in
  "$root/sdk/"*) echo "tongflow loaded from this repo: $resolved" ;;
  *)
    echo "FAIL: tongflow resolved to $resolved, outside $root/sdk — the scan"
    echo "      would have measured an installed copy, not this change."
    exit 1
    ;;
esac

PYTHONPATH="$root/sdk" "$py" -m tongflow --root "$plugins_root" --abi "$abi" \
  | PLUGIN_ID="$plugin_id" MODE="$mode" "$py" -c '
import json, os, sys

payload = json.load(sys.stdin)
plugin_id = os.environ["PLUGIN_ID"]
mode = os.environ["MODE"]
servers = payload.get("nodePluginMap", {}).get("compose-overlay", [])
errors = [e for e in payload.get("errors", []) if e.get("pluginId") == plugin_id]

if not servers:
    print(f"FAIL [{mode}]: no plugin serves slot compose-overlay")
    for e in errors:
        print("  problem: " + str(e.get("message")))
    sys.exit(1)
if errors:
    print(f"FAIL [{mode}]: {plugin_id} is served but still carries problems")
    for e in errors:
        print("  problem: " + str(e.get("message")))
    sys.exit(1)
print(f"ok [{mode}]: compose-overlay served by {servers}, no problems for {plugin_id}")
'
