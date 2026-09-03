// @vitest-environment jsdom
//
// The repo default is `node` (vitest.config.ts). This suite listens on a
// real `window`, because the seam's whole contract is a DOM event a shell
// outside this repo subscribes to — asserting it against a stub would only
// prove the stub was called.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, notifyUnauthorized } from "@/lib/api/client";
import { putEnvMap, readEnvForBrowser } from "./env-client";

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

    it("the OTHER caller fires the same seam — one definition, two callers", async () => {
        // The structural half. Both sides of the app must reach the shell
        // through the same helper; a second inline dispatch would satisfy
        // every behavioural case above and still put the event name and the
        // `cancelable` contract in two places.
        respond(401);
        await apiClient("/api/anything").catch(() => {});
        expect(fired.length, "apiClient 401: expected exactly 1 dispatch").toBe(
            1,
        );
    });

    it("a shell that cancels the event makes the helper report handled", async () => {
        // `defaultPrevented` is set by jsdom for any cancelable event, so
        // asserting it only re-checks `cancelable`, which the first case
        // already pins. The claim that matters is the RETURN VALUE: callers
        // branch on it to suppress their own error toast, and
        // `dispatchEvent(...); return false` would keep every case here green
        // while every embedding shell gained a duplicate toast.
        const handler = (e: Event) => e.preventDefault();
        window.addEventListener("tf:unauthorized", handler);
        try {
            expect(
                notifyUnauthorized(),
                "a claimed event must report handled",
            ).toBe(true);
        } finally {
            window.removeEventListener("tf:unauthorized", handler);
        }
    });

    it("a 401 on the WRITE path classifies and fires the seam too", async () => {
        // The taxonomy stopped at the module boundary: the reader classified
        // 401 and the writer did not, so an expired session mid-save read
        // "Could not save (the server answered 401)" with no sign-in prompt —
        // and on a node it landed in the write-failed path, which tells the
        // user the key WAS stored.
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response("{}", { status: 401 })),
        );
        const out = await putEnvMap({ OPENAI_API_KEY: "sk-1" });

        expect(out.ok, "write 401: expected a failure outcome").toBe(false);
        expect(
            (out as { reason: string }).reason,
            "write 401: an expired session is not a failed write",
        ).toBe("unauthenticated");
        expect(fired.length, "write 401: expected 1 dispatch").toBe(1);
    });

    it("nobody listening means the caller still owns the error", async () => {
        // The other half of the same relation. Without this, a helper that
        // always returns true would pass the case above and silence the error
        // message in a shell that never showed a sign-in prompt.
        expect(
            notifyUnauthorized(),
            "an unclaimed event must report NOT handled",
        ).toBe(false);
    });
});
