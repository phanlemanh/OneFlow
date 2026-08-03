/**
 * Compute the set of target input fields an edge could plug into.
 *
 * Used by the custom edge's inline select to let users disambiguate which
 * input handle a connection feeds — the ABI handles all sit at the same
 * vertical midpoint, so the connection point alone is ambiguous when a
 * downstream node has several inputs of the same modality.
 */

import type { Edge, Node } from "@xyflow/react";

import { getEffectiveOutputType } from "@/lib/workflow/flow-connection-shared";
import { targetHandleId } from "./handle-introspect";
import { getAbiNodeRegistration } from "./node-registry";
import { handleAcceptsUpstream, resolveSpec } from "./resolve";
import type { FieldSourceOverride } from "./sources";

export interface EdgeTargetOption {
    /** Handle id, e.g. `in:ref_audio`. */
    handleId: string;
    /** Raw ABI field name, e.g. `ref_audio`. */
    field: string;
    /**
     * True for scalar handles that hold a single edge (not array/collect).
     * Reselecting onto an occupied single handle swaps the two edges.
     */
    single: boolean;
    /** Target node's ABI feature, for per-node label overrides. */
    feature: string;
}

/**
 * Target input fields on `edge`'s downstream node that are compatible with the
 * upstream output's modality. Returns `[]` for non-ABI targets or when no
 * matching handle exists. A result of length ≥ 2 means the connection is
 * ambiguous and the inline select should be shown.
 */
export function getEdgeTargetOptions(
    edge: Edge,
    nodes: Node[],
): EdgeTargetOption[] {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    if (!sourceNode) return [];

    const upstreamType = getEffectiveOutputType(
        sourceNode.id,
        sourceNode.type,
        edge.sourceHandle,
    );
    if (!upstreamType) return [];

    const reg = getAbiNodeRegistration(edge.target);
    if (!reg) return [];

    const spec = resolveSpec(
        reg.feature,
        reg.sourceSpec as Record<string, FieldSourceOverride> | undefined,
    );

    const options: EdgeTargetOption[] = [];
    for (const field of spec.topology.inputOrder) {
        const f = spec.fields[field];
        if (f?.kind !== "handle") continue;
        // `alsoAccepts` widens a handle beyond its primary modality (e.g.
        // compose-overlay `media` takes image or video). This is the fourth
        // consumer of that rule after resolveEdgeHandles and the two gates in
        // connection-rules; matching on nodeType alone hid the widened handle
        // from the inline select.
        if (!handleAcceptsUpstream(f, upstreamType)) continue;
        options.push({
            handleId: targetHandleId(field),
            field,
            single: !f.array && !f.collect,
            feature: reg.feature,
        });
    }
    return options;
}

/**
 * True when the edge currently occupying `fromHandleId` could legally be moved
 * onto `toHandleId` of the same node.
 *
 * The inline select swaps two edges when the chosen handle is already taken;
 * without this the displaced edge lands on a handle its modality is not allowed
 * on (a video pushed onto an image-only `in:logo`), producing exactly the edge
 * `isValidFlowConnection` refuses — silently, because the swap writes to the
 * store directly.
 */
export function canSwapOntoHandle(
    targetNodeId: string,
    occupantUpstreamType: string | undefined,
    toHandleId: string,
): boolean {
    if (!occupantUpstreamType) return false;
    const reg = getAbiNodeRegistration(targetNodeId);
    if (!reg) return false;
    const spec = resolveSpec(
        reg.feature,
        reg.sourceSpec as Record<string, FieldSourceOverride> | undefined,
    );
    for (const field of spec.topology.inputOrder) {
        if (targetHandleId(field) !== toHandleId) continue;
        const f = spec.fields[field];
        return handleAcceptsUpstream(f, occupantUpstreamType);
    }
    return false;
}
