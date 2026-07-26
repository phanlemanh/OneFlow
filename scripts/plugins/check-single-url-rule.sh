#!/usr/bin/env bash
# E5 / AC-3: the `${...}/${id}.git` remote-URL template must exist in exactly
# one place **within the TypeScript/JavaScript tree**.
#
# That scope limit is real and worth stating rather than glossing: the standalone
# SDK engine (sdk/tongflow/engine/plugins.py) carries its own DEFAULT_ORG and its
# own f-string version of this rule, and a grep restricted to .ts/.tsx/.mjs/.js
# structurally cannot see it. Bringing Python under one resolver means changing
# sdk/, which is outside this feature's approved scope; it is recorded as a known
# limit on the contract instead of being silently implied away here.
#
# The scan scope is declared rather than implied. Without the exclusions a
# correct tree fails, because this checker quotes the pattern and the test
# fixtures legitimately spell out expected URLs; without the scope a stray copy
# under scripts/ passes unseen. Both mistakes were called out before this guard
# was written, so they are encoded here instead of discovered later.
#
# Only checkers are excluded by name — never a real call site. The parity guard
# re-derives the rule on purpose so its expectation is independent of the
# resolver it checks. install-official-plugins.ts is deliberately NOT excluded:
# it is exactly where a second copy grew last time, so the guard must keep
# watching it. That is why its header comment describes the rule in prose
# rather than quoting the template.
set -euo pipefail

pattern='\$\{[^}]*\}/\$\{[^}]*\}\.git'
home='src/lib/plugins/official-manifest.ts'

matches=$(grep -rnE "$pattern" src scripts \
    --include='*.ts' --include='*.tsx' --include='*.mjs' --include='*.js' \
    | grep -v 'scripts/plugins/check-single-url-rule.sh' \
    | grep -v 'scripts/plugins/check-installer-parity.ts' \
    | grep -v '\.test\.' || true)

count=$(printf '%s' "$matches" | grep -c . || true)

if [ "$count" -ne 1 ]; then
    echo "FAIL: expected the URL template exactly once, found ${count}:"
    printf '%s\n' "$matches"
    exit 1
fi

if ! printf '%s' "$matches" | grep -q "$home"; then
    echo "FAIL: the single occurrence is not in ${home}:"
    printf '%s\n' "$matches"
    exit 1
fi

if [ -e scripts/install-official-plugins.mjs ]; then
    echo "FAIL: scripts/install-official-plugins.mjs still exists; it moved to TypeScript"
    exit 1
fi

if [ ! -f scripts/install-official-plugins.ts ]; then
    echo "FAIL: scripts/install-official-plugins.ts is missing"
    exit 1
fi

if ! grep -q 'official-manifest' scripts/install-official-plugins.ts; then
    echo "FAIL: the CLI installer does not import the shared resolver"
    exit 1
fi

echo "OK: one URL rule across src/ and scripts/, in ${home}; the CLI installer imports it (the SDK engine's Python copy is out of this scan's scope — see the contract's known limits)"
