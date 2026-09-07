import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARD_FIELDS, VIDEO_CARD } from "./cards";

type CardField = (typeof CARD_FIELDS)[number];
const unknownFields = (card: object): string[] =>
    Object.keys(card).filter((key) => !CARD_FIELDS.includes(key as CardField));

describe("fixture provenance (E28)", () => {
    it("cites the contract file, line range and read date", () => {
        const src = readFileSync(
            "src/lib/media-library/__fixtures__/cards.ts",
            "utf8",
        );
        expect(src).toMatch(
            /PROVENANCE: media-library packages\/contracts\/src\/\S+:\d+/,
        );
        expect(src).toMatch(/READ-ON: \d{4}-\d{2}-\d{2}/);
    });

    it("uses only field names the contract defines", () => {
        expect(unknownFields(VIDEO_CARD)).toEqual([]);
    });

    /**
     * TEETH: the check above is only worth running if it can fail. Renaming one
     * field away from the contract — the exact drift that would let every eval
     * stay green while the real service answers a different shape — must be
     * named, not merely counted.
     */
    it("names the offending field when one drifts from the contract", () => {
        const drifted = { ...VIDEO_CARD, licenseLabel: "x" } as Record<
            string,
            unknown
        >;
        expect(unknownFields(drifted)).toEqual(["licenseLabel"]);
    });
});
