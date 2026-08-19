/**
 * Reads risk_tiers.t3_paths out of _acceptance/config.yaml and reports any
 * changed file that matches one. Called by check-t3-untouched.sh.
 *
 * A real file rather than `node -e`: Node 24 runs -e input through its
 * TypeScript stripper, which mis-parses the character class in the glob
 * escaper below.
 *
 * A T3 feature inverts the question. It is ALLOWED to touch t3 paths — that
 * is what its tier bought — but only the ones it declared, so the useful
 * assertion becomes "exactly the declared surface, no more". Two flags carry
 * that:
 *
 *   --allow <glob>    a t3 path this feature is permitted to touch
 *   --require <glob>  a path this feature MUST touch
 *
 * `--require` is not decoration. Without it a feature whose diff is empty —
 * wrong base ref, a rebase that dropped the work, a guard pointed at the
 * wrong branch — passes the "touches nothing forbidden" test perfectly,
 * proving nothing at all. Requiring the declared surface to be present turns
 * that vacuous pass into a failure.
 *
 * Usage:
 *   node t3-scan.mjs <changed-files-list> <config.yaml>
 *        [--allow <glob>]... [--require <glob>]...
 */

import { readFileSync } from "node:fs";

const argv = process.argv.slice(2);
const positional = [];
const allowGlobs = [];
const requireGlobs = [];

for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--allow" || arg === "--require") {
        const value = argv[i + 1];
        if (!value || value.startsWith("--")) {
            console.error(`FAIL: ${arg} needs a glob`);
            process.exit(1);
        }
        (arg === "--allow" ? allowGlobs : requireGlobs).push(value);
        i += 1;
        continue;
    }
    positional.push(arg);
}

const [listPath, configPath] = positional;
const changed = readFileSync(listPath, "utf8").split("\n").filter(Boolean);

// Minimal reader for the one block we need. The kit requires 2-space
// indentation in this file, so the shape is fixed.
function readT3Paths(path) {
    const patterns = [];
    let inTiers = false;
    let inT3 = false;
    for (const line of readFileSync(path, "utf8").split("\n")) {
        if (/^risk_tiers:/.test(line)) {
            inTiers = true;
            continue;
        }
        if (inTiers && /^\S/.test(line)) break;
        if (!inTiers) continue;
        if (/^\s{2}t3_paths:\s*$/.test(line)) {
            inT3 = true;
            continue;
        }
        if (inT3 && /^\s{2}\S/.test(line)) {
            inT3 = false;
            continue;
        }
        if (!inT3) continue;
        const m = line.match(/^\s*-\s*"?([^"#]+?)"?\s*$/);
        if (m) patterns.push(m[1]);
    }
    return patterns;
}

const patterns = readT3Paths(configPath);
if (patterns.length === 0) {
    console.error(
        "FAIL: parsed no t3_paths out of the config — refusing to pass vacuously",
    );
    process.exit(1);
}

// `a/**` must match `a/b/c`, and `a/*` only one segment deep.
function toRegExp(glob) {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    // One pass, so `**` and `*` can never be mistaken for each other and no
    // sentinel character is needed to keep them apart.
    const body = escaped.replace(/\*\*\/?|\*/g, (token) =>
        token.startsWith("**") ? ".*" : "[^/]*",
    );
    return new RegExp(`^${body}$`);
}

const rules = patterns.map((glob) => ({ glob, re: toRegExp(glob) }));
const allowRules = allowGlobs.map((glob) => ({ glob, re: toRegExp(glob) }));
const requireRules = requireGlobs.map((glob) => ({ glob, re: toRegExp(glob) }));

const isAllowed = (file) => allowRules.some((rule) => rule.re.test(file));

const hits = [];
for (const file of changed) {
    if (isAllowed(file)) continue;
    for (const rule of rules) {
        if (rule.re.test(file)) hits.push(`${file}  ->  ${rule.glob}`);
    }
}

console.log(
    `checked ${changed.length} changed file(s) against ${rules.length} t3 path rule(s)` +
        (allowRules.length > 0 ? `, ${allowRules.length} allowed` : "") +
        (requireRules.length > 0 ? `, ${requireRules.length} required` : ""),
);

// An --allow that matches nothing is a stale declaration, not a permission:
// the feature either stopped touching that surface or the glob rotted, and
// either way the config is now describing a change that does not exist.
const deadAllows = allowRules.filter(
    (rule) => !changed.some((file) => rule.re.test(file)),
);

const missing = requireRules.filter(
    (rule) => !changed.some((file) => rule.re.test(file)),
);

if (hits.length > 0) {
    console.error("FAIL: this feature touches undeclared t3 path(s):");
    for (const hit of hits) console.error(`  ${hit}`);
    console.error(
        "Declare it with --allow (and say so at the gate), or revert the edit.",
    );
    process.exit(1);
}
if (missing.length > 0) {
    console.error(
        "FAIL: the diff window does not contain the path(s) this feature must touch:",
    );
    for (const rule of missing) console.error(`  ${rule.glob}`);
    console.error(
        "An absence claim over an empty or wrong window proves nothing — check the base ref.",
    );
    process.exit(1);
}
for (const rule of deadAllows) {
    console.log(`NOTE: --allow ${rule.glob} matched nothing in this diff`);
}
console.log(
    allowRules.length > 0
        ? "OK: only declared t3 paths touched — the declared surface holds"
        : "OK: no t3 path touched — the declared tier holds",
);
