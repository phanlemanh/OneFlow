#!/usr/bin/env bash
# Gives teeth to the update rule docs/roadmap.md declares about itself:
# "Cập nhật file này mỗi lần qua gate, không cập nhật theo tuần."
#
# That rule had no enforcement, and the failure it invites is not "the roadmap
# is a bit old" — it is "the roadmap still argues from a decision the repo has
# already reversed". Concretely: ADR-0011 (2026-08-05) made the user's machine
# the default execution substrate, and for two weeks Phase 2 kept citing
# ADR-0005's superseded managed-cloud-default half as if it still held. Both
# documents were internally consistent; only the pair was wrong.
#
# Why it drifts in exactly this direction: STATUS.md is updated every work
# package (high pressure), the roadmap only at gates (low pressure). A strategy
# reversal that lands between two gates therefore slips through the seam.
#
# Three checks, all reading sources that already exist — no new bookkeeping:
#   A. every ADR in docs/adr/ is mentioned in the roadmap
#   B. no block cites a superseded ADR without naming its replacement
#   C. every `status: signed-off` contract is classified in the roadmap ledger
#
# Run from the repo root: `pnpm roadmap:check`. Exits non-zero on drift.
# Its teeth are proven separately by check-roadmap-guard-teeth.sh
# (`pnpm roadmap:teeth`), whose first perturbation is the roadmap exactly as it
# stood on main @ 244cb0b.
#
# Wired into CI on 2026-08-31 (`cong-tu-canh-minh`): the `Acceptance Gate` job in
# .github/workflows/ci.yml runs this on every PR and every push to main.
#
# The note that stood here said wiring it in would first need
# scripts/ci/check-action-pins.sh re-numbered, because that guard counts pinned
# `actions/checkout` SITES rather than asserting a floor. That only applies to
# adding a JOB. This went in as a STEP on a job that already checks out, so the
# count never moved — it was 8 before and 8 after, not the 6 the old note cited.
set -euo pipefail

cd "$(dirname "$0")/../.."

# Takes no arguments, and REFUSES the ones it does not know rather than ignoring
# them. A guard that swallows `--strict` and exits 0 cannot be told apart from a
# guard that ran: a typo in the ci.yml `run:` line would then read as a clean
# check forever. Same fail-open class this repo already refuses for `--case` in
# check-roadmap-guard-teeth.sh.
if [ $# -gt 0 ]; then
    echo "check-roadmap-fresh: không nhận tham số nào — nhận được: $*" >&2
    exit 2
fi

echo "→ kiểm tra trôi giữa docs/roadmap.md, docs/adr/ và _acceptance/"
node scripts/roadmap/roadmap-drift.mjs
