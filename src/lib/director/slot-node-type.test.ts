import { describe, expect, it } from "vitest";
import {
    featureForNodeType,
    NODE_TYPE_TO_ABI_FEATURE,
} from "@/lib/abi/node-feature-registry";
import { PREFERRED_NODE_TYPE, SLOT_TO_NODE_TYPE } from "./slot-node-type";

describe("SLOT_TO_NODE_TYPE", () => {
    it("maps the demo slots to the expected RF node types", () => {
        expect(SLOT_TO_NODE_TYPE["image-gen"]).toBe("textGenImageNode");
        expect(SLOT_TO_NODE_TYPE["image-fusion"]).toBe("imageFusionNode");
        expect(SLOT_TO_NODE_TYPE["image-gen-video"]).toBe("imageGenVideoNode");
        expect(SLOT_TO_NODE_TYPE["gen-text"]).toBe("genTextNode");
    });

    it("prefers the non-Compose variant for duplicated slots", () => {
        expect(SLOT_TO_NODE_TYPE["image-gen-video"]).not.toMatch(/Compose/);
        expect(SLOT_TO_NODE_TYPE["text-gen-speech-clone"]).not.toMatch(
            /Compose/,
        );
    });

    it("every entry round-trips through NODE_TYPE_TO_ABI_FEATURE", () => {
        for (const [slot, nodeType] of Object.entries(SLOT_TO_NODE_TYPE)) {
            // `featureForNodeType` is the dynamic-lookup accessor; the map
            // itself is `as const`, so it cannot be indexed by a plain string.
            expect(featureForNodeType(nodeType as string), nodeType).toBe(slot);
        }
    });

    it("every slot with multiple node types has an explicit preference", () => {
        // Build a map of slot -> node types to find duplicates.
        const slotToNodeTypes = new Map<string, Set<string>>();
        for (const [nodeType, slot] of Object.entries(
            NODE_TYPE_TO_ABI_FEATURE,
        )) {
            if (!slotToNodeTypes.has(slot)) {
                slotToNodeTypes.set(slot, new Set());
            }
            slotToNodeTypes.get(slot)!.add(nodeType);
        }

        // Collect slots with more than one node type.
        const duplicateSlots: string[] = [];
        for (const [slot, nodeTypes] of slotToNodeTypes.entries()) {
            if (nodeTypes.size > 1) {
                duplicateSlots.push(slot);
            }
        }

        // Every duplicate slot must have an explicit entry in PREFERRED_NODE_TYPE.
        for (const slot of duplicateSlots) {
            expect(PREFERRED_NODE_TYPE).toHaveProperty(
                slot,
                expect.any(String),
            );
        }
    });
});
