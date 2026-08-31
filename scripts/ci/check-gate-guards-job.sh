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
GUARD_NEEDLES=(check-roadmap-fresh.sh check-product-map.mjs)

case "$MODE" in
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
