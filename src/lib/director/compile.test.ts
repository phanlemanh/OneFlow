import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import type { NodeSlot } from "@/generated/abi";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import { resolveSpec } from "@/lib/abi/resolve";
import { type FieldSourceOverride, handle } from "@/lib/abi/sources";
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

/**
 * Materiality check originally shared by a hand-authored sweep of every ABI
 * node component's real `sourceSpec` (deleted — Minor 10: it duplicated most
 * of NODE_TYPE_SOURCE_SPEC itself and, by its own comment, `abi/
 * node-feature-registry.test.ts`'s filesystem scan had already become the
 * primary guard for "every component's override is tracked"). Kept because
 * the renamed-field regression test below still exercises it directly.
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

describe("materialUntrackedFields — renamed-field regression (Minor 10)", () => {
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

// --- Fix 7 / Finding 2 guard: every `data.ids`-reading node type must be
// listed in IDS_KEYED_NODE_TYPES — enforced by scanning the real component
// files at test time (readdirSync/readFileSync), not by comparing against a
// second hand-copied list that a future component change could silently
// leave stale. Mirrors safe-slots.test.ts / node-feature-registry.test.ts's
// own filesystem-scan guards. ---

const TYPES_FILE = "src/components/workspace/types.tsx";
/** `data.ids` (a plain property read) or a destructured `{ ids }` /
 * `{ ids: alias }` — the two shapes a component actually reads this field
 * with, per compile.ts's Step 0 note (b). */
const DATA_IDS_REGEX = /data\.ids|\{\s*ids\s*[=:]/;

/**
 * Repo-relative file path for every registered ReactFlow node type, derived
 * by parsing `types.tsx` itself: its own `import Name from "./nodes/.../x"`
 * statements (default *and* named — e.g. `AddModelNode`) give component ->
 * file, and the `NODE_TYPES` object literal body gives nodeType ->
 * component. Combining the two is exactly how the app itself resolves a
 * node type to its component, so this can't drift from what the canvas
 * actually renders the way a hand-copied file list could.
 */
function nodeTypeFilePaths(): Record<string, string> {
    const src = readFileSync(TYPES_FILE, "utf8");

    const componentPaths = new Map<string, string>();
    const importRe =
        /^import\s+(?:\{\s*(\w+)\s*\}|(\w+))\s+from\s+"([^"]+)";?\s*$/gm;
    for (const m of src.matchAll(importRe)) {
        const name = m[1] ?? m[2];
        const modulePath = m[3];
        if (!modulePath.startsWith(".")) continue; // e.g. "@xyflow/react"
        componentPaths.set(name, `${modulePath}.tsx`);
    }

    const bodyMatch = src.match(
        /export const NODE_TYPES: NodeTypes = \{([\s\S]*?)\n\};/,
    );
    if (!bodyMatch) {
        throw new Error(
            "could not locate the NODE_TYPES object literal in types.tsx — has its shape changed?",
        );
    }
    const entryRe = /^\s*(\w+):\s*(\w+),?\s*$/gm;

    const out: Record<string, string> = {};
    for (const m of bodyMatch[1].matchAll(entryRe)) {
        const [, nodeType, component] = m;
        const rel = componentPaths.get(component);
        if (!rel) continue;
        out[nodeType] = join(dirname(TYPES_FILE), rel);
    }
    return out;
}

/** Every registered node type whose component source matches DATA_IDS_REGEX. */
function nodeTypesReadingDataIds(): Set<string> {
    const found = new Set<string>();
    for (const [nodeType, path] of Object.entries(nodeTypeFilePaths())) {
        if (DATA_IDS_REGEX.test(readFileSync(path, "utf8"))) {
            found.add(nodeType);
        }
    }
    return found;
}

describe("Finding 2 guard — IDS_KEYED_NODE_TYPES must match the data.ids sweep", () => {
    it("resolves a plausible number of node types from types.tsx", () => {
        // Guards against the scan silently matching nothing (wrong path,
        // types.tsx's import/object-literal shape changed).
        expect(Object.keys(nodeTypeFilePaths()).length).toBeGreaterThan(40);
    });

    it("matches exactly the node types whose component reads data.ids", () => {
        expect(new Set(IDS_KEYED_NODE_TYPES)).toEqual(
            nodeTypesReadingDataIds(),
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

// --- Fix 2: params loop rejects a value whose JS type doesn't match the
// field's declared JSON Schema type (dsl.ts's ParamEntrySchema can only
// carry string | number | boolean, so a mismatch here is a real plan bug,
// not something the node's own form can silently coerce) ---

describe("compilePlan — Fix 2: param value type-checked against the field's declared schema type", () => {
    it("reports MODALITY_MISMATCH when a number-typed config field gets a string value via params", () => {
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
                        inputs: [{ field: "text", value: "@s1" }],
                        params: [{ field: "width", value: "large" }],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([
            {
                code: "MODALITY_MISMATCH",
                stepId: "s2",
                slot: "image-gen",
                message:
                    'config field "width" declares type integer; got a value of type string',
            },
        ]);
        const gen = byType(result.nodes).textGenImageNode[0];
        expect((gen.data as Record<string, unknown>).width).toBeUndefined();
    });

    it("reports MODALITY_MISMATCH when a boolean-typed config field gets a number value via params", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "bad duplicatable",
                description: "",
                steps: [
                    {
                        id: "s1",
                        kind: "gen",
                        slot: "arrange-group",
                        inputs: [],
                        params: [{ field: "duplicatable", value: 1 }],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toContainEqual({
            code: "MODALITY_MISMATCH",
            stepId: "s1",
            slot: "arrange-group",
            message:
                'config field "duplicatable" declares type boolean; got a value of type number',
        });
        const gen = byType(result.nodes).arrangeNode[0];
        expect(
            (gen.data as Record<string, unknown>).duplicatable,
        ).toBeUndefined();
    });

    it("rejects any scalar via params on an array-typed config field — the DSL can never carry a correct value for it", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "bad items",
                description: "",
                steps: [
                    {
                        id: "s1",
                        kind: "gen",
                        slot: "arrange-group",
                        inputs: [],
                        params: [{ field: "items", value: "not-an-array" }],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toContainEqual({
            code: "MODALITY_MISMATCH",
            stepId: "s1",
            slot: "arrange-group",
            message:
                'config field "items" declares type array; got a value of type string',
        });
    });

    it("accepts a matching integer-typed value via params (integer schema type maps to JS number)", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "good seed",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "some audio" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "music-complete",
                        inputs: [],
                        params: [{ field: "seed", value: 42 }],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(
            result.issues.filter((i) => i.code === "MODALITY_MISMATCH"),
        ).toEqual([]);
        const gen = byType(result.nodes).musicCompleteNode[0];
        expect((gen.data as Record<string, unknown>).seed).toBe(42);
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

// --- Minor 9: classifyField's field lookup guarded the same way the slot
// lookup already is (Object.hasOwn), so an Object.prototype member name
// doesn't get silently treated as a real field. ---

describe("compilePlan — Minor 9: Object.prototype keys rejected as field names", () => {
    it("rejects params field: toString as UNKNOWN_INPUT_FIELD instead of writing data.toString", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "proto key field",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "a cute cat" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [{ field: "text", value: "@s1" }],
                        params: [{ field: "toString", value: "oops" }],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toContainEqual({
            code: "UNKNOWN_INPUT_FIELD",
            stepId: "s2",
            slot: "image-gen",
            message: '"toString" is not a config field of image-gen',
        });
        const gen = byType(result.nodes).textGenImageNode[0];
        expect(
            Object.hasOwn(gen.data as Record<string, unknown>, "toString"),
        ).toBe(false);
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

// --- Widened handles: compose-overlay's `media` accepts image OR video
// (`alsoAccepts`). The compiler used to compare the primary nodeType only, so a
// perfectly legal video plan was rejected with a bogus MODALITY_MISMATCH — the
// exact failure safe-slots.ts claims is structurally gone. ---

describe("compilePlan — widened handle accepts more than its primary modality", () => {
    const OVERLAY_PLUGINS = {
        ...DEMO_PLUGINS,
        "compose-overlay": "oneflow-modal-compose-overlay",
    };

    function planWithMedia(mediaStep: DirectorPlan["steps"][number]) {
        return {
            dslVersion: 1 as const,
            name: "overlay",
            description: "",
            steps: [
                { id: "s1", kind: "text" as const, text: "a cute cat" },
                mediaStep,
                {
                    id: "s3",
                    kind: "gen" as const,
                    slot: "compose-overlay" as NodeSlot,
                    inputs: [{ field: "media", value: "@s2" }],
                    params: [],
                },
            ],
        };
    }

    it("accepts a video upstream on media", () => {
        // text -> image-gen (image) -> image-gen-video (video) -> overlay.media
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "overlay",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "a cute cat" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "image-gen" as NodeSlot,
                        inputs: [{ field: "text", value: "@s1" }],
                        params: [],
                    },
                    {
                        id: "s3",
                        kind: "gen",
                        slot: "image-gen-video" as NodeSlot,
                        inputs: [{ field: "image", value: "@s2" }],
                        params: [],
                    },
                    {
                        id: "s4",
                        kind: "gen",
                        slot: "compose-overlay" as NodeSlot,
                        inputs: [{ field: "media", value: "@s3" }],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: OVERLAY_PLUGINS, idFn: seqId() },
        );
        expect(
            result.issues.filter((i) => i.code === "MODALITY_MISMATCH"),
        ).toEqual([]);
    });

    it("accepts an image upstream on media", () => {
        const result = compilePlan(
            planWithMedia({
                id: "s2",
                kind: "gen",
                slot: "image-gen" as NodeSlot,
                inputs: [{ field: "text", value: "@s1" }],
                params: [],
            }),
            { slotDefaultPlugin: OVERLAY_PLUGINS, idFn: seqId() },
        );
        expect(
            result.issues.filter((i) => i.code === "MODALITY_MISMATCH"),
        ).toEqual([]);
    });

    it("still rejects an upstream modality the handle does not accept", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "overlay",
                description: "",
                steps: [
                    { id: "s1", kind: "text", text: "hello" },
                    {
                        id: "s2",
                        kind: "gen",
                        slot: "compose-overlay" as NodeSlot,
                        inputs: [{ field: "media", value: "@s1" }],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: OVERLAY_PLUGINS, idFn: seqId() },
        );
        expect(result.issues.some((i) => i.code === "MODALITY_MISMATCH")).toBe(
            true,
        );
    });
});
