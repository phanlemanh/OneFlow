// @vitest-environment jsdom
//
// The repo default is `node` (vitest.config.ts). This suite listens on a
// real `window`, because the seam's whole contract is a DOM event a shell
// outside this repo subscribes to — asserting it against a stub would only
// prove the stub was called.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readEnvForBrowser } from "./env-client";

/**
 * The shell sign-in seam, and the line it must not cross.
 *
 * 401 is *not authenticated* — the shell can fix that by raising a sign-in
 * dialog. 403 is *authenticated and refused* — asking the user to sign in again
 * tells them something untrue about why they were turned away, which is the
 * same class of misstatement this dossier exists to remove.
 *
 * The last case is structural, not behavioural: it asserts env-client calls the
 * SHARED helper rather than dispatching its own event. A second inline dispatch
 * would pass every behavioural case here and still put the event name and the
 * `cancelable` contract in two places.
 */

let fired: CustomEvent[] = [];
const listener = (e: Event) => {
    fired.push(e as CustomEvent);
};

beforeEach(() => {
    fired = [];
    window.addEventListener("tf:unauthorized", listener);
});

afterEach(() => {
    window.removeEventListener("tf:unauthorized", listener);
    vi.restoreAllMocks();
});

const respond = (status: number, body = "{}") =>
    vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response(body, { status })),
    );

describe("shell seam fires on 401 only", () => {
    it("401 dispatches exactly one cancelable event", async () => {
        respond(401);
        await readEnvForBrowser();
        expect(fired.length, "401: expected 1 dispatch").toBe(1);
        expect(fired[0].cancelable, "401: event must be cancelable").toBe(true);
    });

    it("403 dispatches nothing — forbidden is not unauthenticated", async () => {
        respond(403);
        await readEnvForBrowser();
        expect(fired.length, "403: expected 0 dispatches").toBe(0);
    });

    it("503+code dispatches nothing", async () => {
        respond(503, JSON.stringify({ code: "ENV_STORE_UNREADABLE" }));
        await readEnvForBrowser();
        expect(fired.length, "503: expected 0 dispatches").toBe(0);
    });

    it("a shell that handles it can cancel the event", async () => {
        const handler = (e: Event) => e.preventDefault();
        window.addEventListener("tf:unauthorized", handler);
        try {
            respond(401);
            await readEnvForBrowser();
            expect(
                fired[0].defaultPrevented,
                "401: a shell must be able to claim the event",
            ).toBe(true);
        } finally {
            window.removeEventListener("tf:unauthorized", handler);
        }
    });
});
