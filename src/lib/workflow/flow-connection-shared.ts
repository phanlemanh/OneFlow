/**
 * Shared helpers for RF connection validation (`connection-rules.ts`,
 * `connection-validator.ts`).
 */

import { resolvedSpecForNodeType } from "@/lib/abi/node-feature-registry";
import { getAbiNodeRegistration } from "@/lib/abi/node-registry";
import { type ResolvedSpec, resolveSpec } from "@/lib/abi/resolve";
import type { FieldSourceOverride } from "@/lib/abi/sources";
import { DATA_NODE_TYPES } from "@/lib/workflow/executable-workflow";

/** Add node type → logical output type (consistent with workflow-exporter). */
export const ADD_NODE_OUTPUT_TYPE: Record<string, string> = {
    addImageNode: "imageNode",
    addVideoNode: "videoNode",
    addAudioNode: "audioNode",
    addTextNode: "textNode",
    addModelNode: "modelNode",
    addFileNode: "fileNode",
    addLinkNode: "linkNode",
    addMediaLibraryNode: "videoNode",
};

/**
 * Logical upstream output RF type (“textNode”, “imageNode”, …).
 *
 * - data node → itself
 * - ABI node → if `sourceHandle = out:<field>` resolves to a specific output
 *   route, returns that route's modality. Otherwise falls back to the first
 *   non-expanding ABI output's nodeType.
 * - add node → fixed mapping
 */
export function getEffectiveOutputType(
    nodeId: string,
    nodeType: string | undefined,
    sourceHandle?: string | null,
): string | undefined {
    if (!nodeType) return undefined;
    if (nodeType in DATA_NODE_TYPES) return nodeType;

    // The mount registry is a plain module Map filled by a post-render effect,
    // so it is EMPTY on the first render of a restored workflow. Falling back to
    // the static node-type -> spec map keeps every caller (validator, edge
    // creation, node UI) correct at first paint instead of silently resolving
    // to undefined and caching a wrong answer.
    const reg = getAbiNodeRegistration(nodeId);
    const spec: ResolvedSpec | undefined = reg
        ? resolveSpec(
              reg.feature,
              reg.sourceSpec as Record<string, FieldSourceOverride> | undefined,
          )
        : resolvedSpecForNodeType(nodeType);
    if (spec) {
        if (sourceHandle?.startsWith("out:")) {
            const field = sourceHandle.slice("out:".length);
            const match = spec.topology.outputs.find((o) => o.field === field);
            if (match) return match.nodeType;
        }

        const primary =
            spec.topology.outputs.find((o) => !o.expandEach) ??
            spec.topology.outputs[0];
        if (primary) return primary.nodeType;
    }

    return ADD_NODE_OUTPUT_TYPE[nodeType];
}
