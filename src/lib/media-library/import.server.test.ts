import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const store = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
}));

const saved = vi.hoisted(() => ({
    calls: [] as Array<{ data: Buffer; ext: string }>,
}));
vi.mock("@/lib/file/file-utils", () => ({
    saveFile: async (data: Buffer, ext: string) => {
        saved.calls.push({ data, ext });
        return `nanoid${saved.calls.length}.${ext}`;
    },
}));

import { VIDEO_CARD } from "./__fixtures__/cards";
import { type StubHandle, startStub } from "./__fixtures__/stub-server";
import { importAsset, readCapped } from "./import.server";

const BYTES = Buffer.from("pretend this is an mp4 file");
const realFetch = globalThis.fetch;

let stub: StubHandle | undefined;

beforeEach(() => {
    saved.calls.length = 0;
    delete process.env.MEDIA_LIBRARY_URL;
    delete process.env.MEDIA_LIBRARY_API_KEY;
});

afterEach(async () => {
    globalThis.fetch = realFetch;
    await stub?.close();
    stub = undefined;
});

/** Serve the asset detail from the stub, with `original` pointing wherever we say. */
async function stubServing(original: string, opts: { bytes?: Buffer } = {}) {
    stub = await startStub({
        bytes: opts.bytes ?? BYTES,
        assetResponse: {
            card: VIDEO_CARD,
            urls: { original, proxy: null, thumb: null },
            expires_in_s: 900,
            contracts_version: "0.2.0",
        },
    });
    store.env = {
        MEDIA_LIBRARY_URL: stub.url,
        MEDIA_LIBRARY_API_KEY: "k",
    };
    return stub;
}

describe("importAsset — bytes reach the store intact (E15)", () => {
    it("calls GET /v1/assets/:id, downloads urls.original, and saves those exact bytes", async () => {
        // The stub spells its own signed URL: the port only exists after listen.
        stub = await startStub({
            bytes: BYTES,
            assetOriginalPath: "/bytes/clip.mp4",
        });
        const handle = stub;
        store.env = {
            MEDIA_LIBRARY_URL: stub.url,
            MEDIA_LIBRARY_API_KEY: "k",
        };

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(true);
        expect(
            handle.requests.some((r) =>
                r.path.startsWith(`/v1/assets/${VIDEO_CARD.id}`),
            ),
        ).toBe(true);
        expect(saved.calls).toHaveLength(1);
        const got = createHash("sha256")
            .update(saved.calls[0].data)
            .digest("hex");
        const want = createHash("sha256").update(BYTES).digest("hex");
        expect(got).toBe(want);
    });

    /**
     * SUPPRESSION — the load-bearing half: a save-then-check implementation
     * leaves an empty or partial file behind when the download fails.
     */
    it("saves NOTHING when the signed URL cannot be fetched", async () => {
        await stubServing("https://127.0.0.256/gone.mp4");

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(false);
        expect(saved.calls).toHaveLength(0);
    });
});

describe("importAsset — the three guards (E17)", () => {
    it("refuses a non-https signed URL by name", async () => {
        await stubServing("http://cdn.example/clip.mp4");

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.failure.message).toMatch(/https/i);
        expect(saved.calls).toHaveLength(0);
    });

    it("refuses a link-local host even over https", async () => {
        await stubServing("https://169.254.169.254/latest/meta-data/");

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.failure.message).toMatch(/nội bộ/i);
        expect(saved.calls).toHaveLength(0);
    });

    /**
     * POSITIVE CONTROL: without this, a function that refused everything would
     * pass both refusals above and ship a node that can never import anything.
     */
    it("accepts an https URL on a public host", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).includes("/v1/assets/")) {
                return new Response(
                    JSON.stringify({
                        card: VIDEO_CARD,
                        urls: {
                            original: "https://cdn.example/clip.mp4",
                            proxy: null,
                            thumb: null,
                        },
                        expires_in_s: 900,
                        contracts_version: "0.2.0",
                    }),
                    {
                        status: 200,
                        headers: { "content-type": "application/json" },
                    },
                );
            }
            return new Response(BYTES, {
                status: 200,
                headers: { "content-type": "video/mp4" },
            });
        }) as unknown as typeof fetch;
        store.env = {
            MEDIA_LIBRARY_URL: "https://lib.example",
            MEDIA_LIBRARY_API_KEY: "k",
        };

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(true);
        expect(saved.calls).toHaveLength(1);
        expect(saved.calls[0].ext).toBe("mp4");
    });

    /**
     * The guard bypass the adversarial review found: `fetch` defaults to
     * `redirect: "follow"`, so checking only the URL the library named leaves
     * every guard one hop deep. A signed URL that passes can 302 anywhere.
     */
    it("re-guards every redirect hop, so a 302 to a link-local host is refused", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes("/v1/assets/")) {
                return new Response(
                    JSON.stringify({
                        card: VIDEO_CARD,
                        urls: {
                            original: "https://cdn.example/clip.mp4",
                            proxy: null,
                            thumb: null,
                        },
                        expires_in_s: 900,
                        contracts_version: "0.2.0",
                    }),
                    {
                        status: 200,
                        headers: { "content-type": "application/json" },
                    },
                );
            }
            if (url === "https://cdn.example/clip.mp4") {
                return new Response(null, {
                    status: 302,
                    headers: {
                        location: "http://169.254.169.254/latest/meta-data/",
                    },
                });
            }
            // Reaching here means the redirect was followed — the bug.
            return new Response(Buffer.from("secrets"), {
                status: 200,
                headers: { "content-type": "video/mp4" },
            });
        }) as unknown as typeof fetch;
        store.env = {
            MEDIA_LIBRARY_URL: "https://lib.example",
            MEDIA_LIBRARY_API_KEY: "k",
        };

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.failure.message).toMatch(/nội bộ/i);
        expect(saved.calls).toHaveLength(0);
    });

    /** POSITIVE CONTROL: a redirect to a legitimate public https host still works. */
    it("follows a redirect to another public https host", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes("/v1/assets/")) {
                return new Response(
                    JSON.stringify({
                        card: VIDEO_CARD,
                        urls: {
                            original: "https://cdn.example/clip.mp4",
                            proxy: null,
                            thumb: null,
                        },
                        expires_in_s: 900,
                        contracts_version: "0.2.0",
                    }),
                    {
                        status: 200,
                        headers: { "content-type": "application/json" },
                    },
                );
            }
            if (url === "https://cdn.example/clip.mp4") {
                return new Response(null, {
                    status: 302,
                    headers: { location: "https://edge.example/clip.mp4" },
                });
            }
            return new Response(BYTES, {
                status: 200,
                headers: { "content-type": "video/mp4" },
            });
        }) as unknown as typeof fetch;
        store.env = {
            MEDIA_LIBRARY_URL: "https://lib.example",
            MEDIA_LIBRARY_API_KEY: "k",
        };

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(true);
        expect(saved.calls).toHaveLength(1);
    });

    /**
     * The other half the review found: with no content-length the declared-size
     * check reads 0 and the whole body lands in memory before anything objects.
     */
    it("refuses a body whose declared size is over the cap", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).includes("/v1/assets/")) {
                return new Response(
                    JSON.stringify({
                        card: VIDEO_CARD,
                        urls: {
                            original: "https://cdn.example/huge.mp4",
                            proxy: null,
                            thumb: null,
                        },
                        expires_in_s: 900,
                        contracts_version: "0.2.0",
                    }),
                    {
                        status: 200,
                        headers: { "content-type": "application/json" },
                    },
                );
            }
            return new Response(BYTES, {
                status: 200,
                headers: {
                    "content-type": "video/mp4",
                    "content-length": String(3 * 1024 * 1024 * 1024),
                },
            });
        }) as unknown as typeof fetch;
        store.env = {
            MEDIA_LIBRARY_URL: "https://lib.example",
            MEDIA_LIBRARY_API_KEY: "k",
        };

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.failure.message).toMatch(/trần kích thước/i);
        expect(saved.calls).toHaveLength(0);
    });
});

/**
 * The streaming cap, measured directly with a small ceiling so the test does
 * not have to allocate a gigabyte to prove the point.
 *
 * The bug this closes: with no content-length the declared-size check reads 0,
 * so the old code buffered the WHOLE body before anything could object. A
 * chunked upstream could therefore push unbounded bytes into the process.
 */
describe("readCapped — the cap survives a missing content-length (E17)", () => {
    const streamOf = (buf: Buffer, headers: Record<string, string>) =>
        new Response(
            new ReadableStream({
                start(controller) {
                    // Two chunks, so the running total crosses the cap mid-read.
                    controller.enqueue(
                        new Uint8Array(buf.subarray(0, buf.length / 2)),
                    );
                    controller.enqueue(
                        new Uint8Array(buf.subarray(buf.length / 2)),
                    );
                    controller.close();
                },
            }),
            { status: 200, headers },
        );

    it("refuses an oversize chunked body that declares NO content-length", async () => {
        const body = Buffer.alloc(4096, 7);
        const result = await readCapped(
            streamOf(body, { "content-type": "video/mp4" }),
            1024,
        );
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.failure.message).toMatch(/trần kích thước/i);
    });

    /** POSITIVE CONTROL: a body under the cap still reads through intact. */
    it("reads a body under the cap byte-for-byte", async () => {
        const body = Buffer.from("small clip bytes");
        const result = await readCapped(
            streamOf(body, { "content-type": "video/mp4" }),
            1024,
        );
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.buffer.equals(body)).toBe(true);
    });

    it("still refuses on the DECLARED size, one round-trip earlier", async () => {
        const result = await readCapped(
            new Response(Buffer.from("x"), {
                status: 200,
                headers: { "content-length": "999999" },
            }),
            1024,
        );
        expect(result.ok).toBe(false);
    });
});
