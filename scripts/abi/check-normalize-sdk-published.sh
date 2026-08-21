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
python3 - "$tmp/pkg" "$pkg_url" <<'PY' || exit 1
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
