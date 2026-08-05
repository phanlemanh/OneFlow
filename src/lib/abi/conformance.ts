import { createHash } from "node:crypto";
import type { NodeSlot } from "@/generated/abi";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import { buildPrompts, resolveSpec } from "@/lib/abi/resolve";
import type { FieldSourceOverride } from "@/lib/abi/sources";

/**
 * Canvas-side adapter for the TS↔Python conformance suite.
 *
 * The canvas decides how many plugin calls a node becomes (`buildPrompts`); the
 * engine decides the same thing in `runner.py`. Those two answers used to
 * differ for every slot mounted with `batchOn()`, and a content-addressed cache
 * that reuses one side's artifact to serve the other's call would return a
 * wrong answer with nothing raised. This module produces the canvas's answer in
 * the shared shape so the fixtures can hold both sides to one expectation.
 *
 * `normalizeCall` mirrors `sdk/tongflow/engine/callog.py`. The two are written
 * twice on purpose — the whole exercise is proving that two implementations
 * agree, so sharing one would defeat it. Keep them readable side by side.
 */

/**
 * Per-run rather than semantic. `_tongflow` carries a progress URL and token,
 * `taskId` changes every execution, and routing keys describe where a result is
 * projected rather than what the plugin computes.
 */
const DROPPED_KEYS = new Set([
    "_tongflow",
    "taskId",
    "outputs",
    "level",
    "dependencies",
]);

const ASSET_DIGEST_KEY = "__asset";

function digestValue(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(digestValue);
    if (v && typeof v === "object") {
        const rec = v as Record<string, unknown>;
        const b64 = rec.bytesBase64;
        if (typeof b64 === "string") {
            // The two sides reach an asset's bytes by different routes, so
            // `file_key` always differs while the content does not.
            const raw = Buffer.from(b64, "base64");
            return {
                [ASSET_DIGEST_KEY]: createHash("sha256")
                    .update(raw)
                    .digest("hex"),
            };
        }
        const out: Record<string, unknown> = {};
        for (const k of Object.keys(rec).sort()) out[k] = digestValue(rec[k]);
        return out;
    }
    return v;
}

export interface NormalizedCall {
    slot: string;
    input: Record<string, unknown>;
}

export function normalizeCall(
    slot: string,
    input: Record<string, unknown>,
): NormalizedCall {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(input).sort()) {
        if (DROPPED_KEYS.has(k)) continue;
        const v = input[k];
        // Omitted rather than written as null: one side writing null while the
        // other omits the key reads as a difference when nothing differs.
        if (v === undefined || v === null || v === "") continue;
        out[k] = digestValue(v);
    }
    return { slot, input: out };
}

/* ------------------------------------------------------------------ */
/* Fixture shape                                                       */
/* ------------------------------------------------------------------ */

interface FixtureBinding {
    kind: "handle" | "config" | "static" | "input";
    value?: unknown;
    sources?: { fromNodeId: string; fromField: string }[];
}

interface FixtureDataNode {
    id: string;
    staticData?: { texts?: string[]; fileKeys?: string[] };
}

interface FixtureExecutableNode {
    id: string;
    /** RF node type — the key into NODE_TYPE_SOURCE_SPEC. */
    type: string;
    feature: string;
    bindings: Record<string, FixtureBinding>;
}

export interface ConformanceFixture {
    slot: string;
    /**
     * Only for combinations no shipped node mounts — `batch-collect` pairs
     * `batchOn` with `collectAll`, which `resolveSpec` supports and no entry in
     * `NODE_TYPE_SOURCE_SPEC` uses. Every other fixture omits this and gets its
     * spec from the registry, so remounting a node moves the fixtures with it.
     */
    sourceSpec?: Record<string, FieldSourceOverride>;
    workflow: {
        dataNodes: FixtureDataNode[];
        executableNodes: FixtureExecutableNode[];
    };
    expectedCalls: NormalizedCall[];
}

/**
 * The spec a fixture's node resolves against.
 *
 * Prefer `NODE_TYPE_SOURCE_SPEC` — CLAUDE.md and the registry's own comment
 * both call it the single declaration site for field classification, and a
 * hand-copied duplicate defeats the suite in a specific way: remount
 * `genTextNode` from `textBatch()` to a scalar handle and the canvas changes
 * while all four fixtures stay green, certifying agreement about a mount that
 * no longer exists.
 *
 * A fixture may still declare its own spec, but only to reach a combination the
 * registry does not contain.
 */
function specForFixtureNode(
    fixture: ConformanceFixture,
    node: FixtureExecutableNode,
) {
    const mounted = (
        NODE_TYPE_SOURCE_SPEC as Record<
            string,
            Record<string, FieldSourceOverride> | undefined
        >
    )[node.type];
    if (mounted && fixture.sourceSpec) {
        throw new Error(
            `fixture node ${node.id}: "${node.type}" is mounted in NODE_TYPE_SOURCE_SPEC, ` +
                "so the fixture's own sourceSpec would shadow it — remove the fixture copy, " +
                "or use a node type the registry does not mount if the combination is synthetic",
        );
    }
    const override = mounted ?? fixture.sourceSpec;
    if (!override) {
        throw new Error(
            `fixture node ${node.id}: node type "${node.type}" is not in NODE_TYPE_SOURCE_SPEC ` +
                "and the fixture declares no sourceSpec of its own",
        );
    }
    return resolveSpec(node.feature as NodeSlot, override);
}

/**
 * Read a binding's upstream values out of the fixture's data nodes.
 *
 * On a live canvas this is `collectHandleValues` walking React Flow edges; a
 * fixture states the same wiring as `bindings` + `staticData`, so the walk is
 * a lookup. What matters is that the values reaching `buildPrompts` are the
 * ones the graph actually carries — `buildPrompts` itself is untouched, and it
 * is the thing under test.
 */
function upstreamValues(
    binding: FixtureBinding,
    dataNodes: Map<string, FixtureDataNode>,
): unknown[] {
    const out: unknown[] = [];
    for (const src of binding.sources ?? []) {
        const dn = dataNodes.get(src.fromNodeId);
        if (!dn?.staticData) continue;
        const arr =
            src.fromField === "texts"
                ? dn.staticData.texts
                : dn.staticData.fileKeys;
        if (arr) out.push(...arr);
    }
    return out;
}

/**
 * Mirror of the engine's `_strip_data_url` branch in
 * `sdk/tongflow/engine/assets.py` (itself a translation of
 * `prepare-asset-input.server.ts`): before a plugin is invoked, an asset
 * reference becomes `{bytesBase64, mime?}`. Fixtures inline asset bytes as
 * `data:` URLs precisely so this step needs no file store on either side —
 * and without it the TS log would carry a reference string where the Python
 * log carries a content digest, reading as drift where none exists.
 */
function materializeDataUrl(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(materializeDataUrl);
    if (typeof value !== "string" || !value.startsWith("data:")) return value;
    const comma = value.indexOf(",");
    if (comma < 0) return value;
    const mime = value.slice("data:".length, comma).split(";")[0].trim();
    const out: Record<string, unknown> = {
        bytesBase64: value.slice(comma + 1),
    };
    if (mime) out.mime = mime;
    return out;
}

/** The canvas's call-log for one fixture, in the shared normalized shape. */
export function callLogForFixture(
    fixture: ConformanceFixture,
): NormalizedCall[] {
    const dataNodes = new Map(
        fixture.workflow.dataNodes.map((d) => [d.id, d] as const),
    );
    const log: NormalizedCall[] = [];

    for (const node of fixture.workflow.executableNodes) {
        const spec = specForFixtureNode(fixture, node);
        const handleValues: Record<string, unknown> = {};
        const configValues: Record<string, unknown> = {};

        for (const [field, binding] of Object.entries(node.bindings)) {
            if (binding.kind === "handle") {
                const values = upstreamValues(binding, dataNodes);
                const resolved = spec.fields[field];
                const wantsArray =
                    resolved?.kind === "handle" &&
                    (resolved.batch || resolved.collect || resolved.array);
                // Only fileKeys-sourced handles carry asset references —
                // that is the set materialize_asset_inputs walks, keyed by
                // the ABI's `$ref: Asset` fields. A data: URL in a text
                // handle stays a string on the Python side, so it must here
                // too.
                const isAssetHandle =
                    resolved?.kind === "handle" &&
                    resolved.path.startsWith("fileKeys");
                const materialized = isAssetHandle
                    ? values.map(materializeDataUrl)
                    : values;
                // A batched or collected handle keeps the whole list; a scalar
                // handle takes the first value, exactly as the canvas reads it.
                handleValues[field] = wantsArray
                    ? materialized
                    : materialized[0];
            } else {
                configValues[field] = binding.value;
            }
        }

        for (const prompt of buildPrompts({
            spec,
            configValues,
            handleValues,
        })) {
            log.push(normalizeCall(node.feature, prompt));
        }
    }
    return log;
}
