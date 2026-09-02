#!/usr/bin/env bash
# Live documentation must agree with config/official-plugins.json.
#
# CLAUDE.md says of the three READMEs: "The READMEs are hand-maintained and
# silently drift." Nothing enforced that until this guard. Three modes, one per
# shape of drift, each derived from the manifest rather than from a hardcoded
# expectation, so the guard keeps working for the next fork:
#
#   readme   the three READMEs list exactly the manifest's plugin set, and every
#            entry's GitHub org matches its manifest entry SHAPE -- a plain
#            string belongs to the default org, an object belongs to the org in
#            its own `origin`. Both halves are load-bearing: the object half is
#            the whole reason forks exist, and a guard that skipped it would stay
#            green while a fork's README line pointed back at the upstream org.
#
#   claude   the backticked plugin ids in CLAUDE.md's manifest-guard bullet are
#            exactly the manifest's `origin` ids. CLAUDE.md writes ids in
#            backticks, NOT in the READMEs' link shape, so it needs its own
#            extractor. Reusing the README regex here would extract zero ids and
#            exit 0 over an empty set -- green on nothing measured.
#
#   orphans  a public/plugins/*.svg whose stem is not a manifest id must not GROW
#            against a base ref. Four such files already exist on origin/main;
#            demanding zero would turn CI red over pre-existing debt that belongs
#            to nobody's current change.
#
# Every mode prints the counts it worked from. A printed count is the only thing
# that separates "scanned and found nothing wrong" from "scanned nothing".

set -euo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
MODE="${1:-}"
BASE="${2:-origin/main}"

READMES="README.md docs/README_ZH.md docs/README_JA.md"

case "$MODE" in
readme|claude) [ "$#" -le 1 ] || { echo "FAIL: mode $MODE nhan dung 1 doi so, thua: ${*:2}" >&2; exit 2; } ;;
orphans)       [ "$#" -le 2 ] || { echo "FAIL: mode orphans nhan toi da 2 doi so, thua: ${*:3}" >&2; exit 2; } ;;
*) echo "usage: $(basename "$0") readme|claude|orphans [base-ref]" >&2; exit 2 ;;
esac
# Rejecting extra arguments is not pedantry. check-gate-guards-job.sh appends a junk
# flag to every extracted command and requires the command to refuse it -- otherwise
# its green half cannot tell "the guard caught the drift" from "any command is
# broken". A guard that silently ignores a typo'd flag is a guard whose green means
# nothing.

if [ "$MODE" = orphans ]; then
    cd "$ROOT"
    base_list=$(git show "$BASE:config/official-plugins.json" 2>/dev/null || echo '')
    [ -n "$base_list" ] || { echo "FAIL: cannot read config/official-plugins.json at $BASE" >&2; exit 1; }
    base_svgs=$(git ls-tree --name-only "$BASE" public/plugins/ 2>/dev/null || echo '')
    head_svgs=$(ls public/plugins/*.svg 2>/dev/null || echo '')
    BASE_JSON="$base_list" BASE_SVGS="$base_svgs" HEAD_SVGS="$head_svgs" node -e '
        const ids = j => new Set(JSON.parse(j).plugins.map(e => typeof e === "string" ? e : e.id));
        const stems = s => s.split("\n").map(p => p.trim()).filter(p => p.endsWith(".svg"))
            .map(p => p.replace(/^.*\//, "").replace(/\.svg$/, ""));
        const baseIds = ids(process.env.BASE_JSON);
        const headIds = ids(require("fs").readFileSync("config/official-plugins.json", "utf8"));
        const baseOrphans = stems(process.env.BASE_SVGS).filter(s => !baseIds.has(s));
        const headOrphans = stems(process.env.HEAD_SVGS).filter(s => !headIds.has(s));
        const added = headOrphans.filter(s => !baseOrphans.includes(s));
        console.log(`public/plugins: base ${baseOrphans.length} orphan · HEAD ${headOrphans.length} orphan · added ${added.length}`);
        if (added.length) {
            console.error(`FAIL: this branch adds ${added.length} orphan icon(s) — no manifest entry claims them: ${added.join(", ")}`);
            process.exit(1);
        }
        console.log(`OK: no new orphan icon against ${process.argv[1]}`);
    ' "$BASE"
    exit 0
fi

cd "$ROOT"

if [ "$MODE" = claude ]; then
    node -e '
        const fs = require("fs");
        const m = JSON.parse(fs.readFileSync("config/official-plugins.json", "utf8"));
        const originIds = m.plugins.filter(e => typeof e !== "string").map(e => e.id).sort();
        const doc = fs.readFileSync("CLAUDE.md", "utf8");
        // The bullet that talks about the manifest guard. More than one line now
        // mentions that script by name, so the anchor is the pair: names the
        // guard AND carries at least one backticked plugin id. Matching on the
        // name alone would silently read whichever prose line came first.
        const ID = /`((?:one|tong)flow-(?:modal|api)-[a-z0-9-]+)`/g;
        const hits = doc.split("\n").filter(l =>
            l.includes("check-manifest-unmoved") && new RegExp(ID.source).test(l));
        if (hits.length === 0) {
            console.error("FAIL: CLAUDE.md has no bullet that both names check-manifest-unmoved and lists plugin ids");
            process.exit(1);
        }
        if (hits.length > 1) {
            console.error(`FAIL: ${hits.length} CLAUDE.md lines name check-manifest-unmoved and list plugin ids — the anchor is ambiguous`);
            process.exit(1);
        }
        const line = hits[0];
        // Backtick shape, NOT the READMEs link shape. Reusing that regex here
        // would match nothing and pass over an empty set.
        const found = [...line.matchAll(/`((?:one|tong)flow-(?:modal|api)-[a-z0-9-]+)`/g)].map(x => x[1]).sort();
        console.log(`CLAUDE.md: ${found.length} id extracted · manifest origin entries: ${originIds.length}`);
        const missing = originIds.filter(i => !found.includes(i));
        const extra = found.filter(i => !originIds.includes(i));
        if (missing.length) { console.error(`FAIL: CLAUDE.md omits origin id(s): ${missing.join(", ")}`); process.exit(1); }
        if (extra.length) { console.error(`FAIL: CLAUDE.md names id(s) the manifest has no origin entry for: ${extra.join(", ")}`); process.exit(1); }
        console.log(`OK: CLAUDE.md lists exactly the ${originIds.length} origin ids — ${originIds.join(", ")}`);
    '
    exit 0
fi

READMES="$READMES" node -e '
    const fs = require("fs");
    const m = JSON.parse(fs.readFileSync("config/official-plugins.json", "utf8"));
    const orgOf = u => u.replace(/\/+$/, "").split("/").pop();
    const want = new Map(m.plugins.map(e =>
        typeof e === "string" ? [e, orgOf(m.org)] : [e.id, orgOf(e.origin)]));
    let bad = 0;
    for (const file of process.env.READMES.split(/\s+/)) {
        const text = fs.readFileSync(file, "utf8");
        const rows = [...text.matchAll(
            /^- \[((?:one|tong)flow-(?:modal|api)-[a-z0-9-]+)\]\(https:\/\/github\.com\/([^\/]+)\/([a-z0-9-]+)\)/gm)];
        // Do NOT build a Map keyed by id. That silently keeps the LAST row for a
        // repeated plugin and drops the earlier one, so a README listing the same
        // plugin twice -- second row correct, first row pointing at the wrong org --
        // passes. That is the guard lying about the very thing it guards.
        //
        // But a repeat is NOT itself an error: measured 2026-09-01, each README
        // legitimately names three plugins twice, once in the Official-plugins
        // catalogue and once in the Quickstart install example. Banning repeats
        // would turn CI red on correct documentation.
        //
        // So: keep EVERY row, check the org on EVERY row, and compare id SETS.
        const seen = new Map();
        for (const r of rows) {
            const [, id, org, repo] = r;
            // Record the row BEFORE any early exit: the extra-id pass below reads
            // `seen`, so skipping an unknown id here makes that pass blind to it.
            if (!seen.has(id)) seen.set(id, { org, repo });
            const want_org = want.get(id);
            if (want_org === undefined) continue;      // reported by the extra-id pass
            if (org !== want_org)
                { console.error(`FAIL: ${file} points \`${id}\` at org \`${org}\`; the manifest puts it under \`${want_org}\``); bad++; }
            if (repo !== id)
                { console.error(`FAIL: ${file} links \`${id}\` to repository \`${repo}\``); bad++; }
        }
        for (const id of want.keys())
            if (!seen.has(id)) { console.error(`FAIL: ${file} does not list \`${id}\`, which the manifest registers`); bad++; }
        for (const id of seen.keys())
            if (!want.has(id)) { console.error(`FAIL: ${file} lists \`${id}\`, which is not in the manifest`); bad++; }
    }
    if (bad) { console.error(`FAIL: ${bad} mismatch(es) between the READMEs and the manifest`); process.exit(1); }
    console.log(`OK: 3 READMEs each list exactly the ${want.size} plugins the manifest registers, every org matching its entry shape`);
'
