#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
/* ui-capture.reference.mjs — REFERENCE implementation of `config:capture.ui`.
 *
 * The Acceptance-Gate Kit delegates UI screenshot-to-file to the consumer repo
 * (the kit itself ships NO browser dependency — it stays pure Node/shell). This
 * is a starting point you OWN; adapt it.
 *
 * Why it exists: `preview_screenshot` and most browser tools return an INLINE
 * image, not a saved file — but the Gate-2 evidence-page slideshow needs frames
 * on disk (`evidence/E{id}-step{n}.png`). This writes them.
 *
 * Adopt:
 *   cp <plugin>/skills/acceptance/references/ui-capture.reference.mjs scripts/ui-capture.mjs
 *   npm i -D puppeteer-core           # drives an EXISTING Chrome — no heavy download
 *   package.json scripts: "ui:capture": "node scripts/ui-capture.mjs"
 *   _acceptance/config.yaml:
 *     capture:
 *       ui: "npm run ui:capture"
 * The dependency lives in YOUR package.json, not in the plugin.
 *
 * Usage: node scripts/ui-capture.mjs <url> <out.png> [--wait <ms>] [--full] [--w <px>] [--h <px>]
 * Set CHROME_PATH if Chrome/Chromium isn't at a default location.
 */
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const flag = (n, d) => {
    const i = args.indexOf(n);
    return i >= 0 ? args[i + 1] : d;
};
const VAL_FLAGS = ["--wait", "--w", "--h", "--html"];
const pos = [];
for (let i = 0; i < args.length; i++) {
    if (VAL_FLAGS.includes(args[i])) {
        i++;
        continue;
    } // skip flag + its value
    if (args[i].startsWith("--")) continue; // bare flag (--full)
    pos.push(args[i]);
}
const [url, out] = pos;
if (!url || !out) {
    console.error(
        "usage: ui-capture <url> <out.png> [--wait ms] [--full] [--w px] [--h px] [--html out.html]",
    );
    process.exit(2);
}
const waitMs = Number(flag("--wait", 600));
const width = Number(flag("--w", 390)); // mobile-first default — adjust per persona
const height = Number(flag("--h", 844));
const fullPage = args.includes("--full");

const CANDIDATES = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
].filter(Boolean);
const exe = CANDIDATES.find((p) => {
    try {
        return existsSync(p);
    } catch {
        return false;
    }
});
if (!exe) {
    console.error(
        "ui-capture: no Chrome/Chromium found — set CHROME_PATH to the executable",
    );
    process.exit(2);
}

mkdirSync(dirname(out), { recursive: true });
const browser = await puppeteer.launch({
    executablePath: exe,
    headless: "new",
    args: ["--no-sandbox"],
});
try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, waitMs));
    await page.screenshot({ path: out, fullPage });
    console.log(`saved ${out}`);

    // --html <path>: also dump the rendered DOM with every same-origin
    // stylesheet inlined.
    //
    // The design gate reads HTML and computes contrast through jsdom. A bare
    // outerHTML dump is not enough: jsdom does not fetch external stylesheets,
    // so every colour would resolve to a default and the gate would report a
    // clean sheet it never actually measured — the exact shape of a green that
    // means nothing. Inlining the CSS text is what makes the measurement real.
    const htmlOut = flag("--html", null);
    if (htmlOut) {
        const html = await page.evaluate(() => {
            const css = Array.from(document.styleSheets)
                .map((sheet) => {
                    try {
                        return Array.from(sheet.cssRules)
                            .map((r) => r.cssText)
                            .join("\n");
                    } catch {
                        // Cross-origin sheet: rules are not readable. Skipped
                        // knowingly rather than silently pretending it applied.
                        return "";
                    }
                })
                .filter(Boolean)
                .join("\n");
            const doc = document.documentElement.cloneNode(true);
            doc.querySelectorAll("link[rel=stylesheet], script").forEach((n) =>
                n.remove(),
            );
            const style = document.createElement("style");
            style.textContent = css;
            doc.querySelector("head")?.appendChild(style);
            return `<!doctype html>\n${doc.outerHTML}`;
        });
        mkdirSync(dirname(htmlOut), { recursive: true });
        writeFileSync(htmlOut, html, "utf8");
        console.log(`saved ${htmlOut}`);
    }
} finally {
    await browser.close();
}
