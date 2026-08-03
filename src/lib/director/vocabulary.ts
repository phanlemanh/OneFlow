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
import {
    acceptedUpstreamTypes,
    producibleOutputTypes,
    resolveSpec,
} from "@/lib/abi/resolve";
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
 * JSON Schema scalar types `ParamEntrySchema` (dsl.ts) can actually carry —
 * `string | number | boolean`, plus "integer" (still a plain JS number once
 * parsed). Any other declared type (array, object, ...) is something the
 * DSL has no way to express a correct value for, so a field with that type
 * is omitted from the vocabulary entirely (Fix 2) rather than advertised
 * and then always rejected by the compiler's own type check below.
 */
const RENDERABLE_PARAM_TYPES = new Set([
    "string",
    "number",
    "integer",
    "boolean",
]);

/**
 * Best-effort scalar type label for a config/param field, read from the
 * field's raw JSON Schema. Falls back to "value" for a field whose raw
 * classification is a handle that got overridden down to config (e.g.
 * `ref_audio` on text-gen-speech-clone, see its comment in
 * NODE_TYPE_SOURCE_SPEC) — the raw topology on those doesn't carry a JSON
 * Schema type, so "value" is honest about that rather than guessing.
 * Returns `undefined` when the field's declared type isn't one the DSL can
 * express (see `RENDERABLE_PARAM_TYPES`) — the caller omits the field.
 */
function describeParamType(
    topo: AbiTopology,
    field: string,
): string | undefined {
    const raw = topo.inputs[field];
    if (raw?.kind !== "config") return "value";
    const t = raw.schema.type;
    if (typeof t !== "string") return undefined;
    return RENDERABLE_PARAM_TYPES.has(t) ? t : undefined;
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
                // Advertise every accepted modality, not just the primary
                // one: the planner only proposes what the vocabulary lists, so
                // a widened handle read as image-only means video plans are
                // never even attempted.
                const modality = acceptedUpstreamTypes(resolved)
                    .map(modalityName)
                    .join("|");
                inputs.push(
                    `${field}: ${modality}${isArray ? "[]" : ""}${
                        tags.length ? ` (${tags.join(", ")})` : ""
                    }`,
                );
                continue;
            }

            // "static" / "input" overrides fall back to config, same as
            // compile.ts's classifyField does.
            const type = describeParamType(topo, field);
            if (type === undefined) continue;
            params.push(
                `${field}: ${type}${resolved.required ? " (required)" : ""}`,
            );
        }

        // Same reason as the input line above: a widened handle also widens
        // the result, and the planner only chains what the vocabulary claims
        // the slot produces.
        const outTypes = producibleOutputTypes(spec, topo);
        const out = outTypes.length
            ? outTypes.map(modalityName).join("|")
            : "none";
        lines.push(
            `- slot "${slot}": inputs(${inputs.join(", ")}) params(${params.join(
                ", ",
            )}) -> ${out}`,
        );
    }
    return lines.join("\n");
}

/**
 * Modality node types some step in a plan can actually produce: DSL v1's
 * only source kind is `text` (-> textNode, spec §5), plus every output each
 * slot in `slots` can yield as a "gen" step. A slot with a widened handle
 * yields more than its first declared output, so reading `outputs[0]` here
 * would hide a producer and wrongly mark its consumers unsatisfiable. A slot
 * whose required input needs a modality outside this set can never be fed by
 * any legal plan — see `installedSafeSlots`.
 */
function producibleModalities(slots: NodeSlot[]): Set<string> {
    const modalities = new Set<string>(["textNode"]);
    for (const slot of slots) {
        const nodeType = SLOT_TO_NODE_TYPE[slot];
        const spec = nodeType
            ? resolveSpec(slot, sourceSpecOverridesFor(nodeType))
            : undefined;
        for (const type of producibleOutputTypes(spec, getAbiTopology(slot))) {
            modalities.add(type);
        }
    }
    return modalities;
}

/**
 * True when `slot` has a required, non-manual handle field whose expected
 * upstream modality is outside `producible` — i.e. no plan can ever satisfy
 * it (a manual handle field's own form default satisfies "required" with no
 * connection at all, same exemption `compile.ts`'s required-input check
 * applies). Classification runs through the same `resolveSpec` +
 * `NODE_TYPE_SOURCE_SPEC` pipeline `renderVocabulary` and `compile.ts` use
 * — not the raw ABI topology — so this agrees with what the compiler will
 * actually accept.
 */
function hasUnsatisfiableRequiredInput(
    slot: NodeSlot,
    producible: ReadonlySet<string>,
): boolean {
    const nodeType = SLOT_TO_NODE_TYPE[slot];
    if (!nodeType) return true;
    const topo = getAbiTopology(slot);
    const spec = resolveSpec(slot, sourceSpecOverridesFor(nodeType));
    return topo.inputOrder.some((field) => {
        const resolved = spec.fields[field];
        if (resolved?.kind !== "handle") return false;
        if (!resolved.required || resolved.manual) return false;
        // A widened handle is satisfiable if ANY accepted modality is
        // producible — testing only the primary type drops a slot whose
        // image-primary handle would happily take the video a plan can make.
        return !acceptedUpstreamTypes(resolved).some((t) => producible.has(t));
    });
}

/**
 * Slots the Director may plan against: declared in the ABI, safely
 * classifiable by the compiler (`isDirectorSafeSlot`), served by at least
 * one installed plugin, and structurally plannable — every required,
 * non-manual handle field can be fed by *some* step a plan can emit.
 *
 * The producible-modality set depends on which slots survive this last
 * filter (a slot's own output can be the only thing that satisfies another
 * candidate slot's required input), so a single pass is not enough: dropping
 * one slot can remove the sole producer of a modality and make a second
 * slot newly unsatisfiable. This iterates to a fixed point instead — each
 * round only ever removes slots, so it terminates in at most
 * `candidates.length` rounds.
 *
 * Pure — takes the plugin registry's `nodePluginMap` rather than loading it,
 * so both filters are testable without touching `server-only` or disk I/O
 * (see vocabulary.server.ts, which is the only place that actually loads
 * the registry).
 */
export function installedSafeSlots(
    nodePluginMap: Record<string, string[]>,
): NodeSlot[] {
    let candidates = (Object.keys(ABI_NODES) as NodeSlot[])
        .filter((slot) => isDirectorSafeSlot(slot))
        .filter((slot) => (nodePluginMap[slot]?.length ?? 0) > 0);

    for (;;) {
        const producible = producibleModalities(candidates);
        const next = candidates.filter(
            (slot) => !hasUnsatisfiableRequiredInput(slot, producible),
        );
        if (next.length === candidates.length) break;
        candidates = next;
    }

    return candidates.sort();
}
