#!/usr/bin/env bash
# E1 / AC-1 — the bundled example demands no API key from anyone.
#
# The length floor is load-bearing, not decoration: a parser that returned an
# empty set would satisfy "every plugin needs no key" vacuously, and the eval
# would be green while measuring nothing. So the ids are PRINTED and counted.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

WORKFLOW="${1:-public/example.json}"
node scripts/onboarding/example-needs-no-keys.mjs "$WORKFLOW"
