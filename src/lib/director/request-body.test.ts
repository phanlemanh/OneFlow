import { describe, expect, it } from "vitest";
import {
    MAX_CANVAS_BYTES,
    MAX_CANVAS_NODES,
    MAX_PROMPT_LENGTH,
    MAX_TURNS,
    parseDirectorBody,
} from "./request-body";

const ok = (body: unknown) => {
    const r = parseDirectorBody(body);
    if (!r.ok)
        throw new Error(
            `expected ok, got ${r.error.field}: ${r.error.message}`,
        );
    return r.value;
};
const rejection = (body: unknown) => {
    const r = parseDirectorBody(body);
    if (r.ok) throw new Error("expected rejection");
    return r.error;
};

describe("AC-8 — the old body behaves exactly as before", () => {
    it("accepts a bare { prompt } and reports no new fields", () => {
        const v = ok({ prompt: "vẽ một chiếc xe đạp đỏ" });
        expect(v.prompt).toBe("vẽ một chiếc xe đạp đỏ");
        expect(v.turns).toBeUndefined();
        expect(v.canvas).toBeUndefined();
        expect(v.options).toBeUndefined();
    });

    it("keeps the prompt cap and its LITERAL message", () => {
        // Asserted against the literal string, not against the constant: an
        // edit to the message that forgets this test would otherwise pass, and
        // onboarding matches on this text.
        const e = rejection({ prompt: "x".repeat(MAX_PROMPT_LENGTH + 1) });
        expect(e.field).toBe("prompt");
        expect(e.message).toBe("prompt must be at most 2000 characters");
    });

    it("still refuses a missing or non-string prompt", () => {
        expect(rejection({}).message).toBe(
            "prompt is required and must be a string",
        );
        expect(rejection({ prompt: 42 }).field).toBe("prompt");
        expect(rejection(null).field).toBe("prompt");
    });

    it("accepts a prompt exactly at the cap", () => {
        expect(
            ok({ prompt: "x".repeat(MAX_PROMPT_LENGTH) }).prompt,
        ).toHaveLength(MAX_PROMPT_LENGTH);
    });
});

describe("AC-9 — new fields are optional, and caps are per field", () => {
    it("absent or empty new fields behave like the old body", () => {
        expect(
            ok({ prompt: "p", turns: [], canvas: { nodes: [] }, options: {} })
                .prompt,
        ).toBe("p");
    });

    it("names the offending field — never a generic 'body too large'", () => {
        expect(
            rejection({ prompt: "p", turns: new Array(MAX_TURNS + 1).fill({}) })
                .field,
        ).toBe("turns");
        expect(
            rejection({
                prompt: "p",
                canvas: { nodes: new Array(MAX_CANVAS_NODES + 1).fill({}) },
            }).field,
        ).toBe("canvas");
        expect(rejection({ prompt: "p", options: [] }).field).toBe("options");
    });

    it("caps canvas by BYTES as well as by node count", () => {
        // A handful of nodes carrying large literals is the same problem as
        // many small ones; a node-count cap alone would miss it.
        const fat = {
            nodes: [{ data: { text: "x".repeat(MAX_CANVAS_BYTES) } }],
        };
        const e = rejection({ prompt: "p", canvas: fat });
        expect(e.field).toBe("canvas");
        expect(e.message).toContain("bytes");
    });

    it("counts canvas bytes in UTF-8, not UTF-16 code units", () => {
        // Same character count both times: ASCII stays under the cap, the
        // two-byte Vietnamese letter crosses it. A `.length` check passes
        // both — that is the bug this pair pins.
        const chars = Math.floor(MAX_CANVAS_BYTES / 2) + 64;
        const ascii = { nodes: [{ data: { text: "x".repeat(chars) } }] };
        const viet = { nodes: [{ data: { text: "ă".repeat(chars) } }] };
        expect(ok({ prompt: "p", canvas: ascii }).prompt).toBe("p");
        const e = rejection({ prompt: "p", canvas: viet });
        expect(e.field).toBe("canvas");
        expect(e.message).toContain("bytes");
    });

    it("rejects wrong shapes for each new field", () => {
        expect(rejection({ prompt: "p", turns: "no" }).field).toBe("turns");
        expect(rejection({ prompt: "p", canvas: [] }).field).toBe("canvas");
        expect(rejection({ prompt: "p", canvas: { nodes: "no" } }).field).toBe(
            "canvas",
        );
    });

    it("checks prompt before the new fields", () => {
        // Otherwise a client sending both a bad prompt and a fat canvas is told
        // about the canvas and fixes the wrong thing.
        expect(rejection({ prompt: 1, turns: "no" }).field).toBe("prompt");
    });
});
