#!/usr/bin/env bash
# Teeth for check-plan-docs.sh (gap-probe 2026-09-04 P1). Its red direction used
# to be a single manual run while executing the plan; a check whose red half
# lives in a plan document rather than in a script is a check nobody will ever
# re-prove.
#
# Case `ho-so-thu-37` is the load-bearing one: it distinguishes "counts the tree"
# from "greps a constant" — a grep-based check stays GREEN there.
#
# Perturbations use python3, never `sed -i`: the BSD and GNU spellings differ and
# this runs on both a mac laptop and an ubuntu CI runner.
set -euo pipefail
cd "$(dirname "$0")/../.."
repo_root=$(pwd)
checker="$repo_root/scripts/roadmap/check-plan-docs.sh"
self="$repo_root/scripts/roadmap/check-plan-docs-teeth.sh"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

CASES=(clean lui-ngay nhay-nguoc mat-dinh-vi ho-so-thu-37)
is_case() { local n="$1" c; for c in "${CASES[@]}"; do [ "$c" = "$n" ] && return 0; done; return 1; }

build_fixture() {
    rm -rf "$tmp/t"
    mkdir -p "$tmp/t/docs/strategy" "$tmp/t/_acceptance" "$tmp/t/scripts/roadmap"
    cp "$repo_root/STATUS.md" "$tmp/t/STATUS.md"
    cp "$repo_root/docs/roadmap.md" "$tmp/t/docs/roadmap.md"
    cp "$repo_root/docs/strategy/vision.md" "$tmp/t/docs/strategy/vision.md"
    cp -R "$repo_root/docs/adr" "$tmp/t/docs/adr"
    cp "$repo_root/scripts/roadmap/check-roadmap-fresh.sh" \
       "$repo_root/scripts/roadmap/roadmap-drift.mjs" "$tmp/t/scripts/roadmap/"
    for d in "$repo_root"/_acceptance/*/; do
        slug=$(basename "$d")
        mkdir -p "$tmp/t/_acceptance/$slug"
        [ -f "$d/contract.md" ] && cp "$d/contract.md" "$tmp/t/_acceptance/$slug/"
        [ -f "$d/opportunity.md" ] && cp "$d/opportunity.md" "$tmp/t/_acceptance/$slug/"
    done
    return 0
}
run_checker() {
    local rc=0
    PLAN_DOCS_ROOT="$tmp/t" bash "$checker" > "$tmp/out" 2>&1 || rc=$?
    return $rc
}
is_red()  { ! run_checker; }
is_green() {  run_checker; }
out_has() { grep -Eq -- "$1" "$tmp/out"; }

case_clean() {
    build_fixture
    is_green || return 1
    out_has 'số hồ sơ đã ký khớp cây'
}

case_lui_ngay() {
    build_fixture
    python3 - "$tmp/t/STATUS.md" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
assert "## Hiện trạng (2026-09-04" in s, "fixture stale: STATUS.md date line moved"
p.write_text(re.sub(r"^## Hiện trạng \(2026-09-04", "## Hiện trạng (2026-08-17",
                    s, count=1, flags=re.M), encoding="utf-8")
PY
    is_red || return 1
    out_has 'FAIL: STATUS.md đề ngày 04/09'
}

case_nhay_nguoc() {
    build_fixture
    python3 - "$tmp/t/docs/roadmap.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
i = s.index("**Đọc được gì từ tỉ lệ này")
# The paragraph is the last thing in the file, so there is no blank line after
# it: `index` would raise. Same trap the guard's own section-cut hit.
j = s.find("\n\n", i)
if j == -1:
    j = len(s)
para = s[i:j]
assert "hạ tầng quy trình" in para, "fixture stale: ratio paragraph wording moved"
p.write_text(s[:i] + para.replace("hạ tầng quy trình", "`hạ tầng quy trình`", 1) + s[j:],
             encoding="utf-8")
PY
    is_red || return 1
    out_has 'đoạn tỉ lệ có nháy ngược'
}

case_mat_dinh_vi() {
    build_fixture
    python3 - "$tmp/t/docs/strategy/vision.md" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
assert "## Định vị — bổ sung 04/09" in s, "fixture stale: vision.md heading moved"
p.write_text("\n".join(l for l in s.split("\n")
                       if not l.startswith("## Định vị — bổ sung 04/09")), encoding="utf-8")
PY
    is_red || return 1
    out_has 'vision.md có đoạn định vị ba tầng'
}

# THE LOAD-BEARING CASE. A 37th signed dossier appears and nobody updates
# STATUS.md. A grep for the constant stays green here; a count of the tree does not.
case_ho_so_thu_37() {
    build_fixture
    mkdir -p "$tmp/t/_acceptance/zz-ho-so-thu-37"
    printf -- '---\nschema_version: 1\nslug: zz-ho-so-thu-37\nrisk_tier: T2\nstatus: signed-off\n---\n' \
        > "$tmp/t/_acceptance/zz-ho-so-thu-37/contract.md"
    is_red || return 1
    out_has 'STATUS.md ghi [0-9]+ hồ sơ đã ký, đếm trên cây được [0-9]+'
}

run_case() {
    local name="$1" fn
    fn="case_$(printf '%s' "$name" | tr '-' '_')"
    if "$fn"; then echo "  ✓ CASE $name: PASS"; return 0; fi
    echo "  ✗ CASE $name: FAIL"; return 1
}
refuse() {
    echo "check-plan-docs-teeth: $1" >&2
    echo "case hợp lệ: ${CASES[*]}" >&2
    exit 2
}

ONE=""
while [ $# -gt 0 ]; do
    case "$1" in
        --list) printf '%s\n' "${CASES[@]}"; exit 0 ;;
        --case)
            [ $# -ge 2 ] || refuse "\`--case\` cần một tên ngay sau nó — nhận được (trống)"
            case "$2" in --*) refuse "\`--case\` cần một tên ngay sau nó — nhận được \`$2\`" ;; esac
            is_case "$2" || refuse "case lạ \`$2\`"
            ONE="$2"; shift 2 ;;
        *) refuse "tham số lạ \`$1\` — chỉ nhận \`--case <tên>\` và \`--list\`" ;;
    esac
done
if [ -n "$ONE" ]; then
    echo "→ răng tài liệu: case $ONE"
    run_case "$ONE"
    exit $?
fi

echo "→ răng của check-plan-docs.sh"
pass=0
fail=0
for c in "${CASES[@]}"; do
    if run_case "$c"; then pass=$((pass + 1)); else fail=$((fail + 1)); fi
done
echo
[ "$fail" -eq 0 ] || {
    echo "❌ răng tài liệu: $pass đạt / $fail hỏng trên ${#CASES[@]} ca"
    exit 1
}
# Mau so tu DO DAI MANG (S4 vong 1, cung lop hang-dung voi check-plan-freeze-teeth):
# "$pass/$pass" bang nhau bang cau truc, nen no khong bao gio to duoc mot ca bi xoa.
if [ "$pass" -ne "${#CASES[@]}" ]; then
    echo "❌ răng tài liệu: chạy $pass ca nhưng mảng khai ${#CASES[@]} — có ca không chạy"
    exit 1
fi
echo "✅ răng tài liệu: $pass/${#CASES[@]} case"
