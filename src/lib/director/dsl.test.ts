import { describe, expect, it } from "vitest";
import { DirectorPlanSchema, isRef, refId } from "./dsl";

const CAT_MOUSE_PLAN = {
    dslVersion: 1,
    name: "Cat and mouse",
    description: "Two cartoon characters photographed together, then animated",
    steps: [
        { id: "s1", kind: "text", text: "a cute cat, cartoon style" },
        {
            id: "s2",
            kind: "gen",
            slot: "image-gen",
            inputs: [{ field: "text", value: "@s1" }],
            params: [
                { field: "width", value: 1024 },
                { field: "height", value: 1024 },
            ],
        },
        { id: "s3", kind: "text", text: "a cute mouse, cartoon style" },
        {
            id: "s4",
            kind: "gen",
            slot: "image-gen",
            inputs: [{ field: "text", value: "@s3" }],
            params: [],
        },
        {
            id: "s5",
            kind: "gen",
            slot: "image-fusion",
            inputs: [
                { field: "images", value: ["@s2", "@s4"] },
                { field: "text", value: "cat and mouse take a photo together" },
            ],
            params: [],
        },
        {
            id: "s6",
            kind: "gen",
            slot: "image-gen-video",
            inputs: [{ field: "image", value: "@s5" }],
            params: [{ field: "duration", value: 5 }],
        },
    ],
} as const;

describe("DirectorPlanSchema", () => {
    it("accepts the cat-and-mouse example plan", () => {
        const parsed = DirectorPlanSchema.parse(CAT_MOUSE_PLAN);
        expect(parsed.steps).toHaveLength(6);
    });

    it("rejects an unknown dslVersion", () => {
        expect(() =>
            DirectorPlanSchema.parse({ ...CAT_MOUSE_PLAN, dslVersion: 2 }),
        ).toThrow();
    });

    it("rejects a step with an unknown kind", () => {
        expect(() =>
            DirectorPlanSchema.parse({
                ...CAT_MOUSE_PLAN,
                steps: [{ id: "s1", kind: "image", text: "x" }],
            }),
        ).toThrow();
    });

    it("rejects extra properties (strict objects)", () => {
        expect(() =>
            DirectorPlanSchema.parse({ ...CAT_MOUSE_PLAN, extra: true }),
        ).toThrow();
    });

    it("rejects an empty steps array", () => {
        expect(() =>
            DirectorPlanSchema.parse({ ...CAT_MOUSE_PLAN, steps: [] }),
        ).toThrow();
    });
});

describe("ref helpers", () => {
    it("classifies and strips @refs", () => {
        expect(isRef("@s1")).toBe(true);
        expect(isRef("plain text")).toBe(false);
        expect(refId("@s1")).toBe("s1");
    });
});
