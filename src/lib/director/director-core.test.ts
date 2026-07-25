import { describe, expect, it } from "vitest";
import {
    type DirectorTurn,
    generateWorkflow,
    PlanValidationError,
} from "./director-core";
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

/** Same shape as GOOD_PLAN but names a slot ("gen-text") that DEMO_PLUGINS
 * never installs — compiles cleanly except for a single MISSING_PLUGIN
 * issue, used to exercise Fix 8's no-longer-short-circuited retry. */
const MISSING_PLUGIN_PLAN: DirectorPlan = {
    ...GOOD_PLAN,
    steps: [
        GOOD_PLAN.steps[0],
        {
            id: "g1",
            kind: "gen",
            slot: "gen-text",
            inputs: [{ field: "text", value: "@t1" }],
            params: [],
        },
    ],
};

/** Every adjacent pair of turns has a different role. */
function rolesAlternate(turns: DirectorTurn[]): boolean {
    return turns.every((turn, i) => i === 0 || turn.role !== turns[i - 1].role);
}

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
        const calls: DirectorTurn[][] = [];
        const result = await generateWorkflow(
            "draw a red bicycle",
            async (turns) => {
                // `appendUserTurn` mutates the trailing turn object in
                // place, so a shallow `[...turns]` copy would still alias
                // that object — an assertion made against an earlier call
                // could silently observe post-mutation state (Minor 14).
                calls.push(structuredClone(turns));
                return calls.length === 1 ? BAD_PLAN : GOOD_PLAN;
            },
            DEMO_PLUGINS,
        );
        expect(result.ok).toBe(true);
        expect(calls).toHaveLength(2);
        // second call carries the compiler feedback as a trailing user turn
        expect(calls[1].length).toBe(3);
        expect(calls[1][2].role).toBe("user");
        expect(calls[1][2].text).toContain("UNKNOWN_REF");
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

    // --- Fix 8: MISSING_PLUGIN-only issues no longer short-circuit the
    // retry — the vocabulary lists only installed slots, so MISSING_PLUGIN
    // means the model hallucinated an unlisted one, and the retry feedback
    // names it directly. That's recoverable, unlike a structural dead end. ---

    it("calls the generator a second time when every issue is MISSING_PLUGIN, unlike the old short-circuit", async () => {
        let calls = 0;
        const result = await generateWorkflow(
            "draw a red bicycle",
            async () => {
                calls++;
                return GOOD_PLAN;
            },
            {}, // nothing installed — every issue is MISSING_PLUGIN, both times
        );
        expect(result).toMatchObject({ ok: false, code: "MISSING_PLUGIN" });
        expect(calls).toBe(2);
    });

    it("recovers when the retry names an installed slot instead of the missing one", async () => {
        const calls: DirectorTurn[][] = [];
        const result = await generateWorkflow(
            "draw a red bicycle",
            async (turns) => {
                // structuredClone: appendUserTurn mutates in place (Minor 14).
                calls.push(structuredClone(turns));
                // First attempt names "gen-text", which nothing installs;
                // the model course-corrects to "image-gen" on the retry.
                return calls.length === 1 ? MISSING_PLUGIN_PLAN : GOOD_PLAN;
            },
            DEMO_PLUGINS, // only "image-gen" is installed
        );
        expect(result.ok).toBe(true);
        expect(calls).toHaveLength(2);
        expect(calls[1].at(-1)?.text).toContain(
            'no installed plugin serves slot "gen-text"',
        );
    });

    it("keeps the final code MISSING_PLUGIN when the retry throws PlanValidationError instead of producing a differently-shaped compile-issue list", async () => {
        const result = await generateWorkflow(
            "draw a red bicycle",
            async (turns) => {
                if (turns.length === 1) return MISSING_PLUGIN_PLAN;
                throw new PlanValidationError(
                    "model returned no parsable plan",
                );
            },
            {}, // nothing installed — first attempt is purely MISSING_PLUGIN
        );
        expect(result).toMatchObject({ ok: false, code: "MISSING_PLUGIN" });
        if (!result.ok) {
            expect(
                result.details?.every((i) => i.code === "MISSING_PLUGIN"),
            ).toBe(true);
        }
    });

    // --- Important 3 / retry turn shape: roles alternate, the failed plan
    // rides as its own `assistant` turn, and the sequence ends on `user` ---

    it("sends an alternating turn sequence on retry, with the failed plan as an assistant turn", async () => {
        const calls: DirectorTurn[][] = [];
        await generateWorkflow(
            "draw a red bicycle",
            async (turns) => {
                // structuredClone: appendUserTurn mutates in place (Minor 14).
                calls.push(structuredClone(turns));
                return calls.length === 1 ? BAD_PLAN : GOOD_PLAN;
            },
            DEMO_PLUGINS,
        );
        expect(calls).toHaveLength(2);

        const secondCallTurns = calls[1];
        expect(rolesAlternate(secondCallTurns)).toBe(true);
        expect(secondCallTurns.at(-1)?.role).toBe("user");

        expect(secondCallTurns[0]).toEqual({
            role: "user",
            text: "draw a red bicycle",
        });
        expect(secondCallTurns[1].role).toBe("assistant");
        expect(secondCallTurns[1].text).toContain(JSON.stringify(BAD_PLAN));
        expect(secondCallTurns[2].role).toBe("user");
    });

    // --- Fix 5: a final-attempt PlanValidationError carries the earlier
    // compiler issues through as `details` instead of discarding them ---

    it("carries the first attempt's compiler issues through as details when the retry throws PlanValidationError", async () => {
        const result = await generateWorkflow(
            "draw a red bicycle",
            async (turns) => {
                if (turns.length === 1) {
                    return BAD_PLAN;
                }
                throw new PlanValidationError(
                    "model returned no parsable plan",
                );
            },
            DEMO_PLUGINS,
        );
        expect(result).toMatchObject({ ok: false, code: "PLAN_INVALID" });
        if (!result.ok) {
            expect(result.details).toBeDefined();
            expect(result.details?.some((i) => i.code === "UNKNOWN_REF")).toBe(
                true,
            );
        }
    });
});

describe("generateWorkflow — plan-validation throws (Important 2)", () => {
    it("retries once after a PlanValidationError, then succeeds, merging the critique into a single user turn", async () => {
        const calls: DirectorTurn[][] = [];
        const result = await generateWorkflow(
            "draw a red bicycle",
            async (turns) => {
                // structuredClone: appendUserTurn mutates in place (Minor 14).
                calls.push(structuredClone(turns));
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
        // There is no schema-valid plan to echo as an assistant turn, so the
        // critique is merged into the sole (still `user`) turn rather than
        // appended as a second, same-role turn.
        expect(calls[1]).toHaveLength(1);
        expect(calls[1][0].role).toBe("user");
        expect(calls[1][0].text).toContain("1bad");
        expect(calls[1][0].text).toContain("draw a red bicycle");
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
