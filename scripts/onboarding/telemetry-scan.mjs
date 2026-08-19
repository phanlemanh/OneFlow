#!/usr/bin/env node
/* E17 / AC-12 — no request carries behavioural data to any server.
 *
 * Scans TRANSPORT SHAPES, not package names: a beacon call, an analytics SDK
 * import, or a fetch/XHR aimed at a hardcoded non-app origin. A scan that
 * only greps for "posthog" in package.json is precisely the gap this closes —
 * a hand-rolled `fetch("https://collect.example.com", {body: events})` ships
 * telemetry with zero analytics packages installed.
 *
 * Usage: node scripts/onboarding/telemetry-scan.mjs [target-dir]
 *   default target: src (plus a package.json dependency check)
 *   a fixture dir as target = the guard's own RED half.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const target = process.argv[2] || "src";
const isRealTree = !process.argv[2];

/**
 * Outbound calls that are the PRODUCT talking to the thing the user pointed
 * it at — never a place behavioural data goes. Each entry needs a reason.
 */
const ALLOWED_ORIGIN_LINES = [
    // key-verify probes: verification means asking the thing the key unlocks
    // (AC-10). The request carries the key being tested, nothing about usage.
    { path: "src/lib/onboarding/key-verify.ts", host: "api.openai.com" },
];

const ANALYTICS_IMPORT =
    /from\s+["'](?:posthog|mixpanel|amplitude|@amplitude|@segment|segment|react-ga|react-gtm|@sentry|@vercel\/analytics|@vercel\/speed-insights|plausible|umami|heap|hotjar|fullstory|logrocket|datadog|@datadog)/;
const ANALYTICS_DEP =
    /^(?:posthog|mixpanel|amplitude|@amplitude\/|@segment\/|analytics|react-ga|@sentry\/|@vercel\/analytics|@vercel\/speed-insights|plausible|umami|heap|hotjar|fullstory|logrocket|@datadog\/)/;
const BEACON = /\bsendBeacon\s*\(/;
const EXTERNAL_FETCH = /\bfetch\s*\(\s*[`"']https?:\/\/([^/`"']+)/;
const EXTERNAL_XHR =
    /\.open\s*\(\s*[`"']\w+[`"']\s*,\s*[`"']https?:\/\/([^/`"']+)/;

const SKIP_DIRS = new Set(["node_modules", ".next", "telemetry-fixture"]);
// The fixture must stay scannable when it IS the target.
const skipDirs = isRealTree ? SKIP_DIRS : new Set(["node_modules", ".next"]);

function* walk(dir) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            if (!skipDirs.has(entry)) yield* walk(full);
        } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) {
            yield full;
        }
    }
}

const violations = [];

for (const file of walk(target)) {
    const rel = relative(process.cwd(), file);
    // Tests exercise these shapes on purpose (mock probes, fixtures).
    if (/\.test\.[tj]sx?$/.test(rel)) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
        const where = `${rel}:${i + 1}`;
        if (BEACON.test(line)) {
            violations.push(`${where} — sendBeacon (beacon transport)`);
            return;
        }
        if (ANALYTICS_IMPORT.test(line)) {
            violations.push(`${where} — analytics SDK import`);
            return;
        }
        const external = EXTERNAL_FETCH.exec(line) ?? EXTERNAL_XHR.exec(line);
        if (external) {
            const host = external[1];
            const allowed = ALLOWED_ORIGIN_LINES.some(
                (a) => rel === a.path && host === a.host,
            );
            if (!allowed) {
                violations.push(
                    `${where} — request to non-app origin ${host} (not in the allowlist)`,
                );
            }
        }
    });
}

if (isRealTree) {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    for (const dep of Object.keys({
        ...pkg.dependencies,
        ...pkg.devDependencies,
    })) {
        if (ANALYTICS_DEP.test(dep)) {
            violations.push(`package.json — analytics dependency ${dep}`);
        }
    }
}

if (violations.length > 0) {
    console.error(`FAIL: ${violations.length} telemetry sink(s):`);
    for (const v of violations) console.error(`  ${v}`);
    process.exit(1);
}

console.log(`ok — no telemetry transport shape in ${target}`);
