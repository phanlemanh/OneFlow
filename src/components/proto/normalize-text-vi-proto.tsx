"use client";

import {
    type Edge,
    Handle,
    type Node,
    Position,
    ReactFlow,
    ReactFlowProvider,
} from "@xyflow/react";

import NormalizeTextViNode from "@/components/workspace/nodes/transfer/normalize-text-vi";

/**
 * Prototype for the `normalize-text-vi` capture matrix (E15/E16).
 *
 * Context rung: `host-embedded` — the REAL node renders inside a real React
 * Flow canvas, so what gets judged is the shipping component's own markup and
 * tokens. Only the surrounding data is fixture.
 *
 * Why this exists at all: transfer nodes are not reachable from any picker.
 * `NODE_CATEGORIES` has no consumer anywhere in src/, and the smart island only
 * offers the `add*` data nodes — so on the live canvas this node (like all 30
 * shipped transfer nodes) appears only when the Director plans it. A capture
 * step that says "add the node from the picker" describes an interaction that
 * does not exist. This route is the repo's own answer to that, already used by
 * byo-key-onboarding.
 *
 * Two states, matching the narrowed matrix: `idle` (nothing wired) and `wired`
 * (an upstream text node feeding in:text). The running and residual-error states
 * are driven by `exec.loading` and task state, which cannot be set from outside
 * without faking a store or editing the shared shell — see the ledger entry.
 *
 * Fixtures only. No task creation, no plugin call, no write path.
 */

const StubTextNode = () => (
    <div className="rounded-md border bg-white px-3 py-2 text-sm">
        <span>Giá 1.999.000₫ ngày 19/8/2026</span>
        <Handle type="source" position={Position.Right} id="out:textNode" />
    </div>
);

const NODE_TYPES = {
    normalizeTextViNode: NormalizeTextViNode,
    textNode: StubTextNode,
};

const NODE_ID = "proto-normalize";

function buildGraph(state: string): { nodes: Node[]; edges: Edge[] } {
    const wired = state === "wired";

    const nodes: Node[] = [
        {
            id: NODE_ID,
            type: "normalizeTextViNode",
            position: { x: wired ? 420 : 120, y: 120 },
            data: wired ? { texts: ["Giá 1.999.000₫ ngày 19/8/2026"] } : {},
        },
    ];
    const edges: Edge[] = [];

    if (wired) {
        nodes.unshift({
            id: "src",
            type: "textNode",
            position: { x: 80, y: 130 },
            data: { texts: ["Giá 1.999.000₫ ngày 19/8/2026"] },
        });
        edges.push({
            id: "e-src",
            source: "src",
            sourceHandle: "out:textNode",
            target: NODE_ID,
            targetHandle: "in:text",
        });
    }

    return { nodes, edges };
}

export function NormalizeTextViProto({ state }: { state: string }) {
    const { nodes, edges } = buildGraph(state);

    return (
        <div className="h-screen w-full">
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={NODE_TYPES}
                    fitView
                />
            </ReactFlowProvider>
        </div>
    );
}
