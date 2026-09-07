#!/usr/bin/env bash
# Teeth for the key-store invariants of `kho-khoa-toan-ven`.
#
# ONE EXIT CODE PER CASE. A case that was never implemented looks identical to
# a case that passed, and both are green — this repo already paid for that
# lesson (see the `stale-scope-by-paths` comment in _acceptance/config.yaml).
#
# TWO CONSTRAINTS, both from the clean-context review of this feature, both
# load-bearing:
#
# (a) ISOLATION. This script patches source files. The other evals of this
#     feature read those same files and RUN IN PARALLEL, so patching the shared
#     tree would turn an unrelated eval red for a reason nobody can reproduce,
#     and a killed run would leave the tree carrying reverted code — green next
#     time, on code that regressed. So every patch lands in a throwaway
#     `git worktree`, never in the working tree, and the last thing this script
#     does is prove the shared tree is untouched.
#
#     vitest is invoked through `node` rather than `pnpm` on purpose: pnpm's
#     dependency-status check rejects a symlinked node_modules, which is how the
#     worktree gets its dependencies without a second install.
#
#     KNOWN LIMIT of that isolation: the worktree is built from HEAD, so these
#     cases measure the COMMITTED tree, not uncommitted edits. That is the right
#     trade — it is what makes the shared tree provably untouched — but it means
#     a regression that is only staged, never committed, is invisible here. Run
#     the vitest suite directly for that; this script answers a different
#     question: does each rule, as committed, actually go red when removed.
#
#     Proven to be able to say FAIL, 2026-08-31: with the `coerce-scalar` patch
#     replaced by a no-op, the case correctly reported FAIL rather than PASS.
#
# (b) NO CREDIT FOR A VAGUE RED. A patch that breaks syntax also makes vitest
#     exit non-zero, so "the suite went red" is not evidence that a rule has
#     teeth. Every case declares up front WHICH test must fail; the run must
#     report that test failing, and a run that collects no tests at all is
#     INCONCLUSIVE (exit 2), never PASS.
#
# Usage (from the repo root):
#   bash scripts/settings/check-env-store-teeth.sh                    # every case
#   bash scripts/settings/check-env-store-teeth.sh --case atomic
#   bash scripts/settings/check-env-store-teeth.sh --list
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

repo_root=$(pwd)
STORE=src/lib/settings/env-store.server.ts
SEAM=src/ext-default/settings-store.ts
TESTS=src/lib/settings/env-store.server.test.ts

CASES=(
    coerce-scalar
    refuse-structured
    refuse-empty-key
    all-strings
    save-throws
    seam-signature
    atomic
)

is_case() {
    local n="$1" c
    for c in "${CASES[@]}"; do [ "$c" = "$n" ] && return 0; done
    return 1
}

# --- the throwaway tree ---------------------------------------------------
wt_parent=""
wt=""
make_worktree() {
    destroy_worktree
    wt_parent=$(mktemp -d)
    wt="$wt_parent/wt"
    git worktree add --detach -q "$wt" HEAD
    ln -s "$repo_root/node_modules" "$wt/node_modules"
}
destroy_worktree() {
    [ -n "$wt" ] && git worktree remove --force "$wt" >/dev/null 2>&1 || true
    [ -n "$wt_parent" ] && rm -rf "$wt_parent" || true
    wt=""
    wt_parent=""
}
trap destroy_worktree EXIT INT TERM

# patch <file> <python-expression-body> — edits the file INSIDE the worktree.
patch() {
    local rel="$1" body="$2"
    python3 - "$wt/$rel" <<PY
import pathlib, sys
p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
$body
p.write_text(s, encoding="utf-8")
PY
}

# run_test <test-name-fragment> — runs it in the worktree, captures output.
# Returns the vitest exit code; leaves the output in \$out.
out=""
run_test() {
    local name="$1" rc=0
    out=$(cd "$wt" && node "$wt/node_modules/vitest/vitest.mjs" run "$TESTS" -t "$name" 2>&1) || rc=$?
    return $rc
}

# The heart of constraint (b): a red run only counts when THIS test failed.
# A syntax error, a missing file, or a collection failure all make vitest exit
# non-zero while proving nothing, so those are refused as inconclusive.
assert_red_for() {
    local name="$1" msg="${2:-}"
    if grep -qiE 'No test files found|Tests +0 passed \| *0 failed' <<<"$out"; then
        echo "    (KHÔNG KẾT LUẬN ĐƯỢC: bộ thử không thu được ca nào — vá làm hỏng file?)" >&2
        printf '%s\n' "$out" | tail -12 >&2
        exit 2
    fi
    grep -q "$name" <<<"$out" || {
        echo "    (KHÔNG KẾT LUẬN ĐƯỢC: đầu ra không nhắc ca \`$name\`)" >&2
        exit 2
    }
    grep -qE '[0-9]+ failed' <<<"$out" || return 1
    [ -z "$msg" ] || grep -qiE "$msg" <<<"$out" || {
        echo "    (đỏ nhưng thiếu thông điệp ghim: /$msg/)" >&2
        return 1
    }
    return 0
}

# --- the cases ------------------------------------------------------------
# Each returns 0 when the rule under test proved it has teeth.

# AC-1. Drop the scalar branch: PORT and DEBUG fall through to `return null`,
# so the whole store reads unreadable and the coercion case fails.
case_coerce_scalar() {
    make_worktree
    patch "$STORE" 's = s.replace("""        else if (typeof v === "number" || typeof v === "boolean")
            out[k] = String(v);
""", "", 1)'
    ! run_test "coerces scalars" || return 1
    assert_red_for "coerces scalars"
}

# AC-2. Stringify structured values instead of refusing: "[object Object]"
# appears, which is the exact garbage-that-looks-valid trap.
case_refuse_structured() {
    make_worktree
    patch "$STORE" 's = s.replace("        else return null;", "        else out[k] = String(v);", 1)'
    ! run_test "refuses structured" || return 1
    assert_red_for "refuses structured"
}

# AC-3. Drop the blank-key guard: an empty key is accepted again.
case_refuse_empty_key() {
    make_worktree
    patch "$STORE" 's = s.replace("        if (!k.trim()) return null;\n", "", 1)'
    ! run_test "refuses empty key" || return 1
    assert_red_for "refuses empty key"
}

# AC-4. The suppressing half: a reader that returns an empty map must NOT pass.
# Without this case, a fix that quietly drops everything still looks correct.
case_all_strings() {
    make_worktree
    patch "$STORE" 's = s.replace("    const out: EnvStore = {};\n    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {", "    const out: EnvStore = {};\n    return out;\n    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {", 1)'
    ! run_test "all strings untouched" || return 1
    assert_red_for "all strings untouched"
}

# AC-5. Restore the silent filter: saveEnvStore resolves instead of throwing.
case_save_throws() {
    make_worktree
    patch "$STORE" 's = s.replace("""    for (const [k, v] of Object.entries(env)) {
        if (!k.trim()) {""", """    for (const [k, v] of Object.entries(env)) {
        if (false) {""", 1).replace("if (typeof v !== \"string\") {", "if (false) {", 1)
s = s.replace("""        if (typeof v !== "string") {
            throw new Error(
                `saveEnvStore: value for \\\\`${k}\\\\` is ${typeof v}, expected string`,
            );
        }""", "", 1)'
    ! run_test "save refuses" || return 1
    assert_red_for "save refuses"
}

# AC-8. The seam signatures are pinned strings, and the cloud shell compiles
# against them in a repo where no test here runs. Positive control FIRST on the
# real tree, then the red direction on a renamed copy — a grep that matches
# nothing would otherwise "pass" both ways.
case_seam_signature() {
    local a='export async function readSettingsBlob(): Promise<string | null>'
    local b='export async function writeSettingsBlob(blob: string): Promise<void>'
    grep -qF "$a" "$repo_root/$SEAM" || {
        echo "    (cây thật: thiếu chữ ký readSettingsBlob đã ghim)" >&2
        return 1
    }
    grep -qF "$b" "$repo_root/$SEAM" || {
        echo "    (cây thật: thiếu chữ ký writeSettingsBlob đã ghim)" >&2
        return 1
    }
    make_worktree
    patch "$SEAM" 's = s.replace("export async function writeSettingsBlob", "export async function writeBlob", 1)'
    grep -qF "$b" "$wt/$SEAM" && {
        echo "    (bản đã đổi tên vẫn khớp chữ ký — phép đo không phân biệt được)" >&2
        return 1
    }
    return 0
}

# AC-6. THE case this script exists for: restore the truncate-then-write and
# require the concurrent-reader assertion to catch a partial sample. Measured
# 31/08 on this machine — the old implementation produced one zero-length
# sample out of 19,775.
case_atomic() {
    make_worktree
    patch "$SEAM" 's = s.replace("""    try {
        writeFileSync(tmp, blob, "utf8");
        renameSync(tmp, target);
    } catch (err) {
        // Leave no orphan behind on the failure path either.
        rmSync(tmp, { force: true });
        throw err;
    }""", "    writeFileSync(target, blob, \"utf8\");", 1)'
    ! run_test "concurrent reader" || return 1
    # It must go red because a partial sample was SEEN, not because the file
    # failed to compile — that distinction is the whole point of this case.
    assert_red_for "concurrent reader" "mẫu cụt|không bắc qua"
}

# --- runner ---------------------------------------------------------------
run_case() {
    local name="$1" fn="case_${1//-/_}"
    if declare -F "$fn" >/dev/null && "$fn"; then
        echo "CASE $name: PASS"
        destroy_worktree
        return 0
    fi
    echo "CASE $name: FAIL"
    destroy_worktree
    return 1
}

refuse() {
    echo "check-env-store-teeth: $1" >&2
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
    echo "→ răng của kho khoá (env-store + settings-store)"
else
    echo "→ răng: ${SELECTED[*]}"
fi

pass=0
fail=0
for c in "${SELECTED[@]}"; do
    if run_case "$c"; then pass=$((pass + 1)); else fail=$((fail + 1)); fi
done

# Constraint (a), proven rather than promised: the shared tree must be exactly
# as it was. A run that patched the working tree and died would show up here.
if git -C "$repo_root" diff --quiet -- "$STORE" "$SEAM"; then
    echo "cây chung sạch: $STORE và $SEAM không đổi"
else
    echo "FAIL: cây chung BẨN sau khi chạy răng — bản vá đã rò ra ngoài worktree" >&2
    exit 1
fi

echo
if [ "$fail" -ne 0 ]; then
    echo "❌ răng: $pass đạt / $fail hỏng — bộ kiểm kho khoá không đáng tin"
    exit 1
fi
echo "✅ răng: $pass/$pass case — mỗi case một mã thoát riêng"
