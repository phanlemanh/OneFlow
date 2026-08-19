#!/usr/bin/env bash
# E17 / AC-12 — no telemetry sink anywhere in the client or server source.
# Pass a directory to scan it instead of src/ (the teeth fixture uses this).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

node scripts/onboarding/telemetry-scan.mjs "${1:-}"
