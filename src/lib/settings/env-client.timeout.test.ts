import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

    it("just under the ceiling neither has fired", async () => {
        let readSettled = false;
        void readEnvForBrowser().then(() => {
            readSettled = true;
        });
        await vi.advanceTimersByTimeAsync(CEILING - 1);
        expect(readSettled, "must not fire early").toBe(false);
    });
});
