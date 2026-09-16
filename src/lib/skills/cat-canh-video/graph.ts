import type { Edge, Node } from "@xyflow/react";

export const nodes: Node[] = [
    { id: "v1", type: "videoNode", position: { x: 0, y: 0 }, data: {} },
    {
        id: "s1",
        type: "splitVideoNode",
        position: { x: 400, y: 0 },
        data: { threshold: 20, pluginId: "" },
    },
];
export const edges: Edge[] = [
    {
        id: "e-v1-s1",
        source: "v1",
        sourceHandle: "out:videoNode",
        target: "s1",
        targetHandle: "in:video",
    },
];
