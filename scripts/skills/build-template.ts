/**
 * Build a skill's template.json from its graph with the REAL exporter.
 *
 * Usage: pnpm skills:build <skill-id>
 *
 * template.json is never hand-written: both the canvas graph and the
 * executable come out of the same exporter the canvas uses, and the registry
 * integrity test (src/lib/skills/registry.test.ts) re-runs that exporter to
 * catch a template edited by hand afterwards.
 */
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Edge, Node } from "@xyflow/react";
import { exportGraph } from "../../src/lib/skills/test-support/export-graph";

async function main(): Promise<void> {
    const id = process.argv[2];
    if (!id) {
        console.error("usage: skills:build <skill-id>");
        process.exit(2);
    }
    // Derived from this script's location, never from the caller's cwd.
    const dir = path.join(__dirname, "..", "..", "src", "lib", "skills", id);
    const graphPath = path.join(dir, "graph.ts");
    if (!existsSync(graphPath)) {
        console.error(`[skills:build] no graph at ${graphPath}`);
        process.exit(2);
    }
    const graph = (await import(graphPath)) as { nodes: Node[]; edges: Edge[] };
    const executable = exportGraph(graph.nodes, graph.edges, id);
    const out = path.join(dir, "template.json");
    writeFileSync(
        out,
        `${JSON.stringify({ originalFlow: executable.originalFlow, executable }, null, 4)}\n`,
    );
    console.log(`[skills:build] wrote ${path.relative(process.cwd(), out)}`);
}

void main();
