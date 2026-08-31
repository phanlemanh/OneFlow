#!/usr/bin/env bash
# Teeth for check-product-map.mjs.
#
# ONE EXIT CODE PER CASE. A case that was never implemented looks identical to a
# case that passed, and both are green. This repo already paid for that lesson
# once — see the `stale-scope-by-paths` comment in _acceptance/config.yaml.
#
# `--case` is REPEATABLE here, unlike scripts/roadmap/check-roadmap-guard-teeth.sh
# which takes one name and overwrites on repeat. Three declared executors pass
# two or three cases in a single invocation (pmap_teeth_unreadable,
# pmap_teeth_extra_slug, pmap_teeth_source_buckets); overwriting would silently
# measure only the last one and report the rest as covered.
#
# An unknown `--case` is REFUSED loudly (exit 2 + the valid list) rather than
# skipped: a typo that exits 0 turns an eval into a permanent green no-op, which
# is the same fail-open class the checker under test exists to close.
#
# Usage (from the repo root):
#   bash scripts/ci/check-product-map-teeth.sh                    # every case
#   bash scripts/ci/check-product-map-teeth.sh --case missing-slug
#   bash scripts/ci/check-product-map-teeth.sh --list
set -euo pipefail
cd "$(dirname "$0")/../.."

repo_root=$(pwd)
checker="$repo_root/scripts/ci/check-product-map.mjs"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# Order is the reading order of the report, not an execution dependency: every
# case builds its own fixture from scratch and can run alone.
CASES=(
    clean
    missing-slug
    count-mismatch
    opportunity-mismatch
    artifact-missing
    artifact-unreadable
    extra-slug
    status-downgraded
    contract-unparsable
    status-unknown
    dir-empty
)

is_case() {
    local n="$1" c
    for c in "${CASES[@]}"; do [ "$c" = "$n" ] && return 0; done
    return 1
}

# A minimal tree the checker can read: PRODUCT-MAP.md plus the two files it
# classifies dossiers by. Nothing else is copied, so a case cannot accidentally
# pass because of a file the checker never reads.
build_fixture() {
    rm -rf "$tmp/t"
    mkdir -p "$tmp/t/_acceptance"
    cp "$repo_root/PRODUCT-MAP.md" "$tmp/t/PRODUCT-MAP.md"
    for d in "$repo_root"/_acceptance/*/; do
        slug=$(basename "$d")
        mkdir -p "$tmp/t/_acceptance/$slug"
        [ -f "$d/contract.md" ] && cp "$d/contract.md" "$tmp/t/_acceptance/$slug/contract.md"
        [ -f "$d/opportunity.md" ] && cp "$d/opportunity.md" "$tmp/t/_acceptance/$slug/opportunity.md"
    done
    return 0
}

# The checker runs once per case and its output is KEPT. Several criteria are
# about the MESSAGE (name the slug, print both numbers), and a teeth script that
# throws output away can only ever assert red-or-green — a fix that impoverishes
# the message would keep every case passing.
check_capture() {
    local rc=0
    (cd "$tmp/t" && node "$checker") >"$tmp/out" 2>&1 || rc=$?
    return $rc
}
check_is_red() { ! check_capture; }
check_is_green() { check_capture; }
out_has() { grep -Eq -- "$1" "$tmp/out"; }

# --- the cases ------------------------------------------------------------
# Each returns 0 when the checker behaved as the criterion requires.

# AC-1 control. Without it a checker hardcoded to `exit 1` passes every red case
# below, and the whole suite reads as proof of teeth it does not have.
case_clean() {
    build_fixture
    check_is_green || return 1
    # The count line must be PRESENT and all three numbers EQUAL. A checker that
    # prints "0 signed, 0 on the map, 0 in the node" is also green, and that
    # green means nothing.
    out_has 'đã giao: [0-9]+ hồ sơ ký, [0-9]+ mục trên bản đồ, nút mermaid [0-9]+' || return 1
    python3 - "$tmp/out" <<'COUNTS'
import sys, pathlib, re
m = re.search(r"đã giao: (\d+) hồ sơ ký, (\d+) mục trên bản đồ, nút mermaid (\d+)",
              pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
if not m: raise SystemExit("thiếu dòng đếm")
a, b, c = (int(x) for x in m.groups())
if not (a == b == c): raise SystemExit(f"ba số lệch: {a} / {b} / {c}")
if a == 0: raise SystemExit("cây thật phải có hồ sơ đã ký")
COUNTS
}

# AC-1. Drop ONE signed slug from the `## Đã giao` block.
#
# The fixture FIRST adds a second mention of that slug elsewhere in the file,
# then removes it from the block. Without that, this case cannot tell "reads
# inside the block" from "greps the whole file" — a whole-file grep would pass
# it. Adding the decoy to the COPY rather than to PRODUCT-MAP.md itself is
# deliberate: that file is generated, so a hand-added line would vanish on the
# next regeneration and take this case's discriminating power with it.
case_missing_slug() {
    build_fixture
    python3 - "$tmp/t/PRODUCT-MAP.md" <<'DECOY'
import sys, pathlib
p = pathlib.Path(sys.argv[1])
t = p.read_text(encoding="utf-8")
slug = "chong-mat-khoa-byo"
# Decoy outside every parsed block: a prose line under the mermaid diagram.
t = t.replace("## Đang cân nhắc cơ hội",
              f"> Ghi chú mồi nhử: `{slug}` cũng được nhắc ở đây.\n\n## Đang cân nhắc cơ hội", 1)
# Now remove the real entry from the delivered block.
t = "".join(l for l in t.splitlines(keepends=True) if f"(`{slug}`)" not in l)
p.write_text(t, encoding="utf-8")
DECOY
    check_is_red || return 1
    out_has 'chong-mat-khoa-byo' || return 1 # names the slug, not "the map is off"
}

# AC-2. Wrong number in the mermaid node. The message must carry BOTH numbers:
# naming one says neither how far off it is nor in which direction. This is the
# drift that actually happened — the map read 22 while 26 dossiers were signed.
case_count_mismatch() {
    build_fixture
    python3 - "$tmp/t/PRODUCT-MAP.md" <<'BREAK'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1])
p.write_text(re.sub(r"Đã giao<br/>\d+ việc", "Đã giao<br/>99 việc",
                    p.read_text(encoding="utf-8")), encoding="utf-8")
BREAK
    check_is_red || return 1
    python3 - "$tmp/out" <<'BOTH'
import sys, pathlib, re
t = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
line = next((l for l in t.splitlines() if "99" in l and "FAIL" in l), None)
if line is None: raise SystemExit("không có dòng FAIL nào nêu số 99")
nums = {int(n) for n in re.findall(r"\d+", line)}
if not (nums - {99}): raise SystemExit(f"chỉ nêu một số: {line}")
BOTH
}

# AC-3. A new opportunity-only dossier the map does not know about. The
# opportunity block gets the same treatment as the delivered one; a guard that
# only watches the popular half is a guard with a documented blind side.
case_opportunity_mismatch() {
    build_fixture
    mkdir -p "$tmp/t/_acceptance/teeth-probe-opportunity"
    printf '# probe\n' >"$tmp/t/_acceptance/teeth-probe-opportunity/opportunity.md"
    check_is_red || return 1
    out_has 'cân nhắc cơ hội' || return 1
}

# AC-4 fail-closed (a): the artifact is not there at all.
case_artifact_missing() {
    build_fixture
    rm -f "$tmp/t/PRODUCT-MAP.md"
    check_is_red || return 1
    out_has 'PRODUCT-MAP.md' || return 1
}

# AC-4 fail-closed (b): the file is present but the thing to read inside it is
# not. A checker that cannot find what it came to check has checked nothing, and
# exiting 0 there is a lie worse than silence.
case_artifact_unreadable() {
    build_fixture
    python3 - "$tmp/t/PRODUCT-MAP.md" <<'HIDE'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1])
t = p.read_text(encoding="utf-8")
t = t.replace("## Đã giao\n", "## Đã giao (đổi tiêu đề)\n", 1)
t = re.sub(r"Đã giao<br/>\d+ việc", "Đã giao", t)
p.write_text(t, encoding="utf-8")
HIDE
    check_is_red || return 1
    out_has 'không tìm thấy|không đọc được' || return 1
}

# AC-11. The map advertises a slug that has no dossier at all. AC-1 only walks
# dossiers -> map, so this direction was uncovered: a withdrawn dossier leaves
# its row behind and everything stays green. This repo withdrew one for real
# (`normalize-text-vi`, 26/08).
case_extra_slug() {
    build_fixture
    python3 - "$tmp/t/PRODUCT-MAP.md" <<'GHOST'
import sys, pathlib
p = pathlib.Path(sys.argv[1])
p.write_text(p.read_text(encoding="utf-8").replace(
    "## Đã giao\n\n", "## Đã giao\n\n- Việc ma (`teeth-probe-ghost`)\n", 1), encoding="utf-8")
GHOST
    check_is_red || return 1
    out_has 'teeth-probe-ghost' || return 1
}

# AC-11. The dossier still exists but is no longer signed, and the row stays.
case_status_downgraded() {
    build_fixture
    python3 - "$tmp/t/_acceptance/roadmap-drift-guard/contract.md" <<'DOWN'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1])
p.write_text(re.sub(r"(?m)^status: signed-off$", "status: draft",
                    p.read_text(encoding="utf-8")), encoding="utf-8")
DOWN
    check_is_red || return 1
    out_has 'roadmap-drift-guard' || return 1
}

# AC-12 bucket four: frontmatter that does not parse at all.
case_contract_unparsable() {
    build_fixture
    printf -- '---\nstatus: [unclosed\n' >"$tmp/t/_acceptance/roadmap-drift-guard/contract.md"
    check_is_red || return 1
    out_has 'roadmap-drift-guard' || return 1
}

# AC-12 bucket four: a status outside the closed set. The quoted form is the
# realistic typo, and it must land in bucket four — NOT in "signed" and NOT
# silently in "some other status". Binning it silently is the fail-OPEN: the
# dossier drops out of the must-appear set, the counts still balance, and the
# checker goes green while the map is missing exactly that dossier.
case_status_unknown() {
    build_fixture
    python3 - "$tmp/t/_acceptance/roadmap-drift-guard/contract.md" <<'QUOTED'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1])
p.write_text(re.sub(r"(?m)^status: signed-off$", 'status: "signed-off"',
                    p.read_text(encoding="utf-8")), encoding="utf-8")
QUOTED
    check_is_red || return 1
    out_has 'roadmap-drift-guard' || return 1
}

# AC-12 bucket four: a directory with neither contract.md nor opportunity.md.
case_dir_empty() {
    build_fixture
    mkdir -p "$tmp/t/_acceptance/teeth-probe-empty"
    check_is_red || return 1
    out_has 'teeth-probe-empty' || return 1
}

# --- runner ---------------------------------------------------------------
run_case() {
    local name="$1" fn="case_${1//-/_}"
    if declare -F "$fn" >/dev/null && "$fn"; then
        echo "CASE $name: PASS"
        return 0
    fi
    echo "CASE $name: FAIL"
    return 1
}

refuse() {
    echo "check-product-map-teeth: $1" >&2
    echo "case hợp lệ: ${CASES[*]}" >&2
    exit 2
}

# --- CLI ------------------------------------------------------------------
# Mode is settled before anything runs: a typo must never turn a CHECK into a
# silent pass.
SELECTED=()
while [ $# -gt 0 ]; do
    case "$1" in
    --list)
        printf '%s\n' "${CASES[@]}"
        exit 0
        ;;
    --case)
        [ $# -ge 2 ] || refuse "\`--case\` cần một tên ngay sau nó — nhận được (trống)"
        case "$2" in --*) refuse "\`--case\` cần một tên ngay sau nó — nhận được \`$2\`" ;; esac
        is_case "$2" || refuse "case lạ \`$2\`"
        SELECTED+=("$2")
        shift 2
        ;;
    *) refuse "tham số lạ \`$1\` — chỉ nhận \`--case <tên>\` và \`--list\`" ;;
    esac
done
[ ${#SELECTED[@]} -eq 0 ] && SELECTED=("${CASES[@]}")

if [ ${#SELECTED[@]} -eq ${#CASES[@]} ]; then
    echo "→ răng của check-product-map.mjs"
else
    echo "→ răng: ${SELECTED[*]}"
fi

pass=0
fail=0
for c in "${SELECTED[@]}"; do
    if run_case "$c"; then pass=$((pass + 1)); else fail=$((fail + 1)); fi
done

echo
if [ "$fail" -ne 0 ]; then
    echo "❌ răng: $pass đạt / $fail hỏng — bộ kiểm bản đồ không đáng tin"
    exit 1
fi
echo "✅ răng: $pass/$pass case — mỗi case một mã thoát riêng"
