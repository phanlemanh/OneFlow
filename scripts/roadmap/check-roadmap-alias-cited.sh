#!/usr/bin/env bash
# Every `pnpm roadmap:<name>` this repo tells a reader to run must actually
# exist (AC-10).
#
# Not hypothetical. `ce91889` shipped a commit titled
# "drift guard — pnpm roadmap:check / roadmap:teeth", both script headers said
# "Run from the repo root: `pnpm roadmap:check`", and
# docs/assets/oneflow-roadmap-status.html told readers to "đối chiếu máy bằng
# pnpm roadmap:check" — for eight days, while package.json declared neither
# alias. Four places described the state the author INTENDED, not the state that
# existed, and no guard in the repo could see the difference: commit messages
# and comments are prose to every other check here.
#
# So this one reads the prose. Scan scripts/roadmap/ and docs/ for the string
# readers are told to type, then assert package.json declares it AND the file it
# points at exists on disk.
#
# Run from the repo root: `pnpm roadmap:check-alias`. Exits non-zero on a lie.
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "→ kiểm mọi lệnh \`pnpm roadmap:*\` được viện dẫn đều có thật"

node - <<'NODE'
const { readFileSync, readdirSync, existsSync, statSync } = require("node:fs");
const { join } = require("node:path");

// Where a reader could be told to run something. Directories, not a hardcoded
// file list: a citation added to a new docs page must be covered the day it
// lands, not the day someone remembers to extend this guard.
const SCAN_DIRS = ["scripts/roadmap", "docs"];
const TEXT = /\.(sh|mjs|js|cjs|md|html|ya?ml|json|txt)$/i;

const walk = (dir, out = []) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (TEXT.test(e.name)) out.push(p);
    }
    return out;
};

const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts || {};
const failures = [];
const cited = new Map(); // script name -> [files citing it]

for (const dir of SCAN_DIRS) {
    if (!existsSync(dir)) continue;
    for (const file of walk(dir)) {
        const text = readFileSync(file, "utf8");
        for (const m of text.matchAll(/pnpm\s+(roadmap:[a-z0-9][a-z0-9:-]*)/g)) {
            if (!cited.has(m[1])) cited.set(m[1], []);
            if (!cited.get(m[1]).includes(file)) cited.get(m[1]).push(file);
        }
    }
}

if (cited.size === 0) {
    console.log("   không nơi nào viện dẫn `pnpm roadmap:*` — không có gì để kiểm.");
    process.exit(0);
}

for (const [name, files] of [...cited].sort()) {
    const cmd = scripts[name];
    if (!cmd) {
        failures.push(
            `\`pnpm ${name}\` được viện dẫn ở ${files.join(", ")} nhưng package.json KHÔNG khai script \`${name}\``,
        );
        continue;
    }
    // The alias exists; now make sure it does not point at a file that is gone.
    for (const tok of cmd.split(/\s+/)) {
        if (!/^scripts\//.test(tok)) continue;
        if (!existsSync(tok) || !statSync(tok).isFile())
            failures.push(`\`pnpm ${name}\` trỏ tới \`${tok}\` — file không tồn tại`);
    }
    console.log(`   ✓ pnpm ${name} → ${cmd}  (viện dẫn ở ${files.length} chỗ)`);
}

if (failures.length === 0) {
    console.log(`✅ ${cited.size} lệnh được viện dẫn, tất cả đều có thật.`);
    process.exit(0);
}
console.error(`\n❌ ${failures.length} lệnh được viện dẫn mà không tồn tại:\n`);
for (const f of failures) console.error(`  ${f}`);
console.error("\nKhai script trong package.json, hoặc sửa chỗ viện dẫn — đừng sửa guard.");
process.exit(1);
NODE
