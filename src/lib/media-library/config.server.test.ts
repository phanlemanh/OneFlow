import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const store = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
    // `resolveConfig` reads through `readEnvStore` so it can tell an unreadable
    // store from an unconfigured one. This fake always reports a healthy store,
    // which is the condition every case in this file is about; the unreadable
    // paths have their own suite in config.server.unreadable.test.ts, on a real
    // temp dir rather than a fake.
    readEnvStore: async () => ({ state: "ok", env: { ...store.env } }),
}));

import { resolveConfig } from "./config.server";

describe("resolveConfig — names what is missing (E1)", () => {
    beforeEach(() => {
        store.env = {};
        delete process.env.MEDIA_LIBRARY_URL;
        delete process.env.MEDIA_LIBRARY_API_KEY;
    });

    it("names MEDIA_LIBRARY_URL when only the url is missing", async () => {
        store.env = { MEDIA_LIBRARY_API_KEY: "k" };
        const result = await resolveConfig();
        expect(result.ok).toBe(false);
        if (result.ok || result.kind !== "missing") return;
        expect(result.missing).toEqual(["MEDIA_LIBRARY_URL"]);
        expect(result.message).toContain("MEDIA_LIBRARY_URL");
    });

    it("names BOTH variables when both are missing", async () => {
        const result = await resolveConfig();
        expect(result.ok).toBe(false);
        if (result.ok || result.kind !== "missing") return;
        expect(result.missing).toEqual([
            "MEDIA_LIBRARY_URL",
            "MEDIA_LIBRARY_API_KEY",
        ]);
        expect(result.message).toContain("MEDIA_LIBRARY_URL");
        expect(result.message).toContain("MEDIA_LIBRARY_API_KEY");
    });

    /**
     * The load-bearing half. A function that always reported "missing" would
     * satisfy every assertion above and break the product completely.
     */
    it("reports ok when both are present, and trims the trailing slash", async () => {
        store.env = {
            MEDIA_LIBRARY_URL: "https://lib.example/",
            MEDIA_LIBRARY_API_KEY: "k",
        };
        const result = await resolveConfig();
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.config.baseUrl).toBe("https://lib.example");
        expect(result.config.apiKey).toBe("k");
    });

    it("treats a whitespace-only value as missing", async () => {
        store.env = { MEDIA_LIBRARY_URL: "   ", MEDIA_LIBRARY_API_KEY: "k" };
        const result = await resolveConfig();
        expect(result.ok).toBe(false);
        if (result.ok || result.kind !== "missing") return;
        expect(result.missing).toEqual(["MEDIA_LIBRARY_URL"]);
    });
});
