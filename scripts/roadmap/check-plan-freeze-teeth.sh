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
  o-moi-co-hoi-hong
  park-chua-ky
  park-ngoai-bang
  ngoai-le-thieu-ngay
  kill-hop-le
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
  # A LÀNH tree by the F5 rule: a park carries the two human fields. On the real
  # tree the three parks this branch lands still have them EMPTY — that is the
  # owner's signature to write, not the machine's, and the guard is red there on
  # purpose. The fixture fills them so the other cases measure what they claim to
  # measure; ca `park-chua-ky` below is the one that proves the guard notices when
  # they are missing, which is exactly today's state of the real tree.
  python3 - "$tmp/t/_acceptance" <<'PY'
import pathlib, re, sys
for o in pathlib.Path(sys.argv[1]).glob("*/opportunity.md"):
    t = o.read_text(encoding="utf-8")
    if not re.search(r"^decision:\s*(park|kill)\s*$", t, re.M):
        continue
    t = re.sub(r"^decided_by:\s*$", "decided_by: Fixture", t, count=1, flags=re.M)
    t = re.sub(r"^decided_at:\s*$", "decided_at: 2026-09-04", t, count=1, flags=re.M)
    o.write_text(t, encoding="utf-8")
PY
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
# AC-8 is a CLASS of four: missing marker · missing header key · wrong column
# count · state outside ⬜ ◐ ✅. Only the first was ever exercised (S4 round 1),
# so the other three die() branches could have been misspelled, mis-regexed, or
# exited 0 and the suite stayed green. Four shapes, four asserted messages.
case_khoi_hong() {
  local shape
  for shape in mat-marker thieu-khoa-header sai-so-cot trang-thai-la; do
    build_fixture
    if python3 - "$tmp/t/docs/roadmap.md" "$shape" <<'PY'
import sys, pathlib
p, shape = pathlib.Path(sys.argv[1]), sys.argv[2]
s = p.read_text(encoding="utf-8")
if shape == "mat-marker":
    s = s.replace("<!-- plan-freeze:end -->", "", 1)
elif shape == "thieu-khoa-header":
    s = s.replace(" · checkpoint: 2026-10-09", "", 1)
elif shape == "sai-so-cot":
    # Drop one separator from a data row: the row now has 5 cells, not 6.
    i = s.index("<!-- plan-freeze:start -->")
    j = s.index("| B1 |", i)
    k = s.index("\n", j)
    s = s[:j] + s[j:k].replace(" | ", " ", 1) + s[k:]
else:
    i = s.index("<!-- plan-freeze:start -->")
    j = s.index("| B1 |", i)
    k = s.index("\n", j)
    row = s[j:k]
    cells = [c.strip() for c in row.strip().strip("|").split("|")]
    cells[4] = "X"
    s = s[:j] + "| " + " | ".join(cells) + " |" + s[k:]
p.write_text(s, encoding="utf-8")
PY
    then :; else echo "    dung fixture $shape that bai — hang trong khoi da doi ten?" >&2; return 1; fi
    guard_is_red || { echo "    hinh dang $shape van XANH — F0 khong fail-closed" >&2; return 1; }
    out_has 'VIOLATION \[plan-freeze\] F0' || { echo "    $shape do nhung khong phai F0" >&2; return 1; }
    case "$shape" in
      mat-marker)        out_has 'marker' ;;
      thieu-khoa-header) out_has 'header thiếu khoá' ;;
      sai-so-cot)        out_has 'cột, cần' ;;
      trang-thai-la)     out_has 'ngoài ⬜ ◐ ✅' ;;
    esac || { echo "    $shape do nhung thong diep khong noi ro ca nao" >&2; return 1; }
  done
}

# AC-2. A new working-state dossier whose slug is in none of the three tables.
case_o_moi_ngoai_ke_hoach() {
  build_fixture
  stray_dossier la-ngoai-ke-hoach
  guard_is_red || return 1
  out_has 'F1' || return 1
  out_has 'la-ngoai-ke-hoach mở ngoài kế hoạch'
}

# AC-2, nua bi bo sot (S4 vong 1, muc nang nhat). `stray_dossier` chi viet
# contract.md, tuc chi di duong FAIL-CLOSED. Ho so CHI-CO-CO-HOI di duong khac, va
# duong ay tung fail-OPEN: frontmatter hong / `Discovery` viet hoa / `stage` la deu
# doc thanh "khong co gi" va guard thoat 0 xanh. Ba hinh dang, mot ca.
case_o_moi_co_hoi_hong() {
  local shape
  for shape in fm-hong hoa-D stage-la; do
    build_fixture
    mkdir -p "$tmp/t/_acceptance/probe-$shape"
    case "$shape" in
      fm-hong)  printf -- '---\nschema_version: 1\nslug: probe-%s\nstage: discovery\n' "$shape" > "$tmp/t/_acceptance/probe-$shape/opportunity.md" ;;
      hoa-D)    printf -- '---\nschema_version: 1\nslug: probe-%s\nstage: Discovery\n---\n' "$shape" > "$tmp/t/_acceptance/probe-$shape/opportunity.md" ;;
      stage-la) printf -- '---\nschema_version: 1\nslug: probe-%s\nstage: prototype\ndecision:\n---\n' "$shape" > "$tmp/t/_acceptance/probe-$shape/opportunity.md" ;;
    esac
    guard_is_red || { echo "    hinh dang $shape van XANH — fail-open" >&2; return 1; }
    out_has "probe-$shape mở ngoài kế hoạch" || { echo "    hinh dang $shape do nhung khong goi ten" >&2; return 1; }
  done
  # Chieu nguoc tren CUNG duong ma: mot co hoi da DONG (decision: park) khong bi
  # F1 doi, va guard XANH. Khong co ve nay thi mot guard doi MOI thu muc co
  # opportunity.md cung qua het ba hinh dang tren.
  build_fixture
  mkdir -p "$tmp/t/_acceptance/probe-da-park"
  # Park HOP LE day du theo F5: niem yet trong bang + hai truong nguoi. Thieu bat
  # ky ve nao thi ca nay do vi F5 chu khong vi F1, va no khong con do dieu no khai.
  printf -- '---\nschema_version: 1\nslug: probe-da-park\nstage: decided\ndecision: park\ndecided_by: Ai Do\ndecided_at: 2026-09-04\n---\n' > "$tmp/t/_acceptance/probe-da-park/opportunity.md"
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
i = s.index("**Xếp lại sau**"); j = s.index("\n", s.index("|---", i)) + 1
p.write_text(s[:j] + "| probe-da-park | thu nghiem rang | — |\n" + s[j:], encoding="utf-8")
PY
  guard_is_green || { echo "    co hoi da park hop le van bi doi — F1 qua rong" >&2; return 1; }
  ! out_has 'probe-da-park'
}

# AC-16 nua CHUA KY. Go truong nguoi cua mot ho so da park -> F5. Day dung la
# hien trang cay THAT tai 04/09: ba ho so park deu trong decided_by/decided_at.
case_park_chua_ky() {
  build_fixture
  python3 - "$tmp/t/_acceptance/timeline-view/opportunity.md" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
# Gia tri co the la ten that (cay da ky) hay "Fixture" (build_fixture dien ho);
# ca nay chi can no CO gia tri roi go di, khong quan tam gia tri nao.
assert re.search(r"^decided_by: \S", s, re.M), "fixture stale: khong ho so park nao co decided_by"
p.write_text(re.sub(r"^decided_by: .*$", "decided_by:", s, count=1, flags=re.M), encoding="utf-8")
PY
  guard_is_red || return 1
  out_has 'F5' || return 1
  out_has 'timeline-view khai park nhưng thiếu decided_by'
}

# AC-16 nua CHUA NIEM YET. Mot ho so park khong co dong nao trong bang Xep lai
# sau: F1 bo qua no vi da dong, F3 chi di theo cac dong CO trong bang, nen truoc
# F5 khong luat nao cham toi no — go bang chi bang mot dong trong ho so cua chinh
# minh (do bang probe o S4 vong 2).
case_park_ngoai_bang() {
  build_fixture
  mkdir -p "$tmp/t/_acceptance/zz-park-lau"
  printf -- '---\nschema_version: 1\nslug: zz-park-lau\nstage: decided\ndecision: park\ndecided_by: Ai Do\ndecided_at: 2026-09-04\n---\n' \
    > "$tmp/t/_acceptance/zz-park-lau/opportunity.md"
  guard_is_red || { echo "    park ngoai bang van XANH — van con duong go bang mot minh" >&2; return 1; }
  out_has 'F5' || return 1
  out_has 'zz-park-lau khai park nhưng không có trong bảng Xếp lại sau' || return 1
  # Chieu nguoc tren CUNG duong ma: dua dung slug ay vao bang thi het vi pham.
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
i = s.index("**Xếp lại sau**"); j = s.index("\n", s.index("|---", i)) + 1
p.write_text(s[:j] + "| zz-park-lau | thu nghiem rang | — |\n" + s[j:], encoding="utf-8")
PY
  guard_is_green || { echo "    niem yet roi ma van do — F5 chan ca duong hop le" >&2; return 1; }
  ! out_has 'zz-park-lau'
}

# AC-5 nua thu hai. Lop nay co HAI phan tu — "ly do ngoai ba ten" VA "thieu
# ngay/ai quyet" — nhung chi phan tu dau co ca do: fixture cua ngoai-le-tran mang
# ngay hop le va nguoi hop le, chi sai moi ly do. Do o S4 vong 3: xoa han nhanh
# `thieu ngay hoac ai quyet` cua guard roi chay 17/18 ca thi TAT CA van PASS. Cung
# thuoc ma AC-8 da bi ap: mot lop N phan tu can N hinh dang do.
case_ngoai_le_thieu_ngay() {
  local shape
  for shape in thieu-ngay thieu-ai-quyet; do
    build_fixture
    case "$shape" in
      thieu-ngay)     add_exception_row "| probe-$shape | bảo-mật |  | Manh |" ;;
      thieu-ai-quyet) add_exception_row "| probe-$shape | bảo-mật | 2026-09-05 |  |" ;;
    esac
    guard_is_red || { echo "    hinh dang $shape van XANH — nua lop nay khong co phep do" >&2; return 1; }
    out_has 'F4' || { echo "    $shape do nhung khong phai F4" >&2; return 1; }
    out_has "probe-$shape" || { echo "    $shape do nhung khong goi ten dong ngoai le" >&2; return 1; }
  done
}

# Chieu XANH cua F3 sau khi no thoi doi rieng `park`. Truoc S4 vong 3, mot ho so
# `decision: kill` khong co cho nao hop le: khong niem yet thi F5 doi, niem yet
# thi F3 doi — hai loi thoat loai tru nhau, va guard lai in "sua roadmap hoac ho
# so, khong sua guard". Ca nay la bang chung cua ca hai vong: kill niem yet va ky
# du thi guard XANH.
case_kill_hop_le() {
  build_fixture
  mkdir -p "$tmp/t/_acceptance/zz-da-bac"
  printf -- '---\nschema_version: 1\nslug: zz-da-bac\nstage: decided\ndecision: kill\ndecided_by: Ai Do\ndecided_at: 2026-09-04\n---\n' \
    > "$tmp/t/_acceptance/zz-da-bac/opportunity.md"
  python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
i = s.index("**Xếp lại sau**"); j = s.index("\n", s.index("|---", i)) + 1
p.write_text(s[:j] + "| zz-da-bac | da bi bac | — |\n" + s[j:], encoding="utf-8")
PY
  guard_is_green || { echo "    kill niem yet + ky du van do — F3 va F5 con mau thuan" >&2; return 1; }
  ! out_has 'zz-da-bac'
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
  out_has 'timeline-view nằm trong Xếp lại sau mà hồ sơ chưa đóng'
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
  build_fixture
  # AC-13. Bản cũ đo lời hứa "chỉ import builtins" bằng ĐÚNG MỘT grep âm, và một
  # grep âm cũng xanh khi mẫu không khớp gì: import xuống dòng (cách Biome format
  # kho này), `import "polyfill"`, `await import(...)`, `require(...)` đều lọt.
  # Vế thứ hai ("chạy trong thư mục không có node_modules") thì RỖNG: Node giải
  # specifier trần từ thư mục CỦA MODULE, không từ cwd, nên `cd $tmp/t && node
  # $guard` với $guard là đường dẫn thật trong kho vẫn thấy node_modules của kho.
  # Khẳng định ấy đúng cho mọi guard, kể cả guard phụ thuộc node_modules.
  #
  # Nên phép đo chịu lực bây giờ là PHÉP GIẢI, không phải phép grep: chép guard
  # VÀO cây tạm rồi chạy từ đó. mktemp -d không có node_modules ở bất kỳ cấp cha
  # nào, nên một import không-builtin chết thật.
  cp "$guard" "$tmp/t/guard-copy.mjs"
  guard_capture_at() { local f="$1" rc=0; (cd "$tmp/t" && node "$f") > "$tmp/out" 2>&1 || rc=$?; return $rc; }

  guard_capture_at guard-copy.mjs || { echo "    ban sao khong chay duoc ngoai cay kho" >&2; return 1; }
  out_has 'plan-freeze:' || return 1

  # Chiều đỏ trên CÙNG cơ chế: `clsx` CÓ trong node_modules của kho. Bản sao
  # import nó mà vẫn chạy nghĩa là cây tạm không hề cô lập — phép đo trên đang
  # đo bóng. Bản sao chết nghĩa là cả hai điều được chứng minh cùng lúc: cây tạm
  # thật sự không thấy node_modules, VÀ một import không-builtin thì đỏ.
  { head -1 "$guard"; echo 'import _goiNgoai from "clsx";'; tail -n +2 "$guard"; } > "$tmp/t/guard-ban.mjs"
  if guard_capture_at guard-ban.mjs; then
    echo "    ban sao import goi ngoai VAN chay — cay tam khong co lap, phep do do bong" >&2
    return 1
  fi
  out_has 'ERR_MODULE_NOT_FOUND|Cannot find package' || { echo "    ban sao chet vi ly do KHAC, khong phai vi giai goi that bai" >&2; return 1; }

  # Lưới thứ hai, rẻ: mẫu grep phải khớp ÍT NHẤT MỘT dòng thật trước khi tin vào
  # sự im lặng của nó — một khẳng định âm đứng một mình cũng xanh khi mẫu sai.
  local n_import
  n_import=$(grep -cE '^\s*import .* from ["'"'"']node:' "$guard" || true)
  [ "$n_import" -ge 1 ] || { echo "    mau import khong khop dong nao — luoi thu hai dang do bong" >&2; return 1; }
  if grep -E '^\s*import .* from ["'"'"']' "$guard" | grep -vE 'from ["'"'"']node:'; then
    echo "    guard imports a non-builtin module" >&2
    return 1
  fi

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
  echo "❌ răng: $pass đạt / $fail hỏng trên ${#CASES[@]} ca — guard không đáng tin"
  exit 1
fi
# Mau so lay tu DO DAI MANG, khong phai tu $pass. In "$pass/$pass" la mot hang dung:
# no bang nhau du mang co bao nhieu ca, nen no khong bao gio noi duoc "thieu ca"
# (S4 vong 1, lop hang-dung). Chenh lech giua hai so la mot ca chua chay.
if [ "$pass" -ne "${#CASES[@]}" ]; then
  echo "❌ răng: chạy $pass ca nhưng mảng khai ${#CASES[@]} — có ca không chạy"
  exit 1
fi
echo "✅ răng: $pass/${#CASES[@]} case — mỗi case một mã thoát riêng"
