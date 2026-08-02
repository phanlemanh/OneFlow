/**
 * E12b — compose-overlay workflow export.
 *
 * The exporter must emit an `ExecutableNode` whose `pluginId` is top-level and
 * whose bindings (the prompt precursor) carry ONLY the slot's business fields
 * (`media`, `ops`, optional `text` / `logo`) — all derived from the ABI mount
 * registry + `resolveSpec`, never from hand-maintained per-node maps.
 */

import type { Edge, Node } from "@xyflow/react";
import { afterEach, describe, expect, it } from "vitest";

import {
    NODE_TYPE_SOURCE_SPEC,
    NODE_TYPE_TO_ABI_FEATURE,
} from "@/lib/abi/node-feature-registry";
import { registerAbiNode, unregisterAbiNode } from "@/lib/abi/node-registry";

import { exportWorkflow } from "./exporter";

const NODE_ID = "co1";
const PLUGIN_ID = "oneflow-modal-compose-overlay";

const OPS = [
    {
        type: "text",
        x: 0.5,
        y: 0.12,
        anchor: "top-center",
        text: "Ưu đãi {text}",
        size: 0.05,
        color: "#FFFFFF",
        align: "center",
        max_width: 0.8,
    },
    { type: "safe_zone", x: 0, y: 0, preset: "tiktok-portrait" },
];

function buildGraph(): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [
        {
            id: "v1",
            type: "videoNode",
            position: { x: 0, y: 0 },
            data: { fileKeys: ["video-key"] },
        },
        {
            id: "t1",
            type: "textNode",
            position: { x: 0, y: 150 },
            data: { texts: ["1.999.000₫"] },
        },
        {
            id: "l1",
            type: "imageNode",
            position: { x: 0, y: 300 },
            data: { fileKeys: ["logo-key"] },
        },
        {
            id: NODE_ID,
            type: "composeOverlayNode",
            position: { x: 400, y: 0 },
            data: { ops: OPS, pluginId: PLUGIN_ID },
        },
        {
            id: "out1",
            type: "videoNode",
            position: { x: 800, y: 0 },
            data: {},
        },
    ];
    const edges: Edge[] = [
        {
            id: "e-media",
            source: "v1",
            sourceHandle: "out:videoNode",
            target: NODE_ID,
            targetHandle: "in:media",
        },
        {
            id: "e-text",
            source: "t1",
            sourceHandle: "out:textNode",
            target: NODE_ID,
            targetHandle: "in:text",
        },
        {
            id: "e-logo",
            source: "l1",
            sourceHandle: "out:imageNode",
            target: NODE_ID,
            targetHandle: "in:logo",
        },
        {
            id: "e-out",
            source: NODE_ID,
            sourceHandle: "out:video",
            target: "out1",
            targetHandle: "in:videoNode",
        },
    ];
    return { nodes, edges };
}

/** Mirror `useAbiExecution`'s mount-time registration, registry-derived. */
function registerNode(): void {
    registerAbiNode({
        nodeId: NODE_ID,
        feature: NODE_TYPE_TO_ABI_FEATURE.composeOverlayNode,
        sourceSpec: NODE_TYPE_SOURCE_SPEC.composeOverlayNode,
    });
}

afterEach(() => {
    unregisterAbiNode(NODE_ID);
});

describe("compose-overlay export", () => {
    it("emits an ExecutableNode with top-level pluginId and business-only bindings", () => {
        registerNode();
        const { nodes, edges } = buildGraph();

        const workflow = exportWorkflow(nodes, edges, { name: "overlay" });

        const exec = workflow.executableNodes.find((n) => n.id === NODE_ID);
        expect(exec).toBeDefined();
        if (!exec) return;

        // Routing lives top-level, never inside the prompt payload.
        expect(exec.feature).toBe("compose-overlay");
        expect(exec.type).toBe("composeOverlayNode");
        expect(exec.pluginId).toBe(PLUGIN_ID);

        // Bindings carry ONLY ABI business fields.
        expect(Object.keys(exec.bindings).sort()).toEqual([
            "logo",
            "media",
            "ops",
            "text",
        ]);

        expect(exec.bindings.media).toEqual({
            kind: "handle",
            sources: [{ fromNodeId: "v1", fromField: "fileKeys" }],
            targetHandle: "in:media",
            consumerShape: "scalar",
        });
        expect(exec.bindings.text).toEqual({
            kind: "handle",
            sources: [{ fromNodeId: "t1", fromField: "texts" }],
            targetHandle: "in:text",
            consumerShape: "scalar",
        });
        expect(exec.bindings.logo).toEqual({
            kind: "handle",
            sources: [{ fromNodeId: "l1", fromField: "fileKeys" }],
            targetHandle: "in:logo",
            consumerShape: "scalar",
        });
        expect(exec.bindings.ops).toEqual({ kind: "config", value: OPS });

        // No batch expansion for this slot.
        expect(exec.batchField).toBeUndefined();
    });

    it("derives both output routes (image + video) from the ABI, wired to the downstream node", () => {
        registerNode();
        const { nodes, edges } = buildGraph();

        const workflow = exportWorkflow(nodes, edges, { name: "overlay" });
        const exec = workflow.executableNodes.find((n) => n.id === NODE_ID);
        expect(exec).toBeDefined();
        if (!exec) return;

        const byField = new Map(exec.outputs.map((o) => [o.sourceField, o]));
        expect([...byField.keys()].sort()).toEqual(["image", "video"]);
        expect(byField.get("image")?.nodeType).toBe("imageNode");
        expect(byField.get("video")?.nodeType).toBe("videoNode");
        expect(byField.get("video")?.downstreamDataNodeId).toBe("out1");
    });

    it("omits optional text/logo bindings when those handles are not connected", () => {
        registerNode();
        const { nodes, edges } = buildGraph();
        const trimmedEdges = edges.filter(
            (e) => e.id !== "e-text" && e.id !== "e-logo",
        );

        const workflow = exportWorkflow(nodes, trimmedEdges, {
            name: "overlay",
        });
        const exec = workflow.executableNodes.find((n) => n.id === NODE_ID);
        expect(exec).toBeDefined();
        if (!exec) return;

        expect(Object.keys(exec.bindings).sort()).toEqual(["media", "ops"]);
    });
});
