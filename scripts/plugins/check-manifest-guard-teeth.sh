#!/usr/bin/env bash
# E18 / AC-15 — the guard of the guard.
#
# check-manifest-unmoved.sh is a snapshot, and every snapshot gets re-cut when a
# plugin moves. The cheapest way to make a re-cut "pass" is to loosen it into a
# check that accepts anything, and no other eval would notice. So: perturb a
# COPY of the manifest and assert the guard goes RED for each perturbation.
#
# Nothing here touches the real config/official-plugins.json.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MANIFEST="$ROOT/config/official-plugins.json"
GUARD="$ROOT/scripts/plugins/check-manifest-unmoved.sh"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# The guard reads a repo-relative path, so each case runs in a throwaway tree
# that mirrors the two paths it needs.
stage() {
    rm -rf "$WORK/tree"
    mkdir -p "$WORK/tree/config" "$WORK/tree/scripts/plugins"
    cp "$GUARD" "$WORK/tree/scripts/plugins/check-manifest-unmoved.sh"
    node -e "
      const fs = require('fs');
      const m = JSON.parse(fs.readFileSync('$MANIFEST', 'utf8'));
      $1
      fs.writeFileSync('$WORK/tree/config/official-plugins.json', JSON.stringify(m, null, 4));
    "
}

expect_red() {
    local label="$1"
    if (cd "$WORK/tree" && bash scripts/plugins/check-manifest-unmoved.sh >/dev/null 2>&1); then
        echo "FAIL: the guard stayed GREEN after: $label"
        echo "      it has been loosened into a check that passes on anything."
        exit 1
    fi
    echo "  ok — guard goes red: $label"
}

echo "check-manifest-guard-teeth: perturbing a copy of the manifest"

# 1. Baseline: the untouched manifest must be GREEN, or every case below is
#    vacuously true.
stage ""
if ! (cd "$WORK/tree" && bash scripts/plugins/check-manifest-unmoved.sh >/dev/null 2>&1); then
    echo "FAIL: the guard is red on the UNMODIFIED manifest — the teeth cases below would be meaningless"
    exit 1
fi
echo "  ok — guard is green on the real manifest"

# 2. One origin entry beyond the real count (a fifth, as of normalize-text-vi).
stage "m.plugins.push({ id: 'oneflow-api-something', origin: 'https://github.com/phanlemanh' });"
expect_red "one origin entry beyond the real count was added"

# 3. One origin URL altered.
stage "m.plugins.find((e) => typeof e === 'object').origin = 'https://github.com/someone-else';"
expect_red "an origin URL was changed"

# 4. One origin entry renamed.
stage "m.plugins.find((e) => typeof e === 'object').id = 'oneflow-not-that-one';"
expect_red "an origin entry id was changed"

# Read the pinned count out of the guard instead of restating it here. This label said
# "a 37th plain string" from the day the guard pinned 36; when the OpenAI fork moved the
# pin to 35 the label kept claiming 37, so the teeth script's own output named a count
# one higher than the perturbation it performs.
guard_pinned_count() {
    grep -oE 'strings\.length !== [0-9]+' "$(dirname "${BASH_SOURCE[0]}")/check-manifest-unmoved.sh" \
        | grep -oE '[0-9]+'
}

# 5. A plain string added (the count that started this guard's life).
stage "m.plugins.push('tongflow-modal-something-new');"
expect_red "one more plain string than the guard's pinned count ($(guard_pinned_count) + 1) was added"

# 6. An origin entry demoted back to a plain string.
stage "
  const i = m.plugins.findIndex((e) => typeof e === 'object');
  m.plugins[i] = m.plugins[i].id;
"
expect_red "an origin entry was demoted to a plain string"

# 7. The default org changed.
stage "m.org = 'https://github.com/somewhere-else';"
expect_red "the default org was changed"

echo "OK: the manifest guard is red for all 6 perturbations"
