/**
 * Renders the LLM-facing slot vocabulary from ABI topology, classifying each
 * input field through the same pipeline compile.ts resolves against: raw ABI
 * topology (getAbiTopology) refined by the shared NODE_TYPE_SOURCE_SPEC
 * registry — the single declaration site for every ABI node's field
 * overrides (see compile.ts's top-of-file comment, Step 0 note (c), and
 * node-feature-registry.ts's own doc comment). A field described here as a
 * handle or a param must compile the same way, or the LLM writes plans the
 * compiler rejects.
 *
 * Deterministic (sorted, no timestamps, no unsorted Set/object iteration)
 * so the system-prompt block is byte-stable and the Anthropic prompt cache
 * hits across requests. See spec §7.
 */
import { ABI_NODES, type NodeSlot } from "@/generated/abi";
import { type AbiTopology, getAbiTopology } from "@/lib/abi/handle-introspect";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import { resolveSpec } from "@/lib/abi/resolve";
import type { AnySourceSpec } from "@/lib/abi/sources";
import { isDirectorSafeSlot } from "./safe-slots";
import { SLOT_TO_NODE_TYPE } from "./slot-node-type";

/** "imageNode" -> "image". The modality name the DSL and this vocabulary
 * both use to describe what a handle field consumes or produces. */
function modalityName(nodeType: string): string {
    return nodeType.replace(/Node$/, "");
}

/**
 * Per-node-type source overrides, straight from the shared registry — the
 * same (and, per compile.ts's own top-of-file Step 0 note (c), *only*)
 * source compile.ts itself resolves classification against. There is no
 * compiler-local mirror table to also consult.
 */
function sourceSpecOverridesFor(nodeType: string): AnySourceSpec | undefined {
    return (NODE_TYPE_SOURCE_SPEC as Partial<Record<string, AnySourceSpec>>)[
        nodeType
    ];
}

/**
 * Best-effort scalar type label for a config/param field, read from the
 * field's raw JSON Schema. Falls back to "value" for a field whose raw
 * classification is a handle that got overridden down to config (e.g.
 * `ref_audio` on text-gen-speech-clone, see its comment in
 * NODE_TYPE_SOURCE_SPEC) — the raw topology on those doesn't carry a JSON
 * Schema type, so "value" is honest about that rather than guessing.
 */
function describeParamType(topo: AbiTopology, field: string): string {
    const raw = topo.inputs[field];
    if (raw?.kind === "config") {
        const t = raw.schema.type;
        return typeof t === "string" ? t : "value";
    }
    return "value";
}

/**
 * One line per slot: `- slot "<slot>": inputs(...) params(...) -> <modality>`.
 * Sorted and deduplicated so the same slot set always renders the same
 * bytes regardless of call-site ordering. Slots with no canonical
 * ReactFlow node type (SLOT_TO_NODE_TYPE) are skipped — the compiler can't
 * emit a node for them either.
 */
export function renderVocabulary(slots: NodeSlot[]): string {
    const lines: string[] = [];
    for (const slot of [...new Set(slots)].sort()) {
        const nodeType = SLOT_TO_NODE_TYPE[slot];
        if (!nodeType) continue;
        const topo = getAbiTopology(slot);
        const spec = resolveSpec(slot, sourceSpecOverridesFor(nodeType));
        const inputs: string[] = [];
        const params: string[] = [];

        for (const field of topo.inputOrder) {
            const resolved = spec.fields[field];
            if (!resolved) continue;

            if (resolved.kind === "handle") {
                // Same array test compile.ts's classifyField applies: a field
                // is array-capable in the DSL if the plugin call itself takes
                // an array, OR the field fans out one call per connected
                // value (batch), OR it collects every connected value into
                // one call (collect) — batchOn/collectAll both flip this even
                // when the underlying plugin field is a scalar (e.g.
                // image-gen's `text`).
                const isArray =
                    resolved.array || !!resolved.batch || !!resolved.collect;
                const tags = [
                    resolved.required ? "required" : null,
                    resolved.manual ? "manual" : null,
                ].filter((t): t is string => t !== null);
                inputs.push(
                    `${field}: ${modalityName(resolved.nodeType)}${isArray ? "[]" : ""}${
                        tags.length ? ` (${tags.join(", ")})` : ""
                    }`,
                );
                continue;
            }

            // "static" / "input" overrides fall back to config, same as
            // compile.ts's classifyField does.
            const type = describeParamType(topo, field);
            params.push(
                `${field}: ${type}${resolved.required ? " (required)" : ""}`,
            );
        }

        const out = topo.outputs[0];
        lines.push(
            `- slot "${slot}": inputs(${inputs.join(", ")}) params(${params.join(
                ", ",
            )}) -> ${out ? modalityName(out.nodeType) : "none"}`,
        );
    }
    return lines.join("\n");
}

/**
 * Slots the Director may plan against: declared in the ABI, safely
 * classifiable by the compiler (`isDirectorSafeSlot`), and served by at
 * least one installed plugin. Pure — takes the plugin registry's
 * `nodePluginMap` rather than loading it, so both filters are testable
 * without touching `server-only` or disk I/O (see vocabulary.server.ts,
 * which is the only place that actually loads the registry).
 */
export function installedSafeSlots(
    nodePluginMap: Record<string, string[]>,
): NodeSlot[] {
    return (Object.keys(ABI_NODES) as NodeSlot[])
        .filter((slot) => isDirectorSafeSlot(slot))
        .filter((slot) => (nodePluginMap[slot]?.length ?? 0) > 0)
        .sort();
}
