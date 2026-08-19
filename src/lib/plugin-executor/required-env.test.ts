import { describe, expect, it } from "vitest";
import { classifyFailure } from "@/lib/onboarding/failure-actions";
import {
    missingRequiredEnvKeys,
    missingRequiredEnvMessage,
} from "./required-env";

const declared = [
    { key: "MODAL_TOKEN_ID", required: true },
    { key: "MODAL_TOKEN_SECRET", required: true },
    { key: "MODAL_REGION", required: false },
];

describe("missingRequiredEnvKeys", () => {
    it("reports every required key that is absent", () => {
        expect(missingRequiredEnvKeys(declared, {})).toEqual([
            "MODAL_TOKEN_ID",
            "MODAL_TOKEN_SECRET",
        ]);
    });

    it("treats a blank or whitespace value as missing", () => {
        // The decisive fixture from S4 round 1: MODAL_TOKEN_ID present but
        // EMPTY passed the (nonexistent) check and the task died inside the
        // Modal SDK with a message no classifier could route.
        expect(
            missingRequiredEnvKeys(declared, {
                MODAL_TOKEN_ID: "",
                MODAL_TOKEN_SECRET: "   ",
            }),
        ).toEqual(["MODAL_TOKEN_ID", "MODAL_TOKEN_SECRET"]);
    });

    it("suppression: reports nothing when every required key has a value", () => {
        expect(
            missingRequiredEnvKeys(declared, {
                MODAL_TOKEN_ID: "ak-x",
                MODAL_TOKEN_SECRET: "as-y",
            }),
        ).toEqual([]);
    });

    it("never demands an optional key", () => {
        expect(
            missingRequiredEnvKeys(
                [{ key: "OPTIONAL_HINT", required: false }],
                {},
            ),
        ).toEqual([]);
    });
});

describe("missingRequiredEnvMessage", () => {
    it("produces the exact message the failure classifier routes to the key form", () => {
        // The RELATION under test: executor speaks, classifier understands.
        // If either side drifts, this breaks — that is the point.
        const action = classifyFailure(
            missingRequiredEnvMessage(["MODAL_TOKEN_ID"]),
        );
        expect(action).toEqual({
            kind: "enter-key",
            envKey: "MODAL_TOKEN_ID",
        });
    });

    it("names every missing key even though the classifier routes on the first", () => {
        const message = missingRequiredEnvMessage([
            "MODAL_TOKEN_ID",
            "MODAL_TOKEN_SECRET",
        ]);
        expect(message).toContain("MODAL_TOKEN_ID");
        expect(message).toContain("MODAL_TOKEN_SECRET");
        expect(classifyFailure(message).kind).toBe("enter-key");
    });
});
