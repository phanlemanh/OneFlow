#!/usr/bin/env bash
# E7 / AC-6 (per-plugin-origin) snapshot, second edition. First edition froze
# "38 plain strings" to prove the origin capability moved no plugin. The first
# origin entry landed 2026-08-03 (compose-overlay AC-14 amendment, Gate-1
# re-approved): oneflow-modal-compose-overlay lives under phanlemanh. The
# invariant is now: 38 plain strings under the default org + exactly ONE
# origin entry, the compose-overlay one.
set -euo pipefail

manifest=config/official-plugins.json
expected_org='https://github.com/tong-io'

node -e '
const m = JSON.parse(require("fs").readFileSync("config/official-plugins.json", "utf8"));
const strings = m.plugins.filter((e) => typeof e === "string");
const objects = m.plugins.filter((e) => typeof e === "object" && e !== null);
const fail = (msg) => { console.error("FAIL: " + msg); process.exit(1); };
if (m.org !== "https://github.com/tong-io") fail(`default org is ${m.org}`);
if (strings.length !== 38) fail(`expected 38 plain string entries, got ${strings.length}`);
if (objects.length !== 1) fail(`expected exactly 1 origin entry, got ${objects.length}`);
const o = objects[0];
if (o.id !== "oneflow-modal-compose-overlay" || o.origin !== "https://github.com/phanlemanh")
  fail(`unexpected origin entry: ${JSON.stringify(o)}`);
console.log("OK: 38 plain strings under default org + 1 origin entry (compose-overlay)");
'
