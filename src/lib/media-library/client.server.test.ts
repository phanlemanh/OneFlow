import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const store = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
}));

import { VIDEO_CARD } from "./__fixtures__/cards";
import {
    type StubHandle,
    type StubOptions,
    startStub,
} from "./__fixtures__/stub-server";
import { searchVideos } from "./client.server";

let stub: StubHandle | undefined;

const point = (handle: StubHandle) => {
    store.env = {
        MEDIA_LIBRARY_URL: handle.url,
        MEDIA_LIBRARY_API_KEY: "secret-key",
    };
};

beforeEach(() => {
    delete process.env.MEDIA_LIBRARY_URL;
    delete process.env.MEDIA_LIBRARY_API_KEY;
});

afterEach(async () => {
    await stub?.close();
    stub = undefined;
});

describe("searchVideos — the request that leaves OneFlow (E5)", () => {
    it("sends POST /v1/search with Bearer auth, the intent, and a pinned media_type", async () => {
        stub = await startStub({
            searchResponse: {
                cards: [VIDEO_CARD],
                context: null,
                candidates: 1,
                skipped: 0,
                warnings: [],
                contracts_version: "0.2.0",
            },
        });
        point(stub);

        const result = await searchVideos("ban công hướng hồ");

        expect(result.ok).toBe(true);
        const request = stub.requests.at(-1);
        expect(request?.method).toBe("POST");
        expect(request?.path).toBe("/v1/search");
        // Anchored exactly like the service's own auth regex.
        expect(request?.headers.authorization).toMatch(/^Bearer secret-key$/);
        const body = request?.body as Record<string, unknown>;
        expect(body.intent).toBe("ban công hướng hồ");
        expect(body.media_type).toBe("video");
        expect(Number(body.limit)).toBeLessThanOrEqual(20);
    });

    /**
     * SUPPRESSION: the stub answers 401 when the header is absent, so an
     * adapter that forgot auth would fail loudly here rather than quietly
     * returning an empty result set.
     */
    it("the stub rejects an unauthenticated call, so a missing header cannot read as empty", async () => {
        stub = await startStub();
        const raw = await fetch(`${stub.url}/v1/search`, { method: "POST" });
        expect(raw.status).toBe(401);
    });
});

describe("searchVideos — the eight ways this boundary breaks (E10)", () => {
    const cases: Array<{ name: string; opts: StubOptions; code: string }> = [
        {
            name: "401 bad key",
            opts: {
                searchStatus: 401,
                searchResponse: {
                    error: "unauthorized",
                    contracts_version: "0.2.0",
                },
            },
            code: "AUTH_REJECTED",
        },
        {
            name: "403 missing scope",
            opts: {
                searchStatus: 403,
                searchResponse: {
                    error: "forbidden: cần scope search",
                    contracts_version: "0.2.0",
                },
            },
            code: "MISSING_SCOPE",
        },
        {
            name: "400 bad body",
            opts: {
                searchStatus: 400,
                searchResponse: {
                    error: "bad_request",
                    contracts_version: "0.2.0",
                },
            },
            code: "BAD_REQUEST",
        },
        {
            name: "404 not found",
            opts: {
                searchStatus: 404,
                searchResponse: {
                    error: "not_found",
                    contracts_version: "0.2.0",
                },
            },
            code: "NOT_FOUND",
        },
        {
            name: "500 bare",
            opts: { searchStatus: 500, searchResponse: {} },
            code: "UPSTREAM_ERROR",
        },
        {
            name: "501 dependency not wired",
            opts: {
                searchStatus: 501,
                searchResponse: {
                    error: "not_implemented",
                    contracts_version: "0.2.0",
                },
            },
            code: "NOT_IMPLEMENTED",
        },
        {
            name: "body is HTML, not JSON",
            opts: { nonJsonBody: true },
            code: "BAD_RESPONSE",
        },
    ];

    for (const testCase of cases) {
        it(`maps ${testCase.name} to ${testCase.code}`, async () => {
            stub = await startStub(testCase.opts);
            point(stub);
            const result = await searchVideos("x");
            expect(result.ok).toBe(false);
            if (result.ok) return;
            expect(result.failure.code).toBe(testCase.code);
        });
    }

    it("maps an unreachable host to NETWORK_ERROR", async () => {
        store.env = {
            MEDIA_LIBRARY_URL: "http://127.0.0.1:1",
            MEDIA_LIBRARY_API_KEY: "k",
        };
        const result = await searchVideos("x");
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.failure.code).toBe("NETWORK_ERROR");
    });

    /**
     * TEETH — the decisive case: classification reads status + `error`, never
     * the Vietnamese prose. An adapter matching on "cần scope" goes red here.
     */
    it("still classifies 403 when the message body is gibberish", async () => {
        stub = await startStub({
            searchStatus: 403,
            searchResponse: {
                error: "forbidden: xyzzy plugh",
                contracts_version: "0.2.0",
            },
        });
        point(stub);
        const result = await searchVideos("x");
        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.failure.code).toBe("MISSING_SCOPE");
    });

    /**
     * The matrix is only a matrix if the codes are DISTINCT — a mapper that
     * collapsed everything into UPSTREAM_ERROR would pass each case above on
     * its own if the expectations had been written loosely.
     */
    it("produces eight distinct codes across the matrix", async () => {
        const codes = new Set(cases.map((c) => c.code));
        codes.add("NETWORK_ERROR");
        expect(codes.size).toBe(8);
    });
});

describe("searchVideos — degraded results and the version pin", () => {
    it("carries warnings and counts through verbatim (E8)", async () => {
        stub = await startStub({
            searchResponse: {
                cards: [],
                context: null,
                candidates: 3,
                skipped: 1,
                warnings: ["embedding_unavailable"],
                contracts_version: "0.2.0",
            },
        });
        point(stub);
        const result = await searchVideos("x");
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.data.warnings).toEqual(["embedding_unavailable"]);
        expect(result.data.candidates).toBe(3);
        expect(result.data.skipped).toBe(1);
    });

    /** SUPPRESSION: an adapter that always reported degradation passes the half above. */
    it("reports no warnings on a clean response", async () => {
        stub = await startStub();
        point(stub);
        const result = await searchVideos("x");
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.data.warnings).toEqual([]);
    });

    it.each([
        ["1.0.0", false],
        ["0.3.0", false],
        ["0.2.5", true],
        // Load-bearing: an always-refuse pin passes every red case above and
        // would leave the node permanently dead.
        ["0.2.0", true],
    ])("contracts_version %s accepted=%s (E21)", async (version, accepted) => {
        stub = await startStub({ contractsVersion: version as string });
        point(stub);
        const result = await searchVideos("x");
        expect(result.ok).toBe(accepted);
        if (!result.ok) {
            expect(result.failure.code).toBe("VERSION_MISMATCH");
            expect(result.failure.message).toContain("0.2");
            expect(result.failure.message).toContain(version as string);
        }
    });
});

/**
 * The gap the adversarial review found: the version check ran only `if
 * (version)`, so a 200 that omits contracts_version entirely sailed through as
 * compatible and was cast straight into SearchResponse. An ABSENT contract line
 * is a mismatch, not a pass — that is the whole point of guarantee #7.
 */
describe("searchVideos — an absent contracts_version is a mismatch (E21)", () => {
    it("refuses a 200 that carries no contracts_version at all", async () => {
        stub = await startStub({
            searchResponse: {
                cards: [],
                context: null,
                candidates: 0,
                skipped: 0,
                warnings: [],
                // contracts_version deliberately absent
            },
        });
        point(stub);

        const result = await searchVideos("x");

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.failure.code).toBe("VERSION_MISMATCH");
        expect(result.failure.message).toContain("0.2");
    });

    /**
     * SUPPRESSION: error bodies may legitimately omit the field — a proxy's own
     * 502 page has never heard of it — so the requirement is scoped to success.
     * Without this half the fix would turn every upstream error into a version
     * mismatch and hide the real cause.
     */
    it("still classifies an error body that omits the field by its status", async () => {
        stub = await startStub({ searchStatus: 500, searchResponse: {} });
        point(stub);

        const result = await searchVideos("x");

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.failure.code).toBe("UPSTREAM_ERROR");
    });
});
