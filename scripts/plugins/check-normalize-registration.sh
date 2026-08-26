#!/usr/bin/env bash
# E13 (normalize-text-vi AC-13) — registration is synced across every place that
# has to know about the plugin.
#
# The three READMEs are hand-maintained and drift silently (CLAUDE.md says so in
# as many words), and the five locale files are the other half of "the node is
# actually usable". Both are product requirements, not documentation chores, so
# they are measured rather than trusted.
set -euo pipefail

# Root from the script's own location, never cwd.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

PLUGIN_ID="oneflow-api-normalize-text-vi"
ORIGIN="https://github.com/phanlemanh"
fails=0

fail() {
    echo "FAIL: $1"
    fails=$((fails + 1))
}

# 1. The plugin must be ABSENT from the manifest.
#
#    It was registered on 2026-08-20 and WITHDRAWN on 2026-08-26: the origin it
#    named — $ORIGIN/$PLUGIN_ID — does not exist publicly (its three siblings
#    resolve; this one 404s), so the plugin could not be installed on any
#    machine but the one that wrote it, and the README links were dead. This
#    guard now pins the withdrawal, so re-registering without publishing the
#    repository turns it red instead of shipping a dead link again.
node -e "
  const fs = require('fs');
  const m = JSON.parse(fs.readFileSync('$ROOT/config/official-plugins.json', 'utf8'));
  const e = m.plugins.find((p) => (typeof p === 'object' && p !== null ? p.id : p) === '$PLUGIN_ID');
  if (e) { console.error('FAIL: manifest still registers $PLUGIN_ID — its repository does not exist publicly'); process.exit(1); }
" || fail "manifest still registers $PLUGIN_ID (repository does not exist publicly)"

# 1b. The two manifest guards, RUN — not merely named.
#     The eval's `expected` used to claim the re-cut guard was updated and that
#     its teeth still bite, while this script checked neither: both were verified
#     by hand once and then asserted in prose forever after. Prose is not
#     executed. Run them.
bash "$ROOT/scripts/plugins/check-manifest-unmoved.sh" >/dev/null ||
    fail "check-manifest-unmoved.sh is red — the manifest snapshot was not re-cut"
bash "$ROOT/scripts/plugins/check-manifest-guard-teeth.sh" >/dev/null ||
    fail "check-manifest-guard-teeth.sh is red — the manifest guard has lost its teeth"

# 2. All three READMEs list the plugin AND carry the new capability-matrix
#    entry. The matrix in these READMEs is a ✅/⬜ BULLET LIST under headings,
#    not a markdown table; the entry is an ADDITION under Transform -> Text
#    (that section had exactly one row before this feature). Measured
#    STRUCTURALLY — a presence-anywhere grep also goes green when the phrase
#    appears only in the plugin-list description (S4 round 2 finding): the
#    marker must sit on a "- ✅" line INSIDE the Text section, i.e. between
#    the section's heading and the next heading.
check_doc() {
    local file="$1" heading="$2" row_marker="$3"
    ! grep -q "$PLUGIN_ID" "$ROOT/$file" ||
        fail "$file still links $PLUGIN_ID — that repository does not exist publicly"
    awk -v h="$heading" '
        $0 == h { inside = 1; next }
        inside && /^#/ { inside = 0 }
        inside { print }
    ' "$ROOT/$file" | grep -E "^- ⬜" | grep -q "$row_marker" ||
        fail "$file has no ⬜ row carrying the marker inside capability-matrix section $heading — the capability is not available while no official plugin ships it"
}
check_doc "README.md" "#### Text" "Read numbers aloud (Vietnamese)"
check_doc "docs/README_ZH.md" "#### 文本" "数字转文字（越南语）"
check_doc "docs/README_JA.md" "#### テキスト" "数字を読み上げ用に変換（ベトナム語）"

# 3. Five locales, both key buckets. A node whose title renders as the raw key
#    is not shipped, it is broken in four languages.
for locale in en vi ja ko zh; do
    file="$ROOT/src/i18n/messages/${locale}.json"
    for bucket in titles actions; do
        node -e "
          const d = require('$file');
          const v = d?.Workspace?.nodes?.['$bucket']?.normalizeTextVi;
          if (typeof v !== 'string' || !v.trim()) process.exit(1);
        " || fail "$locale.json is missing Workspace.nodes.$bucket.normalizeTextVi"
    done
    # The TTS-order warning copy (AC-10's human sentence). This claim used to
    # live only in E10a's `expected` prose while no executor read the key —
    # measured here now, next to its sibling keys (S4 round 2 finding).
    node -e "
      const d = require('$file');
      const v = d?.Workspace?.toast?.ttsNeedsNormalize;
      if (typeof v !== 'string' || !v.includes('{nodes}')) process.exit(1);
    " || fail "$locale.json is missing Workspace.toast.ttsNeedsNormalize (with the {nodes} placeholder)"
done

# 3b. The warning key must actually be RENDERED: one shared hook consumes it,
#     and all three export surfaces call that hook. Static greps — an honest,
#     declared floor: they prove the wiring exists, not pixels.
grep -q "ttsNeedsNormalize" "$ROOT/src/hooks/use-export-warning-toast.ts" ||
    fail "the export-warning hook does not read the ttsNeedsNormalize key"
for surface in \
    "src/components/workspace/workflow-title-menu.tsx" \
    "src/hooks/use-workflow-execution.ts"; do
    grep -q "useExportWarningToasts" "$ROOT/$surface" ||
        fail "$surface does not use the export-warning hook"
done
# `|| true` is load-bearing under `set -euo pipefail`: grep -c exits 1 when the
# count is ZERO, which is precisely the regression this line exists to catch
# (every call site deleted). Without it the substitution fails, set -e kills the
# script at the assignment, and the guard dies WITHOUT printing its FAIL line —
# non-zero exit, no reason (S4 round 6 finding).
notify_calls=$(cat \
    "$ROOT/src/components/workspace/workflow-title-menu.tsx" \
    "$ROOT/src/hooks/use-workflow-execution.ts" |
    grep -c "notifyExportWarnings(executable)" || true)
[ "$notify_calls" = "3" ] ||
    fail "expected exactly 3 export-warning render call sites (found $notify_calls)"

if [ "$fails" -gt 0 ]; then
    echo "FAIL: $fails place(s) out of sync"
    exit 1
fi
echo "OK: manifest + 3 READMEs (plugin list & matrix row) + 5 locales all in sync"
