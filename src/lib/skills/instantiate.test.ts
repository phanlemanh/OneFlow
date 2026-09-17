import { describe, expect, it } from "vitest";
import { SKILLS } from "./catalog";
import { instantiate } from "./instantiate";
import { exportGraph, normalizeExecutable } from "./test-support/export-graph";

const pluginsFor = (slots: string[]) =>
    Object.fromEntries(slots.map((s) => [s, `oneflow-api-fake-${s}`]));

describe("instantiate (AC-3)", () => {
    for (const def of SKILLS) {
        const id = def.manifest.id;
        it(`${id}: template unchanged, values in both places, plugins rebound, exporter-equivalent`, () => {
            const before = JSON.stringify(def.template);
            const r = instantiate(
                def,
                def.sampleParams,
                pluginsFor(def.manifest.requires),
            );
            expect(r.ok).toBe(true);
            if (!r.ok) return;
            expect(JSON.stringify(def.template), `${id} template mutated`).toBe(
                before,
            );
            const { executable, originalFlow } = r.instance;
            for (const p of def.manifest.params) {
                const v = def.sampleParams[p.key];
                if (v === undefined) continue;
                if (p.target.kind === "config") {
                    const t = p.target;
                    const exec = executable.executableNodes.find(
                        (n) => n.id === t.nodeId,
                    );
                    expect(
                        exec?.bindings[t.field],
                        `${id}.${p.key} executable`,
                    ).toEqual({ kind: "config", value: v });
                    const node = originalFlow.nodes.find(
                        (n) => n.id === t.nodeId,
                    );
                    expect(
                        ((node?.data ?? {}) as Record<string, unknown>)[
                            t.field
                        ],
                        `${id}.${p.key} canvas`,
                    ).toEqual(v);
                } else {
                    const t = p.target;
                    const nodeId = def.template.executable.inputs.find(
                        (i) => i.name === t.name,
                    )?.nodeId;
                    const dn = executable.dataNodes.find(
                        (n) => n.id === nodeId,
                    );
                    expect(
                        dn?.staticData?.fileKeys,
                        `${id}.${p.key} executable`,
                    ).toEqual([(v as { fileKey: string }).fileKey]);
                    const node = originalFlow.nodes.find(
                        (n) => n.id === nodeId,
                    );
                    expect(
                        ((node?.data ?? {}) as Record<string, unknown>)
                            .fileKeys,
                        `${id}.${p.key} canvas`,
                    ).toEqual([(v as { fileKey: string }).fileKey]);
                }
            }
            for (const n of executable.executableNodes) {
                expect(n.pluginId, `${id}.${n.id} plugin`).toBe(
                    `oneflow-api-fake-${n.feature}`,
                );
            }
            const re = exportGraph(
                originalFlow.nodes,
                originalFlow.edges,
                executable.name,
            );
            expect(
                normalizeExecutable(re),
                `${id} canvas != executable`,
            ).toEqual(normalizeExecutable(executable));
        });
        it(`${id}: missing plugin names the slot`, () => {
            const r = instantiate(def, def.sampleParams, {});
            expect(r).toEqual({
                ok: false,
                missingSlots: [...def.manifest.requires].sort(),
            });
        });
    }
});
