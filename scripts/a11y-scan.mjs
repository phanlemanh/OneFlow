#!/usr/bin/env node
/* a11y-scan — run axe-core INSIDE a real Chrome page and report violations.
 *
 * Why this exists rather than the kit's jsdom-based design gate: this repo's
 * stylesheet uses `oklch()`, `color-mix()`, `:is()` and `@supports`, which
 * jsdom's CSS parser rejects ("Could not parse CSS stylesheet" x19 on a single
 * page). With no parsed CSS there are no computed colours, so a contrast check
 * running there measures nothing and still reports PASS — a green that means
 * "the tool could not look", which is worse than a red.
 *
 * axe-core runs in the page, so it reads the same computed styles the user's
 * eye does. Contrast is measured, not inferred.
 *
 * Usage:
 *   node scripts/a11y-scan.mjs <url> [<url> ...] [--fail-on critical,serious]
 *                                    [--w px] [--h px] [--wait ms] [--json out.json]
 *
 * Exit: 0 clean · 1 violations at or above the fail-on threshold · 2 bad usage
 *       · 3 could not run (no Chrome, page unreachable).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import puppeteer from "puppeteer-core";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const VAL_FLAGS = ["--fail-on", "--w", "--h", "--wait", "--json"];
const flag = (n, d) => {
    const i = args.indexOf(n);
    return i >= 0 ? args[i + 1] : d;
};

const urls = [];
for (let i = 0; i < args.length; i++) {
    if (VAL_FLAGS.includes(args[i])) {
        i++;
        continue;
    }
    if (args[i].startsWith("--")) continue;
    urls.push(args[i]);
}
if (urls.length === 0) {
    console.error(
        "usage: a11y-scan <url> [<url> ...] [--fail-on critical,serious] [--w px] [--h px] [--wait ms] [--json out.json]",
    );
    process.exit(2);
}

const failOn = String(flag("--fail-on", "critical,serious"))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const width = Number(flag("--w", 1280));
const height = Number(flag("--h", 800));
const waitMs = Number(flag("--wait", 600));
const jsonOut = flag("--json", null);

const CHROME = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
].filter(Boolean);
const exe = CHROME.find((p) => {
    try {
        return existsSync(p);
    } catch {
        return false;
    }
});
if (!exe) {
    console.error("a11y-scan: no Chrome/Chromium found — set CHROME_PATH");
    process.exit(3);
}

const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const report = { failOn, pages: [], totals: {} };
const browser = await puppeteer.launch({
    executablePath: exe,
    headless: "new",
    args: ["--no-sandbox"],
});
try {
    for (const url of urls) {
        const page = await browser.newPage();
        await page.setViewport({ width, height });
        try {
            await page.goto(url, {
                waitUntil: "networkidle2",
                timeout: 30000,
            });
        } catch (e) {
            console.error(`a11y-scan: cannot reach ${url} — ${e.message}`);
            process.exit(3);
        }
        await new Promise((r) => setTimeout(r, waitMs));
        await page.evaluate(axeSource);
        const results = await page.evaluate(async () => {
            // eslint-disable-next-line no-undef
            return await window.axe.run(document, {
                resultTypes: ["violations"],
            });
        });
        const violations = results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.length,
            sample: v.nodes[0]?.failureSummary?.split("\n")[1]?.trim() ?? null,
        }));
        report.pages.push({ url, violations });
        await page.close();
    }
} finally {
    await browser.close();
}

for (const p of report.pages) {
    for (const v of p.violations) {
        report.totals[v.impact] = (report.totals[v.impact] ?? 0) + 1;
    }
}

// A scan that reached no page proves nothing; refuse to call that clean.
if (report.pages.length === 0) {
    console.error("a11y-scan: no page was scanned");
    process.exit(3);
}

const blocking = report.pages.flatMap((p) =>
    p.violations
        .filter((v) => failOn.includes(v.impact))
        .map((v) => ({ url: p.url, ...v })),
);
report.blocking = blocking.length;
report.verdict = blocking.length === 0 ? "PASS" : "REJECT";

const text = JSON.stringify(report, null, 2);
if (jsonOut) {
    mkdirSync(dirname(jsonOut), { recursive: true });
    writeFileSync(jsonOut, text, "utf8");
}
console.log(text);

if (blocking.length > 0) {
    console.error(
        `a11y-scan: ${blocking.length} violation(s) at [${failOn.join(", ")}]`,
    );
    process.exit(1);
}
