import type { Edge, Node } from "@xyflow/react";

export const nodes: Node[] = [
    { id: "v1", type: "videoNode", position: { x: 0, y: 0 }, data: {} },
    {
        id: "a1",
        type: "extractAudioNode",
        position: { x: 400, y: -120 },
        data: { pluginId: "" },
    },
    {
        id: "r1",
        type: "removeVideoAudioNode",
        position: { x: 400, y: 120 },
        data: { pluginId: "" },
    },
];

export const edges: Edge[] = [
    {
        id: "e-v1-a1",
        source: "v1",
        sourceHandle: "out:videoNode",
        target: "a1",
        targetHandle: "in:video",
    },
    {
        id: "e-v1-r1",
        source: "v1",
        sourceHandle: "out:videoNode",
        target: "r1",
        targetHandle: "in:video",
    },
];
