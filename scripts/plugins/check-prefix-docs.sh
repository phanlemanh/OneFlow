#!/usr/bin/env bash
# AC-5: docs/plugins.md states the convention the validator actually enforces.
#
# Documentation drifts silently — that is its defining failure mode, and this
# repo has already been bitten by it (CLAUDE.md records the plugin READMEs
# drifting from official-plugins.json). So the convention is asserted, not
# trusted.
#
# grep without -q throughout: -q exits on the first match and closes the pipe,
# and under `set -o pipefail` the dead writer turns a successful match into a
# failed pipeline. See scripts/ci/check-ghcr-untouched.sh for the full story.
set -euo pipefail

DOC="docs/plugins.md"

if [ ! -f "$DOC" ]; then
    echo "missing ${DOC} — refusing to report the docs correct" >&2
    exit 2
fi

fail=0

need() {
    local what="$1" pattern="$2"
    if grep -E "$pattern" "$DOC" >/dev/null; then
        echo "ok  ${what}"
    else
        echo "FAIL: ${DOC} does not ${what}" >&2
        fail=1
    fi
}

# Anchored to the convention BULLETS, not to the words appearing anywhere in a
# 400-line document. Both of these rules are also named in the troubleshooting
# section near the end, so an unanchored search reported them present after the
# rule itself had been deleted — the guard matching prose it wasn't asked about.
need "state the oneflow-api convention" '^- It must begin with `oneflow-api-'
need "state the oneflow-modal convention" '^- It must begin with .*`oneflow-modal-'
need "record that the legacy tongflow form is still accepted" '^- The legacy `tongflow-api-'
# Anchored, at the third attempt. First it accepted "does not control" from
# anywhere — a sentence about not controlling a plugin PROCESS satisfied a check
# about not controlling a plugin REPO. Then it was merely NARROWED to the exact
# phrase, still unanchored, under a comment claiming it was anchored: the same
# sentence appears verbatim in scan.py and plugin-id.ts, so any doc quoting
# either would have recreated the bypass. Now pinned to its own line.
need "give the reason — the upstream repos are not ours" '^  are upstream repos under an org this fork does not control'
need "keep the lowercase rule" '^- The directory name must be \*\*all lowercase\*\*'
need "keep the no-hardware rule" '^- It must \*\*not\*\* encode hardware'

# The line that used to define the convention must no longer present the legacy
# form as THE convention — otherwise a reader following the first bullet writes
# a tongflow-* plugin and the docs are honest but useless.
if grep -E '^- It must begin with `tongflow-' "$DOC" >/dev/null; then
    echo "FAIL: the primary convention bullet still leads with tongflow-" >&2
    fail=1
else
    echo "ok  the primary convention bullet leads with oneflow-"
fi

[ "$fail" -eq 0 ] || exit 1
echo "${DOC}: documents the oneflow convention and the legacy exception, with its reason"
