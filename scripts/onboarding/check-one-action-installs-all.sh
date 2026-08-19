#!/usr/bin/env bash
# E7 / AC-5 — one call installs EVERY plugin the bundled example needs.
#
# Runs the network-dependent harness (real clones into a temp plugins dir):
# the full half proves the one-call → whole-set relation from an empty dir;
# the suppression half proves an already-present plugin is skipped and never
# re-cloned. Without BKO_INSTALL_HARNESS=1 these tests skip, so the plain
# unit suite stays offline-safe.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

BKO_INSTALL_HARNESS=1 pnpm vitest run \
    src/lib/onboarding/install-missing.harness.test.ts -t "E7"
