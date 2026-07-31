import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { mapSSEStatusToTaskStatus, NodeStatus } from "@/constants/task-status";
import type { ResolvedOutputRoute } from "@/lib/schema/tongflow-abi";
import { mapEngineEvent } from "@/lib/task/engine-events";
import { applyResolvedOutputRoutes } from "@/lib/task/payload";
import type { SSEMessage } from "@/types/sse";

/**
 * `node_cached` crosses three layers, and two of them can swallow it without
 * the first noticing: the SSE payload and the client-side parser. A test that
 * stops at the delegate would pass while `fingerprint` and `tier` never reach
 * the browser — and that only surfaces at L2, exactly when this wiring was
 * supposed to have already been paid for.
 *
 * Nothing emits this event yet. That is the point: the path is proven before
 * the cache exists, so the cache slice adds a call to emit() instead of
 * plumbing three layers while solving the hard part.
 */

const FINGERPRINT = "f".repeat(64);

// Resolved from this file, not from cwd: a cwd-relative walk makes the switch
// guard below pass or throw depending on where vitest was invoked from.
const SRC_ROOT = resolve(import.meta.dirname, "../..");
const THIS_FILE = join(SRC_ROOT, "lib/task/node-cached.test.ts");
/** Every switch that must keep NODE_COMPLETED and NODE_CACHED together. */
const KNOWN_SWITCH_SITES = [
    join(SRC_ROOT, "components/workspace/execution-status-line.tsx"),
    join(SRC_ROOT, "constants/task-status.ts"),
    join(SRC_ROOT, "hooks/use-workflow-execution.ts"),
    join(SRC_ROOT, "hooks/use-workflow-recovery.ts"),
].sort();

function engineEvent(): Record<string, unknown> {
    return {
        type: "node_cached",
        nodeId: "node-1",
        feature: "image-gen",
        label: "Generate",
        fingerprint: FINGERPRINT,
        tier: "A",
    };
}

describe("node_cached across delegate, SSE payload, and client parser", () => {
    it("preserves fingerprint and tier end to end", () => {
        // Layer 1 — the delegate's mapping.
        const mapped = mapEngineEvent(engineEvent());
        expect(mapped).not.toBeNull();
        expect(mapped?.status).toBe(NodeStatus.NODE_CACHED);
        expect(mapped?.nodeId).toBe("node-1");

        // Layer 2 — serialized exactly as the SSE route writes it
        // (`data: ${JSON.stringify(event)}\n\n` in api/task/wait/route.ts).
        const wire = `data: ${JSON.stringify({
            id: "task-1",
            status: mapped?.status,
            nodeId: "node-1",
            data: mapped?.data,
        })}\n\n`;

        // Layer 3 — what the client parser gets back out.
        const parsed = JSON.parse(
            wire.slice("data: ".length).trimEnd(),
        ) as SSEMessage;
        expect(parsed.status).toBe(NodeStatus.NODE_CACHED);
        expect(parsed.data?.fingerprint).toBe(FINGERPRINT);
        expect(parsed.data?.tier).toBe("A");
    });

    it("counts as a completed node, so the canvas stops waiting on it", () => {
        expect(mapSSEStatusToTaskStatus(NodeStatus.NODE_CACHED)).toBe(
            "COMPLETED",
        );
    });

    it("every consumer that handles NODE_COMPLETED also handles NODE_CACHED", () => {
        // Three separate client switches read this stream — the live run, the
        // reconnect replay, and the progress line — and none has a `default:`
        // arm, so a missing case falls through in silence. `message.status` is
        // a plain string, so TypeScript offers no exhaustiveness check either.
        // Only two of the three were wired at first; this pins the third and
        // any future fourth. A static read is the only option here: the vitest
        // environment is `node` and the repo has no React testing library.
        const files: string[] = [];
        const walk = (dir: string): void => {
            for (const e of readdirSync(dir, { withFileTypes: true })) {
                const p = join(dir, e.name);
                if (e.isDirectory()) walk(p);
                // This file quotes both case labels as string literals, so it
                // would count itself as a consumer.
                else if (/\.tsx?$/.test(e.name) && p !== THIS_FILE)
                    files.push(p);
            }
        };
        walk(SRC_ROOT);

        const consumers = files.filter((f) =>
            readFileSync(f, "utf-8").includes(
                "case NodeStatus.NODE_COMPLETED:",
            ),
        );
        const missing = consumers.filter(
            (f) =>
                !readFileSync(f, "utf-8").includes(
                    "case NodeStatus.NODE_CACHED:",
                ),
        );
        expect(missing).toEqual([]);

        // Guard the guard: if the switches are ever rewritten into a shape this
        // string match misses, `consumers` empties out and the check above
        // passes vacuously. Named sites rather than a count — a bare
        // `toBe(<n>)` is the `expected_count` shape CLAUDE.md calls out as a
        // snapshot that reddens unrelated PRs, and adding a fifth consumer is
        // exactly the case this test should welcome, not block.
        expect(consumers.sort()).toEqual(
            expect.arrayContaining(KNOWN_SWITCH_SITES),
        );
    });

    it("an unrecognized event type maps to nothing and does not throw", () => {
        expect(() =>
            mapEngineEvent({ type: "totally_unknown", nodeId: "n" }),
        ).not.toThrow();
        expect(
            mapEngineEvent({ type: "totally_unknown", nodeId: "n" }),
        ).toBeNull();
    });

    it("carries the reused artifact through all three layers", () => {
        // The canvas applies a completed node's result from this payload alone,
        // so a `node_cached` whose output is dropped in transit renders as a
        // finished node showing nothing. L0 has no cache to hit, but the field
        // has to survive the wire before L2 relies on it.
        const ev = { ...engineEvent(), output: { texts: ["reused"] } };
        const mapped = mapEngineEvent(ev);
        const parsed = JSON.parse(
            JSON.stringify({ status: mapped?.status, data: mapped?.data }),
        ) as SSEMessage;
        expect(parsed.data?.output?.texts).toEqual(["reused"]);
    });

    it("omits output entirely when the engine sends none", () => {
        // `if (output)` on the client must not fire on an absent artifact —
        // an empty object would clear whatever the node already shows.
        const parsed = JSON.parse(
            JSON.stringify({ data: mapEngineEvent(engineEvent())?.data }),
        ) as SSEMessage;
        expect(parsed.data).not.toHaveProperty("output");
    });

    it("a node_cached missing its fingerprint yields an empty string, not undefined", () => {
        // The field stays present in the payload shape so a consumer reading it
        // sees "no fingerprint" rather than a key that vanished.
        const ev = engineEvent();
        delete ev.fingerprint;
        expect(mapEngineEvent(ev)?.data.fingerprint).toBe("");
    });
});

describe("applies output once — node_cached then the same node's node_completed", () => {
    it("maps node_cached to NODE_CACHED carrying output verbatim, not NODE_COMPLETED", () => {
        const cachedEvent = { ...engineEvent(), output: { texts: ["reused"] } };
        const mapped = mapEngineEvent(cachedEvent);
        expect(mapped?.status).toBe(NodeStatus.NODE_CACHED);
        expect(mapped?.status).not.toBe(NodeStatus.NODE_COMPLETED);
        expect(mapped?.data.output).toEqual({ texts: ["reused"] });
    });

    it("leaves node_completed to the delegate's own switch — mapEngineEvent returns null", () => {
        // mapEngineEvent owns node_cached only (see its doc comment above); a
        // node_completed for the same node must fall through untouched so the
        // delegate's `case "node_completed":` in engine-delegate.server.ts is
        // the sole place that maps it — exactly one completion notification
        // per node, never two.
        const completedEvent = {
            type: "node_completed",
            nodeId: "node-1",
            output: { texts: ["reused"] },
            label: "Generate",
        };
        expect(mapEngineEvent(completedEvent)).toBeNull();
    });

    it("a merged-results ARRAY output (batched node) passes through node_cached without throw", () => {
        const batchedEvent = {
            ...engineEvent(),
            output: [{ texts: ["a"] }, { texts: ["b"] }],
        };
        expect(() => mapEngineEvent(batchedEvent)).not.toThrow();
        const mapped = mapEngineEvent(batchedEvent);
        expect(mapped?.data.output).toEqual([
            { texts: ["a"] },
            { texts: ["b"] },
        ]);
    });

    it("applying node_cached then node_completed's SAME output yields the same canvas state as applying it once", () => {
        // The client's switch in use-workflow-execution.ts:244-261
        // deliberately falls NODE_CACHED through into NODE_COMPLETED
        // handling — a full-hit node emits BOTH events with the same
        // `output` (Task 4's engine emits node_cached BESIDE
        // node_completed, not instead of it), so `applyNodeOutput` ->
        // `applyResolvedOutputRoutes` (payload.ts) runs TWICE for one
        // logical completion. The only thing keeping the canvas from
        // double-appending a downstream node is that the real `expands`
        // (src/hooks/use-flow.ts) reuses the existing same-type sibling
        // in order instead of always spawning a new one. That `expands`
        // lives in a Zustand store and can't be exercised without
        // mounting React, so this pins the idempotency at the pure
        // payload.ts seam with a fake `expands` that models the same
        // reuse-by-type-and-cursor contract (see the mutation note on
        // `makeReuseExpands` below).
        const sharedOutput = { texts: ["reused"] };
        const cachedEvent = { ...engineEvent(), output: sharedOutput };
        const completedEvent = {
            type: "node_completed",
            nodeId: "node-1",
            output: sharedOutput,
            label: "Generate",
        };

        // Layer 1: node_cached is mapped through mapEngineEvent's own
        // seam; node_completed returns null there (pinned above) and is
        // handled by the delegate's `case "node_completed":` switch arm
        // with `output: ev.output` verbatim — either way the client ends
        // up with the identical output payload for both events.
        const cachedOutput = mapEngineEvent(cachedEvent)?.data.output as
            | Record<string, unknown>
            | undefined;
        expect(mapEngineEvent(completedEvent)).toBeNull();
        expect(cachedOutput).toEqual(completedEvent.output);

        const routes: ResolvedOutputRoute[] = [
            {
                sourceField: "texts",
                nodeType: "textNode",
                dataField: "texts",
                expandEach: false,
            },
        ];

        // A single logical apply.
        const appliedOnce = makeReuseExpands();
        applyResolvedOutputRoutes(
            "node-1",
            cachedOutput,
            routes,
            appliedOnce.expands,
        );

        // The real double apply: node_cached's output, then
        // node_completed's — same source node, same payload.
        const appliedTwice = makeReuseExpands();
        applyResolvedOutputRoutes(
            "node-1",
            cachedOutput,
            routes,
            appliedTwice.expands,
        );
        applyResolvedOutputRoutes(
            "node-1",
            completedEvent.output,
            routes,
            appliedTwice.expands,
        );

        expect(appliedTwice.snapshot()).toEqual(appliedOnce.snapshot());
        // Not just equal content — exactly one downstream node, never two.
        expect(appliedTwice.snapshot().get("node-1")).toHaveLength(1);
    });
});

/**
 * Fake `expands` mirroring the reuse-by-type-and-cursor contract of the real
 * `expands` in src/hooks/use-flow.ts: a possible node whose type already has
 * an existing same-type sibling for this source node gets its data merged
 * into that sibling (`{ ...existing.data, ...data }`); only once every
 * existing sibling of that type is consumed does a new one get appended.
 * That reuse is what keeps a node applied twice from producing two
 * downstream nodes — this fake exists because the real `expands` is a
 * Zustand store action that can't be driven without mounting React.
 *
 * Mutation proof (Fix round 1, item 1): changing the `existingChild ?`
 * branch below to always append reddens
 * "applying the same output twice ... yields the same canvas state as
 * applying it once" — both the deep-equal and the length-1 assertion fail,
 * confirming the test is not vacuous.
 */
interface FakeChildNode {
    id: string;
    type: string;
    data: Record<string, unknown>;
}

function makeReuseExpands() {
    let nextId = 0;
    const childrenBySource = new Map<string, FakeChildNode[]>();

    const expands = (
        nodeId: string | null,
        possibleNodes: { type: string; data?: Record<string, unknown> }[],
    ): string[] => {
        if (!nodeId) return [];
        const existing = childrenBySource.get(nodeId) ?? [];
        const byType = new Map<string, FakeChildNode[]>();
        for (const child of existing) {
            const bucket = byType.get(child.type);
            if (bucket) bucket.push(child);
            else byType.set(child.type, [child]);
        }
        const cursorByType = new Map<string, number>();
        const ids: string[] = [];
        const updated = [...existing];

        for (const { type, data = {} } of possibleNodes) {
            const bucket = byType.get(type);
            const cursor = cursorByType.get(type) ?? 0;
            const existingChild =
                bucket && cursor < bucket.length ? bucket[cursor] : undefined;

            if (existingChild) {
                cursorByType.set(type, cursor + 1);
                ids.push(existingChild.id);
                const idx = updated.findIndex((c) => c.id === existingChild.id);
                updated[idx] = {
                    ...existingChild,
                    data: { ...existingChild.data, ...data },
                };
            } else {
                const id = `child-${nextId++}`;
                ids.push(id);
                updated.push({ id, type, data });
            }
        }

        childrenBySource.set(nodeId, updated);
        return ids;
    };

    return {
        expands,
        snapshot: () => new Map(childrenBySource),
    };
}
