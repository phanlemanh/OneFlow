#!/usr/bin/env bash
# cong-tu-canh-minh — guards for AC-6..AC-9 and AC-13.
#
# Usage: check-gate-guards-job.sh <shape|no-softening|teeth|job-count|reachable|suite-keys|a11y-dist-dir>
#
# The acceptance gate's own two drift guards had ZERO references in
# .github/workflows/ci.yml (measured 31/08), so they only ran when somebody
# typed them. PRODUCT-MAP.md drifted by four slugs — it advertised 22 delivered
# items while 26 dossiers were signed — and nobody knew.
#
# The CI modes follow scripts/ci/check-vitest-job.sh, which already solved this
# problem for the vitest job: parse the job block BY INDENTATION (a renamed step
# cannot hide), and READ THE COMMAND OUT OF THE YAML AND RUN IT rather than
# asserting the YAML contains a script name. Reading YAML measures instructions;
# running the extracted command measures behaviour.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
repo_root=$(pwd)

WF=.github/workflows/ci.yml
MODE="${1:?usage: check-gate-guards-job.sh <shape|no-softening|teeth|job-count|reachable|suite-keys|a11y-dist-dir>}"

fail() { echo "FAIL: $*" >&2; exit 1; }

# The job block: from `  acceptance-gate:` to the next top-level job key.
job_block() {
    awk '
        /^  acceptance-gate:/ { inblock = 1; print; next }
        inblock && /^  [a-z0-9_-]+:/ { inblock = 0 }
        inblock { print }
    ' "$WF"
}

# The two guard commands this package wires in. Named once so every mode agrees
# on what it is looking for.
# Needles are matched against the `run:` lines of the acceptance-gate job. A needle
# must resolve to exactly ONE row, so the live-docs guard carries its mode in the
# needle: three steps run the same script with different modes.
GUARD_NEEDLES=(
    check-roadmap-fresh.sh
    check-product-map.mjs
    check-plan-freeze.mjs
    check-plan-freeze-teeth.sh
    check-plan-docs.sh
    check-plan-docs-teeth.sh
    check-eval-filters.mjs
    "check-live-docs-manifest-synced.sh readme"
    "check-live-docs-manifest-synced.sh claude"
    "check-live-docs-manifest-synced.sh orphans"
    check-live-docs-manifest-teeth.sh
)

# Needles whose GREEN half runs (on the real repo, which has git history) but whose
# RED half cannot be produced in the throwaway probe tree. Named here rather than
# quietly absent: a silent exclusion is the exact class this file exists to catch.
# Format: "<needle>|<reason>".
TEETH_SKIP=(
    "check-live-docs-manifest-synced.sh orphans|doc base ref qua git show; cay tham do la thu muc mktemp khong co .git"
    "check-live-docs-manifest-teeth.sh|ve do cua no CHINH LA no; pha no de chung minh no biet do la vong tron"
    "check-plan-freeze-teeth.sh|ve do cua no CHINH LA no; pha no de chung minh no biet do la vong tron"
    "check-plan-docs-teeth.sh|ve do cua no CHINH LA no; pha no de chung minh no biet do la vong tron"
)
teeth_skipped() {
    local n="$1" e
    for e in "${TEETH_SKIP[@]}"; do [ "${e%%|*}" = "$n" ] && return 0; done
    return 1
}

case "$MODE" in
shape)
    # AC-6. Both guards run inside the existing acceptance-gate job, and the job
    # still has what they need.
    [ -f "$WF" ] || fail "missing $WF"
    block=$(job_block)
    [ -n "$block" ] || fail "no 'acceptance-gate:' job in $WF"

    # Only `run:` lines count. Grepping the whole block measures INSTRUCTIONS, not
    # output: replacing a step with `# TODO: bat lai bash …synced.sh readme` left this
    # mode green while nothing ran (reproduced 2026-09-02). The sibling teeth and
    # teeth mode already extracts from `run:` lines only; shape did not.
    for needle in "${GUARD_NEEDLES[@]}"; do
        printf '%s\n' "$block" | sed -n 's|^[[:space:]]*run:[[:space:]]*||p' | grep -q -- "$needle" \
            || fail "job acceptance-gate không có dòng run: nào chạy $needle"
    done

    # fetch-depth: 0 is not decoration — check-roadmap-fresh.sh reads history,
    # and a shallow clone makes its historical case fail for the wrong reason.
    printf '%s\n' "$block" | grep -q 'fetch-depth: 0' \
        || fail "job acceptance-gate mất 'fetch-depth: 0' — guard lộ trình cần lịch sử"
    printf '%s\n' "$block" | grep -q 'node-version: 24' \
        || fail "job acceptance-gate mất 'node-version: 24'"

    # Triggers are workflow-level, so the steps inherit them — assert both are
    # still there, otherwise "it runs on PRs" is an assumption.
    grep -q '^  pull_request:' "$WF" || fail "$WF lost its pull_request trigger"
    grep -q '^  push:' "$WF" || fail "$WF lost its push trigger"
    echo "OK: cả hai guard nằm trong job acceptance-gate; fetch-depth 0, Node 24, hai trigger còn nguyên"
    ;;

no-softening)
    # AC-6. Nothing in the job may swallow a non-zero exit. A guard that cannot
    # go red is worse than no guard — it reports safety it does not provide.
    block=$(job_block)
    [ -n "$block" ] || fail "no 'acceptance-gate:' job in $WF"
    while IFS= read -r line; do
        case "$line" in
        *continue-on-error*) fail "job acceptance-gate làm mềm lỗi: $line" ;;
        *"|| true"*) fail "job acceptance-gate làm mềm lỗi: $line" ;;
        *"set +e"*) fail "job acceptance-gate làm mềm lỗi: $line" ;;
        esac
    done <<<"$block"
    echo "OK: không có continue-on-error / || true / set +e trong job acceptance-gate"
    ;;

reachable)
    # AC-13. The half no other mode covers: whether the job actually RUNS.
    #
    # shape, no-softening, teeth and job-count all read the CONTENT of the job
    # block. Put `if: github.ref == 'refs/heads/main'` on a guard step and every
    # one of them stays green while the guard never runs on a pull request —
    # which is precisely the zero-reference state this package exists to close.
    block=$(job_block)
    [ -n "$block" ] || fail "no 'acceptance-gate:' job in $WF"

    while IFS= read -r line; do
        case "$line" in
        *if:*) fail "job acceptance-gate mang điều kiện có thể bỏ qua nó: $line" ;;
        *needs:*) fail "job acceptance-gate xếp sau 'needs:' — một job trước đó bị bỏ qua sẽ kéo theo nó: $line" ;;
        esac
    done <<<"$block"

    # A workflow-level path filter is the same outcome by a different route: the
    # job is fine, it just never fires for the files being watched.
    python3 - <<'PY' || exit 1
import sys, yaml
wf = yaml.safe_load(open(".github/workflows/ci.yml"))
# PyYAML reads a bare `on:` key as the boolean True (YAML 1.1). Accept both.
trig = wf.get("on", wf.get(True)) or {}
pr = trig.get("pull_request") or {}
watched = ["PRODUCT-MAP.md", "docs/roadmap.md", "_acceptance/**"]
errs = []
for key in ("paths", "paths-ignore"):
    if key in pr:
        errs.append(
            f"trigger pull_request có `{key}: {pr[key]}` — lọc đường dẫn ở mức workflow "
            f"có thể khiến guard không chạy cho {', '.join(watched)}"
        )
if errs:
    for e in errs:
        print(f"FAIL: {e}", file=sys.stderr)
    sys.exit(1)
print("OK: trigger pull_request không lọc đường dẫn; step và job không mang if: hay needs:")
PY
    ;;

job-count)
    # AC-7 first half: this package adds STEPS, not a JOB.
    #
    # Two measured reasons, not one. (a) acceptance-gate has already paid for
    # checkout + setup-node. (b) scripts/ci/check-action-pins.sh asserts
    # EXPECTED_CHECKOUT_SITES=8; a new job adds a ninth `actions/checkout` and
    # turns that unrelated guard red — the exact trap CLAUDE.md documents for
    # the manifest guard.
    python3 - <<'PY' || exit 1
import sys, yaml
wf = yaml.safe_load(open(".github/workflows/ci.yml"))
jobs = set(wf["jobs"])
want = {"lint", "typecheck", "build", "unit-tests", "sdk-tests", "acceptance-gate"}
errs = []
if len(jobs) != 6:
    errs.append(f"ci.yml có {len(jobs)} job, cần đúng 6: {sorted(jobs)}")
if jobs != want:
    extra, gone = sorted(jobs - want), sorted(want - jobs)
    if extra: errs.append(f"job lạ: {', '.join(extra)}")
    if gone: errs.append(f"job biến mất: {', '.join(gone)}")
if errs:
    for e in errs:
        print(f"FAIL: {e}", file=sys.stderr)
    sys.exit(1)
print("OK: đúng 6 job, đúng tập tên đã biết")
PY

    # AC-7 second half. Counting jobs and matching names says nothing about a
    # job's BODY: `continue-on-error: true` on `lint` keeps six jobs and the
    # same five names, and shape/no-softening only look inside acceptance-gate.
    base=$(git merge-base HEAD origin/main 2>/dev/null || true)
    if [ -z "$base" ]; then
        echo "  (bỏ qua so sánh merge-base: không phân giải được origin/main — vế 'năm job không đổi định nghĩa' KHÔNG được đo ở lượt này)"
    else
        python3 - "$base" <<'PY' || exit 1
import subprocess, sys, yaml
base = sys.argv[1]
old = yaml.safe_load(subprocess.run(
    ["git", "show", f"{base}:.github/workflows/ci.yml"],
    capture_output=True, text=True, check=True).stdout)
new = yaml.safe_load(open(".github/workflows/ci.yml"))
errs = []
for job in ("lint", "typecheck", "build", "unit-tests", "sdk-tests"):
    o, n = old["jobs"].get(job) or {}, new["jobs"].get(job) or {}
    if o != n:
        changed = sorted({k for k in set(o) | set(n) if o.get(k) != n.get(k)})
        errs.append(f"job `{job}` đổi định nghĩa ở khoá: {', '.join(changed) or '(thân step)'}")
if errs:
    for e in errs:
        print(f"FAIL: {e}", file=sys.stderr)
    sys.exit(1)
print(f"OK: năm job còn lại deep-equal với merge-base {base[:8]}")
PY
    fi
    ;;

teeth)
    # AC-6. Prove the commands THE JOB RUNS actually go red on real drift.
    #
    # The commands are READ OUT OF ci.yml, never hardcoded. check-vitest-job.sh
    # learned this the hard way: an earlier version ran `pnpm test` directly and
    # stayed green on a tree with no CI job at all — it proved the test runner
    # had teeth while saying nothing about the job.
    block=$(job_block)
    [ -n "$block" ] || fail "no 'acceptance-gate:' job in $WF — nothing to prove teeth about"

    cmds=()
    for needle in "${GUARD_NEEDLES[@]}"; do
        cmd=$(printf '%s\n' "$block" | sed -n "s|^[[:space:]]*run:[[:space:]]*\(.*${needle}.*\)$|\1|p" | tail -1)
        [ -n "$cmd" ] || fail "không rút được lệnh chạy $needle ra từ $WF"
        echo "lệnh dưới phép thử (rút từ $WF): $cmd"
        cmds+=("$cmd")
    done

    # Every perturbed needle must go red for ITS OWN reason. Asserting only
    # `red_rc -ne 0` credits a BORROWED red: check-plan-docs.sh went red purely
    # off the duplicated-ledger-row perturbation meant for check-roadmap-fresh.sh
    # while all 15 of its own checks stayed OK in both directions, and this mode
    # called that proof (S4 round 2, in-contract finding). Tokens are measured
    # from the real red output of the probe tree, not guessed.
    RED_TOKEN=(
        "check-roadmap-fresh.sh|roadmap drift"
        "check-product-map.mjs|vắng trên bản đồ"
        "check-plan-freeze.mjs|teeth-probe-freeze mở ngoài kế hoạch"
        "check-plan-docs.sh|FAIL: STATUS.md đề ngày"
        "check-eval-filters.mjs|KHÔNG ca thử nào khớp"
        "check-live-docs-manifest-synced.sh readme|does not list"
        "check-live-docs-manifest-synced.sh claude|no origin entry for"
    )
    red_token_for() {
        local e
        for e in "${RED_TOKEN[@]}"; do
            [ "${e%%|*}" = "$1" ] && { printf '%s' "${e#*|}"; return 0; }
        done
        return 1
    }

    # GREEN HALF, on the healthy tree, on the SAME extracted string.
    #
    # Without it a red-only assertion cannot tell "the guard caught the drift"
    # from "the command is simply broken": a typo'd flag exits non-zero on the
    # perturbed copy too, the mode passes, and CI is then red on every PR after
    # this lands.
    for gi in "${!cmds[@]}"; do
        cmd="${cmds[$gi]}"
        set +e
        eval "$cmd" >/tmp/cggj-green.log 2>&1
        green_rc=$?
        set -e
        [ "$green_rc" -eq 0 ] \
            || fail "'$cmd' đỏ trên cây LÀNH (exit $green_rc) — lệnh sai, không phải guard bắt lỗi. Xem /tmp/cggj-green.log"
        # A token that ALSO appears on the healthy tree proves nothing: the first
        # draft pinned "STATUS.md đề ngày", which this guard prints as `OK: STATUS.md
        # đề ngày 04/09` on a PASS, so the red-half assertion matched a green line
        # and stayed satisfied with the perturbation removed. Measured, not assumed.
        if gt=$(red_token_for "${GUARD_NEEDLES[$gi]}"); then
            grep -qF -- "$gt" /tmp/cggj-green.log \
                && fail "RED_TOKEN của '${GUARD_NEEDLES[$gi]}' («$gt») xuất hiện trên cây LÀNH — token này khớp cả lúc guard xanh, nên vế đỏ dựa vào nó không chứng minh gì"
        fi
    done

    # RED HALF: perturb a throwaway copy and run the same commands against it.
    probe=$(mktemp -d)
    cleanup() { rm -rf "$probe"; }
    trap cleanup EXIT

    mkdir -p "$probe/t/docs"
    cp -R docs/adr "$probe/t/docs/adr"
    cp docs/roadmap.md "$probe/t/docs/roadmap.md"
    cp PRODUCT-MAP.md "$probe/t/PRODUCT-MAP.md"
    mkdir -p "$probe/t/_acceptance"
    for d in _acceptance/*/; do
        slug=$(basename "$d")
        mkdir -p "$probe/t/_acceptance/$slug"
        [ -f "$d/contract.md" ] && cp "$d/contract.md" "$probe/t/_acceptance/$slug/"
        [ -f "$d/opportunity.md" ] && cp "$d/opportunity.md" "$probe/t/_acceptance/$slug/"
    done
    cp -R scripts "$probe/t/scripts"
    cp -R _acceptance/config.yaml "$probe/t/_acceptance/config.yaml"
    # The live-docs guard reads these; without them its red half would fail because
    # a file is missing, not because drift was caught — a red that proves nothing.
    mkdir -p "$probe/t/config"
    cp README.md CLAUDE.md "$probe/t/"
    # check-plan-docs.sh reads these two; without them its red half would fail
    # because a file is missing, not because drift was caught.
    cp STATUS.md "$probe/t/"
    mkdir -p "$probe/t/docs/strategy"
    cp docs/strategy/vision.md "$probe/t/docs/strategy/"
    cp docs/README_ZH.md docs/README_JA.md "$probe/t/docs/"
    cp config/official-plugins.json "$probe/t/config/"
    # node_modules so the eval-filter guard fails on a BROKEN FILTER rather than
    # on a missing tool. Without it that guard went "red" for the wrong reason
    # and this mode credited a red that proved nothing — the vague-red trap the
    # mode exists to avoid.
    ln -s "$repo_root/node_modules" "$probe/t/node_modules" 2>/dev/null || true

    python3 - "$probe/t" <<'PERTURB'
import sys, pathlib
root = pathlib.Path(sys.argv[1])
# Drop one signed slug from the delivered block of the map.
m = root / "PRODUCT-MAP.md"
m.write_text("".join(l for l in m.read_text(encoding="utf-8").splitlines(keepends=True)
                     if "(`roadmap-drift-guard`)" not in l), encoding="utf-8")
# Duplicate one ledger row INSIDE the marker block.
r = root / "docs" / "roadmap.md"
lines = r.read_text(encoding="utf-8").splitlines(keepends=True)
start = next(i for i, l in enumerate(lines) if "roadmap-ledger:start" in l)
end = next(i for i, l in enumerate(lines) if "roadmap-ledger:end" in l)
row = next(i for i in range(start, end) if "`local-cpu-plugins`" in lines[i])
lines.insert(row + 1, lines[row])
r.write_text("".join(lines), encoding="utf-8")
# Break one eval filter so the third guard has real drift to catch.
c = root / "_acceptance" / "config.yaml"
t = c.read_text(encoding="utf-8")
assert "-t 'seam'" in t, "fixture anchor moved"
c.write_text(t.replace("-t 'seam'", "-t 'ten ca khong ton tai'", 1), encoding="utf-8")
# Drop one README entry the manifest registers -> `readme` mode must go red.
r2 = root / "docs" / "README_ZH.md"
t2 = r2.read_text(encoding="utf-8")
anchor = "- [tongflow-api-gemini](https://github.com/tong-io/tongflow-api-gemini)"
assert anchor in t2, "fixture anchor moved: README_ZH gemini row"
r2.write_text("".join(l for l in t2.splitlines(keepends=True) if not l.startswith(anchor)), encoding="utf-8")
# Name an id CLAUDE.md has no manifest origin entry for -> `claude` mode must go red.
cm = root / "CLAUDE.md"
t3 = cm.read_text(encoding="utf-8")
assert "`oneflow-api-openai`" in t3, "fixture anchor moved: CLAUDE.md origin id list"
cm.write_text(t3.replace("`oneflow-api-openai`", "`oneflow-api-openai`, `tongflow-api-openai`", 1), encoding="utf-8")
# Roll STATUS.md's heading date back a day -> check-plan-docs.sh must go red on
# ITS OWN check. Before this, the only perturbations in this block belonged to
# other guards, and check-plan-docs.sh went red purely by borrowing the
# duplicated-ledger-row perturbation meant for check-roadmap-fresh.sh: its own
# 15 checks stayed OK in BOTH directions (S4 round 2, in-contract finding).
st = root / "STATUS.md"
t4 = st.read_text(encoding="utf-8")
import re as _re
_m = _re.search(r"^## Hiện trạng \((\d{4}-\d{2}-\d{2})", t4, _re.M)
assert _m, "fixture anchor moved: STATUS.md heading date"
# Must be older than the NEWEST approved_at on the tree, not merely one day back:
# the check is a relation now (AC-17), so rolling back a single day can still
# satisfy it. Rolling back to 2026-01-01 is unambiguous in either regime.
# Ngay doc TU CAY roi lui ve 2026-01-01. Ghim ngay hom nay o day la dung benh ma
# AC-17 vua go khoi guard: no do that ngay STATUS.md duoc lam moi hop le.
st.write_text(t4[:_m.start(1)] + "2026-01-01" + t4[_m.end(1):], encoding="utf-8")
# A working-state dossier outside the plan -> check-plan-freeze.mjs must go red.
stray = root / "_acceptance" / "teeth-probe-freeze"
stray.mkdir(parents=True, exist_ok=True)
(stray / "contract.md").write_text(
    "---\nschema_version: 1\nslug: teeth-probe-freeze\nstatus: draft\n---\n", encoding="utf-8")
PERTURB

    # First line that reads like a verdict, for the log above. A red whose reason
    # nobody prints is a red nobody can attribute to the right guard.
    red_reason() {
        grep -m1 -E '^(FAIL|VIOLATION|❌|.*VIOLATION)' "$1" 2>/dev/null | head -c 160 \
            || true
    }

    red_cmds=(); red_needles=()
    for i in "${!cmds[@]}"; do
        if teeth_skipped "${GUARD_NEEDLES[$i]}"; then continue; fi
        red_cmds+=("${cmds[$i]}"); red_needles+=("${GUARD_NEEDLES[$i]}")
    done

    for ri in "${!red_cmds[@]}"; do
        cmd="${red_cmds[$ri]}"; needle="${red_needles[$ri]}"
        # The probe tree holds the CONFIG and the docs the guards read, but not
        # the source tree — symlinking src breaks vitest's module resolution
        # and hard-linking it just moves the failure to config/. So the
        # eval-filter guard is pointed back at the real sources while still
        # reading the PERTURBED config. Without this it went red because the
        # tool was missing, not because a filter was broken: removing the
        # perturbation entirely left this mode green, which is a red that
        # proves nothing — the exact trap this mode exists to avoid.
        run="$cmd"
        case "$cmd" in
        *check-eval-filters.mjs*) run="$cmd --vitest-root \"$repo_root\"" ;;
        esac
        set +e
        (cd "$probe/t" && eval "$run") >/tmp/cggj-red.log 2>&1
        red_rc=$?
        set -e
        [ "$red_rc" -ne 0 ] \
            || fail "'$run' thoát 0 trên cây đã phá — guard rỗng. Xem /tmp/cggj-red.log"
        token=$(red_token_for "$needle") \
            || fail "needle '$needle' nằm trong PHÁ nhưng RED_TOKEN không khai câu đỏ của nó — không phân biệt được đỏ của chính nó với đỏ đi mượn"
        grep -qF -- "$token" /tmp/cggj-red.log \
            || fail "'$run' đỏ trên cây đã phá nhưng KHÔNG vì phép kiểm của chính nó: chờ '$token', không thấy trong /tmp/cggj-red.log — đây là một cái đỏ đi mượn"
        echo "  đỏ vì: $(red_reason /tmp/cggj-red.log)"
    done

    # GUARD-OF-THE-GUARD. Append a junk flag to the first extracted command and
    # require THIS MODE's own green half to reject it — proof that the mode
    # distinguishes "the guard caught it" from "any command is broken".
    for cmd in "${cmds[@]}"; do
        set +e
        eval "$cmd --co-rac-khong-ton-tai" >/dev/null 2>&1
        junk_rc=$?
        set -e
        [ "$junk_rc" -ne 0 ] \
            || fail "'$cmd' nuốt một cờ rác và vẫn thoát 0 — vế xanh của ô này không phân biệt được 'guard bắt lỗi' với 'lệnh nào cũng hỏng'"
    done

    cleanup
    trap - EXIT

    # Counts as a MEASUREMENT, not a remark. Without the invariant, "forgot to write
    # a perturbation for a needle" and "deliberately skipped it" print the same green.
    ke=${#cmds[@]}; pha=${#red_cmds[@]}; bo=${#TEETH_SKIP[@]}
    echo "KÊ=$ke · PHÁ=$pha · BỎ QUA=$bo"
    for e in "${TEETH_SKIP[@]}"; do echo "  bỏ qua: ${e%%|*} — ${e#*|}"; done
    [ "$ke" -eq "$((pha + bo))" ] \
        || fail "kê $ke needle nhưng phá $pha + bỏ qua $bo = $((pha + bo)) — một needle không có phép phá và cũng không được khai bỏ qua"
    echo "OK: $ke lệnh (rút từ $WF) xanh trên cây lành; $pha đỏ trên cây đã phá; $bo bỏ qua CÓ TÊN; cờ rác bị từ chối"
    ;;

suite-keys)
    # AC-8. Three assertions on _acceptance/config.yaml, read with a YAML parser
    # rather than grep.
    #
    # (3) is the suppressing half: a "tidy-up" that deletes the combined key
    # would satisfy (1) and (2) while breaking seven signed evidence packages
    # that cite it.
    python3 - <<'PY' || exit 1
import sys, yaml
d = yaml.safe_load(open("_acceptance/config.yaml"))
keys = d["feature_loop"]["suite_keys"]
tests = d["executors"]["test"]
errs = []
for want in ("executors.test.build", "executors.test.typecheck"):
    if want not in keys:
        errs.append(f"feature_loop.suite_keys thiếu {want}")
if "executors.test.build_typecheck" in keys:
    errs.append(
        "feature_loop.suite_keys vẫn dùng khoá gộp executors.test.build_typecheck — "
        "một lượt build bị công cụ giết nuốt luôn tín hiệu typecheck đi cùng"
    )
if "build_typecheck" not in tests:
    errs.append(
        "executors.test.build_typecheck đã bị xoá khỏi executors — bảy hồ sơ đã ký "
        "tham chiếu nó, xoá là làm hỏng bảy bộ bằng chứng"
    )
if errs:
    for e in errs:
        print(f"FAIL: {e}", file=sys.stderr)
    sys.exit(1)
print("OK: suite_keys dùng build + typecheck rời, và khoá gộp vẫn còn trong executors")
PY
    ;;

a11y-dist-dir)
    # AC-9. A closed matrix over the wrappers that EXIST, not a hardcoded pair:
    # a new wrapper copied from the wrong template must fail this too, and a
    # check that only looks at one file cannot tell "fixed" from "read the wrong
    # file".
    #
    # Why it matters: `pnpm build` is a suite key that runs in PARALLEL, and a
    # build landing mid-scan deletes the chunks the dev server is still handing
    # out. Only PAGES die, so route-handler evals stay green and a broken round
    # reads like a clean one. Measured 31/08: onboarding 0 mentions,
    # media-library 1 — media-library is the positive control.
    wrappers=()
    while IFS= read -r w; do wrappers+=("$w"); done < <(ls scripts/*/check-a11y-proto.sh 2>/dev/null || true)
    [ "${#wrappers[@]}" -ge 2 ] \
        || fail "tìm thấy ${#wrappers[@]} wrapper a11y — cần ít nhất 2 (media-library là đối chứng dương)"

    missing=0
    for w in "${wrappers[@]}"; do
        if grep -q 'NEXT_DIST_DIR' "$w"; then
            echo "  ok  $w"
        else
            echo "FAIL: $w dựng dev server mà không đặt NEXT_DIST_DIR riêng" >&2
            missing=$((missing + 1))
        fi
    done
    [ "$missing" -eq 0 ] || fail "$missing/${#wrappers[@]} wrapper a11y thiếu NEXT_DIST_DIR"
    echo "OK: ${#wrappers[@]}/${#wrappers[@]} wrapper a11y đặt NEXT_DIST_DIR riêng"
    ;;

*)
    fail "unknown mode '$MODE' (shape|no-softening|teeth|job-count|reachable|suite-keys|a11y-dist-dir)"
    ;;
esac
