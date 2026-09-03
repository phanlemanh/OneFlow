#!/usr/bin/env bash
# Guard: a re-pin must not silently swallow an eval whose `paths` the pin's own diff
# touched. Dispatcher + the three modes that need a shell (fixtures, worktrees, teeth);
# the reading/­judging logic lives in the sibling repin-eval-coverage.mjs.
#
# Usage: check-repin-eval-coverage.sh <write|plan|check|newlines|paths-law|readers|so-khop-total|teeth> [...]
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

# The case list, and the suite size DERIVED from it. Two modes read these: `teeth` runs
# the cases, `so-khop-total` checks that the numbers written into evals.yaml still name
# this suite. Deriving TOTAL rather than typing it removes the only way the two can
# disagree.
KNOWN="healthy nuot-eval da-chay-lai ong-ba khong-khai-paths paths-thu-muc-tran paths-glob write-thieu-verified-commit plan-tap-id plan-them-mot-file write-thieu-suites write-lan-do write-prev-bang-sha diem-vao-duong-dan-la write-giu-dong-cu chay-lai-do log-hong newlines-thieu-prev so-khop-lech so-khop-rong san-tinh-duoc"
TOTAL=$(printf '%s\n' $KNOWN | wc -w | tr -d ' ')

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

so-khop-total)
    # AC-14. Every `PARTIAL: n/N` and `OK: n/N ca` written into an evals.yaml names the
    # size of THIS teeth suite. Round 3 found two of them still saying 14 after the suite
    # grew to 18 -- an `expected` that the command can never satisfy, which makes the
    # verifier's judgement a coin flip rather than a measurement. Nothing tied prose to
    # the suite, so this mode does.
    #
    # `ho_so` defaults to this dossier; the teeth case passes a fixture directory.
    ho_so="${1:-$ROOT/_acceptance/repin-khong-chay-lai-eval}"
    [ -d "$ho_so" ] || fail "khong thay thu muc $ho_so"
    # The files that describe THIS teeth suite's commands: the eval definitions and the
    # generated args the verify round is driven from. One hard-coded filename was too
    # narrow -- `s4-args.json` sat in-tree with seven stale numbers while the scan
    # reported clean. But the whole directory is too WIDE: `evidence-report.md` and
    # `opportunity.md` legitimately carry `OK: n/N ca` about OTHER suites (other
    # dossiers' teeth, eval tallies), and measured 2026-09-03 that produced 14 false
    # mismatches. The pattern names a shape, not a subject, so the file list is what
    # supplies the subject.
    files=()
    for f in "$ho_so/evals.yaml" "$ho_so/s4-args.json"; do
        [ -f "$f" ] && files+=("$f")
    done
    [ "${#files[@]}" -gt 0 ] || fail "khong co file nao doc duoc trong $ho_so"
    found=0; bad=0
    for f in "${files[@]}"; do
        while IFS= read -r n; do
            found=$((found + 1))
            [ "$n" = "$TOTAL" ] && continue
            echo "FAIL: ${f##*/} khai mot con so $n cho bo rang, nhung bo rang co $TOTAL ca" >&2
            bad=$((bad + 1))
        done < <(grep -ohE '(PARTIAL: [0-9n]+/[0-9]+|OK: [0-9]+/[0-9]+ ca)' "$f" | grep -oE '/[0-9]+' | tr -d '/')
    done
    echo "file da quet: ${#files[@]} | so noi ve bo rang: $found | lech: $bad | bo rang hien co: $TOTAL ca"
    # A scanner that matched NOTHING prints a clean sweep otherwise -- the exact shape
    # this dossier exists to close. Zero matches means the prose stopped naming the
    # suite, or the pattern stopped matching it; either way nothing is being measured.
    [ "$found" -gt 0 ] || fail "khong tim thay con so nao noi ve bo rang trong $ho_so — phep quet nay dang do KHONG GI, chu khong phai dang bao sach"
    [ "$bad" -eq 0 ] || exit 1
    echo "OK: moi con so trong ho so deu khop bo rang $TOTAL ca"
    ;;

teeth)
    ONLY=""
    case "${1:-}" in
    "") ;;
    --case) ONLY="${2:-}"; [ -n "$ONLY" ] || fail "--case can mot ten ca"; [ "$#" -le 2 ] || fail "thua doi so: ${*:3}" ;;
    *) fail "doi so la '${1}' — chi nhan '--case <ten>'" ;;
    esac
    RAN=0
    N_GREEN=0
    N_RED=0
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
        # E3 deliberately declares NO `paths`. AC-4's load-bearing claim is that `plan`
        # returns THREE sets, and the third one stayed permanently empty in every fixture
        # -- so folding "unknown" into "untouched" (the silent exclusion AC-4 forbids)
        # left both plan cases green.
        printf -- "evals:\n  - id: E1\n%s  - id: E2\n    paths: [\"src/never\"]\n  - id: E3\n" "$evpaths" > "$d/_acceptance/demo/evals.yaml"
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
    # Round-trip: the line the read cases judge is produced by the WRITER, under run_id
    # R1, so writer and reader are proven to agree on one artifact instead of on two
    # independent beliefs about its shape. `repin_line` survives only for the one shape
    # the writer cannot make by design -- a legacy line with no prev_sha.
    repin_written() { core "$1" write demo "$2" R1 '[0]' >/dev/null; }
    core() { ( RKCE_ROOT="$1" node "$CORE" "${@:2}" ) 2>&1; }

    want() { # want <name> <green|red> <output> <rc> [needles...]
        local name="$1" expect="$2" out="$3" rc="$4"; shift 4
        RAN=$((RAN + 1))
        # Tally by what was actually asked for, so the closing line REPORTS the run
        # instead of asserting a constant somebody has to remember to update.
        if [ "$expect" = green ]; then N_GREEN=$((N_GREEN + 1)); else N_RED=$((N_RED + 1)); fi
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
        out="$(core "$d" write demo "$NEW" R9 '[0,0,0]')"; rc=$?
        # Assert on the ARTIFACT, not on the announcement. Asserting only the stdout
        # string `prev_sha=<old12>` measured a console.log that prints from a local
        # variable: deleting `prev_sha` from the object actually written to the log left
        # this case green, so the eval that owns AC-1 could not see AC-1 being deleted.
        # Confirmed 2026-09-03 by an adversarial pass -- the case as first written was
        # two-directional in name only.
        out="$out
--- run-log ---
$(cat "$d/_acceptance/demo/run-log.jsonl")"
        want healthy green "$out" "$rc" "prev_sha=${OLD:0:12}" "\"prev_sha\":\"$OLD\""
    fi

    # 2. the hole itself: a computable pin touched E1 and nothing re-ran it.
    if run nuot-eval; then
        fx '    paths: ["src/**"]
'
        repin_written "$d" "$NEW"
        out="$(core "$d" check)"; rc=$?
        want nuot-eval red "$out" "$rc" "demo" "R1" "E1"
    fi

    # 3. the control that separates "catches a swallow" from "reds everything".
    if run da-chay-lai; then
        fx '    paths: ["src/**"]
'
        repin_written "$d" "$NEW"
        printf '{"ts":"t","kind":"eval","run_id":"R2","eval":"E1","sha":"%s","exit_code":0}\n' "$NEW" >> "$d/_acceptance/demo/run-log.jsonl"
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
        repin_written "$d" "$NEW"
        out="$(core "$d" check)"; rc=$?
        want khong-khai-paths green "$out" "$rc" "khong ket luan duoc" "eval bi nuot: 0"
    fi

    # 6-7. the two matching shapes that a plain glob matcher would miss or over-match.
    if run paths-thu-muc-tran; then
        fx '    paths: ["src"]
'
        repin_written "$d" "$NEW"
        out="$(core "$d" check)"; rc=$?
        want paths-thu-muc-tran red "$out" "$rc" "E1"
    fi
    if run paths-glob; then
        fx '    paths: ["src/*.ts"]
'
        repin_written "$d" "$NEW"
        out="$(core "$d" check)"; rc=$?
        want paths-glob red "$out" "$rc" "E1"
    fi

    # 8. write refuses rather than emitting a blind line.
    if run write-thieu-verified-commit; then
        fx '    paths: ["src/**"]
'
        : > "$d/_acceptance/demo/evidence-report.md"
        # Valid suites on purpose: the suites refusal fires FIRST, so omitting them here
        # would make this case pass on the wrong message and stop measuring the check it
        # is named after.
        out="$(core "$d" write demo "$NEW" R9 '[0]')"; rc=$?
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
        want plan-tap-id green "$out" "$rc" "BI CHAM (1): E1" "KHONG CHAM (1): E2" "KHONG KET LUAN DUOC (1, khong khai paths): E3"
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
        want plan-them-mot-file green "$out" "$rc" "BI CHAM (2): E1,E2" "KHONG CHAM (0)" "KHONG KET LUAN DUOC (1, khong khai paths): E3"
    fi

    # 11-13. `write` must RECORD evidence, never MINT it. `suites_exit` is the datum
    # pre-merge-check reads to conclude the lane was green, so an optional argument with
    # an all-zero default would let this tool manufacture that conclusion -- the same
    # class of fabricated provenance that put 37 invented shas into signed run-logs
    # earlier in this branch's history.
    if run write-thieu-suites; then
        fx '    paths: ["src/**"]
'
        out="$(core "$d" write demo "$NEW" R9)"; rc=$?
        want write-thieu-suites red "$out" "$rc" "suites_json" "khong co mac dinh"
    fi
    if run write-lan-do; then
        fx '    paths: ["src/**"]
'
        out="$(core "$d" write demo "$NEW" R9 '[0,1,0]')"; rc=$?
        want write-lan-do red "$out" "$rc" "thoat khac 0" "khong ghi dong repin"
    fi
    # A pin whose prev equals its sha has an empty diff, so it can never be found to
    # have swallowed anything: valid, computable, and permanently vacuous.
    if run write-prev-bang-sha; then
        fx '    paths: ["src/**"]
'
        out="$(core "$d" write demo "$OLD" R9 '[0]')"; rc=$?
        want write-prev-bang-sha red "$out" "$rc" "prev_sha == sha"
    fi

    # 14. The entry point must not become a silent no-op. `import.meta.url` is
    # percent-encoded AND symlink-resolved; argv[1] is neither, so a checkout under a
    # path with a space -- or under /tmp, which is a symlink on macOS -- made every mode
    # exit 0 printing nothing, unknown modes included.
    if run diem-vao-duong-dan-la; then
        sp="$W/co dau cach"; mkdir -p "$sp"; cp "$CORE" "$sp/"
        out="$(node "$sp/repin-eval-coverage.mjs" mode-khong-ton-tai 2>&1)"; rc=$?
        want diem-vao-duong-dan-la red "$out" "$rc" "usage:"
    fi

    # 15. the writer must not eat the line already there. A run-log whose last byte is
    # not a newline made appendFileSync fuse the two objects into one unparseable line;
    # both then vanished and `check` reported `dong repin: 0 ... OK` with exit 0.
    if run write-giu-dong-cu; then
        fx '    paths: ["src/**"]
'
        printf '{"ts":"t","kind":"repin","run_id":"R0","sha":"%s","prev_sha":"%s","suites_exit":[0]}' "$OLD" "$OLD" \
            > "$d/_acceptance/demo/run-log.jsonl"
        core "$d" write demo "$NEW" R9 '[0]' >/dev/null
        out="$(core "$d" check)"; rc=$?
        want write-giu-dong-cu red "$out" "$rc" "dong repin: 2" "R9"
    fi

    # 16. a re-run that FAILED is not coverage. Before this, any eval line at the pin's
    # sha satisfied the guard, so the loudest case became the blessed one.
    if run chay-lai-do; then
        fx '    paths: ["src/**"]
'
        repin_written "$d" "$NEW"
        printf '{"ts":"t","kind":"eval","run_id":"R1","eval":"E1","sha":"%s","exit_code":1}\n' "$NEW" \
            >> "$d/_acceptance/demo/run-log.jsonl"
        out="$(core "$d" check)"; rc=$?
        want chay-lai-do red "$out" "$rc" "DA chay lai nhung DO" "E1"
    fi

    # 17. a line nobody can parse must stop the verdict, not be filtered away.
    if run log-hong; then
        fx '    paths: ["src/**"]
'
        repin_written "$d" "$NEW"
        printf '{"kind":"eval", CAT CUT\n' >> "$d/_acceptance/demo/run-log.jsonl"
        out="$(core "$d" check)"; rc=$?
        want log-hong red "$out" "$rc" "khong doc duoc" "demo"
    fi

    # 18. the red direction `newlines` never had. Its expected text claimed the red case
    # lived in `ong-ba`, but that case exercises `check`. An assertion whose only
    # direction is green measures nothing. Base is $OLD, where run-log.jsonl does not
    # exist yet -- so every line in it counts as new, which is what this mode judges.
    if run newlines-thieu-prev; then
        fx '    paths: ["src/**"]
'
        repin_line "$d" "$NEW" ""
        out="$(core "$d" newlines "$OLD")"; rc=$?
        want newlines-thieu-prev red "$out" "$rc" "thieu prev_sha" "demo"
    fi

    # 19-20. the size-invariant's own two directions. Its red half already fired on real
    # data the first time it ran -- two `PARTIAL: 1/14` left behind when the suite grew to
    # 18 -- but a mode measured only on the repo's current state stops measuring the
    # moment that state is fixed. These run it on fixtures instead.
    if run so-khop-lech; then
        fx '    paths: ["src/**"]
'
        printf 'evals:\n  - id: E1\n    expected: >-\n      in `PARTIAL: 1/99` roi thoi\n' \
            > "$d/_acceptance/demo/evals.yaml"
        out="$(bash "${BASH_SOURCE[0]}" so-khop-total "$d/_acceptance/demo" 2>&1)"; rc=$?
        want so-khop-lech red "$out" "$rc" "99" "$TOTAL"
    fi

    # The refusal that separates "scanned and found nothing wrong" from "scanned
    # nothing". Without it a pattern that stops matching turns the guard green forever.
    if run so-khop-rong; then
        fx '    paths: ["src/**"]
'
        printf 'evals:\n  - id: E1\n    expected: khong noi gi ve bo rang\n' \
            > "$d/_acceptance/demo/evals.yaml"
        out="$(bash "${BASH_SOURCE[0]}" so-khop-total "$d/_acceptance/demo" 2>&1)"; rc=$?
        want so-khop-rong red "$out" "$rc" "dang do KHONG GI"
    fi

    # 21. the floor E6 claims must be a REFUSAL, not a printed number. A fixture whose
    # only repin line is grandfathered has `tinh duoc: 0`; plain `check` is legitimately
    # green there, and `--min-computable 1` must not be.
    if run san-tinh-duoc; then
        fx '    paths: ["src/**"]
'
        repin_line "$d" "$NEW" ""
        out="$(core "$d" check)"; rc=$?
        [ "$rc" -eq 0 ] || { echo "CASE san-tinh-duoc: FAIL — check tran phai xanh tren fixture ong ba"; FAILED=1; }
        out="$(core "$d" check --min-computable 1)"; rc=$?
        want san-tinh-duoc red "$out" "$rc" "tinh duoc = 0" "duoi san 1"
    fi

    [ "$FAILED" -eq 0 ] || { echo "FAIL: it nhat mot ca khong xu su nhu doi hoi" >&2; exit 1; }
    if [ -n "$ONLY" ]; then
        echo "PARTIAL: $RAN/$TOTAL ca da chay — khong tuyen gi ve $((TOTAL - RAN)) ca chua chay"
        exit 0
    fi
    [ "$RAN" -eq "$TOTAL" ] || fail "chi $RAN/$TOTAL ca chay ma khong khai --case"
    echo "OK: $RAN/$TOTAL ca — $N_GREEN doi chung duong + $N_RED phep pha"
    ;;

*)
    echo "usage: $(basename "$0") <write|plan|check|newlines|paths-law|readers|so-khop-total|teeth> [...]" >&2
    exit 2
    ;;
esac
