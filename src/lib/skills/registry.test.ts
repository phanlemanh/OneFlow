import { describe, expect, it } from "vitest";
import { ABI_NODES } from "@/generated/abi";
import { SKILLS } from "./catalog";
import { checkSkillIntegrity } from "./integrity";
import type { SkillDefinition, SkillParam } from "./types";

const clone = (d: SkillDefinition): SkillDefinition =>
    JSON.parse(JSON.stringify(d));

const BREAKS: Record<string, (d: SkillDefinition) => { dir?: string }> = {
    "id-matches-dir": () => ({ dir: "wrong-dir" }),
    "version-semver": (d) => {
        d.manifest.version = "1.0";
        return {};
    },
    "requires-equals-template-slots": (d) => {
        d.manifest.requires = [
            ...d.manifest.requires,
            "gen-text",
        ] as typeof d.manifest.requires;
        return {};
    },
    "output-from-exists": (d) => {
        d.manifest.outputs[0].from = {
            nodeId: d.manifest.outputs[0].from.nodeId,
            field: "nope",
        };
        return {};
    },
    "template-matches-exporter": (d) => {
        d.template.executable.executableNodes[0].pluginId = "drifted";
        return {};
    },
};

// The target class has three members; each gets its own break, and a probe
// with a REAL config field is the control that keeps the config check honest.
const TARGET_BREAKS = {
    input: { kind: "input", name: "input_nope" },
    "config-node": { kind: "config", nodeId: "node_nope", field: "threshold" },
    "config-field": { kind: "config", nodeId: "", field: "field_nope" },
} as const;

/** A template input field of the node that its binding says is fed by an edge. */
function handleField(d: SkillDefinition): { nodeId: string; field: string } {
    for (const n of d.template.executable.executableNodes) {
        const field = Object.entries(n.bindings).find(
            ([, b]) => b.kind === "handle",
        )?.[0];
        if (field) return { nodeId: n.id, field };
    }
    throw new Error(`${d.manifest.id}: no edge-fed field to probe`);
}

/** A real ABI input field of some node that no edge feeds, if the skill has one. */
function configField(
    d: SkillDefinition,
): { nodeId: string; field: string } | null {
    for (const n of d.template.executable.executableNodes) {
        const slot = n.feature as keyof typeof ABI_NODES;
        const field = Object.keys(
            ABI_NODES[slot]?.inputs?.properties ?? {},
        ).find((f) => n.bindings[f]?.kind !== "handle");
        if (field) return { nodeId: n.id, field };
    }
    return null;
}

function withProbe(
    d: SkillDefinition,
    target: SkillParam["target"],
): SkillDefinition {
    const firstNode = d.template.executable.executableNodes[0].id;
    const t =
        target.kind === "config" && target.nodeId === ""
            ? { ...target, nodeId: firstNode }
            : target;
    d.manifest.params.push({
        key: "__probe",
        type: "number",
        required: false,
        target: t,
    });
    return d;
}

describe("skill registry integrity (AC-1)", () => {
    it("has at least one skill and every skill is clean", () => {
        expect(SKILLS.length, "registered skills").toBeGreaterThanOrEqual(2);
        for (const s of SKILLS) {
            expect(
                checkSkillIntegrity(s.manifest.id, s),
                s.manifest.id,
            ).toEqual([]);
        }
    });
    for (const s of SKILLS) {
        for (const [rule, br] of Object.entries(BREAKS)) {
            it(`${s.manifest.id}: breaking ${rule} is caught by name`, () => {
                const d = clone(s);
                const { dir } = br(d);
                const v = checkSkillIntegrity(dir ?? d.manifest.id, d);
                expect(
                    v.map((x) => x.rule),
                    `${s.manifest.id} ${rule}`,
                ).toContain(rule);
            });
        }
    }

    it("the target matrix covers every target kind", () => {
        const kinds = new Set(Object.values(TARGET_BREAKS).map((t) => t.kind));
        expect([...kinds].sort(), "target kinds").toEqual(["config", "input"]);
        expect(Object.keys(TARGET_BREAKS).length, "target cases").toBe(3);
    });

    for (const s of SKILLS) {
        for (const [name, target] of Object.entries(TARGET_BREAKS)) {
            it(`${s.manifest.id}: a ${name} target that does not exist is caught`, () => {
                const d = withProbe(clone(s), target as SkillParam["target"]);
                const v = checkSkillIntegrity(d.manifest.id, d);
                expect(
                    v
                        .filter((x) => x.rule === "param-target-exists")
                        .map((x) => x.detail),
                    `${s.manifest.id} ${name}`,
                ).toEqual(["__probe"]);
            });
        }

        it(`${s.manifest.id}: a config target on an edge-fed field is refused by name`, () => {
            const d = clone(s);
            const { nodeId, field } = handleField(d);
            withProbe(d, { kind: "config", nodeId, field });
            const details = checkSkillIntegrity(d.manifest.id, d)
                .filter((x) => x.rule === "param-target-exists")
                .map((x) => x.detail);
            expect(details, `${s.manifest.id} edge-fed ${field}`).toEqual([
                `__probe: ${nodeId}.${field} is fed by an edge, not a config field`,
            ]);
        });
    }
    it("control — a config target on a real, non-edge ABI field passes (at least one skill has one)", () => {
        const controlled: string[] = [];
        for (const s of SKILLS) {
            const d = clone(s);
            const real = configField(d);
            if (!real) continue;
            withProbe(d, { kind: "config", ...real });
            expect(
                checkSkillIntegrity(d.manifest.id, d),
                `${s.manifest.id} control on ${real.nodeId}.${real.field}`,
            ).toEqual([]);
            controlled.push(`${s.manifest.id}:${real.field}`);
        }
        expect(
            controlled,
            "no skill offered a config field to control",
        ).toContain("cat-canh-video:threshold");
    });
});
