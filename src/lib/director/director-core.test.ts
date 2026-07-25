import { describe, expect, it } from "vitest";
import { generateWorkflow, PlanValidationError } from "./director-core";
import type { DirectorPlan } from "./dsl";

const DEMO_PLUGINS = {
    "image-gen": "tongflow-modal-z-image",
};

const GOOD_PLAN: DirectorPlan = {
    dslVersion: 1,
    name: "One image",
    description: "",
    steps: [
        { id: "t1", kind: "text", text: "a red bicycle" },
        {
            id: "g1",
            kind: "gen",
            slot: "image-gen",
            inputs: [{ field: "text", value: "@t1" }],
            params: [],
        },
    ],
};

const BAD_PLAN: DirectorPlan = {
    ...GOOD_PLAN,
    steps: [
        GOOD_PLAN.steps[0],
        {
            id: "g1",
            kind: "gen",
            slot: "image-gen",
            inputs: [{ field: "text", value: "@ghost" }],
            params: [],
        },
    ],
};

describe("generateWorkflow", () => {
    it("returns nodes/edges for a valid first plan", async () => {
        const result = await generateWorkflow(
            "draw a red bicycle",
            async () => GOOD_PLAN,
            DEMO_PLUGINS,
        );
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.nodes.length).toBeGreaterThan(0);
            expect(result.name).toBe("One image");
        }
    });

    it("retries once with error feedback, then succeeds", async () => {
        const calls: string[][] = [];
        const result = await generateWorkflow(
            "draw a red bicycle",
            async (turns) => {
                calls.push([...turns]);
                return calls.length === 1 ? BAD_PLAN : GOOD_PLAN;
            },
            DEMO_PLUGINS,
        );
        expect(result.ok).toBe(true);
        expect(calls).toHaveLength(2);
        // second call carries the compiler feedback turn
        expect(calls[1].length).toBe(2);
        expect(calls[1][1]).toContain("UNKNOWN_REF");
    });

    it("fails with PLAN_INVALID after the retry also fails", async () => {
        const result = await generateWorkflow(
            "draw a red bicycle",
            async () => BAD_PLAN,
            DEMO_PLUGINS,
        );
        expect(result).toMatchObject({ ok: false, code: "PLAN_INVALID" });
    });

    it("fails with MISSING_PLUGIN when only plugin issues remain", async () => {
        const result = await generateWorkflow(
            "draw a red bicycle",
            async () => GOOD_PLAN,
            {}, // nothing installed
        );
        expect(result).toMatchObject({ ok: false, code: "MISSING_PLUGIN" });
    });

    // --- Important 4: MISSING_PLUGIN-only issues short-circuit the retry ---

    it("does not call the generator a second time when every issue is MISSING_PLUGIN", async () => {
        let calls = 0;
        const result = await generateWorkflow(
            "draw a red bicycle",
            async () => {
                calls++;
                return GOOD_PLAN;
            },
            {}, // nothing installed — every issue is MISSING_PLUGIN
        );
        expect(result).toMatchObject({ ok: false, code: "MISSING_PLUGIN" });
        expect(calls).toBe(1);
    });

    // --- Important 3: retry feedback must embed the failed plan itself ---

    it("embeds the failed plan's JSON in the retry feedback turn", async () => {
        const calls: string[][] = [];
        await generateWorkflow(
            "draw a red bicycle",
            async (turns) => {
                calls.push([...turns]);
                return calls.length === 1 ? BAD_PLAN : GOOD_PLAN;
            },
            DEMO_PLUGINS,
        );
        expect(calls).toHaveLength(2);
        expect(calls[1][1]).toContain(JSON.stringify(BAD_PLAN));
    });
});

describe("generateWorkflow — plan-validation throws (Important 2)", () => {
    it("retries once after a PlanValidationError, then succeeds", async () => {
        const calls: string[][] = [];
        const result = await generateWorkflow(
            "draw a red bicycle",
            async (turns) => {
                calls.push([...turns]);
                if (calls.length === 1) {
                    throw new PlanValidationError(
                        'step id "1bad" starts with a digit',
                    );
                }
                return GOOD_PLAN;
            },
            DEMO_PLUGINS,
        );
        expect(result.ok).toBe(true);
        expect(calls).toHaveLength(2);
        // second call carries feedback built from the thrown error message
        expect(calls[1][1]).toContain("1bad");
    });

    it("returns PLAN_INVALID (not a throw) when every attempt raises PlanValidationError", async () => {
        const result = await generateWorkflow(
            "draw a red bicycle",
            async () => {
                throw new PlanValidationError("plan has 61 steps, max is 60");
            },
            DEMO_PLUGINS,
        );
        expect(result).toMatchObject({
            ok: false,
            code: "PLAN_INVALID",
            message: expect.stringContaining("61 steps"),
        });
    });

    it("does not absorb a non-PlanValidationError throw — lets it propagate", async () => {
        class FakeTransportError extends Error {}
        await expect(
            generateWorkflow(
                "draw a red bicycle",
                async () => {
                    throw new FakeTransportError("401 unauthorized");
                },
                DEMO_PLUGINS,
            ),
        ).rejects.toThrow("401 unauthorized");
    });
});
