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
 *     node-feature-registry.ts is the single declaration site for every ABI
 *     node's overrides — components read from it rather than declaring their
 *     own, and `abi/node-feature-registry.test.ts` fails the build if one
 *     reintroduces an inline `sourceSpec`. So rather than re-guessing per
 *     field, we run every field's classification through the same
 *     `resolveSpec` the app itself uses (src/lib/abi/resolve.ts), fed by that
 *     registry. There is no compiler-local mirror table to drift.
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
import type { AnySourceSpec, FieldSourceOverride } from "@/lib/abi/sources";
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

/** Per-node-type source overrides, straight from the shared registry. */
function sourceSpecOverridesFor(
    nodeType: string,
): Record<string, FieldSourceOverride> | undefined {
    return (NODE_TYPE_SOURCE_SPEC as Partial<Record<string, AnySourceSpec>>)[
        nodeType
    ];
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
 * (`NODE_TYPE_SOURCE_SPEC`) instead of a hand-guessed table.
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
    // `fields` is a plain object and `field` is LLM-controlled input, so an
    // unguarded index (`fields[field]`) returns an inherited Object.prototype
    // member for a name like "toString" (truthy, `.kind` undefined) instead
    // of `undefined` — Object.hasOwn closes that the same way the slot
    // lookup above already does (see hardening 1's Object.prototype test).
    const { fields } = resolvedSpecFor(slot, nodeType);
    if (!Object.hasOwn(fields, field)) return undefined;
    const resolved = fields[field];
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

/**
 * Does a `params` entry's JS value match a config field's declared JSON
 * Schema scalar `type`? `ParamEntrySchema` (dsl.ts) only ever hands this a
 * `string | number | boolean`, so "integer" is treated as "number" (JSON
 * Schema's integer/number split doesn't exist as a separate JS type).
 */
function paramValueMatchesSchemaType(
    schemaType: string,
    value: string | number | boolean,
): boolean {
    const jsType = typeof value;
    if (schemaType === "integer") return jsType === "number";
    return schemaType === jsType;
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
        if (!Object.hasOwn(SLOT_TO_NODE_TYPE, step.slot)) {
            issues.push({
                code: "UNKNOWN_SLOT",
                stepId: step.id,
                slot: step.slot,
                message: `unknown slot "${step.slot}"`,
            });
            return;
        }
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
            // A `manual` handle field (widget <-> input duality, Step 0 note
            // (c)) is exactly a form value when nothing is wired to it — so a
            // literal for it in `params` is as legitimate as a genuine config
            // field, not an unknown input.
            const isManualHandle = fc?.kind === "handle" && fc.manual;
            if (!fc || (fc.kind !== "config" && !isManualHandle)) {
                issues.push({
                    code: "UNKNOWN_INPUT_FIELD",
                    stepId: step.id,
                    slot: step.slot,
                    message: `"${field}" is not a config field of ${step.slot}`,
                });
                continue;
            }
            if (typeof value === "string" && isRef(value)) {
                issues.push({
                    code: "REF_ON_CONFIG_FIELD",
                    stepId: step.id,
                    slot: step.slot,
                    message: `config field "${field}" only accepts a single literal value`,
                });
                continue;
            }
            // Plan-semantics type check (mirrors field-name/modality/arity
            // validation already done from this same schema, not runtime ABI
            // validation, see Fix 2): a genuine config field's raw JSON
            // Schema `type` is the field's declared scalar shape. No
            // existing `CompileIssueCode` names "wrong scalar type"
            // directly, so this reuses `MODALITY_MISMATCH` — that code
            // already means "the value's declared kind doesn't match what
            // this field expects" for handle fields (image vs video vs
            // text); a config field's JS type mismatch (string vs number vs
            // boolean, or an array-typed field the DSL can't carry at all,
            // see vocabulary.ts's RENDERABLE_PARAM_TYPES) is the same idea
            // one level down, and ARITY_MISMATCH's two existing uses are
            // both strictly about value *count*, not value *kind*, so
            // reusing it here would blur what "arity" means.
            const rawField = topo.inputs[field];
            if (
                rawField?.kind === "config" &&
                typeof rawField.schema.type === "string" &&
                !paramValueMatchesSchemaType(rawField.schema.type, value)
            ) {
                issues.push({
                    code: "MODALITY_MISMATCH",
                    stepId: step.id,
                    slot: step.slot,
                    message: `config field "${field}" declares type ${rawField.schema.type}; got a value of type ${typeof value}`,
                });
                continue;
            }
            data[field] = value;
        }

        // Known literal text fed to each text-typed handle field, keyed by
        // ABI field name — kept per field (not flattened into one array) so
        // a slot with more than one promoted text handle (e.g. `gen-music`'s
        // `tags` and `lyrics`) doesn't lose which literal belongs to which
        // field. See the write-out below for how each field's cache lands
        // on `data`.
        const knownTextsByField = new Map<string, string[]>();
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
                // is routed into data; refs on config fields are errors. The
                // two are distinct problems and get distinct codes: a
                // multi-value array is an arity problem even if every
                // element is a literal, while a ref is only ever a modality
                // problem once arity is already satisfied.
                if (values.length !== 1) {
                    issues.push({
                        code: "ARITY_MISMATCH",
                        stepId: step.id,
                        slot: step.slot,
                        message: `config field "${field}" accepts a single value`,
                    });
                    continue;
                }
                if (isRef(values[0])) {
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
                    const list = knownTextsByField.get(field) ?? [];
                    list.push(src.literal);
                    knownTextsByField.set(field, list);
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

        // Cache each field's known literal(s) onto the node's own data so the
        // canvas can render it before the step actually executes. The ABI's
        // canonical single text field is always literally named `text` (or,
        // for a genuinely array-typed field, `texts`) across every node type
        // this compiler resolves — that's the field example.json's
        // `textGenImageNode` caches under the generic `texts` array. Any
        // *other* text-typed handle field on the same node (e.g.
        // `gen-music`'s `tags`/`lyrics`) is a distinct ABI input with its own
        // identity, so it's cached under its own field name instead of
        // being merged into that same generic array, where it would become
        // indistinguishable from a sibling field's literal.
        for (const [field, texts] of knownTextsByField) {
            if (field === "text" || field === "texts") {
                data.texts = texts;
                continue;
            }
            const fc = classifyField(slot, nodeType, field);
            data[field] = fc?.array ? texts : texts[0];
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
