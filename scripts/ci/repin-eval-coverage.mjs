#!/usr/bin/env node
// Core logic for the re-pin eval-coverage guard. The .sh sibling dispatches to it.
//
// Why this exists: a re-pin re-runs the machine suites and moves verified_commit, but
// re-runs no eval. Measured 2026-09-02: 33 of 33 `kind:"repin"` lines carry exactly
// five keys (kind, run_id, sha, suites_exit, ts) -- there is no room for eval results,
// by construction. So editing a file listed in a SIGNED eval's `paths` invalidates that
// dossier's evidence while check-resign-wave (which compares sha) stays green and
// recheck-evidence (which never runs a command) sees nothing.
//
// It already happened: dang-ky-fork-openai was signed with "OK: 7/7 ca"; the same
// command now prints 9/9.
//
// The missing datum is the PREVIOUS sha. A repin line records the new one only, so
// after the fact nobody can compute what that pin swallowed. Both readers of the line
// (recheck-evidence.cjs:77, pre-merge-check.sh:1577) JSON.parse it and read run_id /
// sha / suites_exit, so an extra `prev_sha` key is backward compatible.

import { execFileSync } from "node:child_process";
import {
    appendFileSync,
    existsSync,
    readdirSync,
    readFileSync,
    realpathSync,
} from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.env.RKCE_ROOT || process.cwd();
const ACC = join(ROOT, "_acceptance");

const die = (m) => {
    console.error(`FAIL: ${m}`);
    process.exit(1);
};
// stdio: git writes its own diagnostics to stderr even when we are prepared for the
// failure (`git show base:path` for a file that does not exist on the base ref), and a
// guard that leaks fatal: lines into CI output reads as broken when it is working.
const gitOk = (...a) => {
    try {
        return execFileSync("git", ["-C", ROOT, ...a], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        }).trim();
    } catch {
        return null;
    }
};

// ---------- the paths-matching law, written down once ----------
//
// A `paths` entry matches a changed file when ANY of:
//   (1) exact    -- entry === file
//   (2) subtree  -- file starts with entry + "/"          <-- the shape that bit us
//   (3) glob     -- entry contains * and its regex matches file
//
// (2) is not decoration. This repo's own evals declare `paths: ["_acceptance"]` and
// `paths: ["public/plugins"]` -- bare directories. Plain glob matching accepts neither
// `_acceptance/x/contract.md` nor anything under them, so every directory-shaped entry
// would become permanently untouchable and the guard would under-report on the most
// common shape while staying green.
export function globToRe(entry) {
    // One pass, no sentinel. An earlier version swapped `**` for a placeholder character
    // and back again -- the placeholder was a literal NUL byte, which the linter flags and
    // which would mangle any path containing it. A matcher must not be confusable by its
    // own input.
    const body = entry
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*\*|\*/g, (m) => (m === "**" ? ".*" : "[^/]*"));
    return new RegExp(`^${body}$`);
}
export function pathMatches(entry, file) {
    if (entry === file) return "exact";
    if (file.startsWith(`${entry.replace(/\/+$/, "")}/`)) return "subtree";
    if (entry.includes("*") && globToRe(entry).test(file)) return "glob";
    return null;
}

// ---------- dossier reading ----------
const readLines = (p) =>
    existsSync(p)
        ? readFileSync(p, "utf8")
              .split("\n")
              .filter((l) => l.trim())
        : [];
const parseJsonl = (p) =>
    readLines(p)
        .map((l) => {
            try {
                return JSON.parse(l);
            } catch {
                return null;
            }
        })
        .filter(Boolean);

function signedSlugs() {
    if (!existsSync(ACC)) return [];
    return readdirSync(ACC).filter((s) => {
        const c = join(ACC, s, "contract.md");
        return (
            existsSync(c) &&
            /^status:\s*signed-off/m.test(readFileSync(c, "utf8"))
        );
    });
}

// Deliberately a line reader, not a YAML parser: this guard must run in CI with no
// dependency beyond node builtins, and the two fields it needs are always written in
// block or inline-list form in this repo.
function evalsOf(slug) {
    const p = join(ACC, slug, "evals.yaml");
    if (!existsSync(p)) return [];
    const out = [];
    let cur = null;
    let inPaths = false;
    for (const raw of readFileSync(p, "utf8").split("\n")) {
        const id = raw.match(/^\s*-\s+id:\s*(\S+)/);
        if (id) {
            cur = { id: id[1], paths: [] };
            out.push(cur);
            inPaths = false;
            continue;
        }
        if (!cur) continue;
        const inline = raw.match(/^\s*paths:\s*\[(.*)\]/);
        if (inline) {
            cur.paths = inline[1]
                .split(",")
                .map((s) => s.trim().replace(/^["']|["']$/g, ""))
                .filter(Boolean);
            inPaths = false;
            continue;
        }
        if (/^\s*paths:\s*$/.test(raw)) {
            inPaths = true;
            continue;
        }
        if (inPaths) {
            const item = raw.match(/^\s+-\s+["']?([^"']+?)["']?\s*$/);
            if (item) {
                cur.paths.push(item[1]);
                continue;
            }
            inPaths = false;
        }
    }
    return out;
}

function verifiedCommit(slug) {
    const p = join(ACC, slug, "evidence-report.md");
    if (!existsSync(p)) return null;
    const m = readFileSync(p, "utf8").match(/^verified_commit:\s*(\S+)/m);
    return m ? m[1] : null;
}

// An eval is "touched" by a set of changed files when one of its `paths` entries
// matches one of them -- OR when it declares no `paths` at all. The second half is the
// safe default the kit already uses for carry-forward: an eval that does not say what
// it watches cannot be excluded from anything.
// Three buckets, not two. An eval that declares NO `paths` cannot be judged here: the
// safe default "no paths -> always re-run" is right when a verify round decides what to
// run, but wrong when judging a past re-pin -- it would mark all 145 no-paths evals in
// this repo as swallowed by every pin, forever, and a verdict that always fires says
// nothing. They get their own named bucket with a count, which is data; folding them
// into `hit` would be a verdict, and folding them into `miss` would be a silent
// exclusion. Both are worse than saying "cannot conclude, here is how many".
export function touchedEvals(evals, changed) {
    const hit = [],
        miss = [],
        unknown = [];
    for (const e of evals) {
        if (!e.paths.length) {
            unknown.push(e.id);
            continue;
        }
        const any = e.paths.some((p) => changed.some((f) => pathMatches(p, f)));
        (any ? hit : miss).push(e.id);
    }
    return { hit, miss, unknown };
}

// ---------- modes ----------
function modeWrite(slug, sha, runId, suites) {
    if (!slug || !sha || !runId)
        die("write can <slug> <sha> <run_id> <suites_json>");
    // `suites_exit` is not metadata. pre-merge-check.sh rejects a re-pin whose array
    // holds a nonzero element -- "a red lane cannot back a signature" -- so an all-zero
    // array IS the proof both readers accept. An optional argument with a helpful
    // default lets this tool MINT that proof instead of recording it: the same class of
    // fabricated provenance the dossier exists to close. Required, and refused when it
    // describes a red lane, because the ritual says a red lane stops the event.
    if (!suites)
        die("write can <suites_json> tuong minh — khong co mac dinh, vi mot mang toan 0 CHINH LA bang chung lan xanh ma hai ben doc chap nhan");
    let arr;
    try {
        arr = JSON.parse(suites);
    } catch {
        die(`suites_json khong phai JSON hop le: ${suites}`);
    }
    if (!Array.isArray(arr) || arr.length === 0 || !arr.every((n) => Number.isInteger(n)))
        die(`suites_json phai la mang so nguyen khong rong, nhan duoc: ${suites}`);
    if (arr.some((n) => n !== 0))
        die(`lan co suite thoat khac 0 (${arr.join(",")}) — nghi thuc DUNG o day: khac phuc nguyen nhan roi phong lan MOI, khong ghi dong repin`);
    const prev = verifiedCommit(slug);
    if (!prev)
        die(
            `ho so ${slug} khong co verified_commit - khong suy duoc prev_sha, tu choi ghi dong repin mu`,
        );
    if (!gitOk("cat-file", "-t", prev))
        die(`verified_commit cua ${slug} (${prev}) khong phan giai duoc`);
    if (!gitOk("cat-file", "-t", sha)) die(`sha ${sha} khong phan giai duoc`);
    // prev === sha makes `git diff prev..sha` empty, so the pin can never be found to
    // have swallowed anything: a line that is valid, computable, and permanently
    // vacuous. It happens whenever evidence-report is updated BEFORE this is called.
    if (prev === sha)
        die(`prev_sha == sha (${sha.slice(0, 12)}) — verified_commit da duoc doi TRUOC khi goi write; dong repin nhu vay khong bao gio ket luan duoc gi`);
    // `=== null`, not `!`: `merge-base --is-ancestor` prints NOTHING on success, so
    // gitOk returns "" -- and `!""` is true, which would make this refuse every honest
    // write. Only `null` means the command failed.
    if (gitOk("merge-base", "--is-ancestor", prev, sha) === null)
        die(`verified_commit cu (${prev.slice(0, 12)}) khong phai to tien cua ${sha.slice(0, 12)} — hai sha khong nam tren mot duong lich su`);
    const line = JSON.stringify({
        ts: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
        kind: "repin",
        run_id: runId,
        sha,
        prev_sha: prev,
        suites_exit: arr,
    });
    appendFileSync(join(ACC, slug, "run-log.jsonl"), `${line}\n`);
    console.log(
        `ghi 1 dong repin cho ${slug}: prev_sha=${prev.slice(0, 12)} -> sha=${sha.slice(0, 12)}`,
    );
}

function modePlan(slug, prev, sha) {
    if (!slug || !prev || !sha) die("plan can <slug> <prev_sha> <sha>");
    const changed = (gitOk("diff", "--name-only", `${prev}..${sha}`) || "")
        .split("\n")
        .filter(Boolean);
    const evals = evalsOf(slug);
    const { hit, miss, unknown } = touchedEvals(evals, changed);
    const declared = evals.filter((e) => e.paths.length).length;
    console.log(
        `ho so ${slug}: ${evals.length} eval | ${declared} khai paths | ${changed.length} file doi`,
    );
    console.log(`BI CHAM (${hit.length}): ${hit.join(",") || "(rong)"}`);
    console.log(`KHONG CHAM (${miss.length}): ${miss.join(",") || "(rong)"}`);
    console.log(
        `KHONG KET LUAN DUOC (${unknown.length}, khong khai paths): ${unknown.join(",") || "(rong)"}`,
    );
}

function modeCheck() {
    const slugs = signedSlugs();
    let repins = 0,
        computable = 0,
        grandfathered = 0;
    const swallowed = [];
    const inconclusive = new Set();
    for (const slug of slugs) {
        const log = parseJsonl(join(ACC, slug, "run-log.jsonl"));
        const evals = evalsOf(slug);
        // "Was this eval re-measured after the change?" -- NOT "was it re-run inside
        // that same re-pin event". The stricter same-run_id rule cannot be satisfied
        // honestly for a pin that already happened: the only way to make it green is to
        // log a run under an old run_id, which is fabricating provenance. Asking
        // instead for an eval line whose sha IS the repin's sha or a descendant of it
        // measures the property that actually matters and can be satisfied by really
        // running the eval now.
        const ranAt = new Map();
        for (const o of log) {
            if (o.kind === "eval" && o.eval && o.sha) {
                if (!ranAt.has(o.eval)) ranAt.set(o.eval, []);
                ranAt.get(o.eval).push(o.sha);
            }
        }
        const reMeasuredSince = (id, sha) =>
            (ranAt.get(id) || []).some(
                (s) =>
                    s === sha ||
                    gitOk("merge-base", "--is-ancestor", sha, s) !== null,
            );
        for (const o of log) {
            if (o.kind !== "repin") continue;
            repins++;
            if (
                !o.prev_sha ||
                !gitOk("cat-file", "-t", o.prev_sha) ||
                !gitOk("cat-file", "-t", o.sha)
            ) {
                grandfathered++;
                continue;
            }
            computable++;
            const changed = (
                gitOk("diff", "--name-only", `${o.prev_sha}..${o.sha}`) || ""
            )
                .split("\n")
                .filter(Boolean);
            const { hit, unknown } = touchedEvals(evals, changed);
            unknown.forEach((id) => inconclusive.add(`${slug}/${id}`));
            const missing = hit.filter((id) => !reMeasuredSince(id, o.sha));
            if (missing.length)
                swallowed.push({ slug, run_id: o.run_id, evals: missing });
        }
    }
    console.log(
        `ho so da ky: ${slugs.length} | dong repin: ${repins} | tinh duoc: ${computable} | ong ba: ${grandfathered} | eval bi nuot: ${swallowed.length} | khong ket luan duoc (khong khai paths): ${inconclusive.size}`,
    );
    if (swallowed.length) {
        for (const s of swallowed) {
            console.error(
                `FAIL: ${s.slug} - re-pin ${s.run_id} nuot ${s.evals.length} eval bi cham ma khong chay lai: ${s.evals.join(",")}`,
            );
        }
        process.exit(1);
    }
    console.log("OK: khong re-pin nao nuot mot eval bi cham");
}

function modeNewlines(base) {
    const b = base || "origin/main";
    let bad = 0,
        fresh = 0;
    const slugs = existsSync(ACC)
        ? readdirSync(ACC).filter((s) =>
              existsSync(join(ACC, s, "run-log.jsonl")),
          )
        : [];
    for (const slug of slugs) {
        const rel = `_acceptance/${slug}/run-log.jsonl`;
        const before = new Set(
            (gitOk("show", `${b}:${rel}`) || "")
                .split("\n")
                .filter((l) => l.trim()),
        );
        for (const l of readLines(join(ROOT, rel))) {
            if (before.has(l)) continue;
            fresh++;
            let o;
            try {
                o = JSON.parse(l);
            } catch {
                continue;
            }
            if (o.kind === "repin" && !o.prev_sha) {
                console.error(
                    `FAIL: ${slug} - dong repin MOI thieu prev_sha (run_id ${o.run_id}); dung che do write de ghi`,
                );
                bad++;
            }
        }
    }
    console.log(
        `dong run-log moi so ${b}: ${fresh} | dong repin moi thieu prev_sha: ${bad}`,
    );
    if (bad) process.exit(1);
    console.log("OK: moi dong repin moi deu mang prev_sha");
}

// Run the CLI only when this file IS the entry point. Without the guard, any module
// that imports pathMatches (the paths-law mode does) executes the dispatcher, prints
// usage and exits 2 -- the importer never gets to run its own assertions.
// pathToFileURL, not string concatenation: `import.meta.url` is percent-encoded, so a
// checkout path containing a space (or `#`, or non-ASCII) made the raw comparison false.
// The dispatcher then never ran and EVERY mode exited 0 having printed nothing -- an
// unknown mode included. Green on nothing, at the entry point of the guard itself.
// Compare REALPATHS. Two things diverge otherwise: `import.meta.url` is percent-encoded
// while argv[1] is raw (a space in the checkout path breaks it), and on macOS
// `import.meta.url` resolves symlinks while argv[1] keeps what was typed -- /tmp is a
// symlink to /private/tmp, so every invocation under /tmp missed. Either way the
// dispatcher silently did not run and every mode exited 0 having printed nothing.
const isMain = (() => {
    if (!process.argv[1]) return false;
    try {
        return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
    } catch {
        return false;
    }
})();
const [, , mode, ...rest] = process.argv;
const table = {
    write: () => modeWrite(...rest),
    plan: () => modePlan(...rest),
    check: () => modeCheck(),
    newlines: () => modeNewlines(rest[0]),
};
if (isMain) {
    if (!table[mode]) {
        console.error(
            "usage: repin-eval-coverage.mjs <write|plan|check|newlines> [...]",
        );
        process.exit(2);
    }
    table[mode]();
} else if (process.argv[1] && /repin-eval-coverage\.mjs$/.test(process.argv[1])) {
    // Invoked as a program but not recognised as the entry point: say so rather than
    // exit 0 in silence. A guard that can become a no-op without a word is worse than a
    // guard that is absent, because its green is read as a measurement.
    console.error(
        `FAIL: chay nhu chuong trinh nhung khong nhan ra la diem vao (argv[1]=${process.argv[1]}) — tu choi thoat 0 trong im lang`,
    );
    process.exit(2);
}
