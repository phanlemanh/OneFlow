/**
 * Director DSL v1 — the IR between the LLM and the graph compiler.
 * Structured-outputs constraints: strict objects everywhere, no records,
 * no recursion. See spec §5.
 */
import { z } from "zod";

export const DIRECTOR_DSL_VERSION = 1;

const StepIdSchema = z
    .string()
    .min(1)
    .max(24)
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/);

const InputEntrySchema = z.strictObject({
    field: z.string().min(1),
    // "@id" reference, literal string, or array of those (array-typed handles)
    value: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
});

const ParamEntrySchema = z.strictObject({
    field: z.string().min(1),
    value: z.union([z.string(), z.number(), z.boolean()]),
});

const TextStepSchema = z.strictObject({
    id: StepIdSchema,
    kind: z.literal("text"),
    text: z.string().min(1),
});

const GenStepSchema = z.strictObject({
    id: StepIdSchema,
    kind: z.literal("gen"),
    slot: z.string().min(1),
    inputs: z.array(InputEntrySchema),
    params: z.array(ParamEntrySchema),
});

export const DirectorPlanSchema = z.strictObject({
    dslVersion: z.literal(DIRECTOR_DSL_VERSION),
    name: z.string().min(1).max(120),
    description: z.string().max(500),
    steps: z
        .array(z.discriminatedUnion("kind", [TextStepSchema, GenStepSchema]))
        .min(1)
        .max(60),
});

export type DirectorPlan = z.infer<typeof DirectorPlanSchema>;
export type DirectorStep = DirectorPlan["steps"][number];
export type TextStep = Extract<DirectorStep, { kind: "text" }>;
export type GenStep = Extract<DirectorStep, { kind: "gen" }>;
export type InputEntry = z.infer<typeof InputEntrySchema>;
export type ParamEntry = z.infer<typeof ParamEntrySchema>;

export function isRef(value: string): boolean {
    return value.startsWith("@");
}

export function refId(value: string): string {
    return value.slice(1);
}
