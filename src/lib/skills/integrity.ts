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
        const ok =
            p.target.kind === "input"
                ? wf.inputs.some(
                      (i) => i.name === (p.target as { name: string }).name,
                  )
                : wf.executableNodes.some(
                      (n) => n.id === (p.target as { nodeId: string }).nodeId,
                  );
        if (!ok) out.push({ rule: "param-target-exists", detail: p.key });
    }
    for (const o of manifest.outputs) {
        if (!wf.outputs.some((w) => w.name === o.from))
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
