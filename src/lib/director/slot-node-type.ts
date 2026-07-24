/**
 * Inverse of NODE_TYPE_TO_ABI_FEATURE: pick one canonical RF node type per
 * ABI slot. First declaration wins; slots served by several node types get
 * an explicit preference (plain variant over the *Compose variant).
 */
import type { NodeSlot } from "@/generated/abi";
import { NODE_TYPE_TO_ABI_FEATURE } from "@/lib/abi/node-feature-registry";

const PREFERRED_NODE_TYPE: Partial<Record<NodeSlot, string>> = {
    "image-gen-video": "imageGenVideoNode",
    "text-gen-speech-clone": "textGenSpeechCloneNode",
    transcribe: "audioGenTextSpeechRecognizeNode",
};

function build(): Partial<Record<NodeSlot, string>> {
    const map: Partial<Record<NodeSlot, string>> = {};
    for (const [nodeType, slot] of Object.entries(NODE_TYPE_TO_ABI_FEATURE)) {
        if (map[slot] === undefined) {
            map[slot] = nodeType;
        }
    }
    return { ...map, ...PREFERRED_NODE_TYPE };
}

export const SLOT_TO_NODE_TYPE: Partial<Record<NodeSlot, string>> = build();
