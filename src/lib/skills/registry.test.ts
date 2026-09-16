import { describe, expect, it } from "vitest";
import { SKILLS } from "./catalog";
import { checkSkillIntegrity } from "./integrity";
import type { SkillDefinition } from "./types";

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
    "param-target-exists": (d) => {
        d.manifest.params[0].target = { kind: "input", name: "input_nope" };
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
});
