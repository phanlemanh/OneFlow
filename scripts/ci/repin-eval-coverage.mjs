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
// ---------- the run-log gateway: one door in, one door out ----------
//
// Round 2 produced three separate HIGH findings that shared a single root: the run-log
// was treated as loose JSONL, each mode carrying its own private tolerance for data it
// could not read. `parseJsonl` mapped a broken line to null and filtered it away;
// `modeNewlines` did `catch { continue }`; the writer appended assuming a trailing
// newline it never checked. Each hole alone is small. Together they let `write` fuse its
// new line onto an existing one and `check` then report `dong repin: 0 ... OK` with
// exit 0 -- the guard destroying provenance and calling the result clean.
//
// So the log is no longer loose JSONL. Every read and every write goes through here,
// and the rule is the one this dossier keeps restating: a thing that cannot be measured
// must be LOUD, never absent.

const LOG_OF = (slug) => join(ACC, slug, "run-log.jsonl");

// Returns what it actually managed to read, INCLUDING the count it could not. Callers
// choose what to do with `unreadable`; none of them may ignore it silently.
function readLog(slug) {
    const p = LOG_OF(slug);
    const lines = readLines(p);
    const objs = [];
    let unreadable = 0;
    for (const l of lines) {
        try {
            objs.push(JSON.parse(l));
        } catch {
            unreadable++;
        }
    }
    return { objs, unreadable, total: lines.length };
}

// Measured 2026-09-02 across the whole repo: 1669 run-log lines, 0 unparseable. So
// refusing is not a theoretical strictness that would redden CI on legacy data -- it is
// a refusal that fires only on damage, which is exactly when a guard must not conclude.
function readLogOrDie(slug) {
    const r = readLog(slug);
    if (r.unreadable)
        die(
            `run-log cua ${slug} co ${r.unreadable}/${r.total} dong khong doc duoc — hang rao KHONG KET LUAN GI ve ho so nay thay vi bo qua chung, vi mot dong repin hong va mot dong repin vang trong nhau y het`,
        );
    return r.objs;
}

// The writer's own newline guard, plus a round-trip check that it did not eat anything.
// appendFileSync onto a file whose last byte is not "\n" concatenates the new object
// onto the previous line; both then vanish from every reader in the repo
// (pre-merge-check.sh and recheck-evidence.cjs JSON.parse the same lines).
function appendLog(slug, obj) {
    const p = LOG_OF(slug);
    const before = readLog(slug);
    const raw = existsSync(p) ? readFileSync(p, "utf8") : "";
    const lead = raw.length && !raw.endsWith("\n") ? "\n" : "";
    appendFileSync(p, `${lead}${JSON.stringify(obj)}\n`);
    // Prove it, do not assume it. The writer is the only thing in this repo that can
    // damage a signed dossier's provenance, so it re-reads and refuses to claim success
    // unless the log grew by exactly one readable line and nothing became unreadable.
    const after = readLog(slug);
    if (
        after.unreadable !== before.unreadable ||
        after.objs.length !== before.objs.length + 1
    )
        die(
            `ghi vao run-log cua ${slug} lam hong so: truoc ${before.objs.length} doc duoc/${before.unreadable} hong, sau ${after.objs.length}/${after.unreadable} — dang le +1 va +0`,
        );
}

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
        die(
            "write can <suites_json> tuong minh — khong co mac dinh, vi mot mang toan 0 CHINH LA bang chung lan xanh ma hai ben doc chap nhan",
        );
    let arr;
    try {
        arr = JSON.parse(suites);
    } catch {
        die(`suites_json khong phai JSON hop le: ${suites}`);
    }
    if (
        !Array.isArray(arr) ||
        arr.length === 0 ||
        !arr.every((n) => Number.isInteger(n))
    )
        die(
            `suites_json phai la mang so nguyen khong rong, nhan duoc: ${suites}`,
        );
    if (arr.some((n) => n !== 0))
        die(
            `lan co suite thoat khac 0 (${arr.join(",")}) — nghi thuc DUNG o day: khac phuc nguyen nhan roi phong lan MOI, khong ghi dong repin`,
        );
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
        die(
            `prev_sha == sha (${sha.slice(0, 12)}) — verified_commit da duoc doi TRUOC khi goi write; dong repin nhu vay khong bao gio ket luan duoc gi`,
        );
    // `=== null`, not `!`: `merge-base --is-ancestor` prints NOTHING on success, so
    // gitOk returns "" -- and `!""` is true, which would make this refuse every honest
    // write. Only `null` means the command failed.
    if (gitOk("merge-base", "--is-ancestor", prev, sha) === null)
        die(
            `verified_commit cu (${prev.slice(0, 12)}) khong phai to tien cua ${sha.slice(0, 12)} — hai sha khong nam tren mot duong lich su`,
        );
    appendLog(slug, {
        ts: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
        kind: "repin",
        run_id: runId,
        sha,
        prev_sha: prev,
        suites_exit: arr,
    });
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

function modeCheck(argv = []) {
    // `--min-computable N`: the floor the caller demands from the number this mode
    // prints. Printing it is not asserting it -- round 3 found that E6's load-bearing
    // claim ("dong tinh duoc phai > 0") was satisfied by a run that printed 0 and exited
    // 0, which is the same green-on-nothing shape the whole dossier exists to close.
    // It is a FLAG, not a hard rule inside the mode: a repo with no re-pins yet has a
    // legitimate 0, and the floor is the caller's claim about ITS repo, not a universal.
    let minComputable = null;
    for (let i = 0; i < argv.length; i++) {
        const tok = argv[i];
        let raw;
        if (tok === "--min-computable") {
            raw = argv[++i];
        } else if (tok.startsWith("--min-computable=")) {
            raw = tok.slice("--min-computable=".length);
        } else {
            // `continue` here is how the floor became a no-op: `--min-computable=999`,
            // `--min-computables 999` and a bare typo all fell through and the mode
            // exited 0 having enforced nothing. An argument the tool does not
            // understand is not an argument it may ignore -- that is the same
            // green-on-nothing shape the flag exists to close.
            die(
                `doi so la '${tok}' — chi nhan '--min-computable N' hoac '--min-computable=N'`,
            );
        }
        if (raw === undefined || !/^\d+$/.test(raw))
            die(
                `--min-computable can mot so nguyen khong am, nhan duoc: ${raw ?? "(khong co)"}`,
            );
        minComputable = Number(raw);
    }
    // On a shallow clone `git cat-file -t <old sha>` fails because the object is absent,
    // not because the line is malformed -- so every computable line would silently
    // become "grandfathered" and the guard would report a clean sweep having measured
    // nothing. CI checkouts default to depth 1.
    if (gitOk("rev-parse", "--is-shallow-repository") === "true")
        die(
            "kho la ban clone nong (shallow) — moi sha cu deu khong phan giai duoc nen dong repin nao cung roi vao hang ong ba va hang rao xanh ma khong do gi; fetch day du roi chay lai",
        );
    const slugs = signedSlugs();
    let repins = 0,
        computable = 0,
        grandfathered = 0;
    const swallowed = [];
    const redRerun = [];
    const mootRerun = [];
    const inconclusive = new Set();
    for (const slug of slugs) {
        const log = readLogOrDie(slug);
        const evals = evalsOf(slug);
        // "Was this eval re-measured after the change?" -- NOT "was it re-run inside
        // that same re-pin event". The stricter same-run_id rule cannot be satisfied
        // honestly for a pin that already happened: the only way to make it green is to
        // log a run under an old run_id, which is fabricating provenance. Asking
        // instead for an eval line whose sha IS the repin's sha or a descendant of it
        // measures the property that actually matters and can be satisfied by really
        // running the eval now.
        // `exit_code === 0`, not merely "an eval line exists". Without it, re-running a
        // touched eval and having it FAIL satisfies the guard -- the loudest case it
        // exists to catch becomes the case it blesses. A red re-run is not coverage; it
        // is the finding.
        // THREE states, because three exist. `exit_code: 0` is coverage; a nonzero
        // number is a failed re-run; missing or null is neither -- `null` is the shape
        // the tool-kill rule prescribes for a command the harness killed, so a line can
        // legitimately exist while proving nothing. Measured 2026-09-02: all 63 real
        // eval lines in this repo carry `exit_code: 0`, so the strictness costs nothing
        // on real data and only fires on lines that cannot support a claim.
        const ranAt = new Map();
        const redAt = new Map();
        const mootAt = new Map();
        for (const o of log) {
            if (o.kind !== "eval" || !o.eval || !o.sha) continue;
            const bag =
                o.exit_code === 0
                    ? ranAt
                    : typeof o.exit_code === "number"
                      ? redAt
                      : mootAt;
            if (!bag.has(o.eval)) bag.set(o.eval, []);
            bag.get(o.eval).push(o.sha);
        }
        const sinceIn = (bag, id, sha) =>
            (bag.get(id) || []).some(
                (s) =>
                    s === sha ||
                    gitOk("merge-base", "--is-ancestor", sha, s) !== null,
            );
        const reMeasuredSince = (id, sha) => sinceIn(ranAt, id, sha);
        const reMeasuredRed = (id, sha) => sinceIn(redAt, id, sha);
        const reMeasuredMoot = (id, sha) => sinceIn(mootAt, id, sha);
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
            // Two named outcomes, not one. "Never re-run" and "re-run and failed" are
            // different defects and a reader who is told only the first will patch the
            // wrong thing.
            const red = missing.filter((id) => reMeasuredRed(id, o.sha));
            const moot = missing.filter(
                (id) => !reMeasuredRed(id, o.sha) && reMeasuredMoot(id, o.sha),
            );
            const never = missing.filter(
                (id) => !reMeasuredRed(id, o.sha) && !reMeasuredMoot(id, o.sha),
            );
            if (never.length)
                swallowed.push({ slug, run_id: o.run_id, evals: never });
            if (red.length)
                redRerun.push({ slug, run_id: o.run_id, evals: red });
            if (moot.length)
                mootRerun.push({ slug, run_id: o.run_id, evals: moot });
        }
    }
    console.log(
        `ho so da ky: ${slugs.length} | dong repin: ${repins} | tinh duoc: ${computable} | ong ba: ${grandfathered} | eval bi nuot: ${swallowed.length} | chay lai nhung DO: ${redRerun.length} | chay lai khong ro ket qua: ${mootRerun.length} | khong ket luan duoc (khong khai paths): ${inconclusive.size}`,
    );
    for (const s of redRerun) {
        console.error(
            `FAIL: ${s.slug} - re-pin ${s.run_id} co ${s.evals.length} eval bi cham DA chay lai nhung DO: ${s.evals.join(",")}`,
        );
    }
    if (swallowed.length) {
        for (const s of swallowed) {
            console.error(
                `FAIL: ${s.slug} - re-pin ${s.run_id} nuot ${s.evals.length} eval bi cham ma khong chay lai: ${s.evals.join(",")}`,
            );
        }
    }
    for (const s of mootRerun) {
        console.error(
            `FAIL: ${s.slug} - re-pin ${s.run_id} co ${s.evals.length} eval bi cham co dong chay lai NHUNG khong co exit_code (vd bi cong cu giet): ${s.evals.join(",")}`,
        );
    }
    if (swallowed.length || redRerun.length || mootRerun.length)
        process.exit(1);
    if (minComputable !== null && computable < minComputable)
        die(
            `dong tinh duoc = ${computable}, duoi san ${minComputable} ma nguoi goi doi — moi dong repin deu roi vao hang ong ba hoac khong co dong nao, nen luot xanh nay KHONG chung minh duoc phan phat hien prev_sha da chay`,
        );
    console.log("OK: khong re-pin nao nuot mot eval bi cham");
}

function modeNewlines(base) {
    const b = base || "origin/main";
    // The precondition, checked BEFORE a single file is read. `gitOk("show", b + ":" +
    // rel)` returns null for two states that are not alike -- the file was absent at that
    // base (data) and the base does not resolve (damage) -- and `|| ""` below erases the
    // difference. Measured 2026-09-03 against a nonexistent branch: 1674 history lines
    // classed as new and 25 false FAILs, each naming an unrelated dossier; the only way
    // to know it was a false alarm was to read this file.
    // Here, not per-file: after this line `|| ""` genuinely means "absent at that base",
    // which is the reading the base-thieu-file case keeps true.
    if (gitOk("rev-parse", "--verify", `${b}^{commit}`) === null)
        die(
            `moc so sanh '${b}' khong phan giai duoc — khong doc tep nao; kiem tra ten nhanh/ref roi chay lai`,
        );
    let bad = 0,
        fresh = 0,
        unreadable = 0;
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
                // Counted, never skipped. A new line that cannot be parsed is a line
                // whose `prev_sha` nobody can vouch for -- indistinguishable from one
                // that never had it, which is the very thing this mode measures.
                unreadable++;
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
        `dong run-log moi so ${b}: ${fresh} | dong repin moi thieu prev_sha: ${bad} | dong moi khong doc duoc: ${unreadable}`,
    );
    if (unreadable)
        die(
            `${unreadable} dong run-log MOI khong doc duoc — khong ket luan duoc gi ve prev_sha cua chung`,
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
        return (
            import.meta.url ===
            pathToFileURL(realpathSync(process.argv[1])).href
        );
    } catch {
        return false;
    }
})();
const [, , mode, ...rest] = process.argv;
const table = {
    write: () => modeWrite(...rest),
    plan: () => modePlan(...rest),
    check: () => modeCheck(rest),
    newlines: () => modeNewlines(rest[0]),
};
if (isMain) {
    if (!table[mode]) {
        console.error(
            "usage: repin-eval-coverage.mjs <write|plan|check [--min-computable N]|newlines> [...]",
        );
        process.exit(2);
    }
    table[mode]();
} else if (
    process.argv[1] &&
    /repin-eval-coverage\.mjs$/.test(process.argv[1])
) {
    // Invoked as a program but not recognised as the entry point: say so rather than
    // exit 0 in silence. A guard that can become a no-op without a word is worse than a
    // guard that is absent, because its green is read as a measurement.
    console.error(
        `FAIL: chay nhu chuong trinh nhung khong nhan ra la diem vao (argv[1]=${process.argv[1]}) — tu choi thoat 0 trong im lang`,
    );
    process.exit(2);
}
