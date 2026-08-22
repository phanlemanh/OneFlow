#!/usr/bin/env bash
# E18 — the MEASURING INSTRUMENTS must refuse when they cannot measure.
#
# Every expensive defect in this feature had the same shape: an instrument that
# produced a clean-looking result while measuring nothing. A capture written in
# the fallback locale, a shared executor whose version pin silently resolved to
# the empty string. Both were found by a human reading the code, because
# nothing anywhere went red. This script is the red.
#
# Two claims, both about refusal:
#   1. ui-capture REFUSES to write, and removes any stale frame, when the page
#      renders in a locale other than the one --lang asked for — even if the
#      --require string is present (a product name is locale-independent).
#   2. the shared sdk_pytest executor fails with ONE legible line when the
#      vietnormalizer pin cannot be derived from sdk/pyproject.toml, instead of
#      passing an empty --with that swallows the next argument.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
tmp="$(mktemp -d)"
port=8${RANDOM:0:3}
server_pid=""
cleanup() {
    if [ -n "$server_pid" ]; then
        kill "$server_pid" 2>/dev/null || true
        # ...and reap it, so the shell does not print a job-control notice on
        # stderr after the OK line. Evidence output must be exactly what the
        # script chose to say.
        wait "$server_pid" 2>/dev/null || true
    fi
    rm -rf "$tmp"
}
trap cleanup EXIT

fail() { echo "FAIL: $*"; exit 1; }

# ---------------------------------------------------------------- claim 1 ---
mkdir -p "$tmp/pages"
printf '<!doctype html><html lang="vi"><body><h1>OneFlow</h1></body></html>' > "$tmp/pages/vi.html"
printf '<!doctype html><html lang="en"><body><h1>OneFlow</h1></body></html>' > "$tmp/pages/en.html"
( cd "$tmp/pages" && python3 -m http.server "$port" >/dev/null 2>&1 ) &
server_pid=$!
for _ in $(seq 1 30); do
    curl -sf "http://localhost:$port/vi.html" >/dev/null 2>&1 && break
    sleep 0.2
done
curl -sf "http://localhost:$port/vi.html" >/dev/null 2>&1 || fail "không dựng được máy chủ tĩnh cho phép đo"

shot="$tmp/shot.png"
capture() {
    node scripts/ui-capture.mjs --url "http://localhost:$port/$1" --out "$shot" \
        --lang vi --require 'OneFlow' 2>&1 || true
}

rm -f "$shot"
capture vi.html >/dev/null
[ -f "$shot" ] || fail "trang đúng ngôn ngữ mà lượt chụp không ghi ảnh — phép đo tự chặn mình"

# The stale frame from the good run is deliberately left in place: refusing to
# write is not enough if the previous frame survives to be filed as evidence.
out="$(capture en.html)"
grep -q 'REFUSED' <<<"$out" \
    || fail "trang sai ngôn ngữ (lang=en, --lang vi) KHÔNG bị từ chối: $out"
[ -f "$shot" ] \
    && fail "đã từ chối nhưng ảnh cũ còn nguyên — lượt sau sẽ nộp nó làm bằng chứng"

# ---------------------------------------------------------------- claim 2 ---
# CLASS, not case. Thirteen executor keys derive the same pin; the finding
# named one, and patching only that one is the exact mistake this feature made
# twice already with the range-unit list.
#
# The first version of this check asserted "no line uses the inline form" plus
# "at least one line uses the guarded form" — a point case wearing a class
# claim, since twelve keys could be unguarded in some OTHER spelling and it
# would still pass (S4 round 6 finding). It now walks EVERY executor line that
# names the engine and requires the guard on each one, and reports the count it
# actually checked so a silent drop to zero lines cannot read as success.
engine_lines="$(grep -n 'vietnormalizer' _acceptance/config.yaml \
    | grep -vE '^[0-9]+: *#' \
    | grep -E 'uv run|--with' || true)"
checked=0
while IFS= read -r line; do
    [ -z "$line" ] && continue
    checked=$((checked + 1))
    case "$line" in
        *'${pin:?'*) ;;
        *) fail "khoá executor suy pin KHÔNG có mỏ neo:
$line" ;;
    esac
done <<<"$engine_lines"

[ "$checked" -ge 10 ] || fail \
    "chỉ soi được $checked khoá executor nhắc engine — phép đo mất đối tượng,
không phải cấu hình đã sạch (đo được 12 khoá ngày 22/08)"
echo "  (đã soi $checked khoá executor, mỗi khoá phải có mỏ neo \${pin:?…})"

# The derivation is read out of the real config, not retyped here: a copy would
# keep passing on the day the shared key changes.
derivation="$(node -e '
const fs = require("fs");
const line = fs.readFileSync("_acceptance/config.yaml", "utf8")
    .split("\n").find(l => l.trimStart().startsWith("sdk_pytest:"));
if (!line) { console.error("khong thay khoa sdk_pytest trong _acceptance/config.yaml"); process.exit(1) }
// A YAML double-quoted scalar processes its own backslash escapes, so the
// raw line holds "\\." where the command holds "\.". Slicing the quotes off
// without undoing that leaves an ERE that matches a literal backslash and
// the pin resolves empty — the script would then fail on the real tree and
// blame the config (measured while writing this).
const cmd = line.slice(line.indexOf(":") + 1).trim()
    .replace(/^"|"$/g, "")
    .replace(/\\(.)/g, (_, c) => c);
// Bounded by the literal markers, not by counting brackets: the pin
// derivation contains its own parentheses (a regex character class group),
// so a lazy match on ")" cuts the command in half and produces a broken
// shell line that fails for the wrong reason.
const open = cmd.indexOf("pin=$(");
const close = cmd.indexOf(") && PYTHONPATH");
const g = cmd.match(/\$\{pin:\?[^}]*\}/);
if (open < 0 || close < 0 || !g) { console.error("khoa sdk_pytest khong con suy pin ra bien co kiem tra: " + cmd); process.exit(1) }
const derive = cmd.slice(open, close + 1);
process.stdout.write(derive + " ; : \"" + g[0] + "\"");
')"

mkdir -p "$tmp/nopin"
grep -v 'vietnormalizer' sdk/pyproject.toml > "$tmp/nopin/pyproject.toml"
set +e
msg="$( cd "$tmp/nopin" && bash -c "$derivation" 2>&1 )"
code=$?
set -e
[ "$code" -eq 0 ] && fail "gỡ hẳn dòng pin mà phép suy vẫn thành công — --with sẽ nuốt tham số kế tiếp"
grep -qi 'pin' <<<"$msg" \
    || fail "báo lỗi không nhắc tới pin nên người đọc không lần ra nguyên nhân: $msg"

# ...and it must still succeed on the real tree.
set +e
( cd sdk && bash -c "$derivation" ) >/dev/null 2>&1
ok=$?
set -e
[ "$ok" -eq 0 ] || fail "phép suy pin thất bại trên cây thật — phép đo này sẽ chặn oan mọi tính năng"

echo "OK: lượt chụp từ chối sai ngôn ngữ và xoá khung cũ · executor dùng chung báo lỗi pin đọc được"
