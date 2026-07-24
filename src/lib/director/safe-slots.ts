/**
 * Director-safe slot allowlist.
 *
 * `compile.ts` classifies each ABI input field (handle vs config, upstream
 * nodeType, array, manual) from `getAbiTopology` plus
 * `NODE_TYPE_SOURCE_SPEC` / `LOCAL_SOURCE_SPEC_OVERRIDES`. Several node
 * components declare their real classification in an inline `sourceSpec`
 * JSX prop that neither table carries — invisible to a server-side
 * compiler. For those slots the compiler would silently misclassify a
 * field (e.g. an asset field resolving to `imageNode` when the component
 * actually wires video/audio/file), producing a bogus `MODALITY_MISMATCH`
 * or `ARITY_MISMATCH` for an otherwise-legal plan.
 *
 * Rather than hand-mirror those components (a copy that drifts) or
 * refactor them onto the shared registry (its own PR), the Director simply
 * excludes their slots until they're modelled or migrated. This set is
 * derived, not authored: `safe-slots.test.ts` scans every node component
 * for an inline `sourceSpec` and fails if its slot isn't either modelled
 * (tracked in one of the two override tables) or listed here.
 */
import { SLOT_TO_NODE_TYPE } from "./slot-node-type";

export const DIRECTOR_EXCLUDED_SLOTS: ReadonlySet<string> = new Set([
    "arrange-group",
    "drop-video",
    "concat-videos",
    "merge-video-audio",
    "speech-text-gen-video",
    "combine-text",
    "split-video",
    "audio-describe",
    "transcribe",
    "convert_voice",
    "denoise_audio",
    "extract-audio",
    "parse-document",
    "get-first-frame",
    "get-last-frame",
    "image-body-seg",
    "image-upscale",
    "image-gen-model",
    "image-gen-text",
    "image-matting",
    "image-normal",
    "image-pose",
    "subtitle_remove",
    "remove-video-audio",
    "remove_watermark",
    "separate_audio_track",
    "separate_speaker",
    "video-gen-model",
    "video-gen-text",
    "video-upscale",
]);

export function isDirectorSafeSlot(slot: string): boolean {
    if (!Object.hasOwn(SLOT_TO_NODE_TYPE, slot)) return false;
    return !DIRECTOR_EXCLUDED_SLOTS.has(slot);
}
