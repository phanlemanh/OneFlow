/**
 * Regenerate `public/example.json` from a canvas captured out of the app.
 *
 * The bundled example is NOT hand-authored: its shape (`bindings`,
 * `outputs[].itemValuePath`, `executionLevels`) comes from
 * `src/lib/workflow/exporter.ts` reading the ABI mount registry, so a
 * hand-written copy drifts the moment the ABI or the exporter changes. This
 * script drives that same exporter.
 *
 * The exporter looks each node up by `getNodeSpec(node.id)`, which reads the
 * registry that `AbiNodeShell` fills WHEN A NODE MOUNTS — so a headless run
 * finds an empty registry and silently skips every executable node. We
 * therefore register each captured node from the same two tables the
 * components use (`NODE_TYPE_TO_ABI_FEATURE`, `NODE_TYPE_SOURCE_SPEC`)
 * before exporting. Same specs, same resolveSpec path, no second source of
 * truth.
 *
 * Two rewrites happen first, both required for the file to work on a machine
 * that has never uploaded anything:
 *
 *  1. The input clip is re-pointed at the fixed key the boot seed writes
 *     (`seed-example-asset.server.ts`). A capture carries whatever nanoid the
 *     upload minted, which exists only on the machine that recorded it.
 *  2. Task outputs are dropped. A capture taken AFTER a run holds
 *     `tasks/<id>/...` keys for results the user has not produced yet;
 *     shipping them would show a finished workflow on first open, and the
 *     user would never press Run — the one thing the example exists to
 *     provoke.
 *
 * Usage:
 *   pnpm tsx scripts/onboarding/build-example-json.ts <nodes.json> <edges.json>
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Edge, Node } from "@xyflow/react";
import type { NodeSlot } from "@/generated/abi";
import {
    NODE_TYPE_SOURCE_SPEC,
    NODE_TYPE_TO_ABI_FEATURE,
} from "@/lib/abi/node-feature-registry";
import { registerAbiNode } from "@/lib/abi/node-registry";
import type { AnySourceSpec } from "@/lib/abi/sources";
import { exportWorkflow } from "@/lib/workflow/exporter";

/** Keep in sync with EXAMPLE_VIDEO_FILE_KEY in seed-example-asset.server.ts. */
const EXAMPLE_VIDEO_FILE_KEY = "example-assets/two-scenes.mp4";

const NAME = "Ví dụ / example";
const DESCRIPTION =
    "Tách cảnh rồi ghép lại — chạy hoàn toàn trên máy bạn, không cần khoá.";

type NodeData = Record<string, unknown> & {
    fileKeys?: string[];
    prompt?: Record<string, unknown>;
};

type FeatureTable = Record<string, NodeSlot | undefined>;
type SpecTable = Record<string, AnySourceSpec | undefined>;

/** True for a key produced by a run rather than shipped with the repo. */
function isTaskOutput(fileKey: string): boolean {
    return fileKey.startsWith("tasks/");
}

function rewrite(nodes: Node[]): Node[] {
    // The uploaded input is the only non-task key in a post-run capture.
    const uploadedInput = nodes
        .flatMap((n) => (n.data as NodeData).fileKeys ?? [])
        .find((k) => !isTaskOutput(k));

    return nodes.map((node) => {
        const data = node.data as NodeData;
        const next: NodeData = { ...data };

        if (Array.isArray(data.fileKeys)) {
            next.fileKeys = data.fileKeys
                .filter((k) => !isTaskOutput(k))
                .map((k) => (k === uploadedInput ? EXAMPLE_VIDEO_FILE_KEY : k));
        }

        // `prompt` mirrors the resolved inputs; the substitution has to reach
        // it too or the export ships a dead pointer in the half nobody reads.
        if (data.prompt) {
            const prompt: Record<string, unknown> = { ...data.prompt };
            for (const [field, value] of Object.entries(prompt)) {
                if (value === uploadedInput) {
                    prompt[field] = EXAMPLE_VIDEO_FILE_KEY;
                } else if (Array.isArray(value)) {
                    prompt[field] = value.filter(
                        (v) => !(typeof v === "string" && isTaskOutput(v)),
                    );
                }
            }
            next.prompt = prompt;
        }

        return { ...node, data: next, selected: false, dragging: false };
    });
}

/** Stand in for the mount-time registration `AbiNodeShell` performs. */
function registerAll(nodes: Node[]): number {
    const features = NODE_TYPE_TO_ABI_FEATURE as FeatureTable;
    const specs = NODE_TYPE_SOURCE_SPEC as SpecTable;
    let registered = 0;

    for (const node of nodes) {
        const type = node.type ?? "";
        const feature = features[type];
        const sourceSpec = specs[type];
        if (!feature || !sourceSpec) continue;
        registerAbiNode({ nodeId: node.id, feature, sourceSpec });
        registered += 1;
    }
    return registered;
}

function main(): void {
    const [nodesPath, edgesPath] = process.argv.slice(2);
    if (!nodesPath || !edgesPath) {
        throw new Error(
            "usage: build-example-json.ts <nodes.json> <edges.json>",
        );
    }

    const nodes = rewrite(
        JSON.parse(readFileSync(nodesPath, "utf8")) as Node[],
    );
    const edges = JSON.parse(readFileSync(edgesPath, "utf8")) as Edge[];

    const registered = registerAll(nodes);

    const workflow = exportWorkflow(nodes, edges, {
        name: NAME,
        description: DESCRIPTION,
        // `workspace.tsx` seeds a first run by parsing `originalFlow` back
        // into nodes and edges, so omitting it ships an unopenable example.
        includeOriginalFlow: true,
    });

    const executable = workflow.executableNodes?.length ?? 0;
    if (registered === 0 || executable === 0) {
        // Fail loudly: the old failure mode was a green run that wrote a file
        // with zero executable nodes, which looks like a valid export.
        throw new Error(
            `refusing to write: registered=${registered}, executableNodes=${executable}`,
        );
    }

    const out = path.resolve(process.cwd(), "public/example.json");
    writeFileSync(out, `${JSON.stringify(workflow, null, 4)}\n`);
    // Hand off to biome rather than trying to match it: it collapses short
    // arrays onto one line, which JSON.stringify cannot reproduce at any
    // indent setting. Without this the file is written and `lint:check`
    // immediately fails on it.
    execFileSync("pnpm", ["exec", "biome", "format", "--write", out], {
        stdio: "ignore",
    });
    process.stdout.write(
        `wrote ${out} (${executable} executable nodes from ${registered} registrations)\n`,
    );
}

main();
