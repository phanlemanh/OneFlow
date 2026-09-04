#!/usr/bin/env bash
# Teeth for check-plan-freeze.mjs, in the shape of check-roadmap-guard-teeth.sh:
# a guard only ever observed green is indistinguishable from `exit 0`.
#
# Each case builds its own throwaway fixture (docs/roadmap.md + every
# _acceptance/<slug>/{contract,opportunity}.md), perturbs it one way, and asserts
# the guard's exit code AND message. One exit code per case; `--case` runs one;
# an unknown name is refused loudly (exit 2) rather than skipped.
#
# Three cases are the GREEN halves, and they are the point (gap-probe 2026-09-04):
#   go-bang            — the freeze can THAW
#   ngoai-le-hop-le    — the safety valve OPENS, not only blocks
#   kiem-co-hoi-de-xuat— signing without striking the proposals is NOT signing
# Without them a guard that freezes forever, or that rejects every exception,
# passes every remaining case.
set -euo pipefail
cd "$(dirname "$0")/../.."

repo_root=$(pwd)
guard="$repo_root/scripts/roadmap/check-plan-freeze.mjs"
self="$repo_root/scripts/roadmap/check-plan-freeze-teeth.sh"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

CASES=(
  clean
  khoi-hong
  o-moi-ngoai-ke-hoach
  tick-noi-doi
  tin-theo-loi
  park-khong-that
  ngoai-le-tran
  ngoai-le-hop-le
  go-bang
  checkpoint-note
  checkpoint-done
  kiem-co-hoi
  kiem-co-hoi-de-xuat
  builtins-only
  case-isolation
)

is_case() { local n="$1" c; for c in "${CASES[@]}"; do [ "$c" = "$n" ] && return 0; done; return 1; }

build_fixture() {
  rm -rf "$tmp/t"
  mkdir -p "$tmp/t/docs" "$tmp/t/_acceptance"
  cp "$repo_root/docs/roadmap.md" "$tmp/t/docs/roadmap.md"
  for d in "$repo_root"/_acceptance/*/; do
    slug=$(basename "$d")
    mkdir -p "$tmp/t/_acceptance/$slug"
    [ -f "$d/contract.md" ] && cp "$d/contract.md" "$tmp/t/_acceptance/$slug/"
    [ -f "$d/opportunity.md" ] && cp "$d/opportunity.md" "$tmp/t/_acceptance/$slug/"
  done
  return 0
}

# Output is KEPT: several criteria are about the message, not just the code.
guard_capture() {
  local rc=0
  (cd "$tmp/t" && node "$guard") > "$tmp/out" 2>&1 || rc=$?
  return $rc
}
guard_is_red()   { ! guard_capture; }
guard_is_green() {   guard_capture; }
out_has() { grep -Eq -- "$1" "$tmp/out"; }
denominator() { sed -n 's/.*tổng [0-9]*\/\([0-9]*\).*/\1/p' "$tmp/out" | head -1; }

# Flip one plan row's state. $1 = substring unique to the row, $2 = new state.
set_row_state() {
  python3 - "$tmp/t/docs/roadmap.md" "$1" "$2" <<'PY'
import sys, pathlib
p, needle, state = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
s = p.read_text(encoding="utf-8")
start, end = s.index("<!-- plan-freeze:start -->"), s.index("<!-- plan-freeze:end -->")
out, hit = [], 0
for line in s[start:end].split("\n"):
    if line.startswith("|") and needle in line:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == 6:
            cells[4] = state
            line = "| " + " | ".join(cells) + " |"
            hit += 1
    out.append(line)
if hit != 1:
    raise SystemExit(f"fixture stale: needle {needle!r} matched {hit} rows, want 1")
p.write_text(s[:start] + "\n".join(out) + s[end:], encoding="utf-8")
PY
}

add_exception_row() {
  python3 - "$tmp/t/docs/roadmap.md" "$1" <<'PY'
import sys, pathlib
p, row = pathlib.Path(sys.argv[1]), sys.argv[2]
s = p.read_text(encoding="utf-8")
p.write_text(s.replace("<!-- plan-freeze:end -->", row + "\n<!-- plan-freeze:end -->", 1), encoding="utf-8")
PY
}

stray_dossier() {
  mkdir -p "$tmp/t/_acceptance/$1"
  printf -- '---\nschema_version: 1\nslug: %s\nstatus: draft\n---\n' "$1" > "$tmp/t/_acceptance/$1/contract.md"
}

# --- cases ------------------------------------------------------------------

# AC-1 control: the real tree must be green and the ratio line must be present
# with 16 stars — a guard printing "0/0" would also be green. The DENOMINATOR is
# deliberately not pinned here; ngoai-le-hop-le proves it moves.
case_clean() {
  build_fixture
  guard_is_green || return 1
  out_has 'plan-freeze: ★ [0-9]+/16 · tổng [0-9]+/[0-9]+ \([0-9]+%\) · còn băng' || return 1
  [ ! -e "$tmp/t/node_modules" ]
}

# AC-8. Block unreadable -> F0, fail-closed.
case_khoi_hong() {
  build_fixture
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1])
p.write_text(p.read_text(encoding="utf-8").replace("<!-- plan-freeze:end -->", "", 1), encoding="utf-8")
PY
  guard_is_red || return 1
  out_has 'VIOLATION \[plan-freeze\] F0' || return 1
  out_has 'marker'
}

# AC-2. A new working-state dossier whose slug is in none of the three tables.
case_o_moi_ngoai_ke_hoach() {
  build_fixture
  stray_dossier la-ngoai-ke-hoach
  guard_is_red || return 1
  out_has 'F1' || return 1
  out_has 'la-ngoai-ke-hoach mở ngoài kế hoạch'
}

# AC-3 red half. A slug row ticked ✅ while its contract is not signed off.
case_tick_noi_doi() {
  build_fixture
  set_row_state "| skill-system-v1 |" "✅"
  guard_is_red || return 1
  out_has 'F2' || return 1
  out_has 'skill-system-v1 chưa ký'
}

# AC-3 trusted half. A slug-less row with no `kiểm:` note is accepted and NAMED.
case_tin_theo_loi() {
  build_fixture
  set_row_state "| A2 |" "✅"
  guard_is_green || return 1
  out_has 'tin theo lời.*A2'
}

# AC-4. Park table says parked; opportunity.md disagrees.
case_park_khong_that() {
  build_fixture
  python3 - "$tmp/t/_acceptance/timeline-view/opportunity.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
assert "decision: park" in s, "fixture stale: timeline-view is not parked on the real tree"
p.write_text(s.replace("decision: park", "decision:", 1), encoding="utf-8")
PY
  guard_is_red || return 1
  out_has 'F3' || return 1
  out_has 'timeline-view khai park mà hồ sơ chưa park'
}

# AC-5 red half. An exception with a reason outside the named three.
case_ngoai_le_tran() {
  build_fixture
  add_exception_row "| tien-tay | tiện | 2026-09-05 | Manh |"
  guard_is_red || return 1
  out_has 'F4' || return 1
  out_has 'tien-tay không có lý do có tên'
}

# AC-5 GREEN HALF (gap-probe 2026-09-04 P0). The freeze's safety valve must be
# shown to OPEN, not just to block: a well-formed exception is accepted, its slug
# joins F1's allowed set, and the denominator grows by one. Without this the valve
# is only ever exercised the day there is a real security incident.
case_ngoai_le_hop_le() {
  build_fixture
  stray_dossier su-co-bao-mat
  guard_is_red || return 1
  out_has 'su-co-bao-mat mở ngoài kế hoạch' || return 1
  local before after
  before=$(denominator)
  add_exception_row "| su-co-bao-mat | bảo-mật | 2026-09-20 | Manh |"
  guard_is_green || return 1
  ! out_has 'su-co-bao-mat mở ngoài kế hoạch' || return 1
  after=$(denominator)
  [ -n "$before" ] && [ -n "$after" ] && [ "$after" -eq $((before + 1)) ]
}

# AC-6. THE THAW. Every row ✅ with every slug row backed by a signed contract:
# the guard must say GỠ BĂNG, exit 0, and F1 must be OFF. Without this case a
# guard hardcoded to freeze forever passes every other case.
case_go_bang() {
  build_fixture
  python3 - "$tmp/t" <<'PY'
import sys, pathlib, re
root = pathlib.Path(sys.argv[1])
p = root / "docs" / "roadmap.md"; s = p.read_text(encoding="utf-8")
start, end = s.index("<!-- plan-freeze:start -->"), s.index("<!-- plan-freeze:end -->")
block = s[start:end]
park_at = block.index("**Xếp lại sau**")
main, rest = block[:park_at], block[park_at:]
out = []
for line in main.split("\n"):
    if line.startswith("|") and not line.startswith("|---") and not line.startswith("| # "):
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == 6:
            cells[4] = "✅"
            slug = cells[3]
            if slug != "—":
                d = root / "_acceptance" / slug; d.mkdir(parents=True, exist_ok=True)
                c = d / "contract.md"
                if c.exists():
                    t = re.sub(r"^status:.*$", "status: signed-off", c.read_text(encoding="utf-8"),
                               count=1, flags=re.M)
                else:
                    t = (f"---\nschema_version: 1\nfeature: fixture\nslug: {slug}\n"
                         f"risk_tier: T2\nstatus: signed-off\n---\n")
                c.write_text(t, encoding="utf-8")
            line = "| " + " | ".join(cells) + " |"
    out.append(line)
# A row checked against an opportunity needs that opportunity fully signed too.
opp = root / "_acceptance" / "skill-1-footage-kho-clip" / "opportunity.md"
if opp.exists():
    t = opp.read_text(encoding="utf-8").replace("[đề xuất] ", "")
    t = re.sub(r"^stage:.*$", "stage: decided", t, count=1, flags=re.M)
    t = re.sub(r"^decision:.*$", "decision: build", t, count=1, flags=re.M)
    t = re.sub(r"^decided_by:.*$", "decided_by: Fixture", t, count=1, flags=re.M)
    opp.write_text(t, encoding="utf-8")
p.write_text(s[:start] + "\n".join(out) + rest + s[end:], encoding="utf-8")
PY
  guard_is_green || return 1
  out_has 'plan-freeze: ★ 16/16 · tổng 20/20 \(100%\) · GỠ BĂNG' || return 1
  # F1 must be off now: the stray dossier that reddens o-moi stays green here.
  stray_dossier la-ngoai-ke-hoach
  guard_is_green || return 1
  out_has 'GỠ BĂNG'
}

# AC-7. Past the checkpoint with no checkpoint_done: a NOTE, exit code unchanged.
case_checkpoint_note() {
  build_fixture
  local rc=0
  (cd "$tmp/t" && PLAN_FREEZE_TODAY=2026-12-31 node "$guard") > "$tmp/out" 2>&1 || rc=$?
  [ "$rc" -eq 0 ] || return 1
  out_has 'NOTE \[plan-freeze\] đã qua mốc tái hoạch 2026-10-09'
}

# AC-7 suppression half: checkpoint_done in the header silences the NOTE.
case_checkpoint_done() {
  build_fixture
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = "checkpoint: 2026-10-09"
assert old in s, "fixture stale: header checkpoint moved"
p.write_text(s.replace(old, old + " · checkpoint_done: 2026-10-09", 1), encoding="utf-8")
PY
  local rc=0
  (cd "$tmp/t" && PLAN_FREEZE_TODAY=2026-12-31 node "$guard") > "$tmp/out" 2>&1 || rc=$?
  [ "$rc" -eq 0 ] || return 1
  ! out_has 'NOTE \[plan-freeze\] đã qua mốc'
}

# AC-14 first half. A slug-less row carrying `kiểm: opportunity:<slug>` has its ✅
# verified against that opportunity's Cổng Đáng, not trusted.
case_kiem_co_hoi() {
  build_fixture
  set_row_state "| A1 |" "✅"
  guard_is_red || return 1
  out_has 'F2' || return 1
  out_has 'skill-1-footage-kho-clip chưa ký Cổng Đáng' || return 1
  python3 - "$tmp/t/_acceptance/skill-1-footage-kho-clip/opportunity.md" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
s = s.replace("[đề xuất] ", "")
s = re.sub(r"^stage:.*$", "stage: decided", s, count=1, flags=re.M)
s = re.sub(r"^decision:.*$", "decision: build", s, count=1, flags=re.M)
s = re.sub(r"^decided_by:.*$", "decided_by: Fixture", s, count=1, flags=re.M)
p.write_text(s, encoding="utf-8")
PY
  guard_is_green || return 1
  ! out_has 'tin theo lời.*A1'
}

# AC-14 SECOND HALF (gap-probe 2026-09-04 P1). Cổng Đáng has TWO halves: strike
# the `[đề xuất]` prefixes off the thresholds, AND sign the three human fields.
# Signing while every threshold is still a proposal would tick A1 ✅ with no line
# agreed — defeating the very "set the bar before you see the number" rule.
case_kiem_co_hoi_de_xuat() {
  build_fixture
  set_row_state "| A1 |" "✅"
  python3 - "$tmp/t/_acceptance/skill-1-footage-kho-clip/opportunity.md" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
s = re.sub(r"^stage:.*$", "stage: decided", s, count=1, flags=re.M)
s = re.sub(r"^decision:.*$", "decision: build", s, count=1, flags=re.M)
s = re.sub(r"^decided_by:.*$", "decided_by: Fixture", s, count=1, flags=re.M)
assert "[đề xuất]" in s, "fixture stale: opportunity has no [đề xuất] left to keep"
p.write_text(s, encoding="utf-8")
PY
  guard_is_red || return 1
  out_has 'F2' || return 1
  out_has 'skill-1-footage-kho-clip còn ngưỡng đề xuất' || return 1
  python3 - "$tmp/t/_acceptance/skill-1-footage-kho-clip/opportunity.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1])
p.write_text(p.read_text(encoding="utf-8").replace("[đề xuất] ", ""), encoding="utf-8")
PY
  guard_is_green
}

# AC-13. Builtins only, and refuses arguments (the CI teeth mode appends a junk
# flag and requires a non-zero exit).
case_builtins_only() {
  if grep -E '^\s*import .* from ["'"'"']' "$guard" | grep -vE 'from ["'"'"']node:'; then
    echo "    guard imports a non-builtin module" >&2
    return 1
  fi
  build_fixture
  local rc=0
  (cd "$tmp/t" && node "$guard" --co-rac-khong-ton-tai) > "$tmp/out" 2>&1 || rc=$?
  [ "$rc" -eq 2 ] || return 1
  out_has 'không nhận tham số'
}

# AC-10 teeth-of-the-teeth: each case addressable with its own token, unknown
# names refused, and the harness able to say FAIL.
case_case_isolation() {
  local c out rc
  for c in "${CASES[@]}"; do
    [ "$c" = "case-isolation" ] && continue
    out=$(bash "$self" --case "$c" 2>&1) || return 1
    [ "$(printf '%s\n' "$out" | grep -c "CASE $c: PASS")" -eq 1 ] || return 1
  done
  rc=0; out=$(bash "$self" --case khong-ton-tai 2>&1) || rc=$?
  [ "$rc" -ne 0 ] || return 1
  printf '%s\n' "$out" | grep -q "go-bang" || return 1
  rc=0; out=$(bash "$self" --selftest-fail 2>&1) || rc=$?
  [ "$rc" -ne 0 ] || return 1
  printf '%s\n' "$out" | grep -q "CASE selftest-fail: FAIL" || return 1
  return 0
}

# Deliberately failing case, deliberately OUTSIDE the CASES array: only
# `--selftest-fail` reaches it. It is the proof the harness can say FAIL.
case_selftest_fail() { return 1; }

run_case() {
  local name="$1" fn
  fn="case_$(printf '%s' "$name" | tr '-' '_')"
  if "$fn"; then echo "  ✓ CASE $name: PASS"; return 0; fi
  echo "  ✗ CASE $name: FAIL"; return 1
}

refuse() {
  echo "check-plan-freeze-teeth: $1" >&2
  echo "case hợp lệ: ${CASES[*]}" >&2
  exit 2
}

ONE_CASE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --list) printf '%s\n' "${CASES[@]}"; exit 0 ;;
    --selftest-fail) run_case selftest-fail; exit $? ;;
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

echo "→ răng của check-plan-freeze.mjs"
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
