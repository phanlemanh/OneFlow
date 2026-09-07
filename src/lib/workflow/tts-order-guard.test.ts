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

import { LANGUAGES } from "@/components/workspace/nodes/base/language-select";
import { DEFAULT_QWEN_SPEAKER, QWEN_SPEAKERS } from "@/constants/qwen-speakers";
import { ABI_NODES } from "@/generated/abi";
import {
    NODE_TYPE_SOURCE_SPEC,
    NODE_TYPE_TO_ABI_FEATURE,
} from "@/lib/abi/node-feature-registry";
import { registerAbiNode, unregisterAbiNode } from "@/lib/abi/node-registry";

import {
    exportWorkflow,
    MUSIC_SLOTS,
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

// The warning is UNCONDITIONAL. Two attempts to scope it by language were
// reverted (S4 rounds 7-9) because the product has no way for a user to declare
// Vietnamese, so every default value a filter can see reads as "some other
// language" — "Auto" on clone most sharply, which means "detect from the text".
//
// These tests draw their values from the SHIPPED catalogs rather than from
// literals. That is the whole lesson: both reverted attempts kept a green suite
// while failing open, because the tests fed in language strings by hand and
// never used the ones a user can actually pick.
describe("language scope", () => {
    const CATALOG = LANGUAGES.map((l) => l.value);

    it.each(
        TTS_SLOTS.flatMap((slot) =>
            CATALOG.map((language) => [slot, language]),
        ),
    )("warns on %s even when the voice is declared %s", (slot, language) => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            {
                id: "b",
                feature: slot as string,
                deps: ["a"],
                data: { language },
            },
        ]);

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.warnings).toEqual([
            { code: WORKFLOW_TTS_NEEDS_NORMALIZE, nodeIds: ["b"] },
        ]);
    });

    it("has no Vietnamese option to scope on — the reason the scoping was reverted", () => {
        // Both halves of the reason, asserted so they cannot rot silently. The
        // day either changes, this goes red and the scoping question reopens
        // deliberately instead of someone re-deriving it from scratch.
        expect(CATALOG.some((v) => /viet/i.test(v))).toBe(false);
        expect(QWEN_SPEAKERS.some((sp) => /viet/i.test(sp.language))).toBe(
            false,
        );
        expect(/viet/i.test(DEFAULT_QWEN_SPEAKER.language)).toBe(false);
        // "Auto" is in the catalog and means "detect from the text" — the value
        // that made the second attempt fail open on its own target workflow.
        expect(CATALOG).toContain("Auto");
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

    it("registers the reader itself as an ABI node type", () => {
        expect(NODE_TYPE_TO_ABI_FEATURE.normalizeTextViNode).toBe(
            "normalize-text-vi",
        );
    });
});
