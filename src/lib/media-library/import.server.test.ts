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
import { startStub, type StubHandle } from "./__fixtures__/stub-server";
import { importAsset } from "./import.server";

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
