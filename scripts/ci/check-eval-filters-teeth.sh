#!/usr/bin/env bash
# Teeth for check-eval-filters.mjs.
#
# ONE EXIT CODE PER CASE. A case that was never implemented looks identical to
# a case that passed, and both are green — this repo already paid for that
# lesson (see the `stale-scope-by-paths` comment in _acceptance/config.yaml).
#
# ISOLATION. Cases patch `_acceptance/config.yaml` and
# `scripts/ci/check-gate-guards-job.sh`. Other evals of this feature read those
# same files and RUN IN PARALLEL, so every patch lands in a throwaway copy and
# the last thing this script does is prove the shared tree is untouched. The
# checker takes `--root` for exactly this reason.
#
# The nine case names are pinned in AC-12 of the contract, NOT derived from
# `--list` here: a completeness check that asks the script how many cases it has
# is vacuously true, and dropping a case would keep it green.
#
# Usage (from the repo root):
#   bash scripts/ci/check-eval-filters-teeth.sh                 # every case
#   bash scripts/ci/check-eval-filters-teeth.sh --case no-match
#   bash scripts/ci/check-eval-filters-teeth.sh --list
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

repo_root=$(pwd)
CHECKER="$repo_root/scripts/ci/check-eval-filters.mjs"
CFG=_acceptance/config.yaml
GUARDS=scripts/ci/check-gate-guards-job.sh

CASES=(
    clean
    no-match
    zero-executors
    undercount
    unparsable
    list-broken
    regex-semantics
    unknown-wrapper
    needle-missing
)

is_case() {
    local n="$1" c
    for c in "${CASES[@]}"; do [ "$c" = "$n" ] && return 0; done
    return 1
}

# --- the throwaway tree ---------------------------------------------------
tmp=""
make_tree() {
    destroy_tree
    tmp=$(mktemp -d)
    mkdir -p "$tmp/t"
    # ONLY the two things the cases perturb. Test names come from the REAL tree
    # via --vitest-root: symlinking src broke vitest's module resolution
    # (/@fs/ paths), and hard-linking it just moved the failure to config/ —
    # chasing every directory vitest transitively needs is the brittle road.
    cp -R "$repo_root/_acceptance" "$tmp/t/_acceptance"
    cp -R "$repo_root/scripts" "$tmp/t/scripts"
    return 0
}
destroy_tree() {
    [ -n "$tmp" ] && rm -rf "$tmp" || true
    tmp=""
}
trap destroy_tree EXIT INT TERM

# Snapshot the two files the cases patch, so the isolation check at the end
# compares against reality rather than against the last commit.
BEFORE_HASHES=$(shasum "$repo_root/$CFG" "$repo_root/$GUARDS" | awk '{print $1}' | tr '\n' ' ')

out=""
run_checker() {
    local rc=0
    out=$(node "$CHECKER" --root "$tmp/t" --vitest-root "${VITEST_ROOT_OVERRIDE:-$repo_root}" "$@" 2>&1) || rc=$?
    return $rc
}
checker_is_red() { ! run_checker "$@"; }
checker_is_green() { run_checker "$@"; }
out_has() { grep -Eq -- "$1" <<<"$out"; }

# patch <relative-file> <python-body> — edits INSIDE the throwaway copy.
patch() {
    local rel="$1" body="$2"
    python3 - "$tmp/t/$rel" <<PY
import pathlib, sys
p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
$body
p.write_text(s, encoding="utf-8")
PY
}

# --- the cases ------------------------------------------------------------

# POSITIVE CONTROL, with its own exit code. Without it, a teeth script that
# reads the exit code backwards passes every red case below and reports a
# perfect score on a completely inverted harness.
case_clean() {
    make_tree
    checker_is_green || return 1
    out_has 'đã kiểm [0-9]+ ô đo lọc theo tên' || return 1
    out_has '33 ô đo' || return 1
}

# AC-1. One filter points at a name that does not exist.
case_no_match() {
    make_tree
    # A DIRECT eval is the fixture: the kkt_* keys go through the wrapper now,
    # so `-t 'coerces scalars'` is not a string that exists in the config.
    patch "$CFG" 's = s.replace("-t \x27seam\x27", "-t \x27ten ca khong ton tai\x27", 1)'
    checker_is_red || return 1
    out_has 'unit_byo_seam' || return 1                 # names the KEY
    out_has 'ten ca khong ton tai' || return 1          # names the FILTER
}

# AC-3. The most important gate: cover nothing, say so.
case_zero_executors() {
    make_tree
    python3 - "$tmp/t/$CFG" <<'ZERO'
import pathlib, re, sys
p = pathlib.Path(sys.argv[1])
lines = p.read_text(encoding="utf-8").splitlines(keepends=True)
keep = [l for l in lines if " -t " not in l and "run-one-test.sh" not in l]
p.write_text("".join(keep), encoding="utf-8")
ZERO
    checker_is_red || return 1
    out_has 'không tìm thấy ô đo lọc theo tên nào' || return 1
}

# AC-2 red half. An UNDERCOUNT is more dangerous than finding zero: it prints a
# plausible number and exits 0. Three quoting variants, all of which must count.
case_undercount() {
    make_tree
    patch "$CFG" '''
anchor = "    unit_kkt_coerce_scalar:"
i = s.index(anchor)
extra = (
    "    teeth_probe_sq: \x27pnpm vitest run src/lib/settings/env-store.server.test.ts -t \x27\x27run path\x27\x27\x27\n"
    "    teeth_probe_dq: \"pnpm vitest run src/lib/settings/env-store.server.test.ts -t \x27round trip\x27\"\n"
    "    teeth_probe_bare: pnpm vitest run src/lib/settings/env-store.server.test.ts -t seam\n"
)
s = s[:i] + extra + s[i:]
'''
    # Bare and double-quoted forms must be counted too; a parser that only sees
    # single-quoted one-liners reports 33 instead of 36 and still exits 0.
    checker_is_green || return 1
    out_has 'đã kiểm 3[4-9] ô đo' || return 1
}

# AC-4. A filter the checker cannot parse must be named, never skipped.
case_unparsable() {
    make_tree
    patch "$CFG" 's = s.replace("-t \x27seam\x27", "-t", 1)'
    checker_is_red || return 1
    out_has 'unit_byo_seam' || return 1
}

# AC-5. A tool failure is not a verdict about the product.
case_list_broken() {
    make_tree
    local empty="$tmp/empty"
    mkdir -p "$empty"
    VITEST_ROOT_OVERRIDE="$empty" checker_is_red || return 1
    out_has 'vitest list|liệt-kê' || return 1
    out_has 'không kết luận gì về ô đo' || return 1
}

# AC-7. The checker must agree with vitest, measured against vitest — not
# against a promise in prose. Four filters covering BOTH disagreement
# directions between regex and substring semantics.
case_regex_semantics() {
    make_tree
    local file=src/app/api/settings/env/route.unreadable.test.ts
    local ok=1
    # filter | expectation from REAL vitest
    local -a FILTERS=(
        'answers 503 .* code'   # regex: yes.  substring: no.
        'answers 503 (code'     # invalid regex — must be refused, not softened
        'unreadable'            # both: yes
        'khong-ton-tai-o-dau'   # both: no
    )
    for f in "${FILTERS[@]}"; do
        local vrc=0 vout
        vout=$(cd "$repo_root" && node "$repo_root/node_modules/vitest/vitest.mjs" \
            run "$file" -t "$f" 2>&1) || vrc=$?
        local vhits=0
        vhits=$(grep -oE 'Tests +[0-9]+ passed' <<<"$vout" | grep -oE '[0-9]+' | head -1 || true)
        vhits=${vhits:-0}

        make_tree
        python3 - "$tmp/t/$CFG" "$f" "$file" <<'SWAP'
import pathlib, sys
p, filt, testfile = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
s = p.read_text(encoding="utf-8")
old = "    unit_kkt_coerce_scalar: \"bash scripts/settings/run-one-test.sh 'coerces scalars'\""
new = f'    unit_kkt_coerce_scalar: "pnpm vitest run {testfile} -t \'{filt}\'"'
assert old in s, "fixture anchor moved"
p.write_text(s.replace(old, new, 1), encoding="utf-8")
SWAP
        local crc=0
        run_checker || crc=$?
        # vitest ran >=1 case  <=>  the checker must be green.
        if [ "$vhits" -gt 0 ]; then
            printf '    lọc %-24s vitest=%s ca → bộ kiểm phải XANH (rc=%s)\n' "$f" "$vhits" "$crc"
            [ "$crc" -eq 0 ] || ok=0
        else
            printf '    lọc %-24s vitest=0 ca → bộ kiểm phải ĐỎ (rc=%s)\n' "$f" "$crc"
            [ "$crc" -ne 0 ] || ok=0
        fi
    done
    [ "$ok" -eq 1 ]
}

# AC-13. A wrapper the checker has never seen must be RED, not silently binned
# as "does not filter by name". run-one-test.sh was born the day before this.
case_unknown_wrapper() {
    make_tree
    cat >"$tmp/t/scripts/settings/run-other-test.sh" <<'WRAP'
#!/usr/bin/env bash
set -euo pipefail
NAME="${1:?}"
pnpm vitest run src/lib/settings/env-store.server.test.ts -t "$NAME"
WRAP
    patch "$CFG" '''
anchor = "    unit_kkt_coerce_scalar:"
i = s.index(anchor)
s = s[:i] + "    teeth_probe_new_wrapper: \"bash scripts/settings/run-other-test.sh \x27run path\x27\"\n" + s[i:]
'''
    checker_is_red || return 1
    out_has 'teeth_probe_new_wrapper' || return 1       # names the KEY
    out_has 'run-other-test\.sh' || return 1            # names the SCRIPT
}

# AC-10. `shape` only checks the needles it is TOLD about, so dropping one
# makes shape green again — the fence disappears while every light stays on.
case_needle_missing() {
    make_tree
    patch "$GUARDS" 's = s.replace(" check-eval-filters.mjs)", ")", 1)'
    # Look inside the GUARD_NEEDLES line only. The script names the guard
    # elsewhere too (teeth mode special-cases it), so grepping the whole file
    # would report the needle as still present and this case would never fail
    # for the right reason — measuring the wrong object.
    grep -E '^GUARD_NEEDLES=' "$tmp/t/$GUARDS" | grep -q 'check-eval-filters.mjs' && return 1
    return 0
}

# --- runner ---------------------------------------------------------------
run_case() {
    local name="$1" fn="case_${1//-/_}"
    if declare -F "$fn" >/dev/null && "$fn"; then
        echo "CASE $name: PASS"
        destroy_tree
        return 0
    fi
    echo "CASE $name: FAIL"
    destroy_tree
    return 1
}

refuse() {
    echo "check-eval-filters-teeth: $1" >&2
    echo "case hợp lệ: ${CASES[*]}" >&2
    exit 2
}

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
    echo "→ răng của check-eval-filters.mjs"
else
    echo "→ răng: ${SELECTED[*]}"
fi

pass=0
fail=0
for c in "${SELECTED[@]}"; do
    if run_case "$c"; then pass=$((pass + 1)); else fail=$((fail + 1)); fi
done

# Isolation, proven rather than promised — and measured against the tree AS IT
# WAS, not against HEAD. Comparing to HEAD reports a false leak whenever the
# person running this has legitimate uncommitted work in those files, which is
# the normal state while writing the very feature being tested.
after=$(shasum "$repo_root/$CFG" "$repo_root/$GUARDS" | awk '{print $1}' | tr '\n' ' ')
if [ "$after" = "$BEFORE_HASHES" ]; then
    echo "cây chung sạch: $CFG và $GUARDS không đổi một byte"
else
    echo "FAIL: cây chung BẨN sau khi chạy răng — bản vá đã rò ra ngoài bản sao" >&2
    exit 1
fi

echo
if [ "$fail" -ne 0 ]; then
    echo "❌ răng: $pass đạt / $fail hỏng — bộ kiểm ô đo không đáng tin"
    exit 1
fi
echo "✅ răng: $pass/$pass case — mỗi case một mã thoát riêng"
