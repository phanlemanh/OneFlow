import { describe, expect, it } from "vitest";
import { compilePlan } from "./compile";
import { DirectorPlanSchema } from "./dsl";
import { FEW_SHOT_EXAMPLE_PLAN } from "./few-shot-example";

// The system prompt (director.server.ts) teaches the model by showing this
// plan verbatim. If it were not itself valid, the model would be trained on
// broken output. Both checks below must pass with zero issues.

const DEMO_PLUGINS = {
    "image-gen": "tongflow-modal-z-image",
    "image-fusion": "tongflow-modal-flux2-klein9b",
    "image-gen-video": "tongflow-modal-ltx",
};

describe("FEW_SHOT_EXAMPLE_PLAN", () => {
    it("parses as a valid Director DSL plan", () => {
        const result = DirectorPlanSchema.safeParse(FEW_SHOT_EXAMPLE_PLAN);
        expect(result.success).toBe(true);
    });

    it("compiles with zero issues", () => {
        const { issues } = compilePlan(FEW_SHOT_EXAMPLE_PLAN, {
            slotDefaultPlugin: DEMO_PLUGINS,
        });
        expect(issues).toEqual([]);
    });
});
