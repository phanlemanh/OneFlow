import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { mapSSEStatusToTaskStatus, NodeStatus } from "@/constants/task-status";
import { mapEngineEvent } from "@/lib/task/engine-events";
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
const THIS_FILE = "src/lib/task/node-cached.test.ts";

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
        walk("src");

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
        // passes vacuously. Four sites today: the three SSE switches plus
        // `mapSSEStatusToTaskStatus`.
        expect(consumers.length).toBe(4);
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
