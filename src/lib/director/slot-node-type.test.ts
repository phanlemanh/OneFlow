import { describe, expect, it } from "vitest";
import { NODE_TYPE_TO_ABI_FEATURE } from "@/lib/abi/node-feature-registry";
import { SLOT_TO_NODE_TYPE } from "./slot-node-type";

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
            expect(NODE_TYPE_TO_ABI_FEATURE[nodeType as string]).toBe(slot);
        }
    });
});
