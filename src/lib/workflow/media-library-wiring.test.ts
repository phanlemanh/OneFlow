import { readFileSync } from "node:fs";
import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { exportWorkflow } from "@/lib/workflow/exporter";
import {
    ADD_NODE_OUTPUT_TYPE,
    getEffectiveOutputType,
} from "@/lib/workflow/flow-connection-shared";

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

/**
 * The two halves E19's `expected` promised and the suite did not have.
 *
 * The block above compares two tables — useful, but it only proves the tables
 * AGREE. Whether the validator lets the edge through, and whether the exporter
 * actually writes a data node carrying `fileKeys`, were both asserted in prose
 * and nowhere in code. Worse, the table comparison reads the exporter's SOURCE
 * TEXT (getAddNodeOutputType is private), so an exporter with a perfect table
 * that never consults it stayed green. These two call the real functions.
 */
describe("addMediaLibraryNode is wired end to end (E19)", () => {
    it("resolves to videoNode through the validator's own helper", () => {
        expect(
            getEffectiveOutputType(
                "n1",
                "addMediaLibraryNode",
                "out:videoNode",
            ),
        ).toBe("videoNode");
        // No source handle: the same answer, since this node has one output.
        expect(getEffectiveOutputType("n1", "addMediaLibraryNode")).toBe(
            "videoNode",
        );
    });

    /**
     * SUPPRESSION: a helper that answered "videoNode" for everything would pass
     * the assertion above and break every other add node on the canvas.
     */
    it("does NOT answer videoNode for a different add node", () => {
        expect(getEffectiveOutputType("n2", "addImageNode")).toBe("imageNode");
        expect(getEffectiveOutputType("n3", "addTextNode")).toBe("textNode");
    });

    it("exports the imported clip as a video data node carrying its fileKeys", () => {
        const nodes = [
            {
                id: "lib1",
                type: "addMediaLibraryNode",
                position: { x: 0, y: 0 },
                data: {},
            },
            {
                id: "vid1",
                type: "videoNode",
                position: { x: 300, y: 0 },
                data: { fileKeys: ["aH8xK2m9qP.mp4"] },
            },
        ];
        const edges = [
            {
                id: "e1",
                source: "lib1",
                target: "vid1",
                sourceHandle: "out:videoNode",
            },
        ];

        const wf = exportWorkflow(nodes as Node[], edges as Edge[]);

        // The exporter skips nodes whose registration it cannot resolve and
        // still returns a well-formed, EMPTY workflow — which reads as valid.
        // So assert presence before asserting content.
        expect(wf.dataNodes.length).toBeGreaterThan(0);
        const video = wf.dataNodes.find((n) => n.id === "vid1");
        expect(video).toBeDefined();
        expect(video?.dataType).toBe("video");
        expect(video?.staticData?.fileKeys).toEqual(["aH8xK2m9qP.mp4"]);
    });
});
