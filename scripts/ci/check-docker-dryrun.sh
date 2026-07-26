#!/usr/bin/env bash
# AC-4: a manual dispatch of docker-publish must build without publishing.
#
# Static half. The dynamic half (AC-5/AC-6) proves an actual dispatched run
# succeeded and pushed nothing; this proves the guard is written the way the
# contract says, so a later edit that quietly restores `push: true` fails here
# rather than at the next dispatch.
set -euo pipefail

WF=".github/workflows/docker-publish.yml"

if [ ! -f "$WF" ]; then
    echo "missing ${WF} — refusing to report the guard present" >&2
    exit 2
fi

# `push:` appears twice in this file with different meanings: the trigger, which
# is a bare key with a block under it, and the build-push-action input, which
# carries a value on the same line. Match on that difference rather than on
# indentation depth, which any reformat would break.
push_line="$(grep -E '^[[:space:]]*push:[[:space:]]*[^[:space:]]' "$WF" || true)"

if [ -z "$push_line" ]; then
    echo "FAIL: no 'push:' input found in ${WF}" >&2
    exit 1
fi

if [ "$(printf '%s\n' "$push_line" | wc -l | tr -d ' ')" -ne 1 ]; then
    echo "FAIL: expected exactly one 'push:' input, found:" >&2
    printf '%s\n' "$push_line" >&2
    exit 1
fi

if printf '%s' "$push_line" | grep -qE '^\s*push:\s*true\s*$'; then
    echo "FAIL: push is unconditionally true — a manual dispatch would publish" >&2
    exit 1
fi

if ! printf '%s' "$push_line" | grep -qE "github\.ref_type\s*==\s*'tag'"; then
    echo "FAIL: push is not gated on the ref being a tag:" >&2
    printf '%s\n' "$push_line" >&2
    exit 1
fi

echo "dry-run guard present:${push_line}"
echo "a workflow_dispatch run builds both platforms and publishes nothing"
