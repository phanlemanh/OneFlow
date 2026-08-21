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

# 1. Manifest entry, with the right origin.
node -e "
  const fs = require('fs');
  const m = JSON.parse(fs.readFileSync('$ROOT/config/official-plugins.json', 'utf8'));
  const e = m.plugins.find((p) => typeof p === 'object' && p !== null && p.id === '$PLUGIN_ID');
  if (!e) { console.error('FAIL: manifest thiếu entry $PLUGIN_ID'); process.exit(1); }
  if (e.origin !== '$ORIGIN') { console.error('FAIL: origin sai: ' + e.origin); process.exit(1); }
" || fail "manifest chưa đăng ký $PLUGIN_ID dưới $ORIGIN"

# 1b. The two manifest guards, RUN — not merely named.
#     The eval's `expected` used to claim the re-cut guard was updated and that
#     its teeth still bite, while this script checked neither: both were verified
#     by hand once and then asserted in prose forever after. Prose is not
#     executed. Run them.
bash "$ROOT/scripts/plugins/check-manifest-unmoved.sh" >/dev/null ||
    fail "check-manifest-unmoved.sh đỏ — mốc manifest chưa cắt lại đúng"
bash "$ROOT/scripts/plugins/check-manifest-guard-teeth.sh" >/dev/null ||
    fail "check-manifest-guard-teeth.sh đỏ — guard manifest đã mất răng"

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
    grep -q "$PLUGIN_ID" "$ROOT/$file" || fail "$file không nhắc $PLUGIN_ID"
    awk -v h="$heading" '
        $0 == h { inside = 1; next }
        inside && /^#/ { inside = 0 }
        inside { print }
    ' "$ROOT/$file" | grep -E "^- ✅" | grep -q "$row_marker" ||
        fail "$file thiếu dòng ✅ chứa marker trong mục ma trận $heading"
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
        " || fail "$locale.json thiếu Workspace.nodes.$bucket.normalizeTextVi"
    done
    # The TTS-order warning copy (AC-10's human sentence). This claim used to
    # live only in E10a's `expected` prose while no executor read the key —
    # measured here now, next to its sibling keys (S4 round 2 finding).
    node -e "
      const d = require('$file');
      const v = d?.Workspace?.toast?.ttsNeedsNormalize;
      if (typeof v !== 'string' || !v.includes('{nodes}')) process.exit(1);
    " || fail "$locale.json thiếu Workspace.toast.ttsNeedsNormalize (kèm chỗ trống {nodes})"
done

# 3b. The warning key must actually be RENDERED: one shared hook consumes it,
#     and all three export surfaces call that hook. Static greps — an honest,
#     declared floor: they prove the wiring exists, not pixels.
grep -q "ttsNeedsNormalize" "$ROOT/src/hooks/use-export-warning-toast.ts" ||
    fail "hook cảnh báo không đọc key ttsNeedsNormalize"
for surface in \
    "src/components/workspace/workflow-title-menu.tsx" \
    "src/hooks/use-workflow-execution.ts"; do
    grep -q "useExportWarningToasts" "$ROOT/$surface" ||
        fail "$surface không dùng hook cảnh báo export"
done
notify_calls=$(cat \
    "$ROOT/src/components/workspace/workflow-title-menu.tsx" \
    "$ROOT/src/hooks/use-workflow-execution.ts" |
    grep -c "notifyExportWarnings(executable)")
[ "$notify_calls" = "3" ] ||
    fail "phải có đúng 3 call site render cảnh báo export (thấy $notify_calls)"

if [ "$fails" -gt 0 ]; then
    echo "FAIL: $fails chỗ chưa đồng bộ"
    exit 1
fi
echo "OK: manifest + 3 README (danh sách & hàng ma trận) + 5 locale đều đồng bộ"
