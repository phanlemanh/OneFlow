#!/usr/bin/env bash
# Guard: a re-pin must not silently swallow an eval whose `paths` the pin's own diff
# touched. Dispatcher + the three modes that need a shell (fixtures, worktrees, teeth);
# the reading/­judging logic lives in the sibling repin-eval-coverage.mjs.
#
# Usage: check-repin-eval-coverage.sh <write|plan|check|newlines|paths-law|readers|teeth> [...]
#
# Every mode prints the counts it worked from. A printed count is the only thing that
# separates "scanned and found nothing wrong" from "scanned nothing" -- and the counts
# here are INDEPENDENT (dossiers, repin lines, computable, grandfathered, swallowed,
# inconclusive), so they constrain each other. An earlier guard in this repo shipped
# `ke == do + bo qua`, which every element satisfies by construction and which therefore
# could never fail; that is the shape to avoid.

set -uo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
CORE="$ROOT/scripts/ci/repin-eval-coverage.mjs"
MODE="${1:-}"
shift || true

fail() { echo "FAIL: $*" >&2; exit 1; }
[ -f "$CORE" ] || fail "thieu $CORE"

case "$MODE" in
write | plan | check | newlines)
    exec node "$CORE" "$MODE" "$@"
    ;;

paths-law)
    # AC-3. The matching law is the core computation of every other mode, so it gets a
    # FULL matrix written out: four entry shapes x two directions = eight rows, each
    # naming which entry matched which file and by which rule. The bare-directory shape
    # is not academic -- this repo's own evals declare `paths: ["_acceptance"]` and
    # `paths: ["public/plugins"]`, and a plain glob matcher accepts nothing underneath
    # them, so every directory-shaped entry would be permanently untouchable.
    node --input-type=module -e '
        import { pathMatches } from "'"$CORE"'";
        const rows = [
            ["duong-dan-tran", "README.md",        "README.md",                    true ],
            ["duong-dan-tran", "README.md",        "docs/README.md",               false],
            ["glob",           "scripts/**",       "scripts/ci/x.sh",              true ],
            ["glob",           "scripts/**",       "src/x.ts",                     false],
            ["thu-muc-tran",   "_acceptance",      "_acceptance/a/contract.md",    true ],
            ["thu-muc-tran",   "_acceptance",      "_acceptance-cu/a.md",          false],
            ["tien-to-sao",    "src/*.ts",         "src/a.ts",                     true ],
            ["tien-to-sao",    "src/*.ts",         "src/a/b.ts",                   false],
        ];
        let bad = 0;
        for (const [shape, entry, file, want] of rows) {
            const got = pathMatches(entry, file);
            const ok = Boolean(got) === want;
            if (!ok) bad++;
            console.log(`${ok ? "ok  " : "SAI "} ${shape.padEnd(15)} ${entry.padEnd(14)} vs ${file.padEnd(28)} -> ${got || "khong khop"} (mong: ${want ? "khop" : "khong khop"})`);
        }
        console.log(`ma tran: ${rows.length} dong = 4 hinh dang x 2 chieu | sai: ${bad}`);
        if (bad) { console.error(`FAIL: ${bad} o cua ma tran khop paths sai`); process.exit(1); }
        console.log("OK: luat khop paths dung o ca bon hinh dang, ca hai chieu");
    '
    ;;

readers)
    # AC-7. The claim under test is a RELATION, not a presence: adding `prev_sha` to a
    # repin line must leave pre-merge-check's output byte-identical. "Both readers accept
    # it" is vacuously true -- they JSON.parse and read three keys, so no content of an
    # unknown field can make them red. Comparing before/after is what actually measures.
    #
    # Runs in a detached worktree, never the real tree: the previous dossier shipped a
    # teeth case that wrote a probe file into the working tree while a sibling eval
    # listed that same directory in parallel, and it could redden an unrelated cell.
    # Prune first: a worktree whose directory was removed without `worktree remove`
    # stays registered, and a later `worktree add` then fails for a reason that has
    # nothing to do with what this mode measures. Observed 2026-09-02 -- this mode went
    # red once, standalone, purely from a leftover registration.
    git -C "$ROOT" worktree prune >/dev/null 2>&1
    W="$(mktemp -d)"; trap 'git -C "$ROOT" worktree remove --force "$W" >/dev/null 2>&1; rm -rf "$W"' EXIT
    git -C "$ROOT" worktree add -q --detach "$W" HEAD || fail "khong dung duoc worktree"

    # Pick a run-log whose repin line pre-merge-check ACTUALLY READS -- i.e. one whose
    # run_id is cited by a `### Re-pin` section in the sibling evidence report. Taking
    # the first file grep happens to return makes this mode INTERMITTENT: if that file's
    # repin lines are cited by nobody, removing a key changes no output and the positive
    # control fails for a reason unrelated to what is being measured. Observed twice on
    # 2026-09-02 -- green standalone, red inside the eval batch.
    target=""
    for rl in "$W"/_acceptance/*/run-log.jsonl; do
        rep="$(dirname "$rl")/evidence-report.md"
        [ -f "$rep" ] || continue
        rid="$(awk '/^### Re-pin/{s=1;next} /^#{1,3}[[:space:]]/{s=0} s && /^[[:space:]]*run_id:/{print $2; exit}' "$rep")"
        [ -n "$rid" ] || continue
        grep -qF "\"run_id\":\"$rid\"" "$rl" || continue
        target="$rl"; break
    done
    [ -n "$target" ] || fail "khong tim thay run-log nao co dong repin duoc mot section ### Re-pin trich dan"
    echo "muc tieu: ${target#"$W"/} (dong repin duoc ### Re-pin trich dan)"

    run_pmc() { (cd "$W" && bash scripts/pre-merge-check.sh . --base origin/main 2>&1); }

    with="$(run_pmc)"
    node -e '
        const fs = require("fs"), p = process.argv[1];
        const out = fs.readFileSync(p, "utf8").split("\n").map((l) => {
            if (!l.includes("\"kind\":\"repin\"")) return l;
            try { const o = JSON.parse(l); delete o.prev_sha; return JSON.stringify(o); } catch { return l; }
        });
        fs.writeFileSync(p, out.join("\n"));
    ' "$target"
    without="$(run_pmc)"

    if [ "$with" != "$without" ]; then
        echo "FAIL: dau ra pre-merge-check KHAC nhau giua co va khong co prev_sha" >&2
        diff <(printf '%s\n' "$with") <(printf '%s\n' "$without") | head -12 >&2
        exit 1
    fi
    n_with=$(printf '%s\n' "$with" | grep -c '^VIOLATION' || true)
    echo "hai luot pre-merge-check giong nhau tung byte | violation moi luot: $n_with"

    # POSITIVE CONTROL. Without it this mode cannot tell "prev_sha is harmless" from
    # "this comparison can never see a difference". Removing the `sha` key is a change
    # the readers are documented to reject, so it MUST change the output.
    node -e '
        const fs = require("fs"), p = process.argv[1];
        const out = fs.readFileSync(p, "utf8").split("\n").map((l) => {
            if (!l.includes("\"kind\":\"repin\"")) return l;
            try { const o = JSON.parse(l); delete o.sha; return JSON.stringify(o); } catch { return l; }
        });
        fs.writeFileSync(p, out.join("\n"));
    ' "$target"
    broken="$(run_pmc)"
    [ "$broken" != "$without" ] \
        || fail "doi chung duong that bai: go khoa 'sha' khong lam doi dau ra — phep so nay khong thay duoc khac biet nao, nen ve xanh cua no vo nghia"
    echo "doi chung duong: go khoa 'sha' LAM doi dau ra"
    echo "OK: them prev_sha khong doi ket luan cua ben doc; phep so chung minh duoc no thay khac biet"
    ;;

teeth)
    ONLY=""
    case "${1:-}" in
    "") ;;
    --case) ONLY="${2:-}"; [ "$#" -le 2 ] || fail "thua doi so: ${*:3}" ;;
    *) fail "doi so la '${1}' — chi nhan '--case <ten>'" ;;
    esac
    KNOWN="healthy nuot-eval da-chay-lai ong-ba khong-khai-paths paths-thu-muc-tran paths-glob write-thieu-verified-commit plan-tap-id plan-them-mot-file"
    TOTAL=10
    RAN=0
    FAILED=0
    if [ -n "$ONLY" ] && ! printf '%s\n' $KNOWN | grep -qx "$ONLY"; then
        echo "unknown case: $ONLY (known: $KNOWN)" >&2
        exit 2
    fi

    W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT

    # Build a throwaway repo with one signed dossier, two commits, and a file that the
    # eval's `paths` covers. Every case gets a fresh one: a shared fixture mutated
    # across cases is how a later case ends up proving something about an earlier one.
    fixture() {
        local d="$W/r" evpaths="$1"
        rm -rf "$d"; mkdir -p "$d/_acceptance/demo" "$d/src"
        git -C "$d" init -q 2>/dev/null || git init -q "$d"
        git -C "$d" config user.email t@t; git -C "$d" config user.name t
        printf 'status: signed-off\n' > "$d/_acceptance/demo/contract.md"
        printf -- "evals:\n  - id: E1\n%s  - id: E2\n    paths: [\"src/never\"]\n" "$evpaths" > "$d/_acceptance/demo/evals.yaml"
        printf 'x\n' > "$d/src/a.ts"
        printf -- '- eval: E1\n' > "$d/_acceptance/demo/evidence-report.md"
        : > "$d/_acceptance/demo/run-log.jsonl"
        git -C "$d" add -A; git -C "$d" commit -q -m one
        OLD="$(git -C "$d" rev-parse HEAD)"
        printf 'y\n' >> "$d/src/a.ts"
        git -C "$d" add -A; git -C "$d" commit -q -m two
        NEW="$(git -C "$d" rev-parse HEAD)"
        printf 'verified_commit: %s\n' "$OLD" >> "$d/_acceptance/demo/evidence-report.md"
        # Command substitution runs in a subshell, so assignments made here do not reach
        # the caller. Hand the two shas back through files instead of pretending they do.
        printf '%s' "$OLD" > "$W/OLD"; printf '%s' "$NEW" > "$W/NEW"
        echo "$d"
    }
    fx() { d="$(fixture "$1")"; OLD="$(cat "$W/OLD")"; NEW="$(cat "$W/NEW")"; }
    repin_line() { printf '{"ts":"t","kind":"repin","run_id":"R1","sha":"%s"%s,"suites_exit":[0]}\n' "$2" "$3" >> "$1/_acceptance/demo/run-log.jsonl"; }
    core() { ( RKCE_ROOT="$1" node "$CORE" "${@:2}" ) 2>&1; }

    want() { # want <name> <green|red> <output> <rc> [needles...]
        local name="$1" expect="$2" out="$3" rc="$4"; shift 4
        RAN=$((RAN + 1))
        if [ "$expect" = green ] && [ "$rc" -ne 0 ]; then
            echo "CASE $name: FAIL — mong xanh, thoat $rc"; printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1; return
        fi
        if [ "$expect" = red ] && [ "$rc" -eq 0 ]; then
            echo "CASE $name: FAIL — mong do, nhung thoat 0"; printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1; return
        fi
        local n
        for n in "$@"; do
            printf '%s\n' "$out" | grep -qF -- "$n" \
                || { echo "CASE $name: FAIL — dau ra khong neu '$n'"; printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1; return; }
        done
        echo "CASE $name: PASS"
    }
    run() { [ -z "$ONLY" ] || [ "$ONLY" = "$1" ]; }

    # 1. write on a well-formed dossier records prev_sha == the old verified_commit.
    if run healthy; then
        fx '    paths: ["src/**"]
'
        out="$(core "$d" write demo "$NEW" R9)"; rc=$?
        want healthy green "$out" "$rc" "prev_sha=${OLD:0:12}"
    fi

    # 2. the hole itself: a computable pin touched E1 and nothing re-ran it.
    if run nuot-eval; then
        fx '    paths: ["src/**"]
'
        repin_line "$d" "$NEW" ",\"prev_sha\":\"$OLD\""
        out="$(core "$d" check)"; rc=$?
        want nuot-eval red "$out" "$rc" "demo" "R1" "E1"
    fi

    # 3. the control that separates "catches a swallow" from "reds everything".
    if run da-chay-lai; then
        fx '    paths: ["src/**"]
'
        repin_line "$d" "$NEW" ",\"prev_sha\":\"$OLD\""
        printf '{"ts":"t","kind":"eval","run_id":"R2","eval":"E1","sha":"%s"}\n' "$NEW" >> "$d/_acceptance/demo/run-log.jsonl"
        out="$(core "$d" check)"; rc=$?
        want da-chay-lai green "$out" "$rc" "eval bi nuot: 0"
    fi

    # 4. historical lines carry no prev_sha; they are counted, not punished.
    if run ong-ba; then
        fx '    paths: ["src/**"]
'
        repin_line "$d" "$NEW" ""
        out="$(core "$d" check)"; rc=$?
        want ong-ba green "$out" "$rc" "ong ba: 1" "tinh duoc: 0"
    fi

    # 5. an eval with no `paths` cannot be judged -- named bucket, not a verdict.
    if run khong-khai-paths; then
        fx ''
        repin_line "$d" "$NEW" ",\"prev_sha\":\"$OLD\""
        out="$(core "$d" check)"; rc=$?
        want khong-khai-paths green "$out" "$rc" "khong ket luan duoc" "eval bi nuot: 0"
    fi

    # 6-7. the two matching shapes that a plain glob matcher would miss or over-match.
    if run paths-thu-muc-tran; then
        fx '    paths: ["src"]
'
        repin_line "$d" "$NEW" ",\"prev_sha\":\"$OLD\""
        out="$(core "$d" check)"; rc=$?
        want paths-thu-muc-tran red "$out" "$rc" "E1"
    fi
    if run paths-glob; then
        fx '    paths: ["src/*.ts"]
'
        repin_line "$d" "$NEW" ",\"prev_sha\":\"$OLD\""
        out="$(core "$d" check)"; rc=$?
        want paths-glob red "$out" "$rc" "E1"
    fi

    # 8. write refuses rather than emitting a blind line.
    if run write-thieu-verified-commit; then
        fx '    paths: ["src/**"]
'
        : > "$d/_acceptance/demo/evidence-report.md"
        out="$(core "$d" write demo "$NEW" R9)"; rc=$?
        want write-thieu-verified-commit red "$out" "$rc" "verified_commit" "demo"
    fi

    # 9-10. AC-4: `plan` must return SETS, not a count. A matcher that wrongly returns the
    # whole set prints the same three numbers as a correct one, so the assertion is on the
    # two id lists -- and on the delta: adding exactly one covered file must move exactly
    # one id from the untouched list to the touched one.
    if run plan-tap-id; then
        fx '    paths: ["src/**"]
'
        out="$(core "$d" plan demo "$OLD" "$NEW")"; rc=$?
        want plan-tap-id green "$out" "$rc" "BI CHAM (1): E1" "KHONG CHAM (1): E2"
    fi
    if run plan-them-mot-file; then
        fx '    paths: ["src/**"]
'
        mkdir -p "$d/src/never"
        printf 'z\n' > "$d/src/never/f.ts"
        git -C "$d" add -A >/dev/null
        git -C "$d" commit --quiet --message three
        NEW2="$(git -C "$d" rev-parse HEAD)"
        out="$(core "$d" plan demo "$OLD" "$NEW2")"; rc=$?
        want plan-them-mot-file green "$out" "$rc" "BI CHAM (2): E1,E2" "KHONG CHAM (0)"
    fi

    [ "$FAILED" -eq 0 ] || { echo "FAIL: it nhat mot ca khong xu su nhu doi hoi" >&2; exit 1; }
    if [ -n "$ONLY" ]; then
        echo "PARTIAL: $RAN/$TOTAL ca da chay — khong tuyen gi ve $((TOTAL - RAN)) ca chua chay"
        exit 0
    fi
    [ "$RAN" -eq "$TOTAL" ] || fail "chi $RAN/$TOTAL ca chay ma khong khai --case"
    echo "OK: $RAN/$TOTAL ca — 6 doi chung duong + 4 phep pha"
    ;;

*)
    echo "usage: $(basename "$0") <write|plan|check|newlines|paths-law|readers|teeth> [...]" >&2
    exit 2
    ;;
esac
