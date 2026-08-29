#!/usr/bin/env bash
# Teeth for check-roadmap-fresh.sh, in the shape this repo already uses for
# check-manifest-guard-teeth.sh: a guard that has only ever been observed green
# is indistinguishable from a guard that returns 0 unconditionally.
#
# Perturbs a throwaway copy of the tree and asserts the guard reacts correctly
# each time. Perturbation `historical-244cb0b` is not synthetic: it is the
# roadmap exactly as it stood on main @ 244cb0b, which is the drift this guard
# was written to catch.
#
# ONE EXIT CODE PER CASE (AC-7). The first version of this script ran every
# perturbation behind a single exit code, which collapses N criteria into one:
# a case that was never implemented looks identical to a case that passed, and
# both are green. This repo already paid for that lesson once — see the
# `stale-scope-by-paths` comment in _acceptance/config.yaml. So each case is
# addressable with `--case <name>`, owns its own exit code, and prints its own
# labelled token `CASE <name>: PASS|FAIL` that the eval greps for.
#
# An unknown `--case` name is REFUSED loudly (exit 2 + the valid list) rather
# than skipped: a typo that exits 0 turns an eval into a permanent green no-op,
# which is the same fail-open class the kit's product-map guards against.
#
# Usage (from the repo root):
#   pnpm roadmap:teeth                  # every case; non-zero if any fails
#   bash .../check-roadmap-guard-teeth.sh --case ledger-stale
#   bash .../check-roadmap-guard-teeth.sh --list
set -euo pipefail
cd "$(dirname "$0")/../.."

repo_root=$(pwd)
drift="$repo_root/scripts/roadmap/roadmap-drift.mjs"
self="$repo_root/scripts/roadmap/check-roadmap-guard-teeth.sh"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# Order is the reading order of the report, not an execution dependency: every
# case builds its own fixture from scratch and can run alone.
CASES=(
  clean
  historical-244cb0b
  ledger-missing
  ledger-stale
  ledger-paired
  adr-uncited
  superseded-bare
  superseded-paired
  supersede-source-single
  case-isolation
)

is_case() { local n="$1" c; for c in "${CASES[@]}"; do [ "$c" = "$n" ] && return 0; done; return 1; }

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

# Vòng verify 1 (2026-08-27) chỉ ra một lỗ ngay tại đây: mọi case chạy guard với
# output VỨT ĐI, nên bộ răng chỉ khẳng định ĐỎ hay XANH. AC-1 đòi guard in id KÈM
# TIÊU ĐỀ, AC-2 đòi nêu cả hai id KÈM TRÍCH DẪN <=110 ký tự — không case nào giữ
# những thứ đó lại, nên một bản sửa làm nghèo thông điệp vẫn giữ 10/10 xanh.
# Từ đây guard chạy một lần, output nằm ở $tmp/out, và case nào có yêu cầu nội
# dung thì khẳng định nội dung.
guard_capture() {
  local rc=0
  (cd "$tmp/t" && node "$drift") > "$tmp/out" 2>&1 || rc=$?
  return $rc
}
guard_is_red()   { ! guard_capture; }
guard_is_green() {   guard_capture; }
out_has() { grep -Eq -- "$1" "$tmp/out"; }

# --- the cases ------------------------------------------------------------
# Each returns 0 when the guard behaved as the criterion requires.

# AC-8. Control: the tree as it stands must be green, else every red below is
# noise — and without it a guard hardcoded to `exit 1` passes every other case.
case_clean() {
  build_fixture
  guard_is_green || return 1
  # Dòng đếm phải CÓ MẶT và hai số phải BẰNG NHAU: một guard in "0 đã ký, 0 dòng"
  # trên cây thật cũng xanh, và cái xanh đó không nghĩa gì.
  out_has 'sổ cái: [0-9]+ hạng mục đã ký, [0-9]+ dòng trong sổ' || return 1
  python3 - "$tmp/out" <<'LEDGER'
import sys, pathlib, re
m = re.search(r"sổ cái: (\d+) hạng mục đã ký, (\d+) dòng trong sổ",
              pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
if not m: raise SystemExit("thiếu dòng đếm sổ cái")
a, b = int(m.group(1)), int(m.group(2))
if a != b: raise SystemExit(f"sổ cái lệch: {a} đã ký vs {b} dòng")
if a == 0: raise SystemExit("sổ cái rỗng — cây thật phải có hạng mục đã ký")
LEDGER
}

# AC-6. THE REAL DRIFT: roadmap as it stood on main @ 244cb0b (19/08).
# ADR-0011 unmentioned, Phase 2 citing ADR-0005 alone, no ledger at all.
case_historical_244cb0b() {
  build_fixture
  # FAIL-CLOSED (vòng 4). Bản trước không kiểm mã thoát của `git show`, và thân
  # case chạy trong ngữ cảnh `if "$fn"` nên `set -e` bị TẮT: trên clone nông
  # hoặc sau một lần viết lại lịch sử, `git show` hỏng để lại roadmap 0 byte,
  # guard đỏ vì lý do hoàn toàn khác, và case vẫn in PASS — AC-6, tiêu chí DUY
  # NHẤT neo vào cú trôi có thật, hoá no-op xanh vĩnh viễn. Một eval không tự
  # kiểm được Given của nó thì cái Then nó khẳng định không nói lên điều gì.
  if ! git show 244cb0b:docs/roadmap.md > "$tmp/t/docs/roadmap.md" 2>/dev/null; then
    echo "    (Given chưa dựng được: git show 244cb0b:docs/roadmap.md không phân giải — clone nông?)" >&2
    return 1
  fi
  if [ ! -s "$tmp/t/docs/roadmap.md" ]; then
    echo "    (Given chưa dựng được: roadmap lịch sử rỗng)" >&2
    return 1
  fi
  guard_is_red
}

# AC-4. One signed contract dropped out of the ledger.
case_ledger_missing() {
  build_fixture
  grep -v '`local-cpu-plugins`' "$tmp/t/docs/roadmap.md" > "$tmp/x" && mv "$tmp/x" "$tmp/t/docs/roadmap.md"
  guard_is_red || return 1
  out_has 'local-cpu-plugins' || return 1          # AC-4: gọi ĐÚNG TÊN slug
  out_has 'chưa được phân loại trong sổ cái'
}

# AC-5. Ledger keeps a row for something no longer signed off.
case_ledger_stale() {
  build_fixture
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
s = s.replace("<!-- roadmap-ledger:end -->",
              "| `a-feature-that-never-shipped` | T2 | 01/01 | 9.9 |\n\n<!-- roadmap-ledger:end -->")
p.write_text(s, encoding="utf-8")
PY
  guard_is_red || return 1
  out_has 'a-feature-that-never-shipped' || return 1   # AC-5: gọi ĐÚNG TÊN slug
  out_has 'không còn ở trạng thái ký'
}

# AC-4 suppression half. A slug that is signed off AND carries a ledger row must
# NOT fire check C — including while the rest of the ledger churns around it.
# Without this, a guard that fires on EVERY ledger configuration passes both
# ledger-missing and ledger-stale and is still worthless.
case_ledger_paired() {
  build_fixture
  mkdir -p "$tmp/t/_acceptance/zz-teeth-fixture"
  cat > "$tmp/t/_acceptance/zz-teeth-fixture/contract.md" <<'CONTRACT'
---
schema_version: 1
feature: fixture đã ký, dùng cho nửa suppression của kiểm C
slug: zz-teeth-fixture
risk_tier: T2
status: signed-off
---
CONTRACT
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
s = s.replace("<!-- roadmap-ledger:end -->",
              "| `zz-teeth-fixture` | T2 | 27/08 | 0.0 |\n\n<!-- roadmap-ledger:end -->")
p.write_text(s, encoding="utf-8")
PY
  guard_is_green
}

# AC-1. An ADR exists that the roadmap never mentions.
case_adr_uncited() {
  build_fixture
  # 0099, not "next number": a real ADR taking the fixture's id would make this
  # perturbation silently test nothing (the id would already be mentioned).
  cp "$tmp/t/docs/adr/0011-local-first-execution.md" "$tmp/t/docs/adr/0099-a-decision-nobody-wrote-down.md"
  guard_is_red || return 1
  # AC-1: id VÀ tiêu đề. In mỗi con số bốn chữ thì người đọc log vẫn phải mở thư
  # mục ADR ra tra — đúng việc thông điệp này sinh ra để khỏi phải làm.
  out_has 'ADR-0099 không được nhắc lần nào trong docs/roadmap\.md — ".+"'
}

# Shared by superseded-bare and superseded-paired: strip every mention of the
# heir from the FIRST block citing both, so check A still passes and only
# check B can catch it.
strip_heir_from_block() {
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
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
}

# AC-2. SHARPEST RED: ADR-0011 still mentioned elsewhere, but stripped from the
# one block that cites superseded ADR-0005. Check A passes, check B must not.
case_superseded_bare() {
  build_fixture
  strip_heir_from_block
  guard_is_red || return 1
  out_has 'viện dẫn ADR-0005 \(đã bị ADR-0011 thay thế\)' || return 1
  # AC-2: kèm trích dẫn khối phạm lỗi, tối đa 110 ký tự. Không có trích dẫn thì
  # người sửa biết CÓ lỗi mà không biết lỗi nằm ở khối nào trong 197 dòng.
  python3 - "$tmp/out" <<'EXCERPT'
import sys, pathlib, re
txt = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
m = re.search(r'không nhắc ADR thay nó: "(.*?)…"', txt, re.S)
if not m: raise SystemExit("thông điệp thiếu trích dẫn khối phạm lỗi")
if not m.group(1).strip(): raise SystemExit("trích dẫn rỗng")
if len(m.group(1)) > 110: raise SystemExit(f"trích dẫn {len(m.group(1))} ký tự — vượt 110")
EXCERPT
}

# AC-3 suppression half. Take the block this guard just went red on and apply
# the fix the guard is asking for — name the heir alongside the superseded id.
# The guard must go GREEN. Asserting only the red half would be satisfied by a
# check B that fires on every block citing ADR-0005, fixed or not; a guard that
# keeps shouting after you comply is one people learn to ignore.
case_superseded_paired() {
  build_fixture
  strip_heir_from_block
  guard_is_red || return 1   # the red half must hold first, else green is meaningless
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
# Put the heir's name back into the same block, the way an author fixing the
# drift would: one mention next to the superseded id.
s = s.replace("quyết định mới", "ADR-0011", 1)
p.write_text(s, encoding="utf-8")
PY
  guard_is_green
}

# AC-9. The supersede relation must come from the docs/adr/README.md table and
# nowhere else. Declare a NEW relation there — no ADR file, so check A stays
# quiet and only check B can react — and the guard must pick it up with no edit
# of its own. Guards against the cheap regression: hardcoding a relation map
# inside roadmap-drift.mjs, which would keep every other case green.
case_supersede_source_single() {
  build_fixture
  guard_is_green || return 1   # baseline: without the new row the tree is clean
  python3 - "$tmp/t/docs/adr/README.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
row = "| [0099](0099-fixture.md) | Quyết định fixture — **thay thế** ADR-0003 | 2026-08-27 |\n"
lines = s.rstrip("\n").split("\n")
last_row = max(i for i, l in enumerate(lines) if l.strip().startswith("|"))
lines.insert(last_row + 1, row.rstrip("\n"))
p.write_text("\n".join(lines) + "\n", encoding="utf-8")
PY
  guard_is_red
}

# AC-7. TEETH OF THE TEETH. Two halves, both required:
#   (a) every sibling case is individually addressable and yields its own exit
#       code plus its own labelled token — six cases behind one exit code is
#       six criteria collapsed into one;
#   (b) an unknown case name is refused loudly, not silently accepted. Without
#       (b) a typo in an eval's --case turns that eval into a green no-op that
#       tests nothing, forever.
case_case_isolation() {
  local c out rc
  for c in "${CASES[@]}"; do
    [ "$c" = "case-isolation" ] && continue    # no recursion
    out=$(bash "$self" --case "$c" 2>&1) || return 1
    # AC-7 nói "kèm ĐÚNG MỘT token nhãn". grep -q chỉ trả lời có-mặt, nên một
    # case in nhãn của case khác kèm nhãn của mình vẫn lọt (vòng 3).
    [ "$(printf '%s\n' "$out" | grep -c "CASE $c: PASS")" -eq 1 ] || return 1
  done
  # (b) an invented name must exit non-zero AND print the valid list
  rc=0; out=$(bash "$self" --case khong-ton-tai 2>&1) || rc=$?
  [ "$rc" -ne 0 ] || return 1
  printf '%s\n' "$out" | grep -q "ledger-stale" || return 1
  # (c) nửa CÒN LẠI của AC-7: "case hỏng thoát khác 0". Mọi case thật đều đạt,
  # nên không lần chạy nào chứng minh được bộ răng CÓ THỂ báo hỏng — một harness
  # chỉ biết in PASS thuộc đúng họ fail-open với một cổng chỉ biết in xanh.
  # `--selftest-fail` chạy một case cố tình hỏng, không nằm trong CASES nên
  # không bao giờ làm bẩn lần chạy thật (vòng 3, lỗ do người kiểm vòng 2 chỉ ra).
  rc=0; out=$(bash "$self" --selftest-fail 2>&1) || rc=$?
  [ "$rc" -ne 0 ] || return 1
  printf '%s\n' "$out" | grep -q "CASE selftest-fail: FAIL" || return 1
  return 0
}

# Case cố tình hỏng, CHỦ Ý nằm ngoài mảng CASES: chỉ `--selftest-fail` gọi tới.
case_selftest_fail() { return 1; }

run_case() {
  local name="$1" fn
  fn="case_$(printf '%s' "$name" | tr '-' '_')"
  if "$fn"; then
    echo "  ✓ CASE $name: PASS"
    return 0
  fi
  echo "  ✗ CASE $name: FAIL"
  return 1
}

refuse() {
  echo "check-roadmap-guard-teeth: $1" >&2
  echo "case hợp lệ: ${CASES[*]}" >&2
  exit 2
}

# --- CLI ------------------------------------------------------------------
# Mode is settled before anything runs, in the shape the kit already uses for
# this exact failure class: a typo must never turn a CHECK into a silent pass.
ONE_CASE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --list) printf '%s\n' "${CASES[@]}"; exit 0 ;;
    --selftest-fail)
      # Không khai trong --list: đây không phải case của bộ răng, nó là bằng
      # chứng bộ răng biết nói FAIL. Chỉ case-isolation gọi.
      run_case selftest-fail; exit $? ;;
    --case)
      [ $# -ge 2 ] || refuse "\`--case\` cần một tên ngay sau nó — nhận được (trống)"
      case "$2" in --*) refuse "\`--case\` cần một tên ngay sau nó — nhận được \`$2\`" ;; esac
      is_case "$2" || refuse "case lạ \`$2\`"
      ONE_CASE="$2"; shift 2 ;;
    *) refuse "tham số lạ \`$1\` — chỉ nhận \`--case <tên>\` và \`--list\`" ;;
  esac
done

if [ -n "$ONE_CASE" ]; then
  echo "→ răng: case $ONE_CASE"
  run_case "$ONE_CASE"
  exit $?
fi

echo "→ răng của check-roadmap-fresh.sh"
pass=0
fail=0
for c in "${CASES[@]}"; do
  if run_case "$c"; then pass=$((pass + 1)); else fail=$((fail + 1)); fi
done

echo
if [ "$fail" -ne 0 ]; then
  echo "❌ răng: $pass đạt / $fail hỏng — guard không đáng tin"
  exit 1
fi
echo "✅ răng: $pass/$pass case — mỗi case một mã thoát riêng"
