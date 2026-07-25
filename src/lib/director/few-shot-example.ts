/**
 * The Director system prompt's few-shot example plan, defined once here so
 * the prompt (director.server.ts) and the validity test
 * (few-shot-example.test.ts) can never drift apart. If this object were a
 * JSON literal embedded in the prompt string, editing the prompt could
 * silently produce a plan the compiler rejects — teaching the model to
 * generate broken output. Importing the same value in both places makes
 * that impossible.
 */
import { DIRECTOR_DSL_VERSION, type DirectorPlan } from "./dsl";

export const FEW_SHOT_EXAMPLE_PROMPT =
    "a cat and a mouse take a photo together, then make it a video";

export const FEW_SHOT_EXAMPLE_PLAN: DirectorPlan = {
    dslVersion: DIRECTOR_DSL_VERSION,
    name: "Cat and mouse",
    description: "Photo of both, then animated",
    steps: [
        { id: "s1", kind: "text", text: "a cute cat, cartoon style" },
        {
            id: "s2",
            kind: "gen",
            slot: "image-gen",
            inputs: [{ field: "text", value: "@s1" }],
            params: [],
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
                {
                    field: "text",
                    value: "cat and mouse take a photo together",
                },
            ],
            params: [],
        },
        {
            id: "s6",
            kind: "gen",
            slot: "image-gen-video",
            inputs: [{ field: "image", value: "@s5" }],
            params: [
                { field: "duration", value: 5 },
                { field: "text", value: "drinking together" },
            ],
        },
    ],
};

/** Compact JSON rendering embedded verbatim in the system prompt. */
export const FEW_SHOT_EXAMPLE_JSON = JSON.stringify(FEW_SHOT_EXAMPLE_PLAN);
