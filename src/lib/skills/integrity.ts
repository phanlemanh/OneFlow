import { ABI_NODES } from "@/generated/abi";
import { exportGraph, normalizeExecutable } from "./test-support/export-graph";
import type { SkillDefinition } from "./types";

export interface IntegrityViolation {
    rule: string;
    detail: string;
}

const SEMVER = /^\d+\.\d+\.\d+$/;

export function checkSkillIntegrity(
    dir: string,
    def: SkillDefinition,
): IntegrityViolation[] {
    const { manifest, template } = def;
    const out: IntegrityViolation[] = [];
    const wf = template.executable;
    if (manifest.id !== dir)
        out.push({
            rule: "id-matches-dir",
            detail: `${manifest.id} != ${dir}`,
        });
    if (!SEMVER.test(manifest.version))
        out.push({ rule: "version-semver", detail: manifest.version });
    const slots = [...new Set(wf.executableNodes.map((n) => n.feature))].sort();
    if (
        JSON.stringify([...manifest.requires].sort()) !== JSON.stringify(slots)
    ) {
        out.push({
            rule: "requires-equals-template-slots",
            detail: `${manifest.requires} vs ${slots}`,
        });
    }
    for (const p of manifest.params) {
        const target = p.target;
        let ok: boolean;
        if (target.kind === "input") {
            ok = wf.inputs.some((i) => i.name === target.name);
        } else {
            // A config target must name a node of the template AND an input
            // field that node's slot really declares in the ABI.
            const node = wf.executableNodes.find((n) => n.id === target.nodeId);
            const slot = node?.feature as keyof typeof ABI_NODES | undefined;
            const fields = slot
                ? Object.keys(ABI_NODES[slot]?.inputs?.properties ?? {})
                : [];
            ok = Boolean(node) && fields.includes(target.field);
        }
        if (!ok) out.push({ rule: "param-target-exists", detail: p.key });
    }
    for (const o of manifest.outputs) {
        const producer = wf.executableNodes.find((n) => n.id === o.from.nodeId);
        if (!producer?.outputs.some((r) => r.sourceField === o.from.field))
            out.push({ rule: "output-from-exists", detail: o.key });
    }
    const re = exportGraph(
        template.originalFlow.nodes,
        template.originalFlow.edges,
        wf.name,
    );
    if (
        JSON.stringify(normalizeExecutable(re)) !==
        JSON.stringify(normalizeExecutable(wf))
    ) {
        out.push({ rule: "template-matches-exporter", detail: dir });
    }
    return out;
}
