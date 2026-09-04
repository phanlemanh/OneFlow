#!/usr/bin/env node
// Plan-freeze guard — teeth for the freeze rule docs/roadmap.md declares about
// itself (design: docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md §5).
//
// Reads the block between <!-- plan-freeze:start --> and <!-- plan-freeze:end -->
// plus every _acceptance/<slug>/{contract,opportunity}.md, and answers:
//   F0  block unreadable                        -> fail-closed
//   F1  a working-state dossier outside the plan (only while frozen)
//   F2  a ✅ row whose backing is not signed (contract, or an opportunity's Cổng Đáng)
//   F3  a parked slug whose opportunity.md is not decision: park
//   F4  an exception row without one of the three named reasons
// Always prints the ratio line; prints GỠ BĂNG when every ★ row is ✅ and
// >= 85% of all rows (plan + exceptions) are done. The checkpoint date only
// yields a NOTE — the machine reminds, a human decides.
//
// Node builtins only: the Acceptance Gate job has no node_modules.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Refuse arguments. The CI teeth mode appends a junk flag to every guard command
// and requires a non-zero exit; a guard that swallows flags cannot be told apart
// from one that ran.
if (process.argv.length > 2) {
    console.error(
        `check-plan-freeze: không nhận tham số nào — nhận được: ${process.argv.slice(2).join(" ")}`,
    );
    process.exit(2);
}

const ROOT = process.env.PLAN_FREEZE_ROOT || ".";
const TODAY =
    process.env.PLAN_FREEZE_TODAY || new Date().toISOString().slice(0, 10);
const ROADMAP = join(ROOT, "docs", "roadmap.md");
const ACCEPTANCE_DIR = join(ROOT, "_acceptance");

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const STATES = new Set(["⬜", "◐", "✅"]);
const REASONS = new Set(["mất-dữ-liệu", "bảo-mật", "chặn-★"]);
const REQUIRED_HEADER = ["plan", "opened", "unlock", "checkpoint"];
const UNLOCK_RATIO = 0.85;
const PARK_LABEL = "**Xếp lại sau**";
const EXC_LABEL = "**Ngoại lệ mở giữa lúc băng**";
// A slug-less plan row may delegate its ✅ to an opportunity's Cổng Đáng.
const OPP_CHECK = /kiểm:\s*opportunity:([a-z0-9][a-z0-9-]*)/;

const failures = [];
const notes = [];
const fail = (code, msg) =>
    failures.push(`VIOLATION [plan-freeze] ${code}: ${msg}`);
function die(msg) {
    console.error(
        `VIOLATION [plan-freeze] F0: khối kế hoạch không đọc được: ${msg}`,
    );
    process.exit(1);
}

// --- read the block --------------------------------------------------------
let roadmap;
try {
    roadmap = readFileSync(ROADMAP, "utf8");
} catch {
    die(`không đọc được ${ROADMAP}`);
}
const block = roadmap.match(
    /<!--\s*plan-freeze:start\s*-->([\s\S]*?)<!--\s*plan-freeze:end\s*-->/,
);
if (!block) die("thiếu marker plan-freeze:start hoặc plan-freeze:end");
const lines = block[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
if (lines.length === 0) die("khối rỗng");

const header = {};
for (const part of lines[0].split("·")) {
    const i = part.indexOf(":");
    if (i < 0) die(`dòng header sai dạng ở "${part.trim()}"`);
    header[part.slice(0, i).trim()] = part.slice(i + 1).trim();
}
for (const k of REQUIRED_HEADER)
    if (!header[k]) die(`header thiếu khoá "${k}"`);
if (header.closed) {
    console.log(
        `NOTE [plan-freeze] kế hoạch ${header.plan} đã đóng ${header.closed} — không kiểm nữa`,
    );
    process.exit(0);
}

const parkAt = lines.indexOf(PARK_LABEL);
const excAt = lines.indexOf(EXC_LABEL);
if (parkAt < 0 || excAt < 0 || excAt < parkAt)
    die(`thiếu hoặc sai thứ tự nhãn ${PARK_LABEL} / ${EXC_LABEL}`);

// A table is header row + separator + data rows; every data row must have
// exactly `cols` cells. A `|` inside a cell would shift columns — refused.
function table(section, cols, name) {
    const rows = section.filter((l) => l.startsWith("|"));
    if (rows.length < 2) die(`bảng ${name} thiếu dòng tiêu đề hoặc dòng ngăn`);
    return rows.slice(2).map((r, i) => {
        const cells = r
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((c) => c.trim());
        if (cells.length !== cols)
            die(
                `bảng ${name} dòng ${i + 1} có ${cells.length} cột, cần ${cols}`,
            );
        return cells;
    });
}
const mainRows = table(lines.slice(1, parkAt), 6, "kế hoạch");
const parkRows = table(lines.slice(parkAt + 1, excAt), 3, "Xếp lại sau");
const excRows = table(lines.slice(excAt + 1), 4, "Ngoại lệ");

const rows = mainRows.map(([id, star, item, slug, state, note]) => {
    if (!id) die("một dòng kế hoạch thiếu mã #");
    if (star !== "" && star !== "★")
        die(`dòng ${id}: cột ★ chỉ nhận ★ hoặc rỗng`);
    if (slug !== "—" && !SLUG_RE.test(slug))
        die(`dòng ${id}: slug "${slug}" sai dạng`);
    if (!STATES.has(state))
        die(`dòng ${id}: trạng thái "${state}" ngoài ⬜ ◐ ✅`);
    return {
        id,
        star: star === "★",
        item,
        slug: slug === "—" ? null : slug,
        state,
        note,
    };
});

// --- read the dossiers -----------------------------------------------------
// Body of one `## ` section, cut by lines. A regex with `/m` cannot do this:
// `$` then matches end-of-LINE, so a lazy quantifier stops at the first newline
// and the section comes back empty — the guard's own teeth caught that on
// 2026-09-04, and an empty section reads exactly like "no proposals left".
function sectionBody(text, headRe) {
    const lines = text.split("\n");
    const i = lines.findIndex((l) => headRe.test(l));
    if (i < 0) return "";
    const j = lines.findIndex((l, k) => k > i && /^##\s/.test(l));
    return lines.slice(i + 1, j < 0 ? lines.length : j).join("\n");
}

// Frontmatter fields, plus one fact about the BODY: whether any threshold is
// still marked `[đề xuất]`. Cổng Đáng has two halves — strike the proposals and
// sign the fields — so reading only the frontmatter would accept a signature
// over thresholds nobody agreed to.
function frontmatter(path) {
    if (!existsSync(path)) return null;
    const text = readFileSync(path, "utf8");
    // `[đề xuất]` counts ONLY inside the threshold section. The Cổng 0 section of
    // the kit's opportunity template literally instructs "gỡ tiền tố [đề xuất]",
    // so scanning the whole file keeps the flag raised forever after signing.
    const out = {
        hasProposal: sectionBody(text, /^##\s+Ngưỡng/).includes("[đề xuất]"),
    };
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) return out;
    for (const l of fm[1].split("\n")) {
        const m = l.match(/^([a-z_]+):\s*(.*)$/);
        if (m) out[m[1]] = m[2].trim();
    }
    return out;
}
const dossiers = new Map();
if (existsSync(ACCEPTANCE_DIR))
    for (const d of readdirSync(ACCEPTANCE_DIR, { withFileTypes: true })) {
        if (!d.isDirectory()) continue;
        dossiers.set(d.name, {
            contract: frontmatter(join(ACCEPTANCE_DIR, d.name, "contract.md")),
            opportunity: frontmatter(
                join(ACCEPTANCE_DIR, d.name, "opportunity.md"),
            ),
        });
    }
const isSigned = (slug) =>
    dossiers.get(slug)?.contract?.status === "signed-off";

// A dossier is CLOSED only when it says so in one of these exact ways. Everything
// else — including a broken frontmatter, a capitalised `Discovery`, or a stage
// nobody has heard of — counts as OPEN and reddens F1.
//
// The first version enumerated the OPEN states instead, and that is fail-OPEN:
// three real strays (frontmatter missing its closing `---`, `stage: Discovery`,
// `stage: prototype`) all read as "nothing there" and the guard exited 0 green.
// Measured 2026-09-04 by the S4 adversarial review. The sibling checker
// check-product-map.mjs had already learned this lesson in its own header.
const OPP_CLOSED_DECISIONS = new Set(["park", "kill"]);
function isOpen({ contract, opportunity }) {
    if (contract) return contract.status !== "signed-off";
    if (opportunity) {
        if (opportunity.stage === "archived") return false;
        return !OPP_CLOSED_DECISIONS.has(opportunity.decision ?? "");
    }
    return false;
}

// --- F2: a ✅ must be backed. A slug-less row is trusted, unless its note
// carries `kiểm: opportunity:<slug>` — then its ✅ means that opportunity passed
// Cổng Đáng, which has TWO halves: the bar struck (no `[đề xuất]` left) and the
// human fields filled.
const trusted = [];
for (const r of rows) {
    if (r.state !== "✅") continue;
    if (r.slug === null) {
        const m = r.note.match(OPP_CHECK);
        if (!m) {
            trusted.push(r.id);
            continue;
        }
        const opp = dossiers.get(m[1])?.opportunity;
        if (!opp || !opp.decision || !opp.decided_by)
            fail(
                "F2",
                `${r.id} ✅ nhưng cơ hội ${m[1]} chưa ký Cổng Đáng (cần decision và decided_by)`,
            );
        else if (opp.hasProposal)
            fail(
                "F2",
                `${r.id} ✅ nhưng cơ hội ${m[1]} còn ngưỡng đề xuất — Cổng Đáng chốt vạch TRƯỚC khi ký, gỡ hết [đề xuất] rồi mới tính`,
            );
        continue;
    }
    if (!isSigned(r.slug))
        fail("F2", `${r.id} ✅ nhưng hồ sơ ${r.slug} chưa ký`);
}

// --- F4: exceptions need a slug, a named reason, a date and a decider --------
const exceptions = excRows.map(([slug, reason, date, who]) => {
    if (!SLUG_RE.test(slug))
        fail("F4", `ngoại lệ "${slug}" không có slug hợp lệ`);
    if (!REASONS.has(reason))
        fail(
            "F4",
            `ngoại lệ ${slug} không có lý do có tên (nhận "${reason}"; hợp lệ: ${[...REASONS].join(", ")})`,
        );
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !who)
        fail("F4", `ngoại lệ ${slug} thiếu ngày hoặc ai quyết`);
    return { slug, done: isSigned(slug) };
});

// --- ratio and thaw ----------------------------------------------------------
// The denominator is COMPUTED, never a constant: an exception opened mid-freeze
// adds a row, so pinning 20 here would redden the guard the day the safety valve
// is first used.
const starRows = rows.filter((r) => r.star);
const starDone = starRows.filter((r) => r.state === "✅").length;
const total = rows.length + exceptions.length;
const done =
    rows.filter((r) => r.state === "✅").length +
    exceptions.filter((e) => e.done).length;
const unlocked =
    starRows.length > 0 &&
    starDone === starRows.length &&
    done / total >= UNLOCK_RATIO;

// --- F1: while frozen, no working-state dossier outside the three tables ------
const allowed = new Set([
    ...rows.map((r) => r.slug).filter(Boolean),
    ...parkRows.map(([s]) => s).filter((s) => SLUG_RE.test(s)),
    ...exceptions.map((e) => e.slug),
]);
if (!unlocked)
    for (const [slug, d] of dossiers)
        if (isOpen(d) && !allowed.has(slug))
            fail(
                "F1",
                `${slug} mở ngoài kế hoạch — thêm vào Ngoại lệ với lý do có tên, hoặc park`,
            );

// --- F3: a parked slug that exists on disk must really be parked --------------
// Column one may also hold a LABEL for a debt with no dossier yet (e.g. "0.7 …");
// those are skipped rather than invented into slugs.
for (const [slug] of parkRows) {
    if (!SLUG_RE.test(slug)) continue;
    const d = dossiers.get(slug);
    if (!d) continue;
    if (d.opportunity?.decision !== "park")
        fail(
            "F3",
            `${slug} khai park mà hồ sơ chưa park (opportunity.md cần decision: park)`,
        );
}

// --- F5: leaving the freeze by parking is a PLAN edit, and it is signed -------
// `decision: park` closes a dossier for F1, so on its own it was a way out of the
// freeze that cost one line in a file you own: no roadmap edit, no signer, no
// date. Confirmed by probe in the S4 round-2 review — a dossier carrying nothing
// but `stage: decided` + `decision: park` never reached ANY rule, because F1 skips
// it as closed and F3 only walks slugs already written into the park table.
//
// Two conditions, and neither is new policy — both already govern the neighbours
// in this same file. Being listed is what F4 demands of an exception (the way out
// is written in the shared plan, not in your own dossier). Being signed is what F2
// demands of a Cổng Đáng before it will trust an opportunity ("cần decision và
// decided_by"); a park is the same kind of human call, so it carries the same
// two human fields.
const parkListed = new Set(
    parkRows.map(([s]) => s).filter((s) => SLUG_RE.test(s)),
);
for (const [slug, d] of dossiers) {
    const opp = d.opportunity;
    if (!opp) continue;
    const closedByHuman =
        OPP_CLOSED_DECISIONS.has(opp.decision ?? "") ||
        opp.stage === "archived";
    if (!closedByHuman) continue;
    if (!parkListed.has(slug))
        fail(
            "F5",
            `${slug} khai ${opp.decision || opp.stage} nhưng không có trong bảng Xếp lại sau — rời băng là một lần sửa KẾ HOẠCH CHUNG, không phải một dòng trong hồ sơ của chính mình`,
        );
    const missing = ["decided_by", "decided_at"].filter(
        (k) => !(opp[k] || "").trim(),
    );
    if (missing.length)
        fail(
            "F5",
            `${slug} khai ${opp.decision || opp.stage} nhưng thiếu ${missing.join(" và ")} — cùng luật với F2: một quyết định của người phải mang tên người và ngày`,
        );
}

// --- checkpoint: a reminder, never a failure ---------------------------------
if (TODAY > header.checkpoint && !header.checkpoint_done)
    notes.push(
        `NOTE [plan-freeze] đã qua mốc tái hoạch ${header.checkpoint} — xem §6.3 của thiết kế lat-cat-chung-minh; ghi checkpoint_done: <ngày> vào header khi đã quyết`,
    );

// --- report --------------------------------------------------------------------
const pct = Math.floor((done / total) * 100);
console.log(
    `plan-freeze: ★ ${starDone}/${starRows.length} · tổng ${done}/${total} (${pct}%) · ${unlocked ? "GỠ BĂNG" : "còn băng"}`,
);
if (trusted.length)
    console.log(`   tin theo lời (dòng không có slug): ${trusted.join(", ")}`);
for (const n of notes) console.log(n);
if (failures.length) {
    for (const f of failures) console.error(f);
    console.error(
        `\nSửa ${ROADMAP} hoặc hồ sơ (không sửa guard) rồi chạy lại.`,
    );
    process.exit(1);
}
console.log(
    `✅ kế hoạch ${header.plan} khớp với _acceptance/ — không vi phạm.`,
);
process.exit(0);
