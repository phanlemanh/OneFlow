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
# HAI NỬA, vì AC-10 nói "phân giải VÀ chạy":
#   (a) khai báo — package.json khai alias đó, và file nó trỏ tới có thật;
#   (b) thực thi — mỗi alias được viện dẫn thật sự CHẠY QUA pnpm và thoát 0.
# Vòng verify 1 chỉ có nửa (a): một alias trỏ đúng file nhưng chết ngay khi chạy
# (thiếu quyền, shebang hỏng, pnpm không phân giải được tên) vẫn qua sạch.
#
# Alias của CHÍNH script này bị loại khỏi nửa (b) — chạy nó ở đây là đệ quy vô
# hạn, cùng lý do case-isolation phải loại chính nó.
#
# Run from the repo root: `pnpm roadmap:check-alias`. Exits non-zero on a lie.
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "→ kiểm mọi lệnh \`pnpm roadmap:*\` được viện dẫn đều có thật"

ALIAS_LIST="$(mktemp)"
trap 'rm -f "$ALIAS_LIST"' EXIT
export ALIAS_LIST

node - <<'NODE'
const { readFileSync, readdirSync, existsSync, statSync, writeFileSync } = require("node:fs");
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
    // Nửa (b) chạy ở lớp bash bên dưới cần đúng danh sách này.
    writeFileSync(process.env.ALIAS_LIST, [...cited.keys()].sort().join("\n") + "\n");
    console.log(`✅ ${cited.size} lệnh được viện dẫn, tất cả đều được khai và trỏ đúng file.`);
    process.exit(0);
}
console.error(`\n❌ ${failures.length} lệnh được viện dẫn mà không tồn tại:\n`);
for (const f of failures) console.error(`  ${f}`);
console.error("\nKhai script trong package.json, hoặc sửa chỗ viện dẫn — đừng sửa guard.");
process.exit(1);
NODE

# --- (b) thực thi: alias phải CHẠY được, không chỉ được khai -----------------
self_alias=""
while IFS= read -r name; do
  [ -n "$name" ] || continue
  cmd=$(node -e 'const s=require("./package.json").scripts||{};process.stdout.write(s[process.argv[1]]||"")' "$name")
  case "$cmd" in *check-roadmap-alias-cited.sh*) self_alias="$name"; continue ;; esac
done < "$ALIAS_LIST"

echo "→ nửa (b): chạy thật qua pnpm (bỏ qua \`$self_alias\` — đệ quy)"
run_fail=0
while IFS= read -r name; do
  [ -n "$name" ] || continue
  [ "$name" = "$self_alias" ] && continue
  if pnpm "$name" >/dev/null 2>&1; then
    echo "   ✓ pnpm $name chạy tới cùng, exit 0"
  else
    echo "   ✗ pnpm $name được khai nhưng CHẠY HỎNG (exit khác 0)" >&2
    run_fail=$((run_fail + 1))
  fi
done < "$ALIAS_LIST"

if [ "$run_fail" -ne 0 ]; then
  echo "" >&2
  echo "❌ $run_fail alias được khai mà chạy không tới cùng." >&2
  exit 1
fi
echo "✅ mọi alias được viện dẫn đều khai đúng VÀ chạy được."
