/**
 * Static map from React Flow node type to ABI feature slot.
 *
 * Used at graph-mutation time (`expands` / `compose` in `use-flow.ts`) to
 * compute the correct `targetHandle` / `sourceHandle` for a newly-created edge
 * *before* the spawned node mounts and self-registers via `useAbiExecution`.
 *
 * Keep this in sync with the `feature="..."` strings hard-coded in each ABI
 * node component under `src/components/workspace/nodes/{transfer,compose,batch,decompose}/`.
 * Modality / add / data nodes are intentionally omitted — they're not ABI-driven.
 *
 * This module is the *only* declaration site for per-field source overrides
 * (`NODE_TYPE_SOURCE_SPEC` below) — components read from it rather than
 * declaring their own, so server-side and pre-mount consumers see the same
 * classification the canvas does.
 */

import { isModalityNode } from "@/constants/modality-nodes";
import type { NodeSlot } from "@/generated/abi";

import {
    type DataNodeType,
    getAbiTopology,
    sourceHandleId,
    targetHandleId,
} from "./handle-introspect";
import { type ResolvedSpec, resolveSpec } from "./resolve";
import {
    type AnySourceSpec,
    batchOn,
    collectAll,
    configField,
    type FieldSourceOverride,
    handle,
    type SourceSpec,
} from "./sources";

export const NODE_TYPE_TO_ABI_FEATURE = {
    // transfer/
    genTextNode: "gen-text",
    imageGenVideoNode: "image-gen-video",
    textGenVideoNode: "text-gen-video",
    imageGenModelNode: "image-gen-model",
    imagePoseNode: "image-pose",
    imageBodySegNode: "image-body-seg",
    imageNormalNode: "image-normal",
    imageMattingNode: "image-matting",
    videoGenModelNode: "video-gen-model",
    speechGenVideoNode: "speech-text-gen-video",
    imageGenImageNode: "image-edit",
    imageGenImageUpscaleNode: "image-upscale",
    textGenImageNode: "image-gen",
    textGenMusicNode: "gen-music",
    textGenSpeechCloneNode: "text-gen-speech-clone",
    textGenSpeechCloneComposeNode: "text-gen-speech-clone",
    imageGenVideoComposeNode: "image-gen-video",
    textGenSpeechPresetNode: "text-gen-speech-preset",
    textGenSpeechInstructNode: "text-gen-speech-instruct",
    removeVideoSubtitleNode: "subtitle_remove",
    videoUpscaleNode: "video-upscale",
    videoEditNode: "video-edit",
    removeWatermarkNode: "remove_watermark",
    extractAudioNode: "extract-audio",
    removeVideoAudioNode: "remove-video-audio",
    denoiseAudioSubtitleNode: "denoise_audio",
    separateAudioTrackNode: "separate_audio_track",
    separateSpeakerNode: "separate_speaker",
    convertVoiceNode: "convert_voice",
    audioDescribeNode: "audio-describe",
    imageGenTextNode: "image-gen-text",
    videoGenTextNode: "video-gen-text",
    videoGenTextSpeechRecognizeNode: "transcribe",
    audioGenTextSpeechRecognizeNode: "transcribe",
    fileGenTextNode: "parse-document",
    linkGenTextNode: "link",
    getFirstFrameNode: "get-first-frame",
    getLastFrameNode: "get-last-frame",
    musicRepaintNode: "music-repaint",
    musicExtractNode: "music-extract",
    musicLegoNode: "music-lego",
    musicCompleteNode: "music-complete",
    composeOverlayNode: "compose-overlay",

    // batch/
    dropVideoNode: "drop-video",
    arrangeNode: "arrange-group",
    concatVideoNode: "concat-videos",

    // compose/
    mergeVideoAudioNode: "merge-video-audio",
    audioVideoLipSyncNode: "audio-video-lip-sync",
    imageFusionNode: "image-fusion",
    imagesGenVideoNode: "images-gen-video",
    speechImageGenVideoNode: "audio-image-gen-video",
    speechTextGenVideoNode: "speech-text-gen-video",
    speechVideoGenVideoNode: "speech-video-gen-video",
    videoImageGenVideoMixNode: "video-image-gen-video-mix",
    videoImageGenVideoMoveNode: "video-image-gen-video-move",
    imageImageGenVideoNode: "image-image-gen-video",
    textAudioGenSpeechNode: "text-audio-gen-speech",
    textsGenTextNode: "combine-text",
    concatVideoComposeNode: "concat-videos",
    musicCoverNode: "music-cover",

    // decompose/
    splitVideoNode: "split-video",
    splitTextNode: "split-text",
    musicBriefNode: "music-brief",
    separateSoundNode: "separate-sound",
} as const satisfies Readonly<Record<string, NodeSlot>>;

/** React Flow node types backed by an ABI feature slot. */
export type AbiNodeType = keyof typeof NODE_TYPE_TO_ABI_FEATURE;

/** The ABI slot a given ABI node type executes. */
export type FeatureForNodeType<N extends AbiNodeType> =
    (typeof NODE_TYPE_TO_ABI_FEATURE)[N];

export function featureForNodeType(
    nodeType: string | undefined,
): NodeSlot | undefined {
    if (!nodeType) return undefined;
    return (NODE_TYPE_TO_ABI_FEATURE as Readonly<Record<string, NodeSlot>>)[
        nodeType
    ];
}

/** A scalar `text` field fed from an upstream textNode. */
const textScalar = () => handle({ nodeType: "textNode", path: "texts[0]" });

/**
 * A scalar `text` field with widget ⇄ input duality: an upstream edge wins,
 * the node's own textarea is the fallback.
 */
const textScalarManual = () =>
    handle({ nodeType: "textNode", path: "texts[0]", manual: true });

/** Fan out one call per string in the upstream textNode's `texts`. */
const textBatch = () => batchOn({ nodeType: "textNode", path: "texts" });

/** `concat-videos` is mounted as both a batch and a compose node type. */
const CONCAT_VIDEOS = { videos: collectAll() };

/**
 * Per-node `sourceSpec` overrides — the single declaration site for every ABI
 * node's field classification. Both the component (via `AbiNodeShell`) and
 * graph-mutation-time edge creation (`resolveEdgeHandles`) read from here, so
 * a new edge lands on the right `targetHandle` before the target mounts.
 *
 * **Node components must not declare their own inline `sourceSpec`** — a JSX
 * object literal is invisible to any server-side or pre-mount consumer, which
 * is what made edges resolve to the wrong modality. `node-feature-registry.test.ts`
 * fails the build if one reappears.
 *
 * The `satisfies` clause checks each entry's field names against its own ABI
 * slot, so reads need no cast and typos surface here at compile time.
 */
export const NODE_TYPE_SOURCE_SPEC = {
    /* ---------------- transfer/ ---------------- */
    genTextNode: { text: textBatch() },
    textGenVideoNode: { text: textBatch() },
    textGenImageNode: { text: textBatch() },
    textGenSpeechInstructNode: { text: textBatch() },
    textGenSpeechPresetNode: { text: textBatch() },
    // `ref_audio` is an Asset $ref in the ABI (default = upstream handle). This
    // transfer node owns reference audio via local upload/record → config override.
    // Wired text+audio uses `textGenSpeechCloneComposeNode` (default handles).
    textGenSpeechCloneNode: {
        text: textBatch(),
        ref_audio: configField(),
    },
    // Both `tags` and `lyrics` are scalar strings that may be fed from upstream
    // textNodes via the auto-rendered `in:tags` / `in:lyrics` handles.
    // AbiHandles renders one handle per ABI input, so the user connects each
    // upstream textNode to the handle they want to fill.
    textGenMusicNode: {
        tags: textScalar(),
        lyrics: textScalar(),
    },
    imageGenVideoNode: {
        image: batchOn(),
        text: configField(),
    },
    imageGenImageNode: {
        image: handle({ nodeType: "imageNode" }),
        text: textScalarManual(),
    },
    imageGenImageUpscaleNode: { image: batchOn() },
    imageGenModelNode: { image: batchOn() },
    imageGenTextNode: { image: batchOn() },
    imageBodySegNode: { image: batchOn() },
    imageMattingNode: { image: batchOn() },
    imageNormalNode: { image: batchOn() },
    imagePoseNode: { image: batchOn() },
    videoEditNode: {
        video: handle({ nodeType: "videoNode" }),
        text: textScalarManual(),
    },
    videoGenModelNode: { video: batchOn() },
    videoGenTextNode: { video: batchOn() },
    videoUpscaleNode: { video: batchOn() },
    extractAudioNode: { video: batchOn() },
    removeVideoAudioNode: { video: batchOn() },
    getFirstFrameNode: { video: batchOn() },
    getLastFrameNode: { video: batchOn() },
    // `fileKey` is a plain string keyed to a videoNode upload, not an Asset $ref.
    removeVideoSubtitleNode: { fileKey: batchOn({ nodeType: "videoNode" }) },
    removeWatermarkNode: { fileKey: batchOn({ nodeType: "videoNode" }) },
    denoiseAudioSubtitleNode: { fileKey: batchOn({ nodeType: "audioNode" }) },
    convertVoiceNode: { sourceKey: batchOn({ nodeType: "audioNode" }) },
    audioDescribeNode: { audio: batchOn() },
    separateAudioTrackNode: { audio: batchOn() },
    separateSpeakerNode: { audio: batchOn() },
    audioGenTextSpeechRecognizeNode: { audio: batchOn() },
    // Same `transcribe` slot as the audio variant, but this one feeds the ABI
    // `audio` field from a videoNode upstream.
    videoGenTextSpeechRecognizeNode: {
        audio: batchOn({ nodeType: "videoNode" }),
    },
    // `document` is a plain string keyed to a fileNode upload.
    fileGenTextNode: { document: batchOn({ nodeType: "fileNode" }) },
    // `url` is a plain string (not a $ref), so force it to a linkNode-sourced
    // handle instead of the default config/text classification. batchOn fans
    // out one extraction per URL stored in the linkNode's `texts`.
    linkGenTextNode: { url: batchOn({ nodeType: "linkNode", path: "texts" }) },
    // Transfer variant of `speech-text-gen-video`: only the audio is wired,
    // the scene text stays a config field.
    speechGenVideoNode: { audio: handle({ nodeType: "audioNode" }) },
    // `media` / `logo` are Asset $refs → upstream handles. The generic Asset
    // default resolves to `imageNode` (field name carries no modality token),
    // which would reject every video source — so `media` declares videoNode via
    // `alsoAccepts`: this slot stamps overlays onto an image OR a video. `text`
    // is a scalar string promoted to a textNode-fed handle — it feeds the
    // `{text}` placeholder substituted plugin-side. `ops` is the overlay
    // instruction list edited in the node's own ops-editor form.
    composeOverlayNode: {
        media: handle({ nodeType: "imageNode", alsoAccepts: ["videoNode"] }),
        text: textScalar(),
        logo: handle({ nodeType: "imageNode" }),
        ops: configField(),
    },

    /* ---------------- batch/ ---------------- */
    dropVideoNode: { videos: collectAll() },
    concatVideoNode: CONCAT_VIDEOS,
    // `fileKeys` collects every connected videoNode into one arrangement.
    arrangeNode: { fileKeys: collectAll({ nodeType: "videoNode" }) },

    /* ---------------- compose/ ---------------- */
    concatVideoComposeNode: CONCAT_VIDEOS,
    mergeVideoAudioNode: { video: batchOn() },
    audioVideoLipSyncNode: {
        video: handle({ nodeType: "videoNode" }),
        audio: handle({ nodeType: "audioNode" }),
        text: configField(),
    },
    imageFusionNode: {
        images: collectAll(),
        text: textScalarManual(),
    },
    imagesGenVideoNode: {
        images: collectAll(),
        text: textScalarManual(),
        duration: configField(),
    },
    imageGenVideoComposeNode: {
        image: batchOn(),
        text: textScalar(),
    },
    speechTextGenVideoNode: {
        text: textScalar(),
        audio: handle({ nodeType: "audioNode" }),
    },
    speechImageGenVideoNode: {
        image: handle({ nodeType: "imageNode" }),
        audio: handle({ nodeType: "audioNode" }),
    },
    speechVideoGenVideoNode: {
        video: handle({ nodeType: "videoNode" }),
        text: textScalar(),
    },
    videoImageGenVideoMoveNode: {
        image: handle({ nodeType: "imageNode" }),
        video: handle({ nodeType: "videoNode" }),
        text: textScalarManual(),
    },
    textAudioGenSpeechNode: { text: textBatch() },
    textGenSpeechCloneComposeNode: { text: textBatch() },
    textsGenTextNode: { texts: collectAll() },

    /* ---------------- decompose/ ---------------- */
    splitVideoNode: { video: batchOn() },
    splitTextNode: { text: textScalar() },
    // `text` is a plain string; promote it to a textNode-sourced handle so an
    // upstream text node can feed the music brief idea.
    musicBriefNode: { text: textScalar() },
    // `text` describes the sound to isolate; it can be fed from an upstream
    // textNode or typed manually in the node (edge wins, textarea fallback).
    separateSoundNode: {
        audio: handle({ nodeType: "audioNode" }),
        text: textScalarManual(),
    },
} satisfies {
    [N in AbiNodeType]?: SourceSpec<FeatureForNodeType<N>>;
};

export function resolvedSpecForNodeType(
    nodeType: string | undefined,
): ResolvedSpec | undefined {
    const feature = featureForNodeType(nodeType);
    const overrides = nodeType
        ? (NODE_TYPE_SOURCE_SPEC as Partial<Record<string, AnySourceSpec>>)[
              nodeType
          ]
        : undefined;
    if (!feature || !overrides) return undefined;
    return resolveSpec(feature, overrides);
}

/**
 * Resolve the canonical Handle ids for a new edge that connects
 * `sourceType` → `targetType`. Mirrors what `AbiHandles` and the modality
 * components render, so `collectHandleValues` and the connection validator
 * can wire the edge correctly.
 *
 * Returns `undefined` fields when a side can't be classified; the edge is still
 * created, just with the missing handle id absent (matching prior behavior).
 *
 * **Important:** the bare ABI topology classifies plain `string` inputs as
 * `config`. Many nodes upgrade those to handles via `NODE_TYPE_SOURCE_SPEC`
 * (e.g. `gen-text` has `text: batchOn(...)`), so callers should pass
 * `targetSpec` — `resolvedSpecForNodeType(type)` resolves it from the registry
 * without needing the node to be mounted. Omitting it falls back to raw
 * topology, which misses those promotions; the post-mount heal in
 * `useAbiExecution` is the last line of defence.
 *
 * For ABI targets with multiple handles of the same upstream nodeType (e.g.
 * `image-fusion` taking a batch of images), the caller can pass `usedTargetHandles`
 * so we pick the next unused field, falling back to the first match.
 */
export function resolveEdgeHandles(args: {
    sourceType: string | undefined;
    targetType: string | undefined;
    usedTargetHandles?: Set<string>;
    /** Resolved spec for the target node — preferred over raw topology. */
    targetSpec?: ResolvedSpec;
}): { sourceHandle?: string; targetHandle?: string } {
    const { sourceType, targetType, usedTargetHandles, targetSpec } = args;

    let sourceHandle: string | undefined;
    if (sourceType && isModalityNode(sourceType)) {
        sourceHandle = sourceHandleId(sourceType);
    } else if (sourceType && targetType && isModalityNode(targetType)) {
        // ABI source → modality target: pick the first ABI output whose
        // declared nodeType matches the spawned modality (e.g. gen-text
        // `text: string` → `out:text` → textNode `in:textNode`).
        const feature = featureForNodeType(sourceType);
        if (feature) {
            const output = getAbiTopology(feature).outputs.find(
                (o) => o.nodeType === targetType,
            );
            if (output) sourceHandle = sourceHandleId(output.field);
        }
    }

    let targetHandle: string | undefined;
    if (targetType && isModalityNode(targetType)) {
        targetHandle = `in:${targetType}`;
    } else if (sourceType && isModalityNode(sourceType)) {
        const upstreamNodeType = sourceType as DataNodeType;

        // Walk fields in declared input order, matching by handle nodeType.
        // Skip handles already occupied by other edges; remember the first
        // match as a fallback when every candidate is taken.
        const fieldOrder =
            targetSpec?.topology.inputOrder ??
            (targetType
                ? (() => {
                      const feature = featureForNodeType(targetType);
                      return feature ? getAbiTopology(feature).inputOrder : [];
                  })()
                : []);
        // A handle may accept more than its primary nodeType (`alsoAccepts`),
        // e.g. compose-overlay `media` takes an image OR a video. Matching on
        // `nodeType` alone leaves such an edge without a targetHandle, which
        // reads as "connected" on the canvas but never delivers a value.
        const isHandleForUpstream = (field: string): boolean => {
            if (targetSpec) {
                const f = targetSpec.fields[field];
                if (f?.kind !== "handle") return false;
                return (
                    f.nodeType === upstreamNodeType ||
                    !!f.alsoAccepts?.includes(upstreamNodeType)
                );
            }
            if (!targetType) return false;
            const feature = featureForNodeType(targetType);
            if (!feature) return false;
            const f = getAbiTopology(feature).inputs[field];
            if (f?.kind !== "handle") return false;
            const override = (
                NODE_TYPE_SOURCE_SPEC as Record<
                    string,
                    Record<string, FieldSourceOverride | undefined> | undefined
                >
            )[targetType]?.[field];
            const declared =
                override?.kind === "handle"
                    ? (override.nodeType ?? f.nodeType)
                    : f.nodeType;
            const extra =
                override?.kind === "handle" ? (override.alsoAccepts ?? []) : [];
            return (
                declared === upstreamNodeType ||
                extra.includes(upstreamNodeType)
            );
        };

        let firstMatch: string | undefined;
        for (const field of fieldOrder) {
            if (!isHandleForUpstream(field)) continue;
            const handleId = targetHandleId(field);
            if (firstMatch === undefined) firstMatch = handleId;
            if (!usedTargetHandles || !usedTargetHandles.has(handleId)) {
                targetHandle = handleId;
                break;
            }
        }
        if (!targetHandle) targetHandle = firstMatch;
    }

    return { sourceHandle, targetHandle };
}
