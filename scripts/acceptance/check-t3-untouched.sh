#!/usr/bin/env bash
# Usage: check-t3-untouched.sh <slug> [base-ref]
#
# E5 / AC-4 — "did this feature stay inside its declared tier?"
#
# A contract's `risk_tier` is a claim about which paths the change touches, and
# the claim is made BEFORE the diff exists. Nothing re-checks it afterwards
# except a human reading a file list, so a T2 feature that quietly edits an ABI
# chokepoint keeps its T2 gate — a smaller eval set, a lighter signoff — while
# behaving like a T3 one.
#
# This asserts the negative directly: the feature's diff against <base-ref>
# contains ZERO files under risk_tiers.t3_paths. The path list is READ FROM
# _acceptance/config.yaml rather than restated here, because a second copy would
# drift the moment someone adds a t3 path (the failure family this repo already
# paid for twice: per-plugin-origin's URL rule, and the SDK version pin).
#
# It also covers two of local-cpu-plugins' out-of-scope bullets by construction:
# "no ABI change" and "no SDK bump" are both t3 paths.
set -euo pipefail

SLUG="${1:?usage: check-t3-untouched.sh <slug> [base-ref]}"
BASE_REF="${2:-origin/main}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

CONFIG="_acceptance/config.yaml"
[ -f "$CONFIG" ] || { echo "FAIL: no $CONFIG"; exit 1; }
[ -d "_acceptance/$SLUG" ] || { echo "FAIL: no _acceptance/$SLUG"; exit 1; }

git rev-parse --verify --quiet "$BASE_REF" >/dev/null \
    || { echo "FAIL: base ref '$BASE_REF' does not resolve"; exit 1; }

MERGE_BASE="$(git merge-base "$BASE_REF" HEAD)"
echo "comparing HEAD against $BASE_REF (merge-base ${MERGE_BASE:0:12})"

CHANGED="$(mktemp)"
trap 'rm -f "$CHANGED"' EXIT

# Committed changes plus anything still in the working tree: an uncommitted edit
# to a t3 path is exactly as much a tier violation as a committed one.
{
    git diff --name-only "$MERGE_BASE"...HEAD
    git diff --name-only HEAD
    git ls-files --others --exclude-standard
} | sort -u > "$CHANGED"

node "$ROOT/scripts/acceptance/t3-scan.mjs" "$CHANGED" "$CONFIG"
