#!/usr/bin/env node
// Roadmap drift detector — see check-roadmap-fresh.sh for why this exists.
//
// Three questions, each answerable by machine, each corresponding to a way
// docs/roadmap.md silently went stale between 2026-08-05 and 2026-08-19:
//
//   A. ADR coverage      — an ADR exists that the roadmap never mentions.
//                          (ADR-0011 flipped the execution substrate on 05/08
//                          and the roadmap did not know for two weeks.)
//   B. Superseded citation — a block cites an ADR that a later ADR replaced,
//                          without naming the replacement in the same block.
//                          (Phase 2 item 1 cited ADR-0005 alone.)
//   C. Ledger coverage   — a contract reached `status: signed-off` without
//                          anyone classifying where it sits on the roadmap.
//
// Supersede relations are read from the docs/adr/README.md table, which is
// already the hand-maintained index; this guard adds no second source of truth.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROADMAP = "docs/roadmap.md";
const ADR_DIR = "docs/adr";
const ACCEPTANCE_DIR = "_acceptance";

const failures = [];
const fail = (check, msg) => failures.push({ check, msg });

const read = (p) => readFileSync(p, "utf8");
const roadmap = read(ROADMAP);

// --- Split the roadmap into citation blocks -------------------------------
// A block is a paragraph, a single list item, a single table row, or a heading.
// Per-line would be wrong (markdown wraps mid-sentence); whole-section would be
// too coarse to notice a stale citation sitting next to a fresh one.
function blocks(text) {
    const out = [];
    let cur = [];
    const flush = () => {
        if (cur.length) out.push(cur.join("\n"));
        cur = [];
    };
    for (const line of text.split("\n")) {
        const startsUnit =
            /^\s*([-*+]|\d+\.)\s/.test(line) ||
            /^\s*\|/.test(line) ||
            /^#{1,6}\s/.test(line);
        if (line.trim() === "") flush();
        else if (startsUnit) {
            flush();
            cur.push(line);
        } else cur.push(line);
    }
    flush();
    return out;
}

const adrsIn = (s) =>
    new Set((s.match(/ADR-(\d{4})/g) || []).map((m) => m.slice(4)));

// --- A. every ADR is mentioned somewhere ----------------------------------
const adrFiles = readdirSync(ADR_DIR)
    .filter((f) => /^\d{4}-.*\.md$/.test(f))
    .sort();
const allAdrIds = adrFiles.map((f) => f.slice(0, 4));
const citedAnywhere = adrsIn(roadmap);
for (const id of allAdrIds) {
    if (!citedAnywhere.has(id)) {
        const title = read(join(ADR_DIR, adrFiles[allAdrIds.indexOf(id)]))
            .split("\n")[0]
            .replace(/^#\s*/, "");
        fail(
            "A/adr-coverage",
            `ADR-${id} không được nhắc lần nào trong ${ROADMAP} — "${title}"`,
        );
    }
}

// --- B. superseded ADRs must be cited alongside their replacement ----------
// Parse "thay thế"/"supersede" relations out of the ADR index table.
const supersededBy = new Map(); // old id -> [new ids]
for (const row of read(join(ADR_DIR, "README.md")).split("\n")) {
    if (!row.trim().startsWith("|")) continue;
    const own = row.match(/\[(\d{4})\]\(/);
    if (!own) continue;
    if (!/thay thế|supersede/i.test(row)) continue;
    for (const m of row.matchAll(/ADR-(\d{4})/g)) {
        const old = m[1];
        if (old === own[1]) continue;
        if (!supersededBy.has(old)) supersededBy.set(old, []);
        supersededBy.get(old).push(own[1]);
    }
}

for (const block of blocks(roadmap)) {
    const cited = adrsIn(block);
    for (const old of cited) {
        const heirs = supersededBy.get(old);
        if (!heirs) continue;
        if (heirs.some((h) => cited.has(h))) continue;
        const excerpt = block.replace(/\s+/g, " ").slice(0, 110);
        fail(
            "B/superseded-citation",
            `viện dẫn ADR-${old} (đã bị ADR-${heirs.join("/")} thay thế) mà không nhắc ADR thay nó: "${excerpt}…"`,
        );
    }
}

// --- C. every signed-off contract is classified in the ledger --------------
const ledger = roadmap.match(
    /<!--\s*roadmap-ledger:start\s*-->([\s\S]*?)<!--\s*roadmap-ledger:end\s*-->/,
);
if (!ledger) {
    fail(
        "C/ledger",
        `không tìm thấy khối roadmap-ledger:start/end trong ${ROADMAP}`,
    );
} else {
    const inLedger = new Set(
        [...ledger[1].matchAll(/`([a-z0-9][a-z0-9-]*)`/g)].map((m) => m[1]),
    );
    const signed = readdirSync(ACCEPTANCE_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .filter((slug) => {
            try {
                return /^status:\s*signed-off\s*$/m.test(
                    read(join(ACCEPTANCE_DIR, slug, "contract.md")),
                );
            } catch {
                return false;
            }
        })
        .sort();

    for (const slug of signed)
        if (!inLedger.has(slug))
            fail(
                "C/ledger",
                `\`${slug}\` đã ký nhưng chưa được phân loại trong sổ cái`,
            );

    for (const slug of inLedger)
        if (!signed.includes(slug))
            fail(
                "C/ledger",
                `sổ cái còn dòng \`${slug}\` nhưng hồ sơ đó không còn ở trạng thái ký`,
            );

    console.log(
        `   sổ cái: ${signed.length} hạng mục đã ký, ${inLedger.size} dòng trong sổ`,
    );
}

// --- report ----------------------------------------------------------------
if (failures.length === 0) {
    console.log(
        `✅ ${ROADMAP} khớp với docs/adr/ và _acceptance/ — không có trôi.`,
    );
    process.exit(0);
}
console.error(`\n❌ roadmap drift — ${failures.length} phát hiện:\n`);
for (const { check, msg } of failures) console.error(`  [${check}] ${msg}`);
console.error(`\nSửa ${ROADMAP} (không sửa guard) rồi chạy lại.`);
process.exit(1);
