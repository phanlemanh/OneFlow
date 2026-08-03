/**
 * Guard: `NODE_TYPE_SOURCE_SPEC` is the *only* declaration site for per-field
 * source overrides.
 *
 * A spec declared inside a node component — as an inline `sourceSpec={{ ... }}`
 * JSX prop or a module-level literal built from the `@/lib/abi/sources` DSL —
 * is invisible to every consumer that runs before (or without) the component
 * mounting: `resolveEdgeHandles` at graph-mutation time, the workflow exporter,
 * and any server-side reader. That invisibility is what made new edges resolve
 * to the wrong modality (e.g. a `videoNode` feeding `subtitle_remove` landed on
 * an `imageNode`-typed handle) and silently dropped array-ness from `batchOn`
 * fields. These tests fail the build if such a declaration reappears.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
    NODE_TYPE_SOURCE_SPEC,
    NODE_TYPE_TO_ABI_FEATURE,
    resolveEdgeHandles,
    resolvedSpecForNodeType,
} from "./node-feature-registry";

const NODES_DIR = "src/components/workspace/nodes";

/**
 * Shared shells legitimately reference the `SourceSpec` *type* and thread the
 * prop through; they never declare a spec.
 */
const SHELL_DIR = "base";

function nodeComponentFiles(dir = NODES_DIR): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === SHELL_DIR) continue;
            out.push(...nodeComponentFiles(path));
        } else if (entry.name.endsWith(".tsx")) {
            out.push(path);
        }
    }
    return out;
}

const FILES = nodeComponentFiles().map((path) => ({
    path,
    src: readFileSync(path, "utf8"),
}));

describe("NODE_TYPE_SOURCE_SPEC is the single declaration site", () => {
    it("finds node component files to scan", () => {
        // Guards against the scan silently passing because it found nothing.
        expect(FILES.length).toBeGreaterThan(40);
    });

    it("no component declares an inline `sourceSpec={{ ... }}` prop", () => {
        const offenders = FILES.filter(({ src }) =>
            src.includes("sourceSpec={{"),
        ).map(({ path }) => path);
        expect(offenders).toEqual([]);
    });

    it("no component imports the source-override DSL", () => {
        // `batchOn` / `collectAll` / `handle` / `configField` / `staticValue` /
        // `workflowInput` build overrides — importing one means declaring a spec
        // locally. Type-only imports of `SourceSpec` are fine and stay in base/.
        const offenders = FILES.filter(({ src }) =>
            /^import \{[^}]*\} from "@\/lib\/abi\/sources";$/m.test(src),
        ).map(({ path }) => path);
        expect(offenders).toEqual([]);
    });

    it("every `sourceSpec=` prop reads from the registry", () => {
        const offenders: string[] = [];
        for (const { path, src } of FILES) {
            for (const [, value] of src.matchAll(/sourceSpec=\{([^}]*)\}/g)) {
                if (
                    !/NODE_TYPE_SOURCE_SPEC|_SOURCE_SPEC|sourceSpec$/.test(
                        value.trim(),
                    )
                ) {
                    offenders.push(`${path}: sourceSpec={${value.trim()}}`);
                }
            }
        }
        expect(offenders).toEqual([]);
    });
});

describe("registry integrity", () => {
    it("every spec key is a known ABI node type", () => {
        const known = new Set(Object.keys(NODE_TYPE_TO_ABI_FEATURE));
        const unknown = Object.keys(NODE_TYPE_SOURCE_SPEC).filter(
            (nodeType) => !known.has(nodeType),
        );
        expect(unknown).toEqual([]);
    });

    it("every spec resolves against its own ABI slot", () => {
        for (const nodeType of Object.keys(NODE_TYPE_SOURCE_SPEC)) {
            const resolved = resolvedSpecForNodeType(nodeType);
            expect(resolved, nodeType).toBeDefined();
            // Every declared field must exist in the slot's ABI topology.
            const declared = Object.keys(
                (NODE_TYPE_SOURCE_SPEC as Record<string, object>)[nodeType],
            );
            for (const field of declared) {
                expect(
                    resolved?.topology.inputs[field],
                    `${nodeType}.${field}`,
                ).toBeDefined();
            }
        }
    });

    it("at most one batch field per node type", () => {
        // `resolveSpec` only tracks a single `batchField`; two `batchOn` fields
        // on one node would silently drop one.
        for (const nodeType of Object.keys(NODE_TYPE_SOURCE_SPEC)) {
            const spec = (
                NODE_TYPE_SOURCE_SPEC as Record<
                    string,
                    Record<string, { kind: string; batch?: boolean }>
                >
            )[nodeType];
            const batched = Object.entries(spec).filter(
                ([, f]) => f.kind === "handle" && f.batch,
            );
            expect(
                batched.length,
                `${nodeType}: ${batched.map(([k]) => k)}`,
            ).toBeLessThanOrEqual(1);
        }
    });
});

describe("resolveEdgeHandles — multi-modality handles (alsoAccepts)", () => {
    /**
     * A handle that accepts more than its primary nodeType must be matched by
     * edge creation too, not only by the connection validator: an edge built
     * without a `targetHandle` looks connected on the canvas but never delivers
     * a value, so the node stays unexecutable with no error shown.
     */
    const overlaySpec = resolvedSpecForNodeType("composeOverlayNode");

    it("routes a videoNode source to in:media (spec path)", () => {
        expect(
            resolveEdgeHandles({
                sourceType: "videoNode",
                targetType: "composeOverlayNode",
                targetSpec: overlaySpec,
            }),
        ).toEqual({ sourceHandle: "out:videoNode", targetHandle: "in:media" });
    });

    it("routes a videoNode source to in:media (topology path, no spec)", () => {
        expect(
            resolveEdgeHandles({
                sourceType: "videoNode",
                targetType: "composeOverlayNode",
            }),
        ).toEqual({ sourceHandle: "out:videoNode", targetHandle: "in:media" });
    });

    it("still routes an imageNode source to in:media", () => {
        expect(
            resolveEdgeHandles({
                sourceType: "imageNode",
                targetType: "composeOverlayNode",
                targetSpec: overlaySpec,
            }).targetHandle,
        ).toBe("in:media");
    });

    it("does not route an audioNode source anywhere on compose-overlay", () => {
        expect(
            resolveEdgeHandles({
                sourceType: "audioNode",
                targetType: "composeOverlayNode",
                targetSpec: overlaySpec,
            }).targetHandle,
        ).toBeUndefined();
    });
});
