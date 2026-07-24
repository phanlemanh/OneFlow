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
 *     `imagesGenVideoNode`, `speechGenVideoNode`) is read directly on mount —
 *     `const ids = data.ids ?? []; const fromNodes = useNodesData(ids);` in
 *     src/components/workspace/nodes/compose/image-fusion.tsx — it is NOT
 *     derived from incoming edges. It must be seeded at import time with the
 *     ordered ids of the upstream modality nodes that feed this step's handle
 *     inputs, or the node renders as if nothing were connected
 *     (`executeDisabled` stays true). We do that below (`IDS_KEYED_NODE_TYPES`).
 *
 * (c) A field the raw ABI schema classifies as `kind: "config"` can still be
 *     rendered as a connectable handle by an individual node component's own
 *     `sourceSpec` prop (handle-introspect.ts's own comment: "sourceSpec can
 *     override to handle"). The shared `NODE_TYPE_SOURCE_SPEC` registry in
 *     node-feature-registry.ts is a best-effort table for pre-mount edge
 *     creation only, and does not cover `textGenImageNode` at all. The real
 *     override lives inline in
 *     src/components/workspace/nodes/transfer/text-gen-image.tsx:
 *     `sourceSpec={{ text: batchOn({ nodeType: "textNode", path: "texts" }) }}`.
 *     public/example.json confirms this: `image-gen`'s "text" field is fed by
 *     an `in:text` edge from an upstream textNode, not a config literal. We
 *     mirror that one override locally (`TEXT_HANDLE_OVERRIDE_SLOTS`) — it is
 *     the only slot among this compiler's supported slots where raw topology
 *     disagrees with the shipped node's actual handle behavior.
 */
import type { Edge, Node } from "@xyflow/react";
import type { NodeSlot } from "@/generated/abi";
import {
    type DataNodeType,
    type FieldClass,
    getAbiTopology,
    sourceHandleId,
    targetHandleId,
} from "@/lib/abi/handle-introspect";
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
 * Slots whose "text" field the shipped node component promotes from the raw
 * ABI "config" classification to a connectable textNode handle via its own
 * `sourceSpec` prop. See Step 0 note (c) above.
 */
const TEXT_HANDLE_OVERRIDE_SLOTS = new Set<string>(["image-gen"]);

/**
 * ReactFlow node types whose component reads `data.ids` directly (rather
 * than deriving upstream values from edges) to look up their source nodes.
 * See Step 0 note (b) above.
 */
const IDS_KEYED_NODE_TYPES = new Set<string>([
    "imageFusionNode",
    "imagesGenVideoNode",
    "speechGenVideoNode",
]);

/** Resolve a step input/param field's effective classification, applying the
 * local sourceSpec overrides from Step 0 note (c). */
function classifyField(
    slot: string,
    field: string,
    raw: FieldClass | undefined,
): FieldClass | undefined {
    if (!raw) return undefined;
    if (
        field === "text" &&
        raw.kind === "config" &&
        TEXT_HANDLE_OVERRIDE_SLOTS.has(slot)
    ) {
        return {
            kind: "handle",
            nodeType: "textNode",
            path: "texts",
            array: true,
            required: raw.required,
        };
    }
    return raw;
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

        const topo = getAbiTopology(step.slot as NodeSlot);
        const genId = idFn();
        const data: Record<string, unknown> = {
            feature: step.slot,
            pluginId: pluginId ?? "",
        };

        for (const { field, value } of step.params) {
            const fc = classifyField(step.slot, field, topo.inputs[field]);
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
            const fc = classifyField(step.slot, field, topo.inputs[field]);
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

        // Required handle fields must be fed; config defaults come from the
        // node's own form after mount (spec §5).
        for (const field of topo.requiredInputs) {
            const fc = classifyField(step.slot, field, topo.inputs[field]);
            if (fc?.kind !== "handle") continue;
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
