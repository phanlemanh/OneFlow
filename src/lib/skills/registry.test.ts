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

        it(`${s.manifest.id}: control — a config target on a real ABI field passes`, () => {
            const d = clone(s);
            const node = d.template.executable.executableNodes[0];
            const slot = node.feature as keyof typeof ABI_NODES;
            const [field] = Object.keys(
                ABI_NODES[slot].inputs.properties ?? {},
            );
            withProbe(d, { kind: "config", nodeId: node.id, field });
            expect(
                checkSkillIntegrity(d.manifest.id, d),
                `${s.manifest.id} control`,
            ).toEqual([]);
        });
    }
});
