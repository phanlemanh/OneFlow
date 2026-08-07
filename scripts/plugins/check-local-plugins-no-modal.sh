#!/usr/bin/env bash
# E15 / AC-13 — Modal is actually gone from the two local plugins.
#
# ADR-0011 removes the cloud dependency from the seven CPU slots on skill #1's
# critical path. "Removed" means removed from the artifact, not merely unused at
# run time: no modal import, no deploy/download scripts, no MODAL_TOKEN_* in the
# manifest, and no S3 upload path. A plugin that still carried any of those
# would drag the dependency back in the moment someone read it as a template.
#
# Reads the plugin sources the same way the eval lane does: a local checkout
# under plugins/ when present, else a shallow clone.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLUGINS=(oneflow-api-ffmpeg oneflow-api-pyscenedetect)
ORIGIN="${LOCAL_PLUGIN_ORIGIN:-https://github.com/phanlemanh}"

fail() { echo "FAIL: $1"; exit 1; }

for name in "${PLUGINS[@]}"; do
    dir="$ROOT/plugins/$name"
    if [ -d "$dir" ]; then
        source_kind="worktree"
    else
        dir="${TMPDIR:-/tmp}/oneflow-api-plugin-scan/$name"
        source_kind="clone"
        if [ ! -d "$dir/.git" ]; then
            mkdir -p "$(dirname "$dir")"
            git clone --depth 1 "$ORIGIN/$name.git" "$dir" >/dev/null 2>&1 \
                || fail "$name: no checkout under plugins/ and the clone failed"
        else
            git -C "$dir" fetch --depth 1 origin >/dev/null 2>&1
            git -C "$dir" reset --hard origin/HEAD >/dev/null 2>&1
        fi
    fi
    echo "scanning $name ($source_kind: $dir)"

    # 1. No modal import anywhere in the Python sources.
    if grep -rnE '^[[:space:]]*(import|from)[[:space:]]+modal\b' \
        --include='*.py' "$dir" 2>/dev/null; then
        fail "$name still imports modal"
    fi

    # 2. No Modal lifecycle scripts.
    for forbidden in deploy.py download.py; do
        [ -e "$dir/$forbidden" ] && fail "$name still ships $forbidden"
    done

    # 3. modal must not be a declared dependency.
    if [ -f "$dir/requirements.txt" ] && grep -qiE '^[[:space:]]*modal([=<>~[]|$)' \
        "$dir/requirements.txt"; then
        fail "$name still declares modal in requirements.txt"
    fi

    # 4. No MODAL_TOKEN_* in the manifest, and FFMPEG_BIN stays optional — the
    #    plugin must work with nothing configured.
    node -e '
      const fs = require("fs");
      const p = process.argv[1], name = process.argv[2];
      const m = JSON.parse(fs.readFileSync(p + "/tongflow.plugin.json", "utf8"));
      const env = Array.isArray(m.env) ? m.env : [];
      const bad = env.filter((e) => String(e.key || "").startsWith("MODAL_TOKEN"));
      if (bad.length) {
        console.error("FAIL: " + name + " declares " + bad.map((e) => e.key).join(", "));
        process.exit(1);
      }
      const required = env.filter((e) => e.required === true);
      if (required.length) {
        console.error("FAIL: " + name + " marks " + required.map((e) => e.key).join(", ")
          + " as required; a local plugin must run with nothing configured");
        process.exit(1);
      }
    ' "$dir" "$name"

    # 5. No S3 / R2 upload path — that existed only to hand bytes back from a
    #    remote container.
    #
    #    Matches imports and env lookups, NOT prose: the READMEs and module
    #    docstrings say "minus the boto3 / R2 upload path" on purpose, and a
    #    scan that forbids naming what was removed would push the explanation
    #    out of the code.
    if grep -rnE '^[[:space:]]*(import|from)[[:space:]]+(boto3|botocore)\b' \
        --include='*.py' "$dir" 2>/dev/null; then
        fail "$name still imports boto3/botocore"
    fi
    if grep -rnE 'os\.(getenv|environ)[^)]*R2_' \
        --include='*.py' "$dir" 2>/dev/null; then
        fail "$name still reads R2_* credentials"
    fi
    if [ -f "$dir/requirements.txt" ] && grep -qiE '^[[:space:]]*boto3([=<>~[]|$)' \
        "$dir/requirements.txt"; then
        fail "$name still declares boto3 in requirements.txt"
    fi

    echo "  ok — $name is Modal-free"
done

echo "OK: neither local plugin imports modal, ships deploy/download, requires a token, or uploads to S3"
