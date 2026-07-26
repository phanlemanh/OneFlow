import { describe, expect, it } from "vitest";
import {
    aggregateMos,
    type KeyEntry,
    makeBlindSheet,
    type Sample,
} from "./mos";

const SAMPLES: Sample[] = [
    { system: "alpha", scriptId: "s1", file: "samples/alpha/s1.mp3" },
    { system: "beta", scriptId: "s1", file: "samples/beta/s1.mp3" },
    { system: "gamma", scriptId: "s1", file: "samples/gamma/s1.mp3" },
];

// Fisher-Yates with rng()=0 swaps every element toward the front, so the order
// provably changes and stays deterministic for assertions.
const fixedRng = () => 0;

describe("the sheet is blind by construction (AC-7) — suppression half", () => {
    it("leaks no system name anywhere in the sheet", () => {
        const { entries } = makeBlindSheet(SAMPLES, fixedRng);
        const serialized = JSON.stringify(entries);
        for (const sample of SAMPLES) {
            expect(serialized).not.toContain(sample.system);
        }
        // Nor through the file path, which is where it would hide.
        for (const entry of entries) {
            expect(entry.blindFile).toMatch(/^S\d{3}\.mp3$/);
        }
    });

    it("shuffles, so position does not encode the system either", () => {
        const { key } = makeBlindSheet(SAMPLES, fixedRng);
        // Input order was alpha, beta, gamma.
        expect(key.S001.system).not.toBe("alpha");
    });

    it("gives every entry an opaque id", () => {
        const { entries } = makeBlindSheet(SAMPLES, fixedRng);
        expect(entries.map((e) => e.id)).toEqual(["S001", "S002", "S003"]);
    });
});

describe("the key is a separate artefact (AC-8)", () => {
    it("keeps the answer out of the sheet the rater receives", () => {
        const { entries, key } = makeBlindSheet(SAMPLES, fixedRng);
        expect(Object.keys(key)).toHaveLength(entries.length);
        for (const entry of entries) {
            expect(key[entry.id].system).toBeTruthy();
            // The sheet entry itself carries only id + blind filename.
            expect(Object.keys(entry).sort()).toEqual(["blindFile", "id"]);
        }
    });
});

const KEY: Record<string, KeyEntry> = {
    S001: { system: "alpha", scriptId: "s1", sourceFile: "a1" },
    S002: { system: "alpha", scriptId: "s2", sourceFile: "a2" },
    S003: { system: "beta", scriptId: "s1", sourceFile: "b1" },
};

describe("aggregation reports the spread, not just the mean (AC-9)", () => {
    it("matches hand-computed mean, sd, n and interval", () => {
        const stats = aggregateMos(
            [
                { id: "S001", score: 4 },
                { id: "S002", score: 5 },
                { id: "S003", score: 3 },
            ],
            KEY,
        );
        const alpha = stats.find((s) => s.system === "alpha");
        expect(alpha).toBeDefined();
        expect(alpha?.n).toBe(2);
        expect(alpha?.mean).toBe(4.5);
        // Sample sd over {4,5}: sqrt(0.5)
        expect(alpha?.sd).toBeCloseTo(Math.SQRT1_2, 10);
        expect(alpha?.ci95).toBeCloseTo(1.96 * (Math.SQRT1_2 / Math.SQRT2), 10);
    });

    it("leaves the spread undefined rather than fake at n = 1", () => {
        const stats = aggregateMos([{ id: "S003", score: 3 }], KEY);
        const beta = stats.find((s) => s.system === "beta");
        expect(beta?.n).toBe(1);
        expect(beta?.sd).toBeNull();
        expect(beta?.ci95).toBeNull();
    });

    it("ranks systems by mean", () => {
        const stats = aggregateMos(
            [
                { id: "S001", score: 2 },
                { id: "S003", score: 5 },
            ],
            KEY,
        );
        expect(stats.map((s) => s.system)).toEqual(["beta", "alpha"]);
    });
});

describe("bad input fails loudly (AC-10) — suppression half", () => {
    it("rejects a score outside the MOS range instead of dropping it", () => {
        expect(() => aggregateMos([{ id: "S001", score: 6 }], KEY)).toThrow(
            /range/i,
        );
        expect(() => aggregateMos([{ id: "S001", score: 0 }], KEY)).toThrow(
            /range/i,
        );
        expect(() =>
            aggregateMos([{ id: "S001", score: Number.NaN }], KEY),
        ).toThrow(/range/i);
    });

    it("rejects a rating for an id the key does not know", () => {
        expect(() => aggregateMos([{ id: "S999", score: 4 }], KEY)).toThrow(
            /unknown id/i,
        );
    });
});
