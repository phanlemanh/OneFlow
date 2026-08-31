#!/usr/bin/env node
// Every eval that filters tests by NAME must actually match a test.
//
// Why this exists: `pnpm vitest run <file> -t '<name>'` EXITS 0 when the filter
// matches nothing. It prints "Tests  26 skipped (26)" and reports success. An
// eval built that way — a typo, or a criterion whose test was never written —
// reports PASS forever.
//
// It happened, in the first verify round of `kho-khoa-toan-ven` (2026-08-31):
//
//     E9   AC-9   exit=0    Tests  26 skipped (26)   <- nothing ran
//     E10  AC-10  exit=0    Tests  26 skipped (26)
//
// Two criteria had no test at all and both cells reported PASS. It was caught
// only because a human compared the `Tests` line — the exit code lied.
//
// Measured before this was built: 33/33 evals were healthy (23 direct + 10
// wrapped), so this is a fence, not a repair. The real risk is not a typo at
// authoring time — the test was just written and someone is looking. It is a
// test RENAMED later, long after the dossier is signed, when nobody is.
//
// COLLECTION IS BY "HANDS A NAME TO VITEST", NOT BY "HAS -t" IN THE COMMAND.
// A wrapper was born the day before this checker; a second one next week would
// carry no `-t` in the config at all and its evals would be invisible here —
// the same failure class reborn inside the fence built to stop it. So a command
// that hands a bare name to a script which forwards it into vitest's `-t`, and
// that this checker does not recognise, is RED BY NAME.
//
// Both halves of that sentence are load-bearing, and the first run proved it:
// "the script mentions vitest" alone produced 29 false positives — guards that
// POLICE the vitest CI job, and teeth scripts that RUN vitest from their own
// case table. Neither takes a filter from the executor, so neither belongs.
//
// No YAML parser: `yaml` and `js-yaml` both resolve to nothing in this repo, so
// the config is read line by line — the shape `roadmap-drift.mjs` and
// `check-product-map.mjs` already use. Measured: no executor uses a block
// scalar, so single-quoted, double-quoted and bare are the three cases.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
// Derive the root from this file's own location; a hardcoded root silently
// measures the wrong tree the first time anything runs from elsewhere.
const DEFAULT_ROOT = path.resolve(HERE, "..", "..");

const args = process.argv.slice(2);
const SHOW_SHAPES = args.includes("--show-shapes");
const rootFlag = args.indexOf("--root");
const ROOT =
    rootFlag >= 0 ? path.resolve(args[rootFlag + 1] ?? "") : DEFAULT_ROOT;
// The config and the source tree are genuinely different inputs: one says what
// the evals CLAIM to run, the other holds the tests that actually exist. In CI
// they are the same directory and neither flag is passed. The teeth need to
// perturb one without the other — a copied config against real sources, or a
// real config against a tree where vitest cannot run — so the second root is
// addressable rather than assumed equal.
const vitestFlag = args.indexOf("--vitest-root");
const VITEST_ROOT =
    vitestFlag >= 0 ? path.resolve(args[vitestFlag + 1] ?? "") : ROOT;

const failures = [];
const fail = (rule, msg) => failures.push(`FAIL ${rule}: ${msg}`);

function report(extra) {
    if (failures.length) {
        for (const f of failures) console.error(f);
        if (extra) console.error(`\n${extra}`);
        console.error(
            `\n❌ ${failures.length} chỗ lệch trong các ô đo lọc theo tên.`,
        );
        process.exit(1);
    }
}

// --- read the executors ----------------------------------------------------
/**
 * `<kind>.<key>` -> command string, for every entry under `executors:`.
 *
 * Line-based, and it must survive all three quoting forms the config actually
 * uses. Getting this wrong is the dangerous failure: a parser that only sees
 * single-quoted one-liners reports a plausible smaller number and exits 0,
 * leaving the rest outside the fence with every light green. That is worse
 * than finding none, and the `undercount` teeth case exists for it.
 */
function readExecutors() {
    const cfgPath = path.join(ROOT, "_acceptance", "config.yaml");
    let text;
    try {
        text = readFileSync(cfgPath, "utf8");
    } catch (err) {
        fail("cấu hình", `không đọc được ${cfgPath} (${err.code ?? "lỗi"})`);
        report();
        process.exit(1);
    }

    const out = new Map();
    let inExecutors = false;
    let kind = null;
    for (const raw of text.split("\n")) {
        if (/^executors:\s*$/.test(raw)) {
            inExecutors = true;
            kind = null;
            continue;
        }
        if (!inExecutors) continue;
        if (/^\S/.test(raw)) {
            inExecutors = false;
            continue;
        }
        const group = raw.match(/^ {2}([a-z0-9_]+):\s*$/);
        if (group) {
            kind = group[1];
            continue;
        }
        const entry = raw.match(/^ {4}([a-z0-9_]+):\s*(.+?)\s*$/);
        if (!entry || !kind) continue;
        let value = entry[2];
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
            // YAML escapes a single quote inside a single-quoted scalar by
            // doubling it. No executor uses that form today, but a parser that
            // does not unescape it reads a mangled filter and reports the eval
            // as matching nothing — a false RED, which is the failure direction
            // that erodes trust in a guard fastest.
            value = value.slice(1, -1).replace(/''/g, "'");
        }
        out.set(`${kind}.${entry[1]}`, value);
    }
    return out;
}

// --- classify --------------------------------------------------------------
/** Scripts this checker knows how to read a filter out of. */
const KNOWN_WRAPPERS = new Map([
    [
        "scripts/settings/run-one-test.sh",
        (cmd, wrapperText) => {
            // The file is pinned INSIDE the wrapper. Copying that path here is
            // exactly how the two drift apart, so read it back out.
            const file = wrapperText.match(/^FILE=(\S+)\s*$/m)?.[1];
            const filter = cmd.match(/run-one-test\.sh\s+(['"])(.+?)\1/)?.[2];
            return file && filter ? { file, filter } : null;
        },
    ],
]);

function classify(cmd) {
    // (a) a wrapper: a script this command hands a NAME to, which the script
    //     forwards into vitest's -t.
    //
    //     BOTH signals are required, and the first run of this checker is why.
    //     "the script mentions vitest" alone flagged 29 false positives: guards
    //     that POLICE the vitest CI job, and teeth scripts that RUN vitest from
    //     their own case table. Neither takes a filter from the executor.
    //     Measured on this repo: exactly two scripts forward an argument into
    //     -t, and only one of them is ever called with a bare string —
    //     check-env-store-teeth.sh is always called with `--case <name>`, a
    //     flag, so it falls out on the second signal rather than by a
    //     hand-maintained exception list.
    const scriptRef = cmd.match(/(?:bash|sh|node)\s+(scripts\/\S+)/)?.[1];
    if (scriptRef) {
        let body = "";
        try {
            body = readFileSync(path.join(ROOT, scriptRef), "utf8");
        } catch {
            // A command naming a script that is not there is a config bug, but
            // not this checker's rule — leave it to the executor to explode.
            return { shape: "ignored" };
        }
        const forwardsFilter = /vitest[\s\S]{0,200}?-t\s+"?\$/.test(body);
        const tail = cmd
            .slice(cmd.indexOf(scriptRef) + scriptRef.length)
            .trim();
        const passesBareArg = tail.length > 0 && !tail.startsWith("-");
        if (!forwardsFilter || !passesBareArg) return { shape: "ignored" };

        const reader = KNOWN_WRAPPERS.get(scriptRef);
        if (!reader) return { shape: "unknown", script: scriptRef };
        const parsed = reader(cmd, body);
        if (!parsed) return { shape: "unparsable", script: scriptRef };
        return { shape: "wrapped", ...parsed };
    }

    // (b) a direct vitest invocation
    if (!/\bvitest\b/.test(cmd)) return { shape: "ignored" };
    if (!/\s-t\b/.test(cmd)) return { shape: "ignored" }; // runs a whole file
    // Quoted OR bare. The first run of this checker found three evals written
    // `-t violation` with no quotes at all; a quoted-only pattern reported them
    // as unparsable, and a laxer checker would have skipped them silently —
    // which is exactly the eval that most needs watching.
    const filter =
        cmd.match(/\s-t\s+(['"])(.+?)\1/)?.[2] ??
        cmd.match(/\s-t\s+([^\s'"][^\s]*)/)?.[1];
    const files = [...cmd.matchAll(/\b(\S+\.test\.tsx?)\b/g)].map((m) => m[1]);
    if (!filter || files.length === 0) return { shape: "unparsable" };
    return { shape: "direct", file: files[0], files, filter };
}

// --- ask vitest for the real names ----------------------------------------
/**
 * The collected test names, straight from vitest.
 *
 * Deliberately NOT parsed out of the test files: `it.each` is already expanded
 * here, names are the full `describe > it` chain, and nested describes are
 * correct by definition rather than by an approximation that will drift.
 * Measured 31/08: 720 cases, 1 second, 149 KB.
 */
function collectNames() {
    const bin = path.join(VITEST_ROOT, "node_modules", "vitest", "vitest.mjs");
    let raw;
    try {
        raw = execFileSync(process.execPath, [bin, "list", "--json"], {
            cwd: VITEST_ROOT,
            encoding: "utf8",
            maxBuffer: 64 * 1024 * 1024,
            stdio: ["ignore", "pipe", "pipe"],
        });
    } catch (err) {
        // A tool failure is NOT a verdict about the product. Saying "no cases
        // exist, so nothing matches" would turn every eval red for a reason
        // that has nothing to do with any eval.
        fail(
            "liệt-kê",
            `không chạy được \`vitest list\` (${err.code ?? err.message}) — không kết luận gì về ô đo`,
        );
        report();
        process.exit(1);
    }
    try {
        return JSON.parse(raw);
    } catch {
        fail("liệt-kê", "`vitest list --json` trả về thứ không phải JSON");
        report();
        process.exit(1);
    }
}

// --- main ------------------------------------------------------------------
const executors = readExecutors();
const collected = [];
for (const [key, cmd] of executors) {
    const c = classify(cmd);
    if (c.shape === "ignored") continue;
    if (c.shape === "unknown") {
        fail(
            "bọc-lạ",
            `\`${key}\` gọi vitest qua \`${c.script}\` mà bộ kiểm chưa nhận diện — khai nó vào KNOWN_WRAPPERS, đừng để nó lọt`,
        );
        continue;
    }
    if (c.shape === "unparsable") {
        fail(
            "không-đọc-được",
            `\`${key}\` lọc theo tên nhưng không rút được (file, chuỗi lọc) từ lệnh: ${cmd}`,
        );
        continue;
    }
    collected.push({ key, ...c });
}

if (collected.length === 0) {
    // The most important gate. If the command shape changes, this checker would
    // otherwise cover NOTHING while still reporting success — this feature's
    // own failure class, reborn inside it.
    fail(
        "rỗng",
        "không tìm thấy ô đo lọc theo tên nào — khuôn lệnh đã đổi và bộ kiểm đang phủ KHÔNG GÌ CẢ",
    );
}
report();

const names = collectNames();
const byFile = new Map();
for (const n of names) {
    if (!n?.file || !n?.name) continue;
    const rel = path.relative(VITEST_ROOT, n.file);
    if (!byFile.has(rel)) byFile.set(rel, []);
    byFile.get(rel).push(n.name);
}

const rows = [];
for (const c of collected) {
    let re;
    try {
        // `-t` is vitest's testNamePattern, which is a REGEX. Substring matching
        // would disagree with the very tool this checker polices.
        re = new RegExp(c.filter);
    } catch (err) {
        fail(
            "không-đọc-được",
            `\`${c.key}\` có chuỗi lọc không phải regex hợp lệ: ${c.filter} (${err.message})`,
        );
        continue;
    }
    const pool = byFile.get(c.file) ?? [];
    const hits = pool.filter((n) => re.test(n)).length;
    rows.push({ ...c, hits });
    if (hits === 0) {
        fail(
            "không-khớp",
            `\`${c.key}\` lọc \`${c.filter}\` trên \`${c.file}\` nhưng KHÔNG ca thử nào khớp — ô đo này chạy 0 ca và vẫn thoát 0`,
        );
    }
}

report();

if (SHOW_SHAPES) {
    for (const r of rows.sort((a, b) => a.key.localeCompare(b.key))) {
        console.log(
            `  ${r.shape.padEnd(8)} ${r.hits.toString().padStart(3)} ca  ${r.key}`,
        );
    }
}

const direct = rows.filter((r) => r.shape === "direct").length;
const wrapped = rows.filter((r) => r.shape === "wrapped").length;
// Print all three numbers, not just a total: an undercount prints a plausible
// number and exits 0, which is more dangerous than finding zero.
console.log(
    `   đã kiểm ${rows.length} ô đo lọc theo tên — ${direct} gọi thẳng, ${wrapped} qua bộ bọc`,
);
console.log("✅ mọi ô đo đều khớp ít nhất một ca thử.");
