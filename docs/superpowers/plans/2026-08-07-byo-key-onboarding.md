# BYO-key onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A person who has never run OneFlow reaches a real output asset on the canvas before anything asks them for an API key, and every wall on the way there has a state they can see.

**Architecture:** A new `src/lib/onboarding/` domain holds four pure-ish units (what the example needs, what is missing, how a failure maps to an action, whether a key actually works). A non-blocking strip above the canvas renders the answer. The one server-side change is that `ensurePluginPython` gains an optional milestone callback, which `runners/generic.ts` forwards into the existing `notifyTask` stream — this is the single `t3_paths` entry that makes the feature T3.

**Tech Stack:** Next.js App Router · React · TypeScript · Tailwind v4 (repo tokens) · vitest · Biome · pnpm · axe-core in real Chrome (a11y) · the existing plugin registry / install / task-SSE plumbing.

## Global Constraints

- Code comments in **English only**. Human-facing UI copy is Vietnamese, matching the repo's existing locale.
- **No telemetry of any kind**, including local-only counters with a manual export. This is AC-12 and it is a hard constraint, not a preference.
- The UI never shows a plugin id. Types must make this impossible: pass `capabilities: string[]` and `providerName: string`, sourced from `PluginMeta.name` in `tongflow.plugin.json`.
- **Zero changed files** under `config/tongflow.abi.json`, `src/generated/abi/**`, `sdk/**`, `src/db/**`. `src/lib/plugin-executor/**` is the one t3 path this feature is allowed to touch.
- Desktop only. The strip must stack vertically in a narrow desktop window, but no criterion binds a breakpoint and mobile is out of scope.
- Immutable updates only — build new objects, never mutate.
- Files stay under 800 lines; functions under 50.
- Before every commit: `pnpm lint:check`, `pnpm typecheck`, `pnpm build`.
- Never `console.log` in shipped code; the repo uses its `logger`.

---

## File Structure

**Created**

| Path | Responsibility |
|---|---|
| `public/example-assets/two-scenes.mp4` | The bundled sample **input** clip. A decoy for AC-2 by construction — see the warning in Task 1. |
| `src/lib/onboarding/example-requirements.ts` | Bundled workflow → the literal set of plugin ids it needs, and which of those are missing. |
| `src/lib/onboarding/install-missing.ts` | One call that installs every missing plugin and re-queries the registry. |
| `src/lib/onboarding/failure-actions.ts` | Task error message → one of three recovery actions (or none). |
| `src/lib/onboarding/key-verify.ts` | Asks the thing a key unlocks whether the key works. Never inspects the key's shape. |
| `src/hooks/use-first-run-readiness.ts` | Requirements + registry + "has the example ever completed" → the strip's state. |
| `src/lib/plugin-executor/provisioning-events.ts` | Milestone vocabulary and the framing that carries it over the existing task stream. |
| `scripts/onboarding/check-*.sh` (4 files) | The guard scripts `_acceptance/config.yaml` already names. |

**Modified**

| Path | Change |
|---|---|
| `public/example.json` | Replaced with a local, key-free two-plugin workflow. |
| `src/lib/plugins/plugin-python-env.server.ts` | `ensurePluginPython` gains an optional `onMilestone`. |
| `src/lib/plugin-executor/runners/generic.ts` | Passes a callback that forwards milestones to `notifyTask`. **The one t3 path.** |
| `src/components/workspace/first-run-strip.tsx` | Gains the `capabilities`/props the hook actually produces. |
| `src/components/workspace/workspace.tsx` | Mounts the strip. |
| `src/components/workspace/task-failure-toaster.tsx` | Renders the classified action. |
| `src/components/workspace/nodes/base/abi-node-shell.tsx` | Needs-key state + mounts `NodeKeyPrompt`. |
| `src/app/api/settings/env/route.ts` | A verification branch on save. |
| `scripts/acceptance/check-t3-untouched.sh` + `t3-scan.mjs` | `--allow` and `--require` globs. |
| `_acceptance/config.yaml` | `bko_tier_boundary` gains `--require`. |

---

### Task 1: A bundled example that needs no keys

Everything else reads this file, so it goes first.

**Files:**
- Create: `public/example-assets/two-scenes.mp4`
- Modify: `public/example.json`
- Create: `src/lib/onboarding/example-requirements.ts`
- Test: `src/lib/onboarding/example-requirements.test.ts`
- Create: `scripts/onboarding/check-example-needs-no-keys.sh`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  ```ts
  export type ExampleRequirement = { pluginId: string; feature: string };
  export function readExampleRequirements(workflow: unknown): ExampleRequirement[];
  export function missingPluginIds(reqs: ExampleRequirement[], installedIds: readonly string[]): string[];
  ```

> **Why the sample clip is dangerous, and why that is deliberate.** The bundled `.mp4` is an *input*. It is also the single most plausible thing to be looking at when you believe the example worked. A silently failed run leaves it on screen and reads exactly like success. AC-2, E2 and E22 all exist for this one confusion; do not "simplify" them away.

- [ ] **Step 1: Generate the sample clip**

Two visually distinct halves with a hard cut at 2s, so shot detection has a real cut to find:

```bash
mkdir -p public/example-assets
ffmpeg -y \
  -f lavfi -i "testsrc=size=480x270:rate=15:duration=2" \
  -f lavfi -i "smptebars=size=480x270:rate=15:duration=2" \
  -filter_complex "[0:v][1:v]concat=n=2:v=1[v]" \
  -map "[v]" -pix_fmt yuv420p -c:v libx264 -preset veryfast \
  public/example-assets/two-scenes.mp4
ls -lh public/example-assets/two-scenes.mp4
```

Expected: a file well under 200 KB.

- [ ] **Step 2: Build the workflow in the app and export it**

Do **not** hand-author `example.json`. Its shape (`bindings`, `outputs[].itemValuePath`, `executionLevels`) is produced by `src/lib/workflow/exporter.ts` from the ABI mount registry; a hand-written copy drifts from the exporter the moment either changes.

1. `pnpm dev`, open `/workspace`.
2. Add a Video node, upload `public/example-assets/two-scenes.mp4`.
3. Add a **Split Video** node (slot `split-video`, defaults to *PySceneDetect (local)*), connect the video into it.
4. Add a **Concat Videos** node (slot `concat-videos`, defaults to *FFmpeg (local)*), connect the split output into it.
5. Run it once. Confirm a new video appears — that is the proof the example is runnable at all.
6. Export via the workflow dialog, move the download to `public/example.json`.
7. Edit only the two cosmetic fields by hand:

```json
{
    "name": "Ví dụ / example",
    "description": "Tách cảnh rồi ghép lại — chạy hoàn toàn trên máy bạn, không cần khoá."
}
```

- [ ] **Step 3: Verify the exported file by shape, not by eye**

```bash
node -e '
const j = require("./public/example.json");
const ids = [...new Set(j.executableNodes.map(n => n.pluginId))];
console.log(ids);
if (ids.length < 2) { console.error("FAIL: need >= 2 plugins"); process.exit(1); }
if (ids.some(id => id.includes("modal"))) { console.error("FAIL: a Modal plugin survived"); process.exit(1); }
'
```

Expected: `[ 'oneflow-api-pyscenedetect', 'oneflow-api-ffmpeg' ]`, exit 0.

- [ ] **Step 4: Write the failing test**

Create `src/lib/onboarding/example-requirements.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import exampleWorkflow from "../../../public/example.json";
import {
    missingPluginIds,
    readExampleRequirements,
} from "./example-requirements";

describe("readExampleRequirements", () => {
    it("returns the exact plugin id set the bundled example needs", () => {
        const reqs = readExampleRequirements(exampleWorkflow);
        const ids = reqs.map((r) => r.pluginId).sort();

        // Asserted element by element. A count alone would let a parser that
        // returns the wrong two ids pass.
        expect(ids).toEqual(["oneflow-api-ffmpeg", "oneflow-api-pyscenedetect"]);
        expect(ids.length).toBeGreaterThanOrEqual(2);
    });

    it("reads at load time without executing anything", () => {
        // A pure read of the JSON: no fetch, no child process, no registry.
        const reqs = readExampleRequirements(exampleWorkflow);
        expect(reqs.every((r) => typeof r.feature === "string")).toBe(true);
    });

    it("returns an empty missing set when every plugin is installed", () => {
        // Suppression half: detection must not report phantoms.
        const reqs = readExampleRequirements(exampleWorkflow);
        const installed = reqs.map((r) => r.pluginId);
        expect(missingPluginIds(reqs, installed)).toEqual([]);
    });

    it("names only the plugins that are actually absent", () => {
        const reqs = readExampleRequirements(exampleWorkflow);
        const installed = [reqs[0].pluginId];
        expect(missingPluginIds(reqs, installed)).toEqual([reqs[1].pluginId]);
    });

    it("ignores a workflow with no executable nodes rather than throwing", () => {
        expect(readExampleRequirements({ executableNodes: [] })).toEqual([]);
    });
});
```

- [ ] **Step 5: Run it and watch it fail**

Run: `pnpm vitest run src/lib/onboarding/example-requirements.test.ts`
Expected: FAIL — `Cannot find module './example-requirements'`.

- [ ] **Step 6: Implement**

Create `src/lib/onboarding/example-requirements.ts`:

```ts
/**
 * What the bundled first-run example needs in order to run at all.
 *
 * Detection happens when the workflow LOADS, not when the user presses Run —
 * the industry baseline for this shape of tool (ComfyUI-Manager lists missing
 * nodes at load). Everything here is a pure read of the exported workflow: no
 * network, no child process, no registry access.
 */

/** One executable node's demand on the plugin registry. */
export type ExampleRequirement = {
    pluginId: string;
    /** ABI slot the node mounts, e.g. "split-video". */
    feature: string;
};

type ExportedNode = { pluginId?: unknown; feature?: unknown };

/**
 * Unique plugin ids the workflow's executable nodes are pinned to, in first
 * -appearance order. `pluginId` is a top-level field on an exported node; it is
 * deliberately not nested inside `prompt` (see CLAUDE.md, "Wire / persistence
 * shape").
 */
export function readExampleRequirements(
    workflow: unknown,
): ExampleRequirement[] {
    const nodes = (workflow as { executableNodes?: unknown })?.executableNodes;
    if (!Array.isArray(nodes)) return [];

    const seen = new Set<string>();
    const out: ExampleRequirement[] = [];
    for (const node of nodes as ExportedNode[]) {
        const pluginId = typeof node?.pluginId === "string" ? node.pluginId : "";
        const feature = typeof node?.feature === "string" ? node.feature : "";
        if (!pluginId || seen.has(pluginId)) continue;
        seen.add(pluginId);
        out.push({ pluginId, feature });
    }
    return out;
}

/** Requirements with no matching installed plugin, in requirement order. */
export function missingPluginIds(
    reqs: readonly ExampleRequirement[],
    installedIds: readonly string[],
): string[] {
    const installed = new Set(installedIds);
    return reqs
        .filter((r) => !installed.has(r.pluginId))
        .map((r) => r.pluginId);
}
```

- [ ] **Step 7: Run the test again**

Run: `pnpm vitest run src/lib/onboarding/example-requirements.test.ts`
Expected: PASS, 5 tests. (This is eval **E5**.)

- [ ] **Step 8: Write the guard script**

Create `scripts/onboarding/check-example-needs-no-keys.sh`:

```bash
#!/usr/bin/env bash
# E1 / AC-1 — the bundled example demands no API key from anyone.
#
# The length floor is load-bearing, not decoration: a parser that returned an
# empty set would satisfy "every plugin needs no key" vacuously, and the eval
# would be green while measuring nothing. So the ids are PRINTED and counted.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

WORKFLOW="${1:-public/example.json}"
node scripts/onboarding/example-needs-no-keys.mjs "$WORKFLOW"
```

Create `scripts/onboarding/example-needs-no-keys.mjs`:

```js
#!/usr/bin/env node
/* Resolve the example's plugins and assert none declares a required env key.
 *
 * Reads each plugin's `tongflow.plugin.json` from the local plugins dir. A
 * plugin that is not installed is a hard error rather than a skip: a silent
 * skip is how "no plugin needs a key" becomes true by not looking. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const workflowPath = process.argv[2] ?? "public/example.json";
const workflow = JSON.parse(readFileSync(workflowPath, "utf8"));

const ids = [
    ...new Set(
        (workflow.executableNodes ?? [])
            .map((n) => n?.pluginId)
            .filter((id) => typeof id === "string" && id),
    ),
];

console.log(`example: ${workflowPath}`);
console.log(`plugins (literal list): ${JSON.stringify(ids)}`);

if (ids.length < 2) {
    console.error(
        `FAIL: expected >= 2 plugin ids, got ${ids.length}. An empty or ` +
            `single-element set would make the no-key claim vacuous.`,
    );
    process.exit(1);
}

let bad = 0;
for (const id of ids) {
    const manifestPath = join("plugins", id, "tongflow.plugin.json");
    if (!existsSync(manifestPath)) {
        console.error(
            `FAIL: ${id} is not installed, so its env manifest cannot be read. ` +
                `Install it and re-run — skipping it would prove nothing.`,
        );
        bad++;
        continue;
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const required = (manifest.env ?? []).filter((v) => v?.required === true);
    if (required.length > 0) {
        console.error(
            `FAIL: ${id} declares required env key(s): ` +
                required.map((v) => v.key).join(", "),
        );
        bad++;
    } else {
        console.log(`  ok  ${id} — no required env key`);
    }
}

process.exit(bad === 0 ? 0 : 1);
```

- [ ] **Step 9: Run the guard, then run its suppression half**

```bash
bash scripts/onboarding/check-example-needs-no-keys.sh
```
Expected: exit 0, prints both ids.

```bash
git show "$(git merge-base origin/main HEAD)":public/example.json > /tmp/old-example.json
bash scripts/onboarding/check-example-needs-no-keys.sh /tmp/old-example.json
```
Expected: **non-zero** — the pre-2026-08-07 Modal example must go RED. If it exits 0, the guard is not looking at anything.

- [ ] **Step 10: Commit**

```bash
chmod +x scripts/onboarding/check-example-needs-no-keys.sh
git add public/example.json public/example-assets src/lib/onboarding scripts/onboarding
git commit -m "feat(onboarding): bundled example runs locally with no API key"
```

---

### Task 2: The strip answers "can this machine run the example?"

**Files:**
- Create: `src/hooks/use-first-run-readiness.ts`
- Test: `src/hooks/use-first-run-readiness.test.ts`
- Modify: `src/components/workspace/first-run-strip.tsx`
- Modify: `src/components/workspace/workspace.tsx`

**Interfaces:**
- Consumes: `readExampleRequirements`, `missingPluginIds` (Task 1).
- Produces:
  ```ts
  export const EXAMPLE_COMPLETED_KEY = "oneflow.firstRun.exampleCompleted";
  export type ReadinessInput = {
      workflow: unknown;
      installedIds: readonly string[];
      pluginNames: Readonly<Record<string, string>>;
      exampleCompleted: boolean;
  };
  export function computeReadiness(input: ReadinessInput): FirstRunState | null;
  export function useFirstRunReadiness(): FirstRunState | null;
  ```
  `FirstRunState` is the type already exported by `first-run-strip.tsx`. `null` means render nothing.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/use-first-run-readiness.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { computeReadiness } from "./use-first-run-readiness";

const workflow = {
    executableNodes: [
        { pluginId: "p-split", feature: "split-video" },
        { pluginId: "p-concat", feature: "concat-videos" },
    ],
};
const names = { "p-split": "Tách cảnh video", "p-concat": "Cắt ghép video" };

describe("computeReadiness", () => {
    it("suppresses the strip once the example has completed a run", () => {
        expect(
            computeReadiness({
                workflow,
                installedIds: [],
                pluginNames: names,
                exampleCompleted: true,
            }),
        ).toBeNull();
    });

    it("still helps a workspace that has not completed a run", () => {
        // Suppression half: "never nag" must not become "never help".
        const state = computeReadiness({
            workflow,
            installedIds: [],
            pluginNames: names,
            exampleCompleted: false,
        });
        expect(state?.phase).toBe("missing-plugins");
    });

    it("describes what is missing in human words, never plugin ids", () => {
        const state = computeReadiness({
            workflow,
            installedIds: [],
            pluginNames: names,
            exampleCompleted: false,
        });
        if (state?.phase !== "missing-plugins") throw new Error("wrong phase");
        expect(state.capabilities).toEqual(["Tách cảnh video", "Cắt ghép video"]);
        expect(JSON.stringify(state)).not.toContain("p-split");
    });

    it("reports ready when every plugin is present but the run has not happened", () => {
        const state = computeReadiness({
            workflow,
            installedIds: ["p-split", "p-concat"],
            pluginNames: names,
            exampleCompleted: false,
        });
        expect(state?.phase).toBe("ready");
    });

    it("falls back to a readable label when a plugin ships no display name", () => {
        const state = computeReadiness({
            workflow,
            installedIds: [],
            pluginNames: {},
            exampleCompleted: false,
        });
        if (state?.phase !== "missing-plugins") throw new Error("wrong phase");
        // Still not the raw id — the type must make an id unrepresentable here.
        expect(state.capabilities.every((c) => !c.startsWith("p-"))).toBe(true);
    });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/hooks/use-first-run-readiness.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the pure core plus the hook**

Create `src/hooks/use-first-run-readiness.ts`. `computeReadiness` is pure and is what the test drives; the hook is the thin React wrapper that feeds it.

```ts
"use client";

import { useEffect, useState } from "react";
import type { FirstRunState } from "@/components/workspace/first-run-strip";
import { usePluginsRegistry } from "@/hooks/use-plugins-registry";
import {
    missingPluginIds,
    readExampleRequirements,
} from "@/lib/onboarding/example-requirements";

/**
 * Whether this workspace has ever completed the bundled example.
 *
 * Stored, not derived: the strip is guidance and must not reappear after the
 * user has already been through it. This is a single boolean about THIS
 * browser's own state — it is never sent anywhere (AC-12).
 */
export const EXAMPLE_COMPLETED_KEY = "oneflow.firstRun.exampleCompleted";

/** Human label for a slot, used when a plugin ships no display name. */
const SLOT_LABELS: Readonly<Record<string, string>> = {
    "split-video": "Tách cảnh video",
    "concat-videos": "Cắt ghép video",
};

const FALLBACK_CAPABILITY = "Một bộ xử lý video";

export type ReadinessInput = {
    workflow: unknown;
    installedIds: readonly string[];
    /** pluginId → display name from the plugin's own manifest. */
    pluginNames: Readonly<Record<string, string>>;
    exampleCompleted: boolean;
};

/**
 * The strip's state, or `null` for "render nothing".
 *
 * Pure so the decision can be tested without a browser, a registry or a clock.
 */
export function computeReadiness(input: ReadinessInput): FirstRunState | null {
    if (input.exampleCompleted) return null;

    const reqs = readExampleRequirements(input.workflow);
    if (reqs.length === 0) return null;

    const missing = missingPluginIds(reqs, input.installedIds);
    if (missing.length === 0) return { phase: "ready" };

    // Ids never cross this boundary: the strip's prop is `capabilities`, and
    // translating a plugin into words is this layer's job, not the view's.
    const capabilities = missing.map((id) => {
        const named = input.pluginNames[id];
        if (named) return named;
        const req = reqs.find((r) => r.pluginId === id);
        return (req && SLOT_LABELS[req.feature]) || FALLBACK_CAPABILITY;
    });

    return { phase: "missing-plugins", capabilities, downloadMb: 0 };
}

export function useFirstRunReadiness(): FirstRunState | null {
    // The registry already has a deduplicating store of its own; fetching it a
    // second time here would race the copy the rest of the canvas reads.
    const { registry } = usePluginsRegistry();
    const [workflow, setWorkflow] = useState<unknown>(null);
    const [exampleCompleted, setExampleCompleted] = useState(true);

    useEffect(() => {
        // localStorage is read once, in an effect, because it does not exist
        // during the server render. Starting from `true` means the strip is
        // absent until we positively know it is a first run — the wrong way to
        // be wrong is to flash guidance at someone who already finished.
        setExampleCompleted(localStorage.getItem(EXAMPLE_COMPLETED_KEY) === "1");
    }, []);

    useEffect(() => {
        let cancelled = false;
        void fetch("/example.json")
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (!cancelled) setWorkflow(json);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!registry || !workflow) return null;

    return computeReadiness({
        workflow,
        installedIds: Object.keys(registry.plugins),
        pluginNames: Object.fromEntries(
            Object.entries(registry.plugins).flatMap(([id, meta]) =>
                meta.name ? [[id, meta.name] as const] : [],
            ),
        ),
        exampleCompleted,
    });
}
```

**Why it is shaped like this.** `usePluginsRegistry()` (`src/hooks/use-plugins-registry.ts`) is the repo's existing zustand-backed registry store, with request deduplication already in it — a second `fetch("/api/plugins/registry")` here would race the copy the node pickers read. `registry.plugins` is keyed by plugin id and each entry carries the `name` merged from `tongflow.plugin.json`, which is exactly the human label AC-4 needs. The final state is **derived during render**, not mirrored into a third `useState` and synced by an effect.

- [ ] **Step 4: Run the test**

Run: `pnpm vitest run src/hooks/use-first-run-readiness.test.ts`
Expected: PASS, 5 tests. (This is eval **E3**.)

- [ ] **Step 5: Mount the strip in the workspace**

In `src/components/workspace/workspace.tsx`, render above the canvas container:

```tsx
const firstRun = useFirstRunReadiness();
// ...
{firstRun ? <FirstRunStrip state={firstRun} onPrepare={handlePrepare} /> : null}
```

The strip is guidance, never a gate (AC-13): no modal, no overlay, no `pointer-events: none` on the canvas, no focus trap. Mark the completion when a run of the example finishes:

```ts
localStorage.setItem(EXAMPLE_COMPLETED_KEY, "1");
```

- [ ] **Step 6: Verify in the browser**

```bash
pnpm dev
```
Open `/workspace` with `plugins/` emptied. Expected: the strip names both capabilities in the first painted frame (**E6**), the canvas still drags and accepts a new node (**E4**), and after a completed run plus reload the strip is gone.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/use-first-run-readiness.ts src/hooks/use-first-run-readiness.test.ts src/components/workspace/first-run-strip.tsx src/components/workspace/workspace.tsx
git commit -m "feat(onboarding): first-run strip reports what the example needs"
```

---

### Task 3: One press installs the whole set

**Files:**
- Create: `src/lib/onboarding/install-missing.ts`
- Create: `scripts/onboarding/check-one-action-installs-all.sh`
- Create: `scripts/onboarding/check-no-restart-after-install.sh`
- Modify: `src/components/workspace/first-run-strip.tsx` (wire `onPrepare`)

**Interfaces:**
- Consumes: `missingPluginIds` (Task 1), `installPlugin` / `isPluginInstalled` from `src/lib/plugins/plugins-install.server.ts`.
- Produces:
  ```ts
  export type InstallMissingResult = { installed: string[]; skipped: string[]; failed: string[] };
  export async function installMissingForExample(ids: readonly string[]): Promise<InstallMissingResult>;
  ```

> **The gap this task closes.** A function that installs everything, and a button that calls nothing, both look correct in isolation and both pass a unit test of the function. E7 measures the function; **E21 measures the button**. Do not let the button own any of the set logic — it passes the whole list down.

- [ ] **Step 1: Implement the install-all seam**

Create `src/lib/onboarding/install-missing.ts`:

```ts
import {
    installPlugin,
    isPluginInstalled,
} from "@/lib/plugins/plugins-install.server";

export type InstallMissingResult = {
    installed: string[];
    /** Already present — never re-cloned. */
    skipped: string[];
    failed: string[];
};

/**
 * Install every plugin in `ids` that is not already present.
 *
 * One call for the whole set: the strip's single action hands the full list
 * here, so "one press installs everything" is a property of this function plus
 * one call site, not of a loop the view maintains.
 */
export async function installMissingForExample(
    ids: readonly string[],
): Promise<InstallMissingResult> {
    const installed: string[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];

    for (const id of ids) {
        if (isPluginInstalled(id)) {
            skipped.push(id);
            continue;
        }
        try {
            await installPlugin({ id });
            installed.push(id);
        } catch {
            failed.push(id);
        }
    }

    return { installed, skipped, failed };
}
```

- [ ] **Step 2: Wire the strip's single action**

The handler passes the whole missing set in one call and never loops in the view:

```tsx
const handlePrepare = async () => {
    const res = await fetch("/api/plugins/install-missing", { method: "POST" });
    // ... drive the strip's `installing` phase from the response
    // No restart, no reload: re-pull the registry the rest of the canvas reads.
    await refreshPluginsRegistry();
};
```

`refreshPluginsRegistry()` is exported from `src/hooks/use-plugins-registry.ts`. Using it is what makes AC-6 visible in the product rather than merely true on the server — the install route already rescans, but the client store has to be told.

Add `src/app/api/plugins/install-missing/route.ts` calling `installMissingForExample`. `src/app/api/**` is **not** a t3 path in this repo's config — confirm against `_acceptance/config.yaml` `t3_paths` before writing, and if it is listed, put the call in an existing route instead.

- [ ] **Step 3: Write the guard for the function**

Create `scripts/onboarding/check-one-action-installs-all.sh` — from an empty plugins dir, one call installs every id; with one already present it installs only the remainder and re-clones nothing. Assert `skipped` contains the pre-existing id.

- [ ] **Step 4: Write the no-restart guard**

Create `scripts/onboarding/check-no-restart-after-install.sh` — install a plugin, then query the registry **in the same process**, and assert the new plugin is registered. This pins an advantage OneFlow has over ComfyUI, so it is expected to be green on the baseline too; that is what a regression guard is.

- [ ] **Step 5: Run both guards**

```bash
bash scripts/onboarding/check-one-action-installs-all.sh
bash scripts/onboarding/check-no-restart-after-install.sh
```
Expected: exit 0 each. (**E7**, **E8**.)

- [ ] **Step 6: Verify the button, not just the function**

With `plugins/` emptied, open `/workspace`, press the strip's action **exactly once**, wait for ready, then open the plugin manager. Every id named in the first frame must appear installed. (**E21** — this is the half a unit test cannot reach.)

- [ ] **Step 7: Commit**

```bash
git add src/lib/onboarding/install-missing.ts src/app/api/plugins/install-missing scripts/onboarding src/components/workspace/first-run-strip.tsx
git commit -m "feat(onboarding): one strip action installs every missing plugin"
```

---

### Task 4: Real provisioning milestones — the T3 change

`independent: true` — touches a different subsystem from Tasks 2, 3, 5, 6.

**Files:**
- Create: `src/lib/plugin-executor/provisioning-events.ts`
- Test: `src/lib/plugin-executor/provisioning-events.test.ts`
- Modify: `src/lib/plugins/plugin-python-env.server.ts`
- Modify: `src/lib/plugin-executor/runners/generic.ts` ← **the one t3 path**

**Interfaces:**
- Produces:
  ```ts
  export type ProvisioningStep = "create-venv" | "install-sdk" | "install-requirements";
  export type ProvisioningEvent = { step: ProvisioningStep; phase: "started" | "completed" };
  export type OnMilestone = (event: ProvisioningEvent) => void;
  export function provisioningMessage(event: ProvisioningEvent): string;
  ```
- `ensurePluginPython(pluginId, pluginDir, onMilestone?)` — third parameter optional, so no existing caller changes.

> **A decision worth vetoing at Gate 1.5.** E9 requires each milestone to be emitted *after* the work it names completed. That alone leaves the screen with nothing to say during the first long wait, which is what AC-8 forbids. So each real step emits **two** events: `started` (this step has begun — true when emitted) and `completed` (this step finished — true when emitted). Neither claims something that has not happened. The test asserts the `completed` stream in order, and asserts that a skipped step emits **neither**. If you would rather emit only `completed` and have the strip say nothing until the first one lands, say so now — it is a one-line change here and a large one later.

- [ ] **Step 1: Write the failing test**

Create `src/lib/plugin-executor/provisioning-events.test.ts`:

```ts
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { ProvisioningEvent } from "./provisioning-events";

describe("provisioning milestones", () => {
    let pluginDir: string;
    let events: ProvisioningEvent[];

    beforeEach(() => {
        pluginDir = mkdtempSync(join(tmpdir(), "bko-plugin-"));
        events = [];
    });

    it("emits the three steps in order, each completion after its work", async () => {
        writeFileSync(join(pluginDir, "requirements.txt"), "packaging\n");
        const { ensurePluginPython } = await import(
            "@/lib/plugins/plugin-python-env.server"
        );

        await ensurePluginPython(`bko-${Date.now()}`, pluginDir, (e) =>
            events.push(e),
        );

        const completed = events
            .filter((e) => e.phase === "completed")
            .map((e) => e.step);
        expect(completed).toEqual([
            "create-venv",
            "install-sdk",
            "install-requirements",
        ]);
        // Every completion is preceded by its own start.
        for (const step of completed) {
            const startIdx = events.findIndex(
                (e) => e.step === step && e.phase === "started",
            );
            const doneIdx = events.findIndex(
                (e) => e.step === step && e.phase === "completed",
            );
            expect(startIdx).toBeGreaterThanOrEqual(0);
            expect(startIdx).toBeLessThan(doneIdx);
        }
        rmSync(pluginDir, { recursive: true, force: true });
    });

    it("emits NO create-venv milestone when the venv already exists", async () => {
        // Suppression half, and the load-bearing one: a milestone fired on a
        // code path that did nothing is exactly the simulated bar AC-7 bans.
        const pluginId = `bko-cached-${Date.now()}`;
        const { ensurePluginPython } = await import(
            "@/lib/plugins/plugin-python-env.server"
        );

        await ensurePluginPython(pluginId, pluginDir, () => {});
        await ensurePluginPython(pluginId, pluginDir, (e) => events.push(e));

        expect(events.some((e) => e.step === "create-venv")).toBe(false);
        rmSync(pluginDir, { recursive: true, force: true });
    });

    it("emits no requirements milestone for a plugin that declares none", async () => {
        const pluginId = `bko-noreq-${Date.now()}`;
        const { ensurePluginPython } = await import(
            "@/lib/plugins/plugin-python-env.server"
        );

        await ensurePluginPython(pluginId, pluginDir, (e) => events.push(e));

        expect(events.some((e) => e.step === "install-requirements")).toBe(false);
        rmSync(pluginDir, { recursive: true, force: true });
    });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/lib/plugin-executor/provisioning-events.test.ts`
Expected: FAIL — `./provisioning-events` not found, and `ensurePluginPython` takes two arguments.

- [ ] **Step 3: Create the vocabulary**

Create `src/lib/plugin-executor/provisioning-events.ts`:

```ts
/**
 * Provisioning milestones streamed to the client while a plugin's Python
 * environment is built.
 *
 * These are NOT a progress bar. Each event is emitted at the moment the thing
 * it names actually starts or actually finishes, and a step that is skipped
 * (cached venv, no requirements.txt) emits nothing at all. With a wait that can
 * run into minutes, the difference between "installing the third dependency"
 * and silence is the difference between waiting and force-quitting — but a bar
 * that advances on a timer would be a promise, not a fact.
 */

export type ProvisioningStep =
    | "create-venv"
    | "install-sdk"
    | "install-requirements";

export type ProvisioningEvent = {
    step: ProvisioningStep;
    /** `started` means the work began; `completed` means it exited cleanly. */
    phase: "started" | "completed";
};

export type OnMilestone = (event: ProvisioningEvent) => void;

const STARTED_TEXT: Readonly<Record<ProvisioningStep, string>> = {
    "create-venv": "Đang tạo môi trường Python",
    "install-sdk": "Đang cài bộ thư viện lõi",
    "install-requirements": "Đang cài thư viện của công cụ",
};

const COMPLETED_TEXT: Readonly<Record<ProvisioningStep, string>> = {
    "create-venv": "Đã tạo xong môi trường Python",
    "install-sdk": "Đã cài xong bộ thư viện lõi",
    "install-requirements": "Đã cài xong thư viện của công cụ",
};

/** Human sentence for a milestone; the client displays this verbatim. */
export function provisioningMessage(event: ProvisioningEvent): string {
    return event.phase === "started"
        ? STARTED_TEXT[event.step]
        : COMPLETED_TEXT[event.step];
}
```

- [ ] **Step 4: Thread the callback through provisioning**

In `src/lib/plugins/plugin-python-env.server.ts`:

1. `ensureVenv(pluginId, onMilestone?)` — emit `{step:"create-venv",phase:"started"}` immediately before `python -m venv`, and `completed` only after `mk.code === 0`. Both live **inside** the `if (!existsSync(py))` block, so a cached venv emits neither. Same shape around the SDK install.
2. `ensurePluginRequirements(pluginId, pluginDir, py, onMilestone?)` — emit after the early returns, so an absent or unchanged `requirements.txt` emits nothing.
3. `ensurePluginPython(pluginId, pluginDir, onMilestone?)` — pass it down.
4. **Update the docstring.** It currently says the signature is deliberately unchanged because `runners/generic.ts` is under a t3 path "this change must not touch". That was the previous feature's constraint and is now false — this feature is declared T3 for exactly that file. Leaving the old sentence there would misdirect the next reader.

- [ ] **Step 5: Forward milestones to the client**

In `src/lib/plugin-executor/runners/generic.ts`, replace line 53:

```ts
const python = await ensurePluginPython(req.pluginId, pluginDir, (event) => {
    notifyTask(req.taskId, TaskStatus.RUNNING, {
        message: provisioningMessage(event),
        provisioning: event,
    });
});
```

Also fix the two stale comments just above it: the venv is per-plugin, not shared, and provisioning no longer falls back to a bare interpreter for a plugin that declares requirements.

- [ ] **Step 6: Run the test**

Run: `pnpm vitest run src/lib/plugin-executor/provisioning-events.test.ts`
Expected: PASS, 3 tests. (This is eval **E9**.) The first test builds a real venv, so allow it a generous timeout.

- [ ] **Step 7: Verify on screen**

Remove the venv for the example's plugin so provisioning really runs, then press Run. Each label on screen must be one the server emitted, in order (**E10**), and after 60+ seconds the last reached milestone must still be on screen (**E11**). A bare spinner fails both.

- [ ] **Step 8: Commit**

```bash
git add src/lib/plugin-executor src/lib/plugins/plugin-python-env.server.ts
git commit -m "feat(executor): stream real provisioning milestones to the client"
```

---

### Task 5: The key is asked for at the node, and tested on save

`independent: true`.

**Files:**
- Create: `src/lib/onboarding/key-verify.ts`
- Test: `src/lib/onboarding/key-verify.test.ts`
- Modify: `src/app/api/settings/env/route.ts`
- Modify: `src/components/workspace/nodes/base/abi-node-shell.tsx`

**Interfaces:**
- Produces:
  ```ts
  export type KeyVerdict = { works: boolean; detail: string };
  export type Prober = (envKey: string, value: string) => Promise<Response>;
  export async function verifyKey(envKey: string, value: string, probe?: Prober): Promise<KeyVerdict>;
  ```

> **The hole this task fills.** The original design listed no file that verified anything and put the key-storage path under "do not touch". That combination pushes an implementer down the cheapest road: a regex in the component. A shape check passes a naive eval and ships an expired key reported as working. **Verification means asking the thing the key unlocks.** `verifyKey` must make an outbound call; E13 asserts with a spy that the call *happened*, and its decisive fixture is a key that is well-formed and rejected.

- [ ] **Step 1: Write the failing test**

Create `src/lib/onboarding/key-verify.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { verifyKey } from "./key-verify";

describe("verifyKey", () => {
    it("actually calls out to the provider", async () => {
        const probe = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
        await verifyKey("OPENAI_API_KEY", "sk-proj-aaaaaaaaaaaaaaaaaaaa", probe);
        // The call HAPPENED — not merely that a boolean came back.
        expect(probe).toHaveBeenCalledTimes(1);
    });

    it("reports a well-formed but rejected key as not working", async () => {
        // The decisive fixture: shape-valid, provider-rejected. A regex check
        // would call this key good, which is the whole failure being guarded.
        const probe = vi
            .fn()
            .mockResolvedValue(new Response("{}", { status: 401 }));
        const verdict = await verifyKey(
            "OPENAI_API_KEY",
            "sk-proj-aaaaaaaaaaaaaaaaaaaa",
            probe,
        );
        expect(verdict.works).toBe(false);
        expect(verdict.detail).toContain("401");
    });

    it("confirms a key the provider accepts", async () => {
        const probe = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
        const verdict = await verifyKey("OPENAI_API_KEY", "sk-proj-good", probe);
        expect(verdict.works).toBe(true);
    });

    it("says it could not tell rather than guessing when the probe throws", async () => {
        const probe = vi.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
        const verdict = await verifyKey("OPENAI_API_KEY", "sk-proj-x", probe);
        expect(verdict.works).toBe(false);
        expect(verdict.detail).toContain("ENOTFOUND");
    });

    it("refuses a key for an env var it has no prober for, without inventing a verdict", async () => {
        const verdict = await verifyKey("SOME_UNKNOWN_KEY", "x");
        expect(verdict.works).toBe(false);
        expect(verdict.detail).toMatch(/không kiểm tra được|no prober/i);
    });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/lib/onboarding/key-verify.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/lib/onboarding/key-verify.ts`. A registry of per-provider probes, each hitting the cheapest authenticated endpoint that provider offers; the default export takes an injectable `probe` so the test can drive it without network.

```ts
/**
 * Does this key actually work?
 *
 * Verification means asking the thing the key unlocks. It explicitly does NOT
 * mean checking the key's shape: a well-formed key that the provider rejects is
 * the case that matters, and a regex calls it good. "Saved" has to mean
 * "usable", or the user discovers the truth one failed run later.
 */

export type KeyVerdict = { works: boolean; detail: string };
export type Prober = (envKey: string, value: string) => Promise<Response>;

const PROBES: Readonly<Record<string, Prober>> = {
    OPENAI_API_KEY: (_k, value) =>
        fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${value}` },
        }),
    // Add one entry per provider whose plugins declare a required key.
};

export async function verifyKey(
    envKey: string,
    value: string,
    probe?: Prober,
): Promise<KeyVerdict> {
    const run = probe ?? PROBES[envKey];
    if (!run) {
        return {
            works: false,
            detail: `Chưa kiểm tra được khoá cho ${envKey} (no prober).`,
        };
    }
    try {
        const res = await run(envKey, value);
        return res.ok
            ? { works: true, detail: "Nhà cung cấp chấp nhận khoá này." }
            : {
                  works: false,
                  detail: `Nhà cung cấp từ chối khoá này (HTTP ${res.status}).`,
              };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { works: false, detail: `Không gọi được tới nhà cung cấp: ${message}` };
    }
}
```

- [ ] **Step 4: Run the test**

Run: `pnpm vitest run src/lib/onboarding/key-verify.test.ts`
Expected: PASS, 5 tests. (This is eval **E13**.)

- [ ] **Step 5: Add the verification branch on save**

In `src/app/api/settings/env/route.ts`, after `saveEnvStore` succeeds, run `verifyKey` for each changed key and return the verdicts in the response. The storage path itself is unchanged — this feature only adds a road to it (design doc, "Đính chính blast radius").

- [ ] **Step 6: Put the form on the node**

In `abi-node-shell.tsx`, when a task fails with a missing/invalid key, render `<NodeKeyPrompt envKey={...} providerName={...} />` inline. The settings dialog must never open during this sequence (**E12**), and the UI must state the server-derived verdict rather than an optimistic toast (**E14**).

- [ ] **Step 7: Commit**

```bash
git add src/lib/onboarding/key-verify.ts src/lib/onboarding/key-verify.test.ts src/app/api/settings/env/route.ts src/components/workspace/nodes/base/abi-node-shell.tsx src/components/workspace/node-key-prompt.tsx
git commit -m "feat(onboarding): enter the key at the node and test it on save"
```

---

### Task 6: The right exit for the right failure

`independent: true`.

**Files:**
- Create: `src/lib/onboarding/failure-actions.ts`
- Test: `src/lib/onboarding/failure-actions.test.ts`
- Modify: `src/components/workspace/task-failure-toaster.tsx`

**Interfaces:**
- Produces:
  ```ts
  export type FailureAction =
      | { kind: "install-plugin"; pluginId: string }
      | { kind: "enter-key"; envKey: string }
      | { kind: "none" };
  export function classifyFailure(message: string): FailureAction;
  ```

- [ ] **Step 1: Write the failing test**

Create `src/lib/onboarding/failure-actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { classifyFailure } from "./failure-actions";

describe("classifyFailure", () => {
    it("maps a missing plugin to the plugin manager, filtered to that plugin", () => {
        const action = classifyFailure(
            "No plugin installed for nodeSlot=split-video (oneflow-api-pyscenedetect)",
        );
        expect(action).toEqual({
            kind: "install-plugin",
            pluginId: "oneflow-api-pyscenedetect",
        });
    });

    it("maps a missing key to the key form, naming the env var", () => {
        const action = classifyFailure("Missing required env var OPENAI_API_KEY");
        expect(action).toEqual({ kind: "enter-key", envKey: "OPENAI_API_KEY" });
    });

    it("offers NO action for an error it does not understand", () => {
        // Suppression half: inventing a plausible button for an unrecognised
        // error sends the user somewhere useless and looks like help.
        expect(classifyFailure("ffmpeg exited with code 137")).toEqual({
            kind: "none",
        });
        expect(classifyFailure("")).toEqual({ kind: "none" });
    });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/lib/onboarding/failure-actions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
/**
 * Turn a task failure into the one exit that actually helps.
 *
 * Three outcomes only, and the third is deliberately empty: an error we did not
 * recognise gets today's plain message and no button. A plausible-looking
 * action for an unknown cause is worse than none — it looks like help and ends
 * somewhere useless.
 */

export type FailureAction =
    | { kind: "install-plugin"; pluginId: string }
    | { kind: "enter-key"; envKey: string }
    | { kind: "none" };

const MISSING_PLUGIN = /no plugin installed for nodeslot=\S+\s*\(([^)]+)\)/i;
const MISSING_KEY = /missing required env var ([A-Z][A-Z0-9_]*)/i;

export function classifyFailure(message: string): FailureAction {
    const plugin = MISSING_PLUGIN.exec(message);
    if (plugin) return { kind: "install-plugin", pluginId: plugin[1] };

    const key = MISSING_KEY.exec(message);
    if (key) return { kind: "enter-key", envKey: key[1] };

    return { kind: "none" };
}
```

> Confirm both patterns against the strings the runner actually produces (`runners/generic.ts`, `execute.ts`) before settling on them. A regex tuned to an imagined message is a test that passes and a product that does not.

- [ ] **Step 4: Run the test**

Run: `pnpm vitest run src/lib/onboarding/failure-actions.test.ts`
Expected: PASS, 3 tests. (This is eval **E15**.)

- [ ] **Step 5: Render the action**

In `task-failure-toaster.tsx`, call `classifyFailure` and render the matching control; on `kind: "none"` render exactly today's message and nothing more.

- [ ] **Step 6: Commit**

```bash
git add src/lib/onboarding/failure-actions.ts src/lib/onboarding/failure-actions.test.ts src/components/workspace/task-failure-toaster.tsx
git commit -m "feat(onboarding): match the recovery action to the failure cause"
```

---

### Task 7: The two constraint guards

`independent: true`.

**Files:**
- Create: `scripts/onboarding/check-no-telemetry-sinks.sh`
- Create: `scripts/onboarding/telemetry-fixture/` (the teeth fixture)
- Modify: `scripts/acceptance/check-t3-untouched.sh`, `scripts/acceptance/t3-scan.mjs`
- Modify: `_acceptance/config.yaml` (`bko_tier_boundary`)

- [ ] **Step 1: Write the telemetry scan**

`check-no-telemetry-sinks.sh` scans `src/**` and `package.json` for **transport shapes**, not package names: `navigator.sendBeacon`, `fetch`/`XMLHttpRequest` to a non-app origin, and analytics SDK imports. A scan that only greps package names is precisely the gap being closed.

- [ ] **Step 2: Give it teeth**

Create a fixture file containing a real `navigator.sendBeacon("https://example.com/t", ...)` call and run the guard against it.

```bash
bash scripts/onboarding/check-no-telemetry-sinks.sh scripts/onboarding/telemetry-fixture
```
Expected: **non-zero**, naming the offending path. A guard that stays green here proves nothing about the real tree.

- [ ] **Step 3: Run it against the real tree**

```bash
bash scripts/onboarding/check-no-telemetry-sinks.sh
```
Expected: exit 0. (**E17**.)

- [ ] **Step 4: Teach the tier guard `--allow` and `--require`**

`_acceptance/config.yaml` already declares `bko_tier_boundary` with `--allow src/lib/plugin-executor/**`, but `check-t3-untouched.sh` has no such flag today — it would be silently ignored and the eval would fail on this feature's own legitimate change. E18 additionally demands the guard assert the diff window is **non-empty** and that `src/lib/plugin-executor/**` **is** touched.

Add to `t3-scan.mjs`: `--allow <glob>` (exclude from the forbidden set, repeatable) and `--require <glob>` (fail if *absent*). Add to the shell wrapper: fail when the changed-file list is empty, because an empty window makes every absence claim vacuous.

Then update the declared command:

```yaml
bko_tier_boundary: "bash scripts/acceptance/check-t3-untouched.sh byo-key-onboarding origin/main --allow 'src/lib/plugin-executor/**' --require 'src/lib/plugin-executor/**'"
```

- [ ] **Step 5: Run it**

```bash
bash scripts/acceptance/check-t3-untouched.sh byo-key-onboarding origin/main --allow 'src/lib/plugin-executor/**' --require 'src/lib/plugin-executor/**'
```
Expected: exit 0 — window non-empty, `src/lib/plugin-executor/**` touched, zero files under `config/tongflow.abi.json`, `src/generated/abi/**`, `sdk/**`, `src/db/**`. (**E18**.)

- [ ] **Step 6: Commit**

```bash
git add scripts/onboarding scripts/acceptance _acceptance/config.yaml
git commit -m "chore(acceptance): telemetry and tier-boundary guards for byo-key-onboarding"
```

---

### Task 8: Re-measure the surface after it changed

The design-pass verdict was earned on the components as they were at Gate 1. Tasks 2–5 change their props and states, so the measurement has to be re-earned rather than inherited.

**Files:**
- Modify: `src/components/proto/byo-key-onboarding-proto.tsx` (fixtures follow the real prop types)
- Modify: `_acceptance/byo-key-onboarding/design-pass.md` (re-capture note)

- [ ] **Step 1: Realign the prototype fixtures**

Update the fixtures to the props the components now take. If a fixture no longer typechecks, that is the point — the prototype and the shipped component share one type.

- [ ] **Step 2: Re-run the a11y scan across all twenty pages**

```bash
pnpm dev
node scripts/a11y-scan.mjs \
  $(for s in missing installing provisioning ready blocked result needs-key key-verifying key-invalid key-verified; do \
      echo "http://localhost:3000/proto/byo-key-onboarding?state=$s"; \
      echo "http://localhost:3000/proto/byo-key-onboarding?state=$s&theme=dark"; \
    done) \
  --fail-on critical,serious --json _acceptance/byo-key-onboarding/evidence/design-pass/a11y.json
```
Expected: `"verdict": "PASS"`, twenty pages, zero critical/serious. Exit 3 means it reached no page — that is a failure, not a clean sheet. (**E19**.)

- [ ] **Step 3: Full repo check**

```bash
pnpm lint:check && pnpm typecheck && pnpm build
```
Expected: all three clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/proto _acceptance/byo-key-onboarding
git commit -m "chore(onboarding): re-measure accessibility after the surface changed"
```

---

## Task order and independence

| Task | Depends on | `independent` |
|---|---|---|
| 1 — bundled example | — | false (foundation) |
| 2 — readiness + strip | 1 | false |
| 3 — install-all | 2 | false |
| 4 — provisioning milestones | — | **true** |
| 5 — key at node + verify | — | **true** |
| 6 — failure actions | — | **true** |
| 7 — constraint guards | — | **true** |
| 8 — re-measure | 2,3,4,5 | false |

Tasks 4, 5, 6 and 7 touch disjoint files and can run in parallel with the 1→2→3 chain.

## Self-review

**Spec coverage.** Every AC has a task: AC-1/2 → T1; AC-3/13 → T2; AC-4 → T1+T2; AC-5/6 → T3; AC-7/8 → T4; AC-9/10 → T5; AC-11 → T6; AC-12/14 → T7; AC-15 → the observed session, which no task can substitute for.

**Gaps found and closed while writing this.**
1. `bko_tier_boundary` was declared at Gate 1 with an `--allow` flag the guard does not implement. Now Task 7 Step 4.
2. `example.json`'s exported shape cannot be safely hand-authored; Task 1 Step 2 goes through the app's own exporter instead.
3. The `ensurePluginPython` docstring asserts a constraint this feature deliberately breaks. Now Task 4 Step 4.
4. The two comments above `runners/generic.ts:51` still describe the pre-`local-cpu-plugins` shared venv with a blanket fallback. Now Task 4 Step 5.
5. Both plugin manifests point `icon` at `/plugins/oneflow-local-*.svg` while the ids are `oneflow-api-*` — a leftover from the rename. Out of scope here; worth a separate item.
6. The readiness hook first drafted its own `fetch("/api/plugins/registry")`. The repo already has `usePluginsRegistry()` — a zustand store with request deduplication — plus `refreshPluginsRegistry()` and per-plugin display names. A second fetch would have raced the copy the node pickers read. Now Task 2 Step 3 and Task 3 Step 2.

**Type consistency.** `FirstRunState` is defined once, in `first-run-strip.tsx`, and imported by the hook. `ProvisioningStep` values match the strings the test asserts. `capabilities` (never `pluginIds`) and `providerName` (never `pluginId`) are the only names crossing into the view.

**Open question for Gate 1.5.** The two-phase milestone decision in Task 4 — see the note there.
