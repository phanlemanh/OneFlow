import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const store = vi.hoisted(() => ({ env: {} as Record<string, string> }));

vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
    // The route reads through `readEnvStore` so it can tell an unreadable store
    // from an empty one. This fake always reports a healthy store, which is the
    // condition every case in this file is about — the unreadable paths are
    // measured on a real temp dir in `route.unreadable.test.ts`.
    readEnvStore: async () => ({ state: "ok", env: { ...store.env } }),
    saveEnvStore: async (next: Record<string, string>) => {
        store.env = { ...next };
    },
}));
vi.mock("@/lib/plugins/plugin-env-manifests.server", () => ({
    loadPluginEnvDecls: () => [],
}));

/**
 * E13, the half a spy cannot reach: does the REAL save path actually probe?
 *
 * key-verify.test.ts drives `verifyKey` with a prober the test injects, which
 * proves the function's own logic and nothing about the road to it. If the
 * route stopped calling it, or called it with the wrong key, or dropped the
 * verdict on the way back, every one of those tests would still be green.
 *
 * So this suite goes through the actual PUT handler with NO injection point:
 * the only thing stubbed is the network itself (global fetch) and the store on
 * disk. Whatever prober the production registry holds is the one that runs.
 */
describe("PUT /api/settings/env — the save path verifies for real", () => {
    const realFetch = globalThis.fetch;

    beforeEach(() => {
        store.env = {};
        vi.resetModules();
    });

    afterEach(() => {
        globalThis.fetch = realFetch;
        vi.restoreAllMocks();
    });

    async function put(body: unknown) {
        const { PUT } = await import("./route");
        return PUT(
            new Request("http://localhost/api/settings/env", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }) as never,
        );
    }

    it("asks the provider the key unlocks, carrying that very key", async () => {
        const seen: Array<{ url: string; auth: string | null }> = [];
        globalThis.fetch = vi.fn(
            async (input: RequestInfo | URL, init?: RequestInit) => {
                const headers = new Headers(init?.headers);
                seen.push({
                    url: String(input),
                    auth: headers.get("Authorization"),
                });
                return new Response("{}", { status: 200 });
            },
        ) as typeof fetch;

        const res = await put({
            env: { OPENAI_API_KEY: "sk-proj-live-one" },
            verify: ["OPENAI_API_KEY"],
        });
        const json = (await res.json()) as {
            verdicts?: Record<string, { works: boolean; checked: boolean }>;
        };

        // The outbound call HAPPENED, went to the provider, and carried the
        // key the user just typed — none of which a verifyKey unit test sees.
        expect(seen).toHaveLength(1);
        expect(seen[0].url).toContain("api.openai.com");
        expect(seen[0].auth).toBe("Bearer sk-proj-live-one");
        expect(json.verdicts?.OPENAI_API_KEY).toEqual({
            works: true,
            checked: true,
            detail: expect.any(String),
        });
        // And it really was written, not merely probed.
        expect(store.env.OPENAI_API_KEY).toBe("sk-proj-live-one");
    });

    it("reports a well-formed key the provider rejects as not working", async () => {
        globalThis.fetch = vi.fn(
            async () => new Response("{}", { status: 401 }),
        ) as typeof fetch;

        const res = await put({
            env: { OPENAI_API_KEY: "sk-proj-shaped-but-dead" },
            verify: ["OPENAI_API_KEY"],
        });
        const json = (await res.json()) as {
            verdicts?: Record<
                string,
                { works: boolean; checked: boolean; detail: string }
            >;
        };

        const verdict = json.verdicts?.OPENAI_API_KEY;
        expect(verdict?.works).toBe(false);
        // checked:true — the provider ANSWERED. The UI shows "invalid" only
        // for this; "could not ask" is a different state entirely.
        expect(verdict?.checked).toBe(true);
        expect(verdict?.detail).toContain("401");
    });

    it("re-saving the same value still returns a verdict when asked to verify", async () => {
        globalThis.fetch = vi.fn(
            async () => new Response("{}", { status: 200 }),
        ) as typeof fetch;
        store.env = { OPENAI_API_KEY: "sk-proj-unchanged" };

        const res = await put({
            env: { OPENAI_API_KEY: "sk-proj-unchanged" },
            verify: ["OPENAI_API_KEY"],
        });
        const json = (await res.json()) as {
            verdicts?: Record<string, unknown>;
        };

        // The node prompt always asks for its own key. Without this, a re-save
        // came back with no verdict at all and the form could only render it
        // as "invalid" — a wrong answer produced by silence.
        expect(json.verdicts?.OPENAI_API_KEY).toBeDefined();
    });

    it("suppression: an untouched key is NOT probed when nobody asked for it", async () => {
        const probe = vi.fn(
            async () => new Response("{}", { status: 200 }),
        ) as typeof fetch;
        globalThis.fetch = probe;
        store.env = { OPENAI_API_KEY: "sk-proj-unchanged" };

        await put({ env: { OPENAI_API_KEY: "sk-proj-unchanged" } });

        // The bulk settings dialog must not fire one outbound request per
        // stored key on every save.
        expect(probe).not.toHaveBeenCalled();
    });
});
