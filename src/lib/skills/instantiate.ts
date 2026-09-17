import type { SkillDefinition, SkillParamValue, SkillTemplate } from "./types";

export type InstantiateResult =
    | { ok: true; instance: SkillTemplate }
    | { ok: false; missingSlots: string[] };

/**
 * Pure: clone the template and write every parameter into BOTH the executable
 * the engine runs and the canvas graph "view/edit plan" opens. The exporter
 * equivalence test (instantiate.test.ts) is what keeps the two writes honest.
 */
export function instantiate(
    def: SkillDefinition,
    params: Record<string, SkillParamValue>,
    slotDefaultPlugin: Partial<Record<string, string>>,
): InstantiateResult {
    const missingSlots = [...new Set(def.manifest.requires)]
        .filter((s) => !slotDefaultPlugin[s])
        .sort();
    if (missingSlots.length > 0) return { ok: false, missingSlots };

    const instance: SkillTemplate = structuredClone(def.template);
    const { executable } = instance;
    const nodeData = (id: string) => {
        const node = instance.originalFlow.nodes.find((n) => n.id === id);
        if (!node)
            throw new Error(`skill ${def.manifest.id}: no canvas node ${id}`);
        return node.data as Record<string, unknown>;
    };

    for (const p of def.manifest.params) {
        const value = params[p.key];
        if (value === undefined) continue;
        if (p.target.kind === "input") {
            const name = p.target.name;
            const input = executable.inputs.find((i) => i.name === name);
            if (!input)
                throw new Error(`skill ${def.manifest.id}: no input ${name}`);
            const fileKeys =
                typeof value === "object" ? [value.fileKey] : undefined;
            const texts =
                typeof value === "object" ? undefined : [String(value)];
            const dn = executable.dataNodes.find((n) => n.id === input.nodeId);
            if (dn) {
                dn.isInput = false;
                delete dn.inputName;
                dn.staticData = { fileKeys, texts };
            }
            executable.inputs = executable.inputs.filter(
                (i) => i.name !== name,
            );
            if (fileKeys) nodeData(input.nodeId).fileKeys = fileKeys;
            if (texts) nodeData(input.nodeId).texts = texts;
        } else {
            const { nodeId, field } = p.target;
            const exec = executable.executableNodes.find(
                (n) => n.id === nodeId,
            );
            if (!exec)
                throw new Error(`skill ${def.manifest.id}: no node ${nodeId}`);
            exec.bindings[field] = { kind: "config", value };
            if (exec.rawConfig) exec.rawConfig[field] = value;
            nodeData(nodeId)[field] = value;
        }
    }

    for (const exec of executable.executableNodes) {
        const pluginId = slotDefaultPlugin[exec.feature] as string;
        exec.pluginId = pluginId;
        if (exec.rawConfig) exec.rawConfig.pluginId = pluginId;
        nodeData(exec.id).pluginId = pluginId;
    }
    executable.originalFlow = instance.originalFlow;
    return { ok: true, instance };
}
