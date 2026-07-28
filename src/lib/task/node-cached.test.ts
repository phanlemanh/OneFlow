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

    it("an unrecognized event type maps to nothing and does not throw", () => {
        expect(() =>
            mapEngineEvent({ type: "totally_unknown", nodeId: "n" }),
        ).not.toThrow();
        expect(
            mapEngineEvent({ type: "totally_unknown", nodeId: "n" }),
        ).toBeNull();
    });

    it("a node_cached missing its fingerprint yields an empty string, not undefined", () => {
        // The field stays present in the payload shape so a consumer reading it
        // sees "no fingerprint" rather than a key that vanished.
        const ev = engineEvent();
        delete ev.fingerprint;
        expect(mapEngineEvent(ev)?.data.fingerprint).toBe("");
    });
});
