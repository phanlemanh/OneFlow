#!/usr/bin/env bash
# E20 guard (compose-overlay AC-14): registration + docs + i18n coherence.
#
# Manifest/org invariants are NOT re-asserted here — they belong to
# check-manifest-unmoved.sh, which this script delegates to. This one owns only
# the compose-overlay-specific facts.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
P=oneflow-modal-compose-overlay

python3 - <<'PY'
import json
m = json.load(open('config/official-plugins.json'))
entry = [e for e in m['plugins'] if not isinstance(e, str) and e.get('id') == 'oneflow-modal-compose-overlay']
assert len(entry) == 1, 'compose-overlay must be exactly one origin entry'
assert entry[0]['origin'] == 'https://github.com/phanlemanh', f"unexpected origin: {entry[0]}"
PY

bash scripts/plugins/check-manifest-unmoved.sh >/dev/null \
    || { echo "FAIL: manifest guard red"; exit 1; }

# The capability-matrix row must be asserted by its OWN text. Greping for
# "overlay" would be tautological — the plugin id contains that substring, so
# the list-entry check alone would satisfy it while the ⬜→✅ row is missing.
declare -a ROWS=(
    "README.md|✅ \*\*Text / price-tag / logo overlay\*\*"
    "docs/README_ZH.md|✅ \*\*文字 / 价格牌 / logo 叠加\*\*"
    "docs/README_JA.md|✅ \*\*テキスト / 価格タグ / ロゴ オーバーレイ\*\*"
)
for spec in "${ROWS[@]}"; do
    f="${spec%%|*}"
    row="${spec#*|}"
    grep -q "$P" "$f" || { echo "FAIL: $f missing plugin list entry"; exit 1; }
    grep -qE "$row" "$f" || { echo "FAIL: $f missing the capability-matrix row"; exit 1; }
done

# All five shipped locales — vi included: Vietnamese text is this feature's
# headline capability, so a missing vi block must not read as green.
for f in src/i18n/messages/*.json; do
    grep -q "composeOverlay" "$f" || { echo "FAIL: $f missing composeOverlay i18n keys"; exit 1; }
done

echo "OK: compose-overlay registered (origin entry), docs matrix rows + i18n coherent"
