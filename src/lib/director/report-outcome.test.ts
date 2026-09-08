import { describe, expect, it, vi } from "vitest";
import { reportOutcome } from "./report-outcome";

const okFetch = () =>
    vi.fn(
        async (_url: string, _init: RequestInit) =>
            new Response("{}", { status: 200 }),
    );

describe("reportOutcome", () => {
    it("posts runId and outcome to the feedback endpoint", () => {
        const f = okFetch();
        reportOutcome("run-abc", "accepted", f as unknown as typeof fetch);

        expect(f).toHaveBeenCalledTimes(1);
        const [url, init] = f.mock.calls[0];
        expect(url).toBe("/api/director/feedback");
        expect(init.method).toBe("POST");
        expect(JSON.parse(init.body as string)).toEqual({
            runId: "run-abc",
            outcome: "accepted",
        });
    });

    it("sets keepalive — the user may navigate away on the same click", () => {
        const f = okFetch();
        reportOutcome("run-abc", "discarded", f as unknown as typeof fetch);
        const [, init] = f.mock.calls[0];
        expect(init.keepalive).toBe(true);
    });

    it("sends nothing when there is no runId", () => {
        // A response from before this package carries none; reporting anyway
        // would be a write the server must reject.
        const f = okFetch();
        reportOutcome(undefined, "accepted", f as unknown as typeof fetch);
        expect(f).not.toHaveBeenCalled();
    });

    it("never throws when the request fails", async () => {
        const f = vi.fn(async () => {
            throw new Error("offline");
        });
        expect(() =>
            reportOutcome("run-abc", "replaced", f as unknown as typeof fetch),
        ).not.toThrow();
        // Let the rejected promise settle so an unhandled rejection would surface.
        await new Promise((r) => setTimeout(r, 0));
    });

    it("does not await — the canvas must not wait on telemetry", () => {
        let settled = false;
        const f = vi.fn(
            () =>
                new Promise<Response>((resolve) => {
                    setTimeout(() => {
                        settled = true;
                        resolve(new Response("{}"));
                    }, 50);
                }),
        );
        reportOutcome("run-abc", "staged", f as unknown as typeof fetch);
        // Returned before the request resolved.
        expect(settled).toBe(false);
    });
});
