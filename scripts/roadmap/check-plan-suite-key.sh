#!/usr/bin/env bash
# AC-9, second half: the freeze guard must be a SUITE KEY, so every local verify
# round runs it too — not only CI. The local gate does not run the ledger guard,
# which is why PR #96 only went red once it reached CI (measured 2026-09-04).
#
# A separate script rather than an inline `python3 -c` in config.yaml: the inline
# form needs nested quotes, and those break the moment the command is passed
# through a JSON args payload.
set -euo pipefail
cd "$(dirname "$0")/../.."
if [ $# -gt 0 ]; then
    echo "check-plan-suite-key: không nhận tham số nào — nhận được: $*" >&2
    exit 2
fi

python3 - <<'PY'
import sys, yaml
keys = yaml.safe_load(open("_acceptance/config.yaml"))["feature_loop"]["suite_keys"]
want = "executors.script.plan_freeze"
if want not in keys:
    print(f"FAIL: feature_loop.suite_keys thiếu {want} — chốt chặn đóng băng sẽ không chạy trong vòng verify local", file=sys.stderr)
    sys.exit(1)
print(f"OK: {want} là một suite key ({len(keys)} khoá trong làn máy)")
PY
