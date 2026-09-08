import { describe, expect, it } from "vitest";
import { provenanceFields } from "./provenance";

describe("provenanceFields (AC-7)", () => {
    it("carries the Director run id when the graph came from a plan", () => {
        expect(provenanceFields("run-1")).toEqual({ directorRunId: "run-1" });
    });

    it("sends no field at all for a hand-built graph", () => {
        // `{}` and not `{ directorRunId: undefined }`: JSON drops undefined,
        // but a serializer that did not would send the key and the server
        // would still store NULL — the assertion pins the stricter shape.
        expect(provenanceFields(null)).toEqual({});
        expect(provenanceFields(undefined)).toEqual({});
        expect("directorRunId" in provenanceFields("")).toBe(false);
    });
});
