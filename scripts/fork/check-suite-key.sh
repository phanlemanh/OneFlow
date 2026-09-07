#!/usr/bin/env bash
# mo-hoa-b01 AC-8 — a guard is only "in the machine lane" when three relations
# hold at once: the key is listed under feature_loop.suite_keys, the executor
# the key names exists, and that executor's command runs the guard. A grep for
# the key string proves none of them (gap-probe 05/09 P2: suite_keys can name a
# key that no executor defines, and every later verify round then dereferences
# nothing). Read the YAML as structure, following check-plan-suite-key.sh.
#
# Usage: check-suite-key.sh <key> <script-basename>
# Env:   SUITE_KEY_CONFIG (default _acceptance/config.yaml)
set -euo pipefail
KEY="${1:?usage: check-suite-key.sh <key> <script-basename>}"
SCRIPT="${2:?usage: check-suite-key.sh <key> <script-basename>}"
CONFIG="${SUITE_KEY_CONFIG:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)/_acceptance/config.yaml}"
[ -f "$CONFIG" ] || { echo "FAIL: thiếu $CONFIG — không kết luận" >&2; exit 2; }

python3 - "$CONFIG" "$KEY" "$SCRIPT" <<'PY'
import sys, yaml
cfg_path, key, script = sys.argv[1:4]
cfg = yaml.safe_load(open(cfg_path, encoding="utf-8"))
ref = f"executors.script.{key}"
keys = (cfg.get("feature_loop") or {}).get("suite_keys") or []
if ref not in keys:
    print(f"FAIL: {key} không nằm trong feature_loop.suite_keys", file=sys.stderr); sys.exit(1)
cmd = ((cfg.get("executors") or {}).get("script") or {}).get(key)
if not cmd:
    print(f"FAIL: suite key {key} không trỏ executor nào — {ref} không tồn tại", file=sys.stderr); sys.exit(1)
if script not in str(cmd):
    print(f"FAIL: {ref} không gọi {script} — lệnh là: {cmd}", file=sys.stderr); sys.exit(1)
print(f"OK: {ref} là suite key và gọi {script} ({len(keys)} khoá trong làn máy)")
PY
