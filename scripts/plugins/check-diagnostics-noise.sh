#!/usr/bin/env bash
# AC-13 — the new diagnostics must not turn healthy plugins noisy.
#
# A DELTA across two code points over the SAME tree: compare the SET OF PLUGIN
# IDS carrying problems at the base and at HEAD, red iff HEAD carries an id the
# base did not. Two subcommands on purpose: `plugins/` is gitignored and
# populated at runtime, so a delta over an empty tree compares two empty sets
# and is green for the wrong reason. `fixture` always runs; `real` skips by name.
set -euo pipefail

mode="${1:-fixture}"
root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
py="${PYTHON:-python3}"
abi="$root/config/tongflow.abi.json"

case "$mode" in
  fixture) plugins_root="$root/sdk/tests/fixtures/scan_scope/plugins" ;;
  real)    plugins_root="$root/plugins" ;;
  *) echo "usage: $0 {fixture|real}" >&2; exit 2 ;;
esac

count=0
if [ -d "$plugins_root" ]; then
  count=$(ls -1 "$plugins_root" 2>/dev/null | wc -l | tr -d ' ')
fi

if [ "$count" -eq 0 ]; then
  if [ "$mode" = "real" ]; then
    echo "SKIP: plugins/ holds no plugin — it is gitignored and populated at"
    echo "      runtime. Run \`pnpm plugins:install\` to widen this check."
    exit 0
  fi
  echo "FAIL: the committed fixture tree $plugins_root is empty, so this delta"
  echo "      would compare two empty sets and pass without measuring anything."
  exit 1
fi

base="${DIAG_BASE_REF:-feat/scan-with-block-imports}"
if ! git -C "$root" rev-parse --verify -q "$base" >/dev/null 2>&1; then
  base=origin/main
fi
base_sha=$(git -C "$root" merge-base HEAD "$base")

# `python -m` puts the working directory FIRST on sys.path, ahead of PYTHONPATH.
# Run from a directory holding no `tongflow`, and assert which tree each run
# actually loaded — otherwise both runs load the same package and the delta is
# green by construction.
neutral_cwd=$(mktemp -d)

ids_at() {
  local tree="$1" loaded
  loaded=$(cd "$neutral_cwd" && PYTHONPATH="$tree/sdk" "$py" -c 'import tongflow; print(tongflow.__file__)')
  case "$loaded" in
    "$tree/sdk/"*) : ;;
    *)
      echo "FAIL: the scan meant to measure $tree/sdk loaded tongflow from" >&2
      echo "      $loaded instead — this delta would compare a tree against itself." >&2
      return 1 ;;
  esac
  (cd "$neutral_cwd" && PYTHONPATH="$tree/sdk" "$py" -m tongflow --root "$plugins_root" --abi "$abi") \
    | "$py" -c '
import json, sys
payload = json.load(sys.stdin)
print("\n".join(sorted({str(e.get("pluginId")) for e in payload.get("errors", [])})))
'
}

work=$(mktemp -d)
cleanup() {
  git -C "$root" worktree remove --force "$work/base" >/dev/null 2>&1 || true
  rm -rf "$work" "$neutral_cwd"
}
trap cleanup EXIT

git -C "$root" worktree add --detach "$work/base" "$base_sha" >/dev/null 2>&1
before=$(ids_at "$work/base")
after=$(ids_at "$root")

new=$(comm -13 <(echo "$before") <(echo "$after") || true)
if [ "$new" != "" ]; then
  echo "FAIL: over $count plugin(s) in $mode mode, HEAD reports problems for"
  echo "      plugin(s) the base ($base_sha) did not:"
  echo "$new" | sed 's/^/  - /'
  exit 1
fi
echo "ok: $mode mode, $count plugin(s), base $base_sha — no plugin became newly problematic"
