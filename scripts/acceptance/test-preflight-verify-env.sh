#!/usr/bin/env bash
# Teeth for preflight-verify-env.sh. The preflight is only worth wiring into
# every verify round if it is red on a broken tree AND silent on a healthy one —
# a preflight that cries wolf gets muted, which is the same failure it exists to
# fix. Both directions are pinned here, on synthetic trees; nothing touches the
# real node_modules.
#
# Two cases exist purely to pin rules that were proposed and measured WRONG:
#   - "relative = healthy, absolute = broken" (false negative on a dead tree;
#     the real broken value is relative)
#   - "count the entries under node_modules/.pnpm" (a dead tree still has all
#     of them; only the bookkeeping file was overwritten)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"; cd "$ROOT"
GUARD=scripts/acceptance/preflight-verify-env.sh
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
fails=0

# Builds a synthetic repo root. $1 = case name, $2 = virtualStoreDir value to
# write into node_modules/.modules.yaml (empty = omit the field entirely),
# $3 = number of entries to populate under node_modules/.pnpm.
mk_tree() {
  local d="$WORK/$1" vsd="${2-}" entries="${3:-3}" i
  mkdir -p "$d/node_modules/.pnpm"
  for i in $(seq 1 "$entries"); do mkdir -p "$d/node_modules/.pnpm/pkg$i@1.0.0"; done
  mkdir -p "$d/node_modules/real-dep" "$d/node_modules/@scope/real-dep"
  {
    echo '{'
    echo '  "storeDir": "/Users/somebody/Library/pnpm/store/v11",'
    [ -n "$vsd" ] && echo "  $vsd,"
    echo '  "virtualStoreDirMaxLength": 120'
    echo '}'
  } > "$d/node_modules/.modules.yaml"
  echo "$d"
}

expect() { # $1 = green|red, $2 = label, $3 = tree path
  local want="$1" label="$2" tree="$3" got out
  if out="$(bash "$GUARD" "$tree" 2>&1)"; then got=green; else got=red; fi
  if [ "$got" = "$want" ]; then
    echo "  ok   [$want] $label"
  else
    echo "  FAIL [expected $want, got $got] $label"
    printf '%s\n' "$out" | sed 's/^/         | /'
    fails=$((fails + 1))
  fi
}

echo "test-preflight-verify-env:"

# --- healthy trees must stay silent -----------------------------------------
t="$(mk_tree healthy '"virtualStoreDir": ".pnpm"')"
expect green "cây lành, bookkeeping dạng JSON (pnpm hiện tại)" "$t"

t="$(mk_tree healthy_yaml 'virtualStoreDir: .pnpm')"
expect green "cây lành, bookkeeping dạng YAML thật (pnpm cũ)" "$t"

# The false-negative rule in reverse: an absolute path that RESOLVES is healthy.
t="$(mk_tree healthy_abs)"
printf '{\n  "virtualStoreDir": "%s/node_modules/.pnpm"\n}\n' "$t" > "$t/node_modules/.modules.yaml"
expect green "virtualStoreDir TUYỆT ĐỐI nhưng giải ra được — không phải bẫy" "$t"

# --- the trap as it was actually measured ------------------------------------
# 474 entries under .pnpm on a tree that is already dead: counting them would
# report "fine". The bookkeeping is what was overwritten.
t="$(mk_tree broken_relative \
  '"virtualStoreDir": "../../../../../private/var/folders/zz/T/tmp.YrBChYZMRZ/agk-baseline/node_modules/.pnpm"' \
  474)"
expect red "hình dạng THẬT: đường TƯƠNG ĐỐI vào agk-baseline đã bị xoá" "$t"

# Same tree, asserted from the other side: the store is fully populated, so any
# entry-count heuristic would have called this healthy.
n="$(find "$WORK/broken_relative/node_modules/.pnpm" -maxdepth 1 -mindepth 1 | wc -l | tr -d ' ')"
if [ "$n" -eq 474 ]; then
  echo "  ok   [red] cây hỏng vẫn đủ $n mục trong .pnpm — đếm mục KHÔNG phải phép kiểm"
else
  echo "  FAIL fixture đếm sai: $n mục"; fails=$((fails + 1))
fi

# --- each check must stand on its own ----------------------------------------
# No agk-baseline token anywhere: only "resolve and test existence" can catch it.
t="$(mk_tree broken_no_token '"virtualStoreDir": "../../../nowhere/at/all/.pnpm"')"
expect red "đường treo KHÔNG mang tên agk-baseline — grep một mình sẽ trượt" "$t"

# Target still on disk, so the resolve check passes; only the token catches it.
t="$(mk_tree foreign_but_present)"
mkdir -p "$WORK/foreign_but_present/agk-baseline/node_modules/.pnpm"
printf '{\n  "virtualStoreDir": "../agk-baseline/node_modules/.pnpm"\n}\n' \
  > "$t/node_modules/.modules.yaml"
expect red "sổ sách trỏ agk-baseline CÒN tồn tại — giải-đường một mình sẽ trượt" "$t"

# Bookkeeping restored but the links were not — the symptom STATUS.md recorded.
t="$(mk_tree dangling_links '"virtualStoreDir": ".pnpm"')"
ln -s "$WORK/deleted-temp/node_modules/.pnpm/next@1.0.0/node_modules/next" "$t/node_modules/next"
expect red "liên kết node_modules cấp 1 treo dù sổ sách đã lành" "$t"

# --- degenerate trees --------------------------------------------------------
t="$(mk_tree no_field '')"
expect red "thiếu hẳn khoá virtualStoreDir — không đọc được sổ sách" "$t"

t="$(mk_tree no_yaml '"virtualStoreDir": ".pnpm"')"; rm -f "$t/node_modules/.modules.yaml"
expect red "mất node_modules/.modules.yaml" "$t"

mkdir -p "$WORK/no_deps"
expect red "chưa cài deps (không có node_modules/)" "$WORK/no_deps"

[ "$fails" -eq 0 ] || { echo "FAIL: $fails trường hợp phân loại sai"; exit 1; }
echo "OK: preflight đỏ trên mọi hình dạng hỏng đã đo, và im trên cây lành"
