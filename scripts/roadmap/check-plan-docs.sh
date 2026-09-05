#!/usr/bin/env bash
# AC-12 of lat-cat-chung-minh: the three living documents carry the plan's
# numbers and the freeze pointer. STATUS.md sat at 2026-08-17 / "17 features"
# while 36 were signed — a document that lies about the count teaches readers
# to stop reading it. Greps, not prose review; one FAIL line per miss.
#
# The signed-dossier count is a RELATION, not a string: it is COUNTED on the
# tree and compared. Grepping a constant keeps this green the day the 37th
# dossier is signed — the very drift this file exists to catch, certified as
# fixed by a check that never looked (gap-probe 2026-09-04 P1).
#
# Red direction lives in check-plan-docs-teeth.sh, which points PLAN_DOCS_ROOT
# at a throwaway copy.
set -euo pipefail
cd "${PLAN_DOCS_ROOT:-$(dirname "$0")/../..}"
if [ $# -gt 0 ]; then
    echo "check-plan-docs: không nhận tham số nào — nhận được: $*" >&2
    exit 2
fi

fails=0
need() { # need <file> <regex> <label>
    if grep -Eq -- "$2" "$1"; then
        echo "OK: $3"
    else
        echo "FAIL: $3 — không thấy /$2/ trong $1"
        fails=$((fails + 1))
    fi
}
forbid() { # forbid <file> <regex> <label>
    if grep -Eq -- "$2" "$1"; then
        echo "FAIL: $3 — vẫn thấy /$2/ trong $1"
        fails=$((fails + 1))
    else
        echo "OK: $3"
    fi
}

# The heading date is a RELATION, not a constant. Pinning one literal past date
# fails in the WRONG DIRECTION: a stale STATUS.md stays green forever while the
# next legitimate refresh — the very act this guard exists to encourage — turns
# CI red (S4 round 2). The invariant that actually holds: STATUS.md cannot be
# older than the newest dossier it claims to describe.
newest=$( { grep -l '^status: signed-off' _acceptance/*/contract.md 2>/dev/null || true; } \
    | xargs -r grep -h '^approved_at:' 2>/dev/null \
    | sed 's/approved_at: *//; s/T.*//' | sort | tail -1)
heading=$(sed -n 's/^## Hiện trạng (\([0-9-]\{10\}\).*/\1/p' STATUS.md | head -1)
if [ -z "$heading" ]; then
    echo "FAIL: STATUS.md không có tiêu đề dạng '## Hiện trạng (YYYY-MM-DD…'"
    fails=$((fails + 1))
elif [ -z "$newest" ]; then
    echo "FAIL: không đọc được approved_at nào trên cây — không có mốc để so ngày STATUS.md"
    fails=$((fails + 1))
elif [ "$heading" \< "$newest" ]; then
    echo "FAIL: STATUS.md đề ngày $heading nhưng hồ sơ ký mới nhất là $newest — tài liệu cũ hơn thứ nó mô tả"
    fails=$((fails + 1))
else
    echo "OK: STATUS.md đề ngày $heading, không cũ hơn hồ sơ ký mới nhất ($newest)"
fi

# Wrapped for the same reason as the ratio block below: a tree where nothing is
# signed yet makes this grep exit 1, and `set -e` then kills the run with no FAIL
# line and 14 checks silently unreported (S4 round 2).
counted=$( { grep -l '^status: signed-off' _acceptance/*/contract.md 2>/dev/null || true; } | wc -l | tr -d ' ')
claimed=$(sed -n 's/.*\*\*\([0-9][0-9]*\) hồ sơ đã ký\*\*.*/\1/p' STATUS.md | head -1)
if [ -z "$claimed" ]; then
    echo "FAIL: STATUS.md không khai số hồ sơ đã ký (cần dạng **<số> hồ sơ đã ký**)"
    fails=$((fails + 1))
elif [ "$claimed" != "$counted" ]; then
    echo "FAIL: STATUS.md ghi $claimed hồ sơ đã ký, đếm trên cây được $counted"
    fails=$((fails + 1))
else
    echo "OK: số hồ sơ đã ký khớp cây ($counted)"
fi

need STATUS.md 'Kế hoạch lát cắt chứng minh' 'STATUS.md trỏ vào khối kế hoạch'
need STATUS.md 'plan:check' 'STATUS.md nêu lệnh xem tỉ lệ'
need STATUS.md 'Phân vùng phiên' 'STATUS.md có nghi thức phân vùng phiên'
forbid STATUS.md '^## Hàng đợi hiện hành' 'STATUS.md không còn bảng hàng đợi thứ hai'

need docs/strategy/vision.md '^## Định vị — bổ sung 04/09' 'vision.md có đoạn định vị ba tầng'
need docs/strategy/vision.md 'tiếp cận được với bất kỳ ai' 'vision.md nêu trụ cột tiếp cận'

need docs/roadmap.md '<!-- plan-freeze:start -->' 'roadmap có khối kế hoạch'
need docs/roadmap.md '^\| S3 \| .*de facto' 'roadmap dòng S3 ghi de facto'
need docs/roadmap.md '^- \*\*1\.5\*\*.*B5' 'roadmap 1.5 trỏ B5'
need docs/roadmap.md '^- \*\*1\.6\*\*.*B7' 'roadmap 1.6 trỏ B7'
# Same class as the count above, and the same fix. `16/36` was pinned literally
# while `36` is the signed-dossier count this very script computes three checks
# earlier — so signing the 37th dossier would force the prose to STAY wrong to
# keep the guard green (S4 round 2). Read the ratios, demand every denominator
# equal the counted total and the numerators sum to it.
ratio_line=$(grep -m1 '^\*\*Đọc được gì từ tỉ lệ này' docs/roadmap.md || true)
if [ -z "$ratio_line" ]; then
    echo "FAIL: roadmap thiếu đoạn tỉ lệ (mở đầu '**Đọc được gì từ tỉ lệ này')"
    fails=$((fails + 1))
else
    ratio_block=$(awk '/^\*\*Đọc được gì từ tỉ lệ này/{f=1} f&&/^$/{exit} f' docs/roadmap.md)
    # Anchor on the total the paragraph DECLARES ("trên <N> hồ sơ"), then read only
    # the `x/<N>` ratios. A blind scan for `\d+/\d+` also swallows the dates in the
    # same sentence (04/09, 27/08) and reports them as broken denominators.
    # Every grep here is wrapped: under `set -euo pipefail` a grep that matches
    # NOTHING exits 1, and inside a command substitution that kills the script
    # mid-run — no FAIL line, remaining checks never reported, and the abort is
    # indistinguishable from a real catch. That is exactly what happened the first
    # time this block ran on a 37-dossier fixture (no `x/37` existed yet).
    declared=$(printf '%s' "$ratio_block" | sed -n 's/.*trên \([0-9][0-9]*\) hồ sơ.*/\1/p' | head -1)
    ratios=$( { printf '%s' "$ratio_block" | grep -oE "[0-9]+/$counted([^0-9]|$)" || true; } | grep -oE '^[0-9]+' || true)
    sum=$(printf '%s\n' "$ratios" | awk '{s+=$1} END{print s+0}')
    n_ratio=$(printf '%s' "$ratios" | grep -c . || true)
    if [ "$declared" != "$counted" ]; then
        echo "FAIL: đoạn tỉ lệ khai 'trên ${declared:-?} hồ sơ' nhưng cây đếm được $counted"
        fails=$((fails + 1))
    elif [ "$n_ratio" -lt 2 ]; then
        echo "FAIL: đoạn tỉ lệ chỉ có $n_ratio tỉ lệ dạng x/$counted — không đủ để cộng thành bức tranh đầy đủ"
        fails=$((fails + 1))
    elif [ "$sum" -ne "$counted" ]; then
        echo "FAIL: đoạn tỉ lệ cộng lại $sum nhưng cây có $counted hồ sơ ký — ba nhóm phải phủ hết"
        fails=$((fails + 1))
    else
        echo "OK: đoạn tỉ lệ khai trên $counted hồ sơ, $n_ratio tỉ lệ cộng đúng $sum"
    fi
fi
# Conditional, not permanent. The rule is "do not cite an ADR that does not exist
# yet"; a flat forbid keeps blocking the roadmap from naming ADR-0013 on the day
# that ADR actually lands (S4 round 2). Ask the tree whether it exists.
if ls docs/adr/*0013* >/dev/null 2>&1; then
    echo "OK: ADR-0013 đã có trên cây — roadmap được phép nhắc"
else
    forbid docs/roadmap.md 'ADR-0013' 'roadmap không nhắc ADR-0013 (chưa có trên cây)'
fi

# The ratio paragraph sits outside the ledger block, but the ledger guard's
# authors warned that backticks there read as slugs; keep the paragraph bare.
ratio_para=$(awk '/^\*\*Đọc được gì từ tỉ lệ này/{f=1} f&&/^$/{exit} f' docs/roadmap.md)
if printf '%s' "$ratio_para" | grep -q '`'; then
    echo "FAIL: đoạn tỉ lệ có nháy ngược"
    fails=$((fails + 1))
else
    echo "OK: đoạn tỉ lệ không có nháy ngược"
fi

if bash scripts/roadmap/check-roadmap-fresh.sh >/dev/null 2>&1; then
    echo "OK: guard sổ cái xanh"
else
    echo "FAIL: guard sổ cái đỏ"
    fails=$((fails + 1))
fi

[ "$fails" -eq 0 ] || {
    echo "❌ check-plan-docs: $fails phép kiểm hỏng"
    exit 1
}
echo "✅ check-plan-docs: tài liệu khớp kế hoạch"
