# Director Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A canvas prompt panel where the user types an intent, Claude emits a step-plan DSL, a deterministic compiler turns it into a valid ReactFlow graph, and the graph lands on the canvas unexecuted (Gate 1).

**Architecture:** DSL + compiler (architecture B from the spec). Claude (`claude-opus-4-8`, structured outputs via zod) only produces a small plan; all ReactFlow plumbing (node types, handles, sandwich pattern, layout) is emitted by `compilePlan`, valid by construction. One retry with compiler-error feedback, then a typed error taxonomy to the UI.

**Tech Stack:** Next.js 15 App Router, TypeScript, zod 4, `@anthropic-ai/sdk`, vitest, shadcn/ui + AI SDK Elements `PromptInput`, next-intl.

**Spec:** `docs/superpowers/specs/2026-07-24-director-agent-design.md` — read it first; it defines the DSL contract (§5), compiler behavior (§6), error taxonomy (§9).

## Global Constraints

- Branch: `feat/director-agent` (already exists; all commits go there).
- Repo formatting is Biome, 4-space indent: run `pnpm lint` (auto-format) before each commit; `pnpm lint:check` must pass.
- Comments in code: English only (repo rule, CLAUDE.md).
- Server-only modules end in `.server.ts` and start with `import "server-only";`.
- No runtime ABI validation (repo philosophy) — the compiler validates *plan* semantics, never re-validates ABI payload shapes.
- Model id is exactly `claude-opus-4-8`. No `temperature`/`top_p` (rejected on this model). `thinking: { type: "adaptive" }`.
- Package versions in `package.json` are exact (no `^`/`~`), matching repo style.
- Reference fixture for graph shapes: `public/example.json` (`originalFlow`).
- All tests colocated next to sources as `*.test.ts` (repo pattern); run with `pnpm exec vitest run <path>`.

---

### Task 1: DSL schema (`dsl.ts`)

**Files:**
- Create: `src/lib/director/dsl.ts`
- Test: `src/lib/director/dsl.test.ts`

**Interfaces:**
- Consumes: nothing (only `zod`).
- Produces: `DirectorPlanSchema` (zod), `DIRECTOR_DSL_VERSION`, types `DirectorPlan`, `DirectorStep`, `TextStep`, `GenStep`, `InputEntry`, `ParamEntry`; helpers `isRef(value: string): boolean`, `refId(value: string): string`. Tasks 3–6 import these names verbatim.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/director/dsl.test.ts
import { describe, expect, it } from "vitest";
import { DirectorPlanSchema, isRef, refId } from "./dsl";

export const CAT_MOUSE_PLAN = {
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/director/dsl.test.ts`
Expected: FAIL — `Cannot find module './dsl'`.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/director/dsl.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/lib/director/dsl.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Format and commit**

```bash
pnpm lint
git add src/lib/director/dsl.ts src/lib/director/dsl.test.ts
git commit -m "feat(director): DSL v1 zod schema"
```

---

### Task 2: Slot → node-type map (`slot-node-type.ts`)

**Files:**
- Create: `src/lib/director/slot-node-type.ts`
- Test: `src/lib/director/slot-node-type.test.ts`
- Read first: `src/lib/abi/node-feature-registry.ts` (the `NODE_TYPE_TO_ABI_FEATURE` const)

**Interfaces:**
- Consumes: `NODE_TYPE_TO_ABI_FEATURE` from `@/lib/abi/node-feature-registry`; `NodeSlot` type from `@/generated/abi`.
- Produces: `SLOT_TO_NODE_TYPE: Partial<Record<NodeSlot, string>>` — Tasks 3 and 5 import it.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/director/slot-node-type.test.ts
import { describe, expect, it } from "vitest";
import { NODE_TYPE_TO_ABI_FEATURE } from "@/lib/abi/node-feature-registry";
import { SLOT_TO_NODE_TYPE } from "./slot-node-type";

describe("SLOT_TO_NODE_TYPE", () => {
    it("maps the demo slots to the expected RF node types", () => {
        expect(SLOT_TO_NODE_TYPE["image-gen"]).toBe("textGenImageNode");
        expect(SLOT_TO_NODE_TYPE["image-fusion"]).toBe("imageFusionNode");
        expect(SLOT_TO_NODE_TYPE["image-gen-video"]).toBe("imageGenVideoNode");
        expect(SLOT_TO_NODE_TYPE["gen-text"]).toBe("genTextNode");
    });

    it("prefers the non-Compose variant for duplicated slots", () => {
        expect(SLOT_TO_NODE_TYPE["image-gen-video"]).not.toMatch(/Compose/);
        expect(SLOT_TO_NODE_TYPE["text-gen-speech-clone"]).not.toMatch(
            /Compose/,
        );
    });

    it("every entry round-trips through NODE_TYPE_TO_ABI_FEATURE", () => {
        for (const [slot, nodeType] of Object.entries(SLOT_TO_NODE_TYPE)) {
            expect(NODE_TYPE_TO_ABI_FEATURE[nodeType as string]).toBe(slot);
        }
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/director/slot-node-type.test.ts`
Expected: FAIL — module not found.

Note: if `imageFusionNode` is absent from `NODE_TYPE_TO_ABI_FEATURE` (it lives in the `compose/` block of that file — verify by reading the file), adjust the test expectation to whatever compose node type maps to `image-fusion`, and keep the round-trip test authoritative.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/director/slot-node-type.ts
/**
 * Inverse of NODE_TYPE_TO_ABI_FEATURE: pick one canonical RF node type per
 * ABI slot. First declaration wins; slots served by several node types get
 * an explicit preference (plain variant over the *Compose variant).
 */
import type { NodeSlot } from "@/generated/abi";
import { NODE_TYPE_TO_ABI_FEATURE } from "@/lib/abi/node-feature-registry";

const PREFERRED_NODE_TYPE: Partial<Record<NodeSlot, string>> = {
    "image-gen-video": "imageGenVideoNode",
    "text-gen-speech-clone": "textGenSpeechCloneNode",
    transcribe: "audioGenTextSpeechRecognizeNode",
};

function build(): Partial<Record<NodeSlot, string>> {
    const map: Partial<Record<NodeSlot, string>> = {};
    for (const [nodeType, slot] of Object.entries(NODE_TYPE_TO_ABI_FEATURE)) {
        if (map[slot] === undefined) {
            map[slot] = nodeType;
        }
    }
    return { ...map, ...PREFERRED_NODE_TYPE };
}

export const SLOT_TO_NODE_TYPE: Partial<Record<NodeSlot, string>> = build();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/lib/director/slot-node-type.test.ts`
Expected: PASS.

- [ ] **Step 5: Format and commit**

```bash
pnpm lint
git add src/lib/director/slot-node-type.ts src/lib/director/slot-node-type.test.ts
git commit -m "feat(director): canonical slot to RF node type map"
```

---

### Task 3: Compiler — nodes, edges, data seeding (`compile.ts`)

**Files:**
- Create: `src/lib/director/compile.ts`
- Test: `src/lib/director/compile.test.ts`
- Read first (investigation, step 0): `public/example.json` (`originalFlow` node `data` shapes and edge handle ids), `src/lib/abi/handle-introspect.ts` (`getAbiTopology`, `FieldClass.path`, `OutputHandle`), `src/components/workspace/nodes/compose/image-fusion-node.tsx` (or wherever `imageFusionNode` lives) to see whether `data.ids` is required at import or derived from edges on mount.

**Interfaces:**
- Consumes: Task 1 (`DirectorPlan`, `GenStep`, `isRef`, `refId`), Task 2 (`SLOT_TO_NODE_TYPE`), `getAbiTopology`/`sourceHandleId`/`targetHandleId`/`DataNodeType` from `@/lib/abi/handle-introspect`.
- Produces (Tasks 4, 6, 7 rely on these exact names):

```typescript
export type CompileIssueCode =
    | "DUPLICATE_ID" | "UNKNOWN_SLOT" | "MISSING_PLUGIN" | "UNKNOWN_REF"
    | "UNKNOWN_INPUT_FIELD" | "REF_ON_CONFIG_FIELD" | "MODALITY_MISMATCH"
    | "ARITY_MISMATCH" | "MISSING_REQUIRED_INPUT" | "CYCLE";
export interface CompileIssue {
    code: CompileIssueCode;
    stepId?: string;
    message: string;
    slot?: string;
}
export interface CompileOptions {
    slotDefaultPlugin: Partial<Record<string, string>>;
    idFn?: () => string; // default crypto.randomUUID; injectable for tests
}
export interface CompileResult {
    nodes: Node[];   // @xyflow/react Node
    edges: Edge[];   // @xyflow/react Edge
    issues: CompileIssue[];
}
export function compilePlan(plan: DirectorPlan, options: CompileOptions): CompileResult;
```

- [ ] **Step 0: Investigation.** Read the three files listed above. Record in a comment at the top of `compile.ts`: (a) exact edge handle spellings from example.json (`in:textNode`, `out:textNode`→`in:text`, `out:image`→`in:imageNode`, `out:imageNode`→`in:images`); (b) whether fusion `data.ids` must be seeded at import or is derived from edges on mount — if derived, do not seed it; if required, seed with the source modality-node ids. Adjust Step 3's `data` assembly accordingly.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/director/compile.test.ts
import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import type { DirectorPlan } from "./dsl";
import { compilePlan } from "./compile";

/** Deterministic id generator for stable assertions. */
function seqId(): () => string {
    let n = 0;
    return () => `n${++n}`;
}

const DEMO_PLUGINS = {
    "image-gen": "tongflow-modal-z-image",
    "image-fusion": "tongflow-modal-flux2-klein9b",
    "image-gen-video": "tongflow-modal-ltx",
};

const PLAN: DirectorPlan = {
    dslVersion: 1,
    name: "Cat and mouse",
    description: "",
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
};

function byType(nodes: Node[]): Record<string, Node[]> {
    const out: Record<string, Node[]> = {};
    for (const n of nodes) {
        (out[n.type as string] ??= []).push(n);
    }
    return out;
}

describe("compilePlan — happy path (mirrors public/example.json)", () => {
    const result = compilePlan(PLAN, {
        slotDefaultPlugin: DEMO_PLUGINS,
        idFn: seqId(),
    });

    it("produces no issues", () => {
        expect(result.issues).toEqual([]);
    });

    it("emits the example.json node census (12 nodes, 11 edges)", () => {
        const t = byType(result.nodes);
        expect(t.addTextNode).toHaveLength(2);
        expect(t.textNode).toHaveLength(2);
        expect(t.textGenImageNode).toHaveLength(2);
        expect(t.imageFusionNode).toHaveLength(1);
        expect(t.imageGenVideoNode).toHaveLength(1);
        expect(t.imageNode).toHaveLength(3); // 2 gen outputs + fusion output
        expect(t.videoNode).toHaveLength(1);
        expect(result.nodes).toHaveLength(12);
        expect(result.edges).toHaveLength(11);
    });

    it("wires handles exactly like the example", () => {
        const handles = result.edges.map(
            (e: Edge) => `${e.sourceHandle ?? "-"}=>${e.targetHandle ?? "-"}`,
        );
        expect(handles).toContain("-=>in:textNode"); // addText -> text
        expect(handles).toContain("out:textNode=>in:text"); // text -> image-gen
        expect(handles).toContain("out:image=>in:imageNode"); // gen -> imageNode
        expect(handles).toContain("out:imageNode=>in:images"); // imageNode -> fusion
    });

    it("seeds executable node data (feature, pluginId, params, known text)", () => {
        const gen = byType(result.nodes).textGenImageNode[0];
        expect(gen.data).toMatchObject({
            feature: "image-gen",
            pluginId: "tongflow-modal-z-image",
            width: 1024,
            height: 1024,
            texts: ["a cute cat, cartoon style"],
        });
        const fusion = byType(result.nodes).imageFusionNode[0];
        expect(fusion.data).toMatchObject({
            feature: "image-fusion",
            pluginId: "tongflow-modal-flux2-klein9b",
            text: "cat and mouse take a photo together", // config literal rerouted
        });
        const video = byType(result.nodes).imageGenVideoNode[0];
        expect(video.data).toMatchObject({
            feature: "image-gen-video",
            duration: 5,
            fileKeys: [],
        });
    });

    it("seeds source pairs like the example (manualValue + texts)", () => {
        const add = byType(result.nodes).addTextNode[0];
        expect(add.data).toMatchObject({
            manualValue: "a cute cat, cartoon style",
        });
        const text = byType(result.nodes).textNode[0];
        expect(text.data).toMatchObject({
            texts: ["a cute cat, cartoon style"],
        });
    });

    it("gives every node an origin and a position", () => {
        for (const n of result.nodes) {
            expect(n.origin).toEqual([0.5, 0.5]);
            expect(typeof n.position.x).toBe("number");
            expect(typeof n.position.y).toBe("number");
        }
    });
});

describe("compilePlan — inline literal on a text handle field", () => {
    it("spawns an addText+text pair for the literal", () => {
        const result = compilePlan(
            {
                dslVersion: 1,
                name: "inline",
                description: "",
                steps: [
                    {
                        id: "g1",
                        kind: "gen",
                        slot: "image-gen",
                        inputs: [{ field: "text", value: "sunset over hanoi" }],
                        params: [],
                    },
                ],
            },
            { slotDefaultPlugin: DEMO_PLUGINS, idFn: seqId() },
        );
        expect(result.issues).toEqual([]);
        const t = byType(result.nodes);
        expect(t.addTextNode).toHaveLength(1);
        expect(t.textNode).toHaveLength(1);
        expect(t.textGenImageNode).toHaveLength(1);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/director/compile.test.ts`
Expected: FAIL — `./compile` not found.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/director/compile.ts
/**
 * Deterministic DSL -> ReactFlow compiler. Emits the same node/edge shapes as
 * public/example.json (the reference fixture): source pairs
 * (addTextNode -> textNode), executable nodes sandwiched by modality nodes,
 * `in:<field>` / `out:<field>` handles from handle-introspect.
 * Pure: no I/O — installed-plugin defaults are injected via options.
 */
import type { Edge, Node } from "@xyflow/react";
import type { NodeSlot } from "@/generated/abi";
import {
    type DataNodeType,
    type FieldClass,
    getAbiTopology,
    sourceHandleId,
    targetHandleId,
} from "@/lib/abi/handle-introspect";
import { parseWorkflow } from "@/lib/workflow/parser";
import {
    type DirectorPlan,
    type GenStep,
    isRef,
    refId,
} from "./dsl";
import { SLOT_TO_NODE_TYPE } from "./slot-node-type";

export type CompileIssueCode =
    | "DUPLICATE_ID"
    | "UNKNOWN_SLOT"
    | "MISSING_PLUGIN"
    | "UNKNOWN_REF"
    | "UNKNOWN_INPUT_FIELD"
    | "REF_ON_CONFIG_FIELD"
    | "MODALITY_MISMATCH"
    | "ARITY_MISMATCH"
    | "MISSING_REQUIRED_INPUT"
    | "CYCLE";

export interface CompileIssue {
    code: CompileIssueCode;
    stepId?: string;
    message: string;
    slot?: string;
}

export interface CompileOptions {
    /** slot -> default installed pluginId (head of nodePluginMap). */
    slotDefaultPlugin: Partial<Record<string, string>>;
    /** Injectable id generator (tests); defaults to crypto.randomUUID. */
    idFn?: () => string;
}

export interface CompileResult {
    nodes: Node[];
    edges: Edge[];
    issues: CompileIssue[];
}

const DATA_NODE_DEFAULT_DATA: Record<DataNodeType, Record<string, unknown>> = {
    textNode: { texts: [] },
    imageNode: { fileKeys: [] },
    videoNode: { fileKeys: [] },
    audioNode: { fileKeys: [] },
    fileNode: { fileKeys: [] },
    modelNode: { fileKeys: [] },
    linkNode: { texts: [] },
};

interface StepOutput {
    nodeId: string;
    nodeType: DataNodeType;
    /** Literal text when the producing step is a text source. */
    literal?: string;
}

export function compilePlan(
    plan: DirectorPlan,
    options: CompileOptions,
): CompileResult {
    const idFn = options.idFn ?? (() => crypto.randomUUID());
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const issues: CompileIssue[] = [];
    const outputs = new Map<string, StepOutput>();

    const seen = new Set<string>();
    for (const step of plan.steps) {
        if (seen.has(step.id)) {
            issues.push({
                code: "DUPLICATE_ID",
                stepId: step.id,
                message: `duplicate step id "${step.id}"`,
            });
        }
        seen.add(step.id);
    }

    /** Emit addTextNode -> textNode and return the textNode as output. */
    function emitTextSource(text: string): StepOutput {
        const addId = idFn();
        const textId = idFn();
        nodes.push({
            id: addId,
            type: "addTextNode",
            position: { x: 0, y: 0 },
            origin: [0.5, 0.5],
            data: { manualValue: text },
        });
        nodes.push({
            id: textId,
            type: "textNode",
            position: { x: 0, y: 0 },
            origin: [0.5, 0.5],
            data: { texts: [text] },
        });
        edges.push({
            id: idFn(),
            source: addId,
            target: textId,
            targetHandle: "in:textNode",
        });
        return { nodeId: textId, nodeType: "textNode", literal: text };
    }

    function compileGenStep(step: GenStep): void {
        const nodeType = SLOT_TO_NODE_TYPE[step.slot as NodeSlot];
        if (!nodeType) {
            issues.push({
                code: "UNKNOWN_SLOT",
                stepId: step.id,
                slot: step.slot,
                message: `unknown slot "${step.slot}"`,
            });
            return;
        }
        const pluginId = options.slotDefaultPlugin[step.slot];
        if (!pluginId) {
            issues.push({
                code: "MISSING_PLUGIN",
                stepId: step.id,
                slot: step.slot,
                message: `no installed plugin serves slot "${step.slot}"`,
            });
        }

        const topo = getAbiTopology(step.slot as NodeSlot);
        const genId = idFn();
        const data: Record<string, unknown> = {
            feature: step.slot,
            pluginId: pluginId ?? "",
        };

        for (const { field, value } of step.params) {
            const fc = topo.inputs[field];
            if (!fc || fc.kind !== "config") {
                issues.push({
                    code: "UNKNOWN_INPUT_FIELD",
                    stepId: step.id,
                    slot: step.slot,
                    message: `"${field}" is not a config field of ${step.slot}`,
                });
                continue;
            }
            data[field] = value;
        }

        const knownTexts: string[] = [];
        const pendingEdges: Edge[] = [];

        for (const { field, value } of step.inputs) {
            const fc: FieldClass | undefined = topo.inputs[field];
            if (!fc) {
                issues.push({
                    code: "UNKNOWN_INPUT_FIELD",
                    stepId: step.id,
                    slot: step.slot,
                    message: `"${field}" is not an input of ${step.slot}`,
                });
                continue;
            }
            const values = Array.isArray(value) ? value : [value];

            if (fc.kind === "config") {
                // LLM-friendly leniency (spec §5): literal on a config field
                // is routed into data; refs on config fields are errors.
                if (values.length !== 1 || isRef(values[0])) {
                    issues.push({
                        code: "REF_ON_CONFIG_FIELD",
                        stepId: step.id,
                        slot: step.slot,
                        message: `config field "${field}" only accepts a single literal value`,
                    });
                    continue;
                }
                data[field] = values[0];
                continue;
            }

            if (!fc.array && values.length > 1) {
                issues.push({
                    code: "ARITY_MISMATCH",
                    stepId: step.id,
                    slot: step.slot,
                    message: `field "${field}" accepts a single value`,
                });
                continue;
            }

            for (const v of values) {
                let src: StepOutput | undefined;
                if (isRef(v)) {
                    src = outputs.get(refId(v));
                    if (!src) {
                        issues.push({
                            code: "UNKNOWN_REF",
                            stepId: step.id,
                            message: `"${v}" does not reference an earlier step`,
                        });
                        continue;
                    }
                } else {
                    // Inline literal only makes sense for text-typed handles.
                    if (fc.nodeType !== "textNode") {
                        issues.push({
                            code: "MODALITY_MISMATCH",
                            stepId: step.id,
                            message: `field "${field}" expects ${fc.nodeType}; got literal text`,
                        });
                        continue;
                    }
                    src = emitTextSource(v);
                }
                if (src.nodeType !== fc.nodeType) {
                    issues.push({
                        code: "MODALITY_MISMATCH",
                        stepId: step.id,
                        message: `field "${field}" expects ${fc.nodeType}; "@${refId(
                            isRef(v) ? v : "",
                        )}" produces ${src.nodeType}`,
                    });
                    continue;
                }
                if (src.literal !== undefined) {
                    knownTexts.push(src.literal);
                }
                pendingEdges.push({
                    id: idFn(),
                    source: src.nodeId,
                    sourceHandle: sourceHandleId(src.nodeType),
                    target: genId,
                    targetHandle: targetHandleId(field),
                });
            }
        }

        // Required handle fields must be fed; config defaults come from the
        // node's own form after mount (spec §5).
        for (const field of topo.requiredInputs) {
            const fc = topo.inputs[field];
            if (fc?.kind !== "handle") continue;
            const provided = step.inputs.some((i) => i.field === field);
            if (!provided) {
                issues.push({
                    code: "MISSING_REQUIRED_INPUT",
                    stepId: step.id,
                    slot: step.slot,
                    message: `required input "${field}" of ${step.slot} is not connected`,
                });
            }
        }

        if (knownTexts.length > 0) {
            data.texts = knownTexts;
        }

        const primaryOut = topo.outputs[0];
        if (primaryOut && DATA_NODE_DEFAULT_DATA[primaryOut.nodeType].fileKeys) {
            data.fileKeys = [];
        }

        nodes.push({
            id: genId,
            type: nodeType,
            position: { x: 0, y: 0 },
            origin: [0.5, 0.5],
            data,
        });
        edges.push(...pendingEdges);

        if (primaryOut) {
            const outId = idFn();
            nodes.push({
                id: outId,
                type: primaryOut.nodeType,
                position: { x: 0, y: 0 },
                origin: [0.5, 0.5],
                data: { ...DATA_NODE_DEFAULT_DATA[primaryOut.nodeType] },
            });
            edges.push({
                id: idFn(),
                source: genId,
                sourceHandle: sourceHandleId(primaryOut.field),
                target: outId,
                targetHandle: targetHandleId(primaryOut.nodeType),
            });
            outputs.set(step.id, {
                nodeId: outId,
                nodeType: primaryOut.nodeType,
            });
        }
    }

    for (const step of plan.steps) {
        if (step.kind === "text") {
            outputs.set(step.id, emitTextSource(step.text));
        } else {
            compileGenStep(step);
        }
    }

    layoutByLevels(nodes, edges, issues);
    return { nodes, edges, issues };
}

/** Position nodes on a level grid derived from the execution plan. */
function layoutByLevels(
    nodes: Node[],
    edges: Edge[],
    issues: CompileIssue[],
): void {
    const X_GAP = 520;
    const Y_GAP = 430;
    try {
        const plan = parseWorkflow({ nodes, edges });
        plan.levels.forEach((ids, level) => {
            ids.forEach((id, row) => {
                const node = nodes.find((n) => n.id === id);
                if (node) {
                    node.position = { x: level * X_GAP, y: row * Y_GAP };
                }
            });
        });
    } catch {
        issues.push({
            code: "CYCLE",
            message: "generated graph is not a DAG",
        });
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/lib/director/compile.test.ts`
Expected: PASS. If a `data`-seeding assertion fails against the real ABI topology (e.g. `image-gen`'s text field path), reconcile with `getAbiTopology("image-gen")` output and `public/example.json` — the example file wins.

- [ ] **Step 5: Format and commit**

```bash
pnpm lint
git add src/lib/director/compile.ts src/lib/director/compile.test.ts
git commit -m "feat(director): DSL to ReactFlow compiler (happy path)"
```

---

### Task 4: Compiler — error cases

**Files:**
- Modify: `src/lib/director/compile.ts` (only if a case is not yet handled)
- Test: `src/lib/director/compile.test.ts` (append)

**Interfaces:** unchanged from Task 3.

- [ ] **Step 1: Append failing tests**

```typescript
// append to src/lib/director/compile.test.ts
describe("compilePlan — error cases", () => {
    const opts = () => ({
        slotDefaultPlugin: DEMO_PLUGINS,
        idFn: seqId(),
    });
    const gen = (over: Partial<DirectorPlan["steps"][number]>) =>
        ({
            dslVersion: 1,
            name: "err",
            description: "",
            steps: [
                { id: "t1", kind: "text", text: "hello" },
                {
                    id: "g1",
                    kind: "gen",
                    slot: "image-gen",
                    inputs: [{ field: "text", value: "@t1" }],
                    params: [],
                    ...over,
                },
            ],
        }) as DirectorPlan;

    it("UNKNOWN_SLOT", () => {
        const r = compilePlan(gen({ slot: "no-such-slot" }), opts());
        expect(r.issues.map((i) => i.code)).toContain("UNKNOWN_SLOT");
    });

    it("MISSING_PLUGIN", () => {
        const r = compilePlan(gen({}), {
            slotDefaultPlugin: {},
            idFn: seqId(),
        });
        expect(r.issues.map((i) => i.code)).toContain("MISSING_PLUGIN");
    });

    it("UNKNOWN_REF", () => {
        const r = compilePlan(
            gen({ inputs: [{ field: "text", value: "@ghost" }] }),
            opts(),
        );
        expect(r.issues.map((i) => i.code)).toContain("UNKNOWN_REF");
    });

    it("UNKNOWN_INPUT_FIELD", () => {
        const r = compilePlan(
            gen({ inputs: [{ field: "nonsense", value: "@t1" }] }),
            opts(),
        );
        expect(r.issues.map((i) => i.code)).toContain("UNKNOWN_INPUT_FIELD");
    });

    it("MODALITY_MISMATCH — image handle fed by a text step", () => {
        const r = compilePlan(
            {
                dslVersion: 1,
                name: "err",
                description: "",
                steps: [
                    { id: "t1", kind: "text", text: "hello" },
                    {
                        id: "g1",
                        kind: "gen",
                        slot: "image-gen-video",
                        inputs: [{ field: "image", value: "@t1" }],
                        params: [],
                    },
                ],
            },
            opts(),
        );
        expect(r.issues.map((i) => i.code)).toContain("MODALITY_MISMATCH");
    });

    it("MISSING_REQUIRED_INPUT — image-gen with no text input", () => {
        const r = compilePlan(gen({ inputs: [] }), opts());
        expect(r.issues.map((i) => i.code)).toContain(
            "MISSING_REQUIRED_INPUT",
        );
    });

    it("DUPLICATE_ID", () => {
        const p = gen({});
        p.steps[1] = { ...p.steps[1], id: "t1" } as DirectorPlan["steps"][number];
        const r = compilePlan(p, opts());
        expect(r.issues.map((i) => i.code)).toContain("DUPLICATE_ID");
    });
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm exec vitest run src/lib/director/compile.test.ts`
Expected: all error-case tests PASS against the Task 3 implementation (it already collects these issues). Any failure means the implementation diverges — fix `compile.ts`, not the test, unless the test contradicts the real ABI topology (e.g. `image-gen`'s required fields differ) — then align the test with `getAbiTopology` output.

- [ ] **Step 3: Format and commit**

```bash
pnpm lint
git add src/lib/director/compile.test.ts src/lib/director/compile.ts
git commit -m "test(director): compiler error taxonomy coverage"
```

---

### Task 5: Vocabulary (`vocabulary.ts` + `vocabulary.server.ts`)

**Files:**
- Create: `src/lib/director/vocabulary.ts` (pure renderer)
- Create: `src/lib/director/vocabulary.server.ts` (registry wrapper)
- Test: `src/lib/director/vocabulary.test.ts`
- Read first: `src/generated/abi/index.ts` (confirm the exported shape of `ABI_NODES` — expected: array of objects with a `nodeSlot` field, same as `config/tongflow.abi.json` `nodes`).

**Interfaces:**
- Consumes: `getAbiTopology` (handle-introspect), `SLOT_TO_NODE_TYPE` (Task 2), `isDirectorSafeSlot` (Task 10), `loadPluginsRegistry` from `@/lib/plugins/plugins-registry.server` (server wrapper only).
- Produces:

**Additional requirement from Task 10 (executed before this task):** `buildDirectorCatalog` must exclude any slot for which `isDirectorSafeSlot(slot)` is false, in addition to the installed-plugin filter. A slot the compiler cannot classify correctly must never reach the LLM's vocabulary. Add a `vocabulary.test.ts` case asserting an unsafe slot is absent even when a plugin serves it.

```typescript
// vocabulary.ts
export function renderVocabulary(slots: NodeSlot[]): string; // deterministic, sorted
// vocabulary.server.ts
export interface DirectorCatalog {
    vocab: string;
    slotDefaultPlugin: Partial<Record<string, string>>;
}
export function buildDirectorCatalog(): DirectorCatalog;
```

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/director/vocabulary.test.ts
import { describe, expect, it } from "vitest";
import { renderVocabulary } from "./vocabulary";

describe("renderVocabulary", () => {
    it("renders one line per slot with inputs, params and output", () => {
        const v = renderVocabulary(["image-gen", "image-fusion"]);
        expect(v).toContain('slot "image-gen"');
        expect(v).toContain('slot "image-fusion"');
        // image-fusion consumes an image array handle
        expect(v).toMatch(/images:\s*image\[\]/);
    });

    it("is byte-stable regardless of input order", () => {
        expect(renderVocabulary(["image-gen", "image-fusion"])).toBe(
            renderVocabulary(["image-fusion", "image-gen"]),
        );
    });

    it("skips slots without a canonical node type", () => {
        const v = renderVocabulary(["image-gen"]);
        expect(v.split("\n")).toHaveLength(1);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/director/vocabulary.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/director/vocabulary.ts
/**
 * Renders the LLM-facing slot vocabulary from ABI topology. Deterministic
 * (sorted, no timestamps) so the system-prompt block is byte-stable and the
 * Anthropic prompt cache hits across requests. See spec §7.
 */
import type { NodeSlot } from "@/generated/abi";
import {
    type FieldClass,
    getAbiTopology,
} from "@/lib/abi/handle-introspect";
import { SLOT_TO_NODE_TYPE } from "./slot-node-type";

function modality(nodeType: string): string {
    return nodeType.replace(/Node$/, "");
}

function describeConfig(fc: Extract<FieldClass, { kind: "config" }>): string {
    const t = fc.schema.type;
    return typeof t === "string" ? t : "value";
}

export function renderVocabulary(slots: NodeSlot[]): string {
    const lines: string[] = [];
    for (const slot of [...new Set(slots)].sort()) {
        if (!SLOT_TO_NODE_TYPE[slot]) continue;
        const topo = getAbiTopology(slot);
        const inputs: string[] = [];
        const params: string[] = [];
        for (const field of topo.inputOrder) {
            const fc = topo.inputs[field];
            if (!fc) continue;
            if (fc.kind === "handle") {
                inputs.push(
                    `${field}: ${modality(fc.nodeType)}${fc.array ? "[]" : ""}${
                        fc.required ? " (required)" : ""
                    }`,
                );
            } else {
                params.push(`${field}: ${describeConfig(fc)}`);
            }
        }
        const out = topo.outputs[0];
        lines.push(
            `- slot "${slot}": inputs(${inputs.join(", ")}) params(${params.join(
                ", ",
            )}) -> ${out ? modality(out.nodeType) : "none"}`,
        );
    }
    return lines.join("\n");
}
```

```typescript
// src/lib/director/vocabulary.server.ts
import "server-only";

import { ABI_NODES, type NodeSlot } from "@/generated/abi";
import { loadPluginsRegistry } from "@/lib/plugins/plugins-registry.server";
import { renderVocabulary } from "./vocabulary";

export interface DirectorCatalog {
    /** LLM-facing vocabulary block (installed slots only). */
    vocab: string;
    /** slot -> head of nodePluginMap (the default plugin). */
    slotDefaultPlugin: Partial<Record<string, string>>;
}

export function buildDirectorCatalog(): DirectorCatalog {
    const reg = loadPluginsRegistry();
    const slots: NodeSlot[] = [];
    const slotDefaultPlugin: Partial<Record<string, string>> = {};
    for (const node of ABI_NODES) {
        const slot = node.nodeSlot as NodeSlot;
        const ids = reg.nodePluginMap[slot] ?? [];
        if (ids.length > 0) {
            slots.push(slot);
            slotDefaultPlugin[slot] = ids[0];
        }
    }
    return { vocab: renderVocabulary(slots), slotDefaultPlugin };
}
```

Adjust the `ABI_NODES` iteration if the read of `src/generated/abi/index.ts` shows a different export shape (e.g. keyed object) — keep the produced interface identical.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/lib/director/vocabulary.test.ts`
Expected: PASS. (The `.server.ts` wrapper is exercised in Task 9's build gate — `server-only` makes it untestable in plain vitest, by design.)

- [ ] **Step 5: Format and commit**

```bash
pnpm lint
git add src/lib/director/vocabulary.ts src/lib/director/vocabulary.server.ts src/lib/director/vocabulary.test.ts
git commit -m "feat(director): ABI-derived vocabulary, filtered to installed plugins"
```

---

### Task 6: Orchestrator (`director.server.ts`) + Anthropic SDK

**Files:**
- Modify: `package.json` (add dependency)
- Create: `src/lib/director/director.server.ts`
- Test: `src/lib/director/director-core.test.ts` (tests the exported pure core, not the `.server` wrapper — see below)
- Create: `src/lib/director/director-core.ts` (pure retry-loop core so it is testable without `server-only`)

**Interfaces:**
- Consumes: Tasks 1, 3, 5 exports; `loadEnvStore` from `@/lib/settings/env-store.server`; `Anthropic` + `zodOutputFormat`.
- Produces (Task 7 relies on these exact names):

```typescript
// director-core.ts
export type DirectorErrorCode =
    | "INVALID_PROMPT" | "MISSING_API_KEY" | "AUTH_FAILED" | "RATE_LIMITED"
    | "PLAN_INVALID" | "MISSING_PLUGIN" | "UPSTREAM_ERROR";
export type DirectorResult =
    | { ok: true; name: string; description: string; nodes: Node[]; edges: Edge[] }
    | { ok: false; code: DirectorErrorCode; message: string; details?: CompileIssue[] };
export type PlanGenerator = (userTurns: string[]) => Promise<DirectorPlan>;
export async function generateWorkflow(
    prompt: string,
    generatePlan: PlanGenerator,
    slotDefaultPlugin: Partial<Record<string, string>>,
): Promise<DirectorResult>;
// director.server.ts
export async function runDirector(prompt: string): Promise<DirectorResult>;
```

- [ ] **Step 1: Add the SDK**

```bash
pnpm add @anthropic-ai/sdk
```

Then open `package.json` and pin the exact installed version (strip any `^`), matching repo style. Verify `zodOutputFormat` exists: `ls node_modules/@anthropic-ai/sdk/helpers/zod*` (or check `node_modules/@anthropic-ai/sdk/package.json` exports for `./helpers/zod`). It must support zod 4 (repo pins zod 4.1.8) — if the export is missing, upgrade the SDK, do not downgrade zod.

- [ ] **Step 2: Write the failing test for the pure core**

```typescript
// src/lib/director/director-core.test.ts
import { describe, expect, it } from "vitest";
import type { DirectorPlan } from "./dsl";
import { generateWorkflow } from "./director-core";

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
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/director/director-core.test.ts`
Expected: FAIL — `./director-core` not found.

- [ ] **Step 4: Implement the pure core**

```typescript
// src/lib/director/director-core.ts
/**
 * Transport-free Director core: plan generation is injected so the retry
 * loop and error taxonomy are unit-testable without the Anthropic SDK.
 */
import type { Edge, Node } from "@xyflow/react";
import { type CompileIssue, compilePlan } from "./compile";
import type { DirectorPlan } from "./dsl";

export type DirectorErrorCode =
    | "INVALID_PROMPT"
    | "MISSING_API_KEY"
    | "AUTH_FAILED"
    | "RATE_LIMITED"
    | "PLAN_INVALID"
    | "MISSING_PLUGIN"
    | "UPSTREAM_ERROR";

export type DirectorResult =
    | {
          ok: true;
          name: string;
          description: string;
          nodes: Node[];
          edges: Edge[];
      }
    | {
          ok: false;
          code: DirectorErrorCode;
          message: string;
          details?: CompileIssue[];
      };

export type PlanGenerator = (userTurns: string[]) => Promise<DirectorPlan>;

function failureFromIssues(issues: CompileIssue[]): DirectorResult {
    const onlyPluginIssues = issues.every((i) => i.code === "MISSING_PLUGIN");
    return {
        ok: false,
        code: onlyPluginIssues ? "MISSING_PLUGIN" : "PLAN_INVALID",
        message: issues
            .slice(0, 3)
            .map((i) => `${i.code}: ${i.message}`)
            .join("; "),
        details: issues,
    };
}

export async function generateWorkflow(
    prompt: string,
    generatePlan: PlanGenerator,
    slotDefaultPlugin: Partial<Record<string, string>>,
): Promise<DirectorResult> {
    const turns = [prompt];
    let lastIssues: CompileIssue[] = [];

    for (let attempt = 0; attempt < 2; attempt++) {
        const plan = await generatePlan(turns);
        const { nodes, edges, issues } = compilePlan(plan, {
            slotDefaultPlugin,
        });
        if (issues.length === 0) {
            return {
                ok: true,
                name: plan.name,
                description: plan.description,
                nodes,
                edges,
            };
        }
        lastIssues = issues;
        turns.push(
            `Your plan failed validation. Fix these problems and return a corrected plan:\n${issues
                .map((i) => `- [${i.code}] ${i.message}`)
                .join("\n")}`,
        );
    }
    return failureFromIssues(lastIssues);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run src/lib/director/director-core.test.ts`
Expected: PASS.

- [ ] **Step 6: Implement the server wrapper (Claude call + error mapping)**

```typescript
// src/lib/director/director.server.ts
import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { loadEnvStore } from "@/lib/settings/env-store.server";
import {
    type DirectorResult,
    generateWorkflow,
} from "./director-core";
import { DIRECTOR_DSL_VERSION, DirectorPlanSchema } from "./dsl";
import { buildDirectorCatalog } from "./vocabulary.server";

const RULES = `You are the TongFlow Director. Turn the user's creative intent
into a workflow plan in Director DSL v${DIRECTOR_DSL_VERSION} (JSON).

Rules:
- Steps are either {kind:"text"} literal text sources, or {kind:"gen"} with a
  "slot" chosen ONLY from the vocabulary below.
- "inputs" is an array of {field, value}. A value is "@<stepId>" (reference to
  an earlier step's output), a literal string (text fields only), or an array
  of those for array-typed fields.
- "params" is an array of {field, value} for config fields (width, height,
  duration, ...). Omit params you have no opinion about.
- Referenced steps must appear earlier in the list. Prefer independent
  parallel branches over needless chains.
- Keep prompts for generative steps in English for best model performance.

Example — "a cat and a mouse take a photo together, then make it a video":
{"dslVersion":1,"name":"Cat and mouse","description":"Photo of both, then animated",
"steps":[
 {"id":"s1","kind":"text","text":"a cute cat, cartoon style"},
 {"id":"s2","kind":"gen","slot":"image-gen","inputs":[{"field":"text","value":"@s1"}],"params":[]},
 {"id":"s3","kind":"text","text":"a cute mouse, cartoon style"},
 {"id":"s4","kind":"gen","slot":"image-gen","inputs":[{"field":"text","value":"@s3"}],"params":[]},
 {"id":"s5","kind":"gen","slot":"image-fusion","inputs":[{"field":"images","value":["@s2","@s4"]},{"field":"text","value":"cat and mouse take a photo together"}],"params":[]},
 {"id":"s6","kind":"gen","slot":"image-gen-video","inputs":[{"field":"image","value":"@s5"},{"field":"text","value":"drinking together"}],"params":[]}
]}`;

async function resolveApiKey(): Promise<string | undefined> {
    const stored = await loadEnvStore();
    return stored.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
}

function mapAnthropicError(err: unknown): DirectorResult {
    if (err instanceof Anthropic.AuthenticationError) {
        return {
            ok: false,
            code: "AUTH_FAILED",
            message: "Anthropic API key was rejected",
        };
    }
    if (err instanceof Anthropic.RateLimitError) {
        return {
            ok: false,
            code: "RATE_LIMITED",
            message: "Anthropic rate limit hit — retry shortly",
        };
    }
    return {
        ok: false,
        code: "UPSTREAM_ERROR",
        message:
            err instanceof Error ? err.message : "Anthropic request failed",
    };
}

export async function runDirector(prompt: string): Promise<DirectorResult> {
    const apiKey = await resolveApiKey();
    if (!apiKey) {
        return {
            ok: false,
            code: "MISSING_API_KEY",
            message: "Set ANTHROPIC_API_KEY in Settings",
        };
    }

    const { vocab, slotDefaultPlugin } = buildDirectorCatalog();
    const client = new Anthropic({ apiKey });

    try {
        return await generateWorkflow(
            prompt,
            async (userTurns) => {
                const response = await client.messages.parse({
                    model: "claude-opus-4-8",
                    max_tokens: 16000,
                    thinking: { type: "adaptive" },
                    system: [
                        { type: "text", text: RULES },
                        {
                            type: "text",
                            text: `Available slots:\n${vocab}`,
                            cache_control: { type: "ephemeral" },
                        },
                    ],
                    messages: userTurns.map((text) => ({
                        role: "user" as const,
                        content: text,
                    })),
                    output_config: {
                        format: zodOutputFormat(
                            DirectorPlanSchema,
                            "director_plan",
                        ),
                    },
                });
                if (!response.parsed_output) {
                    throw new Error("model returned no parsable plan");
                }
                return response.parsed_output;
            },
            slotDefaultPlugin,
        );
    } catch (err) {
        return mapAnthropicError(err);
    }
}
```

If the installed SDK's `messages.parse` option name differs (`output_config.format` vs `output_format`), follow the SDK's TypeScript types — `output_config: { format: ... }` is canonical; the compiler error will say so. Same for `zodOutputFormat`'s second argument.

- [ ] **Step 7: Typecheck, format, commit**

Run: `pnpm typecheck`
Expected: no errors (this is the only gate for the `.server.ts` file until Task 9's build).

```bash
pnpm lint
git add package.json pnpm-lock.yaml src/lib/director/director-core.ts src/lib/director/director-core.test.ts src/lib/director/director.server.ts
git commit -m "feat(director): Claude orchestrator with retry loop and error taxonomy"
```

---

### Task 7: API route (`/api/director`)

**Files:**
- Create: `src/app/api/director/route.ts`
- Test: `src/app/api/director/route.test.ts`

**Interfaces:**
- Consumes: `runDirector`, `DirectorErrorCode` (Task 6).
- Produces: `POST /api/director` per spec §9 — success `{name, description, nodes, edges}`; failure `{error: {code, message, details?}}` with the spec's status map. Task 8's UI fetches this.

- [ ] **Step 1: Write the failing test**

```typescript
// src/app/api/director/route.test.ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/director/director.server", () => ({
    runDirector: vi.fn(async (prompt: string) =>
        prompt === "boom"
            ? { ok: false, code: "PLAN_INVALID", message: "nope" }
            : {
                  ok: true,
                  name: "n",
                  description: "d",
                  nodes: [],
                  edges: [],
              },
    ),
}));

import { POST } from "./route";

function req(body: unknown): Request {
    return new Request("http://localhost/api/director", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("POST /api/director", () => {
    it("400 INVALID_PROMPT on missing prompt", async () => {
        const res = await POST(req({}) as never);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("INVALID_PROMPT");
    });

    it("400 INVALID_PROMPT on >2000 chars", async () => {
        const res = await POST(req({ prompt: "x".repeat(2001) }) as never);
        expect(res.status).toBe(400);
    });

    it("200 with workflow payload on success", async () => {
        const res = await POST(req({ prompt: "a cat" }) as never);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({
            name: "n",
            description: "d",
            nodes: [],
            edges: [],
        });
    });

    it("maps error codes to spec status", async () => {
        const res = await POST(req({ prompt: "boom" }) as never);
        expect(res.status).toBe(422);
        const json = await res.json();
        expect(json.error.code).toBe("PLAN_INVALID");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/app/api/director/route.test.ts`
Expected: FAIL — `./route` not found.

- [ ] **Step 3: Write the implementation**

```typescript
// src/app/api/director/route.ts
import { type NextRequest, NextResponse } from "next/server";
import type { DirectorErrorCode } from "@/lib/director/director-core";
import { runDirector } from "@/lib/director/director.server";

const STATUS: Record<DirectorErrorCode, number> = {
    INVALID_PROMPT: 400,
    MISSING_API_KEY: 400,
    AUTH_FAILED: 401,
    RATE_LIMITED: 429,
    PLAN_INVALID: 422,
    MISSING_PLUGIN: 422,
    UPSTREAM_ERROR: 502,
};

/**
 * POST /api/director
 * Natural-language intent -> importable workflow graph (spec §9).
 */
export async function POST(request: NextRequest) {
    let prompt: unknown;
    try {
        prompt = ((await request.json()) as { prompt?: unknown }).prompt;
    } catch {
        prompt = undefined;
    }
    if (
        typeof prompt !== "string" ||
        prompt.trim().length === 0 ||
        prompt.length > 2000
    ) {
        return NextResponse.json(
            {
                error: {
                    code: "INVALID_PROMPT",
                    message:
                        "prompt must be a non-empty string of at most 2000 characters",
                },
            },
            { status: 400 },
        );
    }

    const result = await runDirector(prompt.trim());
    if (result.ok) {
        const { ok: _ok, ...payload } = result;
        return NextResponse.json(payload);
    }
    return NextResponse.json(
        {
            error: {
                code: result.code,
                message: result.message,
                details: result.details,
            },
        },
        { status: STATUS[result.code] },
    );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/app/api/director/route.test.ts`
Expected: PASS. (If vitest chokes on the `next/server` import, add `// @vitest-environment node` at the top of the test file; the repo's other tests run in node env already.)

- [ ] **Step 5: Format and commit**

```bash
pnpm lint
git add src/app/api/director/route.ts src/app/api/director/route.test.ts
git commit -m "feat(director): /api/director route with spec error contract"
```

---

### Task 8: Canvas UI (prompt panel, confirm-replace, i18n)

**Files:**
- Vendor: `src/components/ai-elements/prompt-input.tsx` (via CLI, not hand-written)
- Create: `src/components/workspace/director-prompt.tsx`
- Modify: `src/components/workspace/workspace.tsx` (mount `<DirectorPrompt />`)
- Modify: `src/i18n/messages/en.json`, `zh.json`, `ja.json`, `ko.json` (new top-level `Director` namespace)

**Interfaces:**
- Consumes: `POST /api/director` (Task 7), `parseWorkflowImportJson` from `@/lib/workflow/exporter`, `useFlow` from `@/hooks/use-flow`, AI Elements `PromptInput`.
- Produces: `<DirectorPrompt />` default-exported component, self-positioned (absolute, top-center).

- [ ] **Step 1: Vendor the AI Elements prompt input**

```bash
npx ai-elements@latest add prompt-input
```

Then open `src/components/ai-elements/prompt-input.tsx` and note the exact exported names (expected: `PromptInput`, `PromptInputTextarea`, `PromptInputSubmit`, plus a message type whose `text` field carries the input). If the CLI asks about the components path, accept the default from `components.json`. If it installs extra dependencies, keep them (they are part of the vendored component).

- [ ] **Step 2: Add i18n keys (all four locales)**

Add a top-level `"Director"` object to each messages file, sibling of `"Workspace"`:

`en.json`:
```json
"Director": {
    "open": "Director",
    "placeholder": "Describe what you want to create…",
    "applied": "Workflow generated — review it, then run",
    "replaceTitle": "Replace current canvas?",
    "replaceDescription": "The generated workflow will replace all nodes currently on the canvas.",
    "replaceConfirm": "Replace",
    "replaceCancel": "Cancel",
    "errors": {
        "INVALID_PROMPT": "Please enter a prompt.",
        "MISSING_API_KEY": "Add ANTHROPIC_API_KEY in Settings first.",
        "AUTH_FAILED": "The Anthropic API key is invalid.",
        "RATE_LIMITED": "Rate limited — try again shortly.",
        "PLAN_INVALID": "Could not build a valid workflow. Try rephrasing.",
        "MISSING_PLUGIN": "A required plugin is not installed.",
        "UPSTREAM_ERROR": "The AI service is unreachable. Try again."
    }
}
```

`zh.json`:
```json
"Director": {
    "open": "导演",
    "placeholder": "描述你想创作的内容…",
    "applied": "工作流已生成 — 请检查后运行",
    "replaceTitle": "替换当前画布？",
    "replaceDescription": "生成的工作流将替换画布上现有的所有节点。",
    "replaceConfirm": "替换",
    "replaceCancel": "取消",
    "errors": {
        "INVALID_PROMPT": "请输入提示词。",
        "MISSING_API_KEY": "请先在设置中添加 ANTHROPIC_API_KEY。",
        "AUTH_FAILED": "Anthropic API 密钥无效。",
        "RATE_LIMITED": "请求过于频繁，请稍后再试。",
        "PLAN_INVALID": "无法生成有效的工作流，请换个说法。",
        "MISSING_PLUGIN": "缺少所需插件。",
        "UPSTREAM_ERROR": "AI 服务不可用，请重试。"
    }
}
```

`ja.json`:
```json
"Director": {
    "open": "ディレクター",
    "placeholder": "作りたいものを説明してください…",
    "applied": "ワークフローを生成しました — 確認してから実行してください",
    "replaceTitle": "現在のキャンバスを置き換えますか？",
    "replaceDescription": "生成されたワークフローがキャンバス上のすべてのノードを置き換えます。",
    "replaceConfirm": "置き換える",
    "replaceCancel": "キャンセル",
    "errors": {
        "INVALID_PROMPT": "プロンプトを入力してください。",
        "MISSING_API_KEY": "先に設定で ANTHROPIC_API_KEY を追加してください。",
        "AUTH_FAILED": "Anthropic API キーが無効です。",
        "RATE_LIMITED": "レート制限中です。しばらくしてから再試行してください。",
        "PLAN_INVALID": "有効なワークフローを生成できませんでした。言い換えてみてください。",
        "MISSING_PLUGIN": "必要なプラグインがインストールされていません。",
        "UPSTREAM_ERROR": "AI サービスに接続できません。再試行してください。"
    }
}
```

`ko.json`:
```json
"Director": {
    "open": "디렉터",
    "placeholder": "만들고 싶은 것을 설명해 주세요…",
    "applied": "워크플로가 생성되었습니다 — 확인 후 실행하세요",
    "replaceTitle": "현재 캔버스를 교체할까요?",
    "replaceDescription": "생성된 워크플로가 캔버스의 모든 노드를 교체합니다.",
    "replaceConfirm": "교체",
    "replaceCancel": "취소",
    "errors": {
        "INVALID_PROMPT": "프롬프트를 입력해 주세요.",
        "MISSING_API_KEY": "먼저 설정에서 ANTHROPIC_API_KEY를 추가하세요.",
        "AUTH_FAILED": "Anthropic API 키가 유효하지 않습니다.",
        "RATE_LIMITED": "요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
        "PLAN_INVALID": "유효한 워크플로를 만들지 못했습니다. 다르게 표현해 보세요.",
        "MISSING_PLUGIN": "필요한 플러그인이 설치되어 있지 않습니다.",
        "UPSTREAM_ERROR": "AI 서비스에 연결할 수 없습니다. 다시 시도하세요."
    }
}
```

- [ ] **Step 3: Write the component**

```tsx
// src/components/workspace/director-prompt.tsx
"use client";

/**
 * Director prompt panel: intent in, workflow graph out (Gate 1).
 * The result is applied through the same path as the bundled example
 * loader — parseWorkflowImportJson + useFlow setters. Never auto-runs.
 */
import { Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useFlow } from "@/hooks/use-flow";
import { parseWorkflowImportJson } from "@/lib/workflow/exporter";

interface DirectorSuccess {
    name: string;
    description: string;
    nodes: unknown[];
    edges: unknown[];
}

type Status = "ready" | "submitted" | "error";

export default function DirectorPrompt() {
    const t = useTranslations("Director");
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<Status>("ready");
    const [pending, setPending] = useState<DirectorSuccess | null>(null);

    const apply = useCallback(
        (result: DirectorSuccess) => {
            const parsed = parseWorkflowImportJson(result);
            const flow = useFlow.getState();
            flow.setNodes(parsed.nodes);
            flow.setEdges(parsed.edges);
            if (parsed.name) flow.setWorkflowName(parsed.name);
            if (parsed.description) {
                flow.setWorkflowDescription(parsed.description);
            }
            toast.success(t("applied"));
            setPending(null);
            setOpen(false);
        },
        [t],
    );

    const submit = useCallback(
        async (text: string) => {
            if (!text.trim() || status === "submitted") return;
            setStatus("submitted");
            try {
                const res = await fetch("/api/director", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ prompt: text }),
                });
                const json = (await res.json()) as
                    | DirectorSuccess
                    | { error: { code: string; message: string } };
                if (!res.ok || "error" in json) {
                    const code =
                        "error" in json ? json.error.code : "UPSTREAM_ERROR";
                    toast.error(t(`errors.${code}`));
                    setStatus("error");
                    return;
                }
                setStatus("ready");
                if (useFlow.getState().nodes.length > 0) {
                    setPending(json);
                } else {
                    apply(json);
                }
            } catch {
                toast.error(t("errors.UPSTREAM_ERROR"));
                setStatus("error");
            }
        },
        [apply, status, t],
    );

    return (
        <>
            <div className="absolute left-1/2 top-5 z-20 -translate-x-1/2">
                {open ? (
                    <div className="w-[560px] rounded-xl border bg-background shadow-lg">
                        <div className="flex items-center justify-between px-3 pt-2">
                            <span className="flex items-center gap-1.5 text-sm font-medium">
                                <Sparkles className="h-4 w-4" />
                                {t("open")}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setOpen(false)}
                                disabled={status === "submitted"}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <PromptInput
                            onSubmit={(message, event) => {
                                event.preventDefault();
                                void submit(message.text ?? "");
                            }}
                        >
                            <PromptInputTextarea
                                placeholder={t("placeholder")}
                                disabled={status === "submitted"}
                            />
                            <PromptInputSubmit
                                status={
                                    status === "submitted"
                                        ? "submitted"
                                        : undefined
                                }
                                disabled={status === "submitted"}
                            />
                        </PromptInput>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-1.5 rounded-full shadow"
                        onClick={() => setOpen(true)}
                    >
                        <Sparkles className="h-4 w-4" />
                        {t("open")}
                    </Button>
                )}
            </div>

            <AlertDialog
                open={pending !== null}
                onOpenChange={(v) => {
                    if (!v) setPending(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("replaceTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("replaceDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t("replaceCancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (pending) apply(pending);
                            }}
                        >
                            {t("replaceConfirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
```

Reconcile the `PromptInput` props with the vendored file from Step 1 (`onSubmit` message shape, `status` prop values) — the vendored source is authoritative; keep this component's behavior identical.

Also verify `useFlow` exposes `setNodes`, `setEdges`, `setWorkflowName`, `setWorkflowDescription`, and a `nodes` array on state (they are used exactly this way in `src/components/workspace/workspace.tsx` around lines 305–337) — adjust the state reads if the store shape differs.

- [ ] **Step 4: Mount it in the workspace**

In `src/components/workspace/workspace.tsx`, import and render next to the existing absolute-positioned overlays (after the top-left cluster `<div className="absolute left-5 top-5 …">`):

```tsx
import DirectorPrompt from "./director-prompt";
// … inside the root relative container, alongside the other overlays:
<DirectorPrompt />
```

- [ ] **Step 5: Verify in the running app**

Run: `pnpm typecheck` — expected: clean.
Start the dev server (`pnpm dev`, port 3000) and check:
1. The "Director" pill shows top-center; opens the panel; Esc/X closes.
2. Without `ANTHROPIC_API_KEY`: submitting shows the `MISSING_API_KEY` toast.
3. With the key set in Settings: prompt "a cat and a mouse take a photo together, then make it a video" → confirm-replace dialog (example workflow is on canvas) → graph appears laid out left-to-right; nodes show implementation dropdowns (Z-Image Turbo etc.); nothing executes.
4. Locale switch (globe icon) shows the translated strings.

- [ ] **Step 6: Format and commit**

```bash
pnpm lint
git add src/components/ai-elements src/components/workspace/director-prompt.tsx src/components/workspace/workspace.tsx src/i18n/messages package.json pnpm-lock.yaml
git commit -m "feat(director): canvas prompt panel with confirm-replace gate"
```

---

### Task 9: Full gates + acceptance

**Files:**
- Modify: only what the gates force.

- [ ] **Step 1: Run all repo gates**

```bash
pnpm lint:check
pnpm typecheck
pnpm test
pnpm build
```

Expected: all pass. `pnpm build` additionally exercises `vocabulary.server.ts` / `director.server.ts` server-boundary imports that vitest does not.

- [ ] **Step 2: Manual acceptance (spec §11)**

With demo plugins installed and `ANTHROPIC_API_KEY` set: prompt
"một con mèo và một con chuột chụp ảnh chung rồi làm thành video" → canvas
shows a graph equivalent to `public/example.json` (2 text sources → 2
image-gens → fusion → image-gen-video); pressing the existing run button
executes it. Confirm the Director never triggered execution on its own.

- [ ] **Step 3: Commit any gate fixes**

```bash
git add -A
git commit -m "chore(director): pass lint/typecheck/test/build gates"
```

---

### Task 10: Safe-slot allowlist + compiler polish

> **Execution order:** dispatched immediately after Task 3, before Task 4. Numbered 10 only to avoid renumbering tasks already referenced elsewhere.

**Why this task exists.** `compile.ts` classifies each ABI input field (handle vs config, upstream `nodeType`, `array`, `manual`) from `getAbiTopology` plus two override tables. But ~30 node components declare their real classification in an **inline `sourceSpec` JSX prop** that the shared `NODE_TYPE_SOURCE_SPEC` registry does not carry, and a server-side compiler cannot read JSX. For those slots the compiler silently guesses. Two confirmed consequences: six slots (`subtitle_remove`, `remove_watermark`, `denoise_audio`, `convert_voice`, `parse-document`, `arrange-group`) resolve their asset field to `imageNode` when the component declares video/audio/file, so a legal plan is rejected with a bogus `MODALITY_MISMATCH`; and ~24 `batchOn` fields resolve to `array: false`, so multi-reference plans hit a bogus `ARITY_MISMATCH`.

The fix for v0 is **not** to mirror those components (a hand-copy that drifts and already produced 6 wrong rows in one attempt), and **not** to refactor the components onto the shared registry (right long-term, but ~30 files of live canvas wiring — its own PR). It is to make the Director offer **only** the slots it can classify correctly, and to make that allowlist self-policing by deriving its required exclusions from the component files themselves.

**Files:**
- Create: `src/lib/director/safe-slots.ts`
- Test: `src/lib/director/safe-slots.test.ts`
- Modify: `src/lib/director/compile.ts` (four polish items below)
- Test: `src/lib/director/compile.test.ts` (append cases for the polish items)

**Interfaces:**
- Consumes: `SLOT_TO_NODE_TYPE` (Task 2); `LOCAL_SOURCE_SPEC_OVERRIDES`, `IDS_KEYED_NODE_TYPES` (Task 3, already exported); `NODE_TYPE_SOURCE_SPEC` from `@/lib/abi/node-feature-registry`.
- Produces (Task 5 imports these verbatim):

```typescript
export const DIRECTOR_EXCLUDED_SLOTS: ReadonlySet<string>;
export function isDirectorSafeSlot(slot: string): boolean;
```

`isDirectorSafeSlot` returns true when the slot has a canonical node type in `SLOT_TO_NODE_TYPE` **and** is not in `DIRECTOR_EXCLUDED_SLOTS`. `safe-slots.ts` stays pure (no I/O, no `server-only`) — the filesystem scan lives in the test, not the module.

- [ ] **Step 1: Write the failing guard test (the self-policing part)**

This test is the point of the task: it reads the real component files, so a component that gains or changes an inline `sourceSpec` fails here instead of silently producing a broken graph.

```typescript
// src/lib/director/safe-slots.test.ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import { LOCAL_SOURCE_SPEC_OVERRIDES } from "./compile";
import { DIRECTOR_EXCLUDED_SLOTS, isDirectorSafeSlot } from "./safe-slots";
import { SLOT_TO_NODE_TYPE } from "./slot-node-type";

const NODES_DIR = "src/components/workspace/nodes";

function tsxFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        if (statSync(p).isDirectory()) out.push(...tsxFiles(p));
        else if (entry.endsWith(".tsx")) out.push(p);
    }
    return out;
}

/** slot -> true when its component declares any sourceSpec override. */
function slotsWithComponentSourceSpec(): Map<string, string> {
    const found = new Map<string, string>();
    for (const file of tsxFiles(NODES_DIR)) {
        const src = readFileSync(file, "utf8");
        if (!src.includes("sourceSpec")) continue;
        const m = src.match(/feature=["']([a-z0-9_-]+)["']/i);
        if (m) found.set(m[1], file);
    }
    return found;
}

describe("director safe slots", () => {
    it("every slot whose component declares a sourceSpec is either modelled or excluded", () => {
        const modelledNodeTypes = new Set([
            ...Object.keys(NODE_TYPE_SOURCE_SPEC),
            ...Object.keys(LOCAL_SOURCE_SPEC_OVERRIDES),
        ]);
        const unguarded: string[] = [];
        for (const [slot, file] of slotsWithComponentSourceSpec()) {
            const nodeType = SLOT_TO_NODE_TYPE[slot as never];
            const modelled =
                nodeType !== undefined && modelledNodeTypes.has(nodeType);
            if (!modelled && !DIRECTOR_EXCLUDED_SLOTS.has(slot)) {
                unguarded.push(`${slot} (${file})`);
            }
        }
        expect(unguarded).toEqual([]);
    });

    it("scans a plausible number of component files", () => {
        // Guards against the scan silently matching nothing (wrong path, rename).
        expect(slotsWithComponentSourceSpec().size).toBeGreaterThan(10);
    });

    it("keeps the demo path safe", () => {
        for (const slot of [
            "image-gen",
            "image-fusion",
            "image-gen-video",
            "gen-text",
        ]) {
            expect(isDirectorSafeSlot(slot)).toBe(true);
        }
    });

    it("rejects slots with no canonical node type", () => {
        expect(isDirectorSafeSlot("not-a-real-slot")).toBe(false);
    });

    it("excludes the known mis-classified slots", () => {
        for (const slot of [
            "subtitle_remove",
            "remove_watermark",
            "denoise_audio",
            "convert_voice",
            "parse-document",
            "arrange-group",
        ]) {
            expect(isDirectorSafeSlot(slot)).toBe(false);
        }
    });
});
```

- [ ] **Step 2: Run it to verify RED**

Run: `pnpm exec vitest run src/lib/director/safe-slots.test.ts`
Expected: FAIL — `./safe-slots` not found.

- [ ] **Step 3: Implement `safe-slots.ts`**

Write the module with `DIRECTOR_EXCLUDED_SLOTS` and `isDirectorSafeSlot` as specified in Interfaces. Populate `DIRECTOR_EXCLUDED_SLOTS` by **running the guard test and adding exactly the slots it reports as unguarded** — do not guess the list, and do not add a slot the guard does not demand. Each entry needs no per-slot comment; one module-level comment explaining the mechanism (component inline `sourceSpec` invisible to the server; excluded until modelled or until the components move onto the shared registry) is enough.

- [ ] **Step 4: Verify GREEN and that the guard bites**

Run: `pnpm exec vitest run src/lib/director/safe-slots.test.ts` — all pass.
Then prove the guard is real: temporarily delete one entry from `DIRECTOR_EXCLUDED_SLOTS`, re-run, observe the first test fail naming that slot and its component file, restore it.

- [ ] **Step 5: Compiler polish — four review findings**

All four are in `compile.ts`; each gets a test in `compile.test.ts`.

1. **`params` on a `manual` handle field must be accepted.** Today the params loop requires `fc.kind === "config"`, so putting `image-fusion`'s caption in `params` yields `UNKNOWN_INPUT_FIELD: "text" is not a config field of image-fusion` — false, since a `manual` handle field is exactly a form value. Accept `kind === "config"` **or** (`kind === "handle"` and `manual`), writing the literal into `data[field]`. Test: a plan putting `text` in `params` for `image-fusion` produces no issues and sets `data.text`.

2. **`data.texts` must not merge literals across different text handle fields.** `knownTexts` currently flattens every wired literal into one array, so a slot with two promoted text handles (`gen-music`: `tags` and `lyrics`) loses which is which. Seed `data.texts` only from the field whose `FieldClass.path` is `texts`/`texts[0]`; write other text handle literals under their own field name. Test: a `gen-music` plan with literals on both fields keeps them distinguishable.

3. **The `LOCAL_SOURCE_SPEC_OVERRIDES` guard must fail cleanly on a renamed field.** It dereferences `resolveSpec(...).fields[field].kind` without a presence check, so a component field rename throws `TypeError` instead of reporting drift. Add the presence check and assert a readable message.

4. **`ARITY_MISMATCH` must be reachable on config fields.** The config branch currently returns `REF_ON_CONFIG_FIELD` for both a ref and a multi-value array, so `{field:"width", value:["1","2"]}` reports the wrong code. Split the two conditions. Test: an array value on a genuine config field yields `ARITY_MISMATCH`, a ref still yields `REF_ON_CONFIG_FIELD`.

- [ ] **Step 6: Full verification**

```bash
pnpm exec vitest run src/lib/director/
pnpm exec biome check --error-on-warnings .
pnpm exec tsc --noEmit -p .
```

Expected: all pass, output pristine.

- [ ] **Step 7: Commit**

```bash
git add src/lib/director/safe-slots.ts src/lib/director/safe-slots.test.ts src/lib/director/compile.ts src/lib/director/compile.test.ts
git commit -m "feat(director): safe-slot allowlist guarded by component scan"
```

---

## Self-review notes (done at plan-writing time)

- **Spec coverage:** §4 files → Tasks 1–8 (plus `director-core.ts`, a testability split of `director.server.ts` — the spec's responsibilities are unchanged); §5 DSL → Task 1; §6 compiler → Tasks 3–4; §7 vocabulary → Task 5; §8 LLM call → Task 6; §9 route/errors → Task 7; §10 UI/i18n → Task 8; §11 tests/gates → per-task tests + Task 9; §12 setup → folded into Tasks 6 and 8.
- **Known reconciliation points** (explicitly flagged in steps, not placeholders): fusion `data.ids` seeding (Task 3 Step 0), `ABI_NODES` export shape (Task 5), SDK `zodOutputFormat`/`parse` option names (Task 6), vendored `PromptInput` prop names (Task 8). Each has a stated default and an authoritative source to check.
- **Type consistency:** `CompileIssue`/`CompileResult` (T3) consumed by T6 core; `DirectorErrorCode`/`DirectorResult` (T6) consumed by T7 route; `DirectorSuccess` in T8 mirrors T7's success payload.
