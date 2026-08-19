import { describe, expect, it, vi } from "vitest";
import { verifyKey } from "./key-verify";

describe("verifyKey", () => {
    it("actually calls out to the provider", async () => {
        const probe = vi
            .fn()
            .mockResolvedValue(new Response("{}", { status: 200 }));
        await verifyKey(
            "OPENAI_API_KEY",
            "sk-proj-aaaaaaaaaaaaaaaaaaaa",
            probe,
        );
        // The call HAPPENED — not merely that a boolean came back.
        expect(probe).toHaveBeenCalledTimes(1);
    });

    it("reports a well-formed but rejected key as not working", async () => {
        // The decisive fixture: shape-valid, provider-rejected. A regex check
        // would call this key good, which is the whole failure being guarded.
        const probe = vi
            .fn()
            .mockResolvedValue(new Response("{}", { status: 401 }));
        const verdict = await verifyKey(
            "OPENAI_API_KEY",
            "sk-proj-aaaaaaaaaaaaaaaaaaaa",
            probe,
        );
        expect(verdict.works).toBe(false);
        expect(verdict.detail).toContain("401");
    });

    it("confirms a key the provider accepts", async () => {
        const probe = vi
            .fn()
            .mockResolvedValue(new Response("{}", { status: 200 }));
        const verdict = await verifyKey(
            "OPENAI_API_KEY",
            "sk-proj-good",
            probe,
        );
        expect(verdict.works).toBe(true);
    });

    it("says it could not tell rather than guessing when the probe throws", async () => {
        const probe = vi
            .fn()
            .mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
        const verdict = await verifyKey("OPENAI_API_KEY", "sk-proj-x", probe);
        expect(verdict.works).toBe(false);
        expect(verdict.detail).toContain("ENOTFOUND");
    });

    it("refuses a key for an env var it has no prober for, without inventing a verdict", async () => {
        const verdict = await verifyKey("SOME_UNKNOWN_KEY", "x");
        expect(verdict.works).toBe(false);
        expect(verdict.detail).toMatch(/không kiểm tra được|no prober/i);
    });
});
