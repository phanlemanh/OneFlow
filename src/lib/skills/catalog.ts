import * as REGISTRY from "./registry";
import type { SkillDefinition } from "./types";

export const SKILLS: readonly SkillDefinition[] = Object.values(REGISTRY);

export function getSkill(id: string): SkillDefinition | undefined {
    return SKILLS.find((s) => s.manifest.id === id);
}
