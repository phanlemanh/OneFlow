import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { compilePlan } from "./compile";
import type { DirectorPlan } from "./dsl";

/** Deterministic id generator for stable assertions. */
function seqId(): () => string {
    let n = 0;
    return () => `n${++n}`;
}

const DEMO_PLUGINS = {
    "image-gen": "tongflow-modal-z-image",
    "image-fusion": "tongflow-modal-flux2-klein9b",
    "image-gen-video": "tongflow-modal-ltx",
};

const PLAN: DirectorPlan = {
    dslVersion: 1,
    name: "Cat and mouse",
    description: "",
    steps: [
        { id: "s1", kind: "text", text: "a cute cat, cartoon style" },
        {
            id: "s2",
            kind: "gen",
            slot: "image-gen",
            inputs: [{ field: "text", value: "@s1" }],
            params: [
                { field: "width", value: 1024 },
                { field: "height", value: 1024 },
            ],
        },
        { id: "s3", kind: "text", text: "a cute mouse, cartoon style" },
        {
            id: "s4",
            kind: "gen",
            slot: "image-gen",
            inputs: [{ field: "text", value: "@s3" }],
            params: [],
        },
        {
            id: "s5",
            kind: "gen",
            slot: "image-fusion",
            inputs: [
                { field: "images", value: ["@s2", "@s4"] },
                { field: "text", value: "cat and mouse take a photo together" },
            ],
            params: [],
        },
        {
            id: "s6",
            kind: "gen",
            slot: "image-gen-video",
            inputs: [{ field: "image", value: "@s5" }],
            params: [{ field: "duration", value: 5 }],
        },
    ],
};

function byType(nodes: Node[]): Record<string, Node[]> {
    const out: Record<string, Node[]> = {};
    for (const n of nodes) {
        const type = n.type as string;
        if (!out[type]) out[type] = [];
        out[type].push(n);
    }
    return out;
}

describe("compilePlan — happy path (mirrors public/example.json)", () => {
    const result = compilePlan(PLAN, {
        slotDefaultPlugin: DEMO_PLUGINS,
        idFn: seqId(),
    });

    it("produces no issues", () => {
        expect(result.issues).toEqual([]);
    });

    it("emits the example.json node census (12 nodes, 11 edges)", () => {
        const t = byType(result.nodes);
        expect(t.addTextNode).toHaveLength(2);
        expect(t.textNode).toHaveLength(2);
        expect(t.textGenImageNode).toHaveLength(2);
        expect(t.imageFusionNode).toHaveLength(1);
        expect(t.imageGenVideoNode).toHaveLength(1);
        expect(t.imageNode).toHaveLength(3); // 2 gen outputs + fusion output
        expect(t.videoNode).toHaveLength(1);
        expect(result.nodes).toHaveLength(12);
        expect(result.edges).toHaveLength(11);
    });

    it("wires handles exactly like the example", () => {
        const handles = result.edges.map(
            (e: Edge) => `${e.sourceHandle ?? "-"}=>${e.targetHandle ?? "-"}`,
        );
        expect(handles).toContain("-=>in:textNode"); // addText -> text
        expect(handles).toContain("out:textNode=>in:text"); // text -> image-gen
        expect(handles).toContain("out:image=>in:imageNode"); // gen -> imageNode
        expect(handles).toContain("out:imageNode=>in:images"); // imageNode -> fusion
    });

    it("seeds executable node data (feature, pluginId, params, known text)", () => {
        const gen = byType(result.nodes).textGenImageNode[0];
        expect(gen.data).toMatchObject({
            feature: "image-gen",
            pluginId: "tongflow-modal-z-image",
            width: 1024,
            height: 1024,
            texts: ["a cute cat, cartoon style"],
        });
        const fusion = byType(result.nodes).imageFusionNode[0];
        expect(fusion.data).toMatchObject({
            feature: "image-fusion",
            pluginId: "tongflow-modal-flux2-klein9b",
            text: "cat and mouse take a photo together", // config literal rerouted
        });
        const video = byType(result.nodes).imageGenVideoNode[0];
        expect(video.data).toMatchObject({
            feature: "image-gen-video",
            duration: 5,
            fileKeys: [],
        });
    });

    it("seeds source pairs like the example (manualValue + texts)", () => {
        const add = byType(result.nodes).addTextNode[0];
        expect(add.data).toMatchObject({
            manualValue: "a cute cat, cartoon style",
        });
        const text = byType(result.nodes).textNode[0];
        expect(text.data).toMatchObject({
            texts: ["a cute cat, cartoon style"],
        });
    });

    it("gives every node an origin and a position", () => {
        for (const n of result.nodes) {
            expect(n.origin).toEqual([0.5, 0.5]);
            expect(typeof n.position.x).toBe("number");
            expect(typeof n.position.y).toBe("number");
        }
    });

    // --- Reconciliation coverage beyond the brief's given assertions ---
    // (see compile.ts's Step 0 investigation comment for why these matter).

    it("does NOT stamp fileKeys onto a text-only gen node's own data", () => {
        // textGenImageNode only consumes a textNode handle; unlike
        // imageGenVideoNode it has no file-backed input, so it must not get
        // a placeholder `fileKeys` (public/example.json's image-gen nodes
        // never carry that key).
        const gen = byType(result.nodes).textGenImageNode[0];
        expect(gen.data.fileKeys).toBeUndefined();
    });

    it("seeds imageFusionNode.data.ids with the upstream imageNode ids", () => {
        // image-fusion.tsx reads `data.ids` directly on mount
        // (`useNodesData(ids)`) rather than deriving it from edges.
        const fusion = byType(result.nodes).imageFusionNode[0];
        const imageOutputs = byType(result.nodes).imageNode;
        // The two gen-step image outputs (not the fusion's own output).
        const upstreamImageIds = imageOutputs.slice(0, 2).map((n) => n.id);
        expect(fusion.data.ids).toEqual(upstreamImageIds);
    });
});

describe("compilePlan — inline literal on a text handle field", () => {
    it("spawns an addText+text pair for the literal", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "inline",
                description: "",
                steps: [
                    {
                        id: "g1",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [{ field: "text", value: "sunset over hanoi" }],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([]);
        const t = byType(result.nodes);
        expect(t.addTextNode).toHaveLength(1);
        expect(t.textNode).toHaveLength(1);
        expect(t.textGenImageNode).toHaveLength(1);
    });
});
