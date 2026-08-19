import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const store = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
}));

const saved = vi.hoisted(() => ({ calls: [] as string[] }));
vi.mock("@/lib/file/file-utils", () => ({
    saveFile: async (_data: Buffer, ext: string) => {
        saved.calls.push(ext);
        return `key.${ext}`;
    },
}));

const realFetch = globalThis.fetch;

const assetDetail = (original: string) =>
    new Response(
        JSON.stringify({
            card: { id: "a" },
            urls: { original, proxy: null, thumb: null },
            expires_in_s: 900,
            contracts_version: "0.2.0",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
    );

const importRequest = () =>
    new Request("http://localhost/api/media-library/import", {
        method: "POST",
        body: JSON.stringify({
            assetId: "11111111-1111-4111-8111-111111111111",
        }),
    });

beforeEach(() => {
    saved.calls.length = 0;
    store.env = {
        MEDIA_LIBRARY_URL: "https://lib.example",
        MEDIA_LIBRARY_API_KEY: "k",
    };
    vi.resetModules();
});

afterEach(() => {
    globalThis.fetch = realFetch;
});

/**
 * The point of this whole suite: `import.server.ts` can carry perfect guards and
 * the ROUTE can still bypass them — a helper that fetches any URL with no checks
 * lives one import away in file-utils. Every assertion below drives the real
 * route handler, with only the network and the store stubbed; there is no other
 * injection point. Same shape as src/app/api/settings/env/route.test.ts.
 */
describe("POST /api/media-library/import — the road, not the function (E26)", () => {
    it("refuses a link-local signed URL and creates no file", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).includes("/v1/assets/")) {
                return assetDetail("http://169.254.169.254/latest/meta-data/");
            }
            throw new Error("the route must never fetch that URL");
        }) as unknown as typeof fetch;

        const { POST } = await import("./import/route");
        const response = await POST(importRequest());

        expect(response.status).toBeGreaterThanOrEqual(400);
        const body = await response.json();
        expect(String(body.message)).toMatch(/https|nội bộ/i);
        expect(saved.calls).toHaveLength(0);
    });

    /**
     * POSITIVE CONTROL: a route that refused everything would pass the case
     * above while shipping a node that can never import anything.
     */
    it("imports a clean https asset and answers with a fileKey", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).includes("/v1/assets/")) {
                return assetDetail("https://cdn.example/clip.mp4");
            }
            return new Response(Buffer.from("bytes"), {
                status: 200,
                headers: { "content-type": "video/mp4" },
            });
        }) as unknown as typeof fetch;

        const { POST } = await import("./import/route");
        const response = await POST(importRequest());

        expect(response.status).toBe(200);
        expect((await response.json()).fileKey).toBe("key.mp4");
        expect(saved.calls).toEqual(["mp4"]);
    });

    it("refuses a plain http signed URL on a public host", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).includes("/v1/assets/")) {
                return assetDetail("http://cdn.example/clip.mp4");
            }
            throw new Error("the route must never fetch that URL");
        }) as unknown as typeof fetch;

        const { POST } = await import("./import/route");
        const response = await POST(importRequest());

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(saved.calls).toHaveLength(0);
    });
});

describe("POST /api/media-library/search — no config, no traffic (AC-1)", () => {
    it("makes ZERO network calls when the key store is empty", async () => {
        store.env = {};
        delete process.env.MEDIA_LIBRARY_URL;
        delete process.env.MEDIA_LIBRARY_API_KEY;
        const spy = vi.fn(async () => new Response("{}", { status: 200 }));
        globalThis.fetch = spy as unknown as typeof fetch;

        const { POST } = await import("./search/route");
        const response = await POST(
            new Request("http://localhost/api/media-library/search", {
                method: "POST",
                body: JSON.stringify({ intent: "ban công hướng hồ" }),
            }),
        );

        expect(spy).toHaveBeenCalledTimes(0);
        const body = await response.json();
        expect(body.code).toBe("MISSING_CONFIG");
        expect(String(body.message)).toContain("MEDIA_LIBRARY_URL");
        expect(String(body.message)).toContain("MEDIA_LIBRARY_API_KEY");
    });

    /** Load-bearing: with config present the same route DOES reach the network. */
    it("does call the network once configured", async () => {
        const spy = vi.fn(
            async () =>
                new Response(
                    JSON.stringify({
                        cards: [],
                        candidates: 0,
                        skipped: 0,
                        warnings: [],
                        contracts_version: "0.2.0",
                    }),
                    {
                        status: 200,
                        headers: { "content-type": "application/json" },
                    },
                ),
        );
        globalThis.fetch = spy as unknown as typeof fetch;

        const { POST } = await import("./search/route");
        const response = await POST(
            new Request("http://localhost/api/media-library/search", {
                method: "POST",
                body: JSON.stringify({ intent: "x" }),
            }),
        );

        expect(response.status).toBe(200);
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
