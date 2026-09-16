/**
 * E17b (AC-13, machine half) — the skill panel's copy exists in every locale,
 * covers every closed-set reason code and every step of every registered
 * skill, and the Vietnamese copy never leaks internal words.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SKILLS } from "@/lib/skills/catalog";
import { SKILL_PARAM_REASONS } from "@/lib/skills/params";

const LOCALES = ["en", "vi", "zh", "ja", "ko"] as const;
const DIR = path.join(__dirname, "messages");

type Tree = { [key: string]: string | Tree };
const load = (loc: string): Tree =>
    JSON.parse(readFileSync(path.join(DIR, `${loc}.json`), "utf8")).Skills;

function leaves(tree: Tree, prefix = ""): [string, string][] {
    return Object.entries(tree).flatMap(([k, v]) =>
        typeof v === "string"
            ? [[`${prefix}${k}`, v] as [string, string]]
            : leaves(v, `${prefix}${k}.`),
    );
}

function lookup(tree: Tree, dotted: string): unknown {
    // Skill ids contain dots never, hyphens often: split on dots only.
    return dotted
        .split(".")
        .reduce<unknown>(
            (node, key) => (node as Tree | undefined)?.[key],
            tree,
        );
}

// Written first; its length is asserted so a silently shortened list fails.
const FORBIDDEN = [
    "slot",
    "plugin id",
    "pluginId",
    "ABI",
    "executable",
    "taskId",
    "node",
];

describe("skill panel copy (E17b)", () => {
    const vi = load("vi");

    it("every Skills.* key in vi.json exists in every locale", () => {
        const keys = leaves(vi).map(([k]) => k);
        for (const loc of LOCALES) {
            const tree = load(loc);
            const missing = keys.filter(
                (k) => typeof lookup(tree, k) !== "string",
            );
            expect(missing, `${loc} missing`).toEqual([]);
        }
    });

    it("every reason code has a sentence, and nothing else is in invalid.*", () => {
        for (const loc of LOCALES) {
            const invalid = Object.keys(
                (load(loc).invalid as Tree) ?? {},
            ).sort();
            expect(invalid, `${loc} invalid.* vs SKILL_PARAM_REASONS`).toEqual(
                [...SKILL_PARAM_REASONS].sort(),
            );
        }
    });

    it("every slot of every registered skill has a step label", () => {
        for (const loc of LOCALES) {
            const tree = load(loc);
            for (const def of SKILLS) {
                for (const slot of def.manifest.requires) {
                    const key = `skills.${def.manifest.id}.steps.${slot}`;
                    expect(typeof lookup(tree, key), `${loc} ${key}`).toBe(
                        "string",
                    );
                }
            }
        }
    });

    it("vi copy never shows internal words", () => {
        expect(FORBIDDEN.length, "forbidden list was shortened").toBe(7);
        const hits: string[] = [];
        for (const [key, value] of leaves(vi)) {
            for (const word of FORBIDDEN) {
                const re = new RegExp(
                    `(^|[^\\p{L}])${word}($|[^\\p{L}])`,
                    "iu",
                );
                if (re.test(value)) hits.push(`${key} contains ${word}`);
            }
        }
        expect(hits).toEqual([]);
    });
});
