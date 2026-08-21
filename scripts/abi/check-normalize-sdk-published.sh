#!/usr/bin/env bash
# E14b (normalize-text-vi AC-13) — ONLINE half of the release train.
#
# Only meaningful AFTER the owner has approved publishing: publishing to PyPI is
# irreversible, so it waits for Gate 2. Running this before that point is
# EXPECTED to fail, and the message says so in as many words — an infrastructure
# red, not a rejected criterion. Distinguishing those two is the whole reason
# this is a separate script from the offline half.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLUGIN_ID="oneflow-api-normalize-text-vi"
TIMEOUT="${NORMALIZE_PYPI_TIMEOUT:-20}"

version="$(sed -n 's/^version = "\(.*\)"$/\1/p' "$ROOT/sdk/pyproject.toml" | head -1)"
[ -n "$version" ] || { echo "FAIL: không đọc được phiên bản từ sdk/pyproject.toml"; exit 1; }

url="https://pypi.org/pypi/oneflow-sdk/$version/json"
if ! body="$(curl -fsS --max-time "$TIMEOUT" "$url" 2>/dev/null)"; then
    echo "CHƯA PUBLISH: PyPI không có oneflow-sdk==$version."
    echo "  Đây là đỏ HẠ TẦNG, không phải trượt tiêu chí: publish là hành vi không"
    echo "  đảo ngược và đang chờ chữ ký ở Cổng 2 (xem mục Tiền đề của hợp đồng)."
    echo "  Trình tự đúng: Cổng 2 ký → pnpm sdk:publish → chạy lại phép đo này."
    exit 1
fi

echo "OK: PyPI có oneflow-sdk==$version"

# The published artifact must actually carry the new types — a version number on
# PyPI proves an upload happened, not that the upload contained this feature.
# So download the artifact and look inside it. (The first version of this check
# grepped the PyPI JSON for the string '"version"', which that JSON always
# contains — a branch that can never fail verifies nothing; S4 round 1 finding.)
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/probe.py" <<'PY'
import sys, tarfile, zipfile

path, url = sys.argv[1], sys.argv[2]
# Handles stay open for the whole (short-lived) process: a `with` block here
# closed the archive before the deferred read ran — caught by this check's own
# two-way pair before it ever shipped.
if url.endswith(".whl"):
    archive = zipfile.ZipFile(path)
    names = archive.namelist()

    def read(n: str) -> str:
        return archive.read(n).decode("utf-8", "replace")
else:
    archive = tarfile.open(path, "r:*")
    names = archive.getnames()

    def read(n: str) -> str:
        member = archive.extractfile(n)
        assert member is not None
        return member.read().decode("utf-8", "replace")

def find(suffix):
    hits = [n for n in names if n.endswith(suffix)]
    if not hits:
        print(f"FAIL: artifact không chứa {suffix}")
        sys.exit(1)
    return hits[0]

find("tongflow/text/normalize_vi.py")
find("tongflow/models/normalize_text_vi.py")
slots = read(find("tongflow/node_slots.py"))
if "NORMALIZE_TEXT_VI" not in slots:
    print("FAIL: node_slots.py trong artifact không có NORMALIZE_TEXT_VI")
    sys.exit(1)
print("OK: artifact mang tongflow/text/, models mới và NORMALIZE_TEXT_VI")
PY

# Two-way pair, EXECUTED every run — not narrated: build one healthy and one
# gutted fake wheel and require the probe to pass/fail accordingly, with the
# failure naming the missing path. The pair used to exist only as prose in the
# eval's `expected` after a one-off manual run (S4 round 2 finding) — the very
# pattern this script family mocks: prose is not executed.
python3 - "$tmp" <<'PY' || { echo "FAIL: tự kiểm hai chiều của probe không dựng được fixture"; exit 1; }
import sys, zipfile
tmp = sys.argv[1]
with zipfile.ZipFile(f"{tmp}/selftest-good.whl", "w") as z:
    z.writestr("tongflow/text/normalize_vi.py", "x")
    z.writestr("tongflow/models/normalize_text_vi.py", "x")
    z.writestr("tongflow/node_slots.py", "NORMALIZE_TEXT_VI = 'normalize-text-vi'")
with zipfile.ZipFile(f"{tmp}/selftest-bad.whl", "w") as z:
    z.writestr("tongflow/node_slots.py", "GEN_TEXT = 'gen-text'")
PY
python3 "$tmp/probe.py" "$tmp/selftest-good.whl" "https://selftest/pkg.whl" >/dev/null ||
    { echo "FAIL: probe đỏ trên wheel giả LÀNH — nửa xanh của cặp hai chiều gãy"; exit 1; }
bad_out="$(python3 "$tmp/probe.py" "$tmp/selftest-bad.whl" "https://selftest/pkg.whl" 2>&1)" &&
    { echo "FAIL: probe xanh trên wheel giả THIẾU FILE — nửa đỏ của cặp hai chiều gãy"; exit 1; }
echo "$bad_out" | grep -q "tongflow/text/normalize_vi.py" ||
    { echo "FAIL: nửa đỏ không nêu đúng đường dẫn thiếu: $bad_out"; exit 1; }
echo "OK: cặp hai chiều của probe tự chạy xanh (đỏ nêu đúng đường dẫn thiếu)"

pkg_url="$(echo "$body" | python3 -c '
import json, sys
urls = json.load(sys.stdin).get("urls", [])
wheels = [u for u in urls if u.get("packagetype") == "bdist_wheel"]
pick = (wheels or urls)
print(pick[0]["url"] if pick else "")
')"
if [ -z "$pkg_url" ]; then
    echo "FAIL: PyPI không liệt kê file artifact nào cho $version"
    exit 1
fi
curl -fsS --max-time "$TIMEOUT" -o "$tmp/pkg" "$pkg_url" || {
    echo "FAIL: không tải được artifact $pkg_url"
    exit 1
}
python3 "$tmp/probe.py" "$tmp/pkg" "$pkg_url" || exit 1

pin_file="$ROOT/plugins/$PLUGIN_ID/requirements.txt"
if [ -f "$pin_file" ]; then
    if grep -q "oneflow-sdk==$version" "$pin_file"; then
        echo "OK: vỏ plugin pin oneflow-sdk==$version"
    else
        echo "FAIL: vỏ plugin pin sai phiên bản:"
        grep -n "oneflow-sdk" "$pin_file" || echo "  (không thấy dòng pin nào)"
        exit 1
    fi
else
    echo "FAIL: chưa có cây plugin để kiểm pin ($pin_file)"
    exit 1
fi

echo "OK: chuyến phát hành đồng bộ cho $version"
