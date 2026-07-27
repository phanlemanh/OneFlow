#!/usr/bin/env bash
# E7 / AC-6: this change is a capability, not a migration. The shipped manifest
# must still be 38 plain string entries under the upstream org — the mechanism
# lands here, the first actual fork is a separate decision.
set -euo pipefail

manifest=config/official-plugins.json
expected_org='https://github.com/tong-io'
expected_count=38

read -r org total strings <<EOF
$(node -e '
const m = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const strings = m.plugins.filter((e) => typeof e === "string").length;
process.stdout.write(`${m.org} ${m.plugins.length} ${strings}`);
' "$manifest")
EOF

if [ "$org" != "$expected_org" ]; then
    echo "FAIL: default org is '${org}', expected '${expected_org}'"
    exit 1
fi

if [ "$total" != "$expected_count" ] || [ "$strings" != "$expected_count" ]; then
    echo "FAIL: expected ${expected_count} plain string entries, got ${strings} string(s) of ${total} total"
    exit 1
fi

echo "OK: ${expected_count} plain string entries, default org unchanged"
