import { NodeStatus } from "@/constants/task-status";

/**
 * Pure mapping from an engine NDJSON event to the client notification it
 * becomes. Deliberately free of `server-only` and of any I/O: the delegate that
 * consumes this is server-only, but the mapping itself is the part worth
 * testing, and a server-only module cannot be imported from a test.
 */

function str(v: unknown): string | undefined {
    return typeof v === "string" ? v : undefined;
}

export interface MappedEngineEvent {
    status: string;
    data: Record<string, unknown>;
    nodeId?: string;
}

/**
 * Map one engine event, or return `null` when the delegate's own switch should
 * handle it.
 *
 * Only `node_cached` lives here today. Its whole value at L0 is that the path
 * from engine to browser is proven wired before there is a cache to fire it —
 * so the cache slice adds a call to `emit()` rather than plumbing across three
 * layers while solving the hard part.
 */
export function mapEngineEvent(
    ev: Record<string, unknown>,
): MappedEngineEvent | null {
    if (str(ev.type) !== "node_cached") return null;

    return {
        status: NodeStatus.NODE_CACHED,
        data: {
            label: str(ev.label) ?? "",
            feature: str(ev.feature) ?? "",
            // Carried verbatim: telemetry counts partial renders by these two,
            // and a value dropped in transit is indistinguishable from a cache
            // that never hit.
            fingerprint: str(ev.fingerprint) ?? "",
            tier: str(ev.tier) ?? "",
            output: ev.output,
        },
        nodeId: str(ev.nodeId),
    };
}
