/**
 * E9b — normalize-text-vi workflow export (AC-9).
 *
 * The exporter must emit an `ExecutableNode` whose `pluginId` is top-level and
 * whose bindings carry ONLY the slot's one business field — all derived from the
 * ABI mount registry + `resolveSpec`, never from a hand-maintained per-node map.
 */

import type { Edge, Node } from "@xyflow/react";
import { afterEach, describe, expect, it } from "vitest";

import {
    NODE_TYPE_SOURCE_SPEC,
    NODE_TYPE_TO_ABI_FEATURE,
} from "@/lib/abi/node-feature-registry";
import { registerAbiNode, unregisterAbiNode } from "@/lib/abi/node-registry";

import { exportWorkflow } from "./exporter";

const NODE_ID = "nv1";
const PLUGIN_ID = "oneflow-api-normalize-text-vi";

function buildGraph(): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [
        {
            id: "t1",
            type: "textNode",
            position: { x: 0, y: 0 },
            data: { texts: ["Giá 1.999.000₫ ngày 19/8/2026"] },
        },
        {
            id: NODE_ID,
            type: "normalizeTextViNode",
            position: { x: 300, y: 0 },
            data: { pluginId: PLUGIN_ID },
        },
        {
            id: "out1",
            type: "textNode",
            position: { x: 600, y: 0 },
            data: {},
        },
    ];
    const edges: Edge[] = [
        {
            id: "e-in",
            source: "t1",
            sourceHandle: "out:textNode",
            target: NODE_ID,
            targetHandle: "in:text",
        },
        {
            id: "e-out",
            source: NODE_ID,
            sourceHandle: "out:text",
            target: "out1",
            targetHandle: "in:textNode",
        },
    ];
    return { nodes, edges };
}

/** Mirror `useAbiExecution`'s mount-time registration, registry-derived. */
function registerNode(): void {
    registerAbiNode({
        nodeId: NODE_ID,
        feature: NODE_TYPE_TO_ABI_FEATURE.normalizeTextViNode,
        sourceSpec: NODE_TYPE_SOURCE_SPEC.normalizeTextViNode,
    });
}

afterEach(() => {
    unregisterAbiNode(NODE_ID);
});

describe("normalize-text-vi export", () => {
    it("emits top-level pluginId and one business-only binding", () => {
        registerNode();
        const { nodes, edges } = buildGraph();

        const workflow = exportWorkflow(nodes, edges, { name: "normalize" });

        const exec = workflow.executableNodes.find((n) => n.id === NODE_ID);
        expect(exec).toBeDefined();
        if (!exec) return;

        // Routing lives top-level, never inside the prompt payload.
        expect(exec.feature).toBe("normalize-text-vi");
        expect(exec.type).toBe("normalizeTextViNode");
        expect(exec.pluginId).toBe(PLUGIN_ID);

        // Exactly one ABI business field — the slot declares no other input.
        expect(Object.keys(exec.bindings)).toEqual(["text"]);

        // The fan-out driver comes from the source spec, not from a literal.
        expect(exec.batchField).toBe("text");
    });

    it("routes the output back to a text node", () => {
        registerNode();
        const { nodes, edges } = buildGraph();

        const workflow = exportWorkflow(nodes, edges, { name: "normalize" });
        const exec = workflow.executableNodes.find((n) => n.id === NODE_ID);

        expect(exec?.outputs.map((o) => o.sourceField)).toEqual(["text"]);
        expect(exec?.outputs[0]?.nodeType).toBe("textNode");
    });
});
