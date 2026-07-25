import { describe, expect, it } from "vitest";
import { DIRECTOR_EXCLUDED_SLOTS } from "./safe-slots";
import { installedSafeSlots, renderVocabulary } from "./vocabulary";

describe("renderVocabulary", () => {
    it("renders one line per slot with inputs, params and output", () => {
        const v = renderVocabulary(["image-gen", "image-fusion"]);
        expect(v).toContain('slot "image-gen"');
        expect(v).toContain('slot "image-fusion"');
        // image-fusion consumes an image array handle
        expect(v).toMatch(/images:\s*image\[\]/);
    });

    it("is byte-stable regardless of input order", () => {
        expect(renderVocabulary(["image-gen", "image-fusion"])).toBe(
            renderVocabulary(["image-fusion", "image-gen"]),
        );
    });

    it("is byte-stable regardless of duplicate entries", () => {
        expect(
            renderVocabulary(["image-gen", "image-gen", "image-fusion"]),
        ).toBe(renderVocabulary(["image-fusion", "image-gen"]));
    });

    it("renders exactly one line for a single slot", () => {
        const v = renderVocabulary(["image-gen"]);
        expect(v.split("\n")).toHaveLength(1);
    });

    it("skips slots without a canonical node type", () => {
        // "image-describe" is a real NodeSlot with no entry in
        // SLOT_TO_NODE_TYPE (no ReactFlow node implements it yet).
        const v = renderVocabulary(["image-describe", "image-gen"]);
        expect(v.split("\n")).toHaveLength(1);
        expect(v).toContain('slot "image-gen"');
        expect(v).not.toContain("image-describe");
    });

    // Spot-check against compile.ts's own classification (see compile.ts's
    // classifyField and NODE_TYPE_SOURCE_SPEC) so the vocabulary never tells
    // the LLM something the compiler would then reject.

    it("classifies image-gen's text as a batch-capable handle (compile.ts's batchOn override), not a config param", () => {
        const v = renderVocabulary(["image-gen"]);
        expect(v).toContain("inputs(text: text[])");
        expect(v).not.toMatch(/params\([^)]*text:/);
    });

    it("classifies image-fusion's text as a manual, required handle and images as an array handle, matching compile.ts", () => {
        const v = renderVocabulary(["image-fusion"]);
        expect(v).toContain("text: text (required, manual)");
        expect(v).toContain("images: image[]");
    });

    it("classifies image-gen-video's image as a required array handle and duration/text as required params, matching compile.ts", () => {
        const v = renderVocabulary(["image-gen-video"]);
        expect(v).toContain("image: image[] (required)");
        expect(v).toContain("duration: number (required)");
        expect(v).toContain("text: string (required)");
    });
});

describe("installedSafeSlots", () => {
    it("keeps a director-safe slot that has an installed plugin", () => {
        const slots = installedSafeSlots({ "image-gen": ["demo-plugin"] });
        expect(slots).toContain("image-gen");
    });

    it("drops a slot with no installed plugin even if director-safe", () => {
        const slots = installedSafeSlots({});
        expect(slots).not.toContain("image-gen");
    });

    it("drops a slot the compiler cannot classify correctly, even when a plugin serves it, and keeps it out of the rendered vocabulary", () => {
        // DIRECTOR_EXCLUDED_SLOTS happens to be empty right now (every slot
        // the compiler used to mis-classify has since been fixed at the
        // source — see safe-slots.ts's own comment) — so there is currently
        // no real slot to exercise this path with. Mutate the exported Set
        // (ReadonlySet is a compile-time view; the underlying object is a
        // real, mutable Set) to simulate the next slot that needs excluding,
        // and restore it afterwards so no other test observes the change.
        const mutableExcluded = DIRECTOR_EXCLUDED_SLOTS as Set<string>;
        mutableExcluded.add("gen-music");
        try {
            const slots = installedSafeSlots({
                "gen-music": ["demo-plugin"],
                "image-gen": ["demo-plugin"],
            });
            expect(slots).not.toContain("gen-music");
            expect(slots).toContain("image-gen");

            const vocab = renderVocabulary(slots);
            expect(vocab).not.toMatch(/slot "gen-music"/);
            expect(vocab).toMatch(/slot "image-gen"/);
        } finally {
            mutableExcluded.delete("gen-music");
        }
    });

    it("returns a sorted list", () => {
        const slots = installedSafeSlots({
            "image-gen": ["p"],
            "gen-text": ["p"],
        });
        expect(slots).toEqual([...slots].sort());
    });
});
