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

type Spec = { id: string; feature: string; deps?: string[] };

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
            data: { pluginId: "test-plugin" },
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

describe("violation", () => {
    it.each(TTS_SLOTS)("blocks %s when no reader sits upstream", (slot) => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            { id: "b", feature: slot, deps: ["a"] },
        ]);

        expect(() => exportWorkflow(nodes, edges, { name: "x" })).toThrow(
            new RegExp(`${WORKFLOW_TTS_NEEDS_NORMALIZE}[\\s\\S]*\\bb\\b`),
        );
    });

    it("names every offending node, not just the first", () => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            { id: "b", feature: "text-gen-speech-preset", deps: ["a"] },
            { id: "c", feature: "text-gen-speech-clone", deps: ["a"] },
        ]);

        expect(() => exportWorkflow(nodes, edges, { name: "x" })).toThrow(
            /\bb\b[\s\S]*\bc\b|\bc\b[\s\S]*\bb\b/,
        );
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
        // also "not throw", and would prove nothing at all.
        expect(workflow.executableNodes.map((n) => n.feature)).toContain(
            "normalize-text-vi",
        );
        expect(workflow.executableNodes).toHaveLength(3);
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

        expect(() => exportWorkflow(nodes, edges, { name: "x" })).not.toThrow();
    });

    it.each(MUSIC_SLOTS)("leaves the music slot %s alone", (slot) => {
        const { nodes, edges } = buildChain([
            { id: "a", feature: "gen-text" },
            { id: "b", feature: slot, deps: ["a"] },
        ]);

        const workflow = exportWorkflow(nodes, edges, { name: "x" });
        expect(workflow.executableNodes).toHaveLength(2);
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
