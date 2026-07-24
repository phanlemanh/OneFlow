/**
 * Deterministic DSL -> ReactFlow compiler. Emits the same node/edge shapes as
 * public/example.json (the reference fixture): source pairs
 * (addTextNode -> textNode), executable nodes sandwiched by modality nodes,
 * `in:<field>` / `out:<field>` handles from handle-introspect.
 * Pure: no I/O — installed-plugin defaults and the id generator are injected
 * via options.
 *
 * --- Step 0 investigation notes ---
 *
 * (a) Handle spellings confirmed against public/example.json's
 *     `originalFlow.edges` (the actual reference graph, not the reference
 *     code in the task brief):
 *       - addTextNode -> textNode:      targetHandle "in:textNode", no sourceHandle.
 *       - textNode -> gen node:         sourceHandle "out:textNode", targetHandle "in:<abiField>" (e.g. "in:text").
 *       - gen node -> sink modality:    sourceHandle "out:<abiOutputField>" (e.g. "out:image"), targetHandle "in:<nodeType>" (e.g. "in:imageNode").
 *       - modality -> gen node (array): sourceHandle "out:<nodeType>" (e.g. "out:imageNode"), targetHandle "in:<abiField>" (e.g. "in:images");
 *         one edge per connected source, all sharing the same targetHandle.
 *     In short: data/modality nodes address handles by their own node type
 *     name; ABI/gen nodes address handles by their ABI field name. Both are
 *     built with the existing `sourceHandleId`/`targetHandleId` helpers,
 *     which are just `in:${x}` / `out:${x}` string builders — the caller
 *     decides whether `x` is a node type or a field name.
 *
 * (b) `imageFusionNode.data.ids` (and the structurally identical
 *     `imagesGenVideoNode`, `speechGenVideoNode`, `genTextNode`,
 *     `textGenVideoNode`) is read directly on mount —
 *     `const ids = data.ids ?? []; const fromNodes = useNodesData(ids);` (or
 *     an equivalent destructure of `data`) — it is NOT derived from incoming
 *     edges. It must be seeded at import time with the ordered ids of the
 *     upstream modality nodes that feed this step's handle inputs, or the
 *     node renders as if nothing were connected (`executeDisabled` stays
 *     true). We do that below (`IDS_KEYED_NODE_TYPES`) — the full set was
 *     found by sweeping every node component for `data.ids` / a destructured
 *     `ids` field
 *     (`grep -rnE "data\.ids|\{\s*ids\s*(=|:)" src/components/workspace/nodes`),
 *     not by inspection of `imageFusionNode` alone.
 *
 * (c) A field the raw ABI schema classifies as `kind: "config"` can still be
 *     rendered as a connectable handle — or, conversely, a field the schema
 *     would default to a handle (any `$ref`/`Asset` field) can be forced back
 *     to config — by an individual node component's own `sourceSpec` prop
 *     (handle-introspect.ts's own comment: "sourceSpec can override to
 *     handle"). The shared `NODE_TYPE_SOURCE_SPEC` registry in
 *     node-feature-registry.ts carries this for the node types the app's own
 *     pre-mount edge creation needs it for, but several components declare
 *     their override inline (or in a module-local const) instead of
 *     registering it, and `resolvedSpecForNodeType` in that file silently
 *     returns nothing for those. Rather than re-guessing per field, we run
 *     every field's classification through the same `resolveSpec` the app
 *     itself uses (src/lib/abi/resolve.ts), fed by `NODE_TYPE_SOURCE_SPEC`
 *     merged with `LOCAL_SOURCE_SPEC_OVERRIDES` below — the node types whose
 *     inline override actually changes a field's handle-vs-config or
 *     `manual` classification, verified by reading each component (see that
 *     table's own comment, and compile.test.ts's guard test, which sweeps
 *     every component's real `sourceSpec` and fails if a classification-
 *     changing override goes untracked).
 *
 *     `manual` (ComfyUI-style widget <-> input duality: an edge always wins,
 *     the form value is the fallback — see resolve.ts's `buildPrompts`) is
 *     itself part of the classification this compiler needs: a literal on a
 *     `manual` handle field writes straight to `data.<field>` with no edge
 *     (matches `imageFusionNode.text`, confirmed against
 *     public/example.json); a literal on a non-manual handle field spawns an
 *     `addTextNode`/`textNode` source pair and an edge (matches
 *     `textGenImageNode.text`); a ref on a genuine config field is still
 *     `REF_ON_CONFIG_FIELD`.
 */
import type { Edge, Node } from "@xyflow/react";
import type { NodeSlot } from "@/generated/abi";
import {
    type DataNodeType,
    getAbiTopology,
    sourceHandleId,
    targetHandleId,
} from "@/lib/abi/handle-introspect";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import { type ResolvedSpec, resolveSpec } from "@/lib/abi/resolve";
import {
    batchOn,
    configField,
    type FieldSourceOverride,
    handle,
} from "@/lib/abi/sources";
import { parseWorkflow } from "@/lib/workflow/parser";
import { type DirectorPlan, type GenStep, isRef, refId } from "./dsl";
import { SLOT_TO_NODE_TYPE } from "./slot-node-type";

export type CompileIssueCode =
    | "DUPLICATE_ID"
    | "UNKNOWN_SLOT"
    | "MISSING_PLUGIN"
    | "UNKNOWN_REF"
    | "UNKNOWN_INPUT_FIELD"
    | "REF_ON_CONFIG_FIELD"
    | "MODALITY_MISMATCH"
    | "ARITY_MISMATCH"
    | "MISSING_REQUIRED_INPUT"
    | "CYCLE";

export interface CompileIssue {
    code: CompileIssueCode;
    stepId?: string;
    message: string;
    slot?: string;
}

export interface CompileOptions {
    /** slot -> default installed pluginId (head of nodePluginMap). */
    slotDefaultPlugin: Partial<Record<string, string>>;
    /** Injectable id generator (tests); defaults to crypto.randomUUID. */
    idFn?: () => string;
}

export interface CompileResult {
    nodes: Node[];
    edges: Edge[];
    issues: CompileIssue[];
}

/** Placeholder `data` seeded on a freshly created sink/modality node — real
 * values only exist once the upstream step has actually executed. */
const DATA_NODE_DEFAULT_DATA: Record<DataNodeType, Record<string, unknown>> = {
    textNode: { texts: [] },
    imageNode: { fileKeys: [] },
    videoNode: { fileKeys: [] },
    audioNode: { fileKeys: [] },
    fileNode: { fileKeys: [] },
    modelNode: { fileKeys: [] },
    linkNode: { texts: [] },
};

/**
 * Node types whose component declares its `sourceSpec` prop inline (or in a
 * module-local const) rather than through the shared `NODE_TYPE_SOURCE_SPEC`
 * registry, where that override actually changes a field's handle-vs-config
 * or `manual` classification for this compiler's purposes. See Step 0 note
 * (c) above. Verified by reading each component directly (field name,
 * handle?, manual?) — do not extend this table without doing the same.
 *
 * Node types whose inline sourceSpec only *refines* a field the raw ABI
 * schema already classifies as a handle (e.g. `image: batchOn()` on a
 * `$ref` field — most of this compiler's ~58 supported slots do exactly
 * this for their file-backed fields) are intentionally omitted: the raw
 * classification this compiler falls back to is already correct for them,
 * so there is nothing to override. compile.test.ts's guard test sweeps
 * every node component's real `sourceSpec` (registry and inline alike) and
 * fails if a classification-changing override is missing from here.
 */
export const LOCAL_SOURCE_SPEC_OVERRIDES: Partial<
    Record<string, Record<string, FieldSourceOverride>>
> = {
    // text-gen-image.tsx — image-gen
    textGenImageNode: {
        text: batchOn({ nodeType: "textNode", path: "texts" }),
    },
    // text-gen-text.tsx — gen-text
    genTextNode: {
        text: batchOn({ nodeType: "textNode", path: "texts" }),
    },
    // text-audio-gen-speech.tsx — text-audio-gen-speech
    textAudioGenSpeechNode: {
        text: batchOn({ nodeType: "textNode", path: "texts" }),
    },
    // text-gen-speech-instruct.tsx — text-gen-speech-instruct
    textGenSpeechInstructNode: {
        text: batchOn({ nodeType: "textNode", path: "texts" }),
    },
    // text-gen-speech-preset.tsx — text-gen-speech-preset
    textGenSpeechPresetNode: {
        text: batchOn({ nodeType: "textNode", path: "texts" }),
    },
    // text-gen-speech-clone.tsx (CLONE_TRANSFER_SOURCE_SPEC) — text-gen-speech-clone
    textGenSpeechCloneNode: {
        text: batchOn({ nodeType: "textNode", path: "texts" }),
        // `ref_audio` is a `$ref` in the ABI (raw default: handle), but this
        // transfer-variant node owns reference audio via local
        // upload/record and never renders an `in:ref_audio` handle — force
        // it back to config so a `@ref` on this field is correctly rejected
        // instead of producing a dangling edge.
        ref_audio: configField(),
    },
    // text-gen-music.tsx — gen-music
    textGenMusicNode: {
        tags: handle({ nodeType: "textNode", path: "texts[0]" }),
        lyrics: handle({ nodeType: "textNode", path: "texts[0]" }),
    },
    // split-text.tsx — split-text
    splitTextNode: {
        text: handle({ nodeType: "textNode", path: "texts[0]" }),
    },
};

/**
 * ReactFlow node types whose component reads `data.ids` directly (rather
 * than deriving upstream values from edges) to look up their source nodes.
 * See Step 0 note (b) above. Full set found by sweeping every node
 * component for `data.ids` / a destructured `ids` field.
 */
export const IDS_KEYED_NODE_TYPES = new Set<string>([
    "imageFusionNode",
    "imagesGenVideoNode",
    "speechGenVideoNode",
    "genTextNode",
    "textGenVideoNode",
]);

/** Registry overrides merged with this compiler's local ones for the node
 * types the registry doesn't carry (Step 0 note (c)). */
function sourceSpecOverridesFor(
    nodeType: string,
): Record<string, FieldSourceOverride> | undefined {
    return (
        NODE_TYPE_SOURCE_SPEC[nodeType] ?? LOCAL_SOURCE_SPEC_OVERRIDES[nodeType]
    );
}

// Memoized per node type — `resolveSpec` is pure given (slot, overrides),
// and a node type determines both uniquely.
const RESOLVED_SPEC_CACHE = new Map<string, ResolvedSpec>();

function resolvedSpecFor(slot: NodeSlot, nodeType: string): ResolvedSpec {
    const cached = RESOLVED_SPEC_CACHE.get(nodeType);
    if (cached) return cached;
    const spec = resolveSpec(slot, sourceSpecOverridesFor(nodeType));
    RESOLVED_SPEC_CACHE.set(nodeType, spec);
    return spec;
}

/**
 * A step field's effective classification for this compiler's purposes:
 * handle-vs-config (does a ref/edge apply), the upstream node type expected,
 * whether multiple upstream connections are valid, and `manual` (a literal
 * on a manual handle field falls back to a plain `data.<field>` write — see
 * Step 0 note (c)). Derived from the real per-node-type sourceSpec
 * (`NODE_TYPE_SOURCE_SPEC` merged with `LOCAL_SOURCE_SPEC_OVERRIDES`)
 * instead of a hand-guessed table.
 */
interface EffectiveField {
    kind: "handle" | "config";
    /** Only meaningful when `kind === "handle"`. */
    nodeType?: DataNodeType;
    /** True when this field accepts more than one upstream connection. */
    array: boolean;
    /** True when a literal falls back to `data.<field>` instead of an edge. */
    manual: boolean;
}

function classifyField(
    slot: NodeSlot,
    nodeType: string,
    field: string,
): EffectiveField | undefined {
    const resolved = resolvedSpecFor(slot, nodeType).fields[field];
    if (!resolved) return undefined;
    if (resolved.kind === "handle") {
        return {
            kind: "handle",
            nodeType: resolved.nodeType,
            array: resolved.array || !!resolved.batch || !!resolved.collect,
            manual: !!resolved.manual,
        };
    }
    // `static` / `input` overrides aren't used by any node type this
    // compiler currently resolves; treat them like `config` (literal ->
    // data[field]) as the safe fallback.
    return { kind: "config", array: false, manual: false };
}

interface StepOutput {
    nodeId: string;
    nodeType: DataNodeType;
    /** Literal text when the producing step is a text source. */
    literal?: string;
}

export function compilePlan(
    plan: DirectorPlan,
    options: CompileOptions,
): CompileResult {
    const idFn = options.idFn ?? (() => crypto.randomUUID());
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const issues: CompileIssue[] = [];
    const outputs = new Map<string, StepOutput>();

    const seen = new Set<string>();
    for (const step of plan.steps) {
        if (seen.has(step.id)) {
            issues.push({
                code: "DUPLICATE_ID",
                stepId: step.id,
                message: `duplicate step id "${step.id}"`,
            });
        }
        seen.add(step.id);
    }

    /** Emit addTextNode -> textNode and return the textNode as output. */
    function emitTextSource(text: string): StepOutput {
        const addId = idFn();
        const textId = idFn();
        nodes.push({
            id: addId,
            type: "addTextNode",
            position: { x: 0, y: 0 },
            origin: [0.5, 0.5],
            data: { manualValue: text },
        });
        nodes.push({
            id: textId,
            type: "textNode",
            position: { x: 0, y: 0 },
            origin: [0.5, 0.5],
            data: { texts: [text] },
        });
        edges.push({
            id: idFn(),
            source: addId,
            target: textId,
            targetHandle: "in:textNode",
        });
        return { nodeId: textId, nodeType: "textNode", literal: text };
    }

    function compileGenStep(step: GenStep): void {
        const nodeType = SLOT_TO_NODE_TYPE[step.slot as NodeSlot];
        if (!nodeType) {
            issues.push({
                code: "UNKNOWN_SLOT",
                stepId: step.id,
                slot: step.slot,
                message: `unknown slot "${step.slot}"`,
            });
            return;
        }
        const pluginId = options.slotDefaultPlugin[step.slot];
        if (!pluginId) {
            issues.push({
                code: "MISSING_PLUGIN",
                stepId: step.id,
                slot: step.slot,
                message: `no installed plugin serves slot "${step.slot}"`,
            });
        }

        const slot = step.slot as NodeSlot;
        const topo = getAbiTopology(slot);
        const genId = idFn();
        const data: Record<string, unknown> = {
            feature: step.slot,
            pluginId: pluginId ?? "",
        };

        for (const { field, value } of step.params) {
            const fc = classifyField(slot, nodeType, field);
            if (!fc || fc.kind !== "config") {
                issues.push({
                    code: "UNKNOWN_INPUT_FIELD",
                    stepId: step.id,
                    slot: step.slot,
                    message: `"${field}" is not a config field of ${step.slot}`,
                });
                continue;
            }
            data[field] = value;
        }

        const knownTexts: string[] = [];
        const pendingEdges: Edge[] = [];
        // Ordered, deduplicated ids of every upstream modality node that
        // feeds one of this step's handle fields — only consumed by node
        // types that read `data.ids` directly (Step 0 note (b)).
        const sourceIds = new Set<string>();
        // Whether a non-text (file-backed) handle field was actually wired —
        // mirrors the `texts` caching below, but for image/video/audio/file
        // refs whose real value only exists after the upstream step runs.
        let hasMediaHandleInput = false;

        for (const { field, value } of step.inputs) {
            const fc = classifyField(slot, nodeType, field);
            if (!fc) {
                issues.push({
                    code: "UNKNOWN_INPUT_FIELD",
                    stepId: step.id,
                    slot: step.slot,
                    message: `"${field}" is not an input of ${step.slot}`,
                });
                continue;
            }
            const values = Array.isArray(value) ? value : [value];

            if (fc.kind === "config") {
                // LLM-friendly leniency (spec §5): literal on a config field
                // is routed into data; refs on config fields are errors.
                if (values.length !== 1 || isRef(values[0])) {
                    issues.push({
                        code: "REF_ON_CONFIG_FIELD",
                        stepId: step.id,
                        slot: step.slot,
                        message: `config field "${field}" only accepts a single literal value`,
                    });
                    continue;
                }
                data[field] = values[0];
                continue;
            }

            if (!fc.array && values.length > 1) {
                issues.push({
                    code: "ARITY_MISMATCH",
                    stepId: step.id,
                    slot: step.slot,
                    message: `field "${field}" accepts a single value`,
                });
                continue;
            }

            for (const v of values) {
                if (!isRef(v) && fc.manual) {
                    // Manual handle field fed a literal: ComfyUI-style
                    // widget <-> input duality (Step 0 note (c)) — an edge
                    // would win, but with no edge the literal is just the
                    // node's own form value. Write it straight to `data`;
                    // no source pair, no edge (matches `imageFusionNode`,
                    // confirmed against public/example.json).
                    data[field] = v;
                    continue;
                }
                let src: StepOutput | undefined;
                if (isRef(v)) {
                    src = outputs.get(refId(v));
                    if (!src) {
                        issues.push({
                            code: "UNKNOWN_REF",
                            stepId: step.id,
                            message: `"${v}" does not reference an earlier step`,
                        });
                        continue;
                    }
                } else {
                    // Inline literal only makes sense for text-typed handles.
                    if (fc.nodeType !== "textNode") {
                        issues.push({
                            code: "MODALITY_MISMATCH",
                            stepId: step.id,
                            message: `field "${field}" expects ${fc.nodeType}; got literal text`,
                        });
                        continue;
                    }
                    src = emitTextSource(v);
                }
                if (src.nodeType !== fc.nodeType) {
                    issues.push({
                        code: "MODALITY_MISMATCH",
                        stepId: step.id,
                        message: `field "${field}" expects ${fc.nodeType}; "${v}" produces ${src.nodeType}`,
                    });
                    continue;
                }
                if (src.literal !== undefined) {
                    knownTexts.push(src.literal);
                }
                if (fc.nodeType !== "textNode") {
                    hasMediaHandleInput = true;
                }
                sourceIds.add(src.nodeId);
                pendingEdges.push({
                    id: idFn(),
                    source: src.nodeId,
                    sourceHandle: sourceHandleId(src.nodeType),
                    target: genId,
                    targetHandle: targetHandleId(field),
                });
            }
        }

        // Required handle fields must be fed; config defaults — and manual
        // handle fields' fallback, same rationale — come from the node's own
        // form after mount (spec §5).
        for (const field of topo.requiredInputs) {
            const fc = classifyField(slot, nodeType, field);
            if (fc?.kind !== "handle" || fc.manual) continue;
            const provided = step.inputs.some((i) => i.field === field);
            if (!provided) {
                issues.push({
                    code: "MISSING_REQUIRED_INPUT",
                    stepId: step.id,
                    slot: step.slot,
                    message: `required input "${field}" of ${step.slot} is not connected`,
                });
            }
        }

        if (knownTexts.length > 0) {
            data.texts = knownTexts;
        }

        if (IDS_KEYED_NODE_TYPES.has(nodeType)) {
            if (sourceIds.size > 0) {
                data.ids = [...sourceIds];
            }
        } else if (hasMediaHandleInput) {
            // Real file keys only exist once the upstream step executes;
            // seed the placeholder shape the node's own data reader expects.
            data.fileKeys = [];
        }

        nodes.push({
            id: genId,
            type: nodeType,
            position: { x: 0, y: 0 },
            origin: [0.5, 0.5],
            data,
        });
        edges.push(...pendingEdges);

        const primaryOut = topo.outputs[0];
        if (primaryOut) {
            const outId = idFn();
            nodes.push({
                id: outId,
                type: primaryOut.nodeType,
                position: { x: 0, y: 0 },
                origin: [0.5, 0.5],
                data: { ...DATA_NODE_DEFAULT_DATA[primaryOut.nodeType] },
            });
            edges.push({
                id: idFn(),
                source: genId,
                sourceHandle: sourceHandleId(primaryOut.field),
                target: outId,
                targetHandle: targetHandleId(primaryOut.nodeType),
            });
            outputs.set(step.id, {
                nodeId: outId,
                nodeType: primaryOut.nodeType,
            });
        }
    }

    for (const step of plan.steps) {
        if (step.kind === "text") {
            outputs.set(step.id, emitTextSource(step.text));
        } else {
            compileGenStep(step);
        }
    }

    layoutByLevels(nodes, edges, issues);
    return { nodes, edges, issues };
}

/**
 * Position nodes on a level grid derived from the execution plan.
 *
 * `parseWorkflow` never throws on a cycle — it logs a warning and marks
 * unreachable nodes as "skipped" while still returning the levels it could
 * compute (see WorkflowParser.generateExecutionPlan in
 * src/lib/workflow/parser.ts). So we detect a cycle by noticing that some
 * node never received a level, not via try/catch. In practice this
 * compiler's own construction (refs only resolve against already-emitted
 * step outputs) can't produce a cycle, but we still report one defensively
 * rather than leaving a node's position unset.
 */
function layoutByLevels(
    nodes: Node[],
    edges: Edge[],
    issues: CompileIssue[],
): void {
    const X_GAP = 520;
    const Y_GAP = 430;
    const plan = parseWorkflow({ nodes, edges });
    const positioned = new Set<string>();
    plan.levels.forEach((ids, level) => {
        ids.forEach((id, row) => {
            const node = nodes.find((n) => n.id === id);
            if (node) {
                node.position = { x: level * X_GAP, y: row * Y_GAP };
                positioned.add(id);
            }
        });
    });

    const stray = nodes.filter((n) => !positioned.has(n.id));
    if (stray.length > 0) {
        issues.push({
            code: "CYCLE",
            message: "generated graph is not a DAG",
        });
        stray.forEach((node, row) => {
            node.position = { x: plan.levels.length * X_GAP, y: row * Y_GAP };
        });
    }
}
