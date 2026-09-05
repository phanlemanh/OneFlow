#!/usr/bin/env bash
# mo-hoa-b01 AC-11 — bookkeeping of the prototype "keep" lane.
#
# A dossier whose code predates its contract declares the commit the branch was
# cut from and lists every file it inherits. This checks the two relations the
# lane relies on: the base commit really is an ancestor of the main branch, and
# the inherited-debt table covers every file the branch changed — a file left
# off the table is a change nobody classified as kept-or-rebuilt.
#
# Usage: check-prototype-lane.sh <slug>
# Env:   PROTOTYPE_LANE_ROOT (repo root; default toplevel) · PROTOTYPE_LANE_OPP (opportunity file override) ·
#        PROTOTYPE_LANE_MAIN (space-separated candidates; default "main origin/main")
# Exit 0 ok · 1 relation broken · 2 cannot conclude.
set -euo pipefail

SLUG="${1:?usage: check-prototype-lane.sh <slug>}"
ROOT="${PROTOTYPE_LANE_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$ROOT"
# A PR checkout on CI is a detached HEAD with no local `main`; only origin/main
# exists there (S4 round 1, in-contract finding). Resolve the first ref that
# exists; none -> cannot conclude (exit 2), never "not an ancestor" (exit 1).
MAIN=""
for cand in ${PROTOTYPE_LANE_MAIN:-main origin/main}; do
    if git rev-parse --verify --quiet "${cand}^{commit}" >/dev/null; then MAIN="$cand"; break; fi
done
# PROTOTYPE_LANE_OPP lets the teeth script point at a perturbed copy while git
# still runs in the real repository.
OPP="${PROTOTYPE_LANE_OPP:-_acceptance/$SLUG/opportunity.md}"

die() { echo "FAIL: $* — không kết luận" >&2; exit 2; }
[ -n "$MAIN" ] || die "không giải được nhánh chính (thử: ${PROTOTYPE_LANE_MAIN:-main origin/main}) — fetch trước"
[ -f "$OPP" ] || die "thiếu $OPP"

front="$(awk 'NR==1&&/^---$/{f=1;next} f&&/^---$/{exit} f' "$OPP")"
disposition="$(printf '%s\n' "$front" | sed -n 's/^[[:space:]]*disposition:[[:space:]]*//p' | head -1 | tr -d '[:space:]')"
base="$(printf '%s\n' "$front" | sed -n 's/^[[:space:]]*base_commit:[[:space:]]*//p' | head -1 | tr -d '[:space:]')"
[ "$disposition" = "keep" ] || die "$SLUG không phải làn keep (disposition=${disposition:-<trống>})"
[ -n "$base" ] || die "$SLUG khai keep mà không có prototype.base_commit"

fails=0
if git merge-base --is-ancestor "$base" "$MAIN" 2>/dev/null; then
    echo "OK: base_commit ${base:0:8} là tổ tiên của $MAIN"
else
    echo "FAIL: base_commit ${base:0:8} không phải tổ tiên của $MAIN — nhánh không cắt từ nhánh chính"
    fails=$((fails + 1))
fi

# The debt table declares the range it covers: `Diff: <base>...<tip>`.
range="$(sed -n 's/^Diff:[[:space:]]*//p' "$OPP" | head -1 | tr -d '[:space:]')"
[ -n "$range" ] || die "$OPP thiếu dòng 'Diff: <base>...<tip>' trong Bảng nợ kế thừa"
range_base="${range%%...*}"
[ "${range_base:0:7}" = "${base:0:7}" ] || die "dòng Diff bắt đầu ở ${range_base:0:8} nhưng base_commit là ${base:0:8}"

changed="$(git diff --name-only "$range" 2>/dev/null)" || die "git diff $range thất bại"
[ -n "$changed" ] || die "git diff $range không có file nào"

total=0; covered=0
while IFS= read -r f; do
    total=$((total + 1))
    if grep -F -- "| \`$f\` |" "$OPP" >/dev/null; then
        covered=$((covered + 1))
    else
        echo "FAIL: thiếu hàng nợ cho $f"
        fails=$((fails + 1))
    fi
done <<<"$changed"
echo "OK: $covered/$total file của diff có hàng trong bảng nợ"

if [ "$fails" -gt 0 ]; then
    echo "FAIL: $fails quan hệ của làn keep hỏng"
    exit 1
fi
echo "PASS: làn prototype keep của $SLUG khớp"
