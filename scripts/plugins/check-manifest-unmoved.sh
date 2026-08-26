#!/usr/bin/env bash
# E7 / AC-6 (per-plugin-origin) snapshot, THIRD edition.
#
# First edition froze "38 plain strings" to prove the origin capability moved no
# plugin. Second edition (2026-08-03, compose-overlay AC-14 amendment, Gate-1
# re-approved) allowed exactly ONE origin entry. Third edition (2026-08-06,
# local-cpu-plugins AC-14/AC-15) records ADR-0011's first two moves: ffmpeg and
# pyscenedetect left the upstream org for local plugins under phanlemanh.
#
# FOURTH edition (2026-08-26): normalize-text-vi was registered as a fourth
# origin entry and then WITHDRAWN in the same feature, because the repository it
# named — phanlemanh/oneflow-api-normalize-text-vi — does not exist publicly, so
# the plugin could not be installed anywhere but the machine that wrote it.
# The invariant is again: 36 plain strings under the default org + exactly THREE
# origin entries, all under phanlemanh.
#
# This is a SNAPSHOT of three PRs, not a standing law. Registering a plugin, or
# writing a fourth origin entry, turns it red on purpose — edit the counts and
# the id set below, or retire the guard. Do not loosen it into a check that
# passes on anything: check-manifest-guard-teeth.sh asserts it still fails when
# the manifest is perturbed.
set -euo pipefail

manifest=config/official-plugins.json
expected_org='https://github.com/tong-io'

node -e '
const m = JSON.parse(require("fs").readFileSync("config/official-plugins.json", "utf8"));
const strings = m.plugins.filter((e) => typeof e === "string");
const objects = m.plugins.filter((e) => typeof e === "object" && e !== null);
const fail = (msg) => { console.error("FAIL: " + msg); process.exit(1); };
const ORIGIN = "https://github.com/phanlemanh";
const EXPECTED_IDS = [
  "oneflow-modal-compose-overlay",
  "oneflow-api-ffmpeg",
  "oneflow-api-pyscenedetect",
];
if (m.org !== "https://github.com/tong-io") fail(`default org is ${m.org}`);
if (strings.length !== 36) fail(`expected 36 plain string entries, got ${strings.length}`);
if (objects.length !== 3) fail(`expected exactly 3 origin entries, got ${objects.length}`);
const ids = objects.map((o) => o.id).sort();
const want = [...EXPECTED_IDS].sort();
if (JSON.stringify(ids) !== JSON.stringify(want))
  fail(`origin entry ids are ${JSON.stringify(ids)}, expected ${JSON.stringify(want)}`);
for (const o of objects) {
  if (o.origin !== ORIGIN) fail(`unexpected origin on ${o.id}: ${o.origin}`);
}
console.log("OK: 36 plain strings under default org + 3 origin entries (" + ids.join(", ") + ")");
'
