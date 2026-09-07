#!/usr/bin/env bash
# Run ONE named case of the key-store suite, and refuse a run that matched none.
#
# Why this wrapper exists, measured 2026-08-31 during this feature's own verify:
# `pnpm vitest run <file> -t 'run path'` matched no case and exited 0, printing
# "Tests  26 skipped (26)". Two evals therefore reported PASS while measuring
# nothing at all — a filter typo, or a criterion whose test was never written,
# both read as green forever. That is the same fail-open class this feature
# exists to close, sitting in the measurement layer instead of the product.
#
# So: a run that passes at least one case and fails none is a pass. Anything
# else — zero matched, any failure, vitest itself erroring — is not.
#
# Usage: run-one-test.sh '<test name fragment>' [more vitest args...]
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

NAME="${1:?usage: run-one-test.sh '<test name fragment>'}"
shift || true
FILE=src/lib/settings/env-store.server.test.ts

out=$(pnpm vitest run "$FILE" -t "$NAME" "$@" 2>&1) || {
    printf '%s\n' "$out"
    echo "FAIL: vitest thoát khác 0 cho ca \`$NAME\`" >&2
    exit 1
}
printf '%s\n' "$out"

if ! grep -qE 'Tests +[0-9]+ passed' <<<"$out"; then
    echo "FAIL: không ca nào KHỚP \`$NAME\` — lệnh đo này chạy 0 ca và vẫn thoát 0." >&2
    echo "      Ca đo chưa được viết, hoặc tên trong _acceptance/config.yaml gõ sai." >&2
    exit 2
fi
if grep -qE 'Tests +[0-9]+ failed' <<<"$out"; then
    echo "FAIL: có ca đỏ trong lượt chạy \`$NAME\`" >&2
    exit 1
fi
