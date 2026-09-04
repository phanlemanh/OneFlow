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

need STATUS.md '^## Hiện trạng \(2026-09-04' 'STATUS.md đề ngày 04/09'

counted=$(grep -l '^status: signed-off' _acceptance/*/contract.md 2>/dev/null | wc -l | tr -d ' ')
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
need docs/roadmap.md '^\*\*Đọc được gì từ tỉ lệ này.*16/36' 'roadmap đoạn tỉ lệ đếm lại 16/36'
forbid docs/roadmap.md 'ADR-0013' 'roadmap không nhắc ADR chưa có trên main'

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
