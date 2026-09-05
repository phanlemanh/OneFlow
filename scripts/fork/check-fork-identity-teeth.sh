#!/usr/bin/env bash
# Teeth for scripts/fork/check-fork-identity.sh (and the two helper guards of
# mo-hoa-b01). Every case copies the declared file set into a scratch root, runs
# the guard there as a POSITIVE CONTROL (must be green), then breaks EXACTLY ONE
# variable and demands the guard go red WITH the pinned message. One assertion,
# one case: a case that breaks two things and pins one message proves only half
# (gap-probe 2026-09-05 P1).
#
# Usage: check-fork-identity-teeth.sh [--case <name>] [--selftest-fail]
# Exit 0 all green · 1 a case failed · 2 unknown case / bad usage.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
REPO_ROOT="$(pwd)"
GUARD="$REPO_ROOT/scripts/fork/check-fork-identity.sh"
LANE="$REPO_ROOT/scripts/fork/check-prototype-lane.sh"
SUITE="$REPO_ROOT/scripts/fork/check-suite-key.sh"
SLUG=mo-hoa-b01

CASES=(
    clean
    image-upstream conf-remote-lech readme-image-missing
    compose-no-build readme-no-build-cmd
    tag-trigger-back prepare-if-gone disarmed-header-gone claude-not-released-gone claude-builds-line-back
    discord-back email-back funding-back clone-upstream issue-template-not-fork
    badge-upstream release-badge-back ci-badge-gone pypi-badge-wrong-dist
    hit-outside class-matrix stale-exemption
    notice-dist-gone notice-unchanged-back notice-attribution-gone
    suite-key-dangling
    debt-table-missing
)

READMES=(README.md docs/README_ZH.md docs/README_JA.md)
TEMPLATES=(.github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/config.yml .github/ISSUE_TEMPLATE/feature_request.yml)
FIXTURE_FILES=("${READMES[@]}" docker-compose.yml CONTRIBUTING.md SECURITY.md NOTICE.md CLAUDE.md "${TEMPLATES[@]}" .github/workflows/desktop-release.yml sdk/pyproject.toml scripts/fork/fork-identity.conf scripts/fork/fork-identity-allow.txt _acceptance/config.yaml "_acceptance/$SLUG/opportunity.md")

REPO_RAW="$(sed -n 's/^repo=//p' scripts/fork/fork-identity.conf | head -1 | tr -d '[:space:]')"
REPO_LC="$(printf '%s' "$REPO_RAW" | tr '[:upper:]' '[:lower:]')"
IMAGE="ghcr.io/$REPO_LC"
DIST="$(sed -n 's/^name[[:space:]]*=[[:space:]]*"\([^"]*\)".*/\1/p' sdk/pyproject.toml | head -1)"

probe=""
cleanup() { if [ -n "$probe" ]; then rm -rf "$probe"; fi; return 0; }
trap cleanup EXIT

fixture() {
    probe="$(mktemp -d)"
    local f
    for f in "${FIXTURE_FILES[@]}"; do
        mkdir -p "$probe/$(dirname "$f")"
        cp "$f" "$probe/$f"
    done
}

# Small edit helpers — python for portability (BSD sed -i differs from GNU).
replace_in() { python3 - "$1" "$2" "$3" <<'PY'
import sys; p,o,n=sys.argv[1:4]; s=open(p,encoding='utf-8').read()
assert o in s, f"'{o}' not in {p}"; open(p,'w',encoding='utf-8').write(s.replace(o,n))
PY
}
delete_line_with() { python3 - "$1" "$2" <<'PY'
import sys; p,n=sys.argv[1:3]; L=open(p,encoding='utf-8').read().split('\n')
K=[l for l in L if n not in l]; assert len(K)<len(L), f"'{n}' not in {p}"; open(p,'w',encoding='utf-8').write('\n'.join(K))
PY
}
# Appends one line and prints its 1-based line number.
append_line() { python3 - "$1" "$2" <<'PY'
import sys; p,t=sys.argv[1:3]; s=open(p,encoding='utf-8').read()
if not s.endswith('\n'): s+='\n'
s+=t+'\n'; open(p,'w',encoding='utf-8').write(s); print(s.count('\n'))
PY
}
insert_after() { python3 - "$1" "$2" "$3" <<'PY'
import sys; p,n,t=sys.argv[1:4]; L=open(p,encoding='utf-8').read().split('\n')
i=next(i for i,l in enumerate(L) if n in l); L.insert(i+1,t); open(p,'w',encoding='utf-8').write('\n'.join(L))
PY
}
# Same, but the needle must equal the whole stripped line (short keys like `on:`
# also appear inside words such as `node-version:`).
insert_after_line() { python3 - "$1" "$2" "$3" <<'PY'
import sys; p,n,t=sys.argv[1:4]; L=open(p,encoding='utf-8').read().split('\n')
i=next(i for i,l in enumerate(L) if l.strip()==n); L.insert(i+1,t); open(p,'w',encoding='utf-8').write('\n'.join(L))
PY
}

run_guard() { # prints output, returns exit code; env passed by caller
    set +e
    FORK_IDENTITY_ROOT="$probe" bash "$GUARD" >"$probe/.out" 2>&1
    local rc=$?
    set -e
    return $rc
}
green_control() {
    if ! run_guard; then
        echo "FAIL CASE $1: đối chứng dương đỏ trên fixture chưa phá — xem $probe/.out" >&2
        cat "$probe/.out" >&2
        return 1
    fi
}
expect_red() { # <case> <token>
    local rc=0
    run_guard || rc=$?
    if [ "$rc" -eq 0 ]; then
        echo "FAIL CASE $1: guard vẫn xanh sau khi phá" >&2; return 1
    fi
    if ! grep -F -- "$2" "$probe/.out" >/dev/null; then
        echo "FAIL CASE $1: token '$2' vắng trong output đỏ:" >&2; cat "$probe/.out" >&2; return 1
    fi
}

case_clean() {
    fixture; green_control clean
    local n
    n="$(grep -c '^miễn trừ tối thiểu:' "$probe/.out" || true)"
    [ "$n" -eq 3 ] || { echo "FAIL CASE clean: cần 3 dòng miễn trừ tối thiểu có tên, thấy $n" >&2; return 1; }
    grep -F 'miễn trừ tối thiểu: NOTICE.md|' "$probe/.out" >/dev/null || { echo "FAIL CASE clean: thiếu dòng miễn trừ NOTICE" >&2; return 1; }
}
case_image-upstream() {
    fixture; green_control image-upstream
    replace_in "$probe/docker-compose.yml" "image: $IMAGE:latest" "image: ghcr.io/tong-io/tongflow:latest"
    # The FAIL phrasing only — "ảnh container" alone also appears in the green OK line.
    expect_red image-upstream "ảnh container — compose có image: ghcr.io/tong-io/tongflow:latest"
}
case_conf-remote-lech() {
    # The remote lives in the real repo, so the guard runs there with only the
    # conf swapped for a perturbed copy (one variable).
    fixture
    local out rc=0
    FORK_IDENTITY_CONF="$probe/scripts/fork/fork-identity.conf" bash "$GUARD" >"$probe/.out" 2>&1 || { echo "FAIL CASE conf-remote-lech: đối chứng dương (conf sao y) đỏ" >&2; cat "$probe/.out" >&2; return 1; }
    replace_in "$probe/scripts/fork/fork-identity.conf" "repo=$REPO_RAW" "repo=ai-do/kho-khac"
    FORK_IDENTITY_CONF="$probe/scripts/fork/fork-identity.conf" bash "$GUARD" >"$probe/.out" 2>&1 || rc=$?
    [ "$rc" -ne 0 ] || { echo "FAIL CASE conf-remote-lech: guard vẫn xanh" >&2; return 1; }
    # Both values must be in the message (AC-1): the remote path comes from git,
    # the same way the guard derives it — never pinned by hand.
    local remote_lc; remote_lc="$(git remote get-url origin | sed -E 's#^.*github\.com[:/]##; s#\.git$##; s#/$##' | tr '[:upper:]' '[:lower:]')"
    [ -n "$remote_lc" ] || { echo "FAIL CASE conf-remote-lech: không đọc được remote origin" >&2; return 1; }
    grep -F "conf lệch remote — conf=ai-do/kho-khac remote=$remote_lc" "$probe/.out" >/dev/null || { echo "FAIL CASE conf-remote-lech: token 'conf=ai-do/kho-khac remote=$remote_lc' vắng" >&2; cat "$probe/.out" >&2; return 1; }
}
case_readme-image-missing() {
    local r
    for r in "${READMES[@]}"; do
        fixture; green_control readme-image-missing
        replace_in "$probe/$r" "$IMAGE:latest" "$IMAGE:v0"
        expect_red readme-image-missing "$r thiếu chuỗi ảnh"
    done
}
case_compose-no-build() {
    fixture; green_control compose-no-build
    replace_in "$probe/docker-compose.yml" "    build: ." "    # build: ."
    expect_red compose-no-build "compose thiếu build:"
}
case_readme-no-build-cmd() {
    local r
    for r in "${READMES[@]}"; do
        fixture; green_control readme-no-build-cmd
        delete_line_with "$probe/$r" "docker compose up -d --build"
        expect_red readme-no-build-cmd "$r thiếu docker compose up -d --build"
    done
}
case_tag-trigger-back() {
    fixture; green_control tag-trigger-back
    insert_after_line "$probe/.github/workflows/desktop-release.yml" "on:" $'    push:\n        tags:\n            - "v*"'
    expect_red tag-trigger-back "desktop-release còn trigger tags"
}
case_prepare-if-gone() {
    fixture; green_control prepare-if-gone
    delete_line_with "$probe/.github/workflows/desktop-release.yml" "if: startsWith(github.ref, 'refs/tags/')"
    expect_red prepare-if-gone "desktop-release prepare thiếu if tags"
}
case_disarmed-header-gone() {
    fixture; green_control disarmed-header-gone
    replace_in "$probe/.github/workflows/desktop-release.yml" "DISARMED" "Disarmed"
    expect_red disarmed-header-gone "desktop-release thiếu header DISARMED"
}
case_claude-not-released-gone() {
    fixture; green_control claude-not-released-gone
    replace_in "$probe/CLAUDE.md" "Not currently released" "Not currently shipped"
    expect_red claude-not-released-gone "Release checklist thiếu Not currently released"
}
case_claude-builds-line-back() {
    fixture; green_control claude-builds-line-back
    append_line "$probe/CLAUDE.md" '- [ ] Tag the release; desktop-release.yml builds `OneFlow-mac-universal.dmg` into a draft GitHub Release.' >/dev/null
    expect_red claude-builds-line-back "Release checklist nói ngược hành vi"
}
case_discord-back() {
    fixture; green_control discord-back
    local n; n="$(append_line "$probe/CONTRIBUTING.md" 'Chat with us on https://discord.gg/K7V8az94Zf')"
    expect_red discord-back "định danh upstream ngoài miễn trừ — CONTRIBUTING.md:$n"
}
case_email-back() {
    fixture; green_control email-back
    local n; n="$(append_line "$probe/SECURITY.md" 'Or email security@tongflow.com')"
    expect_red email-back "định danh upstream ngoài miễn trừ — SECURITY.md:$n"
}
case_funding-back() {
    fixture; green_control funding-back
    printf 'custom: ["mailto:business@example.invalid"]\n' >"$probe/.github/FUNDING.yml"
    expect_red funding-back "FUNDING.yml còn đó"
}
case_clone-upstream() {
    fixture; green_control clone-upstream
    replace_in "$probe/CONTRIBUTING.md" "git clone https://github.com/phanlemanh/OneFlow.git" "git clone https://github.com/tong-io/tongflow.git"
    local n; n="$(grep -n 'git clone https://github.com/tong-io/tongflow.git' "$probe/CONTRIBUTING.md" | head -1 | cut -d: -f1)"
    expect_red clone-upstream "định danh upstream ngoài miễn trừ — CONTRIBUTING.md:$n"
}
case_issue-template-not-fork() {
    local t
    for t in "${TEMPLATES[@]}"; do
        fixture; green_control issue-template-not-fork
        python3 - "$probe/$t" <<'PY'
import sys,re; p=sys.argv[1]; s=open(p,encoding='utf-8').read()
t=re.sub(r'github\.com/phanlemanh/OneFlow','example.invalid/elsewhere',s,flags=re.I); assert t!=s; open(p,'w',encoding='utf-8').write(t)
PY
        expect_red issue-template-not-fork "$t không trỏ fork"
    done
}
case_badge-upstream() {
    fixture; green_control badge-upstream
    insert_after "$probe/docs/README_ZH.md" 'alt="License"' '    <a href="https://github.com/example/x/stargazers"><img src="https://img.shields.io/github/stars/example/x?style=flat" alt="GitHub Stars" /></a>'
    expect_red badge-upstream "badge stars/release còn ở docs/README_ZH.md"
}
case_release-badge-back() {
    fixture; green_control release-badge-back
    insert_after "$probe/README.md" 'alt="License"' '    <a href="https://github.com/phanlemanh/OneFlow/releases"><img src="https://img.shields.io/github/v/release/phanlemanh/OneFlow?logo=github" alt="Latest Release" /></a>'
    expect_red release-badge-back "badge stars/release còn ở README.md"
}
case_ci-badge-gone() {
    local r
    for r in "${READMES[@]}"; do
        fixture; green_control ci-badge-gone
        delete_line_with "$probe/$r" "ci.yml/badge.svg"
        expect_red ci-badge-gone "$r thiếu badge CI của fork"
    done
}
case_pypi-badge-wrong-dist() {
    fixture; green_control pypi-badge-wrong-dist
    replace_in "$probe/README.md" "shields.io/pypi/v/$DIST" "shields.io/pypi/v/some-other-dist"
    expect_red pypi-badge-wrong-dist "badge PyPI không trỏ $DIST ở README.md"
}
case_hit-outside() {
    fixture; green_control hit-outside
    local n; n="$(append_line "$probe/SECURITY.md" 'See https://github.com/tong-io/tongflow/issues for history.')"
    expect_red hit-outside "định danh upstream ngoài miễn trừ — SECURITY.md:$n"
}
case_class-matrix() {
    # One sample per regex pattern of the class, each dropped into SECURITY.md —
    # a healthy file with no exemption for any pattern — one at a time.
    local samples=(
        'https://github.com/tong-io/tongflow/issues'
        'ghcr.io/tong-io/tongflow:latest'
        'https://discord.gg/abc123'
        'security@tongflow.com'
        'https://pypi.org/project/tongflow/'
        'https://img.shields.io/github/stars/tong-io/tongflow'
        'TongFlow-mac-universal.dmg'
        'https://img.shields.io/pypi/v/tongflow'
    )
    local expected=8 hit=0 s n
    fixture; green_control class-matrix
    local declared; declared="$(sed -n 's/.*mẫu: \([0-9]*\).*/\1/p' "$probe/.out" | head -1)"
    [ "$declared" = "$expected" ] || { echo "FAIL CASE class-matrix: guard khai $declared mẫu, răng ghim $expected" >&2; return 1; }
    for s in "${samples[@]}"; do
        fixture
        n="$(append_line "$probe/SECURITY.md" "matrix probe: $s")"
        if expect_red class-matrix "định danh upstream ngoài miễn trừ — SECURITY.md:$n"; then hit=$((hit + 1)); fi
    done
    echo "class-matrix: $hit/$expected mẫu"
    [ "$hit" -eq "$expected" ]
}
case_stale-exemption() {
    fixture; green_control stale-exemption
    append_line "$probe/scripts/fork/fork-identity-allow.txt" 'README.md|business@tongflow\.com|thử' >/dev/null
    set +e
    FORK_IDENTITY_ROOT="$probe" FORK_IDENTITY_ALLOW="$probe/scripts/fork/fork-identity-allow.txt" bash "$GUARD" >"$probe/.out" 2>&1
    local rc=$?
    set -e
    [ "$rc" -ne 0 ] || { echo "FAIL CASE stale-exemption: guard vẫn xanh" >&2; return 1; }
    grep -F 'miễn trừ ôi — README.md|business@tongflow\.com' "$probe/.out" >/dev/null || { echo "FAIL CASE stale-exemption: token vắng" >&2; cat "$probe/.out" >&2; return 1; }
}
case_notice-dist-gone() {
    fixture; green_control notice-dist-gone
    replace_in "$probe/NOTICE.md" "$DIST" "some-other-dist"
    expect_red notice-dist-gone "NOTICE không nêu $DIST"
}
case_notice-unchanged-back() {
    fixture; green_control notice-unchanged-back
    append_line "$probe/NOTICE.md" 'The SDK is consumed unchanged from upstream.' >/dev/null
    expect_red notice-unchanged-back "NOTICE còn consumed unchanged from upstream"
}
case_notice-attribution-gone() {
    fixture; green_control notice-attribution-gone
    replace_in "$probe/NOTICE.md" "https://github.com/tong-io/tongflow" "https://example.invalid/upstream"
    expect_red notice-attribution-gone 'miễn trừ ôi — NOTICE.md|fork of \[TongFlow\]'
}
case_suite-key-dangling() {
    fixture
    SUITE_KEY_CONFIG="$probe/_acceptance/config.yaml" bash "$SUITE" fork_identity check-fork-identity.sh >"$probe/.out" 2>&1 || { echo "FAIL CASE suite-key-dangling: đối chứng dương đỏ" >&2; cat "$probe/.out" >&2; return 1; }
    replace_in "$probe/_acceptance/config.yaml" "    fork_identity: " "    fork_identity_renamed: "
    local rc=0
    SUITE_KEY_CONFIG="$probe/_acceptance/config.yaml" bash "$SUITE" fork_identity check-fork-identity.sh >"$probe/.out" 2>&1 || rc=$?
    [ "$rc" -ne 0 ] || { echo "FAIL CASE suite-key-dangling: vẫn xanh" >&2; return 1; }
    grep -F 'suite key fork_identity không trỏ executor nào' "$probe/.out" >/dev/null || { echo "FAIL CASE suite-key-dangling: token vắng" >&2; cat "$probe/.out" >&2; return 1; }
}
case_debt-table-missing() {
    fixture
    PROTOTYPE_LANE_OPP="$probe/_acceptance/$SLUG/opportunity.md" bash "$LANE" "$SLUG" >"$probe/.out" 2>&1 || { echo "FAIL CASE debt-table-missing: đối chứng dương đỏ" >&2; cat "$probe/.out" >&2; return 1; }
    delete_line_with "$probe/_acceptance/$SLUG/opportunity.md" '| `docs/README_JA.md` |'
    local rc=0
    PROTOTYPE_LANE_OPP="$probe/_acceptance/$SLUG/opportunity.md" bash "$LANE" "$SLUG" >"$probe/.out" 2>&1 || rc=$?
    [ "$rc" -ne 0 ] || { echo "FAIL CASE debt-table-missing: vẫn xanh" >&2; return 1; }
    grep -F 'thiếu hàng nợ cho docs/README_JA.md' "$probe/.out" >/dev/null || { echo "FAIL CASE debt-table-missing: token vắng" >&2; cat "$probe/.out" >&2; return 1; }
}

run_one() {
    local name="$1"
    if "case_$name"; then
        echo "CASE $name: PASS"
        cleanup; probe=""
        return 0
    fi
    cleanup; probe=""
    return 1
}

if [ "${1:-}" = "--selftest-fail" ]; then
    echo "FAIL selftest: đường đỏ của răng in ra được"; exit 1
fi
if [ "${1:-}" = "--case" ]; then
    name="${2:-}"
    found=0; for c in "${CASES[@]}"; do [ "$c" = "$name" ] && found=1; done
    [ "$found" -eq 1 ] || { echo "ca lạ: ${name:-<trống>}" >&2; exit 2; }
    run_one "$name" || exit 1
    exit 0
fi
[ $# -eq 0 ] || { echo "usage: check-fork-identity-teeth.sh [--case <name>] [--selftest-fail]" >&2; exit 2; }

pass=0
for c in "${CASES[@]}"; do
    if run_one "$c"; then pass=$((pass + 1)); fi
done
echo "PASS: $pass/${#CASES[@]} ca"
[ "$pass" -eq "${#CASES[@]}" ]
