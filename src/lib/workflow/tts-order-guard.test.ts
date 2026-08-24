/**
 * E10a / E10b / E10c — "normalize-text-vi must precede TTS" (AC-10).
 *
 * Three describes, named so the eval keys can select them: `violation`,
 * `compliant`, `two-way`.
 *
 * Every case registers its nodes in the ABI mount registry first. Without that
 * the exporter emits ZERO executable nodes, the guard has nothing to inspect,
 * and every assertion here would pass while proving nothing — the failure mode
 * this repo has already recorded once for headless exports.
 */

import type { Edge, Node } from "@xyflow/react";
import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_QWEN_SPEAKER, QWEN_SPEAKERS } from "@/constants/qwen-speakers";
import { ABI_NODES } from "@/generated/abi";
import {
    NODE_TYPE_SOURCE_SPEC,
    NODE_TYPE_TO_ABI_FEATURE,
} from "@/lib/abi/node-feature-registry";
import { registerAbiNode, unregisterAbiNode } from "@/lib/abi/node-registry";

import {
    exportWorkflow,
    LANGUAGE_AWARE_TTS_SLOTS,
    MUSIC_SLOTS,
    SPEAKER_DERIVED_LANGUAGE_SLOTS,
    TTS_SLOTS,
    WORKFLOW_TTS_NEEDS_NORMALIZE,
} from "./exporter";

type Spec = {
    id: string;
    feature: string;
    deps?: string[];
    /** Canvas config for the node, e.g. the TTS `language` picker. */
    data?: Record<string, unknown>;
};

const registered: string[] = [];

/**
 * Build a chain of ABI nodes and register each one, mirroring what
 * `useAbiExecution` does at mount time.
 */
function buildChain(specs: Spec[]): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [
        {
            id: "src",
            type: "textNode",
            position: { x: 0, y: 0 },
            data: { texts: ["Giá 1.999.000₫"] },
        },
    ];
    const edges: Edge[] = [];

    specs.forEach((spec, index) => {
        // Every slot under test takes `text` and is mounted as a generic ABI
        // node; the node TYPE does not matter to the guard, the FEATURE does.
        nodes.push({
            id: spec.id,
            type: "genTextNode",
            position: { x: 200 * (index + 1), y: 0 },
            data: { pluginId: "test-plugin", ...spec.data },
        });
        registerAbiNode({
            nodeId: spec.id,
            feature: spec.feature as never,
            // Every feature under test takes a scalar `text`; reuse the spec
            // the registry already declares instead of rebuilding one here.
            sourceSpec: NODE_TYPE_SOURCE_SPEC.genTextNode,
        });
        registered.push(spec.id);

        const upstream = spec.deps?.length ? spec.deps : ["src"];
        upstream.forEach((from) => {
            edges.push({
                id: `e-${from}-${spec.id}`,
                source: from,
                sourceHandle: from === "src" ? "out:textNode" : "out:text",
                target: spec.id,
                targetHandle: "in:text",
            });
        });
    });

    return { nodes, edges };
}

afterEach(() => {
    while (registered.length) unregisterAbiNode(registered.pop() as string);
});

// The warning is Vietnamese-specific: the slot it asks for reads VIETNAMESE
// numbers. Until round 7 it fired on every TTS node in every workflow, so a
// user building an English, Chinese, Japanese or Korean voice-over was told —
// on save, on save-and-execute and on export, with no way to dismiss it — to
// insert a Vietnamese number reader (S4 round 7 finding).
//
// Narrowed to "not declared as some OTHER language" rather than "declared as
// Vietnamese": `language` is optional on three of the four slots and absent
// from `text-audio-gen-speech` entirely, so an unset value means UNKNOWN, and
// the warning must survive not knowing. Suppressing it on unknown would quietly
// drop the protection for the majority of Vietnamese workflows, which never
// touch the picker.
describe("language scope", () => {
    it.each([
        ["en", "English"],
        ["en-US", "English (US)"],
        ["zh", "Chinese"],
        ["ja", "Japanese"],
        ["ko", "Korean"],
    ])("stays silent when the voice is declared %s", (language) => {
        // `text-gen-speech-clone`, not the preset slot: on clone the language is
        // typed by the user, so it is evidence. On preset it is filled from the
        // speaker on mount — see SPEAKER_DERIVED_LANGUAGE_SLOTS.
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            {
                id: "b",
                feature: "text-gen-speech-clone",
                deps: ["a"],
                data: { language },
            },
        ]);

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.warnings).toEqual([]);
    });

    it.each(["vi", "vi-VN", "Vietnamese", "VI"])(
        "still warns when the voice is declared %s",
        (language) => {
            const { nodes, edges } = buildChain([
                { id: "a", feature: "gen-text" },
                {
                    id: "b",
                    feature: "text-gen-speech-clone",
                    deps: ["a"],
                    data: { language },
                },
            ]);

            const workflow = exportWorkflow(nodes, edges, { name: "x" });
            expect(workflow.warnings).toEqual([
                { code: WORKFLOW_TTS_NEEDS_NORMALIZE, nodeIds: ["b"] },
            ]);
        },
    );

    // The mount-time default, which is what every preset node on a real canvas
    // actually carries. `text-gen-speech-preset` writes
    // `language = DEFAULT_QWEN_SPEAKER.language` on first mount, and that
    // default is "Chinese" — so narrowing on a declared language switched the
    // warning OFF for the whole slot, with the user never having chosen
    // anything (S4 round 8 finding; the round-7 narrowing was signed on an ABI
    // reading that never checked what value actually flows in).
    it("still warns on a preset node carrying its mount-time default", () => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            {
                id: "b",
                feature: "text-gen-speech-preset",
                deps: ["a"],
                data: { language: DEFAULT_QWEN_SPEAKER.language },
            },
        ]);

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.warnings).toEqual([
            { code: WORKFLOW_TTS_NEEDS_NORMALIZE, nodeIds: ["b"] },
        ]);
    });

    // ...and the same for a speaker the user DID pick, because on this slot the
    // language is derived from the speaker rather than typed: the picker offers
    // no Vietnamese voice at all, so "declared Chinese" carries no information
    // about whether the text being read is Vietnamese.
    it("still warns on a preset node whose speaker language was picked", () => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            {
                id: "b",
                feature: "text-gen-speech-preset",
                deps: ["a"],
                data: { speaker: "Ryan", language: "English" },
            },
        ]);

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.warnings).toEqual([
            { code: WORKFLOW_TTS_NEEDS_NORMALIZE, nodeIds: ["b"] },
        ]);
    });

    it("still warns when the language is not declared at all", () => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            { id: "b", feature: "text-gen-speech-clone", deps: ["a"] },
        ]);

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.warnings).toEqual([
            { code: WORKFLOW_TTS_NEEDS_NORMALIZE, nodeIds: ["b"] },
        ]);
    });

    it("still warns on the slot that has no language field at all", () => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            {
                id: "b",
                feature: "text-audio-gen-speech",
                deps: ["a"],
                data: { language: "en" },
            },
        ]);

        // `text-audio-gen-speech` declares no `language` input, so a value
        // sitting in canvas data is not a declaration the ABI recognises —
        // treat it as unknown and keep warning.
        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.warnings).toEqual([
            { code: WORKFLOW_TTS_NEEDS_NORMALIZE, nodeIds: ["b"] },
        ]);
    });
});

describe("violation", () => {
    // A WARNING, not a throw: the reader node is unreachable from any picker
    // today, so a hard block retroactively bricked every saved TTS workflow —
    // owner decision 2026-08-20 (ledger d-20260820T091500Z-9098). The export
    // must still SUCCEED, carrying a machine-readable warning the UI renders.
    it.each(TTS_SLOTS)("warns on %s when no reader sits upstream", (slot) => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            { id: "b", feature: slot, deps: ["a"] },
        ]);

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.executableNodes).toHaveLength(2);
        expect(workflow.warnings).toEqual([
            { code: WORKFLOW_TTS_NEEDS_NORMALIZE, nodeIds: ["b"] },
        ]);
    });

    it("names every offending node, not just the first", () => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            { id: "b", feature: "text-gen-speech-preset", deps: ["a"] },
            { id: "c", feature: "text-gen-speech-clone", deps: ["a"] },
        ]);

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.warnings).toHaveLength(1);
        expect([...(workflow.warnings?.[0]?.nodeIds ?? [])].sort()).toEqual([
            "b",
            "c",
        ]);
    });
});

describe("compliant", () => {
    it("allows the reader two nodes upstream", () => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "normalize-text-vi" },
            { id: "m", feature: "combine-text", deps: ["a"] },
            { id: "b", feature: "text-gen-speech-preset", deps: ["m"] },
        ]);

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        // Proves the graph really reached the guard: a zero-node export would
        // also carry no warnings, and would prove nothing at all.
        expect(workflow.executableNodes.map((n) => n.feature)).toContain(
            "normalize-text-vi",
        );
        expect(workflow.executableNodes).toHaveLength(3);
        expect(workflow.warnings).toEqual([]);
    });

    it("allows the reader through a DATA node — the canonical canvas shape", () => {
        // An ABI node's output always lands in a data node before reaching the
        // next ABI node, so `normalize → textNode → TTS` is what the canvas
        // actually produces. The first version of this guard walked
        // `ExecutableNode.dependencies` and resolved ids against executable
        // nodes only, so it stopped dead at the data node and rejected exactly
        // this chain. Every other case in this file chains executable nodes
        // directly — which is why they all passed while the real shape broke.
        const { nodes, edges } = buildChain([
            { id: "a", feature: "normalize-text-vi" },
        ]);
        nodes.push({
            id: "mid",
            type: "textNode",
            position: { x: 400, y: 0 },
            data: { texts: [] },
        });
        nodes.push({
            id: "b",
            type: "genTextNode",
            position: { x: 600, y: 0 },
            data: { pluginId: "test-plugin" },
        });
        registerAbiNode({
            nodeId: "b",
            feature: "text-gen-speech-preset" as never,
            sourceSpec: NODE_TYPE_SOURCE_SPEC.genTextNode,
        });
        registered.push("b");
        edges.push({
            id: "e-a-mid",
            source: "a",
            sourceHandle: "out:text",
            target: "mid",
            targetHandle: "in:textNode",
        });
        edges.push({
            id: "e-mid-b",
            source: "mid",
            sourceHandle: "out:textNode",
            target: "b",
            targetHandle: "in:text",
        });

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.executableNodes.map((n) => n.feature).sort()).toEqual([
            "normalize-text-vi",
            "text-gen-speech-preset",
        ]);
        expect(workflow.warnings).toEqual([]);
    });

    it.each(MUSIC_SLOTS)("leaves the music slot %s alone", (slot) => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            { id: "b", feature: slot, deps: ["a"] },
        ]);

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.executableNodes).toHaveLength(2);
        expect(workflow.warnings).toEqual([]);
    });
});

describe("two-way", () => {
    it("keeps the speech allowlist in step with the ABI", () => {
        // Derived from the ABI by the criterion written in the design (§5):
        // a slot that takes `text` and returns `audio`, minus the music slots
        // whose `text` is a prompt rather than words to read.
        const derived = Object.entries(ABI_NODES)
            .filter(([slot, node]) => {
                const inputs =
                    (node.inputs as { properties?: Record<string, unknown> })
                        .properties ?? {};
                const outputs =
                    (node.outputs as { properties?: Record<string, unknown> })
                        .properties ?? {};
                return (
                    "text" in inputs &&
                    "audio" in outputs &&
                    !MUSIC_SLOTS.includes(slot as never)
                );
            })
            .map(([slot]) => slot);

        expect([...TTS_SLOTS].sort()).toEqual(derived.sort());
    });

    it("keeps the language-aware speech list in step with the ABI", () => {
        // The narrowing above is only safe if this list is exactly the speech
        // slots that actually declare `language`. Hand-maintained, it would rot
        // the day a slot gains or loses the field — and the failure would be
        // silent in the SAFE-looking direction for a gained field (a declared
        // English voice would keep being warned at) and in the UNSAFE direction
        // for a lost one.
        const declaresLanguage = TTS_SLOTS.filter((slot) => {
            const node = ABI_NODES[slot as keyof typeof ABI_NODES];
            const inputs =
                (node.inputs as { properties?: Record<string, unknown> })
                    .properties ?? {};
            return "language" in inputs;
        });

        // Declaring the field is necessary but NOT sufficient: a slot that
        // fills it from a preset speaker is excluded, because the value is not
        // the user's answer to "what language is this".
        const derived = declaresLanguage.filter(
            (slot) => !SPEAKER_DERIVED_LANGUAGE_SLOTS.includes(slot),
        );

        expect([...LANGUAGE_AWARE_TTS_SLOTS].sort()).toEqual(
            [...derived].sort(),
        );
        // An exclusion naming a slot that does NOT declare the field would be
        // dead weight hiding a real gap.
        for (const slot of SPEAKER_DERIVED_LANGUAGE_SLOTS) {
            expect(declaresLanguage).toContain(slot);
        }
    });

    it("keeps the reason for excluding the preset slot measurable", () => {
        // The exclusion rests on two facts about the preset speaker catalog,
        // both of which could change without anyone touching the exporter.
        // Written as assertions so the day either changes this goes red and the
        // narrowing gets revisited — instead of the reason quietly rotting
        // inside a comment.
        expect(QWEN_SPEAKERS.some((sp) => /viet/i.test(sp.language))).toBe(
            false,
        );
        expect(/viet/i.test(DEFAULT_QWEN_SPEAKER.language)).toBe(false);
    });

    it("registers the reader itself as an ABI node type", () => {
        expect(NODE_TYPE_TO_ABI_FEATURE.normalizeTextViNode).toBe(
            "normalize-text-vi",
        );
    });
});
