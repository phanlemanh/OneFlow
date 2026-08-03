/**
 * The inline edge target-select is the fourth consumer of "which upstream
 * modality does this handle accept". It matched on the primary `nodeType`
 * alone, so a handle widened with `alsoAccepts` was invisible to it — and its
 * swap path moved the displaced edge onto a handle without any modality check,
 * writing a connection `isValidFlowConnection` refuses, silently.
 */

import type { Edge, Node } from "@xyflow/react";
import { afterEach, describe, expect, it } from "vitest";

import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import { registerAbiNode, unregisterAbiNode } from "@/lib/abi/node-registry";
import { canSwapOntoHandle, getEdgeTargetOptions } from "./edge-target-options";

const OVERLAY = "ov";

function dataNode(id: string, type: string): Node {
    return { id, type, position: { x: 0, y: 0 }, data: {} };
}

function edge(
    source: string,
    sourceHandle: string,
    targetHandle: string,
): Edge {
    return {
        id: `e-${source}`,
        source,
        sourceHandle,
        target: OVERLAY,
        targetHandle,
    };
}

const registered: string[] = [];
function registerOverlay() {
    registerAbiNode({
        nodeId: OVERLAY,
        feature: "compose-overlay" as never,
        sourceSpec:
            NODE_TYPE_SOURCE_SPEC.composeOverlayNode as unknown as never,
    });
    registered.push(OVERLAY);
}
afterEach(() => {
    for (const id of registered.splice(0)) unregisterAbiNode(id);
});

describe("getEdgeTargetOptions — widened handles", () => {
    it("offers in:media for a video upstream", () => {
        registerOverlay();
        const nodes = [
            dataNode("v", "videoNode"),
            dataNode(OVERLAY, "abiNode"),
        ];
        const opts = getEdgeTargetOptions(
            edge("v", "out:videoNode", "in:media"),
            nodes,
        );
        expect(opts.map((o) => o.handleId)).toContain("in:media");
    });

    it("still offers both image handles for an image upstream", () => {
        registerOverlay();
        const nodes = [
            dataNode("i", "imageNode"),
            dataNode(OVERLAY, "abiNode"),
        ];
        const opts = getEdgeTargetOptions(
            edge("i", "out:imageNode", "in:logo"),
            nodes,
        );
        expect(opts.map((o) => o.handleId).sort()).toEqual([
            "in:logo",
            "in:media",
        ]);
    });
});

describe("canSwapOntoHandle — displaced edge must stay legal", () => {
    it("refuses moving a video occupant onto the image-only in:logo", () => {
        registerOverlay();
        expect(canSwapOntoHandle(OVERLAY, "videoNode", "in:logo")).toBe(false);
    });

    it("allows moving an image occupant onto in:logo", () => {
        registerOverlay();
        expect(canSwapOntoHandle(OVERLAY, "imageNode", "in:logo")).toBe(true);
    });

    it("allows moving a video occupant onto the widened in:media", () => {
        registerOverlay();
        expect(canSwapOntoHandle(OVERLAY, "videoNode", "in:media")).toBe(true);
    });

    it("refuses when the occupant's modality is unknown", () => {
        registerOverlay();
        expect(canSwapOntoHandle(OVERLAY, undefined, "in:media")).toBe(false);
    });
});
