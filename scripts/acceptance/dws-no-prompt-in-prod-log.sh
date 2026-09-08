#!/usr/bin/env bash
# AC-13 — user-authored prompt text must not reach always-on logs.
#
# `logger.debug` no-ops outside development; `warn`/`error`/`info` do not. A
# failed plan is a routine outcome, not an incident, so logging what the user
# typed on every failure would put arbitrary user text into production logs.
set -euo pipefail
cd "$(dirname "$0")/../.."
fail() { echo "FAIL: $*" >&2; exit 1; }

# Any logger call other than .debug that passes the prompt variable.
if grep -nE 'logger\.(warn|error|info|log)\([^)]*\bprompt\b' \
        src/lib/director/director.server.ts src/app/api/director/route.ts; then
    fail "prompt text reaches an always-on logger (above)"
fi

grep -q 'logger.debug("\[Director\] prompt:"' src/lib/director/director.server.ts \
    || fail "the development-only prompt trace is gone — guard is measuring nothing"

echo "OK: prompt text only reaches logger.debug"
