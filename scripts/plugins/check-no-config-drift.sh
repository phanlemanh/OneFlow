#!/usr/bin/env bash
# AC-6: widening the prefix must not carry anything else with it.
#
# The manifest is the thing most tempting to "fix" while here — repointing `org`
# or renaming ids would look like part of the same job, and it is not: those
# repos are upstream and the org is undecided. So the paths that would carry
# such a change are asserted untouched.
#
# Every failure mode exits non-zero on purpose; a guard that can announce clean
# without looking is worse than no guard (see scripts/deps/check-no-t3-drift.sh).
set -euo pipefail

BASE="${1:-origin/main}"
PATHS=(config src/lib/plugins/plugins-registry-schema.ts src/lib/plugins/plugins-registry.server.ts src/db)

if ! git rev-parse --verify --quiet "${BASE}^{commit}" >/dev/null; then
    echo "cannot resolve base ref '${BASE}' — fetch it first (CI needs fetch-depth: 0)" >&2
    exit 2
fi

if ! drift="$(git diff --name-only "${BASE}...HEAD" -- "${PATHS[@]}")"; then
    echo "git diff against '${BASE}' failed — refusing to report a clean tree" >&2
    exit 2
fi

if [ -n "$drift" ]; then
    echo "FAIL: files changed that this feature must not touch:" >&2
    printf '%s\n' "$drift" >&2
    exit 1
fi

# The manifest's own content is the substance of the claim, so check it directly
# rather than inferring it from the diff being empty.
MANIFEST="config/official-plugins.json"
if [ ! -f "$MANIFEST" ]; then
    echo "missing ${MANIFEST} — refusing to report it unchanged" >&2
    exit 2
fi

org="$(python3 -c "import json,sys;print(json.load(open('${MANIFEST}'))['org'])")"
count="$(python3 -c "import json;print(len(json.load(open('${MANIFEST}'))['plugins']))")"

if [ "$org" != "https://github.com/tong-io" ]; then
    echo "FAIL: the official org moved to '${org}' — that is a separate change with its own contract" >&2
    exit 1
fi
if [ "$count" -lt 30 ]; then
    echo "FAIL: only ${count} official plugins listed; the manifest was reshaped" >&2
    exit 1
fi

echo "no drift vs ${BASE}: ${PATHS[*]} untouched"
echo "manifest intact: ${count} plugins, org still ${org}"
