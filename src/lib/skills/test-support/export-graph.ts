import type { Edge, Node } from "@xyflow/react";
import {
    NODE_TYPE_SOURCE_SPEC,
    NODE_TYPE_TO_ABI_FEATURE,
} from "@/lib/abi/node-feature-registry";
import { registerAbiNode, unregisterAbiNode } from "@/lib/abi/node-registry";
import type { ExecutableWorkflow } from "@/lib/workflow/executable-workflow";
import { exportWorkflow } from "@/lib/workflow/exporter";

/**
 * Export a graph with the REAL exporter, mirroring the mount-time ABI
 * registration the canvas performs. Synchronous register → export →
 * unregister, so nothing else observes the registry in between.
 */
export function exportGraph(
    nodes: Node[],
    edges: Edge[],
    name: string,
): ExecutableWorkflow {
    const registered: string[] = [];
    for (const n of nodes) {
        const t = n.type as keyof typeof NODE_TYPE_TO_ABI_FEATURE;
        if (!(t in NODE_TYPE_TO_ABI_FEATURE)) continue;
        registerAbiNode({
            nodeId: n.id,
            feature: NODE_TYPE_TO_ABI_FEATURE[t],
            sourceSpec:
                NODE_TYPE_SOURCE_SPEC[t as keyof typeof NODE_TYPE_SOURCE_SPEC],
        });
        registered.push(n.id);
    }
    try {
        return exportWorkflow(nodes, edges, { name });
    } finally {
        for (const id of registered) unregisterAbiNode(id);
    }
}

/** Comparable form: JSON round-trip (drops undefined) without exportedAt. */
export function normalizeExecutable(wf: ExecutableWorkflow): unknown {
    const { exportedAt: _ignored, ...rest } = wf;
    return JSON.parse(JSON.stringify(rest));
}
