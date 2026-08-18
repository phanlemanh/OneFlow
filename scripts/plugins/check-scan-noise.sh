#!/usr/bin/env bash
# E11 / AC-11 (scan-with-block-imports) — the new diagnostic must not turn
# healthy plugins noisy.
#
# A DELTA across two code points over the SAME plugins/ tree: compare the SET OF
# PLUGIN IDS carrying problems at the merge base and at HEAD, and go red if and
# only if HEAD carries an id the base did not. No pinned problem text and no
# dependence on how many plugins happen to be installed — a differently
# populated machine must not be able to turn this red for environmental reasons,
# because that gets "fixed" by editing the pin and costs the check its teeth.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
py="${PYTHON:-python3}"
plugins_root="$root/plugins"
abi="$root/config/tongflow.abi.json"

base="${1:-}"
if [ "$base" = "" ]; then
  main_ref=main
  if git -C "$root" rev-parse --verify -q origin/main >/dev/null 2>&1; then
    main_ref=origin/main
  fi
  base=$(git -C "$root" merge-base HEAD "$main_ref")
fi

if [ ! -d "$plugins_root" ] || [ -z "$(ls -A "$plugins_root" 2>/dev/null)" ]; then
  echo "SKIP: plugins/ is empty — nothing to compare (it is gitignored and"
  echo "      populated at runtime; run \`pnpm plugins:install\` to widen this check)."
  exit 0
fi

ids_at() {
  PYTHONPATH="$1/sdk" "$py" -m tongflow --root "$plugins_root" --abi "$abi" \
    | "$py" -c '
import json, sys
payload = json.load(sys.stdin)
ids = sorted({str(e.get("pluginId")) for e in payload.get("errors", [])})
print("\n".join(ids))
'
}

work=$(mktemp -d)
cleanup() {
  git -C "$root" worktree remove --force "$work/base" >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

git -C "$root" worktree add --detach "$work/base" "$base" >/dev/null 2>&1
before=$(ids_at "$work/base")
after=$(ids_at "$root")

new=$(comm -13 <(echo "$before") <(echo "$after") || true)
count=$(ls -1 "$plugins_root" | wc -l | tr -d ' ')
if [ "$new" != "" ]; then
  echo "FAIL: over $count installed plugins, HEAD reports problems for plugin(s)"
  echo "      the merge base ($base) did not:"
  echo "$new" | sed 's/^/  - /'
  exit 1
fi
echo "ok: over $count installed plugins, no plugin became newly problematic at HEAD"
