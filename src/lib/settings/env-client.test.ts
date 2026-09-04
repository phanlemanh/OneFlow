/**
 * E-support for AC-10 and AC-12 — the browser-side reader and its two writers.
 *
 * Mocking `fetch` here is not a lowered bar: in this environment there is no
 * server, so `fetch` IS the boundary of the thing under test. What these cases
 * assert is exactly what the criteria say — what does and does not LEAVE the
 * browser. The server half has its own evidence in the parent dossier.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { healthyRead, READ_FAILURES } from "./__fixtures__/read-failures";
import {
    readEnvForBrowser,
    replaceUnreadableStore,
    saveEnvKeys,
} from "./env-client";

afterEach(() => vi.unstubAllGlobals());

const putsOf = (f: ReturnType<typeof vi.fn>) =>
    f.mock.calls.filter(
        (c: unknown[]) => (c[1] as RequestInit | undefined)?.method === "PUT",
    );

describe("readEnvForBrowser — the gate is a positive assertion", () => {
    it("reports ok only for a 200 carrying a plain object", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => healthyRead()),
        );
        const read = await readEnvForBrowser();
        expect(read.state).toBe("ok");
        if (read.state === "ok") {
            expect(read.env).toEqual({ OPENAI_API_KEY: "sk-1" });
        }
    });

    for (const [name, make] of READ_FAILURES) {
        it(`never reports ok for ${name}`, async () => {
            vi.stubGlobal(
                "fetch",
                vi.fn(async () => make()),
            );
            const read = await readEnvForBrowser();
            // Which non-ok state each shape maps to is the taxonomy suite's
            // job (env-client.taxonomy.test.ts). What THIS suite protects is
            // the older, blunter invariant: no failed read is ever mistaken
            // for a good one.
            expect(read.state, `shape ${name} must not be ok`).not.toBe("ok");
        });
    }
});

describe("saveEnvKeys — refuses to write onto a store it cannot read", () => {
    for (const [name, make] of READ_FAILURES) {
        it(`sends no PUT for ${name}`, async () => {
            const f = vi.fn(async (_url: string, init?: RequestInit) =>
                init?.method === "PUT" ? healthyRead() : make(),
            );
            vi.stubGlobal("fetch", f);

            const out = await saveEnvKeys({ OPENAI_API_KEY: "sk-2" });

            expect(out.ok, `shape ${name}`).toBe(false);
            if (!out.ok)
                expect(out.reason, `shape ${name}`).toBe("read-failed");
            const puts = putsOf(f);
            expect(
                puts.length,
                `shape ${name} sent ${puts.length} PUT(s) — nothing may leave the browser`,
            ).toBe(0);
        });
    }

    it("POSITIVE CONTROL: a healthy store sends exactly one PUT, and it MERGES", async () => {
        // Without this case a saveEnvKeys that never writes at all would
        // satisfy every refusal above.
        const f = vi.fn(async (_url: string, init?: RequestInit) =>
            init?.method === "PUT"
                ? new Response(JSON.stringify({ env: {}, verdicts: {} }), {
                      status: 200,
                  })
                : healthyRead({ KEEP_ME: "yes" }),
        );
        vi.stubGlobal("fetch", f);

        const out = await saveEnvKeys({ NEW: "v" });

        expect(out.ok).toBe(true);
        const puts = putsOf(f);
        expect(puts.length).toBe(1);
        // PUT replaces the whole map, so a write that does not merge is the
        // original data-loss bug wearing a new hat.
        expect(
            JSON.parse(String((puts[0][1] as RequestInit).body)).env,
        ).toEqual({ KEEP_ME: "yes", NEW: "v" });
    });
});

describe("replaceUnreadableStore — the destructive write", () => {
    it("sends exactly one flagged PUT with an EMPTY env, and reads nothing first", async () => {
        const f = vi.fn(
            async () =>
                new Response(JSON.stringify({ env: {} }), { status: 200 }),
        );
        vi.stubGlobal("fetch", f);

        await replaceUnreadableStore();

        const puts = putsOf(f);
        expect(puts.length).toBe(1);
        const body = JSON.parse(String((puts[0][1] as RequestInit).body));
        expect(body.replaceUnreadableStore).toBe(true);
        // A body missing `env`, or carrying the old rubbish, means the user
        // accepted losing their keys and the store stayed broken — the one
        // guard rail leading nowhere.
        expect(body.env, `body was ${JSON.stringify(body)}`).toEqual({});
        expect(
            f.mock.calls.filter(
                (c: unknown[]) =>
                    ((c[1] as RequestInit | undefined)?.method ?? "GET") ===
                    "GET",
            ).length,
            "no read first — the store is unreadable by definition",
        ).toBe(0);
    });

    it("reports write-failed rather than throwing when the write itself fails", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response("nope", { status: 500 })),
        );
        const out = await replaceUnreadableStore();
        expect(out.ok).toBe(false);
        if (!out.ok) expect(out.reason).toBe("write-failed");
    });
});
