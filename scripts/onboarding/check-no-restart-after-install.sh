#!/usr/bin/env bash
# E8 / AC-6 — a plugin installed in this process is registered in this
# process, no restart. This pins an advantage OneFlow has over ComfyUI
# (restart + refresh after install), so it is expected to be green on the
# baseline too; that is what a regression guard is.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

BKO_INSTALL_HARNESS=1 pnpm vitest run \
    src/lib/onboarding/install-missing.harness.test.ts -t "E8"
