import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const store = vi.hoisted(() => ({
    env: {} as Record<string, string>,
    // "ok" unless a test says otherwise. The third state exists because a
    // store we cannot read must never be reported the same way as a store
    // that is merely empty — the empty answer sends the user off to re-enter
    // keys, which is the path that overwrites the ones they still have.
    unreadable: false,
}));
vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
    readEnvStore: async () =>
        store.unreadable
            ? { state: "unreadable", reason: "decode" }
            : { state: "ok", env: { ...store.env } },
}));

import { resolveConfig } from "./config.server";

describe("resolveConfig — names what is missing (E1)", () => {
    beforeEach(() => {
        store.env = {};
        store.unreadable = false;
        delete process.env.MEDIA_LIBRARY_URL;
        delete process.env.MEDIA_LIBRARY_API_KEY;
    });

    it("names MEDIA_LIBRARY_URL when only the url is missing", async () => {
        store.env = { MEDIA_LIBRARY_API_KEY: "k" };
        const result = await resolveConfig();
        expect(result.ok).toBe(false);
        if (result.ok || result.unreadable) return;
        expect(result.missing).toEqual(["MEDIA_LIBRARY_URL"]);
        expect(result.message).toContain("MEDIA_LIBRARY_URL");
    });

    it("names BOTH variables when both are missing", async () => {
        const result = await resolveConfig();
        expect(result.ok).toBe(false);
        if (result.ok || result.unreadable) return;
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
        if (result.ok || result.unreadable) return;
        expect(result.missing).toEqual(["MEDIA_LIBRARY_URL"]);
    });
});

describe("resolveConfig — an unreadable store is its own answer (E9)", () => {
    beforeEach(() => {
        store.env = {};
        store.unreadable = false;
        delete process.env.MEDIA_LIBRARY_URL;
        delete process.env.MEDIA_LIBRARY_API_KEY;
    });

    it("reports an unreadable store under its own code", async () => {
        store.unreadable = true;
        const result = await resolveConfig();
        expect(result).toMatchObject({
            ok: false,
            code: "ENV_STORE_UNREADABLE",
        });
    });

    it("never tells the user to re-enter keys when the store is unreadable", async () => {
        store.unreadable = true;
        const result = await resolveConfig();
        expect(result.ok).toBe(false);
        if (result.ok) return;
        // Pinned string, not an inequality: two different sentences can both
        // walk the user into the data-loss path, and a "these differ" check
        // would call that a pass.
        expect(result.message).not.toMatch(/nhập lại|nhập khoá|enter.*key/i);
    });

    it("still names the missing variables when the store is merely empty", async () => {
        // Positive control. Collapsing both cases into one message satisfies
        // the assertion above and breaks the behaviour add-media-library owns.
        const result = await resolveConfig();
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.message).toContain("MEDIA_LIBRARY_URL");
        expect(result).not.toHaveProperty("code");
    });
});
