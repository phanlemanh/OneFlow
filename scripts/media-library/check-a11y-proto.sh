#!/usr/bin/env bash
# E24 — eight states x two themes = sixteen pages.
#
# Reaching only SOME pages must not read as clean: a11y-scan exits 3 when it can
# reach nothing at all, but a run that reached four of sixteen would still exit
# 0 with an empty violation list. So the page COUNT is asserted here, after the
# scan, against the scan's own report.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# Next rewrites tsconfig.json's `include` to point at whichever dist dir is
# live, so a run with NEXT_DIST_DIR leaves the tree dirty and `pnpm lint:check`
# red for a reason that has nothing to do with the feature. Restore it on the
# way out, however this script exits.
restore_tsconfig() { git -C "$ROOT" checkout -- tsconfig.json 2>/dev/null || true; }
trap restore_tsconfig EXIT

BASE="${BASE_URL:-http://localhost:3000}"
REPORT="${REPORT_PATH:-/tmp/aml-a11y.json}"
STATES=(missing-config idle searching results thin-shelf unranked importing error)

URLS=()
for state in "${STATES[@]}"; do
    URLS+=("$BASE/proto/add-media-library?state=$state")
    URLS+=("$BASE/proto/add-media-library?state=$state&theme=dark")
done

if [ "${#URLS[@]}" -ne 16 ]; then
    echo "FAIL: built ${#URLS[@]} urls, expected 16 (eight states x two themes)"
    exit 2
fi

node scripts/a11y-scan.mjs "${URLS[@]}" --fail-on critical,serious --json "$REPORT"

node -e '
const report = require(process.argv[1]);
const scanned = Array.isArray(report.pages) ? report.pages.length : 0;
if (scanned !== 16) {
    console.error(`FAIL: scanned ${scanned}/16 pages — a partial sweep is not a clean one`);
    process.exit(3);
}
console.log("16/16 pages scanned (eight states x light+dark)");
' "$REPORT"
