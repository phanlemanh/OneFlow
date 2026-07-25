/**
 * Director-safe slot allowlist.
 *
 * `compile.ts` classifies each ABI input field (handle vs config, upstream
 * nodeType, array, manual) from `getAbiTopology` plus `NODE_TYPE_SOURCE_SPEC`.
 * A slot is unsafe when its node component declares the real classification
 * somewhere the compiler cannot read, because then the compiler silently
 * misclassifies a field (e.g. an asset field resolving to `imageNode` when the
 * component actually wires video/audio/file) and rejects an otherwise-legal
 * plan with a bogus `MODALITY_MISMATCH` or `ARITY_MISMATCH`.
 *
 * That failure mode is now structurally gone: every ABI node reads its
 * overrides from `NODE_TYPE_SOURCE_SPEC`, and
 * `abi/node-feature-registry.test.ts` fails the build if a component
 * reintroduces an inline `sourceSpec`. So the exclusion set is **empty** — the
 * 30 slots it used to carry (`subtitle_remove`, `remove_watermark`,
 * `denoise_audio`, `convert_voice`, `parse-document`, `arrange-group`, and the
 * ~24 `batchOn` fields that lost their array-ness) are all correctly
 * classified from the registry.
 *
 * Keep the set — it is the escape hatch for the next slot the compiler cannot
 * model, and it stays derived rather than authored: `safe-slots.test.ts` scans
 * every node component and fails both when a slot needs excluding and isn't,
 * and when an entry here is no longer needed.
 */
import { SLOT_TO_NODE_TYPE } from "./slot-node-type";

export const DIRECTOR_EXCLUDED_SLOTS: ReadonlySet<string> = new Set([]);

export function isDirectorSafeSlot(slot: string): boolean {
    if (!Object.hasOwn(SLOT_TO_NODE_TYPE, slot)) return false;
    return !DIRECTOR_EXCLUDED_SLOTS.has(slot);
}
