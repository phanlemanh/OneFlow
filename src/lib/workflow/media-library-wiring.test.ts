import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ADD_NODE_OUTPUT_TYPE } from "@/lib/workflow/flow-connection-shared";

/**
 * This repo keeps TWO copies of the add-node -> modality mapping: the exported
 * table in flow-connection-shared.ts, and an inline `typeMap` inside
 * exporter.ts's getAddNodeOutputType(). Two copies of one fact drift, and the
 * drift is silent — connection validation would accept an edge the exporter
 * then writes out as a different modality.
 *
 * This test is the thing that notices. Updating only one side must go red.
 */
function exporterTypeMap(): Record<string, string> {
    const source = readFileSync("src/lib/workflow/exporter.ts", "utf8");
    const block = source.match(
        /getAddNodeOutputType[\s\S]*?typeMap[^{]*\{([\s\S]*?)\}/,
    );
    if (!block) {
        throw new Error("could not find getAddNodeOutputType's typeMap");
    }
    const out: Record<string, string> = {};
    for (const match of block[1].matchAll(/(\w+)\s*:\s*"([^"]+)"/g)) {
        out[match[1]] = match[2];
    }
    return out;
}

describe("add-node modality mapping — the two copies agree (E19)", () => {
    it("registers addMediaLibraryNode -> videoNode in BOTH copies", () => {
        expect(ADD_NODE_OUTPUT_TYPE.addMediaLibraryNode).toBe("videoNode");
        expect(exporterTypeMap().addMediaLibraryNode).toBe("videoNode");
    });

    /**
     * The load-bearing assertion: every key, not just the new one. Editing one
     * table and forgetting the other is the failure this guards, and it is not
     * specific to this feature.
     */
    it("agrees on EVERY key", () => {
        expect(exporterTypeMap()).toEqual(ADD_NODE_OUTPUT_TYPE);
    });

    it("reads a non-empty table, so an unparsable file cannot pass vacuously", () => {
        expect(Object.keys(exporterTypeMap()).length).toBeGreaterThanOrEqual(8);
    });
});
