#!/usr/bin/env bash
# mo-hoa-b01 — the install path in the READMEs and compose must keep pointing at
# THIS fork's image and repo, and every remaining mention of upstream identity
# must be one the allow-list names (attribution, the disarmed desktop workflow).
#
# Two halves:
#   1. A CLASS scan: the upstream-identity regex class is run over a declared
#      file set; every hit must match an allow-list line for that file, and
#      every allow-list line must still match something (two-way ratchet).
#      A universal negative ("no upstream identity anywhere") cannot be proven
#      by a list of banned strings — only by scanning the shape over a declared
#      scope and listing what IS permitted (measure-birth §4).
#   2. Positive assertions, one named OK/FAIL line each: image name, compose
#      build, desktop-release disarmed, release checklist, community files,
#      badges, NOTICE, and the conf ↔ git-remote relation.
#
# Exit 0 clean · 1 any FAIL · 2 cannot conclude (missing file, unreadable conf).
# grep is never used with -q inside a pipeline: -q closes the pipe early and under
# pipefail a real match reads as no match (see scripts/ci/check-ghcr-untouched.sh).
set -euo pipefail

ROOT="${FORK_IDENTITY_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$ROOT"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF="${FORK_IDENTITY_CONF:-scripts/fork/fork-identity.conf}"
ALLOW="${FORK_IDENTITY_ALLOW:-scripts/fork/fork-identity-allow.txt}"
[ -f "$CONF" ] || CONF="$HERE/fork-identity.conf"
[ -f "$ALLOW" ] || ALLOW="$HERE/fork-identity-allow.txt"

READMES=(README.md docs/README_ZH.md docs/README_JA.md)
TEMPLATES=(.github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/config.yml .github/ISSUE_TEMPLATE/feature_request.yml)
FILES=("${READMES[@]}" docker-compose.yml CONTRIBUTING.md SECURITY.md NOTICE.md CLAUDE.md "${TEMPLATES[@]}" .github/workflows/desktop-release.yml)
DESKTOP=.github/workflows/desktop-release.yml
PYPROJECT=sdk/pyproject.toml

# The upstream-identity class. `tongflow([^-a-z0-9]|$)` deliberately excludes the
# plugin repositories `tong-io/tongflow-<name>`, which ADR-0008 keeps as legacy.
PATTERNS=(
    'github\.com/tong-io/tongflow([^-a-z0-9]|$)'
    'ghcr\.io/tong-io'
    'discord\.gg'
    'tongflow\.com'
    'pypi\.org/project/tongflow/'
    'shields\.io/[^ )"]*tong-io'
    'TongFlow-(mac|win)'
    'img\.shields\.io/pypi/v/tongflow'
)

fails=0
ok()   { echo "OK: $*"; }
fail() { echo "FAIL: $*"; fails=$((fails + 1)); }
die()  { echo "FAIL: $* — không kết luận" >&2; exit 2; }

for f in "${FILES[@]}" "$PYPROJECT"; do
    [ -f "$f" ] || die "thiếu $f"
done
[ -f "$CONF" ] || die "thiếu $CONF"
[ -f "$ALLOW" ] || die "thiếu $ALLOW"

# ── identity from conf, cross-checked with the remote ────────────────────────
REPO="$(sed -n 's/^repo=[[:space:]]*//p' "$CONF" | head -1 | tr -d '[:space:]')"
[ -n "$REPO" ] || die "$CONF không có dòng repo="
REPO_LC="$(printf '%s' "$REPO" | tr '[:upper:]' '[:lower:]')"
IMAGE="ghcr.io/$REPO_LC"
DIST="$(sed -n 's/^name[[:space:]]*=[[:space:]]*"\([^"]*\)".*/\1/p' "$PYPROJECT" | head -1)"
[ -n "$DIST" ] || die "$PYPROJECT không có [project] name"
echo "định danh: repo=$REPO image=$IMAGE dist=$DIST mẫu: ${#PATTERNS[@]}"

remote_url="$(git -C "$ROOT" remote get-url origin 2>/dev/null || true)"
if [ -n "$remote_url" ]; then
    remote_path="$(printf '%s' "$remote_url" | sed -E 's#^.*github\.com[:/]##; s#\.git$##; s#/$##' | tr '[:upper:]' '[:lower:]')"
    if [ "$remote_path" = "$REPO_LC" ]; then
        ok "conf khớp remote ($REPO)"
    else
        fail "conf lệch remote — conf=$REPO remote=$remote_path"
    fi
else
    echo "NOTE: không có remote origin ở $ROOT — bỏ phép so conf ↔ remote"
fi

# ── class scan with allow-list ratchet ───────────────────────────────────────
# allow entries: file|regex|reason
allow_files=(); allow_regex=(); allow_hits=()
while IFS= read -r line; do
    case "$line" in ''|\#*) continue ;; esac
    # file|regex|reason — the regex itself may contain `|`, so split on the
    # FIRST separator for the file and the LAST one for the reason.
    allow_files+=("${line%%|*}")
    rest="${line#*|}"
    allow_regex+=("${rest%|*}")
    allow_hits+=(0)
done <"$ALLOW"

outside=0
exempt=0
for f in "${FILES[@]}"; do
    for pat in "${PATTERNS[@]}"; do
        hits="$(grep -nE -- "$pat" "$f" || true)"
        [ -n "$hits" ] || continue
        while IFS= read -r h; do
            lineno="${h%%:*}"
            text="${h#*:}"
            matched=0
            for i in "${!allow_files[@]}"; do
                [ "${allow_files[$i]}" = "$f" ] || continue
                if printf '%s\n' "$text" | grep -E -- "${allow_regex[$i]}" >/dev/null; then
                    matched=1
                    allow_hits[$i]=$((allow_hits[$i] + 1))
                fi
            done
            if [ "$matched" -eq 1 ]; then
                exempt=$((exempt + 1))
            else
                outside=$((outside + 1))
                fail "định danh upstream ngoài miễn trừ — $f:$lineno: $(printf '%s' "$text" | sed 's/^[[:space:]]*//' | cut -c1-100)"
            fi
        done <<<"$hits"
    done
done
[ "$outside" -eq 0 ] && ok "không hit nào ngoài miễn trừ ($exempt hit đã miễn trừ)"

for i in "${!allow_files[@]}"; do
    if [ "${allow_hits[$i]}" -eq 0 ]; then
        fail "miễn trừ ôi — ${allow_files[$i]}|${allow_regex[$i]}"
    fi
done

# Minimum exemptions that must exist BY NAME: attribution and the disarmed
# workflow. A count alone cannot tell "attribution kept" from "attribution
# deleted and something else exempted" (gap-probe 05/09 P1).
MIN_EXEMPT=(
    'NOTICE.md|fork of \[TongFlow\]\(https://github\.com/tong-io/tongflow\)'
    '.github/workflows/desktop-release.yml|app\.tongflow\.com'
    '.github/workflows/desktop-release.yml|TongFlow-(mac|win)'
)
for m in "${MIN_EXEMPT[@]}"; do
    found=0
    for i in "${!allow_files[@]}"; do
        [ "${allow_files[$i]}|${allow_regex[$i]}" = "$m" ] && found=1
    done
    if [ "$found" -eq 1 ]; then
        echo "miễn trừ tối thiểu: $m"
    else
        fail "miễn trừ tối thiểu vắng — $m"
    fi
done
if grep -E -- 'github\.com/tong-io/tongflow([^-a-z0-9]|$)' NOTICE.md >/dev/null; then
    ok "ghi công upstream còn ở NOTICE.md"
else
    fail "ghi công upstream mất khỏi NOTICE.md"
fi

# ── positive assertions ───────────────────────────────────────────────────────
# Image name: compose must name exactly this fork's image, and must carry an
# uncommented build: so the stack comes up before the first tag publishes it.
compose_image="$(sed -n 's/^[[:space:]]*image:[[:space:]]*//p' docker-compose.yml | head -1)"
if [ "$compose_image" = "$IMAGE:latest" ]; then
    ok "ảnh container của compose là $IMAGE:latest"
else
    fail "ảnh container — compose có image: ${compose_image:-<trống>} thay vì $IMAGE:latest"
fi
if grep -E '^[[:space:]]*build:[[:space:]]*\.' docker-compose.yml >/dev/null; then
    ok "compose có build: ."
else
    fail "compose thiếu build: — docker compose up -d --build không dựng được trước tag đầu tiên"
fi
for r in "${READMES[@]}"; do
    if grep -F -- "$IMAGE:latest" "$r" >/dev/null; then
        ok "$r có chuỗi ảnh $IMAGE:latest"
    else
        fail "$r thiếu chuỗi ảnh $IMAGE:latest trong lệnh docker run"
    fi
    if grep -F -- 'docker compose up -d --build' "$r" >/dev/null; then
        ok "$r có docker compose up -d --build"
    else
        fail "$r thiếu docker compose up -d --build"
    fi
done

# Desktop release: no tag trigger, release job gated on a tag ref, header disarmed.
on_block="$(awk '/^on:/{f=1;next} f&&/^[^[:space:]]/{f=0} f' "$DESKTOP")"
if printf '%s\n' "$on_block" | grep -E '^[[:space:]]*tags:' >/dev/null; then
    fail "desktop-release còn trigger tags — gắn tag lại cắt bộ cài thương hiệu upstream"
else
    ok "desktop-release không có trigger tags"
fi
prepare_block="$(awk '/^[[:space:]]*prepare:/{f=1;next} f&&/^[[:space:]]{4}[a-z-]+:/{f=0} f' "$DESKTOP")"
if printf '%s\n' "$prepare_block" | grep -F "if: startsWith(github.ref, 'refs/tags/')" >/dev/null; then
    ok "desktop-release prepare có if tags"
else
    fail "desktop-release prepare thiếu if tags — workflow_dispatch sẽ tạo release"
fi
if head -30 "$DESKTOP" | grep -F 'DISARMED' >/dev/null; then
    ok "desktop-release có header DISARMED"
else
    fail "desktop-release thiếu header DISARMED"
fi

# Release checklist in CLAUDE.md must match the disarmed behaviour.
if grep -F 'Not currently released' CLAUDE.md >/dev/null; then
    ok "Release checklist có Not currently released"
else
    fail "Release checklist thiếu Not currently released"
fi
if grep -E 'builds `OneFlow-mac-universal\.dmg`' CLAUDE.md >/dev/null; then
    fail "Release checklist nói ngược hành vi — vẫn ghi tag builds OneFlow-mac-universal.dmg"
else
    ok "Release checklist không còn câu tag builds installers"
fi

# Community and support files.
if [ -e .github/FUNDING.yml ]; then
    fail "FUNDING.yml còn đó — nút Sponsor trỏ về upstream"
else
    ok "FUNDING.yml vắng"
fi
for t in "${TEMPLATES[@]}"; do
    if grep -iF "github.com/$REPO_LC" "$t" >/dev/null; then
        ok "$t trỏ fork"
    else
        fail "$t không trỏ fork ($REPO)"
    fi
done
if grep -iF "github.com/$REPO_LC" CONTRIBUTING.md >/dev/null; then
    ok "CONTRIBUTING.md trỏ fork"
else
    fail "CONTRIBUTING.md không trỏ fork ($REPO)"
fi

# Badges: CI badge of the fork and PyPI badge of the fork's distribution; no
# stars / release badges (those advertise upstream's numbers).
for r in "${READMES[@]}"; do
    if grep -iF "$REPO_LC/actions/workflows/ci.yml/badge.svg" "$r" >/dev/null; then
        ok "$r có badge CI của fork"
    else
        fail "$r thiếu badge CI của fork"
    fi
    if grep -F "shields.io/pypi/v/$DIST" "$r" >/dev/null; then
        ok "$r có badge PyPI $DIST"
    else
        fail "badge PyPI không trỏ $DIST ở $r"
    fi
    if grep -E 'shields\.io/github/(stars|v/release)' "$r" >/dev/null; then
        fail "badge stars/release còn ở $r"
    else
        ok "$r không có badge stars/release"
    fi
done

# NOTICE tells the truth about the SDK.
if grep -F -- "$DIST" NOTICE.md >/dev/null; then
    ok "NOTICE nêu $DIST"
else
    fail "NOTICE không nêu $DIST"
fi
# The upstream sentence was "consumed unchanged from upstream"; the fork's NOTICE
# negates it ("modified, not consumed unchanged"), so match the full false claim.
if grep -F 'consumed unchanged from upstream' NOTICE.md >/dev/null; then
    fail "NOTICE còn consumed unchanged from upstream — SDK đã bị sửa và phát hành dưới tên $DIST"
else
    ok "NOTICE không còn câu consumed unchanged from upstream"
fi

if [ "$fails" -gt 0 ]; then
    echo "FAIL: $fails phép kiểm hỏng"
    exit 1
fi
echo "PASS: định danh fork nguyên vẹn"
