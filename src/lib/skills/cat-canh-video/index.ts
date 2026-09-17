import type { SkillDefinition, SkillTemplate } from "../types";
import { manifest } from "./manifest";
import sampleParams from "./sample-params.json";
import template from "./template.json";

export const skill: SkillDefinition = {
    manifest,
    template: template as unknown as SkillTemplate,
    sampleParams,
};
