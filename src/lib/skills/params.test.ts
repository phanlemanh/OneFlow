import { describe, expect, it } from "vitest";
import { SKILL_PARAM_REASONS, validateParams } from "./params";
import type { SkillManifest } from "./types";

// A fixture manifest that has every param type, so the enum and range cases
// exist even though no shipped skill has an enum param.
const M: SkillManifest = {
    id: "fixture",
    version: "1.0.0",
    requires: [],
    sideEffects: [],
    outputs: [],
    params: [
        {
            key: "video",
            type: "video",
            required: true,
            target: { kind: "input", name: "input_v1" },
        },
        {
            key: "n",
            type: "number",
            required: false,
            min: 5,
            max: 60,
            target: { kind: "config", nodeId: "s1", field: "threshold" },
        },
        {
            key: "mode",
            type: "enum",
            required: false,
            options: ["a", "b"],
            target: { kind: "config", nodeId: "s1", field: "mode" },
        },
    ],
};
const VIDEO = { fileKey: "k.mp4", name: "k.mp4" };

// One case per reason code; the matrix length is asserted against the export.
const CASES: Record<string, { raw: unknown; param: string }> = {
    required: { raw: {}, param: "video" },
    type: { raw: { video: VIDEO, n: "twenty" }, param: "n" },
    range: { raw: { video: VIDEO, n: 90 }, param: "n" },
    option: { raw: { video: VIDEO, mode: "c" }, param: "mode" },
    unknown: { raw: { video: VIDEO, extra: 1 }, param: "extra" },
};

describe("validateParams", () => {
    it("covers exactly the exported reason set", () => {
        expect(Object.keys(CASES).sort()).toEqual(
            [...SKILL_PARAM_REASONS].sort(),
        );
    });
    for (const reason of SKILL_PARAM_REASONS) {
        it(`rejects with reason ${reason}`, () => {
            const c = CASES[reason];
            const r = validateParams(M, c.raw);
            expect(r.ok, `case ${reason} passed`).toBe(false);
            if (r.ok) return;
            expect(r.errors).toContainEqual({ param: c.param, reason });
        });
    }
    it("accepts valid params and fills defaults", () => {
        const r = validateParams(
            {
                ...M,
                params: M.params.map((p) =>
                    p.key === "n" ? { ...p, default: 20 } : p,
                ),
            },
            { video: VIDEO },
        );
        expect(r).toEqual({ ok: true, params: { video: VIDEO, n: 20 } });
    });
});
