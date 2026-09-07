#!/usr/bin/env node
// Ephemeral verifier script for eval E4 (AC-2) — independent UI check.
// Fresh browser profile (empty localStorage => "kho khoá RỖNG"), navigates to
// /workspace, screenshots, clicks the "Image" icon in the always-on smart-island
// add-toolbar, screenshots again, and asserts no error banner/toast/console error.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.E4_URL || "http://localhost:3000";
const EVDIR = join(process.cwd(), "_acceptance/add-media-library/evidence");
mkdirSync(EVDIR, { recursive: true });

const CANDIDATES = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
].filter(Boolean);
const exe = CANDIDATES.find((p) => {
    try {
        return existsSync(p);
    } catch {
        return false;
    }
});

const browser = await puppeteer.launch({
    executablePath: exe,
    headless: "new",
    args: ["--no-sandbox"],
    userDataDir: undefined, // fresh temp profile each launch => empty localStorage
});

const consoleErrors = [];
const pageErrors = [];
const failEligible = [];
const allNetwork = [];

try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(String(err)));
    page.on("requestfailed", (req) => {
        const url = req.url();
        allNetwork.push({ url, kind: "requestfailed", detail: req.failure()?.errorText });
        if (url.startsWith(BASE)) {
            failEligible.push({ url, kind: "requestfailed", detail: req.failure()?.errorText });
        }
    });
    page.on("response", (res) => {
        const url = res.url();
        const status = res.status();
        allNetwork.push({ url, kind: "response", status });
        if (url.startsWith(BASE) && status >= 500) {
            failEligible.push({ url, kind: "response", status });
        }
    });

    // Step 1: empty key store, fresh /workspace
    await page.goto(`${BASE}/workspace`, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 900));

    const nodeCountBefore = await page.$$eval(".react-flow__node", (els) => els.length);

    const step1 = join(EVDIR, "E4-step1.png");
    await page.screenshot({ path: step1 });

    // Step 2: click the "Image" icon in the always-on add-toolbar (smart island)
    // Locate by matching the lucide "image" icon inside a button, scoped to the
    // bottom-center floating toolbar (rounded-2xl backdrop-blur container).
    const clickResult = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const candidates = buttons.filter((b) => {
            const svg = b.querySelector("svg");
            if (!svg) return false;
            const cls = svg.getAttribute("class") || "";
            return /lucide-image\b/.test(cls);
        });
        if (candidates.length === 0) return { ok: false, count: buttons.length, reason: "no lucide-image button found" };
        const btn = candidates[0];
        const rect = btn.getBoundingClientRect();
        btn.click();
        return { ok: true, count: candidates.length, rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height } };
    });

    await new Promise((r) => setTimeout(r, 900));

    const nodeCountAfter = await page.$$eval(".react-flow__node", (els) => els.length);

    const step2 = join(EVDIR, "E4-step2.png");
    await page.screenshot({ path: step2 });

    // Assert: no global error banner / toast visible
    const toastAlerts = await page.evaluate(() => {
        // react-hot-toast renders into a container; also scan for generic
        // role="alert" / role="status" elements with error-looking text.
        const texts = [];
        document.querySelectorAll('[role="alert"], [role="status"]').forEach((el) => {
            const t = (el.textContent || "").trim();
            if (t) texts.push(t);
        });
        // react-hot-toast toaster wrapper id
        document.querySelectorAll('[id^="_rht_toaster"] *').forEach((el) => {
            const t = (el.textContent || "").trim();
            if (t && el.children.length === 0) texts.push(t);
        });
        return texts;
    });

    const errorBannerText = await page.evaluate(() => {
        const texts = [];
        const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
        document.querySelectorAll("body *").forEach((el) => {
            if (SKIP_TAGS.has(el.tagName)) return;
            if (el.closest("script, style, noscript, template")) return;
            if (el.children.length > 0) return;
            // Only visible elements — offsetParent is null for display:none /
            // detached nodes (not for position:fixed, which this app's toolbar uses,
            // so this still catches a real visible banner).
            if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") return;
            const t = (el.textContent || "").trim();
            if (!t) return;
            if (/error|failed|exception|lỗi|thất bại/i.test(t)) texts.push(t);
        });
        return texts;
    });

    const result = {
        nodeCountBefore,
        nodeCountAfter,
        clickResult,
        toastAlerts,
        errorBannerText,
        consoleErrors,
        pageErrors,
        failEligible,
    };
    writeFileSync(join(EVDIR, "E4-result.json"), JSON.stringify(result, null, 2));
    writeFileSync(
        join(EVDIR, "E4-network.txt"),
        allNetwork.map((n) => JSON.stringify(n)).join("\n"),
    );
    console.log(JSON.stringify(result, null, 2));
} finally {
    await browser.close();
}
