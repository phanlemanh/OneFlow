import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import type { NodeSlot } from "@/generated/abi";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import { resolveSpec } from "@/lib/abi/resolve";
import {
    batchOn,
    collectAll,
    configField,
    type FieldSourceOverride,
    handle,
} from "@/lib/abi/sources";
import { compilePlan, IDS_KEYED_NODE_TYPES } from "./compile";
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

// --- Finding 1 guard: field classification must be derived, not guessed ---
//
// Every node type below is a component under src/components/workspace/nodes
// that declares its own `sourceSpec` (inline `sourceSpec={{...}}` or a
// module-local const), found by sweeping
// `grep -rn "sourceSpec=" src/components/workspace/nodes` and reading each
// hit (2026-07-24). This mirrors each component's *actual* override object,
// so the assertion below computes materiality itself instead of re-asserting a
// hand-picked subset.
//
// Since every ABI node now reads its overrides from NODE_TYPE_SOURCE_SPEC, the
// `tracked` check below is satisfied for all of these, and this sweep no longer
// carries the weight it did when compile.ts kept a local mirror table. It is
// kept as a second, independently-authored copy of what the components declare:
// it still fails if a registry entry stops matching the component it serves.
// `abi/node-feature-registry.test.ts` is now the primary guard.
const INLINE_SOURCE_SPEC_SWEEP: Array<{
    nodeType: string;
    slot: NodeSlot;
    overrides: Record<string, FieldSourceOverride>;
}> = [
    // --- material: config <-> handle promotions/demotions (must be tracked) ---
    {
        nodeType: "genTextNode",
        slot: "gen-text",
        overrides: { text: batchOn({ nodeType: "textNode", path: "texts" }) },
    },
    {
        nodeType: "textGenImageNode",
        slot: "image-gen",
        overrides: { text: batchOn({ nodeType: "textNode", path: "texts" }) },
    },
    {
        nodeType: "textAudioGenSpeechNode",
        slot: "text-audio-gen-speech",
        overrides: { text: batchOn({ nodeType: "textNode", path: "texts" }) },
    },
    {
        nodeType: "textGenSpeechInstructNode",
        slot: "text-gen-speech-instruct",
        overrides: { text: batchOn({ nodeType: "textNode", path: "texts" }) },
    },
    {
        nodeType: "textGenSpeechPresetNode",
        slot: "text-gen-speech-preset",
        overrides: { text: batchOn({ nodeType: "textNode", path: "texts" }) },
    },
    {
        nodeType: "textGenSpeechCloneNode",
        slot: "text-gen-speech-clone",
        overrides: {
            text: batchOn({ nodeType: "textNode", path: "texts" }),
            ref_audio: configField(),
        },
    },
    {
        nodeType: "textGenMusicNode",
        slot: "gen-music",
        overrides: {
            tags: handle({ nodeType: "textNode", path: "texts[0]" }),
            lyrics: handle({ nodeType: "textNode", path: "texts[0]" }),
        },
    },
    {
        nodeType: "splitTextNode",
        slot: "split-text",
        overrides: { text: handle({ nodeType: "textNode", path: "texts[0]" }) },
    },
    // --- immaterial: refine a field the raw ABI schema already classifies
    // as a handle (batch/collect on a `$ref` field, or collectAll on an
    // already-handle "texts" array) — listed so the sweep is honest about
    // everything found, but expected to need no tracking. ---
    {
        nodeType: "imageGenModelNode",
        slot: "image-gen-model",
        overrides: { image: batchOn() },
    },
    {
        nodeType: "speechGenVideoNode",
        slot: "speech-text-gen-video",
        overrides: { audio: handle({ nodeType: "audioNode" }) },
    },
    {
        nodeType: "audioDescribeNode",
        slot: "audio-describe",
        overrides: { audio: batchOn() },
    },
    {
        nodeType: "imageGenTextNode",
        slot: "image-gen-text",
        overrides: { image: batchOn() },
    },
    {
        nodeType: "videoGenTextNode",
        slot: "video-gen-text",
        overrides: { video: batchOn() },
    },
    {
        nodeType: "audioGenTextSpeechRecognizeNode",
        slot: "transcribe",
        overrides: { audio: batchOn() },
    },
    {
        nodeType: "fileGenTextNode",
        slot: "parse-document",
        overrides: { document: batchOn({ nodeType: "fileNode" }) },
    },
    {
        nodeType: "getFirstFrameNode",
        slot: "get-first-frame",
        overrides: { video: batchOn() },
    },
    {
        nodeType: "getLastFrameNode",
        slot: "get-last-frame",
        overrides: { video: batchOn() },
    },
    {
        nodeType: "imageBodySegNode",
        slot: "image-body-seg",
        overrides: { image: batchOn() },
    },
    {
        nodeType: "imageGenImageUpscaleNode",
        slot: "image-upscale",
        overrides: { image: batchOn() },
    },
    {
        nodeType: "imageMattingNode",
        slot: "image-matting",
        overrides: { image: batchOn() },
    },
    {
        nodeType: "imageNormalNode",
        slot: "image-normal",
        overrides: { image: batchOn() },
    },
    {
        nodeType: "imagePoseNode",
        slot: "image-pose",
        overrides: { image: batchOn() },
    },
    {
        nodeType: "removeVideoSubtitleNode",
        slot: "subtitle_remove",
        overrides: { fileKey: batchOn({ nodeType: "videoNode" }) },
    },
    {
        nodeType: "removeVideoAudioNode",
        slot: "remove-video-audio",
        overrides: { video: batchOn() },
    },
    {
        nodeType: "removeWatermarkNode",
        slot: "remove_watermark",
        overrides: { fileKey: batchOn({ nodeType: "videoNode" }) },
    },
    {
        nodeType: "separateAudioTrackNode",
        slot: "separate_audio_track",
        overrides: { audio: batchOn() },
    },
    {
        nodeType: "separateSpeakerNode",
        slot: "separate_speaker",
        overrides: { audio: batchOn() },
    },
    {
        nodeType: "videoGenModelNode",
        slot: "video-gen-model",
        overrides: { video: batchOn() },
    },
    {
        nodeType: "videoUpscaleNode",
        slot: "video-upscale",
        overrides: { video: batchOn() },
    },
    {
        nodeType: "arrangeNode",
        slot: "arrange-group",
        overrides: { fileKeys: collectAll({ nodeType: "videoNode" }) },
    },
    {
        nodeType: "concatVideoNode",
        slot: "concat-videos",
        overrides: { videos: collectAll() },
    },
    {
        nodeType: "dropVideoNode",
        slot: "drop-video",
        overrides: { videos: collectAll() },
    },
    {
        nodeType: "mergeVideoAudioNode",
        slot: "merge-video-audio",
        overrides: { video: batchOn() },
    },
    {
        nodeType: "splitVideoNode",
        slot: "split-video",
        overrides: { video: batchOn() },
    },
    {
        nodeType: "convertVoiceNode",
        slot: "convert_voice",
        overrides: { sourceKey: batchOn({ nodeType: "audioNode" }) },
    },
    {
        nodeType: "denoiseAudioSubtitleNode",
        slot: "denoise_audio",
        overrides: { fileKey: batchOn({ nodeType: "audioNode" }) },
    },
    {
        nodeType: "extractAudioNode",
        slot: "extract-audio",
        overrides: { video: batchOn() },
    },
    {
        nodeType: "textsGenTextNode",
        slot: "combine-text",
        overrides: { texts: collectAll() },
    },
];

/**
 * Materiality check shared by the "Finding 1 guard" tests below. Pulled out
 * of the test body so the renamed-field regression test (polish item 3) can
 * exercise the exact same presence-checked logic instead of re-deriving it.
 */
function materialUntrackedFields(
    entries: ReadonlyArray<{
        nodeType: string;
        slot: NodeSlot;
        overrides: Record<string, FieldSourceOverride>;
    }>,
): string[] {
    const untracked: string[] = [];
    for (const { nodeType, slot, overrides } of entries) {
        const withOverride = resolveSpec(slot, overrides);
        const withoutOverride = resolveSpec(slot, undefined);
        const tracked = nodeType in NODE_TYPE_SOURCE_SPEC;
        for (const field of Object.keys(overrides)) {
            const withF = withOverride.fields[field];
            const withoutF = withoutOverride.fields[field];
            if (!withF || !withoutF) {
                // A component field rename (or a typo'd field name in the
                // sweep table above) leaves this field absent from the
                // resolved spec instead of matching anything — report it
                // plainly rather than crashing on `.kind` of `undefined`.
                untracked.push(
                    `${nodeType}.${field} (not found in resolved spec — renamed or removed field?)`,
                );
                continue;
            }
            const manualChanged =
                withF.kind === "handle" &&
                withoutF.kind === "handle" &&
                !!withF.manual !== !!withoutF.manual;
            const isMaterial = withF.kind !== withoutF.kind || manualChanged;
            if (isMaterial && !tracked) {
                untracked.push(`${nodeType}.${field}`);
            }
        }
    }
    return untracked;
}

describe("Finding 1 guard — inline sourceSpec overrides must be tracked", () => {
    it("every node component's real sourceSpec is exercised without throwing", () => {
        // Sanity: every (slot, overrides) pair above must resolve — a typo'd
        // field name or slot would throw inside getAbiTopology/resolveSpec.
        for (const { slot, overrides } of INLINE_SOURCE_SPEC_SWEEP) {
            expect(() => resolveSpec(slot, overrides)).not.toThrow();
        }
    });

    it("flags any override that changes a field's handle/manual classification but isn't tracked by NODE_TYPE_SOURCE_SPEC", () => {
        expect(materialUntrackedFields(INLINE_SOURCE_SPEC_SWEEP)).toEqual([]);
    });

    // --- Polish item 3: the guard must fail cleanly on a renamed field ---
    it("reports a readable message instead of throwing TypeError when a swept field is absent from the resolved spec (simulated component field rename)", () => {
        const renamedFieldSweep = [
            {
                nodeType: "textGenMusicNode",
                slot: "gen-music" as NodeSlot,
                overrides: {
                    // `lyrics` renamed on the component but not updated here
                    // — exactly what a drifted sweep entry looks like.
                    lyricsRenamed: handle({
                        nodeType: "textNode" as const,
                        path: "texts[0]",
                    }),
                },
            },
        ];
        expect(() => materialUntrackedFields(renamedFieldSweep)).not.toThrow();
        expect(materialUntrackedFields(renamedFieldSweep)).toEqual([
            "textGenMusicNode.lyricsRenamed (not found in resolved spec — renamed or removed field?)",
        ]);
    });
});

// --- Finding 2 guard: every `data.ids`-reading node type must be listed ---
//
// Node types found by sweeping every node component for `data.ids` / a
// destructured `ids` field:
//   grep -rnE "data\.ids|\{\s*ids\s*(=|:)" src/components/workspace/nodes
// (2026-07-24) — imageFusionNode, imagesGenVideoNode, speechGenVideoNode,
// genTextNode (text-gen-text.tsx), textGenVideoNode (text-gen-video.tsx).
const DATA_IDS_READING_NODE_TYPES = [
    "imageFusionNode",
    "imagesGenVideoNode",
    "speechGenVideoNode",
    "genTextNode",
    "textGenVideoNode",
];

describe("Finding 2 guard — IDS_KEYED_NODE_TYPES must match the data.ids sweep", () => {
    it("matches exactly the node types whose component reads data.ids", () => {
        expect(new Set(IDS_KEYED_NODE_TYPES)).toEqual(
            new Set(DATA_IDS_READING_NODE_TYPES),
        );
    });
});

// --- Proof: manual handle fields (config<->handle from the real component,
// not the raw ABI schema) now classify and compile correctly ---

describe("compilePlan — manual handle field (imageFusionNode.text)", () => {
    const REF_PLAN: DirectorPlan = {
        dslVersion: 1,
        name: "fusion with referenced caption",
        description: "",
        steps: [
            { id: "s1", kind: "text", text: "a cute cat, cartoon style" },
            {
                id: "s2",
                kind: "gen",
                slot: "image-gen",
                inputs: [{ field: "text", value: "@s1" }],
                params: [],
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
                kind: "text",
                text: "cat and mouse take a photo together",
            },
            {
                id: "s6",
                kind: "gen",
                slot: "image-fusion",
                inputs: [
                    { field: "images", value: ["@s2", "@s4"] },
                    { field: "text", value: "@s5" },
                ],
                params: [],
            },
        ],
    };

    it("accepts a ref on the manual text field and wires a real edge (previously a spurious REF_ON_CONFIG_FIELD)", () => {
        const result = compilePlan(REF_PLAN, {
            slotDefaultPlugin: DEMO_PLUGINS,
            idFn: seqId(),
        });
        expect(result.issues).toEqual([]);
        const handles = result.edges.map(
            (e: Edge) => `${e.sourceHandle ?? "-"}=>${e.targetHandle ?? "-"}`,
        );
        expect(handles).toContain("out:textNode=>in:text");
        const fusion = byType(result.nodes).imageFusionNode[0];
        expect(fusion.data.text).toBeUndefined(); // fed by edge, not a config literal
    });

    it("still writes a literal straight to data with no edge (unchanged demo-plan behavior)", () => {
        const result = compilePlan(PLAN, {
            slotDefaultPlugin: DEMO_PLUGINS,
            idFn: seqId(),
        });
        const fusion = byType(result.nodes).imageFusionNode[0];
        expect(fusion.data.text).toBe("cat and mouse take a photo together");
        const targetsFusion = result.edges.filter(
            (e: Edge) => e.target === fusion.id && e.targetHandle === "in:text",
        );
        expect(targetsFusion).toHaveLength(0);
    });

    it("does not raise MISSING_REQUIRED_INPUT for a manual field left unfed (form fallback, spec §5)", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "fusion without a caption",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "a cute cat" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [{ field: "text", value: "@s1" }],
                        params: [],
                    },
                    { id: "s3", kind: "text", text: "a cute mouse" },
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
                        // "text" is ABI-required but manual — intentionally omitted.
                        inputs: [{ field: "images", value: ["@s2", "@s4"] }],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([]);
    });
});

describe("compilePlan — previously-uncovered handle field (splitTextNode.text)", () => {
    it("spawns an addText+text pair for a literal instead of silently writing to data with no edge", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "split",
                description: "",
                steps: [
                    {
                        id: "g1",
                        kind: "gen",
                        slot: "split-text",
                        inputs: [
                            { field: "text", value: "once upon a time..." },
                        ],
                        params: [],
                    },
                ],
            },
            {
                slotDefaultPlugin: {
                    ...DEMO_PLUGINS,
                    "split-text": "demo-split-text",
                },
                idFn: seqId(),
            },
        );
        expect(result.issues).toEqual([]);
        const t = byType(result.nodes);
        expect(t.addTextNode).toHaveLength(1);
        // One textNode from the addText source pair feeding "text", plus one
        // textNode sink for split-text's own `texts` output.
        expect(t.textNode).toHaveLength(2);
        expect(t.splitTextNode).toHaveLength(1);
        expect(t.splitTextNode[0].data.text).toBeUndefined();
        const split = t.splitTextNode[0];
        const inEdge = result.edges.find(
            (e: Edge) => e.target === split.id && e.targetHandle === "in:text",
        );
        expect(inEdge?.sourceHandle).toBe("out:textNode");
        const sourceTextNode = t.textNode.find((n) => n.id === inEdge?.source);
        expect(sourceTextNode?.data.texts).toEqual(["once upon a time..."]);
    });
});

describe("compilePlan — reclassified handle -> config demotion (textGenSpeechCloneNode.ref_audio)", () => {
    it("rejects a ref on ref_audio as REF_ON_CONFIG_FIELD instead of wiring a dangling edge", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "clone",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "hello there" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "text-gen-speech-clone",
                        inputs: [
                            { field: "text", value: "@s1" },
                            { field: "ref_audio", value: "@s1" },
                        ],
                        params: [],
                    },
                ],
            },
            {
                slotDefaultPlugin: {
                    ...DEMO_PLUGINS,
                    "text-gen-speech-clone": "demo-clone",
                },
                idFn: seqId(),
            },
        );
        expect(result.issues).toEqual([
            {
                code: "REF_ON_CONFIG_FIELD",
                stepId: "s2",
                slot: "text-gen-speech-clone",
                message:
                    'config field "ref_audio" only accepts a single literal value',
            },
        ]);
    });
});

describe("compilePlan — Finding 2 fix: genTextNode and textGenVideoNode seed data.ids", () => {
    it("seeds genTextNode.data.ids with the upstream textNode id", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "compose text",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "instructions" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "gen-text",
                        inputs: [{ field: "text", value: "@s1" }],
                        params: [],
                    },
                ],
            },
            {
                slotDefaultPlugin: {
                    ...DEMO_PLUGINS,
                    "gen-text": "demo-gen-text",
                },
                idFn: seqId(),
            },
        );
        expect(result.issues).toEqual([]);
        const t = byType(result.nodes);
        const gen = t.genTextNode[0];
        const upstreamTextId = t.textNode[0].id;
        expect(gen.data.ids).toEqual([upstreamTextId]);
    });

    it("seeds textGenVideoNode.data.ids with the upstream textNode id", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "text to video",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "a video prompt" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "text-gen-video",
                        inputs: [{ field: "text", value: "@s1" }],
                        params: [{ field: "duration", value: 5 }],
                    },
                ],
            },
            {
                slotDefaultPlugin: {
                    ...DEMO_PLUGINS,
                    "text-gen-video": "demo-text-gen-video",
                },
                idFn: seqId(),
            },
        );
        expect(result.issues).toEqual([]);
        const t = byType(result.nodes);
        const gen = t.textGenVideoNode[0];
        const upstreamTextId = t.textNode[0].id;
        expect(gen.data.ids).toEqual([upstreamTextId]);
    });
});

// --- Polish item 1: `params` on a manual handle field must be accepted ---

describe("compilePlan — polish 1: manual handle field literal accepted via params", () => {
    it("puts image-fusion's caption in params without a spurious UNKNOWN_INPUT_FIELD", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "fusion caption via params",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "a cute cat" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [{ field: "text", value: "@s1" }],
                        params: [],
                    },
                    { id: "s3", kind: "text", text: "a cute mouse" },
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
                        inputs: [{ field: "images", value: ["@s2", "@s4"] }],
                        params: [
                            {
                                field: "text",
                                value: "cat and mouse take a photo together",
                            },
                        ],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([]);
        const fusion = byType(result.nodes).imageFusionNode[0];
        expect(fusion.data.text).toBe("cat and mouse take a photo together");
    });
});

// --- Polish item 2: data.texts must not merge literals across different
// text handle fields (gen-music's tags/lyrics) ---

describe("compilePlan — polish 2: per-field text literal caching (gen-music tags/lyrics)", () => {
    it("keeps tags and lyrics literals distinguishable instead of merging into a shared data.texts", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "music with tags and lyrics",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "upbeat synth pop" },
                    { id: "s2", kind: "text", text: "verse one, chorus two" },
                    {
                        id: "s3",
                        kind: "gen",
                        slot: "gen-music",
                        inputs: [
                            { field: "tags", value: "@s1" },
                            { field: "lyrics", value: "@s2" },
                        ],
                        params: [],
                    },
                ],
            },
            {
                slotDefaultPlugin: {
                    ...DEMO_PLUGINS,
                    "gen-music": "demo-gen-music",
                },
                idFn: seqId(),
            },
        );
        expect(result.issues).toEqual([]);
        const gen = byType(result.nodes).textGenMusicNode[0];
        expect(gen.data.tags).toBe("upbeat synth pop");
        expect(gen.data.lyrics).toBe("verse one, chorus two");
        // Neither field is the ABI's canonical `text`/`texts` field, so
        // neither seeds the generic cache — there is nothing to merge them
        // into and lose distinctness.
        expect(gen.data.texts).toBeUndefined();
    });
});

// --- Polish item 4: ARITY_MISMATCH must be reachable on config fields ---

describe("compilePlan — polish 4: ARITY_MISMATCH reachable on config fields", () => {
    it("reports ARITY_MISMATCH for a multi-value array on a genuine config field", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "bad width",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "a cute cat" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [
                            { field: "text", value: "@s1" },
                            { field: "width", value: ["1024", "768"] },
                        ],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "ARITY_MISMATCH",
                stepId: "s2",
                slot: "image-gen",
                message: 'config field "width" accepts a single value',
            },
        ]);
    });

    it("still reports REF_ON_CONFIG_FIELD for a single ref on a config field", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "ref on width",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "a cute cat" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [
                            { field: "text", value: "@s1" },
                            { field: "width", value: "@s1" },
                        ],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "REF_ON_CONFIG_FIELD",
                stepId: "s2",
                slot: "image-gen",
                message:
                    'config field "width" only accepts a single literal value',
            },
        ]);
    });
});

describe("compilePlan — hardening 1: Object.prototype keys rejected as slots", () => {
    it("rejects plan with slot: constructor as UNKNOWN_SLOT instead of throwing", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "proto key slot",
                description: "",
                steps: [
                    {
                        id: "s1",
                        kind: "gen",
                        slot: "constructor",
                        inputs: [],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "UNKNOWN_SLOT",
                stepId: "s1",
                slot: "constructor",
                message: 'unknown slot "constructor"',
            },
        ]);
    });
});

describe("compilePlan — hardening 3: ref-shaped strings in params rejected", () => {
    it("rejects a ref-shaped value in params as REF_ON_CONFIG_FIELD and does not write data", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "ref in params",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "image 1" },
                    { id: "s2", kind: "text", text: "image 2" },
                    {
                        id: "s3",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [{ field: "text", value: "@s1" }],
                        params: [],
                    },
                    {
                        id: "s4",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [{ field: "text", value: "@s2" }],
                        params: [],
                    },
                    {
                        id: "s5",
                        kind: "gen",
                        slot: "image-fusion",
                        inputs: [{ field: "images", value: ["@s3", "@s4"] }],
                        params: [{ field: "text", value: "@s1" }],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "REF_ON_CONFIG_FIELD",
                stepId: "s5",
                slot: "image-fusion",
                message:
                    'config field "text" only accepts a single literal value',
            },
        ]);
        const fusion = byType(result.nodes).imageFusionNode[0];
        expect(fusion.data.text).toBeUndefined();
    });
});

// --- Task 4: remaining CompileIssueCode coverage ---
//
// UNKNOWN_SLOT, REF_ON_CONFIG_FIELD, and ARITY_MISMATCH already have full-
// issue-object coverage above. The cases below fill in the rest of
// CompileIssueCode. CYCLE is deliberately left uncovered — see the note at
// the bottom of this file for why it is unreachable by construction.

describe("compilePlan — DUPLICATE_ID", () => {
    it("flags a repeated step id but still compiles both steps (does not suppress emission)", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "dup",
                description: "",
                steps: [
                    { id: "t1", kind: "text", text: "a cute cat" },
                    { id: "t1", kind: "text", text: "a cute dog" },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "DUPLICATE_ID",
                stepId: "t1",
                message: 'duplicate step id "t1"',
            },
        ]);
        // Both text-source pairs are still emitted despite the id clash —
        // the duplicate is reported, not fatal.
        const t = byType(result.nodes);
        expect(t.addTextNode).toHaveLength(2);
        expect(t.textNode).toHaveLength(2);
    });
});

describe("compilePlan — MISSING_PLUGIN", () => {
    it("flags a slot with no installed plugin but still emits the node with an empty pluginId", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "no plugin",
                description: "",
                steps: [
                    { id: "t1", kind: "text", text: "a cute cat" },
                    {
                        id: "g1",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [{ field: "text", value: "@t1" }],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: {}, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "MISSING_PLUGIN",
                stepId: "g1",
                slot: "image-gen",
                message: 'no installed plugin serves slot "image-gen"',
            },
        ]);
        // Node emission is not suppressed; pluginId just falls back to "".
        const gen = byType(result.nodes).textGenImageNode[0];
        expect(gen.data.pluginId).toBe("");
    });
});

describe("compilePlan — UNKNOWN_REF", () => {
    it("flags a ref to a non-existent step id and skips only that edge", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "ghost ref",
                description: "",
                steps: [
                    {
                        id: "g1",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [{ field: "text", value: "@ghost" }],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "UNKNOWN_REF",
                stepId: "g1",
                message: '"@ghost" does not reference an earlier step',
            },
        ]);
        // No text-source pair or "in:text" edge gets created for the
        // unresolved ref; only the gen node's own primary-output edge exists.
        const t = byType(result.nodes);
        expect(t.addTextNode).toBeUndefined();
        expect(t.textNode).toBeUndefined();
        const inTextEdges = result.edges.filter(
            (e: Edge) => e.targetHandle === "in:text",
        );
        expect(inTextEdges).toHaveLength(0);
        expect(result.edges).toHaveLength(1); // gen -> output imageNode only
    });
});

describe("compilePlan — UNKNOWN_INPUT_FIELD", () => {
    it("flags an input field name the slot doesn't define and skips only that field", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "bogus field",
                description: "",
                steps: [
                    { id: "t1", kind: "text", text: "a cute cat" },
                    {
                        id: "g1",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [
                            { field: "text", value: "@t1" },
                            { field: "nonsense", value: "@t1" },
                        ],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "UNKNOWN_INPUT_FIELD",
                stepId: "g1",
                slot: "image-gen",
                message: '"nonsense" is not an input of image-gen',
            },
        ]);
        // The valid "text" field still wires normally; "nonsense" produces
        // no handle at all.
        const inNonsenseEdge = result.edges.find(
            (e: Edge) => e.targetHandle === "in:nonsense",
        );
        expect(inNonsenseEdge).toBeUndefined();
        const inTextEdge = result.edges.find(
            (e: Edge) => e.targetHandle === "in:text",
        );
        expect(inTextEdge?.sourceHandle).toBe("out:textNode");
    });
});

describe("compilePlan — MODALITY_MISMATCH", () => {
    it("flags a handle field fed a ref whose upstream node type doesn't match (image field <- text step)", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "wrong modality",
                description: "",
                steps: [
                    { id: "t1", kind: "text", text: "not an image" },
                    {
                        id: "g1",
                        kind: "gen",
                        slot: "image-gen-video",
                        inputs: [{ field: "image", value: "@t1" }],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "MODALITY_MISMATCH",
                stepId: "g1",
                message:
                    'field "image" expects imageNode; "@t1" produces textNode',
            },
        ]);
        // "image" is provided (just wrongly typed), so this does not also
        // raise MISSING_REQUIRED_INPUT, and no edge/fileKeys placeholder is
        // created for the rejected field.
        const gen = byType(result.nodes).imageGenVideoNode[0];
        expect(gen.data.fileKeys).toBeUndefined();
        const inImageEdge = result.edges.find(
            (e: Edge) => e.targetHandle === "in:image",
        );
        expect(inImageEdge).toBeUndefined();
    });
});

describe("compilePlan — MISSING_REQUIRED_INPUT", () => {
    it("flags a required, non-manual handle field left unconnected (image-gen-video's image)", () => {
        // image-gen's own "text" is not ABI-required (config-fallback
        // leniency, spec §5), so it can't exercise this code — use
        // image-gen-video's "image", which the ABI does require and no
        // node component demotes to manual.
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "no image",
                description: "",
                steps: [
                    {
                        id: "g1",
                        kind: "gen",
                        slot: "image-gen-video",
                        inputs: [],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "MISSING_REQUIRED_INPUT",
                stepId: "g1",
                slot: "image-gen-video",
                message:
                    'required input "image" of image-gen-video is not connected',
            },
        ]);
        // Node emission is not suppressed; the field is just left unwired.
        const gen = byType(result.nodes).imageGenVideoNode[0];
        expect(gen).toBeDefined();
        expect(gen.data.fileKeys).toBeUndefined();
    });
});

// --- CYCLE: unreachable by construction, deliberately left uncovered ---
//
// compilePlan builds `outputs` forward, one step at a time (see the final
// loop in compilePlan): a ref only resolves via `outputs.get(refId(v))`,
// which only ever contains steps whose compilation has already completed.
// Every edge this compiler emits therefore goes from an already-created
// node to a brand-new one — the emission order is already a valid
// topological order, so `layoutByLevels`'s stray-node check (the only
// producer of CYCLE) can never find an unpositioned node for any graph this
// compiler itself constructs from a DirectorPlan. Forcing a "cycle" would
// require fabricating a graph compilePlan cannot produce (e.g. a
// pathological idFn that reuses ids across distinct nodes) — that tests the
// defensive fallback, not compiler behavior on any real DSL input, so per
// the task brief it is left uncovered rather than faked.
