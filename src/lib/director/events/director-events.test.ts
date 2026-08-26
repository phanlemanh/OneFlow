import { describe, expect, it } from "vitest";
import {
    decidePatch,
    GENERATED,
    isOutcomeKind,
    OUTCOME_KINDS,
} from "./director-events";

describe("decidePatch — one-way, single-shot state machine (AC-5)", () => {
    it("allows the first patch out of `generated` for every legal outcome", () => {
        // Enumerated from the exported list rather than a literal array: a
        // future outcome added to OUTCOME_KINDS without a decision rule would
        // otherwise slip through untested.
        for (const outcome of OUTCOME_KINDS) {
            const decision = decidePatch(GENERATED, outcome);
            expect(decision).toEqual({ allowed: true, kind: outcome });
        }
    });

    it("refuses a second patch for a run that already left `generated`", () => {
        for (const already of OUTCOME_KINDS) {
            expect(decidePatch(already, "accepted")).toEqual({
                allowed: false,
                reason: "ALREADY_PATCHED",
            });
        }
    });

    it("refuses a run it has never seen", () => {
        expect(decidePatch(undefined, "accepted")).toEqual({
            allowed: false,
            reason: "UNKNOWN_RUN",
        });
    });

    it("refuses an outcome outside the legal set — including `generated` itself", () => {
        // `generated` is a kind but not an *outcome*: letting a client write it
        // would reopen a closed run, which is the single-shot rule inverted.
        for (const bad of ["generated", "failed", "", "ACCEPTED", null, 7]) {
            expect(decidePatch(GENERATED, bad)).toEqual({
                allowed: false,
                reason: "INVALID_OUTCOME",
            });
        }
    });

    it("checks the unknown-run rule before the outcome rule", () => {
        // Order matters for the caller's status code: a bad outcome on a
        // nonexistent run is a 404, not a 400 — otherwise probing for valid
        // runIds is possible by reading which error comes back.
        expect(decidePatch(undefined, "not-an-outcome")).toEqual({
            allowed: false,
            reason: "UNKNOWN_RUN",
        });
    });
});

describe("isOutcomeKind", () => {
    it("accepts exactly the four outcomes and nothing else", () => {
        for (const k of OUTCOME_KINDS) expect(isOutcomeKind(k)).toBe(true);
        for (const k of [GENERATED, "failed", "", null, undefined, 1, {}]) {
            expect(isOutcomeKind(k)).toBe(false);
        }
    });
});
