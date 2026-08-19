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
if ! echo "$body" | grep -q '"version"'; then
    echo "FAIL: PyPI trả về nội dung không đọc được"
    exit 1
fi

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
