#!/usr/bin/env node
// Asserts PRODUCT-MAP.md still matches the dossiers under _acceptance/.
//
// Why this exists: `product-map.mjs --check` had ZERO references in
// .github/workflows/ci.yml (measured 31/08), so it only ran when somebody typed
// it. The map drifted by four slugs — it advertised 22 delivered items while 26
// dossiers were signed — and nobody knew.
//
// NODE BUILTINS ONLY. The `acceptance-gate` job in .github/workflows/ci.yml has
// no `pnpm install` step, so node_modules does not exist when this runs.
// scripts/roadmap/roadmap-drift.mjs is the precedent for hand-rolled parsing.
//
// This ASSERTS an invariant rather than regenerating and diffing (the shape
// `gen_abi_clean` uses for generated TypeScript), because the generator lives in
// a plugin cache a clean CI runner does not have. Vendoring it would freeze a
// copy that then drifts into a fork, leaving two different rulers for one thing.
// Deliberate deviation from the repo's own pattern — see the design doc §4.
//
// Run from the repo root: `node scripts/ci/check-product-map.mjs`.
// Its teeth are proven separately by check-product-map-teeth.sh.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MAP = "PRODUCT-MAP.md";
const ACCEPTANCE_DIR = "_acceptance";

// The closed set of contract states. A value outside it is NOT quietly treated
// as "some other status" — see classifyDossiers.
const STATUS_CLOSED = new Set([
    "draft",
    "approved",
    "implemented",
    "verified",
    "machine-cleared",
    "signed-off",
]);

// Takes no arguments, and REFUSES the ones it does not know rather than ignoring
// them. A checker that swallows an unknown flag and exits 0 cannot be told apart
// from a checker that ran, so a typo in the ci.yml `run:` line would read as a
// clean check forever — the same fail-open this file exists to close.
if (process.argv.length > 2) {
    console.error(
        `check-product-map: không nhận tham số nào — nhận được: ${process.argv.slice(2).join(" ")}`,
    );
    process.exit(2);
}

const failures = [];
const fail = (rule, msg) => failures.push(`FAIL ${rule}: ${msg}`);
const read = (p) => readFileSync(p, "utf8");

function report() {
    if (failures.length === 0) return;
    for (const f of failures) console.error(f);
    console.error(
        `\n❌ ${MAP} không khớp với ${ACCEPTANCE_DIR}/ — ${failures.length} chỗ lệch.`,
    );
    process.exit(1);
}

// --- read the map, fail-closed ---------------------------------------------
// A checker that cannot find what it came to check has checked nothing. Exiting
// 0 here would be a lie worse than silence, so a missing artifact stops the run
// immediately rather than letting the assertions below read an empty string and
// find nothing wrong with it.
let map;
try {
    map = read(MAP);
} catch (err) {
    fail("bản đồ", `không đọc được ${MAP} (${err.code ?? "lỗi"})`);
    report();
    process.exit(1);
}

/**
 * The `(`slug`)` tokens inside a `## <heading>` section, in document order.
 * Returns null when the heading itself is absent — distinct from an empty
 * section, which is a legitimate state the map renders as "chưa có".
 */
function blockItems(heading) {
    // Line-based rather than one regex. The regex form used `\z` for end-of-
    // input, which JavaScript does not have: it degrades to a literal `z`, so
    // the section silently ended at the first word containing one and the
    // checker read 10 of 27 rows while still exiting non-zero — a broken
    // checker that looks like a working one.
    const lines = map.split("\n");
    const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
    if (start === -1) return null;
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
        if (lines[i].startsWith("## ")) {
            end = i;
            break;
        }
    }
    return lines
        .slice(start + 1, end)
        .flatMap((l) =>
            [...l.matchAll(/\(`([a-z0-9][a-z0-9-]*)`\)/g)].map((x) => x[1]),
        );
}

/**
 * The number inside a mermaid node label, e.g. `Đã giao<br/>27 việc`.
 * An empty bucket renders `chưa có` rather than `0 việc`, so that form maps to
 * 0 — treating it as unparsable would make every empty bucket a false alarm.
 * Returns null when neither form is present, which IS a real failure.
 */
function mermaidCount(label) {
    const withNumber = map.match(new RegExp(`${label}<br/>(\\d+)\\s*việc`));
    if (withNumber) return Number(withNumber[1]);
    if (new RegExp(`${label}<br/>chưa có`).test(map)) return 0;
    return null;
}

/**
 * Every directory under _acceptance/ lands in exactly one closed bucket:
 * signed · signed-but-awaiting-UAT · in progress · awaiting scope approval ·
 * opportunity-only · parked · NOT CLASSIFIABLE.
 *
 * The last bucket is red BY NAME, never a silent skip. Without it a dossier
 * whose frontmatter is off by a quote (`status: "signed-off"`) or a capital
 * (`Signed-off`), or whose YAML is broken, gets binned as "not signed": it drops
 * out of the must-appear set, the counts still balance, and the whole checker
 * goes green while the map is missing exactly that dossier. That is a fail-OPEN
 * sitting inside a checker sold as fail-closed.
 */
// The generator files a dossier by CONTRACT STATUS first, and only falls back to
// the opportunity's stage/decision when there is no contract. Read the same two
// fields here or the two sides disagree about every parked or awaiting-UAT item
// (measured 2026-09-04: regenerating with kit 2.8.0 turned this checker red on a
// dossier neither side had got wrong).
function opportunityDecision(slug) {
    let text;
    try {
        text = read(join(ACCEPTANCE_DIR, slug, "opportunity.md"));
    } catch {
        return null;
    }
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) return "";
    const m = fm[1].match(/^decision:[ \t]*(.*)$/m);
    return m ? m[1].trim() : "";
}

function classifyDossiers() {
    const out = {
        signed: [],
        awaitingUat: [],
        inProgress: [],
        opportunity: [],
        parked: [],
        other: [],
        unclassified: [],
    };
    for (const d of readdirSync(ACCEPTANCE_DIR, { withFileTypes: true })) {
        if (!d.isDirectory()) continue;
        const slug = d.name;

        let contract = null;
        try {
            contract = read(join(ACCEPTANCE_DIR, slug, "contract.md"));
        } catch {
            // No contract — the directory may still be an opportunity.
        }

        if (contract === null) {
            const decision = opportunityDecision(slug);
            if (decision === null) {
                out.unclassified.push({
                    slug,
                    reason: "không có contract.md lẫn opportunity.md",
                });
            } else if (decision === "park") {
                out.parked.push(slug);
            } else {
                out.opportunity.push(slug);
            }
            continue;
        }

        const fm = contract.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!fm) {
            out.unclassified.push({
                slug,
                reason: "frontmatter không đọc được",
            });
            continue;
        }

        const m = fm[1].match(/^status:[ \t]*(.*)$/m);
        // Deliberately NOT stripping quotes or lowercasing: `"signed-off"` is a
        // typo to surface, not to normalise away. Normalising is exactly how it
        // stays invisible.
        const status = m ? m[1].trim() : "";
        if (!STATUS_CLOSED.has(status)) {
            out.unclassified.push({
                slug,
                reason: `status lạ \`${status || "(trống)"}\``,
            });
        } else if (status === "signed-off") {
            // A signed dossier that came from an opportunity still owes a UAT
            // session, so the generator parks it one bucket short of "Đã giao".
            const decision = opportunityDecision(slug);
            if (decision === "build" || decision === "iterate")
                out.awaitingUat.push(slug);
            else out.signed.push(slug);
        } else if (status === "draft") {
            out.other.push(slug);
        } else {
            // approved / implemented / verified — code is being written.
            out.inProgress.push(slug);
        }
    }
    for (const k of [
        "signed",
        "awaitingUat",
        "inProgress",
        "opportunity",
        "parked",
    ])
        out[k].sort();
    return out;
}

const dossiers = classifyDossiers();

// --- the source side must be classifiable ----------------------------------
for (const { slug, reason } of dossiers.unclassified)
    fail("nguồn", `\`${slug}\` không phân loại được: ${reason}`);

/**
 * One bucket, both directions, three numbers.
 *
 * The reverse direction (map -> dossiers) is not decoration: a dossier that is
 * WITHDRAWN leaves its row behind, and a forward-only check stays green while
 * the map advertises work that was never delivered. This repo withdrew one for
 * real (`normalize-text-vi`, 26/08).
 */
function checkBucket({ rule, heading, node, expected }) {
    const items = blockItems(heading);
    const count = mermaidCount(node);
    // The generator omits a section whose bucket is empty (measured 04/09: the
    // map carried four headings for ten sections). Absent heading + nothing
    // expected + a mermaid node reading "chưa có" is the healthy empty state,
    // not drift. Any other combination still fails by name.
    if (items === null) {
        if (expected.length === 0 && count === 0) return;
        fail(rule, `không tìm thấy khối "## ${heading}" trong ${MAP}`);
        return;
    }
    if (count === null) {
        fail(rule, `không đọc được nút mermaid "${node}" trong ${MAP}`);
        return;
    }

    const onMap = new Set(items);
    for (const slug of expected)
        if (!onMap.has(slug))
            fail(
                rule,
                `\`${slug}\` có hồ sơ nhưng vắng trên bản đồ (${heading})`,
            );

    const known = new Set(expected);
    for (const slug of items)
        if (!known.has(slug))
            fail(
                rule,
                `bản đồ còn mục \`${slug}\` ở "${heading}" nhưng không có hồ sơ nào ở trạng thái đó`,
            );

    // All three counts in ONE assertion. Naming a single number tells the reader
    // neither how far off the map is nor in which direction.
    if (!(expected.length === items.length && items.length === count))
        fail(
            rule,
            `${heading} lệch: ${expected.length} hồ sơ, ${items.length} mục trên bản đồ, nút mermaid ${count}`,
        );
}

checkBucket({
    rule: "đã giao",
    heading: "Đã giao",
    node: "Đã giao",
    expected: dossiers.signed,
});
checkBucket({
    rule: "cân nhắc cơ hội",
    heading: "Đang cân nhắc cơ hội",
    node: "Đang cân nhắc cơ hội",
    expected: dossiers.opportunity,
});
checkBucket({
    rule: "chờ phiên nghiệm thu",
    heading: "Đã giao — chờ phiên nghiệm thu",
    node: "Chờ phiên nghiệm thu",
    expected: dossiers.awaitingUat,
});
checkBucket({
    rule: "đang làm",
    heading: "Đang làm",
    node: "Đang làm",
    expected: dossiers.inProgress,
});
checkBucket({
    rule: "xếp lại sau",
    heading: "Xếp lại sau",
    node: "Xếp lại sau",
    expected: dossiers.parked,
});

// --- report ----------------------------------------------------------------
report();

const delivered = blockItems("Đã giao") ?? [];
const opportunities = blockItems("Đang cân nhắc cơ hội") ?? [];
console.log(
    `   đã giao: ${dossiers.signed.length} hồ sơ ký, ${delivered.length} mục trên bản đồ, nút mermaid ${mermaidCount("Đã giao")}`,
);
console.log(
    `   cơ hội: ${dossiers.opportunity.length} hồ sơ, ${opportunities.length} mục trên bản đồ, nút mermaid ${mermaidCount("Đang cân nhắc cơ hội")}`,
);
console.log(
    `   chờ phiên nghiệm thu: ${dossiers.awaitingUat.length} · đang làm: ${dossiers.inProgress.length} · xếp lại sau: ${dossiers.parked.length} · chờ duyệt phạm vi: ${dossiers.other.length}`,
);
console.log(`✅ ${MAP} khớp với ${ACCEPTANCE_DIR}/ — không có trôi.`);
