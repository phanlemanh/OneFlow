#!/usr/bin/env bash
# E20 guard (compose-overlay AC-14): registration + docs + i18n coherence.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
P=oneflow-modal-compose-overlay

python3 - <<'PY'
import json
m = json.load(open('config/official-plugins.json'))
ids = [e if isinstance(e, str) else e['id'] for e in m['plugins']]
assert 'oneflow-modal-compose-overlay' in ids, 'manifest entry missing'
assert len(ids) == 39, f'expected 39 entries, got {len(ids)}'
entry = [e for e in m['plugins'] if not isinstance(e, str)]
assert len(entry) == 1 and entry[0]['origin'] == 'https://github.com/phanlemanh', 'origin entry wrong'
PY

bash scripts/plugins/check-manifest-unmoved.sh >/dev/null \
  || { echo "FAIL: manifest guard red"; exit 1; }

for f in README.md docs/README_ZH.md docs/README_JA.md; do
  grep -q "$P" "$f" || { echo "FAIL: $f missing plugin list entry"; exit 1; }
  grep -qi "overlay" "$f" || { echo "FAIL: $f missing capability row"; exit 1; }
done

for f in src/i18n/messages/en.json src/i18n/messages/zh.json src/i18n/messages/ja.json src/i18n/messages/ko.json; do
  grep -q "composeOverlay" "$f" || { echo "FAIL: $f missing composeOverlay i18n keys"; exit 1; }
done

echo "OK: compose-overlay registered (#39), docs + i18n coherent"
