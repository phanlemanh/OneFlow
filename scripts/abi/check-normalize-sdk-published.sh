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

# Read by the ONE library that owns it (scripts/lib/sdk-version.sh), which
# validates the shape and prints its own diagnostic; a local sed here reported
# only "could not read a version" for a differently formatted line.
. "$ROOT/scripts/lib/sdk-version.sh"
version="$(sdk_version)"
[ -n "$version" ] || { echo "FAIL: could not read a version from sdk/pyproject.toml"; exit 1; }

url="https://pypi.org/pypi/oneflow-sdk/$version/json"
if ! body="$(curl -fsS --max-time "$TIMEOUT" "$url" 2>/dev/null)"; then
    echo "CHƯA PUBLISH: PyPI không có oneflow-sdk==$version."
    echo "  Đây là đỏ HẠ TẦNG, không phải trượt tiêu chí: publish là hành vi không"
    echo "  đảo ngược và đang chờ chữ ký ở Cổng 2 (xem mục Tiền đề của hợp đồng)."
    echo "  Trình tự đúng: Cổng 2 ký → pnpm sdk:publish → chạy lại phép đo này."
    exit 1
fi

echo "OK: PyPI has oneflow-sdk==$version"

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
python3 - "$tmp" <<'PY' || { echo "FAIL: the probe self-check could not build its fixtures"; exit 1; }
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
    { echo "FAIL: probe went red on the HEALTHY fake wheel — the green half of the pair is broken"; exit 1; }
bad_out="$(python3 "$tmp/probe.py" "$tmp/selftest-bad.whl" "https://selftest/pkg.whl" 2>&1)" &&
    { echo "FAIL: probe stayed green on the MISSING-FILE fake wheel — the red half of the pair is broken"; exit 1; }
echo "$bad_out" | grep -q "tongflow/text/normalize_vi.py" ||
    { echo "FAIL: the red half does not name the missing path: $bad_out"; exit 1; }
echo "OK: the probe passes its own two-way self-check (red names the missing path)"

pkg_url="$(echo "$body" | python3 -c '
import json, sys
urls = json.load(sys.stdin).get("urls", [])
wheels = [u for u in urls if u.get("packagetype") == "bdist_wheel"]
pick = (wheels or urls)
print(pick[0]["url"] if pick else "")
')"
if [ -z "$pkg_url" ]; then
    echo "FAIL: PyPI lists no artifact files for $version"
    exit 1
fi
curl -fsS --max-time "$TIMEOUT" -o "$tmp/pkg" "$pkg_url" || {
    echo "FAIL: could not download artifact $pkg_url"
    exit 1
}
python3 "$tmp/probe.py" "$tmp/pkg" "$pkg_url" || exit 1

pin_file="$ROOT/plugins/$PLUGIN_ID/requirements.txt"
if [ -f "$pin_file" ]; then
    if grep -q "oneflow-sdk==$version" "$pin_file"; then
        echo "OK: the plugin shell pins oneflow-sdk==$version"
    else
        echo "FAIL: the plugin shell pins the wrong version:"
        grep -n "oneflow-sdk" "$pin_file" || echo "  (không thấy dòng pin nào)"
        exit 1
    fi
else
    echo "FAIL: no plugin tree to check the pin against ($pin_file)"
    exit 1
fi

echo "OK: the release train is in sync for $version"
