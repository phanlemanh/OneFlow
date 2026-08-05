#!/usr/bin/env bash
# E1b guard (compose-overlay AC-1): Python generated artifacts must match the
# committed ABI. Re-runs both generators and fails on any resulting diff.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
python3 sdk/tongflow/gen_models.py --abi config/tongflow.abi.json --out-dir sdk/tongflow/models
python3 sdk/tongflow/gen_node_slots.py --abi config/tongflow.abi.json --out sdk/tongflow/node_slots.py
git diff --exit-code sdk/tongflow/models sdk/tongflow/node_slots.py

# `git diff` is blind to untracked files, and a NEW slot produces a NEW model
# file — without this a never-committed model reads as clean.
untracked=$(git status --porcelain --untracked-files=all sdk/tongflow/models sdk/tongflow/node_slots.py)
if [ -n "$untracked" ]; then
    echo "FAIL: generated Python artifacts are not committed:"
    echo "$untracked"
    exit 1
fi
