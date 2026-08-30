// @vitest-environment jsdom
/**
 * The node key field's save path, when the key store cannot be read.
 *
 * This drives `saveAndVerifyKey` itself rather than the whole shell: the shell
 * needs React Flow context, an ABI registry and a failed task before the field
 * appears, and none of that is what the criterion is about. The function IS the
 * decision point — it is the only place in this file that reads the store and
 * then writes it back — so the real fetch path runs here with nothing stubbed
 * but the network.
 *
 * Before this change the same function did not check `loaded.ok` at all: a 503
 * body was spread through `?? {}` and the PUT went out carrying exactly one
 * key, which is the shape that erases the rest.
 */

import { act, renderHook } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    EnvStoreUnreadableError,
    saveAndVerifyKey,
    useNodeKeyGate,
} from "./abi-node-shell";

type Call = { url: string; method: string; body?: string };
let calls: Call[] = [];

function stubFetch(getStatus: number, getBody: unknown) {
    calls = [];
    globalThis.fetch = vi.fn(
        async (input: RequestInfo | URL, init?: RequestInit) => {
            const method = (init?.method ?? "GET").toUpperCase();
            calls.push({
                url: String(input),
                method,
                body: init?.body as string | undefined,
            });
            if (method === "PUT") {
                return new Response(
                    JSON.stringify({
                        env: {},
                        verdicts: { K: { works: true, checked: true } },
                    }),
                    {
                        status: 200,
                        headers: { "content-type": "application/json" },
                    },
                );
            }
            return new Response(JSON.stringify(getBody), {
                status: getStatus,
                headers: { "content-type": "application/json" },
            });
        },
    ) as typeof fetch;
}

beforeEach(() => {
    calls = [];
});
afterEach(() => {
    vi.restoreAllMocks();
});

describe("abi node key field: unreadable store", () => {
    it("sends no PUT at all", async () => {
        stubFetch(503, { code: "ENV_STORE_UNREADABLE" });
        await expect(saveAndVerifyKey("K", "v")).rejects.toBeInstanceOf(
            EnvStoreUnreadableError,
        );
        expect(calls.filter((c) => c.method === "PUT")).toHaveLength(0);
    });

    it("refuses a 200 that is not a map, instead of merging onto nothing", async () => {
        // The store answering with the wrong shape is the same class of fault
        // one layer up, and `?? {}` used to launder it into a valid-looking
        // write.
        stubFetch(200, { env: [1, 2, 3] });
        await expect(saveAndVerifyKey("K", "v")).rejects.toThrow();
        expect(calls.filter((c) => c.method === "PUT")).toHaveLength(0);
    });

    it("still saves, carrying the other keys, when the store is healthy", async () => {
        // Positive control with teeth: it is not enough that a PUT goes out —
        // it must carry the keys that were already there, which is the whole
        // point of reading before writing.
        stubFetch(200, { env: { OTHER: "keep-me" } });
        await saveAndVerifyKey("K", "v");

        const puts = calls.filter((c) => c.method === "PUT");
        expect(puts).toHaveLength(1);
        expect(JSON.parse(puts[0].body ?? "{}").env).toEqual({
            OTHER: "keep-me",
            K: "v",
        });
    });
});

/**
 * The WIRING, not the pieces.
 *
 * `node-key-prompt.test.tsx` proves the `store-unreadable` phase renders
 * correctly, and the block above proves no PUT goes out. Neither notices if the
 * catch stops recognising the error by type — which is exactly the defect round
 * 1 shipped: the refusal was correct and the user still read "your key is
 * invalid" with a machine code appended. This closes that gap by driving the
 * real hook and asserting the phase it lands in.
 */
describe("abi node key gate: wiring", () => {
    const failedTask = {
        id: "t1",
        status: "FAILED",
        error: "missing OPENAI_API_KEY",
    } as unknown as Parameters<
        ReturnType<typeof useNodeKeyGate>["noteTask"]
    >[0];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ReactFlowProvider>{children}</ReactFlowProvider>
    );

    it("lands in store-unreadable — not invalid — when the store cannot be read", async () => {
        stubFetch(503, { code: "ENV_STORE_UNREADABLE" });
        const { result } = renderHook(() => useNodeKeyGate(), { wrapper });

        act(() => result.current.noteTask(failedTask));
        expect(result.current.envKey).toBe("OPENAI_API_KEY");

        await act(async () => {
            await result.current.save();
        });

        expect(result.current.state.phase).toBe("store-unreadable");
        expect(calls.filter((c) => c.method === "PUT")).toHaveLength(0);
    });

    it("still lands in invalid when the provider rejects the key", async () => {
        // Positive control: a gate that always says store-unreadable would pass
        // the case above and destroy the phase that actually reports a bad key.
        stubFetch(200, { env: {} });
        globalThis.fetch = vi.fn(
            async (input: RequestInfo | URL, init?: RequestInit) => {
                const method = (init?.method ?? "GET").toUpperCase();
                calls.push({ url: String(input), method });
                if (method === "PUT") {
                    return new Response(
                        JSON.stringify({
                            env: {},
                            verdicts: {
                                OPENAI_API_KEY: {
                                    works: false,
                                    checked: true,
                                    detail: "provider said no",
                                },
                            },
                        }),
                        {
                            status: 200,
                            headers: { "content-type": "application/json" },
                        },
                    );
                }
                return new Response(JSON.stringify({ env: {} }), {
                    status: 200,
                    headers: { "content-type": "application/json" },
                });
            },
        ) as typeof fetch;

        const { result } = renderHook(() => useNodeKeyGate(), { wrapper });
        act(() => result.current.noteTask(failedTask));
        await act(async () => {
            await result.current.save();
        });

        expect(result.current.state.phase).toBe("invalid");
    });
});
