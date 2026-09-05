import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    /**
     * HTTPS on purpose, and the message is pinned to the HOST wording.
     *
     * The first version of this case used `http://169.254.169.254/...` — a URL
     * that is wrong twice. `checkFetchTarget` tests the scheme BEFORE the host,
     * so it refused on the scheme and never reached `isPrivateHost`, and the
     * assertion `toMatch(/https|nội bộ/i)` went green on the word "https" from
     * the SCHEME refusal. Deleting the private-host branch outright left this
     * file entirely green — while E26 exists precisely to prove the route does
     * not route around that branch. Only the host rule can refuse this URL.
     */
    it("refuses an https link-local signed URL, naming the HOST", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).includes("/v1/assets/")) {
                return assetDetail("https://169.254.169.254/latest/meta-data/");
            }
            throw new Error("the route must never fetch that URL");
        }) as unknown as typeof fetch;

        const { POST } = await import("./import/route");
        const response = await POST(importRequest());

        expect(response.status).toBeGreaterThanOrEqual(400);
        const body = await response.json();
        // The host, verbatim — not an alternation that a scheme refusal also
        // satisfies.
        expect(String(body.message)).toContain("169.254.169.254");
        expect(String(body.message)).toContain("nội bộ");
        expect(saved.calls).toHaveLength(0);
    });

    /**
     * The other private spellings the route must refuse, each reachable ONLY
     * through the host rule because every one of them is https.
     */
    it.each([
        [
            "IPv4-mapped IPv6 loopback",
            "https://[::ffff:127.0.0.1]/clip.mp4",
            "::ffff:7f00:1",
        ],
        ["RFC1918", "https://10.0.0.5/clip.mp4", "10.0.0.5"],
        ["CGNAT", "https://100.64.0.1/clip.mp4", "100.64.0.1"],
    ])("refuses %s through the route", async (_label, url, hostInMessage) => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).includes("/v1/assets/")) return assetDetail(url);
            throw new Error("the route must never fetch that URL");
        }) as unknown as typeof fetch;

        const { POST } = await import("./import/route");
        const response = await POST(importRequest());

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(String((await response.json()).message)).toContain(
            hostInMessage,
        );
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

    /** The scheme rule, isolated: a PUBLIC host, so only the scheme can refuse. */
    it("refuses a plain http signed URL on a public host, naming the scheme", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).includes("/v1/assets/")) {
                return assetDetail("http://cdn.example/clip.mp4");
            }
            throw new Error("the route must never fetch that URL");
        }) as unknown as typeof fetch;

        const { POST } = await import("./import/route");
        const response = await POST(importRequest());

        expect(response.status).toBeGreaterThanOrEqual(400);
        // Pinned too: this case must fail on the SCHEME, so the two refusal
        // cases in this file prove two different rules rather than one twice.
        expect(String((await response.json()).message)).toContain("https");
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
        // The names travel as DATA, so the form can render one field per name
        // without parsing them back out of a sentence.
        expect(body.missing).toEqual([
            "MEDIA_LIBRARY_URL",
            "MEDIA_LIBRARY_API_KEY",
        ]);
        // ...and the sentence still names them, because that is what a person reads.
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
