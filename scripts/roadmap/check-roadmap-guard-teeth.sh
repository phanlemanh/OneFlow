#!/usr/bin/env bash
# Teeth for check-roadmap-fresh.sh, in the shape this repo already uses for
# check-manifest-guard-teeth.sh: a guard that has only ever been observed green
# is indistinguishable from a guard that returns 0 unconditionally.
#
# Perturbs a throwaway copy of the tree five ways and asserts the guard goes RED
# each time. Perturbation 1 is not synthetic: it is the roadmap exactly as it
# stood on main @ 244cb0b, which is the drift this guard was written to catch.
#
# Run from the repo root.
set -euo pipefail
cd "$(dirname "$0")/../.."

repo_root=$(pwd)
drift="$repo_root/scripts/roadmap/roadmap-drift.mjs"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# A minimal tree the drift script can read: docs/ plus contract.md files only.
build_fixture() {
  rm -rf "$tmp/t"
  mkdir -p "$tmp/t/docs" "$tmp/t/_acceptance"
  cp -R "$repo_root/docs/adr" "$tmp/t/docs/adr"
  cp "$repo_root/docs/roadmap.md" "$tmp/t/docs/roadmap.md"
  for d in "$repo_root"/_acceptance/*/; do
    slug=$(basename "$d")
    [ -f "$d/contract.md" ] || continue
    mkdir -p "$tmp/t/_acceptance/$slug"
    cp "$d/contract.md" "$tmp/t/_acceptance/$slug/contract.md"
  done
}

pass=0
fail=0

expect_red() {
  local label="$1"
  if (cd "$tmp/t" && node "$drift" >/dev/null 2>&1); then
    echo "  ✗ $label — guard vẫn XANH (không có răng)"
    fail=$((fail + 1))
  else
    echo "  ✓ $label — guard ĐỎ đúng như phải vậy"
    pass=$((pass + 1))
  fi
}

expect_green() {
  local label="$1"
  if (cd "$tmp/t" && node "$drift" >/dev/null 2>&1); then
    echo "  ✓ $label — guard XANH đúng như phải vậy"
    pass=$((pass + 1))
  else
    echo "  ✗ $label — guard ĐỎ nhầm (báo động giả)"
    fail=$((fail + 1))
  fi
}

echo "→ răng của check-roadmap-fresh.sh"

# 0. Control: the tree as it stands must be green, else every red below is noise.
build_fixture
expect_green "0. cây hiện tại, không đụng gì"

# 1. THE REAL DRIFT: roadmap as it stood on main @ 244cb0b (19/08).
#    ADR-0011 unmentioned, Phase 2 citing ADR-0005 alone, no ledger at all.
build_fixture
git show 244cb0b:docs/roadmap.md > "$tmp/t/docs/roadmap.md"
expect_red "1. roadmap lịch sử trên main @ 244cb0b (trôi có thật)"

# 2. One signed contract dropped out of the ledger.
build_fixture
grep -v '`local-cpu-plugins`' "$tmp/t/docs/roadmap.md" > "$tmp/x" && mv "$tmp/x" "$tmp/t/docs/roadmap.md"
expect_red "2. một hạng mục đã ký biến khỏi sổ cái"

# 3. Ledger keeps a row for something no longer signed off.
build_fixture
python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
s = s.replace("<!-- roadmap-ledger:end -->",
              "| `a-feature-that-never-shipped` | T2 | 01/01 | 9.9 |\n\n<!-- roadmap-ledger:end -->")
p.write_text(s, encoding="utf-8")
PY
expect_red "3. sổ cái giữ dòng cho hồ sơ không còn ký"

# 4. An ADR exists that the roadmap never mentions.
build_fixture
cp "$tmp/t/docs/adr/0011-local-first-execution.md" "$tmp/t/docs/adr/0012-a-decision-nobody-wrote-down.md"
expect_red "4. có ADR mới mà roadmap chưa nhắc"

# 5. SHARPEST: ADR-0011 still mentioned elsewhere, but stripped from the one
#    block that cites superseded ADR-0005. Check A passes, check B must not.
build_fixture
python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
# Operate on the same unit the guard reasons about: a blank-line-separated
# block. Strip every mention of the heir (link form and bare) from the FIRST
# block citing both, so check A still passes and only check B can catch it.
blocks = s.split("\n\n")
for i, b in enumerate(blocks):
    if "ADR-0005" in b and "ADR-0011" in b:
        stripped = re.sub(r"\[ADR-0011\]\([^)]*\)", "quyết định mới", b)
        stripped = stripped.replace("ADR-0011", "quyết định mới")
        blocks[i] = stripped
        break
else:
    raise SystemExit("fixture stale: no block cites both ADR-0005 and ADR-0011")
out = "\n\n".join(blocks)
if "ADR-0011" not in out:
    raise SystemExit("fixture stale: ADR-0011 must survive elsewhere or check A fires instead")
p.write_text(out, encoding="utf-8")
PY
expect_red "5. khối viện dẫn ADR-0005 mất tên ADR thay nó (A xanh, B phải đỏ)"

echo
if [ "$fail" -ne 0 ]; then
  echo "❌ răng: $pass đạt / $fail hỏng — guard không đáng tin"
  exit 1
fi
echo "✅ răng: $pass/$pass — guard đỏ ở cả bốn kiểu trôi và xanh trên cây sạch"
