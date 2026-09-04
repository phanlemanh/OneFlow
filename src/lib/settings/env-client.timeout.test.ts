// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { NextIntlClientProvider } from "next-intl";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNodeKeyGate } from "@/components/workspace/nodes/base/abi-node-shell";
import type { Task } from "@/hooks/use-task";
import viMsg from "@/i18n/messages/vi.json";
import { DEFAULT_TIMEOUT_MS } from "@/lib/api/client";
import { readEnvForBrowser, saveEnvKeys } from "./env-client";

/**
 * The 30s ceiling, on BOTH directions.
 *
 * A read that hangs leaves the settings screen spinning forever. A WRITE that
 * hangs leaves a node stuck mid-verification with the user watching — and the
 * original finding named the write, not the read, so a ceiling on the read
 * alone would close the half nobody complained about.
 *
 * The write case asserts the promise RESOLVES with a failure outcome. It must
 * not reject: `env-client` reports failures by return value, three callers read
 * `out.ok` and branch, and a throw lands in `abi-node-shell`'s catch as
 * `phase: "invalid"` — telling the user their key is bad because the network
 * stalled. That is the exact misstatement this dossier exists to remove, so the
 * shape of the failure is part of the contract, not an implementation detail.
 */
const CEILING = 30_000;

/*
 * JSX would force this file to `.tsx`, and the eval that runs it names the
 * `.ts` path. `createElement` keeps the measurement where its contract says it
 * is rather than renaming the contract to suit the test.
 */
const wrap = ({ children }: { children: React.ReactNode }) =>
    createElement(
        // Cast because the catalogue's inferred literal type is narrower than
        // the provider's index-signature parameter; the VALUE passed is the
        // real catalogue either way, and children go in positionally.
        NextIntlClientProvider as React.ComponentType<Record<string, unknown>>,
        { locale: "vi", messages: viMsg },
        createElement(ReactFlowProvider, null, children),
    );

beforeEach(() => {
    vi.useFakeTimers();
    // Never settles on its own; only the AbortController can end it.
    vi.stubGlobal(
        "fetch",
        vi.fn(
            (_url: string, init?: RequestInit) =>
                new Promise<Response>((_resolve, reject) => {
                    init?.signal?.addEventListener("abort", () => {
                        reject(
                            Object.assign(new Error("aborted"), {
                                name: "AbortError",
                            }),
                        );
                    });
                }),
        ),
    );
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe("30s ceiling on both directions", () => {
    it("read: past the ceiling -> unavailable/timeout", async () => {
        const pending = readEnvForBrowser();
        await vi.advanceTimersByTimeAsync(CEILING + 1);
        const got = await pending;

        expect(got.state, "read: expected unavailable").toBe("unavailable");
        expect(
            (got as { reason: { code: string } }).reason.code,
            "read: expected timeout code",
        ).toBe("timeout");
    });

    it("read hangs first: saveEnvKeys reports the READ, not the write", async () => {
        // `saveEnvKeys` reads before it writes. With everything hung the read is
        // what failed, and saying "write failed" there would name the wrong
        // half. Found by this suite: the first draft asserted write-failed here
        // and was wrong about which call had stalled.
        const pending = saveEnvKeys({ OPENAI_API_KEY: "sk-1" });
        await vi.advanceTimersByTimeAsync(CEILING + 1);
        const got = await pending;

        expect(got.ok, "read-hang: expected a failure outcome").toBe(false);
        expect(
            (got as { reason: string }).reason,
            "read-hang: the read is what stalled",
        ).toBe("read-failed");
    });

    it("write: past the ceiling RESOLVES with write-failed/timeout, never rejects", async () => {
        // Read succeeds, PUT hangs — the only way to reach put()'s ceiling.
        vi.stubGlobal(
            "fetch",
            vi.fn((_url: string, init?: RequestInit) => {
                if (init?.method !== "PUT") {
                    return Promise.resolve(
                        new Response(
                            JSON.stringify({ env: {}, pluginEnv: [] }),
                            {
                                status: 200,
                            },
                        ),
                    );
                }
                return new Promise<Response>((_resolve, reject) => {
                    init?.signal?.addEventListener("abort", () => {
                        reject(
                            Object.assign(new Error("aborted"), {
                                name: "AbortError",
                            }),
                        );
                    });
                });
            }),
        );

        const pending = saveEnvKeys({ OPENAI_API_KEY: "sk-1" });
        await vi.advanceTimersByTimeAsync(CEILING + 1);
        // A rejection here fails the test by rejection, which is the point: the
        // callers have no catch, so a throw would reach them as a broken key.
        const got = await pending;

        expect(got.ok, "write: expected a failure outcome").toBe(false);
        expect(
            (got as { reason: string }).reason,
            "write: a stalled write is a write failure, not a store failure",
        ).toBe("write-failed");
        expect(
            (got as { detail: { code: string } }).detail.code,
            "write: expected timeout code",
        ).toBe("timeout");
    });

    it("the shared ceiling is imported, not written twice", async () => {
        // Two ceilings that drift apart are two behaviours the user
        // experiences as one. The number lives in the API client; this asserts
        // env-client spends it rather than picking its own.
        expect(DEFAULT_TIMEOUT_MS, "the ceiling must be the shared one").toBe(
            CEILING,
        );
    });

    it("a node past the ceiling never calls the key bad", async () => {
        // The whole reason the write needed a ceiling. Without one the node sits
        // in `verifying` forever; with a THROWN timeout it lands in
        // abi-node-shell's catch as `invalid` — "your key does not work" —
        // because the network stalled. Neither is a true statement about the
        // key, so the assertion is on both at once.
        const { result } = renderHook(() => useNodeKeyGate(), {
            wrapper: wrap,
        });
        await act(async () => {
            result.current.noteTask({
                id: "t1",
                status: "FAILED",
                error: "missing OPENAI_API_KEY",
            } as unknown as Task);
        });
        await act(async () => {
            result.current.setValue("sk-test");
        });
        const saving = result.current.save();
        await act(async () => {
            await vi.advanceTimersByTimeAsync(CEILING + 1);
            await saving;
        });

        const phase = result.current.state.phase;
        expect(
            phase,
            "a stalled read must not leave the node spinning",
        ).not.toBe("verifying");
        expect(phase, "a stalled read is not a verdict on the key").not.toBe(
            "verified",
        );
        expect(phase, "a stalled read must not call the key invalid").not.toBe(
            "invalid",
        );
    });

    it("headers that arrive and a body that never does still time out", async () => {
        /*
         * The hole the ceiling had. Clearing the timer as soon as `fetch`
         * resolves disarms it the moment HEADERS arrive, leaving the body read
         * unbounded — and every other case in this file stalls the headers, so
         * all of them passed while a proxy that answers and then stalls hung
         * forever. Found by review, not by this suite.
         */
        vi.stubGlobal(
            "fetch",
            vi.fn(async (_url: string, init?: RequestInit) => {
                // Headers now; body never — the way a real Response behaves,
                // including rejecting the body read when the signal aborts.
                return {
                    status: 200,
                    ok: true,
                    json: () =>
                        new Promise((_resolve, reject) => {
                            init?.signal?.addEventListener("abort", () => {
                                reject(
                                    Object.assign(new Error("aborted"), {
                                        name: "AbortError",
                                    }),
                                );
                            });
                        }),
                } as unknown as Response;
            }),
        );

        const pending = readEnvForBrowser();
        await vi.advanceTimersByTimeAsync(CEILING + 1);
        const got = await pending;

        expect(got.state, "a stalled body must still be unavailable").toBe(
            "unavailable",
        );
        expect(
            (got as { reason: { code: string } }).reason.code,
            "and it must be named a timeout, not a malformed payload",
        ).toBe("timeout");
    });

    it("just under the ceiling neither has fired", async () => {
        let readSettled = false;
        void readEnvForBrowser().then(() => {
            readSettled = true;
        });
        await vi.advanceTimersByTimeAsync(CEILING - 1);
        expect(readSettled, "must not fire early").toBe(false);
    });
});
