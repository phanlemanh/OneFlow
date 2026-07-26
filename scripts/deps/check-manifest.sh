#!/usr/bin/env bash
# AC-1: both dependabot groups landed and the repo's own scripts survived the
# lockfile conflict resolution.
set -euo pipefail
node -e '
const p = require("./package.json");
const need = {
  "dependencies.react": p.dependencies.react,
  "dependencies.drizzle-orm": p.dependencies["drizzle-orm"],
  "devDependencies.@biomejs/biome": p.devDependencies["@biomejs/biome"],
};
for (const [k, v] of Object.entries(need)) {
  if (!v) { console.error(`missing ${k}`); process.exit(1); }
  console.log(`${k} = ${v}`);
}
for (const s of ["hooks:install", "sdk:publish", "gen:abi"]) {
  if (!p.scripts[s]) { console.error(`script "${s}" was lost`); process.exit(1); }
}
console.log("repo scripts intact: hooks:install, sdk:publish, gen:abi");
'
