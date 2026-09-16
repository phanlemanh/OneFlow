# Skill system v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A user presses a Skill button, fills a manifest-generated form, runs a packaged workflow through the existing engine, sees per-step progress and outputs, and can open the exact graph that ran on the canvas; a second skill is added touching only its own folder.

**Architecture:** `src/lib/skills/` holds typed manifests + exporter-built templates, a pure `instantiate` that writes each parameter into both the executable and the canvas graph, and a server module that submits a `tasks` row (`feature: "skill"`) and reads runs back. `runner.ts` gains one branch that re-instantiates from the task prompt and hands the executable to the unchanged engine delegate. The panel in the workspace left nav reuses the presentational components built at S1-D.

**Tech Stack:** Next.js 16 route handlers · drizzle + better-sqlite3 · vitest (node + jsdom) · next-intl · shadcn primitives · bash measurement scripts · Python engine unchanged.

**Gate 1.5:** duyệt 2026-09-16 — Mạnh dán dòng /goal theo lời mời duyệt kế hoạch.

**Spec:** `docs/superpowers/specs/2026-09-16-skill-system-v1-design.md` · contract `_acceptance/skill-system-v1/contract.md` (approved 2026-09-16) · evals `_acceptance/skill-system-v1/evals.yaml`

## Global Constraints

- Code comments in English only (CLAUDE.md).
- Engine, compiler, exporter are NOT modified: no edit under `sdk/**`, `src/lib/workflow/**`, `src/lib/director/**`, `src/lib/abi/**`.
- `tasks.prompt` for a skill run holds exactly `{skillId, skillVersion, params}` — no executable, no routing (CLAUDE.md wire shape).
- No DB schema change, no migration.
- Concurrency ceiling: 3 tasks in `pending|processing` (same as `/api/workflow/execute`).
- Parameter reason codes are the closed set `required · type · range · option · unknown`, exported as `SKILL_PARAM_REASONS` from `src/lib/skills/params.ts`; the UI translates codes via `Skills.invalid.<code>`.
- The panel never shows slot names, plugin ids, ABI, executable or taskId; a missing plugin is named by the STEP label `Skills.skills.<id>.steps.<slot>`.
- Tests touching the DB set `TONGFLOW_DATA_DIR` to a fresh `mkdtemp` dir before the first `getDb()`; tests touching plugins set `TONGFLOW_PLUGINS_DIR` likewise. No test reads or writes `data/` or `plugins/` of the checkout.
- Every new measurement ships its red half on the same fixture with a pinned message (MEASURE-BIRTH-CLAUSE); a task is not done until its verify step has been run once with the product deliberately broken and seen red.
- Commit ordering for AC-12: Tasks 1–7 build the frame with ONE skill (`cat-canh-video`). Task 8 adds `tach-tieng-video` in a commit touching only `src/lib/skills/tach-tieng-video/**` and one added `export … from` line in `src/lib/skills/registry.ts` (i18n for it already exists since S1). Anything that names the second skill (E7b test, E8 script) lands in a LATER commit (Task 9).
- `pnpm lint:check`, `pnpm typecheck` pass at the end of every task.

## File map

| File | Responsibility |
|---|---|
| `src/lib/skills/types.ts` | `SkillManifest`, `SkillParam`, `SkillOutput`, `SkillTemplate`, `SkillParamValue` |
| `src/lib/skills/params.ts` | `SKILL_PARAM_REASONS`, `validateParams(manifest, raw)` |
| `src/lib/skills/registry.ts` | one `export { skill as … } from "./<id>"` line per skill — nothing else |
| `src/lib/skills/catalog.ts` | `SKILLS`, `getSkill(id)` read from the registry |
| `src/lib/skills/integrity.ts` | `checkSkillIntegrity(skill, dirName)` → named rule violations |
| `src/lib/skills/instantiate.ts` | pure `instantiate(skill, params, slotDefaultPlugin)` |
| `src/lib/skills/run.server.ts` | `listSkills`, `submitSkillRun`, `readSkillRun`, `readSkillPlan` |
| `src/lib/skills/dispatch.server.ts` | `dispatchSkillTask(task)` used by the runner |
| `src/lib/skills/<id>/{manifest.ts,graph.ts,template.json,sample-params.json}` | one skill |
| `scripts/skills/build-template.ts` | graph → template.json via the real exporter |
| `src/lib/skills/test-support/*.ts` | temp data dir, fake engine stdout, graph export helper (tests only) |
| `src/app/api/skills/route.ts` | `GET` list |
| `src/app/api/skills/[id]/run/route.ts` | `POST` submit |
| `src/app/api/skills/runs/[taskId]/route.ts` | `GET` run view |
| `src/app/api/skills/runs/[taskId]/plan/route.ts` | `GET` instance graph |
| `src/lib/task/runner.ts` | one `feature === "skill"` branch |
| `src/lib/api/skills.ts` | client fetchers |
| `src/components/workspace/skills/skill-sheet.tsx` | stateful panel (list → form → run → result) |
| `src/components/workspace/skills/use-skill-run.ts` | SSE step tracking + run view polling |
| `src/components/workspace/workspace-left-nav.tsx` | Skill button |
| `scripts/skills/luot.sh` · `e2e-tach-tieng.sh` · `check-a11y-proto.sh` · `check-second-skill-paths.sh` | measurement scripts |

---

### Task 1: Types and parameter validation

`independent: false` · serves E2 (library half), E17b (reason codes)

**Files:**
- Create: `src/lib/skills/types.ts`
- Create: `src/lib/skills/params.ts`
- Test: `src/lib/skills/params.test.ts`

**Interfaces:**
- Produces: `SkillManifest`, `SkillParam`, `SkillOutput`, `SkillTemplate`, `SkillDefinition = {manifest, template, sampleParams}`, `SkillParamValue`, `SKILL_PARAM_REASONS`, `type SkillParamReason`, `validateParams(manifest: SkillManifest, raw: unknown): {ok: true; params: Record<string, SkillParamValue>} | {ok: false; errors: {param: string; reason: SkillParamReason}[]}`

- [ ] **Step 1: Write types**

```ts
// src/lib/skills/types.ts
import type { NodeSlot } from "@/generated/abi";
import type { ExecutableWorkflow } from "@/lib/workflow/executable-workflow";

export type SkillFileType = "video" | "image" | "audio";
export type SkillParamType = "text" | "number" | "enum" | SkillFileType;

/** Where a parameter value lands in the template. */
export type SkillParamTarget =
    | { kind: "input"; name: string }
    | { kind: "config"; nodeId: string; field: string };

export interface SkillParam {
    key: string;
    type: SkillParamType;
    required: boolean;
    default?: string | number;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
    target: SkillParamTarget;
}

export interface SkillOutput {
    key: string;
    type: "video" | "audio" | "image" | "text";
    /** Name of a WorkflowOutput in the template's executable. */
    from: string;
}

export interface SkillManifest {
    id: string;
    version: string;
    requires: NodeSlot[];
    params: SkillParam[];
    outputs: SkillOutput[];
    /** Declared from v1 so a later ingest side effect is not a major bump. */
    sideEffects: readonly never[];
}

export interface SkillTemplate {
    originalFlow: ExecutableWorkflow["originalFlow"];
    executable: ExecutableWorkflow;
}

export interface SkillFileValue {
    fileKey: string;
    name: string;
}

export type SkillParamValue = string | number | SkillFileValue;

export interface SkillDefinition {
    manifest: SkillManifest;
    template: SkillTemplate;
    sampleParams: Record<string, SkillParamValue>;
}
```

- [ ] **Step 2: Write the failing test** — five-class matrix derived from `SKILL_PARAM_REASONS`

```ts
// src/lib/skills/params.test.ts
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
        { key: "video", type: "video", required: true, target: { kind: "input", name: "input_v1" } },
        { key: "n", type: "number", required: false, min: 5, max: 60, target: { kind: "config", nodeId: "s1", field: "threshold" } },
        { key: "mode", type: "enum", required: false, options: ["a", "b"], target: { kind: "config", nodeId: "s1", field: "mode" } },
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
        expect(Object.keys(CASES).sort()).toEqual([...SKILL_PARAM_REASONS].sort());
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
        const r = validateParams({ ...M, params: M.params.map((p) => (p.key === "n" ? { ...p, default: 20 } : p)) }, { video: VIDEO });
        expect(r).toEqual({ ok: true, params: { video: VIDEO, n: 20 } });
    });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run src/lib/skills/params.test.ts`
Expected: FAIL — cannot resolve `./params`.

- [ ] **Step 4: Implement**

```ts
// src/lib/skills/params.ts
import type { SkillManifest, SkillParam, SkillParamValue } from "./types";

export const SKILL_PARAM_REASONS = ["required", "type", "range", "option", "unknown"] as const;
export type SkillParamReason = (typeof SKILL_PARAM_REASONS)[number];

export type ParamValidation =
    | { ok: true; params: Record<string, SkillParamValue> }
    | { ok: false; errors: { param: string; reason: SkillParamReason }[] };

function isFileValue(v: unknown): v is { fileKey: string; name: string } {
    return (
        typeof v === "object" && v !== null &&
        typeof (v as { fileKey?: unknown }).fileKey === "string" &&
        (v as { fileKey: string }).fileKey.trim() !== "" &&
        typeof (v as { name?: unknown }).name === "string"
    );
}

function check(p: SkillParam, v: unknown): SkillParamReason | null {
    switch (p.type) {
        case "video":
        case "image":
        case "audio":
            return isFileValue(v) ? null : "type";
        case "text":
            return typeof v === "string" ? null : "type";
        case "number":
            if (typeof v !== "number" || !Number.isFinite(v)) return "type";
            if ((p.min !== undefined && v < p.min) || (p.max !== undefined && v > p.max)) return "range";
            return null;
        case "enum":
            if (typeof v !== "string") return "type";
            return (p.options ?? []).includes(v) ? null : "option";
    }
}

export function validateParams(manifest: SkillManifest, raw: unknown): ParamValidation {
    const input = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
    const errors: { param: string; reason: SkillParamReason }[] = [];
    const params: Record<string, SkillParamValue> = {};
    const known = new Set(manifest.params.map((p) => p.key));
    for (const key of Object.keys(input)) {
        if (!known.has(key)) errors.push({ param: key, reason: "unknown" });
    }
    for (const p of manifest.params) {
        const present = input[p.key] !== undefined && input[p.key] !== "";
        if (!present) {
            if (p.default !== undefined) params[p.key] = p.default;
            else if (p.required) errors.push({ param: p.key, reason: "required" });
            continue;
        }
        const reason = check(p, input[p.key]);
        if (reason) errors.push({ param: p.key, reason });
        else params[p.key] = input[p.key] as SkillParamValue;
    }
    return errors.length > 0 ? { ok: false, errors } : { ok: true, params };
}
```

- [ ] **Step 5: Run test to verify it passes, then break it once**

Run: `pnpm vitest run src/lib/skills/params.test.ts` → PASS.
Red half: comment out the `unknown` loop → rerun → FAIL on `rejects with reason unknown` with message `case unknown passed`. Restore.

- [ ] **Step 6: Commit**

```bash
git add src/lib/skills/types.ts src/lib/skills/params.ts src/lib/skills/params.test.ts
git commit -m "feat(skills): manifest types and closed-set parameter validation"
```

---

### Task 2: First skill, template builder, registry and integrity check

`independent: false` · serves E1

**Files:**
- Create: `src/lib/skills/test-support/export-graph.ts` (registers ABI nodes, calls exporter, unregisters — shared by the build script and tests)
- Create: `scripts/skills/build-template.ts`
- Create: `src/lib/skills/cat-canh-video/{graph.ts,manifest.ts,template.json,sample-params.json}`
- Create: `src/lib/skills/registry.ts`, `src/lib/skills/catalog.ts`, `src/lib/skills/integrity.ts`
- Test: `src/lib/skills/registry.test.ts`
- Modify: `package.json` scripts: `"skills:build": "tsx scripts/skills/build-template.ts"`

**Interfaces:**
- Consumes: Task 1 types.
- Produces: `exportGraph(nodes, edges, name): ExecutableWorkflow` · `normalizeExecutable(wf): unknown` (JSON round-trip, `exportedAt` dropped) · `SKILLS: readonly SkillDefinition[]` and `getSkill(id): SkillDefinition | undefined` (from `catalog.ts`) · `checkSkillIntegrity(dir, def): {rule: string; detail: string}[]` with rule names `id-matches-dir`, `version-semver`, `requires-equals-template-slots`, `param-target-exists`, `output-from-exists`, `template-matches-exporter`.

- [ ] **Step 1: Graph helper (tests + script share it)**

```ts
// src/lib/skills/test-support/export-graph.ts
import type { Edge, Node } from "@xyflow/react";
import { NODE_TYPE_SOURCE_SPEC, NODE_TYPE_TO_ABI_FEATURE } from "@/lib/abi/node-feature-registry";
import { registerAbiNode, unregisterAbiNode } from "@/lib/abi/node-registry";
import { exportWorkflow } from "@/lib/workflow/exporter";
import type { ExecutableWorkflow } from "@/lib/workflow/executable-workflow";

/**
 * Export a graph with the REAL exporter, mirroring the mount-time ABI
 * registration the canvas performs. Synchronous register → export →
 * unregister, so nothing else observes the registry in between.
 */
export function exportGraph(nodes: Node[], edges: Edge[], name: string): ExecutableWorkflow {
    const registered: string[] = [];
    for (const n of nodes) {
        const t = n.type as keyof typeof NODE_TYPE_TO_ABI_FEATURE;
        if (!(t in NODE_TYPE_TO_ABI_FEATURE)) continue;
        registerAbiNode({
            nodeId: n.id,
            feature: NODE_TYPE_TO_ABI_FEATURE[t],
            sourceSpec: NODE_TYPE_SOURCE_SPEC[t as keyof typeof NODE_TYPE_SOURCE_SPEC],
        });
        registered.push(n.id);
    }
    try {
        return exportWorkflow(nodes, edges, { name });
    } finally {
        for (const id of registered) unregisterAbiNode(id);
    }
}

/** Comparable form: JSON round-trip (drops undefined) without exportedAt. */
export function normalizeExecutable(wf: ExecutableWorkflow): unknown {
    const { exportedAt: _ignored, ...rest } = wf;
    return JSON.parse(JSON.stringify(rest));
}
```

If `NODE_TYPE_SOURCE_SPEC`'s key type differs, adapt the cast to the registry's actual exported types — do not edit `node-feature-registry.ts`.

- [ ] **Step 2: First skill graph + manifest**

```ts
// src/lib/skills/cat-canh-video/graph.ts
import type { Edge, Node } from "@xyflow/react";

export const nodes: Node[] = [
    { id: "v1", type: "videoNode", position: { x: 0, y: 0 }, data: {} },
    { id: "s1", type: "splitVideoNode", position: { x: 400, y: 0 }, data: { threshold: 20, pluginId: "" } },
];
export const edges: Edge[] = [
    { id: "e-v1-s1", source: "v1", sourceHandle: "out:videoNode", target: "s1", targetHandle: "in:video" },
];
```

```ts
// src/lib/skills/cat-canh-video/manifest.ts
import type { SkillManifest } from "../types";

export const manifest: SkillManifest = {
    id: "cat-canh-video",
    version: "1.0.0",
    requires: ["split-video"],
    sideEffects: [],
    params: [
        { key: "video", type: "video", required: true, target: { kind: "input", name: "input_v1" } },
        { key: "do-nhay", type: "number", required: false, default: 20, min: 5, max: 60, step: 1, target: { kind: "config", nodeId: "s1", field: "threshold" } },
    ],
    outputs: [{ key: "cac-canh", type: "video", from: "output_s1" }],
};
```

`sample-params.json`: `{"video": {"fileKey": "sample/tour.mp4", "name": "tour.mp4"}, "do-nhay": 27}`

If the exporter names the input or output differently than `input_v1` / `output_s1`, run Step 3 first and set `target.name` / `from` to the names it actually emits — the integrity test (Step 5) is what proves they match.

- [ ] **Step 3: Build script**

```ts
// scripts/skills/build-template.ts
// Usage: pnpm skills:build <skill-id>
import { writeFileSync } from "node:fs";
import path from "node:path";
import { exportGraph } from "../../src/lib/skills/test-support/export-graph";

const id = process.argv[2];
if (!id) {
    console.error("usage: skills:build <skill-id>");
    process.exit(2);
}
const dir = path.join(__dirname, "..", "..", "src", "lib", "skills", id);
const { nodes, edges } = await import(path.join(dir, "graph.ts"));
const executable = exportGraph(nodes, edges, id);
writeFileSync(
    path.join(dir, "template.json"),
    `${JSON.stringify({ originalFlow: executable.originalFlow, executable }, null, 4)}\n`,
);
console.log(`[skills:build] wrote ${path.relative(process.cwd(), path.join(dir, "template.json"))}`);
```

Run: `pnpm skills:build cat-canh-video` → writes `template.json`. If `tsx` cannot resolve `@/` aliases, run with `tsx --tsconfig tsconfig.json`; the path must derive from `__dirname`, never a hardcoded root.

- [ ] **Step 4: Registry + integrity**

The registry is a file of re-export lines only — one line per skill — so adding a skill is exactly one added line in `registry.ts` (AC-12). Lookup lives next to it in `catalog.ts`.

```ts
// src/lib/skills/registry.ts
// One line per skill. Nothing else belongs in this file: the platform-proof
// guard (scripts/skills/check-second-skill-paths.sh) counts added lines here.
export { skill as catCanhVideo } from "./cat-canh-video";
```

```ts
// src/lib/skills/catalog.ts
import * as REGISTRY from "./registry";
import type { SkillDefinition } from "./types";

export const SKILLS: readonly SkillDefinition[] = Object.values(REGISTRY);

export function getSkill(id: string): SkillDefinition | undefined {
    return SKILLS.find((s) => s.manifest.id === id);
}
```

`src/lib/skills/cat-canh-video/index.ts`:

```ts
import type { SkillDefinition, SkillTemplate } from "../types";
import { manifest } from "./manifest";
import sampleParams from "./sample-params.json";
import template from "./template.json";

export const skill: SkillDefinition = {
    manifest,
    template: template as unknown as SkillTemplate,
    sampleParams,
};
```

`src/lib/skills/integrity.ts`:

```ts
import { exportGraph, normalizeExecutable } from "./test-support/export-graph";
import type { SkillDefinition } from "./types";

export interface IntegrityViolation { rule: string; detail: string }

const SEMVER = /^\d+\.\d+\.\d+$/;

export function checkSkillIntegrity(dir: string, def: SkillDefinition): IntegrityViolation[] {
    const { manifest, template } = def;
    const out: IntegrityViolation[] = [];
    const wf = template.executable;
    if (manifest.id !== dir) out.push({ rule: "id-matches-dir", detail: `${manifest.id} != ${dir}` });
    if (!SEMVER.test(manifest.version)) out.push({ rule: "version-semver", detail: manifest.version });
    const slots = [...new Set(wf.executableNodes.map((n) => n.feature))].sort();
    if (JSON.stringify([...manifest.requires].sort()) !== JSON.stringify(slots)) {
        out.push({ rule: "requires-equals-template-slots", detail: `${manifest.requires} vs ${slots}` });
    }
    for (const p of manifest.params) {
        const ok = p.target.kind === "input"
            ? wf.inputs.some((i) => i.name === (p.target as { name: string }).name)
            : wf.executableNodes.some((n) => n.id === (p.target as { nodeId: string }).nodeId);
        if (!ok) out.push({ rule: "param-target-exists", detail: p.key });
    }
    for (const o of manifest.outputs) {
        if (!wf.outputs.some((w) => w.name === o.from)) out.push({ rule: "output-from-exists", detail: o.key });
    }
    const re = exportGraph(template.originalFlow.nodes, template.originalFlow.edges, wf.name);
    if (JSON.stringify(normalizeExecutable(re)) !== JSON.stringify(normalizeExecutable(wf))) {
        out.push({ rule: "template-matches-exporter", detail: dir });
    }
    return out;
}
```

`integrity.ts` imports the exporter and lives under `src/lib/skills/` but is imported only by tests and the build script, never by a route.

- [ ] **Step 5: Test (six rules, red half per rule)**

```ts
// src/lib/skills/registry.test.ts
import { describe, expect, it } from "vitest";
import { checkSkillIntegrity } from "./integrity";
import { SKILLS } from "./catalog";
import type { SkillDefinition } from "./types";

const clone = (d: SkillDefinition): SkillDefinition => JSON.parse(JSON.stringify(d));

const BREAKS: Record<string, (d: SkillDefinition) => { dir?: string }> = {
    "id-matches-dir": () => ({ dir: "wrong-dir" }),
    "version-semver": (d) => { d.manifest.version = "1.0"; return {}; },
    "requires-equals-template-slots": (d) => { d.manifest.requires = [...d.manifest.requires, "gen-text"] as typeof d.manifest.requires; return {}; },
    "param-target-exists": (d) => { d.manifest.params[0].target = { kind: "input", name: "input_nope" }; return {}; },
    "output-from-exists": (d) => { d.manifest.outputs[0].from = "output_nope"; return {}; },
    "template-matches-exporter": (d) => { d.template.executable.executableNodes[0].pluginId = "drifted"; return {}; },
};

describe("skill registry integrity (AC-1)", () => {
    it("has at least one skill and every skill is clean", () => {
        expect(SKILLS.length).toBeGreaterThanOrEqual(1);
        for (const s of SKILLS) {
            expect(checkSkillIntegrity(s.manifest.id, s), s.manifest.id).toEqual([]);
        }
    });
    for (const s of SKILLS) {
        for (const [rule, br] of Object.entries(BREAKS)) {
            it(`${s.manifest.id}: breaking ${rule} is caught by name`, () => {
                const d = clone(s);
                const { dir } = br(d);
                const v = checkSkillIntegrity(dir ?? d.manifest.id, d);
                expect(v.map((x) => x.rule), `${s.manifest.id} ${rule}`).toContain(rule);
            });
        }
    }
});
```

E1's `expected` says `>= 2`: at Task 2 time only one skill exists, so the floor is 1 here; Task 9 raises it to `>= 2` in a commit AFTER the second-skill commit, keeping that commit allowlist-clean.

- [ ] **Step 6: Run, break once, commit**

Run: `pnpm vitest run src/lib/skills/registry.test.ts` → PASS. Red: hand-edit `template.json` `threshold` → `template-matches-exporter` fails naming `cat-canh-video`. Restore with `pnpm skills:build cat-canh-video`.

```bash
git add package.json scripts/skills/build-template.ts src/lib/skills
git commit -m "feat(skills): first skill, exporter-built template, registry integrity check"
```

---

### Task 3: Instantiate

`independent: false` · serves E3

**Files:**
- Create: `src/lib/skills/instantiate.ts`
- Test: `src/lib/skills/instantiate.test.ts`

**Interfaces:**
- Consumes: `SkillDefinition`, `validateParams` output params, `exportGraph`, `normalizeExecutable`.
- Produces: `instantiate(def: SkillDefinition, params: Record<string, SkillParamValue>, slotDefaultPlugin: Partial<Record<string, string>>): {ok: true; instance: SkillTemplate} | {ok: false; missingSlots: string[]}`

- [ ] **Step 1: Failing test**

```ts
// src/lib/skills/instantiate.test.ts
import { describe, expect, it } from "vitest";
import { instantiate } from "./instantiate";
import { SKILLS } from "./catalog";
import { exportGraph, normalizeExecutable } from "./test-support/export-graph";

const pluginsFor = (slots: string[]) => Object.fromEntries(slots.map((s) => [s, `oneflow-api-fake-${s}`]));

describe("instantiate (AC-3)", () => {
    for (const def of SKILLS) {
        const id = def.manifest.id;
        it(`${id}: template unchanged, values in both places, plugins rebound, exporter-equivalent`, () => {
            const before = JSON.stringify(def.template);
            const r = instantiate(def, def.sampleParams, pluginsFor(def.manifest.requires));
            expect(r.ok).toBe(true);
            if (!r.ok) return;
            expect(JSON.stringify(def.template), `${id} template mutated`).toBe(before);
            const { executable, originalFlow } = r.instance;
            for (const p of def.manifest.params) {
                const v = def.sampleParams[p.key];
                if (v === undefined) continue;
                if (p.target.kind === "config") {
                    const t = p.target;
                    const exec = executable.executableNodes.find((n) => n.id === t.nodeId);
                    expect(exec?.bindings[t.field], `${id}.${p.key} executable`).toEqual({ kind: "config", value: v });
                    const node = originalFlow.nodes.find((n) => n.id === t.nodeId);
                    expect((node?.data as Record<string, unknown>)[t.field], `${id}.${p.key} canvas`).toEqual(v);
                } else {
                    const t = p.target;
                    const nodeId = def.template.executable.inputs.find((i) => i.name === t.name)?.nodeId;
                    const dn = executable.dataNodes.find((n) => n.id === nodeId);
                    expect(dn?.staticData?.fileKeys, `${id}.${p.key} executable`).toEqual([(v as { fileKey: string }).fileKey]);
                    const node = originalFlow.nodes.find((n) => n.id === nodeId);
                    expect((node?.data as Record<string, unknown>).fileKeys, `${id}.${p.key} canvas`).toEqual([(v as { fileKey: string }).fileKey]);
                }
            }
            for (const n of executable.executableNodes) {
                expect(n.pluginId, `${id}.${n.id} plugin`).toBe(`oneflow-api-fake-${n.feature}`);
            }
            const re = exportGraph(originalFlow.nodes, originalFlow.edges, executable.name);
            expect(normalizeExecutable(re), `${id} canvas != executable`).toEqual(normalizeExecutable(executable));
        });
        it(`${id}: missing plugin names the slot`, () => {
            const r = instantiate(def, def.sampleParams, {});
            expect(r).toEqual({ ok: false, missingSlots: [...def.manifest.requires].sort() });
        });
    }
});
```

- [ ] **Step 2: Run → FAIL** (`./instantiate` missing). Run: `pnpm vitest run src/lib/skills/instantiate.test.ts`

- [ ] **Step 3: Implement** — mirror exporter semantics exactly (a data node with static data is not an input; `rawConfig` mirrors node data)

```ts
// src/lib/skills/instantiate.ts
import type { SkillDefinition, SkillParamValue, SkillTemplate } from "./types";

export type InstantiateResult =
    | { ok: true; instance: SkillTemplate }
    | { ok: false; missingSlots: string[] };

/**
 * Pure: clone the template and write every parameter into BOTH the executable
 * the engine runs and the canvas graph "view/edit plan" opens. The exporter
 * equivalence test (instantiate.test.ts) is what keeps the two writes honest.
 */
export function instantiate(
    def: SkillDefinition,
    params: Record<string, SkillParamValue>,
    slotDefaultPlugin: Partial<Record<string, string>>,
): InstantiateResult {
    const missingSlots = [...new Set(def.manifest.requires)].filter((s) => !slotDefaultPlugin[s]).sort();
    if (missingSlots.length > 0) return { ok: false, missingSlots };

    const instance: SkillTemplate = structuredClone(def.template);
    const { executable } = instance;
    const nodeData = (id: string) => {
        const node = instance.originalFlow.nodes.find((n) => n.id === id);
        if (!node) throw new Error(`skill ${def.manifest.id}: no canvas node ${id}`);
        return node.data as Record<string, unknown>;
    };

    for (const p of def.manifest.params) {
        const value = params[p.key];
        if (value === undefined) continue;
        if (p.target.kind === "input") {
            const name = p.target.name;
            const input = executable.inputs.find((i) => i.name === name);
            if (!input) throw new Error(`skill ${def.manifest.id}: no input ${name}`);
            const fileKeys = typeof value === "object" ? [value.fileKey] : undefined;
            const texts = typeof value === "object" ? undefined : [String(value)];
            const dn = executable.dataNodes.find((n) => n.id === input.nodeId);
            if (dn) {
                dn.isInput = false;
                delete dn.inputName;
                dn.staticData = { fileKeys, texts };
            }
            executable.inputs = executable.inputs.filter((i) => i.name !== name);
            if (fileKeys) nodeData(input.nodeId).fileKeys = fileKeys;
            if (texts) nodeData(input.nodeId).texts = texts;
        } else {
            const { nodeId, field } = p.target;
            const exec = executable.executableNodes.find((n) => n.id === nodeId);
            if (!exec) throw new Error(`skill ${def.manifest.id}: no node ${nodeId}`);
            exec.bindings[field] = { kind: "config", value };
            if (exec.rawConfig) exec.rawConfig[field] = value;
            nodeData(nodeId)[field] = value;
        }
    }

    for (const exec of executable.executableNodes) {
        const pluginId = slotDefaultPlugin[exec.feature] as string;
        exec.pluginId = pluginId;
        if (exec.rawConfig) exec.rawConfig.pluginId = pluginId;
        nodeData(exec.id).pluginId = pluginId;
    }
    executable.originalFlow = instance.originalFlow;
    return { ok: true, instance };
}
```

The exact fields the exporter emits (key order, `staticData` shape, `rawConfig` contents, `originalFlow` being the same object) are what the equivalence assertion checks; when it fails, read the diff it prints and align THIS function with the exporter — never the other way round.

- [ ] **Step 4: Run → PASS; red half:** delete `nodeData(nodeId)[field] = value;` → equivalence assertion FAILS with `cat-canh-video canvas != executable`. Restore.

- [ ] **Step 5: Commit** — `git add src/lib/skills/instantiate.ts src/lib/skills/instantiate.test.ts && git commit -m "feat(skills): pure instantiate with exporter-equivalence guard"`

---

### Task 4: Server module and API routes

`independent: false` · serves E2 (route), E4, E5, E7, E9b, E11b

**Files:**
- Create: `src/lib/skills/test-support/temp-env.ts`
- Create: `src/lib/skills/run.server.ts`
- Create: `src/app/api/skills/route.ts`, `src/app/api/skills/[id]/run/route.ts`, `src/app/api/skills/runs/[taskId]/route.ts`, `src/app/api/skills/runs/[taskId]/plan/route.ts`
- Tests: `src/app/api/skills/run-params.test.ts` (E2), `run-refusals.test.ts` (E4), `run-task-row.test.ts` (E5), `runs-collect.test.ts` (E7), `list-route.test.ts` (E9b), `runs-plan.test.ts` (E11b)

**Interfaces:**
- Consumes: `getSkill`, `SKILLS` (`catalog.ts`), `validateParams`, `instantiate`, `loadPluginsRegistry` (`@/lib/plugins/plugins-registry.server`), `workflowTaskFailureEnvelope`, `serializeTaskErrorForDb` (`@/lib/task/error-envelope`).
- Produces:
  - `slotDefaultPluginFrom(nodePluginMap: Record<string, string[]>): Partial<Record<string, string>>`
  - `listSkills(): {id: string; version: string; params: SkillParam[]; outputs: SkillOutput[]; missingSlots: string[]}[]`
  - `submitSkillRun(id: string, raw: unknown): Promise<{status: 200; taskId: string} | {status: 400; code: "SKILL_PARAMS_INVALID"; errors} | {status: 400; code: "PLUGIN_NOT_INSTALLED"; missingSlots} | {status: 404; code: "SKILL_NOT_FOUND"} | {status: 429; code: "CONCURRENT_TASK_LIMIT_EXCEEDED"; current: number; max: 3}>`
  - `readSkillRun(taskId): Promise<SkillRunView | null>` where `SkillRunView = {taskId; skillId; status: "pending"|"processing"|"completed"|"failed"; steps: {nodeId; slot; status: "pending"|"running"|"done"|"failed"}[]; outputs: Record<string, {type; values: string[]}>; error: null | {code: "SKILL_VERSION_CHANGED"|"PLUGIN_NOT_INSTALLED"|"RUN_FAILED"; failedNodeIds: string[]}}`
  - `readSkillPlan(taskId): Promise<{name: string; nodes: Node[]; edges: Edge[]} | null>`
  - `SKILL_TASK_FEATURE = "skill"`, `SKILL_CONCURRENCY_MAX = 3`, `SKILL_RUN_ERROR_CODES`

- [ ] **Step 1: Temp env helper**

```ts
// src/lib/skills/test-support/temp-env.ts
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** Point the app's data dir at a fresh temp dir. Call before the first getDb(). */
export function useTempDataDir(prefix: string): string {
    const dir = mkdtempSync(path.join(tmpdir(), `ssv1-${prefix}-`));
    process.env.TONGFLOW_DATA_DIR = dir;
    return dir;
}
```

Every DB test file starts with `vi.mock("server-only", () => ({}));` and calls `useTempDataDir(...)` at module top before importing any route (use dynamic `await import(...)` inside `beforeAll` for the route module).

- [ ] **Step 2: Failing tests** — one file per eval, each shaped as its `expected` in `evals.yaml`. Shared request helper:

```ts
const post = (id: string, body: unknown) =>
    POST(new Request(`http://localhost/api/skills/${id}/run`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) as never, { params: Promise.resolve({ id }) });
```

Registry control in E2/E4/E5/E7/E11b: `vi.mock("@/lib/plugins/plugins-registry.server", () => ({ loadPluginsRegistry: () => registry.current }))` with a hoisted mutable `registry.current = { nodePluginMap: {...}, plugins: {} }`. E9b (`list-route.test.ts`) does NOT mock it: it writes a fixture plugin into a temp `TONGFLOW_PLUGINS_DIR`, named `oneflow-api-fixture-ffmpeg/entry.py`, whose content declares `@node_slot(NodeSlots.EXTRACT_AUDIO)` and `@node_slot(NodeSlots.REMOVE_VIDEO_AUDIO)` in the form `sdk/tongflow/scan.py` `_detect_runner` + `extract_node_slot_decorators` accept (read those functions and copy the minimal file shape from `sdk/tests` fixtures if one exists). Then `GET` → `cat-canh-video.missingSlots == ["split-video"]`; add a second fixture declaring `SPLIT_VIDEO`, call `invalidatePluginsRegistry()`, `GET` again → all empty. Red: make `listSkills` return `missingSlots: []` → the missing case fails naming `cat-canh-video`.

E2 specifics (`run-params.test.ts`): import `SKILL_PARAM_REASONS`; build five bodies against a fixture manifest injected with `vi.mock("@/lib/skills/catalog", ...)` whose `getSkill` returns the Task 1 fixture manifest plus `cat-canh-video`'s template; assert status 400, `code`, `errors` contains `{param, reason}`; count rows with `db.select({n: sql<number>\`count(*)\`}).from(tasks)` before/after. Positive control: valid body + registry with `split-video` → 200 and count +1.

E4 (`run-refusals.test.ts`): three cases + suppression half (2 pending → not 429). E5 (`run-task-row.test.ts`): read row, `Object.keys(JSON.parse(row.prompt)).sort()` equals `["params","skillId","skillVersion"]`. E7 (`runs-collect.test.ts`): insert three task rows directly (processing / completed with `result` = `{output_s1: ["tasks/t/a.mp4"]}` / failed with `error = serializeTaskErrorForDb(workflowTaskFailureEnvelope(["boom"], [{nodeId: "s1", summary: "boom"}]))`); assert `steps.length === instance.executable.executableNodes.length`, statuses, `outputs` keys equal manifest output keys; `feature: "workflow"` row → 404; unknown id → 404. E11b (`runs-plan.test.ts`): plan equals `instantiate(...).instance.originalFlow` computed in the test.

- [ ] **Step 3: Run → all six FAIL** (modules missing). Run: `pnpm vitest run src/app/api/skills`

- [ ] **Step 4: Implement `run.server.ts`**

```ts
// src/lib/skills/run.server.ts
import "server-only";
import { eq, inArray, sql } from "drizzle-orm";
import type { Edge, Node } from "@xyflow/react";
import { nanoid } from "nanoid";
import { getDb, tasks } from "@/db";
import { loadPluginsRegistry } from "@/lib/plugins/plugins-registry.server";
import type { SerializedTaskError } from "@/lib/task/error-envelope";
import { instantiate } from "./instantiate";
import { validateParams } from "./params";
import { getSkill, SKILLS } from "./catalog";
import type { SkillParamValue } from "./types";

export const SKILL_TASK_FEATURE = "skill";
export const SKILL_CONCURRENCY_MAX = 3;
export const SKILL_RUN_ERROR_CODES = ["SKILL_VERSION_CHANGED", "PLUGIN_NOT_INSTALLED", "RUN_FAILED"] as const;
export type SkillRunErrorCode = (typeof SKILL_RUN_ERROR_CODES)[number];

export interface SkillTaskPrompt {
    skillId: string;
    skillVersion: string;
    params: Record<string, SkillParamValue>;
}

export function slotDefaultPluginFrom(map: Record<string, string[]>): Partial<Record<string, string>> {
    const out: Partial<Record<string, string>> = {};
    for (const [slot, ids] of Object.entries(map)) if (ids?.[0]) out[slot] = ids[0];
    return out;
}

export function listSkills() {
    const defaults = slotDefaultPluginFrom(loadPluginsRegistry().nodePluginMap);
    return SKILLS.map(({ manifest }) => ({
        id: manifest.id,
        version: manifest.version,
        params: manifest.params,
        outputs: manifest.outputs,
        missingSlots: [...new Set(manifest.requires)].filter((s) => !defaults[s]).sort(),
    }));
}

export async function submitSkillRun(id: string, raw: unknown) {
    const def = getSkill(id);
    if (!def) return { status: 404 as const, code: "SKILL_NOT_FOUND" as const };
    const v = validateParams(def.manifest, raw);
    if (!v.ok) return { status: 400 as const, code: "SKILL_PARAMS_INVALID" as const, errors: v.errors };
    const inst = instantiate(def, v.params, slotDefaultPluginFrom(loadPluginsRegistry().nodePluginMap));
    if (!inst.ok) return { status: 400 as const, code: "PLUGIN_NOT_INSTALLED" as const, missingSlots: inst.missingSlots };
    const db = await getDb();
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(tasks).where(inArray(tasks.status, ["pending", "processing"]));
    const current = Number(n ?? 0);
    if (current >= SKILL_CONCURRENCY_MAX) {
        return { status: 429 as const, code: "CONCURRENT_TASK_LIMIT_EXCEEDED" as const, current, max: SKILL_CONCURRENCY_MAX };
    }
    const taskId = nanoid();
    const prompt: SkillTaskPrompt = { skillId: id, skillVersion: def.manifest.version, params: v.params };
    await db.insert(tasks).values({ id: taskId, nodeId: SKILL_TASK_FEATURE, feature: SKILL_TASK_FEATURE, pluginId: "", prompt: JSON.stringify(prompt), status: "pending", progress: 0 });
    return { status: 200 as const, taskId };
}

async function loadSkillTask(taskId: string) {
    const db = await getDb();
    const task = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId) });
    if (!task || task.feature !== SKILL_TASK_FEATURE) return null;
    const prompt = JSON.parse(task.prompt) as SkillTaskPrompt;
    const def = getSkill(prompt.skillId);
    if (!def) return null;
    return { task, prompt, def };
}

export async function readSkillRun(taskId: string) {
    const loaded = await loadSkillTask(taskId);
    if (!loaded) return null;
    const { task, prompt, def } = loaded;
    const status = task.status as "pending" | "processing" | "completed" | "failed";
    let err: SerializedTaskError | null = null;
    if (task.error) {
        try { err = JSON.parse(task.error) as SerializedTaskError; } catch { err = { message: task.error }; }
    }
    const failedNodeIds = (err?.failures ?? []).map((f) => f.nodeId);
    const steps = def.template.executable.executableNodes.map((n) => ({
        nodeId: n.id,
        slot: n.feature,
        status: status === "completed" ? "done"
            : status === "failed" ? (failedNodeIds.includes(n.id) ? "failed" : "done")
            : status === "processing" ? "running" : "pending",
    }));
    const result = task.result ? (JSON.parse(task.result) as Record<string, string[]>) : {};
    const outputs = Object.fromEntries(def.manifest.outputs.map((o) => [o.key, { type: o.type, values: result[o.from] ?? [] }]));
    const code: SkillRunErrorCode | null = status !== "failed" ? null
        : (SKILL_RUN_ERROR_CODES as readonly string[]).includes(err?.message ?? "") ? (err?.message as SkillRunErrorCode) : "RUN_FAILED";
    return {
        taskId, skillId: prompt.skillId, status, steps,
        outputs: status === "completed" ? outputs : {},
        error: code ? { code, failedNodeIds } : null,
    };
}

export async function readSkillPlan(taskId: string): Promise<{ name: string; nodes: Node[]; edges: Edge[] } | null> {
    const loaded = await loadSkillTask(taskId);
    if (!loaded) return null;
    const { prompt, def } = loaded;
    const inst = instantiate(def, prompt.params, slotDefaultPluginFrom(loadPluginsRegistry().nodePluginMap));
    // A plugin uninstalled after the run still lets the person see the plan.
    const flow = inst.ok ? inst.instance.originalFlow : def.template.originalFlow;
    return { name: prompt.skillId, nodes: flow.nodes, edges: flow.edges };
}
```

Note on steps for a failed run: a node not named in `failures` is reported `done`. This is exact for the linear 1- and 2-node skills in scope and is recorded as a Known limit candidate for fan-out skills (B7).

- [ ] **Step 5: Implement routes** (thin; status + JSON only)

```ts
// src/app/api/skills/route.ts
import { NextResponse } from "next/server";
import { listSkills } from "@/lib/skills/run.server";
export async function GET() { return NextResponse.json({ skills: listSkills() }); }
```

```ts
// src/app/api/skills/[id]/run/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { submitSkillRun } from "@/lib/skills/run.server";
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    let body: unknown = {};
    try { body = await request.json(); } catch { body = {}; }
    const params = typeof body === "object" && body !== null ? (body as { params?: unknown }).params : undefined;
    const { status, ...payload } = await submitSkillRun(id, params ?? {});
    return NextResponse.json(payload, { status });
}
```

```ts
// src/app/api/skills/runs/[taskId]/route.ts
import { NextResponse } from "next/server";
import { readSkillRun } from "@/lib/skills/run.server";
export async function GET(_req: Request, ctx: { params: Promise<{ taskId: string }> }) {
    const run = await readSkillRun((await ctx.params).taskId);
    return run ? NextResponse.json(run) : NextResponse.json({ code: "SKILL_RUN_NOT_FOUND" }, { status: 404 });
}
```

`runs/[taskId]/plan/route.ts` identical shape with `readSkillPlan`. Request body of POST is `{params: {...}}`.

- [ ] **Step 6: Run → PASS; red halves** as named in each `expected` (unknown-key check off → E2 red; threshold 4 → E4 red; add `executable` to prompt → E5 red; rename manifest output → E7 red; route returns template → E11b red). Restore each.

- [ ] **Step 7: Declare nothing new in config** (keys exist since S1). Commit: `git add src/lib/skills/run.server.ts src/lib/skills/test-support/temp-env.ts src/app/api/skills && git commit -m "feat(skills): list, run, run view and plan routes"`

---

### Task 5: Runner branch

`independent: false` · serves E6

**Files:**
- Create: `src/lib/skills/dispatch.server.ts`
- Modify: `src/lib/task/runner.ts` (inside `dispatchTask`, before `if (task.feature === "workflow")`)
- Test: `src/lib/task/runner-skill.test.ts`

**Interfaces:**
- Consumes: `readSkill*` types, `instantiate`, `slotDefaultPluginFrom`, `executeWorkflowViaEngine(taskId, workflowJson, inputs, workflowId)`, `notifyTask`, `WorkflowStatus`.
- Produces: `dispatchSkillTask(task: {id: string; prompt: string}): Promise<void>`

- [ ] **Step 1: Failing test** — mock `./engine-delegate.server` with `executeWorkflowViaEngine: vi.fn()`, mock the plugin registry with `split-video` installed, real DB in a temp dir. Case A: insert a `cat-canh-video` task via `submitSkillRun`, call `dispatchTask(taskId)`, assert the mock was called once and `JSON.parse(call[1])` deep-equals `normalize(instantiate(getSkill("cat-canh-video"), prompt.params, defaults).instance.executable)` computed in the test. Case B: insert a row whose prompt `skillVersion` is `"0.0.1"`; after dispatch the engine mock has 0 calls (message `engine called N times on version drift`), the row is `failed`, and `JSON.parse(row.error).message === "SKILL_VERSION_CHANGED"`. Use `cat-canh-video` only (AC-12 vế 3 greps non-test files, but Task 8's parent commit runs this test).

- [ ] **Step 2: Run → FAIL.** `pnpm vitest run src/lib/task/runner-skill.test.ts`

- [ ] **Step 3: Implement**

```ts
// src/lib/skills/dispatch.server.ts
import "server-only";
import { eq } from "drizzle-orm";
import { WorkflowStatus } from "@/constants/task-status";
import { getDb, tasks } from "@/db";
import { loadPluginsRegistry } from "@/lib/plugins/plugins-registry.server";
import { serializeTaskErrorForDb } from "@/lib/task/error-envelope";
import { notifyTask } from "@/lib/task/emitter";
import { executeWorkflowViaEngine } from "@/lib/task/engine-delegate.server";
import { instantiate } from "./instantiate";
import { getSkill } from "./catalog";
import { slotDefaultPluginFrom, type SkillRunErrorCode, type SkillTaskPrompt } from "./run.server";

async function fail(taskId: string, code: SkillRunErrorCode): Promise<void> {
    notifyTask(taskId, WorkflowStatus.WORKFLOW_FAILED, { message: code, code });
    const db = await getDb();
    await db.update(tasks).set({ status: "failed", error: serializeTaskErrorForDb({ message: code }) }).where(eq(tasks.id, taskId));
}

/** Re-instantiate a skill task from its business-only prompt and run it. */
export async function dispatchSkillTask(task: { id: string; prompt: string }): Promise<void> {
    const prompt = JSON.parse(task.prompt) as SkillTaskPrompt;
    const def = getSkill(prompt.skillId);
    if (!def || def.manifest.version !== prompt.skillVersion) return fail(task.id, "SKILL_VERSION_CHANGED");
    const inst = instantiate(def, prompt.params, slotDefaultPluginFrom(loadPluginsRegistry().nodePluginMap));
    if (!inst.ok) return fail(task.id, "PLUGIN_NOT_INSTALLED");
    return executeWorkflowViaEngine(task.id, JSON.stringify(inst.instance.executable), {}, null);
}
```

In `runner.ts` add at the top of the feature routing:

```ts
    if (task.feature === "skill") {
        const { dispatchSkillTask } = await import("@/lib/skills/dispatch.server");
        return dispatchSkillTask(task);
    }
```

(`dispatch.server.ts` imports `run.server.ts` only for types and `slotDefaultPluginFrom`; if that creates a cycle with the DB module under vitest, move `slotDefaultPluginFrom` and the two types into `src/lib/skills/run-shared.ts` and import from there in both.)

- [ ] **Step 4: Run → PASS; red:** remove the version comparison → Case B fails with `engine called 1 times on version drift`. Restore.

- [ ] **Step 5: Commit** — `git add src/lib/skills/dispatch.server.ts src/lib/task/runner.ts src/lib/task/runner-skill.test.ts && git commit -m "feat(skills): runner re-instantiates skill tasks for the existing engine delegate"`

---

### Task 6: The panel

`independent: false` · serves E9, E10, E11, and the wiring E12/E12b/E13 observe

**Files:**
- Create: `src/lib/api/skills.ts`
- Create: `src/components/workspace/skills/use-skill-run.ts`
- Create: `src/components/workspace/skills/skill-sheet.tsx`
- Modify: `src/components/workspace/workspace-left-nav.tsx` (fourth button + sheet)
- Modify: `src/components/workspace/skills/skill-view.ts` (add `SkillRunErrorView`), `skill-run.tsx` (failure copy by error code)
- Modify: `src/i18n/messages/{en,vi,zh,ja,ko}.json` (`Skills.errors.SKILL_VERSION_CHANGED|PLUGIN_NOT_INSTALLED|RUN_FAILED`)
- Tests: `src/components/workspace/skills/skill-sheet-list-form.test.tsx` (E9), `skill-sheet-run-states.test.tsx` (E10), `view-plan.test.tsx` (E11)

**Interfaces:**
- Consumes: routes from Task 4 (`GET /api/skills` → `{skills}`, `POST /api/skills/<id>/run` body `{params}`, `GET /api/skills/runs/<taskId>`, `GET …/plan`), `getTaskWaitUrl(taskId)`, `NodeStatus.NODE_STARTED|NODE_COMPLETED|NODE_FAILED`, `WorkflowStatus.WORKFLOW_COMPLETED|WORKFLOW_FAILED`, `getPresignedUploadUrl(file)` (`@/lib/api/upload`), `useFlow.getState().setNodes/setEdges/setWorkflowName`, `ONBOARDING_RECOVERY_EVENT` (`@/components/workspace/task-failure-toaster`).
- Produces: `fetchSkills()`, `submitSkillRun(id, params)`, `fetchSkillRun(taskId)`, `fetchSkillPlan(taskId)`; `useSkillRun(taskId: string | null, steps: SkillStepView[])` → `{steps, run}`; `<SkillSheet open onOpenChange />`.

- [ ] **Step 1: Client fetchers** — thin `fetch` wrappers returning parsed JSON plus HTTP status (`{status, body}`), no throwing on 4xx: the sheet branches on `status` (400 params → field errors, 400 plugin → back to list with refreshed `missingSlots`, 429 → `busyMax`).

- [ ] **Step 2: `useSkillRun`** — opens `new EventSource(getTaskWaitUrl(taskId))`; on `NODE_STARTED` set that `nodeId` running, `NODE_COMPLETED` done, `NODE_FAILED` failed; on `WORKFLOW_COMPLETED|WORKFLOW_FAILED` close the source and `fetchSkillRun(taskId)` to replace steps/outputs/error with the server view; on mount with an existing `taskId` (panel reopened) fetch the run view first and only open SSE while status is `pending|processing`.

- [ ] **Step 3: `SkillSheet`** — state machine `list → form → running → result`; list from `fetchSkills()` mapped to `SkillCardView {id, missingSlots}`; form params from the list payload's manifest params; file pick → `getPresignedUploadUrl(file)` → value `{fileKey, name}`; Run → `submitSkillRun`; server 400 `SKILL_PARAMS_INVALID` → `errors` keyed by param; «Chạy lại» re-submits the SAME `values` object; «Sửa đầu vào» returns to form with values kept; result outputs of type video/audio/image render `/api/uploads/${fileKey}` for each value the run view returns (text values render as text); «Xem/sửa kế hoạch» → `fetchSkillPlan` → if `useFlow.getState().nodes.length > 0` open `SkillReplaceConfirm`, else apply: `setNodes(plan.nodes); setEdges(plan.edges); setWorkflowName(t(\`skills.${id}.name\`))`, close sheet; «Huỷ» closes the dialog and leaves the store untouched; `onOpenPlugins` closes the sheet and dispatches `new CustomEvent<OnboardingRecoveryDetail>(ONBOARDING_RECOVERY_EVENT, {detail: {kind: "install-plugin", pluginId: ""}})` — `FailureAction` (`src/lib/onboarding/failure-actions.ts`) types `pluginId` as `string`, and the plugins dialog opens with no row spotlighted for an empty id. Failure copy: `SKILL_VERSION_CHANGED` and `PLUGIN_NOT_INSTALLED` use `Skills.errors.<code>`; `RUN_FAILED` keeps `failedBody` with the failed step label.

- [ ] **Step 4: Left nav** — add a Button (lucide `Sparkles` is taken by the Director; use `LayoutGrid`) with the same class string as the Task button, `aria-label={tSkills("navTooltip")}`, tooltip, and `<SkillSheet open={isSkillSheetOpen} onOpenChange={setIsSkillSheetOpen} />` rendered as `<Sheet><SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md">` with `SheetTitle` = `t("title")`.

- [ ] **Step 5: Tests** — follow `src/components/workspace/director-prompt.test.tsx` for the jsdom + `NextIntlClientProvider` + `vi.mock` pattern, messages loaded from `src/i18n/messages/vi.json` on disk. Data is NOT hand-typed:
  - E9: call the real `GET` handler of `src/app/api/skills/route.ts` in the same test (registry mocked with only ffmpeg slots) and feed its JSON to a mocked `fetch`.
  - E10: produce SSE messages by feeding engine NDJSON lines to the real `executeWorkflowViaEngine` with `node:child_process` mocked (reuse the `fakeChild()` pattern of `engine-delegate.test.ts`, moved into `src/lib/skills/test-support/fake-engine.ts`) and capturing `notifyTask` calls; payload of the run view comes from the real runs handler on a temp DB. Mock `EventSource` with a class that replays the captured events.
  - E11: real `useFlow` store; plan payload from the real plan handler.
  Each red half as written in `evals.yaml`.

- [ ] **Step 6: Run** `pnpm vitest run src/components/workspace/skills` → PASS; `pnpm typecheck`; `pnpm lint:check`. Visual check: start this tree's dev server on a free port with temp data/plugins dirs, open `/workspace`, press Skill, screenshot.

- [ ] **Step 7: Commit** — `git add src/lib/api/skills.ts src/components/workspace src/i18n/messages && git commit -m "feat(skills): skill panel in the workspace left nav"`

---

### Task 7: i18n copy guard and a11y proto guard

`independent: true` · serves E17b, E14

**Files:**
- Create: `src/i18n/skills-copy.test.ts`
- Create: `scripts/skills/check-a11y-proto.sh`

- [ ] **Step 1: `skills-copy.test.ts`** — for each of the five locale files: every `Skills.*` leaf present in `vi.json` exists; `Object.keys(vi.Skills.invalid).sort()` equals `[...SKILL_PARAM_REASONS].sort()` (message names the missing code); for every skill in `SKILLS` and every slot in `requires`, `Skills.skills.<id>.steps.<slot>` exists; `FORBIDDEN = ["slot", "plugin id", "pluginId", "ABI", "executable", "taskId", "node"]` and the test asserts `FORBIDDEN.length === 7` before scanning vi values case-insensitively with word boundaries (message `<key> contains <word>`). Red: insert «slot» into a copy of vi values → fails naming key + word.

- [ ] **Step 2: `check-a11y-proto.sh`** — copy the structure of `scripts/settings/check-a11y-proto.sh` (own server on port 3198, `NEXT_DIST_DIR=build/ssv1-a11y`, cleanup trap that kills only its own server, readback of `data-proto-state` and `class="dark"`, `ROOT` derived from `BASH_SOURCE`), with `STATES` = the 11 names of `SKILL_PROTO_STATES` in `src/components/proto/skill-system-v1-proto.tsx` and themes light/dark; `node scripts/a11y-scan.mjs --fail-on critical,serious <urls>`. Add `build/ssv1-a11y/types/**/*.ts` to `tsconfig.json` `include` so Next does not rewrite it. Red: rename one state in `STATES` → exit non-zero with `rendered state 'unknown:<name>', asked for '<name>'`.

- [ ] **Step 3: Run both, commit** — `git add src/i18n/skills-copy.test.ts scripts/skills/check-a11y-proto.sh tsconfig.json && git commit -m "test(skills): copy guard and a11y sweep over the panel states"`

---

### Task 8: Second skill — the platform proof commit

`independent: false` · serves E16 (the commit it inspects)

**Files (this commit touches ONLY these):**
- Create: `src/lib/skills/tach-tieng-video/{graph.ts,manifest.ts,index.ts,template.json,sample-params.json}`
- Modify: `src/lib/skills/registry.ts` — add exactly one line: `export { skill as tachTiengVideo } from "./tach-tieng-video";`

- [ ] **Step 1: Graph** — `v1` videoNode `{}` → `a1` extractAudioNode `{pluginId: ""}` (`in:video`) and `v1` → `r1` removeVideoAudioNode `{pluginId: ""}` (`in:video`).
- [ ] **Step 2: Manifest** — `id: "tach-tieng-video"`, `version: "1.0.0"`, `requires: ["extract-audio", "remove-video-audio"]`, params `[{key: "video", type: "video", required: true, target: {kind: "input", name: "input_v1"}}]`, outputs `[{key: "tieng", type: "audio", from: "output_a1"}, {key: "video-cam", type: "video", from: "output_r1"}]`; `sample-params.json` `{"video": {"fileKey": "sample/tour.mp4", "name": "tour.mp4"}}`; `index.ts` same shape as Task 2.
- [ ] **Step 3: Build + verify WITHOUT touching anything else** — `pnpm skills:build tach-tieng-video`; `pnpm vitest run src/lib/skills src/lib/task/runner-skill.test.ts src/app/api/skills src/i18n/skills-copy.test.ts` → PASS (all generic suites now iterate two skills). If any of them needs a code change, STOP: that is exactly the failure AC-12 exists to catch — fix the frame in a separate commit BEFORE this one and redo this task.
- [ ] **Step 4: Check the diff before committing** — `git diff --cached --name-only` lists only the six paths above.
- [ ] **Step 5: Commit** — `git add src/lib/skills/tach-tieng-video src/lib/skills/registry.ts && git commit -m "feat(skills): second skill tach-tieng-video — manifest, template, one registry entry"`

---

### Task 9: Measurements that name the second skill

`independent: false` · serves E1 (≥ 2 floor), E7b, E8, E16

**Files:**
- Modify: `src/lib/skills/registry.test.ts` (`toBeGreaterThanOrEqual(2)`)
- Create: `src/app/api/skills/runs-failed-step.test.ts` (E7b)
- Create: `scripts/skills/luot.sh`, `scripts/skills/e2e-tach-tieng.sh` (E8, TD-3..TD-8)
- Create: `scripts/skills/check-second-skill-paths.sh` (E16)

- [ ] **Step 1: E7b** — temp DB; mock `node:child_process` with the shared fake engine; mock the plugin registry with ffmpeg slots; `submitSkillRun("tach-tieng-video", sample)` → `dispatchTask(taskId)`; fake child writes NDJSON `node_started a1`, `node_completed a1`, `node_started r1`, `node_failed r1`, final `{"result": {"outputs": {}, "failures": [{"nodeId": "r1", "summary": "boom"}], "errors": ["boom"]}}` in the exact line shapes `engine-delegate.server.ts` parses, then exits; capture `notifyTask` via `onTaskEvent`; assert `NODE_*` events carried `a1`/`r1`; `readSkillRun` → failed, `a1` done, `r1` failed. Red: fake engine fails `a1` instead → assertion names `r1`.

- [ ] **Step 2: `luot.sh`** — subcommands `dat [--chi-ffmpeg]` and `tra <dir>`. `dat`: `ROOT` from `BASH_SOURCE`; `LUOT=$(mktemp -d)`; `TONGFLOW_PLUGINS_DIR=$LUOT/plugins pnpm plugins:install oneflow-api-ffmpeg [oneflow-api-pyscenedetect]` (exit 2 `tien de TD-4 hong` on failure); `ffmpeg` lavfi → `$LUOT/mau.mp4` (testsrc 2 s + color 2 s + sine; exit 2 `tien de TD-7 hong`); free port search from 3140; `PORT=$P TONGFLOW_DATA_DIR=$LUOT/data TONGFLOW_PLUGINS_DIR=$LUOT/plugins NEXT_DIST_DIR=build pnpm dev` in its own process group, log to `$LUOT/dev.log`; wait ≤ 120 s; identity check both halves (proto slug 200 AND `lsof … -d cwd` equals `$ROOT`) else exit 2 `may chu khong phai cay nay`; print `LUOT=<dir> PORT=<p> PGID=<g>`. `tra`: kill the process group from `$LUOT/pgid`, `rm -rf $LUOT`. Red: run `dat` while pointing identity at a different root (env `SSV1_EXPECT_ROOT=/tmp`) → exit 2 with that message.

- [ ] **Step 3: `e2e-tach-tieng.sh`** — `eval "$(luot.sh dat)"`; `trap 'luot.sh tra $LUOT' EXIT`; upload `mau.mp4` via `curl -F file=@… localhost:$PORT/api/upload`; `POST /api/skills/tach-tieng-video/run` `{params: {video: {fileKey, name}}}`; open SSE `curl -N localhost:$PORT/api/task/wait?taskId=…` until `WORKFLOW_COMPLETED|WORKFLOW_FAILED` (timeout 600 s); `GET runs/<taskId>`: `status == completed`; for each output value resolve `$LUOT/data/uploads/<fileKey>`, assert exists and size > 0; `ffprobe` stream counts: `tieng` audio ≥ 1 and video 0, `video-cam` video ≥ 1 and audio 0. Any precondition failure → exit 2 naming the TD. Red: `SSV1_SAMPLE_SILENT=1` generates the sample without the sine track → exit 1 with `output tieng: no audio stream`.

- [ ] **Step 4: `check-second-skill-paths.sh`** — three named halves, each printing `PASS <half>` / `FAIL <half>: <detail>`:
  1. paths: `C=$(git log --diff-filter=A --format=%H -- src/lib/skills/tach-tieng-video/manifest.ts)`; count must be 1 (exit 2 `found <n> commits`); `git show --name-only --format= $C` ⊆ {`src/lib/skills/tach-tieng-video/*`, `src/lib/skills/registry.ts`, `src/i18n/messages/*`}; `git show --numstat $C -- src/lib/skills/registry.ts` equals `1 0` and the added line contains `./tach-tieng-video`.
  2. frame-before: `WT=$(mktemp -d)`; `git worktree add --detach $WT $C^`; in `$WT`: `pnpm install --frozen-lockfile --offline` then `pnpm vitest run src/lib/skills/registry.test.ts src/lib/skills/instantiate.test.ts src/lib/task/runner-skill.test.ts`; always `git worktree remove --force $WT`.
  3. no-special-case: `git grep -n -E 'tach-tieng-video|tachTiengVideo|extract-audio|remove-video-audio' HEAD -- 'src/lib/skills/*.ts' 'src/lib/task' 'src/app/api' 'src/lib/workflow' ':!*.test.ts' ':!*.test.tsx' ':!src/lib/skills/registry.ts' ':!src/lib/skills/test-support'` → 0 lines.
  `--teeth`: build a throwaway repo in `mktemp -d` (git init, copy a minimal fake tree), make three bad histories (extra `src/lib/workflow/exporter.ts` line in the skill commit; two registry lines; parent commit adding `if (skillId === "tach-tieng-video")` to `src/lib/task/runner.ts`), run halves 1 and 3 against each, require each to FAIL with the pinned detail, and a clean history to PASS.

- [ ] **Step 5: Run all four, commit** — `git add src/lib/skills/registry.test.ts src/app/api/skills/runs-failed-step.test.ts scripts/skills && git commit -m "test(skills): failed-step route, end-to-end run and platform-proof guard"`

---

### Task 10: Close S3

`independent: false`

- [ ] Run the full local suite once: `pnpm lint:check && pnpm build && pnpm typecheck && pnpm test`.
- [ ] Check `command -v uv`. Absent → STOP before S4 and report TD-10 to the owner (the Gate-1 decision chose the install path by approving without `sửa`).
- [ ] Set `_acceptance/skill-system-v1/contract.md` `status: implemented`, commit, dispatch S4.
